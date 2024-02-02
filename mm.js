const makeApiRequest = require('./apiRequest');
const apiConfigs = require('./apiConfigs');
const apiUrls = require('./apiUrls');

// Set your actual API key and secret
const apiKey = 'your_api_key';
const secret = 'your_secret';

// Merge the autradexConfig with the global apiKey and secret
const mergedConfig = {
  ...autradexConfig,
  apiKey,
  secret,
};

// Get markets - Working
 makeApiRequest(mergedConfig)
  .then(response => {
    if (!response.error) {
      console.log(response);
    } else {
      console.log(response);
    }
  })
  .catch(error => {
    console.error(error);
  });

// BOT TEST - Working
setInterval(function () {
  console.log("_________________________________________________________");

  // Options
  var theMarket = "dogebtc";
  var increase = 0.000000001;
  var volume = 1;

  // Close all orders - ToDo

  makeApiRequest({ ...mergedConfig, apiUrl: apiUrls.clearAllOrders })
    .then(res => {
      if (!res.error) {
        if (Array.isArray(res)) {
          console.log("Removing old orders...");
          res.forEach(function (order) {
            console.log(order.id + "|" + order.state + "|" + order.side);
          });
        } else {
          console.error('Unexpected response format. Expected an array.');
        }

        makeApiRequest({ ...mergedConfig, apiUrl: `your_order_book_api_url/${theMarket}` })
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

              makeApiRequest({ ...mergedConfig, apiUrl: `your_orders_api_url/${theMarket}` })
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

                      makeApiRequest({ ...mergedConfig, apiUrl: 'your_create_order_api_url', method: 'POST', data: { market: theMarket, side: 'buy', volume: volume, price: buyPrice } })
                        .then(res => {
                          if (!res.error) {
                            // sell
                            makeApiRequest({ ...mergedConfig, apiUrl: 'your_create_order_api_url', method: 'POST', data: { market: theMarket, side: 'sell', volume: volume, price: sellPrice } })
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

}, 30 * 60); // 60 * 1000 milsec
