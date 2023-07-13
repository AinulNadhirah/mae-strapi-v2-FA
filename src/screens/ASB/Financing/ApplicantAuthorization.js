import PropTypes from "prop-types";
import React, { useCallback, useState, useEffect } from "react";
import { View, Animated, StyleSheet } from "react-native";

import ConfirmNumberScreen from "@screens/CommonScreens/ConfirmNumberScreen";

import {
    NONIETAPPLICATIONFINANCINGSUCCESSFUL,
    NONIETAPPLICATIONFINANCINGUNSUCCESSFUL,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import OtpModal from "@components/Modals/OtpModal";
import Popup from "@components/Popup";
import { showErrorToast } from "@components/Toast";

import { useModelController } from "@context";

import { applicationAcceptanceApi, asbRequestTac, verifyApplicationWithTAC } from "@services";
import { logEvent } from "@services/analytics";

import { MEDIUM_GREY } from "@constants/colors";
import {
    COMMON_ERROR_MSG,
    FA_SCREEN_NAME,
    FA_VIEW_SCREEN,
    APPLICATION_FAILD,
    APPLICATION_FAILD_DEC,
    OKAY,
    CALL_NOW,
    CONTACT_BANK,
    NOT_MINE,
    CONFIRM,
    OTP_TEXT,
    ONE_TIME_PASSWORD,
    ENQ_CST_CARE,
} from "@constants/strings";

import { contactBankcall, phoneNumberMaskNew } from "@utils/dataModel/utility";

function ApplicantAuthorization(props) {
    const [showOTP, setShowOTP] = useState(false);
    const [otpCode, setOtpCode] = useState("");
    const { getModel } = useModelController();
    const [notMine, setNotMine] = useState(false);
    const [idNumber] = useState(props.route?.params?.idNumber);
    const { navigation } = props;
    const [selectedAccountNo] = useState(props.route?.params?.selectedAccountNo);
    const [stpReferenceNo] = useState(props.route?.params?.stpReferenceNo);
    const [showPopupTimeout, setShowPopupTimeout] = useState(false);
    this.bannerAnimate = new Animated.Value(0);
    const userDetails = getModel("user");
    const { mobileNumber } = userDetails;

    useEffect(() => {
        init();
    }, []);

    const init = async () => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Apply_ASBFinancing_ReviewFinancingDetails",
        });
        try {
            console.log("ENTERED ->>");
        } catch (e) {
            console.log(e);
        }
    };
    function onBackTap() {
        props.navigation.goBack();
    }

    const requestOTP = useCallback(
        async (
            isResend = false,
            showOTPCb = () => {
                /*need to add*/
            }
        ) => {
            const body = {
                mobileNo: mobileNumber,
                idNo: idNumber,
                fundTransferType: "ASB_NON_IET_OTP_REQ",
                preOrPostFlag: "prelogin",
            };

            const response = await asbRequestTac(body);
            const race = response?.data;

            if (race.statusCode === "0") {
                console.log("OTP IS : ", race.token);
                // showInfoToast(race.token);
                setOtpCode(race.token);
                setShowOTP(true);
                if (isResend) showOTPCb();
            } else if (race.errors) {
                showErrorToast({
                    message: race.errors[0].message,
                });
            } else {
                showErrorToast({
                    message: COMMON_ERROR_MSG,
                });
            }
        },

        []
    );

    function onOTPModalDismissed() {
        setShowOTP(false);
        setOtpCode("");
    }

    async function onOTPResendButtonPressed(showOTPCb) {
        requestOTP(true, showOTPCb);
    }

    async function verifyOTP(otp) {
        const body = {
            mobileNo: mobileNumber,
            idNo: idNumber,
            fundTransferType: "ASB_NON_IET_OTP_VERIFY",
            preOrPostFlag: "prelogin",
            tacNumber: otp,
        };

        const response = await verifyApplicationWithTAC(body);
        const race = response?.data;

        if (race.responseStatus === "0000" && race.statusDesc === "Success") {
            onOTPDoneButtonPressed();
        } else if (race.errors[0].code === "200") {
            onOTPModalDismissed();
            showErrorToast({
                message: "Invalid OTP",
            });
        } else {
            onOTPModalDismissed();
            showErrorToast({
                message: COMMON_ERROR_MSG,
            });
        }
    }

    const onOTPDoneButtonPressed = async () => {
        try {
            const body = {
                stpReferenceNo,
                action: "A",
                acctNumber: selectedAccountNo,
            };

            const response = await applicationAcceptanceApi(body, false);

            if (response.data.code === 200) {
                navigation.navigate(NONIETAPPLICATIONFINANCINGSUCCESSFUL, {
                    submitResponse: response.data.result,
                });
            } else if (
                response.data.code === 9999 ||
                response.data.code === 504 ||
                response.data.code === 408
            ) {
                onOTPModalDismissed();
                setShowPopupTimeout(true);
            } else {
                navigation.navigate(NONIETAPPLICATIONFINANCINGUNSUCCESSFUL, {
                    submitResponse: response.data.result,
                });
            }
        } catch (error) {
            showErrorToast({
                message: COMMON_ERROR_MSG,
            });
        } finally {
            setShowOTP(false);
            setOtpCode("");
        }
    };

    function handleProceedOtp() {
        requestOTP();
    }
    function handleNotMine() {
        setNotMine(true);
    }
    function handleCloseNotMine() {
        setNotMine(false);
    }
    function handleCallHotline() {
        handleCloseNotMine();
        contactBankcall("1300886688");
    }

    async function handleTimeoutBtn() {
        setShowPopupTimeout(false);
    }

    function onPopupTimeoutClose() {
        setShowPopupTimeout(false);
    }

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <ScreenLayout
                paddingBottom={0}
                paddingTop={0}
                paddingHorizontal={0}
                useSafeArea
                header={
                    <HeaderLayout
                        headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                        headerRightElement={<HeaderCloseButton onPress={onBackTap} />}
                    />
                }
                neverForceInset={["bottom"]}
                paddingLeft={0}
                paddingRight={0}
            >
                <View style={Style.confirmNoStyle}>
                    <ConfirmNumberScreen
                        reqType={OTP_TEXT}
                        otpText={ONE_TIME_PASSWORD}
                        mobileNumber={phoneNumberMaskNew(mobileNumber)}
                        btnText={CONFIRM}
                        subBtnText={NOT_MINE}
                        onConfirmBtnPress={handleProceedOtp}
                        onNotMeBtnPress={handleNotMine}
                    />
                </View>
            </ScreenLayout>
            <Popup
                visible={notMine}
                onClose={handleCloseNotMine}
                title={CONTACT_BANK}
                description={ENQ_CST_CARE}
                primaryAction={{
                    text: CALL_NOW,
                    onPress: handleCallHotline,
                }}
            />
            <Popup
                visible={showPopupTimeout}
                onClose={onPopupTimeoutClose}
                title={APPLICATION_FAILD}
                description={APPLICATION_FAILD_DEC}
                primaryAction={{
                    text: OKAY,
                    onPress: handleTimeoutBtn,
                }}
            />
            {/* OTP Modal */}
            {showOTP && (
                <OtpModal
                    mobileNumber={phoneNumberMaskNew(mobileNumber)}
                    otpCode={otpCode}
                    onOtpClosePress={onOTPModalDismissed}
                    onOtpDonePress={verifyOTP}
                    onResendOtpPress={onOTPResendButtonPressed}
                    isFromAsbTac={true}
                />
            )}
        </ScreenContainer>
    );
}

ApplicantAuthorization.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
};

export default ApplicantAuthorization;

const Style = StyleSheet.create({
    confirmNoStyle: {
        flex: 1,
        paddingHorizontal: 25,
    },
});
