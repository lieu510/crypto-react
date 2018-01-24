import ccxt from 'ccxt';
import axios from 'axios';

const Ccxt = {
    getExchangeData: async function(exchange, symbol, timeframe, since, limit, params) {
        let selectedExchange = new ccxt[exchange]();
        const selectedDate = new Date(parseInt(since, 10));
        let sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        if (selectedExchange.hasFetchOHLCV) {

            await selectedExchange.loadMarkets();

            await sleep(exchange.rateLimit) // milliseconds

            return await selectedExchange.fetchOHLCV(symbol, timeframe, selectedDate, limit); // one minute
        }else{
            return null;
        }
    },
    getExchanges: async function() {
        return ccxt.exchanges;
    },
    getExchangeInfo: async function(exchange) {
        let selectedExchange = new ccxt[exchange]();
        console.log(selectedExchange);
        let sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
       
        let markets = await selectedExchange.load_markets();

        if (selectedExchange.hasFetchOHLCV) {
            await sleep(exchange.rateLimit) // milliseconds
            const availableTimeframes = Object.keys(selectedExchange.timeframes);
            const exchangeInfo = { symbols: selectedExchange.symbols, timeframes: availableTimeframes };
            return exchangeInfo;
        } else {
            return null;
        }
    },
    getMarkets: async function(exchange) {
        const markets = await axios.get('https://bittrex.com/api/v1.1/public/getmarkets');
        console.log(markets);
        return markets;
    }
};

export default Ccxt;