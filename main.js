const makeApiRequest = require('./apiRequest');
const apiConfigs = require('./apiConfigs');
const apiUrls = require('./apiUrls');

// Set your actual API key and secret
const apiKey = 'your_api_key';
const secret = 'your_secret';

//const apiUrlWithCurrency = apiUrls.getMarket.replace('this', 'dogebtc');
//console.log(apiUrlWithCurrency);
// Iterate over the API configurations and make requests
apiConfigs.forEach(config => {
  // You can override apiKey and secret if needed for a specific config
  const apiUrlWithCurrency = apiUrls.getMarket.replace('this', 'dogebtc');
  const currentConfig = {
    ...config,
    apiKey,
    secret,
  };

  makeApiRequest({ ...currentConfig, apiUrl: apiUrlWithCurrency })
    .then(response => {
      console.log(`Response for ${currentConfig.apiName}:`, response.data);
    })
    .catch(error => {
      console.error(`Error for ${currentConfig.apiName}:`, error.response ? error.response.data : error.message);
    });
});
