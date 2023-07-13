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

import { YELLOW, MEDIUM_GREY, DISABLED, BLACK, DISABLED_TEXT } from "@constants/colors";
import { getDateRangeDefaultData } from "@constants/datePickerDefaultData";
import { CREATE_TABUNG_START } from "@constants/dateScenarios";
import { FA_CREATE_TABUNG_GOAL_STARTDATE } from "@constants/strings";

import * as DataModel from "@utils/dataModel";
import { getDateRange, getStartDate, getEndDate, getDefaultDate } from "@utils/dateRange";

class EnterGoalStartDate extends Component {
    static propTypes = {
        getModel: PropTypes.func,
        navigation: PropTypes.shape({
            addListener: PropTypes.func,
            goBack: PropTypes.func,
            navigate: PropTypes.func,
        }),
        resetModel: PropTypes.func,
        route: PropTypes.shape({
            params: PropTypes.string,
        }),
        updateModel: PropTypes.func,
    };

    constructor(props) {
        super(props);

        this.state = {
            value: "",
            lengthError: false,
            dropDoenyearView: false,
            dropDownmonthView: false,
            seletedMonth: DataModel.getCurrentMonthName(),
            seletedYear: DataModel.getCurrentYear(),
            minimumDate: DataModel.getDayDateFormat(DataModel.getNextDates(2)),
            maxDate: DataModel.getformteddate(DataModel.getNextDates(31)),
            selectedDate: DataModel.getcurrentDate(),
            yearsArray: [],
            monthsArray: [],
            displayDate: "",
            nowallet: false,
            nom2u: false,
            showSortAndFilterModal: false,
            showQuickActions: false,
            overlayType: "gradient",
            showDatePicker: false,
            confirmDateStartDate: moment().add(2, "days").toDate(),
            confirmDateEndDate: moment().add(31, "days").toDate(),
            confirmDateSelectedCalender: moment().add(2, "days").toDate(),

            showError: false,
            showErrorMore: false,
            errorMessage: "",
            errorDescription: "",
            errorMoreText: "",
            goalData: {},
            validDateRangeData: getDateRangeDefaultData(CREATE_TABUNG_START),
        };
    }

    componentDidMount() {
        // this.initData(); - why all twice??
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
        getDateRange(CREATE_TABUNG_START).then((data) => {
            this.setState({
                validDateRangeData: data,
                confirmDateStartDate: getDefaultDate(data),
            });
        });
    }

    _updateGoalDataContext = async (goalData, callback) => {
        const { updateModel } = this.props;

        this.setState({ goalData }, () => {
            updateModel({
                goals: {
                    goalData,
                },
            });

            callback && typeof callback === "function" && callback();
            // console.log("[_updateGoalDataContext] updated goalData state: ", this.state.goalData);
        });
    };

    _updateTransferDataContext = (transferData) => {
        const { updateModel } = this.props;

        this.setState({ transferData }, () => {
            updateModel({
                transfer: {
                    transferData,
                },
            });

            console.log(this.state.transferData);
        });
    };

    initData = () => {
        const { getModel } = this.props;
        const { goalData } = getModel("goals");
        const { transferData } = getModel("transfer");

        this.setState({ goalData, transferData }, () => {
            if (goalData.goalStart.length > 2) {
                this.setState({ displayDate: goalData.goalStart });
            }

            let day = new Date();
            const startDate = moment(day).add(1, "days").toDate();
            const maxDate = moment(day).add(31, "days").toDate();

            this.setState(
                {
                    // confirmDateStartDate: startDate,
                    // confirmDateEndDate: maxDate,
                    // confirmDateSelectedCalender: startDate,
                    seletedMonth: DataModel.getCurrentMonthName(),
                    seletedYear: DataModel.getCurrentYear(),
                    minimumDate: DataModel.getDayDateFormat(DataModel.getNextDates(1)),
                    maxDate: DataModel.getformteddate(DataModel.getNextDates(31)),
                    selectedDate: DataModel.getcurrentDate(),
                    showDatePicker: false,
                },
                () => {
                    console.log("confirmDateStartDate : ", this.state.confirmDateStartDate);
                    console.log("confirmDateEndDate : ", this.state.confirmDateEndDate);
                    console.log(
                        "confirmDateSelectedCalender : ",
                        this.state.confirmDateSelectedCalender
                    );
                    console.log("day : ", day);
                    console.log("startDate : ", startDate);
                    console.log("maxDate : ", maxDate);
                }
            );
        });
    };

    startClick = async () => {
        const { displayDate } = this.state;
        const { goalData } = this.state;

        if (displayDate.length > 2) {
            this._updateGoalDataContext({ ...goalData, goalStart: displayDate }, () => {
                if (this.state.editMode === true) {
                    if (
                        moment(goalData.goalEnd, "D MMM YYYY").diff(goalData.goalStart, "days") < 30
                    ) {
                        this._updateGoalDataContext(
                            {
                                ...goalData,
                                goalEnd: moment(goalData.goalStart, "D MMM YYYY")
                                    .add(1, "M")
                                    .format("D MMM YYYY"),
                            },
                            () => {
                                this.props.navigation.navigate(
                                    navigationConstant.CREATE_GOALS_SUMMARY
                                );
                            }
                        );
                    } else {
                        this.props.navigation.navigate(navigationConstant.CREATE_GOALS_SUMMARY);
                    }
                } else {
                    if (goalData.typeCode != 3) {
                        this.props.navigation.navigate(
                            navigationConstant.CREATE_GOALS_GOAL_END_DATE
                        );
                    } else {
                        this._updateGoalDataContext(
                            {
                                ...goalData,
                                goalEnd: moment(goalData.goalStart, "D MMM YYYY")
                                    .add(10, "years")
                                    .format("D MMM YYYY"),
                            },
                            () => {
                                this.props.navigation.navigate(
                                    navigationConstant.CREATE_GOALS_SUMMARY
                                );
                            }
                        );
                    }
                }
            });
        } else {
            this.setState({
                lengthError: true,
                errorMessage: "Select Start Date",
                errorDescription: "Please select a start date for this Tabung",
                errorMoreText: "OK",
                showErrorMore: false,
                showError: true,
            });
        }
    };

    selectedDay = (day) => {
        let { goalData, transferData } = this.state;

        console.log("converted", DataModel.getDateShortMonthFormat(day.dateString));
        console.log("converted  bbb", day.dateString);
        let dateCur = moment(new Date());
        let dateFeu = moment(day.dateString);
        console.log("dateCur ", dateCur);
        console.log("dateFeu ", dateFeu);
        console.log("Difference is ", dateFeu.diff(dateCur, "days"), "days");
        goalData.daysDiff = dateFeu.diff(dateCur, "days") + 3;

        let d = new Date(),
            month = "" + (d.getMonth() + 1),
            days = "" + d.getDate();

        if (month.length < 2) month = "0" + month;
        if (days.length < 2) days = "0" + days;

        let sd = day;
        let monthSD = "" + (sd.getMonth() + 1);
        let daysSD = "" + sd.getDate();
        let yearSD = sd.getFullYear();

        if (monthSD.length < 2) monthSD = "0" + monthSD;
        if (daysSD.length < 2) daysSD = "0" + daysSD;

        let selectDateInt = yearSD + monthSD + daysSD;
        let effectiveDateFormated = "";

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
                    showError: false,
                });
                console.log("Selected NOT Today ");
            }

            console.log("displayDate ", this.state.displayDate);
            console.log("EffectiveDate ", transferData.effectiveDate);

            this.setState({ confirmDateStartDate: day }, () => {
                this._updateGoalDataContext({
                    ...goalData,
                    goalStartObj: day,
                    goalStart: effectiveDateFormated,
                });
                this._updateTransferDataContext(transferData);
            });
        } catch (e) {
            console.log("catch ", e);
        } finally {
            this.hideDatePicker();
        }
    };

    hideDatePicker = () => {
        this.setState({
            showDatePicker: false,
        });
    };

    showDatePicker = () => {
        this.setState({ showDatePicker: true });
    };

    onBackPress = () => {
        console.log("[onBackPress] ");

        if (this.state.editMode === true) {
            this.props.navigation.navigate(navigationConstant.CREATE_GOALS_SUMMARY);
        } else {
            // this.props.navigation.navigate(navigationConstant.CREATE_GOALS_ENTER_GOAL_AMOUNT);
            this.props.navigation.goBack();
        }
    };

    render() {
        const { showError, errorMessage, displayDate, showDatePicker, goalData } = this.state;
        return (
            <React.Fragment>
                <ScreenContainer
                    backgroundType="color"
                    backgroundColor={MEDIUM_GREY}
                    showOverlay={showDatePicker}
                    analyticScreenName={FA_CREATE_TABUNG_GOAL_STARTDATE}
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
                        // neverForceInset={["bottom"]}
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
                                        text={goalData ? goalData.goalName : "Tabung"}
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
                                        text="When would you like to start your Tabung?"
                                    />
                                </View>

                                <View style={styles.titleContainer}>
                                    <TouchableOpacity onPress={this.showDatePicker}>
                                        <View pointerEvents="none">
                                            <TextInput
                                                accessibilityLabel={"Tap to select start date"}
                                                maxLength={30}
                                                isValidate
                                                isValid={!showError}
                                                errorMessage={errorMessage}
                                                value={displayDate.length > 2 ? displayDate : ""}
                                                placeholder="Tap to select start date"
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
                <DatePicker
                    showDatePicker={this.state.showDatePicker}
                    onCancelButtonPressed={this.hideDatePicker}
                    onDoneButtonPressed={this.selectedDay}
                    dateRangeStartDate={getStartDate(this.state.validDateRangeData)}
                    dateRangeEndDate={getEndDate(this.state.validDateRangeData)}
                    defaultSelectedDate={this.state.confirmDateStartDate}
                />
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

export default withModelContext(EnterGoalStartDate);
