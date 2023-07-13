import moment from "moment";
import PropTypes from "prop-types";
import React, { useEffect } from "react";
import { StyleSheet, View, ScrollView, Platform, Image, FlatList } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useDispatch, useSelector } from "react-redux";

import { ZEST_CASA_OTP_VERIFICATION, ZEST_CASA_STACK, ZEST_CASA_DEBIT_CARD_SELECT_ACCOUNT, ZEST_CASA_DEBIT_CARD_RESIDENTIAL_DETAILS, PREMIER_MODULE_STACK, PREMIER_OTP_VERIFICATION } from "@navigation/navigationConstant";
import { applyDebitCardBody } from "@redux/utilities/actionUtilities";
import { FN_FUND_TRANSFER_APPLY_DEBIT_CARD } from "@constants/premierFundConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import BorderedAvatar from "@components/Avatars/BorderedAvatar";
import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import {
    DEBIT_CARD_SELECT_ACCOUNT_ACTION,
    DEBIT_CARD_SELECT_ACCOUNT_CLEAR,
    DEBIT_CARD_SELECT_ACCOUNT_CONTINUE_BUTTON_DISABLED_ACTION,
} from "@redux/actions/ZestCASA/debitCardSelectAccountAction";

import {
    ZEST_CASA_CLEAR_ALL,
    ZEST_DEBIT_CARD_USER,
    ZEST_DEBIT_CARD_NTB_USER,
} from "@constants/zestCasaConfiguration";

import {
    INSUFFICIENT_BALANCE,
} from "@constants/premierStrings";

import {
    PM1_DEBIT_CARD_USER,
    PMA_DEBIT_CARD_USER,
    PM1_DEBIT_CARD_NTB_USER,
    PMA_DEBIT_CARD_NTB_USER
} from "@constants/premierConfiguration";

import { YELLOW, DISABLED, SEPARATOR_GRAY, BLUE } from "@constants/colors";
import { CONFIRMATION, CURRENCY, DATE, MAYBANK, PAY_NOW, TRANSFER_FROM } from "@constants/strings";

import Assets from "@assets";
import { S2U_PULL } from "@constants/data";
import { checkS2UStatus } from "../Premier/helpers/premierHelpers";

import { entryPropTypes } from "./ZestCASAEntry";
import { CASAAccountSelector } from "./components/CASAAccountSelector";
import {
    TRANSFER_M2UPREMIER_REVIEWDEATILS,
    TRANSFER_ZESTI_REVIEWDEATILS,
} from "./helpers/AnalyticsEventConstants";

const DebitCardZestCASASelectAccount = (props) => {
    const { navigation, route } = props;
    const params = route?.params ?? {};

    // Hooks to access reducer data
    const debitCardSelectAccountReducer = useSelector(
        (state) => state.zestCasaReducer.debitCardSelectAccountReducer
    );
    const masterDataReducer = useSelector((state) => state.masterDataReducer);
    const getAccountListReducer = useSelector((state) => state.getAccountListReducer);
    const residentialDetailsReducer = useSelector(
        (state) => state.zestCasaReducer.debitCardResidentialDetailsReducer
    );
    const prePostQualReducer = useSelector((state) => state.prePostQualReducer);
    const debitCardInquiryReducer = useSelector((state) => state.debitCardInquiryReducer);
    const { userStatus } = prePostQualReducer;

    const selectDebitCardReducer = useSelector(
        (state) => state.zestCasaReducer.selectDebitCardReducer
    );

    const { accountListings } = getAccountListReducer ?? [];
    const {
        isDebitCardSelectAccountContinueButtonEnabled,
        debitCardSelectAccountIndex,
        debitCardSelectAccountCode,
        debitCardSelectAccountNumber,
    } = debitCardSelectAccountReducer;

    const { debitCardApplicationAmount } = masterDataReducer;
    const draftUserAccountInquiryReducer = useSelector(
        (state) => state.draftUserAccountInquiryReducer
    );

    const isZestI = draftUserAccountInquiryReducer?.isZestI;

    const deliverAddress = residentialDetailsReducer?.addressLineOne + ",\n" + residentialDetailsReducer?.addressLineTwo + ",\n" + residentialDetailsReducer?.postalCode + ", " +
    residentialDetailsReducer?.city + ",\n" + residentialDetailsReducer?.stateValue?.name;

    // Hooks to dispatch reducer action
    const dispatch = useDispatch();

    useEffect(() => {
        init();
    }, []);

    useEffect(() => {
        dispatch({ type: DEBIT_CARD_SELECT_ACCOUNT_CONTINUE_BUTTON_DISABLED_ACTION });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debitCardSelectAccountIndex, debitCardSelectAccountCode, debitCardSelectAccountNumber]);

    const init = async () => {
        console.log("[DebitCardZestCASASelectAccount] >> [init]");
    };

    function onBackTap() {
        console.log("[DebitCardZestCASASelectAccount] >> [onBackTap]");
        navigation.goBack();
    }

    function onCloseTap() {
        console.log("[DebitCardZestCASASelectAccount] >> [onCloseTap]");
        dispatch({ type: DEBIT_CARD_SELECT_ACCOUNT_CLEAR });
        dispatch({ type: ZEST_CASA_CLEAR_ALL });
        navigation.navigate("Dashboard");
    }

    function onPayNowButtonDidTap() {
        console.log("[DebitCardZestCASASelectAccount] >> [onPayNowButtonDidTap]");
         const selectedAccount = accountListings[debitCardSelectAccountIndex];
         const selectedAccTransferAmount = debitCardApplicationAmount;
        if (isDebitCardSelectAccountContinueButtonEnabled &&
            selectedAccount?.value >= Number(debitCardApplicationAmount) &&
            selectedAccount?.value >= Number(selectedAccTransferAmount)
        ) {
            checkDebitCardStatus();
        } else {
            showErrorToast({
                message: INSUFFICIENT_BALANCE,
            });
        }
    }

    function onAccountTileDidTap(index, accountCode, accountNumber) {
        console.log("[DebitCardZestCASASelectAccount] >> [onAccountTileDidTap]");
        console.log(index);
        console.log(accountCode);
        console.log(accountNumber);

        dispatch({
            type: DEBIT_CARD_SELECT_ACCOUNT_ACTION,
            debitCardSelectAccountIndex: index,
            debitCardSelectAccountCode: accountCode,
            debitCardSelectAccountNumber: accountNumber,
        });
    }

    function keyExtractor(item) {
        return `${item.number}`;
    }

    const formattedCurrentDate = () => moment(new Date()).format("DD MMM YYYY");

    const transferAmountWithCurrencyCode = () => {
        return `${CURRENCY}${debitCardApplicationAmount}`;
    };
    async function checkDebitCardStatus() {
        switch (userStatus) {
            case ZEST_DEBIT_CARD_USER:
            case PM1_DEBIT_CARD_USER:
            case PMA_DEBIT_CARD_USER:
                initiateS2USdk(false);
                break;

            case ZEST_DEBIT_CARD_NTB_USER:
            case PM1_DEBIT_CARD_NTB_USER:
            case PMA_DEBIT_CARD_NTB_USER:
                initiateS2USdk(true);
                break;

            default:
                break;
        }
    }

    function initiateS2USdk(isNTBFlow) {
        const accountNumberSend = isNTBFlow
            ? prePostQualReducer.acctNo
            : debitCardSelectAccountNumber;
        const applyDebitCardData = applyDebitCardBody(
            residentialDetailsReducer,
            selectDebitCardReducer,
            "",
            accountNumberSend
        );
      
        const s2uBody = {
            totalAmount: masterDataReducer?.debitCardApplicationAmount,
            address: deliverAddress,
            MAEAcctNo: debitCardSelectAccountNumber,
            productName: accountListings[debitCardSelectAccountIndex]?.name,
            debitCardFee: debitCardInquiryReducer?.msgBody?.debitCardFee,
            Msg: {
                MsgBody: applyDebitCardData,
            },
            idNo: prePostQualReducer.idNo,
        };
            const extraData = {
                fundConstant: FN_FUND_TRANSFER_APPLY_DEBIT_CARD,
                stack: ZEST_CASA_STACK,
                screen: ZEST_CASA_DEBIT_CARD_SELECT_ACCOUNT
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

    function onButtonPress() {
        navigation.navigate(ZEST_CASA_STACK, {
            screen: ZEST_CASA_DEBIT_CARD_RESIDENTIAL_DETAILS,
        });
    }

    const analyticScreenName = isZestI
        ? TRANSFER_ZESTI_REVIEWDEATILS
        : TRANSFER_M2UPREMIER_REVIEWDEATILS;

    return (
        <React.Fragment>
            <ScreenContainer backgroundType="color" analyticScreenName={analyticScreenName}>
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                            headerCenterElement={
                                <Typo
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={20}
                                    textAlign="center"
                                    text={CONFIRMATION}
                                />
                            }
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
                                        <View style={Style.bankIconAlignment}>
                                            <BorderedAvatar
                                                width={64}
                                                height={64}
                                                borderRadius={32}
                                            >
                                                <Image
                                                    style={Style.avatarImage}
                                                    source={Assets.MAYBANK}
                                                />
                                            </BorderedAvatar>
                                        </View>
                                        <SpaceFiller height={10} />
                                        <Typo
                                            fontSize={14}
                                            fontWeight="600"
                                            lineHeight={18}
                                            textAlign="center"
                                            text={MAYBANK}
                                        />
                                        <SpaceFiller height={16} />
                                        <TouchableOpacity onPress={onButtonPress}>
                                            <Typo
                                                fontSize={24}
                                                fontWeight="700"
                                                lineHeight={31}
                                                textAlign="center"
                                                text={transferAmountWithCurrencyCode()}
                                            />
                                        </TouchableOpacity>
                                        
                                        <SpaceFiller height={16} />
                                        <Typo
                                            fontSize={14}
                                            fontWeight="600"
                                            lineHeight={18}
                                            textAlign="left"
                                            text={TRANSFER_FROM}
                                        />
                                    </View>
                                    {accountListings && accountListings.length > 0 && (
                                        <React.Fragment>
                                            <FlatList
                                                data={accountListings}
                                                renderItem={renderAccountSelectorItem}
                                                horizontal={true}
                                                showsHorizontalScrollIndicator={false}
                                                keyExtractor={keyExtractor}
                                                contentContainerStyle={Style.flatlistContainer}
                                            />
                                        </React.Fragment>
                                    )}
                                    <View style={Style.contentContainer}>
                                    <SpaceFiller height={16} />
                                        <View style={Style.separator} />
                                        <SpaceFiller height={16} /> 
                                        <View style={Style.rowedContainer}>
                                            <View style={Style.descriptionBox}>
                                                <Typo
                                                    fontSize={12}
                                                    fontWeight="400"
                                                    lineHeight={18}
                                                    textAlign="left"
                                                    text={DATE}
                                                />
                                            </View>
                                            <View style={Style.dataBox}>
                                                <Typo
                                                    fontSize={12}
                                                    fontWeight="600"
                                                    lineHeight={18}
                                                    textAlign="right"
                                                    text={formattedCurrentDate()}
                                                />
                                            </View>
                                        </View>
                                        <SpaceFiller height={16} />
                                        <View style={Style.rowedContainer}>
                                            <View style={Style.descriptionBox}>
                                                <Typo
                                                    fontSize={12}
                                                    fontWeight="400"
                                                    lineHeight={18}
                                                    textAlign="left"
                                                    text="Delivery address"
                                                />
                                            </View>
                                            <View style={Style.dataBox}>
                                            <TouchableOpacity onPress={onButtonPress}>
                                                <Typo
                                                    fontSize={14}
                                                    fontWeight="600"
                                                    fontStyle="normal"
                                                    letterSpacing={0}
                                                    lineHeight={18}
                                                    color={BLUE}
                                                    textAlign="right"
                                                    text={deliverAddress}
                                                />
                                            </TouchableOpacity>
                                            </View>
                                        </View>
                                    </View>
                                    
                                </View>
                               
                            </KeyboardAwareScrollView>
                        </ScrollView>

                        <FixedActionContainer>
                            <View style={Style.bottomBtnContCls}>
                                <ActionButton
                                    activeOpacity={
                                        isDebitCardSelectAccountContinueButtonEnabled ? 1 : 0.5
                                    }
                                    backgroundColor={
                                        isDebitCardSelectAccountContinueButtonEnabled
                                            ? YELLOW
                                            : DISABLED
                                    }
                                    fullWidth
                                    componentCenter={
                                        <Typo
                                            fontSize={14}
                                            lineHeight={18}
                                            fontWeight="600"
                                            text={PAY_NOW}
                                        />
                                    }
                                    onPress={onPayNowButtonDidTap}
                                />
                            </View>
                        </FixedActionContainer>
                    </React.Fragment>
                </ScreenLayout>
            </ScreenContainer>
        </React.Fragment>
    );

    function renderAccountSelectorItem({ index, item }) {
        const accountNumberWithPaddingRemoved = item.number.substring(0, 12);

        return (
            <CASAAccountSelector
                accountCode={item.code}
                accountName={item.name}
                accountBalance={item.balance}
                accountNumber={accountNumberWithPaddingRemoved}
                accountIndex={index}
                selectedIndex={debitCardSelectAccountIndex}
                onAccountTileDidTap={onAccountTileDidTap}
            />
        );
    }
};

const Style = StyleSheet.create({
    avatarImage: {
        borderRadius: 32,
        height: 64,
        width: 64,
    },
    bankIconAlignment: {
        alignItems: "center",
    },

    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },

    contentContainer: {
        marginHorizontal: 24,
    },
    dataBox: {
        width: 160,
    },

    descriptionBox: {
        width: 153,
    },

    flatlistContainer: {
        paddingHorizontal: 24,
    },

    formContainer: {
        marginBottom: 40,
    },

    rowedContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
    },

    separator: {
        backgroundColor: SEPARATOR_GRAY,
        height: 1,
        width: "100%",
    },
});

export const selectCASAPropTypes = (DebitCardZestCASASelectAccount.propTypes = {
    ...entryPropTypes,

    item: PropTypes.object,
    index: PropTypes.number,
    isSecure2uVisible: PropTypes.bool,
});

export default DebitCardZestCASASelectAccount;
