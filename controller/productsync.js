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

let stockStatus = {
  inStock: "InStock",
  noStock: "OutofStock",
};

let get_purity = (purity) => {
  if (purity.includes("58.3")) return "14KT";
  if (purity.includes("75")) return "18KT";
  if (purity.includes("87.5")) return "21KT";
  if (purity.includes("91.6")) return "22KT";
  return null;
};

let differentiate_stone = ({ ITEMNAME, SUBITEMNAME, DESCRIP }) => {
  if (
    (ITEMNAME && ITEMNAME.toLowerCase().includes("diamond")) ||
    (ITEMNAME && ITEMNAME.toLowerCase().includes("forever mark")) ||
    (ITEMNAME && ITEMNAME.toLowerCase().includes("solitare")) ||
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

let add_to_inventory = ({ data, warehouse }) => {
  return new Promise((resolve, reject) => {
    if (data.StockStatus && data.StockStatus == stockStatus.inStock) {
      models.inventory
        .findOne({
          attributes: ["id"],
          where: {
            generated_sku: data.TAGNO,
            warehouse_id: warehouse,
          },
        })
        .then(async (result) => {
          if (result) {
            await models.inventory.update(
              {
                generated_sku: data.TAGNO,
                number_of_items: data.Inventory,
                warehouse_id: warehouse,
              },
              { where: { id: result.id } }
            );
          } else {
            await models.inventory.create({
              id: uuidv4(),
              generated_sku: data.TAGNO,
              number_of_items: data.Inventory,
              warehouse_id: warehouse,
            });
          }
          resolve("Inventory Added!");
        })
        .catch((err) => {
          console.log(err);
          reject(err);
        });
    } else {
      resolve("No Stock Found!");
    }
  });
};

let verify_master_styles = ({ product_id, data }) => {
  var verify_product_styles = ({ result, product_id, data }) => {
    return new Promise(async (resolve, reject) => {
      if (result) {
        models.product_styles
          .findOne({
            attributes: ["id"],
            where: {
              product_id,
              style_name: { [models.Sequelize.Op.iLike]: result.name },
            },
          })
          .then(async (res) => {
            if (res) {
              await models.product_styles.update(
                {
                  product_id,
                  style_name: result.name,
                },
                {
                  where: { id: res.id },
                }
              );
            } else {
              await models.product_styles.create({
                id: uuidv4(),
                product_id,
                style_name: result.name,
                is_active: true,
              });
            }
            resolve("Added/Updated product_styles");
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
      var style;
      [
        "EarringStyle",
        "RingStyle",
        "PendantStyle",
        "BangleStyle",
        "NecklaceStyle",
        "BraceletStyle",
      ].forEach((item) => {
        if (data[item] && data[item].length > 0) {
          style = data[item];
        }
      });

      if (style) {
        models.master_styles
          .findOne({
            where: {
              name: { [models.Sequelize.Op.iLike]: style },
            },
          })
          .then(async (result) => {
            if (result) {
              await verify_product_styles({ result, product_id, data });
            }
            // else {
            //   models.master_styles
            //     .create({
            //       id: uuidv4(),
            //       name: capitalize_Words(style),
            //       is_filter: true,
            //       is_active: true,
            //     })
            //     .then(async (result) => {
            //       await verify_product_styles({
            //         result,
            //         product_id,
            //         data,
            //       });
            //     });
            // }
          })
          .catch((err) => {
            console.log("Error", err);
            reject(err);
          });
      }
      resolve("Completed master_styles sync");
    } catch (error) {
      reject(error);
    }
  });
};

let verify_product_purities = ({ product_id, data }) => {
  return new Promise(async (resolve, reject) => {
    if (data["PURITY"]) {
      let purity = get_purity(data["PURITY"]);
      if (data.METALID == "P" && purity == "22KT") {
        purity = "950";
      }
      models.product_purities
        .findOne({
          attributes: ["id"],
          where: {
            product_id,
            purity,
          },
        })
        .then(async (res) => {
          if (res) {
            await models.product_purities.update(
              {
                product_id,
                purity,
              },
              {
                where: { id: res.id },
              }
            );
          } else {
            await models.product_purities.create({
              id: uuidv4(),
              product_id,
              purity,
              is_active: true,
            });
          }
        })
        .catch((err) => {
          console.log("Error", err);
          reject(err);
        });
    }
    resolve("Completed product_purities sync");
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
            resolve("Added/Updated product_genders");
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
              }
              // else {
              //   models.master_genders
              //     .create({
              //       name: item,
              //       is_filter: true,
              //       is_active: true,
              //     })
              //     .then(async (result) => {
              //       await verify_product_genders({
              //         result,
              //         product_id,
              //         data,
              //       });
              //     });
              // }
            })
            .catch((err) => {
              console.log("Error", err);
              reject(err);
            });
        });
      }
      resolve("Completed master_genders sync");
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
        let hashtags;
        if (data.Hashtags.includes(",")) {
          hashtags = data.Hashtags.split(",");
        } else {
          hashtags = data.Hashtags.split(" ");
        }
        hashtags.split(" ").forEach((item) => {
          models.master_hash_tags
            .findOne({
              where: {
                name: { [models.Sequelize.Op.iLike]: item },
              },
            })
            .then(async (result) => {
              if (result) {
                await verify_product_hash_tags({ result, product_id, data });
              }
              // else {
              //   models.master_hash_tags
              //     .create({
              //       name: item,
              //       is_filter: true,
              //       is_active: true,
              //     })
              //     .then(async (result) => {
              //       await verify_product_hash_tags({
              //         result,
              //         product_id,
              //         data,
              //       });
              //     });
              // }
            })
            .catch((err) => {
              console.log("Error", err);
              reject(err);
            });
        });
      }
      resolve("Completed master_hashtags sync");
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
            }
            // else {
            //   models.master_occasions
            //     .create({
            //       id: uuidv4(),
            //       name: data["Occasion"],
            //       is_filter: true,
            //       is_active: true,
            //     })
            //     .then(async (result) => {
            //       await verify_product_occassions({ result, product_id, data });
            //     });
            // }
          })
          .catch((err) => {
            console.log("Error", err);
            reject(err);
          });
      }
      resolve("Completed master_occassions sync");
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
            }
            // else {
            //   models.master_collections
            //     .create({
            //       id: uuidv4(),
            //       name: capitalize_Words(data["Collections"]),
            //       is_filter: true,
            //       is_active: true,
            //     })
            //     .then(async (result) => {
            //       await verify_product_collections({
            //         result,
            //         product_id,
            //         data,
            //       });
            //     });
            // }
          })
          .catch((err) => {
            console.log("Error", err);
            reject(err);
          });
      }
      resolve("Completed master_collections sync");
    } catch (error) {
      reject(error);
    }
  });
};

let verify_pricing_sku_materials = ({ product_id, data }) => {
  return new Promise((resolve, reject) => {
    if (data["tagstone"]) {
      if (data.tagstone["stone"] && data.tagstone["stone"].length > 0) {
        var stones = data.tagstone.stone;
        stones.forEach((element, index) => {
          let insert_object = {
            id: uuidv4(),
            product_id,
            product_sku: data.TAGNO,
            selling_price: element.STNAMT,
            material_name: element.ITEMNAME,
          };
          if (differentiate_stone(element).includes("diamond")) {
            insert_object["component"] = `diamond_${index + 1}_${product_id}_${
              data.TAGNO
            }`;
          } else {
            insert_object["component"] = `gemstone_${index + 1}_${product_id}_${
              data.TAGNO
            }`;
          }
          models.pricing_sku_materials
            .findOne({
              where: {
                product_id: product_id,
                product_sku: data.TAGNO,
                material_name: element.ITEMNAME,
              },
            })
            .then(async (result) => {
              if (result) {
                await models.pricing_sku_materials.update(
                  {
                    ...insert_object,
                    id: result.id,
                  },
                  { where: { id: result.id } }
                );
              } else {
                await models.pricing_sku_materials.create(insert_object);
              }
            })
            .catch((err) => {
              console.log("Error", err);
              reject(err);
            });
        });
      }
    }
    resolve("Completed product_stones sync");
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
      if (data["WASTAGE"]) {
        models.pricing_sku_metals
          .findOne({
            attributes: ["id"],
            where: {
              product_sku: data.TAGNO,
              material_name: "wastage",
            },
          })
          .then(async (result) => {
            if (result) {
              await models.pricing_sku_metals.update(
                {
                  product_sku: data.TAGNO,
                  material_name: "wastage",
                  selling_price: data["WASTAGE"],
                },
                { where: { id: result.id } }
              );
            } else {
              await models.pricing_sku_metals.create({
                product_sku: data.TAGNO,
                material_name: "wastage",
                selling_price: data["WASTAGE"],
              });
            }
          })
          .catch((err) => {
            console.log("Error", err);
            reject(err);
          });
      }
      resolve("Completed pricing_sku_metals sync");
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
    resolve("Completed product_stones sync");
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
        resolve("Completed trans_sku_description sync");
      })
      .catch((err) => {
        console.log("Error", err);
        reject(err);
      });
  });
};

let verify_product_materials = ({ product_id, data }) => {
  return new Promise(async (resolve, reject) => {
    try {
      let materials = [];
      if (data.METALID == "G") {
        materials.push("gold");
      }
      if (data.METALID == "P") {
        materials.push("platinum");
      }
      if (data.METALID == "S") {
        materials.push("silver");
      }
      if (data["tagstone"]) {
        if (data.tagstone["stone"] && data.tagstone["stone"].length > 0) {
          var stones = data.tagstone.stone;
          stones.forEach((element) => {
            if (
              differentiate_stone(element) == "product_diamonds" &&
              materials.findIndex((i) => i == "diamond") < 0
            ) {
              materials.push("diamond");
            }
            if (
              differentiate_stone(element) == "product_gemstones" &&
              materials.findIndex((i) => i == "gemstone") < 0
            ) {
              materials.push("gemstone");
            }
          });
        }
      }
      let product_materials = await models.product_materials.findAll({
        attributes: ["material_name"],
        where: {
          product_sku: product_id,
        },
        raw: true,
      });
      product_materials = product_materials.map((i) => i.material_name);
      if (materials.length) {
        for (let index = 0; index < materials.length; index++) {
          const element = materials[index];
          if (!product_materials.includes(element)) {
            await models.product_materials.create({
              id: uuidv4(),
              material_name: element,
              product_sku: product_id,
              is_active: true,
            });
          }
        }
        resolve("Completed product materials sync!");
      } else {
        resolve("No Materials to sync!");
      }
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
};

let getAttributes = ({ data }) => {
  return new Promise(async (resolve, reject) => {
    try {
      //Default Attribute
      let attributes = ["category-jewellery"];
      //materials from data source
      let materials = [];
      if (data.METALID == "G") {
        materials.push("gold");
      }
      if (data.METALID == "P") {
        materials.push("platinum");
      }
      if (data.METALID == "S") {
        materials.push("silver");
      }
      if (data["tagstone"]) {
        if (data.tagstone["stone"] && data.tagstone["stone"].length > 0) {
          var stones = data.tagstone.stone;
          stones.forEach((element) => {
            if (
              differentiate_stone(element) == "product_diamonds" &&
              materials.findIndex((i) => i == "diamond") < 0
            ) {
              materials.push("diamond");
            }
            if (
              differentiate_stone(element) == "product_gemstones" &&
              materials.findIndex((i) => i == "gemstone") < 0
            ) {
              materials.push("gemstone");
            }
          });
        }
      }
      let purity = get_purity(data["PURITY"]);
      if (data.METALID == "P") {
        purity = "950";
      }
      let condition = [];
      if (data["Collections"]) {
        condition.push({
          [models.Sequelize.Op.and]: {
            type: "Collection",
            name: capitalize_Words(data["Collections"]),
          },
        });
      }
      if (data["Occasion"]) {
        condition.push({
          [models.Sequelize.Op.and]: {
            type: "Occasion",
            name: data["Occasion"],
          },
        });
      }
      if (data["Gender"]) {
        condition.push({
          [models.Sequelize.Op.and]: {
            type: "Gender",
            name: {
              [models.Sequelize.Op.in]: data["Gender"]
                .split(",")
                .map((i) => capitalize_Words(i) || ""),
            },
          },
        });
      }
      if (data["ProductCategory"]) {
        condition.push({
          [models.Sequelize.Op.and]: {
            type: "Product Type",
            name: capitalize_Words(data["ProductCategory"]),
          },
        });
      }
      if (
        data["EarringStyle"] ||
        data["RingStyle"] ||
        data["PendantStyle"] ||
        data["BangleStyle"] ||
        data["NecklaceStyle"] ||
        data["BraceletStyle"]
      ) {
        condition.push({
          [models.Sequelize.Op.and]: {
            type: "Style",
            name: capitalize_Words(
              data["EarringStyle"] ||
                data["RingStyle"] ||
                data["PendantStyle"] ||
                data["BangleStyle"] ||
                data["NecklaceStyle"] ||
                data["BraceletStyle"]
            ),
          },
        });
      }
      if (purity) {
        condition.push({
          [models.Sequelize.Op.and]: {
            type: "Metal Purity",
            name: purity,
          },
        });
      }
      if (materials) {
        condition.push({
          [models.Sequelize.Op.and]: {
            type: "Material",
            name: {
              [models.Sequelize.Op.in]: materials,
            },
          },
        });
      }
      //Fetching attribute short_code
      if (condition.length) {
        let attributeShortCodes = await models.Attribute_master.findAll({
          attributes: ["short_code"],
          where: {
            [models.Sequelize.Op.or]: condition,
          },
          order: ["type"],
          raw: true,
        });
        attributes.push(...attributeShortCodes.map((i) => i.short_code));
      }
      //returning attributes
      resolve(attributes);
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
};

let verify_trans_sku = ({ product_id, data, type }) => {
  var metal_color = null;
  if (data["Material"])
    metal_color = data.Material.toLowerCase().includes("gold")
      ? "yellow"
      : "white";
  let purity = get_purity(data["PURITY"]);
  if (data.METALID == "P") {
    purity = "950";
  }
  let sku_url = `jewellery${
    data.ProductCategory
      ? `/${data.ProductCategory.toLowerCase().trim().replace(" ", "-")}`
      : ""
  }${data["Material"] ? `/${data["Material"]}` : ""}${
    data["ProductName"]
      ? `/${data["ProductName"].toLowerCase().trim().replace(/ /g, "-")}`
      : ""
  }?skuid=${data.TAGNO}`;
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
        var updateData = {};
        if (type == "price_sync") {
          updateData = {
            selling_price: data.AMOUNT,
            selling_price_tax: data.TAX,
          };
        } else {
          updateData = {
            purity,
            metal_color,
            product_id,
            generated_sku: data.TAGNO,
            sku_id: data.TAGNO,
            gross_weight: data.GRSWT,
            net_weight: data.NETWT,
            sku_weight: data.NETWT,
            selling_price: data.AMOUNT,
            selling_price_tax: data.TAX,
            isdefault: true,
            attributes: await getAttributes({ data }),
            sku_url,
            item_id: data.ITEMID,
            product_record_date: new Date(data.PRODUCTDATE),
            is_ready_to_ship: data.StockStatus == stockStatus.inStock,
          };
        }
        if (result) {
          await models.trans_sku_lists.update(
            { ...updateData },
            {
              where: { id: result.id },
            }
          );
        } else {
          await models.trans_sku_lists.create({
            id: uuidv4(),
            purity,
            metal_color,
            product_id,
            generated_sku: data.TAGNO,
            sku_id: data.TAGNO,
            gross_weight: data.GRSWT,
            net_weight: data.NETWT,
            sku_weight: data.NETWT,
            selling_price: data.AMOUNT,
            selling_price_tax: data.TAX,
            isdefault: true,
            attributes: await getAttributes({ data }),
            sku_url,
            item_id: data.ITEMID,
            product_record_date: new Date(data.PRODUCTDATE),
            is_ready_to_ship: data.StockStatus == stockStatus.inStock,
          });
        }
        resolve("Completed trans_sku sync");
      })
      .catch((err) => {
        console.log("Error", err);
        reject(err);
      });
  });
};

var all_process = [
  verify_trans_sku,
  verify_trans_sku_description,
  verify_product_stones,
  verify_pricing_sku_metals,
  verify_pricing_sku_materials,
  verify_master_collections,
  verify_master_occassions,
  verify_master_genders,
  verify_master_hash_tags,
  verify_product_purities,
  verify_master_styles,
  verify_product_materials,
  //add_to_inventory,
];

var price_sync = [
  verify_trans_sku,
  verify_pricing_sku_metals,
  verify_pricing_sku_materials,
];

let verify_product = ({ product_id, data, type, warehouse }) => {
  return new Promise(async (resolve, reject) => {
    var colour_varient = null;
    if (data["Material"])
      colour_varient = data.Material.toLowerCase().includes("gold")
        ? "yellow"
        : "white";

    if (product_id && type == "price_sync") {
      Promise.all(
        price_sync.map(async (item) => {
          await item({ product_id, data, type, warehouse });
        })
      )
        .then((_) => {
          console.log(`Completed ${data.TAGNO}`);
          resolve(`Completed ${data.TAGNO}`);
        })
        .catch((err) => {
          throw err;
        });
      // models.product_lists
      //   .findOne({ attributes: ["id"], where: { product_id } })
      //   .then(async (product) => {
      //     if (product) {
      //       models.product_lists
      //         .update(
      //           {
      //             product_name: data.ProductName,
      //             gender: data.Gender
      //               ? data.Gender.split(",")
      //                   .map((item) => {
      //                     return item.capitalize();
      //                   })
      //                   .join(",")
      //               : null,
      //             prod_description: data.ProductDescription,
      //             product_type: data.ProductCategory,
      //             colour_varient: colour_varient,
      //           },
      //           { where: { product_id } }
      //         )
      //         .then(() => {
      //           Promise.all(
      //             all_process.map(async (item) => {
      //               await item({ product_id, data });
      //             })
      //           )
      //             .then((_) => {
      //               //console.log(`Completed ${data.TAGNO}`);
      //               resolve(`Completed ${data.TAGNO}`);
      //             })
      //             .catch((err) => {
      //               throw err;
      //             });
      //         })
      //         .catch((err) => {
      //           console.log("Error", err);
      //           reject(err);
      //         });
      //     }
      //   })
      //   .catch((err) => {
      //     console.log("Error", err);
      //     reject(err);
      //   });
    } else if (!product_id && type == "new_uploads") {
      product_id = ((await last_product_id()) + 1).toString();
      models.product_lists
        .create({
          id: uuidv4(),
          product_id,
          product_name: data.ProductName || null,
          gender: data.Gender
            ? data.Gender.split(",")
                .map((item) => {
                  return item.capitalize();
                })
                .join(",")
            : null,
          prod_description: data.ProductDescription || null,
          product_type: data.ProductCategory,
          product_category: "Jewellery",
          colour_varient: colour_varient,
          is_active: false,
        })
        .then(async () => {
          for (let index = 0; index < all_process.length; index++) {
            const item = all_process[index];
            await item({ product_id, data, warehouse });
          }
          console.log(`Completed ${data.TAGNO}`);
          resolve(`Completed ${data.TAGNO}`);
        })
        .catch((err) => {
          console.log("Error", err);
          reject(err);
        });
    } else if (!product_id && type == "price_sync") {
      resolve("No Such Product, Please sync it first");
    } else {
      resolve("no action");
    }
  });
};

export let productSync = ({ product, type, warehouse }) => {
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
        resolve(
          await verify_product({
            product_id:
              result && result["product_id"] ? result["product_id"] : null,
            data: product,
            type,
            warehouse,
          })
        );
      })
      .catch((err) => {
        console.log("Error", err);
        reject(err);
      });
  });
};

export let syncValidate = ({ product }) => {
  let {
    Collections,
    ProductCategory,
    Occasion,
    Hashtags,
    EarringStyle,
    RingStyle,
    BangleStyle,
    NecklaceStyle,
    BraceletStyle,
    PendantStyle,
  } = product;
  Hashtags = Hashtags ? Hashtags : "";
  let validate_mapper = {
    Collections: {
      model: "master_collections",
      value: [Collections].filter((item) => item && item.length > 0),
    },
    Category: {
      model: "master_product_types",
      value: [ProductCategory].filter((item) => item && item.length > 0),
    },
    Occasion: {
      model: "master_occasions",
      value: [Occasion].filter((item) => item && item.length > 0),
    },
    Hashtags: {
      model: "master_hash_tags",
      value: Hashtags.includes(",")
        ? Hashtags.trim()
            .split(",")
            .filter((item) => item != "")
        : Hashtags.trim()
            .split(" ")
            .filter((item) => item != ""),
    },
    Style: {
      model: "master_styles",
      value: [
        EarringStyle,
        RingStyle,
        BraceletStyle,
        NecklaceStyle,
        BangleStyle,
        PendantStyle,
      ].filter((item) => item && item.length > 0),
    },
  };

  return new Promise(async (resolve, reject) => {
    Promise.all(
      Object.keys(validate_mapper).map((item) => {
        return new Promise((resolve, reject) => {
          if (validate_mapper[item].value.length > 0) {
            let condition = {
              name: {
                [models.Sequelize.Op.iLike]: {
                  [models.Sequelize.Op.any]: validate_mapper[item].value,
                },
              },
            };
            models[validate_mapper[item].model]
              .findAll({ attributes: ["name"], where: condition })
              .then((result) => {
                result = result.map((item) => item.name);
                if (result.length == validate_mapper[item].value.length) {
                  resolve(null);
                } else {
                  resolve({
                    [item]: validate_mapper[item].value.filter(
                      (item) => !result.includes(item)
                    ),
                  });
                }
              })
              .catch((err) => {
                console.error(err);
                reject(err);
              });
          } else {
            resolve({
              [item]: `Empty data in source, Please check!`,
            });
          }
        });
      })
    )
      .then((result) => {
        let final = {};
        result.forEach((element) => {
          if (element)
            Object.keys(element).forEach((key) => {
              if (element[key].length) {
                final = {
                  ...final,
                  [key]: element[key],
                };
              }
            });
        });
        resolve(final);
      })
      .catch((err) => {
        console.error(err);
        reject(err);
      });
  });
};
