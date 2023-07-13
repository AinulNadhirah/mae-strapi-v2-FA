import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";

import {
    getApplyPLSTPNavParams,
    resumeFlow,
    getResumeData,
    getCounterOfferData,
    plstpInqCheck,
} from "@screens/PLSTP/PLSTPController";

import {
    BANKINGV2_MODULE,
    PLSTP_COUNTER_OFFER,
    PLSTP_INCOME_DETAILS,
    SETTINGS_MODULE,
} from "@navigation/navigationConstant";

import ModuleIntroductionScreenTemplate from "@components/ScreenTemplates/ModuleIntroductionScreenTemplate";

import { useModelController } from "@context";

import { logEvent } from "@services/analytics";

import { TRANSPARENT } from "@constants/colors";
import {
    PLSTP_INTRO_TITLE,
    PLSTP_INTRO_DESC,
    PLSTP_INTRO_APPLYNOW_BTN,
    PLSTP_INTRO_FOM_BTN,
    FA_SCREEN_NAME,
    FA_VIEW_SCREEN,
    FA_FORM_PROCEED,
    FA_SELECT_ACTION,
    FA_ACTION_NAME,
} from "@constants/strings";
import { FIND_OUT_MORE } from "@constants/url";

import Assets from "@assets";

const PLSTPLandingPage = ({ navigation, route }) => {
    const [initParams, setInitParams] = useState({});
    const [resumeData, setResumeData] = useState({});
    const { getModel, updateModel } = useModelController();
    const {
        user: { fullName, isOnboard },
    } = getModel(["auth", "user"]);
    const { from } = route?.params;

    useEffect(() => {
        init();
    }, [navigation, route]);

    const init = async () => {
        console.log("[PLSTPLandingPage] >> [init]");
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Apply_PersonalLoan",
        });
        setInitParams(getApplyPLSTPNavParams(initParams));
        if (from === "PLSTPLandingPage") {
            const response = await plstpInqCheck();
            if (response?.data?.code === 200) {
                const result = response?.data?.result;
                setResumeData(result);
            }
        }
    };

    function onBackTap() {
        console.log("[PLSTPLandingPage] >>> [onBackTap]");
        navigation.pop();
    }

    async function moveToNext() {
        console.log("[PLSTPLandingPage] >>> [moveToNext]");
        logEvent(FA_FORM_PROCEED, {
            [FA_SCREEN_NAME]: "Apply_PersonalLoan",
        });
        //Check user is logged in
        if (isOnboard) {
            if (resumeData?.stpRefNo) {
                if (resumeData.statusCode === "01") {
                    const response = await getResumeData();
                    if (response?.data?.code === 200) {
                        const result = response?.data?.result || {};
                        resumeFlowRedir(resumeData, result);
                    }
                } else if (resumeData.statusCode === "10") {
                    const response = await getCounterOfferData();
                    if (response?.data?.code === 200) {
                        const finalCarlosResponse = response?.data?.result || {};
                        navigation.navigate(PLSTP_COUNTER_OFFER, {
                            ...route.params,
                            initParams: finalCarlosResponse,
                        });
                    }
                } else {
                    console.log("Upload docs flow");
                }
            } else {
                navigation.navigate(PLSTP_INCOME_DETAILS, {
                    ...route.params,
                    initParams,
                    fullName,
                });
            }
        } else {
            navigation.navigate("Onboarding", {
                screen: "OnboardingM2uUsername",
                params: {
                    screenName: "PLSTPLandingPage",
                },
            });
        }
    }

    async function resumeFlowRedir(plstpResumeResult, resumeData) {
        const { screenName, initData, s2uData } = await resumeFlow(
            plstpResumeResult,
            resumeData,
            getModel,
            updateModel
        );
        navigation.navigate(BANKINGV2_MODULE, {
            screen: screenName,
            params: {
                entryStack: "More",
                entryScreen: "Apply",
                initParams: initData,
                s2uData,
                fullName,
            },
        });
    }

    function findOutMore() {
        console.log("[PLSTPLandingPage] >>> [findOutMore]");
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "Apply_PersonalLoan",
            [FA_ACTION_NAME]: "Find Out More",
        });

        const props = {
            title: PLSTP_INTRO_FOM_BTN,
            source: FIND_OUT_MORE,
            headerColor: TRANSPARENT,
        };

        navigation.navigate(SETTINGS_MODULE, {
            screen: "PdfSetting",
            params: props,
        });
    }

    return (
        <View style={styles.introScreen}>
            <ModuleIntroductionScreenTemplate
                title={PLSTP_INTRO_TITLE}
                summary={PLSTP_INTRO_DESC}
                backgroundImage={Assets.plstpintro}
                hideSkipButton={true}
                enableBackButton={true}
                onNextPressed={moveToNext}
                buttonTitle={PLSTP_INTRO_APPLYNOW_BTN}
                onBackButtonPress={onBackTap}
                hideBackButton={false}
                onSkipPressed={() => {}}
                totalStepper={1}
                stepperCurrentIndex={0}
                showSecondButton={true}
                secondButtonTitle={PLSTP_INTRO_FOM_BTN}
                onSecondButtonPressed={findOutMore}
            />
        </View>
    );
};

PLSTPLandingPage.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

const styles = StyleSheet.create({
    introScreen: {
        flex: 1,
    },
});

export default PLSTPLandingPage;
