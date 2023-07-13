import PropTypes from "prop-types";
import { connect } from "react-redux";

import { ASB_GUARANTOR_PREPOSTQUAL_CLEAR } from "@redux/actions/ASBServices/asbGuarantorPrePostQualAction";
import { asbPrePostQualGuarantor } from "@redux/services/ASBServices/asbApiPrePostQualGuarantor";

const mapStateToProps = function (state) {
    const { asbGuarantorPrePostQualReducer } = state.asbServicesReducer;

    return {
        data: asbGuarantorPrePostQualReducer.data,
        statusCode: asbGuarantorPrePostQualReducer.statusCode,
        statusDesc: asbGuarantorPrePostQualReducer.statusDesc,
        pan: asbGuarantorPrePostQualReducer.pan,
        isStaff: asbGuarantorPrePostQualReducer.isStaff,
        addr1: asbGuarantorPrePostQualReducer.addr1,
        addr2: asbGuarantorPrePostQualReducer.addr2,
        addr3: asbGuarantorPrePostQualReducer.addr3,
        addr4: asbGuarantorPrePostQualReducer.addr4,
        birthDate: asbGuarantorPrePostQualReducer.birthDate,
        bodInd: asbGuarantorPrePostQualReducer.bodInd,
        branchApprovalStatusCode: asbGuarantorPrePostQualReducer.branchApprovalStatusCode,
        city: asbGuarantorPrePostQualReducer.city,
        custStatus: asbGuarantorPrePostQualReducer.custStatus,
        customerName: asbGuarantorPrePostQualReducer.customerName,
        customerRiskRating: asbGuarantorPrePostQualReducer.customerRiskRating,
        deChequeHostStatus: asbGuarantorPrePostQualReducer.deChequeHostStatus,
        emailAddress: asbGuarantorPrePostQualReducer.emailAddress,
        empType: asbGuarantorPrePostQualReducer.empType,
        empTypeValue: asbGuarantorPrePostQualReducer.empTypeValue,
        employerName: asbGuarantorPrePostQualReducer.employerName,
        finanicalObjective: asbGuarantorPrePostQualReducer.finanicalObjective,
        gcif: asbGuarantorPrePostQualReducer.gcif,
        genderCode: asbGuarantorPrePostQualReducer.genderCode,
        genderValue: asbGuarantorPrePostQualReducer.genderValue,
        idNo: asbGuarantorPrePostQualReducer.idNo,
        idType: asbGuarantorPrePostQualReducer.idType,
        localCifNo: asbGuarantorPrePostQualReducer.localCifNo,
        m2uAccessNo: asbGuarantorPrePostQualReducer.m2uAccessNo,
        m2uIndicator: asbGuarantorPrePostQualReducer.m2uIndicator,
        maeInd: asbGuarantorPrePostQualReducer.maeInd,
        mobileNo: asbGuarantorPrePostQualReducer.mobileNo,
        monthlyIncomeRange: asbGuarantorPrePostQualReducer.monthlyIncomeRange,
        monthlyIncomeRangeValue: asbGuarantorPrePostQualReducer.monthlyIncomeRangeValue,
        nationality: asbGuarantorPrePostQualReducer.nationality,
        occupationCode: asbGuarantorPrePostQualReducer.occupationCode,
        occupationValue: asbGuarantorPrePostQualReducer.occupationValue,
        onBoardingStatusInfo: asbGuarantorPrePostQualReducer.onBoardingStatusInfo,
        onboardingIndicatorCode: asbGuarantorPrePostQualReducer.onboardingIndicatorCode,
        onlineRegUrl: asbGuarantorPrePostQualReducer.onlineRegUrl,
        pep: asbGuarantorPrePostQualReducer.pep,
        postCode: asbGuarantorPrePostQualReducer.postCode,
        preferredBRDistrict: asbGuarantorPrePostQualReducer.preferredBRDistrict,
        preferredBRState: asbGuarantorPrePostQualReducer.preferredBRState,
        preferredBranch: asbGuarantorPrePostQualReducer.preferredBranch,
        purpose: asbGuarantorPrePostQualReducer.purpose,
        purposeValue: asbGuarantorPrePostQualReducer.purposeValue,
        raceCode: asbGuarantorPrePostQualReducer.raceCode,
        raceValue: asbGuarantorPrePostQualReducer.raceValue,
        resumeStageInd: asbGuarantorPrePostQualReducer.resumeStageInd,
        rsaIndicator: asbGuarantorPrePostQualReducer.rsaIndicator,
        saDailyInd: asbGuarantorPrePostQualReducer.saDailyInd,
        saFormInvestmentExp: asbGuarantorPrePostQualReducer.saFormInvestmentExp,
        saFormInvestmentNature: asbGuarantorPrePostQualReducer.saFormInvestmentNature,
        saFormInvestmentRisk: asbGuarantorPrePostQualReducer.saFormInvestmentRisk,
        saFormInvestmentTerm: asbGuarantorPrePostQualReducer.saFormInvestmentTerm,
        saFormPIDM: asbGuarantorPrePostQualReducer.saFormPIDM,
        saFormProductFeature: asbGuarantorPrePostQualReducer.saFormProductFeature,
        saFormSecurities: asbGuarantorPrePostQualReducer.saFormSecurities,
        saFormSuitability: asbGuarantorPrePostQualReducer.saFormSuitability,
        saTermInd: asbGuarantorPrePostQualReducer.saTermInd,
        screeningStatus: asbGuarantorPrePostQualReducer.screeningStatus,
        sector: asbGuarantorPrePostQualReducer.sector,
        sectorValue: asbGuarantorPrePostQualReducer.sectorValue,
        staffInd: asbGuarantorPrePostQualReducer.staffInd,
        state: asbGuarantorPrePostQualReducer.state,
        stateValue: asbGuarantorPrePostQualReducer.stateValue,
        stateCode: asbGuarantorPrePostQualReducer.stateCode,
        universalCifNo: asbGuarantorPrePostQualReducer.universalCifNo,
        title: asbGuarantorPrePostQualReducer.title,
        sourceOfFund: asbGuarantorPrePostQualReducer.sourceOfFund,
        sourceOfFundValue: asbGuarantorPrePostQualReducer.sourceOfFundValue,
        viewPartyResult: asbGuarantorPrePostQualReducer.viewPartyResult,
        requestMsgRefNo: asbGuarantorPrePostQualReducer.requestMsgRefNo,
        mainStpReferenceNo: asbGuarantorPrePostQualReducer.mainStpReferenceNo,

        country: asbGuarantorPrePostQualReducer.country,
        countryCode: asbGuarantorPrePostQualReducer.countryCode,
        mobCountryCode: asbGuarantorPrePostQualReducer.mobCountryCode,
        mobAreaCode: asbGuarantorPrePostQualReducer.mobAreaCode,
        religionCode: asbGuarantorPrePostQualReducer.religionCode,
        religionValue: asbGuarantorPrePostQualReducer.religionValue,
        employmentTypeCode: asbGuarantorPrePostQualReducer.employmentTypeCode,
        employmentTypeValue: asbGuarantorPrePostQualReducer.employmentTypeValue,
        occupationSectorCode: asbGuarantorPrePostQualReducer.occupationSectorCode,
        occupationSectorValue: asbGuarantorPrePostQualReducer.occupationSectorValue,
        nameOfEmployer: asbGuarantorPrePostQualReducer.nameOfEmployer,
        salutationCode: asbGuarantorPrePostQualReducer.salutationCode,
        salutationValue: asbGuarantorPrePostQualReducer.salutationValue,
        dateOfBirth: asbGuarantorPrePostQualReducer.dateOfBirth,
        addressType: asbGuarantorPrePostQualReducer.addressType,
        grossIncome: asbGuarantorPrePostQualReducer.grossIncome,
        stpreferenceNo: asbGuarantorPrePostQualReducer.stpreferenceNo,
        lastUpdatedDate: asbGuarantorPrePostQualReducer.lastUpdatedDate,
        unitHolderId: asbGuarantorPrePostQualReducer.unitHolderId,
        idTypeCode: asbGuarantorPrePostQualReducer.idTypeCode,
        maritalStatus: asbGuarantorPrePostQualReducer.maritalStatus,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        asbPrePostQualGuarantor: (
            url,
            data,
            callback,
            mainApplicantName,
            needCallbackInException = false,
            isGuarantor = false
        ) => {
            dispatch(
                asbPrePostQualGuarantor(
                    url,
                    data,
                    callback,
                    mainApplicantName,
                    needCallbackInException,
                    isGuarantor
                )
            );
        },
        clearASBGuarantorPrePostReducer: () => dispatch({ type: ASB_GUARANTOR_PREPOSTQUAL_CLEAR }),
    };
};

const guarantorPrePostQualDispatchTypes = (mapDispatchToProps.propTypes = {
    asbPrePostQualGuarantor: PropTypes.func,
    clearASBGuarantorPrePostReducer: PropTypes.func,
});

export const guarantorPrePostQualServicePropTypes = {
    ...guarantorPrePostQualDispatchTypes,
};

const guarantorPrePostQualConnector = connect(mapStateToProps, mapDispatchToProps);
export default guarantorPrePostQualConnector;
