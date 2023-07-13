import Clipboard from "@react-native-community/clipboard";
import PropTypes from "prop-types";
import React, { useState, useCallback, useEffect } from "react";
import { View, StyleSheet, Image, ScrollView } from "react-native";
import * as Animatable from "react-native-animatable";
import Share from "react-native-share";

import { COMMON_MODULE, PDF_VIEW } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import { TouchableSpring, Animated } from "@components/Animations/TouchableSpring";
import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Typography from "@components/Text";
import { showInfoToast, showErrorToast } from "@components/Toast";

import { withModelContext } from "@context";

import { getInviteCode, getReferralCount, invokeL2 } from "@services";
import { logEvent } from "@services/analytics";

import { MEDIUM_GREY, YELLOW, GREY, WHITE, SHADOW, ROYAL_BLUE, PINK } from "@constants/colors";
import { FA_SCREEN_NAME, FA_SELECT_ACTION, FA_VIEW_SCREEN } from "@constants/strings";

import { responsive } from "@utils";

import Images from "@assets";

const SHADOW_DARK = "rgba(0, 0, 0, 0.31)";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
    },
    containerNoCampaign: {
        paddingTop: responsive.height(255, 667),
    },
    referralBgTop: {
        height: "100%",
        width: "100%",
    },
    referralBgTopCampaignContainer: {
        height: responsive.height(255, 667),
        width: "100%",
    },
    referralBgTopContainer: {
        height: responsive.height(255, 667),
        position: "absolute",
        top: 0,
        width: "100%",
    },
    referralCodeCard: {
        alignItems: "center",
        backgroundColor: WHITE,
        borderRadius: 16,
        elevation: 4,
        justifyContent: "center",
        paddingHorizontal: 48,
        paddingVertical: 18,
        shadowColor: SHADOW,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 1,
        shadowRadius: 8,
        width: 275,
    },
    referralCodeCardCopyContainer: {
        marginLeft: 4,
    },
    referralCodeCardCopyIcon: {
        height: 14,
        width: 12,
    },
    referralCodeCardInner: {
        alignItems: "center",
        flexDirection: "row",
    },
    referralCodeContainer: {
        alignItems: "center",
        paddingBottom: 24,
        paddingTop: 16,
    },
    referralMetaContainer: {
        paddingHorizontal: responsive.width(40, 375),
    },
    referralMetaDescription: {
        paddingHorizontal: 10,
        paddingVertical: 24,
    },
    scroller: {
        paddingBottom: 18,
    },
    separator: {
        backgroundColor: GREY,
        height: 1,
    },
    separatorContainer: {
        paddingHorizontal: 24,
        width: "100%",
    },
    successfulReferralContainer: {
        alignItems: "center",
        paddingBottom: 26,
        paddingTop: 16,
    },
    successfulReferralPill: {
        alignItems: "center",
        backgroundColor: PINK,
        borderColor: WHITE,
        borderRadius: 30,
        borderStyle: "solid",
        borderWidth: 3,
        justifyContent: "center",
        paddingHorizontal: 28,
        paddingVertical: 8,
        shadowColor: SHADOW_DARK,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 1,
        shadowRadius: 10,
    },
    successfulReferralPillContainer: {
        alignItems: "center",
        marginTop: 8,
    },
    underline: {
        textDecorationLine: "underline",
    },
});

function Referral({ navigation, getModel, updateModel }) {
    const [referralCount, setCount] = useState(0);
    const { referralCode, isOnboard, rewardInfo } = getModel("user");
    const { isReferralCampaign } = getModel("misc");
    const { isPostLogin } = getModel("auth");

    const shareMessage = {
        default: `The MAE app makes handling all my money moments even easier! It’s got key M2U banking features, an expense tracker, Tabung to help me save and more. Download today to give it a go.`,
        campaign: `Psst, a cash prize could be yours! Just download the MAE app and register with my code ${referralCode} for free. You don't even need to be a Maybank customer. This app has key M2U banking features, helps track expenses and more! Check it out!`,
    };

    function handleBack() {
        navigation.canGoBack() && navigation.goBack();
    }

    const authenticate = useCallback(async () => {
        try {
            const response = await invokeL2(true);
            const code = response?.data?.code ?? null;
            console.info("rarsh authenticate: code ", code);
            if (code !== 0) {
                handleBack();
            } else {
                if (isReferralCampaign) {
                    getCount();
                }
                if (!referralCode) {
                    getReferalCode();
                }
            }
        } catch (error) {
            handleBack();
            // showErrorToast({
            //     message: "Login failed.",
            // });
        }
    }, []);

    const getReferalCode = useCallback(async () => {
        try {
            const referral = await getInviteCode();

            if (referral) {
                const { inviteCode, ntb } = referral?.data;
                if (inviteCode) {
                    updateModel({
                        user: {
                            referralCode: inviteCode,
                            rewardInfo: ntb,
                        },
                    });
                }
            }
        } catch (error) {
            showErrorToast({
                message: "Unable to retrieved referral code.",
            });
        }
    }, [referralCode, updateModel]);

    const handleCopyReferral = useCallback(() => {
        // copy the referral code
        Clipboard.setString(referralCode);

        showInfoToast({
            message: "Referral code copied to clipboard.",
        });
    }, [referralCode]);

    const getCount = useCallback(async () => {
        // get the referral count
        try {
            const referral = await getReferralCount();

            if (referral) {
                const { count } = referral?.data;

                setCount(count);
            }
        } catch (error) {
            showErrorToast({
                message: "Unable to retrieve the referral count.",
            });
        }
    }, []);

    const handleReferShare = useCallback(async () => {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "Settings_Profile_ReferralCode",
            action_name: "Refer Now",
        });

        // show share action sheet.
        const shareOptions = {
            title: "Refer Friends",
            subject: "Refer Friends",
            message: isReferralCampaign ? shareMessage.campaign : shareMessage.default,
            failOnCancel: false,
        };

        try {
            const share = await Share.open(shareOptions);

            if (share) {
                console.tron.log(share);
            }
        } catch (error) {
            console.tron.log(error);
            showErrorToast({
                message: "Unable to share.",
            });
        }
    }, [isReferralCampaign, shareMessage.campaign, shareMessage.default]);

    const hanldeGoToTnc = useCallback(() => {
        const params = {
            file: "https://www.maybank2u.com.my/iwov-resources/pdf/personal/promotions/2021/mae-referral-campaign_tnc.pdf",
            share: false,
            showCrossBtn: true,
            type: "url",
            title: "Terms & Conditions",
            pdfType: "shareReceipt",
        };

        navigation.navigate(COMMON_MODULE, {
            screen: PDF_VIEW,
            params: { params },
        });
    }, [navigation]);

    useEffect(() => {
        if (!isPostLogin && isOnboard) {
            authenticate();
        } else {
            if (isReferralCampaign) {
                getCount();
            }
            if (!referralCode) {
                getReferalCode();
            }
        }
        // only need it once
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    useEffect(() => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Settings_Profile_ReferralCode",
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return (
        <ScreenContainer
            backgroundType="color"
            backgroundColor={MEDIUM_GREY}
            analyticScreenName="Settings_Profile_ReferralCode"
        >
            <ScreenLayout
                paddingBottom={0}
                paddingTop={0}
                paddingHorizontal={0}
                header={
                    <HeaderLayout
                        backgroundColor={YELLOW}
                        headerCenterElement={
                            <Typography
                                text="Referral Code"
                                fontWeight="600"
                                fontSize={16}
                                lineHeight={19}
                            />
                        }
                        headerLeftElement={<HeaderBackButton onPress={handleBack} />}
                    />
                }
                useSafeArea
            >
                {!isReferralCampaign && (
                    <Animatable.View animation="fadeInUp" style={styles.referralBgTopContainer}>
                        <Image
                            source={Images.referralOnboardSettings}
                            style={styles.referralBgTop}
                        />
                    </Animatable.View>
                )}
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scroller}
                >
                    <View
                        style={[
                            styles.container,
                            !isReferralCampaign && styles.containerNoCampaign,
                        ]}
                    >
                        {isReferralCampaign && (
                            <>
                                <Animatable.View
                                    animation="fadeInUp"
                                    style={styles.referralBgTopCampaignContainer}
                                >
                                    <Image
                                        source={Images.referralOnboardSettingsCampaign}
                                        style={styles.referralBgTop}
                                    />
                                </Animatable.View>
                                <Animatable.View
                                    animation="fadeInUp"
                                    delay={500}
                                    style={styles.successfulReferralContainer}
                                >
                                    <Typography
                                        text="Successful Referrals"
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={24}
                                    />
                                    <View style={styles.successfulReferralPillContainer}>
                                        <View style={styles.successfulReferralPill}>
                                            <Typography
                                                text={`${referralCount}`}
                                                fontSize={24}
                                                fontWeight="bold"
                                                color={WHITE}
                                                lineHeight={32}
                                            />
                                        </View>
                                    </View>
                                </Animatable.View>
                                <View style={styles.separatorContainer}>
                                    <View style={styles.separator} />
                                </View>
                            </>
                        )}
                        <Animatable.View
                            animation="fadeInUp"
                            delay={1000}
                            style={styles.referralCodeContainer}
                        >
                            <TouchableSpring
                                scaleTo={0.9}
                                tension={150}
                                onPress={handleCopyReferral}
                            >
                                {({ animateProp }) => (
                                    <Animated.View
                                        style={[
                                            styles.referralCodeCard,
                                            {
                                                transform: [
                                                    {
                                                        scale: animateProp,
                                                    },
                                                ],
                                            },
                                        ]}
                                    >
                                        <Typography
                                            text="Your Referral Code"
                                            fontSize={14}
                                            fontWeight="600"
                                            lineHeight={24}
                                        />
                                        <View style={styles.referralCodeCardInner}>
                                            <Typography
                                                text={referralCode}
                                                fontSize={24}
                                                fontWeight="600"
                                                lineHeight={34}
                                                color={ROYAL_BLUE}
                                            />
                                            <View style={styles.referralCodeCardCopyContainer}>
                                                <Image
                                                    source={Images.copyClipboard}
                                                    style={styles.referralCodeCardCopyIcon}
                                                />
                                            </View>
                                        </View>
                                    </Animated.View>
                                )}
                            </TouchableSpring>
                        </Animatable.View>
                        <Animatable.View
                            animation="fadeInUp"
                            delay={1500}
                            style={styles.referralMetaContainer}
                        >
                            <Typography
                                text={
                                    isReferralCampaign && rewardInfo?.refereeAmount
                                        ? `Refer friends and get RM${rewardInfo?.refereeAmount} each!`
                                        : "Loving the app?"
                                }
                                fontSize={16}
                                fontWeight="600"
                                lineHeight={18}
                            />
                            <View style={styles.referralMetaDescription}>
                                {isReferralCampaign && rewardInfo?.refereeAmount ? (
                                    <Typography>
                                        <Typography
                                            text={`Have friends who are not Maybank customers yet? Get them to sign up with your referral code and you'll both get RM${rewardInfo?.refereeAmount} each. First come first served, daily limit applies.\n\n`}
                                            fontSize={14}
                                            fontWeight="normal"
                                            lineHeight={22}
                                        />
                                        <Typography
                                            text="Refer to the "
                                            fontSize={14}
                                            fontWeight="normal"
                                            lineHeight={18}
                                        />
                                        <Typography
                                            text="Terms & Conditions"
                                            fontSize={14}
                                            fontWeight="bold"
                                            lineHeight={18}
                                            onPress={hanldeGoToTnc}
                                            style={styles.underline}
                                        />
                                        <Typography
                                            text=" for more details."
                                            fontSize={14}
                                            fontWeight="normal"
                                            lineHeight={18}
                                        />
                                    </Typography>
                                ) : (
                                    <Typography
                                        text="Refer a friend so they can enjoy the best banking experience too! After all, sharing is caring."
                                        fontSize={14}
                                        fontWeight="normal"
                                        lineHeight={18}
                                    />
                                )}
                            </View>
                        </Animatable.View>
                    </View>
                </ScrollView>
                <FixedActionContainer>
                    <ActionButton
                        fullWidth
                        borderRadius={25}
                        backgroundColor={YELLOW}
                        onPress={handleReferShare}
                        componentCenter={
                            <Typography
                                text="Refer Now"
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={18}
                            />
                        }
                    />
                </FixedActionContainer>
            </ScreenLayout>
        </ScreenContainer>
    );
}

Referral.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
    getModel: PropTypes.func,
    updateModel: PropTypes.func,
};

export default withModelContext(Referral);
