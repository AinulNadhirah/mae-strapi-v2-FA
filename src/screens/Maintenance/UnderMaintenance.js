import PropTypes from "prop-types";
import React, { useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import * as Animatable from "react-native-animatable";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";

import { MEDIUM_GREY } from "@constants/colors";

import assets from "@assets";

function UnderMaintenance({ route, navigation }) {
    const bgAnimate = useRef(new Animated.Value(1));
    const { title, message } = route.params;

    // const [error, setError] = useState({
    //     title: "title",
    //     message: "message",
    // });

    function handleClose() {
        navigation.replace("Splashscreen");
    }

    function bgScale() {
        return {
            transform: [
                {
                    scale: bgAnimate.current.interpolate({
                        inputRange: [-200, 0, 1],
                        outputRange: [1.2, 1, 1],
                    }),
                },
                {
                    translateY: bgAnimate.current.interpolate({
                        inputRange: [-200, 0, 240],
                        outputRange: [0, 0, -100],
                    }),
                },
            ],
        };
    }

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <>
                <ScreenLayout
                    paddingBottom={0}
                    paddingTop={0}
                    paddingHorizontal={0}
                    header={
                        <HeaderLayout
                            headerRightElement={
                                <Animatable.View
                                    animation="fadeInDown"
                                    duration={200}
                                    delay={1000}
                                    style={styles.headerClose}
                                >
                                    <HeaderCloseButton onPress={handleClose} />
                                </Animatable.View>
                            }
                        />
                    }
                >
                    <View style={styles.container}>
                        <Animated.View style={[styles.bgContainer, bgScale()]}>
                            <Animatable.Image
                                animation="fadeInUp"
                                source={assets.underMaintenanceBg}
                                style={styles.bgImage}
                                useNativeDriver
                            />
                        </Animated.View>
                        <View style={styles.scrollContainer}>
                            <Animated.ScrollView
                                scrollEventThrottle={16}
                                onScroll={Animated.event(
                                    [
                                        {
                                            nativeEvent: {
                                                contentOffset: { y: bgAnimate.current },
                                            },
                                        },
                                    ],
                                    { useNativeDriver: true }
                                )}
                                showsVerticalScrollIndicator={false}
                                contentInsetAdjustmentBehavior="automatic"
                            >
                                <View style={styles.copyContainer}>
                                    <Animatable.View
                                        animation="fadeInUp"
                                        delay={500}
                                        style={styles.titleContainer}
                                        useNativeDriver
                                    >
                                        <Typo
                                            fontWeight="bold"
                                            fontSize={18}
                                            lineHeight={32}
                                            text={title}
                                        />
                                    </Animatable.View>
                                    <Animatable.View
                                        animation="fadeInUp"
                                        delay={700}
                                        useNativeDriver
                                    >
                                        <Typo
                                            fontWeight="normal"
                                            fontSize={12}
                                            lineHeight={18}
                                            text={message}
                                        />
                                    </Animatable.View>
                                </View>
                            </Animated.ScrollView>
                        </View>
                    </View>
                </ScreenLayout>
            </>
        </ScreenContainer>
    );
}

UnderMaintenance.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
};

const styles = StyleSheet.create({
    bgContainer: {
        bottom: 0,
        height: 365,
        left: 0,
        position: "absolute",
        right: 0,
    },
    bgImage: { height: "100%", width: "100%" },
    container: {
        flex: 1,
    },
    copyContainer: {
        paddingHorizontal: 34,
        paddingVertical: 48,
    },
    headerClose: { marginBottom: 8 },
    scrollContainer: {
        height: "50%",
    },
    titleContainer: { marginBottom: 8 },
});

export default UnderMaintenance;
