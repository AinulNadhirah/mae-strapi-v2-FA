import PropTypes from "prop-types";
import React, { useState, useEffect, useCallback } from "react";

import { TAB_NAVIGATOR } from "@navigation/navigationConstant";

import ActionButton from "@components/Buttons/ActionButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import OtpModal from "@components/Modals/OtpModal";
import AcknowledgementScreenTemplate from "@components/ScreenTemplates/AcknowledgementScreenTemplate";
import Typography from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { useModelController, withModelContext } from "@context";

import { deleteAccess, requestTACDelete } from "@services";
import { clearAll } from "@services/localStorage";

import { DATE_AND_TIME, REFERENCE_ID, COMMON_ERROR_MSG } from "@constants/strings";

import { maskedMobileNumber } from "@utils";
import { getDeviceRSAInformation } from "@utils/dataModel/utility";
import { removeCustomerKey, removeRefreshToken } from "@utils/dataModel/utilitySecureStorage";

function M2UDeletion({ navigation, resetModel }) {
    const [showOTP, setShowOTP] = useState(false);
    const [token, setToken] = useState(null);
    const [maskedMobileNo, setMaskedMobileNumber] = useState("");

    const { getModel } = useModelController();
    const [loadingDelete, setLoadingDelete] = useState(true);
    const [showAcknowledgement, setshowAcknowledgement] = useState(false);
    const { fcmToken } = getModel("auth");
    const { mobileNumber } = getModel("user");
    const { isPromotionsEnabled } = getModel("misc");
    const { deviceId, deviceInformation } = getModel("device");
    const [successful, setSuccess] = useState(false);
    const [detailsArray, setDetailsArray] = useState([]);
    const [statusDesc, setStatusDesc] = useState("");
    const { goBack } = navigation;

    useEffect(() => {
        init();
    }, [init]);

    const init = useCallback(() => {
        console.log("[M2UDeletion] >> [init]");
        const { m2uPhoneNumber } = getModel("m2uDetails");
        setMaskedMobileNumber(maskedMobileNumber(m2uPhoneNumber));
        requestOTP();
    }, [getModel]);

    const showOTPModal = () => {
        setLoadingDelete(false);
        setShowOTP(true);
    };

    const onOTPDone = useCallback(
        (otp, otpModalErrorCb) => {
            // closeOTPModal();
            M2UDeleteAPI(otp, otpModalErrorCb);
        },
        [M2UDeleteAPI]
    );

    const closeOTPModal = useCallback(() => {
        setShowOTP(false);
        setLoadingDelete(false);
        setToken(null);
        goBack();
    }, [goBack]);

    const onOTPClose = useCallback(() => {
        closeOTPModal();
    }, [closeOTPModal]);

    const onOTPResend = useCallback(
        (showOTPCb) => {
            requestOTP(true, showOTPCb);
        },
        [requestOTP]
    );

    const requestOTP = useCallback(
        async (isResend = false, showOTPCb = () => {}) => {
            const mobileSDKData = getDeviceRSAInformation(deviceInformation, null, deviceId);

            const params = {
                fundTransferType: "M2U_IB_DEACTIVATION",
                deviceName: mobileSDKData?.deviceName,
            };

            try {
                const httpResp = await requestTACDelete(params);
                const statusCode = httpResp?.data?.statusCode ?? null;
                const serverToken = httpResp?.data?.token ?? null;

                if (statusCode === "0000" || statusCode === "0") {
                    // Update token and show OTP modal
                    setToken(serverToken);
                    showOTPModal();
                } else {
                    goBack();
                    showErrorToast({
                        message: COMMON_ERROR_MSG,
                    });
                }
                if (isResend) showOTPCb();
            } catch (error) {
                console.log("[requestOTP] >> Exception: ", error);
                showErrorToast({
                    message: error?.message ?? COMMON_ERROR_MSG,
                });
                goBack();
            } finally {
                setLoadingDelete(false);
            }
        },
        [deviceId, deviceInformation, goBack]
    );

    const handleDelete = useCallback(async () => {
        console.log("handleDelete");
        resetModel(null, ["device", "appSession"]);

        clearAll();
        removeCustomerKey();
        removeRefreshToken();
        // reset to Logout and to dashboard
        navigation.navigate("Logout", { type: "delete" });
    }, [navigation, resetModel]);

    const M2UDeleteAPI = useCallback(
        async (otp, otpModalErrorCb) => {
            try {
                const mobileSDKData = getDeviceRSAInformation(deviceInformation, null, deviceId);
                const params = {
                    tacNo: otp,
                    pnsRequest: {},
                    mobileSDKData,
                };
                const httpResp = await deleteAccess(params);
                const result = httpResp?.data;
                if (!result) {
                    // Close OTP modal
                    onOTPClose();
                    setSuccess(false);
                    setshowAcknowledgement(true);
                    return;
                }
                const { statusCode, serverDate, referenceNo } = result;
                let dtArray = [];

                // Check for Reference ID
                if (referenceNo) {
                    dtArray.push({
                        title: REFERENCE_ID,
                        value: referenceNo,
                    });
                }
                // Check for Server Date/Time
                if (serverDate) {
                    dtArray.push({
                        title: DATE_AND_TIME,
                        value: serverDate,
                    });
                }
                setDetailsArray(dtArray);
                setshowAcknowledgement(true);

                switch (statusCode) {
                    case "0000":
                    case "0":
                        setSuccess(true);
                        break;
                    case "9999":
                        setSuccess(false);
                        break;
                }
                setLoadingDelete(false);
                setShowOTP(false);
            } catch (error) {
                console.log("[M2UDeleteAPI] >> Exception: ", error);
                setLoadingDelete(false);
                setStatusDesc(COMMON_ERROR_MSG);
                otpModalErrorCb(error?.message || error?.error?.message || COMMON_ERROR_MSG);
                showErrorToast({
                    message: error?.message || error?.error?.message || COMMON_ERROR_MSG,
                });
            }
        },
        [deviceId, fcmToken, isPromotionsEnabled, mobileNumber, onOTPClose]
    );

    const handleOnPress = useCallback(() => {
        if (successful) {
            handleDelete();
            navigation.navigate("Logout", { type: "deleted" });
        } else {
            navigation.navigate(TAB_NAVIGATOR, {
                screen: "Tab",
                params: {
                    screen: "Dashboard",
                    params: {
                        refresh: true,
                    },
                },
            });
        }
    }, [navigation, handleDelete, successful]);

    return (
        <>
            {showAcknowledgement ? (
                <AcknowledgementScreenTemplate
                    isSuccessful={successful}
                    message={`Maybank2u ID deletion ${
                        !successful ? "unsuccessful." : "successful."
                    }`}
                    detailsData={detailsArray}
                    errorMessage={statusDesc}
                    ctaComponents={[
                        <ActionButton
                            key="1"
                            fullWidth
                            onPress={handleOnPress}
                            componentCenter={
                                <Typography
                                    text="Done"
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={18}
                                />
                            }
                        />,
                    ]}
                />
            ) : (
                <ScreenContainer backgroundType="color" showLoaderModal={loadingDelete} />
            )}
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
        </>
    );
}

M2UDeletion.propTypes = {
    navigation: PropTypes.object,
    resetModel: PropTypes.func,
};

export default withModelContext(M2UDeletion);
