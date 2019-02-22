import React from 'react';
import {FlexibleWidthXYPlot, XAxis, YAxis, HorizontalGridLines, VerticalGridLines, VerticalBarSeries, Hint} from 'react-vis';

class BarChart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: null
    };
  }

  onValueMouseOut = (event) => {
    this.setState({value: null})
  }

  onValueMouseOver  = (value, event) => {
      this.setState({value})
  };

  getTimeStr = (time) => {
    let date = new Date(null);
    date.setSeconds(time / 1000);
    return date.toISOString().substr(11, 8);
  }

  render() {
    const {data} = this.props;
    return (
      <div>
        <FlexibleWidthXYPlot xType="ordinal" height={300} xDistance={100}>
          <VerticalGridLines />
          <HorizontalGridLines />
          <XAxis />
          <YAxis 
              title="Time %" 
              style={{ title: {fontWeight: 600, fontSize: '16px'}}}
          />
          <VerticalBarSeries
            opacity={0.5} 
            onValueMouseOut={this.onValueMouseOut}
            onValueMouseOver={this.onValueMouseOver} 
            data={data} />
          {this.state.value && 
            <Hint value={this.state.value}
                  align={{horizontal: Hint.ALIGN.AUTO, vertical: Hint.ALIGN.TOP_EDGE}}>
              <div className="hint-content">
                <h5>Time</h5>
                <p>{Number(this.state.value.y).toFixed(2) + '%'}</p>
                <p>{this.getTimeStr(this.state.value.time)}</p>
              </div>
            </Hint>}
        </FlexibleWidthXYPlot>
        <p className="info">Mouse over bar to see time information</p>
      </div>
        
    )
  }
}

export default BarChart;