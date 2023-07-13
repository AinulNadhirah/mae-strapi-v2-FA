import React, { Component } from "react";
import { Alert, Dimensions, StyleSheet, Image, View, ScrollView } from "react-native";

import ScreenContainer from "@components/Containers/ScreenContainer";
import ScreenLayout from "@layouts/ScreenLayout";
import HeaderLayout from "@layouts/HeaderLayout";
import Typo from "@components/Text";
import ActionButton from "@components/Buttons/ActionButton";
import FixedActionContainer from "@components/Footers/FixedActionContainer";

import Assets from "@assets";
import { WHITE, YELLOW, FADE_GREY, GREY } from "@constants/colors";
import * as Strings from "@constants/strings";
import {
    PDF_VIEWER,
    BANKINGV2_MODULE,
    ACCOUNT_DETAILS_SCREEN,
    TAB,
    TAB_NAVIGATOR,
    MAYBANK2U,
    DASHBOARD,
    SPLASHSCREEN,
} from "@navigation/navigationConstant";
import CustomPdfGenerator from "@components/Common/CustomPdfGenerator";
import NavigationService from "@navigation/navigationService";

const screenHeight = Dimensions.get("window").height;

class LoanStatusScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            status: props.route.params?.status ?? Strings.FAIL_STATUS, // success | failure
            headerText: props.route.params?.headerText ?? Strings.PAYMENT_FAIL,
            detailsArray: props.route.params?.detailsArray ?? null, // Each object must contain key & value
            serverError: props.route.params?.serverError ?? null,
            receiptDetailsArray: props.route.params?.receiptDetailsArray ?? [],
            isSelectedDateToday: props.route.params?.isSelectedDateToday ?? false,
        };
    }

    onShareReceiptTap = async () => {
        console.log("[LoanStatusScreen] >> [onShareReceiptTap]");

        // TODO: Used for testing purpose. To be removed later
        // const detailsArray = [
        //     {
        //         label: "Payment scheduled for",
        //         value: "23 Feb 2019",
        //         showRightText: false,
        //     },
        //     {
        //         label: "Reference ID",
        //         value: "112123423",
        //         value2: "Some temporary value.",
        //         showRightText: true,
        //         rightTextType: "text",
        //         rightStatusType: "",
        //         rightText: "12 Dec 2018, 12:04 PM",
        //     },
        //     {
        //         label: "Pay to",
        //         value: "1234 5678 9876",
        //         showRightText: false,
        //     },
        //     {
        //         label: "To account type",
        //         value: "Savings Account",
        //         showRightText: false,
        //     },
        //     {
        //         label: "To account type",
        //         value: "Savings Account",
        //         showRightText: false,
        //     },
        //     {
        //         label: "To account",
        //         value: "**** **** **** 5674",
        //         showRightText: false,
        //     },
        //     {
        //         label: "Vehicle number",
        //         value: "VD11234",
        //         showRightText: false,
        //     },
        //     {
        //         label: "Amount",
        //         value: "RM 80.00",
        //         showRightText: false,
        //         isAmount: true,
        //         rightTextType: "status",
        //         rightStatusType: "success",
        //         rightText: "Successful",
        //     },
        // ];

        const { receiptDetailsArray, isSelectedDateToday } = this.state;
        const statusType = isSelectedDateToday ? "success" : "pending";
        const statusText = isSelectedDateToday ? "Successful" : "Pending";

        // Call custom method to generate PDF
        const file = await CustomPdfGenerator.generateReceipt(
            true,
            Strings.PAYMENT,
            true,
            Strings.RECEIPT_NOTE,
            // detailsArray,
            receiptDetailsArray,
            true,
            statusType,
            statusText
        );
        if (file === null) {
            Alert.alert("Please allow permission");
            return;
        }

        const navParams = {
            file,
            type: "file",
        };

        // Navigate to PDF viewer to display PDF
        this.props.navigation.navigate(PDF_VIEWER, navParams);
    };

    onDoneTap = () => {
        console.log("[LoanStatusScreen] >> [onDoneTap]");

        const source = this.props.route.params?.source ?? "";
        const isLocked = this.props.route.params?.isLocked ?? false;

        if (isLocked) {
            NavigationService.resetAndNavigateToModule(SPLASHSCREEN, "", {
                skipIntro: true,
                rsaLocked: true,
            });
        } else {
            switch (source) {
                case "loanDetails":
                    this.props.navigation.navigate(TAB_NAVIGATOR, {
                        screen: TAB,
                        params: {
                            screen: MAYBANK2U,
                        },
                    });
                    break;
                case "AccountDetails":
                case "transferOwnAccount":
                    this.props.navigation.navigate(BANKINGV2_MODULE, {
                        screen: ACCOUNT_DETAILS_SCREEN,
                    });
                    break;
                default:
                    // Go back to Dashboard
                    this.props.navigation.navigate(TAB_NAVIGATOR, {
                        screen: TAB,
                        params: {
                            screen: DASHBOARD,
                            params: { refresh: true },
                        },
                    });
                    break;
            }
        }
    };

    render() {
        const { status, headerText, serverError, detailsArray } = this.state;

        return (
            <ScreenContainer backgroundType="color">
                <ScreenLayout
                    header={<HeaderLayout />}
                    paddingHorizontal={0}
                    paddingBottom={0}
                    paddingTop={0}
                    useSafeArea
                >
                    <React.Fragment>
                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            style={Style.scrollViewCls}
                        >
                            {/* Image Block */}
                            <View style={Style.statusPgImgBlockCls}>
                                <Image
                                    resizeMode="contain"
                                    style={Style.statusIconCls}
                                    source={
                                        status == "failure" ? Assets.icFailedIcon : Assets.icTickNew
                                    }
                                />
                            </View>

                            {/* Desc */}
                            <Typo
                                fontSize={20}
                                fontWeight="300"
                                fontStyle="normal"
                                letterSpacing={0}
                                lineHeight={28}
                                textAlign="left"
                                text={headerText}
                                style={Style.descriptionCls}
                            />

                            {/* Server Error */}
                            {serverError && (
                                <Typo
                                    fontSize={12}
                                    lineHeight={18}
                                    textAlign="left"
                                    fontWeight="normal"
                                    fontStyle="normal"
                                    color={FADE_GREY}
                                    ellipsizeMode="tail"
                                    numberOfLines={3}
                                    text={serverError}
                                />
                            )}

                            {/* Status Details */}
                            {detailsArray ? (
                                <View style={Style.detailViewCls}>
                                    {detailsArray.map((prop, index) => {
                                        return (
                                            <View style={Style.detailsBlockCls} key={index}>
                                                <Typo
                                                    fontSize={12}
                                                    fontWeight="normal"
                                                    fontStyle="normal"
                                                    letterSpacing={0}
                                                    lineHeight={18}
                                                    text={prop.key}
                                                />

                                                <Typo
                                                    fontSize={12}
                                                    fontWeight="600"
                                                    fontStyle="normal"
                                                    letterSpacing={0}
                                                    lineHeight={18}
                                                    text={prop.value}
                                                />
                                            </View>
                                        );
                                    })}
                                </View>
                            ) : null}
                        </ScrollView>

                        {/* Bottom Button Container */}
                        <FixedActionContainer>
                            <View style={Style.bottomBtnContCls}>
                                {status == "success" && (
                                    <ActionButton
                                        height={48}
                                        fullWidth
                                        borderRadius={24}
                                        backgroundColor={WHITE}
                                        borderStyle="solid"
                                        borderWidth={1}
                                        borderColor={GREY}
                                        componentCenter={
                                            <Typo
                                                fontSize={14}
                                                fontWeight="600"
                                                fontStyle="normal"
                                                letterSpacing={0}
                                                lineHeight={18}
                                                text="Share Receipt"
                                            />
                                        }
                                        onPress={this.onShareReceiptTap}
                                        style={Style.shareBtnCls}
                                    />
                                )}

                                <ActionButton
                                    height={48}
                                    fullWidth
                                    borderRadius={24}
                                    backgroundColor={YELLOW}
                                    componentCenter={
                                        <Typo
                                            fontSize={14}
                                            fontWeight="600"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={18}
                                            text={Strings.DONE}
                                        />
                                    }
                                    onPress={this.onDoneTap}
                                />
                            </View>
                        </FixedActionContainer>
                    </React.Fragment>
                </ScreenLayout>
            </ScreenContainer>
        );
    }
}

const Style = StyleSheet.create({
    bottomBtnContCls: {
        width: "100%",
    },

    descriptionCls: {
        marginBottom: 5,
    },

    detailViewCls: {
        marginTop: 30,
    },

    detailsBlockCls: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 15,
        marginTop: 10,
        width: "100%",
    },

    scrollViewCls: { paddingHorizontal: 36 },

    shareBtnCls: {
        marginBottom: 15,
        marginTop: 10,
        width: "100%",
    },

    statusPgImgBlockCls: {
        marginBottom: 25,
        marginTop: (screenHeight * 15) / 100,
        width: "100%",
    },

    statusIconCls: {
        height: 52,
        width: 57,
    },

    statusPgImgBlockCls: {
        marginBottom: 25,
        marginTop: (screenHeight * 15) / 100,
        width: "100%",
    },
});

export default LoanStatusScreen;
