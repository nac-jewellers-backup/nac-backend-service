const models = require("./../models");

exports.priceUpdate = ({ product_sku }) => {
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
            where: {
              generated_sku: product_sku,
            },
          },
          {
            model: models.product_materials,
          },
        ],
      });

      if (
        product &&
        product.trans_sku_lists &&
        product.trans_sku_lists.length > 0
      ) {
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
          logging: console.log,
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
        });

        if (markup && markup.material == "All") {
          if (markup.markup_type == 2) {
            await models.trans_sku_lists.update(
              {
                markup_price: models.Sequelize.literal(
                  `(selling_price*(1+(${markup.markup_value}::decimal/100)))`
                ),
                markup_price_tax: models.Sequelize.literal(
                  `(selling_price_tax*(1+(${markup.markup_value}::decimal/100)))`
                ),
              },
              { where: { generated_sku: product_sku } }
            );
            if (discount && discount.discount_type == 2) {
              await models.trans_sku_lists.update(
                {
                  discount_price: models.Sequelize.literal(
                    `(markup_price*(1+(${discount.discount_value}::decimal/100)))`
                  ),
                  discount_price_tax: models.Sequelize.literal(
                    `(markup_price_tax*(1+(${discount.discount_value}::decimal/100)))`
                  ),
                  discount: discount.discount_value,
                  discount_desc: discount.discount_title,
                },
                { where: { generated_sku: product_sku } }
              );
            } else {
              await models.trans_sku_lists.update(
                {
                  discount_price: models.Sequelize.literal(`(markup_price)`),
                  discount_price_tax:
                    models.Sequelize.literal(`(markup_price_tax)`),
                  discount: 0,
                  discount_desc: "",
                },
                { where: { generated_sku: product_sku } }
              );
            }

            await models.pricing_sku_metals.update(
              {
                markup: models.Sequelize.literal(
                  `(selling_price*(1+(${markup.markup_value}::decimal/100)))`
                ),
              },
              { where: { product_sku } }
            );
            if (discount && discount.discount_type == 2) {
              await models.pricing_sku_metals.update(
                {
                  discount_price: models.Sequelize.literal(
                    `(markup*(1+(${discount.discount_value}::decimal/100)))`
                  ),
                },
                { where: { product_sku } }
              );
            } else {
              await models.pricing_sku_metals.update(
                {
                  discount_price: models.Sequelize.literal(`(markup)`),
                },
                { where: { product_sku } }
              );
            }
            await models.pricing_sku_materials.update(
              {
                markup: models.Sequelize.literal(
                  `(selling_price*(1+(${markup.markup_value}::decimal/100)))`
                ),
              },
              { where: { product_sku } }
            );
            if (discount && discount.discount_type == 2) {
              await models.pricing_sku_materials.update(
                {
                  discount_price: models.Sequelize.literal(
                    `(markup*(1+(${discount.discount_value}::decimal/100)))`
                  ),
                },
                { where: { product_sku } }
              );
            } else {
              await models.pricing_sku_materials.update(
                {
                  discount_price: models.Sequelize.literal(`(markup)`),
                },
                { where: { product_sku } }
              );
            }
          }
        }

        resolve({ message: "done" });
      } else {
        reject({ statusCode: 401, message: "Product not found!" });
      }
    } catch (error) {
      console.log(error);
      reject({ statusCode: 404, message: error.message });
    }
  });
};
