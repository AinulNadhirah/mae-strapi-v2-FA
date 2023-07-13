import React, { Component } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import PropTypes from "prop-types";
import LinearGradient from "react-native-linear-gradient";
import Typo from "@components/Text";
import ScreenContainer from "@components/Containers/ScreenContainer";
import ScreenLayout from "@layouts/ScreenLayout";
import { YELLOW, MEDIUM_GREY } from "@constants/colors";
import ActionButton from "@components/Buttons/ActionButton";
import HeaderLayout from "@layouts/HeaderLayout";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import { withModelContext } from "@context";

class MAEGoToAccount extends Component {
    static navigationOptions = ({ navigation: { navigate } }) => ({
        title: "",
        header: null,
    });
    static propTypes = {
        getModel: PropTypes.func,
    };

    constructor(props) {
        super(props);
        this.state = {
            filledUserDetails: props.route?.params?.filledUserDetails,
            desc: "",
            btnText: "",
            isOnboard: false,
        };
    }

    componentDidMount() {
        console.log("[MAEGoToAccount] >> [componentDidMount]");
        const { isOnboard } = this.props.getModel("user");
        let desc = "Looks like you already have a MAE account.";
        let btnText = "Continue";
        if (isOnboard) {
            desc = "Looks like you already have a MAE account.\nGo to account now?";
            btnText = "Go To Account";
        }
        this.setState({
            desc,
            isOnboard,
            btnText,
        });
    }

    onCloseTap = () => {
        console.log("[MAEGoToAccount] >> [onCloseTap]");
        const { filledUserDetails } = this.state;
        this.props.navigation.navigate(filledUserDetails?.entryStack || "More", {
            screen: filledUserDetails?.entryScreen || "Apply",
            params: filledUserDetails?.entryParams,
        });
    };

    onContinueTap = () => {
        console.log("[MAEGoToAccount] >> [onContinueTap]");
        // const {filledUserDetails} = this.state;
        if (this.state.isOnboard) {
            this.props.navigation.navigate("TabNavigator", {
                screen: "Tab",
                params: {
                    screen: "Maybank2u",
                },
            });
        } else {
            this.props.navigation.navigate("Onboarding", {
                screen: "OnboardingM2uUsername",
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
                                    text="Existing MAE User"
                                />
                                <Typo
                                    fontSize={20}
                                    style={styles.description}
                                    lineHeight={30}
                                    fontWeight="300"
                                    letterSpacing={0}
                                    textAlign="left"
                                    text={this.state.desc}
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
                                        text={this.state.btnText}
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

export default withModelContext(MAEGoToAccount);
