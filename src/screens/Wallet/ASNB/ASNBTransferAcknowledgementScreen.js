import Numeral from "numeral";
import PropTypes from "prop-types";
import React from "react";
import { TouchableOpacity } from "react-native";

import { FUNDTRANSFER_MODULE, TRANSFER_TAB_SCREEN } from "@navigation/navigationConstant";

import ActionButton from "@components/Buttons/ActionButton";
import CustomPdfGenerator from "@components/Common/CustomPdfGenerator";
import AcknowledgementScreenTemplate from "@components/ScreenTemplates/AcknowledgementScreenTemplate";
import Typography from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { withModelContext } from "@context";

import { checkS2WEarnedChances } from "@services";
import { logEvent } from "@services/analytics";

import {
    FA_SELECT_ACTION,
    RECEIPT_NOTE,
    FA_SCREEN_NAME,
    FA_VIEW_SCREEN,
    FA_FORM_COMPLETE,
    FA_FORM_INFO,
    FA_FORM_ERROR,
    FA_SHARE,
    FA_METHOD,
} from "@constants/strings";

import { addSpaceAfter4Chars } from "@utils/dataModel/utility";
import { updateWalletBalance } from "@utils/dataModel/utilityWallet";

import { getNetworkMsg } from "../../../utilities";

const SCREEN_NAME_TRANSACTION_SUCCESS = "Transfer_ASNB_Successful";
const SCREEN_NAME_TRANSACTION_FAILURE = "Transfer_ASNB_Unsuccessful";
const FA_FORM_INFO_ONE_OFF = "One-Off Transfer";

class ASNBTransferAcknowledgementScreen extends React.Component {
    static propTypes = {
        route: PropTypes.object.isRequired,
        navigation: PropTypes.object.isRequired,
        getModel: PropTypes.func,
        updateModel: PropTypes.func,
    };

    state = {
        showLoader: false,
    };

    componentDidMount() {
        // s2w raya
        // const {
        //     misc: { isCampaignPeriod, isTapTasticReady },
        // } = this.props.getModel(["misc"]);
        const {
            route: {
                params: { transactionAcknowledgementDetails, isTransactionSuccessful },
            },
        } = this.props;

        // this is only for campaign while using tracker and earned entries / chances for user
        // comment it out first, Year End Campaign using push notifications way to show CampaignChancesEarned.js
        // if (isCampaignPeriod || isTapTasticReady) this.checkForChances();

        if (isTransactionSuccessful) {
            logEvent(FA_VIEW_SCREEN, {
                [FA_SCREEN_NAME]: SCREEN_NAME_TRANSACTION_SUCCESS,
            });
            logEvent(FA_FORM_COMPLETE, {
                [FA_SCREEN_NAME]: SCREEN_NAME_TRANSACTION_SUCCESS,
                [FA_FORM_INFO]: FA_FORM_INFO_ONE_OFF,
                trans_id: transactionAcknowledgementDetails[0].value,
            });
        } else {
            logEvent(FA_VIEW_SCREEN, {
                [FA_SCREEN_NAME]: SCREEN_NAME_TRANSACTION_FAILURE,
            });
            logEvent(FA_FORM_ERROR, {
                [FA_SCREEN_NAME]: SCREEN_NAME_TRANSACTION_FAILURE,
                [FA_FORM_INFO]: FA_FORM_INFO_ONE_OFF,
                trans_id: transactionAcknowledgementDetails[0].value,
            });
        }

        // [[UPDATE_BALANCE]] Update the wallet balance if success
        const { isS2uFlow } = this.props.route.params;
        const { isUpdateBalanceEnabled } = this.props.getModel("wallet");
        if (isUpdateBalanceEnabled && isTransactionSuccessful && !isS2uFlow) {
            updateWalletBalance(this.props.updateModel);
        }
    }

    _generateReceipt = async () => {
        this.setState({ showLoader: true });
        try {
            const {
                route: {
                    params: {
                        transactionAcknowledgementDetails,
                        asnbTransferState: {
                            beneficiaryName,
                            idNumberValue,
                            amount,
                            membershipNumberValue,
                            productDetail,
                            purposeOfTransferDetail,
                            relationshipDetail,
                            fundPrice,
                            unitAllocated,
                            salesChargePercentage,
                            salesChargeAmount,
                            sstAmount,
                            isNewTransfer,
                            isOwnAccountTransfer,
                        },
                    },
                },
            } = this.props;

            const file = await CustomPdfGenerator.generateReceipt(
                true,
                "ASNB Transfer",
                true,
                RECEIPT_NOTE,
                [
                    {
                        label: "Reference ID",
                        value: transactionAcknowledgementDetails[0].value,
                        showRightText: true,
                        rightTextType: "text",
                        rightStatusType: "",
                        rightText: transactionAcknowledgementDetails[1].value,
                    },
                    {
                        label: "Member Name",
                        value: beneficiaryName,
                        showRightText: false,
                    },
                    {
                        label: "Product Name",
                        value: productDetail.name,
                        showRightText: false,
                    },
                    {
                        label: "Membership number",
                        value: addSpaceAfter4Chars(membershipNumberValue),
                        showRightText: false,
                    },
                    {
                        label: "ID number for ASB member",
                        value: idNumberValue,
                        showRightText: false,
                    },
                    ...(isNewTransfer || !isOwnAccountTransfer
                        ? [
                              {
                                  label: "Relationship",
                                  value: relationshipDetail.name,
                                  showRightText: false,
                              },
                              {
                                  label: "Purpose of transfer",
                                  value: purposeOfTransferDetail.name,
                                  showRightText: false,
                              },
                          ]
                        : []),
                    {
                        label: "Fund Price",
                        value: fundPrice,
                        showRightText: false,
                    },
                    {
                        label: "Unit allocated",
                        value: unitAllocated,
                        showRightText: false,
                    },
                    {
                        label: "Sales charge (%)",
                        value: salesChargePercentage,
                        showRightText: false,
                    },
                    {
                        label: "Sales charge (RM)",
                        value: salesChargeAmount,
                        showRightText: false,
                    },
                    {
                        label: "SST amount (RM) from ASNB",
                        value: sstAmount,
                        showRightText: false,
                    },
                    {
                        label: "Amount",
                        value: `RM ${Numeral(amount).format("0,0.00")}`,
                        showRightText: false,
                        rightTextType: "status",
                        rightText: "success",
                        isAmount: true,
                    },
                ],
                true,
                "success",
                "Successful"
            );
            this._navigateToReceiptScreen(file);
        } catch (error) {
            showErrorToast({ message: error.message });
        } finally {
            this.setState({ showLoader: false });
        }
    };

    checkForChances = async () => {
        // check if campaign is running and check if it matched the list
        // delayed the check a lil bit to let user see the acknowledge screen
        this.timer && clearTimeout(this.timer);

        this.timer = setTimeout(async () => {
            const {
                misc: { isCampaignPeriod, isTapTasticReady, tapTasticType },
                s2w: { txnTypeList },
            } = this.props.getModel(["misc", "s2w"]);

            const { isTransactionSuccessful } = this.props.route.params;

            if (
                (isCampaignPeriod || isTapTasticReady) &&
                txnTypeList.includes("M2UASNB") &&
                isTransactionSuccessful
            ) {
                try {
                    const params = {
                        txnType: "M2UASNB",
                    };
                    const response = await checkS2WEarnedChances(params);

                    if (response) {
                        const { displayPopup, chance } = response.data;
                        if (displayPopup) {
                            // go to earned chances screen
                            this.props.navigation.push("TabNavigator", {
                                screen: "CampaignChancesEarned",
                                params: {
                                    chances: chance,
                                    isTapTasticReady,
                                    tapTasticType,
                                },
                            });
                        }
                    }
                } catch (error) {
                    // can't do nothing
                }
            }
        }, 400);
    };

    _navigateToReceiptScreen = (file) => {
        if (!file) return;

        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: SCREEN_NAME_TRANSACTION_SUCCESS,
            action_name: "Share Receipt",
        });
        this.props.navigation.navigate("commonModule", {
            screen: "PDFViewer",
            params: {
                file,
                share: true,
                type: "file",
                pdfType: "shareReceipt",
                title: "Share Receipt",
                analyticScreenName: "Transfer_ASNB_Receipt",
                sharePdfGaHandler: this._sharePdfGaHandler,
            },
        });
    };

    _handleNavigationToASNBTab = () =>
        this.props.navigation.navigate(FUNDTRANSFER_MODULE, {
            screen: TRANSFER_TAB_SCREEN,
        });

    _handleNavigationToAddFavouritesScreen = () => {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: SCREEN_NAME_TRANSACTION_SUCCESS,
            action_name: "Add Favourite",
        });
        const {
            navigation: { navigate },
            route: { params },
        } = this.props;
        navigate(FUNDTRANSFER_MODULE, {
            screen: "ASNBAddFavouriteScreen",
            params: { ...params },
        });
    };

    _sharePdfGaHandler = (method) => {
        logEvent(FA_SHARE, {
            [FA_SCREEN_NAME]: `Transfer_ASNB_Receipt`,
            [FA_METHOD]: method,
        });
    };

    render() {
        const {
            route: {
                params: {
                    transactionAcknowledgementDetails,
                    isTransactionSuccessful,
                    errorMessage,
                    asnbTransferState: { isNewTransfer, isAlreadyInFavouriteList },
                },
            },
        } = this.props;
        const { showLoader } = this.state;
        const { headerMsg, descMsg, pending } = getNetworkMsg(errorMessage);

        return (
            <AcknowledgementScreenTemplate
                isSuccessful={isTransactionSuccessful}
                message={
                    pending
                        ? headerMsg
                        : isTransactionSuccessful
                        ? "Transfer Successful"
                        : "Transfer Failed"
                }
                detailsData={transactionAcknowledgementDetails}
                showLoader={showLoader}
                errorMessage={descMsg ?? errorMessage ?? ""}
                ctaComponents={[
                    isTransactionSuccessful && (
                        <ActionButton
                            onPress={this._generateReceipt}
                            key="share-button"
                            fullWidth
                            borderColor="#cfcfcf"
                            borderWidth={1}
                            borderStyle="solid"
                            backgroundColor="#ffffff"
                            componentCenter={
                                <Typography
                                    text="Share Receipt"
                                    fontSize={14}
                                    lineHeight={18}
                                    fontWeight="600"
                                />
                            }
                        />
                    ),
                    <ActionButton
                        key="done-button"
                        fullWidth
                        onPress={this._handleNavigationToASNBTab}
                        componentCenter={
                            <Typography
                                text="Done"
                                fontSize={14}
                                lineHeight={18}
                                fontWeight="600"
                            />
                        }
                    />,
                    isTransactionSuccessful && isNewTransfer && !isAlreadyInFavouriteList && (
                        <TouchableOpacity
                            key="favourites-button"
                            onPress={this._handleNavigationToAddFavouritesScreen}
                        >
                            <Typography
                                text="Add to Favourites"
                                fontSize={14}
                                lineHeight={18}
                                fontWeight="600"
                                color="#4a90e2"
                            />
                        </TouchableOpacity>
                    ),
                ]}
            />
        );
    }
}

export default withModelContext(ASNBTransferAcknowledgementScreen);
