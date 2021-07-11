const models = require("./../models");
import "dotenv/config";
import { sendMail } from "./notify/user_notify";
import { write } from "fs";
const Op = require("sequelize").Op;
var Sequelize = require("sequelize");
const uuidv1 = require("uuid/v1");
var fs = require("fs");

const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(
  "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"
);
exports.priceupdate = (req, res) => {
  console.log("test");
  clearlog();

  function writelog(message) {
    console.log("test12");

    message = message + "\n";
    fs.appendFile("./price_update.txt", message, (err) => {
      if (err) console.log(err);
      console.log("Successfully Written to File.");
    });
  }
  function clearlog() {
    fs.writeFile("./price_update.txt", "", function () {
      console.log("done");
    });
  }
  var skuwhereclause = {};
  var costprice = 0;
  var sellingprice = 0;
  var product_obj = {};
  var responseobj = {};
  var pricesplitup = [];
  var products = [];
  var product_ids = [];
  var pricing_comp = [];
  var discount_percentage = 0;
  var processed_product_count = 0;
  var completedproducts = [];
  var price_running_id = 0;
  const {
    req_product_id,
    generatedSku,
    history_id,
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
    // product_id: {
    //   [Op.iLike]:'%SR0010%'
    // }
  };
  price_running_id = history_id;
  console.log(":>>>>>>>>>1212");
  var product_id_arr1 = [];
  var startDate = new Date();
  console.log(new Date());
  if (!pricingcomponent) {
    res.send(200, { message: "success" });
  } else {
    res.send(200, { message: "Price Running" });
  }
  if (req_product_id) {
    if (Array.isArray(req_product_id)) {
      product_id_arr1 = req_product_id;
    } else {
      product_id_arr1 = req_product_id.split(",");
    }
    // whereclause1 = {
    //   product_id : req_product_id

    // }
    whereclause1 = {
      product_id: {
        [Op.in]: product_id_arr1,
      },
    };
  }

  updatehistory();
  async function updatehistory() {
    if (!price_running_id) {
      let response = await models.price_running_history.create({
        pricing_component: pricingcomponent,
        product_ids: product_id_arr1.join(","),
        total_product: product_id_arr1.length,
        createdAt: new Date(),
      });
      price_running_id = response.id;
      // res.send(200,{
      //   pricing_component : pricingcomponent,
      //   product_ids: product_id_arr1,
      //   response,
      //   total_product : product_id_arr1.length,
      //   createdAt : new Date()
      // })
    } else {
      let component_history = await models.price_running_history.findOne({
        where: {
          id: price_running_id,
        },
      });
      var ccompleted_product_ids = component_history.completed_products;

      if (ccompleted_product_ids) {
        completedproducts = ccompleted_product_ids.split(",");
      }
      // res.send(200,{
      //   pricing_component : pricingcomponent,
      //   product_ids: product_id_arr1,
      //   total_product : product_id_arr1.length,
      //   completed_product : completedproducts.length,
      //   createdAt : new Date()
      // })
    }
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

  // if(pricingcomponent)
  // {
  //   pricingcomponent.forEach(element => {
  //       pricing_comp.push(element)
  //   })
  // }

  let purity_arr = [];

  if (purity) {
    metalpurity.forEach((element) => {
      purity_arr.push(element.alias);
    });
    skuwhereclause["purity"] = {
      [Op.in]: purity_arr,
    };
  }
  let sku_size_arr = [];
  if (sizes) {
    sizes.forEach((elemet) => {
      sku_size_arr.push(elemet.sku_size);
    });
    skuwhereclause["sku_size"] = {
      [Op.in]: sku_size_arr,
    };
  }
  if (generatedSku) {
    skuwhereclause["generated_sku"] = {
      [Op.eq]: generatedSku,
    };
  }
  // skuwhereclause['generated_sku'] = {
  //   [Op.eq] : 'SR0010-14130000-12'
  // }
  // skuwhereclause['discount_price'] = {
  //   [Op.eq] : 25
  // }
  // skuwhereclause['is_active'] = {
  //   [Op.eq] : true
  // }
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

  console.log(">>>>");
  console.log(JSON.stringify(product_type_arr));

  // if(pricingcomponent !== 'updateskuprice')
  // {

  //   whereclause1['$product_materials.material_name$'] = {
  //       [Op.eq] : pricingcomponent
  //     }
  // }

  const msg = {
    to: "manokarantk@gmail.com",
    subject: "Pricing update started",
    from: "info@ustimeapp.com",
    html: "<b>started</>",
  };
  //  sgMail.send(msg);
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
      offset: 0,
    })
    .then((product) => {
      products = product;
      console.log(">>>>>>>" + JSON.stringify(product.length));

      // pricingresult()
      //res.send(200, products[0]);
      processproduct();
    });
  var start = 0;
  async function processproduct() {
    if (products.length > processed_product_count) {
      start = new Date();

      let currentproduct = products[processed_product_count];
      product_ids.push(currentproduct.product_id);
      product_obj = await models.product_lists.findOne({
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
              "cost_price",
              "selling_price",
            ],
            where: skuwhereclause,
          },
          {
            model: models.product_materials,
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
            model: models.product_gemstones,
            attributes: ["gemstone_type", "stone_count", "stone_weight"],
          },
        ],
        where: {
          product_id: currentproduct.product_id,
        },
      });

      // product_obj = products[processed_product_count]
      if (product_obj) {
        if (product_obj.trans_sku_lists.length > 0) {
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
      if (pricingcomponent) {
        var emilreceipiants = [
          { to: "manokarantk@gmail.com" },
          { to: "dineshtawker@gmail.com" },
        ];
        if (pricingcomponent) {
        }
        //   sendMail(emilreceipiants,JSON.stringify(product_ids))

        // res.send(200,{message:"success"})
      }
      const msg = {
        to: "manokarantk@gmail.com",
        subject: "Pricing update finished",
        from: "info@ustimeapp.com",
        html: "<b>ended</>",
      };
      //  sgMail.send(msg);
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
              //  isskuexist()
              product_gemstone(
                product_obj.vendor_code,
                product_obj.product_gemstones
              );
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
  function materialmarkupval(sellingprice_val, product_val, sku_val) {
    console.log("==============");
    console.log(product_val.product_type);
    console.log(product_val.product_materials[0].material_name);
    console.log("==============");
    let whereclause = {
      selling_price_min: {
        [Op.lte]: sellingprice_val,
      },
      selling_price_max: {
        [Op.gte]: sellingprice_val,
      },
      category: product_val.product_category,
    };
    let product_type = [];
    let purities = [];
    if (product_val.product_type) {
      product_type.push(product_val.product_type);
      whereclause["product_type"] = {
        [Op.contains]: product_type,
      };
    }
    if (sku_val.purity) {
      let pur = sku_val.purity;
      purities.push(pur.replace(".", "").replace("K", ""));
      whereclause["purities"] = {
        [Op.contains]: purities,
      };
    }
    purities;
    if (
      product_val.product_materials &&
      product_val.product_materials.length > 0
    ) {
      let material_content = [];
      product_val.product_materials.forEach((mat_obj) => {
        material_content.push(mat_obj.material_name);
      });
      // whereclause['product_material'] = {
      //   [Op.in] : material_content
      // }
    }
    try {
      const priceMarkup = models.pricing_markup.findAll({
        where: whereclause,
      });
      return priceMarkup;
    } catch (error) {
      console.error(error);
    }
    // const priceMarkup = models.pricing_markup.findAll({
    //   where: whereclause,
    // });
    // return priceMarkup;
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

    console.log("processlength" + product_obj.trans_sku_lists.length);
    if (pricingcomponent) {
      if (product_obj.iscomponentpricing) {
        console.log("componentproce");
        updateskuprice();
      } else {
        checkisinclude();
      }
    } else {
      if (product_obj.iscomponentpricing) {
        console.log("componentproce");

        updateskuprice();
      } else {
        updatediamondprice(productobj.vendor_code, productskus[0]);
      }
    }
    //updateskuprice()
    // updategoldprice(productobj.vendor_code, productskus[0])
    function checkisinclude() {
      if (pricingcomponent === "Diamond") {
        updatediamondprice(productobj.vendor_code, productskus[0]);
      }
      if (pricingcomponent === "Gemstone") {
        updategemstone_price(product_obj.vendor_code, productskus[skucount]);
      }
      if (pricingcomponent === "Gold") {
        updategoldprice(product_obj.vendor_code, productskus[skucount]);
      }
      if (pricingcomponent === "Making Charge") {
        // updategoldprice(product_obj.vendor_code, productsku)
        makingcharge(product_obj.vendor_code);
      }
      if (pricingcomponent === "updateskuprice") {
        updateskuprice();
      }
    }

    async function updatediamondprice(vendor_code, productsku) {
      console.log("log diamond update");
      var diamondlists = [];

      var costprice_diamond = 0;
      var sellingprice_diamond = 0;
      var processcount = 0;
      var diamondprice1 = [];
      var ispriceedit = true;

      sku_component_count = 0;
      var pricing_diamonds_list = [];
      let product_diamonds = await productdiamonds(productsku.product_id);
      diamond_component_count = product_diamonds.length;
      if (product_diamonds.length > 0) {
        diamond_process(product_diamonds[0], vendor_code);
      } else {
        if (pricingcomponent === "Diamond") {
          isskuexist();
        } else {
          updategemstone_price(product_obj.vendor_code, productsku);
        }
      }

      function diamond_process(diamondobj, vendorcode) {
        console.log(JSON.stringify(diamondobj));

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

              let materialname =
                diamondobj.diamond_clarity + "" + diamondobj.diamond_colour;
              processcount++;

              var diamondmargin =
                ((diamondsellingprice - diamondcost) / diamondcost) * 100;
              var diamondprice = {
                component:
                  "diamond" + processcount + "_" + product_obj.product_id,
                material_name: materialname,
                //id: uuidv1(),
                margin_percentage: diamondmargin,
                cost_price: diamondcost,
                selling_price: diamondsellingprice,
                markup: diamondsellingprice,
                discount_price: diamondsellingprice,
                product_id: product_obj.product_id,
                //   product_sku: productsku.generated_sku
              };
              diamondlists.push(diamondprice);
              //  console.log(JSON.stringify(diamondlists))

              // isdiamondexist()

              models.pricing_sku_materials
                .findOne({
                  where: {
                    product_id: product_obj.product_id,
                    material_name: materialname,
                    component: diamondprice.component,
                  },
                })
                .then((price_splitup_model) => {
                  if (price_splitup_model) {
                    let whereclause_markup = {};
                    if (pricingcomponent) {
                      whereclause_markup = {
                        where: {
                          product_id: product_obj.product_id,
                          component: diamondprice.component,
                        },
                      };
                    } else {
                      whereclause_markup = {
                        where: {
                          product_id: product_obj.product_id,
                          component: diamondprice.component,
                        },
                      };
                    }
                    // isdiamondexist()
                    models.pricing_sku_materials
                      .update(diamondprice, whereclause_markup)
                      .then((updatedmakingchargeprice) => {
                        isdiamondexist();
                      })
                      .catch((reason) => {
                        isdiamondexist();
                      });
                  } else {
                    console.log("++++++++++++");
                    // isdiamondexist()
                    updateskudiamondprice();
                  }
                });

              async function updateskudiamondprice() {
                pricing_diamonds_list = [];
                product_obj.trans_sku_lists.forEach((skuobj) => {
                  if (skuobj.diamond_type === diamondprice.material_name) {
                    var diamondobj = {
                      component: diamondprice.component,
                      material_name: diamondprice.material_name,
                      id: uuidv1(),
                      margin_percentage: diamondprice.margin_percentage,
                      cost_price: diamondprice.cost_price,
                      selling_price: diamondprice.selling_price,
                      markup: diamondprice.markup,
                      discount_price: diamondprice.discount_price,
                      product_id: product_obj.product_id,
                      product_sku: skuobj.generated_sku,
                    };
                    pricing_diamonds_list.push(diamondobj);
                  }
                });
                console.log(pricing_diamonds_list);
                //  isdiamondexist()
                models.pricing_sku_materials
                  .bulkCreate(pricing_diamonds_list, { individualHooks: true })
                  .then((result) => {
                    isdiamondexist();
                  })
                  .catch((error) => {
                    console.log(error.mes);
                    isdiamondexist();
                  });

                //res.send(200, {"sku_pricing": pricing_diamonds_list})
              }

              function isdiamondexist() {
                //  processcount = processcount +1;

                if (product_diamonds.length > processcount) {
                  // console.log("diamondname")
                  // console.log(JSON.stringify(product_diamonds[processcount]))

                  diamond_process(product_diamonds[processcount], vendorcode);
                } else {
                  //  updateskuprice()
                  // updateskuprice()
                  if (pricingcomponent === "Diamond") {
                    //  processed_product_count = processed_product_count  + 1;
                    //  processproduct();
                    isskuexist();
                    //res.send(200,{diamondlists})

                    // res.send(200,{"diamondprice":diamondlists,"diamondcount":diamond_component_count})
                  } else {
                    updategemstone_price(product_obj.vendor_code, productsku);
                  }
                  //  isskuexist()
                }
              }

              //  });
            } else {
              console.log("prices updated");
            }
          });
      }
    }

    async function updategemstone_price(vendor_code, productsku) {
      console.log("log gemstone update");

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
        //checkisinclude()
        // isskuexist()
        if (pricingcomponent === "Gemstone") {
          isskuexist();
        } else {
          updategoldprice(product_obj.vendor_code, productsku);
        }
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
              //id: uuidv1(),
              margin_percentage: gemstonemargin,
              cost_price: gemstonecost,
              selling_price: gemstonesell,
              markup: gemstonesell,
              discount_price: gemstonesell,
              //product_sku: productsku.generated_sku,
              //  product_id: product_obj.product_id
            };
            console.log("gemsotoneobjec");
            console.log(">>>>>>>><<<<<<<<<<<");
            models.pricing_sku_materials
              .findOne({
                where: {
                  product_id: product_obj.product_id,
                  component: gemstoneprice.component,
                },
              })
              .then((price_splitup_model) => {
                if (price_splitup_model) {
                  let jsonob = {
                    product_id: product_obj.product_id,
                    component: gemstoneprice.component,
                    material_name: gemstoneprice.material_name,
                  };
                  console.log("i am model data");
                  console.log(JSON.stringify(jsonob));
                  var gemstonemargin1 =
                    ((gemstonesell - gemstonecost) / gemstonecost) * 100;
                  console.log(JSON.stringify(gemstonesell));
                  console.log(JSON.stringify(price_splitup_model.markup));
                  console.log(JSON.stringify(gemstonecost));

                  console.log(JSON.stringify(gemstonemargin1));

                  gemstoneprice["margin_percentage"] = gemstonemargin1;
                  models.pricing_sku_materials
                    .update(gemstoneprice, {
                      where: {
                        product_id: product_obj.product_id,
                        component: gemstoneprice.component,
                        material_name: gemstoneprice.material_name,
                      },
                    })
                    .then((updatedmakingchargeprice) => {
                      console.log("i am here");
                      console.log(JSON.stringify(updatedmakingchargeprice));
                      isgemstoneexist();
                    })
                    .catch((reason) => {
                      console.log("i am here for error");

                      isgemstoneexist();
                    });
                } else {
                  console.log("i am non model data");
                  var gemlist = [];
                  product_obj.trans_sku_lists.forEach((skuobj) => {
                    gemstoneprice = {
                      component: gemstoneprice.component,
                      material_name: gemstoneprice.material_name,
                      id: uuidv1(),
                      margin_percentage: gemstoneprice.margin_percentage,
                      cost_price: gemstoneprice.cost_price,
                      selling_price: gemstoneprice.selling_price,
                      markup: gemstoneprice.markup,
                      discount_price: gemstoneprice.discount_price,
                      product_sku: skuobj.generated_sku,
                      product_id: skuobj.product_id,
                    };

                    gemlist.push(gemstoneprice);
                  });
                  models.pricing_sku_materials
                    .bulkCreate(gemlist, { individualHooks: true })
                    .then((result) => {
                      isgemstoneexist();
                    })
                    .catch((error) => {
                      isgemstoneexist();
                    });
                  // models.pricing_sku_materials.create(gemstoneprice).then((result) => {
                  //   isgemstoneexist()
                  // })
                  // .catch((error) => {

                  //   isgemstoneexist()
                  // });
                }
                // isgemstoneexist()
              });
          });
        function isgemstoneexist() {
          console.log("gem count");
          console.log(gemstone_count);
          console.log(product_gemstones.length);
          if (product_gemstones.length > gemstone_count) {
            gemstone_process(
              product_gemstones[gemstone_count],
              product_obj.vendor_code
            );
          } else {
            // isskuexist()
            //  checkisinclude();
            if (pricingcomponent === "Gemstone") {
              skucount = product_obj.trans_sku_lists.length;
              isskuexist();
            } else {
              updategoldprice(product_obj.vendor_code, productsku);
            }
          }
        }
      }
    }

    function updategoldprice(vendorcode, skuobj) {
      console.log("log gold update");

      var purityval = skuobj.purity;

      models.gold_price_settings
        .findOne({
          where: {
            vendor_code: product_obj.vendor_code,
            purity: parseInt(purityval.replace("K", "").replace(".", "")),
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
                      // checkisinclude()
                      checkpricecomponent();
                    })
                    .catch((reason) => {
                      // checkisinclude()

                      checkpricecomponent();
                    });
                } else {
                  models.pricing_sku_metals
                    .create(goldprice)
                    .then((result) => {
                      checkpricecomponent();
                      //checkisinclude()
                    })
                    .catch((error) => {
                      //checkisinclude()

                      checkpricecomponent();
                    });
                }
              });
          } else {
            //   checkisinclude()

            checkpricecomponent();
          }
        });

      function checkpricecomponent() {
        makingcharge(vendorcode);
      }
    }

    function makingcharge(vendorcode) {
      var mkcostprice = 0;
      var mksellingprice = 0;
      let skuobj = product_obj.trans_sku_lists[skucount];

      var skupurity = skuobj.purity;
      console.log("log mkcharge update");
      models.making_charge_settings
        .findAll({
          where: {
            vendor_code: vendorcode,
            purity: parseInt(skupurity.replace("K", "").replace(".", "")),
            material: "Gold",
            weight_start: {
              [Op.lte]: skuobj.sku_weight,
            },
            weight_end: {
              [Op.gte]: skuobj.sku_weight,
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
                  mksellingprice = skuobj.sku_weight * makingcharge_obj.price;
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
                    mksellingprice = skuobj.sku_weight * makingcharge_obj.price;
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
              product_sku: skuobj.generated_sku,
            };

            models.pricing_sku_metals
              .findOne({
                where: {
                  product_sku: skuobj.generated_sku,
                  material_name: "makingcharge",
                },
              })
              .then((price_splitup_model) => {
                if (price_splitup_model) {
                  price_splitup_model
                    .update(makingprice)
                    .then(async (updatedmakingchargeprice) => {
                      console.log("log1");
                      // if(product_obj.trans_sku_lists.length > skucount)
                      // {
                      //   isskuexist()

                      // }else{
                      //   processproduct()
                      // }
                      // isskuexist()
                      checkcomponentmakingcharge();
                    })
                    .catch((reason) => {
                      //  res.send(200,{"message":reason.message,price_splitup_model});
                      console.log("log2");

                      // isskuexist()
                      checkcomponentmakingcharge();
                    });
                } else {
                  models.pricing_sku_metals
                    .create(makingprice)
                    .then(async (result) => {
                      console.log("log3");

                      //isskuexist()
                      // gemstonesell = calculatesellingmarkup(gemstonemarkup, gemstonesell)
                      checkcomponentmakingcharge();
                    })
                    .catch((error) => {
                      console.log("log4");
                      //isskuexist()
                      checkcomponentmakingcharge();
                    });
                }
              });
          } else {
            console.log("log5");
            checkcomponentmakingcharge();
            //isskuexist()
          }
        });

      function checkcomponentmakingcharge() {
        if (pricingcomponent === "Gold") {
          isskuexist();
        } else {
          updateskuprice();
        }
      }
    }
    function getmaterialmarkupsum(skuvalue) {
      return models.pricing_sku_materials.findOne({
        attributes: [
          [Sequelize.literal("SUM(markup)"), "markup"],
          [Sequelize.literal("SUM(discount_price)"), "discount_price"],
        ],
        where: {
          product_sku: skuvalue,
        },
      });
    }
    function getmetalmarkupsum(skuvalue) {
      return models.pricing_sku_metals.findOne({
        attributes: [
          [Sequelize.literal("SUM(markup)"), "markup"],
          [Sequelize.literal("SUM(discount_price)"), "discount_price"],
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
          [Sequelize.literal("SUM(cost_price)"), "cost_price"],
          [Sequelize.literal("SUM(selling_price)"), "selling_price"],
        ],
        group: ["material_name"],
        where: {
          product_sku: productskus[skucount].generated_sku,
        },
      });

      let material_price_obj = await models.pricing_sku_materials.findAll({
        attributes: [
          "component",
          [Sequelize.literal("SUM(cost_price)"), "cost_price"],
          [Sequelize.literal("SUM(selling_price)"), "selling_price"],
        ],
        group: "component",
        where: {
          product_sku: productskus[skucount].generated_sku,
        },
      });
      var goldsellingprice = 0;
      var makingsellingprice = 0;
      var diamondsellingprice = 0;
      var gemstonesellingprice = 0;
      var diamond_component_count = 0;
      var gemstone_component_count = 0;
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
          diamondsellingprice = metal_price.selling_price;
        }
        if (metal_name.includes("gemstone")) {
          if (coponentarray.indexOf("gemstone") == -1) {
            coponentarray.push("gemstone");
          }
          gemstonesellingprice = metal_price.selling_price;
          gemstone_component_count++;
        }
      });
      console.log("==============");
      console.log(total_costprice);
      console.log(productskus[skucount].purity);
      console.log("==============");

      sku_component_count = coponentarray.length;
      let iscontainall = false;
      let sku_margin =
        ((total_sellingprice - total_costprice) / total_costprice) * 100;
      let markupobj = await materialmarkupval(
        total_sellingprice,
        product_obj,
        productskus[skucount]
      );
      if (markupobj) {
        markupobj.forEach((mItem) => {
          if (mItem.material == "All") {
            iscontainall = true;
          }
        });
      }
      var goldmarkupvalue = goldsellingprice;
      let skus_arrr = [];
      var discounttitle = "";
      skus_arrr.push(productskus[skucount].generated_sku);
      let disscount_obj = {};
      let discounts_arr = await models.sale_discount.findAll({
        where: {
          is_active: true,
          product_ids: {
            [Op.contains]: skus_arrr,
          },
        },
      });

      discounts_arr.forEach((discount) => {
        let componentname = discount.components;
        discounttitle = discount.discount_title;
        componentname.forEach((comp) => {
          disscount_obj[comp] = {
            value: discount.discount_value,
            ispercent: discount.discount_type,
          };
        });
      });

      var mkcharge_discount = 0;
      var diamond_discount = 0;
      var gemstone_discount = 0;
      var metal_discount = 0;
      if (disscount_obj["Making Charge"] || disscount_obj["All"]) {
        if (disscount_obj["Making Charge"]) {
          mkcharge_discount = disscount_obj["Making Charge"].value
            ? disscount_obj["Making Charge"].value
            : 0;
        } else {
          mkcharge_discount = disscount_obj["All"].value
            ? disscount_obj["All"].value
            : 0;
        }
      }
      if (disscount_obj["Diamond"] || disscount_obj["All"]) {
        if (disscount_obj["Diamond"]) {
          diamond_discount = disscount_obj["Diamond"].value
            ? disscount_obj["Diamond"].value
            : 0;
        } else {
          diamond_discount = disscount_obj["All"].value
            ? disscount_obj["All"].value
            : 0;
        }
      }
      if (disscount_obj["Gemstone"] || disscount_obj["All"]) {
        if (disscount_obj["Gemstone"]) {
          gemstone_discount = disscount_obj["Gemstone"].value
            ? disscount_obj["Gemstone"].value
            : 0;
        } else {
          gemstone_discount = disscount_obj["All"].value
            ? disscount_obj["All"].value
            : 0;
        }
      }
      if (disscount_obj["Gold"] || disscount_obj["All"]) {
        if (disscount_obj["Gold"]) {
          metal_discount = disscount_obj["Gold"].value
            ? disscount_obj["Gold"].value
            : 0;
        } else {
          metal_discount = disscount_obj["All"].value
            ? disscount_obj["All"].value
            : 0;
        }
      }

      var makingchargemarkupvalue = makingsellingprice;
      var makingchargediscountvalue =
        (makingchargemarkupvalue * 100) / (100 - mkcharge_discount);
      var diamondmarkupvalue = diamondsellingprice;
      var gemstonemarkupvalue = gemstonesellingprice;

      var gemstonediscountvalue =
        (gemstonesellingprice * 100) / (100 - gemstone_discount);
      var diamonddiscountvalue =
        (diamondsellingprice * 100) / (100 - diamond_discount);

      if (markupobj && markupobj.length > 0) {
        //updatemarkup(markupobj[0])
        var processmarkup = 0;
        // async function updatemarkup(markup){
        markupobj.forEach(async (markup) => {
          var queryarray = "";
          if (iscontainall) {
            if (markup.material == "All") {
              if (total_costprice == 0) {
                let alldiscount = 0;
                if (disscount_obj["All"]) {
                  alldiscount = disscount_obj["All"].value
                    ? disscount_obj["All"].value
                    : 0;
                }
                var query =
                  "UPDATE trans_sku_lists SET markup_price = (selling_price + (selling_price *" +
                  markup.markup_value +
                  "/100)) where generated_sku ='" +
                  productskus[skucount].generated_sku +
                  "'";
                await models.sequelize
                  .query(query)
                  .then(([results, metadata]) => {});
                var query1 =
                  "UPDATE trans_sku_lists SET discount_price = (markup_price - (markup_price *" +
                  alldiscount +
                  "/100))  where generated_sku ='" +
                  productskus[skucount].generated_sku +
                  "'";
                await models.sequelize
                  .query(query1)
                  .then(([results, metadata]) => {});
              } else {
                goldmarkupvalue =
                  goldsellingprice +
                  goldsellingprice * (markup.markup_value / 100);
                var query =
                  "UPDATE pricing_sku_metals SET markup = (selling_price + (selling_price *" +
                  markup.markup_value +
                  "/100)), discount_price = (selling_price + (selling_price *" +
                  markup.markup_value +
                  "/100)) where product_sku ='" +
                  productskus[skucount].generated_sku +
                  "' and material_name = 'goldprice'";
                await models.sequelize
                  .query(query)
                  .then(([results, metadata]) => {});

                makingchargemarkupvalue =
                  makingsellingprice +
                  makingsellingprice * (markup.markup_value / 100);
                makingchargediscountvalue =
                  (makingchargemarkupvalue * 100) / (100 - mkcharge_discount);

                var query =
                  "UPDATE pricing_sku_metals SET markup = (selling_price + (selling_price *" +
                  markup.markup_value +
                  "/100)) where product_sku ='" +
                  productskus[skucount].generated_sku +
                  "' and material_name = 'makingcharge'";
                await models.sequelize
                  .query(query)
                  .then(([results, metadata]) => {});

                gemstonemarkupvalue =
                  gemstonesellingprice +
                  gemstonesellingprice * (markup.markup_value / 100);
                gemstonediscountvalue =
                  (gemstonemarkupvalue * 100) / (100 - gemstone_discount);
                var query =
                  "UPDATE pricing_sku_materials SET markup = (selling_price + (selling_price *" +
                  markup.markup_value +
                  "/100)) where product_sku ='" +
                  productskus[skucount].generated_sku +
                  "' and component LIKE 'gemstone%'";
                await models.sequelize
                  .query(query)
                  .then(([results, metadata]) => {
                    // Results will be an empty array and metadata will contain the number of affected rows.
                  });

                diamondmarkupvalue =
                  diamondsellingprice +
                  diamondsellingprice * (markup.markup_value / 100);
                console.log("log diamond");
                console.log(productskus[skucount].generated_sku);
                diamonddiscountvalue =
                  (diamondmarkupvalue * 100) / (100 - diamond_discount);

                var query =
                  "UPDATE pricing_sku_materials SET markup = (selling_price + (selling_price *" +
                  markup.markup_value +
                  "/100)) where product_sku ='" +
                  productskus[skucount].generated_sku +
                  "' and component LIKE 'diamond%'";

                await models.sequelize
                  .query(query)
                  .then(([results, metadata]) => {
                    // Results will be an empty array and metadata will contain the number of affected rows.
                  });
              }
            }
          } else {
            if (markup.material == "Gold") {
              goldmarkupvalue =
                goldsellingprice +
                goldsellingprice * (markup.markup_value / 100);
              queryarray =
                "UPDATE pricing_sku_metals SET markup = (selling_price + (selling_price *" +
                markup.markup_value +
                "/100)), discount_price = (selling_price + (selling_price *" +
                markup.markup_value +
                "/100)) where product_sku ='" +
                productskus[skucount].generated_sku +
                "' and material_name = 'goldprice'";
              await models.sequelize
                .query(queryarray)
                .then(([results, metadata]) => {
                  console.log(JSON.stringify(results));
                  console.log(metadata);
                });
            }

            if (markup.material == "Making Charge") {
              makingchargemarkupvalue =
                makingsellingprice +
                makingsellingprice * (markup.markup_value / 100);
              makingchargediscountvalue =
                (makingchargemarkupvalue * 100) / (100 - mkcharge_discount);

              queryarray =
                "UPDATE pricing_sku_metals SET markup = (selling_price + (selling_price *" +
                markup.markup_value +
                "/100)) where product_sku ='" +
                productskus[skucount].generated_sku +
                "' and material_name = 'makingcharge'";

              await models.sequelize
                .query(queryarray)
                .then(([results, metadata]) => {});
            }
            if (markup.material == "Gem Stone") {
              gemstonemarkupvalue =
                gemstonesellingprice +
                gemstonesellingprice * (markup.markup_value / 100);
              gemstonediscountvalue =
                (gemstonemarkupvalue * 100) / (100 - gemstone_discount);
              queryarray =
                "UPDATE pricing_sku_materials SET markup = (selling_price + (selling_price *" +
                markup.markup_value +
                "/100)) where product_sku ='" +
                productskus[skucount].generated_sku +
                "' and component LIKE 'gemstone%'";
              await models.sequelize
                .query(query)
                .then(([results, metadata]) => {
                  // Results will be an empty array and metadata will contain the number of affected rows.
                });
            }

            if (markup.material == "Diamond") {
              diamondmarkupvalue =
                diamondsellingprice +
                diamondsellingprice * (markup.markup_value / 100);

              queryarray =
                "UPDATE pricing_sku_materials SET markup = (selling_price + (selling_price *" +
                markup.markup_value +
                "/100)) where product_id ='" +
                productskus[skucount].product_id +
                "' and component LIKE 'diamond%'";
              await models.sequelize
                .query(queryarray)
                .then(([results, metadata]) => {
                  // Results will be an empty array and metadata will contain the number of affected rows.
                });
            }
          }
          if (iscontainall) {
          } else {
            console.log("log diamond");
            console.log("=====resultsdiamonds=========");
            console.log(queryarray);

            console.log("=======fsdf=======");
          }
          processmarkup = processmarkup + 1;
          if (markupobj.length > processmarkup) {
            //updatemarkup(markupobj[processmarkup])
          }
        });
      } else {
        var query =
          "UPDATE trans_sku_lists SET markup_price = selling_price   where generated_sku ='" +
          productskus[skucount].generated_sku +
          "'";
        await models.sequelize.query(query).then(([results, metadata]) => {});
      }

      var golddiscountvalue = (goldmarkupvalue * 100) / (100 - metal_discount);

      var golddiscount_different = golddiscountvalue - goldmarkupvalue;

      var total_sku_discountvalue =
        golddiscountvalue +
        makingchargediscountvalue +
        diamonddiscountvalue +
        gemstonediscountvalue;

      var golddiscount_percentage = golddiscountvalue / total_sku_discountvalue;
      var makingcharge_percentage =
        makingchargediscountvalue / total_sku_discountvalue;
      if (isNaN(makingcharge_percentage)) {
        makingcharge_percentage = 0;
      }

      var diamond_percentage = diamonddiscountvalue / total_sku_discountvalue;
      var gemstone_percentage = gemstonediscountvalue / total_sku_discountvalue;

      var discount_price_distribute_percentage =
        golddiscount_percentage / sku_component_count;
      if (isNaN(discount_price_distribute_percentage)) {
        discount_price_distribute_percentage = 0;
      }
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

      var mkquery =
        "UPDATE pricing_sku_metals SET discount_price = ((markup * 100) /(100 - " +
        mkcharge_discount +
        ") + (" +
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
      console.log("=========diamond_discountdiscountvalue=====");
      console.log(JSON.stringify(diamond_component_count));
      console.log("==============");
      if (diamond_component_count > 0) {
        var materialquery =
          "UPDATE pricing_sku_materials SET discount_price = ((markup * 100) /(100 - " +
          diamond_discount +
          ") + (" +
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
      if (gemstone_component_count > 0) {
        var materialquery =
          "UPDATE pricing_sku_materials SET discount_price = ((markup * 100) /(100 - " +
          gemstone_discount +
          ") + (" +
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

      let taxobj = await models.master_tax_settings.findOne({
        where: {
          hsn_number: product_obj.hsn_number,
        },
      });
      // let taxobj = {
      //   tax_value : 3
      // }

      let taxval = 3;
      if (taxobj) {
        taxval = taxobj.tax_value ? parseInt(taxobj.tax_value) : 3;
      }

      // res.send(200,{materialsum, matalsum})
      const costpricetax = (total_costprice * taxval) / 100;
      const sellingpricetax = (total_sellingprice * taxval) / 100;

      let skumarkup = materialsum.markup + matalsum.markup;
      let skudiscount = materialsum.discount_price + matalsum.discount_price;
      const markuppricetax = (skumarkup * taxval) / 100;
      const discountpricetax = (skudiscount * taxval) / 100;
      if (total_costprice > 0) {
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
          discount_desc: discounttitle,
        };

        // res.send(200,{"material":materialsum,"metal":matalsum});
        models.trans_sku_lists
          .update(transskuobj, {
            where: { generated_sku: productskus[skucount].generated_sku },
          })
          .then((price_splitup_model) => {
            isskuexist();
          })
          .catch((reason) => {
            console.log(reason);
          });
      } else {
        isskuexist();
      }

      //     });
      // });
    }
    function updatemarkupvalue(query) {}

    async function sleep(millis) {
      return new Promise((resolve) => setTimeout(resolve, millis));
    }

    async function isskuexist() {
      // Sequelize.close()
      skucount = skucount + 1;
      console.log("processsku" + skucount);
      console.log("processsku" + product_obj.trans_sku_lists.length);

      if (product_obj.trans_sku_lists.length > skucount) {
        //checkisinclude()
        if (pricingcomponent) {
          checkisinclude();
        } else {
          if (skucount > 0) {
            updategoldprice(
              product_obj.vendor_code,
              product_obj.trans_sku_lists[skucount]
            );
          } else {
            updatediamondprice(
              product_obj.vendor_code,
              product_obj.trans_sku_lists[skucount]
            );
          }
        }
      } else {
        //skucount = 0
        var endDate = new Date();
        var seconds = (endDate.getTime() - startDate.getTime()) / 1000;
        startDate = new Date();
        console.log("processtime" + seconds);
        if (pricingcomponent) {
          writelog(pricingcomponent);
          writelog(product_obj.product_id);
        }

        processed_product_count = processed_product_count + 1;

        console.log(JSON.stringify(product_ids));
        completedproducts.push(product_obj.product_id);
        let price_update_query =
          "update trans_sku_lists set cost_price = ROUND(cost_price::numeric,2),selling_price = ROUND(selling_price::numeric,2), markup_price = ROUND(markup_price::numeric,2),cost_price_tax = ROUND(cost_price_tax::numeric,2),selling_price_tax = ROUND(selling_price_tax::numeric,2),markup_price_tax = ROUND(markup_price_tax::numeric,2),discount_price_tax = ROUND(discount_price_tax::numeric,2), discount_price = ROUND(discount_price::numeric,2),discount= ROUND(((discount_price-markup_price)/discount_price) * 100)   where product_id ='" +
          product_obj.product_id +
          "' and discount_price > 0";

        await models.sequelize
          .query(price_update_query)
          .then(([results, metadata]) => {});
        let comp_products = completedproducts.join(",");
        await models.price_running_history.update(
          {
            completed_product_count: completedproducts.length,
            completed_products: comp_products,
          },
          {
            where: {
              id: price_running_id,
            },
          }
        );

        await sleep(1000);

        processproduct();
      }
    }
  }
  function calculatepercentage(priceval, percentageval) {
    return priceval + priceval * (percentageval / 100);
  }
};
