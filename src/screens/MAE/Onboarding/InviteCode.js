import React, { Component } from "react";
import { Clipboard, ScrollView, View, TouchableOpacity, Image, StyleSheet } from "react-native";
import { BANKINGV2_MODULE, TOPUP_STATUS_SCREEN } from "@navigation/navigationConstant";
import Typo from "@components/Text";
import LinearGradient from "react-native-linear-gradient";
import * as Strings from "@constants/strings";
import Share from "react-native-share";
import ScreenContainer from "@components/Containers/ScreenContainer";
import ScreenLayout from "@layouts/ScreenLayout";
import HeaderLayout from "@layouts/HeaderLayout";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import Assets from "@assets";
import ActionButton from "@components/Buttons/ActionButton";
import { YELLOW, WHITE, MEDIUM_GREY } from "@constants/colors";
import { showInfoToast, infoToastProp } from "@components/Toast";

class InviteCode extends Component {
    static navigationOptions = ({ navigation: { navigate } }) => ({
        title: "",
        header: null,
    });

    constructor(props) {
        super(props);

        this.state = {
            inviteCode: props.route?.params?.inviteCode,
        };
    }

    copyInviteCode = () => {
        console.log("[InviteCode] >> [copyInviteCode]");
        Clipboard.setString(this.state.inviteCode);
        showInfoToast(infoToastProp({ message: "Invite code copied" }));
    };

    shareInviteCode = () => {
        console.log("[InviteCode] >> [shareInviteCode]");

        var msg = Strings.INVITE_CODE_SHARE_MSG.replace("{INVITE_CODE}", this.state.inviteCode);
        const shareOptions = {
            // title: "",
            message: msg,
        };

        Share.open(shareOptions)
            .then((res) => {
                console.log(res);
            })
            .catch((err) => {
                console.log("[InviteCode][shareInviteCode] >> Exception");
                err && console.log(err);
            });
    };

    onBackTap = () => {
        console.log("[InviteCode] >> [onBackTap]");
        const { from } = this.props.route.params;
        if (from === TOPUP_STATUS_SCREEN) {
            this.props.navigation.navigate(BANKINGV2_MODULE, {
                screen: TOPUP_STATUS_SCREEN,
                params: this.props.route.params,
            });
        } else {
            this.props.navigation.pop();
        }
    };

    render() {
        return (
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                <ScreenLayout
                    paddingBottom={0}
                    paddingTop={0}
                    paddingHorizontal={0}
                    useSafeArea
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={this.onBackTap} />}
                        />
                    }
                >
                    <ScrollView>
                        <View style={styles.pageContainer}>
                            {/* Top Share Logo */}
                            <View style={styles.shareLogo}>
                                <Image accessible={true} source={Assets.inviteCodeShare} />
                            </View>

                            <Typo
                                text={Strings.INVITE_CODE_HEADER}
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={23}
                                textAlign="left"
                                style={{ marginTop: 40 }}
                            />

                            <Typo
                                text={Strings.INVITE_CODE_SUB1}
                                fontSize={20}
                                fontWeight="300"
                                lineHeight={30}
                                textAlign="left"
                                style={{ marginTop: 10 }}
                            />

                            <Typo
                                text={Strings.INVITE_CODE_SUB2}
                                fontSize={12}
                                fontWeight="300"
                                lineHeight={20}
                                textAlign="left"
                                style={{ marginTop: 12 }}
                            />

                            {/* Invite Code Block */}
                            <TouchableOpacity
                                activeOpacity={1}
                                onPress={(value) => {
                                    this.copyInviteCode();
                                }}
                                style={styles.inviteCodeTouchBlockCls}
                            >
                                <View style={styles.inviteCodeBlockCls}>
                                    {/* Your Invite.....Label */}
                                    <Typo
                                        text={Strings.INVITE_CODE_BLOCK_HEADER}
                                        fontSize={13}
                                        fontWeight="600"
                                        lineHeight={23}
                                    />
                                    <View style={styles.inviteCodeValueBlockCls}>
                                        <Typo
                                            text={this.state.inviteCode}
                                            fontSize={23}
                                            fontWeight="300"
                                            lineHeight={33}
                                        />
                                        <Image
                                            style={styles.copyClipboardLogoViewCls}
                                            imageStyle={styles.inviteCodeLogoCls}
                                            source={Assets.inviteCodeCopy}
                                        />
                                    </View>
                                </View>
                            </TouchableOpacity>
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
                            onPress={this.shareInviteCode}
                            backgroundColor={YELLOW}
                            componentCenter={
                                <Typo
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={18}
                                    text="Invite Contacts"
                                />
                            }
                        />
                    </View>
                </ScreenLayout>
            </ScreenContainer>
        );
    }
}

const styles = StyleSheet.create({
    pageContainer: {
        marginHorizontal: 36,
    },
    inviteCodeValueBlockCls: {
        marginTop: 10,
        flexDirection: "row",
        justifyContent: "center",
    },
    shareLogo: {
        flexDirection: "row",
        justifyContent: "center",
    },
    inviteCodeBlockCls: {
        height: "100%",
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
    },
    inviteCodeTouchBlockCls: {
        // marginBottom: (screenHeight * 2) / 100,
        marginTop: 36,
        marginLeft: "15%",
        width: "70%",
        height: 100,
        borderRadius: 16,
        backgroundColor: WHITE,
        shadowColor: "rgba(0, 0, 0, 0.07)",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowRadius: 8,
        shadowOpacity: 1,
    },
    copyClipboardLogoViewCls: {
        height: 17,
        width: 14,
        overflow: "hidden",
        marginLeft: 10,
        marginTop: 10,
    },
    inviteCodeLogoCls: {
        height: "100%",
        width: "100%",
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

export default InviteCode;
