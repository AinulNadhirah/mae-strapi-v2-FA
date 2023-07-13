import PropTypes from "prop-types";
import React, { Component } from "react";
import { StyleSheet, Image, View, Text, Modal, TouchableOpacity, ScrollView } from "react-native";
import BackgroundTimer from "react-native-background-timer";
import CountDown from "react-native-countdown-component";

import ScreenLayout from "@layouts/ScreenLayout";

import ScreenContainer from "@components/Containers/ScreenContainer";
import Popup from "@components/Popup";
import Typography from "@components/Text";

import { withModelContext } from "@context";

import { secure2uCheckVerification } from "@services";

import { GREY_DARK, ROYAL_BLUE, TRANSPARENT, WHITE } from "@constants/colors";

import Assets from "@assets";

class PollingS2u extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showS2uInfo: false,
        };
    }

    componentDidMount() {
        console.log("PollingS2u componentDidMount");
        this.startPolling();
    }

    componentWillUnmount() {
        this.stopPolling();
        console.log("PollingS2u componentWillUnmount");
    }

    handleCountdownFinish = () => {
        this.setState({ showS2uInfo: false });
        this.props.onPollCallback({ text: "M408" });
    };

    onInfoBtnPress = () => {
        this.setState({ showS2uInfo: true });
    };

    onPopupClose = () => {
        this.setState({ showS2uInfo: false });
    };

    startPolling = () => {
        BackgroundTimer.runBackgroundTimer(() => {
            this.pollingApi();
        }, 2000);
    };

    stopPolling = () => {
        BackgroundTimer.stopBackgroundTimer();
    };

    pollingApi = () => {
        const tokenNumber = this.props.token;
        //const tokenNumber = "00000070003156050038128243381150";
        const params = { token: tokenNumber ?? "" };

        if (this.props?.txnType) params.txnType = this.props.txnType;
        try {
            console.log("secure2uCheckVerification ==> ", params);
            secure2uCheckVerification("/secure2u/checkPollingVerStatus", params)
                .then((response) => {
                    if (response && response.data) {
                        if (response.data.status === "9999") {
                            return;
                        }
                        this.setState({ showS2uInfo: false });
                        this.props.onPollCallback(response.data);
                    }
                })
                .catch((error) => {
                    console.log("ERROR ===> ", error);
                });
        } catch (e) {
            console.log("ERROR ===> ", e);
        }
    };

    S2uTooltipContent = () => (
        <View style={Style.popupDetails}>
            <Typography
                fontSize={16}
                fontWeight="600"
                lineHeight={18}
                text="Didn’t receive your Secure2u notification?"
                textAlign="left"
                style={Style.popupTitle}
            />
            <ScrollView>
                <Typography
                    fontSize={14}
                    fontWeight="normal"
                    lineHeight={20}
                    text="Try these troubleshooting methods:"
                    textAlign="left"
                    style={Style.popupCopy}
                />
                <View style={Style.popupTopLine}>
                    <Typography
                        fontSize={14}
                        fontWeight="normal"
                        lineHeight={20}
                        textAlign="left"
                        text={"1. Did you register your Secure2u on this mobile device? "}
                    />
                </View>
                <View style={[Style.popupTopLine, Style.popupPaddingLeft]}>
                    <Typography fontSize={14} fontWeight="normal" lineHeight={20} textAlign="left">
                        <Typography
                            fontSize={14}
                            fontWeight="600"
                            lineHeight={20}
                            textAlign="left"
                            text={"M2U MY: "}
                        />
                        <Text>
                            {`You can check by tapping on the side menu of your M2U MY app, then 'ME'. You should see the 'toggle on' next to 'SECURE2U' if this is your registered device.`}
                        </Text>
                    </Typography>
                </View>
                <View style={[Style.popupRow, Style.popupPaddingLeft]}>
                    <Typography fontSize={14} fontWeight="normal" lineHeight={20} textAlign="left">
                        <Typography
                            fontSize={14}
                            fontWeight="600"
                            lineHeight={20}
                            textAlign="left"
                            text={"MAE: "}
                        />
                        <Text>
                            {`You can check by tapping on the 'MORE' on the bottom navigation bar of your MAE app, then 'Settings' > 'Maybank2u' > 'Secure2u' (toggle on).`}
                        </Text>
                    </Typography>
                </View>
                <View style={Style.popupTopLine}>
                    <Typography
                        fontSize={14}
                        fontWeight="normal"
                        lineHeight={20}
                        textAlign="left"
                        text={"2. Did you register your Secure2u on another mobile device/app? "}
                    />
                </View>
                <View style={[Style.popupTopLine, Style.popupPaddingLeft]}>
                    <Typography
                        fontSize={14}
                        fontWeight="normal"
                        lineHeight={20}
                        textAlign="left"
                        text={
                            " If so, kindly approve your transaction on your other mobile device/app (M2U MY or MAE). You can find the Secure2u notification in your list of pending approvals. "
                        }
                    />
                </View>
                <View style={Style.popupTopLine}>
                    <Typography
                        fontSize={14}
                        fontWeight="normal"
                        lineHeight={20}
                        textAlign="left"
                        text={"3. Is your mobile device connected to a stable internet or Wi-Fi? "}
                    />
                </View>
                <View style={[Style.popupTopLine, Style.popupPaddingLeft]}>
                    <Typography
                        fontSize={14}
                        fontWeight="normal"
                        lineHeight={20}
                        textAlign="left"
                        style={{ paddingLeft: 5 }}
                        text={
                            " Kindly ensure your mobile device is connected to a stable internet connection for the Secure2u notification to be delivered."
                        }
                    />
                </View>
                <View style={Style.popupTopLine}>
                    <Typography
                        fontSize={14}
                        fontWeight="normal"
                        lineHeight={20}
                        textAlign="left"
                        text={
                            "If these ways still don't work, please re-register for Secure2u with these steps:"
                        }
                    />
                </View>
                <View style={Style.popupTopLine}>
                    <Typography
                        fontSize={14}
                        fontWeight="600"
                        lineHeight={20}
                        textAlign="left"
                        text={"MAE app:"}
                    />
                </View>
                <View style={Style.popupTopLine}>
                    <Typography
                        fontSize={14}
                        fontWeight="normal"
                        lineHeight={20}
                        textAlign="left"
                        text={
                            "Step 1: Deregister for Secure2u from the Settings menu, Select 'Maybank2u' > 'Secure2u' and disable the feature."
                        }
                    />
                </View>
                <View style={Style.popupTopLine}>
                    <Typography
                        fontSize={14}
                        fontWeight="normal"
                        lineHeight={20}
                        textAlign="left"
                        text={
                            "Step 2: Select 'Maybank2u > 'Secure2u', enable the feature and follow the on-screen instructions."
                        }
                    />
                </View>
                <View style={Style.popupTopLine}>
                    <Typography
                        fontSize={14}
                        fontWeight="normal"
                        lineHeight={20}
                        textAlign="left"
                        text={
                            "Step 3: Login and perform your transaction again. You should now get a Secure2u notification on your registered mobile device to approve your transaction."
                        }
                    />
                </View>
                <View style={Style.popupTopLine}>
                    <Typography
                        fontSize={14}
                        fontWeight="600"
                        lineHeight={20}
                        textAlign="left"
                        text={"M2U MY app:"}
                    />
                </View>
                <View style={Style.popupTopLine}>
                    <Typography
                        fontSize={14}
                        fontWeight="normal"
                        lineHeight={20}
                        textAlign="left"
                        text={
                            "Step 1: Tap on the side menu > 'ME' > 'SECURE2U' to deregister your Secure2u."
                        }
                    />
                </View>
                <View style={Style.popupTopLine}>
                    <Typography
                        fontSize={14}
                        fontWeight="normal"
                        lineHeight={20}
                        textAlign="left"
                        text={
                            "Step 2: Tap on 'SECURE2U' again and follow the steps to re- register for Secure2u."
                        }
                    />
                </View>
                <View style={Style.popupTopLine}>
                    <Typography
                        fontSize={14}
                        fontWeight="normal"
                        lineHeight={20}
                        textAlign="left"
                        text={
                            "Step 3: Login and perform your transaction again. You should now get a Secure2u notification on your registered mobile device to approve your transaction."
                        }
                    />
                </View>
            </ScrollView>
        </View>
    );

    render() {
        // const { status, serverError, detailsArray } = this.state;
        const { currentDevice } = this.props;
        return (
            <Modal visible animated animationType="slide" hardwareAccelerated transparent>
                <ScreenContainer backgroundType="color" backgroundColor={GREY_DARK}>
                    <ScreenLayout
                        header={<View />}
                        paddingHorizontal={36}
                        paddingBottom={0}
                        paddingTop={0}
                        useSafeArea
                    >
                        <React.Fragment>
                            <View style={Style.emptyStateTxtContainer}>
                                <View style={Style.topIcon}>
                                    <Image
                                        source={Assets.s2uPolling}
                                        resizeMode="contain"
                                        style={Style.topIconImage}
                                    />
                                </View>
                                <View style={Style.emptyStateTitle}>
                                    <Typography
                                        text="Device Name"
                                        fontSize={14}
                                        lineHeight={20}
                                        fontWeight="600"
                                        color={WHITE}
                                    />
                                    <Typography
                                        fontSize={20}
                                        fontWeight="normal"
                                        fontStyle="normal"
                                        letterSpacing={0}
                                        lineHeight={28}
                                        textAlign="left"
                                        color={WHITE}
                                    >
                                        <Text
                                            accessible={true}
                                            testID={"txtS2uDeviceName"}
                                            accessibilityLabel={"txtS2uDeviceName"}
                                        >
                                            {currentDevice}
                                        </Text>
                                    </Typography>
                                </View>
                                <Typography
                                    text="Grab your registered device now! We’ve sent a push notification to approve the transaction."
                                    fontSize={14}
                                    color={WHITE}
                                    lineHeight={20}
                                />
                                <View style={Style.countdownContainer}>
                                    <Typography
                                        text="Expires in"
                                        fontSize={16}
                                        lineHeight={18}
                                        fontWeight="600"
                                        textAlign="left"
                                        color={WHITE}
                                    />
                                    <CountDown
                                        until={50}
                                        onFinish={this.handleCountdownFinish}
                                        size={7}
                                        timeToShow={["M", "S"]}
                                        timeLabels={{ m: null, s: null }}
                                        digitStyle={Style.digitStyle}
                                        separatorStyle={Style.separatorStyle}
                                        digitTxtStyle={Style.digitTextStyle}
                                        style={Style.countdown}
                                        showSeparator
                                    />
                                </View>
                            </View>

                            {/* Bottom Button Container */}
                            <View style={Style.btnContainerCls}>
                                <Typography
                                    text="Didn’t receive your notification?"
                                    fontSize={14}
                                    color={WHITE}
                                    style={Style.emptySubStateTitle}
                                    lineHeight={20}
                                />
                                <View>
                                    <TouchableOpacity onPress={this.onInfoBtnPress}>
                                        <Typography
                                            color={ROYAL_BLUE}
                                            fontSize={14}
                                            fontWeight="600"
                                            lineHeight={18}
                                            text="Tap here for more info"
                                            textAlign="center"
                                            style={Style.secure2uText}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </React.Fragment>
                    </ScreenLayout>
                    {this.state.showS2uInfo && (
                        <Popup
                            visible={this.state.showS2uInfo}
                            title=""
                            ContentComponent={this.S2uTooltipContent}
                            //description={`Try these methods:\n\n1. Check if this is the device you registered for Secure2u. If it’s not, please check your registered device for push notification.\n\n2. Ensure that your phone is connected to the internet.\n\nIf both ways still don’t work, please re-register for Secure2u with these steps:\n\nStep 1:\n\nDeregister for Secure2u from the Settings menu. Select 'Maybank2u' > 'Secure2u' and disable the feature.\n\nStep 2:\n\nSelect 'Maybank2u' > 'Secure2u', enable the feature and follow the on-screen instruction.\n\n`}
                            onClose={this.onPopupClose}
                        />
                    )}
                </ScreenContainer>
            </Modal>
        );
    }
}

PollingS2u.propTypes = {
    currentDevice: PropTypes.any,
    getModel: PropTypes.func,
    onPollCallback: PropTypes.func,
    token: PropTypes.string,
    extraParams: PropTypes.object,
};

const Style = StyleSheet.create({
    btnContainerCls: {
        alignContent: "center",
        bottom: 0,
        flex: 0.25,
        justifyContent: "center",
        left: 0,
        right: 0,
    },
    countdown: {
        fontFamily: "montserrat",
        paddingHorizontal: 4,
    },
    countdownContainer: {
        flexDirection: "row",
        marginTop: 40,
    },
    digitStyle: {
        backgroundColor: TRANSPARENT,
        fontFamily: "montserrat",
    },
    digitTextStyle: {
        color: WHITE,
        fontFamily: "montserrat",
        fontSize: 16,
        fontWeight: "600",
        lineHeight: 18,
        textAlign: "center",
        width: 26,
    },
    emptyStateTitle: {
        alignItems: "center",
        marginBottom: 20,
        marginTop: 25,
    },
    emptyStateTxtContainer: {
        alignItems: "center",
        flex: 1,
        flexDirection: "column",
        justifyContent: "center",
        marginTop: 24,
    },
    emptySubStateTitle: {
        marginBottom: 20,
    },
    popupCopy: {
        marginBottom: 16,
    },
    popupDetails: {
        maxHeight: 580,
        paddingHorizontal: 24,
        paddingVertical: 40,
    },
    popupPaddingLeft: {
        paddingLeft: 20,
    },
    popupRow: { flexDirection: "row", marginBottom: 16 },
    popupTitle: {
        marginBottom: 24,
    },
    popupTopLine: { flexDirection: "row", flexWrap: "wrap", marginBottom: 16 },
    secure2uText: {
        paddingVertical: 10,
    },
    separatorStyle: {
        backgroundColor: TRANSPARENT,
        color: WHITE,
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 3,
        padding: 0,
    },
    topIcon: {
        alignItems: "center",
        justifyContent: "center",
    },
    topIconImage: {
        height: 64,
        width: 64,
    },
});
export default withModelContext(PollingS2u);
