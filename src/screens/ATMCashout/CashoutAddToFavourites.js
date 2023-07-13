import { debounce } from "lodash";
import moment from "moment";
import numeral from "numeral";
import PropTypes from "prop-types";
import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";

import {
    ATM_AMOUNT_SCREEN,
    ATM_CASHOUT_STACK,
    ATM_PREFERRED_AMOUNT,
    CASHOUT_FAVOURITE,
    COMMON_MODULE,
    PDF_VIEW,
} from "@navigation/navigationConstant";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import Typography from "@components/Text";
import { showErrorToast, showInfoToast } from "@components/Toast";
import AccountList from "@components/Transfers/TransferConfirmationAccountList";
import TransferImageAndDetails from "@components/Transfers/TransferImageAndDetails";

import { withModelContext } from "@context";

import { bankingGetDataMayaM2u, checkAtmOnboarding, combinedATMActions } from "@services";

import { BLACK, MEDIUM_GREY, ROYAL_BLUE, YELLOW } from "@constants/colors";
import { ADD_TO_FAVOURITES, COMMON_ERROR_MSG, NOTES1, TERMS_CONDITIONS } from "@constants/strings";

import Styles from "@styles/Wallet/TransferEnterAmountStyle";

import assets from "@assets";

function CashoutAddToFavourites({ navigation, route, updateModel }) {
    console.info("CashoutAddToFavourites : ", route?.params);
    const [accList, setAccList] = useState([]);
    const [selectedAccount, setAccount] = useState(null);
    const [loading, setLoading] = useState(false);
    const [preferredListOfAmount, setPreferredList] = useState(
        route?.params?.currentList ?? route?.params?.preferredAmountList ?? []
    );

    const { transferAmount, apiParams, action, amountObj, accNo } = route?.params;

    function handlePress() {
        const debounceFn = debounce(handleConfirm, 250);

        debounceFn();
    }

    function _onBackPress() {
        if (route?.params?.didPerformWithdrawal || action === "update" || action === "new") {
            navigation.navigate(ATM_CASHOUT_STACK, {
                screen: ATM_AMOUNT_SCREEN,
                params: {
                    ...route?.params,
                    qrText: null,
                    timestamp: null,
                    routeFrom: CASHOUT_FAVOURITE,
                    amountObj: {
                        amount: transferAmount ?? apiParams?.transferAmount,
                    },
                },
            });
        } else {
            navigation.navigate(ATM_CASHOUT_STACK, {
                screen: ATM_PREFERRED_AMOUNT,
                params: {
                    selectedAccount: undefined,
                    routeFrom: undefined,
                    transferAmount: undefined,
                    qrText: null,
                    refNo: undefined,
                    mins: undefined,
                    timestamp: null,
                    amountObj: null,
                    didPerformWithdrawal: false,
                },
            });
        }
    }

    useEffect(() => {
        console.log("CashoutAddToFavourites >> ", route?.params);
        if (!accList?.length) {
            setLoading(true);
            getAccountsList();
        }
    }, [accList, getAccountsList, preferredListOfAmount.length, refreshAmountList, route?.params]);

    const getAccountsList = useCallback(async () => {
        try {
            console.log("getAccountsList");
            const subUrl = "/summary";
            const params = "?type=A";
            const response = await bankingGetDataMayaM2u(subUrl + params, false);

            const result = response?.data?.result;
            console.log("getAccountsList:result", result);
            const accountList = result?.accountListings ?? [];
            console.log("getAccountsList:accountList 2", accountList);

            if (accountList) {
                if (amountObj?.accountNo || route?.params?.selectedAccount?.acctNo) {
                    const accountNumber =
                        amountObj?.accountNo ?? route?.params?.selectedAccount?.acctNo;
                    console.log("getAccountsList:accountNumber ", accountNumber);
                    const list = accountList.map((casaAcc) => {
                        return {
                            ...casaAcc,
                            selected:
                                accountNumber === casaAcc?.number || accNo === casaAcc?.number,
                        };
                    });
                    setAccList(reOrderAccList([...list]));
                    const select = list.filter((acc) => {
                        return acc?.selected;
                    });
                    console.log("getAccountsList:select", select);
                    setAccount(select[0]);
                } else {
                    doPreSelectAccount([...accList, ...accountList]);
                }
            }
        } catch (error) {
            console.log("getAccountsList:error", error);
        } finally {
            setLoading(false);
        }
    }, [
        accList,
        accNo,
        amountObj?.accountNo,
        doPreSelectAccount,
        route?.params?.selectedAccount?.acctNo,
    ]);

    function reOrderAccList(casaList) {
        const selectedAcc = casaList.filter((acc) => {
            return acc.selected === true;
        });
        const remainingAcc = casaList.filter((acc) => {
            return !acc.selected;
        });
        return [...selectedAcc, ...remainingAcc];
    }

    const doPreSelectAccount = useCallback(async (data) => {
        console.log("doPreSelectAccount", data);
        const propsToCompare = "acctNo";
        let selectedAcc;
        let selectedIndex = null;

        if (selectedAccount) {
            selectedAcc = data.find((item, i) => {
                const isFind = item.number == selectedAccount[propsToCompare];
                if (isFind) {
                    selectedIndex = i;
                }
                return isFind;
            });
        } else {
            selectedAcc = data.find((item, i) => {
                if (item.primary) {
                    selectedIndex = i;
                }
                return item.primary;
            });
        }

        if (!selectedAccount && accList.length > 0) {
            selectedAcc = data[0];
            selectedIndex = 0;
        }

        if (selectedAcc) {
            const temp = data[selectedIndex];
            data.splice(selectedIndex, 1);
            data.unshift(temp);
            selectedAcc.selected = true;
        }
        const newAccountList = data?.filter(
            (value, index, self) => index === self.findIndex((t) => t.number === value.number)
        );
        setAccList(newAccountList);
        setAccount(selectedAcc);
    }, []);

    function onAccountListClick(item) {
        const itemType =
            item.type === "C" || item.type === "J" || item.type === "R" ? "card" : "account";
        if (parseFloat(item.acctBalance) <= 0.0 && itemType == "account") {
            // TODO: show zero error
        } else {
            const tempArray = accList.map((accountItem) => {
                return { ...accountItem, selected: accountItem?.number === item?.number };
            });
            const selectedAcc = accList.filter((accountItem) => {
                return accountItem?.number === item?.number;
            });
            setAccList(tempArray);
            setAccount(selectedAcc[0]);
        }
    }

    const refreshAmountList = useCallback(async () => {
        const newArr = [];
        try {
            const response = await checkAtmOnboarding();
            console.log("refreshAmountList", response?.data?.result);
            if (response?.data?.code === 200 && response?.data?.result?.preferred_amount) {
                const preferredList = response?.data?.result?.preferred_amount
                    ? JSON.parse(response?.data?.result?.preferred_amount)
                    : null;
                setPreferredList(preferredList);

                const listOfAmount = preferredList.sort((a, b) => {
                    return b.id - a.id;
                });
                console.log("listOfAmount ", listOfAmount);
                navigation.navigate(ATM_CASHOUT_STACK, {
                    screen: ATM_PREFERRED_AMOUNT,
                    params: {
                        is24HrCompleted: true,
                        selectedAccount: null,
                        didPerformAddOrUpdate: true,
                        accNo: "",
                        preferredAmountList: listOfAmount,
                        currentList: undefined,
                        routeFrom: undefined,
                        transferAmount: undefined,
                        qrText: undefined,
                        refNo: undefined,
                        mins: undefined,
                        timestamp: undefined,
                        amountObj: undefined,
                        didPerformWithdrawal: undefined,
                        transactionDetails: undefined,
                    },
                });

                if (newArr?.length > 0) {
                    updateModel({
                        atm: {
                            preferredAmount: newArr,
                        },
                    });
                }
            }
        } catch (ex) {
            console.log("CashoutAddToFavourites >> refreshAmountList ex", ex);
        } finally {
            setLoading(false);
        }
    }, [navigation, route?.params, updateModel]);

    const handleConfirm = useCallback(async () => {
        setLoading(true);
        try {
            const paramsApi = apiParams
                ? apiParams
                : {
                      requestType: "QRCLW_002",
                  };
            const preferredAmountList =
                route?.params?.currentList ?? route?.params?.preferredAmountList ?? [];

            let params = { ...paramsApi };
            if (preferredAmountList?.length > 0) {
                for (const index in preferredAmountList) {
                    if (
                        action !== "new" &&
                        amountObj?.id &&
                        preferredAmountList[index]?.id === amountObj?.id
                    ) {
                        params["preferredAmount" + amountObj?.id] =
                            numeral(transferAmount).format("0,0.00");
                    } else {
                        params["preferredAmount" + preferredAmountList[index]?.id] =
                            preferredAmountList[index]?.amount;
                    }
                }
            }

            if (action === "new") {
                if (preferredAmountList.length <= 2 && preferredAmountList.length > 0) {
                    const count = parseInt(preferredAmountList.length + 1);
                    params["preferredAmount" + count] = numeral(transferAmount).format("0,0.00");
                } else {
                    params["preferredAmount1"] = numeral(transferAmount).format("0,0.00");
                }
            }

            const newList = preferredAmountList ?? [];
            if (action === "new") {
                if (preferredAmountList.length <= 2 && preferredAmountList.length > 0) {
                    const count = parseInt(preferredAmountList.length + 1);
                    params["preferredAmount" + count] = numeral(transferAmount).format("0,0.00");

                    newList.push({
                        id: preferredAmountList.length + 1,
                        accountName: selectedAccount?.name,
                        accountNo:
                            selectedAccount?.number ??
                            selectedAccount?.acctNo ??
                            route?.params?.accNo,
                        amount: numeral(transferAmount).format("0,0.00"),
                    });
                } else {
                    params["preferredAmount1"] = numeral(transferAmount).format("0,0.00");
                    newList.push({
                        id: 1,
                        accountName: selectedAccount?.name,
                        accountNo:
                            selectedAccount?.number ??
                            selectedAccount?.acctNo ??
                            route?.params?.accNo,
                        amount: numeral(transferAmount).format("0,0.00"),
                    });
                }
            }
            const updatedList =
                action === "new"
                    ? newList
                    : preferredAmountList.map((prefAmt) => {
                          if (prefAmt?.id === amountObj?.id) {
                              return {
                                  ...prefAmt,
                                  accountName: selectedAccount?.name,
                                  accountNo:
                                      selectedAccount?.number ??
                                      selectedAccount?.acctNo ??
                                      route?.params?.accNo,
                                  amount: numeral(transferAmount).format("0,0.00"),
                              };
                          } else {
                              return prefAmt;
                          }
                      });

            console.info("newList amountList ", newList);

            const response = await combinedATMActions({
                ...params,
                accountNo:
                    selectedAccount?.number ?? selectedAccount?.acctNo ?? route?.params?.accNo,
                amount: numeral(transferAmount).format("0,0.00"),
                action: action === "update" ? "UPDATE" : "ADD",
                preferredAmount: JSON.stringify(updatedList),
            });
            if (response?.data?.code === 200) {
                console.info("response?.data? : ", response?.data);
                refreshAmountList();
                showInfoToast({
                    message: `Preferred withdrawal amount ${
                        action === "new" ? "added" : "updated"
                    } successfully.`,
                });
            } else {
                setLoading(false);
                showErrorToast({ message: COMMON_ERROR_MSG });
            }
        } catch (ex) {
            console.log("CashoutAddToFavourites >> handleConfirm ex", ex);
            showErrorToast({ message: ex?.message });
        }
    }, [
        action,
        amountObj?.id,
        apiParams,
        refreshAmountList,
        route?.params?.accNo,
        route?.params?.currentList,
        route?.params?.preferredAmountList,
        selectedAccount?.acctNo,
        selectedAccount?.name,
        selectedAccount?.number,
        transferAmount,
    ]);

    function onEditAmount() {
        console.info("onEditAmount");
        navigation.navigate(ATM_CASHOUT_STACK, {
            screen: ATM_AMOUNT_SCREEN,
            params: {
                ...route?.params,
                timestamp: null,
                routeFrom: CASHOUT_FAVOURITE,
                amountObj: {
                    ...route?.params?.amountObj,
                    amount: transferAmount ?? apiParams?.transferAmount,
                },
                currentList:
                    route?.params?.currentList?.length > 0
                        ? route?.params?.currentList
                        : route?.params?.preferredAmountList || [],
            },
        });
    }

    function onTermsConditionClick() {
        console.log("onTermsConditionClick");
        const params = {
            file: "https://www.maybank2u.com.my/iwov-resources/pdf/personal/digital_banking/atm-cashout-tnc.pdf",
            share: false,
            type: "url",
            title: "Terms & Conditions",
            pdfType: "shareReceipt",
        };

        navigation.navigate(COMMON_MODULE, {
            screen: PDF_VIEW,
            params: { params },
        });
    }

    return (
        <ScreenContainer
            backgroundType="color"
            backgroundColor={MEDIUM_GREY}
            showLoaderModal={loading}
        >
            <ScreenLayout
                header={
                    <HeaderLayout
                        headerCenterElement={
                            <Typography
                                fontSize={16}
                                fontWeight="600"
                                lineHeight={19}
                                text={ADD_TO_FAVOURITES}
                            />
                        }
                        headerLeftElement={!loading && <HeaderBackButton onPress={_onBackPress} />}
                    />
                }
                paddingHorizontal={0}
                paddingBottom={0}
                useSafeArea
            >
                <ScrollView
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.mainContainer}>
                        <TransferImageAndDetails
                            image={{
                                type: "local",
                                source:
                                    selectedAccount?.name === "MAE"
                                        ? assets.icMAE60
                                        : assets.MAYBANK,
                            }}
                            isVertical={false}
                        />
                        <Typography
                            fontSize={21}
                            fontWeight="bold"
                            lineHeight={30}
                            text="ATM Cash-Out"
                            style={styles.header}
                            textAlign="left"
                        />
                        <View style={styles.rowContainer}>
                            <View style={Styles.viewRow}>
                                <View style={Styles.viewRowLeftItem}>
                                    <Typography
                                        fontSize={14}
                                        fontWeight="400"
                                        fontStyle="normal"
                                        letterSpacing={0}
                                        lineHeight={19}
                                        textAlign="left"
                                        color="#000000"
                                        text="Setup date"
                                    />
                                </View>
                                <View style={Styles.viewRowRightItem}>
                                    <Typography
                                        fontSize={14}
                                        fontWeight="600"
                                        fontStyle="normal"
                                        letterSpacing={0}
                                        lineHeight={18}
                                        textAlign="right"
                                        color={BLACK}
                                        text={moment().format("DD MMM yyyy")}
                                    />
                                </View>
                            </View>
                            <View style={Styles.viewRow}>
                                <View style={Styles.viewRowLeftItem}>
                                    <Typography
                                        fontSize={14}
                                        fontWeight="400"
                                        fontStyle="normal"
                                        letterSpacing={0}
                                        lineHeight={19}
                                        textAlign="left"
                                        color="#000000"
                                        text="Saved amount"
                                    />
                                </View>
                                <TouchableOpacity
                                    style={Styles.viewRowRightItem}
                                    onPress={onEditAmount}
                                >
                                    <Typography
                                        fontSize={14}
                                        fontWeight="600"
                                        fontStyle="normal"
                                        letterSpacing={0}
                                        lineHeight={18}
                                        textAlign="right"
                                        color={ROYAL_BLUE}
                                        text={`RM ${numeral(
                                            transferAmount ?? apiParams?.transferAmount
                                        ).format("0,0.00")}`}
                                    />
                                </TouchableOpacity>
                            </View>

                            <View style={Styles.lineConfirm} />
                            <View style={styles.notesContainer}>
                                <View style={Styles.viewRowDescriberOne}>
                                    <Typography
                                        fontSize={12}
                                        fontWeight="600"
                                        fontStyle="normal"
                                        letterSpacing={0}
                                        lineHeight={18}
                                        textAlign="left"
                                        color="#787878"
                                        text={NOTES1}
                                    />
                                </View>

                                <View style={Styles.viewRowDescriberTwo}>
                                    <View style={styles.notesText}>
                                        <Typography
                                            fontSize={12}
                                            fontWeight="normal"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={22}
                                            textAlign="left"
                                            color="#787878"
                                            text={`1. `}
                                        />
                                    </View>
                                    <View style={styles.notesText2}>
                                        <Typography
                                            fontSize={12}
                                            fontWeight="normal"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={22}
                                            textAlign="left"
                                            color="#787878"
                                            text={`Saving this amount will not trigger change in account balance. `}
                                        />
                                    </View>
                                </View>

                                <View style={Styles.viewRowDescriberTwo}>
                                    <View style={styles.notesText}>
                                        <Typography
                                            fontSize={12}
                                            fontWeight="normal"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={22}
                                            textAlign="left"
                                            color="#787878"
                                            text={`2. `}
                                        />
                                    </View>
                                    <View style={styles.notesText2}>
                                        <Typography
                                            fontSize={12}
                                            fontWeight="normal"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={22}
                                            textAlign="left"
                                            color="#787878"
                                            text={`Preferred withdrawal account can be changed at point of withdrawal. `}
                                        />
                                    </View>
                                </View>
                                <View style={styles.tncContainer}>
                                    <Typography
                                        fontSize={12}
                                        fontWeight="600"
                                        fontStyle="underline"
                                        style={styles.tncText}
                                        letterSpacing={0}
                                        lineHeight={18}
                                        textAlign="left"
                                        color={BLACK}
                                        text={TERMS_CONDITIONS}
                                        onPressText={onTermsConditionClick}
                                    />
                                </View>
                            </View>
                        </View>
                    </View>

                    <View style={styles.accListHeader}>
                        <AccountList
                            title="Preferred withdrawal account"
                            data={accList}
                            onPress={onAccountListClick}
                            extraData={accList}
                            paddingLeft={24}
                        />
                    </View>
                </ScrollView>
                <View style={styles.buttonContainer}>
                    <FixedActionContainer>
                        <ActionButton
                            fullWidth
                            disabled={accList === []}
                            // isLoading={loading}
                            borderRadius={25}
                            onPress={handlePress}
                            backgroundColor={YELLOW}
                            componentCenter={
                                <Typography
                                    text="Confirm"
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={18}
                                />
                            }
                        />
                    </FixedActionContainer>
                </View>
            </ScreenLayout>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    accListHeader: { marginBottom: 90, marginTop: 20 },
    buttonContainer: {
        backgroundColor: MEDIUM_GREY,
        bottom: 0,
        position: "absolute",
        width: "100%",
    },
    disclaimerText: { flexDirection: "column", marginBottom: 15 },
    header: { marginVertical: 10 },
    imageLogo: { height: 64, width: 64 },
    mainContainer: {
        flex: 1,
        marginHorizontal: 20,
        width: "100%",
    },
    notesContainer: { marginTop: 30 },
    notesText: { flexDirection: "column", marginRight: 5 },
    notesText2: { flexDirection: "column", width: "95%" },
    rowContainer: { marginTop: 35, width: "90%" },
    tncContainer: { flexDirection: "column", marginLeft: 20, marginTop: 5 },
    tncText: {
        textDecorationLine: "underline",
    },
});

CashoutAddToFavourites.propTypes = {
    navigation: PropTypes.object,
    getModel: PropTypes.func,
    updateModel: PropTypes.func,
    route: PropTypes.object,
};

export default withModelContext(CashoutAddToFavourites);
