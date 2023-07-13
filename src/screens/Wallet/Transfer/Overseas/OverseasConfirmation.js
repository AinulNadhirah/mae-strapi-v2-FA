import moment from "moment";
import numeral from "numeral";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, ScrollView, StyleSheet, Platform, KeyboardAvoidingView } from "react-native";
import DeviceInfo from "react-native-device-info";

import { navigateToS2UCooling } from "@screens/OneTapAuth/CoolingNavigator";

import {
    COMMON_MODULE,
    DASHBOARD,
    FUNDTRANSFER_MODULE,
    ONE_TAP_AUTH_MODULE,
    RSA_DENY_SCREEN,
    TAB_NAVIGATOR,
    TRANSFER_TAB_SCREEN,
    SECURE2U_COOLING,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import { CircularLogoImage } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Secure2uAuthenticationModal from "@components/Modals/Secure2uAuthenticationModal";
import TacModal from "@components/Modals/TacModal";
import AccountDetailList from "@components/Others/AccountDetailList";
import ChallengeQuestion from "@components/RSA/ChallengeQuestion";
import Typography from "@components/TextWithInfo";
import { showInfoToast, showSuccessToast, showErrorToast } from "@components/Toast";

import { withModelContext } from "@context";

import {
    bankingGetDataMayaM2u,
    getSenderDetails,
    performOverSeaTransfer,
    wuValidatePayment,
} from "@services";
import { RemittanceAnalytics } from "@services/analytics/analyticsRemittance";

import { BLACK, MEDIUM_GREY, ROYAL_BLUE, VERY_LIGHT_GREY, YELLOW } from "@constants/colors";
import { COUNTRY_LIST_WITH_CODE, IBAN_CODE_LIST } from "@constants/data/Overseas";
import {
    COMMON_ERROR_MSG,
    DATE_AND_TIME,
    FIRST_TIME_FAVOURITES,
    FIRST_TIME_FAVOURITES_S2U,
    REFERENCE_ID,
    SECURE2U_IS_DOWN,
    TRANSFER_FROM,
    TRX_PROCESSIN_ERR_MSG,
    WE_FACING_SOME_ISSUE,
    DD_MMM_YYYY,
    EXCHANGE_RATE,
} from "@constants/strings";

import {
    checks2UFlow,
    formateAccountNumber,
    getDeviceRSAInformation,
    formatBakongMobileNumbers,
    formateReferenceNumber,
} from "@utils/dataModel/utility";
import { getCountryDataByName, getImage, getName } from "@utils/dataModel/utilityRemittance";
import { errorCodeMap } from "@utils/errorMap";
import { ErrorLogger } from "@utils/logs";

const S2UFlowEnum = Object.freeze({
    s2u: "S2U",
    s2uReg: "S2UReg",
    tac: "TAC",
});

const bakongS2uTxnCode = 40;
class OverseasConfirmation extends Component {
    static propTypes = {
        navigation: PropTypes.object.isRequired,
        route: PropTypes.object.isRequired,
        getModel: PropTypes.func.isRequired,
        updateModel: PropTypes.func.isRequired,
    };

    /***
     * constructor
     * props
     */
    constructor(props) {
        super(props);
        this.state = {
            loader: false,
            screenData: {
                image: "",
                name: "",
                description1: "",
                description2: "",
            },
            error: false,
            errorMessage: "",
            transferParams: this.props.route?.params?.transferParams ?? {},

            // s2u/tac
            showS2UModal: false,
            s2uToken: "",
            s2uServerDate: "",
            s2uTransactionType: "",
            s2uTransactionReferenceNumber: "",
            s2uTransactionDetails: [],
            showTACModal: false,
            tacParams: {},
            transferApiParams: {},
            tacTransactionReferenceNumber: "",
            tacServerDate: "",
            userKeyedInTacValue: "",

            // RSA
            showRSALoader: false,
            showRSAChallengeQuestion: false,
            rsaChallengeQuestion: "",
            showRSAError: false,
            challengeRequest: {},
            rsaCount: 0,

            // form data
            paymentDetailsText: null,

            //discard modal
            close: false,
            accounts: [],
            selectedAccount: null,
            remittanceReferenceNo: null,
            serverDate: null,
            favItem: null,
            flow: null,
            secure2uValidateData: null,
            tacAttempts: 0,
            productType: this.props.route?.params?.transferParams?.remittanceData?.productType,
            isExtendedHour: false,
            isFromCurrencyMyr: true,
            rfq1Data: this.props.route?.params?.transferParams?.remittanceData,
            transactionRefNumber: "",
            isBakong: false,

            //Prevent Multiple Triggering
            disabled: false,
            counter: 0,
        };
    }

    /***
     * componentDidMount
     */
    async componentDidMount() {
        RemittanceAnalytics.trxConfirmationLoaded();
        await this.getAllAccounts();

        this.updateData();

        this.focusSubscription = this.props.navigation.addListener("focus", () => {
            this.updateData();
            if (this.props.route.params.isS2URegistrationAttempted) {
                this._handlePostS2URegistration();
            }
        });
    }

    /***
     * componentWillUnmount
     * Handle Screen UnMount Event
     */
    componentWillUnmount() {
        if (this.focusSubscription) this.focusSubscription();
    }

    // ********* //
    // S2U START //
    // ********* //
    _handlePostS2URegistration = async () => {
        const { flow } = await checks2UFlow(bakongS2uTxnCode, this.props.getModel);
        const {
            route: {
                params: { isS2URegistrationAttempted },
            },
            navigation: { goBack },
        } = this.props;
        if (flow === S2UFlowEnum.s2uReg && isS2URegistrationAttempted) goBack();
        this.updateData();
    };

    getAllAccounts = async () => {
        try {
            const path = "/summary?type=A&checkMae=true";
            const response = await bankingGetDataMayaM2u(path, true);
            const transferParams = this.props.route.params?.transferParams;
            const accNo =
                transferParams?.selectedAccount?.account?.number ||
                transferParams?.fromAccountData?.fromAccountNo;
            if (response?.data?.code === 0) {
                const { accountListings } = response?.data?.result;
                await this._checkS2UStatus();
                if (accountListings?.length) {
                    const filteredAccounts = accountListings.filter((accData) => {
                        return (
                            accData?.number === accNo &&
                            !(
                                accData.type === "D" &&
                                (accData.group === "0YD" || accData.group === "CCD")
                            )
                        );
                    });

                    this.setState({ accounts: filteredAccounts }, () => {
                        const isNotEnoughBalance = this._checkBalance(filteredAccounts);
                        if (isNotEnoughBalance) {
                            showInfoToast({
                                message:
                                    "Insufficient balance in your account. Please select another account and perform the transaction again.",
                            });
                        }
                    });
                }
            }
        } catch (error) {
            // error when retrieving the data
        }
    };

    _checkBalance = (filteredAccounts) => {
        const transferParams = this.state.transferParams;
        const type = this._getType(transferParams?.name);
        const acctBalance =
            filteredAccounts[0]?.currentBalance !== null
                ? parseFloat(filteredAccounts[0]?.currentBalance.replace(/,/g, ""))
                : "";
        const OT_DATA = this.props.getModel("overseasTransfers");
        const purposeInfo = OT_DATA[type + "TransferPurpose"];
        const remittanceData =
            transferParams?.transferParams?.remittanceData || transferParams?.remittanceData;
        const amtToTransfer =
            remittanceData?.fromCurrency !== "MYR"
                ? this.getForeignAmount(transferParams)
                : remittanceData?.amountInRM;
        const svcFee =
            remittanceData?.serviceFee !== "-" ? parseFloat(remittanceData?.serviceFee) : 0.0;
        const miscFees =
            type === "FTT"
                ? parseFloat(purposeInfo?.chargeInquiryInfo?.totNostroAmtMyr) +
                  parseFloat(purposeInfo?.chargeInquiryInfo?.totSvcChrgsMyr)
                : svcFee;
        const ttlToTransfer = parseFloat(amtToTransfer) + miscFees;
        return ttlToTransfer > acctBalance;
    };

    _checkS2UStatus = async () => {
        const { flow, secure2uValidateData } = await checks2UFlow(
            bakongS2uTxnCode,
            this.props.getModel
        );
        const {
            navigation: { setParams, navigate },
        } = this.props;
        this.setState({
            flow: secure2uValidateData?.action_flow ?? flow,
            secure2uValidateData,
        });
        const { transferParams } = this.state;
        const isFav = transferParams?.favourite ?? false;
        const favFlag = transferParams?.favTransferItem?.favFlag ?? "";

        // if it's not a fav txn && flow is s2u register, go to s2u registration flow
        if (flow === SECURE2U_COOLING) {
            navigateToS2UCooling(navigate);
            this.updateData();
        } else if (flow === S2UFlowEnum.s2uReg) {
            setParams({ isS2URegistrationAttempted: true });
            navigate(ONE_TAP_AUTH_MODULE, {
                screen: "Activate",
                params: {
                    flowParams: {
                        success: {
                            stack: "fundTransferModule",
                            screen: "OverseasConfirmation",
                        },
                        fail: {
                            stack: "fundTransferModule",
                            screen: "TransferTabScreen",
                        },
                        params: { ...this.props.route.params },
                    },
                },
            });
        } else if (!isFav && (flow === S2UFlowEnum.tac || flow === "NA")) {
            showInfoToast({ message: SECURE2U_IS_DOWN });
        }

        // Favourite check
        // favFlag: 1 - first time txn, 0 - subsequent txn
        if (isFav && favFlag === "1") {
            // first time fav
            showSuccessToast({
                message:
                    flow === S2UFlowEnum.s2u ? FIRST_TIME_FAVOURITES_S2U : FIRST_TIME_FAVOURITES,
            });
        }
    };

    debounce = (func, delay) => {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(this, args);
            }, delay);
        };
    };

    getToDetails = (transferParams, bankDetails, recipientData, type) => {
        if (type === "FTT" || type === "RT" || type === "MOT") {
            const accNo = bankDetails?.accountNumber ?? bankDetails?.ibanCode;
            return `${bankDetails?.bankName}\n${recipientData?.name}\n${formateAccountNumber(
                accNo,
                accNo?.length
            )}`;
        }
        if (type === "VD") {
            return `${recipientData?.bankName} \n${
                recipientData?.cardHolderFullName
                    ? recipientData?.cardHolderFullName
                    : recipientData?.cardHolderFirstName + " " + recipientData?.cardHolderLastName
            }\n${formateAccountNumber(
                recipientData?.cardNumber,
                recipientData?.cardNumber.length
            )}`;
        }
        if (type === "WU") {
            return `${recipientData?.firstName} ${recipientData?.lastName}`;
        }
        return `${
            transferParams?.transferParams?.name ||
            transferParams?.name ||
            transferParams?.inquiryData?.name
        }\n +855 ${formatBakongMobileNumbers(transferParams?.transferParams?.mobileNo)}`;
    };

    getForeignAmount = (transferParams) => {
        return (
            transferParams?.rfqData?.contraAmount ||
            transferParams?.remittanceData?.toCurrencyAmount
        );
    };

    _generateS2UTransactionDetails = (serverDate, serverDateWithTime) => {
        try {
            const { transferParams } = this.props.route?.params;
            const remittanceData = this.props.route?.params?.remittanceData
                ? this.props.route?.params?.remittanceData
                : transferParams?.remittanceData;
            const { fromAccountName, fromAccountNo } = transferParams?.fromAccountData
                ? transferParams?.fromAccountData
                : transferParams?.selectedAccount;
            const trxName = getName(transferParams?.name);
            const formattedSelectedAccountName = `${
                transferParams?.selectedAccount?.account?.name ||
                transferParams?.selectedAccount?.name ||
                fromAccountName
            }\n${formateAccountNumber(fromAccountNo.replace(/\s/g, ""), 12)}`;

            const formData = this.props.getModel("overseasTransfers");
            const type = this._getType(transferParams?.name);
            const svcFee =
                remittanceData?.serviceFee !== "-" ? parseFloat(remittanceData?.serviceFee) : 0.0;
            const recipientData = formData[type + "RecipientDetails"];
            const purposeInfo = formData[type + "TransferPurpose"];
            const bankDetails = formData[type + "RecipientBankDetails"];

            const trxAmt = `${
                transferParams?.remittanceData?.fromCurrency !== "MYR"
                    ? transferParams?.remittanceData?.fromCurrency
                    : "RM"
            } ${this.parseAmount(remittanceData?.amountInRM)}\n= ${
                transferParams?.remittanceData?.fromCurrency !== "MYR"
                    ? "RM"
                    : transferParams?.remittanceData?.toCurrency
            } ${this.parseAmount(this.getForeignAmount(transferParams))}`;

            const fttBankFee =
                transferParams?.remittanceData?.gour &&
                purposeInfo?.chargeInquiryInfo?.totNostroAmtMyr
                    ? String(purposeInfo?.chargeInquiryInfo?.totNostroAmtMyr)
                    : remittanceData?.bankFee;
            const fttS2uData =
                transferParams?.name === "FTT"
                    ? [
                          {
                              label: "Agent/Beneficiary bank fee",
                              value: `RM ${numeral(fttBankFee).format("0,0.00")}`,
                          },
                      ]
                    : [];
            this.setState({
                s2uTransactionDetails: [
                    {
                        label: "Transfer amount",
                        value: trxAmt,
                    },
                    {
                        label: "Service fee",
                        value: `RM ${numeral(svcFee).format("0,0.00")}`,
                    },
                    ...fttS2uData,
                    {
                        label: "Transfer to",
                        value: this.getToDetails(
                            transferParams,
                            bankDetails,
                            recipientData,
                            transferParams?.name
                        ),
                    },
                    {
                        label: "Transfer from",
                        value: formattedSelectedAccountName,
                    },
                    { label: "Transaction type", value: trxName },
                    {
                        label: "Date & time",
                        value: serverDateWithTime ?? serverDate,
                    },
                ],
            });
        } catch (ex) {}
    };

    // ********* //
    // S2U   END //
    // ********* //

    /***
     * updateData
     * Update Screen Data upon screen focused
     */
    async updateData() {
        const transferParams = this.props.route.params.transferParams;
        const OT_DATA = this.props.getModel("overseasTransfers");
        const remittanceData = transferParams?.remittanceData;
        const sendingInForeignCurrency = remittanceData?.fromCurrency !== "MYR";
        const type = this._getType(transferParams?.name);
        const recipientBankDetails = OT_DATA[type + "RecipientBankDetails"];
        const recipientDetails = OT_DATA[type + "RecipientDetails"];
        const purposeInfo = OT_DATA[type + "TransferPurpose"];
        const svcFee =
            transferParams?.remittanceData?.serviceFee !== "-"
                ? parseFloat(transferParams?.remittanceData?.serviceFee)
                : 0.0;
        const amtToTransfer = sendingInForeignCurrency
            ? transferParams?.rfqData?.contraAmount ?? remittanceData?.toCurrencyAmount
            : remittanceData?.amountInRM;
        const additionalChrgs = transferParams?.remittanceData?.gour
            ? parseFloat(purposeInfo?.chargeInquiryInfo?.totNostroAmtMyr) +
              parseFloat(purposeInfo?.chargeInquiryInfo?.totSvcChrgsMyr)
            : parseFloat("0") + parseFloat(transferParams?.remittanceData?.serviceFee);
        const totalAmt =
            transferParams?.name === "FTT"
                ? parseFloat(amtToTransfer) + additionalChrgs
                : parseFloat(amtToTransfer) + svcFee;
        const amount = totalAmt;

        const screenData = {
            image: getImage(transferParams?.name),
            name:
                formateAccountNumber(
                    recipientBankDetails?.accountNumber,
                    recipientBankDetails?.accountNumber.length
                ) || recipientBankDetails?.ibanCode,
            description1: recipientDetails?.firstName
                ? recipientDetails?.firstName + " " + recipientDetails?.lastName
                : recipientDetails?.name,
            description2: `RM ${numeral(amount).format("0,0.00")}`,
            amount: `RM ${numeral(amount).format("0,0.00")}`,
            remittanceData,
            amtToTransfer,
            additionalChrgs,
            chargeType: purposeInfo?.chargeInquiryInfo?.chargeType ?? "",
            transferParams,
            isFromCurrencyMyr: transferParams?.remittanceData?.fromCurrency === "MYR",
            rfq1Data: transferParams?.remittanceData,
        };

        this.setState({
            transferParams,
            screenData,
            isBakong: transferParams?.transactionTo === "Bakong Wallet",
            productType: remittanceData?.productType,
        });
    }

    getPurpose = (transferParams, purposeInfo, isNonMalaysian) => {
        const purposeData =
            transferParams?.name === "FTT" ||
            transferParams?.name === "WU" ||
            transferParams?.name === "MOT" ||
            transferParams?.name === "RT" ||
            this.state.isBakong
                ? purposeInfo?.transferPurpose?.serviceName
                : null;
        const { transferPurpose, transferSubPurpose } = purposeInfo;

        if (transferParams?.name === "MOT" || transferParams?.name === "RT") {
            return {
                purpose: transferPurpose?.serviceName ?? "",
                purposeCode: transferPurpose?.serviceCode ?? "",
                subPurpose: isNonMalaysian
                    ? transferPurpose?.serviceCode
                    : transferSubPurpose?.subServiceCode,
                subPurposeCode: transferSubPurpose?.subServiceCode ?? "",
            };
        }

        if (transferParams?.name === "WU") {
            return {
                purpose: transferPurpose?.serviceName ?? "",
                purposeCode: transferPurpose?.serviceCode ?? "",
                subPurpose: transferSubPurpose?.subServiceName ?? "",
                subPurposeCode: transferSubPurpose?.subServiceCode ?? "",
            };
        }

        const isFttRt =
            transferParams?.name === "MOT" ||
            transferParams?.name === "RT" ||
            transferParams?.name === "FTT";
        const fttRtPurpose = isNonMalaysian
            ? purposeInfo?.transferPurpose?.serviceCode
            : purposeInfo?.transferSubPurpose?.subServiceCode;
        const fttRtSubPurpose =
            (isNonMalaysian && isFttRt) || this.state.isBakong || !isFttRt ? fttRtPurpose : "";

        return {
            purpose: purposeData ?? purposeInfo?.transferPurpose?.serviceCode ?? "",
            purposeCode: purposeData ?? purposeInfo?.transferPurpose?.serviceCode ?? "",
            subPurpose:
                fttRtSubPurpose ??
                purposeInfo?.transferPurpose?.serviceCode ??
                purposeInfo?.transferSubPurpose?.mbbCode ??
                "",
            subPurposeCode: isNonMalaysian ? purposeInfo?.transferSubPurpose?.subServiceCode : "",
        };
    };

    setname = (nameArray) => {
        if (nameArray?.length > 4) {
            let nameData = "";
            for (const nameIndex of nameArray) {
                if (nameIndex > 2) {
                    nameData += " " + nameArray[nameIndex];
                }
            }
            return [
                nameArray[0] + " " + nameArray[1] + " " + nameArray[2],
                nameArray[3] + nameData,
            ];
        }
        if (nameArray?.length === 4) {
            return [nameArray[0] + " " + nameArray[1], nameArray[2] + " " + nameArray[3]];
        }
        if (nameArray?.length > 2) {
            return nameArray[2]?.length > 4
                ? [nameArray[0] + " " + nameArray[1], nameArray[2]]
                : [nameArray[0], nameArray[1] + " " + nameArray[2]];
        }

        return nameArray;
    };

    getSenderDetailsFromMdm = async (senderPersonalInfo) => {
        const response = senderPersonalInfo || (await getSenderDetails());
        if (senderPersonalInfo?.addr1 || response?.data?.addr1) {
            const { addr1, addr2, addr3, addr4, nationality, phoneNo, customerName, state } =
                senderPersonalInfo?.addr1 ? senderPersonalInfo : response?.data;

            const addressOne = addr1.replace(/\s\s+/g, " ");
            const addressTwo = addr2.replace(/\s\s+/g, " ");
            const addressThree = addr3.replace(/\s\s+/g, " ");
            const addressFour = addr4.replace(/\s\s+/g, " ");

            const addOne = addressFour ? (addressOne + " " + addressTwo).trim() : addressOne.trim();

            const addTwoWithCity = addressFour ? (addressThree + " " + addressFour).trim() : null;
            const addTwoWithoutCity =
                addressThree && addressTwo
                    ? (addressTwo + " " + addressThree).trim()
                    : addressTwo.trim();
            const addTwo = addTwoWithCity || addTwoWithoutCity;
            const nameArray = this.setname(customerName.split(" "));

            return { addOne, addTwo, nationality, phoneNo, nameArray, state };
        } else {
            showErrorToast({ message: response?.data?.statusDesc ?? COMMON_ERROR_MSG });
        }
    };

    getSenderInfo = async (hasAddress, senderPersonalInfo) => {
        if (hasAddress) return;
        try {
            const dataFromMdm = await this.getSenderDetailsFromMdm(senderPersonalInfo);

            if (dataFromMdm?.addOne) {
                return dataFromMdm;
            }
            this.setState({ loader: false });
        } catch (ex) {
            this.setState({ loader: false });
            showErrorToast({ message: WE_FACING_SOME_ISSUE });
        }
    };

    handleIdType = (nationality) => {
        return nationality === "M" || nationality === "NID" ? "NATIONAL_ID" : "PASSPORT";
    };

    handleBopCode = (product, senderNationality, rmAmount, serviceCode) => {
        const productsApplicable =
            product === "FTT" ||
            product === "RT" ||
            product === "MOT" ||
            product === "BK" ||
            product === "Bakong";
        if (productsApplicable && senderNationality === "M") {
            if (parseFloat(rmAmount) <= 10000.99) {
                return "OA";
            }
            return serviceCode;
        }

        return "EX";
    };

    getExchangeRate = (transferParams) => {
        const data = transferParams?.remittanceData;
        const feRateVnd =
            data?.toCurrency === "VND"
                ? `RM 10 = ${data?.toCurrency} ${numeral(String(data?.exchangeRate)).format(
                      "0,0.0000"
                  )}`
                : "";
        const feRate =
            data?.fromCurrency !== "MYR"
                ? `${data?.fromCurrency} 1.00 = RM ${data?.exchangeRate}`
                : `RM ${numeral(data?.exchangeRate).format("0,0.0000")} = ${data?.toCurrency} ${
                      data?.toCurrency === "VND" ? "10" : "1"
                  }`;
        const feRateWu =
            data?.fromCurrency !== "MYR"
                ? `${data?.fromCurrency} 1.00 = RM ${data?.exchangeRate}`
                : `RM ${numeral(data?.exchangeRate).format("0,0.0000")}\n= ${
                      data?.toCurrency
                  } 1.00`;
        const feRateVD =
            data?.fromCurrency !== "MYR"
                ? `${data?.fromCurrency} 1.00 = RM ${data?.exchangeRate}`
                : `RM 1.00 = ${data?.toCurrency} ${numeral(data?.exchangeRate).format("0,0.0000")}`;

        if (data?.productType === "WU") return feRateWu;
        if (data?.productType === "VD") return feRateVD;
        return feRateVnd || feRate;
    };

    doneClick = async () => {
        //Prevent Multiple Triggering
        this.setState({ counter: this.state.counter + 1 });
        const preventMultiple = !this.state.disabled && this.state.counter === 1;
        if (preventMultiple) {
            this.setState({ disabled: true, counter: this.state.counter + 1 });
            const isNotEnoughBalance = this._checkBalance(this.state.accounts);
            if (isNotEnoughBalance) {
                this.setState({ disabled: false, counter: 0 });
                showInfoToast({
                    message:
                        "Insufficient balance in your account. Please select another account and perform the transaction again.",
                });
                return;
            }
            this.setState({ loader: true, transactionRefNumber: "" });
            const { transferParams } = this.state;
            const fromAccountData = transferParams?.fromAccountData?.account
                ? transferParams?.fromAccountData
                : transferParams?.selectedAccount;
            const { getModel } = this.props;
            const remittanceData =
                transferParams?.transferParams?.remittanceData || transferParams?.remittanceData;
            const responseObject =
                transferParams?.transferParams?.favTransferItem?.responseObject ?? "";
            const svcFee =
                remittanceData?.serviceFee !== "-" ? parseFloat(remittanceData?.serviceFee) : 0.0;
            const formData = getModel("overseasTransfers");
            const { m2uPhoneNumber } = getModel("m2uDetails");
            const { icNumber } = getModel("user");
            const type = this._getType(transferParams?.name);
            const { flow, secure2uValidateData } = this.state;
            try {
                const s2uFlow =
                    secure2uValidateData?.pull === "N" ? "SECURE2U_PUSH" : "SECURE2U_PULL";
                const { deviceInformation, deviceId } = getModel("device");
                const { icPassportNumber, name, nationality, idNumber, cardNumber } =
                    formData[type + "RecipientDetails"];
                const wuSndrDetailStepTwo = formData?.WUSenderDetailsStepTwo?.tempAddressLineOne
                    ? formData?.WUSenderDetailsStepTwo
                    : "";
                const senderInfo =
                    transferParams?.name === "WU"
                        ? {
                              ...formData?.WUSenderDetailsStepOne,
                              ...wuSndrDetailStepTwo,
                              ...formData?.WUSenderDetailsStepThree,
                          }
                        : {
                              ...formData?.OverseasSenderDetails,
                              ...formData[type + "SenderDetails"],
                          };
                const purposeInfo = formData[type + "TransferPurpose"];
                const senderPersonalInfo = formData?.OverseasSenderDetails;
                const mobileSDKData = getDeviceRSAInformation(
                    deviceInformation,
                    DeviceInfo,
                    deviceId
                );

                const isFav = transferParams?.favourite ?? false;
                const favFlag = transferParams?.favTransferItem?.favFlag ?? "";
                const userInfo = await this.getSenderInfo(
                    senderInfo?.addressLineOne !== "" ||
                        senderInfo?.mobileNumber !== "" ||
                        senderInfo?.phoneNo !== "",
                    senderPersonalInfo
                );
                const userContact = (
                    userInfo?.phoneNo ||
                    senderInfo?.mobileNumber ||
                    senderInfo?.phoneNo
                )?.replace(/^01/, "601");
                const nameArray = this.setname(senderInfo?.name?.split(" "));
                const nationalityCode = userInfo?.nationality;
                const countryData = COUNTRY_LIST_WITH_CODE.filter((item) => {
                    return item.name === nationalityCode || item.name === "MALAYSIA";
                });

                const wuPostCode =
                    transferParams?.name === "WU"
                        ? formData.WUSenderDetailsStepOne?.postCode ||
                          formData.WUSenderDetailsStepTwo?.postCode
                        : null;
                const wuSenderCountry =
                    transferParams?.name === "WU"
                        ? getCountryDataByName(
                              formData.WUSenderDetailsStepOne?.addressCountry?.countryName
                          )
                        : {};
                console.tron.log("wuSenderCountry: ", wuSenderCountry);
                const sdrPostalCode =
                    wuPostCode?.replace("undefined", "") ||
                    senderInfo?.postCode ||
                    userInfo?.postCode;

                const address = {
                    addressLine1: (senderInfo?.addressLineOne || userInfo?.addOne)
                        ?.replace(/^[^a-zA-Z0-9\s]|^\s/, "")
                        .trim(),
                    addressLine2: (senderInfo?.addressLineTwo || userInfo?.addTwo)
                        ?.replace(/^[^a-zA-Z0-9\s]|^\s/, "")
                        .trim(),
                    country:
                        wuSenderCountry || senderInfo?.country?.countryName
                            ? wuSenderCountry || senderInfo?.country
                            : {
                                  countryName: senderInfo?.countryName || countryData[0]?.name,
                                  countryCode: senderInfo?.countryCode || countryData[0]?.code,
                              },
                    postalCode: sdrPostalCode,
                    sdrPostalCode,
                    city:
                        senderInfo?.city ??
                        senderInfo?.state ??
                        responseObject?.senderInfo?.senderState,
                    state:
                        senderInfo?.city ??
                        senderInfo?.state ??
                        responseObject?.senderInfo?.senderState,
                };
                const currentAddress = wuSndrDetailStepTwo?.tempAddressLineOne
                    ? {
                          addressLine1: wuSndrDetailStepTwo?.tempAddressLineOne
                              ?.replace(/^[^a-zA-Z0-9\s]|^\s/, "")
                              .trim(),
                          addressLine2: wuSndrDetailStepTwo?.tempAddressLineTwo
                              ?.replace(/^[^a-zA-Z0-9\s]|^\s/, "")
                              .trim(),
                          postalCode: wuSndrDetailStepTwo?.postCode,
                          sdrPostalCode: wuSndrDetailStepTwo?.postCode,
                          country: wuSndrDetailStepTwo?.country || {},
                          city: wuSndrDetailStepTwo?.city,
                          state: wuSndrDetailStepTwo?.state,
                      }
                    : {};

                const chargeInquiryInfo =
                    type === "FTT"
                        ? {
                              ...purposeInfo?.chargeInquiryInfo,
                              nostroChrgsCurr: "",
                              nostroChrgs: "Y",
                              cableChrgs: "Y",
                              fttCurrency: transferParams?.remittanceData?.toCurrency,
                          }
                        : {};
                const vdParams =
                    transferParams?.name === "VD"
                        ? {
                              ...formData[type + "RecipientDetails"],
                              ...transferParams?.remittanceData,
                              mobileNo: userInfo?.phoneNo?.replace(/^01/, "601"),
                              fromCurrency: transferParams?.remittanceData?.fromCurrency,
                              toCurrency: transferParams?.remittanceData?.toCurrency,
                              receiverNationality: "",
                              rateInquiry: transferParams?.remittanceData,
                          }
                        : {};
                const { commonInfo, beneInfo } = this._getAdditionalParams(
                    formData,
                    nationalityCode,
                    transferParams,
                    nameArray,
                    userContact
                );
                const isGour = transferParams?.remittanceData?.gour;
                const rmTransferAmt =
                    transferParams?.remittanceData?.fromCurrency !== "MYR"
                        ? this.getForeignAmount(transferParams)
                        : transferParams?.remittanceData?.amountInRM;
                const totalAmt =
                    transferParams?.name === "FTT"
                        ? parseFloat(rmTransferAmt) +
                          parseFloat(
                              isGour
                                  ? chargeInquiryInfo?.totNostroAmtMyr
                                  : transferParams?.remittanceData?.bankFee
                          ) +
                          parseFloat(isGour ? chargeInquiryInfo?.totSvcChrgsMyr : 0)
                        : parseFloat(rmTransferAmt) + svcFee;
                const bopCode = this.handleBopCode(
                    this.state.isBakong ? "BK" : transferParams?.name,
                    commonInfo?.senderCitizenship,
                    transferParams?.remittanceData?.fromCurrency !== "MYR"
                        ? transferParams?.rfqData?.contraAmount
                        : transferParams?.remittanceData?.amountInRM,
                    purposeInfo?.transferSubPurpose?.subServiceCode
                );
                const bakongParams =
                    this.state.isBakong && transferParams?.favTransferItem?.bauBakong
                        ? {
                              addFavourite: true,
                              nickName: transferParams?.favTransferItem?.name,
                          }
                        : null;
                const rtParams =
                    transferParams?.name === "RT" || transferParams?.name === "MOT"
                        ? {
                              sourceCountry: "MY",
                              destinationCountry: "SG",
                          }
                        : {};
                const sdrId = this.handleIdType(
                    this.state.isBakong ? formData?.BakongRecipientIDDetails?.idType : nationality,
                    transferParams?.name === "WU"
                );
                const remitterMobile = commonInfo?.senderMobileNo ?? userContact ?? m2uPhoneNumber;
                const mobileNumber = remitterMobile;
                const isRtSenderForeigner = transferParams?.favourite
                    ? formData?.MOTSenderDetails?.nationality?.toUpperCase() !== "MALAYSIA"
                    : formData?.OverseasSenderDetails?.isMalaysian === false;
                const isFttSenderForeigner = formData?.FTTSenderDetails?.nationality === "NM";
                const purposeSubPurposeData =
                    transferParams?.name !== "VD"
                        ? this.getPurpose(
                              transferParams,
                              purposeInfo,
                              (transferParams?.name === "FTT" && isFttSenderForeigner) ||
                                  ((transferParams?.name === "RT" ||
                                      transferParams?.name === "MOT") &&
                                      isRtSenderForeigner)
                          )
                        : {};

                const { rateFlag, hourIndicator } = remittanceData || {};
                const payload = {
                    rateFlag: rateFlag ?? "",
                    hourIndicator: hourIndicator ?? "",
                    address,
                    currentAddress,
                    postCode: address?.postalCode,
                    sdrPostalCode,
                    idNo: senderInfo?.idNumber ?? icNumber,
                    idType: senderInfo?.idNumber ?? sdrId,
                    sdrId: senderInfo?.idNumber ?? icNumber,
                    mobileSDKData,
                    fromAccountNo: fromAccountData?.account?.number.replace(/\s/g, ""),
                    fromAccountCode: fromAccountData?.account?.code,
                    // fromAccountType: fromAccountData?.account?.type === "S" ? "SA" : "CA",
                    accountType: fromAccountData?.account?.type === "S" ? "SA" : "CA",
                    nationality:
                        transferParams?.name === "VD"
                            ? address?.country?.countryCode
                            : address?.country?.countryName ?? "",
                    recipientName: name,
                    transferAmount: this.parseAmount(this.state.screenData?.amtToTransfer).replace(
                        /\,/g,
                        ""
                    ),
                    transferCurrency: "MYR",
                    transferType: this.state.isBakong ? "BAKONG_TRANSFER" : "BANKING_TRANSFER",
                    twoFAType: flow === "S2U" && !isFav ? s2uFlow : "TAC",
                    type: isFav ? "FAVORITE" : "OPEN",
                    reference: transferParams?.recipientRef,
                    paymentDetails: transferParams?.paymentDetails,
                    contraAmount: transferParams?.contraAmount,
                    recipientReference: transferParams?.recipientRef,
                    product: this.state.isBakong ? "Bakong" : transferParams?.name,
                    ...purposeSubPurposeData,
                    benePaymentDetail: beneInfo,
                    relationshipStatus: purposeInfo?.relationShipStatus?.replace("-", "") || "NA",
                    additionalInfo: purposeInfo?.additionalInfo,
                    ...commonInfo,
                    ...vdParams,
                    ...transferParams?.rfqData,
                    bopCode,
                    serviceCharge: numeral(
                        purposeInfo?.chargeInquiryInfo?.totSvcChrgsMyr
                            ? purposeInfo?.chargeInquiryInfo?.totSvcChrgsMyr
                            : svcFee
                    ).format("0,0.00"),
                    serviceFee: numeral(
                        purposeInfo?.chargeInquiryInfo?.totSvcChrgsMyr
                            ? purposeInfo?.chargeInquiryInfo?.totSvcChrgsMyr
                            : svcFee
                    ).format("0,0.00"),
                    // for FTT
                    // *****
                    selectedBankFeeType: purposeInfo?.selectedBankFeeType,
                    bankFee:
                        transferParams?.name !== "WU"
                            ? numeral(
                                  String(
                                      purposeInfo?.chargeInquiryInfo?.totNostroAmtMyr ??
                                          remittanceData?.bankFee
                                  )
                              ).format("0,0.00")
                            : "0.00",
                    chargeInquiryInfo,
                    senderMobileNo: mobileNumber,
                    mobileNo: mobileNumber,
                    totalAmount: this.parseAmount(totalAmt),
                    receiveMode: remittanceData?.receiveMethod,
                    ...bakongParams,
                    trxId: formData?.trxId,
                    paymentRefNo: formData?.paymentRefNo,
                    customerName: beneInfo?.beneName,
                    rateInquiry: transferParams?.remittanceData,
                    ...rtParams,
                    favStatus: transferParams?.favTransferItem?.favFlag || "",
                };
                const prodType =
                    remittanceData?.productType === "RT" ? "MOT" : remittanceData?.productType;
                const favSenderNationality =
                    payload?.senderCitizenship ||
                    senderInfo?.nationality === "M" ||
                    senderInfo?.nationality === "NM"
                        ? payload?.senderCitizenship || senderInfo?.nationality
                        : null;
                const recipIdNum = this.state.isBakong
                    ? formData?.BakongRecipientIDDetails?.icPassportNumber
                    : icPassportNumber || idNumber || cardNumber;
                const recipIdType = this.state.isBakong
                    ? this.handleIdType(formData?.BakongRecipientIDDetails?.idType)
                    : nationality === "M"
                    ? "NID"
                    : "PASSPORT";
                const policeId = senderInfo?.selectedIDType?.value === "PIC" ? "POLICE_ID" : null;
                const favIdType = recipIdNum ? recipIdType : "";
                const beneName =
                    (remittanceData?.productType === "WU" ||
                        remittanceData?.productType === "VD") &&
                    beneInfo?.beneFirstName === beneInfo?.beneLastName
                        ? beneInfo?.beneFirstName
                        : beneInfo?.beneName;
                this.setState({
                    favItem: {
                        payload,
                        favBakongInd: "Y",
                        favRTInd: "Y",
                        favFTTInd: "Y",
                        fawVisalnd: "Y",
                        favWUSenderInd: "Y",
                        favWUBeneficiaryInd: "Y",
                        action: "ADD",
                        product: this.state.isBakong ? "Bakong" : remittanceData?.productType,
                        transferType: this.state.isBakong ? "Bakong" : prodType,
                        transferToCountry: formData?.selectedCountry?.countryName,
                        idNum: recipIdNum,
                        idType: policeId || favIdType,
                        regName: this.state.isBakong ? transferParams?.name : beneName,
                        mobileNo: payload?.benePaymentDetail?.beneContactNo?.replace(/^01/, "601"),
                        email: payload?.benePaymentDetail?.beneEmailAdd,
                        acctNo: beneInfo?.beneAcctNo || beneInfo?.beneIbanCode || "",
                        bankName: payload?.benePaymentDetail?.beneBankName,
                        address1: payload?.benePaymentDetail?.address?.addressLine1,
                        address2: payload?.benePaymentDetail?.address?.addressLine2,
                        country: payload?.benePaymentDetail?.address?.country?.countryName,
                        nationalityCode: payload?.benePaymentDetail?.address?.country?.countryCode,
                        postCode: payload?.benePaymentDetail?.address?.country?.postalCode,
                        senderNationality:
                            favSenderNationality ?? senderInfo?.isMalaysian ? "M" : "NM",
                        wuNumber: senderInfo?.WUNumber ? senderInfo?.WUNumber : null,
                    },
                });

                const wuResponse =
                    transferParams?.name === "WU" ? await this.performValidationForWu(payload) : {};

                if (transferParams?.name === "WU" && !wuResponse?.tempTransactionId) {
                    this.setState({ loader: false, disabled: false, counter: 0 });
                    return;
                }

                this._handleTrx2(
                    secure2uValidateData,
                    flow,
                    payload,
                    isFav,
                    favFlag,
                    wuResponse,
                    this.state.isBakong
                );
            } catch (ex) {
                this.setState({ disabled: false, counter: 0 });
                showErrorToast({ message: WE_FACING_SOME_ISSUE });
            }
        }
    };

    debouncedDoneClick = this.debounce(this.doneClick, 500); // Adjust the delay (in milliseconds) as needed

    _handleTrx2 = (secure2uValidateData, flow, payload, isFav, favFlag, wuResponse, isBakong) => {
        if (isFav && favFlag === "0") {
            // SUBSEQUENT FAV TRANSFER
            // SKIP S2U/TAC flow and call txn api
            this.setState(
                { transferApiParams: { ...payload, ...wuResponse }, loader: true },
                () => {
                    this._onTACDone("");
                }
            );
            return;
        }

        if (
            ((!isFav || (isFav && favFlag === "1")) && flow === S2UFlowEnum.s2u) ||
            this.props.route?.params?.auth === "success"
        ) {
            // FIRST-TIME FAV TRANSFER or OPEN S2U TRANSFER
            // do s2u flow first if not Bakong transfer
            const twoFAS2uType =
                secure2uValidateData?.pull === "N" ? "SECURE2U_PUSH" : "SECURE2U_PULL"; //s2u interops changes
            this._handleS2UTransfer({
                ...payload,
                ...wuResponse,
                twoFAType: twoFAS2uType,
                smsTac: "",
                type: isFav ? "FAVORITE" : "OPEN",
                secure2uValidateData,
            });
            return;
        }

        // TAC OPEN/FAV TRANSFER
        this._handleTACTransfer({
            ...payload,
            ...wuResponse,
            twoFAType: "TAC",
            type: isFav ? "FAVORITE" : "OPEN",
        });
    };

    _handleTrx = (secure2uValidateData, flow, payload, isFav, favFlag, wuResponse) => {
        if (isFav) {
            // FAV TRANSFER
            if (favFlag === "1") {
                // FIRST-TIME FAV TRANSFER
                // do tac flow first
                console.tron.log(
                    "[OverseasConfirmation][doneClick] flow: first-time fav txn - TAC"
                );
                this._handleTACTransfer({
                    ...payload,
                    ...wuResponse,
                    twoFAType: "TAC",
                    type: "FAVORITE",
                });
            } else {
                // SUBSEQUENT FAV TRANSFER
                // SKIP TAC flow and call txn api
                console.tron.log("[OverseasConfirmation][doneClick] flow: subsequent fav txn");
                this.setState(
                    { transferApiParams: { ...payload, ...wuResponse }, loader: true },
                    () => {
                        this._onTACDone("");
                    }
                );
            }
        } else if (flow === S2UFlowEnum.s2u || this.props.route?.params?.auth === "success") {
            // S2U OPEN TRANSFER
            console.tron.log("[OverseasConfirmation][doneClick] flow: open transfer - S2U");
            const twoFAS2uType =
                secure2uValidateData?.pull === "N" ? "SECURE2U_PUSH" : "SECURE2U_PULL"; //s2u interops changes
            this._handleS2UTransfer({
                ...payload,
                ...wuResponse,
                twoFAType: twoFAS2uType,
                smsTac: "",
                type: "OPEN",
                secure2uValidateData,
            });
        } else {
            // TAC OPEN TRANSFER
            console.tron.log("[OverseasConfirmation][doneClick] flow: open transfer - TAC");
            this._handleTACTransfer({
                ...payload,
                ...wuResponse,
                twoFAType: "TAC",
                type: "OPEN",
            });
        }
    };

    _removeSpecialChars = (text) => {
        if (text) {
            return text?.replace(/[^a-zA-Z0-9\ ]/g, "");
        }
    };

    _getAdditionalParams = (formData, nationalityCode, transferParams, nameArray, userContact) => {
        const type = this._getType(transferParams?.name);
        const {
            addressLineOne,
            addressLineTwo,
            country,
            mobileNumber,
            firstName,
            lastName,
            city,
            state,
            postCode,
            countryForCode,
            countryForName,
            countryCode,
            countryName,
            selectedIDType,
            idNumber,
            idType,
            icPassportNumber,
            addressCountry,
            email,
            name,
        } = formData[type + "RecipientDetails"];
        const senderInfo =
            transferParams?.name === "WU"
                ? {
                      ...formData?.WUSenderDetailsStepOne,
                      ...formData?.WUSenderDetailsStepTwo,
                      ...formData?.WUSenderDetailsStepThree,
                  }
                : { ...formData?.OverseasSenderDetails, ...formData[type + "SenderDetails"] };
        const purposeInfo = formData[type + "TransferPurpose"];
        const senderCitizenshipWu =
            transferParams?.name === "WU" ? senderInfo?.countryOfCitizenship?.countryName : "";
        const senderCitizenship =
            senderInfo?.nationality === "M" ||
            senderInfo?.nationality === "MALAYSIA" ||
            senderInfo?.countryOfCitizenship?.countryCode === "MY"
                ? "M"
                : "NM";
        const hpNo = (userContact || senderInfo?.phoneNo || senderInfo?.mobileNumber)?.replace(
            /^01/g,
            "601"
        );
        const dateOfBirth = senderInfo?.dateOfBirth
            ? moment(senderInfo?.dateOfBirth, DD_MMM_YYYY).format("DDMMYYYY")
            : null;

        const beneDOB =
            transferParams?.name === "WU"
                ? moment(formData.WURecipientDetails?.displayDateOfBirth, DD_MMM_YYYY).format(
                      "DDMMYYYY"
                  ) ?? ""
                : "";

        const wuSenderId =
            transferParams?.name === "WU" && senderInfo?.selectedIDType?.value === "PIC"
                ? "POLICE_ID"
                : null;
        const senderIdType = senderInfo?.selectedIDType
            ? senderInfo?.selectedIDType?.value === "PIC"
                ? "POLICE_ID"
                : senderInfo?.selectedIDType?.name ||
                  senderInfo?.selectedIDType[0]?.name ||
                  senderInfo?.selectedIDType
            : null;

        const employmentStatus =
            senderInfo?.selectedEmplPosLevel &&
            senderInfo?.selectedEmplPosLevel?.name !== null &&
            senderInfo?.selectedEmplPosLevel !== {}
                ? senderInfo?.selectedEmplPosLevel?.name || senderInfo?.selectedEmplPosLevel
                : "";
        const favBeneData =
            this.state.transferParams?.favTransferItem?.responseObject?.beneInfo || {};
        const favSenderData =
            this.state.transferParams?.favTransferItem?.responseObject?.senderInfo || {};
        const allowedCountriesWithState = ["MX", "US"];
        const destCountryCode = formData?.selectedCountry?.countryCode;
        const commonInfo =
            transferParams?.name === "WU"
                ? {
                      idNo: senderInfo?.idNumber,
                      idType:
                          wuSenderId ??
                          this.handleIdType(
                              senderInfo?.selectedIDType?.value === "NIC" ||
                                  senderInfo?.selectedIDType[0]?.value === "NIC"
                                  ? "M"
                                  : "NM"
                          ),

                      sdrId: senderInfo?.idNumber || senderInfo?.selectedIDType?.name,
                      occupation: senderInfo?.selectedOccupation?.value,
                      senderOccupation: senderInfo?.selectedOccupation?.value,
                      serviceName: "MONEY IN MINUTES",
                      senderCountryOfBirth:
                          senderInfo?.countryOfBirth?.countryName || senderInfo?.countryOfBirth,
                      senderCitizenship: senderCitizenshipWu || senderCitizenship,
                      myWUAccountNumber: senderInfo?.WUNumber,
                      idIssueCountry:
                          transferParams?.name === "WU"
                              ? senderInfo?.idIssueCountry?.countryName
                              : senderInfo?.country?.countryName,
                      dateOfBirth,
                      emailId: senderInfo?.email ?? "",
                      senderIdType,
                      employmentStatus,
                      employerName: "",
                      employmentIndustry: "",
                      sourceOfFund:
                          senderInfo?.selectedSourceOfFunds?.name ||
                          senderInfo?.selectedSourceOfFunds,
                      receiverFirstName: this._removeSpecialChars(firstName),
                      receiverLastName: this._removeSpecialChars(lastName),
                      receiverMobileNum: mobileNumber
                          ?.replace("855+855", "855")
                          ?.replace(/^01/, "601"),
                      receiverAddress1: addressLineOne,
                      receiverAddress2: addressLineTwo,
                      receiverCity:
                          transferParams?.apiParams?.selectedCity ||
                          favBeneData?.addressInfo?.city ||
                          city ||
                          "",
                      receiverState: allowedCountriesWithState.includes(destCountryCode)
                          ? transferParams?.apiParams?.selectedState ||
                            favBeneData?.addressInfo?.stateCode
                          : "",
                      receiverPostalCode: postCode,
                      receiverCountryCode: countryForCode?.countryCode,
                      receiverCountryName: countryForName?.countryName,
                      receiverDOB: beneDOB,
                      receiverIDType:
                          selectedIDType?.name ?? idType === "NID" ? "NATIONAL_ID" : idType,
                      receiverIDData: icPassportNumber || idNumber || "",
                      idIssueDate:
                          !senderInfo?.idIssueDate ||
                          senderInfo?.idIssueDate === "Invalid date" ||
                          senderInfo?.idIssueDate === null
                              ? ""
                              : moment(senderInfo?.idIssueDate, DD_MMM_YYYY).format("DDMMYYYY"),
                      idExpiryDate:
                          !senderInfo?.idIssueDate ||
                          senderInfo?.idExpiryDate === "Invalid date" ||
                          senderInfo?.idExpiryDate === null
                              ? ""
                              : moment(senderInfo?.idExpiryDate, DD_MMM_YYYY).format("DDMMYYYY"),
                      relationshipStatus: senderInfo?.selectedRelationToRecip?.name
                          ? senderInfo?.selectedRelationToRecip?.name.replace(/[\/ ]/g, "_")
                          : senderInfo?.selectedRelationToRecip,
                      addressLine1: (senderInfo?.addressLineOne || senderInfo?.tempAddressLineOne)
                          ?.replace(/^[^a-zA-Z0-9\s]|^\s/, "")
                          ?.trim(),
                      addressLine2: (senderInfo?.addressLineTwo || senderInfo?.tempAddressLineTwo)
                          ?.replace(/^[^a-zA-Z0-9\s]|^\s/, "")
                          ?.trim(),
                      country: senderInfo?.country?.countryName,
                      senderMobileNo: favSenderData?.senderMobileNumber || hpNo,
                      senderFirstName: favSenderData?.senderFirstName
                          ? favSenderData?.senderFirstName?.trim()
                          : this._removeSpecialChars(nameArray[0]),
                      senderLastName: favSenderData?.senderSecondName
                          ? favSenderData?.senderSecondName?.trim()
                          : this._removeSpecialChars(nameArray[1] ?? nameArray[0]),
                      senderBeneRelation: senderInfo?.selectedRelationToRecip?.name,
                      senderIdIssueCountry: senderInfo?.idIssueCountry?.countryName,
                  }
                : {
                      senderCountryOfBirth: senderInfo?.countryOfBirth?.countryName,
                      senderCitizenship,
                      idIssueCountry: senderInfo?.country?.countryName,
                      dateOfBirth,
                      emailId: senderInfo?.email ?? "",
                      senderIdType: senderInfo?.selectedIDType?.name,
                      employmentStatus: "",
                      employerName: "",
                      employmentIndustry: "",
                      sourceOfFund:
                          senderInfo?.selectedSourceOfFunds?.name?.toUpperCase() ||
                          purposeInfo?.sourceOfFunds?.toUpperCase(),

                      receiverFirstName: firstName,
                      receiverLastName: lastName,
                      receiverMobileNum:
                          type === "BK"
                              ? this.state.transferParams?.favTransferItem?.responseObject?.beneInfo
                                    ?.contactNo ??
                                "855" +
                                    (transferParams?.transferParams?.mobileNo ||
                                        transferParams?.mobileNo)
                              : mobileNumber?.replace(/^01/, "601"),
                      receiverAddress1: addressLineOne,
                      receiverAddress2: addressLineTwo,
                      receiverCity: city,
                      receiverState: state,
                      receiverPostalCode: postCode,
                      receiverCountryCode:
                          country?.countryCode || countryCode || addressCountry?.countryCode,
                      receiverCountryName:
                          country?.countryName || countryName || addressCountry?.countryName,
                      receiverIDType: this.state.isBakong
                          ? formData?.BakongRecipientIDDetails?.idType
                          : selectedIDType?.name,
                      receiverIDData: this.state.isBakong
                          ? formData?.BakongRecipientIDDetails?.icPassportNumber
                          : icPassportNumber ?? idNumber,
                      relationshipStatus: purposeInfo?.relationShipStatus?.replace("-", "") || "NA",
                      addressLine1: addressLineOne,
                      addressLine2: addressLineTwo,
                      senderMobileNo:
                          (senderInfo?.phoneNo || senderInfo?.mobileNumber)?.replace(
                              /^01/,
                              "601"
                          ) || userContact,
                  };

        const beneContactNo =
            type === "BK"
                ? this.state.transferParams?.favTransferItem?.responseObject?.beneInfo?.contactNo ??
                  "855" + (transferParams?.transferParams?.mobileNo || transferParams?.mobileNo)
                : mobileNumber?.replace(/^01/, "601");
        const beneMobileNo =
            type === "BK"
                ? this.state.transferParams?.favTransferItem?.responseObject?.beneInfo?.contactNo ??
                  "855" + (transferParams?.transferParams?.mobileNo || transferParams?.mobileNo)
                : mobileNumber?.replace(/^01/, "601");

        const accNo =
            formData[type + "RecipientBankDetails"]?.accountNumber ||
            formData[type + "RecipientBankDetails"]?.ibanCode ||
            "";
        const beneAcctId =
            type === "BK" ? transferParams.inquiryData?.accountId : accNo?.replace(/\s+/g, "");
        const beneName = type === "BK" ? transferParams.inquiryData?.name : name;
        const beneFirstName =
            transferParams?.name === "WU" || transferParams?.name === "VD"
                ? formData?.VDRecipientDetails?.cardHolderFirstName ??
                  formData?.WURecipientDetails?.firstName
                : " ";
        const beneLastName =
            transferParams?.name === "WU" || transferParams?.name === "VD"
                ? formData?.VDRecipientDetails?.cardHolderLastName ??
                  formData?.WURecipientDetails?.lastName
                : " ";
        const beneBankName =
            type === "BK"
                ? transferParams.inquiryData?.bankName
                : formData[type + "RecipientBankDetails"]?.selectedBank?.name ??
                  formData[type + "RecipientBankDetails"]?.bankName ??
                  formData[type + "RecipientDetails"]?.bankName ??
                  "";
        const beneIcCode = formData[type + "RecipientBankDetails"]?.swiftCode || "";
        const beneBankAddress = formData[type + "RecipientBankDetails"]?.branchAddress;
        const beneBankCity = formData[type + "RecipientBankDetails"]?.city;
        const fttBeneData =
            type === "FTT"
                ? this._getSpecialBitType(
                      transferParams?.countryData?.countryCode,
                      formData[type + "RecipientBankDetails"]
                  )
                : null;
        const beneAcctNo = accNo ? accNo?.replace(/\s+/g, "") : fttBeneData?.beneIbanCode ?? "";
        const beneInfo = {
            destCtryName: formData?.selectedCountry?.countryName,
            destCtryCode: formData?.selectedCountry?.countryCode,
            beneName,
            beneFirstName,
            beneLastName,
            address: {
                addressLine1: addressLineOne,
                addressLine2: addressLineTwo,
                addressLine3: "",
                city,
                town: state,
                state,
                postalCode: postCode,
                country: {
                    countryName:
                        countryForName?.countryName ||
                        countryName ||
                        addressCountry?.countryName ||
                        country?.countryName,
                    countryCode:
                        countryForCode?.countryCode ||
                        countryCode ||
                        addressCountry?.countryCode ||
                        country?.countryCode,
                },
            },
            beneEmailAdd: email ?? "",
            beneContactNo: beneContactNo?.replace("855+855", "855"),
            beneMobileNo: beneMobileNo?.replace("855+855", "855"),
            beneAcctNo,
            beneAcctId: type === "BK" ? transferParams.inquiryData?.accountId : beneAcctId,
            beneBankName:
                type === "WU"
                    ? "Western Union"
                    : String(beneBankName).replace(`(${beneIcCode})`, "").trim(),
            beneBankAddress,
            beneBankCity,
            beneIcCode,
            ...formData[type + "RecipientBankDetails"]?.inquiryData,
            ...fttBeneData,
        };

        return { beneInfo, commonInfo };
    };

    _getSpecialBitType = (code, data) => {
        if (IBAN_CODE_LIST.includes(code)) {
            return {
                specialBit: "IBAN_CODE",
                specialBitValue: data?.ibanCode,
                beneIbanCode: data?.ibanCode ?? "",
            };
        } else {
            if (code === "AU") {
                return {
                    specialBit: "BSB_CODE",
                    specialBitValue: data?.bsbCode ?? "",
                    beneBsbCode: data?.bsbCode ?? "",
                };
            }
            if (code === "GB") {
                return {
                    specialBit: "SORT_CODE",
                    specialBitValue: data?.sortCode,
                    beneSortCode: data?.sortCode ?? "",
                };
            }
            if (code === "IN") {
                return {
                    specialBit: "IFSC_CODE",
                    specialBitValue: data?.ifscCode,
                    beneIfscCode: data?.ifscCode ?? "",
                };
            }
            if (code === "US") {
                return {
                    specialBit: "FED_WIRE_CODE",
                    specialBitValue: data?.wireCode,
                    beneFedWireCode: data?.wireCode ?? "",
                };
            }
        }
        return null;
    };

    _handleS2UTransfer = async (payload) => {
        try {
            // Save transfer api params into state in case needed in RSA flow later.
            this.setState({ transferApiParams: payload });

            // Make transfer api call
            const request = await this._transferFundToOversea(payload);
            const refID =
                request.data?.formattedTransactionRefNumber ??
                formateReferenceNumber(request.data?.transactionRefNumber) ??
                request.data?.refId ??
                "N/A";
            console.info("request?.data _transferFundToOversea => ", request?.data);
            if (request?.status === 200 && request?.data?.pollingToken) {
                const serverDate = request?.data?.serverDate ?? "N/A";
                const pollingToken = request?.data?.pollingToken;
                this._generateS2UTransactionDetails(
                    moment(serverDate).format(DD_MMM_YYYY),
                    serverDate
                );
                this.setState({
                    showRSALoader: false,
                    loader: false,
                    showS2UModal: pollingToken,
                    s2uToken: pollingToken,
                    s2uServerDate: serverDate,
                    s2uTransactionType: "Bakong Transfer",
                    s2uTransactionReferenceNumber:
                        request.data?.formattedTransactionRefNumber ??
                        formateReferenceNumber(request.data?.transactionRefNumber) ??
                        "N/A",
                    showRSAChallengeQuestion: false,
                    secure2uValidateData: payload.secure2uValidateData,
                    remittanceReferenceNo: request.data?.remittanceReferenceNo,
                    serverDate: request.data?.serverDate,
                    refID,
                });
                this.transactionDetails = payload;
            } else {
                // Go to Acknowledgement with failure message
                const { remittanceData } = this.state.transferParams;
                const isTransferSuccessful =
                    request?.message?.toLowerCase() === TRX_PROCESSIN_ERR_MSG;
                this.props.navigation.navigate("OverseasAcknowledgement", {
                    transferParams: {
                        ...this.state.transferParams,
                        // isProcessing:
                        //     isTransferSuccessful &&
                        //     remittanceData?.extendedHourFlag === "Y" &&
                        //     remittanceData?.hourIndicator,
                    },
                    errorMessage:
                        request.message === "ParserException"
                            ? "Your request couldn't be completed at this time. Please try again later."
                            : request.message ?? "N/A",
                    isTransferSuccessful,
                    refId: refID,
                    transferDetailsData: [
                        {
                            title: REFERENCE_ID,
                            value: refID,
                        },
                        {
                            title: DATE_AND_TIME,
                            value: request.data?.serverDate ?? "N/A",
                        },
                    ],
                    ...this.getCampaignInfo(),
                });
            }
        } catch (error) {
            const status = error?.status ?? 0;
            if (status === 428 || status === 423 || status === 422) {
                this._handleRSAFailure(error);
                return;
            }
            this._handleStateOnTransferApiCallException(error);
        } finally {
            this.setState({
                loader: false,
            });
        }
    };

    _getType = (name) => {
        const rtType = name === "RT" || name === "MOT" ? "MOT" : null;
        const bkType = this.state.isBakong ? "BK" : null;
        return rtType || bkType || name;
    };

    _handleTACTransfer = async (payload) => {
        const type = this._getType(this.state.transferParams?.name);
        const fundTransferType = `REMITTANCE_${this.state.isBakong ? "Bakong" : type}_OPEN_PAYMENT`;
        const mobileNo = payload?.senderMobileNo ?? payload?.mobileNo;
        const toAcctNo =
            type === "VD" || this.state.transferParams?.name === "WU"
                ? payload?.cardNumber ?? payload?.idNo ?? ""
                : "";
        this.setState({
            showTACModal: true,
            loader: true,

            transferApiParams: {
                ...payload,
            },
            tacParams: {
                trxId: payload?.trxId,
                accCode: payload.fromAccountCode,
                amount: payload.transferAmount,
                fromAcctNo: payload.fromAccountNo.substring(0, 12),
                payeeName: payload.recipientName,
                fundTransferType,
                mobileNo: mobileNo?.replace(/^01/, "601"),
                type: payload.type ?? "OPEN",
                bakongMobileNo: payload?.mobileNo?.replace(/^01/, "601"),
                toAcctNo,
            },
        });
        this.transactionDetails = payload;
    };

    _hideTACModal = () => {
        this.setState({
            showTACModal: false,
            loader: false,
            tacAttempts: 0,
        });
    };

    _onTACDone = async (tac) => {
        // Retrieve reload params and override TAC values
        const { transferApiParams, transferParams, favItem } = this.state;

        // Call Transfer API
        try {
            const request = await this._transferFundToOversea({
                ...transferApiParams,
                smsTac: tac,
                tacNo: tac,
                // twoFAType: tac === "" ? "FAVOURITE" : "TAC",
            });

            const refID =
                request?.data?.formattedTransactionRefNumber ??
                request?.data?.refId ??
                formateReferenceNumber(request?.data?.transactionRefNumber) ??
                "N/A";
            this._hideTACModal();
            this.setState(
                {
                    loader: false,
                    showRSALoader: false,
                    showRSAChallengeQuestion: false,
                    userKeyedInTacValue: tac,
                    serverDate: request.data?.serverDate,
                    transactionDetails: {
                        ...this.state.transactionDetails,
                        ...request?.data,
                        remittanceReferenceNo: request?.data?.remittanceReferenceNo,
                    },
                },
                () => {
                    // Success, go to acknowledgement screen with transfer data
                    const isTransferSuccessful =
                        request.status === 200 ||
                        request?.data?.statusCode === "0000" ||
                        (request?.message?.toLowerCase() === TRX_PROCESSIN_ERR_MSG &&
                            transferParams?.remittanceData?.productType === "FTT");
                    const wuSuccessMsg =
                        isTransferSuccessful && transferParams?.remittanceData?.productType === "WU"
                            ? "You may view the transfer status in ‘WU Transfer Status’."
                            : request.message ?? "N/A";
                    this.props.navigation.navigate("OverseasAcknowledgement", {
                        transferParams: {
                            ...transferParams,
                            // isProcessing:
                            //     isTransferSuccessful &&
                            //     transferParams?.remittanceData?.extendedHourFlag === "Y" &&
                            //     transferParams?.remittanceData?.hourIndicator,
                        },
                        transactionDetails: request?.data,
                        isTransferSuccessful,
                        errorMessage:
                            request.message === "ParserException"
                                ? "Your request couldn't be completed at this time. Please try again later."
                                : wuSuccessMsg,
                        receiptData:
                            request.status === 200 ||
                            request?.message?.toLowerCase() === TRX_PROCESSIN_ERR_MSG
                                ? this.getReceiptData(null, true, request?.data)
                                : null,
                        refId: refID,
                        favItem,
                        transferDetailsData: [
                            {
                                title: REFERENCE_ID,
                                value: refID,
                            },
                            { title: DATE_AND_TIME, value: request?.data?.serverDate ?? "N/A" },
                        ],
                        ...this.getCampaignInfo(),
                    });
                }
            );
        } catch (error) {
            this._hideTACModal();
            this.setState({ showRSAChallengeQuestion: false, userKeyedInTacValue: tac }, () => {
                const status = error?.status ?? 0;
                if (status === 428 || status === 423 || status === 422) {
                    // Failed because of RSA
                    this._handleRSAFailure(error);
                    return;
                }
                // Failed for other reasons
                this._handleStateOnTransferApiCallException(error);
            });
        }
    };

    _onS2UConfirmation = async (s2uResponse) => {
        const { s2uServerDate, s2uTransactionReferenceNumber, transferParams, favItem } =
            this.state;
        const serverDate = s2uServerDate;
        const transactionReferenceNumber = s2uTransactionReferenceNumber;

        const refID = transactionReferenceNumber ?? "N/A";

        const status = s2uResponse?.s2uSignRespone?.status?.toUpperCase?.();
        const statusDescription = s2uResponse?.s2uSignRespone?.statusDescription ?? "";

        let message = `${
            status === "M201" ? "Transaction" : "Payment"
        } ${statusDescription.toLowerCase()}`;

        if (status === "M408") message = "Transaction declined";

        // Success, go to acknowledgement screen with transfer data
        const isTransferSuccessful =
            (statusDescription.toLowerCase() === TRX_PROCESSIN_ERR_MSG &&
                transferParams?.remittanceData?.productType === "FTT") ||
            s2uResponse?.transactionStatus;
        const wuSuccessMsg =
            s2uResponse?.transactionStatus && transferParams?.remittanceData?.productType === "WU"
                ? "You may view the transfer status in ‘WU Transfer Status’."
                : s2uResponse?.s2uSignRespone?.text ?? "N/A";
        this.props.navigation.navigate("OverseasAcknowledgement", {
            transferParams: {
                ...transferParams,
                // isProcessing:
                //     isTransferSuccessful &&
                //     transferParams?.remittanceData?.extendedHourFlag === "Y" &&
                //     transferParams?.remittanceData?.hourIndicator,
            },
            transactionDetails: s2uResponse?.s2uSignRespone,
            isTransferSuccessful,
            refId: refID,
            message,
            favItem,
            errorMessage: wuSuccessMsg,
            receiptData: s2uResponse?.transactionStatus
                ? this.getReceiptData(s2uResponse?.s2uSignRespone)
                : null,
            transferDetailsData: [
                {
                    title: REFERENCE_ID,
                    value: refID,
                },
                { title: DATE_AND_TIME, value: serverDate ?? "N/A" },
            ],
            isS2uFlow: true,
            ...this.getCampaignInfo(),
        });

        this.setState({
            loader: false,
            showS2UModal: false,
            s2uToken: "",
            s2uServerDate: "",
            s2uTransactionType: "",
            s2uTransactionReferenceNumber: "",
        });
    };

    _transferFundToOversea = async (payload) => {
        try {
            const response = await performOverSeaTransfer(payload);
            this.setState({
                remittanceReferenceNo: response?.data?.remittanceReferenceNo,
                transactionRefNumber: response?.data?.transactionRefNumber,
                serverDate: response.data?.serverDate,
                formattedTransactionRefNumber: response.data?.formattedTransactionRefNumber,
            });
            return response;
        } catch (error) {
            this.setState({ disabled: false, counter: 0 });
            ErrorLogger(error);
            throw error;
        }
    };

    _handleStateOnTransferApiCallException = (error) => {
        this.setState({ showRSAChallengeQuestion: false }, () => {
            const trxRefNo = error?.error?.transactionRefNumber
                ? error?.error?.transactionRefNumber
                : null;
            const formattedTrxRefNo = error?.error?.formattedTransactionRefNumber
                ? error?.error?.formattedTransactionRefNumber
                : null;
            const dateOfTrx = error?.error?.serverDate ? error?.error?.serverDate : null;
            const showAckPage = trxRefNo || dateOfTrx || formattedTrxRefNo;
            if (showAckPage === null) {
                const errObj = errorCodeMap(
                    error?.error?.error ? error?.error?.error : error?.error
                );
                showErrorToast({
                    message: errObj?.code === 500 ? WE_FACING_SOME_ISSUE : errObj?.message,
                });
                return;
            }
            const refID =
                error?.error?.formattedTransactionRefNumber ??
                formateReferenceNumber(error?.error?.transactionRefNumber) ??
                error?.error?.refId ??
                "N/A";
            const errMsg = error?.error?.message ?? "N/A";
            this.props.navigation.navigate("OverseasAcknowledgement", {
                transferParams: this.state.transferParams,
                errorMessage: errMsg,
                refId: refID,
                isTransferSuccessful: errMsg?.toLowerCase() === TRX_PROCESSIN_ERR_MSG,
                transferDetailsData: [
                    {
                        title: REFERENCE_ID,
                        value: refID,
                    },
                    {
                        title: DATE_AND_TIME,
                        value: error?.error?.serverDate ?? "N/A",
                    },
                ],
                ...this.getCampaignInfo(),
            });
        });
    };

    _onTacModalCloseButtonPressed = () => this.setState({ showTACModal: false, loader: false });

    // RSA START
    _handleRSAFailure = (error) => {
        if (error.status === 428) {
            this.setState((prevState) => ({
                challengeRequest: {
                    ...prevState.challengeRequest,
                    challenge: error.error.challenge,
                },
                showRSAChallengeQuestion: true,
                showRSALoader: false,
                rsaChallengeQuestion: error.error.challenge.questionText,
                rsaCount: prevState.rsaCount + 1,
                showRSAError: prevState.rsaCount > 0,
            }));
        } else if (error.status === 423) {
            this.setState({
                showRSAChallengeQuestion: false,
            });
            const serverDate = error?.error?.serverDate ?? "N/A";
            this.props.navigation.navigate(ONE_TAP_AUTH_MODULE, {
                screen: "Locked",
                params: {
                    reason: error?.error?.statusDescription ?? "N/A",
                    loggedOutDateTime: serverDate,
                    lockedOutDateTime: serverDate,
                },
            });
        } else {
            this.setState({
                showRSAChallengeQuestion: false,
            });
            this.props.navigation.navigate(COMMON_MODULE, {
                screen: RSA_DENY_SCREEN,
                params: {
                    statusDescription: error?.error?.statusDescription ?? "N/A",
                    additionalStatusDescription: error?.error?.additionalStatusDescription ?? "",
                    serverDate: error?.error?.serverDate ?? "N/A",
                    nextParams: { screen: DASHBOARD, params: { refresh: false } },
                    nextModule: TAB_NAVIGATOR,
                    nextScreen: "Tab",
                },
            });
        }
    };

    _handleRSAChallengeQuestionAnswered = (answer) => {
        this.setState({ showRSAError: false, showRSALoader: true }, async () => {
            const { transferApiParams, transferParams, flow, secure2uValidateData } = this.state;

            const payload = {
                ...transferApiParams,
                challenge: { ...this.state.challengeRequest.challenge, answer },
            };

            const isFav = transferParams?.favourite ?? false;
            const favFlag = transferParams?.favTransferItem?.favFlag ?? "";

            if (isFav && favFlag === "0") {
                // FAV TRANSFER
                // subsequent fav transfer - SKIP TAC flow and call txn api
                this.setState({ transferApiParams: payload, loader: true }, () => {
                    this._onTACDone("");
                });
            } else if (flow === S2UFlowEnum.s2u) {
                // S2U OPEN/FAV TRANSFER
                const twoFAS2uType =
                    secure2uValidateData?.pull === "N" ? "SECURE2U_PUSH" : "SECURE2U_PULL"; //s2u interops changes
                this._handleS2UTransfer({
                    ...payload,
                    twoFAType: twoFAS2uType,
                    smsTac: "",
                    type: isFav ? "FAVORITE" : "OPEN",
                    secure2uValidateData,
                });
            } else {
                // TAC OPEN TRANSFER
                this._handleTACTransferToCreatorPostRSA({ ...payload }, true);
            }
        });
    };

    _handleRSAChallengeQuestionClosed = () => this.setState({ showRSAError: false });

    _handleTACTransferToCreatorPostRSA = async (payload, isTac) => {
        const { userKeyedInTacValue, transferParams, favItem } = this.state;
        try {
            const request = await this._transferFundToOversea({
                ...payload,
                tacNo: userKeyedInTacValue,
            });
            this._hideTACModal();
            this.setState({
                showRSAChallengeQuestion: false,
                showRSALoader: false,
            });

            const isTransferSuccessful =
                request.status === 200 ||
                (transferParams?.remittanceData?.productType === "FTT" &&
                    request?.message?.toLowerCase() === TRX_PROCESSIN_ERR_MSG);

            // Success, go to acknowledgement screen with transfer data
            const refID =
                request?.data?.formattedTransactionRefNumber ??
                formateReferenceNumber(request?.data?.transactionRefNumber) ??
                request?.data?.refId ??
                "N/A";

            const wuSuccessMsg =
                isTransferSuccessful && transferParams?.remittanceData?.productType === "WU"
                    ? "You may view the transfer status in ‘WU Transfer Status’."
                    : null;
            this.props.navigation.navigate("OverseasAcknowledgement", {
                transferParams: {
                    ...transferParams,
                    // isProcessing:
                    //     transferParams?.remittanceData?.extendedHourFlag === "Y" &&
                    //     transferParams?.remittanceData?.hourIndicator,
                },
                transactionDetails: request.data,
                isTransferSuccessful,
                errorMessage: wuSuccessMsg ?? request?.message ?? "N/A",
                receiptData:
                    request.status === 200 ? this.getReceiptData(null, isTac, request?.data) : null,
                refId: refID,
                favItem,
                transferDetailsData: [
                    {
                        title: REFERENCE_ID,
                        value: refID,
                    },
                    { title: DATE_AND_TIME, value: request?.data?.serverDate ?? "N/A" },
                ],
                ...this.getCampaignInfo(),
            });
        } catch (error) {
            const status = error?.status ?? 0;
            if (status === 428 || status === 423 || status === 422) {
                this._handleRSAFailure(error);
                return;
            }
            this._handleStateOnTransferApiCallException(error);
        }
    };
    // RSA END

    _onBackPress = () => {
        this.props.navigation.pop(1);
    };

    _onPressClose = () => {
        this.setState({ close: true }, () => {
            this._cancelTransfer();
        });
    };

    _cancelTransfer = () => {
        this.setState({ close: false });

        // Go back to transfer screen
        this.props.navigation.navigate(FUNDTRANSFER_MODULE, {
            screen: TRANSFER_TAB_SCREEN,
            params: {
                screenDate: { routeFrom: "Dashboard" },
                index: 3,
            },
        });
    };

    getCampaignInfo = () => {
        const {
            misc: { isTapTasticReady, tapTasticType },
            s2w: { txnTypeList },
        } = this.props.getModel(["misc", "s2w"]);
        return { isTapTasticReady, txnTypeList, tapTasticType };
    };

    renderDetailsSection = (name) => {
        if (name === "RT") {
            return this.renderRTDetails();
        }
        if (name === "FTT") {
            return this.renderFTTDetails();
        }
        if (name === "WU") {
            return this.renderWUDetails();
        }
        if (name === "VD") {
            return this.renderVDDetails();
        }

        return this.renderBKDetails();
    };

    renderRTDetails = () => {
        const transferParams = this.props.route.params.transferParams;
        const OT_DATA = this.props.getModel("overseasTransfers");
        const { MOTRecipientBankDetails } = OT_DATA;
        const trxAmt = `${
            transferParams?.remittanceData?.fromCurrency !== "MYR"
                ? transferParams?.remittanceData?.fromCurrency
                : "RM"
        } ${this.parseAmount(transferParams?.remittanceData?.amountInRM)}\n= ${
            transferParams?.remittanceData?.fromCurrency !== "MYR"
                ? "RM"
                : transferParams?.remittanceData?.toCurrency
        } ${this.parseAmount(this.getForeignAmount(transferParams))}`;
        const displayDataMapper = [
            {
                displayKey: "Service fee",
                displayValue: `RM ${numeral(
                    this.state.screenData?.remittanceData?.serviceFee === "-"
                        ? "0.00"
                        : this.state.screenData?.remittanceData?.serviceFee
                ).format("0,0.00")}`,
            },
            {
                displayKey: "Total amount",
                displayValue: this.state.screenData.description2,
            },
            { displayKey: "line" },
            {
                displayKey: "Date",
                displayValue: moment().format(DD_MMM_YYYY),
            },
            {
                displayKey: "Transfer type",
                displayValue: getName(transferParams?.name),
            },
            {
                displayKey: "Bank name",
                displayValue:
                    MOTRecipientBankDetails?.swiftCode === "MBBESGSG"
                        ? "Maybank Banking Berhad (MBBESGSG)"
                        : "Maybank Singapore Limited (MBBESGS2)",
            },
            {
                displayKey: "Transfer duration",
                displayValue: transferParams?.remittanceData?.processingPeriod,
            },
            {
                displayKey: "Transfer amount",
                displayValue: trxAmt,
            },
            {
                displayKey: EXCHANGE_RATE,
                displayValue: `RM ${transferParams?.rfqData?.allinRate} = ${transferParams?.remittanceData?.toCurrency} 1`,
            },
        ];
        const amount = this._getAmount(transferParams);
        return (
            <View style={Styles.container}>
                <View style={Styles.headerContainer}>
                    <View style={Styles.headerImageContainer}>
                        <CircularLogoImage source={getImage(transferParams?.name)} isLocal />
                    </View>
                    <Typography
                        fontSize={14}
                        fontWeight="600"
                        fontStyle="normal"
                        letterSpacing={0}
                        lineHeight={18}
                        color={BLACK}
                        style={Styles.typoPadding}
                        text={this.state.screenData.description1}
                    />

                    <Typography
                        fontSize={14}
                        fontWeight="400"
                        fontStyle="normal"
                        letterSpacing={0}
                        lineHeight={18}
                        style={Styles.typoPadding}
                        color={BLACK}
                        text={this.state.screenData.name}
                    />
                    {this.state.screenData.amtToTransfer && (
                        <Typography
                            fontSize={24}
                            fontWeight="700"
                            fontStyle="bold"
                            letterSpacing={0}
                            lineHeight={31}
                            color={BLACK}
                            style={Styles.typoPaddingTop}
                            text={`RM ${this.parseAmount(this.state.screenData.amtToTransfer)}`}
                        />
                    )}

                    <Typography
                        fontSize={14}
                        fontWeight="normal"
                        fontStyle="normal"
                        letterSpacing={0}
                        lineHeight={20}
                        color={BLACK}
                        text={amount}
                    />
                </View>

                <View style={Styles.formBodyContainer}>
                    {this.renderDataRow(displayDataMapper)}
                    <View style={Styles.line} />
                </View>
            </View>
        );
    };

    _getAmount = (transferParams) => {
        // const rmAmount =
        //     transferParams?.remittanceData?.fromCurrency !== "MYR"
        //         ? transferParams?.rfqData?.contraAmount ??
        //           transferParams?.remittanceData?.toCurrencyAmount
        //         : transferParams?.remittanceData?.amountInRM;
        if (
            transferParams?.name === "FTT" ||
            transferParams?.name === "RT" ||
            transferParams?.name === "MOT"
        ) {
            return `${
                transferParams?.remittanceData?.fromCurrency === "MYR"
                    ? transferParams?.remittanceData?.toCurrency +
                      " " +
                      this.parseAmount(
                          transferParams?.rfqData?.contraAmount ??
                              transferParams?.remittanceData?.toCurrencyAmount
                      )
                    : transferParams?.remittanceData?.fromCurrency +
                      " " +
                      this.parseAmount(transferParams?.remittanceData?.amountInRM)
            }`;
        }

        if (transferParams?.name === "WU") {
            return `${
                transferParams?.remittanceData?.fromCurrency === "MYR"
                    ? transferParams?.remittanceData?.toCurrency
                    : transferParams?.remittanceData?.fromCurrency
            } ${this.parseAmount(
                transferParams?.remittanceData?.fromCurrency === "MYR"
                    ? transferParams?.remittanceData?.toCurrencyAmount
                    : transferParams?.remittanceData?.amountInRM
            )}`;
        }

        if (transferParams?.name === "VD") {
            return `${
                transferParams?.remittanceData?.fromCurrency === "MYR"
                    ? transferParams?.remittanceData?.toCurrency +
                      " " +
                      this.parseAmount(transferParams?.remittanceData?.toCurrencyAmount)
                    : transferParams?.remittanceData?.fromCurrency +
                      " " +
                      this.parseAmount(transferParams?.remittanceData?.amountInRM)
            }`;
        }

        return `${
            transferParams?.remittanceData?.fromCurrency === "MYR"
                ? transferParams?.remittanceData?.toCurrency +
                  " " +
                  this.parseAmount(transferParams?.remittanceData?.toCurrencyAmount)
                : transferParams?.remittanceData?.fromCurrency +
                  " " +
                  this.parseAmount(transferParams?.remittanceData?.amountInRM)
        }`;
    };

    getFttReceiptBody = (
        isTac,
        transactionDetails,
        serverDateFromPayload,
        payload,
        custName,
        formData
    ) => {
        const { selectedBank, bankName, accountNumber, ibanCode } =
            formData?.FTTRecipientBankDetails;
        const beneAcc = isTac
            ? accountNumber || ibanCode
            : payload?.payload?.BillingAcct || accountNumber || ibanCode;
        return [
            {
                label: "Reference ID",
                value: this.state.transactionRefNumber
                    ? formateReferenceNumber(this.state.transactionRefNumber)
                    : transactionDetails?.formattedTransactionRefNumber ||
                      this.state.s2uTransactionReferenceNumber,
                showRightText: true,
                rightTextType: "text",
                rightStatusType: "",
                rightText:
                    this.state.serverDate ||
                    serverDateFromPayload ||
                    transactionDetails?.serverDate,
            },
            {
                label: "Beneficiary name",
                value: isTac ? custName : payload?.payload?.PayeeName || custName,
                showRightText: false,
            },
            {
                label: "Receiving bank",
                value: bankName || selectedBank?.name,
                showRightText: false,
            },
            {
                label: ibanCode ? "IBAN Code" : "Beneficiary account number",
                value: formateAccountNumber(beneAcc, beneAcc?.length),
                showRightText: false,
            },
            {
                label: "FTT reference number",
                value:
                    this.state.remittanceReferenceNo ||
                    transactionDetails?.remittanceReferenceNo ||
                    payload?.payload?.BillReferenceNo,
                showRightText: false,
            },
        ];
    };

    getVisaDirectReceiptBody = (
        isTac,
        transactionDetails,
        serverDateFromPayload,
        formData,
        transferParams
    ) => {
        const { fromAccountName, fromAccountNo } = transferParams?.fromAccountData
            ? transferParams?.fromAccountData
            : transferParams?.selectedAccount;
        const formattedSelectedAccountName = `${
            transferParams?.selectedAccount?.account?.name ||
            transferParams?.selectedAccount?.name ||
            fromAccountName
        }\n${formateAccountNumber(fromAccountNo.replace(/\s/g, ""), 12)}`;
        return [
            {
                label: "Reference ID",
                value: isTac
                    ? transactionDetails?.formattedTransactionRefNumber
                    : this.state.s2uTransactionReferenceNumber,
                showRightText: true,
                rightTextType: "text",
                rightStatusType: "",
                rightText:
                    this.state.serverDate ||
                    serverDateFromPayload ||
                    transactionDetails?.serverDate,
            },
            {
                label: "Transfer from",
                value: formattedSelectedAccountName,
                showRightText: false,
            },
            {
                label: "Transfer to",
                value: formData?.cardHolderFirstName
                    ? `${formData?.cardHolderFirstName} ${formData?.cardHolderLastName}`
                    : formData?.cardHolderFullName,
                showRightText: false,
            },
            {
                label: "Visa card number",
                value: formateAccountNumber(formData?.cardNumber, formData?.cardNumber?.length),
                showRightText: false,
            },
        ];
    };

    getRegionalTransferReceiptBody = (
        isTac,
        transactionDetails,
        serverDateFromPayload,
        payload,
        formData,
        remittanceReferenceNo
    ) => {
        const { selectedBank, bankName, accountNumber } = formData.MOTRecipientBankDetails;
        const { name, firstName, lastName } = formData.MOTRecipientDetails;
        return [
            {
                label: "Reference ID",
                value: this.state.transactionRefNumber
                    ? formateReferenceNumber(this.state.transactionRefNumber)
                    : transactionDetails?.formattedTransactionRefNumber ||
                      this.state.s2uTransactionReferenceNumber,
                showRightText: true,
                rightTextType: "text",
                rightStatusType: "",
                rightText:
                    this.state.serverDate ||
                    serverDateFromPayload ||
                    transactionDetails?.serverDate,
            },
            {
                label: "Maybank Overseas Transfer reference ID",
                value:
                    this.state.remittanceReferenceNo ||
                    remittanceReferenceNo ||
                    transactionDetails?.remittanceReferenceNo ||
                    payload?.payload?.BillReferenceNo ||
                    "N/A",
                showRightText: false,
            },
            {
                label: "Recipient name",
                value: isTac
                    ? firstName
                        ? firstName + " " + lastName
                        : name
                    : payload?.payload?.PayeeName,
                showRightText: false,
            },
            {
                label: "Bank name",
                value: bankName || selectedBank?.name || "N/A",
                showRightText: false,
            },
            {
                label: "Account number",
                value:
                    formateAccountNumber(accountNumber, accountNumber?.length) ||
                    payload?.payload?.BillingAcct ||
                    "N/A",
                showRightText: false,
            },
        ];
    };

    getWesternUnionReceiptBody = (isTac, transactionDetails, serverDateFromPayload, custName) => {
        return [
            {
                label: "Reference ID",
                value: this.state.transactionRefNumber
                    ? formateReferenceNumber(this.state.transactionRefNumber)
                    : transactionDetails?.formattedTransactionRefNumber ||
                      this.state.s2uTransactionReferenceNumber,
                showRightText: true,
                rightTextType: "text",
                rightStatusType: "",
                rightText:
                    this.state.serverDate ||
                    serverDateFromPayload ||
                    transactionDetails?.serverDate,
            },
            {
                label: "Beneficiary name",
                value: custName,
                showRightText: false,
            },
            {
                label: "MTCN number",
                value:
                    this.state.remittanceReferenceNo || transactionDetails?.remittanceReferenceNo,
                showRightText: false,
            },
        ];
    };

    getBakongReceiptBody = (
        isTac,
        transactionDetails,
        serverDateFromPayload,
        payload,
        transferParams,
        remittanceReferenceNo
    ) => {
        const bkMobileNo =
            transferParams?.favTransferItem?.description1 ||
            transferParams?.transferParams?.mobileNo ||
            transferParams?.mobileNo;

        return [
            {
                label: "Reference ID",
                value: this.state.transactionRefNumber
                    ? formateReferenceNumber(this.state.transactionRefNumber)
                    : transactionDetails?.formattedTransactionRefNumber ||
                      this.state.s2uTransactionReferenceNumber,
                showRightText: true,
                rightTextType: "text",
                rightStatusType: "",
                rightText:
                    this.state.serverDate ||
                    serverDateFromPayload ||
                    transactionDetails?.serverDate,
            },
            {
                label: "Bakong reference ID",
                value:
                    remittanceReferenceNo ||
                    transactionDetails?.remittanceReferenceNo ||
                    this.state.remittanceReferenceNo ||
                    "N/A",
                showRightText: false,
            },
            {
                label: "Beneficiary name",
                value: transferParams?.transferParams?.name ?? null,
                showRightText: false,
            },
            {
                label: "Mobile number",
                value: "+855 " + formatBakongMobileNumbers(bkMobileNo) || "N/A",
                showRightText: false,
            },
        ];
    };

    getReceiptData = (payload, isTac, trxData) => {
        const { transferParams } = this.props.route.params;
        const transactionDetails = { ...this.state.transactionDetails, ...trxData };
        const remittanceData = transferParams?.remittanceData
            ? transferParams?.remittanceData
            : this.props.route.params?.remittanceData;
        const formData = this.props.getModel("overseasTransfers");
        const nonMyrTrx = remittanceData?.fromCurrency !== "MYR";
        const serverDateFromPayload = moment(
            payload?.payload?.RequestDt + payload?.payload?.RequestTime,
            ["YYYYMMDDhhmmss"]
        ).format("DD MMM YYYY, hh:mm A");
        const type = this._getType(transferParams?.name);
        const purposeInfo = formData[type + "TransferPurpose"];
        const amountRmString = nonMyrTrx
            ? transferParams?.rfqData?.contraAmount ??
              transferParams?.remittanceData?.toCurrencyAmount
            : remittanceData?.amountInRM;
        const fttBankFee = transferParams?.remittanceData?.gour
            ? String(parseFloat(purposeInfo?.chargeInquiryInfo?.totNostroAmtMyr))
            : null;
        const fttTotalAmt =
            type === "FTT" && transferParams?.remittanceData?.gour
                ? parseFloat(purposeInfo?.chargeInquiryInfo?.totNostroAmtMyr) +
                  parseFloat(purposeInfo?.chargeInquiryInfo?.totSvcChrgsMyr) +
                  parseFloat(amountRmString?.replace(",", ""))
                : null;
        // const rtTotalAmt =
        //     type === "MOT" || type === "RT"
        //         ? parseFloat(transferParams?.remittanceData?.bankFee) +
        //           parseFloat(amountRmString?.replace(",", ""))
        //         : null;
        const fttServiceFee = purposeInfo?.chargeInquiryInfo?.totSvcChrgsMyr
            ? String(purposeInfo?.chargeInquiryInfo?.totSvcChrgsMyr)
            : null;
        const svcFee =
            remittanceData?.serviceFee !== "-" ? parseFloat(remittanceData?.serviceFee) : 0.0;
        const serviceFee = `RM ${numeral(fttServiceFee ?? svcFee).format("0,0.00")}`;
        const amountRm = `RM ${numeral(amountRmString).format("0,0.00")}`;
        const amtForeign = `${
            nonMyrTrx ? remittanceData?.fromCurrency : remittanceData?.toCurrency
        } ${numeral(
            nonMyrTrx
                ? remittanceData?.amountInRM
                : transferParams?.rfqData?.contraAmount ?? remittanceData?.toCurrencyAmount === "∞"
                ? transferParams?.rfqData?.contraAmount
                : remittanceData?.toCurrencyAmount
        ).format("0,0.00")}`;
        const amount = `RM ${numeral(
            fttTotalAmt || parseFloat(amountRmString?.replace(",", "")) + parseFloat(svcFee)
        ).format("0,0.00")}`;
        const { name, firstName, lastName } = formData[type + "RecipientDetails"];
        const custName = firstName ? firstName + " " + lastName : name;
        const bankFee =
            type === "FTT" && formData?.FTTTransferPurpose?.selectedBankFeeType === "OUR"
                ? `RM ${numeral(fttBankFee ?? remittanceData?.bankFee).format("0,0.00")}`
                : "";
        const trxDetails = [
            {
                label: "Transfer amount",
                value: amountRm,
                showRightText: false,
            },
            {
                label: "Foreign currency amount",
                value: amtForeign,
                showRightText: false,
            },
            {
                label: "Service fee",
                value: serviceFee,
                showRightText: false,
            },
            {
                label:
                    type === "MOT" ||
                    type === "RT" ||
                    (type === "FTT" && formData?.FTTTransferPurpose?.selectedBankFeeType === "OUR")
                        ? "Agent/Beneficiary bank fee"
                        : null,
                value:
                    type === "MOT" ||
                    type === "RT" ||
                    (type === "FTT" && formData?.FTTTransferPurpose?.selectedBankFeeType === "OUR")
                        ? bankFee
                        : null,
                showRightText: false,
            },
            {
                label: transferParams?.name === "WU" ? "Total (Incl. fees)" : "Total amount",
                value: amount,
                showRightText: false,
                isAmount: true,
            },
        ];

        let receiptBody = [];

        /* Bakong */
        if (this.state.isBakong) {
            receiptBody = this.getBakongReceiptBody(
                isTac,
                transactionDetails,
                serverDateFromPayload,
                payload,
                transferParams,
                trxData?.remittanceReferenceNo
            );
        }

        /* WU */
        if (type === "WU") {
            receiptBody = this.getWesternUnionReceiptBody(
                isTac,
                transactionDetails,
                serverDateFromPayload,
                custName
            );
        }

        /* RT */
        if (type === "MOT") {
            receiptBody = this.getRegionalTransferReceiptBody(
                isTac,
                transactionDetails,
                serverDateFromPayload,
                payload,
                formData,
                trxData?.remittanceReferenceNo
            );
        }

        /* VD */
        if (type === "VD") {
            receiptBody = this.getVisaDirectReceiptBody(
                isTac,
                transactionDetails,
                serverDateFromPayload,
                formData[type + "RecipientDetails"],
                transferParams
            );
        }

        /* FTT */
        if (type === "FTT") {
            receiptBody = this.getFttReceiptBody(
                isTac,
                transactionDetails,
                serverDateFromPayload,
                payload,
                custName,
                formData
            );
        }

        return [...receiptBody, ...trxDetails];
    };

    parseAmount = (amt) => {
        return numeral(amt).format("0,0.00");
    };

    renderFTTDetails = () => {
        const transferParams = this.props.route.params.transferParams;
        const OT_DATA = this.props.getModel("overseasTransfers");
        const { FTTRecipientBankDetails, FTTTransferPurpose } = OT_DATA;
        const trxAmt = `${
            transferParams?.remittanceData?.fromCurrency !== "MYR"
                ? transferParams?.remittanceData?.fromCurrency
                : "RM"
        } ${this.parseAmount(transferParams?.remittanceData?.amountInRM)}\n= ${
            transferParams?.remittanceData?.fromCurrency !== "MYR"
                ? "RM"
                : transferParams?.remittanceData?.toCurrency
        } ${this.parseAmount(this.getForeignAmount(transferParams))}`;
        const displayDataMapper = [
            {
                displayKey: "Service fee",
                displayValue: transferParams?.remittanceData?.gour
                    ? FTTTransferPurpose?.chargeInquiryInfo?.totSvcChrgsMyr !== "0.00"
                        ? `RM ${numeral(
                              FTTTransferPurpose?.chargeInquiryInfo?.totSvcChrgsMyr
                          ).format("0,0.00")}`
                        : null
                    : this.parseAmount(String(transferParams?.remittanceData?.serviceFee)),
            },
            {
                displayKey: "Agent/Beneficiary bank fee",
                displayValue: transferParams?.remittanceData?.gour
                    ? FTTTransferPurpose?.selectedBankFeeType === "OUR"
                        ? `RM ${numeral(
                              FTTTransferPurpose?.chargeInquiryInfo?.totNostroAmtMyr
                          ).format("0,0.00")}`
                        : "RM 0.00"
                    : null,
            },
            {
                displayKey: "Total amount",
                displayValue: this.state.screenData.description2,
            },

            {
                displayKey: "line",
            },
            {
                displayKey: "Date",
                displayValue: moment().format(DD_MMM_YYYY),
            },
            {
                displayKey: "Transfer type",
                displayValue: getName(transferParams?.name),
            },
            {
                displayKey: "Bank name",
                displayValue: FTTRecipientBankDetails?.bankName,
            },
            {
                displayKey: "Transfer duration",
                displayValue: transferParams?.remittanceData?.processingPeriod,
            },
            {
                displayKey: "Transfer amount",
                displayValue: trxAmt,
            },
            {
                displayKey: EXCHANGE_RATE,
                displayValue: `RM ${transferParams?.rfqData?.allinRate} = ${transferParams?.remittanceData?.toCurrency} 1`,
            },
        ];

        const amount = this._getAmount(transferParams, true);
        return (
            <View style={Styles.container}>
                <View style={Styles.headerContainer}>
                    <View style={Styles.headerImageContainer}>
                        <CircularLogoImage source={getImage(transferParams?.name)} isLocal />
                    </View>
                    <Typography
                        fontSize={14}
                        fontWeight="600"
                        fontStyle="normal"
                        letterSpacing={0}
                        lineHeight={18}
                        color={BLACK}
                        style={Styles.typoPadding}
                        text={this.state.screenData.description1}
                    />

                    <Typography
                        fontSize={14}
                        fontWeight="400"
                        fontStyle="normal"
                        letterSpacing={0}
                        lineHeight={18}
                        style={Styles.typoPadding}
                        color={BLACK}
                        text={this.state.screenData.name}
                    />
                    {this.state.screenData.amtToTransfer && (
                        <Typography
                            fontSize={24}
                            fontWeight="700"
                            fontStyle="bold"
                            letterSpacing={0}
                            lineHeight={31}
                            color={BLACK}
                            style={Styles.typoPaddingTop}
                            text={`RM ${this.parseAmount(this.state.screenData.amtToTransfer)}`}
                        />
                    )}
                    <Typography
                        fontSize={14}
                        fontWeight="normal"
                        fontStyle="normal"
                        letterSpacing={0}
                        lineHeight={20}
                        color={BLACK}
                        text={amount}
                    />
                </View>

                <View style={Styles.formBodyContainer}>
                    {this.renderDataRow(displayDataMapper)}
                    <View style={Styles.line} />
                </View>
            </View>
        );
    };

    renderWUDetails = () => {
        const { WUSenderDetailsStepOne } = this.props.getModel("overseasTransfers");
        const transferParams = this.props.route.params.transferParams;
        const svcFee =
            transferParams?.remittanceData?.serviceFee !== "-"
                ? parseFloat(transferParams?.remittanceData?.serviceFee)
                : 0.0;
        const exRate = this.getExchangeRate(this.props.route.params.transferParams);
        const displayDataMapper = [
            {
                displayKey: "Service fee",
                displayValue: `RM ${numeral(svcFee).format("0,0.00")}`,
            },
            {
                displayKey: "Total amount",
                displayValue: this.state.screenData.description2,
            },
            {
                displayKey: "line",
            },
            {
                displayKey: "Date",
                displayValue: moment().format(DD_MMM_YYYY),
            },
            {
                displayKey: "Transfer type",
                displayValue: getName(transferParams?.name),
            },
            {
                displayKey: "Transfer duration",
                displayValue: transferParams?.remittanceData?.processingPeriod,
            },
            {
                displayKey: "Receive method",
                displayValue: transferParams?.remittanceData?.receiveMethod,
            },
            {
                displayKey: EXCHANGE_RATE,
                displayValue: exRate,
            },
            {
                displayKey: "Promo code",
                displayValue: WUSenderDetailsStepOne?.WUNumber,
            },
        ];

        const amount = this._getAmount(transferParams);
        return (
            <View style={Styles.container}>
                <View style={Styles.headerContainer}>
                    <View style={Styles.headerImageContainer}>
                        <CircularLogoImage source={getImage(transferParams?.name)} isLocal />
                    </View>
                    <Typography
                        fontSize={14}
                        fontWeight="600"
                        fontStyle="normal"
                        letterSpacing={0}
                        lineHeight={18}
                        color={BLACK}
                        style={Styles.typoPadding}
                        text={this.state.screenData.description1}
                    />

                    <Typography
                        fontSize={24}
                        fontWeight="700"
                        fontStyle="bold"
                        letterSpacing={0}
                        lineHeight={31}
                        color={BLACK}
                        style={Styles.typoPadding}
                        text={`RM ${this.parseAmount(this.state.screenData.amtToTransfer)}`}
                    />
                    <Typography
                        fontSize={14}
                        fontWeight="400"
                        fontStyle="normal"
                        letterSpacing={0}
                        lineHeight={18}
                        color={BLACK}
                        text={amount}
                    />
                </View>

                <View style={Styles.formBodyContainer}>
                    {this.renderDataRow(displayDataMapper)}
                    <View style={Styles.line} />
                </View>
            </View>
        );
    };

    renderBKDetails = () => {
        const transferParams = this.props.route.params.transferParams;
        const svcFee =
            transferParams?.remittanceData?.serviceFee !== "-"
                ? parseFloat(transferParams?.remittanceData?.serviceFee)
                : 0.0;
        const trxAmt = `${
            transferParams?.remittanceData?.fromCurrency !== "MYR"
                ? transferParams?.remittanceData?.fromCurrency
                : "RM"
        } ${this.parseAmount(transferParams?.remittanceData?.amountInRM)}\n= ${
            transferParams?.remittanceData?.fromCurrency !== "MYR"
                ? "RM"
                : transferParams?.remittanceData?.toCurrency
        } ${this.parseAmount(
            transferParams?.remittanceData?.toCurrencyAmount === "∞"
                ? transferParams?.rfqData?.contraAmount
                : transferParams?.remittanceData?.toCurrencyAmount
        )}`;
        const displayDataMapper = [
            {
                displayKey: "Service fee",
                displayValue: `RM ${numeral(svcFee).format("0,0.00")}`,
            },
            {
                displayKey: "Total amount",
                displayValue: this.state.screenData.description2,
            },
            { displayKey: "line" },
            {
                displayKey: "Date",
                displayValue: moment().format(DD_MMM_YYYY),
            },
            {
                displayKey: "Transfer type",
                displayValue: getName("BK"),
            },
            {
                displayKey: "Transfer duration",
                displayValue: "Instant",
            },
            {
                displayKey: "Transfer amount",
                displayValue: trxAmt,
            },
            {
                displayKey: `Exchange rate`,
                displayValue: `RM ${transferParams?.rfqData?.allinRate} = ${transferParams?.remittanceData?.toCurrency} 1`,
            },
        ];

        const bkMobileNo = transferParams?.favTransferItem?.description1
            ? transferParams?.favTransferItem?.description1
            : transferParams?.mobileNo;

        const amount = this._getAmount(transferParams);
        return (
            <View style={Styles.container}>
                <View style={Styles.headerContainer}>
                    <View style={Styles.headerImageContainer}>
                        <CircularLogoImage source={getImage("BK")} isLocal />
                    </View>
                    <Typography
                        fontSize={14}
                        fontWeight="600"
                        fontStyle="normal"
                        letterSpacing={0}
                        lineHeight={18}
                        color={BLACK}
                        style={Styles.typoPadding}
                        text={
                            transferParams?.favTransferItem?.name
                                ? transferParams?.favTransferItem?.name
                                : transferParams?.name
                        }
                    />

                    <Typography
                        fontSize={14}
                        fontWeight="400"
                        fontStyle="normal"
                        letterSpacing={0}
                        lineHeight={18}
                        style={Styles.typoPadding}
                        color={BLACK}
                        text={`+855 ${formatBakongMobileNumbers(bkMobileNo)}`}
                    />

                    {this.state.screenData.amtToTransfer && (
                        <Typography
                            fontSize={24}
                            fontWeight="700"
                            fontStyle="bold"
                            letterSpacing={0}
                            lineHeight={31}
                            color={BLACK}
                            style={Styles.typoPaddingTop}
                            text={`RM ${this.parseAmount(this.state.screenData.amtToTransfer)}`}
                        />
                    )}

                    <Typography
                        fontSize={14}
                        fontWeight="normal"
                        fontStyle="normal"
                        letterSpacing={0}
                        lineHeight={20}
                        color={BLACK}
                        text={amount}
                    />
                </View>

                <View style={Styles.formBodyContainer}>
                    {this.renderDataRow(displayDataMapper)}
                    <View style={Styles.line} />
                </View>
            </View>
        );
    };

    renderVDDetails = () => {
        const transferParams = this.props.route.params.transferParams;
        const svcFee =
            transferParams?.remittanceData?.serviceFee !== "-"
                ? parseFloat(transferParams?.remittanceData?.serviceFee)
                : 0.0;
        const OT_DATA = this.props.getModel("overseasTransfers");
        const { VDRecipientDetails } = OT_DATA;
        const exRate = this.getExchangeRate(this.props.route.params.transferParams);
        const {
            cardNumber,
            cardHolderFullName,
            cardHolderFirstName,
            cardHolderLastName,
            // bankName,
        } = VDRecipientDetails;
        const displayDataMapper = [
            {
                displayKey: "Service fee",
                displayValue: `RM ${numeral(svcFee).format("0,0.00")}`,
            },
            {
                displayKey: "Total amount",
                displayValue: this.state.screenData.description2,
            },

            {
                displayKey: "line",
            },
            {
                displayKey: "Date",
                displayValue: moment().format(DD_MMM_YYYY),
            },
            {
                displayKey: "Transfer type",
                displayValue: getName(transferParams?.name),
            },
            {
                displayKey: "Transfer duration",
                displayValue: "Fast Fund",
            },
            {
                displayKey: EXCHANGE_RATE,
                displayValue: exRate,
            },
        ];

        const amount = this._getAmount(transferParams);
        return (
            <View style={Styles.container}>
                <View style={Styles.headerContainer}>
                    <View style={Styles.headerImageContainer}>
                        <CircularLogoImage source={getImage(transferParams?.name)} isLocal />
                    </View>
                    <Typography
                        fontSize={14}
                        fontWeight="600"
                        fontStyle="normal"
                        letterSpacing={0}
                        lineHeight={18}
                        color={BLACK}
                        text={cardHolderFullName || `${cardHolderFirstName} ${cardHolderLastName}`}
                    />

                    <Typography
                        fontSize={14}
                        fontWeight="normal"
                        fontStyle="normal"
                        letterSpacing={0}
                        lineHeight={20}
                        color={BLACK}
                        text={formateAccountNumber(cardNumber, cardNumber.length)}
                        style={Styles.lblSubTitle}
                    />

                    {this.state.screenData.amtToTransfer && (
                        <Typography
                            fontSize={24}
                            fontWeight="700"
                            fontStyle="bold"
                            letterSpacing={0}
                            lineHeight={31}
                            color={BLACK}
                            style={Styles.typoPaddingTop}
                            text={`RM ${this.parseAmount(this.state.screenData.amtToTransfer)}`}
                        />
                    )}

                    <Typography
                        fontSize={14}
                        fontWeight="normal"
                        fontStyle="normal"
                        letterSpacing={0}
                        lineHeight={20}
                        color={BLACK}
                        text={amount}
                        style={Styles.lblSubTitle}
                    />
                </View>

                <View style={Styles.formBodyContainer}>
                    {this.renderDataRow(displayDataMapper)}
                    <View style={Styles.line} />
                </View>
            </View>
        );
    };

    renderDataRow = (displayDataMapper) => {
        return displayDataMapper.map((infoDetail, i) => {
            if (infoDetail?.displayKey === "line") {
                return (
                    <View key={i} style={Styles.rowListContainer}>
                        <View style={Styles.lineSingle} />
                    </View>
                );
            }
            if (infoDetail?.displayKey && infoDetail?.displayValue) {
                return (
                    <View key={i} style={Styles.rowListContainer}>
                        <View style={Styles.rowListItemLeftContainer}>
                            <Typography
                                fontSize={14}
                                lineHeight={19}
                                textAlign="left"
                                text={infoDetail?.displayKey}
                            />
                        </View>
                        <View style={Styles.rowListItemRightContainer}>
                            <Typography
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={18}
                                textAlign="right"
                                text={infoDetail?.displayValue}
                            />
                        </View>
                    </View>
                );
            }
        });
    };

    performValidationForWu = async (payload) => {
        try {
            const response = await wuValidatePayment(payload);
            return {
                tempTransactionId: response?.data?.tempTransactionId,
                transactionDigest: response?.data?.transactionDigest,
            };
        } catch (ex) {
            if (ex?.message === "ERROR") {
                showErrorToast({
                    message: ex?.message !== "ERROR" ? ex?.message : WE_FACING_SOME_ISSUE,
                });
                return;
            }
            showErrorToast({ message: ex?.message ?? WE_FACING_SOME_ISSUE });
        }
    };

    render() {
        const {
            showErrorModal,
            errorMessage,
            loader,
            transferParams,
            // S2U / TAC
            s2uToken,
            s2uTransactionDetails,
            showS2UModal,
            showTACModal,
            tacParams,
            secure2uValidateData,
            // RSA
            showRSAChallengeQuestion,
            showRSAError,
            showRSALoader,
            rsaChallengeQuestion,
        } = this.state;
        const amountToPay = this.state.screenData?.amount;
        const s2uMetadata = {
            metadata: {
                txnType: "REMITTANCE_TRANSFER",
            },
            txnType:
                this.getCampaignInfo()?.isTapTasticReady && this.state.isBakong ? "MAEBAKONG" : "",
        };
        return (
            <React.Fragment>
                <ScreenContainer
                    backgroundType="color"
                    showErrorModal={showErrorModal}
                    errorMessage={errorMessage}
                    showLoaderModal={loader}
                    backgroundColor={MEDIUM_GREY}
                >
                    <ScreenLayout
                        header={
                            <HeaderLayout
                                headerCenterElement={
                                    <Typography
                                        fontSize={16}
                                        fontWeight="600"
                                        lineHeight={19}
                                        text="Confirmation"
                                    />
                                }
                                headerLeftElement={<HeaderBackButton onPress={this._onBackPress} />}
                                headerRightElement={
                                    <HeaderCloseButton onPress={this._onPressClose} />
                                }
                            />
                        }
                        useSafeArea
                        paddingHorizontal={0}
                        paddingBottom={0}
                    >
                        <React.Fragment>
                            <KeyboardAvoidingView
                                style={Styles.displayFlex}
                                behavior={Platform.OS === "ios" ? "position" : "padding"}
                            >
                                <ScrollView showsHorizontalScrollIndicator={false}>
                                    {this.renderDetailsSection(
                                        this.state.isBakong
                                            ? "BK"
                                            : this.state.productType ??
                                                  this.props.route?.params?.transferParams?.name
                                    )}
                                    <View style={Styles.displayFlex} />
                                    <View style={Styles.transferFromContainer2}>
                                        <Typography
                                            fontSize={14}
                                            lineHeight={18}
                                            textAlign="left"
                                            fontWeight="600"
                                            style={Styles.transferFromText}
                                            text={TRANSFER_FROM}
                                        />
                                        <AccountDetailList
                                            isSingle
                                            item={
                                                transferParams?.fromAccountData?.account
                                                    ? {
                                                          ...transferParams?.fromAccountData
                                                              ?.account,
                                                          selected: true,
                                                      }
                                                    : {
                                                          ...transferParams?.selectedAccount
                                                              ?.account,
                                                          selected: true,
                                                      }
                                            }
                                            fullWidth
                                        />
                                    </View>
                                </ScrollView>
                            </KeyboardAvoidingView>
                            <FixedActionContainer>
                                <ActionButton
                                    disabled={this.state.disabled}
                                    fullWidth
                                    borderRadius={25}
                                    onPress={this.debouncedDoneClick}
                                    backgroundColor={YELLOW}
                                    componentCenter={
                                        <Typography
                                            color={BLACK}
                                            text="Transfer Now"
                                            fontSize={14}
                                            fontWeight="600"
                                            lineHeight={18}
                                        />
                                    }
                                />
                            </FixedActionContainer>
                        </React.Fragment>
                    </ScreenLayout>
                </ScreenContainer>
                {showS2UModal && (
                    <Secure2uAuthenticationModal
                        subTitle={
                            transferParams?.remittanceData?.serviceFee !== "-" &&
                            transferParams?.remittanceData?.serviceFee
                                ? `(Inclusive of RM ${this.parseAmount(
                                      transferParams?.remittanceData?.gour
                                          ? this.state.screenData.additionalChrgs
                                          : transferParams?.remittanceData?.serviceFee
                                  )} service${
                                      !this.state.screenData?.chargeType ||
                                      this.state.screenData?.chargeType === "SHA"
                                          ? ""
                                          : " & Agent/Beneficiary"
                                  } fee)`
                                : ""
                        }
                        token={s2uToken}
                        amount={amountToPay}
                        onS2UDone={this._onS2UConfirmation}
                        s2uPollingData={secure2uValidateData}
                        transactionDetails={s2uTransactionDetails}
                        extraParams={s2uMetadata}
                    />
                )}
                {showTACModal && (
                    <TacModal
                        tacParams={tacParams}
                        onTacClose={this._onTacModalCloseButtonPressed}
                        onGetTacError={this._hideTACModal}
                        validateByOwnAPI={true}
                        validateTAC={this._onTACDone}
                    />
                )}
                <ChallengeQuestion
                    loader={showRSALoader}
                    display={showRSAChallengeQuestion}
                    displyError={showRSAError}
                    questionText={rsaChallengeQuestion}
                    onSubmitPress={this._handleRSAChallengeQuestionAnswered}
                    onSnackClosePress={this._handleRSAChallengeQuestionClosed}
                />
            </React.Fragment>
        );
    }
}

const Styles = {
    container: {
        flex: 1,
        paddingEnd: 24,
        paddingStart: 24,
        paddingTop: 22,
    },
    bottomView: {
        flexDirection: "column",
        marginTop: 24,
        marginHorizontal: 24,
    },
    accountsFlatlist: {
        overflow: "visible",
    },
    formBodyContainer: {
        alignItems: "center",
        justifyContent: "center",
        marginTop: 5,
        width: "100%",
    },
    transferFromContainer: { paddingBottom: 24 },
    headerContainer: {
        alignItems: "center",
        width: "100%",
    },
    headerImageContainer: {
        marginBottom: 12,
    },
    lblSubTitle: { marginTop: 4, marginBottom: 16 },
    lblForeignCurrency: { marginBottom: 12 },
    lblDeclarationTitle: { marginTop: 16 },
    lblLink2: { marginLeft: 16, textDecorationLine: "underline" },
    linksContainer: {
        flexDirection: "row",
        marginTop: 8,
        marginBottom: 48,
    },
    rowListContainer: {
        flex: 1,
        flexDirection: "row",
        marginTop: 20,
    },
    rowListItemLeftContainer: {
        flex: 0.6,
    },
    rowListItemRightContainer: {
        flex: 0.5,
        alignItems: "flex-end",
        alignContent: "flex-end",
    },
    commonInputConfirmIosText: {
        color: ROYAL_BLUE,
        fontFamily: "montserrat",
        fontSize: 14,
        fontStyle: "normal",
        fontWeight: "600",
        marginTop: 0,
        minWidth: 70,
    },
    commonInputConfirmText: {
        color: ROYAL_BLUE,
        fontFamily: "montserrat",
        fontSize: 14,
        fontStyle: "normal",
        fontWeight: "600",
        marginTop: -13,
        minWidth: 70,
    },
    commonInputConfirm: {
        color: BLACK,
        fontFamily: "montserrat",
        fontSize: 14,
        marginTop: -13,
        minWidth: 70,
    },
    commonInputConfirmIos: {
        color: BLACK,
        fontFamily: "montserrat",
        fontSize: 14,
        marginTop: 0,
        minWidth: 70,
    },
    displayFlex: { flex: 1 },
    line: {
        width: "100%",
        marginTop: 24,
        marginBottom: 24,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: VERY_LIGHT_GREY,
        marginHorizontal: 36,
    },
    lineSingle: {
        width: "100%",
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: VERY_LIGHT_GREY,
        marginHorizontal: 36,
        height: 1,
    },
    transferFromContainer2: { paddingHorizontal: "2.5%" },
    transferFromText: { paddingLeft: "2.5%" },
    typoPadding: { paddingVertical: 5 },
    typoPaddingTop: { paddingTop: 5 },
};

export default withModelContext(OverseasConfirmation);
