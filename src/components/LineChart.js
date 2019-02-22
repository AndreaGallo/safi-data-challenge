import React from 'react';
import {FlexibleWidthXYPlot, XAxis, YAxis, HorizontalGridLines, LineSeries} from 'react-vis';

const LineChart = props => {
    const {startDate, endDate, data} = props;
    return (
        <FlexibleWidthXYPlot
            xType="time"
            height={300}
            xDomain={[startDate, endDate]}
            >
            <HorizontalGridLines />
            <XAxis 
                position="middle" 
                title="Date Axis"
                style={{ title: {fontWeight: 600, fontSize: '16px'}}}
            />
            <YAxis 
                position="middle" 
                title="Active power Axis" 
                style={{ title: {fontWeight: 600, fontSize: '16px'}}}
            />
            <LineSeries
                opacity={0.5}
                data={data}/>
        </FlexibleWidthXYPlot>
    );
}

export default LineChart;