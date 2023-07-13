import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import { TouchableOpacity, View, ImageBackground, StyleSheet } from "react-native";
import * as Animatable from "react-native-animatable";

import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import { HeaderPageIndicator } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typography from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { invokeL3, BTInquiry } from "@services";

import { MEDIUM_GREY, YELLOW } from "@constants/colors";
import { COMMON_ERROR_MSG } from "@constants/strings";
import { BT_INQ } from "@constants/url";

import { maskAccount } from "@utils/dataModel/utility";
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

function BTLanding({ navigation, route }) {
    const onBackTap = () => {
        console.log("[BTLanding] >> [onBackTap]");
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
        console.log("[BTLanding] >> [onStartedTap]");
        const request = await requestL3();
        if (!request) return;
        const params = route?.params ?? {};
        const prevData = params?.prevData ?? {};
        const cardDetails = {
            name: prevData?.name ?? "",
            description1: maskAccount(prevData?.number) ?? "",
            description2: "",
            cardNo: prevData?.number,
        };
        const param = {
            cardNo: prevData?.number,
            service: "BT",
        };
        const httpResp = await BTInquiry(param, BT_INQ).catch((error) => {
            console.log("[BTLanding][BTInquiry] >> Exception: ", error);
        });
        const result = httpResp?.data?.result ?? null;
        if (!result) {
            return;
        }
        const { statusCode, statusDesc, details } = result;
        if (statusCode === "000") {
            navigation.navigate("BankingV2Module", {
                screen: "BTSelectPlan",
                params: {
                    ...params,
                    accDetails: cardDetails,
                    result,
                },
            });
        } else {
            showErrorToast({
                message: statusDesc || COMMON_ERROR_MSG,
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
                                resizeMode={"cover"}
                                style={styles.imageBg}
                                source={Images.btWelcome}
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
                                    text="Balance Transfer"
                                    textAlign="center"
                                />
                                <Typography
                                    fontSize={12}
                                    fontWeight="normal"
                                    lineHeight={18}
                                    style={styles.label}
                                    text="Consolidate your credit card balances with a tailored instalment plan with flexible duration and attractive interest rates."
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

BTLanding.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

export default BTLanding;
