/* eslint-disable react-hooks/exhaustive-deps */
import PropTypes from "prop-types";
import React, { useEffect, useReducer, useCallback, useState } from "react";
import { StyleSheet, ScrollView } from "react-native";

import { LA_ADDITIONAL, BANKINGV2_MODULE, LA_RESULT } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
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
    EXIT_POPUP_TITLE,
    LA_EXIT_POPUP_DESC,
    SAVE,
    DONT_SAVE,
    CONFIRM,
    PRIMARY_SOURCE_WEALTH,
    PRIMARY_SOURCE_OF_WEALTH_INFO_DESC,
    FA_SCREEN_NAME,
    FA_FORM_PROCEED,
    FA_PROPERTY_APPLY_ADDITIONALINFO,
} from "@constants/strings";

import { useResetNavigation, getExistingData, getEncValue } from "../Common/PropertyController";
import { fetchGetApplicants, loanSubmissionRequest, saveLAInput } from "./LAController";

// Initial state object
const initialState = {
    // Primary income related
    fund: PLEASE_SELECT,
    fundValue: null,
    fundValueIndex: 0,
    fundData: null,
    fundPicker: false,
    fundObj: null,

    // Primary source of wealth related
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
        default:
            return { ...state };
    }
}

function LAAdditional({ route, navigation }) {
    const [resetToDiscover, resetToApplication] = useResetNavigation(navigation);
    const [state, dispatch] = useReducer(reducer, initialState);
    const [loading, setLoading] = useState(true);

    const { isContinueDisabled, fund, wealth, editFlow } = state;

    useEffect(() => {
        init();
    }, []);

    // Used to check if all fields are filled in, then accordingly enable/disable "Confirm" btn
    useEffect(() => {
        dispatch({
            actionType: "SET_CONTINUE_DISABLED",
            payload: fund === PLEASE_SELECT || wealth === PLEASE_SELECT,
        });
    }, [fund, wealth]);

    const init = useCallback(() => {
        console.log("[LAAdditional] >> [init]");

        // Populate Picker Data
        setPickerData();

        // Prepopulate any existing details
        prepopulateData();
        setLoading(false);
    }, [setPickerData, prepopulateData]);

    function onBackTap() {
        console.log("[LAAdditional] >> [onBackTap]");

        navigation.goBack();
    }

    function onCloseTap() {
        console.log("[LAAdditional] >> [onCloseTap]");

        // Show Exit Popup
        dispatch({
            actionType: "SHOW_EXIT_POPUP",
            payload: true,
        });
    }

    const setPickerData = useCallback(() => {
        console.log("[LAAdditional] >> [setPickerData]");

        const masterData = route.params?.masterData ?? {};

        dispatch({
            actionType: "SET_PICKER_DATA",
            payload: {
                fundData: masterData?.sourceOfFundOrigin ?? null,
                wealthData: masterData?.sourceOfWealthOrigin ?? null,
            },
        });
    }, [route.params?.masterData]);

    const prepopulateData = useCallback(() => {
        console.log("[LAAdditional] >> [prepopulateData]");

        const navParams = route?.params ?? {};
        const masterData = navParams?.masterData ?? {};
        const savedData = navParams?.savedData ?? {};

        const paramsEditFlow = false;
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

        // Primary source of wealth
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

    function getUIData(navParams, savedData, paramsEditFlow) {
        console.log("[LAAdditional] >> [getUIData]");

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
        console.log("[LAAdditional] >> [onPickerCancel]");

        dispatch({
            actionType: "HIDE_PICKER",
            payload: true,
        });
    }

    function onPickerDone(item, index) {
        console.log("[LAAdditional] >> [onPickerDone]");

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
        console.log("[LAAdditional] >> [onFundTap]");

        dispatch({
            actionType: "SHOW_PICKER",
            payload: "fund",
        });
    }

    function onWealthTap() {
        console.log("[LAAdditional] >> [onWealthTap]");

        dispatch({
            actionType: "SHOW_PICKER",
            payload: "wealth",
        });
    }

    function onWealthInfoTap() {
        console.log("[LAAdditional] >> [onWealthInfoTap]");

        dispatch({
            actionType: "SHOW_INFO_POPUP",
            payload: {
                popupTitle: PRIMARY_SOURCE_WEALTH,
                popupDescription: PRIMARY_SOURCE_OF_WEALTH_INFO_DESC,
            },
        });
    }

    function closeInfoPopup() {
        console.log("[LAAdditional] >> [closeInfoPopup]");

        dispatch({
            actionType: "HIDE_INFO_POPUP",
            payload: null,
        });
    }

    async function onExitPopupSave() {
        console.log("[LAAdditional] >> [onExitPopupSave]");

        // Hide popup
        closeExitPopup();

        // Retrieve form data
        const formData = getFormData();

        // Save Form Data in DB before exiting the flow
        const { success, errorMessage } = await saveLAInput({
            screenName: LA_ADDITIONAL,
            formData,
            navParams: route?.params,
        });

        if (success) {
            resetToApplication();
        } else {
            showErrorToast({
                message: errorMessage || COMMON_ERROR_MSG,
            });
        }
    }

    function onExitPopupDontSave() {
        console.log("[LAAdditional] >> [onExitPopupDontSave]");

        // Hide popup
        closeExitPopup();

        resetToDiscover();
    }

    function closeExitPopup() {
        console.log("[LAAdditional] >> [closeExitPopup]");

        dispatch({
            actionType: "SHOW_EXIT_POPUP",
            payload: false,
        });
    }

    async function onContinue() {
        console.log("[LAAdditional] >> [onContinue]");

        setLoading(true);

        const navParams = route?.params ?? {};

        // Retrieve form data
        const formData = getFormData();

        // Save Form Data in DB before moving to next screen
        await saveLAInput({
            screenName: LA_ADDITIONAL,
            formData,
            navParams,
        });

        const encSyncId = await getEncValue(navParams?.syncId ?? "");

        const params = {
            stpId: navParams?.stpApplicationId ?? "",
            productCode: navParams?.financingPlan ?? "", //MAXIHOME/MFHS/CMHF - expected values
            unitNo: navParams?.unitNo ?? "",
            syncId: encSyncId,
            employmentPeriodInYear: navParams?.empYears ?? "",
            employmentPeriodInMonth: navParams?.empMonths ?? "",
            financingType: navParams?.financingType ?? "",
            customerRiskRating: navParams?.customerRiskRating ?? "",
            ccrisLoanCount: navParams?.ccrisLoanCount ?? "",
            unmatchApplForCreditRecord: navParams?.unmatchApplForCreditRecord ?? "",
            occupation: navParams?.occupation ?? "",
            occupationSector: navParams?.occupationSector ?? "",
            employerName: navParams?.employerName ?? "",
            employerPhoneNo: navParams?.employerPhoneNo ?? "",
            sourceOfFund: formData?.primaryIncome ?? "",
            sourceOfWealth: formData?.primarySourceOfIncome ?? "",
            privacyNotice: navParams?.radioPNYesChecked ? "Yes" : "No",
            address: [
                {
                    addressLine1: navParams?.correspondenseAddr1 ?? "",
                    addressLine2: navParams?.correspondenseAddr2 ?? "",
                    addressLine3: navParams?.correspondenseCity ?? "",
                    addressLine4: "",
                    postCode: navParams?.correspondensePostCode ?? "",
                    countryCode: navParams?.correspondenseCountry ?? "",
                    state: navParams?.correspondenseState ?? "",
                },
            ],
            mailingAddress: {
                addressLine1: navParams?.mailingAddr1 ?? "",
                addressLine2: navParams?.mailingAddr2 ?? "",
                addressLine3: navParams?.mailingCity ?? "",
                addressLine4: "",
                postCode: navParams?.mailingPostCode ?? "",
                countryCode: navParams?.mailingCountry ?? "",
                state: navParams?.mailingState ?? "",
            },
            empAddress: {
                addressLine1: navParams?.employerAddr1 ?? "",
                addressLine2: navParams?.employerAddr2 ?? "",
                addressLine3: navParams?.employerCity ?? "",
                addressLine4: "",
                postCode: navParams?.employerPostCode ?? "",
                countryCode: navParams?.employerCountry ?? "",
                state: navParams?.employerState ?? "",
            },
        };

        // Navigate to Loan Application result screen
        // call to final loan submission
        const { success, errorMessage, stpId, eligibilityResult, overallStatus, baseRateLabel } =
            await loanSubmissionRequest(params, false);

        if (!success) {
            setLoading(false);
            showErrorToast({
                message: errorMessage || COMMON_ERROR_MSG,
            });
            return;
        }
        const responseData = await fetchGetApplicants(encSyncId, false);

        if (!responseData?.success) {
            setLoading(false);
            // Show error message
            showErrorToast({ message: responseData?.errorMessage });
            return;
        }

        const { jointApplicantDetails, currentUser } = responseData;

        // Navigate to Loan Application result screen
        navigation.navigate(BANKINGV2_MODULE, {
            screen: LA_RESULT,
            params: {
                ...navParams,
                stpApplicationId: stpId,
                eligibilityResult,
                eligibilityStatus: overallStatus,
                baseRateLabel,
                jointApplicantDetails,
                currentUser,
            },
        });

        setLoading(false);

        logEvent(FA_FORM_PROCEED, {
            [FA_SCREEN_NAME]: FA_PROPERTY_APPLY_ADDITIONALINFO,
        });
    }

    function getFormData() {
        console.log("[LAAdditional] >> [getFormData]");

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
            analyticScreenName={FA_PROPERTY_APPLY_ADDITIONALINFO}
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
                                        text="Additional information"
                                    />
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
                        <ScrollView
                            style={Style.scrollContainer}
                            showsVerticalScrollIndicator={false}
                        >
                            {/* Property - Unit Type Name */}
                            <Typo
                                fontWeight="600"
                                lineHeight={18}
                                text={state.headerText}
                                textAlign="left"
                            />

                            {/* Header */}
                            {!editFlow && (
                                <Typo
                                    fontSize={20}
                                    fontWeight="300"
                                    lineHeight={28}
                                    style={Style.headerText}
                                    text="We require additional information from you"
                                    textAlign="left"
                                />
                            )}

                            {/* Primary income */}
                            <LabeledDropdown
                                label="Primary income"
                                dropdownValue={fund}
                                onPress={onFundTap}
                                style={Style.fieldViewCls}
                            />

                            {/* Primary source of wealth */}
                            <LabeledDropdown
                                label={PRIMARY_SOURCE_WEALTH}
                                dropdownValue={wealth}
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
                                        text={state.ctaText}
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

                {/* Primary source of wealth Picker */}
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
                    title={EXIT_POPUP_TITLE}
                    description={LA_EXIT_POPUP_DESC}
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
            </>
        </ScreenContainer>
    );
}

LAAdditional.propTypes = {
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

export default LAAdditional;
