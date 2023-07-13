import Numeral from "numeral";
import PropTypes from "prop-types";
import React, { useState, useEffect, useCallback } from "react";
import {
    TouchableOpacity,
    View,
    StyleSheet,
    ScrollView,
    FlatList,
    Text,
    Image,
} from "react-native";

import { navigateToS2UCooling, navigateToS2UReg } from "@screens/OneTapAuth/CoolingNavigator";

import {
    COMMON_MODULE,
    PDF_VIEWER,
    MAYBANK2U,
    TAB_NAVIGATOR,
    TAB,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import { Avatar } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import InlineEditor from "@components/Inputs/InlineEditor";
import Secure2uAuthenticationModal from "@components/Modals/Secure2uAuthenticationModal";
import TacModal from "@components/Modals/TacModal";
import Popup from "@components/Popup";
import Typography from "@components/Text";
import { showErrorToast } from "@components/Toast";
import TransferImageAndDetails from "@components/Transfers/TransferImageAndDetails";

import { useModelController } from "@context";

import { BTCalculatePayment, BTPayment } from "@services";

import {
    MEDIUM_GREY,
    DARK_GREY,
    YELLOW,
    BLACK,
    WHITE,
    GREY,
    LIGHT_GREY,
    SEPARATOR_GRAY,
} from "@constants/colors";
import { M2U, S2U_PUSH, SMS_TAC } from "@constants/data";
import { FN_BALANCE_TRANSFER } from "@constants/fundConstants";
import {
    TERMS_CONDITIONS,
    REFERENCE_ID,
    DATE_AND_TIME,
    CURRENCY,
    CONFIRM,
    COMMON_ERROR_MSG,
    CONFIRMATION,
    APPLICATION_SUCCESSFUL,
    APPLY_FAIL,
    SUCC_STATUS,
} from "@constants/strings";
import { BT_CAL, BT_PAYMENT } from "@constants/url";

import {
    handleS2UAcknowledgementScreen,
    init,
    initChallenge,
    s2uSdkLogs,
} from "@utils/dataModel/s2uSDKUtil";
import { getCardProviderFullLogo, maskAccount } from "@utils/dataModel/utility";

import Assets from "@assets";

import BTAddCard from "./BTAddCard";

const CardListItem = ({ title, item, image, onPress, type, onCardRemoveIconPress }) => {
    const onListItemPressed = useCallback(() => onPress(item), [item, onPress]);
    const onRemove = useCallback(() => onCardRemoveIconPress(item), [item, onCardRemoveIconPress]);

    return (
        <TouchableOpacity onPress={onListItemPressed} activeOpacity={0.9}>
            <View style={styles.bankInfo}>
                <View style={styles.circleImageView}>
                    <View style={styles.circleImageView}>
                        {image.type === "local" && (
                            <Image
                                style={image.imgStyle}
                                source={image.source}
                                resizeMethod="scale"
                            />
                        )}
                        {image.type === "url" && (
                            <Avatar imageUri={image.source} name="name" radius={64} />
                        )}
                    </View>
                </View>
                <View style={styles.bankInfoText}>
                    <Typography
                        fontSize={14}
                        fontWeight="600"
                        fontStyle="normal"
                        letterSpacing={0}
                        lineHeight={18}
                        color="#000000"
                        textAlign="left"
                        text={title}
                    />
                    {item.description1 !== "" && (
                        <Typography
                            fontSize={12}
                            fontWeight="300"
                            fontStyle="normal"
                            letterSpacing={0}
                            lineHeight={18}
                            color={BLACK}
                            textAlign="left"
                            text={item.description1}
                            style={styles.wrapShrink}
                        />
                    )}

                    {item.description2 !== "" && (
                        <Typography
                            fontSize={12}
                            fontStyle="normal"
                            letterSpacing={0}
                            lineHeight={18}
                            color={DARK_GREY}
                            textAlign="left"
                            text={item.description2}
                            style={styles.wrapShrink}
                        />
                    )}
                </View>
                {type === "card" && (
                    <View style={styles.removeIconsContainer}>
                        <TouchableOpacity
                            onPress={onRemove}
                            accessibilityLabel="removeBtn"
                            testID="removeBtn"
                        >
                            <View>
                                <Image style={styles.closeImg} source={Assets.closeBGIcon} />
                            </View>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
            <View style={[styles.seperator, styles.labelText]} />
        </TouchableOpacity>
    );
};

CardListItem.propTypes = {
    image: PropTypes.shape({
        imgStyle: PropTypes.any,
        source: PropTypes.any,
        type: PropTypes.string,
    }),
    item: PropTypes.shape({
        description1: PropTypes.string,
        description2: PropTypes.string,
    }),
    onCardRemoveIconPress: PropTypes.func,
    onPress: PropTypes.func,
    title: PropTypes.any,
    type: PropTypes.string,
};

const CardList = ({ list, onItemPress, onCardRemoveIconPress }) => {
    const extractKey = useCallback((item, index) => `${item.contentId}-${index}`, []);
    const renderItem = useCallback(
        ({ item }) => (
            <CardListItem
                title={item.name}
                item={item}
                image={{
                    type: "url",
                    source: item.image,
                }}
                onPress={onItemPress}
                type="card"
                onCardRemoveIconPress={onCardRemoveIconPress}
            />
        ),
        [onCardRemoveIconPress, onItemPress]
    );

    return (
        <FlatList
            style={styles.cardList}
            data={list}
            extraData={list}
            scrollToIndex={0}
            showsHorizontalScrollIndicator={false}
            showIndicator={false}
            keyExtractor={extractKey}
            renderItem={renderItem}
        />
    );
};

CardList.propTypes = {
    list: PropTypes.any,
    onCardRemoveIconPress: PropTypes.any,
    onItemPress: PropTypes.any,
};
function BTConfirmation({ navigation, route }) {
    const params = route?.params ?? {};
    const [selectedData] = useState(params?.selectedData ?? []);
    const [masterData] = useState(params?.masterData ?? {});
    const [accDetails] = useState(params?.accDetails ?? {});
    const [availBal] = useState(params?.masterData?.balanceType ?? 0);
    const [addCardPopup, setAddCardPopup] = useState(false);
    const [selectedCard, setSelectedCard] = useState([]);
    const [totalAmt, setTotalAmt] = useState("");
    const [monthlyInstallment, setMonthlyInstallment] = useState(
        selectedData?.selectedServerVal?.monthlyInstallment ?? ""
    );
    const [lastInstallment, setLastInstallment] = useState(
        selectedData?.selectedServerVal?.lastInstallment ?? ""
    );
    const [showTACModal, setShowTACModal] = useState(false);
    const [tacParams, setTacParams] = useState({});
    const [showPopup, setShowPopup] = useState(false);
    const [popupTitle] = useState("Unsaved Changes");
    const [popupMsg] = useState(
        "Are you sure you want to leave this page? Any unsaved changes will be discarded."
    );
    const [popupPrimaryBtnText] = useState("Discard");

    // S2U V4
    const [mapperData, setMapperData] = useState({});
    const [showS2UModal, setShowS2UModal] = useState(false);
    const { getModel } = useModelController();
    const nonTxnData = { isNonTxn: true };
    const [transactionDate, setTransactionDate] = useState("");
    const [isS2UDown, setIsS2UDown] = useState(false);
    useEffect(() => {
        const data = formCardDetails(selectedData);
        addCard(data);
        setTotalAmt(selectedData?.amount);
    }, [addCard, selectedData]);

    const onBackTap = useCallback(() => {
        navigation.goBack();
    }, [navigation]);

    const onCloseTap = useCallback(() => {
        setShowPopup(true);
    }, []);

    const onContinueTap = () => {
        const isValid = isAmtValid();
        if (isValid) initiateS2USdk();
    };

    //S2U V4
    const s2uSDKInit = async () => {
        const params = getPaymentParams("");
        delete params.tacBlock;
        delete params.twoFAType;
        return await init(FN_BALANCE_TRANSFER, params);
    };

    //S2U V4
    const initiateS2USdk = async () => {
        try {
            const s2uInitResponse = await s2uSDKInit();
            if (s2uInitResponse?.message || s2uInitResponse.statusCode !== 0) {
                showErrorToast({
                    message: s2uInitResponse.message,
                });
            } else {
                if (s2uInitResponse?.actionFlow === SMS_TAC) {
                    //............ ConfirmScreen
                    const { isS2uV4ToastFlag } = getModel("misc");
                    setIsS2UDown(isS2uV4ToastFlag ?? false);
                    navigateToTACFlow();
                } else if (s2uInitResponse?.actionFlow === S2U_PUSH) {
                    if (s2uInitResponse?.s2uRegistrationDetails?.app_id === M2U) {
                        doS2uRegistration(navigation.navigate);
                    }
                } else {
                    initS2UPull(s2uInitResponse);
                }
            }
        } catch (error) {
            s2uSdkLogs(error, "Balance Transfer");
        }
    };
    //S2U V4
    const initS2UPull = async (s2uInitResponse) => {
        const { navigate } = navigation;
        setTransactionDate(s2uInitResponse?.timestamp);
        if (s2uInitResponse?.s2uRegistrationDetails?.isActive) {
            if (s2uInitResponse?.s2uRegistrationDetails?.isUnderCoolDown) {
                //S2U under cool down period
                navigateToS2UCooling(navigate);
            } else {
                const challengeRes = await initChallenge();
                if (challengeRes?.message) {
                    showErrorToast({ message: challengeRes?.message });
                } else {
                    setMapperData(challengeRes?.mapperData);
                    setShowS2UModal(true);
                }
            }
        } else {
            //Redirect user to S2U registration flow
            doS2uRegistration(navigate);
        }
    };
    const doS2uRegistration = (navigate) => {
        const redirect = {
            succStack: TAB_NAVIGATOR,
            succScreen: TAB,
        };
        navigateToS2UReg(navigate, route?.params, redirect, getModel);
    };
    const isAmtValid = useCallback(() => {
        const maxAmount = 999999.99;
        const aBal = parseFloat(availBal.replace(/[, ]+/g, "").trim() ?? 0);
        const minLimit = parseFloat(
            selectedData?.plan?.MBB_Limit1.replace(/[, ]+/g, "").trim() ?? 0
        );
        const maxLimit = parseFloat(
            selectedData?.plan?.MBB_Limit2.replace(/[, ]+/g, "").trim() ?? 0
        );
        let errMsg = "";

        if (totalAmt > aBal) errMsg = "Your Total Amount has exceeded the BT limit";
        if (totalAmt < minLimit) errMsg = "Total amount is less than minimum amount";
        if (totalAmt > maxLimit) errMsg = "Total amount is greater than maximum amount";
        if (totalAmt > maxAmount) errMsg = "Total amount should be less than RM 999,999.99";

        if (errMsg !== "") {
            showErrorToast({
                message: errMsg,
            });
            return false;
        }
        return true;
    }, [availBal, selectedData?.plan?.MBB_Limit1, selectedData?.plan?.MBB_Limit2, totalAmt]);

    const onCardCallback = useCallback(
        async (value) => {
            const params = route?.params ?? {};
            const serverData = params?.result ?? null;
            const selectedPlan = selectedData?.plan;
            const param = {
                referenceNo: serverData?.txnRefNo,
                noOfRecord: 1,
                noOfOccurence: 1,
                service: "BT",
                cardNo: params?.prevData?.number ?? "",
                details: [
                    {
                        effectiveDate: "",
                        postingDate: "",
                        description: "",
                        indicator: "",
                        amount: value?.amount,
                        tenure: selectedPlan?.MBB_Tenure,
                        curCode: "",
                        curAmt: "",
                        sequenceNum: "",
                        ezyPlan: selectedPlan?.MBB_Plan,
                        btPlan: selectedPlan?.MBB_Package,
                        rate: "",
                        intMonth: "",
                        planType: selectedPlan?.MBB_Type,
                        transNum: "",
                        transactionCode: "",
                    },
                ],
            };
            const response = await BTCalculatePayment(param, BT_CAL).catch((error) => {
                showErrorToast({
                    message: error?.message || COMMON_ERROR_MSG,
                });
            });
            const result = response?.data ?? null;
            if (!result) {
                return;
            }
            const { statusCode, statusDescription, details } = result;
            if (statusCode === "200") {
                const newMonthlyInstallment = details[0]?.transactionDetails[0]?.monthlyInstallment;
                const newLastInstallment = details[0]?.transactionDetails[0]?.lastInstallment;
                const data = formCardDetails({
                    ...value,
                    monthlyInstallment: newMonthlyInstallment,
                    lastInstallment: newLastInstallment,
                });
                const total = Number(totalAmt) + Number(value?.amount);
                setMonthlyInstallment(Number(monthlyInstallment) + Number(newMonthlyInstallment));
                setLastInstallment(Number(lastInstallment) + Number(newLastInstallment));
                setTotalAmt(total);
                addCard(data);
            } else {
                showErrorToast({
                    message: statusDescription || COMMON_ERROR_MSG,
                });
            }
            setAddCardPopup(false);
        },
        [addCard, totalAmt, monthlyInstallment, lastInstallment, selectedCard]
    );

    const onCardClose = useCallback(() => {
        setAddCardPopup(false);
    }, []);

    const onAddCard = useCallback(() => {
        const newValue = [...selectedCard];
        if (newValue.length <= 3) {
            setAddCardPopup(true);
        }
    }, [selectedCard]);

    const formCardDetails = (value) => {
        return {
            image: value?.cardIssuer?.image?.imageUri ?? "",
            name: value?.cardIssuer?.bankName ?? "",
            description1: maskAccount(value.cardNo) ?? "",
            description2: value.dispAmt ?? "",
            amount: value.amount ?? "0",
            cardNo: value.cardNo ?? "",
            cardCode: value?.cardIssuer?.bankCode ?? "",
            cardType: value?.cardType.id ?? "",
            monthlyInstallment: value.monthlyInstallment ?? monthlyInstallment,
            lastInstallment: value.lastInstallment ?? lastInstallment,
        };
    };

    const getSelectedData = useCallback(() => {
        const selectedDetails = [];
        selectedCard.forEach((value) => {
            selectedDetails.push({
                cardNo: value.cardNo ?? "",
                cardMask: maskAccount(value.cardNo) ?? "",
                cardIssuerName: value.name ?? "",
                cardIssuerCode: value.cardCode ?? "",
                cardType: value.cardType ?? "",
                txnAmt: value.amount ?? "",
                monthlyInstallment: value.monthlyInstallment ?? "",
                lastInstallment: value.lastInstallment ?? "",
            });
        });
        return selectedDetails;
    }, [selectedCard]);

    const addCard = useCallback(
        (value) => {
            setSelectedCard([...selectedCard, value]);
        },
        [selectedCard]
    );

    const onCardRemoveIconPress = useCallback(
        (value) => {
            const newValue = [...selectedCard];
            if (newValue.length <= 1) {
                setShowPopup(true);
                return;
            }
            const newArray = [];
            newValue.forEach((item) => {
                if (value.cardNo !== item.cardNo) {
                    newArray.push(item);
                }
            });
            const total = Number(totalAmt) - Number(value?.amount);
            const monthlyInstAmt = Number(monthlyInstallment) - Number(value?.monthlyInstallment);
            const lastInstAmt = Number(lastInstallment) - Number(value?.lastInstallment);
            setTotalAmt(total);
            setMonthlyInstallment(monthlyInstAmt);
            setLastInstallment(lastInstAmt);
            setSelectedCard(newArray);
        },
        [selectedCard, totalAmt, monthlyInstallment, lastInstallment]
    );

    const getShareReceiptData = useCallback(
        (newValue, totalAmt, ref, date) => {
            const receiptArray = [
                {
                    label: "Reference ID",
                    value: ref,
                    showRightText: true,
                    rightTextType: "text",
                    rightStatusType: "success",
                    rightText: date,
                },
                {
                    label: "Total amount",
                    value: CURRENCY + Numeral(totalAmt).format("0,0.00"),
                    showRightText: false,
                },
                {
                    label: "Monthly installment",
                    value: CURRENCY + Numeral(monthlyInstallment ?? 0).format("0,0.00"),
                    showRightText: false,
                },
                {
                    label: `<div class="labelCls">Selected plan</div><div style="margin-top: 15px;margin-bottom: 40px;" class="valueCls">${selectedData?.plan?.Plan}</div>`,
                    value: `<div  style="margin-bottom: 40px !important;" class="labelCls">Tenure - <b>${selectedData?.plan?.MBB_Tenure}</b></div><div style="margin-bottom: 40px !important;" class="labelCls">Interest rate - <b>${selectedData?.plan?.MBB_Rate}</b></div><div style="margin-bottom: 40px !important;" class="labelCls">Min transfer limit - <b>RM ${selectedData?.plan?.MBB_Limit1}</b></div><div style="margin-bottom: 40px !important;" class="labelCls">Max transfer limit - <b>RM ${selectedData?.plan?.MBB_Limit2}</b></div><div style="margin-bottom: 35px !important;line-height: 50px !important;" class="labelCls">Fees & charges - ${selectedData?.plan?.FeesAndCharges}</b></div>`,
                    showRightText: false,
                },
            ];
            let newCardValue = "";
            newValue.forEach((item) => {
                newCardValue += `<div style="margin-bottom: 10px;"><div class="valueCls" style="margin-bottom: 15px;">${item.name}</div><div class="labelCls">${item.description1}</div><div  class="valueClsSmall">${item.description2}</div></div>`;
            });
            receiptArray.push({
                label: `Balance transfer details`,
                value: newCardValue,
                showRightText: false,
            });
            return receiptArray;
        },
        [
            selectedData?.plan?.FeesAndCharges,
            selectedData?.plan?.MBB_Limit1,
            selectedData?.plan?.MBB_Limit2,
            selectedData?.plan?.MBB_Rate,
            selectedData?.plan?.MBB_Tenure,
            selectedData?.plan?.Plan,
            selectedData?.selectedServerVal?.monthlyInstallment,
            monthlyInstallment,
        ]
    );

    const onTeamsConditionClick = useCallback(() => {
        const navParams = {
            file: "https://www.maybank2u.com.my/iwov-resources/pdf/personal/cards/features_services/BTConv_tnc.pdf",
            share: false,
            showShare: false,
            type: "url",
            pdfType: "Terms & Conditions",
            title: "Terms & Conditions",
            route: "BTConfirmation",
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
            fundTransferType: "BALANCE_TRF",
            cardNo: accDetails?.cardNo ?? "",
        };
        setTacParams(prms);
        setShowTACModal(true);
    }, [accDetails?.cardNo]);

    const onTACClose = useCallback(() => {
        setShowTACModal(false);
    }, []);
    //S2U V4
    const onS2uClose = () => {
        setShowS2UModal(false);
    };

    //S2U V4
    const onS2uDone = (response) => {
        // Close S2u popup
        onS2uClose();
        navigateToAcknowledgementScreen(response);
    };
    //S2U V4
    const navigateToAcknowledgementScreen = (response) => {
        const { transactionStatus, executePayload } = response;
        const entryPoint = {
            entryStack: TAB_NAVIGATOR,
            entryScreen: TAB,
        };
        let ackDetails = {
            executePayload,
            transactionSuccess: transactionStatus,
            entryPoint,
            navigate: navigation.navigate,
            transactionDetails: {
                transactionToken: executePayload?.result?.txnRefNo,
            },
        };
        executePayload?.result?.txnRefNo === undefined && delete ackDetails.transactionDetails;
        if (executePayload?.executed) {
            if (executePayload?.result?.statusCode === "0000") {
                tacSuccess(executePayload?.result?.txnRefNo, transactionDate);
                return;
            }
            const titleMessage =
                executePayload?.message?.toLowerCase() === SUCC_STATUS
                    ? `${APPLICATION_SUCCESSFUL.charAt(0).toUpperCase()}${
                          APPLICATION_SUCCESSFUL.slice(1).split(" ")[0]
                      } ${APPLICATION_SUCCESSFUL.split(" ")[1].toLowerCase()}`
                    : APPLY_FAIL;
            ackDetails = {
                ...ackDetails,
                titleMessage,
            };
        }
        handleS2UAcknowledgementScreen(ackDetails);
    };
    const getPaymentParams = useCallback(
        (tac) => {
            const cardDetails = getSelectedData();
            const serverData = params?.result ?? null;
            return {
                twoFAType: "TAC",
                tacBlock: tac,
                refNo: serverData?.txnRefNo,
                plan: selectedData?.plan?.MBB_Plan,
                planDisplay: selectedData?.plan?.MBB_DisplayPlan,
                totAmt: totalAmt,
                monthlyInstAmt: monthlyInstallment,
                lastInstallment,
                firstPmtDate: selectedData?.selectedServerVal?.firstPmtDate,
                planTenure: selectedData?.selectedServerVal?.planTenure,
                lastPmtDate: selectedData?.selectedServerVal?.lastPmtDate,
                postingDate: selectedData?.selectedServerVal?.postingDate,
                tenure: selectedData?.plan?.MBB_Tenure,
                mbbPkg: selectedData?.plan?.MBB_Package,
                mbbRate: selectedData?.plan?.MBB_Rate,
                mbbCardNo: params?.prevData?.number ?? "",
                email: selectedData?.email,
                service: "BT",
                cardDetails: cardDetails ?? [],
            };
        },
        [
            params?.result,
            selectedData?.plan?.MBB_Plan,
            selectedData?.plan?.MBB_DisplayPlan,
            selectedData?.selectedServerVal?.monthlyInstallment,
            selectedData?.selectedServerVal?.lastInstallment,
            selectedData?.selectedServerVal?.firstPmtDate,
            selectedData?.selectedServerVal?.planTenure,
            selectedData?.selectedServerVal?.lastPmtDate,
            selectedData?.selectedServerVal?.postingDate,
            selectedData?.plan?.MBB_Tenure,
            selectedData?.plan?.MBB_Package,
            selectedData?.plan?.MBB_Rate,
            selectedData?.email,
            params?.prevData?.number,
            getSelectedData,
            totalAmt,
        ]
    );
    const tacSuccess = (txnRefNo, txnDate) => {
        const detailsArray = [];
        // Check for Reference ID
        if (txnRefNo) {
            detailsArray.push({
                title: REFERENCE_ID,
                value: txnRefNo,
            });
        }
        // Check for Server Date/Time
        if (txnDate) {
            detailsArray.push({
                title: DATE_AND_TIME,
                value: txnDate,
            });
        }
        const reciptData = getShareReceiptData(
            selectedCard,
            totalAmt,
            txnRefNo ?? "",
            txnDate ?? ""
        );
        navigation.navigate("BTStatus", {
            ...route.params,
            reciptData,
            isSuccess: true,
            headerTxt: `Application successfully submitted`,
            isSubMessage: true,
            errorMessage: "We will notify you on the application status via SMS and/or email.",
            detailsData: detailsArray,
        });
    };

    const onTACDone = useCallback(
        async (tac) => {
            setShowTACModal(false);
            const param = getPaymentParams(tac);
            const httpResp = await BTPayment(param, BT_PAYMENT).catch((error) => {
                handleApiFailure(error);
            });
            const result = httpResp?.data?.result ?? null;
            if (!result) {
                handleApiFailure(httpResp);
                return;
            }
            const { statusCode, txnRefNo, txnDate } = result;

            if (statusCode === "0000") {
                tacSuccess(txnRefNo, txnDate);
            } else {
                handleApiFailure(httpResp);
            }
        },
        [
            getPaymentParams,
            getShareReceiptData,
            handleApiFailure,
            navigation,
            route.params,
            selectedCard,
            totalAmt,
        ]
    );

    const handleApiFailure = useCallback(
        (error) => {
            navigation.navigate("BTStatus", {
                ...route.params,
                isSuccess: false,
                headerTxt: `Application unsuccessful`,
                isSubMessage: false,
                errorMessage:
                    error?.data?.result?.statusDescription ??
                    error?.message ??
                    error?.error?.message ??
                    "",
                detailsData: [
                    {
                        title: REFERENCE_ID,
                        value:
                            error?.data?.result?.txnRefNo ??
                            error?.error?.result?.transactionRefNumber ??
                            "N/A",
                    },
                    {
                        title: DATE_AND_TIME,
                        value:
                            error?.data?.result?.hostDt ??
                            error?.data?.result?.txnDate ??
                            error?.data?.result?.serverDate ??
                            error?.error?.result?.serverDate ??
                            "N/A",
                    },
                ],
            });
        },
        [navigation, route.params]
    );

    const onPopupBtnPress = () => {
        onPopupCancel();
        navigation.navigate(MAYBANK2U, {
            screen: "",
            params: {
                refresh: true,
            },
        });
    };

    const onPopupCancel = useCallback(() => {
        setShowPopup(false);
    }, []);

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
                                    text={CONFIRMATION}
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
                            <View>
                                <View style={styles.textView}>
                                    <InlineEditor
                                        label="Available balance"
                                        value={`RM ${availBal}`}
                                        componentID="avbBalance"
                                        isEditable={false}
                                        editType="press"
                                    />
                                </View>
                                {/* Gray separator line */}
                                <View style={styles.graySeparator} />

                                <View style={styles.textView}>
                                    <InlineEditor
                                        label="Plan"
                                        value={selectedData?.plan?.Plan}
                                        componentID="planId"
                                        isEditable={false}
                                        editType="press"
                                        style={styles.labelText}
                                    />
                                    <InlineEditor
                                        label="Tenure"
                                        value={selectedData?.plan?.MBB_Tenure}
                                        componentID="tenureId"
                                        isEditable={false}
                                        editType="press"
                                        style={styles.labelText}
                                    />
                                    <InlineEditor
                                        label="Interest rate"
                                        value={selectedData?.plan?.MBB_Rate}
                                        componentID="rateId"
                                        isEditable={false}
                                        editType="press"
                                        style={styles.labelText}
                                    />
                                    <InlineEditor
                                        label="Total amount"
                                        value={CURRENCY + Numeral(totalAmt).format("0,0.00")}
                                        componentID="amtId"
                                        isEditable={false}
                                        editType="press"
                                        style={styles.labelText}
                                    />
                                    <InlineEditor
                                        label="Monthly installment"
                                        value={
                                            CURRENCY + Numeral(monthlyInstallment).format("0,0.00")
                                        }
                                        componentID="monthlyId"
                                        isEditable={false}
                                        labelNumberOfLines={2}
                                        editType="press"
                                        style={styles.labelText}
                                    />
                                    <InlineEditor
                                        label="Email address"
                                        value={selectedData?.email}
                                        componentID="emailId"
                                        isEditable={false}
                                        editType="press"
                                        style={styles.labelText}
                                    />
                                    <Typography
                                        color={BLACK}
                                        fontSize={14}
                                        fontWeight="normal"
                                        lineHeight={18}
                                        fontStyle="normal"
                                        textAlign="left"
                                        text="Fees & charges"
                                        style={styles.textMargin}
                                    />
                                    <Typography
                                        color={BLACK}
                                        fontSize={12}
                                        fontWeight="normal"
                                        lineHeight={18}
                                        fontStyle="normal"
                                        textAlign="left"
                                        text={selectedData?.plan?.FeesAndCharges}
                                        style={styles.labelText}
                                    />
                                    <View style={[styles.seperator, styles.textView]} />
                                    <View style={styles.labelText}>
                                        <Typography
                                            color={BLACK}
                                            fontSize={14}
                                            fontWeight="600"
                                            lineHeight={18}
                                            fontStyle="normal"
                                            textAlign="left"
                                            text="Balance transfer details"
                                            style={styles.labelText}
                                        />
                                        <CardList
                                            list={selectedCard}
                                            onItemPress={onCardRemoveIconPress}
                                            onCardRemoveIconPress={onCardRemoveIconPress}
                                        />
                                    </View>
                                    {/* Notes */}
                                    <View style={styles.labelText}>
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
                            </View>
                        </React.Fragment>
                    </ScrollView>
                    {/* Bottom docked button container */}
                    <View style={styles.actionContainer}>
                        <FixedActionContainer>
                            <View style={styles.bottomBtnContCls}>
                                <ActionButton
                                    backgroundColor={WHITE}
                                    fullWidth
                                    disabled={selectedCard.length === 3}
                                    componentCenter={
                                        <Typography
                                            color={selectedCard.length === 3 ? LIGHT_GREY : BLACK}
                                            fontSize={14}
                                            fontWeight="600"
                                            lineHeight={18}
                                            text="Add Another Card"
                                        />
                                    }
                                    onPress={onAddCard}
                                    style={styles.addBtnButton}
                                />
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
                            </View>
                        </FixedActionContainer>
                    </View>
                </ScreenLayout>
                {showTACModal && (
                    <TacModal
                        tacParams={tacParams}
                        validateByOwnAPI={true}
                        validateTAC={onTACDone}
                        onTacClose={onTACClose}
                        isS2UDown={isS2UDown}
                    />
                )}
                {addCardPopup && (
                    <BTAddCard
                        mData={masterData}
                        onCardCallback={onCardCallback}
                        title="Balance Transfer"
                        onClose={onCardClose}
                    />
                )}
                {/* Confirmation/Alert POPUP */}
                <Popup
                    visible={showPopup}
                    title={popupTitle}
                    description={popupMsg}
                    onClose={onPopupCancel}
                    primaryAction={{
                        text: popupPrimaryBtnText,
                        onPress: onPopupBtnPress,
                    }}
                    secondaryAction={{
                        text: "Cancel",
                        onPress: onPopupCancel,
                    }}
                />
            </>
            {showS2UModal && (
                <Secure2uAuthenticationModal
                    token=""
                    onS2UDone={onS2uDone}
                    onS2uClose={onS2uClose}
                    s2uPollingData={mapperData}
                    transactionDetails={mapperData}
                    secure2uValidateData={mapperData}
                    nonTxnData={nonTxnData}
                    s2uEnablement
                    navigation={navigation}
                    extraParams={{
                        metadata: {
                            txnType: "BTConfirmation",
                        },
                    }}
                />
            )}
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
        paddingBottom: 36,
        paddingHorizontal: 24,
        width: "100%",
    },
    addBtnButton: {
        marginBottom: 15,
    },
    bankInfo: {
        borderBottomColor: LIGHT_GREY,
        borderBottomWidth: 1,
        flexDirection: "row",
        paddingBottom: 17,
        width: "100%",
    },
    bankInfoText: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "center",
        marginLeft: 16,
    },
    bottomBtnContCls: {
        alignItems: "center",
        flex: 1,
        justifyContent: "space-around",
        width: "100%",
    },
    cardList: { width: "100%" },
    circleImageView: {
        alignContent: "center",
        alignItems: "center",
        backgroundColor: WHITE,
        borderColor: WHITE,
        borderRadius: 64 / 2,
        borderWidth: 2,
        flexDirection: "row",
        height: 64,
        justifyContent: "center",
        width: 64,
    },
    closeImg: {
        height: 30,
        width: 30,
    },

    graySeparator: {
        borderColor: GREY,
        borderTopWidth: 1,
        height: 1,
    },
    imageView: {
        marginBottom: 30,
    },
    labelText: {
        marginBottom: 20,
    },
    removeIconsContainer: {
        borderBottomRightRadius: 50,
        borderTopRightRadius: 50,
        flexDirection: "column",
        justifyContent: "center",
    },
    seperator: {
        backgroundColor: SEPARATOR_GRAY,
        height: 1,
        width: "100%",
    },
    svContainer: {
        paddingHorizontal: 24,
    },
    termsText: {
        fontWeight: "600",
        textDecorationLine: "underline",
    },
    textMargin: {
        marginBottom: 10,
    },
    textView: {
        marginBottom: 30,
        marginTop: 20,
    },
    wrapShrink: { flexShrink: 1, flexWrap: "wrap" },
});

BTConfirmation.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

export default BTConfirmation;
