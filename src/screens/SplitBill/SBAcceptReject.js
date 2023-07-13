import React, { Component } from "react";
import { View, Image, StyleSheet, ScrollView, Dimensions } from "react-native";

import { navigateToS2UCooling } from "@screens/OneTapAuth/CoolingNavigator";

import {
    SB_PAYCONFIRM,
    SB_DASHBOARD,
    ONE_TAP_AUTH_MODULE,
    BANKINGV2_MODULE,
    SB_ACCEPTREJECT,
    ACTIVATE,
    TAB,
    TAB_NAVIGATOR,
    MORE,
    SECURE2U_COOLING,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import InlineEditor from "@components/Inputs/InlineEditor";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import { showErrorToast, showSuccessToast } from "@components/Toast";

import { withModelContext } from "@context";

import {
    bankingGetDataMayaM2u,
    splitBillAcceptAPI,
    splitBillRejectAPI,
    deleteBillsApi,
    invokeL3,
} from "@services";
import { logEvent } from "@services/analytics";

import { MEDIUM_GREY, WHITE, GREY, DARK_GREY, YELLOW } from "@constants/colors";
import {
    SPLIT_BILL,
    REJECT,
    ACCEPT,
    DELETE,
    REMOVE_BILL,
    CONFIRM,
    CANCEL,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    FA_SPLIT_BILL_REQ,
    FA_SELECT_ACTION,
    FA_ACTION_NAME,
    FA_REMOVE_BILL,
    SORTED_BILL,
    REFERENCE_ID,
    DATE_AND_TIME,
    SPLIT_TYPE,
    SPLIT_BILL_REQUEST,
} from "@constants/strings";
import { SB_INVITE_ACCEPT_API, SB_INVITE_REJECT_API } from "@constants/url";

import { getShadow, checks2UFlow } from "@utils/dataModel/utility";

import { massageAccountsData, commonCbHandler } from "./SBController";

const screenWidth = Dimensions.get("window").width;
const btnWidth = (screenWidth * 40) / 100;

class SBAcceptReject extends Component {
    constructor(props) {
        super(props);

        this.state = {
            // Split Bill Details
            splitBillName: "",
            splitBillType: "",
            splitBillRefId: "",
            splitBillDateTime: "",
            splitBillNote: null,
            billId: "",
            expiryDate: "",

            // Others
            data: {},
            fromTabIndex: "",
            routeFrom: "",
            accountNo: "",
            flowType: "",
            myRecord: {},
            ownerRecord: {},
            detailsUpdated: false,

            // Payment Related
            paymentAmount: "",
            paymentRawAmount: "",
            paymentStatus: "",
            paymentStatusColor: "",

            // Requestor Contact Details
            requestorName: "",
            requestorInitials: "",
            requestorMobileNumber: "",
            requestorFormattedNumber: "",
            requestorProfilePic: null,

            // Confirmation popup
            showRemvBillConfPopup: false,

            // Logged In User Related
            token: "",
        };

        this.props.updateModel({
            ui: {
                onCancelLogin: this.onPINLoginCancel,
            },
        });
    }

    componentDidMount = () => {
        console.log("[SBAcceptReject] >> [componentDidMount]");
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_SPLIT_BILL_REQ,
        });
        this.manageViewOnInit();

        // Using Focus to handle props with new values
        this.props.navigation.addListener("focus", this.onScreenFocus);
    };

    onPINLoginCancel = () => {
        console.log("[SBAcceptReject] >> [onPINLoginCancel]");

        this.onCloseTap();
    };

    onScreenFocus = () => {
        console.log("[SBAcceptReject] >> [onScreenFocus]");

        const params = this.props?.route?.params ?? null;
        if (!params) return;

        const { flowType, auth } = params;
        const { detailsUpdated } = this.state;

        if (flowType === "S2UReg") {
            // Reset params once handled
            this.props.navigation.setParams({
                flowType: null,
                auth: null,
            });

            // Show reg fail error msg for S2u
            if (auth === "fail") {
                showErrorToast({
                    message: "Failed to register for Secure2u. Please proceed with TAC.",
                });
            }

            // Proceed to confirmation screen either way
            this.props.navigation.replace(SB_PAYCONFIRM, params);
        } else if (detailsUpdated) {
            this.onCloseTap();
        }
    };

    manageViewOnInit = () => {
        console.log("[SBAcceptReject] >> [manageViewOnInit]");

        const {
            getModel,
            route: { params },
        } = this.props;
        const { token } = getModel("auth");

        this.setState({
            ...params,
            token: token ? `bearer ${token}` : "",
        });
    };

    onCloseTap = () => {
        console.log("[SBAcceptReject] >> [onCloseTap]");

        const { route } = this.props;
        const { fromTabIndex, detailsUpdated, routeFrom } = this.state;

        if (routeFrom === "NOTIFICATION" || route?.params?.refId) {
            this.props.navigation.navigate(TAB_NAVIGATOR, {
                screen: TAB,
                params: {
                    screen: MORE,
                },
            });
        } else if (isNaN(fromTabIndex)) {
            this.props.navigation.goBack();
        } else {
            this.props.navigation.navigate(SB_DASHBOARD, {
                activeTabIndex: fromTabIndex,
                detailsUpdated,
            });
        }
    };

    onAccept = async () => {
        console.log("[SBAcceptReject] >> [onAccept]");

        const { billId, myRecord, ownerRecord } = this.state;
        const ownerId = ownerRecord?.userId ?? null;
        const userId = myRecord?.userId ?? null;
        const phoneNo = myRecord?.hpNo ?? null;

        // Empty checking
        if (!billId || !ownerId || !phoneNo) {
            showErrorToast({
                message:
                    "Cannot perform requested action due to missing details. Please try again later.",
            });
            return;
        }

        // Request object
        const params = {
            billId,
            ownerId,
            phoneNo,
            userId,
        };

        const httpResp = await splitBillAcceptAPI(SB_INVITE_ACCEPT_API, params).catch((error) => {
            console.log("[SBAcceptReject][splitBillAcceptAPI] >> Exception: ", error);
        });

        const { code, message } = commonCbHandler(httpResp);
        if (code === 0) {
            this.setState({ detailsUpdated: true }, () => {
                this.navigatePaymentConfirmation();
            });
        } else {
            showErrorToast({
                message: message,
            });
        }
    };

    onReject = async () => {
        console.log("[SBAcceptReject] >> [onReject]");

        const { billId, fromTabIndex, myRecord, ownerRecord, routeFrom } = this.state;
        const ownerId = ownerRecord?.userId ?? null;
        const userId = myRecord?.userId ?? null;
        const phoneNo = myRecord?.hpNo ?? null;

        // Empty checking
        if (!billId || !ownerId || !phoneNo) {
            showErrorToast({
                message:
                    "Cannot perform requested action due to missing details. Please try again later.",
            });
            return;
        }

        // Request object
        const params = {
            billId,
            ownerId,
            phoneNo,
            userId,
        };

        const httpResp = await splitBillRejectAPI(SB_INVITE_REJECT_API, params).catch((error) => {
            console.log("[SBAcceptReject][splitBillRejectAPI] >> Exception: ", error);
        });

        const { code, message } = commonCbHandler(httpResp);
        if (code === 0) {
            // if its from notification we gonna replace it
            if (routeFrom === "NOTIFICATION") {
                this.props.navigation.replace(BANKINGV2_MODULE, {
                    screen: SB_DASHBOARD,
                    params: {
                        activeTabIndex: fromTabIndex,
                        detailsUpdated: true,
                        refId: null,
                    },
                });
            } else {
                this.props.navigation.navigate(SB_DASHBOARD, {
                    activeTabIndex: fromTabIndex,
                    detailsUpdated: true,
                });
            }
        } else {
            showErrorToast({
                message: message,
            });
        }
    };

    navigatePaymentConfirmation = async () => {
        console.log("[SBAcceptReject] >> [navigatePaymentConfirmation]");

        let stateData = this.state;
        const { getModel, updateModel } = this.props;
        const ota = getModel("ota");
        const { isPostPassword } = getModel("auth");

        // L3 call to invoke login page
        if (!isPostPassword) {
            const httpResp = await invokeL3(true).catch((error) => {
                console.log("[SBAcceptReject][navigatePaymentConfirmation] >> Exception: ", error);
                return;
            });
            const code = httpResp?.data?.code ?? null;
            if (code !== 0) return;
        }

        // Fetch CASA accounts
        const casaAccounts = await this.fetchAccountsList();
        stateData.casaAccounts = casaAccounts;
        stateData.selectedAccount = casaAccounts.length ? casaAccounts[0] : "";

        // Check for S2u registration //passing new paramerter updateModel for s2u interops
        let { flow, secure2uValidateData } = await checks2UFlow(31, getModel, updateModel);
        stateData.flow = flow;
        stateData.secure2uValidateData = secure2uValidateData;
        const {
            navigation: { navigate, replace },
        } = this.props;
        if (flow === SECURE2U_COOLING) {
            navigateToS2UCooling(navigate);
        } else if (flow === "S2UReg") {
            stateData.flowType = flow;
            navigate(ONE_TAP_AUTH_MODULE, {
                screen: ACTIVATE,
                params: {
                    flowParams: {
                        success: {
                            stack: BANKINGV2_MODULE,
                            screen: SB_ACCEPTREJECT,
                        },
                        fail: {
                            stack: BANKINGV2_MODULE,
                            screen: SB_DASHBOARD,
                        },
                        params: stateData,
                    },
                },
            });
        } else {
            replace(SB_PAYCONFIRM, stateData);
        }
    };

    fetchAccountsList = async () => {
        console.log("[SBAcceptReject] >> [fetchAccountsList]");

        const { accountNo } = this.state;
        const url = "/summary?type=A";

        const httpResp = await bankingGetDataMayaM2u(url, true).catch((error) => {
            console.log("[SBAcceptReject][bankingGetDataMayaM2u] >> Exception: ", error);
        });

        const result = httpResp?.data?.result ?? null;
        if (result != null) {
            const accountListings = result.accountListings || [];
            const massagedAccounts = massageAccountsData(accountListings, accountNo);

            return massagedAccounts;
        } else {
            return [];
        }
    };

    showRemoveSBPopup = () => {
        console.log("[SBDetails] >> [showRemoveSBPopup]");
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_SPLIT_BILL_REQ,
            [FA_ACTION_NAME]: FA_REMOVE_BILL,
        });

        this.setState({ showRemvBillConfPopup: true });
    };

    hideRemoveSBPopup = () => {
        console.log("[SBDetails] >> [hideRemoveSBPopup]");

        this.setState({ showRemvBillConfPopup: false });
    };

    deleteSplitBill = async () => {
        console.log("[SBAcceptReject] >> [deleteSplitBill]");
        try {
            this.hideRemoveSBPopup();

            const { billId } = this.state;

            const httpResp = await deleteBillsApi(`/bills/delete/${billId}`, false);
            const { code, message } = commonCbHandler(httpResp);
            if (code == "0") {
                showSuccessToast({
                    message: "You've successfully removed the bill",
                });

                this.props.navigation.navigate(SB_DASHBOARD, {
                    activeTabIndex: 2,
                    detailsUpdated: true,
                });
            } else {
                showErrorToast({
                    message: message,
                });
            }
        } catch (error) {
            console.log("[SBAcceptReject][deleteSplitBill] >> Exception: ", error);
        }
    };

    render() {
        const {
            splitBillName,
            splitBillType,
            splitBillRefId,
            splitBillDateTime,
            splitBillNote,
            paymentAmount,
            paymentStatus,
            paymentStatusColor,
            requestorName,
            requestorInitials,
            requestorProfilePic,
            requestorFormattedNumber,
            fromTabIndex,
            showRemvBillConfPopup,
            token,
        } = this.state;

        return (
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                <React.Fragment>
                    <ScreenLayout
                        paddingBottom={0}
                        paddingTop={0}
                        paddingHorizontal={0}
                        useSafeArea
                        header={
                            <HeaderLayout
                                headerCenterElement={
                                    <Typo
                                        fontSize={16}
                                        fontWeight="600"
                                        lineHeight={19}
                                        text={SPLIT_BILL}
                                    />
                                }
                                headerRightElement={<HeaderCloseButton onPress={this.onCloseTap} />}
                            />
                        }
                    >
                        <React.Fragment>
                            <ScrollView>
                                {/* Top Details View */}
                                <View style={Style.topDetailsViewCls}>
                                    {/* Header Text */}
                                    <Typo
                                        fontSize={20}
                                        lineHeight={28}
                                        fontWeight="300"
                                        text={SPLIT_BILL_REQUEST}
                                        style={Style.headerTextCls}
                                    />

                                    {/* Requestor Initials */}
                                    <View style={Style.avatarContCls}>
                                        <View style={Style.avatarContInnerCls}>
                                            {requestorProfilePic ? (
                                                <Image
                                                    source={{
                                                        uri: requestorProfilePic,
                                                        headers: {
                                                            Authorization: token,
                                                        },
                                                    }}
                                                    style={Style.requestorProfilePicCls}
                                                />
                                            ) : (
                                                <Typo
                                                    color={DARK_GREY}
                                                    fontSize={18}
                                                    fontWeight="300"
                                                    lineHeight={18}
                                                    text={requestorInitials}
                                                    style={Style.requestorInitialsCls}
                                                />
                                            )}
                                        </View>
                                    </View>

                                    {/* Requestor Name */}
                                    <Typo
                                        fontSize={14}
                                        lineHeight={18}
                                        fontWeight="600"
                                        text={requestorName}
                                        style={Style.requestorNameCls}
                                    />

                                    {/* Requestor Mobile Number */}
                                    <Typo
                                        fontSize={14}
                                        lineHeight={20}
                                        text={requestorFormattedNumber}
                                        style={Style.requestorMobNumCls}
                                    />

                                    {/* Payment Amount */}
                                    <Typo
                                        fontSize={24}
                                        lineHeight={32}
                                        fontWeight="bold"
                                        text={paymentAmount}
                                        style={Style.amountCls}
                                    />

                                    {/* Status */}
                                    <View
                                        style={[
                                            {
                                                backgroundColor: paymentStatusColor,
                                            },
                                            Style.statusContCls,
                                        ]}
                                    >
                                        <Typo
                                            color={WHITE}
                                            fontSize={11}
                                            lineHeight={11}
                                            fontWeight="normal"
                                            text={paymentStatus}
                                        />
                                    </View>
                                </View>

                                <View style={Style.billDetailsViewCls}>
                                    {/* Bill Type */}
                                    {fromTabIndex == 1 && (
                                        <InlineEditor
                                            label={SPLIT_TYPE}
                                            value={splitBillType}
                                            componentID="splitBillType"
                                            isEditable={false}
                                            editType="press"
                                            style={Style.detailCls}
                                        />
                                    )}

                                    {/* Bill Name */}
                                    <InlineEditor
                                        label="Bill name"
                                        value={splitBillName}
                                        componentID="splitBillName"
                                        isEditable={false}
                                        editType="press"
                                        style={Style.detailCls}
                                    />

                                    {/* Ref ID */}
                                    <InlineEditor
                                        label={REFERENCE_ID}
                                        value={splitBillRefId}
                                        componentID="splitBillRefId"
                                        isEditable={false}
                                        editType="press"
                                        style={Style.detailCls}
                                    />

                                    {/* Date & Time */}
                                    <InlineEditor
                                        label={DATE_AND_TIME}
                                        value={splitBillDateTime}
                                        componentID="splitBillDateTime"
                                        isEditable={false}
                                        editType="press"
                                        style={Style.detailCls}
                                    />

                                    {/* Notess */}
                                    {fromTabIndex == 1 && splitBillNote && (
                                        <InlineEditor
                                            label="Notes"
                                            value={splitBillNote}
                                            componentID="splitBillNote"
                                            isEditable={false}
                                            editType="press"
                                            style={Style.detailCls}
                                        />
                                    )}
                                </View>
                            </ScrollView>

                            {/* Bottom button container */}
                            <FixedActionContainer>
                                <View style={Style.bottomBtnContCls}>
                                    {fromTabIndex == "1" ? (
                                        <React.Fragment>
                                            <ActionButton
                                                backgroundColor={WHITE}
                                                width={btnWidth}
                                                borderStyle="solid"
                                                borderWidth={1}
                                                borderColor={GREY}
                                                componentCenter={
                                                    <Typo
                                                        fontSize={14}
                                                        fontWeight="600"
                                                        lineHeight={18}
                                                        text={REJECT}
                                                    />
                                                }
                                                onPress={this.onReject}
                                            />

                                            <ActionButton
                                                backgroundColor={YELLOW}
                                                width={btnWidth}
                                                componentCenter={
                                                    <Typo
                                                        fontSize={14}
                                                        fontWeight="600"
                                                        lineHeight={18}
                                                        text={ACCEPT}
                                                    />
                                                }
                                                onPress={this.onAccept}
                                            />
                                        </React.Fragment>
                                    ) : (
                                        // To be shown only when opened through Past tab
                                        <ActionButton
                                            backgroundColor={WHITE}
                                            fullWidth
                                            borderStyle="solid"
                                            borderWidth={1}
                                            borderColor={GREY}
                                            componentCenter={
                                                <Typo
                                                    fontSize={14}
                                                    fontWeight="600"
                                                    lineHeight={18}
                                                    text={DELETE}
                                                />
                                            }
                                            onPress={this.showRemoveSBPopup}
                                        />
                                    )}
                                </View>
                            </FixedActionContainer>
                        </React.Fragment>
                    </ScreenLayout>

                    {/* REMOVE BILL CONFIRMATION POPUP */}
                    <Popup
                        visible={showRemvBillConfPopup}
                        title={REMOVE_BILL}
                        description={SORTED_BILL}
                        onClose={this.hideRemoveSBPopup}
                        primaryAction={{
                            text: CONFIRM,
                            onPress: this.deleteSplitBill,
                        }}
                        secondaryAction={{
                            text: CANCEL,
                            onPress: this.hideRemoveSBPopup,
                        }}
                    />
                </React.Fragment>
            </ScreenContainer>
        );
    }
}

const Style = StyleSheet.create({
    amountCls: {
        marginTop: 25,
    },

    avatarContCls: {
        alignItems: "center",
        borderRadius: 35,
        height: 70,
        justifyContent: "center",
        marginTop: 30,
        overflow: "hidden",
        ...getShadow({
            elevation: 8,
            shadowOpacity: 0.5,
        }),
        width: 70,
    },

    avatarContInnerCls: {
        alignItems: "center",
        backgroundColor: GREY,
        borderColor: WHITE,
        borderRadius: 32,
        borderStyle: "solid",
        borderWidth: 2,
        elevation: 5,
        height: 64,
        justifyContent: "center",
        overflow: "hidden",
        width: 64,
    },

    billDetailsViewCls: {
        marginBottom: 30,
        marginHorizontal: 36,
    },

    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },

    detailCls: {
        height: 50,
    },

    headerTextCls: {
        marginTop: 30,
        width: "70%",
    },

    requestorInitialsCls: {
        marginTop: 6,
    },

    requestorMobNumCls: {
        marginTop: 5,
    },

    requestorNameCls: {
        marginTop: 15,
    },

    requestorProfilePicCls: {
        height: "100%",
        width: "100%",
    },

    statusContCls: {
        alignItems: "center",
        borderBottomLeftRadius: 80,
        borderBottomRightRadius: 80,
        borderTopLeftRadius: 80,
        borderTopRightRadius: 80,
        height: 25,
        justifyContent: "center",
        marginTop: 15,
        width: 80,
    },

    topDetailsViewCls: {
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 50,
    },
});

export default withModelContext(SBAcceptReject);
