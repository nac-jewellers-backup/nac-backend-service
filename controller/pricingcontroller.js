const models = require("./../models");
import "dotenv/config";
const Op = require("sequelize").Op;
const squelize = require("sequelize");
const uuidv1 = require("uuid/v1");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(
  "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"
);
exports.priceupdate = (req, res) => {
  console.log("test");
  var skuwhereclause = {};
  var costprice = 0;
  var sellingprice = 0;
  var product_obj = {};
  var responseobj = {};
  var pricesplitup = [];
  var products = [];
  var product_id_val = "";
  var pricing_comp = [];
  var processed_product_count = 0;
  // res.send(200,{message:"success"})
  res.status(200).send({ status: 200, message: "Success" });
  console.log("process start time");
  console.log(new Date());
  const {
    req_product_id,
    vendorcode,
    category,
    product_type,
    metalpurity,
    product_category,
    pricingcomponent,
    purity,
    sizes,
    diamondtypes,
  } = req.body;
  var whereclause1 = {
    isactive: true,
    product_id: {
      [Op.iLike]: "%SR%",
    },
  };

  if (req_product_id) {
    var product_id_arr1 = req_product_id.split(",");

    whereclause1 = {
      product_id: {
        [Op.in]: product_id_arr1,
      },
    };
  }
  let vendor_arr = [];

  if (vendorcode) {
    vendorcode.forEach((element) => {
      vendor_arr.push(element.shortCode);
    });

    whereclause1["vendor_code"] = {
      [Op.in]: vendor_arr,
    };
  }

  if (pricingcomponent) {
    pricingcomponent.forEach((element) => {
      pricing_comp.push(element);
    });
  }

  let purity_arr = [];

  if (purity) {
    metalpurity.forEach((element) => {
      purity_arr.push(element.alias);
    });
    skuwhereclause["purity"] = {
      [Op.in]: purity_arr,
    };
  }

  // skuwhereclause['generated_sku'] = {
  //   [Op.in] : ['SR0010-18110000-8','SR0010-18110000-9']
  // }
  let sku_size_arr = [];
  if (sizes) {
    sizes.forEach((elemet) => {
      sku_size_arr.push(elemet.sku_size);
    });
    skuwhereclause["sku_size"] = {
      [Op.in]: sku_size_arr,
    };
  }
  let diamond_type_arr = [];
  if (diamondtypes) {
    diamondtypes.forEach((element) => {
      diamond_type_arr.push(element.label);
    });

    skuwhereclause["diamond_type"] = {
      [Op.in]: diamond_type_arr,
    };
  }
  let product_category_arr = [];

  if (category) {
    category.forEach((element) => {
      product_category_arr.push(element.name);
    });
    whereclause1["product_category"] = {
      [Op.in]: product_category_arr,
    };
  }

  let product_type_arr = [];
  if (product_type) {
    product_type.forEach((element) => {
      product_type_arr.push(element.name);
    });
    whereclause1["product_type"] = {
      [Op.in]: product_type_arr,
    };
  }

  models.product_lists
    .findAll({
      // include: [{
      //   model: models.trans_sku_lists,
      //   where:{
      //       generated_sku: 'SB0013-18230000'
      //   }
      //  },

      //  {
      //   model: models.product_diamonds,

      //  },
      //  {
      //   model: models.product_gemstones,

      //  },
      //  {
      //   model: models.product_occassions,

      //  },{
      //   model: models.product_styles,

      //  },
      //  {
      //   model: models.product_themes,

      //  }
      // ],
      where: whereclause1,
    })
    .then((product) => {
      products = product;
      console.log("Product list21");
      console.log(new Date());
      processproduct();
    });
  var start = 0;
  var startDate = "";
  async function processproduct() {
    console.log(">>>>>>>>>>>" + processed_product_count);
    if (products.length > processed_product_count) {
      start = new Date();
      startDate = new Date();

      let currentproduct = products[processed_product_count];
      product_obj = await models.product_lists.findOne({
        include: [
          {
            attributes: [
              "generated_sku",
              "sku_weight",
              "product_id",
              "purity",
              "diamond_type",
              "sku_size",
            ],
            model: models.trans_sku_lists,
            where: skuwhereclause,
          },
          {
            model: models.product_diamonds,
            attributes: [
              "diamond_type",
              "diamond_colour",
              "diamond_clarity",
              "stone_count",
              "stone_weight",
            ],
          },
          {
            attributes: ["gemstone_type", "stone_count", "stone_weight"],

            model: models.product_gemstones,
          },
        ],
        where: {
          product_id: currentproduct.product_id,
        },
      });
      console.log("Trans sku list");
      console.log(new Date());

      if (product_obj) {
        if (product_obj.trans_sku_lists.length > 0) {
          product_id_val = product_obj.product_id;

          processskus(product_obj.trans_sku_lists, product_obj);
        } else {
          processed_product_count = processed_product_count + 1;
          processproduct();
        }
      } else {
        processed_product_count = processed_product_count + 1;
        processproduct();
      }
    } else {
      // res.send(200,{message: "succes1s"})
      //  processed_product_count = processed_product_count  + 1;
      //  processproduct();
      var endDate = new Date();
      var seconds = (endDate.getTime() - startDate.getTime()) / 1000;

      console.log("totaltime ");
      console.log(seconds);
    }
  }

  async function pricingresult() {
    let product_detail = await models.trans_sku_lists.findAll({
      where: {
        generated_sku: req.body.sku,
      },
    });
    let product_metals = await models.pricing_sku_metals.findAll({
      where: {
        product_sku: req.body.sku,
      },
    });
    let product_material = await models.pricing_sku_materials.findAll({
      where: {
        product_sku: req.body.sku,
      },
    });
    res.send(200, { product_detail, product_material, product_metals });
  }

  function calculatesellingmarkup(markupval, materialsellingprice) {
    var newsellingmarkup = materialsellingprice;
    if (markupval) {
      if (markupval.markup_type === 1) {
        newsellingmarkup = markupval.markup_value;
      }
    }
    return newsellingmarkup;
  }

  function calculatediscountmarkup(productobj, skuid) {
    var product_type = [];
    var product_occassions = [];
    var product_styles = [];
    var product_themes = [];
    if (product_obj.product_type) {
      product_type.push(product_obj.product_type);
    }
    if (product_obj.product_type) {
      product_type.push(product_obj.product_type);
    }
    // product_obj.product_occassions.forEach(function(element) {
    //   product_occassions.push(element.occassion_name);
    // });
    // product_obj.product_styles.forEach(function(element) {
    //   product_styles.push(element.style_name);
    // });
    // product_obj.product_themes.forEach(function(element) {
    //   product_themes.push(element.theme_name);
    // });

    // var newsellingmarkup = materialsellingprice;
    // if(discountval)
    // {
    // if(discountval.discount_type === 1)
    // {
    //   newsellingmarkup = discountval.discount_value
    // }
    return models.pricing_discount_setup.findAll({
      include: [
        {
          model: models.discount_styles_mapping,
        },
        {
          model: models.discount_occassions_mapping,
        },
        {
          model: models.discount_themes_mapping,
        },
        {
          model: models.discount_product_type_mapping,
        },
      ],
      where: {
        "$discount_occassions_mappings.occassions$": {
          [Op.in]: product_occassions,
        },
        "$discount_styles_mappings.styles$": {
          [Op.in]: product_styles,
        },
        "$discount_themes_mappings.theme$": {
          [Op.in]: product_themes,
        },
      },
    });
  }
  /******  Product Diamond  Price calculation */
  function diamond_price(vendorcode, diamonds) {
    var costprice_diamond = 0;
    var sellingprice_diamond = 0;
    var processcount = 0;
    var product_diamonds = diamonds;

    /*if(product_diamonds.length > 0)
      {
        diamond_process(product_diamonds[0]);

      }else
      {
        product_gemstone(product_obj.vendor_code, product_obj.product_gemstones)

      }*/

    function diamond_process(diamondobj) {
      var conditionobj = {
        vendor_code: vendorcode,
        diamond_colour: diamondobj.diamond_clarity,
        diamond_clarity: diamondobj.diamond_colour,
      };

      models.diamond_price_settings
        .findOne({
          where: conditionobj,
        })
        .then(async (diamondcharge) => {
          var diamondcost = diamondobj.stone_weight * diamondcharge.cost_price;
          var diamondsellingprice =
            diamondobj.stone_weight * diamondcharge.selling_price;

          costprice_diamond = costprice_diamond + diamondcost;
          sellingprice_diamond = sellingprice_diamond + diamondsellingprice;

          processcount++;

          //  let diamondmarkup =  await materialmarkupval('Diamond',diamondsellingprice)
          //  diamondsellingprice = calculatesellingmarkup(diamondmarkup,diamondsellingprice)
          //  let diamonddiscount =  await materialdiscountval('Diamond',diamondsellingprice)
          //  diamondsellingprice = await calculatediscountmarkup(diamonddiscount,diamondsellingprice)

          var diamondmargin =
            ((diamondsellingprice - diamondcost) / diamondcost) * 100;
          var diamondprice = {
            component: "diamond" + processcount + "_" + product_obj.product_id,
            material_name:
              diamondobj.diamond_clarity + " " + diamondobj.diamond_colour,
            id: uuidv1(),
            margin_percentage: diamondmargin,
            cost_price: diamondcost,
            selling_price: diamondsellingprice,
            product_id: product_obj.product_id,
          };
          models.pricing_sku_materials
            .findOne({
              where: {
                product_id: product_obj.product_id,
                component: diamondprice.component,
              },
            })
            .then((price_splitup_model) => {
              if (price_splitup_model) {
                price_splitup_model
                  .update(diamondprice)
                  .then((updatedmakingchargeprice) => {
                    isdiamondexist();
                  })
                  .catch((reason) => {
                    isdiamondexist();
                  });
              } else {
                models.pricing_sku_materials
                  .create(diamondprice)
                  .then((result) => {
                    isdiamondexist();
                  })
                  .catch((error) => {
                    isdiamondexist();
                  });
              }
            });
          function isdiamondexist() {
            if (product_diamonds.length > processcount) {
              diamond_process(product_diamonds[processcount]);
            } else {
              responseobj["diamondprice"] = {
                costprice_diamond,
                sellingprice_diamond,
              };
              isskuexist();
              //  product_gemstone(product_obj.vendor_code, product_obj.product_gemstones)
            }
          }
        });
    }
  }

  /******  Product gemstone  Price calculation */

  function product_gemstone(vendorcode, gemstones) {
    var gemstone_costprice = 0.0;
    var gemstone_sellingprice = 0.0;
    var gemstone_count = 0;
    var product_gemstones = gemstones;

    if (product_gemstones.length > 0) {
      gemstone_price(product_gemstones[0]);
    } else {
      processskus(product_obj.trans_sku_lists, product_obj);
    }

    function gemstone_price(gemstoneobj) {
      var whereclause = {
        vendor_code: vendorcode,
        gemstone_type: gemstoneobj.gemstone_type,
      };

      if (gemstoneobj.stone_weight) {
        var stoneweight = gemstoneobj.stone_weight / gemstoneobj.stone_count;
        whereclause["weight_start"] = { [Op.lte]: stoneweight };
        whereclause["weight_end"] = { [Op.gte]: stoneweight };
      }

      models.gemstone_price_settings
        .findAll({
          where: whereclause,
        })
        .then(async (gemstonecharge) => {
          var gemstonemargin = 0;
          var gemstonecost = 0;
          var gemstonesell = 0;
          var cost_price_type = 0;
          var sell_price_type = 0;
          var sell_percent_flat = 0;

          gemstonecharge.forEach((pricingobj) => {
            if (pricingobj.price_type == 1) {
              gemstonecost = pricingobj.price;
              cost_price_type = pricingobj.rate_type;
            } else if (pricingobj.price_type == 2) {
              gemstonesell = pricingobj.price;
              sell_price_type = pricingobj.rate_type;
              sell_percent_flat = pricingobj.selling_price_type;
            }
          });

          if (cost_price_type == 2) {
            if (gemstoneobj.stone_weight) {
              gemstonecost = gemstonecost * gemstoneobj.stone_weight;
            }
          }
          if (sell_price_type == 1) {
            if (sell_percent_flat == 2) {
              gemstonesell = calculatepercentage(gemstonecost, gemstonesell);
            }
          } else if (sell_price_type == 2) {
            if (sell_percent_flat == 2) {
              gemstonesell = calculatepercentage(gemstonecost, gemstonesell);
            } else {
              if (gemstoneobj.stone_weight) {
                gemstonesell = pricingobj.price * gemstoneobj.stone_weight;
              }
            }
          }

          /* if(gemstonecharge.selling_price_type == 3)
        {
           gemstonecost = gemstonecharge.cost_price;
           gemstonesell = gemstonecharge.selling_price;
          gemstone_costprice = gemstone_costprice +  ( gemstoneobj.stone_count * gemstonecharge.cost_price);
          gemstone_sellingprice = gemstone_sellingprice + ( gemstoneobj.stone_count * gemstonecharge.selling_price);

        }else{
           gemstonecost = gemstonecharge.cost_price;
           gemstonesell = gemstonecharge.selling_price;
          gemstone_costprice = gemstone_costprice + gemstonecharge.cost_price;
          gemstone_sellingprice = gemstone_sellingprice + gemstonecharge.selling_price;

        }
        let gemstonemarkup = await materialmarkupval('Gem Stone',gemstonesell)
        gemstonesell = calculatesellingmarkup(gemstonemarkup, gemstonesell)
        */
          // let gemstonediscount =  await materialdiscountval('Gem Stone',gemstonesell)
          // gemstonesell = calculatediscountmarkup(gemstonediscount, gemstonesell)

          gemstonemargin = ((gemstonesell - gemstonecost) / gemstonecost) * 100;

          gemstone_count++;
          var gemstoneobj = {};

          pricesplitup.push(gemstoneobj);

          var gemstoneprice = {
            component: "gemstone" + gemstone_count,
            material_name: gemstoneobj.gemstone_type,
            id: uuidv1(),
            margin_percentage: gemstonemargin,
            cost_price: gemstonecost,
            selling_price: gemstonesell,
            product_id: product_obj.product_id,
          };

          models.pricing_sku_materials
            .findOne({
              where: {
                product_id: product_obj.product_id,
                material_name: gemstoneprice.material_name,
              },
            })
            .then((price_splitup_model) => {
              if (price_splitup_model) {
                var gemstonemargin1 =
                  ((gemstonesell + price_splitup_model.markup - gemstonecost) /
                    gemstonecost) *
                  100;
                gemstoneprice["margin_percentage"] = gemstonemargin1;
                price_splitup_model
                  .update(gemstoneprice)
                  .then((updatedmakingchargeprice) => {
                    isgemstoneexist();
                  })
                  .catch((reason) => {
                    isgemstoneexist();
                  });
              } else {
                models.pricing_sku_materials
                  .create(gemstoneprice)
                  .then((result) => {
                    isgemstoneexist();
                  })
                  .catch((error) => {
                    isgemstoneexist();
                  });
              }
            });

          function isgemstoneexist() {
            if (product_gemstones.length > gemstone_count) {
              gemstone_price(product_gemstones[gemstone_count]);
            } else {
              responseobj["gemstoneprice"] = {
                gemstone_costprice,
                gemstone_sellingprice,
              };

              processskus(product_obj.trans_sku_lists, product_obj);
            }
          }
        });
    }
  }

  /********** Material Markup calculation */
  async function materialmarkupval(sellingprice_val) {
    const priceMarkup = await models.pricing_markup.findAll({
      where: {
        selling_price_min: {
          [Op.lte]: sellingprice_val,
        },
        selling_price_max: {
          [Op.gte]: sellingprice_val,
        },
      },
    });

    return priceMarkup;
  }

  function materialdiscountval(material_name, sellingprice_val) {
    const pricediscount = models.pricing_discount_setup.findOne({
      where: {
        material: material_name,
        selling_price_min: {
          [Op.lte]: sellingprice_val,
        },
        selling_price_max: {
          [Op.gte]: sellingprice_val,
        },
      },
    });

    return pricediscount;
  }

  function gettaxmaster(producttype) {
    const taxxcontent = models.master_tax_settings.findOne({
      where: {
        product_type: producttype,
      },
    });

    return taxxcontent;
  }

  function productdiamonds(product_id, diamond_type) {
    return models.product_diamonds.findAll({
      where: {
        diamond_type: diamond_type,
        product_sku: product_id,
      },
    });
  }

  function productgems(product_id) {
    return models.product_gemstones.findAll({
      where: {
        product_sku: product_id,
      },
    });
  }

  function diamondpricesettings(diamond_color, diamond_clarity, vendor_code) {
    return models.diamond_price_settings.findAll({
      where: {
        diamond_colour: diamond_color,
        diamond_clarity: diamond_clarity,
        vendor_code: vendor_code,
      },
    });
  }

  async function processskus(productskus, productobj) {
    var skucount = 0;
    var sku_component_count = 0;
    var diamond_component_count = 0;
    var gemstone_component_count = 0;

    checkisinclude(sku_component_count, productobj, productobj.trans_sku_lists);
    // updategoldprice(productobj.vendor_code, productskus[0])
    function checkisinclude(currentsku, productobj, transskus) {
      console.log(currentsku);

      if (pricing_comp.indexOf("Diamond") > -1) {
        updatediamondprice(productobj.vendor_code, transskus[currentsku]);
      }
      if (pricing_comp.indexOf("Gemstone") > -1) {
        updategemstone_price(productobj.vendor_code, transskus[currentsku]);
      }
      if (pricing_comp.includes("Gold")) {
        updategoldprice(
          productobj.vendor_code,
          transskus[currentsku],
          productobj
        );
      }
      if (pricing_comp.indexOf("Making Charge") > -1) {
        makingcharge(productobj.vendor_code, transskus[currentsku]);
      }
      if (pricing_comp.indexOf("price update") > -1) {
        updateskuprice();
        // makingcharge(productobj.vendor_code,transskus[currentsku])
      }
    }

    async function updatediamondprice(vendor_code, productsku) {
      var costprice_diamond = 0;
      var sellingprice_diamond = 0;
      var processcount = 0;
      var diamondprice1 = [];
      let product_diamonds = await productdiamonds(
        productsku.product_id,
        productsku.diamond_type
      );
      sku_component_count = 0;
      diamond_component_count = product_diamonds.length;
      if (product_diamonds.length > 0) {
        sku_component_count++;
        diamond_process(product_diamonds[0], vendor_code);
      } else {
        isskuexist();
      }

      function diamond_process(diamondobj, vendorcode) {
        var conditionobj = {
          vendor_code: vendorcode,
          diamond_colour: diamondobj.diamond_clarity,
          diamond_clarity: diamondobj.diamond_colour,
        };

        models.diamond_price_settings
          .findOne({
            where: conditionobj,
          })
          .then(async (diamondcharge) => {
            if (diamondcharge) {
              var diamondcost =
                diamondobj.stone_weight * diamondcharge.cost_price;
              var diamondsellingprice =
                diamondobj.stone_weight * diamondcharge.selling_price;

              costprice_diamond = costprice_diamond + diamondcost;
              sellingprice_diamond = sellingprice_diamond + diamondsellingprice;

              processcount++;

              var diamondmargin =
                ((diamondsellingprice - diamondcost) / diamondcost) * 100;
              var diamondprice = {
                component:
                  "diamond" + processcount + "_" + product_obj.product_id,
                material_name:
                  diamondobj.diamond_clarity + "" + diamondobj.diamond_colour,
                id: uuidv1(),
                margin_percentage: diamondmargin,
                cost_price: diamondcost,
                selling_price: diamondsellingprice,
                markup: diamondsellingprice,
                discount_price: diamondsellingprice,
                product_id: product_obj.product_id,
                product_sku: productsku.generated_sku,
              };
              models.pricing_sku_materials
                .findOne({
                  where: {
                    product_sku: productsku.generated_sku,
                    component: diamondprice.component,
                  },
                })
                .then((price_splitup_model) => {
                  if (price_splitup_model) {
                    price_splitup_model
                      .update(diamondprice)
                      .then((updatedmakingchargeprice) => {
                        isdiamondexist();
                      })
                      .catch((reason) => {
                        isdiamondexist();
                      });
                  } else {
                    models.pricing_sku_materials
                      .create(diamondprice)
                      .then((result) => {
                        isdiamondexist();
                      })
                      .catch((error) => {
                        isdiamondexist();
                      });
                  }
                });
            } else {
              processcount++;

              isdiamondexist();
            }
            function isdiamondexist() {
              if (product_diamonds.length > processcount) {
                diamond_process(product_diamonds[processcount], vendorcode);
              } else {
                //  updateskuprice()
                console.log("Sku diamond Finished");
                console.log(new Date());
                isskuexist();
                // updategemstone_price(product_obj.vendor_code, productsku)
              }
            }
          });
      }
    }

    async function updategemstone_price(vendor_code, productsku) {
      var gemstonemargin = 0;
      var gemstonecost = 0;
      var gemstonesell = 0;
      var gemstone_count = 0;
      var cost_price_type = 0;
      var sell_price_type = 0;
      var sell_percent_flat = 0;
      let product_gemstones = await productgems(productobj.product_id);
      gemstone_component_count = product_gemstones.length;
      if (product_gemstones.length > 0) {
        sku_component_count++;
        gemstone_process(product_gemstones[0], vendor_code);
      } else {
        checkisinclude();
      }

      function gemstone_process(gemstoneobj, vendorcode) {
        var whereclause = {
          vendor_code: vendorcode,
          gemstone_type: {
            [Op.iLike]: gemstoneobj.gemstone_type,
          },
        };

        if (gemstoneobj.stone_weight) {
          var stoneweight = gemstoneobj.stone_weight / gemstoneobj.stone_count;
          whereclause["weight_start"] = { [Op.lte]: stoneweight };
          whereclause["weight_end"] = { [Op.gte]: stoneweight };
        } else {
          whereclause["rate_type"] = 2;
        }

        models.gemstone_price_settings
          .findAll({
            where: whereclause,
          })
          .then(async (gemstonecharge) => {
            var gemstonemargin = 0;
            var gemstonecost = 0;
            var gemstonesell = 0;
            var cost_price_type = 0;
            var sell_price_type = 0;
            var sell_percent_flat = 0;

            gemstonecharge.forEach((pricingobj) => {
              if (pricingobj.price_type == 1) {
                gemstonecost = pricingobj.price;
                cost_price_type = pricingobj.rate_type;
              } else if (pricingobj.price_type == 2) {
                gemstonesell = pricingobj.price;
                sell_price_type = pricingobj.rate_type;
                sell_percent_flat = pricingobj.selling_price_type;
              }
            });

            if (cost_price_type == 1) {
              if (gemstoneobj.stone_weight) {
                gemstonecost = gemstonecost * gemstoneobj.stone_weight;
              } else {
                gemstonecost = gemstonecost * gemstoneobj.stone_count;
              }
            } else {
            }
            if (sell_price_type == 1) {
              if (sell_percent_flat == 2) {
                gemstonesell = calculatepercentage(gemstonecost, gemstonesell);
              } else {
                gemstonesell = gemstoneobj.stone_weight * gemstonesell;
              }
            } else if (sell_price_type == 2) {
              if (gemstoneobj.stone_count) {
                gemstonesell = gemstoneobj.stone_count * gemstonesell;
              }
            }

            /* if(gemstonecharge.selling_price_type == 3)
            {
               gemstonecost = gemstonecharge.cost_price;
               gemstonesell = gemstonecharge.selling_price;
              gemstone_costprice = gemstone_costprice +  ( gemstoneobj.stone_count * gemstonecharge.cost_price);
              gemstone_sellingprice = gemstone_sellingprice + ( gemstoneobj.stone_count * gemstonecharge.selling_price);
    
            }else{
               gemstonecost = gemstonecharge.cost_price;
               gemstonesell = gemstonecharge.selling_price;
              gemstone_costprice = gemstone_costprice + gemstonecharge.cost_price;
              gemstone_sellingprice = gemstone_sellingprice + gemstonecharge.selling_price;
    
            }
            let gemstonemarkup = await materialmarkupval('Gem Stone',gemstonesell)
            gemstonesell = calculatesellingmarkup(gemstonemarkup, gemstonesell)
            */
            // let gemstonediscount =  await materialdiscountval('Gem Stone',gemstonesell)
            // gemstonesell = calculatediscountmarkup(gemstonediscount, gemstonesell)
            var gemstone_whereclause = {
              material_name: "gemstone",
            };
            gemstone_whereclause["price_min"] = { [Op.lte]: gemstonesell };
            gemstone_whereclause["price_max"] = { [Op.gte]: gemstonesell };

            let gemstone_markup = await models.material_markups.findOne({
              where: gemstone_whereclause,
            });
            if (gemstone_markup) {
              if (gemstone_markup.markup_type == 1) {
                gemstonesell = gemstone_markup.markup_value;
              }
            }
            gemstonemargin =
              ((gemstonesell - gemstonecost) / gemstonecost) * 100;

            gemstone_count++;

            pricesplitup.push(gemstoneobj);

            var gemstoneprice = {
              component: "gemstone" + gemstone_count,
              material_name: gemstoneobj.gemstone_type,
              id: uuidv1(),
              margin_percentage: gemstonemargin,
              cost_price: gemstonecost,
              selling_price: gemstonesell,
              markup: gemstonesell,
              discount_price: gemstonesell,
              product_sku: productskus[skucount].generated_sku,
              product_id: product_obj.product_id,
            };
            models.pricing_sku_materials
              .findOne({
                where: {
                  product_sku: productskus[skucount].generated_sku,
                  material_name: gemstoneprice.material_name,
                },
              })
              .then((price_splitup_model) => {
                if (price_splitup_model) {
                  var gemstonemargin1 =
                    ((gemstonesell +
                      price_splitup_model.markup -
                      gemstonecost) /
                      gemstonecost) *
                    100;
                  gemstoneprice["margin_percentage"] = gemstonemargin1;
                  price_splitup_model
                    .update(gemstoneprice)
                    .then((updatedmakingchargeprice) => {
                      isgemstoneexist();
                    })
                    .catch((reason) => {
                      isgemstoneexist();
                    });
                } else {
                  models.pricing_sku_materials
                    .create(gemstoneprice)
                    .then((result) => {
                      isgemstoneexist();
                    })
                    .catch((error) => {
                      isgemstoneexist();
                    });
                }
              });
          });
        function isgemstoneexist() {
          if (product_gemstones.length > gemstone_count) {
            gemstone_process(
              product_gemstones[gemstone_count],
              product_obj.vendor_code
            );
          } else {
            checkisinclude();
            //updategoldprice(product_obj.vendor_code, productsku)
          }
        }
      }
    }

    function updategoldprice(vendorcode, skuobj, productobj) {
      var purityval = skuobj.purity;

      models.gold_price_settings
        .findOne({
          where: {
            vendor_code: product_obj.vendor_code,
            purity: parseInt(purityval.replace("K", "")),
          },
        })
        .then(async (gold_price) => {
          if (gold_price) {
            costprice = gold_price.cost_price * skuobj.sku_weight;
            if (gold_price.selling_price_type == 2) {
              sellingprice = calculatepercentage(
                costprice,
                gold_price.selling_price
              );
            } else {
              sellingprice = gold_price.selling_price * skuobj.sku_weight;
            }

            responseobj["goldprice"] = {
              costprice,
              sellingprice,
            };
            var goldpriceobj = {};
            goldpriceobj["goldprice"] = {
              costprice,
              sellingprice,
            };

            // let goldmarkup =  await materialmarkupval('Gold',sellingprice)
            // sellingprice = calculatesellingmarkup(goldmarkup, sellingprice)
            let markupprice = 0;
            let golddiscount1 = await calculatediscountmarkup(
              product_obj,
              skuobj.generated_sku
            );
            let golddiscount = golddiscount1[0];
            if (golddiscount) {
              if (golddiscount.goldprice_discount) {
                if (golddiscount.discount_type === 2) {
                  markupprice =
                    sellingprice -
                    (sellingprice * golddiscount.goldprice_discount) / 100;
                } else {
                }
              }
            }

            var goldmargin = ((sellingprice - costprice) / costprice) * 100;

            var goldprice = {
              material_name: "goldprice",
              cost_price: costprice,
              selling_price: sellingprice,
              markup: sellingprice,
              discount_price: sellingprice,
              margin_percentage: goldmargin,
              product_sku: skuobj.generated_sku,
              createdAt: new Date(),
              modifiedAt: new Date(),
            };
            pricesplitup.push(goldpriceobj);

            models.pricing_sku_metals
              .findOne({
                where: {
                  product_sku: skuobj.generated_sku,
                  material_name: "goldprice",
                },
              })
              .then((price_splitup_model) => {
                if (price_splitup_model) {
                  price_splitup_model
                    .update(goldprice)
                    .then((updatedgoldprice) => {
                      console.log("gold sku priceupdate");
                      console.log(new Date());
                      isskuexist();
                      //checkisinclude(skucount,productobj,productobj.trans_sku_lists)

                      // makingcharge(vendorcode);
                    })
                    .catch((reason) => {
                      skucount = skucount + 1;

                      //checkisinclude(skucount,productobj,productobj.trans_sku_lists)
                      isskuexist();
                      // makingcharge(vendorcode);
                    });
                } else {
                  models.pricing_sku_metals
                    .create(goldprice)
                    .then((result) => {
                      //  makingcharge(vendorcode);
                      skucount = skucount + 1;
                      console.log("gold price 2");
                      isskuexist();
                      //checkisinclude(skucount,productobj,productobj.trans_sku_lists)
                    })
                    .catch((error) => {
                      skucount = skucount + 1;
                      console.log("gold price 3");
                      isskuexist();
                      // checkisinclude(skucount,productobj,productobj.trans_sku_lists)

                      //makingcharge(vendorcode);
                    });
                }
              });
          } else {
            skucount = skucount + 1;
            console.log("gold price 4");
            // checkisinclude(skucount,productobj,productobj.trans_sku_lists)
            //  makingcharge(vendorcode);
            isskuexist();
          }
        });
    }

    function makingcharge(vendorcode, productsku) {
      var mkcostprice = 0;
      var mksellingprice = 0;
      var skupurity = productskus[skucount].purity;

      models.making_charge_settings
        .findAll({
          where: {
            vendor_code: vendorcode,
            purity: parseInt(skupurity.replace("K", "")),
            material: "Gold",
            weight_start: {
              [Op.lte]: productskus[skucount].sku_weight,
            },
            weight_end: {
              [Op.gte]: productskus[skucount].sku_weight,
            },
          },
        })
        .then(async (makingcharge) => {
          if (makingcharge) {
            sku_component_count++;
            makingcharge.forEach((makingcharge_obj) => {
              if (makingcharge_obj.price_type == 1) {
                if (makingcharge_obj.rate_type == 1) {
                  mkcostprice = makingcharge_obj.price;
                } else {
                  mkcostprice =
                    productskus[skucount].sku_weight * makingcharge_obj.price;
                }
              }

              if (makingcharge_obj.price_type == 2) {
                if (makingcharge_obj.rate_type == 1) {
                  if (makingcharge_obj.selling_price_type == 1) {
                    mksellingprice = makingcharge_obj.price;
                  } else if (makingcharge_obj.selling_price_type == 2) {
                    mksellingprice = calculatepercentage(
                      costprice,
                      makingcharge_obj.price
                    );
                  }
                } else if (makingcharge_obj.rate_type == 2) {
                  if (makingcharge_obj.rate_type == 1) {
                    mksellingprice = makingcharge_obj.price;
                  } else {
                    mksellingprice =
                      productskus[skucount].sku_weight * makingcharge_obj.price;
                  }
                }
              }
            });

            var makingchargeobj = {};
            makingchargeobj["makingcharge"] = {
              costprice: mkcostprice,
              sellingprice: mksellingprice,
              markup: mksellingprice,
              discount_price: mksellingprice,
            };
            pricesplitup.push(makingchargeobj);
            var makingmargin =
              ((mksellingprice - mkcostprice) / mkcostprice) * 100;

            var makingprice = {
              material_name: "makingcharge",
              cost_price: mkcostprice,
              selling_price: mksellingprice,
              markup: mksellingprice,
              discount_price: mksellingprice,
              margin_percentage: makingmargin,
              product_sku: productskus[skucount].generated_sku,
            };
            models.pricing_sku_metals
              .findOne({
                where: {
                  product_sku: productskus[skucount].generated_sku,
                  material_name: "makingcharge",
                },
              })
              .then((price_splitup_model) => {
                if (price_splitup_model) {
                  price_splitup_model
                    .update(makingprice)
                    .then(async (updatedmakingchargeprice) => {
                      console.log("makingcharge priceupdate");
                      console.log(new Date());

                      isskuexist();

                      //updateskuprice();
                    })
                    .catch((reason) => {
                      console.log("makingcharge priceupdate");
                      console.log(new Date());

                      //  res.send(200,{"message":reason.message,price_splitup_model});
                      isskuexist();
                      //updateskuprice();
                    });
                } else {
                  models.pricing_sku_metals
                    .create(makingprice)
                    .then(async (result) => {
                      console.log("makingcharge priceupdate");
                      console.log(new Date());
                      isskuexist();

                      // gemstonesell = calculatesellingmarkup(gemstonemarkup, gemstonesell)
                      //updateskuprice();
                    })
                    .catch((error) => {
                      console.log("makingcharge priceupdate");
                      console.log(new Date());
                      isskuexist();
                      //    updateskuprice();
                    });
                }
              });
          } else {
            console.log("makingcharge priceupdate");
            console.log(new Date());
            isskuexist();
            //updateskuprice()
          }
        });
    }
    function getmaterialmarkupsum(skuvalue) {
      return models.pricing_sku_materials.findOne({
        attributes: [
          [squelize.literal("SUM(markup)"), "markup"],
          [squelize.literal("SUM(discount_price)"), "discount_price"],
        ],
        where: {
          product_sku: skuvalue,
        },
      });
    }
    function getmetalmarkupsum(skuvalue) {
      return models.pricing_sku_metals.findOne({
        attributes: [
          [squelize.literal("SUM(markup)"), "markup"],
          [squelize.literal("SUM(discount_price)"), "discount_price"],
        ],
        where: {
          product_sku: skuvalue,
        },
      });
    }
    async function updateskuprice() {
      sku_component_count = 0;
      var coponentarray = [];
      let metal_price_obj = await models.pricing_sku_metals.findAll({
        attributes: [
          "material_name",
          [squelize.literal("SUM(cost_price)"), "cost_price"],
          [squelize.literal("SUM(selling_price)"), "selling_price"],
        ],
        group: ["material_name"],
        where: {
          product_sku: productskus[skucount].generated_sku,
        },
      });

      let material_price_obj = await models.pricing_sku_materials.findAll({
        attributes: [
          "component",
          [squelize.literal("SUM(cost_price)"), "cost_price"],
          [squelize.literal("SUM(selling_price)"), "selling_price"],
        ],
        group: "component",
        where: {
          product_sku: productskus[skucount].generated_sku,
        },
      });
      console.log("^^^^^^^^^^^BB");
      // console.log(JSON.stringify(material_price_obj))
      //  console.log("material price")
      console.log(new Date());
      var goldsellingprice = 0;
      var makingsellingprice = 0;
      var diamondsellingprice = 0;
      var gemstonesellingprice = 0;
      var total_costprice = 0;

      var total_sellingprice = 0;
      metal_price_obj.forEach((metal_price) => {
        let metal_name = metal_price.material_name;
        total_costprice = total_costprice + metal_price.cost_price;
        total_sellingprice = total_sellingprice + metal_price.selling_price;

        if (metal_name.includes("gold")) {
          goldsellingprice = metal_price.selling_price;
        }
        if (metal_name.includes("makingcharge")) {
          if (coponentarray.indexOf("makingcharge") == -1) {
            coponentarray.push("makingcharge");
          }
          makingsellingprice = metal_price.selling_price;
        }
      });
      material_price_obj.forEach((metal_price) => {
        total_costprice = total_costprice + metal_price.cost_price;
        total_sellingprice = total_sellingprice + metal_price.selling_price;
        let metal_name = metal_price.component;
        if (metal_name.includes("diamond")) {
          diamond_component_count++;
          if (coponentarray.indexOf("diamond") == -1) {
            coponentarray.push("diamond");
          }
          //sku_component_count++;
          diamondsellingprice = metal_price.selling_price;
        }
        if (metal_name.includes("gemstone")) {
          if (coponentarray.indexOf("gemstone") == -1) {
            coponentarray.push("gemstone");
          }
          //  sku_component_count++;
          gemstonesellingprice = metal_price.selling_price;
        }
      });
      sku_component_count = coponentarray.length;
      let sku_margin =
        ((total_sellingprice - total_costprice) / total_costprice) * 100;
      let markupobj = await materialmarkupval(total_sellingprice);
      var goldmarkupvalue = goldsellingprice;
      var golddiscountvalue = (goldmarkupvalue * 100) / (100 - 25);
      var golddiscount_different = golddiscountvalue - goldmarkupvalue;

      console.log("XXXXXXXXXXXX" + sku_component_count);
      var makingchargemarkupvalue = makingsellingprice;
      var makingchargediscountvalue =
        (makingchargemarkupvalue * 100) / (100 - 25);
      var diamondmarkupvalue = diamondsellingprice;
      var gemstonemarkupvalue = gemstonesellingprice;

      var gemstonediscountvalue = (gemstonesellingprice * 100) / (100 - 25);
      var diamonddiscountvalue = (diamondsellingprice * 100) / (100 - 25);

      markupobj.forEach(async (markup) => {
        if (markup.material == "Gold") {
          goldmarkupvalue =
            selling_price + goldsellingprice * (markup.markup_value / 100);
        }
        if (markup.material == "Making Charge") {
          makingchargemarkupvalue =
            makingsellingprice +
            makingsellingprice * (markup.markup_value / 100);
          makingchargediscountvalue =
            (makingchargemarkupvalue * 100) / (100 - 25);
          var query =
            "UPDATE pricing_sku_metals SET markup = " +
            makingchargemarkupvalue +
            " where product_sku ='" +
            productskus[skucount].generated_sku +
            "' and material_name = 'makingcharge'";
          await models.sequelize.query(query).then(([results, metadata]) => {
            // Results will be an empty array and metadata will contain the number of affected rows.
          });
        }
        if (markup.material == "Gem Stone") {
          gemstonemarkupvalue =
            gemstonesellingprice +
            gemstonesellingprice * (markup.markup_value / 100);
          gemstonediscountvalue = (gemstonemarkupvalue * 100) / (100 - 25);
          var query =
            "UPDATE pricing_sku_materials SET markup = (selling_price + (selling_price *" +
            markup.markup_value +
            "/100)) where product_sku ='" +
            productskus[skucount].generated_sku +
            "' and component LIKE 'gemstone%'";
          await models.sequelize.query(query).then(([results, metadata]) => {
            // Results will be an empty array and metadata will contain the number of affected rows.
          });
        }

        if (markup.material == "Diamond") {
          diamondmarkupvalue =
            diamondsellingprice +
            diamondsellingprice * (markup.markup_value / 100);
          diamonddiscountvalue = (diamondmarkupvalue * 100) / (100 - 25);

          var query =
            "UPDATE pricing_sku_materials SET markup = (selling_price + (selling_price *" +
            markup.markup_value +
            "/100)) where product_sku ='" +
            productskus[skucount].generated_sku +
            "' and material_name ='" +
            productskus[skucount].diamond_type +
            "'";

          await models.sequelize.query(query).then(([results, metadata]) => {
            // Results will be an empty array and metadata will contain the number of affected rows.
          });
        }
      });

      var total_sku_discountvalue =
        golddiscountvalue +
        makingchargediscountvalue +
        diamonddiscountvalue +
        gemstonediscountvalue;

      var golddiscount_percentage = golddiscountvalue / total_sku_discountvalue;
      var makingcharge_percentage =
        makingchargediscountvalue / total_sku_discountvalue;

      var diamond_percentage = diamonddiscountvalue / total_sku_discountvalue;
      var gemstone_percentage = gemstonediscountvalue / total_sku_discountvalue;
      // console.log("skucomponent"+total_sku_discountvalue)
      // console.log("sku_component_count"+sku_component_count)
      // console.log("golddiscount_percentage"+golddiscount_percentage)
      console.log("makingcharge_percentage" + makingcharge_percentage);
      // console.log("diamond_percentage"+diamond_percentage)
      // console.log("gemstone_percentage12"+gemstone_percentage)

      var discount_price_distribute_percentage =
        golddiscount_percentage / sku_component_count;
      console.log(
        "discount_price_distribute_percentage" +
          discount_price_distribute_percentage
      );

      if (makingchargediscountvalue > 0) {
        makingchargediscountvalue =
          makingchargediscountvalue +
          golddiscount_different *
            (discount_price_distribute_percentage + makingcharge_percentage);
      }
      if (gemstonediscountvalue > 0) {
        gemstonediscountvalue =
          gemstonediscountvalue +
          golddiscount_different *
            (discount_price_distribute_percentage + gemstone_percentage);
      }
      golddiscountvalue = goldmarkupvalue;
      if (diamonddiscountvalue > 0) {
        diamonddiscountvalue =
          diamonddiscountvalue +
          golddiscount_different *
            (discount_price_distribute_percentage + diamond_percentage);
      }

      total_sku_discountvalue =
        makingchargediscountvalue +
        golddiscountvalue +
        gemstonediscountvalue +
        diamonddiscountvalue;
      console.log("discount before query price");
      console.log(new Date());

      var mkquery =
        "UPDATE pricing_sku_metals SET discount_price = ((markup * 100) /(100 - 25) + (" +
        golddiscount_different +
        " * (" +
        discount_price_distribute_percentage +
        " + " +
        makingcharge_percentage +
        " ))) where product_sku ='" +
        productskus[skucount].generated_sku +
        "' and material_name = 'makingcharge'";
      await models.sequelize.query(mkquery).then(([results, metadata]) => {
        // Results will be an empty array and metadata will contain the number of affected rows.
      });
      console.log("discount metals query price");
      console.log(new Date());
      if (diamond_component_count > 0) {
        var materialquery =
          "UPDATE pricing_sku_materials SET discount_price = ((markup * 100) /(100 - 25) + (" +
          golddiscount_different +
          " * ((" +
          discount_price_distribute_percentage +
          " + " +
          diamond_percentage +
          " )/" +
          diamond_component_count +
          "))) where product_sku ='" +
          productskus[skucount].generated_sku +
          "' and component ilike '%diamond%'";
        await models.sequelize
          .query(materialquery)
          .then(([results, metadata]) => {
            // Results will be an empty array and metadata will contain the number of affected rows.
          });
      }
      console.log("discount diamond query price");
      console.log(new Date());
      if (gemstone_component_count > 0) {
        var materialquery =
          "UPDATE pricing_sku_materials SET discount_price = ((markup * 100) /(100 - 25) + (" +
          golddiscount_different +
          " * ((" +
          discount_price_distribute_percentage +
          " + " +
          gemstone_percentage +
          " )/" +
          gemstone_component_count +
          "))) where product_sku ='" +
          productskus[skucount].generated_sku +
          "' and component ilike '%gemstone%' ";
        await models.sequelize
          .query(materialquery)
          .then(([results, metadata]) => {
            // Results will be an empty array and metadata will contain the number of affected rows.
          });
      }

      console.log("discount price");
      console.log(new Date());
      /* let total_costprice = accs.cost_price + product_splitup.cost_price;
            let total_sellingprice = accs.selling_price + product_splitup.selling_price;
            let sku_margin = ((total_sellingprice - total_costprice)/total_costprice)*100
            //let taxcomponent = await gettaxmaster('Rings');
           
            var gold_markup_price = 0
            
             let markupobj =  await materialmarkupval(total_sellingprice)
             if(markupobj.length > 0)
              {
                markupobj.forEach(async markup => {
                  if(markup.material == 'Diamond')
                  {
                    var query = "UPDATE pricing_sku_materials SET markup = (selling_price + (selling_price *"+markup.markup_value+"/100)) where product_sku ='"+productskus[skucount].generated_sku+"' and material_name ='"+productskus[skucount].diamond_type+"'" ;
                    await models.sequelize.query(query).then(([results, metadata]) => {
                      // Results will be an empty array and metadata will contain the number of affected rows.
                    })
                  }
                  if(markup.material == 'Gem Stone')
                  {

                    var query = "UPDATE pricing_sku_materials SET markup = (selling_price + (selling_price *"+markup.markup_value+"/100)) where product_sku ='"+productskus[skucount].generated_sku+"' and component LIKE 'gemstone%'" ;
                    await models.sequelize.query(query).then(([results, metadata]) => {
                      // Results will be an empty array and metadata will contain the number of affected rows.
                    })
                  }
                  if(markup.material == 'Making Charge')
                  {
                    var query = "UPDATE pricing_sku_metals SET markup = (selling_price + (selling_price *"+markup.markup_value+"/100)) where product_sku ='"+productskus[skucount].generated_sku+"' and material_name = 'makingcharge'" ;
                    await models.sequelize.query(query).then(([results, metadata]) => {
                      // Results will be an empty array and metadata will contain the number of affected rows.
                    })
                  }
                  if(markup.material == 'Gold')
                  {
                    var query = "UPDATE pricing_sku_metals SET markup = (selling_price + (selling_price *"+markup.markup_value+"/100)) where product_sku ='"+productskus[skucount].generated_sku+"' and material_name = 'goldprice'" ;
                  models.sequelize.query(query).then(([results, metadata]) => {
                   
                    // Results will be an empty array and metadata will contain the number of affected rows.
                    })
                  }
                });

              }

              
              console.log("goldmarkupprice*****")
              console.log(JSON.stringify(gold_markup_price))

              var mkquery = "UPDATE pricing_sku_metals SET discount_price = ((markup * 100) /(100 - 25)) where product_sku ='"+productskus[skucount].generated_sku+"'" ;
             await models.sequelize.query(mkquery).then(([results, metadata]) => {
                // Results will be an empty array and metadata will contain the number of affected rows.
              })
              var materialquery = "UPDATE pricing_sku_materials SET discount_price = ((markup * 100)/(100 - 25)) where product_sku ='"+productskus[skucount].generated_sku+"'" ;
                  await  models.sequelize.query(materialquery).then(([results, metadata]) => {
                      // Results will be an empty array and metadata will contain the number of affected rows.
                    }) */
      // var query = "UPDATE pricing_sku_metals SET discount_price = (discount_price + (discount_price * 3/100)) where product_sku ='"+productskus[skucount].generated_sku+"'" ;
      // await  models.sequelize.query(query).then(([results, metadata]) => {
      //         // Results will be an empty array and metadata will contain the number of affected rows.
      //       })
      // var query1 = "UPDATE pricing_sku_materials SET discount_price = (discount_price + (discount_price * 3/100)) where product_sku ='"+productskus[skucount].generated_sku+"'" ;
      // await  models.sequelize.query(query1).then(([results, metadata]) => {
      //               // Results will be an empty array and metadata will contain the number of affected rows.
      //  })
      var totaldiscountpricevalue = 0;
      var metaldiscountvalue = 0;

      let materialsum = await getmaterialmarkupsum(
        productskus[skucount].generated_sku
      );
      let matalsum = await getmetalmarkupsum(
        productskus[skucount].generated_sku
      );

      totaldiscountpricevalue =
        materialsum.discount_price + matalsum.discount_price;

      // res.send(200,{materialsum, matalsum})
      const costpricetax = (total_costprice * 3) / 100;
      const sellingpricetax = (total_sellingprice * 3) / 100;

      let skumarkup = materialsum.markup + matalsum.markup;
      let skudiscount = materialsum.discount_price + matalsum.discount_price;
      const markuppricetax = (skumarkup * 3) / 100;
      const discountpricetax = (skudiscount * 3) / 100;
      let transskuobj = {
        cost_price: total_costprice + costpricetax,
        cost_price_tax: costpricetax,
        selling_price: total_sellingprice + sellingpricetax,
        selling_price_tax: sellingpricetax,
        discount_price: skudiscount + discountpricetax,
        discount_price_tax: discountpricetax,
        markup_price: skumarkup + markuppricetax,
        markup_price_tax: markuppricetax,
        margin_on_sale_percentage: sku_margin,
      };
      // res.send(200,{"material":materialsum,"metal":matalsum});
      models.trans_sku_lists
        .update(transskuobj, {
          where: { generated_sku: productskus[skucount].generated_sku },
        })
        .then((price_splitup_model) => {
          console.log("priceupdate");
          console.log(new Date());

          isskuexist();
        })
        .catch((reason) => {
          console.log(reason);
        });

      //     });
      // });
    }
    function updatemarkupvalue(query) {}

    function isskuexist() {
      skucount = skucount + 1;
      console.log("skucount" + skucount);

      if (product_obj.trans_sku_lists.length > skucount) {
        console.log(product_obj.trans_sku_lists[skucount].generated_sku);

        checkisinclude(skucount, product_obj, product_obj.trans_sku_lists);
        //   updatediamondprice(product_obj.vendor_code, product_obj.trans_sku_lists[skucount])
      } else {
        var endDate = new Date();
        var seconds = (endDate.getTime() - startDate.getTime()) / 1000;
        startDate = new Date();
        console.log("priceupdated time");
        console.log(seconds);
        // Do your operations
        const msg = {
          to: "manokarantk@gmail.com",
          subject: "Pricing update started",
          from: "info@ustimeapp.com",
          html: product_id_val,
        };
        //     sgMail.send(msg);
        processed_product_count = processed_product_count + 1;
        processproduct();
      }
    }
  }
  function calculatepercentage(priceval, percentageval) {
    return priceval + priceval * (percentageval / 100);
  }
};

exports.updatemetalprice = async (req, res) => {
  const {
    material,
    purity,
    vendor,
    isadd,
    priceid,
    costprice,
    sellingprice,
    pricetype,
  } = req.body;
  if (isadd) {
    let metalpriceobj = {
      id: uuidv1(),
      material: material,
      purity: purity,
      cost_price: costprice,
      selling_price: sellingprice,
      selling_price_type: pricetype,
      vendor_code: vendor,
      createdAt: new Date(),
    };
    let response = await models.gold_price_settings.create(metalpriceobj);
    if (response) {
      res.send(200, { message: "success" });
    } else {
      res.send(402, { message: response });
    }
  } else {
    let response = await models.gold_price_settings.update(
      // Values to update
      {
        cost_price: costprice,
        selling_price: sellingprice,
        selling_price_type: pricetype,
        updatedAt: new Date(),
      },
      {
        // Clause
        where: {
          id: priceid,
        },
      }
    );
    if (response[0] > 0) {
      res.send(200, { message: "success" });
    } else {
      res.send(402, { message: "Try again later" });
    }
  }
};
exports.priceupdatestatus = async (req, res) => {
  const { component } = req.body;
  var componentproductcount = 0;
  let component_history = await models.price_running_history.findOne({
    order: [["createdAt", "DESC"]],
    where: {
      pricing_component: component,
    },
  });
  let status_message = "";
  if (
    component_history.completed_product_count == component_history.total_product
  ) {
    status_message = "Completed";
  } else {
    status_message =
      component_history.completed_product_count +
      " out of " +
      component_history.total_product;
  }

  res.send(200, { message: status_message });
};

exports.getincompletepricerun = async (req, res) => {
  const { component } = req.body;
  var componentproductcount = 0;
  let component_history = await models.price_running_history.findOne({
    order: [["createdAt", "DESC"]],
    where: {
      pricing_component: component,
    },
  });

  let status_message = "";
  var product_ids = component_history.product_ids;
  var ccompleted_product_ids = component_history.completed_products;

  product_ids = product_ids.split(",");
  if (ccompleted_product_ids) {
    ccompleted_product_ids = ccompleted_product_ids.split(",");

    var myArray = product_ids.filter(function (el) {
      return ccompleted_product_ids.indexOf(el) < 0;
    });
    if (myArray.length > 0) {
      res.send(200, {
        iscomplete: false,
        id: component_history.id,
        products: myArray,
      });
    } else {
      res.send(200, { iscomplete: true });
    }
  } else {
    res.send(200, { iscomplete: true });
  }
};

exports.updatediamondprice = async (req, res) => {
  const {
    vendor_code,
    diamondcolor,
    diamondclarity,
    isadd,
    priceid,
    costprice,
    sellingprice,
    pricetype,
  } = req.body;

  if (isadd) {
    let response = await models.diamond_price_settings.create({
      id: uuidv1(),
      vendor_code: vendor_code,
      diamond_colour: diamondcolor,
      diamond_clarity: diamondclarity,
      selling_price_type: pricetype,
      cost_price: costprice,
      selling_price: sellingprice,
    });
    if (response) {
      res.send(200, { message: "success" });
    } else {
      res.send(402, { message: "Try again later" });
    }
  } else {
    let response = await models.diamond_price_settings.update(
      // Values to update
      {
        cost_price: costprice,
        selling_price: sellingprice,
        selling_price_type: pricetype,
        updatedAt: new Date(),
      },
      {
        // Clause
        where: {
          id: priceid,
        },
      }
    );
    if (response[0] > 0) {
      res.send(200, { message: "success" });
    } else {
      res.send(402, { message: "Try again later" });
    }
  }
};

exports.updatevendorgoldprice = async (req, res) => {
  const { costprices, sellingprices, vendors, metal, pricetype } = req.body;
  if (costprices) {
    let purities = Object.keys(costprices);

    var bar = new Promise((resolve, reject) => {
      purities.forEach(async (element, index) => {
        // console.log(element)
        // console.log(vendors)

        await models.gold_price_settings.update(
          {
            cost_price: costprices[element],
            selling_price_type: pricetype ? pricetype.value : 1,
            selling_price: sellingprices[element],
          },
          {
            where: {
              vendor_code: {
                [Op.in]: vendors,
              },
              purity: element,
            },
          }
        );

        if (index === purities.length - 1) resolve();
      });
    });

    bar.then(async () => {
      res.send(200, { response: "updated scuccessfully" });
    });
  }
};
exports.updategemstoneprice = async (req, res) => {
  const {
    isadd,
    cost_price_id,
    vendor_code,
    gemstone_type,
    selling_price_type,
    selling_price_id,
    selling_price,
    cost_price,
    weight_start,
    weight_end,
  } = req.body;
  if (isadd) {
    let price_arr = [];
    let costpriceobj = {
      id: uuidv1(),
      weight_start: weight_start,
      weight_end: weight_end,
      price: cost_price,
      vendor_code: vendor_code,
      gemstone_type: gemstone_type,
      rate_type: 1,
      selling_price_type: 1,
      price: cost_price,
    };
    let sellingpriceobj = {
      id: uuidv1(),
      weight_start: weight_start,
      weight_end: weight_end,
      price: cost_price,
      vendor_code: vendor_code,
      gemstone_type: gemstone_type,
      rate_type: 1,
      selling_price_type: selling_price_type,
      price: selling_price,
    };
    price_arr.push(costpriceobj);
    price_arr.push(sellingpriceobj);
    let response = await models.gemstone_price_settings.bulkCreate(price_arr, {
      individualHooks: true,
    });
    if (response) {
      res.send(200, { message: "success" });
    } else {
      res.send(402, { message: "Try again later" });
    }
  } else {
    let response = await models.gemstone_price_settings.update(
      // Values to update
      {
        weight_start: weight_start,
        weight_end: weight_end,
        price: cost_price,
        updatedAt: new Date(),
      },
      {
        // Clause
        where: {
          id: cost_price_id,
        },
      }
    );

    let response1 = await models.gemstone_price_settings.update(
      // Values to update
      {
        weight_start: weight_start,
        weight_end: weight_end,
        price: selling_price,
        updatedAt: new Date(),
      },
      {
        // Clause
        where: {
          id: selling_price_id,
        },
      }
    );
    if (response[0] > 0) {
      res.send(200, { message: "success" });
    } else {
      res.send(402, { message: "Try again later" });
    }
  }
};
exports.logfile = async (req, res) => {
  res.download("./price_update.txt");
};

exports.vendorgemprice = async (req, res) => {
  const { vendorid, ratetype } = req.body;
  let gem_costprice = {};
  let gem_sellingprice = {};
  let costprice = await models.gemstone_price_settings.findAll({
    where: {
      vendor_code: vendorid,
      rate_type: ratetype,
      price_type: 1,
    },
    order: [
      ["gemstone_type", "ASC"],
      ["weight_start", "ASC"],
    ],
  });
  costprice.forEach((element) => {
    let key =
      element.gemstone_type +
      "-" +
      element.weight_start +
      "-" +
      element.weight_end;
    gem_costprice[key] = element;
  });
  let sellingprice = await models.gemstone_price_settings.findAll({
    where: {
      vendor_code: vendorid,
      rate_type: ratetype,
      price_type: 2,
    },
  });
  sellingprice.forEach((element) => {
    let key =
      element.gemstone_type +
      "-" +
      element.weight_start +
      "-" +
      element.weight_end;
    gem_sellingprice[key] = element;
  });
  let gems = [];
  Object.keys(gem_costprice).forEach(function (key) {
    console.log(key);
    let costcontent = gem_costprice[key];
    let sellcontent = gem_sellingprice[key];
    let gemobj = {
      costprice: costcontent,
      sellprice: sellcontent,
    };
    gems.push(gemobj);
  });
  res.send(200, { gems: gems });
};

exports.vendormakingprice = async (req, res) => {
  const { vendorid, ratetype } = req.body;
  let gem_costprice = {};
  let gem_sellingprice = {};
  let costprice = await models.making_charge_settings.findAll({
    where: {
      vendor_code: vendorid,
      price_type: 1,
    },
    order: [["purity", "ASC"]],
  });
  costprice.forEach((element) => {
    let key =
      element.material +
      "-" +
      element.purity +
      "-" +
      element.weight_start +
      "-" +
      element.weight_end;

    gem_costprice[key] = element;
  });
  let sellingprice = await models.making_charge_settings.findAll({
    where: {
      vendor_code: vendorid,
      price_type: 2,
    },
  });
  sellingprice.forEach((element) => {
    let key =
      element.material +
      "-" +
      element.purity +
      "-" +
      element.weight_start +
      "-" +
      element.weight_end;

    gem_sellingprice[key] = element;
  });
  let gems = [];
  Object.keys(gem_costprice).forEach(function (key) {
    let costcontent = gem_costprice[key];
    let sellcontent = gem_sellingprice[key];
    let gemobj = {
      costprice: costcontent,
      sellprice: sellcontent,
    };

    gems.push(gemobj);
  });
  res.send(200, { gems });
};
exports.addmarkup = async (req, res) => {
  const {
    material,
    sellingPriceMin,
    sellingPriceMax,
    markupValue,
    markuptype,
    category,
    producttype,
    material_list,
    purity_list,
  } = req.body;
  let purities = [];
  let producttypes = [];
  let produc_materials = [];
  let condition = { type: [], name: [] };
  if (material_list) {
    condition.type.push("Material");
    material_list.forEach((item) => {
      condition.name.push(item.name);
    });
  }
  if (Array.isArray(purity_list)) {
    condition.type.push("Metal Purity");
    purity_list.forEach((item) => {
      condition.name.push(item.name);
    });
  } else {
    if (purity_list) {
      purities.push(purity_list);
    }
  }
  let attributes = await models.Attribute_master.findAll({
    attributes: ["short_code", "type"],
    where: {
      type: { [models.Sequelize.Op.in]: condition.type },
      name: { [models.Sequelize.Op.in]: condition.name },
    },
    raw: true,
  });
  if (attributes.length) {
    attributes.forEach((item) => {
      if (item.type == "Material") {
        produc_materials.push(item.short_code);
      }
      if (item.type == "Metal Purity") {
        purities.push(item.short_code);
      }
    });
  }
  // if (material_list) {
  //   material_list.forEach((matobj) => {
  //     produc_materials = matobj.shortCode;
  //   });
  // }
  // if (purity_list) {
  //   if (Array.isArray(purity_list)) {
  //     purity_list.forEach((puobj) => {
  //       purities.push(puobj.shortCode);
  //     });
  //   } else {
  //     purities.push(purity_list);
  //   }
  // }

  if (producttype) {
    if (Array.isArray(producttype)) {
      producttype.forEach((puobj) => {
        producttypes.push(puobj.name.toLowerCase());
      });
    } else {
      producttypes.push(producttype);
    }
  }

  let response = await models.pricing_markup.create({
    id: uuidv1(),
    selling_price_min: sellingPriceMin,
    selling_price_max: sellingPriceMax,
    markup_type: markuptype,
    category: category,
    product_type: producttypes,
    markup_value: markupValue,
    material: material,
    product_material: produc_materials.join(","),
    purities: purities,
    updatedAt: new Date(),
  });
  if (response) {
    res.send(200, { message: "success", response: material_list });
  } else {
    res.send(402, { message: "Try again later" });
  }
};
exports.updatemarkup = async (req, res) => {
  const { markupid, sellingPriceMin, sellingPriceMax, markupValue } = req.body;
  let response = await models.pricing_markup.update(
    {
      selling_price_min: sellingPriceMin,
      selling_price_max: sellingPriceMax,
      markup_value: markupValue,
      updatedAt: new Date(),
    },
    {
      // Clause
      where: {
        id: markupid,
      },
    }
  );
  if (response[0] > 0) {
    res.send(200, { message: "success" });
  } else {
    res.send(402, { message: "Try again later" });
  }
};

exports.updatemakingcharge = async (req, res) => {
  const {
    material,
    price_type,
    isadd,
    purity,
    vendor_code,
    cost_price_id,
    selling_price_id,
    weight_end,
    weight_start,
    cost_price,
    selling_price,
  } = req.body;
  let pricing_arr = [];
  if (isadd) {
    let costpriceobj = {
      id: uuidv1(),
      vendor_code: vendor_code,
      material: material,
      price_type: 1,
      weight_start: weight_start,
      weight_end: weight_end,
      rate_type: 1,
      price_type: 1,
      purity,
      selling_price_type: 1,
      price: cost_price,
    };

    let sellingpriceobj = {
      id: uuidv1(),
      vendor_code: vendor_code,
      material: material,
      price_type: 1,
      weight_start: weight_start,
      weight_end: weight_end,
      rate_type: 2,
      price_type: 1,
      purity,
      selling_price_type: price_type,
      price: selling_price,
    };
    pricing_arr.push(costpriceobj);
    pricing_arr.push(sellingpriceobj);
    let response = await models.making_charge_settings.bulkCreate(pricing_arr, {
      individualHooks: true,
    });
    if (response) {
      res.send(200, { message: "success" });
    } else {
      res.send(402, { message: "Try again later" });
    }
  } else {
    let response = await models.making_charge_settings.update(
      {
        weight_start: weight_start,
        weight_end: weight_end,
        price: cost_price,
        updatedAt: new Date(),
      },
      {
        // Clause
        where: {
          id: cost_price_id,
        },
      }
    );

    let response1 = await models.making_charge_settings.update(
      {
        weight_start: weight_start,
        weight_end: weight_end,
        price: selling_price,
        updatedAt: new Date(),
      },
      {
        // Clause
        where: {
          id: selling_price_id,
        },
      }
    );
    if (response[0] > 0) {
      res.send(200, { message: "success" });
    } else {
      res.send(402, { message: "Try again later" });
    }
  }
};
exports.checkdiscount = async (req, res) => {
  const {
    category,
    product_types,
    materials,
    collections,
    occations,
    styles,
    themes,
  } = req.body;
  var whereclause = {
    isactive: true,
  };
  var includeclause = [];
  includeclause.push({
    attributes: ["generated_sku"],
    model: models.trans_sku_lists,
  });
  if (category) {
    let categories = [];
    category.forEach((catobj) => {
      categories.push(catobj.name);
    });
    whereclause["product_category"] = {
      [Op.or]: categories,
    };
  }

  if (product_types) {
    let prod_types = [];
    product_types.forEach((prodtype) => {
      prod_types.push(prodtype.name);
    });
    whereclause["product_type"] = {
      [Op.or]: prod_types,
    };
  }
  if (materials) {
    let material_names = [];
    materials.forEach((materialobj) => {
      material_names.push(materialobj.name);
    });
    whereclause["$product_materials.material_name$"] = {
      [Op.or]: material_names,
    };

    includeclause.push({
      model: models.product_materials,
    });
  }
  if (collections) {
    let collection_names = [];
    collections.forEach((collectionobj) => {
      collection_names.push(collectionobj.name);
    });
    whereclause["$product_collections.collection_name$"] = {
      [Op.or]: collection_names,
    };

    includeclause.push({
      model: models.product_collections,
    });
  }
  if (occations) {
    let occassion_names = [];
    occations.forEach((occationobj) => {
      occassion_names.push(occationobj.name);
    });
    whereclause["$product_occassions.occassion_name$"] = {
      [Op.or]: occassion_names,
    };

    includeclause.push({
      model: models.product_occassions,
    });
  }
  if (styles) {
    let style_names = [];
    styles.forEach((styleobj) => {
      style_names.push(styleobj.name);
    });
    whereclause["$product_styles.style_name$"] = {
      [Op.or]: style_names,
    };

    includeclause.push({
      model: models.product_styles,
    });
  }
  if (themes) {
    let theme_names = [];
    themes.forEach((themeobj) => {
      theme_names.push(themeobj.name);
    });
    whereclause["$product_themes.theme_name$"] = {
      [Op.or]: theme_names,
    };

    includeclause.push({
      model: models.product_themes,
    });
  }

  let product_lists = await models.product_lists.findAndCountAll({
    attributes: ["product_id"],
    include: includeclause,
    where: whereclause,
  });
  let prodlist = [];
  let skulist = [];

  if (product_lists.rows) {
    product_lists.rows.forEach((prodobj) => {
      prodlist.push(prodobj.product_id);
      prodobj.trans_sku_lists.forEach((skuobj) => {
        skulist.push(skuobj.generated_sku);
      });
    });
  }
  res.send(200, { products: prodlist, skus: skulist });
};
exports.discountinfo = async (req, res) => {
  const { discountid } = req.body;
  let discountobj = await models.sale_discount.findOne({
    where: {
      id: discountid,
    },
  });

  res.send(200, { discunt: discountobj });
};
exports.creatediscount = async (req, res) => {
  const {
    componenets,
    discountname,
    product_attributes_text,
    discounttype,
    discounttitle,
    discountvalue,
    skus,
    product_attributes,
  } = req.body;
  let pricingcomponents = [];
  componenets.forEach((compobj) => {
    pricingcomponents.push(compobj.name);
  });
  console.log("dad");
  console.log(
    JSON.stringify({
      id: uuidv1(),
      components: pricingcomponents,
      discount_value: discountvalue,
      discount_type: discounttype == "percentage" ? 2 : 1,
      product_ids: skus,
    })
  );
  models.sale_discount
    .create({
      id: uuidv1(),
      discount_name: discountname,
      discount_title: discounttitle,
      components: pricingcomponents,
      discount_value: discountvalue,
      discount_type: discounttype == "percentage" ? 2 : 1,
      product_ids: skus,
      is_active: true,
      product_attributes: product_attributes,
      product_attributes_text: product_attributes_text,
    })
    .then((sale) => {
      res.send(200, { message: "success" });
    })
    .catch((err) => {
      res.send(200, { message: "failure", content: JSON.stringify(err) });
    });
};
exports.getdistinctproduct = async (req, res) => {
  const { vendorid, product_category, product_type } = req.body;
  let whereclause = {
    isactive: true,
  };

  if (vendorid) {
    whereclause["vendor_code"] = {
      [Op.in]: vendorid,
    };
  }

  if (product_category) {
    whereclause["product_category"] = {
      [Op.in]: product_category,
    };
  }

  if (product_type) {
    whereclause["product_type"] = {
      [Op.in]: product_type.map((i) => i.toLowerCase()),
    };
  }
  let productids = [];
  let products = await models.product_lists.findAll({
    attributes: ["product_id"],
    where: whereclause,
    raw: true,
  });
  products.forEach((pid) => {
    productids.push(pid.product_id);
  });
  let category = await models.product_lists.findAll({
    attributes: ["product_category"],
    group: ["product_category"],
    where: {
      product_id: {
        [Op.in]: productids,
      },
    },
  });
  let vendorlist = await models.product_lists.findAll({
    attributes: ["vendor_code"],
    group: ["vendor_code"],
    where: {
      product_id: {
        [Op.in]: productids,
      },
    },
  });
  let product_types = await models.product_lists.findAll({
    attributes: ["product_type"],
    group: ["product_type"],
    where: {
      product_id: {
        [Op.in]: productids,
      },
    },
  });

  res.send(200, {
    products_count: productids.length,
    products: productids,
    category: category,
    vendorlist: vendorlist,
    product_types: product_types,
  });
};

exports.getaliasproductlist = async (req, res) => {
  // const { category, product_types } = req.body;
  // let bodyobj = req.body;
  let type_mapper = {
    category: "Category",
    product_types: "Product Type",
    materials: "Material",
    occations: "Occasion",
    styles: "Style",
    collections: "Collection",
  };
  let whereclause = {};
  let attrs = [];
  let keys = Object.keys(req.body);
  console.log(keys);
  for (let i = 0; i < keys.length; i++) {
    let element = keys[i];
    let condition = {};
    if (req.body[element].length > 0) {
      condition["name"] = {
        [Op.iLike]: { [Op.any]: req.body[element].map((i) => i.name) },
      };

      let attribute_masters = await models.Attribute_master.findAll({
        attributes: ["short_code"],
        where: {
          ...condition,
          type: {
            [models.Sequelize.Op.iLike]: type_mapper[element],
          },
        },
        raw: true,
      });
      attribute_masters.forEach((item) => {
        attrs.push(item.short_code);
      });
    }
  }

  // keys.forEach((key) => {
  //   let attributeobj = bodyobj[key];
  //   if (Array.isArray(attributeobj)) {
  //     let componentarr = [];
  //     attributeobj.forEach((attr) => {
  //       if (attr.alias) {
  //         let attr_where = {
  //           attributes: {
  //             [Op.contains]: [attr.alias],
  //           },
  //         };
  //         componentarr.push(attr_where);
  //       }
  //     });
  //     if (componentarr.length > 0) {
  //       let attrobj = {
  //         [Op.or]: componentarr,
  //       };
  //       attrs.push(attrobj);
  //     }
  //   }
  // });

  whereclause = {
    attributes: {
      [Op.contains]: attrs,
    },
  };
  console.log(whereclause);
  let productlists = await models.product_lists.findAll({
    attributes: ["product_id"],
    include: [
      {
        attributes: ["generated_sku"],
        model: models.trans_sku_lists,
        where: whereclause,
      },
    ],
  });
  let prodlist = [];
  let skulist = [];
  let prod_skus = [];
  productlists.forEach((prodobj) => {
    let prod_obj = {};
    prodlist.push(prodobj.product_id);
    prodobj.trans_sku_lists.forEach((skuobj) => {
      skulist.push(skuobj.generated_sku);
    });
    prod_obj["product_id"] = prodobj.product_id;
    prod_obj["skus"] = prodobj.trans_sku_lists;
    prod_skus.push(prod_obj);
  });
  let overlaparr = [];
  let overlaprows = await models.sale_discount.findAll({
    attributes: ["product_ids"],
    where: {
      is_active: true,
      product_ids: {
        [Op.overlap]: skulist,
      },
    },
  });
  overlaprows.forEach((rows) => {
    let ovelapelemets = intersect(skulist, overlaprows[0].product_ids);
    overlaparr = overlaparr.concat(ovelapelemets);
    overlaparr = overlaparr.filter(
      (item, pos) => overlaparr.indexOf(item) === pos
    );
  });

  function intersect(a, b) {
    return a.filter(Set.prototype.has, new Set(b));
  }
  // if(overlaprows.length > 0)
  // {
  //   res.send(200,{"products":overlaparr})

  // }else{
  let titletext =
    prod_skus.length +
    " Products " +
    skulist.length +
    " skus and " +
    overlaparr.length +
    " overlapskus";
  res.send(200, {
    products: prodlist,
    skus: skulist,
    eror_skus: overlaparr,
    title: titletext,
  });

  //  }
};
