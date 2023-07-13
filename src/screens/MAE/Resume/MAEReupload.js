import React, { Component } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import * as navigationConstant from "@navigation/navigationConstant";
import Typo from "@components/Text";
import LinearGradient from "react-native-linear-gradient";
import ScreenContainer from "@components/Containers/ScreenContainer";
import ScreenLayout from "@layouts/ScreenLayout";
import { YELLOW, FADE_TEXT_GREY, MEDIUM_GREY } from "@constants/colors";
import ActionButton from "@components/Buttons/ActionButton";
// import HeaderLayout from "@layouts/HeaderLayout";
// import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import { withModelContext } from "@context";

class MAEReupload extends Component {
    static navigationOptions = ({ navigation: { navigate } }) => ({
        title: "",
        header: null,
    });

    constructor(props) {
        super(props);
        this.state = {
            filledUserDetails: props.route?.params?.filledUserDetails || {},
        };
    }

    componentDidMount() {
        console.log("[MAEReupload] >> [componentDidMount]");
        //Data formation for eKYC Capture Document
        if (this.props.route?.params?.ic_number) {
            let filledUserDetails = this.state.filledUserDetails;
            const selectedIDType =
                this.props.route?.params?.resident_country != "Malaysia" ? "Passport" : "MyKad";
            const onBoardDetails2 = {
                from: "MAEReupload",
                idNo: this.props.route?.params?.ic_number,
                passportCountry: this.props.route?.params?.resident_country,
                selectedIDType,
            };
            // const usernameDetails = {
            // 	username: this.props.route?.params?.username,
            // 	password: this.props.route?.params?.pw,
            // };
            // filledUserDetails.usernameDetails = usernameDetails;
            filledUserDetails.onBoardDetails2 = onBoardDetails2;
            filledUserDetails.entryStack = this.props.route?.params?.entryStack;
            filledUserDetails.entryScreen = this.props.route?.params?.entryScreen;
            filledUserDetails.entryParams = this.props.route?.params?.entryParams;
            this.setState({
                filledUserDetails,
            });
        }
    }

    onCloseTap = () => {
        console.log("[MAEReupload] >> [onCloseTap]");
        this.props.navigation.navigate(this.props.route?.params?.entryStack, {
            screen: this.props.route?.params?.entryScreen,
            params: this.props.route?.params?.entryParams,
        });
    };

    onRetake = () => {
        console.log("[MAEReupload] >> [onRetake]");
        const { filledUserDetails } = this.state;
        this.props.navigation.navigate(navigationConstant.CAPTURE_ID_SCREEN, { filledUserDetails });
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
                                    text={"Reupload Documents"}
                                />
                                <Typo
                                    fontSize={20}
                                    lineHeight={30}
                                    fontWeight="300"
                                    textAlign="left"
                                    style={{ marginTop: 8 }}
                                    text={
                                        "We couldn't verify if it's really you. Could you help by reuploading the following items:"
                                    }
                                />
                                <Typo
                                    fontSize={14}
                                    lineHeight={20}
                                    fontWeight="300"
                                    textAlign="left"
                                    style={{ marginTop: 32 }}
                                    text={"1. Photo of your ID (MyKad/Passport)"}
                                />
                                <Typo
                                    fontSize={14}
                                    lineHeight={20}
                                    fontWeight="300"
                                    textAlign="left"
                                    style={{ marginTop: 16 }}
                                    text={"2. Your selfie"}
                                />
                            </View>
                        </ScrollView>
                        {/* Continue Button */}
                        <View style={styles.bottomBtnContCls}>
                            <LinearGradient
                                colors={["#efeff300", MEDIUM_GREY]}
                                style={styles.linearGradient}
                            />
                            <Typo
                                fontSize={12}
                                lineHeight={18}
                                fontWeight="300"
                                textAlign="left"
                                color={FADE_TEXT_GREY}
                                style={{ marginBottom: 21 }}
                                text={
                                    "Tip: Try retaking your photo somewhere with better lighting."
                                }
                            />
                            <ActionButton
                                fullWidth
                                onPress={this.onRetake}
                                backgroundColor={YELLOW}
                                componentCenter={
                                    <Typo
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={18}
                                        text="Retake"
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
        paddingHorizontal: 24,
        paddingVertical: 25,
        height: 150,
    },
    linearGradient: {
        height: 30,
        left: 0,
        right: 0,
        top: -30,
        position: "absolute",
    },
});

export default withModelContext(MAEReupload);
