import PropTypes from "prop-types";
import React, { useState, useCallback } from "react";
import { View, StyleSheet, TouchableOpacity, Image, ScrollView } from "react-native";

import {
    TAB_NAVIGATOR,
    COMMON_MODULE,
    PDF_VIEW,
    VIRTUAL_CARD_SCREEN,
    MAE_MODULE_STACK,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Typography from "@components/Text";
import TextInput from "@components/TextInput";
import { showInfoToast } from "@components/Toast";

import { withModelContext } from "@context";

import { validateCode } from "@services";
import { logEvent } from "@services/analytics";

import { MEDIUM_GREY, ROYAL_BLUE, DISABLED, YELLOW, DISABLED_TEXT, BLACK } from "@constants/colors";
import {
    FA_FORM_PROCEED,
    FA_SCREEN_NAME,
    FA_SELECT_ACTION,
    VALID_REFERRAL_CODE,
    ERROR_MSG_FOR_SERVICE_UNAVAILABLE,
    TERMS_CONDITIONS,
    MAYBANK_CUSTOMER_CONFIRMATION_TEXT,
} from "@constants/strings";

import { responsive } from "@utils";

import assets from "@assets";

function OnboardingReferral({ navigation, route, getModel }) {
    const [code, setCode] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { rewardInfo } = getModel("user");
    const { isReferralCampaign } = getModel("misc");
    const newUser = route.params.newUserStatus;

    const handleClose = useCallback(() => {
        navigation.canGoBack() && navigation.navigate(TAB_NAVIGATOR);
    }, [navigation]);

    const handleToSuccess = useCallback(() => {
        if (newUser) {
            navigation.navigate(MAE_MODULE_STACK, {
                screen: VIRTUAL_CARD_SCREEN,
                params: {
                    filledUserDetails: route?.params?.filledUserDetails,
                },
            });
        } else {
            navigation.navigate("OnboardingM2uSuccess", route?.params);
        }
    }, [navigation, newUser, route?.params]);

    const handleSubmitInput = useCallback(async () => {
        if (code.length < 3) {
            setError(VALID_REFERRAL_CODE);
            return;
        }

        if (code) {
            setLoading(true);

            try {
                // submit the referral code
                const response = await validateCode({
                    inviteCode: code,
                });

                if (response) {
                    logEvent(FA_FORM_PROCEED, {
                        [FA_SCREEN_NAME]: "ReferredbyFriend",
                        coupon: code,
                    });

                    handleToSuccess();
                }
            } catch (err) {
                if (err.status === 400) {
                    setError(VALID_REFERRAL_CODE);
                } else {
                    // some error issue
                    showInfoToast({
                        message: { ERROR_MSG_FOR_SERVICE_UNAVAILABLE },
                    });
                }
            } finally {
                setLoading(false);
            }
        }
    }, [code, handleToSuccess]);

    function handleUpdateCode(text) {
        if (text && text.length < 3) {
            setError(VALID_REFERRAL_CODE);
        } else {
            setError("");
        }
        setCode(text);
    }

    const handleSkip = useCallback(() => {
        // Navigate to Forgot Login Details flow

        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "ReferredbyFriend",
            action_name: "Skip",
        });

        handleToSuccess();
    }, [handleToSuccess]);

    const handleOnTncLink = useCallback(() => {
        const params = {
            file: "https://www.maybank2u.com.my/iwov-resources/pdf/personal/promotions/2021/mae-referral-campaign_tnc.pdf",
            share: false,
            showCrossBtn: true,
            type: "url",
            title: TERMS_CONDITIONS,
            pdfType: "shareReceipt",
        };

        navigation.navigate(COMMON_MODULE, {
            screen: PDF_VIEW,
            params: { params },
        });
    }, [navigation]);

    return (
        <ScreenContainer
            backgroundType="color"
            backgroundColor={MEDIUM_GREY}
            analyticScreenName="ReferredbyFriend"
        >
            <ScreenLayout
                paddingBottom={0}
                paddingTop={20}
                paddingHorizontal={0}
                header={
                    <HeaderLayout
                        headerRightElement={<HeaderCloseButton onPress={handleClose} />}
                    />
                }
                useSafeArea
            >
                <ScrollView
                    contentContainerStyle={[
                        styles.scroller,
                        !isReferralCampaign && styles.scrollerNoCampaign,
                    ]}
                >
                    <View>
                        <View style={styles.title}>
                            <Typography
                                fontSize={18}
                                fontWeight="600"
                                lineHeight={26}
                                text={MAYBANK_CUSTOMER_CONFIRMATION_TEXT}
                            />
                        </View>
                        <View style={styles.horizontalPage}>
                            <TextInput
                                autoCorrect={false}
                                autoCapitalize="none"
                                isValidate
                                isValid={!error}
                                errorMessage={error}
                                enablesReturnKeyAutomatically
                                importantForAutofill="no"
                                returnKeyType="next"
                                value={code}
                                placeholder="ABC1234"
                                onSubmitEditing={handleSubmitInput}
                                onChangeText={handleUpdateCode}
                                minLength={3}
                            />
                        </View>
                        <View style={styles.innerContainer}>
                            <Typography
                                fontSize={16}
                                fontWeight="600"
                                lineHeight={18}
                                text={
                                    isReferralCampaign
                                        ? `Earn RM${rewardInfo?.refereeAmount} when you sign up using a friend's referral code!`
                                        : `Key in your friend's referral code.`
                                }
                            />
                        </View>
                        <View
                            style={
                                isReferralCampaign
                                    ? styles.campaignContainer
                                    : styles.horizontalPage
                            }
                        >
                            <Typography>
                                <Typography
                                    fontSize={14}
                                    lineHeight={22}
                                    fontWeight="normal"
                                    text={
                                        isReferralCampaign
                                            ? `Both you and your friend will be instantly rewarded with an RM${rewardInfo?.refereeAmount} cash prize into your MAE accounts. First come first served, daily limit applies. Refer to the `
                                            : "Start using the MAE app now to enjoy all sorts of exciting features! Let us sort out your spending, savings, cravings and more."
                                    }
                                />
                                {isReferralCampaign && (
                                    <Typography
                                        text={`${TERMS_CONDITIONS}`}
                                        fontWeight="bold"
                                        fontSize={14}
                                        lineHeight={20}
                                        style={styles.tncLink}
                                        onPress={handleOnTncLink}
                                    />
                                )}
                                {isReferralCampaign && (
                                    <Typography
                                        text=" for more details."
                                        fontSize={14}
                                        fontWeight="normal"
                                        lineHeight={20}
                                    />
                                )}
                            </Typography>
                        </View>
                        {isReferralCampaign && (
                            <View style={styles.smallHorizontalPage}>
                                <View style={styles.campaignBgInner}>
                                    <Image
                                        source={assets.referralOnboardOnCampaign}
                                        resizeMode="contain"
                                        style={styles.campaignBgImg}
                                    />
                                </View>
                            </View>
                        )}
                    </View>
                    {!isReferralCampaign && (
                        <View style={styles.smallHorizontalPage}>
                            <View style={styles.noCampaignContainer}>
                                <Image
                                    source={assets.referralOnboardBase}
                                    style={styles.noCampaignBgImg}
                                />
                            </View>
                        </View>
                    )}
                </ScrollView>
                <FixedActionContainer>
                    <View style={styles.footer}>
                        <ActionButton
                            disabled={loading || !!error || code.length < 3}
                            isLoading={loading}
                            fullWidth
                            borderRadius={25}
                            onPress={handleSubmitInput}
                            backgroundColor={
                                loading || !!error || code.length < 3 ? DISABLED : YELLOW
                            }
                            componentCenter={
                                <Typography
                                    color={
                                        loading || !!error || code.length < 3
                                            ? DISABLED_TEXT
                                            : BLACK
                                    }
                                    text="Done"
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={18}
                                />
                            }
                        />
                        <TouchableOpacity onPress={handleSkip} activeOpacity={0.8}>
                            <Typography
                                color={ROYAL_BLUE}
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={18}
                                text="Skip"
                                style={styles.skip}
                            />
                        </TouchableOpacity>
                    </View>
                </FixedActionContainer>
            </ScreenLayout>
        </ScreenContainer>
    );
}

OnboardingReferral.propTypes = {
    getModel: PropTypes.func,
    navigation: PropTypes.object,
    route: PropTypes.object,
};

const styles = StyleSheet.create({
    campaignBgImg: {
        height: responsive.height(190, 667),
        width: "100%",
    },
    campaignBgInner: {
        width: "100%",
    },
    campaignContainer: {
        paddingHorizontal: responsive.width(42, 375),
    },
    footer: {
        alignItems: "center",
        flexDirection: "column",
        width: "100%",
    },
    horizontalPage: {
        paddingHorizontal: 36,
    },
    innerContainer: {
        paddingBottom: 16,
        paddingHorizontal: responsive.width(58, 375),
        paddingTop: 24,
    },
    noCampaignBgImg: {
        height: "100%",
        width: "100%",
    },
    noCampaignContainer: {
        height: responsive.height(218, 667),
        width: "100%",
    },
    scroller: {
        position: "relative",
    },
    scrollerNoCampaign: {
        flex: 1,
        justifyContent: "space-between",
    },
    skip: {
        marginTop: 24,
    },
    smallHorizontalPage: {
        paddingVertical: 16,
    },
    title: { marginBottom: 24, paddingHorizontal: 36 },
    tncLink: {
        textDecorationLine: "underline",
    },
});

export default withModelContext(OnboardingReferral);
