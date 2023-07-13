import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, ScrollView, TextInput, Dimensions } from "react-native";
import DeviceInfo from "react-native-device-info";

import * as navigationConstant from "@navigation/navigationConstant";

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

import { payBillAddFav } from "@services";
import { logEvent } from "@services/analytics";

import { MEDIUM_GREY, YELLOW, DISABLED, DISABLED_TEXT, BLACK, ROYAL_BLUE } from "@constants/colors";
import {
    ADDED_TO_FAVOURITES,
    ADD_AS_FAVOURITES,
    ADD_TO_FAVOURITES,
    BILLER,
    FA_ADD_FAV,
    FA_ADD_FAV_SUCCESSFUL,
    FA_FORM_COMPLETE,
    FA_SCREEN_NAME,
    FA_VIEW_SCREEN,
    SETTINGS_ENTER_NAME,
    WE_FACING_SOME_ISSUE,
} from "@constants/strings";

import * as Utility from "@utils/dataModel/utility";

import Styles from "@styles/Wallet/TransferEnterAmountStyle";

const screenWidth = Dimensions.get("window").width;
const rightTextWidth = (screenWidth * 45) / 100;

class AddToFavouritesScreen extends Component {
    static navigationOptions = { title: "", header: null };

    constructor(props) {
        super(props);
        console.log("AddToFavouritesScreen:", props.route.params);
        this.prevSelectedAccount = props.route.params.transferParams.prevSelectedAccount;
        this.fromModule = props.route.params.transferParams.fromModule;
        this.fromScreen = props.route.params.transferParams.fromScreen;
        this.state = {
            recipientNickName: "",
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
            logoImage: props.route.params.transferParams?.billerInfo.imageUrl,

            image: {
                image: "",
                imageName: " ",
                imageUrl: "",
                shortName: "",
            },
        };
    }

    componentDidMount() {
        console.log("[AddToFavouritesScreen] >> [componentDidMount]");
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_ADD_FAV,
        });

        this._updateDataInScreen();
    }

    componentWillUnmount() {}

    showLoader = (visible) => {
        this.props.updateModel({
            ui: {
                showLoader: visible,
            },
        });
    };

    _updateDataInScreen = () => {
        console.log("[AddToFavouritesScreen] >> [_updateDataInScreen]");

        // TODO:
        // screen only need LOGO, NAME to edit, transfer detail (requiredField)
        const params = this.props?.route?.params ?? {};
        const zakatFlow = params?.zakatFlow ?? false;

        let billAcctNo = "";
        // let billRefNo = "";

        params.transferParams.requiredFields.forEach(function (field) {
            if (field.fieldName == "bilAcct") {
                billAcctNo = field.fieldValue;
            } else if (field.fieldName == "billRef") {
                // billRefNo = field.fieldValue;
            } else if (field.fieldName == "billRef2") {
                // billRefNo = field.fieldValue; // TODO: double confirm with backend, billRefNo or billRefNo2
            }
        });

        this.setState({
            image: params.transferParams.billerInfo.imageUrl,
            formattedToAccount: billAcctNo,
            accountName: params.transferParams.billerInfo.fullName,
            recipientNickName: zakatFlow
                ? params?.transferParams?.zakatType ?? ""
                : params?.transferParams?.billerInfo?.fullName,
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

        let billAcctNo = "";
        let billRefNo = "";
        this.props.route.params.transferParams.requiredFields.forEach(function (field) {
            if (field.fieldName == "bilAcct") {
                billAcctNo = field.fieldValue;
            } else if (field.fieldName == "billRef") {
                billRefNo = field.fieldValue;
            } else if (field.fieldName == "billRef2") {
                billRefNo = field.fieldValue; // TODO: double confirm with backend, billRefNo or billRefNo2
            }
        });

        // const { deviceInformation, deviceId } = this.props.getModel("device");
        const deviceInfo = this.props.getModel("device");
        const mobileSDK = Utility.getDeviceRSAInformation(deviceInfo.deviceInformation, DeviceInfo);
        let params = {
            pan: this.props.route.params.s2uSignRespone?.PAN ?? "", //
            accountName: this.state.recipientNickName,
            payeeCorpCode: this.props.route.params.transferParams.billerInfo.payeeCode,
            refId: billAcctNo,
            refId2: billRefNo,
            trxRefNo: this.props.route.params.transferResponse.transactionRefNumber,
            mobileSDKData: mobileSDK,
            type: "ADD_FAVORITE",
            payeeName: this.props.route.params.transferParams.billerInfo.shortName,

            /*

             type: this.props.route.params.isFav ? "FAVORITE" : "OPEN",

            */
        };
        this.setState({ challengeRequest: params });
        this.paybillAddFav(params);
        this.setState({ disableAddButton: true });
    };

    paybillAddFav = (params) => {
        console.log("paybillAddFav:", params);
        payBillAddFav(params)
            .then((response) => {
                let responseObject = response.data.Msg;
                console.log("paybillAddFav response ==> ", responseObject);

                if (responseObject && responseObject.MsgHdr) {
                    const msgHdr = responseObject.MsgHdr;
                    const statusDesc = msgHdr.StatusDesc;
                    const errorMsg = msgHdr.errorMsg;

                    if (statusDesc && statusDesc.toLowerCase() == "success") {
                        this.goBack(true, this.state.recipientNickName + " " + ADDED_TO_FAVOURITES);
                    } else if (statusDesc) {
                        this.goBack(false, statusDesc);
                    } else if (errorMsg) {
                        this.goBack(false, errorMsg);
                    } else {
                        this.goBack(false, "error");
                    }
                }

                this.showLoader(false);
            })
            .catch((data) => {
                console.log("paybillAddFav error", data);
                this.showLoader(false);

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
                            const reason = data.error.challenge?.errorMessage;
                            const loggedOutDateTime = data.error.challenge?.serverDate;
                            const lockedOutDateTime = data.error.challenge?.serverDate;
                            this.props.navigation.navigate(navigationConstant.ONE_TAP_AUTH_MODULE, {
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
                            screen: navigationConstant.DASHBOARD,
                            params: { refresh: false },
                        },
                        nextModule: navigationConstant.TAB_NAVIGATOR,
                        nextScreen: "Tab",
                    };

                    if (this.prevSelectedAccount) {
                        rsaDenyScreenParams.nextParams = this.prevSelectedAccount;
                        rsaDenyScreenParams.nextModule = this.fromModule;
                        rsaDenyScreenParams.nextScreen = this.fromScreen;
                    }

                    this.props.navigation.navigate(navigationConstant.COMMON_MODULE, {
                        screen: navigationConstant.RSA_DENY_SCREEN,
                        params: rsaDenyScreenParams,
                    });
                } else if (data.status == 500) {
                    // need to harcode as command error message. Backend cannot create that. Dont know why
                    this.goBack(false, WE_FACING_SOME_ISSUE);
                } else {
                    this.goBack(false, data.message);
                }
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
        this.props.navigation.navigate(navigationConstant.PAYBILLS_MODULE, {
            screen: navigationConstant.PAYBILLS_ACKNOWLEDGE_SCREEN,
            params: { ...this.props.route.params, addFavSuccess: isSuccess },
        });
    };

    getPayBillAcctUI = () => {
        let billRefNo = "";
        this.props.route.params.transferParams.requiredFields.forEach(function (field) {
            if (field.fieldName == "billRef") {
                billRefNo = field.fieldValue;
            } else if (field.fieldName == "billRef2") {
                billRefNo = field.fieldValue; // TODO: double confirm with backend, billRefNo or billRefNo2
            }
        });

        return billRefNo == "" ? null : (
            <View style={Styles.bankDetailsView}>
                <View style={Styles.viewRow}>
                    <View style={Styles.viewRowLeftItem}>
                        <Typo
                            fontSize={14}
                            fontWeight="400"
                            fontStyle="normal"
                            letterSpacing={0}
                            lineHeight={18}
                            textAlign="left"
                            color={BLACK}
                            text={BILLER}
                        />
                    </View>
                    <View style={[Styles.viewRowRightItem, { maxWidth: rightTextWidth }]}>
                        <Typo
                            fontSize={14}
                            fontWeight="bold"
                            fontStyle="normal"
                            letterSpacing={0}
                            lineHeight={18}
                            textAlign="right"
                            color={BLACK}
                            text={this.props.route.params.transferParams.billerInfo.fullName}
                        />
                    </View>
                </View>
            </View>
        );
    };

    getPayBillRefUI = () => {
        let billAcctNo = "";
        this.props.route.params.transferParams.requiredFields.forEach(function (field) {
            if (field.fieldName == "bilAcct") {
                billAcctNo = field.fieldValue;
            }
        });

        return billAcctNo == "" ? null : (
            <View style={Styles.accountDetailsView}>
                <View style={Styles.viewRow}>
                    <View style={Styles.viewRowLeftItem}>
                        <Typo
                            fontSize={14}
                            fontWeight="400"
                            fontStyle="normal"
                            letterSpacing={0}
                            lineHeight={18}
                            textAlign="left"
                            color={BLACK}
                            text={"Account number"}
                        />
                    </View>
                    <View style={Styles.viewRowRightItem}>
                        <Typo
                            fontSize={14}
                            fontWeight="bold"
                            fontStyle="normal"
                            letterSpacing={0}
                            lineHeight={18}
                            textAlign="right"
                            color={BLACK}
                            text={Utility.addSpaceAfter4Chars(billAcctNo)}
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
        const logoImage = {
            type: "url",
            source: this.state.logoImage,
        };
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
                                            title={""} //  empty this,  add prop to
                                            image={logoImage}
                                            altenativeText={this.state.recipientNickName}
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
};

export default withModelContext(AddToFavouritesScreen);
