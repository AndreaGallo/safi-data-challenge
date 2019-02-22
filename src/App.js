import React, { Component } from 'react';
import Papa from 'papaparse';
import _ from 'lodash';
import csvFilePath from "./data/demoCompressorWeekData.csv"
import config from './config';
import DateRange from './components/DateRange';
import BarChart from './components/BarChart';
import LineChart from './components/LineChart';
import Loader from './components/Loader';
import Table from './components/Table';

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

  componentWillMount() {    
    var bufferStatesInfo = [];
    var bufferActivePower = [];

    Papa.parse(csvFilePath, {
      download: true,
      header: true,
      chunk: partialResult => {

        if (partialResult.data.length) {
          var filterData =  _.filter(partialResult.data, d => d.metricid && d.metricid.toUpperCase() ===  config.metricId); 

          if (filterData.length)
          {
            let dataProcessed = this.processData(filterData);
            bufferStatesInfo = [...bufferStatesInfo, dataProcessed.compressorStatesData];
            bufferActivePower = [...bufferActivePower, dataProcessed.activePowerData];
          }
          
        }
        
      },
      complete: () => {
        var chartsData = {
          activePowerData: [],
          compressorStatesData: []
        };

        var startDate = null, endDate = null, totalTime;

        if (bufferActivePower.length && bufferStatesInfo.length)
        {
          chartsData.activePowerData = [].concat.apply([], bufferActivePower);
          chartsData.compressorStatesData = [].concat.apply([], bufferStatesInfo);
  
          let firstActivePowerChunk = bufferActivePower[0]
          startDate = firstActivePowerChunk[0].x;
          endDate = firstActivePowerChunk[firstActivePowerChunk.length - 1].x;
          totalTime = endDate - startDate;
          this.setTimeSpendPerState(this.getTimeSpendPerState(bufferStatesInfo[0], totalTime))
          
        }
        this.loadDomain(startDate, endDate);
        this.loadChartsData(chartsData);
      }
    })
  }

  processData = (data) => {
    var compressorStatesData = [];
    var activePowerData = [];
    var prevTime = data[0].timestamp;

    _.each(data, (record) => {
      var stateInfo = {
        from: Number(prevTime),
        to: Number(record.timestamp),
        time: Number(record.timestamp) - Number(prevTime)
      };

      var axes = {
        x: Number(record.timestamp), 
        y: Number(record.recvalue)
      };

      if (stateInfo.time > 30000) {
        stateInfo.state = 'off';
      } else {
        stateInfo.state =  this.getCompressorState(record.recvalue);
      }

      compressorStatesData = [...compressorStatesData, stateInfo];
      activePowerData = [...activePowerData, axes];

      prevTime = record.timestamp;
    });

    return {compressorStatesData, activePowerData};
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

  setTimeSpendPerState = (timePerState) => {
    this.setState({
      timePerState
    });
  }

  getCompressorState = (activePower) => {
    const {activePowerMaxValue, activePowerMinValue} = config;
    const unloadedMaxValue = activePowerMinValue;
    const loadedMinValue = 0.2 * activePowerMaxValue;

    if (activePower >= 0 && activePower <= unloadedMaxValue) return "unloaded";
    if (activePower > unloadedMaxValue && activePower < loadedMinValue) return "idle";
    if (activePower >= loadedMinValue) return "loaded";
  }

  getOffStates = (startDate, endDate) => {
    const { compressorStatesData } = this.state;
    const fromDomain = compressorStatesData[0].from;
    const toDomain = compressorStatesData[compressorStatesData.length - 1].to;
    let offStateArray = [];

    if (startDate < fromDomain && endDate > fromDomain) {
      offStateArray.push({
        from: startDate,
        to: fromDomain,
        time: fromDomain - startDate,
        state: 'off'
      });
    }

    if (startDate < fromDomain && endDate < fromDomain) {
      offStateArray.push({
        from: startDate,
        to: endDate,
        time: endDate - startDate,
        state: 'off'
      });
    }

    if (startDate < toDomain && endDate > toDomain) {
      offStateArray.push({
        from: toDomain,
        to: endDate,
        time: endDate - toDomain,
        state: 'off'
      });
    }

    if (startDate > toDomain && endDate > toDomain) {
      offStateArray.push({
        from: startDate,
        to: endDate,
        time: endDate - startDate,
        state: 'off'
      });
    }

    return offStateArray;
  }

  getTimeSpendPerState = (statesInfo, totalTime) => {
    var idleStates = _.filter(statesInfo, d => d.state === 'idle' );
    var unloadedStates = _.filter(statesInfo, d => d.state === 'unloaded');
    var loadedStates = _.filter(statesInfo, d => d.state === 'loaded');
    var offStates = _.filter(statesInfo, d => d.state === 'off');

    var timeOff =  _.sumBy(offStates, 'time');
    var timeUnloaded = _.sumBy(unloadedStates, 'time');
    var timeIdle = _.sumBy(idleStates, 'time');
    var timeLoaded = _.sumBy(loadedStates, 'time');

    return  [{
      x: 'Off',
      y: (timeOff * 100) / totalTime,
      time: timeOff
    },{
      x: 'Unloaded',
      y: (timeUnloaded * 100) / totalTime,
      time: timeUnloaded
    },{
      x: 'Idle',
      y: (timeIdle * 100) / totalTime,
      time: timeIdle
    },{
      x: 'Loaded',
      y: (timeLoaded * 100)/ totalTime,
      time: timeLoaded
    }];    
  }

  handleChangeEnd = (endDate) => {
    this.setState((prevState) => {
      const { compressorStatesData, startDate } = prevState;
      endDate = new Date(endDate).getTime();

      const slicedCompressorStatesData = _.filter(compressorStatesData, d => d.from >= startDate && d.to <= endDate);
      const offStates = this.getOffStates(startDate, endDate);
      const timePerState = this.getTimeSpendPerState([...offStates, ...slicedCompressorStatesData], endDate - startDate);

      return {
        endDate,
        timePerState
      }
    });
  }

  handleChangeStart = (startDate) => {
    this.setState((prevState) => {
      const { compressorStatesData, endDate } = prevState;
      startDate = new Date(startDate).getTime();
      

      const slicedCompressorStatesData = _.filter(compressorStatesData, d => d.from >= startDate && d.to <= endDate);
      const offStates = this.getOffStates(startDate, endDate);
      const timePerState = this.getTimeSpendPerState([...offStates, ...slicedCompressorStatesData], endDate - startDate);

      return {
        startDate,
        timePerState
      }
    });
  }

  

  
  render() {
    const statesTable = {
      columns: ['Name', 'Metric', 'Value'],
      rows: config.statesInfo
    };

    if (this.state.loadError) {
      return <div>couldn't load file</div>;
    }

    if (this.state.loading) {
      return <div className="spinner"><Loader /></div>;
    }
    if (!this.state.activePowerData) {
      return <div />;
    }
    
    return ( 
    <div className="container">
      <h3 className="text-center mb-3">Metric Viewer</h3>
      <DateRange 
        startDate={this.state.startDate} 
        endDate={this.state.endDate}
        handleChangeStart={this.handleChangeStart}
        handleChangeEnd={this.handleChangeEnd}
      />
      
      <LineChart 
            startDate={this.state.startDate} 
            endDate={this.state.endDate}
            data={this.state.activePowerData}
        /> 

      <div className="row mt-3">
        <div className="col-sm-4">
          <BarChart data={this.state.timePerState}/>
        </div>
        <div className="col-sm-6 offset-sm-2">
          <h5 className="text-center">List of States</h5>
          <Table data={statesTable} />
        </div>        
      </div>
    </div>
      
    );
  }
}

export default App;
