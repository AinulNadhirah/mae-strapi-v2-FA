import moment from "moment";
import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView } from "react-native";

import AutoDebitCard from "@screens/Wallet/requestToPay/AutoDebitCard";

import * as navigationConstant from "@navigation/navigationConstant";
import { SWITCH_ACCOUNT_SCREEN, AUTOBILLING_STACK } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import { StatusTextView } from "@components/Common/StatusTextView";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";
import { showErrorToast, showInfoToast } from "@components/Toast";
import TransferImageAndDetails from "@components/Transfers/TransferImageAndDetails";

import { withModelContext, useModelController } from "@context";

import { bankingGetDataMayaM2u, rtpStatus } from "@services";
import { RTPanalytics } from "@services/analytics/rtpAnalyticsSSL";

import { MEDIUM_GREY, YELLOW, GREY, WHITE, ROYAL_BLUE, DARK_GREY } from "@constants/colors";
import { frequencyList } from "@constants/data/DuitNowRPP";
import { SECURE2U_IS_DOWN } from "@constants/strings";

import { checks2UFlow, formateAccountNumber } from "@utils/dataModel/utility";
import { convertToTitleCase } from "@utils/dataModel/utilityRemittance";

import Styles from "@styles/Wallet/TransferEnterAmountStyle";

import Assets from "@assets";

const DuitNowAutoDebitDetails = ({ navigation, route }) => {
    const [selectedAccNum, setSelectedAccNum] = useState(null);
    const [transferParams, setTransferParams] = useState({});
    const [transferFlow, setTransferFlow] = useState({});
    const [stateData, setStateData] = useState({});
    const [selectedAccNumber, setSelectedAccNumber] = useState(null);
    const [selectedAccName, setSelectedAccName] = useState(null);
    const { updateModel, getModel } = useModelController();

    useEffect(() => {
        _updateDataInScreenAlways();
    }, []);
    useEffect(() => {
        if (selectedAccNum) {
            getAllAccounts();
        }
    }, [selectedAccNum]);
    const _updateDataInScreenAlways = async () => {
        // get Payment method flow TAC / S2U Data from Validate Api
        const transferParams = route.params?.transferParams || {};
        const secure2uValidateData = route.params?.secure2uValidateData ?? {
            action_flow: "NA",
        };
        const stateDataTemp = !stateData ? route?.params : route?.params?.params;
        const s2uEnabled = secure2uValidateData.s2u_enabled;

        const { merchantInquiry } = getModel("rpp");
        let merchantInquiryRes = {};
        let merInqRes = {};
        if (merchantInquiry?.merchantId === null) {
            merchantInquiryRes = await rtpStatus();
            merInqRes = merchantInquiryRes?.data?.result;
            updateModel({
                rpp: {
                    merchantInquiry: merInqRes,
                },
            });
        }

        const accNo = merInqRes?.accNo || merchantInquiry?.accNo;
        // Show S2U Down or Register Failed role back to TAC Toast
        switch (stateDataTemp?.flow) {
            case "S2UReg":
                if (stateDataTemp?.auth === "fail") {
                    showErrorToast({
                        message: "Failed to register for Secure2u.Please use TAC.",
                    });
                }
                break;
            case "TAC":
                if (!s2uEnabled) {
                    setTimeout(() => {
                        showInfoToast({
                            message: SECURE2U_IS_DOWN,
                        });
                    }, 1);
                }
                break;
            default:
                break;
        }
        setTransferParams(transferParams);
        setTransferFlow(transferParams?.transferFlow ?? transferFlow);
        setStateData(stateDataTemp);
        setSelectedAccNum(accNo);
    };

    const showLoader = (visible) => {
        updateModel({
            ui: {
                showLoader: visible,
            },
        });
    };

    const getAllAccounts = async () => {
        const userAccount = route.params;
        try {
            showLoader(true);
            const path = "/summary?type=A";
            //get the user accounts
            const response = await bankingGetDataMayaM2u(path, false);
            if (response?.data?.code === 0) {
                const { accountListings } = response?.data?.result || {};
                if (accountListings?.length > 0) {
                    //get debtor acc number and name
                    const approvalAcc = accountListings.filter((acc) => {
                        const accNum = acc?.number?.substring(0, 12) || {};
                        return userAccount?.transferParams?.item?.canTrmByDbtr
                            ? accNum.includes(selectedAccNum)
                            : "";
                    });
                    const selectedAccNumber = approvalAcc[0]?.number;
                    const selectedAccName = approvalAcc[0]?.name;
                    setSelectedAccNumber(selectedAccNumber);
                    setSelectedAccName(selectedAccName);
                }
                showLoader(false);
            }
        } catch (error) {
            // error when retrieving the data
            showLoader(false);
        }
    };
    const handleBack = () => {
        navigation.goBack();
    };

    const switchAccountAD = () => {
        navigation.navigate(AUTOBILLING_STACK, {
            screen: SWITCH_ACCOUNT_SCREEN,
            params: {
                getModel,
                transferParams: route.params,
                item: params?.transferParams?.item,
                from: "settingAD",
            },
        });
    };

    const onCardMasking = (cardNumber) => {
        return cardNumber
            .replace(/.(?=.{4})/g, "*")
            .match(/.{1,4}/g)
            .join(" ");
    };

    const _cancelAutoDebit = async () => {
        const { flow, secure2uValidateData } = await checks2UFlow(73, getModel);
        const selectedAccountName = selectedAccName;
        const selectedAccountNumber = formateAccountNumber(selectedAccNumber, 12);
        RTPanalytics.selectDNSettingsSwitchAcc();
        if (flow === "S2UReg") {
            navigation.navigate(navigationConstant.ONE_TAP_AUTH_MODULE, {
                screen: "Activate",
                params: {
                    flowParams: {
                        success: {
                            stack: navigationConstant.AUTOBILLING_STACK,
                            screen: navigationConstant.AUTOBILLING_CANCEL_AUTODEBIT,
                        },
                        fail: {
                            stack: navigationConstant.SETTINGS_MODULE,
                            screen: "DuitNowAutodebitList",
                        },
                        params: {
                            transferParams: {
                                ...route?.params?.transferParams?.item,
                                ...transferParams,
                                selectedAccountName,
                                selectedAccountNumber,
                                isCancel: true,
                            },
                            cancelFlow: flow,
                            secure2uValidateData,
                            isFromS2uReg: true,
                        },
                    },
                },
            });
        } else {
            navigation.navigate(navigationConstant.AUTOBILLING_STACK, {
                screen: navigationConstant.AUTOBILLING_CANCEL_AUTODEBIT,
                params: {
                    transferParams: {
                        ...route?.params,
                        ...route?.params?.transferParams?.item,
                        ...transferParams,
                        selectedAccountName,
                        selectedAccountNumber,
                        isCancel: true,
                    },
                    cancelFlow: flow,
                    from: "settingAD",
                    secure2uValidateData,
                },
            });
        }
    };

    const params = route?.params;
    const freqObj = frequencyList.find((el) => el.code === params?.transferParams?.item?.freqMode);
    const productInfo = {
        productName: params?.transferParams?.item?.creditorName,
        productId: params?.transferParams?.item?.merchantId,
    };
    const auDebitParams = {
        transferParams: {
            consentStartDate: params?.transferParams?.item?.effctvDt,
            consentExpiryDate: params?.transferParams?.item?.xpryDt,
            consentMaxLimit: params?.transferParams?.item?.maxAmount,
            consentMaxLimitFormatted: params?.transferParams?.item?.maxAmount,
            consentFrequencyText: freqObj?.name,
            productInfo,
            consentId: params?.transferParams?.item?.consentId,
            hideProduct: true,
        },
        autoDebitEnabled: true,
        showProductInfo: false,
        transferFlow: 26,
        showTooltip: false,
        handleInfoPress: () => {},
        onToggle: () => {},
    };
    const today = moment();
    const startDate = moment(params?.transferParams?.item?.effctvDt);
    const switchAccDisable = startDate < today;
    const bankName = convertToTitleCase(params?.transferParams?.item?.bankName);
    const canCancel =
        params?.transferParams?.item?.canTrmByDbtr !== "false" &&
        bankName === "Maybank" &&
        params?.transferParams?.item?.consentSts === "ACTV";
    return (
        <ScreenContainer
            backgroundType="color"
            backgroundColor={MEDIUM_GREY}
            analyticScreenName="Settings_DuitNow_AutoDebit_ViewAD"
        >
            <ScreenLayout
                paddingBottom={0}
                paddingTop={0}
                paddingHorizontal={0}
                header={
                    <HeaderLayout
                        backgroundColor={YELLOW}
                        headerCenterElement={
                            <Typo
                                text="DuitNow AutoDebit"
                                fontWeight="600"
                                fontSize={16}
                                lineHeight={19}
                            />
                        }
                        headerLeftElement={<HeaderBackButton onPress={handleBack} />}
                    />
                }
                useSafeArea
            >
                <View style={styles.container}>
                    <React.Fragment>
                        <View style={styles.headerView}>
                            <TransferImageAndDetails
                                title={params?.transferParams?.item?.creditorName}
                                image={{
                                    type: "local",
                                    source: Assets.icDuitNowCircle,
                                }}
                                isVertical={false}
                            />
                        </View>
                        <View style={styles.scrollStyle}>
                            <ScrollView scrollEnabled scrollEventThrottle={400}>
                                <View style={styles.statusColumn}>
                                    <View style={styles.statusView}>
                                        <Typo
                                            text="Status"
                                            fontWeight="normal"
                                            fontSize={14}
                                            lineHeight={18}
                                            textAlign="left"
                                            style={styles.valueText}
                                        />
                                        <StatusTextView
                                            status={
                                                params?.transferParams?.item?.consentSts === "ACTV"
                                                    ? "Active"
                                                    : params?.transferParams?.item?.consentSts ===
                                                          "SUSB" ||
                                                      params?.transferParams?.item?.consentSts ===
                                                          "SUSP"
                                                    ? "Paused"
                                                    : null
                                            }
                                        />
                                    </View>
                                </View>
                                <View style={styles.containerView}>
                                    <View style={styles.contentView}>
                                        <Typo
                                            text="Recipient reference"
                                            fontWeight="normal"
                                            fontSize={14}
                                            lineHeight={18}
                                            textAlign="left"
                                            style={styles.valueText}
                                        />
                                    </View>
                                    <View style={styles.refDescription}>
                                        <Typo
                                            text={params?.transferParams?.item?.refs1}
                                            fontWeight="600"
                                            fontSize={14}
                                            lineHeight={18}
                                            textAlign="justify"
                                        />
                                    </View>
                                </View>
                                <View style={styles.containerView}>
                                    <View style={styles.contentView}>
                                        <Typo
                                            text="Pay AutoDebit from"
                                            fontWeight="normal"
                                            fontSize={14}
                                            lineHeight={18}
                                            textAlign="left"
                                        />
                                        <View style={styles.displayView}>
                                            <Typo
                                                text={onCardMasking(
                                                    `${params?.transferParams?.item?.debtorAcctNum}`
                                                )}
                                                fontWeight="600"
                                                fontSize={14}
                                                lineHeight={18}
                                                textAlign="left"
                                                style={styles.valueText}
                                            />
                                            {switchAccDisable && (
                                                <Typo
                                                    text="Switch account"
                                                    fontWeight="600"
                                                    fontSize={14}
                                                    lineHeight={18}
                                                    textAlign="left"
                                                    color={ROYAL_BLUE}
                                                    onPress={switchAccountAD}
                                                />
                                            )}
                                        </View>
                                        <Typo
                                            text={bankName}
                                            fontWeight="normal"
                                            fontSize={14}
                                            lineHeight={18}
                                            textAlign="left"
                                            color={DARK_GREY}
                                            style={styles.statusText}
                                        />
                                    </View>
                                </View>
                                <View style={styles.autoDebitDetailCard}>
                                    <View style={Styles.mVertical20}>
                                        <View style={Styles.viewRow3}>
                                            <View style={Styles.viewRowLeftItem}>
                                                <Typo
                                                    fontSize={14}
                                                    fontWeight="600"
                                                    fontStyle="normal"
                                                    lineHeight={19}
                                                    textAlign="left"
                                                    text="DuitNow AutoDebit Details"
                                                />
                                            </View>
                                        </View>
                                        <AutoDebitCard {...auDebitParams} />
                                    </View>
                                </View>
                                {canCancel && (
                                    <View style={[styles.cancelButtonView, styles.btnStyle]}>
                                        <ActionButton
                                            onPress={_cancelAutoDebit}
                                            borderRadius={25}
                                            backgroundColor={YELLOW}
                                            componentCenter={
                                                <Typo
                                                    text="Cancel AutoDebit"
                                                    fontSize={14}
                                                    fontWeight="600"
                                                    lineHeight={18}
                                                />
                                            }
                                        />
                                    </View>
                                )}
                            </ScrollView>
                        </View>
                    </React.Fragment>
                </View>
            </ScreenLayout>
        </ScreenContainer>
    );
};

DuitNowAutoDebitDetails.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
};

const styles = StyleSheet.create({
    btnStyle: { height: 30 },
    headerView: {
        alignItems: "center",
        height: 90,
        marginTop: 20,
        marginLeft: 24,
    },
    containerView: {
        backgroundColor: WHITE,
        borderBottomColor: GREY,
        borderBottomWidth: 1,
        height: 90,
    },
    statusColumn: {
        backgroundColor: WHITE,
        borderBottomColor: GREY,
        borderBottomWidth: 1,
        height: 60,
    },
    statusView: {
        alignItems: "center",
        flex: 1,
        flexDirection: "row",
        marginLeft: 24,
        marginRight: 24,
        justifyContent: "space-between",
    },
    contentView: {
        flex: 1,
        marginTop: 10,
        marginLeft: 24,
        marginRight: 24,
    },
    refDescription: {
        flex: 1,
        marginTop: -30,
        marginLeft: 24,
        marginRight: 24,
    },
    displayView: {
        alignItems: "center",
        flexDirection: "row",
        height: 20,
        marginTop: 5,
        justifyContent: "space-between",
    },
    valueText: {
        width: "60%",
    },
    container: {
        flex: 1,
    },
    autoDebitDetailCard: {
        marginLeft: 25,
        marginRight: 25,
        marginTop: 5,
    },
    cancelButtonView: {
        marginTop: 30,
        paddingHorizontal: 24,
        width: "100%",
        marginBottom: 40,
    },
    scrollStyle: {
        flex: 1,
    },
});

export default withModelContext(DuitNowAutoDebitDetails);
