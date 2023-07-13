import PropTypes from "prop-types";
import React, { useEffect } from "react";
import { View, StyleSheet, Animated } from "react-native";
import * as Animatable from "react-native-animatable";
import { useSelector } from "react-redux";

import { DASHBOARD } from "@navigation/navigationConstant";

import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Typo from "@components/Text";

import { logEvent } from "@services/analytics";

import { YELLOW, MEDIUM_GREY } from "@constants/colors";
import {
    UNABLE_TO_OFFER_U,
    UNABLE_TO_OFFER_U_DES,
    OKAY,
    FA_FORM_ERROR,
    FA_SCREEN_NAME,
    FA_TRANSACTION_ID,
} from "@constants/strings";

import Assets from "@assets";

function UnableToOfferScreen({ route, navigation }) {
    this.bannerAnimate = new Animated.Value(0);

    function oKay() {
        navigation.navigate(DASHBOARD);
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
    const prePostQualReducer = useSelector((state) => state.asbServicesReducer.prePostQualReducer);
    useEffect(() => {
        logEvent(FA_FORM_ERROR, {
            [FA_SCREEN_NAME]: "Apply_ASBFinancing_Fail",
            [FA_TRANSACTION_ID]: prePostQualReducer?.stpreferenceNo,
        });
    });

    return (
        <ScreenContainer
            backgroundType="color"
            backgroundColor="#d3e5ff"
            analyticScreenName="Apply_ASBFinancing_Fail"
        >
            <ScreenLayout
                paddingBottom={0}
                paddingTop={0}
                paddingHorizontal={0}
                useSafeArea
                neverForceInset={["bottom"]}
                paddingLeft={0}
                paddingRight={0}
            >
                <View style={styles.container}>
                    <Animated.View style={[styles.promotionImage, animateBanner()]}>
                        <Animatable.Image
                            animation="fadeInUp"
                            duration={300}
                            source={Assets.Illustration}
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
                                <Typo
                                    fontSize={16}
                                    fontWeight="600"
                                    fontStyle="normal"
                                    lineHeight={19}
                                    textAlign="left"
                                    text={UNABLE_TO_OFFER_U}
                                    style={styles.title}
                                />
                                <Typo
                                    fontSize={14}
                                    lineHeight={22}
                                    fontWeight="400"
                                    letterSpacing={0}
                                    textAlign="left"
                                    text={UNABLE_TO_OFFER_U_DES}
                                />
                            </View>
                        </View>
                    </Animated.ScrollView>
                    <FixedActionContainer>
                        <View style={styles.bottomBtnContCls}>
                            <ActionButton
                                activeOpacity={0.5}
                                backgroundColor={YELLOW}
                                fullWidth
                                componentCenter={
                                    <Typo
                                        fontSize={14}
                                        lineHeight={18}
                                        fontWeight="600"
                                        text={OKAY}
                                    />
                                }
                                onPress={oKay}
                            />
                        </View>
                    </FixedActionContainer>
                </View>
            </ScreenLayout>
        </ScreenContainer>
    );
}

UnableToOfferScreen.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

const styles = StyleSheet.create({
    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
    },
    container: {
        backgroundColor: MEDIUM_GREY,
        borderWidth: 0,
        flex: 1,
        marginTop: 30,
    },
    contentArea: {
        marginHorizontal: 36,
        paddingTop: 25,
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
    title: {
        paddingBottom: 20,
    },
});

export default UnableToOfferScreen;
