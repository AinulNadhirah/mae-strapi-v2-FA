/* eslint-disable sonarjs/cognitive-complexity */

/**
 * Check Eligibility Controller
 *
 * Methods used for processing data in Check Eligibility flow to be added here.
 */
import moment from "moment";
import numeral from "numeral";

import {
    CE_DECLARATION,
    CE_PF_NUMBER,
    CE_PF_NUMBER_CONFIRMATION,
    CE_UNIT_SELECTION,
    CE_PROPERTY_NAME,
    CE_PROPERTY_ADDRESS,
    CE_PROPERTY_SEARCH_LIST,
    CE_PURCHASE_DOWNPAYMENT,
    CE_TENURE,
    CE_PERSONAL,
    CE_COMMITMENTS,
    CE_RESULT,
    CE_FIN_DECLARATION,
    CE_ADD_JA_DETAILS,
    LA_ELIGIBILITY_CONFIRM,
} from "@navigation/navigationConstant";

import {
    saveInputData,
    eligibilityCheck,
    jointApplicantEligibilityCheck,
    isExistingCustomer,
    pushNotificationToInviteJA,
} from "@services";

import { STATUS_CODE_SUCCESS } from "@constants/api";
import { PROP_ELG_INPUT, DT_ELG, DT_NOTELG, DT_RECOM, INVALID_ADDRESSES } from "@constants/data";
import {
    ADDRESS_LINE1_EMPTY_ERR_MSG,
    ADDRESS_LINE1_MIN_ERR_MSG,
    ADDRESS_LINE1_SPACE_ERR_MSG,
    ADDRESS_LINE1_INVALID_ERR_MSG,
    ADDRESS_LINE2_EMPTY_ERR_MSG,
    ADDRESS_LINE2_MIN_ERR_MSG,
    ADDRESS_LINE2_SPACE_ERR_MSG,
    ADDRESS_LINE2_INVALID_ERR_MSG,
    CITY_EMPTY_ERR_MSG,
    CITY_MIN_ERR_MSG,
    CITY_SPACE_ERR_MSG,
    CITY_INVALID_ERR_MSG,
    INVALID_SPECIAL_CHAR_ERR_MSG,
    CE_CHECK_AVAILABLE_FOR_MLYANS_ERR_MSG,
    ENTER_INPUT_JAID_NUMBER_ERR_MSG,
    ID_MUST_CONTAIN_4DIGITS_ERR_MSG,
    ID_MUST_NOT_CONTAIN_SPACES_ERR_MSG,
    REMOVE_SPECIAL_CHARS_ERR_MSG,
    SELF_ID_USED_ERR_MSG,
    COMMON_ERROR_MSG,
    POSTCODE_MAX_ERR_MSG,
    POSTCODE_MIN_ERR_MSG,
    POSTCODE_MUST_NOT_SPECCHARS_ERR_MSG,
    POSTCODE_MUST_NOT_APLHA_SPECCHARS_ERR_MSG,
    POSTCODE_EMPTY_ERR_MSG,
    VALIDATEJA_EMPTY_ERR_MSG,
    VALIDATEJA_MUST_3APLHA_ERR_MSG,
    VALIDATEJS_SPACE_ERR_MSG,
    VAL_JAMOBILE_MUST_NUM_DIGITS_ERR_MSG,
    VAL_JAMOBILE_MUST_9DIGITS_ERR_MSG,
    VAL_JAMOBILE_EMPTY_ERR_MSG,
} from "@constants/strings";

import {
    leadingOrDoubleSpaceRegex,
    addressCharRegexCC,
    maeOnlyNumberRegex,
    validateAlphaNumaric,
} from "@utils/dataModel";

import { getEncValue } from "../Common/PropertyController";
import { ADDRESS_LINE3_INVALID_ERR_MSG, ADDRESS_LINE3_MIN_ERR_MSG, ADDRESS_LINE3_SPACE_ERR_MSG } from "../../../constants/strings";

function validateAddressOne(value) {
    console.log("[CEController] >> [validateAddressOne]");

    if (!value) {
        return {
            isValid: false,
            message: ADDRESS_LINE1_EMPTY_ERR_MSG,
        };
    }

    // Min length check
    if (value.length < 5) {
        return {
            isValid: false,
            message: ADDRESS_LINE1_MIN_ERR_MSG,
        };
    }

    // Check for leading or double spaces
    if (!leadingOrDoubleSpaceRegex(value)) {
        return {
            isValid: false,
            message: ADDRESS_LINE1_SPACE_ERR_MSG,
        };
    }

    // Address Line 1 Special Char check
    if (!addressCharRegexCC(value)) {
        return {
            isValid: false,
            message: INVALID_SPECIAL_CHAR_ERR_MSG,
        };
    }

    //  special word checks
    if (INVALID_ADDRESSES.indexOf(value.trim().toUpperCase()) > -1) {
        return {
            isValid: false,
            message: ADDRESS_LINE1_INVALID_ERR_MSG,
        };
    }

    // Return true if no validation error
    return {
        isValid: true,
    };
}

function validateAddressTwo(value) {
    console.log("[CEController] >> [validateAddressTwo]");

    if (!value) {
        return {
            isValid: false,
            message: ADDRESS_LINE2_EMPTY_ERR_MSG,
        };
    }

    // Min length check
    if (value.length < 5) {
        return {
            isValid: false,
            message: ADDRESS_LINE2_MIN_ERR_MSG,
        };
    }

    // Check for leading or double spaces
    if (!leadingOrDoubleSpaceRegex(value)) {
        return {
            isValid: false,
            message: ADDRESS_LINE2_SPACE_ERR_MSG,
        };
    }

    // Address Line 2 Special Char check
    if (!addressCharRegexCC(value)) {
        return {
            isValid: false,
            message: INVALID_SPECIAL_CHAR_ERR_MSG,
        };
    }

    //  special word checks
    if (INVALID_ADDRESSES.indexOf(value.trim().toUpperCase()) > -1) {
        return {
            isValid: false,
            message: ADDRESS_LINE2_INVALID_ERR_MSG,
        };
    }

    // Return true if no validation error
    return {
        isValid: true,
    };
}

function validateAddressThree(value) {
    console.log("[CEController] >> [validateAddressTwo]");

    if (!value) {
        return {
            isValid: true,
        };
    }

    // Min length check
    if (value.length < 5) {
        return {
            isValid: false,
            message: ADDRESS_LINE3_MIN_ERR_MSG,
        };
    }

    // Check for leading or double spaces
    if (!leadingOrDoubleSpaceRegex(value)) {
        return {
            isValid: false,
            message: ADDRESS_LINE3_SPACE_ERR_MSG,
        };
    }

    // Address Line 3 Special Char check
    if (!addressCharRegexCC(value)) {
        return {
            isValid: false,
            message: INVALID_SPECIAL_CHAR_ERR_MSG,
        };
    }

    //  special word checks
    if (INVALID_ADDRESSES.indexOf(value.trim().toUpperCase()) > -1) {
        return {
            isValid: false,
            message: ADDRESS_LINE3_INVALID_ERR_MSG,
        };
    }

    // Return true if no validation error
    return {
        isValid: true,
    };
}

function validateCity(value) {
    console.log("[CEController] >> [validateCity]");

    if (!value) {
        return {
            isValid: false,
            message: CITY_EMPTY_ERR_MSG,
        };
    }

    // Min length check
    if (value.length < 1) {
        return {
            isValid: false,
            message: CITY_MIN_ERR_MSG,
        };
    }

    // Check for leading or double spaces
    if (!leadingOrDoubleSpaceRegex(value)) {
        return {
            isValid: false,
            message: CITY_SPACE_ERR_MSG,
        };
    }

    // Check for special characters
    if (!addressCharRegexCC(value)) {
        return {
            isValid: false,
            message: INVALID_SPECIAL_CHAR_ERR_MSG,
        };
    }

    //  special word checks
    if (INVALID_ADDRESSES.indexOf(value.trim().toUpperCase()) > -1) {
        return {
            isValid: false,
            message: CITY_INVALID_ERR_MSG,
        };
    }

    // Return true if no validation error
    return {
        isValid: true,
    };
}

function validatePostcode(value, countryValue) {
    console.log("[CEController] >> [validatePostcode]");

    // Empty check
    if (!value) {
        return {
            isValid: false,
            message: POSTCODE_EMPTY_ERR_MSG,
        };
    }

    // Check there are no other characters except numbers
    if (!maeOnlyNumberRegex(value) && countryValue === "MYS") {
        return {
            isValid: false,
            message: POSTCODE_MUST_NOT_APLHA_SPECCHARS_ERR_MSG,
        };
    }

    if (!validateOnlyAlphaNumeric(value) && countryValue !== "MYS") {
        return {
            isValid: false,
            message: POSTCODE_MUST_NOT_SPECCHARS_ERR_MSG,
        };
    }

    // Min length check for MYS users
    if (value.length !== 5 && countryValue === "MYS") {
        return {
            isValid: false,
            message: POSTCODE_MIN_ERR_MSG,
        };
    }

    // Min length check for non mys users
    if (value.length > 8 && value.length < 1) {
        return {
            isValid: false,
            message: POSTCODE_MAX_ERR_MSG,
        };
    }

    // Return true if no validation error
    return {
        isValid: true,
    };
}

// Check for there are no speicial character
function validateOnlyAlphaNumeric(text) {
    if (text) {
        const isValid = /^[A-Za-z0-9]+$/;
        return isValid.test(String(text));
    } else {
        return false;
    }
}

function validateJAName(value) {
    console.log("[CEController] >> [validateJAName]");

    if (!value) {
        return {
            isValid: false,
            message: VALIDATEJA_EMPTY_ERR_MSG,
        };
    }

    // Min length check
    if (value.length < 3) {
        return {
            isValid: false,
            message: VALIDATEJA_MUST_3APLHA_ERR_MSG,
        };
    }

    // Check for leading or double spaces
    if (!leadingOrDoubleSpaceRegex(value)) {
        return {
            isValid: false,
            message: VALIDATEJS_SPACE_ERR_MSG,
        };
    }

    // Return true if no validation error
    return {
        isValid: true,
    };
}

function validateJAIDNumber(value, idTypeValue, isSelfCustomerId) {
    console.log("[CEController] >> [validateJAIDNumber]");

    if (!value) {
        return {
            isValid: false,
            message: ENTER_INPUT_JAID_NUMBER_ERR_MSG,
        };
    }

    // Min length check
    if (value.length < 4) {
        return {
            isValid: false,
            message: ID_MUST_CONTAIN_4DIGITS_ERR_MSG,
        };
    }

    // Check for leading or double spaces
    if (!leadingOrDoubleSpaceRegex(value)) {
        return {
            isValid: false,
            message: ID_MUST_NOT_CONTAIN_SPACES_ERR_MSG,
        };
    }

    // Address Line 1 Special Char check
    if (!validateAlphaNumaric(value)) {
        return {
            isValid: false,
            message: REMOVE_SPECIAL_CHARS_ERR_MSG,
        };
    }

    // Check if Self ID added
    if (isSelfCustomerId) {
        return {
            isValid: false,
            message: SELF_ID_USED_ERR_MSG,
        };
    }

    if (idTypeValue && idTypeValue !== "NWIC" && idTypeValue !== "PRIC") {
        return {
            isValid: false,
            message: CE_CHECK_AVAILABLE_FOR_MLYANS_ERR_MSG,
        };
    }

    // Return true if no validation error
    return {
        isValid: true,
    };
}

function validateJAMobileNumber(value) {
    console.log("[CEController] >> [validateJAMobileNumber]");

    const trimmedMobileNumber = value.replace(/\s/g, "");

    if (!value) {
        return {
            isValid: false,
            message: VAL_JAMOBILE_EMPTY_ERR_MSG,
        };
    }

    // Min length check
    if (trimmedMobileNumber.length < 9) {
        return {
            isValid: false,
            message: VAL_JAMOBILE_MUST_9DIGITS_ERR_MSG,
        };
    }

    // Only numberical check
    if (!maeOnlyNumberRegex(trimmedMobileNumber)) {
        return {
            isValid: false,
            message: VAL_JAMOBILE_MUST_NUM_DIGITS_ERR_MSG,
        };
    }

    // Return true if no validation error
    return {
        isValid: true,
    };
}

function isAgeEligible(dob) {
    console.log("[CEController] >> [isAgeEligible]");

    // Default failure response
    const defaultResponse = {
        isEligible: false,
        age: null,
    };

    // Type checking
    if (typeof dob !== "string") return defaultResponse;

    // Length checking
    if (dob.length !== 8) return defaultResponse;

    // Chop string and retrieve user DOB in Date format
    const dd = dob.substr(0, 2);
    const mm = dob.substr(2, 2);
    const yyyy = dob.substr(4, 4);
    const dateString = `${yyyy}-${mm}-${dd}`;
    const userDOBDate = moment(new Date(dateString));
    const todayDate = moment(new Date());

    // Compare with today and retrieve age
    const age = todayDate.diff(userDOBDate, "years");

    return {
        isEligible: age >= 18 && age < 66,
        age,
    };
}

async function saveEligibilityInput(paramsObj, showPreloader = true) {
    console.log("[CEController] >> [saveEligibilityInput]");

    // Construct request object based on current screen
    const params = await getEligibilityInputRequest(paramsObj);

    // Call API to Save Input Data
    const httpResp = await saveInputData(params, showPreloader).catch((error) => {
        console.log("[CEController][saveEligibilityInput] >> Exception: ", error);
    });
    const statusCode = httpResp?.data?.result?.statusCode ?? null;
    const statusDesc = httpResp?.data?.result?.statusDesc ?? null;
    const syncId = httpResp?.data?.result?.syncId ?? null;
    const stpId = httpResp?.data?.result?.stpId ?? null;

    return {
        success: statusCode === STATUS_CODE_SUCCESS,
        errorMessage: statusDesc,
        syncId,
        stpId,
    };
}

async function getEligibilityInputRequest({ screenName, formData, navParams, saveData = "N" }) {
    console.log("[CEController] >> [getEligibilityInputRequest]");

    const screenWiseParams = {};
    const screenNameNumObj = getEligibilityNameNumObj();
    const screenNumber = screenNameNumObj[screenName];
    const isPropertyListed = navParams?.isPropertyListed;

    const encSyncId = await getEncValue(navParams?.syncId ?? "");
    // Common params in request object
    const commonReqParams = {
        // MDM Data
        customerName: navParams?.customerName,

        // Property Data
        propertyId: navParams?.propertyDetails?.property_id ?? "",

        // Common
        syncId: encSyncId,
        stpId: navParams?.stpId ?? "",
        screenNo: screenNumber,
        saveData,
        isPropertyListed,
        progressStatus: PROP_ELG_INPUT,
    };

    if (isPropertyListed === "Y") {
        commonReqParams.propertyName = navParams?.propertyDetails?.property_name ?? "";
    } else {
        const combinedParams = { ...navParams, ...formData };
        const propertySearchName = combinedParams?.propertySearchName
            ? combinedParams?.propertySearchName
            : formData?.propertyName;
        const propertyAddressName = combinedParams?.propertyAddressName;

        commonReqParams.propertyName = propertyAddressName || propertySearchName || "";
    }

    for (const sName in screenNameNumObj) {
        const currentNumber = screenNameNumObj[sName];
        const paramsArray = getEligibilityScreenParams(sName);

        paramsArray.forEach((item) => {
            if (currentNumber === screenNumber) screenWiseParams[item] = formData?.[item] ?? "";

            if (currentNumber < screenNumber) screenWiseParams[item] = navParams?.[item] ?? "";

            if (currentNumber > screenNumber) screenWiseParams[item] = "";
        });
    }

    // Return combined object
    return {
        ...screenWiseParams,
        ...commonReqParams,
    };
}

function getEligibilityScreenParams(screenName) {
    switch (screenName) {
        case CE_DECLARATION:
            return [];
        case CE_PROPERTY_NAME:
            return ["propertySearchName"];
        case CE_UNIT_SELECTION:
            return ["unitId", "unitTypeName"];
        case CE_PROPERTY_ADDRESS:
            return [
                "propertyAddress1",
                "propertyAddress2",
                "propertyAddress3",
                "propertyPostcode",
                "propertyState",
                "propertyAddressName",
            ];
        case CE_PURCHASE_DOWNPAYMENT:
            return [
                "propertyPrice",
                "downPaymentAmount",
                "downPaymentPercent",
                "loanAmount",
                "origLoanAmount",
            ];
        case CE_TENURE:
            return ["tenure", "origTenure"];
        case CE_PERSONAL:
            return [
                "title",
                "residentStatus",
                "education",
                "maritalStatus",
                "religion",
                "spouseIncome",
                "employmentStatus",
                "businessType",
                "occupation",
                "publicSectorNameFinance",
                "ccrisLoanCount",
            ];
        case CE_COMMITMENTS:
            return [
                "grossIncome",
                "houseLoan",
                "housingLoan",
                "personalLoan",
                "ccRepayments",
                "carLoan",
                "overdraft",
                "isFirstTimeBuyHomeIndc",
                "nonBankCommitments",
            ];
        case CE_FIN_DECLARATION:
            return ["propertyPurchase", "ongoingLoan"];
        case CE_PF_NUMBER:
            return ["staffPfNo", "staffName"];
        default:
            return [];
    }
}

function getEligibilityNameNumObj() {
    console.log("[CEController] >> [getEligibilityNameNumObj]");

    //Screen flow order is important
    const screenNameArray = [
        CE_DECLARATION,
        CE_PROPERTY_NAME,
        CE_UNIT_SELECTION,
        CE_PROPERTY_ADDRESS,
        CE_PURCHASE_DOWNPAYMENT,
        CE_TENURE,
        CE_PERSONAL,
        CE_COMMITMENTS,
        CE_FIN_DECLARATION,
        CE_PF_NUMBER,
        CE_ADD_JA_DETAILS,
    ];

    const mappingObj = {};

    screenNameArray.forEach((item, index) => {
        mappingObj[item] = index + 1;
    });

    return mappingObj;
}

async function checkEligibility(dataObj, showPreloader = true) {
    console.log("[CEController] >> [checkEligibility]");

    // Construct request object
    const params = await getCERequestObj(dataObj);

    // Call eligibility check API call
    const httpResp = await eligibilityCheck(params, showPreloader).catch((error) => {
        console.log("[CEController][checkEligibility] >> Exception: ", error);
    });
    const statusCode = httpResp?.data?.result?.statusCode ?? null;
    const statusDesc = httpResp?.data?.result?.statusDesc ?? null;
    const stpId = httpResp?.data?.result?.stpId ?? null;
    const overallStatus = httpResp?.data?.result?.overallStatus ?? null;
    const baseRateLabel = httpResp?.data?.result?.baseRateLabel ?? null;
    const eligibilityResult = httpResp?.data?.result?.eligibilityResult ?? null;
    const massagedResult = massageEligibilityResult(eligibilityResult);

    return {
        success: statusCode === STATUS_CODE_SUCCESS,
        errorMessage: statusDesc,
        stpId,
        eligibilityResult: massagedResult,
        overallStatus,
        baseRateLabel,
    };
}

async function checkJAEligibility(dataObj, showPreloader = true) {
    console.log("[CEController] >> [checkEligibility]");

    // Construct request object
    const params = await getCERequestObj(dataObj);

    // Call eligibility check API call
    const httpResp = await jointApplicantEligibilityCheck(params, showPreloader).catch((error) => {
        console.log("[CEController][checkJAEligibility] >> Exception: ", error);
    });
    const result = httpResp?.data?.result ?? null;
    const statusCode = result?.statusCode ?? null;
    const statusDesc = result?.statusDesc ?? null;
    const stpId = result?.stpId ?? null;
    const overallStatus = result?.overallStatus ?? null;
    const eligibilityResult = result?.eligibilityResult ?? null;
    const massagedResult = massageEligibilityResult(eligibilityResult);

    return {
        success: statusCode === STATUS_CODE_SUCCESS,
        errorMessage: statusDesc,
        stpId,
        eligibilityResult: massagedResult,
        overallStatus,
    };
}

async function getCERequestObj(dataObj) {
    console.log("[CEController] >> [getCERequestObj]");
    const encSyncId = await getEncValue(dataObj?.syncId ?? "");

    return {
        gender: dataObj?.mdmData?.gender,
        idType: dataObj?.mdmData?.idType,
        mobileNoCtryCd: "+6",
        nationality: dataObj?.mdmData?.citizenship,
        residentStatus: dataObj?.mdmData?.residentStatus,
        maritalStatus: dataObj?.maritalStatus ?? dataObj?.mdmData?.maritalStatus,
        religion: dataObj?.religion ?? dataObj?.mdmData?.religion,
        address: [
            {
                addressType: dataObj?.mdmData?.addressType,
                addressLine1: dataObj?.mdmData?.addr1,
                addressLine2: dataObj?.mdmData?.addr2,
                addressLine3: dataObj?.mdmData?.addr3,
                addressLine4: "",
                postCode: dataObj?.mdmData?.postCode,
                countryCode: dataObj?.mdmData?.country,
                state: dataObj?.mdmData?.state,
                email: "",
            },
        ],
        additionalIncome: [
            {
                additionalIncomeSource: "",
                additionalAmount: "",
            },
        ],
        grossIncome: dataObj?.grossIncome,
        spouseGrossIncome: dataObj?.spouseIncome,
        nonBankCommitment: dataObj?.nonBankCommitments,
        education: dataObj?.education ?? dataObj?.mdmData?.education,
        employmentType: dataObj?.employmentStatus ?? dataObj?.mdmData?.employmentType,
        occupation: dataObj?.occupation ?? dataObj?.mdmData?.occupation,
        occupationSector: dataObj?.mdmData?.occupationSector,
        nameOfEmployer: dataObj?.mdmData?.employerName,
        businessType: dataObj?.businessType ?? dataObj?.mdmData?.businessType,
        publicSectorNameFinance: dataObj?.publicSectorNameFinance,
        title: dataObj?.title ?? dataObj?.mdmData?.title,
        downpayment: dataObj?.downPaymentAmount ?? dataObj.downPaymentAmountRaw,
        loanFinancingAmountRM: dataObj?.loanAmount ?? dataObj?.loanAmountRaw,
        loanTenure: dataObj?.tenure,
        propertyId: dataObj?.propertyDetails?.property_id,
        unitId: dataObj?.unitId,
        customerSegment: dataObj?.mdmData?.customerSegment,
        customerGroup: dataObj?.residentStatus ?? dataObj?.mdmData?.residentStatus,
        ocrisStpRefNo: dataObj?.applicationStpRefNo,
        syncId: encSyncId,
        isNonListed: dataObj?.isPropertyListed === "Y" ? "N" : "Y",

        // Below fields are added on 13/08/2021
        propertyPurchase: dataObj?.propertyPurchase,
        ongoingLoan: dataObj?.ongoingLoan,
        totalHouseCount: dataObj?.houseLoan ?? "",
        ccrisLoanCount: dataObj?.ccrisLoanCount ?? "",
        isCcrisReportAvailable: dataObj?.ccrisReportFlag ? "Y" : "N",
        isFirstTimeBuyHomeIndc: dataObj?.isFirstTimeBuyHomeIndc ?? "",
        bankCommitment: {
            housingLoan: dataObj?.housingLoan,
            personalLoanOrOtherTermLoan: dataObj?.personalLoan,
            creditCardRepayment: dataObj?.ccRepayments,
            carLoan: dataObj?.carLoan,
            overdraft: dataObj?.overdraft,
        },
    };
}

function massageEligibilityResult(result) {
    console.log("[CEController] >> [massageEligibilityResult]");

    // For invalid response
    if (!(result instanceof Array)) return null;

    // For Eligible/NotEligible scenario
    if (
        result.length === 1 &&
        (result[0]?.dataType === DT_ELG || result[0]?.dataType === DT_NOTELG)
    ) {
        return result[0];
    }

    // For Recommendation scenario
    let resultObj;
    result.some((item) => {
        const dataType = item?.dataType;
        if (dataType === DT_RECOM) {
            resultObj = item;
            return true;
        }

        return false;
    });

    return resultObj;
}

function removeInputFormRoutes(routes) {
    console.log("[CEController] >> [removeInputFormRoutes]");

    if (!(routes instanceof Array)) return routes;

    // List of Form UIs which are to be removed from route
    const inputForms = [
        CE_DECLARATION,
        CE_PF_NUMBER,
        CE_PF_NUMBER_CONFIRMATION,
        CE_PROPERTY_NAME,
        CE_PROPERTY_ADDRESS,
        CE_PROPERTY_SEARCH_LIST,
        CE_UNIT_SELECTION,
        CE_PURCHASE_DOWNPAYMENT,
        CE_TENURE,
        CE_PERSONAL,
        CE_COMMITMENTS,
        CE_FIN_DECLARATION,
        CE_RESULT,
        CE_ADD_JA_DETAILS,
        LA_ELIGIBILITY_CONFIRM,
    ];

    // Filter out form routes
    return routes.filter((item) => {
        const name = item?.name;
        return inputForms.indexOf(name) === -1;
    });
}

function removeCEEditRoutes(routes) {
    console.log("[CEController] >> [removeCEEditInputFormRoutes]");

    if (!(routes instanceof Array)) return routes;

    // List of Form UIs which are to be removed from route
    const inputForms = [
        CE_UNIT_SELECTION,
        CE_PURCHASE_DOWNPAYMENT,
        CE_TENURE,
        CE_PERSONAL,
        CE_COMMITMENTS,
        CE_FIN_DECLARATION,
    ];

    // Filter out form routes
    return routes.filter((item) => {
        const name = item?.name;
        return inputForms.indexOf(name) === -1;
    });
}

function getEligibilityBasicNavParams({
    propertyName = "",
    propertyDetails = null,
    masterData = {},
    mdmData = {},
    age,
    latitude = "",
    longitude = "",
}) {
    return {
        headerText: propertyName,
        propertyName,
        propertyDetails,
        masterData,
        mdmData,
        age,
        customerName: mdmData?.customerName,
        latitude,
        longitude,
        isPropertyListed: propertyName && propertyDetails ? "Y" : "N",
    };
}

function getCEAddJACommitmentsUIData(navParams, savedData, paramsEditFlow) {
    console.log("[CEAddJACommitments] >> [getUIData]");

    if (paramsEditFlow) {
        return {
            grossIncomeRaw: navParams?.grossIncome,
            houseLoan: navParams?.houseLoan,
            housingLoanRaw: navParams?.housingLoan,
            personalLoanRaw: navParams?.personalLoan,
            ccRepaymentsRaw: navParams?.ccRepayments,
            carLoanRaw: navParams?.carLoan,
            overdraftRaw: navParams?.overdraft,
            isFirstTimeBuyHomeIndc: navParams?.isFirstTimeBuyHomeIndc,
            nonBankCommitmentsRaw: navParams?.nonBankCommitments,
        };
    } else {
        return {
            grossIncomeRaw: savedData?.jaIncome
                ? savedData?.jaIncome
                : savedData?.grossIncomeRaw ?? null,
            houseLoan: savedData?.jaExistingHousingLoan
                ? savedData?.jaExistingHousingLoan
                : savedData?.houseLoan ?? null,
            housingLoanRaw: savedData?.housingLoanRaw ?? null,
            personalLoanRaw: savedData?.jaPersonalLoan
                ? savedData?.jaPersonalLoan
                : savedData?.personalLoanRaw ?? null,
            ccRepaymentsRaw: savedData?.jaCCRepayment
                ? savedData?.jaCCRepayment
                : savedData?.ccRepaymentsRaw ?? null,
            carLoanRaw: savedData?.jaCarLoan ? savedData?.jaCarLoan : savedData?.carLoanRaw ?? null,
            overdraftRaw: savedData?.jaOverdraft
                ? savedData?.jaOverdraft
                : savedData?.overdraftRaw ?? null,
            isFirstTimeBuyHomeIndc: savedData?.isFirstTimeBuyHomeIndc,
            nonBankCommitmentsRaw: savedData?.jaNonBankingCommitment
                ? savedData?.jaNonBankingCommitment
                : savedData?.nonBankCommitmentsRaw ?? null,
        };
    }
}

function getPrepopulateAmount(rawAmt) {
    const defaultResponse = {
        dispAmt: "",
        rawAmt: "",
        keypadAmt: "",
    };

    if (!rawAmt) return defaultResponse;

    return {
        dispAmt: numeral(rawAmt).format("0,0.00"),
        rawAmt,
        keypadAmt: String(rawAmt * 100),
    };
}

async function fetchIsExistingCustomer(params, showPreloader = true) {
    console.log("[CEController] >> [fetchIsExistingCustomer]");

    const httpResp = await isExistingCustomer(params, showPreloader).catch((error) => {
        console.log("[CEController][fetchIsExistingCustomer] >> Exception: ", error);
    });

    const result = httpResp?.data?.result ?? null;
    const statusCode = result?.statusCode ?? null;
    const statusDesc = result?.statusDesc ?? COMMON_ERROR_MSG;
    const existingCustomer = result?.existingCustomer;
    const isSelfCustomerId = result?.selfCustomerId;
    const hasAllMandatoryFields = result?.hasAllMandatoryFields;
    const maeAppUrl = result?.maeAppUrl;

    return {
        success: statusCode === STATUS_CODE_SUCCESS,
        errorMessage: statusDesc,
        existingCustomer,
        isSelfCustomerId,
        hasAllMandatoryFields,
        maeAppUrl,
    };
}

async function sendPushNotificationToInviteJA(commonParams) {
    const httpResp = await pushNotificationToInviteJA(commonParams).catch((error) => {
        console.log("[CEAddJADetails][onNotifyJAPopupConfirm] >> Exception: ", error);
    });
    const result = httpResp?.data?.result ?? {};
    const statusCode = result?.statusCode ?? null;

    return {
        pushNotificationSuccess: statusCode === STATUS_CODE_SUCCESS,
        result,
    };
}

function getCECommittmentUIData(navParams, savedData, paramsEditFlow) {
    console.log("[CECommitments] >> [getCECommittmentUIData]");

    if (paramsEditFlow) {
        return {
            grossIncomeRaw: navParams?.grossIncome,
            houseLoan: navParams?.houseLoan,
            housingLoanRaw: navParams?.housingLoan,
            personalLoanRaw: navParams?.personalLoan,
            ccRepaymentsRaw: navParams?.ccRepayments,
            carLoanRaw: navParams?.carLoan,
            overdraftRaw: navParams?.overdraft,
            isFirstTimeBuyHomeIndc: navParams?.isFirstTimeBuyHomeIndc ?? null,
            nonBankCommitmentsRaw: navParams?.nonBankCommitments,
        };
    } else {
        return {
            grossIncomeRaw: savedData?.grossIncomeRaw ?? null,
            houseLoan: savedData?.houseLoan ?? null,
            housingLoanRaw: savedData?.housingLoanRaw ?? null,
            personalLoanRaw: savedData?.personalLoanRaw ?? null,
            ccRepaymentsRaw: savedData?.ccRepaymentsRaw ?? null,
            carLoanRaw: savedData?.carLoanRaw ?? null,
            overdraftRaw: savedData?.overdraftRaw ?? null,
            isFirstTimeBuyHomeIndc: savedData?.isFirstTimeBuyHomeIndc ?? null,
            nonBankCommitmentsRaw: savedData?.nonBankCommitmentsRaw ?? null,
        };
    }
}

function getCEPersonalUIData(navParams, savedData, mdmData, paramsEditFlow) {
    console.log("[CEPersonal] >> [getCEPersonalUIData]");

    if (paramsEditFlow) {
        return {
            mdmTitle: navParams?.title,
            mdmResident: navParams?.residentStatus,
            mdmEducation: navParams?.education,
            mdmMarital: navParams?.maritalStatus,
            mdmReligion: navParams?.religion,
            mdmEmpType: navParams?.employmentStatus,
            mdmOccupation: navParams?.occupation,
            mdmBizClassification: navParams?.businessType,
        };
    } else {
        return {
            mdmTitle: savedData?.title ?? mdmData?.title,
            mdmResident: savedData?.residentStatus ?? mdmData?.customerGroup,
            mdmEducation: savedData?.education ?? mdmData?.education,
            mdmMarital: savedData?.maritalStatus ?? mdmData?.maritalStatus,
            mdmReligion: savedData?.religion ?? mdmData?.religion,
            mdmEmpType: savedData?.employmentStatus ?? mdmData?.employmentType,
            mdmOccupation: savedData?.occupation ?? mdmData?.occupation,
            mdmBizClassification: savedData?.businessType ?? mdmData?.businessClassification,
        };
    }
}
export {
    validateAddressOne,
    validateAddressTwo,
    validateCity,
    validatePostcode,
    validateJAName,
    validateJAIDNumber,
    validateJAMobileNumber,
    isAgeEligible,
    saveEligibilityInput,
    checkEligibility,
    removeInputFormRoutes,
    getEligibilityBasicNavParams,
    removeCEEditRoutes,
    checkJAEligibility,
    validateAddressThree,
    massageEligibilityResult,
    getCEAddJACommitmentsUIData,
    getPrepopulateAmount,
    fetchIsExistingCustomer,
    sendPushNotificationToInviteJA,
    getCECommittmentUIData,
    getCEPersonalUIData
};
