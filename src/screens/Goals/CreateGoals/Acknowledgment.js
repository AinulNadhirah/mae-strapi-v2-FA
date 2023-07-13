import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, Image, StyleSheet } from "react-native";

import * as navigationConstant from "@navigation/navigationConstant";
import NavigationService from "@navigation/navigationService";

import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
// import HeaderLayout from "@layouts/HeaderLayout";
import Typo from "@components/Text";

import { withModelContext } from "@context";

import { checkS2WEarnedChances } from "@services";
import { logEvent } from "@services/analytics";

import { YELLOW, MEDIUM_GREY, WHITE, GREY, FADE_GREY, TRANSPARENT } from "@constants/colors";
import {
    FA_SELECT_ACTION,
    FA_SCREEN_NAME,
    FA_ACTION_NAME,
    FA_TABUNG_CREATETABUNG_SUCCESSFUL,
    FA_TABUNG_SETUP_BOOSTERS_ACTION,
    FA_FORM_COMPLETE,
    FA_FORM_ERROR,
    FA_TABUNG_CREATE_TABUNG_FAILED,
    FA_TRANSACTION_ID,
    FA_TABUNG_GOALS_EXCEEDED,
} from "@constants/strings";

import assets from "@assets";

class Acknowledgment extends Component {
    static propTypes = {
        getModel: PropTypes.func,
        navigation: PropTypes.shape({
            goBack: PropTypes.func,
            navigate: PropTypes.func,
            push: PropTypes.func,
        }),
        resetModel: PropTypes.func,
        route: PropTypes.shape({
            params: PropTypes.shape({
                routeFrom: PropTypes.string,
                routeTo: PropTypes.string,
                isGoalCountError: PropTypes.bool,
            }),
        }),
        updateModel: PropTypes.func,
    };

    state = {
        routeFrom: "",
        routeTo: "",
    };

    componentDidMount() {
        this.prep();

        this._initData();
        // this is only for campaign while using tracker and earned entries / chances for user
        // comment it out first, Year End Campaign using push notifications way to show CampaignChancesEarned.js
        // this.checkForEarnedChances();
    }

    componentWillUnmount() {
        this.timer && clearTimeout(this.timer);
    }

    prep = () => {
        const { route } = this.props;

        this.setState({
            routeFrom: route.params?.routeFrom ?? "",
            routeTo: route.params?.routeTo ?? "",
        });
    };

    _initData = () => {
        const { getModel } = this.props;
        const { goalData } = getModel("goals");

        this.setState({ goalData });
        if (goalData?.ref) {
            const screenName = goalData?.success ? FA_FORM_COMPLETE : FA_FORM_ERROR;
            logEvent(screenName, {
                [FA_SCREEN_NAME]: goalData?.success
                    ? FA_TABUNG_CREATETABUNG_SUCCESSFUL
                    : FA_TABUNG_CREATE_TABUNG_FAILED,
                [FA_TRANSACTION_ID]: goalData?.ref,
            });
        }
    };

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

            const { goalData } = this.state;

            if (
                (isCampaignPeriod || isTapTasticReady) &&
                txnTypeList.includes("M2UGOAL") &&
                goalData.success
            ) {
                try {
                    const params = {
                        txnType: "M2UGOAL",
                    };

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

    onClosePressHandler = () => {
        NavigationService.navigateToModule(navigationConstant.TAB_NAVIGATOR);
    };

    onProceedPress = () => {
        const { goalData } = this.state;
        // const { resetModel } = this.props;

        if (goalData.success) {
            //Reset data model
            // resetModel(["goals"]);

            this.props.navigation.navigate("TabNavigator", {
                screen: "Tab",
                params: {
                    screen: "Dashboard",
                    params: {
                        screen: "TabungTab",
                        params: {
                            refresh: true,
                        },
                    },
                },
            });
        } else {
            this.props.navigation.goBack();
        }
    };

    onGoBack = () => {
        this.props.navigation.goBack();
    };

    onDone = () => {
        this.props.navigation.navigate("TabNavigator", {
            screen: "Tab",
            params: {
                screen: "Dashboard",
                params: {
                    screen: "TabungTab",
                    params: {
                        refresh: true,
                    },
                },
            },
        });
    };

    onSetupBoostersPress = () => {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_TABUNG_CREATETABUNG_SUCCESSFUL,
            [FA_ACTION_NAME]: FA_TABUNG_SETUP_BOOSTERS_ACTION,
        });

        this.props.navigation.navigate("Dashboard", {
            screen: "TabungTab",
            params: {
                index: 1,
            },
        });
    };

    render() {
        const { goalData } = this.props.getModel("goals");
        let analyticsScreenName = goalData?.success
            ? FA_TABUNG_CREATETABUNG_SUCCESSFUL
            : FA_TABUNG_CREATE_TABUNG_FAILED;
        if (this.props?.route?.params?.isGoalCountError) {
            analyticsScreenName = FA_TABUNG_GOALS_EXCEEDED;
        }
        return (
            <React.Fragment>
                <ScreenContainer
                    backgroundType="color"
                    backgroundColor={MEDIUM_GREY}
                    analyticScreenName={analyticsScreenName}
                >
                    <ScreenLayout
                        paddingBottom={0}
                        paddingTop={0}
                        paddingHorizontal={0}
                        useSafeArea
                        // neverForceInset={["bottom"]}
                    >
                        {goalData && (
                            <>
                                <View style={styles.container}>
                                    {goalData.success === true
? (
                                        <View style={styles.newTransferViewInner1}>
                                            <View style={styles.circleImageView}>
                                                <Image
                                                    style={styles.newTransferCircle}
                                                    source={assets.icTickNew}
                                                    resizeMode="stretch"
                                                    resizeMethod="scale"
                                                />
                                            </View>
                                        </View>
                                    )
: (
                                        <View style={styles.newTransferViewInner1}>
                                            <View style={styles.circleImageView}>
                                                <Image
                                                    style={styles.newTransferCircle}
                                                    source={assets.icFailedIcon}
                                                    resizeMode="stretch"
                                                    resizeMethod="scale"
                                                />
                                            </View>
                                        </View>
                                    )}

                                    <View style={styles.titleContainer}>
                                        <Typo
                                            fontSize={20}
                                            fontWeight="300"
                                            lineHeight={28}
                                            textAlign="left"
                                            text={goalData.message}
                                        />
                                    </View>

                                    {goalData.subMessage &&
                                        goalData.subMessage !== null &&
                                        goalData.subMessage !== "-" && (
                                            <View style={styles.subTitleContainer}>
                                                <Typo
                                                    fontSize={12}
                                                    lineHeight={18}
                                                    textAlign="left"
                                                    color={FADE_GREY}
                                                    text={goalData.subMessage}
                                                />
                                            </View>
                                        )}

                                    <View style={styles.block}>
                                        {goalData.ref.length > 1 && (
                                            <View style={styles.blockContainer}>
                                                <View style={styles.blockLeftContainer}>
                                                    <Typo
                                                        fontSize={12}
                                                        lineHeight={18}
                                                        textAlign="left"
                                                        text="Reference ID"
                                                    />
                                                </View>
                                                <View style={styles.blockRightContainer}>
                                                    <Typo
                                                        fontSize={12}
                                                        fontWeight="600"
                                                        lineHeight={18}
                                                        textAlign="right"
                                                        text={goalData.ref}
                                                    />
                                                </View>
                                            </View>
                                        )}
                                        {goalData.created.length > 1 && (
                                            <View style={styles.blockContainer}>
                                                <View style={styles.blockLeftContainer}>
                                                    <Typo
                                                        fontSize={12}
                                                        lineHeight={18}
                                                        textAlign="left"
                                                        text="Date & time"
                                                    />
                                                </View>
                                                <View style={styles.blockRightContainer}>
                                                    <Typo
                                                        fontSize={12}
                                                        fontWeight="600"
                                                        lineHeight={18}
                                                        textAlign="right"
                                                        text={goalData.created}
                                                    />
                                                </View>
                                            </View>
                                        )}
                                    </View>
                                </View>

                                <FixedActionContainer>
                                    <View style={styles.footerMainContainer}>
                                        {goalData.success && (
                                            <View style={styles.footerBtnContainer}>
                                                <ActionButton
                                                    height={48}
                                                    fullWidth
                                                    backgroundColor={WHITE}
                                                    borderRadius={24}
                                                    borderColor={GREY}
                                                    borderWidth={1}
                                                    borderStyle="solid"
                                                    componentCenter={
                                                        <Typo
                                                            fontSize={14}
                                                            fontWeight="600"
                                                            fontStyle="normal"
                                                            letterSpacing={0}
                                                            lineHeight={18}
                                                            text="Set Up Boosters"
                                                        />
                                                    }
                                                    onPress={this.onSetupBoostersPress}
                                                    // disabled
                                                />
                                            </View>
                                        )}

                                        <View style={styles.footerBtnContainer}>
                                            <ActionButton
                                                height={48}
                                                fullWidth
                                                backgroundColor={YELLOW}
                                                borderRadius={24}
                                                componentCenter={
                                                    <Typo
                                                        fontSize={14}
                                                        fontWeight="600"
                                                        fontStyle="normal"
                                                        letterSpacing={0}
                                                        lineHeight={18}
                                                        text={
                                                            goalData.success ||
                                                            (goalData.subMessage &&
                                                                goalData.subMessage !== null)
                                                                ? "Done"
                                                                : "Go back"
                                                        }
                                                    />
                                                }
                                                onPress={
                                                    goalData.success ||
                                                    (goalData.subMessage &&
                                                        goalData.subMessage !== null)
                                                        ? this.onDone
                                                        : this.onGoBack
                                                }
                                            />
                                        </View>
                                    </View>
                                </FixedActionContainer>
                            </>
                        )}
                    </ScreenLayout>
                </ScreenContainer>
            </React.Fragment>
        );
    }
}

const styles = StyleSheet.create({
    block: { flexDirection: "column", marginTop: 24 },
    blockContainer: {
        flexDirection: "row",
        justifyContent: "flex-start",
        marginTop: 16,
    },
    blockLeftContainer: { alignItems: "flex-start", flex: 4 },
    blockRightContainer: {
        alignItems: "flex-end",
        flex: 6,
    },
    circleImageView: {
        alignContent: "center",
        alignItems: "center",
        backgroundColor: TRANSPARENT,
        borderColor: TRANSPARENT,
        borderRadius: 32,
        borderWidth: 1,
        flexDirection: "row",
        height: 64,
        justifyContent: "center",
        overflow: "hidden",
        width: 64,
    },
    container: { flex: 1, marginHorizontal: 36, marginTop: 126 },
    footerBtnContainer: { marginTop: 16, width: "100%" },
    footerMainContainer: {
        flex: 1,
        height: 128,
        justifyContent: "flex-end",
    },
    newTransferCircle: {
        height: "100%",
        width: "100%",
    },
    newTransferViewInner1: {
        flexDirection: "column",
    },
    subTitleContainer: {
        justifyContent: "flex-start",
        marginTop: 16,
    },
    titleContainer: {
        justifyContent: "flex-start",
        marginTop: 24,
    },
});

export default withModelContext(Acknowledgment);
