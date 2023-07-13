import React, { Component } from "react";
import { View, StyleSheet, ScrollView, Image, TouchableOpacity } from "react-native";
import LinearGradient from "react-native-linear-gradient";

import * as navigationConstant from "@navigation/navigationConstant";

import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";

import { withModelContext } from "@context";

import { checkS2WEarnedChances } from "@services";

import { YELLOW, ROYAL_BLUE, MEDIUM_GREY, WHITE } from "@constants/colors";

import * as Utility from "@utils/dataModel/utility";

import Assets from "@assets";

class MAESuccessfulScreen2 extends Component {
    static navigationOptions = ({ navigation: { navigate } }) => ({
        title: "",
        header: null,
    });

    constructor(props) {
        super(props);
        this.state = {
            filledUserDetails: props.route?.params?.filledUserDetails,
            acctNo: props.route?.params?.filledUserDetails?.MAEAccountCreateResult?.acctNo,
        };
    }

    componentDidMount() {
        console.log("[MAESuccessfulScreen2] >> [componentDidMount]");
        // this is only for campaign while using tracker and earned entries / chances for user
        // comment it out first, Year End Campaign using push notifications way to show CampaignChancesEarned.js
        // this.checkForEarnedChances();
    }

    componentWillUnmount() {
        this.timer && clearTimeout(this.timer);
    }

    /**
     * S2W chances earned checkers
     */
    checkForEarnedChances = () => {
        // check if campaign is running and check if it matched the list
        // delayed the check a lil bit to let user see the acknowledge screen

        this.timer && clearTimeout(this.timer);

        this.timer = setTimeout(async () => {
            const {
                misc: { isCampaignPeriod, isTapTasticReady, tapTasticType },
                s2w: { txnTypeList },
            } = this.props.getModel(["misc", "s2w"]);

            if ((isCampaignPeriod || isTapTasticReady) && txnTypeList.includes("MAEONBOARD")) {
                try {
                    const params = {
                        txnType: "MAEONBOARD",
                    };

                    // const response = {
                    //     data: {
                    //         displayPopup: true,
                    //         chance: 1,
                    //     },
                    // };
                    const response = await checkS2WEarnedChances(params);

                    if (response) {
                        const { displayPopup, chance } = response.data;
                        console.log("displayPopup", displayPopup, "chance", chance);

                        if (displayPopup) {
                            // go to earned chances screen
                            this.props.navigation.push("TabNavigator", {
                                screen: "CampaignChancesEarned",
                                params: {
                                    chances: chance,
                                    isTapTasticReady,
                                    tapTasticType,
                                },
                            });
                        }
                    }
                } catch (error) {
                    // can't do nothing
                }
            }
        }, 400);
    };

    onContinueTap = () => {
        console.log("[MAESuccessfulScreen2] >> [onContinueTap]");
        const { filledUserDetails } = this.state;
        if (filledUserDetails?.from === "updateDetails") {
            const entryParams = {
                screen: "Dashboard",
                params: { refresh: true },
            };
            this.props.navigation.navigate(filledUserDetails?.entryStack || "TabNavigator", {
                screen: filledUserDetails?.entryScreen || "Tab",
                params: filledUserDetails?.entryParams || entryParams,
            });
        } else if (filledUserDetails?.entryScreen == "OnboardingM2uAccounts") {
            this.props.navigation.navigate("OnboardingM2uAccounts", {
                from: "MAESuccessScreen2",
            });
        } else if (filledUserDetails?.entryScreen === "Apply") {
            this.props.navigation.navigate(TAB_NAVIGATOR, {
                screen: "Tab",
                params: {
                    screen: "Dashboard",
                    refresh: true,
                },
            });
        } else if (filledUserDetails?.entryScreen === "OnboardingStart") {
            this.props.navigation.navigate("Onboarding", {
                screen: "OnboardingM2uCreatePin",
                params: {
                    username: filledUserDetails?.usernameDetails?.username,
                    pw: filledUserDetails?.usernameDetails?.password,
                    isMaeOnboarding: true,
                    authData: filledUserDetails?.authData,
                    from: "MAESuccessScreen2",
                },
            });
        } else {
            this.props.navigation.navigate("Onboarding", {
                screen: "OnboardingM2uCreatePin",
                params: {
                    username: filledUserDetails?.usernameDetails?.username,
                    pw: filledUserDetails?.usernameDetails?.password,
                    isMaeOnboarding: true,
                    authData: filledUserDetails?.authData,
                },
            });
        }
    };

    share = () => {
        console.log("Go to share page");
        const { filledUserDetails } = this.state;
        this.props.navigation.navigate(navigationConstant.INVITE_CODE, {
            inviteCode: filledUserDetails?.MAEAccountCreateResult?.inviteCode,
        });
    };

    render() {
        return (
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                <View style={styles.viewContainer}>
                    <ScreenLayout
                        paddingBottom={0}
                        paddingTop={0}
                        paddingHorizontal={0}
                        useSafeArea
                    >
                        <ScrollView>
                            <View style={styles.fieldContainer}>
                                <Image source={Assets.maeIcon} style={styles.maeIcon} />
                                <Typo
                                    fontSize={23}
                                    lineHeight={33}
                                    fontWeight="300"
                                    style={{ marginTop: 20 }}
                                    text="Your application is complete! Finish setting up your profile to start enjoying MAE to the fullest."
                                />
                                <Typo
                                    fontSize={13}
                                    lineHeight={23}
                                    fontWeight="600"
                                    style={{ marginTop: 24 }}
                                    text="Your MAE Account Number"
                                />
                                <Typo
                                    fontSize={23}
                                    lineHeight={33}
                                    fontWeight="300"
                                    text={Utility.accountNumSeparator(this.state.acctNo)}
                                />
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
                                backgroundColor={YELLOW}
                                componentCenter={
                                    <Typo
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={18}
                                        text="Continue"
                                    />
                                }
                            />
                            {/* <TouchableOpacity
                                onPress={this.share}
                                activeOpacity={0.8}
                                style={{ marginTop: 24 }}
                            >
                                <Typo
                                    color={ROYAL_BLUE}
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={18}
                                    text={"Share Invite Code"}
                                />
                            </TouchableOpacity> */}
                        </View>
                    </ScreenLayout>
                </View>
            </ScreenContainer>
        );
    }
}

const styles = StyleSheet.create({
    fieldContainer: {
        marginHorizontal: 36,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 70,
    },
    viewContainer: {
        flex: 1,
    },
    maeIcon: {
        width: 90,
        height: 90,
        borderWidth: 2,
        borderColor: WHITE,
        borderRadius: 45,
    },
    bottomBtnContCls: {
        paddingHorizontal: 24,
        paddingVertical: 25,
        height: 130,
    },
    linearGradient: {
        height: 30,
        left: 0,
        right: 0,
        top: -30,
        position: "absolute",
    },
});

export default withModelContext(MAESuccessfulScreen2);
