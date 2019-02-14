import React, { Component } from 'react';
import {csv} from 'd3-request';
import Papa from 'papaparse';
import csvFilePath from "./data/demoCompressorWeekData.csv"
import './App.css';
import '../node_modules/react-vis/dist/style.css';
import "react-datepicker/dist/react-datepicker.css";
import _ from 'lodash';
import DatePicker from 'react-datepicker';
import {FlexibleWidthXYPlot , XAxis, YAxis, HorizontalGridLines, VerticalGridLines, LineSeries} from 'react-vis';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loadError: false,
      data: null,
      startDate: null,
      endDate: null, 
      compressorStates: {
        // offstate no data at all, days that left to complete the week
        unloadedMaxValue: null, // minValue
        loadedMinValue: null, // 20% max value
        loadedMaxValue: null
      }
    };
    this.loadData = this.loadData.bind(this);
    this.handleChangeStart = this.handleChangeStart.bind(this);
    this.handleChangeEnd = this.handleChangeEnd.bind(this);
    this.getCompressorState = this.getCompressorState.bind(this);
    this.processData = this.processData.bind(this);
  }

  loadData = (data) => {
    this.setState({data});
  }

  componentWillMount() {
    csv(csvFilePath, (error, data) => {

      if (error) {
        this.setState({loadError: true});
      }
      if(data && data.length) {
        // agregar filter para q funcione en IE
        var filterData = data.filter( d => d.metricid.toUpperCase() ===  'PSUM_KW' ); 
        console.log('filterdata',filterData);

        var maximumRecValue = _.maxBy(filterData, function(o) { return o.recvalue; });
        var minimumRecValue = _.minBy(filterData, function(o) { return o.recvalue; });
        var dataFilter = filterData.map(d => ({...d, x: Number(d.timestamp) , y: Number(d.recvalue)}));

        this.setState({
          data: dataFilter,
          startDate: dataFilter[0].x,
          endDate: dataFilter[dataFilter.length - 1].x,
          compressorStates: {
            unloadedMaxValue: Number(minimumRecValue.recvalue),
            loadedMinValue: 0.2 * maximumRecValue.recvalue,
            loadedMaxValue: Number(maximumRecValue.recvalue)
          }
        });

      }
    });
    
    var bufferStatesInfo = [];
    var bufferAxesData = [];
    Papa.LocalChunkSize = 1;
    Papa.parse(csvFilePath, {
      download: true,
      header: true,
      chunk: partialResult => {
        var filterData;
        if (partialResult.data.length) {
          filterData =  partialResult.data.filter( d => d.metricid && d.metricid.toUpperCase() ===  'PSUM_KW'); 
        }
        bufferStatesInfo = [...bufferStatesInfo, ...this.processData(filterData)];
        var axesArray = filterData.map(d => ({...d, x: Number(d.timestamp) , y: Number(d.recvalue)}))
        bufferAxesData = [...bufferAxesData, ...axesArray];
      },
      complete: function() {
        //push off states
        console.log("All done!");
        console.log(bufferStatesInfo);
        console.log(bufferAxesData);
      }
    })
  }

  processData = (data) => {
    var resultData = [];
    var prevTime = data[0].timestamp;

    _.each(data, (record) => {
      var result = {
        from: prevTime,
        to: record.timestamp,
        time: record.timestamp - prevTime
      };
      if (record.timestamp - prevTime > 30000) {
        result.state = 'off';
      } else {
        result.state =  this.getCompressorState(record.recvalue);
      }
      resultData = [...resultData, result];
      prevTime = record.timestamp;
    });
    return resultData;
}

  handleChangeStart = (startDate) => {
    this.setState({
      startDate: new Date(startDate).getTime()
    });
  }

  handleChangeEnd = (endDate) => {
    this.setState({
      endDate: new Date(endDate).getTime()
    });
  }

  /**
   * Returns the state of the machine based on the current active power value
   * @param activePower numeric: value from 'Psum_kw' key
   */
  getCompressorState = (activePower) => {
    const {unloadedMaxValue, loadedMinValue} = this.state.compressorStates;
    if (activePower === 0) return 'off';
    if (activePower > 0 && activePower <= unloadedMaxValue) return 'unloaded';
    if (activePower > unloadedMaxValue && activePower < loadedMinValue) return 'idle';
    if (activePower >= loadedMinValue) return 'loaded';
  }
  
  render() {
    const startDatePicker = new Date(this.state.startDate);
    const endDatePicker =  new Date(this.state.endDate);
    if (this.state.loadError) {
      return <div>couldn't load file</div>;
    }
    if (!this.state.data) {
      return <div />;
    }
    return ( <div>
<DatePicker
      selected={startDatePicker}
      selectsStart
      startDate={startDatePicker}
      endDate={endDatePicker}
      onChange={this.handleChangeStart}
      maxDate={endDatePicker}
      showDisabledMonthNavigation
      showTimeSelect
      timeFormat="HH:mm"
      timeIntervals={15}
      dateFormat="MMMM d, yyyy h:mm aa"
      timeCaption="time"
  />
  
  <DatePicker
      selected={endDatePicker}
      selectsEnd
      startDate={startDatePicker}
      endDate={endDatePicker}
      onChange={this.handleChangeEnd}
      minDate={startDatePicker}
      showDisabledMonthNavigation
      showTimeSelect
      timeFormat="HH:mm"
      timeIntervals={15}
      dateFormat="MMMM d, yyyy h:mm aa"
      timeCaption="time"
  />
  
    <FlexibleWidthXYPlot
      xType="time"
      height={700}
      xDomain={[this.state.startDate, this.state.endDate]}
      >
      <HorizontalGridLines />
      <VerticalGridLines />
      <XAxis title="Date Axis" />
      <YAxis title="Active power Axis" />
      <LineSeries
        data={this.state.data}/>
  </FlexibleWidthXYPlot>
    </div>
      
    );
  }
}

export default App;
