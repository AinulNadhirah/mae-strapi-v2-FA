import PropTypes from "prop-types";
import React, { useState } from "react";
import { Image, View, StyleSheet } from "react-native";

import {
    ATM_CASHOUT_CONFIRMATION,
    ATM_CASHOUT_STACK,
    ATM_NOT_AVAILABLE,
    ATM_PREFERRED_AMOUNT,
    BANKINGV2_MODULE,
    PROPERTY_DASHBOARD,
} from "@navigation/navigationConstant";

import { TouchableSpring, Animated } from "@components/Animations/TouchableSpring";

import { withModelContext } from "@context";

import { MEDIUM_GREY, SHADOW_LIGHT, WHITE } from "@constants/colors";

import Assets from "@assets";

function PropertyWidget({ navigation, isOnboard, atmData }) {
    const [imageLoaded, setLoad] = useState(false);
    const [image, setImage] = useState(
        atmData?.bannerEnabled && atmData?.featureEnabled
            ? Assets.atmBannerDashboard
            : Assets.propertyBannerDashboard
    );

    function handleOnPress() {
        console.log("[PropertyWidget] >> [handleOnPress] isOnboard: " + isOnboard);
        if (atmData?.bannerEnabled && atmData?.featureEnabled) {
            if (!isOnboard) {
                navigation.navigate("Onboarding", {
                    screen: "OnboardingStart",
                });
                return;
            }
            const screenName =
                isOnboard && atmData?.userRegistered
                    ? ATM_PREFERRED_AMOUNT
                    : ATM_CASHOUT_CONFIRMATION;
            const screenParams = atmData?.userRegistered
                ? {
                      routeFrom: "Dashboard",
                      is24HrCompleted: atmData?.userVerified,
                  }
                : null;

            const screenInfo = {
                screen: atmData.featureEnabled ? screenName : ATM_NOT_AVAILABLE,
                params: atmData.featureEnabled ? screenParams : { ...atmData },
            };
            navigation.navigate(ATM_CASHOUT_STACK, screenInfo);

            return;
        }

        if (!isOnboard) {
            navigation.navigate("Onboarding", {
                screen: PROPERTY_DASHBOARD,
            });
        } else {
            // go to the property dashboard
            navigation.navigate(BANKINGV2_MODULE, {
                screen: PROPERTY_DASHBOARD,
            });
        }
    }

    function handleImageLoad() {
        setLoad(true);
    }

    return (
        <View style={styles.mainContainer}>
            <TouchableSpring onPress={handleOnPress}>
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
                        <View style={styles.containerCard}>
                            <View
                                style={{
                                    ...StyleSheet.absoluteFill,
                                }}
                            >
                                <Image
                                    source={image}
                                    style={styles.cardBgImg}
                                    onLoad={handleImageLoad}
                                />
                            </View>
                        </View>
                    </Animated.View>
                )}
            </TouchableSpring>
        </View>
    );
}

const styles = StyleSheet.create({
    cardBgImg: {
        borderRadius: 8,
        height: "100%",
        width: "100%",
    },
    mainContainer: {
        backgroundColor: MEDIUM_GREY,
        paddingBottom: 36,
        paddingHorizontal: 24,
    },
    containerCard: {
        backgroundColor: WHITE,
        borderRadius: 8,
        elevation: 8,
        flex: 1,
        flexDirection: "row",
        height: 144,
        position: "relative",
        shadowColor: SHADOW_LIGHT,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 1,
        shadowRadius: 16,
    },
});

PropertyWidget.propTypes = {
    navigation: PropTypes.object,
    isOnboard: PropTypes.bool,
    atmData: PropTypes.object,
};

export default withModelContext(PropertyWidget);
