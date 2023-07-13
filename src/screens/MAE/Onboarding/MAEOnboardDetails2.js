import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, StyleSheet, TouchableOpacity, ScrollView, Keyboard, Image } from "react-native";
import LinearGradient from "react-native-linear-gradient";

import * as navigationConstant from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import ColorRadioButton from "@components/Buttons/ColorRadioButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import DatePicker from "@components/Pickers/DatePicker";
import ScrollPicker from "@components/Pickers/ScrollPicker";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";
import { showErrorToast } from "@components/Toast";

import { withModelContext } from "@context";

import { getMAEMasterData, maeCustomerInquiry } from "@services";

import {
    YELLOW,
    DISABLED,
    BLACK,
    WHITE,
    DISABLED_TEXT,
    GREY,
    MEDIUM_GREY,
} from "@constants/colors";
import { getDateRangeDefaultData } from "@constants/datePickerDefaultData";
import { MAE_ONBOARD_DOB } from "@constants/dateScenarios";
import { COMMON_ERROR_MSG, FA_APPLY_MAE_IDTYPE } from "@constants/strings";

import * as DataModel from "@utils/dataModel";
import { getDateRange, getDefaultDate, getEndDate, getStartDate } from "@utils/dateRange";

import Assets from "@assets";

import * as MAEOnboardController from "./MAEOnboardController";

class MAEOnboardDetails2 extends Component {
    static navigationOptions = ({ navigation: { navigate } }) => ({
        title: "",
        header: null,
    });

    static propTypes = {
        getModel: PropTypes.func,
    };

    constructor(props) {
        super(props);

        this.state = {
            filledUserDetails: props.route?.params?.filledUserDetails,
            fullName: props.route?.params?.filledUserDetails?.onBoardDetails?.fullName,
            isNextDisabled: true,
            isValidIC: "",
            isValidPassport: "",
            isValidPassportDOB: "",

            selectedIDType: "",
            selectedIDCode: "",
            mykadRadioChecked: false,
            passportRadioChecked: false,
            // isSelected: false,

            mykadNumber: "",
            userDOB: "",
            passportNumber: "",
            passportCountry: "Select Nationality",
            passportDOB: "Enter date of birth",
            passportCountryCode: "",
            passportCountryData: [],
            datePicker: false,
            datePickerDate: new Date(new Date().getFullYear() - 12 + "-" + "01-01"),

            displayPicker: false,
            masterData: "",
            validDateRangeData: getDateRangeDefaultData(MAE_ONBOARD_DOB),
            defaultSelectedDate: getDefaultDate(getDateRangeDefaultData(MAE_ONBOARD_DOB)),
        };
        console.log("MAEOnboardDetails2:state----------", this.state);
    }

    componentDidMount() {
        console.log("[MAEOnboardDetails2] >> [componentDidMount]");
        // const dummy = true;
        // if(dummy) {
        // 	this.setState({
        // 		mykadNumber: "890305890036",//750202042518
        // 		passportNumber: "R94908339",
        // 		passportDOB: "1987-04-14",
        // 		userDOB: "19870414",
        // 		isNextDisabled: false,
        // 		mykadRadioChecked: true,
        // 		selectedIDType : "MyKad",
        // 		selectedIDCode : "01"
        // 	});
        // }
        this._getDatePickerData();
        this.getMasterData();
        this.props.navigation.addListener("focus", this.onScreenFocus);
    }
    _getDatePickerData() {
        getDateRange(MAE_ONBOARD_DOB).then((data) => {
            this.setState({
                validDateRangeData: data,
                defaultSelectedDate: getDefaultDate(data),
            });
        });
    }

    onScreenFocus = () => {
        if (this.props.route.params?.from == "MAEInApp") {
            this.onContinueTap();
        }
    };

    getMasterData = () => {
        console.log("[MAEOnboardDetails2] >> [getMasterData]");

        getMAEMasterData()
            .then((response) => {
                console.log("[MAEOnboardDetails2][getMasterData] >> Success");
                const result = response.data.result;
                if (result) {
                    // Store FATCA Country data. To be used in Terms & Cond screen
                    this.state.masterData = result;
                    this.setState({
                        passportCountryData: this.scrollPickerData(result.maeCitizenship),
                    });
                }
            })
            .catch((error) => {
                console.log("[MAEOnboardDetails2][getMasterData] >> Failure");
                showErrorToast({
                    message: error.message,
                });
            });
    };

    onBackTap = () => {
        console.log("[MAEOnboardDetails2] >> [onBackTap]");
        this.props.navigation.goBack();
    };

    onCloseTap = () => {
        console.log("[MAEOnboardDetails2] >> [onCloseTap]");
        const { filledUserDetails } = this.state;
        this.props.navigation.navigate(filledUserDetails?.entryStack || "More", {
            screen: filledUserDetails?.entryScreen || "Apply",
            params: filledUserDetails?.entryParams,
        });
    };

    onContinueTap = () => {
        console.log("[MAEOnboardDetails2] >> [onContinueTap]");
        const { trinityFlag } = this.props.getModel("mae");
        const isValidForm = this.validateFormData();
        const { filledUserDetails } = this.state;
        if (isValidForm) {
            const data = {
                idType: this.state.selectedIDCode,
                birthDate: this.state.userDOB,
                preOrPostFlag: "prelogin",
                icNo:
                    this.state.selectedIDCode == "01"
                        ? this.state.mykadNumber
                        : this.state.passportNumber,
                mobileNo: filledUserDetails?.onBoardDetails?.mobileNumber,
            };
            const inqPath =
                trinityFlag === "Y"
                    ? "/mae/ntb/api/v2/customerInquiry"
                    : "/mae/ntb/api/v1/customerInquiry";

            maeCustomerInquiry(data, inqPath)
                .then((response) => {
                    console.log("[MAEOnboardDetails2][maeCustomerInquiry] >> Success");
                    const result = response.data.result;
                    this.handleCustomerInquiry(result);
                })
                .catch((error) => {
                    console.log("[MAEOnboardDetails2][maeCustomerInquiry] >> Failure");
                    showErrorToast({
                        message: error.message,
                    });
                });
        }
    };

    handleCustomerInquiry = (result) => {
        console.log("[MAEOnboardDetails2] >> [handleCustomerInquiry]");
        const statusDesc = result.statusDesc;
        const custStatus = result.custStatus;
        const m2uAccessInd = result.m2uAccessInd;
        const m2uIndicator = result.m2uIndicator;
        const resumeIndicator = result.resumeStageInd;
        const maeIndicator = result.maeInd;
        const rsaIndicator = result.rsaIndicator;

        switch (result.statusCode) {
            case "0000":
                if (
                    custStatus == "1" ||
                    custStatus == "2" ||
                    custStatus == "3" ||
                    custStatus == "4" ||
                    (custStatus == "7" && m2uIndicator == "0") ||
                    (custStatus == "8" && m2uIndicator == "0")
                ) {
                    console.log("[maeCustomerInquiryCall] >> Pure NTB customer");

                    const filledUserDetails = this.prepareUserDetails(result, "NewMAE");
                    filledUserDetails.onBoardDetails.mobileNumber =
                        result.mobileNo || filledUserDetails.onBoardDetails.mobileNumber;
                    this.props.navigation.navigate(navigationConstant.MAE_ONBOARD_DETAILS3, {
                        filledUserDetails,
                    });
                } else if (custStatus == "0" && m2uIndicator == "3") {
                    console.log("[maeCustomerInquiryCall] >> W/O M2u Access - Credit/Debit card");

                    if (this.props.route?.params?.from == "MAEInApp") {
                        this.props.navigation.setParams({ from: "" });
                        showErrorToast({
                            message:
                                "Your Maybank2u online Registration was unsuccessful. Please try again or call us at 1300 88 6688 for further assistance.",
                        });
                    } else {
                        let filledUserDetails = this.prepareUserDetails(
                            result,
                            "ETBWithCredit/Debit"
                        );
                        const { onBoardDetails, onBoardDetails3 } =
                            MAEOnboardController.ETBFilledUserDetails(
                                result,
                                "ETBWithCredit/Debit"
                            );
                        filledUserDetails.onBoardDetails.mobileNumber = onBoardDetails.mobileNumber;
                        filledUserDetails.onBoardDetails3 = onBoardDetails3;
                        //Open maybank2u web
                        // this.props.navigation.navigate(navigationConstant.MAE_INAPP, {
                        //     filledUserDetails,screenName:"MAEOnboardDetails4",from:"ETBWithCredit/Debit"
                        // });
                        this.props.navigation.navigate(navigationConstant.MAE_SIGNUP, {
                            filledUserDetails,
                            screenName: "MAEOnboardDetails4",
                            from: "ETBWithCredit/Debit",
                        });
                    }
                } else if (
                    (custStatus == "0" && m2uIndicator == "0") ||
                    (custStatus == "0" && m2uIndicator == "4") ||
                    (custStatus == "0" && m2uIndicator == "5") ||
                    (custStatus == "0" && m2uIndicator == "6") ||
                    (custStatus == "5" && m2uIndicator == "0") ||
                    (custStatus == "6" && m2uIndicator == "0")
                ) {
                    console.log("[maeCustomerInquiryCall] >> W/O M2u Access - Loan/FD");
                    let filledUserDetails = this.prepareUserDetails(result, "ETBWithLoan/FD");
                    const { onBoardDetails, onBoardDetails3 } =
                        MAEOnboardController.ETBFilledUserDetails(result, "ETBWithLoan/FD");
                    filledUserDetails.onBoardDetails.mobileNumber = onBoardDetails.mobileNumber;
                    filledUserDetails.onBoardDetails3 = onBoardDetails3;

                    this.props.navigation.navigate(navigationConstant.MAE_SIGNUP, {
                        filledUserDetails,
                        screenName: "MAEOnboardDetails4",
                        from: "ETBWithLoan/FD",
                    });
                } else if (
                    (custStatus == "0" && m2uIndicator == "1") ||
                    (custStatus == "0" && m2uIndicator == "2") ||
                    (custStatus == "5" && m2uIndicator == "1") ||
                    (custStatus == "6" && m2uIndicator == "1")
                ) {
                    console.log("[maeCustomerInquiryCall] >> With M2u Access - CASA");
                    let filledUserDetails = this.prepareUserDetails(result, "ETBWithM2U");
                    const { onBoardDetails, onBoardDetails2, onBoardDetails3 } =
                        MAEOnboardController.ETBFilledUserDetails(
                            result,
                            filledUserDetails.onBoardDetails2.from
                        );

                    filledUserDetails.onBoardDetails = onBoardDetails;
                    filledUserDetails.onBoardDetails2 = onBoardDetails2; //check from in onBoardDetails2
                    filledUserDetails.onBoardDetails3 = onBoardDetails3;

                    this.props.navigation.navigate(navigationConstant.MAE_SIGNUP, {
                        filledUserDetails,
                        screenName: "MAEOnboardDetails4",
                        from: "ETBWithM2U",
                    });
                } else {
                    console.log("[maeCustomerInquiryCall] >> Unhandled scenario");
                    showErrorToast({
                        message: statusDesc || COMMON_ERROR_MSG,
                    });
                }
                break;
            case "0C21":
            case "0C02":
                if (
                    custStatus == "1" ||
                    custStatus == "2" ||
                    custStatus == "3" ||
                    custStatus == "4" ||
                    (custStatus == "0" && m2uIndicator == "0") ||
                    (custStatus == "0" && m2uIndicator == "4") ||
                    (custStatus == "0" && m2uIndicator == "5") ||
                    (custStatus == "0" && m2uIndicator == "6") ||
                    (custStatus == "5" && m2uIndicator == "0") ||
                    (custStatus == "6" && m2uIndicator == "0")
                ) {
                    if (resumeIndicator == 0) {
                        console.log("[maeCustomerInquiryCall] >> resume >> With MAE Account");
                        const filledUserDetails = this.prepareUserDetails(result, "ResumeMAE");
                        this.props.navigation.navigate(navigationConstant.MAE_RESUME, {
                            filledUserDetails,
                        });
                        return;
                    } else if (resumeIndicator == 1) {
                        console.log("[maeCustomerInquiryCall] >> resume >> With M2U Account");
                        const filledUserDetails = this.prepareUserDetails(result, "ResumeM2U");
                        this.props.navigation.navigate(navigationConstant.MAE_RESUME, {
                            filledUserDetails,
                            screenName: "UploadSecurityImage",
                        });
                    } else {
                        if (resumeIndicator == 2 && rsaIndicator != 2) {
                            console.log("[maeCustomerInquiryCall] >> resume >> With M2U Account");
                            const filledUserDetails = this.prepareUserDetails(
                                result,
                                "ResumeM2U",
                                rsaIndicator
                            );
                            this.props.navigation.navigate(navigationConstant.MAE_RESUME, {
                                filledUserDetails,
                                screenName: "SecurityQuestions",
                            });
                        } else {
                            console.log("[maeCustomerInquiryCall] >> resume >> Existing MAE User");
                            const filledUserDetails = this.prepareUserDetails(result, "SignupMAE");
                            this.props.navigation.navigate(navigationConstant.MAE_GOTOACCOUNT, {
                                filledUserDetails,
                            });
                            // this.props.navigation.navigate(navigationConstant.MAE_SIGNUP, {
                            //     filledUserDetails,screenName:"MAEGoToWallet",from:"WithMAE"
                            // });
                        }
                    }
                } else {
                    console.log("[maeCustomerInquiryCall] >> resume >> Existing MAE User");
                    const filledUserDetails = this.prepareUserDetails(result, "SignupMAE");
                    this.props.navigation.navigate(navigationConstant.MAE_GOTOACCOUNT, {
                        filledUserDetails,
                    });
                    // showErrorToast({
                    //     message: statusDesc ? statusDesc : Strings.COMMON_ERROR_MSG,
                    // });
                }

                break;
            default:
                showErrorToast({
                    message: statusDesc || COMMON_ERROR_MSG,
                });
                break;
        }
    };

    validateFormData = () => {
        console.log("[MAEOnboardDetails2] >> [validateFormData]");
        if (this.state.selectedIDType == "MyKad") {
            // Validation check for MyKad
            if (!this.mykadNumberValidation()) {
                return false;
            }
        } else {
            // Validation check for Passport
            if (!this.passportNumberValidation()) {
                return false;
            }

            // Validation check for Passport DOB
            if (!this.passportDOBValidation()) {
                return false;
            }
        }
        // Return true if no validation error
        return true;
    };

    prepareUserDetails = (result, from, rsaIndicator) => {
        console.log("MAEOnboardDetails2 >> [prepareUserDetails]");
        let onBoardDetails2 = {};
        if (this.state.selectedIDType == "MyKad") {
            onBoardDetails2 = {
                mykadNumber: this.state.mykadNumber,
                idNo: this.state.mykadNumber,
            };
        } else {
            onBoardDetails2 = {
                passportNumber: this.state.passportNumber,
                idNo: this.state.passportNumber,
                passportCountry: this.state.passportCountry,
                passportDOB: this.state.passportDOB,
                passportCountryCode: this.state.passportCountryCode,
            };
        }
        onBoardDetails2.maeCustomerInquiry = result;
        // onBoardDetails2.masterData = this.state.masterData;
        onBoardDetails2.userDOB = this.state.userDOB;
        onBoardDetails2.selectedIDType = this.state.selectedIDType;
        onBoardDetails2.selectedIDCode = this.state.selectedIDCode;
        onBoardDetails2.from = from;

        let MAEUserDetails = this.state.filledUserDetails || {};
        MAEUserDetails.onBoardDetails2 = onBoardDetails2;
        MAEUserDetails.masterData = this.state.masterData;

        if (rsaIndicator) {
            MAEUserDetails.rsaIndicator = rsaIndicator;
        }

        return MAEUserDetails;
    };

    mykadNumberValidation = () => {
        console.log("[MAEOnboardDetails2] >> [mykadNumberValidation]");

        const mykadNumber = this.state.mykadNumber;
        let err = "";
        const err1 = "Application is only open to those aged between 12-80.";
        const err2 = "The MyKad number you entered is invalid.";
        const err3 = "MyKad number should contain 12 digits.";
        const err4 = "MyKad number should contain digits only.";
        const err5 = "Your age is ineligible for account application.";

        const first6Digits = mykadNumber.substring(0, 6);
        // Length check
        if (mykadNumber.length != 12) {
            err = err3;
        } else if (!DataModel.maeOnlyNumberRegex(mykadNumber)) {
            // Check there are no other characters except numbers
            err = err4;
        } else if (!DataModel.isValidDOBYYMMDD(first6Digits)) {
            // Valid DOB check
            err = err2;
        } else if (!DataModel.validateMyKadAge(first6Digits)) {
            // MyKad 12-80 age limit check
            err = err1;
        }

        // Store DOB from MyKad number once it passes all validation checks
        this.retrieveuserDOB(first6Digits);

        this.setState({ isValidIC: err });
        // Return true if no validation error
        return err ? false : true;
    };

    retrieveuserDOB = (DOB) => {
        console.log("[MAEOnboardDetails2] >> [retrieveuserDOB]");

        if (DOB && DOB.length > 5) {
            const custYear = DOB.substring(0, 2);
            const custMonth = DOB.substring(2, 4);
            const custDay = DOB.substring(4, 6);
            let custYearFull = "";

            const currentDate = new Date();
            const currentYearFull = currentDate.getFullYear();
            const currentYear = currentYearFull.toString().substring(2, 4);
            if (parseInt(custYear) > currentYear) {
                custYearFull = "19" + custYear;
            } else {
                custYearFull = "20" + custYear;
            }

            this.state.userDOB = custYearFull + custMonth + custDay;
        }
    };

    passportNumberValidation = () => {
        console.log("[MAEOnboardDetails2] >> [passportNumberValidation]");

        const passportNumber = this.state.passportNumber;
        let err = "";
        const err1 = "The passport number you entered is invalid.";
        const err2 = "Passport Number does not accept spaces.";
        const err3 = "Passport Number should not contain symbol";

        // Space check
        if (!DataModel.anySpaceRegex(passportNumber)) {
            err = err2;
        } else if (!DataModel.alphaNumericNoSpaceRegex(passportNumber)) {
            // Special character check
            err = err3;
        } else if (passportNumber.length < 4) {
            // Min length check
            err = err1;
        }

        this.setState({ isValidPassport: err });
        // Return true if no validation error
        return err ? false : true;
    };

    passportDOBValidation = () => {
        console.log("[MAEOnboardDetails2] >> [passportDOBValidation]");

        const passportDOB = this.state.passportDOB;
        let err = "";
        const err1 = "Application is only open to those aged between 12-80.";

        // Passport 12-80 age limit check
        const first6Digits = passportDOB.replace(/\-/g, "").substr(2, 6);
        this.setState({
            userDOB: passportDOB.replace(/\-/g, ""),
        });
        if (!DataModel.validateMyKadAge(first6Digits)) {
            err = err1;
        }

        this.setState({ isValidPassportDOB: err });
        // Return true if no validation error
        return err ? false : true;
    };

    onInputTextChange = (params) => {
        console.log("[MAEOnboardDetails2] >> [onInputTextChange]");
        const key = params["key"];
        const value = params["value"].trimStart();
        this.setState(
            {
                [key]: value,
                isValidIC: "",
                isValidPassport: "",
                isValidPassportDOB: "",
            },
            () => {
                this.enableDisableBtn();
            }
        );
    };

    enableDisableBtn = () => {
        console.log("[MAEOnboardDetails2] >> [enableDisableBtn]");
        if (this.state.selectedIDType == "MyKad") {
            if (this.state.mykadNumber.length > 0) {
                this.setState({
                    isNextDisabled: false,
                });
            } else {
                this.setState({
                    isNextDisabled: true,
                });
            }
        } else {
            if (
                this.state.passportNumber.length > 0 &&
                this.state.passportDOB != "Enter date of birth" &&
                this.state.passportCountry != "Select Nationality"
            ) {
                this.setState({
                    isNextDisabled: false,
                });
            } else {
                this.setState({
                    isNextDisabled: true,
                });
            }
        }
    };

    onRadioBtnTap(params) {
        console.log("[MAEOnboardDetails2] >> [onRadioBtnTap]");
        const radioBtnId = params.radioBtnId;
        if (radioBtnId == "MyKad") {
            this.setState(
                {
                    selectedIDType: radioBtnId,
                    selectedIDCode: "01",
                    mykadRadioChecked: true,
                    passportRadioChecked: false,
                },
                () => {
                    this.enableDisableBtn();
                }
            );
        } else if (radioBtnId == "Passport") {
            this.setState(
                {
                    selectedIDType: radioBtnId,
                    selectedIDCode: "05",
                    mykadRadioChecked: false,
                    passportRadioChecked: true,
                },
                () => {
                    this.enableDisableBtn();
                }
            );
        }
    }

    onDateFieldTap = () => {
        console.log("[MAEOnboardDetails2] >> [onDateFieldTap]");
        Keyboard.dismiss();
        this.setState({
            datePicker: true,
        });
    };

    onDatePickerCancel = () => {
        console.log("[MAEOnboardDetails2] >> [onDatePickerCancel]");
        // hide date picker
        this.setState({
            datePicker: false,
        });
    };

    onDatePickerDone = (date) => {
        console.log("[MAEOnboardDetails2] >> [onDatePickerDone]");

        // hide date picker
        this.onDatePickerCancel();

        // Form the date format to be shown on form
        const selectedDate = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
        const selectedMonth =
            date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;
        const selectedYear = date.getFullYear();
        const dateText = selectedYear + "-" + selectedMonth + "-" + selectedDate;

        // Update selected date on form and in picker
        this.setState(
            {
                passportDOB: dateText,
                datePickerDate: new Date(dateText),
                defaultSelectedDate: new Date(date),
            },
            () => {
                this.enableDisableBtn();
            }
        );
    };

    onCountryPressed = () => {
        console.log("[MAEOnboardDetails2] >> [onCountryPressed]");
        this.setState({ displayPicker: true });
    };

    onDoneButtonPress = (value) => {
        console.log("[MAEOnboardDetails2] >> [onDoneButtonPress]");
        if (value) {
            const countryData = this.state.passportCountryData.find(
                (countryInfo) => countryInfo.value == value
            );
            this.setState(
                {
                    displayPicker: false,
                    passportCountry: countryData.title,
                    passportCountryCode: value,
                },
                () => {
                    this.enableDisableBtn();
                }
            );
        }
    };
    onCancelButtonPress = () => {
        console.log("[MAEOnboardDetails2] >> [onCancelButtonPress]");
        this.setState({ displayPicker: false });
    };

    scrollPickerData = (data) => {
        return data.map((obj) => {
            const { display, value } = obj;
            return {
                title: display,
                value,
            };
        });
    };

    render() {
        const {
            isValidIC,
            isValidPassport,
            mykadNumber,
            passportNumber,
            passportDOB,
            isValidPassportDOB,
            passportCountryData,
            mykadRadioChecked,
            passportRadioChecked,
            dateRangeStartDate,
            dateRangeEndDate,
            isNextDisabled,
            displayPicker,
            datePicker,
            dateRangeDefaultDate,
            defaultSelectedDate,
        } = this.state;
        return (
            <React.Fragment>
                <ScreenContainer
                    backgroundType="color"
                    backgroundColor={MEDIUM_GREY}
                    showOverlay={displayPicker || datePicker}
                    analyticScreenName={FA_APPLY_MAE_IDTYPE}
                >
                    <View style={styles.viewContainer}>
                        <ScreenLayout
                            paddingBottom={0}
                            paddingTop={0}
                            paddingHorizontal={0}
                            useSafeArea
                            header={
                                <HeaderLayout
                                    headerLeftElement={
                                        <HeaderBackButton onPress={this.onBackTap} />
                                    }
                                    headerRightElement={
                                        <HeaderCloseButton onPress={this.onCloseTap} />
                                    }
                                />
                            }
                        >
                            <ScrollView>
                                <View style={styles.fieldContainer}>
                                    <Typo
                                        fontSize={20}
                                        lineHeight={28}
                                        fontWeight="300"
                                        letterSpacing={0}
                                        textAlign="left"
                                        text={
                                            "Hi, " +
                                            this.state.fullName +
                                            "! Tell us your ID type and number"
                                        }
                                        // style={{ marginTop: 20 }}
                                    />
                                    <View style={styles.groupContainer}>
                                        <ColorRadioButton
                                            title="MyKad"
                                            isSelected={mykadRadioChecked}
                                            fontSize={14}
                                            onRadioButtonPressed={(value) => {
                                                this.onRadioBtnTap({ radioBtnId: "MyKad" });
                                            }}
                                        />
                                        <ColorRadioButton
                                            title="Passport"
                                            isSelected={passportRadioChecked}
                                            fontSize={14}
                                            onRadioButtonPressed={(value) => {
                                                this.onRadioBtnTap({ radioBtnId: "Passport" });
                                            }}
                                        />
                                    </View>
                                    {this.state.selectedIDType == "MyKad" ? (
                                        <View style={styles.groupContainer}>
                                            <Typo
                                                fontSize={14}
                                                fontWeight="normal"
                                                fontStyle="normal"
                                                lineHeight={18}
                                                textAlign="left"
                                                text="MyKad number"
                                            />
                                            <TextInput
                                                maxLength={12}
                                                isValid={!isValidIC}
                                                isValidate
                                                errorMessage={isValidIC}
                                                keyboardType={"number-pad"}
                                                value={mykadNumber}
                                                placeholder="Enter your MyKad number"
                                                onChangeText={(value) => {
                                                    this.onInputTextChange({
                                                        key: "mykadNumber",
                                                        value,
                                                    });
                                                }}
                                                returnKeyType="done"
                                            />
                                        </View>
                                    ) : null}
                                    {this.state.selectedIDType == "Passport" ? (
                                        <View style={styles.groupContainer}>
                                            <Typo
                                                fontSize={14}
                                                fontWeight="normal"
                                                fontStyle="normal"
                                                lineHeight={18}
                                                textAlign="left"
                                                text="Passport number"
                                            />
                                            <TextInput
                                                maxLength={20}
                                                isValid={!isValidPassport}
                                                isValidate
                                                errorMessage={isValidPassport}
                                                value={passportNumber}
                                                autoCapitalize="characters"
                                                placeholder="Enter passport number"
                                                onChangeText={(value) => {
                                                    this.onInputTextChange({
                                                        key: "passportNumber",
                                                        value,
                                                    });
                                                }}
                                                returnKeyType="done"
                                            />
                                            <View style={styles.subContainer}>
                                                <Typo
                                                    fontSize={14}
                                                    fontWeight="normal"
                                                    fontStyle="normal"
                                                    lineHeight={18}
                                                    textAlign="left"
                                                    text="Date of Birth"
                                                />
                                                <TouchableOpacity
                                                    activeOpacity={1}
                                                    accessible={false}
                                                    testID={"inputView"}
                                                    accessibilityLabel={"inputView"}
                                                    style={
                                                        passportDOB == "Enter date of birth"
                                                            ? styles.inputContainer
                                                            : styles.inputContainerSelect
                                                    }
                                                    onPress={this.onDateFieldTap}
                                                >
                                                    <Typo
                                                        fontSize={20}
                                                        fontWeight="600"
                                                        fontStyle="normal"
                                                        lineHeight={25}
                                                        textAlign="left"
                                                        style={{ marginTop: 16 }}
                                                        text={passportDOB}
                                                        color={
                                                            passportDOB == "Enter date of birth"
                                                                ? GREY
                                                                : BLACK
                                                        }
                                                    />
                                                </TouchableOpacity>
                                            </View>
                                            <View style={styles.subContainer}>
                                                <Typo
                                                    fontSize={14}
                                                    fontWeight="normal"
                                                    fontStyle="normal"
                                                    lineHeight={18}
                                                    textAlign="left"
                                                    text="Nationality"
                                                />
                                                <View style={styles.dropDownView}>
                                                    <TouchableOpacity
                                                        style={styles.touchableView}
                                                        onPress={this.onCountryPressed}
                                                    >
                                                        <View>
                                                            <Typo
                                                                fontSize={13}
                                                                fontWeight="600"
                                                                fontStyle="normal"
                                                                lineHeight={15}
                                                                letterSpacing={0}
                                                                color={BLACK}
                                                                textAlign="left"
                                                                text={this.state.passportCountry}
                                                                style={styles.dropDownText}
                                                            />
                                                            <Image
                                                                style={styles.dropDownIcon}
                                                                source={Assets.downArrow}
                                                            />
                                                        </View>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        </View>
                                    ) : null}
                                </View>
                            </ScrollView>
                            {/* Continue Button */}
                            <View style={styles.bottomBtnContCls}>
                                <LinearGradient
                                    colors={["#efeff300", MEDIUM_GREY]}
                                    style={styles.linearGradient}
                                />
                                <ActionButton
                                    fullWidth
                                    onPress={this.onContinueTap}
                                    disabled={isNextDisabled}
                                    backgroundColor={isNextDisabled ? DISABLED : YELLOW}
                                    componentCenter={
                                        <Typo
                                            fontSize={14}
                                            fontWeight="600"
                                            lineHeight={18}
                                            color={isNextDisabled ? DISABLED_TEXT : BLACK}
                                            text="Continue"
                                        />
                                    }
                                />
                            </View>
                        </ScreenLayout>
                    </View>
                </ScreenContainer>
                <DatePicker
                    showDatePicker={datePicker}
                    onCancelButtonPressed={this.onDatePickerCancel}
                    onDoneButtonPressed={this.onDatePickerDone}
                    dateRangeStartDate={getStartDate(this.state.validDateRangeData)}
                    dateRangeEndDate={getEndDate(this.state.validDateRangeData)}
                    defaultSelectedDate={defaultSelectedDate}
                />
                <ScrollPicker
                    showPicker={displayPicker}
                    items={passportCountryData}
                    onCancelButtonPressed={this.onCancelButtonPress}
                    onDoneButtonPressed={this.onDoneButtonPress}
                />
            </React.Fragment>
        );
    }
}

const styles = StyleSheet.create({
    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        paddingHorizontal: 24,
        paddingVertical: 25,
    },
    confirmButton: {
        marginTop: 40,
    },
    dropDownIcon: {
        height: 8,
        marginLeft: "88%",
        marginTop: -15,
        width: 15,
    },
    dropDownText: {
        height: 19,
        marginLeft: "5%",
        marginTop: -5,
        width: "75%",
    },
    dropDownView: {
        backgroundColor: WHITE,
        borderColor: "#cfcfcf",
        borderRadius: 24,
        borderStyle: "solid",
        borderWidth: 1,
        height: 48,
        marginTop: 20,
        width: "100%",
    },
    fieldContainer: {
        marginBottom: 20,
        marginHorizontal: 36,
    },
    groupContainer: {
        marginTop: 33,
    },
    inputContainer: {
        alignItems: "center",
        borderBottomColor: GREY,
        borderBottomWidth: 1,
        flexDirection: "row",
        height: 48,
        justifyContent: "flex-start",
    },
    inputContainerSelect: {
        alignItems: "center",
        borderBottomColor: BLACK,
        borderBottomWidth: 1,
        flexDirection: "row",
        height: 48,
        justifyContent: "flex-start",
    },
    inputStyle: {
        borderRadius: 1,
        color: "black",
        fontFamily: "montserrat",
        fontSize: 20,
        fontWeight: "normal",
        width: "100%",
    },
    linearGradient: {
        height: 30,
        left: 0,
        position: "absolute",
        right: 0,
        top: -30,
    },
    placeholderStyle: {
        borderRadius: 1,
        color: "black",
        fontFamily: "montserrat",
        fontSize: 20,
        fontWeight: "normal",
        marginTop: 20,
        opacity: 0.4,
        width: "100%",
    },
    subContainer: {
        marginTop: 24,
    },
    touchableView: {
        alignItems: "center",
        flexDirection: "row",
        height: "100%",
        marginLeft: "6%",
        width: "100%",
    },
    viewContainer: {
        flex: 1,
    },
});

export default withModelContext(MAEOnboardDetails2);
