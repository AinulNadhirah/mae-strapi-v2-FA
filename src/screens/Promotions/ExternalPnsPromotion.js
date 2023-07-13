import PropTypes from "prop-types";
import React, { useEffect, useRef } from "react";
import { Animated, View, StyleSheet } from "react-native";
import * as Animate from "react-native-animatable";
import { TouchableOpacity } from "react-native-gesture-handler";

import { navigateCta } from "@screens/Notifications";

import { DASHBOARD_STACK } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Typo from "@components/Text";

import { useModelController, withModelContext } from "@context";

import { callCloudApi } from "@services/ApiManagerCloud";

import { MEDIUM_GREY, ROYAL_BLUE, YELLOW } from "@constants/colors";
import { AWS } from "@constants/data";

import { useCtaMapper } from "@utils/ctaMapper";
import { getDigitalIdentityByType } from "@utils/dataModel/utility";

/**
 * 
 * MBPNS payload
 * 
 * "data": {
        "img_url": "",
        "notif_title": "[TEST] MBPNS Payload check",
        "template_id": "7",
        "longitude": "",
        "restrictedPackageName": "com.maybank2u.life",
        "cat_id": "1",
        "lattitude": "",
        "start_date": "2021-06-01T00:00:00.000Z",
        "end_date": "2021-06-01T00:00:00.000Z",
        "positive_btn_lbl": "",
        "recipient_url": "https://www.tesla.com/",
        "is_sound": "yes",
        "msgId": "201414",
        "appID": "10",
        "subcat_id": "0",
        "cat_name": "Promotions",
        "type": "nor",
        "inbox_expiry": "2021-06-02T00:00:00.000Z",
        "negative_btn_lbl": "",
        "radius": "0",
        "full_desc": "[TEST] MBPNS Payload check",
        "callbackUrl": "https://dev-capi.maybanksandbox.com/uat/opennotification"
    },
 */

function ExternalPromotion({ navigation, route, resetModel }) {
    const headerImg = useRef(new Animated.Value(1));
    const mapper = useCtaMapper();
    const { data, moduleFrom } = route?.params;
    const { updateModel } = useModelController();
    console.log("PUSH", moduleFrom);

    function handleOnClose() {
        if (moduleFrom === "Marketing") {
            /*
                Marketing push changes
                Resume the Token flow after close the marketing push
             */
            // resetModel(["pushNotification"]);
            // navigation.replace("Splashscreen", { isMarketPushShow: true });

            updateModel({
                ui: {
                    showQuitPopup: true,
                },
            });
        } else {
            navigation.goBack();
        }
    }

    function isCTA(url) {
        return url.indexOf("CTA") > -1;
    }

    function formCtaObject(action, params) {
        switch (action) {
            case "VOUCHER_ID":
            case "PROMO_ID":
            case "ARTICLE_ID":
            case "WALLET_SCANANDPAYPROMO": {
                return {
                    action,
                    url: params,
                };
            }

            default: {
                return {
                    action,
                };
            }
        }
    }

    async function getCTAData(url) {
        const haveParams = url.lastIndexOf(":") !== url.indexOf(":");
        const action = url.substring(
            url.indexOf(":") + 1,
            haveParams ? url.lastIndexOf(":") : url.length
        );
        const params = haveParams ? url.substring(url.lastIndexOf(":") + 1, url.length) : null;
        const ctaData = formCtaObject(action, params);
        const ctaMapped = await mapper(ctaData);

        return ctaMapped;
    }

    async function handleCta() {
        // determine if its an external URL or a CTA
        if (isCTA(data?.recipient_url)) {
            // get the CTA and params if any, then use the mapper to trigger
            const ctaMapped = await getCTAData(data?.recipient_url);
            if (moduleFrom === "Marketing") {
                /*
                Marketing push changes
                Resume the Token flow after tap on CTA and then display CTA
                */
                resetModel(["pushNotification"]);
                navigation.replace("Splashscreen", {
                    isMarketPushShow: true,
                    CTAData: { isData: true, data: ctaMapped },
                });
            } else {
                navigateCta(ctaMapped, navigation);
            }
        } else {
            // go to the receipient url
            navigation.navigate(DASHBOARD_STACK, {
                screen: "ExternalUrl",
                params: {
                    title: data?.notif_title,
                    url: data?.recipient_url,
                },
            });
        }
    }

    async function handleGoToDashboard() {
        resetModel(["pushNotification"]);
        navigation.replace("Splashscreen", { isMarketPushShow: true });
    }

    function animateBanner() {
        return {
            opacity: headerImg.current.interpolate({
                inputRange: [0, 120, 240],
                outputRange: [1, 0.8, 0],
            }),
            transform: [
                {
                    scale: headerImg.current.interpolate({
                        inputRange: [-200, 0, 1],
                        outputRange: [1.4, 1, 1],
                    }),
                },
                {
                    translateY: headerImg.current.interpolate({
                        inputRange: [-200, 0, 240],
                        outputRange: [0, 0, -100],
                    }),
                },
            ],
        };
    }

    useEffect(() => {
        if (!data) navigation.goBack();
    }, [data, navigation]);

    useEffect(() => {
        if (data && data?.msgId && data?.callbackUrl) {
            const pushReadCallbackUrl = data?.callbackUrl;

            // Read msg callback api
            try {
                const makeReadMsgCallback = async () => {
                    const digitalIdVal = await getDigitalIdentityByType(AWS);

                    const headers = { "content-type": "application/json" };
                    const body = {
                        messageId: data?.msgId,
                        digitalId: digitalIdVal ?? "",
                        readTime: new Date().toISOString(),
                    };

                    const responseObj = await callCloudApi({
                        uri: pushReadCallbackUrl,
                        headers,
                        method: "POST",
                        body: JSON.stringify(body),
                    });
                    console.log("[ExternalPromotion] >> [pushReadCallbackUrl]", responseObj);
                };

                makeReadMsgCallback().catch((error) => {
                    console.log("[ExternalPromotion][pushReadCallbackUrl] >> Exception:", error);
                });
            } catch (e) {
                console.log("[ExternalPromotion][pushReadCallbackUrl] >> Exception: ", e);
            }
        }
    }, []);

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <ScreenLayout
                header={
                    <HeaderLayout
                        backgroundColor={MEDIUM_GREY}
                        headerRightElement={<HeaderCloseButton onPress={handleOnClose} />}
                    />
                }
                paddingLeft={0}
                paddingRight={0}
                paddingBottom={0}
                paddingTop={data?.img_url ? 6 : 140}
                useSafeArea
            >
                <>
                    {!!data?.img_url && (
                        <Animated.View style={[styles.bannerContainer, animateBanner()]}>
                            <Animate.Image
                                animation="fadeInUp"
                                duration={300}
                                delay={200}
                                useNativeDriver
                                source={{ uri: data?.img_url }}
                                style={styles.bannerImg}
                                resizeMode="cover"
                            />
                        </Animated.View>
                    )}
                    <Animated.ScrollView
                        contentInsetAdjustmentBehavior="automatic"
                        scrollEventThrottle={16}
                        onScroll={Animated.event(
                            [
                                {
                                    nativeEvent: {
                                        contentOffset: { y: headerImg.current },
                                    },
                                },
                            ],
                            { useNativeDriver: true }
                        )}
                        showsVerticalScrollIndicator={false}
                    >
                        <View
                            style={[
                                styles.contentContainer,
                                data?.img_url && styles.contentWithImage,
                            ]}
                        >
                            <Animate.View
                                animation="fadeInUp"
                                delay={500}
                                duration={300}
                                useNativeDriver
                                style={styles.titleContainer}
                            >
                                <Typo
                                    fontSize={18}
                                    lineHeight={22}
                                    fontWeight="600"
                                    textAlign="left"
                                    text={data?.notif_title}
                                />
                            </Animate.View>
                            <Animate.View
                                animation="fadeInUp"
                                delay={600}
                                duration={300}
                                useNativeDriver
                            >
                                <Typo
                                    fontSize={14}
                                    lineHeight={18}
                                    fontWeight="normal"
                                    textAlign="left"
                                    text={data?.full_desc}
                                />
                            </Animate.View>
                        </View>
                    </Animated.ScrollView>
                    <>
                        <FixedActionContainer>
                            <Animate.View
                                animation="fadeInUp"
                                delay={700}
                                duration={300}
                                useNativeDriver
                                style={styles.ctaContainer}
                            >
                                {!!data?.recipient_url && (
                                    <ActionButton
                                        fullWidth
                                        height={48}
                                        borderRadius={24}
                                        onPress={handleCta}
                                        backgroundColor={YELLOW}
                                        componentCenter={
                                            <Typo
                                                text="Take Me There"
                                                fontSize={14}
                                                fontWeight="600"
                                                lineHeight={18}
                                            />
                                        }
                                    />
                                )}
                                {moduleFrom === "Marketing" && (
                                    <TouchableOpacity onPress={handleGoToDashboard}>
                                        <Typo
                                            color={ROYAL_BLUE}
                                            fontSize={14}
                                            fontWeight="600"
                                            lineHeight={18}
                                            style={styles.actButton}
                                            text="Go to Dashboard"
                                            textAlign="center"
                                        />
                                    </TouchableOpacity>
                                )}
                            </Animate.View>
                        </FixedActionContainer>
                    </>
                </>
            </ScreenLayout>
        </ScreenContainer>
    );
}

ExternalPromotion.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
    resetModel: PropTypes.func,
};

export default withModelContext(ExternalPromotion);

const styles = StyleSheet.create({
    bannerContainer: {
        height: 275,
        left: 0,
        position: "absolute",
        right: 0,
        top: 0,
    },
    bannerImg: {
        height: "100%",
        width: "100%",
    },
    actButton: {
        paddingVertical: 24,
    },
    contentContainer: {
        backgroundColor: MEDIUM_GREY,
        marginTop: 0,
        padding: 24,
    },
    contentWithImage: {
        marginTop: 275,
    },
    ctaContainer: {
        width: "100%",
        justifyContent: "center",
    },
    titleContainer: {
        marginBottom: 14,
    },
});
