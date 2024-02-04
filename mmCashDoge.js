const makeApiRequest = require('./apiRequest');
const apiConfigs = require('./apiConfigs');
const apiUrls = require('./apiUrls');

// Set your actual API key and secret
const apiKey = '';
const secret = '';

const increase = 0.000001;

// Iterate over the API configurations and make requests
apiConfigs.forEach(config => {
  // You can override apiKey and secret if needed for a specific config
  const apiUrlWithCurrency = apiUrls.getMarket.replace('this', 'cashdoge');
  const currentConfig = {
    ...config,
    apiKey,
    secret,
  };

  // BOT TEST
    console.log("Market Maker Bot Live");
  setInterval(function () {
    console.log("_________________________Market Making________________________________");

  let oursSell = false;
  let oursBuy = false;

  makeApiRequest({ ...currentConfig, apiUrl: apiUrlWithCurrency })
    .then(res => {

      if (res.data && res.data.asks && res.data.asks.length > 0) {
        const sellAsk = res.data.asks.find(ask => ask.side && ask.side.toLowerCase() === 'sell');
        const buyAsk = res.data.bids.find(ask => ask.side && ask.side.toLowerCase() === 'buy');

        if (sellAsk && buyAsk) {
          // get spread
          var selling = parseFloat(sellAsk.price);
          var buying = parseFloat(buyAsk.price);
          console.log("[Market Making]");
          console.log("Selling At: " + selling.toFixed(9));
          console.log("Buying At: " + buying.toFixed(9));
          var spread = (selling - buying).toFixed(9);
          console.log("Spread BTC: " + spread);

          if (spread < 0.000003) {
            // not worth it, end
            console.log("Not worth it, spread is too low...");
            return;
          }

          // Check existing orders
          makeApiRequest({ ...currentConfig, apiUrl: apiUrls.getMyOrders })
            .then(existingOrdersRes => {
              if (!existingOrdersRes.error) {
                // console.log("Existing Orders:", existingOrdersRes);

                // Assuming existing orders are in existingOrdersRes.data or a similar structure
                const orders = existingOrdersRes.data; // Adjust if needed

                // Check existing orders
                orders.forEach(order => {
                  // console.log(order.price);
                  if (order.price == selling) {
                    oursSell = false;
                  }
                  if (order.price == buying) {
                    oursBuy = false;
                  }
                });

                var buyPrice = (buying + increase).toFixed(9);
                var sellPrice = (selling - increase).toFixed(9);

                if (!oursBuy || !oursSell) {
                  console.log("Orders live are not ours, making new orders...");

                  const buyOrderData = { price: buyPrice, volume: '5500', side: 'buy', ord_type: 'limit', market: 'cashdoge' };
                  const sellOrderData = { price: sellPrice, volume: '5500', side: 'sell', ord_type: 'limit', market: 'cashdoge' };
                  // Create new sell order
                  makeApiRequest({ ...currentConfig, apiUrl: apiUrls.createOrder, method: 'post', data: buyOrderData })
                    .then(res => {
                      if (!res.error) {
                        console.log("Sell Order Created");
                      }
                    })
                    .catch(error => {
                      console.error("Error creating sell order:", error);
                    });

                  // Create new buy order
                  makeApiRequest({ ...currentConfig, apiUrl: apiUrls.createOrder, method: 'post', data: sellOrderData })
                    .then(res => {
                      if (!res.error) {
                        console.log("Buy Order Created");
                      }
                    })
                    .catch(error => {
                      console.error("Error creating buy order:", error);
                    });

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
  }, 1 * 60 * 1000); // 1 Minute
});
