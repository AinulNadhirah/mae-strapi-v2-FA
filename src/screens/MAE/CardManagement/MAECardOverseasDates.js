import moment from "moment";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { StyleSheet, View, Platform, TouchableWithoutFeedback } from "react-native";

import { MAE_CARD_STATUS, MAE_CARDDETAILS } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import OtpModal from "@components/Modals/OtpModal";
import Secure2uAuthenticationModal from "@components/Modals/Secure2uAuthenticationModal";
import DatePicker from "@components/Pickers/DatePicker";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { GAMAECardScreen } from "@services/analytics/analyticsSTPMae";
import { ovrSeasFlagReq, requestTAC } from "@services/index";

import {
    BLACK,
    YELLOW,
    MEDIUM_GREY,
    DISABLED,
    GREY,
    PINKISH_GREY,
    DISABLED_TEXT,
} from "@constants/colors";
import { 
    COMMON_ERROR_MSG, 
    CONTINUE, 
    DATE_AND_TIME, 
    END_DATE_PHOLDER, 
    FAIL_STATUS, 
    FA_CARD_OVERSEASDEBIT, 
    MAECARD_OVERSEASACTIVATE_FAIL, 
    MAECARD_OVERSEASACTIVATE_SUCC, 
    REFERENCE_ID, 
    START_DATE_PHOLDER, 
    SUCC_STATUS,
} from "@constants/strings";
import { MAE_REQ_TAC } from "@constants/url";

import { addDaysToDate } from "@utils/dataModel/utility";

class MAECardOverseasDates extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // Start Date
            startDateVal: new Date(),
            startDate: START_DATE_PHOLDER,
            startDateMin: new Date(),
            startDateMax: addDaysToDate(new Date(), 28),

            // End Date
            endDateVal: addDaysToDate(new Date(), 1),
            endDate: END_DATE_PHOLDER,
            endDateMin: addDaysToDate(new Date(), 1),
            endDateMax: addDaysToDate(new Date(), 365),

            // Date Picker related
            dateType: null,
            showDatePicker: false,
            datePickerDate: new Date(),
            datePickerStartDate: new Date(),
            datePickerEndDate: new Date(),

            // OTP Modal
            showOTP: false,
            token: null,
            mobileNumber: props.route.params?.mobileNumber ?? null,
            maskedMobileNumber: props.route.params?.maskedMobileNumber ?? null,

            // Others
            isContinueDisabled: true,
            transactionType: props.route.params?.transactionType ?? null,
            //s2u
            flow: props.route.params?.flow ?? null,
            secure2uValidateData: props.route.params?.secure2uValidateData ?? null,
            showS2u: false,
            pollingToken: "",
            s2uTransactionDetails: [],
            detailsArray: [],
            secure2uExtraParams: null,
            nonTxnData: props.route.params?.nonTxnData ?? {},
        };
    }

    onBackTap = () => {
        console.log("[MAECardOverseasDates] >> [onBackTap]");

        const { showDatePicker } = this.state;

        // If date picker is open, then return
        if (showDatePicker) return;

        this.props.navigation.goBack();
    };

    checkEmptyState = () => {
        console.log("[MAECardOverseasDates] >> [checkEmptyState]");

        const { startDate, endDate } = this.state;
        this.setState({
            isContinueDisabled:
                startDate === START_DATE_PHOLDER || endDate === END_DATE_PHOLDER,
        });
    };

    onStartDatePress = () => {
        console.log("[MAECardOverseasDates] >> [onStartDatePress]");

        const { startDateVal, startDateMin, startDateMax, showDatePicker } = this.state;

        // If picker already open, then return
        if (showDatePicker) return;

        this.showDatePicker(true, "start", startDateVal, startDateMin, startDateMax);
    };

    onEndDatePress = () => {
        console.log("[MAECardOverseasDates] >> [onEndDatePress]");

        const { endDateVal, endDateMin, endDateMax, showDatePicker } = this.state;

        // If picker already open, then return
        if (showDatePicker) return;

        this.showDatePicker(true, "end", endDateVal, endDateMin, endDateMax);
    };

    showDatePicker = (
        showDatePicker = true,
        dateType = null,
        datePickerDate = new Date(),
        datePickerStartDate = new Date(),
        datePickerEndDate = new Date()
    ) => {
        console.log("[MAECardOverseasDates] >> [showDatePicker]");

        this.setState({
            showDatePicker,
            dateType,
            datePickerDate,
            datePickerStartDate,
            datePickerEndDate,
        });
    };

    hideDatePicker = () => {
        console.log("[MAECardOverseasDates] >> [hideDatePicker]");

        this.showDatePicker(false);
    };

    onDateDonePress = (date) => {
        console.log("[MAECardOverseasDates] >> [onDateDonePress]");

        const { dateType } = this.state;
        if (date instanceof Date) {
            const dateText = moment(date).format("DD-MM-YYYY");
            if (dateType == "start") {
                this.setState(
                    {
                        startDate: dateText,
                        startDateVal: date,
                        endDateMin: addDaysToDate(date, 1),
                        endDateMax: addDaysToDate(date, 365),
                    },
                    () => {
                        this.validateRectifyDates();
                        this.checkEmptyState();
                    }
                );
            } else if (dateType == "end") {
                this.setState(
                    {
                        endDate: dateText,
                        endDateVal: date,
                    },
                    () => {
                        this.validateRectifyDates();
                        this.checkEmptyState();
                    }
                );
            }
        }

        // Hide date picker
        this.showDatePicker(false);
    };

    validateRectifyDates = () => {
        console.log("[MAECardOverseasDates] >> [validateRectifyDates]");

        const { startDateVal, endDateVal, endDate } = this.state;
        if (endDate !== END_DATE_PHOLDER && endDateVal <= startDateVal) {
            // Set 1 day higher than start date
            const newEndDateVal = addDaysToDate(startDateVal, 1);
            this.setState({
                endDateVal: newEndDateVal,
                endDate: moment(newEndDateVal).format("DD-MM-YYYY"),
            });
        }
    };

    onContinue = () => {
        console.log("[MAECardOverseasDates] >> [onContinue]");

        // Return if Conitnue btn is disabled
        const { isContinueDisabled, flow } = this.state;
        if (isContinueDisabled) return;

        // check s2u flow or tac
        flow === "S2U" ? this.overseasAPICall("") : this.requestOTP();
    };

    requestOTP = async (isResend = false, showOTPCb = () => {}) => {
        console.log("[MAECardOverseasDates] >> [requestOTP]");

        const { mobileNumber, transactionType } = this.state;
        const { cardDetails } = this.props?.route?.params;

        if (!transactionType) return;

        const params = {
            mobileNo: mobileNumber,
            idNo: "",
            transactionType: transactionType,
            otp: "",
            preOrPostFlag: "postlogin",
            cardNo: cardDetails?.cardNo,
        };

        const httpResp = await requestTAC(params, true, MAE_REQ_TAC).catch((error) => {
            console.log("[MAECardOverseasDates][requestTAC] >> Exception: ", error);
        });
        const statusCode = httpResp?.data?.statusCode ?? null;
        const statusDesc = httpResp?.data?.statusDesc ?? null;

        if (statusCode !== "0000") {
            showErrorToast({
                message: statusDesc || COMMON_ERROR_MSG,
            });
            return;
        }

        const token = httpResp?.data?.token ?? null;

        // Update token and show OTP modal
        this.setState({ token }, () => {
            this.showOTPModal();

            if (isResend) showOTPCb();
        });
    };

    showOTPModal = () => {
        console.log("[MAECardOverseasDates] >> [showOTPModal]");

        this.setState({ showOTP: true });
    };

    closeOTPModal = () => {
        console.log("[MAECardOverseasDates] >> [closeOTPModal]");

        this.setState({
            showOTP: false,
            token: null,
        });
    };

    onOTPClose = () => {
        console.log("[MAECardOverseasDates] >> [onOTPClose]");

        // Close OTP Modal
        this.closeOTPModal();

        // Navigate back to entry point
        this.onStatusPgDone();
    };

    onOTPResend = (showOTPCb) => {
        console.log("[MAECardOverseasDates] >> [onOTPResend]");

        this.requestOTP(true, showOTPCb);
    };

    onOTPDone = (otp, otpModalErrorCb) => {
        console.log("[MAECardOverseasDates] >> [onOTPDone]");

        // Call overseas API call
        this.overseasAPICall(otp, otpModalErrorCb);
    };

    overseasAPICall = async (otp, otpModalErrorCb) => {
        console.log("[MAECardOverseasDates] >> [overseasAPICall]");

        const { transactionType, startDateVal, endDateVal, flow, secure2uValidateData } =
            this.state;
        const { cardDetails } = this.props?.route?.params;

        // Request object
        const params = {
            tacBlock: otp,
            refNo: cardDetails?.refNo,
            acctNo: cardDetails?.maeAcctNo,
            reqType: transactionType,
            ovrSeasFlgStDt: moment(startDateVal).format("YYYYMMDD"),
            ovrSeasFlgEndDt: moment(endDateVal).format("YYYYMMDD"),
            twoFAType:
                flow === "S2U"
                    ? secure2uValidateData?.pull === "N"
                        ? "SECURE2U_PUSH"
                        : "SECURE2U_PULL"
                    : "TAC",
        };

        // API Call
        const httpResp = await ovrSeasFlagReq(params).catch((error) => {
            console.log("[MAECardOverseasDates][overseasAPICall] >> Exception: ", error);

            // Close OTP modal
            this.closeOTPModal();

            this.props.navigation.navigate(MAE_CARD_STATUS, {
                status: FAIL_STATUS,
                headerText: MAECARD_OVERSEASACTIVATE_FAIL,
                serverError: error?.message || "",
                onDone: this.onStatusPgDone,
            });

            GAMAECardScreen.onFailRequestOverseasDebit(null);
        });

        // Response error checking
        const result = httpResp?.data?.result ?? null;
        if (!result) {
            if (this.state.showOTP) otpModalErrorCb(COMMON_ERROR_MSG);
            return;
        }

        let detailsArray = [];
        const { statusCode, statusDesc, txnRefNo, dtTime, formattedTransactionRefNumber } = result;

        // Check for Reference ID
        if (formattedTransactionRefNumber || txnRefNo) {
            detailsArray.push({
                key: REFERENCE_ID,
                value: formattedTransactionRefNumber || txnRefNo,
            });
        }

        // Check for Server Date/Time
        if (dtTime) {
            detailsArray.push({
                key: DATE_AND_TIME,
                value: dtTime,
            });
        }

        switch (statusCode) {
            case "000":
            case "0000":
                if (flow === "S2U") {
                    this.setState({ detailsArray }, () => {
                        this.showS2uModal(result);
                    });
                } else {
                    // Close OTP modal
                    this.closeOTPModal();

                    this.props.navigation.navigate(MAE_CARD_STATUS, {
                        status: SUCC_STATUS,
                        headerText: MAECARD_OVERSEASACTIVATE_SUCC,
                        detailsArray,
                        onDone: this.onStatusPgDone,
                    });
                    GAMAECardScreen.onEnableOverseasDebit(detailsArray);
                }
                break;
            case "0A5":
            case "00A5":
                if (flow === "TAC") otpModalErrorCb(statusDesc || "Wrong OTP entered");
                return;
            default:
                // Close OTP modal
                this.closeOTPModal();

                this.props.navigation.navigate(MAE_CARD_STATUS, {
                    status: FAIL_STATUS,
                    headerText: MAECARD_OVERSEASACTIVATE_FAIL,
                    detailsArray,
                    serverError: statusDesc || "",
                    onDone: this.onStatusPgDone,
                });
                GAMAECardScreen.onFailRequestOverseasDebit(detailsArray);
                break;
        }
    };

    showS2uModal = (response) => {
        console.log("[MAECardOverseasDates] >> [showS2uModal]");
        const { pollingToken, token, dtTime } = response;
        const s2uPollingToken = pollingToken || token || "";
        let s2uTransactionDetails = [];
        // Check for Server Date/Time
        if (dtTime) {
            s2uTransactionDetails.push({
                label: DATE_AND_TIME,
                value: dtTime,
            });
        }
        this.setState({ pollingToken: s2uPollingToken, s2uTransactionDetails }, () => {
            this.setState({ showS2u: true });
        });
    };

    onS2uDone = (response) => {
        console.log("[MAECardOverseasDates] >> [onS2uDone]");

        const { transactionStatus, s2uSignRespone } = response;
        const { detailsArray } = this.state;

        // Close S2u popup
        this.onS2uClose();

        if (transactionStatus) {
            this.props.navigation.navigate(MAE_CARD_STATUS, {
                status: SUCC_STATUS,
                headerText: MAECARD_OVERSEASACTIVATE_SUCC,
                detailsArray,
                onDone: this.onStatusPgDone,
            });
            GAMAECardScreen.onEnableOverseasDebit(detailsArray);
        } else {
            const { statusDesc } = s2uSignRespone;
            this.props.navigation.navigate(MAE_CARD_STATUS, {
                status: FAIL_STATUS,
                headerText: MAECARD_OVERSEASACTIVATE_FAIL,
                detailsArray,
                serverError: statusDesc || "",
                onDone: this.onStatusPgDone,
            });
            GAMAECardScreen.onFailRequestOverseasDebit(detailsArray);
        }
    };

    onS2uClose = () => {
        console.log("[MAECardOverseasDates] >> [onS2uClose]");
        // will close tac popup
        this.setState({ showS2u: false });
    };

    onStatusPgDone = () => {
        console.log("[MAECardOverseasDates] >> [onStatusPgDone]");

        // Reload data on Card details
        this.props.navigation.navigate(MAE_CARDDETAILS, {
            reload: true,
        });
    };

    render() {
        const {
            isContinueDisabled,
            startDate,
            endDate,
            showDatePicker,
            datePickerDate,
            datePickerStartDate,
            datePickerEndDate,
            token,
            maskedMobileNumber,
            showOTP,
            secure2uValidateData,
            showS2u,
            pollingToken,
            s2uTransactionDetails,
            secure2uExtraParams,
            nonTxnData,
        } = this.state;

        return (
            <React.Fragment>
                <ScreenContainer
                    backgroundType="color"
                    backgroundColor={MEDIUM_GREY}
                    showOverlay={showDatePicker}
                    analyticScreenName={FA_CARD_OVERSEASDEBIT}
                >
                    <React.Fragment>
                        <ScreenLayout
                            header={
                                <HeaderLayout
                                    headerLeftElement={
                                        <HeaderBackButton onPress={this.onBackTap} />
                                    }
                                />
                            }
                            paddingHorizontal={0}
                            paddingBottom={0}
                            paddingTop={0}
                            useSafeArea
                        >
                            <React.Fragment>
                                <View
                                    style={Style.containerView}
                                    behavior={Platform.OS == "ios" ? "padding" : ""}
                                    enabled
                                >
                                    {/* Activate Over... */}
                                    <Typo
                                        fontSize={20}
                                        lineHeight={28}
                                        fontWeight="300"
                                        textAlign="left"
                                        text="Activate Overseas Debit"
                                        style={Style.headerLabelCls}
                                    />

                                    {/* Start Date */}
                                    <Typo
                                        fontSize={14}
                                        lineHeight={18}
                                        fontWeight="normal"
                                        textAlign="left"
                                        text="Start Date"
                                        style={Style.startDateLabelCls}
                                    />
                                    <TouchableWithoutFeedback onPress={this.onStartDatePress}>
                                        <View
                                            style={[
                                                Style.inputContainer,
                                                startDate === START_DATE_PHOLDER
                                                    ? Style.inputContainerDefaultBorder
                                                    : Style.inputContainerSelectBorder,
                                            ]}
                                        >
                                            <Typo
                                                fontSize={20}
                                                lineHeight={24}
                                                fontWeight="bold"
                                                textAlign="left"
                                                text={startDate}
                                                color={
                                                    startDate === START_DATE_PHOLDER
                                                        ? GREY
                                                        : BLACK
                                                }
                                            />
                                        </View>
                                    </TouchableWithoutFeedback>

                                    {/* End Date */}
                                    <Typo
                                        fontSize={14}
                                        lineHeight={18}
                                        textAlign="left"
                                        text="End Date"
                                        style={Style.endDateLabelCls}
                                    />
                                    <TouchableWithoutFeedback onPress={this.onEndDatePress}>
                                        <View
                                            style={[
                                                Style.inputContainer,
                                                endDate === END_DATE_PHOLDER
                                                    ? Style.inputContainerDefaultBorder
                                                    : Style.inputContainerSelectBorder,
                                            ]}
                                        >
                                            <Typo
                                                fontSize={20}
                                                lineHeight={24}
                                                fontWeight="bold"
                                                textAlign="left"
                                                text={endDate}
                                                color={
                                                    endDate === END_DATE_PHOLDER
                                                        ? GREY
                                                        : BLACK
                                                }
                                            />
                                        </View>
                                    </TouchableWithoutFeedback>
                                </View>

                                {/* Bottom docked button container */}
                                {!showDatePicker && (
                                    <FixedActionContainer>
                                        <View style={Style.bottomBtnContCls}>
                                            <ActionButton
                                                activeOpacity={isContinueDisabled ? 1 : 0.5}
                                                backgroundColor={
                                                    isContinueDisabled ? DISABLED : YELLOW
                                                }
                                                fullWidth
                                                componentCenter={
                                                    <Typo
                                                        fontSize={14}
                                                        fontWeight="600"
                                                        lineHeight={18}
                                                        color={
                                                            isContinueDisabled
                                                                ? DISABLED_TEXT
                                                                : BLACK
                                                        }
                                                        text={CONTINUE}
                                                    />
                                                }
                                                onPress={this.onContinue}
                                            />
                                        </View>
                                    </FixedActionContainer>
                                )}
                            </React.Fragment>
                        </ScreenLayout>
                    </React.Fragment>
                </ScreenContainer>
                {/* Date Picker Component */}
                <DatePicker
                    showDatePicker={showDatePicker}
                    onCancelButtonPressed={this.hideDatePicker}
                    onDoneButtonPressed={this.onDateDonePress}
                    dateRangeStartDate={datePickerStartDate}
                    dateRangeEndDate={datePickerEndDate}
                    defaultSelectedDate={datePickerDate}
                />
                {/* OTP Modal */}
                {showOTP && (
                    <OtpModal
                        otpCode={token}
                        onOtpDonePress={this.onOTPDone}
                        onOtpClosePress={this.onOTPClose}
                        onResendOtpPress={this.onOTPResend}
                        mobileNumber={maskedMobileNumber}
                    />
                )}
                {/* S2u Modal */}
                {showS2u && (
                    <Secure2uAuthenticationModal
                        token={pollingToken}
                        amount={""}
                        nonTxnData={nonTxnData}
                        onS2UDone={this.onS2uDone}
                        onS2UClose={this.onS2uClose}
                        s2uPollingData={secure2uValidateData}
                        transactionDetails={s2uTransactionDetails}
                        extraParams={secure2uExtraParams}
                    />
                )}
            </React.Fragment>
        );
    }
}

MAECardOverseasDates.propTypes = {
    navigation: PropTypes.shape({
        goBack: PropTypes.func,
        navigate: PropTypes.func,
    }),
    route: PropTypes.shape({
        params: PropTypes.shape({
            cardDetails: PropTypes.shape({
                cardNo: PropTypes.any,
                maeAcctNo: PropTypes.any,
                refNo: PropTypes.any,
            }),
            flow: PropTypes.any,
            maskedMobileNumber: PropTypes.any,
            mobileNumber: PropTypes.any,
            nonTxnData: PropTypes.object,
            secure2uValidateData: PropTypes.any,
            transactionType: PropTypes.any,
        }),
    }),
};

const Style = StyleSheet.create({
    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },

    containerView: {
        flex: 1,
        paddingHorizontal: 36,
        width: "100%",
    },

    endDateLabelCls: {
        marginTop: 25,
    },

    headerLabelCls: {
        marginTop: 15,
    },

    inputContainer: {
        alignItems: "center",
        borderBottomWidth: 1,
        flexDirection: "row",
        height: 48,
        justifyContent: "flex-start",
    },

    inputContainerDefaultBorder: {
        borderBottomColor: PINKISH_GREY,
    },

    inputContainerSelectBorder: {
        borderBottomColor: BLACK,
    },

    startDateLabelCls: {
        marginTop: 25,
    },
});

export default MAECardOverseasDates;
