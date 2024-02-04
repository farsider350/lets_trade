// Arb Bot for Graviex - Autradex API and Graviex API - Warning!!! Repeats buys 6 times
const makeApiRequest = require('./apiRequest');
const apiConfigs = require('./apiConfigs');
const apiUrls = require('./apiUrls');
const graviex = require("./graviex.js");

// Config Access Keys
const apiKey = '';
const secret = '';

// Graviex
graviex.accessKey = '';
graviex.secretKey = '';

// Loop Time in Seconds
const loop = 1 * 60; // 1 * 60 is 1 Minute

// Iterate over the API configurations and make requests
apiConfigs.forEach(config => {
  const apiUrlWithCurrency = apiUrls.getMarket.replace('this', 'dogebtc');
  const currentConfig = {
    ...config,
    apiKey,
    secret,
  };

  // Config Market
  setInterval(function () {
    console.log("_________Beginning Arb Discovery Against Graviex_________");
    const theMarket = "dogebtc";
    const increase = "0.000000001"; // The most allowed increase in overlap
    const volume = "33"; // The volume you wish to trade with
    // Check Autradex Orders
    makeApiRequest({ ...currentConfig, apiUrl: apiUrlWithCurrency })
      .then(res => {
        console.log("API Response:", res.data);

        if (res.data && res.data.asks && res.data.asks.length > 0) {
          const sellAsk = res.data.asks.find(ask => ask.side && ask.side.toLowerCase() === 'sell');
          const buyAsk = res.data.bids.find(ask => ask.side && ask.side.toLowerCase() === 'buy');

          const sellingAutx = parseFloat(sellAsk.price);
          const buyingAutx = parseFloat(buyAsk.price);

          console.log("[Autradex Inside Orders]");
          console.log("Autradex Selling At: " + sellingAutx.toFixed(9));
          console.log("Autradex Buying At: " + buyingAutx.toFixed(9));

          // Check Graviex Orders
          graviex.orderBook(theMarket, function (res2) {
            if (!res2.error) {
              const sellingGrav = parseFloat(res2.asks[0].price);
              const buyingGrav = parseFloat(res2.bids[0].price);

              console.log("[Graviex Inside Orders]");
              console.log("Graviex Selling At: " + sellingGrav.toFixed(9));
              console.log("Graviex Buying At: " + buyingGrav.toFixed(9));

              // Check if those orders are ours - ToDo
              let oursSell = false;
              let oursBuy = false;

              /*autradex.orders(theMarket, function (res3) {
                if (!res3.error) {
                  res3.forEach(function (order) {
                    console.log(order.price);
                    if (order.price == sellingAutx) {
                      oursSell = true;
                    }
                    if (order.price == buyingAutx) {
                      oursBuy = true;
                    }
                  });*/

              const buyPriceAutx = sellingGrav.toFixed(9);
              const sellPriceAutx = buyingGrav.toFixed(9);
              const buyPriceGrav = sellingAutx.toFixed(9);
              const sellPriceGrav = buyingAutx.toFixed(9);

              // If Autradex buy is greater than Graviex sell
              if ((buyingAutx - increase) > sellingGrav) {
                console.log("Orders Have Arb Opportunity");

                // Buy From Graviex
                graviex.createOrder(theMarket, "buy", volume, sellingGrav, function (res4) {
                  if (!res4.error) {
                    // Sell To Autradex
                    const buyOrderData = { price: buyPriceAutx, volume: volume, side: 'buy', ord_type: 'limit', market: 'dogebtc' };
                    makeApiRequest({ ...currentConfig, apiUrl: apiUrls.createOrder, method: 'post', data: buyOrderData })
                      .then(res5 => {
                        if (!res5.error) {
                          console.log("Arb Complete!");
                        } else {
                          console.log(res5)
                        }
                      });
                  } else {
                    console.log(res4)
                  }
                });
              } else {
                console.log("Autradex Buy Is Less Than Graviex Sell - Doing nothing on this side");
              }

              // If Graviex buy is greater than Autradex sell
              if ((buyingGrav - increase) > sellingAutx) {
                console.log("Orders Have Arb Opportunity");

                // Buy From Autradex
                const buyOrderData = { price: buyPriceGrav, volume: volume, side: 'buy', ord_type: 'limit', market: 'dogebtc' };
                makeApiRequest({ ...currentConfig, apiUrl: apiUrls.createOrder, method: 'post', data: buyOrderData })
                  .then(res6 => {
                    if (!res6.error) {
                      // Sell To Graviex
                      graviex.createOrder(theMarket, "sell", volume, buyingGrav, function (res7) {
                        if (!res7.error) {
                          console.log("Arb Complete");
                        } else {
                          console.log(res7)
                        }
                      });
                    } else {
                      console.log(res6)
                    }
                  });
              } else {
                console.log("Graviex Buy Is Less Than Autradex Sell - Doing nothing on this side");
              }
            } else {
              console.log(res2);
              console.log("Arb detection loop complete");
            }
          });
        }
      })
      .catch(error => {
        console.error("Error making API request:", error);
      });
  }, loop * 1000);

}, loop * 1000);
