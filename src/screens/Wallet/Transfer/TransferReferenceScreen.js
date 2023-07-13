import AsyncStorage from "@react-native-community/async-storage";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, Keyboard } from "react-native";

import { navigateToS2UCooling } from "@screens/OneTapAuth/CoolingNavigator";

import {
    ONE_TAP_AUTH_MODULE,
    FUNDTRANSFER_MODULE,
    TRANSFER_CONFIRMATION_SCREEN,
    TRANSFER_TYPE_MODE_SCREEN,
    TAB_NAVIGATOR,
    BANKINGV2_MODULE,
    ACCOUNT_DETAILS_SCREEN,
    SECURE2U_COOLING,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import { AccountDetailsView } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";

import { withModelContext } from "@context";

import { GATransfer } from "@services/analytics/analyticsTransfer";

import { MEDIUM_GREY, YELLOW, DISABLED, DISABLED_TEXT, BLACK } from "@constants/colors";
import {
    AMOUNT_ERROR,
    TRANSFER_REFERENCE_ERROR,
    PLEASE_INPUT_VALID_RECIPIENT_REFERENCE,
    ENTER_RECIPIENT_REFERENCE,
    CONTINUE,
    PLEASE_REMOVE_INVALID_SPECIAL_CHARACTERS,
    FAV_MAYBANK_THIRD_PARTY_TRANSFER,
    DUITNOW_INSTANT_TRANSFER,
    FAV_MAYBANK_IBFT,
    FAV_MAYBANK_IBG,
    TRANSFER_TO_HEADER,
} from "@constants/strings";

import { _getDeviceInformation, referenceRegexOtherBank } from "@utils/dataModel";
import { checks2UFlow } from "@utils/dataModel/utility";
import { S2UFlowEnum } from "@utils/dataModel/utilityEnum";
import { getTransferAccountType } from "@utils/dataModel/utilityPartial.5";

import Styles from "@styles/Wallet/TransferEnterAmountStyle";

("use strict");

class TransferReferenceScreen extends Component {
    static navigationOptions = { title: "", header: null };

    /***
     * constructor
     * props
     */
    constructor(props) {
        super(props);
        this.state = {
            referenceText: "",
            errorMsg: false,
            errorMessageTxt: "",
            secure2uValidateData: {},
            showLocalError: false,
            showLocalErrorMessage: "",
            errorMessage: "",
            screenData: {
                image: "",
                name: "",
                description1: "",
                description2: "",
            },
            transferParams: {},
            transferFlow: 0,
            image: "",
            disabled: true,
            functionsCode: 0,
        };
    }

    /***
     * componentDidMount
     * Update Screen date
     */
    async componentDidMount() {
        this._updateDataInScreen();
        this.focusSubscription = this.props.navigation.addListener("focus", () => {
            console.log("[TransferReferenceScreen] >> [componentDidMount] focusSubscription : ");
            this.fromNextScreen = true;
            this._updateDataInScreenAlways();
        });
        this.blurSubscription = this.props.navigation.addListener("blur", () => {});
    }

    /***
     * componentWillUnmount
     * Handle Screen UnMount Event
     */
    componentWillUnmount() {
        console.log("[TransferReferenceScreen] >> [componentWillUnmount] : ");
        this.focusSubscription();
        this.blurSubscription();
    }

    /***
     * _updateDataInScreen
     * Handle one time screen load
     */
    _updateDataInScreen = async () => {
        console.log("[TransferReferenceScreen] >> [_updateDataInScreen] : ");
        const transferParams = this.props.route.params?.transferParams ?? this.state.screenData;
        console.log(
            "[TransferReferenceScreen] >> [_updateDataInScreen] transferParams : ",
            transferParams
        );

        console.log(
            "[TransferReferenceScreen] >> [_updateDataInScreen] updateData ==> ",
            transferParams
        );
        const screenData = {
            image: transferParams.image,
            name: transferParams.formattedToAccount,
            description1: transferParams.accountName,
            description2: transferParams.bankName,
        };
        this.setState({
            transferParams,
            errorMessage: AMOUNT_ERROR,
            screenData,
            transferFlow: transferParams.transferFlow,
            functionsCode: transferParams.functionsCode,
            referenceText:
                transferParams && transferParams.reference ? transferParams.reference : "",
        });
        const isSecure2uEnable = await AsyncStorage.getItem("isSecure2uEnable", false);
        console.log(
            "[TransferReferenceScreen] >> [_updateDataInScreen] isSecure2uEnable ==> ",
            isSecure2uEnable
        );
        GATransfer.viewScreenRecipientReference(
            getTransferAccountType(transferParams.transferFlow)
        );

        await _getDeviceInformation();
    };

    /***
     * _updateDataInScreenAlways
     * Load Screen data on every time come back to this screen
     */
    _updateDataInScreenAlways = () => {};

    /***
     * _onTextInputValueChanged
     * on Text Input Value Changed
     */
    _onTextInputValueChanged = (text) => {
        console.log("[TransferReferenceScreen] >> [_onTextInputValueChanged] : ");
        this.setState({
            showLocalError: false,
            referenceText: text,
            disabled: text && text.length < 3,
        });
    };

    /***
     * _onTextDone
     * on Text Done
     */
    _onTextDone = () => {
        console.log("[TransferReferenceScreen] >> [_onTextDone] : ");
        Keyboard.dismiss();
    };

    /***
     * _onMoveNext
     * _on Move Next to next screen
     */
    _onMoveNext = () => {
        console.log("[TransferReferenceScreen] >> [_onMoveNext] : ");
        this._proceedToNextScreen();
    };

    /***
     * _proceedToNextScreen
     *  proceed To Next Screen
     */
    _proceedToNextScreen = async () => {
        console.log("[TransferReferenceScreen] >> [_proceedToNextScreen] : ");
        const { getModel, updateModel } = this.props;
        const ota = getModel("ota");
        let { transferParams, referenceText, transferFlow } = this.state;

        if (this.fromNextScreen) {
            this.fromNextScreen = false;
            transferParams = this.props.route.params.transferParams;
        }

        const lengthCheck = referenceText.replace(/\s/g, "");
        let validate = false;
        validate = referenceRegexOtherBank(referenceText);
        const referenceEdit = this.props.route.params?.referenceEdit ?? false;
        if (lengthCheck.length <= 0) {
            this.setState({
                showLocalErrorMessage: TRANSFER_REFERENCE_ERROR,
                showLocalError: true,
            });
        } else if (lengthCheck.length <= 2) {
            this.setState({
                showLocalErrorMessage: PLEASE_INPUT_VALID_RECIPIENT_REFERENCE,
                showLocalError: true,
            });
        } else if (!validate) {
            this.setState({
                showLocalErrorMessage: PLEASE_REMOVE_INVALID_SPECIAL_CHARACTERS,
                showLocalError: true,
            });
        } else {
            Keyboard.dismiss();
            console.log("TransferReferenceScreen transferParams ==> ", transferParams);
            this.setState({ showLocalError: false });
            transferParams.reference = referenceText;

            const stateData = {};

            console.log("_proceedToNextScreen ota ==> ", ota);
            // Fetch CASA accounts
            //const casaAccounts = await this.fetchAccountsList();
            stateData.transferParams = transferParams;
            // Check for S2u registration
            //passing new paramerter updateModel for s2u interops
            let transactionFlag;
            if (transferFlow === 2 && parseInt(transferParams.tacIndicator) === 0) {
                transactionFlag = FAV_MAYBANK_THIRD_PARTY_TRANSFER;
            }
            if (
                transferFlow === 5 &&
                parseInt(transferParams.tacIndicator) === 0 &&
                referenceEdit
            ) {
                transactionFlag =
                    transferParams?.transactionMode === DUITNOW_INSTANT_TRANSFER
                        ? FAV_MAYBANK_IBFT
                        : FAV_MAYBANK_IBG;
            }
            const { flow, secure2uValidateData, isUnderCoolDown } = await checks2UFlow(
                this.state.functionsCode,
                getModel,
                updateModel,
                transactionFlag
            );
            console.log(
                "[TransferReferenceScreen] >> [_proceedToNextScreen] secure2uValidateData : ",
                secure2uValidateData
            );
            console.log(
                "[TransferReferenceScreen] >> [_proceedToNextScreen] transferFlow : ",
                transferFlow
            );
            console.log("[TransferReferenceScreen] >> [_proceedToNextScreen] flow : ", flow);
            stateData.flow = flow;
            stateData.secure2uValidateData = secure2uValidateData;
            console.log("_proceedToNextScreen _proceedToNextScreen stateData ==> ", stateData);
            console.log("_proceedToNextScreen _proceedToNextScreen flow ==> ", flow);
            const { routeFrom, favorite, amount } = transferParams;
            const isFavAnd10KAbove =
                secure2uValidateData?.s2uFavTxnFlag === "Y" &&
                favorite &&
                (parseFloat(amount.replace(/,/g, "")) >=
                    parseFloat(secure2uValidateData?.s2uFavTxnLimit) ??
                    10000);
            let stack = TAB_NAVIGATOR;
            let screen = "Tab";
            //get the origin screen
            const route = routeFrom || "Dashboard";
            console.log("route ", routeFrom);
            if (route === "WalletMainDashboard") {
                stack = TAB_NAVIGATOR;
                screen = "Dashboard";
            } else if (route === "AccountDetails") {
                stack = BANKINGV2_MODULE;
                screen = ACCOUNT_DETAILS_SCREEN;
            }
            if (
                (transferFlow === 1 || transferFlow === 2 || transferFlow === 3) &&
                !referenceEdit
            ) {
                Keyboard.dismiss();
                if (
                    flow === SECURE2U_COOLING ||
                    (isFavAnd10KAbove &&
                        isUnderCoolDown &&
                        (transferFlow === 2 || transferFlow === 5))
                ) {
                    const {
                        navigation: { navigate },
                    } = this.props;
                    navigateToS2UCooling(navigate);
                } else if (
                    flow === S2UFlowEnum.s2uReg ||
                    (isFavAnd10KAbove &&
                        secure2uValidateData?.pull === "NA" &&
                        (transferFlow === 2 || transferFlow === 5))
                ) {
                    stateData.flowType = flow;
                    console.log("_proceedToNextScreen stateData ==> ", stateData);
                    this.props.navigation.navigate(ONE_TAP_AUTH_MODULE, {
                        screen: "Activate",
                        params: {
                            flowParams: {
                                success: {
                                    stack: FUNDTRANSFER_MODULE,
                                    screen: TRANSFER_CONFIRMATION_SCREEN,
                                },
                                fail: {
                                    stack,
                                    screen,
                                },
                                params: { ...stateData, isFavAnd10KAbove },
                            },
                        },
                    });
                } else {
                    this.props.navigation.navigate(TRANSFER_CONFIRMATION_SCREEN, {
                        secure2uValidateData,
                        transferParams,
                        flow,
                        stateData,
                        isFavAnd10KAbove,
                    });
                }
            } else {
                if (referenceEdit) {
                    Keyboard.dismiss();
                    this.props.navigation.navigate(TRANSFER_CONFIRMATION_SCREEN, {
                        secure2uValidateData,
                        transferParams,
                        flow,
                        stateData,
                        isFavAnd10KAbove,
                    });
                } else {
                    Keyboard.dismiss();
                    this.props.navigation.navigate(TRANSFER_TYPE_MODE_SCREEN, {
                        secure2uValidateData,
                        transferParams,
                        flow,
                        stateData,
                    });
                }
            }
        }
    };

    /***
     * _onBackPress
     * On Back button click handler
     */
    _onBackPress = () => {
        console.log("[TransferReferenceScreen] >> [_onBackPress] : ");
        this.props.navigation.goBack();
    };

    render() {
        const { showErrorModal, errorMessage } = this.state;
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
                                    fontWeight="600"
                                    lineHeight={19}
                                    text={TRANSFER_TO_HEADER}
                                />
                            }
                            headerLeftElement={<HeaderBackButton onPress={this._onBackPress} />}
                        />
                    }
                    useSafeArea
                    paddingHorizontal={0}
                    paddingBottom={0}
                    neverForceInset={["bottom"]}
                >
                    <React.Fragment>
                        <View style={Styles.container}>
                            <View style={Styles.blockNew}>
                                <View style={Styles.titleContainerTransferNew}>
                                    <AccountDetailsView
                                        data={this.state.screenData}
                                        image={this.state.image}
                                        base64={this.state.transferParams !== 1}
                                    />
                                </View>

                                <View style={Styles.descriptionContainerAmount}>
                                    <Typo
                                        fontSize={14}
                                        fontWeight="normal"
                                        fontStyle="normal"
                                        letterSpacing={0}
                                        lineHeight={19}
                                        color="#000000"
                                        textAlign="left"
                                        text={ENTER_RECIPIENT_REFERENCE}
                                    />
                                </View>

                                <View style={Styles.amountViewTransfer}>
                                    <TextInput
                                        maxLength={20}
                                        onChangeText={this._onTextInputValueChanged}
                                        value={this.state.referenceText}
                                        isValidate={this.state.showLocalError}
                                        errorMessage={this.state.showLocalErrorMessage}
                                        onSubmitEditing={this._onTextDone}
                                        clearButtonMode="while-editing"
                                        returnKeyType="done"
                                        placeholder=""
                                        editable={true}
                                        autoFocus
                                    />
                                </View>
                            </View>
                        </View>
                        <View style={Styles.footerButton}>
                            <ActionButton
                                disabled={this.state.referenceText.length < 3}
                                fullWidth
                                borderRadius={25}
                                onPress={this._proceedToNextScreen}
                                backgroundColor={
                                    this.state.referenceText.length < 3 ? DISABLED : YELLOW
                                }
                                componentCenter={
                                    <Typo
                                        color={
                                            this.state.referenceText.length < 3
                                                ? DISABLED_TEXT
                                                : BLACK
                                        }
                                        text={CONTINUE}
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={18}
                                    />
                                }
                            />
                        </View>
                    </React.Fragment>
                </ScreenLayout>
            </ScreenContainer>
        );
    }
}

TransferReferenceScreen.propTypes = {
    getModel: PropTypes.func,
    navigation: PropTypes.object,
    route: PropTypes.object,
    updateModel: PropTypes.func,
};

export default withModelContext(TransferReferenceScreen);
