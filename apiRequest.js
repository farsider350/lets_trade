const axios = require('axios');
const crypto = require('crypto');

const apiKey = 'your_api_key'; // Set your actual API key
const secret = 'your_secret'; // Set your actual secret

function makeApiRequest(apiConfig) {
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
    method: 'GET',
    url: apiConfig.apiUrl,
    headers: {
      'X-Auth-Apikey': apiKey,
      'X-Auth-Nonce': currentTimestamp,
      'X-Auth-Signature': authSignature
    }
  });
}

module.exports = makeApiRequest;
