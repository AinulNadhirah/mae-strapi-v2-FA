import { fetchMasterDataService } from "@services/apiServiceZestCASA";

import {
    MASTERDATA_LOADING,
    MASTERDATA_ERROR,
    MASTERDATA_SUCCESS,
} from "@redux/actions/services/masterDataAction";

export const getMasterData = () => {
    return async (dispatch) => {
        dispatch({ type: MASTERDATA_LOADING });

        try {
            const response = await fetchMasterDataService();
            console.log("[ZestCASA][getMasterData] >> Success");
            const result = response.data.result;
            // console.log(result);

            if (result) {
                const branchStateData = result.branchStateData;
                const branchStatesList = branchStatesScrollPickerData(
                    result.branchStateData.statesList
                );
                const branchDistrictsList = result.branchStateData.states.district;
                const branchList = result.branchStateData.states.states;
                const countryOfBirth = result.countryOfBirth;
                const crsStatus = result.crsStatus;
                const employmentType = scrollPickerData(result.employmentType);
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
                const occupation = scrollPickerData(result.occupation);
                const race = scrollPickerData(result.race);
                const residentialcountryforeigner = scrollPickerData(
                    result.residentialcountryforeigner
                );
                const sector = scrollPickerData(result.sector);
                const sourceOfFundCountry = result.sourceOfFundCountry;
                const sourceOfFundOrigin = result.sourceOfFundOrigin;
                const sourceOfWealthOrigin = result.sourceOfWealthOrigin;
                const stateData = scrollPickerData(result.stateData);
                const title = scrollPickerData(result.title);
                const maeCitizenship = scrollPickerData(result.maeCitizenship);
                const zestActivationAmountNTB = result.zestActivationAmountNTB;
                const m2uPremierActivationAmountNTB = result.m2uPremierActivationAmountNTB;
                const zestActivationAmountETB = result.zestActivationAmountETB;
                const m2uPremierActivationAmountETB = result.m2uPremierActivationAmountETB;

                dispatch({
                    type: MASTERDATA_SUCCESS,
                    data: result,
                    branchStateData: branchStateData,
                    branchStatesList: branchStatesList,
                    branchDistrictsList: branchDistrictsList,
                    branchList: branchList,
                    countryOfBirth: countryOfBirth,
                    crsStatus: crsStatus,
                    employmentType: employmentType,
                    estimatedMonthlyTxnAmount: estimatedMonthlyTxnAmount,
                    estimatedMonthlyTxnVolume: estimatedMonthlyTxnVolume,
                    fatcaCountryList: fatcaCountryList,
                    fatcaStatus: fatcaStatus,
                    financialObjective: financialObjective,
                    gender: gender,
                    icStateCode: icStateCode,
                    icTypes: icTypes,
                    incomeRange: incomeRange,
                    maeResidentialCountry: maeResidentialCountry,
                    permanentresidentcountry: permanentresidentcountry,
                    purpose: purpose,
                    occupation: occupation,
                    race: race,
                    residentialcountryforeigner: residentialcountryforeigner,
                    sector: sector,
                    sourceOfFundCountry: sourceOfFundCountry,
                    sourceOfFundOrigin: sourceOfFundOrigin,
                    sourceOfWealthOrigin: sourceOfWealthOrigin,
                    stateData: stateData,
                    title: title,
                    maeCitizenship: maeCitizenship,
                    zestActivationAmountNTB: zestActivationAmountNTB,
                    m2uPremierActivationAmountNTB: m2uPremierActivationAmountNTB,
                    zestActivationAmountETB: zestActivationAmountETB,
                    m2uPremierActivationAmountETB: m2uPremierActivationAmountETB,
                    debitCardApplicationAmount: result?.debitCardApplicationAmount,
                });
            }
        } catch (error) {
            console.log("[ZestCASA][getMasterData] >> Failure");
            dispatch({ type: MASTERDATA_ERROR, error: error });
        }
    };
};

const scrollPickerData = (data) => {
    return data.map((obj) => {
        const { display, value } = obj;
        return {
            name: display,
            value,
        };
    });
};

const branchStatesScrollPickerData = (data) => {
    return data.map((obj) => {
        const { stateId, stateName } = obj;
        return {
            name: stateName,
            value: stateId,
        };
    });
};
