import { useNavigation } from "@react-navigation/core";
import { useRoute } from "@react-navigation/native";
import _ from "lodash";
import React, { useRef, useState, useCallback, useEffect } from "react";
import { StyleSheet, View, ScrollView, RefreshControl, Dimensions, Image } from "react-native";
import DeviceInfo from "react-native-device-info";

import { SSL_CHECKOUT_STATUS } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import InlineEditor from "@components/Inputs/InlineEditor";
import Secure2uAuthenticationModal from "@components/Modals/Secure2uAuthenticationModal";
import TacModal from "@components/Modals/TacModal";
import ChallengeQuestion from "@components/RSA/ChallengeQuestion";
import { BottomDissolveCover, dissolveStyle } from "@components/SSL/BottomDissolveCover.js";
import Typo from "@components/Text";
import { showErrorToast, showInfoToast } from "@components/Toast";
import AccountList from "@components/Transfers/TransferConfirmationAccountList";

import { withModelContext, useModelController } from "@context";

import { bankingGetDataMayaM2u, SSLPayment, verifySSLPayment } from "@services";
import { FACheckoutConfirmation } from "@services/analytics/analyticsSSL";

import { BLACK, GREY, MEDIUM_GREY, YELLOW } from "@constants/colors";
import {
    FAIL_STATUS,
    PAYMENT_FAILED,
    PAYMENT_SUCCESSFUL,
    PAY_FROM,
    SECURE2U_IS_DOWN,
    SUCC_STATUS,
} from "@constants/strings";

import { commaAdder } from "@utils/dataModel/utilityPartial.1";
import { getDeviceRSAInformation } from "@utils/dataModel/utilityPartial.2";
import { calculateWeight, contextCart, SSLUserContacteNoClass } from "@utils/dataModel/utilitySSL";

import assets from "@assets";

const { width } = Dimensions.get("window");

function SSLCheckoutConfirmation() {
    const navigation = useNavigation();
    const route = useRoute();
    const { params } = route;
    const { getModel, updateModel } = useModelController();

    const [casaAccounts, setCasaAccounts] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState({});
    const [flow, setFlow] = useState(""); // TAC, S2U
    const dateText = "Today"; // Other module use date, here we're not scheduling -> getSendingFormatDate(new Date(), "short")
    const [disabled, setDisabled] = useState(false); //Prevent Multiple Tap

    const init = useCallback(async () => {
        console.log("SSLCheckoutSelectAcc init", params);

        switch (params?.flow) {
            case "S2UReg": // Meaning S2UReg success. Failure to register wouldn't even come to this stage
                setFlow("S2U");
                break;
            case "S2U":
                setFlow("S2U");
                break;
            case "TAC":
            default:
                showInfoToast({
                    message: SECURE2U_IS_DOWN,
                });
                setFlow("TAC");
                break;
        }

        try {
            const response = await bankingGetDataMayaM2u("/summary?type=A", true);

            const accountListings = response.data.result.accountListings || [];
            const messagedAccListing = accountListings.map((acc) => {
                acc.selected = false;
                if (acc.primary) {
                    acc.selected = true;
                    setSelectedAccount(acc);
                }
                return acc;
            });
            setCasaAccounts(messagedAccListing);
        } catch (e) {
            console.log("SSLCheckoutSelectAcc getAcc e", e);
            showErrorToast({
                message: e.message,
            });
        }
    }, [params?.flow]);

    useEffect(() => {
        init();
        FACheckoutConfirmation.onScreen();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // On Screen Variables -  Total
    const basketValue = contextCart.basketValue({
        cartProducts: params?.cartV1?.cartProducts,
        isSst: params?.merchantDetail?.isSst,
        sstPercentage: params?.merchantDetail?.sstPercentage,
    });

    const deliveryChargeAmt = parseFloat(params?.deliveryChargesResponse?.deliveryCharge ?? 0);
    const cartDiscountAmt = parseFloat(params?.promoResponse?.discountAmount ?? 0);
    const deliveryDiscountAmt = parseFloat(params?.promoResponse?.deliveryDiscountValue ?? 0);

    const discountAmt = (value) => {
        if (cartDiscountAmt >= parseFloat(basketValue)) {
            value -= parseFloat(basketValue);
        } else {
            value -= cartDiscountAmt;
        }
        if (deliveryDiscountAmt >= deliveryChargeAmt) {
            value -= deliveryChargeAmt;
        } else {
            value -= deliveryDiscountAmt;
        }
        return value;
    };

    let total = parseFloat(basketValue);
    total = discountAmt(total);
    if (params?.deliveryChargesResponse?.deliveryCharge) {
        total += parseFloat(params?.deliveryChargesResponse?.deliveryCharge);
    }
    if (params?.merchantDetail?.tax_processing_fee) {
        total += parseFloat(params?.merchantDetail?.tax_processing_fee_amount);
    }

    const totalLbl = `RM ${commaAdder(total.toFixed(2))}`;

    // S2U
    const selectedAmount = total.toFixed(2); // According to Reload module its in this format -> "14.00"

    const [showS2u, setShowS2u] = useState(false);
    const [pollingToken, setPollingToken] = useState(false);
    const [s2uTransactionDetails, setS2uTransactionDetails] = useState(false);
    function showS2uModal(response) {
        const { name, number } = selectedAccount;
        const trimmedAccountNumber = number
            .substring(0, 12)
            .replace(/[^\dA-Z]/g, "")
            .replace(/(.{4})/g, "$1 ")
            .trim();
        const { pollingToken, token } = response;
        const s2uTransactionDetails = [
            {
                label: "To",
                value: `${params?.merchantDetail?.shopName}`,
            },
            {
                label: "From",
                value: `${name}\n${trimmedAccountNumber}`,
            },
            { label: "Transaction Type", value: "Sama-Sama Lokal" },
            {
                label: "Date",
                value: dateText,
            },
        ];
        const s2uPollingToken = pollingToken || token || "";

        setPollingToken(s2uPollingToken);
        setS2uTransactionDetails(s2uTransactionDetails);
        setShowS2u(true);
    }
    function onS2uDone(response) {
        console.log("[ReloadConfirmation] >> [onS2uDone]", response);
        const { transactionStatus, s2uSignRespone } = response;

        onS2uClose();

        if (transactionStatus) {
            SSLPaymentFunc({ cachedResponse: sslPaymentResponseData.current });
        } else {
            const data = sslPaymentResponseData.current;
            const detailsArray = [];
            const { formattedTransactionRefNumber, serverDate } = data;
            const serverError = s2uSignRespone?.text ?? "";

            // Check for Ref ID
            if (formattedTransactionRefNumber) {
                detailsArray.push({
                    key: "Reference ID",
                    value: formattedTransactionRefNumber,
                });
            } else if (verifySSLPaymentResponse?.current?.paymentRef) {
                // Reference ID is better to get from final response. In the event of final response doesn't give reference ID, we get it from the previous response
                detailsArray.push({
                    key: "Reference ID",
                    value: verifySSLPaymentResponse?.current?.paymentRef,
                });
            }

            // Check for Server Date/Time
            if (serverDate) {
                detailsArray.push({
                    key: "Date & time",
                    value: serverDate,
                });
            }

            gotoFailStatusPage({ detailsArray, serverError });
        }
    }
    function onS2uClose() {
        setShowS2u(false);
    }

    // TAC
    const [showTAC, setShowTAC] = useState(false);
    const tacParams = useRef(null);
    function onTACDone(tac) {
        console.log("SSLCheckoutConfirmation onTACDone");

        const req = {
            ...getVerifyPaymentReqParam(),
            twoFAType: "TAC",
            tacValue: tac,
        };

        setShowTAC(false);
        SSLPaymentFunc({ req });
    }
    function hideTAC() {
        setShowTAC(false);
    }
    function onTACClose() {
        setShowTAC(false);
        navigation.goBack();
    }

    // Payment
    const sslPaymentResponseData = useRef(null);
    async function SSLPaymentFunc({ req, cachedResponse }) {
        console.log("SSLPaymentFunc", req, cachedResponse);
        try {
            let data;
            if (!cachedResponse) {
                // 1st time flow
                const response = await SSLPayment(req);
                data = response?.data.result ?? {};
                sslPaymentResponseData.current = data;
                resetCQFlags(); // Reset RSA/CQ flags

                // S2U. If total amount is zero, we skip S2U and straight to success
                if (flow === "S2U" && req?.orderDetailVO?.totalPaymentAmount !== "0.00") {
                    showS2uModal(data);
                    return;
                }
            } else {
                // 2nd time flow (when s2u success)
                data = cachedResponse;
            }

            const {
                statusCode,
                formattedTransactionRefNumber,
                serverDate,

                // Success scenario
                payAmount,
                orderId,
                merchantName,
                paymentRef,
                deliveryTypeVO,

                // Failed scenario
                additionalStatusDescription,
                statusDescription,
            } = data;

            const detailsArray = [];

            // Success flow
            if (statusCode === "S" || statusCode === "0" || statusCode === "0000") {
                // Check for Ref ID
                if (formattedTransactionRefNumber) {
                    detailsArray.push({
                        key: "Reference ID",
                        value: formattedTransactionRefNumber,
                    });
                } else if (verifySSLPaymentResponse?.current?.paymentRef) {
                    // Reference ID is better to get from final response. In the event of final response doesn't give reference ID, we get it from the previous response
                    detailsArray.push({
                        key: "Reference ID",
                        value: verifySSLPaymentResponse?.current?.paymentRef,
                    });
                }

                // Check for Server Date/Time
                if (serverDate) {
                    detailsArray.push({
                        key: "Date & time",
                        value: serverDate,
                    });
                }

                if (payAmount) {
                    detailsArray.push({
                        key: "Amount",
                        value: `RM ${payAmount}`,
                    });
                }

                // Show success page
                goSuccessReceiptPage({
                    detailsArray,
                    formattedTransactionRefNumber,
                    serverDate,
                    orderId,
                    payAmount,
                    merchantName,
                    paymentRef,
                    deliveryTypeVO,
                });
            } else {
                // Check for Ref ID
                if (formattedTransactionRefNumber) {
                    detailsArray.push({
                        key: "Reference ID",
                        value: formattedTransactionRefNumber,
                    });
                } else if (verifySSLPaymentResponse?.current?.paymentRef) {
                    // Reference ID is better to get from final response. In the event of final response doesn't give reference ID, we get it from the previous response
                    detailsArray.push({
                        key: "Reference ID",
                        value: verifySSLPaymentResponse?.current?.paymentRef,
                    });
                }

                // Check for Server Date/Time
                if (serverDate) {
                    detailsArray.push({
                        key: "Date & time",
                        value: serverDate,
                    });
                }
                const serverError = additionalStatusDescription || statusDescription || "";
                // console.log(receipt)
                gotoFailStatusPage({ detailsArray, serverError });
            }
        } catch (e) {
            console.log("SSLPayment e", e);

            /**
             * 1. The error object for SSL is somehow nested inside another error{}. see SSLCheckoutConfirmationDoc.js SSLPaymentFail
             * 2. We copied this module from Reload payment flow. In reload payment flow, the error isn't nested. So we cater for both
             */
            let status, challenge, error;
            if (e?.error?.error) {
                status = e.error.status;
                challenge = e.error.challenge;
                error = e.error;
            } else {
                status = e.status;
                challenge = e.challenge;
                error = e;
            }

            if (status == 428) {
                // Display RSA Challenge Questions if status is 428
                setShowCQLoader(false);
                setShowCQError(rsaRetryCount > 0);
                setChallenge(challenge);
                setIsCQRequired(true);
                setChallengeQuestion(challenge?.questionText);
                setRsaRetryCount(rsaRetryCount + 1);
                tacParams.current = req;
            } else {
                setShowCQLoader(false);
                setShowCQError(false);
                setIsCQRequired(false);
                tacParams.current = null;

                handleAPIException(error); // try with no internet
            }
        }
    }
    // On press Pay
    const verifySSLPaymentResponse = useRef(null);

    function getVerifyPaymentReqParam() {
        console.log("getVerifyPaymentReqParam", verifySSLPaymentResponse.current);
        const { isPostLogin } = getModel("auth");
        const authMode = isPostLogin ? "P" : "N";

        const { deviceInformation, deviceId } = getModel("device");
        const mobileSDKData = getDeviceRSAInformation(deviceInformation, DeviceInfo, deviceId);
        const basketValue = contextCart.basketValue({
            cartProducts: params?.cartV1?.cartProducts,
            isSst: params?.merchantDetail?.isSst,
            sstPercentage: params?.merchantDetail?.sstPercentage,
        }); // subtotal

        let total = parseFloat(basketValue); // total
        total = discountAmt(total);
        if (params?.deliveryChargesResponse?.deliveryCharge) {
            total += parseFloat(params?.deliveryChargesResponse?.deliveryCharge);
        }
        if (params?.merchantDetail?.tax_processing_fee) {
            total += parseFloat(params?.merchantDetail?.tax_processing_fee_amount);
        }

        const { cartProductsWeighted, totalCartWeight } = calculateWeight({
            cartProducts: params?.cartV1?.cartProducts,
        });

        const {
            latitude,
            longitude,
            addressLine1,
            unitNo,
            city,
            state,
            postcode,
            email,
            recipientName,
            contactNo,
            note,
        } = params?.recipientAddressObj;

        return {
            longitude,
            latitude,
            transactionRefNo: params?.promoResponse?.orderTransactionRefNo
                ? params?.promoResponse?.orderTransactionRefNo
                : null,
            paymentRefNo: verifySSLPaymentResponse?.current?.paymentRef
                ? verifySSLPaymentResponse?.current?.paymentRef
                : "",
            rquid: verifySSLPaymentResponse?.current?.rquid
                ? verifySSLPaymentResponse?.current?.rquid
                : null,

            fromAccountNo: selectedAccount.number,
            fullAccountNo: selectedAccount.number,
            fromAccountType: selectedAccount.type,
            fromAccountCode: selectedAccount.code,
            toAccountNo: params?.promoResponse?.merchantAccountNo
                ? params?.promoResponse?.merchantAccountNo
                : null,

            payeeName: params?.merchantDetail?.shopName,
            payeeCustomerKey: "",
            pymtType: params?.promoResponse?.paymentType
                ? params?.promoResponse?.paymentType
                : null,
            twoFAType: null,
            tacValue: "",
            authMode,
            messageAuthCode: "",
            orderDetailVO: {
                merchantId: params?.merchantDetail.merchantId,
                merchantName: params?.merchantDetail.shopName,
                promoCode: params?.promoCodeString,
                tableNumber: params?.tableNo,
                subTotalAmount: basketValue,
                taxAmount: params?.merchantDetail.isSst
                    ? (
                          (basketValue / (1 + params?.merchantDetail?.sstPercentage / 100)) *
                          (params?.merchantDetail?.sstPercentage / 100)
                      ).toFixed(2)
                    : "0",
                processingFeeAmount: params?.merchantDetail.tax_processing_fee
                    ? params?.merchantDetail.tax_processing_fee_amount.toFixed(2)
                    : "0",
                totalPaymentAmount: total.toFixed(2),
                merchantPhNo: params?.merchantDetail?.businessContactNo,
                merchantAddress: params?.merchantDetail?.outletAddress,
                isMkp: true,
                deliveryType: params?.selectedDeliveryId,
                deliveryChargeDetail: params?.deliveryChargesResponse
                    ? {
                          ...params?.deliveryChargesResponse,
                      }
                    : {},
                totalWeight: totalCartWeight,
                recipientName,
                addressDetail: {
                    addressLine1: unitNo ? `${unitNo}, ${addressLine1}` : addressLine1,
                    city,
                    state,
                    postcode,
                    email,
                    recipientName,
                    contactNo: SSLUserContacteNoClass(contactNo).inBackendFormat(),
                    addressLine3: "", // Not using this
                    noteToRider: note,
                },
                products: cartProductsWeighted.map((obj) => {
                    obj.size = "";
                    return obj;
                }),
            },
            mobileSDKData,
        };
    }

    // Success / Fail receipt
    function goSuccessReceiptPage({
        detailsArray,
        formattedTransactionRefNumber,
        orderId,
        serverDate,
        payAmount,
        merchantName,
        deliveryTypeVO,
    }) {
        updateModel({
            ssl: {
                hasSslOngoingOrders: true,
            },
        });
        const receiptDetailsArray = [
            {
                label: "Reference ID",
                value: formattedTransactionRefNumber,
                showRightText: true,
                rightTextType: "text",
                rightStatusType: "",
                rightText: serverDate,
            },
            {
                label: "Merchant Name",
                value: merchantName,
            },
            {
                label: "Delivery Type",
                value: deliveryTypeVO?.name,
            },
            {
                label: "Amount",
                value: `RM ${payAmount}`,
                showRightText: false,
                isAmount: true,
            },
        ];
        navigation.replace(SSL_CHECKOUT_STATUS, {
            shipping: params?.deliveryChargesResponse?.deliveryCharge,
            status: SUCC_STATUS,
            headerText: PAYMENT_SUCCESSFUL,
            detailsArray,
            showShareReceipt: true,
            receiptDetailsArray,
            orderId,
            selectedDeliveryId: params?.selectedDeliveryId,
        });
    }
    function gotoFailStatusPage({
        detailsArray,
        headerText = PAYMENT_FAILED,
        serverError = "",
        isLocked = false,
    }) {
        console.log("gotoFailStatusPage", detailsArray);
        navigation.replace(SSL_CHECKOUT_STATUS, {
            routeFrom: route?.params?.selectedParams?.routeFrom,
            status: FAIL_STATUS,
            headerText,
            detailsArray,
            serverError,
            isLocked,
            selectedDeliveryId: params?.selectedDeliveryId,
        });
    }

    // RSA Blocked
    // Failed - RSA Locked, RSA Denied serverError, headerText
    function handleAPIException(error) {
        console.log("handleAPIException", error);
        const detailsArray = [];
        const {
            error: {
                serverDate,
                formattedTransactionRefNumber,
                statusDescription,
                additionalStatusDescription,
            },
            message,
            status,
        } = error;
        const errMsg = error?.error?.message;
        const serverError =
            additionalStatusDescription || statusDescription || message || errMsg || "";
        const lockServerError = serverDate ? `Logged out on ${serverDate}` : "Logged out";

        // Default values
        let statusServerError = serverError;
        let statusHeaderText = PAYMENT_FAILED;

        // Check for Ref ID
        if (formattedTransactionRefNumber) {
            detailsArray.push({
                key: "Reference ID",
                value: formattedTransactionRefNumber,
            });
        } else if (verifySSLPaymentResponse?.current?.paymentRef) {
            // Reference ID is better to get from final response. In the event of final response doesn't give reference ID, we get it from the previous response
            detailsArray.push({
                key: "Reference ID",
                value: verifySSLPaymentResponse?.current?.paymentRef,
            });
        }

        // Check for Server Date/Time
        if (serverDate) {
            detailsArray.push({
                key: "Date & time",
                value: serverDate,
            });
        }

        // Header & Desc Text Handling for diff status code
        if (status === 423) {
            // RSA Locked
            statusServerError = lockServerError;
            statusHeaderText = serverError;
        } else if (status === 422) {
            // RSA Denied
            statusServerError = "";
            statusHeaderText = serverError;
        }

        // Navigate to fail status page
        gotoFailStatusPage({
            detailsArray,
            serverError: statusServerError,
            headerText: statusHeaderText,
            isLocked: status === 423,
        });
    }

    // CQ - ChallengeQuestions
    const [showCQLoader, setShowCQLoader] = useState(false);
    const [showCQError, setShowCQError] = useState(false);
    const [isCQRequired, setIsCQRequired] = useState(false);
    const [challenge, setChallenge] = useState(null); // RSA response payload
    const [challengeQuestion, setChallengeQuestion] = useState("");
    const [rsaRetryCount, setRsaRetryCount] = useState(0);
    function resetCQFlags() {
        setShowCQLoader(false);
        setShowCQError(false);
        setIsCQRequired(false);
    }
    function onCQSnackClosePress() {
        setShowCQError(false);
    }
    function onCQSubmitPress(answer) {
        setShowCQLoader(true);
        setShowCQError(false);
        SSLPaymentFunc({
            ...tacParams.current,
            challenge: { ...challenge, answer },
        });
    }

    async function onPressPay() {
        if (!disabled && !_.isEmpty(selectedAccount)) {
            setDisabled(true);
            if (!verifySSLPaymentResponse.current) {
                // Only call this API once in this screen
                try {
                    const response = await verifySSLPayment(getVerifyPaymentReqParam());
                    setDisabled(false);

                    if (response.data.code === 200) {
                        verifySSLPaymentResponse.current = response.data.result;
                    } else {
                        throw new Error({ e: response.data.result.errorStatus });
                    }
                } catch (e) {
                    console.log("SSLCheckoutConfirmation verifySSLPayment e", e);
                    setDisabled(false);
                    showErrorToast({
                        message: e.message,
                    });
                    return;
                }
            }

            if (flow === "S2U") {
                console.log("S2U -> SSLPaymentFunc");
                SSLPaymentFunc({
                    req: {
                        ...getVerifyPaymentReqParam(),
                        twoFAType:
                            params?.secure2uValidateData?.pull === "N"
                                ? "SECURE2U_PUSH"
                                : "SECURE2U_PULL",
                    },
                });
            } else {
                // TAC flow
                tacParams.current = {
                    fundTransferType: "SSL_PAYMENT",
                    accCode: selectedAccount.code,
                    toAcctNo: params?.promoResponse?.merchantAccountNo
                        ? params?.promoResponse?.merchantAccountNo
                        : selectedAccount.number,
                };
                setShowTAC(true);
            }
        }
    }

    function onBackTap() {
        navigation.goBack();
    }
    function onCloseTap() {
        navigation.goBack();
        // navigation.navigate("SSLCheckoutConfirmationTest");
    }
    function onAccountSelect(item) {
        console.log("SSLCheckoutSelectAcc onAccSelect");
        const selectedAccNum = item.number;

        const casaUpdated = casaAccounts.map((item) => {
            return {
                ...item,
                selected: item.number === selectedAccNum,
            };
        });

        setCasaAccounts(casaUpdated);
        setSelectedAccount(item);
    }

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <ScreenLayout
                header={
                    <HeaderLayout
                        backgroundColor={MEDIUM_GREY}
                        headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                        headerCenterElement={
                            <Typo
                                fontSize={16}
                                fontWeight="600"
                                color={BLACK}
                                lineHeight={19}
                                text="Checkout"
                            />
                        }
                        headerRightElement={<HeaderCloseButton onPress={onCloseTap} />}
                    />
                }
                useSafeArea
                neverForceInset={["bottom"]}
                paddingLeft={0}
                paddingRight={0}
                paddingBottom={0}
                paddingTop={12}
            >
                <>
                    <ScrollView
                        refreshControl={<RefreshControl refreshing={false} onRefresh={init} />}
                    >
                        <View style={styles.avatarContCls}>
                            <Image
                                style={styles.imageAvatar}
                                source={assets.SSLCheckoutSelectAccIcon}
                            />
                        </View>

                        <View style={styles.shopNameContainer}>
                            <Typo
                                fontSize={14}
                                fontWeight="semi-bold"
                                lineHeight={18}
                                text={params?.merchantDetail?.shopName}
                            />
                        </View>

                        <View style={styles.amountView}>
                            <Typo fontSize={24} fontWeight="bold" lineHeight={32} text={totalLbl} />
                        </View>

                        <View style={styles.dateView}>
                            <InlineEditor
                                label="Date"
                                value={dateText}
                                componentID="dateText"
                                isEditable={false}
                                editType="press"
                                style={styles.dateText}
                            />
                        </View>

                        <View style={styles.graySeparator} />

                        {/* AccountList */}
                        <View style={styles.accountsView}>
                            <AccountList
                                title={PAY_FROM}
                                data={casaAccounts}
                                onPress={onAccountSelect}
                                // extraData={casaAccounts}
                                paddingLeft={24}
                            />
                        </View>

                        <View style={styles.containerPadding} />
                        <View style={dissolveStyle.scrollPadding} />
                    </ScrollView>
                    <View style={dissolveStyle.imageBackground}>
                        <BottomDissolveCover>
                            <View style={styles.centerContainer}>
                                <ActionButton
                                    style={{ width: width - 50 }}
                                    borderRadius={25}
                                    onPress={onPressPay}
                                    backgroundColor={YELLOW}
                                    componentCenter={
                                        <Typo
                                            text={`Pay • ${totalLbl}`}
                                            fontSize={14}
                                            fontWeight="semi-bold"
                                            lineHeight={18}
                                        />
                                    }
                                />
                            </View>
                        </BottomDissolveCover>
                    </View>

                    {showS2u && (
                        <Secure2uAuthenticationModal
                            token={pollingToken}
                            amount={selectedAmount}
                            onS2UDone={onS2uDone}
                            onS2UClose={onS2uClose}
                            s2uPollingData={params?.secure2uValidateData}
                            transactionDetails={s2uTransactionDetails}
                            extraParams={{
                                metadata: { txnType: "SAMA2LOKAL" },
                            }}
                        />
                    )}

                    {showTAC && (
                        <TacModal
                            tacParams={tacParams.current}
                            validateByOwnAPI={true}
                            validateTAC={onTACDone}
                            onTacClose={onTACClose}
                            onGetTacError={hideTAC}
                        />
                    )}

                    {/* Challenge Question */}
                    <ChallengeQuestion
                        loader={showCQLoader}
                        display={isCQRequired}
                        displyError={showCQError}
                        questionText={challengeQuestion}
                        onSubmitPress={onCQSubmitPress}
                        onSnackClosePress={onCQSnackClosePress}
                    />
                </>
            </ScreenLayout>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    accountsView: {
        paddingTop: 25,
    },
    amountView: { paddingTop: 15 },
    avatarContCls: {
        alignItems: "center",
        justifyContent: "center",
    },

    centerContainer: {
        alignItems: "center",
        flex: 1,
        justifyContent: "center",
    },
    containerPadding: {
        paddingHorizontal: 24,
    },

    dateText: {
        height: 50,
    },

    dateView: {
        height: 20,
        marginBottom: 30,
        marginHorizontal: 24,
        paddingTop: 36,
    },

    graySeparator: {
        borderColor: GREY,
        borderTopWidth: 1,
        height: 1,
        marginHorizontal: 24,
        marginTop: 24,
    },
    imageAvatar: {
        borderRadius: 94 / 2,
        height: 94,
        width: 94,
    },
    shopNameContainer: { paddingHorizontal: 20 },
});

export default withModelContext(SSLCheckoutConfirmation);
