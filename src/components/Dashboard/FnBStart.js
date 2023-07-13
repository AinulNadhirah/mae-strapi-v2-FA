import { useRoute, useFocusEffect } from "@react-navigation/native";
import PropTypes from "prop-types";
import React, { useState, useEffect, useCallback } from "react";
import { View, ImageBackground, StyleSheet } from "react-native";

import { FNB_MODULE, FNB_TAB_SCREEN } from "@navigation/navigationConstant";

import { TouchableSpring, Animated } from "@components/Animations/TouchableSpring";
import ActionButton from "@components/Buttons/ActionButton";
import Typo from "@components/Text";

import { logEvent } from "@services/analytics";

import { WHITE, YELLOW, SHADOW, SHADOW_LIGHT, MEDIUM_GREY } from "@constants/colors";
import { FA_FIELD_INFORMATION, FA_SCREEN_NAME, FA_SELECT_FOOD } from "@constants/strings";

import useFestive from "@utils/useFestive";

import Images from "@assets";

import FnBLoader from "./FnBLoader";

const styles = StyleSheet.create({
    fnbAction: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    fnbActionContainer: {
        flexDirection: "row",
    },
    fnbCardBg: {
        height: "100%",
        width: "100%",
    },
    fnbCardBgImg: {
        borderRadius: 8,
    },
    fnbContainer: {
        backgroundColor: MEDIUM_GREY,
        paddingBottom: 36,
        paddingHorizontal: 24,
    },
    fnbContainerCard: {
        backgroundColor: WHITE,
        borderRadius: 8,
        elevation: 8,
        height: 144,
        shadowColor: SHADOW_LIGHT,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 1,
        shadowRadius: 16,
    },
    fnbContainerInner: {
        padding: 16,
    },
    fnbContent: {
        marginBottom: 16,
    },
    fnbDescription: {
        textShadowColor: SHADOW,
        textShadowOffset: {
            width: 0,
            height: 0,
        },
        textShadowRadius: 4,
    },
    fnbTitle: {
        marginBottom: 4,
        textShadowColor: SHADOW,
        textShadowOffset: {
            width: 0,
            height: 2,
        },
        textShadowRadius: 5,
    },
});

function FnBStart({ navigation }) {
    const [loading, setLoading] = useState(false);
    const [fnbBg, setFnbBg] = useState(null);
    const route = useRoute();

    function handleFnBStart() {
        logEvent(FA_SELECT_FOOD, {
            [FA_SCREEN_NAME]: "Dashboard",
            [FA_FIELD_INFORMATION]: "Food Near Me",
        });

        navigation.navigate(FNB_MODULE, {
            screen: FNB_TAB_SCREEN,
        });
    }
    const { festiveAssets } = useFestive();

    const getFnb = useCallback(() => {
        setLoading(true);
        setFnbBg(Images.foodBannerDashboard);
        // after call API
        setLoading(false);
    }, []);

    useFocusEffect(
        useCallback(() => {
            const isRefreshing = route.params?.refresh;

            if (isRefreshing) {
                getFnb();
            }

            return () => {};
        }, [route, getFnb])
    );

    useEffect(() => {
        getFnb();
    }, [getFnb]);

    return (
        <View style={styles.fnbContainer}>
            <TouchableSpring onPress={handleFnBStart}>
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
                        {loading && <FnBLoader />}
                        {!loading && (
                            <View style={styles.fnbContainerCard}>
                                <ImageBackground
                                    source={fnbBg}
                                    style={styles.fnbCardBg}
                                    imageStyle={styles.fnbCardBgImg}
                                >
                                    <View style={styles.fnbContainerInner}>
                                        <View style={styles.fnbContent}>
                                            <Typo
                                                fontSize={14}
                                                fontWeight="600"
                                                lineHeight={18}
                                                text={festiveAssets?.fnB?.fnBTitle}
                                                textAlign="left"
                                                color={WHITE}
                                                style={styles.fnbTitle}
                                            />
                                            <Typo
                                                fontSize={14}
                                                fontWeight="normal"
                                                lineHeight={18}
                                                text={festiveAssets?.fnB?.fnBDescription}
                                                color={WHITE}
                                                textAlign="left"
                                                style={styles.fnbDescription}
                                            />
                                        </View>
                                        <View style={styles.fnbActionContainer}>
                                            <ActionButton
                                                activeOpacity={0.8}
                                                backgroundColor={YELLOW}
                                                borderRadius={15}
                                                height={30}
                                                componentCenter={
                                                    <Typo
                                                        fontSize={12}
                                                        fontWeight="600"
                                                        lineHeight={15}
                                                        text={festiveAssets?.fnB?.btnTitile}
                                                    />
                                                }
                                                style={styles.fnbAction}
                                                onPress={handleFnBStart}
                                            />
                                        </View>
                                    </View>
                                </ImageBackground>
                            </View>
                        )}
                    </Animated.View>
                )}
            </TouchableSpring>
        </View>
    );
}

FnBStart.propTypes = {
    navigation: PropTypes.object,
};

export default FnBStart;
