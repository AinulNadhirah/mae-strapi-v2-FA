import {
  NativeModules,
  DeviceEventEmitter
} from 'react-native';
import moment from 'moment';

const samsungHealth = NativeModules.RNSamsungHealth;

class RNSamsungHealth {
  authorize(callback) {
    samsungHealth.connect(
      [samsungHealth.STEP_COUNT],
      (msg) => { callback(msg, false); },
      (res) => { callback(false, res); },
    );
  }

  stop() {
    samsungHealth.disconnect();
  }

  getDailyStepCount(options, callback) {
    let startDate = options.startDate != undefined ? options.startDate : (new Date()).setHours(0, 0, 0, 0);
    let endDate = options.endDate != undefined ? options.endDate : (new Date()).valueOf();


    samsungHealth.readStepCount(startDate, endDate,
      (msg) => { callback(msg, false); },
      (res) => {
        if (res.length > 0) {
          var resData = res.map(function (dev) {
            var obj = {};
            obj.source = dev.source.name;
            var arr = this.getDates(startDate, endDate);
            obj.data = this.buildDailySteps(arr, dev.data);
            obj.sourceDetail = dev.source;
            return obj;
          }, this);

          callback(false, resData);
        } else {
          callback("There is no any steps data for this period", false);
        }
      }
    );
  }

  usubscribeListeners() {
    DeviceEventEmitter.removeAllListeners();
  }

  getDates(startDate, stopDate) {
    var dateArray = [];
    var currentDate = moment(startDate);
    var stopDate = moment(stopDate);
    while (currentDate <= stopDate) {
      dateArray.push(
        {
          steps: 0,
          activityDate: moment(currentDate).format('YYYY-MM-DD'),
          calories: 0,
          distance:0
        }
      )
      currentDate = moment(currentDate).add(1, 'days');
    }

    return dateArray;
  }

  buildDailySteps(arr, data) {
    var results = [];
    // console.log(data);
    for (var step of data) {
      var date = step.start_time !== undefined ? new Date(step.start_time) : new Date(step.day_time);

      var day = ("0" + date.getDate()).slice(-2);
      var month = ("0" + (date.getMonth() + 1)).slice(-2);
      var year = date.getFullYear();
      var dateFormatted = year + "-" + month + "-" + day;
      results.push({ steps: step.count, activityDate: dateFormatted, calories: step.calorie })
      // results.push({steps:step.count, date:dateFormatted})

    }
    console.log(data);
    for (var j = 0; j < arr.length; j++) {
      let dtObj = {};
       dtObj = results.find((obj) => {
        return obj.activityDate === arr[j].activityDate
      })
      if (dtObj) {
        arr[j].steps = dtObj.steps;
        arr[j].calories=Number(dtObj.calories.toFixed(2));
        arr[j].distance =Number((dtObj.steps / 1250).toFixed(2))
      }
    }
    
    return arr;
  }

  mergeResult(res) {
    results = {}
    for (var dev of res) {
      if (!(dev.sourceDetail.group in results)) {
        results[dev.sourceDetail.group] = {
          source: dev.source,
          sourceDetail: { group: dev.sourceDetail.group },
          stepsDate: {}
        };
      }

      let group = results[dev.sourceDetail.group];

      for (var step of dev.steps) {
        if (!(step.date in group.stepsDate)) {
          group.stepsDate[step.date] = 0;
        }

        group.stepsDate[step.date] += step.value;
      }
    }

    results2 = [];
    for (var index in results) {
      let group = results[index];
      var steps = [];
      for (var date in group.stepsDate) {
        steps.push({
          date: date,
          value: group.stepsDate[date]
        });
      }
      group.steps = steps.sort((a, b) => a.date < b.date ? -1 : 1);
      delete group.stepsDate;

      results2.push(group);
    }

    return results2;
  }
}


export default new RNSamsungHealth();