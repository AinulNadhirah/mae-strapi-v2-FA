import numeral from "numeral";
import PropTypes from "prop-types";
import React, { useState, useCallback, useReducer, useEffect } from "react";
import { StyleSheet, View, ScrollView, TouchableOpacity, Image, Keyboard } from "react-native";
import { useSelector, useDispatch } from "react-redux";

import { addCommas, removeCommas } from "@screens/PLSTP/PLSTPController";

import { APPLY_LOANS, ELIGIBILITY_SOFT_FAIL } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import Spring from "@components/Animations/Spring";
import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import { ScrollPickerView } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Dropdown from "@components/FormComponents/Dropdown";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";
import { showSuccessToast, showErrorToast, showInfoToast } from "@components/Toast";

import { asbCheckEligibilityService } from "@services";

import { ELIGIBILITY_SUCCESS } from "@redux/actions/ASBFinance/eligibilityCheckAction";

import { YELLOW, WHITE, BLACK, DISABLED } from "@constants/colors";
import {
    ASB_FINANCING,
    SUBMIT,
    ADDITIONAL_MONTHLY_INCOME,
    NON_FIXED,
    EPF_DIVIDEND,
    COMMISSION,
    BONUS_TYPE,
    ANNUAL_BOUNS_AMOUNT,
    HOUSEHOLD_INCOME,
    DONE,
    CANCEL,
    TOTAL_AMOUNT,
    BONUS_TYPE_ONE,
    BONUS_TYPE_TWO,
    BONUS_TYPE_THREE,
    HOMEHOLD_INCOME_DES,
    SUBMIT_ADDITION_INCOME,
    COMMON_ERROR_MSG,
    FIXED_ALLOWANCE,
    ARE_YOU_SURE_YOU_WANT_TO_LEAVE_TITLE,
    ARE_YOU_SURE_YOU_WANT_TO_LEAVE_DESC,
    LEAVE,
    PLEASE_SELECT,
} from "@constants/strings";

import { getShadow } from "@utils/dataModel/utility";

import Assets from "@assets";

const initialState = {
    showPopup: false,
};

function reducer(state, action) {
    const { actionType, payload } = action;

    switch (actionType) {
        case "showPopupForBonus":
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
        case "showPopupForIncome":
            return {
                ...state,
                showPopup: true,
                popupTitle: payload?.title ?? "",
                popupDescription: payload?.description ?? "",
            };
        default:
            return { ...state };
    }
}

function AdditionalMonthlyIncome({ navigation, route }) {
    const dispatchData = useDispatch();
    const [grassIncome, setgrassIncome] = useState("");
    const [loanInformation, setLoanInformation] = useState([]);
    const prePostQualReducer = useSelector((state) => state.asbServicesReducer.prePostQualReducer);
    const resumeReducer = useSelector((state) => state.resumeReducer);
    const [fixedAllowance, setFixedAllowance] = useState(null);
    const [nonFixedAllowance, setNonFixedAllowance] = useState(null);
    const [epfDividend, setEpfDividend] = useState(null);
    const [commission, setCommission] = useState(null);
    const [householdIncome, setHouseholdIncome] = useState(null);
    const [bonusType, setBonusType] = useState("");
    const [annualBonusAmount, setAnnualBonusAmount] = useState("");
    const [state, dispatch] = useReducer(reducer, initialState);
    const [showStatePicker, setShowStatePicker] = useState(false);
    const masterDataReducer = useSelector((state) => state.asbServicesReducer.masterDataReducer);
    const [showPopupConfirm, setShowPopupConfirm] = useState(false);
    const [fieldIndex, setFieldIndex] = useState(0);

    const [totalMonthNonBank, setTotalMonthNonBank] = useState("");
    const [bonusTypeList, setBonusTypeList] = useState([]);
    this.textInput = React.createRef();

    const stpReferenceNumber =
        prePostQualReducer?.stpreferenceNo ?? resumeReducer?.stpDetails?.stpReferenceNo;

    useEffect(() => {
        init();
        const keyboardHide = Keyboard.addListener("keyboardDidHide", () => {
            setFieldIndex(0);
        });
        return () => {
            keyboardHide.remove();
        };
    }, []);

    const init = async () => {
        const { loanInformation, grassIncome, totalMonthNonBank } = route.params;
        setLoanInformation(loanInformation);
        setgrassIncome(grassIncome);
        setTotalMonthNonBank(totalMonthNonBank);
        getBonusType();
    };

    function onCloseTap() {
        setShowPopupConfirm(true);
    }
    async function onDoneTap() {
        const body = {
            stpReferenceNo: stpReferenceNumber,
            screenNo: "5",
            additionalIncome: [
                {
                    additionalIncomeSource: "INC_ALLOW_FIXED",
                    additionalAmount: parseInt(fixedAllowance) || parseInt(0),
                },
                {
                    additionalIncomeSource: "INC_ALLOW_VAR",
                    additionalAmount: parseInt(nonFixedAllowance) || parseInt(0),
                },
                {
                    additionalIncomeSource: "INC_DIVIDEND_EPF",
                    additionalAmount: parseInt(epfDividend) || parseInt(0),
                },
                {
                    additionalIncomeSource: "INC_COMISSION",
                    additionalAmount: parseInt(commission) || parseInt(0),
                },
                {
                    additionalIncomeSource: "INC_BONUS",
                    additionalAmount:
                        bonusType === "Contractual" ? parseInt(annualBonusAmount) : parseInt(0),
                },
                {
                    additionalIncomeSource: "INC_NON_BONUS",
                    additionalAmount:
                        bonusType === "Non-Contractual" ? parseInt(annualBonusAmount) : parseInt(0),
                },
            ],
        };

        const response = await asbCheckEligibilityService(body);

        if (response) {
            const result = response?.data?.result;
            const checkEligibilityResponse = result?.wolocResponse?.msgBody;
            const pnbResponseStatus =
                response?.data?.result?.pnbResponse?.overallStatus?.statusCode;

            if (response?.data?.message === "Success") {
                dispatchData({
                    type: ELIGIBILITY_SUCCESS,
                    data: checkEligibilityResponse,
                    loanInformation,
                    grassIncome,
                    totalMonthNonBank,
                });
                if (pnbResponseStatus === "0000") {
                    navigation.navigate(ELIGIBILITY_SOFT_FAIL, {
                        reload: true,
                    });
                    showSuccessToast({
                        message: SUBMIT_ADDITION_INCOME,
                    });
                } else {
                    showErrorToast({
                        message: COMMON_ERROR_MSG,
                    });
                }
            } else if (response.data.message === "Unsuccessful") {
                showInfoToast({
                    message: response?.data?.result?.statusDesc,
                });
            }
        }
    }

    const getBonusType = () => {
        let tenureList = masterDataReducer?.bonusType[0]?.value;
        tenureList = tenureList.split(",");
        var arr = [];
        var len = tenureList.length;
        for (var i = 0; i < len; i++) {
            arr.push({
                name: tenureList[i],
                value: tenureList[i],
            });
        }

        setBonusTypeList(arr);
    };
    const onBackTap = useCallback(() => {
        navigation.goBack();
    });

    function onDropdownPress() {
        setShowStatePicker(true);
    }

    function onPickerDone(item) {
        setBonusType(item.name);
        onPickerCancel();
    }

    function onPickerCancel() {
        setShowStatePicker(false);
    }

    function onPopupClose() {
        dispatch({ actionType: "hidePopup", payload: false });
    }

    function onPressIncome() {
        dispatch({
            actionType: "showPopupForIncome",
            payload: {
                title: HOUSEHOLD_INCOME,
                description: HOMEHOLD_INCOME_DES,
            },
        });
    }

    function onPressBonusType() {
        dispatch({
            actionType: "showPopupForBonus",
            payload: {
                title: BONUS_TYPE,
                description: BONUS_TYPE_ONE + `\n\n` + BONUS_TYPE_TWO + `\n\n` + BONUS_TYPE_THREE,
            },
        });
    }

    const totalAmt = (total) => {
        const amount = removeCommas(total);
        const rm = "RM ";
        const result = rm + numeral(amount).format(",0.00");
        return result;
    };

    async function handleLeaveBtn() {
        setShowPopupConfirm(false);
        navigation.navigate(APPLY_LOANS);
    }
    function onPopupCloseConfirm() {
        setShowPopupConfirm(false);
    }

    const handleKeyboardShow = (index) => {
        setFieldIndex(index);
    };

    return (
        <React.Fragment>
            <ScreenContainer backgroundType="color" analyticScreenName="Apply_PersonalLoan_2">
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerCenterElement={
                                <Typo fontSize={16} fontWeight="600" lineHeight={19} />
                            }
                            headerRightElement={<HeaderCloseButton onPress={onCloseTap} />}
                            headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                        />
                    }
                    paddingHorizontal={0}
                    paddingBottom={0}
                    paddingTop={0}
                    useSafeArea
                >
                    <React.Fragment>
                        <ScrollView
                            style={styles.scrollViewCls}
                            showsVerticalScrollIndicator={false}
                        >
                            <View style={styles.headTitles}>
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
                                    text={ADDITIONAL_MONTHLY_INCOME}
                                    textAlign="left"
                                />
                            </View>
                            <View style={styles.inputField}>
                                <Typo
                                    fontSize={14}
                                    lineHeight={18}
                                    fontWeight="400"
                                    letterSpacing={0}
                                    textAlign="left"
                                    text={FIXED_ALLOWANCE}
                                />
                                <TextInput
                                    enablesReturnKeyAutomatically
                                    autoFocus={false}
                                    minLength={3}
                                    // maxLength={8}
                                    maxLength={fieldIndex === 1 ? 9 : 12}
                                    prefix="RM"
                                    placeholder="0.00"
                                    isValidate={false}
                                    value={
                                        fieldIndex === 1
                                            ? addCommas(fixedAllowance)
                                            : addCommas(fixedAllowance)
                                            ? numeral(fixedAllowance).format(",0.00")
                                            : ""
                                    }
                                    keyboardType="numeric"
                                    onChangeText={(text) => {
                                        setFixedAllowance(text);
                                    }}
                                    onFocus={() => handleKeyboardShow(1)}
                                    blurOnSubmit={true}
                                    returnKeyType="done"
                                />
                            </View>
                            <View style={styles.inputField}>
                                <Typo
                                    fontSize={14}
                                    lineHeight={18}
                                    fontWeight="400"
                                    letterSpacing={0}
                                    textAlign="left"
                                    text={NON_FIXED}
                                />
                                <TextInput
                                    enablesReturnKeyAutomatically
                                    autoFocus={false}
                                    minLength={3}
                                    maxLength={fieldIndex === 2 ? 9 : 12}
                                    prefix="RM"
                                    placeholder="0.00"
                                    value={
                                        fieldIndex === 2
                                            ? addCommas(nonFixedAllowance)
                                            : addCommas(nonFixedAllowance)
                                            ? numeral(nonFixedAllowance).format(",0.00")
                                            : ""
                                    }
                                    keyboardType="numeric"
                                    onChangeText={(text) => {
                                        setNonFixedAllowance(text);
                                    }}
                                    onFocus={() => handleKeyboardShow(2)}
                                    blurOnSubmit
                                    returnKeyType="done"
                                />
                            </View>
                            <View style={styles.inputField}>
                                <Typo
                                    fontSize={14}
                                    lineHeight={18}
                                    fontWeight="400"
                                    letterSpacing={0}
                                    textAlign="left"
                                    text={EPF_DIVIDEND}
                                />
                                <TextInput
                                    enablesReturnKeyAutomatically
                                    autoFocus={false}
                                    minLength={3}
                                    maxLength={fieldIndex === 3 ? 9 : 12}
                                    prefix="RM"
                                    placeholder="0.00"
                                    value={
                                        fieldIndex === 3
                                            ? addCommas(epfDividend)
                                            : addCommas(epfDividend)
                                            ? numeral(epfDividend).format(",0.00")
                                            : ""
                                    }
                                    keyboardType="numeric"
                                    onChangeText={(text) => {
                                        setEpfDividend(text);
                                    }}
                                    onFocus={() => handleKeyboardShow(3)}
                                    blurOnSubmit
                                    returnKeyType="done"
                                />
                            </View>
                            <View style={styles.inputField}>
                                <Typo
                                    fontSize={14}
                                    lineHeight={18}
                                    fontWeight="400"
                                    letterSpacing={0}
                                    textAlign="left"
                                    text={COMMISSION}
                                />
                                <TextInput
                                    enablesReturnKeyAutomatically
                                    autoFocus={false}
                                    minLength={3}
                                    maxLength={fieldIndex === 4 ? 9 : 12}
                                    prefix="RM"
                                    placeholder="0.00"
                                    // value={addCommas(commission)}
                                    value={
                                        fieldIndex === 4
                                            ? addCommas(commission)
                                            : addCommas(commission)
                                            ? numeral(commission).format(",0.00")
                                            : ""
                                    }
                                    keyboardType="numeric"
                                    onChangeText={(text) => setCommission(text)}
                                    onFocus={() => handleKeyboardShow(4)}
                                    blurOnSubmit
                                    returnKeyType="done"
                                />
                            </View>
                            <View style={styles.inputField}>
                                <View style={styles.infoLabel}>
                                    <Typo
                                        fontSize={14}
                                        lineHeight={18}
                                        textAlign="left"
                                        text={HOUSEHOLD_INCOME}
                                    />
                                    <TouchableOpacity onPress={onPressIncome}>
                                        <Image
                                            style={styles.infoIcon}
                                            source={Assets.icInformation}
                                        />
                                    </TouchableOpacity>
                                </View>
                                <TextInput
                                    enablesReturnKeyAutomatically
                                    autoFocus={false}
                                    minLength={3}
                                    maxLength={fieldIndex === 5 ? 9 : 12}
                                    prefix="RM"
                                    placeholder="0.00"
                                    value={
                                        fieldIndex === 5
                                            ? addCommas(householdIncome)
                                            : addCommas(householdIncome)
                                            ? numeral(householdIncome).format(",0.00")
                                            : ""
                                    }
                                    onChangeText={(text) => setHouseholdIncome(text)}
                                    onFocus={() => handleKeyboardShow(5)}
                                    keyboardType="numeric"
                                    blurOnSubmit
                                    returnKeyType="done"
                                />
                            </View>

                            <View style={styles.inputField}>
                                <View style={styles.infoLabel}>
                                    <Typo
                                        fontSize={14}
                                        lineHeight={18}
                                        textAlign="left"
                                        text={BONUS_TYPE}
                                    />
                                    <TouchableOpacity onPress={onPressBonusType}>
                                        <Image
                                            style={styles.infoIcon}
                                            source={Assets.icInformation}
                                        />
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.dropdown}>
                                    <Dropdown
                                        value={bonusType ? bonusType : PLEASE_SELECT}
                                        onPress={onDropdownPress}
                                    />
                                </View>
                            </View>

                            <View style={styles.inputField}>
                                <Typo
                                    fontSize={14}
                                    lineHeight={18}
                                    fontWeight="400"
                                    letterSpacing={0}
                                    textAlign="left"
                                    text={ANNUAL_BOUNS_AMOUNT + bonusType}
                                />
                                <TextInput
                                    isValidate={
                                        bonusType ? (annualBonusAmount ? false : true) : false
                                    }
                                    enablesReturnKeyAutomatically
                                    autoFocus={false}
                                    minLength={3}
                                    maxLength={7}
                                    maxLength={fieldIndex === 6 ? 9 : 12}
                                    prefix="RM"
                                    placeholder="0.00"
                                    // value={addCommas(annualBonusAmount)}
                                    value={
                                        fieldIndex === 6
                                            ? addCommas(annualBonusAmount)
                                            : addCommas(annualBonusAmount)
                                            ? numeral(annualBonusAmount).format(",0.00")
                                            : ""
                                    }
                                    keyboardType="numeric"
                                    onChangeText={(text) => setAnnualBonusAmount(text)}
                                    onFocus={() => handleKeyboardShow(6)}
                                    blurOnSubmit
                                    returnKeyType="done"
                                />
                            </View>
                            <View style={styles.shadow}>
                                <Spring style={styles.cardOne} activeOpacity={0.9}>
                                    <View style={styles.cardHeader}>
                                        <Typo
                                            fontSize={14}
                                            lineHeight={14}
                                            fontWeight="600"
                                            fontStyle="normal"
                                            textAlign="left"
                                            text={TOTAL_AMOUNT}
                                        />
                                        <Typo
                                            fontSize={24}
                                            lineHeight={29}
                                            fontWeight="600"
                                            letterSpacing={0}
                                            textAlign="left"
                                            text={totalAmt(
                                                +removeCommas(fixedAllowance) +
                                                    +removeCommas(nonFixedAllowance) +
                                                    +removeCommas(epfDividend) +
                                                    +removeCommas(commission) +
                                                    +removeCommas(householdIncome) +
                                                    +removeCommas(annualBonusAmount)
                                            )}
                                            style={styles.cardHeadAmt}
                                        />
                                    </View>
                                </Spring>
                            </View>
                        </ScrollView>
                        <FixedActionContainer>
                            <View style={styles.bottomBtnContCls}>
                                <ActionButton
                                    disabled={
                                        bonusType ? (annualBonusAmount ? false : true) : false
                                    }
                                    backgroundColor={
                                        bonusType ? (annualBonusAmount ? YELLOW : DISABLED) : YELLOW
                                    }
                                    activeOpacity={0.5}
                                    fullWidth
                                    componentCenter={
                                        <Typo
                                            fontSize={14}
                                            lineHeight={18}
                                            fontWeight="600"
                                            text={SUBMIT}
                                            color={BLACK}
                                        />
                                    }
                                    onPress={onDoneTap}
                                />
                            </View>
                        </FixedActionContainer>
                    </React.Fragment>
                    <ScrollPickerView
                        showMenu={showStatePicker}
                        list={bonusTypeList}
                        onRightButtonPress={onPickerDone}
                        onLeftButtonPress={onPickerCancel}
                        rightButtonText={DONE}
                        leftButtonText={CANCEL}
                        // selectedIndex={state.resetDetailsValueIndex}
                    />
                    <Popup
                        visible={state.showPopup}
                        onClose={onPopupClose}
                        title={state.popupTitle}
                        description={state.popupDescription}
                    />
                    <Popup
                        visible={showPopupConfirm}
                        onClose={onPopupCloseConfirm}
                        title={ARE_YOU_SURE_YOU_WANT_TO_LEAVE_TITLE}
                        description={ARE_YOU_SURE_YOU_WANT_TO_LEAVE_DESC}
                        primaryAction={{
                            text: LEAVE,
                            onPress: handleLeaveBtn,
                        }}
                        secondaryAction={{
                            text: CANCEL,
                            onPress: onPopupCloseConfirm,
                        }}
                    />
                </ScreenLayout>
            </ScreenContainer>
        </React.Fragment>
    );
}

AdditionalMonthlyIncome.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

const styles = StyleSheet.create({
    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },
    cardHeadAmt: {
        paddingTop: 5,
    },
    cardHeader: {
        paddingHorizontal: 16,
        paddingVertical: 25,
    },
    cardOne: {
        backgroundColor: WHITE,
        borderRadius: 10,
        justifyContent: "center",
        marginBottom: 60,
        marginTop: 30,
        overflow: "hidden",
        paddingVertical: 0,
        width: "100%",
    },
    dropdown: {
        marginTop: 10,
    },
    headTitles: {
        paddingBottom: 20,
    },
    infoIcon: {
        height: 16,
        marginLeft: 10,
        width: 16,
    },
    infoLabel: {
        alignItems: "center",
        flexDirection: "row",
        paddingVertical: 2,
    },
    inputField: {
        paddingVertical: 10,
    },
    scrollViewCls: {
        paddingHorizontal: 36,
        paddingTop: 20,
    },
    shadow: {
        ...getShadow({}),
    },
});

export default AdditionalMonthlyIncome;
