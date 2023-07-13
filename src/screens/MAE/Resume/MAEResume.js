import React, { Component } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import PropTypes from "prop-types";
import LinearGradient from "react-native-linear-gradient";
import * as navigationConstant from "@navigation/navigationConstant";
import Typo from "@components/Text";
import ScreenContainer from "@components/Containers/ScreenContainer";
import ScreenLayout from "@layouts/ScreenLayout";
import { YELLOW, MEDIUM_GREY } from "@constants/colors";
import ActionButton from "@components/Buttons/ActionButton";
import HeaderLayout from "@layouts/HeaderLayout";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import { withModelContext } from "@context";

class MAEResume extends Component {
    static propTypes = {
        getModel: PropTypes.func,
        updateModel: PropTypes.func,
    };
    static navigationOptions = ({ navigation: { navigate } }) => ({
        title: "",
        header: null,
    });
    constructor(props) {
        super(props);
        this.state = {
            filledUserDetails: props.route.params?.filledUserDetails,
            screenName: props.route.params?.screenName,
        };
    }

    componentDidMount() {
        console.log("[MAEResume] >> [componentDidMount]");
    }

    onBackTap = () => {
        console.log("[MAEResume] >> [onBackTap]");
        this.props.navigation.goBack();
    };

    onCloseTap = () => {
        console.log("[MAEResume] >> [onCloseTap]");
        const { filledUserDetails } = this.state;
        this.props.navigation.navigate(filledUserDetails?.entryStack || "More", {
            screen: filledUserDetails?.entryScreen || "Apply",
            params: filledUserDetails?.entryParams,
        });
    };

    onContinueTap = () => {
        console.log("[MAEResume] >> [onContinueTap]");
        const { filledUserDetails } = this.state;
        if (filledUserDetails.onBoardDetails2.from == "ResumeMAE") {
            this.props.navigation.navigate(navigationConstant.MAE_OTP_REQUEST, {
                filledUserDetails,
            });
        } else if (filledUserDetails.onBoardDetails2.from == "ResumeM2U") {
            // const { updateModel } = this.props;
            // updateModel({
            // 	mae: {
            // 		isMAEOnboarding:true
            // 	},
            // });
            this.props.navigation.navigate("Onboarding", {
                screen: "OnboardingM2uUsername",
                params: {
                    isMaeOnboarding: true,
                    skipSecurityImage: this.state.screenName == "UploadSecurityImage",
                    screenName: this.state.screenName,
                    filledUserDetails,
                },
            });
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
                        header={
                            <HeaderLayout
                                headerLeftElement={<HeaderBackButton onPress={this.onBackTap} />}
                                headerRightElement={<HeaderCloseButton onPress={this.onCloseTap} />}
                            />
                        }
                    >
                        <ScrollView>
                            <View style={styles.fieldContainer}>
                                <Typo
                                    fontSize={14}
                                    lineHeight={23}
                                    fontWeight="600"
                                    letterSpacing={0}
                                    textAlign="left"
                                    text={"Registration in Progress"}
                                />
                                <Typo
                                    fontSize={20}
                                    style={styles.description}
                                    lineHeight={30}
                                    fontWeight="300"
                                    letterSpacing={0}
                                    textAlign="left"
                                    text={
                                        "Looks like you’re already halfway done with your registration! Would you like to complete it now?"
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
                                onPress={this.onContinueTap}
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
        marginHorizontal: 36,
    },
    viewContainer: {
        flex: 1,
    },
    description: {
        marginTop: 12,
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

export default withModelContext(MAEResume);
