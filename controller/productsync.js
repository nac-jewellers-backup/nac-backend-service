const models = require("../models");
const { v4: uuidv4 } = require("uuid");

String.prototype.capitalize = function () {
  return this.charAt(0).toUpperCase() + this.slice(1);
};

function capitalize_Words(str) {
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

let get_purity = (purity) => {
  if (purity.includes("58.3")) return "14 KT";
  if (purity.includes("75")) return "18 KT";
  if (purity.includes("87.5")) return "21 KT";
  if (purity.includes("91.6")) return "22 KT";
  return null;
};

let differentiate_stone = ({ ITEMNAME, SUBITEMNAME, DESCRIP }) => {
  if (
    (ITEMNAME && ITEMNAME.toLowerCase().includes("diamond")) ||
    (SUBITEMNAME && SUBITEMNAME.toLowerCase().includes("dia")) ||
    (DESCRIP && DESCRIP.toLowerCase().includes("dia"))
  )
    return "product_diamonds";
  else return "product_gemstones";
};

let last_product_id = () => {
  return new Promise((resolve, reject) => {
    models.product_lists
      .findAll({
        attributes: ["product_id"],
        limit: 1,
        raw: true,
        order: [[models.Sequelize.literal("product_id::INT desc")]],
      })
      .then((result) => {
        resolve(parseInt(result[0].product_id));
      })
      .catch((err) => {
        console.log("Error", err);
        reject(err);
      });
  });
};

let verify_product_purities = ({ product_id, data }) => {
  return new Promise((resolve, reject) => {
    if (data["PURITY"]) {
      models.product_purities
        .findOne({
          attributes: ["id"],
          where: {
            product_id,
            purity: get_purity(data["PURITY"]),
          },
        })
        .then(async (res) => {
          if (res) {
            await models.product_gender.update(
              {
                product_id,
                purity: get_purity(data["PURITY"]),
              },
              {
                where: { id: res.id },
              }
            );
          } else {
            await models.product_gender.create({
              id: uuidv4(),
              product_id,
              purity: get_purity(data["PURITY"]),
              is_active: true,
            });
          }
        })
        .catch((err) => {
          console.log("Error", err);
          reject(err);
        });
    }
    console.log(`Completed ${data.TAGNO}`);
    resolve(`Completed ${data.TAGNO}`);
  });
};

let verify_master_genders = ({ product_id, data }) => {
  var verify_product_genders = ({ result, product_id, data }) => {
    return new Promise(async (resolve, reject) => {
      if (result) {
        models.product_gender
          .findOne({
            attributes: ["id"],
            where: {
              product_id,
              gender_name: { [models.Sequelize.Op.iLike]: result.name },
            },
          })
          .then(async (res) => {
            if (res) {
              await models.product_gender.update(
                {
                  product_id,
                  gender_name: result.name,
                },
                {
                  where: { id: res.id },
                }
              );
            } else {
              await models.product_gender.create({
                id: uuidv4(),
                product_id,
                gender_name: result.name,
                is_active: true,
              });
            }
          })
          .catch((err) => {
            console.log("Error", err);
            reject(err);
          });
      }
    });
  };

  return new Promise(async (resolve, reject) => {
    try {
      if (data["Gender"]) {
        data.Gender.split(",").forEach((item) => {
          models.master_genders
            .findOne({
              where: {
                name: { [models.Sequelize.Op.iLike]: item },
              },
            })
            .then(async (result) => {
              if (result) {
                await verify_product_genders({ result, product_id, data });
              } else {
                models.master_genders
                  .create({
                    name: item,
                    is_filter: true,
                    is_active: true,
                  })
                  .then(async (result) => {
                    await verify_product_genders({
                      result,
                      product_id,
                      data,
                    });
                  });
              }
              resolve("Added/Updated product_genders");
            })
            .catch((err) => {
              console.log("Error", err);
              reject(err);
            });
        });
      }
      resolve(await verify_product_purities({ product_id, data }));
    } catch (error) {
      reject(error);
    }
  });
};

let verify_master_hash_tags = ({ product_id, data }) => {
  var verify_product_hash_tags = ({ result, product_id, data }) => {
    return new Promise((resolve, reject) => {
      if (result) {
        models.product_hash_tags
          .findOne({
            attributes: ["id"],
            where: {
              product_id,
              hash_tag: { [models.Sequelize.Op.iLike]: result.name },
            },
          })
          .then(async (res) => {
            if (res) {
              await models.product_hash_tags.update(
                {
                  product_id,
                  hash_tag: result.name,
                },
                {
                  where: { id: res.id },
                }
              );
            } else {
              await models.product_hash_tags.create({
                id: uuidv4(),
                product_id,
                hash_tag: result.name,
                is_active: true,
              });
            }
            resolve("Added/Updated product_hash_tags");
          })
          .catch((err) => {
            console.log("Error", err);
            reject(err);
          });
      }
    });
  };

  return new Promise(async (resolve, reject) => {
    try {
      if (data["Hashtags"]) {
        data.Hashtags.split(",").forEach((item) => {
          models.master_hash_tags
            .findOne({
              where: {
                name: { [models.Sequelize.Op.iLike]: item },
              },
            })
            .then(async (result) => {
              if (result) {
                await verify_product_hash_tags({ result, product_id, data });
              } else {
                models.master_hash_tags
                  .create({
                    name: item,
                    is_filter: true,
                    is_active: true,
                  })
                  .then(async (result) => {
                    await verify_product_hash_tags({
                      result,
                      product_id,
                      data,
                    });
                  });
              }
            })
            .catch((err) => {
              console.log("Error", err);
              reject(err);
            });
        });
      }
      resolve(await verify_master_genders({ product_id, data }));
    } catch (error) {
      reject(error);
    }
  });
};

let verify_master_occassions = ({ product_id, data }) => {
  var verify_product_occassions = ({ result, product_id, data }) => {
    return new Promise((resolve, reject) => {
      if (result) {
        models.product_occassions
          .findOne({
            attributes: ["id"],
            where: {
              product_id,
              occassion_name: {
                [models.Sequelize.Op.iLike]: data["Occasion"],
              },
            },
          })
          .then(async (res) => {
            if (res) {
              await models.product_occassions.update(
                {
                  product_id,
                  occassion_name: result.name,
                },
                {
                  where: { id: res.id },
                }
              );
            } else {
              await models.product_occassions.create({
                id: uuidv4(),
                product_id,
                occassion_name: result.name,
                is_active: true,
              });
            }
            resolve("Added/Updated product_occassions");
          })
          .catch((err) => {
            console.log("Error", err);
            reject(err);
          });
      }
    });
  };

  return new Promise(async (resolve, reject) => {
    try {
      if (data["Occasion"]) {
        models.master_occasions
          .findOne({
            where: { name: { [models.Sequelize.Op.iLike]: data["Occasion"] } },
          })
          .then(async (result) => {
            if (result) {
              await verify_product_occassions({ result, product_id, data });
            } else {
              models.master_occasions
                .create({
                  id: uuidv4(),
                  name: data["Occasion"],
                  is_filter: true,
                  is_active: true,
                })
                .then(async (result) => {
                  await verify_product_occassions({ result, product_id, data });
                });
            }
          })
          .catch((err) => {
            console.log("Error", err);
            reject(err);
          });
      }
      resolve(await verify_master_hash_tags({ product_id, data }));
    } catch (error) {
      reject(error);
    }
  });
};

let verify_master_collections = ({ product_id, data }) => {
  var verify_product_collections = ({ result, product_id, data }) => {
    return new Promise((resolve, reject) => {
      if (result) {
        models.product_collections
          .findOne({
            attributes: ["id"],
            where: {
              product_id,
              collection_name: {
                [models.Sequelize.Op.iLike]: data["Collections"],
              },
            },
          })
          .then(async (res) => {
            if (res) {
              await models.product_collections.update(
                {
                  product_id,
                  collection_name: result.name,
                },
                {
                  where: { id: res.id },
                }
              );
            } else {
              await models.product_collections.create({
                id: uuidv4(),
                product_id,
                collection_name: result.name,
                is_active: true,
              });
            }
            resolve("Added/Updated product_collections");
          })
          .catch((err) => {
            console.log("Error", err);
            reject(err);
          });
      }
    });
  };

  return new Promise(async (resolve, reject) => {
    try {
      if (data["Collections"]) {
        models.master_collections
          .findOne({
            where: {
              name: { [models.Sequelize.Op.iLike]: data["Collections"] },
            },
          })
          .then(async (result) => {
            if (result) {
              await verify_product_collections({ result, product_id, data });
            } else {
              models.master_collections
                .create({
                  id: uuidv4(),
                  name: capitalize_Words(data["Collections"]),
                  is_filter: true,
                  is_active: true,
                })
                .then(async (result) => {
                  await verify_product_collections({
                    result,
                    product_id,
                    data,
                  });
                });
            }
          })
          .catch((err) => {
            console.log("Error", err);
            reject(err);
          });
      }
      resolve(await verify_master_occassions({ product_id, data }));
    } catch (error) {
      reject(error);
    }
  });
};

let verify_pricing_sku_metals = ({ product_id, data }) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (data["MCHARGE"]) {
        models.pricing_sku_metals
          .findOne({
            attributes: ["id"],
            where: {
              product_sku: data.TAGNO,
              material_name: "makingcharge",
            },
          })
          .then(async (result) => {
            if (result) {
              await models.pricing_sku_metals.update(
                {
                  product_sku: data.TAGNO,
                  material_name: "makingcharge",
                  selling_price: data["MCHARGE"],
                },
                { where: { id: result.id } }
              );
            } else {
              await models.pricing_sku_metals.create({
                product_sku: data.TAGNO,
                material_name: "makingcharge",
                selling_price: data["MCHARGE"],
              });
            }
          })
          .catch((err) => {
            console.log("Error", err);
            reject(err);
          });
      }
      if (data["GoldAmount"]) {
        models.pricing_sku_metals
          .findOne({
            attributes: ["id"],
            where: {
              product_sku: data.TAGNO,
              material_name: "goldprice",
            },
          })
          .then(async (result) => {
            if (result) {
              await models.pricing_sku_metals.update(
                {
                  product_sku: data.TAGNO,
                  material_name: "goldprice",
                  selling_price: data["GoldAmount"],
                },
                { where: { id: result.id } }
              );
            } else {
              await models.pricing_sku_metals.create({
                product_sku: data.TAGNO,
                material_name: "goldprice",
                selling_price: data["GoldAmount"],
              });
            }
          })
          .catch((err) => {
            console.log("Error", err);
            reject(err);
          });
      }
      resolve(await verify_master_collections({ product_id, data }));
    } catch (error) {
      reject(error);
    }
  });
};

let verify_product_stones = ({ product_id, data }) => {
  return new Promise(async (resolve, reject) => {
    if (data["tagstone"]) {
      if (data.tagstone["stone"] && data.tagstone["stone"].length > 0) {
        var stones = data.tagstone.stone;
        stones.forEach((element) => {
          models[differentiate_stone(element)]
            .findOne({
              attributes: ["id"],
              where: {
                product_sku: product_id,
                item_name: element["ITEMNAME"],
                [models.Sequelize.Op.or]: {
                  item_name: element["ITEMNAME"],
                  sub_item_name: element["SUBITEMNAME"]
                    ? element["SUBITEMNAME"]
                    : null,
                  description: element["DESCRIP"] ? element["DESCRIP"] : null,
                },
              },
            })
            .then(async (result) => {
              if (result) {
                await models[differentiate_stone(element)].update(
                  {
                    product_sku: product_id,
                    item_name: element["ITEMNAME"],
                    sub_item_name: element["SUBITEMNAME"]
                      ? element["SUBITEMNAME"]
                      : null,
                    description: element["DESCRIP"] ? element["DESCRIP"] : null,
                    stone_weight: element["STNWT"],
                    stone_count: element["STNPCS"],
                    stone_amount: element["STNAMT"],
                    stone_rate: element["STNRATE"],
                    is_active: true,
                  },
                  { where: { id: result.id } }
                );
              } else {
                await models[differentiate_stone(element)].create({
                  id: uuidv4(),
                  product_sku: product_id,
                  item_name: element["ITEMNAME"],
                  sub_item_name: element["SUBITEMNAME"]
                    ? element["SUBITEMNAME"]
                    : null,
                  description: element["DESCRIP"] ? element["DESCRIP"] : null,
                  stone_weight: element["STNWT"],
                  stone_count: element["STNPCS"],
                  stone_amount: element["STNAMT"],
                  stone_rate: element["STNRATE"],
                  is_active: true,
                });
              }
            })
            .catch((err) => {
              console.log("Error", err);
              reject(err);
            });
        });
      }
    }
    resolve(await verify_pricing_sku_metals({ product_id, data }));
  });
};

let verify_trans_sku_description = ({ product_id, data }) => {
  return new Promise((resolve, reject) => {
    models.trans_sku_descriptions
      .findOne({
        attributes: ["id"],
        where: { sku_id: data.TAGNO },
        raw: true,
      })
      .then(async (result) => {
        if (result) {
          await models.trans_sku_descriptions.update(
            {
              sku_id: data.TAGNO,
              sku_description: data.ProductDescription,
            },
            {
              where: { id: result.id },
            }
          );
        } else {
          await models.trans_sku_descriptions.create({
            id: uuidv4(),
            sku_id: data.TAGNO,
            sku_description: data.ProductDescription,
          });
        }
        resolve(await verify_product_stones({ product_id, data }));
      })
      .catch((err) => {
        console.log("Error", err);
        reject(err);
      });
  });
};

let verify_trans_sku = ({ product_id, data }) => {
  var metal_color = null;
  if (data["Material"])
    metal_color = data.Material.toLowerCase().includes("gold")
      ? "yellow"
      : "white";
  return new Promise((resolve, reject) => {
    models.trans_sku_lists
      .findOne({
        attributes: ["id"],
        raw: true,
        where: {
          generated_sku: data.TAGNO,
        },
      })
      .then(async (result) => {
        if (result) {
          await models.trans_sku_lists.update(
            {
              purity: get_purity(data["PURITY"]),
              metal_color,
              product_id,
              isdefault: true,
              generated_sku: data.TAGNO,
              sku_id: data.TAGNO,
              gross_weight: data.GRSWT,
              net_weight: data.NETWT,
              sku_weight: data.NETWT,
              selling_price: data.AMOUNT,
              selling_price_tax: data.TAX,
              isdefault: true,
            },
            {
              where: { id: result.id },
            }
          );
        } else {
          await models.trans_sku_lists.create({
            id: uuidv4(),
            purity: get_purity(data["PURITY"]),
            metal_color,
            product_id,
            isdefault: true,
            generated_sku: data.TAGNO,
            sku_id: data.TAGNO,
            gross_weight: data.GRSWT,
            net_weight: data.NETWT,
            sku_weight: data.NETWT,
            selling_price: data.AMOUNT,
            selling_price_tax: data.TAX,
            isdefault: true,
          });
        }
        resolve(await verify_trans_sku_description({ product_id, data }));
      })
      .catch((err) => {
        console.log("Error", err);
        reject(err);
      });
  });
};

let verify_product = ({ product_id, data }) => {
  return new Promise(async (resolve, reject) => {
    var colour_varient = null;
    if (data["Material"])
      colour_varient = data.Material.toLowerCase().includes("gold")
        ? "yellow"
        : "white";

    if (product_id) {
      models.product_lists
        .findOne({ attributes: ["id"], where: { product_id } })
        .then(async (product) => {
          if (product) {
            models.product_lists
              .update(
                {
                  product_name: data.ProductName,
                  gender: data.Gender
                    ? data.Gender.split(",")
                        .map((item) => {
                          return item.capitalize();
                        })
                        .join(",")
                    : null,
                  prod_description: data.ProductDescription,
                  product_type: data.ProductCategory,
                  colour_varient: colour_varient,
                },
                { where: { product_id } }
              )
              .then(async () => {
                resolve(await verify_trans_sku({ product_id, data }));
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
    } else {
      product_id = (await last_product_id()) + 1;
      models.product_lists
        .create({
          id: uuidv4(),
          product_id,
          product_name: data.ProductName,
          gender: data.Gender
            ? data.Gender.split(",")
                .map((item) => {
                  return item.capitalize();
                })
                .join(",")
            : null,
          prod_description: data.ProductDescription,
          product_type: data.ProductCategory,
          colour_varient: colour_varient,
          is_active: false,
        })
        .then(async () => {
          resolve(
            await verify_trans_sku({ product_id: product_id.toString(), data })
          );
        })
        .catch((err) => {
          console.log("Error", err);
          reject(err);
        });
    }
  });
};

export let productSync = (product) => {
  return new Promise((resolve, reject) => {
    //Fetching product_id from trans_sku lists with product TAGNO
    models.trans_sku_lists
      .findOne({
        attributes: ["product_id"],
        raw: true,
        where: {
          generated_sku: product.TAGNO,
        },
      })
      .then(async (result) => {
        if (result) {
          resolve(
            await verify_product({
              product_id: result["product_id"],
              data: product,
            })
          );
        } else {
          resolve(
            await verify_product({
              product_id: null,
              data: product,
            })
          );
        }
      })
      .catch((err) => {
        console.log("Error", err);
        reject(err);
      });
  });
};
