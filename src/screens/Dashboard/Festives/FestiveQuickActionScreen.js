// @ts-check
import PropTypes from "prop-types";
import React, { useEffect, FunctionComponent, useState } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import * as Animatable from "react-native-animatable";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import { TouchableSpring, Animated } from "@components/Animations/TouchableSpring";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import CacheeImageWithDefault from "@components/CacheeImageWithDefault";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FullBgLoading from "@components/FullBgLoading";
import Typo from "@components/Text";

import { withModelContext } from "@context";

import { WHITE, MEDIUM_GREY, SHADOW_LIGHT } from "@constants/colors";

import useFestive from "@utils/useFestive";

const { width, height } = Dimensions.get("window");

const OptionCard: FunctionComponent = ({ onPress, title, iconSrc, noGutter = false }) => (
    <View style={!noGutter && styles.cardGutter}>
        <TouchableSpring onPress={onPress}>
            {({ animateProp }) => (
                <Animated.View
                    style={{
                        transform: [
                            {
                                scale: animateProp,
                            },
                        ],
                    }}
                >
                    <View style={styles.card}>
                        <View style={styles.cardIconContainer}>
                            <CacheeImageWithDefault
                                image={iconSrc}
                                style={styles.cardIcon}
                                resizeMode="contain"
                            />
                        </View>
                        <Typo fontSize={14} fontWeight="normal" lineHeight={20} text={title} />
                    </View>
                </Animated.View>
            )}
        </TouchableSpring>
    </View>
);

OptionCard.propTypes = {
    onPress: PropTypes.func,
    title: PropTypes.string,
    iconSrc: PropTypes.any,
    noGutter: PropTypes.bool,
    bordered: PropTypes.bool,
    smallerIcon: PropTypes.bool,
};

function FestiveQuickActionScreen({ navigation, getModel }): FunctionComponent {
    const [bgLoading, setBg] = useState(true);
    const { greetingNavigation, festiveAssets } = useFestive();
    const insets = useSafeAreaInsets();
    const insetsTop = insets.top ? insets.top + 24 : height * 0.15;

    const data = festiveAssets?.greetingSend?.mainData;

    function handleBack() {
        navigation.canGoBack() && navigation.goBack();
    }

    function handleImgLoad() {
        setBg(false);
    }

    useEffect(() => {
        return () =>
            navigation.setParams({
                screen: "",
            });
    }, [navigation]);

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <>
                <View style={styles.bgImageContainer}>
                    <CacheeImageWithDefault
                        image={festiveAssets?.greetingSend.background}
                        style={styles.bgImage}
                        resizeMode="stretch"
                        onLoad={handleImgLoad}
                    />
                </View>
                {bgLoading ? (
                    <FullBgLoading />
                ) : (
                    <ScreenLayout
                        header={
                            <HeaderLayout
                                headerLeftElement={
                                    <HeaderBackButton
                                        isWhite={!festiveAssets?.isWhiteColorOnFestive}
                                        onPress={handleBack}
                                    />
                                }
                            />
                        }
                        useSafeArea
                    >
                        <View style={[styles.wrapper, { top: insetsTop }]}>
                            <Animatable.View
                                animation="fadeInUp"
                                delay={200}
                                style={styles.copyContainer}
                                useNativeDriver
                            >
                                <Typo
                                    fontSize={22}
                                    fontWeight="600"
                                    lineHeight={28}
                                    text={data?.mainHeader}
                                    color={data?.color}
                                />
                            </Animatable.View>
                            <View style={styles.optionsContainer}>
                                {data?.options.map((card, index) => {
                                    return (
                                        <Animatable.View
                                            style={styles.copyItem}
                                            animation="fadeInUp"
                                            delay={400}
                                            useNativeDriver
                                        >
                                            <OptionCard
                                                noGutter
                                                bordered
                                                title={card.title}
                                                iconSrc={card.icon}
                                                onPress={() =>
                                                    greetingNavigation(navigation, index)
                                                }
                                            />
                                        </Animatable.View>
                                    );
                                })}
                                {/* <Animatable.View animation="fadeInUp" delay={400} useNativeDriver>
                                    <OptionCard
                                        noGutter
                                        bordered
                                        title={`Scan & Pay\e-Duit Raya`}
                                        iconSrc={Images.icScanAndPayBig}
                                        onPress={handleNavigateScanAndPay}
                                    />
                                </Animatable.View>
                                <Animatable.View animation="fadeInUp" delay={500} useNativeDriver>
                                    <OptionCard
                                        // title="Send Money"
                                        title={`Send\ne-Duit Raya`}
                                        iconSrc={tapTasticAssets["raya22"].icon}
                                        onPress={handleNavigateSendMoney}
                                        smallerIcon
                                    />
                                </Animatable.View>
                                <Animatable.View animation="fadeInUp" delay={500} useNativeDriver>
                                    <OptionCard
                                        title={`Send\ne-Greetings`}
                                        iconSrc={Images.icSendGreetingBig}
                                        onPress={handleNavigateSendGreetings}
                                        smallerIcon
                                    />
                                </Animatable.View> */}
                            </View>
                            <Animatable.View
                                animation="fadeInUp"
                                delay={700}
                                style={styles.footer}
                                useNativeDriver
                            >
                                <Typo
                                    color={data?.color}
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={18}
                                    text={data?.subHeader}
                                />
                                <Typo
                                    color={data?.color}
                                    fontSize={14}
                                    fontWeight="normal"
                                    lineHeight={18}
                                    textAlign="left"
                                    text={data?.bottomText}
                                />
                            </Animatable.View>
                        </View>
                    </ScreenLayout>
                )}
            </>
        </ScreenContainer>
    );
}

FestiveQuickActionScreen.propTypes = {
    navigation: PropTypes.object,
    getModel: PropTypes.func,
};

export const styles = StyleSheet.create({
    bgImage: {
        height: "100%",
        width: "100%",
    },
    bgImageContainer: {
        ...StyleSheet.absoluteFill,
    },
    card: {
        alignItems: "center",
        backgroundColor: WHITE,
        borderColor: MEDIUM_GREY,
        borderRadius: 8,
        borderWidth: 1.25,
        elevation: 4,
        height: 142,
        justifyContent: "flex-start",
        maxWidth: 110,
        paddingHorizontal: 1,
        paddingVertical: 24,
        shadowColor: SHADOW_LIGHT,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 1,
        shadowRadius: 16,
        width: (width - 28 - 28) / 3,
    },
    cardGutter: {
        marginLeft: 20,
    },
    cardIcon: {
        height: "100%",
        width: "100%",
    },
    cardIconContainer: {
        alignItems: "center",
        height: 58,
        justifyContent: "center",
        marginBottom: 14,
        width: 58,
    },
    copyContainer: {
        paddingBottom: 30,
        // paddingHorizontal: 24,
        // paddingTop: 132 + 58,
    },
    copyItem: { paddingHorizontal: 7 },
    footer: {
        paddingHorizontal: 24,
        paddingTop: 32,
    },
    optionsContainer: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
        width: "100%",
    },
    wrapper: {
        flex: 1,
    },
});

export default withModelContext(FestiveQuickActionScreen);
