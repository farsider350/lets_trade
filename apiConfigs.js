const apiUrls = require('./apiUrls');

module.exports = [
  {
    apiName: 'Get Single Market',
    apiUrl: apiUrls.getMarket,
  },
  {
    apiName: 'Trading Fees',
    apiUrl: apiUrls.tradingFees,
  },
  {
    apiName: 'Balances',
    apiUrl: apiUrls.balances,
  },
  {
    apiName: 'Markets',
    apiUrl: apiUrls.markets,
  },
  {
    apiName: 'Cancel All Orders',
    apiUrl: apiUrls.clearAllOrders,
  },
  {
    apiName: 'Create Order',
    apiUrl: apiUrls.createOrder,
  },
  // Add more API configurations as needed
];
