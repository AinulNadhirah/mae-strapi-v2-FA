import React, { Component } from "react";
import { View, Text } from "react-native";
import PropTypes from "prop-types";
import * as Strings from "@constants/strings";
import * as navigationConstant from "@navigation/navigationConstant";
// // import CustomFlashMessage from "@components/Toast";
import { showInfoToast, showErrorToast } from "@components/Toast";
import FlashMessage from "react-native-flash-message";
import NavigationService from "@navigation/navigationService";
import { createOtp } from "@services/index";
import OtpEnter from "@components/OtpEnter";
import { BLUE_BACKGROUND_COLOR } from "@constants/colors";
import ScreenContainer from "@components/Containers/ScreenContainer";
import ScreenLayout from "@layouts/ScreenLayout";
import HeaderLayout from "@layouts/HeaderLayout";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import HeaderLabel from "@components/Label/HeaderLabel";
import { withModelContext } from "@context";
import ChallengeQuestion from "@components/RSA/ChallengeQuestion";

// travelling data
let transferInfo = null;

class TacScreen extends Component {
    static propTypes = {
        getModel: PropTypes.func,
    };
    constructor(props) {
        super(props);
        transferInfo = props.route.params?.transferInfo;
        this.state = {
            ...transferInfo,
            // RSA State Objects
            isRSARequired: false,
            challengeQuestion: "",
            challengeRequest: {},
            isRSALoader: true,
            RSACount: 0,
            RSAError: false,
        };

        console.log("TacScreen:transferInfo----------", props.route.params);
        console.log("TacScreen:state----------", this.state);
    }

    componentDidMount() {
        this.focusSubscription = this.props.navigation.addListener("focus", () => {
            this.forceUpdate();
        });

        // setTimeout(() => this.props.route.params.onSuccess(), 5000);
        this.getTac();
    }

    componentWillUnmount() {
        this.focusSubscription();
    }

    // -----------------------
    // EVENT HANDLER
    // -----------------------

    onBackPress = () => {
        this.props.navigation.pop();
    };

    onClosePress = () => {
        // TODO: close popup
        NavigationService.navigate(navigationConstant.WALLET_VIEW_ACCOUNT);
    };

    onTacDonePress = async (code) => {
        console.log("onTacDonePress", code);
        this.callTransferApi(code);
        // this.callpayJompay(code);
    };

    onResentTacPress = () => {
        console.log("onResentTacPress");
        this.getTac();
    };

    // -----------------------
    // GET UI
    // -----------------------

    getHeaderUI = () => {
        return (
            <HeaderLayout
                horizontalPaddingMode="custom"
                horizontalPaddingCustomLeftValue={24}
                horizontalPaddingCustomRightValue={24}
                // headerLeftElement={<HeaderBackButton onPress={this.onBackPress} />}
                headerCenterElement={
                    <HeaderLabel>
                        <Text>TAC</Text>
                    </HeaderLabel>
                }
                headerRightElement={<HeaderCloseButton onPress={this.onClosePress} />}
            />
        );
    };

    getTacUI = () => {
        return (
            <OtpEnter
                onDonePress={this.onTacDonePress}
                title={Strings.DIGIT_TAC} // Strings.ONE_TIME_PASSWORD + " / " +
                securepin={false}
                description={Strings.ENTER_YOUR_DIGIT_TAC} // Strings.ENTER_OTP_SENT + " / " +
                footer={Strings.RESEND_TAC} // Strings.RESEND_OTP + " / " +
                withTouch={false}
                disabled={false}
                onFooterPress={this.onResentTacPress}
            />
        );
    };

    renderChallengeQuestions = () => {
        return (
            <ChallengeQuestion
                loader={this.state.isRSALoader}
                display={this.state.isRSARequired}
                displyError={this.state.RSAError}
                questionText={this.state.challengeQuestion}
                onSubmitPress={this.onChallengeQuestionSubmitPress}
                onSnackClosePress={this.onChallengeSnackClosePress}
            />
        );
    };

    // -----------------------
    // API CALL
    // -----------------------

    getTac = () => {
        console.log("getTac");
        let params = this.props.route.params.tagParams;

        createOtp("/tac", params)
            .then((result) => {
                const responsedata = result.data;
                console.log("responsedata:", responsedata);
                if (responsedata.statusDesc.toLowerCase() == "success") {
                    const message = `${responsedata.token}`;

                    showInfoToast({
                        message: `Your TAC no. is ${message}`,
                        position: "top",
                        duration: 6000,
                    });
                } else {
                    const message = `${responsedata.statusDesc}`;
                    showInfoToast({
                        message: message,
                        position: "top",
                        duration: 6000,
                    });
                }
            })
            .catch((err) => {
                console.log("err:", err);
                const message = `${err}`;
                showErrorToast({
                    message: message,
                });
            });
    };

    callTransferApi = (token) => {
        let params = { ...this.props.route.params.transferInfo, tac: token };
        const { transferApi } = this.props.route.params;
        console.log("xxxcallTransferApi respone:", params);
        transferApi(params)
            .then(async (result) => {
                const response = result.data;

                this.callTransferApiSuccess(response);
            })
            .catch((data) => {
                console.log("ERR", response);
            });
    };

    callTransferApiSuccess = (result) => {
        console.log("callTransferApi response:", response);
        this.setState(
            {
                // update state values
                isRSARequired: false,
                isRSALoader: false,
            },
            () => {
                // Add Completion
                const nextParamToPass = {
                    ...this.prepareTransferInfo(response, this.props.route.params.tagParams),
                };

                // TODO: onLoginSuccess
                this.props.navigation.navigate(navigationConstant.PAYBILLS_MODULE, {
                    screen: navigationConstant.PAYBILLS_ACKNOWLEDGE_SCREEN,
                    params: nextParamToPass,
                });
            }
        );
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
                this.jomPayTacBillRequest(this.state.challengeRequest);
            }
        );
    };

    // -----------------------
    // OTHER PROCESS
    // -----------------------

    prepareTransferInfo = (transferResponse, tagParams) => {
        // notes: please custom transferInfo data only containt data that needed on next screen
        let transferInfo = {
            transferInfo: this.props.route.params.transferInfo,
            transferResponse,
            tagParams,
        };
        return transferInfo;
    };

    render() {
        console.log("render", this.state);
        return (
            <ScreenContainer backgroundType="color" backgroundColor={BLUE_BACKGROUND_COLOR}>
                <React.Fragment>
                    <ScreenLayout
                        scrollable={false}
                        header={this.getHeaderUI()}
                        paddingLeft={0}
                        paddingRight={0}
                        paddingBottom={0}
                    >
                        <View style={Styles.mainContainer}>
                            {this.getTacUI()}
                            {this.renderChallengeQuestions()}
                        </View>
                    </ScreenLayout>
                    <FlashMessage />
                </React.Fragment>
            </ScreenContainer>
        );
    }
}

TacScreen.propTypes = {
    navigation: PropTypes.object.isRequired,
    getModel: PropTypes.func,
};

TacScreen.defaultProps = {
    navigation: {},
    onSuccess: () => {},
};

export default withModelContext(TacScreen);

const Styles = {
    mainContainer: {
        flex: 1,
    },
};

// MOCL
const paybillsuccessmock = {
    statusCode: "0",
    statusDescription: null,
    serverDate: "8 Apr 2020, 11:03 PM",
    transactionRefNumber: "MB11111117179767218M",
    amount: "1.87",
    toCardNo: "72203656",
    message: "Success",
    token: null,
    rsaStatus: null,
    challenge: null,
    maskCardNo: "****3656",
};

/*
tac mock request

{
   "statusCode":"0",
   "statusDesc":"Success",
   "token":"884858",
   "smsSentStatus":1,
   "responseStatus":"0000",
   "smsMessage":"BILL_PAYMENT_OTP",
   "tacMobileUpdate":"",
   "tokenSuccessful":true
}
*/

/*
paybill mock res - failed
{
   "statusCode":"200",
   "statusDescription":"Please wait a few minutes and try again.",
   "serverDate":"8 Apr 2020, 12:35 AM",
   "transactionRefNumber":"MB11111117179754015M",
   "amount":"14.95",
   "toCardNo":"1234567890",
   "message":"Failure",
   "token":null,
   "rsaStatus":null,
   "challenge":null,
   "maskCardNo":"******7890"
}
*/
/*
paybill mock res - success
{
   "statusCode":"0",
   "statusDescription":null,
   "serverDate":"8 Apr 2020, 11:03 PM",
   "transactionRefNumber":"MB11111117179767218M",
   "amount":"1.87",
   "toCardNo":"72203656",
   "message":"Success",
   "token":null,
   "rsaStatus":null,
   "challenge":null,
   "maskCardNo":"****3656"
}
*/

/*
validate secure 2u
{
   "status":"M000",
   "code":"200",
   "text":"success",
   "payload":[
      {
         "registration_attempts":0,
         "device_status":1,
         "hardware_id":"358240051111110",
         "device_name":"generic x86 64",
         "mdip_id":"42387ffb-327e-400d-a2e9-677902ffba7c",
         "updateMutliOTP":false,
         "updateGCM":false,
         "updatePublicKey":false
      }
   ],
   "s2uInfo":{
      "s2u_enabled":true,
      "action_flow":"TAC"
   },
   "rsaStatus":null,
   "challenge":null
}
*/

/*
get account list

{
   "message":"success",
   "code":0,
   "result":{
      "total":9334.59,
      "name":"Accounts",
      "maeAvailable":true,
      "productGroupings":[
         {
            "total":248.74,
            "name":"Current",
            "colorCode":"#74D1D8"
         },
         {
            "total":9085.83,
            "name":"Saving",
            "colorCode":"#359D07"
         },
         {
            "total":0.02,
            "name":"MAE",
            "colorCode":"#1684B1"
         }
      ],
      "accountListings":[
         {
            "name":"Savings Account",
            "code":"11",
            "type":"S",
            "group":"11S",
            "number":"1140138214170000000",
            "certs":0,
            "balance":"8,983.06",
            "currentBalance":"8,983.06",
            "oneDayFloat":"0.00",
            "twoDayFloat":"0.00",
            "lateClearing":"0.00",
            "regNumber":null,
            "loanType":null,
            "value":8983.06,
            "primary":true,
            "supplementaryAvailable":false,
            "investmentType":null,
            "unitsInGrams":null
         },
         {
            "name":"MAE",
            "code":"0Y",
            "type":"D",
            "group":"0YD",
            "number":"5140129607600000000",
            "certs":0,
            "balance":"0.02",
            "currentBalance":"0.02",
            "oneDayFloat":"0.00",
            "twoDayFloat":"0.00",
            "lateClearing":"0.00",
            "regNumber":null,
            "loanType":null,
            "value":0.02,
            "primary":false,
            "supplementaryAvailable":false,
            "investmentType":null,
            "unitsInGrams":null
         },
         {
            "name":"Current Account-i",
            "code":"05",
            "type":"D",
            "group":"05D",
            "number":"5640170352530000000",
            "certs":0,
            "balance":"31.54",
            "currentBalance":"31.54",
            "oneDayFloat":"0.00",
            "twoDayFloat":"0.00",
            "lateClearing":"0.00",
            "regNumber":null,
            "loanType":null,
            "value":31.54,
            "primary":false,
            "supplementaryAvailable":false,
            "investmentType":null,
            "unitsInGrams":null
         },
         {
            "name":"Premier 1 Account",
            "code":"0D",
            "type":"D",
            "group":"0DD",
            "number":"5140121031540000000",
            "certs":0,
            "balance":"217.20",
            "currentBalance":"217.20",
            "oneDayFloat":"0.00",
            "twoDayFloat":"0.00",
            "lateClearing":"0.00",
            "regNumber":null,
            "loanType":null,
            "value":217.20,
            "primary":false,
            "supplementaryAvailable":false,
            "investmentType":null,
            "unitsInGrams":null
         },
         {
            "name":"Savings Account-i",
            "code":"13",
            "type":"S",
            "group":"13S",
            "number":"1640178105890000000",
            "certs":0,
            "balance":"102.77",
            "currentBalance":"102.77",
            "oneDayFloat":"0.00",
            "twoDayFloat":"0.00",
            "lateClearing":"0.00",
            "regNumber":null,
            "loanType":null,
            "value":102.77,
            "primary":false,
            "supplementaryAvailable":false,
            "investmentType":null,
            "unitsInGrams":null
         }
      ]
   }
}
*/

// to remove -------
// ----tacparam
// let params = {
//     amount: transferInfo.amountText,
//     fromAcctNo: transferInfo.selectedAccount.acctNo,
//     fundTransferType: transferInfo.onUs ? "JOMPAY_ONE_OFF" : "JOMPAY_BILL_PAYMENT",
//     accCode: transferInfo.selectedAccount.acctCode,
//     toAcctNo: transferInfo.onUs ? transferInfo.billRef1 : transferInfo.billerAccount,
// };

// callpayJompay = (token) => {
// 	// To DO : use mobile SDK for RSA Integration
// 	const deviceInfo = this.props.getModel("device");
// 	const mobileSDK = Utility.getDeviceRSAInformation(deviceInfo.deviceInformation, DeviceInfo);

// 	const params = {
// 		amount: transferInfo.amountText,
// 		billRef1: transferInfo.billRef1,
// 		billRef2: transferInfo.billRef2,
// 		billerAccount: transferInfo.billerAccount,
// 		billerCode: transferInfo.billerCode,
// 		billerCodeName: transferInfo.billerCodeName,
// 		billerName: transferInfo.billerName,
// 		effectiveDate:
// 			moment(transferInfo.effectiveDate).diff(moment(new Date()), "days") == 0
// 				? "00000000"
// 				: moment(transferInfo.effectiveDate).format("YYYYMMDD"),
// 		favourite: transferInfo.isFav,
// 		fromAcctCode: transferInfo.selectedAccount.acctCode,
// 		fromAcctNo: transferInfo.selectedAccount.acctNo,
// 		fromAcctType: transferInfo.selectedAccount.acctType,
// 		msic: transferInfo.msic,
// 		nbpsRef: transferInfo.nbpsRef,
// 		payeeCode: transferInfo.payeeCode,
// 		routingCode: transferInfo.routingCode,
// 		rrnDynamic: transferInfo.rrnDynamic,
// 		rtnRequired: transferInfo.rtnRequired,
// 		sig: transferInfo.sig,
// 		systemRef: transferInfo.systemRef,
// 		tac: token,
// 		timestamp: transferInfo.timestamp,
// 		toAcctNo: transferInfo.billerAccount,
// 		validateSig: transferInfo.validateSig,
// 		mobileSDKData: mobileSDK, // Required For RSA
// 	};
// 	this.setState({ challengeRequest: params });
// 	this.jomPayTacBillRequest(params);
// };

// jomPayTacBillRequest = (params) => {
// 	payJompay(params)
// 		.then((result) => {
// 			const response = result.data;
// 			this.setState(
// 				{
// 					// update state values
// 					isRSARequired: false,
// 					isRSALoader: false,
// 				},
// 				() => {
// 					// Add Completion
// 					const nextParamToPass = {
// 						...this.prepareTransferInfo(transferRespone),
// 						paymentStatus:
// 							response.statusDescription.toLowerCase() == "success" ? "1" : "0",
// 						paymentAdditionalStatus: response.additionalStatus,
// 					};

// 					NavigationService.navigate(navigationConstant.JOMPAY_ACKNOWLEDGE_SCREEN, {
// 						transferInfo: nextParamToPass,
// 					});
// 				}
// 			);
// 		})
// 		.catch((data) => {
// 			console.log("Error", data);
// 			if (data.status == 428) {
// 				// Display RSA Challenge Questions if status is 428
// 				this.setState((prevState) => ({
// 					challengeRequest: {
// 						...prevState.challengeRequest,
// 						challenge: data.error.challenge,
// 					},
// 					loader: false,
// 					isRSARequired: true,
// 					isRSALoader: false,
// 					challengeQuestion: data.error.challenge.questionText,
// 					RSACount: prevState.RSACount + 1,
// 					RSAError: prevState.RSACount > 0,
// 				}));
// 			} else if (data.status == 423) {
// 				NavigationService.resetAndNavigateToModule(
// 					navigationConstant.FUNDTRANSFER_MODULE,
// 					navigationConstant.TRANSFER_ACKNOWLEDGE_SCREEN,
// 					{ errorMessge: data.error.challenge.errorMessage }
// 				);
// 			} else {
// 				const nextParamToPass = {
// 					...this.prepareTransferInfo(
// 						data.error.transactionRefNumber,
// 						data.error.serverDate
// 					),
// 					paymentStatus: 0,
// 					paymentAdditionalStatus: data.error.message,
// 				};
// 				NavigationService.navigate(navigationConstant.JOMPAY_ACKNOWLEDGE_SCREEN, {
// 					transferInfo: nextParamToPass,
// 				});
// 			}
// 		});
// };
