/* eslint-disable react/react-in-jsx-scope */
import PropTypes from "prop-types";
import React, { useCallback, useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

import {
    COMMON_MODULE,
    PDF_VIEW,
    TAB_NAVIGATOR,
    VIRTUAL_CARD_SCREEN,
    MAE_MODULE_STACK,
    MAE_SUCCESS2,
    MAE_SUCCESS,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Typography from "@components/Text";
import TextInput from "@components/TextInput";
import { showErrorToast, showInfoToast } from "@components/Toast";

import { withModelContext } from "@context";

import { getSignupDetailsForUser } from "@services";
import { validateSignUpCode } from "@services";
import { logEvent } from "@services/analytics";

import { BLACK, DISABLED, DISABLED_TEXT, MEDIUM_GREY, ROYAL_BLUE, YELLOW } from "@constants/colors";
import {
    ERROR_MSG_FOR_VALID_SIGN_UP_CODE,
    ERROR_MSG_FOR_SERVICE_UNAVAILABLE,
    MAE_PLACEHOLDER,
    MAE_FIRST_COME_FIRST_SERVE_TEXT,
    APPLY,
    SKIP,
    TERMS_CONDITIONS,
    SIGNUPCAMPAIGN_GA_SCREEN_NAME,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    SIGNUPCAMPAIGN_NEXT,
} from "@constants/strings";
import { SignUpCampaign_TermsCondition_PDF } from "@constants/url";

import { responsive } from "@utils";

import assets from "@assets";

const SignUpCampaign = ({ navigation, route, updateModel }) => {
    const [code, setCode] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [fullLoading, setFullLoading] = useState(true);
    const [title, setTitle] = useState("Have a Sign-up code?");
    const [desc, setDesc] = useState(
        "Start your MAE journey with a cash\nprize, instantly credited into your\naccount!"
    );
    const newUser = route.params.newUserStatus;

    useEffect(() => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: SIGNUPCAMPAIGN_GA_SCREEN_NAME,
        });

        // eslint-disable-next-line react-hooks/exhaustive-deps
        getSignupCampaignData();
    }, []);

    const getSignupCampaignData = async () => {
        let isBudgetExhausted, signupRewardAmount, splitTitleDesc;
        try {
            const response = await getSignupDetailsForUser();
            if (response) {
                const { ntbAmount, ntbBudget, etbBudget, etbAmount, message, signUpCode } =
                    response?.data;
                splitTitleDesc = message.split("||");
                setTitle(splitTitleDesc[0]);
                setDesc(splitTitleDesc[1]);
                if (newUser) {
                    isBudgetExhausted = ntbBudget < ntbAmount;
                    signupRewardAmount = ntbAmount;
                } else {
                    isBudgetExhausted = etbBudget < etbAmount;
                    signupRewardAmount = etbAmount;
                }
                updateModel({
                    user: {
                        isBudgetExhausted,
                        signupRewardAmount,
                        signUpCode,
                        isUsingSignUpCode: false,
                    },
                });
            }
        } catch (error) {
            showErrorToast({
                message: error?.message,
            });
        } finally {
            setFullLoading(false);
        }
    };
    const handleClose = useCallback(() => {
        if (newUser) {
            handleToSuccess();
        } else {
            navigation.canGoBack() && navigation.navigate(TAB_NAVIGATOR);
        }
    }, [handleToSuccess, navigation]);

    const handleToSuccess = useCallback(() => {
        const { filledUserDetails } = route?.params;
        if (newUser) {
            navigation.navigate(MAE_MODULE_STACK, {
                screen: VIRTUAL_CARD_SCREEN,
                params: {
                    filledUserDetails: route?.params?.filledUserDetails,
                },
            });
        } else {
            if (
                filledUserDetails?.entryScreen === "Apply" ||
                filledUserDetails?.entryScreen === "Tab"
            ) {
                navigation.navigate(MAE_MODULE_STACK, {
                    screen: MAE_SUCCESS,
                    params: {
                        ...route?.params,
                    },
                });
            } else {
                navigation.navigate(MAE_MODULE_STACK, {
                    screen: MAE_SUCCESS2,
                    params: {
                        ...route?.params,
                    },
                });
            }
        }
    }, [navigation, newUser, route?.params]);

    const handleSubmitInput = useCallback(async () => {
        if (code.length < 3) {
            setError(ERROR_MSG_FOR_VALID_SIGN_UP_CODE);
            return;
        }

        if (code) {
            setLoading(true);

            try {
                const response = await validateSignUpCode({
                    signUpCode: code,
                });

                if (response) {
                    handleToSuccess();
                    updateModel({
                        user: {
                            isUsingSignUpCode: true,
                            signUpCode: code,
                        },
                    });
                }
            } catch (err) {
                if (err.status === 400) {
                    setError(ERROR_MSG_FOR_VALID_SIGN_UP_CODE);
                } else {
                    showInfoToast({
                        message: ERROR_MSG_FOR_SERVICE_UNAVAILABLE,
                    });
                }
            } finally {
                setLoading(false);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [code, handleToSuccess]);

    function handleUpdateCode(text) {
        if (text && text.length < 3) {
            setError(ERROR_MSG_FOR_VALID_SIGN_UP_CODE);
        } else {
            setError("");
        }
        setCode(text);
    }

    const handleSkip = useCallback(() => {
        handleToSuccess();
    }, [handleToSuccess]);

    const handleOnTncLink = useCallback(() => {
        const params = {
            file: SignUpCampaign_TermsCondition_PDF,
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
            showLoaderModal={fullLoading}
            analyticScreenName="SignUpCampaign"
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
                <ScrollView contentContainerStyle={styles.scroller}>
                    <View>
                        <View style={styles.title}>
                            <Typography
                                fontSize={18}
                                fontWeight="600"
                                lineHeight={26}
                                text={title}
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
                                placeholder={MAE_PLACEHOLDER}
                                onSubmitEditing={handleSubmitInput}
                                onChangeText={handleUpdateCode}
                                minLength={3}
                            />
                        </View>
                        <View style={styles.campaignContainer}>
                            <Typography
                                fontSize={16}
                                lineHeight={22}
                                fontWeight="600"
                                text={desc}
                            />

                            <Typography
                                text={MAE_FIRST_COME_FIRST_SERVE_TEXT}
                                fontSize={14}
                                fontWeight="normal"
                                lineHeight={20}
                            />
                            <Typography
                                text={TERMS_CONDITIONS}
                                fontWeight="bold"
                                fontSize={14}
                                lineHeight={20}
                                style={styles.tncLink}
                                onPress={handleOnTncLink}
                            />

                            <Typography
                                text={APPLY}
                                fontSize={14}
                                fontWeight="normal"
                                lineHeight={20}
                            />
                        </View>

                        <View style={[styles.smallHorizontalPage, styles.campaignBgInner]}>
                            <Image
                                source={assets.signUpCampaign}
                                resizeMode="contain"
                                style={styles.campaignBgImg}
                            />
                        </View>
                    </View>
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
                                    text={SIGNUPCAMPAIGN_NEXT}
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
                                text={SKIP}
                                style={styles.skip}
                            />
                        </TouchableOpacity>
                    </View>
                </FixedActionContainer>
            </ScreenLayout>
        </ScreenContainer>
    );
};

SignUpCampaign.propTypes = {
    getModel: PropTypes.func,
    navigation: PropTypes.object,
    route: PropTypes.object,
    updateModel: PropTypes.func,
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
        marginTop: 24,
        paddingHorizontal: responsive.width(20, 375),
    },
    footer: {
        alignItems: "center",
        flexDirection: "column",
        width: "100%",
    },
    horizontalPage: {
        paddingHorizontal: 36,
    },
    scroller: {
        position: "relative",
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

export default withModelContext(SignUpCampaign);
