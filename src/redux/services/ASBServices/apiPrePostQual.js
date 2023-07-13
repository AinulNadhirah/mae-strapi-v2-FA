import { showErrorToast } from "@components/Toast";

import { getPrePostQualService } from "@services";

import {
    ASB_PREPOSTQUAL_LOADING,
    ASB_PREPOSTQUAL_ERROR,
    ASB_PREPOSTQUAL_SUCCESS,
} from "@redux/actions/ASBServices/prePostQualAction";

import { COMMON_ERROR_MSG } from "@constants/strings";

export const prePostQual = (extendedUrl, dataReducer, callback) => {
    return async (dispatch) => {
        try {
            dispatch({ type: ASB_PREPOSTQUAL_LOADING });

            const response = await getPrePostQualService(extendedUrl, dataReducer);

            console.log("[ASB][preQual] >> Success");
            const result = response?.data?.result;
            console.log("Result *******************************");
            console.log("[ASB][preQual][response]", JSON.stringify(result));
            console.log("[ASB][preQual][stpreferenceNo]", result?.stpreferenceNo);
            console.log("[ASB][preQual][result ==>]", result);
            const statusCode = result?.statusCode ?? null;
            console.log("[ASB][preQual][result statusCode new ==>]", statusCode);
            console.log("[ASB][result*]", result?.statusCode === "0000");

            if (statusCode == "0000") {
                const overAllStatus = result?.mdmResponse?.overallStatus?.status;
                const overAllStatusCode = result?.mdmResponse?.overallStatus?.statusCode;
                const overAlStatusDes = result?.mdmResponse?.overallStatus?.statusDescription;
                const mdmResponse = result?.mdmResponse?.responseJsonString;
                const mdmData = JSON.parse(mdmResponse?.replace(/\r\n/, ""));
                console.log("[ASB][preQual][MDM][OverAllStatus]", overAllStatus);
                console.log("[ASB][preQual][MDM][Status Code]", overAllStatusCode);
                console.log("[ASB][preQual][MDM][Status Description]", overAlStatusDes);
                console.log("[ASB][preQual][MDM][mdmData]", JSON.stringify(mdmData));
                const address = mdmData?.addresses?.filter((item) => {
                    return item?.addressType?.value === "RESIDENTIAL";
                });
                console.log("filtered address", JSON.stringify(address));

                if (overAllStatus === "SUCCESS" && overAllStatusCode === "0000") {
                    if (callback) {
                        callback(true, mdmData);
                    }
                    dispatch({
                        type: ASB_PREPOSTQUAL_SUCCESS,
                        statusCode: result.statusCode,
                        statusDesc: result.statusDesc,
                        data: result,
                        pan: mdmData?.ucif?.cifNumber,
                        isStaff: mdmData?.partyTags?.isStaff,
                        addr1:
                            address && address.length > 0
                                ? address[0].address?.line1
                                : mdmData?.addresses[0]?.address?.line1,
                        addr2:
                            address && address.length > 0
                                ? address[0].address?.line2
                                : mdmData?.addresses[0]?.address?.line2,
                        addr3:
                            address && address.length > 0
                                ? address[0].address?.line3
                                : mdmData?.addresses[0]?.address?.line3,
                        addr4: result.addr4,
                        birthDate: result.birthDate,
                        bodInd: result.bodInd,
                        branchApprovalStatusCode: result.branchApprovalStatusCode,
                        city:
                            address && address.length > 0
                                ? address[0].address?.town
                                : mdmData?.addresses[0]?.address?.town,
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
                        postCode:
                            address && address.length > 0
                                ? address[0].address?.postalCode
                                : mdmData?.addresses[0]?.address?.postalCode,
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
                        state:
                            address && address.length > 0
                                ? address[0].address?.state?.value
                                : mdmData?.addresses[0]?.address?.state?.value,
                        stateValue:
                            address && address.length > 0
                                ? address[0].address?.state?.value
                                : mdmData?.addresses[0]?.address?.state?.value,
                        stateCode:
                            address && address.length > 0
                                ? address[0].address?.state?.code
                                : mdmData?.addresses[0]?.address?.state?.code,
                        universalCifNo: result.universalCifNo,
                        title: result.title,
                        sourceOfFund: result.sourceOfFund,
                        sourceOfFundValue: result.sourceOfFundValue,
                        viewPartyResult: result.viewPartyResult,
                        isZestI: result.isZestI,
                        ekycDone: result.ekycDone,
                        requestMsgRefNo: result.stpReferenceNo,
                        country:
                            address && address.length > 0
                                ? address[0].address?.country?.value
                                : mdmData?.addresses[0]?.address?.country?.value,
                        countryCode:
                            address && address.length > 0
                                ? address[0].address?.country?.code
                                : mdmData?.addresses[0]?.address?.country?.code,
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
                        addressType:
                            address && address.length > 0
                                ? address[0]?.addressType?.code
                                : mdmData?.addresses[0]?.addressType?.code,
                        grossIncome: mdmData?.employmentDetails?.grossIncomeRange?.code,
                        stpreferenceNo: result?.stpreferenceNo,
                        lastUpdatedDate: mdmData?.onboardingInformation?.lastUpdatedDate,
                        unitHolderId:
                            result?.pnbResponse?.pnbResponse?.WM_UHAccountInquiryResponse
                                ?.WM_UHAccountInquiryResult?.UPLOAD_UH_ACK?.UNITHOLDERID,
                        idTypeCode: mdmData?.demographics?.ids[0]?.idType?.code,
                        maritalStatus: mdmData?.demographics?.maritalStatus,
                    });
                }
            } else {
                console.log("[ASB][preQual][result errorMsg ==>]", result?.statusDescription);
                showErrorToast({
                    message: result?.statusDescription || result?.statusDesc || COMMON_ERROR_MSG,
                });
            }

            console.log("End Result");
        } catch (error) {
            console.log("[ASB][preQual][catch] >> Failure");
            dispatch({ type: ASB_PREPOSTQUAL_ERROR, error });
        }
    };
};
