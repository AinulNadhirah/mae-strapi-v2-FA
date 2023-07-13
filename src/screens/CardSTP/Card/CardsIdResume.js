import PropTypes from "prop-types";
import React, { useState, useRef } from "react";
import { View, StyleSheet } from "react-native";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import LabeledDropdown from "@components/FormComponents/LabeledDropdown";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";
import { showErrorToast } from "@components/Toast";

import { cardsResumeId } from "@services";

import { MEDIUM_GREY, YELLOW, DISABLED, DISABLED_TEXT, BLACK } from "@constants/colors";
import { COMMON_ERROR_MSG } from "@constants/strings";

import { alphaNumericNoSpaceRegex } from "@utils/dataModel";

function CardsIdResume({ navigation, route }) {
    const [loading, setLoading] = useState(false);
    const [idNo, setIdNo] = useState("");
    const [error, setError] = useState("");
    const inputRef = useRef();

    function handleClose() {
        navigation.canGoBack() && navigation.goBack();
    }

    function handleKeyboardChange(value) {
        if (error) setError("");

        setIdNo(value);
    }

    async function handleProceedButton() {
        if (!idNo || !idNo.trim() || idNo.length < 2 || !alphaNumericNoSpaceRegex(idNo)) {
            setError("Please enter a valid vehicle registration number");
            return;
        }

        setLoading(true);
        const params = route?.params ?? {};
        const param = {
            icNo: idNo,
            idType: "01",
        };
        try {
            const httpResp = await cardsResumeId(param, "loan/ntb/v1/cardStp/stpSavedPageNo");
            const result = httpResp?.data?.result ?? null;
            if (result) {
                const statusCode = result?.statusCode ?? null;
                const statusDesc = result?.statusDesc ?? null;
                const mobNo = result?.mobNo ?? null;

                if (statusCode !== "0000") {
                    showErrorToast({
                        message: statusDesc || COMMON_ERROR_MSG,
                    });
                    return;
                }
                navigation.navigate("CardsOTPNumber", {
                    ...params,
                    idNum: idNo,
                    flow: "RESUME",
                    mobileNum: mobNo,
                });
            }
        } catch (e) {
            showErrorToast({
                message: COMMON_ERROR_MSG,
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <>
                <ScreenLayout
                    paddingBottom={36}
                    paddingTop={30}
                    paddingHorizontal={24}
                    header={
                        <HeaderLayout
                            headerRightElement={<HeaderCloseButton onPress={handleClose} />}
                            headerLeftElement={<HeaderBackButton onPress={handleClose} />}
                        />
                    }
                    useSafeArea
                    neverForceInset={["bottom"]}
                >
                    <View style={styles.container}>
                        <View style={styles.view}>
                            <Typo
                                fontSize={16}
                                fontWeight="600"
                                lineHeight={18}
                                style={styles.label}
                                text="Credit Card Application"
                                textAlign="left"
                            />
                            <Typo
                                fontSize={20}
                                fontWeight="300"
                                lineHeight={28}
                                style={styles.info}
                                text="Continue application from where you left off"
                                textAlign="left"
                            />
                            <LabeledDropdown
                                label="ID type"
                                dropdownValue="New IC"
                                style={styles.info}
                            />
                            <Typo
                                fontSize={14}
                                fontWeight="normal"
                                lineHeight={18}
                                style={styles.label}
                                text="ID number"
                                textAlign="left"
                            />
                            <TextInput
                                autoFocus
                                autoCorrect={false}
                                isLoading={loading}
                                importantForAutofill="no"
                                onChangeText={handleKeyboardChange}
                                value={idNo}
                                placeholder="e.g. 910102 03 5678"
                                enablesReturnKeyAutomatically
                                returnKeyType="next"
                                onSubmitEditing={handleProceedButton}
                                isValidate
                                isValid={!error}
                                errorMessage={error}
                                maxLength={20}
                                inputRef={inputRef}
                            />
                        </View>
                        <View style={styles.footer}>
                            <ActionButton
                                fullWidth
                                disabled={loading}
                                isLoading={loading}
                                borderRadius={25}
                                onPress={handleProceedButton}
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

CardsIdResume.propTypes = {
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
    view: {
        paddingHorizontal: 12,
    },
});

export default CardsIdResume;
