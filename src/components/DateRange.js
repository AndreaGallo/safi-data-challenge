import React from 'react';
import DatePicker from 'react-datepicker';
import addDays from "date-fns/addDays";
import "react-datepicker/dist/react-datepicker.css";

const DateRange = props => {
    const {startDate, endDate, handleChangeStart, handleChangeEnd} = props;
    const startDatePicker = new Date(startDate);
    const endDatePicker =  new Date(endDate); 
    return (
        <div className="form-group text-center">
            <div className="d-sm-inline-block mb-3">
                <label>From: </label>
                <DatePicker
                    selected={startDatePicker}
                    selectsStart
                    startDate={startDatePicker}
                    endDate={endDatePicker}
                    onChange={handleChangeStart}
                    maxDate={addDays(endDatePicker, - 1)}
                    showDisabledMonthNavigation
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    dateFormat="MMMM d, yyyy h:mm aa"
                    timeCaption="time"
                />
            </div>
            <div className="d-sm-inline-block  mb-3">
                <label className="pr-3 pr-sm-0">To: </label>
                <DatePicker
                    selected={endDatePicker}
                    selectsEnd
                    startDate={startDatePicker}
                    endDate={endDatePicker}
                    onChange={handleChangeEnd}
                    minDate={addDays(startDatePicker, 1)}
                    showDisabledMonthNavigation
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    dateFormat="MMMM d, yyyy h:mm aa"
                    timeCaption="time"
                /> 
            </div>            
        </div>
    );
};

export default DateRange;