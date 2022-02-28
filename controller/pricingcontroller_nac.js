const models = require("./../models");

exports.createPriceRunHistory = async (priceHistory) => {
  return await models.price_running_history.create(priceHistory);
};

exports.updatePriceRunHistory = async (id, updateObj) => {
  return await models.price_running_history.update(updateObj, {
    where: { id },
  });
};

let updateMarkupMetalPrice = ({
  product_sku,
  markup_value,
  markup_type,
  markupApplicable,
}) => {
  let condition = {
    product_sku,
  };
  if (["Diamond", "Gemstone"].includes(markupApplicable)) {
    return Promise.resolve("Not Applicable");
  }
  if (markupApplicable == "Gold") {
    condition["material_name"] = "goldprice";
  } else if (markupApplicable == "Making Charge") {
    condition["material_name"] = {
      [models.Sequelize.Op.in]: ["makingcharge", "wastage"],
    };
  }
  let newMarkup;
  if (markup_type == 2) {
    //Applying Percentage
    newMarkup = models.sequelize.literal(
      `(selling_price*(1+(${markup_value}::decimal/100)))`
    );
  } else {
    //Applying Flat Markup
    newMarkup = models.sequelize.literal(
      `(selling_price*(1+(${markup_value})))`
    );
  }
  return new Promise((resolve, reject) => {
    models.pricing_sku_metals
      .update(
        {
          markup: newMarkup,
        },
        {
          where: condition,
        }
      )
      .then(resolve)
      .catch(reject);
  });
};

let updateDiscountMetalPrice = ({
  product_sku,
  discount_value,
  discount_type,
  discountApplicable,
}) => {
  let condition = {
    product_sku,
  };
  discountApplicable = discountApplicable.filter(
    (item) => !["Diamond", "Gemstone"].includes(item)
  );
  if (discountApplicable.length <= 0) {
    return Promise.resolve("Not Applicable");
  } else {
    if (!discountApplicable.includes("All")) {
      let material_name = [];
      if (discountApplicable.includes("Gold")) {
        material_name.push("goldprice");
      }
      if (discountApplicable.includes("Making Charge")) {
        material_name.push("makingcharge", "wastage");
      }
      if (material_name.length) {
        condition = {
          ...condition,
          material_name,
        };
      }
    }
  }
  let newDiscount;
  if (discount_type == 2) {
    //Applying Percentage
    newDiscount = models.sequelize.literal(
      `(markup*(1+(${discount_value}::decimal/100)))`
    );
  } else {
    //Applying Flat Discount
    newDiscount = models.sequelize.literal(`(markup*(1+(${discount_value})))`);
  }
  console.log(">>>>>>>", condition);
  return new Promise((resolve, reject) => {
    models.pricing_sku_metals
      .update(
        {
          discount_price: newDiscount,
        },
        {
          where: condition,
          logging: console.log,
        }
      )
      .then(resolve)
      .catch(reject);
  });
};

let updateMarkupMaterialPrice = ({
  product_sku,
  markup_value,
  markup_type,
  markupApplicable,
}) => {
  if (!["Diamond", "Gemstone", "All"].includes(markupApplicable)) {
    return Promise.resolve("Not Applicable");
  }
  let condition = {
    product_sku,
  };
  if (markupApplicable == "Gemstone") {
    condition["component"] = {
      [models.Sequelize.Op.iLike]: `gemstone%`,
    };
  } else if (markupApplicable == "Diamond") {
    condition["component"] = {
      [models.Sequelize.Op.iLike]: `diamond%`,
    };
  }
  let newMarkup;
  if (markup_type == 2) {
    //Applying Percentage
    newMarkup = models.sequelize.literal(
      `(selling_price*(1+(${markup_value}::decimal/100)))`
    );
  } else {
    //Applying Flat Markup
    newMarkup = models.sequelize.literal(
      `(selling_price*(1+(${markup_value}))`
    );
  }
  return new Promise((resolve, reject) => {
    models.pricing_sku_materials
      .update(
        {
          markup: newMarkup,
        },
        { where: condition, returning: true }
      )
      .then(resolve)
      .catch(reject);
  });
};

let updateDiscountMaterialPrice = ({
  product_sku,
  discount_value,
  discount_type,
  discountApplicable,
}) => {
  let condition = {
    product_sku,
  };
  discountApplicable = discountApplicable.filter((item) =>
    ["Diamond", "Gemstone", "All"].includes(item)
  );
  if (discountApplicable.length <= 0) {
    return Promise.resolve("Not Applicable");
  } else {
    if (!discountApplicable.includes("All")) {
      if (discountApplicable.includes("Diamond")) {
        condition["component"] = {
          [models.Sequelize.Op.iLike]: `diamond%`,
        };
      }
      if (discountApplicable.includes("Gemstone")) {
        condition["component"] = {
          [models.Sequelize.Op.iLike]: `gemstone%`,
        };
      }
    }
  }
  let newDiscount;
  if (discount_type == 2) {
    //Applying Percentage
    newDiscount = models.sequelize.literal(
      `(markup*(1+(${discount_value}::decimal/100)))`
    );
  } else {
    //Applying Flat Discount
    newDiscount = models.sequelize.literal(`(markup*(1+(${discount_value}))`);
  }
  return new Promise((resolve, reject) => {
    models.pricing_sku_metals
      .update(
        {
          discount_price: newDiscount,
        },
        {
          where: condition,
        }
      )
      .then(resolve)
      .catch(reject);
  });
};

let updateTotalNoStones = ({ product_sku }) => {
  return new Promise((resolve, reject) => {
    models.sequelize
      .query(
        `update total_no_stones t
          set 
          selling_price = subquery.selling_price, 
          markup_price = subquery.markup_price,
          discount_price = subquery.discount_price,
          "updatedAt" = now()
          from
          (select 
          product_sku,
          case when component ilike 'gemstone%' then 'gemstone_total' else 'diamond_total' end as type,
          sum(selling_price) as selling_price,
          sum(COALESCE(markup,0)) as markup_price,
          sum(COALESCE(discount_price,0)) as discount_price
          from pricing_sku_materials 
          where product_sku = '${product_sku}'
          group by component,product_sku
          ) as subquery
          where t.product_sku = subquery.product_sku and t.product_sku = '${product_sku}'`,
        { type: models.Sequelize.QueryTypes.UPDATE }
      )
      .then(resolve)
      .catch(reject);
  });
};

exports.priceUpdate = ({ product_id }) => {
  return new Promise(async (resolve, reject) => {
    try {
      let product = await models.product_lists.findOne({
        include: [
          {
            model: models.trans_sku_lists,
            attributes: [
              "generated_sku",
              "sku_weight",
              "product_id",
              "purity",
              "diamond_type",
              "sku_size",
              "selling_price",
              "attributes",
            ],
          },
          {
            model: models.product_materials,
          },
        ],
        where: {
          product_id,
        },
      });
      if (
        product &&
        product.trans_sku_lists &&
        product.trans_sku_lists.length > 0
      ) {
        let product_sku =
          product.trans_sku_lists[0]["generated_sku"].toString();

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
              [models.Sequelize.Op.contains]: [product_sku],
            },
          },
          order: [["createdAt", "desc"]],
          plain: true,
        });
        let markup = await models.pricing_markup.findOne({
          where: {
            selling_price_min: {
              [models.Sequelize.Op.lte]:
                product.trans_sku_lists[0].selling_price,
            },
            selling_price_max: {
              [models.Sequelize.Op.gte]:
                product.trans_sku_lists[0].selling_price,
            },
            category: product.product_category,
            product_type: {
              [models.Sequelize.Op.contains]: [product.product_type],
            },
            purities: {
              [models.Sequelize.Op.contains]:
                product.trans_sku_lists[0].attributes.filter((item) =>
                  item.includes("purity")
                ),
            },
          },
          order: [["createdAt", "desc"]],
          plain: true,
        });
        let markupCondition = {
          product_sku,
          markup_value: 0,
          markup_type: 1,
          markupApplicable: "All",
        };
        let discountCondition = {
          product_sku,
          discount_value: 0,
          discount_type: 1,
          discountApplicable: ["All"],
        };
        if (markup) {
          markupCondition = {
            ...markupCondition,
            markup_value: markup.markup_value,
            markup_type: markup.markup_type,
            markupApplicable: markup.material,
          };
          if (discount) {
            discountCondition = {
              ...discountCondition,
              discount_value: discount.discount_value,
              discount_type: discount.discount_type,
              discountApplicable: discount.components,
            };
          }
        }
        //updating Metal Markup Price
        await updateMarkupMetalPrice(markupCondition);
        //updating Material Markup Price
        await updateMarkupMaterialPrice(markupCondition);
        //updating Metal Discount Price
        await updateDiscountMetalPrice(discountCondition);
        //updating Material Discount Price
        await updateDiscountMaterialPrice(discountCondition);
        //updating Total Diamond & Gemstone Price
        await updateTotalNoStones({ product_sku });

        let { tax_value } = await models.master_tax_settings.findOne({
          where: { hsn_number: product.hsn_number || "7713" },
        });

        models.sequelize
          .query(
            `select 
              product_sku,
              sum(subquery.selling_price) as selling_price,
              round((((sum(subquery.selling_price))*${tax_value})/${
              100 + Number(tax_value)
            })::numeric,2) as selling_price_tax,
              sum(subquery.markup_price) as markup_price,
              round((((sum(subquery.markup_price))*${tax_value})/${
              100 + Number(tax_value)
            })::numeric,2) as markup_price_tax,
              sum(subquery.discount_price) as discount_price,
              round((((sum(subquery.discount_price))*${tax_value})/${
              100 + Number(tax_value)
            })::numeric,2) as discount_price_tax
              from
              (select 
              product_sku,
              sum(selling_price) as selling_price,
              round(sum(markup)::numeric,2) as markup_price,
              round(sum(discount_price)::numeric,2) as discount_price 
              from pricing_sku_metals group by product_sku
              union all
              select 
              product_sku,
              sum(selling_price) as selling_price,
              round(sum(COALESCE(markup_price,0))::numeric,2) as markup_price,
              round(sum(COALESCE(discount_price))::numeric,2) as discount_price 
              from total_no_stones group by product_sku) as subquery
              where product_sku = '${product_sku}'
              group by product_sku`,
            { type: models.Sequelize.QueryTypes.SELECT }
          )
          .then((result) => {
            if (result.length) {
              let { product_sku, selling_price, selling_price_tax, ...rest } =
                result[0];
              let updateTransSkuList = {
                ...rest,
                margin_on_sale_percentage: Math.round(
                  ((rest.markup_price - selling_price) * 100) / selling_price,
                  0
                ),
                discount: discountCondition.discount_value,
                discount_desc: discount?.discount_name,
              };
              models.trans_sku_lists
                .update(updateTransSkuList, {
                  where: { generated_sku: product_sku },
                })
                .then(() => {
                  resolve({ message: "done" });
                })
                .catch((err) => {
                  reject({ statusCode: 500, ...err });
                });
            }
          })
          .catch((err) => {
            reject({ statusCode: 500, ...err });
          });
      } else {
        reject({ statusCode: 401, message: "Product not found!" });
      }
    } catch (error) {
      console.log(error);
      reject({ statusCode: 404, message: error.message });
    }
  });
};
