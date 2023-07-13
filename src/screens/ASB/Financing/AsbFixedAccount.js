import PropTypes from "prop-types";
import React from "react";
import { View, StyleSheet, Animated } from "react-native";
import * as Animatable from "react-native-animatable";
import LinearGradient from "react-native-linear-gradient";

import { FIXED_DEPOSIT_STACK } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";

import { withModelContext } from "@context";

import { MEDIUM_GREY, BLACK, YELLOW } from "@constants/colors";
import { APPLY_NOW, EFIXED_DEPOSIT, GROW_DEPOSIT } from "@constants/strings";

import Assets from "@assets";

const AsbFixedAccount = ({ navigation }) => {
    this.bannerAnimate = new Animated.Value(0);
    function onBackPress() {
        navigation.goBack();
    }

    function _handleFDCardPressed() {
        navigation.navigate(FIXED_DEPOSIT_STACK, {
            screen: "FDEntryPointValidationScreen",
            params: {
                fdEntryPointModule: "More",
                fdEntryPointScreen: "Apply",
            },
        });
    }

    const animateBanner = () => {
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

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <ScreenLayout
                paddingBottom={0}
                paddingTop={0}
                paddingHorizontal={0}
                useSafeArea
                header={
                    <HeaderLayout
                        headerLeftElement={<HeaderBackButton onPress={onBackPress} />}
                        headerRightElement={<HeaderCloseButton onPress={onBackPress} />}
                    />
                }
                neverForceInset={["bottom"]}
                paddingLeft={0}
                paddingRight={0}
            >
                <View style={styles.container}>
                    <Animated.View style={[styles.promotionImage, animateBanner()]}>
                        <Animatable.Image
                            animation="fadeInUp"
                            duration={300}
                            source={Assets.fdAccount}
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
                            <View style={styles.contentArea}>
                                <View style={styles.alignLR}>
                                    <Typo
                                        fontSize={14}
                                        fontWeight="400"
                                        fontStyle="normal"
                                        lineHeight={21}
                                        textAlign="left"
                                        text={EFIXED_DEPOSIT}
                                    />
                                    <Typo
                                        fontSize={16}
                                        lineHeight={24}
                                        fontWeight="600"
                                        letterSpacing={0}
                                        textAlign="left"
                                        text={GROW_DEPOSIT}
                                        style={styles.titleText}
                                    />
                                </View>
                            </View>
                        </View>
                    </Animated.ScrollView>
                </View>
                <View style={styles.alignLR}>
                    <View style={styles.bottomBtnContCls}>
                        <LinearGradient
                            colors={["#efeff300", MEDIUM_GREY]}
                            style={styles.linearGradient}
                        />
                        <ActionButton
                            fullWidth
                            onPress={_handleFDCardPressed}
                            backgroundColor={YELLOW}
                            componentCenter={
                                <Typo
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={18}
                                    color={BLACK}
                                    text={APPLY_NOW}
                                />
                            }
                        />
                    </View>
                </View>
            </ScreenLayout>
        </ScreenContainer>
    );
};

AsbFixedAccount.propTypes = {
    getModel: PropTypes.func,
    navigation: PropTypes.object,
};

const styles = StyleSheet.create({
    alignLR: {
        marginHorizontal: 36,
    },

    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        paddingVertical: 25,
    },

    container: {
        flex: 1,
    },

    contentArea: {
        paddingTop: 25,
    },

    linearGradient: {
        height: 30,
        left: 0,
        position: "absolute",
        right: 0,
        top: -30,
    },
    mainContent: {
        backgroundColor: MEDIUM_GREY,
        marginTop: 240,
    },
    merchantBanner: { flex: 1, height: "100%", width: "100%" },
    promotionImage: {
        height: 240,
        position: "absolute",
        width: "100%",
    },

    titleText: { paddingTop: 10 },
});

export default withModelContext(AsbFixedAccount);
