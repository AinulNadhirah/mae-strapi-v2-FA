import PropTypes from "prop-types";
import React, { useState, useReducer } from "react";
import { View, StyleSheet, Platform, TouchableOpacity, Image } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSelector } from "react-redux";

import {
    APPLY_LOANS,
    APPLICATIONCONFIRMAUTH,
    APPLICATIONCONFIRMATION,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import { ScrollPickerView } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Dropdown from "@components/FormComponents/Dropdown";
import Popup from "@components/Popup";
import Typo from "@components/Text";

import { updateApiCEP } from "@services";

import { MEDIUM_GREY, YELLOW, BLACK, DISABLED_TEXT, DISABLED } from "@constants/colors";
import {
    DONE,
    CANCEL,
    ASB_FINANCING,
    PLEASE_SELECT,
    ARE_YOU_SURE_YOU_WANT_TO_LEAVE_TITLE,
    ARE_YOU_SURE_YOU_WANT_TO_LEAVE_DESC,
    FILL_IN_ADDITIONAL_DETAILS,
    PLSTP_SAVE_NEXT,
    PRIMARY_SOURCE_WEALTH,
    PRIMARY_SOURCE_OF_WEALTH_INFO_DESC,
    ASB_CASA_PRIMARY_INCOME,
    LEAVE,
    STEP2OF5,
} from "@constants/strings";

import Assets from "@assets";

const initialState = {
    title: PLEASE_SELECT,
    showPopup: false,

    grassIncome: "",
    grassIncomeValid: true,
    grassIncomeErrorMsg: "",

    totalMonthNonBank: "",
    totalMonthNonBankValid: true,
    totalMonthNonBankErrorMsg: "",
};

function reducer(state, action) {
    const { actionType, payload } = action;

    switch (actionType) {
        case "showPopup":
            return {
                ...state,
                showPopup: true,
                popupTitle: payload?.title ?? "",
                popupDescription: payload?.description ?? "",
            };
        case "hidePopup":
            return {
                ...state,
                showPopup: false,
                popupTitle: "",
                popupDescription: "",
            };
        default:
            return { ...state };
    }
}

function AdditionalDetailsIncome({ navigation, route }) {
    const [state, dispatch] = useReducer(reducer, initialState);
    const [selectPrimaryIncome, setSelectPrimaryIncome] = useState("");
    const [selectPrimarySourceOfWealth, setSelectPrimarySourceOfWealth] = useState("");
    const [showPrimaryIncomePicker, setShowPrimaryIncomePicker] = useState(false);
    const [showPrimarySourceOfWealthPicker, setShowPrimarySourceOfWealthPicker] = useState(false);
    const [showPopupConfirm, setShowPopupConfirm] = useState(false);

    const prequalReducer = useSelector((state) => state.asbServicesReducer.prePostQualReducer);
    const masterDataReducer = useSelector((state) => state.asbServicesReducer.masterDataReducer);
    const resumeReducer = useSelector((state) => state.resumeReducer);

    const stpReferenceNumber =
        prequalReducer?.stpreferenceNo ?? resumeReducer?.stpDetails?.stpReferenceNo;

    async function navToProceedScreen() {
        const body = {
            screenNo: "13",
            stpReferenceNo: stpReferenceNumber,
            primaryIncome: selectPrimaryIncome,
            primarySourceOfWealth: selectPrimarySourceOfWealth,
        };

        const response = await updateApiCEP(body, false);
        const result = response?.data?.result;
        if (result) {
            navigation.navigate(APPLICATIONCONFIRMAUTH);
        } else {
            console.warn("Something went wrong");
        }
    }

    function onBackTap() {
        navigation.navigate(APPLICATIONCONFIRMATION);
    }

    function onDropdownPress() {
        setShowPrimaryIncomePicker(true);
    }

    function onDropdownSourceOfWealthPress() {
        setShowPrimarySourceOfWealthPicker(true);
    }

    function onPopupClose() {
        dispatch({ actionType: "hidePopup", payload: false });
    }

    function onPickerCancel() {
        setShowPrimaryIncomePicker(false);
    }

    function onPickerDone(item) {
        setSelectPrimaryIncome(item.name);
        onPickerCancel();
    }

    function onPickerourceOfWealthDone(item) {
        setSelectPrimarySourceOfWealth(item.name);
        onPickerSourceOfWealthCancel();
    }

    function onPickerSourceOfWealthCancel() {
        setShowPrimarySourceOfWealthPicker(false);
    }

    function onPopupCloseConfirm() {
        setShowPopupConfirm(false);
    }

    function handleClose() {
        setShowPopupConfirm(true);
    }

    async function handleLeaveButton() {
        setShowPopupConfirm(false);
        const body = {
            screenNo: "13",
            stpReferenceNo: stpReferenceNumber,
            primaryIncome: selectPrimaryIncome,
            primarySourceOfWealth: selectPrimarySourceOfWealth,
        };

        const response = await updateApiCEP(body, false);
        const result = response?.data?.result;

        if (result) {
            navigation.navigate(APPLY_LOANS);
        } else {
            console.warn("Something went wrong");
        }
    }

    function onPrimarySourceOfWealthInfoPress() {
        dispatch({
            actionType: "showPopup",
            payload: {
                title: `${PRIMARY_SOURCE_WEALTH}`,
                description: `${PRIMARY_SOURCE_OF_WEALTH_INFO_DESC}`,
            },
        });
    }

    return (
        <ScreenContainer
            backgroundType="color"
            backgroundColor={MEDIUM_GREY}
            analyticScreenName="Apply_ASBFinancing_AdditionalDetails"
        >
            <>
                <ScreenLayout
                    paddingBottom={36}
                    paddingTop={16}
                    paddingHorizontal={0}
                    header={
                        <HeaderLayout
                            headerRightElement={<HeaderCloseButton onPress={handleClose} />}
                            headerCenterElement={
                                <Typo
                                    text={STEP2OF5}
                                    fontWeight="300"
                                    fontSize={16}
                                    lineHeight={19}
                                />
                            }
                            headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                        />
                    }
                    useSafeArea
                    neverForceInset={["bottom"]}
                >
                    <View style={styles.container}>
                        <KeyboardAwareScrollView
                            style={styles.containerView}
                            behavior={Platform.OS === "ios" ? "padding" : ""}
                            enabled
                            showsVerticalScrollIndicator={false}
                        >
                            <Typo
                                fontSize={14}
                                fontWeight="400"
                                lineHeight={20}
                                text={ASB_FINANCING}
                                textAlign="left"
                            />

                            <Typo
                                fontSize={16}
                                fontWeight="600"
                                lineHeight={28}
                                text={FILL_IN_ADDITIONAL_DETAILS}
                                textAlign="left"
                            />

                            <View style={styles.fieldViewCls}>
                                <Typo
                                    fontSize={14}
                                    lineHeight={18}
                                    textAlign="left"
                                    text={ASB_CASA_PRIMARY_INCOME}
                                    style={styles.label}
                                />
                                <Dropdown
                                    value={
                                        selectPrimaryIncome ? selectPrimaryIncome : PLEASE_SELECT
                                    }
                                    onPress={onDropdownPress}
                                />
                            </View>

                            <View style={styles.fieldViewCls}>
                                <View style={styles.infoLabelContainerCls}>
                                    <Typo
                                        fontSize={14}
                                        lineHeight={18}
                                        textAlign="left"
                                        text={PRIMARY_SOURCE_WEALTH}
                                        style={styles.label}
                                    />
                                    <TouchableOpacity onPress={onPrimarySourceOfWealthInfoPress}>
                                        <Image
                                            style={styles.infoIcon}
                                            source={Assets.icInformation}
                                        />
                                    </TouchableOpacity>
                                </View>

                                <Dropdown
                                    value={
                                        selectPrimarySourceOfWealth
                                            ? selectPrimarySourceOfWealth
                                            : PLEASE_SELECT
                                    }
                                    onPress={onDropdownSourceOfWealthPress}
                                />
                            </View>
                        </KeyboardAwareScrollView>
                        <View style={styles.view}>
                            <FixedActionContainer>
                                <View style={styles.footer}>
                                    <ActionButton
                                        fullWidth
                                        disabled={
                                            !selectPrimaryIncome || !selectPrimarySourceOfWealth
                                        }
                                        borderRadius={25}
                                        onPress={navToProceedScreen}
                                        backgroundColor={
                                            !selectPrimaryIncome || !selectPrimarySourceOfWealth
                                                ? DISABLED
                                                : YELLOW
                                        }
                                        componentCenter={
                                            <Typo
                                                text={PLSTP_SAVE_NEXT}
                                                fontSize={14}
                                                fontWeight="600"
                                                lineHeight={18}
                                                color={
                                                    !selectPrimaryIncome ||
                                                    !selectPrimarySourceOfWealth
                                                        ? DISABLED_TEXT
                                                        : BLACK
                                                }
                                            />
                                        }
                                    />
                                </View>
                            </FixedActionContainer>
                        </View>
                    </View>
                </ScreenLayout>
                <Popup
                    visible={state.showPopup}
                    onClose={onPopupClose}
                    title={state.popupTitle}
                    description={state.popupDescription}
                />
                <ScrollPickerView
                    showMenu={showPrimaryIncomePicker}
                    list={
                        masterDataReducer.status === "success"
                            ? masterDataReducer?.sourceOfFundOrigin
                            : []
                    }
                    onRightButtonPress={onPickerDone}
                    onLeftButtonPress={onPickerCancel}
                    rightButtonText={DONE}
                    leftButtonText={CANCEL}
                />
                <ScrollPickerView
                    showMenu={showPrimarySourceOfWealthPicker}
                    list={
                        masterDataReducer.status === "success"
                            ? masterDataReducer?.sourceOfWealthOrigin
                            : []
                    }
                    onRightButtonPress={onPickerourceOfWealthDone}
                    onLeftButtonPress={onPickerSourceOfWealthCancel}
                    rightButtonText={DONE}
                    leftButtonText={CANCEL}
                />

                <Popup
                    visible={showPopupConfirm}
                    onClose={onPopupCloseConfirm}
                    title={ARE_YOU_SURE_YOU_WANT_TO_LEAVE_TITLE}
                    description={ARE_YOU_SURE_YOU_WANT_TO_LEAVE_DESC}
                    primaryAction={{
                        text: `${LEAVE}`,
                        onPress: handleLeaveButton,
                    }}
                    secondaryAction={{
                        text: `${CANCEL}`,
                        onPress: onPopupCloseConfirm,
                    }}
                />
            </>
        </ScreenContainer>
    );
}

AdditionalDetailsIncome.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-between",
    },
    containerView: {
        flex: 1,
        paddingHorizontal: 25,
        width: "100%",
    },
    fieldViewCls: {
        marginTop: 25,
    },
    footer: {
        alignItems: "center",
        flexDirection: "column",
        width: "100%",
    },
    infoIcon: {
        height: 16,
        marginLeft: 10,
        width: 16,
    },
    infoLabelContainerCls: {
        alignItems: "center",
        flexDirection: "row",
        paddingVertical: 2,
    },
    label: {
        paddingBottom: 10,
    },
    view: {
        marginTop: 24,
        paddingHorizontal: 12,
    },
});

export default AdditionalDetailsIncome;
