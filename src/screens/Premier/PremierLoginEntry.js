import React from "react";
import { StyleSheet, View, ScrollView, Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useDispatch, useSelector } from "react-redux";

import {
    ON_BOARDING_M2U_USERNAME,
    ON_BOARDING_MODULE,
    PREMIER_ACTIVATION_PENDING,
    PREMIER_SUITABILITY_ASSESSMENT,
    PREMIER_RESIDENTIAL_DETAILS
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

import {
    CHECK_08_SCREEN,
    PREMIER_CLEAR_ALL,
    PMA_DRAFT_USER,
    PMA_FULL_ETB_USER,
    PMA_M2U_ONLY_USER
} from "@constants/premierConfiguration";
import { isDraftUser, isM2UOnlyUser } from "@screens/Premier/helpers/premierHelpers";
import {
    ACCOUNT_ACTIVATION,
    CONTINUE,
    LOGIN_WITH_M2U_CONTINUE,
    PM1_SIGN_UP
} from "@constants/strings";

import { entryPropTypes } from "./PM1IntroScreen";

const PremierLoginEntry = (props) => {
    const { navigation, route } = props;

    // Hooks to access reducer data
    const prePostQualReducer = useSelector((state) => state.prePostQualReducer);
    const userStatus = prePostQualReducer.userStatus;

    // Hooks to dispatch reducer action
    const dispatch = useDispatch();

    function onBackTap () {
        console.log("[PremierLoginEntry] >> [onBackTap]");
        navigation.goBack();
    }

    function onCloseTap () {
        // Clear all data from ZestCASA reducers
        dispatch({ type: PREMIER_CLEAR_ALL });
        navigation.popToTop();
        navigation.goBack();
    }

    function onNextTap () {
        const needToCheck08 = route?.params?.needToCheck08;
        let userStatusSend;

        if (isDraftUser(userStatus) && userStatus !== PMA_DRAFT_USER) {
            if (needToCheck08) {
                userStatusSend = CHECK_08_SCREEN;
            } else {
                userStatusSend = PREMIER_ACTIVATION_PENDING;
            }
        } else if (userStatus === PMA_DRAFT_USER) {
            userStatusSend = PREMIER_SUITABILITY_ASSESSMENT;
        } else {
            userStatusSend = PREMIER_RESIDENTIAL_DETAILS;
        }

        let userTypeSend;

        if (isDraftUser(userStatus)) {
            userTypeSend = userStatus;
        } else if (isM2UOnlyUser(userStatus)) {
            userTypeSend = userStatus;
        } else {
            userTypeSend = null;
        }
        console.log("[PremierLoginEntry] >> [onNextTap]");
        navigation.navigate(ON_BOARDING_MODULE, {
            screen: ON_BOARDING_M2U_USERNAME,
            params: {
                filledUserDetails: {
                    userTypeSend,
                },
                screenName: userStatusSend,
            },
        });
    }

    const screenHeader = () => {
        if (userStatus === PMA_M2U_ONLY_USER || userStatus === PMA_FULL_ETB_USER) {
            return PM1_SIGN_UP;
        } else if (PMA_DRAFT_USER) {
            return ACCOUNT_ACTIVATION;
        }
    };

    return (
            <ScreenContainer backgroundType="color">
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
                </ScreenLayout>
            </ScreenContainer>
    );
};

export const loginEntryPropTypes = (PremierLoginEntry.propTypes = {
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

export default PremierLoginEntry;
