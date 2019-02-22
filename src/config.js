const activePowerMaxValue = 104.92483;
const activePowerMinValue = 0.10525999999999999;
const metricId = "PSUM_KW";

export default {
  activePowerMaxValue,
  activePowerMinValue,
  timeBetweenRecords: 3000,
  metricId,
  statesInfo: [{
    "Name": "Off",
    "Metric": metricId,
    "Value": "No data"
  },{
    "Name": "Loaded",
    "Metric": metricId,
    "Value": ">= " + Number(0.2 * activePowerMaxValue).toFixed(4)  + "KW"
  },{
    "Name": "Idle",
    "Metric": metricId,
    "Value": ">" + Number(activePowerMinValue).toFixed(4) + "KW and <" + 0.2 * Number(activePowerMaxValue).toFixed(4) + "KW"
  },{
    "Name": "Unloaded",
    "Metric": metricId,
    "Value": "> 0KW and <=" + Number(activePowerMinValue).toFixed(4)  + "KW"
  }]
}