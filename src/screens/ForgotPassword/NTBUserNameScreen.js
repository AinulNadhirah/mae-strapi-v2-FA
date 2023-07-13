import React, { Component } from "react";
import { View, StyleSheet, TouchableOpacity, Image } from "react-native";
import PropTypes from "prop-types";
import ScreenContainer from "@components/Containers/ScreenContainer";
import ScreenLayout from "@layouts/ScreenLayout";
import HeaderLayout from "@layouts/HeaderLayout";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import Typo from "@components/Text";
import { MEDIUM_GREY, YELLOW, ROYAL_BLUE, WHITE, SHADOW } from "@constants/colors";
import * as Strings from "@constants/strings";
import { SET_PASSWORD } from "@navigation/navigationConstant";
import { withModelContext } from "@context";
import ActionButton from "@components/Buttons/ActionButton";

const Avatar = ({ imageUrl }) => (
    <View style={styles.avatarContainer}>
        <View style={styles.avatarInner}>
            <Image source={{ uri: imageUrl }} resizeMode="stretch" style={styles.avatar} />
        </View>
    </View>
);

Avatar.propTypes = {
    imageUrl: PropTypes.string,
};

class NTBUserNameScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            refNo: props.route?.params?.refData?.refNo,
            userName: props.route?.params?.refData?.userName,
            secureImage: props.route?.params?.refData?.authObj?.url,
            caption: props.route?.params?.refData?.authObj?.caption,
            from: props.route?.params?.refData?.from,
        };
    }
    onPressHeaderCloseButton = () => {
        console.log("[NTBUserNameScreen] >> [onPressHeaderCloseButton]");
        this.props.navigation.goBack();
    };

    onPressLoginNow = () => {
        console.log("[NTBUserNameScreen] >> [onPressLoginNow]");
        this.props.navigation.navigate("OnboardingM2uUsername");
    };

    onPressResetPassword = () => {
        console.log("[NTBUserNameScreen] >> [onPressResetPassword]");
        this.props.navigation.navigate(SET_PASSWORD, {
            refData: {
                refNo: this.state.refNo,
                from: this.state.from,
                userName: this.state.userName,
                secureImage: this.state.secureImage,
                caption: this.state.caption,
                otpCode: this.props.route?.params?.refData?.otpCode,
            },
        });
    };

    render() {
        const { userName, secureImage } = this.state;
        return (
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                <ScreenLayout
                    paddingBottom={0}
                    paddingTop={0}
                    paddingHorizontal={0}
                    header={
                        <HeaderLayout
                            headerRightElement={
                                <HeaderCloseButton onPress={this.onPressHeaderCloseButton} />
                            }
                        />
                    }
                    useSafeArea
                >
                    <>
                        <View style={styles.container}>
                            <View style={styles.meta}>
                                <Avatar imageUrl={secureImage} />
                                <Typo
                                    fontSize={20}
                                    fontWeight="300"
                                    lineHeight={28}
                                    style={styles.label}
                                    text={Strings.RESET_PASSWORD_NTB_USERNAME}
                                />
                                <Typo
                                    fontSize={20}
                                    fontWeight="600"
                                    lineHeight={32}
                                    text={userName}
                                />
                            </View>
                        </View>

                        {/* Reset Pwd Button */}
                        <View style={styles.footerContainer}>
                            <ActionButton
                                height={48}
                                fullWidth
                                borderRadius={24}
                                componentCenter={
                                    <Typo
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={18}
                                        text="Reset Password"
                                    />
                                }
                                onPress={this.onPressResetPassword}
                                backgroundColor={YELLOW}
                            />
                            <TouchableOpacity onPress={this.onPressLoginNow} activeOpacity={0.8}>
                                <Typo
                                    color={ROYAL_BLUE}
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={18}
                                    text="Login Now"
                                    textAlign="left"
                                    style={styles.changeNumber}
                                />
                            </TouchableOpacity>
                        </View>
                    </>
                </ScreenLayout>
            </ScreenContainer>
        );
    }
}

NTBUserNameScreen.propTypes = {
    navigation: PropTypes.shape({
        goBack: PropTypes.func,
        navigate: PropTypes.func,
    }),
    route: PropTypes.shape({
        params: PropTypes.shape({
            refData: PropTypes.shape({
                authObj: PropTypes.shape({
                    caption: PropTypes.any,
                    url: PropTypes.any,
                }),
                from: PropTypes.any,
                otpCode: PropTypes.any,
                refNo: PropTypes.any,
                userName: PropTypes.any,
            }),
        }),
    }),
};

const styles = StyleSheet.create({
    avatar: {
        borderRadius: 40,
        height: 78,
        width: 78,
    },
    avatarContainer: {
        alignItems: "center",
        backgroundColor: WHITE,
        borderRadius: 40,
        elevation: 12,
        height: 80,
        justifyContent: "center",
        shadowColor: SHADOW,
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 1,
        shadowRadius: 15,
        width: 80,
    },
    avatarInner: {
        alignItems: "center",
        backgroundColor: WHITE,
        borderRadius: 40,
        height: "100%",
        justifyContent: "center",
        overflow: "hidden",
        padding: 2,
        width: "100%",
    },
    changeNumber: {
        paddingVertical: 24,
    },
    container: {
        flex: 1,
        paddingHorizontal: 36,
        paddingTop: 18,
    },
    footerContainer: {
        alignItems: "center",
        bottom: 20,
        justifyContent: "center",
        left: 0,
        marginHorizontal: 36,
        marginTop: 10,
        position: "absolute",
        right: 0,
    },
    label: {
        paddingVertical: 8,
    },
    meta: {
        alignItems: "center",
    },
});

export default withModelContext(NTBUserNameScreen);
