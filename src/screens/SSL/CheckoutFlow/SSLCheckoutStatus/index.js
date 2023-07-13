import AsyncStorage from "@react-native-community/async-storage";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { Alert, Dimensions, StyleSheet, Image, View, ScrollView } from "react-native";

import { PDF_VIEWER, SSL_TAB_SCREEN, SSL_ORDER_DETAILS } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import CacheeImageWithDefault from "@components/CacheeImageWithDefault";
import CustomPdfGenerator from "@components/Common/CustomPdfGenerator";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Typo from "@components/Text";

import { withModelContext } from "@context";

import { checkS2WEarnedChances } from "@services";
import { FACheckoutStatus } from "@services/analytics/analyticsSSL";

import { WHITE, YELLOW, FADE_GREY, MEDIUM_GREY, GREY } from "@constants/colors";
import { FAIL_STATUS, PAYMENT_FAIL, RECEIPT_NOTE, DONE } from "@constants/strings";
import { SAMA_SAMA_LOKAL } from "@constants/stringsSSL";

import { contextCart, getAnalyticsCartList } from "@utils/dataModel/utilitySSL";
import withFestive from "@utils/withFestive";

import Assets from "@assets";

const screenHeight = Dimensions.get("window").height;

class SSLCheckoutStatus extends Component {
    static propTypes = {
        navigation: PropTypes.object,
        route: PropTypes.object,
        getModel: PropTypes.func,
        updateModel: PropTypes.func,
        festiveAssets: PropTypes.object,
    };

    constructor(props) {
        super(props);
        this.state = {
            status: props.route.params?.status ?? FAIL_STATUS, // success | failure
            headerText: props.route.params?.headerText ?? PAYMENT_FAIL,
            detailsArray: props.route.params?.detailsArray ?? false, // Each object must contain key & value
            serverError: props.route.params?.serverError ?? false,
            receiptDetailsArray: props.route.params?.receiptDetailsArray ?? [],
            showShareReceipt: props.route.params?.showShareReceipt ?? false,
            orderId: props.route.params?.orderId ?? "",
        };
        console.log("SSLCheckoutStatus", props.route.params);
        this.setAnalytics();
    }

    componentDidMount() {
        // const {
        //     misc: { isCampaignPeriod, isTapTasticReady },
        // } = this.props.getModel(["misc"]);

        if (this.state.status !== "failure") {
            // Clear cart
            const updateModel = this.props.updateModel;
            const clearedCart = contextCart.generateEmptyCart();
            contextCart.storeCartContextAS({ updateModel, cartObj: clearedCart, AsyncStorage });
        }

        // this is only for campaign while using tracker and earned entries / chances for user
        // comment it out first, Year End Campaign using push notifications way to show CampaignChancesEarned.js
        // if ((isCampaignPeriod || isTapTasticReady) && this.state.status !== "failure") {
        //     this.checkForEarnedChances();
        // }
    }
    componentWillUnmount() {
        this.timer && clearTimeout(this.timer);
    }
    /**
     * S2W chances earned checkers
     * only check
     */
    checkForEarnedChances = () => {
        // check if campaign is running and check if it matched the list
        // delayed the check a lil bit to let user see the acknowledge screen
        this.timer && clearTimeout(this.timer);

        this.timer = setTimeout(async () => {
            const {
                misc: { isCampaignPeriod, isTapTasticReady, tapTasticType },
                s2w: { txnTypeList },
            } = this.props.getModel(["misc", "s2w"]);
            const txnCode = "M2USAMALKL";

            // s2w ssl
            // Min spend: RM20, No of spin: 1, Unlimited chance
            if ((isCampaignPeriod || isTapTasticReady) && txnTypeList.includes(txnCode)) {
                try {
                    const params = {
                        txnType: txnCode,
                    };

                    const response = await checkS2WEarnedChances(params);

                    if (response) {
                        const { displayPopup, generic, chance } = response.data;
                        console.log("displayPopup", displayPopup, "chance", chance);

                        if (displayPopup) {
                            // go to earned chances screen
                            this.props.navigation.push("TabNavigator", {
                                screen: "CampaignChancesEarned",
                                params: {
                                    chances: chance,
                                    isCapped: generic,
                                    isTapTasticReady,
                                    tapTasticType,
                                },
                            });
                        }
                    }
                } catch (error) {
                    // can't do nothing
                }
            }
        }, 400);
    };

    setAnalytics = () => {
        const { cartV1 } = this.props.getModel("ssl");
        const basketValue = contextCart.basketValue({ cartProducts: cartV1?.cartProducts });
        console.log("setAnalytics", cartV1);
        const cartItems = getAnalyticsCartList({ cartV1 });
        const selectedDeliveryId = this.props.route.params?.selectedDeliveryId;
        const shipping = this.props.route.params?.shipping;
        const detailsArray = this.state.detailsArray;
        FACheckoutStatus.onCheckout({
            shopName: cartV1?.merchantDetail?.shopName,
            promoCodeString: cartV1?.promoCodeString,
            shipping,
            total: parseFloat(basketValue),
            cartItems,
            selectedDeliveryId,
            detailsArray,
            status: this.state.status,
        });
    };

    onShareReceiptTap = async () => {
        console.log("[ReloadStatus] >> [onShareReceiptTap]");
        FACheckoutStatus.onShareReceiptTap();
        // Call custom method to generate PDF
        const file = await CustomPdfGenerator.generateReceipt(
            true,
            SAMA_SAMA_LOKAL,
            true,
            RECEIPT_NOTE,
            this.state.receiptDetailsArray,
            true,
            "success",
            "Successful"
        );
        if (file === null) {
            Alert.alert("Please allow permission");
            return;
        }

        const navParams = {
            file,
            share: true,
            type: "file",
            pdfType: "shareReceipt",
            analyticScreenName: "SSL_Receipt",
        };

        // Navigate to PDF viewer to display PDF
        this.props.navigation.navigate(PDF_VIEWER, navParams);
    };

    onDoneTap = () => {
        if (this.props.route.params?.status === "failure") {
            this.props.navigation.goBack(); // back to cart screen
            return;
        }

        const { updateModel } = this.props;
        updateModel({
            ssl: {
                redirect: { screen: SSL_ORDER_DETAILS, orderId: this.state.orderId },
            },
        });
        this.props.navigation.navigate(SSL_TAB_SCREEN, { isRedirect: true });
    };

    render() {
        const { status, showShareReceipt, serverError, detailsArray, headerText } = this.state;
        const { festiveAssets } = this.props;

        return (
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                <CacheeImageWithDefault
                    style={Style.headerImage}
                    image={festiveAssets?.ssl.background}
                    resizeMethod="resize"
                    resizeMode="stretch"
                />
                <ScreenLayout
                    header={<HeaderLayout />}
                    paddingHorizontal={0}
                    paddingBottom={0}
                    paddingTop={0}
                    useSafeArea
                >
                    <React.Fragment>
                        <ScrollView style={Style.scrollViewCls}>
                            {/* Image Block */}
                            <View style={Style.statusPgImgBlockCls}>
                                <Image
                                    resizeMode="contain"
                                    style={Style.statusIconCls}
                                    source={
                                        status == "failure" ? Assets.icFailedIcon : Assets.icTickNew
                                    }
                                />
                            </View>

                            {/* Desc */}
                            <Typo
                                fontSize={20}
                                fontWeight="300"
                                letterSpacing={0}
                                lineHeight={28}
                                textAlign="left"
                                text={headerText}
                                style={Style.descCls}
                            />

                            {/* Server Error */}
                            <Typo
                                fontSize={12}
                                textAlign="left"
                                color={FADE_GREY}
                                lineHeight={18}
                                text={serverError}
                            />

                            {/* Status Details */}
                            {detailsArray && (
                                <View style={Style.detailsViewCls}>
                                    {detailsArray.map((prop, index) => {
                                        return (
                                            <View style={Style.detailsBlockCls} key={index}>
                                                <Typo
                                                    fontSize={12}
                                                    letterSpacing={0}
                                                    lineHeight={18}
                                                    text={prop.key}
                                                />

                                                <Typo
                                                    fontSize={12}
                                                    fontWeight="600"
                                                    letterSpacing={0}
                                                    lineHeight={18}
                                                    text={prop.value}
                                                />
                                            </View>
                                        );
                                    })}
                                </View>
                            )}
                        </ScrollView>

                        {/* Bottom docked button container */}
                        <FixedActionContainer>
                            <View style={Style.bottomBtnContCls}>
                                {status === "success" && showShareReceipt && (
                                    <ActionButton
                                        height={48}
                                        fullWidth
                                        borderRadius={24}
                                        borderColor={GREY}
                                        borderWidth={1}
                                        backgroundColor={WHITE}
                                        componentCenter={
                                            <Typo
                                                fontSize={14}
                                                fontWeight="600"
                                                lineHeight={18}
                                                text="Share Receipt"
                                            />
                                        }
                                        onPress={this.onShareReceiptTap}
                                        style={Style.statusButton}
                                    />
                                )}

                                <ActionButton
                                    height={48}
                                    fullWidth
                                    borderRadius={24}
                                    backgroundColor={YELLOW}
                                    componentCenter={
                                        <Typo
                                            fontSize={14}
                                            fontWeight="600"
                                            lineHeight={18}
                                            text={DONE}
                                        />
                                    }
                                    onPress={this.onDoneTap}
                                />
                            </View>
                        </FixedActionContainer>
                    </React.Fragment>
                </ScreenLayout>
            </ScreenContainer>
        );
    }
}

const Style = StyleSheet.create({
    bottomBtnContCls: {
        width: "100%",
    },

    descCls: {
        marginBottom: 5,
    },

    detailsBlockCls: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 15,
        marginTop: 10,
        width: "100%",
    },

    detailsViewCls: {
        marginTop: 30,
    },

    headerImage: { height: "22%", position: "absolute", width: "100%" },

    scrollViewCls: {
        paddingHorizontal: 36,
    },

    statusButton: {
        marginBottom: 15,
    },

    statusIconCls: {
        height: 52,
        width: 57,
    },
    statusPgImgBlockCls: {
        marginBottom: 25,
        marginTop: (screenHeight * 10) / 100,
        width: "100%",
    },
});

export default withModelContext(withFestive(SSLCheckoutStatus));
