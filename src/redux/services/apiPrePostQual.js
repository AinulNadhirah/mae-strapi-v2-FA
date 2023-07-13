import { identifyUserStatus } from "@screens/ZestCASA/helpers/ZestHelpers";

import { showErrorToast } from "@components/Toast";

import { prePostQualService } from "@services/apiServiceZestCASA";

import {
    PREPOSTQUAL_LOADING,
    PREPOSTQUAL_ERROR,
    PREPOSTQUAL_SUCCESS,
} from "@redux/actions/services/prePostQualAction";

import { COMMON_ERROR_MSG } from "@constants/strings";
import {
    PREQUAL_PENDING_ACCOUNT_CREATION_STATUS,
    PRE_QUAL_PRE_LOGIN_FLAG,
} from "@constants/zestCasaConfiguration";

export const prePostQual = (
    extendedUrl,
    dataReducer,
    callback,
    needCallbackInExcaption = false
) => {
    return async (dispatch) => {
        dispatch({ type: PREPOSTQUAL_LOADING });

        try {
            const preOrPostFlag = dataReducer?.preOrPostFlag;
            const response = await prePostQualService(
                extendedUrl,
                dataReducer,
                needCallbackInExcaption
            );
            console.log("[ZestCASA][prePost] >> Success");
            const result = response?.data?.result;
            console.log(response);

            const statusCode = result?.statusCode ?? result?.code ?? null;

            if (
                (statusCode === "0000" && result) ||
                (statusCode === "4400" && result) ||
                (statusCode === "6600" && result) ||
                (statusCode === "3300" && result) ||
                (statusCode === "6600" && result) ||
                (statusCode === PREQUAL_PENDING_ACCOUNT_CREATION_STATUS && result)
            ) {
                dispatch({
                    type: PREPOSTQUAL_SUCCESS,
                    statusCode: result.statusCode,
                    statusDesc: result.statusDesc,
                    data: result,
                    addr1: result.addr1,
                    addr2: result.addr2,
                    addr3: result.addr3,
                    addr4: result.addr4,
                    birthDate: result.birthDate,
                    bodInd: result.bodInd,
                    branchApprovalStatusCode: result.branchApprovalStatusCode,
                    city: result.city,
                    custStatus: result.custStatus,
                    customerName: result.customerName,
                    customerRiskRating: result.customerRiskRating,
                    deChequeHostStatus: result.deChequeHostStatus,
                    emailAddress: result.emailAddress,
                    empType: result.empType,
                    empTypeValue: result.empTypeValue,
                    employerName: result.employerName,
                    fatcaStateValue: result.fatcaStateValue,
                    finanicalObjective: result.finanicalObjective,
                    gcif: result.gcif,
                    gender: result.gender,
                    idNo: result.idNo,
                    idType: result.idType,
                    localCifNo: result.localCifNo,
                    m2uAccessNo: result.m2uAccessNo,
                    m2uIndicator: result.m2uIndicator,
                    maeInd: result.maeInd,
                    mobileNo: result.mobileNo,
                    monthlyIncomeRange: result.monthlyIncomeRange,
                    monthlyIncomeRangeValue: result.monthlyIncomeRangeValue,
                    nationality: result.nationality,
                    occupation: result.occupation,
                    occupationValue: result.occupationValue,
                    onBoardingStatusInfo: result.onBoardingStatusInfo,
                    onboardingIndicatorCode: result.onboardingIndicatorCode,
                    onlineRegUrl: result.onlineRegUrl,
                    pep: result.pep,
                    pdpa: result.pdpa,
                    postCode: result.postCode,
                    preferredBRDistrict: result.preferredBRDistrict,
                    preferredBRState: result.preferredBRState,
                    preferredBranch: result.preferredBranch,
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
                    screeningStatus: result.screeningStatus,
                    sector: result.sector,
                    sectorValue: result.sectorValue,
                    staffInd: result.staffInd,
                    state: result.state,
                    stateValue: result.stateValue,
                    universalCifNo: result.universalCifNo,
                    tc: result.tc,
                    title: result.title,
                    sourceOfFund: result.sourceOfFund,
                    sourceOfFundValue: result.sourceOfFundValue,
                    viewPartyResult: result.viewPartyResult,
                    isZestI: result.isZestI,
                    ekycDone: result.ekycDone,
                    txRefNo: result.txRefNo,
                });
                if (callback) {
                    callback(
                        result,
                        identifyUserStatus(
                            result.custStatus,
                            result.branchApprovalStatusCode,
                            result.m2uIndicator
                        ),
                        null,
                        result?.onboardingIndicatorCode
                    );
                }
            } else {
                const statusDesc = response?.data?.statusDesc ?? null;

                if (
                    (preOrPostFlag === PRE_QUAL_PRE_LOGIN_FLAG && statusCode === "4774") ||
                    statusCode === "4554" ||
                    statusCode === "4774" ||
                    statusCode === "6608" ||
                    statusCode === "6610"
                ) {
                    console.log("[ZestCASA][prePost] >> Visit branch exception");
                    console.log(statusCode);

                    const exception = {
                        statusCode:
                            preOrPostFlag === PRE_QUAL_PRE_LOGIN_FLAG && statusCode === "4774"
                                ? "4775"
                                : statusCode,
                        statusDesc: statusDesc,
                    };

                    if (callback) {
                        callback(null, null, exception);
                    }
                } else {
                    console.log("[ZestCASA][prePost] >> Failure");
                    console.log(statusCode);
                    showErrorToast({
                        message: statusDesc || COMMON_ERROR_MSG,
                    });
                }
                dispatch({
                    type: PREPOSTQUAL_ERROR,
                    error: statusDesc ?? COMMON_ERROR_MSG,
                });
            }
        } catch (error) {
            console.log("[ZestCASA][prePost] >> Failure1");
            const result = { statusCode: error?.status };
            if (callback && needCallbackInExcaption) {
                callback(result);
            }

            dispatch({ type: PREPOSTQUAL_ERROR, error: error });
        }
    };
};
