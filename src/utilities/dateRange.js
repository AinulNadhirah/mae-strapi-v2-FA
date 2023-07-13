import moment from "moment";

import { datePickerData } from "@services";

import { getDateRangeDefaultData } from "@constants/datePickerDefaultData";

export const getDateRange = async (module) => {
    let validDate = {};
    try {
        const httpResp = await datePickerData(module);

        const result = httpResp?.data?.maeCalendarInfo ?? null;
        if (!result) {
            // this is to get default calendar dates if api fails
            validDate = getDateRangeDefaultData(module);
        } else {
            validDate = {
                default: {
                    value: result?.defaultValue ?? 0,
                    countParam: result?.defaultCountParam ?? "days",
                },
                min: {
                    value: result?.minValue ?? 0,
                    countParam: result?.minCountParam ?? "months",
                },
                max: {
                    value: result?.maxValue ?? 0,
                    countParam: result?.maxCountParam ?? "years",
                },
            };
        }
    } catch (error) {
        console.log("[Dateapicker][Dateapipicker] >> Exception: ", error);
        // in any err case default datepicker should be shown
        validDate = getDateRangeDefaultData(module);
    }

    return validDate;
};

export const getStartDate = (validDateRangeData, referencePoint = moment()) => {
    let returnStartDateValue;
    const minValue = validDateRangeData?.min?.value;
    if (minValue < 0) {
        returnStartDateValue = referencePoint
            .subtract(Math.abs(minValue), validDateRangeData?.min?.countParam)
            .toDate();
    } else {
        returnStartDateValue = referencePoint
            .add(minValue, validDateRangeData?.min?.countParam)
            .toDate();
    }
    return returnStartDateValue;
};

export const getEndDate = (validDateRangeData, referencePoint = moment()) => {
    let returnEndValue;
    const maxValue = validDateRangeData?.max?.value;
    if (maxValue === "NA") {
        returnEndValue = referencePoint.add(10, "year").toDate();
    } else {
        returnEndValue = referencePoint.add(maxValue, validDateRangeData?.max?.countParam).toDate();
    }
    return returnEndValue;
};

export const getDefaultDate = (validDateRangeData, referencePoint = moment()) => {
    const defaultValue = validDateRangeData?.default?.value;
    let returnDefaultDateValue;
    if (defaultValue >= 0) {
        returnDefaultDateValue = referencePoint
            .add(defaultValue, validDateRangeData?.default?.countParam)
            .toDate();
    } else {
        returnDefaultDateValue = referencePoint
            .subtract(Math.abs(defaultValue), validDateRangeData?.default?.countParam)
            .toDate();
    }
    return returnDefaultDateValue;
};
