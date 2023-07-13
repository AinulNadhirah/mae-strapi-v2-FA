import numeral from "numeral";
import PropTypes from "prop-types";
import React, { useEffect, useReducer } from "react";
import { StyleSheet, View, Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import { navigateToS2UCooling } from "@screens/OneTapAuth/CoolingNavigator";

import {
    PAYBILLS_MODULE,
    ZAKAT_MOBILE_NUMBER,
    PAYBILLS_CONFIRMATION_SCREEN,
    ONE_TAP_AUTH_MODULE,
    ACTIVATE,
    PAYBILLS_LANDING_SCREEN,
    SECURE2U_COOLING,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import { ScrollPickerView } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import LabeledDropdown from "@components/FormComponents/LabeledDropdown";
import Typography from "@components/Text";
import TextInput from "@components/TextInput";
import { showInfoToast } from "@components/Toast";

import { useModelController } from "@context";

import { YELLOW, DISABLED, MEDIUM_GREY, DISABLED_TEXT, BLACK } from "@constants/colors";
import { ZAKAT_PAYING_FOR_DATA } from "@constants/data";
import { PLEASE_SELECT, CONTINUE, DONE, CANCEL, ZAKAT, SECURE2U_IS_DOWN } from "@constants/strings";

import { checks2UFlow } from "@utils/dataModel/utility";

// Initial state object
const initialState = {
    // Rice Type related
    riceType: PLEASE_SELECT,
    riceTypeValue: null,
    riceTypeValueIndex: 0,
    riceTypeData: null,
    riceTypePicker: false,
    riceTypeObj: null,

    // Paying For Number related
    payingForNum: "",

    // Paying For related
    payingFor: PLEASE_SELECT,
    payingForValue: null,
    payingForValueIndex: 0,
    payingForData: ZAKAT_PAYING_FOR_DATA,
    payingForPicker: null,
    payingForObj: null,

    // Others
    isContinueDisabled: true,
    pickerType: null,
};

function reducer(state, action) {
    const { actionType, payload } = action;

    switch (actionType) {
        case "ENABLE_DISABLE_CONTINUE":
            return {
                ...state,
                isContinueDisabled: payload,
            };
        case "HIDE_PICKER":
            return {
                ...state,
                pickerType: null,
                riceTypePicker: false,
                payingForPicker: false,
            };
        case "SHOW_PICKER":
            return {
                ...state,
                pickerType: payload,
                riceTypePicker: payload === "riceType",
                payingForPicker: payload === "payingFor",
            };
        case "SET_RICE_TYPE_DATA":
            return {
                ...state,
                riceTypeData: payload,
            };
        case "SET_RICE_TYPE":
            return {
                ...state,
                riceType: payload?.riceType,
                riceTypeValue: payload?.riceTypeValue,
                riceTypeObj: payload?.riceTypeObj,
                riceTypeValueIndex: payload?.riceTypeValueIndex,
            };
        case "SET_PAYING_FOR":
            return {
                ...state,
                payingFor: payload?.payingFor,
                payingForValue: payload?.payingForValue,
                payingForObj: payload?.payingForObj,
                payingForValueIndex: payload?.payingForValueIndex,
            };
        case "SET_PAYING_FOR_NUM":
            return {
                ...state,
                payingForNum: payload,
            };
        default:
            return { ...state };
    }
}

function ZakatDetails({ route, navigation }) {
    const { getModel } = useModelController();
    const [state, dispatch] = useReducer(reducer, initialState);
    const { riceType, riceTypeValue, payingForNum, payingFor, payingForValue, isContinueDisabled } =
        state;

    useEffect(() => {
        init();
    }, []);

    // Used to check if all fields are filled in, then accordingly enable/disable "Continue" btn
    useEffect(() => {
        dispatch({
            actionType: "ENABLE_DISABLE_CONTINUE",
            payload: payingForNum.trim() === "" || !riceTypeValue || !payingForValue,
        });
    }, [payingForNum, riceType, payingFor, riceTypeValue, payingForValue]);

    const init = () => {
        console.log("[ZakatDetails] >> [init]");

        const params = route?.params ?? {};
        const riceTypeData = params?.riceTypeData ?? null;

        if (riceTypeData instanceof Array && riceTypeData.length > 0) {
            dispatch({
                actionType: "SET_RICE_TYPE_DATA",
                payload: riceTypeData,
            });
        }
    };

    function onBackTap() {
        console.log("[ZakatDetails] >> [onBackTap]");

        navigation.goBack();
    }

    function onPickerCancel() {
        console.log("[ZakatDetails] >> [onPickerCancel]");

        dispatch({
            actionType: "HIDE_PICKER",
            payload: true,
        });
    }

    const onPickerDone = (item, index) => {
        console.log("[ZakatDetails] >> [onPickerDone]");

        const { pickerType } = state;

        switch (pickerType) {
            case "riceType":
                dispatch({
                    actionType: "SET_RICE_TYPE",
                    payload: {
                        riceType: item?.name ?? PLEASE_SELECT,
                        riceTypeValue: item?.value ?? null,
                        riceTypeObj: item,
                        riceTypeValueIndex: index,
                    },
                });
                break;
            case "payingFor":
                dispatch({
                    actionType: "SET_PAYING_FOR",
                    payload: {
                        payingFor: item?.name ?? PLEASE_SELECT,
                        payingForValue: item?.value ?? null,
                        payingForObj: item,
                        payingForValueIndex: index,
                    },
                });
                break;
            default:
                break;
        }

        // Close picker
        onPickerCancel();
    };

    function onRiceTypeFieldTap() {
        console.log("[ZakatDetails] >> [onRiceTypeFieldTap]");

        dispatch({
            actionType: "SHOW_PICKER",
            payload: "riceType",
        });
    }

    function onPayingForFieldTap() {
        console.log("[ZakatDetails] >> [onPayingForFieldTap]");

        dispatch({
            actionType: "SHOW_PICKER",
            payload: "payingFor",
        });
    }

    function onPayingForNumTextChange(value) {
        console.log("[ZakatDetails] >> [onPayingForNumTextChange]");

        const formattedValue = value.toString().replace(/[^0-9]/g, "");
        if (formattedValue === "0") return;

        dispatch({
            actionType: "SET_PAYING_FOR_NUM",
            payload: formattedValue,
        });
    }

    async function onContinue() {
        console.log("[ZakatDetails] >> [onContinue]");

        const routeBackFrom = route.params?.routeBackFrom ?? null;
        const isFav = route.params?.isFav ?? false;

        // Retrieve form data
        const formData = getFormData();

        if (isFav) {
            const { flow, secure2uValidateData } = await checks2UFlow(17, getModel);

            if (!secure2uValidateData.s2u_enabled) {
                showInfoToast({ message: SECURE2U_IS_DOWN });
            }

            const deviceInfo = getModel("device");
            let nextParam = {
                ...formData,
                secure2uValidateData: secure2uValidateData,
                deviceInfo: deviceInfo,
                flow: flow,
            };
            if (flow === "S2UReg") {
                navigation.navigate(ONE_TAP_AUTH_MODULE, {
                    screen: ACTIVATE,
                    params: {
                        flowParams: {
                            success: {
                                stack: PAYBILLS_MODULE,
                                screen: PAYBILLS_CONFIRMATION_SCREEN,
                            },
                            fail: {
                                stack: PAYBILLS_MODULE,
                                screen: PAYBILLS_LANDING_SCREEN,
                            },

                            params: { ...nextParam, isFromS2uReg: true },
                        },
                    },
                });
            } else {
                navigation.navigate(PAYBILLS_MODULE, {
                    screen: PAYBILLS_CONFIRMATION_SCREEN,
                    params: { ...nextParam },
                });
            }
        } else {
            const { flow } = await checks2UFlow(17, getModel);

            if (flow === SECURE2U_COOLING) {
                const { navigate } = navigation;
                navigateToS2UCooling(navigate);
                return;
            }
            navigation.navigate(PAYBILLS_MODULE, {
                screen:
                    routeBackFrom === PAYBILLS_CONFIRMATION_SCREEN
                        ? PAYBILLS_CONFIRMATION_SCREEN
                        : ZAKAT_MOBILE_NUMBER,
                params: {
                    ...formData,
                },
            });
        }
    }

    const getFormData = () => {
        console.log("[ZakatDetails] >> [getFormData]");

        const { payingForObj, riceTypeObj } = state;
        const totalRawAmount = riceTypeValue * payingForNum;
        const formattedTotalAmount = `RM ${numeral(totalRawAmount).format("0,0.00")}`;
        const payingForText = payingForObj?.text ?? "";
        const radioBtnText = payingForText.replace("{AMOUNT}", formattedTotalAmount);

        return {
            ...route?.params,

            riceType,
            riceTypeValue,

            payingForNum,

            payingFor,
            payingForValue,

            riceTypeObj,

            amount: totalRawAmount,
            formattedTotalAmount,
            radioBtnText,
            routeBackFrom: null,
        };
    };

    return (
        <React.Fragment>
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                            headerCenterElement={
                                <Typography
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={19}
                                    text={ZAKAT}
                                />
                            }
                        />
                    }
                    paddingHorizontal={0}
                    paddingBottom={0}
                    paddingTop={0}
                    useSafeArea
                >
                    <React.Fragment>
                        <KeyboardAwareScrollView
                            behavior={Platform.OS == "ios" ? "padding" : ""}
                            enabled
                            showsVerticalScrollIndicator={false}
                            style={Style.scrollViewCls}
                        >
                            {/* Rice Type */}
                            <LabeledDropdown
                                label="Select rice types"
                                dropdownValue={riceType}
                                onPress={onRiceTypeFieldTap}
                                style={Style.fieldViewCls}
                            />

                            {/* Number of People Paying For */}
                            <View style={Style.fieldViewCls}>
                                <Typography
                                    fontSize={14}
                                    lineHeight={18}
                                    textAlign="left"
                                    text="How many people are you paying for?"
                                />
                                <TextInput
                                    minLength={1}
                                    maxLength={3}
                                    isValidate
                                    isValid={true}
                                    errorMessage=""
                                    value={payingForNum}
                                    placeholder="Enter number"
                                    keyboardType="numeric"
                                    onChangeText={onPayingForNumTextChange}
                                    blurOnSubmit
                                    returnKeyType="done"
                                />
                            </View>

                            {/* Paying for */}
                            <LabeledDropdown
                                label="Paying for"
                                dropdownValue={payingFor}
                                onPress={onPayingForFieldTap}
                                style={Style.fieldViewCls}
                            />
                        </KeyboardAwareScrollView>

                        {/* Bottom docked button container */}
                        <FixedActionContainer>
                            <View style={Style.bottomBtnContCls}>
                                <ActionButton
                                    disabled={isContinueDisabled}
                                    activeOpacity={isContinueDisabled ? 1 : 0.5}
                                    backgroundColor={isContinueDisabled ? DISABLED : YELLOW}
                                    fullWidth
                                    componentCenter={
                                        <Typography
                                            color={isContinueDisabled ? DISABLED_TEXT : BLACK}
                                            fontSize={14}
                                            lineHeight={18}
                                            fontWeight="600"
                                            text={CONTINUE}
                                        />
                                    }
                                    onPress={onContinue}
                                />
                            </View>
                        </FixedActionContainer>
                    </React.Fragment>
                </ScreenLayout>
            </ScreenContainer>

            {/* Rice Type Picker */}
            {state.riceTypeData && (
                <ScrollPickerView
                    showMenu={state.riceTypePicker}
                    list={state.riceTypeData}
                    selectedIndex={state.riceTypeValueIndex}
                    onRightButtonPress={onPickerDone}
                    onLeftButtonPress={onPickerCancel}
                    rightButtonText={DONE}
                    leftButtonText={CANCEL}
                />
            )}

            {/* Paying For Picker */}
            {state.payingForData && (
                <ScrollPickerView
                    showMenu={state.payingForPicker}
                    list={state.payingForData}
                    selectedIndex={state.payingForValueIndex}
                    onRightButtonPress={onPickerDone}
                    onLeftButtonPress={onPickerCancel}
                    rightButtonText={DONE}
                    leftButtonText={CANCEL}
                />
            )}
        </React.Fragment>
    );
}

ZakatDetails.propTypes = {
    navigation: PropTypes.shape({
        goBack: PropTypes.func,
        navigate: PropTypes.func,
    }),
    route: PropTypes.shape({
        params: PropTypes.shape({
            isFav: PropTypes.bool,
            routeBackFrom: PropTypes.any,
        }),
    }),
};

const Style = StyleSheet.create({
    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },

    fieldViewCls: {
        marginTop: 25,
    },

    scrollViewCls: {
        paddingHorizontal: 24,
    },
});

export default ZakatDetails;
