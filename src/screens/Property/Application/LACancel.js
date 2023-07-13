/* eslint-disable react-hooks/exhaustive-deps */
import PropTypes from "prop-types";
import React, { useEffect, useReducer, useCallback } from "react";
import { StyleSheet, Platform, View, TextInput } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import {
    BANKINGV2_MODULE,
    APPLICATION_DETAILS,
    PROPERTY_DASHBOARD,
    LA_CANCEL,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import { ScrollPickerView } from "@components/Common/ScrollPickerView";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import LabeledDropdown from "@components/FormComponents/LabeledDropdown";
import Typo from "@components/Text";
import { showErrorToast, showSuccessToast, showInfoToast } from "@components/Toast";

import { getApplicationDetails, loanCancellation } from "@services";
import { logEvent } from "@services/analytics";

import {
    MEDIUM_GREY,
    YELLOW,
    BLACK,
    DISABLED_TEXT,
    DISABLED,
    DARK_GREY,
    GREY,
    TRANSPARENT,
    WHITE,
} from "@constants/colors";
import {
    PLEASE_SELECT,
    DONE,
    CANCEL,
    CONFIRM,
    COMMON_ERROR_MSG,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    FA_FORM_PROCEED,
    FA_FORM_COMPLETE,
    FA_FIELD_INFORMATION,
} from "@constants/strings";

import { getEncValue } from "../Common/PropertyController";

// Initial state object
const initialState = {
    // Reason related
    reason: PLEASE_SELECT,
    reasonValue: null,
    reasonValueIndex: 0,
    reasonData: null,
    reasonPicker: false,
    reasonObj: null,

    // Other Reason
    otherReason: "",
    otherReasonValid: true,
    otherReasonErrorMsg: "",
    otherReasonShow: false,

    // Others
    isContinueDisabled: true,
    pickerType: null,
    headerText: "",
};

function reducer(state, action) {
    const { actionType, payload } = action;

    switch (actionType) {
        case "SET_HEADER_TEXT":
            return {
                ...state,
                headerText: payload,
            };
        case "HIDE_PICKER":
            return {
                ...state,
                pickerType: null,
                reasonPicker: false,
            };
        case "SHOW_PICKER":
            return {
                ...state,
                pickerType: payload,
                reasonPicker: payload === "reason",
            };
        case "SET_PICKER_DATA":
        case "SET_REASON":
        case "RESET_VALIDATION_ERRORS":
        case "SET_OTHER_REASON_ERROR":
        case "SET_OTHER_REASON_SHOW":
            return {
                ...state,
                ...payload,
            };
        case "SET_OTHER_REASON":
            return {
                ...state,
                otherReason: payload,
                otherReasonDisp: payload,
            };
        case "SET_CONTINUE_DISABLED":
            return {
                ...state,
                isContinueDisabled: payload,
            };
        default:
            return { ...state };
    }
}

function LACancel({ route, navigation }) {
    const [state, dispatch] = useReducer(reducer, initialState);

    const { isContinueDisabled, otherReason, reason, reasonValue, otherReasonShow } = state;

    useEffect(() => {
        init();
    }, []);

    useEffect(() => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Property_CancelApplication",
        });
    }, []);

    // Used to check if all fields are filled in, then accordingly enable/disable "Continue" btn
    useEffect(() => {
        dispatch({
            actionType: "SET_CONTINUE_DISABLED",
            payload: reason === PLEASE_SELECT || (otherReasonShow && otherReason.trim() === ""),
        });
    }, [reason, otherReason, otherReasonShow]);

    // Event handler to show/hide Other reason input field
    useEffect(() => {
        dispatch({
            actionType: "SET_OTHER_REASON_SHOW",
            payload: {
                otherReasonShow: reasonValue === "004",
            },
        });
    }, [reasonValue]);

    const init = useCallback(() => {
        console.log("[LACancel] >> [init]");

        // Populate Picker Data
        setPickerData();

        // Set Header Text
        dispatch({
            actionType: "SET_HEADER_TEXT",
            payload: route.params?.headerText ?? "",
        });
    }, [route, navigation]);

    function onBackTap() {
        console.log("[LACancel] >> [onBackTap]");

        navigation.goBack();
    }

    function onCloseTap() {
        console.log("[LACancel] >> [onCloseTap]");

        navigation.goBack();
    }

    function setPickerData() {
        console.log("[LACancel] >> [setPickerData]");

        dispatch({
            actionType: "SET_PICKER_DATA",
            payload: {
                reasonData: route?.params?.cancelReason ?? null,
            },
        });
    }

    function onPickerCancel() {
        console.log("[LACancel] >> [onPickerCancel]");

        dispatch({
            actionType: "HIDE_PICKER",
            payload: true,
        });
    }

    function onPickerDone(item, index) {
        console.log("[LACancel] >> [onPickerDone]");

        if (state.pickerType === "reason") {
            dispatch({
                actionType: "SET_REASON",
                payload: {
                    reason: item?.name ?? PLEASE_SELECT,
                    reasonValue: item?.value ?? null,
                    reasonObj: item,
                    reasonValueIndex: index,
                },
            });
        }

        // Close picker
        onPickerCancel();
    }

    function onReasonTap() {
        console.log("[LACancel] >> [onReasonTap]");

        dispatch({
            actionType: "SHOW_PICKER",
            payload: "reason",
        });
    }

    function onOtherReasonChange(value) {
        dispatch({
            actionType: "SET_OTHER_REASON",
            payload: value,
        });
    }

    async function callCancelAPI() {
        console.log("[LACancel] >> [callCancelAPI]");

        const navParams = route?.params ?? {};
        const syncId = navParams?.syncId ?? "";
        const deleteRecord = navParams?.deleteRecord ?? "N";
        const GENERIC_ERROR_MSG = "An error has occurred. Please try again later.";

        const encSyncId = await getEncValue(syncId);

        // Request object
        const params = {
            syncId: encSyncId,
            stpId: navParams?.savedData?.stpApplicationId,
            cancelReason: state.reason,
            otherReason: state.otherReason,
            deleteRecord,
        };

        loanCancellation(params, true)
            .then((httpResp) => {
                console.log("[LACancel][loanCancellation] >> Response: ", httpResp);

                const statusCode = httpResp?.data?.result?.statusCode ?? null;
                const statusDesc = httpResp?.data?.result?.statusDesc ?? GENERIC_ERROR_MSG;

                if (statusCode === "0000") {
                    if (deleteRecord === "Y") {
                        // Navigate to Property Dashboard page - Application tab
                        navigation.navigate(BANKINGV2_MODULE, {
                            screen: PROPERTY_DASHBOARD,
                            params: {
                                activeTabIndex: 1,
                                reload: true,
                            },
                        });
                    } else {
                        reloadApplicationDetails();
                    }
                } else {
                    // Handle cancel failure
                    handleCancelFailure(statusDesc);
                }
            })
            .catch((error) => {
                console.log("[LACancel][loanCancellation] >> Exception: ", error);

                // Handle cancel failure
                handleCancelFailure(error?.message ?? GENERIC_ERROR_MSG);
            });
    }

    function handleCancelFailure(errorMessage = COMMON_ERROR_MSG) {
        console.log("[LACancel] >> [handleCancelFailure]");

        // Show error message
        showInfoToast({ message: errorMessage });

        // Navigate back to Application details screen
        navigation.navigate(BANKINGV2_MODULE, {
            screen: APPLICATION_DETAILS,
        });
    }

    async function reloadApplicationDetails() {
        console.log("[LACancel] >> [reloadApplicationDetails]");

        const navParams = route?.params ?? {};
        const encSyncId = await getEncValue(navParams?.syncId ?? "");

        // Request object
        const params = {
            syncId: encSyncId,
        };

        // Call Application details API to fetch latest details
        getApplicationDetails(params, true)
            .then((httpResp) => {
                console.log("[LACancel][getApplicationDetails] >> Response: ", httpResp);

                const result = httpResp?.data?.result ?? {};
                const statusCode = result?.statusCode ?? null;
                const statusDesc = result?.statusDesc ?? COMMON_ERROR_MSG;
                const savedData = result?.savedData ?? null;

                if (statusCode === "0000" && savedData) {
                    // Navigate to Applications Details screen with updated params
                    navigation.navigate(BANKINGV2_MODULE, {
                        screen: APPLICATION_DETAILS,
                        params: {
                            ...navParams,
                            savedData,
                            reload: true,
                            from: LA_CANCEL,
                        },
                    });

                    // Success message
                    showSuccessToast({
                        message: "Your home financing application has been successfully cancelled.",
                    });

                    logEvent(FA_FORM_COMPLETE, {
                        [FA_SCREEN_NAME]: "Property_CancelApplication",
                    });
                } else {
                    // Show error message
                    showErrorToast({ message: statusDesc ?? COMMON_ERROR_MSG });
                }
            })
            .catch((error) => {
                console.log("[LACancel][getApplicationDetails] >> Exception: ", error);

                // Show error message
                showErrorToast({ message: error?.message ?? COMMON_ERROR_MSG });
            });
    }

    function resetValidationErrors() {
        console.log("[LACancel] >> [resetValidationErrors]");

        dispatch({
            actionType: "RESET_VALIDATION_ERRORS",
            payload: {
                otherReasonValid: true,
                otherReasonErrorMsg: "",
            },
        });
    }

    function validateFormDetails() {
        console.log("[LACancel] >> [validateFormDetails]");

        // Reset existing error state
        resetValidationErrors();

        // Return true if all validation checks are passed
        return true;
    }

    async function onContinue() {
        console.log("[LACancel] >> [onContinue]");

        // Return if form validation fails
        const isFormValid = validateFormDetails();
        if (!isFormValid) return;

        // Call Cancel API
        callCancelAPI();

        logEvent(FA_FORM_PROCEED, {
            [FA_SCREEN_NAME]: "Property_CancelApplication",
            [FA_FIELD_INFORMATION]: state.reason,
        });
    }

    return (
        <>
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                            headerRightElement={<HeaderCloseButton onPress={onCloseTap} />}
                        />
                    }
                    paddingHorizontal={0}
                    paddingBottom={0}
                    paddingTop={0}
                    useSafeArea
                >
                    <>
                        <KeyboardAwareScrollView
                            behavior={Platform.OS === "ios" ? "padding" : ""}
                            enabled
                            showsVerticalScrollIndicator={false}
                            style={Style.scrollViewCls}
                        >
                            <Typo
                                fontWeight="600"
                                lineHeight={24}
                                text="Cancel application"
                                numberOfLines={2}
                                textAlign="left"
                            />

                            {/* Header */}
                            <Typo
                                fontSize={20}
                                fontWeight="300"
                                lineHeight={28}
                                style={Style.headerText}
                                text="Please select reason to cancel application"
                                textAlign="left"
                            />

                            {/* Reason */}
                            <LabeledDropdown
                                label="Select reason"
                                dropdownValue={state.reason}
                                onPress={onReasonTap}
                                style={Style.fieldViewCls}
                            />

                            {/* Other Reason */}
                            {otherReasonShow && (
                                <>
                                    <Typo
                                        text="Please specify your reason"
                                        textAlign="left"
                                        lineHeight={28}
                                        style={Style.fieldViewCls}
                                    />
                                    <View style={Style.textAreaContainer}>
                                        <TextInput
                                            style={[Style.textArea, Style.inputFont]}
                                            placeholder="e.g. I'd like to..."
                                            maxLength={500}
                                            numberOfLines={6}
                                            multiline
                                            allowFontScaling={false}
                                            placeholderTextColor="rgb(199,199,205)"
                                            underlineColorAndroid={TRANSPARENT}
                                            autoFocus={Platform.OS === "ios"}
                                            value={otherReason}
                                            onChangeText={onOtherReasonChange}
                                        />
                                    </View>
                                </>
                            )}
                        </KeyboardAwareScrollView>

                        {/* Bottom docked button container */}
                        <FixedActionContainer>
                            <View style={Style.bottomBtnContCls}>
                                <Typo
                                    fontSize={12}
                                    fontWeight="400"
                                    lineHeight={20}
                                    style={Style.noteLabel}
                                    text="Note: This action is final and cannot be undone."
                                    textAlign="left"
                                    color={DARK_GREY}
                                />

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
                                            text={CONFIRM}
                                        />
                                    }
                                    onPress={onContinue}
                                />
                            </View>
                        </FixedActionContainer>
                    </>
                </ScreenLayout>
            </ScreenContainer>

            {/* Reason Picker */}
            {state.reasonData && (
                <ScrollPickerView
                    showMenu={state.reasonPicker}
                    list={state.reasonData}
                    selectedIndex={state.reasonValueIndex}
                    onRightButtonPress={onPickerDone}
                    onLeftButtonPress={onPickerCancel}
                    rightButtonText={DONE}
                    leftButtonText={CANCEL}
                />
            )}
        </>
    );
}

LACancel.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

const Style = StyleSheet.create({
    bottomBtnContCls: {
        width: "100%",
    },

    fieldViewCls: {
        marginTop: 25,
    },

    headerText: {
        paddingTop: 8,
    },

    inputFont: {
        color: BLACK,
        fontFamily: "montserrat",
        fontSize: 14,
    },

    noteLabel: {
        marginBottom: 16,
        paddingHorizontal: 8,
        paddingTop: 8,
    },

    scrollViewCls: {
        paddingHorizontal: 36,
        paddingTop: 24,
    },

    textArea: {
        height: 120,
        justifyContent: "flex-start",
        textAlignVertical: "top",
    },

    textAreaContainer: {
        backgroundColor: WHITE,
        borderColor: GREY,
        borderRadius: 8,
        borderWidth: 1,
        marginTop: 10,
        padding: 5,
    },
});

export default LACancel;
