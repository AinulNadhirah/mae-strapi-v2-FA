import React, { Component } from "react";
import { View, Text, Dimensions, TouchableOpacity } from "react-native";
const { width, height } = Dimensions.get("window");
import moment from "moment";
import CalendarStyles from "@styles/Fitness/weeklyCalendarStripStyles";
import { weekdayNumberToDayCharacter } from "@utils/dataModel/utility";

class WeeklyCalendarStrip extends Component {
    constructor(props) {
        super(props);
    }

    drawCalendar() {
        // let newtoday = new Date();
        const todayDate = moment(new Date());
        let challengeStartDate = moment(this.props.challengeStartDate);
        challengeStartDate = moment(challengeStartDate).subtract(
            challengeStartDate.utcOffset() * 60000
        );
        let weekStart = moment(challengeStartDate).startOf("week").weekday(1);
        let dotsArray = [];
        let dateDayArray = [];
        let returnArray = [];

        if (this.props.challengeStartDate.getDay() == 0) {
            weekStart = moment(weekStart).subtract(7, "day");
        } else {
            weekStart = moment(this.props.challengeStartDate).startOf("week").weekday(1);
        }

        if (this.props.calendarType == "DH") {
            let day = "";
            for (i = 0; i < 7; i++) {
                day = weekdayNumberToDayCharacter(weekStart);
                dateDayArray.push(
                    <View
                        style={i > 0 ? { marginLeft: (34.5 * width) / 375 } : {}}
                        accessibilityLabel={"dateDayView"}
                        testID={"dateDayView"}
                    >
                        <View
                            style={[
                                weekStart.get("date") == challengeStartDate.get("date")
                                    ? CalendarStyles.activeTextView
                                    : CalendarStyles.inactiveTextView,
                            ]}
                            accessibilityLabel={"dayTextView"}
                            testID={"dayTextView"}
                        >
                            <Text
                                style={
                                    weekStart.get("date") == challengeStartDate.get("date")
                                        ? [
                                              CalendarStyles.activeText,
                                              { fontSize: (11 * width) / 375 },
                                          ]
                                        : [
                                              CalendarStyles.inactiveText,
                                              { fontSize: (11 * width) / 375 },
                                          ]
                                }
                                accessibilityLabel={"dayText"}
                                testID={"dayText"}
                            >
                                {day}
                            </Text>
                        </View>
                        <View
                            style={
                                weekStart.get("date") == challengeStartDate.get("date")
                                    ? [
                                          CalendarStyles.activeTextView,
                                          { marginTop: (11 * height) / 667 },
                                      ]
                                    : [
                                          CalendarStyles.inactiveTextView,
                                          { marginTop: (11 * height) / 667 },
                                      ]
                            }
                            accessibilityLabel={"dateTextView"}
                            testID={"dateTextView"}
                        >
                            <Text
                                style={
                                    weekStart.get("date") == challengeStartDate.get("date")
                                        ? [
                                              CalendarStyles.activeText,
                                              { fontSize: (12 * width) / 375 },
                                          ]
                                        : [
                                              CalendarStyles.inactiveText,
                                              { fontSize: (12 * width) / 375 },
                                          ]
                                }
                                accessibilityLabel={"dateText"}
                                testID={"dateText"}
                            >
                                {weekStart.get("date")}
                            </Text>
                        </View>
                    </View>
                );
                weekStart = moment(weekStart).add(1, "day");
            }
            returnArray.push(
                <View
                    style={CalendarStyles.mainView}
                    accessibilityLabel={"mainView"}
                    testID={"mainView"}
                >
                    <View style={CalendarStyles.dateDayMainView}>{dateDayArray}</View>
                </View>
            );
        } else if (this.props.calendarType == "WH") {
            let day = "";
            for (i = 0; i < 7; i++) {
                day = weekdayNumberToDayCharacter(weekStart);
                dotsArray.push(
                    i == 0 || i == 6 ? (
                        <View />
                    ) : i > 4 || moment(weekStart).isSameOrBefore(challengeStartDate) ? (
                        <View style={[CalendarStyles.inactiveLink]} />
                    ) : moment(weekStart).isAfter(todayDate) ? (
                        <View style={[CalendarStyles.futureLinkView]}>
                            <View style={[CalendarStyles.futureLinkDash]}></View>
                            <View style={[CalendarStyles.futureLinkBlank]}></View>
                            <View style={[CalendarStyles.futureLinkDash]}></View>
                            <View style={[CalendarStyles.futureLinkBlank]}></View>
                            <View style={[CalendarStyles.futureLinkDash]}></View>
                            <View style={[CalendarStyles.futureLinkBlank]}></View>
                            <View style={[CalendarStyles.futureLinkDash]}></View>
                            <View style={[CalendarStyles.futureLinkBlank]}></View>
                            <View style={[CalendarStyles.futureLinkLast]}></View>
                        </View>
                    ) : moment(weekStart).isBefore(todayDate) ? (
                        <View style={[CalendarStyles.pastLink]} />
                    ) : (
                        <View style={[CalendarStyles.pastLink]} />
                    )
                );
                dotsArray.push(
                    i > 4 || moment(weekStart).isBefore(challengeStartDate) ? (
                        <View style={[CalendarStyles.inactiveDot]} />
                    ) : moment(weekStart).isAfter(todayDate) ? (
                        <View style={[CalendarStyles.futureDot]} />
                    ) : moment(weekStart).isBefore(todayDate) &&
                      weekStart.get("date") != todayDate.get("date") ? (
                        <View style={[CalendarStyles.pastDot]} />
                    ) : (
                        <View style={[CalendarStyles.activeDot]} />
                    )
                );
                dateDayArray.push(
                    <View
                        style={i > 0 ? { marginLeft: (34.5 * width) / 375 } : {}}
                        accessibilityLabel={"dateDayView"}
                        testID={"dateDayView"}
                    >
                        <View
                            style={
                                i > 4 || moment(weekStart).isBefore(challengeStartDate)
                                    ? [CalendarStyles.inactiveTextView]
                                    : moment(weekStart).isAfter(todayDate)
                                    ? [CalendarStyles.futureTextView]
                                    : moment(weekStart).isBefore(todayDate) &&
                                      weekStart.get("date") != todayDate.get("date")
                                    ? [CalendarStyles.pastTextView]
                                    : [CalendarStyles.activeTextView]
                            }
                            accessibilityLabel={"dayTextView"}
                            testID={"dayTextView"}
                        >
                            <Text
                                style={
                                    weekStart.get("date") == todayDate.get("date")
                                        ? [
                                              CalendarStyles.activeText,
                                              { fontSize: (11 * width) / 375 },
                                          ]
                                        : [
                                              CalendarStyles.inactiveText,
                                              { fontSize: (11 * width) / 375 },
                                          ]
                                }
                                accessibilityLabel={"dayText"}
                                testID={"dayText"}
                            >
                                {day}
                            </Text>
                        </View>
                        <View
                            style={
                                i > 4 || moment(weekStart).isBefore(challengeStartDate)
                                    ? [
                                          CalendarStyles.inactiveTextView,
                                          { marginTop: (11 * height) / 667 },
                                      ]
                                    : moment(weekStart).isAfter(todayDate)
                                    ? [
                                          CalendarStyles.futureTextView,
                                          { marginTop: (11 * height) / 667 },
                                      ]
                                    : moment(weekStart).isBefore(todayDate) &&
                                      weekStart.get("date") != todayDate.get("date")
                                    ? [
                                          CalendarStyles.pastTextView,
                                          { marginTop: (11 * height) / 667 },
                                      ]
                                    : [
                                          CalendarStyles.activeTextView,
                                          { marginTop: (11 * height) / 667 },
                                      ]
                            }
                            accessibilityLabel={"dateTextView"}
                            testID={"dateTextView"}
                        >
                            <Text
                                style={
                                    weekStart.get("date") == todayDate.get("date")
                                        ? [
                                              CalendarStyles.activeText,
                                              { fontSize: (12 * width) / 375 },
                                          ]
                                        : [
                                              CalendarStyles.inactiveText,
                                              { fontSize: (12 * width) / 375 },
                                          ]
                                }
                                accessibilityLabel={"dateText"}
                                testID={"dateText"}
                            >
                                {weekStart.get("date")}
                            </Text>
                        </View>
                    </View>
                );
                weekStart = moment(weekStart).add(1, "day");
            }
            returnArray.push(
                <View
                    style={CalendarStyles.mainView}
                    accessibilityLabel={"mainView"}
                    testID={"mainView"}
                >
                    <View style={CalendarStyles.dotsView}>{dotsArray}</View>
                    <View style={CalendarStyles.dateDayMainView}>{dateDayArray}</View>
                </View>
            );
        } else if (this.props.calendarType == "WB") {
            let day = "";
            for (i = 0; i < 7; i++) {
                day = weekdayNumberToDayCharacter(weekStart);
                dotsArray.push(
                    i == 0 ? (
                        <View />
                    ) : i < 6 || moment(weekStart).isSameOrBefore(challengeStartDate) ? (
                        <View style={[CalendarStyles.inactiveLink]} />
                    ) : moment(weekStart).isAfter(todayDate) &&
                      weekStart.get("date") != todayDate.get("date") ? (
                        <View style={[CalendarStyles.futureLinkView]}>
                            <View style={[CalendarStyles.futureLinkDash]}></View>
                            <View style={[CalendarStyles.futureLinkBlank]}></View>
                            <View style={[CalendarStyles.futureLinkDash]}></View>
                            <View style={[CalendarStyles.futureLinkBlank]}></View>
                            <View style={[CalendarStyles.futureLinkDash]}></View>
                            <View style={[CalendarStyles.futureLinkBlank]}></View>
                            <View style={[CalendarStyles.futureLinkDash]}></View>
                            <View style={[CalendarStyles.futureLinkBlank]}></View>
                            <View style={[CalendarStyles.futureLinkLast]}></View>
                        </View>
                    ) : moment(weekStart).isBefore(todayDate) ? (
                        <View style={[CalendarStyles.pastLink]} />
                    ) : (
                        <View style={[CalendarStyles.inactiveLink]} />
                    )
                );
                dotsArray.push(
                    i < 5 || moment(weekStart).isBefore(challengeStartDate) ? (
                        <View style={[CalendarStyles.inactiveDot]} />
                    ) : moment(weekStart).isAfter(todayDate) ? (
                        <View style={[CalendarStyles.futureDot]} />
                    ) : moment(weekStart).isBefore(todayDate) &&
                      weekStart.get("date") != todayDate.get("date") ? (
                        <View style={[CalendarStyles.pastDot]} />
                    ) : (
                        <View style={[CalendarStyles.activeDot]} />
                    )
                );
                dateDayArray.push(
                    <View
                        style={i > 0 ? { marginLeft: (34.5 * width) / 375 } : {}}
                        accessibilityLabel={"dateDayView"}
                        testID={"dateDayView"}
                    >
                        <View
                            style={
                                i < 5 || moment(weekStart).isBefore(challengeStartDate)
                                    ? weekStart.get("date") == todayDate.get("date")
                                        ? [CalendarStyles.activeTextView]
                                        : [CalendarStyles.inactiveTextView]
                                    : moment(weekStart).isAfter(todayDate)
                                    ? [CalendarStyles.futureTextView]
                                    : moment(weekStart).isBefore(todayDate) &&
                                      weekStart.get("date") != todayDate.get("date")
                                    ? [CalendarStyles.pastTextView]
                                    : [CalendarStyles.activeTextView]
                            }
                            accessibilityLabel={"dayTextView"}
                            testID={"dayTextView"}
                        >
                            <Text
                                style={
                                    weekStart.get("date") == todayDate.get("date")
                                        ? [
                                              CalendarStyles.activeText,
                                              { fontSize: (11 * width) / 375 },
                                          ]
                                        : [
                                              CalendarStyles.inactiveText,
                                              { fontSize: (11 * width) / 375 },
                                          ]
                                }
                                accessibilityLabel={"dayText"}
                                testID={"dayText"}
                            >
                                {day}
                            </Text>
                        </View>
                        <View
                            style={
                                i < 5 || moment(weekStart).isBefore(challengeStartDate)
                                    ? weekStart.get("date") == todayDate.get("date")
                                        ? [
                                              CalendarStyles.activeTextView,
                                              { marginTop: (11 * height) / 667 },
                                          ]
                                        : [
                                              CalendarStyles.inactiveTextView,
                                              { marginTop: (11 * height) / 667 },
                                          ]
                                    : moment(weekStart).isAfter(todayDate)
                                    ? [
                                          CalendarStyles.futureTextView,
                                          { marginTop: (11 * height) / 667 },
                                      ]
                                    : moment(weekStart).isBefore(todayDate) &&
                                      weekStart.get("date") != todayDate.get("date")
                                    ? [
                                          CalendarStyles.pastTextView,
                                          { marginTop: (11 * height) / 667 },
                                      ]
                                    : [
                                          CalendarStyles.activeTextView,
                                          { marginTop: (11 * height) / 667 },
                                      ]
                            }
                            accessibilityLabel={"dateTextView"}
                            testID={"dateTextView"}
                        >
                            <Text
                                style={
                                    weekStart.get("date") == todayDate.get("date")
                                        ? [
                                              CalendarStyles.activeText,
                                              { fontSize: (12 * width) / 375 },
                                          ]
                                        : [
                                              CalendarStyles.inactiveText,
                                              { fontSize: (12 * width) / 375 },
                                          ]
                                }
                                accessibilityLabel={"dateText"}
                                testID={"dateText"}
                            >
                                {weekStart.get("date")}
                            </Text>
                        </View>
                    </View>
                );
                weekStart = moment(weekStart).add(1, "day");
            }
            returnArray.push(
                <View
                    style={CalendarStyles.mainView}
                    accessibilityLabel={"mainView"}
                    testID={"mainView"}
                >
                    <View style={CalendarStyles.dotsView}>{dotsArray}</View>
                    <View style={CalendarStyles.dateDayMainView}>{dateDayArray}</View>
                </View>
            );
        } else if (this.props.calendarType == "DPT") {
            let day = "";
            for (i = 0; i < 7; i++) {
                day = weekdayNumberToDayCharacter(weekStart);
                dateDayArray.push(
                    <View
                        style={i > 0 ? { marginLeft: (34.5 * width) / 375 } : {}}
                        accessibilityLabel={"dateDayView"}
                        testID={"dateDayView"}
                    >
                        <View
                            style={
                                moment(weekStart).isAfter(todayDate)
                                    ? [CalendarStyles.futureTextView]
                                    : moment(weekStart).isBefore(todayDate) &&
                                      weekStart.get("date") != todayDate.get("date")
                                    ? [CalendarStyles.pastTextView]
                                    : [CalendarStyles.activeTextView]
                            }
                            accessibilityLabel={"dayTextView"}
                            testID={"dayTextView"}
                        >
                            <Text
                                style={
                                    weekStart.get("date") == todayDate.get("date")
                                        ? [
                                              CalendarStyles.activeText,
                                              { fontSize: (11 * width) / 375 },
                                          ]
                                        : [
                                              CalendarStyles.inactiveText,
                                              { fontSize: (11 * width) / 375 },
                                          ]
                                }
                                accessibilityLabel={"dayText"}
                                testID={"dayText"}
                            >
                                {day}
                            </Text>
                        </View>
                        <View
                            style={
                                moment(weekStart).isAfter(todayDate)
                                    ? [
                                          CalendarStyles.futureTextView,
                                          { marginTop: (11 * height) / 667 },
                                      ]
                                    : moment(weekStart).isBefore(todayDate) &&
                                      weekStart.get("date") != todayDate.get("date")
                                    ? [
                                          CalendarStyles.pastTextView,
                                          { marginTop: (11 * height) / 667 },
                                      ]
                                    : [
                                          CalendarStyles.activeTextView,
                                          { marginTop: (11 * height) / 667 },
                                      ]
                            }
                            accessibilityLabel={"dateTextView"}
                            testID={"dateTextView"}
                        >
                            <Text
                                style={
                                    weekStart.get("date") == todayDate.get("date")
                                        ? [
                                              CalendarStyles.activeText,
                                              { fontSize: (12 * width) / 375 },
                                          ]
                                        : [
                                              CalendarStyles.inactiveText,
                                              { fontSize: (12 * width) / 375 },
                                          ]
                                }
                                accessibilityLabel={"dateText"}
                                testID={"dateText"}
                            >
                                {weekStart.get("date")}
                            </Text>
                        </View>
                    </View>
                );
                weekStart = moment(weekStart).add(1, "day");
            }
            returnArray.push(
                <View
                    style={CalendarStyles.mainView}
                    accessibilityLabel={"mainView"}
                    testID={"mainView"}
                >
                    <View style={CalendarStyles.dateDayMainView}>{dateDayArray}</View>
                </View>
            );
        } else if (this.props.calendarType == "PARTNER") {
            let day = "";
            weekStart = todayDate;
            for (i = 0; i < 7; i++) {
                day = weekdayNumberToDayCharacter(weekStart);
                dateDayArray.push(
                    <TouchableOpacity
                        style={i > 0 ? { marginLeft: (34.5 * width) / 375 } : {}}
                        accessibilityLabel={"dateDayView"}
                        testID={"dateDayView"}
                    >
                        <View
                            style={
                                weekStart.get("date") == todayDate.get("date")
                                    ? [CalendarStyles.activeTextView]
                                    : [CalendarStyles.pastTextView]
                            }
                            accessibilityLabel={"dayTextView"}
                            testID={"dayTextView"}
                        >
                            <Text
                                style={
                                    weekStart.get("date") == todayDate.get("date")
                                        ? [
                                              CalendarStyles.activeText,
                                              { fontSize: (11 * width) / 375 },
                                          ]
                                        : [
                                              CalendarStyles.inactiveText,
                                              { fontSize: (11 * width) / 375 },
                                          ]
                                }
                                accessibilityLabel={"dayText"}
                                testID={"dayText"}
                            >
                                {day}
                            </Text>
                        </View>
                        <View
                            style={
                                weekStart.get("date") == todayDate.get("date")
                                    ? [
                                          CalendarStyles.activeTextView,
                                          { marginTop: (11 * height) / 667 },
                                      ]
                                    : [
                                          CalendarStyles.pastTextView,
                                          { marginTop: (11 * height) / 667 },
                                      ]
                            }
                            accessibilityLabel={"dateTextView"}
                            testID={"dateTextView"}
                        >
                            <Text
                                style={
                                    weekStart.get("date") == todayDate.get("date")
                                        ? [
                                              CalendarStyles.activeText,
                                              { fontSize: (12 * width) / 375 },
                                          ]
                                        : [
                                              CalendarStyles.inactiveText,
                                              { fontSize: (12 * width) / 375 },
                                          ]
                                }
                                accessibilityLabel={"dateText"}
                                testID={"dateText"}
                            >
                                {weekStart.get("date")}
                            </Text>
                        </View>
                    </TouchableOpacity>
                );
                weekStart = moment(weekStart).add(1, "day");
            }
            returnArray.push(
                <View
                    style={CalendarStyles.mainView}
                    accessibilityLabel={"mainView"}
                    testID={"mainView"}
                >
                    <View style={CalendarStyles.dateDayMainView}>{dateDayArray}</View>
                </View>
            );
        } else if (this.props.calendarType == "NA") {
            let day = "";
            for (i = 0; i < 7; i++) {
                day = weekdayNumberToDayCharacter(weekStart);
                dateDayArray.push(
                    <View
                        style={i > 0 ? { marginLeft: (34.5 * width) / 375 } : {}}
                        accessibilityLabel={"dateDayView"}
                        testID={"dateDayView"}
                    >
                        <View
                            style={
                                weekStart.get("date") == todayDate.get("date")
                                    ? [CalendarStyles.activeTextView]
                                    : [CalendarStyles.pastTextView]
                            }
                            accessibilityLabel={"dayTextView"}
                            testID={"dayTextView"}
                        >
                            <Text
                                style={
                                    weekStart.get("date") == todayDate.get("date")
                                        ? [
                                              CalendarStyles.activeText,
                                              { fontSize: (11 * width) / 375 },
                                          ]
                                        : [
                                              CalendarStyles.inactiveText,
                                              { fontSize: (11 * width) / 375 },
                                          ]
                                }
                                accessibilityLabel={"dayText"}
                                testID={"dayText"}
                            >
                                {day}
                            </Text>
                        </View>
                        <View
                            style={
                                weekStart.get("date") == todayDate.get("date")
                                    ? [
                                          CalendarStyles.activeTextView,
                                          { marginTop: (11 * height) / 667 },
                                      ]
                                    : [
                                          CalendarStyles.pastTextView,
                                          { marginTop: (11 * height) / 667 },
                                      ]
                            }
                            accessibilityLabel={"dateTextView"}
                            testID={"dateTextView"}
                        >
                            <Text
                                style={
                                    weekStart.get("date") == todayDate.get("date")
                                        ? [
                                              CalendarStyles.activeText,
                                              { fontSize: (12 * width) / 375 },
                                          ]
                                        : [
                                              CalendarStyles.inactiveText,
                                              { fontSize: (12 * width) / 375 },
                                          ]
                                }
                                accessibilityLabel={"dateText"}
                                testID={"dateText"}
                            >
                                {weekStart.get("date")}
                            </Text>
                        </View>
                    </View>
                );
                weekStart = moment(weekStart).add(1, "day");
            }
            returnArray.push(
                <View
                    style={CalendarStyles.mainView}
                    accessibilityLabel={"mainView"}
                    testID={"mainView"}
                >
                    <View style={CalendarStyles.dateDayMainView}>{dateDayArray}</View>
                </View>
            );
        }

        return returnArray;
    }

    render() {
        return <View>{this.drawCalendar()}</View>;
    }
}

export default WeeklyCalendarStrip;
