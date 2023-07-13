import moment from "moment";

export const currentUnixTimeStamp = () => {
    return moment().unix();
};

export const apiToMhDateLocal = (timestamp) => {
    return timestamp ? moment(timestamp).format("DD MMM YYYY") : "";
};

export const apiToMhDateLocalServer = (timestamp) => {
    return timestamp ? moment(timestamp).format("YYYYMMDD") : "";
};

export const retrieveuserDOB = (DOB) => {
    if (DOB && DOB.length > 5) {
        const custYear = DOB.substring(0, 2);
        const custMonth = DOB.substring(2, 4);
        const custDay = DOB.substring(4, 6);
        let custYearFull = "";

        const currentDate = new Date();
        const currentYearFull = currentDate.getFullYear();
        const currentYear = currentYearFull.toString().substring(2, 4);
        if (parseInt(custYear) > currentYear) {
            custYearFull = "19" + custYear;
        } else {
            custYearFull = "20" + custYear;
        }

        return custYearFull + custMonth + custDay;
    }
};

