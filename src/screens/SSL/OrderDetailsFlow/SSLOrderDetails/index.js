import AsyncStorage from "@react-native-community/async-storage";
import Clipboard from "@react-native-community/clipboard";
import { useNavigation, useRoute } from "@react-navigation/core";
import LottieView from "lottie-react-native";
import moment from "moment";
import PropTypes from "prop-types";
import React, { useState, useEffect, useCallback } from "react";
import {
    StyleSheet,
    View,
    TouchableOpacity,
    Image,
    ScrollView,
    Dimensions,
    Linking,
    Platform,
} from "react-native";
import * as Animatable from "react-native-animatable";
import { WebView } from "react-native-webview";

import { SSL_MERCHANT_DETAILS, SSL_RATING } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import HeaderRefreshButton from "@components/Buttons/HeaderRefreshButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import ScreenLoader from "@components/Loaders/ScreenLoader";
import Popup from "@components/Popup";
import OrderFlatList from "@components/SSL/OrderFlatList";
import Typo from "@components/Text";
import { showInfoToast, showSuccessToast, showErrorToast } from "@components/Toast";

import { withModelContext, useModelController } from "@context";

import { getSSLMerchantDetailsV2, getSSLOrderDetail, getSSLProductDetailsV2 } from "@services";
import { FAOrderDetails } from "@services/analytics/analyticsSSL";

import {
    BLACK,
    YELLOW,
    WHITE,
    MEDIUM_GREY,
    SEPARATOR,
    GREY_100,
    LIGHT_GREY,
    ROYAL_BLUE,
    DARK_GREY,
    DUSTY_GRAY,
} from "@constants/colors";
import {
    SSL_CANCEL,
    SSL_NEW_CART,
    SSL_START_NEW_CART,
    SSL_START_NEW_CART_DESC,
    DELIVERY_DISCLAIMER,
    FIND_RIDER_WHEN_ORDER_READY,
    NO_RIDER_ALLOCATED_YET,
    YOU_WILL_BE_REFUNDED_AFTER_1_DAY,
    YOU_WILL_BE_REFUNDED_INSTANTLY,
} from "@constants/stringsSSL";

import { contactBankcall } from "@utils/dataModel/utilityPartial.4";
import {
    contextCart,
    sslOrdersStatusMapping,
    isStartNewCart,
    openWhatsApp,
    SSLUserContacteNoClass,
    keysToCamel,
    syncSelectedOption,
    validateIfOptionStillExist,
    getAllOptionIdInSelectedOption,
} from "@utils/dataModel/utilitySSL";

import assets from "@assets";

// import { Response1, Response2, Response3, Response4 } from "./SSLOrderDetailsDoc";

const { width } = Dimensions.get("window");
const THIRD_PARTY_DELIVERY = 1;
const SELF_DELIVERY = 3;
const DINE_IN = 7;
const PICK_UP = 2;

function SSLOrderDetails() {
    const navigation = useNavigation();
    const route = useRoute();
    const { params } = route;
    const { updateModel, getModel } = useModelController();
    const { sandboxUrl } = getModel("ssl");
    const [isLoading, setIsLoading] = useState(true);
    const [orderDetail, setOrderDetail] = useState({});
    const [isAfterOneDay, setIsAfterOneDay] = useState(false);
    const isCar = orderDetail?.isCar
        ? orderDetail?.isCar
        : orderDetail?.trackOrderRecord?.riderDetails?.vehicleType === "CAR";

    const getOrderDetail = useCallback(async () => {
        try {
            const body = {
                orderId: params?.orderId,
                isMerchant: true,
            };

            const response = await getSSLOrderDetail(body);
            const result = response?.data?.result;

            // Hide rider's contact info one day after the order is created
            const createdDate = result?.createdDate;
            const unixTimestamp = moment(createdDate).unix() * 1000;
            const oneDayDiff = 16 * 60 * 60 * 1000; // OrderDetails = Local, Now = UTC
            const currentDayDiff = Date.now() - unixTimestamp;
            currentDayDiff > oneDayDiff ? setIsAfterOneDay(true) : setIsAfterOneDay(false);

            setOrderDetail(result);
            setIsLoading(false);
        } catch (e) {
            setIsLoading(false);
            showErrorToast({
                message: e.message,
            });
        }
    }, [params?.orderId]);

    // Handle toast navigated from Rating & Review Screen
    useEffect(() => {
        const { setParams } = navigation;
        if (params?.successMessage) {
            setParams({ successMessage: null });
            showSuccessToast({ message: params?.successMessage });
            handleRefresh();
        } else if (params?.errorMessage) {
            setParams({ errorMessage: null });
            showErrorToast({
                message: params?.errorMessage,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params?.successMessage, params?.errorMessage]);

    useEffect(() => {
        getOrderDetail();
        console.log("Order details");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const nonOngoingStatus = [0, 1];
        if (isLoading === false) {
            if (!nonOngoingStatus.includes(orderDetail?.orderStatus)) {
                const interval = setInterval(() => {
                    console.log("call orderDetails every 15 secs");
                    getOrderDetail();
                }, 15000);
                // This represents the unmount function, in which you need to clear your interval to prevent memory leaks.
                return () => clearInterval(interval);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoading]);

    function onContactSupport() {
        const maybankHotline = "1300886688";
        contactBankcall(maybankHotline);
        FAOrderDetails.contactSupport(orderDetail);
    }

    // Reorder func
    const { cartV1 } = getModel("ssl");
    function onPressReOrder() {
        FAOrderDetails.orderAgain(orderDetail);
        const reorderMerchantId = orderDetail.merchantId;
        const cartMerchantId = cartV1?.merchantDetail?.merchantId;
        const cartProducts = cartV1?.cartProducts;
        if (isStartNewCart({ merchantId: reorderMerchantId, cartMerchantId, cartProducts })) {
            setIsShowPopupNewCart(true);
            return;
        }
        reOrderFunc();
    }
    async function reOrderFunc() {
        const { merchantId, products } = orderDetail;

        if (!products?.length || !merchantId) return;
        try {
            const params = {
                latitude: 3.181899, // any lat long will do
                longitude: 101.6938113,
                merchantId,
            };
            const data = await getSSLMerchantDetailsV2({ sandboxUrl, body: params });

            const apiMerchantDetail = data?.data?.result?.merchantDetail;
            const productData = orderDetail?.products;

            productData.map((item) => {
                item?.optionGroup?.map(
                    (optGroup) => (item.selectedOptions = optGroup.selected_options)
                );
                item.count = item.quantity;
            });

            const result = await validateEachItemBeforeAddCart(
                apiMerchantDetail?.merchantId,
                productData
            );

            const syncedCart = contextCart.generateCartWith({
                merchantDetail: apiMerchantDetail,
                isReorder: true,
                productData: result?.validatedProducts,
                promoCodeString: cartV1?.promoCodeString,
            });
            console.log("syncedCart", syncedCart);
            contextCart.storeCartContextAS({ updateModel, cartObj: syncedCart, AsyncStorage });

            navigation.navigate(SSL_MERCHANT_DETAILS, {
                merchantId,
                isOptionUnavailable: result?.isOptionUnavailable,
            });
        } catch (e) {
            showErrorToast({
                message: e.message,
            });
        }
    }

    async function validateEachItemBeforeAddCart(merchantId, products) {
        const { sandboxUrl } = getModel("ssl");
        let validatedProducts = [];
        let isOptionUnavailable = false;
        await Promise.all(
            products.map(async (product, index) => {
                const body = {
                    latitude: 3.181899,
                    longitude: 101.6938113,
                    merchantId: merchantId || "",
                    productId: keysToCamel(product?.productId),
                };
                try {
                    console.log("getSSLProductDetails getProductDetails start");
                    const data = await getSSLProductDetailsV2({ sandboxUrl, body });
                    const productFromCloud = data?.data?.result?.productDetail?.products?.[0];

                    if (validateIfOptionStillExist(product, productFromCloud)) {
                        const syncedSelectedOpt = syncSelectedOption(
                            productFromCloud?.optionGroup,
                            getAllOptionIdInSelectedOption(keysToCamel(product?.optionGroup))
                        );
                        product.selectedOptions = keysToCamel(syncedSelectedOpt);
                        validatedProducts = [...validatedProducts, product];
                    } else {
                        isOptionUnavailable = true;
                    }
                } catch (e) {
                    console.log("SSLProductDetails getProductDetail err", e);
                }
            })
        );
        return { validatedProducts, isOptionUnavailable };
    }

    // Reorder - start new cart? Popup
    const [isShowPopupNewCart, setIsShowPopupNewCart] = useState(false);
    function hideNewCartPopup() {
        setIsShowPopupNewCart(false);
    }
    function startNewCart() {
        setIsShowPopupNewCart(false);
        const emptyCart = contextCart.generateEmptyCart();
        contextCart.storeCartContextAS({ updateModel, cartObj: emptyCart, AsyncStorage });

        reOrderFunc();
    }

    // Other on screen function
    function onPressMerchant() {
        const merchantId = orderDetail?.merchantId;
        navigation.navigate(SSL_MERCHANT_DETAILS, { merchantId });
    }

    function handleRefresh() {
        setIsLoading(true);
        getOrderDetail();
    }

    function handleClose() {
        navigation.pop(2);
    }

    function copyConsignmentNoToClipboard(consignmentNo) {
        Clipboard.setString(consignmentNo ?? "");

        showInfoToast({
            message: "Consignment number copied to clipboard.",
        });
    }

    function copyOrderNoToClipboard(orderId) {
        Clipboard.setString(orderId ?? "");

        showInfoToast({
            message: "Order number copied to clipboard.",
        });
    }

    function onPressRateOrder() {
        FAOrderDetails.onPressRateOrder();
        navigation.navigate(SSL_RATING, {
            orderId: orderDetail?.orderId,
            merchantName: orderDetail?.merchantName,
            outletAddress: orderDetail?.outletAddress,
        });
    }

    const { lottie: lottieUri, text: statusText } = sslOrdersStatusMapping({
        deliveryId: orderDetail?.deliveryId,
        deliveryStatus: orderDetail?.deliveryStatus,
        cancelReason: orderDetail?.cancelReason,
        orderStatus: orderDetail?.orderStatus,
        isCar,
    });
    const subtotal = orderDetail?.netAmt;
    const totalPaid = orderDetail?.totalPaid;
    const merchantDeliveryStatusTip = {
        3: "Have a question about the order status and estimated delivery time? Drop the merchant a message or call.", // confirmed
        2: "Have a question about your order? Drop the merchant a message or call.", // on the way
        1: "Has your order arrived? No? Do contact the merchant for an update.", // completed
    };

    useEffect(() => {
        FAOrderDetails.onScreen(orderDetail);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orderDetail?.orderStatus]);

    const instantDelivery = `Instant Delivery • ${orderDetail?.queueNo}`;
    const otherDelivery = `${orderDetail?.deliveryType} • ${orderDetail?.queueNo}`;
    const dineDelivery = `${orderDetail?.deliveryType} • ${orderDetail?.queueNo} • Table ${orderDetail?.tableNumber}`;
    const differentDelivery = orderDetail?.deliveryId === DINE_IN ? dineDelivery : otherDelivery; // dine in & self delivery
    const deliveryTypeLbl =
        orderDetail?.deliveryId === THIRD_PARTY_DELIVERY ? instantDelivery : differentDelivery;

    const ORDER_CANCELLED = [0, 4];
    const NOT_CANCELLED_NOR_COMPLETED = [1000, 650, 600, 625];
    const ORDER_STATUS = {
        PENDING_ACCEPT: 3,
        READY_PICKUP: 2,
        ORDER_COMPLETED: 1,
        CANCELLED: 0,
        CANCELLED_BY_MERCHANT: 4,
        PREPARING: 7,
        FINDING_RIDER: 8,
    };
    const DELIVERY_STATUS = {
        DELIVERY_START: 600,
        ARRIVED_FOR_DELIVERY: 625,
        FAILED_TO_DELIVER: 650,
        ITEM_DELIVERED_COLLECTED: 700,
        CANCELLED_BY_DELYVA: 900,
        ORDER_COMPLETED: 1000,
    };

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            {isLoading ? (
                // Use this loader instead of context's showLoader because context's showLoader is dismissed when API call success
                <View style={styles.loaderContainer}>
                    <ScreenLoader showLoader />
                </View>
            ) : (
                <ScreenLayout
                    header={
                        <HeaderLayout
                            backgroundColor={MEDIUM_GREY}
                            headerLeftElement={<HeaderRefreshButton onPress={handleRefresh} />}
                            headerCenterElement={
                                <Typo
                                    fontSize={16}
                                    fontWeight="600"
                                    color={BLACK}
                                    lineHeight={19}
                                    text={orderDetail?.queueNo || "Order Details"}
                                />
                            }
                            headerRightElement={<HeaderCloseButton onPress={handleClose} />}
                        />
                    }
                    useSafeArea
                    neverForceInset={["bottom"]}
                    paddingLeft={0}
                    paddingRight={0}
                    paddingBottom={0}
                    paddingTop={0}
                >
                    <ScrollView>
                        {/** Rider's location Webview */}
                        {orderDetail?.deliveryId === 1 &&
                            [600, 625].includes(orderDetail?.deliveryStatus) && (
                                <WebView
                                    style={styles.webview}
                                    source={{ uri: orderDetail?.trackOrderRecord?.deliveryMap }}
                                />
                            )}

                        {/** Lottie View, possibly just check with lottieUri will be sufficient */}
                        {lottieUri && (
                            <Animatable.View delay={600} animation="fadeInUp" useNativeDriver>
                                <LottieView
                                    style={styles.lottieContainer}
                                    source={lottieUri}
                                    autoPlay
                                    loop
                                />
                            </Animatable.View>
                        )}
                        <View style={styles.separator} />

                        <View style={styles.statusContainer}>
                            <View style={styles.statusInnerContainer}>
                                {/** Status , 3rd Party Delivery, Progress bar */}
                                <Typo
                                    fontSize={16}
                                    fontWeight="semi-bold"
                                    textAlign="left"
                                    lineHeight={16}
                                    letterSpacing={0}
                                    text={statusText}
                                />
                                <Typo
                                    fontSize={12}
                                    textAlign="left"
                                    lineHeight={24}
                                    text={deliveryTypeLbl}
                                />
                                <View style={styles.progressBar}>
                                    <View
                                        style={styles.progressBarDynamic(
                                            orderDetail?.deliveryId,
                                            orderDetail?.deliveryStatus,
                                            orderDetail?.orderStatus
                                        )}
                                    />
                                </View>
                                {/* Delivery disclaimer when order is not cancelled or completed */}
                                {orderDetail?.deliveryId === THIRD_PARTY_DELIVERY &&
                                    ![
                                        ORDER_STATUS.CANCELLED,
                                        ORDER_STATUS.CANCELLED_BY_MERCHANT,
                                        ORDER_STATUS.ORDER_COMPLETED,
                                    ].includes(orderDetail?.orderStatus) &&
                                    ![
                                        DELIVERY_STATUS.ORDER_COMPLETED,
                                        DELIVERY_STATUS.FAILED_TO_DELIVER,
                                        DELIVERY_STATUS.DELIVERY_START,
                                        DELIVERY_STATUS.ARRIVED_FOR_DELIVERY,
                                        DELIVERY_STATUS.ITEM_DELIVERED_COLLECTED,
                                    ].includes(orderDetail?.deliveryStatus) && (
                                        <View style={styles.infoTipContainer}>
                                            <Image source={assets.info} />
                                            <Typo
                                                style={styles.infoText}
                                                fontSize={13}
                                                lineHeight={16}
                                                textAlign="left"
                                                text={DELIVERY_DISCLAIMER}
                                            />
                                        </View>
                                    )}
                                {orderDetail?.deliveryId === 3 &&
                                    orderDetail?.orderStatus !== 2 &&
                                    orderDetail?.orderStatus !== 1 && (
                                        <View style={styles.infoTipContainer}>
                                            <Image source={assets.info} />
                                            <Typo
                                                style={styles.infoText}
                                                fontSize={12}
                                                lineHeight={16}
                                                textAlign="left"
                                                text={
                                                    merchantDeliveryStatusTip[
                                                        orderDetail?.orderStatus
                                                    ]
                                                }
                                            />
                                        </View>
                                    )}
                                {(ORDER_CANCELLED.includes(orderDetail?.orderStatus) ||
                                    orderDetail?.deliveryStatus ===
                                        DELIVERY_STATUS.CANCELLED_BY_DELYVA) && (
                                    <View style={styles.infoTipContainer}>
                                        <Image source={assets.info} />
                                        <Typo
                                            style={styles.infoText}
                                            fontSize={12}
                                            lineHeight={16}
                                            textAlign="left"
                                            text={
                                                orderDetail.deliveryStatus ===
                                                DELIVERY_STATUS.CANCELLED_BY_DELYVA
                                                    ? YOU_WILL_BE_REFUNDED_INSTANTLY
                                                    : orderDetail?.cancelReasonCopyRight
                                                    ? orderDetail?.cancelReasonCopyRight
                                                    : orderDetail?.orderStatus ===
                                                      ORDER_STATUS.CANCELLED_BY_MERCHANT
                                                    ? YOU_WILL_BE_REFUNDED_INSTANTLY
                                                    : YOU_WILL_BE_REFUNDED_AFTER_1_DAY
                                            }
                                        />
                                    </View>
                                )}
                            </View>
                            <View style={styles.separatorWMargin1} />
                            <View style={styles.statusInnerContainer}>
                                {orderDetail?.trackOrderRecord?.riderDetails?.name &&
                                ![DELIVERY_STATUS.CANCELLED_BY_DELYVA].includes(
                                    orderDetail.deliveryStatus
                                ) ? (
                                    <>
                                        <RiderInfoCard
                                            isCar={isCar}
                                            iconSource={
                                                isCar ? assets.SSLDeliveryCar : assets.SSLMotorcycle
                                            }
                                            status={orderDetail?.orderStatus}
                                            name={orderDetail?.trackOrderRecord?.riderDetails?.name}
                                            deliveryProvider={orderDetail?.deliveryProvider}
                                            vehicleRegNo={
                                                orderDetail?.trackOrderRecord?.riderDetails
                                                    ?.vehicleRegNo
                                            }
                                            consignmentNo={
                                                orderDetail?.trackOrderRecord?.consignmentNo
                                            }
                                            copyConsignmentNoToClipboard={
                                                copyConsignmentNoToClipboard
                                            }
                                            phone={
                                                orderDetail?.trackOrderRecord?.riderDetails?.phone
                                            }
                                            isAfterOneDay={isAfterOneDay}
                                        />
                                        {/* <View style={styles.separatorWMargin1} /> */}
                                    </>
                                ) : orderDetail?.deliveryId === 1 &&
                                  (orderDetail.orderStatus === 7 ||
                                      orderDetail.orderStatus === 3) ? (
                                    <RiderInfoCard
                                        displayText={FIND_RIDER_WHEN_ORDER_READY}
                                        iconSource={assets.SSLMotorcycle}
                                    />
                                ) : orderDetail?.deliveryId === THIRD_PARTY_DELIVERY &&
                                  [
                                      ORDER_STATUS.FINDING_RIDER,
                                      ORDER_STATUS.CANCELLED,
                                      ORDER_STATUS.CANCELLED_BY_MERCHANT,
                                  ].includes(orderDetail?.orderStatus) ? (
                                    <RiderInfoCard
                                        displayText={NO_RIDER_ALLOCATED_YET}
                                        iconSource={assets.SSLMotorcycle}
                                    />
                                ) : null}
                                {orderDetail?.deliveryId === 4 && (
                                    <>
                                        <EmailInfoCard
                                            iconSource={assets.SSLMail}
                                            email={orderDetail?.addressDetail?.email}
                                        />
                                        <View style={styles.separatorWMargin1} />
                                    </>
                                )}
                                {[1, 3].includes(orderDetail?.deliveryId) && (
                                    <>
                                        <HomeInfoCard
                                            iconSource={assets.SSLHome}
                                            addressDetail={orderDetail?.addressDetail}
                                        />
                                        {/* <View style={styles.separatorWMargin1} /> */}
                                    </>
                                )}
                                <MerchantInfoCard
                                    merchantName={orderDetail?.merchantName}
                                    outletAddress={orderDetail?.outletAddress}
                                    phone={orderDetail?.merchantContactNo}
                                    deliveryId={orderDetail?.deliveryId}
                                    latitude={orderDetail?.addressDetail?.latitude}
                                    longitude={orderDetail?.addressDetail?.longitude}
                                    orderStatus={orderDetail?.orderStatus}
                                    onPressMerchant={onPressMerchant}
                                />
                            </View>
                        </View>

                        {/** Rate Your Order */}
                        {orderDetail?.orderStatus === 1 && orderDetail?.rating === null && (
                            <RateYourOrder
                                title="Tell us how your experience was!"
                                desc="Let us know your feedback by rating your recent transaction to benefit other shoppers like you. "
                                actionBtnLbl="Rate Your Order"
                                onPressRateOrder={onPressRateOrder}
                            />
                        )}

                        {/** Order Summary */}
                        <OrderSummary
                            date={`Placed on ${orderDetail?.createdDate}`}
                            deliveryId={orderDetail?.deliveryId}
                            orderNo={orderDetail?.customerReferenceNo}
                            products={orderDetail?.products}
                            isSst={parseFloat(orderDetail?.taxAmount) > 0}
                            subtotal={subtotal}
                            subTotalLbl="Subtotal"
                            subTotalAmt={`RM ${parseFloat(subtotal).toFixed(2)}`}
                            inclTax={parseFloat(orderDetail?.taxAmount)}
                            inclTaxLbl="Incl. Tax"
                            inclTaxAmt={`RM ${parseFloat(orderDetail?.taxAmount).toFixed(2)}`}
                            deliveryChargeLbl="Delivery Fee"
                            deliveryChargeAmt={`RM ${parseFloat(
                                orderDetail?.deliveryAmount
                            ).toFixed(2)}`}
                            processingFee={
                                orderDetail?.processingFeeAmount ??
                                orderDetail?.taxProcessingFeeAmount
                            }
                            processingFeeLbl="Processing Fee"
                            processingFeeAmt={`RM ${
                                parseFloat(orderDetail?.processingFeeAmount).toFixed(2) ??
                                parseFloat(orderDetail?.taxProcessingFeeAmount).toFixed(2)
                            }`}
                            discountLbl="Cart Discount"
                            discountAmt={orderDetail?.discountAmt}
                            deliveryDiscountLbl="Delivery Discount"
                            deliveryDiscountAmt={orderDetail?.deliveryDiscountValue}
                            totalPaidLbl="Total Paid"
                            totalPaidAmt={`RM ${parseFloat(totalPaid).toFixed(2)}`}
                            copyOrderNoToClipboard={copyOrderNoToClipboard}
                        />

                        {/** Recipient Info */}
                        <RecipientInfo
                            recipientName={orderDetail?.recipientName}
                            customerName={orderDetail?.customerName}
                            contactNo={SSLUserContacteNoClass(
                                orderDetail?.addressDetail?.contactNo
                            ).inFullDisplayFormat()}
                            email={orderDetail?.addressDetail?.email}
                        />

                        <View style={styles.centerContainer}>
                            <ActionButton
                                style={styles.whiteButton}
                                borderRadius={25}
                                onPress={onContactSupport}
                                backgroundColor={WHITE}
                                componentCenter={
                                    <Typo
                                        fontSize={14}
                                        fontWeight="semi-bold"
                                        lineHeight={18}
                                        text="Contact Support"
                                    />
                                }
                            />
                            {[1, 0].includes(orderDetail?.orderStatus) && (
                                <ActionButton
                                    style={styles.yellowButton}
                                    borderRadius={25}
                                    onPress={onPressReOrder}
                                    backgroundColor={YELLOW}
                                    componentCenter={
                                        <Typo
                                            fontSize={14}
                                            fontWeight="semi-bold"
                                            lineHeight={18}
                                            text="Order Again"
                                        />
                                    }
                                />
                            )}
                        </View>
                    </ScrollView>
                </ScreenLayout>
            )}
            <Popup
                visible={isShowPopupNewCart}
                title={SSL_START_NEW_CART}
                description={SSL_START_NEW_CART_DESC}
                onClose={hideNewCartPopup}
                primaryAction={{
                    text: SSL_NEW_CART,
                    onPress: startNewCart,
                }}
                secondaryAction={{
                    text: SSL_CANCEL,
                    onPress: hideNewCartPopup,
                }}
            />
        </ScreenContainer>
    );
}

function RiderInfoCard({
    isCar,
    iconSource,
    status,
    name,
    deliveryProvider,
    vehicleRegNo,
    consignmentNo,
    copyConsignmentNoToClipboard,
    phone,
    isAfterOneDay,
    displayText,
}) {
    function onPressConsignmentNo() {
        copyConsignmentNoToClipboard(consignmentNo);
    }

    function onPressMsg() {
        openWhatsApp({
            phone,
        });
    }
    function onPressCall() {
        contactBankcall(phone);
    }

    let deliveryProvider_vehicleRegNo = "";
    if (deliveryProvider && !vehicleRegNo) {
        deliveryProvider_vehicleRegNo = deliveryProvider;
    } else if (!deliveryProvider && vehicleRegNo) {
        deliveryProvider_vehicleRegNo = vehicleRegNo;
    } else if (deliveryProvider && vehicleRegNo) {
        deliveryProvider_vehicleRegNo = deliveryProvider + " • " + vehicleRegNo;
    }

    return (
        <>
            <View style={styles.riderContainer}>
                <Image source={iconSource} style={styles.orderDetailsIcon} />
                {displayText ? (
                    <View style={styles.findingRiderContainer}>
                        <Typo fontSize={14} textAlign="left" text={displayText} />
                    </View>
                ) : status === 3 ? (
                    <View style={styles.findingRiderContainer}>
                        <Typo
                            fontSize={14}
                            textAlign="left"
                            text={isCar ? "No driver allocated yet" : "No rider allocated yet"}
                        />
                    </View>
                ) : (
                    <>
                        <View style={styles.riderMidContainer}>
                            <Typo
                                fontSize={14}
                                fontWeight="semi-bold"
                                textAlign="left"
                                lineHeight={17}
                                letterSpacing={0}
                                text={name}
                            />
                            <Typo
                                fontSize={12}
                                textAlign="left"
                                lineHeight={17}
                                letterSpacing={0}
                                text={deliveryProvider_vehicleRegNo}
                            />
                            {!!consignmentNo && (
                                <TouchableOpacity onPress={onPressConsignmentNo}>
                                    <Typo
                                        color={ROYAL_BLUE}
                                        fontSize={12}
                                        textAlign="left"
                                        lineHeight={17}
                                        letterSpacing={0}
                                        fontWeight="semi-bold"
                                        text={consignmentNo}
                                    />
                                </TouchableOpacity>
                            )}
                        </View>
                        <View style={styles.buttonsContainer}>
                            {!isAfterOneDay && (
                                <>
                                    <TouchableOpacity onPress={onPressMsg}>
                                        <Image
                                            source={assets.SSLWhatsapp}
                                            style={styles.chatIcon}
                                        />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={onPressCall}>
                                        <Image source={assets.SSLPhone} style={styles.phoneIcon} />
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    </>
                )}
            </View>
            <View style={styles.separatorWMargin1} />
        </>
    );
}

RiderInfoCard.propTypes = {
    isCar: PropTypes.bool,
    iconSource: PropTypes.any,
    status: PropTypes.number,
    name: PropTypes.string,
    deliveryProvider: PropTypes.string,
    vehicleRegNo: PropTypes.string,
    consignmentNo: PropTypes.string,
    copyConsignmentNoToClipboard: PropTypes.func,
    phone: PropTypes.string,
    isAfterOneDay: PropTypes.bool,
    displayText: PropTypes.string,
};

function EmailInfoCard({ iconSource, email }) {
    return (
        <>
            <View style={styles.emailContainer}>
                <Image source={iconSource} style={styles.emailIcon} />
                <View>
                    <Typo
                        fontSize={14}
                        fontWeight="semi-bold"
                        textAlign="left"
                        lineHeight={17}
                        letterSpacing={0}
                        text={email}
                    />
                    <Typo
                        fontSize={12}
                        textAlign="left"
                        lineHeight={17}
                        letterSpacing={0}
                        text="Email Recipient"
                    />
                </View>
            </View>
        </>
    );
}

EmailInfoCard.propTypes = {
    iconSource: PropTypes.any,
    email: PropTypes.string,
};

function HomeInfoCard({ iconSource, addressDetail }) {
    return (
        <>
            <View style={styles.addressContainer}>
                <Image source={iconSource} style={styles.orderDetailsIcon} />
                <View>
                    <Typo
                        style={styles.address}
                        fontSize={12}
                        textAlign="left"
                        lineHeight={16}
                        letterSpacing={0}
                        text={`${addressDetail?.address} ${addressDetail?.postcode} ${addressDetail?.state}`}
                    />
                    {!!addressDetail?.noteToRider && (
                        <Typo
                            style={styles.address}
                            fontSize={12}
                            fontWeight="400"
                            lineHeight={19}
                            textAlign="left"
                            color={DARK_GREY}
                            text={`Rider Note: "${addressDetail?.noteToRider}"`}
                        />
                    )}
                </View>
            </View>
            <View style={styles.separatorWMargin1} />
        </>
    );
}

HomeInfoCard.propTypes = {
    iconSource: PropTypes.any,
    addressDetail: PropTypes.any,
};

function MerchantInfoCard({
    merchantName,
    outletAddress,
    phone,
    deliveryId,
    latitude,
    longitude,
    onPressMerchant,
    orderStatus,
}) {
    function onPressMsg() {
        openWhatsApp({
            phone,
        });
    }

    function onPressCall() {
        FAOrderDetails.onPressCall(orderStatus);
        contactBankcall(phone);
    }
    function onPressMap() {
        const scheme = Platform.select({ ios: "maps:0,0?q=", android: "geo:0,0?q=" });
        const latLng = `${latitude},${longitude}`;
        const label = encodeURIComponent(`${merchantName}\n${outletAddress}`);
        const url = Platform.select({
            ios: `${scheme}${label}@${latLng}`,
            android: `${scheme}${latLng}(${label})`,
        });

        url && Linking.openURL(url);
    }
    return (
        <>
            <View style={styles.merchantContainer}>
                <TouchableOpacity onPress={onPressMerchant}>
                    <Image source={assets.SSLShoppingBag} style={styles.orderDetailsIcon} />
                </TouchableOpacity>
                <View style={styles.merchantMidContainer}>
                    <TouchableOpacity onPress={onPressMerchant}>
                        <Typo
                            style={styles.address}
                            fontWeight="semi-bold"
                            fontSize={14}
                            textAlign="left"
                            lineHeight={16}
                            letterSpacing={0}
                            color={ROYAL_BLUE}
                            text={merchantName}
                        />
                        <Typo
                            style={styles.merchantAddress}
                            fontSize={12}
                            textAlign="left"
                            lineHeight={16}
                            letterSpacing={0}
                            text={outletAddress}
                        />
                    </TouchableOpacity>

                    {deliveryId === PICK_UP ||
                        (deliveryId === DINE_IN && (
                            <TouchableOpacity onPress={onPressMap}>
                                <View style={styles.getDirections}>
                                    <Typo
                                        fontSize={12}
                                        fontWeight="semi-bold"
                                        text="Get Directions"
                                    />
                                </View>
                            </TouchableOpacity>
                        ))}
                </View>
                <View style={styles.buttonsContainer}>
                    {!!phone && (
                        <>
                            <TouchableOpacity onPress={onPressMsg}>
                                <Image source={assets.SSLWhatsapp} style={styles.chatIcon} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={onPressCall}>
                                <Image source={assets.SSLPhone} style={styles.phoneIcon} />
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </View>
            <View style={styles.separatorWMargin1} />
        </>
    );
}

MerchantInfoCard.propTypes = {
    merchantName: PropTypes.string,
    outletAddress: PropTypes.string,
    phone: PropTypes.string,
    deliveryId: PropTypes.number,
    latitude: PropTypes.string,
    longitude: PropTypes.string,
    onPressMerchant: PropTypes.func,
    orderStatus: PropTypes.number,
};

function RateYourOrder({ title, desc, actionBtnLbl, onPressRateOrder }) {
    function onPress() {
        onPressRateOrder();
    }
    return (
        <>
            <View style={styles.rateContainer}>
                <Typo
                    style={styles.rateTitle}
                    fontSize={14}
                    fontWeight="semi-bold"
                    lineHeight={17}
                    textAlign="left"
                    text={title}
                />
                <Typo style={styles.rateDesc} textAlign="left" lineHeight={17} text={desc} />
                <ActionButton
                    style={styles.rateButton}
                    borderRadius={25}
                    onPress={onPress}
                    backgroundColor={YELLOW}
                    componentCenter={
                        <Typo
                            fontSize={12}
                            fontWeight="semi-bold"
                            lineHeight={18}
                            text={actionBtnLbl}
                        />
                    }
                />
            </View>
            <View style={styles.separatorWMargin1} />
        </>
    );
}

RateYourOrder.propTypes = {
    title: PropTypes.string,
    desc: PropTypes.string,
    actionBtnLbl: PropTypes.func,
    onPressRateOrder: PropTypes.func,
};

function OrderSummary({
    date,
    orderNo,
    deliveryId,
    products,
    isSst,
    subtotal,
    subTotalLbl,
    subTotalAmt,
    inclTax,
    inclTaxLbl,
    inclTaxAmt,
    deliveryChargeLbl,
    deliveryChargeAmt,
    processingFee,
    processingFeeLbl,
    processingFeeAmt,
    discountLbl,
    discountAmt,
    deliveryDiscountLbl,
    deliveryDiscountAmt,
    totalPaidLbl,
    totalPaidAmt,
    copyOrderNoToClipboard,
}) {
    function onPressOrderNo() {
        copyOrderNoToClipboard(orderNo);
    }

    return (
        <View style={styles.orderContainer}>
            <Typo fontSize={14} fontWeight="semi-bold" textAlign="left" text="Order Summary" />
            <View style={styles.orderSummarSub}>
                <Typo fontSize={10} textAlign="left" lineHeight={17} text={date} />
                <TouchableOpacity onPress={onPressOrderNo}>
                    <Typo
                        fontSize={10}
                        textAlign="right"
                        lineHeight={17}
                        color={ROYAL_BLUE}
                        fontWeight="semi-bold"
                        text={`Order #${orderNo}`}
                    />
                </TouchableOpacity>
            </View>
            <View style={styles.arbitraryHeight(20)} />
            <OrderFlatList
                items={products}
                isSst={isSst}
                sstPercentage={parseFloat(inclTax) / (parseFloat(subtotal) - parseFloat(inclTax))}
            />
            <View style={styles.separatorWMargin1} />
            <View style={styles.arbitraryHeight(23)} />
            <View style={styles.inlineRow}>
                <Typo fontSize={12} text={subTotalLbl} />
                <Typo fontSize={12} fontWeight="semi-bold" text={subTotalAmt} />
            </View>
            {inclTax > 0 && (
                <>
                    <View style={styles.arbitraryHeight(8)} />
                    <View style={styles.inlineRow}>
                        <Typo fontSize={12} color={DUSTY_GRAY} text={inclTaxLbl} />
                        <Typo
                            fontSize={12}
                            color={DUSTY_GRAY}
                            fontWeight="semi-bold"
                            text={inclTaxAmt}
                        />
                    </View>
                </>
            )}
            {!!discountAmt && parseFloat(discountAmt) > 0 && (
                <>
                    <View style={styles.arbitraryHeight(8)} />
                    <View style={styles.inlineRow}>
                        <Typo fontSize={12} text={discountLbl} />
                        <Typo
                            fontSize={12}
                            fontWeight="semi-bold"
                            text={`-RM ${parseFloat(discountAmt).toFixed(2)}`}
                        />
                    </View>
                </>
            )}
            {[THIRD_PARTY_DELIVERY, SELF_DELIVERY].includes(deliveryId) && (
                <>
                    <View style={styles.arbitraryHeight(8)} />
                    <View style={styles.inlineRow}>
                        <Typo fontSize={12} text={deliveryChargeLbl} />
                        <Typo fontSize={12} fontWeight="semi-bold" text={deliveryChargeAmt} />
                    </View>
                </>
            )}
            {!!deliveryDiscountAmt && parseFloat(deliveryDiscountAmt) > 0 && (
                <>
                    <View style={styles.arbitraryHeight(8)} />
                    <View style={styles.inlineRow}>
                        <Typo fontSize={12} text={deliveryDiscountLbl} />
                        <Typo
                            fontSize={12}
                            fontWeight="semi-bold"
                            text={`-RM ${parseFloat(deliveryDiscountAmt).toFixed(2)}`}
                        />
                    </View>
                </>
            )}
            {parseFloat(processingFee) > 0 && (
                <>
                    <View style={styles.arbitraryHeight(8)} />
                    <View style={styles.inlineRow}>
                        <Typo fontSize={12} text={processingFeeLbl} />
                        <Typo fontSize={12} fontWeight="semi-bold" text={processingFeeAmt} />
                    </View>
                </>
            )}
            <View style={styles.arbitraryHeight(17)} />
            <View style={styles.inlineRow}>
                <Typo fontSize={14} fontWeight="semi-bold" lineHeight={16} text={totalPaidLbl} />
                <Typo fontSize={14} fontWeight="semi-bold" lineHeight={16} text={totalPaidAmt} />
            </View>
        </View>
    );
}

OrderSummary.propTypes = {
    date: PropTypes.string,
    orderNo: PropTypes.string,
    deliveryId: PropTypes.number,
    products: PropTypes.any,
    subTotalLbl: PropTypes.string,
    subTotalAmt: PropTypes.string,
    deliveryChargeLbl: PropTypes.string,
    deliveryChargeAmt: PropTypes.string,
    discountLbl: PropTypes.string,
    discountAmt: PropTypes.number,
    deliveryDiscountLbl: PropTypes.string,
    deliveryDiscountAmt: PropTypes.number,
    totalPaidLbl: PropTypes.string,
    totalPaidAmt: PropTypes.string,
    copyOrderNoToClipboard: PropTypes.func,
    isSst: PropTypes.bool,
    inclTax: PropTypes.string,
    inclTaxLbl: PropTypes.string,
    inclTaxAmt: PropTypes.number,
    subtotal: PropTypes.string,
    processingFee: PropTypes.string,
    processingFeeLbl: PropTypes.string,
    processingFeeAmt: PropTypes.string,
};

function RecipientInfo({ recipientName, customerName, contactNo, email }) {
    return (
        <>
            <View style={styles.separatorWMargin1} />
            <View style={styles.recipientContainer}>
                <View style={styles.arbitraryHeight(23)} />
                <View style={styles.inlineRow}>
                    <Typo fontSize={12} lineHeight={16} text="Recipient Name" />
                    <Typo
                        fontSize={12}
                        fontWeight="semi-bold"
                        text={recipientName ?? customerName}
                    />
                </View>
                <View style={styles.arbitraryHeight(8)} />
                <View style={styles.inlineRow}>
                    <Typo fontSize={12} lineHeight={16} text="Contact Number" />
                    <Typo fontSize={12} fontWeight="semi-bold" text={contactNo} />
                </View>
                <View style={styles.arbitraryHeight(8)} />
                <View style={styles.inlineRow}>
                    <Typo fontSize={12} lineHeight={16} text="Email Address" />
                    <Typo
                        fontSize={12}
                        fontWeight="semi-bold"
                        style={styles.emailText}
                        text={email}
                    />
                </View>
            </View>
        </>
    );
}

RecipientInfo.propTypes = {
    recipientName: PropTypes.string,
    customerName: PropTypes.string,
    contactNo: PropTypes.string,
    email: PropTypes.string,
};

const styles = StyleSheet.create({
    address: {
        flexWrap: "wrap",
        marginRight: 24,
    },
    addressContainer: {
        flex: 1,
        flexDirection: "row",
        marginTop: 24,
        marginRight: 24,
    },
    arbitraryHeight: (height) => {
        return { height };
    },
    buttonsContainer: {
        flex: 1,
        flexDirection: "row",
        marginTop: 10,
        justifyContent: "space-between",
    },
    centerContainer: {
        alignItems: "center",
        flex: 1,
        justifyContent: "center",
    },
    chatIcon: {
        height: 24,
        width: 24,
    },
    emailContainer: {
        flex: 1,
        flexDirection: "row",
        paddingTop: 24,
    },
    emailIcon: {
        height: 36,
        marginRight: 16,
        width: 36,
    },
    findingRiderContainer: {
        flex: 1,
        justifyContent: "center",
    },
    getDirections: {
        borderColor: GREY_100,
        borderRadius: 15,
        borderWidth: 1,
        height: 29,
        marginTop: 16,
        paddingBottom: 7,
        paddingTop: 7,
        width: 150,
    },
    infoText: {
        marginLeft: 8,
    },
    infoTipContainer: {
        flex: 1,
        flexDirection: "row",
        marginTop: 16,
        marginRight: 24,
    },
    inlineRow: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    loaderContainer: {
        backgroundColor: MEDIUM_GREY,
        flex: 1,
    },
    lottieContainer: {
        aspectRatio: 1,
        width: "100%",
    },
    merchantAddress: {
        // flex: 1,
        // marginTop: 4,
        // width: "50%",
        // backgroundColor: YELLOW,
    },
    merchantContainer: {
        flex: 1,
        flexDirection: "row",
        marginTop: 24,
        paddingRight: 24,
        justifyContent: "space-between",
    },
    merchantMidContainer: {
        // flex: 1,
        marginTop: 4,
        paddingRight: 24,
        width: "69%",
        // backgroundColor: YELLOW,
    },
    orderContainer: {
        paddingHorizontal: 23,
        paddingTop: 24,
    },
    orderDetailsIcon: {
        height: 36,
        marginRight: 16,
        width: 36,
    },
    orderSummarSub: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    phoneIcon: {
        height: 22,
        marginLeft: 24,
        width: 22,
    },
    progressBar: {
        backgroundColor: LIGHT_GREY,
        borderRadius: 4,
        height: 8,
        marginTop: 8,
    },
    progressBarDynamic: (deliveryId, deliveryStatus, orderStatus) => ({
        backgroundColor: sslOrdersStatusMapping({
            deliveryId,
            deliveryStatus,
            orderStatus,
        }).color,
        borderRadius: 4,
        height: 8,
        width: sslOrdersStatusMapping({ deliveryId, deliveryStatus, orderStatus }).width,
    }),
    rateButton: {
        height: 30,
        marginTop: 16,
        width: 133,
    },
    rateContainer: {
        paddingHorizontal: 24,
    },
    rateDesc: {
        marginTop: 16,
    },
    rateTitle: {
        marginTop: 24,
    },
    recipientContainer: {
        paddingBottom: 44,
        paddingHorizontal: 24,
        paddingTop: 0,
    },
    riderContainer: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        paddingTop: 24,
        paddingRight: 24,
    },
    riderMidContainer: {
        justifyContent: "space-between",
        paddingRight: 24,
        width: "69%",
    },
    separator: {
        backgroundColor: SEPARATOR,
        height: 1,
    },
    separatorWMargin1: {
        backgroundColor: SEPARATOR,
        height: 1,
        marginTop: 25,
    },
    statusContainer: {
        backgroundColor: WHITE,
        paddingTop: 24,
    },
    statusInnerContainer: {
        paddingHorizontal: 24,
    },
    webview: {
        flex: 1,
        height: 311,
        opacity: 0.99,
        width: "100%",
    },
    whiteButton: {
        borderColor: GREY_100,
        borderWidth: 1,
        marginBottom: 16,
        width: width - 50,
    },
    yellowButton: {
        marginBottom: 36,
        width: width - 50,
    },
    emailText: {
        flexWrap: "wrap",
        maxWidth: "68%",
        textAlign: "right",
    },
});

export default withModelContext(SSLOrderDetails);
