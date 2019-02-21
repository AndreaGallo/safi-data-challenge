import React from 'react';
import {FlexibleWidthXYPlot, XAxis, YAxis, HorizontalGridLines, Crosshair, LineSeries} from 'react-vis';

export default class LineChart extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        crosshairValues: []
      };
    }
    
    /**
     * Event handler for onMouseLeave.
     * @private
     */
    _onMouseLeave = () => {
        this.setState({crosshairValues: []});
    };

    /**
     * Event handler for onNearestX.
     * @param {Object} value Selected value.
     * @param {index} index Index of the value in the data array.
     * @private
     */
    _onNearestX = (value, {index}) => {
        this.setState({crosshairValues: this.props.data.map(d => d[index])});
    };

    render() {
        const {startDate, endDate, data} = this.props;
        return (
            <FlexibleWidthXYPlot
                onMouseLeave={this._onMouseLeave}
                xType="time"
                height={300}
                xDomain={[startDate, endDate]}
                >
                <HorizontalGridLines />
                <XAxis position="middle" title="Date Axis" />
                <YAxis position="middle" title="Active power Axis" />
                <LineSeries
                    opacity={0.5}
                    onNearestX={this._onNearestX}
                    data={data}/>
                <Crosshair
                    values={this.state.crosshairValues}
                />
            </FlexibleWidthXYPlot>
        );
    }
}