import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import { StyleSheet, View, ScrollView, TouchableOpacity, Image, Keyboard } from "react-native";
import { useSelector, useDispatch } from "react-redux";

import { APPLY_LOANS } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import Spring from "@components/Animations/Spring";
import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import { ScrollPickerView } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";
import TitleAndDropdownPillWithIcon from "@components/TitleAndDropdownPillWithIcon";

import {
    GUARANTOR_ADDITIONAL_INCOME_DEATAIL_SUBMIT_BUTTON_ENABLE,
    GUARANTOR_ANNUAL_BONUS_AMOUNT,
    GUARANTOR_BONUS_TYPE,
    GUARANTOR_COMMISSION,
    GUARANTOR_EPF_DIVIDEND,
    GUARANTOR_FIXED_ALLOWANCE,
    GUARANTOR_HOUSEHOLD_INCOME,
    GUARANTOR_NON_FIXED_AALOWANCE,
    GUARANTOR_TOTAL_AMOUNT,
} from "@redux/actions/ASBFinance/guarantorAdditionalIncomeDetailsAction";

import { YELLOW, WHITE, BLACK, DISABLED } from "@constants/colors";
import {
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
    FIXED_ALLOWANCE,
    ARE_YOU_SURE_YOU_WANT_TO_LEAVE_TITLE,
    ARE_YOU_SURE_YOU_WANT_TO_LEAVE_DESC,
    GUARANTOR,
    CURRENCY,
    AMOUNT_PLACEHOLDER,
    LEAVE,
    PLEASE_SELECT,
} from "@constants/strings";

import { getShadow } from "@utils/dataModel/utility";

import Assets from "@assets";

import { formatValue, getMaximunLength } from "../helpers/ASBHelpers";

function GuarantorAdditionalIncome({ route, navigation }) {
    // Hooks to access reducer data
    const masterDataReducer = useSelector((state) => state.asbServicesReducer.masterDataReducer);
    const guarantorIncomeDetailsReducer = useSelector(
        (state) => state.asbFinanceReducer.guarantorIncomeDetailsReducer
    );
    // Hooks to dispatch reducer action
    const dispatch = useDispatch();

    const {
        fixedAllowance,
        nonFixedAllowance,
        epfDividend,
        commission,
        householdIncome,
        bonusType,
        annualBonusAmount,
        totalAmount,
        additionalIncomeDetailSubmitButtonEnable,
    } = guarantorIncomeDetailsReducer;

    const [showStatePicker, setShowStatePicker] = useState(false);
    const [showPopupConfirm, setShowPopupConfirm] = useState(false);
    const [fieldIndex, setFieldIndex] = useState(0);
    const [showPopup, setShowPopup] = useState(false);
    const [popUpTitle, setPopUpTitle] = useState("");
    const [popUpDesc, setPopUpDesc] = useState("");

    this.textInput = React.createRef();

    useEffect(() => {
        dispatch({
            type: GUARANTOR_TOTAL_AMOUNT,
        });
        dispatch({
            type: GUARANTOR_ADDITIONAL_INCOME_DEATAIL_SUBMIT_BUTTON_ENABLE,
        });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        fixedAllowance,
        nonFixedAllowance,
        epfDividend,
        commission,
        householdIncome,
        bonusType,
        annualBonusAmount,
    ]);

    useEffect(() => {
        const keyboardHide = Keyboard.addListener("keyboardDidHide", () => {
            setFieldIndex(0);
        });
        return () => {
            keyboardHide.remove();
        };
    }, []);

    function onCloseTap() {
        setShowPopupConfirm(true);
    }
    function onDoneTap() {}

    function onBackTap() {
        navigation.goBack();
    }

    function onChangeFixedAllowance(value) {
        dispatch({ type: GUARANTOR_FIXED_ALLOWANCE, fixedAllowance: value });
    }

    function onChangeNonFixedAllowance(value) {
        dispatch({ type: GUARANTOR_NON_FIXED_AALOWANCE, nonFixedAllowance: value });
    }

    function onChangeEPFDividend(value) {
        dispatch({ type: GUARANTOR_EPF_DIVIDEND, epfDividend: value });
    }

    function onChangeCommission(value) {
        dispatch({ type: GUARANTOR_COMMISSION, commission: value });
    }

    function onChangeHouseholdIncome(value) {
        dispatch({ type: GUARANTOR_HOUSEHOLD_INCOME, householdIncome: value });
    }

    function onChangeAnnualBonusAmount(value) {
        dispatch({ type: GUARANTOR_ANNUAL_BONUS_AMOUNT, annualBonusAmount: value });
    }

    function onDropdownPress() {
        setShowStatePicker(true);
    }

    function onPickerDone(item) {
        dispatch({ type: GUARANTOR_BONUS_TYPE, bonusType: item });
        onPickerCancel();
    }

    function onPickerCancel() {
        setShowStatePicker(false);
    }

    function onPopupClose() {
        setPopUpTitle("");
        setPopUpDesc("");
        setShowPopup(false);
    }

    function onPressIncome() {
        setPopUpTitle(HOUSEHOLD_INCOME);
        setPopUpDesc(HOMEHOLD_INCOME_DES);
        setShowPopup(true);
    }

    function onPressBonusType() {
        setPopUpTitle(BONUS_TYPE);
        setPopUpDesc(BONUS_TYPE_ONE + `\n\n` + BONUS_TYPE_TWO + `\n\n` + BONUS_TYPE_THREE);
        setShowPopup(true);
    }

    function handleLeaveBtn() {
        setShowPopupConfirm(false);
        navigation.navigate(APPLY_LOANS);
    }
    function onPopupCloseConfirm() {
        setShowPopupConfirm(false);
    }

    function handleKeyboardShow(index) {
        setFieldIndex(index);
    }

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
                                    text={GUARANTOR}
                                    textAlign="left"
                                />
                                <SpaceFiller height={4} />

                                <Typo
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={28}
                                    text={ADDITIONAL_MONTHLY_INCOME}
                                    textAlign="left"
                                />
                            </View>
                            {detailsView()}
                        </ScrollView>
                        <FixedActionContainer>
                            <View style={styles.bottomBtnContCls}>
                                <ActionButton
                                    borderRadius={25}
                                    onPress={onDoneTap}
                                    activeOpacity={
                                        additionalIncomeDetailSubmitButtonEnable ? 1 : 0.5
                                    }
                                    backgroundColor={
                                        additionalIncomeDetailSubmitButtonEnable ? YELLOW : DISABLED
                                    }
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
                                />
                            </View>
                        </FixedActionContainer>
                    </React.Fragment>
                    <ScrollPickerView
                        showMenu={showStatePicker}
                        list={masterDataReducer?.tenureList}
                        onRightButtonPress={onPickerDone}
                        onLeftButtonPress={onPickerCancel}
                        rightButtonText={DONE}
                        leftButtonText={CANCEL}
                    />
                    <Popup
                        visible={showPopup}
                        onClose={onPopupClose}
                        title={popUpTitle}
                        description={popUpDesc}
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

    function detailsView() {
        return (
            <React.Fragment>
                <Typo
                    fontSize={14}
                    lineHeight={18}
                    fontWeight="400"
                    letterSpacing={0}
                    textAlign="left"
                    text={FIXED_ALLOWANCE}
                />
                <SpaceFiller height={12} />
                <TextInput
                    enablesReturnKeyAutomatically
                    autoFocus={false}
                    minLength={3}
                    maxLength={getMaximunLength(fieldIndex, 1)}
                    prefix={CURRENCY}
                    placeholder={AMOUNT_PLACEHOLDER}
                    isValidate={false}
                    value={formatValue(fieldIndex, 1, fixedAllowance)}
                    keyboardType="numeric"
                    onChangeText={onChangeFixedAllowance}
                    onFocus={handleKeyboardShow(1)}
                    blurOnSubmit={true}
                    returnKeyType="done"
                />
                <SpaceFiller height={24} />

                <Typo
                    fontSize={14}
                    lineHeight={18}
                    fontWeight="400"
                    letterSpacing={0}
                    textAlign="left"
                    text={NON_FIXED}
                />
                <SpaceFiller height={12} />
                <TextInput
                    enablesReturnKeyAutomatically
                    autoFocus={false}
                    minLength={3}
                    maxLength={getMaximunLength(fieldIndex, 2)}
                    prefix={CURRENCY}
                    placeholder={AMOUNT_PLACEHOLDER}
                    value={formatValue(fieldIndex, 2, nonFixedAllowance)}
                    keyboardType="numeric"
                    onChangeText={onChangeNonFixedAllowance}
                    onFocus={handleKeyboardShow(2)}
                    blurOnSubmit
                    returnKeyType="done"
                />
                <SpaceFiller height={24} />

                <Typo
                    fontSize={14}
                    lineHeight={18}
                    fontWeight="400"
                    letterSpacing={0}
                    textAlign="left"
                    text={EPF_DIVIDEND}
                />
                <SpaceFiller height={12} />
                <TextInput
                    enablesReturnKeyAutomatically
                    autoFocus={false}
                    minLength={3}
                    maxLength={getMaximunLength(fieldIndex, 3)}
                    prefix={CURRENCY}
                    placeholder={AMOUNT_PLACEHOLDER}
                    value={formatValue(fieldIndex, 3, epfDividend)}
                    keyboardType="numeric"
                    onChangeText={onChangeEPFDividend}
                    onFocus={handleKeyboardShow(3)}
                    blurOnSubmit
                    returnKeyType="done"
                />

                <SpaceFiller height={24} />

                <Typo
                    fontSize={14}
                    lineHeight={18}
                    fontWeight="400"
                    letterSpacing={0}
                    textAlign="left"
                    text={COMMISSION}
                />
                <SpaceFiller height={12} />

                <TextInput
                    enablesReturnKeyAutomatically
                    autoFocus={false}
                    minLength={3}
                    maxLength={getMaximunLength(fieldIndex, 4)}
                    prefix={CURRENCY}
                    placeholder={AMOUNT_PLACEHOLDER}
                    value={formatValue(fieldIndex, 4, commission)}
                    keyboardType="numeric"
                    onChangeText={onChangeCommission}
                    onFocus={handleKeyboardShow(4)}
                    blurOnSubmit
                    returnKeyType="done"
                />
                <SpaceFiller height={24} />

                <View style={styles.infoLabel}>
                    <Typo fontSize={14} lineHeight={18} textAlign="left" text={HOUSEHOLD_INCOME} />
                    <TouchableOpacity onPress={onPressIncome}>
                        <Image style={styles.infoIcon} source={Assets.icInformation} />
                    </TouchableOpacity>
                </View>
                <SpaceFiller height={12} />
                <TextInput
                    enablesReturnKeyAutomatically
                    autoFocus={false}
                    minLength={3}
                    maxLength={getMaximunLength(fieldIndex, 5)}
                    prefix={CURRENCY}
                    placeholder={AMOUNT_PLACEHOLDER}
                    value={formatValue(fieldIndex, 5, householdIncome)}
                    onChangeText={onChangeHouseholdIncome}
                    onFocus={handleKeyboardShow(5)}
                    keyboardType="numeric"
                    blurOnSubmit
                    returnKeyType="done"
                />

                <TitleAndDropdownPillWithIcon
                    title={BONUS_TYPE}
                    dropdownTitle={bonusType?.name ?? PLEASE_SELECT}
                    dropdownOnPress={onDropdownPress}
                    removeTopMargin={true}
                    titleFontWeight="400"
                    dropdownOnInfoPress={onPressBonusType}
                />
                <SpaceFiller height={24} />

                <Typo
                    fontSize={14}
                    lineHeight={18}
                    fontWeight="400"
                    letterSpacing={0}
                    textAlign="left"
                    text={ANNUAL_BOUNS_AMOUNT}
                />
                <SpaceFiller height={12} />
                <TextInput
                    enablesReturnKeyAutomatically
                    autoFocus={false}
                    minLength={3}
                    maxLength={getMaximunLength(fieldIndex, 6)}
                    prefix={CURRENCY}
                    placeholder={AMOUNT_PLACEHOLDER}
                    value={formatValue(fieldIndex, 6, annualBonusAmount)}
                    keyboardType="numeric"
                    onChangeText={onChangeAnnualBonusAmount}
                    onFocus={handleKeyboardShow(6)}
                    blurOnSubmit
                    returnKeyType="done"
                />
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
                                text={totalAmount}
                                style={styles.cardHeadAmt}
                            />
                        </View>
                    </Spring>
                </View>
            </React.Fragment>
        );
    }
}

GuarantorAdditionalIncome.propTypes = {
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
    scrollViewCls: {
        paddingHorizontal: 36,
        paddingTop: 20,
    },
    shadow: {
        ...getShadow({}),
    },
});

export default GuarantorAdditionalIncome;
