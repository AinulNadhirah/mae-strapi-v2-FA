/**
 * PURPOSE:
 * To be used as a temporary screen to navigate to for making any API calls
 * or performing any checks before navigating to the intended screen.
 *
 * NOTE:
 * Always use "replace" for navigation to the intended screen as this
 * screen should not be navigated back to.
 */
import moment from "moment";
import PropTypes from "prop-types";
import React, { Component } from "react";

import {
    checkServerOperationTime,
    getApplyMAECardNavParams,
    fetchChipMasterData,
} from "@screens/MAE/CardManagement/CardManagementController";

import {
    BANKINGV2_MODULE,
    APPLY_CARD_INTRO,
    SB_NAME,
    CARD_UCODE_PIN,
    SEND_REQUEST_MONEY_STACK,
    SEND_REQUEST_MONEY_DASHBOARD,
    BANKING_TXNHISTORY_SCREEN,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import GroupLoaderCard from "@components/Cards/SplitBillCards/GroupLoaderCard";
import SBLoaderCard from "@components/Cards/SplitBillCards/SBLoaderCard";
import ScreenContainer from "@components/Containers/ScreenContainer";
import { showErrorToast } from "@components/Toast";

import { withModelContext } from "@context";

import {
    invokeL3,
    invokeL2,
    maeCustomerInfo,
    getVirtualCardDetails,
    bankingGetDataMayaM2u,
} from "@services";

import { MEDIUM_GREY } from "@constants/colors";
import { SB_FLOW_FROM_PAYMENT } from "@constants/data";
import { COMMON_ERROR_MSG, SEND_MESSAGE_DEEPAMONEY } from "@constants/strings";
import { ENDPOINT_BASE } from "@constants/url";

class GatewayScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount = () => {
        const params = this.props?.route?.params ?? null;
        if (!params) this.goBack();

        const action = params?.action ?? null;
        const entryPoint = params?.entryPoint ?? "MOMENTS";
        const splitBillAmount = params?.splitBillAmount ?? null;

        console.log("[GatewayScreen][componentDidMount] >> action: " + action);

        switch (action) {
            case "APPLY_MAE_CARD":
                this.initApplyMAECard(entryPoint);
                break;
            case "MAE_ACTIVATE_CARD":
                this.initActivateMAECard();
                break;
            case "WALLET_SPLITBILLNEW":
            case SB_FLOW_FROM_PAYMENT:
                this.initCreateSBFlow(splitBillAmount);
                break;
            case "FESTIVE_SENDMONEY":
                this.initFestiveSendMoney(entryPoint);
                break;
            case "REFERRAL_MAE_TRX_HISTORY":
                this.referralMAETransactionHistory();
                break;
            default:
                this.goBack();
                break;
        }
    };

    goBack = () => {
        console.log("[GatewayScreen] >> [goBack]");

        this.props.navigation.goBack();
    };

    getMaeAccount = async () => {
        try {
            const path = `/summary?type=A&checkMae=true`;

            const response = await bankingGetDataMayaM2u(path, false);

            if (response && response.data && response.data.code === 0) {
                const { accountListings } = response.data.result;

                if (accountListings && accountListings.length) {
                    const mae = accountListings.find(
                        (account) =>
                            (account.group === "0YD" || account.group === "CCD") &&
                            account.type === "D"
                    );

                    if (mae) {
                        return mae;
                    }
                }

                throw new Error("no mae account");
            } else {
                throw new Error("no mae account");
            }
        } catch (error) {
            console.tron.log(error?.message);
            // error when retrieving the data
            throw error;
        }
    };

    referralMAETransactionHistory = async () => {
        // to go to transaction history of MAE account,
        // so gotta query for account list and find the MAE
        // account and append the data
        const maeAccount = await this.getMaeAccount().catch((err) => {
            console.tron.log(err?.message);
            if (err?.message === "no mae account") {
                this.goBack();

                showErrorToast({
                    message: "No MAE account found.",
                });
            }

            return;
        });

        if (maeAccount) {
            this.props.navigation.replace(BANKINGV2_MODULE, {
                screen: BANKING_TXNHISTORY_SCREEN,
                params: {
                    data: maeAccount,
                    prevData: maeAccount,
                    type: "MAE",
                },
            });
        }
    };

    initApplyMAECard = async (entryPoint) => {
        console.log("[GatewayScreen] >> [initApplyMAECard]");

        const { getModel } = this.props;
        const { isPostPassword } = getModel("auth");

        // Check Operation time
        const operationTime = await checkServerOperationTime("maePhysicalCard");
        const statusCode = operationTime?.statusCode ?? "";
        const statusDesc = operationTime?.statusDesc ?? COMMON_ERROR_MSG;
        const trinityFlag = operationTime?.trinityFlag ?? "";
        if (statusCode !== "0000") {
            showErrorToast({
                message: statusDesc,
            });
            this.goBack();
            return;
        }

        // L3 call to invoke login page
        if (!isPostPassword) {
            const httpResp = await invokeL3(true).catch((error) => {
                console.log("[GatewayScreen][invokeL3] >> Exception: ", error);
            });
            const code = httpResp?.data?.code ?? null;
            if (code !== 0) {
                this.goBack();
                return;
            }
        }

        // MAE Customer Info call
        const urlParams = "?countryCode=MY&checkMaeAcctBalance=true";
        const httpResp = await maeCustomerInfo(urlParams, true).catch((error) => {
            console.log("[GatewayScreen][maeCustomerInfo] >> Exception: ", error);
        });

        const maeCustomerInfoData = httpResp?.data?.result ?? null;
        if (!maeCustomerInfoData) {
            showErrorToast({
                message: COMMON_ERROR_MSG,
            });
            this.goBack();
            return;
        }

        const navParams = getApplyMAECardNavParams(maeCustomerInfoData, trinityFlag);
        if (entryPoint === "MAE_ONBOARD_TOPUP") {
            this.props.navigation.replace(APPLY_CARD_INTRO, {
                ...navParams,
                entryPoint,
            });
        } else {
            this.props.navigation.replace(BANKINGV2_MODULE, {
                screen: APPLY_CARD_INTRO,
                params: {
                    ...navParams,
                    entryPoint,
                },
            });
        }
    };

    initActivateMAECard = async () => {
        console.log("[GatewayScreen] >> [initActivateMAECard]");

        const { getModel } = this.props;
        const { isPostPassword } = getModel("auth");

        // L3 call to invoke login page
        if (!isPostPassword) {
            const httpResp = await invokeL3(true).catch((error) => {
                console.log("[GatewayScreen][invokeL3] >> Exception: ", error);
            });
            const code = httpResp?.data?.code ?? null;
            if (code !== 0) {
                this.goBack();
                return;
            }
        }

        // API call to get Card details
        const cardResp = await getVirtualCardDetails({
            applicant_type: "",
        }).catch((error) => {
            console.log("[GatewayScreen][getVirtualCardDetails] >> Exception: ", error);
        });
        const cardResult = cardResp?.data?.result ?? null;
        if (!cardResult) {
            showErrorToast({
                message: COMMON_ERROR_MSG,
            });
            this.goBack();
            return;
        }

        const { statusCode, statusDesc, cardNo, cardStatus, cardNextAction } = cardResult;
        if (statusCode === "000" && cardStatus === "000") {
            if (cardNextAction === "002") {
                // If 002, then cannot activate card yet

                showErrorToast({
                    message: "Your card application is in progress. Please try again later",
                });
                this.goBack();
            } else if (cardNextAction === "003") {
                // If 003, card can be activated now

                const chipMasterData = await fetchChipMasterData(cardNo);
                const { statusCode, statusDesc } = chipMasterData;
                if (statusCode === "0000") {
                    this.props.navigation.replace(CARD_UCODE_PIN, {
                        ...cardResult,
                        flowType: "ACTIVATE",
                        currentScreen: "UCODE",
                        entryPoint: "MOMENTS",
                        chipMasterData,
                    });
                } else {
                    showErrorToast({
                        message: statusDesc || COMMON_ERROR_MSG,
                    });
                }
            } else {
                // If some other cardNextAction, then error scenario

                showErrorToast({
                    message: COMMON_ERROR_MSG,
                });
                this.goBack();
            }
        } else {
            showErrorToast({
                message: statusDesc || COMMON_ERROR_MSG,
            });
            this.goBack();
        }
    };

    initCreateSBFlow = async (splitBillAmount = null) => {
        console.log("[GatewayScreen] >> [initCreateSBFlow]");

        const { getModel } = this.props;
        const { isPostLogin, isPostPassword } = getModel("auth");

        if (!isPostPassword && !isPostLogin) {
            // L2 call to invoke login page
            const httpResp = await invokeL2(true).catch((error) => {
                console.log("[GatewayScreen][invokeL2] >> Exception: ", error);
            });
            const code = httpResp?.data?.code ?? null;
            if (code !== 0) {
                this.goBack();
                return;
            }
        }

        const navParams = this.getAccountDetails();
        this.props.navigation.replace(SB_NAME, {
            ...navParams,
            prepopulateAmount: splitBillAmount,
        });
    };

    initFestiveSendMoney = async (entryPoint = "") => {
        console.log("[GatewayScreen] >> [initFestiveSendMoney]");

        const { getModel, updateModel } = this.props;
        const { isPostPassword } = getModel("auth");
        // const { specialOccasionData } = getModel("misc");

        // L3 call to invoke login page
        if (!isPostPassword) {
            updateModel({
                misc: {
                    isFestiveFlow: true,
                },
            });

            const httpResp = await invokeL3(true).catch((error) => {
                console.log("[GatewayScreen][invokeL3] >> Exception: ", error);
            });
            const code = httpResp?.data?.code ?? null;
            if (code !== 0) {
                this.goBack();
                return;
            }
        }

        // Extract data sent from BE for Send Money module
        const festiveDataObj = {};
        // if (specialOccasionData instanceof Array) {
        //     const initFestiveSendMoney = specialOccasionData.find((item) => {
        //         return item.module === "SEND_RCV";
        //     });

        //     festiveDataObj = {
        //         note: initFestiveSendMoney?.note,
        //         statusScreenMsg: initFestiveSendMoney?.successMsg,
        //     };
        // }

        this.props.navigation.replace(SEND_REQUEST_MONEY_STACK, {
            screen: SEND_REQUEST_MONEY_DASHBOARD,
            params: {
                cta: "festiveSendMoney",
                festiveObj: {
                    routeFrom: entryPoint,
                    backgroundImage: {
                        uri: `${ENDPOINT_BASE}/cms/document-view/festival-01.jpg?date=${moment().valueOf()}`,
                        cache: "reload",
                        headers: {
                            Pragma: "no-cache",
                        },
                    },
                    statusScreenMsg: SEND_MESSAGE_DEEPAMONEY,
                    ...festiveDataObj,
                },
            },
        });
    };

    getAccountDetails = () => {
        console.log("[GatewayScreen] >> [getAccountDetails]");

        const { getModel } = this.props;
        const { primaryAccount } = getModel("wallet");

        return { accountNo: primaryAccount?.number ?? "", accountCode: primaryAccount?.code ?? "" };
    };

    render() {
        return (
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={this.goBack} />}
                        />
                    }
                    paddingHorizontal={0}
                    paddingBottom={0}
                    paddingTop={0}
                    useSafeArea
                >
                    <>
                        <SBLoaderCard />
                        <GroupLoaderCard />
                        <GroupLoaderCard />
                    </>
                </ScreenLayout>
            </ScreenContainer>
        );
    }
}

GatewayScreen.propTypes = {
    getModel: PropTypes.func,
    navigation: PropTypes.object,
    route: PropTypes.object,
    updateModel: PropTypes.func,
};

export default withModelContext(GatewayScreen);
