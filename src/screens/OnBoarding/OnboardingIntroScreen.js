import PropTypes from "prop-types";
import React, { Component, createRef, useEffect, useRef } from "react";
import {
    StyleSheet,
    View,
    Platform,
    Dimensions,
    TouchableOpacity,
    Animated,
    Text,
} from "react-native";
import * as Animatable from "react-native-animatable";
import Config from "react-native-config";
import DeviceInfo from "react-native-device-info";
import RNExitApp from "react-native-exit-app";
import RNRsaSdk from "react-native-rsa-sdk";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Swiper from "react-native-swiper";

import IntroductionScreen from "@screens/OnBoarding/Introduction/IntroductionScreen";

import { COMMON_MODULE, PDF_VIEW, TAB_NAVIGATOR } from "@navigation/navigationConstant";

import ActionButton from "@components/Buttons/ActionButton";
import Popup from "@components/Popup";
import Typo from "@components/Text";

import { withModelContext } from "@context";

import { callCloudApi } from "@services/ApiManagerCloud";
import { logEvent } from "@services/analytics";

import {
    INACTIVE_COLOR,
    ACTIVE_COLOR,
    BLUE,
    MEDIUM_GREY,
    TRANSPARENT,
    YELLOW,
} from "@constants/colors";
import {
    DEVICE_IS_JAILBREAK,
    DEVICE_IS_ROOTED,
    FA_ONBOARDING_WELCOME,
    FA_SCREEN_NAME,
    FA_VIEW_SCREEN,
} from "@constants/strings";
import { CAMPAIGN_BASED_ENDPOINT } from "@constants/url";

import TurboStorage from "@libs/TurboStorage";

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

    useEffect(() => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_ONBOARDING_WELCOME.replace("Index", index + 1),
        });
    }, [index]);

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
                            <Typo fontSize={14} fontWeight="600" lineHeight={18} text="Next" />
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

function OnboardingIntro({ isExiting, onClose }) {
    const contentRef = useRef();

    useEffect(() => {
        if (contentRef?.current) {
            if (isExiting) {
                contentRef?.current?.fadeOutDown(500);
            }
        }
    }, [isExiting]);

    return (
        <Animatable.View
            style={styles.container}
            testID="onboardingIntro"
            ref={contentRef}
            animation={"fadeInUp"}
        >
            <IntroductionScreen onClose={onClose} isExiting={isExiting} />
        </Animatable.View>
    );
}

OnboardingIntro.propTypes = {
    onClose: PropTypes.func,
    isExiting: PropTypes.bool,
};

class OnboardingIntroScreen extends Component {
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
        };
        this.scrollX = new Animated.Value(1);
    }

    exitTimeout = null;

    fetchS3Config = async () => {
        const currentVersion = DeviceInfo.getVersion();
        const campaignMasterEndpoint = `${CAMPAIGN_BASED_ENDPOINT}/setting/${currentVersion}/masterConfig.json`;
        // Fetch latest Campaign Setting
        this.getCampaignSetting(campaignMasterEndpoint)
            .then(({ selectCampaign, contentVersion }) => {
                const currentCampaign = `${selectCampaign}/${currentVersion}/${contentVersion}`;
                const festiveEndpoint = `${CAMPAIGN_BASED_ENDPOINT}/${currentCampaign}`;
                // Check if the current_campaign key not same version, it will invalidate the cache and fetech latest CampaignConfig ;)
                if (TurboStorage.resetStorage("current_campaign", currentCampaign)) {
                    this.getCampaignConfig(`${festiveEndpoint}/config.json`).then(() => {
                        TurboStorage.setItem(
                            "master_campaign",
                            JSON.stringify({ selectCampaign, festiveEndpoint })
                        );
                        // UpdateModel when all ready. =)
                        this.props.updateModel({
                            misc: {
                                tapTasticType: selectCampaign,
                                campaignAssetsUrl: festiveEndpoint,
                                isTapTasticReady: true,
                            },
                        });
                    });
                } else {
                    // UpdateModel when all ready. =)
                    this.props.updateModel({
                        misc: {
                            tapTasticType: selectCampaign,
                            campaignAssetsUrl: festiveEndpoint,
                            isTapTasticReady: true,
                        },
                    });
                }
            })
            // Fallover to cached current_campaign
            .catch(() => {
                if (TurboStorage.getItem("current_campaign")) {
                    const cacheMaster = TurboStorage.getItem("master_campaign");
                    if (cacheMaster) {
                        const { selectCampaign, festiveEndpoint } = JSON.parse(cacheMaster);

                        this.props.updateModel({
                            misc: {
                                tapTasticType: selectCampaign,
                                campaignAssetsUrl: festiveEndpoint,
                                isTapTasticReady: true,
                            },
                        });
                    }
                }
            });
    };

    getCampaignConfig = async (festiveEndpoint) => {
        const headers = {
            "content-type": "application/json",
            "cache-control": "no-cache",
        };

        try {
            const response = await callCloudApi({ uri: festiveEndpoint, headers, method: "GET" });
            TurboStorage.setItem("campaign_config", JSON.stringify(response)); //@syn
        } catch (error) {
            console.log("after response campaign_config error", error);
        }
    };

    getCampaignSetting = async (campaignMasterEndpoint) => {
        const headers = {
            "content-type": "application/json",
        };
        const CONFIG_URL = campaignMasterEndpoint; //calling the cloud api

        try {
            return await callCloudApi({ uri: CONFIG_URL, headers, method: "GET" });
        } catch (error) {
            console.log("after response campaign_master_config error", error);
        }
    };
    // Festive Campaign Bye

    componentDidMount() {
        //SafetyNet Check for Android
        if (!__DEV__) {
            this.checkDeviceRootAccess();
        }
        this.fetchS3Config();
    }

    componentWillUnmount() {
        clearTimeout(this.exitTimeout);
    }

    checkDeviceRootAccess = async () => {
        try {
            const deviceInformation = await RNRsaSdk.getRSAMobileSDK();

            if (deviceInformation) {
                const { result } = JSON.parse(deviceInformation);
                const { Compromised } = JSON.parse(result);

                //	Compromised < 0  == Compromised < 0, MAYBE ROOTED/JAILBROKEN DEVICE
                //	Compromised == 0  == Compromised-0, NOT A ROOTED/JAILBROKEN DEVICE
                if (Compromised > 0) {
                    // Emulator == 1
                    // Rooted Device
                    this.setState({ isRootedDevice: true });
                }
            }
        } catch (error) {
            console.error(error);
        }
    };

    contents = [
        {
            title: "Hello!",
            summary: `Welcome to MAE by Maybank2u.\nAn app for whatever you want, whenever you want it.`,
            illustration: require("@assets/onboarding/onboardingIllustration1.png"),
        },
        {
            title: "Tabung together-gether",
            summary: `Plan a holiday with friends or get that shiny new gadget. Stash money aside for your big or small moments with Tabung and get there faster!`,
            illustration: require("@assets/onboarding/onboardingIllustration2.png"),
        },
        {
            title: "Experience more",
            summary: `Browse deals, book the latest blockbusters, find the best flights and discover the hottest eats in town.`,
            illustration: require("@assets/onboarding/onboardingIllustration3.png"),
        },
    ];

    _setSwiperReference = (ref) => {
        this.swiperReference = ref;
    };

    _onSubmitPressed = () => {
        RNExitApp.exitApp();
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
        if (__DEV__) {
            this._navigateToNextScreen();
        } else {
            this.setState({
                isTncPopup: true,
            });
        }
    };

    _navigateToNextScreen = () => {
        const { isExiting } = this.state;

        if (!isExiting) {
            this.setState({ isExiting: true }, () => {
                this.exitTimeout = setTimeout(
                    () =>
                        this.props.navigation.replace(TAB_NAVIGATOR, {
                            screen: "Tab",
                            params: { screen: "Dashboard" },
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

        this._navigateToNextScreen();
    };

    handleOnTncLink = () => {
        const params = {
            file: "https://www.maybank2u.com.my/iwov-resources/pdf/upload/maeapp/MAEApp_Terms&Conditions_202009.pdf",
            share: false,
            type: "url",
            title: "Terms & Conditions",
            pdfType: "shareReceipt",
        };

        this.setState({
            isTncPopup: false,
        });

        this.props.navigation.navigate(COMMON_MODULE, {
            screen: PDF_VIEW,
            params: { params },
        });
    };

    renderTncPopup = () => (
        <View testID="onboarding_intro_tnc_popup">
            <View style={styles.customTncPopupContainer}>
                <Typo
                    text="Terms & Conditions"
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
                            <Text>By your continued usage of this app, you agree to its </Text>
                            <Typo
                                text="Terms & Conditions"
                                textAlign="left"
                                fontSize={14}
                                lineHeight={20}
                                fontWeight="bold"
                                style={styles.customTncPopupLink}
                                onPress={this.handleOnTncLink}
                            />
                            <Text>
                                {" "}
                                which will legally bind you. If you do not agree with these{" "}
                            </Text>
                            <Typo
                                text="Terms & Conditions"
                                textAlign="left"
                                fontSize={14}
                                lineHeight={20}
                                fontWeight="bold"
                                style={styles.customTncPopupLink}
                                onPress={this.handleOnTncLink}
                            />
                            <Text> please do not continue using this app.</Text>
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
                                text="Agree"
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
        const { isRootedDevice, isTncPopup } = this.state;

        if (isRootedDevice) {
            return {
                visible: true,
                title: "Oh no!",
                description: Platform.OS === "ios" ? DEVICE_IS_JAILBREAK : DEVICE_IS_ROOTED,
                onClose: this._onSubmitPressed,
                primaryAction: {
                    text: "Okay",
                    onPress: this._onSubmitPressed,
                },
            };
        }

        if (isTncPopup) {
            return {
                visible: true,
                title: "Terms & Conditions",
                ContentComponent: this.renderTncPopup,
                onClose: this._onSubmitPressed,
            };
        }

        return {
            visible: false,
        };
    };

    render() {
        const { currentIndex, isExiting } = this.state;
        const imageHeight = height - (this.state.highestContent + this.state.paginationHeight + 25);
        const popupProp = this.getPopupDetails();

        return (
            <>
                {/*<Animatable.View */}
                {/*    style={styles.container} */}
                {/*    testID="onboardingIntro" */}
                {/*    animation={isExiting ? "fadeOutDown" : "fadeInUp"}*/}
                {/*>*/}
                {/*<Swiper*/}
                {/*    animated*/}
                {/*    loop={false}*/}
                {/*    showsPagination*/}
                {/*    ref={this._setSwiperReference}*/}
                {/*    onScroll={Animated.event(*/}
                {/*        [*/}
                {/*            {*/}
                {/*                nativeEvent: { contentOffset: { x: this.scrollX } },*/}
                {/*            },*/}
                {/*        ],*/}
                {/*        { useNativeDriver: true }*/}
                {/*    )}*/}
                {/*    scrollEventThrottle={20}*/}
                {/*    renderPagination={this.renderPagination}*/}
                {/*    onIndexChanged={this.onIndexChanged}*/}
                {/*    testID="onboarding_intro_swiper"*/}
                {/*>*/}
                {/*    {this.contents.map((content, index) => (*/}
                {/*        <View*/}
                {/*            style={styles.swiperItem}*/}
                {/*            key={`intro-${index}`}*/}
                {/*            testID={`onboarding_intro_screen_${index}`}*/}
                {/*        >*/}
                {/*            <IntroScreen*/}
                {/*                {...content}*/}
                {/*                key={content.title}*/}
                {/*                index={index}*/}
                {/*                onNext={this._onNextButtonPressed}*/}
                {/*                imageHeight={imageHeight}*/}
                {/*                onLayout={this.onScreenLayout}*/}
                {/*                scrollX={this.scrollX}*/}
                {/*                isExiting={isExiting}*/}
                {/*            />*/}
                {/*        </View>*/}
                {/*    ))}*/}
                {/*</Swiper>*/}
                {/*<SkipButton*/}
                {/*    visible={currentIndex < this.contents.length - 1 && !isExiting}*/}
                {/*    onPress={this.toggleTncPopup}*/}
                {/*/>*/}

                {/*</Animatable.View>*/}

                <OnboardingIntro isExiting={isExiting} onClose={this.toggleTncPopup} />
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
    customTncPopupLink: {
        textDecorationLine: "underline",
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

export default withModelContext(OnboardingIntroScreen);
