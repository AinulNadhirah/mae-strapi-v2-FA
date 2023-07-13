"use strict";

import React, { Component } from "react";
import {
    View,
    Image,
    StyleSheet,
    Picker,
    Text,
    Keyboard,
    Alert,
    TouchableOpacity,
    Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-community/async-storage";
import commonStyle from "@styles/main";
import {
    PinInput,
    VirtualKeyboard,
    ErrorMessage,
    HighlightAmount,
    HeaderPageIndicator,
} from "@components/Common";
import OtpPin from "@components/OtpPin";

import PropTypes from "prop-types";
import * as navigationConstant from "@navigation/navigationConstant";
import NavigationService from "@navigation/navigationService";
import * as Strings from "@constants/strings";
import * as ModelClass from "@utils/dataModel/modelClass";
import * as Utility from "@utils/dataModel/utility";
import ScreenContainer from "@components/Containers/ScreenContainer";
import ScreenLayout from "@layouts/ScreenLayout";
import HeaderLayout from "@layouts/HeaderLayout";
import Typo from "@components/Text";
const { width, height } = Dimensions.get("window");
class EditAmount extends Component {
    static navigationOptions = { title: "", header: null };
    static propTypes = {
        withTouch: PropTypes.bool,
        title: PropTypes.string,
        description: PropTypes.string,
        footer: PropTypes.string,
        amount: PropTypes.string,
    };

    static defaultProps = {
        applyBackspaceTint: true,
        decimal: false,
        size: 0,
        withTouch: true,
    };

    constructor(props) {
        super(props);

        this.state = {
            amount: "000",
            lengthError: false,
            errorMessage: "",
            showSortAndFilterModal: false,
            showQuickActions: false,
            overlayType: "gradient",
        };

        console.log("loaded Edit Screen");
    }

    async componentDidMount() {
        this.focusSubscription = this.props.navigation.addListener("focus", () => {
            console.log("ModelClass.GOAL_DATA.editAmount", ModelClass.GOAL_DATA.editAmount);
            console.log(
                "ModelClass.GOAL_DATA.editAmount1",
                ModelClass.GOAL_DATA.editAmount.toString().replace(/\./g, "")
            );
            this._virtualKeyboard.setValue(
                ModelClass.GOAL_DATA.editAmount.toString().replace(/\./g, "")
            );
            this.setState({
                amount: ModelClass.GOAL_DATA.editAmount.toString().replace(/\./g, ""),
            });
        });
        this.blurSubscription = this.props.navigation.addListener("blur", () => {});
    }

    componentWillUnmount() {
        this.focusSubscription();
        this.blurSubscription();
    }

    changeText(val) {
        //if (val.length === 6) {
        //this.props.onDonePress(val);
        // this.setState({ amount: val });
        //} else {
        let amt = val.replace(/^0+/, "");

        if (amt.length === 0) {
            this.setState({ amount: "000" });
        } else {
            if (parseInt(amt) > 0) {
                this.setState({ amount: amt });
            } else {
                this.setState({ amount: "000" });
            }
        }

        if (parseInt(val) > 0) {
            this._virtualKeyboard.setValue(val);
        } else {
            this._virtualKeyboard.setValue("");
        }

        //}
    }
    async doneClick(amount) {
        let val = Utility.formateAmountZero(this.state.amount);
        if (val === null || val === "undefined" || val.length === 0) {
            val = this.state.amount;
        }

        if (val >= 10.0 && val <= 999999.99) {
            ModelClass.GOAL_DATA.editAmount = val;
            NavigationService.navigate(navigationConstant.CREATE_GOALS_FRIEND_LIST);
        } else {
            if (val < 10.0) {
                this.setState({
                    lengthError: true,
                    errorMessage: "Please enter a minimum goal value of RM10.00.",
                });
            } else {
                this.setState({
                    lengthError: true,
                    errorMessage: "Maximum goal value is RM 999,999.99",
                });
            }
        }
    }

    render() {
        const { showSortAndFilterModal, showQuickActions, overlayType } = this.state;
        return (
            <React.Fragment>
                <ScreenContainer
                    backgroundType="color"
                    showOverlay={showQuickActions || showSortAndFilterModal}
                    overlayType={overlayType}
                >
                    <HeaderPageIndicator
                        showBack={true}
                        showClose={true}
                        showIndicator={false}
                        showTitle={false}
                        showBackIndicator={false}
                        pageTitle={""}
                        numberOfPages={1}
                        currentPage={1}
                        navigation={this.props.navigation}
                        noPop={true}
                        noClose={true}
                        moduleName={navigationConstant.WALLET_MODULE}
                        routeName={navigationConstant.QRPAY_MAIN}
                        onBackPress={() => {
                            NavigationService.navigateToModule(
                                navigationConstant.GOALS_MODULE,
                                navigationConstant.CREATE_GOALS_FRIEND_LIST
                            );
                        }}
                        onClosePress={() => {
                            NavigationService.navigateToModule(
                                navigationConstant.GOALS_MODULE,
                                navigationConstant.CREATE_GOALS_FRIEND_LIST
                            );
                        }}
                    />
                    <View style={styles.block}>
                        <View style={styles.titleContainer}>
                            <Text style={[styles.titleText, commonStyle.font]}>
                                {ModelClass.GOAL_DATA.editName}
                            </Text>
                        </View>
                        <View style={styles.descriptionContainer}>
                            <Text style={[styles.descriptionText, commonStyle.font]}>
                                How much are you planning to save?{" "}
                            </Text>
                        </View>
                        <View style={styles.inputContainer}>
                            <Text
                                style={[styles.codeText, commonStyle.font]}
                                accessible={true}
                                testID={"txtByClickingNext"}
                                accessibilityLabel={"txtByClickingNext"}
                            >
                                {Strings.CURRENCY_CODE}
                            </Text>
                            <HighlightAmount
                                highlightStyle={styles.curText}
                                searchWords={[this.state.amount.toString()]}
                                style={[{ marginLeft: 10 }, styles.curText, commonStyle.font]}
                                textToHighlight={this.state.amount.toString()}
                                testID={"inputAmount"}
                                accessibilityLabel={"inputAmount"}
                            />
                        </View>
                    </View>
                    <View style={styles.line} />
                    {this.state.lengthError == true ? (
                        <ErrorMessage
                            onClose={() => {
                                this.setState({ lengthError: false });
                            }}
                            title="Enter Goal Amount"
                            description={this.state.errorMessage}
                            showOk={true}
                            onOkPress={() => {
                                this.setState({ lengthError: false });
                            }}
                        />
                    ) : null}
                    <VirtualKeyboard
                        ref={(vk) => (this._virtualKeyboard = vk)}
                        color="black"
                        pressMode="string"
                        decimal={true}
                        validate={true}
                        onPress={(val) => this.changeText(val)}
                        onDonePress={(val) => this.doneClick(val)}
                        size={8}
                    />
                </ScreenContainer>
            </React.Fragment>
        );
    }
}

const styles = StyleSheet.create({
    container: { backgroundColor: "transparent", flex: 1, width: "100%" },
    block: { flexDirection: "column" },
    image: {
        width: 50,
        height: 50,
        borderTopRightRadius: 10,
        borderTopLeftRadius: 10,
    },
    titleContainer: { marginTop: 30, marginLeft: 24, justifyContent: "flex-start" },
    descriptionContainer: {
        marginLeft: 24,
        justifyContent: "flex-start",
        marginRight: 50,
        marginTop: 10,
    },
    footerContainer: { marginTop: 40, marginLeft: 60, justifyContent: "flex-start", flex: 2 },
    touchContainer: { marginTop: 40, marginRight: 10, justifyContent: "flex-end", flex: 1 },
    titleText: {
        fontFamily: "Montserrat",
        fontSize: 14,
        fontWeight: "600",
        fontStyle: "normal",
        lineHeight: 18,
        letterSpacing: 0,
        color: "#000000",
    },
    descriptionText: {
        fontFamily: "Montserrat",
        fontSize: 20,
        fontWeight: "300",
        fontStyle: "normal",
        lineHeight: 28,
        letterSpacing: 0,
        color: "#000000",
    },
    footerText: { textDecorationLine: "underline", fontSize: 14 },
    inputContainer: {
        flexDirection: "row",
        height: 50,
        width: "100%",
        marginTop: 30,
        marginLeft: 24,
        alignItems: "center",
    },
    curText: {
        fontFamily: "montserrat",
        fontSize: 20,
        fontWeight: "600",
        fontStyle: "normal",
        lineHeight: 32,
        letterSpacing: 0,
        color: "#000000",
    },
    codeText: {
        fontFamily: "montserrat",
        fontSize: 20,
        fontWeight: "600",
        fontStyle: "normal",
        lineHeight: 32,
        letterSpacing: 0,
        color: "#cfcfcf",
    },
    line: {
        marginTop: 10,
        width: width - 48,
        marginLeft: 24,
        marginRight: 24,
        borderWidth: 1,
        borderColor: "#cccccc",
    },
});

export default EditAmount;
