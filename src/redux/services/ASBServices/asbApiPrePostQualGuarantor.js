import { showErrorToast } from "@components/Toast";

import { asbPrePostQualGuarantorService } from "@services";

import {
    ASB_GUARANTOR_PREPOSTQUAL_LOADING,
    ASB_GUARANTOR_PREPOSTQUAL_ERROR,
    ASB_GUARANTOR_PREPOSTQUAL_SUCCESS,
} from "@redux/actions/ASBServices/asbGuarantorPrePostQualAction";

import { COMMON_ERROR_MSG } from "@constants/strings";

export const asbPrePostQualGuarantor = (
    extendedUrl,
    dataReducer,
    callback,
    mainApplicantName,
    needCallbackInException = false,
    isGuarantor = false
) => {
    return async (dispatch) => {
        try {
            dispatch({ type: ASB_GUARANTOR_PREPOSTQUAL_LOADING });

            const response = await asbPrePostQualGuarantorService(
                extendedUrl,
                dataReducer,
                needCallbackInException
            );
            const result = response?.data?.result;
            const statusCode = result?.statusCode ?? null;

            if (statusCode == "0000") {
                const overAllStatus =
                    result?.esbResponse?.mdmResponse?.overallStatus?.statusDescription;
                const overAllStatusCode =
                    result?.esbResponse?.mdmResponse?.overallStatus?.statusCode;
                const mdmResponse = result?.mdmResponse?.responseJsonString;

                if (
                    (isGuarantor && overAllStatus === "SUCCESS" && overAllStatusCode === "M000") ||
                    (!isGuarantor && overAllStatus === "SUCCESS" && overAllStatusCode === "0000")
                ) {
                    const mdmData = mdmResponse
                        ? JSON.parse(mdmResponse?.replace(/\r\n/, ""))
                        : null;
                    console.log("[ASB][preQual][response]", JSON.stringify(mdmData));

                    dispatch({
                        type: ASB_GUARANTOR_PREPOSTQUAL_SUCCESS,
                        statusCode: result.statusCode,
                        statusDesc: result.statusDesc,
                        data: result,
                        pan: mdmData?.ucif?.cifNumber,
                        isStaff: mdmData?.partyTags?.isStaff,
                        addr1: mdmData?.addresses[0]?.address?.line1,
                        addr2: mdmData?.addresses[0]?.address?.line2,
                        addr3: mdmData?.addresses[0]?.address?.line3,
                        addr4: result.addr4,
                        birthDate: result.birthDate,
                        bodInd: result.bodInd,
                        branchApprovalStatusCode: result.branchApprovalStatusCode,
                        city: mdmData?.addresses[0]?.address?.town,
                        custStatus: result.custStatus,
                        customerName: mdmData?.demographics?.partyName?.registeredName,
                        customerRiskRating: result.customerRiskRating,
                        deChequeHostStatus: result.deChequeHostStatus,
                        emailAddress: mdmData?.contactInformation?.emailAddress,
                        empType: result.empType,
                        empTypeValue: result.empTypeValue,
                        employerName: result.employerName,
                        finanicalObjective: result.finanicalObjective,
                        gcif: result.gcif,
                        genderCode: mdmData?.demographics?.gender?.code,
                        genderValue: mdmData?.demographics?.gender?.value,
                        idNo: mdmData?.demographics?.ids[0]?.idNumber,
                        idType: mdmData?.demographics?.ids[0]?.idType,
                        localCifNo: mdmData?.localCIF?.cifNumber,
                        m2uAccessNo: result.m2uAccessNo,
                        m2uIndicator: result.m2uIndicator,
                        maeInd: result.maeInd,
                        mobileNo: mdmData?.contactInformation?.phones[0]?.phone?.phoneNumber,
                        monthlyIncomeRange: result.monthlyIncomeRange,
                        monthlyIncomeRangeValue: result.monthlyIncomeRangeValue,
                        nationality: result.nationality,
                        occupationCode: mdmData?.employmentDetails?.occupation?.code,
                        occupationValue: mdmData?.employmentDetails?.occupation?.value,
                        onBoardingStatusInfo: result.onBoardingStatusInfo,
                        onboardingIndicatorCode: result.onboardingIndicatorCode,
                        onlineRegUrl: result.onlineRegUrl,
                        pep: result.pep,
                        postCode: mdmData?.addresses[0]?.address?.postalCode,
                        preferredBRDistrict: result.preferredBRDistrict,
                        preferredBRState: result.preferredBRState,
                        preferredBranch: result.preferredBranch,
                        purpose: result.purpose,
                        purposeValue: result.purposeValue,
                        raceCode: mdmData?.demographics?.race?.code,
                        raceValue: mdmData?.demographics?.race?.value,
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
                        state: mdmData?.addresses[0]?.address?.state?.value,
                        stateValue: mdmData?.addresses[0]?.address?.state?.value,
                        stateCode: mdmData?.addresses[0]?.address?.state?.code,
                        universalCifNo: result.universalCifNo,
                        title: result.title,
                        sourceOfFund: result.sourceOfFund,
                        sourceOfFundValue: result.sourceOfFundValue,
                        viewPartyResult: result.viewPartyResult,
                        isZestI: result.isZestI,
                        ekycDone: result.ekycDone,
                        requestMsgRefNo: result.stpReferenceNo,
                        mainStpReferenceNo: result.mainStpReferenceNo,

                        country: mdmData?.addresses[0]?.address?.country?.value,
                        countryCode: mdmData?.addresses[0]?.address?.country?.code,
                        mobCountryCode: mdmData?.contactInformation?.phones[0]?.phone?.countryCode,
                        mobAreaCode: mdmData?.contactInformation?.phones[0]?.phone?.areaCode,
                        religionCode: mdmData?.demographics?.religion?.code,
                        religionValue: mdmData?.demographics?.religion?.value,
                        employmentTypeCode: mdmData?.employmentDetails?.employmentType?.code,
                        employmentTypeValue: mdmData?.employmentDetails?.employmentType?.value,
                        occupationSectorCode: mdmData?.employmentDetails?.occupationSector?.code,
                        occupationSectorValue: mdmData?.employmentDetails?.occupationSector?.value,
                        nameOfEmployer: mdmData?.employmentDetails?.employerName?.registeredName,
                        salutationCode: mdmData?.demographics?.salutation?.code,
                        salutationValue: mdmData?.demographics?.salutation?.value,
                        dateOfBirth: mdmData?.demographics?.dateOfBirth,
                        addressType: mdmData?.addresses[0]?.addressType?.code,
                        grossIncome: mdmData?.employmentDetails?.grossIncomeRange?.code,
                        stpreferenceNo: result?.stpreferenceNo,
                        lastUpdatedDate: mdmData?.onboardingInformation?.lastUpdatedDate,
                        unitHolderId:
                            result?.pnbResponse?.pnbResponse?.WM_UHAccountInquiryResponse
                                ?.WM_UHAccountInquiryResult?.UPLOAD_UH_ACK?.UNITHOLDERID,
                        idTypeCode: mdmData?.demographics?.ids[0]?.idType?.code,
                        maritalStatus: mdmData?.demographics?.maritalStatus,
                        mainApplicantName,
                    });
                    if (callback) {
                        callback(mdmData, result);
                    }
                } else {
                    console.log("[ASB][preQual][result errorMsg ==>]", result?.statusDescription);
                    showErrorToast({
                        message: result?.statusDescription ?? COMMON_ERROR_MSG,
                    });
                }
            } else {
                console.log("[ASB][preQual][result errorMsg ==>]", result?.statusDescription);
                showErrorToast({
                    message: result?.statusDescription || COMMON_ERROR_MSG,
                });
            }
        } catch (error) {
            console.log("[ASB][preQual][catch] >> Failure1", error);
            const result = { statusCode: error?.status };
            if (callback && needCallbackInException) {
                callback(result);
            }

            dispatch({ type: ASB_GUARANTOR_PREPOSTQUAL_ERROR, error });
        }
    };
};
