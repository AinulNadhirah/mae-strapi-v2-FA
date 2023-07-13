import PropTypes from "prop-types";
import React, { Component } from "react";
import {
    Dimensions,
    StyleSheet,
    Image,
    View,
    ScrollView,
    BackHandler,
    TouchableOpacity,
    Platform,
} from "react-native";
import * as Animate from "react-native-animatable";
import RNExitApp from "react-native-exit-app";
import HTML from "react-native-render-html";

import { TAB_NAVIGATOR } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Typography from "@components/Text";

import { withModelContext } from "@context";

import { YELLOW, FADE_GREY, MEDIUM_GREY, ROYAL_BLUE } from "@constants/colors";
import * as Strings from "@constants/strings";

import Assets from "@assets";

const { height: screenHeight } = Dimensions.get("window");

class PushStatus extends Component {
    constructor(props) {
        super(props);
        this.state = {
            status: props.route.params?.status ?? Strings.FAIL_STATUS, // success | failure
            headerText: props.route.params?.headerText ?? Strings.TRANSACTION_UNSUCCESS,
            detailsArray: props.route.params?.details ?? false, // Each object must contain key & value
            serverError: props.route.params?.serverError ?? "",
            appState: props.route.params?.appState ?? "",
        };
    }

    componentDidMount() {}

    removeNavigatorS2u = () => {
        this.props.updateModel({
            ui: {
                notificationControllerNavigation: null,
            },
        });
    };

    handleQuitApp = () => {
        this.removeNavigatorS2u();
        Platform.OS === "ios" ? RNExitApp.exitApp() : BackHandler.exitApp();
    };

    onDashboardTap = () => {
        this.removeNavigatorS2u();
        this.props.navigation.navigate(TAB_NAVIGATOR, {
            screen: "Tab",
            params: {
                screen: "Dashboard",
                params: { refresh: true },
            },
        });
    };

    render() {
        const { serverError, detailsArray, appState } = this.state;

        return (
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                <ScreenLayout
                    header={<HeaderLayout />}
                    paddingHorizontal={36}
                    paddingBottom={0}
                    paddingTop={0}
                    useSafeArea
                >
                    <React.Fragment>
                        <ScrollView style={Style.scroller}>
                            {/* Image Block */}
                            <View style={Style.statusPgImgBlockCls}>
                                <Image
                                    resizeMode="contain"
                                    style={Style.statusImg}
                                    source={
                                        this.state.status == "failure"
                                            ? Assets.icFailedIcon
                                            : Assets.icTickNew
                                    }
                                />
                            </View>

                            {/* Desc */}
                            <Typography
                                fontSize={20}
                                fontWeight="300"
                                fontStyle="normal"
                                letterSpacing={0}
                                lineHeight={28}
                                textAlign="left"
                                text={this.state.headerText}
                                style={Style.headerText}
                            />

                            {/* Server Error */}
                            <Typography
                                fontSize={12}
                                textAlign="left"
                                fontWeight="normal"
                                fontStyle="normal"
                                color={FADE_GREY}
                                lineHeight={18}
                                text={serverError}
                            />

                            {/* Status Details */}
                            {detailsArray && (
                                <View style={Style.statusDetailsContainer}>
                                    {detailsArray.map((prop, key) => {
                                        return (
                                            <View key={key} style={Style.viewRow}>
                                                <View style={Style.viewRowLeftItem}>
                                                    <Typography
                                                        fontSize={12}
                                                        fontWeight="normal"
                                                        fontStyle="normal"
                                                        letterSpacing={0}
                                                        lineHeight={18}
                                                        textAlign="left"
                                                        text={prop.label}
                                                    />
                                                </View>
                                                <View style={Style.viewRowRightItem}>
                                                    {/*<Typography
                                                        fontSize={12}
                                                        fontWeight="600"
                                                        fontStyle="normal"
                                                        letterSpacing={0}
                                                        lineHeight={18}
                                                        textAlign="right"
                                                        text={prop.value}
                                                    />*/}
                                                    <HTML
                                                        html={`<div style="text-align: right">${prop.value}</div>`}
                                                        tagsStyles={{
                                                            div: {
                                                                textAlign: "right",
                                                            },
                                                        }}
                                                        baseFontStyle={Style.htmlStyle}
                                                    />
                                                </View>
                                            </View>
                                        );
                                    })}
                                </View>
                            )}
                        </ScrollView>

                        {/* Bottom Button Container */}
                        <FixedActionContainer>
                            <Animate.View
                                animation="fadeInUp"
                                delay={700}
                                duration={300}
                                useNativeDriver
                                style={Style.actBtnContainer}
                            >
                                <ActionButton
                                    height={48}
                                    fullWidth
                                    borderRadius={24}
                                    backgroundColor={YELLOW}
                                    componentCenter={
                                        <Typography
                                            fontSize={14}
                                            fontWeight="600"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={18}
                                            text={Strings.DONE}
                                        />
                                    }
                                    onPress={
                                        appState === "killState"
                                            ? this.handleQuitApp
                                            : this.onDashboardTap
                                    }
                                />

                                {appState === "killState" && (
                                    <TouchableOpacity onPress={this.onDashboardTap}>
                                        <Typography
                                            color={ROYAL_BLUE}
                                            fontSize={14}
                                            fontWeight="600"
                                            lineHeight={18}
                                            style={Style.actButton}
                                            text="Go to Dashboard"
                                            textAlign="center"
                                        />
                                    </TouchableOpacity>
                                )}
                            </Animate.View>
                        </FixedActionContainer>
                    </React.Fragment>
                </ScreenLayout>
            </ScreenContainer>
        );
    }
}

PushStatus.propTypes = {
    navigation: PropTypes.shape({
        navigate: PropTypes.func,
    }),
    route: PropTypes.shape({
        params: PropTypes.shape({
            details: PropTypes.bool,
            headerText: PropTypes.any,
            serverError: PropTypes.string,
            status: PropTypes.any,
            appState: PropTypes.string,
        }),
    }),
    updateModel: PropTypes.func,
    getModel: PropTypes.func,
};

const Style = StyleSheet.create({
    headerText: { marginBottom: 5 },
    htmlStyle: {
        fontFamily: "montserrat",
        fontSize: 12,
        fontStyle: "normal",
        fontWeight: "600",
        lineHeight: 18,
        textAlign: "right",
    },
    actButton: {
        paddingVertical: 24,
    },
    scroller: { flex: 1 },
    statusDetailsContainer: { marginTop: 30 },

    statusImg: { height: 52, width: 57 },

    statusPgImgBlockCls: {
        marginBottom: 25,
        marginTop: (screenHeight * 10) / 100,
        width: "100%",
    },
    viewRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 16,
    },
    viewRowLeftItem: {
        flex: 0.5,
    },
    viewRowRightItem: {
        alignContent: "flex-end",
        flex: 1,
        marginLeft: 10,
    },
    actBtnContainer: {
        width: "100%",
        justifyContent: "center",
    },
});

export default withModelContext(PushStatus);
