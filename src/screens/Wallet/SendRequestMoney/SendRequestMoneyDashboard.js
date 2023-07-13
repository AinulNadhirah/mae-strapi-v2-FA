import PropTypes from "prop-types";
import * as React from "react";
import { Linking } from "react-native";
import Share from "react-native-share";

import { navigateToS2UCooling } from "@screens/OneTapAuth/CoolingNavigator";

import * as navigationConstant from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ContactPicker from "@components/ContactPicker";
import ScreenContainer from "@components/Containers/ScreenContainer";
import ScreenLoader from "@components/Loaders/ScreenLoader";
import Popup from "@components/Popup";
import TabView from "@components/Specials/TabView";
import Typo from "@components/Text";
import { showErrorToast, hideToast } from "@components/Toast";

import { withModelContext } from "@context";

import { getDuitNowFlags, rtpStatus } from "@services";
import { duitnowStatusInquiry, acctDetails, invokeL2, invokeL3 } from "@services/";
import { logEvent } from "@services/analytics";
import { RTPanalytics } from "@services/analytics/rtpAnalyticsSSL";

import { MEDIUM_GREY } from "@constants/colors";
import * as Strings from "@constants/strings";
import { DUIT_NOW_URL } from "@constants/url";

import { contactsSingleSelectOperation } from "@utils/array";
import { isMalaysianMobileNum } from "@utils/dataModel";
import {
    analyticsDashboard,
    analyticsSelectItem,
    getPermissionObj,
} from "@utils/dataModel/rtdHelper";
import {
    convertMayaMobileFormat,
    formateAccountNumber,
    formatMobileNumbers,
    checks2UFlow,
} from "@utils/dataModel/utility";
import withFestive from "@utils/withFestive";

import {
    FASendRequestDashboard,
    FASendRequestTransaction,
} from "../../../services/analytics/analyticsSendRequest";
import SendRequestMoneyPastScreen from "./SendRequestMoneyPastScreen";
import SendRequestMoneyPendingScreen from "./SendRequestMoneyPendingScreen";
import SendRequestMoneyRTPFavScreen from "./SendRequestMoneyRTPFavScreen";

class SendRequestMoneyDashboard extends React.Component {
    /***
     * constructor
     * props
     */
    constructor(props) {
        super(props);
        this.state = {
            index: 0,
            acctNo: "",
            activeTabIndex: 0,
            screenDate: {},
            showContactPicker:
                this.props?.route?.params?.cta === "send" ||
                this.props?.route?.params?.cta === "request",
            selectedContact: [],
            sendMoneyFlow: 1,
            showDuitNowPopup: false,
            showDuitNowErrorPopup: false,
            mobileNumber: "",
            item: {},
            payRequest: false,
            sendMoneyId: 0,
            incomingRequestTitle: "",
            showIncomingRequestPopup: false,
            showLoaderModal: true,
            userMobileNumber: "",
            onlyMayaContacts: "all",
            callSync: true,
            reqId: -1,
            showInScreenLoaderModal: false,

            // Festive Campaign related
            festiveFlag: false,
            festiveImage: {},
            fromCta: false,
            showRegisterDuitnowAutoDebitPopup: false,
            showRegisterDuitnowRequestPopup: false,
            rtpStatus: {
                isRtdEnabled: false,
                isRtpEnabled: false,
                sourceFunds: null,
                productId: null,
                merchantId: null,
                senderBrn: null,
                merchantDetails: null,
            },
            rtpStatusRespond: false,
            hasPermissionToSendDuitNow: false,
            hasPermissionViewDuitNow: false,
            hasPermissionSendAutoDebit: false,
            hasPermissionViewAutoDebitList: false,
            flagEndDate: null,
            flagStartDate: null,
            flagExpiryDate: null,
            utilFlag: [],
        };

        this._pastChild = React.createRef();
        this._pendingChild = React.createRef();
        this._favChild = React.createRef();
    }

    /***
     * componentDidMount
     * Update Screen date
     */
    async componentDidMount() {
        //Pin and Password model close button listener
        this.props.updateModel({
            ui: {
                onCancelLogin: this.onPINLoginCancel,
            },
        });
        await this.isRtpEnabled();
        // for cta
        const { route, getModel, festiveAssets } = this.props;
        const { isFestivalReady, isTapTasticReady } = getModel("misc");
        const ctaAction = route?.params?.cta;
        // const fromGame = route?.params?.includeGreeting && route?.params?.routeFrom === "SortToWin";

        const updateScreenData = this.props.route.params?.updateScreenData ?? null;

        if (!updateScreenData) {
            if (ctaAction === "send" || ctaAction === "festiveSendMoney") this._onSendMoneyPress();
            if (ctaAction === "request") this._onRequestMoneyPress();

            // check for isFestivalReady flag for merdeka
            // if (ctaAction === "festiveSendMoney") {
            if (isFestivalReady || isTapTasticReady) {
                this._updateDataInScreen();
                this.setState({
                    festiveFlag: ctaAction === "festiveSendMoney",
                    festiveImage: festiveAssets?.greetingSend.topContainer,
                });
            }
        }

        this.focusSubscription = this.props.navigation.addListener("focus", async () => {
            //When come back to screen update the data

            const { getModel } = this.props;
            const { isPostLogin } = getModel("auth");
            if (!isPostLogin) {
                this._invokeL2();
            } else {
                this._updateDataInScreenAlways();
            }
        });
        FASendRequestDashboard.onScreenTab(this.state.activeTabIndex);
    }

    componentDidUpdate(pProps, pState) {
        if (
            pState?.activeTabIndex !== this.state?.activeTabIndex &&
            this.state?.activeTabIndex === 0
        ) {
            this.sendRequestMoneyPendingScreen?._getPendingSendRequestList();
        }
    }

    /***
     * componentWillUnmount
     * Handle Screen UnMount Event
     */
    componentWillUnmount() {
        this.setState({
            showIncomingRequestPopup: false,
            showDuitNowErrorPopup: false,
        });
        if (this.focusSubscription) {
            this.focusSubscription();
        }
    }

    /***
     * _invokeL2
     * Check and invoke L2 Pin
     */
    _invokeL2 = async () => {
        // L2 call to invoke login page
        const httpResp = await invokeL2(true);
        const result = httpResp.data;
        const { code } = result;
        if (code !== 0) {
            // if error happened close the pin model and close the screen
            this.props.navigation.goBack();
        } else {
            //if Pin is validated successful get screen data
            this._updateDataInScreen();
            this.isRtpEnabled();
        }
    };

    /***
     * _updateDataInChild
     *  update Data In Child
     */

    _updateDataInChild = () => {
        if (this.state.activeTabIndex === 0) {
            this.sendRequestMoneyPendingScreen?._getPendingSendRequestList();
        } else if (this.state.activeTabIndex === 1) {
            this.sendRequestMoneyPastScreen?.getAutoDebitListAPI({ status: "PAST" });
            this.sendRequestMoneyPastScreen?._getPastSendRequestList();
            this.sendRequestMoneyPastScreen?.getRtpListAPI();
        }
    };

    /***
     * _updateDataInScreenAlways
     * Load Screen data on every time come back to this screen
     */
    _updateDataInScreenAlways = () => {
        const { selectedContact } = this.state;

        let first = {};
        const doneFlow = this.props.route.params?.doneFlow ?? false;

        if (!doneFlow && selectedContact && selectedContact.length >= 1) {
            first = selectedContact[0];
            if (first && first.phoneNumber) {
                first.phoneNumber =
                    first.phoneNumber.indexOf("+") !== -1
                        ? first.phoneNumber.replace("+", "")
                        : first.phoneNumber;
            }
            this.setState({ selectedContact: [first] });
        } else {
            this._updateDataInChild();
            this.setState({ showContactPicker: false, showInScreenLoaderModal: false });
        }
        if (this.props.route?.params?.subModule) {
            this.setState(
                {
                    showInScreenLoaderModal: true,
                },
                () => {
                    this._handleNotificationNavigation();
                }
            );
        }
    };

    getDuitNowFlagsAPI = async (rtpReadyFlag) => {
        const permissionFlags = this.props.getModel("rpp")?.permissions;

        //if permissions not in context initiate api call
        if (permissionFlags?.flagAPICalled === false) {
            const res = await getDuitNowFlags();
            const cusType = this.props.getModel("user").cus_type;
            if (res?.data?.list) {
                const listing = res?.data?.list;
                const permissions = getPermissionObj({ listing, cusType });
                this.setState(
                    {
                        ...permissions,
                        utilFlag: listing,
                    },
                    async () => {
                        this.props.updateModel({
                            rpp: {
                                permissions,
                            },
                        });
                        await this.sendRequestMoneyPendingScreen?._refresh(rtpReadyFlag);
                    }
                );
            }
        } else {
            this.setState(
                {
                    ...permissionFlags,
                },
                async () => {
                    await this.sendRequestMoneyPendingScreen?._refresh(rtpReadyFlag);
                }
            );
        }
    };

    /***
     * _updateDataInScreen
     * Load Screen data on every time come back to this screen
     */
    _updateDataInScreen = async () => {
        const { getModel } = this.props;
        const { mobileNumber } = getModel("user");
        const userMayaFormatNum = convertMayaMobileFormat(mobileNumber);

        const acctNo = this.props.route.params?.acctNo ?? null;
        const screenDate = this.props.route.params?.screenDate ?? null;
        const activeTabIndex = this.props.route.params?.activeTabIndex ?? 0;

        this.setState(
            {
                acctNo,
                screenDate,
                userMobileNumber: userMayaFormatNum,
            },
            () => {
                this._setActiveTabIndex(activeTabIndex);
            }
        );
    };

    /***
     * _handleNotificationNavigation
     * Handle Notification Navigation
     */
    _handleNotificationNavigation = () => {
        const subModule = this.props.route?.params?.subModule;

        const index = subModule === "SEND_RCV_PAST_TXN" ? 1 : 0;
        if (subModule) {
            this.setState({
                showLoaderModal: true,
                activeTabIndex: index,
                index,
            });
        } else {
            this.setState({
                showLoaderModal: false,
                showInScreenLoaderModal: false,
                activeTabIndex: index,
                index,
            });
        }
    };

    /***
     * _setActiveTabIndex
     * Set tab view current tab
     */
    _setActiveTabIndex = (index) => {
        if (index) {
            this.setState({
                activeTabIndex: index,
                index,
            });
        }
    };

    /***
     * onPINLoginCancel
     * On Close button click in Pin
     */
    onPINLoginCancel = () => {
        this.setState(
            {
                showLoaderModal: false,
                showInScreenLoaderModal: false,
            },
            () => {
                this.props.navigation.goBack(true);
            }
        );
    };

    /***
     * _onBackPress
     * Handle screen back button
     */
    _onBackPress = () => {
        // this.props.navigation.goBack();
        this.props.navigation.navigate(navigationConstant.TAB_NAVIGATOR, {
            screen: navigationConstant.DASHBOARD,
        });
    };

    /***
     * handleTabChange
     * Handle Tab View tab change
     */
    handleTabChange = (activeTabIndex) => {
        this.setState({ activeTabIndex });
        FASendRequestDashboard.onScreenTab(activeTabIndex);
    };

    /***
     * _onPayRequestPress
     * On pay now button click from pop when request item click
     */
    _onPayRequestPress = (item) => {
        const contactObj = {
            formatedPhoneNumber: formateAccountNumber(
                item.senderMobileNo,
                item.senderMobileNo ? item.senderMobileNo.length : 12
            ),
            isSelected: false,
            isSyncedThroughMaya: true,
            mayaUserId: item.senderId,
            mayaUserName: item.senderName,
            name: item.name,
            phoneNumber: item.senderMobileNo,
            phoneNumbers: [
                {
                    id: "2",
                    label: "mobile",
                    number: item.senderMobileNo,
                },
            ],
            profilePicUrl: item.senderProfilePic,
            thumbnailPath: item.senderProfilePic,
        };
        const selectedContact = [];
        selectedContact.push(contactObj);

        this.setState(
            {
                sendMoneyFlow: 1,
                selectedContact,
                item,
                payRequest: true,
                sendMoneyId: item.id,
            },
            () => {
                this.onContactDone();
            }
        );
    };

    /***
     * _onShowIncomingRequestPopupPress
     * show incoming request show the pay now popup
     */
    _onShowIncomingRequestPopupPress = (title, item) => {
        FASendRequestTransaction.incomingRequest();

        const { getModel } = this.props;
        const { isSessionTimeout } = getModel("auth");
        if (isSessionTimeout) {
            return;
        }
        this.setState({
            item,
            incomingRequestTitle: title,
            showIncomingRequestPopup: true,
        });
    };

    /***
     * onRejectNow
     * On Reject Request button click from pop when request item click
     */
    onRejectNow = () => {
        const { getModel } = this.props;
        const { isSessionTimeout } = getModel("auth");
        if (isSessionTimeout) {
            return;
        }

        this.setState({ showIncomingRequestPopup: false, showInScreenLoaderModal: false });

        FASendRequestTransaction.requestRejected();

        //this.props.onRejectRequestPress(item);
        //Call API to update to REJECT status
        this.sendRequestMoneyPendingScreen?._updateStatusSendRcvMoney("REJECT");
    };

    /***
     * onPayNow
     * On pay now button click from pop when request item click
     */
    onPayNow = () => {
        const { getModel } = this.props;
        const { isSessionTimeout } = getModel("auth");
        if (isSessionTimeout) {
            return;
        }

        const { item } = this.state;

        //If the status not APPROVED call api to update the status to approved status next time if user click the same request don't show the pop up take user to paymant
        if (item?.originalStatus !== "APROVED") {
            this.sendRequestMoneyPendingScreen?._updateStatusSendRcvMoney("APROVED");
        }
        if (item) {
            this.setState(
                {
                    showIncomingRequestPopup: false,
                    showInScreenLoaderModal: false,
                },
                async () => {
                    try {
                        setTimeout(async () => {
                            //Check for L3 token for Fun transfer
                            const httpResp = await invokeL3(true);
                            const result = httpResp.data;
                            const { code } = result;
                            if (code === 0) {
                                //After L3 Token proceed to fund transfer flow
                                this._onPayRequestPress(item);
                            }
                        }, 500);
                    } catch {}
                }
            );
        }
    };

    /***
     * _onPayAcceptedRequest
     * After payment proceed to fund transfer
     */
    _onPayAcceptedRequest = (item) => {
        this.setState(
            {
                item,
            },
            () => {
                this.onPayNow();
            }
        );
    };

    /***
     * _onNotificationRequestReqId
     * on Notification Request ReqId
     */
    _onNotificationRequestReqId = (reqId) => {
        this.setState({
            reqId,
        });
    };

    /***
     * hideIncomingRequestPopup
     * Handle incoming request popup close event
     */
    hideIncomingRequestPopup = () => {
        this.sendRequestMoneyPendingScreen?._onNotificationClickHandled(true);
        this.setState({
            showIncomingRequestPopup: false,
            showInScreenLoaderModal: false,
        });
    };

    /***
     * _onRejectRequestPress
     * On Reject request from child called
     */
    _onRejectRequestPress = () => {};

    /***
     * onAutoDebitPress
     * On AutoDebit request from child called
     */
    _onAutoDebitPress = () => {
        const { rtpStatus } = this.state;
        if (
            !rtpStatus.isRtdEnabled ||
            rtpStatus?.merchantDetails?.status === "03" ||
            rtpStatus?.merchantDetails?.statusdesc === Strings.MERCHANT_NOT_EXIST
        ) {
            this.setState({ showRegisterDuitnowAutoDebitPopup: true });
            return;
        }
        this._onRequestToPayPress(Strings.RTP_AUTODEBIT);
    };

    /***
     * _onSendMoneyPress
     * On send money button click form pending and past tabs
     */
    _onSendMoneyPress = async () => {
        const type =
            this.state.activeTabIndex === 1
                ? "Past"
                : this.state.activeTabIndex === 2
                ? "Favourites"
                : "Pending";
        analyticsDashboard(type, Strings.SEND_MONEY);
        const { getModel, route } = this.props;
        const { isPostPassword } = getModel("auth");
        const ctaAction = route?.params?.cta;
        const { activeTabIndex } = this.state;
        FASendRequestDashboard.onSelectAction(activeTabIndex, "Send Money");
        // L3 call to invoke login page
        if (!isPostPassword) {
            const httpResp = await invokeL3(true);
            const code = httpResp?.data?.code ?? null;
            if (code !== 0) return;
        }

        //set contact fileter to all
        this.setState({ selectedContact: [], onlyMayaContacts: "all" }, () => {
            this.setState({
                festiveFlag: ctaAction === "festiveSendMoney",
                fromCta: ctaAction === "festiveSendMoney",
                showContactPicker: true,
                sendMoneyFlow: 1,
                payRequest: false,
            });
        });
    };

    /***
     * _onRequestMoneyPress
     * On request money button click form pending and past tabs
     */
    _onRequestMoneyPress = () => {
        const { activeTabIndex } = this.state;
        FASendRequestDashboard.onSelectAction(activeTabIndex, "Request Money");

        const type =
            this.state.activeTabIndex === 1
                ? "Past"
                : this.state.activeTabIndex === 2
                ? "Favourites"
                : "Pending";
        analyticsDashboard(type, Strings.REQUEST_MONEY);
        //set contact filter to only maya
        this.setState({ selectedContact: [], onlyMayaContacts: "maya" }, () => {
            this.setState({ showContactPicker: true, sendMoneyFlow: 2, payRequest: false });
        });
    };

    /***
     * _acctDetails
     * get the details for fund transfer from mobile number
     */
    _acctDetails = (mobileNumber, transferParams) => {
        this.setState({ mobileNumber });
        const subUrl = "/sendRcvMoney/acctDetails?mobileNo=" + mobileNumber;
        const { routeFrom } = this.props.route?.params || {};
        try {
            acctDetails(subUrl)
                .then(async (response) => {
                    const responseObject = response.data;
                    const result = responseObject.result;

                    if (responseObject?.message === "success") {
                        const primaryAcct = result.primaryAcct;
                        const formatedAccountNumber = formateAccountNumber(primaryAcct, 12);
                        hideToast();

                        transferParams.formatedAccountNumber = formatedAccountNumber;
                        transferParams.toAccountCode = "";
                        transferParams.toAccount = primaryAcct;
                        transferParams.formattedToAccount = formatedAccountNumber;
                        transferParams.primaryAcctName = result.primaryAcctName;
                        transferParams.actualAccHolderName = result.primaryAcctName;
                        transferParams.recipientName = result.primaryAcctName;
                        transferParams.accountName = result.primaryAcctName;
                        transferParams.actualAccHolderName = result.primaryAcctName;
                        transferParams.userName = result.userName;
                        transferParams.fullName = result.fullName;
                        transferParams.reference = "Send Money";
                        transferParams.image = result.profilePic;
                        transferParams.profilePic = result.profilePic;
                        transferParams.functionsCode = 15;
                        const {
                            payRequest,
                            item,
                            festiveFlag,
                            festiveImage,
                            fromCta,
                            sendMoneyFlow,
                        } = this.state;

                        const { isTapTasticReady } = this.props.getModel("misc");

                        if (payRequest) {
                            transferParams.amount = item.formattedAmount;
                            transferParams.formattedAmount = item.formattedAmount;

                            const stateData = {};
                            const { getModel, updateModel } = this.props;
                            // Fetch CASA accounts
                            //const casaAccounts = await this.fetchAccountsList();
                            stateData.transferParams = transferParams;
                            // Check for S2u registration //passing new paramerter updateModel for s2u interops
                            const { flow, secure2uValidateData } = await checks2UFlow(
                                15,
                                getModel,
                                updateModel
                            );
                            stateData.flow = flow;
                            stateData.secure2uValidateData = secure2uValidateData;

                            this.setState({
                                showIncomingRequestPopup: false,
                                showInScreenLoaderModal: false,
                            });

                            if (flow === navigationConstant.SECURE2U_COOLING) {
                                const {
                                    navigation: { navigate },
                                } = this.props;
                                navigateToS2UCooling(navigate);
                            } else if (flow === "S2UReg") {
                                stateData.flowType = flow;
                                this.props.navigation.navigate(
                                    navigationConstant.ONE_TAP_AUTH_MODULE,
                                    {
                                        screen: "Activate",
                                        params: {
                                            flowParams: {
                                                success: {
                                                    stack: navigationConstant.FUNDTRANSFER_MODULE,
                                                    screen: navigationConstant.TRANSFER_CONFIRMATION_SCREEN,
                                                },
                                                fail: {
                                                    stack: navigationConstant.SEND_REQUEST_MONEY_STACK,
                                                    screen: navigationConstant.SEND_REQUEST_MONEY_DASHBOARD,
                                                },
                                                params: stateData,
                                            },
                                        },
                                    }
                                );
                            } else {
                                this.props.navigation.navigate(
                                    navigationConstant.FUNDTRANSFER_MODULE,
                                    {
                                        screen: navigationConstant.TRANSFER_CONFIRMATION_SCREEN,
                                        params: { secure2uValidateData, transferParams, flow },
                                    }
                                );
                            }
                        } else {
                            this.props.navigation.navigate(
                                navigationConstant.SEND_REQUEST_MONEY_AMOUNT,
                                {
                                    transferParams: {
                                        ...transferParams,
                                        routeFrom: routeFrom === "SortToWin" ? routeFrom : null,
                                    },
                                    festiveFlag:
                                        (isTapTasticReady && fromCta) || routeFrom === "SortToWin",
                                    fromCta,
                                    // festiveObj: this.props.route?.params?.festiveObj ?? {},
                                    festiveObj: {
                                        backgroundImage: festiveImage,
                                    },
                                    sendMoneyFlow,
                                }
                            );
                        }

                        this.setState({
                            showIncomingRequestPopup: false,

                            showInScreenLoaderModal: false,
                        });
                    } else {
                        this.setState({ showInScreenLoaderModal: false }, () => {
                            showErrorToast({
                                message: Strings.PLEASE_INPUT_A_VALID_ACCOUNT_NUMBER,
                            });
                        });
                    }
                })
                .catch(() => {
                    //this.setState({ showContactPicker: false });
                    this.setState({ showDuitNowPopup: true, showInScreenLoaderModal: false });

                    FASendRequestTransaction.accNotLinked();
                });
        } catch (e) {
            this.setState({
                showContactPicker: false,

                showInScreenLoaderModal: false,
            });
            showErrorToast({
                message: Strings.PLEASE_INPUT_A_VALID_ACCOUNT_NUMBER,
            });
        }
    };

    /***
     * onContactDone
     * Handle on done button press after selecting a contact navigate based on flow
     */
    onContactDone = () => {
        const { isTapTasticReady, tapTasticType } = this.props.getModel("misc");

        let contactObj;
        const { item, payRequest } = this.state;
        if (
            (this.state.selectedContact && this.state.selectedContact.length) ||
            item.originalStatus === "APROVED"
        ) {
            contactObj = this.state.selectedContact[0];

            if (contactObj !== undefined && contactObj != null) {
                let phoneNumber = payRequest ? item.receiverMobileNo : contactObj.phoneNumber;
                const cleanedupNo = phoneNumber.replace(/[^0-9]/gi, "");

                phoneNumber = isMalaysianMobileNum(cleanedupNo)
                    ? convertMayaMobileFormat(cleanedupNo)
                    : cleanedupNo;
                phoneNumber =
                    phoneNumber && phoneNumber.indexOf("+") === -1
                        ? `+${phoneNumber}`
                        : phoneNumber;

                contactObj.phoneNumber = phoneNumber;
                const formattedToAccount = ""
                    .substring(0, 12)
                    .replace(/[^\dA-Z]/g, "")
                    .replace(/(.{4})/g, "$1 ")
                    .trim();

                const {
                    screenDate,
                    sendMoneyFlow,
                    sendMoneyId,
                    userMobileNumber,
                    fromCta,
                    festiveImage,
                } = this.state;

                const routeFrom = screenDate?.routeFrom ?? "Dashboard";

                const transferParams = {
                    transferFlow: 15,
                    functionsCode: 15,
                    accountName: contactObj.name,
                    toAccount: "",
                    toAccountCode: "",
                    accounts: "",
                    fromAccount: this.state.acctNo,
                    fromAccountCode: "",
                    fromAccountName: contactObj.name,
                    formattedToAccount,
                    image: contactObj.profilePicUrl,
                    profilePicUrl: contactObj.profilePicUrl,
                    imageBase64: false,
                    bankName: "Maybank",
                    amount: "0.00",
                    formattedAmount: "0.00",
                    reference: "",
                    minAmount: 0.0,
                    maxAmount: 50000.0,
                    amountError: Strings.AMOUNT_ERROR_RTP,
                    screenLabel: Strings.ENTER_AMOUNT,
                    screenTitle: Strings.TRANSFER,
                    receiptTitle: Strings.THIRD_PARTY_TRANSFER,
                    recipientName: "",
                    transactionDate: "",
                    transactionStartDate: "",
                    transactionEndDate: "",
                    isFutureTransfer: false,
                    isRecurringTransfer: false,
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
                    phoneNumber: this.state.payRequest ? item.receiverMobileNo : phoneNumber,
                    name: contactObj.name,
                    contactObj,
                    payRequest,
                    sendMoneyId,
                    note: item.note,
                    recipientNotes: item.note,
                    userMobileNumber,
                    includeGreeting: this.props.route.params?.includeGreeting,
                };

                if (sendMoneyFlow === 1) {
                    //Send Money Flow
                    transferParams.transferFlow = 15;

                    this._acctDetails(
                        this.state.payRequest ? item.receiverMobileNo : cleanedupNo,
                        transferParams
                    );
                } else {
                    //Request Money Flow
                    transferParams.transferFlow = 16;

                    this.props.navigation.navigate(navigationConstant.SEND_REQUEST_MONEY_AMOUNT, {
                        transferParams,
                        fromCta,
                        // festiveObj: this.props.route?.params?.festiveObj ?? {},
                        festiveFlag: isTapTasticReady && tapTasticType === "cny",
                        festiveObj: {
                            backgroundImage: festiveImage,
                        },
                        sendMoneyFlow,
                    });
                }
            } else {
                //If no contact selected show error pop
                this.setState({
                    errorMessage: Strings.PLEASE_SELECT_CONTACT_TO_PROCEED_FURTHER,
                });
            }
        }
    };

    /***
     * onContactBackPress
     * Handle on back button click in contact model
     */
    onContactBackPress = () => {
        const cta = this.props?.route?.params?.cta ?? null;
        if (cta === "festiveSendMoney" || cta === "send" || cta === "request") {
            this._onBackPress();
            return;
        }

        this.setState({ showContactPicker: false });
    };

    /***
     * onContactRefresh
     * Handle on refresh button click in contact model
     */
    onContactRefresh = () => {
        this.setState({ selectedContact: [] });
    };

    logEventFunc = () => {
        FASendRequestDashboard.onSelectContact(this.state.sendMoneyFlow);
    };

    /***
     * onContactSelected
     * When contact selected store in state do the process after done button click
     */
    onContactSelected = (selectedItem) => {
        const cloneSelected = [...this.state.selectedContact];
        const newArray = contactsSingleSelectOperation(selectedItem, cloneSelected, 1, () => {});
        this.setState({ selectedContact: newArray });
    };

    /***
     * hideDuitNowPopup
     * Hide DuitNow popup
     */
    hideDuitNowPopup = () => {
        this.setState({
            showDuitNowPopup: false,
            showContactPicker: false,
            showLoaderModal: false,

            showInScreenLoaderModal: false,
            showRegisterDuitnowAutoDebitPopup: false,
            showRegisterDuitnowRequestPopup: false,
        });

        const cta = this.props?.route?.params?.cta ?? null;
        if (cta === "festiveSendMoney") {
            this._onBackPress();
        }
    };

    /***
     * toggleShowInScreenLoaderModal
     * toggle in Screen Loader view based on param
     */
    toggleShowInScreenLoaderModal = (value) => {
        this.setState({
            showInScreenLoaderModal: value,
            showLoaderModal: value,
        });
    };

    /***
     * doDuitNowFlow
     * if user click pay with DuitNow from popup proceed with DuitNow flow
     */
    doDuitNowFlow = () => {
        this.setState({ showDuitNowPopup: false, showInScreenLoaderModal: false });
        this.duitnowIdInquiry();
    };

    /***
     * duitnowIdInquiry
     * Do duitNow mobile number inquiry
     */
    duitnowIdInquiry = () => {
        const { mobileNumber, festiveFlag, festiveImage, fromCta } = this.state;
        const subUrl = "/duitnow/status/inquiry?proxyId=" + mobileNumber + "&proxyIdType=MBNO";

        const transferParamsPrevious = this.props.route.params?.transferParams ?? {};

        //Call DuitNow inquiry api
        duitnowStatusInquiry(subUrl)
            .then(async (response) => {
                const result = response.data;
                if (result != null) {
                    const resultData = result.result;

                    if (result.code === 200) {
                        const transferParams = {
                            transferFlow: 12,
                            functionsCode: resultData.maybank ? 12 : 27,
                            transferTypeName: "Duit Now",
                            transactionMode: "Duit Now",
                            isMaybankTransfer: false,
                            transferRetrievalRefNo: resultData.retrievalRefNo,
                            transferProxyRefNo: resultData.proxyRefNo,
                            transferRegRefNo: resultData.regRefNo,
                            transferAccType: resultData.accType,
                            transferBankCode: resultData.bankCode,
                            recipientNameMaskedMessage: resultData.recipientNameMaskedMessage,
                            recipientNameMasked: resultData.recipientNameMasked,
                            nameMasked: resultData.nameMasked,
                            toAccountCode: resultData.bankCode,
                            transferBankName: resultData.bankName,
                            accHolderName: resultData.accHolderName,
                            primaryAcctName: resultData.accHolderName,
                            recipientName: resultData.accHolderName,
                            accountName: resultData.accHolderName,
                            actualAccHolderName: resultData.actualAccHolderName,
                            transferLimitInd: resultData.limitInd,
                            transferMaybank: resultData.maybank,
                            transferOtherBank: !resultData.maybank,
                            transferAccNumber: resultData.accNo,
                            formattedToAccount: resultData.accNo,
                            idValue: mobileNumber,
                            idValueFormatted: formatMobileNumbers(mobileNumber),
                            idType: "MBNO",
                            idTypeText: "Mobile Number",
                            image: {
                                image: Strings.DUINTNOW_IMAGE,
                                imageName: Strings.DUINTNOW_IMAGE,
                                imageUrl: Strings.DUINTNOW_IMAGE,
                                shortName: resultData.accHolderName,
                                type: true,
                            },
                            bankName: resultData.maybank ? "Maybank" : "",
                            imageBase64: true,
                            amount: "0.00",
                            formattedAmount: "0.00",
                            reference: "",
                            minAmount: 0.0,
                            maxAmount: 50000.0,
                            amountError: Strings.AMOUNT_ERROR_RTP,
                            screenLabel: Strings.ENTER_AMOUNT,
                            screenTitle: Strings.DUITNOW,
                            toAccount: resultData.accNo,
                            receiptTitle: Strings.DUITNOW,
                            transactionDate: "",
                            isFutureTransfer: false,
                            toAccountBank: resultData.maybank ? "Maybank" : "",
                            fromAccount:
                                transferParamsPrevious && transferParamsPrevious.fromAccount
                                    ? transferParamsPrevious.fromAccount
                                    : "",
                            formattedFromAccount: "",
                            transferType: null,
                            transferSubType: null,
                            twoFAType: null,
                            mbbbankCode: resultData.bankCode,
                            endDateInt: 0,
                            startDateInt: 0,
                            selectedIDTypeIndex: 0,
                            transferFav: false,
                            isSendMoneyDuitNowFlow: true,
                        };
                        this.props.navigation.navigate(navigationConstant.FUNDTRANSFER_MODULE, {
                            screen: navigationConstant.DUITNOW_ENTER_AMOUNT,
                            params: {
                                transferParams,
                                isSendMoneyDuitNowFlow: true,
                                festiveFlag: fromCta,
                                fromCta,
                                // festiveObj: this.props.route?.params?.festiveObj ?? {},
                                festiveObj: {
                                    backgroundImage: festiveImage,
                                },
                            },
                        });
                        this.setState({
                            showContactPicker: festiveFlag,
                            showLoaderModal: false,
                        });
                    } else {
                        FASendRequestTransaction.accNotLinked();
                        this.setState({ showDuitNowErrorPopup: true });
                    }
                } else {
                    this.setState({ showDuitNowErrorPopup: true });
                }
            })
            .catch(() => {
                this.setState({ showDuitNowErrorPopup: true });
            });
    };

    /***
     * inviteDuitNowFlow
     * if DuitNow inquiry failed and user clicks invite the to register for DuitNow send message
     */
    inviteDuitNowFlow = () => {
        this.setState(
            {
                showDuitNowErrorPopup: false,
                showLoaderModal: false,

                showInScreenLoaderModal: false,
            },
            () => {
                setTimeout(() => {
                    this.inviteFromSendMoney();
                }, 500);
            }
        );
    };

    /***
     * hideDuitNowErrorPopup
     * Handle on Duitnow inquiry popup close event
     */
    hideDuitNowErrorPopup = () => {
        this.setState({
            showDuitNowErrorPopup: false,
            showContactPicker: false,
            showLoaderModal: false,

            showInScreenLoaderModal: false,
        });

        const cta = this.props?.route?.params?.cta ?? null;
        if (cta === "festiveSendMoney") {
            this._onBackPress();
        }
    };

    /***
     * inviteFromSendMoney
     * if DuitNow inquiry fails and user clicks invite button prepare the message and open common share
     */
    inviteFromSendMoney = async () => {
        const message =
            Strings.NOT_ON_MAE_YOU_MISSING_OUT +
            "\n\n" +
            Strings.CHECK_THE_ALL_NEW_MAE +
            "\n\n" +
            Strings.DOWNLOAD_THE_MAE_APP;
        const shareOptions = {
            title: "Invite",
            message,
        };
        try {
            Share.open(shareOptions)
                .then(() => {})
                .catch(() => {});
        } catch (error) {}
    };

    /***
     * analyticsLogCurrentTab
     * analytics Log Current Tab
     */
    analyticsLogCurrentTab = (index) => {
        const tabName = index === 1 ? "Past" : index === 2 ? "Favourites" : "Pending";
        RTPanalytics.viewDashboard(tabName);
    };

    _onRequestToPayPress = async (type) => {
        const { activeTabIndex, rtpStatus } = this.state;
        logEvent(Strings.FA_SELECT_ACTION, {
            [Strings.FA_SCREEN_NAME]: "M2U - Send Request Money",
            [Strings.FA_TAB_NAME]:
                activeTabIndex === 0
                    ? Strings.FA_PENDING
                    : activeTabIndex === 1
                    ? Strings.FA_PAST
                    : activeTabIndex === 2
                    ? Strings.FA_FAVOURITES
                    : "",
            [Strings.FA_ACTION_NAME]: Strings.DUITNOW_REQUEST,
        });

        if (
            (this.isCustomerTypeSoleProp() &&
                !rtpStatus.isRtpEnabled &&
                type !== Strings.RTP_AUTODEBIT) ||
            rtpStatus?.merchantDetails?.status === "03" ||
            rtpStatus?.merchantDetails?.statusdesc === Strings.MERCHANT_NOT_EXIST
        ) {
            this.setState({ showRegisterDuitnowRequestPopup: true });
            return;
        }

        const { cus_type } = this.props.getModel("user");

        analyticsSelectItem(Strings.REQUEST_TO_PAY);
        const { flagEndDate, flagExpiryDate, flagStartDate } = this.state;
        if (cus_type !== "02") {
            this.props.navigation.navigate(navigationConstant.REQUEST_TO_PAY_STACK, {
                screen: navigationConstant.DUITNOW_DECOUPLED_REQUEST_SCREEN,
                params: {
                    isFav: false,
                    soleProp: false,
                    isRtpEnabled: true,
                    isRtdEnabled: "",
                    rtpType:
                        type === Strings.RTP_AUTODEBIT
                            ? Strings.RTP_AUTODEBIT
                            : Strings.DUITNOW_REQUEST,
                },
            });
        } else {
            try {
                if (this.state.rtpStatusRespond) {
                    this.props.navigation.navigate(navigationConstant.REQUEST_TO_PAY_STACK, {
                        screen:
                            type === Strings.RTP_AUTODEBIT
                                ? navigationConstant.RTP_AUTODEBIT_ID_SCREEN
                                : navigationConstant.DUITNOW_DECOUPLED_REQUEST_SCREEN,
                        params: {
                            isFav: false,
                            soleProp: cus_type === "02",
                            ...this.state.rtpStatus,
                            rtpType:
                                type === Strings.RTP_AUTODEBIT
                                    ? Strings.RTP_AUTODEBIT
                                    : Strings.DUITNOW_REQUEST,
                            flagEndDate,
                            flagStartDate,
                            flagExpiryDate,
                            hasPermissionToggleAutoDebit: this.state.hasPermissionToggleAutoDebit,
                        },
                    });
                } else {
                    const msg = Strings.REQUEST_COULD_NOT_BE_PROCESSED;
                    showErrorToast({
                        message: msg,
                    });
                }
            } catch (err) {
                showErrorToast({
                    message: err?.message ?? Strings.REQUEST_COULD_NOT_BE_PROCESSED,
                });
            }
        }
    };

    isRtpEnabled = async () => {
        try {
            const { getModel } = this.props;
            const auth = getModel("auth");
            if (auth?.isPostLogin) {
                this.getDuitNowFlagsAPI(true);
                this.getRtpStatus();
            } else if (!auth?.isPostLogin) {
                this._invokeL2();
            }
        } catch (ex) {
            showErrorToast({
                message: ex?.message ?? Strings.REQUEST_COULD_NOT_BE_PROCESSED,
            });
        }
    };

    getRtpStatus = async () => {
        const checkSoleProp = this.isCustomerTypeSoleProp();
        const { updateModel } = this.props;

        try {
            // update model for merchant inquiry if not yet updated
            if (checkSoleProp) {
                const { merchantInquiry } = this.props.getModel("rpp");
                if (merchantInquiry?.merchantId === null) {
                    const response = await rtpStatus();
                    const result = response?.data?.result;
                    const isRtdEnabled = result?.rtd === "Y";
                    const isRtpEnabled = result?.rtp === "Y";

                    const rtpStatusObj = {
                        isRtdEnabled,
                        isRtpEnabled,
                        sourceFunds: result?.asof,
                        productId: result?.productId,
                        merchantId: result?.merchantId,
                        senderBrn: result?.brn,
                        merchantDetails: result,
                    };

                    updateModel({
                        rpp: {
                            merchantInquiry: {
                                productId: result?.productId,
                                productName: result?.productName,
                                rtd: result?.rtd,
                                rtp: result?.rtp,
                                accNo: result?.accNo,
                                merchantId: result?.merchantId,
                                merchantName: result?.merchantName,
                                brn: result?.brn,
                                status: result?.status,
                                statusdesc: result?.statusdesc,
                                asof: result?.asof,
                            },
                        },
                    });

                    this.setState({
                        rtpStatus: rtpStatusObj,
                        rtpStatusRespond: response?.data?.code === 200,
                    });
                } else {
                    this.setState({
                        rtpStatus: {
                            isRtdEnabled: merchantInquiry?.rtd === "Y",
                            isRtpEnabled: merchantInquiry?.rtp === "Y",
                            sourceFunds: merchantInquiry?.asof,
                            productId: merchantInquiry?.productId,
                            merchantId: merchantInquiry?.merchantId,
                            senderBrn: merchantInquiry?.brn,
                            merchantDetails: merchantInquiry,
                        },
                        rtpStatusRespond: true,
                    });
                }
            } else {
                this.individualCheck(checkSoleProp);
            }
        } catch (err) {
            this.individualCheck(checkSoleProp);
        }
    };

    individualCheck = (checkSoleProp) => {
        const rtpStatusObj = {
            isRtdEnabled: false,
            isRtpEnabled: checkSoleProp === false,
            sourceFunds: null,
            productId: null,
            merchantId: null,
            senderBrn: null,
            merchantDetails: null,
        };

        this.setState({
            rtpStatus: rtpStatusObj,
            rtpStatusRespond: false,
        });
    };

    onMoreInfo = () => {
        this.hideDuitNowPopup();

        Linking.openURL(DUIT_NOW_URL);
    };

    isCustomerTypeSoleProp = () => {
        const { cus_type } = this.props.getModel("user");
        return cus_type === "02";
    };

    render() {
        const { navigation, route, getModel, festiveAssets } = this.props;
        const { cus_type } = getModel("user");
        const { isTapTasticReady } = getModel("misc");
        const {
            showErrorModal,
            errorMessage,
            index,
            activeTabIndex,
            showLoaderModal,
            showInScreenLoaderModal,
            festiveFlag,
            festiveImage,
            hasPermissionToSendDuitNow,
            hasPermissionViewDuitNow,
            hasPermissionSendAutoDebit,
            hasPermissionViewAutoDebitList,
            hasPermissionToggleAutoDebit,
        } = this.state;
        const permission = {
            hasPermissionToSendDuitNow,
            hasPermissionViewDuitNow,
            hasPermissionSendAutoDebit,
            hasPermissionViewAutoDebitList,
            hasPermissionToggleAutoDebit,
        };
        const childData = this.props.route.params?.prevData ?? {};
        childData.cusType = cus_type;
        childData.permission = permission;

        return (
            <React.Fragment>
                <ScreenContainer
                    backgroundType="color"
                    showErrorModal={showErrorModal}
                    errorMessage={errorMessage}
                    showOverlay={false}
                    backgroundColor={MEDIUM_GREY}
                    showLoaderModal={showLoaderModal}
                >
                    <ScreenLayout
                        header={
                            <HeaderLayout
                                headerCenterElement={
                                    <Typo
                                        fontSize={16}
                                        fontWeight="600"
                                        lineHeight={19}
                                        text={Strings.SEND_AND_REQUEST}
                                    />
                                }
                                headerLeftElement={<HeaderBackButton onPress={this._onBackPress} />}
                            />
                        }
                        useSafeArea
                        paddingHorizontal={0}
                        paddingBottom={0}
                    >
                        <React.Fragment>
                            <TabView
                                defaultTabIndex={index}
                                activeTabIndex={activeTabIndex}
                                onTabChange={this.handleTabChange}
                                titles={
                                    this.state.rtpStatus?.isRtpEnabled
                                        ? [
                                              Strings.PENDING_CAP,
                                              Strings.PAST,
                                              Strings.DUITNOW_FAVOURITE,
                                          ]
                                        : [Strings.PENDING_CAP, Strings.PAST]
                                }
                                screens={[
                                    activeTabIndex === 0 ? (
                                        <SendRequestMoneyPendingScreen
                                            key="0"
                                            index={0}
                                            activeTabIndex={activeTabIndex}
                                            navigation={navigation}
                                            route={route}
                                            fromAccount={this.props.route.params?.acctNo ?? null}
                                            data={childData}
                                            screenDate={this.props.route.params?.screenDate ?? null}
                                            onSendMoneyPress={this._onSendMoneyPress}
                                            onAutoDebitPress={this._onAutoDebitPress}
                                            onRequestMoneyPress={this._onRequestMoneyPress}
                                            onPayRequestPress={this._onPayRequestPress}
                                            onRejectRequestPress={this._onRejectRequestPress}
                                            onPayAcceptedRequest={this._onPayAcceptedRequest}
                                            onNotificationRequestReqId={
                                                this._onNotificationRequestReqId
                                            }
                                            onShowIncomingRequestPopupPress={
                                                this._onShowIncomingRequestPopupPress
                                            }
                                            updateDataInChild={this._updateDataInChild}
                                            toggleLoader={this.toggleShowInScreenLoaderModal}
                                            toggleShowInScreenLoaderModal={
                                                this.toggleShowInScreenLoaderModal
                                            }
                                            ref={(sendRequestMoneyPendingScreen) => {
                                                this.sendRequestMoneyPendingScreen =
                                                    sendRequestMoneyPendingScreen;
                                            }}
                                            isRtpEnabled={this.state.rtpStatus?.isRtpEnabled}
                                            reqId={this.state.reqId}
                                            onRequestToPayPress={this._onRequestToPayPress}
                                            isCustomerTypeSoleProp={this.isCustomerTypeSoleProp()}
                                            utilFlg={this.state.utilFlag}
                                            {...this.props}
                                        />
                                    ) : (
                                        <></>
                                    ),
                                    activeTabIndex === 1 ? (
                                        <SendRequestMoneyPastScreen
                                            key="1"
                                            index={1}
                                            activeTabIndex={activeTabIndex}
                                            navigation={navigation}
                                            route={route}
                                            fromAccount={this.props.route.params?.acctNo ?? null}
                                            data={childData}
                                            screenDate={this.props.route.params?.screenDate ?? null}
                                            onSendMoneyPress={this._onSendMoneyPress}
                                            onAutoDebitPress={this._onAutoDebitPress}
                                            onRequestMoneyPress={this._onRequestMoneyPress}
                                            onPayRequestPress={this._onPayRequestPress}
                                            toggleLoader={this.toggleShowInScreenLoaderModal}
                                            toggleShowInScreenLoaderModal={
                                                this.toggleShowInScreenLoaderModal
                                            }
                                            onNotificationRequestReqId={
                                                this._onNotificationRequestReqId
                                            }
                                            updateDataInChild={this._updateDataInChild}
                                            ref={(sendRequestMoneyPastScreen) => {
                                                this.sendRequestMoneyPastScreen =
                                                    sendRequestMoneyPastScreen;
                                            }}
                                            isRtpEnabled={this.state.rtpStatus?.isRtpEnabled}
                                            reqId={this.state.reqId}
                                            onRequestToPayPress={this._onRequestToPayPress}
                                            isCustomerTypeSoleProp={this.isCustomerTypeSoleProp()}
                                            utilFlg={this.state.utilFlag}
                                            {...this.props}
                                        />
                                    ) : (
                                        <></>
                                    ),

                                    activeTabIndex === 2 ? (
                                        <SendRequestMoneyRTPFavScreen
                                            key="2"
                                            index={2}
                                            activeTabIndex={activeTabIndex}
                                            navigation={navigation}
                                            route={route}
                                            fromAccount={this.props.route.params?.acctNo ?? null}
                                            data={childData}
                                            screenDate={this.props.route.params?.screenDate ?? null}
                                            onSendMoneyPress={this._onSendMoneyPress}
                                            onAutoDebitPress={this._onAutoDebitPress}
                                            onRequestMoneyPress={this._onRequestMoneyPress}
                                            onPayRequestPress={this._onPayRequestPress}
                                            toggleLoader={this.toggleShowInScreenLoaderModal}
                                            toggleShowInScreenLoaderModal={
                                                this.toggleShowInScreenLoaderModal
                                            }
                                            onNotificationRequestReqId={
                                                this._onNotificationRequestReqId
                                            }
                                            updateDataInChild={this._updateDataInChild}
                                            ref={(sendRequestMoneyFavScreen) => {
                                                this.sendRequestMoneyFavScreen =
                                                    sendRequestMoneyFavScreen;
                                            }}
                                            isRtpEnabled={this.state.rtpStatus?.isRtpEnabled}
                                            reqId={this.state.reqId}
                                            onRequestToPayPress={this._onRequestToPayPress}
                                            isCustomerTypeSoleProp={this.isCustomerTypeSoleProp()}
                                            {...this.props}
                                        />
                                    ) : (
                                        <></>
                                    ),
                                ]}
                            />
                        </React.Fragment>
                    </ScreenLayout>
                    {showInScreenLoaderModal && <ScreenLoader showLoader={true} />}
                </ScreenContainer>
                {(this.state.showContactPicker ||
                    this.props.route.params?.cta === "festiveSendMoney" ||
                    this.props.route.params?.routeFrom === "SortToWin") && (
                    <ContactPicker
                        title={
                            this.props.route.params?.cta === "festiveSendMoney" ||
                            this.props.route.params?.routeFrom === "SortToWin"
                                ? festiveAssets?.sendMoney.festiveTitle
                                : Strings.SEND_AND_REQUEST
                        }
                        buttonLabel="Add"
                        selectedContact={this.state.selectedContact}
                        bottomInfo={`${
                            this.state.selectedContact?.length?.toString() ?? 0
                        }/1 contacts selected.`}
                        onSelect={this.onContactSelected}
                        onDoneEvent={this.onContactDone}
                        onBackPress={this.onContactBackPress}
                        onRefresh={this.onContactRefresh}
                        userMobileNumber={this.state.userMobileNumber}
                        callSync={this.state.callSync}
                        filter={this.state.onlyMayaContacts}
                        hasWhiteText={
                            ((isTapTasticReady &&
                                this.props.route.params?.cta === "festiveSendMoney") ||
                                this.props.route.params?.routeFrom === "SortToWin" ||
                                festiveFlag) &&
                            festiveAssets?.isWhiteColorOnFestive &&
                            this.state.sendMoneyFlow === 1
                        }
                        festiveFlag={
                            ((isTapTasticReady &&
                                this.props.route.params?.cta === "festiveSendMoney") ||
                                this.props.route.params?.routeFrom === "SortToWin" ||
                                festiveFlag) &&
                            this.state.sendMoneyFlow === 1
                        }
                        festiveImage={
                            (isTapTasticReady &&
                                this.props.route.params?.cta === "festiveSendMoney") ||
                            this.props.route.params?.routeFrom === "SortToWin"
                                ? festiveImage
                                : null
                        }
                        isMultipleSelection={false}
                        sendAndRequestFlag={
                            this.state.sendMoneyFlow === 1
                                ? "SEND"
                                : this.state.sendMoneyFlow === 2
                                ? "REQUEST"
                                : null
                        }
                        logEventFunc={this.logEventFunc}
                    />
                )}

                <Popup
                    visible={this.state.showDuitNowPopup}
                    title={Strings.ACCOUNT_NOT_LINKED}
                    description={Strings.SORRY_YOUR_CONTACT}
                    onClose={this.hideDuitNowPopup}
                    primaryAction={{
                        text: Strings.YES,
                        onPress: this.doDuitNowFlow,
                    }}
                    secondaryAction={{
                        text: Strings.NO,
                        onPress: this.hideDuitNowPopup,
                    }}
                />

                <Popup
                    visible={this.state.showDuitNowErrorPopup}
                    title={Strings.ACCOUNT_NOT_LINKED}
                    description={Strings.SORRY_THE_CONTACT_YOU_SELECTED}
                    onClose={this.hideDuitNowErrorPopup}
                    primaryAction={{
                        text: Strings.INVITE_NOW,
                        onPress: this.inviteDuitNowFlow,
                    }}
                />

                <Popup
                    visible={this.state.showIncomingRequestPopup}
                    title={Strings.INCOMING_REQUEST}
                    description={this.state.incomingRequestTitle}
                    onClose={this.hideIncomingRequestPopup}
                    primaryAction={{
                        text: Strings.PAY_NOW,
                        onPress: this.onPayNow,
                    }}
                    secondaryAction={{
                        text: Strings.REJECT_CAMEL,
                        onPress: this.onRejectNow,
                    }}
                />
                <Popup
                    visible={
                        this.state.showRegisterDuitnowAutoDebitPopup ||
                        this.state.showRegisterDuitnowRequestPopup
                    }
                    title={Strings.DUITNOW_REGISTER}
                    description={Strings.DUITNOW_REGISTER_DESC}
                    onClose={this.hideDuitNowPopup}
                    primaryAction={{
                        text: Strings.MORE_INFO,
                        onPress: this.onMoreInfo,
                    }}
                />
            </React.Fragment>
        );
    }
}

SendRequestMoneyDashboard.propTypes = {
    model: PropTypes.object,
    getModel: PropTypes.func,
    navigation: PropTypes.shape({
        addListener: PropTypes.func,
        goBack: PropTypes.func,
        navigate: PropTypes.func,
    }),
    route: PropTypes.shape({
        params: PropTypes.shape({
            acctNo: PropTypes.any,
            activeTabIndex: PropTypes.number,
            cta: PropTypes.string,
            doneFlow: PropTypes.bool,
            prevData: PropTypes.any,
            refId: PropTypes.any,
            screenDate: PropTypes.any,
            subModule: PropTypes.string,
            transferParams: PropTypes.object,
            updateScreenData: PropTypes.any,
            loadPast: PropTypes.bool,
            routeFrom: PropTypes.any,
            includeGreeting: PropTypes.any,
        }),
    }),
    updateModel: PropTypes.func,
    festiveAssets: PropTypes.object,
};
export default withModelContext(withFestive(SendRequestMoneyDashboard));
