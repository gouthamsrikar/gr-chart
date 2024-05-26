"use client"
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { generateTradingData, generateNewDataPoint, DataPoint } from '../app/utils/mock';

import ReactDOMServer from 'react-dom/server';



const LineChart: React.FC = () => {
    const svgRef = useRef<SVGSVGElement | null>(null);
    const [data, setData] = useState<DataPoint[]>(generateTradingData());

    const chartColor = "#d5b063"
    const greenColor = "#14b486"
    const redColor = "#B74545"

    useEffect(() => {
        const svg = d3.select(svgRef.current);
        const width = 800;
        const height = 400;
        const margin = { top: 20, right: 50, bottom: 30, left: 50 };

        svg.attr('viewBox', `0 0 ${width} ${height}`);
        svg.selectAll('*').remove();

        const x = d3.scaleTime().range([margin.left, width - margin.right]);
        const y = d3.scaleLinear().range([height - margin.bottom, margin.top]);

        const area = d3.area<DataPoint>()
            .x((d) => x(d.time))
            .y0(y(0))
            .y1((d) => y(d.value));

        const linepath = d3.area<DataPoint>()
            .x((d) => x(d.time))
            .y0((d) => y(d.value))
            .y1((d) => y(d.value));

        const xAxis = (g: d3.Selection<SVGGElement, unknown, null, undefined>) =>
            g.attr('transform', `translate(0,${height - margin.bottom})`)
                .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0))
                .call(g => g.select('.domain').attr('stroke', 'grey'))  // Update x axis line color
                .call(g => g.selectAll('.tick line').attr('stroke', 'none'))  // Update tick line color
                .call(g => g.selectAll('.tick text').attr('fill', 'grey'));  // Update tick text color


        const yAxis = (g: d3.Selection<SVGGElement, unknown, null, undefined>) =>
            g.attr('transform', `translate(${width - margin.right},0)`).call(d3.axisRight(y))
                .call(g => g.selectAll('.tick text').attr('fill', 'grey'))
                .call(g => g.select('.domain').attr('stroke', 'grey'))
                .call(g => g.selectAll('.tick line').attr('stroke', 'none'))
                .call(g => g.select('.tick:first-of-type line').attr('stroke', 'none'))
                .call(g => g.select('.tick:last-of-type line').attr('stroke', 'none'));

        const gradient = svg.append('defs')
            .append('linearGradient')
            .attr('id', 'area-gradient')
            .attr('gradientUnits', 'userSpaceOnUse')
            .attr('x1', 0)
            .attr('y1', y(0))
            .attr('x2', 0)
            .attr('y2', y(1));

        gradient.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', '#00000000')
            .attr('stop-opacity', 0.6);
        gradient.append('stop')
            .attr('offset', '50%')
            .attr('stop-color', chartColor + "80")
            .attr('stop-opacity', 0.6);
        gradient.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', chartColor)
            .attr('stop-opacity', 0.6);

        svg.append('path')
            .datum(data)
            .attr('fill', 'url(#area-gradient)')
            .attr('class', 'area');

        const defs = svg.append('defs');
        const filter = defs.append('filter')
            .attr('id', 'glow');

        filter.append('feGaussianBlur')
            .attr('stdDeviation', '4.5')
            .attr('result', 'coloredBlur');

        const feMerge = filter.append('feMerge');
        feMerge.append('feMergeNode')
            .attr('in', 'coloredBlur');
        feMerge.append('feMergeNode')
            .attr('in', 'SourceGraphic');

        svg.append('path')
            .datum(data)
            .attr('stroke', chartColor)
            .attr('stroke-width', '2px')
            .attr('class', 'linepath')
            .attr('filter', 'url(#glow)');

        svg.append('g').attr('class', 'x-axis');
        svg.append('g').attr('class', 'y-axis');

        const updateChart = (newData: DataPoint[]) => {
            const xDomain = d3.extent(newData, (d) => d.time) as [Date, Date];
            const xPadding = (xDomain[1].getTime() - xDomain[0].getTime()) * 0.2; // 5% padding to the right
            x.domain([xDomain[0], new Date(xDomain[1].getTime() + xPadding)]);
            y.domain([d3.min(newData, (d) => d.value) as number, d3.max(newData, (d) => d.value) as number]).nice();

            svg.select<SVGPathElement>('.area').datum(newData).attr('d', area);
            svg.select<SVGPathElement>('.linepath').datum(newData).attr('d', linepath);
            svg.select<SVGGElement>('.x-axis').call(xAxis);
            svg.select<SVGGElement>('.y-axis').call(yAxis);

            const latestValue = newData[newData.length - 1].value;
            const latestTime = newData[newData.length - 1].time;

            const isUp = latestValue >= newData[newData.length - 2].value

            svg.selectAll('.latest-price').remove();
            svg.append('line')
                .attr('class', 'latest-price')
                .attr('x1', margin.left)
                .attr('x2', width - margin.right)
                .attr('y1', y(latestValue))
                .attr('y2', y(latestValue))
                .attr('stroke', isUp ? greenColor : redColor)


            const mainPoint = svg.select<SVGCircleElement>('.main-point');
            if (!mainPoint.empty()) {
                mainPoint.remove();
            }

            svg.append('circle')
                .attr('class', 'main-point')
                .attr('cx', x(latestTime))
                .attr('cy', y(latestValue))
                .attr('r', 5)
                .attr('stroke', chartColor);

            const arrowDirection = latestValue >= newData[newData.length - 2].value ? 'up' : 'down';
            const arrowColor = arrowDirection === 'up' ? 'green' : 'red';
            const arrowPath = arrowDirection === 'up' ? 'M -6 3 L 0 -3 L 6 3' : 'M -6 -3 L 0 3 L 6 -3';

            // Remove any existing arrow and background
            svg.selectAll('.arrow').remove();
            svg.selectAll('.arrow-background').remove();
            const circleRadius = 15; // Define the radius of the circle

            // Calculate the center coordinates of the circle
            const circleCenterX = x(latestTime) + 20;
            const circleCenterY = y(latestValue) + (isUp ? - 20 : +20);

            // Append a circle for the background
            svg.append('circle')
                .attr('class', 'arrow-background')
                .attr('cx', circleCenterX)
                .attr('cy', circleCenterY)
                .attr('r', circleRadius)
                .attr('fill', (isUp ? greenColor : redColor) + "80")
                .attr('opacity', 0.5);

            // Calculate the position for the arrow path
            const arrowX = circleCenterX;
            const arrowY = circleCenterY;

            // Append the arrow path
            svg.append('path')
                .attr('class', 'arrow')
                .attr('d', arrowPath)
                .attr('fill', arrowColor)
                .attr('transform', `translate(${arrowX}, ${arrowY})`);


            // const ArrowDirection = latestValue >= newData[newData.length - 2].value ? <Up /> : <Down />;
            // svg.selectAll('.arrow').remove();
            // d3.select(svg.node())
            //     .append('foreignObject')
            //     // .attr('x', x(latestTime) + 20)
            //     // .attr('y', y(latestValue) - 20)
            //     .html(`${ReactDOMServer.renderToString(<UpArrow />)}`)
            //     .attr('class', 'arrow')
            //     .attr('transform', `translate(${x(latestTime) + 20}, ${y(latestValue) - 20})`);

            svg.selectAll('.latest-gradient').remove();
            svg.selectAll('linearGradient#latest-gradient').remove();
            svg.append('defs')
                .append('linearGradient')
                .attr('id', 'latest-gradient')
                .attr('gradientTransform', 'rotate(45)'); // Rotate the gradient
            svg.select('linearGradient#latest-gradient')
                .selectAll('stop')
                .data([{ offset: '0%', color: '#00000000', }, { offset: '80%', color: isUp ? `${greenColor}20` : `${redColor}20` }, { offset: '100%', color: isUp ? `${greenColor}20` : `${redColor}20` },])
                .enter()
                .append('stop')
                .attr('offset', (d) => d.offset)
                .attr('stop-color', (d) => d.color);

            svg.append('rect')
                .attr('class', 'latest-gradient')
                .attr('x', margin.left)
                .attr('y', isUp ? 0 : y(latestValue)) // Adjust the position
                .attr('width', width - margin.right - margin.left)
                .attr('height', isUp ? y(latestValue) : height - y(latestValue) - margin.bottom) // Adjust the height
                .style('fill', 'url(#latest-gradient)');

            let currentPriceIndicator = svg.select('.current-price-indicator');
            currentPriceIndicator.selectAll('*').remove();
            svg.append('g')
                .attr('class', 'current-price-indicator');
            // Remove previous contents and add a yellow container background
            currentPriceIndicator.append('rect')
                .attr('x', width - margin.right)
                .attr('y', y(newData[newData.length - 1].value) - 15)
                .attr('width', 50)
                .attr('height', 30)
                .attr('fill', '#fdd745')
                .attr('rx', 2)
                .attr('ry', 2);

            // Add text for the current price
            currentPriceIndicator.append('text')
                .attr('x', width - margin.right + 5)
                .attr('y', y(newData[newData.length - 1].value) + 5)
                .text(`${newData[newData.length - 1].value.toFixed(2)}`)
                .attr('fill', 'black')
                .attr('font-size', '12px');
        };

        updateChart(data);

        const interval = setInterval(() => {
            const newData = [...data, generateNewDataPoint(data[data.length - 1].value)];
            setData(newData);
            updateChart(newData);
        }, 1000); // Update every minute

        return () => clearInterval(interval);
    }, []);

    return <svg ref={svgRef} height={400} width={800}></svg>;
};

export default LineChart;
