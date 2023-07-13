/* eslint-disable react-hooks/exhaustive-deps */
import { useNavigationState } from "@react-navigation/native";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { StyleSheet, ScrollView, View } from "react-native";

import {
    JA_CEF_IN_DECLARATION,
    BANKINGV2_MODULE,
    JA_TNC,
    JA_CONFIRMATION,
    APPLICATION_DETAILS,
    PROPERTY_DASHBOARD,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { getJointApplicationDetails } from "@services";
import { logEvent } from "@services/analytics";

import { MEDIUM_GREY, YELLOW, DISABLED, BLACK, DISABLED_TEXT, SEPARATOR } from "@constants/colors";
import {
    COMMON_ERROR_MSG,
    SAVE,
    DONT_SAVE,
    EXIT_POPUP_DESC,
    PROP_PURCHASE_LBL,
    ONGOING_LOAN_LBL,
    LEAVE,
    GO_BACK,
    CANCEL_EDITS,
    CANCEL_EDITS_DESC,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    FA_FORM_PROCEED,
    FA_SELECT_ACTION,
    FA_ACTION_NAME,
    APPLICATION_REMOVE_TITLE,
    APPLICATION_REMOVE_DESCRIPTION,
    OKAY,
    EXIT_JA_POPUP_TITLE,
    FA_PROPERTY_CE_ADDITIONALINFORMATION,
    FA_PROPERTY_CE_SAVEPROGRESS,
    FA_PROPERTY_JACEJA_APPLICATIONREMOVED,
    FA_PROPERTY_JACEJA_ADDITIONAINFO,
    EDIT,
    EDIT_PERSONAL_DETAILS,
    ADDITIONAL_INFORMATION_REQUIRED,
    DECLARATION,
    PLSTP_AGREE,
} from "@constants/strings";

import { fetchGetApplicants } from "../Application/LAController";
import { getEncValue } from "../Common/PropertyController";
import RadioYesNo from "../Common/RadioYesNo";
import { saveEligibilityInput, removeCEEditRoutes } from "./JAController";

function JACEFinDeclaration({ route, navigation }) {
    const navigationState = useNavigationState((state) => state);

    // const [headerText, setHeaderText] = useState("");
    const [loading, setLoading] = useState(true);
    const [propertyPurchase, setPropertyPurchase] = useState(false);
    const [ongoingLoan, setOngoingLoan] = useState(false);

    const [showExitPopup, setShowExitPopup] = useState(false);
    const [cancelEditPopup, setCancelEditPopup] = useState(false);

    const [isContinueDisabled, setContinueDisabled] = useState(true);
    const [showApplicationRemovePopup, setShowApplicationRemovePopup] = useState(false);
    const [editFlow, setEditFlow] = useState(false);

    useEffect(() => {
        init();
    }, []);

    // Used to check if all fields are filled in, then accordingly enable/disable "Continue" btn
    useEffect(() => {
        setContinueDisabled(!(propertyPurchase && ongoingLoan));
    }, [propertyPurchase, ongoingLoan]);

    const init = () => {
        console.log("[JACEFinDeclaration] >> [init]");

        const navParams = route?.params ?? {};
        const resumeFlow = navParams?.resumeFlow ?? false;
        const paramsEditFlow = navParams?.editFlow ?? false;

        // Pre-populate data for resume OR edit flow
        if (resumeFlow || paramsEditFlow) {
            populateSavedData();
        } else {
            setPropertyPurchase("Y");
            setOngoingLoan("N");
        }
        setLoading(false);
    };

    function onBackPress() {
        console.log("[JACEFinDeclaration] >> [onBackPress]");

        navigation.goBack();
    }

    async function onCloseTap() {
        console.log("[JACEFinDeclaration] >> [onCloseTap]");

        const navParams = route?.params ?? {};
        const getSyncId = navParams?.syncId ?? "";
        const encSyncId = await getEncValue(getSyncId);
        const { success, errorMessage, jointApplicantDetails } = await fetchGetApplicants(
            encSyncId,
            false
        );
        if (!success) {
            // Show error message
            showErrorToast({ message: errorMessage });
            return;
        }
        if (!jointApplicantDetails) {
            setShowApplicationRemovePopup(true);
            logEvent(FA_VIEW_SCREEN, {
                [FA_SCREEN_NAME]: FA_PROPERTY_JACEJA_APPLICATIONREMOVED,
            });
            return;
        }
        setShowExitPopup(true);

        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_PROPERTY_CE_SAVEPROGRESS,
        });
    }

    function populateSavedData() {
        console.log("[JACEFinDeclaration] >> [populateSavedData]");

        // propertyPurchase,
        // ongoingLoan,

        const navParams = route?.params ?? {};
        const savedData = navParams?.savedData ?? {};
        const paramsEditFlow = navParams?.editFlow ?? false;

        const savedPropertyPurchase = savedData?.propertyPurchase ?? null;
        const editPropertyPurchase = navParams?.propertyPurchase ?? null;
        const tempPropertyPurchase = paramsEditFlow ? editPropertyPurchase : savedPropertyPurchase;

        const savedOngoingLoan = savedData?.ongoingLoan ?? null;
        const editOngoingLoan = navParams?.ongoingLoan ?? null;
        const tempOngoingLoan = paramsEditFlow ? editOngoingLoan : savedOngoingLoan;

        // Property purchase
        if (tempPropertyPurchase) setPropertyPurchase(tempPropertyPurchase);

        // Ongoing loan
        if (tempOngoingLoan) setOngoingLoan(tempOngoingLoan);

        // Changes specific to edit flow
        if (paramsEditFlow) {
            setEditFlow(paramsEditFlow);
            // setHeaderText(EDIT_FIN_DETAILS);
        }
    }

    async function onExitPopupSave() {
        console.log("[JACEFinDeclaration] >> [onExitPopupSave]");

        // Hide popup
        closeExitPopup();

        // Retrieve form data
        const formData = getFormData();
        const navParams = route?.params;
        navParams.saveData = "Y";
        // Save Form Data in DB before exiting the flow
        const { success, errorMessage } = await saveEligibilityInput({
            screenName: JA_CEF_IN_DECLARATION,
            formData,
            navParams,
        });

        if (success) {
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
        } else {
            showErrorToast({
                message: errorMessage || COMMON_ERROR_MSG,
            });
        }

        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_PROPERTY_CE_SAVEPROGRESS,
            [FA_ACTION_NAME]: SAVE,
        });
    }

    function onExitPopupDontSave() {
        console.log("[JACEFinDeclaration] >> [onExitPopupDontSave]");

        // Hide popup
        closeExitPopup();

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
    }

    function closeCancelRemovePopup() {
        setShowApplicationRemovePopup(false);
        reloadApplicationDetails();
    }
    function closeRemoveAppPopup() {
        setShowApplicationRemovePopup(false);
        reloadApplicationDetails();
    }

    async function reloadApplicationDetails() {
        const navParams = route?.params ?? {};
        const encSyncId = await getEncValue(navParams?.syncId ?? "");
        // Request object
        const params = {
            syncId: encSyncId,
            stpId: "",
        };

        // Call Application details API to fetch latest details
        getJointApplicationDetails(params, true)
            .then((httpResp) => {
                console.log(
                    "[JACEFinDeclaration][getJointApplicationDetails] >> Response: ",
                    httpResp
                );
                const result = httpResp?.data?.result ?? {};
                const statusCode = result?.statusCode ?? null;
                const statusDesc = result?.statusDesc ?? COMMON_ERROR_MSG;
                const savedData = result?.savedData ?? null;
                const propertyDetails = result?.propertyDetails ?? null;
                const cancelReason = result?.cancelReason ?? null;
                // const message = "Cancelled by main applicant";
                if (statusCode === "0000" && savedData) {
                    // Navigate to Applications Details screen with updated params
                    if (savedData?.isSaveData === "Y") {
                        navigation.navigate(BANKINGV2_MODULE, {
                            screen: APPLICATION_DETAILS,
                            params: {
                                ...navParams,
                                savedData,
                                cancelReason,
                                propertyDetails,
                                reload: true,
                            },
                        });
                    } else {
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
                    }
                } else {
                    // Show error message
                    showErrorToast({ message: statusDesc ?? COMMON_ERROR_MSG });
                    setLoading(false);
                }
            })
            .catch((error) => {
                console.log(
                    "[JACEFinDeclaration][getJointApplicationDetails] >> Exception: ",
                    error
                );

                // Show error message
                showErrorToast({ message: error?.message ?? COMMON_ERROR_MSG });
            });
    }

    function closeExitPopup() {
        console.log("[JACEFinDeclaration] >> [closeExitPopup]");

        setShowExitPopup(false);

        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_PROPERTY_CE_SAVEPROGRESS,
            [FA_ACTION_NAME]: DONT_SAVE,
        });
    }

    function onCancelEditPopupLeave() {
        console.log("[JACEFinDeclaration] >> [onCancelEditPopupLeave]");

        // Hide popup
        closeCancelEditPopup();

        // Removes all Eligibility edit flow screens
        const updatedRoutes = removeCEEditRoutes(navigationState?.routes ?? []);

        // Navigate to Eligibility Confirmation screen
        navigation.reset({
            index: updatedRoutes.length - 1,
            routes: updatedRoutes,
        });
    }

    function closeCancelEditPopup() {
        console.log("[JACEFinDeclaration] >> [closeCancelEditPopup]");

        setCancelEditPopup(false);
    }

    function onPropertyPurchaseChange(value) {
        console.log("[JACEFinDeclaration] >> [onPropertyPurchaseChange]");

        setPropertyPurchase(value);
    }

    function onOngoingLoanChange(value) {
        console.log("[JACEFinDeclaration] >> [onOngoingLoanChange]");

        setOngoingLoan(value);
    }

    function onContinue() {
        console.log("[JACEFinDeclaration] >> [onContinue]");

        // Call Check Eligibility API
        callEligibilityInput();

        logEvent(FA_FORM_PROCEED, {
            [FA_SCREEN_NAME]: FA_PROPERTY_CE_ADDITIONALINFORMATION,
        });
    }

    function getFormData() {
        console.log("[JACEFinDeclaration] >> [getFormData]");

        return {
            propertyPurchase,
            ongoingLoan,
        };
    }

    async function callEligibilityInput() {
        setLoading(true);
        console.log("[JACEFinDeclaration] >> [callEligibilityInput]");
        const navParams = route?.params ?? {};
        const resumeFlow = navParams?.resumeFlow ?? false;
        // Retrieve form data
        const formData = getFormData();
        const getSyncId = navParams?.syncId ?? "";
        const encSyncId = await getEncValue(getSyncId);
        const { success, errorMessage, jointApplicantDetails } = await fetchGetApplicants(
            encSyncId,
            false
        );
        if (!success) {
            // Show error message
            showErrorToast({ message: errorMessage });
            return;
        }
        if (!jointApplicantDetails) {
            setShowApplicationRemovePopup(true);
            logEvent(FA_VIEW_SCREEN, {
                [FA_SCREEN_NAME]: FA_PROPERTY_JACEJA_APPLICATIONREMOVED,
            });
            return;
        }
        // Save Input data before checking eligibility
        const { syncId } = await saveEligibilityInput(
            {
                screenName: JA_CEF_IN_DECLARATION,
                formData,
                navParams: route?.params,
                editFlow,
                saveData: resumeFlow ? "Y" : "N",
            },
            false
        );
        navigation.navigate(BANKINGV2_MODULE, {
            screen: editFlow ? JA_CONFIRMATION : JA_TNC,
            params: {
                ...navParams,
                ...formData,
                syncId,
            },
        });
        setLoading(false);
    }

    return (
        <>
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                showLoaderModal={loading}
                analyticScreenName={FA_PROPERTY_JACEJA_ADDITIONAINFO}
            >
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={onBackPress} />}
                            headerCenterElement={
                                editFlow ? (
                                    <Typo
                                        text={EDIT}
                                        fontWeight="600"
                                        fontSize={12}
                                        lineHeight={16}
                                        color={BLACK}
                                    />
                                ) : (
                                    <></>
                                )
                            }
                            headerRightElement={
                                editFlow ? <></> : <HeaderCloseButton onPress={onCloseTap} />
                            }
                        />
                    }
                    paddingHorizontal={0}
                    paddingBottom={0}
                    paddingTop={24}
                    useSafeArea
                >
                    <>
                        <ScrollView style={Style.container} showsVerticalScrollIndicator={false}>
                            {/* Title */}
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={24}
                                text={
                                    editFlow
                                        ? EDIT_PERSONAL_DETAILS
                                        : ADDITIONAL_INFORMATION_REQUIRED
                                }
                                numberOfLines={2}
                                textAlign="left"
                                style={Style.headerText}
                            />

                            {/* Property Purchase Selection */}
                            <RadioYesNo
                                label={PROP_PURCHASE_LBL}
                                defaultValue={propertyPurchase}
                                onChange={onPropertyPurchaseChange}
                            />

                            {/* Ongoing Loan Selection */}
                            <RadioYesNo
                                label={ONGOING_LOAN_LBL}
                                defaultValue={ongoingLoan}
                                onChange={onOngoingLoanChange}
                            />
                            <View style={Style.graySeparator} />

                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={24}
                                text={DECLARATION}
                                textAlign="left"
                                style={Style.headerText}
                            />

                            <Typo
                                fontSize={14}
                                lineHeight={24}
                                text="I am/We are aware that margin of finance for third residential property is up to 70% of Open Market Value or Sale & Purchase Price - whichever is lower"
                                textAlign="left"
                                style={Style.declarationText}
                            />
                            <Typo
                                fontSize={14}
                                lineHeight={24}
                                text="I/We hereby acknowledge that the processing of my/our mortage loan/financing is based partly on this Declaration. I/We further confirm that this Declaration is true and accurate as regards to the purpose intended."
                                textAlign="left"
                                style={Style.declarationText}
                            />
                        </ScrollView>
                        <FixedActionContainer>
                            <ActionButton
                                disabled={isContinueDisabled}
                                activeOpacity={isContinueDisabled ? 1 : 0.5}
                                backgroundColor={isContinueDisabled ? DISABLED : YELLOW}
                                fullWidth
                                componentCenter={
                                    <Typo
                                        color={isContinueDisabled ? DISABLED_TEXT : BLACK}
                                        lineHeight={18}
                                        fontWeight="600"
                                        text={PLSTP_AGREE}
                                    />
                                }
                                onPress={onContinue}
                            />
                        </FixedActionContainer>
                    </>
                </ScreenLayout>
            </ScreenContainer>

            {/* Exit confirmation popup */}
            <Popup
                visible={showExitPopup}
                title={EXIT_JA_POPUP_TITLE}
                description={EXIT_POPUP_DESC}
                onClose={closeExitPopup}
                primaryAction={{
                    text: SAVE,
                    onPress: onExitPopupSave,
                }}
                secondaryAction={{
                    text: DONT_SAVE,
                    onPress: onExitPopupDontSave,
                }}
            />

            {/* Cancel edit confirmation popup */}
            <Popup
                visible={cancelEditPopup}
                title={CANCEL_EDITS}
                description={CANCEL_EDITS_DESC}
                onClose={closeCancelEditPopup}
                primaryAction={{
                    text: LEAVE,
                    onPress: onCancelEditPopupLeave,
                }}
                secondaryAction={{
                    text: GO_BACK,
                    onPress: closeCancelEditPopup,
                }}
            />
            {/*Application Removed popup */}
            <Popup
                visible={showApplicationRemovePopup}
                title={APPLICATION_REMOVE_TITLE}
                description={APPLICATION_REMOVE_DESCRIPTION}
                onClose={closeRemoveAppPopup}
                primaryAction={{
                    text: OKAY,
                    onPress: closeCancelRemovePopup,
                }}
            />
        </>
    );
}

JACEFinDeclaration.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

const Style = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 36,
    },

    declarationText: {
        marginBottom: 15,
    },

    graySeparator: {
        borderColor: SEPARATOR,
        borderTopWidth: 1,
        flex: 1,
        height: 1,
        marginBottom: 25,
    },
    headerText: {
        marginBottom: 15,
    },
});

export default JACEFinDeclaration;
