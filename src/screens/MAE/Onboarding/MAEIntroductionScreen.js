import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, StyleSheet, ScrollView, ImageBackground, Image, Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import {
    MAE_GOTOACCOUNT,
    MAE_HUAWEI_SCREEN,
    MAE_ONBOARD_DETAILS,
    MAE_ONBOARD_DETAILS4,
    ON_BOARDING_M2U_ACCOUNTS,
} from "@navigation/navigationConstant";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { withModelContext } from "@context";

import { invokeL3, bankingGetDataMayaM2u } from "@services";
import { GAOnboarding } from "@services/analytics/analyticsSTPMae";

import { WHITE, YELLOW } from "@constants/colors";
import { MAE_ACCOUNT_INTRO_SCREEN_DESC, MAE_ACCOUNT_TEXT } from "@constants/premierStrings";
import { MAE_TITLE, NEXT_SMALL_CAPS } from "@constants/strings";
import { MAE_CUST_INQ_ETB_V1, MAE_CUST_INQ_ETB_V2 } from "@constants/url";

import { isPureHuawei } from "@utils/checkHMSAvailability";
import * as DataModel from "@utils/dataModel";

import Assets from "@assets";

import * as MAEOnboardController from "./MAEOnboardController";

const descriptionList = MAE_ACCOUNT_INTRO_SCREEN_DESC;
class MAEIntroductionScreen extends Component {
    static propTypes = {
        getModel: PropTypes.func,
        navigation: PropTypes.object,
        route: PropTypes.object,
        updateModel: PropTypes.func,
    };

    componentDidMount() {
        GAOnboarding.onMAEInroduction();
    }

    onBackTap = () => {
        this.props.navigation.pop();
    };

    moveToNext = async () => {
        console.log("[MAEIntroductionScreen] >> [moveToNext]");
        const { updateModel, getModel } = this.props;
        const { isOnboard } = getModel("user");
        const { isZoloz } = getModel("misc");
        const { entryScreen, entryStack, entryParams } = this.props.route.params;
        if (isPureHuawei && !isZoloz && !isOnboard && entryScreen !== ON_BOARDING_M2U_ACCOUNTS) {
            this.props.navigation.navigate(MAE_HUAWEI_SCREEN, {
                for: "HAM", //Huawei Apply MAE
            });
        } else {
            const result = await DataModel.checkServerOperationTime("accountCreation");
            if (result.statusCode !== "0000") {
                showErrorToast({ message: result.statusDesc });
                return;
            }
            updateModel({
                mae: {
                    trinityFlag: result.trinityFlag || "N",
                },
            });
            if (isOnboard || entryScreen === ON_BOARDING_M2U_ACCOUNTS) {
                // Scenario - ETB with M2u linked
                //Navigate to password screens
                const httpResp = await invokeL3(true);
                const result = httpResp.data;
                const { code } = result;
                if (code !== 0) return;

                const path = `/summary?type=A`;
                const accResponse = await bankingGetDataMayaM2u(path, false);
                if (accResponse && accResponse.data && accResponse.data.code === 0) {
                    const { accountListings } = accResponse.data.result;

                    if (accountListings && accountListings.length) {
                        const mae = accountListings.find(
                            (account) =>
                                (account.group === "0YD" || account.group === "CCD") &&
                                account.type === "D"
                        );

                        if (mae) {
                            const filledUserDetails = {
                                entryScreen,
                                entryParams,
                                entryStack,
                            };
                            this.props.navigation.navigate(MAE_GOTOACCOUNT, {
                                filledUserDetails,
                            });
                            return;
                        }
                    }
                }
                const { trinityFlag } = this.props.getModel("mae");
                const inqPath = trinityFlag === "Y" ? MAE_CUST_INQ_ETB_V2 : MAE_CUST_INQ_ETB_V1;
                const response = await MAEOnboardController.maeETBCustEnq(inqPath);
                if (response.message) {
                    showErrorToast({
                        message: response.message,
                    });
                } else {
                    if (response.statusCode === "0000") {
                        const { onBoardDetails, onBoardDetails2, onBoardDetails3 } =
                            await MAEOnboardController.ETBFilledUserDetails(response, "ETBMAE");
                        const filledUserDetails = {
                            entryScreen,
                            entryParams,
                            entryStack,
                            onBoardDetails,
                            onBoardDetails2,
                            onBoardDetails3,
                        };
                        this.props.navigation.navigate(MAE_ONBOARD_DETAILS4, {
                            filledUserDetails,
                        }); //MAE_ONBOARD_DETAILS//MAE_TERMS_COND
                    } else {
                        showErrorToast({
                            message: response.statusDesc,
                        });
                    }
                }
            } else {
                this.props.navigation.navigate(MAE_ONBOARD_DETAILS, {
                    entryScreen,
                    entryStack,
                    entryParams,
                }); //MAE_ONBOARD_DETAILS//MAE_TERMS_COND
            }
        }
    };
    buildDescription = () => {
        return descriptionList.map((text, index) => {
            return (
                <View style={styles.descText} key={`descText-${index}`}>
                    <Image source={Assets.rightTick} style={styles.tick} />
                    <Typo
                        fontSize={14}
                        fontWeight="400"
                        lineHeight={18}
                        textAlign="left"
                        text={text}
                        style={styles.rightTickText}
                    />
                </View>
            );
        });
    };

    render() {
        return (
            <ScreenContainer backgroundType="color">
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={this.onBackTap} />}
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
                            <View style={styles.introScreen} testID="onboarding_pm1_intro">
                                <View style={styles.image}>
                                    <ImageBackground
                                        source={Assets.maeIntroApplication}
                                        style={styles.imageBg}
                                    />
                                </View>
                                <View style={styles.description}>
                                    <View style={styles.accountType}>
                                        <Typo
                                            fontSize={16}
                                            fontWeight="400"
                                            lineHeight={24}
                                            textAlign="left"
                                            text={MAE_TITLE}
                                        />
                                    </View>
                                    <View style={styles.subtext}>
                                        <Typo
                                            fontSize={17}
                                            fontWeight="700"
                                            lineHeight={28}
                                            textAlign="left"
                                            text={MAE_ACCOUNT_TEXT}
                                        />
                                    </View>

                                    <View style={styles.descContainer}>
                                        {this.buildDescription()}
                                    </View>
                                </View>
                            </View>
                        </KeyboardAwareScrollView>
                    </ScrollView>
                    <FixedActionContainer>
                        <View style={styles.bottomBtnContCls}>
                            <ActionButton
                                backgroundColor={YELLOW}
                                fullWidth
                                componentCenter={
                                    <Typo
                                        fontSize={14}
                                        lineHeight={18}
                                        fontWeight="600"
                                        text={NEXT_SMALL_CAPS}
                                    />
                                }
                                onPress={this.moveToNext}
                            />
                        </View>
                    </FixedActionContainer>
                </ScreenLayout>
            </ScreenContainer>
        );
    }
}
const styles = StyleSheet.create({
    introScreen: {
        flex: 1,
    },
    accountType: {
        borderRadius: 12,
        color: WHITE,
        marginBottom: 12,
        marginTop: 24,
        paddingRight: 4,
        paddingTop: 4,
        width: 135,
    },
    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },
    descContainer: {
        marginBottom: 58,
    },
    descText: {
        flexDirection: "row",
        marginBottom: 15,
    },
    description: {
        marginLeft: 24,
        marginRight: 38,
    },
    imageBg: {
        height: 210,
        width: "100%",
    },
    subtext: {
        marginBottom: 27,
        marginTop: 8,
    },
    tick: {
        height: 10,
        marginRight: 12.8,
        marginTop: 5,
        width: 14,
    },
});

export default withModelContext(MAEIntroductionScreen);
