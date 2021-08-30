const models = require("./../models");
import "dotenv/config";
var request = require("request");
const sequelize = require("sequelize");
const Op = require("sequelize").Op;
import apidata from "./apidata.json";
const axios = require("axios");
import moment from "moment";
const uuidv1 = require("uuid/v1");
exports.priceupdate = async (req, res) => {
  // request({
  //     url: 'http://localhost:8000/updatepricelist',
  //     method: "POST",
  //     headers: {"Content-Type": "application/json"},
  //     body: JSON.stringify({req_product_id : 'SR3261'})
  // }, function(error, response, body) {
  //    console.log(body)
  // });

  const _obj = {
    method: "post",
    url: process.env.apibaseurl + "/esearch_forceindex",
    data: {
      // product_id : 'SR3331'
    },
  };

  axios(_obj)
    .then(async (response) => {})
    .catch({});
};

exports.ringpriceupdate = async (req, res) => {
  // const {skuprice} = req.body;
  let skus_arr = req.body;
  console.log(JSON.stringify(req.body.length));
  processskuprice(0);
  async function processskuprice(indexval) {
    let processsku = skus_arr[indexval];
    await models.trans_sku_lists.update(
      { discount_price: processsku.discount_price },
      { where: { generated_sku: processsku.sku } }
    );
    indexval = indexval + 1;
    if (skus_arr.length > indexval) {
      processskuprice(indexval);
    } else {
      res.send(200, { message: "success" });
    }
  }
};

exports.updateproductattr = async (req, res) => {
  let products = await models.product_lists.findAll({
    where: {
      isactive: true,
      product_id: {
        [Op.notILike]: "%SR%",
      },
    },
  });
  var processcount = 0;
  res.send(200, { response: products.length });

  productupdate(processcount);
  async function productupdate(processcount) {
    let product_id = products[processcount].product_id;
    console.log(product_id);
    var product_object = await models.product_lists.findOne({
      attributes: ["product_type", "product_category"],
      include: [
        {
          model: models.product_themes,
          attributes: ["theme_name"],
        },
        {
          model: models.product_styles,
          attributes: ["style_name"],
        },
        {
          model: models.product_occassions,
          attributes: ["occassion_name"],
        },
        {
          model: models.product_collections,
          attributes: ["collection_name"],
        },
        {
          model: models.product_materials,
          attributes: ["material_name"],
        },
        {
          model: models.product_diamonds,
          attributes: ["diamond_colour", "diamond_clarity"],
        },
        {
          model: models.product_purities,
          attributes: ["purity"],
        },
        {
          model: models.product_stonecount,
          attributes: ["stonecount"],
        },
        {
          model: models.product_stonecolor,
          attributes: ["stonecolor"],
        },
        {
          model: models.product_gender,
          attributes: ["gender_name"],
        },
      ],
      where: {
        product_id: product_id,
      },
    });
    let attributes_array = [];
    let product_category = await models.master_product_categories.findOne({
      where: {
        name: product_object.product_category,
      },
    });
    attributes_array.push(product_category.short_code);
    let product_type = await models.master_product_types.findOne({
      where: {
        name: product_object.product_type,
      },
    });
    attributes_array.push(product_type.alias);

    let materialname = [];
    product_object.product_materials.forEach((materialobj) => {
      materialname.push(materialobj.material_name);
    });
    let materials_arr = await models.master_materials.findAll({
      where: {
        name: {
          [Op.in]: materialname,
        },
      },
    });
    materials_arr.forEach((mat_obj) => {
      attributes_array.push(mat_obj.alias);
    });
    let collectionname = [];
    product_object.product_collections.forEach((collectionobj) => {
      collectionname.push(collectionobj.collection_name);
    });
    let collections_arr = await models.master_collections.findAll({
      where: {
        name: {
          [Op.in]: collectionname,
        },
      },
    });
    collections_arr.forEach((col_obj) => {
      attributes_array.push(col_obj.alias);
    });

    let purities = [];
    product_object.product_purities.forEach((purityobj) => {
      purities.push(purityobj.purity);
    });
    let purity_arr = await models.master_metals_purities.findAll({
      where: {
        name: {
          [Op.in]: purities,
        },
      },
    });
    purity_arr.forEach((purity_obj) => {
      attributes_array.push(purity_obj.alias);
    });

    let styles = [];
    product_object.product_styles.forEach((styleobj) => {
      styles.push(styleobj.style_name);
    });
    let style_arr = await models.master_styles.findAll({
      where: {
        name: {
          [Op.in]: styles,
        },
      },
    });
    style_arr.forEach((style_obj) => {
      attributes_array.push(style_obj.alias);
    });

    let occassions = [];
    product_object.product_occassions.forEach((ocassionobj) => {
      occassions.push(ocassionobj.occassion_name);
    });
    let occassion_arr = await models.master_occasions.findAll({
      where: {
        name: {
          [Op.in]: occassions,
        },
      },
    });

    occassion_arr.forEach((ocassion_obj) => {
      attributes_array.push(ocassion_obj.alias);
    });
    let diamonds_clarity_arr = [];
    let diamonds_color_arr = [];

    product_object.product_diamonds.forEach((diamond_obj) => {
      diamonds_clarity_arr.push(diamond_obj.diamond_clarity + diamond_obj.diamond_colour);
    });
    let master_diamonds = await models.master_diamond_types.findAll({});

    master_diamonds.forEach((diamond) => {
      let diamondname = diamond.diamond_color + diamond.diamond_clarity;

      if (diamonds_clarity_arr.indexOf(diamondname) > -1) {
        attributes_array.push(diamond.short_code);
      }
    });
    let updateobj = await models.product_lists.update(
      { attributes: attributes_array },
      {
        where: {
          product_id: product_id,
        },
      }
    );

    if (products.length > processcount) {
      processcount = processcount + 1;
      productupdate(processcount);
    } else {
      console.log("update complete");
    }
  }
};
exports.updateproductattr_bk = async (req, res) => {
  let products = await models.trans_sku_lists.findAll({
    attributes: ["product_id"],
    group: ["product_id"],
    where: {
      is_active: true,
      product_id: {
        [Op.iLike]: "%SR%",
      },
    },
  });
  var processcount = 0;

  res.send(200, { response: products.length });
  console.log(products.length);
  productupdate(processcount);
  async function productupdate(processcount) {
    let product_id = products[processcount].product_id;
    console.log(product_id);
    var product_object = await models.product_lists.findOne({
      attributes: ["product_type", "product_category"],
      include: [
        {
          model: models.trans_sku_lists,
          attributes: ["purity", "diamond_type", "generated_sku"],
        },
        {
          model: models.product_themes,
          attributes: ["theme_name"],
        },
        {
          model: models.product_styles,
          attributes: ["style_name"],
        },
        {
          model: models.product_occassions,
          attributes: ["occassion_name"],
        },
        {
          model: models.product_collections,
          attributes: ["collection_name"],
        },
        {
          model: models.product_materials,
          attributes: ["material_name"],
        },
        {
          model: models.product_purities,
          attributes: ["purity"],
        },
        {
          model: models.product_diamonds,
          attributes: ["diamond_colour", "diamond_clarity"],
        },
        {
          model: models.product_stonecount,
          attributes: ["stonecount"],
        },
        {
          model: models.product_stonecolor,
          attributes: ["stonecolor"],
        },
        {
          model: models.product_gender,
          attributes: ["gender_name"],
        },
      ],
      where: {
        product_id: product_id,
      },
    });

    let attributes_array = [];
    let purity_obj = {};
    let diamond_obj = {};
    let product_category = await models.master_product_categories.findOne({
      where: {
        name: product_object.product_category,
      },
    });
    attributes_array.push(product_category.short_code);
    let product_type = await models.master_product_types.findOne({
      where: {
        name: product_object.product_type,
      },
    });
    attributes_array.push(product_type.alias);

    let materialname = [];
    product_object.product_materials.forEach((materialobj) => {
      materialname.push(materialobj.material_name);
    });
    let materials_arr = await models.master_materials.findAll({
      where: {
        name: {
          [Op.in]: materialname,
        },
      },
    });
    materials_arr.forEach((mat_obj) => {
      attributes_array.push(mat_obj.alias);
    });
    let collectionname = [];
    product_object.product_collections.forEach((collectionobj) => {
      collectionname.push(collectionobj.collection_name);
    });
    let collections_arr = await models.master_collections.findAll({
      where: {
        name: {
          [Op.in]: collectionname,
        },
      },
    });
    collections_arr.forEach((col_obj) => {
      attributes_array.push(col_obj.alias);
    });

    let purities = [];
    product_object.product_purities.forEach((purityobj) => {
      purities.push(purityobj.purity);
    });
    let purity_arr = await models.master_metals_purities.findAll({
      where: {
        name: {
          [Op.in]: purities,
        },
      },
    });

    let diamonds_clarity_arr = [];
    let diamonds_color_arr = [];

    product_object.product_diamonds.forEach((diamond_obj) => {
      diamonds_clarity_arr.push(diamond_obj.diamond_clarity);
      diamonds_color_arr.push(diamond_obj.diamond_colour);
    });
    let master_diamonds = await models.master_diamond_types.findAll({
      where: {
        diamond_color: {
          [Op.in]: diamonds_clarity_arr,
        },
        diamond_clarity: {
          [Op.in]: diamonds_color_arr,
        },
      },
    });
    console.log(JSON.stringify(diamonds_clarity_arr));
    console.log(JSON.stringify(diamonds_color_arr));

    master_diamonds.forEach((diamond) => {
      let diamond_val = diamond.diamond_color + diamond.diamond_clarity;
      let diamond_shortcode = diamond.short_code;
      diamond_obj[diamond_val] = diamond_shortcode;
    });
    console.log(JSON.stringify(diamond_obj));
    purity_arr.forEach((purityobj) => {
      // attributes_array.push(purity_obj.alias)
      purity_obj[purityobj.name] = purityobj.alias;
    });

    let styles = [];
    product_object.product_styles.forEach((styleobj) => {
      styles.push(styleobj.style_name);
    });
    let style_arr = await models.master_styles.findAll({
      where: {
        name: {
          [Op.in]: styles,
        },
      },
    });
    style_arr.forEach((style_obj) => {
      attributes_array.push(style_obj.alias);
    });

    let occassions = [];
    product_object.product_occassions.forEach((ocassionobj) => {
      occassions.push(ocassionobj.occassion_name);
    });
    let occassion_arr = await models.master_occasions.findAll({
      where: {
        name: {
          [Op.in]: occassions,
        },
      },
    });
    occassion_arr.forEach((ocassion_obj) => {
      attributes_array.push(ocassion_obj.alias);
    });
    let updateobj = await models.product_lists.update(
      { attributes: attributes_array },
      {
        where: {
          product_id: product_id,
        },
      }
    );
    processsku(0);
    async function processsku(skucount) {
      if (product_object.trans_sku_lists.length > skucount) {
        let skuobj = product_object.trans_sku_lists[skucount];
        let sku_atter = [];
        attributes_array.forEach((attr) => {
          sku_atter.push(attr);
        });
        sku_atter.push(diamond_obj[skuobj.diamond_type]);
        sku_atter.push(purity_obj[skuobj.purity]);

        await models.trans_sku_lists.update(
          {
            attributes: sku_atter,
          },
          {
            where: {
              generated_sku: skuobj.generated_sku,
            },
          }
        );
        skucount = skucount + 1;
        processsku(skucount);
      } else {
        if (products.length > processcount) {
          processcount = processcount + 1;
          productupdate(processcount);
        } else {
          console.log("update complete");
        }
      }
    }
    // product_object.trans_sku_lists.forEach(async skuobj => {
    //     let sku_atter = []
    //     sku_atter = attributes_array
    //     console.log(skuobj.generated_sku)

    //      sku_atter.push(purity_obj[skuobj.purity])

    //      await models.trans_sku_lists.update(
    //          {
    //              "attributes" : sku_atter
    //          },
    //          {
    //              where:{
    //                  generated_sku : skuobj.generated_sku
    //              }
    //          }
    //      )
    //     // res.send(200,{"response":sku_atter})

    // })
    // let updateobj = await models.product_lists.update(
    //     {"attributes": attributes_array},
    //     {
    //     where:{
    //         product_id : product_id
    //     }
    // }

    // )
  }
};
exports.productupload = async (req, res) => {
  var apidata = req.body;
  var product_skus = [];
  var skuurl = "";
  console.log(JSON.stringify(apidata));
  var categoryobj = apidata.product_categoy;
  var categoryval = categoryobj.charAt(0);
  var producttypeobj = apidata.product_type;
  var producttypeval = producttypeobj.shortCode;
  var seriesvalue = apidata.startcode + 1;
  console.log("i am here");
  console.log(seriesvalue);
  skuurl = categoryobj;
  if (Number.isNaN(seriesvalue)) {
    console.log("i am here");
    seriesvalue = 3000;
  }
  if (categoryobj !== producttypeobj.name) {
    skuurl = skuurl + "/" + producttypeobj.name;
  }
  let lastsku = await models.trans_sku_lists.findOne({
    attributes: ["sku_id"],
    where: {
      is_active: true,
    },
    order: [
      //  [ sequelize.cast(sequelize.col('sku_id'), 'BIGINT') , 'ASC' ]
      [sequelize.cast(sequelize.col("sku_id"), "BIGINT"), "DESC"],
    ],
  });
  var lastsku_id = parseInt(lastsku.sku_id);

  let final_series = await models.product_lists.findOne({
    order: [["product_series", "DESC"]],
    attributes: ["product_series"],
  });
  var product_series = 3001;
  if (final_series) {
    product_series = final_series.product_series + 1;
  }
  var product_id = "S" + producttypeval + product_series;

  var skuprefix = "S" + producttypeval + product_series + "-";

  var product_name = apidata.productname;
  var product_category = apidata.product_categoy;
  var product_type = apidata.product_type.name;
  var gender = apidata.selectedgender;
  var vendorname = apidata.vendorcode.name;
  var vendor_code = apidata.vendorcode.shortCode;
  var product_series = product_series;
  var height = apidata.metal_height;
  var width = apidata.metal_width;
  var length = apidata.metal_length;
  var productsizes = apidata.selected_sizes;
  var productcolors = apidata.metalcolour;
  var productpurity = apidata.metalpurity;
  var isreorderable = apidata.isreorderable;
  var product_vendor_code = apidata.productvendorcode;
  var default_size = apidata.default_size;
  var default_metal_color = apidata.default_metal_colour;
  var default_metal_purity = apidata.default_metal_purity;
  var materials = apidata.material_names;
  var default_metal_size = apidata.default_size;
  var stonecolour_lists = apidata.stonecolour;
  var stonecount_lists = apidata.stonecount;
  var vendorleadtime = apidata.vendorleadtime;

  var product_images = apidata.product_images;
  var size_varient = "";

  if (productsizes) {
    size_varient = productsizes.join(",");
  }

  var default_weight = apidata[default_metal_purity + "_metal_weight"];

  var isreorderable = false;
  if (apidata.isreorderable === "Yes") {
    isreorderable = true;
  }
  var colour_varient = "";
  var diamondlist = [];
  var gemstonelist = [];
  var product_collections = apidata.collections;
  var product_occassions = apidata.occassions;
  var product_themes = apidata.themes;
  var product_styles = apidata.prod_styles;

  var metals = apidata.metals;

  metals.forEach((element) => {
    if (element.metalname === "Diamond") {
      diamondlist.push(element);
    }
    if (element.metalname === "Gemstone") {
      gemstonelist.push(element);
    }
  });

  if (productcolors && productpurity) {
    var colorarr = [];
    productpurity.forEach((purityelement) => {
      productcolors.forEach((colorelement) => {
        colorarr.push(purityelement.name + " " + colorelement.name);
      });
    });
    colour_varient = colorarr.join(",");
  }

  var product_obj = {
    id: uuidv1(),
    product_id,
    product_series,
    vendor_code,
    product_name,
    product_category,
    isactive: false,
    default_weight,
    gender,
    height,
    width,
    length,
    product_type,
    product_vendor_code,
    default_size,
    size_varient,
    colour_varient,
    isreorderable,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  let sku_url =
    product_obj.product_category.toLowerCase() +
    "/" +
    product_obj.product_type.toLowerCase() +
    "/" +
    product_obj.product_name.replace(" ", "-") +
    "?sku_id=";

  let successmessage = await models.product_lists.create(product_obj);
  /*************** images list ********************/
  var prod_images = [];
  if (Object.keys(product_images)) {
    Object.keys(product_images).forEach((key) => {
      let images_arr = product_images[key];
      var imgposition = 0;
      images_arr.forEach((element) => {
        let ishover = false;
        let isdefault = false;
        imgposition = imgposition + 1;
        if (imgposition == 2) {
          ishover = true;
        }
        if (element.position == 1) {
          isdefault = true;
        }
        var image_obj = {
          id: uuidv1(),
          product_id: successmessage.product_id,
          product_color: element.color,
          image_url: element.image_url,
          image_position: imgposition,
          ishover,
          isdefault: default_metal_color === element.color ? true : false,
        };
        prod_images.push(image_obj);
      });
    });
    console.log(JSON.stringify(prod_images));
    await models.product_images.bulkCreate(prod_images, {
      individualHooks: true,
    });
  }
  /*************** add gender ********************/
  if (gender) {
    const genderobj = {
      id: uuidv1(),
      gender_name: gender,
      product_id: product_obj.product_id,
      is_active: true,
    };
    await models.product_gender.create(genderobj);
  }

  /*************** purity list ********************/
  var puritylist = apidata.metalpurity;
  var purityarr = [];
  puritylist.forEach((purity) => {
    const purityobj = {
      id: uuidv1(),
      purity: purity.name,
      product_id: product_obj.product_id,
      is_active: true,
    };
    purityarr.push(purityobj);
    var sku = skuprefix + purity.shortCode;
    var skuobj = {
      product_id: successmessage.product_id,
      product_type: producttypeval,
      service_name: vendorname,
      product_series: seriesvalue,
      purity: purity.name,
      generated_sku: sku,
    };
    product_skus.push(skuobj);
  });
  if (puritylist) {
    await models.product_purities.bulkCreate(purityarr, {
      individualHooks: true,
    });
  }
  console.log("puritylistcount");
  console.log(product_skus.length);
  /************ product stone colour */
  var stonecolourarr = [];

  if (stonecolour_lists) {
    stonecolour_lists.forEach((stonecolourobj) => {
      const stone_colour_obj = {
        id: uuidv1(),
        stonecolor: stonecolourobj,
        product_id: product_obj.product_id,
        is_active: true,
      };
      stonecolourarr.push(stone_colour_obj);
    });

    await models.product_stonecolor.bulkCreate(stonecolourarr, {
      individualHooks: true,
    });
  }
  /******************************** */

  /************ product stone count */
  var stonecountsarr = [];

  if (stonecount_lists) {
    stonecount_lists.forEach((stonecountobj) => {
      const stone_count_obj = {
        id: uuidv1(),
        stonecount: stonecountobj,
        product_id: product_obj.product_id,
        is_active: true,
      };
      stonecountsarr.push(stone_count_obj);
    });

    await models.product_stonecount.bulkCreate(stonecountsarr, {
      individualHooks: true,
    });
  }
  /******************************** */

  var collection_arr = [];
  if (product_collections) {
    product_collections.forEach((collectonobj) => {
      const collection = {
        id: uuidv1(),
        collection_name: collectonobj,
        product_id: product_obj.product_id,
        is_active: true,
      };
      collection_arr.push(collection);
    });

    await models.product_collections.bulkCreate(collection_arr, {
      individualHooks: true,
    });
  }

  var occassions_arr = [];
  if (product_occassions) {
    product_occassions.forEach((occassionsobj) => {
      const occassion = {
        id: uuidv1(),
        occassion_name: occassionsobj,
        product_id: product_obj.product_id,
        is_active: true,
      };
      occassions_arr.push(occassion);
    });
    await models.product_occassions.bulkCreate(occassions_arr, {
      individualHooks: true,
    });
  }

  var styles_arr = [];
  if (product_styles) {
    product_styles.forEach((styleobj) => {
      const style = {
        id: uuidv1(),
        style_name: styleobj,
        product_id: product_obj.product_id,
        is_active: true,
      };
      styles_arr.push(style);
    });
    await models.product_styles.bulkCreate(styles_arr, {
      individualHooks: true,
    });
  }

  var themes_arr = [];
  if (product_themes) {
    product_themes.forEach((themeobj) => {
      const style = {
        id: uuidv1(),
        theme_name: themeobj,
        product_id: product_obj.product_id,
        is_active: true,
      };
      themes_arr.push(style);
    });
    await models.product_themes.bulkCreate(themes_arr, {
      individualHooks: true,
    });
  }

  var material_arr = [];
  if (materials) {
    materials.forEach((materialobj) => {
      const metal_obj = {
        id: uuidv1(),
        material_name: materialobj,
        product_sku: product_obj.product_id,
        is_active: true,
      };
      material_arr.push(metal_obj);
    });
    await models.product_materials.bulkCreate(material_arr, {
      individualHooks: true,
    });

    if (materials.indexOf("Diamond") > -1) {
      skuurl = skuurl + "/" + "Diamond";
    } else if (materials.indexOf("Gemstone") > -1) {
      skuurl = skuurl + "/" + "Gemstone";
    } else {
      skuurl = skuurl + "/" + materials[0];
    }
  }

  var skus = product_skus;

  product_skus = [];
  var metalcolorlist = apidata.metalcolour;

  /*************** add metalcolor ********************/

  var metal_color_arr = [];
  if (metalcolorlist) {
    metalcolorlist.forEach((metalcolorobj) => {
      const colorobj = {
        id: uuidv1(),
        product_color: metalcolorobj.name,
        product_id: product_obj.product_id,
        is_active: true,
      };
      metal_color_arr.push(colorobj);
    });
    await models.product_metalcolours.bulkCreate(metal_color_arr, {
      individualHooks: true,
    });
  }
  /****************** */

  skus.forEach((skuvalue) => {
    var skuval = skuvalue.generated_sku;

    metalcolorlist.forEach((metalcolor) => {
      var sku = skuval + metalcolor.shortCode;

      var skuobj = {
        ...skuvalue,
        generated_sku: sku,
        metal_color: metalcolor.name,
      };
      product_skus.push(skuobj);
    });
  });
  console.log("metalcolorlistcount");
  console.log(product_skus.length);

  /*************** Diamond Lists ********************/
  var skus = product_skus;

  product_skus = [];
  var diamond_sku_clarity = {};
  let diamondtype = await models.master_diamond_types.findAll({});
  diamondtype.forEach((diamond_type) => {
    var claritytype = diamond_type.diamond_color + diamond_type.diamond_clarity;
    diamond_sku_clarity[claritytype] = diamond_type.short_code;
  });
  var diamondsarr = [];
  diamondlist.forEach((diamond) => {
    var clarity = diamond.clarity.name + diamond.color.shortCode;

    const diamonval = {
      id: uuidv1(),
      diamond_colour: diamond.color.shortCode,
      diamond_clarity: diamond.clarity.name,
      diamond_settings: diamond.settings.name,
      diamond_shape: diamond.shape.name,
      stone_count: diamond.count,
      diamond_type: clarity,
      stone_weight: diamond.weight,
      product_sku: product_obj.product_id,
    };
    diamondsarr.push(diamonval);
  });
  skus.forEach((skuvalue) => {
    var skuval = skuvalue.generated_sku;

    diamondlist.forEach((diamond) => {
      var clarity = diamond.clarity.name + diamond.color.shortCode;

      var sku = skuval + diamond_sku_clarity[clarity];

      var skuobj = {
        ...skuvalue,
        generated_sku: sku,
        diamond_color: diamond.color.shortCode,
        diamond_type: clarity,
      };
      product_skus.push(skuobj);
    });
  });
  if (product_skus.length == 0) {
    product_skus = skus;
  }
  await models.product_diamonds.bulkCreate(diamondsarr, {
    individualHooks: true,
  });
  console.log("diamndlistcount");
  console.log(product_skus.length);

  /*************** gemstone Lists ********************/

  skus = product_skus;
  var gemstonearr = [];
  var gemstonesku = "";
  var gemstonecolorcode1 = "00";
  var gemstonecolorcode2 = "00";
  var gemstoneshortcode = "00";
  var gemstonecolorcode2 = "00";
  gemstonelist.forEach((gem) => {
    const gemstone_obj = {
      id: uuidv1(),
      gemstone_type: gem.clarity.name,
      gemstone_shape: gem.color.name,
      gemstone_setting: gem.settings.name,
      gemstone_size: gem.shape,
      stone_count: gem.count,
      stone_weight: gem.weight,
      product_sku: product_obj.product_id,
    };

    gemstonearr.push(gemstone_obj);
  });

  await models.product_gemstones.bulkCreate(gemstonearr, {
    individualHooks: true,
  });
  if (gemstonelist.length > 0) {
    var firstgemobj = gemstonelist[0];
    gemstoneshortcode = firstgemobj.clarity.shortCode;
    gemstonesku = firstgemobj.clarity.colorCode;
    gemstonecolorcode1 = firstgemobj.clarity.colorCode;
  }
  if (gemstonelist.length > 1) {
    var secondgemobj = gemstonelist[1];

    gemstonesku = gemstonesku + secondgemobj.clarity.colorCode;
    gemstonecolorcode2 = secondgemobj.clarity.colorCode;
  }

  product_skus = [];
  skus.forEach((skuvalue) => {
    var sku = skuvalue.generated_sku + gemstonecolorcode1 + gemstonecolorcode2;

    var skuobj = {
      ...skuvalue,
      generated_sku: sku,
    };
    product_skus.push(skuobj);

    // product_skus.push(sku)
  });
  console.log("gemslistcount");
  console.log(product_skus.length);
  if (product_skus.length == 0) {
    product_skus = skus;
  }
  /*************** Size Lists ********************/

  skus = product_skus;
  product_skus = [];
  var sizelist = apidata.selected_sizes;
  console.log(sizelist.length);
  skus.forEach((skuvalue) => {
    sizelist.forEach((sizevalue) => {
      var sku = skuvalue.generated_sku + "_" + sizevalue;

      var skuobj = {
        ...skuvalue,
        generated_sku: sku,
        sku_size: sizevalue,
      };
      product_skus.push(skuobj);
    });
  });
  if (product_skus.length == 0) {
    product_skus = skus;
  }
  console.log("size" + product_skus.length);
  console.log("sizelistcount");
  console.log(product_skus.length);

  var uploadskus = [];
  var uploaddescriptions = [];
  product_skus.forEach((prodkt) => {
    var isdefault = false;
    var keyvalue = prodkt.purity + "_metal_weight";
    console.log("productweight");
    console.log(keyvalue);

    var sku_weight = apidata[keyvalue];
    console.log(sku_weight);

    if (
      prodkt.metal_color === default_metal_color &&
      prodkt.purity === default_metal_purity &&
      prodkt.sku_size === default_metal_size
    ) {
      isdefault = true;
    }

    if (apidata.product_type.shortCode.toLowerCase() === "r" || apidata.product_type.shortCode.toLowerCase() == "b") {
      const sizedifferent = parseFloat(prodkt.sku_size) - parseFloat(default_metal_size);
      console.log(">sizedifference" + sizedifferent);
      console.log(">sku_weight" + parseFloat(sku_weight));

      sku_weight = parseFloat(sku_weight) + Math.round(sizedifferent * 0.1 * 100) / 100;
      sku_weight = Math.round(sku_weight * 100) / 100;
    } else {
      sku_weight = Math.round(parseFloat(sku_weight) * 100) / 100;
    }
    lastsku_id = lastsku_id + 1;
    let sku_urlval = sku_url + lastsku_id;
    var sku_description = product_obj.product_type + "set in " + prodkt.purity + " " + prodkt.metal_color;
    if (materials.length > 0) {
      sku_description = sku_description + " " + materials[0] + " " + sku_weight + " gm";
    }
    if (diamondlist.length > 0) {
      sku_description = sku_description + "with Diamonds (";
      diamondlist.forEach((diamondobj) => {
        var clarity = diamondobj.clarity.name + diamondobj.color.shortCode;
        var diamondweight = diamondobj.weight;
        sku_description = sku_description + diamondweight + "ct " + clarity;
      });
      sku_description = sku_description + " )";
    }
    if (gemstonelist.length > 0) {
      if (diamondlist.length == 0) {
        sku_description = sku_description + "with Gemstones (";
      }
      gemstonelist.forEach((gem) => {
        var gemname = gem.clarity.name;
        sku_description = sku_description + " " + gemname;
      });

      sku_description = sku_description + " )";
    }
    const sku_desc = {
      id: uuidv1(),
      sku_id: prodkt.generated_sku,
      vendor_code: vendor_code,
      sku_description: sku_description,
    };
    var prod_obj = {
      ...prodkt,
      id: uuidv1(),
      isdefault,
      sku_weight,
      is_ready_to_ship: false,
      is_soldout: false,
      is_active: true,
      vendor_delivery_time: vendorleadtime,
      sku_id: lastsku_id,
      sku_url: sku_urlval,
    };
    uploaddescriptions.push(sku_desc);
    uploadskus.push(prod_obj);
  });

  // res.send(200,{skus:uploadskus})

  //   res.send(200,{count:product_skus.length});

  //        var productlist = [
  //         product_skus[0],
  //         product_skus[1]
  //     ]

  //res.json(product_skus);
  models.trans_sku_lists.bulkCreate(uploadskus, { individualHooks: true }).then(function (response) {
    models.trans_sku_descriptions.bulkCreate(uploaddescriptions, { individualHooks: true }).then(function (response) {
      // Notice: There are no arguments here, as of right now you'll have to...
      //   request({
      //     url: 'htts://api.stylori.net/updatepricelist',
      //     method: "POST",
      //     headers: {"Content-Type": "application/json"},
      //     body: JSON.stringify({req_product_id : product_id})
      // }, function(error, response, body) {
      //    console.log(body)
      //    console.log(response)

      // });
      //  const _obj = {
      //         method: "post",
      //         url: process.env.apibaseurl+"/esearch_forceindex",
      //         data: {
      //             product_id : prod_obj.product_id
      //         }
      //     };

      // axios(_obj)
      // 	  .then(async response => {
      //       }).catch({

      //       })

      res.json(uploadskus);
    });
  });

  //  res.send(200, { submitted: true })
};
exports.updateproductimage = async (req, res) => {
  const { imageobj, isedit } = req.body;

  console.log(JSON.stringify(req.body));
  let imgurl = imageobj.imageUrl;
  if (isedit) {
    let response_obj1 = await models.product_images.update(
      // Values to update
      {
        image_url: imgurl.replace("png", "jpg"),
      },
      {
        // Clause
        where: {
          id: imageobj.id,
        },
      }
    );
  } else {
    let newimage = {
      id: uuidv1(),
      image_url: imgurl.replace("png", "jpg"),
      product_id: imageobj.productId,
      product_color: imageobj.productColor,
      image_position: imageobj.imagePosition,
      ishover: imageobj.imagePosition == 2 ? true : false,
      isdefault: imageobj.imagePosition == 1 ? true : false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    let successmessage = await models.product_images.create(newimage);
  }
  res.send(200, { message: "Success" });
};
exports.getproductvarient = async (req, res) => {
  const { productPuritiesByProductId, productDiamondTypes, productSize, productId, productMetalcoloursByProductId } = req.body;
  var product_skus = [];
  var prev_skus = [];
  var skus = product_skus;
  var skuprefix = productId + "-";
  product_skus = [];
  var product_object = await models.product_lists.findOne({
    attributes: ["product_id", "size_varient", "product_type", "product_category", "product_name", "vendor_code"],
    include: [
      {
        model: models.trans_sku_lists,
        attributes: ["generated_sku", "sku_id", "vendor_delivery_time"],
      },
      {
        model: models.product_purities,
      },
      {
        model: models.product_diamonds,
        attributes: ["diamond_type"],
        group: ["diamond_type"],
      },
      {
        model: models.product_metalcolours,
      },
      {
        model: models.product_gemstones,
      },
    ],
    where: {
      product_id: productId,
    },
  });

  let lastsku = await models.trans_sku_lists.findOne({
    attributes: ["sku_id"],
    where: {
      is_active: true,
    },
    order: [
      //  [ sequelize.cast(sequelize.col('sku_id'), 'BIGINT') , 'ASC' ]
      [sequelize.cast(sequelize.col("sku_id"), "BIGINT"), "DESC"],
    ],
  });
  var lastsku_id = parseInt(lastsku.sku_id);
  var vendor_delivery_time = 17;
  product_object.trans_sku_lists.forEach((skuid) => {
    prev_skus.push(skuid.generated_sku);
    vendor_delivery_time = skuid.vendor_delivery_time;
  });
  let diamonds;

  let purityobj = {};
  let masterpurity = await models.master_metals_purities.findAll();
  masterpurity.forEach((purity) => {
    purityobj[purity.name] = purity.short_code;
  });

  /****************puritylis */
  var purities = productPuritiesByProductId;
  var puritylist = product_object.product_purities;
  var purityarr = [];
  // puritylist.forEach(purity => {
  //     var sku = skuprefix + purityobj[purity.purity]
  //     var skuobj = {
  //         product_id: productId,
  //         product_type: product_object.product_type,
  //         service_name: product_object.vendor_code,
  //         product_series: 0,
  //         purity: purity.purity,
  //         generated_sku: sku
  //     }
  //     product_skus.push(skuobj)
  // })

  purities.forEach((purity_obj) => {
    var sku = skuprefix + purityobj[purity_obj.purity];
    var skuobj = {
      product_id: productId,
      product_type: product_object.product_type,
      service_name: product_object.vendor_code,
      product_series: 0,
      sku_weight: purity_obj.metal_weight,
      purity: purity_obj.purity,
      generated_sku: sku,
    };
    product_skus.push(skuobj);
  });

  /************************** */

  /****************metalcolor list */

  var colorlist = productMetalcoloursByProductId;
  var skus = product_skus;

  product_skus = [];
  let colorobj = {};
  let mastercolors = await models.master_metals_colors.findAll();
  mastercolors.forEach((color) => {
    colorobj[color.name] = color.short_code;
  });
  var metalcolorlist = product_object.product_metalcolours;
  console.log("colorlist" + metalcolorlist.length);

  skus.forEach((skuvalue) => {
    var skuval = skuvalue.generated_sku;

    metalcolorlist.forEach((metalcolor) => {
      var sku = skuval + colorobj[metalcolor.product_color];

      var skuobj = {
        ...skuvalue,
        generated_sku: sku,
        metal_color: metalcolor.product_color,
      };
      product_skus.push(skuobj);
    });

    colorlist.forEach((color) => {
      var sku = skuval + colorobj[color.name];

      var skuobj = {
        ...skuvalue,
        generated_sku: sku,
        metal_color: color.name,
      };
      product_skus.push(skuobj);
    });
  });

  /************************ */
  /*****************Diamond list */
  var diamonds_arr = productDiamondTypes;
  var skus = product_skus;
  var diamondlist = product_object.product_diamonds;
  var prod_diamonds = [];
  diamondlist.forEach((diamondname) => {
    if (prod_diamonds.indexOf(diamondname.diamond_type) === -1) {
      prod_diamonds.push(diamondname.diamond_type);
    }
  });
  if (diamondlist.length > 0) {
    product_skus = [];
  }
  console.log("diamondlength" + diamondlist.length);
  var diamond_sku_clarity = {};
  let diamondtype = await models.master_diamond_types.findAll({});
  diamondtype.forEach((diamond_type) => {
    var claritytype = diamond_type.diamond_color + diamond_type.diamond_clarity;
    diamond_sku_clarity[claritytype] = diamond_type.short_code;
  });

  var diamondsarr = [];
  var sku_prev = skus;

  skus.forEach((skuvalue) => {
    var skuval = skuvalue.generated_sku;
    console.log(JSON.stringify(diamondlist));
    //diamond.diamond_type
    prod_diamonds.forEach((diamond) => {
      var clarity = diamond;
      console.log("claritycolor" + JSON.stringify(diamond));
      var sku = skuval + diamond_sku_clarity[diamond];

      var skuobj = {
        ...skuvalue,
        generated_sku: sku,
        diamond_color: diamond,
        diamond_type: diamond,
      };
      product_skus.push(skuobj);
    });

    // res.send(200,{product_skus})
    diamonds_arr.forEach((diamond) => {
      //            var clarity = diamond.diamondType
      var clarity = diamond.diamondColor + diamond.diamondClarity;
      console.log("diamondvarient" + clarity);
      var sku = skuval + diamond_sku_clarity[clarity];
      console.log("diamondvarient" + sku);

      var skuobj = {
        ...skuvalue,
        generated_sku: sku,
        diamond_color: clarity,
        diamond_type: clarity,
      };
      product_skus.push(skuobj);
    });
  });

  /********************* */
  console.log("product_skusvarient" + JSON.stringify(product_skus));

  //     /**************gemstonelist ***********/
  var gemstonecolorcode1 = "00";
  var gemstonecolorcode2 = "00";
  /************************************ */

  skus = product_skus;
  product_skus = [];
  skus.forEach((skuvalue) => {
    var sku = skuvalue.generated_sku + gemstonecolorcode1 + gemstonecolorcode2;

    var skuobj = {
      ...skuvalue,
      generated_sku: sku,
    };
    product_skus.push(skuobj);

    // product_skus.push(sku)
  });
  skus = product_skus;
  var size_arr = productSize;
  var sizes = [];
  if (product_object.size_varient) {
    sizes = product_object.size_varient.split(",");
  }
  if (sizes.length > 0 || size_arr.length > 0) {
    product_skus = [];
  }

  skus.forEach((skuvalue) => {
    sizes.forEach((sizeval) => {
      var sku = skuvalue.generated_sku + "-" + sizeval;

      var skuobj = {
        ...skuvalue,
        sku_size: sizeval,
        generated_sku: sku,
      };
      product_skus.push(skuobj);

      // product_skus.push(sku)
    });
    size_arr.forEach((sizeval) => {
      var sku = skuvalue.generated_sku + "-" + sizeval;

      var skuobj = {
        ...skuvalue,
        is_active: true,
        generated_sku: sku,
        sku_size: sizevalue,
      };
      product_skus.push(skuobj);

      // product_skus.push(sku)
    });
  });

  if (product_skus.length == 0) {
    product_skus = skus;
  }

  var newskus = [];
  var product_skus_description = [];
  let prodname = product_object.product_name;
  let sku_prodname = prodname.replace(/\s/g, "-");
  var sku_description = "";

  let sku_url =
    product_object.product_category.toLowerCase() +
    "/" +
    product_object.product_type.toLowerCase() +
    "/" +
    sku_prodname +
    "?sku_id=";
  product_skus.forEach((sku) => {
    if (prev_skus.indexOf(sku.generated_sku) === -1) {
      lastsku_id = lastsku_id + 1;
      let sku_urlval = sku_url + lastsku_id;
      var skuobj = {
        id: uuidv1(),
        product_id: sku.product_id,
        product_type: sku.product_type,
        diamond_type: sku.diamond_type,
        metal_color: sku.metal_color,
        generated_sku: sku.generated_sku,
        sku_id: "" + lastsku_id,
        sku_url: sku_urlval,
        purity: sku.purity,
        sku_size: sku.sku_size,
        is_ready_to_ship: false,
        is_soldout: false,
        isdefault: false,
        vendor_delivery_time: vendor_delivery_time,
        is_active: true,
      };
      var sku_description_obj = {
        id: uuidv1(),
        sku_id: sku.generated_sku,
        vendor_code: skuobj.metal_color,
        sku_description: sku_description,
        vendor_lead_time: skuobj.vendor_leadtime,
        isactive: true,
      };
      //  if(skuproceecount >= 4478)
      //   {
      newskus.push(skuobj);
      product_skus_description.push(sku_description_obj);
    }
  });
  //res.send(200,{message: newskus})
  models.trans_sku_lists
    .bulkCreate(newskus, { individualHooks: true })
    .then(function (response) {
      models.trans_sku_descriptions
        .bulkCreate(product_skus_description, { individualHooks: true })
        .then(function (response) {
          console.log("porductskudescsuccess");
          // if(product_sku_arr.length > skuproceecount)
          // {
          //     insertsku(skuproceecount);
          // }else{
          res.send(200, { message: newskus, product_skus_description });

          //}
        })
        .catch((error) => {
          console.log("errorresponse" + error.message);
        });
    })
    .catch((error) => {
      res.send(200, {
        message: "Please Try Again" + error,
        newskus,
        product_skus_description,
      });
    });

  // var purityarr = []
};
exports.editproductdiamond = async (req, res) => {
  const {
    itemname,
    subitemname,
    description,
    diamondid,
    diamondSettings,
    diamondShape,
    stoneCount,
    stoneWeight,
    color,
    clarity,
    diamondtype,
  } = req.body;
  console.log(diamondid);
  let response_obj1 = await models.product_diamonds.update(
    // Values to update
    {
      item_name: itemname,
      sub_item_name: subitemname,
      description: description,
      diamond_settings: diamondSettings,
      diamond_shape: diamondShape,
      stone_count: stoneCount,
      stone_weight: stoneWeight,
      diamond_colour: color,
      diamond_clarity: clarity,
      diamond_type: diamondtype,
    },
    {
      // Clause
      where: {
        id: diamondid,
      },
    }
  );
  if (response_obj1[0] > 0) {
    res.send(200, { message: "success" });
  } else {
    res.send(402, { message: "Try again later" });
  }
};
exports.editproductgemstone = async (req, res) => {
  const {
    id,
    gemstonetype,
    gemstoneSetting,
    gemstoneShape,
    gemstoneSize,
    stoneCount,
    stoneWeight,
    itemname,
    subitemname,
    description,
  } = req.body;
  console.log(id);
  let response_obj1 = await models.product_gemstones.update(
    // Values to update
    {
      gemstone_type: gemstonetype,
      item_name: itemname,
      sub_item_name: subitemname,
      description: description,
      gemstone_setting: gemstoneSetting,
      gemstone_shape: gemstoneShape,
      gemstone_size: gemstoneSize,
      stone_weight: stoneWeight,
      stone_count: stoneCount,
    },
    {
      // Clause
      where: {
        id: id,
      },
    }
  );
  if (response_obj1[0] > 0) {
    res.send(200, { message: "success" });
  } else {
    res.send(402, { message: "Try again later" });
  }
};
exports.updateskuinfo = async (req, res) => {
  const { generatedSku, vendorDeliveryTime, discount, isdefault, isActive, isReadyToShip } = req.body;
  let response_obj1 = await models.trans_sku_lists.update(
    // Values to update
    {
      vendor_delivery_time: vendorDeliveryTime,
      isdefault: isdefault,
      is_active: isActive,
      discount_desc: discount,
      is_ready_to_ship: isReadyToShip,
    },
    {
      // Clause
      where: {
        generated_sku: generatedSku,
      },
    }
  );
  if (response_obj1[0] > 0) {
    res.send(200, { message: "success" });
  } else {
    res.send(402, { message: "Try again later" });
  }
};
exports.updateskupriceinfo = async (req, res) => {
  const {
    generatedSku,
    costPrice,
    costPriceTax,
    sellingPrice,
    markupPrice,
    discountPrice,
    sellingPriceTax,
    markupPriceTax,
    discountPriceTax,
  } = req.body;
  let response_obj1 = await models.trans_sku_lists.update(
    // Values to update
    {
      cost_price: costPrice,
      selling_price: sellingPrice,
      markup_price: markupPrice,
      discount_price: discountPrice,
      cost_price_tax: costPriceTax,
      selling_price_tax: sellingPriceTax,
      markup_price_tax: markupPriceTax,
      discount_price_tax: discountPriceTax,
    },
    {
      // Clause
      where: {
        generated_sku: generatedSku,
      },
    }
  );
  if (response_obj1[0] > 0) {
    res.send(200, { message: "success" });
  } else {
    res.send(402, { message: "Try again later" });
  }
};
exports.editproduct = async (req, res) => {
  const {
    productId,
    productName,
    themes,
    styles,
    occassions,
    collections,
    stonecount,
    stonecolour,
    gender,
    length,
    height,
    description,
    minOrderQty,
    maxOrderQty,
    productType,
    productMetalColor,
    vendorCode,
    earingBacking,
    productSize,
  } = req.body;
  try {
    var product_object = await models.product_lists.findOne({
      include: [
        {
          model: models.product_themes,
          attributes: ["theme_name"],
        },
        {
          model: models.product_styles,
          attributes: ["style_name"],
        },
        {
          model: models.product_occassions,
          attributes: ["occassion_name"],
        },
        {
          model: models.product_collections,
          attributes: ["collection_name"],
        },

        {
          model: models.product_stonecount,
          attributes: ["stonecount"],
        },
        {
          model: models.product_stonecolor,
          attributes: ["stonecolor"],
        },
        {
          model: models.product_gender,
          attributes: ["gender_name"],
        },
        {
          model: models.product_metalcolours,
          attributes: ["product_color"],
        },
      ],
      where: {
        product_id: productId,
      },
    });
    let product_themes = product_object.product_themes;
    let product_styles = product_object.product_styles;
    let product_occassions = product_object.product_occassions;
    let product_collections = product_object.product_collections;
    let product_stones = product_object.product_stonecounts;
    let product_stonecolor = product_object.product_stonecolors;
    let product_gender = product_object.product_genders;
    let product_metalcolours = product_object.product_metalcolours;

    await models.product_collections.update(
      // Values to update
      {
        is_active: false,
      },
      {
        // Clause
        where: {
          product_id: productId,
        },
      }
    );
    await models.product_occassions.update(
      // Values to update
      {
        is_active: false,
      },
      {
        // Clause
        where: {
          product_id: productId,
        },
      }
    );

    let prev_themes = [];
    let prev_styles = [];
    let prev_occassions = [];
    let prev_collections = [];
    let prev_stones = [];
    let prev_stonecolors = [];
    let prev_genders = [];
    let prev_metalcolors = [];
    product_themes.forEach((element) => {
      prev_themes.push(element.theme_name);
    });
    product_occassions.forEach((element) => {
      prev_occassions.push(element.occassion_name);
    });
    product_styles.forEach((element) => {
      prev_styles.push(element.style_name);
    });

    product_collections.forEach((element) => {
      prev_collections.push(element.collection_name);
    });

    product_stones.forEach((element) => {
      prev_stones.push(element.stonecount);
    });
    product_stonecolor.forEach((element) => {
      prev_stonecolors.push(element.stonecolor);
    });

    product_gender.forEach((element) => {
      prev_genders.push(element.gender_name);
    });
    product_metalcolours.forEach((element) => {
      prev_metalcolors.push(element.product_color);
    });
    let theme_names = [];
    let reactive_themes = [];
    themes.forEach((element) => {
      if (prev_themes.indexOf(element.themeName) === -1) {
        var goldobj_val = {
          id: uuidv1(),
          product_id: productId,
          theme_name: element.themeName,
          is_active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        theme_names.push(goldobj_val);
      } else {
        reactive_themes.push(element.themeName);
      }
    });

    await models.product_themes.update(
      {
        is_active: true,
      },
      {
        where: {
          theme_name: {
            [Op.in]: reactive_themes,
          },
          product_id: productId,
        },
      }
    );

    let occassion_names = [];
    let reactive_occassions = [];
    occassions.forEach((element) => {
      if (prev_occassions.indexOf(element.occassionName) === -1) {
        var goldobj_val = {
          id: uuidv1(),
          product_id: productId,
          occassion_name: element.occassionName,
          is_active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        occassion_names.push(goldobj_val);
      } else {
        reactive_occassions.push(element.occassionName);
      }
    });
    await models.product_occassions.update(
      // Values to update
      {
        is_active: true,
      },
      {
        // Clause
        where: {
          occassion_name: {
            [Op.in]: reactive_occassions,
          },
          product_id: productId,
        },
      }
    );
    await models.product_occassions.bulkCreate(occassion_names, {
      individualHooks: true,
    });

    let collection_names = [];
    collections.forEach((element) => {
      if (prev_collections.indexOf(element.collectionName) === -1) {
        var goldobj_val = {
          id: uuidv1(),
          product_id: productId,
          collection_name: element.collectionName,
          is_active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        collection_names.push(goldobj_val);
      }
    });

    await models.product_collections.bulkCreate(collection_names, {
      individualHooks: true,
    });

    let stone_counts = [];
    stonecount.forEach((element) => {
      if (prev_stones.indexOf(element.stonecount) === -1) {
        var goldobj_val = {
          id: uuidv1(),
          product_id: productId,
          stonecount: element.stonecount,
          is_active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        stone_counts.push(goldobj_val);
      }
    });
    await models.product_stonecount.bulkCreate(stone_counts, {
      individualHooks: true,
    });

    let stone_colors = [];
    stonecolour.forEach((element) => {
      if (prev_stonecolors.indexOf(element.stonecolor) === -1) {
        var goldobj_val = {
          id: uuidv1(),
          product_id: productId,
          stonecolor: element.stonecolor,
          is_active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        stone_colors.push(goldobj_val);
      }
    });

    await models.product_stonecolor.bulkCreate(stone_colors, {
      individualHooks: true,
    });

    let gender_names = [];
    let genders_arr = [];
    gender.forEach((element) => {
      genders_arr.push(element.label);
      if (prev_genders.indexOf(element.label) === -1) {
        var goldobj_val = {
          id: uuidv1(),
          product_id: productId,
          gender_name: element.label,
          is_active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        gender_names.push(goldobj_val);
      }
    });

    await models.product_gender.bulkCreate(gender_names, {
      individualHooks: true,
    });
    let style_names = [];

    let reactive_styles = [];
    styles.forEach((element) => {
      if (prev_styles.indexOf(element.styleName) === -1) {
        var goldobj_val = {
          id: uuidv1(),
          product_id: productId,
          style_name: element.styleName,
          is_active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        style_names.push(goldobj_val);
      } else {
        reactive_styles.push(element.styleName);
      }
    });
    await models.product_styles.update(
      // Values to update
      {
        is_active: true,
      },
      {
        // Clause
        where: {
          style_name: {
            [Op.in]: reactive_styles,
          },
          product_id: productId,
        },
      }
    );
    await models.product_styles.bulkCreate(style_names, {
      individualHooks: true,
    });

    let tempMetalColor = [],
      tempReactiveMetalColor = [];
    productMetalColor.forEach((element) => {
      if (prev_metalcolors.indexOf(element.productColor) === -1) {
        let metalColorObj = {
          id: uuidv1(),
          product_color: element.productColor,
          product_id: productId,
          is_active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        tempMetalColor.push(metalColorObj);
      } else {
        tempReactiveMetalColor.push(element.productColor);
      }
    });

    await models.product_metalcolours.update(
      // Values to update
      {
        is_active: true,
      },
      {
        // Clause
        where: {
          product_color: {
            [Op.in]: tempReactiveMetalColor,
          },
          product_id: productId,
        },
      }
    );

    await models.product_metalcolours.bulkCreate(tempMetalColor, {
      individualHooks: true,
    });

    let trans_sku_lists = await models.trans_sku_lists.update(
      {
        min_order_qty: minOrderQty,
        max_order_qty: maxOrderQty,
        sku_size: productSize,
      },
      {
        returning: true,
        logging: console.log,
        raw: true,
        where: { product_id: productId },
      }
    );
    if (trans_sku_lists && trans_sku_lists.length > 1) {
      await models.trans_sku_descriptions.update(
        {
          sku_description: description,
        },
        {
          where: { sku_id: trans_sku_lists[1][0].sku_id },
          logging: console.log,
        }
      );
    }

    await models.product_lists.update(
      // Values to update
      {
        product_name: productName,
        gender: genders_arr.join(),
        length,
        height,
        product_type: productType.toLowerCase(),
        vendor_code: vendorCode,
        earring_backing: earingBacking,
      },
      {
        // Clause
        where: {
          product_id: productId,
        },
      }
    );

    //product_object['product_name'] = "testing"
    // await product_object.update({
    //     product_name : productName
    // })
    res.status(200).send(prev_genders);
  } catch (error) {
    console.log(error);
    res.status(500, { message: error.message });
  }
};

exports.disableproduct = async (req, res) => {
  const { productid, isactive } = req.body;
  await models.product_lists.update(
    // Values to update
    {
      isactive: isactive,
    },
    {
      // Clause
      where: {
        product_id: productid,
      },
    }
  );

  res.send(200, { message: "Updated Successfully" });
};

exports.getproductlist = async (req, res) => {
  const { size, offset, productcategory, producttype, searchtext, order, orderby } = req.body;
  let whereclause = {};
  var sort = "DESC";
  var orderbycolumn = "updatedAt";
  if (orderby) {
    orderbycolumn = orderby;
  }
  if (order) {
    sort = order.toUpperCase();
  }
  //    if(order)
  //    {
  //     sort = 'ASC'
  //    }
  if (searchtext) {
    whereclause = {
      [Op.or]: [
        {
          product_id: {
            [Op.iLike]: "%" + searchtext + "%",
          },
        },
        {
          product_name: {
            [Op.iLike]: "%" + searchtext + "%",
          },
        },
      ],
    };
  }
  if (productcategory) {
    whereclause["product_category"] = productcategory;
  }

  if (producttype) {
    whereclause["product_type"] = producttype;
  }

  let products = await models.product_lists.findAndCountAll({
    include: {
      model: models.trans_sku_lists,
      attributes: ["sku_id", "generated_sku"],
    },
    where: whereclause,
    offset: offset,
    limit: size,
    order: [[orderbycolumn, sort]],
  });

  res.send(200, { products });
};

exports.getorderlist = async (req, res) => {
  const { size, offset, searchtext, order, orderby } = req.body;
  let whereclause = {};
  var sort = "DESC";
  var orderbycolumn = "updatedAt";
  if (orderby) {
    orderbycolumn = orderby;
  }
  if (order) {
    sort = order.toUpperCase();
  }
  //    if(order)
  //    {
  //     sort = 'ASC'
  //    }
  if (searchtext) {
    whereclause = {
      [Op.or]: [
        {
          product_id: {
            [Op.iLike]: "%" + searchtext + "%",
          },
        },
        {
          product_name: {
            [Op.iLike]: "%" + searchtext + "%",
          },
        },
      ],
    };
  }

  let orders = await models.orders.findAndCountAll({
    include: [
      {
        model: models.shopping_cart,
        include: [
          {
            model: models.shopping_cart_item,
          },
        ],
      },
    ],
    where: whereclause,
    offset: offset,
    limit: size,
    order: [[orderbycolumn, sort]],
  });

  res.send(200, { orders });
};

exports.getorderdetails = async (req, res) => {
  const { order_id } = req.body;
  let whereclause = {
    id: order_id,
  };

  let orders = await models.orders.findOne({
    include: [
      {
        model: models.user_profiles,
      },

      {
        model: models.shopping_cart,
        include: [
          {
            model: models.shopping_cart_item,
            include: [
              {
                model: models.trans_sku_lists,
              },
            ],
          },
          {
            model: models.giftwrap,
          },
          {
            model: models.cart_address,
            where: {
              address_type: 1,
            },
          },
        ],
      },
    ],
    where: whereclause,
  });

  res.send(200, { orders });
};

exports.getproducturl = async (req, res) => {
  const { productid } = req.body;

  let sku_details = await models.trans_sku_lists.findOne({
    attributes: ["sku_url"],
    where: {
      isdefault: true,
      product_id: productid,
    },
  });
  let url = `${process.env.baseurl + sku_details.sku_url}`;
  console.log(sku_details.sku_url, "=====================================>")
  res.status(200).send({ url: url });
};

exports.productdetails = async (req, res) => {
  const { size, offset, productcategory, producttype, searchtext, order, orderby } = req.body;
  let whereclause = {
    isactive: true,
  };

  let products = await models.product_lists.findAll({
    where: whereclause,
    attributes: ["product_type", "product_category"],
    include: [
      {
        model: models.trans_sku_lists,
        attributes: ["purity", "diamond_type", "generated_sku", "sku_url"],
        include: [
          {
            model: models.trans_sku_descriptions,
          },
        ],
        where: {
          isdefault: true,
        },
      },
      {
        model: models.product_images,
        attributes: ["image_url"],
        where: {
          isdefault: true,
          image_position: 1,
        },
      },
      {
        model: models.product_materials,
        attributes: ["material_name"],
      },
    ],
    where: {
      isactive: true,
    },
  });
  var res_json = [];
  products.forEach((prod) => {
    let materials = [];
    prod.product_materials.forEach((mat_obj) => {
      materials.push(mat_obj.material_name);
    });
    var res_json_obj = {
      id: prod.trans_sku_lists[0].generated_sku,
      description: prod.trans_sku_lists[0].trans_sku_description.sku_description,
      google_product_category: prod.product_category,
      product_type: prod.product_type,
      link: prod.trans_sku_lists[0].sku_url,
      image_link: prod.product_images.length > 0 ? prod.product_images[0].image_url : "",
      condition: "new",
      availability: "In Stock",
      price: "INR" + prod.trans_sku_lists[0].markup_price,
      sale_price: "INR" + prod.trans_sku_lists[0].selling_price,
      sale_price_effective_date: "2019-06-30T0:00",
      brand: "Stylori",
      color: prod.trans_sku_lists[0].metal_color,
      metal: materials,
    };
    res_json.push(res_json_obj);
  });
  res.send(200, { res_json });
};

exports.csvDownload = (req, res) => {
  let { type } = req.body;
  if (!type || type == "" || type.includes("%")) {
    return res.status(400).send({ message: "type is mandatory!" });
  }
  let query = `query($after: Cursor, $type: String!) {
    product: allProductLists(
      first: 10000
      after: $after
      condition: { isactive: true }
      filter: { productType: { likeInsensitive: $type } }
      orderBy: CREATED_AT_DESC
    ) {
      nodes {
        productId
        productName
        productCategory
        productType
        length
        height
        width
        defaultWeight
        sizeVarient
        colourVarient
        earringBacking
        gender
  
        productVendorCode
        isactive
        materials: productMaterialsByProductSku {
          nodes {
            name: materialName
          }
        }
        collections: productCollectionsByProductId(
          condition: { isActive: true }
        ) {
          nodes {
            name: collectionName
          }
        }
        occasions: productOccassionsByProductId(condition: { isActive: true }) {
          nodes {
            name: occassionName
          }
        }
        themes: productThemesByProductId(condition: { isActive: true }) {
          nodes {
            name: themeName
          }
        }
        stoneColor: productStonecolorsByProductId {
          nodes {
            color: stonecolor
          }
        }
        styles: productStylesByProductId(condition: { isActive: true }) {
          nodes {
            name: styleName
          }
        }
        stoneCount: productStonecountsByProductId {
          nodes {
            count: stonecount
          }
        }
        diamonds: productDiamondsByProductSku {
          nodes {
            diamondClarity
            diamondColour
            diamondSettings
            diamondShape
            diamondType
            stoneCount
            stoneWeight
          }
        }
        gemstones: productGemstonesByProductSku {
          nodes {
            gemstoneSetting
            gemstoneShape
            gemstoneSize
            gemstoneType
            gemstonsSize
            stoneCount
            stoneWeight
          }
        }
        skus: transSkuListsByProductId {
          nodes {
            tagNo: generatedSku
            diamondType
            metalColor
            purity
            isdefault
            isReadyToShip
            costPrice
            sellingPrice
            markupPrice
            discountPrice
            discount
            discountDesc
            skuWeight
            vendorDeliveryTime
            transSkuDescriptionsBySkuId {
              nodes {
                skuDescription
                certificate
                ringsizeImage
              }
            }
            createdAt
            updatedAt
            minOrderQty
            maxOrderQty
          }
        }
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
  
  `;
  let responseArrays = [];
  const axios = require("axios");
  function loadData({ cursor }) {
    axios
      .post(`${process.env.apiurl}/graphql`, {
        query,
        variables: { after: cursor, type },
      })
      .then(
        ({
          data: {
            data: {
              product: { nodes, pageInfo },
            },
          },
        }) => {
          console.log("==========================", nodes);
          if (nodes && nodes.length > 0) {
            for (let index = 0; index < nodes.length; index++) {
              let item = nodes[index];
              let diamonds = JSON.stringify(item.diamonds.nodes);
              let gemstones = JSON.stringify(item.gemstones.nodes);
              for (let i = 0; i < item.skus.nodes.length; i++) {
                const sku = item.skus.nodes[i];
                if (sku) {
                  responseArrays.push({
                    name: item.productName,
                    product_id: item.productId,
                    tag_no: sku.tagNo,
                    categories: item.productCategory,
                    type: item.productType,
                    gender: item.gender,
                    purity: sku.purity,
                    weight: sku.skuWeight,
                    cost_price: sku.costPrice,
                    selling_price: sku.sellingPrice,
                    markup_price: sku.markupPrice,
                    discount_price: sku.discountPrice,
                    discount: sku.discount,
                    discount_description: sku.discountDesc,
                    // vendor: item.vendor.name,
                    vendor_product_code: item.productVendorCode,
                    vendor_delivery_time: item.vendorDeliveryTime,
                    height: item.height,
                    width: item.width,
                    length: item.length,
                    created_at: moment(sku.created_at).format("DD-MM-YYYY"),
                    last_updated_at: moment(sku.updatedAt).format("DD-MM-YYYY"),
                    is_active: item.isactive,
                    is_ready_to_ship: sku.isReadyToShip,
                    is_default: sku.isdefault,
                    diamond_type: sku.diamondType,
                    metal_color: sku.metalColor,
                    materials: item.materials.nodes.map((i) => i.name).join(","),
                    collections: item.collections.nodes.map((i) => i.name).join(","),
                    occasions: item.occasions.nodes.map((i) => i.name).join(","),
                    themes: item.themes.nodes.map((i) => i.name).join(","),
                    styles: item.styles.nodes.map((i) => i.name).join(","),
                    stone_color: item.stoneColor.nodes.map((i) => i.color).join(","),
                    stone_count: item.stoneCount.nodes.map((i) => i.count).join(","),
                    diamonds,
                    gemstones,
                    minimum_order_quantity: sku.minOrderQty,
                    maximum_order_quantity: sku.maxOrderQty,
                    size_varient: item.sizeVarient,
                    color_varient: item.colourVarient,
                    earring_backing: item.earingBacking,
                  });
                }
              }
            }
          }
          if (pageInfo.hasNextPage) {
            loadData({ cursor: pageInfo.endCursor });
          } else {
            return res.status(200).send(responseArrays);
          }
        }
      )
      .catch((error) => {
        console.error(error);
        res.status(500).send(error);
      });
  }
  loadData({ cursor: null });
};
