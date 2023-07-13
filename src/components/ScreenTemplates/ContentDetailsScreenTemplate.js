import moment from "moment";
import PropTypes from "prop-types";
import React from "react";
import {
    View,
    Text,
    Dimensions,
    Image,
    ScrollView,
    Animated,
    StyleSheet,
    Clipboard,
} from "react-native";
import Barcode from "react-native-barcode-builder";
import FlashMessage from "react-native-flash-message";
import Modal from "react-native-modal";
import HTML from "react-native-render-html";
import Share from "react-native-share";

import * as navigationConstant from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderDotDotDotButton from "@components/Buttons/HeaderDotDotDotButton";
import ContentCard from "@components/Cards/ContentCard/index";
import CountdownCard from "@components/Cards/CountdownCard";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Browser from "@components/Specials/Browser";
import Typo from "@components/Text";
import { showErrorToast, showInfoToast } from "@components/Toast";
import { TopMenu } from "@components/TopMenu";

import { withModelContext } from "@context";

import {
    LikeHomeContent,
    BookmarkHomeContent,
    disLikeHomeContent,
    updatePromosSeenCount,
} from "@services";
import { FAArticleScreen } from "@services/analytics/analyticsArticles";

import { BLACK, DARK_GREY, GREY, LIGHT_GREY, MEDIUM_GREY, YELLOW } from "@constants/colors";
import { PROMO_CODE_SHARE_MSG, PROMO_LINK_SHARE_MSG } from "@constants/strings";
import { ENDPOINT_BASE } from "@constants/url";

import { useCtaMapper } from "@utils/ctaMapper";
import { ErrorLogger } from "@utils/logs";
import { calcSecondsToDate, calcDateIsAfterNow, calcDateIsBeforeNow } from "@utils/time";

import assets from "@assets";

const { width } = Dimensions.get("window");
const CUSTOM_TAGS_STYLES = {
    body: {
        fontFamily: "montserrat",
        fontSize: 22,
        fontWeight: "normal",
        color: BLACK,
    },
    p: {
        fontFamily: "montserrat",
        fontSize: 14,
        fontWeight: "400",
        marginBottom: 24,
        marginHorizontal: 24,
        color: BLACK,
    },
    small: {
        fontFamily: "montserrat",
        color: DARK_GREY,
        fontSize: 12,
        fontWeight: "400",
        marginBottom: 24,
        marginHorizontal: 24,
    },
    h1: {
        fontFamily: "montserrat",
        fontSize: 20,
        fontWeight: "600",
        marginBottom: 24,
        marginHorizontal: 24,
        color: BLACK,
    },
    h2: {
        fontFamily: "montserrat",
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 24,
        marginHorizontal: 24,
        color: BLACK,
    },
    h3: {
        fontFamily: "montserrat",
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 24,
        marginHorizontal: 24,
        color: BLACK,
    },
    h4: {
        fontFamily: "montserrat",
        fontSize: 12,
        fontWeight: "600",
        marginBottom: 24,
        marginHorizontal: 24,
        color: BLACK,
    },
    img: {
        width: "100%",
    },
    a: {
        fontFamily: "montserrat",
        fontSize: 14,
        fontWeight: "400",
        textDecorationLine: "none",
        color: "rgba(40, 146, 233, 1.0)",
    },
    li: {
        fontFamily: "montserrat",
        fontWeight: "400",
        fontSize: 14,
        color: BLACK,
    },
    ul: {
        fontFamily: "montserrat",
        fontWeight: "400",
        fontSize: 14,
        marginLeft: 18,
        marginRight: 24,
        color: BLACK,
    },
    ol: {
        fontFamily: "montserrat",
        fontWeight: "400",
        fontSize: 14,
        color: BLACK,
    },
    blockquote: {
        fontFamily: "montserrat",
        fontWeight: "400",
        fontSize: 14,
        marginTop: 24,
        marginBottom: 24,
        padding: 24,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: GREY,
        color: BLACK,
    },
    table: {
        fontFamily: "montserrat",
        borderCollapse: "collapse",
        width: "100%",
        fontWeight: "400",
        fontSize: 14,
        borderWidth: 1,
        borderColor: LIGHT_GREY,
        color: BLACK,
    },
    span: {
        fontFamily: "montserrat",
        fontSize: 14,
        fontWeight: "400",
        marginBottom: 24,
        marginHorizontal: 24,
        color: BLACK,
    },
    th: {
        fontFamily: "montserrat",
        textAlign: "left",
        padding: 8,
        color: BLACK,
    },
    td: {
        fontFamily: "montserrat",
        textAlign: "left",
        padding: 8,
        color: BLACK,
    },
    tr: {
        backgroundColor: LIGHT_GREY,
        borderColor: LIGHT_GREY,
        color: BLACK,
    },
    i: {
        fontFamily: "montserrat",
        fontSize: 12,
        fontStyle: "italic",
        fontWeight: "400",
        marginHorizontal: 24,
        color: BLACK,
    },
};
const CUSTOM_RENDERERS = {
    i: (htmlAttribs, children, convertedCSSStyles, passProps) => {
        console.log("TEST", children);
        return (
            <Typo
                fontSize={12}
                fontWeight="600"
                fontStyle="italic"
                text={children[0][0].props.children[0].props.children}
                textAlign="left"
            />
        );
    },
};
const CUSTOM_CLASSES_STYLES = {
    title: {
        backgroundColor: YELLOW,
        borderWidth: 1,
        borderColor: YELLOW,
        color: BLACK,
    },
    small: {
        fontFamily: "montserrat",
        color: DARK_GREY,
        fontSize: 12,
        fontWeight: "400",
        marginBottom: 24,
        marginHorizontal: 24,
    },
    quote: {
        fontFamily: "montserrat",
        fontWeight: "400",
        fontSize: 14,
        // marginTop: 24,
        marginBottom: 24,
        padding: 24,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: GREY,
        color: BLACK,
    },
};
const DEFAULT_PROPS = {
    tagsStyles: CUSTOM_TAGS_STYLES,
    classesStyles: CUSTOM_CLASSES_STYLES,
    renderers: CUSTOM_RENDERERS,
    imagesMaxWidth: width,
    imagesInitialDimensions: width,
    staticContentMaxWidth: width,
    // onLinkPress: (evt, href) => { Linking.openURL(href); },
    // debug: true
};

const CTAButton = ({ cta, item, index, onCTAPressed }) => {
    function onPress() {
        onCTAPressed({ cta, content: item });
    }

    const TextComponent = (
        <Text>{cta.title != null ? cta.title.toString().replace(/\r?\n|\r/g, " ") : ""}</Text>
    );
    if (index === 0)
        return (
            <ActionButton
                width={Dimensions.get("window").width - 48}
                height={48}
                borderRadius={24}
                backgroundColor="#ffde00"
                componentCenter={
                    <Typo fontWeight="600" lineHeight={18}>
                        {TextComponent}
                    </Typo>
                }
                onPress={onPress}
            />
        );
    else
        return (
            <ActionButton
                width={Dimensions.get("window").width - 48}
                height={48}
                borderRadius={24}
                borderWidth={1}
                borderStyle="solid"
                borderColor="#eaeaea"
                backgroundColor="#ffffff"
                componentCenter={
                    <Typo fontWeight="600" lineHeight={18}>
                        {TextComponent}
                    </Typo>
                }
                onPress={onPress}
            />
        );
};

class ContentDetailsScreenTemplate extends React.Component {
    state = {
        progressBarActive: new Animated.Value(0),
        progressBarTarget: 80,
        showMenu: false,
        callPage: this.props.callPage,
        item: this.props.itemDetails,
        index: this.props.index,
        m2uFailed: false,
        errorMessage: "",
        showRedeemNow: false,
        showCountdown: false,
        showBrowser: false,
        browserUrl: "",
        browserTitle: "",
        isOnboard: false,
    };

    static propTypes = {
        callPage: PropTypes.string.isRequired,
        itemDetails: PropTypes.object.isRequired,
        index: PropTypes.number.isRequired,
        onGoBack: PropTypes.func,
        navigation: PropTypes.object.isRequired,
        onCTAPressed: PropTypes.func.isRequired,
        updateModel: PropTypes.func,
        getModel: PropTypes.func,
        ctaMapper: PropTypes.func,
        logTopMenuItem: PropTypes.func,
        logLikeButton: PropTypes.func,
        logItemTopMenuPress: PropTypes.func,
        logCTAPressed: PropTypes.func,
        isArticleMode: PropTypes.any,
    };

    menuArray = [
        {
            menuLabel: "Not Interested in This",
            menuParam: "notInterested",
        },
    ];

    menuArrayLiked = [
        {
            menuLabel: "Share",
            menuParam: "share",
        },
    ];

    componentDidMount() {
        // isOnboard && this.updateCount();
        this._checkIsOnboard();
        this._animateItemsLeftProgressBar();
        this._validatePromotionsValidity();
        this._checkVoucherMode();
    }

    _checkIsOnboard = () => {
        const { getModel } = this.props;
        const { isOnboard } = getModel("user");

        isOnboard && this.setState({ isOnboard: true });
    };

    updateCount = async () => {
        const { id } = this.props.itemDetails;

        if (id) {
            try {
                const count = await updatePromosSeenCount(id);

                if (count) {
                    // sweet do nothing
                }
            } catch (error) {
                // not so sweet but what to do.
            }
        }
    };

    _checkVoucherMode = () => {
        const { callPage, item } = this.state;
        if (callPage && callPage.toLowerCase().includes("voucher")) {
            // enable voucher mode
            this.setState({ voucherMode: true });

            // if voucher is null, means voucher code is missing. you can only go back
            if (!item.voucher) {
                this._onBackPress();
                showErrorToast({
                    message: "Unable to retrieve voucher code.\nPlease try again later.",
                });
            }
        }
    };

    _animateItemsLeftProgressBar = () =>
        Animated.timing(this.state.progressBarActive, {
            toValue: this.state.progressBarTarget,
            duration: 4000,
        }).start();

    _validatePromotionsValidity = () => {
        const {
            item: { promoValidDate },
        } = this.state;
        if (
            promoValidDate &&
            promoValidDate.end &&
            calcDateIsAfterNow(promoValidDate.end) &&
            calcDateIsBeforeNow(promoValidDate.start)
        ) {
            this._prepareCountdown(promoValidDate.end);
            this.setState({ showRedeemNow: true });
        }
    };

    _prepareCountdown = async (endDate) => {
        const Seconds_Between_Dates = calcSecondsToDate(endDate);
        //TODO: Remove hardcoded url
        this.setState({
            showCountdown: true,
            countdownLength: Seconds_Between_Dates,
            countdownTitle: "Promo ends in",
            countdownImageUrl: "",
        });
    };

    _onBackPress = () => {
        const {
            onGoBack,
            callPage,
            index,
            navigation: { goBack },
        } = this.props;

        if (onGoBack) {
            onGoBack(this.state.item, index, callPage);
        }

        goBack();
    };

    _handleTopMenuItemPress = async (param) => {
        this.setState({ showMenu: false }, () => {
            if (param.toLowerCase() === "share") {
                setTimeout(() => {
                    this._sharePromo();
                }, 500);
            } else {
                this._requestDislikeContent(this.state.item.id.toString());
            }
        });
        if (this.props.isArticleMode) {
            FAArticleScreen.onSelectNotInterested(this.state.item.title);
        } else {
            this.props.logItemTopMenuPress(this.state.item.title);
        }
    };

    _sharePromo = async () => {
        try {
            const { promoCode, summary, firstCTAUrl } = this.state.item;
            let message = "";
            // strip off html tags from content
            const sanitizedSummary = summary.replace(/<\/?[^>]+(>|$)/g, "");
            if (promoCode) {
                message = PROMO_CODE_SHARE_MSG.replace("{PROMO_CODE}", promoCode).replace(
                    "{PROMO_TITLE}",
                    sanitizedSummary
                );
            } else {
                if (firstCTAUrl)
                    message = PROMO_LINK_SHARE_MSG.replace("{PROMO_LINK}", firstCTAUrl).replace(
                        "{PROMO_TITLE}",
                        sanitizedSummary
                    );
            }
            await Share.open({ message })
                .then((res) => {
                    console.log("[ContentDetailsScreenTemplate] >> [_sharePromo] then ", res);
                })
                .catch((err) => {
                    console.log("[ContentDetailsScreenTemplate] >> [_sharePromo] err ", err);
                });
        } catch (error) {
            ErrorLogger(error);
        }
    };

    _requestDislikeContent = async (id) => {
        try {
            const { getModel } = this.props;
            const { cmsUrl, cmsCloudEnabled } = getModel("cloud");
            const endpoint = cmsCloudEnabled ? cmsUrl : `${ENDPOINT_BASE}/user/v2/users`;
            const response = await disLikeHomeContent(endpoint, id);
            const result = response.data.result;
            const updatedItem = this.state.item;
            if (
                updatedItem.userContent !== null &&
                updatedItem.userContent.emotionStatus === "LIKE"
            ) {
                updatedItem.likeCount--;
            }
            updatedItem.userContent.emotionStatus = result.emotionStatus;
            this.setState({ item: updatedItem });
        } catch (error) {
            ErrorLogger(error);
        }
    };

    _requestLikeContent = async () => {
        try {
            const {
                item: { id },
            } = this.state;

            const { getModel } = this.props;
            const { cmsUrl, cmsCloudEnabled } = getModel("cloud");
            const endpoint = cmsCloudEnabled ? cmsUrl : `${ENDPOINT_BASE}/user/v2/users`;

            const response = await LikeHomeContent(endpoint, id.toString());
            const result = response.data.result;
            const updatedItem = this.state.item;
            if (
                updatedItem.userContent !== null &&
                updatedItem.userContent.emotionStatus === "LIKE"
            ) {
                updatedItem.likeCount--;
            } else {
                updatedItem.likeCount++;
            }
            updatedItem.userContent.emotionStatus = result.emotionStatus;
            this.setState({ item: updatedItem });
        } catch (error) {
            ErrorLogger(error);
        }
        if (this.props.isArticleMode) {
            FAArticleScreen.onRequestLikeAricle(this.state.item.title);
        } else {
            this.props.logLikeButton(this.state.item.title);
        }
    };

    _requestBookmarkContent = async () => {
        try {
            const {
                item: { id },
            } = this.state;
            const response = await BookmarkHomeContent(id.toString());
            const result = response.data.result;
            const updatedItem = this.state.item;
            updatedItem.userContent.isBookmarked = result.isBookmarked;
            // if (result.isBookmarked)
            //     CustomFlashMessage.showContentSaveMessage(
            //         "Saved to bookmark",
            //         "",
            //         "bottom",
            //         "info"
            //     );
            // else
            //     CustomFlashMessage.showContentSaveMessage(
            //         "Removed from bookmark",
            //         "",
            //         "bottom",
            //         "info"
            //     );
            this.setState({ item: updatedItem });
        } catch (error) {
            ErrorLogger(error);
        }
    };

    _redeemPromo = async () => {
        try {
            const {
                item: { promoCode },
            } = this.state;

            // await AsyncStorage.setItem("promosApplyCode", promoCode.toString());
            const { updateModel } = this.props;
            updateModel({
                qrPay: { promosApplyCode: promoCode },
            });

            this._navigateToQrPay();
        } catch (error) {
            ErrorLogger(error);
        }
    };

    _navigateToQrPay = async () => {
        const { getModel } = this.props;
        const { isEnabled: qrEnabled } = getModel("qrPay");

        if (!qrEnabled) {
            this.props.navigation.navigate(navigationConstant.QR_STACK, {
                screen: "QrStart",
                params: { primary: true, settings: false },
            });
        } else {
            this.props.navigation.navigate(navigationConstant.QR_STACK, {
                screen: "QrMain",
                params: {
                    primary: true,
                    settings: false,
                    fromRoute: "",
                    fromStack: "",
                },
            });
        }

        // try {
        //     const results = await AsyncStorage.multiGet([
        //         "mayaMobileNo",
        //         "walletId",
        //         "m2uUserName",
        //         "cusKey",
        //         "qrReady",
        //         "qrEnabled",
        //     ]);
        //     const [mayaMobileNo, walletId, m2uUserName, cusKey, qrReady, qrEnabled] = results.map(
        //         (result) => result[1]
        //     );
        //     ModelClass.COMMON_DATA.mobileNo = mayaMobileNo;
        //     ModelClass.COMMON_DATA.walletScreenIndex = 0;
        //     if (
        //         walletId === null ||
        //         m2uUserName == null ||
        //         m2uUserName == "null" ||
        //         qrReady === null ||
        //         qrReady === "false"
        //     )
        //         NavigationService.navigateToModule(
        //             navigationConstant.WALLET_MODULE,
        //             navigationConstant.WALLET_LOGIN
        //         );
        //     else {
        //         const response = await loginM2uQR(
        //             "/token",
        //             JSON.stringify({
        //                 customerKey: cusKey,
        //                 grantType: "PASSWORD",
        //                 loginFrom: "TOUCHID",
        //                 withAccounts: true,
        //                 bioEventCode: "FR",
        //             })
        //         );
        //         const authenticationObject = response.data;
        //         if (authenticationObject !== null && authenticationObject.code === "200") {
        //             ModelClass.COMMON_DATA.m2uAccessToken = authenticationObject.access_token.toString();
        //             ModelClass.COMMON_DATA.m2uAccessRefreshToken = authenticationObject.refresh_token.toString();
        //             ModelClass.COMMON_DATA.cus_type = authenticationObject.cus_type;
        //             ModelClass.TRANSFER_DATA.m2uToken = null;
        //             ModelClass.QR_DATA.isCard = false;
        //             ModelClass.QR_DATA.primary = true;
        //             ModelClass.QR_DATA.fromWallet = false;
        //             ModelClass.QR_DATA.account = ModelClass.QR_DATA.primaryAccount;
        //             ModelClass.SPLIT_BILL_DATA.billAccount = ModelClass.QR_DATA.primaryAccount;
        //             ModelClass.QR_DATA.navigationModule = navigationConstant.HOME_DASHBOARD;
        //             ModelClass.QR_DATA.navigationRoute = navigationConstant.HOME_DASHBOARD;
        //             ModelClass.COMMON_DATA.walletScreenIndex = 0;
        //             if (qrEnabled === null || qrEnabled === "false") {
        //                 ModelClass.QR_DATA.quickAction = false;
        //                 NavigationService.navigateToModule(
        //                     navigationConstant.WALLET_MODULE,
        //                     navigationConstant.QRPAY_START,
        //                     {
        //                         routeFrom: navigationConstant.WALLET_TAB_SCREEN,
        //                         routeTo: navigationConstant.QRPAY_LOGIN,
        //                         routeFromModule: navigationConstant.WALLET_MODULE,
        //                         routeToModule: navigationConstant.WALLET_MODULE,
        //                     }
        //                 );
        //             } else {
        //                 NavigationService.navigateToModule(
        //                     navigationConstant.WALLET_MODULE,
        //                     navigationConstant.QRPAY_MAIN
        //                 );
        //             }
        //         } else {
        //             this.setState({ m2uFailed: true, errorMessage: authenticationObject.message });
        //         }
        //     }
        // } catch (error) {
        //     ErrorLogger(error);
        //     this.setState({ m2uFailed: true, errorMessage: "M2U login failed" });
        // }
    };

    _onMoreOptionButtonPressed = () => {
        this.setState({ showMenu: true });
        if (this.props.isArticleMode) {
            FAArticleScreen.onMorePressed(this.state.item.title);
        } else {
            this.props.logTopMenuItem(this.state.item.title);
        }
    };

    _onTopMenuCloseButtonPressed = () => this.setState({ showMenu: false });

    _ctaKeyExtractor = (item) => item.url;

    _onCloseBrowser = () => this.setState({ showBrowser: false, browserTitle: "", browserUrl: "" });

    _handleCTA = async ({ cta }) => {
        // Use this to test different CTAs
        // const ctaTest = { action: "BANKING_MAETOPUP", url: "TEST123" };
        const ctaMapped = await this.props.ctaMapper(cta);

        console.log("ctaMapped", ctaMapped);

        //GA integration - promotions
        if (this.props.isArticleMode) {
            FAArticleScreen.onCTAPressed(this.state.item?.title, cta);
        } else {
            this.props.logCTAPressed(this.state.item.title, cta.title);
        }

        if (ctaMapped.module) {
            if (ctaMapped.screen) {
                if (ctaMapped.screen === "PromotionDetailsScreen") {
                    this.props.navigation.push(ctaMapped.module, {
                        screen: ctaMapped.screen,
                        params: ctaMapped?.params,
                    });
                } else {
                    this.props.navigation.navigate(ctaMapped.module, {
                        screen: ctaMapped.screen,
                        params: ctaMapped?.params,
                    });
                }
            } else {
                this.props.navigation.navigate(ctaMapped.module, {
                    ...ctaMapped?.params,
                });
            }
        }
        // }
    };

    _renderCTAs = (ctas) => {
        const { item } = this.state;
        return (
            <View style={styles.ctaButtonsContainer}>
                {ctas.map((cta, index) => (
                    <View style={styles.ctaItem} key={`cta-${index}`}>
                        <CTAButton
                            item={item}
                            cta={cta}
                            index={index}
                            onCTAPressed={this._handleCTA}
                        />
                    </View>
                ))}
            </View>
        );
    };

    _renderCountdown = () => {
        const { showCountdown, countdownLength, countdownTitle } = this.state;
        if (showCountdown)
            return (
                <View style={styles.countdownContainer}>
                    <CountdownCard
                        show={showCountdown}
                        length={countdownLength}
                        title={countdownTitle}
                        image={assets.countdownBg}
                    />
                </View>
            );
        return null;
    };

    _renderPromoDate = () => {
        const { item } = this.state;
        if (item.promoValidDate && item.promoValidDate.start && item.promoValidDate.end)
            return (
                <View style={styles.validityContainer}>
                    <Image
                        source={require("@assets/icons/time.png")}
                        style={styles.promoValidDateImage}
                    />
                    <Typo textAlign="left" lineHeight={15} fontSize={12} color="#7c7c7d">
                        <Text>
                            Valid till {moment(item.promoValidDate.end).format("DD MMM YYYY")}
                        </Text>
                    </Typo>
                </View>
            );
        return null;
    };

    _renderSaveButton = () => {
        const { item, showRedeemNow } = this.state;
        if (showRedeemNow)
            return (
                <View style={styles.ctaButtonsContainerTwo}>
                    <ActionButton
                        fullWidth
                        height={48}
                        borderRadius={24}
                        borderWidth={1}
                        borderStyle="solid"
                        borderColor="#eaeaea"
                        backgroundColor="#ffffff"
                        componentCenter={
                            <Typo fontWeight="600" lineHeight={18}>
                                <Text>
                                    {item.userContent !== null && item.userContent.isBookmarked
                                        ? "Saved"
                                        : "Save and Use Later"}
                                </Text>
                            </Typo>
                        }
                        onPress={this._requestBookmarkContent}
                    />
                </View>
            );
        return null;
    };

    _copyToClipboard = () => {
        const copyToClipboard = this.state.item.voucher ?? "";
        Clipboard.setString(copyToClipboard);

        showInfoToast({
            message: "Voucher copied to clipboard.",
        });
    };

    _renderVoucherButton = () => {
        const { item } = this.state;

        return (
            <View style={voucherBtnStyles.container}>
                <View style={voucherBtnStyles.titleContainer}>
                    <Typo lineHeight={20} fontSize={14} text="Promo code:" />
                </View>
                <ActionButton
                    fullWidth
                    height={46}
                    borderRadius={9}
                    borderWidth={1}
                    borderStyle="solid"
                    borderColor={YELLOW}
                    backgroundColor={YELLOW}
                    componentLeft={
                        <View style={voucherBtnStyles.codeContainer}>
                            <Typo
                                fontWeight="600"
                                lineHeight={26}
                                fontSize={22}
                                text={item.voucher}
                            />
                        </View>
                    }
                    componentRight={
                        <Image source={assets.inviteCodeCopy} style={voucherBtnStyles.icon} />
                    }
                    onPress={this._copyToClipboard}
                />
                <View style={voucherBtnStyles.footerContainer}>
                    <Barcode
                        value={item.voucher}
                        width={item.voucher.length > 12 ? 1.25 : 2.0}
                        height={80}
                        format="CODE128"
                        background={MEDIUM_GREY}
                    />
                </View>
                <View style={voucherBtnStyles.footerContainer}>
                    <Typo
                        fontWeight="600"
                        lineHeight={20}
                        fontSize={14}
                        text="Your promo code has been automatically saved in the Saved section"
                    />
                </View>
            </View>
        );
    };

    _handleContentLinkPress = (evt, href) => {
        this.setState({
            showBrowser: true,
            browserTitle: href,
            browserUrl: href,
        });
    };

    _renderHTMLContent = () => {
        const { item } = this.state;
        console.log(item);
        if (item.fullText !== null && item.fullText.length > 0)
            return (
                <View style={styles.moreDetailsDescriptionContainer}>
                    <HTML
                        {...DEFAULT_PROPS}
                        html={item.fullText}
                        baseFontStyle={{ fontFamily: "montserrat" }}
                        listsPrefixesRenderers={{
                            ol: (_htmlAttribs, _children, _convertedCSSStyles, passProps) => (
                                <Text
                                    style={{
                                        color: BLACK,
                                        marginRight: 6,
                                        fontFamily: "montserrat",
                                        fontWeight: "normal",
                                    }}
                                >
                                    {passProps.index + 1}.
                                </Text>
                            ),
                        }}
                        onLinkPress={this._handleContentLinkPress}
                    />
                </View>
            );
        return null;
    };

    _renderRedeenNowButton = () => {
        const { item, showRedeemNow } = this.state;
        if (item.promoCode && showRedeemNow)
            return (
                <View style={styles.ctaItem}>
                    <ActionButton
                        width={Dimensions.get("window").width - 48}
                        height={48}
                        borderRadius={24}
                        backgroundColor="#ffde00"
                        componentCenter={
                            <Typo fontWeight="600" lineHeight={18}>
                                <Text>Redeem now</Text>
                            </Typo>
                        }
                        onPress={this._redeemPromo}
                    />
                </View>
            );
        return null;
    };

    _renderSummary = () => {
        const {
            item: { summary },
        } = this.state;

        if (summary)
            return (
                <HTML
                    {...DEFAULT_PROPS}
                    html={summary}
                    listsPrefixesRenderers={{
                        ol: (_htmlAttribs, _children, _convertedCSSStyles, passProps) => (
                            <Text
                                style={{
                                    color: BLACK,
                                    marginRight: 6,
                                    fontFamily: "montserrat",
                                    fontWeight: "normal",
                                }}
                            >
                                {passProps.index + 1}.
                            </Text>
                        ),
                    }}
                    baseFontStyle={{ fontFamily: "montserrat" }}
                    onLinkPress={this._handleContentLinkPress}
                />
            );
        return null;
    };

    render() {
        const { item, showBrowser, browserTitle, browserUrl, isOnboard, voucherMode, showMenu } =
            this.state;
        return (
            <React.Fragment>
                <ScreenContainer
                    backgroundType="color"
                    backgroundColor={MEDIUM_GREY}
                    showOverlay={showBrowser}
                >
                    <React.Fragment>
                        <ScreenLayout
                            paddingBottom={0}
                            paddingTop={0}
                            paddingHorizontal={0}
                            useSafeArea
                            header={
                                <HeaderLayout
                                    headerLeftElement={
                                        <HeaderBackButton onPress={this._onBackPress} />
                                    }
                                    headerRightElement={
                                        !voucherMode &&
                                        isOnboard &&
                                        item.userContent !== null &&
                                        item.userContent.emotionStatus !== "LIKE" && (
                                            <HeaderDotDotDotButton
                                                onPress={this._onMoreOptionButtonPressed}
                                            />
                                        )
                                    }
                                />
                            }
                        >
                            <React.Fragment>
                                <ScrollView
                                    style={{ backgroundColor: MEDIUM_GREY }}
                                    showsVerticalScrollIndicator={false}
                                >
                                    <ContentCard
                                        imageUrl={item.imageUrl}
                                        likeCount={item.likeCount}
                                        isLiked={
                                            item.userContent &&
                                            item.userContent.emotionStatus === "LIKE"
                                        }
                                        isBookmarked={
                                            item.userContent && item.userContent.isBookmarked
                                        }
                                        containerMode="screen"
                                        onLikeButtonPressed={this._requestLikeContent}
                                        onBookmarkButtonPressed={this._requestBookmarkContent}
                                        showFooter={!voucherMode}
                                    />

                                    {voucherMode ? (
                                        <View style={styles.voucherContentContainer}>
                                            <View style={styles.titleContainer}>
                                                <Typo
                                                    textAlign="left"
                                                    lineHeight={28}
                                                    fontWeight="600"
                                                    fontSize={20}
                                                    text={
                                                        item.voucher !== "0"
                                                            ? item.title
                                                            : "Maybe Next Time"
                                                    }
                                                />
                                            </View>
                                            <View style={styles.descriptionContainer}>
                                                {item.voucher !== "0" ? (
                                                    this._renderSummary()
                                                ) : (
                                                    <View style={styles.voucherDescContainer}>
                                                        <Typo
                                                            textAlign="left"
                                                            fontSize={14}
                                                            lineHeight={18}
                                                            text="Looks like you didn't receive a voucher code this time. Come back later and try again."
                                                        />
                                                    </View>
                                                )}
                                            </View>
                                            <View style={styles.ctaContainer}>
                                                {item.voucher !== "0" &&
                                                    this._renderVoucherButton()}
                                                {item.voucher !== "0" &&
                                                    this._renderCTAs(item.callToActions)}
                                            </View>
                                            {item.voucher !== "0" && this._renderHTMLContent()}
                                        </View>
                                    ) : (
                                        <>
                                            <View style={styles.separatorLine} />
                                            <View style={styles.contentContainer}>
                                                <View style={styles.titleContainer}>
                                                    <Typo
                                                        textAlign="left"
                                                        lineHeight={28}
                                                        fontWeight="600"
                                                        fontSize={20}
                                                        text={item.title}
                                                    />
                                                </View>
                                                <View style={styles.descriptionContainer}>
                                                    {this._renderSummary()}
                                                </View>
                                                {this._renderCountdown()}
                                                {this._renderPromoDate()}
                                                <View style={styles.ctaContainer}>
                                                    {this._renderRedeenNowButton()}
                                                    {this._renderCTAs(item.callToActions)}
                                                    {this._renderSaveButton()}
                                                </View>
                                                {this._renderHTMLContent()}
                                            </View>
                                        </>
                                    )}
                                </ScrollView>
                                <FlashMessage
                                    style={styles.flashMessage}
                                    titleStyle={styles.flashMessageText}
                                />
                            </React.Fragment>
                        </ScreenLayout>
                        <Modal
                            isVisible={showBrowser}
                            hasBackdrop={false}
                            useNativeDriver
                            style={styles.modal}
                        >
                            <Browser
                                source={{ uri: browserUrl }}
                                title={browserTitle}
                                onCloseButtonPressed={this._onCloseBrowser}
                            />
                        </Modal>
                    </React.Fragment>
                </ScreenContainer>
                <TopMenu
                    showTopMenu={showMenu}
                    onClose={this._onTopMenuCloseButtonPressed}
                    navigation={this.props.navigation}
                    menuArray={
                        item.userContent != null && item.userContent.emotionStatus === "LIKE"
                            ? this.menuArrayLiked
                            : this.menuArray
                    }
                    onItemPress={this._handleTopMenuItemPress}
                />
            </React.Fragment>
        );
    }
}

function ContentDetailsScreenTemplateWrapper(props) {
    const ctaMapper = useCtaMapper();
    return <ContentDetailsScreenTemplate ctaMapper={ctaMapper} {...props} />;
}

export default withModelContext(ContentDetailsScreenTemplateWrapper);

const voucherBtnStyles = StyleSheet.create({
    codeContainer: { marginLeft: 24 },
    container: { marginHorizontal: 24, marginTop: 24 },
    footerContainer: { marginTop: 14 },
    icon: { height: 24, marginRight: 24, resizeMode: "cover", width: 24 },
    titleContainer: { marginBottom: 4 },
});

const styles = StyleSheet.create({
    contentContainer: {
        paddingHorizontal: 0,
    },
    countdownContainer: {
        marginBottom: 0,
    },
    ctaButtonsContainer: { marginTop: 8 },
    ctaButtonsContainerTwo: { marginTop: 24 },
    ctaContainer: {
        marginHorizontal: 24,
    },
    ctaItem: { marginTop: 16 },
    descriptionContainer: {
        marginBottom: 0,
        // marginHorizontal: 24,
        marginTop: 24,
    },
    flashMessage: {
        marginBottom: 30,
        textAlign: "center",
    },
    flashMessageText: {
        fontFamily: "montserrat",
    },
    modal: {
        margin: 0,
    },
    moreDetailsDescriptionContainer: {
        marginBottom: 24,
        marginTop: 24,
    },
    promoValidDateImage: { height: 20, marginRight: 4, width: 20 },
    separatorLine: {
        borderColor: GREY,
        borderStyle: "solid",
        borderWidth: StyleSheet.hairlineWidth,
        marginBottom: 24,
        marginHorizontal: 24,
        marginTop: 4,
        width: width - 48,
    },
    titleContainer: {
        marginHorizontal: 24,
    },
    validityContainer: {
        alignItems: "center",
        flexDirection: "row",
        marginHorizontal: 24,
        marginTop: 24,
    },
    voucherContentContainer: {
        paddingTop: 24,
    },
    voucherDescContainer: {
        marginHorizontal: 24,
    },
});
