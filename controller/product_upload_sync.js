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
  product_purities: {
    models: models.product_purities,
    requestKey: "purity",
    attributes: "purity",
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
              ? data[requestKey]
                  .toString()
                  .split(",")
                  .filter((x) => x.length > 0)
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

let updateInventory = ({ product_id, data }) => {
  return new Promise((resolve, reject) => {
    models.warehouse
      .findOne({ where: { name: data.COSTNAME } })
      .then((warehouse) => {
        if (warehouse) {
          models.inventory
            .findOne({
              attributes: ["id"],
              where: {
                generated_sku: data.tag_no,
                warehouse_id: warehouse.id,
              },
            })
            .then(async (result) => {
              if (result) {
                await models.inventory.update(
                  {
                    generated_sku: data.tag_no,
                    number_of_items: 1,
                    warehouse_id: warehouse.id,
                  },
                  { where: { id: result.id } }
                );
              } else {
                await models.inventory.create({
                  id: uuidv1(),
                  generated_sku: data.tag_no,
                  number_of_items: 1,
                  warehouse_id: warehouse.id,
                });
              }
              resolve("Inventory Added!");
            })
            .catch((err) => {
              console.log(err);
              reject(err);
            });
        } else {
          reject("No Such Warehouse");
        }
      })
      .catch((err) => reject(err));
  });
};

let updatePricingSkuMetals = ({ product_id, data }) => {
  return new Promise((resolve, reject) => {
    Promise.all(
      [
        {
          material_name: "goldprice",
          rate: data.RATE,
          selling_price: data.AMOUNT,
        },
        { material_name: "makingcharge", rate: 0, selling_price: data.MCAMT },
        {
          material_name: "wastage",
          rate: data.WASTAGE,
          selling_price: data.WASTAMT,
        },
      ].map(async (item) => {
        models.pricing_sku_metals
          .findOne({
            where: {
              product_sku: data.tag_no,
              material_name: item.material_name,
            },
          })
          .then(async (pricing) => {
            if (pricing) {
              await models.pricing_sku_metals.update(item, {
                where: { id: pricing.id },
              });
            } else {
              await models.pricing_sku_metals.create({
                ...item,
                product_sku: data.tag_no,
              });
            }
            return Promise.resolve(item.material_name);
          })
          .catch((err) => {
            console.log(err);
            return Promise.reject(err);
          });
      })
    )
      .then(resolve)
      .catch(reject);
  });
};

let updateTotalStonePrice = ({ product_id, data }) => {
  return new Promise(async (resolve, reject) => {
    await models.pricing_sku_materials.update(
      {
        selling_price: null,
        markup: null,
        discount_price: null,
        margin_percentage: null,
      },
      {
        where: {
          product_id,
        },
      }
    );

    Promise.all(
      [
        {
          type: "diamond_total",
          product_id,
          product_sku: data.tag_no,
          selling_price: data.DIAAMT,
        },
        {
          type: "gemstone_total",
          product_id,
          product_sku: data.tag_no,
          selling_price: data.STNAMT,
        },
      ].map(async (item) => {
        let { selling_price, ...rest } = item;
        models.total_no_stone
          .findOne({
            where: { ...rest },
          })
          .then(async (result) => {
            if (result) {
              await models.total_no_stone.update(item, {
                where: { id: result.id },
              });
            } else {
              await models.total_no_stone.create(item);
            }
          })
          .catch(reject);
      })
    )
      .then(resolve)
      .catch(reject);
  });
};

let updateTransSkuLists = ({ product_id, data }, isDefault = true) => {
  return new Promise((resolve, reject) => {
    let updateData = {};
    if (isDefault) {
      updateData = {
        item_id: data.item_id,
        diamond_type: data.diamond_type,
        metal_color: data.metal_color,
        minimum_order_quantity: data?.minimum_order_quantity,
        maximum_order_quantity: data?.maximum_order_quantity,
        is_ready_to_ship: data.is_ready_to_ship,
        purity: data.purity,
        selling_price: data.selling_price,
        is_active: data.is_ready_to_ship,
      };
    } else {
      updateData = {
        sku_weight:
          data.CALCWT == "GROSS" ? Number(data.GRSWT) : Number(data.NETWT),
        gross_weight: Number(data.GRSWT),
        net_weight: Number(data.NETWT),
        calc_type: `${data.CALCWT}-${data.CALCTYPE}`,
        metal_rate: Number(data.RATE),
        selling_price: Number(data.SALVALUE) * (1 + 3 / 100),
        selling_price_tax: Number(data.SALVALUE) * (3 / 100),
      };
    }

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
    let sku_url = `${
      data.categories
        ? `/${data.categories.toLowerCase().trim().replace(" ", "-")}`
        : ""
    }${
      data.type ? `/${data.type.toLowerCase().trim().replace(" ", "-")}` : ""
    }${
      data["materials"].split(",").length > 0
        ? `/${data["materials"].split(",")?.[0]}`
        : ""
    }${
      data["name"]
        ? `/${data["name"].toLowerCase().trim().replace(/ /g, "-")}`
        : ""
    }?skuid=${data.tag_no}`;
    models.trans_sku_lists
      .findOne({
        attributes: ["id"],
        where: { generated_sku: data.tag_no },
      })
      .then((result) => {
        if (result) {
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
        } else {
          models.trans_sku_lists
            .create(
              {
                ...updateData,
                id: uuidv1(),
                product_id: product_id,
                sku_url: sku_url,
                sku_id: data.tag_no,
                generated_sku: data.tag_no,
              },
              {
                where: { generated_sku: data.tag_no },
              }
            )
            .then((result) => {
              resolve(result);
            })
            .catch((err) => {
              console.log("Error", err);
              reject(err);
            });
        }
      });
  });
};

let updateProduct = ({ product_id, data }) => {  
  return new Promise(async (resolve, reject) => {
    if (product_id) {
      models.product_lists
        .update(
          {
            product_name: data.name,
            product_category: data["categories"],
            product_type: data["type"],
            length: data["length"] ? Number(data["length"]) : null,
            height: data["height"] ? Number(data["height"]) : null,
            width: data["width"] ? Number(data["width"]) : null,
            size_varient: data["size_variant"],
            colour_varient: data["color_varient"],
            gender: data["gender"],
            isactive: data.is_ready_to_ship,
          },
          {
            where: {
              product_id,
            },
            returning: "*",
          }
        )
        .then((result) => {
          resolve(result[1][0]);
        })
        .catch((err) => {
          console.log("Error", err);
          reject(err);
        });
    } else {
      let last_product = await models.sequelize.query(
        `select product_id::integer from product_lists order by product_id::integer desc limit 1`,
        { type: models.Sequelize.QueryTypes.SELECT }
      );
      product_id = last_product[0].product_id + 1;
      models.product_lists
        .create(
          {
            id: uuidv1(),
            product_id: product_id,
            product_name: data.name,
            product_category: data["categories"],
            product_type: data["type"],
            length: data["length"] ? Number(data["length"]) : null,
            height: data["height"] ? Number(data["height"]) : null,
            width: data["width"] ? Number(data["width"]) : null,
            size_varient: data["size_variant"],
            colour_varient: data["color_varient"],
            gender: data["gender"],
            isactive: data.is_ready_to_ship,
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
    }
  });
};

let getProductId = (data) => {
  return new Promise((resolve, reject) => {
    if (data["product_id"]) {
      return resolve({ product_id: data["product_id"] });
    }
    if (data.tag_no) {
      models.trans_sku_lists
        .findOne({
          attributes: ["product_id"],
          where: {
            generated_sku: data.tag_no.toString(),
          },
        })
        .then((result) => {
          if (result) {
            resolve(result);
          } else {
            resolve({});
          }
        })
        .catch((err) => {
          reject(err);
        });
    } else {
      reject("No Tag No.!");
    }
  });
};

export let product_upload_sync = ({ data, type }) => {
  return new Promise((resolve, reject) => {
    getProductId(data)
      .then(({ product_id }) => {
        if (type === "sku") {
          updateProduct({ product_id, data })
            .then(({ product_id }) => {
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
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export let product_pricing_sync = ({ data }) => {
  return new Promise((resolve, reject) => {
    getProductId({ ...data, tag_no: data.SKU })
      .then((result) => {
        if (!result) {
          return reject(`${data.SKU} is not synced`);
        }
        let { product_id } = result;
        if (product_id) {
          updateTransSkuLists(
            {
              product_id,
              data: { ...data, tag_no: data.SKU.toString() },
            },
            false
          ).then((_) => {
            Promise.all(
              [
                updateInventory,
                updatePricingSkuMetals,
                updateTotalStonePrice,
              ].map(async (item) => {
                return await item({
                  product_id,
                  data: { ...data, tag_no: data.SKU.toString() },
                });
              })
            )
              .then(resolve)
              .catch(reject);
          });
        } else {
          reject(`${data.SKU} is not synced`);
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};
