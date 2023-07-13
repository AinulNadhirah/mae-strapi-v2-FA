import PropTypes from "prop-types";
import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import * as Animatable from "react-native-animatable";

import { TAB_NAVIGATOR, SECURE2U_COOLING } from "@navigation/navigationConstant";

import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";
import { showInfoToast } from "@components/Toast";

import { withModelContext } from "@context";

import { MEDIUM_GREY, YELLOW } from "@constants/colors";
import {
    APPRECIATE_PATIENCE,
    BACK_TO_HOME,
    S2U_IN_PROGRESS,
    SAFEGUARD_ACCOUNT,
    NOTIFY_SAFEGUARD_ACCOUNT,
    SECURE2U_TOAST_COOLING,
    URGENT_ASSISTANCE,
    FA_SETTINGS_S2UACTIVATION_INPROGRESS,
} from "@constants/strings";

import { responsive } from "@utils";
import { storeCloudLogs } from "@utils/cloudLog";

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
function S2UCooling({ navigation, route, getModel }) {
    const { isTransaction, showMessage = false } = route.params;
    const { coolDownPeriod } = getModel("ota");

    useEffect(() => {
        syncToCloud();
    }, []);

    const syncToCloud = () => {
        storeCloudLogs(getModel, {
            errorType: SECURE2U_COOLING,
            errorDetails: `PERIOD ${coolDownPeriod} hours`,
        });
    };

    function handleDone() {
        if (showMessage) {
            showInfoToast({
                message: SECURE2U_TOAST_COOLING,
            });
        }
        navigation.navigate(TAB_NAVIGATOR, {
            screen: "Dashboard",
        });
    }

    function renderContent() {
        if (!isTransaction) {
            return (
                <View style={styles.container}>
                    <View style={styles.meta}>
                        <Animatable.Image
                            animation={animateFadeInUp}
                            delay={500}
                            duration={500}
                            source={Images.coolingBgLayout2}
                            style={styles.imageBg}
                            useNativeDriver
                        />
                    </View>
                    <View style={styles.content}>
                        <Animatable.View
                            animation={animateFadeInUp}
                            duration={250}
                            delay={1000}
                            style={styles.copy}
                            useNativeDriver
                        >
                            <Typo
                                fontSize={14}
                                lineHeight={17.07}
                                fontWeight="600"
                                text={S2U_IN_PROGRESS}
                                textAlign="left"
                            />
                            <Typo
                                fontSize={16}
                                fontWeight="400"
                                lineHeight={26}
                                style={styles.label}
                                text={
                                    <>
                                        <Typo
                                            fontSize={16}
                                            fontWeight="400"
                                            textAlign="left"
                                            lineHeight={26}
                                            style={styles.label}
                                            text={SAFEGUARD_ACCOUNT}
                                        />
                                        <Typo
                                            fontSize={16}
                                            fontWeight="600"
                                            lineHeight={26}
                                            style={styles.label}
                                            text={` ${coolDownPeriod} hours. `}
                                        />
                                        <Typo
                                            fontSize={16}
                                            fontWeight="400"
                                            lineHeight={26}
                                            style={styles.label}
                                            text={NOTIFY_SAFEGUARD_ACCOUNT}
                                        />
                                    </>
                                }
                                textAlign="left"
                            />
                            <Typo
                                fontSize={16}
                                fontWeight="400"
                                lineHeight={26}
                                style={styles.label}
                                text={
                                    <>
                                        <Typo
                                            fontSize={16}
                                            fontWeight="400"
                                            textAlign="left"
                                            lineHeight={26}
                                            style={styles.label}
                                            text={APPRECIATE_PATIENCE}
                                        />
                                        <Typo
                                            fontSize={16}
                                            fontWeight="400"
                                            lineHeight={26}
                                            style={styles.label}
                                            text={` ${URGENT_ASSISTANCE} `}
                                        />
                                    </>
                                }
                                textAlign="left"
                            />
                        </Animatable.View>
                        <Animatable.View
                            animation={animateFadeInUp}
                            duration={250}
                            delay={1100}
                            style={styles.actionContainer}
                            useNativeDriver
                        >
                            <SpaceFiller height={10} />
                            <ActionButton
                                borderRadius={25}
                                onPress={handleDone}
                                fullWidth
                                style={styles.actionButton}
                                backgroundColor={YELLOW}
                                componentCenter={
                                    <Typo
                                        text="Done"
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={18}
                                    />
                                }
                            />
                        </Animatable.View>
                    </View>
                </View>
            );
        }
        return (
            <View style={styles.container}>
                <View style={styles.contentAlternate}>
                    <Animatable.View
                        animation={animateFadeInUp}
                        duration={250}
                        delay={1000}
                        style={styles.copy}
                        useNativeDriver
                    >
                        <Typo
                            fontSize={18}
                            lineHeight={40}
                            fontWeight="600"
                            text={S2U_IN_PROGRESS}
                            textAlign="center"
                        />
                        <Typo
                            fontSize={20}
                            fontWeight="400"
                            lineHeight={18}
                            style={styles.label}
                            text={
                                <>
                                    <Typo
                                        fontSize={14}
                                        fontWeight="400"
                                        lineHeight={18}
                                        style={styles.label}
                                        text={SAFEGUARD_ACCOUNT}
                                    />
                                    <Typo
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={18}
                                        style={styles.label}
                                        text={` ${coolDownPeriod} hours. `}
                                    />
                                    <Typo
                                        fontSize={14}
                                        fontWeight="400"
                                        lineHeight={18}
                                        style={styles.label}
                                        text={NOTIFY_SAFEGUARD_ACCOUNT}
                                    />
                                </>
                            }
                            textAlign="center"
                        />
                        <Typo
                            fontSize={14}
                            fontWeight="400"
                            lineHeight={18}
                            style={styles.label}
                            text={
                                <>
                                    <Typo
                                        fontSize={14}
                                        fontWeight="400"
                                        textAlign="center"
                                        lineHeight={18}
                                        style={styles.label}
                                        text={APPRECIATE_PATIENCE}
                                    />
                                    <Typo
                                        fontSize={14}
                                        fontWeight="400"
                                        lineHeight={18}
                                        style={styles.label}
                                        text={` ${URGENT_ASSISTANCE} `}
                                    />
                                </>
                            }
                            textAlign="center"
                        />
                    </Animatable.View>
                    <Animatable.View
                        animation={animateFadeInUp}
                        duration={250}
                        delay={1100}
                        style={styles.actionContainer}
                        useNativeDriver
                    >
                        <SpaceFiller height={20} />
                        <ActionButton
                            style={styles.actionButton}
                            width={responsive.widthPercentage("60%")}
                            height={40}
                            borderRadius={25}
                            onPress={handleDone}
                            backgroundColor={YELLOW}
                            componentCenter={
                                <Typo
                                    text={BACK_TO_HOME}
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={18}
                                />
                            }
                        />
                    </Animatable.View>
                </View>
                <View style={styles.metaAlternate}>
                    <Animatable.Image
                        animation={animateFadeInUp}
                        delay={500}
                        duration={500}
                        source={Images.coolingBgLayout1}
                        style={styles.imageBg}
                        useNativeDriver
                    />
                </View>
            </View>
        );
    }

    return (
        <ScreenContainer
            backgroundType="color"
            backgroundColor={MEDIUM_GREY}
            analyticScreenName={FA_SETTINGS_S2UACTIVATION_INPROGRESS}
        >
            <>
                <ScreenLayout
                    header={
                        isTransaction ? (
                            <HeaderLayout
                                headerRightElement={<HeaderCloseButton onPress={handleDone} />}
                            />
                        ) : null
                    }
                    paddingBottom={0}
                    scrollable={true}
                    paddingTop={0}
                    paddingHorizontal={0}
                    useSafeArea
                    neverForceInset={["top", "bottom"]}
                >
                    {renderContent()}
                </ScreenLayout>
            </>
        </ScreenContainer>
    );
}

S2UCooling.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
    getModel: PropTypes.func,
};

const styles = StyleSheet.create({
    actionButton: {
        alignSelf: "center",
    },
    actionContainer: {
        paddingBottom: 36,
        paddingHorizontal: 24,
    },
    container: {
        flex: 1,
    },
    content: {
        flex: 0.1,
        justifyContent: "space-between",
        width: "100%",
    },
    contentAlternate: {
        flex: 0.4,
        justifyContent: "center",
        width: "100%",
    },
    copy: {
        paddingHorizontal: 24,
    },
    imageBg: { height: "100%", width: "100%" },
    label: {
        paddingVertical: 10,
    },
    labelAlternate: {
        paddingVertical: 15,
    },
    meta: {
        alignItems: "center",
        flex: 0.9,
        width: "100%",
    },
    metaAlternate: {
        flex: 0.6,
        width: "100%",
    },
});

export default withModelContext(S2UCooling);
