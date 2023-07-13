import React, { Component } from "react";
import { View, StyleSheet, ScrollView, Image, TouchableOpacity } from "react-native";
import LinearGradient from "react-native-linear-gradient";

import { INVITE_CODE, BANKINGV2_MODULE, GATEWAY_SCREEN } from "@navigation/navigationConstant";

import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";

import { withModelContext } from "@context";

import { checkS2WEarnedChances } from "@services";

import { YELLOW, ROYAL_BLUE, MEDIUM_GREY, WHITE, GREY } from "@constants/colors";

import * as Utility from "@utils/dataModel/utility";

import Assets from "@assets";

class MAESuccessfulScreen extends Component {
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
        console.log("[MAESuccessfulScreen] >> [componentDidMount]");
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
        console.log("[MAESuccessfulScreen] >> [onContinueTap]");
        this.props.navigation.navigate("TabNavigator", {
            screen: "Tab",
            params: {
                screen: "Maybank2u",
            },
        });
    };

    onMAECardTap = () => {
        this.props.navigation.navigate(BANKINGV2_MODULE, {
            screen: GATEWAY_SCREEN,
            params: {
                action: "APPLY_MAE_CARD",
                entryPoint: "MAE_ONBOARD",
            },
        });
    };

    share = () => {
        console.log("Go to share page");
        const { filledUserDetails } = this.state;
        this.props.navigation.navigate(INVITE_CODE, {
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
                                    text={`You're all set!\n Go to your Wallet now to start using MAE.`}
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
                                height={48}
                                fullWidth
                                borderRadius={24}
                                backgroundColor={WHITE}
                                borderWidth={1}
                                borderColor={GREY}
                                componentCenter={
                                    <Typo
                                        fontSize={14}
                                        fontWeight="600"
                                        fontStyle="normal"
                                        letterSpacing={0}
                                        lineHeight={18}
                                        text="Get a MAE Card"
                                    />
                                }
                                onPress={this.onMAECardTap}
                            />
                            <ActionButton
                                fullWidth
                                onPress={this.onContinueTap}
                                backgroundColor={YELLOW}
                                style={styles.MAECardBtn}
                                componentCenter={
                                    <Typo
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={18}
                                        text="Done" //Go to Account
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
    },
    linearGradient: {
        height: 30,
        left: 0,
        right: 0,
        top: -30,
        position: "absolute",
    },
    MAECardBtn: {
        marginTop: 16,
    },
});

export default withModelContext(MAESuccessfulScreen);
