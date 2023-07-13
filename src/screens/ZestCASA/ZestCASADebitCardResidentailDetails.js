import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { StyleSheet, View, ScrollView, Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useDispatch, useSelector } from "react-redux";

import { maskAddress } from "@screens/PLSTP/PLSTPController";
import TermsConditionRadioButton from "@screens/ZestCASA/components/TermsCondtionRadioButton";

import {
    ZEST_CASA_DEBIT_CARD_SELECT_ACCOUNT,
    SETTINGS_MODULE,
    ZEST_CASA_OTP_VERIFICATION,
    ZEST_CASA_STACK,
    ZEST_CASA_DEBIT_CARD_RESIDENTIAL_DETAILS,
    PREMIER_MODULE_STACK,
    PREMIER_OTP_VERIFICATION
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import { ScrollPickerView } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import TitleAndDropdownPill from "@components/SSL/TitleAndDropdownPill";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";

import { MASTERDATA_CLEAR } from "@redux/actions";
import {
    DEBIT_CARD_ADDRESS_LINE_ONE_ACTION,
    DEBIT_CARD_ADDRESS_LINE_TWO_ACTION,
    DEBIT_CARD_ADDRESS_LINE_ONE_MASK_ACTION,
    DEBIT_CARD_ADDRESS_LINE_TWO_MASK_ACTION,
    DEBIT_CARD_CITY_ACTION,
    DEBIT_CARD_TERMS_CONDITION,
    DEBIT_CARD_POSTAL_CODE_ACTION,
    DEBIT_CARD_RESIDENTIAL_CONTINUE_BUTTON_DISABLED_ACTION,
    DEBIT_CARD_STATE_ACTION,
} from "@redux/actions/ZestCASA/debitCardResidentialDetailsAction";
import { DEBIT_CARD_SELECT_ACCOUNT_ACTION } from "@redux/actions/ZestCASA/debitCardSelectAccountAction";
import { DOWNTIME_CLEAR } from "@redux/actions/services/downTimeAction";

import { BLACK, DISABLED, TRANSPARENT, YELLOW } from "@constants/colors";
import { S2U_PULL } from "@constants/data";
import {
    CONTINUE,
    ADDRESS_LINE_ONE,
    ADDRESS_LINE_TWO,
    UNIT_NUMBER,
    FLOOR,
    BUILDING,
    STREET_NAME,
    STEPUP_MAE_ADDRESS_POSTAL,
    POSTAL_CODE_DUMMY,
    PLEASE_SELECT,
    STEPUP_MAE_ADDRESS_CITY,
    DUMMY_KUALA_LUMPUR,
    PLSTP_STATE,
    ZEST_DEBIT_CARD_APPLICATION,
    FILL_IN_DEBIT_CARD_RESIDENTIAL_DETAILS,
    ZEST_DEBIT_CARD_RESIDENTIAL_DETAIL_TERMS_CONDITION,
    STP_TNC,
    TERMS_CONDITIONS,
} from "@constants/strings";
import {
    PM1_NTB_USER,
    PM1_FULL_ETB_USER,
    PM1_DEBIT_CARD_USER,
    PMA_NTB_USER,
    PMA_DEBIT_CARD_USER,
    PMA_FULL_ETB_USER,
    KAWANKU_SAVINGS_NTB_USER,
    KAWANKU_SAVINGS_FULL_ETB_USER,
    KAWANKU_SAVINGS_DEBIT_CARD_USER,
    KAWANKU_SAVINGSI_NTB_USER,
    KAWANKU_SAVINGSI_FULL_ETB_USER,
    KAWANKU_SAVINGSI_DEBIT_CARD_USER,
} from "@constants/premierConfiguration";
import { ZEST_CASA_DEBIT_CARD_FPX_TNC } from "@constants/url";
import {
    ZEST_NTB_USER,
    ZEST_CASA_CLEAR_ALL,
    ZEST_DEBIT_CARD_USER,
    ZEST_FULL_ETB_USER,
} from "@constants/zestCasaConfiguration";
import { applyDebitCardBody } from "@redux/utilities/actionUtilities";
import { FN_FUND_TRANSFER_APPLY_DEBIT_CARD } from "@constants/premierFundConstant";
import { checkS2UStatus } from "../Premier/helpers/premierHelpers";

import { CARD_REQUESTCARD_DEBITCARD_DELIVERY_ADDRESS } from "../Premier/helpers/AnalyticsEventConstants";

const ZestCASADebitCardResidentailDetails = (props) => {
    const { navigation, route } = props;
    const params = route?.params ?? {};

    // Hooks to access reducer data
    const prePostQualReducer = useSelector((state) => state.prePostQualReducer);
    const masterDataReducer = useSelector((state) => state.masterDataReducer);
    const entryReducer = useSelector((state) => state.zestCasaReducer.entryReducer);
    const residentialDetailsReducer = useSelector(
        (state) => state.zestCasaReducer.debitCardResidentialDetailsReducer
    );
    const debitCardInquiryReducer = useSelector((state) => state.debitCardInquiryReducer);
    //console.log('debitCardInquiryReducer--', debitCardInquiryReducer);
    const getAccountListReducer = useSelector((state) => state.getAccountListReducer);
    const { accountListings } = getAccountListReducer ?? [];
    const { userStatus } = prePostQualReducer;

    // Hooks to dispatch reducer action
    const dispatch = useDispatch();
    const selectDebitCardReducer = useSelector(
        (state) => state.zestCasaReducer.selectDebitCardReducer
    );

    const scrollPickerInitialState = {
        isDisplay: false,
        selectedIndex: 0,
        filterType: "",
        data: [],
    };

    const [scrollPicker, setScrollPicker] = useState(scrollPickerInitialState);

    useEffect(() => {
        initAccountList();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const initAccountList = async () => {
        console.log("[ZestCASADebitCardResidentailDetails] >> [initAccountList]");

        if (userStatus === ZEST_DEBIT_CARD_USER) {
            const firstAccount = accountListings[0];
            const accountCode = firstAccount.code;
            const accountNumberWithPaddingRemoved = firstAccount.number.substring(0, 12);

            dispatch({
                type: DEBIT_CARD_SELECT_ACCOUNT_ACTION,
                debitCardSelectAccountIndex: 0,
                debitCardSelectAccountCode: accountCode,
                debitCardSelectAccountNumber: accountNumberWithPaddingRemoved,
            });
        }
    };

    useEffect(() => {
        console.log("[ZestCASADebitCardResidentailDetails] >> [init]");
        dispatch({ type: DEBIT_CARD_RESIDENTIAL_CONTINUE_BUTTON_DISABLED_ACTION });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        residentialDetailsReducer.addressLineOne,
        residentialDetailsReducer.addressLineTwo,
        residentialDetailsReducer.postalCode,
        residentialDetailsReducer.stateIndex,
        residentialDetailsReducer.city,
        residentialDetailsReducer.isTermsConditionAgree,
    ]);

    function onBackTap() {
        console.log("[ZestCASADebitCardResidentialDetails] >> [onBackTap]");
        navigation.goBack();
    }

    function onCloseTap() {
        console.log("[ZestCASADebitCardResidentialDetails] >> [onCloseTap]");
        // Clear all data from ZestCASA reducers
        dispatch({ type: ZEST_CASA_CLEAR_ALL });
        dispatch({ type: DOWNTIME_CLEAR });
        dispatch({ type: MASTERDATA_CLEAR });
        navigation.navigate("Dashboard");
    }

    function onClickNext() {
        onNextTap();
    }

    const onNextTap = async () => {
        if (residentialDetailsReducer.isDebitCardResidentialContinueButtonEnabled) {
            console.log("[ZestCASADebitCardResidentailDetails] >> [onContinue]");
            // console.log(userStatus);
            // console.log(accountListings);

            if (userStatus === ZEST_DEBIT_CARD_USER || 
                userStatus === PM1_DEBIT_CARD_USER || 
                userStatus === PMA_DEBIT_CARD_USER ||
                userStatus === KAWANKU_SAVINGS_DEBIT_CARD_USER ||
                userStatus === KAWANKU_SAVINGSI_DEBIT_CARD_USER) {
                if (accountListings.length < 2) {
                    initiateS2USdk(false);
                } else {
                    navigation.navigate(ZEST_CASA_DEBIT_CARD_SELECT_ACCOUNT);
                }
            } else {
                navigation.navigate(PREMIER_MODULE_STACK, {
                    screen: PREMIER_OTP_VERIFICATION,
                });
            }
        }
    };

    function onAddressLineOneInputDidChange(value) {
        dispatch({
            type: DEBIT_CARD_ADDRESS_LINE_ONE_MASK_ACTION,
            isAddressLineOneMaskingOn: false,
        });
        dispatch({ type: DEBIT_CARD_ADDRESS_LINE_ONE_ACTION, addressLineOne: value });
    }

    function onAddressLineTwoInputDidChange(value) {
        dispatch({
            type: DEBIT_CARD_ADDRESS_LINE_TWO_MASK_ACTION,
            isAddressLineTwoMaskingOn: false,
        });
        dispatch({ type: DEBIT_CARD_ADDRESS_LINE_TWO_ACTION, addressLineTwo: value });
    }

    function onPostalCodeInputDidChange(value) {
        dispatch({ type: DEBIT_CARD_POSTAL_CODE_ACTION, postalCode: value });
    }

    function onCityInputDidChange(value) {
        dispatch({ type: DEBIT_CARD_CITY_ACTION, city: value });
    }

    function onStateDropdownPillDidTap() {
        setScrollPicker({
            isDisplay: true,
            selectedIndex: residentialDetailsReducer.stateIndex,
            filterType: "",
            data: masterDataReducer.stateData,
        });
    }

    function onScrollPickerDoneButtonDidTap(data, index) {
        dispatch({ type: DEBIT_CARD_STATE_ACTION, stateIndex: index, stateValue: data });
        setScrollPicker({
            isDisplay: false,
            selectedIndex: 0,
            filterType: "",
            data: [],
        });
    }

    function onScrollPickerCancelButtonDidTap() {
        setScrollPicker({
            isDisplay: false,
            selectedIndex: 0,
            filterType: "",
            data: [],
        });
    }

    function isDebitCardUser () {
        if(entryReducer.isPM1) {
            if(userStatus !== PM1_NTB_USER &&
                userStatus !== PM1_FULL_ETB_USER ) {
                    return true;
                }
        } else if (entryReducer.isPMA) {
            if( userStatus !== PMA_NTB_USER &&
                userStatus !== PMA_FULL_ETB_USER ){
                    return true;
                }
        } else if (entryReducer.isKawanku) {
            if ( userStatus !== KAWANKU_SAVINGS_NTB_USER &&
                userStatus !== KAWANKU_SAVINGS_FULL_ETB_USER ) {
                    return true;
                }
        } else if (entryReducer.isKawankuSavingsI) {
            if ( userStatus !== KAWANKU_SAVINGSI_NTB_USER &&
                userStatus !== KAWANKU_SAVINGSI_FULL_ETB_USER ) {
                    return true;
                }
        } else {
            if(userStatus !== ZEST_NTB_USER &&
                userStatus !== ZEST_FULL_ETB_USER) {
                    return true;
                }
        }
    }

    function getAddressLineOneValue () {
        if (residentialDetailsReducer.addressLineOne) {
            return isDebitCardUser() &&
                residentialDetailsReducer.isAddressLineOneMaskingOn
                ? maskAddress(residentialDetailsReducer.addressLineOne)
                : residentialDetailsReducer.addressLineOne;
        }
    }

    function getAddressLineTwoValue() {
        if (residentialDetailsReducer.addressLineTwo) {
            return isDebitCardUser() &&
                residentialDetailsReducer.isAddressLineTwoMaskingOn
                ? maskAddress(residentialDetailsReducer.addressLineTwo)
                : residentialDetailsReducer.addressLineTwo;
        }
    }

    function getPostalCodeValue() {
        if (residentialDetailsReducer.postalCode) {
            return residentialDetailsReducer.postalCode;
        }
    }

    function onAgreeRadioButtonDidTap() {
        dispatch({
            type: DEBIT_CARD_TERMS_CONDITION,
            isTermsConditionAgree: !residentialDetailsReducer.isTermsConditionAgree,
        });
    }

    function onLinkDidTapMethod() {
        console.log("onLinkDidTap");
        const title = TERMS_CONDITIONS;
        const url = ZEST_CASA_DEBIT_CARD_FPX_TNC;

        const props = {
            title,
            source: url,
            headerColor: TRANSPARENT,
        };

        navigation.navigate(SETTINGS_MODULE, {
            screen: "PdfSetting",
            params: props,
        });
    }

    function getTextMap() {
        return [
            {
                key: TERMS_CONDITIONS,
                fontSize: 14,
                fontWeight: "700",
                textAlign: "left",
                underline: true,
                onLinkDidTap: onLinkDidTapMethod,
                text: TERMS_CONDITIONS,
            },
        ];
    }

    function initiateS2USdk(isNTBFlow) {
        const firstAccount = accountListings ? accountListings[0] : null;
        const accountNumberWithPaddingRemoved = firstAccount ? firstAccount.number.substring(0, 12) : null;
        const accountNumberSend = isNTBFlow
            ? prePostQualReducer.acctNo
            : accountNumberWithPaddingRemoved;
        const applyDebitCardData = applyDebitCardBody(
            residentialDetailsReducer,
            selectDebitCardReducer,
            "",
            accountNumberSend
        );
        const address = residentialDetailsReducer?.addressLineOne + ",\n" + residentialDetailsReducer?.addressLineTwo + ",\n" + residentialDetailsReducer?.postalCode + ", " +
        residentialDetailsReducer?.city + ",\n" + residentialDetailsReducer?.stateValue?.name;
        
        const s2uBody = {
            totalAmount: masterDataReducer?.debitCardApplicationAmount,
            address,
            MAEAcctNo: accountNumberWithPaddingRemoved,
            productName: accountListings ? accountListings[0]?.name : null,
            debitCardFee: debitCardInquiryReducer?.msgBody?.debitCardFee,
            Msg: {
                MsgBody: applyDebitCardData
            },
        };
    
        const extraData = {
            fundConstant: FN_FUND_TRANSFER_APPLY_DEBIT_CARD,
            stack: ZEST_CASA_STACK,
            screen: ZEST_CASA_DEBIT_CARD_RESIDENTIAL_DETAILS
        };
        checkS2UStatus(navigation.navigate, params, (type, mapperData, timeStamp) => {
            if (type === S2U_PULL) {
                navigation.navigate(ZEST_CASA_STACK, {
                    screen: ZEST_CASA_OTP_VERIFICATION,
                    params: { s2u: true, mapperData, timeStamp }
                });
            } else {
                navigation.navigate(PREMIER_MODULE_STACK, {
                    screen: PREMIER_OTP_VERIFICATION,
                    params: { s2u: false }
                });
            }
        }, extraData, s2uBody);
    }

    return (
        <React.Fragment>
            <ScreenContainer
                backgroundType="color"
                analyticScreenName={CARD_REQUESTCARD_DEBITCARD_DELIVERY_ADDRESS}
            >
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
                    <React.Fragment>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <KeyboardAwareScrollView
                                behavior={Platform.OS === "ios" ? "padding" : ""}
                                enabled
                            >
                                <View style={Style.formContainer}>
                                    <View style={Style.contentContainer}>
                                        <Typo
                                            fontSize={14}
                                            fontWeight="400"
                                            lineHeight={21}
                                            textAlign="left"
                                            text={ZEST_DEBIT_CARD_APPLICATION}
                                        />
                                        <SpaceFiller height={4} />
                                        <Typo
                                            fontSize={16}
                                            fontWeight="600"
                                            lineHeight={24}
                                            textAlign="left"
                                            text={FILL_IN_DEBIT_CARD_RESIDENTIAL_DETAILS}
                                        />
                                        <SpaceFiller height={24} />
                                        {buildResidentialDetailsForm()}
                                    </View>
                                </View>
                            </KeyboardAwareScrollView>
                        </ScrollView>

                        <FixedActionContainer>
                            <View style={Style.bottomBtnContCls}>
                                <ActionButton
                                    activeOpacity={
                                        residentialDetailsReducer.isDebitCardResidentialContinueButtonEnabled
                                            ? 1
                                            : 0.5
                                    }
                                    backgroundColor={
                                        residentialDetailsReducer.isDebitCardResidentialContinueButtonEnabled
                                            ? YELLOW
                                            : DISABLED
                                    }
                                    fullWidth
                                    componentCenter={
                                        <Typo
                                            fontSize={14}
                                            lineHeight={18}
                                            fontWeight="600"
                                            text={CONTINUE}
                                        />
                                    }
                                    onPress={onClickNext}
                                />
                            </View>
                        </FixedActionContainer>
                    </React.Fragment>
                </ScreenLayout>
                <ScrollPickerView
                    showMenu={scrollPicker.isDisplay}
                    list={scrollPicker.data}
                    selectedIndex={scrollPicker.selectedIndex}
                    onRightButtonPress={onScrollPickerDoneButtonDidTap}
                    onLeftButtonPress={onScrollPickerCancelButtonDidTap}
                    rightButtonText="Done"
                    leftButtonText="Cancel"
                />
            </ScreenContainer>
        </React.Fragment>
    );

    function buildResidentialDetailsForm () {
        return (
            <React.Fragment>
                <Typo
                    fontSize={14}
                    fontWeight="400"
                    lineHeight={18}
                    textAlign="left"
                    text={ADDRESS_LINE_ONE}
                    color={BLACK}
                />
                <SpaceFiller height={12} />
                <TextInput
                    errorMessage={residentialDetailsReducer.addressLineOneErrorMessage}
                    isValid={residentialDetailsReducer.addressLineOneErrorMessage === null}
                    isValidate
                    maxLength={40}
                    value={getAddressLineOneValue()}
                    placeholder={`e.g ${UNIT_NUMBER}/${FLOOR}/${BUILDING}`}
                    onChangeText={onAddressLineOneInputDidChange}
                />
                <SpaceFiller height={24} />
                <Typo
                    fontSize={14}
                    fontWeight="400"
                    lineHeight={18}
                    textAlign="left"
                    text={ADDRESS_LINE_TWO}
                    color={BLACK}
                />
                <SpaceFiller height={12} />
                <TextInput
                    errorMessage={residentialDetailsReducer.addressLineTwoErrorMessage}
                    isValid={residentialDetailsReducer.addressLineTwoErrorMessage === null}
                    isValidate
                    maxLength={40}
                    value={getAddressLineTwoValue()}
                    placeholder={`e.g ${STREET_NAME}`}
                    onChangeText={onAddressLineTwoInputDidChange}
                />
                <SpaceFiller height={24} />
                <Typo
                    fontSize={14}
                    fontWeight="400"
                    lineHeight={18}
                    textAlign="left"
                    text={STEPUP_MAE_ADDRESS_POSTAL}
                    color={BLACK}
                />
                <SpaceFiller height={12} />
                <TextInput
                    errorMessage={residentialDetailsReducer.postalCodeErrorMessage}
                    isValid={residentialDetailsReducer.postalCodeErrorMessage === null}
                    isValidate
                    maxLength={5}
                    value={getPostalCodeValue()}
                    keyboardType="number-pad"
                    placeholder={`e.g ${POSTAL_CODE_DUMMY}`}
                    onChangeText={onPostalCodeInputDidChange}
                />
                <TitleAndDropdownPill
                    title={PLSTP_STATE}
                    titleFontWeight="400"
                    dropdownTitle={
                        residentialDetailsReducer.stateValue &&
                        residentialDetailsReducer.stateValue.name
                            ? residentialDetailsReducer.stateValue.name
                            : PLEASE_SELECT
                    }
                    dropdownOnPress={onStateDropdownPillDidTap}
                />
                <SpaceFiller height={24} />
                <Typo
                    fontSize={14}
                    fontWeight="400"
                    lineHeight={18}
                    textAlign="left"
                    text={STEPUP_MAE_ADDRESS_CITY}
                    color={BLACK}
                />
                <SpaceFiller height={12} />
                <TextInput
                    errorMessage={residentialDetailsReducer.cityErrorMessage}
                    isValid={residentialDetailsReducer.cityErrorMessage === null}
                    isValidate
                    maxLength={20}
                    value={residentialDetailsReducer.city}
                    placeholder={`e.g ${DUMMY_KUALA_LUMPUR}`}
                    onChangeText={onCityInputDidChange}
                />
                <SpaceFiller height={24} />
                {buildTermsAndCondition()}
            </React.Fragment>
        );
    }

    function buildTermsAndCondition () {
        return (
            <React.Fragment>
                <SpaceFiller height={16} />
                <Typo
                    fontSize={14}
                    fontWeight="600"
                    lineHeight={18}
                    textAlign="left"
                    text={STP_TNC}
                    color={BLACK}
                />
                <SpaceFiller height={12} />
                <TermsConditionRadioButton
                    isSelected={residentialDetailsReducer.isTermsConditionAgree}
                    onRadioButtonPressed={onAgreeRadioButtonDidTap}
                    titleStart={ZEST_DEBIT_CARD_RESIDENTIAL_DETAIL_TERMS_CONDITION}
                    textMap={getTextMap()}
                />
                <SpaceFiller height={25} />
            </React.Fragment>
        );
    }
};

ZestCASADebitCardResidentailDetails.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
    params: PropTypes.object,
};

const Style = StyleSheet.create({
    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },

    contentContainer: {
        marginHorizontal: 24,
    },

    formContainer: {
        marginBottom: 40,
    },
});

export default ZestCASADebitCardResidentailDetails;
