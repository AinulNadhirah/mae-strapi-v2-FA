/* eslint-disable react/jsx-no-bind */
import React from "react";
import {
    View,
    StyleSheet,
    PermissionsAndroid,
    Alert,
    Text,
    Platform,
    Image,
    TextInput,
    Dimensions,
    TouchableOpacity,
    Keyboard,
    InteractionManager,
} from "react-native";
import {
    HeaderPageIndicator,
    FrequentlyContactList,
    NextRightButton,
    ButtonRoundLong,
} from "@components/Common";
import FlatListCustom from "@components/FlatListCustom/FlatListCustom";
import Contacts from "react-native-contacts";
import * as ModelClass from "@utils/dataModel/modelClass";
import { APOLLO_HTTP_ENDPOINT } from "@constants/url";
import ApiManager, { METHOD_POST, CONTENT_TYPE_APP_JSON } from "@services/ApiManager";
import { syncContact } from "@services";
import NavigationService from "@navigation/navigationService";
import { ErrorMessage } from "@components/Common";
import * as Strings from "@constants/strings";
import Permissions from "react-native-permissions";
import * as navigationConstant from "@navigation/navigationConstant";
import AsyncStorage from "@react-native-community/async-storage";
import { acctDetails } from "@services/index";
import NetInfo from "@react-native-community/netinfo";
import * as Utility from "@utils/dataModel/utility";
export const { width, height } = Dimensions.get("window");
import commonStyles from "@styles/main";
import { goalValidateParticipants } from "@services";

var allContactArray = [];

export default class ContactScreen extends React.Component {
    static navigationOptions = {
        title: "",
        header: null,
    };

    constructor(props) {
        super(props);
        this.state = {
            sectionListArray: [],
            contactFilteredArray: [],
            frequentlyContactedListArray: [],
            syncUserContacts: null,
            refresh: false,
            showLoader: false,
            showContactAlert: false,
            error: false,
            errorContactSelect: false,
            errorMessage: "",
            noPrimaryError: false,
            rand: 100,
            showMaxAlert: false,
            goalCheck: false,
            addFactor: 0,
            maxErrorMsg: "",
        };

        this.onSearchClick = this._onSearchClick.bind(this);
    }

    contactArrayForModal = JSON.parse(JSON.stringify(ModelClass.SELECTED_CONTACT));

    componentWillMount() {
        const { route } = this.props;
        console.log("####navigation", navigation);
        let goalCheck = route.params?.goalCheck ?? "false";
        let addFactor = route.params?.addFactor ?? 0;
        let maxErrorMsg = route.params?.maxErrorMsg ?? "";
        console.log("goalCheck", goalCheck, addFactor, maxErrorMsg);
        if (goalCheck === "false") {
            this.setState({ goalCheck: false, addFactor, maxErrorMsg });
        } else {
            this.setState({ goalCheck: true, addFactor, maxErrorMsg });
        }
    }

    async componentDidMount() {
        if (Platform.OS != "ios") {
            this.checkOtherPermission();
        }
        if (ModelClass.COMMON_DATA.walletFlow === 5 || ModelClass.COMMON_DATA.walletFlow === 6) {
            ModelClass.SELECTING_CONTACT = [];
            this.contactArrayForModal = [];
            // eslint-disable-next-line react/no-did-mount-set-state
            this.setState({
                contactFilteredArray: [],
                syncUserContacts: null,
                rand: Math.random() + 1000,
                refresh: true,
            });

            console.log(
                "ContactScreen ModelClass.COMMON_DATA.walletFlow : ",
                ModelClass.COMMON_DATA.walletFlow
            );
            console.log(
                "ContactScreen ModelClass.SELECTING_CONTACT : ",
                ModelClass.SELECTING_CONTACT
            );
            console.log("ContactScreen contactFilteredArray : ", this.state.contactFilteredArray);
            console.log("ContactScreen syncUserContacts : ", this.state.syncUserContacts);
        } else {
            console.log(
                "ContactScreen ModelClass.SELECTING_CONTACT : ",
                ModelClass.SELECTING_CONTACT
            );
        }

        this.getContactPermission();
        ModelClass.SELECTING_CONTACT = JSON.parse(JSON.stringify(ModelClass.SELECTED_CONTACT));

        this.focusSubscription = this.props.navigation.addListener("focus", () => {
            this._updateDataInScreenAlways();
        });
        this.blurSubscription = this.props.navigation.addListener("blur", () => {});
    }

    componentWillUnmount() {
        this.focusSubscription();
        this.blurSubscription();
    }

    checkOtherPermission = async () => {
        try {
            let permissionReq = "READ_CONTACTS";
            const granted = await PermissionsAndroid.check(
                PermissionsAndroid.PERMISSIONS.READ_CONTACTS
            );

            if (granted) {
                console.log("You can use the ", permissionReq);
            } else {
                console.log("READ_CONTACTS permission denied");
                const granted1 = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
                    {
                        title: "MAYA App read Contact Permission",
                        message: "MAYA App needs access to read your Contact " + "",
                        buttonNeutral: "Ask Me Later",
                        buttonNegative: "Cancel",
                        buttonPositive: "OK",
                    }
                );
                if (granted1 === PermissionsAndroid.RESULTS.GRANTED) {
                    console.log("You can use the  ", permissionReq);
                } else {
                    console.log(" permission denied  ", permissionReq);
                }
            }
        } catch (err) {
            console.warn(err);
        }
    };

    _onSearchClick = () => {
        this.focusInputWithKeyboard();
    };
    inputRef = React.createRef();
    focusInputWithKeyboard() {
        InteractionManager.runAfterInteractions(() => {
            this.inputRef.current.focus();
        });
    }
    _updateDataInScreenAlways = async () => {
        let mayaUserId;
        try {
            mayaUserId = await AsyncStorage.getItem("mayaUserId");
            ModelClass.COMMON_DATA.mayaUserId = parseInt(mayaUserId);
        } catch (e) {
            console.log(" catch  ", e);
        }
    };

    // componentDidMount = async () => {
    //   if (Platform.OS === "android") {
    //     const permission = await PermissionsAndroid.request(
    //       PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
    //       {
    //         title: "Access Contacts",
    //         message: `Allow "MAYA" to access your contact?`
    //       }
    //     );
    //     console.log("Contact permission = = = "+permission)
    //     if (permission === "granted") {
    //       this._getAllUserContactsFromDevice();
    //     }
    //     else if (permission === "never_ask_again") {
    //       console.log("Contact permission = = = "+this.state.showContactAlert)
    //       this.setState({showContactAlert:true});
    //     }
    //     else{
    //       this.backPressed();
    //     }
    //   } else {
    //     this._getAllUserContactsFromDevice();
    //   }
    // };

    // =================
    // FUNCTIONS
    // =================

    getContactPermission = async () => {
        let permissionResult = await Permissions.request("contacts").then((response) => {
            console.log("R", response);
            return response;
        });
        let routeName = this.props.route.params?.navigationRoute ?? "";
        if (permissionResult == "denied" || permissionResult == "undetermined") {
            if (routeName == "SendRequestMoneyTabScreen") {
                console.log(
                    "ModelClass.SEND_MONEY_DATA.isFromQuickAction ======>" +
                        ModelClass.SEND_MONEY_DATA.isFromQuickAction
                );
                this.props.navigation.pop();
                this.props.navigation.pop();
            } else {
                this.props.navigation.pop();
            }
        } else if (permissionResult == "restricted") {
            this.setState({
                error: true,
                errorMessage: "Please go to mobile settings and allow app to access contacts",
            });
        } else {
            this._getAllUserContactsFromDevice();
        }

        // if (Platform.OS === "android") {
        //   const permission = await PermissionsAndroid.request(
        //     PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
        //     {
        //       title: "Access Contacts",
        //       message: `Allow "MAYA" to access your contact?`
        //     }
        //   );
        //   console.log("Contact permission = = = "+permission)
        //   if (permission === "granted") {
        //     this._getAllUserContactsFromDevice();
        //   }
        //   else if (permission === "never_ask_again") {
        //     console.log("Contact permission = = = "+this.state.showContactAlert)
        //     this.setState({showContactAlert:true});
        //   }
        //   else{
        //     this.backPressed();
        //   }
        // } else {
        //   this._getAllUserContactsFromDevice();
        // }
    };

    _getAllUserContactsFromDevice = () => {
        let filteredArray = [];
        this.setState({ showLoader: true });
        Contacts.getAll((err, contacts) => {
            if (err === "denied") {
                Alert.alert(
                    "Error",
                    "Unable to read your contact list.",
                    [
                        {
                            text: "Ok",
                        },
                        { text: "Cancel" },
                    ],
                    { cancelable: false }
                );
            } else {
                console.log("CONTACTS.LENGTH:", contacts.length, contacts);
                filteredArray = this._convertToFilteredArray(contacts);
                this._sortRawContactArray(filteredArray);
                this.setState({ showLoader: false });
                this.userContactSync(filteredArray);
            }
        });
    };

    _sortRawContactArray = (array) => {
        try {
            array.sort(function (a, b) {
                if (a == null || b == null) {
                    console.log("a", a.givenName);
                    console.log("b", b.givenName);
                }
                var nameA = a.givenName.toUpperCase();
                var nameB = b.givenName.toUpperCase();
                if (nameA < nameB) {
                    return -1;
                }
                if (nameA > nameB) {
                    return 1;
                }
                return 0;
            });
        } catch (error) {
            console.log("TCL: ContactScreen -> catch -> error", error);
        }
    };

    _convertToFilteredArray = (array = []) => {
        console.log("_convertToFilteredArray *****");
        let filteredArray = [];
        try {
            array.forEach((value) => {
                let isSelected = false;
                let { givenName, familyName, middleName, suffix, phoneNumbers } = value;
                if (phoneNumbers.length == 0) return;

                ModelClass.SELECTED_CONTACT.forEach((value) => {
                    if (
                        value.givenName == givenName &&
                        value.familyName != undefined &&
                        familyName != undefined &&
                        value.familyName == familyName
                    ) {
                        isSelected = true;
                    }
                });
                filteredArray.push({
                    givenName,
                    familyName,
                    middleName,
                    suffix,
                    phoneNumbers,
                });
            });

            return filteredArray;
        } catch (error) {
            console.log("TCL: catch -> error", error);
            return filteredArray;
        }
    };

    _renderScreenPlaceholder = () => {
        return (
            <View style={styles.container}>
                <HeaderPageIndicator
                    showBack={true}
                    showClose={false}
                    showMore={false}
                    showSearch={true}
                    showIndicator={false}
                    showTitle={false}
                    navigation={this.props.navigation}
                    noPop={this.props.route.params?.navigationRoute === "SplitBillsEquallyScreen"}
                    showBackIndicator={true}
                    pageTitle={""}
                    numberOfPages={2}
                    currentPage={1}
                    testID={"header"}
                    accessibilityLabel={"header"}
                />
            </View>
        );
    };

    _generateFrequentlyContactedArray = (array) => {
        console.log("freq contact = = = " + JSON.stringify(array));
        const generatedArray = [];
        try {
            array.forEach((value) => {
                const { data = [] } = value;
                data.forEach((value) => {
                    generatedArray.push(value);
                });
            });
            return generatedArray;
        } catch (error) {
            return generatedArray;
        }
    };

    addSelectedContacts = async (contactObject) => {
        console.log("addSelectedContacts:", contactObject);
        //
        let selectedObject = this.getItemById(contactObject.id);
        console.log(
            " = = =  before add checking",
            !selectedObject.isSelected,
            this.state.addFactor,
            ModelClass.SELECTING_CONTACT.length,
            ModelClass.COMMON_DATA.contactsSelectLimit,
            ModelClass.SELECTING_CONTACT.length + this.state.addFactor >=
                ModelClass.COMMON_DATA.contactsSelectLimit,
            ModelClass.COMMON_DATA.contactsMultiSelectAllowed
        );

        // checking max
        if (
            !selectedObject.isSelected &&
            ModelClass.SELECTING_CONTACT.length + this.state.addFactor >=
                ModelClass.COMMON_DATA.contactsSelectLimit &&
            ModelClass.COMMON_DATA.contactsMultiSelectAllowed
        ) {
            this.setState({ showMaxAlert: true });
            return;
        }

        // checking ModelClass.COMMON_DATA.contactsMultiSelectAllowed
        if (ModelClass.COMMON_DATA.contactsMultiSelectAllowed) {
            selectedObject.isSelected = !selectedObject.isSelected;
        } else {
            // selectedObject.isSelected = !selectedObject.isSelected;
            if (!selectedObject.isSelected) {
                this.contactArrayForModal = [];
                ModelClass.SELECTING_CONTACT = [];
                selectedObject.isSelected = !selectedObject.isSelected;
            }
        }

        let contactArrayObject = {};
        if (selectedObject.isSelected) {
            if (this.state.goalCheck === true && selectedObject.mayaUserId != null) {
                console.log("selectedObject", selectedObject);
                let participentsList = [];
                let object = {};
                object.hpNo = contactObject.phoneNumbers[0].number;
                object.name = contactObject.givenName;
                participentsList.push(object);

                await goalValidateParticipants(
                    "/goal/validateParticipants",
                    JSON.stringify(participentsList)
                )
                    .then(async (response) => {
                        console.log("RES", response);
                        const regObject = await response.data;
                        console.log("Object", regObject);
                        if (regObject.resultCount > 0) {
                            let valid = regObject.resultList[0].valid;
                            if (valid === true) {
                                for (let i = 0; i < this.contactArrayForModal.length; i++) {
                                    if (
                                        this.contactArrayForModal[i].givenName ==
                                            contactObject.givenName &&
                                        this.contactArrayForModal[i].phoneNumbers[0].number ==
                                            contactObject.phoneNumbers[0].number
                                    ) {
                                        this.contactArrayForModal.splice(i, 1);
                                        ModelClass.SELECTING_CONTACT.splice(i, 1);
                                    }
                                }
                                contactArrayObject = {
                                    givenName: contactObject.givenName,
                                    familyName: contactObject.familyName,
                                    mayaUserId: contactObject.mayaUserId,
                                    profilePic: contactObject.profilePic,
                                    phoneNumbers: contactObject.phoneNumbers,
                                    isSyncedThroughMaya: contactObject.isSyncedThroughMaya,
                                    id: contactObject.id,
                                    primaryExist: contactObject.primaryExist,
                                };
                                this.contactArrayForModal.push(contactArrayObject);
                                ModelClass.SELECTING_CONTACT.push(contactArrayObject);
                                console.log(
                                    "addSelectedContacts contactObject = = = ",
                                    ModelClass.SELECTING_CONTACT
                                );
                            } else {
                                this.setState({
                                    errorContactSelect: true,
                                    errorMessage: "Contact already reached maximum goal limit",
                                });
                            }
                        } else {
                            this.setState({
                                errorContactSelect: true,
                                errorMessage: "Contact cannot be add to goal",
                            });
                        }
                    })
                    .catch((err) => {
                        console.log("ERR", err);
                        this.setState({
                            errorContactSelect: true,
                            errorMessage: "Server communication error",
                        });
                    });
            } else {
                for (let i = 0; i < this.contactArrayForModal.length; i++) {
                    if (
                        this.contactArrayForModal[i].givenName == contactObject.givenName &&
                        this.contactArrayForModal[i].phoneNumbers[0].number ==
                            contactObject.phoneNumbers[0].number
                    ) {
                        this.contactArrayForModal.splice(i, 1);
                        ModelClass.SELECTING_CONTACT.splice(i, 1);
                    }
                }
                contactArrayObject = {
                    givenName: contactObject.givenName,
                    familyName: contactObject.familyName,
                    mayaUserId: contactObject.mayaUserId,
                    profilePic: contactObject.profilePic,
                    phoneNumbers: contactObject.phoneNumbers,
                    isSyncedThroughMaya: contactObject.isSyncedThroughMaya,
                    id: contactObject.id,
                    primaryExist: contactObject.primaryExist,
                };
                this.contactArrayForModal.push(contactArrayObject);
                ModelClass.SELECTING_CONTACT.push(contactArrayObject);
                console.log(
                    "addSelectedContacts contactObject = = = ",
                    ModelClass.SELECTING_CONTACT
                );
            }
        } else {
            console.log(
                "addSelectedContacts Else this.contactArrayForModal = = = ",
                this.contactArrayForModal
            );
            for (let i = 0; i < this.contactArrayForModal.length; i++) {
                if (
                    (this.contactArrayForModal[i].givenName == contactObject.givenName ||
                        (this.contactArrayForModal[i].mayaUserId != null &&
                            this.contactArrayForModal[i].mayaUserId == contactObject.mayaUserId)) &&
                    this.contactArrayForModal[i].phoneNumbers[0].number ==
                        contactObject.phoneNumbers[0].number
                ) {
                    this.contactArrayForModal.splice(i, 1);
                    ModelClass.SELECTING_CONTACT.splice(i, 1);
                }
            }
        }
        // ModelClass.SELECTED_CONTACT = this.contactArrayForModal;
        this.updateSelection();
    };

    addSelectedGroupContacts = (contactObject) => {
        console.log("addSelectedGroupContacts = contactObject ", contactObject);
        ModelClass.SELECTING_CONTACT = contactObject.participants;

        ModelClass.SPLIT_BILL_DATA.favGroupsSelected = contactObject.participants;
        ModelClass.SPLIT_BILL_DATA.favGroupsSelectedID = contactObject.id;
        ModelClass.SPLIT_BILL_DATA.favGroupsID = contactObject.groupId;
        ModelClass.SPLIT_BILL_DATA.groupName = contactObject.givenName;
        ModelClass.SPLIT_BILL_DATA.favGroupsSelectFlow = true;
        this.props.navigation.pop();
    };

    _onTextChange = (searchText) => {
        searchText = searchText.toLowerCase();
        if (searchText == "") {
            this.setState({ contactFilteredArray: [], refresh: !this.state.refresh });
            setTimeout(() => this.updateSelection(), 500); // 500 temp
        } else {
            let contactArray = allContactArray.filter((item) => {
                // convert all string to lowercase to make non case sensitive
                const fname = item.familyName ? item.familyName.toLowerCase() : "";
                const gname = item.givenName ? item.givenName.toLowerCase() : "";

                // normalise  before do comparison with selected
                if (item.isSelected) {
                    item.isSelected = false;
                }

                // check both variable fname and gname containt searchtxt
                return fname.indexOf(searchText) !== -1 || gname.indexOf(searchText) !== -1;
            });

            if (contactArray == null || contactArray == undefined || contactArray.length == 0) {
                this.setState({ showLoader: false, contactFilteredArray: null });
                this.updateSelection();
                return;
            }

            const newContactArray = this.setSelectedItems(contactArray.slice()); // clone array
            this.setState({
                contactFilteredArray: newContactArray,
                refresh: !this.state.refresh,
                showLoader: true,
            });

            if (newContactArray.length > 0) {
                setTimeout(() => this.updateSelection(), newContactArray.length * 5);
            } else {
                setTimeout(
                    () => this.updateSelection(),
                    this.state.syncUserContacts.mainContacts.data.length * 5
                );
            }
        }
    };

    nextPressed() {
        console.log("nextPressed");
        console.log(ModelClass.SELECTING_CONTACT);
        //
        ModelClass.SPLIT_BILL_DATA.favGroupsSelectFlow = false;
        ModelClass.SELECTED_CONTACT = JSON.parse(JSON.stringify(this.contactArrayForModal));
        let routeName = this.props.route.params?.navigationRoute ?? "";
        console.log("======>" + routeName);
        if (routeName == "FitnessInvite") {
            NavigationService.navigateToModule("fitnessModule", "DailyHustleChallengeInvite");
        } else if (routeName == "Home") {
            NavigationService.resetRoot();
        } else if (routeName == "SplitBillsEquallyScreen") {
            this.props.navigation.pop();
        } else if (routeName == "SendRequestMoneyTabScreen") {
            let contactObj = ModelClass.SELECTED_CONTACT[0];
            console.log("contactObj ======>", contactObj);
            console.log("ModelClass.SELECTED_CONTACT ======>", ModelClass.SELECTED_CONTACT);
            if (contactObj != undefined && contactObj != null) {
                console.log("contactObj.profilePic ======>", contactObj.profilePic);
                let phoneNumbers = contactObj.phoneNumbers;
                let number = phoneNumbers[0].number;

                ModelClass.SEND_MONEY_DATA.userImage =
                    contactObj.profilePic != null &&
                    contactObj.profilePic != "null" &&
                    contactObj.profilePic != undefined
                        ? contactObj.profilePic
                        : "";

                ModelClass.SEND_MONEY_DATA.detailsMobileNumber = number;
                ModelClass.SEND_MONEY_DATA.detailsUserName =
                    contactObj.givenName +
                    (contactObj.familyName != undefined &&
                    contactObj.familyName != null &&
                    contactObj.familyName != ""
                        ? " " + contactObj.familyName
                        : "");

                if (ModelClass.SEND_MONEY_DATA.sendMoneyFlow === 1) {
                    this._acctDetails(ModelClass.SEND_MONEY_DATA.detailsMobileNumber);
                } else {
                    ModelClass.COMMON_DATA.transferFlow = 16;
                    NavigationService.navigateToModule(
                        navigationConstant.SEND_REQUEST_MONEY_STACK,
                        navigationConstant.REQUEST_MONEY_ENTER_AMOUNT
                    );
                }
            } else {
                this.setState({
                    errorContactSelect: true,
                    errorMessage: Strings.PLEASE_SELECT_CONTACT_TO_PROCEED_FURTHER,
                });
            }
        } else {
            this.props.navigation.pop();
        }
    }

    _acctDetails = async (mobileNumber) => {
        this.setState({ loader: true });
        console.log("mobileNumber ==> ", mobileNumber);
        console.log("_acctDetails==> ");
        let subUrl = "/sendRcvMoney/acctDetails?mobileNo=" + mobileNumber;
        let params = {};

        try {
            params = JSON.stringify({});
            NetInfo.isConnected.fetch().then(async (isConnected) => {
                if (isConnected) {
                    acctDetails(subUrl, JSON.parse(params))
                        .then((response) => {
                            let responseObject = response.data;
                            console.log(subUrl + " RESPONSE RECEIVED: ", response.data);
                            ModelClass.SEND_MONEY_DATA.acctDetailsObj = responseObject.result;
                            let result = responseObject.result;
                            console.log(subUrl + " RESPONSE RECEIVED: result ", result);
                            if (
                                responseObject !== null &&
                                responseObject !== undefined &&
                                responseObject.message !== null &&
                                responseObject.message.toLowerCase() == "success".toLowerCase()
                            ) {
                                ModelClass.TRANSFER_DATA.toAccount =
                                    ModelClass.SEND_MONEY_DATA.acctDetailsObj.primaryAcct;
                                ModelClass.SEND_MONEY_DATA.formatedAccountNumber =
                                    Utility.formateAccountNumber(
                                        ModelClass.TRANSFER_DATA.toAccount,
                                        ModelClass.COMMON_DATA.maybankAccountLength
                                    );

                                // ModelClass.SEND_MONEY_DATA.userImage =
                                // 	result.profilePic != null &&
                                // 	result.profilePic != "null" &&
                                // 	result.profilePic != undefined
                                // 		? result.profilePic
                                // 		: "";
                                ModelClass.SEND_MONEY_DATA.userImage = "";

                                console.log(
                                    "ModelClass.SEND_MONEY_DATA.userImage ======>",
                                    ModelClass.SEND_MONEY_DATA.userImage
                                );
                                console.log(
                                    "ModelClass.SEND_MONEY_DATA.userImage source.indexOf(http)======>",
                                    ModelClass.SEND_MONEY_DATA.userImage.indexOf("http")
                                );
                                console.log(
                                    "ModelClass.SEND_MONEY_DATA.userImage source.indexOf(http) != -1======>",
                                    ModelClass.SEND_MONEY_DATA.userImage.indexOf("http") != -1
                                );

                                console.log(
                                    "ModelClass.SEND_MONEY_DATA.formatedAccountNumber ==> ",
                                    ModelClass.SEND_MONEY_DATA.formatedAccountNumber
                                );
                                ModelClass.COMMON_DATA.transferFlow = 15;
                                NavigationService.navigateToModule(
                                    navigationConstant.SEND_REQUEST_MONEY_STACK,
                                    navigationConstant.REQUEST_MONEY_ENTER_AMOUNT
                                );
                            } else if (
                                responseObject !== null &&
                                responseObject !== undefined &&
                                responseObject.message !== null &&
                                responseObject.message.toLowerCase() == "failure".toLowerCase()
                            ) {
                                this.setState({ noPrimaryError: true });
                            } else {
                                this.setState({ noPrimaryError: true });
                            }
                        })
                        .catch((error) => {
                            this.setState({ noPrimaryError: true, loader: false });
                            console.log(subUrl + "  ERROR==> ", error);
                        });
                } else {
                    this.setState({ loader: false });
                }
            });
        } catch (e) {
            this.setState({ loader: false });
            console.log("/favorite/ibft/fundTransfer catch ERROR==> " + e);
        }
    };

    backPressed() {
        console.log("ContactScreen backPressed ======>");
        this.setState({ showContactAlert: false });
        ModelClass.SPLIT_BILL_DATA.favGroupsSelectFlow = false;
        let routeName = this.props.route.params?.navigationRoute ?? "";
        console.log("routeName ======>" + routeName);
        if (routeName == "FitnessInvite") {
            NavigationService.navigateToModule("fitnessModule", "DailyHustleChallengeInvite");
        } else if (routeName == "Home") {
            NavigationService.resetRoot();
        } else if (routeName == "SplitBillsEquallyScreen") {
            this.props.navigation.pop();
        } else if (routeName == "SendRequestMoneyTabScreen") {
            console.log(
                "ModelClass.SEND_MONEY_DATA.isFromQuickAction ======>" +
                    ModelClass.SEND_MONEY_DATA.isFromQuickAction
            );
            if (ModelClass.SEND_MONEY_DATA.isFromQuickAction) {
                this.props.navigation.pop();
                this.props.navigation.pop();
            } else {
                if (ModelClass.SEND_MONEY_DATA.sendMoneyFlow === 1) {
                    if (ModelClass.SEND_MONEY_DATA.isPasswordFlow) {
                        this.props.navigation.pop();
                        this.props.navigation.pop();
                    } else {
                        this.props.navigation.pop();
                    }
                } else {
                    this.props.navigation.pop();
                }
            }
        } else {
            this.props.navigation.pop();
        }
    }

    userContactSync = (contacts) => {
        // show loader
        // this.setState({showLoader:true});
        // call api
        syncContact(contacts)
            .then((respone) => {
                console.log(`ContactScreen: respone ::`, respone);
                console.log(
                    `ContactScreen: userContactSync ::`,
                    respone.data.data.syncMayaContacts
                );

                let fullMainList = respone.data.data.syncMayaContacts.mainContacts.data.slice();
                let newMainArray = [];
                let fArray = [];

                console.log(
                    `ModelClass.COMMON_DATA.walletFlow :`,
                    ModelClass.COMMON_DATA.walletFlow
                );
                console.log(
                    `ModelClass.SEND_MONEY_DATA.sendMoneyFlow :`,
                    ModelClass.SEND_MONEY_DATA.sendMoneyFlow
                );
                console.log(`ContactScreen: fullMainList ::`, fullMainList);
                if (
                    ModelClass.COMMON_DATA.walletFlow === 6 &&
                    ModelClass.SEND_MONEY_DATA.sendMoneyFlow === 2 &&
                    fullMainList != null &&
                    fullMainList != undefined &&
                    fullMainList.length >= 1
                ) {
                    console.log(`ContactScreen: IF :: `, fullMainList);

                    // for (let i = 0; i < fullMainList.length; i++) {
                    // 	let newItem = fullMainList[i];
                    // 	console.log(`ContactScreen: item ::`, newItem);
                    // 	if (newItem.primaryExist) {
                    // 		newMainArray.push(newItem);
                    // 	}
                    // }
                    newMainArray = fullMainList.filter(function (item) {
                        console.log(`ContactScreen: item ::`, item);
                        return item.primaryExist;
                    });
                    respone.data.data.syncMayaContacts.mainContacts.data = newMainArray;
                } else {
                    console.log(`ContactScreen: ELSE ::`);
                    newMainArray = respone.data.data.syncMayaContacts.mainContacts.data;
                    fArray = respone.data.data.syncMayaContacts.frequentContacts.data;
                }

                for (let i = 0; i < newMainArray.length; i++) {
                    let obj = newMainArray[i];
                    obj.id = i;
                    newMainArray[i] = obj;

                    for (let j = 0; j < fArray.length; j++) {
                        let jObj = fArray[j];
                        if (
                            obj.phoneNumbers[0].number === jObj.phoneNumbers[0].number &&
                            obj.phoneNumbers[0].id === jObj.phoneNumbers[0].id
                        ) {
                            fArray[j] = obj;
                        }
                    }
                }
                console.log(`ContactScreen: newMainArray ::`, newMainArray);
                console.log(
                    `ContactScreen: userContactSync New ::`,
                    respone.data.data.syncMayaContacts
                );
                if (respone.data.data.syncMayaContacts != undefined) {
                    respone.data.data.syncMayaContacts.mainContacts.data =
                        this.setSelectedItems(newMainArray);
                    respone.data.data.syncMayaContacts.frequentContacts.data =
                        this.setSelectedItems(fArray);

                    console.log(
                        "syncMayaContacts.mainContacts.data ======>",
                        respone.data.data.syncMayaContacts.mainContacts.data
                    );
                }

                console.log("syncUserContacts ======>", respone.data.data);
                this.setState({ syncUserContacts: respone.data.data });
                setTimeout(
                    () => this.setState({ showLoader: false }),
                    respone.data.data.syncMayaContacts.mainContacts.data.length * 5
                );
            })
            .catch((error) => {
                console.log(`ContactScreen: userContactSync: ERROR ::`, error);
                this.backPressed();
            });
    };

    setSelectedItems = (data) => {
        if (this.contactArrayForModal.length > 0) {
            data.forEach((item) => {
                this.contactArrayForModal.forEach((selectedItem) => {
                    if (item != undefined) {
                        item.phoneNumbers.forEach((e1) =>
                            selectedItem.phoneNumbers.forEach((e2) => {
                                if (
                                    e1.number === e2.number &&
                                    item.givenName === selectedItem.givenName
                                ) {
                                    item.isSelected = true;
                                }
                            })
                        );
                    }
                });
            });
        }
        return data;
    };

    updateSelection = () => {
        console.log("updateselection ", ModelClass.SELECTING_CONTACT);

        let datas = this.getNormalList();
        let fContacs = this.state.syncUserContacts.syncMayaContacts.frequentContacts.data;

        let cleanNewContact = datas.map((item) => {
            item.isSelected = false;
            for (let tempItem of ModelClass.SELECTING_CONTACT) {
                if (item.id == tempItem.id) {
                    item.isSelected = true;
                    break;
                }
            }
            return { ...item };
        });

        let fNewContact = fContacs.map((item) => {
            item.isSelected = false;
            for (let tempItem of ModelClass.SELECTING_CONTACT) {
                if (item.id == tempItem.id) {
                    item.isSelected = true;
                    break;
                }
            }
            return { ...item };
        });

        console.log("fNewContact:", fNewContact);

        if (this.state.contactFilteredArray != null && this.state.contactFilteredArray.length > 0) {
            this.setState({ contactFilteredArray: cleanNewContact, showLoader: false });
        } else {
            this.setState({
                syncUserContacts: {
                    syncMayaContacts: {
                        ...this.state.syncUserContacts.syncMayaContacts,
                        mainContacts: { data: cleanNewContact },
                        frequentContacts: { data: fNewContact },
                    },
                },
                showLoader: false,
            });
        }
    };

    getNormalList = () => {
        return this.state.contactFilteredArray == null
            ? []
            : this.state.contactFilteredArray.length > 0
            ? this.state.contactFilteredArray
            : this.state.syncUserContacts.syncMayaContacts.mainContacts.data;
    };

    getItemById = (id) => {
        let returnValue;
        const items = this.getNormalList();
        for (let item of items) {
            if (item.id == id) {
                returnValue = item;
                break;
            }
        }

        return returnValue;
    };

    // =================
    // RENDER
    // =================
    render() {
        let { syncUserContacts } = this.state;
        const placeholder = this._renderScreenPlaceholder();
        let routeName = this.props.route.params?.navigationRoute ?? "";

        if (syncUserContacts == null)
            return (
                <View style={styles.container}>
                    <View style={styles.initialScreenLoadOverlay} />
                    {this.state.showContactAlert === true ? (
                        <ErrorMessage
                            onClose={() => {
                                // this.setState({ showContactAlert: false });
                                this.backPressed();
                            }}
                            title={Strings.WARNING}
                            description={Strings.GIVE_CONTACT_PERMISSION}
                            showOk={true}
                            onOkPress={() => {
                                // this.textSelect.current.focus()
                                // this.setState({ showContactAlert: false });
                                this.backPressed();
                            }}
                        />
                    ) : null}
                    {this.state.error == true ? (
                        <ErrorMessage
                            onClose={() => {
                                this.setState({ error: false });
                                this.props.navigation.pop();
                            }}
                            title={Strings.APP_NAME_ALERTS}
                            description={this.state.errorMessage}
                            showOk={true}
                            onOkPress={() => {
                                this.setState({ error: false });
                                this.props.navigation.pop();
                            }}
                        />
                    ) : null}
                </View>
            );
        console.log("before", this.state.syncUserContacts);
        const {
            syncMayaContacts: {
                frequentContacts: { data: frequentContacts = {} },
                mainContacts: { data: mainContacts = {} },
            },
        } = this.state.syncUserContacts;

        // const frequentlyContactedArray = this._generateFrequentlyContactedArray(
        //   frequentContacts
        //   );

        const frequentlyContactedArray = frequentContacts;

        console.log("after", frequentlyContactedArray);
        allContactArray = mainContacts;

        return (
            <View style={styles.container}>
                <HeaderPageIndicator
                    showBack={true}
                    showClose={false}
                    showMore={false}
                    showSearch={false}
                    showIndicator={false}
                    showTitle={false}
                    navigation={this.props.navigation}
                    noPop={true}
                    onBackPress={() => this.backPressed()}
                    showBackIndicator={true}
                    // pageTitle={""}
                    // numberOfPages={2}
                    // currentPage={1}
                    testID={"header"}
                    accessibilityLabel={"header"}
                />

                <View
                    style={styles.searchView}
                    accessibilityLabel={"searchView"}
                    testID={"searchView"}
                >
                    <View style={styles.searchButtonView}>
                        <TouchableOpacity
                            onPress={() => this.onSearchClick()}
                            testID={"btnSearchText"}
                            accessibilityLabel={"btnSearchText"}
                        >
                            <Image
                                resizeMode="contain"
                                style={styles.searchButton}
                                source={require("@assets/icons/ic_search.png")}
                            />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.textInputView}>
                        <TextInput
                            style={styles.textInputView1}
                            placeholder="Search"
                            ref={this.inputRef}
                            onChangeText={(text) => this._onTextChange(text)}
                        />
                    </View>
                </View>

                {frequentlyContactedArray.length > 0 &&
                this.props.navigation != undefined &&
                this.props.route.params?.navigationRoute != undefined &&
                this.props.route.params?.navigationRoute === "FitnessInvite" ? (
                    <FrequentlyContactList
                        title={"Frequently Contacted"}
                        singleTag={false}
                        frequentlyContactListArray={frequentlyContactedArray}
                        onContactPressMulti={(obj) => this.addSelectedContacts(obj)}
                    />
                ) : (
                    <View />
                )}

                {ModelClass.SPLIT_BILL_DATA.favGroupsProcessed.length > 0 &&
                this.props.navigation != undefined &&
                this.props.route.params?.navigationRoute != undefined &&
                this.props.route.params?.navigationRoute === "FitnessInvite" ? (
                    <FrequentlyContactList
                        title={"Favorites Group"}
                        singleTag={true}
                        frequentlyContactListArray={ModelClass.SPLIT_BILL_DATA.favGroupsProcessed}
                        onContactPress={(obj) => this.addSelectedGroupContacts(obj)}
                    />
                ) : (
                    <View />
                )}
                <View style={{ marginTop: (10 * height) / 667 }} />
                <FlatListCustom
                    // sectionListArray={sectionArray}
                    extraData={this.state.refresh}
                    data={
                        this.state.contactFilteredArray == null
                            ? []
                            : this.state.contactFilteredArray.length > 0
                            ? this.state.contactFilteredArray
                            : mainContacts
                    }
                    onItemPress={(obj) => this.addSelectedContacts(obj)}
                />

                <View
                    style={styles.tickImageViewNew}
                    accessibilityLabel={"tickImageView"}
                    testID={"tickImageView"}
                >
                    <View style={{ flex: 2, marginLeft: 20 }}>
                        {ModelClass.COMMON_DATA.contactsSelectLimit === 1 ? (
                            <Text
                                style={[
                                    { color: "#000000", fontWeight: "600", fontSize: 16 },
                                    commonStyles.font,
                                ]}
                            >
                                {" "}
                            </Text>
                        ) : (
                            <Text
                                style={[
                                    { color: "#000000", fontWeight: "600", fontSize: 16 },
                                    commonStyles.font,
                                ]}
                            >
                                {routeName == "FitnessInvite"
                                    ? ModelClass.SELECTING_CONTACT.length +
                                      this.state.addFactor +
                                      " / " +
                                      ModelClass.COMMON_DATA.contactsSelectLimit +
                                      " contacts selected "
                                    : ModelClass.SELECTING_CONTACT.length +
                                      this.state.addFactor +
                                      " / " +
                                      ModelClass.COMMON_DATA.contactsSelectLimit +
                                      " contacts selected "}
                            </Text>
                        )}
                    </View>

                    <View
                        style={{
                            width: 120,
                            flex: 1.5,
                            alignItems: "center",
                            justifyContent: "center",
                            alignSelf: "center",
                            marginBottom: 10,
                            marginTop: 10,
                            marginLeft: 0,
                            marginRight: 10,
                        }}
                    >
                        <TouchableOpacity
                            onPress={async () => {
                                this.nextPressed();
                            }}
                            style={{
                                alignContent: "center",
                                alignItems: "center",
                                justifyContent: "center",
                                height: 40,
                                width: 120,
                                borderRadius: 40,
                                marginBottom: 0,
                                backgroundColor: "#f8d31c",
                            }}
                            underlayColor={"#fff"}
                        >
                            <Text
                                style={[
                                    {
                                        fontFamily: "Montserrat",
                                        fontSize: 14,
                                        fontWeight: "normal",
                                        fontStyle: "normal",
                                        lineHeight: 20,
                                        letterSpacing: 0,
                                        color: "#000000",
                                    },
                                    commonStyles.font,
                                ]}
                            >
                                Add
                            </Text>
                        </TouchableOpacity>
                    </View>
                    {/* <NextRightButton
						onPress={() => this.nextPressed()}
						accessibilityLabel={"imgRight"}
						testID={"imgRight"}
						imageSource={require("@assets/icons/ic_left_arrow.png")}
					/> */}
                </View>
                {this.state.error == true ? (
                    <ErrorMessage
                        onClose={() => {
                            this.setState({ error: false });
                            this.props.navigation.pop();
                        }}
                        title={Strings.APP_NAME_ALERTS}
                        description={this.state.errorMessage}
                        showOk={true}
                        onOkPress={() => {
                            this.setState({ error: false });
                            this.props.navigation.pop();
                        }}
                    />
                ) : null}

                {this.state.errorContactSelect == true ? (
                    <ErrorMessage
                        onClose={() => {
                            this.setState({ errorContactSelect: false });
                        }}
                        title={Strings.APP_NAME_ALERTS}
                        description={this.state.errorMessage}
                        showOk={true}
                        onOkPress={() => {
                            this.setState({ errorContactSelect: false });
                        }}
                    />
                ) : null}

                {this.state.noPrimaryError === true ? (
                    <ErrorMessage
                        onClose={() => {
                            this.setState({ noPrimaryError: false });
                        }}
                        title={Strings.ACCOUNT_NOT_LINKED}
                        description={Strings.YOUR_CONTACT_HAS_NOT_SET_UP}
                        showYesNo={true}
                        showyesText={"Yes"}
                        showNoText={"No"}
                        onYesPress={() => {
                            this.setState({ noPrimaryError: false });

                            ModelClass.DUITNOW_DATA.isFeutureransfer = false;
                            ModelClass.DUITNOW_DATA.transfer = true;
                            ModelClass.DUITNOW_DATA.edit = false;
                            ModelClass.DUITNOW_DATA.routeModule = navigationConstant.WALLET_MODULE;
                            ModelClass.DUITNOW_DATA.routeFrom =
                                navigationConstant.WALLET_TAB_SCREEN;
                            ModelClass.DUITNOW_DATA.eAmt = "000";
                            ModelClass.TRANSFER_DATA.tranferTypeName = "DuitNow";
                            ModelClass.DUITNOW_DATA.idValue =
                                ModelClass.SEND_MONEY_DATA.detailsMobileNumber;
                            ModelClass.DUITNOW_DATA.isSendMoneyFlow = true;
                            ModelClass.DUITNOW_DATA.isSendMoneyFlowFirst = true;
                            ModelClass.TRANSFER_DATA.userToAccountList = [];
                            if (
                                ModelClass.TRANSFER_DATA.m2uToken != null &&
                                ModelClass.TRANSFER_DATA.m2uToken.length >= 1
                            ) {
                                NavigationService.navigateToModule(
                                    navigationConstant.DUITNOW_MODULE,
                                    navigationConstant.DUITNOW_ENTER_ID
                                );
                            } else {
                                ModelClass.COMMON_DATA.walletScreenIndex = 0;
                                NavigationService.navigateToModule(
                                    navigationConstant.DUITNOW_MODULE,
                                    navigationConstant.DUITNOW_LOGIN
                                );
                            }
                        }}
                        onNoPress={() => {
                            this.setState({ noPrimaryError: false });
                        }}
                    />
                ) : null}
                {this.state.showMaxAlert === true ? (
                    <ErrorMessage
                        onClose={() => {
                            this.setState({ showMaxAlert: false });
                        }}
                        title={Strings.WARNING}
                        description={
                            !ModelClass.COMMON_DATA.contactsMultiSelectAllowed
                                ? Strings.MAX_CONTACT_LIST_PAGE
                                : routeName == "FitnessInvite"
                                ? Strings.MAX_BUDDIES_CONTACT_MAX +
                                  " " +
                                  (ModelClass.COMMON_DATA.contactsSelectLimit + 1) +
                                  " " +
                                  Strings.FITNESS_INCLUDIN_YOU
                                : this.state.maxErrorMsg
                        }
                        showOk={true}
                        onOkPress={() => {
                            // this.textSelect.current.focus()
                            this.setState({ showMaxAlert: false });
                        }}
                    />
                ) : null}
            </View>
        );
    }
}

// ==============
// STYLE
// ==============
const white = "#ffffff";
const gray = "gray";
const styles = StyleSheet.create({
    container: {
        backgroundColor: "#cfeef8",
        flex: 1,
    },
    initialScreenLoadOverlay: {
        backgroundColor: gray,
        flex: 1,
        position: "absolute",
    },
    searchButton: {
        height: (25 * height) / 667,
        width: (25 * height) / 667,
    },
    searchButtonView: {
        flex: 0.1,
        marginLeft: (10 * height) / 667,
        marginTop: (7.5 * height) / 667,
    },
    searchView: {
        backgroundColor: white,
        borderRadius: (20 * height) / 667,
        flexDirection: "row",
        height: (40 * height) / 667,
        position: "absolute",
        right: 24,
        top: 30,
        width: (275 * width) / 375,
        // top: 30 * height / 667,
    },
    textInputView: {
        flex: 0.9,
        height: (40 * height) / 667,
        // bottom: 20,
        width: (230 * width) / 375,
    },
    textInputView1: {
        flex: 1,
        height: (40 * height) / 667,
        // bottom: 20,
        width: (230 * width) / 375,
    },
    tickImageView: {
        bottom: (height * 20) / 667,
        height: (width * 60) / 375,
        marginLeft: (width * 300) / 375,
        position: "absolute",
        width: (width * 60) / 375,
    },
    tickImageViewNew: {
        bottom: 0,
        height: (width * 60) / 375,
        marginLeft: 0,
        position: "relative",
        backgroundColor: "#ffffff",
        width: width,
        alignItems: "center",
        flexDirection: "row",
    },
});
