import moment from "moment";
import Numeral from "numeral";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, TouchableOpacity, ScrollView } from "react-native";

import * as navigationConstant from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import { TrainSchedulePopUp } from "@components/Common";
import { CircularCenterImageView } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import HeaderLabel from "@components/Label/HeaderLabel";
import DatePicker from "@components/Pickers/DatePicker";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";

import {
    MEDIUM_GREY,
    YELLOW,
    LIGHT_YELLOW,
    FADE_GREY,
    ROYAL_BLUE,
    WHITE,
    GREY,
    LIGHT_BLACK,
    BLACK,
} from "@constants/colors";
import { getDateRangeDefaultData } from "@constants/datePickerDefaultData";
import { ERL_BUY_TICKETS } from "@constants/dateScenarios";
import {
    ADULT,
    CHECK_TRAIN_SCHEDULE,
    CHILD,
    CHILDREN_BELOW_THE_AGE,
    CURRENCY,
    FA_PARTNER_KLIA_BOOKING_DETAILS,
    HOW_MANY_TICKETS_WOULD,
    KLIA_EKSPRES,
    SELECT_TRAVEL_DATE,
    WHAT_TYPE_TRIP_YOU,
} from "@constants/strings";

import { getStartDate, getEndDate, getDefaultDate } from "@utils/dateRange";

import Assets from "@assets";

// -----------------------
// GET UI
// -----------------------

const Header = ({ onBackPress, headerTitle }) => {
    return (
        <HeaderLayout
            horizontalPaddingMode="custom"
            horizontalPaddingCustomLeftValue={24}
            horizontalPaddingCustomRightValue={24}
            headerLeftElement={<HeaderBackButton onPress={onBackPress} />}
            headerCenterElement={<HeaderLabel>{headerTitle}</HeaderLabel>}
        />
    );
};

const LayoutBlock = ({ title, description, children }) => {
    return (
        <>
            <View style={Styles.titleContainer}>
                <Typo
                    fontSize={20}
                    fontStyle="normal"
                    letterSpacing={0}
                    lineHeight={28}
                    textAlign="left"
                    text={title}
                />
            </View>

            {description && (
                <View style={Styles.descriptionContainer}>
                    <Typo
                        fontSize={12}
                        fontWeight="300"
                        fontStyle="normal"
                        letterSpacing={0}
                        lineHeight={18}
                        textAlign="left"
                        color={FADE_GREY}
                        text={description}
                    />
                </View>
            )}
            <View style={Styles.blockChildContainer}>{children}</View>
        </>
    );
};

const StepperCounter = ({ title, value, onIncreasePress, onDecreasePress }) => {
    return (
        <View style={Styles.stepperContainer}>
            <View style={Styles.increaseButtonView}>
                <CircularCenterImageView
                    source={Assets.icon32BlackMinus}
                    click={onDecreasePress}
                    size={50}
                    width={21}
                    height={2}
                />
            </View>
            <View style={Styles.increaseButtonView}>
                <Typo
                    fontSize={14}
                    fontWeight="100"
                    fontStyle="normal"
                    letterSpacing={0}
                    lineHeight={18}
                    text={title} //{Strings.ADULT}
                ></Typo>
                <View style={Styles.countTextView}>
                    <Typo
                        fontSize={32}
                        fontWeight="bold"
                        fontStyle="normal"
                        letterSpacing={0}
                        lineHeight={32}
                        text={value}
                    ></Typo>
                </View>
            </View>
            <View style={Styles.increaseButtonView}>
                <CircularCenterImageView
                    source={Assets.icon32BlackAdd}
                    click={onIncreasePress}
                    size={50}
                    width={21}
                    height={21}
                />
            </View>
        </View>
    );
};

const CustomRadioButton = ({ selected, title, subtitle, notes, onPress, index }) => {
    return (
        <TouchableOpacity onPress={() => onPress(index)}>
            <View
                style={{
                    flexDirection: "row",
                    borderWidth: 1,
                    borderColor: GREY,
                    backgroundColor: WHITE,
                    borderRadius: 8,
                    paddingVertical: 16,
                    paddingHorizontal: 20,
                    alignItems: "center",
                    marginTop: 16,
                }}
            >
                <View style={{}}>
                    <View
                        style={{
                            width: 20,
                            height: 20,
                            borderRadius: 10,
                            borderWidth: 1,
                            borderColor: "black",
                            padding: 2,
                            backgroundColor: WHITE,
                        }}
                    >
                        <View
                            style={{
                                width: "100%",
                                height: "100%",
                                borderRadius: 10,
                                backgroundColor: selected ? FADE_GREY : WHITE,
                            }}
                        ></View>
                    </View>
                </View>

                <View
                    style={{
                        flex: 1,
                        flexDirection: "column",
                        paddingLeft: 12,
                        // borderWidth: 1,
                        // borderColor: "blue",
                    }}
                >
                    <Typo
                        fontSize={14}
                        fontWeight="300"
                        fontStyle="normal"
                        letterSpacing={0}
                        text={title}
                        textAlign="left"
                    />
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            paddingTop: 4,
                        }}
                    >
                        <Typo
                            fontSize={16}
                            lineHeight={18}
                            fontWeight="600"
                            fontStyle="normal"
                            letterSpacing={0}
                            text={subtitle}
                            textAlign="left"
                        />
                        <View
                            style={{
                                paddingLeft: 8,
                            }}
                        >
                            <Typo
                                fontSize={12}
                                fontWeight="300"
                                fontStyle="normal"
                                letterSpacing={0}
                                text={notes}
                                textAlign="left"
                                color={FADE_GREY}
                                style={{ textDecorationLine: "line-through" }}
                                // textDecorationStyle="solid"
                            />
                        </View>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

class SelectTravelDateScreen extends Component {
    constructor(props) {
        super(props);

        this.ticketsFaresStation = props?.route?.params?.kliaInitData?.ticketsFaresStation;
        this.ticketCodes = props?.route?.params?.kliaInitData?.ticketCodes;
        this.state = {
            numOfAdult: 1,
            numOfChild: 0,
            selectedDate: null,
            showDatePicker: false,
            singleAmount: 0,
            singleNormalAmount: 0,
            returnAmount: 0,
            returnNormalAmount: 0,
            selectedTripType: null,
            showTrainSchedule: false,
            validDateRangeData: getDateRangeDefaultData(ERL_BUY_TICKETS),
        };

        this.returnAdultPriceInfo = this.ticketsFaresStation.find((item) => {
            return item.ticketCode == this.ticketCodes.klaiAdultReturn;
        });
        this.returnChildPriceInfo = this.ticketsFaresStation.find((item) => {
            return item.ticketCode == this.ticketCodes.klaiChildReturn;
        });
        this.singleAdultPriceInfo = this.ticketsFaresStation.find((item) => {
            return item.ticketCode == this.ticketCodes.klaiAdultSingle;
        });
        this.singleChildPriceInfo = this.ticketsFaresStation.find((item) => {
            return item.ticketCode == this.ticketCodes.klaiChildSingle;
        });

        console.log("SelectTravelDateScreen:----------", props);
    }

    componentDidMount() {
        this.focusSubscription = this.props.navigation.addListener("willFocus", () => {
            // do something here or remove it later
        });
        this.blurSubscription = this.props.navigation.addListener("willBlur", () => {
            // do something here or remove it later
        });
        this.updatePrice();
    }

    componentWillUnmount() {
        this.focusSubscription();
        this.blurSubscription();
    }

    // -----------------------
    // EVENT HANDLER
    // -----------------------

    onBackPress = () => {
        this.props.navigation.goBack();
    };

    onClosePress = () => {};

    onDonePress = () => {
        const params = this.prepareNavParams();
        this.props.navigation.navigate(navigationConstant.KLIA_EKSPRESS_STACK, {
            screen: "TicketBookingSummaryScreen",
            params: params,
        });
    };

    onSelectDatePress = () => {
        console.log("showDatePicker");
        this.setState({ showDatePicker: true });
    };

    showSchedule = () => {
        console.log("showSchedule");
        this.setState({ showTrainSchedule: true });
        //TrainSchedulePopUp
    };

    onDecreaseAdultPress = () => {
        console.log("onDecreaseAdultClick");
        let tempNum = this.state.numOfAdult;

        if (tempNum <= 1) {
            return;
        }

        tempNum--;
        this.setState({ numOfAdult: tempNum }, () => {
            this.updatePrice();
        });
    };

    onIncreaseAdultPress = () => {
        console.log("onEncreaseAdultClick");

        if (!this.validateTotalTicket()) {
            return;
        }

        let tempNum = this.state.numOfAdult;

        tempNum++;
        this.setState({ numOfAdult: tempNum }, () => {
            this.updatePrice();
        });
    };

    onDecreaseChildPress = () => {
        console.log("onDecreaseChildClick");
        let tempNum = this.state.numOfChild;

        if (tempNum <= 0) {
            return;
        }

        tempNum--;
        this.setState({ numOfChild: tempNum }, () => {
            this.updatePrice();
        });
    };

    onIncreaseChildPress = () => {
        console.log("onEncreaseChildClick");

        if (!this.validateTotalTicket()) {
            return;
        }

        let tempNum = this.state.numOfChild;

        tempNum++;
        this.setState({ numOfChild: tempNum }, () => {
            this.updatePrice();
        });
    };

    onDateCancelPress = () => {
        console.log("onDateCancelPress");
        this.setState({ showDatePicker: false });
    };

    onDateDonePress = (val) => {
        console.log("onDateDonePress", val, val instanceof Date);
        this.setState({ showDatePicker: false, selectedDate: val });
    };

    onSingleTripPress = (index) => {
        this.setState({ selectedTripType: "single" });
    };
    onReturnTripPress = (index) => {
        this.setState({ selectedTripType: "return" });
    };

    // -----------------------
    // API CALL
    // -----------------------

    // -----------------------
    // OTHER PROCESS
    // -----------------------

    validateTotalTicket = () => {
        const maxTicket = 10;
        const totalTicket = this.state.numOfAdult + this.state.numOfChild;
        let isTotalTicketValid = true;
        if (totalTicket >= maxTicket) {
            isTotalTicketValid = false;
        }

        return isTotalTicketValid;
    };

    getValidation = () => {
        if (!this.state.selectedDate) {
            return false;
        }

        if (this.state.numOfAdult === 0) {
            return false;
        }

        if (!this.state.selectedTripType) {
            return false;
        }

        return true;
    };

    updatePrice = () => {
        console.log("updatePrice");
        const { numOfAdult, numOfChild } = this.state;
        const {
            returnAdultPriceInfo,
            returnChildPriceInfo,
            singleAdultPriceInfo,
            singleChildPriceInfo,
        } = this;

        const singleAmount =
            singleAdultPriceInfo.tktmbbSellingPrice * numOfAdult +
            singleChildPriceInfo.tktmbbSellingPrice * numOfChild;
        const singleNormalAmount =
            singleAdultPriceInfo.tktmbbNetPrice * numOfAdult +
            singleChildPriceInfo.tktmbbNetPrice * numOfChild;

        const returnAmount =
            returnAdultPriceInfo.tktmbbSellingPrice * numOfAdult +
            returnChildPriceInfo.tktmbbSellingPrice * numOfChild;
        const returnNormalAmount =
            returnAdultPriceInfo.tktmbbNetPrice * numOfAdult +
            returnChildPriceInfo.tktmbbNetPrice * numOfChild;

        this.setState({ singleAmount, singleNormalAmount, returnAmount, returnNormalAmount });
    };

    prepareNavParams = () => {
        const {
            numOfAdult,
            numOfChild,
            selectedDate,
            singleAmount,
            singleNormalAmount,
            returnAmount,
            returnNormalAmount,
            selectedTripType,
        } = this.state;

        const {
            returnAdultPriceInfo,
            returnChildPriceInfo,
            singleAdultPriceInfo,
            singleChildPriceInfo,
        } = this;

        let amount = selectedTripType === "single" ? singleAmount : returnAmount;
        let normalAmount = selectedTripType === "single" ? singleNormalAmount : returnNormalAmount;
        let adultTicketCode =
            selectedTripType === "single"
                ? singleAdultPriceInfo.ticketCode
                : returnAdultPriceInfo.ticketCode;
        let childTicketCode =
            selectedTripType === "single"
                ? singleChildPriceInfo.ticketCode
                : returnChildPriceInfo.ticketCode;

        let navParam = {
            ...this.props.route.params,
            numOfAdult,
            numOfChild,
            adultTicketCode,
            childTicketCode,
            selectedDate,
            amount,
            normalAmount,
            selectedTripType,
        };

        return navParam;
    };

    getCurrencyFormat = (val) => {
        return `${CURRENCY}${Numeral(val).format("0,0.00")}`;
    };

    render() {
        const {
            singleAmount,
            singleNormalAmount,
            returnAmount,
            returnNormalAmount,
            selectedTripType,
        } = this.state;
        return (
            <>
                <ScreenContainer
                    backgroundType="color"
                    backgroundColor={MEDIUM_GREY}
                    showOverlay={this.state.showDatePicker}
                    analyticScreenName={FA_PARTNER_KLIA_BOOKING_DETAILS}
                >
                    <ScreenLayout
                        header={
                            <Header onBackPress={this.onBackPress} headerTitle={KLIA_EKSPRES} />
                        }
                        paddingHorizontal={0}
                    >
                        <ScrollView>
                            <View style={Styles.mainContainer}>
                                {/* Select date */}
                                <LayoutBlock
                                    title={SELECT_TRAVEL_DATE}
                                    description="Tiket are valid for 31 days from selected travel date."
                                >
                                    <View style={Styles.dateContainer}>
                                        <TouchableOpacity onPress={this.onSelectDatePress}>
                                            <View pointerEvents="none">
                                                <TextInput
                                                    accessibilityLabel={"Enter date"}
                                                    maxLength={30}
                                                    isValidate={true}
                                                    isValid={true}
                                                    // errorMessage={errorMessage}
                                                    value={
                                                        this.state.selectedDate
                                                            ? moment(
                                                                  this.state.selectedDate
                                                              ).format("DD MMM YYYY")
                                                            : null
                                                    }
                                                    placeholder={"Enter date"}
                                                    editable={false}
                                                />
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={Styles.scheduleLinkContainer}>
                                        <TouchableOpacity onPress={this.showSchedule}>
                                            <Typo
                                                fontSize={14}
                                                fontWeight="600"
                                                fontStyle="normal"
                                                letterSpacing={0}
                                                lineHeight={14}
                                                textAlign="left"
                                                color={ROYAL_BLUE}
                                                text={CHECK_TRAIN_SCHEDULE}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </LayoutBlock>
                                {/* Ticket counter */}
                                <LayoutBlock
                                    title={HOW_MANY_TICKETS_WOULD}
                                    description={CHILDREN_BELOW_THE_AGE}
                                >
                                    <View style={{ paddingTop: 12 }}>
                                        <StepperCounter
                                            title={ADULT}
                                            value={this.state.numOfAdult}
                                            onDecreasePress={this.onDecreaseAdultPress}
                                            onIncreasePress={this.onIncreaseAdultPress}
                                        />
                                    </View>
                                    <View style={{ paddingTop: 26 }}>
                                        <StepperCounter
                                            title={CHILD}
                                            value={this.state.numOfChild}
                                            onDecreasePress={this.onDecreaseChildPress}
                                            onIncreasePress={this.onIncreaseChildPress}
                                        />
                                    </View>
                                </LayoutBlock>
                                {/* Select type */}
                                <LayoutBlock title={WHAT_TYPE_TRIP_YOU}>
                                    <CustomRadioButton
                                        title={"Single Trip"}
                                        subtitle={this.getCurrencyFormat(singleAmount)}
                                        notes={this.getCurrencyFormat(singleNormalAmount)}
                                        onPress={this.onSingleTripPress}
                                        index={0}
                                        selected={selectedTripType === "single" ? true : false}
                                    />
                                    <CustomRadioButton
                                        title="Return Trip"
                                        subtitle={this.getCurrencyFormat(returnAmount)}
                                        notes={this.getCurrencyFormat(returnNormalAmount)}
                                        onPress={this.onReturnTripPress}
                                        index={1}
                                        selected={selectedTripType === "return" ? true : false}
                                    />
                                </LayoutBlock>
                            </View>
                        </ScrollView>
                        <FixedActionContainer>
                            <ActionButton
                                height={48}
                                fullWidth
                                backgroundColor={this.getValidation() ? YELLOW : LIGHT_YELLOW}
                                borderRadius={24}
                                componentCenter={
                                    <Typo
                                        fontSize={14}
                                        fontWeight="600"
                                        fontStyle="normal"
                                        letterSpacing={0}
                                        lineHeight={18}
                                        text="Continue"
                                        color={this.getValidation() ? BLACK : LIGHT_BLACK}
                                    />
                                }
                                onPress={this.onDonePress}
                                disabled={!this.getValidation()}
                            />
                        </FixedActionContainer>
                    </ScreenLayout>
                    <TrainSchedulePopUp
                        visible={this.state.showTrainSchedule}
                        onClose={() => this.setState({ showTrainSchedule: false })}
                    />
                </ScreenContainer>

                {this.state.showDatePicker && (
                    <DatePicker
                        showDatePicker={true}
                        onCancelButtonPressed={this.onDateCancelPress}
                        onDoneButtonPressed={this.onDateDonePress}
                        dateRangeStartDate={getStartDate(this.state.validDateRangeData)}
                        dateRangeEndDate={getEndDate(this.state.validDateRangeData)}
                        defaultSelectedDate={
                            this.state.selectedDate
                                ? getDefaultDate(
                                      this.state.validDateRangeData,
                                      moment(this.state.selectedDate)
                                  )
                                : getDefaultDate(this.state.validDateRangeData)
                        }
                    />
                )}
            </>
        );
    }
}

SelectTravelDateScreen.propTypes = {
    navigation: PropTypes.object.isRequired,
};

SelectTravelDateScreen.defaultProps = {
    navigation: {},
};

export default SelectTravelDateScreen;

const Styles = {
    mainContainer: {
        flex: 1,
        // justifyContent: "flex-start",
        paddingHorizontal: 36,
        paddingBottom: 40,
    },
    titleContainer: {
        alignItems: "flex-start",
        paddingTop: 40,
    },
    descriptionContainer: { paddingTop: 4 },
    blockChildContainer: {
        paddingTop: 8,
    },
    dateContainer: { paddingTop: 16 },
    scheduleLinkContainer: { paddingTop: 16 },
    stepperContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    footerContainer: {
        width: "100%",
        flexDirection: "column",
        justifyContent: "flex-end",
    },
};
