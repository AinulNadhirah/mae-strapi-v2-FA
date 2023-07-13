import React, { Component } from "react";
import { View, TouchableOpacity, StyleSheet, Image } from "react-native";
import * as Strings from "@constants/strings";
import { MEDIUM_GREY, YELLOW, BLACK, FADE_GREY } from "@constants/colors";
import ActionButton from "@components/Buttons/ActionButton";
import {
    BANKINGV2_MODULE,
    SWITCH_MAE_ACCOUNT,
    SWITCH_MAE_STATUS_SCREEN,
    COMMON_MODULE,
    PDF_VIEW,
} from "@navigation/navigationConstant";
import Typo from "@components/Text";
import ScreenContainer from "@components/Containers/ScreenContainer";
import ScreenLayout from "@layouts/ScreenLayout";
import HeaderLayout from "@layouts/HeaderLayout";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import { showErrorToast } from "@components/Toast";
import Assets from "@assets";
import { switchToMAEIslamic } from "@services";

class SwitchMAEAccount extends Component {
    constructor(props) {
        super(props);
    }

    /* EVENT HANDLERS */

    onBackButtonPress = () => {
        console.log("[SwitchMAEAccount] >> [onBackButtonPress]");
        this.props.navigation.goBack();
    };

    onConfirmButtonPress = async () => {
        console.log("[SwitchMAEAccount] >> [onConfirmButtonPress]");
        const reqParams = {
            maeAcctNo: this.props.route.params.data.acctNo.substring(0, 12),
        };

        const httpRespStepup = await switchToMAEIslamic(reqParams, true);
        const responseSteup = httpRespStepup.data;
        const result = responseSteup.result;
        const statusCode = result?.statusCode ?? "";
        const statusDesc = result?.statusDesc ?? Strings.COMMON_ERROR_MSG;
        const status = statusCode == "0000" ? Strings.SUCC_STATUS : Strings.FAIL_STATUS;

        if (statusCode == "0000") {
            // Navigate to status page
            const headerText = status == "success" ? "Request Successful" : "Request unsuccessful.";
            const subHeaderTextCls =
                status == "success"
                    ? "Your account will be updated after 1 working day."
                    : "Please try again";

            let navParams = {
                status: status,
                headerText: headerText,
                subHeaderTextCls: subHeaderTextCls,
                routeFrom: this.props.route.params.routeFrom,
            };
            this.props.navigation.navigate(SWITCH_MAE_STATUS_SCREEN, navParams);
        } else {
            showErrorToast({
                message: statusDesc ? statusDesc : Strings.COMMON_ERROR_MSG,
            });
        }
    };

    onTncLinkPress = () => {
        console.log("[SwitchMAEAccount] >> [onTncLinkPress]");
        const params = {
            file: "https://www.maybank2u.com.my/iwov-resources/maybank/document/my/en/personal/mae-isl_tnc.pdf",
            share: false,
            type: "url",
            route: SWITCH_MAE_ACCOUNT,
            module: BANKINGV2_MODULE,
            title: "Terms & Conditions",
            pdfType: "shareReceipt",
        };

        this.props.navigation.navigate(COMMON_MODULE, {
            screen: PDF_VIEW,
            params: { params },
        });
    };

    render() {
        return (
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                <React.Fragment>
                    <View style={styles.containerView}>
                        <ScreenLayout
                            useSafeArea
                            header={
                                <HeaderLayout
                                    horizontalPaddingMode="custom"
                                    horizontalPaddingCustomLeftValue={24}
                                    horizontalPaddingCustomRightValue={24}
                                    headerLeftElement={
                                        <HeaderBackButton onPress={this.onBackButtonPress} />
                                    }
                                />
                            }
                        >
                            <React.Fragment>
                                <View style={styles.containerView}>
                                    {/* Heading */}
                                    <Typo
                                        text={Strings.SWITCH_MAE_HEADER}
                                        style={styles.headerCls}
                                    />

                                    {/* Sub heading */}
                                    <Typo
                                        text={Strings.SWITCH_MAE_SUB_HEADER}
                                        style={styles.subHeaderTextCls}
                                    />

                                    {/* BulletText 1 */}
                                    <View style={styles.topUpIntroBulletTextRowCls}>
                                        <Image
                                            source={Assets.icTickBlackDarkSmall}
                                            resizeMode="contain"
                                            style={{
                                                height: 15,
                                                width: 12,
                                            }}
                                        />
                                        <Typo
                                            text={Strings.SWITCH_MAE_BENEFIT_ONE}
                                            style={styles.beniftpoints}
                                        />
                                    </View>

                                    {/* BulletText 2 */}
                                    <View style={styles.topUpIntroBulletContCls}>
                                        <View style={styles.topUpIntroBulletTextRowCls}>
                                            <Image
                                                source={Assets.icTickBlackDarkSmall}
                                                resizeMode="contain"
                                                style={{
                                                    height: 15,
                                                    width: 12,
                                                }}
                                            />
                                            <Typo
                                                text="Confirming to switch means that you've"
                                                style={styles.beniftpoints}
                                            />
                                        </View>

                                        <View style={styles.topUpIntroBulletTextRowCls}>
                                            <Typo
                                                text="read and agree to the"
                                                style={styles.beniftpoints2}
                                            />
                                            <TouchableOpacity onPress={this.onTncLinkPress}>
                                                <Typo
                                                    text=" Terms & Conditions."
                                                    style={styles.tncText}
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                                {/* Bottom Container */}
                                <View style={styles.footerContainer}>
                                    {/* Continue Button */}
                                    <Typo
                                        color={FADE_GREY}
                                        fontSize={12}
                                        lineHeight={18}
                                        fontWeight="normal"
                                        textAlign="left"
                                        text="Note: Your request to switch will be reflected after 1 working day."
                                        style={{ marginBottom: 12 }}
                                    />
                                    <View style={styles.footerButton}>
                                        <ActionButton
                                            fullWidth
                                            onPress={this.onConfirmButtonPress}
                                            backgroundColor={YELLOW}
                                            componentCenter={
                                                <Typo
                                                    fontSize={14}
                                                    fontWeight="600"
                                                    lineHeight={18}
                                                    color={BLACK}
                                                    text={Strings.CONFIRM}
                                                />
                                            }
                                        />
                                    </View>
                                </View>
                            </React.Fragment>
                        </ScreenLayout>
                    </View>
                </React.Fragment>
            </ScreenContainer>
        );
    }
}

export default SwitchMAEAccount;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    containerView: {
        flex: 1,
        width: "100%",
    },
    headerCls: {
        textAlign: "left",
        color: "#000000",
        fontFamily: "montserrat",
        fontSize: 20,
        fontStyle: "normal",
        fontWeight: "300",
        letterSpacing: 0,
        lineHeight: 28,
        marginBottom: 25,
        width: "90%",
    },
    subHeaderTextCls: {
        textAlign: "left",
        color: "#000000",
        fontFamily: "montserrat",
        fontSize: 13,
        fontStyle: "normal",
        fontWeight: "normal",
        letterSpacing: 0,
        lineHeight: 17,
        marginBottom: 20,
        width: "90%",
    },
    beniftpoints: {
        textAlign: "left",
        color: "#000000",
        fontFamily: "montserrat",
        fontSize: 13,
        fontStyle: "normal",
        fontWeight: "normal",
        letterSpacing: 0,
        lineHeight: 17,
        marginLeft: 10,
        marginRight: 20,
        width: "90%",
    },
    topUpIntroBulletContCls: {
        flexDirection: "column",
        justifyContent: "flex-start",
        marginTop: 15,
        width: "100%",
    },
    topUpIntroBulletTextRowCls: {
        flexDirection: "row",
        justifyContent: "flex-start",
        width: "100%",
    },
    beniftpoints2: {
        textAlign: "left",
        color: "#000000",
        fontFamily: "montserrat",
        fontSize: 13,
        fontStyle: "normal",
        fontWeight: "normal",
        letterSpacing: 0,
        lineHeight: 17,
        marginLeft: 20,
    },
    footerContainer: {
        alignItems: "center",
        flexDirection: "column",
        width: "100%",
    },
    tncText: {
        textAlign: "left",
        color: "#000000",
        fontFamily: "montserrat",
        fontSize: 13,
        fontStyle: "normal",
        fontWeight: "normal",
        letterSpacing: 0,
        lineHeight: 17,
        textDecorationLine: "underline",
        color: "#7c7c7d",
    },
    footerButton: { marginBottom: 24, width: "100%" },
});
