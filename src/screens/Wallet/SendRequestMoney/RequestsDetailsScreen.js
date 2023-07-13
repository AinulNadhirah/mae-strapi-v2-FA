import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, ScrollView, Dimensions } from "react-native";

import * as navigationConstant from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderDotDotDotButton from "@components/Buttons/HeaderDotDotDotButton";
import { CircularTextImage, StatusTextView } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";
import { showErrorToast, showSuccessToast, showInfoToast } from "@components/Toast";
import { TopMenu } from "@components/TopMenu";

import { withModelContext } from "@context";

import {
    sendReminderAPI,
    sendRcvMoneyPaidAPI,
    deleteStatusSendRcvMoney,
    updateStatusSendRcvMoney,
} from "@services";
import { FASendRequestTransaction } from "@services/analytics/analyticsSendRequest";

import { YELLOW, DISABLED, DISABLED_TEXT, BLACK, MEDIUM_GREY } from "@constants/colors";
import * as Strings from "@constants/strings";

import {
    formatMobileNumbersRequest,
    phoneNumberMaskNew,
    getShortName,
} from "@utils/dataModel/utility";

import Styles from "@styles/Wallet/TransferEnterAmountStyle";

import Assets from "@assets";

("use strict");

export const { width, height } = Dimensions.get("window");

class RequestsDetailsScreen extends Component {
    static navigationOptions = { title: "", header: null };

    static propTypes = {
        getModel: PropTypes.func,
        resetModel: PropTypes.func,
    };
    /***
     * constructor
     * props
     */
    constructor(props) {
        super(props);
        this.state = {
            notesText: "Dinner",
            transferAmount: "",
            image: Assets.icMaybankAccount,
            screenData: {
                image: Assets.icMaybankAccount,
                name: "",
                description1: "",
                description2: "",
            },
            transferParams: {},
            bankName: "",
            primaryAccount: "",
            fromAccountTemp: "",
            fromAccount: "",
            fromAccountCode: "",
            fromAccountName: "",
            mainTitle: "",
            nameText: "",
            mainImage: "",
            screenIDValue: "",
            referenceID: "",
            displayDate: "",
            item: {},
            userImage: "",
            isSender: false,
            id: "",
            status: "Pending",
            showMenu: false,
            flow: "PENDING",
            originalStatus: "PENDING",
            screenIDValueMasked: "",
            disableReminder: false,
            updateScreenData: false,
        };
    }

    componentDidMount() {
        const { flow, status } = this.props.route.params.item;
        FASendRequestTransaction.requestOngoing(flow, status);

        this._updateDataInScreenAlways();
    }

    componentWillUnmount() {}

    /**
     *_updateDataInScreenAlways()
     * @memberof RequestsDetailsScreen
     */
    _updateDataInScreenAlways = () => {
        // const secure2uValidateData = this.props.route.params?.secure2uValidateData ?? {
        //     action_flow: "TAC",
        // };

        const transferParams = this.props.route.params?.transferParams ?? {};
        const item = this.props.route.params?.item ?? {};

        console.log("RequestsDetailsScreen item : ", item);
        console.log("RequestsDetailsScreen transferParams : ", transferParams);
        console.log("RequestsDetailsScreen disableReminder : ", item.enableReminder);

        const referenceID = item.trxRefId;
        // const referenceIDFormatted = formateReferenceNumber(referenceID);
        const referenceIDFormatted = referenceID;
        const flow = item.flow;

        let senderMobileNo = item.isSender ? item.receiverMobileNo : item.senderMobileNo;

        let image = item.isSender ? item.receiverProfilePic : item.senderProfilePic;

        const screenData = {
            image: image,
            name: transferParams.formattedToAccount,
            description1: transferParams.accountName,
            description2: transferParams.bankName,
        };
        console.log("screenData ==> ", screenData);
        console.log("originalStatus ==> ", item.originalStatus);
        let nameText = "";
        if (item.isSender) {
            nameText = item.receiverName ? item.receiverName : "";
        } else {
            nameText = item.senderName ? item.senderName : "";
        }
        let phoneNumberMask = phoneNumberMaskNew(senderMobileNo);
        phoneNumberMask =
            phoneNumberMask.indexOf("+") === -1 ? `+${phoneNumberMask}` : phoneNumberMask;
        let formatMobileNumbersRequestNew = formatMobileNumbersRequest(senderMobileNo);
        formatMobileNumbersRequestNew =
            formatMobileNumbersRequestNew.indexOf("+") === -1
                ? `+${formatMobileNumbersRequestNew}`
                : formatMobileNumbersRequestNew;
        let screenIDValueMasked = flow === "PAST" ? phoneNumberMask : formatMobileNumbersRequestNew;
        this.setState({
            bankName: transferParams.bankName,
            item: item,
            image: image,
            transferParams: transferParams,
            errorMessage: Strings.AMOUNT_ERROR,
            screenData: screenData,
            mainTitle: item.detailTitle,
            userImage: image,
            nameText: nameText,
            screenIDValue: senderMobileNo,
            screenIDValueMasked: screenIDValueMasked,
            transferAmount: item.formattedAmount,
            notesText: item.note,
            referenceID: referenceID,
            referenceIDFormatted: referenceIDFormatted,
            displayDate: item.createdDate,
            isSender: item.isSender,
            id: item.id,
            status: item.status,
            flow: flow,
            originalStatus: item.originalStatus,
            disableReminder: !item.enableReminder,
        });
    };

    _deleteStatusSendRcvMoney = async () => {
        const { id } = this.state;
        this.setState({ loader: true });
        console.log("_deleteStatusSendRcvMoney==> ");
        let subUrl = `/sendRcvMoney/delete?msgId=${id}`;

        FASendRequestTransaction.removeFromList();

        try {
            deleteStatusSendRcvMoney(subUrl)
                .then((response) => {
                    this.setState({ loader: false });
                    let responseObject = response.data;
                    console.log(subUrl + " RESPONSE RECEIVED: ", response.data);
                    const statusDescriptionText = Strings.YOU_VE_DELETED + Strings.THE_REQUEST;

                    // this.props.updateDataInChild();
                    // showSuccessToast({
                    //     message: statusDescriptionText,
                    // });
                    // this.props.navigation.goBack();
                    this.props.navigation.navigate(navigationConstant.SEND_REQUEST_MONEY_STACK, {
                        screen: navigationConstant.SEND_REQUEST_MONEY_DASHBOARD,
                        params: { updateScreenData: true },
                    });
                })
                .catch((error) => {
                    showErrorToast({
                        message: Strings.QR_ISSUE,
                    });
                    this.setState({ loader: false, refreshing: false });
                    console.log(subUrl + "  ERROR==> ", error);
                });
        } catch (e) {
            this.setState({ loader: false, refreshing: false });
            console.log(subUrl + "  catch ERROR==> " + e);
        }
    };

    _updateStatusSendRcvMoney = async (updatedStatus) => {
        const { item } = this.state;

        console.log(" item.id : ", item.id);
        console.log(" item : ", item);
        console.log(" updatedStatus : ", updatedStatus);
        this.setState({ loader: true });
        console.log("_getPendingSendRequestList==> ");

        const subUrl = `/sendRcvMoney/updateStatus?msgId=${item.id}&status=${updatedStatus}`;

        try {
            updateStatusSendRcvMoney(subUrl)
                .then((response) => {
                    let responseObject = response.data;
                    console.log(subUrl + " RESPONSE RECEIVED: ", response.data);
                    if (
                        responseObject &&
                        responseObject.message &&
                        responseObject.message.toLowerCase() == "success"
                    ) {
                        // ModelClass.SEND_MONEY_DATA.pendingData = [];
                        // ModelClass.SEND_MONEY_DATA.pendingDataCalled = false;
                        this.setState({ loader: false });
                        if (updatedStatus === "APROVED") {
                            // showSuccessToast({
                            //     message: "Accepted",
                            // });
                        } else if (updatedStatus === "REJECT" || updatedStatus === "REJECTED") {
                            const statusDescriptionText = `${Strings.YOU_VE_REJECTED} ${Strings.THE_REQUEST}`;
                            setTimeout(() => {
                                showSuccessToast({
                                    message: statusDescriptionText,
                                });
                            }, 10);
                        } else if (updatedStatus === "CANCELLED") {
                            const statusDescriptionText = `Cancel Request.`;
                            // setTimeout(() => {
                            //     showErrorToast({
                            //         message: statusDescriptionText,
                            //     });
                            // }, 10);
                        } else if (updatedStatus === "PAID") {
                            setTimeout(() => {
                                showInfoToast({
                                    message: Strings.REQUEST_MARKED_AS_COLLECTED,
                                });
                            }, 10);
                        }

                        // this.props.navigation.goBack();
                        this.props.navigation.navigate(
                            navigationConstant.SEND_REQUEST_MONEY_STACK,
                            {
                                screen: navigationConstant.SEND_REQUEST_MONEY_DASHBOARD,
                                params: { updateScreenData: true },
                            }
                        );
                    } else if (
                        responseObject &&
                        responseObject.message &&
                        responseObject.message.toLowerCase() == "failure"
                    ) {
                        setTimeout(() => {
                            showErrorToast({
                                message: Strings.QR_ISSUE,
                            });
                        }, 10);
                        this.setState({ loader: false, refreshing: false, error: true });
                    } else {
                        setTimeout(() => {
                            showErrorToast({
                                message: Strings.QR_ISSUE,
                            });
                        }, 10);
                        this.setState({ loader: false, refreshing: false, error: true });
                    }
                })
                .catch((error) => {
                    setTimeout(() => {
                        showErrorToast({
                            message: Strings.QR_ISSUE,
                        });
                    }, 10);
                    this.setState({ loader: false, refreshing: false, error: true });
                    console.log(subUrl + "  ERROR==> ", error);
                });
        } catch (e) {
            this.setState({ loader: false, refreshing: false });
            console.log(subUrl + "  catch ERROR==> " + e);
        }
    };

    _markAsPaidApi = () => {
        console.log("_markAsPaidApi==> ");
        const { item } = this.state;

        let subUrl = "/sendRcvMoney/paid?notify=" + false;

        try {
            let params = {
                status: "PAID",
                id: item.id,
                note: item.note,
                trxRefId: item.trxRefId,
                receiverAcct: item.receiverAcct,
                trxDate: item.createdDate,
            };

            console.log("_markAsPaidApi ==> ", params);

            sendRcvMoneyPaidAPI(subUrl, params)
                .then((response) => {
                    this.setState({ loader: false });
                    console.log("sendRcvMoneyPaidAPI RESPONSE RECEIVED: response", response);
                    let responseObject = response.data;
                    console.log(
                        "sendRcvMoneyPaidAPI RESPONSE RECEIVED: responseObject",
                        responseObject
                    );
                    console.log(
                        "sendRcvMoneyPaidAPI RESPONSE RECEIVED: response.data ",
                        response.data
                    );
                    if (
                        responseObject &&
                        responseObject.message &&
                        responseObject.message === "success"
                    ) {
                        console.log(
                            "sendRcvMoneyPaidAPI success RESPONSE RECEIVED: ",
                            response.data
                        );

                        setTimeout(() => {
                            showSuccessToast({
                                message: Strings.REQUEST_MARKED_AS_COLLECTED,
                            });
                        }, 10);
                        const updateScreenData = true;
                        this.props.navigation.navigate(
                            navigationConstant.SEND_REQUEST_MONEY_DASHBOARD,
                            {
                                updateScreenData: updateScreenData,
                            }
                        );
                    } else if (
                        responseObject !== null &&
                        responseObject.message !== null &&
                        responseObject.message.toLowerCase() == "failure"
                    ) {
                        console.log(subUrl + " RESPONSE RECEIVED: ", response.data);
                        setTimeout(() => {
                            showErrorToast({
                                message: Strings.QR_ISSUE,
                            });
                        }, 10);
                    } else {
                        setTimeout(() => {
                            showErrorToast({
                                message: Strings.QR_ISSUE,
                            });
                        }, 10);
                        console.log(subUrl + " RESPONSE RECEIVED: ", response.data);
                    }
                })
                .catch((error) => {
                    this.setState({ loader: false });
                    console.log(subUrl + " ERROR==> ", error);
                    setTimeout(() => {
                        showErrorToast({
                            message: Strings.QR_ISSUE,
                        });
                    }, 10);
                });
        } catch (e) {
            console.log(subUrl + " catch ERROR==> " + e);
        }
    };

    _sendReminderAPI = () => {
        console.log("_sendReminderAPI==> ");

        FASendRequestTransaction.sendReminder();

        const { id, disableReminder } = this.state;

        let subUrl = `/sendRcvMoney/sendReminder?msgId=${id}&notify=false`;

        try {
            sendReminderAPI(subUrl)
                .then((response) => {
                    this.setState({ loader: false });
                    let responseObject = response.data;
                    console.log(subUrl + " RESPONSE RECEIVED: ", response.data);
                    // ModelClass.TRANSFER_DATA.transactionResponseObject = responseObject
                    if (
                        responseObject &&
                        responseObject.message &&
                        responseObject.message.toLowerCase() == "success"
                    ) {
                        console.log(subUrl + " RESPONSE RECEIVED: ", response.data);
                        this.setState({
                            disableReminder: !disableReminder,
                            updateScreenData: true,
                        });
                        showSuccessToast({
                            message: Strings.REMINDER_SENT,
                        });
                    } else if (
                        responseObject &&
                        responseObject.message &&
                        responseObject.message.toLowerCase() == "failure"
                    ) {
                        showErrorToast({
                            message: Strings.REMINDER_SENT_FAILED,
                        });
                        console.log(subUrl + " RESPONSE RECEIVED: ", response.data);
                    } else {
                        console.log(subUrl + " RESPONSE RECEIVED: ", response.data);
                        showErrorToast({
                            message: Strings.REMINDER_SENT_FAILED,
                        });
                    }
                })
                .catch((error) => {
                    this.setState({ loader: false });
                    console.log(subUrl + " ERROR==> ", error);
                    showErrorToast({
                        message: Strings.REMINDER_SENT_FAILED,
                    });
                });
        } catch (e) {
            console.log(subUrl + " catch ERROR==> " + e);
        }
    };

    _onConfirmClick = () => {
        let { transferParams } = this.state;
    };

    _onClosePress = () => {
        const { transferParams } = this.state;
        const { routeFrom } = transferParams;
        console.log("_onClosePress==> transferParams ", transferParams);
        console.log("_onClosePress ", this.state.transferFlow);
        const route = routeFrom ? routeFrom : "Dashboard";
        console.log("route ", routeFrom);
        if (route == "AccountDetails") {
            this.props.navigation.navigate(navigationConstant.BANKINGV2_MODULE, {
                screen: navigationConstant.ACCOUNT_DETAILS_SCREEN,
            });
        } else if (route === "WalletMainDashboard") {
            this.props.navigation.navigate(navigationConstant.TAB_NAVIGATOR, {
                screen: "Dashboard",
            });
        } else {
            // TODO: Add necessary params
            this.props.navigation.navigate(navigationConstant.TAB_NAVIGATOR);
        }
    };

    _onBackPress = () => {
        const { updateScreenData } = this.state;
        console.log("[RequestsDetailsScreen] [_onBackPress] updateScreenData ", updateScreenData);
        if (updateScreenData) {
            this.props.navigation.replace(navigationConstant.SEND_REQUEST_MONEY_STACK, {
                screen: navigationConstant.SEND_REQUEST_MONEY_DASHBOARD,
                params: { updateScreenData: true },
            });
        } else {
            this.props.navigation.goBack();
        }
    };

    _onMorePress = () => {
        console.log("_onMorePress");

        FASendRequestTransaction.openMenu();

        this.setState({
            showMenu: true,
        });
    };

    _onHideMorePress = () => {
        console.log("_onHideMorePress");
        this.setState({
            showMenu: false,
        });
    };

    handleItemPress = (param) => {
        this.setState({ showMenu: false });

        switch (param) {
            case "CANCEL_REQUEST":
                //TODO need to implement function later
                console.log("CANCEL_REQUEST");

                FASendRequestTransaction.cancelRequest();

                this._updateStatusSendRcvMoney("CANCELLED");
                break;
            case "MARK_AS_PAID":
                //TODO need to implement function later
                console.log("MARK_AS_PAID");

                FASendRequestTransaction.markAsPaid();

                this._updateStatusSendRcvMoney("PAID");
                break;
        }
    };

    menuArray = [
        {
            menuLabel: Strings.CANCEL_REQUEST,
            menuParam: "CANCEL_REQUEST",
        },
        {
            menuLabel: Strings.MARK_AS_PAID,
            menuParam: "MARK_AS_PAID",
        },
    ];

    render() {
        const { navigation } = this.props;
        const { showErrorModal, errorMessage, index } = this.state;
        return (
            <React.Fragment>
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
                                        text={Strings.SEND_AND_REQUEST}
                                    />
                                }
                                headerLeftElement={<HeaderBackButton onPress={this._onBackPress} />}
                                headerRightElement={
                                    (!this.state.isSender &&
                                        this.state.originalStatus === "PENDING") ||
                                    this.state.originalStatus === "APROVED" ? (
                                        <HeaderDotDotDotButton onPress={this._onMorePress} />
                                    ) : (
                                        <View />
                                    )
                                }
                            />
                        }
                        paddingHorizontal={0}
                        paddingBottom={0}
                        useSafeArea
                    >
                        <React.Fragment>
                            <React.Fragment>
                                <ScrollView>
                                    <View style={Styles.blockConfirm}>
                                        <View style={Styles.cardSmallContainerColumnCenter}>
                                            <View style={Styles.descriptionContainerCenter}>
                                                <Typo
                                                    fontSize={20}
                                                    fontWeight="300"
                                                    fontStyle="normal"
                                                    letterSpacing={0}
                                                    lineHeight={28}
                                                    text={this.state.mainTitle}
                                                />
                                            </View>

                                            <View style={Styles.logoView}>
                                                <CircularTextImage
                                                    source={this.state.userImage}
                                                    defaultImage={require("@assets/icons/yellowMoney.png")}
                                                    showText={
                                                        this.state.userImage != undefined &&
                                                        this.state.userImage.length < 1
                                                    }
                                                    text={getShortName(this.state.nameText)}
                                                />
                                            </View>
                                        </View>

                                        <View style={Styles.cardSmallContainerColumnCenter2}>
                                            <View style={Styles.descriptionContainerCenter}>
                                                <Typo
                                                    fontSize={14}
                                                    fontWeight="600"
                                                    fontStyle="normal"
                                                    letterSpacing={0}
                                                    lineHeight={18}
                                                    text={this.state.nameText}
                                                />
                                            </View>
                                            <View style={Styles.descriptionContainer2Center}>
                                                <Typo
                                                    fontSize={14}
                                                    fontWeight="normal"
                                                    fontStyle="normal"
                                                    letterSpacing={0}
                                                    lineHeight={20}
                                                    text={this.state.screenIDValueMasked}
                                                />
                                            </View>

                                            <View style={Styles.editIconViewTransfer2}>
                                                <Typo
                                                    fontSize={24}
                                                    fontWeight="bold"
                                                    fontStyle="normal"
                                                    letterSpacing={0}
                                                    lineHeight={31}
                                                    textAlign="center"
                                                    text={
                                                        Strings.CURRENCY + this.state.transferAmount
                                                    }
                                                />
                                            </View>

                                            <View style={Styles.statusCenter}>
                                                <StatusTextView status={this.state.status} />
                                            </View>
                                        </View>

                                        {this.state.notesText ? (
                                            <View style={Styles.viewRow2}>
                                                <View style={Styles.viewRowLeftItem}>
                                                    <Typo
                                                        fontSize={14}
                                                        fontWeight="400"
                                                        fontStyle="normal"
                                                        letterSpacing={0}
                                                        lineHeight={19}
                                                        textAlign="left"
                                                        text={Strings.NOTES}
                                                    />
                                                </View>
                                                <View style={Styles.viewRowRightItem}>
                                                    <Typo
                                                        fontSize={14}
                                                        fontWeight="600"
                                                        fontStyle="normal"
                                                        letterSpacing={0}
                                                        lineHeight={18}
                                                        textAlign="right"
                                                        text={this.state.notesText}
                                                    />
                                                </View>
                                            </View>
                                        ) : (
                                            <View />
                                        )}

                                        {this.state.referenceIDFormatted ? (
                                            <View style={Styles.viewRow2}>
                                                <View style={Styles.viewRowLeftItem}>
                                                    <Typo
                                                        fontSize={14}
                                                        fontWeight="400"
                                                        fontStyle="normal"
                                                        letterSpacing={0}
                                                        lineHeight={19}
                                                        textAlign="left"
                                                        text={Strings.REFERENCE_ID}
                                                    />
                                                </View>
                                                <View style={Styles.viewRowRightItem}>
                                                    <Typo
                                                        fontSize={14}
                                                        fontWeight="600"
                                                        fontStyle="normal"
                                                        letterSpacing={0}
                                                        lineHeight={18}
                                                        textAlign="right"
                                                        text={this.state.referenceIDFormatted}
                                                    />
                                                </View>
                                            </View>
                                        ) : (
                                            <View />
                                        )}

                                        <View style={Styles.viewRow2}>
                                            <View style={Styles.viewRowLeftItem}>
                                                <Typo
                                                    fontSize={14}
                                                    fontWeight="400"
                                                    fontStyle="normal"
                                                    letterSpacing={0}
                                                    lineHeight={19}
                                                    textAlign="left"
                                                    text={Strings.DATE_AND_TIME}
                                                />
                                            </View>
                                            <View style={Styles.viewRowRightItem}>
                                                <Typo
                                                    fontSize={14}
                                                    fontWeight="600"
                                                    fontStyle="normal"
                                                    letterSpacing={0}
                                                    lineHeight={18}
                                                    textAlign="right"
                                                    color={BLACK}
                                                    text={this.state.displayDate}
                                                />
                                            </View>
                                        </View>
                                    </View>
                                </ScrollView>
                            </React.Fragment>

                            <View style={Styles.footerButton}>
                                {this.state.flow === "PAST" ? (
                                    <ActionButton
                                        fullWidth
                                        borderRadius={25}
                                        onPress={this._deleteStatusSendRcvMoney}
                                        backgroundColor={YELLOW}
                                        componentCenter={
                                            <Typo
                                                color={BLACK}
                                                text={Strings.REMOVE_FROM_LIST}
                                                fontSize={14}
                                                fontWeight="600"
                                                lineHeight={18}
                                            />
                                        }
                                    />
                                ) : (
                                    <ActionButton
                                        disabled={this.state.disableReminder}
                                        fullWidth
                                        borderRadius={25}
                                        onPress={this._sendReminderAPI}
                                        backgroundColor={
                                            this.state.disableReminder ? DISABLED : YELLOW
                                        }
                                        componentCenter={
                                            <Typo
                                                color={
                                                    this.state.disableReminder
                                                        ? DISABLED_TEXT
                                                        : BLACK
                                                }
                                                text={Strings.SEND_REMINDER}
                                                fontSize={14}
                                                fontWeight="600"
                                                lineHeight={18}
                                            />
                                        }
                                    />
                                )}
                            </View>
                        </React.Fragment>
                    </ScreenLayout>
                </ScreenContainer>
                <TopMenu
                    showTopMenu={this.state.showMenu}
                    onClose={this._onHideMorePress}
                    navigation={this.props.navigation}
                    menuArray={this.menuArray}
                    onItemPress={this.handleItemPress}
                />
            </React.Fragment>
        );
    }
}
export default withModelContext(RequestsDetailsScreen);
