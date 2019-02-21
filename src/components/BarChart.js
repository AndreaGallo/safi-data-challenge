import React from 'react';
import {XYPlot, XAxis, YAxis, HorizontalGridLines, VerticalGridLines, VerticalBarSeries, Hint} from 'react-vis';

class BarChart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: null
    };
  }

  onSeriesMouseOut = (event) => {
    this.setState({value: null})
  }

  onNearestX  = (value, event) => {
      console.log('value',value)
      this.setState({value})
  };

  render() {
    const {data} = this.props;
    return (
        <XYPlot xType="ordinal" width={300} height={300} xDistance={100}>
          <VerticalGridLines />
          <HorizontalGridLines />
          <XAxis />
          <YAxis />
          <VerticalBarSeries 
            onSeriesMouseOut={this.onSeriesMouseOut}
            onNearestX={this.onNearestX} 
            data={data} />
          {this.state.value && 
            <Hint value={this.state.value}>
              <div style={{background: 'black'}}>
                <h3>Value of hint</h3>
                <p>{this.state.value.x}</p>
              </div>
            </Hint>}
        </XYPlot>
    )
  }
}

export default BarChart;