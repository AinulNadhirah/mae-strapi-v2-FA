import moment from "moment";

import { ErrorLogger } from "@utils/logs";

export const calcSecondsToDate = (date) => {
    const endDate = moment(date);
    const current = moment();
    return moment.duration(endDate.diff(current)).asSeconds();
};

export const calcDateIsAfterNow = (date) => {
    const endDate = moment(date);
    const current = moment();
    return endDate.isAfter(current);
};

export const calcDateIsBeforeNow = (date) => {
    const startDate = moment(date);
    const current = moment();
    return current.isAfter(startDate);
};

export const dayKeys = Object.freeze(["sun", "mon", "tue", "wed", "thu", "fri", "sat"]);

export const getGivenMonthDaysToDateMappingArray = (year, month) => {
    try {
        const monthIndex = month - 1;
        const date = new Date(year, monthIndex, 1);
        const result = [];
        while (date.getMonth() === monthIndex) {
            result.push({ day: `${dayKeys[date.getDay()]}`, date: `${date.getDate()}` });
            date.setDate(date.getDate() + 1);
        }
        return result;
    } catch (error) {
        ErrorLogger(error);
    }
};

export const dateToMilliseconds = (date) => {
    return moment(date).format("x");
};
