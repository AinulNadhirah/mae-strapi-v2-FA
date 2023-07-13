import * as scenarios from "@constants/dateScenarios";

export const getDateRangeDefaultData = (module) => {
    let validDate;
    switch (module) {
        case scenarios.ADD_EXPENSES:
            validDate = {
                default: {
                    value: 0,
                    countParam: "days",
                },
                min: {
                    value: -11,
                    countParam: "months",
                },
                max: {
                    value: "NA", // no NA just put 10 if NA
                    countParam: "NA",
                },
            };
            break;
        case scenarios.CREATE_TABUNG_START:
            validDate = {
                default: {
                    value: 2,
                    countParam: "days",
                },
                min: {
                    value: 2,
                    countParam: "days",
                },
                max: {
                    value: 30,
                    countParam: "days",
                },
            };
            break;
        case scenarios.CREATE_TABUNG_END:
            validDate = {
                default: {
                    value: 30,
                    countParam: "days",
                },
                min: {
                    value: 30,
                    countParam: "days",
                },
                max: {
                    value: 10,
                    countParam: "years",
                },
            };
            break;
        case scenarios.ERL_BUY_TICKETS:
            validDate = {
                default: {
                    value: 0,
                    countParam: "days",
                },
                min: {
                    value: 0,
                    countParam: "days",
                },
                max: {
                    value: 6,
                    countParam: "months",
                },
            };
            break;
        case scenarios.PAYMENTS_ONE_OFF:
            validDate = {
                default: {
                    value: 0,
                    countParam: "days",
                },
                min: {
                    value: 0,
                    countParam: "days",
                },
                max: {
                    value: 28,
                    countParam: "days",
                },
            };
            break;
        case scenarios.TRANSFER_ONE_OFF:
        case scenarios.PAYMENTS_PAY_CARD:
            validDate = {
                default: {
                    value: 0,
                    countParam: "days",
                },
                min: {
                    value: 0,
                    countParam: "days",
                },
                max: {
                    value: 28,
                    countParam: "days",
                },
            };
            break;
        case scenarios.DUITNOW_ONE_OFF:
        case scenarios.DUITNOW_RECURRING_START:
            validDate = {
                default: {
                    value: 1,
                    countParam: "days",
                },
                min: {
                    value: 1,
                    countParam: "days",
                },
                max: {
                    value: 30,
                    countParam: "days",
                },
            };
            break;
        case scenarios.DUITNOW_RECURRING_END:
            validDate = {
                default: {
                    value: 30,
                    countParam: "days",
                },
                min: {
                    value: 30,
                    countParam: "days",
                },
                max: {
                    value: 10,
                    countParam: "years",
                },
            };
            break;
        case scenarios.CARDS_ID_DOB:
            validDate = {
                default: {
                    value: -21,
                    countParam: "years",
                },
                min: {
                    value: -65,
                    countParam: "years",
                },
                max: {
                    value: -21,
                    countParam: "years",
                },
            };
            break;
        case scenarios.CARDS_SUPP_DOB:
        case scenarios.MAE_ONBOARD_DOB:
            validDate = {
                default: {
                    value: -12,
                    countParam: "years",
                },
                min: {
                    value: -80,
                    countParam: "years",
                },
                max: {
                    value: -12,
                    countParam: "years",
                },
            };
            break;
        default:
            validDate = {
                default: {
                    value: 0,
                    countParam: "days",
                },
                min: {
                    value: 30,
                    countParam: "days",
                },
                max: {
                    value: 10,
                    countParam: "years",
                },
            };
    }

    return validDate;
};
