import { useNavigationState } from "@react-navigation/native";
import PropTypes from "prop-types";
import React, { useEffect, useReducer, useCallback, useState } from "react";
import { StyleSheet, ScrollView } from "react-native";

import {
    JA_ADDITIONAL,
    BANKINGV2_MODULE,
    JA_CONFIRMATION,
    JA_RESULT,
    PROPERTY_DASHBOARD,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import { ScrollPickerView } from "@components/Common/ScrollPickerView";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import LabeledDropdown from "@components/FormComponents/LabeledDropdown";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { logEvent } from "@services/analytics";

import { MEDIUM_GREY, DISABLED, YELLOW, DISABLED_TEXT, BLACK } from "@constants/colors";
import {
    SAVE_NEXT,
    PLEASE_SELECT,
    DONE,
    CANCEL,
    COMMON_ERROR_MSG,
    SAVE,
    DONT_SAVE,
    CONFIRM,
    SOURCE_WEALTH,
    PLSTP_PRIMARY_INCOME,
    JA_ADDITIONAL_TEXT,
    JOINT_APPLICATION,
    APPLICATION_REMOVE_TITLE,
    APPLICATION_REMOVE_DESCRIPTION,
    OKAY,
    EXIT_POPUP_DESC,
    EXIT_JA_POPUP_TITLE,
    FA_PROPERTY_APPLYLOAN_ADDITIONALINFO,
    FA_PROPERTY_JACEJA_APPLICATIONREMOVED,
    SAVE_AND_NEXT,
    ADDITIONAL_INFORMATION,
    PRIMARY_SOURCE_WEALTH,
    PRIMARY_SOURCE_OF_WEALTH_INFO_DESC,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    FA_FORM_PROCEED,
} from "@constants/strings";

import { fetchGetApplicants } from "../Application/LAController";
import { useResetNavigation, getExistingData, getEncValue } from "../Common/PropertyController";
import {
    saveJAInput,
    checkEligibilityForJointApplicant,
    removeInputFormRoutes,
    saveEligibilityInput,
} from "./JAController";

// Initial state object
const initialState = {
    // Primary income related
    fund: PLEASE_SELECT,
    fundValue: null,
    fundValueIndex: 0,
    fundData: null,
    fundPicker: false,
    fundObj: null,

    // Primary source of income related
    wealth: PLEASE_SELECT,
    wealthValue: null,
    wealthValueIndex: 0,
    wealthData: null,
    wealthPicker: false,
    wealthObj: null,

    isCustomerHighRisk: false,

    // Info Popup related
    showInfoPopup: false,
    popupTitle: "",
    popupDescription: "",

    // UI Labels
    headerText: "",
    ctaText: SAVE_NEXT,

    // Others
    editFlow: false,
    showExitPopup: false,
    isContinueDisabled: true,
    pickerType: null,
};

function reducer(state, action) {
    const { actionType, payload } = action;
    switch (actionType) {
        case "HIDE_PICKER":
            return {
                ...state,
                pickerType: null,
                fundPicker: false,
                wealthPicker: false,
            };
        case "SHOW_PICKER":
            return {
                ...state,
                pickerType: payload,
                fundPicker: payload === "fund",
                wealthPicker: payload === "wealth",
            };
        case "HIDE_INFO_POPUP":
            return {
                ...state,
                showInfoPopup: false,
            };
        case "SHOW_INFO_POPUP":
            return {
                ...state,
                showInfoPopup: true,
                popupTitle: payload?.popupTitle,
                popupDescription: payload?.popupDescription,
            };
        case "SET_UI_LABELS":
        case "SET_PICKER_DATA":
        case "SET_FUND":
        case "SET_WEALTH":
            return {
                ...state,
                ...payload,
            };
        case "SET_CUSTOMER_RISK_RATING":
            return {
                ...state,
                isCustomerHighRisk: payload,
            };
        case "SET_CONTINUE_DISABLED":
            return {
                ...state,
                isContinueDisabled: payload,
            };
        case "SHOW_EXIT_POPUP":
            return {
                ...state,
                showExitPopup: payload,
            };
        case "SET_EDIT_FLAG":
            return {
                ...state,
                editFlow: payload,
            };
        case "SHOW_APPLICATION_REMOVE_POPUP":
            return {
                ...state,
                showApplicationRemovePopup: payload,
            };
        default:
            return { ...state };
    }
}

function JAAdditional({ route, navigation }) {
    const [resetToApplication] = useResetNavigation(navigation);
    const [state, dispatch] = useReducer(reducer, initialState);
    const [loading, setLoading] = useState(true);
    const navigationState = useNavigationState((state) => state);
    const { isContinueDisabled, fund, wealth, editFlow } = state;

    useEffect(() => {
        init();
    }, [init]);

    // Used to check if all fields are filled in, then accordingly enable/disable "Confirm" btn
    useEffect(() => {
        dispatch({
            actionType: "SET_CONTINUE_DISABLED",
            payload: fund === PLEASE_SELECT || wealth === PLEASE_SELECT,
        });
    }, [fund, wealth]);

    const init = useCallback(() => {
        console.log("[JAAdditional] >> [init]");

        // Populate Picker Data
        setPickerData();

        // Prepopulate any existing details
        prepopulateData();
        setLoading(false);
    }, [setPickerData, prepopulateData]);

    function onBackTap() {
        console.log("[JAAdditional] >> [onBackTap]");

        navigation.goBack();
    }

    const prepopulateData = useCallback(() => {
        console.log("[JAAdditional] >> [prepopulateData]");

        const navParams = route?.params ?? {};
        const masterData = navParams?.masterData ?? {};
        const savedData = navParams?.savedData ?? {};

        const paramsEditFlow = navParams?.editFlow ?? false;
        const headerText = navParams?.headerText;
        const customerRiskRating = navParams?.customerRiskRating === "HR" ? true : false;
        const { sourceOfFund, sourceOfWealth } = getUIData(navParams, savedData, paramsEditFlow);

        // Set Edit Flag
        dispatch({
            actionType: "SET_EDIT_FLAG",
            payload: paramsEditFlow,
        });

        // Set UI labels
        dispatch({
            actionType: "SET_UI_LABELS",
            payload: {
                headerText: paramsEditFlow ? "Edit additional details" : headerText,
                ctaText: paramsEditFlow ? CONFIRM : SAVE_NEXT,
            },
        });

        // Primary income
        if (sourceOfFund) {
            const fundSelect = getExistingData(
                sourceOfFund,
                masterData?.sourceOfFundOrigin ?? null
            );
            dispatch({
                actionType: "SET_FUND",
                payload: {
                    fund: fundSelect.name,
                    fundValue: fundSelect.value,
                    fundObj: fundSelect.obj,
                    fundValueIndex: fundSelect.index,
                },
            });
        }

        // Primary source of income
        if (sourceOfWealth) {
            const wealthSelect = getExistingData(
                sourceOfWealth,
                masterData?.sourceOfWealthOrigin ?? null
            );
            dispatch({
                actionType: "SET_WEALTH",
                payload: {
                    wealth: wealthSelect.name,
                    wealthValue: wealthSelect.value,
                    wealthObj: wealthSelect.obj,
                    wealthValueIndex: wealthSelect.index,
                },
            });
        }

        // set cust risk rating
        dispatch({
            actionType: "SET_CUSTOMER_RISK_RATING",
            payload: customerRiskRating,
        });
    }, [route?.params]);

    const setPickerData = useCallback(() => {
        console.log("[JAAdditional] >> [setPickerData]");

        const masterData = route.params?.masterData ?? {};

        dispatch({
            actionType: "SET_PICKER_DATA",
            payload: {
                fundData: masterData?.sourceOfFundOrigin ?? null,
                wealthData: masterData?.sourceOfWealthOrigin ?? null,
            },
        });
    }, [route?.params?.masterData]);

    function getUIData(navParams, savedData, paramsEditFlow) {
        console.log("[JAAdditional] >> [getUIData]");

        if (paramsEditFlow) {
            return {
                sourceOfFund: navParams?.primaryIncome,
                sourceOfWealth: navParams?.primarySourceOfIncome,
            };
        } else {
            return {
                sourceOfFund: savedData?.primaryIncome,
                sourceOfWealth: savedData?.primarySourceOfIncome,
            };
        }
    }

    function onPickerCancel() {
        console.log("[JAAdditional] >> [onPickerCancel]");

        dispatch({
            actionType: "HIDE_PICKER",
            payload: true,
        });
    }

    function onPickerDone(item, index) {
        console.log("[JAAdditional] >> [onPickerDone]");

        const { pickerType } = state;

        switch (pickerType) {
            case "fund":
                dispatch({
                    actionType: "SET_FUND",
                    payload: {
                        fund: item?.name ?? PLEASE_SELECT,
                        fundValue: item?.value ?? null,
                        fundObj: item,
                        fundValueIndex: index,
                    },
                });
                break;
            case "wealth":
                dispatch({
                    actionType: "SET_WEALTH",
                    payload: {
                        wealth: item?.name ?? PLEASE_SELECT,
                        wealthValue: item?.value ?? null,
                        wealthObj: item,
                        wealthValueIndex: index,
                    },
                });
                break;
            default:
                break;
        }

        // Close picker
        onPickerCancel();
    }

    function onFundTap() {
        console.log("[JAAdditional] >> [onFundTap]");

        dispatch({
            actionType: "SHOW_PICKER",
            payload: "fund",
        });
    }

    function onWealthTap() {
        console.log("[JAAdditional] >> [onWealthTap]");

        dispatch({
            actionType: "SHOW_PICKER",
            payload: "wealth",
        });
    }

    function onWealthInfoTap({ title, desc }) {
        console.log("[JAAdditional] >> [onWealthInfoTap]");

        dispatch({
            actionType: "SHOW_INFO_POPUP",
            payload: { popupTitle: title, popupDescription: desc },
        });
    }

    function closeInfoPopup() {
        console.log("[JAAdditional] >> [closeInfoPopup]");

        dispatch({
            actionType: "HIDE_INFO_POPUP",
            payload: null,
        });
    }

    async function onExitPopupSave() {
        console.log("[JAAdditional] >> [onExitPopupSave]");

        // Hide popup
        closeExitPopup();

        // Retrieve form data
        const formData = getFormData();
        const navParams = route?.params;
        navParams.saveData = "Y";

        // Save Form Data in DB before exiting the flow
        const { success, errorMessage } = await saveEligibilityInput({
            screenName: JA_ADDITIONAL,
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
    }

    function onExitPopupDontSave() {
        console.log("[JAAdditional] >> [onExitPopupDontSave]");

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

    function closeExitPopup() {
        console.log("[JAAdditional] >> [closeExitPopup]");

        dispatch({
            actionType: "SHOW_EXIT_POPUP",
            payload: false,
        });
    }
    function closeCancelRemovePopup() {
        dispatch({
            actionType: "SHOW_APPLICATION_REMOVE_POPUP",
            payload: false,
        });
        resetToApplication();
    }
    function closeRemoveAppPopup() {
        dispatch({
            actionType: "SHOW_APPLICATION_REMOVE_POPUP",
            payload: false,
        });
    }
    async function onContinue() {
        console.log("[JAAdditional] >> [onContinue]");

        const navParams = route?.params ?? {};
        const navigationRoutes = navigationState?.routes ?? [];
        const updatedRoutes = removeInputFormRoutes(navigationRoutes);
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
            dispatch({
                actionType: "SHOW_APPLICATION_REMOVE_POPUP",
                payload: true,
            });
            logEvent(FA_VIEW_SCREEN, {
                [FA_SCREEN_NAME]: FA_PROPERTY_JACEJA_APPLICATIONREMOVED,
            });
            return;
        }

        if (editFlow) {
            // Navigate to Confirmation screen
            navigation.navigate(BANKINGV2_MODULE, {
                screen: JA_CONFIRMATION,
                params: {
                    ...navParams,
                    ...formData,
                    updateData: true,
                    editScreenName: JA_ADDITIONAL,
                },
            });
        } else {
            setLoading(true);
            // Save Form Data in DB before moving to next screen
            await saveJAInput({
                screenName: JA_ADDITIONAL,
                formData,
                navParams,
            });
            const {
                success,
                errorMessage,
                stpId,
                eligibilityResult,
                overallStatus,
                baseRateLabel,
            } = await checkEligibilityForJointApplicant(
                {
                    ...navParams,
                },
                true
            );
            if (!success) {
                setLoading(false);
                showErrorToast({
                    message: errorMessage || COMMON_ERROR_MSG,
                });
                return;
            }
            const nextScreen = {
                name: JA_RESULT,
                params: {
                    ...navParams,
                    stpApplicationId: stpId,
                    eligibilityResult,
                    eligibilityStatus: overallStatus,
                    isEditFlow: editFlow,
                    editFlow: null,
                    baseRateLabel,
                },
            };
            updatedRoutes.push(nextScreen);

            // Navigate to Eligibility result screen
            navigation.reset({
                index: updatedRoutes.length - 1,
                routes: updatedRoutes,
            });
            setLoading(false);
        }
        logEvent(FA_FORM_PROCEED, {
            [FA_SCREEN_NAME]: FA_PROPERTY_APPLYLOAN_ADDITIONALINFO,
        });
    }

    function getFormData() {
        console.log("[JAAdditional] >> [getFormData]");

        const { fundValue, wealthValue } = state;

        return {
            primaryIncome: fundValue,
            primarySourceOfIncome: wealthValue,
        };
    }

    return (
        <ScreenContainer
            backgroundType="color"
            backgroundColor={MEDIUM_GREY}
            showLoaderModal={loading}
            analyticScreenName={FA_PROPERTY_APPLYLOAN_ADDITIONALINFO}
        >
            <>
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                            headerCenterElement={
                                editFlow ? (
                                    <></>
                                ) : (
                                    <Typo
                                        fontSize={16}
                                        fontWeight="600"
                                        lineHeight={19}
                                        text={ADDITIONAL_INFORMATION}
                                    />
                                )
                            }
                        />
                    }
                    paddingHorizontal={0}
                    paddingBottom={0}
                    paddingTop={24}
                    useSafeArea
                >
                    <>
                        <ScrollView
                            style={Style.scrollContainer}
                            showsVerticalScrollIndicator={false}
                        >
                            <Typo
                                fontWeight="600"
                                lineHeight={18}
                                text={JOINT_APPLICATION}
                                textAlign="left"
                            />

                            {/* Header */}
                            {!editFlow && (
                                <Typo
                                    fontSize={20}
                                    fontWeight="300"
                                    lineHeight={28}
                                    style={Style.headerText}
                                    text={JA_ADDITIONAL_TEXT}
                                    textAlign="left"
                                />
                            )}

                            {/* Primary income */}
                            <LabeledDropdown
                                label={PLSTP_PRIMARY_INCOME}
                                dropdownValue={fund}
                                onPress={onFundTap}
                                style={Style.fieldViewCls}
                            />

                            {/* Primary source of income */}
                            <LabeledDropdown
                                label={SOURCE_WEALTH}
                                dropdownValue={wealth}
                                isValid={state.occupationValid}
                                onPress={onWealthTap}
                                style={Style.fieldViewCls}
                                infoDetail={{
                                    title: PRIMARY_SOURCE_WEALTH,
                                    desc: PRIMARY_SOURCE_OF_WEALTH_INFO_DESC,
                                }}
                                onInfoPress={onWealthInfoTap}
                            />
                        </ScrollView>

                        {/* Bottom  button container */}
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
                                        text={state.editFlow ? SAVE_AND_NEXT : state.ctaText}
                                    />
                                }
                                onPress={onContinue}
                            />
                        </FixedActionContainer>
                    </>
                </ScreenLayout>

                {/* Info Popup */}
                <Popup
                    visible={state.showInfoPopup}
                    title={state.popupTitle}
                    description={state.popupDescription}
                    onClose={closeInfoPopup}
                />

                {/* Primary income Picker */}
                {state.fundData && (
                    <ScrollPickerView
                        showMenu={state.fundPicker}
                        list={state.fundData}
                        selectedIndex={state.fundValueIndex}
                        onRightButtonPress={onPickerDone}
                        onLeftButtonPress={onPickerCancel}
                        rightButtonText={DONE}
                        leftButtonText={CANCEL}
                    />
                )}

                {/* Primary source of income Picker */}
                {state.wealthData && (
                    <ScrollPickerView
                        showMenu={state.wealthPicker}
                        list={state.wealthData}
                        selectedIndex={state.wealthValueIndex}
                        onRightButtonPress={onPickerDone}
                        onLeftButtonPress={onPickerCancel}
                        rightButtonText={DONE}
                        leftButtonText={CANCEL}
                    />
                )}

                {/* Exit confirmation popup */}
                <Popup
                    visible={state.showExitPopup}
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
                {/*Application Removed popup */}
                <Popup
                    visible={state.showApplicationRemovePopup}
                    title={APPLICATION_REMOVE_TITLE}
                    description={APPLICATION_REMOVE_DESCRIPTION}
                    onClose={closeRemoveAppPopup}
                    primaryAction={{
                        text: OKAY,
                        onPress: closeCancelRemovePopup,
                    }}
                />
            </>
        </ScreenContainer>
    );
}

JAAdditional.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

const Style = StyleSheet.create({
    fieldViewCls: {
        marginTop: 25,
    },

    headerText: {
        paddingTop: 8,
    },

    scrollContainer: {
        flex: 1,
        marginHorizontal: 36,
    },
});

export default JAAdditional;
