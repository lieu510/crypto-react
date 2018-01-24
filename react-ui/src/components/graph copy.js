import React, {Component} from 'react';
import Plottable from 'plottable';
import * as d3 from "d3";

export default class Graph extends Component {
    constructor(props) {
        super(props);
        this.financeChart = this.financeChart.bind(this);
    }

    componentDidMount() {
        var openPrice = this.props.data.openPrice.map(item => {
            return { x: new Date(item.x), y: item.y };
        });

        var closingPrice = this.props.data.closingPrice.map(item => {
            return { x: new Date(item.x), y: item.y };
        });
        this.financeChart(openPrice, closingPrice);
    }

    financeChart(data1, data2) {
        var xScale = new Plottable.Scales.Time();
        var xAxis = new Plottable.Axes.Numeric(xScale, "bottom");
        xAxis.formatter(Plottable.Formatters.multiTime());
        var yScale = new Plottable.Scales.Linear();
        var yAxis = new Plottable.Axes.Numeric(yScale, "left");
        var yLabel = new Plottable.Components.AxisLabel(this.props.market, "270");
        var colorScale = new Plottable.Scales.Color();
        colorScale.range(["#e89b17", "#2b90d9"]);

        var series1 = new Plottable.Dataset(data1, { name: "Opening Price" });
        var series2 = new Plottable.Dataset(data2, { name: "Closing Price" });

        var legend = new Plottable.Components.Legend(colorScale);
        // colorScale.domain(["Opening Price", "Closing Price"]);
        legend.xAlignment("center");
        legend.yAlignment("center");

        var plot = new Plottable.Plots.Line();
        plot.x(function(d) {
            return d.x;
        }, xScale).y(function(d) {
            return d.y;
        }, yScale);
        plot.attr("stroke", function(d, i, dataset) {
            return dataset.metadata().name;
        }, colorScale);
        plot.addDataset(series1).addDataset(series2);
        plot.autorangeMode("y");

        var sparklineXScale = new Plottable.Scales.Time();
        var sparklineXAxis = new Plottable.Axes.Time(sparklineXScale, "bottom");
        var sparklineYScale = new Plottable.Scales.Linear();
        var sparkline = new Plottable.Plots.Line();
        sparkline.x(function(d) {
            return d.x;
        }, sparklineXScale).y(function(d) {
            return d.y;
        }, sparklineYScale);
        sparkline.attr("stroke", function(d, i, dataset) {
            return dataset.metadata().name;
        }, colorScale);
        sparkline.addDataset(series1).addDataset(series2);

        var dragBox = new Plottable.Components.XDragBoxLayer();
        dragBox.resizable(true);
        dragBox.onDrag(function(bounds) {
            var min = sparklineXScale.invert(bounds.topLeft.x);
            var max = sparklineXScale.invert(bounds.bottomRight.x);
            xScale.domain([min, max]);
        });
        dragBox.onDragEnd(function(bounds) {
            if (bounds.topLeft.x === bounds.bottomRight.x) {
                xScale.domain(sparklineXScale.domain());
            }
        });
        xScale.onUpdate(function() {
            dragBox.boxVisible(true);
            var xDomain = xScale.domain();
            dragBox.bounds({
                topLeft: { x: sparklineXScale.scale(xDomain[0]), y: null },
                bottomRight: { x: sparklineXScale.scale(xDomain[1]), y: null }
            });
        });
        var miniChart = new Plottable.Components.Group([sparkline, dragBox]);

        var pzi = new Plottable.Interactions.PanZoom(xScale, null);
        pzi.attachTo(plot);

        var output = d3.select("#hoverFeedback");
        var outputDefaultText = "Closest:";
        output.text(outputDefaultText);

        // let renderChart = d3.select(this.renderChart);
        // let renderChart = null;
        var chart = new Plottable.Components.Table([
            [yLabel, yAxis, plot],
            [null, null, xAxis],
            [null, null, miniChart],
            [null, null, sparklineXAxis],
            [null, null, legend],
        ]);
        chart.rowWeight(2, 0.2);
        chart.renderTo(this.renderChart);

        // var crosshair = this.createCrosshair(plot);
        // var pointer = new Plottable.Interactions.Pointer();
        // pointer.onPointerMove(function(p) {
        //     var nearestEntity = plot.entityNearest(p);
        //     if (nearestEntity.datum == null) {
        //         return;
        //     }
        //     crosshair.drawAt(nearestEntity.position);
        //     var datum = nearestEntity.datum;
        //     output.text("Closest: (" + datum.x.toLocaleString() + ", " + datum.y.toFixed(2) + ")");
        // });
        // pointer.onPointerExit(function() {
        //     crosshair.hide();
        //     output.text(outputDefaultText);
        // });
        // pointer.attachTo(plot);
    }

    makeSeriesData(n, startDate) {
        startDate = startDate || new Date();
        var startYear = startDate.getUTCFullYear();
        var startMonth = startDate.getUTCMonth();
        var startDay = startDate.getUTCDate();
        var toReturn = new Array(n);
        for (var i = 0; i < n; i++) {
            toReturn[i] = {
                x: new Date(Date.UTC(startYear, startMonth, startDay + i)),
                y: i > 0 ? toReturn[i - 1].y + Math.random() * 2 - 1 : Math.random() * 5
            };
        };
        return toReturn;
    }

    createCrosshair(plot) {
        var crosshair = {};
        var crosshairContainer = plot.foreground().append("g").style("visibility", "hidden");
        crosshair.vLine = crosshairContainer.append("line").attr("stroke", "black").attr("y1", 0).attr("y2", plot.height());
        crosshair.circle = crosshairContainer.append("circle").attr("stroke", "black").attr("fill", "white").attr("r", 3);
        crosshair.drawAt = function(p) {
            crosshair.vLine.attr({
                x1: p.x,
                x2: p.x
            });
            crosshair.circle.attr({
                cx: p.x,
                cy: p.y
            });
            crosshairContainer.style("visibility", "visible");
        };
        crosshair.hide = function() {
            crosshairContainer.style("visibility", "hidden");
        };
        return crosshair;
    }

    render() {
        return (
            <div ref={(div) => { this.renderChart = div; }}></div>
        )
    }
}
