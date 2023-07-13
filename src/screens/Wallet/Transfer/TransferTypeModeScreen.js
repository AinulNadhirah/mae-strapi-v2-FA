import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, Keyboard } from "react-native";

import {
    ONE_TAP_AUTH_MODULE,
    FUNDTRANSFER_MODULE,
    TRANSFER_CONFIRMATION_SCREEN,
    TRANSFER_REFERENCE_AMOUNT,
    TAB_NAVIGATOR,
    BANKINGV2_MODULE,
    ACCOUNT_DETAILS_SCREEN,
    TRANSFER_USER_NAME,
    SECURE2U_AFTER_TRANSACTION,
    SECURE2U_COOLING,
} from "@navigation/navigationConstant";
import navigationService from "@navigation/navigationService";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import { AccountDetailsView, ScrollPickerView } from "@components/Common";
import { Dropdown } from "@components/Common/DropDownButtonCenter";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";
import { showErrorToast, hideToast } from "@components/Toast";

import { withModelContext } from "@context";

import { fundTransferInquiryApi, getPaymentType } from "@services/";
import { GATransfer } from "@services/analytics/analyticsTransfer";

import { MEDIUM_GREY, YELLOW, DISABLED, DISABLED_TEXT, BLACK } from "@constants/colors";
import { FUND_TRANSFER_TYPE_INTERBANK } from "@constants/fundConstants";
import {
    AMOUNT_ERROR,
    PLEASE_SELECT_YOUR_TRANSFER_TYPE,
    ACCOUNT_NUMBER_INVALID,
    SELECT_TRANSFER_TYPE,
    INSTANT_TRANSFER,
    TRANSFER_TYPE,
    TRANSFER_MODE,
    CONTINUE,
    DUITNOW_INSTANT_TRANSFER,
    FAV_MAYBANK_IBFT,
    FAV_MAYBANK_IBG,
    TRANSFER_TO_HEADER,
} from "@constants/strings";

import { checks2UFlow, getTransferAccountType } from "@utils/dataModel/utility";
import { S2UFlowEnum } from "@utils/dataModel/utilityEnum";

import Styles from "@styles/Wallet/TransferEnterAmountStyle";

("use strict");

class TransferTypeModeScreen extends Component {
    static navigationOptions = { title: "", header: null };

    /***
     * constructor
     * props
     */
    constructor(props) {
        super(props);
        this.state = {
            amountText: "00.0",
            transferTypeList: [],
            transferType: "",
            showTransferType: false,
            transferModeList: [],
            transferMode: "",
            showTransferMode: false,
            errorMsg: "",
            error: false,
            errorMessageTxt: "",
            loader: false,
            showScrollPickerView: false,
            list: [],
            selectedIndex: 0,
            editFlow: 1,
            selectedTypeIndex: 0,
            showScrollPickerModeView: false,
            selectedModeIndex: 0,
            transferFlow: 0,
            screenData: {
                image: "",
                name: "",
                description1: "",
                description2: "",
            },
            transferParams: {},
            image: "",
            errorPassword: false,
            errorMessage: "",
            disabled: false,
            functionsCode: 0,
            transactionMode: "",
            serviceFee: "",
        };
        this.isLoaded = false; //FIXME: Just a workaround for now - MMLA-43584
    }

    /***
     * componentDidMount
     * Update Screen date
     */
    async componentDidMount() {
        console.log("[TransferTypeModeScreen] >> [componentDidMount] : ");
        //Update Screen data
        this._updateDataInScreen();
        this.focusSubscription = this.props.navigation.addListener("focus", () => {
            console.log("[TransferTypeModeScreen] >> [componentDidMount] focusSubscription : ");
            //Update Screen Every time come back
            if (this.isLoaded) this._updateDataInScreen();
        });
        console.log("this.state.transferFlow ==> ", this.state.transferFlow);
    }

    /***
     * componentWillUnmount
     * Handle Screen UnMount Event
     */
    componentWillUnmount() {
        console.log("[TransferTypeModeScreen] >> [componentWillUnmount] : ");
        this.focusSubscription();
    }

    /**
     * _updateDataInScreen
     * Update Screen data
     */
    _updateDataInScreen = async () => {
        console.log("[TransferTypeModeScreen] >> [_updateDataInScreen] : ");
        Keyboard.dismiss();

        const transferParams = this.props.route.params?.transferParams ?? this.state.screenData;
        console.log(
            "[TransferTypeModeScreen] >> [_updateDataInScreen] transferParams : ",
            transferParams
        );

        const screenData = {
            image: transferParams.image,
            name: transferParams.formattedToAccount,
            description1: transferParams.accountName,
            description2: transferParams.bankName,
        };

        GATransfer.viewScreenTransferTypeMode(getTransferAccountType(transferParams.transferFlow));

        this.setState(
            {
                transferParams,
                errorMessage: AMOUNT_ERROR,
                screenData,
                transferFlow: transferParams.transferFlow,
                functionsCode: transferParams.functionsCode,
                transferMode: this.props.route.params.transferParams.transactionMode,
            },
            () => {
                // if (this.state.transferFlow === 5) {
                console.log(
                    "🚀 ~ file: TransferTypeModeScreen.js ~ line 156 ~ TransferTypeModeScreen ~ this.focusSubscription=this.props.navigation.addListener ~ this.isLoaded",
                    this.isLoaded
                );
                console.log(
                    "🚀 ~ file: TransferTypeModeScreen.js ~ line 156 ~ TransferTypeModeScreen ~ this.focusSubscription=this.props.navigation.addListener ~ this.isLoaded",
                    this.isLoaded
                );
                console.log(
                    "🚀 ~ file: TransferTypeModeScreen.js ~ line 156 ~ TransferTypeModeScreen ~ this.focusSubscription=this.props.navigation.addListener ~ this.isLoaded",
                    this.isLoaded
                );
                console.log(
                    "🚀 ~ file: TransferTypeModeScreen.js ~ line 156 ~ TransferTypeModeScreen ~ this.focusSubscription=this.props.navigation.addListener ~ this.isLoaded",
                    this.isLoaded
                );
                //     this._setTransferPaymentCode();
                // }
                // this._setTransferPaymentCode();
                this._getPaymentType();
            }
        );
    };

    /***
     * _updateDataInScreenAlways
     * Update Screen Every time come back
     */
    _updateDataInScreenAlways = async () => {
        console.log("[TransferTypeModeScreen] >> [_updateDataInScreenAlways] : ");
    };

    /***
     * _getPaymentType
     * getPaymentType from Api
     */
    _getPaymentType = () => {
        console.log("[TransferTypeModeScreen] >> [_getPaymentType] : ");
        /*Get Favorite List*/
        Keyboard.dismiss();
        const { transferParams } = this.state;
        const { swiftCode, bankCode } = transferParams;
        console.log(
            "[TransferTypeModeScreen] >> [_getPaymentType] transferParams : ",
            transferParams
        );
        console.log("[TransferTypeModeScreen] >> [_getPaymentType] swiftCode : ", swiftCode);
        console.log("fetchFavoriteListData");
        //Get Payment Type Api
        getPaymentType(swiftCode, bankCode)
            .then((response) => {
                const result = response.data;
                console.log(" _getPaymentType result==> ", result);
                if (result) {
                    const interbankPaymentTypeList = result.interbankPaymentTypeList;
                    console.log(
                        " _getPaymentType interbankPaymentTypeList ==> ",
                        interbankPaymentTypeList
                    );
                    //Update Payment Type
                    if (interbankPaymentTypeList) {
                        this._setTransferPaymentCode(interbankPaymentTypeList, transferParams);
                    }
                    const interbankPaymentModeList = result.interbankPaymentModeList;
                    //Update Payment Mode
                    if (interbankPaymentModeList) {
                        this._setTransferPaymentMode(interbankPaymentModeList, transferParams);
                    }
                    this.isLoaded = true;
                }
            })
            .catch((Error) => {
                console.log(" favoriteListApi ERROR: ", Error);
                this.isLoaded = true;
            });
    };

    /***
     * _onRightButtonModePress
     * On payment Mode Done Press
     */
    _onRightButtonModePress = (value, index) => {
        const { transferParams } = this.state;
        transferParams.transactionMode = value.type;
        transferParams.serviceFee = value.serviceFee;
        console.log(
            "[TransferTypeModeScreen] >> [_onRightButtonModePress] transferParams ",
            transferParams
        );
        this.setState({
            transferParams,
            selectedModeIndex: index,
            showScrollPickerModeView: false,
            showTransferMode: false,
            transferMode: value.type,
            serviceFee: value.serviceFee,
        });
    };

    /***
     * _onLeftButtonModePress
     * On payment Mode cancel Press close the drop down
     */
    _onLeftButtonModePress = (value, index) => {
        console.log("[TransferTypeModeScreen] >> [_onLeftButtonModePress]");

        this.setState({
            showScrollPickerModeView: false,
        });
    };

    /***
     * _onRightButtonPress
     * On payment Type Done Press
     */
    _onRightButtonPress = (value, index) => {
        console.log("[TransferTypeModeScreen] >> [_onRightButtonPress]", value);
        const { transferParams } = this.state;
        transferParams.transactionType = value.type;
        transferParams.selectedPaymentType = value.type;
        transferParams.paymentType = value.paymentType;
        transferParams.paymentTypeFavorites = value.paymentTypeFavorites;
        transferParams.interbankPaymentType = value.interbankPaymentType;
        transferParams.paymentCode = value.paymentCode;
        console.log("TransferTypeModeScreen _onRightButtonPress transferParams ", transferParams);

        this.setState({
            transferParams,
            selectedTypeIndex: index,
            selectedIndex: index,
            showScrollPickerView: false,
            showTransferType: false,
            transferType: value.type,
        });
    };

    /***
     * _onLeftButtonPress
     * On payment Type  cancel Press close the drop down
     */
    _onLeftButtonPress = (value, index) => {
        console.log("[TransferTypeModeScreen] >> [_onLeftButtonPress]");
        console.log("value ", value);
        console.log("index ", index);
        this.setState({
            showScrollPickerView: false,
        });
    };

    /***
     * _setTransferPaymentCode
     * Set Transfer Payment Type
     */
    _setTransferPaymentCode(typeList, transferParams) {
        console.log(
            "[TransferTypeModeScreen] >> [_setTransferPaymentCode] typeList ==> ",
            typeList
        );

        //  let typeList = TRANSFER_TYPE;
        let selectedPaymentType = "";

        //let { transferParams } = this.state;
        console.log(
            "[TransferTypeModeScreen] >> [_setTransferPaymentCode] transferParams : ",
            transferParams
        );
        const interbankPaymentType = transferParams.interbankPaymentType;
        const paymentCode = transferParams.paymentCode;
        console.log(
            "[TransferTypeModeScreen] >> [_setTransferPaymentCode] interbankPaymentType ==> ",
            interbankPaymentType
        );
        const typeListNew = [];
        if (typeList != undefined) {
            for (let i = 0; i < typeList.length; i++) {
                const obj = typeList[i];
                const objNew = { ...obj };

                objNew.id = i;
                objNew.index = i;
                objNew.paymentType = i.toString();
                objNew.paymentTypeFavorites = i.toString();
                objNew.description = obj.description;
                objNew.type = obj.description;
                objNew.name = obj.description;
                objNew.selected = false;
                objNew.isSelected = false;
                objNew.interbankPaymentType = obj.interbankPaymentType;
                objNew.const = obj.interbankPaymentType;
                objNew.paymentCode = obj.paymentCode;
                objNew.bankCode = obj.bankCode;
                objNew.swiftCode = obj.swiftCode;
                console.log(
                    "[TransferTypeModeScreen] >> [_setTransferPaymentCode] interbankPaymentType==> : ",
                    objNew.interbankPaymentType
                );
                if (paymentCode && paymentCode === obj.paymentCode) {
                    console.log(
                        "[TransferTypeModeScreen] >> [_setTransferPaymentCode] SAME objNew ==> : ",
                        objNew
                    );
                    selectedPaymentType = objNew.type;
                    objNew.selected = true;
                    //const value = objNew;
                    console.log(
                        "[TransferTypeModeScreen] >> [_setTransferPaymentCode] SAME objNew.interbankPaymentType : ",
                        objNew.interbankPaymentType
                    );
                    console.log(
                        "[TransferTypeModeScreen] >> [_setTransferPaymentCode] SAME objNew.paymentType : ",
                        objNew.paymentType
                    );
                    console.log(
                        "[TransferTypeModeScreen] >> [_setTransferPaymentCode] SAME objNew.type : ",
                        objNew.type
                    );
                    console.log(
                        "[TransferTypeModeScreen] >> [_setTransferPaymentCode] SAME objNew.selectedPaymentType : ",
                        objNew.selectedPaymentType
                    );

                    transferParams.transactionType = objNew.type;
                    transferParams.selectedPaymentType = objNew.type;
                    transferParams.paymentType = objNew.paymentType;
                    transferParams.paymentTypeFavorites = objNew.paymentTypeFavorites;
                    transferParams.interbankPaymentType = objNew.interbankPaymentType;
                    transferParams.paymentCode = objNew.paymentCode;
                } else {
                    objNew.selected = false;
                }

                typeListNew.push(objNew);
            }
        }
        console.log(
            "[TransferTypeModeScreen] >> [_setTransferPaymentCode] typeListNew : ",
            typeListNew
        );

        console.log(
            "[TransferTypeModeScreen] >> [_setTransferPaymentCode] Selected transferParams : ",
            transferParams
        );
        //this.setState({ transferTypeList: typeList });
        //Update Payment Type
        this.setState({
            transferType: selectedPaymentType,
            transferTypeList: typeListNew,
            transferParams,
        });

        console.log(
            "[TransferTypeModeScreen] >> [_setTransferPaymentCode] Selected selectedPaymentType",
            selectedPaymentType
        );
        console.log(
            "[TransferTypeModeScreen] >> [_setTransferPaymentCode] Selected typeListNew  ",
            typeListNew
        );
    }

    /***
     * _setTransferPaymentMode
     * Set Transfer Payment Mode
     */
    _setTransferPaymentMode(typeList, transferParams) {
        console.log("[TransferTypeModeScreen] >> [_setTransferPaymentMode]");
        console.log(
            "[TransferTypeModeScreen] >> [_setTransferPaymentMode] typeList ==> ",
            typeList
        );

        //  let typeList = TRANSFER_TYPE;
        let transactionMode = "";

        //let { transferParams } = this.state;
        console.log(
            "[TransferTypeModeScreen] >> [_setTransferPaymentMode] transferParams : ",
            transferParams
        );
        const interbankPaymentType = transferParams.paymentType;
        console.log(
            "[TransferTypeModeScreen] >> [_setTransferPaymentMode] transferParams interbankPaymentType ==> ",
            interbankPaymentType
        );
        const typeListNew = [];
        if (typeList != undefined) {
            for (let i = 0; i < typeList.length; i++) {
                const obj = typeList[i];
                const objNew = { ...obj };

                objNew.id = i;
                objNew.index = i;
                objNew.paymentType = i.toString();
                objNew.paymentTypeFavorites = i.toString();
                objNew.description = obj.description;
                objNew.type = obj.description;
                objNew.name = obj.description;
                objNew.selected = false;
                objNew.isSelected = false;
                objNew.interbankPaymentMode = obj.interbankPaymentMode;
                objNew.const = obj.interbankPaymentMode;
                objNew.serviceFee = obj.serviceFee;

                console.log(
                    "[TransferTypeModeScreen] >> [_setTransferPaymentMode] interbankPaymentType==> ",
                    objNew.interbankPaymentMode
                );
                if (i === 0) {
                    transactionMode = objNew.type;
                    objNew.selected = true;
                    //const value = objNew;

                    console.log(
                        "[TransferTypeModeScreen] >> [_setTransferPaymentMode] interbankPaymentType==> Same : ",
                        objNew.interbankPaymentMode
                    );
                    console.log(
                        "[TransferTypeModeScreen] >> [_setTransferPaymentMode] paymentType==> Same",
                        objNew.interbankPaymentMode
                    );
                    console.log(
                        "[TransferTypeModeScreen] >> [_setTransferPaymentMode] type==> Same  : ",
                        transactionMode
                    );
                    transferParams.interbankPaymentMode = objNew.interbankPaymentMode;
                    transferParams.transactionMode = objNew.type;
                    transferParams.serviceFee = objNew.serviceFee;
                } else {
                    objNew.selected = false;
                }

                typeListNew.push(objNew);
            }
        }
        //this.setState({ transferTypeList: typeList });
        //Update Payment Mode
        this.setState({
            transactionMode,
            transferMode: transactionMode,
            transferModeList: typeListNew,
            transferParams,
        });
        console.log(
            "[TransferTypeModeScreen] >> [_setTransferPaymentMode] transferParams ",
            transferParams
        );
        console.log(
            "[TransferTypeModeScreen] >> [_setTransferPaymentMode] transactionMode  ==> ",
            transactionMode
        );
        console.log(
            "[TransferTypeModeScreen] >> [_setTransferPaymentMode] transferModeList  typeListNew==> ",
            typeListNew
        );
    }

    /***
     * _onConfirmClick
     * On Confirm Click
     */
    _onConfirmClick = () => {
        console.log("[TransferTypeModeScreen] >> [_onConfirmClick]");
        const { transferType } = this.state;
        if (transferType && transferType.length >= 1) {
            this._fundTransferInquiryApi();
        } else {
            setTimeout(() => {
                showErrorToast({
                    message: PLEASE_SELECT_YOUR_TRANSFER_TYPE,
                });
            }, 1);
        }
        //this.props.navigation.pop();
    };

    /***
     * _fundTransferInquiryApi
     * Other Bank Account Inquiry Api
     */
    _fundTransferInquiryApi = async () => {
        console.log("[TransferTypeModeScreen] >> [_fundTransferInquiryApi]");
        const { transferParams, transferMode } = this.state;
        const routeParams = this.props.route?.params;
        const secure2uValidateData1 = routeParams?.secure2uValidateData ?? {
            action_flow: "TAC",
        };
        const subUrl = "/fundTransfer/inquiry";
        let params = {};
        const stateData = {};
        const { getModel, updateModel } = this.props;
        const ota = getModel("ota");
        console.log("_fundTransferInquiryApi ota ==> ", ota);
        // Fetch CASA accounts
        //const casaAccounts = await this.fetchAccountsList();
        stateData.transferParams = transferParams;
        // Check for S2u registration
        //passing new paramerter updateModel for s2u interops
        let transactionFlag;
        if (parseInt(transferParams.tacIndicator) === 0) {
            transactionFlag =
                transferMode === DUITNOW_INSTANT_TRANSFER ? FAV_MAYBANK_IBFT : FAV_MAYBANK_IBG;
        }
        const { flow, secure2uValidateData, isUnderCoolDown } = await checks2UFlow(
            this.state.functionsCode,
            getModel,
            updateModel,
            transactionFlag
        );
        const isFavAnd10KAbove =
            secure2uValidateData?.s2uFavTxnFlag === "Y" &&
            transferParams?.transferFav &&
            (parseFloat(transferParams?.amount.replace(/,/g, "")) >=
                parseFloat(secure2uValidateData?.s2uFavTxnLimit) ??
                10000);
        stateData.flow = flow;
        transferParams.flow = flow;
        stateData.secure2uValidateData = secure2uValidateData;
        console.log("[TransferTypeModeScreen] >> [_fundTransferInquiryApi] flow 1 ", flow);
        if (flow === SECURE2U_COOLING || (isFavAnd10KAbove && isUnderCoolDown)) {
            navigationService.resetAndNavigateToModule(ONE_TAP_AUTH_MODULE, SECURE2U_COOLING, {
                isTransaction: true,
                showMessage: true,
            });
            return;
        }
        try {
            params = {
                bankCode: transferParams.bankCode,
                fundTransferType: FUND_TRANSFER_TYPE_INTERBANK,
                toAccount: transferParams.toAccount,
                payeeCode: transferParams.aquirerId,
                swiftCode: transferParams.swiftCode,
                interbankPaymentType: transferParams.interbankPaymentType,
            };

            if (this.state.transferMode === "GIRO") {
                transferParams.receiptTitle = "Transfer - GIRO";
                transferParams.transactionMode = this.state.transferMode;
                // not sure  what is stateData for
                stateData.transferParams = transferParams;
                if (!transferParams?.transferFav) {
                    this.props.navigation.navigate(TRANSFER_USER_NAME, {
                        secure2uValidateData,
                        transferParams: {
                            ...transferParams,
                            fundTransferInquiryApiParams: params,
                        },
                        flow,
                        stateData,
                    });
                    return;
                }

                params.interbankTransferType = "IBG";
            }

            console.log("params ==> ", params);
            const { routeFrom } = transferParams;
            let stack = TAB_NAVIGATOR;
            let screen = "Tab";
            //get the origin screen
            const route = routeFrom || "Dashboard";
            console.log("route ", routeFrom);
            if (route === "WalletMainDashboard") {
                stack = TAB_NAVIGATOR;
                screen = "Dashboard";
            } else if (route == "AccountDetails") {
                stack = BANKINGV2_MODULE;
                screen = ACCOUNT_DETAILS_SCREEN;
            }
            //fund Transfer Inquiry Api
            fundTransferInquiryApi(subUrl, params)
                .then(async (response) => {
                    const responseObject = response.data;

                    this.setState({ loader: false });

                    if (responseObject) {
                        const fullName =
                            this.state.transferMode === "GIRO"
                                ? transferParams.accountName
                                : responseObject.accountHolderName;

                        if (fullName != undefined && fullName.length >= 1) {
                            transferParams.accountName = fullName;
                            transferParams.recipientFullName = fullName;
                            transferParams.recipientName = fullName;
                            transferParams.transferProxyRefNo = responseObject.lookupReference;

                            console.log(
                                "[TransferTypeModeScreen] >> [_fundTransferInquiryApi] transferParams ",
                                transferParams
                            );

                            if (this.state.transferFlow === 4 || this.state.transferFlow === 5) {
                                /*IBFT Secure2u Flow*/
                                this.setState({
                                    transferParams,
                                });
                                console.log(
                                    "[TransferTypeModeScreen] >> [_fundTransferInquiryApi] flow 2 ",
                                    flow
                                );
                                if (
                                    flow === S2UFlowEnum.s2uReg ||
                                    (transferParams?.transferFav &&
                                        isFavAnd10KAbove &&
                                        secure2uValidateData?.pull === "NA" &&
                                        this.state.transferFlow === 5)
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
                                /*IBFT TAC Flow*/
                                hideToast();
                                console.log(
                                    "[TransferTypeModeScreen] >> [_fundTransferInquiryApi] transferParams Not 4 || 5 : ",
                                    this.state.transferFlow
                                );
                                this.props.navigation.navigate(TRANSFER_CONFIRMATION_SCREEN, {
                                    secure2uValidateData: secure2uValidateData1,
                                    transferParams,
                                    flow,
                                    stateData,
                                });
                            }
                        } else {
                            showErrorToast({
                                message: ACCOUNT_NUMBER_INVALID,
                                duration: 5000,
                                autoHide: true,
                            });
                        }
                    } else {
                        showErrorToast({
                            message: ACCOUNT_NUMBER_INVALID,
                            duration: 5000,
                            autoHide: true,
                        });
                    }
                    // }
                    // } else {
                    //     showErrorToast({
                    //         message: ACCOUNT_NUMBER_INVALID,
                    //         duration: 5000,
                    //         autoHide: true,
                    //     });
                    // }
                    // } else {
                    //     this.setState({ loader: false });
                    // }
                })
                .catch((error) => {
                    console.log(subUrl + " ERROR==> ", error);
                    const errorMessage =
                        error && error.message ? error.message : ACCOUNT_NUMBER_INVALID;
                    showErrorToast({
                        message: errorMessage,
                        duration: 5000,
                        autoHide: true,
                    });
                });
        } catch (e) {
            console.log(subUrl + " catch ERROR==> " + e);
        }
    };

    /***
     * _onTransferTypeClick
     * on Transfer Type Click update state
     */
    _onTransferTypeClick = () => {
        this.state.transferFlow == 5
            ? this.setState({ showTransferType: false })
            : this.setState({
                  selectedIndex: this.state.selectedTypeIndex,
                  editFlow: 1,
                  list: this.state.transferTypeList,
                  showScrollPickerView: true,
              });
    };

    /***
     * _onTransferTypeHeaderClick
     * on Transfer Type Header Click update state
     */
    _onTransferTypeHeaderClick = () => {
        this.state.transferType != undefined && this.state.transferType.length >= 1
            ? this.state.transferType
            : SELECT_TRANSFER_TYPE;
    };

    /***
     * _onTransferModeClick
     * on Transfer Mode Click update state
     */
    _onTransferModeClick = () => {
        this.setState({
            // selectedModeIndex: 0,
            editFlow: 2,
            list: this.state.transferModeList,
            showScrollPickerModeView: true,
        });
    };

    /***
     * _onTransferModeHeaderClick
     * on Transfer Mode Header Click update state
     */
    _onTransferModeHeaderClick = () => {
        this.state.transferMode != undefined && this.state.transferMode.length > 0
            ? this.state.transferMode
            : DUITNOW_INSTANT_TRANSFER;
    };

    /***
     * _onCloseErrorClick
     * on Close Error Click update state
     */
    _onCloseErrorClick = () => {
        console.log("showSnackBar hide button clicked!");
        this.setState({ errorPassword: false });
    };

    /***
     * _onBackPress
     * on Back Press Click
     */
    _onBackPress = () => {
        console.log("_onBackPress");
        //this.props.navigation.goBack();
        const { transferParams } = this.state;
        console.log("TransferTypeModeScreen transferParams ==> ", transferParams);
        this.props.navigation.navigate(TRANSFER_REFERENCE_AMOUNT, {
            transferParams,
        });
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
                >
                    <React.Fragment>
                        <View style={Styles.blockNew}>
                            <View style={Styles.titleContainerTransferNew}>
                                <AccountDetailsView
                                    base64={true}
                                    data={this.state.screenData}
                                    image={this.state.image}
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
                                    text={TRANSFER_TYPE}
                                />
                            </View>

                            <View style={Styles.descriptionContainerAmount}>
                                <Dropdown
                                    title={
                                        this.state.transferType != undefined &&
                                        this.state.transferType.length >= 1
                                            ? this.state.transferType
                                            : SELECT_TRANSFER_TYPE
                                    }
                                    disable={false}
                                    align="left"
                                    testID="transferType"
                                    accessibilityLabel="transferType"
                                    borderWidth={0.5}
                                    onPress={this._onTransferTypeClick}
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
                                    text={TRANSFER_MODE}
                                />
                            </View>
                            <View style={Styles.descriptionContainerAmount}>
                                <Dropdown
                                    title={
                                        this.state.transferMode != undefined &&
                                        this.state.transferMode.length > 0
                                            ? this.state.transferMode
                                            : DUITNOW_INSTANT_TRANSFER
                                    }
                                    disable={false}
                                    align="left"
                                    testID="transferMode"
                                    accessibilityLabel="transferMode"
                                    borderWidth={0.5}
                                    onPress={this._onTransferModeClick}
                                />
                            </View>
                        </View>
                        <View style={Styles.footerButton}>
                            <ActionButton
                                disabled={this.state.disabled}
                                fullWidth
                                borderRadius={25}
                                onPress={this._onConfirmClick}
                                backgroundColor={this.state.disabled ? DISABLED : YELLOW}
                                componentCenter={
                                    <Typo
                                        color={this.state.disabled ? DISABLED_TEXT : BLACK}
                                        text={CONTINUE}
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={18}
                                    />
                                }
                            />
                        </View>

                        <ScrollPickerView
                            showMenu={this.state.showScrollPickerView}
                            list={this.state.list}
                            selectedIndex={this.state.selectedIndex}
                            onRightButtonPress={this._onRightButtonPress}
                            onLeftButtonPress={this._onLeftButtonPress}
                            rightButtonText="Done"
                            leftButtonText="Cancel"
                        />

                        <ScrollPickerView
                            showMenu={this.state.showScrollPickerModeView}
                            list={this.state.list}
                            selectedIndex={this.state.selectedModeIndex}
                            onRightButtonPress={this._onRightButtonModePress}
                            onLeftButtonPress={this._onLeftButtonModePress}
                            rightButtonText="Done"
                            leftButtonText="Cancel"
                        />
                    </React.Fragment>
                </ScreenLayout>
            </ScreenContainer>
        );
    }
}
TransferTypeModeScreen.propTypes = {
    getModel: PropTypes.func,
    navigation: PropTypes.object,
    route: PropTypes.shape({
        params: PropTypes.shape({
            transferParams: PropTypes.any,
        }),
    }),
    updateModel: PropTypes.any,
};
export default withModelContext(TransferTypeModeScreen);
