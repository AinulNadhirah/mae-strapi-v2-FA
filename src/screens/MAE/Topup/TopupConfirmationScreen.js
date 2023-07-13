import moment from "moment";
import Numeral from "numeral";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, Text, ScrollView, Dimensions } from "react-native";
import DeviceInfo from "react-native-device-info";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import { CircularLogoImage } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import HeaderLabel from "@components/Label/HeaderLabel";
import DatePicker from "@components/Pickers/DatePicker";
import Typo from "@components/Text";
import AccountList from "@components/Transfers/TransferConfirmationAccountList";
import Amount from "@components/Transfers/TransferConfirmationAmount";
import TransferDetailLabel from "@components/Transfers/TransferConfirmationDetailLabel";
import TransferDetailValue from "@components/Transfers/TransferConfirmationDetailValue";
import TransferDetailLayout from "@components/Transfers/TransferDetailLayout";

import { withModelContext } from "@context";

import { bankingGetDataMayaM2u } from "@services";

import { MEDIUM_GREY, BLACK } from "@constants/colors";
import { YELLOW } from "@constants/colors";
import * as Strings from "@constants/strings";

import * as DataModel from "@utils/dataModel";
import { formateAccountNumber, getDeviceRSAInformation } from "@utils/dataModel/utility";

import * as TopupController from "./TopupController";

("use strict");

export const { width, height } = Dimensions.get("window");
let confirmDateEditFlow = 0;
const todayDateCode = "00000000";

class TopupConfirmationScreen extends Component {
    static propTypes = {
        getModel: PropTypes.func,
        navigation: PropTypes.object,
        resetModel: PropTypes.func,
        route: PropTypes.object,
    };

    constructor(props) {
        console.log("TopupConfirmationScreen:", props.route.params);
        super(props);
        this.state = {
            disabled: false,
            notesText: "",
            accounts: [],
            transferAmount: props.route.params.amount,
            data: props.route.params.data,
            title: "MAE",
            subTitle: props.route.params?.data?.acctNo.substring(0, 12),
            displayDate: "Today",
            showTransferDateView: false,
            selectedAccount: null,
            select: { start: 0, end: 0 },
            showDatePicker: false,
            showScrollPickerView: false,
            selectedIndex: 0, // scrollViewSelectedIndex
            dateRangeStart: new Date(),
            dateRangeEnd: new Date(),
            defaultSelectedDate: new Date(),
            selectedStartDate: new Date(),
            formatedStartDate: "", // toshowonscreen
            formatedEndDate: "", // toshowonscreen
            effectiveDate: todayDateCode, // to use in api call
            doneBtnEnabled: true,
        };
    }

    componentDidMount() {
        this.getAccountsList();
    }

    /* API CALL */

    getAccountsList = () => {
        console.log("getAccountsList");
        const subUrl = "/summary";
        const params = "?type=A";

        this.newAccountList = [];

        bankingGetDataMayaM2u(subUrl + params, false)
            .then((response) => {
                const result = response.data.result;

                if (result) {
                    const maeAccount = this.state.data.acctNo.toString().substring(0, 12);
                    const accountListingArray =
                        result && result.accountListings ? result.accountListings : null;
                    accountListingArray.forEach((element) => {
                        const accountNumber = element
                            ? element.number.toString().substring(0, 12)
                            : null;
                        if (accountNumber != maeAccount) this.newAccountList.push(element);
                    });
                }

                this.doPreSelectAccount();
            })
            .catch((error) => {
                this.doPreSelectAccount();
                console.log("getAccountsList:error", error);
            });
    };

    doPreSelectAccount = () => {
        let selectedAccount;
        console.log("doPreSelectAccount");
        console.log("newAccountList:", this.newAccountList);
        selectedAccount = this.newAccountList[0];
        selectedAccount.selected = true;
        this.setState({ accounts: this.newAccountList, selectedAccount: selectedAccount });
    };

    /* EVENT HANDLERS */

    onBackPress = () => {
        this.props.navigation.goBack();
    };

    onClosePress = () => {
        console.log("onClosePress");
        TopupController.onTopupModuleClosePress(this);
    };

    // scrollPicker event
    scrollPickerDonePress = (value, index) => {
        const selected = value.const;
        if (selected === "ONE_OFF_TRANSFER") {
            this.setState({
                showScrollPickerView: false,
                showTransferDateView: false,
                selectedIndex: index,
                formatedStartDate: "",
                formatedEndDate: "",
            });
        } else if (selected === "RECURRING") {
            let tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const startDate = DataModel.getFormatedTodaysMoments("DD MMM YYYY");
            const endDate = DataModel.getFormatedDateMoments(tomorrow, "DD MMM YYYY");
            this.setState({
                showScrollPickerView: false,
                showTransferDateView: true,
                selectedIndex: index,
                formatedStartDate: startDate,
                formatedEndDate: endDate,
            });
        }
    };

    scrollPickerCancelPress = () => {
        this.setState({
            showScrollPickerView: false,
        });
    };

    // Calendar Event
    onDateDonePress = (date) => {
        // TODO: need to understand this!!!
        console.log("  [onDateDonePress] ", date);
        let formatedDate = DataModel.getFormatedDateMoments(date, "DD MMM YYYY");
        // console.log("  [formatedDate] ", formatedDate);
        const today = new Date();
        let nextDay = new Date();
        let effectiveDate = todayDateCode;

        const month =
            date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : `${date.getMonth() + 1}`;
        const days = date.getDate() + 1 < 10 ? `0${date.getDate() + 1}` : `${date.getDate()}`;
        const year = date.getFullYear().toString();

        const todayInt = year + month + days;

        if (
            DataModel.getFormatedDateMoments(today, "DD MMM YYYY") ===
            DataModel.getFormatedDateMoments(date, "DD MMM YYYY")
        ) {
            formatedDate = "Today";
            effectiveDate = todayDateCode;
        } else {
            effectiveDate = todayInt;
        }

        const nextDayMoments = moment(date).add(1, "days");
        nextDay = nextDayMoments.toDate();
        //nextDay.setDate(date.getDate() + 1);

        let formatedDateNextDay;

        if (confirmDateEditFlow === 1) {
            formatedDateNextDay = DataModel.getFormatedDateMoments(date, "DD MMM YYYY");
            this.setState({
                formatedEndDate: formatedDate,
            });
        } else {
            // setStartDate
            formatedDateNextDay = DataModel.getFormatedDateMoments(nextDay, "DD MMM YYYY");
        }

        if (date instanceof Date) {
            if (confirmDateEditFlow === 1) {
                this.setState({
                    formatedEndDate: formatedDate,
                });
            } else {
                this.setState({
                    dateText: date.toISOString().split("T")[0],
                    date: date,
                    displayDate: formatedDate,
                    selectedStartDate: date,
                    formatedStartDate: formatedDate,
                    formatedEndDate: formatedDateNextDay,
                    effectiveDate: effectiveDate,
                });
            }
        }
        this.onDateCancelPress();
    };

    onDateCancelPress = () => {
        this.setState({
            showDatePicker: false,
        });
    };

    onEditStartDate = () => {
        console.log("onEditStartDate ");
        confirmDateEditFlow = 0;

        const startDate = new Date();
        const maxDate = new Date();

        maxDate.setDate(maxDate.getDate() + 28);

        this.setState({
            dateRangeStart: startDate,
            dateRangeEnd: maxDate,
            defaultSelectedDate: startDate,
        });
        this.onOpenNewCalenderFlow();
    };

    onEditEndDate = () => {
        console.log("onEditEndDate ");
        confirmDateEditFlow = 1;

        const startDate = this.state.selectedStartDate;
        const maxDate = new Date();

        maxDate.setDate(maxDate.getDate() + 28);

        this.setState({
            dateRangeStart: startDate,
            dateRangeEnd: maxDate,
            defaultSelectedDate: startDate,
        });
        this.onOpenNewCalenderFlow();
    };

    // Calendar Related function
    onDateEditClick = () => {
        this.onSetCalenderDates();
        this.setState({
            showDatePicker: true,
            // showScrollPickerView: true,
        });
    };

    onSetCalenderDates = () => {
        console.log("_onSetCalenderDates ");
        const startDate = new Date();
        const maxDate = new Date();

        maxDate.setDate(maxDate.getDate() + 28);

        console.log("startDate ", startDate);
        console.log("maxDate ", maxDate);

        this.setState({
            dateRangeStart: startDate,
            dateRangeEnd: maxDate,
            defaultSelectedDate: startDate,
        });
    };

    onOpenNewCalenderFlow = () => {
        console.log("onOpenNewCalenderFlow");
        this.setState({
            showDatePicker: true,
        });
    };

    onAccountListClick = (item) => {
        console.log("onAccountListClick**:", item);
        const itemType =
            item.type === "C" || item.type === "J" || item.type === "R" ? "card" : "account";
        if (parseFloat(item.acctBalance) <= 0.0 && itemType == "account") {
            // TODO: show zero error
        } else {
            let tempArray = this.state.accounts;
            for (let i = 0; i < tempArray.length; i++) {
                if (tempArray[i].number === item.number) {
                    console.log("selectedAccount Obj ==> ", tempArray[i]);
                    tempArray[i].selected = true;
                } else {
                    tempArray[i].selected = false;
                }
            }
            this.setState({ accounts: tempArray, selectedAccount: item });
        }
    };

    onConfirmClick = () => {
        //TODO: prevent multiple triggering button, thus proceed ahead only if Validation successful
        if (this.state.disabled || !this.state.selectedAccount) {
            return;
        }
        this.setState({ disabled: true, doneBtnEnabled: false });

        const selectedAccount = this.state.selectedAccount;
        const validateAccount = selectedAccount.number.length >= 1;
        console.log("validateAccount:", validateAccount);

        let m2uUserName = null;
        const userObj = this.props.getModel("user");
        m2uUserName = userObj.username;
        console.log("m2uUserName: " + m2uUserName);

        const deviceInfo = this.props.getModel("device");
        const mobileSDK = getDeviceRSAInformation(deviceInfo.deviceInformation, DeviceInfo);

        // Request object
        const params = JSON.stringify({
            customerName: m2uUserName,
            effectiveDate: this.state.effectiveDate,
            fromAccount: selectedAccount.number.substring(0, 12),
            fromAccountCode: selectedAccount.code,
            paymentRef: "MAE CASA",
            toAccount: this.state.data.acctNo.substring(0, 12),
            toAccountCode: this.state.data.acctCode,
            transferAmount: parseFloat(this.state.transferAmount),
            mbbbankCode: "0000",
            transferType: "OWN_ACCT",
            mobileSDKData: mobileSDK,
        });
        TopupController.callETBFunding(this, params);
    };

    onEditAmount = () => {
        this.props.navigation.goBack();
    };

    /* OTHERS */

    /* UI */

    render() {
        const { title, subTitle } = this.state;
        return (
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                showOverlay={this.state.showDatePicker}
            >
                <React.Fragment>
                    <ScreenLayout
                        scrollable={true}
                        paddingHorizontal={0}
                        paddingBottom={0}
                        useSafeArea
                        header={
                            <HeaderLayout
                                headerLeftElement={<HeaderBackButton onPress={this.onBackPress} />}
                                headerRightElement={
                                    <HeaderCloseButton onPress={this.onClosePress} />
                                }
                                headerCenterElement={
                                    <HeaderLabel>
                                        <Text>Confirmation</Text>
                                    </HeaderLabel>
                                }
                            />
                        }
                    >
                        <React.Fragment>
                            <ScrollView>
                                <View style={styles.blockCls}>
                                    <View style={styles.logo}>
                                        <CircularLogoImage
                                            source={{
                                                image: "icMAE.png",
                                                imageName: "icMAE.png",
                                                imageUrl: "icMAE.png",
                                                shortName: "MAE",
                                                type: true,
                                            }}
                                            isLocal={false}
                                        />
                                    </View>
                                    <View>
                                        <View style={styles.logoTitle}>
                                            <Typo
                                                fontSize={14}
                                                fontWeight="600"
                                                fontStyle="normal"
                                                letterSpacing={0}
                                                lineHeight={18}
                                                color="#000000"
                                                text={title}
                                            />
                                        </View>
                                        <View style={styles.logoSubTitle}>
                                            <Typo
                                                fontSize={14}
                                                fontWeight="normal"
                                                fontStyle="normal"
                                                letterSpacing={0}
                                                lineHeight={20}
                                                color="#000000"
                                                text={formateAccountNumber(subTitle, 12)}
                                            />
                                        </View>
                                    </View>
                                    <Amount
                                        value={Numeral(this.state.transferAmount).format("0,0.00")}
                                        onPress={this.onEditAmount}
                                    />

                                    {/* transaction details */}
                                    <TransferDetailLayout
                                        left={<TransferDetailLabel value={Strings.DATE} />}
                                        right={
                                            <TransferDetailValue value={this.state.displayDate} />
                                        }
                                    />

                                    {this.state.showTransferDateView && (
                                        <React.Fragment>
                                            <TransferDetailLayout
                                                left={
                                                    <TransferDetailLabel
                                                        value={Strings.START_DATE}
                                                    />
                                                }
                                                right={
                                                    <TransferDetailValue
                                                        value={this.state.formatedStartDate}
                                                        onPress={this.onEditStartDate}
                                                    />
                                                }
                                            />
                                            <TransferDetailLayout
                                                left={
                                                    <TransferDetailLabel value={Strings.END_DATE} />
                                                }
                                                right={
                                                    <TransferDetailValue
                                                        value={this.state.formatedEndDate}
                                                        onPress={this.onEditEndDate}
                                                    />
                                                }
                                            />
                                        </React.Fragment>
                                    )}

                                    <View style={styles.lineConfirm} />

                                    {/* AccountList */}
                                    <View style={styles.accountListingContainer}>
                                        <AccountList
                                            title={Strings.PAY_FROM}
                                            data={this.state.accounts}
                                            onPress={this.onAccountListClick}
                                            extraData={this.state}
                                            paddingLeft={24}
                                        />
                                    </View>
                                </View>
                            </ScrollView>
                        </React.Fragment>
                    </ScreenLayout>
                    <View style={styles.footerContainer}>
                        <ActionButton
                            height={48}
                            fullWidth
                            backgroundColor={this.state.doneBtnEnabled ? YELLOW : "#ffde0070"}
                            borderRadius={24}
                            componentCenter={
                                <Typo
                                    fontSize={14}
                                    fontWeight="600"
                                    fontStyle="normal"
                                    letterSpacing={0}
                                    lineHeight={18}
                                    text="Top up Now"
                                    color={this.state.doneBtnEnabled ? "#000000" : "#00000070"}
                                />
                            }
                            onPress={this.onConfirmClick}
                            disabled={!this.state.doneBtnEnabled}
                        />
                    </View>

                    <DatePicker
                        showDatePicker={this.state.showDatePicker}
                        onCancelButtonPressed={this.onDateCancelPress}
                        onDoneButtonPressed={this.onDateDonePress}
                        dateRangeStartDate={this.state.dateRangeStart}
                        dateRangeEndDate={this.state.dateRangeEnd}
                        defaultSelectedDate={this.state.defaultSelectedDate}
                    />
                </React.Fragment>
            </ScreenContainer>
        );
    }
}
export default withModelContext(TopupConfirmationScreen);

const styles = {
    container: {
        flex: 1,
        alignItems: "flex-start",
    },
    scrollView: {
        flexGrow: 1,
        justifyContent: "flex-start",
    },
    footerContainer: {
        width: "100%",
        flexDirection: "column",
        justifyContent: "flex-end",
        paddingTop: 20,
        paddingBottom: 36,
        paddingHorizontal: 24,
    },
    scrollViewContainer: {
        width: "100%",
        paddingHorizontal: 12,
    },

    blockCls: {
        flexDirection: "column",
        flex: 1,
        marginLeft: 24,
        marginRight: 24,
    },
    notesContainer: {
        paddingTop: 24,
    },
    lineConfirm: {
        backgroundColor: "#cccccc",
        flexDirection: "row",
        height: 1,
        marginTop: 15,
    },
    accountListingContainer: {
        marginHorizontal: -24,
        paddingTop: 25,
    },
    logo: {
        flexDirection: "row",
        justifyContent: "center",
        alignContent: "center",
        marginTop: 2,
        elevation: 5,
        shadowColor: BLACK,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    logoTitle: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 14,
    },
    logoSubTitle: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 4,
    },
};
