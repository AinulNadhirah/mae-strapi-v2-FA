/* eslint-disable react-native/sort-styles */
import PropTypes from "prop-types";
import React, { Component } from "react";
import {
    StyleSheet,
    View,
    Platform,
    Linking,
    Animated,
    Image,
    TouchableOpacity,
} from "react-native";
import * as Animatable from "react-native-animatable";

import * as navigationConstant from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
// import { Dropdown } from "@components/Common/DropDownButtonCenter";
import ScreenContainer from "@components/Containers/ScreenContainer";
import EmptyState from "@components/DefaultState/EmptyState";
import { IconContactTouchable } from "@components/FnB/IconContactTouchable";
// import { SecondaryPrimaryBtn } from "@components/FnB/SecondaryPrimaryBtn";
import Popup from "@components/Popup";
import TnCPopupContentComponent from "@components/SSL/TnCPopupContentComponent";
import Typo from "@components/Text";

import { withModelContext } from "@context";

import { getFnbMerchantDetailsCloud } from "@services";
import { logEvent } from "@services/analytics";

import { BLACK, MEDIUM_GREY, DARK_GREY, DARK_YELLOW, YELLOW } from "@constants/colors";
import { SCREEN_ERROR, SCREEN_SHIMMER, SCREEN_SUCCESS } from "@constants/screenLifecycleConstants";
import * as Strings from "@constants/strings";
import { SSL_SERVER_BUSY, SSL_SERVER_BUSY_DESC, SSL_TRY_AGAIN } from "@constants/stringsSSL";

import { contactBankcall, openWhatsApp } from "@utils/dataModel/utility";
import { getLatitude, getLongitude } from "@utils/dataModel/utilitySSL";

import assets from "@assets";

import MerchantDetailsShimmer from "./MerchantDetailsShimmer";

class MerchantDetails extends Component {
    static propTypes = {
        updateModel: PropTypes.func,
        getModel: PropTypes.func,
        route: PropTypes.object,
        navigation: PropTypes.object,
    };

    state = {
        screenState: SCREEN_SHIMMER,
        merchantId: null,
        merchantDetails: this.props.route?.params?.merchantDetails,
        deliveryTypeLbl: "",
        cuisineLbl: "",

        // outlet specific
        outletAddress: "",
        latitude: "",
        longitude: "",
        email: "",
        socialMedia: "", // Social Media / Website on QRMS
        mobileNumber: "",
        outletBanner: null,

        // moreLikeThisMerchant: [],
        isShowPopupPromotion: false,
        promo: [],
        mkp: false,
        maya: false,
    };

    bannerAnimate = new Animated.Value(0);

    componentDidMount() {
        this.initialLoad();
        console.log("this.state.merchantDetails :: ", this.state.merchantDetails);
        logEvent(Strings.FA_VIEW_SCREEN, {
            [Strings.FA_SCREEN_NAME]: `Food_Merchant_${this.state.merchantDetails?.shopName}`,
        });
    }

    initialLoad = () => {
        this.setState({
            screenState: SCREEN_SHIMMER,
        });
        this.getMerchantDetails();
    };

    getMerchantDetails = async () => {
        try {
            const { getModel } = this.props;

            const location = getModel("location");
            const { fnbCurrLocation } = getModel("fnb");
            const { sandboxUrl } = getModel("ssl");

            const mkp = this.props.route?.params?.mkp ? true : false;
            const maya = this.props.route?.params?.maya ? true : false;
            /**
             * If mkp == true, means SSL
             * If mkp == false, means FnB
             * If mkp == null & maya == true, means SSL
             * if mkp == null && maya == false, means SSL
             *
             * U might get { mkp:false, maya:true}. mkp comes first, so in this case, this merchant is FnB merchant
             *
             * Logic might get updated from QRMS side. Please double confirm again the above logic
             */
            // if (mkp !== null || maya !== null) {
            const params = {
                merchantId: this.state.merchantDetails.merchantId,
                outletId: this.props.route?.params?.merchantDetails.outletId,
                latitude: getLatitude({ location, currSelectedLocationV1: fnbCurrLocation }),
                longitude: getLongitude({ location, currSelectedLocationV1: fnbCurrLocation }),
                categoryId: this.props.route?.params?.merchantDetails?.categoryId,
                mkp,
                maya,
            };
            console.log("getMerchantDetailsV2");
            const response = await getFnbMerchantDetailsCloud({ sandboxUrl, params });

            console.log("getMerchantDetailsV2 success", response);

            const result = response.data?.result;

            const deliveryTypeLbl = result?.pills?.deliveryTypePills?.reduce(
                (accumulator, currentValue, index) => {
                    if (index === 0) return (accumulator += currentValue?.name);
                    else return (accumulator += `, ${currentValue?.name}`);
                },
                ""
            );

            let cuisineIds = [];
            let cuisineType = [];
            if (result?.cuisinesTypes?.length) {
                // FnB -> cuisineType
                cuisineType = result?.cuisinesTypes;
            } else if (result?.menuTypes?.length) {
                // SSL - cuisineType becomes menuType
                cuisineType = result?.menuTypes;
            }
            cuisineIds = [...new Set(cuisineType.reduce((r, a) => r.concat(a.cuisineId), []))];
            const cuisineLbl = cuisineType.reduce((accumulator, currentValue, index) => {
                if (index === 0) return (accumulator += currentValue?.categoryName);
                else return (accumulator += `, ${currentValue?.categoryName}`);
            }, "");

            console.log("cuisineIds", cuisineIds, cuisineLbl);

            this.setState({
                merchantId: result.merchantId,
                deliveryTypeLbl,
                mobileNumber: result.businessContactNo,
                socialMedia: result.socialMedia,
                email: result.email,
                outletAddress: result.merchantOutlets?.outletAddress,
                latitude: result.merchantOutlets?.latitude,
                longitude: result.merchantOutlets?.longitude,
                // moreLikeThisMerchant: result.moreLikeThisMerchant,
                outletBanner: result?.merchantOutlets?.outletBanner ?? result?.picture,
                promo: result?.pills?.promotionPills ?? [],
                mkp: result?.mkp,
                maya: result?.maya,
                cuisineLbl,
                screenState: SCREEN_SUCCESS,
            });
        } catch (e) {
            console.log("getMerchantDetails e", e);
            this.setState({
                screenState: SCREEN_ERROR,
            });
            // showErrorToast({
            //     message: e.message,
            // });
        }
    };
    onBackTap = () => {
        console.log("[MerchantDetails] >> [BackTap]");
        this.props.navigation.goBack();
    };

    onPressWebsite = () => {
        const { socialMedia, merchantDetails } = this.state;
        this.props.navigation.navigate(navigationConstant.DASHBOARD_STACK, {
            screen: "ExternalUrl",
            params: {
                title: merchantDetails?.shopName && "",
                url: socialMedia,
            },
        });
    };

    onCallNowPressed = () => {
        console.log("[MerchantDetails] >> [onCallNowPressed]");
        if (this.state.mobileNumber && this.state.mobileNumber !== "N/A") {
            contactBankcall(this.state.mobileNumber);
        }
    };

    onPressContactWaSSL = () => {
        const { mobileNumber } = this.state;
        if (mobileNumber && mobileNumber !== "N/A") {
            openWhatsApp({
                phone: mobileNumber,
                text: "Saw your shop on Maybank's Sama-Sama Lokal. I would like to place an order with you.",
            });
        }
    };
    onPressContactWa = () => {
        const { mobileNumber } = this.state;
        if (mobileNumber && mobileNumber !== "N/A") {
            openWhatsApp({
                phone: mobileNumber,
                text: "Saw your shop on Maybank's Sama-Sama Lokal. I would like to place an order with you.",
            });
        }
    };

    onDirectionsPressed = () => {
        console.log("[MerchantDetails] >> [onDirectionsPressed]");
        const { outletAddress } = this.state;

        if (outletAddress) {
            const scheme = Platform.select({ ios: "maps:0,0?q=", android: "geo:0,0?q=" });
            const latLng = `${this.state.latitude},${this.state.longitude}`;
            const label = encodeURIComponent(`${this.state.outletAddress}`);
            const url = Platform.select({
                ios: `${scheme}${label}@${latLng}`,
                android: `${scheme}${latLng}(${label})`,
            });

            url && Linking.openURL(url);
        }
    };

    onPressSSL = () => {
        console.log("onPressSSL");
        const isOnboard = this.props.getModel("user")?.isOnboard;
        const { updateModel } = this.props;

        if (isOnboard) {
            logEvent(Strings.FA_SELECT_ACTION, {
                [Strings.FA_SCREEN_NAME]: `Food_Merchant_${this.state.merchantDetails?.shopName}`,
                [Strings.FA_ACTION_NAME]: "Order Online",
            });
            updateModel({
                ssl: {
                    redirect: {
                        screen: navigationConstant.SSL_MERCHANT_DETAILS,
                        merchantId: this.state.merchantId,
                    },
                },
            });
            this.props.navigation.navigate(navigationConstant.SSL_STACK, {
                screen: navigationConstant.SSL_START,
            });
        } else {
            // What if user cancel?

            // const link = `m2ulife://m2usamasama?mid=${this.state.merchantId}`;

            // const deepLinkParams = getLinkParams({ link });
            // deepLinkParams.module = "m2usamasama";
            // updateModel({
            //     deeplink: {
            //         url: link,
            //         params: deepLinkParams,
            //     },
            // });

            this.props.navigation.navigate("Onboarding", {
                screen: "OnboardingStart",
            });
        }
    };

    /** Promo related */
    onPressPromo = () => {
        console.log("onPressPromo");
        logEvent(Strings.FA_SELECT_PROMOTION, {
            [Strings.FA_SCREEN_NAME]: `Food_Merchant_${this.state.merchantDetails?.shopName}`,
            [Strings.FA_FIELD_INFORMATION]: this.state.promo[0]?.title,
        });
        this.setState({ isShowPopupPromotion: true });
    };
    hidePromoPopup = () => {
        this.setState({ isShowPopupPromotion: false });
    };
    onPressTnC = (tncLink) => {
        if (tncLink) {
            this.setState({ isShowPopupPromotion: false });
            this.props.navigation.navigate(navigationConstant.DASHBOARD_STACK, {
                screen: "ExternalUrl",
                params: {
                    title: "Terms & Conditions",
                    url: tncLink,
                },
            });
        }
    };
    contentComponent = () => {
        return (
            <TnCPopupContentComponent
                promotionPills={this.state.promo ?? []}
                onPressTnC={this.onPressTnC}
            />
        );
    };

    animateBanner = () => {
        return {
            opacity: this.bannerAnimate.interpolate({
                inputRange: [0, 120, 240],
                outputRange: [1, 0.8, 0],
            }),
            transform: [
                {
                    scale: this.bannerAnimate.interpolate({
                        inputRange: [-200, 0, 1],
                        outputRange: [1.4, 1, 1],
                    }),
                },
                {
                    translateY: this.bannerAnimate.interpolate({
                        inputRange: [-200, 0, 240],
                        outputRange: [0, 0, -100],
                    }),
                },
            ],
        };
    };

    renderViewState = () => {
        const {
            merchantDetails,
            deliveryTypeLbl,
            outletAddress,
            socialMedia,
            // moreLikeThisMerchant,
            mobileNumber,
            email,
            cuisineLbl,
            outletBanner,
            promo,
            mkp,
            maya,
        } = this.state;

        const price = merchantDetails?.priceRange // FnB return price in here
            ? merchantDetails?.priceRange
            : merchantDetails?.price?.description // SSL return price in here
            ? merchantDetails?.price?.description
            : "";

        let isSSL = false;
        if (mkp == null && maya) {
            isSSL = true;
        } else if (mkp == null && !maya) {
            isSSL = false;
        } else if (mkp) {
            isSSL = true;
        } else if (!mkp) {
            isSSL = false;
        }

        switch (this.state.screenState) {
            case SCREEN_SHIMMER:
                return <MerchantDetailsShimmer />;
            case SCREEN_SUCCESS:
                return (
                    <View style={styles.container}>
                        <Animated.View style={[styles.promotionImage, this.animateBanner()]}>
                            <Animatable.Image
                                animation="fadeInUp"
                                duration={300}
                                source={
                                    outletBanner
                                        ? { uri: outletBanner }
                                        : assets.maeFBMerchantProfile
                                }
                                style={styles.merchantBanner}
                                resizeMode="cover"
                            />
                        </Animated.View>
                        <Animated.ScrollView
                            scrollEventThrottle={16}
                            onScroll={Animated.event(
                                [
                                    {
                                        nativeEvent: {
                                            contentOffset: { y: this.bannerAnimate },
                                        },
                                    },
                                ],
                                { useNativeDriver: true }
                            )}
                            showsVerticalScrollIndicator={false}
                        >
                            <View style={styles.mainContent}>
                                {promo?.length > 0 && (
                                    <TouchableOpacity
                                        style={styles.promoMainContainer}
                                        onPress={this.onPressPromo}
                                    >
                                        <View style={styles.promoContainer}>
                                            {/** Show max 2 promo */}
                                            {promo.slice(0, 2).map((obj, index) => {
                                                return (
                                                    <View
                                                        style={styles.promoView(index)}
                                                        key={`${index}`}
                                                    >
                                                        <Image
                                                            source={assets.SSLIcon32BlackBookmark}
                                                            style={styles.bookmarkIcon}
                                                        />
                                                        <View style={styles.titleDesc}>
                                                            <Typo
                                                                fontSize={12}
                                                                fontWeight="semi-bold"
                                                                lineHeight={17}
                                                                textAlign="left"
                                                                text={obj?.title}
                                                                numberOfLines={1}
                                                            />
                                                            <Typo
                                                                fontSize={12}
                                                                lineHeight={17}
                                                                textAlign="left"
                                                                text={obj?.shortDesc}
                                                                numberOfLines={1}
                                                            />
                                                        </View>
                                                    </View>
                                                );
                                            })}
                                        </View>
                                        <Image
                                            style={styles.promoArrow}
                                            source={assets.SSL_arrow_right}
                                            resizeMode="contain"
                                        />
                                    </TouchableOpacity>
                                )}
                                <View style={styles.mainContentPadding}>
                                    <Animatable.View
                                        animation="fadeInUp"
                                        duration={250}
                                        delay={300}
                                    >
                                        {isSSL && (
                                            <View style={styles.SSLPartnerView}>
                                                <Image
                                                    style={styles.SSLPartnerImg}
                                                    source={assets.SSLPartner}
                                                />
                                                <Typo
                                                    fontSize={10}
                                                    fontWeight="semi-bold"
                                                    lineHeight={23}
                                                    color={BLACK}
                                                    textAlign="left"
                                                    text="Sama-Sama Lokal Partner"
                                                />
                                            </View>
                                        )}
                                        <Typo
                                            fontSize={17}
                                            fontWeight="600"
                                            fontStyle="normal"
                                            lineHeight={23}
                                            letterSpacing={0}
                                            color={BLACK}
                                            textAlign="left"
                                            text={merchantDetails?.shopName}
                                        />
                                    </Animatable.View>
                                    <View style={styles.amountView}>
                                        <Animatable.View
                                            animation="fadeInUp"
                                            duration={250}
                                            delay={400}
                                            style={styles.cuisineRow}
                                        >
                                            <Typo
                                                fontSize={11}
                                                fontWeight="600"
                                                lineHeight={23}
                                                text={price}
                                            />
                                            {!!cuisineLbl && (
                                                <>
                                                    {!!price && (
                                                        <View style={styles.circularView} />
                                                    )}
                                                    <View style={styles.container}>
                                                        <Typo
                                                            fontSize={11}
                                                            fontWeight="normal"
                                                            lineHeight={23}
                                                            text={cuisineLbl}
                                                            textAlign="left"
                                                        />
                                                    </View>
                                                </>
                                            )}
                                        </Animatable.View>
                                    </View>

                                    {/* <View style={styles.dropDownView}>
                                                <Animatable.View
                                                    animation="fadeInUp"
                                                    duration={250}
                                                    delay={500}
                                                >
                                                    {!!outletAddress && (
                                                        <Dropdown
                                                            title={outletAddress}
                                                            align="left"
                                                            onPress={this.onOutletPressed}
                                                        />
                                                    )}
                                                </Animatable.View>
                                            </View> */}

                                    {!!deliveryTypeLbl && (
                                        <IconContactTouchable
                                            icon={assets.SSLfoodTray}
                                            text={deliveryTypeLbl}
                                            // onPress={onPressAddress}
                                            delay={550}
                                        />
                                    )}
                                    {!!outletAddress && outletAddress !== "N/A" && (
                                        <IconContactTouchable
                                            icon={assets.mapIcon}
                                            text={outletAddress}
                                            onPress={this.onDirectionsPressed}
                                            delay={600}
                                        />
                                    )}

                                    {!!email && email !== "N/A" && (
                                        <IconContactTouchable
                                            icon={assets.SSLLocationPillEmail}
                                            text={email}
                                            // onPress={onPressAddress}
                                            delay={650}
                                        />
                                    )}
                                    {!!socialMedia && socialMedia !== "N/A" && (
                                        <IconContactTouchable
                                            icon={assets.webIcon}
                                            text={socialMedia}
                                            onPress={this.onPressWebsite}
                                            delay={650}
                                        />
                                    )}

                                    {!!mobileNumber && mobileNumber !== "N/A" && (
                                        <IconContactTouchable
                                            icon={assets.callIcon}
                                            text={mobileNumber}
                                            onPress={this.onCallNowPressed}
                                            delay={700}
                                        />
                                    )}
                                    {!!mobileNumber && mobileNumber !== "N/A" && (
                                        <IconContactTouchable
                                            icon={assets.SSLWhatsapp}
                                            text="WhatsApp"
                                            onPress={
                                                isSSL
                                                    ? this.onPressContactWaSSL
                                                    : this.onPressContactWa
                                            }
                                            delay={700}
                                        />
                                    )}

                                    {isSSL && (
                                        <View style={styles.actionBtnView}>
                                            <ActionButton
                                                fullWidth
                                                height={48}
                                                borderRadius={24}
                                                onPress={this.onPressSSL}
                                                backgroundColor={YELLOW}
                                                componentCenter={
                                                    <Typo
                                                        color={BLACK}
                                                        text="Order Online"
                                                        fontSize={14}
                                                        fontWeight="600"
                                                        lineHeight={18}
                                                    />
                                                }
                                            />
                                        </View>
                                    )}
                                </View>
                            </View>
                        </Animated.ScrollView>
                    </View>
                );
            case SCREEN_ERROR:
            default:
                return (
                    <EmptyState
                        title={SSL_SERVER_BUSY}
                        subTitle={SSL_SERVER_BUSY_DESC}
                        buttonLabel={SSL_TRY_AGAIN}
                        onActionBtnClick={this.initialLoad}
                    />
                );
        }
    };

    render() {
        return (
            <>
                <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                    <ScreenLayout
                        header={
                            <HeaderLayout
                                backgroundColor={MEDIUM_GREY}
                                headerLeftElement={<HeaderBackButton onPress={this.onBackTap} />}
                                headerCenterElement={
                                    <Typo
                                        fontSize={16}
                                        fontWeight="600"
                                        color={BLACK}
                                        lineHeight={19}
                                        text={Strings.FOOD}
                                    />
                                }
                            />
                        }
                        useSafeArea
                        neverForceInset={["bottom"]}
                        paddingLeft={0}
                        paddingRight={0}
                        paddingBottom={0}
                        paddingTop={0}
                    >
                        {this.renderViewState()}
                    </ScreenLayout>
                </ScreenContainer>

                <Popup
                    visible={this.state.isShowPopupPromotion}
                    onClose={this.hidePromoPopup}
                    ContentComponent={this.contentComponent}
                />
            </>
        );
    }
}

const styles = StyleSheet.create({
    actionBtnView: { marginTop: 26 },
    amountView: {
        alignItems: "center",
        flexDirection: "row",
        marginTop: 4,
    },
    circularView: {
        backgroundColor: DARK_GREY,
        borderRadius: 2,
        height: 4,
        marginHorizontal: 4,
        width: 4,
    },
    container: {
        flex: 1,
    },
    cuisineRow: {
        alignItems: "center",
        flexDirection: "row",
    },
    // dropDownView: {
    //     marginTop: 24,
    // },
    mainContent: {
        backgroundColor: MEDIUM_GREY,
        marginTop: 240,
    },
    mainContentPadding: {
        paddingBottom: 70,
        paddingTop: 24,
        paddingHorizontal: 24,
    },

    merchantBanner: { flex: 1, height: "100%", width: "100%" },
    promotionImage: {
        height: 240,
        position: "absolute",
        width: "100%",
    },

    SSLPartnerView: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 6,
    },
    SSLPartnerImg: {
        width: 20,
        height: 20,
        marginRight: 8,
    },

    /** Promo styles below */
    promoMainContainer: {
        backgroundColor: DARK_YELLOW,
        paddingRight: 24,
        flexDirection: "row",
        alignItems: "center",
    },
    promoContainer: { flexDirection: "column", flex: 1 },
    promoView: (index) => ({
        paddingLeft: 24,
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        paddingBottom: 24,
        paddingTop: index === 0 ? 24 : 0,
    }),
    bookmarkIcon: { width: 20, height: 20 },
    titleDesc: {
        flexDirection: "column",
        paddingLeft: 16,
        flex: 1,
    },
    promoArrow: { width: 20, height: 20 },
});

export default withModelContext(MerchantDetails);
