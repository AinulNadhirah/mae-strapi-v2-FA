import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, StyleSheet, Keyboard, ScrollView } from "react-native";
import LinearGradient from "react-native-linear-gradient";

import { APPLY_M2U_CREATEM2UID } from "@screens/ZestCASA/helpers/AnalyticsEventConstants";

import * as navigationConstant from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";

import { logEvent } from "@services/analytics";

import { YELLOW, DISABLED, BLACK, DISABLED_TEXT, MEDIUM_GREY } from "@constants/colors";
import { FA_SCREEN_NAME, FA_VIEW_SCREEN, NEW_MAE } from "@constants/strings";
import { ZEST_NTB_USER } from "@constants/zestCasaConfiguration";

import * as DataModel from "@utils/dataModel";

class MAEM2UUsername extends Component {
    constructor(props) {
        super(props);
        this.state = {
            filledUserDetails: props.route.params?.filledUserDetails,
            username: "",
            isValidUserName: "",
            isNextDisabled: true,
        };
        const navigateFrom = props.route.params?.filledUserDetails?.onBoardDetails2?.from;
        if (navigateFrom === ZEST_NTB_USER || navigateFrom === NEW_MAE) {
            logEvent(FA_VIEW_SCREEN, {
                [FA_SCREEN_NAME]: APPLY_M2U_CREATEM2UID,
            });
        }
    }

    onUsernameChange = (params) => {
        console.log("[MAEM2UUsername] >> [onUsernameChange]");

        const key = params["key"];
        const value = params["value"].trimStart();
        this.setState(
            {
                [key]: value,
            },
            () => {
                this.enableDisableBtn();
            }
        );
    };

    enableDisableBtn = () => {
        console.log("[MAEM2UUsername] >> [enableDisableBtn]");
        if (this.state.username) {
            this.setState({
                isNextDisabled: false,
            });
        } else {
            this.setState({
                isNextDisabled: true,
            });
        }
    };

    checkUserName = () => {
        console.log("[MAEM2UUsername] >> [checkUserName]");

        const username = this.state.username;

        let err = "";
        const err1 = "Username must contain at least 6 characters.";
        const err2 = "Please remove invalid special characters.";

        // Min/max length check
        if (username.length < 6 || username.length > 16) {
            err = err1;
        }

        // Special character check
        if (!DataModel.m2uUsernameRegex(username)) {
            err = err2;
        }

        this.setState({ isValidUserName: err });
        // If validation check passes, move to next screen
        return err ? false : true;
    };

    onContinueTap = () => {
        console.log("[MAEM2UUsername] >> [onContinueTap]");
        Keyboard.dismiss();
        if (this.checkUserName()) {
            const filledUserDetails = this.prepareUserDetails();
            this.props.navigation.navigate(navigationConstant.MAE_M2U_PWD, { filledUserDetails });
        }
    };

    prepareUserDetails = () => {
        const usernameDetails = { username: this.state.username };
        let MAEUserDetails = this.state.filledUserDetails || {};
        MAEUserDetails.usernameDetails = usernameDetails;
        console.log("MAEM2UUsername >> prepareUserDetails >> ", MAEUserDetails);
        return MAEUserDetails;
    };

    onCloseTap = () => {
        console.log("[MAEM2UUsername] >> [onCloseTap]");
        const { filledUserDetails } = this.state;
        this.props.navigation.navigate(filledUserDetails?.entryStack || "More", {
            screen: filledUserDetails?.entryScreen || "Apply",
            params: filledUserDetails?.entryParams,
        });
    };

    render() {
        const { username, isValidUserName, isNextDisabled } = this.state;
        return (
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                <View style={styles.viewContainer}>
                    <ScreenLayout
                        paddingBottom={0}
                        paddingTop={0}
                        paddingHorizontal={0}
                        useSafeArea
                        header={
                            <HeaderLayout
                                headerRightElement={<HeaderCloseButton onPress={this.onCloseTap} />}
                            />
                        }
                    >
                        <ScrollView>
                            <View style={styles.fieldContainer}>
                                <Typo
                                    fontSize={14}
                                    lineHeight={18}
                                    fontWeight="600"
                                    letterSpacing={0}
                                    textAlign="left"
                                    text="Create a Maybank2u ID"
                                />
                                <Typo
                                    fontSize={20}
                                    lineHeight={28}
                                    fontWeight="300"
                                    letterSpacing={0}
                                    textAlign="left"
                                    style={styles.description}
                                    text="Let's create a Maybank2u username and password to access your account."
                                />
                                <View style={styles.inputContainer}>
                                    <TextInput
                                        maxLength={16}
                                        isValid={!isValidUserName}
                                        autoCapitalize="none"
                                        isValidate
                                        autoFocus
                                        errorMessage={isValidUserName}
                                        value={username}
                                        placeholder="Enter username"
                                        onChangeText={(value) => {
                                            this.onUsernameChange({ key: "username", value });
                                        }}
                                    />
                                </View>
                            </View>
                        </ScrollView>
                        {/* Continue Button */}
                        <View style={styles.bottomBtnContCls}>
                            <LinearGradient
                                colors={["#efeff300", MEDIUM_GREY]}
                                style={styles.linearGradient}
                            />
                            <ActionButton
                                fullWidth
                                onPress={this.onContinueTap}
                                disabled={isNextDisabled}
                                backgroundColor={isNextDisabled ? DISABLED : YELLOW}
                                componentCenter={
                                    <Typo
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={18}
                                        color={isNextDisabled ? DISABLED_TEXT : BLACK}
                                        text="Continue"
                                    />
                                }
                            />
                        </View>
                    </ScreenLayout>
                </View>
            </ScreenContainer>
        );
    }
}

MAEM2UUsername.propTypes = {
    navigation: PropTypes.shape({
        navigate: PropTypes.func,
    }),
    route: PropTypes.shape({
        params: PropTypes.shape({
            filledUserDetails: PropTypes.any,
        }),
    }),
};

const styles = StyleSheet.create({
    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        paddingHorizontal: 24,
        paddingVertical: 25,
    },
    description: {
        marginTop: 12,
    },
    fieldContainer: {
        marginHorizontal: 36,
    },
    inputContainer: {
        marginTop: 35,
    },
    linearGradient: {
        height: 30,
        left: 0,
        position: "absolute",
        right: 0,
        top: -30,
    },
    viewContainer: {
        flex: 1,
    },
});

export default MAEM2UUsername;
