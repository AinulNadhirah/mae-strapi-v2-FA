import PropTypes from "prop-types";
import React, { useState, useRef, useEffect } from "react";
import { View, StyleSheet } from "react-native";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";
import { showErrorToast } from "@components/Toast";

import { validateICNo } from "@services";
import { logEvent } from "@services/analytics";

import { MEDIUM_GREY, FADE_GREY, YELLOW, DISABLED, DISABLED_TEXT, BLACK } from "@constants/colors";
import { FA_SCREEN_NAME, FA_S2U_ID, FA_VIEW_SCREEN } from "@constants/strings";

function IdNumber({ navigation, route }) {
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [idNo, setIdNo] = useState("");
    const inputRef = useRef();
    // ic 731001015391

    function handleClose() {
        navigation.canGoBack() && navigation.goBack();
    }

    function handleKeyboardChange(value) {
        if (error) setError("");

        setIdNo(value);
    }

    async function handleProceedToDeviceName() {
        const alphaNoSpace = /^[a-z0-9]+$/i;
        const s2uTransactionId = route?.params?.s2uTransactionId ?? null;
        console.log("handleProceedToDeviceName params ", route?.params);
        console.log("handleProceedToDeviceName s2uTransactionId ", s2uTransactionId);
        if (!idNo || !idNo.trim()) {
            setError("ID number is required");
            return;
        }

        if (!alphaNoSpace.test(idNo)) {
            setError("ID number is invalid");
            return;
        }

        const params = {
            icNo: idNo,
            s2uTransactionId,
        };

        setLoading(true);

        try {
            const response = await validateICNo(params);
            console.log("IdNumber response ", response);
            if (response?.data?.result != "N") {
                navigation.navigate("Device", {
                    ...route?.params,
                    s2uTransactionId: response.data.result,
                });
            } else {
                throw new Error(response);
            }
        } catch (error) {
            showErrorToast({
                message: "Please enter a valid ID number to continue.",
            });
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_S2U_ID,
        });
    }, []);
    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <>
                <ScreenLayout
                    paddingBottom={36}
                    paddingTop={42}
                    paddingHorizontal={24}
                    header={
                        <HeaderLayout
                            headerRightElement={<HeaderCloseButton onPress={handleClose} />}
                        />
                    }
                    useSafeArea
                    neverForceInset={["bottom"]}
                >
                    <View style={styles.container}>
                        <View style={styles.meta}>
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={18}
                                style={styles.label}
                                text="Enter ID"
                                textAlign="left"
                            />
                            <Typo
                                fontSize={20}
                                fontWeight="300"
                                lineHeight={28}
                                style={styles.label}
                                text="Enter your ID number"
                                textAlign="left"
                            />
                            <Typo
                                fontSize={12}
                                fontWeight="normal"
                                lineHeight={18}
                                style={styles.info}
                                color={FADE_GREY}
                                text="(MyKad / Police ID / Army ID / Passport / Business Registration / MyPR / Others)"
                                textAlign="left"
                            />
                            <TextInput
                                autoFocus
                                autoCorrect={false}
                                isLoading={loading}
                                importantForAutofill="no"
                                onChangeText={handleKeyboardChange}
                                value={idNo}
                                placeholder="Your ID number"
                                enablesReturnKeyAutomatically
                                returnKeyType="next"
                                onSubmitEditing={handleProceedToDeviceName}
                                isValidate
                                isValid={!error}
                                errorMessage={error}
                                maxLength={16}
                                inputRef={inputRef}
                            />
                        </View>
                        <View style={styles.footer}>
                            <ActionButton
                                fullWidth
                                disabled={loading}
                                isLoading={loading}
                                borderRadius={25}
                                onPress={handleProceedToDeviceName}
                                backgroundColor={idNo ? YELLOW : DISABLED}
                                componentCenter={
                                    <Typo
                                        text="Continue"
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={18}
                                        color={idNo ? BLACK : DISABLED_TEXT}
                                    />
                                }
                            />
                        </View>
                    </View>
                </ScreenLayout>
            </>
        </ScreenContainer>
    );
}

IdNumber.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-between",
    },
    footer: {
        alignItems: "center",
        flexDirection: "column",
        width: "100%",
    },
    info: {
        paddingBottom: 24,
    },
    label: {
        paddingVertical: 4,
    },
    meta: {
        paddingHorizontal: 12,
    },
});

export default IdNumber;
