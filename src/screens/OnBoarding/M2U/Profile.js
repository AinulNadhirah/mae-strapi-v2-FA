import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";

import { TAB_NAVIGATOR } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";

import { useModelController, withModelContext } from "@context";

import { logEvent } from "@services/analytics";

import { MEDIUM_GREY, YELLOW, DISABLED, DISABLED_TEXT, BLACK, FADE_GREY } from "@constants/colors";
import { FA_ONBOARD_NAME, FA_SCREEN_NAME, FA_VIEW_SCREEN } from "@constants/strings";

import { nameRegex } from "@utils/dataModel";

function OnboardingProfile({ navigation, route }) {
    const [profileName, setProfileName] = useState("");
    const [error, setError] = useState(false);

    const { updateModel } = useModelController();
    useEffect(() => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_ONBOARD_NAME,
        });
    }, []);

    function handleClose() {
        // reset stuff
        updateModel({
            auth: {
                token: null,
                refreshToken: null,
            },
        });

        navigation.canGoBack() && navigation.navigate(TAB_NAVIGATOR);
    }

    async function handleSubmitInput() {
        setError(false);

        if (!profileName || profileName.trim().length < 3 || !nameRegex(profileName)) {
            setError(true);

            return;
        }
        const authData = route.params?.authData;

        // trim any leading, middle and trailing spaces
        const trimmedName = profileName.replace(/  +/g, " ").trim();

        navigation.navigate("OnboardingM2uAccounts", {
            ...route?.params,
            authData,
            profileName: trimmedName,
        });
    }

    function handleUpdateprofileName(text) {
        if (text.split(" ").join("").length < 16) {
            setProfileName(text);
        }
    }

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <>
                <ScreenLayout
                    paddingBottom={0}
                    paddingTop={16}
                    paddingHorizontal={0}
                    header={
                        <HeaderLayout
                            headerRightElement={<HeaderCloseButton onPress={handleClose} />}
                        />
                    }
                    useSafeArea
                >
                    <>
                        <View style={styles.container}>
                            <View style={styles.meta}>
                                <Typo
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={18}
                                    text="Welcome Onboard"
                                    textAlign="left"
                                />
                                <Typo
                                    fontSize={20}
                                    fontWeight="300"
                                    lineHeight={28}
                                    style={styles.address}
                                    text="How would you like us to address you?"
                                    textAlign="left"
                                />
                                <Typo
                                    fontSize={12}
                                    fontWeight="normal"
                                    lineHeight={18}
                                    style={styles.label}
                                    text="This will be used for social interactions within the app, so make sure it’s recognisable."
                                    textAlign="left"
                                    color={FADE_GREY}
                                />

                                <TextInput
                                    importantForAutofill="no"
                                    value={profileName}
                                    placeholder="Enter your name"
                                    onChangeText={handleUpdateprofileName}
                                    onSubmitEditing={handleSubmitInput}
                                    autoCapitalize="words"
                                    isValidate
                                    isValid={!error}
                                    errorMessage="Name must contain at least 3 alphabetical characters and space(s) only."
                                    testID="profile_name"
                                />
                            </View>
                        </View>

                        <FixedActionContainer>
                            <ActionButton
                                disabled={profileName.length < 3}
                                fullWidth
                                borderRadius={25}
                                onPress={handleSubmitInput}
                                backgroundColor={profileName.length < 3 ? DISABLED : YELLOW}
                                componentCenter={
                                    <Typo
                                        color={profileName.length < 3 ? DISABLED_TEXT : BLACK}
                                        text="Continue"
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={18}
                                    />
                                }
                                testID="profile_proceed"
                            />
                        </FixedActionContainer>
                    </>
                </ScreenLayout>
            </>
        </ScreenContainer>
    );
}

OnboardingProfile.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

const styles = StyleSheet.create({
    address: { paddingVertical: 8 },
    container: {
        flex: 1,
        justifyContent: "space-between",
        position: "relative",
    },
    label: {
        marginBottom: 6,
    },
    meta: {
        paddingHorizontal: 36,
    },
});

export default withModelContext(OnboardingProfile);
