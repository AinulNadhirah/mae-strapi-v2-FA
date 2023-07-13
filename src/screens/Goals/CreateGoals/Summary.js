import moment from "moment";
import numeral from "numeral";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { TouchableOpacity, Text, View, ScrollView, Image, StyleSheet } from "react-native";

import { navigateToS2UCooling } from "@screens/OneTapAuth/CoolingNavigator";

import * as navigationConstant from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import BorderedAvatar from "@components/Avatars/BorderedAvatar";
import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import { ScrollPickerView } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import { showErrorToast, showInfoToast } from "@components/Toast";

import { withModelContext } from "@context";

import { invokeL3 } from "@services";
import { goalValidateParticipants, bankingGetDataMayaM2u, accountInquiry } from "@services/index";

import {
    YELLOW,
    MEDIUM_GREY,
    WHITE,
    GREY,
    DARK_GREY,
    BLACK,
    DISABLED,
    DISABLED_TEXT,
} from "@constants/colors";
import {
    SECURE2U_IS_DOWN,
    TERMS_CONDITIONS,
    FA_CREATE_TABUNG_CREATE_LINKACCOUNT,
    DD_MMM_YYYY,
} from "@constants/strings";

import * as Utility from "@utils/dataModel/utility";
import { checks2UFlow } from "@utils/dataModel/utility";
import { ErrorLogger } from "@utils/logs";

// import { OverlappingPictures } from "@components/Common/overlappingPictures";
import commonStyle from "@styles/main";

import assets from "@assets";

const S2U_REGISTRATION_FLOW = "S2UREG";
const S2U_FLOW = "S2U";

class Summary extends Component {
    static propTypes = {
        getModel: PropTypes.func,
        navigation: PropTypes.object.isRequired,
        resetModel: PropTypes.func,
        route: PropTypes.shape({
            params: PropTypes.string,
        }),
        updateModel: PropTypes.func,
    };

    state = {
        accountList: null,
        currentScreen: 1,
        error: false,
        errorTitle: "",
        errorMessage: "",
        picArrayDisplay: [],
        friendList: [],
        account: "Select account",
        accountNo: "",
        dropDownView: false,
        showCloseModal: false,
        friendListOld: [],
        selectedIndex: 0,
        // rand: 1000,
        refreshing: false,
        showGroupTabungModal: false,
        haveShownGroupTabungMessage: false,
        loading: true,
        recalc: true,
    };

    componentDidMount() {
        this.focusSubscription = this.props.navigation.addListener("focus", () => {
            console.log(" focusSubscription ");

            console.log(
                "[ParticipantsSummary] >> [onScreenFocus] with params",
                this.props.route.params
            );

            const params = this.props.route?.params ?? "";
            if (params) {
                const { recalc } = params;
                this.setState({ recalc }, () => {
                    this._initParticipantsData();
                    this._fetchUserAccountsList();
                });
            } else {
                this._initParticipantsData();
                this._fetchUserAccountsList();
            }

            // this.addSelectedUsers(ModelClass.SELECTED_CONTACT);
        });
    }

    componentWillUnmount() {
        this.focusSubscription();
        this._toggleDropDownView();
    }

    _initParticipantsData() {
        const { getModel } = this.props;
        const { profileImage, mobileNumber, mayaUserId } = getModel("user");

        const { goalData } = getModel("goals");
        const fullContactsList = goalData.fullContactsList;

        let contactList = [];
        if (fullContactsList && fullContactsList.length != 0) {
            contactList = goalData.fullContactsList.slice();
        }

        if (contactList.length <= 3) {
            const objInvite = {
                initials: "+",
                profilePicUrl: null,
            };

            contactList.push(objInvite);
        } else {
            const objCount = {
                initials: contactList.length == 5 ? "+2" : "+1",
                profilePicUrl: null,
            };

            const compactContactList = contactList.splice(0, 3);
            compactContactList.push(objCount);

            // replace contactList array with compactContactList array
            contactList = compactContactList.slice();
        }

        const { refreshing, recalc } = this.state;
        this.setState({ goalData, contactList, refreshing: !refreshing }, () => {
            console.log("[Summary][_initData] this.state.contactList:", this.state.contactList);

            if (recalc) {
                this._calculateContributions();
            }
        });
    }

    _enableEditSummaryMode = (val) => {
        const { goalData } = this.state;
        goalData.editSummary = val;

        this._updateGoalDataContext(goalData);
    };

    _toggleShowGroupTabungModal = () => {
        const { haveShownGroupTabungMessage } = this.state;
        if (!haveShownGroupTabungMessage) {
            this.setState({ showGroupTabungModal: !this.state.showGroupTabungModal });
        } else {
            this._onPressWhosSaving();
        }
    };

    _dismissErrorPopup = () => {
        this.setState({ error: false, errorMessage: "", errorTitle: "" });
    };

    validateParticipants = async (SELECTED_CONTACT) => {
        const participantsList = [];
        for (let i = 0; i < SELECTED_CONTACT.length; i++) {
            const object = {};
            const phoneNumbers = SELECTED_CONTACT[i].phoneNumbers;
            const givenName = SELECTED_CONTACT[i].givenName;
            object.hpNo = phoneNumbers[0].number;
            object.name =
                givenName.indexOf("+") === -1 && givenName.indexOf("-") === -1 ? givenName : "#";
            participantsList.push(object);
        }

        await goalValidateParticipants(
            "/goal/validateParticipants",
            JSON.stringify(participantsList)
        )
            .then(async (response) => {
                console.log("RES", response);
                const regObject = await response.data;
                console.log("Object", regObject);
                for (let i = 0; i < SELECTED_CONTACT.length; i++) {
                    SELECTED_CONTACT[i].valid = false;
                }
            })
            .catch((err) => {
                console.log("ERR", err);
            });

        return SELECTED_CONTACT;
    };

    _calculateContributions = () => {
        const { goalData } = this.state;
        const { fullContactsList } = goalData;

        if (fullContactsList) {
            const money = goalData.goalAmount;

            if (fullContactsList.length > 1) {
                // Calculate amount for each person
                const piles = fullContactsList.length;

                const participantContribution = Math.floor((money / piles) * 100) / 100;
                let selfContribution = money - participantContribution * (piles - 1);
                selfContribution = parseFloat(selfContribution.toFixed(2));

                // Create new contact list with amount (newList)
                let newList = fullContactsList.slice();

                // Iterate through array to attach amount property to each contact
                newList = newList.map((data, index) => ({
                    ...data,
                    amount: index == 0 ? selfContribution : participantContribution,
                }));

                this.setState(
                    {
                        goalData: { ...goalData, fullContactsList: newList },
                        refreshing: !this.state.refreshing,
                    },
                    () => console.log("[_calculateContributions] state", this.state)
                );
            } else if (fullContactsList.length === 1) {
                // Create new contact list with amount (newList)
                const newList = fullContactsList.slice();
                newList[0].amount = money;

                this.setState(
                    {
                        goalData: { ...goalData, fullContactsList: newList },
                        refreshing: !this.state.refreshing,
                    },
                    () => console.log("[_calculateContributions] state", this.state)
                );
            }
        }
    };

    _handleS2UStatusCallFailure = () => {
        showInfoToast({ message: SECURE2U_IS_DOWN });
        return { secure2uValidateData: { s2u_enabled: false }, flow: "TAC" };
    };

    _getS2UStatus = async () => {
        try {
            const { getModel, updateModel } = this.props;
            const response = await checks2UFlow(33, getModel, updateModel);
            if (response?.flow && response?.secure2uValidateData) return response;
            return this._handleS2UStatusCallFailure();
        } catch (error) {
            return this._handleS2UStatusCallFailure();
        }
    };

    _handleS2UStatus = (S2UStatus) => {
        if (!S2UStatus?.secure2uValidateData?.s2u_enabled) {
            showInfoToast({ message: SECURE2U_IS_DOWN });
        }
    };

    _validateS2UStatus = async () => {
        if (this.state.contactList.length > 2) {
            return {
                isS2URegistrationFlow: false,
                S2UStatus: {
                    secure2uValidateData: { s2u_enabled: false },
                    flow: "TAC",
                    isGroupGoal: true,
                },
            };
        }
        const S2UStatus = await this._getS2UStatus();
        this._handleS2UStatus(S2UStatus);
        const { flow, secure2uValidateData } = S2UStatus;
        if (flow === navigationConstant.SECURE2U_COOLING) {
            const {
                navigation: { navigate },
            } = this.props;
            navigateToS2UCooling(navigate);
            return { isS2URegistrationFlow: true, S2UStatus };
        } else if (flow?.toUpperCase() === S2U_REGISTRATION_FLOW) {
            this.props.navigation.navigate(navigationConstant.ONE_TAP_AUTH_MODULE, {
                screen: "Activate",
                params: {
                    flowParams: {
                        success: {
                            stack: navigationConstant.GOALS_MODULE,
                            screen: navigationConstant.CREATE_GOALS_CONFIRMATION,
                        },
                        fail: {
                            stack: navigationConstant.TABUNG_STACK,
                            screen: navigationConstant.TABUNG_TAB_SCREEN,
                        },
                        params: { S2UStatus: { flow: "S2U", secure2uValidateData } },
                    },
                },
            });
            return { isS2URegistrationFlow: true, S2UStatus };
        }
        return { isS2URegistrationFlow: false, S2UStatus };
    };

    _onPressContinue = async () => {
        console.log("[_onPressContinue] currentState:", this.state);

        const { goalData } = this.state;
        const { accountNo } = this.state;

        if (accountNo && accountNo !== "") {
            // Account has been selected,
            // Date check
            const sd = moment(goalData.goalStart, DD_MMM_YYYY);
            let ed = "";
            if (goalData.typeCode != 3) {
                ed = moment(goalData.goalEnd, DD_MMM_YYYY);
            } else {
                ed = moment(goalData.goalStart, DD_MMM_YYYY).add(10, "years");
            }
            console.log("sd", sd);
            console.log("ed", ed);
            const days = ed.diff(sd, "days");

            if (days >= 0) {
                // Goal has valid date range
                if (
                    (goalData.goalAmount >= 10.0 && goalData.goalAmount <= 999999.99) ||
                    goalData.goalFlow === 2
                ) {
                    // Goal has valid target amount

                    // Check if any participants available

                    if (!goalData.fullContactsList) {
                        // "You" object not yet added, should add
                        const { getModel } = this.props;
                        const { mayaUserId, profileImage, mobileNumber, fullName } =
                            getModel("user");

                        let initials = fullName.match(/\b\w/g) || [];
                        initials = (
                            (initials.shift() || "") + (initials.pop() || "")
                        ).toUpperCase();
                        if (initials.length == 1) {
                            initials = fullName.substring(0, 2).toUpperCase();
                        }

                        const self = [
                            {
                                name: "You",
                                profilePicUrl: profileImage,
                                mayaUserId,
                                phoneNumber: mobileNumber,
                                amount: goalData.goalAmount,
                                initials,
                            },
                        ];

                        goalData.youAmount = goalData.goalAmount;
                        goalData.fullContactsList = self;
                        this._updateGoalDataContext(goalData);

                        const { isS2URegistrationFlow, S2UStatus } =
                            await this._validateS2UStatus();
                        if (isS2URegistrationFlow) return;

                        this.props.navigation.navigate(
                            navigationConstant.CREATE_GOALS_CONFIRMATION,
                            { S2UStatus }
                        );
                    } else if (goalData.fullContactsList && goalData.fullContactsList.length > 0) {
                        // You object already added
                        if (goalData.fullContactsList.length == 1) {
                            goalData.youAmount = goalData.goalAmount;
                            this._updateGoalDataContext(goalData);
                        } else {
                            goalData.youAmount = goalData.fullContactsList[0].amount;
                            this._updateGoalDataContext(goalData);
                        }
                        const { isS2URegistrationFlow, S2UStatus } =
                            await this._validateS2UStatus();
                        if (isS2URegistrationFlow) return;

                        this.props.navigation.navigate(
                            navigationConstant.CREATE_GOALS_CONFIRMATION,
                            { S2UStatus }
                        );
                    } else {
                        // Error?
                        this.setState({
                            error: true,
                            errorMessage: "Conditions were not met.",
                            errorTitle: "Something went wrong",
                        });
                    }
                } else {
                    // Goal has invalid target amount
                    if (goalData.goalAmount < 10.0) {
                        this.setState({
                            error: true,
                            errorMessage: "Please enter a minimum goal value of RM 10.00.",
                            errorTitle: "Goal Amount",
                        });
                    } else {
                        this.setState({
                            error: true,
                            errorMessage: "Maximum goal value is RM 999,999.99",
                            errorTitle: "Goal Amount",
                        });
                    }
                }
            } else {
                // Goal has invalid date range
                this.setState({
                    error: true,
                    errorMessage: "Make sure end date is after start date",
                    errorTitle: "Select Dates",
                });
            }
        } else {
            // No account was selected
            this.setState({
                error: true,
                errorMessage: "Please select an account to link this goal to.",
                errorTitle: "Link account",
            });
        }
    };

    inquire = async (val, index) => {
        // TODO: use snackbar to throw errors and figure out duplicating logic

        await accountInquiry("/goal/account/inquiry?linkAcctNo=" + val.number)
            .then(async (response) => {
                console.log("[Summary][inquire] RES", response);
                const regObject = await response.data;
                console.log("[Summary][inquire] Object", regObject);

                if (regObject.code === 0) {
                    const { accountList, goalData } = this.state;

                    // reset every account's "select" property to false
                    accountList.forEach((account, i) => (accountList[i].select = false));
                    // make selected account "select" property to true
                    accountList[index].select = true;

                    this.setState({
                        dropDownView: false,
                        account: val.title,
                        accountNo: val.number,
                        accountType: val.type,
                        accountGroup: val.group,
                        accountList, //updated accountList
                    });

                    // update goalData in context & state
                    goalData.accountName = val.title;
                    goalData.accountType = val.type;
                    goalData.accountNo = val.number;
                    goalData.accountCode = val.code;
                    goalData.accountList = accountList;

                    this._updateGoalDataContext(goalData);
                } else if (regObject.code === 600) {
                    this.setState({
                        dropDownView: false,
                        account: "Select account",
                        accountNo: "",
                        error: true,
                        errorTitle: "Select Account",
                        errorMessage: regObject.message,
                    });
                } else if (regObject.code === 700) {
                    // I'm not sure what this means?
                    this.setState({ dropDownView: false, account: "Select account" });

                    // Reset certain goalData properties
                    const { goalData } = this.state;

                    goalData.created = "";
                    goalData.ref = "";
                    goalData.success = false;
                    goalData.message = regObject.message;
                    this._updateGoalDataContext(goalData);
                    this.props.navigation.navigate(navigationConstant.CREATE_GOALS_ACKNOWLEDGMENT, {
                        isGoalCountError: true,
                    });
                } else {
                    this.setState({
                        dropDownView: false,
                        account: "Select account",
                        accountNo: "",
                        error: true,
                        errorTitle: "Select Account",
                        errorMessage: regObject.message,
                    });
                }
            })
            .catch((err) => {
                console.log("[Summary][inquire] Error", err);
                if (err.status === 400) {
                    if (err.error.code === 600) {
                        this.setState({
                            dropDownView: false,
                            account: "Select account",
                            accountNo: "",
                            error: true,
                            errorTitle: "Select Account",
                            errorMessage: err.message ?? err.error.message,
                        });
                    } else if (err.error.code === 700) {
                        this.setState({ dropDownView: false, account: "Select account" });

                        // Reset certain goalData properties
                        const { goalData } = this.state;

                        goalData.created = "";
                        goalData.ref = "";
                        goalData.success = false;
                        goalData.message = err.message ?? err.error.message;

                        this._updateGoalDataContext(goalData);

                        this.props.navigation.navigate(
                            navigationConstant.CREATE_GOALS_ACKNOWLEDGMENT,
                            {
                                isGoalCountError: true,
                            }
                        );
                    }
                } else {
                    this.setState({
                        dropDownView: false,
                        account: "Select account",
                        accountNo: "",
                    });

                    showErrorToast({
                        message:
                            "Your request couldn't be completed at this time. Please try again later.",
                    });
                }
            });

        console.log("[Summary][inquire] function end");
    };

    _requestL3Permission = async () => {
        try {
            const response = await invokeL3(false);
            if (response && response.status === 200) return response;
            return null;
        } catch (error) {
            ErrorLogger(error);
            return null;
        }
    };

    _fetchUserAccountsList = async () => {
        const request = await this._requestL3Permission();
        if (!request) {
            this.props.navigation.goBack();
            return;
        }

        const subUrl = "/summary";
        const params = "?type=A";

        bankingGetDataMayaM2u(subUrl + params, true)
            .then((response) => {
                const result = response.data.result;
                console.log(
                    "[Summary][_fetchUserAccountsList] /summary with param: " + params + " ==> "
                );
                if (result != null) {
                    console.log(result);
                    const newAccountList = [];

                    result.accountListings.map((account) => {
                        account.title = account.name;
                        account.name =
                            account.name + "\n" + Utility.formateAccountNumber(account.number, 12);

                        newAccountList.push(account);
                    });

                    console.log("[Summary][_fetchUserAccountList] newAccountList:", newAccountList);
                    this.setState({ accountList: newAccountList, loading: false });
                } else {
                    console.log("[Summary][_fetchUserAccountList] No results!");
                    this.props.navigation.goBack();
                }
            })
            .catch((Error) => {
                console.log("[Summary][_fetchUserAccountList] ERROR: ", Error);
                this.props.navigation.goBack();
            });
    };

    _updateGoalDataContext = async (goalData) => {
        const { updateModel } = this.props;

        this.setState({ goalData }, async () => {
            await updateModel({
                goals: {
                    goalData,
                },
            });

            console.log("[Summary][_updateGoalDataContext] goal state: ", this.state.goalData);
        });
    };

    _toggleDropDownView = () => {
        this.setState({ dropDownView: !this.state.dropDownView });
    };

    _toggleCloseModal = () => {
        this.setState({ showCloseModal: !this.state.showCloseModal });
    };

    _onBackPress = () => {
        this.props.navigation.goBack();
    };

    _onClosePress = () => {
        this.setState({ showCloseModal: true });
    };

    _onPressDoneScrollPickerView = (val, index) => {
        console.log("[Summary][_onPressDoneScrollPickerView] val");
        console.log("[Summary][_onPressDoneScrollPickerView] index");

        this.inquire(val, index);

        this.setState({ dropDownView: false, selectedIndex: index });
    };

    _onPressCloseScrollPickerView = () => {
        console.log("_onPressCloseScrollPickerView");

        this.setState({
            dropDownView: false,
        });
    };

    _onPressTncLink = () => {
        const params = {
            file: "https://www.maybank2u.com.my/iwov-resources/pdf/upload/maeapp/MAEApp_Terms&Conditions_202009.pdf",
            share: false,
            type: "url",
            title: "Terms & Conditions",
            pdfType: "shareReceipt",
        };

        this.props.navigation.navigate(navigationConstant.COMMON_MODULE, {
            screen: navigationConstant.PDF_VIEW,
            params: { params },
        });
    };

    _onPressWhosSaving = () => {
        // Dismiss modal
        // this._toggleShowGroupTabungModal();
        this.setState({
            showGroupTabungModal: false,
            haveShownGroupTabungMessage: true,
        });

        // Continue..
        const { goalData } = this.state;

        console.log("[Summary][_onPressWhosSaving] goalData", goalData);

        if (goalData.goalFlow === 1 && goalData.typeCode != 3) {
            goalData.addFriends = true;
            goalData.noChange = false;
            goalData.addContacts = false;

            this._updateGoalDataContext(goalData);

            // this.props.navigation.navigate(navigationConstant.CREATE_GOALS_FRIEND_LIST);
            this.props.navigation.navigate("CreateGoalsAddFriendsScreen");
        }
    };

    _onPressTargetAmount = () => {
        const { goalData } = this.state;

        if (goalData.goalFlow != 2) {
            this.props.navigation.navigate(navigationConstant.CREATE_GOALS_ENTER_GOAL_AMOUNT, {
                editMode: true,
            });
        }
    };

    _onPressGoalName = () => {
        const { goalData } = this.state;

        if (goalData.goalFlow != 2) {
            this.props.navigation.navigate(navigationConstant.CREATE_GOALS_ENTER_GOAL_NAME, {
                editMode: true,
            });
        }
    };

    _onPressGoalStartDate = () => {
        const { goalData } = this.state;

        if (goalData.goalFlow != 2) {
            this.props.navigation.navigate(navigationConstant.CREATE_GOALS_GOAL_START_DATE, {
                editMode: true,
            });
        }
    };

    _onPressGoalEndDate = () => {
        const { goalData } = this.state;

        if (goalData.goalFlow != 2) {
            this.props.navigation.navigate(navigationConstant.CREATE_GOALS_GOAL_END_DATE, {
                editMode: true,
            });
        }
    };

    _cancelTabung = () => {
        this.setState({ showCloseModal: false });
        const { goalData } = this.state;

        if (goalData.goalFlow === 2) {
            this.props.navigation.navigate(navigationConstant.TABUNG_STACK, {
                screen: navigationConstant.TABUNG_TAB_SCREEN,
            });
        } else {
            this.props.navigation.navigate("Dashboard", {
                screen: "TabungTab",
            });
        }

        // Reset context
        console.log("Resetting Context!");
        this._resetGoalDataContext();
    };

    _resetGoalDataContext = () => {
        const { resetModel } = this.props;
        resetModel(["goals"]);
    };

    _renderTnC() {
        return (
            <View style={styles.tncContainer}>
                <TouchableOpacity onPress={this._onPressTncLink}>
                    <Text style={[styles.tncText, commonStyle.font]}>
                        {"By clicking 'Continue', I confirm that I agree to the Tabung "}
                        <Text
                            style={[
                                styles.tncText,
                                { textDecorationLine: "underline" },
                                commonStyle.font,
                            ]}
                            accessible={true}
                        >
                            {TERMS_CONDITIONS}
                        </Text>
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

    _renderMaeTips() {
        return (
            <View style={styles.maeTipsContainer}>
                <Text style={[styles.maeTipsText, { fontWeight: "600" }]}>
                    {"Tip: "}
                    <Text style={styles.maeTipsText}>
                        Choose either a savings or current account, so you can earn interest when
                        you save with us. Don't have one? Open a Maybank2u.Premier account now.
                    </Text>
                </Text>
            </View>
        );
    }

    _renderLinkAccountSection() {
        const { account, accountNo, accountType, accountGroup } = this.state;

        return (
            <View>
                <Typo
                    fontSize={14}
                    fontWeight="600"
                    lineHeight={18}
                    textAlign="left"
                    text="Link this goal to your account"
                />
                <View style={styles.descriptionContainer}>
                    <Typo
                        fontSize={14}
                        lineHeight={20}
                        textAlign="left"
                        text="Just so we know where to transfer your funds to, for when your goal is closed or completed. "
                    />
                </View>

                {accountType === "D" &&
                    (accountGroup === "0YD" || accountGroup === "CCD") &&
                    this._renderMaeTips()}

                <View style={styles.dateView1}>
                    <ActionButton
                        fullWidth
                        height={48}
                        borderWidth={1}
                        borderStyle="solid"
                        borderRadius={24}
                        backgroundColor={WHITE}
                        borderColor="#cfcfcf"
                        componentLeft={
                            <View style={{ marginLeft: 24 }}>
                                <Typo
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={18}
                                    text={account}
                                    textAlign="left"
                                />
                                {accountNo !== "" && (
                                    <Typo
                                        fontSize={12}
                                        lineHeight={18}
                                        color={DARK_GREY}
                                        text={Utility.formateAccountNumber(accountNo, 12)}
                                        textAlign="left"
                                    />
                                )}
                            </View>
                        }
                        componentRight={
                            <Image source={assets.downArrow} style={styles.dropDownArrowImage} />
                        }
                        onPress={this._toggleDropDownView}
                    />
                </View>

                {this._renderTnC()}
            </View>
        );
    }

    _renderOverlappingPictures(contactList) {
        //picArrayDisplay
        console.log("[_renderOverlappingPictures]", contactList);
        return (
            <TouchableOpacity
                onPress={this._toggleShowGroupTabungModal}
                style={styles.avatarContainer}
                activeOpacity={0.8}
            >
                {this._renderAvatars(contactList)}
            </TouchableOpacity>
        );
    }

    _renderAvatars(avatarsData) {
        console.log("rendering avatar: ", avatarsData);
        return avatarsData.map((item, index) => {
            return (
                <View
                    style={
                        index == 0
                            ? pictureStyles.container
                            : [pictureStyles.container, { right: this._getRightPos(index) }] //if 2nd item onwards, have different right pos to overlap
                    }
                    key={`${item.name}-${index}`}
                >
                    <BorderedAvatar backgroundColor={item.initials.startsWith("+") ? YELLOW : GREY}>
                        {item.profilePicUrl ? (
                            <Image
                                style={pictureStyles.image}
                                source={{ uri: item.profilePicUrl }}
                            />
                        ) : (
                            <Typo
                                style={pictureStyles.text}
                                fontSize={item.initials === "+" ? 24 : 14}
                                lineHeight={item.initials === "+" ? 26 : 14}
                                text={item.initials}
                                textAlign="center"
                                fontWeight="300"
                                color={DARK_GREY}
                            />
                        )}
                    </BorderedAvatar>
                </View>
            );
        });
    }

    _getRightPos = (index) => {
        switch (index) {
            case 1:
                return 29;
            case 2:
                return 58;
            case 3:
                return 87;
            case 4:
                return 116;
            default:
                return 0;
        }
    };

    render() {
        const {
            dropDownView,
            showCloseModal,
            goalData,
            selectedIndex,
            accountList,
            showGroupTabungModal,
            loading,
            accountNo,
            error,
            errorTitle,
            errorMessage,
        } = this.state;

        return (
            <React.Fragment>
                <ScreenContainer
                    backgroundType="color"
                    backgroundColor={MEDIUM_GREY}
                    showLoaderModal={loading}
                    analyticScreenName={FA_CREATE_TABUNG_CREATE_LINKACCOUNT}
                >
                    <ScreenLayout
                        paddingBottom={0}
                        paddingTop={0}
                        paddingHorizontal={0}
                        header={
                            <HeaderLayout
                                headerLeftElement={<HeaderBackButton onPress={this._onBackPress} />}
                                headerRightElement={
                                    <HeaderCloseButton onPress={this._onClosePress} />
                                }
                            />
                        }
                        useSafeArea
                    >
                        <>
                            <ScrollView style={styles.svContainer}>
                                {goalData && (
                                    <View style={styles.parentContainer}>
                                        <View style={styles.container}>
                                            <View style={styles.rowListContainer}>
                                                <View style={styles.rowListItemLeftContainer}>
                                                    <Typo
                                                        fontSize={14}
                                                        lineHeight={19}
                                                        textAlign="left"
                                                        text="Name"
                                                    />
                                                </View>
                                                <TouchableOpacity
                                                    style={styles.rowListItemRightContainer}
                                                    onPress={this._onPressGoalName}
                                                >
                                                    <Typo
                                                        fontSize={14}
                                                        fontWeight="600"
                                                        lineHeight={18}
                                                        textAlign="right"
                                                        color="#4a90e2"
                                                        text={goalData.goalName}
                                                    />
                                                </TouchableOpacity>
                                            </View>

                                            <View style={styles.rowListContainer}>
                                                <View style={styles.rowListItemLeftContainer}>
                                                    <Typo
                                                        fontSize={14}
                                                        lineHeight={19}
                                                        textAlign="left"
                                                        text="Target amount"
                                                    />
                                                </View>
                                                <TouchableOpacity
                                                    style={styles.rowListItemRightContainer}
                                                    onPress={this._onPressTargetAmount}
                                                >
                                                    <Typo
                                                        fontSize={14}
                                                        fontWeight="600"
                                                        lineHeight={18}
                                                        textAlign="right"
                                                        color="#4a90e2"
                                                        text={
                                                            "RM " +
                                                            numeral(goalData.goalAmount).format(
                                                                "0,0.00"
                                                            )
                                                        }
                                                    />
                                                </TouchableOpacity>
                                            </View>

                                            <View style={styles.rowListContainer}>
                                                <View style={styles.rowListItemLeftContainer}>
                                                    <Typo
                                                        fontSize={14}
                                                        lineHeight={19}
                                                        textAlign="left"
                                                        text="Start date"
                                                    />
                                                </View>
                                                <TouchableOpacity
                                                    style={styles.rowListItemRightContainer}
                                                    onPress={this._onPressGoalStartDate}
                                                >
                                                    <Typo
                                                        fontSize={14}
                                                        fontWeight="600"
                                                        lineHeight={18}
                                                        textAlign="right"
                                                        color="#4a90e2"
                                                        text={goalData.goalStart}
                                                    />
                                                </TouchableOpacity>
                                            </View>

                                            {goalData.typeCode != 3 && (
                                                <View style={styles.rowListContainer}>
                                                    <View style={styles.rowListItemLeftContainer}>
                                                        <Typo
                                                            fontSize={14}
                                                            lineHeight={19}
                                                            textAlign="left"
                                                            text="End date"
                                                        />
                                                    </View>
                                                    <TouchableOpacity
                                                        style={styles.rowListItemRightContainer}
                                                        onPress={this._onPressGoalEndDate}
                                                    >
                                                        <Typo
                                                            fontSize={14}
                                                            fontWeight="600"
                                                            lineHeight={18}
                                                            textAlign="right"
                                                            color="#4a90e2"
                                                            text={goalData.goalEnd}
                                                        />
                                                    </TouchableOpacity>
                                                </View>
                                            )}
                                        </View>

                                        {goalData.typeCode != 3 && (
                                            <View style={styles.rowListContainer}>
                                                <View style={styles.rowListItemLeftContainer}>
                                                    <Typo
                                                        fontSize={14}
                                                        lineHeight={19}
                                                        textAlign="left"
                                                        text="Saving with..."
                                                    />
                                                </View>
                                                <View style={styles.rowListItemRightContainer}>
                                                    {this._renderOverlappingPictures(
                                                        this.state.contactList
                                                    )}
                                                </View>
                                            </View>
                                        )}

                                        <View style={styles.line} />

                                        {this._renderLinkAccountSection()}
                                    </View>
                                )}
                            </ScrollView>

                            <FixedActionContainer>
                                <ActionButton
                                    height={48}
                                    fullWidth
                                    backgroundColor={accountNo == "" ? DISABLED : YELLOW}
                                    borderRadius={24}
                                    componentCenter={
                                        <Typo
                                            fontSize={14}
                                            fontWeight="600"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={18}
                                            text="Continue"
                                            color={accountNo == "" ? DISABLED_TEXT : BLACK}
                                        />
                                    }
                                    onPress={this._onPressContinue}
                                    disabled={accountNo == ""}
                                />
                            </FixedActionContainer>
                        </>
                    </ScreenLayout>
                </ScreenContainer>

                {accountList && (
                    <ScrollPickerView
                        expandedMode
                        showMenu={dropDownView}
                        list={accountList}
                        selectedIndex={selectedIndex}
                        onRightButtonPress={this._onPressDoneScrollPickerView}
                        onLeftButtonPress={this._onPressCloseScrollPickerView}
                        rightButtonText="Done"
                        leftButtonText="Cancel"
                    />
                )}

                {showCloseModal === true && (
                    <Popup
                        visible={true}
                        onClose={this._toggleCloseModal}
                        title="Unsaved Changes"
                        description="Are you sure you want to leave this page? Any unsaved changes will be discarded."
                        primaryAction={{
                            text: "Discard",
                            onPress: this._cancelTabung,
                        }}
                        secondaryAction={{
                            text: "Cancel",
                            onPress: this._toggleCloseModal,
                        }}
                    />
                )}

                {showGroupTabungModal && (
                    <Popup
                        visible={true}
                        onClose={this._toggleShowGroupTabungModal}
                        title="Group Tabung Must-Know"
                        description="Make sure all your friends respond to your invite! If even one friend declines before the start date, the Tabung will be cancelled. So make sure you invite those who are really in it to save together."
                        primaryAction={{
                            text: "Got It",
                            onPress: this._onPressWhosSaving,
                        }}
                    />
                )}

                {error && (
                    <Popup
                        visible={true}
                        onClose={this._dismissErrorPopup}
                        title={errorTitle}
                        description={errorMessage}
                        primaryAction={{
                            text: "Ok",
                            onPress: this._dismissErrorPopup,
                        }}
                    />
                )}
            </React.Fragment>
        );
    }
}

const styles = StyleSheet.create({
    avatarContainer: { height: 36, overflow: "visible", width: 170 },
    container: {
        marginTop: 10,
    },
    dateView1: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 16,
    },
    descriptionContainer: {
        marginTop: 5,
    },
    dropDownArrowImage: {
        height: 8,
        marginRight: 20,
        resizeMode: "contain",
        width: 15,
    },
    line: {
        borderColor: GREY,
        borderWidth: StyleSheet.hairlineWidth,
        marginVertical: 24,
    },
    maeTipsContainer: {
        flexDirection: "column",
        marginBottom: 2,
        marginTop: 16,
    },
    maeTipsText: {
        color: BLACK,
        fontFamily: "montserrat",
        fontSize: 14,
        fontStyle: "normal",
        fontWeight: "normal",
        letterSpacing: 0,
        lineHeight: 20,
    },
    parentContainer: { paddingHorizontal: 36 },
    rowListContainer: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        marginTop: 20,
        // backgroundColor: "yellow",
    },
    rowListItemLeftContainer: {
        flex: 0.4,
    },
    rowListItemRightContainer: {
        alignContent: "flex-end",
        alignItems: "flex-end",
        flex: 0.6,
        overflow: "visible",
        // backgroundColor: "red",
    },
    svContainer: { flex: 1 },
    tncContainer: {
        flexDirection: "column",
        marginTop: 20,
        paddingBottom: 120,
    },
    tncText: {
        color: DARK_GREY,
        fontFamily: "Montserrat",
        fontSize: 12,
        fontStyle: "normal",
        fontWeight: "normal",
        letterSpacing: 0,
        lineHeight: 18,
    },
});

const pictureStyles = StyleSheet.create({
    container: {
        alignItems: "center",
        backgroundColor: YELLOW,
        borderColor: "#ffffff",
        borderRadius: 18,
        borderStyle: "solid",
        borderWidth: 2,
        height: 36,
        justifyContent: "center",
        position: "absolute",
        right: 0,
        width: 36,
    },
    image: {
        borderRadius: 16,
        height: 32,
        resizeMode: "contain",
        width: 32,
    },
    text: { marginLeft: 1, marginTop: 2 },
});

export default withModelContext(Summary);
