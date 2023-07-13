import PropTypes from "prop-types";
import { connect } from "react-redux";

import {
    PREPOSTQUAL_CLEAR,
    PREPOSTQUAL_UPDATE_USER_STATUS,
} from "@redux/actions/services/prePostQualAction";
import { prePostQualPremier } from "@redux/services/Premier/apiPrePostQual";
import { prePostQual } from "@redux/services/apiPrePostQual";

const mapStateToProps = function (state) {
    const { prePostQualReducer } = state;

    return {
        statusPrePostQual: prePostQualReducer.status,
        errorPrePostQual: prePostQualReducer.error,
        dataPrePostQual: prePostQualReducer.data,
        custStatus: prePostQualReducer.custStatus,
        m2uIndicator: prePostQualReducer.m2uIndicator,
        idNo: prePostQualReducer.idNo,
        mobileNo: prePostQualReducer.mobileNo,
        addr1: prePostQualReducer.addr1,
        addr2: prePostQualReducer.addr2,
        addr3: prePostQualReducer.addr3,
        addr4: prePostQualReducer.addr4,
        idType: prePostQualReducer.idType,
        birthDate: prePostQualReducer.birthDate,
        customerName: prePostQualReducer.customerName,
        postCode: prePostQualReducer.postCode,
        m2uAccessNo: prePostQualReducer.m2uAccessNo,
        gcif: prePostQualReducer.gcif,
        onlineRegUrl: prePostQualReducer.onlineRegUrl,
        maeInd: prePostQualReducer.maeInd,
        resumeStageInd: prePostQualReducer.resumeStageInd,
        rsaIndicator: prePostQualReducer.rsaIndicator,
        localCifNo: prePostQualReducer.localCifNo,
        universalCifNo: prePostQualReducer.universalCifNo,
        customerRiskRating: prePostQualReducer.customerRiskRating,
        screeningStatus: prePostQualReducer.screeningStatus,
        title: prePostQualReducer.title,
        nationality: prePostQualReducer.nationality,
        bodInd: prePostQualReducer.bodInd,
        staffInd: prePostQualReducer.staffInd,
        saDailyInd: prePostQualReducer.saDailyInd,
        saTermInd: prePostQualReducer.saTermInd,
        deChequeHostStatus: prePostQualReducer.deChequeHostStatus,
        onBoardingStatusInfo: prePostQualReducer.onBoardingStatusInfo,
        onboardingIndicatorCode: prePostQualReducer.onboardingIndicatorCode,
        emailAddress: prePostQualReducer.emailAddress,
        pep: prePostQualReducer.pep,
        gender: prePostQualReducer.gender,
        race: prePostQualReducer.race,
        state: prePostQualReducer.state,
        stateValue: prePostQualReducer.stateValue,
        city: prePostQualReducer.city,
        empType: prePostQualReducer.empType,
        empTypeValue: prePostQualReducer.empTypeValue,
        employerName: prePostQualReducer.employerName,
        occupation: prePostQualReducer.occupation,
        occupationValue: prePostQualReducer.occupationValue,
        sector: prePostQualReducer.sector,
        sectorValue: prePostQualReducer.sectorValue,
        monthlyIncomeRange: prePostQualReducer.monthlyIncomeRange,
        monthlyIncomeRangeValue: prePostQualReducer.monthlyIncomeRangeValue,
        purpose: prePostQualReducer.purpose,
        purposeValue: prePostQualReducer.purposeValue,
        preferredBRState: prePostQualReducer.preferredBRState,
        preferredBRDistrict: prePostQualReducer.preferredBRDistrict,
        preferredBranch: prePostQualReducer.preferredBranch,
        finanicalObjective: prePostQualReducer.finanicalObjective,
        saFormSecurities: prePostQualReducer.saFormSecurities,
        saFormInvestmentRisk: prePostQualReducer.saFormInvestmentRisk,
        saFormInvestmentExp: prePostQualReducer.saFormInvestmentExp,
        saFormInvestmentNature: prePostQualReducer.saFormInvestmentNature,
        saFormInvestmentTerm: prePostQualReducer.saFormInvestmentTerm,
        saFormProductFeature: prePostQualReducer.saFormProductFeature,
        saFormPIDM: prePostQualReducer.saFormPIDM,
        saFormSuitability: prePostQualReducer.saFormSuitability,
        userStatus: prePostQualReducer.userStatus,
        txRefNo: prePostQualReducer.txRefNo,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        prePostQual: (url, data, callback) => {
            dispatch(prePostQual(url, data, callback));
        },
        prePostQualPremier: (url, data, callback) => {
            dispatch(prePostQualPremier(url, data, callback));
        },
        clearPrePostReducer: () => dispatch({ type: PREPOSTQUAL_CLEAR }),

        updateUserStatus: (userStatus) =>
            dispatch({
                type: PREPOSTQUAL_UPDATE_USER_STATUS,
                userStatus,
            }),
    };
};

const prePostQualStateTypes = (mapStateToProps.propTypes = {
    statusPrePostQual: PropTypes.string,
    errorPrePostQual: PropTypes.string,
    dataPrePostQual: PropTypes.object,
    custStatus: PropTypes.string,
    m2uIndicator: PropTypes.string,
    idNo: PropTypes.string,
    mobileNo: PropTypes.string,
    addr1: PropTypes.string,
    addr2: PropTypes.string,
    addr3: PropTypes.string,
    addr4: PropTypes.string,
    idType: PropTypes.string,
    birthDate: PropTypes.string,
    customerName: PropTypes.string,
    postCode: PropTypes.string,
    m2uAccessNo: PropTypes.string,
    gcif: PropTypes.string,
    onlineRegUrl: PropTypes.string,
    maeInd: PropTypes.string,
    resumeStageInd: PropTypes.string,
    rsaIndicator: PropTypes.string,
    localCifNo: PropTypes.string,
    universalCifNo: PropTypes.string,
    customerRiskRating: PropTypes.string,
    screeningStatus: PropTypes.string,
    title: PropTypes.string,
    nationality: PropTypes.string,
    bodInd: PropTypes.string,
    staffInd: PropTypes.string,
    saDailyInd: PropTypes.string,
    saTermInd: PropTypes.string,
    deChequeHostStatus: PropTypes.string,
    onBoardingStatusInfo: PropTypes.string,
    onboardingIndicatorCode: PropTypes.string,
    emailAddress: PropTypes.string,
    pep: PropTypes.string,
    gender: PropTypes.string,
    race: PropTypes.string,
    state: PropTypes.string,
    stateValue: PropTypes.string,
    city: PropTypes.string,
    empType: PropTypes.string,
    empTypeValue: PropTypes.string,
    employerName: PropTypes.string,
    occupation: PropTypes.string,
    occupationValue: PropTypes.string,
    sector: PropTypes.string,
    sectorValue: PropTypes.string,
    monthlyIncomeRange: PropTypes.string,
    monthlyIncomeRangeValue: PropTypes.string,
    purpose: PropTypes.string,
    purposeValue: PropTypes.string,
    preferredBRState: PropTypes.string,
    preferredBRDistrict: PropTypes.string,
    preferredBranch: PropTypes.string,
    finanicalObjective: PropTypes.string,
    saFormSecurities: PropTypes.string,
    saFormInvestmentRisk: PropTypes.string,
    saFormInvestmentExp: PropTypes.string,
    saFormInvestmentNature: PropTypes.string,
    saFormInvestmentTerm: PropTypes.string,
    saFormProductFeature: PropTypes.string,
    saFormPIDM: PropTypes.string,
    saFormSuitability: PropTypes.string,
    userStatus: PropTypes.string,
    txRefNo: PropTypes.string,
});

const prePostQualDispatchTypes = (mapDispatchToProps.propTypes = {
    prePostQual: PropTypes.func,
    clearPrePostReducer: PropTypes.func,
    updateUserStatus: PropTypes.func,
});

export const prePostQualServicePropTypes = {
    ...prePostQualStateTypes,
    ...prePostQualDispatchTypes,
};

const prePostQualServiceProps = connect(mapStateToProps, mapDispatchToProps);
export default prePostQualServiceProps;
