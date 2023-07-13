import Numeral from "numeral";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { View } from "react-native";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderLabel from "@components/Label/HeaderLabel";
import NumericalKeyboard from "@components/NumericalKeyboard";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";

import { GREY, BLACK } from "@constants/colors";

import TransferImageAndDetails from "./TransferImageAndDetails";

// -----------------------
// GET UI
// -----------------------

const Header = ({ onBackPress, headerTitle }) => {
    return (
        <HeaderLayout
            horizontalPaddingMode="custom"
            horizontalPaddingCustomLeftValue={24}
            horizontalPaddingCustomRightValue={24}
            headerLeftElement={<HeaderBackButton onPress={onBackPress} />}
            headerCenterElement={<HeaderLabel>{headerTitle}</HeaderLabel>}
        />
    );
};

Header.propTypes = {
    headerTitle: PropTypes.string,
    onBackPress: PropTypes.func,
};

class TransferEnterAmount extends Component {
    constructor(props) {
        super(props);

        this.state = {
            headerTitle: props.headerTitle,
            logoTitle: props.logoTitle,
            logoSubtitle: props.logoSubtitle,
            logoDescription: props.logoDescription,
            logoButtonLabel: props.logoButtonLabel,
            onBtPress: props.onBtPress,
            logoImage: props.logoImage,
            instructionLabel: props.instructionLabel,
            amountPrefix: props.amountPrefix,
            amount: 0,
            amountTextDisplay: "0.00",
            numericKeyboardVal: "0",
            onDoneClick: props.onDoneClick,
            onBackPress: props.onBackPress,
            errorMessage: "",
            isFirstTime: true,
        };
    }

    componentDidMount() {
        console.log("componentDidMount");
        this.setState({
            amount: this.props?.amount ?? 0,
            amountTextDisplay: this.props?.amountTextDisplay ?? "0.00",
            numericKeyboardVal: this.props?.numericKeyboardVal ?? "0",
            isFirstTime: this.props?.isFirstTime ?? true,
        });
    }

    componentWillUnmount() {}

    getInitialValue = () => {
        let val = this.state.amount;
        if (val === 0) {
            return "";
        } else {
            val = Math.floor(val * 100);
            const numberStr = val.toString();
            return numberStr;
        }
    };

    // -----------------------
    // EVENT HANDLER
    // -----------------------

    onChangeText = (val) => {
        let isFirstTime = this.state.isFirstTime;
        if (isFirstTime) {
            this.setState({ isFirstTime: false });
        }

        // conver to number
        const newValueStr = val;
        let amtInt = parseInt(newValueStr);
        amtInt = isNaN(amtInt) ? 0 : amtInt;
        let amtNumber = amtInt / 100;
        this.updateAmount(amtNumber, val);
    };

    updateAmount = (amtNumber, newValueStr) => {
        this.setState({
            amountTextDisplay: Numeral(amtNumber).format("0,0.00"),
            amount: amtNumber,
            errorMessage: "",
            numericKeyboardVal: newValueStr,
        });
    };

    onDoneClick = () => {
        if (this.state.isFirstTime) {
            this.setState({ errorMessage: "Please input valid amount." });
            return;
        }
        if (this.state.amount === 0) {
            this.setState({ errorMessage: "Amount needs to be at least RM 0.01." });
            return;
        }
        this.state.onDoneClick(this.state.amount);
    };

    // -----------------------
    // OTHERS
    // -----------------------

    render() {
        const {
            headerTitle,
            logoTitle,
            logoSubtitle,
            logoDescription,
            logoImage,
            amountPrefix,
            amount,
            instructionLabel,
            onBackPress,
            logoButtonLabel,
            onBtPress,
        } = this.state;

        return (
            <React.Fragment>
                <ScreenLayout
                    scrollable={true}
                    header={<Header onBackPress={onBackPress} headerTitle={headerTitle} />}
                    paddingTop={24}
                >
                    <View style={Styles.container}>
                        <View style={Styles.logoInfoContainer}>
                            <TransferImageAndDetails
                                title={logoTitle}
                                subtitle={logoSubtitle}
                                description={logoDescription}
                                viewButtonText={logoButtonLabel}
                                onBtPress={onBtPress}
                                image={logoImage} //selectedCard.image
                            ></TransferImageAndDetails>
                        </View>
                        {/*  */}
                        <View style={Styles.descriptionContainerAmount}>
                            <Typo
                                fontSize={14}
                                fontWeight="300"
                                fontStyle="normal"
                                letterSpacing={0}
                                lineHeight={19}
                                color="#000000"
                                textAlign="left"
                                text={instructionLabel}
                            />
                        </View>
                        {/*  */}
                        <View style={Styles.amountViewTransfer}>
                            <TextInput
                                accessibilityLabel={"Password"}
                                value={this.state.amountTextDisplay}
                                prefix={amountPrefix}
                                clearButtonMode="while-editing"
                                returnKeyType="done"
                                editable={false}
                                errorMessage={this.state.errorMessage}
                                style={{ color: amount == 0 ? GREY : BLACK }}
                                // isValid={true}
                                isValidate={this.state.errorMessage ? true : false}
                            />
                        </View>
                    </View>
                </ScreenLayout>
                <NumericalKeyboard
                    value={this.state.numericKeyboardVal}
                    onChangeText={this.onChangeText}
                    maxLength={8}
                    onDone={this.onDoneClick}
                />
            </React.Fragment>
        );
    }
}

TransferEnterAmount.propTypes = {
    amountPrefix: PropTypes.any,
    headerTitle: PropTypes.any,
    instructionLabel: PropTypes.any,
    logoDescription: PropTypes.any,
    logoImage: PropTypes.any,
    logoSubtitle: PropTypes.any,
    logoTitle: PropTypes.any,
    onBackPress: PropTypes.func,
    onDoneClick: PropTypes.func,
};

//make this component available to the app
export default TransferEnterAmount;

const Styles = {
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

    descriptionContainerAmount: {
        paddingTop: 26,
    },
    amountViewTransfer: {
        alignItems: "center",
        flexDirection: "row",
        marginTop: 4,
        width: "100%",
    },
};
