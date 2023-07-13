import { useNavigation, useRoute } from "@react-navigation/core";
import { CacheeImage } from "cachee";
import LottieView from "lottie-react-native";
import PropTypes from "prop-types";
import React, { useCallback, useState, useRef } from "react";
import {
    Dimensions,
    StyleSheet,
    View,
    TouchableOpacity,
    Image,
    Animated,
    Easing,
    Platform,
    Linking,
} from "react-native";
import Collapsible from "react-native-collapsible";

import { DASHBOARD_STACK } from "@navigation/navigationConstant";

import { Dropdown } from "@components/Common/DropDownButtonCenter";
import DeliveryDisclaimerModal from "@components/SSL/MerchantDetails/DeliveryDisclaimerModal";
import HeaderContactTouchable from "@components/SSL/MerchantDetails/HeaderContactTouchable";
import HeaderOpeningHour from "@components/SSL/MerchantDetails/HeaderOpeningHour";
import TnCPopupContentComponent from "@components/SSL/TnCPopupContentComponent";
import Typo from "@components/Text";
import { showErrorToast, showInfoToast, showSuccessToast } from "@components/Toast";

import { useModelController } from "@context";

import { sslMerchantAddFav, sslMerchantDelFav } from "@services";
import { FAMerchantDetails } from "@services/analytics/analyticsSSL";

import {
    BLACK,
    WHITE,
    SEPARATOR,
    DARK_YELLOW,
    SHADOW_CLOSED,
    LIGHT_GREY,
    BLUE,
    DARK_GREY,
    RATING_ORANGE,
    GREY_200,
    PROGRESS_BAR_GREEN,
} from "@constants/colors";

import {
    contactBankcall,
    deliveryType,
    massageMerchantDetailsRating,
    openWhatsApp,
    sslIsHalalLbl,
} from "@utils/dataModel/utility";

import SSLStyles from "@styles/SSLStyles";

import assets, { lottie } from "@assets";

const { width } = Dimensions.get("window");

const MerchantDetailsCollapsibleHeader = ({
    merchantDetail,
    setPopup,
    onDeliveryTypeDropdownPillPressed,
    selectedDeliveryOptionTitle,
    showDeliveryDisclaimerMerchantDelivery,
    showDeliveryDisclaimerLowestDelivery,
}) => {
    // console.log("reerender merchantDetailsCollapsibleHeader");

    const navigation = useNavigation();
    const route = useRoute();
    /** Populating on screen values */
    const merchantPicture = merchantDetail?.merchantPicture ?? "";
    const openMessage = merchantDetail?.openMessage ?? "";
    const shopName = merchantDetail?.shopName ?? "";
    const distance = merchantDetail?.distance ?? "";
    const menuTypes = merchantDetail?.menuTypes ?? [];
    const tncLink = merchantDetail?.tncLink ?? "";
    const businessDescription = merchantDetail?.businessDescription ?? "";
    const outletAddress = merchantDetail?.outletAddress ?? "";
    const latitude = merchantDetail?.latitude ?? "";
    const longitude = merchantDetail?.longitude ?? "";
    const website = merchantDetail?.website ?? "";
    const businessContactNo = merchantDetail?.businessContactNo ?? "";
    const openTimings = merchantDetail?.openTimings ?? [];
    const deliveryTypes = merchantDetail?.deliveryTypes ?? [];
    const priceDescription = merchantDetail?.price?.description;
    const deliveryTypePills = merchantDetail?.pills?.deliveryTypePills;
    const promo = merchantDetail?.pills?.promotionPills;
    const halal = merchantDetail?.isHalal;

    let ratingLbl = "";
    if (merchantDetail?.averageRating) {
        ratingLbl = `${merchantDetail.averageRating?.toFixed(1)} (${merchantDetail?.totalReview})`;
    }

    let menuTypesLbl = "";
    Array.isArray(menuTypes) &&
        menuTypes.map((obj, index) => {
            if (index === 0) menuTypesLbl += obj.categoryName;
            else menuTypesLbl += `, ${obj.categoryName}`;
        });

    let openingDay = "";
    let openingHour = "";
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    Array.isArray(openTimings) &&
        days.forEach((dayString) => {
            if (dayString === "Monday") {
                const dayObj = openTimings.find((obj) => obj.day === dayString);
                openingDay += dayString;
                if (dayObj) {
                    openingHour += `${dayObj.startTime} - ${dayObj.endTime}`;
                } else {
                    openingHour += "Closed";
                }
            } else {
                const dayObj = openTimings.find((obj) => obj.day === dayString);
                openingDay += `\n${dayString}`;
                if (dayObj) {
                    openingHour += `\n${dayObj.startTime} - ${dayObj.endTime}`;
                } else {
                    openingHour += "\nClosed";
                }
            }
        });

    // Promo related
    function onPressPromo() {
        FAMerchantDetails.onPressPromo(merchantDetail);
        setPopup({
            visible: true,
            onClose: () => setPopup({ visible: false }),
            contentComponent,
        });
    }
    function contentComponent() {
        function onPressTnC(tncLink) {
            if (tncLink) {
                setPopup({ visible: false });
                navigation.navigate(DASHBOARD_STACK, {
                    screen: "ExternalUrl",
                    params: {
                        title: "Terms & Conditions",
                        url: tncLink,
                    },
                });
            }
        }
        return (
            <TnCPopupContentComponent
                promotionPills={merchantDetail?.pills?.promotionPills ?? []}
                onPressTnC={onPressTnC}
            />
        );
    }
    function onPressCategories(label) {
        setPopup({
            visible: true,
            title: "Categories",
            description: label,
            onClose: () => {
                setPopup({ visible: false });
            },
        });
    }

    // Collapse uncollapse
    const [isViewMore, setIsViewMore] = useState(false);
    const animatedHeight = useRef(new Animated.Value(0)).current;
    function onPressViewMore() {
        setIsViewMore(!isViewMore);
        Animated.timing(animatedHeight, {
            duration: 200,
            toValue: isViewMore ? 0 : 1,
            useNativeDriver: true,
            easing: Easing.linear,
        }).start();
    }

    // Favourite
    const { getModel } = useModelController();
    const { sandboxUrl } = getModel("ssl");
    const {
        auth: { token },
    } = getModel(["auth"]);

    const [isFavUpdating, setIsFavUpdating] = useState(false);
    const likeLottieRef = useRef(null);
    const [isFavourite, setIsFavourite] = useState(merchantDetail.isFav);

    const onPressFavourite = useCallback(async () => {
        if (isFavUpdating) return;
        if (!isFavourite) {
            likeLottieRef.current.play();
        }
        try {
            setIsFavUpdating(true);
            const body = {
                merchantId: route.params?.merchantId,
            };
            if (isFavourite) {
                await sslMerchantDelFav({ sandboxUrl, token, body });
            } else {
                await sslMerchantAddFav({ sandboxUrl, token, body });
            }

            setIsFavourite((prevState) => !prevState);
            if (isFavourite) {
                showInfoToast({
                    message: "Removed from favourites",
                });
            } else {
                FAMerchantDetails.onPressFavourite(merchantDetail);
                showSuccessToast({
                    message: "Added to favourites!",
                });
            }
        } catch (e) {
            showErrorToast({
                message: e.message,
            });
        } finally {
            setIsFavUpdating(false);
        }
    }, [isFavUpdating, isFavourite, route.params?.merchantId, sandboxUrl, token, merchantDetail]);

    // Other onPress functions
    function onPressTnC() {
        navigation.navigate(DASHBOARD_STACK, {
            screen: "ExternalUrl",
            params: {
                title: "Terms & Conditions",
                url: tncLink,
            },
        });
    }

    function onPressAddress() {
        const scheme = Platform.select({ ios: "maps:0,0?q=", android: "geo:0,0?q=" });
        const latLng = `${latitude},${longitude}`;
        const label = encodeURIComponent(`${shopName}\n${outletAddress}`);
        const url = Platform.select({
            ios: `${scheme}${label}@${latLng}`,
            android: `${scheme}${latLng}(${label})`,
        });

        url && Linking.openURL(url);
    }

    function onPressWebsite() {
        navigation.navigate(DASHBOARD_STACK, {
            screen: "ExternalUrl",
            params: {
                title: shopName,
                url: website,
            },
        });
    }

    function onPressContact() {
        businessContactNo && businessContactNo !== "N/A" && contactBankcall(businessContactNo);
    }

    function onPressContactWa() {
        if (businessContactNo && businessContactNo !== "N/A") {
            openWhatsApp({
                phone: businessContactNo,
                text: "Saw your shop on Maybank's Sama-Sama Lokal. I would like to place an order with you.",
            });
        }
    }

    function handleCategories() {
        onPressCategories(menuTypesLbl);
    }

    const rating = massageMerchantDetailsRating(merchantDetail?.rating);

    return (
        <View>
            <View style={styles.imageView}>
                <CacheeImage
                    source={
                        merchantPicture ? { uri: merchantPicture } : assets.SSLmerchantDefaultBanner
                    }
                    style={styles.container}
                    resizeMode="cover"
                />
                {!!openMessage && (
                    <View style={styles.merchantClosed}>
                        <Typo
                            fontSize={16}
                            fontWeight="semi-bold"
                            lineHeight={24}
                            textAlign="center"
                            text={openMessage}
                            color={WHITE}
                        />
                    </View>
                )}
            </View>
            {promo?.length > 0 && (
                <TouchableOpacity style={styles.promoMainContainer} onPress={onPressPromo}>
                    <View style={styles.promoContainer}>
                        {/** Show max 2 promo */}
                        {promo.slice(0, 2).map((obj, index) => {
                            return (
                                <View style={styles.promoView(index)} key={`${index}`}>
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
                                            text={obj.title}
                                            numberOfLines={1}
                                        />
                                        <Typo
                                            fontSize={12}
                                            lineHeight={17}
                                            textAlign="left"
                                            text={obj.shortDesc}
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
            {isFavourite !== null && (
                <View style={styles.likeBtnContainer}>
                    <TouchableOpacity onPress={onPressFavourite} style={styles.likeBtnTouchable}>
                        <Image
                            style={isFavourite ? styles.likeIconFilled : styles.likeIcon}
                            source={isFavourite ? assets.tinyIconLikeFilled : assets.tinyIconLike}
                            resizeMode="contain"
                        />
                        <LottieView
                            ref={likeLottieRef}
                            style={styles.lottieLikeAnimation}
                            source={lottie.likeLoader}
                            loop={false}
                        />
                    </TouchableOpacity>
                </View>
            )}
            <View>
                <View style={styles.infoContainer}>
                    <View style={styles.isHalalContainer}>
                        {halal === null ? null : halal ? (
                            <View style={styles.halalView}>
                                <Typo
                                    fontWeight="semi-bold"
                                    fontSize={9}
                                    lineHeight={10.97}
                                    textAlign="left"
                                    text="Halal Certified"
                                    color={WHITE}
                                />
                            </View>
                        ) : (
                            <View style={styles.nonHalalView}>
                                <Typo
                                    fontWeight="semi-bold"
                                    fontSize={9}
                                    lineHeight={10.97}
                                    textAlign="left"
                                    text="Non-Halal"
                                    color={WHITE}
                                />
                            </View>
                        )}
                    </View>
                    <Typo
                        fontSize={17}
                        fontWeight="bold"
                        lineHeight={23}
                        letterSpacing={0}
                        color={BLACK}
                        textAlign="left"
                        text={`${shopName} ${sslIsHalalLbl(merchantDetail)}`}
                        numberOfLines={2}
                    />
                    <View style={styles.keywordContainer}>
                        {!!priceDescription && (
                            <Typo
                                fontSize={11}
                                fontWeight="600"
                                lineHeight={23}
                                text={priceDescription}
                            />
                        )}
                        {!!priceDescription && !!distance && <View style={styles.circularView} />}
                        {!!distance && (
                            <Typo
                                fontSize={11}
                                fontWeight="normal"
                                lineHeight={23}
                                text={`~${distance}`}
                            />
                        )}
                        {!!distance && !!ratingLbl && <View style={styles.circularView} />}
                        {!!ratingLbl && (
                            <View style={styles.keywordView}>
                                <Image
                                    source={assets.starFilled}
                                    style={styles.ratingStarContainer}
                                />
                                <Typo
                                    fontSize={11}
                                    fontWeight="normal"
                                    lineHeight={23}
                                    text={`${ratingLbl}`}
                                />
                            </View>
                        )}
                        {!!menuTypesLbl && <View style={styles.circularView} />}
                        {!!menuTypesLbl && (
                            <View style={[styles.keywordView, styles.container]}>
                                <TouchableOpacity onPress={handleCategories}>
                                    <Typo
                                        fontSize={11}
                                        fontWeight="normal"
                                        lineHeight={23}
                                        text={menuTypesLbl}
                                        textAlign="left"
                                        numberOfLines={1}
                                        ellipsizeMode="tail"
                                        style={styles.container}
                                    />
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                    <View style={styles.deliveryTypeContainer}>
                        {Array.isArray(deliveryTypePills) &&
                            deliveryTypePills.map((obj, index) => {
                                return (
                                    <View key={`${index}`} style={styles.deliveryTypeView}>
                                        <Typo
                                            fontWeight="normal"
                                            fontSize={9}
                                            textAlign="left"
                                            text={obj?.id === 1 ? "Instant Delivery" : obj?.name}
                                        />
                                    </View>
                                );
                            })}
                        <View style={styles.container} />
                    </View>

                    <DeliveryDisclaimerModal
                        deliveryTypes={merchantDetail?.deliveryTypes}
                        showDeliveryDisclaimerMerchantDelivery={
                            showDeliveryDisclaimerMerchantDelivery
                        }
                        showDeliveryDisclaimerLowestDelivery={showDeliveryDisclaimerLowestDelivery}
                    />

                    <Typo
                        style={styles.businessDescText}
                        fontSize={13}
                        lineHeight={17}
                        textAlign="left"
                        text={businessDescription}
                        numberOfLines={isViewMore ? 0 : 2}
                    />
                    <Animated.View
                        // eslint-disable-next-line react-native/no-inline-styles
                        style={{
                            overflow: "hidden",
                            opacity: animatedHeight,
                        }}
                    >
                        <Collapsible collapsed={!isViewMore} duration={50} easing={Easing.linear}>
                            {merchantDetail?.totalReview > 0 && (
                                <>
                                    <View style={styles.separator} />

                                    <View style={styles.ratingContainer}>
                                        <View style={styles.ratingSummary}>
                                            <Typo
                                                style={styles.marginBottom4}
                                                fontSize={15}
                                                lineHeight={17}
                                                fontWeight="500"
                                                textAlign="left"
                                                text={merchantDetail?.averageRating?.toFixed(1)}
                                                numberOfLines={isViewMore ? 0 : 2}
                                            />
                                            <View style={styles.starsContainer}>
                                                {[1, 2, 3, 4, 5].map((num) => {
                                                    return (
                                                        <Image
                                                            key={`${num}`}
                                                            source={
                                                                merchantDetail?.averageRating?.toFixed(
                                                                    1
                                                                ) <=
                                                                num - 1
                                                                    ? assets.starEmptyFilled
                                                                    : merchantDetail?.averageRating?.toFixed(
                                                                          1
                                                                      ) < num
                                                                    ? assets.starHalfFilled
                                                                    : assets.starFilled
                                                            }
                                                            style={styles.starRatingDetailed}
                                                        />
                                                    );
                                                })}
                                            </View>
                                            <Typo
                                                fontSize={11}
                                                lineHeight={13}
                                                textAlign="center"
                                                text={`(${merchantDetail?.totalReview})`}
                                                color={DARK_GREY}
                                            />
                                        </View>

                                        <View style={styles.ratingsBreakdownContainer}>
                                            {["five", "four", "three", "two", "one"].map((key) => {
                                                const width =
                                                    (rating[key] / merchantDetail?.totalReview) *
                                                    100;
                                                return (
                                                    <View
                                                        style={styles.ratingsBreakdownEmptyBar}
                                                        key={key}
                                                    >
                                                        <View
                                                            style={styles.ratingsBreakdownFilledBar(
                                                                width
                                                            )}
                                                        />
                                                    </View>
                                                );
                                            })}
                                        </View>
                                    </View>
                                </>
                            )}
                            {!!tncLink && (
                                <View style={styles.tncContainer}>
                                    <TouchableOpacity
                                        onPress={onPressTnC}
                                        style={styles.tnCBtnContainer}
                                    >
                                        <Typo
                                            color={BLACK}
                                            fontWeight="semi-bold"
                                            fontSize={13}
                                            textAlign="left"
                                            text="Terms & Conditions"
                                        />
                                    </TouchableOpacity>
                                    <View style={styles.container} />
                                </View>
                            )}
                            {!!outletAddress && (
                                <HeaderContactTouchable
                                    icon={assets.mapIcon}
                                    text={outletAddress}
                                    onPress={onPressAddress}
                                />
                            )}
                            {!!website && (
                                <HeaderContactTouchable
                                    icon={assets.webIcon}
                                    text={website}
                                    onPress={onPressWebsite}
                                />
                            )}
                            {!!businessContactNo && (
                                <>
                                    <HeaderContactTouchable
                                        icon={assets.callIcon}
                                        text={businessContactNo}
                                        onPress={onPressContact}
                                    />
                                    <HeaderContactTouchable
                                        icon={assets.SSLWhatsapp}
                                        text="WhatsApp"
                                        onPress={onPressContactWa}
                                    />
                                </>
                            )}

                            <HeaderOpeningHour
                                icon={assets.icon24BlackClock}
                                openingDay={openingDay}
                                openingHour={openingHour}
                            />
                        </Collapsible>
                    </Animated.View>
                    <TouchableOpacity
                        onPress={onPressViewMore}
                        style={styles.collapseToggleContainer}
                    >
                        <Typo
                            fontWeight="semi-bold"
                            fontSize={12}
                            textAlign="left"
                            color={BLUE}
                            text={isViewMore ? "See Less" : "More Info"}
                        />
                    </TouchableOpacity>
                </View>
                <View style={styles.separator} />
                {!deliveryTypes.includes(deliveryType.EMAIL) && (
                    <View style={styles.deliverDropdown}>
                        <Dropdown
                            title={selectedDeliveryOptionTitle}
                            align="left"
                            onPress={onDeliveryTypeDropdownPillPressed}
                        />
                    </View>
                )}
            </View>
        </View>
    );
};
MerchantDetailsCollapsibleHeader.propTypes = {
    merchantDetail: PropTypes.object,
    setPopup: PropTypes.func,
    onDeliveryTypeDropdownPillPressed: PropTypes.func,
    selectedDeliveryOptionTitle: PropTypes.string,
    showDeliveryDisclaimerMerchantDelivery: PropTypes.func,
    showDeliveryDisclaimerLowestDelivery: PropTypes.func,
};
export default MerchantDetailsCollapsibleHeader;

/* eslint-disable react-native/sort-styles */
const styles = StyleSheet.create({
    businessDescText: { paddingTop: 15 },
    circularView: {
        backgroundColor: BLACK,
        borderRadius: 2,
        height: 4,
        marginHorizontal: 4,
        width: 4,
    },
    collapseToggleContainer: {
        alignItems: "center",
        flexDirection: "row",
        paddingTop: 20,
    },
    container: {
        flex: 1,
    },
    deliverDropdown: { marginBottom: 24, marginHorizontal: 24 },
    deliveryTypeContainer: { alignItems: "center", flexDirection: "row", marginTop: 5 },
    deliveryTypeView: {
        borderColor: BLACK,
        borderRadius: 10.5,
        borderWidth: 1,
        height: 21,
        justifyContent: "center",
        marginRight: 8,
        paddingHorizontal: 8,
    },
    imageView: {
        height: width / 2,
        width: "100%",
    },
    infoContainer: {
        marginTop: 40,
        paddingHorizontal: 24,
    },
    isHalalContainer: { alignItems: "flex-start" },
    halalView: {
        backgroundColor: PROGRESS_BAR_GREEN,
        borderRadius: 10.5,
        height: 21,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 8,
        marginBottom: 8,
    },
    nonHalalView: {
        backgroundColor: BLACK,
        borderRadius: 10.5,
        height: 21,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 8,
        marginBottom: 8,
    },
    keywordContainer: { alignItems: "center", flex: 1, flexDirection: "row", marginTop: 5 },
    keywordView: { alignItems: "center", flexDirection: "row" },
    likeBtnContainer: {
        backgroundColor:
            WHITE /** https://stackoverflow.com/questions/39250449/touchableopacity-not-working-inside-an-absolute-positioned-view */,
        borderRadius: 25,
        height: 50,
        position: "absolute",
        right: 32,
        top: width / 2 - 25,
        width: 50,
        zIndex: 1,
        ...SSLStyles.shadow,
    },
    likeBtnTouchable: {
        alignItems: "center",
        borderRadius: 25,
        height: 50,
        justifyContent: "center",
        width: 50,
    },
    likeIcon: { height: 26, width: 26 },
    likeIconFilled: { height: 21, width: 25 },
    lottieLikeAnimation: { height: 50, position: "absolute", width: 50 },
    merchantClosed: {
        backgroundColor: SHADOW_CLOSED,
        justifyContent: "center",
        overflow: "hidden",
        position: "absolute",
        height: "100%",
        width: "100%",
        padding: 40,
    },
    ratingStarContainer: { height: 16, marginLeft: 1, marginRight: 5, width: 16 },
    separator: { backgroundColor: SEPARATOR, height: 1, marginVertical: 16 },
    tnCBtnContainer: {
        marginTop: 12,
        height: 34,
        paddingHorizontal: 20,
        borderRadius: 34 / 2,
        borderWidth: 1,
        borderColor: LIGHT_GREY,
        backgroundColor: WHITE,
        justifyContent: "center",
        alignItems: "center",
    },
    tncContainer: {
        flexDirection: "row",
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

    // Rating styles below
    ratingContainer: {
        flexDirection: "row",
        height: 50,
    },
    ratingSummary: {
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
    },
    marginBottom4: { marginBottom: 4 },
    starsContainer: { flexDirection: "row", marginBottom: 4 },
    starRatingDetailed: {
        height: 8,
        marginRight: 4.5,
        width: 8,
    },
    ratingsBreakdownContainer: {
        flexDirection: "column",
        flex: 3,
        justifyContent: "space-around",
    },
    ratingsBreakdownEmptyBar: {
        backgroundColor: GREY_200,
        height: 4,
        width: "100%",
        borderRadius: 4,
    },
    ratingsBreakdownFilledBar: (width) => ({
        backgroundColor: RATING_ORANGE,
        height: 4,
        width: `${width}%`,
        borderRadius: 2,
    }),
});
