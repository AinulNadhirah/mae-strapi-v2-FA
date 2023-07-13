import PropTypes from "prop-types";
import React, { Component } from "react";
import { Text, View, Image, StyleSheet } from "react-native";

import { MORE, TAB, TABUNG_TAB, TAB_NAVIGATOR } from "@navigation/navigationConstant";

import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";

import { logEvent } from "@services/analytics";

import { YELLOW, MEDIUM_GREY, WHITE, GREY } from "@constants/colors";
import {
    FA_SCREEN_NAME,
    FA_SELECT_ACTION,
    FA_FORM_COMPLETE,
    FA_FORM_ERROR,
    FA_TABUNG_ACCEPTINVITE_SUCCESSFUL,
    FA_TABUNG_ACCEPTINVITE_FAILED,
    FA_TRANSACTION_ID,
    FA_ACTION_NAME,
    FA_TABUNG_SETUP_BOOSTERS_ACTION,
    FA_TABUNG_GOALS_EXCEEDED,
} from "@constants/strings";

import commonStyle from "@styles/main";

import assets from "@assets";

class Acknowledgment extends Component {
    static propTypes = {
        navigation: PropTypes.shape({
            goBack: PropTypes.func,
            navigate: PropTypes.func,
        }),
        props: PropTypes.object,
        route: PropTypes.shape({
            params: PropTypes.shape({
                inviteData: PropTypes.any,
                isGoalCountError: PropTypes.bool,
            }),
        }),
    };

    state = {
        inviteData: null,
    };

    componentDidMount() {
        this._initData();
    }

    _initData = () => {
        this.setState({ inviteData: this.props.route.params.inviteData }, () =>
            console.log(this.state)
        );

        const { inviteData } = this.props.route.params;

        if (inviteData?.ref) {
            const eventName = inviteData?.success ? FA_FORM_COMPLETE : FA_FORM_ERROR;
            const screenName = inviteData?.success
                ? FA_TABUNG_ACCEPTINVITE_SUCCESSFUL
                : FA_TABUNG_ACCEPTINVITE_FAILED;
            logEvent(eventName, {
                [FA_SCREEN_NAME]: screenName,
                [FA_TRANSACTION_ID]: inviteData?.ref || inviteData?.trxRefNo,
            });
        }
    };

    onProceedPress = () => {
        const { inviteData } = this.state;

        if (inviteData.success) {
            this.props.navigation.navigate(TAB_NAVIGATOR, {
                screen: TAB,
                params: {
                    screen: MORE,
                    params: {
                        screen: TABUNG_TAB,
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

    onSetupBoostersPress = () => {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_TABUNG_ACCEPTINVITE_SUCCESSFUL,
            [FA_ACTION_NAME]: FA_TABUNG_SETUP_BOOSTERS_ACTION,
        });
        this.props.navigation.navigate(MORE, {
            screen: TABUNG_TAB,
            params: {
                index: 1,
            },
        });
    };

    render() {
        const { inviteData } = this.state;
        let analyticsScreenName = inviteData?.success
            ? FA_TABUNG_ACCEPTINVITE_SUCCESSFUL
            : FA_TABUNG_ACCEPTINVITE_FAILED;
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
                        paddingHorizontal={36}
                        // header={
                        //     <HeaderLayout
                        //         // headerLeftElement={
                        //         //     <HeaderBackButton onPress={this.onBackPressHandler} />
                        //         // }
                        //         headerRightElement={
                        //             <HeaderCloseButton onPress={this._onClosePress} />
                        //         }
                        //     />
                        // }
                        useSafeArea
                        // neverForceInset={["bottom"]}
                    >
                        {inviteData && (
                            <>
                                {inviteData.success === true
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
                                <View style={(styles.block, { marginTop: 15 })}>
                                    <View style={styles.titleContainer}>
                                        <Text style={[styles.titleText, commonStyle.font]}>
                                            {inviteData.message}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.block}>
                                    {inviteData.ref.length > 1
? (
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
                                                    text={inviteData.ref}
                                                />
                                            </View>
                                        </View>
                                    )
: (
                                        <View style={styles.blockContainer} />
                                    )}
                                    {inviteData.created.length > 1
? (
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
                                                    text={inviteData.created}
                                                />
                                            </View>
                                        </View>
                                    )
: (
                                        <View style={styles.blockContainer} />
                                    )}
                                </View>

                                <View style={styles.footerContainer}>
                                    {inviteData.success && (
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
                                                    text={inviteData.success ? "Done" : "Go back"}
                                                />
                                            }
                                            onPress={this.onProceedPress}
                                        />
                                    </View>
                                </View>
                            </>
                        )}
                    </ScreenLayout>
                </ScreenContainer>
            </React.Fragment>
        );
    }
}

const styles = StyleSheet.create({
    block: { flexDirection: "column", marginTop: 30 },
    blockContainer: {
        flexDirection: "row",
        justifyContent: "flex-start",
        marginTop: 10,
    },
    blockLeftContainer: { alignItems: "flex-start", flex: 4 },
    blockRightContainer: {
        alignItems: "flex-end",
        flex: 6,
    },
    circleImageView: {
        alignContent: "center",
        alignItems: "center",
        backgroundColor: "transparent",
        borderColor: "transparent",
        borderRadius: 32,
        borderWidth: 1,
        flexDirection: "row",
        height: 64,
        justifyContent: "center",
        overflow: "hidden",
        width: 64,
    },
    footerBtnContainer: { flex: 1, marginTop: 16, width: "100%" },
    footerContainer: {
        alignItems: "center",
        bottom: 20,
        justifyContent: "center",
        left: 0,
        marginHorizontal: 36,
        marginTop: 10,
        position: "absolute",
        right: 0,
    },
    newTransferCircle: {
        height: "100%",
        width: "100%",
    },

    newTransferViewInner1: {
        flexDirection: "column",
        marginTop: 100,
    },
    titleContainer: {
        justifyContent: "flex-start",
        marginTop: 10,
    },
    titleText: {
        color: "#000000",
        fontFamily: "Montserrat",
        fontSize: 20,
        fontStyle: "normal",
        fontWeight: "300",
        letterSpacing: 0,
        lineHeight: 30,
    },
});

export default Acknowledgment;
