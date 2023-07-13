import PropTypes from "prop-types";
import React, { Component } from "react";
import { View } from "react-native";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import { AccountDetailsView } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import NumericalKeyboard from "@components/NumericalKeyboard";
import ChallengeQuestion from "@components/RSA/ChallengeQuestion";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";
import TransferImageAndDetails from "@components/Transfers/TransferImageAndDetails";

import { withModelContext } from "@context";

import { MEDIUM_GREY, GREY, BLACK } from "@constants/colors";
import {
    AMOUNT_NEEDS_TO_BE_001,
    CURRENCY_CODE,
    ENTER_AMOUNT,
    FA_TRANSFER_TOPUP_AMOUNT
} from "@constants/strings";

import Assets from "@assets";

import * as TopupController from "./TopupController";

("use strict");

class TopupEnterAmountScreen extends Component {
    static propTypes = {
        getModel: PropTypes.func,
    };

    constructor(props) {
        super(props);

        this.state = {
            amountValue: 0,
            amountText: "000",
            amount: "0.00",
            loader: false,
            errAmount: "",
            logoTitle: props.route.params.data?.formattedAccount,
            logoDescription: "Maybank",
            logoImg: { type: "local", source: Assets.icMAE60 },
            data: props.route.params.data ?? null,
            acctNo: props.route.params.data?.acctNo.substring(0, 12),
            screenData: {
                image: {
                    image: "icMAE.png",
                    imageName: "icMAE.png",
                    imageUrl: "icMAE.png",
                    shortName: "MAE",
                    type: true,
                },
                name: props.route.params.data?.formattedAccount,
                description1: "MAE",
                description2: "Maybank",
            },

            // RSA State Objects
            isRSARequired: false,
            challengeQuestion: "",
            isRSALoader: true,
            RSACount: 0,
            RSAError: false,
        };
    }

    /* EVENT HANDLERS */

    onDoneButtonPress = () => {
        const { amount } = this.state;
        let amountText = amount ? amount.toString().replace(/,/g, "") : "0.00";

        if (amountText == null || amountText === "undefined" || amountText.length === 0) {
            amountText = 0;
        }

        if (amountText < 0.01) {
            console.log("doneClick  ", AMOUNT_NEEDS_TO_BE_001);
            if (amountText.length <= 0) {
                this.setState({ amount: "0.00" });
            }
            this.setState({ errAmount: "Please enter amount." });
        } else {
            const params = this.props.route?.params ?? {};
            TopupController.onEnterAmountDoneTap(this, params, amountText);
        }
    };

    onBackButtonPress = () => {
        console.log("[TopupAddCard] >> [onBackButtonPress]");
        this.props.navigation.goBack();
    };

    onCloseButtonPress = () => {
        console.log("[TopupAddCard] >> [onCloseButtonPress]");
        TopupController.onTopupModuleClosePress(this);
    };

    changeText = (val) => {
        console.log("changeText : ", val);
        let value = val ? parseInt(val) : 0;

        if (value > 0) {
            const formatted = this.numberWithCommas(value);
            console.log("formatted : ", formatted);
            this.setState({ amount: formatted, amountValue: value, errAmount: "" });
        } else {
            this.setState({ amount: "0.00", amountValue: value });
        }
    };

    numberWithCommas = (val) => {
        let text = JSON.stringify(val);
        let x = "0.00";
        if (text) {
            let resStr = "";
            if (text.length === 1) {
                resStr =
                    text.substring(0, text.length - 2) + "0.0" + text.substring(text.length - 2);
            } else if (text.length < 3) {
                resStr =
                    text.substring(0, text.length - 2) + "0." + text.substring(text.length - 2);
            } else {
                if (parseInt(text) > 0) {
                    resStr =
                        text.substring(0, text.length - 2) + "." + text.substring(text.length - 2);
                } else {
                    resStr = "0.00";
                }
            }

            x = resStr.toString();
            const pattern = /(-?\d+)(\d{3})/;
            while (pattern.test(x)) x = x.replace(pattern, "$1,$2");
        }
        return x;
    };

    formateAmount = (text) => {
        return text.substring(0, text.length - 2) + "." + text.substring(text.length - 2);
    };

    // RSA event
    onChallengeSnackClosePress = () => {
        this.setState({ RSAError: false });
    };

    onChallengeQuestionSubmitPress = (answer) => {
        console.log("onChallengeQuestionSubmitPress++++++");
        this.setState(
            {
                isRSALoader: true,
                RSAError: false,
                isSubmitDisable: true,
            },
            () => {
                TopupController.onChallengeQuestionSubmitPress(this, answer);
            }
        );
    };

    /* UI */

    render() {
        const { amount, screenData } = this.state;
        return (
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                analyticScreenName={FA_TRANSFER_TOPUP_AMOUNT}
            >
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={
                                <HeaderBackButton onPress={this.onBackButtonPress} />
                            }
                            headerRightElement={
                                <HeaderCloseButton onPress={this.onCloseButtonPress} />
                            }
                            headerCenterElement={
                                <Typo
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={19}
                                    text="Top Up"
                                />
                            }
                        />
                    }
                    useSafeArea
                    paddingHorizontal={0}
                    paddingBottom={0}
                >
                    <React.Fragment>
                        <View style={styles.container}>
                            <View style={styles.blockNew}>
                                <AccountDetailsView
                                    data={this.state.screenData}
                                    base64={true}
                                    image={this.state.logoImg}
                                />
                                <View style={styles.descriptionContainerAmount}>
                                    <Typo
                                        fontSize={14}
                                        fontWeight="300"
                                        fontStyle="normal"
                                        letterSpacing={0}
                                        lineHeight={19}
                                        textAlign="left"
                                        text={ENTER_AMOUNT}
                                    />
                                </View>
                                <View style={styles.amountViewTransfer}>
                                    <TextInput
                                        accessibilityLabel={"Password"}
                                        prefixStyle={[{ color: GREY }]}
                                        style={{ color: amount == 0 ? GREY : BLACK }}
                                        isValid={!this.state.errAmount}
                                        isValidate
                                        errorMessage={this.state.errAmount}
                                        onSubmitEditing={this.onDone}
                                        value={amount}
                                        prefix={CURRENCY_CODE}
                                        clearButtonMode="while-editing"
                                        returnKeyType="done"
                                        editable={false}
                                    />
                                </View>
                                {/* Sub Header */}
                                <Typo
                                    style={styles.smallDescCls}
                                    text="The minimum top up amount is RM10"
                                />
                            </View>
                        </View>
                        <NumericalKeyboard
                            value={`${this.state.amountValue}`}
                            onChangeText={this.changeText}
                            maxLength={6}
                            onDone={this.onDoneButtonPress}
                        />
                    </React.Fragment>
                    {this.state.isRSARequired && (
                        <ChallengeQuestion
                            loader={this.state.isRSALoader}
                            display={this.state.isRSARequired}
                            displyError={this.state.RSAError}
                            questionText={this.state.challengeQuestion}
                            onSubmitPress={this.onChallengeQuestionSubmitPress}
                            onSnackClosePress={this.onChallengeSnackClosePress}
                        />
                    )}
                </ScreenLayout>
            </ScreenContainer>
        );
    }
}

export default withModelContext(TopupEnterAmountScreen);

const styles = {
    container: {
        flex: 1,
        alignItems: "flex-start",
    },
    footerContainer: {
        flex: 1,
        width: "100%",
        flexDirection: "column",
        justifyContent: "flex-end",
    },
    blockNew: {
        flexDirection: "column",
        flex: 1,
        paddingEnd: 38,
        paddingStart: 36,
    },
    titleContainerTransferNewSmall: {
        justifyContent: "flex-start",
        marginTop: -15,
    },
    descriptionContainerAmount: {
        marginTop: 15,
    },
    amountViewTransfer: {
        alignItems: "center",
        flexDirection: "row",
        marginTop: 4,
        width: "100%",
    },
    smallDescCls: {
        marginTop: 8,
        opacity: 0.5,
        color: "#000000",
        fontFamily: "montserrat",
        fontSize: 12,
        lineHeight: 16,
        fontStyle: "normal",
        fontWeight: "normal",
        textAlign: "left",
        letterSpacing: 0,
    },
};
