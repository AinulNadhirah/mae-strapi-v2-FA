import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity, Image } from "react-native";

import { TAB_NAVIGATOR } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Popup from "@components/Popup";
import Typo from "@components/Text";

import { logEvent } from "@services/analytics";

import { MEDIUM_GREY, ROYAL_BLUE, WHITE, YELLOW, BLACK, SHADOW } from "@constants/colors";
import { FA_LOGIN_SECURITYPHRASE, FA_SCREEN_NAME, FA_VIEW_SCREEN } from "@constants/strings";

import { contactBankcall } from "@utils/dataModel/utility";

const Avatar = ({ imageUrl }) => (
    <View style={styles.avatarContainer}>
        <View style={styles.avatarInner}>
            <Image source={{ uri: imageUrl }} resizeMode="stretch" style={styles.avatar} />
        </View>
    </View>
);

Avatar.propTypes = {
    imageUrl: PropTypes.string,
};

function OnboardingSecurityImage({ navigation, route }) {
    const [notMine, setNotMine] = useState(false);
    const isMaeOnboarding = route?.params?.isMaeOnboarding ?? false;
    const screenName = route?.params?.screenName;

    useEffect(() => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_LOGIN_SECURITYPHRASE,
        });
    }, []);

    function handleBack() {
        navigation.canGoBack() && navigation.goBack();
    }

    function handleClose() {
        navigation.canGoBack() && navigation.navigate(TAB_NAVIGATOR);
    }

    function handleNavigateMaeOnBoarding() {
        navigation.navigate("OnboardingM2uPassword", {
            username: route.params?.username,
            secureImage: route.params?.secureImage,
            securePhrase: route.params?.securePhrase,
            filledUserDetails: route.params?.filledUserDetails,
            isMaeOnboarding,
            screenName,
            attestationPayload: route.params?.attestationPayload,
        });
    }

    function handleNotMine() {
        setNotMine(true);
    }

    function handleCloseNotMine() {
        setNotMine(false);
    }

    function handleCallHotline() {
        handleCloseNotMine();

        contactBankcall("1300886688");
    }

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <>
                <ScreenLayout
                    paddingBottom={0}
                    paddingTop={0}
                    paddingHorizontal={0}
                    header={
                        <HeaderLayout
                            headerLeftElement={
                                <HeaderBackButton onPress={handleBack} testID="go_back" />
                            }
                            headerRightElement={<HeaderCloseButton onPress={handleClose} />}
                        />
                    }
                    useSafeArea
                >
                    <>
                        <View style={styles.container} testID="onboarding_security_image">
                            <View style={styles.meta}>
                                {/* <CircularM2UImage source={route.params?.secureImage} /> */}
                                <Avatar imageUrl={route.params?.secureImage} />

                                <Typo
                                    fontSize={20}
                                    fontWeight="300"
                                    lineHeight={28}
                                    style={styles.label}
                                    text="Is this your security phrase?"
                                />
                                <View style={styles.securePhrase}>
                                    <Typo
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={18}
                                        text={route.params?.securePhrase ?? ""}
                                    />
                                </View>
                            </View>
                        </View>
                        <FixedActionContainer>
                            <View style={styles.footer}>
                                <ActionButton
                                    fullWidth
                                    borderRadius={25}
                                    onPress={handleNavigateMaeOnBoarding}
                                    backgroundColor={YELLOW}
                                    testID="security_image_it_is_mine"
                                    componentCenter={
                                        <Typo
                                            text="Yes, It’s Mine"
                                            fontSize={14}
                                            fontWeight="600"
                                            lineHeight={18}
                                        />
                                    }
                                />
                                <TouchableOpacity
                                    onPress={handleNotMine}
                                    activeOpacity={0.8}
                                    testID="security_image_not_mine"
                                >
                                    <Typo
                                        color={ROYAL_BLUE}
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={18}
                                        text="Not Mine"
                                        textAlign="left"
                                        style={styles.notMine}
                                    />
                                </TouchableOpacity>
                            </View>
                        </FixedActionContainer>
                    </>
                </ScreenLayout>

                <Popup
                    visible={notMine}
                    onClose={handleCloseNotMine}
                    title="Contact Bank"
                    description="For any enquiries regarding your account, please call the Customer Care Hotline at 1 300 88 6688."
                    primaryAction={{
                        text: "Call Now",
                        onPress: handleCallHotline,
                    }}
                />
            </>
        </ScreenContainer>
    );
}
OnboardingSecurityImage.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

const styles = StyleSheet.create({
    avatar: {
        borderRadius: 40,
        height: 78,
        width: 78,
    },
    avatarContainer: {
        alignItems: "center",
        backgroundColor: WHITE,
        borderRadius: 40,
        elevation: 12,
        height: 80,
        justifyContent: "center",
        shadowColor: SHADOW,
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 1,
        shadowRadius: 15,
        width: 80,
    },
    avatarInner: {
        alignItems: "center",
        backgroundColor: WHITE,
        borderRadius: 40,
        height: "100%",
        justifyContent: "center",
        overflow: "hidden",
        padding: 2,
        width: "100%",
    },
    container: {
        flex: 1,
        justifyContent: "space-between",
        paddingHorizontal: 46,
        paddingTop: 18,
    },
    footer: {
        alignItems: "center",
        flexDirection: "column",
        width: "100%",
    },
    label: {
        paddingBottom: 8,
        paddingTop: 24,
    },
    meta: {
        alignItems: "center",
    },
    notMine: {
        paddingVertical: 24,
    },
    securePhrase: {
        borderColor: BLACK,
        borderRadius: 28,
        borderWidth: 1,
        paddingHorizontal: 28,
        paddingVertical: 12,
    },
});

export default OnboardingSecurityImage;
