import numeral from "numeral";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, StyleSheet, Image, Keyboard } from "react-native";

import { SB_CONFIRMATION } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import CalcKeypad from "@components/Keypad/CalcKeypad";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";

import { MEDIUM_GREY, WHITE, GREY, DARK_GREY, RED_ERROR, SHADOW } from "@constants/colors";
import {
    SPLIT_BILL,
    CURRENCY_CODE,
    FA_SPLIT_BILL_CREATE_BILL_AMT,
    FA_SPLIT_BILL_CREATE_INDIVIDUAL_AMT,
    FA_SPLIT_BILL_CONATCT_AMOUNT,
} from "@constants/strings";

class CalcAmountScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            headerText:
                this.props?.route?.params?.headerText ?? "How much would you like to split?",
            defaultAmount: null,
            amount: "0.00",
            amountErrMsg: "",
            amountValid: true,
            operator: "",
            equationLeftAmt: "",
            equationRightAmt: "",
            equationText: "",

            screenName: "",

            showContactInfo: false,
            contactName: "",
            contactInitial: "",
            profilePicUrl: "",

            showError: false,
            errorMsg: "",
        };
    }

    componentDidMount = () => {
        console.log("[CalcAmountScreen] >> [componentDidMount]");
        Keyboard.dismiss();

        this.props.navigation.addListener("focus", this.onScreenFocus);
    };

    onScreenFocus = () => {
        console.log("[CalcAmountScreen] >> [onScreenFocus]");

        Keyboard.dismiss();

        const params = this.props?.route?.params ?? null;
        if (!params) return;

        const { defaultAmount, screenName, contactItem } = params;
        const showContactInfo = screenName == SB_CONFIRMATION && contactItem;

        this.setState({
            defaultAmount,
            screenName,
            showContactInfo,
            contactName: contactItem?.contactName ?? "",
            contactInitial: contactItem?.contactInitial ?? "",
            profilePicUrl: contactItem?.profilePicUrl ?? "",
        });
    };

    onBackTap = () => {
        console.log("[CalcAmountScreen] >> [onBackTap]");

        const onBack = this.props?.route?.params?.onBack ?? null;
        if (onBack) {
            onBack();
        } else {
            this.props.navigation.goBack();
        }
    };

    onCloseTap = () => {
        console.log("[CalcAmountScreen] >> [onCloseTap]");

        const onClose = this.props?.route?.params?.onClose ?? null;
        if (onClose) {
            onClose();
        } else {
            this.props.navigation.goBack();
        }
    };

    onAmountChange = (amount, operator, equationLeftAmt, equationRightAmt) => {
        console.log(
            "[CalcAmountScreen][onAmountChange] >> amount: " +
                amount +
                " | equationLeftAmt: " +
                equationLeftAmt +
                " | operator: " +
                operator +
                " | equationRightAmt: " +
                equationRightAmt
        );

        // Reset error state
        this.setState({ showError: false, errorMsg: "" });

        amount = numeral(amount).format("0,0.00");
        equationLeftAmt = `RM ${numeral(equationLeftAmt).format("0,0.00")}`;
        equationRightAmt = numeral(equationRightAmt).format("0,0.00");

        const equationText = `${equationLeftAmt} ${operator} ${equationRightAmt}`;

        this.setState({
            amount,
            operator,
            equationLeftAmt,
            equationRightAmt,
            equationText: operator && equationText,
        });
    };

    onAmountDone = (amount = 0) => {
        console.log("[CalcAmountScreen][onAmountDone] >> amount: " + amount);

        // Reset error state
        this.setState({ showError: false, errorMsg: "" });

        const onDone = this.props?.route?.params?.onDone ?? null;
        if (onDone) {
            onDone(amount, this.errorCallback);
        } else {
            this.props.navigation.goBack();
        }
    };

    errorCallback = (errorMsg = "") => {
        console.log("[CalcAmountScreen][errorCallback] >> errorMsg: " + errorMsg);
        this.setState({ showError: true, errorMsg });
    };

    render() {
        const {
            headerText,
            showContactInfo,
            contactName,
            contactInitial,
            profilePicUrl,
            showError,
            errorMsg,
            defaultAmount,
            equationText,
            amountErrMsg,
            amount,
            amountValid,
        } = this.state;
        const splitBillType =
            this.props?.route?.params?.source === FA_SPLIT_BILL_CONATCT_AMOUNT
                ? FA_SPLIT_BILL_CREATE_INDIVIDUAL_AMT
                : FA_SPLIT_BILL_CREATE_BILL_AMT;

        return (
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                analyticScreenName={splitBillType}
            >
                <React.Fragment>
                    <ScreenLayout
                        scrollable
                        header={
                            <HeaderLayout
                                headerLeftElement={<HeaderBackButton onPress={this.onBackTap} />}
                                headerCenterElement={
                                    <Typo
                                        fontSize={16}
                                        fontWeight="600"
                                        lineHeight={19}
                                        text={SPLIT_BILL}
                                    />
                                }
                                headerRightElement={<HeaderCloseButton onPress={this.onCloseTap} />}
                            />
                        }
                        paddingHorizontal={36}
                        paddingBottom={0}
                        paddingTop={0}
                        useSafeArea
                    >
                        <View style={Style.containerView}>
                            {/* Contact Image & Name */}
                            {showContactInfo && (
                                <View style={Style.renderItemOuterCls}>
                                    <View style={Style.avatarContainerCls}>
                                        {profilePicUrl ? (
                                            <Image
                                                source={{ uri: profilePicUrl }}
                                                style={Style.avatarImgCls}
                                            />
                                        ) : (
                                            <Typo
                                                color={DARK_GREY}
                                                fontSize={22}
                                                fontWeight="300"
                                                lineHeight={22}
                                                text={contactInitial}
                                                style={Style.contactInitialCls}
                                            />
                                        )}
                                    </View>

                                    <Typo
                                        textAlign="left"
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={18}
                                        ellipsizeMode="tail"
                                        numberOfLines={2}
                                        text={contactName}
                                        style={Style.contactNameCls}
                                    />
                                </View>
                            )}

                            {/* Header Text */}
                            <Typo
                                fontSize={14}
                                lineHeight={19}
                                textAlign="left"
                                text={headerText}
                            />

                            {/* Non Editable Amount Field */}
                            <TextInput
                                isValid={amountValid}
                                errorMessage={amountErrMsg}
                                prefix={CURRENCY_CODE}
                                value={amount}
                                clearButtonMode="while-editing"
                                returnKeyType="done"
                                editable={false}
                            />

                            {/* Error Message */}
                            {showError && (
                                <Typo style={Style.errorMessage} textAlign="left" text={errorMsg} />
                            )}

                            {/* Label displaying equation */}
                            <Typo
                                fontSize={14}
                                lineHeight={19}
                                textAlign="left"
                                text={equationText}
                                style={Style.equationTextCls}
                            />
                        </View>
                    </ScreenLayout>

                    {/* Calculator Keypad */}
                    <CalcKeypad
                        onChange={this.onAmountChange}
                        onDone={this.onAmountDone}
                        maxChar={8}
                        defaultValue={defaultAmount}
                    />
                </React.Fragment>
            </ScreenContainer>
        );
    }
}

CalcAmountScreen.propTypes = {
    navigation: PropTypes.object.isRequired,
    route: PropTypes.object.isRequired,
};

const Style = StyleSheet.create({
    avatarContainerCls: {
        alignItems: "center",
        backgroundColor: GREY,
        borderColor: WHITE,
        borderRadius: 30,
        borderStyle: "solid",
        borderWidth: 2,
        elevation: 5,
        height: 60,
        justifyContent: "center",
        overflow: "hidden",
        shadowColor: SHADOW,
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 1,
        shadowRadius: 15,
        width: 60,
    },

    avatarImgCls: {
        height: "100%",
        width: "100%",
    },

    contactInitialCls: {
        marginTop: 6,
    },

    contactNameCls: {
        flex: 1,
        marginHorizontal: 20,
    },

    containerView: {
        flex: 1,
        marginTop: 30,
    },

    equationTextCls: {
        marginTop: 50,
    },

    errorMessage: {
        color: RED_ERROR,
        fontSize: 12,
        lineHeight: 16,
        paddingVertical: 15,
    },

    renderItemOuterCls: {
        alignItems: "center",
        flexDirection: "row",
        height: 100,
    },
});

export default CalcAmountScreen;
