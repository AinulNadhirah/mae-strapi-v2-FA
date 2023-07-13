import PropTypes from "prop-types";
import React from "react";
import { View, ImageBackground, StyleSheet } from "react-native";
import * as Animatable from "react-native-animatable";
import DeviceInfo from "react-native-device-info";

import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import { HeaderPageIndicator } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typography from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { withModelContext } from "@context";

import { invokeL3, ezyPayInquiry } from "@services";

import { MEDIUM_GREY, YELLOW } from "@constants/colors";
import { COMMON_ERROR_MSG } from "@constants/strings";
import { EZY_PAY_INQ } from "@constants/url";

import { maskAccount, getDeviceRSAInformation } from "@utils/dataModel/utility";
import { ErrorLogger } from "@utils/logs";

import Images from "@assets";

const animateFadeInUp = {
    0: {
        opacity: 0,
        translateY: 40,
    },
    1: {
        opacity: 1,
        translateY: 0,
    },
};

function EZYPayLanding({ navigation, route, getModel }) {
    const onBackTap = () => {
        console.log("[EZYPayLanding] >> [onBackTap]");
        navigation.goBack();
    };

    const requestL3 = async () => {
        try {
            const response = await invokeL3(false);
            if (response && response.status === 200) return response;
            return null;
        } catch (error) {
            ErrorLogger(error);
            return null;
        }
    };

    const onStartedTap = async () => {
        console.log("[EZYPayLanding] >> [onStartedTap]");
        const request = await requestL3();
        if (!request) return;
        const { deviceInformation, deviceId } = getModel("device");
        const mobileSDKData = getDeviceRSAInformation(deviceInformation, DeviceInfo, deviceId);
        const params = route?.params ?? {};
        const prevData = params?.prevData ?? {};
        const cardDetails = {
            name: prevData?.name ?? "",
            description1: maskAccount(prevData?.number) ?? "",
            description2: "",
            cardNo: prevData?.number,
        };
        const param = {
            accountType: prevData?.type,
            fullAccountNo: prevData?.number,
            accountNo: prevData?.number,
            service: "EZY",
            mobileSDKData,
        };
        const httpResp = await ezyPayInquiry(param, EZY_PAY_INQ).catch((error) => {
            console.log("[EZYPayLanding][EzyPayInquiry] >> Exception: ", error);
        });
        const result = httpResp?.data?.result ?? null;
        if (!result) {
            return;
        }
        const { statusCode, statusDescription, details } = result;
        if (statusCode === "200") {
            navigation.navigate("BankingV2Module", {
                screen: "EZYPaySelectTransaction",
                params: {
                    ...params,
                    accDetails: cardDetails,
                    serverData: result,
                    details,
                    service: "EZY",
                },
            });
        } else {
            showErrorToast({
                message: statusDescription || COMMON_ERROR_MSG,
            });
        }
    };

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <>
                <ScreenLayout
                    paddingBottom={0}
                    paddingTop={0}
                    paddingHorizontal={0}
                    header={<View />}
                    useSafeArea
                    neverForceInset={["top", "bottom"]}
                >
                    <View style={styles.container}>
                        <Animatable.View
                            animation={animateFadeInUp}
                            duration={500}
                            delay={500}
                            style={styles.image}
                        >
                            <ImageBackground
                                resizeMode="cover"
                                style={styles.imageBg}
                                source={Images.ezypayWelcome}
                            >
                                <HeaderPageIndicator
                                    showBack={false}
                                    showClose={true}
                                    noClose={true}
                                    onClosePress={onBackTap}
                                />
                            </ImageBackground>
                        </Animatable.View>
                        <View style={styles.footer}>
                            <Animatable.View
                                animation={animateFadeInUp}
                                duration={250}
                                delay={700}
                                style={styles.copy}
                            >
                                <Typography
                                    fontSize={16}
                                    lineHeight={19}
                                    fontWeight="600"
                                    text="EZYPay Plus"
                                    textAlign="center"
                                />
                                <Typography
                                    fontSize={12}
                                    fontWeight="normal"
                                    lineHeight={18}
                                    style={styles.label}
                                    text="Make purchases with your Maybank Credit Card and convert them to affordable monthly instalment plan with lower rate and flexible tenure."
                                    textAlign="center"
                                />
                            </Animatable.View>
                            <Animatable.View
                                animation={animateFadeInUp}
                                duration={250}
                                delay={1100}
                                style={styles.actionContainer}
                            >
                                <ActionButton
                                    fullWidth
                                    borderRadius={25}
                                    onPress={onStartedTap}
                                    backgroundColor={YELLOW}
                                    componentCenter={
                                        <Typography
                                            text="Get Started"
                                            fontSize={14}
                                            fontWeight="600"
                                            lineHeight={18}
                                        />
                                    }
                                />
                            </Animatable.View>
                        </View>
                    </View>
                </ScreenLayout>
            </>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    actionContainer: {
        paddingBottom: 36,
        paddingHorizontal: 24,
    },
    container: {
        flex: 1,
    },
    copy: {
        paddingHorizontal: 36,
    },
    footer: {
        flex: 0.3,
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
    },
    image: {
        alignItems: "center",
        flex: 0.7,
    },
    imageBg: { height: "100%", width: "100%" },
    label: {
        paddingVertical: 16,
    },
});

EZYPayLanding.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
    getModel: PropTypes.any,
};

export default withModelContext(EZYPayLanding);
