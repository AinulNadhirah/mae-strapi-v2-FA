/* eslint-disable react-native/split-platform-components */
/* eslint-disable sonarjs/cognitive-complexity */
/**
 * Property Controller
 *
 * Common methods used across Property module to be added here.
 */
import { useCallback } from "react";
import { Platform, PermissionsAndroid } from "react-native";
import Share from "react-native-share";

import {
    isAgeEligible,
    getEligibilityBasicNavParams,
} from "@screens/Property/Eligibility/CEController";

import {
    BANKINGV2_MODULE,
    PROPERTY_DASHBOARD,
    CE_DECLARATION,
    CE_PROPERTY_NAME,
    PROPERTY_DETAILS,
    LC_INCOME,
} from "@navigation/navigationConstant";

import { showErrorToast, showInfoToast } from "@components/Toast";

import {
    eligibilityMasterData,
    eligibilityLoanDetails,
    requestCCrisReport,
    checkCCrisReportAvailability,
    requestJACCrisReport,
    invokeL2,
    invokeL3,
    getJAButtonData,
    getRFASwitchStatus,
    getfilterCriteria,
    getfilterCriteriaCloud,
} from "@services";
import { FAProperty } from "@services/analytics/analyticsProperty";

import {
    PROPERTY_MDM_ERR,
    PROPERTY_AGE_ERR,
    PROPERTY_NATIONALITY_ERR,
    PLEASE_SELECT,
    COMMON_ERROR_MSG,
    CHECK_PROPERTY_ON_MAE,
    FA_SHARE_PROPERTY_LINK,
    PROVIDE_STORAGE_PERMISSION,
    YES,
} from "@constants/strings";

import { encryptData } from "@utils/dataModel";
import { isEmpty } from "@utils/dataModel/utility";
import { ErrorLogger } from "@utils/logs";

import { INELGIBLE_OCCUPATION_LIST } from "@constants/data";
import { STATUS_CODE_SUCCESS } from "@constants/api";

function getExistingData(value, pickerData, defaultName = PLEASE_SELECT) {
    console.log("[PropertyController] >> [getExistingData]");

    const defaultResponse = {
        index: 0,
        name: defaultName,
        value,
        obj: null,
    };

    if (!value || !pickerData || !(pickerData instanceof Array)) return defaultResponse;

    const index = pickerData.findIndex((item) => item.value === value);

    if (index === -1) return defaultResponse;

    return {
        index,
        name: pickerData[index]?.name,
        value,
        obj: pickerData[index],
    };
}

// Custom hook to reset navigation
function useResetNavigation(navigation) {
    const resetToDiscover = useCallback(() => {
        if (navigation) {
            navigation.reset({
                index: 0,
                routes: [
                    {
                        name: PROPERTY_DASHBOARD,
                        params: {
                            activeTabIndex: 0,
                        },
                    },
                ],
            });
        }
    }, [navigation]);

    const resetToApplication = useCallback(
        (from) => {
            if (navigation) {
                navigation.reset({
                    index: 0,
                    routes: [
                        {
                            name: PROPERTY_DASHBOARD,
                            params: {
                                activeTabIndex: 1,
                                reload: true,
                                from,
                            },
                        },
                    ],
                });
            }
        },
        [navigation]
    );

    return [resetToApplication, resetToDiscover];
}

async function getMasterData(loader = false) {
    console.log("[PropertyController] >> [getMasterData]");

    // API call to fetch master data
    const httpResp = await eligibilityMasterData(loader).catch((error) => {
        console.log("[PropertyController][eligibilityMasterData] >> Exception: ", error);
    });
    const code = httpResp?.data?.code ?? null;
    const result = httpResp?.data?.result ?? null;

    return code === 200 ? result : null;
}

async function getMDMData(loader = false) {
    console.log("[PropertyController] >> [getMDMData]");

    // API call to fetch user details from MDM
    const httpResp = await eligibilityLoanDetails(loader).catch((error) => {
        console.log("[PropertyController][getMDMData] >> Exception: ", error);
    });
    const code = httpResp?.data?.code ?? null;
    const result = httpResp?.data?.result ?? null;

    return code === 200 ? result : null;
}

async function getJAButtonEnabled(loader = false) {
    console.log("[PropertyController] >> [getJAButtonData]");

    // API call to fetch user details from MDM
    const httpResp = await getJAButtonData(loader).catch((error) => {
        console.log("[PropertyController][eligibilityLoanDetails] >> Exception: ", error);
    });
    const statusCode = httpResp?.data?.code ?? null;
    const result = httpResp?.data?.result ?? null;

    return {
        successRes: statusCode === 200,
        result,
    };
}

async function fetchRFASwitchStatus(loader = false) {
    console.log("[PropertyController] >> [getRFASwitchStatus]");

    // API call to fetch user details from MDM
    const httpResp = await getRFASwitchStatus(loader).catch((error) => {
        console.log("[PropertyController][eligibilityLoanDetails] >> Exception: ", error);
    });
    const statusCode = httpResp?.data?.code;
    const response = httpResp?.data?.result;

    return {
        statusResp: statusCode === 200,
        response,
    };
}

async function fetchCCRISReport(params, loader = true) {
    console.log("[PropertyController] >> [fetchCCRISReport]");

    const httpResp = await requestCCrisReport(params, loader).catch((error) => {
        console.log("[PropertyController][requestCCrisReport] >> Exception: ", error);
    });
    const statusCode = httpResp?.data?.result?.statusCode ?? null;
    const statusDesc = httpResp?.data?.result?.statusDesc ?? COMMON_ERROR_MSG;

    return {
        success: statusCode === STATUS_CODE_SUCCESS,
        errorMessage: statusDesc,
    };
}

async function fetchJACCRISReport(params, loader = true) {
    console.log("[PropertyController] >> [fetchCCRISReport]");

    const httpResp = await requestJACCrisReport(params, loader).catch((error) => {
        console.log("[PropertyController][requestCCrisReport] >> Exception: ", error);
    });
    const statusCode = httpResp?.data?.result?.statusCode ?? null;
    const statusDesc = httpResp?.data?.result?.statusDesc ?? COMMON_ERROR_MSG;

    return {
        success: statusCode === STATUS_CODE_SUCCESS,
        errorMessage: statusDesc,
    };
}

async function checkCCRISReportAvailability(params, loader = true) {
    console.log("[PropertyController] >> [checkCCRISReportAvailability]");

    const httpResp = await checkCCrisReportAvailability(params, loader).catch((error) => {
        console.log("[PropertyController][checkCCrisReportAvailability] >> Exception: ", error);
    });
    const result = httpResp?.data?.result ?? {};
    const statusCode = result?.statusCode ?? null;
    const statusDesc = result?.statusDesc ?? COMMON_ERROR_MSG;
    const availability = result?.availability ?? null;
    const applicationStpRefNo = result?.applicationStpRefNo;
    const ccrisLoanCount = result?.ccrisLoanCount;
    const unmatchApplForCreditRecord = result?.unmatchApplForCreditRecord;
    const ccrisReportFlag = statusCode === STATUS_CODE_SUCCESS && availability === YES;

    return {
        success: statusCode === STATUS_CODE_SUCCESS,
        errorMessage: statusDesc,
        applicationStpRefNo,
        ccrisLoanCount,
        ccrisReportFlag,
        unmatchApplForCreditRecord,
    };
}

async function handlePropertyDeepLinks(params, navigation, updateModel, getModel) {
    console.log("[PropertyController] >> [handlePropertyDeepLinks]");
    try {
        if (params?.screen) {
            if (params.screen.toLowerCase() === "discover") {
                // go to the property dashboard
                navigation.navigate(BANKINGV2_MODULE, {
                    screen: PROPERTY_DASHBOARD,
                    from: "deepLink",
                });
            } else if (params.screen.toLowerCase() === "loancalculator") {
                navigation.navigate(BANKINGV2_MODULE, {
                    screen: LC_INCOME,
                    params: { latitude: "", longitude: "" },
                });
            } else if (params.screen.toLowerCase() === "applymortgage") {
                handleApplyMortgage(navigation, getModel);
            } else if (params.screen.toLowerCase() === "application") {
                const { isPostPassword } = getModel("auth");
                if (!isPostPassword) {
                    try {
                        const httpResp = await invokeL3(true);
                        const code = httpResp?.data?.code ?? null;
                        if (code !== 0) {
                            navigation.goBack();
                            return;
                        }
                    } catch (error) {
                        console.log(error, "error form notify");
                        navigation.goBack();
                        return;
                    }
                }
                navigation.navigate(BANKINGV2_MODULE, {
                    screen: PROPERTY_DASHBOARD,
                    params: {
                        activeTabIndex: 1,
                        reload: true,
                    },
                });
            }
        } else if (params?.pid) {
            navigation.navigate(BANKINGV2_MODULE, {
                screen: PROPERTY_DETAILS,
                params: {
                    ...params,
                    propertyId: params?.pid ?? null,
                    from: "deepLink",
                },
            });
        }
    } catch (error) {
        console.log(error);
        // go to the property dashboard
        navigation.navigate(BANKINGV2_MODULE, {
            screen: PROPERTY_DASHBOARD,
        });
    }
}

async function handleApplyMortgage(navigation, getModel) {
    console.log("[PropertyController] >> [handleApplyMortgage]");
    try {
        const { isOnboard } = getModel("user");

        if (!isOnboard) {
            navigation.navigate("Onboarding", {
                screen: PROPERTY_DASHBOARD,
            });
        } else {
            const { isConsentGiven } = getModel("property");

            const { isPostLogin, isPostPassword } = getModel("auth");
            if (!isPostPassword && !isPostLogin) {
                // L2 call to invoke login page
                const httpResp = await invokeL2(true).catch((error) => {
                    console.log("[PropertyController][handleApplyMortage] >> Exception: ", error);
                });
                const code = httpResp?.data?.code ?? null;
                if (code !== 0) return;
            }

            // Prefetch required data
            const masterData = await getMasterData(true);
            const mdmData = await getMDMData(true);

            // Show error if failed to fetch MDM data
            if (!mdmData) {
                showErrorToast({
                    message: PROPERTY_MDM_ERR,
                });
                return;
            }

            // Age Eligibility Check
            const { isEligible, age } = await isAgeEligible(mdmData?.dob);
            if (!isEligible) {
                showInfoToast({
                    message: PROPERTY_AGE_ERR,
                });
                return;
            }

            // Nationality/PRIC Check
            const citizenship = mdmData?.citizenship ?? "";
            const idType = mdmData?.idType ?? "";
            if (citizenship !== "MYS" && idType !== "PRIC") {
                showInfoToast({
                    message: PROPERTY_NATIONALITY_ERR,
                });
                return;
            }

            const basicNavParams = getEligibilityBasicNavParams({
                masterData,
                mdmData,
                age,
                latitude: "",
                longitude: "",
            });

            navigation.navigate(BANKINGV2_MODULE, {
                screen: isConsentGiven ? CE_PROPERTY_NAME : CE_DECLARATION,
                params: {
                    ...basicNavParams,
                    flow: "applyMortgage", // for GA logging different flow, reuse screen.
                },
            });
        }
    } catch (error) {
        console.log(error);
        navigation.canGoBack() && navigation.goBack();
    }
}

async function getEncValue(syncId) {
    if (isEmpty(syncId)) {
        return syncId;
    }

    return await encryptData(syncId);
}

async function checkStoragePermission() {
    console.log("[PropertyDetails] >> [checkStoragePermission]");

    if (Platform.OS === "ios") {
        return true;
    } else {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                return true;
            } else {
                showErrorToast({
                    message: PROVIDE_STORAGE_PERMISSION,
                });
            }
        } catch (error) {
            ErrorLogger(error);
            showErrorToast({
                message: PROVIDE_STORAGE_PERMISSION,
            });
        }
    }
}

async function sharePropertyLink(propDeepLink, propertyDetails) {
    console.log("[PropertyDetails] >> [sharePropertyLink]");

    if (!propDeepLink) return;

    const shareMsg = CHECK_PROPERTY_ON_MAE;
    const message = `${shareMsg}\n${propDeepLink}`;

    // Open native share window
    Share.open({
        message,
        subject: shareMsg,
    })
        .then(() => {
            console.log("[PropertyDetails][sharePropertyLink] >> Link shared successfully.");
        })
        .catch((error) => {
            console.log("[PropertyDetails][sharePropertyLink] >> Exception: ", error);
        });

    const screenName =
        "Property_" + propertyDetails?.property_name + "_" + propertyDetails?.property_id;
    FAProperty.onPressSelectMenu(screenName, FA_SHARE_PROPERTY_LINK);
}

async function fetchFilterCriteria(isCloudEnabled, cloudEndPointBase, params) {
    if (isCloudEnabled && !isEmpty(cloudEndPointBase)) {
        return await getfilterCriteriaCloud(cloudEndPointBase);
    } else {
        return await getfilterCriteria(params);
    }
}

const isOccupationSpecificCateg = (value) => {
    //student/house wife/husband/Retiree or outside labour
    return INELGIBLE_OCCUPATION_LIST.includes(value);
};

export {
    getExistingData,
    useResetNavigation,
    getMasterData,
    getMDMData,
    fetchCCRISReport,
    checkCCRISReportAvailability,
    handlePropertyDeepLinks,
    getEncValue,
    fetchJACCRISReport,
    getJAButtonEnabled,
    fetchRFASwitchStatus,
    checkStoragePermission,
    sharePropertyLink,
    fetchFilterCriteria,
    isOccupationSpecificCateg,
};
