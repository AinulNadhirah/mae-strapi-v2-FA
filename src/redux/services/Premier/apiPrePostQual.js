import { identifyUserStatusPremier } from "@screens/Premier/helpers/premierHelpers";

import { showErrorToast } from "@components/Toast";

import { prePostQualService } from "@services/apiServicePremier";

import {
    PREPOSTQUAL_LOADING,
    PREPOSTQUAL_ERROR,
    PREPOSTQUAL_SUCCESS
} from "@redux/actions/services/prePostQualAction";

import {
    PREQUAL_PENDING_ACCOUNT_CREATION_STATUS,
    PRE_QUAL_PRE_LOGIN_FLAG
} from "@constants/premierConfiguration";
import { COMMON_ERROR_MSG } from "@constants/strings";

export const prePostQualPremier = (
    extendedUrl,
    dataReducer,
    callback,
    needCallbackInExcaption = false
) => {
    return async (dispatch) => {
        dispatch({ type: PREPOSTQUAL_LOADING });
        const successStatusCodes = ["0000", "4400", "6600", "3300", "6600"];
        const branchExceptionStatusCodes = ["4554", "4774", "6608", "6610", "4778"];

        try {
            const preOrPostFlag = dataReducer?.preOrPostFlag;
            const response = await prePostQualService(
                extendedUrl,
                dataReducer,
                needCallbackInExcaption
            );
            console.log("[PM1][prePost] >> Success");
            const result = response?.result;
            
            const statusCode = result?.statusCode ?? result?.code;

            if (
                (successStatusCodes.includes(statusCode) && result) ||
                (statusCode === PREQUAL_PENDING_ACCOUNT_CREATION_STATUS && result)
            ) {
                dispatch({
                    type: PREPOSTQUAL_SUCCESS,
                    statusCode: result?.statusCode,
                    statusDesc: result?.statusDesc,
                    data: result,
                    addr1: result?.addr1,
                    addr2: result?.addr2,
                    addr3: result?.addr3,
                    addr4: result?.addr4,
                    birthDate: result?.birthDate,
                    bodInd: result?.bodInd,
                    branchApprovalStatusCode: result?.branchApprovalStatusCode,
                    city: result?.city,
                    custStatus: result?.custStatus,
                    customerName: result?.customerName,
                    customerRiskRating: result?.customerRiskRating,
                    deChequeHostStatus: result?.deChequeHostStatus,
                    emailAddress: result?.emailAddress,
                    empType: result?.empType,
                    empTypeValue: result?.empTypeValue,
                    employerName: result?.employerName,
                    fatcaStateValue: result?.fatcaStateValue,
                    finanicalObjective: result?.finanicalObjective,
                    gcif: result?.gcif,
                    gender: result?.gender,
                    idNo: result?.idNo,
                    idType: result?.idType,
                    localCifNo: result?.localCifNo,
                    m2uAccessNo: result?.m2uAccessNo,
                    m2uIndicator: result?.m2uIndicator,
                    maeInd: result?.maeInd,
                    mobileNo: result?.mobileNo,
                    monthlyIncomeRange: result?.monthlyIncomeRange,
                    monthlyIncomeRangeValue: result?.monthlyIncomeRangeValue,
                    nationality: result?.nationality,
                    occupation: result?.occupation,
                    occupationValue: result?.occupationValue,
                    onBoardingStatusInfo: result?.onBoardingStatusInfo,
                    onboardingIndicatorCode: result?.onboardingIndicatorCode,
                    onlineRegUrl: result?.onlineRegUrl,
                    pep: result?.pep,
                    pdpa: result?.pdpa,
                    postCode: result?.postCode,
                    preferredBRDistrict: result?.preferredBRDistrict,
                    preferredBRState: result?.preferredBRState,
                    preferredBranch: result?.preferredBranch,
                    purpose: result?.purpose,
                    purposeValue: result?.purposeValue,
                    race: result?.race,
                    resumeStageInd: result?.resumeStageInd,
                    rsaIndicator: result?.rsaIndicator,
                    saDailyInd: result?.saDailyInd,
                    saFormInvestmentExp: result?.saFormInvestmentExp,
                    saFormInvestmentNature: result?.saFormInvestmentNature,
                    saFormInvestmentRisk: result?.saFormInvestmentRisk,
                    saFormInvestmentTerm: result?.saFormInvestmentTerm,
                    saFormPIDM: result?.saFormPIDM,
                    saFormProductFeature: result?.saFormProductFeature,
                    saFormSecurities: result?.saFormSecurities,
                    saFormSuitability: result?.saFormSuitability,
                    saTermInd: result?.saTermInd,
                    screeningStatus: result?.screeningStatus,
                    sector: result?.sector,
                    sectorValue: result?.sectorValue,
                    staffInd: result?.staffInd,
                    state: result?.state,
                    stateValue: result?.stateValue,
                    universalCifNo: result?.universalCifNo,
                    tc: result?.tc,
                    title: result?.title,
                    sourceOfFund: result?.sourceOfFund,
                    sourceOfFundValue: result?.sourceOfFundValue,
                    viewPartyResult: result?.viewPartyResult,
                    isPM1: result?.isPM1,
                    isPMA: result?.isPMA,
                    isKawanku: result?.isKawanku,
                    ekycDone: result?.ekycDone,
                    productName: dataReducer?.productName || result?.productName,
                    userStatus: identifyUserStatusPremier(
                        result?.custStatus,
                        result?.branchApprovalStatusCode,
                        result?.m2uIndicator,
                        dataReducer?.productName || result?.productName,
                        result?.onboardingIndicatorCode
                    ),
                    txRefNo: result.txRefNo,
                    currentDate: result.currentDate,
                });
                if (callback) {
                    callback(
                        result,
                        identifyUserStatusPremier(
                            result?.custStatus,
                            result?.branchApprovalStatusCode,
                            result?.m2uIndicator,
                            dataReducer?.productName || result?.productName,
                            result?.onboardingIndicatorCode
                        ),
                        null,
                        result?.onboardingIndicatorCode
                    );
                }
            } else {
                const statusDesc = response?.result?.statusDesc;
                const branchExceptionStatus = (preOrPostFlag === PRE_QUAL_PRE_LOGIN_FLAG && statusCode === "4774");

                if (
                    branchExceptionStatus ||
                    branchExceptionStatusCodes.includes(statusCode)
                ) {
                    console.log("[PM1][prePost] >> Visit branch exception");

                    const exception = {
                        statusCode:
                        branchExceptionStatus
                                ? "4775"
                                : statusCode,
                        statusDesc,
                    };

                    if (callback) {
                        callback(null, null, exception);
                    }
                } else {
                    console.log("[PM1][prePost] >> Failure");
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
            console.log("[PM1][prePost] >> Failure1");
            const result = { statusCode: error?.status };
            if (callback && needCallbackInExcaption) {
                callback(result);
            }

            dispatch({ type: PREPOSTQUAL_ERROR, error });
        }
    };
};
