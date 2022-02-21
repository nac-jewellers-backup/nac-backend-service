const models = require("./../models");
import "dotenv/config";
const Op = require("sequelize").Op;
import apidata from "./apidata.json";
const uuidv1 = require("uuid/v1");
var splitArray = require("split-array");
var request = require("request");
exports.updateproduct_gender = async (req, res) => {
  var product_count = 0;
  var product_msters = await models.product_lists.findAll({
    attributes: ["product_id", "gender"],
  });
  res.send(200, { message: "success" });

  updatemetalcolor(product_count);
  async function updatemetalcolor(product_count) {
    var product_id = product_msters[product_count].product_id;
    var product_gender_obj = product_msters[product_count].gender;
    if (product_gender_obj) {
      var product_gender_arr = product_gender_obj.split(",");

      var product_gender = [];
      product_gender_arr.forEach((element) => {
        const product_colour = {
          id: uuidv1(),
          gender_name: element,
          product_id: product_id,
          is_active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        product_gender.push(product_colour);
      });
      await models.product_gender.bulkCreate(product_gender, {
        individualHooks: true,
      });
      product_count++;
      if (product_msters.length > product_count) {
        updatemetalcolor(product_count);
      } else {
        console.log("finished");
      }
    } else {
      product_count++;
      if (product_msters.length > product_count) {
        updatemetalcolor(product_count);
      } else {
        console.log("finished");
      }
    }
  }
};
exports.updateproduct_color = async (req, res) => {
  var product_count = 0;
  var product_msters = await models.product_lists.findAll({
    attributes: ["product_id"],
  });
  res.send(200, { message: "success" });

  updatemetalcolor(product_count);
  async function updatemetalcolor(product_count) {
    var product_id = product_msters[product_count].product_id;
    var product_colors = await models.trans_sku_lists.findAll({
      attributes: ["metal_color"],
      group: ["metal_color"],
      where: {
        product_id: product_id,
      },
    });
    var product_metal_colours = [];
    product_colors.forEach((element) => {
      const product_colour = {
        id: uuidv1(),
        product_color: element.metal_color,
        product_id: product_id,
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      product_metal_colours.push(product_colour);
    });
    await models.product_metalcolours.bulkCreate(product_metal_colours, {
      individualHooks: true,
    });
    product_count++;
    if (product_msters.length > product_count) {
      updatemetalcolor(product_count);
    } else {
      console.log("finished");
    }
  }
};
exports.updategemstonepricemaster = async (req, res) => {
  console.log("iamhere");
  var stonelist_str = req.body.gemstone;
  var stonelist_obj = JSON.parse(stonelist_str);
  var stones_arr = [];
  stonelist_obj.forEach((stoneobj) => {
    const occassion = {
      id: uuidv1(),
      gemstone_type: stoneobj.gemstone_type,
      vendor_code: stoneobj.vendor_code,
      weight_start: null,
      weight_end: null,
      rate_type: stoneobj.rate_type,
      price_type: stoneobj.price_type,
      selling_price_type: stoneobj.selling_price_type,
      price: stoneobj.price,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    stones_arr.push(occassion);
  });
  console.log(stones_arr.length);
  await models.gemstone_price_settings.bulkCreate(stones_arr, {
    individualHooks: true,
  });
};
exports.updateproductcreatedate = async (req, res) => {
  var product_count = 0;

  var stonecolor_str = req.body.Sheet3;
  var stonecolor_obj = JSON.parse(stonecolor_str);

  res.send(200, { message: 0 });
  updateskuattribute(stonecolor_obj[product_count]);

  async function updateskuattribute(product_obj) {
    // stonecolor_obj.forEach(async product_obj => {
    var product_sku = product_obj.sku;
    var sku_url = product_obj.sku_url;
    var sold_out = product_obj.sold_out;
    var issold = false;
    if (sold_out === "Y") {
      issold = true;
    }
    var isactive = product_obj.isactive;
    var is_active = false;
    if (isactive === "Y") {
      is_active = true;
    }
    var sku_id = product_obj.skuid;

    var query =
      "UPDATE trans_sku_lists SET is_active = " +
      is_active +
      ", is_soldout = " +
      issold +
      ", sku_id = '" +
      sku_id +
      "', sku_url = '" +
      sku_url +
      "' where generated_sku ='" +
      product_sku +
      "'";
    console.log(query);

    await models.sequelize.query(query).then(([results, metadata]) => {
      // Results will be an empty array and metadata will contain the number of affected rows.
    });
    product_count++;
    if (stonecolor_obj.length > product_count) {
      updateskuattribute(stonecolor_obj[product_count]);
    }
  }
  // })
  console.log("finished");
};
exports.updatedefaultimage = async (req, res) => {
  var product_count = 0;
  var product_msters = await models.product_lists.findAll({
    attributes: ["product_id"],
  });

  updatemetalcolor(product_count);
  async function updatemetalcolor(product_count) {
    var product_id = product_msters[product_count].product_id;

    var product_colors = await models.trans_sku_lists.findOne({
      attributes: ["metal_color"],

      where: {
        product_id: product_id,
        isdefault: true,
      },
    });

    if (product_colors && product_colors.metal_color) {
      var query1 =
        "UPDATE product_images SET isdefault = false where product_id ='" +
        product_id +
        "'";
      await models.sequelize.query(query1).then(([results, metadata]) => {
        // Results will be an empty array and metadata will contain the number of affected rows.
      });
      var query =
        "UPDATE product_images SET isdefault = true where product_id ='" +
        product_id +
        "' and product_color = '" +
        product_colors.metal_color +
        "'";
      await models.sequelize.query(query).then(([results, metadata]) => {
        // Results will be an empty array and metadata will contain the number of affected rows.
      });
    }

    product_count++;
    if (product_msters.length > product_count) {
      updatemetalcolor(product_count);
    } else {
      console.log("finished");
    }
  }
};

exports.updateproduct_purity = async (req, res) => {
  var product_count = 0;
  var product_msters = await models.product_lists.findAll({
    attributes: ["product_id"],
  });
  res.send(200, { message: "success" });

  updatemetalcolor(product_count);
  async function updatemetalcolor(product_count) {
    var product_id = product_msters[product_count].product_id;
    var product_colors = await models.trans_sku_lists.findAll({
      attributes: ["purity"],
      group: ["purity"],
      where: {
        product_id: product_id,
      },
    });
    var product_metal_colours = [];
    product_colors.forEach((element) => {
      const product_colour = {
        id: uuidv1(),
        purity: element.purity,
        product_id: product_id,
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      product_metal_colours.push(product_colour);
    });
    await models.product_purities.bulkCreate(product_metal_colours, {
      individualHooks: true,
    });
    product_count++;
    if (product_msters.length > product_count) {
      updatemetalcolor(product_count);
    } else {
      console.log("finished");
    }
  }
};
exports.viewskupricesummary = async (req, res) => {
  var response = {};
  models.trans_sku_lists
    .findOne({
      attributes: [
        "calc_type",
        "net_weight",
        "gross_weight",
        "cost_price",
        "selling_price",
        "markup_price",
        "discount_price",
        "sku_weight",
        "product_id",
        "cost_price_tax",
        "diamond_type",
        "markup_price_tax",
        "discount_price_tax",
        "margin_on_sale_percentage",
      ],
      where: {
        generated_sku: req.params.skuid,
      },
      raw: true,
    })
    .then((sku) => {
      if (!sku) {
        return res.status(204).send({ message: "No such sku found!" });
      }
      let { calc_type, net_weight, gross_weight, ...rest } = sku;
      let weightCalculationBy = calc_type;
      let weight = weightCalculationBy.includes("NET")
        ? net_weight
        : gross_weight;
      response["skuprice"] = rest;
      response["discount_percentage"] =
        ((sku.discount_price - sku.markup_price) * 100) / sku.discount_price;
      response["metals"] = response["materials"] = [];
      Promise.allSettled(
        ["pricing_sku_metals", "total_no_stone"].map(async (model) => {
          let price = await models[model].findAll({
            where: { product_sku: req.params.skuid },
            raw: true,
          });
          if (model == "pricing_sku_metals") {
            response.metals = price.map((item) => {
              return {
                ...item,
                selling_price: `${item.selling_price}(${Number(
                  item.selling_price / weight
                ).toFixed(2)} / gms)`,
              };
            });
          } else if (model == "total_no_stone") {
            response.materials = price.map((item) => {
              return {
                ...item,
                material_name: item.type.includes("diamond")
                  ? "Diamond"
                  : "Gemstone",
              };
            });
          }          
          return Promise.resolve(price);
        })
      )
        .then(() => {
          return res.status(200).send({ price_summary: response });
        })
        .catch((err) => {
          console.log(err);
          res.status(500).send({ ...err });
        });
    });
  // models.trans_sku_lists
  //   .findOne({
  //     include: [
  //       {
  //         model: models.product_lists,
  //         attributes: ["vendor_code"],
  //       },
  //     ],
  //     attributes: [
  //       "cost_price",
  //       "selling_price",
  //       "markup_price",
  //       "discount_price",
  //       "sku_weight",
  //       "product_id",
  //       "cost_price_tax",
  //       "diamond_type",
  //       "markup_price_tax",
  //       "discount_price_tax",
  //       "margin_on_sale_percentage",
  //     ],
  //     where: {
  //       generated_sku: req.params.skuid,
  //     },
  //   })
  //   .then(async (accs) => {
  //     response["skuprice"] = accs;
  //     var discount_percentage =
  //       ((accs.discount_price - accs.markup_price) / accs.discount_price) * 100;
  //     response["discount_percentage"] = discount_percentage;
  //     if (accs.sku_weight) {
  //       // accs['selling_price'] = accs.selling_price + " ( "+ accs.selling_price / accs.sku_weight+" ) ";
  //       // accs['cost_price'] = accs.cost_price + " ( "+ accs.cost_price / accs.sku_weight+" ) ";
  //     }
  //     let diamondetaial = await models.product_diamonds.findAll({
  //       where: {
  //         diamond_type: accs.diamond_type,
  //         product_sku: accs.product_id,
  //       },
  //     });
  //     let gemstonedetails = await models.product_gemstones.findAll({
  //       where: {
  //         product_sku: accs.product_id,
  //       },
  //     });
  //     // return res.send(200,{diamondetaial})
  //     models.pricing_sku_materials
  //       .findAll({
  //         where: {
  //           product_sku: req.params.skuid,
  //         },
  //       })
  //       .then((material_price) => {
  //         let diamond_count = 0;
  //         let material_prices = [];
  //         let diamondcount = 0;
  //         material_price.forEach((materialobj, index) => {
  //           if (materialobj.component.includes("diamond")) {
  //             if (diamondetaial[diamond_count]) {
  //               diamondcount = diamondcount + 1;
  //               console.log("dasdasdas");
  //               let diamond_name =
  //                 "Diamond " +
  //                 diamondetaial[diamond_count].diamond_type +
  //                 " " +
  //                 diamondcount;
  //               console.log(JSON.stringify(diamondetaial[diamond_count]));
  //               materialobj["material_name"] =
  //                 diamond_name +
  //                 " (" +
  //                 diamondetaial[diamond_count].stone_weight +
  //                 " ~ " +
  //                 diamondetaial[diamond_count].stone_count +
  //                 " / ct) ";
  //               materialobj["cost_price"] =
  //                 materialobj.cost_price +
  //                 " ( " +
  //                 (
  //                   materialobj.cost_price /
  //                   diamondetaial[diamond_count].stone_weight
  //                 ).toFixed(2) +
  //                 "  / ct )";
  //               materialobj["selling_price"] =
  //                 materialobj.selling_price +
  //                 " ( " +
  //                 (
  //                   materialobj.selling_price /
  //                   diamondetaial[diamond_count].stone_weight
  //                 ).toFixed(2) +
  //                 " / ct) ";
  //             } else {
  //               diamondcount = diamondcount + 1;
  //               let diamond_name = "Diamond " + diamondcount;

  //               materialobj["material_name"] = diamond_name;
  //               materialobj["cost_price"] = materialobj.cost_price
  //                 ? materialobj.cost_price.toFixed(2)
  //                 : 0;
  //               materialobj["selling_price"] =
  //                 materialobj.selling_price.toFixed(2);
  //             }

  //             diamond_count = diamond_count + 1;
  //           } else {
  //             let stoneweight =
  //               gemstonedetails.length > 0
  //                 ? gemstonedetails[0].stone_weight
  //                 : 0;
  //             let stonecount =
  //               gemstonedetails.length > 0 ? gemstonedetails[0].stone_count : 0;
  //             let gem_cost_price = materialobj.cost_price;
  //             let gem_selling_price = materialobj.selling_price;

  //             if (stonecount) {
  //               gem_cost_price = gem_cost_price / stonecount;
  //               gem_selling_price = gem_selling_price / stonecount;
  //             }

  //             if (stoneweight) {
  //               gem_cost_price = gem_cost_price / stoneweight;
  //               gem_selling_price = gem_selling_price / stoneweight;
  //             }
  //             materialobj[
  //               "cost_price"
  //             ] = `${materialobj.cost_price} (${gem_cost_price}) / ct`;
  //             materialobj[
  //               "selling_price"
  //             ] = `${materialobj.selling_price} (${gem_selling_price}) / ct`;
  //           }
  //           material_prices.push(materialobj);
  //         });
  //         response["materials"] = material_prices;

  //         models.pricing_sku_metals
  //           .findAll({
  //             where: {
  //               product_sku: req.params.skuid,
  //             },
  //           })
  //           .then((metal_price) => {
  //             let metal_prices = [];
  //             metal_price.forEach((metal) => {
  //               // if(metal.material_name.includes('gold'))
  //               // {
  //               metal["cost_price"] =
  //                 metal.cost_price +
  //                 " ( " +
  //                 (metal.cost_price / accs.sku_weight).toFixed(2) +
  //                 "  / gm) ";
  //               metal["selling_price"] =
  //                 metal.selling_price +
  //                 " ( " +
  //                 (metal.selling_price / accs.sku_weight).toFixed(2) +
  //                 " / gm ) ";

  //               // }
  //               metal_prices.push(metal);
  //             });
  //             response["metals"] = metal_prices;
  //             res.send(200, { price_summary: response });
  //           });
  //       });
  //   });
};

exports.updateproduct_stonecolor = async (req, res) => {
  var product_count = 0;
  var stonecolor_str = req.body.stonecount;
  var stonecolor_obj = JSON.parse(stonecolor_str);

  res.send(200, { message: stonecolor_obj.length });

  stonecolor_obj.forEach(async (element) => {
    console.log(JSON.stringify(element));
    const product_stonecount = {
      id: uuidv1(),
      stonecount: element.stonecount,
      product_id: element.product_id,
      is_active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await models.product_stonecount.create(product_stonecount);
  });
};
exports.updatecodpincodes = async (req, res) => {
  console.log("I ma here");
  var pincodes = req.body.cod_pincode;
  var pincodes_obj = JSON.parse(pincodes);
  var process_pincode_count = 0;
  res.send(200, { message: "success" });

  processpincode(process_pincode_count);
  async function processpincode(process_pincode_count) {
    var pincode = pincodes_obj[process_pincode_count];
    console.log("I ma here" + pincode.pincode);

    await models.pincode_master.update(
      {
        is_cod: true,
        max_cartvalue: pincode.maxlimit,
        min_cartvalue: pincode.maxlimit,
      },
      {
        where: {
          pincode: pincode.pincode,
        },
      }
    );
    process_pincode_count++;
    if (pincodes_obj.length > process_pincode_count) {
      processpincode(process_pincode_count);
    } else {
      console.log("finished");
    }
  }
};

exports.updateurlparams = async (req, res) => {
  var pincodes = req.body.urlparams;
  var pincodes_obj = JSON.parse(pincodes);
  var process_pincode_count = 0;
  res.send(200, { message: "success" });

  processpincode(process_pincode_count);
  async function processpincode(process_pincode_count) {
    var pincode = pincodes_obj[process_pincode_count];
    var urlobj = {
      id: uuidv1(),
      attribute_name: pincode.name,
      attribute_value: pincode.value,
      seo_text: pincode.text,
      seo_value: pincode.value,
      seo_url: pincode.url,
      priority: pincode.priority,
      is_active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await models.seo_url_priorities.create(urlobj);
    process_pincode_count++;
    if (pincodes_obj.length > process_pincode_count) {
      processpincode(process_pincode_count);
    } else {
      console.log("finished");
    }
  }
};

exports.updatepincode = async (req, res) => {
  var pincodes = req.body.delivery_pin_code;
  var pincodes_obj = JSON.parse(pincodes);
  var process_pincode_count = 0;
  res.send(200, { message: "success" });

  processpincode(process_pincode_count);
  function processpincode(process_pincode_count) {
    var pincode = pincodes_obj[process_pincode_count].pincode;
    console.log(pincode);
    request(
      {
        url: "http://www.postalpincode.in/api/pincode/" + pincode,
        method: "GET",
        headers: {},
        body: "",
      },
      async function (error, response, body) {
        var res_obj = JSON.parse(response.body);
        if (res_obj && res_obj.PostOffice) {
          var post_offices = res_obj.PostOffice;

          console.log(JSON.stringify(res_obj.PostOffice));
          var postoffices_arr = [];
          post_offices.forEach((element) => {
            const post_off_obj = {
              id: uuidv1(),
              pincode: pincode,
              area: element.Name,
              district: element.District,
              state: element.State,
              country: element.Country,
              lat: 0,
              lng: 0,
              is_cod: true,
              is_delivery: true,
              is_active: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            postoffices_arr.push(post_off_obj);
          });
          await models.pincode_master.bulkCreate(postoffices_arr, {
            individualHooks: true,
          });
          process_pincode_count++;
          if (pincodes_obj.length > process_pincode_count) {
            processpincode(process_pincode_count);
          } else {
            console.log("finished");
          }
        } else {
          process_pincode_count++;
          if (pincodes_obj.length > process_pincode_count) {
            processpincode(process_pincode_count);
          } else {
            console.log("finished");
          }
        }
      }
    );
  }
};

exports.updatereadytoship = async (req, res) => {
  var product_count = 0;
  var stonecolor_str = req.body.readytoship;
  var stonecolor_obj = JSON.parse(stonecolor_str);

  res.send(200, { message: 0 });

  stonecolor_obj.forEach(async (product_obj) => {
    const product_sku = product_obj.SKU;
    var query =
      "UPDATE trans_sku_lists SET  is_ready_to_ship = true where generated_sku ='" +
      product_sku +
      "'";
    console.log(query);

    await models.sequelize.query(query).then(([results, metadata]) => {
      // Results will be an empty array and metadata will contain the number of affected rows.
    });
  });
  console.log("finished");
};

exports.updatebestseller = async (req, res) => {
  var product_count = 0;
  var stonecolor_str = req.body.bestseller;
  var stonecolor_obj = JSON.parse(stonecolor_str);

  res.send(200, { message: 0 });

  stonecolor_obj.forEach(async (product_obj) => {
    const product_sku = product_obj.SKU;
    var query =
      "UPDATE product_lists SET  selling_qty = " +
      product_obj.qty +
      " where product_id ='" +
      product_sku +
      "'";
    console.log(query);

    await models.sequelize.query(query).then(([results, metadata]) => {
      // Results will be an empty array and metadata will contain the number of affected rows.
    });
  });
  console.log("finished");
};

exports.updatecustomerreviews = async (req, res) => {
  const { reviews } = req.body;
  var reviews_array = JSON.parse(reviews);

  var review_arr = [];
  reviews_array.forEach((reviewobj) => {
    console.log(reviewobj.customer_name);

    console.log(reviewobj.product_code);

    const review_content = {
      id: uuidv1(),
      product_id: reviewobj.product_code,
      product_sku: reviewobj.sku_code,
      customer_name: reviewobj.customer_name,
      userprofile_id: null,
      title: "",
      message: reviewobj.description,
      rating: 5,
      is_publish: true,
      is_active: true,
    };
    review_arr.push(review_content);
  });
  await models.customer_reviews.bulkCreate(review_arr, {
    individualHooks: true,
  });

  res.send(200, { message: "success" });
};

exports.updatevendor = async (req, res) => {
  const { shortCode, name, address, city, gstNo, vendorDelivaryDays, isedit } =
    req.body;
  if (isedit) {
    let response = await models.master_vendors.update(
      {
        name: name,
        address: address,
        city: city,
        gst_no: gstNo,
        vendor_delivary_days: vendorDelivaryDays,
      },
      {
        // Clause
        where: {
          short_code: shortCode,
        },
      }
    );

    res.send(200, { message: response });
  } else {
    let response = await models.master_vendors.create({
      id: uuidv1(),
      short_code: shortCode,
      name: name,
      address: address,
      city: city,
      gst_no: gstNo,
      currency: "INR",
      vendor_delivary_days: vendorDelivaryDays,
    });

    res.send(200, { message: response });
  }
};

exports.updatetax = async (req, res) => {
  const { hsnNumber, taxValue, isedit, id } = req.body;

  if (isedit) {
    let response = await models.master_tax_settings.update(
      {
        hsn_number: hsnNumber,
        tax_value: taxValue,
      },
      {
        // Clause
        where: {
          id: id,
        },
      }
    );
    res.send(200, { message: response });
  } else {
    var taxobj = {
      id: uuidv1(),
      hsn_number: hsnNumber,
      tax_value: taxValue,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    let response = await models.master_tax_settings.create(taxobj);
    res.send(200, { message: response });
  }
};
exports.generatevendorcode = async (req, res) => {
  let latestvendor = await models.master_vendors.findOne({
    order: [["createdAt", "DESC"]],
  });
  let vendorcode = latestvendor.short_code;
  let vendor_id = vendorcode.split(" ");
  let newvendorcode = vendor_id[0] + " " + (parseInt(vendor_id[1]) + 1);
  res.send(200, { newvendorcode: newvendorcode });
};

exports.updatefilterposition = async (req, res) => {
  var processcount = 0;
  let contents = await models.master_gemstones_types.findAll({
    order: [["name", "ASC"]],
  });
  processcontent(processcount);

  async function processcontent() {
    let conobj = contents[processcount];
    processcount = processcount + 1;
    let res = await models.master_gemstones_types.update(
      {
        filter_order: processcount,
        is_active: true,
        is_filter: true,
      },
      {
        where: {
          id: conobj.id,
        },
      }
    );
    processcontent(processcount);
  }

  res.send(200, { message: contents });
};
