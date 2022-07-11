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
  console.log(type, data);
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
            .bulkCreate(bulkData)
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
      let sku_url = `${
        data.categories
          ? `${data.categories.toLowerCase().trim().replace(/ /g, "-")}`
          : ""
      }${
        data["materials"] && data["materials"].split(",").length
          ? `/${data["materials"]
              .split(",")[0]
              .toLowerCase()
              .trim()
              .replace(/ /g, "-")}`
          : ""
      }${
        data["type"]
          ? `/${data.type.toLowerCase().trim().replace(/ /g, "-")}`
          : ""
      }${
        data["name"]
          ? `/${data["name"].toLowerCase().trim().replace(/ /g, "-")}`
          : ""
      }?skuid=${data.tag_no}`;
      updateData = {
        item_id: data.item_id,
        diamond_type: data.diamond_type,
        weight: data.weight,
        metal_color: data.metal_color,
        minimum_order_quantity: data?.minimum_order_quantity,
        maximum_order_quantity: data?.maximum_order_quantity,
        is_ready_to_ship: data.is_ready_to_ship,
        purity: data.purity,
        selling_price: Number(data.selling_price) * (1 + 3 / 100),
        selling_price_tax: (Number(data.selling_price) * 3) / 10,
        generated_sku: data.tag_no.toString(),
        sku_id: data.tag_no.toString(),
        sku_url: sku_url,
        is_active: data.is_active,
        is_ready_to_ship: data.is_ready_to_ship,
        isdefault: data.is_default,
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
      updateData["markup_price"] = Number(data.markup_price) * (1 + 3 / 100);
      updateData["markup_price_tax"] = (Number(data.markup_price) * 3) / 100;
    } else {
      updateData["markup_price"] = updateData.selling_price;
      updateData["markup_price_tax"] = updateData.selling_price_tax;
    }
    if (data.discount_price) {
      updateData = {
        ...updateData,
        discount_price: Number(data.discount_price) * (1 + 3 / 100),
        discount_price_tax: (Number(data.discount_price) * 3) / 100,
        discount: Math.round(
          ((data.discount_price - data.markup_price) * 100) /
            data.discount_price,
          0
        ),
      };
    } else {
      updateData = {
        ...updateData,
        discount_price: updateData.markup_price,
        discount_price_tax: updateData.markup_price_tax,
        discount: 0,
      };
    }
    if (data.vendor_product_code) {
      updateData["vendor_product_code"] = data.vendor_product_code;
    }
    models.trans_sku_lists
      .findOne({
        attributes: ["id"],
        where: { generated_sku: data.tag_no.toString() },
      })
      .then((sku) => {
        if (sku) {
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
            .create({
              id: uuidv1(),
              ...updateData,
              product_id,
            })
            .then((result) => {
              resolve(result);
            })
            .catch((err) => {
              console.log("Error", err);
              reject(err);
            });
        }
      })
      .catch((err) => {
        console.log("Error", err);
        reject(err);
      });
  });
};

let updateProduct = ({ product_id, data }) => {
  let productData = {
    product_name: data.name,
    product_category: data["categories"],
    product_type: data["type"],
    length: data["length"] ? Number(data["length"]) : null,
    height: data["height"] ? Number(data["height"]) : null,
    width: data["width"] ? Number(data["width"]) : null,
    size_varient: data["size_variant"],
    colour_varient: data["color_varient"],
    gender: data["gender"],
    isactive: data.is_active,
  };
  return new Promise(async (resolve, reject) => {
    if (product_id) {
      models.product_lists
        .update(
          { ...productData },
          {
            where: {
              product_id,
            },
          }
        )
        .then((_) => {
          resolve(product_id);
        })
        .catch((err) => {
          console.log("Error", err);
          reject(err);
        });
    } else {
      try {
        let [{ product_id }] = await models.sequelize.query(
          `select product_id from product_lists order by product_id::int desc limit 1`,
          { type: models.Sequelize.QueryTypes.SELECT }
        );
        product_id = (Number(product_id) + 1).toString();
        await models.product_lists.create({
          ...productData,
          product_id: product_id,
        });
        resolve(product_id);
      } catch (error) {
        reject(error);
      }
    }
  });
};

let getProductId = (data) => {
  return new Promise((resolve, reject) => {
    if (data["product_id"]) {
      return resolve({ product_id: data["product_id"] });
    }
    if (!data.tag_no) {
      return reject(new Error("No such tag!"));
    } else {
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
    }
  });
};

export let product_upload_sync = ({ data, type }) => {
  return new Promise((resolve, reject) => {
    getProductId(data)
      .then(({ product_id }) => {
        if (type === "sku") {
          updateProduct({ product_id, data })
            .then((product_id) => {
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
