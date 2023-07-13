import { rtpActionApi } from "@/services";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, StyleSheet } from "react-native";
import DeviceInfo from "react-native-device-info";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Popup from "@components/Popup";
import Typography from "@components/Text";
import { showErrorToast, showSuccessToast } from "@components/Toast";

import { withModelContext } from "@context";

import { MEDIUM_GREY, YELLOW, GREY, WHITE } from "@constants/colors";
import * as Strings from "@constants/strings";

import { maskIdValue, getDeviceRSAInformation } from "@utils/dataModel/utility";

class DuitnowDetailsRTP extends Component {
    static propTypes = {
        getModel: PropTypes.func,
        navigation: PropTypes.object,
        route: PropTypes.object,
    };

    constructor(props) {
        super(props);
        this.state = {
            proxyDetails: props.route.params?.proxyDetails ?? {},
            isPopupDisplay: false,
            popupTitle: Strings.UNBLOCK_PROXY_ID,
            popupDesc: Strings.ARE_YOU_SURE_YOU_LIKE_ALLOW,
        };
    }

    componentDidMount() {
        this.setState({
            proxyDetails: this.props.route.params?.proxyDetails ?? {},
        });
    }

    handleBack = () => {
        this.props.navigation.goBack();
    };

    unBlockProxyAction = () => {
        this.setState({
            isPopupDisplay: true,
        });
    };

    handleClose = () => {
        this.setState({ isPopupDisplay: false });
    };

    handleConfirmPress = () => {
        this.setState({ isPopupDisplay: false });
        this.callRtpActionApi();
    };

    handleCancelPress = () => {
        this.setState({ isPopupDisplay: false });
    };

    callRtpActionApi = async () => {
        const { proxyDetails } = this.state;
        const deviceInfo = this.props.getModel("device");
        const mobileSDKData = getDeviceRSAInformation(deviceInfo.deviceInformation, DeviceInfo);
        try {
            const params = {
                ...proxyDetails,
                requestType: "UNBLOCK",
                transactionType: "UNBLOCK",
                mobileSDKData,
            };
            const response = await rtpActionApi(params);
            if (response?.data?.code === 200) {
                const message = "Unblock Success";
                showSuccessToast({ message });
            } else {
                showErrorToast({ message: response?.data?.result?.statusDescription });
            }
        } catch (err) {
            if (err?.message) {
                showErrorToast({ message: err?.message });
            }
        } finally {
            this.props.navigation.goBack();
        }
    };

    render() {
        const { proxyDetails, isPopupDisplay, popupTitle, popupDesc } = this.state;
        return (
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                <ScreenLayout
                    paddingBottom={0}
                    paddingTop={0}
                    paddingHorizontal={0}
                    header={
                        <HeaderLayout
                            backgroundColor={YELLOW}
                            headerCenterElement={
                                <Typography
                                    text={Strings.DUITNOW}
                                    fontWeight="600"
                                    fontSize={16}
                                    lineHeight={19}
                                />
                            }
                            headerLeftElement={<HeaderBackButton onPress={this.handleBack} />}
                        />
                    }
                    useSafeArea
                >
                    <View style={styles.container}>
                        <View style={styles.accountView}>
                            <Typography
                                text={Strings.NAME}
                                fontWeight="normal"
                                fontSize={14}
                                lineHeight={19}
                                textAlign="left"
                                style={styles.bankText}
                            />
                            <View style={styles.displayView}>
                                <Typography
                                    text={proxyDetails.receiverName}
                                    fontWeight="600"
                                    fontSize={14}
                                    lineHeight={18}
                                    textAlign="left"
                                    style={styles.accountnumberText}
                                />
                            </View>
                        </View>

                        <View style={styles.accountView}>
                            <Typography
                                text={Strings.PROXY_ID}
                                fontWeight="normal"
                                fontSize={14}
                                lineHeight={19}
                                textAlign="left"
                                style={styles.bankText}
                            />
                            <View style={styles.displayView}>
                                <Typography
                                    text={maskIdValue(proxyDetails?.receiverProxyValue ?? "")}
                                    fontWeight="600"
                                    fontSize={14}
                                    lineHeight={18}
                                    textAlign="left"
                                    style={styles.accountnumberText}
                                />
                            </View>
                        </View>
                    </View>

                    <FixedActionContainer>
                        <View style={styles.containerButton}>
                            <ActionButton
                                fullWidth
                                backgroundColor={YELLOW}
                                borderWidth={0}
                                componentCenter={
                                    <Typography
                                        fontSize={14}
                                        fontWeight="600"
                                        fontStyle="normal"
                                        letterSpacing={0}
                                        lineHeight={18}
                                        text={Strings.UNBLOCK}
                                    />
                                }
                                onPress={this.unBlockProxyAction}
                            />
                        </View>
                    </FixedActionContainer>
                </ScreenLayout>
                <Popup
                    visible={isPopupDisplay}
                    title={popupTitle}
                    description={popupDesc}
                    onClose={this.handleClose}
                    primaryAction={{
                        text: "Confirm",
                        onPress: this.handleConfirmPress,
                    }}
                    secondaryAction={{
                        text: "Cancel",
                        onPress: this.handleCancelPress,
                    }}
                />
            </ScreenContainer>
        );
    }
}

const styles = StyleSheet.create({
    accountView: {
        backgroundColor: WHITE,
        borderTopColor: GREY,
        borderTopWidth: 1,
        height: 90,
    },
    accountnumberText: {
        marginLeft: 24,
        width: "56%",
    },
    bankText: {
        marginLeft: 24,
        marginTop: 17,
    },
    container: {
        flex: 1,
    },
    containerButton: {
        width: "100%",
    },
    displayView: {
        alignItems: "center",
        flexDirection: "row",
        height: 20,
        marginTop: 5,
    },
});

export default withModelContext(DuitnowDetailsRTP);
