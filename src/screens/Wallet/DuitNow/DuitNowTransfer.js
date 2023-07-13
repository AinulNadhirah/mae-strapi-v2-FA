/* eslint-disable react/jsx-no-bind */
/* eslint-disable no-unused-vars */
import React, { Component } from "react";
import {
    Text,
    View,
    ScrollView,
    Image,
    Alert,
    FlatList,
    TouchableOpacity,
    TouchableWithoutFeedback,
    TextInput,
    Button,
    ImageBackground,
} from "react-native";
import AsyncStorage from "@react-native-community/async-storage";
import { HeaderPageIndicator, NewTransferButton, ErrorMessage } from "@components/Common";
import commonStyle from "@styles/main";
import FavouritesAccountList from "@components/Others/FavouritesAccountList";
import Styles from "@styles/Wallet/TransferOtherAccountsStyle";
import WalletScreenStyle from "@styles/Wallet/WalletScreen";
import * as Strings from "@constants/strings";
import * as navigationConstant from "@navigation/navigationConstant";
import NavigationService from "@navigation/navigationService";
import { FAVOURITE_DUMMY } from "@constants/data";
import { Mutation } from "react-apollo";
import { DELETE_LOYALTY_CARD } from "@services/Query";
import * as ModelClass from "@utils/dataModel/modelClass";
import { FloatingAction } from "react-native-floating-action";
import { GET_FAVOURITE_ACCOUNT_LIST } from "@services/Query";
import { Query } from "react-apollo";
import {
    favoriteList,
    duitnowFavoriteList,
    duitnowStatusInquiry,
    loadCountries,
} from "@services/index";
import NetInfo from "@react-native-community/netinfo";
import { GET_USER_ACCOUNTS } from "@services/Query";
import { TOKEN_TYPE_M2U, TOKEN_TYPE_MAYA } from "@constants/api";
class DuitNowTransfer extends Component {
    static navigationOptions = { title: "", header: null };

    constructor(props) {
        super(props);
        this.state = {
            mayaUserId: 0,
            accounts: [],
            update: 1,
            error: "",
            rand: 1,
            inqError: false,
            errorMessage: "",
        };
        this.onNewTransferClick = this._onNewTransferClick.bind(this);
        this.onAccountItemClick = this._onAccountItemClick.bind(this);
    }

    async componentDidMount() {
        if (ModelClass.DUITNOW_DATA.countryList.length < 1) {
            await this.loadAllCountries();
        }
        this.focusSubscription = this.props.navigation.addListener("focus", () => {
            // this.setState({ rand: Math.random() + 100 });
            this.forceUpdate();
        });
        this.blurSubscription = this.props.navigation.addListener("blur", () => {});

        this.fetchFavoriteListData();
    }

    componentWillUnmount() {
        this.focusSubscription();
        this.blurSubscription();
    }

    fetchFavoriteListData = async () => {
        let subUrl = "/duitnow/favorite/inquiry";
        duitnowFavoriteList(subUrl)
            .then(async (response) => {
                const result = response.data;
                console.log("/duitnow/favorite/inquiry favoriteList ==> " + JSON.stringify(result));
                if (result != null && result.code === 200) {
                    if (
                        result.result.favListItems === "null" ||
                        result.result.favListItems === null ||
                        result.result.favListItems === ""
                    ) {
                        ModelClass.DUITNOW_DATA.favouritesAccountList = [];
                    } else {
                        ModelClass.DUITNOW_DATA.favouritesAccountList = result.result.favListItems;
                    }
                } else {
                    ModelClass.DUITNOW_DATA.favouritesAccountList = [];
                }
                this.setState({ rand: Math.random() + 100 });
            })
            .catch((Error) => {
                console.log(" favoriteListApi ERROR: ", Error);
            });
    };

    duitnowIdInquiry = async () => {
        let subUrl =
            "/duitnow/status/inquiry?proxyId=" +
            ModelClass.DUITNOW_DATA.idValue +
            "&proxyIdType=" +
            ModelClass.DUITNOW_DATA.idType;
        duitnowStatusInquiry(subUrl)
            .then(async (response) => {
                const result = response.data;
                console.log("/duitnow/status/inquiry data ==> " + JSON.stringify(result));
                if (result != null) {
                    if (result.code === 200) {
                        ModelClass.COMMON_DATA.transferFlow = 12;
                        ModelClass.DUITNOW_DATA.transferRetrievalRefNo =
                            result.result.retrievalRefNo;
                        ModelClass.DUITNOW_DATA.transferProxyRefNo = result.result.proxyRefNo;
                        ModelClass.DUITNOW_DATA.transferRegRefNo = result.result.regRefNo;
                        ModelClass.DUITNOW_DATA.transferAccType = result.result.accType;
                        ModelClass.DUITNOW_DATA.transferBankCode = result.result.bankCode;
                        ModelClass.DUITNOW_DATA.transferBankName = result.result.bankName;
                        ModelClass.DUITNOW_DATA.transferAccHolderName = result.result.accHolderName;
                        ModelClass.DUITNOW_DATA.transferLimitInd = result.result.limitInd;
                        ModelClass.DUITNOW_DATA.transferMaybank = result.result.maybank;
                        ModelClass.DUITNOW_DATA.transferAccNumber = result.result.accNo;
                        NavigationService.navigateToModule(
                            navigationConstant.DUITNOW_MODULE,
                            navigationConstant.DUITNOW_ENTER_AMOUNT
                        );
                    } else {
                        this.setState({ inqError: true, errorMessage: result.result.statusDesc });
                    }
                } else {
                    this.setState({ inqError: true, errorMessage: "duitnow Id inquiry failed" });
                }
            })
            .catch((Error) => {
                this.setState({ inqError: true, errorMessage: "duitnow Id inquiry failed" });
                console.log("ERROR: ", Error);
            });
    };

    _onNewTransferClick = () => {
        this._clearAllData();
        ModelClass.clearTransferData();

        ModelClass.DUITNOW_DATA.transferFav = false;
        ModelClass.DUITNOW_DATA.isRecurringTransfer = false;
        ModelClass.TRANSFER_DATA.transferTacRequired = false;
        ModelClass.TRANSFER_DATA.addingFavouriteStatus = true;
        ModelClass.TRANSFER_DATA.transactionStatus == false;
        ModelClass.TRANSFER_DATA.secure2uResponseObject = null;
        ModelClass.TRANSFER_DATA.transactionResponseObject = null;
        ModelClass.TRANSFER_DATA.tranferTypeName = "DuitNow";
        ModelClass.TRANSFER_DATA.startDateEndDateStr = "";
        ModelClass.COMMON_DATA.transferFlow = 12;
        ModelClass.DUITNOW_DATA.isSendMoneyFlow = false;

        console.log("transferFav ", ModelClass.DUITNOW_DATA.transferFav);
        console.log("isRecurringTransfer ", ModelClass.DUITNOW_DATA.isRecurringTransfer);

        NavigationService.navigateToModule(
            navigationConstant.DUITNOW_MODULE,
            navigationConstant.DUITNOW_ENTER_ID
        );
    };

    _onAccountItemClick = (item) => {};

    _clearAllData = async () => {
        ModelClass.TRANSFER_DATA.transactionStatus == false;
        ModelClass.TRANSFER_DATA.secure2uResponseObject = null;
        ModelClass.TRANSFER_DATA.transactionResponseObject = null;

        ModelClass.COMMON_DATA.transferFlow = "";
        ModelClass.TRANSFER_DATA.recipientNickName = "";
        ModelClass.TRANSFER_DATA.recipientName = "";
        ModelClass.TRANSFER_DATA.transferAmount = "";
        ModelClass.TRANSFER_DATA.recipientReference = "";
        ModelClass.TRANSFER_DATA.recipientReference = "";
        ModelClass.TRANSFER_DATA.tranferTypeName = "";
        ModelClass.TRANSFER_DATA.toAccount = "";
        ModelClass.TRANSFER_DATA.toAccountCode = "";
        ModelClass.TRANSFER_DATA.formatedToAccount = "";
        ModelClass.TRANSFER_DATA.toAccountName = "";
        ModelClass.TRANSFER_DATA.accountName = "";
        ModelClass.TRANSFER_DATA.toAccountBank = "";
        ModelClass.TRANSFER_DATA.validationBit = 0;
        ModelClass.TRANSFER_DATA.addingFavouriteFlow = false;
        ModelClass.TRANSFER_DATA.validationBit = "";
        ModelClass.COMMON_DATA.isSplitBillsFlow = false;
        ModelClass.TRANSFER_DATA.isFutureTransfer = false;

        ModelClass.DUITNOW_DATA.transferRetrievalRefNo = "";
        ModelClass.DUITNOW_DATA.transferProxyRefNo = "";
        ModelClass.DUITNOW_DATA.transferRegRefNo = "";
        ModelClass.DUITNOW_DATA.transferAccType = "";
        ModelClass.DUITNOW_DATA.transferBankCode = "";
        ModelClass.DUITNOW_DATA.transferBankName = "";
        ModelClass.DUITNOW_DATA.transferAccHolderName = "";
        ModelClass.DUITNOW_DATA.transferLimitInd = "";
        ModelClass.DUITNOW_DATA.transferMaybank = false;
        ModelClass.DUITNOW_DATA.transferAccNumber = "";
        ModelClass.DUITNOW_DATA.idValue = "";
        ModelClass.DUITNOW_DATA.idType = "";
        ModelClass.SEND_MONEY_DATA.isFromQuickAction = false;
        ModelClass.DUITNOW_DATA.isSendMoneyFlow = false;
    };

    loadAllCountries = async () => {
        let subUrl = "/duitnow/passportcodes";
        loadCountries(subUrl)
            .then(async (response) => {
                const result = response.data;
                console.log(" data ==> " + JSON.stringify(result));
                if (result != null) {
                    ModelClass.DUITNOW_DATA.countryList = result.resultList;
                    for (let i = 0; i < ModelClass.DUITNOW_DATA.countryList.length; i++) {
                        let valueObj = {};
                        let newObj = {};
                        valueObj = ModelClass.DUITNOW_DATA.countryList[i];
                        newObj = valueObj;
                        newObj.name = valueObj.type;
                        newObj.const = valueObj.desc;
                        newObj.isSelected = valueObj.selected;
                        newObj.index = i;
                        ModelClass.DUITNOW_DATA.countryList[i] = newObj;

                        console.log(" countryList ==> ", ModelClass.DUITNOW_DATA.countryList);
                    }
                }
            })
            .catch((Error) => {
                console.log("ERROR: ", Error);
                ModelClass.DUITNOW_DATA.countryList = [];
            });
    };

    render() {
        return (
            <View
                style={[
                    { backgroundColor: "transparent", flex: 1, width: "100%" },
                    commonStyle.blueBackgroundColor,
                ]}
            >
                <HeaderPageIndicator
                    showBack={false}
                    showClose={true}
                    showIndicator={false}
                    showTitle={true}
                    showBackIndicator={false}
                    pageTitle={"DuitNow"}
                    numberOfPages={1}
                    currentPage={this.state.currentScreen}
                    navigation={this.props.navigation}
                    noPop={true}
                    noClose={true}
                    moduleName={navigationConstant.WALLET_MODULE}
                    routeName={navigationConstant.WALLET_VIEW_ACCOUNT}
                    onBackPress={() => {
                        //this.props.onBackPress();
                        //this.props.navigation.pop();
                        NavigationService.navigateToModule(
                            navigationConstant.WALLET_MODULE,
                            navigationConstant.WALLET_VIEW_ACCOUNT
                        );
                    }}
                    onClosePress={() => {
                        //this.props.onBackPress();
                        //this.props.navigation.pop();
                        NavigationService.navigateToModule(
                            navigationConstant.WALLET_MODULE,
                            navigationConstant.WALLET_VIEW_ACCOUNT
                        );
                    }}
                />
                <View style={commonStyle.contentTab}>
                    <View style={commonStyle.wrapperBlue}>
                        <ScrollView>
                            <View style={Styles.flex}>
                                <View style={Styles.innerFlex}>
                                    <View style={Styles.newTransferViewFirst}>
                                        <NewTransferButton onPress={this.onNewTransferClick} />
                                    </View>
                                    <View style={Styles.favouriteView}>
                                        <Text
                                            style={[Styles.favouriteLabelBlack, commonStyle.font]}
                                        >
                                            {Strings.FAVOURITES}
                                        </Text>
                                    </View>
                                    {ModelClass.DUITNOW_DATA.favouritesAccountList.length < 1 ? (
                                        <View style={WalletScreenStyle.topTextContainer1}>
                                            <Text
                                                style={[
                                                    WalletScreenStyle.topText,
                                                    commonStyle.font,
                                                ]}
                                            >
                                                {"No favorites added yet."}
                                            </Text>
                                        </View>
                                    ) : (
                                        <View />
                                    )}
                                    <View style={Styles.favouriteListView}>
                                        <FavouritesAccountList
                                            din={true}
                                            data={ModelClass.DUITNOW_DATA.favouritesAccountList}
                                            callback={(
                                                idNo,
                                                idType,
                                                idTypeCode,
                                                tacIndent,
                                                item
                                            ) => {
                                                this._clearAllData();
                                                ModelClass.clearTransferData();

                                                ModelClass.DUITNOW_DATA.idValue = idNo.replace(
                                                    /\s/g,
                                                    ""
                                                );
                                                ModelClass.DUITNOW_DATA.idType = idTypeCode;
                                                ModelClass.TRANSFER_DATA.transferTacRequired =
                                                    tacIndent === "1" ? true : false;
                                                ModelClass.TRANSFER_DATA.validationBit = tacIndent;
                                                ModelClass.DUITNOW_DATA.transferFav = true;
                                                ModelClass.TRANSFER_DATA.tranferTypeName =
                                                    "DuitNow";
                                                ModelClass.COMMON_DATA.transferFlow = 12;
                                                //$$$  duitnow verify ID  api call
                                                ModelClass.DUITNOW_DATA.idTypeName = idType;

                                                console.log(
                                                    " ModelClass.TRANSFER_DATA.validationBit : ",
                                                    ModelClass.TRANSFER_DATA.validationBit
                                                );
                                                this.duitnowIdInquiry();
                                            }}
                                        />
                                    </View>
                                    {ModelClass.COMMON_DATA.m2uAccessToken != undefined &&
                                    ModelClass.COMMON_DATA.m2uAccessToken != null &&
                                    ModelClass.COMMON_DATA.m2uAccessToken.length >= 1 ? (
                                        <Query
                                            query={GET_USER_ACCOUNTS}
                                            variables={{
                                                tokenType: TOKEN_TYPE_M2U,
                                                m2uauthorization:
                                                    ModelClass.COMMON_DATA.serverAuth +
                                                    ModelClass.COMMON_DATA.m2uAccessToken,
                                                mayaUserId: ModelClass.COMMON_DATA.mayaUserId,
                                                showPreloader: false,
                                                promptError: false,
                                            }}
                                            fetchPolicy="network-only"
                                        >
                                            {({ data }) => {
                                                if (data) {
                                                    console.log("data ==> ", data);
                                                    // console.log('error ==> ' ,error);

                                                    if (data != undefined && data != null) {
                                                        let listData = data.getAllUserAccounts;
                                                        ModelClass.TRANSFER_DATA.userAccountList =
                                                            listData;
                                                        if (
                                                            listData != undefined &&
                                                            listData != null
                                                        ) {
                                                            console.log(
                                                                "getAllUserAccounts:",
                                                                listData
                                                            );
                                                            console.log(
                                                                "getAllUserAccounts:",
                                                                listData.length
                                                            );
                                                            let fromAccount =
                                                                ModelClass.TRANSFER_DATA.fromAccount.substring(
                                                                    0,
                                                                    12
                                                                );

                                                            //console.log("fromAccount ==> " + fromAccount);
                                                            let newAccountList = [];
                                                            let accountItem = "";
                                                            for (
                                                                let i = 0;
                                                                i < listData.length;
                                                                i++
                                                            ) {
                                                                let account = listData[
                                                                    i
                                                                ].acctNo.substring(0, 12);
                                                                accountItem = listData[i];
                                                                if (accountItem.primary) {
                                                                    ModelClass.TRANSFER_DATA.primaryAccount =
                                                                        accountItem.acctNo;
                                                                }
                                                                console.log(
                                                                    "account ==> " + account
                                                                );
                                                                if (
                                                                    fromAccount != account &&
                                                                    accountItem != undefined &&
                                                                    accountItem.acctStatusCode !=
                                                                        undefined &&
                                                                    accountItem.acctStatusCode ==
                                                                        "00"
                                                                ) {
                                                                    newAccountList.push(
                                                                        listData[i]
                                                                    );
                                                                } else {
                                                                    //console.log("acc ==> " + account);
                                                                }
                                                            }
                                                            ModelClass.TRANSFER_DATA.userToAccountList =
                                                                newAccountList;
                                                            console.log(
                                                                "ModelClass.TRANSFER_DATA.userToAccountList  : ",
                                                                ModelClass.TRANSFER_DATA
                                                                    .userToAccountList
                                                            );

                                                            console.log(
                                                                "ModelClass.TRANSFER_DATA.userAccountList  : ",
                                                                ModelClass.TRANSFER_DATA
                                                                    .userAccountList
                                                            );

                                                            ModelClass.TRANSFER_DATA.maybankAvailable =
                                                                "true";
                                                            ModelClass.TRANSFER_DATA.maybankTitle =
                                                                "Maybank2u";
                                                        }
                                                    }
                                                } else {
                                                    ModelClass.TRANSFER_DATA.maybankAvailable =
                                                        "false";
                                                    ModelClass.TRANSFER_DATA.maybankTitle =
                                                        "Add Maybank Accounts";
                                                }
                                                return <View />;
                                            }}
                                        </Query>
                                    ) : (
                                        <View />
                                    )}
                                </View>
                            </View>
                        </ScrollView>
                    </View>
                </View>
                {this.state.inqError == true ? (
                    <ErrorMessage
                        onClose={() => {
                            this.setState({ inqError: false });
                        }}
                        title={Strings.APP_NAME_ALERTS}
                        description={this.state.errorMessage}
                        showOk={true}
                        onOkPress={() => {
                            this.setState({ inqError: false });
                        }}
                    />
                ) : null}
            </View>
        );
    }
}
export default DuitNowTransfer;
