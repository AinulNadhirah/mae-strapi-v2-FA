import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, ScrollView, TextInput } from "react-native";
import DeviceInfo from "react-native-device-info";

import {
    ONE_TAP_AUTH_MODULE,
    DASHBOARD,
    TAB_NAVIGATOR,
    COMMON_MODULE,
    RSA_DENY_SCREEN,
    JOMPAY_MODULE,
    JOMPAY_ACKNOWLEDGE_SCREEN,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import ChallengeQuestion from "@components/RSA/ChallengeQuestion";
import Typo from "@components/Text";
import { showErrorToast, showSuccessToast } from "@components/Toast";
import TransferImageAndDetails from "@components/Transfers/TransferImageAndDetails";

import { withModelContext } from "@context";

import { addJompayFav } from "@services";
import { logEvent } from "@services/analytics";

import { MEDIUM_GREY, YELLOW, DISABLED, DISABLED_TEXT, BLACK, ROYAL_BLUE } from "@constants/colors";
import {
    ADDED_TO_FAVOURITES,
    ADD_AS_FAVOURITES,
    SETTINGS_ENTER_NAME,
    ADD_TO_FAVOURITES,
    WE_FACING_SOME_ISSUE,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    FA_ADD_FAV,
    FA_FORM_COMPLETE,
    FA_ADD_FAV_SUCCESSFUL,
} from "@constants/strings";

import {
    getDeviceRSAInformation,
    addSlashesForBreakableSpecialCharacter,
} from "@utils/dataModel/utility";

import Styles from "@styles/Wallet/TransferEnterAmountStyle";

import Assets from "@assets";

class AddToFavouritesScreen extends Component {
    static navigationOptions = { title: "", header: null };

    constructor(props) {
        super(props);
        console.log("AddToFavouritesScreen---", JSON.stringify(props));
        this.state = {
            recipientNickName: this.props.route.params.billerInfo.billerName,
            disableAddButton: false,
            // RSA State Objects
            isRSARequired: false,
            challengeQuestion: "",
            challengeRequest: {},
            isRSALoader: true,
            RSACount: 0,
            RSAError: false,
            showLocalError: false,
            showLocalErrorMessage: "",

            image: {
                image: "",
                imageName: " ",
                imageUrl: "",
                shortName: "",
            },
            accountName: "",
        };
    }
    componentDidMount() {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_ADD_FAV,
        });
    }

    componentWillUnmount() {}

    showLoader = (visible) => {
        this.props.updateModel({
            ui: {
                showLoader: visible,
            },
        });
    };

    _onConfirmClick = () => {
        console.log("_onConfirmClick");
        this.showLoader(true);
        this.payBillAddToFavourite();
    };

    onChallengeSnackClosePress = () => {
        this.setState({ RSAError: false });
    };

    onChallengeQuestionSubmitPress = (answer) => {
        const {
            challengeRequest: { challenge },
        } = this.state;

        console.log("button disable is", this.state.isSubmitDisable);

        this.setState(
            {
                challengeRequest: {
                    ...this.state.challengeRequest,
                    challenge: {
                        ...challenge,
                        answer,
                    },
                },
                isRSALoader: true,
                RSAError: false,
                isSubmitDisable: true,
            },
            () => {
                this.paybillAddFav(this.state.challengeRequest);
            }
        );
    };

    payBillAddToFavourite = () => {
        console.log("payBillAddToFavourite");

        const deviceInfo = this.props.getModel("device");
        const mobileSDK = getDeviceRSAInformation(deviceInfo.deviceInformation, DeviceInfo);
        const { amount, billRef1, billRef2, effectiveDate, isFav } =
            this.props.route.params.extraInfo;
        const {
            billerAccount,
            billerCode,
            billerCodeName,
            billerName,
            msic,
            nbpsRef,
            payeeCode,
            routingCode,
            rrnDynamic,
            rtnRequired,
            sig,
            systemRef,
            timestamp,
            validateSig,
        } = this.props.route.params.billerInfo;
        const { code, number, type } = this.props.route.params.selectedAccount;
        const { transactionRefNumber } = this.props.route.params.transferResponse;

        const params = {
            amount: amount,
            billRef1: billRef1,
            billRef2: addSlashesForBreakableSpecialCharacter(billRef2),
            billerAccount: billerAccount,
            billerCode: billerCode,
            billerCodeName: billerCodeName,
            billerName: billerName,
            effectiveDate: effectiveDate, // notes: today - "000000", schedulec - "YYYYMMDD"
            favourite: isFav,
            fromAcctCode: code,
            fromAcctNo: number,
            fromAcctType: type,
            msic: msic,
            nbpsRef: nbpsRef,
            payeeCode: payeeCode,
            routingCode: routingCode,
            rrnDynamic: rrnDynamic,
            rtnRequired: rtnRequired,
            sig: sig,
            systemRef: systemRef,
            // tac: token,
            timestamp: timestamp,
            toAcctNo: billerAccount,
            validateSig: validateSig,
            favoriteName: this.state.recipientNickName,
            mobileSDKData: mobileSDK, // Required For RSA
            transactionRefId: transactionRefNumber,
            paymentType: "ADD_FAVORITE",
        };
        this.setState({ challengeRequest: params });
        this.paybillAddFav(params);
        this.setState({ disableAddButton: true });
    };

    paybillAddFav = (params) => {
        console.log("paybillAddFav:", params);
        addJompayFav(params)
            .then((response) => {
                let responseObject = response.data;
                console.log(" addJompayFav response ==> ", responseObject);
                let errorObj = responseObject;

                if (responseObject.statusCode && responseObject.statusCode === "0") {
                    this.goBack(true, this.state.recipientNickName + " " + ADDED_TO_FAVOURITES);
                } else if (errorObj) {
                    const errorMsg = errorObj.additionalStatusDescription;

                    this.goBack(false, errorMsg);
                }

                this.showLoader(false);
            })
            .catch((data) => {
                console.log("addJompayFav error", data);
                if (data.status == 428) {
                    this.setState((prevState) => ({
                        challengeRequest: {
                            ...prevState.challengeRequest,
                            challenge: data.error.challenge,
                        },
                        loader: false,
                        isRSARequired: true,
                        isRSALoader: false,
                        challengeQuestion: data.error.challenge.questionText,
                        RSACount: prevState.RSACount + 1,
                        RSAError: prevState.RSACount > 0,
                    }));
                } else if (data.status == 423) {
                    console.log("addJompayFav error23: ", data.error);
                    this.setState(
                        {
                            loader: false,
                            tacParams: null,
                            transferAPIParams: null,
                            isRSALoader: false,
                            RSAError: false,
                            isSubmitDisable: true,
                            isRSARequired: false,
                        },
                        () => {
                            console.log("addJompayFav error23 nav: ", data.error);
                            const reason = data.error.challenge?.errorMessage;
                            const loggedOutDateTime = data.error.challenge?.serverDate;
                            const lockedOutDateTime = data.error.challenge?.serverDate;
                            this.props.navigation.navigate(ONE_TAP_AUTH_MODULE, {
                                screen: "Locked",
                                params: {
                                    reason,
                                    loggedOutDateTime,
                                    lockedOutDateTime,
                                },
                            });
                        }
                    );
                } else if (data.status == 422) {
                    // RSA deny handler
                    let errorObj = data.error;

                    const { statusDescription, additionalStatusDescription, serverDate } = errorObj;

                    let rsaDenyScreenParams = {
                        statusDescription,
                        additionalStatusDescription: additionalStatusDescription,
                        serverDate,
                        nextParams: {
                            screen: DASHBOARD,
                            params: { refresh: false },
                        },
                        nextModule: TAB_NAVIGATOR,
                        nextScreen: "Tab",
                    };

                    if (this.prevSelectedAccount) {
                        rsaDenyScreenParams.nextParams = this.prevSelectedAccount;
                        rsaDenyScreenParams.nextModule = this.fromModule;
                        rsaDenyScreenParams.nextScreen = this.fromScreen;
                    }

                    this.props.navigation.navigate(COMMON_MODULE, {
                        screen: RSA_DENY_SCREEN,
                        params: rsaDenyScreenParams,
                    });
                } else if (data.status == 500) {
                    // need to harcode as command error message. Backend cannot create that. Dont know why
                    this.goBack(false, WE_FACING_SOME_ISSUE);
                } else {
                    this.goBack(false, data.message);
                }

                this.showLoader(false);
            });
    };

    goBack = (isSuccess, msg) => {
        if (isSuccess) {
            showSuccessToast({ message: msg });
            logEvent(FA_FORM_COMPLETE, {
                [FA_SCREEN_NAME]: FA_ADD_FAV_SUCCESSFUL,
            });

            logEvent(FA_VIEW_SCREEN, {
                [FA_SCREEN_NAME]: FA_ADD_FAV_SUCCESSFUL,
            });
        } else {
            showErrorToast({ message: msg });

            // why detect "exist" keyword? Because FOR NOW, front end dont know how to compare "record exist" error, and other type of error.
            const isRecordExist = msg.indexOf("exist") > -1;

            // this is for to hide add fav btn if record already exist
            isSuccess = isRecordExist;
        }
        this.props.navigation.navigate(JOMPAY_MODULE, {
            screen: JOMPAY_ACKNOWLEDGE_SCREEN,
            params: { ...this.props.route.params, addFavSuccess: isSuccess },
        });
    };

    getPayBillAcctUI = () => {
        return (
            <View style={[localStyle.bankDetailsView, localStyle.bankDetailsFirstChild]}>
                <View style={localStyle.viewRow}>
                    <View style={localStyle.viewRowLeftItem}>
                        <Typo
                            fontSize={14}
                            fontWeight="400"
                            fontStyle="normal"
                            letterSpacing={0}
                            lineHeight={18}
                            textAlign="left"
                            color={BLACK}
                            text={"Biller ID"}
                        />
                    </View>
                    <View style={localStyle.viewRowRightItem}>
                        <Typo
                            fontSize={14}
                            fontWeight="bold"
                            fontStyle="normal"
                            letterSpacing={0}
                            lineHeight={18}
                            textAlign="right"
                            color={BLACK}
                            text={this.props.route.params.billerInfo.billerCodeName}
                        />
                    </View>
                </View>
            </View>
        );
    };

    getPayBillRefUI = () => {
        return (
            <View style={localStyle.bankDetailsView}>
                <View style={localStyle.viewRow}>
                    <View style={localStyle.viewRowLeftItem}>
                        <Typo
                            fontSize={14}
                            fontWeight="400"
                            fontStyle="normal"
                            letterSpacing={0}
                            lineHeight={18}
                            textAlign="left"
                            color={BLACK}
                            text={"Reference 1"}
                        />
                    </View>
                    <View style={localStyle.viewRowRightItem}>
                        <Typo
                            fontSize={14}
                            fontWeight="bold"
                            fontStyle="normal"
                            letterSpacing={0}
                            lineHeight={18}
                            textAlign="right"
                            color={BLACK}
                            text={this.props.route.params.extraInfo.billRef1}
                        />
                    </View>
                </View>
            </View>
        );
    };

    _onTextInputValueChanged = (text) => {
        let disableAddButton = false;
        if (text === "") {
            disableAddButton = true;
        }
        this.setState({
            showLocalError: false,
            recipientNickName: text,
            disableAddButton: disableAddButton,
        });
    };

    _proceedToNextScreen = () => {};

    _onBackPress = () => {
        this.props.navigation.goBack();
    };

    render() {
        return (
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerCenterElement={
                                <Typo
                                    fontSize={16}
                                    fontWeight="bold"
                                    lineHeight={19}
                                    text={ADD_AS_FAVOURITES}
                                />
                            }
                            headerLeftElement={<HeaderBackButton onPress={this._onBackPress} />}
                        />
                    }
                    useSafeArea
                    paddingHorizontal={0}
                    paddingBottom={0}
                >
                    <React.Fragment>
                        <ScrollView>
                            <View style={Styles.containerAddTransfer}>
                                <View style={Styles.block}>
                                    <View style={Styles.favLogoItem}>
                                        <TransferImageAndDetails
                                            title={""}
                                            image={{ type: "local", source: Assets.jompayLogo }}
                                        ></TransferImageAndDetails>
                                    </View>

                                    <View style={Styles.favNameItem}>
                                        <TextInput
                                            style={localStyle.txtInput}
                                            maxLength={20}
                                            onChangeText={this._onTextInputValueChanged}
                                            value={this.state.recipientNickName.substring(0, 20)}
                                            isValidate={this.state.showLocalError}
                                            errorMessage={this.state.showLocalErrorMessage}
                                            onSubmitEditing={this._proceedToNextScreen}
                                            clearButtonMode="while-editing"
                                            returnKeyType="done"
                                            placeholder={SETTINGS_ENTER_NAME}
                                        />
                                    </View>

                                    {this.getPayBillAcctUI()}

                                    {this.getPayBillRefUI()}
                                </View>

                                <ChallengeQuestion
                                    loader={this.state.isRSALoader}
                                    display={this.state.isRSARequired}
                                    displyError={this.state.RSAError}
                                    questionText={this.state.challengeQuestion}
                                    onSubmitPress={this.onChallengeQuestionSubmitPress}
                                    onSnackClosePress={this.onChallengeSnackClosePress}
                                />
                            </View>
                        </ScrollView>

                        <FixedActionContainer>
                            <ActionButton
                                disabled={this.state.disableAddButton}
                                fullWidth
                                borderRadius={25}
                                onPress={this._onConfirmClick}
                                backgroundColor={this.state.disableAddButton ? DISABLED : YELLOW}
                                componentCenter={
                                    <Typo
                                        color={this.state.disableAddButton ? DISABLED_TEXT : BLACK}
                                        text={ADD_TO_FAVOURITES}
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={18}
                                    />
                                }
                            />
                        </FixedActionContainer>
                    </React.Fragment>
                </ScreenLayout>
            </ScreenContainer>
        );
    }
}

AddToFavouritesScreen.propTypes = {
    getModel: PropTypes.func,
    navigation: PropTypes.object,
    route: PropTypes.object,
    updateModel: PropTypes.func,
};

export default withModelContext(AddToFavouritesScreen);

const localStyle = {
    txtInput: {
        color: ROYAL_BLUE,
        fontSize: 23,
        fontStyle: "normal",
        fontWeight: "bold",
        letterSpacing: 0,
        lineHeight: 31,
        fontFamily: "montserrat",
        width: "100%",
    },
    bankDetailsFirstChild: {
        marginTop: 31,
    },
    bankDetailsView: {
        flexDirection: "row",
        // justifyContent: "flex-start",
        marginTop: 14,
        // borderWidth: 1,
        // borderColor: "red",
    },
    viewRow: {
        alignContent: "flex-start",
        alignItems: "flex-start",
        flexDirection: "row",
        justifyContent: "space-between",
        marginLeft: 0,
        width: "100%",
        // borderWidth: 1,
        // borderColor: "green",
    },
    viewRowLeftItem: {
        // alignContent: "flex-start",
        // alignItems: "flex-start",
        // flexDirection: "row",
        // justifyContent: "flex-start",
        marginLeft: 0,
        marginTop: 0,
        // borderWidth: 1,
        // borderColor: "blue",
    },
    viewRowRightItem: {
        // alignContent: "flex-end",
        // alignItems: "flex-end",
        // flexDirection: "column",
        // justifyContent: "space-between",
        flex: 1,
        marginLeft: 5,
        marginTop: 0,
        // paddingLeft: 5,
        // borderWidth: 1,
        // borderColor: "black",
        // backgroundColor: "green"
    },
};
