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

  let oursSell = false;
  let oursBuy = false;

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

          // Check existing orders
          makeApiRequest({ ...currentConfig, apiUrl: apiUrls.getMyOrders })
            .then(existingOrdersRes => {
              if (!existingOrdersRes.error) {
                console.log("Existing Orders:", existingOrdersRes);

                // Assuming existing orders are in existingOrdersRes.data or a similar structure
                const orders = existingOrdersRes.data; // Adjust if needed

                // Check existing orders
                orders.forEach(order => {
                  console.log(order.price);
                  if (order.price == selling) {
                    oursSell = true;
                  }
                  if (order.price == buying) {
                    oursBuy = true;
                  }
                });

                var buyPrice = (buying + increase).toFixed(9);
                var sellPrice = (selling - increase).toFixed(9);

                if (!oursBuy || !oursSell) {
                  console.log("Orders live are not ours, making new orders...");

                  // You can add logic here to make new orders based on buyPrice and sellPrice
                  console.log("Buy Price: " + buyPrice);
                  console.log("Sell Price: " + sellPrice);
                } else {
                  console.log("Our orders are already live, no need to create new orders.");
                }
              }
            })
            .catch(error => {
              console.error("Error checking existing orders:", error);
            });
        } else {
          console.log("No 'sell' or 'buy' ask found in the API response");
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
