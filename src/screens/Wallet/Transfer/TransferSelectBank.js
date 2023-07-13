import React, { Component } from "react";
import { View, ScrollView } from "react-native";

import { TRANSFER_ENTER_ACCOUNT } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import BankList from "@components/Others/BankList";
import SearchInput from "@components/SearchInput";
import Typo from "@components/Text";

import { getBanksListApi } from "@services/index";

import { MEDIUM_GREY } from "@constants/colors";
import { MBB_BANK_CODE } from "@constants/fundConstants";
import {
    TRANSFER_TO,
    NO_RESULT_FOUND,
    WE_COULDNT_FIND_ANY_ITEMS_MATCHING,
    THIRD_PARTY_TRANSFER,
    DUITNOW_INSTANT_TRANSFER,
    TRANSFER_TO_HEADER,
} from "@constants/strings";

import { arraySearchByObjProp } from "@utils/array";

import Styles from "@styles/Wallet/TransferEnterAmountStyle";

("use strict");

class TransferSelectBank extends Component {
    static navigationOptions = { title: "", header: null };

    /***
     * constructor
     * props
     */
    constructor(props) {
        super(props);
        this.state = {
            amountText: "00.0",
            mbbBanksList: [],
            fullListBanksList: [],
            loader: false,
            showSearchInput: false,
            screenData: {
                image: "",
                name: "",
                description1: "",
                description2: "",
            },
            transferParams: {},
            searchInputText: "",
            getListCalled: false,
        };
    }

    /***
     * componentDidMount
     * Update Screen date
     */
    async componentDidMount() {
        console.log("[TransferSelectBank] >> [componentDidMount] : ");
        this._updateDataInScreen();
        this.getBanksListsApi();
        this.setState({
            loader: false,
            dataAvailable: false,
        });
    }

    /***
     * componentWillUnmount
     * Handle Screen UnMount Event
     */
    componentWillUnmount() {
        console.log("[TransferSelectBank] >> [componentWillUnmount] : ");
    }

    /***
     * _updateDataInScreen
     * Handle one time screen load
     */
    _updateDataInScreen = async () => {
        console.log("[TransferSelectBank] >> [_updateDataInScreen] : ");
        const transferParams = this.props.route.params?.transferParams ?? this.state.screenData;
        console.log(
            "[[TransferSelectBank] >> [_updateDataInScreen] transferParams : ",
            transferParams
        );

        console.log("updateData ==> ", transferParams);
        const screenData = {
            image: transferParams.image,
            name: transferParams.formattedToAccount,
            description1: transferParams.accountName,
            description2: transferParams.bankName,
        };
        this.setState({
            transferParams: transferParams,
            screenData: screenData,
        });
    };

    /***
     * getBanksListsApi
     * get Banks Lists Api call
     */
    getBanksListsApi = async () => {
        console.log("[TransferSelectBank] >> [getBanksListsApi] : ");
        /*Get Favorite List*/
        console.log("fetchFavoriteListData");
        getBanksListApi()
            .then(async (response) => {
                const result = response.data;
                console.log("[TransferSelectBank] >> [getBanksListsApi] result ==> ", result);
                if (result != null) {
                    let { resultList } = result;
                    if (result != null) {
                        const bankList = resultList.map((bank) => ({
                            ...bank,
                            imageBase64: bank.image,
                            image: {
                                imageName: bank.imageName,
                                image: bank.imageName,
                                imageUrl: bank.imageUrl,
                                shortName: bank.bankName,
                                type: true,
                            },
                        }));

                        // for (let i = 0; i < resultList.length; i++) {
                        //     let obj = resultList[i];
                        //     obj.imageBase64 = obj.image;
                        //     obj.image = {
                        //         imageName: obj.imageName,
                        //         image: obj.imageName,
                        //         imageUrl: obj.imageUrl,
                        //         shortName: obj.bankName,
                        //         type: true,
                        //     };

                        //     resultList[i];
                        // }

                        console.log(
                            "[TransferSelectBank] >> [getBanksListsApi] mbbBanksList List ",
                            bankList
                        );
                        this.setState({
                            mbbBanksList: bankList,
                            fullListBanksList: bankList,
                            getListCalled: true,
                        });
                    }
                }
            })
            .catch((Error) => {
                console.log("[TransferSelectBank] >> [getBanksListsApi] ERROR: ", Error);
            });
    };

    /***
     * _onBankItemClick
     * On bank list item click event
     */
    _onBankItemClick = (item) => {
        console.log("[TransferSelectBank] >> [_onBankItemClick] item ==> ", item);
        let transferParams = {};
        let transferParamsPrevious = this.state.transferParams;
        console.log(
            "[TransferSelectBank] >> [_onBankItemClick] transferParams ==> ",
            transferParamsPrevious
        );
        console.log(
            "[TransferSelectBank] >> [_onBankItemClick] transferParamsPrevious.prevData==> ",
            transferParamsPrevious.prevData
        );
        const prevData = transferParamsPrevious.prevData;
        console.log(
            "[TransferSelectBank] >> [_onBankItemClick] bankCode   ==> " +
                item.bankCode +
                "  bankCode   ==> " +
                item.bankCode
        );
        console.log("[TransferSelectBank] >> [_onBankItemClick] aquirerId   ==> " + item.aquirerId);
        console.log("[TransferSelectBank] >> [_onBankItemClick] swiftCode   ==> " + item.swiftCode);
        if (item.bankCode === MBB_BANK_CODE) {
            transferParams = {
                transferFlow: 3,
                functionsCode: 3,
                transferTypeName: "Other Account Transfer",
                transactionMode: "Other Account Transfer",
                isMaybankTransfer: true,
                accountName: "",
                toAccount: transferParamsPrevious.toAccount,
                toAccountCode: item.aquirerId,
                formattedToAccount: "",
                image: item.image,
                bankName: item.bankName,
                amount: "0.00",
                formattedAmount: "0.00",
                reference: "",
                bankCode: item.bankCode,
                toAccountBank: item.bankName,
                aquirerId: item.aquirerId,
                swiftCode: item.swiftCode,
                isSecure2uRegisterFlow: true,
                receiptTitle: THIRD_PARTY_TRANSFER,
                referenceNumber: "",
                transactionDate: "",
                transactionStartDate: "",
                transactionEndDate: "",
                isRecurringTransfer: false,
                isFutureTransfer: false,
                fromAccount: transferParamsPrevious.fromAccount,
                fromAccountCode: "",
                fromAccountName: "",
                formattedFromAccount: "",
                transferType: null,
                transferSubType: null,
                twoFAType: null,
                mbbbankCode: null,
                routeFrom: transferParamsPrevious.routeFrom,
                endDateInt: 0,
                startDateInt: 0,
                transactionResponseError: "",
                prevData: prevData,
            };
        } else {
            transferParams = {
                transferFlow: 4,
                functionsCode: 4,
                transferTypeName: "Interbank Transfer",
                transactionMode: "Interbank Transfer",
                isMaybankTransfer: false,
                accountName: "",
                toAccount: transferParamsPrevious.toAccount,
                toAccountCode: item.acquirerId,
                formattedToAccount: "",
                image: item.image,
                bankName: item.bankName,
                amount: "0.00",
                formattedAmount: "0.00",
                reference: "",
                bankCode: item.bankCode,
                toAccountBank: item.bankName,
                aquirerId: item.aquirerId,
                swiftCode: item.swiftCode,
                isSecure2uRegisterFlow: true,
                receiptTitle: DUITNOW_INSTANT_TRANSFER,
                referenceNumber: "",
                transactionDate: "",
                transactionStartDate: "",
                transactionEndDate: "",
                isRecurringTransfer: false,
                isFutureTransfer: false,
                fromAccount: transferParamsPrevious.fromAccount,
                fromAccountCode: "",
                fromAccountName: "",
                formattedFromAccount: "",
                transferType: null,
                transferSubType: null,
                twoFAType: null,
                mbbbankCode: null,
                routeFrom: transferParamsPrevious.routeFrom,
                endDateInt: 0,
                startDateInt: 0,
                transactionResponseError: "",
                prevData: prevData,
                activeTabIndex: transferParamsPrevious.activeTabIndex,
            };
        }

        console.log(
            "[TransferSelectBank] >> [_onBankItemClick] transferParams ==> ",
            transferParams
        );
        console.log("[TransferSelectBank] >> [_onBankItemClick] prevData==> ", prevData);
        this.props.navigation.navigate(TRANSFER_ENTER_ACCOUNT, {
            transferParams,
        });
    };

    /***
     * _onSearchTextChange
     * on Search Text Change
     */
    _onSearchTextChange = (text) => {
        this.setState({
            searchInputText: text,
            mbbBanksList:
                text && text.length >= 1
                    ? arraySearchByObjProp(this.state.fullListBanksList, text, ["bankName"])
                    : this.state.fullListBanksList,
        });
    };

    /***
     * _onSearchTextChange
     * Search Input Event
     */
    doSearchToogle = () => {
        console.log("[TransferSelectBank] >> [doSearchToogle] ==> ");
        const { showSearchInput, searchInputText } = this.state;
        console.log(
            "[TransferSelectBank] >> [doSearchToogle] showSearchInput  ==> ",
            showSearchInput
        );
        console.log(
            "[TransferSelectBank] >> [doSearchToogle] showSearchInput false ==> ",
            !showSearchInput
        );
        const list =
            showSearchInput || searchInputText.length <= 1 ? this.state.fullListBanksList : [];

        console.log("[TransferSelectBank] >> [doSearchToogle] showSearchInput list  ==> ", list);
        this.setState({
            searchInputText: showSearchInput || searchInputText.length <= 1 ? "" : searchInputText,
            showSearchInput: !showSearchInput,
            mbbBanksList: list,
        });
    };

    /***
     * _onBackPress
     * On back button press
     */
    _onBackPress = () => {
        console.log("[TransferSelectBank] >> [_onBackPress] ==>");
        this.props.navigation.goBack();
    };

    render() {
        const { showErrorModal, errorMessage } = this.state;
        return (
            <ScreenContainer
                backgroundType="color"
                showErrorModal={showErrorModal}
                errorMessage={errorMessage}
                showOverlay={false}
                backgroundColor={MEDIUM_GREY}
            >
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerCenterElement={
                                <Typo
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={19}
                                    text={TRANSFER_TO_HEADER}
                                />
                            }
                            headerLeftElement={<HeaderBackButton onPress={this._onBackPress} />}
                        />
                    }
                    useSafeArea
                    paddingHorizontal={0}
                    paddingBottom={0}
                >
                    <View style={Styles.contentTab}>
                        <View style={Styles.wrapperBlue}>
                            <View style={Styles.blockInner}>
                                <View style={Styles.listTileView}>
                                    <Typo
                                        fontSize={20}
                                        fontWeight="300"
                                        fontStyle="normal"
                                        letterSpacing={0}
                                        lineHeight={28}
                                        color="#000000"
                                        textAlign="left"
                                        text={TRANSFER_TO}
                                    />
                                </View>
                                <View style={Styles.listSearchView}>
                                    <SearchInput
                                        doSearchToogle={this.doSearchToogle}
                                        showSearchInput={this.state.showSearchInput}
                                        onSearchTextChange={this._onSearchTextChange}
                                        useMargin={false}
                                    />
                                </View>
                                <ScrollView
                                    showsHorizontalScrollIndicator={false}
                                    showsVerticalScrollIndicator={false}
                                >
                                    <View>
                                        <BankList
                                            data={arraySearchByObjProp(
                                                this.state.mbbBanksList,
                                                this.state.searchInputText,
                                                ["bankName"]
                                            )}
                                            callback={this._onBankItemClick}
                                        />
                                        {this.state.getListCalled &&
                                            this.state.mbbBanksList.length < 1 && (
                                                <View style={Styles.emptyTextView}>
                                                    <Typo
                                                        fontSize={18}
                                                        fontWeight="bold"
                                                        fontStyle="normal"
                                                        letterSpacing={0}
                                                        lineHeight={32}
                                                        textAlign="center"
                                                        text={NO_RESULT_FOUND}
                                                    />
                                                    <View style={Styles.emptyText2View}>
                                                        <Typo
                                                            fontSize={14}
                                                            fontWeight="200"
                                                            fontStyle="normal"
                                                            letterSpacing={0}
                                                            lineHeight={20}
                                                            textAlign="center"
                                                            text={
                                                                WE_COULDNT_FIND_ANY_ITEMS_MATCHING
                                                            }
                                                        />
                                                    </View>
                                                </View>
                                            )}
                                    </View>
                                </ScrollView>
                            </View>
                        </View>
                    </View>
                </ScreenLayout>
            </ScreenContainer>
        );
    }
}

//make this component available to the app
export default TransferSelectBank;
