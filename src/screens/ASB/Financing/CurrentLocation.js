import PropTypes from "prop-types";
import React, { useState, useEffect, useReducer } from "react";
import { View, StyleSheet, Platform, TouchableOpacity, Image } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useDispatch, useSelector } from "react-redux";

import { addCommas, removeCommas } from "@screens/PLSTP/PLSTPController";

import {
    APPLICATION_FINANCE_DETAILS,
    BANK_OFFICER,
    APPLY_LOANS,
    APPLICATIONCONFIRMATION,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import { ScrollPickerViewWithResetOption } from "@components/Common/ScrollPickerViewWithResetOption";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Dropdown from "@components/FormComponents/Dropdown";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";
import { showErrorToast } from "@components/Toast";

import { updateApiCEP } from "@services";
import { logEvent } from "@services/analytics";

import { MEDIUM_GREY, YELLOW, BLACK, DISABLED, GREY } from "@constants/colors";
import {
    DONE,
    CANCEL,
    ASB_FINANCING,
    PLEASE_SELECT,
    AMOUNT_PLACEHOLDER,
    CURRENCY_CODE,
    MONTHLY_GROSS_INC,
    TOTAL_MONTHLY_NON,
    INCLUDIN_YOU_MONTHLY_COMMITMENTS,
    ARE_YOU_SURE_YOU_WANT_TO_LEAVE_TITLE,
    ARE_YOU_SURE_YOU_WANT_TO_LEAVE_DESC,
    COMMON_ERROR_MSG,
    TOTAL_MONTHLY_NON_TOOLTIP,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    FA_FORM_PROCEED,
    FA_FIELD_INFORMATION,
    PLSTP_STATE,
    AREA,
    BRANCH,
    LEAVE,
    PLEASE_SHARE_WITH_US_CURRENT_LOCATION,
    PLEASE_REMOVE_INVALID_SPECIAL_CHARACTERS,
    MINIMUM_AMOUNT_GREATER_THEN_FIVEHUNDRED,
    LEAVE_APPLICATION_GA,
} from "@constants/strings";

import { maeOnlyNumberRegex } from "@utils/dataModel";

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
        case "grassIncome":
            return {
                ...state,
                grassIncome: payload.grassIncome,
                grassIncomeErrorMsg: payload.grassIncomeErrorMsg,
                grassIncomeValid: payload.grassIncomeValid,
            };
        case "totalMonthNonBank":
            return {
                ...state,
                totalMonthNonBank: payload.totalMonthNonBank,
                totalMonthNonBankErrorMsg: payload.totalMonthNonBankErrorMsg,
                totalMonthNonBankValid: payload.totalMonthNonBankValid,
            };
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

function CurrentLocation(props) {
    const { route, navigation } = props;
    const [state, dispatch] = useReducer(reducer, initialState);
    const [selectState, setSelectState] = useState("");
    const [selectZone, setSelectZone] = useState("");
    const [selectBranch, setSelectBranch] = useState("");
    const [showStatePicker, setShowStatePicker] = useState(false);
    const [showZonePicker, setShowZonePicker] = useState(false);
    const [showBranchPicker, setShowBranchPicker] = useState(false);
    const [districtDropdownList, setDistrictDropdownList] = useState([]);
    const [branchDropdownList, setBranchDropdownList] = useState([]);
    const [showPopupConfirm, setShowPopupConfirm] = useState(false);
    const [loanInformation, setLoanInformation] = useState([]);
    const [resetValuestate, setResetValuestate] = useState(false);
    const [resetValueZone, setResetValueZone] = useState(false);
    const [resetValueBranch, setResetValueBranch] = useState(false);

    const prequalReducer = useSelector((state) => state.asbServicesReducer.prePostQualReducer);
    const masterDataReducer = useSelector((state) => state.asbServicesReducer.masterDataReducer);
    const dispatchRedux = useDispatch();
    const districtList = masterDataReducer.status === "success" ? masterDataReducer?.zone : [];

    const branchList = masterDataReducer.status === "success" ? masterDataReducer?.branch : [];

    // Resume
    const resumeReducer = useSelector((state) => state.resumeReducer);
    const resumeStpDetails = resumeReducer?.stpDetails;
    const resumeLoanInformation = resumeReducer?.loanInformation;
    // End Resume

    const stpReferenceNumber =
        prequalReducer?.stpreferenceNo ?? resumeReducer?.stpDetails?.stpReferenceNo;
    const reload = route?.params?.reload;

    useEffect(() => {
        init();
    }, []);

    useEffect(() => {
        if (reload || resumeStpDetails) {
            if (resumeStpDetails?.stpGrossIncome) {
                onGrassIncomeChange(resumeStpDetails.stpGrossIncome);
            }
            if (resumeStpDetails?.stpGrossIncome) {
                onTotalMonthNonBankChange(resumeStpDetails.stpOtherCommitments);
            }
            if (resumeStpDetails?.stpState) {
                setSelectState(resumeStpDetails.stpState);
                getReleventZone(resumeStpDetails.stpState.toUpperCase());
            }
            if (resumeStpDetails?.stpArea) {
                setSelectZone(resumeStpDetails.stpArea);
                getReleventBranch(resumeStpDetails.stpArea);
            }
            if (resumeStpDetails?.stpBranch) {
                setSelectBranch(resumeStpDetails.stpBranch);
            }
            if (resumeLoanInformation) {
                setLoanInformation(resumeLoanInformation);
            }
        }
    }, [getReleventBranch, getReleventZone, reload, resumeLoanInformation, resumeStpDetails]);

    const init = async () => {
        const { loanInformation } = route.params;
        setLoanInformation(loanInformation);
    };
    function onGrassIncomeChange(value) {
        const min = 500;
        const result = addCommas(value);
        let err = "";
        let isValid = false;
        const commErr1 = PLEASE_REMOVE_INVALID_SPECIAL_CHARACTERS;
        if (value < min) {
            err = MINIMUM_AMOUNT_GREATER_THEN_FIVEHUNDRED;
            isValid = false;
        } else if (!maeOnlyNumberRegex(removeCommas(value?.trim()))) {
            err = commErr1;
            isValid = false;
        } else {
            err = "";
            isValid = true;
        }
        dispatch({
            actionType: "grassIncome",
            payload: {
                grassIncome: result,
                grassIncomeErrorMsg: err,
                grassIncomeValid: isValid,
            },
        });
    }

    function onTotalMonthNonBankChange(value) {
        const result = addCommas(value);
        let err = "";
        let isValid = false;
        const commErr1 = PLEASE_REMOVE_INVALID_SPECIAL_CHARACTERS;
        if (value?.trim().length > 0 && !maeOnlyNumberRegex(removeCommas(value?.trim()))) {
            err = commErr1;
            isValid = false;
        } else {
            err = "";
            isValid = true;
        }
        dispatch({
            actionType: "totalMonthNonBank",
            payload: {
                totalMonthNonBank: result,
                totalMonthNonBankErrorMsg: err,
                totalMonthNonBankValid: isValid,
            },
        });
    }

    function onTotalMonthInfoPress() {
        dispatch({
            actionType: "showPopup",
            payload: {
                title: TOTAL_MONTHLY_NON_TOOLTIP,
                description: INCLUDIN_YOU_MONTHLY_COMMITMENTS,
            },
        });
    }

    function onPopupClose() {
        dispatch({ actionType: "hidePopup", payload: false });
    }

    function handleBack() {
        if (props?.route?.params?.comingFrom === APPLICATIONCONFIRMATION) {
            navigation.navigate(APPLICATIONCONFIRMATION);
        } else {
            navigation.navigate(APPLICATION_FINANCE_DETAILS, { reload: true }); // resume *
        }
    }

    function handleClose() {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: LEAVE_APPLICATION_GA,
        });
        setShowPopupConfirm(true);
    }
    function onPopupCloseConfirm() {
        setShowPopupConfirm(false);
    }

    const getReleventZone = async (state) => {
        const dist = districtList.find(({ value }) => value === state);
        var distData = JSON.stringify(dist.name);
        const distArray = distData.split('"');
        const finalDistrict = distArray[1].split(",");
        var arr = [];
        var len = finalDistrict.length;
        for (var i = 0; i < len; i++) {
            arr.push({
                name: finalDistrict[i],
                value: finalDistrict[i],
            });
        }
        setDistrictDropdownList(arr);
    };

    const getReleventBranch = async (zone) => {
        const branch = branchList.find(({ value }) => value === zone);
        var branchData = JSON.stringify(branch.name);
        const branchArray = branchData.split('"');
        const finalBranch = branchArray[1];
        const branchDD = finalBranch.split(",");
        var branchLen = branchDD.length;
        var arr = [];
        for (var i = 0; i < branchLen; i++) {
            arr.push({
                name: branchDD[i].replace("_", ","),
                value: branchDD[i].replace("_", ","),
            });
        }
        setBranchDropdownList(arr);
    };

    function onDropdownPress() {
        setShowStatePicker(true);
    }
    function onDropdownZonePress() {
        setShowZonePicker(true);
    }
    function onDropdownBranchPress() {
        setShowBranchPicker(true);
    }

    function onPickerDone(item) {
        item?.name && setSelectState(item.name);
        setSelectZone("Please Select");
        setSelectBranch("Please Select");
        setResetValuestate(false);
        getReleventZone(item.value);
        setResetValueBranch(true);
        setResetValueZone(true);
        setBranchDropdownList([]);
        onPickerCancel();
    }
    function onPickerZoneDone(item) {
        item?.name && setSelectZone(item.name);
        setSelectBranch("Please Select");
        getReleventBranch(item.value);
        setResetValueBranch(true);
        setResetValueZone(false);
        onPickerZoneCancel();
    }
    function onPickerBranchDone(item) {
        item?.name && setSelectBranch(item.name);
        setResetValueBranch(false);
        onPickerBranchCancel();
    }

    function onPickerCancel() {
        setShowStatePicker(false);
        setResetValuestate(false);
    }
    function onPickerZoneCancel() {
        setShowZonePicker(false);
        setResetValueZone(false);
    }
    function onPickerBranchCancel() {
        setShowBranchPicker(false);
        setResetValueBranch(false);
    }
    async function handleContinueButton() {
        if (
            state.grassIncome != "" &&
            selectState != "" &&
            selectZone != "" &&
            selectBranch != "" &&
            selectBranch != "Please Select" &&
            state.grassIncomeValid
        ) {
            const response = await saveUpdateData();
            if (response === "0000") {
                if (props?.route?.params?.comingFrom === APPLICATIONCONFIRMATION) {
                    navigation.navigate(APPLICATIONCONFIRMATION);
                } else {
                    logEvent(FA_FORM_PROCEED, {
                        [FA_SCREEN_NAME]: "Apply_ASBFinancing_IncomeDetails",
                        [FA_FIELD_INFORMATION]: `gross_income: ${state.grassIncome}; commitment: ${state.totalMonthNonBank} `,
                    });
                    navigation.navigate(BANK_OFFICER, {
                        loanInformation,
                        grassIncome: state.grassIncome,
                        totalMonthNonBank: state.totalMonthNonBank,
                    });
                }
            } else {
                showErrorToast({
                    message: COMMON_ERROR_MSG,
                });
            }
        }
    }
    const handleLeaveButton = async () => {
        setShowPopupConfirm(false);

        const response = await saveUpdateData();
        if (response === "0000") {
            navigation.navigate(APPLY_LOANS);
        } else {
            showErrorToast({
                message: COMMON_ERROR_MSG,
            });
        }
    };

    const saveUpdateData = async () => {
        try {
            const body = {
                screenNo: "3",
                stpReferenceNo: stpReferenceNumber,
                monthlyGrossIncome: removeCommas(state.grassIncome),
                monthlyNonBankCommitments: removeCommas(state.totalMonthNonBank),
                state: selectState,
                area: selectZone,
                branch: selectBranch,
            };

            dispatchRedux({
                screenNo: "3",
                type: "RESUME_UPDATE",
                stpGrossIncome: state.grassIncome,
                stpOtherCommitments: state.totalMonthNonBank,
                stpState: selectState,
                stpArea: selectZone,
                stpBranch: selectBranch,
            });

            const response = await updateApiCEP(body, false);
            const result = response?.data?.result.msgHeader;
            if (result.responseCode === "0000") {
                return result.responseCode;
            }
        } catch (error) {
            console.log(error);
            showErrorToast({
                message: COMMON_ERROR_MSG,
            });
        }
    };

    function getSelectStateIndex(value) {
        return masterDataReducer?.state?.findIndex((obj) => obj.name === value);
    }

    function getSelectZoneIndex(value) {
        return districtDropdownList?.findIndex((obj) => obj.name === value);
    }

    function getSelectBranchIndex(value) {
        return branchDropdownList?.findIndex((obj) => obj.name === value);
    }

    return (
        <ScreenContainer
            backgroundType="color"
            backgroundColor={MEDIUM_GREY}
            analyticScreenName="Apply_ASBFinancing_IncomeDetails"
        >
            <>
                <ScreenLayout
                    paddingBottom={0}
                    paddingTop={0}
                    paddingHorizontal={0}
                    header={
                        <HeaderLayout
                            headerRightElement={<HeaderCloseButton onPress={handleClose} />}
                            headerCenterElement={
                                <Typo
                                    text="Step 3 of 5"
                                    fontWeight="300"
                                    fontSize={16}
                                    lineHeight={19}
                                />
                            }
                            headerLeftElement={<HeaderBackButton onPress={handleBack} />}
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
                            <View style={styles.formCol}>
                                <Typo
                                    fontSize={14}
                                    fontWeight="400"
                                    lineHeight={20}
                                    text={ASB_FINANCING}
                                    textAlign="left"
                                />
                                <View style={styles.subTitle}>
                                    <Typo
                                        fontSize={16}
                                        fontWeight="600"
                                        lineHeight={20}
                                        style={styles.label}
                                        text={PLEASE_SHARE_WITH_US_CURRENT_LOCATION}
                                        textAlign="left"
                                    />
                                </View>
                                <View style={styles.fieldViewCls}>
                                    <Typo
                                        fontSize={14}
                                        lineHeight={18}
                                        textAlign="left"
                                        text={MONTHLY_GROSS_INC}
                                    />
                                    <TextInput
                                        maxLength={9}
                                        isValidate
                                        isValid={state.grassIncomeValid}
                                        errorMessage={state.grassIncomeErrorMsg}
                                        keyboardType="number-pad"
                                        value={state.grassIncome}
                                        placeholder={AMOUNT_PLACEHOLDER}
                                        onChangeText={onGrassIncomeChange}
                                        prefix={CURRENCY_CODE}
                                        editable={
                                            props?.route?.params?.comingFrom ==
                                            APPLICATIONCONFIRMATION
                                                ? false
                                                : true
                                        }
                                        color={
                                            props?.route?.params?.comingFrom ==
                                            APPLICATIONCONFIRMATION
                                                ? GREY
                                                : BLACK
                                        }
                                    />
                                </View>

                                <View style={styles.fieldViewCls}>
                                    <View style={styles.infoLabelContainerCls}>
                                        <Typo
                                            fontSize={14}
                                            lineHeight={18}
                                            textAlign="left"
                                            text={TOTAL_MONTHLY_NON}
                                        />
                                        <TouchableOpacity onPress={onTotalMonthInfoPress}>
                                            <Image
                                                style={styles.infoIcon}
                                                source={Assets.icInformation}
                                            />
                                        </TouchableOpacity>
                                    </View>

                                    <TextInput
                                        maxLength={10}
                                        isValidate
                                        isValid={state.totalMonthNonBankValid}
                                        errorMessage={state.totalMonthNonBankErrorMsg}
                                        keyboardType="number-pad"
                                        value={state.totalMonthNonBank}
                                        placeholder={AMOUNT_PLACEHOLDER}
                                        onChangeText={onTotalMonthNonBankChange}
                                        prefix={CURRENCY_CODE}
                                        editable={
                                            props?.route?.params?.comingFrom ==
                                            APPLICATIONCONFIRMATION
                                                ? false
                                                : true
                                        }
                                        color={
                                            props?.route?.params?.comingFrom ==
                                            APPLICATIONCONFIRMATION
                                                ? GREY
                                                : BLACK
                                        }
                                    />
                                </View>

                                <View style={styles.fieldViewCls}>
                                    <Typo
                                        fontSize={14}
                                        lineHeight={18}
                                        textAlign="left"
                                        text={PLSTP_STATE}
                                        style={styles.label}
                                    />
                                    <Dropdown
                                        value={selectState ? selectState : PLEASE_SELECT}
                                        onPress={onDropdownPress}
                                    />
                                </View>

                                <View style={styles.fieldViewCls}>
                                    <Typo
                                        fontSize={14}
                                        lineHeight={18}
                                        textAlign="left"
                                        text={AREA}
                                        style={styles.label}
                                    />
                                    <Dropdown
                                        value={selectZone ? selectZone : PLEASE_SELECT}
                                        onPress={onDropdownZonePress}
                                    />
                                </View>

                                <View style={styles.fieldViewCls}>
                                    <Typo
                                        fontSize={14}
                                        lineHeight={18}
                                        textAlign="left"
                                        text={BRANCH}
                                        style={styles.label}
                                    />
                                    <Dropdown
                                        value={selectBranch ? selectBranch : PLEASE_SELECT}
                                        onPress={onDropdownBranchPress}
                                    />
                                </View>
                            </View>
                            <View style={styles.view}>
                                <FixedActionContainer>
                                    <View style={styles.footer}>
                                        <ActionButton
                                            fullWidth
                                            disabled={false}
                                            borderRadius={25}
                                            onPress={handleContinueButton}
                                            activeOpacity={
                                                state.grassIncome != "" &&
                                                selectState != "" &&
                                                selectZone != "" &&
                                                selectBranch != "" &&
                                                selectBranch != PLEASE_SELECT &&
                                                state.grassIncomeValid
                                                    ? 1
                                                    : 0.5
                                            }
                                            backgroundColor={
                                                state.grassIncome != "" &&
                                                selectState != "" &&
                                                selectZone != "" &&
                                                selectBranch != "" &&
                                                selectBranch != PLEASE_SELECT &&
                                                state.grassIncomeValid
                                                    ? YELLOW
                                                    : DISABLED
                                            }
                                            componentCenter={
                                                <Typo
                                                    text="Continue"
                                                    fontSize={14}
                                                    fontWeight="600"
                                                    lineHeight={18}
                                                    color={BLACK}
                                                />
                                            }
                                        />
                                    </View>
                                </FixedActionContainer>
                            </View>
                        </KeyboardAwareScrollView>
                    </View>
                </ScreenLayout>
                <Popup
                    visible={state.showPopup}
                    onClose={onPopupClose}
                    title={state.popupTitle}
                    description={state.popupDescription}
                />
                <ScrollPickerViewWithResetOption
                    showMenu={showStatePicker}
                    list={masterDataReducer.status === "success" ? masterDataReducer?.state : []}
                    onRightButtonPress={onPickerDone}
                    onLeftButtonPress={onPickerCancel}
                    rightButtonText={DONE}
                    leftButtonText={CANCEL}
                    selectedIndex={selectState ? getSelectStateIndex(selectState) : 0}
                    resetValue={resetValuestate}
                    onResetValueCallback={() => {
                        setResetValuestate(false);
                    }}
                />
                <ScrollPickerViewWithResetOption
                    showMenu={showZonePicker}
                    list={districtDropdownList}
                    onRightButtonPress={onPickerZoneDone}
                    onLeftButtonPress={onPickerZoneCancel}
                    rightButtonText={DONE}
                    leftButtonText={CANCEL}
                    selectedIndex={selectZone ? getSelectZoneIndex(selectZone) : 0}
                    resetValue={resetValueZone}
                    onResetValueCallback={() => {
                        setResetValueZone(false);
                    }}
                />
                <ScrollPickerViewWithResetOption
                    showMenu={showBranchPicker}
                    list={branchDropdownList}
                    onRightButtonPress={onPickerBranchDone}
                    onLeftButtonPress={onPickerBranchCancel}
                    rightButtonText={DONE}
                    leftButtonText={CANCEL}
                    selectedIndex={selectBranch ? getSelectBranchIndex(selectBranch) : 0}
                    resetValue={resetValueBranch}
                    onResetValueCallback={() => {
                        setResetValueBranch(false);
                    }}
                />
                <Popup
                    visible={showPopupConfirm}
                    onClose={onPopupCloseConfirm}
                    title={ARE_YOU_SURE_YOU_WANT_TO_LEAVE_TITLE}
                    description={ARE_YOU_SURE_YOU_WANT_TO_LEAVE_DESC}
                    primaryAction={{
                        text: LEAVE,
                        onPress: handleLeaveButton,
                    }}
                    secondaryAction={{
                        text: CANCEL,
                        onPress: onPopupCloseConfirm,
                    }}
                />
            </>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-between",
    },
    containerView: {
        flex: 1,
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
    formCol: {
        paddingHorizontal: 25,
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
    subTitle: {
        paddingTop: 10,
    },
    view: {
        marginTop: 24,
    },
});

CurrentLocation.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};
export default CurrentLocation;
