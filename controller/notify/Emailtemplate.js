const moment = require('moment');

const getName = (username) => {
    if(!username)
    {
      username = "User"
    }
    return `<html>
      <head>
        <title>Registration Success</title>
      </head>
      <body>
        <p>
          <span>${'Welcome ' + username}</span>
        </p>
        <br />
        <ul
          style="width: 600px; list-style-type: none; list-style: none;padding-left: 0px;"
        >
          <li>
            <a href=${process.env.baseurl} target="_blank">
              <img
                src="https://s3.ap-southeast-1.amazonaws.com/media.nacjewellers.com/resources/email/logo.png"
                alt=""
                border="0"
            /></a>
          </li>
          <li>
            <ul
              style="list-style-type: none; list-style: none; padding: 10px 10px;text-align: center;"
            >
              <li style="display: inline; padding: 0px 3px; text-decoration: none;">
                <a
                  href=${process.env.baseurl+"/pendants-jewellery"}
                  target="_blank"
                  style="text-decoration:none;color:#4F4C4C;"
                  >Pendants</a
                >
              </li>
              <li style="display: inline; padding: 0px 2px;">|</li>
              <li style="display: inline; padding: 0px 2px;">
                <a
                  href=${process.env.baseurl+"/earrings-jewellery"}
                  target="_blank"
                  style="text-decoration:none;color:#4F4C4C;"
                  >Earrings</a
                >
              </li>
              <li style="display: inline; padding: 0px 2px;">|</li>
              <li style="display: inline; padding: 0px 2px;">
                <a
                  href=${process.env.baseurl+"/bangles-jewellery"}
                  target="_blank"
                  style="text-decoration:none;color:#4F4C4C;"
                  >Bangles</a
                >
              </li>
              <li style="display: inline; padding: 0px 2px;">|</li>
              <li style="display: inline; padding: 0px 2px;">
                <a
                  href=${process.env.baseurl+"/bangles-jewellery"}
                  target="_blank"
                  style="text-decoration:none;color:#4F4C4C;"
                  >Bracelets</a
                >
              </li>
              <li style="display: inline; padding: 0px 2px;">|</li>
              <li style="display: inline; padding: 0px 2px;">
                <a
                  href=${process.env.baseurl+"/rings-jewellery"}
                  target="_blank"
                  style="text-decoration:none;color:#4F4C4C;"
                  >Rings</a
                >
              </li>
              <li style="display: inline; padding: 0px 2px;">|</li>
              <li style="display: inline; padding: 0px 2px;">
                <a
                  href=${process.env.baseurl+"/nose+pin+online-jewellery"}
                  target="_blank"
                  style="text-decoration:none;color:#4F4C4C;"
                  >Nose Pins</a
                >
              </li>
            </ul>
          </li>
          <li>
            <a href="https://instagram.com/stylorilove" target="_blank">
              <img
                src="https://styloriimages.s3.ap-south-1.amazonaws.com/images/templates/registration-emailer-01_03.jpg"
                alt=""
                border="0"
              />
            </a>
          </li>
          <li>
            <img
              src="https://styloriimages.s3.ap-south-1.amazonaws.com/images/templates/registration-emailer-01_04.jpg"
              alt=""
              border="0"
            />
          </li>
          <li>
            <img
              src="https://styloriimages.s3.ap-south-1.amazonaws.com/images/templates/registration-emailer-01_05.jpg"
              alt=""
              border="0"
            />
          </li>
          <li>
            <img
              src="https://styloriimages.s3.ap-south-1.amazonaws.com/images/templates/registration-emailer-01_06.jpg"
              alt=""
              border="0"
            />
          </li>
    
          <li>
            <img
              src="https://styloriimages.s3.ap-south-1.amazonaws.com/images/templates/registration-emailer-01_07.jpg"
              alt=""
              border="0"
            />
          </li>
    
          <li>
            <img
              src="https://styloriimages.s3.ap-south-1.amazonaws.com/images/templates/registration-emailer-01_08.jpg"
              alt=""
              border="0"
            />
          </li>
    
          <li>
            <ul
              style="list-style-type: none; list-style: none; padding: 10px 5px; margin: 20px 63px; text-align: center; border-style: solid; border-color: #CC1E53;"
            >
              <li style="display: inline;">
                <a href=${process.env.baseurl+"/stories"} target="_blank"
                  ><img
                    src="https://styloriimages.s3.ap-south-1.amazonaws.com/images/templates/text.png"
                    style="margin-bottom:13px;"
                /></a>
              </li>
    
              <li style="display: inline;">
                <a
                  target="_blank"
                  href="https://www.facebook.com/stylori"
                  style="color: #CC1E53;"
                  ><img
                    src="https://styloriimages.s3.ap-south-1.amazonaws.com/images/templates/icon01.png"
                /></a>
              </li>
    
              <li style="display: inline;">
                <a
                  target="_blank"
                  href="https://twitter.com/StyloriLove"
                  style="color: #CC1E53;"
                  ><img
                    src="https://styloriimages.s3.ap-south-1.amazonaws.com/images/templates/icon02.png"
                /></a>
              </li>
    
              <li style="display: inline;">
                <a
                  href="https://instagram.com/stylorilove"
                  style="color: #CC1E53;"
                  target="_blank"
                  ><img
                    src="https://styloriimages.s3.ap-south-1.amazonaws.com/images/templates/icon03.png"
                /></a>
              </li>
    
              <li style="display: inline;">
                <a
                  href="https://in.pinterest.com/stylori2015/"
                  style="color: #CC1E53;"
                  target="_blank"
                  ><img
                    src="https://styloriimages.s3.ap-south-1.amazonaws.com/images/templates/icon04.png"
                /></a>
              </li>
    
              <li style="display: inline;">
                <a
                  href="https://www.youtube.com/c/stylori"
                  style="color: #CC1E53;"
                  target="_blank"
                  ><img
                    src="https://styloriimages.s3.ap-south-1.amazonaws.com/images/templates/icon05.png"
                /></a>
              </li>
            </ul>
    
            <!-- <ul
              style="list-style-type: none; list-style: none; padding: 10px 5px; margin: 5px 150px;"
            >
              <li style="display: inline; color: #A4C639;"></li>
    
              <li style="display: inline; margin-bottom: 5px;">
                <a
                  href="https://play.google.com/store/apps/details?id=com.pranion.stylori&amp;hl=en"
                  target="_blank"
                >
                  <img
                    src="https://assets-cdn.stylori.com/images/emailTemplate/icon06.png"
                  />
                </a>
              </li>
            </ul> -->
    
            <ul
              style="list-style-type: none; list-style: none; padding: 10px 5px; margin: 5px 80px;"
            >
              <li style="display: inline;color:#4F4C4C;">Copyright @ 2020</li>
              <li style="display: inline;">|</li>
              <li style="display: inline;">
                <a
                  href=${process.env.baseurl}
                  target="_blank"
                  style="text-decoration:none;color:#4F4C4C;"
                  >stylori.com</a
                >
              </li>
              <li style="display: inline;">|</li>
              <li style="display: inline;color:#4F4C4C;">All rights reserved.</li>
            </ul>
          </li>
        </ul>
      </body>
    </html>
    `;
  };
  
  const forgotpasswordTemp = (username, email, token) => {
    if(!username)
      {
        username = "User"
      }
    return `<!doctype html>
      <html>
      <head>
      
      <title>Register authentication</title>
      </head>
      
      <body>
      <div style="width:600px;background:#fff;">
      <table style="width:600px">
          <thead>
              <img src="https://styloriimages.s3.ap-south-1.amazonaws.com/images/templates/cash-on-deli-hdr.jpg" />
          </thead>
          <tbody>
              <tr>
                  <p style="padding:0px 15px;font-family: 'Arial', sans-serif;font-size: 12px;font-weight: bold;color: rgba(88,89,91,1.00);margin:25px 0px;">
                  <h5> Hello ${username},</h5>
                  </p>
              </tr>
              <tr>
                  <p style="padding:0px 15px;font-family: 'Arial', sans-serif;font-size: 12px;font-weight: 400;color: rgba(88,89,91,1.00); line-height:1.6;float:left;">We received a request to reset the password associated with this 
                          e-mail address. If you made this request, please follow the instructions below.</p>
              </tr>
              
              <tr>
                  <p style="padding:0px 15px;font-family: 'Arial', sans-serif;font-size: 12px;font-weight: 400;color: rgba(88,89,91,1.00);line-height:1.6;">
                  Click on the link below to reset your password using our secure server:</p>
              </tr>
              <tr>
                  <p style="padding:0px 15px;font-family: 'Arial', sans-serif;font-size: 12px;font-weight: 400;color: #ed1164;">
                      <span style="color: #ed1164;text-decoration:none;">${token}</span>
                  </p>
              </tr>
              <tr>
                  <p style="padding:0px 15px;font-family: 'Arial', sans-serif;font-size: 12px;font-weight: 400;color: rgba(88,89,91,1.00);line-height:1.6;">If you did not request to have your password reset you can safely ignore this email.</p>
              </tr>
              <tr>
                  <p style="padding:0px 15px;font-family: 'Arial', sans-serif;font-size: 12px;font-weight: 400;color: rgba(88,89,91,1.00);line-height:1.6;">If clicking the link does not seem to work, you can copy and paste the link into your browser's address window, or retype it there. Once you have returned to Stylori, we will give instructions for resetting your password.</p>
              </tr>
              <tr>
                  <p style="padding:0px 15px;font-family: 'Arial', sans-serif;font-size: 11px;font-weight: 400;color: rgba(88,89,91,1.00);line-height:1.6;float: left;margin-bottom: 20px;">Stylori  will never e-mail you and ask you to disclose or verify your Stylori password, credit card, or banking account number. If you receive a suspicious e-mail with a link to update your account information, do not click on the link--instead, report the e-mail to Stylori for investigation. Greetings from Stylori.com</p>
              </tr>
             
          </tbody>
      
      </table>
       <div style="position: relative;min-height: 1px;padding-right: 15px;padding-left: 15px;width: 100%;background: rgba(215,221,249,1.00);padding: 10px 0px 20px 0px;">
                  <p style="padding: 0px 15px;font-family: 'Arial', sans-serif;font-size: 12px;font-weight: 400;color: rgba(88,89,91,1.00);width: 45%;float: left;margin: 0;">Customer Care: 1800-102-0330</p>
                  <p style="padding: 0px 15px;font-family: 'Arial', sans-serif;font-size: 12px;font-weight: 400;color: rgba(88,89,91,1.00);width: 32%;float: left;margin: 0;padding-left:0;position: relative;left: 108px;">
                  Contact: hello@nacjewellers.com</p>
              </div>
      </div>
      
      
      </body>
      </html>
      `;
  };
  
  const guestloginTemp = (username, email, token) => {
    if(!username)
      {
        username = "User"
      }
    return `<!doctype html>
      <html>
      <head>
      
      <title>Register authentication</title>
      </head>
      
      <body>
      <div style="width:600px;background:#fff;">
      <table style="width:600px">
          <thead>
              <img src="https://styloriimages.s3.ap-south-1.amazonaws.com/images/templates/cash-on-deli-hdr.jpg" />
          </thead>
          <tbody>
              <tr>
                  <p style="padding:0px 15px;font-family: 'Arial', sans-serif;font-size: 12px;font-weight: bold;color: rgba(88,89,91,1.00);margin:25px 0px;">
                  <h5> Hi User,</h5>
                  </p>
              </tr>
              <tr>
                  <p style="padding:0px 15px;font-family: 'Arial', sans-serif;font-size: 12px;font-weight: 400;color: rgba(88,89,91,1.00); line-height:1.6;float:left;">Welcome to Stylori !!</p>
              </tr>
              
              <tr>
                  <p style="padding:0px 15px;font-family: 'Arial', sans-serif;font-size: 12px;font-weight: 400;color: rgba(88,89,91,1.00);line-height:1.6;">
                  Please use the following code to place order on Stylori  ${token}</p>
              </tr>
              
              <tr>
                  <p style="padding:0px 15px;font-family: 'Arial', sans-serif;font-size: 11px;font-weight: 400;color: rgba(88,89,91,1.00);line-height:1.6;float: left;margin-bottom: 20px;">Stylori  will never e-mail you and ask you to disclose or verify your Stylori password, credit card, or banking account number.</p>
              </tr>
              <tr>
              <p style="padding:0px 15px;font-family: 'Arial', sans-serif;font-size: 11px;font-weight: 400;color: rgba(88,89,91,1.00);line-height:1.6;float: left;margin-bottom: 20px;">If you receive a suspicious e-mail with a link to update your account information, do not click on the link--instead, report the e-mail to Stylori for investigation. Greetings from Stylori.com</p>
          </tr>
          </tbody>
      
      </table>
       <div style="position: relative;min-height: 1px;padding-right: 15px;padding-left: 15px;width: 100%;background: rgba(215,221,249,1.00);padding: 10px 0px 20px 0px;">
                  <p style="padding: 0px 15px;font-family: 'Arial', sans-serif;font-size: 12px;font-weight: 400;color: rgba(88,89,91,1.00);width: 45%;float: left;margin: 0;">Customer Care: 1800-102-0330</p>
                  <p style="padding: 0px 15px;font-family: 'Arial', sans-serif;font-size: 12px;font-weight: 400;color: rgba(88,89,91,1.00);width: 24%;float: left;margin: 0;padding-left:0;position: relative;left: 130px;">
                  Contact: hello@stylori.com</p>
              </div>
      </div>
      
      
      </body>
      </html>
      `;
  };
  const changepasswordTemp = (username, email, token) => {
      if(!username)
      {
        username = "User"
      }
    return `<!doctype html>
      <html>
      <head>
      
      <title>Register authentication</title>
      </head>
      
      <body>
      <div style="width:600px;background:#fff;">
      <table style="width:600px">
          <thead>
              <img src="https://styloriimages.s3.ap-south-1.amazonaws.com/images/templates/cash-on-deli-hdr.jpg" />
          </thead>
          <tbody>
              <tr>
                  <p style="padding:0px 15px;font-family: 'Arial', sans-serif;font-size: 12px;font-weight: bold;color: rgba(88,89,91,1.00);margin:25px 0px;">
                  <h5> Dear ${username},</h5>
                  </p>
              </tr>
              <tr>
                  <p style="padding:0px 15px;font-family: 'Arial', sans-serif;font-size: 12px;font-weight: 400;color: rgba(88,89,91,1.00); line-height:1.6;float:left;">
                  Greetings from Stylori.com.Your password has been changed successfully. In case you haven't requested for the change of password , please click the following link and try forgot password option
                  </p>
              </tr>
              <tr>
                  <p style="padding:0px 15px;font-family: 'Arial', sans-serif;font-size: 12px;font-weight: 400;color: #ed1164;">
                      <span style="color: #ed1164;text-decoration:none;">${process.env.baseurl}</span>
                  </p>
              </tr>
              
              
              <tr>
                  <p style="padding:0px 15px;font-family: 'Arial', sans-serif;font-size: 11px;font-weight: 400;color: rgba(88,89,91,1.00);line-height:1.6;float: left;margin-bottom: 20px;">Stylori  will never e-mail you and ask you to disclose or verify your Stylori password, credit card, or banking account number. If you receive a suspicious e-mail with a link to update your account information, do not click on the link--instead, report the e-mail to Stylori for investigation. Greetings from Stylori.com</p>
              </tr>
             
          </tbody>
      
      </table>
       <div style="position: relative;min-height: 1px;padding-right: 15px;padding-left: 15px;width: 100%;background: rgba(215,221,249,1.00);padding: 10px 0px 20px 0px;">
                  <p style="padding: 0px 15px;font-family: 'Arial', sans-serif;font-size: 12px;font-weight: 400;color: rgba(88,89,91,1.00);width: 45%;float: left;margin: 0;">Customer Care: 1800-102-0330</p>
                  <p style="padding: 0px 15px;font-family: 'Arial', sans-serif;font-size: 12px;font-weight: 400;color: rgba(88,89,91,1.00);width: 24%;float: left;margin: 0;padding-left:0;position: relative;left: 130px;">
                  Contact: hello@stylori.com</p>
              </div>
      </div>
      
      
      </body>
      </html>
      `;
  };
  

  const asktoexpertTemp = (userobj, email, token) => {
    
  return `<!doctype html>
    <html>
    <head>
    
    <title>Ask To Expert</title>
    </head>
    
    <body>
    <div style="width:600px;background:#fff;">
    <table style="width:600px">
        <thead>
            <img src="https://styloriimages.s3.ap-south-1.amazonaws.com/images/templates/cash-on-deli-hdr.jpg" />
        </thead>
        <tbody>
            <tr>
                <p style="padding:0px 15px;font-family: 'Arial', sans-serif;font-size: 12px;font-weight: bold;color: rgba(88,89,91,1.00);margin:25px 0px;">
                <h3> Name : ${userobj.name},</h3>
                <h3> Email : ${userobj.email},</h3>
                <h3> Mobile : ${userobj.phone},</h3>
                <h3> Message : ${userobj.message},</h3>
                <h3> Product : ${userobj.sku_url},</h3>
                <h3> Product SKU : ${userobj.product_sku},</h3>
                </p>
            </tr>
            
           
        </tbody>
    
    </table>
     
    
    
    </body>
    </html>
    `;
};

const contactusTemp = (userobj, email, token) => {
    
  return `<!doctype html>
    <html>
    <head>
    
    <title>Ask To Expert</title>
    </head>
    
    <body>
    <div style="width:600px;background:#fff;">
    <table style="width:600px">
        <thead>
            <img src="https://styloriimages.s3.ap-south-1.amazonaws.com/images/templates/cash-on-deli-hdr.jpg" />
        </thead>
        <tbody>
            <tr>
                <p style="padding:0px 15px;font-family: 'Arial', sans-serif;font-size: 12px;font-weight: bold;color: rgba(88,89,91,1.00);margin:25px 0px;">
                <h3> Name : ${userobj.name},</h3>
                <h3> Email : ${userobj.email},</h3>
                <h3> Mobile : ${userobj.phone},</h3>
                <h3> Message : ${userobj.message},</h3>
                
                </p>
            </tr>
            
           
        </tbody>
    
    </table>
     
    
    
    </body>
    </html>
    `;
};



const subscribeTemp = (userobj, email, token) => {
    
  return `<!doctype html>
    <html>
    <head>
    
    <title>Contact us</title>
    </head>
    
    <body>
    <div style="width:600px;background:#fff;">
    <table style="width:600px">
        <thead>
            <img src="https://styloriimages.s3.ap-south-1.amazonaws.com/images/templates/cash-on-deli-hdr.jpg" />
        </thead>
        <tbody>
            <tr>
                <p style="padding:0px 15px;font-family: 'Arial', sans-serif;font-size: 12px;font-weight: bold;color: rgba(88,89,91,1.00);margin:25px 0px;">
                <h5> Dear User,</h5>
                </p>
            </tr>
            <tr>
                <p style="padding:0px 15px;font-family: 'Arial', sans-serif;font-size: 12px;font-weight: 400;color: rgba(88,89,91,1.00); line-height:1.6;float:left;">
                Thanks For Subscribe
                </p>
            </tr>
            <br/>
            <tr>
                <p style="padding:0px 15px;font-family: 'Arial', sans-serif;font-size: 12px;font-weight: 400;color: #ed1164;">
                    <span style="color: #ed1164;text-decoration:none;">${process.env.baseurl}</span>
                </p>
            </tr>
            
            
            <tr>
                <p style="padding:0px 15px;font-family: 'Arial', sans-serif;font-size: 11px;font-weight: 400;color: rgba(88,89,91,1.00);line-height:1.6;float: left;margin-bottom: 20px;">Stylori  will never e-mail you and ask you to disclose or verify your Stylori password, credit card, or banking account number. If you receive a suspicious e-mail with a link to update your account information, do not click on the link--instead, report the e-mail to Stylori for investigation. Greetings from Stylori.com</p>
            </tr>
           
        </tbody>
    
    </table>
     <div style="position: relative;min-height: 1px;padding-right: 15px;padding-left: 15px;width: 100%;background: rgba(215,221,249,1.00);padding: 10px 0px 20px 0px;">
                <p style="padding: 0px 15px;font-family: 'Arial', sans-serif;font-size: 12px;font-weight: 400;color: rgba(88,89,91,1.00);width: 45%;float: left;margin: 0;">Customer Care: 1800-102-0330</p>
                <p style="padding: 0px 15px;font-family: 'Arial', sans-serif;font-size: 12px;font-weight: 400;color: rgba(88,89,91,1.00);width: 24%;float: left;margin: 0;padding-left:0;position: relative;left: 130px;">
                Contact: hello@stylori.com</p>
            </div>
    </div>
    
    
    </body>
    </html>
    `;
};


  const orderconformation = (username,email,paymentcontent,skudetail,imagelist,day,isloggedin,skuqty) => {
    var productlist = [];
    var prod_content = ""
    var grossamt = 0;
    var discount  = 0;
    var discounted_price = 0;
    var  address_obj = {}
    if(paymentcontent.shopping_cart.gross_amount)
    {
        grossamt = paymentcontent.shopping_cart.gross_amount
    }

    if(paymentcontent.shopping_cart.discount)
    {
        discount = paymentcontent.shopping_cart.discount
    }
    if(paymentcontent.shopping_cart.cart_addresses)
    {
      if(paymentcontent.shopping_cart.cart_addresses.length > 0)
      {
         address_obj = paymentcontent.shopping_cart.cart_addresses [0]

      }
    }
    if(paymentcontent.shopping_cart.discounted_price)
    {
        discounted_price = paymentcontent.shopping_cart.discounted_price
    }
    var products = paymentcontent.shopping_cart.shopping_cart_items;
    var allorders = `<p style="padding:0px 15px;line-height:1.5; font-family: ‘Arial’, sans-serif;font-size: 12px;font-weight: 400;color: rgba(86,86,86,1.00);margin:0;padding-top: 15px;">
    Should you find the details of the order incorrect, please feel free to call us at 18001020330 or email us at hello@stylori.com </p>`
    var username_val = "Hello"
    if(isloggedin)
    {
      username_val = `Hello <span > ${paymentcontent.user_profile.first_name}</span>`
      allorders = `<p style="padding:0px 15px;line-height:1.5; font-family: ‘Arial’, sans-serif;font-size: 12px;font-weight: 400;color: rgba(86,86,86,1.00);margin:0;padding-top: 15px;"> You can visit <a href=${process.env.baseurl+"/account-allorders"}>${process.env.baseurl+"/account-allorders"}</a> to view your order status and to contact us regarding this order.<br />
      Should you find the details of the order incorrect, please feel free to call us at 18001020330 or email us at hello@stylori.com </p>`
    }
    skudetail.forEach(element => {
        var deliverytime = 0
        var deliverdate = ""
        var gemstones_arr = ""
        var quality_str  =""
        if(element.diamond_type)
        {
          quality_str =  `<span >Quality: ${element.diamond_type} <br /></span>`

        }
        if(element.product_list.product_gemstones)
        {
          let gems = element.product_list.product_gemstones
          gems.forEach(gemelement => {
            gemstones_arr = gemstones_arr + `<span
            >Stone: ${gemelement.stone_weight}</span> 
            <span >Number Of Stones: ${gemelement.stone_count}<br />
        </span> <br />`
          })
        }
        if(element.is_ready_to_ship)
        {
            deliverytime = 1;
        }else{
            deliverytime = element.vendor_delivery_time
        }
        var todayDate = moment();

        deliverdate = todayDate.add(deliverytime, 'days').format("DD MMM YYYY");

        prod_content = prod_content + `<tr>
        <td style="vertical-align: top;padding-left:0px;padding-top: 10px;width: 150px;">
        <img  src='${imagelist[element.product_id]}' width="150px" />	
       </td> 
        <td>
            <p style="font-family: 'Arial', sans-serif;font-size: 12px;font-weight: 400;color: rgba(86,86,86,1.00);line-height: 1.5;margin:0;padding-top: 10px;">
            <span >${element.product_list.product_name}</span> <br />
            <span>Metal:${element.purity} ${element.metal_color} <br />
            </span> 
            ${quality_str}
            <span >Metal Weight: ${element.sku_weight} <br />
            </span> <br /> 
            ${gemstones_arr}
            </span>
            </p>
            
            <p style="border-top: 1px solid rgba(172,172,172,1.00);float: left;padding-top: 5px;margin-bottom: 5px;font-family: 'Arial', sans-serif;font-size: 12px;font-weight: 400;color: rgba(86,86,86,1.00);margin-bottom:10px;" >
            Expected Ship Date: <span >${deliverdate}</span>                      
            </p>
        </td>
       <td style="vertical-align: top;padding-top: 10px;"><p style="font-family: 'Arial', sans-serif;font-size: 12px;font-weight: 400;color: rgba(86,86,86,1.00);margin:0;text-align:right;" >${skuqty[element.generated_sku]}</p></td>
        <td style="vertical-align: top;padding-top: 10px;"><p style="font-family: 'Arial', sans-serif;font-size: 12px;font-weight: 400;color: rgba(86,86,86,1.00);margin:0;text-align:right;"><!-- <i class="fa fa-inr" aria-hidden="true"></i>--><img src="https://styloriimages.s3.ap-south-1.amazonaws.com/images/templates/rupee.png"/><span >${element.markup_price}</span></p>
        </td>
    </tr>`
    
    })

    
    return  `<!doctype html>
    <html>
    <head>
    <meta charset="utf-8"/>
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" />
    <title>Order Confirmation</title>
    </head>
    <body>
    <div style="width:600px;float:left;background:#FFFFFF;">
        <table style="width:600px;border-collapse: collapse;">
            <thead>
                <img src="https://styloriimages.s3.ap-south-1.amazonaws.com/images/templates/cash-on-deli-hdr.jpg" />
            </thead>
            <tbody>
                <tr style="width:100%;">
                <p style="padding:0px 15px; font-family: ‘Arial’, sans-serif;font-size: 12px;font-weight: 400;color: rgba(88,89,91,1.00); text-align: right;" >
                    Order Placed On:
                     <span>${day}</span>
                </p>
            </tr>
             <tr style="width:100%;">
                <p style="padding:0px 15px; font-family: ‘Arial’, sans-serif;font-size: 12px;font-weight: 400;color: rgba(88,89,91,1.00); text-align: right;" >
                    Payment method:
                    <span >${paymentcontent.payment_mode}</span>
                </p>
            </tr>
            <tr style="width:100%;">
                <p style="padding:0px 15px; font-family: ‘Arial’, sans-serif; font-size: 12px; font-weight: 500; color: rgba(237,18,95,1.00); text-align: right;">Order Number: <span >${paymentcontent.id}</span></p>
            </tr>
             <tr style="width:100%;" >
                <p style="padding:0px 15px; font-family: ‘Arial’, sans-serif; font-size: 12px; font-weight: 500; color: rgba(88,89,91,1.00);">
                <h5>${username_val}
                <span ></span>
                </h5>
                </p>
            </tr>
          <!--  <tr style="width:100%;">
                <p style="padding:0px 15px; font-family: ‘Arial’, sans-serif; font-size: 12px; font-weight: 500; color: rgba(88,89,91,1.00);">
                <h5>Hello <span ></span></h5>
                </p>
            </tr> -->
             <tr style="width:100%;">
                <p style="padding:0px 15px; font-family: ‘Arial’, sans-serif; font-size: 12px; font-weight: 400; color: rgba(88,89,91,1.00); line-height:1.6;">Thank You for placing your order with STYLORI,
                    Your order has been confirmed and is being processed. Here is the summary :</p>
            </tr>
            <tr>
                <table style="width:600px;padding: 0px 15px;text-align: left;border:none;border-collapse: collapse;margin-top: 15px;">
                    <thead>
                     <tr style="border-top:1px solid #ACACAC;border-bottom:1px solid #ACACAC;">
                        <th><p style="font-family: ‘Arial’, sans-serif;font-size: 12px;font-weight: bold;color: rgba(86,86,86,1.00);margin:0;padding: 10px 15px;">Item</p></th>
                        <th><p style="font-family: ‘Arial’, sans-serif;font-size: 12px;font-weight: bold;color: rgba(86,86,86,1.00);margin:0;padding: 10px 0px;">Product Details</p></th>
                        <th><p style="font-family: ‘Arial’, sans-serif;font-size: 12px;font-weight: bold;color: rgba(86,86,86,1.00);margin:0;padding: 10px 0px;text-align:right;">Quantity</p></th>
                        <th><p style="font-family: ‘Arial’, sans-serif;font-size: 12px;font-weight: bold;color: rgba(86,86,86,1.00);margin:0;padding: 10px 5px 10px 0;text-align:right;">Sub Total</p></th>
                    </tr>
                    </thead>
                    <tbody>
                        ${prod_content}
                        <tr style="border-top:1px solid #ACACAC;">
                            <td></td>
                            
                            <td colspan="2"><p style="font-family: ‘Arial’, sans-serif;font-size: 12px;font-weight: 400;color: rgba(86,86,86,1.00);margin:0;text-align:right;margin-top:15px;padding-bottom:10px;">
                                   Total : <br />
                                Shipping Charges:<br />
                                Discount: 
                                </p>
                            </td>
                            <td><p style="font-family: ‘Arial’, sans-serif;font-size: 12px;font-weight: 400;color: rgba(86,86,86,1.00);margin:0;text-align:right;margin-top:15px;padding-bottom:10px;width: 100px;">
                                <!-- <i class="fa fa-inr" aria-hidden="true"></i> --><img src="https://styloriimages.s3.ap-south-1.amazonaws.com/images/templates/rupee.png"/><span > ${grossamt}</span>/- <br />
                                Free<br />
                               <!-- <i class="fa fa-inr" aria-hidden="true"></i> --><img src="https://styloriimages.s3.ap-south-1.amazonaws.com/images/templates/rupee.png"/><span > ${discount}</span>/-
                               </p>
                            </td>
                        </tr>
                        <tr style=border-top:1px solid #ACACAC;border-bottom:1px solid #ACACAC;">
                            <td style="vertical-align: top;"><p style="font-family: ‘Arial’, sans-serif;font-size: 12px;font-weight: 400;color: rgba(86,86,86,1.00);margin:0;padding:5px 0 5px 15px;">* Inclusive of all taxes.</p></td>
                            <td></td>
                            <td style="vertical-align: top;"><p style="font-family: ‘Arial’, sans-serif;font-size: 14px;color: rgba(207,32,72,1.00);
    font-weight: bold;text-align:right;margin:0;padding:5px 0px;">Grand Total : </p></td>
                            <td style="vertical-align: top;"><p style="font-family: ‘Arial’, sans-serif;font-size: 14px;color: rgba(207,32,72,1.00);
    font-weight: bold;text-align:right;margin:0;padding:5px 0px;"><!-- <i class="fa fa-inr" aria-hidden="true"></i> --><img src="https://styloriimages.s3.ap-south-1.amazonaws.com/images/templates/rupee.png"/><span >${discounted_price}</span>/-</p>
    </td>
                        </tr>
                    </tbody>
                </table>
            </tr>
              <tr>
                <td>
                 <p style="font-family: ‘Arial’, sans-serif; font-size: 13px; font-weight: 600; color: rgba(88,89,91,1.00); width:40%; padding-left: 15px;line-height:1.6;margin: 0;margin-top:15px;">
                    Shipping Address:<br/>
                    <p style="font-size: 13px; font-weight: 400;padding-left: 15px;color: #767D89;">${address_obj.firstname} ${address_obj.lastname}</p>
                        <p style="font-size: 13px; font-weight: 400;padding-left: 15px;color: #767D89;">${address_obj.addressline1}</p>
                        <p style="font-size: 13px; font-weight: 400;padding-left: 15px;color: #767D89;">${address_obj.addressline2}, ${address_obj.city}, ${address_obj.state},</p>
                        <p style="font-size: 13px; font-weight: 400;padding-left: 15px;color: #767D89;">${address_obj.country} - ${address_obj.pincode}.</p>
                        </p>
                </td>
            </tr>
            <tr>
              ${allorders}               
          <p style="line-height:1.5;padding:0px 15px;font-family: ‘Arial’, sans-serif;font-size: 12px;font-weight: 400;color: rgba(86,86,86,1.00);margin:15px 0;">Team Stylori <br />
              With Love </p>
                        </tr>
            </tbody>
        </table>
         <div class="container" style="position: relative;
       height: 35px;
    align-items: center;
    display: flex;
    width: 100%;
    background: rgba(215,221,249,1.00);"
>
                <p style="padding: 0px 15px;
    font-family: ‘Arial’, sans-serif;
    font-size: 12px;
    font-weight: 400;
    color: rgba(88,89,91,1.00);
    width: 45%;
    float: left;
    margin: 0;">Customer Care: 18001020330</p>
                <p style="padding: 0px 15px;
    font-family: ‘Arial’, sans-serif;
    font-size: 12px;
    font-weight: 400;
    color: rgba(88,89,91,1.00);
    width: 24%;
    float: left;
    margin: 0;
    padding-left:0;
    position: relative;
    left: 130px;">Contact: hello@stylori.com</p>
            </div>
    </div>
    </body>
    </html>
       
    `;
  };

  const emailTemplate = {};
  emailTemplate.getName = getName;
  emailTemplate.forgotpasswordTemp = forgotpasswordTemp;
  emailTemplate.changepasswordTemp = changepasswordTemp
  emailTemplate.orderConformation = orderconformation
  emailTemplate.guestloginTemp = guestloginTemp
  emailTemplate.asktoexpertTemp = asktoexpertTemp
  emailTemplate.contactusTemp = contactusTemp
  emailTemplate.subscribeTemp = subscribeTemp


module.exports = emailTemplate
