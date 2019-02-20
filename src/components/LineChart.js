import React from 'react';
import {FlexibleWidthXYPlot, XAxis, YAxis, HorizontalGridLines, VerticalGridLines, LineSeries} from 'react-vis';

const LineChart = props => {
    const {startDate, endDate, data} = props;

    return (
        <FlexibleWidthXYPlot
            xType="time"
            height={300}
            xDomain={[startDate, endDate]}
            >
            <HorizontalGridLines />
            <VerticalGridLines />
            <XAxis title="Date Axis" />
            <YAxis title="Active power Axis" />
            <LineSeries
                data={data}/>
        </FlexibleWidthXYPlot>
    );
}

export default LineChart;