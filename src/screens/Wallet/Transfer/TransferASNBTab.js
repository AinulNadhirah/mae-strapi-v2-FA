import moment from "moment";
import PropTypes from "prop-types";
import React from "react";
import { View, StyleSheet } from "react-native";

import { BANKINGV2_MODULE, FUNDTRANSFER_MODULE } from "@navigation/navigationConstant";

import { showErrorToast, showInfoToast } from "@components/Toast";
import TransferTabItem from "@components/TransferTabItem";

import { getASNBFavouriteList, checkASNBProductDownTime } from "@services";
import { GATransfer } from "@services/analytics/analyticsTransfer";

import { FA_SCREEN_NAME, FA_TAB_NAME, FA_VIEW_SCREEN, FA_SELECT_ACTION } from "@constants/strings";

import { addSpaceAfter4Chars } from "@utils/dataModel/utility";

import Assets from "@assets";

const NEW_ASNB_TRANSFER = [
    {
        title: "ASNB Transfer",
        imageSource: Assets.asnbTextLogo,
        key: 1,
    },
];
const SCREEN_NAME = "M2U - Transfer";
const TAB_NAME = "ASNB";
export default class TransferASNBTab extends React.Component {
    static propTypes = {
        navigation: PropTypes.object.isRequired,
        index: PropTypes.number.isRequired,
        activeTabIndex: PropTypes.number.isRequired,
        route: PropTypes.object.isRequired,
        updateTime: PropTypes.object.isRequired,
        toggleSearchMode: PropTypes.func.isRequired,
    };

    state = {
        favouritesItems: [],
        isLoadingFavouritesItems: true,
        isFavouritesListSuccessfullyFetched: false,
        isMounted: false,
        asnbDowntime: null,
    };

    componentDidMount() {
        if (this._isActivelyShownTab()) {
            this._syncRemoteDataToState(true);
        }
    }

    componentDidUpdate(prevProps) {
        if (!this._isActivelyShownTab()) return;
        if (
            (moment(this.props.updateTime).diff(prevProps.updateTime, "seconds") > 15 &&
                this.state.isMounted) ||
            this.props.route?.params?.showASNBAccounts
        ) {
            this.props.navigation.setParams({ showASNBAccounts: "" });
            this._syncRemoteDataToState(false);
        }
    }

    _getTransferFavoriteList = async () => {
        try {
            this.setState({
                isLoadingFavouritesItems: true,
            });
            const request = await getASNBFavouriteList();
            if (request?.status === 200) return request;
            return null;
        } catch (error) {
            showErrorToast({
                message: error?.error?.message ?? "",
            });
            this.setState({
                isLoadingFavouritesItems: false,
            });
            return null;
        }
    };

    _checkProductDowntime = async (productName) => {
        try {
            const request = await checkASNBProductDownTime(productName);
            if (request?.status === 200) return request;
            return null;
        } catch (error) {
            showErrorToast({
                message: error?.error?.message ?? "",
            });
            return null;
        }
    };

    _isTransactionPossible = async (selectedItemsIndex) => {
        try {
            const request = await this._checkProductDowntime(
                this.state.favouritesItems[selectedItemsIndex]?.responseObject?.shortName ?? ""
            );
            if (request?.data?.code === 200) return true;
            showErrorToast({ message: request?.data?.message ?? "" });
            return false;
        } catch (error) {
            showErrorToast({ message: error.message ?? "" });
            return false;
        }
    };

    _syncRemoteDataToState = async (flag) => {
        const response = await this._getTransferFavoriteList();

        if (response) {
            const result = response?.data?.result;
            const downtime = result?.downtime;
            const accountSummary = result?.allAccounts?.[0]?.accountSummary ?? [];
            const favAccountList = result?.allAccounts?.[0]?.favList ?? [];
            const asnbConsentFlag =
                result?.asnbConsentEnable === "Y" ? result?.asnbConsentFlag : "11";
            if (flag && asnbConsentFlag !== "11") {
                this.inquireASNB(response?.data?.result);
            }
            const favouritesItems = accountSummary.map((account, index) => ({
                name: account?.beneName ?? "-",
                image: { imageName: "asnbLogo" },
                description1: addSpaceAfter4Chars(account?.membNo ?? "-"),
                description2: account?.fullName ?? "-",
                key: index,
                responseObject: {
                    ...account,
                },
            }));

            const favouritesArray = favAccountList.map((account, index) => ({
                name: account?.beneName ?? "-",
                image: { imageName: "asnbLogo" },
                description1: addSpaceAfter4Chars(account?.membNo ?? "-"),
                description2: account?.fullName ?? "-",
                key: index,
                responseObject: {
                    ...account,
                },
            }));

            this.setState({
                favouritesItems:
                    asnbConsentFlag === "11"
                        ? favouritesItems //Combination of own accounts and fav accounts
                        : favouritesArray
                        ? favouritesArray
                        : [],
                isFavouritesListSuccessfullyFetched: true,
                isLoadingFavouritesItems: false,
                isMounted: true,
                asnbDowntime: downtime,
            });
            this._isASNBDowntime();
        }
    };

    inquireASNB = (result) => {
        const asnbSummaries = result?.allAccounts?.[0] ?? [];
        console.info("asnbSummaries: ", asnbSummaries);
        // const showMinor = asnbSummaries?.minor ?? false;
        // const guardianDetail = asnbSummaries?.guardianDetail;
        const minorDetail = asnbSummaries?.minorDetail;
        const validAsnbAcc = asnbSummaries?.accountSummary.filter((asnbAcc) => {
            return asnbAcc?.acctType === "1";
        });

        if (validAsnbAcc?.length) {
            const asnbAccountData = {
                payeeName: validAsnbAcc[0]?.beneName,
                asnbAccNo: validAsnbAcc[0]?.membNo,
                guardian: validAsnbAcc,
                minor: minorDetail,
                index: this.props.index,
                activeTabIndex: this.props.activeTabIndex,
            };

            this.props.navigation.navigate(BANKINGV2_MODULE, {
                screen: "ASNBConsentScreen",
                params: {
                    origin: FUNDTRANSFER_MODULE,
                    asnbAccountData,
                },
            });
        }

        /* */
    };

    _isActivelyShownTab = () => this.props.index === this.props.activeTabIndex;

    _handleSearchByKeyword = (text) => {
        const searchResultByKeyword = this.state.favouritesArray.filter(
            (item) => text.search(item.name) !== -1
        );
        this.setState({
            favouritesArray: searchResultByKeyword,
        });
    };

    _isASNBDowntime = () => {
        const downtime = this.state.asnbDowntime;
        if (downtime && downtime?.code === 9999) {
            showInfoToast({
                message: downtime?.message,
            });
            return true;
        }
        return false;
    };

    _handleNewTransferConfirmation = (selectedItemsIndex) => {
        if (this._isASNBDowntime()) {
            return;
        }

        GATransfer.selectActionNewTransfer(TAB_NAME, "ASNB Transfer");
        const {
            route: {
                params: { asnbTransferState },
            },
            navigation: { navigate },
        } = this.props;
        if (selectedItemsIndex === 1)
            navigate(FUNDTRANSFER_MODULE, {
                screen: "ASNBNewTransferDetailsScreen",
                params: {
                    asnbTransferState,
                },
            });
    };

    _generateASNBTransferParam = (selectedItemsIndex) => {
        const selectedFavouritesItems = this.state.favouritesItems[selectedItemsIndex];
        const {
            route: {
                params: { asnbTransferState },
            },
        } = this.props;
        return {
            beneficiaryName: selectedFavouritesItems?.responseObject?.beneName ?? "N/A",
            isNewTransfer: false,
            isOwnAccountTransfer: selectedFavouritesItems?.responseObject?.acctType === "1",
            acctType: selectedFavouritesItems?.responseObject?.acctType ?? "",
            productDetail: {
                name: selectedFavouritesItems?.responseObject?.fullName ?? "N/A",
                value: selectedFavouritesItems?.responseObject?.fullName ?? 0,
                payeeCode: selectedFavouritesItems?.responseObject?.payeeCode ?? "",
            },
            idTypeDetail: {
                name: selectedFavouritesItems?.responseObject?.idType ?? "N/A",
                value: selectedFavouritesItems?.responseObject?.idType ?? 0,
            },
            relationshipDetail: {
                name: selectedFavouritesItems?.responseObject?.realationship ?? "N/A",
                value: selectedFavouritesItems?.responseObject?.realationship ?? 0,
            },
            purposeOfTransferDetail: {
                name: selectedFavouritesItems?.responseObject?.purpose ?? "N/A",
                value: selectedFavouritesItems?.responseObject?.purpose ?? 0,
            },
            idNumberValue: selectedFavouritesItems.responseObject.idNo,
            membershipNumberValue: selectedFavouritesItems.responseObject.membNo,
            ...(asnbTransferState?.selectedCASAAccountNumber && {
                selectedCASAAccountNumber: asnbTransferState.selectedCASAAccountNumber,
            }),
        };
    };

    _handleFavouritesTransferItemPressed = async (selectedItemsIndex) => {
        GATransfer.selectActionFavList(TAB_NAME, "ASNB Transfer");

        if (this._isASNBDowntime()) {
            return;
        }
        if (!(await this._isTransactionPossible(selectedItemsIndex))) return;
        const {
            navigation: { navigate },
        } = this.props;
        if (this.state.favouritesItems[selectedItemsIndex]?.responseObject?.acctType === "1")
            navigate(FUNDTRANSFER_MODULE, {
                screen: "ASNBTransferAmountScreen",
                params: {
                    asnbTransferState: this._generateASNBTransferParam(selectedItemsIndex),
                },
            });
        else
            navigate(FUNDTRANSFER_MODULE, {
                screen: "ASNBFavouriteTransferDetailsScreen",
                params: {
                    asnbTransferState: this._generateASNBTransferParam(selectedItemsIndex),
                },
            });
    };

    render() {
        if (this._isActivelyShownTab()) {
            const {
                isLoadingFavouritesItems,
                favouritesItems,
                isFavouritesListSuccessfullyFetched,
            } = this.state;

            return (
                <View style={styles.container}>
                    <TransferTabItem
                        newTransferItems={NEW_ASNB_TRANSFER}
                        favouritesItems={favouritesItems}
                        isLoadingFavouritesItems={isLoadingFavouritesItems}
                        isFavouritesListSuccessfullyFetched={isFavouritesListSuccessfullyFetched}
                        onNewTransferButtonPressed={this._handleNewTransferConfirmation}
                        onFavouritesItemPressed={this._handleFavouritesTransferItemPressed}
                        toggledSearchMode={this.props.toggleSearchMode}
                    />
                </View>
            );
        }
        return null;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
