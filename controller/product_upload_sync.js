const uuidv1 = require("uuid/v1");
const models = require("../models");
const Op = models.Sequelize.Op;

Array.prototype.diff = function (a) {
  return this.filter(function (i) {
    return a.indexOf(i) < 0;
  });
};

let product_attributes = {
  product_themes: {
    models: models.product_themes,
    requestKey: "themes",
    attributes: "theme_name",
  },
  product_styles: {
    models: models.product_styles,
    requestKey: "styles",
    attributes: "style_name",
  },
  product_occassions: {
    models: models.product_occassions,
    requestKey: "occasions",
    attributes: "occassion_name",
  },
  product_collections: {
    models: models.product_collections,
    requestKey: "collections",
    attributes: "collection_name",
  },
  product_stonecount: {
    models: models.product_stonecount,
    requestKey: "stone_color",
    attributes: "stonecount",
  },
  product_stonecolor: {
    models: models.product_stonecolor,
    requestKey: "stone_count",
    attributes: "stonecolor",
  },
  product_genders: {
    models: models.product_gender,
    requestKey: "gender",
    attributes: "gender_name",
  },
  product_metalcolours: {
    models: models.product_metalcolours,
    requestKey: "metal_color",
    attributes: "product_color",
  },
  product_hash_tags: {
    models: models.product_hash_tags,
    requestKey: "hashtags",
    attributes: "hash_tag",
  },
};

let updateProductAttributes = ({ product_id, data }) => {
  return new Promise((resolve, reject) => {
    Promise.all(
      Object.keys(product_attributes).map((item) => {
        return new Promise(async (resolve, reject) => {
          try {
            let {
              models: model,
              requestKey,
              attributes,
            } = product_attributes[item];            
            let attribute_values = data[requestKey]
              ? data[requestKey].split(",").filter((x) => x.length > 0)
              : [];
            if (attribute_values.length > 0) {
              /* Soft delete all attributes */
              await model.update(
                { is_active: false },
                {
                  where: {
                    product_id,
                  },
                }
              );
              /*activating required attributes */
              let updatedAttributes = await model.update(
                { is_active: true },
                {
                  where: {
                    product_id,
                    [attributes]: {
                      [Op.iLike]: {
                        [Op.any]: attribute_values,
                      },
                    },
                  },
                  returning: true,
                }
              );
              /* adding attributes if required*/
              let diff = attribute_values.diff(
                updatedAttributes[1].map((i) => i[attributes])
              );

              if (diff.length) {
                await model.bulkCreate(
                  diff.map((item) => {
                    {
                      return {
                        id: uuidv1(),
                        product_id,
                        [attributes]: item,
                        is_active: true,
                      };
                    }
                  }),
                  {
                    individualHooks: true,
                  }
                );
              }
            }
            resolve("Completed");
          } catch (error) {
            reject(error);
          }
        });
      })
    )
      .then((_) => {
        resolve("Completed!");
      })
      .catch((err) => {
        reject(err);
      });
  });
};

let updateDiamondOrGemstones = ({ product_id, data, type }) => {
  let model;
  if (type === "diamond") {
    model = models.product_diamonds;
  }
  if (type === "gemstone") {
    model = models.product_gemstones;
  }
  return new Promise((resolve, reject) => {
    if (data.stone.length > 0) {
      model
        .destroy({
          where: {
            product_sku: product_id,
          },
        })
        .then((_) => {
          let bulkData = data.stone.map((item) => {
            let tempData = {
              product_sku: product_id,
              item_name: item.item_name,
              sub_item_name: item.sub_item_name,
              description: item.description,
              stone_amount: item.amount,
              stone_rate: item.rate,
              stone_count: item.count,
              stone_weight: item.weight,
              is_active: true,
            };
            if (type === "diamond") {
              tempData = {
                ...tempData,
                diamond_colour: item.colour,
                diamond_clarity: item.clarity,
                diamond_settings: item.settings,
                diamond_shape: item.shape,
                diamond_type: item.type,
              };
            }
            if (type === "gemstone") {
              tempData = {
                ...tempData,
                gemstone_setting: item.settings,
                gemstone_shape: item.shape,
                gemstone_type: item.type,
                gemstone_size: item.size,
              };
            }
            return tempData;
          });
          model
            .bulkCreate(bulkData, { individualHooks: true })
            .then((_) => {
              resolve("Completed");
            })
            .catch((err) => {
              reject(err);
            });
        })
        .catch((err) => {
          reject(err);
        });
    }
    resolve("Completed");
  });
};

let updateTransSkuLists = ({ product_id, data }) => {
  return new Promise((resolve, reject) => {
    let updateData = {
      item_id: data.item_id,
      diamond_type: data.diamond_type,
      metal_color: data.metal_color,
      minimum_order_quantity: data?.minimum_order_quantity,
      maximum_order_quantity: data?.maximum_order_quantity,
      is_ready_to_ship: data.is_ready_to_ship,
      purity: data.purity,
      selling_price: data.selling_price,
    };

    if (data.markup_price) {
      updateData["markup_price"] = Number(data.markup_price);
    }
    if (data.discount_price) {
      updateData = {
        ...updateData,
        discount: Number(data.discount_price),
        discount: Math.round(
          ((data.discount_price - data.markup_price) * 100) /
            data.discount_price,
          0
        ),
      };
    }
    if (data.vendor_product_code) {
      updateData["vendor_product_code"] = data.vendor_product_code;
    }

    models.trans_sku_lists
      .update(updateData, {
        where: { generated_sku: data.tag_no },
      })
      .then((result) => {
        resolve(result);
      })
      .catch((err) => {
        console.log("Error", err);
        reject(err);
      });
  });
};

let updateProduct = ({ product_id, data }) => {
  return new Promise((resolve, reject) => {
    models.product_lists
      .update(
        {
          product_category: data["categories"],
          product_type: data["type"],
          length: data["length"] ? Number(data["length"]) : null,
          height: data["height"] ? Number(data["height"]) : null,
          width: data["width"] ? Number(data["width"]) : null,
          size_varient: data["size_variant"],
          colour_varient: data["color_varient"],
          gender: data["gender"],
        },
        {
          where: {
            product_id,
          },
        }
      )
      .then((result) => {
        resolve(result);
      })
      .catch((err) => {
        console.log("Error", err);
        reject(err);
      });
  });
};

let getProductId = (data) => {
  return new Promise((resolve, reject) => {
    if (data["product_id"]) {
      return resolve({ product_id: data["product_id"] });
    }
    models.trans_sku_lists
      .findOne({
        attributes: ["product_id"],
        where: {
          generated_sku: data.tag_no,
        },
      })
      .then((result) => {
        if (result) {
          resolve(result);
        } else {
          resolve(null);
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export let product_upload_sync = ({ data, type }) => {
  return new Promise((resolve, reject) => {
    getProductId(data)
      .then(({ product_id }) => {
        if (product_id) {
          if (type === "sku") {
            updateProduct({ product_id, data })
              .then((_) => {
                updateTransSkuLists({ product_id, data })
                  .then((_) => {
                    updateProductAttributes({ product_id, data })
                      .then((_) => resolve(`${data.tag_no} completed!`))
                      .catch((err) => {
                        reject(err);
                      });
                  })
                  .catch((err) => {
                    reject(err);
                  });
              })
              .catch((err) => {
                reject(err);
              });
          }
          if (type === "diamond" || type === "gemstone") {
            updateDiamondOrGemstones({ product_id, data, type })
              .then((_) => resolve(`${data.tag_no} completed!`))
              .catch((err) => {
                reject(err);
              });
          }
        } else {
          reject(`${data.tag_no} is not synced`);
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};
