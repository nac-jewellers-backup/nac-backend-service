const models = require("./../models");
import "dotenv/config";
const Op = require("sequelize").Op;
import apidata from "./apidata.json";
const uuidv1 = require("uuid/v1");
var splitArray = require("split-array");
var request = require("request");

exports.managetaxsetup = async (req, res) => {
  const {
    id,
    taxName,
    taxValue,
    hsnNumber,
    igst,
    cgst,
    sgst,
    isedit,
    isdelete,
  } = req.body;
  console.log("sgstvalue");
  console.log(sgst);
  if (isedit) {
    await models.master_tax_settings.update(
      {
        tax_name: taxName,
        tax_value: taxValue,
        hsn_number: hsnNumber,
        IGST: igst,
        SGST: sgst,
        CGST: cgst,
      },
      {
        where: {
          id: id,
        },
      }
    );
    res.send(200, { message: "Updated Successfully" });
  } else if (isdelete) {
  } else {
    let taxobj = {
      id: uuidv1(),
      tax_name: taxName,
      tax_value: taxValue,
      hsn_number: hsnNumber,
      IGST: igst,
      SGST: sgst,
      CGST: cgst,
    };
    await models.master_tax_settings.create(taxobj);
    res.send(200, { message: "Created Successfully" });
  }
};
exports.managetaxsetup2 = async (req, res) => {
  const { id, name, value, hsnCode, igst, cgst, isedit, isdelete } = req.body;
  if (isedit) {
    await models.taxsettings.update(
      { name: name, value: value, hsn_code: hsnCode },
      {
        where: {
          id: id,
        },
      }
    );
    res.send(200, { message: "Updated Successfully" });
  } else if (isdelete) {
  } else {
    let taxobj = {
      name: name,
      value: value,
      hsn_code: hsnCode,
    };
    await models.taxsettings.create(taxobj);
    res.send(200, { message: "Created Successfully" });
  }
};
exports.manageproducttypes = async (req, res) => {
  const {
    id,
    name,
    shortCode,
    displayOrder,
    isFilter,
    isActive,
    certificate,
    isedit,
    isdelete,
  } = req.body;
  if (isedit) {
    await models.master_product_types.update(
      {
        name: name,
        certificate: certificate,
        short_code: shortCode,
        display_order: displayOrder,
        is_filter: isFilter,
        is_active: isActive,
      },
      {
        where: {
          id: id,
        },
      }
    );
    res.send(200, { message: "Updated Successfully" });
  } else if (isdelete) {
    await models.master_product_types.update(
      {
        is_active: isActive,
      },
      {
        where: {
          id: id,
        },
      }
    );
  } else {
    let taxobj = {
      id: uuidv1(),
      name: name,
      certificate: certificate,
      display_order: displayOrder,
      short_code: shortCode,
    };
    await models.master_product_types.create(taxobj);
    res.send(200, { message: "Created Successfully" });
  }
};

exports.managecategories = async (req, res) => {
  const {
    id,
    name,
    shortCode,
    isedit,
    isdelete,
    isFilter,
    isActive,
    filterOrder,
  } = req.body;
  if (isedit) {
    await models.master_product_categories.update(
      {
        name: name,
        short_code: shortCode,
        is_filter: isFilter,
        is_active: isActive,
        filter_order: filterOrder,
      },
      {
        where: {
          id: id,
        },
      }
    );
    res.send(200, { message: "Updated Successfully" });
  } else if (isdelete) {
  } else {
    let taxobj = {
      id: uuidv1(),
      name: name,
      short_code: shortCode,
      is_filter: isFilter,
      is_active: isActive,
      filter_order: filterOrder,
    };
    await models.master_product_categories.create(taxobj);
    res.send(200, { message: "Created Successfully" });
  }
};

exports.managepaymentstatus = async (req, res) => {
  const { id, name, isedit, isdelete, isActive } = req.body;
  if (isedit) {
    await models.payment_status_master.update(
      {
        name: name,

        is_active: isActive,
      },
      {
        where: {
          id: id,
        },
      }
    );
    res.send(200, { message: "Updated Successfully" });
  } else if (isdelete) {
  } else {
    let taxobj = {
      name: name,
      is_active: isActive,
    };
    await models.payment_status_master.create(taxobj);
    res.send(200, { message: "Created Successfully" });
  }
};

exports.manageorderstatus = async (req, res) => {
  const { id, name, isedit, isdelete, isActive } = req.body;
  if (isedit) {
    await models.order_status_master.update(
      {
        name: name,

        is_active: isActive,
      },
      {
        where: {
          id: id,
        },
      }
    );
    res.send(200, { message: "Updated Successfully" });
  } else if (isdelete) {
  } else {
    let taxobj = {
      name: name,
      is_active: isActive,
    };
    await models.order_status_master.create(taxobj);
    res.send(200, { message: "Created Successfully" });
  }
};

exports.manageseoattributes = async (req, res) => {
  const {
    id,
    name,
    attributeName,
    attributeValue,
    priority,
    seoText,
    seoUrl,
    imageUrl,
    mobileImageUrl,
    isedit,
    isdelete,
    isActive,
  } = req.body;
  if (isedit) {
    await models.seo_url_priorities.update(
      {
        attribute_name: attributeName,
        attribute_value: attributeValue,
        priority: priority,
        seo_text: seoText,
        seo_url: seoUrl,
        image_url: imageUrl,
        mobile_image_url: mobileImageUrl,
        is_active: isActive,
      },
      {
        where: {
          id: id,
        },
      }
    );
    res.send(200, { message: "Updated Successfully" });
  } else if (isdelete) {
  } else {
    let taxobj = {
      id: uuidv1(),
      attribute_name: attributeName,
      attribute_value: attributeValue,
      priority: priority,
      seo_text: seoText,
      seo_url: seoUrl,
      is_active: isActive,
      image_url: imageUrl,
      mobile_image_url: mobileImageUrl,
    };
    await models.seo_url_priorities.create(taxobj);
    res.send(200, { message: "Created Successfully" });
  }
};

exports.managegenders = async (req, res) => {
  const { id, name, isedit, isFilter, isActive, filterOrder, isdelete } =
    req.body;
  if (isedit) {
    await models.master_genders.update(
      {
        name: name,
        is_filter: isFilter,
        is_active: isActive,
        filter_order: filterOrder,
      },
      {
        where: {
          id: id,
        },
      }
    );
    res.send(200, { message: "Updated Successfully" });
  } else if (isdelete) {
  } else {
    let taxobj = {
      id: uuidv1(),
      name: name,
      alias: name,
      is_filter: isFilter,
      is_active: isActive,
      filter_order: filterOrder,
    };
    await models.master_genders.create(taxobj);
    res.send(200, { message: "Created Successfully" });
  }
};
exports.manageshipmentsettings = async (req, res) => {
  const {
    id,
    name,
    shippingzones,
    rangetype,
    rangeFrom,
    rangeTo,
    shipmentCharge,
    isActive,
    isCart,
    isedit,
    isdelete,
  } = req.body;
  console.log(JSON.stringify(rangetype));
  if (isedit) {
    await models.shipping_charges.update(
      {
        zone_id: shippingzones.id,
        charge_type: rangetype.id,
        range_from: rangeFrom,
        is_cart: isCart,
        range_to: rangeTo,
        shipment_charge: shipmentCharge,
        name: name,
        is_active: isActive,
      },
      {
        where: {
          id: id,
        },
      }
    );

    res.send(200, { message: "Updated 1 Successfully" });
  } else if (isdelete) {
  } else {
    let taxobj = {
      zone_id: shippingzones.id,
      charge_type: rangetype.id,
      range_from: rangeFrom,
      range_to: rangeTo,
      shipment_charge: shipmentCharge,
      name: name,
      isCart: isCart,
      is_active: isActive,
    };
    let response = await models.shipping_charges.create(taxobj);

    res.send(200, { message: "Updated Successfully" });
  }
};
exports.manageshippingzone = async (req, res) => {
  const { id, name, zonecountry, isActive, isedit, isdelete } = req.body;
  if (isedit) {
    let zonecountries = await models.shipping_zone_countries.findAll({
      where: {
        zone_id: id,
      },
    });
    let country_ids = [];
    zonecountry.forEach((country_obj) => {
      country_ids.push(country_obj.id);
    });
    let create_arr = [];
    let delete_arr = [];
    zonecountries.forEach((zonemap_obj) => {
      if (country_ids.indexOf(zonemap_obj.country_id) > -1) {
        let index = country_ids.indexOf(zonemap_obj.country_id);
        country_ids.splice(index, 1);
      } else {
        delete_arr.push(zonemap_obj.country_id);
      }
    });
    await models.shipping_zones.update(
      { name: name, is_active: isActive },
      {
        where: {
          id: id,
        },
      }
    );
    await models.shipping_zone_countries.destroy({
      where: {
        country_id: {
          [Op.in]: delete_arr,
        },
        zone_id: id,
      },
    });

    if (country_ids.length > 0) {
      var shippingcountries = [];
      country_ids.forEach((element) => {
        shippingcountries.push({
          country_id: element,
          zone_id: id,
          is_active: true,
        });
      });
      await models.shipping_zone_countries.bulkCreate(shippingcountries, {
        individualHooks: true,
      });
    }
    res.send(200, { message: "Updated Successfully" });
  } else if (isdelete) {
  } else {
    let taxobj = {
      name: name,
      is_active: isActive,
    };
    let response = await models.shipping_zones.create(taxobj);
    if (zonecountry.length > 0) {
      var shippingcountries = [];
      zonecountry.forEach((element) => {
        shippingcountries.push({
          country_id: element.id,
          zone_id: response.id,
          is_active: true,
        });
      });
      await models.shipping_zone_countries.bulkCreate(shippingcountries, {
        individualHooks: true,
      });
    }

    res.send(200, { message: "Updated Successfully" });
  }
};

exports.manageshippingattributes = async (req, res) => {
  const { rateid, attributes, display_text } = req.body;
  let product_attributes = {};
  let keys = Object.keys(attributes);
  let componentarr = [];

  keys.forEach((key) => {
    let attributeobj = attributes[key];
    if (Array.isArray(attributeobj)) {
      attributeobj.forEach((attr) => {
        if (attr.alias) {
          componentarr.push(attr.alias);
        }
      });
      if (componentarr.length > 0) {
        // product_attributes[key] = componentarr
      }
    }
  });

  console.log(product_attributes);
  await models.shipping_charges.update(
    {
      product_attributes: componentarr,
      display_attributes: display_text,
    },
    {
      where: {
        id: rateid,
      },
    }
  );

  res.send(200, { message: "Updated Successfully" });
};

exports.managetaxattributes = async (req, res) => {
  const { rateid, attributes, display_text } = req.body;
  let product_attributes = {};
  let keys = Object.keys(attributes);
  let componentarr = [];

  keys.forEach((key) => {
    let attributeobj = attributes[key];
    if (Array.isArray(attributeobj)) {
      attributeobj.forEach((attr) => {
        if (attr.alias) {
          componentarr.push(attr.alias);
        }
      });
      if (componentarr.length > 0) {
        // product_attributes[key] = componentarr
      }
    }
  });

  console.log(product_attributes);
  await models.master_tax_settings.update(
    {
      product_attributes: componentarr,
      display_attributes: display_text,
    },
    {
      where: {
        id: rateid,
      },
    }
  );

  res.send(200, { message: "Updated Successfully" });
};

exports.managegemtypes = async (req, res) => {
  const {
    id,
    name,
    isFilter,
    isActive,
    filterOrder,
    colorCode,
    isedit,
    isdelete,
  } = req.body;
  if (isedit) {
    await models.master_gemstones_types.update(
      {
        name: name,
        color_code: colorCode,
        is_filter: isFilter,
        is_active: isActive,
        filter_order: filterOrder,
      },
      {
        where: {
          id: id,
        },
      }
    );
    res.send(200, { message: "Updated Successfully" });
  } else if (isdelete) {
  } else {
    let taxobj = {
      id: uuidv1(),
      name: name,
      alias: name,
      color_code: colorCode,
      is_filter: isFilter,
      is_active: isActive,
      filter_order: filterOrder,
    };
    await models.master_gemstones_types.create(taxobj);
    res.send(200, { message: "Created Successfully" });
  }
};

exports.managegemshapes = async (req, res) => {
  const { id, name, isFilter, isActive, filterOrder, isedit, isdelete } =
    req.body;
  if (isedit) {
    await models.master_gemstones_shapes.update(
      {
        name: name,
        is_filter: isFilter,
        is_active: isActive,
        filter_order: filterOrder,
      },
      {
        where: {
          id: id,
        },
      }
    );
    res.send(200, { message: "Updated Successfully" });
  } else if (isdelete) {
  } else {
    let taxobj = {
      id: uuidv1(),
      name: name,
      alias: name,
      is_filter: isFilter,
      is_active: isActive,
      filter_order: filterOrder,
    };
    await models.master_gemstones_shapes.create(taxobj);
    res.send(200, { message: "Created Successfully" });
  }
};
exports.managegemsettings = async (req, res) => {
  const { id, name, isFilter, isActive, filterOrder, isedit, isdelete } =
    req.body;
  if (isedit) {
    await models.master_gemstones_settings.update(
      {
        name: name,
        is_filter: isFilter,
        is_active: isActive,
        filter_order: filterOrder,
      },
      {
        where: {
          id: id,
        },
      }
    );
    res.send(200, { message: "Updated Successfully" });
  } else if (isdelete) {
  } else {
    let taxobj = {
      id: uuidv1(),
      name: name,
      alias: name,
      is_filter: isFilter,
      is_active: isActive,
      filter_order: filterOrder,
    };
    await models.master_gemstones_settings.create(taxobj);
    res.send(200, { message: "Created Successfully" });
  }
};

exports.managediamondtypes = async (req, res) => {
  const {
    id,
    diamondClarity,
    diamondColor,
    isFilter,
    isActive,
    filterOrder,
    isedit,
    isdelete,
  } = req.body;
  if (isedit) {
    await models.master_diamond_types.update(
      {
        diamond_clarity: diamondClarity,
        diamond_color: diamondColor,
        is_filter: isFilter,
        is_active: isActive,
        filter_order: filterOrder,
      },
      {
        where: {
          id: id,
        },
      }
    );
    res.send(200, { message: "Updated Successfully" });
  } else if (isdelete) {
  } else {
    let taxobj = {
      id: uuidv1(),
      diamond_clarity: diamondClarity,
      diamond_color: diamondColor,
      short_code: "",
      is_filter: isFilter,
      is_active: isActive,
      filter_order: filterOrder,
    };
    await models.master_diamond_types.create(taxobj);
    res.send(200, { message: "Created Successfully" });
  }
};

exports.managediamondsettings = async (req, res) => {
  const { id, name, isFilter, isActive, filterOrder, isedit, isdelete } =
    req.body;
  if (isedit) {
    await models.master_diamonds_settings.update(
      {
        name: name,
        is_filter: isFilter,
        is_active: isActive,
        filter_order: filterOrder,
      },
      {
        where: {
          id: id,
        },
      }
    );
    res.send(200, { message: "Updated Successfully" });
  } else if (isdelete) {
  } else {
    let taxobj = {
      id: uuidv1(),
      name: name,
      alias: name,
      is_filter: isFilter,
      is_active: isActive,
      filter_order: filterOrder,
    };
    await models.master_diamonds_settings.create(taxobj);
    res.send(200, { message: "Created Successfully" });
  }
};

exports.managediamondshapes = async (req, res) => {
  const { id, name, isFilter, isActive, filterOrder, isedit, isdelete } =
    req.body;
  if (isedit) {
    await models.master_diamonds_shapes.update(
      {
        name: name,
        is_filter: isFilter,
        is_active: isActive,
        filter_order: filterOrder,
      },
      {
        where: {
          id: id,
        },
      }
    );
    res.send(200, { message: "Updated Successfully" });
  } else if (isdelete) {
  } else {
    let taxobj = {
      id: uuidv1(),
      name: name,
      alias: name,
      is_filter: isFilter,
      is_active: isActive,
      filter_order: filterOrder,
    };
    await models.master_diamonds_shapes.create(taxobj);
    res.send(200, { message: "Created Successfully" });
  }
};

exports.managedesigns = async (req, res) => {
  const { id, name, isFilter, isActive, filterOrder, isedit, isdelete } =
    req.body;
  if (isedit) {
    await models.master_designs.update(
      {
        name: name,
        is_filter: isFilter,
        is_active: isActive,
        filter_order: filterOrder,
      },
      {
        where: {
          id: id,
        },
      }
    );
    res.send(200, { message: "Updated Successfully" });
  } else if (isdelete) {
  } else {
    let taxobj = {
      id: uuidv1(),
      name: name,
      alias: name,
      is_filter: isFilter,
      is_active: isActive,
      filter_order: filterOrder,
    };
    await models.master_designs.create(taxobj);
    res.send(200, { message: "Created Successfully" });
  }
};
exports.manageoccassions = async (req, res) => {
  const { id, name, isFilter, isActive, filterOrder, isedit, isdelete } =
    req.body;
  if (isedit) {
    await models.master_occasions.update(
      {
        name: name,
        is_filter: isFilter,
        is_active: isActive,
        filter_order: filterOrder,
      },
      {
        where: {
          id: id,
        },
      }
    );
    res.send(200, { message: "Updated Successfully" });
  } else if (isdelete) {
  } else {
    let taxobj = {
      id: uuidv1(),
      name: name,
      alias: name,
      is_filter: isFilter,
      is_active: isActive,
      filter_order: filterOrder,
    };
    await models.master_occasions.create(taxobj);
    res.send(200, { message: "Created Successfully" });
  }
};

exports.managecollections = async (req, res) => {
  const { id, name, isFilter, isActive, filterOrder, isedit, isdelete } =
    req.body;
  if (isedit) {
    await models.master_collections.update(
      {
        name: name,
        is_filter: isFilter,
        is_active: isActive,
        filter_order: filterOrder,
      },
      {
        where: {
          id: id,
        },
      }
    );
    res.send(200, { message: "Updated Successfully" });
  } else if (isdelete) {
  } else {
    let taxobj = {
      id: uuidv1(),
      name: name,
      alias: name,
      is_filter: isFilter,
      is_active: isActive,
      filter_order: filterOrder,
    };
    await models.master_collections.create(taxobj);
    res.send(200, { message: "Created Successfully" });
  }
};

exports.managethemes = async (req, res) => {
  const { id, name, isFilter, isActive, filterOrder, isedit, isdelete } =
    req.body;
  if (isedit) {
    await models.master_themes.update(
      {
        name: name,
        is_filter: isFilter,
        is_active: isActive,
        filter_order: filterOrder,
      },
      {
        where: {
          id: id,
        },
      }
    );
    res.send(200, { message: "Updated Successfully" });
  } else if (isdelete) {
  } else {
    let taxobj = {
      id: uuidv1(),
      name: name,
      alias: name,
      is_filter: isFilter,
      is_active: isActive,
      filter_order: filterOrder,
    };
    await models.master_themes.create(taxobj);
    res.send(200, { message: "Created Successfully" });
  }
};

exports.managestyles = async (req, res) => {
  const { id, name, isedit, isdelete, isFilter, isActive, filterOrder } =
    req.body;
  if (isedit) {
    await models.master_styles.update(
      {
        name: name,
        is_filter: isFilter,
        is_active: isActive,
        filter_order: filterOrder,
      },
      {
        where: {
          id: id,
        },
      }
    );
    res.send(200, { message: "Updated Successfully" });
  } else if (isdelete) {
  } else {
    let taxobj = {
      id: uuidv1(),
      name: name,
      alias: name,
      is_filter: isFilter,
      is_active: isActive,
      filter_order: filterOrder,
    };
    await models.master_styles.create(taxobj);
    res.send(200, { message: "Created Successfully" });
  }
};

exports.managepurities = async (req, res) => {
  const { id, name, isFilter, isActive, filterOrder, isedit, isdelete } =
    req.body;
  if (isedit) {
    await models.master_metals_purities.update(
      {
        name: name,
        is_filter: isFilter,
        is_active: isActive,
        filter_order: filterOrder,
      },
      {
        where: {
          id: id,
        },
      }
    );
    res.send(200, { message: "Updated Successfully" });
  } else if (isdelete) {
  } else {
    let taxobj = {
      id: uuidv1(),
      name: name,
      alias: name,
      is_filter: isFilter,
      is_active: isActive,
      filter_order: filterOrder,
    };
    await models.master_metals_purities.create(taxobj);
    res.send(200, { message: "Created Successfully" });
  }
};

exports.managemetalcolors = async (req, res) => {
  const {
    id,
    name,
    isFilter,
    isActive,
    shortCode,
    filterOrder,
    isedit,
    isdelete,
  } = req.body;
  if (isedit) {
    await models.master_metals_colors.update(
      {
        name: name,
        is_filter: isFilter,
        is_active: isActive,
        short_code: shortCode,
        filter_order: filterOrder,
      },
      {
        where: {
          id: id,
        },
      }
    );
    res.send(200, { message: "Updated Successfully" });
  } else if (isdelete) {
  } else {
    let taxobj = {
      id: uuidv1(),
      name: name,
      alias: name,
      short_code: shortCode,
      is_filter: isFilter,
      is_active: isActive,
      filter_order: filterOrder,
    };
    await models.master_metals_colors.create(taxobj);
    res.send(200, { message: "Created Successfully" });
  }
};

exports.managematerials = async (req, res) => {
  const { id, name, filterOrder, isActive, isFilter, isedit, isdelete } =
    req.body;
  if (isedit) {
    await models.master_materials.update(
      {
        name: name,
        filter_order: filterOrder,
        is_filter: isFilter,
        is_active: isActive,
      },
      {
        where: {
          id: id,
        },
      }
    );
    res.send(200, { message: "Updated Successfully" });
  } else if (isdelete) {
  } else {
    let taxobj = {
      id: uuidv1(),
      name: name,
      alias: name,
      filter_order: filterOrder,
      is_filter: isFilter,
      is_active: isActive,
    };
    await models.master_materials.create(taxobj);
    res.send(200, { message: "Created Successfully" });
  }
};

exports.manageearring = async (req, res) => {
  const { id, name, isFilter, isActive, filterOrder, isedit, isdelete } =
    req.body;
  if (isedit) {
    await models.master_earring_backing.update(
      {
        name: name,
        is_filter: isFilter,
        is_active: isActive,
        filter_order: filterOrder,
      },
      {
        where: {
          id: id,
        },
      }
    );
    res.send(200, { message: "Updated Successfully" });
  } else if (isdelete) {
  } else {
    let taxobj = {
      id: uuidv1(),
      name: name,
      alias: name,
      is_filter: isFilter,
      is_active: isActive,
      filter_order: filterOrder,
    };
    await models.master_earring_backing.create(taxobj);
    res.send(200, { message: "Created Successfully" });
  }
};

exports.managemasterattributes = async (req, res) => {
  const {
    id,
    name,
    isFilter,
    isSearch,
    isTopMenu,
    filterPosition,
    isdelete,
    isedit,
  } = req.body;
  if (isedit) {
    await models.Attribute_master.update(
      {
        name: name,
        is_filter: isFilter,
        filter_position: filterPosition,
        is_search: isSearch,
        is_top_menu: isTopMenu,
      },
      {
        where: {
          id: id,
        },
      }
    );
    res.send(200, { message: "Updated Successfully" });
  } else if (isdelete) {
  } else {
    let taxobj = {
      name: name,
      is_filter: isFilter,
      filter_position: filterPosition,
      is_search: isSearch,
      is_active: true,
      is_top_menu: isTopMenu,
      short_code: "",
    };
    await models.Attribute_master.create(taxobj);
    res.send(200, { message: "Created Successfully" });
  }
};

exports.managestones = async (req, res) => {
  const { id, name, isFilter, isActive, filterOrder, isedit, isdelete } =
    req.body;
  if (isedit) {
    await models.master_stones.update(
      {
        name: name,
        is_filter: isFilter,
        is_active: isActive,
        filter_order: filterOrder,
      },
      {
        where: {
          id: id,
        },
      }
    );
    res.send(200, { message: "Updated Successfully" });
  } else if (isdelete) {
  } else {
    let taxobj = {
      id: uuidv1(),
      name: name,
      alias: name,
      is_filter: isFilter,
      is_active: isActive,
      filter_order: filterOrder,
    };
    await models.master_stones.create(taxobj);
    res.send(200, { message: "Created Successfully" });
  }
};
exports.managestonecolors = async (req, res) => {
  const { id, name, isFilter, isActive, filterOrder, isedit, isdelete } =
    req.body;
  if (isedit) {
    await models.master_stones_colors.update(
      {
        name: name,
        is_filter: isFilter,
        is_active: isActive,
        filter_order: filterOrder,
      },
      {
        where: {
          id: id,
        },
      }
    );
    res.send(200, { message: "Updated Successfully" });
  } else if (isdelete) {
  } else {
    let taxobj = {
      id: uuidv1(),
      name: name,
      alias: name,
      is_filter: isFilter,
      is_active: isActive,
      filter_order: filterOrder,
    };
    await models.master_stones_colors.create(taxobj);
    res.send(200, { message: "Created Successfully" });
  }
};
exports.managestoneshapes = async (req, res) => {
  const { id, name, isFilter, isActive, filterOrder, isedit, isdelete } =
    req.body;
  if (isedit) {
    await models.master_stones_shapes.update(
      {
        name: name,
        is_filter: isFilter,
        is_active: isActive,
        filter_order: filterOrder,
      },
      {
        where: {
          id: id,
        },
      }
    );
    res.send(200, { message: "Updated Successfully" });
  } else if (isdelete) {
  } else {
    let taxobj = {
      id: uuidv1(),
      name: name,
      alias: name,
      is_filter: isFilter,
      is_active: isActive,
      filter_order: filterOrder,
    };
    await models.master_stones_shapes.create(taxobj);
    res.send(200, { message: "Created Successfully" });
  }
};

exports.manageweights = async (req, res) => {
  const { id, name, isedit, isFilter, isActive, filterOrder, isdelete } =
    req.body;
  if (isedit) {
    await models.master_weights.update(
      {
        name: name,
        is_filter: isFilter,
        is_active: isActive,
        filter_order: filterOrder,
      },
      {
        where: {
          id: id,
        },
      }
    );
    res.send(200, { message: "Updated Successfully" });
  } else if (isdelete) {
  } else {
    let taxobj = {
      id: uuidv1(),
      name: name,
      alias: name,
      is_filter: isFilter,
      is_active: isActive,
      filter_order: filterOrder,
    };
    await models.master_weights.create(taxobj);
    res.send(200, { message: "Created Successfully" });
  }
};

exports.managepages = async (req, res) => {
  const { displayname, pagename, isedit, id } = req.body;
  if (isedit) {
    await models.uniquepages.update(
      {
        displayname: displayname,
        pagename: pagename,
      },
      {
        where: {
          id: id,
        },
      }
    );
    res.send(200, { message: "Updated Successfully" });
  } else {
    let taxobj = {
      displayname: displayname,
      pagename: pagename,
    };
    await models.uniquepages.create(taxobj);
    res.send(200, { message: "Created Successfully" });
  }
};

exports.manageroles = async (req, res) => {
  const { name, isedit, id } = req.body;
  if (isedit) {
    await models.master_roles.update(
      {
        name: name,
      },
      {
        where: {
          id: id,
        },
      }
    );
    res.send(200, { message: "Updated Successfully" });
  } else {
    let taxobj = {
      name: name,
    };
    await models.master_roles.create(taxobj);
    res.send(200, { message: "Created Successfully" });
  }
};

exports.getrolepermissions = async (req, res) => {
  const { role_id } = req.body;
  let permissions = await models.role_permissions.findAll({
    where: {
      role_id: role_id,
    },
  });
  let response_obj = {};
  permissions.forEach((element) => {
    response_obj[element.page_id] = {
      iswrite: element.is_write,
      isview: element.is_view,
    };
  });
  res.send(200, { permissions: response_obj });
};
exports.managepermissions = async (req, res) => {
  const { role_id, permissions, isedit, id } = req.body;
  if (permissions) {
    let newpermissions = [];
    let permission_ids = Object.keys(permissions);
    var bar = new Promise((resolve, reject) => {
      permission_ids.forEach(async (element, index) => {
        let permissionobj = await models.role_permissions.findOne({
          where: {
            role_id: role_id,
            page_id: element,
          },
        });

        if (permissionobj) {
          permissionobj["is_view"] = permissions[element].isview;
          permissionobj["is_write"] = permissions[element].iswrite;
          await models.role_permissions.update(
            {
              is_view: permissions[element].isview,
              is_write: permissions[element].iswrite,
            },
            {
              where: {
                role_id: role_id,
                page_id: element,
              },
            }
          );
          permissionobj.update();
        } else {
          let per_obj = {
            role_id: role_id,
            page_id: parseInt(element),
            is_view: permissions[element].isview,
            is_write: permissions[element].iswrite,
          };
          newpermissions.push(per_obj);
          console.log(newpermissions);
        }
        if (index === permission_ids.length - 1) resolve();
      });
    });

    bar.then(async () => {
      console.log("All done!");
      console.log(newpermissions);

      let response = await models.role_permissions.bulkCreate(newpermissions, {
        individualHooks: true,
      });

      res.send(200, { response: newpermissions });
    });
  }
};

exports.getwebusers = async (req, res) => {
  const { size, offset, searchtext } = req.body;
  let whereclause = {};
  if (searchtext) {
    whereclause = {
      email: {
        [Op.iLike]: "%" + searchtext + "%",
      },
    };
  }
  let users = await models.user_profiles.findAndCountAll({
    include: [
      {
        model: models.users,

        where: whereclause,
        // include:[
        //     {
        //         model:models.user_roles,
        //         where:{
        //             role_name: {
        //               [Op.in] : ['user']
        //             }
        //           }
        //     }
        // ]
      },
      {
        model: models.orders,
      },
    ],
    limit: size,
    offset: offset,
  });

  res.status(200).send({ users });
};
