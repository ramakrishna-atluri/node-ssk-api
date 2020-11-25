const config = require('../config.json');
var request = require("request");


module.exports = { sendOTP, verifyOTP };

async function sendOTP(phoneNumber) {
    var options = { method: 'GET',
      url: 'http://2factor.in/API/V1/'+ config.verifyPhoneAPIKEY +'/SMS/'+ phoneNumber +'/AUTOGEN',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      form: {} };
      
      // Return new promise
      return new Promise(function(resolve, reject) {
        // Do async job
        request.get(options, function(err, resp, body) {
          if (err) {
            reject(err);
          } else {
            resolve(body);
          }
        })
      })
}

async function verifyOTP(otpCode, sessionId ) {

    var options = { method: 'GET',
      url: 'http://2factor.in/API/V1/'+ config.verifyPhoneAPIKEY +'/SMS/VERIFY/'+ sessionId +'/'+ otpCode,
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      form: {} };
    
    // Return new promise
    return new Promise(function(resolve, reject) {
      // Do async job
      request.get(options, function(err, resp, body) {
        if (err) {
          reject(err);
        } else {
          resolve(body);
        }
      })
    })
}