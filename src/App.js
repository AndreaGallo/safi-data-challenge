import React, { Component } from 'react';
import {csv} from 'd3-request';
import Papa from 'papaparse';
import csvFilePath from "./data/demoCompressorWeekData.csv"
import './App.css';
import _ from 'lodash';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loadError: false,
      data: null
    };
    this.loadData = this.loadData.bind(this);
  }

  loadData = (data) => {
    this.setState({data});
  }

  componentWillMount() {
    csv(csvFilePath, (error, data) => {

      if (error) {
        this.setState({loadError: true});
      }

      if(data.length) {
        // agregar filter para q funcione en IE
        var filterData = data.filter( d => d.metricid.toUpperCase() ===  'PSUM_KW' ); 
        var maximumValue = _.maxBy(filterData, function(o) { return o.recvalue; });
        var minimumValue = _.minBy(filterData, function(o) { return o.recvalue; });
        this.setState({data : filterData});
        console.log('maximumValue', maximumValue);
        console.log('minimumValue', minimumValue);
      }
    });

    Papa.parse(csvFilePath, {
      download: true,
      header: true,
      complete: function(results, file) {
        console.log("Parsing complete:", results.data);
      }
    })
  }

  render() {
    if (this.state.loadError) {
      return <div>couldn't load file</div>;
    }
    if (!this.state.data) {
      return <div />;
    }
    return (<div style={{
      background: '#fff',
      borderRadius: '3px',
      boxShadow: '0 1 2 0 rgba(0,0,0,0.1)',
      margin: 12,
      padding: 24,
      width: '350px'
    }}>
      <h1>Birth and death rates of selected countries</h1>
      <h2>per 1,000 inhabitants</h2>
    </div>
    );
  }
}

export default App;
