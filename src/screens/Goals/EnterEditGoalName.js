/* eslint-disable react-native/no-color-literals */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/jsx-no-bind */
"use strict";

import React, { Component } from "react";
import { View, StyleSheet, Text, Keyboard, Dimensions } from "react-native";
import commonStyle from "@styles/main";
import { ErrorMessage, HeaderPageIndicator, Input, ButtonRoundLong } from "@components/Common";
import PropTypes from "prop-types";
import * as navigationConstant from "@navigation/navigationConstant";
import NavigationService from "@navigation/navigationService";
import * as Strings from "@constants/strings";
const { width } = Dimensions.get("window");
import * as ModelClass from "@utils/dataModel/modelClass";
import ScreenContainer from "@components/Containers/ScreenContainer";
import { renameGoalAPI } from "@services/index";
import * as Utility from "@utils/dataModel/utility";
import NetInfo from "@react-native-community/netinfo";

class EnterEditGoalName extends Component {
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
            value: "",
            lengthError: false,
            showSortAndFilterModal: false,
            showQuickActions: false,
            overlayType: "gradient",
        };

        console.log("loaded Edit Screen");
    }

    async componentDidMount() {
        this.focusSubscription = this.props.navigation.addListener("focus", () => {
            if (
                ModelClass.GOAL_DATA.goalName != undefined &&
                ModelClass.GOAL_DATA.goalName.length > 2
            ) {
                this.setState({ value: ModelClass.GOAL_DATA.goalName });
            }
        });
        this.blurSubscription = this.props.navigation.addListener("blur", () => {});
    }

    componentWillUnmount() {
        this.focusSubscription();
        this.blurSubscription();
    }

    changeText(val) {}
    async doneClick(val) {}

    async onChangeText(text) {
        this.setState({ value: text });
    }
    async onNextPress() {
        let check = this.state.value.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, "");
        check = check.replace(/\s/g, "");
        if (this.state.value && check.length >= 2) {
            //let val = this.state.value.replace(/[^\w\s]/gi, "");
            let val = this.state.value.replace(/[`~!@#$%^&_|+\=?;:'".<>\{\}\[\]\\\/]/gi, ""); //exclude , - ( )
            ModelClass.GOAL_DATA.goalName = val;
            ModelClass.GOAL_DATA.goalUpdatedName = val;
            Keyboard.dismiss();
            this._renameGoalAPI(val);
        } else {
            this.setState({ lengthError: true });
        }
    }

    _renameGoalAPI = async (val) => {
        console.log("_getGoalDetailsData==> ");
        ModelClass.TABUNG_GOALS_DATA.goalDetailsCalled = true;

        this.setState({ loader: true });

        let subUrl = "/goal/editName";
        let params = {};

        try {
            params = JSON.stringify({
                goalId: ModelClass.TABUNG_GOALS_DATA.goalSelectedID,
                name: val,
            });
            NetInfo.isConnected.fetch().then(async (isConnected) => {
                if (isConnected) {
                    renameGoalAPI(subUrl, JSON.parse(params))
                        .then((response) => {
                            let responseObject = response.data;
                            console.log(subUrl + " RESPONSE RECEIVED: ", response.data);
                            ModelClass.TABUNG_GOALS_DATA.acctDetailsObj = responseObject.result;
                            if (
                                responseObject !== null &&
                                responseObject !== undefined &&
                                responseObject.code !== null &&
                                responseObject.code !== undefined &&
                                responseObject.code === 0
                            ) {
                                ModelClass.TABUNG_GOALS_DATA.callDetails = false;
                                ModelClass.TABUNG_GOALS_DATA.pendingDataCalled = false;
                                ModelClass.TABUNG_GOALS_DATA.goalDataList = [];
                                this.props.navigation.pop();
                            } else if (
                                responseObject !== null &&
                                responseObject !== undefined &&
                                responseObject.message !== null &&
                                responseObject.message !== undefined &&
                                responseObject.message === "failed"
                            ) {
                                this.setState({ loader: false });
                            } else {
                                this.setState({ loader: false });
                            }
                        })
                        .catch((error) => {
                            console.log(subUrl + "  ERROR==> ", error);
                            this.setState({ loader: false });
                        });
                } else {
                    this.setState({ loader: false });
                }
            });
        } catch (e) {
            this.setState({ loader: false });
            console.log(subUrl + "  catch ERROR==> " + e);
        }
    };

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
                        showClose={false}
                        showIndicator={ModelClass.GOAL_DATA.editSummary === false}
                        showTitle={false}
                        showBackIndicator={false}
                        pageTitle={""}
                        numberOfPages={0}
                        currentPage={0}
                        navigation={this.props.navigation}
                        noPop={true}
                        noClose={true}
                        moduleName={navigationConstant.WALLET_MODULE}
                        routeName={navigationConstant.QRPAY_MAIN}
                        onBackPress={() => {
                            this.props.navigation.pop();
                        }}
                        onClosePress={() => {
                            this.props.navigation.pop();
                        }}
                    />
                    <View style={styles.block}>
                        <View style={styles.titleContainer}>
                            <Text style={[styles.titleText, commonStyle.font]}>Tabung</Text>
                        </View>
                        <View style={styles.descriptionContainer}>
                            <Text style={[styles.descriptionText, commonStyle.font]}>
                                What are you saving for?{" "}
                            </Text>
                        </View>
                        <View style={styles.inputContainer}>
                            <Input
                                accessible={true}
                                testID={"txtWalEnter"}
                                accessibilityLabel={"txtWalEnter"}
                                autoFocus={true}
                                onChangeText={this.onChangeText.bind(this)}
                                returnKeyType="next"
                                onSubmitEditing={this.onNextPress}
                                placeholder={"Enter Goal Name"}
                                secureTextEntry={false}
                                maxLength={30}
                                style={{
                                    fontFamily: "montserrat",
                                    fontSize: 20,
                                    fontWeight: "600",
                                    fontStyle: "normal",
                                    lineHeight: 32,
                                    letterSpacing: 0,
                                    color: "#000000",
                                    height: 50,
                                    width: "90%",
                                }}
                                value={this.state.value}
                            />
                        </View>
                    </View>
                    <View
                        style={{
                            width: width - 60,
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: 10,
                            marginTop: 10,
                            marginLeft: 30,
                            marginRight: 30,
                            bottom: 20,
                            position: "absolute",
                            alignItems: "center",
                            flexDirection: "row",
                        }}
                    >
                        <ButtonRoundLong
                            headerText="Rename"
                            isCenter={true}
                            isLong={true}
                            backgroundColor={"#f8d31c"}
                            buttonStyle={{
                                alignContent: "center",
                                justifyContent: "center",
                                height: 55,
                                width: 260,
                                borderRadius: 25,
                            }}
                            textStyle={[
                                {
                                    fontFamily: "montserrat",
                                    fontSize: 14,
                                    fontWeight: "normal",
                                    fontStyle: "normal",
                                    lineHeight: 20,
                                    letterSpacing: 0,
                                    color: "#000000",
                                },
                                commonStyle.font,
                            ]}
                            onPress={async () => {
                                this.onNextPress();
                            }}
                        />
                    </View>
                    {this.state.lengthError == true ? (
                        <ErrorMessage
                            onClose={() => {
                                this.setState({ lengthError: false });
                            }}
                            title={Strings.APP_NAME_ALERTS}
                            description="Please enter a valid goal name"
                            showOk={true}
                            onOkPress={() => {
                                this.setState({ lengthError: false });
                            }}
                        />
                    ) : null}
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
    titleContainer: { marginTop: 30, marginLeft: "5%", justifyContent: "flex-start" },
    descriptionContainer: {
        marginLeft: "5%",
        justifyContent: "flex-start",
        marginRight: 50,
        marginTop: 10,
    },
    footerContainer: { marginTop: 40, marginLeft: 30, justifyContent: "flex-start", flex: 2 },
    touchContainer: { flex: 1, justifyContent: "flex-end", marginRight: 10, marginTop: 40 },
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
        marginLeft: "5%",
        alignItems: "center",
    },
});

export default EnterEditGoalName;
