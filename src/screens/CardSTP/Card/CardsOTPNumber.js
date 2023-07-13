import PropTypes from "prop-types";
import React, { useState, useEffect, useCallback } from "react";

import ConfirmNumberScreen from "@screens/CommonScreens/ConfirmNumberScreen";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import OtpModal from "@components/Modals/OtpModal";
import Popup from "@components/Popup";
import { showErrorToast } from "@components/Toast";

import { requestTAC } from "@services";

import { MEDIUM_GREY } from "@constants/colors";
import { COMMON_ERROR_MSG } from "@constants/strings";

import { maskedMobileNumber } from "@utils";
import { contactBankcall } from "@utils/dataModel/utility";

function CardsOTPNumber({ navigation, route }) {
    const [notMine, setNotMine] = useState(false);
    const [showOTP, setShowOTP] = useState(false);
    const [token, setToken] = useState(null);
    const [idNumber] = useState(route?.params?.idNum);
    const [mobileNumber] = useState(route?.params?.mobileNum);
    const [maskedMobileNo, setMaskedMobileNumber] = useState("");
    const [flow] = useState(route?.params?.flow);

    useEffect(() => {
        init();
    }, [init]);

    const init = useCallback(() => {
        setMaskedMobileNumber(maskedMobileNumber(mobileNumber));
    }, [mobileNumber]);

    function handleBack() {
        navigation.canGoBack() && navigation.goBack();
    }

    function handleProceedOtp() {
        requestOTP();
    }

    function handleCloseNotMine() {
        setNotMine(false);
    }

    function handleNotMine() {
        setNotMine(true);
    }

    function handleCallHotline() {
        handleCloseNotMine();

        contactBankcall("1300886688");
    }

    function showOTPModal() {
        setShowOTP(true);
    }
    function hideOTPModal() {
        setShowOTP(false);
    }
    function onOTPDone(otp) {
        /*const params = route?.params ?? {};
        navigation.navigate("CardsPersonalDetails", {
            ...params,
        });*/
        verifyOTPApi(otp);
    }

    async function verifyOTPApi(otp) {
        const param = {
            mobileNo: mobileNumber,
            idNumber: idNumber,
            otp: otp,
            transactionType: flow === "RESUME" ? "CARD_STP" : "CARD_STP_VERIFY",
            preOrPostFlag: "prelogin",
            idNo: idNumber,
        };
        const url =
            flow === "RESUME" ? "loan/ntb/v1/cardStp/cardSTPResume" : "mae/ntb/api/v1/requestTAC";
        const httpResp = await requestTAC(param, true, url).catch((error) => {
            console.log("[requestOTP] >> Exception: ", error);
        });
        hideOTPModal();
        const result = flow === "RESUME" ? httpResp?.data?.result ?? null : httpResp?.data ?? null;
        if (!result) {
            return;
        }
        const statusCode = result?.statusCode ?? null;
        const statusDesc = result?.statusDesc ?? null;
        const completeSaveData = result?.completeSaveData ?? null;

        if (statusCode !== "0000") {
            handleBack();
            showErrorToast({
                message: statusDesc || COMMON_ERROR_MSG,
            });
            return;
        }
        if (flow === "RESUME") {
            //cardResumeNTBApi();
            if (completeSaveData && completeSaveData.length <= 0) {
                showErrorToast({
                    message: "Sorry, no resume application available.",
                });
                return;
            }
            navigation.navigate("STPCardModule", {
                screen: "CardsResumeLanding",
                params: {
                    postLogin: false,
                    serverData: {},
                    resumeData: result,
                    entryStack: "More",
                    entryScreen: "Apply",
                },
            });
        } else {
            navigation.navigate("CardsPersonalDetails", {
                ...route?.params,
            });
        }
    }

    function closeOTPModal() {
        setShowOTP(false);
        setToken(null);
    }
    function onOTPClose() {
        closeOTPModal();
    }

    function onOTPResend(showOTPCb) {
        requestOTP(true, showOTPCb);
    }

    const requestOTP = useCallback(
        async (
            isResend = false,
            showOTPCb = () => {
                /*need to add*/
            }
        ) => {
            const param = {
                mobileNo: mobileNumber,
                otp: "",
                idNo: idNumber ? idNumber : route?.params?.userAction?.idNumber?.displayValue,
                transactionType: "CARD_STP",
                preOrPostFlag: "prelogin",
            };

            //const url = (flow === ETBWOM2U)? "/mae/ntb/api/v1/requestTAC":"/mae/ntb/api/v1/requestTAC";
            //showOTPModal();
            const httpResp = await requestTAC(param).catch((error) => {
                console.log("[requestOTP] >> Exception: ", error);
            });
            const statusCode = httpResp?.data?.statusCode ?? null;
            const statusDesc = httpResp?.data?.statusDesc ?? null;

            if (statusCode !== "0000") {
                showErrorToast({
                    message: statusDesc || COMMON_ERROR_MSG,
                });
                return;
            }

            const serverToken = httpResp?.data?.token ?? null;
            // Update token and show OTP modal
            setToken(serverToken);
            showOTPModal();
            if (isResend) showOTPCb();
        },
        [idNumber, mobileNumber, route?.params?.userAction?.idNumber?.displayValue]
    );

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <ScreenLayout
                paddingBottom={0}
                paddingTop={0}
                paddingHorizontal={20}
                neverForceInset={["bottom"]}
                useSafeArea
                scrollable
                header={
                    <HeaderLayout headerLeftElement={<HeaderBackButton onPress={handleBack} />} />
                }
            >
                <ConfirmNumberScreen
                    reqType="OTP"
                    otpText="One Time Password"
                    mobileNumber={maskedMobileNo}
                    btnText="Confirm"
                    subBtnText="Not Mine"
                    onConfirmBtnPress={handleProceedOtp}
                    onNotMeBtnPress={handleNotMine}
                />
            </ScreenLayout>
            <Popup
                visible={notMine}
                onClose={handleCloseNotMine}
                title="Contact Bank"
                description="For any enquiries regarding your account, please call the Customer Care Hotline at 1 300 88 6688."
                primaryAction={{
                    text: "Call Now",
                    onPress: handleCallHotline,
                }}
            />
            {/* OTP Modal */}
            {showOTP && (
                <OtpModal
                    otpCode={token}
                    onOtpDonePress={onOTPDone}
                    onOtpClosePress={onOTPClose}
                    onResendOtpPress={onOTPResend}
                    mobileNumber={maskedMobileNo}
                />
            )}
        </ScreenContainer>
    );
}

CardsOTPNumber.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

export default CardsOTPNumber;
