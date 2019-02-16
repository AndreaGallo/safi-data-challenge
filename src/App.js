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

const config = {
  activePowerMaxValue: 99.997,
  activePowerMinValue: 0.10525999999999999,
  timeBetweenRecords: 3000,
  metricidToFilter: "PSUM_KW",
  states: {
    off: "off",
    loaded: "loaded",
    unloaded: "unloaded",
    idle: "idle"
  }
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loadError: false,
      data: [],
      startDate: null,
      endDate: null
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
    // csv(csvFilePath, (error, data) => {

    //   if (error) {
    //     this.setState({loadError: true});
    //   }
    //   if(data && data.length) {
    //     // agregar filter para q funcione en IE
    //     var filterData = data.filter( d => d.metricid.toUpperCase() ===  config.metricidToFilter ); 
    //     console.log('filterdata',filterData);

    //     var dataFilter = filterData.map(d => ({...d, x: Number(d.timestamp) , y: Number(d.recvalue)}));

    //     this.setState({
    //       data: dataFilter,
    //       startDate: dataFilter[0].x,
    //       endDate: dataFilter[dataFilter.length - 1].x
    //     });

    //   }
    // });
    
    var bufferStatesInfo = [];
    var bufferAxesData = [];

    Papa.parse(csvFilePath, {
      download: true,
      header: true,
      chunk: partialResult => {

        if (partialResult.data.length) {
          var filterData =  partialResult.data.filter( d => d.metricid && d.metricid.toUpperCase() ===  config.metricidToFilter); 
          bufferStatesInfo = [...bufferStatesInfo, ...this.processData(filterData)];
          var axesArray = filterData.map(d => ({...d, x: Number(d.timestamp) , y: Number(d.recvalue)}))
          bufferAxesData = [...bufferAxesData, ...axesArray];
          
          
        }
        
      },
      complete: () => {
        //push off 
        this.loadData(bufferAxesData);
        console.log("All done!");
        console.log(bufferStatesInfo);
        console.log(bufferAxesData);
      }
    })
  }

  processData = (data) => {
    var resultData = [];
    var prevTime = data[0].timestamp;
    var {states} = config;

    _.each(data, (record) => {
      var result = {
        from: prevTime,
        to: record.timestamp,
        time: record.timestamp - prevTime
      };
      if (record.timestamp - prevTime > 30000) {
        result.state = states.off;
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
    const {activePowerMaxValue, activePowerMinValue, states} = config;
    const unloadedMaxValue = activePowerMinValue;
    const loadedMinValue = 0.2 * activePowerMaxValue;

    if (activePower === 0) return states.off;
    if (activePower > 0 && activePower <= unloadedMaxValue) return states.unloaded;
    if (activePower > unloadedMaxValue && activePower < loadedMinValue) return states.idle;
    if (activePower >= loadedMinValue) return states.loaded;
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
{/* <DatePicker
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
      */}
      <FlexibleWidthXYPlot
      xType="time"
      height={700}
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
