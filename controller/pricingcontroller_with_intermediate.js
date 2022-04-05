const models = require("./../models");

exports.createPriceRunHistory = async (priceHistory) => {
  return await models.price_running_history.create(priceHistory);
};

exports.updatePriceRunHistory = async (id, updateObj) => {
  return await models.price_running_history.update(updateObj, {
    where: { id },
  });
};

exports.priceUpdate = ({ product_id }) => {
  return new Promise((resolve, reject) => {
    models.product_lists
      .findOne({
        attributes: ["product_id", "product_category", "product_type"],
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
        let response = {};
        for (let index = 0; index < product.trans_sku_lists.length; index++) {
          const sku = product.trans_sku_lists[index];
          //loading all discounts applicable for this sku
          let discount = await models.sale_discount.findAll({
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
          // Checking if all exists in markup and applying that alone!
          let arrayOfMarkupTypes = markup.map((i) => i.material);
          if (arrayOfMarkupTypes.includes("All")) {
            
          } else {
          }
          response[sku.generated_sku] = { ...sku };
        }
        resolve(response);
      })
      .catch(reject);
  });
};
