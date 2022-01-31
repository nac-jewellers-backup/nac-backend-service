const models = require("./../models");
import "dotenv/config";
const Op = require("sequelize").Op;
const sequelize = require("sequelize");
import { sendMail } from "./notify/user_notify";
import apidata from "./apidata.json";
const uuidv1 = require("uuid/v1");
var splitArray = require("split-array");

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
    price,
    gender,
    stonecolor,
    metalcolor,
    noofstones,
    availability,
    sortBy,
    offset,
    bydesign,
    byweight,
  } = req.body;
  var product_list = [];
  var whereclause = {
    isactive: true,
  };
  var skusort = {};
  var sortelement = [];
  var prod_iclude = [];
  var skuwhereclause = {};
  var includeclause = [];
  var defaultskuwhereclause = {};
  var imagewhereclause = {
    isdefault: true,
    image_position: {
      [Op.in]: [1, 2],
    },
  };
  //skuwhereclause['isdefault']  = true

  defaultskuwhereclause["isdefault"] = true;
  var isproduct_query = false;
  var currentpage = 0;
  //sortelement = sequelize.random()
  if (offset) {
    currentpage = offset;
  }
  // var seofilterattributevalue = []
  //   seofilterattribute.push('Category')
  //   seofilterattributevalue.push(product_category)
  if (category) {
    if (category == "goldcoins") {
      whereclause = {
        product_category: "Gold Coins",
        isactive: true,
      };
    } else {
      whereclause = {
        product_category: category,
        isactive: true,
      };
    }
  }
  if (sortBy) {
    if (sortBy === "Featured") {
      isproduct_query = true;
      sortelement = [["is_featured", "ASC"]];
    }
    if (sortBy === "New To Stylori") {
      // isproduct_query = true
      sortelement = [['"createdAt"', "DESC"]];
    }
    if (sortBy === "Ready To Ship") {
      // defaultskuwhereclause = {}
      // defaultskuwhereclause['is_ready_to_ship'] = true
      sortelement = [
        [{ model: models.trans_sku_lists }, "is_ready_to_ship", "desc"],
      ];
      skusort = [["is_ready_to_ship", "desc"]];
    }
    if (sortBy === "Price High to Low") {
      sortelement = [
        [{ model: models.trans_sku_lists }, "markup_price", "desc"],
      ];

      // skusort = [
      //   ['markup_price', 'desc']
      // ]
    }
    if (sortBy === "Price Low to High") {
      sortelement = [
        [{ model: models.trans_sku_lists }, "markup_price", "asc"],
      ];

      // skusort = [
      //   ['markup_price', 'asc']
      // ]
    }
    if (sortBy === "Best Seller") {
      isproduct_query = true;

      sortelement = [["selling_qty", "asc"]];
    }
    console.log("sort issue");
    console.log(JSON.stringify(sortelement));
    //  [{ model: models.trans_sku_lists },  'selling_price', 'desc']
    console.log("updatedatavalue");
    console.log(JSON.stringify(sortBy));

    console.log(JSON.stringify(sortelement));
  }

  if (metalcolor) {
    console.log("metal colur image");
    console.log(JSON.stringify(metalcolor));
    includeclause.push({
      attributes: ["product_color", "product_id", "is_active"],
      model: models.product_metalcolours,
      where: {
        product_color: metalcolor,
      },
    });
    // whereclause['$trans_sku_lists.metal_color$'] = {
    //   [Op.eq]:metalcolor
    //   }
    prod_iclude.push({
      model: models.product_metalcolours,
      // where: {
      //   product_color : metalcolor
      // }
    });

    //  whereclause['$product_metalcolours.product_color$'] = {
    //   [Op.eq] : metalcolor
    //   }
    //skuwhereclause['metal_color'] = metalcolor
    // skuwhereclause['$trans_sku_lists.metal_color$'] = {
    //   [Op.eq] : metalcolor
    //   }
    imagewhereclause = {
      product_color: metalcolor,
      image_position: {
        [Op.in]: [1, 2],
      },
    };
  } else {
    includeclause.push({
      attributes: ["product_color", "product_id", "is_active"],
      model: models.product_metalcolours,
    });
  }
  if (price) {
    if (price.min_price && price.max_price) {
      skuwhereclause["markup_price"] = {
        [Op.between]: [price.min_price, price.max_price],
      };
      whereclause["$trans_sku_lists.markup_price$"] = {
        [Op.between]: [price.min_price, price.max_price],
      };
    }
  }
  //   if(availability)
  //   {
  //     seofilterattribute.push('Availability')
  //     seofilterattributevalue.push(availability)
  //   }
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

  if (collection) {
    // whereclause['$product_collections.collection_name$'] = {
    //   [Op.eq]:collection
    //   }
    includeclause.push({
      attributes: ["collection_name", "product_id", "is_active"],
      model: models.product_collections,
      where: {
        collection_name: collection,
      },
    });
  } else {
    includeclause.push({
      attributes: ["collection_name", "product_id", "is_active"],
      model: models.product_collections,
    });
  }
  if (occasion) {
    // whereclause['$product_occassions.occassion_name$'] = {
    //   [Op.eq]:occasion
    //   }
    includeclause.push({
      attributes: ["occassion_name", "product_id", "is_active"],
      model: models.product_occassions,
      where: {
        occassion_name: occasion,
      },
    });
  } else {
    includeclause.push({
      attributes: ["occassion_name", "product_id", "is_active"],
      model: models.product_occassions,
    });
  }
  if (bydesign) {
    includeclause.push({
      attributes: ["product_id", "design_name", "is_active"],
      model: models.product_by_design,
      where: {
        design_name: bydesign,
      },
    });
  } else {
    includeclause.push({
      attributes: ["product_id", "design_name", "is_active"],
      model: models.product_by_design,
    });
  }

  if (byweight) {
    includeclause.push({
      attributes: ["product_id", "weight", "is_active"],
      model: models.product_by_weight,
      where: {
        weight: byweight,
      },
    });
  } else {
    includeclause.push({
      attributes: ["product_id", "weight", "is_active"],
      model: models.product_by_weight,
    });
  }
  if (stoneshape) {
    // removed
    // whereclause['$product_gemstones.gemstone_shape$'] = {
    //   [Op.eq]:stoneshape
    //   }
    includeclause.push({
      attributes: [
        "gemstone_type",
        "gemstone_shape",
        "gemstone_setting",
        "gemstone_size",
        "stone_count",
        "stone_weight",
        "product_sku",
        "is_active",
      ],
      model: models.product_gemstones,
      where: {
        gemstone_shape: stoneshape,
      },
    });
  } else {
    includeclause.push({
      attributes: [
        "gemstone_type",
        "gemstone_shape",
        "gemstone_setting",
        "gemstone_size",
        "stone_count",
        "stone_weight",
        "product_sku",
        "is_active",
      ],

      model: models.product_gemstones,
    });
  }
  if (style) {
    includeclause.push({
      attributes: ["style_name", "product_id", "is_active"],
      model: models.product_styles,

      where: {
        style_name: style,
      },
    });
    // whereclause['$product_styles.style_name$'] = {
    //   [Op.eq]:style
    //   }
  } else {
    includeclause.push({
      attributes: ["style_name", "product_id", "is_active"],
      model: models.product_styles,
    });
  }
  if (theme) {
    // whereclause['$product_themes.theme_name$'] = {
    //   [Op.eq]:theme
    //   }
    includeclause.push({
      attributes: ["theme_name", "product_id", "is_active"],
      model: models.product_themes,
      where: {
        theme_name: theme,
      },
    });
  } else {
    includeclause.push({
      attributes: ["theme_name", "product_id", "is_active"],
      model: models.product_themes,
    });
  }

  if (stonecolor) {
    // whereclause['$product_stonecolors.stonecolor$'] = {
    //   [Op.eq]:stonecolor
    //   }
    includeclause.push({
      attributes: ["stonecolor", "product_id", "is_active"],
      model: models.product_stonecolor,
      where: {
        stonecolor: stonecolor,
      },
    });
  } else {
    includeclause.push({
      attributes: ["stonecolor", "product_id", "is_active"],
      model: models.product_stonecolor,
    });
  }

  if (noofstones) {
    //  seofilterattribute.push('No Of Stones')
    // seofilterattributevalue.push(noofstones)
    // whereclause['$product_stonecount.stonecount$'] = {
    //   [Op.eq]:noofstones
    //   }
    includeclause.push({
      attributes: ["stonecount", "product_id", "is_active"],
      model: models.product_stonecount,
      where: {
        stonecount: noofstones,
      },
    });
  } else {
    includeclause.push({
      attributes: ["stonecount", "product_id", "is_active"],
      model: models.product_stonecount,
    });
  }
  if (producttype) {
    whereclause["product_type"] = {
      [Op.eq]: producttype,
    };
  }
  if (availability) {
    if (availability === "1 Day Shipping") {
      skuwhereclause["is_ready_to_ship"] = true;
      whereclause["$trans_sku_lists.is_ready_to_ship$"] = {
        [Op.eq]: true,
      };
      whereclause["$trans_sku_lists.is_active$"] = {
        [Op.eq]: true,
      };
    } else if (availability === "10 & Above Days Shipping") {
      skuwhereclause["is_ready_to_ship"] = false;

      skuwhereclause["vendor_delivery_time"] = {
        [Op.gt]: 10,
      };
      whereclause["$trans_sku_lists.is_ready_to_ship$"] = {
        [Op.eq]: false,
      };
      whereclause["$trans_sku_lists.vendor_delivery_time$"] = {
        [Op.gt]: 10,
      };
      whereclause["$trans_sku_lists.is_active$"] = {
        [Op.eq]: true,
      };
    } else {
      skuwhereclause["is_ready_to_ship"] = false;

      skuwhereclause["vendor_delivery_time"] = {
        [Op.eq]: availability,
      };
      whereclause["$trans_sku_lists.is_ready_to_ship$"] = {
        [Op.eq]: false,
      };
      whereclause["$trans_sku_lists.is_ready_to_ship$"] = {
        [Op.gt]: availability,
      };
      whereclause["$trans_sku_lists.is_active$"] = {
        [Op.eq]: true,
      };
    }
  }
  console.log("><><<><><");
  console.log(metalpurity);
  if (metalpurity) {
    console.log("metalpurity class set");
    // includeclause.push({
    //   model : models.trans_sku_lists,
    //   attributes:[
    //       'purity'],
    //     where:{
    //       purity : metalpurity
    //     }
    //  })
    whereclause["$trans_sku_lists.purity$"] = {
      [Op.eq]: metalpurity,
    };
    includeclause.push({
      model: models.product_purities,
      attributes: ["purity"],
      //  where:{
      //   purity : metalpurity
      //  }
    });
    skuwhereclause = {};
    skuwhereclause["purity"] = metalpurity;
    // console.log(JSON.stringify(includeclause))
    // whereclause['$product_purities.purity$']
  }

  if (gender) {
    // whereclause['$product_genders.gender_name$'] = {
    //   [Op.eq]:gender
    //   }
    includeclause.push({
      model: models.product_gender,
      where: {
        gender_name: gender,
      },
    });
  } else {
    includeclause.push({
      model: models.product_gender,
    });
  }

  console.log(JSON.stringify(includeclause));
  // var products_all = await models.product_lists.findAll({
  //       attributes:[['product_name','productName'],
  //     ['product_id','productId'],
  //     ['default_size','defaultSize'],
  //     ['size_varient','sizeVarient'],
  //     ['product_type','productType']
  //     ],
  //   include:includeclause,
  //   where:whereclause,
  //   limit:24,

  // })

  prod_iclude.push({
    model: models.product_diamonds,
    as: "productDiamondsByProductSku",
    attributes: [
      ["diamond_clarity", "diamondClarity"],
      ["diamond_colour", "diamondColour"],
      ["diamond_type", "diamondType"],
      ["stone_weight", "stoneWeight"],
      ["diamond_shape", "diamond_Shape"],
      ["diamond_settings", "diamond_Settings"],
      ["stone_count", "stone_Count"],
    ],
    required: false,
  });
  prod_iclude.push({
    model: models.product_images,
    as: "productImagesByProductId",
    attributes: [
      ["ishover", "ishover"],
      ["image_url", "imageUrl"],
      ["image_position", "imagePosition"],
      ["isdefault", "isdefault"],
    ],
    where: imagewhereclause,
    required: false,
  });
  includeclause.push({
    model: models.product_images,
    as: "product_images",
    attributes: [
      ["ishover", "ishover"],
      ["image_url", "imageUrl"],
      ["image_position", "imagePosition"],
      ["isdefault", "isdefault"],
    ],
    where: imagewhereclause,
    required: false,
  });
  if (material) {
    whereclause["$productMaterialsByProductSku.material_name$"] = {
      [Op.eq]: material,
    };
    includeclause.push({
      model: models.product_materials,
      as: "product_materials",
      attributes: [["material_name", "materialName"]],
      // where:{
      //   material_name : material
      //  }
    });
  } else {
    includeclause.push({
      model: models.product_materials,
      as: "product_materials",
      attributes: [["material_name", "materialName"]],
    });
  }
  var products_all = [];
  // if(isproduct_query)
  // {
  prod_iclude.push({
    model: models.trans_sku_lists,
    attributes: [
      ["sku_size", "skuSize"],
      "purity",
      ["diamond_type", "diamondType"],
      ["markup_price", "markupPrice"],
      ["markup_price", "markupPrice"],
      ["sku_id", "skuID"],
      ["sku_url", "skuUrl"],
      ["selling_price", "sellingPrice"],
      ["discount_price", "discountPrice"],
      ["generated_sku", "generatedSku"],
      ["is_ready_to_ship", "isReadyToShip"],
      ["vendor_delivery_time", "vendorDeliveryTime"],
    ],

    where: skuwhereclause,
    required: false,
    order: skusort,
  });
  includeclause.push({
    model: models.trans_sku_lists,
    where: defaultskuwhereclause,
    distinct: "trans_sku_lists.product_id",
    // sort:[
    //   [
    //     'trans_sku_list.markup','desc'
    //   ]
    // ]
  });
  console.log("XXXXXXXXX");
  console.log(JSON.stringify(whereclause));
  products_all = await models.product_lists.findAll({
    include: includeclause,
    where: whereclause,
    distinct: "product_lists.product_id",
    order: sortelement,
    limit: 100,
  });
  //console.log("count value"+count)
  //console.log("rows value"+rows.length)

  // var product_ids = []
  // rows.forEach(element => {
  //   console.log("rows value"+element.product_id)

  //   product_ids.push(element.product_id)
  // });

  //  products_all = await models.product_lists.findAll ({
  //   attributes:[['product_name','productName'],
  //   ['product_id','productId'],
  //   ['product_type','productType'],
  //   ['default_size','defaultSize'],
  //   ['size_varient','sizeVarient'],
  //   ['product_type','productType'],
  //   'is_featured',
  //   'selling_qty'
  //   ],
  //   include:prod_iclude,
  //   where:{
  //     product_id : {
  //       [Op.in]: product_ids
  //     }
  //   },
  //   order:sortelement,
  // })
  // }else{
  // products_all  = await models.trans_sku_lists.findAndCountAll({
  //   attributes:[
  //     ['sku_size','skuSize'],
  //     'purity',
  //     'product_id',
  //     ['diamond_type','diamondType'],
  //     ['metal_color','metalColor'],
  //     ['markup_price','markupPrice'],
  //     ['selling_price','sellingPrice'],
  //     ['discount_price','discountPrice'],
  //     ['generated_sku','generatedSku'],
  //     ['is_ready_to_ship','isReadyToShip'],
  //     ['vendor_delivery_time','vendorDeliveryTime']],
  //         include:[{
  //           model : models.product_lists,
  //               attributes:[['product_name','productName'],
  //             ['product_id','productId'],
  //             ['default_size','defaultSize'],
  //             ['size_varient','sizeVarient'],
  //             ['product_type','productType'],
  //             'selling_qty',
  //             'is_featured',
  //             'isactive'
  //             ],
  //           where : whereclause,

  //           include:includeclause,

  //         }],
  //         offset: currentpage,
  //         where:skuwhereclause,
  //         subQuery : false,
  //         order: [
  //           ['"markup_price"','ASC']
  //         ],
  //         limit: 24,

  // })

  //}

  res.send(200, { data: products_all });
};

exports.productesearch = async (req, res) => {
  let skuwhere = {};
  let prodwhere = {
    isactive: true,
  };
  if (req.body.product_id) {
    prodwhere["product_id"] = req.body.product_id;
    skuwhere["product_id"] = req.body.product_id;
  }

  let sku_list = await models.trans_sku_lists.findAll({
    attributes: ["generated_sku", "sku_url"],
    where: skuwhere,
  });
  let product_list = await models.product_lists.findAll({
    attributes: ["product_name"],
    include: [
      {
        model: models.trans_sku_lists,
        attributes: ["sku_url"],
        where: {
          isdefault: true,
        },
      },
    ],
    where: prodwhere,
  });

  console.log(JSON.stringify(product_list.length));
  // let seo_list = await models.seo_url_priorities.findAll({
  //   attributes:["attribute_value","seo_url","priority"]
  // })

  let master_product_types = await models.seo_url_priorities.findAll({
    where: {
      attribute_name: "Product Type",
    },
  });
  var product_list_arr = [];
  //let producttype_obj = master_product_types[0]
  let seotext_arr = [];
  let jewel_seo_obj = await models.seo_url_priorities.findOne({
    attributes: ["attribute_value", "seo_url", "priority"],
    where: {
      attribute_value: {
        [Op.eq]: "Jewellery",
      },
    },
  });
  processattrubutes(0);
  async function processattrubutes(indexval) {
    var producttype_obj = master_product_types[indexval];

    var products = await models.product_lists.findAll({
      attributes: ["product_id"],
      where: {
        product_type: producttype_obj.attribute_value,
      },
    });

    products.forEach((element) => {
      product_list_arr.push(element.product_id);
    });

    var master_styles = await models.product_styles.findAll({
      attributes: ["style_name"],
      group: ["style_name"],
      where: {
        product_id: {
          [Op.in]: product_list_arr,
        },
      },
      order: [["style_name", "ASC"]],
    });

    var master_material = await models.product_materials.findAll({
      attributes: ["material_name"],
      group: ["material_name"],
      where: {
        product_sku: {
          [Op.in]: product_list_arr,
        },
      },
      order: [["material_name", "ASC"]],
    });
    var master_purity = await models.product_purities.findAll({
      attributes: ["purity"],
      group: ["purity"],
      where: {
        product_id: {
          [Op.in]: product_list_arr,
        },
      },
      order: [["purity", "ASC"]],
    });
    var master_colors = await models.product_metalcolours.findAll({
      attributes: ["product_color"],
      group: ["product_color"],
      where: {
        product_id: {
          [Op.in]: product_list_arr,
        },
      },
      order: [["product_color", "ASC"]],
    });
    var master_occassion = await models.product_occassions.findAll({
      attributes: ["occassion_name"],
      group: ["occassion_name"],
      where: {
        product_id: {
          [Op.in]: product_list_arr,
        },
      },
      order: [["occassion_name", "ASC"]],
    });
    let styles = [];
    master_styles.forEach((style_name) => {
      styles.push(style_name.style_name);
    });
    master_material.forEach((material_name) => {
      styles.push(material_name.material_name);
    });

    master_purity.forEach((purity_obj) => {
      styles.push(purity_obj.purity);
    });
    master_colors.forEach((color_obj) => {
      styles.push(color_obj.product_color);
    });
    master_occassion.forEach((occassion_name) => {
      styles.push(occassion_name.occassion_name);
    });
    let seo_list = await models.seo_url_priorities.findAll({
      attributes: ["attribute_value", "seo_url", "priority"],
      where: {
        attribute_value: {
          [Op.in]: styles,
        },
      },
    });
    seo_list.forEach((seo_obj) => {
      let response_arr = [];
      response_arr.push(producttype_obj);
      response_arr.push(seo_obj);
      response_arr.push(jewel_seo_obj);

      response_arr.sort(function (a, b) {
        return a.priority > b.priority;
      });
      let seo_text_arr = [];
      let seo_url_arr = [];

      response_arr.map((el) => {
        seo_text_arr.push(el.attribute_value);
        seo_url_arr.push(el.seo_url);
      });

      let seo_txt = {
        seo_url: seo_url_arr.join("-"),
        seo_text: seo_text_arr.join(" "),
      };
      seotext_arr.push(seo_txt);

      // if(seo_obj.priority < producttype_obj.priority)
      // {
      //   var seo_urlval = seo_obj.seo_url+"-"+ producttype_obj.seo_url
      //   var seo_txtval = seo_obj.attribute_value+"-"+ producttype_obj.attribute_value
      //   if(jewel_seo_obj.priority < producttype_obj.priority)
      //   {
      //      seo_urlval = jewel_seo_obj.seo_url+"-"+ seo_urlval
      //      seo_txtval = jewel_seo_obj.attribute_value+" "+ seo_txtval

      //   }else{
      //     seo_urlval = seo_urlval+"-"+ jewel_seo_obj.seo_url
      //     seo_txtval = seo_txtval+" "+ jewel_seo_obj.attribute_value
      //   }
      //   let seo_txt = {
      //     "seo_url":seo_urlval,
      //     "seo_text":seo_txtval

      //   }

      //   seotext_arr.push(seo_txt)
      // }else{

      //   var seo_urlval = producttype_obj.seo_url+"-"+ seo_obj.seo_url
      //   var seo_txtval = producttype_obj.attribute_value+" "+ seo_obj.attribute_value
      //   if(jewel_seo_obj.priority < seo_obj.priority)
      //   {
      //      seo_urlval = jewel_seo_obj.seo_url+"-"+ seo_urlval
      //      seo_txtval = jewel_seo_obj.attribute_value+" "+ seo_txtval

      //   }else{
      //     seo_urlval = seo_urlval+"-"+ jewel_seo_obj.seo_url
      //     seo_txtval = seo_txtval+" "+ jewel_seo_obj.attribute_value
      //   }
      //   let seo_txt = {
      //     "seo_url":seo_urlval,
      //     "seo_text":seo_txtval

      //   }

      //   seotext_arr.push(seo_txt)

      // }
    });
    indexval = indexval + 1;
    if (master_product_types.length > indexval) {
      processattrubutes(indexval);
    } else {
      res.send(200, { product_list, sku_list, seo_list: seotext_arr });
    }
  }
  //  res.send(200,{product_list,sku_list,seo_list:seotext_arr})
};
exports.esearchcombination = async (req, res) => {
  let master_product_types = await models.seo_url_priorities.findAll({
    where: {
      attribute_name: "Product Type",
    },
  });
  var product_list = [];
  //let producttype_obj = master_product_types[0]
  let seotext_arr = [];
  processattrubutes(0);
  async function processattrubutes(indexval) {
    var producttype_obj = master_product_types[indexval];

    var products = await models.product_lists.findAll({
      attributes: ["product_id"],
      where: {
        product_type: producttype_obj.attribute_value,
      },
    });
    products.forEach((element) => {
      product_list.push(element.product_id);
    });

    var master_styles = await models.product_styles.findAll({
      attributes: ["style_name"],
      group: ["style_name"],
      where: {
        product_id: {
          [Op.in]: product_list,
        },
      },
      order: [["style_name", "ASC"]],
    });

    var master_material = await models.product_materials.findAll({
      attributes: ["material_name"],
      group: ["material_name"],
      where: {
        product_sku: {
          [Op.in]: product_list,
        },
      },
      order: [["material_name", "ASC"]],
    });
    var master_purity = await models.product_purities.findAll({
      attributes: ["purity"],
      group: ["purity"],
      where: {
        product_id: {
          [Op.in]: product_list,
        },
      },
      order: [["purity", "ASC"]],
    });
    var master_colors = await models.product_metalcolours.findAll({
      attributes: ["product_color"],
      group: ["product_color"],
      where: {
        product_id: {
          [Op.in]: product_list,
        },
      },
      order: [["product_color", "ASC"]],
    });
    var master_occassion = await models.product_occassions.findAll({
      attributes: ["occassion_name"],
      group: ["occassion_name"],
      where: {
        product_id: {
          [Op.in]: product_list,
        },
      },
      order: [["occassion_name", "ASC"]],
    });
    let styles = [];
    master_styles.forEach((style_name) => {
      styles.push(style_name.style_name);
    });
    master_material.forEach((material_name) => {
      styles.push(material_name.material_name);
    });

    master_purity.forEach((purity_obj) => {
      styles.push(purity_obj.purity);
    });
    master_colors.forEach((color_obj) => {
      styles.push(color_obj.product_color);
    });
    master_occassion.forEach((occassion_name) => {
      styles.push(occassion_name.occassion_name);
    });
    let seo_list = await models.seo_url_priorities.findAll({
      attributes: ["attribute_value", "seo_url", "priority"],
      where: {
        attribute_value: {
          [Op.in]: styles,
        },
      },
    });
    seo_list.forEach((seo_obj) => {
      if (seo_obj.priority < producttype_obj.priority) {
        let seo_txt = {
          seo_url: seo_obj.seo_url + "-" + producttype_obj.seo_url,
          seo_text:
            seo_obj.attribute_value + " " + producttype_obj.attribute_value,
        };

        seotext_arr.push(seo_txt);
      } else {
        let seo_txt = {
          seo_url: producttype_obj.seo_url + "-" + seo_obj.seo_url,
          seo_text:
            producttype_obj.attribute_value + " " + seo_obj.attribute_value,
        };
        seotext_arr.push(seo_txt);
      }
    });
    indexval = indexval + 1;
    if (master_product_types.length > indexval) {
      processattrubutes(indexval);
    } else {
      res.send(200, { response: seotext_arr });
    }
  }
};
