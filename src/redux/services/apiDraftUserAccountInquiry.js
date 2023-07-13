import { showErrorToast } from "@components/Toast";

import { draftUserAccountInquiryService } from "@services/apiServiceZestCASA";

import {
    DRAFT_USER_ACCOUNT_INQUIRY_LOADING,
    DRAFT_USER_ACCOUNT_INQUIRY_ERROR,
    DRAFT_USER_ACCOUNT_INQUIRY_SUCCESS,
} from "@redux/actions/services/draftUserAccountInquiryAction";

import { COMMON_ERROR_MSG } from "@constants/strings";

export const draftUserAccountInquiry = (subUrl, dataReducer, callback, isZestI, m2uIndicator) => {
    return async (dispatch) => {
        dispatch({ type: DRAFT_USER_ACCOUNT_INQUIRY_LOADING });

        try {
            const response = await draftUserAccountInquiryService(subUrl, dataReducer);
            const result = response?.data?.result;
            const statusCode = result?.statusCode ?? null;
            const statusDesc = result?.statusDesc ?? null;
            console.log("[ZestCASA][draftUserAccountInquiry] >> Success");

            if (statusCode === "0000" && result) {
                const isZestIValue = isZestI ?? result.isZestI;
                const m2uIndicatorValue = m2uIndicator ?? result.m2uIndicator;

                dispatch({
                    type: DRAFT_USER_ACCOUNT_INQUIRY_SUCCESS,
                    accessNo: result.accessNo,
                    addr1: result.addr1,
                    addr2: result.addr2,
                    addr3: result.addr3,
                    addr4: result.addr4,
                    birthDate: result.birthDate,
                    bodInd: result.bodInd,
                    branchApprovalStatusCode: result.branchApprovalStatusCode,
                    city: result.city,
                    customerName: result.customerName,
                    custStatus: result.custStatus,
                    data: result.data,
                    deChequeHostStatus: result.deChequeHostStatus,
                    ekycDone: result.ekycDone,
                    emailAddress: result.emailAddress,
                    employerName: result.employerName,
                    empType: result.empType,
                    empTypeValue: result.empTypeValue,
                    finanicalObjective: result.finanicalObjective,
                    gcif: result.gcif,
                    gender: result.gender,
                    idNo: result.idNo,
                    idType: result.idType,
                    isZestI: isZestIValue,
                    localCifNo: result.localCifNo,
                    m2uAccessNo: result.m2uAccessNo,
                    m2uIndicator: m2uIndicatorValue,
                    maeInd: result.maeInd,
                    mobileNo: result.mobileNo,
                    monthlyIncomeRange: result.monthlyIncomeRange,
                    monthlyIncomeRangeValue: result.monthlyIncomeRangeValue,
                    nationality: result.nationality,
                    occupation: result.occupation,
                    occupationValue: result.occupationValue,
                    onboardingIndicatorCode: result.onboardingIndicatorCode,
                    onBoardingStatusInfo: result.onBoardingStatusInfo,
                    onlineRegUrl: result.onlineRegUrl,
                    pep: result.pep,
                    postCode: result.postCode,
                    preferredBranch: result.preferredBranch,
                    preferredBRDistrict: result.preferredBRDistrict,
                    preferredBRState: result.preferredBRState,
                    purpose: result.purpose,
                    purposeValue: result.purposeValue,
                    race: result.race,
                    resumeStageInd: result.resumeStageInd,
                    rsaIndicator: result.rsaIndicator,
                    saDailyInd: result.saDailyInd,
                    saFormInvestmentExp: result.saFormInvestmentExp,
                    saFormInvestmentNature: result.saFormInvestmentNature,
                    saFormInvestmentRisk: result.saFormInvestmentRisk,
                    saFormInvestmentTerm: result.saFormInvestmentTerm,
                    saFormPIDM: result.saFormPIDM,
                    saFormProductFeature: result.saFormProductFeature,
                    saFormSecurities: result.saFormSecurities,
                    saFormSuitability: result.saFormSuitability,
                    saTermInd: result.saTermInd,
                    scorePartyResult: result.scorePartyResult,
                    screeningStatus: result.screeningStatus,
                    sector: result.sector,
                    sectorValue: result.sectorValue,
                    sourceOfFund: result.sourceOfFund,
                    sourceOfFundValue: result.sourceOfFundValue,
                    staffInd: result.staffInd,
                    state: result.state,
                    stateValue: result.stateValue,
                    statusCode: result.statusCode,
                    statusDesc: result.statusDesc,
                    title: result.title,
                    universalCifNo: result.universalCifNo,
                    viewPartyResult: result.viewPartyResult,
                    screeningId: result?.screeningId,
                    customerRiskRating: result?.scorePartyResult?.customerRiskRating,
                    customerRiskRatingValue: result?.scorePartyResult?.customerRiskRatingValue,
                    sanctionsTagging: result?.scorePartyResult?.sanctionsTagging,
                    sanctionsTaggingValue: result?.scorePartyResult?.sanctionsTaggingValue,
                    assessmentId: result?.scorePartyResult?.assessmentId,
                    hasDebitCard: result?.hasDebitCard,
                    numOfWatchlistHits: result?.scorePartyResult?.numOfWatchlistHits,
                });
                if (callback) {
                    callback(result, null, result?.custStatus);
                }
            } else {
                console.log("[ZestCASA][draftUserAccountInquiry] >> Failure");

                if (callback) {
                    callback(null, statusDesc);
                }

                showErrorToast({
                    message: statusDesc || COMMON_ERROR_MSG,
                });
                dispatch({
                    type: DRAFT_USER_ACCOUNT_INQUIRY_ERROR,
                    error: statusDesc ?? COMMON_ERROR_MSG,
                });
            }
        } catch (error) {
            console.log("[ZestCASA][draftUserAccountInquiry] >> Failure2");
            console.log(error);
            const errorFromMAE = error?.error;

            const errorCode = errorFromMAE?.code;

            if (errorCode !== 4994) {
                showErrorToast({
                    message: errorFromMAE?.message || COMMON_ERROR_MSG,
                });
            }

            if (callback) {
                callback(null, errorFromMAE);
            }

            dispatch({ type: DRAFT_USER_ACCOUNT_INQUIRY_ERROR, error: error });
        }
    };
};
