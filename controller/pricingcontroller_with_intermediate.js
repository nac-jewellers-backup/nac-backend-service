const models = require("./../models");

Number.prototype.toFixedNumber = function (digits, base) {
  var pow = Math.pow(base || 10, digits);
  return Math.round(this * pow) / pow;
};

exports.createPriceRunHistory = async (priceHistory) => {
  return await models.price_running_history.create(priceHistory);
};

exports.updatePriceRunHistory = async (id, updateObj) => {
  return await models.price_running_history.update(updateObj, {
    where: { id },
  });
};

const applyMarkupOrDiscount = ({ price, type, value }) => {
  let baseValue = price;
  if (type == 2 && price) {
    baseValue += baseValue * (value / 100);
  } else if (price) {
    baseValue += value;
  }
  return baseValue ? baseValue.toFixed(2) : baseValue;
};

const getApplicableTax = ({ hsn_number }) => {
  return new Promise((resolve, reject) => {
    models.master_tax_settings
      .findOne({
        attributes: ["tax_value"],
        where: {
          hsn_number,
        },
      })
      .then((result) => {
        if (result) resolve(result.tax_value);
        else resolve(3);
      })
      .catch(reject);
  });
};

exports.priceUpdate = ({ product_id }) => {
  return new Promise((resolve, reject) => {
    models.product_lists
      .findOne({
        attributes: [
          "product_id",
          "product_category",
          "product_type",
          "hsn_number",
        ],
        where: { product_id },
        include: {
          model: models.trans_sku_lists,
          attributes: ["selling_price", "generated_sku", "attributes"],
          include: [
            {
              model: models.total_no_stone,
              attributes: ["type", "selling_price"],
            },
            {
              model: models.pricing_sku_materials,
              attributes: ["component", "selling_price"],
            },
            {
              model: models.pricing_sku_metals,
              attributes: ["material_name", "selling_price"],
            },
          ],
        },
      })
      .then(async (product) => {
        product = JSON.parse(JSON.stringify(product));
        let response = {};
        for (let index = 0; index < product.trans_sku_lists.length; index++) {
          const sku = product.trans_sku_lists[index];
          //loading all markup applicable for this sku
          let markup = await models.pricing_markup.findAll({
            attributes: ["material", "markup_type", "markup_value"],
            where: {
              selling_price_min: {
                [models.Sequelize.Op.lte]: sku.selling_price,
              },
              selling_price_max: {
                [models.Sequelize.Op.gte]: sku.selling_price,
              },
              category: product.product_category,
              product_type: {
                [models.Sequelize.Op.contains]: [product.product_type],
              },
              purities: {
                [models.Sequelize.Op.contains]: sku.attributes.filter((item) =>
                  item.includes("purity")
                ),
              },
            },
            order: [["createdAt", "desc"]],
            raw: true,
          });
          //loading all discounts applicable for this sku
          let discount = await models.sale_discount.findOne({
            attributes: [
              "components",
              "discount_type",
              "discount_value",
              "discount_name",
              "discount_title",
            ],
            where: {
              is_active: true,
              product_ids: {
                [models.Sequelize.Op.contains]: [sku.generated_sku],
              },
            },
            order: [["createdAt", "desc"]],
            raw: true,
          });
          if (markup.length) {
            // Checking if all exists in markup and applying accordingly!
            let arrayOfMarkupTypes = markup.map((i) => i.material);
            if (arrayOfMarkupTypes.includes("All")) {
              markup = markup.filter((i) => {
                return i.material == "All";
              });
              [
                "pricing_sku_materials",
                "total_no_stones",
                "pricing_sku_metals",
              ].map((priceElement) => {
                sku[priceElement] = sku[priceElement].map((item) => {
                  let markup_price = applyMarkupOrDiscount({
                    price: item.selling_price,
                    value: markup[0]?.markup_value,
                    type: markup[0]?.markup_type,
                  });
                  return {
                    ...item,
                    markup_price,
                    discount_price: markup_price,
                  };
                });
              });
            } else {
              markup = markup.filter((i) => {
                return i.material !== "All";
              });
              markup.map((i) => {
                [
                  "pricing_sku_materials",
                  "total_no_stones",
                  "pricing_sku_metals",
                ].map((priceElement) => {
                  sku[priceElement] = sku[priceElement].map((item) => {
                    let markup_price = item?.selling_price;
                    if (
                      item["material_name"]?.includes(
                        i.material.toLowerCase()
                      ) ||
                      item["component"]?.includes(i.material.toLowerCase()) ||
                      item["type"]?.includes(i.material.toLowerCase())
                    ) {
                      markup_price = applyMarkupOrDiscount({
                        price: item.selling_price,
                        value: i?.markup_value,
                        type: i?.markup_type,
                      });
                    } else if (
                      i.material.toLowerCase().includes("making charge") &&
                      ["wastage", "makingcharge"].includes(
                        item["material_name"]
                      )
                    ) {
                      markup_price = applyMarkupOrDiscount({
                        price: item.selling_price,
                        value: i?.markup_value,
                        type: i?.markup_type,
                      });
                    }
                    return {
                      ...item,
                      markup_price,
                      discount_price: markup_price,
                    };
                  });
                });
              });
            }
          } else {
            [
              "pricing_sku_materials",
              "total_no_stones",
              "pricing_sku_metals",
            ].map((priceElement) => {
              sku[priceElement] = sku[priceElement].map((item) => {
                let markup_price = item.selling_price;
                return {
                  ...item,
                  markup_price,
                  discount_price: markup_price,
                };
              });
            });
          }
          //Checking if all exists in discount and applying accordingly!
          if (discount) {
            let arrayOfDiscountTypes = discount.components.map((i) => i);
            if (arrayOfDiscountTypes.includes("All")) {
              [
                "pricing_sku_materials",
                "total_no_stones",
                "pricing_sku_metals",
              ].map((priceElement) => {
                sku[priceElement] = sku[priceElement].map((item) => {
                  let discount_price = applyMarkupOrDiscount({
                    price: item.markup_price,
                    value: discount?.discount_value,
                    type: discount?.discount_type,
                  });
                  return {
                    ...item,
                    discount_price,
                  };
                });
              });
            } else {
              [
                "pricing_sku_materials",
                "total_no_stones",
                "pricing_sku_metals",
              ].map((priceElement) => {
                let components = discount.components.map((i) =>
                  i.toLowerCase()
                );
                sku[priceElement] = sku[priceElement].map((item) => {
                  let discount_price = item?.markup_price;
                  if (
                    components.filter(
                      (i) =>
                        item["material_name"]?.toLowerCase().includes(i) ||
                        item["component"]?.toLowerCase().includes(i) ||
                        item["type"]?.toLowerCase().includes(i)
                    ).length
                  ) {
                    discount_price = applyMarkupOrDiscount({
                      price: item.markup_price,
                      value: discount?.discount_value,
                      type: discount?.discount_type,
                    });
                  } else if (
                    components.includes("making charge") &&
                    ["wastage", "makingcharge"].includes(item["material_name"])
                  ) {
                    discount_price = applyMarkupOrDiscount({
                      price: item.markup_price,
                      value: discount?.discount_value,
                      type: discount?.discount_type,
                    });
                  }
                  return {
                    ...item,
                    discount_price,
                  };
                });
              });
            }
          }
          var markup_price = 0;
          let discount_price = 0;
          [
            "pricing_sku_materials",
            "total_no_stones",
            "pricing_sku_metals",
          ].map((i) => {
            sku[i].map((item) => {
              markup_price += Number(item?.markup_price);
              discount_price += Number(item?.discount_price);
            });
          });

          //Applying Necessary Taxes!
          let tax_value = await getApplicableTax({ ...product });
          let markup_price_tax = (
            (markup_price * tax_value) /
            100
          ).toFixedNumber(2);
          markup_price += markup_price_tax;
          let discount_price_tax = (
            (discount_price * tax_value) /
            100
          ).toFixedNumber(2);
          discount_price += discount_price_tax;

          await models.temp_price_list.upsert({
            product_id,
            generated_sku: sku.generated_sku,
            pricing: {
              ...sku,
              margin_on_sale_percentage: (
                ((markup_price - sku.selling_price) * 100) /
                sku.selling_price
              ).toFixedNumber(0),
              markup_price: markup_price,
              markup_price_tax: markup_price_tax,
              discount_price: discount_price,
              discount_price_tax: discount_price_tax,
              discount_name: discount?.discount_name,
              discount_title: discount?.discount_title,
            },
          });
          response[sku.generated_sku] = {
            ...sku,
            margin_on_sale_percentage: (
              ((markup_price - sku.selling_price) * 100) /
              sku.selling_price
            ).toFixedNumber(0),
            markup_price: markup_price,
            markup_price_tax: markup_price_tax,
            discount_price: discount_price,
            discount_price_tax: discount_price_tax,
            discount_name: discount?.discount_name,
            discount_title: discount?.discount_title,
          };
        }
        resolve({ ...response });
      })
      .catch(reject);
  });
};

exports.finalPriceRun = () => {
  let defaultColumns = [
    { columnName: "selling_price", columnType: "numeric" },
    { columnName: "markup_price", columnType: "numeric" },
    { columnName: "discount_price", columnType: "numeric" },
  ];
  let jsonToRecordSetMapper = {
    total_no_stones: {
      modelName: "total_no_stones",
      columns: [{ columnName: "type", columnType: "text" }, ...defaultColumns],
    },
    pricing_sku_materials: {
      modelName: "pricing_sku_materials",
      columns: [
        { columnName: "component", columnType: "text" },
        ...defaultColumns,
      ],
    },
    pricing_sku_metals: {
      modelName: "pricing_sku_metals",
      columns: [
        { columnName: "material_name", columnType: "text" },
        ...defaultColumns,
      ],
    },
  };
  return new Promise((resolve, reject) => {
    try {
      Promise.all(
        Object.keys(jsonToRecordSetMapper).map(async (item) => {
          let { modelName, columns } = jsonToRecordSetMapper[item];
          return await models.sequelize.query(`update ${modelName} t set
          selling_price = subquery.selling_price,
          ${
            modelName == "total_no_stones" ? "markup_price" : "markup"
          } = subquery.markup_price,
          discount_price =subquery.discount_price,
          margin_percentage = case when subquery.markup_price > 0 
                    then((subquery.discount_price - subquery.markup_price)*100/subquery.markup_price) 
                    else 0 
                    end, 
          "updatedAt" = now()
          from 
          (
            select t.product_id,t.generated_sku,x.*,t."updatedAt" from 
            temp_price_lists t,
            json_to_recordset(pricing#>'{${item}}') as 
            x(${columns
              .map((i) => `${i.columnName} ${i.columnType}`)
              .join(",")})   
          ) as subquery
          where t.product_sku = subquery.generated_sku and t.${
            columns[0].columnName
          } = subquery.${columns[0].columnName}`);
        })
      )
        .then(async () => {
          try {
            await models.sequelize.query(`update trans_sku_lists t 
            set
            markup_price = subquery.markup_price,
            markup_price_tax = subquery.markup_price_tax,
            discount_price = subquery.discount_price,
            discount_price_tax = subquery.discount_price_tax,
            margin_on_sale_percentage = subquery.margin_on_sale_percentage,
            discount_desc = subquery.discount_name,
            discount = subquery.discount_value,
            "updatedAt" = now()
            from
            (select t.product_id,t.generated_sku,x.*,t."updatedAt" from 
            temp_price_lists t,
            json_to_record(pricing) as 
            x(markup_price numeric,markup_price_tax numeric,discount_price numeric,
              discount_price_tax numeric,
              margin_on_sale_percentage numeric,
              discount_name text,
              discount_value numeric)) as subquery
            where t.generated_sku = subquery.generated_sku`);
            resolve("Completed Price Update!");
          } catch (error) {
            reject(error);
          }
        })
        .catch(reject);
    } catch (error) {
      reject(error);
    }
  });
};
