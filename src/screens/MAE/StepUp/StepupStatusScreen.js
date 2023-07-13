import PropTypes from "prop-types";
import React, { Component } from "react";
import { Dimensions, StyleSheet, Image, View, ScrollView } from "react-native";

import * as navigationConstant from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";

import { withModelContext } from "@context";

import { YELLOW, FADE_GREY, MEDIUM_GREY } from "@constants/colors";
import * as Strings from "@constants/strings";

import Assets from "@assets";

const screenHeight = Dimensions.get("window").height;

class StepupStatusScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            status: props.route.params?.status ?? Strings.FAIL_STATUS, // success | failure
            headerText: props.route.params?.headerText,
            detailsArray: props.route.params?.detailsArray ?? false, // Each object must contain key & value
            serverError: props.route.params?.serverError ?? false,
        };
    }

    /* EVENT HANDLERS */

    onDoneButtonPress = () => {
        console.log("[StepupStatusScreen] >> [onDoneButtonPress]");
        const {
            getModel,
            route,
            navigation: { navigate },
        } = this.props;
        const { placementEntryPointModule, placementEntryPointScreen } = getModel("fixedDeposit");
        if (route?.params?.routeFrom === "AccountDetails")
            navigate(navigationConstant.BANKINGV2_MODULE, {
                screen: navigationConstant.ACCOUNT_DETAILS_SCREEN,
            });
        else if (placementEntryPointModule && placementEntryPointScreen)
            navigate(placementEntryPointModule, {
                screen: placementEntryPointScreen,
            });
        else
            navigate("TabNavigator", {
                screen: "Tab",
                params: {
                    screen: "Maybank2u",
                    params: {
                        index: 1,
                    },
                },
            });
    };

    /* UI */

    render() {
        const { headerText, serverError, detailsArray } = this.state;
        return (
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                <ScreenLayout
                    header={
                        <HeaderLayout
                            horizontalPaddingMode={"custom"}
                            horizontalPaddingCustomLeftValue={16}
                            horizontalPaddingCustomRightValue={16}
                        />
                    }
                    paddingHorizontal={36}
                    paddingBottom={0}
                    paddingTop={0}
                    useSafeArea
                >
                    <React.Fragment>
                        <ScrollView style={{ flex: 1 }}>
                            {/* Image Block */}
                            <View style={styles.statusPgImgBlockCls}>
                                <Image
                                    resizeMode="contain"
                                    style={{ width: 57, height: 52 }}
                                    source={
                                        this.state.status === "failure"
                                            ? Assets.icFailedIcon
                                            : Assets.icTickNew
                                    }
                                />
                            </View>

                            {/* Desc */}
                            <Typo
                                fontSize={20}
                                fontWeight="300"
                                fontStyle="normal"
                                letterSpacing={0}
                                lineHeight={28}
                                textAlign="left"
                                text={headerText}
                                style={{ marginBottom: 5 }}
                            />

                            {/* Server Error */}
                            <Typo
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
                                <View style={{ marginTop: 30 }}>
                                    {detailsArray.map((prop, key) => {
                                        return (
                                            <View style={styles.detailsBlockCls} key={key}>
                                                <Typo
                                                    fontSize={12}
                                                    fontWeight="normal"
                                                    fontStyle="normal"
                                                    letterSpacing={0}
                                                    lineHeight={18}
                                                    text={prop.key}
                                                />

                                                <Typo
                                                    fontSize={12}
                                                    fontWeight="600"
                                                    fontStyle="normal"
                                                    letterSpacing={0}
                                                    lineHeight={18}
                                                    text={prop.value}
                                                />
                                            </View>
                                        );
                                    })}
                                </View>
                            )}
                        </ScrollView>

                        {/* Bottom Button Container */}
                        <View style={styles.btnContainerCls}>
                            <ActionButton
                                height={48}
                                fullWidth
                                borderRadius={24}
                                backgroundColor={YELLOW}
                                componentCenter={
                                    <Typo
                                        fontSize={14}
                                        fontWeight="600"
                                        fontStyle="normal"
                                        letterSpacing={0}
                                        lineHeight={18}
                                        text={Strings.DONE}
                                    />
                                }
                                onPress={this.onDoneButtonPress}
                            />
                        </View>
                    </React.Fragment>
                </ScreenLayout>
            </ScreenContainer>
        );
    }
}

StepupStatusScreen.propTypes = {
    getModel: PropTypes.func,
    route: PropTypes.shape({
        params: PropTypes.shape({
            detailsArray: PropTypes.bool,
            headerText: PropTypes.any,
            routeFrom: PropTypes.string,
            serverError: PropTypes.bool,
            status: PropTypes.any,
        }),
    }),
    navigation: PropTypes.object,
};

const styles = StyleSheet.create({
    btnContainerCls: {
        bottom: 0,
        left: 0,
        paddingBottom: 25,
        paddingTop: 25,
        right: 0,
    },
    detailsBlockCls: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10,
        marginTop: 10,
        width: "100%",
    },
    statusPgImgBlockCls: {
        marginBottom: 25,
        marginTop: (screenHeight * 10) / 100,
        width: "100%",
    },
});

export default withModelContext(StepupStatusScreen);
