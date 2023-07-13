import PropTypes from "prop-types";
import React, { Component } from "react";
import { Dimensions, View, StyleSheet } from "react-native";
import DeviceInfo from "react-native-device-info";

import {
    TRANSFER_SELECT_BANK,
    TRANSFER_ENTER_AMOUNT,
    DUITNOW_ENTER_ID,
    REMITTANCE_OVERSEAS_ACC_LIST,
    REMITTANCE_OVERSEAS_NTB,
    REMITTANCE_OVERSEAS_LIST,
} from "@navigation/navigationConstant";

import { showErrorToast, showInfoToast } from "@components/Toast";
import TransferTabItem from "@components/TransferTabItem";

import { withModelContext } from "@context";

import { GATransfer } from "@services/analytics/analyticsTransfer";
import {
    getGenericFavoritesList,
    getDateValidate,
    bankingGetDataMayaM2u,
    getOverseasFavoriteList,
} from "@services/index";

import { MBB_BANK_SWIFT_CODE, MBB_BANK_CODE_MAYBANK } from "@constants/fundConstants";
import {
    OTHERS,
    BANKS,
    DUITNOW,
    AMOUNT_ERROR,
    ENTER_AMOUNT,
    TRANSFER,
    OWN_ACCOUNT_TRANSFER,
    THIRD_PARTY_TRANSFER,
    DUITNOW_INSTANT_TRANSFER,
    OVERSEAS_TAB,
    WE_FACING_SOME_ISSUE,
    COMMON_ERROR_MSG,
    REMITTANCE_DOWN,
} from "@constants/strings";

import { formateAccountNumber, getDeviceRSAInformation } from "@utils/dataModel/utility";
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

export const { width, height } = Dimensions.get("window");

class TransferOtherAccounts extends Component {
    static navigationOptions = { title: "", header: null };
    static propTypes = {
        navigation: PropTypes.object.isRequired,
        index: PropTypes.number.isRequired,
        activeTabIndex: PropTypes.number.isRequired,
        toggleSearchMode: PropTypes.func.isRequired,
        updateModel: PropTypes.func,
        resetModel: PropTypes.func,
        getModel: PropTypes.func,
        data: PropTypes.object,
        fromAccount: PropTypes.string,
        onOverseasDown: PropTypes.func,
        screenDate: PropTypes.object,
    };

    state = {
        accounts: [],
        fromAccount: "",
        screenDate: {},
        accountsFullList: [],
        isLoadingFavouritesItems: true,
        isFavouritesListSuccessfullyFetched: false,
        productState: "Y",
    };

    /***
     * componentDidMount
     * Update Screen date
     */
    componentDidMount() {
        console.log("[TransferOtherAccounts] >> [componentDidMount] : ");
        this._updateDataInScreen();

        const { activeTabIndex, index } = this.props;
        const { accountsFullList } = this.state;

        // Render if first tab
        if (activeTabIndex === index) {
            console.log("Render tab: " + index);
            if (accountsFullList.length === 0) {
                this.getInitData();
            }
        }
    }

    /***
     * componentWillReceiveProps
     * Handle every new Props received event
     */
    componentDidUpdate(nextProps) {
        console.log("[TransferOtherAccounts] >> [componentWillReceiveProps] : ");
        // to handle triggering API + rendering only when tab is visible
        if (this.props.activeTabIndex !== nextProps.activeTabIndex) {
            if (nextProps.activeTabIndex === this.props.index) {
                //render view
                console.log("trigger render tab: " + nextProps.activeTabIndex);
                if (this.state.accountsFullList.length === 0) {
                    this.getInitData();
                }
            }
        }
    }

    /***
     * _updateDataInScreen
     * Handle one time screen load
     */
    _updateDataInScreen = () => {
        console.log(
            "[TransferOtherAccounts] >> [TransferDuitNowFavScreen] _updateDataInScreen ==> "
        );
        const { fromAccount, screenDate } = this.props;
        this.setState({ fromAccount, screenDate });
    };

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
            this.setState({
                isLoadingFavouritesItems: false,
            });
            return null;
        }
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
    /***
     * getGenericFavoritesListApi
     * get Generic Favorites List Api call for Transfer
     */
    getGenericFavoritesListApi = async (hideRemittance) => {
        try {
            console.log("[TransferOtherAccounts] >> [getGenericFavoritesListApi] : ");
            /*Get Favorite List*/
            console.log("getGenericFavoritesListApi");
            const subUrl = "/favorites/list?indicator=FUND_TRANSFER";
            const response = await getGenericFavoritesList(subUrl);
            const result = response?.data;
            console.log("/favorites/list?indicator=FUND_TRANSFER favoriteList ==> ", result);
            if (result?.length > 0) {
                const filteredList = result.map((accountItem, index) => {
                    const { accountName = "", acquirerId, bank = "" } = accountItem ?? {};
                    const account = accountItem?.accountNo;
                    const accountNumber =
                        accountItem?.swiftCode === MBB_BANK_SWIFT_CODE
                            ? formateAccountNumber(account.substring(0, 12))
                            : formateAccountNumber(account.substring(0, account?.length));
                    return {
                        ...accountItem,
                        id: index,
                        accountName,
                        accountNo: account,
                        acquirerId,
                        bank,
                        bankName: accountItem?.bankName,
                        duitnow: accountItem?.duitnow,
                        fundTransfer: accountItem?.fundTransfer,
                        idType: accountItem?.idType,
                        nickName: accountItem?.nickName,
                        tacIndicator: accountItem?.tacIndicator,
                        paymentType: accountItem?.paymentType,
                        interbankPaymentType: accountItem?.paymentType,
                        swiftCode: accountItem?.swiftCode,
                        validationBit: accountItem?.tacIndicator,
                        number: accountItem?.acctNumber,
                        acctNumber: accountItem?.acctNumber,
                        formattedToAccount: accountNumber
                            ? accountNumber
                                  .replace(/[^\dA-Z]/g, "")
                                  .replace(/(.{4})/g, "$1 ")
                                  .trim()
                            : "",
                        name: accountItem?.accountName,
                        description1: accountNumber,
                        description2: accountItem?.bankName,
                        image: {
                            image: accountItem?.imageUrl,
                            imageName: accountItem?.imageName,
                            imageUrl: accountItem?.imageUrl,
                            shortName: accountItem?.accountName,
                            type: true,
                        },
                        imageUrl: accountItem?.imageUrl,
                        imageName: accountItem?.imageName,
                        accountType: "casa",
                        bankCode: accountItem?.bank,
                    };
                });
                console.log("Favourite List ", filteredList);
                this.setState({
                    accounts: filteredList,
                    accountsFullList: filteredList,
                    isFavouritesListSuccessfullyFetched: true,
                    isLoadingFavouritesItems: false,
                });
            } else {
                this.setState({
                    // getListCalled: true,
                    isLoadingFavouritesItems: false,
                    isFavouritesListSuccessfullyFetched: response?.status === 200,
                });
            }
        } catch (error) {
            this.setState({
                // getListCalled: true,
                isLoadingFavouritesItems: false,
                isFavouritesListSuccessfullyFetched: false,
            });
        }
    };
    /*
    getOverseasFavs = async (filteredList) => {
        const response = await this._getTransferFavoriteList();
        if (response?.data?.result) {
            const favouritesItems = this._getFavlist(response?.data?.result);
            const favRemittanceBeneficiaries = favouritesItems?.length
                ? favouritesItems.map((favItem) => {
                    return favItem?.name?.toLowerCase();
                })
                : [];
            this.setState(
                {
                    accounts: filteredList?.length
                        ? [...filteredList, ...favouritesItems]
                        : [...favouritesItems],
                    accountsFullList: filteredList,
                    isFavouritesListSuccessfullyFetched: true,
                    isLoadingFavouritesItems: false,
                },
                () => {
                    const {
                        countryList,
                        senderCountryList,
                        countryStateCityList,
                        bankList,
                        productsActive,
                        bakongRecipientList,
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
                        },
                    });
                }
            );
        }
    };
*/
    /**
     *_onNewTransferClick
     * on New Transfer Click
     */
    _onNewTransferClick = () => {
        console.log("[TransferOtherAccounts] >> [_onNewTransferClick] : ");
        const { screenDate } = this.state;
        const routeFrom = screenDate?.routeFrom ?? "Dashboard";
        console.log("[TransferOtherAccounts] >> [_onNewTransferClick] routeFrom : ", routeFrom);
        const transferParams = {
            transferFlow: 3,
            transferTypeName: "Third Party Transfer",
            isMaybankTransfer: true,
            accountName: "",
            fromAccount: this.state.fromAccount,
            fromAccountCode: "",
            fromAccountName: "",
            toAccount: "",
            formattedToAccount: "",
            image: "",
            bankName: "Maybank",
            amount: "0.00",
            formattedAmount: "0.00",
            reference: "",
            minAmount: 0.0,
            maxAmount: 999999.99,
            amountError: AMOUNT_ERROR,
            screenLabel: ENTER_AMOUNT,
            screenTitle: TRANSFER,
            receiptTitle: OWN_ACCOUNT_TRANSFER,
            recipientName: "",
            transactionDate: "",
            transactionStartDate: "",
            transactionEndDate: "",
            isRecurringTransfer: false,
            isFutureTransfer: false,
            toAccountBank: "Maybank",
            formattedFromAccount: "",
            transferType: null,
            transferSubType: null,
            twoFAType: null,
            mbbbankCode: null,
            swiftCode: null,
            routeFrom,
            endDateInt: 0,
            startDateInt: 0,
            transactionResponseError: "",
            prevData: this.props?.data ?? {},
            activeTabIndex: 1,
        };
        console.log(
            "[TransferOtherAccounts] >> [_onNewTransferClick] NewTransfer transferParams ==> ",
            transferParams
        );
        this.props.navigation.navigate(TRANSFER_SELECT_BANK, {
            transferParams,
        });
    };

    /***
     * _onAccountListClick
     *  handle on Account List Click
     */
    _onAccountListClick = (_, item) => {
        console.tron.log("[TransferOtherAccounts] >> [_onAccountListClick] : ", _, item);
        if (item?.productType) {
            this?._handleFavouritesTransferItemPressed(_, item);
            return;
        }
        GATransfer.selectActionFavList("Others", "Banks");
        console.log("[TransferOtherAccounts] >> [_onAccountListClick] : ");
        /*_onAccountListClick*/
        const { screenDate } = this.state;
        const routeFrom = screenDate?.routeFrom ?? "Dashboard";
        console.log("[TransferOtherAccounts] >> [_onAccountListClick] routeFrom : ", routeFrom);

        if (item) {
            const toAccount = item?.accountNo;
            const formattedToAccount = item?.formattedToAccount;
            const transferAuthenticateRequired = item?.validationBit === "1" ? true : false;
            const transferParams = {
                ...item,
                transferFlow: 2,
                favorite: true,
                transferTypeName: "Third Party Transfer",
                isMaybankTransfer: true,
                accountName: item?.accountName,
                fullName: "",
                accounts: toAccount,
                fromAccount: this.state.fromAccount,
                fromAccountCode: "",
                fromAccountName: "",
                toAccount,
                toAccountCode: item?.acquirerId,
                formattedToAccount,
                image: item?.image,
                amount: "0.00",
                formattedAmount: "0.00",
                reference: "",
                paymentType: item?.paymentType,
                interbankPaymentType: item?.paymentType,
                bankName: item?.bankName,
                toAccountBank: item?.bankName,
                bankCode: item?.bank,
                aquirerId: item?.acquirerId,
                validationBit: item?.validationBit,
                swiftCode: item?.swiftCode,
                isSecure2uRegisterFlow: true,
                transferAuthenticateRequired,
                addingFavouriteFlow: false,
                receiptTitle: THIRD_PARTY_TRANSFER,
                recipientName: item?.accountName,
                transactionDate: "",
                transactionStartDate: "",
                transactionEndDate: "",
                isFutureTransfer: false,
                isRecurringTransfer: false,
                formattedFromAccount: "",
                transferType: null,
                transferSubType: null,
                twoFAType: null,
                mbbbankCode: null,
                routeFrom,
                endDateInt: 0,
                startDateInt: 0,
                transactionResponseError: "",
                transferFav: true,
                transferMaybank: true,
                favouriteIndicator: item?.favouriteIndicator,
                prevData: this.props?.data ?? {},
                activeTabIndex: 1,
            };
            console.log(
                "[TransferOtherAccounts] >> [_onAccountListClick] Fav transferParams ==> ",
                transferParams
            );
            const newTransferParams =
                item?.bank && item?.bank.toLowerCase() === MBB_BANK_CODE_MAYBANK.toLowerCase()
                    ? {
                          ...transferParams,
                          isMaybankTransfer: true,
                          transferMaybank: true,
                          receiptTitle: THIRD_PARTY_TRANSFER,
                          functionsCode: transferAuthenticateRequired ? 6 : 2,
                      }
                    : {
                          ...transferParams,
                          transferFlow: 5,
                          isMaybankTransfer: false,
                          transferMaybank: false,
                          transferTypeName: "Interbank Transfer",
                          ibftFavouriteTransfer: true,
                          receiptTitle: DUITNOW_INSTANT_TRANSFER,
                          functionsCode: transferAuthenticateRequired ? 7 : 5,
                      };

            console.log(
                "[TransferOtherAccounts] >> [_onAccountListClick] newTransferParams ==> ",
                newTransferParams
            );

            this.props.navigation.navigate(TRANSFER_ENTER_AMOUNT, {
                transferParams: newTransferParams,
            });
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
            if (selectedItem?.responseObject?.beneInfo?.beneReceiverMode === "CIA") {
                showInfoToast({
                    message: prodType
                        ? `Sorry, ${prodType} transfer (credit to account) is not yet available on MAE App. Please proceed via M2U Web.`
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
            if (productNotAvailable) {
                showInfoToast({
                    message: prodType
                        ? `${prodType} is currently under maintenance. Please use another transfer service or try again later.`
                        : REMITTANCE_DOWN,
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

            this.showLoader(false);
            navigate(REMITTANCE_OVERSEAS_ACC_LIST, {
                transferParams,
                accList,
            });
        } catch (ex) {
            console.tron.log("[Overseas _proceedWithFavFlow] ex - ", ex);
            showErrorToast({ message: WE_FACING_SOME_ISSUE });
        }
    };

    showLoader = (show) => {
        this.props.updateModel({
            ui: {
                showLoader: show,
            },
        });
    };

    getInitData = async () => {
        const response = await this._checkDateValidate();
        this.setState(
            {
                remittanceConfigData: response?.data,
            },
            () => {
                this.getGenericFavoritesListApi();
            }
        );
    };

    _handleFavouritesTransferItemPressed = async (selectedItemsIndex, selectedItem) => {
        console.log(
            "[TransferOtherAccounts] >> [_handleFavouritesTransferItemPressed] : ",
            selectedItemsIndex
        );
        try {
            this.showLoader(true);
            const accList = await this.getAllAccounts(false);
            if (this.state.remittanceConfigData?.productActiveInd) {
                const {
                    remittanceConfigData: { productActiveInd, countryList },
                } = this.state;
                const { isProductDown, isProductDownMsg, isProductDisabled } = getProductStatus(
                    productActiveInd,
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

    /***
     * _duitNowOpenClick
     * duit Now Open Click
     */
    _duitNowOpenClick = () => {
        console.log("[TransferOtherAccounts] >> [_duitNowOpenClick] : ");
        const { screenDate, fromAccount } = this.state;
        const routeFrom = screenDate?.routeFrom ?? "Dashboard";
        console.log("_duitNowOpenClick routeFrom : ", routeFrom);
        const transferParams = {
            transferFlow: 12,
            transferTypeName: "Duit Now",
            transactionMode: "Duit Now",
            isMaybankTransfer: false,
            transferRetrievalRefNo: "",
            transferProxyRefNo: "",
            transferRegRefNo: "",
            transferAccType: "",
            transferBankCode: "",
            accountName: "",
            transferBankName: "",
            transferAccHolderName: "",
            transferLimitInd: "",
            transferMaybank: "",
            transferOtherBank: "",
            transferAccNumber: "",
            formattedToAccount: "",
            idType: "",
            idTypeText: "",
            image: Assets.icDuitNowCircle,
            bankName: "",
            imageBase64: false,
            amount: "0.00",
            formattedAmount: "0.00",
            reference: "",
            minAmount: 0.0,
            maxAmount: 999999.99,
            amountError: AMOUNT_ERROR,
            screenLabel: ENTER_AMOUNT,
            screenTitle: DUITNOW,
            fromAccount,
            fromAccountCode: "",
            fromAccountName: "",
            toAccount: "",
            receiptTitle: DUITNOW,
            recipientName: "",
            transactionDate: "",
            transactionStartDate: "",
            transactionEndDate: "",
            isRecurringTransfer: false,
            isFutureTransfer: false,
            toAccountBank: "",
            formattedFromAccount: "",
            transferType: null,
            transferSubType: null,
            twoFAType: null,
            mbbbankCode: null,
            swiftCode: null,
            routeFrom,
            endDateInt: 0,
            startDateInt: 0,
            transactionResponseError: "",
            transferFav: false,
            selectedIDTypeIndex: 0,
            prevData: this.props?.data ?? {},
            activeTabIndex: 1,
        };
        console.log(
            "[TransferOtherAccounts] >> [_duitNowOpenClick] transferParams ",
            transferParams
        );
        this.props.navigation.navigate(DUITNOW_ENTER_ID, {
            transferParams,
        });
    };

    getAllAccounts = async () => {
        try {
            const path = `/summary?type=A&checkMae=true`;
            const response = await bankingGetDataMayaM2u(path, true);
            if (response?.data?.code === 0) {
                const { accountListings } = response.data.result;

                if (accountListings?.length) {
                    const newAccountList = accountListings.filter((account) => {
                        console.info("account: ", account);
                        return !(
                            account?.type === "D" &&
                            (account?.group === "0YD" || account?.group === "CCD")
                        );
                    });
                    console.info("getAllAccounts: ", newAccountList);
                    console.info("getAllAccounts length: ", newAccountList?.length);
                    return newAccountList && newAccountList?.length > 0 ? newAccountList : [];
                }
            }
        } catch (error) {
            showErrorToast({ message: WE_FACING_SOME_ISSUE });
        }
    };

    _overseasTransferPressed = async () => {
        const response = this.state.remittanceConfigData;
        const accList = await this.getAllAccounts();
        if (response?.productActiveInd) {
            const { hideAll } = getProductState(response?.productActiveInd);
            if (hideAll && this.props?.onOverseasDown) {
                this.props.onOverseasDown();
                return;
            }
            const {
                navigation: { navigate },
            } = this.props;

            if (!accList?.length) {
                navigate(REMITTANCE_OVERSEAS_NTB);
                return;
            }

            const transferParams = {};

            navigate(REMITTANCE_OVERSEAS_LIST, {
                transferParams,
                accList,
                isInit: true,
            });
        }
    };

    _checkDateValidate = async () => {
        try {
            const { deviceInformation, deviceId } = this.props.getModel("device");
            const mobileSDKData = getDeviceRSAInformation(deviceInformation, DeviceInfo, deviceId);
            const response = await getDateValidate();
            console.tron.log(" api [getDateValidate] response", response);
            if (response?.status === 200) {
                const {
                    countryList,
                    countryBankList,
                    senderCountryList,
                    countryStateCityList,
                    productActiveInd,
                    overseasActiveIndicator,
                } = response?.data;
                const { showOldBk, showBoth, hideAll } = getProductState(productActiveInd);

                const productStateInd = showOldBk ? "N" : overseasActiveIndicator;
                const prodState =
                    hideAll || overseasActiveIndicator === ""
                        ? ""
                        : showBoth || overseasActiveIndicator === "A"
                        ? "A"
                        : productStateInd;
                this.setState({
                    productState: prodState,
                });
                const listOfBanks = _getBanksList(countryBankList);
                const combinedCountryList = _getSenderCountryList(countryList, senderCountryList);
                const bakongRecipientList = _getBakongCountry(countryList);
                this.props.updateModel({
                    overseasTransfers: {
                        countryList: [
                            {
                                countryFlag: "malaysia_round_icon_64.png",
                                countryCode: "MY",
                                countryName: "Malaysia",
                            },
                            ...countryList,
                        ],
                        countryStateCityList,
                        productsActive: productActiveInd,
                        senderCountryList: [
                            {
                                countryFlag: "malaysia_round_icon_64.png",
                                countryCode: "MY",
                                countryName: "Malaysia",
                            },
                            ...combinedCountryList,
                        ],
                        bakongRecipientList,
                        bankList: [...listOfBanks, { name: "OTHER BANKS", value: "XXXXXXXXXXX" }],
                        trxId: uidGenerator("rmt", mobileSDKData),
                    },
                });
                return response;
            }
            showErrorToast({
                message:
                    response?.data?.statusDescription ??
                    "Unable to proceed with this request. Please try again.",
            });
            return null;
        } catch (error) {
            showErrorToast({
                message:
                    error?.error?.statusDescription ??
                    error?.error?.message ??
                    "Unable to proceed with this request. Please try again.",
            });
            return null;
        }
    };

    _checkSelectedTransferType = (key) => {
        switch (key) {
            case 1:
                GATransfer.selectActionNewTransfer("Others", "Banks");
                this._onNewTransferClick();
                break;
            case 2:
                GATransfer.selectActionNewTransfer("Others", "Others");
                this._duitNowOpenClick();
                break;
            case 3:
                GATransfer.selectActionNewTransfer("Others", "Overseas");
                this._overseasTransferPressed();
                break;
            default:
                return;
        }
    };

    render() {
        const { isLoadingFavouritesItems, isFavouritesListSuccessfullyFetched, accounts } =
            this.state;
        const showRemittanceIcon = !(
            this.state.productState === "" || this.state.productState === "N"
        );
        const NEW_TRANSFER_ITEMS = showRemittanceIcon
            ? [
                  {
                      title: BANKS,
                      imageSource: Assets.icInstant,
                      key: 1,
                  },
                  {
                      title: OTHERS,
                      imageSource: Assets.icDuitNow,
                      key: 2,
                  },
                  {
                      title: OVERSEAS_TAB,
                      imageSource: Assets.icOverseas,
                      key: 3,
                  },
              ]
            : [
                  {
                      title: BANKS,
                      imageSource: Assets.icInstant,
                      key: 1,
                  },
                  {
                      title: OTHERS,
                      imageSource: Assets.icDuitNow,
                      key: 2,
                  },
              ];

        return (
            <View style={styles.container}>
                <TransferTabItem
                    newTransferItems={NEW_TRANSFER_ITEMS}
                    favouritesItems={accounts}
                    isLoadingFavouritesItems={isLoadingFavouritesItems}
                    isFavouritesListSuccessfullyFetched={isFavouritesListSuccessfullyFetched}
                    onNewTransferButtonPressed={this._checkSelectedTransferType}
                    onFavouritesItemPressed={this._onAccountListClick}
                    toggledSearchMode={this.props.toggleSearchMode}
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default withModelContext(TransferOtherAccounts);
