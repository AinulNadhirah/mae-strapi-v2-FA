import React, { Component } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import PropTypes from "prop-types";
import * as navigationConstant from "@navigation/navigationConstant";
import Typo from "@components/Text";
import LinearGradient from "react-native-linear-gradient";
import ScreenContainer from "@components/Containers/ScreenContainer";
import ScreenLayout from "@layouts/ScreenLayout";
import { YELLOW, MEDIUM_GREY } from "@constants/colors";
import ActionButton from "@components/Buttons/ActionButton";
import { withModelContext } from "@context";
import { convertMAEMobileFormat } from "@utils/dataModel/utility";

class MAEAddressEntryScreen extends Component {
    static navigationOptions = ({ navigation: { navigate } }) => ({
        title: "",
        header: null,
    });
    static propTypes = {
        getModel: PropTypes.func,
        updateModel: PropTypes.func,
    };
    constructor(props) {
        super(props);
        this.state = {
            filledUserDetails: props.route?.params?.filledUserDetails,
        };
    }

    componentDidMount() {
        console.log("[MAEAddressEntryScreen] >> [componentDidMount]");
    }

    onProceed = () => {
        console.log("[MAEAddressEntryScreen] >> [onProceed]");
        const { filledUserDetails } = this.state;
        if (filledUserDetails?.loginData) {
            const { username } = this.props.getModel("user");
            const usernameDetails = {
                username,
            };
            const mobileNumber =
                filledUserDetails.loginData?.phoneNo || filledUserDetails.loginData?.contact_number;

            filledUserDetails.usernameDetails = usernameDetails;
            filledUserDetails.rsaIndicator = filledUserDetails.loginData?.rsaIndicator;
            filledUserDetails.onBoardDetails = {};
            filledUserDetails.onBoardDetails.mobileNumber = convertMAEMobileFormat(mobileNumber);
            filledUserDetails.onBoardDetails2 = {};
            filledUserDetails.onBoardDetails2.idNo = filledUserDetails.loginData?.ic_number;
            const ekycStatus = filledUserDetails.loginData?.ekyc_status;
            if (ekycStatus === "00" || ekycStatus === "01") {
                this.props.navigation.navigate(navigationConstant.MAE_ONBOARD_DETAILS3, {
                    filledUserDetails,
                });
            } else if (
                filledUserDetails.loginData?.resumeStageInd &&
                filledUserDetails.loginData?.resumeStageInd === "1"
            ) {
                this.props.navigation.navigate(navigationConstant.UPLOAD_SECURITY_IMAGE, {
                    filledUserDetails,
                });
            } else if (
                filledUserDetails.loginData?.rsaIndicator &&
                filledUserDetails.loginData?.rsaIndicator != "2"
            ) {
                this.props.navigation.navigate(navigationConstant.MAE_SECURITY_QUESTIONS, {
                    filledUserDetails,
                });
            } else {
                const entryParams = {
                    screen: "Dashboard",
                    params: { refresh: true },
                };
                this.props.navigation.navigate(filledUserDetails?.entryStack || "TabNavigator", {
                    screen: filledUserDetails?.entryScreen || "Tab",
                    params: filledUserDetails?.entryParams || entryParams,
                });
            }
        }
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
                        // header={
                        // 	<HeaderLayout
                        // 		headerRightElement={<HeaderCloseButton onPress={this.onCloseTap} />}
                        // 	/>
                        // }
                    >
                        <ScrollView>
                            <View style={styles.fieldContainer}>
                                <Typo
                                    fontSize={14}
                                    lineHeight={23}
                                    fontWeight="600"
                                    textAlign="left"
                                    text={"Additional Details Needed"}
                                />
                                <Typo
                                    fontSize={20}
                                    lineHeight={30}
                                    fontWeight="300"
                                    textAlign="left"
                                    style={{ marginTop: 8 }}
                                    text={
                                        "We need you to share just a few more details about yourself before we take you to your account."
                                    }
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
                                onPress={this.onProceed}
                                backgroundColor={YELLOW}
                                componentCenter={
                                    <Typo
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={18}
                                        text="Proceed"
                                    />
                                }
                            />
                        </View>
                    </ScreenLayout>
                </View>
            </ScreenContainer>
        );
    }
}

const styles = StyleSheet.create({
    fieldContainer: {
        marginTop: 60,
        marginHorizontal: 36,
    },
    viewContainer: {
        flex: 1,
    },
    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
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
});

export default withModelContext(MAEAddressEntryScreen);
