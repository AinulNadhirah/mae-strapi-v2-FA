import PropTypes from "prop-types";
import React from "react";

import { MFCA_DETAILS_SCREEN, WEALTH_ERROR_HANDLING_SCREEN } from "@navigation/navigationConstant";

import InvestmentDetailScreenTemplate from "@components/ScreenTemplates/InvestmentDetailScreenTemplate";

import { bankingGetDataMayaM2u } from "@services";
import { GABankingWealth } from "@services/analytics/analyticsBanking";

import { ErrorLogger } from "@utils/logs";

export default class MFCADetailsScreen extends React.Component {
    static propTypes = {
        navigation: PropTypes.object.isRequired,
        route: PropTypes.object.isRequired,
    };

    state = {
        showLoader: true,
        mfcaDetailsData: [],
        mfcaDetailAccountName: {},
        mfcaDetailAccountBalance: {},
    };

    componentDidMount() {
        this._syncDataToState();
    }

    _syncDataToState = async () => {
        const request = await this._getFCAAccountsData();
        const transformedMFCAData = this._transformFCAAccountsData(request?.data?.mfcaDetail);
        this.setState({
            showLoader: false,
            mfcaDetailsData: transformedMFCAData,
            mfcaDetailAccountName: request?.data?.accountName,
            mfcaDetailAccountBalance: request?.data?.balance,
        });
        if (transformedMFCAData.length) {
            GABankingWealth.viewScreenWealthCardDetails(
                transformedMFCAData[0].key,
                request?.data?.investmentType
            );
        }
    };

    _transformFCAAccountsData = (mfcaData) =>
        mfcaData.map((mfca) => {
            const { currency, value } = mfca;
            return { key: `Foreign Currency - ${currency}`, details: value };
        });

    _getFCAAccountsData = async () => {
        try {
            const {
                route: {
                    params: { accountNumber, investmentType },
                },
            } = this.props;
            const response = await bankingGetDataMayaM2u(
                `/details/investment?acctNo=${accountNumber}&type=${investmentType}`,
                false,
                false
            );

            if (response?.maintenance) {
                this.props.navigation.replace(WEALTH_ERROR_HANDLING_SCREEN, {
                    error: "ScheduledMaintenance",
                });
                return;
            }

            if (response?.status === 200) return response;
            return null;
        } catch (error) {
            if (error?.status === "nonetwork") {
                this.props.navigation.replace(WEALTH_ERROR_HANDLING_SCREEN, {
                    error: "NoConnection",
                    fromPage: MFCA_DETAILS_SCREEN,
                });
            } else {
                this.props.navigation.replace(WEALTH_ERROR_HANDLING_SCREEN, {
                    error: "TechnicalError",
                });
            }
            ErrorLogger(error);
            return null;
        }
    };

    _handleCloseButtonPressed = () => this.props.navigation.goBack();

    logEventSelectActionCurrencyPressed = (index) => {
        GABankingWealth.selectActionCurrencyPressed(
            this.state.mfcaDetailsData[index].key,
        );
    };

    render() {
        const {
            route: {
                params: { accountNumber },
            },
        } = this.props;

        const { showLoader, mfcaDetailsData, mfcaDetailAccountName, mfcaDetailAccountBalance } =
            this.state;

        return (
            <InvestmentDetailScreenTemplate
                accountBalance={mfcaDetailAccountBalance}
                accountName={mfcaDetailAccountName}
                accountNumber={accountNumber}
                onHeaderCloseButtonPressed={this._handleCloseButtonPressed}
                isLoading={showLoader}
                accountData={mfcaDetailsData}
                showDisclaimerTitle={false}
                showBalanceAsterisk={false}
                logEventFunc={this.logEventSelectActionCurrencyPressed}
            />
        );
    }
}
