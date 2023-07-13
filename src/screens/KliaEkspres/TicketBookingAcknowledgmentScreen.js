import Numeral from "numeral";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, Alert } from "react-native";

import * as navigationConstant from "@navigation/navigationConstant";

import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import CustomPdfGenerator from "@components/Common/CustomPdfGenerator";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";
import { showErrorToast, showSuccessToast } from "@components/Toast";
import TransferAcknowledgeInfo from "@components/Transfers/TransferAcknowledgeInfo";
import TransferDetailLabel from "@components/Transfers/TransferDetailLabel";
import TransferDetailLayout from "@components/Transfers/TransferDetailLayout";
import TransferDetailValue from "@components/Transfers/TransferDetailValue";

import { withModelContext } from "@context";

import { checkS2WEarnedChances } from "@services";
import { FAKliaEkspres } from "@services/analytics/analyticsExternalPartner";

import { YELLOW, WHITE, GREY, MEDIUM_GREY } from "@constants/colors";
import {
    AMOUNT,
    CURRENCY,
    DATE_AND_TIME,
    DONE,
    FA_PARTNER_KLIA,
    FA_PARTNER_PAYMENT_FAILED,
    FA_PARTNER_PAYMENT_SUCCESSFUL,
    KLIA_EKSPRES,
    RECEIPT_NOTE,
    REFERENCE_ID,
    SHARE_RECEIPT,
} from "@constants/strings";

import { updateWalletBalance } from "@utils/dataModel/utilityWallet";

import Assets from "@assets";

const TransferDetails = ({ formattedTransactionRefNumber, serverDate }) => {
    return (
        <View style={[Styles.detailContainer]}>
            {!!formattedTransactionRefNumber && (
                <TransferDetailLayout
                    left={<TransferDetailLabel value={REFERENCE_ID} />}
                    right={<TransferDetailValue value={formattedTransactionRefNumber} />}
                />
            )}
            {!!serverDate && (
                <TransferDetailLayout
                    marginBottom={0}
                    left={<TransferDetailLabel value={DATE_AND_TIME} />}
                    right={<TransferDetailValue value={serverDate} />}
                />
            )}
        </View>
    );
};

TransferDetails.propTypes = {
    formattedTransactionRefNumber: PropTypes.any,
    serverDate: PropTypes.any,
};

class TicketBookingAcknowledgmentScreen extends Component {
    constructor(props) {
        super(props);
        console.log(
            "TicketBookingAcknowledgmentScreen:props.route.params----------",
            props.route.params
        );

        console.log(JSON.stringify(props.route.params));

        this.prevSelectedAccount = props.route.params.prevSelectedAccount;
        this.fromModule = props.route.params.fromModule;
        this.fromScreen = props.route.params.fromScreen;

        const { transferResponse } = props.route.params;
        // console.log(
        //     transferResponse.additionalStatus + " : " + transferResponse.statusDescription,
        //     transferResponse.additionalStatus ? true : false
        // );

        this.state = {
            paymentStatus: props.route.params.transferResponse.statusCode === "0" ? 1 : 0,
            isToday: props.route?.params?.isToday,
            transactionRefNumber: transferResponse.transactionRefNumber,
            formattedTransactionRefNumber: transferResponse.formattedTransactionRefNumber,
            amount: transferResponse.amount,
            additionalStatusDescription: transferResponse.additionalStatusDescription,
            statusDescription: transferResponse.statusDescription,
            serverDate: transferResponse.serverDate,
            isDoneAddFav: false,
            isFav: props.route?.params?.isFav,
            pnr: props.route.params.pnr,
            isDisabled: false,
        };
    }

    componentDidMount() {
        const { navigation } = this.props;
        this.focusListener = navigation.addListener("focus", () => {});
        // this is only for campaign while using tracker and earned entries / chances for user
        // comment it out first, Year End Campaign using push notifications way to show CampaignChancesEarned.js
        // this.checkForEarnedChances();

        const transactionId =
            this.props.route?.params?.transferResponse?.formattedTransactionRefNumber;
        const status = this.props.route?.params?.transferResponse?.statusCode === "0";
        FAKliaEkspres.onAcknowledgement(status, transactionId);

        // [[UPDATE_BALANCE]] Update the wallet balance if success
        const { isUpdateBalanceEnabled } = this.props.getModel("wallet");

        if (isUpdateBalanceEnabled) {
            const isSuccess = this.props.route?.params?.transferResponse?.statusCode === "0";
            const isS2uFlow = this.props.route?.params?.isS2uFlow;
            if (isSuccess && !isS2uFlow) {
                updateWalletBalance(this.props.updateModel);
            }
        }
    }

    componentWillUnmount() {
        // Remove the event listener
        this.focusListener();
        this.timer && clearTimeout(this.timer);
    }

    /**
     * S2W chances earned checkers
     */
    checkForEarnedChances = () => {
        // check if campaign is running and check if it matched the list
        // delayed the check a lil bit to let user see the acknowledge screen

        this.timer && clearTimeout(this.timer);

        this.timer = setTimeout(async () => {
            const {
                misc: { isCampaignPeriod },
                s2w: { txnTypeList },
            } = this.props.getModel(["misc", "s2w"]);

            const { paymentStatus } = this.state; // we use paymentStatus for success checking
            if (isCampaignPeriod && txnTypeList.includes("MAEKLIA") && paymentStatus) {
                try {
                    const params = {
                        txnType: "MAEKLIA",
                    };

                    // const response = {
                    //     data: {
                    //         displayPopup: true,
                    //         chance: 1,
                    //     },
                    // };
                    const response = await checkS2WEarnedChances(params);

                    if (response) {
                        const { displayPopup, chance } = response.data;
                        console.log("displayPopup", displayPopup, "chance", chance);

                        if (displayPopup) {
                            // go to earned chances screen
                            this.props.navigation.push("TabNavigator", {
                                screen: "CampaignChancesEarned",
                                params: {
                                    chances: chance,
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

    // -----------------------
    // PDF
    // -----------------------
    // **
    getReceiptRefId = () => {
        return {
            label: "Reference ID",
            value: this.state.formattedTransactionRefNumber,
            showRightText: true,
            rightTextType: "text",
            rightStatusType: "",
            rightText: this.state.serverDate,
        };
    };

    getCorporateName = () => {
        return {
            label: "Corporate Name",
            value: KLIA_EKSPRES,
            showRightText: false,
        };
    };

    getBookingNumber = () => {
        return {
            label: "Booking number",
            value: this.state.pnr,
            showRightText: false,
        };
    };

    getReceiptAmount = () => {
        return {
            label: AMOUNT,
            value: CURRENCY + Numeral(this.props.route.params.amount).format("0,0.00"),
            showRightText: false,
            isAmount: true,
            // rightTextType: "status",
            // rightStatusType: "success",
            // rightText: "Success",
        };
    };

    showLoader = (visible) => {
        this.props.updateModel({
            ui: {
                showLoader: visible,
            },
        });
    };

    ticketGASharePDF = (reloadShare) => {
        FAKliaEkspres.onSharePDF(reloadShare);
    };

    ticketPdfView = () => {
        FAKliaEkspres.onViewPDF();
    };

    // -----------------------
    // EVENT HANDLER
    // -----------------------

    // TODO: need to refactor
    onSharePress = async () => {
        console.log("onSharePress");
        this.showLoader(true);
        this.setState({
            isDisabled: true,
        });

        const detailsArray = [];

        // there is no diff for iav or not fav
        // jompay no schedule option
        detailsArray.push(this.getReceiptRefId());
        detailsArray.push(this.getCorporateName());
        detailsArray.push(this.getBookingNumber());
        detailsArray.push(this.getReceiptAmount());

        try {
            // Call custom method to generate PDF
            const file = await CustomPdfGenerator.generateReceipt(
                true,
                // Strings.KLIA_EKSPRES,
                "Train Tickets",
                true,
                RECEIPT_NOTE,
                detailsArray,
                true,
                "success",
                "Successful"
            );

            if (file === null) {
                Alert.alert("Please allow permission");
                return;
            }

            const navParams = {
                file,
                share: true,
                type: "file",
                pdfType: "shareReceipt",
                title: "Share Receipt",
                sharePdfGaHandler: this.ticketGASharePDF,
                GAPdfView: this.ticketPdfView,
            };

            this.props.navigation.navigate(navigationConstant.COMMON_MODULE, {
                screen: navigationConstant.PDF_VIEWER,
                params: navParams,
            });
        } catch (err) {
            console.log(err);
        } finally {
            this.showLoader(false);
            this.setState({
                isDisabled: false,
            });
        }
    };

    onDonePress = () => {
        if (this.prevSelectedAccount) {
            this.props.navigation.navigate(this.fromModule, {
                screen: this.fromScreen,
                params: {
                    prevData: this.prevSelectedAccount,
                    // onGoBack: this._refresh
                },
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
    };

    // -----------------------
    // API CALL
    // -----------------------

    // -----------------------
    // OTHER PROCESS
    // -----------------------
    showSuccessMsg = (msg) => {
        showSuccessToast({
            message: msg,
        });
    };
    showErrorMsg = (msg) => {
        showErrorToast({
            message: msg,
        });
    };

    render() {
        const image = this.state.paymentStatus ? Assets.icTickNew : Assets.icFailedIcon;
        const additionalStatusDescription = this.state.additionalStatusDescription;
        let transferStatusInfoTitle = this.state.statusDescription;
        const paymentStatus =
            this.props.route?.params?.transferResponse?.statusCode === "0"
                ? FA_PARTNER_PAYMENT_SUCCESSFUL
                : FA_PARTNER_PAYMENT_FAILED;

        return (
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                analyticScreenName={FA_PARTNER_KLIA + paymentStatus}
            >
                <ScreenLayout scrollable={true}>
                    <React.Fragment>
                        <View style={Styles.mainContainer}>
                            <TransferAcknowledgeInfo
                                image={image}
                                title={transferStatusInfoTitle}
                                description={additionalStatusDescription}
                            />
                            <TransferDetails
                                formattedTransactionRefNumber={
                                    this.state.formattedTransactionRefNumber
                                }
                                serverDate={this.state.serverDate}
                            />
                        </View>
                        <View style={[Styles.footerContainer]}>
                            {this.state.paymentStatus ? (
                                <View style={Styles.shareBtnContainer}>
                                    <ActionButton
                                        height={48}
                                        fullWidth
                                        backgroundColor={WHITE}
                                        borderRadius={24}
                                        borderWidth={1}
                                        borderColor={GREY}
                                        disabled={this.state.isDisabled}
                                        isLoading={this.state.isDisabled}
                                        componentCenter={
                                            <Typo
                                                fontSize={14}
                                                fontWeight="600"
                                                fontStyle="normal"
                                                letterSpacing={0}
                                                lineHeight={18}
                                                text={SHARE_RECEIPT}
                                            />
                                        }
                                        onPress={this.onSharePress}
                                    />
                                </View>
                            ) : null}
                            {/*  */}
                            <ActionButton
                                height={48}
                                fullWidth
                                backgroundColor={YELLOW}
                                borderRadius={24}
                                componentCenter={
                                    <Typo
                                        fontSize={14}
                                        fontWeight="600"
                                        fontStyle="normal"
                                        letterSpacing={0}
                                        lineHeight={18}
                                        text={DONE}
                                    />
                                }
                                onPress={this.onDonePress}
                            />
                        </View>
                    </React.Fragment>
                </ScreenLayout>
            </ScreenContainer>
        );
    }
}

TicketBookingAcknowledgmentScreen.propTypes = {
    getModel: PropTypes.func,
    navigation: PropTypes.object.isRequired,
    route: PropTypes.shape({
        params: PropTypes.shape({
            amount: PropTypes.any,
            fromModule: PropTypes.any,
            fromScreen: PropTypes.any,
            isFav: PropTypes.any,
            isToday: PropTypes.any,
            pnr: PropTypes.any,
            prevSelectedAccount: PropTypes.any,
            transferResponse: PropTypes.shape({
                additionalStatusDescription: PropTypes.any,
                amount: PropTypes.any,
                formattedTransactionRefNumber: PropTypes.any,
                serverDate: PropTypes.any,
                statusCode: PropTypes.string,
                statusDescription: PropTypes.any,
                transactionRefNumber: PropTypes.any,
            }),
            isS2uFlow: PropTypes.bool,
        }),
    }),
    updateModel: PropTypes.func,
};

TicketBookingAcknowledgmentScreen.defaultProps = {
    navigation: {},
};

export default withModelContext(TicketBookingAcknowledgmentScreen);

const Styles = {
    mainContainer: {
        flex: 1,
        // justifyContent: "center",
        paddingHorizontal: 12,
        paddingTop: 126,
    },
    detailContainer: {
        marginTop: 24,
        alignItems: "stretch",
    },
    footerContainer: {
        width: "100%",
        flexDirection: "column",
        justifyContent: "flex-end",
        marginBottom: 16,
    },
    detailRow: {
        paddingTop: 17,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    shareBtnContainer: {
        marginBottom: 16,
    },
    addFavBtnContainer: {
        marginTop: 24,
    },
};
