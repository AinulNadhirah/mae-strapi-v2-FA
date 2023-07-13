import PropTypes from "prop-types";
import React, { Component } from "react";

import ActionButton from "@components/Buttons/ActionButton";
import AcknowledgementScreenTemplate from "@components/ScreenTemplates/AcknowledgementScreenTemplate";
import Typography from "@components/Text";

import { withModelContext } from "@context";

import { applyFixedDeposit } from "@services/analytics/analyticsSTPeFD";

import { GREY, WHITE } from "@constants/colors";
import {
    AMOUNT,
    CERT_NO,
    REFERENCE_ID,
    DATE_AND_TIME,
    FD_TYPE,
    TENURE,
    TO,
    TRANSACTION_SUCCESS,
    TRANSACTION_DECLINED,
    TRANSACTION_UNSUCCESS,
    DONE,
    VIEW_CERT,
    NETWORK_ERROR_MSG_DESC,
    NETWORK_ERROR_MSG_HEADER,
} from "@constants/strings";

import { updateWalletBalance } from "@utils/dataModel/utilityWallet";

class FDPlacementAcknowledgementScreen extends Component {
    static propTypes = {
        navigation: PropTypes.object.isRequired,
        route: PropTypes.object.isRequired,
        getModel: PropTypes.func.isRequired,
        updateModel: PropTypes.func.isRequired,
    };

    componentDidMount() {
        const {
            route: {
                params: {
                    isPlacementSuccessful,
                    placementDetails: { referenceID },
                },
            },
        } = this.props;
        applyFixedDeposit.onPlacementAcknowledgementViewScreen(isPlacementSuccessful);
        applyFixedDeposit.onPlacementAcknowledgementFormComplete(
            isPlacementSuccessful,
            referenceID
        );
        // this is only for campaign while using tracker and earned entries / chances for user
        // comment it out first, Year End Campaign using push notifications way to show CampaignChancesEarned.js
        // this.checkForEarnedChances();

        // [[UPDATE_BALANCE]] Update the wallet balance if success
        const { isUpdateBalanceEnabled } = this.props.getModel("wallet");
        const isS2uFlow = this.props.route?.params?.isS2uFlow;
        if (isUpdateBalanceEnabled && isPlacementSuccessful && !isS2uFlow) {
            updateWalletBalance(this.props.updateModel);
        }
    }
    /**
     * S2W chances earned checkers
     */
    // checkForEarnedChances = () => {
    //     const {
    //         misc: { isTapTasticReady, tapTasticType },
    //         s2w: { txnTypeList },
    //     } = this.props.getModel(["misc", "s2w"]);
    //     // check if campaign is running and check if it matched the list
    //     // delayed the check a lil bit to let user see the acknowledge screen
    //     this.timer && clearTimeout(this.timer);
    //     // if (!this.props.route.params?.s2w) {
    //     //     return;
    //     // }

    //     this.timer = setTimeout(async () => {
    //         try {
    //             const resp = await checkS2WEarnedChances({
    //                 txnType: "M2UEFD",
    //             });
    //             if (resp?.data) {
    //                 const { displayPopup, generic, chance } = resp.data;
    //                 console.log("displayPopup", displayPopup, "chance", chance);
    //                 if (isTapTasticReady && txnTypeList.includes("M2UEFD") && displayPopup) {
    //                     this.props.navigation.push("TabNavigator", {
    //                         screen: "CampaignChancesEarned",
    //                         params: {
    //                             chances: chance,
    //                             isCapped: generic,
    //                             isTapTasticReady,
    //                             tapTasticType,
    //                         },
    //                     });
    //                 }
    //             }
    //         } catch (e) {}
    //     }, 400);
    // };
    _navigateToEntryPoint = () => {
        const {
            route: {
                params: { fdEntryPointModule, fdEntryPointScreen },
            },
            navigation: { navigate },
        } = this.props;
        navigate(fdEntryPointModule, {
            screen: fdEntryPointScreen,
        });
    };

    _navigateToCertificateDetailScreen = () => {
        const {
            route: {
                params: {
                    placementDetails: { certificateNumber },
                    fdAccounts,
                },
            },
            navigation: { navigate },
        } = this.props;
        applyFixedDeposit.onFDViewCertificate();
        navigate("FDCertificateDetailsScreen", {
            certificateNumber,
            existingFDAccounts: fdAccounts,
            ...this.props.route.params,
        });
    };

    _generateSuccessfulPlacementDetails = () => {
        const {
            route: {
                params: {
                    isPlacementSuccessful,
                    placementDetails: {
                        referenceID,
                        dateAndTime,
                        to,
                        certificateNumber,
                        tenure,
                        amount,
                        fdType,
                    },
                },
            },
        } = this.props;

        return [
            { title: REFERENCE_ID, value: referenceID },
            { title: DATE_AND_TIME, value: dateAndTime },
            ...(isPlacementSuccessful
                ? [
                      ...(to ? [{ title: TO, value: to }] : []),
                      ...(fdType ? [{ title: FD_TYPE, value: fdType }] : []),
                      { title: CERT_NO, value: certificateNumber },
                      { title: TENURE, value: tenure },
                      { title: AMOUNT, value: amount },
                  ]
                : []),
        ];
    };

    renderMessageStatus = () => {
        const {
            route: {
                params: { isPlacementSuccessful, placementErrorMessage, isDeclined = false },
            },
        } = this.props;
        if (placementErrorMessage === NETWORK_ERROR_MSG_DESC) {
            return NETWORK_ERROR_MSG_HEADER;
        }
        if (isPlacementSuccessful) {
            return TRANSACTION_SUCCESS;
        } else if (!isPlacementSuccessful && isDeclined) {
            return TRANSACTION_DECLINED;
        } else {
            return TRANSACTION_UNSUCCESS;
        }
    };

    render() {
        const {
            route: {
                params: { isPlacementSuccessful, placementErrorMessage },
            },
        } = this.props;
        return (
            <AcknowledgementScreenTemplate
                isSuccessful={isPlacementSuccessful}
                message={this.renderMessageStatus()}
                detailsData={this._generateSuccessfulPlacementDetails()}
                errorMessage={placementErrorMessage}
                ctaComponents={[
                    isPlacementSuccessful && (
                        <ActionButton
                            key="2"
                            fullWidth
                            onPress={this._navigateToCertificateDetailScreen}
                            borderColor={GREY}
                            borderWidth={1}
                            borderStyle="solid"
                            backgroundColor={WHITE}
                            componentCenter={
                                <Typography
                                    text={VIEW_CERT}
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={18}
                                />
                            }
                        />
                    ),
                    <ActionButton
                        key="1"
                        fullWidth
                        onPress={this._navigateToEntryPoint}
                        componentCenter={
                            <Typography
                                text={DONE}
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={18}
                            />
                        }
                    />,
                ]}
            />
        );
    }
}

export default withModelContext(FDPlacementAcknowledgementScreen);
