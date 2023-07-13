import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, ScrollView, Platform } from "react-native";
import DeviceInfo from "react-native-device-info";

import { TRANSFER_ACKNOWLEDGE_SCREEN } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import { CircularLogoImage } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import ChallengeQuestion from "@components/RSA/ChallengeQuestion";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";
import { showInfoToast, showSuccessToast } from "@components/Toast";

import { withModelContext } from "@context";

import { addFavoriteFundTransferApi, duItNowAddToFavorite } from "@services/";
import { GATransfer } from "@services/analytics/analyticsTransfer";

import { MEDIUM_GREY, YELLOW, DISABLED, DISABLED_TEXT, BLACK } from "@constants/colors";
import {
    RECIPIENT_NAME_CANT_BE_EMPTY,
    RECIPIENT_NAME_ALPHA_ERROR,
    ADDED_TO_FAVOURITES,
    SUCCESSFULLY_ADDED_TO_FAVOURITES,
    WE_FACING_SOME_ISSUE,
    ADD_AS_FAVOURITES,
    SETTINGS_ENTER_NAME,
    CDD_BANK_NAME,
    REGISTERED_NAME,
    CDD_ACCOUNT_NUMBER,
    TRANSFER_TYPE,
    PROXY_TYPE,
    PROXY_ID,
    ADD_TO_FAVOURITES,
} from "@constants/strings";

import { formateIDName, getDeviceRSAInformation } from "@utils/dataModel/utility";

import Styles from "@styles/Wallet/TransferEnterAmountStyle";

class AddToFavouritesScreen extends Component {
    /***
     * constructor
     * props
     */
    constructor(props) {
        super(props);
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
            screenData: {
                image: "",
                name: "",
                description1: "",
                description2: "",
            },
            transferParams: {},
            transferFlow: 0,
            image: {
                image: "",
                imageName: " ",
                imageUrl: "",
                shortName: "",
            },
            bankName: "",
            accountName: "",
            proxyTypeText: "",
            proxyIDText: "",
            transactionType: "",
            addingFavouriteStatus: false,
            actualAccHolderName: "",
            actualAccHolderNameFormatted: "",
            screenValueUpdate: false,
        };
    }

    /***
     * componentDidMount
     * Update Screen date
     */
    componentDidMount() {
        this._updateDataInScreen();
        GATransfer.viewScreenAddFav();
    }

    /***
     * componentWillUnmount
     * Handle Screen UnMount Event
     */
    componentWillUnmount() {}

    /***
     * _updateDataInScreen
     * Handle one time screen load
     */
    _updateDataInScreen = () => {
        const transferParams = this.props.route.params?.transferParams ?? this.state.screenData;

        const screenData = {
            image: transferParams.image,
        };
        let accountName = "";
        let proxyTypeText = "";
        let transactionType = "";
        let recipientName = "";
        let actualAccHolderName = "";
        let transferFlow = "";
        let actualAccHolderNameFormatted = "";
        if (transferParams) {
            actualAccHolderName = transferParams.actualAccHolderName;
            accountName =
                transferFlow === 12
                    ? transferParams.actualAccHolderName
                    : transferParams.accountName;
            transferFlow = transferParams.transferFlow;
            proxyTypeText = transferParams.idTypeText;
            transactionType = transferParams.transactionType;
            accountName = formateIDName(accountName, " ", 2);
            proxyTypeText = formateIDName(proxyTypeText, " ", 2);
            actualAccHolderNameFormatted = formateIDName(actualAccHolderName, " ", 2);
            recipientName =
                transferFlow === 12 ? actualAccHolderName : transferParams.recipientName;
        }

        this.setState({
            transferParams,
            image: transferParams.image,
            screenData,
            transferFlow: transferParams.transferFlow,
            bankName: formateIDName(transferParams.toAccountBank, " ", 2),
            formattedToAccount: transferParams.formattedToAccount,
            accountName,
            proxyTypeText,
            proxyIDText: transferParams.idValue,
            recipientNickName: recipientName
                ? recipientName.toString().trim().substring(0, 20)
                : "",
            actualAccHolderNameFormatted,
            transactionType,
            actualAccHolderName,
            disableAddButton: false,
        });
    };

    /***
     * _onConfirmClick
     * Handle on Confirm button Click
     */
    _onConfirmClick = () => {
        // to avoid user click add button multiple time
        if (this.state.disableAddButton) {
            return;
        } else {
            this.setState({
                disableAddButton: true,
            });
        }
        const validate = true;

        //Validate input
        if (this.state.recipientNickName.length <= 0) {
            this.setState({
                showLocalErrorMessage: RECIPIENT_NAME_CANT_BE_EMPTY,
                showLocalError: true,
            });
        } else if (!validate) {
            this.setState({
                showLocalErrorMessage: RECIPIENT_NAME_ALPHA_ERROR,
                showLocalError: true,
            });
        } else {
            if (this.state.transferFlow === 12) {
                /*  Duit Now  Add To Favourite*/
                this._duItNowAddToFavourite();
            } else {
                /*  fund Transfer Add To Favourite*/
                this._fundTransferAddToFavourite();
            }
        }
    };

    /***
     * _fundTransferAddToFavourite
     * fund Transfer Add To Favourite params build
     */
    _fundTransferAddToFavourite = () => {
        const deviceInfo = this.props.getModel("device");
        const mobileSDK = getDeviceRSAInformation(deviceInfo.deviceInformation, DeviceInfo);

        let params = {};
        const { recipientNickName, transferParams } = this.state;
        const {
            toAccount,
            bankCode,
            interbankPaymentType,
            swiftCode,
            referenceNumber,
            paymentCode,
        } = transferParams;
        try {
            params = {
                acctNo: toAccount,
                bankId: bankCode,
                pmtType: paymentCode,
                transactionRefNo: referenceNumber,
                custName: this.cleanTextParams(recipientNickName),
                swiftCode,
                interbankPaymentType,
                mobileSDKData: mobileSDK,
            };
            this.setState({ challengeRequest: params }, () => {
                // call fund Transfer API
                this._fundTransferAddToFavouriteRequest(params);
            });
        } catch (e) {}
    };

    /***
     * _fundTransferAddToFavouriteRequest
     * fund Transfer Add To Favourite Api call
     */
    _fundTransferAddToFavouriteRequest = (params) => {
        try {
            let alertMessage = "Loading";

            addFavoriteFundTransferApi(params)
                .then((response) => {
                    let responseObject = response.data;

                    responseObject = responseObject.Msg.MsgHdr;

                    if (
                        responseObject &&
                        responseObject.StatusCode &&
                        responseObject.StatusCode === "00"
                    ) {
                        alertMessage = ADDED_TO_FAVOURITES;
                        this.setState({ addingFavouriteStatus: true }, () => {
                            this.showFlashSuccessMsgNew(
                                this.state.recipientNickName +
                                    " " +
                                    SUCCESSFULLY_ADDED_TO_FAVOURITES
                            );
                        });
                    } else {
                        if (
                            responseObject &&
                            responseObject.errorMsg &&
                            responseObject.errorMsg.length >= 1
                        ) {
                            alertMessage = responseObject.errorMsg;
                            this.setState({ addingFavouriteStatus: true }, () => {
                                this.showFlashErrorMsgNew(alertMessage);
                            });
                        }
                    }
                })
                .catch((error, token) => {
                    //Error Handling
                    const { transferParams } = this.state;

                    let errors = {};
                    let errorsInner = {};

                    errors = error;
                    errorsInner = error.error;

                    if (errors.status === 428) {
                        // Display RSA Challenge Questions if status is 428
                        this.setState((prevState) => ({
                            challengeRequest: {
                                ...prevState.challengeRequest,
                                challenge: errorsInner.challenge,
                            },
                            isRSARequired: true,
                            isRSALoader: false,
                            challengeQuestion: errorsInner.challenge.questionText,
                            RSACount: prevState.RSACount + 1,
                            RSAError: prevState.RSACount > 0,
                        }));
                    } else if (errors.status === 423) {
                        //RSA Account lock
                        this.setState(
                            {
                                // update state values
                                isRSARequired: false,
                                isRSALoader: false,
                            },
                            () => {
                                // Add Completion
                                transferParams.transactionStatus = false;
                                transferParams.referenceNumber = "";
                                transferParams.formattedTransactionRefNumber = "";
                                transferParams.transactionDate = errorsInner.serverDate;
                                transferParams.error = error;
                                this.props.navigation.navigate(TRANSFER_ACKNOWLEDGE_SCREEN, {
                                    errorMessge:
                                        errorsInner && errorsInner.additionalStatusDescription
                                            ? errorsInner.additionalStatusDescription
                                            : WE_FACING_SOME_ISSUE,
                                    transferParams,
                                    transactionReferenceNumber: "",
                                    isRsaLock: true,
                                });
                            }
                        );
                    } else if (errors.status === 422) {
                        //RSA Transfer Deny
                        const errorsInner = errors.error;
                        this.setState(
                            {
                                isRSARequired: false,
                                isRSALoader: false,
                            },
                            () => {
                                // Add Completion
                                transferParams.transactionStatus = false;
                                transferParams.referenceNumber = "";
                                transferParams.formattedTransactionRefNumber = "";
                                transferParams.transactionDate = errorsInner.serverDate;
                                transferParams.error = error;
                                transferParams.transactionResponseError = "";
                                this.props.navigation.navigate(TRANSFER_ACKNOWLEDGE_SCREEN, {
                                    errorMessge:
                                        errorsInner && errorsInner.statusDescription
                                            ? errorsInner.statusDescription
                                            : WE_FACING_SOME_ISSUE,
                                    transferParams,
                                    transactionReferenceNumber: "",
                                    isRsaLock: false,
                                });
                            }
                        );
                    } else {
                        //Common default Errors
                        const errorMsg =
                            error && error.message ? error.message : WE_FACING_SOME_ISSUE;

                        this.setState({ addingFavouriteStatus: true }, () => {
                            this.showFlashErrorMsgNew(errorMsg);
                        });
                    }
                });
        } catch (e) {}
    };

    /***
     * cleanTextParams
     * clean Text Params
     */
    cleanTextParams = (value) => {
        return value
            ? value
                  .toString()
                  .trim()
                  .replace(/(?:\r\n|\r|\n)/g, " ")
                  .replace("\n", " ")
                  .replace(/\n/g, " ")
                  .replace(/\r?\n/g, " ")
                  .replace(/\s\s+/g, " ")
                  .replace(/  +/g, " ")
            : value;
    };

    /***
     * _duItNowAddToFavourite
     * duItNow Add To Favourite params build
     */
    _duItNowAddToFavourite = () => {
        const deviceInfo = this.props.getModel("device");
        const mobileSDK = getDeviceRSAInformation(deviceInfo.deviceInformation, DeviceInfo);
        let params = {};
        const { transferParams, recipientNickName, actualAccHolderName } = this.state;
        const countryCode = transferParams.idCode === "PSPT" ? transferParams.countryCode : "";
        try {
            params = {
                email: "",
                idNo: transferParams.idValue + countryCode,
                idType: transferParams.idType,
                nickname: this.cleanTextParams(recipientNickName),
                recipientName: this.cleanTextParams(actualAccHolderName),
                mobileSDKData: mobileSDK,
            };
            this.setState({ challengeRequest: params }, () => {
                this._duItNowAddToFavouriteRequest(params);
            });
        } catch (e) {}
    };

    /***
     * _duItNowAddToFavouriteRequest
     * duItNow Add To Favourite Api call
     */
    _duItNowAddToFavouriteRequest = (params) => {
        try {
            duItNowAddToFavorite(params)
                .then((response) => {
                    const responseObject = response.data;
                    let alertMessage = "";

                    if (
                        responseObject &&
                        responseObject.statusCode &&
                        responseObject.statusCode === "0000"
                    ) {
                        alertMessage = responseObject.recipientName + " " + ADDED_TO_FAVOURITES;

                        this.setState({ addingFavouriteStatus: true }, () => {
                            this.showFlashSuccessMsgNew(alertMessage);
                        });
                    } else {
                        if (
                            responseObject &&
                            responseObject.errorMsg &&
                            responseObject.errorMsg.length >= 1
                        ) {
                            alertMessage = responseObject.errorMsg;

                            this.setState({ addingFavouriteStatus: true }, () => {
                                this.showFlashErrorMsgNew(alertMessage);
                            });
                        }
                    }
                })
                .catch((error, token) => {
                    const { transferParams } = this.state;

                    const errors = error;

                    if (errors.status === 428) {
                        //RSA Challenge
                        const errorsInner = errors.error;

                        // Display RSA Challenge Questions if status is 428
                        if (errorsInner && errorsInner.challenge) {
                            this.setState((prevState) => ({
                                challengeRequest: {
                                    ...prevState.challengeRequest,
                                    challenge: errorsInner.challenge,
                                },
                                isRSARequired: true,
                                isRSALoader: false,
                                challengeQuestion: errorsInner.challenge.questionText,
                                RSACount: prevState.RSACount + 1,
                                RSAError: prevState.RSACount > 0,
                            }));
                        }
                    } else if (errors.status === 423) {
                        //RSA Account Lock
                        const errorsInner = errors.error;
                        this.setState(
                            {
                                // update state values
                                isRSARequired: false,
                                isRSALoader: false,
                            },
                            () => {
                                // Add Completion
                                transferParams.transactionStatus = false;
                                transferParams.referenceNumber = "";
                                transferParams.formattedTransactionRefNumber = "";
                                transferParams.transactionDate = errorsInner.serverDate;
                                transferParams.error = error;
                                this.props.navigation.navigate(TRANSFER_ACKNOWLEDGE_SCREEN, {
                                    errorMessge:
                                        errorsInner && errorsInner.additionalStatusDescription
                                            ? errorsInner.additionalStatusDescription
                                            : WE_FACING_SOME_ISSUE,
                                    transferParams,
                                    transactionReferenceNumber: "",
                                    isRsaLock: true,
                                });
                            }
                        );
                    } else if (errors.status === 422) {
                        // Display RSA Deny Error Message
                        const errorsInner = errors.error;
                        this.setState(
                            {
                                // update state values
                                isRSARequired: false,
                                isRSALoader: false,
                            },
                            () => {
                                // Add Completion
                                transferParams.transactionStatus = false;
                                transferParams.referenceNumber = "";
                                transferParams.formattedTransactionRefNumber = "";
                                transferParams.transactionDate = errorsInner.serverDate;
                                transferParams.error = error;
                                transferParams.transactionResponseError = "";
                                this.props.navigation.navigate(TRANSFER_ACKNOWLEDGE_SCREEN, {
                                    errorMessge:
                                        errorsInner && errorsInner.additionalStatusDescription
                                            ? errorsInner.additionalStatusDescription
                                            : WE_FACING_SOME_ISSUE,
                                    transferParams,
                                    transactionReferenceNumber: "",
                                    isRsaLock: false,
                                });
                            }
                        );
                    } else {
                        //Common default Errors
                        const errorMsg =
                            error && error.message ? error.message : WE_FACING_SOME_ISSUE;
                        this.setState({ addingFavouriteStatus: true }, () => {
                            this.showFlashErrorMsgNew(errorMsg);
                        });
                    }
                });
        } catch (e) {}
    };

    /***
     * onChallengeSnackClosePress
     * on Challenge Snack Close Press
     */
    onChallengeSnackClosePress = () => {
        this.setState({ RSAError: false });
    };

    /***
     * onChallengeQuestionSubmitPress
     * on Challenge Snack Close Press
     */
    onChallengeQuestionSubmitPress = (answer) => {
        const {
            challengeRequest: { challenge },
        } = this.state;

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
            },
            () => {
                const { transferParams, challengeRequest } = this.state;
                const { transferFlow } = transferParams;
                if (transferFlow === 12) {
                    //if DuitNow call duitNow api again with updated api
                    this._duItNowAddToFavouriteRequest(challengeRequest);
                } else {
                    //if Transfer call Transfer api again with updated api
                    this._fundTransferAddToFavouriteRequest(challengeRequest);
                }
            }
        );
    };

    /***
     * showFlashMsg
     * Show success massage and navigate to previous screen
     */
    showFlashMsg = (msg) => {
        showSuccessToast({
            message: msg,
        });
        setTimeout(() => {
            this.props.navigation.goBack();
        }, 4000);
    };

    /***
     * showFlashSuccessMsgNew
     * Show success massage and navigate to previous screen
     */
    showFlashSuccessMsgNew = (msg) => {
        this.props.navigation.navigate(TRANSFER_ACKNOWLEDGE_SCREEN, {
            addingFavouriteStatus: this.state.addingFavouriteStatus,
        });
        showSuccessToast({
            message: msg,
        });
    };

    /***
     * showFlashErrorMsgNew
     * Show Error massage and navigate to previous screen
     */
    showFlashErrorMsgNew = (msg) => {
        // this is for to hide add fav btn if record already exist
        const isSuccess = msg.indexOf("exist") > -1;
        this.props.navigation.navigate(TRANSFER_ACKNOWLEDGE_SCREEN, {
            addingFavouriteStatus: isSuccess,
        });
        GATransfer.errorAddFav();
        showInfoToast({
            message: msg,
        });
    };

    /***
     * _onTextInputValueChanged
     * update text in state
     */
    _onTextInputValueChanged = (text) => {
        this.setState({
            showLocalError: false,
            recipientNickName: text,
            disableAddButton: false,
            screenValueUpdate: true,
        });
    };

    /***
     * _proceedToNextScreen
     *
     */
    _proceedToNextScreen = () => {};

    /***
     * _onBackPress
     *
     */
    _onBackPress = () => {
        this.props.navigation.navigate(TRANSFER_ACKNOWLEDGE_SCREEN, {
            addingFavouriteStatus: this.state.addingFavouriteStatus,
        });
    };

    render() {
        const removeLineHeight = { lineHeight: Platform.OS === "android" ? 21 : 0 };
        const { showErrorModal, errorMessage, screenValueUpdate } = this.state;
        return (
            <ScreenContainer
                backgroundType="color"
                showErrorModal={showErrorModal}
                errorMessage={errorMessage}
                showOverlay={false}
                backgroundColor={MEDIUM_GREY}
            >
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
                                        <CircularLogoImage
                                            source={this.state.image}
                                            isLocal={false}
                                        />
                                    </View>

                                    <View style={Styles.favNameItem}>
                                        <TextInput
                                            style={[
                                                screenValueUpdate
                                                    ? Styles.favAccountHolderNameEdited
                                                    : Styles.favAccountHolderName,
                                                removeLineHeight,
                                            ]}
                                            maxLength={20}
                                            onChangeText={this._onTextInputValueChanged}
                                            value={this.state.recipientNickName}
                                            isValidate={this.state.showLocalError}
                                            errorMessage={this.state.showLocalErrorMessage}
                                            onSubmitEditing={this._proceedToNextScreen}
                                            clearButtonMode="while-editing"
                                            returnKeyType="done"
                                            placeholder={SETTINGS_ENTER_NAME}
                                        />
                                    </View>

                                    {this.state.transferFlow <= 5 && (
                                        <View style={Styles.favFirstItem}>
                                            {this.state.proxyTypeText === "Account number" ? (
                                                <View style={Styles.viewRow}>
                                                    <View style={Styles.viewRowLeftItem}>
                                                        <Typo
                                                            fontSize={14}
                                                            fontWeight="400"
                                                            fontStyle="normal"
                                                            letterSpacing={0}
                                                            lineHeight={18}
                                                            textAlign="left"
                                                            text={CDD_BANK_NAME}
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
                                                            text={this.state.bankName}
                                                        />
                                                    </View>
                                                </View>
                                            ) : null}

                                            <View style={Styles.viewRow}>
                                                <View style={Styles.viewRowLeftItem}>
                                                    <Typo
                                                        fontSize={14}
                                                        fontWeight="400"
                                                        fontStyle="normal"
                                                        letterSpacing={0}
                                                        lineHeight={18}
                                                        textAlign="left"
                                                        text={REGISTERED_NAME}
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
                                                        text={this.state.accountName}
                                                    />
                                                </View>
                                            </View>

                                            <View style={Styles.viewRow}>
                                                <View style={Styles.viewRowLeftItem}>
                                                    <Typo
                                                        fontSize={14}
                                                        fontWeight="400"
                                                        fontStyle="normal"
                                                        letterSpacing={0}
                                                        lineHeight={18}
                                                        textAlign="left"
                                                        text={CDD_ACCOUNT_NUMBER}
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
                                                        text={this.state.formattedToAccount}
                                                    />
                                                </View>
                                            </View>
                                        </View>
                                    )}

                                    {(this.state.transferFlow === 4 ||
                                        this.state.transferFlow === 5) && (
                                        <View style={Styles.viewRow}>
                                            <View style={Styles.viewRowLeftItem}>
                                                <Typo
                                                    fontSize={14}
                                                    fontWeight="400"
                                                    fontStyle="normal"
                                                    letterSpacing={0}
                                                    lineHeight={18}
                                                    textAlign="left"
                                                    text={TRANSFER_TYPE}
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
                                                    text={this.state.transactionType}
                                                />
                                            </View>
                                        </View>
                                    )}

                                    {this.state.transferFlow === 12 && (
                                        <View style={Styles.favFirstItem}>
                                            <View style={Styles.viewRow}>
                                                <View style={Styles.viewRowLeftItem}>
                                                    <Typo
                                                        fontSize={14}
                                                        fontWeight="400"
                                                        fontStyle="normal"
                                                        letterSpacing={0}
                                                        lineHeight={18}
                                                        textAlign="left"
                                                        text={REGISTERED_NAME}
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
                                                        multiline={true}
                                                        numberOfLines={10}
                                                        textAlignVertical="top"
                                                        text={
                                                            this.state.actualAccHolderNameFormatted
                                                        }
                                                    />
                                                </View>
                                            </View>

                                            <View style={Styles.viewRow}>
                                                <View style={Styles.viewRowLeftItem}>
                                                    <Typo
                                                        fontSize={14}
                                                        fontWeight="400"
                                                        fontStyle="normal"
                                                        letterSpacing={0}
                                                        lineHeight={18}
                                                        textAlign="left"
                                                        text={PROXY_TYPE}
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
                                                        text={this.state.proxyTypeText}
                                                    />
                                                </View>
                                            </View>

                                            <View style={Styles.viewRow}>
                                                <View style={Styles.viewRowLeftItem}>
                                                    <Typo
                                                        fontSize={14}
                                                        fontWeight="400"
                                                        fontStyle="normal"
                                                        letterSpacing={0}
                                                        lineHeight={18}
                                                        textAlign="left"
                                                        text={PROXY_ID}
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
                                                        text={this.state.proxyIDText}
                                                    />
                                                </View>
                                            </View>
                                        </View>
                                    )}
                                    {this.state.transferFlow === 17 && this.getPayBillAcctUI()}

                                    {this.state.transferFlow === 17 && this.getPayBillRefUI()}
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
};

export default withModelContext(AddToFavouritesScreen);
