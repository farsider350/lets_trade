const makeApiRequest = require('./apiRequest');
const apiConfigs = require('./apiConfigs');
const apiUrls = require('./apiUrls');

// Set your actual API key and secret
const apiKey = '';
const secret = '';

// Iterate over the API configurations and make requests
apiConfigs.forEach(config => {
  // You can override apiKey and secret if needed for a specific config
  const apiUrlWithCurrency = apiUrls.getMarket.replace('this', 'dogebtc');
  const currentConfig = {
    ...config,
    apiKey,
    secret,
  };

  // Create new buy order
  const buyOrderData = { price: '0.00000201', volume: '1.2', side: 'buy', ord_type: 'limit', market: 'dogebtc' };

  makeApiRequest({ ...currentConfig, apiUrl: apiUrls.createOrder, method: 'post', data: buyOrderData })
    .then(res => {
      console.log("API Request Response:", res.data);

      if (!res.error) {
        console.log("Buy Order Created:", res.data + "|" + res.state + "|" + res.side);
      }
    })
    .catch(error => {
      console.error("Error creating buy order:", error);
    });
});
