import React, {Component} from 'react';
import axios from 'axios';
import Dropdown from '../components/dropdown';
// import Graph from '../components/graph';
// import {CandlestickChart} from 'react-d3';
import { ChartCanvas, Chart } from "react-stockcharts";
import { CandlestickSeries } from "react-stockcharts/lib/series";
import { XAxis, YAxis } from "react-stockcharts/lib/axes";
import { fitWidth } from "react-stockcharts/lib/helper";
import { last, timeIntervalBarWidth } from "react-stockcharts/lib/utils";
import { scaleTime } from "d3-scale";
import { utcDay } from "d3-time";
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
        const date = moment().subtract(5, 'days').unix();
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
                <ChartCanvas height={400}
                        // ratio={ratio}
                        width={600}
                        margin={{ left: 50, right: 50, top: 10, bottom: 30 }}
                        // type={type}
                        seriesName="MSFT"
                        data={this.state.graphData}
                        xAccessor={d => d.date}
                        xScale={scaleTime()}
                        // xExtents={xExtents}
                        >

                    <Chart id={1} yExtents={d => [d.high, d.low]}>
                        <XAxis axisAt="bottom" orient="bottom" ticks={6}/>
                        <YAxis axisAt="left" orient="left" ticks={5} />
                        <CandlestickSeries />
                    </Chart>
                </ChartCanvas>
            </div>
        )
    }
}