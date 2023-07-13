import PropTypes from "prop-types";
import React, { Component } from "react";

import ConfirmNumberScreen from "@screens/CommonScreens/ConfirmNumberScreen";

import * as navigationConstant from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import OtpModal from "@components/Modals/OtpModal";
import Popup from "@components/Popup";
import { showErrorToast } from "@components/Toast";

import { withModelContext } from "@context";

import { requestTAC } from "@services";

import { MEDIUM_GREY } from "@constants/colors";
import {
    CALL_NOW,
    CONFIRM,
    CONTACT_BANK,
    ENQ_CST_CARE,
    NOT_MINE,
    ONE_TIME_PASSWORD,
    PLSTP_UD_MYKAD,
} from "@constants/strings";

import { maskedMobileNumber } from "@utils";
import { contactBankcall, convertMayaMobileFormat } from "@utils/dataModel/utility";

import * as MAEOnboardController from "./Onboarding/MAEOnboardController";

class MAEOTPConformation extends Component {
    static navigationOptions = ({ navigation: { navigate } }) => ({
        title: "",
        header: null,
    });
    static propTypes = {
        getModel: PropTypes.func,
        route: PropTypes.object,
        navigation: PropTypes.object,
    };
    constructor(props) {
        super(props);
        this.state = {
            filledUserDetails: props.route?.params?.filledUserDetails,
            mobileNumber: props.route?.params?.filledUserDetails?.onBoardDetails?.mobileNumber,
            selectedIDType: props.route?.params?.filledUserDetails?.onBoardDetails2?.selectedIDType,
            notMine: false,
            maybankNumber: "1300886688",
            displayOtpFlow: false,
            token: "",
        };
    }

    componentDidMount() {
        console.log("[MAESuccessfulScreen] >> [componentDidMount]");
        const { mobileNumber } = this.state;
        const formatNumber = convertMayaMobileFormat(mobileNumber);
        const maskedNumber = maskedMobileNumber(formatNumber);

        this.setState({
            mobileNumber: maskedNumber,
        });
    }

    onBackPress = () => {
        this.props.navigation.goBack();
    };

    onConfirmPress = () => {
        console.log("MAEOTPConfirmation ::: onConfirmPress");
        this.requestTacMessageFormat();
    };

    onNotMinePress = () => {
        console.log("MAEOTPConfirmation ::: onNotMinePress");
        this.setState({
            notMine: true,
        });
    };

    handleCloseNotMine = () => {
        console.log("MAEOTPConfirmation ::: handleCloseNotMine");
        this.setState({
            notMine: false,
        });
    };

    handleCallHotline = () => {
        this.handleCloseNotMine();
        contactBankcall(this.state.maybankNumber);
    };

    requestTacMessageFormat = (resendCB) => {
        console.log("[MAEOTPConfirmation] >> [requestTacMessageFormat]");
        let idNo = "";
        if (this.state.selectedIDType === PLSTP_UD_MYKAD) {
            idNo = this.state.filledUserDetails.onBoardDetails2.mykadNumber;
        } else {
            idNo = this.state.filledUserDetails.onBoardDetails2.passportNumber;
        }
        const data = {
            mobileNo: this.state.filledUserDetails.onBoardDetails.mobileNumber,
            idNo,
            transactionType: "MAE_ENROL_OTP",
            otp: "",
            preOrPostFlag: "prelogin",
        };
        this.requestOTP(data, "requestOTP", resendCB);
    };

    requestOTP = (data, from, otpModalCb) => {
        requestTAC(data)
            .then((response) => {
                const result = response.data;
                if (result.statusCode === "0000") {
                    if (from === "requestOTP") {
                        this.setState({ token: result.token, displayOtpFlow: true });
                        if (otpModalCb) {
                            otpModalCb();
                        }
                    } else {
                        this.setState({ displayOtpFlow: false });
                        if (this.state.filledUserDetails.onBoardDetails2.from === "NewMAE") {
                            this.createUserAccount();
                        } else if (
                            this.state.filledUserDetails.onBoardDetails2.from === "ResumeMAE"
                        ) {
                            const { filledUserDetails } = this.state;
                            this.props.navigation.navigate(navigationConstant.MAE_M2U_USERNAME, {
                                filledUserDetails,
                            });
                        } else {
                            const { filledUserDetails } = this.state;
                            this.props.navigation.navigate(
                                navigationConstant.MAE_ONBOARD_DETAILS4,
                                { filledUserDetails }
                            );
                        }
                    }
                    return;
                }
                if (from === "confirmOTP") {
                    otpModalCb(result.statusDesc);
                    return;
                }
                showErrorToast({
                    message: result.statusDesc,
                });
            })
            .catch((error) => {
                console.log(`is Error`, error);
                showErrorToast({
                    message: error.message,
                });
            });
    };

    createUserAccount = async () => {
        const { isOnboard } = this.props.getModel("user");
        const { trinityFlag } = this.props.getModel("mae");
        const { isZoloz } = this.props.getModel("misc");
        const response = await MAEOnboardController.createMAE(
            this.state.filledUserDetails,
            isOnboard,
            trinityFlag,
            isZoloz
        );
        if (response.message) {
            showErrorToast({
                message: response.message,
            });
        } else {
            const result = response.data.result;
            if (result.statusCode === "0000") {
                const filledUserDetails = this.prepareUserDetails(result);
                this.props.navigation.navigate(navigationConstant.MAE_M2U_USERNAME, {
                    filledUserDetails,
                });
                return;
            }
            showErrorToast({
                message: result.statusDesc,
            });
        }
    };

    prepareUserDetails = (result) => {
        console.log("MAEOTPConformation >> [prepareUserDetails]");
        const MAEUserDetails = this.state.filledUserDetails || {};
        MAEUserDetails.MAEAccountCreateResult = result;
        return MAEUserDetails;
    };

    onOtpPress = (code, otpModalErrorCb) => {
        console.log("[MAEOTPConfirmation] >> [onOtpPress]");

        const idNo = this.state.filledUserDetails.onBoardDetails2.idNo;
        const data = {
            mobileNo: this.state.filledUserDetails.onBoardDetails.mobileNumber,
            idNo,
            transactionType: "MAE_ENROL_OTP_VERIFY",
            otp: code,
            preOrPostFlag: "prelogin",
        };
        this.requestOTP(data, "confirmOTP", otpModalErrorCb);
    };
    onOtpClosePress = () => {
        console.log("[MAEOTPConfirmation] >> [onOtpClosePress]");
        this.setState({ displayOtpFlow: false });
        const { filledUserDetails } = this.state;
        this.props.navigation.navigate(filledUserDetails?.entryStack || "More", {
            screen: filledUserDetails?.entryScreen || "Apply",
            params: filledUserDetails?.entryParams,
        });
    };
    onResendOtpPress = (resendCB) => {
        console.log("[MAEOTPConfirmation] >> [onResendOtpPress]");
        this.requestTacMessageFormat(resendCB);
    };

    render() {
        const { notMine, mobileNumber, displayOtpFlow } = this.state;
        return (
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                <>
                    <ScreenLayout
                        paddingBottom={0}
                        paddingTop={16}
                        paddingHorizontal={24}
                        header={
                            <HeaderLayout
                                headerLeftElement={<HeaderBackButton onPress={this.onBackPress} />}
                            />
                        }
                        useSafeArea
                    >
                        <ConfirmNumberScreen
                            reqType="OTP"
                            otpText={ONE_TIME_PASSWORD}
                            mobileNumber={mobileNumber}
                            btnText={CONFIRM}
                            subBtnText={NOT_MINE}
                            onConfirmBtnPress={this.onConfirmPress}
                            onNotMeBtnPress={this.onNotMinePress}
                        />
                    </ScreenLayout>
                    {displayOtpFlow && (
                        <OtpModal
                            otpCode={this.state.token}
                            onOtpDonePress={this.onOtpPress}
                            onOtpClosePress={this.onOtpClosePress}
                            onResendOtpPress={this.onResendOtpPress}
                            mobileNumber={mobileNumber}
                        />
                    )}
                    <Popup
                        visible={notMine}
                        onClose={this.handleCloseNotMine}
                        title={CONTACT_BANK}
                        description={ENQ_CST_CARE}
                        primaryAction={{
                            text: CALL_NOW,
                            onPress: this.handleCallHotline,
                        }}
                    />
                </>
            </ScreenContainer>
        );
    }
}

export default withModelContext(MAEOTPConformation);
