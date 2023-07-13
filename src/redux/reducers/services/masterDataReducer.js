import {
    MASTERDATA_LOADING,
    MASTERDATA_ERROR,
    MASTERDATA_SUCCESS,
    MASTERDATA_CLEAR,
    MASTERDATA_UPDATE_SOURCE_OF_FUND_COUNTRY,
} from "@redux/actions/services/masterDataAction";

// Reducer Default Value
const initialState = {
    status: "idle",
    error: null,
    data: null,
    branchStateData: null,
    branchStatesList: null,
    branchDistrictsList: null,
    branchList: null,
    countryOfBirth: null,
    crsStatus: null,
    employmentType: null,
    estimatedMonthlyTxnAmount: null,
    estimatedMonthlyTxnVolume: null,
    fatcaCountryList: null,
    fatcaStatus: null,
    gender: null,
    icStateCode: null,
    icTypes: null,
    incomeRange: null,
    maeResidentialCountry: null,
    permanentresidentcountry: null,
    purpose: null,
    occupation: null,
    race: null,
    residentialcountryforeigner: null,
    sector: null,
    sourceOfFundCountry: null,
    sourceOfFundOrigin: null,
    sourceOfWealthOrigin: null,
    stateData: null,
    title: null,
    maeCitizenship: null,
    zestActivationAmountNTB: null,
    m2uPremierActivationAmountNTB: null,
    zestActivationAmountETB: null,
    m2uPremierActivationAmountETB: null,
    debitCardApplicationAmount: null,
};

// Reducer
function masterDataReducer(state = initialState, action) {
    switch (action.type) {
        case MASTERDATA_LOADING:
            return {
                ...state,
                status: "loading",
            };

        case MASTERDATA_ERROR:
            return {
                ...state,
                status: "error",
                error: action.error,
            };

        case MASTERDATA_SUCCESS:
            return {
                ...state,
                status: "success",
                data: action.data,
                branchStateData: action.branchStateData,
                branchStatesList: action.branchStatesList,
                branchDistrictsList: action.branchDistrictsList,
                branchList: action.branchList,
                countryOfBirth: action.countryOfBirth,
                crsStatus: action.crsStatus,
                employmentType: action.employmentType,
                estimatedMonthlyTxnAmount: action.estimatedMonthlyTxnAmount,
                estimatedMonthlyTxnVolume: action.estimatedMonthlyTxnVolume,
                fatcaCountryList: action.fatcaCountryList,
                fatcaStatus: action.fatcaStatus,
                financialObjective: action.financialObjective,
                gender: action.gender,
                icStateCode: action.icStateCode,
                icTypes: action.icTypes,
                incomeRange: action.incomeRange,
                maeResidentialCountry: action.maeResidentialCountry,
                permanentresidentcountry: action.permanentresidentcountry,
                purpose: action.purpose,
                occupation: action.occupation,
                race: action.race,
                residentialcountryforeigner: action.residentialcountryforeigner,
                sector: action.sector,
                sourceOfFundCountry: action.sourceOfFundCountry,
                sourceOfFundOrigin: action.sourceOfFundOrigin,
                sourceOfWealthOrigin: action.sourceOfWealthOrigin,
                stateData: action.stateData,
                title: action.title,
                zestActivationAmountNTB: action.zestActivationAmountNTB,
                m2uPremierActivationAmountNTB: action.m2uPremierActivationAmountNTB,
                zestActivationAmountETB: action.zestActivationAmountETB,
                m2uPremierActivationAmountETB: action.m2uPremierActivationAmountETB,
                maeCitizenship: action.maeCitizenship,
                debitCardApplicationAmount: action.debitCardApplicationAmount,
                pm1ActivationAmountNTB: action.pm1ActivationAmountNTB,
                pm1ActivationAmountETB: action.pm1ActivationAmountETB,
                pmaActivationAmountNTB: action.pmaActivationAmountNTB,
                pmaActivationAmountETB: action.pmaActivationAmountETB,
                kawanKuActivationAmountETB: action.kawanKuActivationAmountETB,
                kawanKuActivationAmountNTB: action.kawanKuActivationAmountNTB,
                savingIActivationAmountETB: action.savingIActivationAmountETB,
                savingIActivationAmountNTB: action.savingIActivationAmountNTB,
            };

        case MASTERDATA_UPDATE_SOURCE_OF_FUND_COUNTRY:
            return {
                ...state,
                sourceOfFundCountry: action.sourceOfFundCountry,
            };

        case MASTERDATA_CLEAR:
            return {
                ...state,
                status: "idle",
                error: null,
                data: null,
                branchStateData: null,
                branchStatesList: null,
                branchDistrictsList: null,
                branchList: null,
                countryOfBirth: null,
                crsStatus: null,
                employmentType: null,
                estimatedMonthlyTxnAmount: null,
                estimatedMonthlyTxnVolume: null,
                fatcaCountryList: null,
                fatcaStatus: null,
                gender: null,
                icStateCode: null,
                icTypes: null,
                incomeRange: null,
                maeResidentialCountry: null,
                permanentresidentcountry: null,
                purpose: null,
                occupation: null,
                race: null,
                residentialcountryforeigner: null,
                sector: null,
                sourceOfFundCountry: null,
                sourceOfFundOrigin: null,
                sourceOfWealthOrigin: null,
                stateData: null,
                title: null,
                maeCitizenship: null,
                zestActivationAmountNTB: null,
                m2uPremierActivationAmountNTB: null,
                zestActivationAmountETB: null,
                m2uPremierActivationAmountETB: null,
                debitCardApplicationAmount: null,
                pm1ActivationAmountNTB: null,
                pm1ActivationAmountETB: null,
                pmaActivationAmountNTB: null,
                pmaActivationAmountETB: null,
                kawanKuActivationAmountETB: null,
                kawanKuActivationAmountNTB: null,
                savingIActivationAmountETB: null,
                savingIActivationAmountNTB: null,
            };

        default:
            return state;
    }
}

export default masterDataReducer;
