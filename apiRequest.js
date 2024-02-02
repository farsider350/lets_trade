const axios = require('axios');
const crypto = require('crypto');

function makeApiRequest(apiConfig) {

  const apiKey = apiConfig.apiKey;
  const secret = apiConfig.secret;
  // Get current timestamp in milliseconds
  function getCurrentTimestamp() {
    return new Date().getTime();
  }

  const currentTimestamp = getCurrentTimestamp();
  console.log("Current Timestamp in milliseconds:", currentTimestamp);

  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(currentTimestamp + apiKey);

  const digest = hmac.digest('hex');
  console.log('Generated HMAC:', digest);

  const authSignature = digest;

  return axios({
    method: apiConfig.method, // Use the method from apiConfig
    url: apiConfig.apiUrl,
    headers: {
      'X-Auth-Apikey': apiKey,
      'X-Auth-Nonce': currentTimestamp,
      'X-Auth-Signature': authSignature
    },
    data: apiConfig.data, // Use the data from apiConfig
  });
}

module.exports = makeApiRequest;
