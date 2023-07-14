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
    offer_min,
    offer_max,
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
  skuwhereclause["isdefault"] = true;
  // includeclause.push({
  //     model : models.trans_sku_lists,
  //     attributes:[
  //         'purity'],
  //       where:{
  //         is_active : true
  //       }
  //    })
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
      whereclause["$trans_sku_lists.purity$"] = {
        [Op.eq]: "24K",
      };
    } else {
      whereclause = {
        product_category: { [Op.iLike]: category },
        isactive: true,
      };
    }
  }

  // whereclause['$trans_sku_lists.is_active$'] = {
  //     [Op.eq]:true
  //     }
  if (sortBy) {
    if (sortBy === "Featured") {
      isproduct_query = true;
      sortelement = [["is_featured", "ASC"]];
    }
    if (sortBy === "New to Stylori") {
      // isproduct_query = true
      sortelement = [['"createdAt"', "DESC"]];
    }
    if (sortBy === "Ready to Ship") {
      // skuwhereclause = {}
      // skuwhereclause['is_ready_to_ship'] = true
      sortelement = [
        [{ model: models.trans_sku_lists }, "is_ready_to_ship", "desc"],
      ];
      skusort = [["is_ready_to_ship", "DESC"]];
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
  if (byweight) {
    includeclause.push({
      model: models.product_by_weight,
      where: {
        weight: byweight,
      },
    });
  }
  if (offer_min && offer_max) {
    whereclause["$trans_sku_lists.discount$"] = {
      [Op.between]: [offer_min, offer_max],
    };
  } else {
    if (offer_min) {
      whereclause["$trans_sku_lists.discount$"] = {
        [Op.gte]: offer_min,
      };
    } else if (offer_max) {
      whereclause["$trans_sku_lists.discount$"] = {
        [Op.lte]: offer_max,
      };
    }
  }
  if (bydesign) {
    includeclause.push({
      model: models.product_by_design,
      where: {
        design_name: bydesign,
      },
    });
  }
  if (metalcolor) {
    console.log("metal colur image");
    console.log(JSON.stringify(metalcolor));
    // includeclause.push({
    //   model : models.product_metalcolours,
    //   where: {
    //     product_color : metalcolor
    //   }
    //  })
    whereclause["$trans_sku_lists.metal_color$"] = {
      [Op.eq]: metalcolor,
    };
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
  }

  if (price) {
    if (price.min_price && price.max_price) {
      delete skuwhereclause["isdefault"];

      skuwhereclause["markup_price"] = {
        [Op.between]: [price.min_price, price.max_price],
      };
      whereclause["$trans_sku_lists.markup_price$"] = {
        [Op.between]: [price.min_price, price.max_price],
      };
    } else {
      if (price.max_price) {
        skuwhereclause["markup_price"] = {
          [Op.lte]: price.max_price,
        };
        whereclause["$trans_sku_lists.markup_price$"] = {
          [Op.lte]: price.max_price,
        };
      }
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
      model: models.product_collections,
      where: {
        collection_name: {
          [Op.iLike]: collection,
        },
      },
    });
  }
  if (occasion) {
    // whereclause['$product_occassions.occassion_name$'] = {
    //   [Op.eq]:occasion
    //   }
    includeclause.push({
      model: models.product_occassions,
      where: {
        occassion_name: occasion,
      },
    });
  }

  if (stoneshape) {
    // removed
    // whereclause['$product_gemstones.gemstone_shape$'] = {
    //   [Op.eq]:stoneshape
    //   }
    includeclause.push({
      model: models.product_gemstones,
      where: {
        gemstone_shape: stoneshape,
      },
    });
  }
  if (style) {
    includeclause.push({
      model: models.product_styles,
      where: {
        style_name: style,
      },
    });
    // whereclause['$product_styles.style_name$'] = {
    //   [Op.eq]:style
    //   }
  }
  if (theme) {
    // whereclause['$product_themes.theme_name$'] = {
    //   [Op.eq]:theme
    //   }
    includeclause.push({
      model: models.product_themes,
      where: {
        theme_name: theme,
      },
    });
  }

  if (stonecolor) {
    // whereclause['$product_stonecolors.stonecolor$'] = {
    //   [Op.eq]:stonecolor
    //   }
    includeclause.push({
      model: models.product_stonecolor,
      where: {
        stonecolor: stonecolor,
      },
    });
  }

  if (noofstones) {
    //  seofilterattribute.push('No Of Stones')
    // seofilterattributevalue.push(noofstones)
    // whereclause['$product_stonecount.stonecount$'] = {
    //   [Op.eq]:noofstones
    //   }
    includeclause.push({
      model: models.product_stonecount,
      where: {
        stonecount: noofstones,
      },
    });
  }
  if (producttype) {
    whereclause["product_type"] = {
      [Op.iLike]: producttype,
    };
  }
  if (availability) {
    if (availability === "1 Day Shipping") {
      skusort = [["is_ready_to_ship", "DESC"]];
      delete skuwhereclause["isdefault"];

      skuwhereclause["is_ready_to_ship"] = true;
      whereclause["$trans_sku_lists.is_ready_to_ship$"] = {
        [Op.eq]: true,
      };
      whereclause["$trans_sku_lists.is_active$"] = {
        [Op.eq]: true,
      };
    } else if (availability === "10 & Above Days Shipping") {
      skuwhereclause["is_ready_to_ship"] = false;
      delete skuwhereclause["isdefault"];

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
      delete skuwhereclause["isdefault"];

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
    // includeclause.push({
    //        model : models.product_purities,
    //        attributes: ['purity'],
    //       //  where:{
    //       //   purity : metalpurity
    //       //  }
    // })
    //skuwhereclause = {}
    delete skuwhereclause["isdefault"];

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

  if (material) {
    whereclause["$productMaterialsByProductSku.material_name$"] = {
      [Op.eq]: material,
    };
    includeclause.push({
      model: models.product_materials,
      as: "productMaterialsByProductSku",
      attributes: [["material_name", "materialName"]],
      // where:{
      //   material_name : material
      //  }
    });
  }
  var products_all = [];
  console.log("skucontentwhereclause");
  console.log(JSON.stringify(skuwhereclause));

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
      ["discount", "discount"],
      ["generated_sku", "generatedSku"],
      ["is_ready_to_ship", "isReadyToShip"],
      ["vendor_delivery_time", "vendorDeliveryTime"],
    ],

    where: skuwhereclause,
    required: true,
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
  const { count, rows } = await models.product_lists.findAndCountAll({
    include: includeclause,
    where: whereclause,
    limit: 24,
    offset: currentpage,
    subQuery: false,
    distinct: "product_lists.product_id",
    order: sortelement,
  });
  console.log("count value" + count);
  console.log("rows value" + rows.length);

  var product_ids = [];
  rows.forEach((element) => {
    console.log("rows value" + element.product_id);

    product_ids.push(element.product_id);
  });

  products_all = await models.product_lists.findAll({
    attributes: [
      ["product_name", "productName"],
      ["product_id", "productId"],
      ["product_type", "productType"],
      ["default_size", "defaultSize"],
      ["size_varient", "sizeVarient"],
      ["product_type", "productType"],
      "is_featured",
      "selling_qty",
    ],
    include: prod_iclude,
    where: {
      product_id: {
        [Op.in]: product_ids,
      },
    },
    order: sortelement,
  });
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

  res.send(200, { data: { totalCount: count, allProductLists: products_all } });
};

exports.randomProducts = ({ sku_id }) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!sku_id) {
        reject({ error: true, message: "sku_id is mandatory!" });
      }      
      let randomSkus = await models.sequelize.query(
        `select p.product_type,array_agg(t.sku_id ) as skus from product_lists p, trans_sku_lists t
      where random() < 0.03 and p.product_id = t.product_id and
      t.is_active is true and 
      p.product_type is not null and t.sku_id not in ('${sku_id}')
      group by p.product_type`,
        { type: sequelize.QueryTypes.SELECT }
      );      
      let result = await models.trans_sku_lists.findAll({
        where: {
          sku_id: {
            [Op.in]: randomSkus.map((i) => {
              return i.skus[0];
            }),
          },
        },
        attributes: ["sku_id", "sku_url", "product_id"],
        include: [
          {
            model: models.product_lists,
            attributes: ["product_name", "product_type"],
            include: {
              model: models.product_images,
              attributes: ["image_url", "image_position"],
            },
          },
          {
            model: models.trans_sku_descriptions,
            attributes: ["sku_description"],
          },
        ],
      });

      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
};
