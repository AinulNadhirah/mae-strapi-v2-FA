import PropTypes from "prop-types";
import { connect } from "react-redux";

import { ASB_MASTERDATA_CLEAR } from "@redux/actions/ASBServices/masterDataAction";
import { getMasterData } from "@redux/services/ASBServices/apiMasterData";

const mapStateToProps = function (state) {
    const { masterDataReducer } = state?.asbServicesReducer;

    return {
        statusMasterData: masterDataReducer.status,
        errorMasterData: masterDataReducer.error,
        dataMasterData: masterDataReducer.data,
        branchStateData: masterDataReducer.branchStateData,
        branchStatesList: masterDataReducer.branchStatesList,
        branchDistrictsList: masterDataReducer.branchDistrictsList,
        branchList: masterDataReducer.branchList,
        countryOfBirth: masterDataReducer.countryOfBirth,
        crsStatus: masterDataReducer.crsStatus,
        employmentType: masterDataReducer.employmentType,
        estimatedMonthlyTxnAmount: masterDataReducer.estimatedMonthlyTxnAmount,
        estimatedMonthlyTxnVolume: masterDataReducer.estimatedMonthlyTxnVolume,
        fatcaCountryList: masterDataReducer.fatcaCountryList,
        fatcaStatus: masterDataReducer.fatcaStatus,
        financialObjective: masterDataReducer.financialObjective,
        gender: masterDataReducer.gender,
        icStateCode: masterDataReducer.icStateCode,
        icTypes: masterDataReducer.icTypes,
        incomeRange: masterDataReducer.incomeRange,
        maeResidentialCountry: masterDataReducer.maeResidentialCountry,
        permanentresidentcountry: masterDataReducer.permanentresidentcountry,
        purpose: masterDataReducer.purpose,
        occupation: masterDataReducer.occupation,
        race: masterDataReducer.race,
        residentialcountryforeigner: masterDataReducer.residentialcountryforeigner,
        sector: masterDataReducer.sector,
        sourceOfFundCountry: masterDataReducer.sourceOfFundCountry,
        sourceOfFundOrigin: masterDataReducer.sourceOfFundOrigin,
        sourceOfWealthOrigin: masterDataReducer.sourceOfWealthOrigin,
        stateData: masterDataReducer.stateData,
        title: masterDataReducer.title,
        maeCitizenship: masterDataReducer.maeCitizenship,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        getMasterData: () => {
            dispatch(getMasterData());
        },
        clearMasterDataReducer: () => dispatch({ type: ASB_MASTERDATA_CLEAR }),
    };
};

const masterDataStateTypes = (mapStateToProps.propTypes = {
    statusMasterData: PropTypes.string,
    errorMasterData: PropTypes.any,
    dataMasterData: PropTypes.any,
    branchStateData: PropTypes.object,
    branchStatesList: PropTypes.arrayOf(PropTypes.object),
    branchDistrictsList: PropTypes.object,
    branchList: PropTypes.arrayOf(PropTypes.object),
    countryOfBirth: PropTypes.arrayOf(PropTypes.object),
    crsStatus: PropTypes.any,
    employmentType: PropTypes.arrayOf(PropTypes.object),
    estimatedMonthlyTxnAmount: PropTypes.arrayOf(PropTypes.object),
    estimatedMonthlyTxnVolume: PropTypes.arrayOf(PropTypes.object),
    fatcaCountryList: PropTypes.arrayOf(PropTypes.object),
    fatcaStatus: PropTypes.any,
    financialObjective: PropTypes.arrayOf(PropTypes.object),
    gender: PropTypes.any,
    icStateCode: PropTypes.any,
    icTypes: PropTypes.any,
    incomeRange: PropTypes.any,
    maeResidentialCountry: PropTypes.any,
    permanentresidentcountry: PropTypes.any,
    purpose: PropTypes.arrayOf(PropTypes.object),
    occupation: PropTypes.arrayOf(PropTypes.object),
    race: PropTypes.arrayOf(PropTypes.object),
    residentialcountryforeigner: PropTypes.arrayOf(PropTypes.object),
    sector: PropTypes.arrayOf(PropTypes.object),
    sourceOfFundCountry: PropTypes.arrayOf(PropTypes.object),
    sourceOfFundOrigin: PropTypes.arrayOf(PropTypes.object),
    sourceOfWealthOrigin: PropTypes.arrayOf(PropTypes.object),
    stateData: PropTypes.arrayOf(PropTypes.object),
    title: PropTypes.arrayOf(PropTypes.object),
    maeCitizenship: PropTypes.arrayOf(PropTypes.object),
});

const masterDataDispatchTypes = (mapDispatchToProps.propTypes = {
    getMasterData: PropTypes.func,
    clearMasterDataReducer: PropTypes.func,
});

export const masterDataServicePropTypes = {
    ...masterDataStateTypes,
    ...masterDataDispatchTypes,
};

const masterDataServiceProps = connect(mapStateToProps, mapDispatchToProps);
export default masterDataServiceProps;
