import moment from "moment";
import numeral from "numeral";
import PropTypes from "prop-types";
import React, { useState, useCallback } from "react";
import {
    TouchableOpacity,
    View,
    StyleSheet,
    ScrollView,
    FlatList,
    Text,
    Platform,
} from "react-native";
import DeviceInfo from "react-native-device-info";

import { navigateToS2UCooling, navigateToS2UReg } from "@screens/OneTapAuth/CoolingNavigator";

import { COMMON_MODULE, MAYBANK2U, PDF_VIEWER } from "@navigation/navigationConstant";
import * as navigationConstant from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Secure2uAuthenticationModal from "@components/Modals/Secure2uAuthenticationModal";
import TacModal from "@components/Modals/TacModal";
import Typography from "@components/Text";
import { showErrorToast } from "@components/Toast";
import TransferImageAndDetails from "@components/Transfers/TransferImageAndDetails";

import { withModelContext } from "@context";

import { ezyPayPayment } from "@services";

import { MEDIUM_GREY, YELLOW, BLACK, WHITE } from "@constants/colors";
import { M2U, S2U_PUSH, SMS_TAC } from "@constants/data";
import { FN_EZYPAY_PLUS } from "@constants/fundConstants";
import {
    TERMS_CONDITIONS,
    REFERENCE_ID,
    DATE_AND_TIME,
    CONFIRM,
    TRANSACTION_TYPE,
    APPLY_EZYPAY_PLUS,
    APPLY_FAIL,
} from "@constants/strings";
import { EZY_PAY_PAYMENT } from "@constants/url";

import {
    handleS2UAcknowledgementScreen,
    init,
    initChallenge,
    s2uSdkLogs,
    showS2UDownToast,
} from "@utils/dataModel/s2uSDKUtil";
import {
    getDeviceRSAInformation,
    maskCard,
    getShadow,
    getCardProviderFullLogo,
} from "@utils/dataModel/utility";

function EZYPayConfirmation({ navigation, route, getModel }) {
    const params = route?.params ?? {};
    const [selectedData, setSelectedData] = useState(params?.selectedData ?? []);
    const [accDetails] = useState(params?.accDetails ?? {});
    const [showTACModal, setShowTACModal] = useState(false);
    const [showS2UModal, setShowS2UModal] = useState(false);
    const [mapperData, setMapperData] = useState({});
    const [tacParams, setTacParams] = useState({});
    const [isS2UDown, setS2uStatus] = useState(false);

    const onBackTap = useCallback(() => {
        console.log("[EZYPayConfirmation] >> [onBackTap]");
        navigation.goBack();
    }, [navigation]);

    const onCloseTap = useCallback(() => {
        navigation.navigate(MAYBANK2U, {
            screen: "",
            params: {
                refresh: true,
            },
        });
    }, [navigation]);

    const onTeamsConditionClick = useCallback(() => {
        console.log("[EZYPayConfirmation] >> [onTeamsConditionClick]");
        const navParams = {
            file: "https://www.maybank2u.com.my/WebBank/EzyPPlus071011_TnC.pdf",
            share: false,
            showShare: false,
            type: "url",
            pdfType: "Terms & Conditions",
            title: "Terms & Conditions",
            route: "EZYPayConfirmation",
            module: "BankingV2Module",
        };

        navigation.navigate(COMMON_MODULE, {
            screen: PDF_VIEWER,
            params: navParams,
        });
    }, [navigation]);

    const navigateToTACFlow = useCallback(() => {
        // Show TAC Modal
        const prms = {
            fundTransferType: "EZYPAY_TAC_VERIFY",
            cardNo: accDetails?.cardNo ?? "",
        };
        setTacParams(prms);
        setShowTACModal(true);
    }, [accDetails?.cardNo]);

    const onTACClose = useCallback(() => {
        console.log("[onTACClose]");
        setShowTACModal(false);
    }, []);

    const getSelectedData = useCallback(() => {
        return selectedData?.map((item, index) => {
            const selectedServerVal = item?.selectedServerVal[index];
            return {
                effectiveDate: item?.effectiveDate,
                postingDate: item?.postingDate,
                description: item?.desc,
                indicator: item?.indicator,
                amount: item?.amt,
                curCode: item?.curCode,
                curAmt: item?.curAmt,
                sequenceNum: item?.sequenceNum,
                ezyPlan: selectedServerVal?.planTenure,
                rate: selectedServerVal?.rate,
                intMonth: item?.selectedVal?.intMonth,
                tenure: selectedServerVal?.planTenure,
                planType: item?.selectedVal?.type,
                transNum: item?.transNum,
                transactionCode: item?.transactionCode,
                transDate: item?.transDate,
            };
        });
    }, [selectedData]);

    const getShareReceiptData = (newValue, ref, date) => {
        const receiptArray = [
            {
                label: "Reference ID",
                value: ref,
                showRightText: true,
                rightTextType: "text",
                rightStatusType: "success",
                rightText: date,
            },
        ];
        newValue.forEach((item, index) => {
            const isSucc = item?.selectedServerVal[index]?.success;
            receiptArray.push({
                label: `<div class="labelCls">${item?.desc?.trim()}</div><div style="margin-top: 15px;" class="valueCls">RM ${
                    item?.selectedServerVal[index]?.monthlyInstallment
                } / month</div><div class="valueClsSmall" style="font-size: 30px;">Plan: ${
                    item.selectedVal.name
                }</div>`,
                value: `<div class="valueClsSmall">Transaction details</div><div style="margin-top: 15px;" class="valueCls">${item.displayAmt} (${item.displayDate})</div>`,
                showRightText: true,
                rightTextType: "status",
                rightStatusType: isSucc ? "success" : "unsuccessful",
                rightText: isSucc ? "successful" : "unsuccessful",
            });
        });
        return receiptArray;
    };

    const getPaymentParams = useCallback(
        (tac) => {
            const { deviceInformation, deviceId } = getModel("device");
            const mobileSDKData = getDeviceRSAInformation(deviceInformation, DeviceInfo, deviceId);
            const selectedDetails = getSelectedData();
            const serverData = params?.serverData ?? null;
            return {
                twoFAType: "TAC",
                tacValue: tac,
                service: "EZY",
                accountNo: params?.prevData?.number ?? "",
                referenceNo: serverData?.referenceNo,
                noOfRecord: selectedData.length,
                noOfOccurence: selectedData.length,
                details: selectedDetails,
                mobileSDKData,
            };
        },
        [getSelectedData, params?.prevData?.number, params?.serverData, selectedData.length]
    );

    const handleApiFailure = useCallback(
        (error) => {
            const { result } = error?.data || {};
            navigation.navigate("EZYPayStatus", {
                ...route.params,
                isSuccess: false,
                headerTxt: APPLY_FAIL,
                isSubMessage: false,
                errorMessage:
                    result?.statusDescription ?? error?.message ?? error?.error?.message ?? "",
                detailsData: [
                    {
                        title: REFERENCE_ID,
                        value:
                            result?.txnRefNo ??
                            result?.referenceNo ??
                            error?.error?.result?.transactionRefNumber ??
                            "N/A",
                    },
                    {
                        title: DATE_AND_TIME,
                        value:
                            result?.hostDt ??
                            result?.trxDateTime ??
                            result?.serverDate ??
                            error?.error?.result?.serverDate ??
                            "N/A",
                    },
                    {
                        title: TRANSACTION_TYPE,
                        value: APPLY_EZYPAY_PLUS,
                    },
                ],
            });
        },
        [navigation, route.params]
    );

    const onTACDone = useCallback(
        async (tac) => {
            setShowTACModal(false);
            const param = getPaymentParams(tac);
            const httpResp = await ezyPayPayment(param, EZY_PAY_PAYMENT).catch((error) => {
                handleApiFailure(error);
                console.log("[EZYPayConfirmation][EzyPayInquiry] >> Exception: ", error);
            });
            const result = httpResp?.data?.result ?? null;
            if (!result) {
                handleApiFailure(httpResp);
                return;
            }
            const { statusCode, details, referenceNo, trxDateTime } = result;

            const detailsArray = [];

            // Check for Reference ID
            if (referenceNo) {
                detailsArray.push({
                    title: REFERENCE_ID,
                    value: referenceNo,
                });
            }
            // Check for Server Date/Time
            if (trxDateTime) {
                detailsArray.push({
                    title: DATE_AND_TIME,
                    value: trxDateTime,
                });
            }

            detailsArray.push({
                title: TRANSACTION_TYPE,
                value: APPLY_EZYPAY_PLUS,
            });

            if (statusCode === "200") {
                const newValue = selectedData.map((value) => ({
                    ...value,
                    selectedServerVal: details
                        ?.filter((data) => {
                            return data.transactionDetails[0]?.transNum === value?.transNum;
                        })
                        ?.map((i) => {
                            return i.transactionDetails[0];
                        }),
                }));
                setSelectedData(newValue);
                const receiptData = getShareReceiptData(newValue, referenceNo, trxDateTime);
                const cardLength = selectedData.length;

                navigation.navigate("EZYPayStatus", {
                    ...route.params,
                    receiptData,
                    isSuccess: true,
                    headerTxt: `You have submitted ${cardLength} application${
                        cardLength > 1 ? "s" : ""
                    }`,
                    isSubMessage: true,
                    errorMessage:
                        "We will notify you on the application status via SMS and/or email.",
                    detailsData: detailsArray,
                });
            } else {
                handleApiFailure(httpResp);
            }
        },
        [getPaymentParams, handleApiFailure, navigation, route.params, selectedData]
    );

    function arrayToString(array) {
        let stringData = "";
        array.forEach((str, i) => {
            stringData += `${i > 0 ? "\n" : ""}${str}`;
        });
        return stringData;
    }

    //S2U V4
    const s2uSDKInit = async () => {
        const transactionPayload = getPaymentParams();
        delete transactionPayload?.tacValue;
        delete transactionPayload?.twoFAType;
        const totalAmt = transactionPayload?.details
            ?.map((val) => {
                return parseFloat(val?.amount?.replace(",", ""));
            })
            .reduce((a, b) => a + b, 0);

        const products = params?.selectedData.map((itemData) => {
            return itemData?.selectedServerVal[0]?.desc;
        });
        const plans = params?.selectedData.map((itemData) => {
            return itemData?.selectedServerVal[0]?.displayPlan;
        });
        const installmentDates = params?.selectedData.map((itemData) => {
            return `${itemData?.selectedServerVal[0]?.firstPmtDate} - ${itemData?.selectedServerVal[0]?.lastPmtDate}`;
        });
        const monthlyInstallments = params?.selectedData?.map((itemData) => {
            return `RM ${numeral(String(itemData?.selectedServerVal[0]?.monthlyInstallment)).format(
                "0,0.00"
            )}`;
        });
        const s2uParams = {
            dateTime: moment().format("DD MMM YYYY, hh:mm A"),
            purchase: arrayToString(products),
            cardNo: `${params?.prevData?.name}\n${maskCard(params?.prevData?.number)}`,
            plan: arrayToString(plans),
            installmentDate: arrayToString(installmentDates),
            monthlyAmount: arrayToString(monthlyInstallments),
            totalAmount: `RM ${numeral(String(totalAmt)).format("0,0.00")}`,
            ...transactionPayload,
        };
        return await init(FN_EZYPAY_PLUS, s2uParams);
    };

    //S2U V4
    const initiateS2USdk = useCallback(async () => {
        try {
            const s2uInitResponse = await s2uSDKInit();
            console.log("S2U SDK s2uInitResponse : ", s2uInitResponse);
            if (s2uInitResponse?.message || s2uInitResponse.statusCode !== 0) {
                console.log("s2uInitResponse error : ", s2uInitResponse.message);
                showErrorToast({
                    message: s2uInitResponse.message,
                });
            } else {
                if (s2uInitResponse?.actionFlow === SMS_TAC) {
                    const { isS2uV4ToastFlag } = getModel("misc");
                    setS2uStatus(isS2uV4ToastFlag ?? false);
                    navigateToTACFlow();
                } else if (s2uInitResponse?.actionFlow === S2U_PUSH) {
                    if (s2uInitResponse?.s2uRegistrationDetails?.app_id === M2U) {
                        navigateToS2URegistration(navigation.navigate);
                    }
                } else {
                    //S2U Pull Flow
                    initS2UPull(s2uInitResponse);
                }
            }
        } catch (err) {
            s2uSdkLogs(err, "EZYPay");
        }
    });

    //S2U V4
    const initS2UPull = useCallback(
        async (s2uInitResponse) => {
            const { navigate } = navigation;
            if (s2uInitResponse?.s2uRegistrationDetails?.isActive) {
                if (s2uInitResponse?.s2uRegistrationDetails?.isUnderCoolDown) {
                    //S2U under cool down period
                    navigateToS2UCooling(navigate);
                } else {
                    const challengeRes = await initChallenge();
                    console.log("initChallenge RN Response :: ", challengeRes);
                    if (challengeRes?.message) {
                        console.log("challenge init request failed");
                        showErrorToast({ message: challengeRes?.message });
                    } else {
                        setMapperData(challengeRes?.mapperData);
                        setShowS2UModal(true);
                    }
                }
            } else {
                //Redirect user to S2U registration flow
                navigateToS2URegistration(navigate);
            }
        },
        [navigation]
    );

    //S2U V4
    const onS2uClose = useCallback(() => {
        setShowS2UModal(false);
    }, []);

    //S2U V4
    const onS2uDone = useCallback((response) => {
        const { transactionStatus, executePayload } = response;
        // Close S2u popup
        onS2uClose();
        //handle  based on status code
        if (transactionStatus) {
            navigateToSuccScreen(response?.s2uSignRespone || executePayload?.result);
        } else {
            //S2U V4 handle RSA transaction Failed
            handleError(executePayload);
        }
    }, []);

    //S2U V4
    const navigateToS2URegistration = useCallback((navigate) => {
        const redirect = {
            succStack: navigationConstant.BANKINGV2_MODULE,
            succScreen: "EZYPayConfirmation",
        };
        navigateToS2UReg(navigate, route.params, redirect, getModel);
    }, []);

    //S2U V4
    const navigateToSuccScreen = useCallback((result) => {
        const { statusCode, details, referenceNo, trxDateTime } = result;

        const detailsArray = [];

        // Check for Reference ID
        if (referenceNo) {
            detailsArray.push({
                title: REFERENCE_ID,
                value: referenceNo,
            });
        }
        // Check for Server Date/Time
        if (trxDateTime) {
            detailsArray.push({
                title: DATE_AND_TIME,
                value: trxDateTime,
            });
        }

        detailsArray.push({
            title: TRANSACTION_TYPE,
            value: APPLY_EZYPAY_PLUS,
        });

        if (statusCode === "200") {
            const newValue = selectedData.map((value) => ({
                ...value,
                selectedServerVal: value?.selectedServerVal?.map((i) => {
                    return { ...i, success: true };
                }),
            }));
            setSelectedData(newValue);
            const receiptData = getShareReceiptData(newValue, referenceNo, trxDateTime);
            const cardLength = selectedData.length;

            navigation.navigate("EZYPayStatus", {
                ...route.params,
                receiptData,
                isSuccess: true,
                headerTxt: `You have submitted ${cardLength} application${
                    cardLength > 1 ? "s" : ""
                }`,
                isSubMessage: true,
                errorMessage: "We will notify you on the application status via SMS and/or email.",
                detailsData: detailsArray,
            });
        }
    }, []);

    //S2U V4
    const handleError = useCallback((executePayload) => {
        if (executePayload.code === 423) {
            // Display RSA Account Locked executePayload Message
            console.log("RSA Lock");
            const serverDate = executePayload?.payload?.serverDate || "";
            navigation.navigate(navigationConstant.ONE_TAP_AUTH_MODULE, {
                screen: "Locked",
                params: {
                    reason: executePayload?.rsaResponse?.statusDescription ?? "N/A",
                    loggedOutDateTime: serverDate,
                    lockedOutDateTime: serverDate,
                },
            });
        } else if (executePayload.code === 422) {
            // Display RSA Account Locked executePayload Message
            console.log("RSA Deny");
            navigation.navigate(navigationConstant.COMMON_MODULE, {
                screen: navigationConstant.RSA_DENY_SCREEN,
                params: {
                    statusDescription: executePayload?.rsaResponse?.statusDescription ?? "N/A",
                    additionalStatusDescription: executePayload?.rsaResponse?.statusDescription
                        ? ""
                        : executePayload?.rsaResponse?.additionalStatusDescription ?? "",
                    serverDate: executePayload?.rsaResponse?.serverDate ?? "N/A",
                    nextParams: {
                        screen: navigationConstant.ACCOUNT_DETAILS_SCREEN,
                        params: { refresh: false },
                    },
                    nextModule: navigationConstant.BANKINGV2_MODULE,
                    nextScreen: "Tab",
                },
            });
        } else {
            const entryStack = navigationConstant.BANKINGV2_MODULE;
            const entryScreen = navigationConstant.ACCOUNT_DETAILS_SCREEN;
            const entryPoint = {
                entryStack,
                entryScreen,
                params: {
                    ...route.params,
                },
            };
            const ackDetails = {
                executePayload,
                transactionSuccess: false,
                entryPoint,
                navigate: navigation.navigate,
            };
            if (executePayload?.executed) {
                ackDetails.titleMessage = APPLY_FAIL;
                ackDetails.transactionDetails = {
                    transactionType: APPLY_EZYPAY_PLUS,
                };
            }
            handleS2UAcknowledgementScreen(ackDetails);
        }
    }, []);

    //S2U V4 End

    const onContinueTap = useCallback(() => {
        console.log("[EZYPayConfirmation] >> [onContinueTap]");
        initiateS2USdk();
    }, [initiateS2USdk]);

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <>
                <ScreenLayout
                    paddingBottom={0}
                    paddingTop={0}
                    paddingHorizontal={0}
                    header={
                        <HeaderLayout
                            headerCenterElement={
                                <Typography
                                    text="Confirmation"
                                    fontWeight="600"
                                    fontSize={16}
                                    lineHeight={19}
                                />
                            }
                            headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                            headerRightElement={<HeaderCloseButton onPress={onCloseTap} />}
                        />
                    }
                    useSafeArea
                    neverForceInset={["top", "bottom"]}
                >
                    <ScrollView style={styles.svContainer}>
                        <React.Fragment>
                            <View style={styles.imageView}>
                                <TransferImageAndDetails
                                    title={accDetails?.name}
                                    subtitle={accDetails?.description1}
                                    image={{
                                        type: "local",
                                        source: getCardProviderFullLogo(accDetails?.cardNo) ?? null,
                                    }}
                                    isVertical={true}
                                ></TransferImageAndDetails>
                            </View>
                            <View style={styles.container}>
                                <View style={styles.textMargin2}>
                                    <Typography
                                        fontSize={14}
                                        lineHeight={18}
                                        fontWeight="600"
                                        text="Transaction plan"
                                        fontStyle="normal"
                                        textAlign="left"
                                    />
                                </View>

                                <FlatList
                                    data={selectedData}
                                    // extraData={refresh}
                                    renderItem={({ item, index }) => (
                                        <React.Fragment>
                                            <View style={styles.mainListContainer}>
                                                <View style={styles.mainContainerView}>
                                                    <View style={styles.innerView}>
                                                        <View style={styles.textMargin}>
                                                            <Typography
                                                                fontSize={14}
                                                                lineHeight={18}
                                                                fontWeight="600"
                                                                fontStyle="normal"
                                                                text={item.desc.trim()}
                                                                textAlign="left"
                                                            />
                                                        </View>
                                                        <View style={styles.textMargin}>
                                                            <Typography
                                                                fontSize={18}
                                                                lineHeight={18}
                                                                fontWeight="600"
                                                                fontStyle="normal"
                                                                text={`RM ${item?.selectedServerVal[0]?.monthlyInstallment} / month`}
                                                                textAlign="left"
                                                            />
                                                        </View>
                                                        <View style={styles.textMargin2}>
                                                            <Typography
                                                                fontSize={10}
                                                                lineHeight={18}
                                                                fontWeight="normal"
                                                                fontStyle="normal"
                                                                text={`Plan: ${item.selectedVal.name}`}
                                                                textAlign="left"
                                                            />
                                                        </View>
                                                        <View style={styles.textMargin}>
                                                            <Typography
                                                                fontSize={12}
                                                                lineHeight={18}
                                                                fontWeight="normal"
                                                                fontStyle="normal"
                                                                text="Transaction details"
                                                                textAlign="left"
                                                            />
                                                        </View>
                                                        <View style={styles.textMargin}>
                                                            <Typography
                                                                fontSize={14}
                                                                lineHeight={18}
                                                                fontWeight="600"
                                                                fontStyle="normal"
                                                                text={`${item.displayAmt} (${item.displayDate})`}
                                                                textAlign="left"
                                                            />
                                                        </View>
                                                    </View>
                                                </View>
                                            </View>
                                        </React.Fragment>
                                    )}
                                    keyExtractor={(item, index) => `${item.date}-${index}`}
                                />

                                {/* Notes */}
                                <View style={styles.tncContainer}>
                                    <TouchableOpacity onPress={onTeamsConditionClick}>
                                        <Text style={styles.TnCLblCls} textAlignVertical="top">
                                            {
                                                "By clicking on 'Confirm' for your application, you agree to the "
                                            }
                                            <Typography
                                                fontSize={12}
                                                lineHeight={18}
                                                fontWeight="600"
                                                fontStyle="normal"
                                                textAlign="left"
                                                style={styles.termsText}
                                                text={TERMS_CONDITIONS}
                                            ></Typography>
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </React.Fragment>
                    </ScrollView>
                    {/* Bottom docked button container */}
                    <View style={styles.actionContainer}>
                        <FixedActionContainer>
                            <ActionButton
                                backgroundColor={YELLOW}
                                fullWidth
                                componentCenter={
                                    <Typography
                                        color={BLACK}
                                        fontSize={14}
                                        lineHeight={18}
                                        fontWeight="600"
                                        text={CONFIRM}
                                    />
                                }
                                onPress={onContinueTap}
                            />
                        </FixedActionContainer>
                    </View>
                </ScreenLayout>
                {showTACModal && (
                    <TacModal
                        tacParams={tacParams}
                        validateByOwnAPI
                        validateTAC={onTACDone}
                        onTacClose={onTACClose}
                        isS2UDown={isS2UDown}
                    />
                )}

                {showS2UModal && (
                    //S2U V4
                    <Secure2uAuthenticationModal
                        navigation={navigation}
                        onS2UDone={onS2uDone}
                        onS2uClose={onS2uClose}
                        s2uEnablement
                        transactionDetails={mapperData}
                        extraParams={{
                            metadata: {
                                txnType: "APPLY_EZYPAY_PLUS",
                            },
                        }}
                    />
                )}
            </>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    TnCLblCls: {
        color: BLACK,
        fontFamily: "montserrat",
        fontSize: 12,
        fontStyle: "normal",
        fontWeight: "normal",
        letterSpacing: 0,
        lineHeight: 18,
    },
    actionContainer: {
        paddingBottom: Platform.OS === "ios" ? 24 : 0,
        paddingHorizontal: 12,
    },
    container: {
        flex: 1,
    },
    imageView: {
        marginBottom: 30,
    },
    innerView: {
        marginBottom: 15,
        marginLeft: 17,
        marginTop: 20,
    },
    mainListContainer: {
        backgroundColor: WHITE,
        borderRadius: 8,
        marginBottom: 15,
        marginTop: 10,
        shadowOpacity: 1,
        shadowRadius: 16,
        width: "100%",
        ...getShadow({
            elevation: 4, // android
        }),
    },
    svContainer: {
        paddingHorizontal: 28,
    },
    termsText: {
        fontWeight: "600",
        textDecorationLine: "underline",
    },
    textMargin: {
        marginBottom: 5,
    },
    textMargin2: {
        marginBottom: 15,
    },
    tncContainer: {
        flexDirection: "column",
        marginTop: 20,
        paddingBottom: 120,
    },
});

EZYPayConfirmation.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
    getModel: PropTypes.any,
};

export default withModelContext(EZYPayConfirmation);
