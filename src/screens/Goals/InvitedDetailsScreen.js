import NetInfo from "@react-native-community/netinfo";
import React, { Component } from "react";
import { View, ScrollView, Text, Platform, AsyncStorage } from "react-native";

import * as navigationConstant from "@navigation/navigationConstant";
import NavigationService from "@navigation/navigationService";

import {
    HighlightText,
    HeaderPageIndicator,
    TabungParticipantInvitedList,
    ErrorMessage,
    DropDownButtonNoIcon,
} from "@components/Common";

import { logEvent } from "@services/analytics";
import { getGoalDetailsAPI, joinGoalAPI, rejectGoalAPI } from "@services/index";

import * as Strings from "@constants/strings";

import * as ModelClass from "@utils/dataModel/modelClass";
import * as Utility from "@utils/dataModel/utility";

import Styles from "@styles/Wallet/TabungStyle";
import commonStyles from "@styles/main";

export const IS_IOS = Platform.OS === "ios";

class InvitedDetailsScreen extends Component {
    static navigationOptions = { title: "", header: null };

    constructor(props) {
        super(props);
        let pendingSelectedData =
            props.route.params?.selectedGoal ?? ModelClass.TABUNG_GOALS_DATA.pendingSelectedData;
        let ownerName = "";
        if (
            pendingSelectedData != null &&
            pendingSelectedData != undefined &&
            pendingSelectedData.ownerDetails != undefined
        ) {
            ownerName = pendingSelectedData.ownerDetails.name;
        }
        console.log("ownerName==> ", ownerName);
        this.state = {
            refreshing: false,
            loader: false,
            requesterName: ownerName,
            nom2u: false,
            nowallet: false,
            goalSelectedData: pendingSelectedData,
            showRejectConfirm: false,
            requesterTitle: ownerName + Strings.HAS_INVITED_YOU_JOIN_TABUNG,
            goalName: pendingSelectedData.name,
            goalAmount: Strings.CURRENCY + pendingSelectedData.formattedTotalAmount,
            goalStartDate: pendingSelectedData.formattedStartDate,
            goalEndDate: pendingSelectedData.formattedEndDate,
            goalParticipant: [],
            goalId: props.route.params?.goalId ?? "",
            source: props.route.params?.source ?? "",
            selectedGoal:
                props.route.params?.selectedGoal ??
                ModelClass.TABUNG_GOALS_DATA.pendingSelectedData,
        };
        this.onListItemClick = this._onListItemClick.bind(this);
        this.onRejectClick = this._onRejectClick.bind(this);
        this.onApproveClick = this._onApproveClick.bind(this);
    }

    componentDidMount() {
        const { goalId } = this.state;
        const { route } = this.props;
        const paramGoalId = route.params?.goalId ?? null;

        // the goalId setting might be async so it might not be available/ready on CDM
        if (goalId || paramGoalId || ModelClass.TABUNG_GOALS_DATA.callDetails) {
            this._getGoalDetailsData();
        }

        this.focusSubscription = this.props.navigation.addListener("focus", () => {
            const { goaldId } = this.state;

            if (goaldId || ModelClass.TABUNG_GOALS_DATA.callDetails) {
                this._getGoalDetailsData();
            }
        });
        this.blurSubscription = this.props.navigation.addListener("blur", () => {});
        logEvent(Strings.FA_VIEW_SCREEN, {
            [Strings.FA_SCREEN_NAME]: Strings.FA_TABUNG_INVITATION_VIEW,
        });
    }

    componentWillUnmount() {
        this.focusSubscription();
        this.blurSubscription();
    }

    _getGoalDetailsData = async () => {
        console.log("_getGoalDetailsData==> ");

        const { goalId } = this.state;
        ModelClass.TABUNG_GOALS_DATA.goalDetailsCalled = true;

        this.setState({ loader: true });

        const subUrl = `/goal/participants/pending/${
            goalId ? goalId : ModelClass.TABUNG_GOALS_DATA.goalSelectedID
        }`;
        let params = {};

        try {
            params = JSON.stringify({});
            NetInfo.isConnected.fetch().then(async (isConnected) => {
                if (isConnected) {
                    getGoalDetailsAPI(subUrl, JSON.parse(params))
                        .then((response) => {
                            let responseObject = response.data;
                            console.log(subUrl + " RESPONSE RECEIVED: ", response.data);
                            ModelClass.TABUNG_GOALS_DATA.acctDetailsObj = responseObject.result;
                            if (
                                responseObject !== null &&
                                responseObject !== undefined &&
                                responseObject.result !== null &&
                                responseObject.result !== undefined
                            ) {
                                this._updateDetailsScreenData(responseObject.result);
                            } else if (
                                responseObject !== null &&
                                responseObject !== undefined &&
                                responseObject.result !== null &&
                                responseObject.result !== undefined
                            ) {
                                this.setState({ loader: false, refreshing: false });
                            } else {
                                this.setState({ loader: false, refreshing: false });
                            }
                        })
                        .catch((error) => {
                            console.log(subUrl + "  ERROR==> ", error);
                            this.setState({ loader: false, refreshing: false });
                        });
                } else {
                    this.setState({ loader: false, refreshing: false });
                }
            });
        } catch (e) {
            this.setState({ loader: false, refreshing: false });
            console.log(subUrl + "  catch ERROR==> " + e);
        }
    };

    _updateDetailsScreenData = (data) => {
        console.log("_updateDetailsScreenData : ", data);

        let participants = data.participants;
        let participantsData = [];
        let userDetails = data.userDetails;
        let currentUserID = 0;
        let ownerDetails = data.ownerDetails;
        if (userDetails != undefined) {
            currentUserID = userDetails.userId;
        }

        if (participants != undefined) {
            console.log("participants : ", participants);

            for (let k = 0; k < participants.length; k++) {
                let participantObj = participants[k];
                let participantName =
                    currentUserID === participantObj.userId ? "You" : participantObj.name;
                let obj = {
                    participantPic: participantObj.imageUrl,
                    contributionAmount: participantObj.contributionAmount,
                    formattedContributionAmount: participantObj.formattedContributionAmount,
                    goalId: participantObj.goalId,
                    id: participantObj.id,
                    picArrayDisplay: [
                        {
                            participantPic: participantObj.imageUrl,
                            participantName: participantName
                                .split(/\s/)
                                .reduce((response, word) => (response += word.slice(0, 2)), "")
                                .toUpperCase()
                                .substring(0, 2),
                        },
                    ],
                    participantName: participantName,
                    key: k,
                    amount: Strings.CURRENCY + participantObj.formattedContributionAmount,
                    imageUrl: participantObj.imageUrl,
                    name: participantObj.name,
                    owner: participantObj.owner,
                    totalAmount: participantObj.totalAmount,
                    totalBoosterAmount: participantObj.totalBoosterAmount,
                    status: "Pending",
                    backgroundImage: participantObj.imageUrl,
                    userImage: participantObj.imageUrl,
                    isMaya: true,
                };

                participantsData.push(obj);
            }
            ModelClass.TABUNG_GOALS_DATA.invitedParticipants = participantsData;
            ModelClass.GOAL_DATA.friendList = participantsData;
        }

        this.setState({
            goalSelectedDetails: data,
            goalParticipant: participantsData,
            goalSelectedData: participantsData,
            loader: false,
            refreshing: false,
            picArrayDisplay: participantsData,
            rand: Math.random(),
        });
        this.calculateFrequency();
    };

    calculateFrequency = async () => {
        ModelClass.GOAL_DATA.frequencyList = [];
        console.log("calculateFrequency");
        console.log("this.state.goalSelectedData", this.state.goalSelectedData);
        console.log("this.state.goalSelectedDetails", this.state.goalSelectedDetails);
        ModelClass.GOAL_DATA.joinGoal = true;
        ModelClass.GOAL_DATA.esiActivation = false;
        ModelClass.GOAL_DATA.esiDiactivation = false;
        try {
            let frequencyList = [];
            let week = {};
            week.amount = Number(
                Math.round(
                    this.state.goalSelectedDetails.userDetails.esiInfo.weekly.amount + "e2"
                ) + "e-2"
            );
            week.type = "W";
            week.title = "Save RM " + Utility.numberWithCommas(week.amount) + " / week";
            week.name = week.title;
            week.description = "";
            week.formattedLastDeductionDate =
                this.state.goalSelectedDetails.userDetails.esiInfo.weekly.formattedLastDeductionDate;
            week.lastDeduction =
                this.state.goalSelectedDetails.userDetails.esiInfo.weekly.lastDeduction;
            if (this.state.goalSelectedDetails.frequency === "W") {
                week.primary = true;
                ModelClass.GOAL_DATA.frequencyType = "W";
                ModelClass.GOAL_DATA.frequencyAmount = week.amount;
                ModelClass.GOAL_DATA.frequencylastDeduction =
                    this.state.goalSelectedDetails.userDetails.esiInfo.weekly.lastDeduction;
            } else {
                week.primary = false;
            }
            week.primary = false;
            frequencyList.push(week);
            let month = {};
            month.amount = Number(
                Math.round(
                    this.state.goalSelectedDetails.userDetails.esiInfo.monthly.amount + "e2"
                ) + "e-2"
            );
            month.type = "M";
            month.title = "Save RM " + Utility.numberWithCommas(month.amount) + " / month";
            month.name = month.title;
            month.description = "";
            month.formattedLastDeductionDate =
                this.state.goalSelectedDetails.userDetails.esiInfo.monthly.formattedLastDeductionDate;
            week.lastDeduction =
                this.state.goalSelectedDetails.userDetails.esiInfo.monthly.lastDeduction;
            if (this.state.goalSelectedDetails.userDetails.frequency === "M") {
                month.primary = true;
                ModelClass.GOAL_DATA.frequencyType = "M";
                ModelClass.GOAL_DATA.frequencyAmount = month.amount;
                ModelClass.GOAL_DATA.frequencylastDeduction =
                    this.state.goalSelectedDetails.userDetails.esiInfo.monthly.lastDeduction;
            } else {
                month.primary = false;
            }
            frequencyList.push(month);
            ModelClass.GOAL_DATA.frequencyList = [...frequencyList];
            console.log("ModelClass.GOAL_DATA.frequencyList", ModelClass.GOAL_DATA.frequencyList);
        } catch (err) {
            console.log("err", err);
        }
        ModelClass.GOAL_DATA.goalName = this.state.goalSelectedData.name;
        ModelClass.GOAL_DATA.typeValue = this.state.goalSelectedData.goalType;
        ModelClass.GOAL_DATA.typeCode =
            this.state.goalSelectedData.goalType === "T"
                ? 0
                : this.state.goalSelectedData.goalType === "S"
                ? 1
                : this.state.goalSelectedData.goalType === "R"
                ? 2
                : this.state.goalSelectedData.goalType === "C"
                ? 3
                : this.state.goalSelectedData.goalType === "O"
                ? 4
                : -1;
        ModelClass.GOAL_DATA.goalStart =
            this.state.goalSelectedDetails.userDetails.esiInfo.formattedNextDeductionDate;
        if (this.state.goalSelectedDetails.userDetails.frequency === "M") {
            ModelClass.GOAL_DATA.goalEnd =
                this.state.goalSelectedDetails.userDetails.esiInfo.monthly.formattedLastDeductionDate;
        } else {
            ModelClass.GOAL_DATA.goalEnd =
                this.state.goalSelectedDetails.userDetails.esiInfo.weekly.formattedLastDeductionDate;
        }
        ModelClass.GOAL_DATA.participantId =
            this.state.goalSelectedDetails.userDetails.participantId;
        ModelClass.GOAL_DATA.goalAmount = Number(
            Math.round(this.state.goalSelectedData.totalAmount + "e2") + "e-2"
        );
        ModelClass.GOAL_DATA.youAmount = Number(
            Math.round(this.state.goalSelectedData.contributedAmount + "e2") + "e-2"
        );

        ModelClass.GOAL_DATA.frequencyNextDeduction =
            this.state.goalSelectedDetails.userDetails.esiInfo.nextDeduction;
    };

    _onListItemClick = (item) => {
        console.log("_onListItemClick :", item);

        // NavigationService.navigate(navigationConstant.REQUESTS_DETAILS_SCREEN);
    };

    _onApproveClick = () => {
        const { goalId, selectedGoal } = this.state;

        let pendingSelectedData = goalId
            ? selectedGoal
            : ModelClass.TABUNG_GOALS_DATA.pendingSelectedData;
        ModelClass.GOAL_DATA.goalFlow = 2;
        console.log("pendingSelectedData.totalAmount :", pendingSelectedData.totalAmount);
        ModelClass.GOAL_DATA.goalName = this.state.goalName;
        ModelClass.GOAL_DATA.goalAmount = pendingSelectedData.formattedTotalAmount;
        ModelClass.GOAL_DATA.goalStart = pendingSelectedData.formattedStartDate;
        ModelClass.GOAL_DATA.goalEnd = pendingSelectedData.formattedEndDate;
        ModelClass.GOAL_DATA.youAmount = pendingSelectedData.totalAmount;

        if (pendingSelectedData.goalType === "T") {
            ModelClass.GOAL_DATA.typeCode = 0;
        } else if (pendingSelectedData.goalType === "S") {
            ModelClass.GOAL_DATA.typeCode = 1;
        } else if (pendingSelectedData.goalType === "R") {
            ModelClass.GOAL_DATA.typeCode = 2;
        } else if (pendingSelectedData.goalType === "C") {
            ModelClass.GOAL_DATA.typeCode = 3;
        } else if (pendingSelectedData.goalType === "O") {
            ModelClass.GOAL_DATA.typeCode = 4;
        } else {
            ModelClass.GOAL_DATA.typeCode = 0;
        }

        this.startClick();
    };

    startClick = async () => {
        let walletId = null;
        let m2uUserName = null;
        try {
            walletId = await AsyncStorage.getItem("walletId");
        } catch (error) {
            walletId = null;
        }

        try {
            m2uUserName = await AsyncStorage.getItem("m2uUserName");
        } catch (error) {
            m2uUserName = null;
        }

        if (walletId === null) {
            this.setState({ nowallet: true });
        } else if (m2uUserName == null || m2uUserName == "null") {
            this.setState({ nom2u: true });
        } else {
            console.log("ModelClass.TRANSFER_DATA.m2uToken", ModelClass.TRANSFER_DATA.m2uToken);
            NavigationService.navigateToModule(
                navigationConstant.GOALS_MODULE,
                navigationConstant.CREATE_GOALS_M2ULOGIN,
                {
                    routeFrom: navigationConstant.INVITED_DETAILS_SCREEN,
                    routeTo: navigationConstant.CREATE_GOALS_SUMMARY,
                }
            );
        }
    };

    onLoginSuccess = (data) => {
        console.log("onLoginSuccess M2U_LOGIN_SCREEN");

        NavigationService.navigate(navigationConstant.CREATE_GOALS_SUMMARY);
    };

    _onRejectClick = () => {
        this.setState({ showRejectConfirm: true });
    };

    _rejectGoalAPI = async () => {
        console.log("_getGoalDetailsData==> ");
        const { goalId } = this.state;

        ModelClass.TABUNG_GOALS_DATA.goalDetailsCalled = true;

        this.setState({ loader: true });

        let subUrl = `/goal/participants/reject?goalId=${
            goalId ? goalId : ModelClass.TABUNG_GOALS_DATA.goalSelectedID
        }`;
        let params = {};

        try {
            params = JSON.stringify({});
            NetInfo.isConnected.fetch().then(async (isConnected) => {
                if (isConnected) {
                    rejectGoalAPI(subUrl, JSON.parse(params))
                        .then((response) => {
                            let responseObject = response.data;
                            console.log(subUrl + " RESPONSE RECEIVED: ", response.data);
                            ModelClass.TABUNG_GOALS_DATA.acctDetailsObj = responseObject.result;
                            if (
                                responseObject !== null &&
                                responseObject !== undefined &&
                                responseObject.message !== null &&
                                responseObject.message !== undefined &&
                                responseObject.message === "success"
                            ) {
                                ModelClass.TABUNG_GOALS_DATA.callDetails = false;
                                ModelClass.TABUNG_GOALS_DATA.pendingDataCalled = false;
                                ModelClass.TABUNG_GOALS_DATA.goalDataList = [];
                                this.props.navigation.pop();
                                this.props.navigation.pop();
                            } else if (
                                responseObject !== null &&
                                responseObject !== undefined &&
                                responseObject.message !== null &&
                                responseObject.message !== undefined &&
                                responseObject.message === "failed"
                            ) {
                                this.setState({ loader: false });
                            } else {
                                this.setState({ loader: false });
                            }

                            logEvent(Strings.FA_FORM_COMPLETE, {
                                [Strings.FA_SCREEN_NAME]:
                                    Strings.FA_TABUNG_INVITATION_REJECTINVITE_SUCCESSFUL,
                            });
                        })
                        .catch((error) => {
                            console.log(subUrl + "  ERROR==> ", error);
                            this.setState({ loader: false });
                        });
                } else {
                    this.setState({ loader: false });
                }
            });
        } catch (e) {
            this.setState({ loader: false });
            console.log(subUrl + "  catch ERROR==> " + e);
        }
    };

    handleBack = () => {
        NavigationService.navigate(navigationConstant.PENDING_INVITATIONS_SCREEN);
    };

    render() {
        return (
            <View style={Styles.containerLightGrayView}>
                <HeaderPageIndicator
                    showBack={true}
                    showClose={false}
                    showIndicator={false}
                    showTitle={false}
                    showTitleCenter={false}
                    showBackIndicator={true}
                    showLeftFill={false}
                    noPop={true}
                    pageTitle={Strings.PENDING_INVITATION}
                    onBackPress={this.handleBack}
                    navigation={this.props.navigation}
                    moduleName={navigationConstant.TABUNG_STACK}
                    routeName={navigationConstant.TABUNG_TAB_SCREEN}
                    testID={"header"}
                    accessibilityLabel={"header"}
                />
                <ScrollView
                    ref={(view) => (this._scrollView = view)}
                    keyboardShouldPersistTaps={"always"}
                    keyboardDismissMode={"on-drag"}
                    style={Styles.containerScrollDetailsView1}
                >
                    <View style={Styles.containerInnerView11}>
                        <View style={Styles.detailsTitleView}>
                            <HighlightText
                                highlightStyle={{
                                    fontSize: 20,
                                    fontWeight: "300",
                                    fontStyle: "normal",
                                    lineHeight: 28,
                                    letterSpacing: 0,
                                    textAlign: "center",
                                    color: "#000000",
                                    fontFamily: "montserrat",
                                }}
                                searchWords={[this.state.requesterName]}
                                style={[Styles.detailsTitleText, commonStyles.font]}
                                textToHighlight={this.state.requesterTitle}
                                testID={"inputAccountNo"}
                                accessibilityLabel={"inputAccountNo"}
                            />
                        </View>

                        <View style={Styles.detailsRowFirstView}>
                            <View style={Styles.detailsRowLeftView}>
                                <Text
                                    style={[Styles.leftText, commonStyles.font]}
                                    accessible={true}
                                    testID={"txtCARD_NO"}
                                    accessibilityLabel={"txtCARD_NO"}
                                >
                                    {Strings.GOAL_NAME}
                                </Text>
                            </View>
                            <View style={Styles.detailsRowRightView}>
                                <Text
                                    style={[Styles.rightText, commonStyles.font]}
                                    accessible={true}
                                    testID={"txtCARD_NO"}
                                    accessibilityLabel={"txtCARD_NO"}
                                >
                                    {this.state.goalName}
                                </Text>
                            </View>
                        </View>
                        <View style={Styles.detailsRowView}>
                            <View style={Styles.detailsRowLeftView}>
                                <Text
                                    style={[Styles.leftText, commonStyles.font]}
                                    accessible={true}
                                    testID={"txtCARD_NO"}
                                    accessibilityLabel={"txtCARD_NO"}
                                >
                                    {Strings.GOAL_AMOUNT}
                                </Text>
                            </View>
                            <View style={Styles.detailsRowRightView}>
                                <Text
                                    style={[Styles.rightText, commonStyles.font]}
                                    accessible={true}
                                    testID={"txtCARD_NO"}
                                    accessibilityLabel={"txtCARD_NO"}
                                >
                                    {this.state.goalAmount}
                                </Text>
                            </View>
                        </View>

                        <View style={Styles.detailsRowView}>
                            <View style={Styles.detailsRowLeftView}>
                                <Text
                                    style={[Styles.leftText, commonStyles.font]}
                                    accessible={true}
                                    testID={"txtCARD_NO"}
                                    accessibilityLabel={"txtCARD_NO"}
                                >
                                    {Strings.START_DATE}
                                </Text>
                            </View>
                            <View style={Styles.detailsRowRightView}>
                                <Text
                                    style={[Styles.rightText, commonStyles.font]}
                                    accessible={true}
                                    testID={"txtCARD_NO"}
                                    accessibilityLabel={"txtCARD_NO"}
                                >
                                    {this.state.goalStartDate}
                                </Text>
                            </View>
                        </View>

                        {this.state.goalSelectedData.goalType != "C" ? (
                            <View style={Styles.detailsRowView}>
                                <View style={Styles.detailsRowLeftView}>
                                    <Text
                                        style={[Styles.leftText, commonStyles.font]}
                                        accessible={true}
                                        testID={"txtCARD_NO"}
                                        accessibilityLabel={"txtCARD_NO"}
                                    >
                                        {Strings.END_DATE}
                                    </Text>
                                </View>
                                <View style={Styles.detailsRowRightView}>
                                    <Text
                                        style={[Styles.rightText, commonStyles.font]}
                                        accessible={true}
                                        testID={"txtCARD_NO"}
                                        accessibilityLabel={"txtCARD_NO"}
                                    >
                                        {this.state.goalEndDate}
                                    </Text>
                                </View>
                            </View>
                        ) : (
                            <View />
                        )}

                        <View style={Styles.whoSavingView}>
                            <Text
                                style={[Styles.whoSavingText, commonStyles.font]}
                                accessible={true}
                                testID={"txtCARD_NO"}
                                accessibilityLabel={"txtCARD_NO"}
                            >
                                {Strings.WHO_SAVING}
                            </Text>
                        </View>

                        <View style={Styles.participantView}>
                            <TabungParticipantInvitedList
                                data={this.state.goalParticipant}
                                extraData={this.state.goalParticipant}
                                callback={(item) => this.onListItemClick(item)}
                                length={this.state.goalParticipant.length}
                            />
                        </View>
                    </View>
                </ScrollView>

                <View style={commonStyles.footerViewButtonGray}>
                    <View style={commonStyles.footerFiftyView}>
                        <DropDownButtonNoIcon
                            headerText={Strings.REJECT}
                            iconType={1}
                            showIconType={false}
                            testID={"txtSELECT_BOOSTER"}
                            isBigButton={true}
                            showBorder={true}
                            accessibilityLabel={"txtSELECT_BOOSTER"}
                            onPress={async () => {
                                this.onRejectClick();
                            }}
                        />
                    </View>
                    <View style={commonStyles.footerFiftyViewSec}>
                        <DropDownButtonNoIcon
                            headerText={Strings.JOIN}
                            iconType={1}
                            showIconType={false}
                            showBorder={true}
                            testID={"txtSELECT_BOOSTER"}
                            backgroundColor={"#ffde00"}
                            isBigButton={true}
                            accessibilityLabel={"txtSELECT_BOOSTER"}
                            onPress={async () => {
                                this.onApproveClick();
                            }}
                        />
                    </View>
                </View>

                {this.state.showRejectConfirm === true ? (
                    <ErrorMessage
                        onClose={() => {
                            this.setState({ showRejectConfirm: false });
                        }}
                        title="Reject Invitation"
                        description={
                            "Are you sure you don't want to join " +
                            this.state.goalName +
                            " Tabung?"
                        }
                        showOk={true}
                        okText={"Yes, I'm sure"}
                        onOkPress={() => {
                            // eslint-disable-next-line react/prop-types
                            //this.props.navigation.pop();
                            this.setState({ showRejectConfirm: false });
                            this._rejectGoalAPI();
                        }}
                    />
                ) : null}

                {this.state.nowallet === true ? (
                    <ErrorMessage
                        onClose={() => {
                            this.setState({ nowallet: false });
                        }}
                        title="Setup Wallet"
                        description="Set up your Wallet first in order to proceed to the next step."
                        showOk={true}
                        okText={"Proceed"}
                        showButton={true}
                        onOkPress={() => {
                            this.setState({ nowallet: false });
                            ModelClass.GOAL_DATA.startFrom = true;
                            ModelClass.GOAL_DATA.fromRoute =
                                navigationConstant.INVITED_DETAILS_SCREEN;
                            ModelClass.GOAL_DATA.toRoute = navigationConstant.CREATE_GOALS_SUMMARY;
                            NavigationService.navigateToModule(
                                navigationConstant.WALLET_MODULE,
                                navigationConstant.WALLET_START,
                                {
                                    userName: "Lucy",
                                }
                            );
                        }}
                    />
                ) : null}
                {this.state.nom2u === true ? (
                    <ErrorMessage
                        onClose={() => {
                            this.setState({ nom2u: false });
                        }}
                        title="Link to Maybank2U"
                        description="Looks like your Maybank2u account isn’t linked yet. Check your options below to proceed with your transactions."
                        showOk={true}
                        showMore={true}
                        showButton={true}
                        okText={"Login"}
                        onOkPress={() => {
                            ModelClass.COMMON_DATA.noWalletAccountAddedError = true;
                            ModelClass.GOAL_DATA.startFrom = true;
                            ModelClass.GOAL_DATA.fromRoute =
                                navigationConstant.INVITED_DETAILS_SCREEN;
                            ModelClass.GOAL_DATA.toRoute = navigationConstant.CREATE_GOALS_SUMMARY;
                            this.setState({ nom2u: false });
                            NavigationService.navigate(navigationConstant.LINK_M2U, {
                                userName: "Lucy",
                            });
                        }}
                        onMorePress={() => {
                            ModelClass.COMMON_DATA.noWalletAccountAddedError = true;
                            ModelClass.GOAL_DATA.fromRoute =
                                navigationConstant.INVITED_DETAILS_SCREEN;
                            ModelClass.GOAL_DATA.toRoute = navigationConstant.CREATE_GOALS_SUMMARY;
                            this.setState({ nom2u: false });
                            NavigationService.navigate(navigationConstant.LINK_M2U, {
                                userName: "Lucy",
                            });
                        }}
                    />
                ) : null}
            </View>
        );
    }
}
export default InvitedDetailsScreen;
