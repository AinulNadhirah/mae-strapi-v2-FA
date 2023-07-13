/* eslint-disable react-hooks/exhaustive-deps */
import PropTypes from "prop-types";
import React, { useEffect, useCallback } from "react";
import { StyleSheet, View } from "react-native";

import {
    BANKINGV2_MODULE,
    APPLICATION_DETAILS,
    LETTER_OFFER_LIST,
    PROPERTY_DASHBOARD,
    CE_RESULT,
    CE_COMMITMENTS,
    CHAT_WINDOW,
    CHAT_LIST,
} from "@navigation/navigationConstant";

import ScreenLoader from "@components/Loaders/ScreenLoader";
import { showErrorToast } from "@components/Toast";

import { useModelController } from "@context";

import { invokeL3, getGroupChat } from "@services";

import { COMMON_ERROR_MSG, PROPERTY_MDM_ERR } from "@constants/strings";

import {
    fetchApplicationDetails,
    fetchGetApplicants,
    fetchJointApplicationDetails,
    fetchPropertyPrice,
} from "./Application/LAController";
import {
    fetchRFASwitchStatus,
    getEncValue,
    getJAButtonEnabled,
    getMDMData,
} from "./Common/PropertyController";
import { checkEligibility, isAgeEligible, saveEligibilityInput } from "./Eligibility/CEController";

function PropertyNotificationLanding({ navigation, route }) {
    const { getModel } = useModelController();

    async function getCEResultNavParams(propertyDetails, savedData, syncId) {
        const navParams = route?.params ?? {};
        const latitude = navParams?.latitude ?? "";
        const longitude = navParams?.longitude ?? "";
        const { age } = await isAgeEligible(savedData?.dob);

        return {
            ...savedData,

            // Common
            latitude,
            longitude,
            propertyDetails,
            age,
            syncId,

            // Property Data
            propertyId: propertyDetails?.property_id ?? "",

            // Input Data
            propertyPrice: savedData?.propertyPriceRaw,
            downPaymentAmount: savedData?.downPaymentAmountRaw,
            origTenure: savedData?.origTenure,
            origDownPaymentAmount: savedData?.downPaymentAmount,
            loanAmount: savedData?.loanAmountRaw,
            tenure: savedData?.tenure,
            spouseIncome: savedData?.spouseIncomeRaw,
            grossIncome: savedData?.grossIncomeRaw,
            housingLoan: savedData?.housingLoan,
            personalLoan: savedData?.personalLoanRaw,
            ccRepayments: savedData?.ccRepaymentsRaw,
            carLoan: savedData?.carLoanRaw,
            overdraft: savedData?.overdraft,
            nonBankCommitments: savedData?.nonBankCommitmentsRaw,
            baseRateLabel: savedData?.baseRateLabel ?? "Base rate",

            // Result Data
            eligibilityResult: {
                dataType: savedData?.dataType,
                aipAmount: savedData?.loanAmountRaw,
                interestRate: savedData?.interestRate,
                tenure: savedData?.recommendedTenure,
                recommendedDownPayment: savedData?.recommendedDownpaymentRaw,
                installmentAmount: savedData?.monthlyInstalmentRaw,
                baseRate: savedData?.baseRate,
                spreadRate: savedData?.spreadRate,
                minTenure: savedData?.minTenure,
                maxTenure: savedData?.maxTenure,
                publicSectorNameFinance: savedData?.publicSectorNameFinance,
            },
            aipAmount: savedData?.loanAmountRaw,
            jaLoanAmount: savedData?.jaLoanAmount,
            recommendedDownpayment: savedData?.recommendedDownpaymentRaw,
            installmentAmount: savedData?.monthlyInstalmentRaw,
            monthlyInstalment: savedData?.monthlyInstalmentRaw,
            stpApplicationId: savedData?.stpApplicationId,
        };
    }

    async function fetchGroupChat(
        propertyDetails,
        savedData,
        currentUser,
        mainApplicantDetails,
        jointApplicantDetails,
        refId,
        syncId
    ) {
        const propertyId = propertyDetails?.property_id;
        const stpId = refId;
        const operatorId = savedData?.agentInfo?.pf_id;
        const PropertyName = propertyDetails?.property_name
            ? propertyDetails?.property_name
            : savedData?.propertyName;

        const encSyncId = await getEncValue(syncId);
        const chatParams = {
            propertyId,
            stpId,
            operatorId,
            syncId: encSyncId,
            groupChatIndicator: "CREATE_CHAT",
        };

        const httpResp = await getGroupChat(chatParams, false).catch((error) => {
            console.log("[PropertyNotificationLanding][Open Chat] >> Exception: ", error);
        });

        const result = (await httpResp?.data?.result) ?? {};
        const url = (await result?.url) + "?token=" + result?.token;

        //Navigate to Chat Room screen
        if (url !== null) {
            navigation.navigate(BANKINGV2_MODULE, {
                screen: CHAT_WINDOW,
                params: {
                    chatUrl: url,
                    syncId,
                    stpId: refId,
                    from: "NOTIFICATION",
                    propertyName: PropertyName,
                    salesPersonName: savedData?.agentInfo?.name,
                    salesPersonMobileNo: savedData?.agentInfo?.mobile_no,
                    propertyPrice: savedData?.propertyPrice
                        ? savedData?.propertyPrice
                        : savedData?.propertyPriceRaw,
                    currentUser,
                    mainApplicantDetails,
                    jointApplicantDetails,
                    showGroupCoApplicant: result?.mainCustomerName
                        ? result?.jointCustomerName
                        : result?.mainCustomerName,
                },
            });
        }
    }
    const openChat = useCallback(
        async (refId) => {
            console.log("[PropertyNotificationLanding] >> [openChat]");

            const encStpId = await getEncValue(refId);
            const params = {
                syncId: "",
                stpId: encStpId,
                from: "NOTIFICATION",
            };

            const { syncId } = await fetchPropertyPrice(params, false);

            if (!syncId) {
                navigation.navigate(BANKINGV2_MODULE, {
                    screen: CHAT_LIST,
                    params,
                });
                return;
            }

            const encSyncId = await getEncValue(syncId);
            const { currentUser, mainApplicantDetails, jointApplicantDetails } =
                await fetchGetApplicants(encSyncId, false);

            if (currentUser === "M") {
                const { success, errorMessage, propertyDetails, savedData } =
                    await fetchApplicationDetails(params, false);

                if (!success) {
                    // Show error message
                    showErrorToast({ message: errorMessage });
                    navigation.goBack();
                    return;
                }

                await fetchGroupChat(
                    propertyDetails,
                    savedData,
                    currentUser,
                    mainApplicantDetails,
                    jointApplicantDetails,
                    refId,
                    syncId
                );
            } else if (currentUser === "J") {
                const { success, errorMessage, propertyDetails, savedData } =
                    await fetchJointApplicationDetails(params, false);

                if (!success) {
                    // Show error message
                    showErrorToast({ message: errorMessage });
                    navigation.goBack();
                    return;
                }

                await fetchGroupChat(
                    propertyDetails,
                    savedData,
                    currentUser,
                    mainApplicantDetails,
                    jointApplicantDetails,
                    refId,
                    syncId
                );
            } else {
                const { success, errorMessage, propertyDetails, savedData } =
                    await fetchApplicationDetails(params, false);

                if (!success) {
                    // Show error message
                    showErrorToast({ message: errorMessage });
                    navigation.goBack();
                    return;
                }

                await fetchGroupChat(
                    propertyDetails,
                    savedData,
                    currentUser,
                    mainApplicantDetails,
                    jointApplicantDetails,
                    refId,
                    syncId
                );
            }
        },
        [navigation]
    );

    const openApplicationDetail = useCallback(
        async (refId) => {
            console.log("[PropertyNotificationLanding] >> [openApplicationDetail]");
            try {
                const encSyncId = await getEncValue(refId);
                const params = {
                    syncId: encSyncId,
                    stpId: "",
                };

                const resultData = await fetchGetApplicants(encSyncId, false);

                if (!resultData?.success) {
                    navigation.goBack();
                    // Show error message
                    showErrorToast({ message: resultData?.errorMessage });
                    return;
                }
                const { mainApplicantDetails, jointApplicantDetails, currentUser, syncId } =
                    resultData;
                if (refId.startsWith("MEAMT") && syncId) {
                    params.syncId = await getEncValue(syncId);
                }
                // Call API to fetch Application Details
                const { success, errorMessage, propertyDetails, savedData, cancelReason } =
                    await fetchApplicationDetails(params);

                if (!success) {
                    // Show error message
                    showErrorToast({ message: errorMessage });
                    navigation.goBack();
                    return;
                }

                // Navigate to details page
                navigation.replace(BANKINGV2_MODULE, {
                    screen: APPLICATION_DETAILS,
                    params: {
                        savedData,
                        propertyDetails,
                        syncId: "",
                        cancelReason,
                        from: "NOTIFICATION",
                        mainApplicantDetails,
                        jointApplicantDetails,
                        currentUser,
                    },
                });
            } catch (error) {
                console.log(error);
                // just go to the property dashboard
                navigation.replace(BANKINGV2_MODULE, {
                    screen: PROPERTY_DASHBOARD,
                });
            }
        },
        [navigation]
    );

    const openJointApplicationDetail = useCallback(
        async (refId) => {
            console.log("[PropertyNotificationLanding] >> [openApplicationDetail]");
            try {
                const encSyncId = await getEncValue(refId);
                const params = {
                    syncId: encSyncId,
                    stpId: "",
                };

                const resultData = await fetchGetApplicants(encSyncId, false);

                if (!resultData?.success) {
                    navigation.goBack();
                    // Show error message
                    showErrorToast({ message: resultData?.errorMessage });
                    return;
                }

                const { mainApplicantDetails, jointApplicantDetails, currentUser } = resultData;

                // Call API to fetch Application Details
                const { success, errorMessage, propertyDetails, savedData, cancelReason } =
                    await fetchJointApplicationDetails(params);

                if (!success) {
                    // Show error message
                    showErrorToast({ message: errorMessage });
                    navigation.goBack();
                    return;
                }

                // Navigate to details page
                navigation.replace(BANKINGV2_MODULE, {
                    screen: APPLICATION_DETAILS,
                    params: {
                        savedData,
                        propertyDetails,
                        syncId: refId,
                        cancelReason,
                        from: "NOTIFICATION",
                        mainApplicantDetails,
                        jointApplicantDetails,
                        currentUser,
                    },
                });
            } catch (error) {
                console.log(error);
                // just go to the property dashboard
                navigation.replace(BANKINGV2_MODULE, {
                    screen: PROPERTY_DASHBOARD,
                });
            }
        },
        [navigation]
    );

    const openLetterOfferList = useCallback(
        async (refId) => {
            console.log("[PropertyNotificationLanding] >> [openLetterOfferList]");

            // L3 call to invoke password page
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
                    console.log(error);
                    navigation.goBack();
                    return;
                }
            }

            const savedData = { stpApplicationId: refId };

            // Navigate to Chat list screen
            navigation.replace(BANKINGV2_MODULE, {
                screen: LETTER_OFFER_LIST,
                params: {
                    savedData,
                    from: "NOTIFICATION",
                },
            });
        },
        [navigation]
    );

    const openCEResult = useCallback(
        async (refId, data, subModule) => {
            console.log("[PropertyNotificationLanding] >> [openApplicationTab]");
            try {
                const syncId = await getEncValue(refId);
                const params = {
                    syncId,
                    stpId: "",
                };

                const resultData = await fetchGetApplicants(params.syncId, false);

                if (!resultData?.success) {
                    navigation.goBack();
                    // Show error message
                    showErrorToast({ message: resultData?.errorMessage });
                    return;
                }

                const { mainApplicantDetails, jointApplicantDetails, currentUser } = resultData;

                const { successRes, result } = await getJAButtonEnabled(false);
                // Show error if failed to fetch MDM data
                if (!successRes) {
                    showErrorToast({
                        message: PROPERTY_MDM_ERR,
                    });
                    navigation.goBack();
                    return;
                }
                const { statusResp, response } = await fetchRFASwitchStatus(false);
                // Show error message
                if (!statusResp) {
                    showErrorToast({
                        message: PROPERTY_MDM_ERR,
                    });
                    navigation.goBack();
                    return;
                }

                const { success, errorMessage, propertyDetails, savedData, cancelReason } =
                    await fetchApplicationDetails(params, false);

                if (!success) {
                    // Show error message
                    showErrorToast({ message: errorMessage });
                    navigation.goBack();
                    return;
                }

                const navParams = await getElgFormData(propertyDetails, savedData, refId);
                const msg = data?.msg;
                navParams.isJAButtonEnabled = result;
                navParams.isRFAButtonEnabled = response;
                navParams.JaHeaderMsg = msg
                    ? msg.substring(0, msg.indexOf("has declined") - 1)
                    : "";
                if (savedData?.status === "ELIGCOMP") {
                    callEligibilityAPIForRemove(navParams, syncId);
                } else {
                    // Navigate to details page
                    navigation.replace(BANKINGV2_MODULE, {
                        screen: APPLICATION_DETAILS,
                        params: {
                            savedData,
                            propertyDetails,
                            syncId: "",
                            cancelReason,
                            from: "NOTIFICATION",
                            mainApplicantDetails,
                            jointApplicantDetails,
                            currentUser,
                            subModule,
                        },
                    });
                }
            } catch (error) {
                console.log(error);
                // just go to the property dashboard
                navigation.replace(BANKINGV2_MODULE, {
                    screen: PROPERTY_DASHBOARD,
                });
            }
        },
        [navigation]
    );

    async function getElgFormData(propertyDetails, savedData, syncId) {
        const navParams = route?.params ?? {};
        const latitude = navParams?.latitude ?? "";
        const longitude = navParams?.longitude ?? "";
        const { age } = await isAgeEligible(savedData?.dob);

        return {
            ...savedData,

            // Common
            latitude,
            longitude,
            propertyDetails,
            age,
            syncId,

            // Property Data
            propertyId: propertyDetails?.property_id ?? "",

            // Input Data
            propertyPrice: savedData?.propertyPriceRaw,
            downPaymentAmount: savedData?.downPaymentAmountRaw,
            loanAmount: savedData?.origLoanAmount,
            origTenure: savedData?.origTenure,
            tenure: savedData?.origTenure,
            spouseIncome: savedData?.spouseIncomeRaw,
            grossIncome: savedData?.grossIncomeRaw,
            origDownPaymentAmount: savedData?.downPaymentAmount,
            housingLoan: savedData?.housingLoan,
            personalLoan: savedData?.personalLoanRaw,
            ccRepayments: savedData?.ccRepaymentsRaw,
            carLoan: savedData?.carLoanRaw,
            overdraft: savedData?.overdraft,
            nonBankCommitments: savedData?.nonBankCommitmentsRaw,
            baseRateLabel: savedData?.baseRateLabel ?? "Base rate",

            // Result Data
            eligibilityResult: {
                dataType: savedData?.dataType,
                aipAmount: savedData?.loanAmountRaw,
                interestRate: savedData?.interestRate,
                tenure: savedData?.recommendedTenure,
                recommendedDownPayment: savedData?.recommendedDownpaymentRaw,
                installmentAmount: savedData?.monthlyInstalmentRaw,
                baseRate: savedData?.baseRate,
                spreadRate: savedData?.spreadRate,
                minTenure: savedData?.minTenure,
                maxTenure: savedData?.maxTenure,
                publicSectorNameFinance: savedData?.publicSectorNameFinance,
            },
            aipAmount: savedData?.loanAmountRaw,
            jaLoanAmount: savedData?.jaLoanAmount,
            recommendedDownpayment: savedData?.recommendedDownpaymentRaw,
            installmentAmount: savedData?.monthlyInstalmentRaw,
            monthlyInstalment: savedData?.monthlyInstalmentRaw,
            stpApplicationId: savedData?.stpApplicationId,
        };
    }

    async function callEligibilityAPIForRemove(navParams, syncId) {
        console.log("[PropertyNotificationLanding] >> [callEligibilityAPIForRemove]");
        const resumeFlow = navParams?.resumeFlow ?? false;

        // Retrieve form data
        const formData = getFormData(navParams);

        //save
        await saveEligibilityInput(
            {
                screenName: CE_COMMITMENTS,
                formData,
                navParams,
                saveData: resumeFlow ? "Y" : "N",
            },
            false
        );

        const mdmData = await getMDMData(false);

        const params = {
            ...navParams,
            applicationStpRefNo: navParams?.stpApplicationId ?? "",
        };

        // Call API to check eligibility
        const { success, errorMessage, stpId, eligibilityResult, overallStatus } =
            await checkEligibility(
                {
                    ...params,
                    mdmData,
                },
                false
            );

        if (!success) {
            // setLoading(false);
            showErrorToast({
                message: errorMessage || COMMON_ERROR_MSG,
            });
            return;
        }
        const { mainApplicantDetails, jointApplicantDetails } = await fetchGetApplicants(syncId);
        const isJointApplicantAdded = false;
        const isMainApplicant = true;
        navParams.eligibilityResult = eligibilityResult;
        navParams.stpApplicationId = stpId;
        navParams.eligibilityStatus = overallStatus;
        navParams.jointApplicantDetails = jointApplicantDetails;
        navParams.mainApplicantDetails = mainApplicantDetails;
        navParams.isJointApplicantAdded = isJointApplicantAdded;
        navParams.isMainApplicant = isMainApplicant;
        navParams.declinedFromJa = true;

        //update UI
        // Navigate to details page

        navigation.replace(BANKINGV2_MODULE, {
            screen: CE_RESULT,
            params: {
                ...navParams,
            },
        });

        // setLoading(false);
    }

    function getFormData(navParams) {
        console.log("[PropertyNotificationLanding] >> [getFormData]");

        return {
            grossIncome: navParams?.grossIncome ?? "",
            houseLoan: navParams?.houseLoan ?? "",
            housingLoan: navParams?.housingLoan ?? "",
            personalLoan: navParams?.personalLoan ?? "",
            ccRepayments: navParams?.ccRepayments ?? "",
            carLoan: navParams?.carLoan ?? "",
            overdraft: navParams?.overdraft ?? "",
            nonBankCommitments: navParams?.nonBankCommitments ?? "",
        };
    }

    const openEligCEResult = useCallback(
        async (refId, data, subModule) => {
            console.log("[PropertyNotificationLanding] >> [openEligCEResult]");
            try {
                const syncId = await getEncValue(refId);
                const params = {
                    syncId,
                    stpId: "",
                };

                const resultData = await fetchGetApplicants(params.syncId, false);

                if (!resultData?.success) {
                    navigation.goBack();
                    // Show error message
                    showErrorToast({ message: resultData?.errorMessage });
                    return;
                }

                const { successRes, result } = await getJAButtonEnabled(false);
                // Show error message
                if (!successRes) {
                    showErrorToast({
                        message: PROPERTY_MDM_ERR,
                    });
                    navigation.goBack();
                    return;
                }

                const { statusResp, response } = await fetchRFASwitchStatus(false);
                // Show error message
                if (!statusResp) {
                    showErrorToast({
                        message: PROPERTY_MDM_ERR,
                    });
                    navigation.goBack();
                    return;
                }

                const { mainApplicantDetails, jointApplicantDetails, currentUser } = resultData;

                const { success, errorMessage, propertyDetails, savedData, cancelReason } =
                    await fetchApplicationDetails(params, false);

                if (!success) {
                    showErrorToast({ message: errorMessage });
                    return;
                }

                const navParams = await getCEResultNavParams(propertyDetails, savedData, refId);
                const msg = data?.msg;
                navParams.JaHeaderMsg = msg
                    ? msg.substring(0, msg.indexOf("has accepted") - 1)
                    : "";
                navParams.jaEligResult = true;
                navParams.isJointApplicantAdded = true;
                navParams.isMainApplicant = true;
                navParams.subModule = subModule;
                navParams.isJAButtonEnabled = result;
                navParams.isRFAButtonEnabled = response;
                if (savedData?.status === "ELIGCOMP") {
                    navigation.replace(BANKINGV2_MODULE, {
                        screen: CE_RESULT,
                        params: {
                            ...navParams,
                            mainApplicantDetails,
                            jointApplicantDetails,
                            currentUser,
                        },
                    });
                } else {
                    // Navigate to details page
                    navigation.replace(BANKINGV2_MODULE, {
                        screen: APPLICATION_DETAILS,
                        params: {
                            savedData,
                            propertyDetails,
                            syncId: "",
                            cancelReason,
                            from: "NOTIFICATION",
                            mainApplicantDetails,
                            jointApplicantDetails,
                            currentUser,
                        },
                    });
                }
            } catch (error) {
                console.log(error);
                // just go to the property dashboard
                navigation.replace(BANKINGV2_MODULE, {
                    screen: PROPERTY_DASHBOARD,
                });
            }
        },
        [navigation]
    );

    const openJaPendingInvitation = useCallback(async () => {
        console.log("[PropertyNotificationLanding] >> [openApplicationTab]");
        try {
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

            navigation.reset({
                index: 0,
                routes: [
                    {
                        name: PROPERTY_DASHBOARD,
                        params: {
                            activeTabIndex: 1,
                            reload: true,
                        },
                    },
                ],
            });
        } catch (error) {
            console.log(error);
            // just go to the property dashboard
            navigation.replace(BANKINGV2_MODULE, {
                screen: PROPERTY_DASHBOARD,
            });
        }
    }, [navigation]);

    const handleRedirection = useCallback(
        (refId, subModule, data) => {
            console.log("[PropertyNotificationLanding] >> [handleRedirection]", refId, data);

            if (refId && data) {
                if (subModule === "NEW_MESSAGE") {
                    openChat(refId, data);
                } else if (subModule === "SALES_REP_ASSIGNED") {
                    openChat(refId, data);
                } else if (subModule === "APPLICATION_DETAIL") {
                    openApplicationDetail(refId, data);
                } else if (subModule === "LETTER_OF_OFFER") {
                    openLetterOfferList(refId, data);
                } else if (subModule === "PROPERTY_JOINT_APPLICANT") {
                    openJaPendingInvitation(refId, data);
                } else if (subModule === "JOINT_APPLICANT_DETAIL") {
                    openJointApplicationDetail(refId, data);
                } else if (subModule === "JA_APPL_REJECT") {
                    openCEResult(refId, data, subModule);
                } else if (subModule === "JA_ELIG_FAIL" || subModule === "JA_ELIG_PASS") {
                    openEligCEResult(refId, data, subModule);
                } else {
                    // just go to the property dashboard
                    navigation.replace(BANKINGV2_MODULE, {
                        screen: PROPERTY_DASHBOARD,
                    });
                }
            }
        },
        [openChat, openApplicationDetail]
    );

    useEffect(() => {
        const refId = route?.params?.refId;
        const data = route?.params?.data;
        const subModule = route?.params?.subModule;
        if (refId && data) handleRedirection(String(refId), subModule, data);
    }, [route, handleRedirection]);

    return (
        <View style={styles.container}>
            <ScreenLoader showLoader />
        </View>
    );
}

PropertyNotificationLanding.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default PropertyNotificationLanding;
