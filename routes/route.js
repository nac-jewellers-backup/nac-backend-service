"use strict";
const authJwt = require("./verifyJwtToken");
const axios = require("axios");
const BASE_URL = "http://localhost:8000";
const productPricing = require("../controller/productMasters");
const uuidv4 = require("uuid/v4");
var arrayChunk = require("array-chunk");
let {
  esSearch,
  docBulk,
  deleteIndex,
  initMapping,
  initIndex,
} = require("../controller/elasticServices");
const { fstat } = require("fs");
const { send_sms } = require("../controller/notify/user_notify");
const turl = process.env.apibaseurl + "/productesearch";
const upload = require("../middlewares/multer").single("file");
const { sendStatus } = require("../middlewares/socket");
const { uploadResumetoAWS } = require("../controller/career_controllers");
const {
  displayComboOffer,
  upsertComboOffers,
} = require("../controller/combo_offers");

module.exports = function (app) {
  const configurationcontroller = require("../controller/master_configuration.js");

  const authcontroller = require("../controller/authcontroller.js");
  const productcontroller = require("../controller/productcontroller.js");
  const pricingontroller = require("../controller/pricingcontroller.js");
  const productupdatecontroller = require("../controller/productupdatecontroller.js");
  const discountcontroller = require("../controller/checkdiscount.js");
  const updatesizecontroller = require("../controller/product_size_update_controller.js");
  const cartcontroller = require("../controller/cartcontroller.js");
  const filtercontroller = require("../controller/filtercontroller.js");
  const master_uploaddata_controller = require("../controller/master_uploaddata_controller.js");
  const pricesplitup_controller = require("../controller/pricesplitupcontroller.js");
  const single_product_pricecontroller = require("../controller/pricingcontroller_whole.js");
  const component_price_update = require("../controller/priceupdateController.js");
  const productfetchController_esearch = require("../controller/productfetchController_esearch.js");

  const productFetchController = require("../controller/productfetchController.js");
  const inventoryController = require("../controller/inventorycontroller");

  app.post("/componentpriceupdate", component_price_update.priceupdate);

  app.post("/api/auth/signin", authcontroller.signin);
  app.post(
    "/verifypasswordtoken",
    [authJwt.verifyToken],
    authcontroller.verifypasswordtoken
  );
  app.post(
    "/changepassword",
    [authJwt.verifyToken],
    authcontroller.changepassword
  );

  app.post(
    "/esearchcombination",
    productfetchController_esearch.esearchcombination
  );

  app.post("/fbsignin", authcontroller.fbsignin);
  app.post("/fbsignup", authcontroller.fbsignup);

  app.post("/api/auth/mediasignin", authcontroller.mediaSignin);
  app.post("/api/auth/signup", authcontroller.signup);
  app.post("/verification/:email/:token", authcontroller.verification);
  app.post("/forgotpassword", authcontroller.forgotpassword);
  app.post(
    "/resetpassword",
    [authJwt.verifyToken],
    authcontroller.resetpassword
  );

  app.post("/ringpriceupdate", productcontroller.ringpriceupdate);

  app.post("/productupload", productcontroller.productupload);
  app.post("/productupdate", productupdatecontroller.updateproduct);
  app.post("/priceupdate", productcontroller.priceupdate);
  app.post("/disableproduct", productcontroller.disableproduct);
  app.post("/getproductlist", productcontroller.getproductlist);
  app.post("/getorders", productcontroller.getorderlist);
  app.post("/getorderdetails", productcontroller.getorderdetails);

  app.post("/productpriceupdate", single_product_pricecontroller.priceupdate);

  app.post(
    "/splitdiamondpriceupdate",
    [productPricing.productList],
    pricesplitup_controller.splitdiamondpriceupdate
  );
  app.post(
    "/splitgoldpriceupdate",
    [productPricing.productList],
    pricesplitup_controller.splitgoldpriceupdate
  );
  app.post(
    "/splitmarkuppriceupdate",
    [productPricing.productList],
    pricesplitup_controller.splitmakingchargeupdate
  );
  app.post(
    "/splitgemstonepriceupdate",
    [productPricing.productList],
    pricesplitup_controller.splitgemstonepriceupdate
  );
  app.post("/generatepaymenturl", cartcontroller.generatepaymenturl);
  app.post("/paymentsuccess", cartcontroller.paymentsuccess);
  app.post("/paymentfailure", cartcontroller.paymentfailure);
  app.post("/paymentipn", cartcontroller.payment_ipn_callback);

  app.post("/updateattributes", productupdatecontroller.updateattributes);

  app.post(
    "/getpriceupdatestatus",
    productupdatecontroller.getpriceupdatestatus
  );

  app.post(
    "/api/updateuserprofile",
    [authJwt.verifyToken],
    authcontroller.updateuserprofile
  );
  app.get(
    "/api/userprofile",
    [authJwt.verifyToken],
    authcontroller.userContent
  );
  app.post("/updatepricelist", pricingontroller.priceupdate);
  app.post("/checkdiscount", discountcontroller.checkdiscount);
  app.post("/updatesize", updatesizecontroller.updatesize);
  app.post("/api/auth/guestlogin", authcontroller.guestlogin);
  app.post("/api/auth/verifyotp", authcontroller.verifyotp);

  app.post("/updatevendorgoldprice", pricingontroller.updatevendorgoldprice);

  app.post("/updatemetalprice", pricingontroller.updatemetalprice);
  app.post("/updatediamondprice", pricingontroller.updatediamondprice);
  app.post("/updategemstoneprice", pricingontroller.updategemstoneprice);
  app.post("/updatemakingcharge", pricingontroller.updatemakingcharge);
  app.post("/getvendorgemprice", pricingontroller.vendorgemprice);
  app.post("/getvendormakingprice", pricingontroller.vendormakingprice);
  app.post("/getdistinctproduct", pricingontroller.getdistinctproduct);
  app.get("/getlogfile", pricingontroller.logfile);
  app.post("/getcomponentpricestatus", pricingontroller.priceupdatestatus);
  app.post("/getaliasproduct", pricingontroller.getaliasproductlist);
  app.post("/creatediscount", pricingontroller.creatediscount);
  app.post("/checksalediscount", pricingontroller.checkdiscount);
  app.post("/getdiscount", pricingontroller.discountinfo);
  app.post("/getincompletepricerun", pricingontroller.getincompletepricerun);

  app.post("/updatemarkup", pricingontroller.updatemarkup);
  app.post("/addmarkup", pricingontroller.addmarkup);

  app.post("/api/auth/verifyotp", authcontroller.verifyotp);
  app.post("/addquestion", authcontroller.addquestion);
  app.post("/addemailsubscription", authcontroller.addemailsubscription);
  app.post("/asktoexport", authcontroller.asktoexport);
  app.post("/getmasterroles", authcontroller.getmasterroles);
  app.post("/getadminusers", authcontroller.getadminusers);
  app.post(
    "/getpageaccess",
    [authJwt.verifyToken],
    authcontroller.getpageaccess
  );

  app.post("/addwishlist", cartcontroller.addwishlist);
  app.post("/removewishlist", cartcontroller.removewishlist);
  app.post("/removeaddress", cartcontroller.removeaddress);
  app.post("/testorderconformation", cartcontroller.testorderemail);

  app.post("/productesearch", productfetchController_esearch.productesearch);

  app.post("/createorder", cartcontroller.addorder);
  app.post("/updatecartitem", cartcontroller.updatecartitem);

  app.post("/addproductreview", cartcontroller.addproductreview);
  app.post("/applyvoucher", cartcontroller.applyvoucher);
  app.post("/createvoucher", cartcontroller.createvoucher);
  app.post("/getvoucher", cartcontroller.getvoucher);

  app.post("/addgiftwrap", cartcontroller.addgiftwrap);
  app.post("/addtocart", cartcontroller.addtocart);
  app.post("/addaddress", cartcontroller.addaddress);
  app.post("/adduseraddress", cartcontroller.adduseraddress);
  app.post("/resendorderemail", cartcontroller.resendorderemail);
  app.post("/removecartitem", cartcontroller.removecartitem);
  app.post("/uploadimage", cartcontroller.uploadimage);
  app.post(
    "/filterlist",
    [authJwt.checkguest],
    [authJwt.updateLastlogin],
    filtercontroller.filteroptions
  );
  app.post("/getsizes", cartcontroller.getsizes);
  app.post("/updateorderstatus", cartcontroller.updateorderstatus);

  app.post("/getuserinfo", authcontroller.getuserinfo);

  app.post("/getshippingcharge", cartcontroller.getshippingcharge);

  app.post("/fetchproducts", productFetchController.filteroptions);
  app.post(
    "/esearchfetchproducts",
    productfetchController_esearch.filteroptions
  );
  app.post("/getproductvarient", productcontroller.getproductvarient);
  app.post("/getproducturl", productcontroller.getproducturl);

  app.post("/editproduct", productcontroller.editproduct);
  app.post("/editproductdiamond", productcontroller.editproductdiamond);
  app.post("/updateskuinfo", productcontroller.updateskuinfo);
  app.post("/updateskupriceinfo", productcontroller.updateskupriceinfo);
  app.post("/editproductgemstone", productcontroller.editproductgemstone);
  app.post("/updateproductattr", productcontroller.updateproductattr_bk);
  app.post("/updateproductimage", productcontroller.updateproductimage);
  app.post("/productdetails", productcontroller.productdetails);

  app.post("/sendtoairpay", cartcontroller.sendtoairpay);

  app.post("/updatevendor", master_uploaddata_controller.updatevendor);
  app.post(
    "/getnewvendorcode",
    master_uploaddata_controller.generatevendorcode
  );

  app.post("/updatebestseller", master_uploaddata_controller.updatebestseller);
  app.post(
    "/updatereadytoship",
    master_uploaddata_controller.updatereadytoship
  );
  app.post("/pincodemaster", master_uploaddata_controller.updatepincode);
  app.post(
    "/updateproduct_color",
    master_uploaddata_controller.updateproduct_color
  );
  app.post(
    "/updateproduct_gender",
    master_uploaddata_controller.updateproduct_gender
  );
  app.post(
    "/updateproduct_purity",
    master_uploaddata_controller.updateproduct_purity
  );
  app.post(
    "/updateproduct_stonecolor",
    master_uploaddata_controller.updateproduct_stonecolor
  );
  app.post("/updateurlparams", master_uploaddata_controller.updateurlparams);
  app.post(
    "/updatecodpincodes",
    master_uploaddata_controller.updatecodpincodes
  );
  app.post(
    "/updatedefaultimage",
    master_uploaddata_controller.updatedefaultimage
  );
  app.get(
    "/viewskupricesummary/:skuid",
    master_uploaddata_controller.viewskupricesummary
  );
  app.post(
    "/updateproductcreatedate",
    master_uploaddata_controller.updateproductcreatedate
  );
  app.post(
    "/updategemstonepricemaster",
    master_uploaddata_controller.updategemstonepricemaster
  );
  app.post(
    "/updatecustomerreviews",
    master_uploaddata_controller.updatecustomerreviews
  );
  app.post("/updatetax", master_uploaddata_controller.updatetax);

  app.post("/managetaxsetup", configurationcontroller.managetaxsetup);
  app.post("/manageproducttypes", configurationcontroller.manageproducttypes);
  app.post("/managegenders", configurationcontroller.managegenders);
  app.post("/managegemtypes", configurationcontroller.managegemtypes);
  app.post("/managegemshapes", configurationcontroller.managegemshapes);
  app.post("/managegemsettings", configurationcontroller.managegemsettings);
  app.post("/managediamondtypes", configurationcontroller.managediamondtypes);
  app.post(
    "/managediamondsettings",
    configurationcontroller.managediamondsettings
  );
  app.post("/managediamondshapes", configurationcontroller.managediamondshapes);
  app.post("/managedesigns", configurationcontroller.managedesigns);
  app.post("/managecollections", configurationcontroller.managecollections);
  app.post("/managepurities", configurationcontroller.managepurities);
  app.post("/managemetalcolors", configurationcontroller.managemetalcolors);
  app.post("/managematerials", configurationcontroller.managematerials);
  app.post("/managecategories", configurationcontroller.managecategories);
  app.post("/manageearring", configurationcontroller.manageearring);
  app.post(
    "/managemasterattributes",
    configurationcontroller.managemasterattributes
  );
  app.post("/managestyles", configurationcontroller.managestyles);
  app.post("/managethemes", configurationcontroller.managethemes);
  app.post("/managestones", configurationcontroller.managestones);
  app.post("/managestonecolors", configurationcontroller.managestonecolors);
  app.post("/managestoneshapes", configurationcontroller.managestoneshapes);
  app.post("/manageweights", configurationcontroller.manageweights);
  app.post("/manageoccassions", configurationcontroller.manageoccassions);
  app.post("/managepaymentstatus", configurationcontroller.managepaymentstatus);
  app.post("/manageorderstatus", configurationcontroller.manageorderstatus);
  app.post("/manageseoattributes", configurationcontroller.manageseoattributes);
  app.post("/manageshippingzone", configurationcontroller.manageshippingzone);
  app.post(
    "/manageshipmentsettings",
    configurationcontroller.manageshipmentsettings
  );
  app.post(
    "/manageshippingattributes",
    configurationcontroller.manageshippingattributes
  );
  app.post("/managepages", configurationcontroller.managepages);
  app.post("/manageroles", configurationcontroller.manageroles);
  app.post("/managepermissions", configurationcontroller.managepermissions);
  app.post("/getrolepermissions", configurationcontroller.getrolepermissions);
  app.post("/getwebusers", configurationcontroller.getwebusers);
  app.post("/managetaxattributes", configurationcontroller.managetaxattributes);

  app.post(
    "/updatefilterposition",
    master_uploaddata_controller.updatefilterposition
  );

  app.post("/managetaxsetup2", configurationcontroller.managetaxsetup2);

  app.post("/esearch_forceindex", async function (req, res) {
    let datapaylod = {};
    if (req.body.product_id) {
      datapaylod["product_id"] = req.body.product_id;
    }
    try {
      const _obj = {
        method: "post",
        url: turl,
        data: JSON.stringify(datapaylod),
      };

      const py1 = {
        properties: {
          autocomplete: {
            type: "text",
            analyzer: "autocomplete",
            search_analyzer: "autocomplete_search",
          },
          sku_url: { type: "text" },
          product_name: { type: "text" },
        },
      };

      const _py1s = {
        settings: {
          analysis: {
            analyzer: {
              autocomplete: {
                tokenizer: "autocomplete",
                filter: ["lowercase"],
              },
              autocomplete_search: {
                tokenizer: "lowercase",
              },
            },
            tokenizer: {
              autocomplete: {
                type: "edge_ngram",
                min_gram: 2,
                max_gram: 20,
                token_chars: ["letter"],
              },
            },
          },
        },
      };

      const py2 = {
        properties: {
          sku_code: {
            type: "text",
          },
          sku_url: {
            type: "text",
          },
          sku_code_prefix: {
            type: "text",
          },
          sku_code_search: {
            type: "completion",
            analyzer: "simple",
            preserve_separators: true,
            preserve_position_increments: true,
            max_input_length: 50,
          },
        },
      };

      const py3 = {
        properties: {
          seo_url: {
            type: "text",
          },
          seo_search: {
            type: "completion",
          },
        },
      };

      let _index = ["product_search", "sku_search", "seo_search"];

      Promise.all([
        deleteIndex(_index[0]),
        deleteIndex(_index[1]),
        deleteIndex(_index[2]),
      ])
        .then((response) => {
          console.log("» » » Index deleted");
          Promise.all([
            initIndex(_index[0], _py1s),
            initIndex(_index[1], false),
            initIndex(_index[2], _py1s),
          ]).then((init_index) => {
            console.log("» » » Index created");

            Promise.all([
              initMapping(_index[0], "_doc", py1),
              initMapping(_index[1], "_doc", py2),
              initMapping(_index[2], "_doc", py3),
            ])
              .then((_mapp) => {
                console.log("» » » Mapping created");
                axios(_obj)
                  .then(async (response) => {
                    console.log("» »", response.status);
                    let productSearch = response["data"]["product_list"];
                    let skuSearch = response["data"]["sku_list"];
                    let seoSearch = response["data"]["seo_list"];

                    let productArray = [];
                    let skuArray = [];
                    let seoArray = [];
                    let doc_array = [];

                    /* filter response Array to new-one */

                    /*product_search mapper */
                    (async function () {
                      await Promise.all(
                        productSearch.map(async (li) => {
                          productArray.push({
                            index: {
                              _index: "product_search",
                              _type: "_doc",
                              _id: uuidv4(),
                            },
                          });
                          productArray.push({
                            product_name: li.product_name
                              ? li.product_name
                              : "",
                            sku_url:
                              li.trans_sku_lists.length > 0
                                ? li.trans_sku_lists[0]["sku_url"]
                                : "",
                            autocomplete: li.product_name
                              ? li.product_name
                              : "",
                          });
                        })
                      );
                    })();

                    /*sku_code search mapper*/
                    (async function () {
                      await Promise.all(
                        skuSearch.map(async (li) => {
                          skuArray.push({
                            index: {
                              _index: "sku_search",
                              _type: "_doc",
                              _id: uuidv4(),
                            },
                          });
                          skuArray.push({
                            sku_code: li.generated_sku,
                            sku_url: li.sku_url,
                            sku_code_prefix: li.generated_sku,
                            sku_code_search: li.generated_sku
                              ? li.generated_sku.split(/[ ,]+/)
                              : "",
                          });
                        })
                      );
                    })();

                    /*seo_url search mapper*/
                    (async function () {
                      await Promise.all(
                        seoSearch.map(async (yl) => {
                          seoArray.push({
                            index: {
                              _index: "seo_search",
                              _type: "_doc",
                              _id: uuidv4(),
                            },
                          });
                          seoArray.push({
                            seo_url: yl.seo_url ? yl.seo_url : "",
                            seo_name: yl.seo_text ? yl.seo_text : "",
                            autocomplete: yl.seo_text ? yl.seo_text : "",
                          });
                        })
                      );
                    })();
                    skuArray = arrayChunk(skuArray, 100);
                    for (let index = 0; index < skuArray.length; index++) {
                      const element = skuArray[index];
                      await docBulk(element);
                    }
                    console.log("Completed SKUS");
                    productArray = arrayChunk(productArray, 100);
                    for (let index = 0; index < productArray.length; index++) {
                      const element = productArray[index];
                      await docBulk(element);
                    }
                    console.log("Completed Products");
                    seoArray = arrayChunk(seoArray, 100);
                    for (let index = 0; index < seoArray.length; index++) {
                      const element = seoArray[index];
                      await docBulk(element);
                    }
                    console.log("Completed SEOs");
                    res
                      .status(200)
                      .send({ message: "Successfully reindexed all data!" });
                    // skuArray.map((el) => doc_array.push(docBulk(el)));

                    // doc_array.push(docBulk(productArray));

                    // doc_array.push(docBulk(seoArray));

                    // console.info("totalPromises", doc_array.length);

                    // Promise.all(doc_array)
                    //   .then((response) => {
                    //     console.log("» » » Docs Uploaded");
                    //     console.log("Promises Resolved ", response.length);
                    //   })
                    //   .catch((_e) => {
                    //     console.log(_e);
                    //     console.log("Errror");
                    //   });
                  })
                  .catch((fetch_err) => {
                    console.error(fetch_err);
                    res.status(500).send({ ...fetch_err });
                  });
              })
              .catch((init_err) => {
                console.log(init_err);
                console.log("Error In Init Index");
                res.status(500).send({ ...init_err });
              });
          });
        })
        .catch((err_del) => {
          console.log(err_del);
          console.log("Error In Delete-Index");
          res.status(500).send({ ...err_del });
        });
    } catch (err) {
      console.log(
        new Date().toLocaleString("en-US", {
          timeZone: "Asia/Calcutta",
        }) +
          " - Error message : " +
          err
      );
      res.status(500).send({ ...err });
    }
  });
  app.post("/reindex", async function (req, res) {
    const { product_id } = req.body;
    let datapaylod = {
      query: {
        match_phrase_prefix: {
          sku_code_prefix: {
            query: product_id,
          },
        },
      },
    };
    const _obj = {
      method: "post",
      url: "https://search-elastic-server-uguyslt53rg63cttm2b4hgwkb4.ap-south-1.es.amazonaws.com/sku_search/_delete_by_query",
      data: datapaylod,
    };
    axios(_obj)
      .then(async (response) => {
        res.status(200).send({ message: "Success" });
      })
      .catch((err) => {
        res.status(500).send({ message: "Please try again later" });
      });
  });
  app.post("/auto_complete", async function (req, res) {
    let { search_text } = req.body;
    console.log("durga!!", search_text);
    let product_search = {
      query: {
        match: {
          autocomplete: {
            query: search_text,
            operator: "and",
            fuzziness: 2,
          },
        },
      },
    };
    let sku_search = {
      from: 0,
      size: 10,
      query: {
        match_phrase_prefix: {
          sku_code_prefix: {
            query: search_text,
            max_expansions: 15,
          },
        },
      },
    };
    let seo_search = {
      query: {
        match: {
          autocomplete: {
            query: search_text,
            operator: "and",
            fuzziness: 2,
          },
        },
      },
    };
    let p1 = esSearch("product_search", "_doc", product_search);
    let p2 = esSearch("sku_search", "_doc", sku_search);
    let p3 = esSearch("seo_search", "_doc", seo_search);
    Promise.all([p1, p2, p3])
      .then(async (es_response) => {
        let product_results = es_response[0]["message"]["hits"]["hits"];
        let sku_results = es_response[1]["message"]["hits"]["hits"];
        let seo_results = es_response[2]["message"]["hits"]["hits"];
        product_results = product_results.map((_obj) => {
          return _obj._source;
        });
        sku_results = sku_results.map((_obj) => {
          return _obj._source;
        });
        seo_results = seo_results.map((_obj) => {
          return _obj._source;
        });
        console.log(product_results,'product_results',
          sku_results,'sku_results',
          seo_results,'seo_results')
        return res.json({
          product_results,
          sku_results,
          seo_results,
        });
      })
      .catch((err) => {
        console.log("err\n elastic search", err);
        return res.json(err);
      });
  });

  app.post("/product_sync", async (req, res) => {
    var { action_type, new_tagno, warehouse } = req.body;
    let Product_lists = [];

    require("axios")
      .get(req.body.sync_url)
      .then((response) => {
        console.log("response", response.data.Product_lists.length);
        Product_lists = response.data.Product_lists;
        start_sync();
      })
      .catch((err) => {
        console.log(
          "err",
          err.response.data || "Some error occurred while fetching data!"
        );
        res.status(500).send({
          message:
            err.response.data || "Some error occurred while fetching data!",
        });
      });

    let start_sync = async () => {
      var totalCount = Product_lists.length;
      var startTime = require("moment")();
      try {
        if (action_type == "price_sync") {
          res.send({
            status: true,
            message: `Process Started!`,
          });
          var i,
            j,
            temparray,
            chunk = 200;
          for (i = 0, j = totalCount; i < j; i += chunk) {
            temparray = Product_lists.slice(i, i + chunk);
            for (let index = 0; index < temparray.length; index++) {
              const item = temparray[index];
              await require("../controller/productsync").productSync({
                product: item,
                type: action_type,
                warehouse,
              });
            }
            sendStatus("sync_data", {
              completed: i + chunk < totalCount ? (i + chunk) / totalCount : 1,
            });
          }
        }
        if (action_type == "new_uploads") {
          res.send({
            status: true,
            message: `Process Started!`,
          });
          for (let index = 0; index < totalCount; index++) {
            const item = Product_lists[index];
            if (new_tagno.includes(item.TAGNO)) {
              await require("../controller/productsync").productSync({
                product: item,
                type: action_type,
                warehouse,
              });
              sendStatus("sync_data", {
                completed: (index + 1) / new_tagno.length,
              });
            }
          }
        }
        sendStatus("sync_data", {
          status: "completed",
          timeElapsed: startTime.fromNow(),
        });
      } catch (error) {
        console.log(error);
      }
    };
  });

  app.post("/addholidays", (req, res) => {
    upload(req, res, (err) => {
      if (err) {
        res.status(400).send({
          error: err.message,
        });
      }
      const csv = require("csvtojson");

      csv()
        .fromFile(req.file.path)
        .then(async (data) => {
          try {
            res.status(200).send(await inventoryController.addHolidays(data));
          } catch (err) {
            res.status(400).send({
              error: err.message,
            });
          }
        })
        .catch((err) => {
          res.status(400).send({
            error: err.message,
          });
        });
    });
  });
  app.post("/addinventories", (req, res) => {
    upload(req, res, async (err) => {
      if (err) {
        res.status(400).send({
          error: err.message,
        });
      }
      res.send({ status: true, message: "File processing started!" });

      const csv = require("csvtojson");

      var warehouses = await require("../models").warehouse.findAll({
        attributes: ["id", "name"],
        raw: true,
      });

      csv()
        .fromFile(req.file.path)
        .subscribe(
          async (data) => {
            return await inventoryController.addInventories(data, warehouses);
          },
          (err) => {
            console.log(err);
          },
          () => {
            console.log("Success", req.file.path);
            try {
              require("fs").unlink(req.file.path);
            } catch (error) {
              console.log(error);
            }
          }
        );
    });
  });

  app.post("/getshippingdate", async (req, res) => {
    try {
      res.status(200).send(await inventoryController.getShippingDate(req.body));
    } catch (error) {
      console.log(error);
      res.status(400).send({
        error: error.message,
      });
    }
  });

  app.post("/preSync_validator", (req, res) => {
    let { new_tagno } = req.body;
    let result = {};
    let { syncValidate } = require("../controller/productsync");
    require("axios")
      .get(req.body.sync_url)
      .then(async (response) => {
        console.log("response", response.data.Product_lists.length);
        let Product_lists = response.data.Product_lists.filter((item) =>
          new_tagno.includes(item.TAGNO)
        );
        for (let index = 0; index < Product_lists.length; index++) {
          const element = Product_lists[index];
          if (new_tagno.includes(element.TAGNO)) {
            result[element.TAGNO] = await syncValidate({ product: element });
          }
        }
        res.status(200).send(result);
      })
      .catch((err) => {
        console.log("err", err);
        res.status(500).send({
          message: err.response || "Some error occurred while fetching data!",
        });
      });
  });
  app.post("/getcsvdata", productcontroller.csvDownload);
  app.post("/get_new_tagno", async (req, res) => {
    const models = require("../models");
    let result = [];
    require("axios")
      .get(req.body.sync_url)
      .then(async (response) => {
        console.log("response", response.data.Product_lists.length);
        let Product_lists = response.data.Product_lists.map(
          (product) => product.TAGNO
        );
        for (let index = 0; index < Product_lists.length; index++) {
          const element = Product_lists[index];
          const sku = await models.trans_sku_lists.findOne({
            attributes: ["id"],
            where: { generated_sku: element },
          });
          if (!sku) {
            result.push(element);
          }
        }
        res.status(200).send(result);
      })
      .catch((err) => {
        console.log("err", err);
        res.status(500).send({
          message: err.response || "Some error occurred while fetching data!",
        });
      });
  });
  app.post("/updatecart_latestprice", cartcontroller.updatecart_latestprice);
  app.post("/price_run_latest", async (req, res) => {
    let {
      priceUpdate,
      createPriceRunHistory,
      updatePriceRunHistory,
    } = require("../controller/pricingcontroller_nac");
    let { product_sku, component } = req.body;
    if (Array.isArray(product_sku)) {
      res.status(200).send({ message: "Successfully Started!" });
      let price_history = await createPriceRunHistory({
        pricing_component: component,
        product_ids: product_sku.join(","),
        total_product: product_sku.length,
      });
      for (let i = 0; i < product_sku.length; i++) {
        await priceUpdate({ product_id: product_sku[i] });
        await updatePriceRunHistory(price_history.id, {
          completed_product_count: i + 1,
          is_completed: i == product_sku.length - 1,
          completed_products: product_sku.slice(0, i + 1).join(","),
        });
      }
    } else {
      res.status(200).send(await priceUpdate({ product_id: product_sku }));
    }
  });
  app.post("/you_may_like", async (req, res) => {
    try {
      res
        .status(200)
        .send(await productFetchController.randomProducts(req.body));
    } catch (error) {
      console.log("err", error);
      res.status(500).send({
        message: error.message || "Some error occurred while fetching data!",
      });
    }
  });
  app.post("/send_sms", async (req, res) => {
    try {
      res.status(200).send(await send_sms(req.body));
    } catch (error) {
      res.status(500).send(error);
    }
  });
  app.post("/file_upload_sync", (req, res) => {
    upload(req, res, async (err) => {
      if (err) {
        res.status(400).send({
          error: err.message,
        });
      }
      try {
        res.status(200).send({ message: "Success started!" });

        let XLSX = require("xlsx");

        let workbook = XLSX.readFile(req.file.path);
        let sheetList = workbook.SheetNames;
        console.log(sheetList);
        for (let index = 0; index < sheetList.length; index++) {
          const sheet = sheetList[index];
          let sampleData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet]);
          if (!sheet.includes("sku")) {
            sampleData = require("lodash").groupBy(sampleData, (item) => {
              return item.tag_no;
            });

            let tag_no_list = Object.keys(sampleData);

            for (let index = 0; index < tag_no_list.length; index++) {
              const tag_no = tag_no_list[index];
              const data = sampleData[tag_no];
              try {
                await require("../controller/product_upload_sync").product_upload_sync(
                  {
                    data: { tag_no: tag_no, stone: data },
                    type: sheet.replace("_list", ""),
                  }
                );
              } catch (error) {
                console.log(error);
              }
            }
          } else {
            for (let index = 0; index < sampleData.length; index++) {
              const data = sampleData[index];
              try {
                await require("../controller/product_upload_sync").product_upload_sync(
                  {
                    data,
                    type: sheet.replace("_list", ""),
                  }
                );
              } catch (error) {
                console.log(error);
              }
            }
          }
          sendStatus(sheet, {
            completed: 1,
          });
        }
        console.log("Completed Sync!");
        require("fs").unlink(req.file.path, (err) => {
          if (err) {
            console.log(err);
          }
        });
      } catch (error) {
        console.error(error);
        res.status(500).send(error);
      }
    });
  });
  const otpController = require("../controller/otpController");
  app.post("/send_otp", async (req, res) => {        
    try {
      res.status(200).send(await otpController.sendOtp(req.body));
    } catch (error) {
      res.status(error.statusCode || 500).send({ error: true, ...error });
    }
  });
  app.post("/resend_otp", async (req, res) => {
    try {
      res.status(200).send(await otpController.resendOtp(req.body));
    } catch (error) {
      res.status(error.statusCode || 500).send({ error: true, ...error });
    }
  });
  app.post("/verify_otp", async (req, res) => {
    try {
      res.status(200).send(await otpController.verifyOtp(req.body));
    } catch (error) {
      res.status(error.statusCode || 500).send({ error: true, ...error });
    }
  });
  app.post("/trigger_mail", cartcontroller.trigger_mail);
  app.post("/send_error_mail", async (req, res) => {
    try {
      require("../models")
        .ui_error_log.insert({
          ...req.body,
        })
        .then((result) => {
          res.status(200).send({ message: "Successfully Logged!" });
        })
        .catch((error) => {
          res.status(500).send({ message: error.message });
        });
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: error.message });
    }
  });
  app.post("/file_upload_price_sync", (req, res) => {
    upload(req, res, async (err) => {
      if (err) {
        res.status(400).send({
          error: err.message,
        });
      }
      var startTime = require("moment")();
      try {
        let XLSX = require("xlsx");

        let workbook = XLSX.readFile(req.file.path);
        let sheetList = workbook.SheetNames;
        let sampleData = XLSX.utils.sheet_to_json(
          workbook.Sheets[sheetList[0]],
          {
            range: 2,
          }
        );

        console.log(sampleData.length);
        res.status(200).send({
          status: "Accepted",
          message: "Process Started!",
          sampleData,
        });

        let chunk = 25;
        let splitArray = arrayChunk(sampleData, chunk);
        console.log(splitArray.length);
        for (let index = 0; index < splitArray.length; index++) {
          const element = splitArray[index];
          try {
            await Promise.all(
              element.map(async (item) => {
                await require("../controller/product_upload_sync").product_pricing_sync(
                  { data: item }
                );
              })
            );
            sendStatus("price_sync", {
              completed:
                index * chunk < sampleData.length
                  ? (index * chunk) / sampleData.length
                  : 1,
            });
          } catch (error) {
            console.log(error);
          }
        }
        sendStatus("price_sync", {
          status: "completed",
          timeElapsed: startTime.fromNow(),
        });
      } catch (error) {
        console.log(error);
        res.status(500).send(error);
      }
    });
  });
  app.post("/fxSynclatest", cartcontroller.syncFxRate);
  app.get("/get_pincode_details", async (req, res) => {
    try {
      res.status(200).send(await cartcontroller.getPincodeDetails(req.query));
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
  });
  // Appointment Routes
  const appointment_controller = require("../controller/appointment_scheduler");

  app.post("/get_appointment_time_slots", async (req, res) => {
    try {
      res
        .status(200)
        .send(await appointment_controller.findAppointmentTimeSlot(req.body));
    } catch (error) {
      console.log(error);
      res.status(error.statusCode || 500).send(error);
    }
  });
  app.post("/send_appointment_otp", async (req, res) => {
    try {
      res
        .status(200)
        .send(await appointment_controller.appointment_send_otp(req.body));
    } catch (error) {
      console.log(error);
      res.status(error.statusCode || 500).send(error);
    }
  });
  app.post("/verify_appointment_otp", async (req, res) => {
    try {
      res
        .status(200)
        .send(await appointment_controller.appointment_verify_otp(req.body));
    } catch (error) {
      console.log(error);
      res.status(error.statusCode || 500).send(error);
    }
  });
  app.post("/sync_pincode", async (req, res) => {
    try {
      res.status(200).send(await cartcontroller.syncPincode(req.body));
    } catch (error) {
      console.log(error);
      res.status(500).send({ ...error });
    }
  });
  const {
    priceUpdate,
    finalPriceRun,
    createPriceRunHistory,
    updatePriceRunHistory,
  } = require("../controller/pricingcontroller_with_intermediate");
  app.post("/price_run_new", async (req, res) => {
    try {
      let { pricing_component, req_product_id } = req.body;
      if (!req_product_id || req_product_id.length == 0) {
        throw new Error("req_product_id is required!");
      }
      if (!Array.isArray(req_product_id)) {
        req_product_id = [req_product_id];
      }
      let priceHistory = await createPriceRunHistory({
        pricing_component,
        product_ids: req_product_id.join(","),
        total_product: req_product_id.length,
      });
      res.status(200).send({ status: "started", priceHistory });
      const models = require("../models");
      req_product_id = arrayChunk(req_product_id, 200);
      Promise.allSettled(
        req_product_id.map(async (products) => {
          return await Promise.allSettled(
            products.map(async (item) => {
              await priceUpdate({ product_id: item });
              return await updatePriceRunHistory(priceHistory.id, {
                completed_product_count: models.sequelize.literal(
                  `completed_product_count+1`
                ),
                completed_products: models.sequelize.literal(
                  `completed_products || ',' || '${item}'`
                ),
              });
            })
          );
        })
      ).then(async () => {
        await finalPriceRun();
        await updatePriceRunHistory(priceHistory.id, { is_completed: true });
        await models.temp_price_list.truncate();
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({ ...error });
    }
  });
  app.post(
    "/banner_image_upload",
    require("../controller/image_controller").banner_image_uploder
  );
  app.post("/apply_career", (req, res) => {
    upload(req, res, (err) => {
      if (err) {
        return res.status(400).send({
          error: err.message,
        });
      }
      uploadResumetoAWS(req, res);
    });
  });
  app.use("/appointment", require("./appointment_routes"));
  app.post("/bulk_upload_combo", async (req, res) => {
    try {
      upload(req, res, (err) => {
        if (err) {
          console.error(err);
          return res.status(500).send(err);
        }
        res
          .status(200)
          .send({ status: true, message: "File processing started!" });
        upsertComboOffers({ filepath: req?.file?.path });
      });
    } catch (error) {
      console.error(error);
      res.status(500).send({
        error: true,
        message: error?.message || "Something went wrong!",
      });
    }
  });
  app.post("/fetch_combo_offer", async (req, res) => {
    try {
      res.status(200).send(await displayComboOffer(req.body));
    } catch (error) {
      console.error(error);
      res.status(500).send({
        error: true,
        message: error?.message || "Something went wrong!",
      });
    }
  });
  app.post("/fetch_cart_details", async (req, res) => {
    try {
      res.status(200).send(await cartcontroller.fetchCartDetails(req.body));
    } catch (error) {
      console.error(error);
      res.status(500).send({
        error: true,
        message: error?.message || "Something went wrong!",
      });
    }
  });
};
