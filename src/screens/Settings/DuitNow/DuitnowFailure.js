import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, StyleSheet, TouchableOpacity, Image } from "react-native";

import { DUITNOW_DETAILS, DUITNOW_DASHBOARD } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Typo from "@components/Text";

import { GASettingsScreen } from "@services/analytics/analyticsSettings";

import { MEDIUM_GREY, YELLOW, FADE_GREY } from "@constants/colors";
import { DUITNOW_FAILURE, SELECT_ACCOUNT } from "@constants/strings";

import { getDateFormated } from "@utils/dataModel";

import Assets from "@assets";

class DuitnowFailure extends Component {
    static propTypes = {
        getModel: PropTypes.func,
        route: PropTypes.shape({
            params: PropTypes.shape({
                type: PropTypes.any,
            }),
        }),
    };

    constructor(props) {
        super(props);
        const params = props?.route?.params;
        this.state = {
            todayDate: getDateFormated(new Date()),
            errorText: params?.errorobj?.esbErrorValue,
            type: params?.type,
        };
    }

    componentDidMount() {
        if (this.state.type === SELECT_ACCOUNT) {
            GASettingsScreen.onFailDuitNowRegister();
        } else {
            GASettingsScreen.onFailsDuitNowSwitch();
        }
    }

    handleClose = () => {
        console.log("[DuitnowFailure] >> [handleClose]");
        this.props.navigation.navigate("Settings");
    };

    handleConfirmPress = () => {
        console.log("[DuitnowFailure] >> [handleConfirmPress]");
        if (this.props.route?.params?.proxyData?.isregisteredProxy) {
            this.props.navigation.navigate(DUITNOW_DETAILS, {
                auth: "Failure",
                proxyDetails: this.props.route?.params?.proxyData,
            });
            return;
        }
        this.props.navigation.navigate(DUITNOW_DASHBOARD);
    };

    render() {
        const { todayDate, errorText } = this.state;
        return (
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                <ScreenLayout
                    paddingBottom={0}
                    paddingTop={0}
                    paddingHorizontal={0}
                    useSafeArea
                    header={
                        <HeaderLayout
                            headerRightElement={<HeaderCloseButton onPress={this.handleClose} />}
                        />
                    }
                >
                    <View style={styles.container}>
                        <Image style={styles.failureImage} source={Assets.icFailedIcon} />
                        <Typo
                            fontSize={20}
                            fontWeight="300"
                            lineHeight={30}
                            text={DUITNOW_FAILURE}
                            textAlign="left"
                            style={styles.linkAccountText}
                        />
                        {/* Server Error */}
                        <Typo
                            fontSize={12}
                            lineHeight={18}
                            textAlign="left"
                            fontWeight="normal"
                            fontStyle="normal"
                            color={FADE_GREY}
                            ellipsizeMode="tail"
                            numberOfLines={3}
                            text={errorText}
                            style={styles.errorText}
                        />
                        <View style={styles.viewRow}>
                            <View style={styles.viewRowLeftItem}>
                                <Typo
                                    fontSize={12}
                                    fontWeight="normal"
                                    fontStyle="normal"
                                    letterSpacing={0}
                                    lineHeight={18}
                                    textAlign="left"
                                    text="Date"
                                />
                            </View>

                            <View style={styles.viewRowRightItem}>
                                <Typo
                                    fontSize={12}
                                    fontWeight="600"
                                    fontStyle="normal"
                                    letterSpacing={0}
                                    lineHeight={18}
                                    textAlign="right"
                                    text={todayDate}
                                />
                            </View>
                        </View>
                    </View>
                    <FixedActionContainer>
                        <ActionButton
                            fullWidth
                            borderRadius={25}
                            onPress={this.handleConfirmPress}
                            backgroundColor={YELLOW}
                            componentCenter={
                                <Typo
                                    text={"Try Again"}
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={18}
                                />
                            }
                        />
                    </FixedActionContainer>
                </ScreenLayout>
            </ScreenContainer>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginHorizontal: 36,
    },
    errorText: {
        marginTop: 10,
    },
    failureImage: {
        height: 64,
        marginTop: 40,
        width: 64,
    },
    linkAccountText: {
        marginTop: 20,
    },
    viewRow: {
        alignContent: "flex-start",
        alignItems: "flex-start",
        flexDirection: "row",
        justifyContent: "space-between",
        marginLeft: 0,
        marginTop: 50,
        width: "100%",
    },
    viewRowLeftItem: {
        alignContent: "flex-start",
        alignItems: "flex-start",
        flexDirection: "row",
        justifyContent: "flex-start",
        marginLeft: 0,
        marginTop: 0,
    },
    viewRowRightItem: {
        alignContent: "flex-end",
        alignItems: "flex-end",
        flexDirection: "column",
        justifyContent: "space-between",
        marginLeft: 5,
        marginTop: 0,
        paddingLeft: 5,
    },
});

export default DuitnowFailure;
