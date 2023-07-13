import PropTypes from "prop-types";
import React, { Component } from "react";
import { Text } from "react-native";

import { navigateToS2UCooling } from "@screens/OneTapAuth/CoolingNavigator";

import * as navigationConstant from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import HeaderLabel from "@components/Label/HeaderLabel";
import { showErrorToast, showInfoToast } from "@components/Toast";
import TransferEnterAmount from "@components/Transfers/TransferEnterAmount";

// import { callSecure2uValidateApi } from "@services";
import { withModelContext } from "@context";

import { getBillPresentment } from "@services";
import { logEvent } from "@services/analytics";

import { MEDIUM_GREY } from "@constants/colors";
import {
    CURRENCY_CODE,
    ENTER_AMOUNT,
    FA_PAY_BILLERS_AMT,
    FA_PAY_ZAKAT_AMT,
    FA_SCREEN_NAME,
    FA_VIEW_SCREEN,
    PAY,
    PAY_BILLS,
    SECURE2U_IS_DOWN,
    VIEW_BILL,
    ZAKAT,
} from "@constants/strings";

import * as DataModel from "@utils/dataModel";
import { addSpaceAfter4Chars, checks2UFlow } from "@utils/dataModel/utility";

class PayBillsEnterAmount extends Component {
    constructor(props) {
        console.log("PayBillsEnterAmount:", props.route.params);
        super(props);

        this.state = {
            secure2uValidateData: {},
            requiredFields: props.route.params?.requiredFields,
            headerTitle: null,
            logoTitle: props.route.params?.billerInfo?.fullName
                ? props.route.params?.billerInfo?.fullName
                : props.route.params?.billerInfo?.shortName,
            logoSubtitle:
                props.route.params?.billerInfo?.subName ??
                props.route.params?.requiredFields[0]?.fieldValue ??
                "",
            logoImage: props.route.params?.billerInfo?.imageUrl,
            lengthError: false,
            amount: 0,
            amountTextDisplay: "0.00",
            numericKeyboardVal: 0,
            isFirstTime: true,
            ebpData: {},
            isEbp: props.route.params?.isEbp,

            // Zakat Related
            zakatFlow: props.route.params?.zakatFlow ?? false,
            // Donation related
            donationFlow: props.route.params?.donationFlow ?? false,
        };

        // let billAcctNo;
        // let billRefNo;

        if (this.state.requiredFields && this.state.requiredFields.length > 1) {
            let field = this.state.requiredFields[0];
            if (field.fieldName == "bilAcct") {
                // billAcctNo = field.fieldValue;
            } else if (field.fieldName == "billRef") {
                // billRefNo = field.fieldValue;
            } else if (field.fieldName == "billRef2") {
                // billRefNo = field.fieldValue;
            }
        }

        this.minPayment = props.route.params?.billerInfo?.minPayment ?? "1";
        this.minPaymentAmount = Number(props.route.params?.billerInfo?.minPaymentAmount ?? 0);
        this.maxPayment = props.route.params?.billerInfo?.maxPayment ?? "1";
        this.maxPaymentAmount = Number(props.route.params?.billerInfo?.maxPaymentAmount ?? 0);
    }

    async componentDidMount() {
        console.log("[PayBillsEnterAmount] >> [componentDidMount]");
        const zakatFlow = this.props.route.params?.zakatFlow ?? false;
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: zakatFlow ? FA_PAY_ZAKAT_AMT : FA_PAY_BILLERS_AMT,
        });
        if (this.props.route.params?.isEbp) {
            await this.getBillDetails();
        }
        this.initData();

        await DataModel._getDeviceInformation();

        this.focusSubscription = this.props.navigation.addListener("focus", () => {});
        this.blurSubscription = this.props.navigation.addListener("blur", () => {});
    }

    componentWillUnmount() {
        console.log("[PayBillsEnterAmount] >> [componentWillUnmount]");

        this.focusSubscription();
        this.blurSubscription();
    }

    onBackPress = () => {
        console.log("[PayBillsEnterAmount] >> [onBackPress]");
        const { route } = this.props;
        const { donationFlow } = this.state;

        if (donationFlow) {
            if (route.params?.fromModule) {
                this.props.navigation.navigate(route.params?.fromModule, {
                    screen: route.params?.fromScreen,
                });
            } else {
                this.props.navigation.navigate(navigationConstant.TAB_NAVIGATOR, {
                    screen: "Tab",
                    params: {
                        screen: navigationConstant.DASHBOARD,
                        params: { refresh: true },
                    },
                });
            }
        } else {
            this.props.navigation.goBack();
        }
    };

    getBillerListApi = async (data) => {
        try {
            const response = await getBillPresentment(data);
            if (response && response.status === 200) return response;
            return null;
        } catch (error) {
            return null;
        }
    };

    onBtPress = () => {
        this.showBillDeatils();
    };

    showBillDeatils = () => {
        const {
            ebpData: { isReg, image, info, newPaymentHist, newBillHist, ebpData, desc },
        } = this.state;
        if (isReg) {
            this.props.navigation.navigate(navigationConstant.PAYBILLS_MODULE, {
                screen: navigationConstant.PAYBILLS_VIEWBILL_SCREEN,
                params: { image, newPaymentHist, newBillHist, ebpData },
            });
        } else {
            if (desc) {
                if (info) {
                    showInfoToast({ message: desc });
                } else {
                    showErrorToast({ message: desc });
                }
            }
        }
    };

    getBillDetails = async () => {
        const params = this.props?.route?.params ?? {};
        const serverParams = {
            payeeCode: params?.billerInfo?.payeeCode,
            billAcctNo: params?.billerInfo?.acctId,
            favBillPaymentStep2: "17",
            gstNotesFavPaymentStep2: "gstnotesfavpaystep2",
            fullName: params?.billerInfo?.fullName,
            shortName: params?.billerInfo?.shortName,
        };
        const response = await this.getBillerListApi(serverParams);
        if (response && response.data) {
            const { statusCode, ebppData, statusDesc, lastThreePayment } = response?.data;
            if (statusCode === "0000") {
                if (ebppData?.billData?.billerRegisterd === "00") {
                    const paymentHist = lastThreePayment ?? [];
                    const billHist = ebppData?.billData?.previousBill ?? [];
                    const currentBillAmt =
                        ebppData?.billData?.currentBill?.[0]?.amountDue ?? "0.00";
                    const formattedCurrentAmt = currentBillAmt.replace(/[^0-9.]/g, "");
                    const displayVal = formattedCurrentAmt
                        ? parseInt(formattedCurrentAmt * 100)
                        : "0.00";
                    const image = this.state.logoImage ?? ebppData?.companyUrl;
                    const newPaymentHist = paymentHist
                        ? paymentHist.map((item) => ({
                              ...item,
                              name: item?.paymentDate,
                              amt: item?.paidAmount,
                          }))
                        : [];
                    const newBillHist = billHist
                        ? billHist.map((item, index) => ({
                              ...item,
                              name: item?.billDate,
                          }))
                        : [];
                    this.setState({
                        amount: parseFloat(formattedCurrentAmt),
                        amountTextDisplay: formattedCurrentAmt,
                        numericKeyboardVal: displayVal.toString(),
                        isFirstTime: false,
                        ebpData: {
                            image,
                            newPaymentHist,
                            newBillHist,
                            ebppData,
                            desc: "",
                            isReg: true,
                        },
                    });
                } else {
                    this.setState({
                        ebpData: {
                            isReg: false,
                            info: true,
                            desc: "Sorry, you've not registered this bill for the service.",
                        },
                    });
                }
            } else {
                this.setState({
                    ebpData: {
                        isReg: false,
                        desc: statusDesc ?? "Something went wrong. Try again later.",
                    },
                });
            }
        }
    };

    initData = () => {
        console.log("[PayBillsEnterAmount] >> [initData]");

        const params = this.props?.route?.params ?? {};
        const zakatFlow = params?.zakatFlow ?? false;
        const donationFlow = params?.donationFlow ?? false;

        if (zakatFlow) {
            this.setState({
                headerTitle: ZAKAT,
                logoTitle: params?.zakatMobNumTitle ?? "",
            });
        } else {
            this.setState({
                headerTitle: donationFlow ? PAY : PAY_BILLS,
            });
        }
    };

    onDoneClick = async (val) => {
        console.log("[PayBillsEnterAmount] >> [onDoneClick]");

        const { requiredFields } = this.state;
        const deviceInfo = this.props.getModel("device");

        // 1. check amount range
        if (this.minPayment === "0" && this.minPaymentAmount > 0 && val < this.minPaymentAmount) {
            showErrorToast({
                message: `The minimum payment for this transaction is RM ${this.minPaymentAmount}`,
            });
            return;
        }

        if (this.maxPayment === "0" && this.maxPaymentAmount > 0 && val > this.maxPaymentAmount) {
            showErrorToast({
                message: `The maximum payment for this transaction is RM ${this.maxPaymentAmount}`,
            });
            return;
        }

        // 2. check flow
        //passing new paramerter updateModel for s2u interops
        const { flow, secure2uValidateData } = await checks2UFlow(
            17,
            this.props.getModel,
            this.props.updateModel
        );

        if (!secure2uValidateData.s2u_enabled && !this.props.route.params.isFav) {
            showInfoToast({ message: SECURE2U_IS_DOWN });
        }

        // 3. set params
        // let billAcctNo = "";
        // let billRefNo = "";
        if (requiredFields && requiredFields.length > 1) {
            let field = requiredFields[0];
            if (field.fieldName == "bilAcct") {
                // billAcctNo = field.fieldValue;
            } else if (field.fieldName == "billRef") {
                // billRefNo = field.fieldValue;
            } else if (field.fieldName == "billRef2") {
                // billRefNo = field.fieldValue; // TODO: double confirm with backend, billRefNo or billRefNo2
            }
        }

        let navParams = this.prepareNavParams();
        const nextParam = {
            ...navParams,
            secure2uValidateData: secure2uValidateData,
            amount: val,
            deviceInfo: deviceInfo,
            flow: flow,
        };
        const {
            navigation: { navigate },
        } = this.props;
        if (flow === navigationConstant.SECURE2U_COOLING && !this.props.route.params.isFav) {
            navigateToS2UCooling(navigate);
        } else if (flow === "S2UReg" && !this.props.route.params.isFav) {
            navigate(navigationConstant.ONE_TAP_AUTH_MODULE, {
                screen: navigationConstant.ACTIVATE,
                params: {
                    flowParams: {
                        success: {
                            stack: navigationConstant.PAYBILLS_MODULE,
                            screen: navigationConstant.PAYBILLS_CONFIRMATION_SCREEN,
                        },
                        fail: {
                            stack: navigationConstant.PAYBILLS_MODULE,
                            screen: navigationConstant.PAYBILLS_LANDING_SCREEN,
                        },
                        params: { ...nextParam, isFromS2uReg: true },
                    },
                },
            });
        } else {
            navigate(navigationConstant.PAYBILLS_MODULE, {
                screen: navigationConstant.PAYBILLS_CONFIRMATION_SCREEN,
                params: { ...nextParam },
            });
        }
    };

    prepareNavParams = () => {
        console.log("[PayBillsEnterAmount] >> [prepareNavParams]");

        const { requiredFields } = this.state;

        return {
            ...this.props.route.params,
            requiredFields: [...requiredFields],
        };
    };

    getHeaderUI = () => {
        return (
            <HeaderLayout
                horizontalPaddingMode="custom"
                horizontalPaddingCustomLeftValue={24}
                horizontalPaddingCustomRightValue={24}
                headerLeftElement={<HeaderBackButton onPress={this.onBackPress} />}
                headerCenterElement={
                    <HeaderLabel>
                        <Text>Pay Bills</Text>
                    </HeaderLabel>
                }
            />
        );
    };

    render() {
        const {
            logoTitle,
            logoSubtitle,
            logoImage,
            headerTitle,
            donationFlow,
            isEbp,
            amount,
            amountTextDisplay,
            numericKeyboardVal,
            isFirstTime,
        } = this.state;

        return (
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                {headerTitle && (
                    <TransferEnterAmount
                        headerTitle={headerTitle}
                        logoTitle={logoTitle}
                        logoSubtitle={
                            donationFlow ? logoSubtitle : addSpaceAfter4Chars(logoSubtitle)
                        }
                        logoImage={{ type: "url", source: logoImage }}
                        instructionLabel={ENTER_AMOUNT}
                        amount={amount}
                        amountTextDisplay={amountTextDisplay}
                        numericKeyboardVal={numericKeyboardVal}
                        isFirstTime={isFirstTime}
                        logoButtonLabel={isEbp ? VIEW_BILL : null}
                        onBtPress={this.onBtPress}
                        amountPrefix={CURRENCY_CODE}
                        onDoneClick={this.onDoneClick}
                        onBackPress={this.onBackPress}
                    />
                )}
            </ScreenContainer>
        );
    }
}

PayBillsEnterAmount.propTypes = {
    getModel: PropTypes.func,
    navigation: PropTypes.shape({
        addListener: PropTypes.func,
        goBack: PropTypes.func,
        navigate: PropTypes.func,
    }),
    route: PropTypes.shape({
        params: PropTypes.shape({
            billerInfo: PropTypes.shape({
                fullName: PropTypes.any,
                imageUrl: PropTypes.any,
                maxPayment: PropTypes.string,
                maxPaymentAmount: PropTypes.number,
                minPayment: PropTypes.string,
                minPaymentAmount: PropTypes.number,
                shortName: PropTypes.any,
                subName: PropTypes.any,
            }),
            donationFlow: PropTypes.bool,
            fromModule: PropTypes.any,
            fromScreen: PropTypes.any,
            isFav: PropTypes.any,
            requiredFields: PropTypes.any,
            zakatFlow: PropTypes.bool,
        }),
    }),
    updateModel: PropTypes.any,
};

//make this component available to the app
export default withModelContext(PayBillsEnterAmount);
