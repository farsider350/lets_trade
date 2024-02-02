const makeApiRequest = require('./apiRequest');
const apiConfigs = require('./apiConfigs');
const apiUrls = require('./apiUrls');

// Set your actual API key and secret
const apiKey = 'your_api_key';
const secret = 'your_secret';

const increase = 0.00000002;

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
    .then(res => {
      console.log("API Response:", res.data);

      if (res.data && res.data.asks && res.data.asks.length > 0) {
        // Find the first 'sell' ask
        const sellAsk = res.data.asks.find(ask => ask.side && ask.side.toLowerCase() === 'sell');
        const buyAsk = res.data.bids.find(ask => ask.side && ask.side.toLowerCase() === 'buy');

        if (sellAsk && buyAsk) {
          // get spread
          var selling = parseFloat(sellAsk.price);
          var buying = parseFloat(buyAsk.price);
          console.log("[Market Making]");
          console.log("Selling At: " + selling.toFixed(9));
          console.log("Buying At: " + buying.toFixed(9));
          var spread = ((selling - increase) - (buying + increase)).toFixed(9);
          console.log("Spread BTC: " + spread);

          if (spread < 0.00000003) {
            // not worth it, end
            console.log("Not worth it, spread is too low...");
            return;
          }
        } else {
          console.log("No 'sell' ask found in the API response");
        }
      } else {
        console.log("No asks found in the API response");
      }
    })
    .catch(error => {
      // Handle errors here
      console.error("Error making API request:", error);
    });
});
