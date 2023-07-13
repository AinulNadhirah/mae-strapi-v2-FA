import { fetchMasterDataServicePremier } from "@services/apiServicePremier";

import {
    MASTERDATA_LOADING,
    MASTERDATA_ERROR,
    MASTERDATA_SUCCESS
} from "@redux/actions/services/masterDataAction";

export const getMasterDataPremier = () => {
    return async (dispatch) => {
        dispatch({ type: MASTERDATA_LOADING });

        try {
            const response = await fetchMasterDataServicePremier();
            console.log("[PM1][getMasterData] >> Success");
            
            const result = response?.result;

            if (result) {
                dispatch({
                    type: MASTERDATA_SUCCESS,
                    data: result,
                    branchStateData: result?.branchStateData,
                    branchStatesList: branchStatesScrollPickerData(
                        result?.branchStateData.statesList
                    ),
                    branchDistrictsList: result?.branchStateData.states.district,
                    branchList: result?.branchStateData.states.states,
                    countryOfBirth: result?.countryOfBirth,
                    crsStatus: result?.crsStatus,
                    employmentType: scrollPickerData(result?.employmentType),
                    estimatedMonthlyTxnAmount: result?.estimatedMonthlyTxnAmount,
                    estimatedMonthlyTxnVolume: result?.estimatedMonthlyTxnVolume,
                    fatcaCountryList: result?.fatcaCountryList,
                    fatcaStatus: result?.fatcaStatus,
                    financialObjective: scrollPickerData(result?.financialObjective),
                    gender: result?.gender,
                    icStateCode: result?.icStateCode,
                    icTypes: result?.icTypes,
                    incomeRange: scrollPickerData(result?.incomeRange),
                    maeResidentialCountry:
                        result?.maeResidentialCountry &&
                        scrollPickerData(result?.maeResidentialCountry),
                    permanentresidentcountry: result?.permanentresidentcountry,
                    purpose: scrollPickerData(result?.purpose),
                    occupation: scrollPickerData(result?.occupation),
                    race: scrollPickerData(result?.race),
                    residentialcountryforeigner: scrollPickerData(
                        result?.residentialcountryforeigner
                    ),
                    sector: scrollPickerData(result?.sector),
                    sourceOfFundCountry: result?.sourceOfFundCountry,
                    sourceOfFundOrigin: result?.sourceOfFundOrigin,
                    sourceOfWealthOrigin: result?.sourceOfWealthOrigin,
                    stateData: scrollPickerData(result?.stateData),
                    title: scrollPickerData(result?.title),
                    maeCitizenship:
                        result?.maeCitizenship && scrollPickerData(result?.maeCitizenship),
                    pm1ActivationAmountNTB: result?.pm1ActivationAmountNTB,
                    pmaActivationAmountNTB: result?.pmaActivationAmountNTB,
                    pm1ActivationAmountETB: result?.pm1ActivationAmountETB,
                    pmaActivationAmountETB: result?.pmaActivationAmountETB,
                    kawanKuActivationAmountETB: result?.kawanKuActivationAmountETB,
                    kawanKuActivationAmountNTB: result?.kawanKuActivationAmountNTB,
                    savingIActivationAmountETB: result?.savingIActivationAmountETB,
                    savingIActivationAmountNTB: result?.savingIActivationAmountNTB,
                    debitCardApplicationAmount: result?.debitCardApplicationAmount,
                    zestActivationAmountNTB: result?.zestActivationAmountNTB,
                    m2uPremierActivationAmountNTB: result?.m2uPremierActivationAmountNTB,
                    zestActivationAmountETB: result?.zestActivationAmountETB,
                    m2uPremierActivationAmountETB: result?.m2uPremierActivationAmountETB,
                });
            }
        } catch (error) {
            console.log("[PM1][getMasterData] >> Failure");
            dispatch({ type: MASTERDATA_ERROR, error });
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
