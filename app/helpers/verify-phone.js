const config = require('../config.json');
var request = require("request");


module.exports = { sendOTP, verifyOTP };

async function sendOTP(phoneNumber) {
    var options = { method: 'GET',
      url: 'http://2factor.in/API/V1/'+ config.verifyPhoneAPIKEY +'/SMS/'+ phoneNumber +'/AUTOGEN',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      form: {} };
    
    request(options, function (error, response, body) {
      if (error) return error;
    
      console.log(body);
      return body;
    });
}

async function verifyOTP(otpCode, sessionId ) {

    var options = { method: 'GET',
      url: 'http://2factor.in/API/V1/'+ config.verifyPhoneAPIKEY +'/SMS/VERIFY/'+ sessionId +'/'+ otpCode,
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      form: {} };
    
    request(options, function (error, response, body) {
      if (error) return error;
    
      console.log(body);
      return body;
    });
}