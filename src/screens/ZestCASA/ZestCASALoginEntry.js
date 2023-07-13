import React, { useEffect } from "react";
import { StyleSheet, View, ScrollView, Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useDispatch, useSelector } from "react-redux";

import {
    ON_BOARDING_M2U_USERNAME,
    ON_BOARDING_MODULE,
    ZEST_CASA_ACTIVATION_PENDING,
    ZEST_CASA_SUITABILITY_ASSESSMENT,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";

import { DOWNTIME_CLEAR } from "@redux/actions/services/downTimeAction";
import { MASTERDATA_CLEAR } from "@redux/actions/services/masterDataAction";

import {
    ACCOUNT_ACTIVATION,
    CONTINUE,
    LOGIN_WITH_M2U_CONTINUE,
    M2U_PREMIER_SIGN_UP,
    ZEST_SIGN_UP,
} from "@constants/strings";
import {
    CHECK_08_SCREEN,
    ZEST_CASA_CLEAR_ALL,
    ZEST_DRAFT_USER,
    ZEST_FULL_ETB_USER,
    ZEST_M2U_ONLY_USER,
} from "@constants/zestCasaConfiguration";

import { entryPropTypes } from "./ZestCASAEntry";

const ZestCASALoginEntry = (props) => {
    const { navigation, route } = props;

    // Hooks to access reducer data
    const entryReducer = useSelector((state) => state.zestCasaReducer.entryReducer);
    const prePostQualReducer = useSelector((state) => state.prePostQualReducer);
    const userStatus = prePostQualReducer.userStatus;

    // Hooks to dispatch reducer action
    const dispatch = useDispatch();

    const { isZest } = entryReducer;

    useEffect(() => {
        init();
    }, []);

    const init = async () => {
        console.log("[ZestCASALoginEntry] >> [init]");
    };

    function onBackTap() {
        console.log("[ZestCASALoginEntry] >> [onBackTap]");
        navigation.goBack();
    }

    function onCloseTap() {
        // Clear all data from ZestCASA reducers
        dispatch({ type: ZEST_CASA_CLEAR_ALL });
        dispatch({ type: DOWNTIME_CLEAR });
        dispatch({ type: MASTERDATA_CLEAR });
        navigation.popToTop();
        navigation.goBack();
    }

    function onNextTap() {
        const needToCheck08 = route?.params?.needToCheck08;
        var userStatusSend;

        if (userStatus === ZEST_DRAFT_USER) {
            if (needToCheck08) {
                userStatusSend = CHECK_08_SCREEN;
            } else {
                userStatusSend = ZEST_CASA_ACTIVATION_PENDING;
            }
        } else {
            // if (shouldShowSuitabilityAssessmentForETBCustomer(isZest, saDailyIndicator)) {
            userStatusSend = ZEST_CASA_SUITABILITY_ASSESSMENT;
            // } else {
            //     userStatusSend = ZEST_CASA_RESIDENTIAL_DETAILS;
            // }
        }

        var userTypeSend;

        if (userStatus === ZEST_DRAFT_USER) {
            userTypeSend = ZEST_DRAFT_USER;
        } else if (userStatus === ZEST_M2U_ONLY_USER) {
            userTypeSend = ZEST_M2U_ONLY_USER;
        } else {
            userTypeSend = null;
        }
        console.log("[ZestCASALoginEntry] >> [onNextTap]");
        navigation.navigate(ON_BOARDING_MODULE, {
            screen: ON_BOARDING_M2U_USERNAME,
            params: {
                filledUserDetails: {
                    userTypeSend: userTypeSend,
                    isZest: isZest,
                },
                screenName: userStatusSend,
            },
        });
    }

    const screenHeader = () => {
        if (userStatus === ZEST_M2U_ONLY_USER || userStatus === ZEST_FULL_ETB_USER) {
            return isZest ? ZEST_SIGN_UP : M2U_PREMIER_SIGN_UP;
        } else if (ZEST_DRAFT_USER) {
            return ACCOUNT_ACTIVATION;
        }
    };

    return (
        <React.Fragment>
            <ScreenContainer backgroundType="color" analyticScreenName="Zest_CASA_Login_Entry">
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                            headerRightElement={<HeaderCloseButton onPress={onCloseTap} />}
                        />
                    }
                    paddingHorizontal={0}
                    paddingBottom={0}
                    paddingTop={0}
                    useSafeArea
                >
                    <React.Fragment>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <KeyboardAwareScrollView
                                behavior={Platform.OS === "ios" ? "padding" : ""}
                                enabled
                            >
                                <View style={Style.formContainer}>
                                    <View style={Style.contentContainer}>
                                        <Typo
                                            fontSize={14}
                                            lineHeight={23}
                                            fontWeight="600"
                                            letterSpacing={0}
                                            textAlign="left"
                                            text={screenHeader()}
                                        />
                                        <Typo
                                            fontSize={20}
                                            lineHeight={30}
                                            fontWeight="300"
                                            letterSpacing={0}
                                            textAlign="left"
                                            text={LOGIN_WITH_M2U_CONTINUE}
                                        />
                                        <SpaceFiller height={4} />
                                    </View>
                                </View>
                            </KeyboardAwareScrollView>
                        </ScrollView>

                        <FixedActionContainer>
                            <View style={Style.bottomBtnContCls}>
                                <ActionButton
                                    fullWidth
                                    componentCenter={
                                        <Typo
                                            fontSize={14}
                                            lineHeight={18}
                                            fontWeight="600"
                                            text={CONTINUE}
                                        />
                                    }
                                    onPress={onNextTap}
                                />
                            </View>
                        </FixedActionContainer>
                    </React.Fragment>
                </ScreenLayout>
            </ScreenContainer>
        </React.Fragment>
    );
};

export const loginEntryPropTypes = (ZestCASALoginEntry.propTypes = {
    ...entryPropTypes,
});

const Style = StyleSheet.create({
    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },

    contentContainer: {
        marginHorizontal: 24,
    },

    formContainer: {
        marginBottom: 40,
    },
});

export default ZestCASALoginEntry;
