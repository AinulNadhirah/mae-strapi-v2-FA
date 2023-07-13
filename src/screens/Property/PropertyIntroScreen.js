/* eslint-disable react/no-unused-state */
import AsyncStorage from "@react-native-community/async-storage";
import PropTypes from "prop-types";
import React, { Component, createRef, useEffect, useRef } from "react";
import { StyleSheet, View, Dimensions, TouchableOpacity, Animated } from "react-native";
import * as Animatable from "react-native-animatable";
import { useSafeArea } from "react-native-safe-area-context";
import Swiper from "react-native-swiper";

import { BANKINGV2_MODULE, PROPERTY_DASHBOARD } from "@navigation/navigationConstant";

import ActionButton from "@components/Buttons/ActionButton";
import Typo from "@components/Text";

import { withModelContext } from "@context";

import { logEvent } from "@services/analytics";

import { INACTIVE_COLOR, ACTIVE_COLOR, BLUE, MEDIUM_GREY, TRANSPARENT } from "@constants/colors";
import { FA_VIEW_SCREEN, FA_SCREEN_NAME } from "@constants/strings";

import Assets from "@assets";

const { height } = Dimensions.get("screen");

function SkipButton({ visible, onPress }) {
    const safeArea = useSafeArea();

    return (
        <Animatable.View
            useNativeDriver
            animation={visible ? "fadeInDown" : "fadeOutUp"}
            duration={300}
            style={styles.introSkip}
        >
            <TouchableOpacity onPress={onPress} style={styles.skipButton(safeArea)}>
                <Typo fontSize={14} color={BLUE} text="Skip" />
            </TouchableOpacity>
        </Animatable.View>
    );
}

SkipButton.propTypes = {
    visible: PropTypes.bool,
    onPress: PropTypes.func,
};

function IntroScreen({
    index,
    title,
    summary,
    illustration,
    imageHeight,
    onLayout,
    scrollX,
    isExiting,
}) {
    const metaRef = useRef();
    const timerRef = useRef();

    useEffect(() => {
        if (metaRef?.current) {
            if (isExiting) {
                timerRef.current = setTimeout(() => {
                    metaRef?.current.fadeOutDown(500);
                }, 100);
            }
        }

        return () => clearTimeout(timerRef.current);
    }, [isExiting]);

    function handleLayout({
        nativeEvent: {
            layout: { height },
        },
    }) {
        onLayout(height);
    }

    return (
        <View style={styles.introContainer}>
            {/*  
                This portion act as a dummy container to calculate the size of the content.
                We then use its height to calculate the proper height for the image so we
                know the max size of the image. The actual content live inside an absolute position
                container, simply to accomodate the correct size because the image needed to
                maintain an aspect ratio and it might overflow the given height, thus pushing the
                content down. When we put it inside an absolute container it'd respect the position
                since we break outside of the layout flow
             */}
            <View style={styles.introMeta} onLayout={handleLayout}>
                <View style={styles.introMetaContainer}>
                    <Typo
                        fontSize={16}
                        fontWeight="600"
                        lineHeight={18}
                        text={title}
                        style={styles.introTitle}
                    />
                    <Typo fontSize={12} lineHeight={18} text={summary} />
                </View>
            </View>

            <Animated.View style={[styles.actualImageContainer, { height: imageHeight }]}>
                <Animatable.Image
                    animation={isExiting ? "fadeOutUp" : "fadeInUp"}
                    duration={500}
                    resizeMode="stretch"
                    source={illustration}
                    style={styles.introImage}
                    useNativeDriver
                />
            </Animated.View>
            <Animatable.View
                useNativeDriver
                style={styles.actualContentContainer}
                animation="fadeInUp"
                ref={metaRef}
            >
                <Animated.View
                    style={{
                        height: height - imageHeight,
                    }}
                    useNativeDriver
                >
                    <View style={styles.introMetaContainer}>
                        <Typo
                            fontSize={16}
                            fontWeight="600"
                            lineHeight={18}
                            text={title}
                            style={styles.introTitle}
                        />
                        <Typo fontSize={12} lineHeight={18} text={summary} />
                    </View>
                </Animated.View>
            </Animatable.View>
        </View>
    );
}

IntroScreen.propTypes = {
    index: PropTypes.number,
    title: PropTypes.string,
    summary: PropTypes.string,
    illustration: PropTypes.number,
    imageHeight: PropTypes.number,
    onLayout: PropTypes.func,
    onSkip: PropTypes.func,
    isSkippable: PropTypes.bool,
    scrollX: PropTypes.object,
    isExiting: PropTypes.bool,
};

function RenderPagination({ index, total, onPress, onPaginationLayout, isExiting }) {
    const pages = [...Array(total).keys()];
    const actionRef = useRef();
    const pageRef = useRef(pages.map(() => createRef()));
    const timerRef = useRef();
    const timerPageRef = useRef(pages.map(() => createRef()));

    useEffect(() => {
        if (actionRef?.current) {
            if (isExiting) {
                timerRef.current = setTimeout(() => {
                    actionRef?.current.fadeOutDown(500);
                }, 150);

                if (pageRef?.current) {
                    pageRef.current.forEach((p, idx) => {
                        timerPageRef.current[idx] = setTimeout(() => {
                            p?.current && p?.current.fadeOutDown(250);
                        }, (idx + 1) * 250);
                    });
                }
            }
        }

        () => {
            clearTimeout(timerRef.current);
            clearTimeout(timerPageRef.current);
        };
    }, [isExiting]);

    if (total <= 1) return null;

    function handlePress() {
        onPress();
    }

    function handleLayout({
        nativeEvent: {
            layout: { height },
        },
    }) {
        onPaginationLayout(height);
    }

    return (
        <View style={styles.swiperPagination} onLayout={handleLayout}>
            <View style={styles.introNextButton}>
                <Animatable.View
                    ref={actionRef}
                    animation="fadeInUp"
                    duration={500}
                    delay={250}
                    useNativeDriver
                >
                    <ActionButton
                        componentCenter={
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={18}
                                text={index === pages.length - 1 ? "Get Started" : "Next"}
                            />
                        }
                        onPress={handlePress}
                        fullWidth
                    />
                </Animatable.View>
            </View>
            <View pointerEvents="none" style={styles.paginationContainer}>
                {pages.map((page, pageIndex) => {
                    return index === pageIndex ? (
                        <Animatable.View
                            useNativeDriver
                            key={page}
                            animation="fadeInUp"
                            duration={250}
                            ref={pageRef.current[pageIndex]}
                            style={styles.swiperActiveDot}
                        />
                    ) : (
                        <Animatable.View
                            useNativeDriver
                            animation="fadeInUp"
                            delay={pageIndex * 250}
                            duration={250}
                            ref={pageRef.current[pageIndex]}
                            key={page}
                            style={styles.swiperDot}
                        />
                    );
                })}
            </View>
        </View>
    );
}

RenderPagination.propTypes = {
    index: PropTypes.number,
    total: PropTypes.number,
    onPress: PropTypes.func,
    onPaginationLayout: PropTypes.func,
    isExiting: PropTypes.bool,
};

class PropertyIntroScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isRootedDevice: false,
            currentIndex: 0,
            paginationHeight: 0,
            highestContent: 0,
            isTncPopup: false,
            isExiting: false,
        };
        this.scrollX = new Animated.Value(1);
    }

    exitTimeout = null;

    contents = [
        {
            title: "Find your dream home",
            summary: `Browse property online from anywhere and enjoy a seamless property shopping experience.`,
            illustration: Assets.propertyIntro1,
        },
        {
            title: "Check eligibility instantly",
            summary: `Quick eligibility checks and loan calculator\nat your fingertips.`,
            illustration: Assets.propertyIntro2,
        },
        {
            title: "Fast home financing approval",
            summary: `Submit your application immediately in the app to speed up your home financing approval.`,
            illustration: Assets.propertyIntro3,
        },
    ];

    componentDidMount() {
        console.log("[PropertyIntroScreen] >> [componentDidMount]");

        this.analyticsLogEvent(0);
    }

    componentWillUnmount() {
        console.log("[PropertyIntroScreen] >> [componentWillUnmount]");

        clearTimeout(this.exitTimeout);
    }

    analyticsLogEvent = (index) => {
        console.log("[PropertyIntroScreen] >> [analyticsLogEvent]");

        const page = index + 1;
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Onboarding_Property_" + page,
        });
    };

    _setSwiperReference = (ref) => {
        console.log("[PropertyIntroScreen] >> [_setSwiperReference]");

        this.swiperReference = ref;
    };

    onIndexChanged = (index) => {
        console.log("[PropertyIntroScreen][onIndexChanged] >> index: ", index);

        this.setState({
            currentIndex: index,
        });

        this.analyticsLogEvent(index);

        // If reached the last intro slide, then update flag in AsyncStorage
        if (this.contents.length - 1 === index) {
            AsyncStorage.setItem("propertyIntro", "true");
        }
    };

    _onNextButtonPressed = () => {
        console.log("[PropertyIntroScreen] >> [_onNextButtonPressed]");

        const { currentIndex } = this.state;

        if (this.contents.length - 1 === currentIndex) {
            this.exitIntroScreen();
        } else {
            this.swiperReference.scrollBy(1, true);
        }
    };

    exitIntroScreen = () => {
        console.log("[PropertyIntroScreen] >> [exitIntroScreen]");

        // Update flag in AsyncStorage
        AsyncStorage.setItem("propertyIntro", "true");

        // Navigate to next screen
        this._navigateToNextScreen();
    };

    _navigateToNextScreen = () => {
        console.log("[PropertyIntroScreen] >> [_navigateToNextScreen]");

        const { isExiting } = this.state;

        if (!isExiting) {
            this.setState({ isExiting: true }, () => {
                this.exitTimeout = setTimeout(
                    () =>
                        this.props.navigation.replace(BANKINGV2_MODULE, {
                            screen: PROPERTY_DASHBOARD,
                        }),
                    500
                );
            });
        }
    };

    onPaginationLayout = (height) => {
        console.log("[PropertyIntroScreen] >> [onPaginationLayout]");

        this.setState({
            paginationHeight: height,
        });
    };

    onScreenLayout = (height) => {
        console.log("[PropertyIntroScreen] >> [onScreenLayout]");

        const { highestContent } = this.state;

        if (height > highestContent) this.setState({ highestContent: height });
    };

    renderPagination = (index, total, context) => (
        <RenderPagination
            index={index}
            total={total}
            context={context}
            onPress={this._onNextButtonPressed}
            onPaginationLayout={this.onPaginationLayout}
            isExiting={this.state.isExiting}
        />
    );

    render() {
        const { currentIndex, isExiting } = this.state;
        const imageHeight = height - (this.state.highestContent + this.state.paginationHeight + 25);

        return (
            <>
                <View style={styles.container}>
                    <Swiper
                        loop={false}
                        showsPagination
                        ref={this._setSwiperReference}
                        scrollEventThrottle={20}
                        renderPagination={this.renderPagination}
                        onIndexChanged={this.onIndexChanged}
                    >
                        {this.contents.map((content, index) => (
                            <View style={styles.swiperItem} key={`intro-${index}`}>
                                <IntroScreen
                                    {...content}
                                    key={content.title}
                                    index={index}
                                    onNext={this._onNextButtonPressed}
                                    imageHeight={imageHeight}
                                    onLayout={this.onScreenLayout}
                                    scrollX={this.scrollX}
                                    isExiting={isExiting}
                                />
                            </View>
                        ))}
                    </Swiper>
                    <SkipButton
                        visible={currentIndex < this.contents.length - 1 && !isExiting}
                        onPress={this.exitIntroScreen}
                    />
                </View>
            </>
        );
    }
}

PropertyIntroScreen.propTypes = {
    navigation: PropTypes.object,
};

const styles = StyleSheet.create({
    actualContentContainer: {
        alignItems: "center",
        backgroundColor: MEDIUM_GREY,
        bottom: 0,
        left: 0,
        paddingBottom: 20,
        paddingTop: 4,
        position: "absolute",
        right: 0,
    },
    actualImageContainer: {
        left: 0,
        position: "absolute",
        right: 0,
        top: 0,
    },
    container: {
        flex: 1,
        position: "relative",
    },
    introContainer: {
        flex: 1,
        position: "relative",
    },
    introImage: {
        height: "100%",
        width: "100%",
    },
    introMeta: {
        alignItems: "center",
        backgroundColor: MEDIUM_GREY,
        opacity: 0,
        paddingBottom: 20,
        paddingTop: 4,
    },
    introMetaContainer: {
        paddingHorizontal: 24,
    },
    introNextButton: {
        marginBottom: "4.5%",
        paddingHorizontal: 24,
        width: "100%",
    },
    introSkip: {
        position: "absolute",
        right: 0,
        top: 0,
    },
    introTitle: {
        marginBottom: 8,
    },
    paginationContainer: {
        flexDirection: "row",
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    skipButton: (safeArea) => ({
        paddingVertical: safeArea.top + 24,
        paddingHorizontal: 18,
    }),
    swiperActiveDot: {
        backgroundColor: ACTIVE_COLOR,
        borderRadius: 3,
        height: 6,
        marginBottom: 3,
        marginHorizontal: 4,
        marginTop: 3,
        width: 6,
    },
    swiperDot: {
        backgroundColor: INACTIVE_COLOR,
        borderRadius: 3,
        height: 6,
        marginBottom: 3,
        marginHorizontal: 4,
        marginTop: 3,
        width: 6,
    },
    swiperItem: {
        flex: 1,
    },
    swiperPagination: {
        backgroundColor: TRANSPARENT,
        bottom: 25,
        flex: 1,
        left: 0,
        position: "absolute",
        right: 0,
    },
});

export default withModelContext(PropertyIntroScreen);
