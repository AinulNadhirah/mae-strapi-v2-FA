import moment from "moment";
import numeral from "numeral";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { TouchableOpacity, View, ScrollView, Image, StyleSheet, FlatList } from "react-native";

import * as navigationConstant from "@navigation/navigationConstant";
import NavigationService from "@navigation/navigationService";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import BorderedAvatar from "@components/Avatars/BorderedAvatar";
import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import { ErrorMessage, ScrollPickerView } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import TabungAccountDetailList from "@components/Others/TabungAccountDetailList";
import Popup from "@components/Popup";
import Typo from "@components/Text";

import { withModelContext } from "@context";

import { logEvent } from "@services/analytics";
import { joinGoalAPI, disableEsi, getCalculatedGoalESIFrequency } from "@services/index";

import { YELLOW, WHITE, MEDIUM_GREY, DARKEST_GRAY, GREY } from "@constants/colors";
import * as Strings from "@constants/strings";

import * as Utility from "@utils/dataModel/utility";

import assets from "@assets";

class Confirmation extends Component {
    static propTypes = {
        getModel: PropTypes.func,
        updateModel: PropTypes.func,
        resetModel: PropTypes.func,
        props: PropTypes.object,
    };

    state = {
        error: false,
        errorMessage: "",
        frequency: "Select frequency",
        dropDownView: false,
        accountList: [],
        frequencyList: [],
        esiEnabled: false,
        fromAccount: "",
        close: false,
        maeError: false,
        selectedIndex: 0,
        inviteData: null,
        participantList: null,
        showInitLoader: true,
    };

    componentDidMount() {
        console.log("[Confirmation] componentDidMount ");
        this._initData();

        this.focusSubscription = this.props.navigation.addListener("focus", async () => {
            console.log("[Confirmation] focusSubscription ");
            this._onFocusHandler();
        });

        logEvent(Strings.FA_VIEW_SCREEN, {
            [Strings.FA_SCREEN_NAME]: Strings.FA_TABUNG_INVITATION_ACCEPTINVITE_REVIEWDETAILS,
        });
    }

    _onPressClose = () => {
        this.setState({ close: true });
    };

    _onPressBack = () => {
        this.props.navigation.goBack();
    };

    _initData = () => {
        console.log("[_initData] this.props", this.props);
        this.setState(
            {
                inviteData: this.props.route.params.inviteData,
                participantList: this.props.route.params.participantList,
            },
            async () => {
                console.log("[_initData][setState] state", this.state);
                console.log("[_initData][setAccountSelected]");
                // Set selected account
                this.setAccountSelected();
                console.log("[_initData][calculateFrequency]");
                // Calculate frequency options
                await this.calculateFrequency();
                this.setState({
                    showInitLoader: false,
                });
            }
        );
    };

    _onFocusHandler = () => {
        if (this.props?.route?.params?.auth === "successful") {
            this.props.navigation.setParams({ auth: null });

            // Continue calling create goal API...
            console.log("PIN VALIDATION SUCCESS! Proceed to create goal API..");

            this._joinGoal();
        }
    };

    _joinGoal = async () => {
        console.log("_joinGoalAPI==> ");
        this.setState({ loader: true });

        let { inviteData } = this.state;

        let subUrl = "/goal/participants/confirm?goalId=" + inviteData.id;
        let params = {};

        try {
            params = JSON.stringify({
                esiAccountNo: inviteData.accountNo,
                esiOn: inviteData.esiEnabled,
                frequency: inviteData.frequencyType,
                savingAccount: inviteData.fromAccountNo,
                savingAcctCode: inviteData.fromAccountCode,
            });
            joinGoalAPI(subUrl, JSON.parse(params))
                .then((response) => {
                    let responseObject = response.data;
                    console.log(subUrl + " RESPONSE RECEIVED: ", response.data);
                    let result = responseObject.result;
                    if (
                        responseObject !== null &&
                        responseObject !== undefined &&
                        responseObject.message !== null &&
                        responseObject.message !== undefined &&
                        responseObject.message === "success"
                    ) {
                        if (result != undefined && result != null) {
                            inviteData.created = moment(result.dateTime).format(
                                "D MMM YYYY, h:mm A"
                            );
                            inviteData.ref = result.refId;
                        }
                        inviteData.success = true;
                        inviteData.message = "Tabung created successfully.";
                        this.setState({ inviteData, loader: false }, () => {
                            this.props.navigation.navigate("InvitationAcknowledgementScreen", {
                                inviteData,
                            });
                        });
                    } else if (
                        responseObject !== null &&
                        responseObject !== undefined &&
                        responseObject.message !== null &&
                        responseObject.message !== undefined &&
                        responseObject.message === "failed"
                    ) {
                        if (result != undefined && result != null) {
                            inviteData.created = moment(result.dateTime).format(
                                "D MMM YYYY, h:mm A"
                            );
                            inviteData.ref = result.refId;
                        }
                        inviteData.success = false;
                        inviteData.message = "Tabung was not created. Please try again.";
                        this.setState({ inviteData, loader: false }, () => {
                            this.props.navigation.navigate("InvitationAcknowledgementScreen", {
                                inviteData,
                            });
                        });
                    } else {
                        if (result != undefined && result != null) {
                            inviteData.created = moment(result.dateTime).format(
                                "D MMM YYYY, h:mm A"
                            );
                            inviteData.ref = result.refId;
                        }
                        inviteData.success = false;
                        inviteData.message = "Tabung was not created. Please try again.";
                        this.setState({ inviteData, loader: false }, () => {
                            this.props.navigation.navigate("InvitationAcknowledgementScreen", {
                                inviteData,
                            });
                        });
                    }
                })
                .catch((error) => {
                    console.log(subUrl + "  ERROR==> ", error);

                    inviteData.created = "";
                    inviteData.ref = "";
                    inviteData.success = false;
                    inviteData.message =
                        error?.error?.message ||
                        error?.message ||
                        "Oops! Something went wrong. Try again.";

                    this.setState({ inviteData, loader: false }, () => {
                        this.props.navigation.navigate("InvitationAcknowledgementScreen", {
                            inviteData,
                        });
                    });
                });
        } catch (e) {
            console.log(subUrl + "  catch ERROR==> " + e);

            inviteData.created = "";
            inviteData.ref = "";
            inviteData.success = false;
            inviteData.message =
                e?.error?.message || e?.message || "Oops! Something went wrong. Try again.";

            this.setState({ inviteData, loader: false }, () => {
                this.props.navigation.navigate("InvitationAcknowledgementScreen", {
                    inviteData,
                });
            });
        }
    };

    _getCalculatedGoalESIFrequency = async (startDate, endDate, amount) => {
        try {
            const response = await getCalculatedGoalESIFrequency(startDate, endDate, amount);
            if (response?.status === 200) return response;
            return null;
        } catch (error) {
            return null;
        }
    };

    calculateFrequency = async () => {
        const { inviteData } = this.state;

        const request = await this._getCalculatedGoalESIFrequency(
            inviteData.startDate,
            inviteData.endDate,
            inviteData.userDetails.contributionAmount
        );
        if (!request) return;

        const weeklyAmount = request.data?.weeklyAmount ?? 0;
        const weeklyTitle = `Save RM ${numeral(weeklyAmount).format("0,0.00")} / week`;
        const weeklyDetails = {
            type: "W",
            title: weeklyTitle,
            name: weeklyTitle,
            description: "",
            primary: false,
            select: false,
            amount: weeklyAmount,
        };

        const monthlyAmount = request.data?.monthlyAmount ?? 0;
        const monthlyTitle = `Save RM ${numeral(monthlyAmount).format("0,0.00")} / month`;
        const monthlyDetails = {
            type: "M",
            title: monthlyTitle,
            name: monthlyTitle,
            description: "",
            primary: true,
            select: true,
            amount: monthlyAmount,
        };

        this.setState(
            {
                frequencyList: [weeklyDetails, monthlyDetails],
                inviteData: {
                    ...inviteData,
                    frequencyType: monthlyDetails.type,
                    frequencyAmount: monthlyDetails.amount,
                },
                frequency: monthlyDetails.title,
                selectedIndex: 1,
            },
            () => {
                this._toggleESI();
            }
        );
    };

    onAccountListClick = (item) => {
        const { inviteData, accountList } = this.state;

        // item.description
        inviteData.fromAccountNo = item.number;
        inviteData.fromAccountCode = item.code;
        inviteData.fromAccountName = item.name;
        inviteData.fromAccountType = item.type;
        // ModelClass.TRANSFER_DATA.fromAccountName = item.title; -- shahid: commented out - is this really necessary?

        //Alert.alert("item " + item.acctNo);
        let tempArray = accountList;
        for (let i = 0; i < tempArray.length; i++) {
            tempArray[i].id = i;
            if (tempArray[i].number === item.number) {
                tempArray[i].selected = true;
            } else {
                tempArray[i].selected = false;
            }
        }
        //this.state.fromAccount = item.description;
        this.setState({ inviteData, accountList: tempArray, fromAccount: item.number });
    };

    setAccountSelected = () => {
        let { inviteData } = this.state;

        let tempArray = inviteData.accountList;
        let tempAccount = "";
        let selectedAccountObj = "";
        let nonSelectedAccounts = [];
        let targetSelectedAccounts = [];
        for (let j = 0; j < tempArray.length; j++) {
            if (j === 0) {
                tempArray[j].selected = true;
                selectedAccountObj = tempArray[j];
                tempAccount = selectedAccountObj.description;

                inviteData.fromAccountNo = selectedAccountObj.number;
                inviteData.fromAccountCode = selectedAccountObj.code;
                inviteData.fromAccountName = selectedAccountObj.title;
                inviteData.fromAccountType = selectedAccountObj.type;

                this.setState({ inviteData });
                // ModelClass.TRANSFER_DATA.fromAccountName = selectedAccountObj.title; -- Shahid: commented out, is this really needed?
            } else {
                tempArray[j].selected = false;
                nonSelectedAccounts.push(tempArray[j]);
            }
        }
        //Set Selected Account in Account List add it First to Account list
        if (selectedAccountObj != null && selectedAccountObj != "") {
            targetSelectedAccounts.push(selectedAccountObj);
        }
        targetSelectedAccounts.push(...nonSelectedAccounts);

        this.setState({ accountList: targetSelectedAccounts, fromAccount: tempAccount });
    };

    esiDisable = async () => {
        let { goalData } = this.state;

        let request = {};
        request.nextDeduction = goalData.frequencyNextDeduction;
        request.lastDeduction = goalData.frequencylastDeduction;
        if (goalData.frequencyType === "M") {
            request.frequency = "M";
        } else {
            request.frequency = "W";
        }

        request.esiOn = false;
        request.amount = goalData.frequencyAmount;
        request.goalId = goalData.goalId;
        request.fromAcct = goalData.fromAccountNo;

        await disableEsi("/esi/create", JSON.stringify(request))
            .then(async (response) => {
                console.log("RES", response);
                const regObject = await response.data;
                console.log("Object", regObject);
                goalData.success = regObject.code === 0 ? true : false;
                goalData.created = regObject.result.createdDate;
                goalData.ref = regObject.result.trxRefId;
                if (goalData.success === true) {
                    goalData.message = "You’ve successfully disabled your auto deduction.";
                } else {
                    if (regObject.message) {
                        goalData.message = regObject.message;
                    } else {
                        goalData.message = "Failed to disable your auto deduction.";
                    }
                }
                this._updateGoalDataContext(goalData);

                NavigationService.navigateToModule(
                    navigationConstant.GOALS_MODULE,
                    navigationConstant.CREATE_GOALS_ACKNOWLEDGMENT
                );
            })
            .catch((err) => {
                console.log("ERR", err);
                goalData.created = "";
                goalData.ref = "";
                goalData.success = false;
                goalData.message = "Oops! Something went wrong. Try again.";

                this._updateGoalDataContext(goalData);

                NavigationService.navigateToModule(
                    navigationConstant.GOALS_MODULE,
                    navigationConstant.CREATE_GOALS_ACKNOWLEDGMENT
                );
                //this.setState({ errorOtp: true, ErrorMessage: "Server communication error" });
            });
    };

    _onPressDoneScrollPickerView = (val, index) => {
        let { inviteData } = this.state;

        console.log("DN Val " + index, val);
        let list = this.state.frequencyList.slice();
        for (let item in list) {
            list[item].select = false;
            list[item].primary = false;
        }
        list[index].select = true;
        list[index].primary = true;
        inviteData.frequencyType = val.type;
        inviteData.frequencyAmount = val.amount;
        if (inviteData.esiActivation === true) {
            inviteData.goalEnd = val.formattedLastDeductionDate;
            inviteData.frequencylastDeduction = val.formattedLastDeductionDate;
        }

        this.setState({
            inviteData,
            frequencyList: list,
            dropDownView: false,
            frequency: val.title,
            selectedIndex: index,
        });
    };

    _onPressCloseScrollPickerView = () => {
        console.log("_onPressCloseScrollPickerView");

        this.setState({
            dropDownView: false,
        });
    };

    _onPressContinue = () => {
        let { inviteData } = this.state;

        if (this.state.frequency != "Select frequency") {
            if (
                (this.state.esiEnabled == true || inviteData.esiActivation == true) &&
                inviteData.fromAccountCode == "OY" &&
                inviteData.frequencyAmount > 2999.99
            ) {
                this.setState({ maeError: true });
            } else {
                inviteData.fromRoute = navigationConstant.CREATE_GOALS_CONFIRMATION;

                // NavigationService.navigateToModule(
                //     navigationConstant.GOALS_MODULE,
                //     navigationConstant.CREATE_GOALS_PIN_VALIDATE
                // );

                // Get user's phone number
                const { getModel } = this.props;
                const { m2uPhoneNumber } = getModel("m2uDetails");

                // Trigger pin validate screen
                this.props.navigation.navigate("SettingsModule", {
                    screen: "ConfirmPhoneNumber",
                    params: {
                        externalSource: {
                            stack: "goalsModule",
                            screen: "InvitationConfirmationScreen",
                        },
                        phone: m2uPhoneNumber,
                        type: "GOAL_CREATE",
                    },
                });
            }
        } else {
            this.setState({
                error: true,
                errorMessage: "Please select a frequency",
            });
        }
    };

    _toggleESI = () => {
        const { esiEnabled } = this.state;
        let { inviteData } = this.state;

        inviteData.esiEnabled = !esiEnabled;

        this.setState({ inviteData, esiEnabled: inviteData.esiEnabled });
    };

    _cancelTabung = () => {
        this.setState({ close: false });

        this.props.navigation.navigate("Dashboard", {
            screen: "TabungTab",
        });
    };

    _toggleCloseModal = () => {
        this.setState({ close: !this.state.close });
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

    renderWhosSaving() {
        console.log("renderWhosSaving");
        const { participantList } = this.state;

        return (
            <View style={styles.whosSavingContainer}>
                <View style={styles.whosSavingTitleContainer}>
                    <Typo
                        fontSize={16}
                        lineHeight={18}
                        fontWeight="600"
                        textAlign="left"
                        text="Who's saving?"
                    />
                </View>
                <View style={styles.whosSavingContentContainer}>
                    <FlatList
                        style={styles.whosSavingFlatList}
                        data={participantList}
                        showIndicator={false}
                        keyExtractor={(item, index) => `${item.contentId}-${index}`}
                        renderItem={({ item }) => (
                            <View style={styles.whosSavingItemContainer}>
                                <BorderedAvatar
                                    width={44}
                                    height={44}
                                    borderRadius={22}
                                    backgroundColor={GREY}
                                >
                                    {item.imageUrl && item.imageUrl !== "" ? (
                                        <Image
                                            style={styles.newTransferCircle}
                                            source={{ uri: item.imageUrl }}
                                        />
                                    ) : (
                                        <Typo
                                            fontSize={14}
                                            lineHeight={22}
                                            fontWeight="300"
                                            text={item.initials}
                                        />
                                    )}
                                </BorderedAvatar>

                                <View style={styles.whosSavingInnerContainerLeft}>
                                    <Typo
                                        fontSize={14}
                                        lineHeight={19}
                                        textAlign="left"
                                        text={item.participantName}
                                        fontWeight={item.owner ? "600" : "normal"}
                                    />
                                </View>
                                <View style={styles.whosSavingInnerContainerRight}>
                                    <Typo
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={18}
                                        textAlign="right"
                                        text={"RM " + numeral(item.amount).format("0,0.00")}
                                    />
                                </View>
                            </View>
                        )}
                    />
                </View>
            </View>
        );
    }

    render() {
        const { inviteData, participantList, showInitLoader } = this.state;
        return (
            <React.Fragment>
                <ScreenContainer
                    backgroundType="color"
                    backgroundColor={MEDIUM_GREY}
                    showLoaderModal={showInitLoader}
                >
                    <ScreenLayout
                        paddingBottom={0}
                        paddingTop={0}
                        paddingHorizontal={0}
                        header={
                            <HeaderLayout
                                headerLeftElement={<HeaderBackButton onPress={this._onPressBack} />}
                                headerCenterElement={
                                    <Typo
                                        text="Confirmation"
                                        fontWeight="600"
                                        fontSize={16}
                                        lineHeight={19}
                                    />
                                }
                                headerRightElement={
                                    <HeaderCloseButton onPress={this._onPressClose} />
                                }
                            />
                        }
                        useSafeArea
                        // neverForceInset={["bottom"]}
                    >
                        {inviteData && (
                            <>
                                <ScrollView showsVerticalScrollIndicator={false}>
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
                                            <View style={styles.rowListItemRightContainer}>
                                                <Typo
                                                    fontSize={14}
                                                    fontWeight="600"
                                                    lineHeight={18}
                                                    textAlign="right"
                                                    text={inviteData.name}
                                                />
                                            </View>
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
                                            <View style={styles.rowListItemRightContainer}>
                                                <Typo
                                                    fontSize={14}
                                                    fontWeight="600"
                                                    lineHeight={18}
                                                    textAlign="right"
                                                    text={
                                                        "RM " +
                                                        numeral(inviteData.totalAmount).format(
                                                            "0,0.00"
                                                        )
                                                    }
                                                />
                                            </View>
                                        </View>

                                        <View style={styles.rowListContainer}>
                                            <View style={styles.rowListItemLeftContainer}>
                                                <Typo
                                                    fontSize={14}
                                                    lineHeight={19}
                                                    textAlign="left"
                                                    text="Your contribution"
                                                />
                                            </View>
                                            <View style={styles.rowListItemRightContainer}>
                                                <Typo
                                                    fontSize={14}
                                                    fontWeight="600"
                                                    lineHeight={18}
                                                    textAlign="right"
                                                    text={
                                                        "RM " +
                                                        numeral(
                                                            inviteData.userDetails
                                                                .contributionAmount
                                                        ).format("0,0.00")
                                                    }
                                                />
                                            </View>
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
                                            <View style={styles.rowListItemRightContainer}>
                                                <Typo
                                                    fontSize={14}
                                                    fontWeight="600"
                                                    lineHeight={18}
                                                    textAlign="right"
                                                    text={inviteData.formattedStartDate}
                                                />
                                            </View>
                                        </View>

                                        <View style={styles.rowListContainer}>
                                            <View style={styles.rowListItemLeftContainer}>
                                                <Typo
                                                    fontSize={14}
                                                    lineHeight={19}
                                                    textAlign="left"
                                                    text="End date"
                                                />
                                            </View>

                                            <View style={styles.rowListItemRightContainer}>
                                                <Typo
                                                    fontSize={14}
                                                    fontWeight="600"
                                                    lineHeight={18}
                                                    textAlign="right"
                                                    text={inviteData.formattedEndDate}
                                                />
                                            </View>
                                        </View>

                                        <View style={styles.rowListContainer}>
                                            <View style={styles.rowListItemLeftContainer}>
                                                <Typo
                                                    fontSize={14}
                                                    lineHeight={19}
                                                    textAlign="left"
                                                    text="Linked account"
                                                />
                                            </View>
                                            <View style={styles.rowListItemRightContainer}>
                                                <Typo
                                                    fontSize={14}
                                                    fontWeight="600"
                                                    lineHeight={18}
                                                    textAlign="right"
                                                    text={
                                                        inviteData.accountName +
                                                        "\n" +
                                                        Utility.formateAccountNumber(
                                                            inviteData.accountNo,
                                                            12
                                                        )
                                                    }
                                                />
                                            </View>
                                        </View>
                                    </View>

                                    {participantList &&
                                        participantList.length > 1 &&
                                        this.renderWhosSaving()}

                                    <View style={styles.line} />

                                    <View style={styles.block}>
                                        <Typo
                                            fontSize={14}
                                            lineHeight={19}
                                            textAlign="left"
                                            text="Select frequency"
                                        />
                                    </View>

                                    <View style={styles.frequencyButtonContainer}>
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
                                                        text={this.state.frequency}
                                                        textAlign="left"
                                                    />
                                                </View>
                                            }
                                            componentRight={
                                                <Image
                                                    source={assets.downArrow}
                                                    style={styles.dropDownArrowImage}
                                                />
                                            }
                                            onPress={() => {
                                                this.setState({
                                                    dropDownView: true,
                                                });
                                            }}
                                            // disable
                                        />
                                    </View>

                                    <View style={styles.esiContainer}>
                                        <TouchableOpacity onPress={this._toggleESI}>
                                            <View
                                                style={{
                                                    flexDirection: "row",
                                                    alignItems: "center",
                                                }}
                                            >
                                                <Image
                                                    style={{
                                                        height: 20,
                                                        width: 20,
                                                        marginRight: 8,
                                                    }}
                                                    source={
                                                        this.state.esiEnabled
                                                            ? assets.icRadioChecked
                                                            : assets.icRadioUnchecked
                                                    }
                                                />
                                                <Typo
                                                    fontSize={14}
                                                    fontWeight="600"
                                                    lineHeight={18}
                                                    textAlign="left"
                                                    text="Auto Deduction (optional)"
                                                />
                                            </View>
                                        </TouchableOpacity>

                                        <View style={styles.descriptionContainer}>
                                            <Typo
                                                fontSize={14}
                                                lineHeight={20}
                                                textAlign="left"
                                                text="Never worry about forgetting to save for your goal again."
                                            />
                                            <View style={styles.subDescriptionContainer}>
                                                {this.state.esiEnabled && (
                                                    <Typo
                                                        fontSize={12}
                                                        fontWeight="600"
                                                        lineHeight={18}
                                                        textAlign="left"
                                                        text={`First deduction will start on ${inviteData.formattedStartDate}`}
                                                    />
                                                )}
                                            </View>
                                            <TouchableOpacity onPress={this._onPressTncLink}>
                                                <Typo
                                                    fontSize={12}
                                                    lineHeight={18}
                                                    textDecorationLine="underline"
                                                    textAlign="left"
                                                    color={DARKEST_GRAY}
                                                    style={{
                                                        textDecorationLine: "underline",
                                                    }}
                                                    text="I agree to the Terms & Conditions"
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    {(this.state.esiEnabled === true ||
                                        inviteData.esiActivation === true) && (
                                        <>
                                            <View style={styles.bottomView}>
                                                <Typo
                                                    fontSize={14}
                                                    lineHeight={18}
                                                    fontWeight="600"
                                                    textAlign="left"
                                                    text="Transfer from"
                                                />
                                            </View>
                                            <FlatList
                                                style={styles.accountsFlatlist}
                                                data={this.state.accountList}
                                                extraData={this.state}
                                                horizontal={true}
                                                scrollToIndex={0}
                                                showsHorizontalScrollIndicator={false}
                                                showIndicator={false}
                                                keyExtractor={(item, index) =>
                                                    `${item.contentId}-${index}`
                                                }
                                                renderItem={({ item, index }) => (
                                                    <TabungAccountDetailList
                                                        item={item}
                                                        index={index}
                                                        scrollToIndex={3}
                                                        onPress={() =>
                                                            this.onAccountListClick(item)
                                                        }
                                                    />
                                                )}
                                                ListHeaderComponent={<View style={{ width: 24 }} />}
                                                ListFooterComponent={<View style={{ width: 24 }} />}
                                            />
                                        </>
                                    )}

                                    <View style={{ height: 50 }} />
                                </ScrollView>

                                <FixedActionContainer>
                                    <ActionButton
                                        height={48}
                                        fullWidth
                                        backgroundColor={YELLOW}
                                        borderRadius={24}
                                        componentCenter={
                                            <Typo
                                                fontSize={14}
                                                fontWeight="600"
                                                fontStyle="normal"
                                                letterSpacing={0}
                                                lineHeight={18}
                                                text={"Join Tabung"}
                                            />
                                        }
                                        onPress={this._onPressContinue}
                                        // disabled
                                    />
                                </FixedActionContainer>
                            </>
                        )}
                    </ScreenLayout>
                </ScreenContainer>

                {this.state.maeError == true ? (
                    <ErrorMessage
                        onClose={() => {
                            this.setState({ maeError: false });
                        }}
                        title={Strings.APP_NAME_ALERTS}
                        description={"You have exceeded the maximum transaction limit for MAE"}
                        showOk={true}
                        onOkPress={() => {
                            this.setState({ maeError: false });
                        }}
                    />
                ) : null}

                {this.state.error == true ? (
                    <ErrorMessage
                        onClose={() => {
                            this.setState({ error: false });
                        }}
                        title="Select Frequency"
                        description={this.state.errorMessage}
                        showOk={true}
                        onOkPress={() => {
                            this.setState({ error: false });
                        }}
                    />
                ) : null}

                <ScrollPickerView
                    showMenu={this.state.dropDownView}
                    list={this.state.frequencyList}
                    selectedIndex={this.state.selectedIndex}
                    onRightButtonPress={(value, index) =>
                        this._onPressDoneScrollPickerView(value, index)
                    }
                    onLeftButtonPress={this._onPressCloseScrollPickerView}
                    rightButtonText="Done"
                    leftButtonText="Cancel"
                />

                {this.state.close === true && (
                    <Popup
                        visible={true}
                        onClose={this._toggleCloseModal}
                        title={"Unsaved Changes"}
                        description={
                            "Are you sure you want to leave this page? Any unsaved changes will be discarded."
                        }
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
            </React.Fragment>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        justifyContent: "center",
        marginTop: 10,
        marginHorizontal: 36,
    },
    dropDownArrowImage: {
        width: 15,
        height: 8,
        marginRight: 20,
        resizeMode: "contain",
    },
    esiContainer: {
        marginHorizontal: 36,
    },
    rowListContainer: {
        flex: 1,
        flexDirection: "row",
        marginTop: 20,
    },
    rowListItemLeftContainer: {
        flex: 0.4,
    },
    rowListItemRightContainer: {
        flex: 0.6,
        alignItems: "flex-end",
        alignContent: "flex-end",
    },
    block: { flexDirection: "column", marginTop: 24, marginHorizontal: 36 },
    descriptionContainer: {
        marginLeft: 28,
        marginTop: 4,
    },
    subDescriptionContainer: {
        marginTop: 4,
        marginBottom: 4,
    },
    frequencyButtonContainer: {
        justifyContent: "center",
        flexDirection: "row",
        marginTop: 16,
        marginBottom: 24,
        marginHorizontal: 36,
    },
    whosSavingContainer: {
        marginTop: 24,
    },
    whosSavingFlatList: { overflow: "visible" },
    whosSavingTitleContainer: { paddingHorizontal: 36 },
    whosSavingContentContainer: {
        marginTop: 22,
        overflow: "visible",
    },
    whosSavingItemContainer: {
        height: 50,
        marginBottom: 15,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        overflow: "visible",
        paddingHorizontal: 36,
    },
    whosSavingInnerContainerLeft: {
        flex: 1,
        justifyContent: "center",
        flexDirection: "column",
        marginLeft: 14,
    },
    whosSavingInnerContainerRight: {
        justifyContent: "center",
        alignItems: "flex-end",
        flexDirection: "column",
    },
    newTransferCircle: {
        borderRadius: 20,
        height: 40,
        resizeMode: "contain",
        width: 40,
    },
    bottomView: {
        flexDirection: "column",
        marginTop: 24,
        marginHorizontal: 36,
    },
    accountsFlatlist: {
        overflow: "visible",
    },
    line: {
        marginTop: 24,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: "#cccccc",
        marginHorizontal: 36,
    },
});

export default withModelContext(Confirmation);
