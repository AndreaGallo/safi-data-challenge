import React from 'react';
import DatePicker from 'react-datepicker';
import addDays from "date-fns/addDays";

const DateRange = props => {
    const {startDate, endDate, handleChangeStart, handleChangeEnd} = props;
    const startDatePicker = new Date(startDate);
    const endDatePicker =  new Date(endDate); 
    return (
        <div className="form-group text-center">
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
            <label>To: </label>
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
    );
};

export default DateRange;