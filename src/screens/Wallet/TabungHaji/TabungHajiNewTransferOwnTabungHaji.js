import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import { ScrollView, StyleSheet } from "react-native";

import {
    FUNDTRANSFER_MODULE,
    TABUNG_HAJI_TRANSFER_OTHER_TABUNGHAJI,
    TABUNG_HAJI_TRANSFER_OTHER_MAYBANK,
    TABUNG_HAJI_ENTER_AMOUNT,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import { ScrollPickerView } from "@components/Common";
import { Dropdown } from "@components/Common/DropDownButtonCenter";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typography from "@components/Text";
import Typo from "@components/TextWithInfo";
import { showErrorToast } from "@components/Toast";

import { TabungHajiAnalytics } from "@services/analytics/analyticsTabungHaji";

import { YELLOW, LIGHTER_YELLOW, DISABLED_TEXT, BLACK } from "@constants/colors";
import {
    OWN_TH,
    OWN_MBB,
    OTHER_TH,
    OTHER_MBB,
    TABUNGHAJI,
    TABUNG_HAJI,
    MAYBANK,
    PLEASE_SELECT,
    FROM,
    TO,
    DONE,
    CANCEL,
    CONTINUE,
    UNABLE_RETRIEVE_ACCOUNT_TRY_AGAIN,
    COMMON_ERROR_MSG,
    TRANSFER_TO_HEADER,
} from "@constants/strings";

import { formateAccountNumber, addSpaceAfter4Chars } from "@utils/dataModel/utility";

import Assets from "@assets";

function TabungHajiNewTransferOwnTabungHaji({ navigation, route }) {
    const [accountListFrom, setAccountListFrom] = useState([]);
    const [accountListTo, setAccountListTo] = useState([]);
    //From account scroll picker state
    const [showFromAccountScrollPicker, setShowFromAccountScrollPicker] = useState(false);
    const [fromAccountScrollPickerItems, setFromAccountScrollPickerItems] = useState([]);
    const [selectedFromAccountIndex, setSelectedFromAccountIndex] = useState(null);
    //To account scroll picker state
    const [showToAccountScrollPicker, setShowToAccountScrollPicker] = useState(false);
    const [toAccountScrollPickerItems, setToAccountScrollPickerItems] = useState([]);
    const [selectedToAccountIndex, setSelectedToAccountIndex] = useState(null);
    //Dropdown button state
    const [fromAccountSelectedItemValue, setFromAccountSelectedItemValue] = useState(PLEASE_SELECT);
    const [toAccountSelectedItemValue, setToAccountSelectedItemValue] = useState(PLEASE_SELECT);

    const isFormValid = validateAllFormInput();

    const { senderName } = route?.params?.tabunghajiTransferState;

    useEffect(() => {
        getAllAccountsList();
        TabungHajiAnalytics.newTransferLoaded(TABUNGHAJI);
    }, []);

    useEffect(() => {
        if (showFromAccountScrollPicker) {
            setSelectedToAccountIndex(0);
            setToAccountSelectedItemValue(PLEASE_SELECT);
        }
    }, [showFromAccountScrollPicker]);

    async function getAllAccountsList() {
        try {
            const accListMBB = route?.params?.maybankParams;
            const accListTH = route?.params?.tabunghajiParams;

            const tabunghajiOwnAccounts = accListTH.map((item) => {
                return {
                    id: OWN_TH,
                    name: item?.accountName ?? "",
                    description1: addSpaceAfter4Chars(item.accountNo) ?? "",
                    description2: TABUNG_HAJI ?? "",
                    icNo: item?.beneficiaryId ?? "",
                    image: null,
                    primary: item.primary ?? "",
                    type: null,
                    code: null,
                    balance: item.balance ?? "",
                };
            });

            const otherAccounts = [
                {
                    id: OTHER_MBB,
                    name: null,
                    description1: null,
                    description2: "Other Maybank Account",
                    icNo: null,
                    image: null,
                    primary: null,
                    type: null,
                    code: null,
                    balance: null,
                },
                {
                    id: OTHER_TH,
                    name: null,
                    description1: null,
                    description2: "Other Tabung Haji Account",
                    icNo: null,
                    image: null,
                    primary: null,
                    type: null,
                    code: null,
                    balance: null,
                },
            ];

            if (accListMBB != null) {
                if (accListMBB) {
                    const casaAccounts = accListMBB
                        .map((item, index) => {
                            return {
                                id: OWN_MBB,
                                name: senderName,
                                description1:
                                    formateAccountNumber(item.number.substring(0, 12)) ?? "",
                                description2: item.name ?? "",
                                icNo: null,
                                image:
                                    item.name === "MAE"
                                        ? {
                                              type: "local",
                                              source: Assets.icMAE,
                                          }
                                        : {
                                              type: "local",
                                              source: Assets.Maybank,
                                          },
                                primary: item.primary ?? "",
                                type: item.type ?? "",
                                code: item.code ?? "",
                                balance: item.balance ?? "",
                            };
                        })
                        .filter((itemfilter) => {
                            return itemfilter?.description2 !== "MAE";
                        });

                    const accountItemsFrom = casaAccounts.concat(tabunghajiOwnAccounts);
                    const accountItemsTo = accountItemsFrom.concat(...otherAccounts);

                    setAccountListFrom(accountItemsFrom);
                    setAccountListTo(accountItemsTo);
                }
            } else {
                showErrorToast({ message: UNABLE_RETRIEVE_ACCOUNT_TRY_AGAIN });
                handleHeaderBackButtonPressed();
            }
        } catch (error) {
            showErrorToast({
                message: error?.error?.message || COMMON_ERROR_MSG,
            });
        }
    }

    function handleHeaderBackButtonPressed() {
        navigation.goBack();
    }

    function handleScrollPickerCancelButtonPressed() {
        setShowFromAccountScrollPicker(false);
        setShowToAccountScrollPicker(false);
    }

    function handleFromAccountSelection(item, index) {
        setShowFromAccountScrollPicker(false);
        setSelectedFromAccountIndex(index);
        setFromAccountSelectedItemValue(item);
    }

    function handleToAccountSelection(item, index) {
        setShowToAccountScrollPicker(false);
        setSelectedToAccountIndex(index);
        setToAccountSelectedItemValue(item);
    }

    function validateAllFormInput() {
        const isIndexValid = selectedFromAccountIndex !== null && selectedToAccountIndex !== null;

        const allDropDownSelected =
            fromAccountSelectedItemValue !== PLEASE_SELECT &&
            toAccountSelectedItemValue !== PLEASE_SELECT;

        const transferNotFromToMBB =
            toAccountSelectedItemValue?.id === OWN_MBB &&
            fromAccountSelectedItemValue?.id === OWN_MBB;

        const transferNotToSameAcc =
            toAccountSelectedItemValue.accNo !== fromAccountSelectedItemValue.accNo;

        const isAllDropDownValid =
            allDropDownSelected && isIndexValid && transferNotToSameAcc && !transferNotFromToMBB;

        return isAllDropDownValid;
    }

    function generateNewTabungHajiTransferParam() {
        return {
            fromAccount: fromAccountScrollPickerItems[selectedFromAccountIndex],
            toAccount: toAccountScrollPickerItems[selectedToAccountIndex],
        };
    }

    function handleNewTabungHajiTransferDetailConfirmation() {
        const params = generateNewTabungHajiTransferParam();
        let bankName = "";

        if (params?.toAccount?.id === OWN_TH || params?.toAccount?.id === OTHER_TH) {
            bankName = TABUNG_HAJI;
        } else {
            bankName = MAYBANK;
        }

        if (params) {
            if (params?.toAccount?.id === OTHER_TH) {
                navigation.navigate(TABUNG_HAJI_TRANSFER_OTHER_TABUNGHAJI, {
                    ...route?.params,
                    tabunghajiTransferState: {
                        bankName,
                        ...generateNewTabungHajiTransferParam(),
                    },
                });
            } else if (params?.toAccount?.id === OTHER_MBB) {
                navigation.navigate(TABUNG_HAJI_TRANSFER_OTHER_MAYBANK, {
                    ...route?.params,
                    tabunghajiTransferState: {
                        bankName,
                        ...generateNewTabungHajiTransferParam(),
                    },
                });
            } else {
                navigation.navigate(FUNDTRANSFER_MODULE, {
                    screen: TABUNG_HAJI_ENTER_AMOUNT,
                    params: {
                        ...route?.params,
                        tabunghajiTransferState: {
                            bankName,
                            ...generateNewTabungHajiTransferParam(),
                        },
                    },
                });
            }
        }
    }

    function onPressFromAccount() {
        setShowFromAccountScrollPicker(true);
        setFromAccountScrollPickerItems(
            accountListFrom.map((item, index) => ({
                id: item.id,
                name:
                    item.id === OWN_MBB
                        ? `${item.description2}\n${item.description1}`
                        : `${item.description2} - ${item?.name.substring(0, 17)}...\n${
                              item.description1
                          }`,
                senderName: item.name,
                accNo: item.description1,
                accType: item.description2,
                icNo: item.icNo,
                primary: item.primary,
                type: item.type,
                code: item.code,
                balance: item.balance,
            }))
        );
    }

    function onPressToAccount() {
        let toAcctList = "";
        if (fromAccountSelectedItemValue?.id === OWN_MBB) {
            toAcctList = accountListTo
                .map((item, index) => {
                    return {
                        id: item.id,
                        name:
                            item.id === OTHER_TH || item.id === OTHER_MBB
                                ? item.description2
                                : item.id === OWN_MBB
                                ? `${item.description2}\n${item.description1}`
                                : `${item.description2} - ${item?.name.substring(0, 17)}...\n${
                                      item.description1
                                  }`,
                        receiverName: item.name,
                        accNo: item.description1,
                        accType: item.description2,
                        icNo: item.icNo,
                        primary: item.primary,
                        type: item.type,
                        code: item.code,
                        balance: item.balance,
                    };
                })
                .filter((itemfilter) => {
                    return itemfilter?.id !== OWN_MBB && itemfilter?.id !== OTHER_MBB;
                });
        } else {
            toAcctList = accountListTo
                .map((item, index) => {
                    return {
                        id: item.id,
                        name:
                            item.id === OTHER_TH || item.id === OTHER_MBB
                                ? item.description2
                                : item.id === OWN_MBB
                                ? `${item.description2}\n${item.description1}`
                                : `${item.description2} - ${item?.name.substring(0, 17)}...\n${
                                      item.description1
                                  }`,
                        receiverName: item.name,
                        accNo: item.description1,
                        accType: item.description2,
                        icNo: item.icNo,
                        primary: item.primary,
                        type: item.type,
                        code: item.code,
                        balance: item.balance,
                    };
                })
                .filter((itemfilter) => {
                    return itemfilter?.accNo !== fromAccountSelectedItemValue?.accNo;
                });
        }

        setShowToAccountScrollPicker(true);
        setToAccountScrollPickerItems(toAcctList);
    }

    return (
        <>
            <ScreenContainer backgroundType="color">
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerCenterElement={
                                <Typography
                                    text={TRANSFER_TO_HEADER}
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={19}
                                />
                            }
                            headerLeftElement={
                                <HeaderBackButton onPress={handleHeaderBackButtonPressed} />
                            }
                        />
                    }
                    paddingBottom={0}
                    paddingTop={16}
                    paddingHorizontal={0}
                    useSafeArea
                >
                    <ScrollView
                        style={Styles.container}
                        contentContainerStyle={Styles.contentContainerStyle}
                        showsVerticalScrollIndicator={false}
                    >
                        <Typo
                            style={Styles.popUpTitle}
                            textAlign="left"
                            text={FROM}
                            fontSize={14}
                            fontWeight="400"
                            lineHeight={18}
                        />
                        <SpaceFiller height={8} />
                        <Dropdown
                            title={
                                fromAccountSelectedItemValue?.accType == null
                                    ? fromAccountSelectedItemValue
                                    : fromAccountSelectedItemValue?.accType
                            }
                            descriptionText={fromAccountSelectedItemValue?.accNo}
                            align="left"
                            borderWidth={0.5}
                            lineHeight={18}
                            onPress={onPressFromAccount}
                        />
                        <SpaceFiller height={24} />
                        <Typo
                            style={Styles.popUpTitle}
                            textAlign="left"
                            text={TO}
                            fontSize={14}
                            fontWeight="400"
                            lineHeight={18}
                        />
                        <SpaceFiller height={8} />
                        <Dropdown
                            title={
                                toAccountSelectedItemValue?.accType == null
                                    ? toAccountSelectedItemValue
                                    : toAccountSelectedItemValue?.accType
                            }
                            descriptionText={toAccountSelectedItemValue?.accNo}
                            align="left"
                            borderWidth={0.5}
                            onPress={onPressToAccount}
                        />
                    </ScrollView>

                    <FixedActionContainer>
                        <ActionButton
                            fullWidth
                            disabled={!isFormValid}
                            componentCenter={
                                <Typography
                                    text={CONTINUE}
                                    fontSize={14}
                                    lineHeight={18}
                                    fontWeight="600"
                                    color={isFormValid ? BLACK : DISABLED_TEXT}
                                />
                            }
                            backgroundColor={isFormValid ? YELLOW : LIGHTER_YELLOW}
                            onPress={handleNewTabungHajiTransferDetailConfirmation}
                        />
                    </FixedActionContainer>
                </ScreenLayout>
            </ScreenContainer>

            <ScrollPickerView
                showMenu={showFromAccountScrollPicker}
                list={fromAccountScrollPickerItems}
                selectedIndex={selectedFromAccountIndex ?? 0}
                onRightButtonPress={handleFromAccountSelection}
                onLeftButtonPress={handleScrollPickerCancelButtonPressed}
                rightButtonText={DONE}
                leftButtonText={CANCEL}
                expandedMode
            />
            <ScrollPickerView
                showMenu={showToAccountScrollPicker}
                list={toAccountScrollPickerItems}
                selectedIndex={selectedToAccountIndex ?? 0}
                onRightButtonPress={handleToAccountSelection}
                onLeftButtonPress={handleScrollPickerCancelButtonPressed}
                rightButtonText={DONE}
                leftButtonText={CANCEL}
                expandedMode
            />
        </>
    );
}

TabungHajiNewTransferOwnTabungHaji.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
};

const Styles = StyleSheet.create({
    container: {
        paddingHorizontal: 36,
    },
    contentContainerStyle: {
        paddingBottom: 50,
        paddingHorizontal: 4,
    },
});

export default TabungHajiNewTransferOwnTabungHaji;
