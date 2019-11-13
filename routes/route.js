const authJwt = require('./verifyJwtToken');

module.exports = function(app) {

    const authcontroller = require('../controller/authcontroller.js');
	const productcontroller = require('../controller/productcontroller.js');
	const pricingontroller = require('../controller/pricingcontroller.js');
	const productupdatecontroller = require('../controller/productupdatecontroller.js');
	const discountcontroller = require('../controller/checkdiscount.js');
	const updatesizecontroller = require('../controller/product_size_update_controller.js');
    const cartcontroller = require('../controller/cartcontroller.js');
    const filtercontroller = require('../controller/filtercontroller.js');
    const master_uploaddata_controller = require('../controller/master_uploaddata_controller.js');

	app.post('/api/auth/signin', authcontroller.signin);
	app.post('/api/auth/signup', authcontroller.signup);	
	app.post('/verification/:email/:token', authcontroller.verification);
	app.post('/forgotpassword', authcontroller.forgotpassword);
	app.post('/resetpassword', authcontroller.resetpassword);

	app.post('/productupload', productcontroller.productupload);
	app.post('/productupdate', productupdatecontroller.updateproduct);
	app.post('/priceupdate', productcontroller.priceupdate);

	app.get('/api/userprofile', [authJwt.verifyToken], authcontroller.userContent);
	app.post('/updatepricelist', pricingontroller.priceupdate);
	app.post('/checkdiscount', discountcontroller.checkdiscount);
	app.post('/updatesize', updatesizecontroller.updatesize);
	app.post('/api/auth/guestlogin', authcontroller.guestlogin);
	app.post('/api/auth/verifyotp', authcontroller.verifyotp);
	
	
	app.post('/addproductreview', cartcontroller.addproductreview);
	app.post('/applyvoucher', cartcontroller.applyvoucher);
	app.post('/addgiftwrap', cartcontroller.addgiftwrap);
	app.post('/addtocart', cartcontroller.addtocart);
	app.post('/addaddress', cartcontroller.addaddress);
	app.post('/uploadimage', cartcontroller.uploadimage);
	app.post('/filterlist', filtercontroller.filteroptions);

	app.post('/updatebestseller', master_uploaddata_controller.updatebestseller);
	app.post('/updatereadytoship', master_uploaddata_controller.updatereadytoship);
	app.post('/pincodemaster', master_uploaddata_controller.updatepincode);
	app.post('/updateproduct_color', master_uploaddata_controller.updateproduct_color);
	app.post('/updateproduct_gender', master_uploaddata_controller.updateproduct_gender);
	app.post('/updateproduct_purity', master_uploaddata_controller.updateproduct_purity);
	app.post('/updateproduct_stonecolor', master_uploaddata_controller.updateproduct_stonecolor);
	app.post('/updateurlparams', master_uploaddata_controller.updateurlparams);
	app.post('/updatecodpincodes', master_uploaddata_controller.updatecodpincodes);
	app.post('/updatedefaultimage', master_uploaddata_controller.updatedefaultimage);
	app.get('/viewskupricesummary/:skuid', master_uploaddata_controller.viewskupricesummary);
	app.post('/updateproductcreatedate', master_uploaddata_controller.updateproductcreatedate);
	app.post('/updategemstonepricemaster', master_uploaddata_controller.updategemstonepricemaster);
	app.post('/updatecustomerreviews', master_uploaddata_controller.updatecustomerreviews);

	
	
}