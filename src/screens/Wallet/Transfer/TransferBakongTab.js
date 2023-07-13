import PropTypes from "prop-types";
import React from "react";
import { View, StyleSheet } from "react-native";
import DeviceInfo from "react-native-device-info";

import {
    REMITTANCE_OVERSEAS_ACC_LIST,
    REMITTANCE_OVERSEAS_LIST,
    REMITTANCE_OVERSEAS_NTB,
} from "@navigation/navigationConstant";

import { showErrorToast, showInfoToast } from "@components/Toast";
import TransferTabItem from "@components/TransferTabItem";

import { withModelContext } from "@context";

import {
    bankingGetDataMayaM2u,
    bauBakongDateValidation,
    getBakongFavoriteList,
    getDateValidate,
    getOverseasFavoriteList,
} from "@services";
import { GATransfer } from "@services/analytics/analyticsTransfer";

import {
    COMMON_ERROR_MSG,
    OVERSEAS,
    OVERSEAS_DOWN_ERROR,
    OVERSEAS_TRANSFER_DOWN_SUBHEADER, // OVERSEAS_UNAVAILABLE_ERROR,
    REMITTANCE_DOWN,
    WE_FACING_SOME_ISSUE,
} from "@constants/strings";

import { formatBakongMobileNumbers, getDeviceRSAInformation } from "@utils/dataModel/utility";
import {
    getName,
    getProductAvailability,
    getProductState,
    getProductStatus,
    uidGenerator,
    _getBakongCountry,
    _getBakongFavData,
    _getBanksList,
    _getFttFavData,
    _getOldBakongFavData,
    _getRtFavData,
    _getSenderCountryList,
    _getVdFavData,
    _getWuFavData,
} from "@utils/dataModel/utilityRemittance";

import Assets from "@assets";

const OLD_OVERSEAS_TRANSFER = [
    {
        title: "Bakong",
        imageSource: Assets.icBakong,
        key: 1,
    },
];
const NEW_OVERSEAS_TRANSFER = [
    {
        title: OVERSEAS,
        imageSource: Assets.icOverseas,
        key: 2,
    },
];
class TransferBakongTab extends React.Component {
    static propTypes = {
        navigation: PropTypes.object.isRequired,
        index: PropTypes.number.isRequired,
        activeTabIndex: PropTypes.number.isRequired,
        route: PropTypes.object.isRequired,
        toggleSearchMode: PropTypes.func.isRequired,
        getModel: PropTypes.func,
        updateModel: PropTypes.func,
        resetModel: PropTypes.func,
        isEnabled: PropTypes.bool,
    };

    state = {
        favouritesItems: [],
        isLoadingFavouritesItems: true,
        isFavouritesListSuccessfullyFetched: false,
        remittanceEnabled: true,
        remittanceConfigData: {},
        productState: "",
    };

    componentDidMount() {
        if (this._isActivelyShownTab()) this._syncRemoteDataToState();
        this.focusSubscription = this.props.navigation.addListener("focus", () => {
            if (this._isActivelyShownTab()) this._syncRemoteDataToState();
        });
    }

    componentWillUnmount() {
        this.focusSubscription();
    }

    _getTransferFavoriteList = async () => {
        try {
            const request = await getOverseasFavoriteList();
            if (request?.status === 200) return request;
            return null;
        } catch (error) {
            showErrorToast({
                message:
                    error?.error?.status === 500
                        ? WE_FACING_SOME_ISSUE
                        : error?.error?.message ?? COMMON_ERROR_MSG,
            });
        }
        this.setState({
            isLoadingFavouritesItems: false,
        });
    };

    _checkDateValidateBau = async () => {
        try {
            const request = await bauBakongDateValidation();
            console.tron.log("[getDateValidate] response", request);
            if (request?.status === 200 && request?.data?.valid) return request;
            showErrorToast({
                message:
                    request?.data?.statusDescription ??
                    "Unable to proceed with Bakong transfer. Please try again.",
            });
            return null;
        } catch (error) {
            showErrorToast({
                message:
                    error?.error?.statusDescription ??
                    error?.error?.message ??
                    "Unable to proceed with Bakong transfer. Please try again.",
            });
            return null;
        }
    };

    getOldBakongfavs = async () => {
        const resp = await getBakongFavoriteList();
        if (resp?.data) {
            const accountSummary = resp?.data?.favoriteItems ?? [];
            const favouritesItems = accountSummary.map((account, index) => ({
                name: account?.nickName ?? "-",
                image: { imageName: "icBakong" },
                description1:
                    `+855 ${formatBakongMobileNumbers(account?.mobileNum?.substr?.(4))}` ?? "-",
                description2: "Bakong Wallet",
                key: index,
                favFlag: account?.favFalg ?? "",
                responseObject: {
                    ...account,
                },
            }));
            this.setState({
                favouritesItems,
                isFavouritesListSuccessfullyFetched: true,
                isLoadingFavouritesItems: false,
            });
        }
    };

    _handleOldFavouritesTransferItemPressed = async (selectedItemsIndex) => {
        console.log(
            "🚀 ~ file: TransferBakongTab.js ~ line 128 ~ TransferBakongTab ~ selectedFavouritesItems",
            selectedItemsIndex
        );

        GATransfer.selectActionFavList(OVERSEAS, OVERSEAS);

        const response = await this._checkDateValidateBau();
        if (response) {
            const {
                navigation: { navigate },
            } = this.props;

            navigate("BakongEnterMobileNo", {
                transferParams: this._generateBakongTransferParam(selectedItemsIndex),
            });
        }
    };

    _generateBakongTransferParam = (selectedItemsIndex) => {
        const selectedFavouritesItems = this.state.favouritesItems[selectedItemsIndex];
        console.log(
            "🚀 ~ file: TransferBakongTab.js ~ line 128 ~ TransferBakongTab ~ selectedFavouritesItems",
            selectedFavouritesItems
        );

        return {
            favorite: true,
            favFlag: selectedFavouritesItems.responseObject.favFalg,
            id: selectedItemsIndex,
            name: selectedFavouritesItems.responseObject.regName,
            addressCountry: selectedFavouritesItems.responseObject.countryDesc,
            addressCountryCode: selectedFavouritesItems.responseObject.country,
            addressLine1: selectedFavouritesItems.responseObject.address1,
            addressLine2: selectedFavouritesItems.responseObject.address2,
            mobileNo: selectedFavouritesItems.responseObject.mobileNum.replace("+855", ""),
            // mobileNo: "98461655", // TEMPORARY HARDCODED
            recipientIdNumber: selectedFavouritesItems.responseObject.idNum,
            recipientIdType:
                selectedFavouritesItems.responseObject.idType === "1" ? "NID" : "Passport",
            recipientNationality: selectedFavouritesItems.responseObject.nationalityDesc,
            recipientNationalityCode: selectedFavouritesItems.responseObject.nationality,
            transactionTo: "Bakong Wallet",
        };
    };

    _checkDateValidate = async () => {
        try {
            const { deviceInformation, deviceId } = this.props.getModel("device");
            const mobileSDKData = getDeviceRSAInformation(deviceInformation, DeviceInfo, deviceId);
            const response = await getDateValidate();
            if (response?.status === 200 && response?.data?.productActiveInd) {
                const {
                    data: {
                        overseasActiveIndicator,
                        // overseasIndDesc,
                        countryList,
                        countryBankList,
                        senderCountryList,
                        countryStateCityList,
                        productActiveInd,
                        paymentRefNo,
                    },
                } = response;

                const listOfCountries = countryList;
                const listOfBanks = _getBanksList(countryBankList);
                const combinedCountryList = _getSenderCountryList(countryList, senderCountryList);
                const bakongRecipientList = _getBakongCountry(countryList);
                const { showOldBk, showBoth, hideAll } = getProductState(productActiveInd);
                const productStateInd = showOldBk ? "N" : overseasActiveIndicator;
                this.setState(
                    {
                        productState:
                            hideAll || overseasActiveIndicator === ""
                                ? ""
                                : showBoth || overseasActiveIndicator === "A"
                                ? "A"
                                : productStateInd,
                        remittanceConfigData: response?.data,
                    },
                    () => {
                        this.props.updateModel({
                            overseasTransfers: {
                                countryList: listOfCountries?.length
                                    ? [
                                          {
                                              countryFlag: "malaysia_round_icon_64.png",
                                              countryCode: "MY",
                                              countryName: "Malaysia",
                                          },
                                          ...listOfCountries,
                                      ]
                                    : [],
                                countryStateCityList,
                                productsActive: productActiveInd,
                                senderCountryList: combinedCountryList?.length
                                    ? [
                                          {
                                              countryFlag: "malaysia_round_icon_64.png",
                                              countryCode: "MY",
                                              countryName: "Malaysia",
                                          },
                                          ...combinedCountryList,
                                      ]
                                    : [],
                                bakongRecipientList,
                                bankList: listOfBanks?.length
                                    ? [
                                          ...listOfBanks,
                                          { name: "OTHER BANKS", value: "XXXXXXXXXXX" },
                                      ]
                                    : [],
                                paymentRefNo,
                                trxId: uidGenerator("rmt", mobileSDKData),
                            },
                        });
                    }
                );
                return;
            }

            throw Error({
                message:
                    response?.data?.statusDescription ??
                    "Unable to proceed with this request. Please try again.",
            });
        } catch (error) {
            showErrorToast({
                message: error?.message ?? WE_FACING_SOME_ISSUE,
            });
            return null;
        } finally {
            this.initRemittance();
        }
    };

    getAllAccounts = async (showLoader) => {
        try {
            const path = `/summary?type=A&checkMae=true`;

            const response = await bankingGetDataMayaM2u(path, showLoader);

            if (response?.data?.result?.accountListings?.length) {
                const { accountListings } = response?.data?.result;
                return accountListings
                    .filter((account) => {
                        console.info("account: ", account);
                        return !(
                            account?.type === "D" &&
                            (account?.group === "0YD" || account?.group === "CCD")
                        );
                    })
                    .map((accData) => {
                        return {
                            ...accData,
                            selected:
                                accData?.number === this.props.route?.params?.prevData?.number ||
                                accData?.number === this.props.route?.params?.acctNo,
                        };
                    })
                    .sort((a, b) => {
                        if (a?.selected) {
                            return -1;
                        }
                        if (b?.selected) {
                            return 1;
                        }
                        return 0;
                    });
            }
        } catch (error) {
            // error when retrieving the data
            console.info("getAllAccounts error: ", error);
        }
    };

    _overseasTransferPressed = async () => {
        const accList = await this.getAllAccounts(true);

        GATransfer.selectActionNewTransfer(OVERSEAS, OVERSEAS);

        console.info("_overseasTransferPressed accList: ", accList);
        const {
            navigation: { navigate },
        } = this.props;

        const transferParams = {};
        if (!accList.length) {
            navigate(REMITTANCE_OVERSEAS_NTB);
        } else {
            if (this.state.productState === "") {
                showInfoToast({ message: OVERSEAS_DOWN_ERROR });
                return;
            }
            this.props.updateModel({
                overseasTransfers: {
                    ...this.props.getModel("overseasTransfers"),
                    routeFrom: this.props?.entryPoint,
                },
            });
            navigate(REMITTANCE_OVERSEAS_LIST, {
                transferParams,
                accList,
                isInit: true,
            });
        }
    };

    initRemittance = async () => {
        const data = this.state.remittanceConfigData;
        const { showOldBk, showBoth, hideAll } = getProductState(data?.productActiveInd);
        const showOldBakong = showOldBk ? "N" : data?.overseasActiveIndicator;

        const allDown = hideAll || data?.overseasActiveIndicator === "" ? "" : showOldBakong;
        this.setState(
            {
                remittanceEnabled: !hideAll,
                productState: showBoth || data?.overseasActiveIndicator === "A" ? "A" : allDown,
            },
            () => {
                return !hideAll;
            }
        );
    };

    _getFavlist = (result) => {
        const fttFavListItemsVar = result?.overseasTransferItemResponses?.fttFavListItems ?? [];
        const rtFavListItemsVar = result?.overseasTransferItemResponses?.rtFavListItems ?? [];
        const vdFavListItemsVar =
            result?.overseasTransferItemResponses?.visaDirectFavListItems ?? [];
        const wuBeneFavListItemsVar =
            result?.overseasTransferItemResponses?.wuBeneficiaryFavListItems ?? [];
        const bakongFavListItemsVar =
            result?.overseasTransferItemResponses?.bakongFavListItems ?? [];
        const existingBakongFavListItemsVar =
            result?.bakongFavoritesInqRes?.statusCode === "0000"
                ? result?.bakongFavoritesInqRes?.favoriteItems
                : [];

        /* All product favs(M2U DB) */
        const fttFavouritesItems = _getFttFavData(fttFavListItemsVar);
        const rtFavouritesItems = _getRtFavData(rtFavListItemsVar);
        const wuFavouritesItems = _getWuFavData(wuBeneFavListItemsVar);
        const vdFavouritesItems = _getVdFavData(vdFavListItemsVar);
        const bakongFavouritesItems = _getBakongFavData(bakongFavListItemsVar);

        /* Old Bakong favs(CICS) - Pre remittance */
        const oldBakongFavouritesItems =
            existingBakongFavListItemsVar?.length > 0
                ? _getOldBakongFavData(existingBakongFavListItemsVar, bakongFavouritesItems)
                : [];

        return fttFavouritesItems.concat(
            rtFavouritesItems,
            wuFavouritesItems,
            vdFavouritesItems,
            bakongFavouritesItems,
            oldBakongFavouritesItems
        );
    };

    _syncRemoteDataToState = async () => {
        try {
            await this._checkDateValidate();
            this.initRemittance();
            if (this.state.productState === "N") {
                this.getOldBakongfavs();
                return;
            }
            const response = await this._getTransferFavoriteList();
            console.log("api fav list - ", response?.data?.result);
            if (response?.data?.result) {
                const favouritesItems = this._getFavlist(response?.data?.result);
                const favRemittanceBeneficiaries = favouritesItems?.length
                    ? favouritesItems.map((favItem) => {
                          return favItem?.name?.toLowerCase();
                      })
                    : [];
                console.log("api [_syncRemoteDataToState] favouritesItems: ", favouritesItems);
                this.setState(
                    {
                        favouritesItems,
                        isFavouritesListSuccessfullyFetched: true,
                        isLoadingFavouritesItems: false,
                    },
                    () => {
                        this.resetModal(favRemittanceBeneficiaries);
                    }
                );
            }
        } catch (ex) {
            showErrorToast({ message: ex?.message ?? REMITTANCE_DOWN });
        }
    };

    resetModal = (favRemittanceBeneficiaries) => {
        const {
            countryList,
            senderCountryList,
            selectedCountry,
            countryStateCityList,
            bankList,
            productsActive,
            bakongRecipientList,
            trxId,
            paymentRefNo,
        } = this.props.getModel("overseasTransfers");
        this.props.resetModel(["overseasTransfers"]);
        this.props.updateModel({
            overseasTransfers: {
                favRemittanceBeneficiaries,
                countryList,
                senderCountryList,
                countryStateCityList,
                bankList,
                productsActive,
                bakongRecipientList,
                trxId,
                paymentRefNo,
                selectedCountry,
            },
        });
    };
    _isActivelyShownTab = () => this.props.index === this.props.activeTabIndex;

    _handleNewTransferConfirmation = async (selectedItemsIndex) => {
        if (this.state.remittanceConfigData) {
            const {
                navigation: { navigate },
            } = this.props;

            const transferParams = {};

            switch (selectedItemsIndex) {
                case 1:
                    navigate("BakongEnterMobileNo", {
                        transferParams,
                    });
                    break;
                case 2:
                    this._overseasTransferPressed();
                    break;
                default:
                    return;
            }
        }
    };

    _proceedWithFavFlow = (
        productNotAvailable,
        countryList,
        selectedItem,
        accList,
        prodType,
        isProductDown,
        isProductDownMsg
    ) => {
        console.tron.log("[Overseas _proceedWithFavFlow] - ", selectedItem);
        try {
            if (selectedItem?.responseObject?.beneInfo?.beneReceiverMode == "CIA") {
                showInfoToast({
                    message: prodType
                        ? `Sorry, ${prodType} transfer (credit to account) is not yet available on MAE App. Please proceed via M2U web.`
                        : REMITTANCE_DOWN,
                });
                return;
            }
            if (productNotAvailable) {
                showInfoToast({
                    message: prodType
                        ? `${prodType} is currently under maintenance. Please use another transfer service or try again later.`
                        : REMITTANCE_DOWN,
                });
                return;
            }
            if (isProductDown) {
                showInfoToast({
                    message: isProductDownMsg ? isProductDownMsg : REMITTANCE_DOWN,
                });
                return;
            }
            const {
                navigation: { navigate },
                updateModel,
            } = this.props;

            const recipientCountry =
                selectedItem?.responseObject?.transferToCountry ||
                selectedItem?.responseObject?.countryDesc;
            const selectedCountry = countryList.find((item) => {
                if (item?.countryName?.toUpperCase() === recipientCountry?.toUpperCase()) {
                    return item;
                }
            });
            updateModel({
                overseasTransfers: {
                    selectedCountry,
                },
            });

            const transferParams = {
                favTransferItem: selectedItem,
                countryData: selectedCountry,
                favourite: true,
            };

            // this.showLoader(false);
            navigate(REMITTANCE_OVERSEAS_ACC_LIST, {
                transferParams,
                accList,
            });
        } catch (ex) {
            console.tron.log("[Overseas _proceedWithFavFlow] ex - ", ex);
        }
    };

    // showLoader = (show) => {
    //     this.props.updateModel({
    //         ui: {
    //             showLoader: show,
    //         },
    //     });
    // };

    _handleFavouritesTransferItemPressed = async (selectedItemsIndex, selectedItem) => {
        console.log(
            "[TransferOtherAccounts] >> [_handleFavouritesTransferItemPressed] : ",
            selectedItemsIndex
        );
        GATransfer.selectActionFavList(OVERSEAS, OVERSEAS);
        try {
            // this.showLoader(true);
            const accList = await this.getAllAccounts(false);
            const response = this.state?.remittanceConfigData;
            if (response?.productActiveInd) {
                const countryList = response?.countryList;
                const { isProductDown, isProductDownMsg, isProductDisabled } = getProductStatus(
                    response?.productActiveInd,
                    selectedItem?.productType === "Bakong"
                        ? "bk"
                        : selectedItem.productType.toLowerCase()
                );
                this._proceedWithFavFlow(
                    isProductDisabled,
                    countryList,
                    selectedItem,
                    accList,
                    getName(selectedItem?.productType),
                    isProductDown,
                    isProductDownMsg
                );
            }
        } catch (ex) {
            this.showLoader(false);
            showErrorToast({ message: WE_FACING_SOME_ISSUE });
        }
    };

    render() {
        if (this._isActivelyShownTab()) {
            const {
                isLoadingFavouritesItems,
                favouritesItems,
                isFavouritesListSuccessfullyFetched,
            } = this.state;
            const btnlist =
                this.state.productState === "N" ? OLD_OVERSEAS_TRANSFER : NEW_OVERSEAS_TRANSFER;
            return (
                <View style={styles.container}>
                    <TransferTabItem
                        newTransferItems={
                            this.state.productState === "A"
                                ? [...OLD_OVERSEAS_TRANSFER, ...NEW_OVERSEAS_TRANSFER]
                                : btnlist
                        }
                        favouritesItems={favouritesItems}
                        isLoadingFavouritesItems={isLoadingFavouritesItems}
                        isFavouritesListSuccessfullyFetched={isFavouritesListSuccessfullyFetched}
                        onNewTransferButtonPressed={this._handleNewTransferConfirmation}
                        onFavouritesItemPressed={
                            this.state.productState === "N"
                                ? this._handleOldFavouritesTransferItemPressed
                                : this._handleFavouritesTransferItemPressed
                        }
                        toggledSearchMode={this.props.toggleSearchMode}
                        isEnabled={this.state.productState !== "" || this.state.remittanceEnabled}
                        subHeader={OVERSEAS_TRANSFER_DOWN_SUBHEADER}
                    />
                </View>
            );
        }
        return null;
    }
}

export default withModelContext(TransferBakongTab);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
