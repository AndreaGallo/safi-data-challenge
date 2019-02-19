import React, { Component } from 'react';
import Papa from 'papaparse';
import csvFilePath from "./data/demoCompressorWeekData.csv"
import './App.css';
import '../node_modules/react-vis/dist/style.css';
import "react-datepicker/dist/react-datepicker.css";
import _ from 'lodash';
import DatePicker from 'react-datepicker';
import {FlexibleWidthXYPlot , XYPlot, XAxis, YAxis, HorizontalGridLines, VerticalGridLines, VerticalBarSeries,LineSeries} from 'react-vis';

//TODO: PUSH OFF STATES Y CONTROLAR LAS FECHAS POR SI SON MAYOR O MENOR A LOS D LOS DATOS
const config = {
  activePowerMaxValue: 104.92483,
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
      loading: true,
      activePowerData: [],
      compressorStatesData: [],
      timePerState: [],
      startDate: null,
      endDate: null
    };
    this.loadChartsData = this.loadChartsData.bind(this);
    this.handleChangeStart = this.handleChangeStart.bind(this);
    this.handleChangeEnd = this.handleChangeEnd.bind(this);
    this.getCompressorState = this.getCompressorState.bind(this);
    this.processData = this.processData.bind(this);
  }

  loadChartsData = ({activePowerData, compressorStatesData}) => {
    this.setState({
      activePowerData,
      compressorStatesData,
      loading: false
    });
  }

  loadDomain = (startDate, endDate) => {
    this.setState({ startDate, endDate });
  }

  componentWillMount() {    
    var bufferStatesInfo = [];
    var bufferActivePower = [];

    Papa.parse(csvFilePath, {
      download: true,
      header: true,
      chunk: partialResult => {

        if (partialResult.data.length) {
          // agregar filter para q funcione en IE
          var filterData =  partialResult.data.filter( d => d.metricid && d.metricid.toUpperCase() ===  config.metricidToFilter); 
          var dataProcessed = this.processData(filterData);
          bufferStatesInfo = [...bufferStatesInfo, dataProcessed.compressorStatesData];
          bufferActivePower = [...bufferActivePower, dataProcessed.activePowerData];
        }
        
      },
      complete: () => {
        //push off
        let chartsData = {
          activePowerData: [].concat.apply([], bufferActivePower),
          compressorStatesData: [].concat.apply([], bufferStatesInfo)
        };

        let firstActivePowerChunk = bufferActivePower[0]
        let startDate = firstActivePowerChunk[0].x;
        let endDate = firstActivePowerChunk[firstActivePowerChunk.length - 1].x;
        let totalTime = endDate - startDate;

        this.loadDomain(startDate, endDate);
        this.setTimeSpendPerState(this.getTimeSpendPerState(bufferStatesInfo[0], totalTime))
        this.loadChartsData(chartsData);
        console.log("All done!");
        console.log(bufferStatesInfo);
        console.log(bufferActivePower);
      }
    })
  }

  setTimeSpendPerState = (timePerState) => {
    this.setState({
      timePerState
    });
  }

  getTimeSpendPerState = (statesInfo, totalTime) => {
    var idleStates = _.filter(statesInfo, d => d.state === 'idle' );
    var unloadedStates = _.filter(statesInfo, d => d.state === 'unloaded');
    var loadedStates = _.filter(statesInfo, d => d.state === 'loaded');
    var offStates = _.filter(statesInfo, d => d.state === 'off');

    return  [{
      x: 'off',
      y: _.sumBy(offStates, 'time') / totalTime
    },{
      x: 'loaded',
      y: _.sumBy(loadedStates, 'time') / totalTime
    },{
      x: 'unloaded',
      y: _.sumBy(unloadedStates, 'time') / totalTime
    },{
      x: 'idle',
      y: _.sumBy(idleStates, 'time') / totalTime
    }];    
  }

  processData = (data) => {
    var compressorStatesData = [];
    var activePowerData = [];
    var prevTime = data[0].timestamp;

    _.each(data, (record) => {
      var stateInfo = {
        from: prevTime,
        to: record.timestamp,
        time: record.timestamp - prevTime
      };

      var axes = {
        x: Number(record.timestamp), 
        y: Number(record.recvalue)
      };

      if (stateInfo.time > 30000) {
        stateInfo.state = 'off';
      } else if (stateInfo.time > 0){
        stateInfo.state =  this.getCompressorState(record.recvalue);
      }

      compressorStatesData = [...compressorStatesData, stateInfo];
      activePowerData = [...activePowerData, axes];

      prevTime = record.timestamp;
    });

    return {compressorStatesData, activePowerData};
}

  handleChangeStart = (startDate) => {
    this.setState((prevState) => {
      const { compressorStatesData, endDate } = prevState;
      const slicedCompressorStatesData = _.filter(compressorStatesData, d => d.from >= startDate && d.to <= endDate);
      const timePerState = this.getTimeSpendPerState(slicedCompressorStatesData, endDate - startDate);

      return {
        startDate: new Date(startDate).getTime(),
        timePerState
      }
    });
  }

  handleChangeEnd = (endDate) => {
    this.setState((prevState) => {
      const { compressorStatesData, startDate } = prevState;
      const slicedCompressorStatesData = _.filter(compressorStatesData, d => d.from >= startDate && d.to <= endDate);
      console.log('slicedCompressorStatesData',slicedCompressorStatesData);
      const timePerState = this.getTimeSpendPerState(slicedCompressorStatesData, endDate - startDate);

      return {
        endDate: new Date(endDate).getTime(),
        timePerState
      }
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

    if (activePower >= 0 && activePower <= unloadedMaxValue) return states.unloaded;
    if (activePower > unloadedMaxValue && activePower < loadedMinValue) return states.idle;
    if (activePower >= loadedMinValue) return states.loaded;
  }
  
  render() {
    const startDatePicker = new Date(this.state.startDate);
    const endDatePicker =  new Date(this.state.endDate);

    if (this.state.loadError) {
      return <div>couldn't load file</div>;
    }

    if (this.state.loading) {
      return <div>loading</div>;
    }
    if (!this.state.activePowerData) {
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
      startDate={new Date(startDatePicker.setDate(startDatePicker.getDate() + 1))}
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

<XYPlot xType="ordinal" width={300} height={300} xDistance={100}>
          <VerticalGridLines />
          <HorizontalGridLines />
          <XAxis />
          <YAxis />
          <VerticalBarSeries data={this.state.timePerState} />
</XYPlot>

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
        data={this.state.activePowerData}/>
  </FlexibleWidthXYPlot>

  
    </div>
      
    );
  }
}

export default App;
