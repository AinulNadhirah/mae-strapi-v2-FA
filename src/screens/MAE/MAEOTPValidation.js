import React, { Component } from "react";
import { Text, View, StatusBar, TouchableOpacity } from "react-native";
import FlashMessage from "react-native-flash-message";

import * as navigationConstant from "@navigation/navigationConstant";
import NavigationService from "@navigation/navigationService";

import { HeaderPageIndicator, NextRightButton, ErrorMessage } from "@components/Common";
import OtpEnter from "@components/OtpEnter";

// import CustomFlashMessage from "@components/Toast";
import { requestTAC, maeCreateAccount } from "@services/index";

import * as Strings from "@constants/strings";

import * as DataModel from "@utils/dataModel";
// import commonStyle from "@styles/main";
import * as ModelClass from "@utils/dataModel/modelClass";

import styles from "@styles/MAE/AccountDashboardStyle";

class MAEOTPValidation extends Component {
    static navigationOptions = ({ navigation: { navigate } }) => ({
        title: "",
        header: null,
    });

    constructor(props) {
        super(props);

        this.state = {
            requestType: "",
            isValidated: false,
            alertText: "",
            mobilenumber: "",
            isError: false,
            errorText: "",
        };
    }

    componentDidMount() {
        console.log("[MAEOTPValidation] >> [componentDidMount]");

        this._onShowOTPTost();
    }

    _onShowOTPTost = () => {
        console.log("[MAEOTPValidation] >> [_onShowOTPTost]");
        if (ModelClass.COMMON_DATA.showTacOtp) {
            if (ModelClass.MAE_CUSTOMER_DETAILS.token.length > 1) {
                // CustomFlashMessage.showContentSaveMessageLong(
                //     "Your OTP no. is " + ModelClass.MAE_CUSTOMER_DETAILS.token,
                //     "",
                //     "top",
                //     "info",
                //     6000,
                //     "#ffde00"
                // );
            }
        }
    };

    showErrorPopup = (msg) => {
        console.log("[MAEOTPValidation] >> [showErrorPopup]");

        this.setState({
            isError: true,
            errorText: msg,
        });
    };

    /*********** API CALLS ***********/

    verifyTAC = (otp) => {
        console.log("[MAEOTPValidation] >> [verifyTAC]");

        var url = "mae/api/v1/requestTAC";
        var data = JSON.stringify({
            mobileNo: ModelClass.MAE_CUSTOMER_DETAILS.mobileNumber,
            //Sabir
            idNo: ModelClass.MAE_CUSTOMER_DETAILS.userIDNumber,
            transactionType: "MAE_ENROL_OTP_VERIFY",
            otp: otp,
            preOrPostFlag: ModelClass.MAE_CUSTOMER_DETAILS.preOrPostFlag,
        });

        if (ModelClass.MAE_CUSTOMER_DETAILS.preOrPostFlag == "postlogin") {
            url = "mae/api/v1/requestTACETB";
        }

        requestTAC(data, true, url)
            .then((response) => {
                console.log("[MAEOTPValidation][verifyTAC] >> Success");
                let result = response.data;
                var statusCode = result.statusCode;
                var statusDesc = result.statusDesc;

                switch (statusCode) {
                    case "0000":
                        this.maeCreateAccount();
                        break;
                    default:
                        this.showErrorPopup(statusDesc ? statusDesc : Strings.COMMON_ERROR_MSG);
                        break;
                }
            })
            .catch((error) => {
                console.log("[MAEOTPValidation][verifyTAC] >> Failure");
                this.showErrorPopup(Strings.COMMON_ERROR_MSG);
            });
    };

    maeCreateAccount = () => {
        console.log("[MAEOTPValidation] >> [maeCreateAccount]");

        var url = "/mae/api/v1/createAccount";
        var data = JSON.stringify({
            customerName: ModelClass.MAE_CUSTOMER_DETAILS.fullName,
            idNo: ModelClass.MAE_CUSTOMER_DETAILS.userIDNumber,
            idType: ModelClass.MAE_CUSTOMER_DETAILS.selectedIDCode,
            birthDate: ModelClass.MAE_CUSTOMER_DETAILS.custDOB,
            mobileNo: ModelClass.MAE_CUSTOMER_DETAILS.mobileNumber,
            customerEmail: ModelClass.MAE_CUSTOMER_DETAILS.maeCustEmail,
            preOrPostFlag: ModelClass.MAE_CUSTOMER_DETAILS.preOrPostFlag,
            ocrData: "",
            idImg: ModelClass.MAE_CUSTOMER_DETAILS.idFrontImgData,
            selfieImg: ModelClass.MAE_CUSTOMER_DETAILS.selfieImgData,
            citizenship: ModelClass.MAE_CUSTOMER_DETAILS.passportCountryCode,
            pdpa: ModelClass.MAE_CUSTOMER_DETAILS.pdpa,
            uscitizenSelected: ModelClass.MAE_CUSTOMER_DETAILS.uscitizenSelected,
            fatcaUSTaxID: ModelClass.MAE_CUSTOMER_DETAILS.fatcaUSTaxID,
            state: ModelClass.MAE_CUSTOMER_DETAILS.state,
            fatcaStateValue: ModelClass.MAE_CUSTOMER_DETAILS.fatcaStateValue,
            fatcaTin: ModelClass.MAE_CUSTOMER_DETAILS.fatcaTin,
            crsCitizenSelected: ModelClass.MAE_CUSTOMER_DETAILS.crsCitizenSelected,
            crsState: ModelClass.MAE_CUSTOMER_DETAILS.crsState,
            crsStateValue: ModelClass.MAE_CUSTOMER_DETAILS.crsStateValue,
            crsTin: ModelClass.MAE_CUSTOMER_DETAILS.crsTin,
            transactionType: "MAE_ACCT_ENROL",
            referalCode: ModelClass.MAE_CUSTOMER_DETAILS.maeCustInviteCode,
            addr1: ModelClass.MAE_CUSTOMER_DETAILS.addr1,
            addr2: ModelClass.MAE_CUSTOMER_DETAILS.addr2,
            addr3: ModelClass.MAE_CUSTOMER_DETAILS.addr3,
            addr4: ModelClass.MAE_CUSTOMER_DETAILS.addr4,
            custStatus: ModelClass.MAE_CUSTOMER_DETAILS.custStatus,
            m2uIndicator: ModelClass.MAE_CUSTOMER_DETAILS.m2uIndicator,
            postCode: ModelClass.MAE_CUSTOMER_DETAILS.postCode,
            gcif: ModelClass.MAE_CUSTOMER_DETAILS.gcif,
            // its very Old Code So we are using model class object
            accountType: ModelClass.MAE_CUSTOMER_DETAILS.accountType,
            pepDeclaration: ModelClass.MAE_CUSTOMER_DETAILS.pepDeclaration,
        });

        if (ModelClass.MAE_CUSTOMER_DETAILS.preOrPostFlag == "postlogin") {
            url = "/mae/api/v1/createAccountETB";
        }
        maeCreateAccount(data, true, url)
            .then((response) => {
                console.log("[MAEOTPValidation][maeCreateAccount] >> Success");
                let result = response.data.result;
                var statusCode = result.statusCode;
                var statusDesc = result.statusDesc;

                switch (statusCode) {
                    case "0000":
                        // Store MAE account creation information locally
                        ModelClass.MAE_CUSTOMER_DETAILS.accessNo = result.accessNo;
                        ModelClass.MAE_CUSTOMER_DETAILS.acctNo = result.acctNo;
                        ModelClass.MAE_CUSTOMER_DETAILS.debitCardNo = result.debitCardNo;
                        ModelClass.MAE_CUSTOMER_DETAILS.expiryDate = result.expiryDate;
                        ModelClass.MAE_CUSTOMER_DETAILS.inviteCode = result.inviteCode;
                        ModelClass.MAE_CUSTOMER_DETAILS.refNo = result.refNo;

                        if (ModelClass.MAE_CUSTOMER_DETAILS.isM2ULinked == "Y") {
                            this.props.navigation.navigate(navigationConstant.ETB_ONBOARD_SUCC);
                        } else if (
                            ModelClass.MAE_CUSTOMER_DETAILS.isM2ULoggedIn == "Y" &&
                            ModelClass.MAE_CUSTOMER_DETAILS.hasM2UAccess == "Y"
                        ) {
                            this.props.navigation.navigate(navigationConstant.ETB_ONBOARD_SUCC);
                        } else {
                            // Navigate to Create M2U account screen
                            this.props.navigation.navigate(navigationConstant.MAE_CREATE_M2U);
                        }
                        break;
                    default:
                        this.showErrorPopup(statusDesc ? statusDesc : Strings.COMMON_ERROR_MSG);
                        break;
                }
            })
            .catch((error) => {
                console.log("[MAEOTPValidation][maeCreateAccount] >> Failure");
                this.showErrorPopup(Strings.COMMON_ERROR_MSG);
            });
    };

    render() {
        return (
            <View style={styles.containerBlue}>
                <HeaderPageIndicator
                    showBack={false}
                    showClose={true}
                    showIndicator={true}
                    showTitle={true}
                    showBackIndicator={true}
                    pageTitle={""}
                    showTitleCenter={true}
                    numberOfPages={3}
                    currentPage={3}
                    moduleName={navigationConstant.MAE_MODULE_STACK}
                    navigation={this.props.navigation}
                    routeName={navigationConstant.MAE_ACC_DASHBOARD}
                />

                <OtpEnter
                    onDonePress={async (code) => {
                        this.verifyTAC(code);
                    }}
                    title="One Time Password"
                    description="Enter OTP sent to your mobile number \n"
                    footer={
                        ModelClass.COMMON_DATA.otpScreen === "1"
                            ? Strings.RESEND_OTP_EMAIL
                            : Strings.RESEND_OTP_EMAIL
                    }
                    withTouch={false}
                    disabled={false}
                    otpScreen={true}
                    onFooterPress={async () => {
                        console.log("OTP Resended");
                        DataModel.maeRequestOTP(this);
                    }}
                />

                <FlashMessage style={{ marginBottom: 30, alignedText: "center" }} />

                {/* Error popup */}
                {this.state.isError && this.state.errorText != "" ? (
                    <ErrorMessage
                        onClose={() => {
                            this.setState({
                                isError: false,
                                errorText: "",
                            });
                        }}
                        title="Alert"
                        description={this.state.errorText}
                        showOk={true}
                        onOkPress={() => {
                            this.setState({
                                isError: false,
                                errorText: "",
                            });
                        }}
                    />
                ) : null}
            </View>
        );
    }
}

export default MAEOTPValidation;
