import { showErrorToast } from "@components/Toast";

import { getMasterDataService } from "@services";

import {
    ASB_MASTERDATA_LOADING,
    ASB_MASTERDATA_ERROR,
    ASB_MASTERDATA_SUCCESS,
} from "@redux/actions/ASBServices/masterDataAction";

import { COMMON_ERROR_MSG } from "@constants/strings";

export const getMasterData = (callback) => {
    return async (dispatch) => {
        try {
            dispatch({ type: ASB_MASTERDATA_LOADING });

            const response = await getMasterDataService(true);

            const result = response?.data?.result;
            // console.log("apiMasterData--> ", result);
            if (result) {
                // console.log("apiMasterData--> allState", result.allState);
                const branchStateData = result.branchStateData;
                const branchStatesList = branchStatesScrollPickerData(
                    result?.branchStateData?.statesList
                );
                const branchDistrictsList = result?.branchStateData?.states?.district;
                const branchList = result?.branchStateData?.states?.states;
                const countryOfBirth = result.countryOfBirth;
                const crsStatus = result.crsStatus;
                const estimatedMonthlyTxnAmount = result.estimatedMonthlyTxnAmount;
                const estimatedMonthlyTxnVolume = result.estimatedMonthlyTxnVolume;
                const fatcaCountryList = result.fatcaCountryList;
                const fatcaStatus = result.fatcaStatus;
                const financialObjective = scrollPickerData(result.financialObjective);
                const gender = result.gender;
                const icStateCode = result.icStateCode;
                const icTypes = result.icTypes;
                const incomeRange = scrollPickerData(result.incomeRange);
                const maeResidentialCountry = scrollPickerData(result.maeResidentialCountry);
                const permanentresidentcountry = result.permanentresidentcountry;
                const purpose = scrollPickerData(result.purpose);
                const race = scrollPickerData(result.race);
                const residentialcountryforeigner = scrollPickerData(
                    result.residentialcountryforeigner
                );
                const occupationSectorData = getCombinedData(
                    result?.occupationSectorlowestleafflag,
                    result.occupationSector
                );
                const sector = occupationSectorData ?? result.occupationSector;
                const sourceOfFundCountry = result.sourceOfFundCountry;
                const sourceOfFundOrigin = result.sourceOfFundOrigin;
                const sourceOfWealthOrigin = result.sourceOfWealthOrigin;
                const stateData = scrollPickerData(result.stateData);
                const title = scrollPickerData(result.title);
                const maeCitizenship = scrollPickerData(result.maeCitizenship);
                const article = result.article;
                const state = result.state;
                const zone = result.districtList;
                const branch = result.branch;
                const noofcertificates = result.noofcertificates;
                const tenure = result.tenure;
                const education = result.education;
                const maritalStatus = result.maritalStatus;
                const country = result.country;
                const personalInfoRace = result.race;
                const occupationData = getCombinedData(
                    result?.occupationLowestleafflag,
                    result?.occupation
                );

                const occupation = occupationData ?? result.occupation;
                const yearsOfInvestment = result.yearsOfInvestment;
                const employementTypeData = getCombinedData(
                    result.employmentTypelowestleafflag,
                    result.employmentType
                );
                const employmentType = employementTypeData ?? result.employmentType;
                const employeeDurationMonths = result.employeeDurationMonths;
                const employeeDurationYrs = result.employeeDurationYrs;
                const bonusType = result.bonusType;
                const allState = result.allState;
                const relationshipList = scrollPickerRelationshipData(result.relationshipList);
                const tenureList = tenureListScrollPickerData(result.bonusType);
                const occupationLowestleafflag = result.occupationLowestleafflag;
                const occupationSectorlowestleafflag = result.occupationSectorlowestleafflag;
                const employmentTypelowestleafflag = result.employmentTypelowestleafflag;
                dispatch({
                    type: ASB_MASTERDATA_SUCCESS,
                    data: result,
                    branchStateData,
                    branchStatesList,
                    branchDistrictsList,
                    branchList,
                    countryOfBirth,
                    crsStatus,
                    employmentType,
                    estimatedMonthlyTxnAmount,
                    estimatedMonthlyTxnVolume,
                    fatcaCountryList,
                    fatcaStatus,
                    financialObjective,
                    gender,
                    icStateCode,
                    icTypes,
                    incomeRange,
                    maeResidentialCountry,
                    permanentresidentcountry,
                    purpose,
                    occupation,
                    race,
                    residentialcountryforeigner,
                    sector,
                    sourceOfFundCountry,
                    sourceOfFundOrigin,
                    sourceOfWealthOrigin,
                    stateData,
                    title,
                    maeCitizenship,
                    article,
                    state,
                    zone,
                    branch,
                    noofcertificates,
                    tenure,
                    education,
                    maritalStatus,
                    country,
                    personalInfoRace,
                    yearsOfInvestment,
                    employeeDurationMonths,
                    employeeDurationYrs,
                    bonusType,
                    allState,
                    relationshipList,
                    tenureList,
                    occupationLowestleafflag,
                    occupationSectorlowestleafflag,
                    employmentTypelowestleafflag,
                });
                if (callback) {
                    callback(result);
                }
            } else {
                showErrorToast({
                    message: result?.statusDescription || result?.statusDesc || COMMON_ERROR_MSG,
                });
            }
        } catch (error) {
            // console.log("[ZestCASA][getMasterData] >> Failure");
            console.log("error -->", error);
            dispatch({ type: ASB_MASTERDATA_ERROR, error });
        }
    };
};

const scrollPickerData = (data) => {
    return data?.map((obj) => {
        const { display, value } = obj;
        return {
            name: display,
            value,
        };
    });
};

const getCombinedData = (data, result) => {
    const leafItem = result.map((item) => {
        return { ...item, leafFlag: 1 };
    });

    const leafItem1 = data.map((item) => {
        return { ...item, leafFlag: 0 };
    });

    const combinedData = [...leafItem, ...leafItem1];

    combinedData?.sort((a, b) => a.name.localeCompare(b.name));

    return combinedData;
};

const scrollPickerRelationshipData = (data) => {
    return data?.map((obj) => {
        const { name, value } = obj;
        return {
            name: value,
            value: name,
        };
    });
};

const branchStatesScrollPickerData = (data) => {
    return data?.map((obj) => {
        const { stateId, stateName } = obj;
        return {
            name: stateName,
            value: stateId,
        };
    });
};

const tenureListScrollPickerData = (data) => {
    const arr = [];
    if (data && data.length > 0) {
        let tenureList = data[0]?.value;
        tenureList = tenureList.split(",");
        const len = tenureList.length;
        for (let i = 0; i < len; i++) {
            arr.push({
                name: tenureList[i],
                value: tenureList[i],
            });
        }
    }
    return arr;
};
