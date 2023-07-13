import PropTypes from "prop-types";
import React, { Component, createRef, useEffect, useRef } from "react";
import { StyleSheet, View, Dimensions, TouchableOpacity, Animated, Text } from "react-native";
import * as Animatable from "react-native-animatable";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Swiper from "react-native-swiper";

import { TAB_NAVIGATOR } from "@navigation/navigationConstant";

import ActionButton from "@components/Buttons/ActionButton";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { withModelContext } from "@context";

import { postIsShownSSLOnboarding } from "@services";

import {
    INACTIVE_COLOR,
    ACTIVE_COLOR,
    BLUE,
    MEDIUM_GREY,
    TRANSPARENT,
    YELLOW,
} from "@constants/colors";

const { width, height } = Dimensions.get("screen");

function SkipButton({ visible, onPress }) {
    const safeArea = useSafeAreaInsets();

    return (
        <Animatable.View
            useNativeDriver
            animation={visible ? "fadeInDown" : "fadeOutUp"}
            duration={300}
            style={styles.introSkip}
        >
            <TouchableOpacity
                onPress={onPress}
                style={styles.skipButton(safeArea)}
                testID="onboarding_intro_skip"
            >
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
                metaRef?.current?.fadeOutDown(500);
            }
        }

        () => clearTimeout(timerRef.current);
    }, [isExiting]);

    function handleLayout({
        nativeEvent: {
            layout: { height },
        },
    }) {
        onLayout(height);
    }

    const scrollMeta = (index) => {
        return {
            transform: [
                {
                    translateX: scrollX.interpolate({
                        inputRange: [(index - 1) * width, index * width, (index + 1) * width],
                        outputRange: [width / 2, 0, -width / 2],
                    }),
                },
            ],
        };
    };

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
                    style={[
                        {
                            height: height - imageHeight,
                        },
                        scrollMeta(index),
                    ]}
                >
                    <View style={styles.introMetaContainer}>
                        <Typo
                            fontSize={16}
                            fontWeight="600"
                            lineHeight={18}
                            text={title}
                            style={styles.introTitle}
                            testID={`onboarding_intro_title_${index}`}
                        />
                        <Typo
                            fontSize={12}
                            lineHeight={18}
                            text={summary}
                            testID={`onboarding_intro_descriptions_${index}`}
                        />
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
                actionRef?.current.fadeOutDown(500);

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
                                text={index == total - 1 ? "Get Started" : "Next"}
                            />
                        }
                        onPress={handlePress}
                        fullWidth
                        testID="onboarding_continue"
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

class SSLOnboarding extends Component {
    static propTypes = {
        navigation: PropTypes.object.isRequired,
        getModel: PropTypes.func,
    };

    constructor(props) {
        super(props);
        this.state = {
            isRootedDevice: false,
            currentIndex: 0,
            paginationHeight: 0,
            highestContent: 0,
            isTncPopup: false,
            isExiting: false,
            onboardingData: [],
        };
        this.scrollX = new Animated.Value(1);
    }

    exitTimeout = null;

    componentDidMount() {}

    componentWillUnmount() {
        clearTimeout(this.exitTimeout);
    }

    _setSwiperReference = (ref) => {
        this.swiperReference = ref;
    };

    _onSubmitPressed = () => {
        const { navigation } = this.props;
        this.setState({
            isTncPopup: false,
        });
        navigation.navigate(TAB_NAVIGATOR, {
            screen: "Dashboard",
        });
    };

    onIndexChanged = (index) =>
        this.setState({
            currentIndex: index,
        });

    _onNextButtonPressed = () => {
        const { currentIndex } = this.state;

        if (this.contents.length - 1 === currentIndex) {
            this.toggleTncPopup();
        } else this.swiperReference.scrollBy(1, true);
    };

    toggleTncPopup = () => {
        this.setState({
            isTncPopup: true,
        });
    };

    _navigateToNextScreen = () => {
        const { isExiting } = this.state;

        if (!isExiting) {
            this.setState({ isExiting: true }, () => {
                this.exitTimeout = setTimeout(
                    () =>
                        this.props.navigation.navigate("SSLStack", {
                            screen: "SSLStart",
                            params: { isDoneOnboarding: true },
                        }),
                    500
                );
            });
        }
    };

    onPaginationLayout = (height) =>
        this.setState({
            paginationHeight: height,
        });

    onScreenLayout = (height) => {
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

    onAgreeTnc = () => {
        this.setState({
            isTncPopup: false,
        });
        this.postIsShownSSLOnboarding({ shownSSLOnboarding: true });
    };

    renderTncPopup = () => (
        <View testID="onboarding_intro_tnc_popup">
            <View style={styles.customTncPopupContainer}>
                <Typo
                    text={this.getPopupDetails()?.title}
                    textAlign="left"
                    fontSize={14}
                    lineHeight={18}
                    fontWeight="600"
                />
            </View>
            <View style={styles.customTncPopupContent}>
                <View>
                    <Typo textAlign="left" fontSize={14} lineHeight={20} fontWeight="normal">
                        <>
                            <Text>{this.getPopupDetails()?.description}</Text>
                        </>
                    </Typo>
                </View>
            </View>
            <View style={styles.customTncPopupActionContainer}>
                <View style={styles.customTncPopupActionInnerContainer}>
                    <ActionButton
                        fullWidth
                        borderRadius={24}
                        height={48}
                        onPress={this.onAgreeTnc}
                        backgroundColor={YELLOW}
                        componentCenter={
                            <Typo
                                text={this.getPopupDetails().btnLabel}
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={18}
                                numberOfLines={1}
                                textBreakStrategys="simple"
                            />
                        }
                    />
                </View>
            </View>
        </View>
    );

    getPopupDetails = () => {
        const { isTncPopup } = this.state;
        const { route } = this.props;
        const tnc = route.params.data?.find((x) => x.id === 2)?.noteDetails[0];

        if (isTncPopup) {
            return {
                visible: true,
                title: tnc?.title,
                description: tnc?.description,
                btnLabel: tnc?.btnLable,
                ContentComponent: this.renderTncPopup,
                onClose: this._onSubmitPressed,
            };
        }

        return {
            visible: false,
        };
    };

    postIsShownSSLOnboarding = async (paramsData) => {
        console.log(`postIsShownSSLOnboarding`, paramsData);
        console.log("[SSLLanding] >> [SSLOnboarding]");

        try {
            const result = await postIsShownSSLOnboarding(paramsData);
            console.log("SSLOnboarding postIsShownSSLOnboarding", result);
            this._navigateToNextScreen();
        } catch (e) {
            console.log(`is Error`, e);

            showErrorToast({
                message: e.message,
            });
        }
    };

    render() {
        const { currentIndex, isExiting } = this.state;
        const imageHeight = height - (this.state.highestContent + this.state.paginationHeight + 25);
        const popupProp = this.getPopupDetails();

        const { route } = this.props;

        const slides = route.params.data?.find((x) => x.id === 1);
        const slide1 = slides?.noteDetails[0];
        const slide2 = slides?.noteDetails[1];
        const slide3 = slides?.noteDetails[2];

        this.contents = [
            {
                title: slide1?.title,
                summary: slide1?.description,
                illustration: require("@assets/SSL/fitness-illustration-1.png"),
            },
            {
                title: slide2?.title,
                summary: slide2?.description,
                illustration: require("@assets/SSL/tabung-illustration-2.png"),
            },
            {
                title: slide3?.title,
                summary: slide3?.description,
                illustration: require("@assets/SSL/tabung-illustration-3.png"),
            },
        ];

        return (
            <>
                <View style={styles.container} testID="onboardingIntro">
                    <Swiper
                        animated
                        loop={false}
                        showsPagination
                        ref={this._setSwiperReference}
                        onScroll={Animated.event(
                            [
                                {
                                    nativeEvent: { contentOffset: { x: this.scrollX } },
                                },
                            ],
                            { useNativeDriver: true }
                        )}
                        scrollEventThrottle={20}
                        renderPagination={this.renderPagination}
                        onIndexChanged={this.onIndexChanged}
                        testID="onboarding_intro_swiper"
                    >
                        {this.contents.map((content, index) => (
                            <View
                                style={styles.swiperItem}
                                key={`intro-${index}`}
                                testID={`onboarding_intro_screen_${index}`}
                            >
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
                        onPress={this.toggleTncPopup}
                    />
                </View>
                <Popup {...popupProp} />
            </>
        );
    }
}

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
    container: { flex: 1, position: "relative" },
    customTncPopupActionContainer: {
        paddingHorizontal: 40,
    },
    customTncPopupActionInnerContainer: {
        paddingBottom: 40,
    },
    customTncPopupContainer: {
        flexDirection: "column",
        paddingBottom: 16,
        paddingHorizontal: 40,
        paddingTop: 40,
    },
    customTncPopupContent: {
        paddingBottom: 40,
        paddingHorizontal: 40,
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
        // position: "absolute",
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

export default withModelContext(SSLOnboarding);
