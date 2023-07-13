import PropTypes from "prop-types";
import React, { useCallback, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import * as Animatable from "react-native-animatable";
import Share from "react-native-share";
import { useDispatch, useSelector } from "react-redux";

import { onMAETopUpButtonTap } from "@screens/MAE/Topup/TopupController";
import {
    handlePremierResumeFlow,
    handlePremierETBFlow,
    handleZestResumeOnboarding,
} from "@screens/Premier/helpers/premierHelpers";
import {
    EmployeeDetailsPrefiller,
    PersonalDetailsPrefiller,
} from "@screens/ZestCASA/helpers/CustomerDetailsPrefiller";
import {
    callPrequalPostLogin,
    listOfNonMAEAccounts,
    shouldGoToActivationPendingScreen,
    shouldShowSuitabilityAssessmentForETBCustomer,
} from "@screens/ZestCASA/helpers/ZestHelpers";

import {
    TAB_NAVIGATOR,
    BANKINGV2_MODULE,
    ZEST_CASA_STACK,
    ZEST_CASA_SUITABILITY_ASSESSMENT,
    ZEST_CASA_ACTIVATION_PENDING,
    ZEST_CASA_ACCOUNT_NOT_FOUND,
    ASB_STACK,
    PREMIER_SUITABILITY_ASSESSMENT,
    PREMIER_ACTIVATION_PENDING,
    PREMIER_RESIDENTIAL_DETAILS,
    ONE_TAP_AUTH_MODULE,
} from "@navigation/navigationConstant";

import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { useModelController } from "@context";

import { bankingGetDataMayaM2u } from "@services";
import { logEvent } from "@services/analytics";

import { UPDATE_ACCOUNT_LIST_AND_MAE_STATUS_ACTION } from "@redux/actions/services/getAccountListAction";
import { PREPOSTQUAL_UPDATE_USER_STATUS } from "@redux/actions/services/prePostQualAction";

import { MEDIUM_GREY, ROYAL_BLUE, YELLOW } from "@constants/colors";
import {
    FA_FORM_COMPLETE,
    FA_SCREEN_NAME,
    FA_SELECT_ACTION,
    REFERRAL_SUCCESSFUL_SCREEN_TEXT,
    SET_UP_SUCCESSFUL,
    FA_ACTION_NAME,
    REFER_FRIENDS_TEXT,
    SHARE_SIGNUP_CODE_BUTTON_TEXT,
    REFERRED_BY_FRIEND_SETUP_SUCCESSFUL_GA,
    DONE,
    EXPLORE_MAE_BUTTON_TEXT,
    FA_ONBOARD_SUCCESSFUL,
    FA_VIEW_SCREEN,
    REFERRAL_SUCCESSFUL_SCREEN_TEXT_ACTIVATE_S2U,
    ACTIVATES2U,
} from "@constants/strings";
import {
    CHECK_08_SCREEN,
    ZEST_DRAFT_USER,
    ZEST_FULL_ETB_USER,
    ZEST_M2U_ONLY_USER,
    ZEST_NTB_USER,
} from "@constants/zestCasaConfiguration";

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

function OnboardingSuccess({ navigation, route }) {
    const { getModel } = useModelController();
    const isMaeOnboarding = route?.params?.isMaeOnboarding ?? false;
    const goToTopup = route?.params?.goToTopup ?? false;
    const ekycStatus = route?.params?.authData?.ekyc_status;
    const screenName = route?.params?.screenName ?? "";
    const cusType = route?.params?.authData?.cus_type;
    const isETBCustomer = cusType && (cusType === "01" || cusType === "05");
    const {
        misc: { isReferralCampaign, isSignupCampaignPeriod, isForceS2uReady },
        user: {
            referralCode,
            soleProp,
            signUpCode,
            isBudgetExhausted,
            signupRewardAmount,
            isUsingSignUpCode,
        },
    } = getModel(["misc", "user"]);

    const getAccountListReducer = useSelector((state) => state.getAccountListReducer);
    const premierIdentityReducer = useSelector(
        (state) => state.zestCasaReducer.identityDetailsReducer
    );
    const entryReducer = useSelector((state) => state.zestCasaReducer.entryReducer);
    const premierMasterDataReducer = useSelector((state) => state.masterDataReducer);
    const { accountListings } = getAccountListReducer ?? [];
    const isZest = route?.params?.filledUserDetails?.isZest ?? false;
    const userType = route?.params?.filledUserDetails?.userTypeSend;
    const dispatch = useDispatch();
    const masterDataReducer = useSelector((state) => state.masterDataReducer);

    const shareMessage = {
        default: `The MAE app makes handling all my money moments even easier! It’s got key M2U banking features, an expense tracker, Tabung to help me save and more. Download today and key in ${signUpCode} when you create a MAE account to enjoy a cash prize.`,
        campaign: `Psst, a cash prize could be yours! Just download the MAE app and register with my code ${referralCode} for free. You don't even need to be a Maybank customer. This app has key M2U banking features, helps track expenses and more! Check it out!`,
    };

    function handleGoToDashboard() {
        if (isMaeOnboarding && goToTopup) {
            // go to top up
            //Topup module under development, once code merge done, need to navigate to TopUp
            const navParams = {
                data: route?.params?.maeAccount ?? null,
                routeFrom: "Dashboard",
            };
            onMAETopUpButtonTap(navParams);
        } else if (isMaeOnboarding) {
            navigation.navigate(TAB_NAVIGATOR, {
                screen: "Tab",
                params: {
                    screen: "Maybank2u",
                },
            });
        } else if (ekycStatus === "03") {
            resumeMaeReupload(route?.params?.authData);
        } else if (
            (ekycStatus === "00" ||
                ekycStatus === "01" ||
                (route?.params?.authData?.resumeStageInd &&
                    route?.params?.authData?.resumeStageInd != "2") ||
                (route?.params?.authData?.rsaIndicator &&
                    route?.params?.authData?.rsaIndicator != "2")) &&
            route?.params?.authData?.cus_type === "10"
        ) {
            resumeMaeAddressUpdate(route?.params?.authData);
        } else if (screenName === "PLSTPLandingPage") {
            navigation.navigate(BANKINGV2_MODULE, {
                screen: screenName,
                params: {
                    from: screenName,
                },
            });
        } else if (screenName === "Apply") {
            navigation.navigate(TAB_NAVIGATOR, {
                screen: screenName,
                params: {
                    from: screenName,
                },
            });
        } else if (["ApplyLoans", "ApprovedFinanceDetails", "Article"].includes(screenName)) {
            navigation.navigate(ASB_STACK, {
                screen: screenName,
                params: {
                    from: screenName,
                },
            });
        } else if (screenName === ZEST_CASA_SUITABILITY_ASSESSMENT) {
            callPrequalPostLogin(navigation, dispatch, isZest, (result, userStatus) => {
                if (userStatus && userStatus !== ZEST_NTB_USER && userStatus !== ZEST_DRAFT_USER)
                    prefillDetailsForExistingUser(result);

                if (userType === ZEST_M2U_ONLY_USER) {
                    callGetAccountsListService(false);
                }

                const saDailyIndicator = result?.saDailyInd ?? null;

                console.log("saDailyIndicator", isZest, saDailyIndicator);

                const shouleShowSuitablity = shouldShowSuitabilityAssessmentForETBCustomer(
                    isZest,
                    saDailyIndicator
                );

                if (shouleShowSuitablity) {
                    navigation.navigate(ZEST_CASA_STACK, {
                        screen: ZEST_CASA_SUITABILITY_ASSESSMENT,
                    });
                } else {
                    navigation.navigate(ZEST_CASA_STACK, {
                        screen: screenName,
                    });
                }
            });
        } else if (screenName === CHECK_08_SCREEN && isZest) {
            callPrequalPostLogin(navigation, dispatch, isZest, () => {
                navigation.navigate(ZEST_CASA_STACK, {
                    screen: shouldGoToActivationPendingScreen(accountListings)
                        ? navigation.navigate(ZEST_CASA_ACTIVATION_PENDING)
                        : navigation.navigate(ZEST_CASA_ACCOUNT_NOT_FOUND),
                });
            });
        } else if (screenName === ZEST_CASA_ACTIVATION_PENDING) {
            if (route?.params?.authData?.cus_type === "10") {
                navigation.navigate(ZEST_CASA_STACK, {
                    screen: ZEST_CASA_ACCOUNT_NOT_FOUND,
                    params: {
                        isVisitBranchMode: true,
                    },
                });
            } else {
                // callGetAccountListService();
                handleZestResumeOnboarding(navigation, premierIdentityReducer?.identityNumber);
            }

        } else if (screenName === PREMIER_RESIDENTIAL_DETAILS || (screenName === CHECK_08_SCREEN && !isZest)) {
            handlePremierETBFlow(navigation, dispatch, premierMasterDataReducer, entryReducer);
        } else if (screenName === PREMIER_ACTIVATION_PENDING || screenName === PREMIER_SUITABILITY_ASSESSMENT) {
            handlePremierResumeFlow(navigation, dispatch, premierIdentityReducer, entryReducer);
        } else if (isForceS2uReady && isETBCustomer) {
            navigation.push(ONE_TAP_AUTH_MODULE, {
                screen: "Activate",
                params: {
                    flowParams: {
                        success: {
                            stack: "TabNavigator",
                            screen: "Tab",
                        },
                        params: { showS2UCoolingToast: false },
                    },
                    disableBackCloseButton: true,
                },
            });
        } else {
            //go back and refresh
            navigation.navigate(TAB_NAVIGATOR, {
                screen: "Tab",
                params: {
                    screen: "Dashboard",
                    refresh: true,
                },
            });
        }
    }

    function prefillDetailsForExistingUser(result) {
        PersonalDetailsPrefiller(dispatch, masterDataReducer, result);
        EmployeeDetailsPrefiller(dispatch, masterDataReducer, result);
    }

    async function callGetAccountsListService(isDraftNTB = false, callback) {
        try {
            const path = `/summary?type=A&checkMae=true`;

            const response = await bankingGetDataMayaM2u(path, false);

            if (response && response.data && response.data.code === 0) {
                const { accountListings, maeAvailable } = response.data.result;

                if (accountListings && accountListings.length) {
                    listOfNonMAEAccounts(accountListings, (listOfNonMAEAccounts) => {
                        if (listOfNonMAEAccounts.length > 0) {
                            dispatch({
                                type: UPDATE_ACCOUNT_LIST_AND_MAE_STATUS_ACTION,
                                accountListings,
                                maeAvailable,
                            });

                            if (isDraftNTB) {
                                if (callback) {
                                    callback(accountListings);
                                }
                            } else {
                                dispatch({
                                    type: PREPOSTQUAL_UPDATE_USER_STATUS,
                                    userStatus: ZEST_FULL_ETB_USER,
                                });
                            }
                        }
                    });
                }
            }
        } catch (error) {
            return showErrorToast({
                message: "We are unable to fetch a list of your accounts",
            });
        }
    }

    function resumeMaeReupload(data) {
        const { ic_number, resident_country } = data;
        const entryParams = {
            screen: "Dashboard",
            params: { refresh: true },
        };

        navigation.navigate("MAEModuleStack", {
            screen: "MAEReupload",
            params: {
                ic_number,
                resident_country,
                entryStack: "TabNavigator",
                entryScreen: "Tab",
                entryParams,
            },
        });
    }

    function resumeMaeAddressUpdate(data) {
        const entryParams = {
            screen: "Dashboard",
            params: { refresh: true },
        };

        const filledUserDetails = {
            entryStack: "TabNavigator",
            entryScreen: "Tab",
            entryParams,
            from: "updateDetails",
            loginData: data,
        };

        navigation.navigate("MAEModuleStack", {
            screen: "MAEAddressEntryScreen",
            params: {
                filledUserDetails,
            },
        });
    }

    const handleRefer = useCallback(async () => {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: REFERRED_BY_FRIEND_SETUP_SUCCESSFUL_GA,
            [FA_ACTION_NAME]: REFER_FRIENDS_TEXT,
        });

        // show share action sheet.
        const shareOptions = {
            title: REFER_FRIENDS_TEXT,
            subject: REFER_FRIENDS_TEXT,
            message:
                isSignupCampaignPeriod && !route.params.isSignUpCampaignNonMaeAccount
                    ? shareMessage.default
                    : shareMessage.campaign,
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

    const checkGameChances = useCallback(() => {
        const {
            misc: { isCampaignPeriod, isTapTasticReady, tapTasticType },
        } = getModel(["misc", "s2w"]);

        const { displayPopup, chance } = route?.params?.s2w;

        if ((isCampaignPeriod || isTapTasticReady) && displayPopup) {
            navigation.push("TabNavigator", {
                screen: "CampaignChancesEarned",
                params: {
                    chances: chance,
                    isTapTasticReady,
                    tapTasticType,
                },
            });
        }
    }, [getModel, route?.params?.s2w, navigation]);

    useEffect(() => {
        if (route?.params?.s2w) {
            checkGameChances();
        }

        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: REFERRED_BY_FRIEND_SETUP_SUCCESSFUL_GA,
        });

        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_ONBOARD_SUCCESSFUL,
        });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <ScreenContainer
            backgroundType="color"
            backgroundColor={MEDIUM_GREY}
            analyticScreenName={REFERRED_BY_FRIEND_SETUP_SUCCESSFUL_GA}
        >
            <>
                <ScreenLayout
                    paddingBottom={0}
                    paddingTop={0}
                    paddingHorizontal={0}
                    header={<View />}
                    useSafeArea
                    neverForceInset={["top"]}
                >
                    <View style={styles.container}>
                        <View style={styles.meta}>
                            <Animatable.Image
                                animation={animateFadeInUp}
                                delay={500}
                                duration={500}
                                source={Images.onboardingSuccessBg}
                                style={styles.imageBg}
                                useNativeDriver
                            />
                        </View>
                        <View style={styles.footer}>
                            <Animatable.View
                                animation={animateFadeInUp}
                                duration={250}
                                delay={1000}
                                style={styles.copy}
                                useNativeDriver
                            >
                                <Typo
                                    fontSize={16}
                                    lineHeight={19}
                                    fontWeight="600"
                                    text={SET_UP_SUCCESSFUL}
                                    textAlign="left"
                                />
                                <Typo
                                    fontSize={20}
                                    fontWeight="400"
                                    lineHeight={28}
                                    style={styles.label}
                                    text={
                                        isSignupCampaignPeriod &&
                                        !route.params.isSignUpCampaignNonMaeAccount &&
                                        !isBudgetExhausted &&
                                        isUsingSignUpCode
                                            ? `You're all set to enjoy the app with a sign-up reward of RM${signupRewardAmount}. Share the joy with your friends too!`
                                            : isForceS2uReady && isETBCustomer
                                            ? REFERRAL_SUCCESSFUL_SCREEN_TEXT_ACTIVATE_S2U
                                            : REFERRAL_SUCCESSFUL_SCREEN_TEXT
                                    }
                                    textAlign="left"
                                />
                            </Animatable.View>
                            <Animatable.View
                                animation={animateFadeInUp}
                                duration={250}
                                delay={1100}
                                useNativeDriver
                            >
                                <FixedActionContainer>
                                    <View style={styles.shareBtnContainerView}>
                                        <ActionButton
                                            fullWidth
                                            borderRadius={25}
                                            onPress={handleGoToDashboard}
                                            backgroundColor={YELLOW}
                                            componentCenter={
                                                <Typo
                                                    text={
                                                        isSignupCampaignPeriod &&
                                                        !route.params.isSignUpCampaignNonMaeAccount
                                                            ? EXPLORE_MAE_BUTTON_TEXT
                                                            : isForceS2uReady && isETBCustomer
                                                            ? ACTIVATES2U
                                                            : DONE
                                                    }
                                                    fontSize={14}
                                                    fontWeight="600"
                                                    lineHeight={18}
                                                />
                                            }
                                        />
                                        {!soleProp && (
                                            <TouchableOpacity
                                                onPress={handleRefer}
                                                activeOpacity={0.8}
                                            >
                                                <Typo
                                                    color={ROYAL_BLUE}
                                                    fontSize={14}
                                                    fontWeight="600"
                                                    lineHeight={18}
                                                    text={
                                                        isSignupCampaignPeriod &&
                                                        !route.params.isSignUpCampaignNonMaeAccount
                                                            ? SHARE_SIGNUP_CODE_BUTTON_TEXT
                                                            : REFER_FRIENDS_TEXT
                                                    }
                                                    style={styles.shareBtnText}
                                                />
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </FixedActionContainer>
                            </Animatable.View>
                        </View>
                    </View>
                </ScreenLayout>
            </>
        </ScreenContainer>
    );
}

OnboardingSuccess.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
    signUpCode: PropTypes.bool,
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    copy: {
        paddingHorizontal: 36,
    },
    footer: {
        flex: 0.4,
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
    },
    imageBg: {
        height: "100%",
        width: "100%",
    },
    label: {
        paddingVertical: 16,
    },
    meta: {
        alignItems: "center",
        flex: 0.6,
    },
    shareBtnContainerView: {
        alignItems: "center",
        flexDirection: "column",
        width: "100%",
    },
    shareBtnText: {
        marginTop: 24,
    },
});

export default OnboardingSuccess;
