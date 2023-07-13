import React, { Component } from "react";
import { View, StyleSheet, ScrollView, Image, Dimensions } from "react-native";
import * as navigationConstant from "@navigation/navigationConstant";
import Typo from "@components/Text";
import LinearGradient from "react-native-linear-gradient";
import ScreenContainer from "@components/Containers/ScreenContainer";
import ScreenLayout from "@layouts/ScreenLayout";
import { YELLOW, MEDIUM_GREY } from "@constants/colors";
import ActionButton from "@components/Buttons/ActionButton";
import { withModelContext } from "@context";
import Assets from "@assets";

const screenHeight = Dimensions.get("window").height;

class MAEResumeSuccess extends Component {
    static navigationOptions = ({ navigation: { navigate } }) => ({
        title: "",
        header: null,
    });

    constructor(props) {
        super(props);
        this.state = {
            filledUserDetails: props.route?.params?.filledUserDetails,
        };
    }

    componentDidMount() {
        console.log("[MAEResumeSuccess] >> [componentDidMount]");
    }

    onDoneTap = () => {
        console.log("[MAEResumeSuccess] >> [onDoneTap]");
        const { filledUserDetails } = this.state;
        const entryParams = {
            screen: "Dashboard",
            params: { refresh: true },
        };
        this.props.navigation.navigate(filledUserDetails?.entryStack || "TabNavigator", {
            screen: filledUserDetails?.entryScreen || "Tab",
            params: filledUserDetails?.entryParams || entryParams,
        });
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
                    >
                        <ScrollView>
                            <View style={styles.fieldContainer}>
                                <View style={styles.statusPgImgBlockCls}>
                                    <Image
                                        resizeMode="contain"
                                        style={{ width: 57, height: 52 }}
                                        source={Assets.icTickNew}
                                    />
                                </View>
                                <Typo
                                    fontSize={20}
                                    lineHeight={28}
                                    fontWeight="300"
                                    style={{ marginTop: 24 }}
                                    textAlign="left"
                                    text="All done! Thank you for your submission."
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
                                onPress={this.onDoneTap}
                                backgroundColor={YELLOW}
                                componentCenter={
                                    <Typo
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={18}
                                        text="Done"
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
        alignItems: "center",
        justifyContent: "center",
    },
    viewContainer: {
        flex: 1,
    },
    statusPgImgBlockCls: {
        width: "100%",
        marginTop: (screenHeight * 20) / 100,
        marginLeft: 15,
    },
    bottomBtnContCls: {
        paddingHorizontal: 24,
        paddingVertical: 25,
        height: 130,
    },
    linearGradient: {
        height: 30,
        left: 0,
        right: 0,
        top: -30,
        position: "absolute",
    },
});

export default withModelContext(MAEResumeSuccess);
