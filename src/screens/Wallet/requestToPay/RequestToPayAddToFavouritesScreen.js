import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, ScrollView, Platform } from "react-native";
import DeviceInfo from "react-native-device-info";

import * as navigationConstant from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import { CircularLogoImage } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import ChallengeQuestion from "@components/RSA/ChallengeQuestion";
import Typography from "@components/Text";
import TextInput from "@components/TextInput";
import { showInfoToast, showSuccessToast, showErrorToast } from "@components/Toast";

import { withModelContext } from "@context";

import { addFavoriteFundTransferApi, rtpAddFavoriteApi } from "@services";

import { MEDIUM_GREY, YELLOW, DISABLED, DISABLED_TEXT, BLACK } from "@constants/colors";
import {
    RECIPIENT_NAME_CANT_BE_EMPTY,
    RECIPIENT_NAME_ALPHA_ERROR,
    ADDED_TO_FAVOURITES,
    WE_FACING_SOME_ISSUE,
    ADD_AS_FAVOURITES,
    SETTINGS_ENTER_NAME,
    CDD_BANK_NAME,
    REGISTERED_NAME,
    PROXY_TYPE,
    PROXY_ID,
    ADD_TO_FAVOURITES,
    REQUEST_COULD_NOT_BE_PROCESSED,
} from "@constants/strings";

import { formateIDName, getDeviceRSAInformation } from "@utils/dataModel/utility";
import { convertToTitleCase } from "@utils/dataModel/utilityRemittance";

import Styles from "@styles/Wallet/TransferEnterAmountStyle";

class RequestToPayAddToFavouritesScreen extends Component {
    static navigationOptions = { title: "", header: null };
    static propTypes = {
        navigation: PropTypes.object,
        route: PropTypes.object,
        getModel: PropTypes.func,
        updateModel: PropTypes.func,
    };

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
            addingFavouriteStatus: false,
            actualAccHolderName: "",
            screenValueUpdate: false,
        };
    }

    /***
     * componentDidMount
     * Update Screen date
     */
    componentDidMount() {
        this._updateDataInScreen();
    }

    /***
     * _updateDataInScreen
     * Handle one time screen load
     */
    _updateDataInScreen = () => {
        const transferParams = this.props.route.params?.transferParams ?? this.state.screenData;
        const screenData = {
            image: transferParams?.image,
        };
        const accountName = formateIDName(
            transferParams?.nameMasked
                ? transferParams?.actualAccHolderName
                : transferParams?.accHolderName,
            " ",
            2
        );
        const proxyTypeText = transferParams?.idTypeText
            ? formateIDName(transferParams?.idTypeText, " ", 2)
            : "";
        const actualAccHolderName = transferParams?.nameMasked
            ? transferParams?.actualAccHolderName
            : transferParams?.accHolderName;
        const recipientName = actualAccHolderName ?? "";

        this.setState({
            transferParams,
            image: transferParams?.image,
            screenData,
            transferFlow: transferParams?.transferFlow,
            bankName: formateIDName(
                transferParams?.toAccountBank || transferParams?.bankName,
                " ",
                2
            ),
            accountName: accountName ?? "",
            proxyTypeText: proxyTypeText ?? "",
            proxyIDText: transferParams?.idValue,
            recipientNickName: recipientName
                ? recipientName.toString().trim().substring(0, 20)
                : "",
            actualAccHolderName: actualAccHolderName ?? "",
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
            if (this.state.transferFlow === 25) {
                /*  Duit Now  Add To Favourite*/
                this._rtpAddToFavouriteRequest();
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

        const { recipientNickName, transferParams } = this.state;
        const { toAccount, bankCode, interbankPaymentType, referenceNumber } = transferParams;
        try {
            const params = {
                acctNo: toAccount,
                bankId: bankCode,
                pmtType: interbankPaymentType,
                transactionRefNo: referenceNumber,
                custName: this.cleanTextParams(recipientNickName),
                mobileSDKData: mobileSDK,
            };
            this.setState({ challengeRequest: params }, () => {
                // call fund Transfer API
                this._fundTransferAddToFavouriteRequest(params);
            });
        } catch (e) {
            showErrorToast({
                message: e?.message ?? REQUEST_COULD_NOT_BE_PROCESSED,
            });
        }
    };

    /***
     * _fundTransferAddToFavouriteRequest
     * fund Transfer Add To Favourite Api call
     */
    _fundTransferAddToFavouriteRequest = async (params) => {
        try {
            const response = await addFavoriteFundTransferApi(params);
            const responseObject = response?.data?.Msg?.MsgHdr;

            const alertMessage =
                responseObject?.StatusCode === "00"
                    ? ADDED_TO_FAVOURITES
                    : responseObject?.errorMsg;

            if (responseObject?.StatusCode === "00") {
                this.setState({ addingFavouriteStatus: true }, () => {
                    const { recipientNickName } = this.state;
                    this.showFlashSuccessMsgNew(`
                                ${recipientNickName} successfully added to Favourites.`);
                });
            } else {
                if (responseObject?.errorMsg?.length >= 1) {
                    this.setState({ addingFavouriteStatus: true }, () => {
                        this.showFlashErrorMsgNew(alertMessage);
                    });
                }
            }
        } catch (error) {
            //Error Handling
            const { transferParams } = this.state;

            const errors = error;
            const errorsInner = error?.error || {};

            if (errors?.status === 428) {
                // Display RSA Challenge Questions if status is 428
                this.setState((prevState) => ({
                    challengeRequest: {
                        ...prevState.challengeRequest,
                        challenge: errorsInner?.challenge,
                    },
                    isRSARequired: true,
                    isRSALoader: false,
                    challengeQuestion: errorsInner?.challenge?.questionText,
                    RSACount: prevState?.RSACount + 1,
                    RSAError: prevState?.RSACount > 0,
                }));
            } else if (errors?.status === 423) {
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
                        this.props.navigation.navigate(
                            navigationConstant.REQUEST_TO_PAY_ACKNOWLEDGE_SCREEN,
                            {
                                errorMessge:
                                    errorsInner && errorsInner.additionalStatusDescription
                                        ? errorsInner.additionalStatusDescription
                                        : WE_FACING_SOME_ISSUE,
                                transferParams,
                                transactionReferenceNumber: "",
                                isRsaLock: true,
                            }
                        );
                    }
                );
            } else if (errors?.status === 422) {
                //RSA Transfer Deny
                const errorsInner = errors?.error;

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
                        this.props.navigation.navigate(
                            navigationConstant.REQUEST_TO_PAY_ACKNOWLEDGE_SCREEN,
                            {
                                errorMessge:
                                    errorsInner && errorsInner.statusDescription
                                        ? errorsInner.statusDescription
                                        : WE_FACING_SOME_ISSUE,
                                transferParams,
                                transactionReferenceNumber: "",
                                isRsaLock: false,
                            }
                        );
                    }
                );
            } else {
                //Common default Errors
                this.setState({ isRSALoader: false });
                const errorMsg = error && error?.message ? error?.message : WE_FACING_SOME_ISSUE;

                this.setState({ addingFavouriteStatus: true }, () => {
                    this.showFlashErrorMsgNew(errorMsg);
                });
            }
        }
    };

    /***
     * cleanTextParams
     * clean Text Params
     */
    cleanTextParams = (value) => {
        return value
            .toString()
            .trim()
            .replace(/(?:\r\n|\r|\n)/g, " ")
            .replace("\n", " ")
            .replace(/\n/g, " ")
            .replace(/\r?\n/g, " ")
            .replace(/\s\s+/g, " ")
            .replace(/  +/g, " ");
    };

    /***
     * _rtpAddToFavouriteRequest
     * duItNow Add To Favourite params build
     */
    _rtpAddToFavouriteRequest = () => {
        const deviceInfo = this.props.getModel("device");
        const mobileSDK = getDeviceRSAInformation(deviceInfo.deviceInformation, DeviceInfo);
        const { transferParams, recipientNickName, actualAccHolderName } = this.state;
        const countryCode = transferParams.idCode === "PSPT" ? transferParams.countryCode : "";
        const nameBank =
            convertToTitleCase(transferParams?.bankName) ||
            convertToTitleCase(transferParams?.selectedBank?.bankName);
        try {
            const params = {
                idNo: transferParams?.idValue + countryCode,
                idType: transferParams?.idType,
                nickname: this.cleanTextParams(recipientNickName),
                recipientName: this.cleanTextParams(actualAccHolderName),
                mobileSDKData: mobileSDK,
                transactionRefNo: transferParams?.referenceNumberFull,
                email: (transferParams?.swiftCode ?? "").slice(0, 8),
                rtpV2: true,
                receiverName: this.cleanTextParams(actualAccHolderName),
                bankName: nameBank,
                transactionSubType: "RPP",
                toAccount: transferParams?.toAccount,
                fromAccount: transferParams?.selectedAccount?.number.slice(0, 12),
                amount: transferParams?.formattedAmount,
            };
            this.setState({ challengeRequest: params }, () => {
                this._addToFavouriteRequest(params);
            });
        } catch (e) {
            showErrorToast({
                message: e?.message ?? REQUEST_COULD_NOT_BE_PROCESSED,
            });
        }
    };

    /***
     * _addToFavouriteRequest
     * duItNow Add To Favourite Api call
     */
    _addToFavouriteRequest = async (params) => {
        try {
            const response = await rtpAddFavoriteApi(params);
            const responseObject = response?.data;
            const errMsg = responseObject?.errorMsg ?? "";
            const alertMessage =
                responseObject?.statusCode === "0000"
                    ? this.cleanTextParams(this.state.recipientNickName) +
                      " successfully added to Favourites."
                    : errMsg;
            if (responseObject?.statusCode === "0000") {
                this.setState(
                    {
                        addingFavouriteStatus: true,
                        isRSALoader: false,
                        isRSARequired: false,
                    },
                    () => {
                        this.showFlashSuccessMsgNew(alertMessage);
                    }
                );
            } else {
                if (responseObject?.errorMsg?.length >= 1) {
                    this.setState(
                        {
                            addingFavouriteStatus: true,
                            isRSALoader: false,
                            isRSARequired: false,
                        },
                        () => {
                            this.showFlashErrorMsgNew(alertMessage);
                        }
                    );
                }
            }
        } catch (error) {
            const { transferParams } = this.state;

            const errors = error;

            if (errors?.status === 428) {
                //RSA Challenge
                const errorsInner = errors?.error;

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
            } else if (errors?.status === 423) {
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
                        this.props.navigation.navigate(
                            navigationConstant.REQUEST_TO_PAY_ACKNOWLEDGE_SCREEN,
                            {
                                errorMessge:
                                    errorsInner && errorsInner.additionalStatusDescription
                                        ? errorsInner.additionalStatusDescription
                                        : WE_FACING_SOME_ISSUE,
                                transferParams,
                                transactionReferenceNumber: "",
                                isRsaLock: true,
                            }
                        );
                    }
                );
            } else if (errors?.status === 422) {
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
                        this.props.navigation.navigate(
                            navigationConstant.REQUEST_TO_PAY_ACKNOWLEDGE_SCREEN,
                            {
                                errorMessge:
                                    errorsInner && errorsInner.additionalStatusDescription
                                        ? errorsInner.additionalStatusDescription
                                        : WE_FACING_SOME_ISSUE,
                                transferParams,
                                transactionReferenceNumber: "",
                                isRsaLock: false,
                            }
                        );
                    }
                );
            } else {
                //Common default Errors
                this.setState({ isRSALoader: false });
                this.setState({ addingFavouriteStatus: true }, () => {
                    this.showFlashErrorMsgNew(error?.message ?? WE_FACING_SOME_ISSUE);
                });
            }
        }
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
            transferFlow,
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
                if (transferFlow === 25) {
                    this._addToFavouriteRequest(this.state.challengeRequest);
                } else {
                    this._fundTransferAddToFavouriteRequest(this.state.challengeRequest);
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
        const { transferParams, addingFavouriteStatus } = this.state;
        const payload = {
            addingFavouriteStatus,
        };
        if (transferParams?.duitNowRequest) {
            payload.transferParams = {
                ...transferParams,
                statusDescription: "successful",
                transactionStatus: true,
            };
        }
        this.props.navigation.navigate(
            navigationConstant.REQUEST_TO_PAY_ACKNOWLEDGE_SCREEN,
            payload
        );
        showSuccessToast({
            message: msg,
        });
    };

    /***
     * showFlashErrorMsgNew
     * Show Error massage and navigate to previous screen
     */
    showFlashErrorMsgNew = (msg) => {
        this.props.navigation.navigate(navigationConstant.REQUEST_TO_PAY_ACKNOWLEDGE_SCREEN, {
            ...this.props.route.params,
            addingFavouriteStatus: this.state.addingFavouriteStatus,
        });
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
     * _onBackPress
     *
     */
    _onBackPress = () => {
        this.props.navigation.navigate(
            navigationConstant.DUITNOW_DECOUPLED_REQUEST_ACKNOWLEDGE_SCREEN,
            {
                //couple
                addingFavouriteStatus: this.state.addingFavouriteStatus,
            }
        );
    };

    render() {
        const { showErrorModal, errorMessage, screenValueUpdate } = this.state;

        const removeLineHeight = { lineHeight: Platform.OS === "android" ? 21 : 0 };
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
                                <Typography
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

                                    <View style={Styles.favFirstItem}>
                                        {this.state.proxyTypeText === "Account number" ? (
                                            <View style={Styles.viewRow}>
                                                <View style={Styles.viewRowLeftItem}>
                                                    <Typography
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
                                                    <Typography
                                                        fontSize={14}
                                                        fontWeight="600"
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
                                                <Typography
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
                                                <Typography
                                                    fontSize={14}
                                                    fontWeight="600"
                                                    fontStyle="normal"
                                                    letterSpacing={0}
                                                    lineHeight={18}
                                                    textAlign="right"
                                                    text={this.state.accountName}
                                                />
                                            </View>
                                        </View>

                                        {this.state.proxyTypeText !== "" && (
                                            <View style={Styles.viewRow}>
                                                <View style={Styles.viewRowLeftItem}>
                                                    <Typography
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
                                                    <Typography
                                                        fontSize={14}
                                                        fontWeight="600"
                                                        fontStyle="normal"
                                                        letterSpacing={0}
                                                        lineHeight={18}
                                                        textAlign="right"
                                                        text={this.state.proxyTypeText}
                                                    />
                                                </View>
                                            </View>
                                        )}
                                        <View style={Styles.viewRow}>
                                            <View style={Styles.viewRowLeftItem}>
                                                <Typography
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
                                                <Typography
                                                    fontSize={14}
                                                    fontWeight="600"
                                                    fontStyle="normal"
                                                    letterSpacing={0}
                                                    lineHeight={18}
                                                    textAlign="right"
                                                    text={this.state.proxyIDText}
                                                />
                                            </View>
                                        </View>
                                    </View>
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
                                    <Typography
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

export default withModelContext(RequestToPayAddToFavouritesScreen);
