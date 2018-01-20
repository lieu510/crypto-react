import React, {Component} from 'react';
import axios from 'axios';
import Dropdown from '../components/dropdown';
// import Graph from '../components/graph';
import {CandlestickChart} from 'react-d3';
import moment from 'moment';

const exchanges = ["bittrex", "binance"];
// let markets = [];

export default class ExchangeContainer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            exchange: 'bittrex',
            markets: [],
            market: '',
            timeframes: [],
            timeframe: '',
            graphData: {
                name: '',
                values: [{
                    x: moment(),
                    open: 0,
                    high: 0,
                    low: 0,
                    close: 0,
                }],
            },
        };
    
        this.handleExchangeChange = this.handleExchangeChange.bind(this);
        this.handleMarketChange = this.handleMarketChange.bind(this);
        this.handleTimeframeChange = this.handleTimeframeChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount() {
        this.loadMarkets(this.state.exchange);
    }
    
    handleExchangeChange(event) {
        this.setState({exchange: event.target.value});
        this.loadMarkets(event.target.value);
    }

    handleMarketChange(event) {
        this.setState({market: event.target.value});
    }

    handleTimeframeChange(event) {
        this.setState({timeframe: event.target.value});
    }

    async handleSubmit(event) {
        event.preventDefault();
        const exchange = this.state.exchange;
        const market = this.state.market.replace('/', '%2F');
        const timeframe = this.state.timeframe;
        const date = moment().subtract(30, 'days').unix();
        const limit = '400';
        try {
            const getData = await axios.get(`/api/ccxt/${exchange}/${market}/${timeframe}/${date}000/${limit}`);
            const priceData = getData.data.closingPrice;
            // const priceDataArr = priceData.map((data) => data.y);
            // const timeDataArr = priceData.map((data) => data.x);
            const graphData = {
                name: this.state.market,
                values: priceData,
            }
            console.log(graphData);
            this.setState({graphData});
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    async loadMarkets(exchange) {
        // const exchangeInfo = Ccxt.getExchangeInfo(exchange);
        try {
            const exchangeInfo = await axios.get(`/api/ccxt-info/${exchange}`);
            const markets = exchangeInfo.data.info
            this.setState({
                markets: markets.symbols,
                market: markets.symbols[0],
                timeframes: markets.timeframes,
                timeframe: markets.timeframes[0],
            });
            console.log(markets);
            return markets;
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    render() {
        return (
            <div>
                <form onSubmit={this.handleSubmit}>
                    <label>Exchange:</label>
                    <Dropdown 
                        list={exchanges} 
                        handleChange={this.handleExchangeChange}
                        value={this.state.exchange}
                    />
                    <label>Market:</label>
                    <Dropdown 
                        list={this.state.markets} 
                        handleChange={this.handleMarketChange}
                        value={this.state.market}
                    />
                    <label>Timeframe:</label>
                    <Dropdown 
                        list={this.state.timeframes} 
                        handleChange={this.handleTimeframeChange}
                        value={this.state.timeframe}
                    />
                    <input type='submit' value='Submit' />
                </form>
                <CandlestickChart
                    data={this.state.graphData}
                    width={800}
                    height={400}
                    xAxisTickInterval={{unit: 'month', interval: 1}}
                    yAxisOffset={-10}
                    title={this.state.market}
                />
            </div>
        )
    }
}