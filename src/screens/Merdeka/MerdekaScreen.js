import PropTypes from "prop-types";
import React, { useState, useCallback } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import Share from "react-native-share";

import {
    FUNDTRANSFER_MODULE,
    PAYBILLS_LANDING_SCREEN,
    PAYBILLS_MODULE,
    RELOAD_MODULE,
    RELOAD_SELECT_TELCO,
    SSL_START,
    SSL_STACK,
    TABUNG_MAIN,
    TABUNG_STACK,
    TABUNG_TAB_SCREEN,
    TICKET_STACK,
    TRANSFER_TAB_SCREEN,
    WETIX_INAPP_WEBVIEW_SCREEN,
    SETTINGS_MODULE,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import MerdekaOptionCard from "@components/Cards/ContentCard/MerdekaOptionCard";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { withModelContext, useModelController } from "@context";

import { BLACK } from "@constants/colors";
import { REFER_FRIEND } from "@constants/strings";

import { tapTasticAssets } from "@assets";

const styles = StyleSheet.create({
    asnb: {
        height: 8,
        marginLeft: 10,
        marginTop: 27,
        width: 32,
    },
    bill: {
        height: 32,
        marginLeft: 12,
        marginTop: 17,
        width: 28,
    },
    container: {
        flex: 1,
        justifyContent: "center",
    },
    contents: {
        flexDirection: "row",
        marginLeft: 10,
        marginTop: 10,
    },
    credit: {
        height: 26,
        marginLeft: 18,
        marginTop: 15,
        width: 20,
    },
    header: {
        height: 50,
    },
    movie: {
        height: 27,
        marginLeft: 15,
        marginTop: 17,
        width: 23,
    },
    share: {
        height: 33,
        marginLeft: 14,
        marginTop: 14,
        width: 33,
    },
    ssl: {
        height: 28,
        marginLeft: 12,
        marginTop: 17,
        width: 30,
    },
});
function Merdeka({ navigation }) {
    const [showPopup, setPopup] = useState(false);
    const [item, setItem] = useState("");
    const { getModel } = useModelController();
    const {
        qrPay: { isEnabled: qrEnabled },
        misc: { isTapTasticReady },
    } = getModel(["auth", "qrPay", "misc"]);
    const shareMessage = {
        default: `The MAE app makes handling all my money moments even easier! It’s got key M2U banking features, an expense tracker, Tabung to help me save and more. Download today to give it a go.`,
        campaign: `The MAE app makes handling all my money moments even easier! It’s got key M2U banking features, an expense tracker, Tabung to help me save and more. Download today and use code JOMMAE to get rewarded with RM5.`,
    };
    function handleBack() {
        navigation.canGoBack() && navigation.goBack();
    }
    const handleReferShare = useCallback(async () => {
        // show share action sheet.
        const shareOptions = {
            title: "Refer Friends",
            subject: "Refer Friends",
            message: isTapTasticReady ? shareMessage.campaign : shareMessage.default,
            failOnCancel: false,
        };
        try {
            const share = await Share.open(shareOptions);
            if (share) {
                console.tron.log(share);
            }
        } catch (error) {
            console.tron.log(error);
            showErrorToast({
                message: "Unable to share.",
            });
        }
    }, [isTapTasticReady, shareMessage.campaign, shareMessage.default]);
    function navigateToModule() {
        switch (item) {
            case "SCAN_PAY":
                handleRedirection({
                    stack: "QrStack",
                    screen: qrEnabled ? "QrMain" : "QrStart",
                    params: {
                        primary: true,
                        settings: false,
                        fromRoute: "",
                        fromStack: "",
                        quickAction: true,
                    },
                });
                break;
            case "SSL":
                handleRedirection({
                    stack: SSL_STACK,
                    screen: SSL_START,
                });
                break;
            case "ASNB":
                handleRedirection({
                    stack: FUNDTRANSFER_MODULE,
                    screen: TRANSFER_TAB_SCREEN,
                    params: {
                        isNewASNBTransferEntryPoint: true,
                        screenDate: { routeFrom: "MerdekaScreen" },
                    },
                });
                break;
            case "FPX":
                handleRedirection({
                    stack: FUNDTRANSFER_MODULE,
                    screen: TRANSFER_TAB_SCREEN,
                    params: { index: 2, screenDate: { routeFrom: "MerdekaScreen" } },
                });
                break;
            case "PAY_BILLS":
                handleRedirection({
                    stack: PAYBILLS_MODULE,
                    screen: PAYBILLS_LANDING_SCREEN,
                    params: { data: null },
                });
                break;
            case "TABUNG":
                handleRedirection({
                    stack: TABUNG_STACK,
                    screen: TABUNG_MAIN,
                    params: {
                        screen: TABUNG_TAB_SCREEN,
                    },
                });
                break;
            case "MOVIE_TICKET":
                handleRedirection({
                    stack: TICKET_STACK,
                    screen: WETIX_INAPP_WEBVIEW_SCREEN,
                });
                break;
            case "RELOAD":
                handleRedirection({
                    stack: RELOAD_MODULE,
                    screen: RELOAD_SELECT_TELCO,
                    params: {},
                });
                break;
            case "SHARE":
                // setTimeout(function () {
                //     handleReferShare();
                // }, 300);
                handleRedirection({
                    stack: SETTINGS_MODULE,
                    screen: "Referral",
                });
                break;
            default:
                break;
        }
        setPopup(false);
    }
    const onListTap = useCallback((data) => {
        setPopup(true);
        setItem(data);
    }, []);
    const closePopup = () => {
        setPopup(false);
    };
    const getPopupState = () => {
        switch (item) {
            case "SCAN_PAY":
                return {
                    visible: true,
                    title: "Win a Proton X50 \n& cashback with Scan & Pay",
                    description:
                        "Scan & Pay with MAE at over 350,000 merchants nationwide (Starbucks, AEON and more) for a chance to win a car! No minimum spend required.\n\nYou can also get up to RM3 cashback when you spend a minimum of RM20 (enjoy up to 3 times).",
                    onClose: closePopup,
                    primaryAction: {
                        text: "Scan & Pay Now",
                        onPress: navigateToModule,
                    },
                };
            case "SSL":
                return {
                    visible: true,
                    title: "65% OFF Sama-Sama Lokal food & grocery orders",
                    description:
                        "Stock up on your favourite meals, groceries & more with 65% OFF your orders on Sama-Sama Lokal.\n\nUse promo code ‘MALAYSIA65’.",
                    onClose: closePopup,
                    primaryAction: {
                        text: "Order Now",
                        onPress: navigateToModule,
                    },
                };
            case "ASNB":
                return {
                    visible: true,
                    title: "Win your share of RM1 MILLION when you invest in ASNB",
                    description:
                        "Invest a minimum of RM10 in ASNB and earn chances to win up to RM1 MILLION. Continue to perform top ups to gain even more chances!",
                    onClose: closePopup,
                    primaryAction: {
                        text: "Deposit Now",
                        onPress: navigateToModule,
                    },
                };
            case "FPX":
                return {
                    visible: true,
                    title: "Win RM1,000 Shopee vouchers when you Transfer or use FPX",
                    description:
                        "Perform a minimum transaction of RM10 using Maybank2u or MAE for your FPX transactions or online transfers and stand a chance to win RM1,000 Shopee vouchers! You can earn more chances by making more transactions.",
                    onClose: closePopup,
                    primaryAction: {
                        text: "Transact Now",
                        onPress: navigateToModule,
                    },
                };
            case "PAY_BILLS":
                return {
                    visible: true,
                    title: "Win 1-year’s worth of bills on us or 50% OFF",
                    description:
                        "Pay your bills with a minimum of RM10 for a chance to be the lucky winner to get 1-year’s worth of bills covered by us or a chance to enjoy 50% OFF your bills.",
                    onClose: closePopup,
                    primaryAction: {
                        text: "Pay Bill Now",
                        onPress: navigateToModule,
                    },
                };
            case "TABUNG":
                return {
                    visible: true,
                    title: "Win gadgets & vouchers when you set up & save with Tabung",
                    description:
                        "Save up for your wishlist and win attractive prizes like iPhone 13 Pro Max, AirPods Pro & AEON vouchers.\n\nCreate your Individual Tabung with a minimum goal of RM500 and activate any booster to achieve your goal faster. \n\nYou have to complete the goal within a span of 3 months without withdrawing money during this period.",
                    onClose: closePopup,
                    primaryAction: {
                        text: "Create a Tabung Now",
                        onPress: navigateToModule,
                    },
                };
            case "MOVIE_TICKET":
                return {
                    visible: true,
                    title: "GSC movie ticket at RM6.50 when you purchase via WeTix",
                    description:
                        "Catch the latest blockbuster movies for only RM6.50 when you purchase a GSC standard hall ticket on Wednesdays. Limited to the first 65 customers every Wednesday only.\n\nYou can also enjoy a special rate of RM16.50 for any standard hall movie for the whole month. Limited to 1,000 tickets per day throughout campaign period.",
                    onClose: closePopup,
                    primaryAction: {
                        text: "Buy Now",
                        onPress: navigateToModule,
                    },
                };
            case "RELOAD":
                return {
                    visible: true,
                    title: "Win 100% mobile credit-back when you Reload ",
                    description:
                        "Top up your prepaid with a minimum of RM10 for a chance to win 100% mobile credit-back.",
                    onClose: closePopup,
                    primaryAction: {
                        text: "Reload Now",
                        onPress: navigateToModule,
                    },
                };
            case "SHARE":
                return {
                    visible: true,
                    title: REFER_FRIEND,
                    description:
                        "Just get them to sign up for a new MAE account with your referral code and you both instantly receive RM3.",
                    onClose: closePopup,
                    primaryAction: {
                        text: "Refer Now",
                        onPress: navigateToModule,
                    },
                };
            default:
                return {
                    visible: false,
                };
        }
    };
    const handleRedirection = useCallback(
        ({ stack = null, screen, params = {} }) => {
            if (stack) {
                navigation.push(stack, {
                    screen,
                    params,
                });
            } else if (screen) {
                navigation.push(screen, params);
            }
        },
        [navigation]
    );
    return (
        <ScreenContainer
            backgroundType="image"
            backgroundImage={tapTasticAssets.merdeka.landingPage}
            analyticScreenName="Settings_Profile_ReferralCode"
        >
            <ScreenLayout
                paddingBottom={0}
                paddingHorizontal={0}
                neverForceInset={["bottom"]}
                useSafeArea
                paddingTop={0}
                header={
                    <HeaderLayout
                        headerCenterElement={
                            <Typo
                                text="MAE-raikan Malaysia"
                                fontWeight="600"
                                fontSize={16}
                                lineHeight={19}
                            />
                        }
                        headerLeftElement={<HeaderBackButton onPress={handleBack} />}
                    />
                }
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scroller}
                >
                    <View style={styles.container}>
                        <Typo
                            color={BLACK}
                            fontSize={16}
                            fontWeight="500"
                            lineHeight={24}
                            style={styles.header}
                            text={`Enjoy deals of up to 65% OFF,\n win a Proton X50 and more!`}
                        />
                        <View style={styles.contents}>
                            <MerdekaOptionCard
                                title={`Win a Proton X50`}
                                description={`& cashback with\n Scan & Pay`}
                                image={tapTasticAssets.merdeka.splogo}
                                value="SCAN_PAY"
                                onCardPressed={onListTap}
                            />
                            <MerdekaOptionCard
                                iconStyle={styles.ssl}
                                title={`65% OFF `}
                                description={`Sama-Sama Lokal\nfood & grocery \norders`}
                                image={tapTasticAssets.merdeka.ssl}
                                value="SSL"
                                onCardPressed={onListTap}
                            />
                        </View>
                        <View style={styles.contents}>
                            <MerdekaOptionCard
                                iconStyle={styles.asnb}
                                title={`Win your share \nof RM1 MILLION`}
                                description={`when you invest \nin ASNB`}
                                image={tapTasticAssets.merdeka.vector}
                                value="ASNB"
                                onCardPressed={onListTap}
                            />
                            <MerdekaOptionCard
                                iconStyle={styles.ssl}
                                title={"Win RM1,000 \nShopee vouchers"}
                                description={`when you Transfer \nor use FPX`}
                                image={tapTasticAssets.merdeka.transactLogo}
                                value="FPX"
                                onCardPressed={onListTap}
                            />
                        </View>
                        <View style={styles.contents}>
                            <MerdekaOptionCard
                                iconStyle={styles.bill}
                                title={`Win 1-year’s worth \nof bills on us`}
                                description={`or 50% OFF`}
                                image={tapTasticAssets.merdeka.bill}
                                value="PAY_BILLS"
                                onCardPressed={onListTap}
                            />
                            <MerdekaOptionCard
                                iconStyle={styles.ssl}
                                title={`Win gadgets\n & vouchers`}
                                description={`when you set up & \nsave with Tabung`}
                                image={tapTasticAssets.merdeka.others}
                                value="TABUNG"
                                onCardPressed={onListTap}
                            />
                        </View>
                        <View style={styles.contents}>
                            <MerdekaOptionCard
                                iconStyle={styles.movie}
                                title={`GSC movie ticket \nat RM6.50`}
                                description={`when you purchase \nvia WeTix`}
                                image={tapTasticAssets.merdeka.movie}
                                value="MOVIE_TICKET"
                                onCardPressed={onListTap}
                            />
                            <MerdekaOptionCard
                                iconStyle={styles.credit}
                                title={`Win 100% mobile \ncredit-back `}
                                description={`when you Reload`}
                                image={tapTasticAssets.merdeka.credit}
                                value="RELOAD"
                                onCardPressed={onListTap}
                            />
                        </View>
                        <View style={styles.contents}>
                            <MerdekaOptionCard
                                iconStyle={styles.share}
                                title={`Love our app?`}
                                description={REFER_FRIEND}
                                fullWidth={true}
                                image={tapTasticAssets.merdeka.neighbour}
                                value="SHARE"
                                onCardPressed={onListTap}
                            />
                        </View>
                    </View>
                </ScrollView>
                {showPopup && <Popup {...getPopupState()} />}
            </ScreenLayout>
        </ScreenContainer>
    );
}

Merdeka.propTypes = {
    navigation: PropTypes.object,
};
export default withModelContext(Merdeka);
