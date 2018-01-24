import React, {Component} from 'react';
import axios from 'axios';
import moment from 'moment';
import Dropdown from '../components/dropdown';
import Chart from '../components/chart';
import { TypeChooser } from "react-stockcharts/lib/helper";
// import {CandlestickChart} from 'react-d3';

const exchanges = ["bittrex", "binance"];
// let markets = [];

export default class ExchangeContainer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            exchange: 'bittrex',
            markets: [],
            market: 'BTC/USDT',
            timeframes: [],
            timeframe: '1h',
            data: [],
        };
    
        this.handleExchangeChange = this.handleExchangeChange.bind(this);
        this.handleMarketChange = this.handleMarketChange.bind(this);
        this.handleTimeframeChange = this.handleTimeframeChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount() {
        const date = moment().subtract(5, 'days').unix();
        axios.get(`/api/ccxt/${this.state.exchange}/${this.state.market}/${this.state.timeframe}/${date}000/400`).then(data => {
			this.setState({ data })
		})
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
            const graphData = getData.data.closingPrice;
            // const priceDataArr = priceData.map((data) => data.y);
            // const timeDataArr = priceData.map((data) => data.x);
            // const graphData = {
            //     name: this.state.market,
            //     values: priceData,
            // }
            console.log(graphData);
            this.setState({data: graphData});
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
        if (this.state.data == null) {
			return <div>Loading...</div>
		}
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
                <TypeChooser>
                    {type => <Chart type={type} data={this.state.data} />}
                </TypeChooser>
            </div>
        )
    }
}