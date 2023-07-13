import { useFocusEffect } from "@react-navigation/native";
import numeral from "numeral";
import PropTypes from "prop-types";
import React, { useRef, useCallback } from "react";
import { View, Image, Animated, StyleSheet, Dimensions } from "react-native";
import * as Animatable from "react-native-animatable";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Swiper from "react-native-swiper";

import { SETTINGS_MODULE } from "@navigation/navigationConstant";

import { TouchableSpring } from "@components/Animations/TouchableSpring";
import ActionButton from "@components/Buttons/ActionButton";
import Typo from "@components/Text";

import { useModelController } from "@context";

import { getDashboardWalletBalance } from "@services";
import { logEvent } from "@services/analytics";

import {
    WHITE,
    YELLOW,
    GREY_100,
    GREY_300,
    ACTIVE_COLOR,
    INACTIVE_COLOR,
    SHADOW,
} from "@constants/colors";
import { defaultMomentData } from "@constants/data";
import {
    FA_ACTION_NAME,
    FA_DASHBOARD,
    FA_FIELD_INFORMATION,
    FA_SCREEN_NAME,
    FA_SELECT_BANNER,
    FA_SELECT_QUICK_ACTION,
} from "@constants/strings";

import { useCtaMapper } from "@utils/ctaMapper";
import { toggleUpdateWalletBalance } from "@utils/dataModel/utilityWallet";

import Images from "@assets";

const { width } = Dimensions.get("window");
const ALT_GREY = "#efeff4";
const WHITE_FADE = "rgba(255,255,255, 0.6)";

const styles = StyleSheet.create({
    aboveFoldContainer: (topInset) => ({
        height: 272 - topInset,
        position: "relative",
        width: "100%",
    }),
    aboveFoldCutoff: {
        bottom: 0,
        height: 51,
        position: "absolute",
        right: 0,
        width: 62,
    },
    aboveFoldHeaderContainer: {
        paddingHorizontal: 24,
        paddingVertical: 16,
    },
    aboveFoldHeaderInnerContainer: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
    },
    aboveFoldInnerContainer: {
        bottom: 0,
        left: 0,
        position: "absolute",
        right: 0,
        top: 0,
    },
    momentCta: {
        marginRight: 12,
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    momentCtaInner: {
        flexDirection: "row",
    },
    momentDescription: {
        overflow: "visible",
        paddingRight: 32,
        paddingVertical: 24,
    },
    /*momentLoader: {
        backgroundColor: GREY_300,
        bottom: 0,
        flexDirection: "column",
        height: 272,
        justifyContent: "center",
        paddingHorizontal: 24,
        position: "absolute",
        right: 0,
        top: 0,
        width,
    },
    momentLoaderLine: {
        backgroundColor: GREY_100,
        borderRadius: 4,
        height: 8,
        marginBottom: 12,
        width: "50%",
    },
    momentLoaderLineNoGutter: {
        backgroundColor: GREY_100,
        borderRadius: 4,
        height: 8,
        width: "50%",
    },*/
    profileAvatar: {
        backgroundColor: WHITE,
        borderColor: WHITE,
        borderRadius: 18,
        borderStyle: "solid",
        borderWidth: 2,
        elevation: 12,
        height: 36,
        marginRight: 8,
        overflow: "hidden",
        shadowColor: SHADOW,
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 1,
        shadowRadius: 12,
        width: 36,
    },
    profileAvatarImg: {
        height: 32,
        width: 32,
    },
    profileContainer: {
        alignItems: "center",
        flex: 0.6,
        flexDirection: "row",
    },
    profileName: {
        flexDirection: "column",
    },
    swiperActiveDot: {
        backgroundColor: ACTIVE_COLOR,
        borderRadius: 3,
        height: 6,
        marginHorizontal: 4,
        width: 6,
    },
    swiperContainer: { flex: 1, position: "relative" },
    swiperDot: {
        backgroundColor: INACTIVE_COLOR,
        borderRadius: 3,
        height: 6,
        marginHorizontal: 4,
        width: 6,
    },
    swiperInnerContainer: {
        flex: 1,
        paddingBottom: 42,
        paddingHorizontal: 24,
        paddingTop: 48,
    },
    swiperPagination: {
        bottom: 16,
    },
    textWrap: { flexDirection: "row", flexWrap: "wrap" },
    walletBalanceButton: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "flex-end",
        paddingLeft: 16,
    },
    walletBalanceContainer: {
        borderRadius: 19,
        shadowColor: SHADOW,
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 1,
        shadowRadius: 15,
    },
    walletBalanceIconContainer: {
        alignItems: "center",
        backgroundColor: WHITE,
        borderRadius: 24,
        marginLeft: 8,
        padding: 3,
    },
    walletBalanceIconImg: {
        height: 24,
        width: 24,
    },
    walletBalanceIconInnerContainer: {
        alignItems: "center",
        backgroundColor: ALT_GREY,
        borderRadius: 18,
        paddingLeft: 5,
        paddingRight: 3, // not the best but following the design
        paddingVertical: 4,
    },
    walletBalanceLabel: {
        paddingVertical: 6,
    },
});

const MomentCta = ({ title, action, url, context, onPress, ...others }) => {
    function handleCta() {
        onPress({
            title,
            action,
            url,
            context,
            ...others,
        });
    }
    return (
        <ActionButton
            backgroundColor={YELLOW}
            borderRadius={15}
            height={30}
            componentCenter={<Typo fontSize={12} fontWeight="600" lineHeight={15} text={title} />}
            style={styles.momentCta}
            onPress={handleCta}
        />
    );
};

MomentCta.propTypes = {
    title: PropTypes.string,
    action: PropTypes.string,
    url: PropTypes.string,
    context: PropTypes.object,
    onPress: PropTypes.func,
};

function MomentTemplate({ moment, callback }) {
    return (
        <Animatable.View animation="fadeIn" duration={300} style={styles.swiperContainer}>
            <View style={styles.swiperInnerContainer}>
                <View style={styles.momentDescription}>
                    <Typo
                        text={moment.interpolateMessage}
                        fontWeight="normal"
                        fontSize={14}
                        lineHeight={20}
                        style={styles.textWrap}
                        textAlign="left"
                    />
                </View>
                {moment.ctaList && !!moment.ctaList.length && (
                    <View style={styles.momentCtaInner}>
                        {moment.ctaList.map((cta) => (
                            <MomentCta
                                key={`${cta.action}-${cta.title}`}
                                onPress={callback}
                                context={moment.context}
                                {...cta}
                            />
                        ))}
                    </View>
                )}
            </View>
        </Animatable.View>
    );
}

MomentTemplate.propTypes = {
    moment: PropTypes.object,
    callback: PropTypes.func,
};

const AboveTheFold = ({ moments, momentLoading, navigation, scrollX }) => {
    const safeAreaInsets = useSafeAreaInsets();
    const { getModel, updateModel } = useModelController();
    const ctaMapper = useCtaMapper();
    const swiperRef = useRef();
    const { isOnboard, fullName: profileName, profileImage } = getModel("user");
    const { showBalance, primaryAccount, isUpdateBalanceRequired, isUpdateBalanceEnabled } =
        getModel("wallet");

    async function handleCta(cta) {
        // do navigation with the cta
        const ctaMapped = await ctaMapper(cta);
            logEvent(FA_SELECT_BANNER, {
                [FA_SCREEN_NAME]: FA_DASHBOARD,
                [FA_ACTION_NAME]: cta.title,
                [FA_FIELD_INFORMATION]: cta.action,
            });
        if (ctaMapped.module) {
            if (ctaMapped.screen) {
                navigation.navigate(ctaMapped.module, {
                    screen: ctaMapped.screen,
                    params: ctaMapped?.params,
                });
            } else {
                navigation.navigate(ctaMapped.module, {
                    ...ctaMapped?.params,
                });
            }
        }
    }

    function goToOnboard() {
        navigation.navigate("Onboarding", {
            screen: "OnboardingStart",
        });
    }

    function handleGoToUpdateProfile() {
        logEvent(FA_SELECT_QUICK_ACTION, {
            [FA_SCREEN_NAME]: "Dashboard",
            [FA_ACTION_NAME]: "Profile",
        });

        if (!isOnboard) goToOnboard();
        else {
            navigation.navigate(SETTINGS_MODULE, {
                screen: "Profile",
            });
        }
    }

    function handleGoToWallet() {
        logEvent(FA_SELECT_QUICK_ACTION, {
            [FA_SCREEN_NAME]: "Dashboard",
            [FA_ACTION_NAME]: "Wallet",
        });

        if (!isOnboard) goToOnboard();
        else {
            // go to wallet
            navigation.navigate("Dashboard", {
                screen: "Menu",
                params: {
                    goTo: {
                        screen: "Wallet",
                        params: {
                            redirect: {
                                screen: "TabNavigator",
                                params: {
                                    screen: "Tab",
                                    params: {
                                        screen: "Dashboard",
                                    },
                                },
                            },
                        },
                    },
                },
            });
        }
    }

    const getWalletBalance = useCallback(async () => {
        if (isOnboard && showBalance) {
            try {
                const response = await getDashboardWalletBalance();

                if (response && response.data) {
                    const { result } = response.data;

                    if (result) {
                        updateModel({
                            wallet: {
                                primaryAccount: result,
                            },
                        });
                    }
                }
            } catch (error) {
                // error when retrieving the data
            }
        }
    }, [isOnboard, updateModel, showBalance]);

    function isMae(account) {
        return (
            account &&
            account?.type === "D" &&
            (account?.group === "0YD" || account?.group === "CCD")
        );
    }

    function getWalletBalanceLabel(balance) {
        if (!isOnboard) {
            return "Set Up Wallet";
        } else {
            if (!showBalance) return "RM ****";

            if (balance) {
                if (balance === "0.00" && isMae(primaryAccount)) {
                    return "Top Up Now";
                }

                return numeral(balance).value() > 999999.99
                    ? `RM ${numeral(balance).format("0.00a").toUpperCase() ?? "0.00"}`
                    : `RM ${balance}`;
            }

            return "-";
        }
    }

    useFocusEffect(
        useCallback(() => {
            if (isOnboard) {
                //If balnce update feature enabled from the backend
                if (isUpdateBalanceEnabled) {
                    // Defalut false
                    if (isUpdateBalanceRequired) {
                        //Trigger balance update
                        getWalletBalance();
                    }
                } else {
                    //Trigger balance update
                    getWalletBalance();
                }
            }

            return () => {
                //Resetting the wallet balance update flag
                if (isOnboard) {
                    toggleUpdateWalletBalance(updateModel, false);
                }
            };
        }, [
            navigation,
            isOnboard,
            isUpdateBalanceRequired,
            getWalletBalance,
            isUpdateBalanceEnabled,
        ])
    );

    return (
        <View style={styles.aboveFoldContainer(safeAreaInsets.top)}>
            <View style={styles.aboveFoldInnerContainer}>
                {!moments.length || momentLoading ? (
                    /*<View style={styles.momentLoader}>
                        <ShimmerPlaceHolder style={styles.momentLoaderLine} />
                        <ShimmerPlaceHolder style={styles.momentLoaderLine} />
                        <ShimmerPlaceHolder style={styles.momentLoaderLineNoGutter} />
                    </View> */
                    <MomentTemplate moment={defaultMomentData} callback={handleCta} key={1} />
                ) : (
                    <Swiper
                        animated
                        height={214}
                        loop={false}
                        key={moments.length}
                        onScroll={Animated.event(
                            [
                                {
                                    nativeEvent: { contentOffset: { x: scrollX } },
                                },
                            ],
                            { useNativeDriver: true }
                        )}
                        scrollEventThrottle={20}
                        ref={swiperRef}
                        paginationStyle={styles.swiperPagination}
                        dot={<View style={styles.swiperDot} />}
                        activeDot={
                            <Animatable.View
                                animation="bounceIn"
                                duration={750}
                                style={styles.swiperActiveDot}
                            />
                        }
                    >
                        {!momentLoading &&
                            !!moments.length &&
                            moments.map((moment, index) => (
                                <MomentTemplate
                                    moment={moment}
                                    callback={handleCta}
                                    key={`moment-${index}`}
                                />
                            ))}
                    </Swiper>
                )}
            </View>
            <View style={styles.aboveFoldHeaderContainer}>
                <View style={styles.aboveFoldHeaderInnerContainer}>
                    <TouchableSpring scaleTo={0.9} tension={150} onPress={handleGoToUpdateProfile}>
                        {({ animateProp }) => (
                            <View style={styles.profileContainer}>
                                <Animated.View
                                    style={[
                                        styles.profileAvatar,
                                        {
                                            transform: [
                                                {
                                                    scale: animateProp,
                                                },
                                            ],
                                        },
                                    ]}
                                >
                                    <Image
                                        source={
                                            profileImage
                                                ? { uri: profileImage }
                                                : Images.dashboardAvatar
                                        }
                                        style={styles.profileAvatarImg}
                                    />
                                </Animated.View>
                                <View style={styles.profileName}>
                                    <Typo
                                        text={`Hello${profileName ? "," : "!"}`}
                                        fontWeight="normal"
                                        fontSize={12}
                                        lineHeight={15}
                                        textAlign="left"
                                    />
                                    {!!profileName && (
                                        <Typo
                                            text={profileName}
                                            fontWeight="600"
                                            fontSize={14}
                                            lineHeight={18}
                                            textAlign="left"
                                            numberOfLines={1}
                                        />
                                    )}
                                </View>
                            </View>
                        )}
                    </TouchableSpring>
                    <TouchableSpring
                        scaleTo={0.9}
                        tension={150}
                        onPress={handleGoToWallet}
                        testID="dashboard_go_to_wallet"
                    >
                        {({ animateProp }) => (
                            <Animated.View
                                style={[
                                    styles.walletBalanceContainer,
                                    {
                                        backgroundColor:
                                            getWalletBalanceLabel(primaryAccount?.balance) ===
                                            "Set Up Wallet"
                                                ? WHITE
                                                : WHITE_FADE,
                                        opacity: animateProp,
                                        transform: [
                                            {
                                                scale: animateProp,
                                            },
                                        ],
                                    },
                                ]}
                            >
                                <View style={styles.walletBalanceButton}>
                                    <View style={styles.walletBalanceLabel}>
                                        {isOnboard && (
                                            <Typo
                                                text="Wallet"
                                                fontWeight="normal"
                                                fontSize={9}
                                                lineHeight={11}
                                                textAlign="right"
                                            />
                                        )}

                                        <Typo
                                            text={getWalletBalanceLabel(primaryAccount?.balance)}
                                            fontWeight="600"
                                            fontSize={12}
                                            lineHeight={15}
                                            textAlign="right"
                                        />
                                    </View>
                                    <View style={styles.walletBalanceIconContainer}>
                                        <View style={styles.walletBalanceIconInnerContainer}>
                                            <Image
                                                source={Images.walletLineBlack}
                                                style={styles.walletBalanceIconImg}
                                            />
                                        </View>
                                    </View>
                                </View>
                            </Animated.View>
                        )}
                    </TouchableSpring>
                </View>
            </View>
            <View style={styles.aboveFoldCutoff}>
                <Image source={Images.dashboardMomentCutoff} width={62} height={51} />
            </View>
        </View>
    );
};

AboveTheFold.propTypes = {
    isRefresh: PropTypes.number,
    isOnboard: PropTypes.bool,
    moments: PropTypes.array,
    momentLoading: PropTypes.bool,
    profileName: PropTypes.string,
    profileImage: PropTypes.string,
    navigation: PropTypes.object,
    getModel: PropTypes.func,
    updateModel: PropTypes.func,
    scrollX: PropTypes.object,
};

export default AboveTheFold;
