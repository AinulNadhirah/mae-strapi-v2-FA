import PropTypes from "prop-types";
import React, { useCallback } from "react";
import { View, StyleSheet, TouchableOpacity, Dimensions, Clipboard } from "react-native";
import * as Animatable from "react-native-animatable";
import { ApplePayButton } from "react-native-payments";

import CreditCardBig from "@components/Cards/CreditCardBig";
import ProductCardBig from "@components/Cards/ProductCardBig";
import ProductCardLoader from "@components/Cards/ProductCardLoader";
import ProductMAECard from "@components/Cards/ProductMAECard";
import { ActionButtonMenus } from "@components/Menus/FunctionEntryPointMenu";
import Typo from "@components/Text";
import { showInfoToast } from "@components/Toast";

import { useModelController } from "@context";

import { logEvent } from "@services/analytics";

import { ROYAL_BLUE } from "@constants/colors";
import {
    FA_ACCOUNT_DETAILS,
    FA_SCREEN_NAME,
    FA_ACTION_NAME,
    FA_COPY_ACC_NUM,
    FA_SELECT_ACTION,
    VIEW_STATEMENTS,
    AUTO_BILLING_NEW_LINE,
} from "@constants/strings";

import { formateAccountNumber, convertStringToNumber } from "@utils/dataModel/utility";

import Assets from "@assets";

const { width } = Dimensions.get("window");

const shortcutItemsCC = (isAccountSuspended) => [
    { value: "1", title: "Pay Card", iconImage: Assets.icPayCard },
    { value: "2", title: "Pay Bills", iconImage: Assets.icPayBill, isAccountSuspended },
];

const shortcutItemsCCExpired = [
    { value: "1", title: "Pay Card", iconImage: Assets.icPayCard },
    { value: "2", title: "Pay Bills", iconImage: Assets.icPayBill },
    { value: "3", title: "Activate Card", iconImage: Assets.icActivateCard },
];

const shortcutItemsMAE = (isAccountSuspended) => [
    { value: "1", title: "Top Up\nMAE", iconImage: Assets.icTopUpMAE, isAccountSuspended },
    { value: "2", title: "Transfer", iconImage: Assets.icTransfer, isAccountSuspended },
    { value: "3", title: "Pay Bills", iconImage: Assets.icPayBill, isAccountSuspended },
    { value: "4", title: "Reload", iconImage: Assets.icReload, isAccountSuspended },
    { value: "5", title: "Pay Card", iconImage: Assets.icPayCard, isAccountSuspended },
    { value: "6", title: "Split Bill", iconImage: Assets.icSplitBill, isAccountSuspended },
    { value: "7", title: "Send & Request", iconImage: Assets.icMoneyInOut, isAccountSuspended },
    {
        value: "8",
        title: VIEW_STATEMENTS,
        iconImage: Assets.icViewStatements,
    },
    { value: "9", title: "Scan & Pay", iconImage: Assets.icScanAndPay, isAccountSuspended },
    { value: "16", title: "ATM Cash-out", iconImage: Assets.atmCashout, isAccountSuspended },
    { value: "15", title: "Sama2 Lokal", iconImage: Assets.SSLIconColor, isAccountSuspended },
    { value: "10", title: "Groceries", iconImage: Assets.icMyGroser, isAccountSuspended },
    { value: "11", title: "Movies & Leisure", iconImage: Assets.icMovieTicket, isAccountSuspended },
    { value: "12", title: "Flight Tickets", iconImage: Assets.icFlightTicket, isAccountSuspended },
    { value: "13", title: "Bus Tickets", iconImage: Assets.icBusTicket, isAccountSuspended },
    { value: "14", title: "ERL Tickets", iconImage: Assets.icErlTicket, isAccountSuspended },
    { value: "15", title: "Travel Deals", iconImage: Assets.icExpedia, isAccountSuspended },
    { value: "17", title: "Auto\nBilling", iconImage: Assets.icPayBill, isAccountSuspended },
];

const shortcutItemsCASA = (isAccountSuspended) => [
    { value: "1", title: "Transfer", iconImage: Assets.icTransfer, isAccountSuspended },
    { value: "2", title: "Pay Bills", iconImage: Assets.icPayBill, isAccountSuspended },
    { value: "3", title: "Reload", iconImage: Assets.icReload, isAccountSuspended },
    { value: "4", title: "Pay Card", iconImage: Assets.icPayCard, isAccountSuspended },
    { value: "5", title: "Split Bill", iconImage: Assets.icSplitBill, isAccountSuspended },
    { value: "6", title: "Send & Request", iconImage: Assets.icMoneyInOut, isAccountSuspended },
    { value: "17", title: "Auto\nBilling", iconImage: Assets.icPayBill, isAccountSuspended },
    { value: "7", title: "Scan & Pay", iconImage: Assets.icScanAndPay, isAccountSuspended },
    {
        value: "8",
        title: VIEW_STATEMENTS,
        iconImage: Assets.icViewStatements,
    },
    { value: "15", title: "Sama2 Lokal", iconImage: Assets.SSLIconColor, isAccountSuspended },
    { value: "16", title: "ATM Cash-out", iconImage: Assets.atmCashout, isAccountSuspended },
    { value: "9", title: "Groceries", iconImage: Assets.icMyGroser, isAccountSuspended },
    { value: "10", title: "Movies & Leisure", iconImage: Assets.icMovieTicket, isAccountSuspended },
    { value: "11", title: "Flight Tickets", iconImage: Assets.icFlightTicket, isAccountSuspended },
    { value: "12", title: "Bus Tickets", iconImage: Assets.icBusTicket, isAccountSuspended },
    { value: "13", title: "ERL Tickets", iconImage: Assets.icErlTicket, isAccountSuspended },
    { value: "14", title: "Travel Deals", iconImage: Assets.icExpedia, isAccountSuspended },
];

const accountTypeEnum = Object.freeze({
    savings: "SAVINGS",
    current: "CURRENT",
    mae: "MAE",
    cc: "CC",
    ccExpired: "CC_EXPIRED",
});

const getShortcutItems = (
    entryPointType,
    isAccountSuspended = false,
    isShowSuspendCASA = false
) => {
    const deactivateCASAShortcut = {
        title: "Deactivate account",
        iconImage: Assets.deactivateAcc,
        isAccountSuspended,
    };
    const { getModel } = useModelController();
    const { autoBillingEnable } = getModel("misc");

    if (accountTypeEnum.savings === entryPointType || accountTypeEnum.current === entryPointType) {
        let CASAShortcutItems;
        if (!autoBillingEnable) {
            CASAShortcutItems = shortcutItemsCASA(isAccountSuspended).filter((item) => {
                return item?.title !== AUTO_BILLING_NEW_LINE;
            });
        } else {
            CASAShortcutItems = shortcutItemsCASA(isAccountSuspended);
        }
        if (isShowSuspendCASA) {
            CASAShortcutItems.push({
                ...deactivateCASAShortcut,
                value: CASAShortcutItems.length + 1,
            });
        }
        return CASAShortcutItems;
    }

    if (accountTypeEnum.mae === entryPointType) {
        let maeShortcutItems;
        if (!autoBillingEnable) {
            maeShortcutItems = shortcutItemsMAE(isAccountSuspended).filter((item) => {
                return item?.title !== AUTO_BILLING_NEW_LINE;
            });
        } else {
            maeShortcutItems = shortcutItemsMAE(isAccountSuspended);
        }
        if (isShowSuspendCASA) {
            maeShortcutItems.push({
                ...deactivateCASAShortcut,
                value: maeShortcutItems.length + 1,
            });
        }
        return maeShortcutItems;
    }

    if (accountTypeEnum.cc === entryPointType) return shortcutItemsCC(isAccountSuspended);
    return shortcutItemsCCExpired;
};
const filterItems = (list, disabledItems) => {
    let disableItemList = [];
    disableItemList = list.filter((item) => {
        if (disabledItems) {
            return disabledItems.includes(item?.title) === false;
        }
        return disableItemList;
    });
    return disableItemList;
};
const getCreditCardShortcutItems = (
    {
        supplementaryAvailable,
        mainCardType,
        btEnable,
        ezyPayEnable,
        cardType,
        cardStatement,
        acctStatusCode,
    },
    detectedType,
    isAccountSuspended,
    isShowBlockCard = false
) => {
    const type = mainCardType ?? "";
    const isPrimaryCard = type.toUpperCase() === "PP";
    let shortcuts = [];
    shortcuts = getShortcutItems(accountTypeEnum.cc, isAccountSuspended);
    if (isPrimaryCard) {
        if (acctStatusCode === "01") {
            shortcuts.pop();
        }
        if (cardStatement) {
            shortcuts = [
                ...shortcuts,
                {
                    value: "3",
                    title: VIEW_STATEMENTS,
                    iconImage: Assets.icViewStatements,
                },
            ];
        }
        if (detectedType === accountTypeEnum.cc) {
            if (btEnable && cardType === "C") {
                shortcuts = [
                    ...shortcuts,
                    {
                        value: "5",
                        title: "Balance Transfer",
                        iconImage: Assets.balanceTransfer,
                        isAccountSuspended,
                    },
                ];
            }
            if (ezyPayEnable && cardType === "C") {
                shortcuts = [
                    ...shortcuts,
                    {
                        value: "4",
                        title: "EzyPay Plus",
                        iconImage: Assets.ezyPay,
                        isAccountSuspended,
                    },
                ];
            }
        }
        if (supplementaryAvailable) {
            shortcuts = [
                ...shortcuts,
                {
                    value: "6",
                    title: "Supp. Card",
                    iconImage: Assets.icSupplementaryCard,
                },
            ];
        }
        if (detectedType === accountTypeEnum.ccExpired) {
            shortcuts = [
                ...shortcuts,
                {
                    value: supplementaryAvailable ? "7" : "4",
                    title: "Activate Card",
                    iconImage: Assets.icActivateCard,
                },
            ];
        }
        if (isShowBlockCard) {
            shortcuts = [
                ...shortcuts,
                {
                    value: "8",
                    title: "Block Card",
                    iconImage: Assets.blockCard,
                    isAccountSuspended,
                },
            ];
        }
        return shortcuts;
    }
    shortcuts = [{ value: "1", title: "Pay Card", iconImage: Assets.icPayCard }];
    if (acctStatusCode === "01") {
        shortcuts.pop();
    }
    if (detectedType === accountTypeEnum.ccExpired) {
        shortcuts = [
            ...shortcuts,
            { value: "2", title: "Activate Card", iconImage: Assets.icActivateCard },
        ];
    }
    if (cardStatement) {
        shortcuts = [
            ...shortcuts,
            {
                value: "3",
                title: VIEW_STATEMENTS,
                iconImage: Assets.icViewStatements,
            },
        ];
    }
    if (isShowBlockCard) {
        shortcuts = [
            ...shortcuts,
            {
                value: "4",
                title: "Block Card",
                iconImage: Assets.blockCard,
                isAccountSuspended,
            },
        ];
    }
    return shortcuts;
};

const copyAccNoToClipboard = (accNo) => {
    const copyToClipboard = accNo ?? "";
    Clipboard.setString(copyToClipboard);
    logEvent(FA_SELECT_ACTION, {
        [FA_SCREEN_NAME]: FA_ACCOUNT_DETAILS,
        [FA_ACTION_NAME]: FA_COPY_ACC_NUM,
    });
    showInfoToast({
        message: "Account number copied to clipboard.",
    });
};

const AccountDetailsLayout = ({
    sslReady,
    children,
    data,
    onPressViewTxn,
    onPressGridItem,
    type,
    maeData,
    isWallet,
    onPressSettings,
    showSettings,
    applePay,
    onPressApplePay,
    myGroserAvailable,
    disabledItems,
    onAutoTopup,
    isAccountSuspended = false,
    getModel,
    ...props
}) => {
    const thumbWidth = width * 0.2;
    const thumbFontSize = width * 0.032;
    const { isShowBlockCard, isShowSuspendCASA } = getModel("misc");

    const onCardPress = useCallback(() => {
        !isAccountSuspended && copyAccNoToClipboard(formateAccountNumber(data.acctNo, 12));
    }, [data.acctNo]);

    const conversionAvailable =
        maeData && maeData.currencyCode && maeData.exchangeRate && maeData.conversionAmount;

    return (
        <View style={styles.container} {...props}>
            {!data && <ProductCardLoader large />}

            <Animatable.View animation="fadeIn" duration={500} useNativeDriver>
                <View style={styles.innerContainer}>
                    {type === accountTypeEnum.savings && (
                        <ProductCardBig
                            title={data.acctName}
                            accountNumber={formateAccountNumber(data.acctNo, 12)}
                            desc="Available Balance"
                            amount={convertStringToNumber(data.acctBalance)}
                            isPrimary={isWallet ? false : data.primary}
                            image={Assets.casaFullBg}
                            onCardPressed={onCardPress}
                            isAccountSuspended={isAccountSuspended}
                        />
                    )}

                    {type === accountTypeEnum.current && (
                        <ProductCardBig
                            title={data.acctName}
                            accountNumber={formateAccountNumber(data.acctNo, 12)}
                            desc="Available Balance"
                            amount={convertStringToNumber(data.acctBalance)}
                            isPrimary={isWallet ? false : data.primary}
                            image={Assets.casaFullBg}
                            onCardPressed={onCardPress}
                            isAccountSuspended={isAccountSuspended}
                        />
                    )}

                    {type === accountTypeEnum.mae && (
                        <ProductMAECard
                            title={data.acctName}
                            accountNumber={formateAccountNumber(data.acctNo, 12)}
                            desc="Available Balance"
                            amount={convertStringToNumber(data.acctBalance)}
                            isPrimary={isWallet ? false : data.primary}
                            image={Assets.maeFullBg}
                            conversionAvailable={conversionAvailable}
                            conversionRate={
                                maeData &&
                                `${maeData.currencyCode} ${maeData.baseUnit} = RM ${maeData.exchangeRate}`
                            }
                            conversionCountryImg={maeData && { uri: maeData.countryImageUrl }}
                            conversionValue={
                                maeData && convertStringToNumber(maeData.conversionAmount)
                            }
                            currencyCode={maeData && maeData.currencyCode}
                            showSettings={showSettings}
                            onPressSettings={onPressSettings}
                            onCardPressed={onCardPress}
                            onAutoTopup={onAutoTopup}
                            isAccountSuspended={isAccountSuspended}
                        />
                    )}

                    {(type === accountTypeEnum.cc || type === accountTypeEnum.ccExpired) && (
                        <CreditCardBig
                            title={data.cardHolderName}
                            accountNumber={data.cardNo}
                            desc="Outstanding Balance"
                            amount={data.outstandingBalance}
                            isPrimary={isWallet ? false : data.primary}
                            hasSupplementary={data.supplementaryAvailable}
                            image={Assets.cardsFullBackground}
                            isAccountSuspended={isAccountSuspended}
                        />
                    )}
                </View>

                <View style={styles.viewTxnContainer}>
                    <TouchableOpacity onPress={onPressViewTxn}>
                        <Typo
                            text="View Transactions"
                            fontSize={14}
                            fontWeight="600"
                            lineHeight={18}
                            color={ROYAL_BLUE}
                        />
                    </TouchableOpacity>
                </View>
                {applePay && (
                    <View style={styles.payBtn}>
                        <ApplePayButton type="inStore" style="black" onPress={onPressApplePay} />
                    </View>
                )}
                <ActionButtonMenus
                    sslReady={sslReady}
                    myGroserAvailable={myGroserAvailable}
                    actions={
                        type === accountTypeEnum.cc || type === accountTypeEnum.ccExpired
                            ? getCreditCardShortcutItems(
                                  data,
                                  type,
                                  isAccountSuspended,
                                  isShowBlockCard
                              )
                            : filterItems(
                                  getShortcutItems(type, isAccountSuspended, isShowSuspendCASA),
                                  disabledItems
                              )
                    }
                    onFunctionEntryPointButtonPressed={onPressGridItem}
                    actionWidth={thumbWidth > 75 ? 75 : thumbWidth}
                    actionHeight={88}
                    actionFontSize={thumbFontSize > 12 ? 12 : thumbFontSize}
                    itemPerPage={8}
                    isAccountSuspended={isAccountSuspended}
                />
                {/* <FunctionEntryPointMenu
                    onFunctionEntryPointButtonPressed={onPressGridItem}
                    shortcutItems={
                        type === accountTypeEnum.cc
                            ? getCreditCardShortcutItems(data?.supplementaryAvailable ?? false)
                            : getShortcutItems(type)
                    }
                /> */}
            </Animatable.View>

            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        flex: 1,
        marginTop: 16,
        // paddingHorizontal: 24,
    },
    innerContainer: {
        paddingHorizontal: 24,
    },
    payBtn: {
        marginLeft: "10%",
        marginRight: "10%",
        marginBottom: 32,
    },
    viewTxnContainer: {
        marginBottom: 28,
    },
});

AccountDetailsLayout.propTypes = {
    sslReady: PropTypes.bool,
    applePay: PropTypes.bool,
    children: PropTypes.element.isRequired,
    data: PropTypes.object.isRequired,
    type: PropTypes.string.isRequired,
    onPressViewTxn: PropTypes.func.isRequired,
    onPressGridItem: PropTypes.func.isRequired,
    onPressApplePay: PropTypes.func,
    maeData: PropTypes.object,
    isWallet: PropTypes.bool,
    onPressSettings: PropTypes.func,
    showSettings: PropTypes.bool,
    myGroserAvailable: PropTypes.bool,
    disabledItems: PropTypes.array,
    isAccountSuspended: PropTypes.bool,
    onAutoTopup: PropTypes.func,
    getModel: PropTypes.func,
};

export default React.memo(AccountDetailsLayout);
