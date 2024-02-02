const makeApiRequest = require('./apiRequest');
const apiConfigs = require('./apiConfigs');

// Set your actual API key and secret
const apiKey = 'your_api_key';
const secret = 'your_secret';

// Iterate over the API configurations and make requests
apiConfigs.forEach(config => {
  // You can override apiKey and secret if needed for a specific config
  const currentConfig = {
    ...config,
    apiKey,
    secret,
  };

  makeApiRequest(currentConfig)
    .then(response => {
      console.log(`Response for ${currentConfig.apiName}:`, response.data);
    })
    .catch(error => {
      console.error(`Error for ${currentConfig.apiName}:`, error.response ? error.response.data : error.message);
    });
});
