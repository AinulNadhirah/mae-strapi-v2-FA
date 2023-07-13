import PropTypes from "prop-types";
import React from "react";
import { View, StyleSheet, Image, TouchableOpacity } from "react-native";

import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Typo from "@components/Text";

import { MEDIUM_GREY, YELLOW, ROYAL_BLUE } from "@constants/colors";
import {
    DEVICE_COMPATIBLE,
    DONE,
    S2U_SETUP_UNSUCCESSFUL,
    S2U_UNSUCCESSFUL,
    S2U_NOT_ACTIVATED,
} from "@constants/strings";

import Images from "@assets";

function Fail({ navigation, route }) {
    const { flowParams, isTokenEmpty = false } = route.params;
    function handleClose() {
        if (route?.params?.flowParams) {
            navigation.navigate(flowParams?.fail.stack, {
                screen: flowParams?.fail.screen,
                params: {
                    auth: "fail",
                    reason: route?.params?.reason ?? "",
                    ...flowParams.params,
                },
            });
        } else {
            // go back to settings
            navigation.navigate("Dashboard", {
                screen: "Settings",
            });
        }
    }

    function handleTryAgain() {
        // go back to activate, since we're in registration flow
        navigation.navigate("Activate");
    }

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <>
                <ScreenLayout
                    paddingBottom={0}
                    paddingTop={146}
                    paddingHorizontal={0}
                    header={<View />}
                    useSafeArea
                >
                    <>
                        <View style={styles.container}>
                            <View>
                                <Image source={Images.icFailedIcon} style={styles.meta} />
                            </View>
                            <View style={styles.footer}>
                                <Typo
                                    fontSize={20}
                                    lineHeight={28}
                                    fontWeight="300"
                                    text={isTokenEmpty ? S2U_NOT_ACTIVATED : S2U_UNSUCCESSFUL}
                                    textAlign="left"
                                />
                                <Typo
                                    fontSize={12}
                                    fontWeight="normal"
                                    lineHeight={18}
                                    style={styles.label}
                                    text={isTokenEmpty ? DEVICE_COMPATIBLE : S2U_SETUP_UNSUCCESSFUL}
                                    textAlign="left"
                                />
                            </View>
                        </View>
                        <FixedActionContainer>
                            <View style={styles.actionContainer}>
                                <ActionButton
                                    fullWidth
                                    borderRadius={25}
                                    onPress={handleTryAgain}
                                    backgroundColor={YELLOW}
                                    componentCenter={
                                        <Typo
                                            text="Try Again"
                                            fontSize={14}
                                            fontWeight="600"
                                            lineHeight={18}
                                        />
                                    }
                                />
                                <TouchableOpacity onPress={handleClose} activeOpacity={0.8}>
                                    <Typo
                                        color={ROYAL_BLUE}
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={18}
                                        text={DONE}
                                        style={styles.doneAction}
                                    />
                                </TouchableOpacity>
                            </View>
                        </FixedActionContainer>
                    </>
                </ScreenLayout>
            </>
        </ScreenContainer>
    );
}

Fail.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

const styles = StyleSheet.create({
    actionContainer: {
        alignItems: "center",
        flex: 1,
    },
    container: {
        flex: 1,
        paddingHorizontal: 36,
    },
    doneAction: {
        paddingVertical: 24,
    },
    footer: {
        flexDirection: "column",
        paddingVertical: 24,
    },
    label: {
        paddingVertical: 42,
    },
    meta: {
        height: 56,
        width: 56,
    },
});

export default Fail;
