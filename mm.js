const makeApiRequest = require('./apiRequest');
const apiConfigs = require('./apiConfigs');
const apiUrls = require('./apiUrls');

// Set your actual API key and secret
const apiKey = '';
const secret = '';

// Iterate over the API configurations and make requests
apiConfigs.forEach(config => {
  // Merge the current config with the global apiKey and secret
  const currentConfig = {
    ...config,
    apiKey,
    secret,
  };

  // Get markets - Working
  makeApiRequest({ ...currentConfig, apiUrl: apiUrls.balances })
    .then(response => {
      if (!response.error) {
        console.log(response.data);
      } else {
        console.log(response.error);
      }
    })
    .catch(error => {
      console.error(error);
    });

  // BOT TEST
  setInterval(function () {
    console.log("_________________________________________________________");

    // Options
    var theMarket = "mtbcdoge";
    var increase = 0.000000001;
    var volume = 1;

    // Close all orders
/*    makeApiRequest({ ...currentConfig, apiUrl: apiUrls.clearAllOrders })
      .then(res => {
        if (!res.error) {
          console.log(res);
          if (Array.isArray(res)) {
            console.log("Removing old orders...");
            res.forEach(function (order) {
              console.log(order.id + "|" + order.state + "|" + order.side);
            });
          } else {
            console.error('Unexpected response format. Expected an array.');
          }*/

          makeApiRequest({ ...currentConfig, apiUrl: apiUrls.getMarket })
            .then(res => {
              if (!res.error) {
                // get spread
                var selling = parseFloat(res.asks[0].price);
                var buying = parseFloat(res.bids[0].price);
                console.log("[Market Making]");
                console.log("Selling At: " + selling.toFixed(9));
                console.log("Buying At: " + buying.toFixed(9));
                var spread = ((selling - increase) - (buying + increase)).toFixed(9);
                console.log("Spread BTC: " + spread);

                if (spread < 0.00000003) {
                  // not worth it end
                  console.log("Not worth it, spread is too low...");
                  return;
                }

                // check if those orders are ours
                var oursSell = false;
                var oursBuy = false;

                makeApiRequest({ ...currentConfig, apiUrl: apiUrls.getMarket })
                  .then(res => {
                    if (!res.error) {
                      res.forEach(function (order) {
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

                        // buy
                        console.log("Buy Price: " + buyPrice);
                        console.log("Sell Price: " + sellPrice);

                        makeApiRequest({ ...currentConfig, apiUrl: 'your_create_order_api_url', method: 'POST', data: { market: theMarket, side: 'buy', volume: volume, price: buyPrice } })
                          .then(res => {
                            if (!res.error) {
                              // sell
                              makeApiRequest({ ...currentConfig, apiUrl: 'your_create_order_api_url', method: 'POST', data: { market: theMarket, side: 'sell', volume: volume, price: sellPrice } })
                                .then(res2 => {
                                  if (!res.error) {
                                    console.log(res.id + "|" + res.state + "|" + res.side);
                                    console.log(res2.id + "|" + res2.state + "|" + res2.side);
                                    // rinse and repeat?
                                    // rinse and repeat?
                                    // rinse and repeat?
                                  } else {
                                    console.log(res)
                                  }
                                });
                            } else {
                              console.log(res)
                            }
                          });
                      } else {
                        console.log("Orders live are ours...");
                      }

                    } else {
                      console.log(res)
                    }
                  });

              } else {
                console.log(res)
              }
            });

        } else {
          console.log(res)
        }
      });

  }, 1 * 10 * 1000); // 1 Minute

});
