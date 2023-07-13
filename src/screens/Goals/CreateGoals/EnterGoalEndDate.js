import AsyncStorage from "@react-native-community/async-storage";
import moment from "moment";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";

import * as navigationConstant from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import DatePicker from "@components/Pickers/DatePicker";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";

import { withModelContext } from "@context";

import { YELLOW, MEDIUM_GREY, DISABLED, DISABLED_TEXT, BLACK } from "@constants/colors";
import { getDateRangeDefaultData } from "@constants/datePickerDefaultData";
import { CREATE_TABUNG_END } from "@constants/dateScenarios";
import { FA_CREATE_TABUNG_GOAL_ENDDATE } from "@constants/strings";

import * as DataModel from "@utils/dataModel";
import { getDateRange, getStartDate, getEndDate, getDefaultDate } from "@utils/dateRange";

class EnterGoalEndDate extends Component {
    static propTypes = {
        getModel: PropTypes.func,
        navigation: PropTypes.shape({
            addListener: PropTypes.func,
            navigate: PropTypes.func,
        }),
        resetModel: PropTypes.func,
        route: PropTypes.shape({
            params: PropTypes.string,
        }),
        updateModel: PropTypes.func,
    };

    state = {
        value: "",
        lengthError: false,
        dropDoenyearView: false,
        dropDownmonthView: false,
        yearsArray: [],
        monthsArray: [],
        displayDate: "",
        noWallet: false,
        nom2u: false,
        showSortAndFilterModal: false,
        showQuickActions: false,
        overlayType: "gradient",
        showDatePicker: false,
        showError: false,
        showErrorMore: false,
        errorMessage: "",
        errorDescription: "",
        errorMoreText: "",
        seletedMonth: DataModel.getCurrentMonthName(),
        seletedYear: DataModel.getCurrentYear(),
        maxDate: DataModel.getformteddate(DataModel.getNextDates(3600)),
        selectedDate: DataModel.getcurrentDate(),
        validDateRangeData: getDateRangeDefaultData(CREATE_TABUNG_END),
    };

    componentDidMount() {
        // this.initData();
        this._getDatePickerData();
        this.focusSubscription = this.props.navigation.addListener("focus", async () => {
            const params = this.props.route?.params ?? "";
            if (params) {
                const { editMode } = params;
                this.setState({ editMode });
            }

            this.initData();
        });
    }

    componentWillUnmount() {
        this.focusSubscription();
    }
    _getDatePickerData() {
        getDateRange(CREATE_TABUNG_END).then((data) => {
            this.setState({
                validDateRangeData: data,
            });
        });
    }

    initData = () => {
        const { getModel } = this.props;
        const { goalData } = getModel("goals");
        const { transferData } = getModel("transfer");

        console.log("[TEST]", moment(goalData.goalStart, "D MMM YYYY").add(1, "M"));

        // let displayDate = "";

        this.setState(
            {
                goalData,
                transferData,
                // minimumDate: DataModel.getDayDateFormat(DataModel.getNextDates(goalData.daysDiff)),
                confirmDateStartDate: moment(goalData.goalStart, "D MMM YYYY").add(1, "M").toDate(),
                confirmDateEndDate: moment(goalData.goalStart, "D MMM YYYY")
                    .add(10, "years")
                    .toDate(),
                confirmDateSelectedCalender: moment(goalData.goalStart, "D MMM YYYY")
                    .add(1, "M")
                    .toDate(),
                displayDate: goalData.goalEnd ? goalData.goalEnd : "",
            },
            () => {
                console.log("confirmDateStartDate : ", this.state.confirmDateStartDate);
                console.log("confirmDateEndDate : ", this.state.confirmDateEndDate);
                console.log(
                    "confirmDateSelectedCalender : ",
                    this.state.confirmDateSelectedCalender
                );
            }
        );

        // if (goalData.goalEnd.length > 2) {
        //     this.setState({ displayDate: goalData.goalEnd });
        // }
    };

    _updateGoalDataContext = async (goalData) => {
        const { updateModel } = this.props;

        this.setState({ goalData }, async () => {
            await updateModel({
                goals: {
                    goalData,
                },
            });

            console.log(this.state.goalData);
        });
    };

    _updateTransferDataContext = async (transferData) => {
        const { updateModel } = this.props;

        this.setState({ transferData }, async () => {
            await updateModel({
                transfer: {
                    transferData,
                },
            });

            console.log(this.state.transferData);
        });
    };

    selectedDay = (day) => {
        console.log("converted", DataModel.getDateShortMonthFormat(day));
        console.log("converted  bbb", day);

        let { goalData, transferData } = this.state;

        let d = new Date(),
            month = "" + (d.getMonth() + 1),
            days = "" + d.getDate(),
            year = d.getFullYear();

        if (month.length < 2) month = "0" + month;
        if (days.length < 2) days = "0" + days;

        // let todayInt = year + month + days;

        let sd = day;
        let monthSD = "" + (sd.getMonth() + 1);
        let daysSD = "" + sd.getDate();
        let yearSD = sd.getFullYear();

        if (monthSD.length < 2) monthSD = "0" + monthSD;
        if (daysSD.length < 2) daysSD = "0" + daysSD;

        let selectDateInt = yearSD + monthSD + daysSD;
        let effectiveDateFormated = "";

        goalData.goalEndObj = day;
        console.log("converted  today year+month+days ", year + month + days);

        try {
            if (DataModel.getDateFormated(new Date()) === DataModel.getDateFormated(day)) {
                transferData.isFutureTransfer = false;
                transferData.effectiveDate = "00000000";
                this.setState({ displayDate: "Today" });
                console.log("Selected Today ");
            } else {
                effectiveDateFormated = DataModel.getDateFormated(day);
                transferData.effectiveDate = selectDateInt;
                transferData.effectiveDateFormated = effectiveDateFormated;
                transferData.isFutureTransfer = true;
                this.setState({
                    displayDate: effectiveDateFormated,
                    dateSelected: transferData.effectiveDate,
                });
                console.log("Selected NOT Today ");
            }

            console.log("displayDate ", this.state.displayDate);
            console.log("EffectiveDate ", transferData.effectiveDate);

            this._updateGoalDataContext(goalData);
            this._updateTransferDataContext(transferData);
        } catch (e) {
            console.log("catch ", e);
        } finally {
            this.hideDatePicker();
        }
    };

    hideDatePicker = () => {
        console.log("[OverseasDateScreen] >> [hideDatePicker]");

        this.setState({
            showDatePicker: false,
        });
    };

    showDatePicker = () => {
        console.log("[showDatePicker] ");
        console.log("confirmDateSelectedCalender : ", this.state.confirmDateSelectedCalender);
        this.setState({ showDatePicker: true });
    };

    startClick = async () => {
        let { goalData } = this.state;

        if (this.state.displayDate.length > 2) {
            this._updateGoalDataContext({ ...goalData, goalEnd: this.state.displayDate });

            if (this.state.editMode === true) {
                this.setState({
                    displayDate: "",
                });
                this.props.navigation.navigate(navigationConstant.CREATE_GOALS_SUMMARY);
            } else {
                let walletId = null;
                let m2uUserName = null;
                try {
                    walletId = AsyncStorage.getItem("walletId");
                } catch (error) {
                    walletId = null;
                }

                try {
                    m2uUserName = AsyncStorage.getItem("m2uUserName");
                } catch (error) {
                    m2uUserName = null;
                }

                if (walletId === null) {
                    this.setState({
                        noWallet: true,
                        lengthError: false,
                        nom2u: false,
                        errorMessage: "Setup Wallet",
                        errorDescription:
                            "Set up your Wallet first in order to proceed to the next step.",
                        errorMoreText: "Proceed",
                        showErrorMore: true,
                        showError: true,
                    });
                } else if (m2uUserName === null || m2uUserName === "null") {
                    this.setState({
                        nom2u: true,
                        lengthError: false,
                        noWallet: false,
                        errorMessage: "Link to Maybank2U",
                        errorDescription:
                            "Looks like your Maybank2u account isn’t linked yet. Check your options below to proceed with your transactions.",
                        errorMoreText: "Login",
                        showErrorMore: true,
                        showError: true,
                    });
                } else {
                    this.setState({
                        displayDate: "",
                    });
                    // console.log("transferData.m2uToken", transferData?.m2uToken ?? "");

                    // NavigationService.navigateToModule(
                    // 	navigationConstant.GOALS_MODULE,
                    // 	navigationConstant.CREATE_GOALS_SUMMARY
                    // );

                    this.props.navigation.navigate(navigationConstant.CREATE_GOALS_SUMMARY);

                    // this.props.updateModel({
                    //     ui: {
                    //         m2uLogin: true,
                    //         onLogicSuccess: () => {
                    //             this.props.navigation.navigate(
                    //                 navigationConstant.CREATE_GOALS_SUMMARY
                    //             );
                    //         },
                    //     },
                    // });

                    // NavigationService.navigateToModule(
                    // 	navigationConstant.GOALS_MODULE,
                    // 	navigationConstant.CREATE_GOALS_M2ULOGIN,
                    // 	{
                    // 		routeFrom: navigationConstant.CREATE_GOALS_SELECT_GOAL_TYPE,
                    // 		routeTo: navigationConstant.CREATE_GOALS_SUMMARY
                    // 	}
                    // );
                }
            }
        } else {
            this.setState({
                lengthError: true,
                noWallet: false,
                nom2u: false,
                errorMessage: "Select End Date",
                errorDescription: "Please select an end date for this Tabung.",
                errorMoreText: "OK",
                showErrorMore: false,
                showError: true,
            });
        }
    };

    onBackPress = () => {
        console.log("[onBackPress] ");

        if (this.state.editMode === true) {
            this.props.navigation.navigate(navigationConstant.CREATE_GOALS_SUMMARY);
        } else {
            console.log("[onBackPress] 2");
            // this.props.navigation.goBack();
            this.props.navigation.navigate(navigationConstant.CREATE_GOALS_GOAL_START_DATE);
        }
    };

    render() {
        const {
            showError,
            errorMessage,
            displayDate,
            showDatePicker,
            confirmDateStartDate,
            confirmDateEndDate,
            confirmDateSelectedCalender,
            goalData,
        } = this.state;
        return (
            <React.Fragment>
                <ScreenContainer
                    backgroundType="color"
                    backgroundColor={MEDIUM_GREY}
                    showOverlay={showDatePicker}
                    analyticScreenName={FA_CREATE_TABUNG_GOAL_ENDDATE}
                >
                    <ScreenLayout
                        paddingBottom={0}
                        paddingTop={0}
                        paddingHorizontal={0}
                        header={
                            <HeaderLayout
                                headerLeftElement={<HeaderBackButton onPress={this.onBackPress} />}
                            />
                        }
                        useSafeArea
                    >
                        <React.Fragment>
                            <View style={styles.block}>
                                <View style={styles.titleContainer}>
                                    <Typo
                                        fontSize={14}
                                        fontWeight="600"
                                        fontStyle="normal"
                                        letterSpacing={0}
                                        lineHeight={18}
                                        textAlign="left"
                                        color="#000000"
                                        text={goalData ? goalData.goalName : ""}
                                    />
                                </View>
                                <View style={styles.descriptionContainer}>
                                    <Typo
                                        fontSize={20}
                                        fontWeight="300"
                                        fontStyle="normal"
                                        letterSpacing={0}
                                        lineHeight={28}
                                        textAlign="left"
                                        color="#000000"
                                        text="When would you like to complete this Tabung?"
                                    />
                                </View>

                                <View style={styles.titleContainer}>
                                    <TouchableOpacity onPress={this.showDatePicker}>
                                        <View pointerEvents="none">
                                            <TextInput
                                                accessibilityLabel={"Tap to select end date"}
                                                maxLength={30}
                                                isValidate
                                                isValid={!showError}
                                                errorMessage={errorMessage}
                                                value={displayDate.length > 2 ? displayDate : ""}
                                                placeholder="Tap to select end date"
                                                editable={false}
                                            />
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <FixedActionContainer>
                                <ActionButton
                                    height={48}
                                    fullWidth
                                    backgroundColor={displayDate === "" ? DISABLED : YELLOW}
                                    borderRadius={24}
                                    componentCenter={
                                        <Typo
                                            color={displayDate === "" ? DISABLED_TEXT : BLACK}
                                            fontSize={14}
                                            fontWeight="600"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={18}
                                            text="Continue"
                                        />
                                    }
                                    onPress={this.startClick}
                                    disabled={displayDate === ""}
                                />
                            </FixedActionContainer>
                        </React.Fragment>
                    </ScreenLayout>
                </ScreenContainer>
                {goalData && (
                    <DatePicker
                        showDatePicker={showDatePicker}
                        onCancelButtonPressed={this.hideDatePicker}
                        onDoneButtonPressed={this.selectedDay}
                        dateRangeStartDate={getStartDate(
                            this.state.validDateRangeData,
                            moment(goalData.goalStart, "D MMM YYYY")
                        )}
                        dateRangeEndDate={getEndDate(
                            this.state.validDateRangeData,
                            moment(goalData.goalStart, "D MMM YYYY")
                        )}
                        defaultSelectedDate={getDefaultDate(
                            this.state.validDateRangeData,
                            moment(goalData.goalStart, "D MMM YYYY")
                        )}
                    />
                )}
            </React.Fragment>
        );
    }
}

const styles = StyleSheet.create({
    block: { flex: 1, marginHorizontal: 36 },
    descriptionContainer: {
        justifyContent: "flex-start",
        marginTop: 10,
    },
    titleContainer: { justifyContent: "flex-start", marginTop: 30 },
});
export default withModelContext(EnterGoalEndDate);
