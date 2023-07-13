import numeral from "numeral";
import PropTypes from "prop-types";
import React from "react";
import { StyleSheet, View, ScrollView, Platform } from "react-native";
import ActionSheet from "react-native-actionsheet";

import { GOAL_TOPUP_AMOUNT_SCREEN, TABUNG_MAIN } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderDotDotDotButton from "@components/Buttons/HeaderDotDotDotButton";
import SwitchButton from "@components/Buttons/SwitchButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import ScreenLoader from "@components/Loaders/ScreenLoader";
import OtpModal from "@components/Modals/OtpModal";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import {
    errorToastProp,
    showErrorToast,
    successToastProp,
    showSuccessToast,
    showInfoToast,
    infoToastProp,
} from "@components/Toast";
import { TopMenu } from "@components/TopMenu";

import { useModelState } from "@context";

import {
    getGoalsList,
    goalBoosterPostServiceWrapper,
    esiPostServiceWrapper,
    getGoalNotifications,
    updateGoalNotifications,
    goalRemove,
    invokeL3,
    requestOTP,
    checkGoalDowntime,
} from "@services";
import { logEvent } from "@services/analytics";

import { WHITE, YELLOW } from "@constants/colors";
import {
    FA_TABUNG_TABUNGVIEW,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    FA_TAB_NAME,
    FA_OPEN_MENU,
    FIELD_INFORMATION,
    MANAGE_BOOSTERS,
    FA_SELECT_MENU,
    FA_ACTION_NAME,
    FA_TABUNG_EDIT_PHOTO,
    FA_TABUNG_FUND_TABUNG,
    FA_TABUNG_RENAME_TABUNG,
    FA_TABUNG_WITHDRAW_TABUNG,
    FA_TABUNG_REMOVE_TABUNG,
    FA_SELECT_ACTION,
    FUND_TABUNG,
} from "@constants/strings";

import { maskedMobileNumber, showGoalDowntimeError } from "@utils";
import { encryptData } from "@utils/dataModel";
import { ErrorLogger } from "@utils/logs";

import Activity from "./Activity";
import Overview from "./Overview";

const tabNameEnum = Object.freeze({
    overview: 0,
    activity: 1,
});

const tabOption = Object.freeze([
    {
        label: "OVERVIEW",
        value: tabNameEnum.overview,
        activeColor: WHITE,
    },
    {
        label: "ACTIVITY",
        value: tabNameEnum.activity,
        activeColor: WHITE,
    },
]);

const topMenuOption = Object.freeze({
    editPhoto: {
        menuLabel: "Edit Photo",
        menuParam: "EDIT_PHOTO",
    },
    renameTabung: { menuLabel: "Rename Tabung", menuParam: "RENAME_TABUNG" },
    withdrawFunds: { menuLabel: "Withdraw Funds", menuParam: "WITHDRAW_TABUNG" },
    fundTabung: { menuLabel: "Fund Tabung", menuParam: "FUND_TABUNG" },
    removeTabung: { menuLabel: "Remove Tabung", menuParam: "REMOVE_TABUNG" },
    viewMediaLinks: { menuLabel: "View Media & Links", menuParam: "VIEW_MEDIA_LINKS" },
});

const ownerPendingGoalTopMenuData = Object.freeze([
    topMenuOption.editPhoto,
    topMenuOption.renameTabung,
]);

const ownerCompletedGoalTopMenuData = Object.freeze([
    topMenuOption.editPhoto,
    topMenuOption.renameTabung,
    topMenuOption.withdrawFunds,
]);

const ownerNotCompletedGoalTopMenuData = Object.freeze([
    topMenuOption.editPhoto,
    topMenuOption.fundTabung,
    topMenuOption.renameTabung,
    topMenuOption.withdrawFunds,
    topMenuOption.removeTabung,
]);

const participantPendingGoalTopMenuData = Object.freeze([topMenuOption.editPhoto]);

const participantCompletedGoalTopMenuData = Object.freeze([
    topMenuOption.editPhoto,
    topMenuOption.withdrawFunds,
]);

const participantNotCompletedGoalTopMenuData = Object.freeze([
    topMenuOption.editPhoto,
    topMenuOption.fundTabung,
    topMenuOption.withdrawFunds,
    topMenuOption.removeTabung,
]);

class TabungDetails extends React.Component {
    static propTypes = {
        navigation: PropTypes.object.isRequired,
        route: PropTypes.object,
        model: PropTypes.object.isRequired,
    };

    state = {
        currentTab: tabNameEnum.overview,
        overviewData: {},
        isFirstRender: true,
        showLoader: true,
        isLoadingBoosterStatus: false,
        showBoosterTooltip: false,
        showTopMenu: false,
        showActionSheet: false,
        esiSuccessDetail: [],
        notifications: [],
        newNotifications: false,
        showBoosterActivationFailureModal: false,
        showDualOptionsPopUp: false,
        dualOptionsPopUpTitle: "",
        dualOptionsPopUpDescription: "",
        dualOptionsPopUpPrimaryActionsTitle: "",
        dualOptionsPopUpPrimaryActions: () => {},
        dualOptionsPopUpSecondaryActionsTitle: "",
        dualOptionsPopUpSecondaryActions: () => {},
        showOTPModal: false,
        otpCode: "",
    };

    componentDidMount() {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_TABUNG_TABUNGVIEW,
            [FA_TAB_NAME]: tabOption[0].label,
        });
        this._syncDataToState();
        this.setNotificationIndicator();
        this._unsubscribeFocusListener = this.props.navigation.addListener("focus", () => {
            const {
                route: {
                    params: { refresh },
                },
                navigation: { setParams },
            } = this.props;
            if (refresh) {
                setParams({ refresh: false });
                this._reSyncDataToState();
            }
            this.setNotificationIndicator();
        });
    }

    componentWillUnmount() {
        const { showDualOptionsPopUp, showBoosterActivationFailureModal, showBoosterTooltip } =
            this.state;
        if (showDualOptionsPopUp || showBoosterActivationFailureModal || showBoosterTooltip) {
            this.setState({
                showBoosterTooltip: false,
                showBoosterActivationFailureModal: false,
                showDualOptionsPopUp: false,
            });
        }
        this._unsubscribeFocusListener();
    }

    _syncDataToState = async () => {
        try {
            const request = await this._getGoalDetail();
            const overviewData = request.data.result;
            if (overviewData?.status === "CANCELLED_PENDING") {
                this._handleDetailsException("Your friend has declined to join the Tabung.");
                return;
            }
            this.setState({
                overviewData,
                isFirstRender: false,
                showLoader: false,
            });
        } catch (error) {
            this._handleDetailsException(error.message);
        }
    };

    _handleDetailsException = (errorMessage) => {
        setTimeout(() => {
            showErrorToast({
                ...errorToastProp({
                    message: errorMessage,
                }),
            });
            this.props.navigation.goBack();
        }, 1000);
    };

    _reSyncDataToState = async () => {
        this.setState({
            showLoader: true,
        });
        try {
            const request = await this._getGoalDetail();
            this.setState({
                overviewData: request.data.result,
            });
        } catch (error) {
            showErrorToast({
                ...errorToastProp({
                    message: error.message,
                }),
            });
        } finally {
            this.setState({
                showLoader: false,
            });
        }
    };

    _getGoalDetail = async () => {
        try {
            const goalId = this.props?.route?.params?.id;
            if (!goalId) return;
            return await getGoalsList(`/goal/${goalId}/details`);
        } catch (error) {
            ErrorLogger(error);
            throw error;
        }
    };

    _getGoalNotifications = async () => {
        try {
            const goalId = this.props?.route?.params?.id;
            if (!goalId) return;
            const response = await getGoalNotifications(
                `/goal/notification/map?pageSize=1000&page=0&ids=` + goalId
            );
            if (response && response.status == 200) {
                console.log(response.data.resultList);
                this.setState({ notifications: response.data.resultList });
            }
        } catch (error) {
            ErrorLogger(error);
        }
    };

    _getOtpCode = async (otpRequestPayload) => {
        try {
            return await requestOTP(otpRequestPayload);
        } catch (error) {
            ErrorLogger(error);
            throw error;
        }
    };

    _generateTopMenuData = () => {
        const { overviewData } = this.state;
        const goalStatus = overviewData?.status ?? "active";
        const isGoalStatusPending = goalStatus.toLowerCase() === "pending";
        const isGoalStatusCompleted = goalStatus.toLowerCase() === "completed";

        if (overviewData?.userDetails?.owner) {
            if (isGoalStatusPending) return ownerPendingGoalTopMenuData;
            else {
                if (isGoalStatusCompleted) return ownerCompletedGoalTopMenuData;
                else return ownerNotCompletedGoalTopMenuData;
            }
        } else {
            if (isGoalStatusPending) return participantPendingGoalTopMenuData;
            else {
                if (isGoalStatusCompleted) return participantCompletedGoalTopMenuData;
                else return participantNotCompletedGoalTopMenuData;
            }
        }
    };

    _updateBoosterStatusAsInactive = async (id) => {
        try {
            const response = await goalBoosterPostServiceWrapper(`/goalBooster/off`, {
                boosterId: id,
                goalIds: [this.state.overviewData.id],
            });
            if (response && response.status === 200) return response;
            return null;
        } catch (error) {
            ErrorLogger(error);
            return null;
        }
    };

    _updateBoosterStatusAsActive = async (id) => {
        try {
            const response = await goalBoosterPostServiceWrapper(`/goalBooster/on`, {
                boosterId: id,
                goalIds: [this.state.overviewData.id],
            });
            if (response && response.status === 200) return response;
            return null;
        } catch (error) {
            ErrorLogger(error);
            return null;
        }
    };

    _updateESIStatus = async (esiDetail) => {
        try {
            return await esiPostServiceWrapper(`/esi/create`, esiDetail);
        } catch (error) {
            ErrorLogger(error);
            throw error;
        }
    };

    _requestL3Permission = async () => {
        try {
            return await invokeL3(false);
        } catch (error) {
            ErrorLogger(error);
            throw error;
        }
    };

    _removeGoalSummary = async (id) => {
        try {
            const response = await goalRemove(`/goal/remove/dashboard?goalId=${id}`, { id });
            if (response && response.status === 200) return response;
            return null;
        } catch (error) {
            ErrorLogger(error);
            return null;
        }
    };

    _onHeaderBackButtonPressed = () => this.props.navigation.goBack();

    setNotificationIndicator = async () => {
        try {
            const goalId = this.props?.route?.params?.id;
            if (!goalId) return;
            const response = await getGoalNotifications(
                `/goal/notification/unreadCount?goalId=` + goalId
            );
            console.log("unreadCount > ", response);
            console.log(response.data);
            this.setState({ newNotifications: response.data.code > 0 });
        } catch (error) {
            console.log("error", error);
            this.setState({ newNotifications: false });
        }
    };

    _onSwitchButtonPressed = async (value) => {
        if (value == 0) {
            logEvent(FA_VIEW_SCREEN, {
                [FA_SCREEN_NAME]: FA_TABUNG_TABUNGVIEW,
                [FA_TAB_NAME]: tabOption[0].label,
            });
        }
        if (value == 1) {
            logEvent(FA_VIEW_SCREEN, {
                [FA_SCREEN_NAME]: FA_TABUNG_TABUNGVIEW,
                [FA_TAB_NAME]: tabOption[1].label,
            });
            await this._getGoalNotifications();
            const { notifications } = this.state;
            console.log("notifications > " + JSON.stringify(notifications));
            const notSeenData = await notifications.reduce((collection, section) => {
                console.log("section > " + JSON.stringify(section));
                const notSeenNotification = section.notifications.filter((n) => !n.seen);
                console.log("notSeenNotification > " + JSON.stringify(notSeenNotification));
                if (notSeenNotification && notSeenNotification.length) {
                    const ids = notSeenNotification.map((n) => n.id);

                    return [...collection, ...ids];
                }
                return collection;
            }, []);

            console.log(notSeenData);
            if (notSeenData && notSeenData.length) {
                try {
                    const goalId = this.props?.route?.params?.id;
                    const res = await updateGoalNotifications(
                        `/goal/notification/seenByGoalId?id=${goalId}`,
                        "get",
                        false,
                        false
                    );
                    console.log("Updated > " + JSON.stringify(res));
                } catch (error) {
                    console.log(error);
                }
                setTimeout(async () => {
                    try {
                        await this._getGoalNotifications();
                    } catch (error) {
                        console.log(error);
                    }
                }, 5000);
            }
            this.setState({ newNotifications: false });
        } else {
            await this.setNotificationIndicator();
        }
        this.setState({ currentTab: value });
    };

    checkForEarnedChances = (s2w) => {
        // check if campaign is running and check if it matched the list
        const {
            misc: { isCampaignPeriod, isTapTasticReady, tapTasticType },
            s2w: { txnTypeList },
        } = this.props.model;

        if (s2w) {
            const { txnType, displayPopup, chance } = s2w;
            if (
                (isCampaignPeriod || isTapTasticReady) &&
                txnTypeList.includes(txnType) &&
                displayPopup
            ) {
                this.props.navigation.push("TabNavigator", {
                    screen: "CampaignChancesEarned",
                    params: {
                        chances: chance,
                        isTapTasticReady,
                        tapTasticType,
                    },
                });
            }
        }
    };

    _onBoosterItemTogglePressed = async ({ active, id, hasBooster, boosterType }) => {
        const activeVal = !active ? "On" : "off";

        const type =
            boosterType === "S"
                ? "Spare Change"
                : boosterType === "Q"
                ? "Scan & Save"
                : boosterType === "G"
                ? "Guilty Plesaure"
                : "";
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_TABUNG_TABUNGVIEW,
            [FA_TAB_NAME]: tabOption[0].label,
            [FA_ACTION_NAME]: type,
            [FIELD_INFORMATION]: activeVal,
        });

        const tabungStatus = this.state.overviewData?.status ?? "";
        if (tabungStatus.toLowerCase() !== "active") {
            showInfoToast(
                infoToastProp({
                    message:
                        "You may only add a Booster to an active Tabung. Please try again later.",
                })
            );
            return;
        }
        if (!active && !hasBooster) {
            this.props.navigation.navigate("boosterModule", {
                screen: boosterType === "Q" ? "BoosterSummary" : "BoosterSetup",
                params: {
                    boosterId: id,
                    boosterType,
                },
            });
            return;
        }
        this.setState({
            isLoadingBoosterStatus: true,
        });
        try {
            if (active) await this._updateBoosterStatusAsInactive(id);
            else {
                const response = await this._updateBoosterStatusAsActive(id);
                this.checkForEarnedChances(response.data.s2w);
            }
            const request = await this._getGoalDetail();

            this.setState({
                overviewData: request?.data?.result ?? {},
            });
        } catch (error) {
            ErrorLogger(error);
            showErrorToast(
                errorToastProp({
                    message: `Unable to ${active ? "deactivate" : "activate"} booster.`,
                })
            );
        } finally {
            this.setState({
                isLoadingBoosterStatus: false,
            });
        }
    };

    _onBoosterTooltipPressed = () => this.setState({ showBoosterTooltip: true });

    _onBoosterModalDismissed = () => this.setState({ showBoosterTooltip: false });

    _onEsiTogglePressed = () => {
        const { overviewData } = this.state;
        const tabungStatus = overviewData?.status ?? "";
        const currentUserEsiStatus = overviewData.userDetails?.esiDetail?.esiStatus ?? "";
        if (tabungStatus.toLowerCase() === "pending") {
            showInfoToast({
                message:
                    "You may only activate and deactivate auto deduction to an active Tabung. Please try again later.",
            });
            return;
        }

        switch (currentUserEsiStatus.toLowerCase()) {
            case "on":
                // this._handleESIDeletion()
                this.props.navigation.navigate("TabungMain", {
                    screen: "ESICreationScreen",
                    params: {
                        goalDetailData: overviewData,
                        isToggleOn: true,
                    },
                });
                break;
            case "off":
                this.props.navigation.navigate("TabungMain", {
                    screen: "ESICreationScreen",
                    params: {
                        goalDetailData: overviewData,
                        isToggleOn: false,
                    },
                });
                break;
            case "pending_off":
                showInfoToast({
                    message:
                        "Unable to update your auto deduction, it's currently pending to be turned off.",
                });
                break;
            case "pending_on":
                showInfoToast({
                    message:
                        "Unable to update your auto deduction, it's currently pending to be turned on.",
                });
                break;
            default: {
                showInfoToast({
                    message:
                        "Unable to update your auto deduction, please contact system administrator",
                });
                ErrorLogger(
                    new Error(
                        `Invalid esi status: ${overviewData.ownerDetails?.esiDetail?.esiStatus}`
                    )
                );
            }
        }
    };

    _handleESIDeletion = async () => {
        try {
            await this._requestL3Permission();
            const request = await this._getOtpCode({
                mobileNo: this.props.model.m2uDetails.m2uPhoneNumber,
                otpType: "MAYAUSER",
                transactionType: "GOAL_ESI",
            });
            this.setState({
                showOTPModal: true,
                otpCode: request?.data?.result?.otpValue ?? "",
            });
        } catch (error) {
            showErrorToast({
                message: error.message,
            });
        }
    };

    _onOTPDoneButtonPressed = async (otpInput) => {
        this.setState({ showLoader: true, showOTPModal: false });
        const REF_ID_TITLE = "Reference ID";
        const DATE_TITLE = "Date & time";
        try {
            const {
                overviewData: {
                    ownerDetails: {
                        esiDetail: { frequency, esiAmount },
                        esiInfo: { nextDeduction, weekly, monthly },
                        participantId,
                        disAccount,
                    },
                    id,
                    trxRefNo,
                },
            } = this.state;
            const {
                model: {
                    device: { deviceId },
                },
            } = this.props;
            const accountNumber = disAccount.replace(/\s/gi, "");
            const encryptedOtp = await encryptData(otpInput);
            const request = await this._updateESIStatus({
                nextDeduction,
                deviceId,
                frequency,
                participantId,
                lastDeduction: frequency === "W" ? weekly.lastDeduction : monthly.lastDeduction,
                esiOn: false,
                amount: esiAmount,
                goalId: id,
                txnRefId: trxRefNo,
                fromAcct: accountNumber,
                toAcct: accountNumber,
                otp: encryptedOtp,
            });
            if (request?.status === 200) {
                this.props.navigation.navigate("TabungMain", {
                    screen: "ESIAcknowledgementScreen",
                    params: {
                        isSuccessful: true,
                        esiSuccessDetail: [
                            {
                                title: REF_ID_TITLE,
                                value: request.data.result.trxRefId,
                            },
                            {
                                title: DATE_TITLE,
                                value: request.data.result.createdDate,
                            },
                        ],
                        isEsiEnabled: false,
                    },
                });
            } else {
                this.props.navigation.navigate("TabungMain", {
                    screen: "ESIAcknowledgementScreen",
                    params: {
                        errorMessage: request.message,
                        isSuccessful: true,
                        esiSuccessDetail: [
                            {
                                title: REF_ID_TITLE,
                                value: request.data.result.trxRefId,
                            },
                            {
                                title: DATE_TITLE,
                                value: request.data.result.createdDate,
                            },
                        ],
                        isEsiEnabled: false,
                    },
                });
            }
        } catch (error) {
            this.props.navigation.navigate("TabungMain", {
                screen: "ESIAcknowledgementScreen",
                params: {
                    errorMessage: error.message,
                    isSuccessful: false,
                    esiSuccessDetail: [
                        {
                            title: REF_ID_TITLE,
                            value:
                                error?.error?.result?.trxRefId ||
                                error?.error?.refId ||
                                error?.error?.transactionRefNumber ||
                                "N/A",
                        },
                        {
                            title: DATE_TITLE,
                            value:
                                error?.error?.result?.serverDate ||
                                error?.error?.serverDate ||
                                "N/A",
                        },
                    ],
                    isEsiEnabled: false,
                },
            });
        } finally {
            this.setState({ showLoader: false, showOTPModal: false, otpCode: "" });
        }
    };

    _onRemoveSummaryButtonPressed = async () => {
        this.setState({ showLoader: true });
        // check downtime and show error if downtime
        const isDownTime = await showGoalDowntimeError();
        if (!isDownTime) {
            const request = await this._removeGoalSummary(this.state.overviewData.id);
            this.setState({ showLoader: false });
            if (request) {
                showSuccessToast({
                    ...successToastProp({
                        message: "Tabung summary succesfully deleted.",
                    }),
                });
                this.props.navigation.goBack();
            } else {
                showErrorToast({
                    ...errorToastProp({
                        message: "Unable to delete your tabung summary, please try again.",
                    }),
                });
            }
        }
    };

    _renderCTA = () => {
        const { overviewData } = this.state;
        const tabungStatus = overviewData.status ?? "";
        const didUserWithdrawnFunding = overviewData.userDetails?.withdrawFull;
        const didUserContributed =
            overviewData.userDetails?.formattedTotContributedAmount !== "0.00";
        const withdrawButton = (
            <FixedActionContainer>
                <ActionButton
                    fullWidth
                    onPress={this._handleTabungRemoval}
                    componentCenter={
                        <Typo
                            text="Withdraw Funds"
                            fontSize={14}
                            fontWeight="600"
                            lineHeight={18}
                        />
                    }
                />
            </FixedActionContainer>
        );
        const removeButton = (
            <FixedActionContainer>
                <ActionButton
                    fullWidth
                    onPress={this._onRemoveSummaryButtonPressed}
                    componentCenter={
                        <Typo text="Remove" fontSize={14} fontWeight="600" lineHeight={18} />
                    }
                />
            </FixedActionContainer>
        );

        if (
            tabungStatus.toLowerCase() === "cancelled" &&
            !didUserWithdrawnFunding &&
            didUserContributed
        ) {
            return withdrawButton;
        } else if (
            tabungStatus.toLowerCase() === "cancelled" &&
            didUserWithdrawnFunding &&
            didUserContributed
        ) {
            return removeButton;
        } else if (tabungStatus.toLowerCase() === "cancelled" && !didUserContributed) {
            return removeButton;
        } else if (tabungStatus.toLowerCase() === "completed" && didUserWithdrawnFunding) {
            return removeButton;
        } else return null;
    };

    _onTopMenuDismissed = () => this.setState({ showTopMenu: false });

    _onHeaderOptionButtonPressed = () => {
        logEvent(FA_OPEN_MENU, {
            [FA_SCREEN_NAME]: FA_TABUNG_TABUNGVIEW,
            [FA_TAB_NAME]: tabOption[this.state.currentTab].label,
        });
        this.setState({ showTopMenu: true });
    };

    _onTopMenuItemPressed = (param) => {
        this.setState({ showTopMenu: false }, async () => {
            const {
                overviewData: {
                    name,
                    id,
                    userDetails: {
                        disAccount: participantAccountNumber,
                        disAcctCode: participantAccountCode,
                    },
                    participants,
                    userDetails: { owner, participantId },
                },
            } = this.state;
            // get Tabung downtime status
            const { isDownTime, errorMessage } = (await this._checkGoalDowntime()) ?? {};

            let dualOptionsPopUpDescription = "";

            switch (param) {
                case "VIEW_MEDIA_LINKS":
                    break;
                case "EDIT_PHOTO":
                    logEvent(FA_SELECT_MENU, {
                        [FA_SCREEN_NAME]: FA_TABUNG_TABUNGVIEW,
                        [FA_ACTION_NAME]: FA_TABUNG_EDIT_PHOTO,
                    });
                    setTimeout(
                        () =>
                            this.setState({ showActionSheet: true }, () => {
                                this.actionSheetReference.show();
                            }),
                        0
                    );
                    break;
                case "FUND_TABUNG":
                    logEvent(FA_SELECT_MENU, {
                        [FA_SCREEN_NAME]: FA_TABUNG_TABUNGVIEW,
                        [FA_ACTION_NAME]: FA_TABUNG_FUND_TABUNG,
                    });
                    this._handleFundTabung();
                    break;
                case "RENAME_TABUNG":
                    logEvent(FA_SELECT_MENU, {
                        [FA_SCREEN_NAME]: FA_TABUNG_TABUNGVIEW,
                        [FA_ACTION_NAME]: FA_TABUNG_RENAME_TABUNG,
                    });
                    this.props.navigation.navigate("TabungMain", {
                        screen: "GoalRenameScreen",
                        params: {
                            goalTitle: name,
                            goalId: id,
                        },
                    });
                    break;
                case "WITHDRAW_TABUNG":
                    logEvent(FA_SELECT_MENU, {
                        [FA_SCREEN_NAME]: FA_TABUNG_TABUNGVIEW,
                        [FA_ACTION_NAME]: FA_TABUNG_WITHDRAW_TABUNG,
                    });
                    {
                        //FIXME: This is a temp workaround for reason that the modal removal modal doesnt rendered at all after the top menu modal supposedly closed.
                        setTimeout(
                            () =>
                                this.setState({
                                    showDualOptionsPopUp: true,
                                    dualOptionsPopUpTitle: "Withdraw Tabung",
                                    dualOptionsPopUpDescription:
                                        "Withdrawing from your Tabung means it might take longer to reach your goal.",
                                    dualOptionsPopUpPrimaryActionsTitle: "Withdraw",
                                    dualOptionsPopUpPrimaryActions:
                                        this._onWithdrawalPopUpConfirmButtonPressed,
                                    dualOptionsPopUpSecondaryActionsTitle: "Cancel",
                                    dualOptionsPopUpSecondaryActions:
                                        this._onDualOptionsPopUpDismissed,
                                }),
                            0
                        );
                    }
                    break;
                case "REMOVE_TABUNG":
                    logEvent(FA_SELECT_MENU, {
                        [FA_SCREEN_NAME]: FA_TABUNG_TABUNGVIEW,
                        [FA_ACTION_NAME]: FA_TABUNG_REMOVE_TABUNG,
                    });
                    if (isDownTime) {
                        this.setState({
                            showDualOptionsPopUp: false,
                        });
                        showInfoToast({ message: errorMessage });
                        break;
                    }
                    if (participants.length <= 1) {
                        dualOptionsPopUpDescription =
                            "Are you sure you want to remove this Tabung? This action is final and means you’ll no longer be able to contribute towards this goal. Your contributed portion will be returned to you. ";
                    } else if (participants.length > 1 && owner) {
                        dualOptionsPopUpDescription =
                            "Are you sure you want to remove this Tabung? We’ll notify all group members so they can claim their contributed portions. This action is final and cannot be undone.";
                    } else {
                        dualOptionsPopUpDescription =
                            "Are you sure you want to leave this Tabung? Leaving a Tabung is final and means you’ll no longer be able to contribute towards this goal. Your contributed portion will be returned to you.";
                    }

                    //FIXME: This is a temp workaround for reason that the modal removal modal doesnt rendered at all after the top menu modal supposedly closed.
                    setTimeout(
                        () =>
                            this.setState({
                                showDualOptionsPopUp: true,
                                dualOptionsPopUpTitle: "Remove Tabung",
                                dualOptionsPopUpDescription,
                                dualOptionsPopUpPrimaryActionsTitle: "Remove",
                                dualOptionsPopUpPrimaryActions:
                                    this._onTabungRemovalPopUpConfirmButtonPressed,
                                dualOptionsPopUpSecondaryActionsTitle: "Keep",
                                dualOptionsPopUpSecondaryActions: this._onDualOptionsPopUpDismissed,
                            }),
                        0
                    );
                    break;
                default:
            }
        });
    };

    _onWithdrawalPopUpConfirmButtonPressed = async () => {
        this._onDualOptionsPopUpDismissed();

        const {
            overviewData: {
                name,
                id,
                status,
                ownerDetails: { imageUrl, name: ownerName, disAccount, disAcctCode },
                userDetails: {
                    disAccount: participantAccountNumber,
                    disAcctCode: participantAccountCode,
                    owner,
                    formattedTotContributedAmount: participantFormattedContributionAmount,
                    participantId,
                },
            },
        } = this.state;

        const correctedParticipantFormattedContributionAmount =
            participantFormattedContributionAmount ?? "0.00";
        const completed = status === "COMPLETED";

        if (numeral(correctedParticipantFormattedContributionAmount).value() <= 0) {
            showErrorToast({
                ...errorToastProp({
                    message:
                        "You will need to fund this tabung first in order to make a withdrawal.",
                }),
            });
            return;
        }
        if (completed && owner) {
            this.props.navigation.navigate("TabungMain", {
                screen: "GoalTopUpAndWithdrawalConfirmationScreen",
                params: {
                    goalTitle: name,
                    goalId: id,
                    isAmountEditable: false,
                    formattedAmount: correctedParticipantFormattedContributionAmount,
                    ctaButtonTitle: "Withdraw Funds",
                    isWithdrawalConfirmation: true,
                    participantAccountCode,
                    participantAccountNumber,
                    creatorAccountNumber: disAccount,
                    creatorName: ownerName,
                    isCompletionWithdrawal: true,
                    goalParticipantId: participantId,
                },
            });
        } else if (completed && !owner) {
            this.props.navigation.navigate("TabungMain", {
                screen: "GoalGroupWithdrawalTransferSelectionScreen",
                params: {
                    goalTitle: name,
                    goalId: id,
                    isAmountEditable: false,
                    formattedAmount: correctedParticipantFormattedContributionAmount,
                    ctaButtonTitle: "Withdraw Funds",
                    isWithdrawalConfirmation: true,
                    creatorImage: imageUrl,
                    creatorName: ownerName,
                    creatorAccountNumber: disAccount,
                    creatorAccountCode: disAcctCode,
                    creatorAccountName: `${ownerName} Account`,
                    participantAccountCode,
                    participantAccountNumber,
                    isCompletionWithdrawal: true,
                    goalParticipantId: participantId,
                },
            });
        } else {
            this.props.navigation.navigate("TabungMain", {
                screen: "GoalPartialWithdrawalAmountScreen",
                params: {
                    goalTitle: name,
                    goalId: id,
                    formattedTotalSavedAmount: correctedParticipantFormattedContributionAmount,
                    participantAccountNumber,
                    participantAccountCode,
                    goalParticipantId: participantId,
                },
            });
        }
    };

    _onManageBoosterButtonPressed = () => {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_TABUNG_TABUNGVIEW,
            [FA_TAB_NAME]: tabOption[0].label,
            [FA_ACTION_NAME]: MANAGE_BOOSTERS,
        });
        this.props.navigation.navigate("TabNavigator", {
            screen: "Tab",
            params: {
                screen: "More",
                params: {
                    screen: "TabungTab",
                    params: {
                        refresh: false,
                        index: 1,
                    },
                },
            },
        });
    };

    _onTabungRemovalPopUpConfirmButtonPressed = () => {
        this._onDualOptionsPopUpDismissed();
        this._handleTabungRemoval();
    };

    _handleTabungRemoval = () => {
        const {
            overviewData: {
                name,
                id,
                ownerDetails: {
                    name: ownerName,
                    withdrawFull: didCreatorFullyWithdraw,
                    deletedDate: creatorDeletionDate,
                },
                userDetails: {
                    owner,
                    withdrawFull: didParticipantFullyWithdraw,
                    deletedDate: participantDeletionDate,
                    formattedTotContributedAmount: participantFormattedContributionAmount,
                    disAccount: participantAccountNumber,
                    disAcctCode: participantAccountCode,
                    participantId,
                },
                participants,
            },
        } = this.state;

        const correctedParticipantFormattedContributionAmount =
            participantFormattedContributionAmount ?? "0.00";

        this.props.navigation.navigate("TabungMain", {
            screen: "GoalRemoveScreen",
            params: {
                goalTitle: name,
                goalId: id,
                isAmountEditable: false,
                ctaButtonTitle: "Withdraw Funds",
                isGoalOwner: owner,
                didParticipantFullyWithdraw,
                didCreatorFullyWithdraw,
                isGroupGoal: participants.length > 1,
                didCreatorRemoveGoal: !!creatorDeletionDate,
                didParticipantRemoveGoal: !!participantDeletionDate,
                creatorName: ownerName,
                formattedAmount: correctedParticipantFormattedContributionAmount,
                participantAccountNumber,
                participantAccountCode,
                goalParticipantId: participantId,
                isIncompleteRemoval: true,
                isWithdrawalConfirmation: true,
            },
        });
    };

    _onBoosterActivationErrorPopUpDismissed = () =>
        this.setState({ showBoosterActivationFailureModal: false });

    _onDualOptionsPopUpDismissed = () =>
        this.setState({
            showDualOptionsPopUp: false,
            dualOptionsPopUpTitle: "",
            dualOptionsPopUpDescription: "",
            dualOptionsPopUpPrimaryActionsTitle: "",
            dualOptionsPopUpPrimaryActions: () => {},
            dualOptionsPopUpSecondaryActionsTitle: "",
            dualOptionsPopUpSecondaryActions: () => {},
        });

    _renderOptionsButton = () => {
        const { overviewData } = this.state;
        const tabungStatus = overviewData?.status ?? "";

        if (
            tabungStatus.toLowerCase() === "active" ||
            tabungStatus.toLowerCase() === "pending" ||
            (tabungStatus.toLowerCase() === "completed" && !overviewData.userDetails.withdrawFull)
        ) {
            return <HeaderDotDotDotButton onPress={this._onHeaderOptionButtonPressed} />;
        }
        return null;
    };

    _setActionSheetReference = (ref) => (this.actionSheetReference = ref);

    _onActionSheetOptionsPressed = (index) => {
        this.setState({
            showActionSheet: false,
        });
        if (index < 2) {
            this.props.navigation.navigate("TabungMain", {
                screen: "GoalEditPictureScreen",
                params: {
                    useCamera: index === 0,
                    goalId: this.state.overviewData.id,
                },
            });
        }
    };

    _onOTPModalDismissed = () =>
        this.setState({
            showOTPModal: false,
            otpCode: "",
        });

    _onOTPResendButtonPressed = async (callBack) => {
        await this._handleESIDeletion();
        callBack();
    };

    _checkGoalDowntime = async () => {
        try {
            const response = await checkGoalDowntime();
            if (response && response.status === 200) {
                const { canCreateGoals, errorMessage } = response?.data?.result ?? {};
                return {
                    isDownTime: !canCreateGoals,
                    errorMessage,
                };
            }
            return null;
        } catch (error) {
            showErrorToast(error);
            return null;
        }
    };

    _handleFundTabung = () => {
        const {
            overviewData: {
                name,
                id,
                userDetails: {
                    disAccount: participantAccountNumber,
                    disAcctCode: participantAccountCode,
                },
                userDetails: { participantId },
            },
        } = this.state;
        this.props.navigation.navigate(TABUNG_MAIN, {
            screen: GOAL_TOPUP_AMOUNT_SCREEN,
            params: {
                goalTitle: name,
                goalId: id,
                participantAccountNumber,
                participantAccountCode,
                isTopUpConfirmation: true,
                goalParticipantId: participantId,
            },
        });
    };

    render() {
        const {
            currentTab,
            overviewData,
            showLoader,
            isLoadingBoosterStatus,
            showBoosterTooltip,
            showTopMenu,
            showBoosterActivationFailureModal,
            showDualOptionsPopUp,
            dualOptionsPopUpTitle,
            dualOptionsPopUpDescription,
            dualOptionsPopUpPrimaryActions,
            dualOptionsPopUpPrimaryActionsTitle,
            dualOptionsPopUpSecondaryActions,
            dualOptionsPopUpSecondaryActionsTitle,
            isFirstRender,
            showOTPModal,
            otpCode,
            showActionSheet,
        } = this.state;

        //TODO: Implement shimmer for better ux transition.
        if (isFirstRender) return <ScreenLoader showLoader />;

        const topMenuData = this._generateTopMenuData();
        const tabungStatus = overviewData?.status ?? "";
        const additionalProp =
            tabungStatus.toLowerCase() === "cancelled" ||
            (tabungStatus.toLowerCase() === "completed" && overviewData.userDetails?.withdrawFull)
                ? null
                : { neverForceInset: ["bottom"] };

        return (
            <React.Fragment>
                <ScreenContainer
                    backgroundType="color"
                    showLoaderModal={showLoader}
                    showOverlay={showActionSheet}
                >
                    <ScreenLayout
                        header={
                            <HeaderLayout
                                horizontalPaddingMode="custom"
                                horizontalPaddingCustomLeftValue={16}
                                horizontalPaddingCustomRightValue={16}
                                headerLeftElement={
                                    <View style={styles.headerButtonContainer}>
                                        <HeaderBackButton
                                            onPress={this._onHeaderBackButtonPressed}
                                        />
                                    </View>
                                }
                                headerCenterElement={
                                    <Typo
                                        text="Tabung"
                                        fontSize={16}
                                        fontWeight="600"
                                        lineHeight={32}
                                    />
                                }
                                headerRightElement={
                                    <View style={styles.headerButtonContainer}>
                                        {this._renderOptionsButton()}
                                    </View>
                                }
                            />
                        }
                        paddingBottom={0}
                        paddingTop={0}
                        paddingHorizontal={0}
                        useSafeArea
                        {...additionalProp}
                    >
                        <React.Fragment>
                            <ScrollView showsVerticalScrollIndicator={false}>
                                <View style={styles.switchContainer}>
                                    <SwitchButton
                                        initial={tabNameEnum.overview}
                                        onPress={this._onSwitchButtonPressed}
                                        options={tabOption}
                                        indicator={this.state.newNotifications}
                                    />
                                </View>
                                <View style={styles.contentContainer}>
                                    {currentTab ? (
                                        <Activity data={this.state.notifications} />
                                    ) : (
                                        <Overview
                                            {...overviewData}
                                            isLoadingBoosterStatus={isLoadingBoosterStatus}
                                            onBoosterItemTogglePressed={
                                                this._onBoosterItemTogglePressed
                                            }
                                            onBoosterTooltipPressed={this._onBoosterTooltipPressed}
                                            onEsiTogglePressed={this._onEsiTogglePressed}
                                            onManageBoosterButtonPressed={
                                                this._onManageBoosterButtonPressed
                                            }
                                            isLoading={showLoader}
                                        />
                                    )}
                                </View>
                            </ScrollView>
                            {currentTab === 0 && tabungStatus.toLowerCase() === "active" && (
                                <View style={styles.bottomBtnContCls}>
                                    <FixedActionContainer>
                                        <ActionButton
                                            activeOpacity={0.5}
                                            backgroundColor={YELLOW}
                                            fullWidth
                                            componentCenter={
                                                <Typo
                                                    fontSize={14}
                                                    lineHeight={18}
                                                    fontWeight="600"
                                                    text={FUND_TABUNG}
                                                />
                                            }
                                            onPress={this._handleFundTabung}
                                        />
                                    </FixedActionContainer>
                                </View>
                            )}
                            {this._renderCTA()}
                        </React.Fragment>
                    </ScreenLayout>
                </ScreenContainer>
                {showOTPModal && (
                    <OtpModal
                        mobileNumber={maskedMobileNumber(
                            this.props.model.m2uDetails.m2uPhoneNumber
                        )}
                        otpCode={otpCode}
                        onOtpClosePress={this._onOTPModalDismissed}
                        onOtpDonePress={this._onOTPDoneButtonPressed}
                        onResendOtpPress={this._onOTPResendButtonPressed}
                    />
                )}
                <TopMenu
                    showTopMenu={showTopMenu}
                    onClose={this._onTopMenuDismissed}
                    menuArray={topMenuData}
                    onItemPress={this._onTopMenuItemPressed}
                />
                <Popup
                    visible={showBoosterTooltip}
                    title="How Can Boosters Help?"
                    description="Complete your Tabung even sooner with Boosters. It helps your Tabung to grow in many ways, like channeling rounded up change and savings from promos into your goal."
                    onClose={this._onBoosterModalDismissed}
                />
                <Popup
                    visible={showBoosterActivationFailureModal}
                    title="Tabung Not Active"
                    description="You may only add Booster to an active Tabung. Try again once your Tabung is Active"
                    onClose={this._onBoosterActivationErrorPopUpDismissed}
                    primaryAction={{
                        text: "Got It",
                        onPress: this._onBoosterActivationErrorPopUpDismissed,
                    }}
                />
                <Popup
                    visible={showDualOptionsPopUp}
                    title={dualOptionsPopUpTitle}
                    description={dualOptionsPopUpDescription}
                    onClose={this._onDualOptionsPopUpDismissed}
                    primaryAction={{
                        text: dualOptionsPopUpPrimaryActionsTitle,
                        onPress: dualOptionsPopUpPrimaryActions,
                    }}
                    secondaryAction={{
                        text: dualOptionsPopUpSecondaryActionsTitle,
                        onPress: dualOptionsPopUpSecondaryActions,
                    }}
                />
                <ActionSheet
                    ref={this._setActionSheetReference}
                    options={["Take a photo", "Choose from library", "Cancel"]}
                    cancelButtonIndex={2}
                    onPress={this._onActionSheetOptionsPressed}
                    styles={{
                        overlay: {
                            position: "absolute",
                            top: 0,
                            right: 0,
                            bottom: 0,
                            left: 0,
                            opacity: 0,
                            backgroundColor: "transparent",
                        },
                    }}
                />
            </React.Fragment>
        );
    }
}

const styles = StyleSheet.create({
    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        paddingBottom: Platform.OS === "ios" ? 36 : 0,
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 24,
    },
    headerButtonContainer: {
        alignItems: "center",
        height: 45,
        justifyContent: "center",
        width: 45,
    },
    switchContainer: {
        marginBottom: 26,
        marginHorizontal: 40,
        marginTop: 16,
    },
});

export default function TabungDetailsScreen(props) {
    const model = useModelState();
    return <TabungDetails model={model} {...props} />;
}
