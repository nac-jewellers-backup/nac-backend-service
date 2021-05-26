const models = require("./../models");
import "dotenv/config";
const Op = require("sequelize").Op;
const sequelize = require("sequelize");

import apidata from "./apidata.json";
const uuidv1 = require("uuid/v1");
var splitArray = require("split-array");
var silverpricerange = [
  { label: "Below 10000", min: 1000, max: 10000 },
  { label: "10001 - 25000", min: 10001, max: 20000 },
  { label: "25001 - 50000", min: 20001, max: 30000 },
  //{ label: "30001 - 40000", min: 30001, max: 40000 },
  //{ label: "40001 - 50000", min: 40001, max: 50000 },
  { label: "Above 50001", min: 50001, max: 200000 },
];
exports.filteroptions = async (req, res) => {
  const {
    material,
    category,
    theme,
    collection,
    occasion,
    style,
    metalpurity,
    producttype,
    stoneshape,
    gender,
    stonecolor,
    metalcolor,
    noofstones,
    availability,
    bydesign,
    byweight,
    offer_min,
    offer_max,
  } = req.body;
  var product_list = [];
  var whereclause = {
    isactive: true,
  };
  var category_filter = {};
  var includeclause = [];
  var seofilterattribute = [];
  var seofilterattributevalue = [];

  if (category) {
    if (category == "goldcoins") {
      seofilterattribute.push("Category");
      seofilterattributevalue.push("goldcoins");
      category_filter["name"] = "Gold Coins";
      whereclause["product_category"] = "Gold Coins";
      includeclause.push({
        model: models.trans_sku_lists,
      });
      whereclause["$trans_sku_lists.is_active$"] = {
        [Op.eq]: true,
      };
    } else {
      seofilterattribute.push("Category");
      seofilterattributevalue.push(category);
      category_filter["name"] = category;
      whereclause["product_category"] = category;
    }
  } else {
    seofilterattribute.push("Category");
    seofilterattributevalue.push("Jewellery");
  }
  if (bydesign) {
    seofilterattribute.push("By Design");
    seofilterattributevalue.push(bydesign);
    //whereclause['by_design'] = bydesign
    whereclause["$product_by_designs.design_name$"] = {
      [Op.eq]: bydesign,
    };
    includeclause.push({
      model: models.product_by_design,
    });
  }
  if (offer_max) {
    let seoval = "Upto " + offer_max + "%";
    seofilterattribute.push("Offers");
    seofilterattributevalue.push(seoval);
  }
  if (byweight) {
    seofilterattribute.push("By Weight");
    seofilterattributevalue.push(byweight);
    // whereclause['by_weight'] = byweight
    whereclause["$product_by_weights.weight$"] = {
      [Op.eq]: byweight,
    };
    includeclause.push({
      model: models.product_by_weight,
    });
  }
  if (availability) {
    // let avail_str = ""
    // if(availability === "1")
    // {
    //   avail_str = "1 Day Shipping"
    // }
    // if(availability === "5")
    // {
    //   avail_str = "5 Day Shipping"
    // }
    // if(availability === "10")
    // {
    //   avail_str = "10 Day Shipping"

    // }
    // if(availability === "7")
    // {
    //   avail_str = "7 Day Shipping"

    // } if(availability === "10+")
    // {
    //   avail_str = "10 & Above Days Shipping"
    // }
    seofilterattribute.push("Availability");
    seofilterattributevalue.push(availability);
  }
  // [
  //   {
  //    model : models.product_materials
  //   },
  //   {
  //     model : models.product_themes
  //    },{
  //     model : models.product_occassions
  //    },
  //    {
  //     model : models.product_styles
  //    }]

  // '$product_materials.material_name$':
  //       {
  //       [Op.eq]:material
  //       },
  //       '$product_themes.theme_name$':
  //       {
  //       [Op.eq]:theme
  //       },
  //       '$product_occassions.occassion_name$':
  //           {
  //           [Op.eq]:occassion
  //         },
  //         '$product_styles.style_name$':
  //           {
  //           [Op.eq]:style
  //           },
  if (material) {
    /* if (material == "Silver") {
      silverpricerange = [
        {
          label: "Under 999",
          min: 0,
          max: 999,
        },
        {
          label: "999 - 2000",
          min: 1000,
          max: 2000,
        },
        {
          label: "2001 - 5000",
          min: 2001,
          max: 5000,
        },
        {
          label: "5001 - 8000",
          min: 5001,
          max: 8000,
        },
        {
          label: "Above 8000",
          min: 8001,
          max: 100000,
        },
      ];
    } */
    seofilterattribute.push("Material");
    seofilterattributevalue.push(material);

    whereclause["$product_materials.material_name$"] = {
      [Op.eq]: material,
    };
    includeclause.push({
      model: models.product_materials,
    });
  }
  if (collection) {
    seofilterattribute.push("Collection");
    seofilterattributevalue.push(collection);
    whereclause["$product_collections.collection_name$"] = {
      [Op.eq]: collection,
    };
    includeclause.push({
      model: models.product_collections,
    });
  }
  if (occasion) {
    seofilterattribute.push("Occasion");
    seofilterattributevalue.push(occasion);
    whereclause["$product_occassions.occassion_name$"] = {
      [Op.eq]: occasion,
    };
    includeclause.push({
      model: models.product_occassions,
    });
  }

  if (stoneshape) {
    seofilterattribute.push("Stone Shape");
    seofilterattributevalue.push(stoneshape);

    whereclause["$product_gemstones.gemstone_shape$"] = {
      [Op.eq]: stoneshape,
    };
    includeclause.push({
      model: models.product_gemstones,
    });
  }
  if (style) {
    seofilterattribute.push("Style");
    seofilterattributevalue.push(style);
    whereclause["$product_styles.style_name$"] = {
      [Op.eq]: style,
    };
    includeclause.push({
      model: models.product_styles,
    });
  }
  if (theme) {
    seofilterattribute.push("Theme");
    seofilterattributevalue.push(theme);
    whereclause["$product_themes.theme_name$"] = {
      [Op.eq]: theme,
    };
    includeclause.push({
      model: models.product_themes,
    });
  }

  if (stonecolor) {
    seofilterattribute.push("Stone Color");
    seofilterattributevalue.push(stonecolor);
    whereclause["$product_stonecolors.stonecolor$"] = {
      [Op.eq]: stonecolor,
    };
    includeclause.push({
      model: models.product_stonecolor,
    });
  }

  if (noofstones) {
    seofilterattribute.push("No Of Stones");
    seofilterattributevalue.push(noofstones);
    // whereclause['$product_stonecount.stonecount$'] = {
    //   [Op.eq]:noofstones
    //   }
    //   includeclause.push({
    //          model : models.product_stonecount
    //   })
  }
  if (producttype) {
    seofilterattribute.push("Product Type");
    seofilterattributevalue.push(producttype);

    whereclause["product_type"] = {
      [Op.eq]: producttype,
    };
  }

  if (metalpurity) {
    seofilterattribute.push("Metal Purity");
    seofilterattributevalue.push(metalpurity);
    whereclause["$product_purities.purity$"] = {
      [Op.eq]: metalpurity,
    };
    includeclause.push({
      model: models.product_purities,
    });
  }

  if (gender) {
    seofilterattribute.push("Gender");
    seofilterattributevalue.push(gender);
    whereclause["$product_genders.gender_name$"] = {
      [Op.eq]: gender,
    };
    includeclause.push({
      model: models.product_gender,
    });
  }
  var products = await models.product_lists.findAll({
    attributes: ["product_id"],
    include: includeclause,
    where: whereclause,
  });
  products.forEach((element) => {
    product_list.push(element.product_id);
  });

  var master_category = await models.master_product_categories.findAll({
    where: category_filter,
  });

  let prod_type_where = {};

  if (product_list.length) {
    prod_type_where = {
      product_id: {
        [Op.in]: product_list,
      },
    };
  }

  var master_stonecolor = await models.product_stonecolor.findAll({
    attributes: ["stonecolor"],
    group: ["stonecolor"],
    where: prod_type_where,
  });
  var masterstonecolor = [];
  var product_stonecolor_masters = [];

  master_stonecolor.forEach((stonecolor_obj) => {
    masterstonecolor.push(stonecolor_obj.stonecolor);
  });
  if (masterstonecolor.length > 0) {
    product_stonecolor_masters = await models.master_stones_colors.findAll({
      attributes: ["name"],
      where: {
        name: {
          [Op.in]: masterstonecolor,
        },
        is_active: true,
        is_filter: true,
      },
      order: [["filter_order", "ASC"]],
    });
  }

  var master_byweight = await models.product_by_weight.findAll({
    attributes: ["weight"],
    group: ["weight"],
    where: prod_type_where,
  });

  var masterbyweight = [];
  var product_byweight_masters = [];

  master_byweight.forEach((byweight_obj) => {
    masterbyweight.push(byweight_obj.weight);
  });
  if (masterbyweight.length > 0) {
    product_byweight_masters = await models.master_weights.findAll({
      attributes: ["name"],
      where: {
        name: {
          [Op.in]: masterbyweight,
        },
        is_active: true,
        is_filter: true,
      },
      order: [["filter_order", "ASC"]],
    });
  }

  var master_bydesign = await models.product_by_design.findAll({
    attributes: ["design_name"],
    group: ["design_name"],
    where: prod_type_where,
  });
  var masterbydesign = [];
  var product_bydesign_masters = [];

  master_bydesign.forEach((bydesign_obj) => {
    masterbydesign.push(bydesign_obj.design_name);
  });
  if (masterbydesign.length > 0) {
    product_bydesign_masters = await models.master_designs.findAll({
      attributes: ["name"],
      where: {
        name: {
          [Op.in]: masterbydesign,
        },
        is_active: true,
        is_filter: true,
      },
      order: [["filter_order", "ASC"]],
    });
  }

  var master_stonecount = await models.product_stonecount.findAll({
    attributes: ["stonecount"],
    group: ["stonecount"],
    where: prod_type_where,
  });
  var masterstonecount = [];
  var product_stonecount_masters = [];

  master_stonecount.forEach((stonecount_obj) => {
    masterstonecount.push(stonecount_obj.stonecount);
  });
  if (masterstonecount.length > 0) {
    product_stonecount_masters = await models.master_stones.findAll({
      attributes: ["name"],
      where: {
        name: {
          [Op.in]: masterstonecount,
        },
        is_active: true,
        is_filter: true,
      },
      order: [["filter_order", "ASC"]],
    });
  }

  var master_product_type = await models.product_lists.findAll({
    attributes: ["product_type"],
    group: ["product_type"],
    where: prod_type_where,
  });
  var mastervalues = [];
  var product_type_masters = [];
  master_product_type.forEach((product__type_obj) => {
    mastervalues.push(product__type_obj.product_type);
  });
  if (mastervalues.length > 0) {
    product_type_masters = await models.master_product_types.findAll({
      attributes: ["name"],
      where: {
        name: {
          [Op.in]: mastervalues,
        },
        is_active: true,
        is_filter: true,
      },
      order: [["display_order", "ASC"]],
    });
  }

  var master_styles = await models.product_styles.findAll({
    attributes: ["style_name"],
    group: ["style_name"],
    where: prod_type_where,
    order: [["style_name", "ASC"]],
  });

  var masterstyles = [];
  var product_style_masters = [];

  master_styles.forEach((style_obj) => {
    masterstyles.push(style_obj.style_name);
  });
  if (masterstyles.length > 0) {
    product_style_masters = await models.master_styles.findAll({
      attributes: ["name"],
      where: {
        name: {
          [Op.in]: masterstyles,
        },
        is_active: true,
        is_filter: true,
      },
      order: [["filter_order", "ASC"]],
    });
  }

  var theme_whereclause = {
    theme_name: {
      [Op.ne]: null,
    },
  };
  if (product_list.length > 0) {
    theme_whereclause = {
      theme_name: {
        [Op.ne]: null,
      },
      product_id: {
        [Op.in]: product_list,
      },
    };
  }

  var master_themes = await models.product_themes.findAll({
    attributes: ["theme_name"],
    group: ["theme_name"],
    where: theme_whereclause,
    order: [["theme_name", "ASC"]],
  });

  var masterthemes = [];
  var product_theme_masters = [];

  master_themes.forEach((theme_obj) => {
    masterthemes.push(theme_obj.theme_name);
  });
  if (masterthemes.length > 0) {
    product_theme_masters = await models.master_themes.findAll({
      attributes: ["name"],
      where: {
        name: {
          [Op.in]: masterthemes,
        },
        is_active: true,
        is_filter: true,
      },
      order: [["filter_order", "ASC"]],
    });
  }

  var master_occassion = await models.product_occassions.findAll({
    attributes: ["occassion_name"],
    group: ["occassion_name"],
    where: prod_type_where,
    order: [["occassion_name", "ASC"]],
  });

  var masteroccassions = [];
  var product_occasion_masters = [];

  master_occassion.forEach((occass_obj) => {
    masteroccassions.push(occass_obj.occassion_name);
  });
  if (masteroccassions.length > 0) {
    product_occasion_masters = await models.master_occasions.findAll({
      attributes: ["name"],
      where: {
        name: {
          [Op.in]: masteroccassions,
        },
        is_active: true,
        is_filter: true,
      },
      order: [["filter_order", "ASC"]],
    });
  }

  let material_whereclause = {};
  if (product_list.length > 0) {
    material_whereclause = {
      product_sku: {
        [Op.in]: product_list,
      },
    };
  }

  var master_material = await models.product_materials.findAll({
    attributes: ["material_name"],
    group: ["material_name"],
    where: material_whereclause,
    order: [["material_name", "ASC"]],
  });
  var mastermaterial = [];
  var product_material_masters = [];

  master_material.forEach((material_obj) => {
    mastermaterial.push(material_obj.material_name);
  });
  if (mastermaterial.length > 0) {
    product_material_masters = await models.master_materials.findAll({
      attributes: ["name"],
      where: {
        name: {
          [Op.in]: mastermaterial,
        },
        is_active: true,
        is_filter: true,
      },
      order: [["filter_order", "ASC"]],
    });
  }

  var gemstone_shape = await models.product_gemstones.findAll({
    attributes: ["gemstone_shape"],
    group: ["gemstone_shape"],
    where: material_whereclause,
    order: [["gemstone_shape", "ASC"]],
  });
  var mastergemstone = [];
  var product_gemstone_masters = [];

  gemstone_shape.forEach((gemstone_obj) => {
    mastergemstone.push(gemstone_obj.gemstone_shape);
  });
  if (mastergemstone.length > 0) {
    product_gemstone_masters = await models.master_gemstones_shapes.findAll({
      attributes: ["name"],
      where: {
        name: {
          [Op.in]: mastergemstone,
        },
        is_active: true,
        is_filter: true,
      },
      order: [["filter_order", "ASC"]],
    });
  }

  let collection_whereclause = {};
  if (product_list.length > 0) {
    collection_whereclause = {
      product_id: {
        [Op.in]: product_list,
      },
    };
  }
  var master_collection = await models.product_collections.findAll({
    attributes: ["collection_name"],
    group: ["collection_name"],
    where: collection_whereclause,
    order: [["collection_name", "ASC"]],
  });
  var mastercollection = [];
  var product_collection_masters = [];

  master_collection.forEach((collection_obj) => {
    mastercollection.push(collection_obj.collection_name);
  });
  if (mastercollection.length > 0) {
    product_collection_masters = await models.master_collections.findAll({
      attributes: ["name"],
      where: {
        name: {
          [Op.in]: mastercollection,
        },
        is_active: true,
        is_filter: true,
      },
      order: [["filter_order", "ASC"]],
    });
  }

  let purity_where = {};
  if (product_list.length > 0) {
    purity_where = {
      product_id: {
        [Op.in]: product_list,
      },
    };
  }

  var master_purity = await models.product_purities.findAll({
    attributes: ["purity"],
    group: ["purity"],
    where: purity_where,
    order: [["purity", "ASC"]],
  });
  var masterpurities = [];
  var product_purity_masters = [];

  master_purity.forEach((purity_obj) => {
    masterpurities.push(purity_obj.purity);
  });
  if (masterpurities.length > 0) {
    product_purity_masters = await models.master_metals_purities.findAll({
      attributes: ["name"],
      where: {
        name: {
          [Op.in]: masterpurities,
        },
        is_active: true,
        is_filter: true,
      },
      order: [["filter_order", "ASC"]],
    });
  }

  var master_gender = await models.product_gender.findAll({
    attributes: ["gender_name"],
    group: ["gender_name"],
    where: purity_where,
    order: [["gender_name", "ASC"]],
  });
  var mastergender = [];
  var product_gender_masters = [];

  master_gender.forEach((gender_obj) => {
    mastergender.push(gender_obj.gender_name);
  });
  if (mastergender.length > 0) {
    product_gender_masters = await models.master_genders.findAll({
      attributes: ["name"],
      where: {
        name: {
          [Op.in]: mastergender,
        },
        is_active: true,
        is_filter: true,
      },
      order: [["filter_order", "ASC"]],
    });
  }

  var metalcolor_where = {
    product_color: {
      [Op.ne]: null,
    },
  };

  if (product_list.length > 0) {
    metalcolor_where = {
      product_color: {
        [Op.ne]: null,
      },
      product_id: {
        [Op.in]: product_list,
      },
    };
  }
  if (metalcolor) {
    metalcolor_where = {
      product_color: metalcolor,
    };

    seofilterattribute.push("Metal Color");
    seofilterattributevalue.push(metalcolor);
  }
  var seo_url = "";
  var seo_text = "";
  //var master_colors = []
  var master_colors = await models.product_metalcolours.findAll({
    attributes: ["product_color"],
    group: ["product_color"],
    where: metalcolor_where,
    order: [["product_color", "ASC"]],
  });
  var mastercolor = [];
  var product_color_masters = [];

  master_colors.forEach((color_obj) => {
    mastercolor.push(color_obj.product_color);
  });
  if (mastercolor.length > 0) {
    product_color_masters = await models.master_metals_colors.findAll({
      attributes: ["name"],
      where: {
        name: {
          [Op.in]: mastercolor,
        },
        is_active: true,
        is_filter: true,
      },
      order: [["filter_order", "ASC"]],
    });
  }

  // var price_range2 = await models.trans_sku_lists.findOne({
  //   attributes:["selling_price"]
  // ,
  //  where: {
  //    "product_id":{
  //      [Op.in] : product_list
  //    }
  //  },
  //   order: [
  //     ['selling_price', 'ASC']
  //   ]
  // })
  // var price_range1 = await models.trans_sku_lists.findOne({
  //   attributes:["selling_price"]
  // ,
  //   include:[
  //     {
  //       attributes: ['id'],
  //       model : models.product_lists,
  //       require: true
  //     }
  //   ],
  //   where:{
  //     "selling_price" :{
  //       [Op.ne] : null
  //     }
  //   },
  //   limit : 1,
  //   order: [
  //     ['selling_price', 'DESC']
  //   ]
  // })
  // var price_range = {
  //   "min":price_range2.selling_price,
  //   "max":price_range1.selling_price
  // }

  console.log("seoparams");
  console.log(JSON.stringify(seofilterattribute));
  console.log(JSON.stringify(seofilterattributevalue));
  console.log("==========");
  var seooptions = await models.seo_url_priorities.findAll({
    where: {
      attribute_name: {
        [Op.in]: seofilterattribute,
      },
      attribute_value: {
        [Op.in]: seofilterattributevalue,
      },
    },
    order: [["priority", "ASC"]],
  });
  var seourls_arr = [];
  var seotexts_arr = [];

  var banner_image_arr = [];

  seooptions.forEach((element) => {
    seourls_arr.push(element.seo_url);
    seotexts_arr.push(element.seo_text);
    banner_image_arr.push({
      image: element.image_url,
      mobile_image: element.mobile_image_url,
    });
  });
  seo_url = seourls_arr.join("-");
  seo_text = seotexts_arr.join(" ");
  res.send(200, {
    master_category,
    "Product Type": product_type_masters,
    Style: product_style_masters,
    Theme: product_theme_masters,
    Occasion: product_occasion_masters,
    Material: product_material_masters,
    Collection: product_collection_masters,
    "Metal Purity": product_purity_masters,
    "Metal Color": product_color_masters,
    "Stone Shape": product_gemstone_masters,
    Gender: product_gender_masters,
    "Stone Color": product_stonecolor_masters,
    "No Of Stones": master_stonecount,
    // price_range,
    "By Design": product_bydesign_masters,
    Offers: ["Up to  20%", "Up to  30%", "Up to  40%", "Up to  50%"],
    Availability: ["1 Day Shipping", "10 & Above Days Shipping"],

    "By Weight": product_byweight_masters,
    price: silverpricerange,
    seo_url,
    seo_text,
    seo_banner: banner_image_arr,
  });
};
