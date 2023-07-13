import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, StyleSheet, ScrollView } from "react-native";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";

import { YELLOW, DISABLED, MEDIUM_GREY, BLACK } from "@constants/colors";
import * as Strings from "@constants/strings";

import * as Utility from "@utils/dataModel/utility";

import * as TopupController from "./TopupController";

class TopupAddCardScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            acctNo: props.route.params?.acctNo ?? null,
            cardNumber: "",
            expiryDate: "",
            expiryMM: "",
            expiryYY: "",
            cvv: "",
            errMsgCardNumber: "",
            errMsgExpiryDate: "",
            errMsgCVV: "",
            isConfirmDisabled: true,
            loader: false,
            error: false,
            errorMessage: "",
            transactionType: props.route.params?.transactionType ?? null,
            accessToken: "",
        };
    }

    componentDidMount() {
        console.log("[TopupAddCardScreen] >> [componentDidMount]");
    }

    /* EVENT HANDLERS */

    onBackButtonPress = () => {
        console.log("[TopupAddCardScreen] >> [onBackButtonPress]");
        this.props.navigation.goBack();
    };

    onCloseButtonPress = () => {
        console.log("[TopupAddCardScreen] >> [onCloseButtonPress]");
        const { transactionType } = this.state;

        if (transactionType === "AUTO_TOPUP") {
            this.props.navigation.goBack();
        } else {
            TopupController.onTopupModuleClosePress(this);
        }
    };

    onTextInputChange = (params) => {
        console.log("[TopupAddCardScreen] >> [onTextInputChange]");
        const { key, value } = params;
        if (Object.prototype.hasOwnProperty.call(this.state, key)) {
            if (key === "expiryDate") {
                const value1 = this.addSlash(value);
                this.setState({ [key]: value1 });
            } else {
                this.setState({ [key]: value });
            }
        }
        this.setState(
            {
                errMsgCardNumber: "",
                errMsgExpiryDate: "",
                errMsgCVV: "",
            },
            () => {
                this.enableDisableBtn();
            }
        );
    };

    onConfirmButtonPress = () => {
        console.log("[TopupAddCardScreen] >> [onConfirmButtonPress]");
        if (this.validateCardNumber() && this.validateExpiryDate() && this.validateCVV()) {
            this.setState({ loader: true });
            TopupController.getGenerateTokenApiCalls(this);
        }
    };

    /* VALIDATIONS */

    validateCardNumber = () => {
        console.log("[TopupAddCardScreen] >> [validateCardNumber]");
        const cardNumber = this.state.cardNumber;
        let errMsg = "";

        // Card number empty check
        if (Utility.isEmpty(cardNumber)) {
            errMsg = "Please enter card number";
        }

        // Card Number - Numeral & length check
        else if (isNaN(cardNumber) || cardNumber.toString().length != 16) {
            errMsg = "Please enter a valid card number";
        }

        this.setState({ errMsgCardNumber: errMsg });
        return errMsg ? false : true;
    };

    validateExpiryDate = () => {
        console.log("[TopupAddCardScreen] >> [validateExpiryDate]");
        const expiryDate = this.state.expiryDate;
        let errMsg = "",
            expiryMM,
            expiryYY;

        // Expiry date empty check
        if (Utility.isEmpty(expiryDate)) {
            errMsg = "Please enter expiry date";
        }

        // Expiry date - Length check
        else if (expiryDate.toString().length == 5 && expiryDate.toString().indexOf("/") == 2) {
            expiryMM = parseInt(expiryDate.split("/")[0]);
            expiryYY = parseInt(expiryDate.split("/")[1]);

            // Valid expiry month check
            if (expiryMM < 0 || expiryMM > 12) {
                errMsg = "Expiry Month value should be between 01-12";
            }

            // Valid expiry year check
            else if (expiryYY.toString().length != 2) {
                errMsg = "Enter a valid expiry year";
            }
        } else {
            errMsg = "Please enter a valid expiry date";
        }

        this.setState({ errMsgExpiryDate: errMsg });

        // Update Expiry month/year
        if (Utility.isEmpty(errMsg)) {
            this.setState({
                expiryMM: expiryMM < 10 ? "0" + expiryMM : expiryMM,
                expiryYY,
            });
        }

        return errMsg ? false : true;
    };

    validateCVV = () => {
        console.log("[TopupAddCardScreen] >> [validateCVV]");
        const cvv = this.state.cvv;
        let errMsg = "";

        // CVV empty check
        if (Utility.isEmpty(cvv)) {
            errMsg = "Please enter CVV";
        }

        // Valid CVV check
        else if (cvv.toString().length != 3 || isNaN(cvv)) {
            errMsg = "Please enter a valid CVV code.";
        }

        this.setState({ errMsgCVV: errMsg });
        return errMsg ? false : true;
    };

    /* OTHERS */

    addSlash = (value) => {
        console.log("[TopupAddCardScreen] >> [addSlash]");
        if (typeof value == "string") {
            if (value.length === 3) {
                if (value.indexOf("/") != -1) {
                    return value.replace(/\//g, "");
                } else {
                    return value.substr(0, 2) + "/" + value.substr(2, 2);
                }
            } else {
                return value;
            }
        }
    };

    enableDisableBtn = () => {
        console.log("[TopupAddCardScreen] >> [enableDisableBtn]");
        this.setState({
            isConfirmDisabled:
                this.state.cardNumber.length > 0 &&
                this.state.expiryDate.length > 0 &&
                this.state.cvv.length > 0
                    ? false
                    : true,
        });
    };

    /* UI */

    getHeaderUI = () => {
        return (
            <HeaderLayout
                headerLeftElement={<HeaderBackButton onPress={this.onBackButtonPress} />}
                headerRightElement={<HeaderCloseButton onPress={this.onCloseButtonPress} />}
                headerCenterElement={
                    <Typo text="Top Up" fontWeight="600" fontSize={16} lineHeight={19} />
                }
            />
        );
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
                        header={this.getHeaderUI()}
                    >
                        <ScrollView>
                            <View style={styles.fieldContainer}>
                                {/* Card Number */}
                                <View style={styles.containerTitle}>
                                    <Typo
                                        fontSize={14}
                                        fontWeight="normal"
                                        fontStyle="normal"
                                        lineHeight={18}
                                        textAlign="left"
                                        text={Strings.CARD_NUMBER}
                                    />
                                </View>
                                <View>
                                    <TextInput
                                        maxLength={16}
                                        value={this.state.cardNumber}
                                        keyboardType={"number-pad"}
                                        placeholder="Enter card number"
                                        isValid={!this.state.errMsgCardNumber}
                                        isValidate
                                        errorMessage={this.state.errMsgCardNumber}
                                        onChangeText={(value) =>
                                            this.onTextInputChange({ key: "cardNumber", value })
                                        }
                                    />
                                </View>
                                {/* Expiry Date */}
                                <View style={styles.containerTitle}>
                                    <Typo
                                        fontSize={14}
                                        fontWeight="normal"
                                        fontStyle="normal"
                                        lineHeight={18}
                                        textAlign="left"
                                        text={Strings.EXPIRY_DATE}
                                    />
                                </View>
                                <View>
                                    <TextInput
                                        maxLength={5}
                                        value={this.state.expiryDate}
                                        keyboardType={"number-pad"}
                                        placeholder="MM/YY"
                                        isValid={!this.state.errMsgExpiryDate}
                                        isValidate
                                        errorMessage={this.state.errMsgExpiryDate}
                                        onChangeText={(value) =>
                                            this.onTextInputChange({ key: "expiryDate", value })
                                        }
                                    />
                                </View>

                                {/* CVV */}
                                <View style={styles.containerTitle}>
                                    <Typo
                                        fontSize={14}
                                        fontWeight="normal"
                                        fontStyle="normal"
                                        lineHeight={18}
                                        textAlign="left"
                                        text={Strings.CVV}
                                    />
                                </View>
                                <View>
                                    <TextInput
                                        maxLength={3}
                                        value={this.state.cvv}
                                        keyboardType={"number-pad"}
                                        placeholder="Enter CVV"
                                        isValid={!this.state.errMsgCVV}
                                        isValidate
                                        errorMessage={this.state.errMsgCVV}
                                        onChangeText={(value) =>
                                            this.onTextInputChange({ key: "cvv", value })
                                        }
                                    />
                                </View>

                                {/* Sub Header */}
                                <Typo style={styles.smallDescCls} text={Strings.ADD_CARD_NOTE} />
                            </View>
                        </ScrollView>
                        {/* Confirm Button */}
                        <FixedActionContainer>
                            <ActionButton
                                fullWidth
                                onPress={this.onConfirmButtonPress}
                                disabled={this.state.isConfirmDisabled}
                                backgroundColor={this.state.isConfirmDisabled ? DISABLED : YELLOW}
                                componentCenter={
                                    <Typo
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={18}
                                        text="Confirm"
                                    />
                                }
                            />
                        </FixedActionContainer>
                    </ScreenLayout>
                </View>
            </ScreenContainer>
        );
    }
}

TopupAddCardScreen.propTypes = {
    navigation: PropTypes.shape({
        goBack: PropTypes.func,
    }),
    route: PropTypes.shape({
        params: PropTypes.shape({
            acctNo: PropTypes.any,
            transactionType: PropTypes.any,
        }),
    }),
};

export default TopupAddCardScreen;

const styles = StyleSheet.create({
    containerTitle: {
        marginBottom: 8,
        marginTop: 24,
    },
    fieldContainer: {
        marginHorizontal: 36,
    },
    smallDescCls: {
        color: BLACK,
        fontFamily: "montserrat",
        fontSize: 12,
        fontStyle: "normal",
        fontWeight: "normal",
        letterSpacing: 0,
        lineHeight: 16,
        marginTop: 8,
        opacity: 0.5,
        textAlign: "left",
    },
    viewContainer: {
        flex: 1,
    },
});
