import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { View, StyleSheet, Animated } from "react-native";
import * as Animatable from "react-native-animatable";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";

import { MEDIUM_GREY } from "@constants/colors";
import { ARTICLE } from "@constants/strings";

import Assets from "@assets";

function ArticleDetailsScreen({ route, navigation }) {
    this.bannerAnimate = new Animated.Value(0);
    const [isDetailsView, setDetailsView] = useState([]);
    const [isDetailsViewIndex, setDetailsViewIndex] = useState(0);

    function onBackTap() {
        navigation.goBack();
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

    useEffect(() => {
        init();
    }, []);

    const init = async () => {
        const { data, index } = route.params;
        setDetailsView(data);
        setDetailsViewIndex(index);
    };

    return (
        <ScreenContainer
            backgroundType="color"
            backgroundColor={MEDIUM_GREY}
            analyticScreenName={`Articles_${isDetailsView}`}
        >
            <ScreenLayout
                paddingBottom={0}
                paddingTop={0}
                paddingHorizontal={0}
                useSafeArea
                header={
                    <HeaderLayout
                        headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                        headerCenterElement={
                            <Typo text={ARTICLE} fontWeight="600" fontSize={16} lineHeight={19} />
                        }
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
                            source={isDetailsViewIndex ? Assets.articleTwo : Assets.articleOne}
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
                                    fontSize={18}
                                    lineHeight={25}
                                    fontWeight="600"
                                    fontStyle="normal"
                                    textAlign="left"
                                    text={isDetailsView?.name}
                                    style={styles.textAlign}
                                />
                                <Typo
                                    fontSize={14}
                                    lineHeight={20}
                                    fontWeight="400"
                                    letterSpacing={0}
                                    textAlign="left"
                                    text={isDetailsView?.value}
                                    style={styles.textAlign}
                                />
                            </View>
                        </View>
                    </Animated.ScrollView>
                </View>
            </ScreenLayout>
        </ScreenContainer>
    );
}

ArticleDetailsScreen.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentArea: {
        marginHorizontal: 36,
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
    textAlign: {
        paddingBottom: 20,
    },
});

export default ArticleDetailsScreen;
