/**
 * Check Eligibility Controller
 *
 * Methods used for processing data in Check Eligibility flow to be added here.
 */
/* eslint-disable sonarjs/cognitive-complexity */

import {
    JA_EMPLOYMENT_ADDRESS,
    JA_EMPLOYMENT_DETAILS,
    JA_PERSONAL_INFO,
    JA_INCOME_COMMITMENT,
    JA_TNC,
    JA_ADDITIONAL,
    JA_CUST_ADDRESS,
    JA_CONFIRMATION,
    JA_CEF_IN_DECLARATION,
} from "@navigation/navigationConstant";

import {
    eligibilityCheckJointApplicant,
    saveJAApplicantData,
    jointApplicantEligibilityCheck,
} from "@services";

import { PROP_ELG_INPUT } from "@constants/data";

import { STATUS_CODE_SUCCESS } from "@constants/api";
import { getEncValue } from "../Common/PropertyController";
import { massageEligibilityResult } from "../Eligibility/CEController";

async function checkEligibilityForJointApplicant(dataObj, showPreloader = true) {
    const params = await getCERequestObj(dataObj);
    // Call eligibility check API call
    const httpResp = await eligibilityCheckJointApplicant(params, showPreloader).catch((error) => {
        console.log("[JAController][eligibilityCheckJointApplicant] >> Exception: ", error);
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

async function saveEligibilityInput(paramsObj, showPreloader = true) {
    // Construct request object based on current screen
    const params = await getEligibilityInputRequest(paramsObj);
    params.unitId = paramsObj?.navParams?.unitId;
    params.grossIncome = paramsObj?.navParams?.grossIncome;
    // Call API to Save Input Data
    const httpResp = await saveJAApplicantData(params, showPreloader).catch((error) => {
        console.log("[JAController][saveJAApplicantData] >> Exception: ", error);
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

async function getEligibilityInputRequest({
    screenName,
    formData,
    navParams,
    editFlow = false,
    saveData = "N",
}) {
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
        propertyName: navParams?.propertyName,
        propertyPrice: navParams?.propertyPrice,
        downPaymentAmount: navParams?.downPayment,
        grossIncome: navParams?.grossIncome,
        downPaymentPercent: navParams?.downPaymentPercent,
        tenure: navParams?.financingPeriod,
        loanAmount: navParams?.propertyFinancingAmt,
        // Common
        syncId: encSyncId,
        stpId: navParams?.stpId ?? "",
        screenNo: screenNumber,
        saveData: navParams?.saveData,
        isPropertyListed,
        unitTypeName: navParams?.unitTypeName,
        progressStatus: formData?.progressStatus ?? PROP_ELG_INPUT,
        propertyPurchase: formData?.propertyPurchase,
        ongoingLoan: formData?.ongoingLoan,
    };

    if (isPropertyListed === "Y") {
        commonReqParams.propertyName = navParams?.propertyName ?? "";
    } else {
        const combinedParams = { ...navParams, ...formData };
        const propertySearchName = combinedParams?.propertySearchName;
        const propertyAddressName = combinedParams?.propertyAddressName;

        commonReqParams.propertyName =
            propertyAddressName || propertySearchName || navParams?.propertyName || "";
    }

    for (const sName in screenNameNumObj) {
        const currentNumber = screenNameNumObj[sName];
        const paramsArray = getEligibilityScreenParams(sName);

        paramsArray.forEach((item) => {
            if (editFlow) {
                if (currentNumber === screenNumber) {
                    screenWiseParams[item] = formData?.[item] ?? "";
                } else {
                    screenWiseParams[item] = navParams?.[item] ?? "";
                }
            } else {
                if (currentNumber === screenNumber) {
                    screenWiseParams[item] = formData?.[item] ?? "";
                }
                if (currentNumber < screenNumber) screenWiseParams[item] = navParams?.[item] ?? "";

                if (currentNumber > screenNumber) screenWiseParams[item] = "";
            }
        });
    }

    if (navParams?.unitId) {
        screenWiseParams.unitId = navParams?.unitId;
    }
    // Return combined object
    return {
        ...commonReqParams,
        ...screenWiseParams,
    };
}

function getEligibilityScreenParams(screenName) {
    switch (screenName) {
        case JA_EMPLOYMENT_ADDRESS:
            return [
                "employerAddr1",
                "employerAddr2",
                "employerAddr3",
                "employerCity",
                "employerPostCode",
                "employerState",
                "employerCountry",
                "employerPhoneNo",
            ];
        case JA_EMPLOYMENT_DETAILS:
            return ["occupation", "employerName", "occupationSector", "empYears", "empMonths"];
        case JA_PERSONAL_INFO:
            return [
                "title",
                "residentStatus",
                "education",
                "maritalStatus",
                "religion",
                "spouseIncome",
                "employmentStatus",
                "businessType",
                "publicSectorNameFinance",
                "ccrisLoanCount",
                "ccrisReportFlag",
            ];
        case JA_INCOME_COMMITMENT:
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
                "unitId",
            ];
        case JA_CEF_IN_DECLARATION:
            return ["propertyPurchase", "ongoingLoan"];
        case JA_ADDITIONAL:
            return ["primaryIncome", "primarySourceOfIncome"];
        case JA_TNC:
            return [
                "radioPDSChecked",
                "radioDeclarationChecked",
                "radioFATCA1Checked",
                "radioFATCA2Checked",
                "radioPNChecked",
                "radioPNYesChecked",
                "radioAcceptProductChecked",
            ];
        case JA_CUST_ADDRESS:
            return [
                "homeAddr1",
                "homeAddr2",
                "homeAddr3",
                "homeCity",
                "homePostCode",
                "homeState",
                "homeCountry",
                "isMailingAddr",
                "mailingAddr1",
                "mailingAddr2",
                "mailingAddr3",
                "mailingCity",
                "mailingPostCode",
                "mailingState",
                "mailingCountry",
            ];
        default:
            return [];
    }
}

function getEligibilityNameNumObj() {
    const screenNameArray = [
        JA_PERSONAL_INFO,
        JA_CUST_ADDRESS,
        JA_EMPLOYMENT_DETAILS,
        JA_EMPLOYMENT_ADDRESS,
        JA_INCOME_COMMITMENT,
        JA_CEF_IN_DECLARATION,
        JA_TNC,
        JA_ADDITIONAL,
        JA_CONFIRMATION,
    ];

    const mappingObj = {};

    screenNameArray.forEach((item, index) => {
        mappingObj[item] = index + 1;
    });

    return mappingObj;
}

async function checkEligibility(dataObj, showPreloader = true) {
    // Construct request object
    const params = await getCERequestObj(dataObj);

    // Call eligibility check API call
    const httpResp = await jointApplicantEligibilityCheck(params, showPreloader).catch((error) => {
        console.log("[JAController][jointApplicantEligibilityCheck] >> Exception: ", error);
    });
    const statusCode = httpResp?.data?.result?.statusCode ?? null;
    const statusDesc = httpResp?.data?.result?.statusDesc ?? null;
    const stpId = httpResp?.data?.result?.stpId ?? null;
    const overallStatus = httpResp?.data?.result?.overallStatus ?? null;
    const eligibilityResult = httpResp?.data?.result?.eligibilityResult ?? null;
    const massagedResult = massageEligibilityResult(eligibilityResult);

    return {
        success: statusCode === "0000",
        errorMessage: statusDesc,
        stpId,
        eligibilityResult: massagedResult,
        overallStatus,
    };
}

async function getCERequestObj(dataObj) {
    const encSyncId = await getEncValue(dataObj?.syncId ?? "");

    return {
        gender: dataObj?.mdmData?.gender,
        idType: dataObj?.mdmData?.idType,
        mobileNoCtryCd: "+6",
        nationality: dataObj?.mdmData?.citizenship,
        residentStatus: dataObj?.mdmData?.residentStatus,
        maritalStatus: dataObj?.maritalStatus,
        religion: dataObj?.religion,
        address: [
            {
                addressType: "H",
                addressLine1: dataObj?.homeAddr1,
                addressLine2: dataObj?.homeAddr2,
                addressLine3: dataObj?.homeAddr3,
                addressLine4: "",
                postCode: dataObj?.homePostCode,
                countryCode: dataObj?.homeCountry,
                state: dataObj?.homeState,
            },
            {
                addressType: "C",
                addressLine1: dataObj?.mailingAddr1,
                addressLine2: dataObj?.mailingAddr2,
                addressLine3: dataObj?.mailingAddr3,
                addressLine4: "",
                postCode: dataObj?.mailingPostCode,
                countryCode: dataObj?.mailingCountry,
                state: dataObj?.mailingState,
            },
            {
                addressType: "E",
                addressLine1: dataObj?.employerAddr1 ?? "",
                addressLine2: dataObj?.employerAddr2 ?? "",
                addressLine3: dataObj?.employerCity ?? "",
                addressLine4: "",
                postCode: dataObj?.employerPostCode ?? "",
                countryCode: dataObj?.employerCountry ?? "",
                state: dataObj?.employerState ?? "",
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
        education: dataObj?.education,
        employmentType: dataObj?.employmentStatus,
        occupation: dataObj?.mdmData?.occupation,
        occupationSector: dataObj?.mdmData?.occupationSector,
        nameOfEmployer: dataObj?.mdmData?.employerName,
        businessType: dataObj?.businessType,
        publicSectorNameFinance: dataObj?.publicSectorNameFinance,
        title: dataObj?.title,
        downpayment: dataObj?.downPayment ?? dataObj?.downPaymentAmount,
        loanFinancingAmountRM:
            dataObj?.propertyFinancingAmt ?? dataObj?.eligibilityResult?.aipAmount,
        loanTenure: dataObj?.financingPeriod ?? dataObj?.tenure,
        propertyId: dataObj?.propertyDetails?.property_id,
        unitId: dataObj?.unitId,
        customerSegment: dataObj?.mdmData?.customerSegment,
        customerGroup: dataObj?.residentStatus,
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

function getJEligibilityBasicNavParams({
    propertyDetails = null,
    masterData = {},
    mdmData = {},
    age,
    latitude = "",
    longitude = "",
    propertyData,
    saveData,
}) {
    return {
        headerText: saveData?.propertyName,
        propertyName: saveData?.propertyName,
        propertyDetails: propertyData,
        downPayment: saveData?.downPayment ?? saveData?.downPaymentAmountRaw,
        baseRate: saveData?.baseRate,
        effectiveProfitRate: saveData?.effectiveProfitRate,
        financingPeriod: saveData?.financingPeriod ?? saveData?.tenure,
        monthlyInstalment: saveData?.monthlyInstalment,
        propertyFinancingAmt: saveData?.propertyFinancingAmt ?? saveData?.loanAmountRaw,
        propertyId: saveData?.propertyId,
        unitTypeName: saveData?.unitTypeName,
        propertyPrice: saveData?.propertyPrice ?? saveData?.propertyPriceRaw,
        downPaymentPercent: saveData?.downPaymentPercent ?? saveData?.downPaymentAmountRaw,
        grossIncome: saveData?.grossIncome ?? saveData?.grossIncomeRaw,
        spread: saveData?.spread ?? saveData?.spreadRate,
        syncId: saveData?.syncId,
        unitId: saveData?.unitId,
        masterData,
        mdmData,
        age,
        customerName: mdmData?.customerName,
        latitude,
        longitude,
        isPropertyListed: saveData?.propertyName && propertyDetails ? "Y" : "N",
        savedData: saveData,
        jaRelationship: saveData?.jaRelationship,
    };
}

async function saveJAInput(paramsObj, showPreloader = true) {
    console.log("[JAController] >> [saveJAInput]");
    // Construct request object based on current screen
    const params = await getEligibilityInputRequest(paramsObj);
    // Call API to Save Input Data
    const httpResp = await saveJAApplicantData(params, showPreloader).catch((error) => {
        console.log("[JAController][saveJAApplicantData] >> Exception: ", error);
    });
    const statusCode = httpResp?.data?.result?.statusCode ?? null;
    const statusDesc = httpResp?.data?.result?.statusDesc ?? null;
    return {
        success: statusCode === "0000",
        errorMessage: statusDesc,
    };
}

function removeInputFormRoutes(routes) {
    if (!(routes instanceof Array)) return routes;

    // List of Form UIs which are to be removed from route
    const inputForms = [JA_PERSONAL_INFO, JA_EMPLOYMENT_DETAILS, JA_EMPLOYMENT_ADDRESS];

    // Filter out form routes
    return routes.filter((item) => {
        const name = item?.name;
        return inputForms.indexOf(name) === -1;
    });
}

function removeJAEditRoutes(routes) {
    if (!(routes instanceof Array)) return routes;

    // List of Form UIs which are to be removed from route
    const inputForms = [
        JA_PERSONAL_INFO,
        JA_EMPLOYMENT_DETAILS,
        JA_EMPLOYMENT_ADDRESS,
        JA_INCOME_COMMITMENT,
    ];

    // Filter out form routes
    return routes.filter((item) => {
        const name = item?.name;
        return inputForms.indexOf(name) === -1;
    });
}

function getAddressData(navParams, savedData, mdmData, editFlow) {
    console.log("[JACustAddress] >> [getAddressData]");

    // isMailingAddr: mailAddressFlag ? "Y" : "N",
    if (editFlow) {
        return {
            address1: navParams?.homeAddr1 ?? "",
            address2: navParams?.homeAddr2 ?? "",
            address3: navParams?.homeAddr3 ?? "",
            city: navParams?.homeCity ?? "",
            custPostcode: navParams?.homePostCode ?? "",
            custState: navParams?.homeState ?? "",
            custCountry: navParams?.homeCountry ?? "",
            mailingAddress1: navParams?.mailingAddr1 ?? "",
            mailingAddress2: navParams?.mailingAddr2 ?? "",
            mailingAddress3: navParams?.mailingAddr3 ?? "",
            mailingCity: navParams?.mailingCity ?? "",
            mailingPostcode: navParams?.mailingPostCode ?? "",
            mailingState: navParams?.mailingState ?? "",
            mailingCountry: navParams?.mailingCountry ?? "",
            isMailingAddr: navParams?.isMailingAddr,
        };
    } else {
        return {
            address1: savedData?.correspondenseAddr1 ?? mdmData?.addr1,
            address2: savedData?.correspondenseAddr2 ?? mdmData?.addr2,
            address3: savedData?.correspondenseAddr3 ?? mdmData?.addr3,
            city: savedData?.correspondenseCity ?? mdmData?.homeCity,
            custPostcode: savedData?.correspondensePostCode ?? mdmData?.postCode,
            custState: savedData?.correspondenseState ?? mdmData?.state,
            custCountry: navParams?.correspondenseCountry ?? mdmData?.country,
            mailingAddress1: savedData?.mailingAddr1 ?? mdmData?.mailingAddr1,
            mailingAddress2: savedData?.mailingAddr2 ?? mdmData?.mailingAddr2,
            mailingAddress3: savedData?.mailingAddr3 ?? mdmData?.mailingAddr3,
            mailingCity: savedData?.mailingCity ?? mdmData?.mailingCity,
            mailingPostcode: savedData?.mailingPostCode ?? mdmData?.mailingPostCode,
            mailingState: savedData?.mailingState ?? mdmData?.mailingState,
            mailingCountry: savedData?.mailingCountry ?? mdmData?.mailingCountry,
            isMailingAddr: savedData?.isMailingAddr ?? mdmData?.mailingAddrInd,
        };
    }
}

function getUIData(navParams, savedData, paramsEditFlow) {
    if (paramsEditFlow) {
        return {
            grossIncomeRaw: navParams?.grossIncome,
            isFirstTimeBuyHomeIndc: navParams?.isFirstTimeBuyHomeIndc,
            houseLoan: navParams?.houseLoan,
            housingLoanRaw: navParams?.housingLoan,
            personalLoanRaw: navParams?.personalLoan,
            ccRepaymentsRaw: navParams?.ccRepayments,
            carLoanRaw: navParams?.carLoan,
            overdraftRaw: navParams?.overdraft,
            nonBankCommitmentsRaw: navParams?.nonBankCommitments,
        };
    } else {
        return {
            grossIncomeRaw: savedData?.grossIncomeRaw ?? null,
            isFirstTimeBuyHomeIndc: savedData?.isFirstTimeBuyHomeIndc,
            houseLoan: savedData?.houseLoan ?? null,
            housingLoanRaw: savedData?.housingLoanRaw ?? null,
            personalLoanRaw: savedData?.personalLoanRaw ?? null,
            ccRepaymentsRaw: savedData?.ccRepaymentsRaw ?? null,
            carLoanRaw: savedData?.carLoanRaw ?? null,
            overdraftRaw: savedData?.overdraftRaw ?? null,
            nonBankCommitmentsRaw: savedData?.nonBankCommitmentsRaw ?? null,
        };
    }
}

export {
    saveEligibilityInput,
    checkEligibility,
    getJEligibilityBasicNavParams,
    checkEligibilityForJointApplicant,
    saveJAInput,
    removeInputFormRoutes,
    removeJAEditRoutes,
    getAddressData,
    getUIData,
};
