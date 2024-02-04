// Arb Bot
const makeApiRequest = require('./apiRequest');
const apiConfigs = require('./apiConfigs');
const apiUrls = require('./apiUrls');
const graviex = require("./graviex.js");
// const autradex = require("./autradex.js"); // Import autradex module if not already imported

const {
  dogeBtcAutxAccessKey,
  dogeBtcAutxSecretKey,
  dogeBtcGravAccessKey,
  dogeBtcGravSecretKey,
  dogeBtcArbLoop,
  dogeBtcArbMarket,
  dogeBtcArbSpread,
  dogeBtcArbVol
} = require('./config.json');

// Config Access Keys
const apiKey = '';
const secret = '';

// Graviex
graviex.accessKey = '';
graviex.secretKey = '';

// Loop Time in Seconds
const loop = 120;

// Iterate over the API configurations and make requests
apiConfigs.forEach(config => {
  // You can override apiKey and secret if needed for a specific config
  const apiUrlWithCurrency = apiUrls.getMarket.replace('this', 'dogebtc');
  const currentConfig = {
    ...config,
    apiKey,
    secret,
  };

  // Config Market
  setInterval(function () {
    console.log("_________Beginning Market Matching for Doge vs Bitcoin on Graviex_________");
    const theMarket = "dogebtc";
    // const increase = "0.000000001"; // The most allowed increase in overlap
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

              console.log("[Graviex Center Orders]");
              console.log("Graviex Selling At: " + sellingGrav.toFixed(9));
              console.log("Graviex Buying At: " + buyingGrav.toFixed(9));

              // Check if those orders are ours
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

              const sellPriceAutx = sellingGrav.toFixed(8);
              const buyPriceAutx = buyingGrav.toFixed(8);
              const sellPriceGrav = sellingAutx.toFixed(8);
              const buyPriceGrav = buyingAutx.toFixed(8);


              // Lets match the buying price at Autradex with Graviex
              if (buyPriceGrav !== buyPriceAutx && buyPriceGrav < buyPriceAutx) {
                console.log("Orders are not equal, adjusting");

                    // Buy at Autradex
                    const buyOrderData = { price: buyPriceAutx, volume: '3', side: 'buy', ord_type: 'limit', market: 'dogebtc' };
                    makeApiRequest({ ...currentConfig, apiUrl: apiUrls.createOrder, method: 'post', data: buyOrderData })
                      .then(res5 => {
                        if (!res5.error) {
                          console.log("Buy Order Created:", res5.data);
                          //console.log(res5.id + "|" + res5.state + "|" + res5.side);
                        } else {
                          console.log(res5)
                        }
                      });
              } else {
                console.log("Autradex Buy Is Less Than Graviex Sell - Doing nothing on this side");
              }

              // Lets match the selling price at Autradex with Graviex
              if (sellPriceGrav !== sellPriceAutx && sellPriceGrav > sellPriceAutx) {
                console.log("Orders are not equal, adjusting");

                // Sell at Autradex
                const sellOrderData = { price: sellPriceAutx, volume: '3', side: 'sell', ord_type: 'limit', market: 'dogebtc' };
                makeApiRequest({ ...currentConfig, apiUrl: apiUrls.createOrder, method: 'post', data: sellOrderData })
                  .then(res6 => {
                    if (!res6.error) {
                          console.log("Sell Order Created:", res6.data);
                          //console.log(res6.id + "|" + res6.state + "|" + res6.side);
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

  // Add the missing ')' here
}, loop * 1000);
