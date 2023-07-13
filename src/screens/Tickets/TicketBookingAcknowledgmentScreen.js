import moment from "moment";
import React, { Component } from "react";
import { Text, View, ScrollView, ImageBackground, Alert, TouchableOpacity } from "react-native";

import * as navigationConstant from "@navigation/navigationConstant";
import NavigationService from "@navigation/navigationService";

import ScreenLayout from "@layouts/ScreenLayout";

import { MyView, DropDownButtonNoIcon } from "@components/Common";
import CustomPdfGenerator from "@components/Common/CustomPdfGenerator";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";

import { OFF_WHITE } from "@constants/colors";
import * as Strings from "@constants/strings";

import * as ModelClass from "@utils/dataModel/modelClass";

import Styles from "@styles/Wallet/KilaEkspress";
import commonStyle from "@styles/main";

class TicketBookingAcknowledgmentScreen extends Component {
    static navigationOptions = ({ navigation: { navigate } }) => ({
        title: "",
        header: null,
    });

    constructor(props) {
        super(props);

        this.state = {
            error: false,
            transactionRefNumber: ModelClass.WETIX_DATA.transactionRefNumber,
        };

        this.onViewTicketClick = this._onViewTicketClick.bind(this);
        this.onDoneClick = this._onDoneClick.bind(this);
        this.onShareReceiptClick = this._onShareReceiptClick.bind(this);
    }

    async componentDidMount() {
        console.log("TicketBookingAcknowledgmentScreen componentDidMount 1 :");

        console.log("ModelClass.WETIX_DATA.created : ", ModelClass.WETIX_DATA.created);
        console.log(
            "ModelClass.TRANSFER_DATA.transactionRefNumber : ",
            ModelClass.TRANSFER_DATA.transactionRefNumber
        );
        console.log(
            "ModelClass.WETIX_DATA.transactionRefNumber : ",
            ModelClass.WETIX_DATA.transactionRefNumber
        );

        this.focusSubscription = this.props.navigation.addListener("focus", () => {});
        this.blurSubscription = this.props.navigation.addListener("blur", () => {});
    }

    componentWillUnmount() {
        this.focusSubscription();
        this.blurSubscription();
    }
    _onViewTicketClick = () => {
        console.log("onViewTicketClick :");
        if (ModelClass.TRANSFER_DATA.transactionStatus) {
            NavigationService.navigateToModule(
                navigationConstant.TICKET_STACK,
                navigationConstant.TICKET_VIEW_SCREEN
            );
        } else {
            this._onDoneClick();
        }
    };

    _onDoneClick = () => {
        console.log("_onDoneClick :");
        if (ModelClass.WETIX_DATA.ticketFlow === "WETIX") {
            NavigationService.navigateToModule(
                navigationConstant.TICKET_STACK,
                navigationConstant.WETIX_INAPP_WEBVIEW_SCREEN
            );
        } else if (ModelClass.WETIX_DATA.ticketFlow === "AIRPAZ") {
            NavigationService.navigateToModule(
                navigationConstant.TICKET_STACK,
                navigationConstant.AIR_PAZ_INAPP_WEBVIEW_SCREEN
            );
        } else if (ModelClass.WETIX_DATA.ticketFlow === "MYGROSER") {
            NavigationService.navigateToModule(
                navigationConstant.TICKET_STACK,
                navigationConstant.MY_GROSER_INAPP_WEBVIEW_SCREEN
            );
        } else if (ModelClass.WETIX_DATA.ticketFlow === "CTB") {
            NavigationService.navigateToModule(
                navigationConstant.TICKET_STACK,
                navigationConstant.CATCH_THAT_BUS_INAPP_WEBVIEW_SCREEN
            );
        } else {
            NavigationService.navigateToModule(navigationConstant.TAB_NAVIGATOR);
        }
    };

    _getTodayDate = () => {
        let today = moment(new Date()).format("DD MMMM, YYYY hh:mm");
        console.log(" today Date ==> ", today);
        return today;
    };

    _onShareReceiptClick = async () => {
        let file = "";
        let fileName = "MayaReceipt";
        let type = "";
        let cusName = "";
        let transactionRefNumber = "";
        let refID = "";
        let date = "";
        let transferAmount = "";
        let success = true;
        let receiptType = "";
        let benName = "";
        let benAct = "";
        let referance = "";
        let fromAct = "";
        let toAct = "";

        try {
            file = "";
            fileName = "MayaReceipt";
            receiptType = ModelClass.COMMON_DATA.transferFlow;
            type = "";
            cusName = "";
            transactionRefNumber = ModelClass.WETIX_DATA.transactionRefNumber;
            refID =
                transactionRefNumber != undefined && transactionRefNumber != null
                    ? transactionRefNumber.substr(transactionRefNumber.length - 10)
                    : "";

            date = this._getTodayDate();
            console.log("this._getTodayDate() : ", date);

            transferAmount = ModelClass.TRANSFER_DATA.formatedTransferAmount;

            if (ModelClass.WETIX_DATA.ticketFlow === "WETIX") {
                benName = "Wetix";
                type = "Wetix Ticket";
            } else if (ModelClass.WETIX_DATA.ticketFlow === "AIRPAZ") {
                benName = "Airpaz";
                type = "Airpaz Ticket";
            } else if (ModelClass.WETIX_DATA.ticketFlow === "CTB") {
                benName = "Catch That Bus";
                type = "Catch That Bus Ticket";
            } else if (ModelClass.WETIX_DATA.ticketFlow === "KLIA") {
                benName = "KLIA EKSPRES";
                type = "KLIA EKSPRES Ticket";
            } else {
                benName = "Ticket Payment";
            }

            benAct = "";
            referance = "";

            fromAct = ModelClass.TRANSFER_DATA.formatedFromAccount;
            toAct = "";

            console.log("PDF Data :=====> ");
            console.log("fileName : ", fileName);
            console.log("type : ", type);
            console.log("cusName : ", cusName);
            console.log("transactionRefNumber : ", transactionRefNumber);
            console.log("refID : ", refID);
            console.log("date : ", date);
            console.log("transferAmount : ", transferAmount);
            console.log("success : ", success);
            console.log("receiptType : ", receiptType);
            console.log("benName : ", benName);
            console.log("benAct : ", benAct);
            console.log("referance : ", referance);
            console.log("fromAct : ", fromAct);
            console.log("toAct : ", toAct);
            console.log("================ ");

            file = await CustomPdfGenerator.viewTransferReceipt(
                fileName,
                type,
                cusName,
                refID,
                date,
                transferAmount,
                success,
                receiptType,
                benName,
                benAct,
                referance,
                fromAct,
                toAct
            );
            this.setState({ loader: false });
            if (file === null) {
                Alert.alert("Please allow permission");
            } else {
                ModelClass.PDF_DATA.file = file;
                ModelClass.PDF_DATA.share = true;
                ModelClass.PDF_DATA.type = "file";
                ModelClass.PDF_DATA.route = navigationConstant.TRANSFER_ACKNOWLEDGE_SCREEN;
                ModelClass.PDF_DATA.module = navigationConstant.FUNDTRANSFER_MODULE;
                ModelClass.PDF_DATA.title = "MAYA RECEIPT";
                ModelClass.PDF_DATA.pdfType = "shareReceipt";

                NavigationService.navigateToModule(
                    navigationConstant.COMMON_MODULE,
                    navigationConstant.PDF_VIEW
                );
            }
        } catch (error) {
            this.setState({ loader: false });
            console.log("PDF Data Error ================ ", JSON.stringify(error));
            console.log("Error ================ ", error);
        }

        //NavigationService.navigateToModule(navigationConstant.TICKET_STACK, navigationConstant.TICKET_VIEW_SCREEN);
    };

    render() {
        const { showOverlay, showErrorModal, errorMessage, index } = this.state;
        return (
            <ScreenContainer
                backgroundType="color"
                showErrorModal={showErrorModal}
                errorMessage={errorMessage}
                showOverlay={false}
                backgroundColor={OFF_WHITE}
            >
                <ScreenLayout paddingHorizontal={0} paddingBottom={0}>
                    <ScrollView style={Styles.containerViewScrollView}>
                        <View style={Styles.containerInner}>
                            {ModelClass.TRANSFER_DATA.transactionStatus === true ? (
                                <View style={Styles.newTransferViewInner1}>
                                    <View style={Styles.circleImageView}>
                                        <ImageBackground
                                            style={Styles.newTransferCircle}
                                            source={require("@assets/icons/ic_success.png")}
                                            resizeMode="center"
                                        />
                                    </View>
                                </View>
                            ) : (
                                <View style={Styles.newTransferViewInner1}>
                                    <View style={Styles.circleImageView}>
                                        <ImageBackground
                                            style={Styles.newTransferCircle}
                                            source={require("@assets/icons/ic_failed.png")}
                                            resizeMode="center"
                                        />
                                    </View>
                                </View>
                            )}
                            <View style={(Styles.block, { marginTop: 15, marginRight: 16 })}>
                                <View style={Styles.titleContainer}>
                                    {ModelClass.TRANSFER_DATA.transactionStatus === true ? (
                                        <Typo
                                            fontSize={20}
                                            fontWeight="300"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={28}
                                            color="#000000"
                                            textAlign="center"
                                        >
                                            <Text>{Strings.PAYMENT_SUCCESSFUL}</Text>
                                        </Typo>
                                    ) : (
                                        <Typo
                                            fontSize={20}
                                            fontWeight="300"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={28}
                                            color="#000000"
                                            textAlign="left"
                                        >
                                            <Text style={{ marginRight: 16, width: "85%" }}>
                                                {ModelClass.TRANSFER_DATA
                                                    .transactionResponseError != undefined &&
                                                ModelClass.TRANSFER_DATA.transactionResponseError
                                                    .length >= 1
                                                    ? ModelClass.TRANSFER_DATA
                                                          .transactionResponseError
                                                    : Strings.PAYMENT_FAILED}
                                            </Text>
                                        </Typo>
                                    )}
                                </View>
                            </View>
                            <View style={Styles.block1}>
                                {this.state.transactionRefNumber != undefined &&
                                this.state.transactionRefNumber.length >= 1 ? (
                                    <View style={Styles.blockContainer}>
                                        <View style={{ alignItems: "flex-start", width: "40%" }}>
                                            <Text style={[Styles.subLeftText, commonStyle.font]}>
                                                {Strings.REFERENCE_ID}
                                            </Text>
                                        </View>
                                        <View style={{ alignItems: "flex-end", width: "55%" }}>
                                            <Text style={[Styles.subRightText, commonStyle.font]}>
                                                {this.state.transactionRefNumber}
                                            </Text>
                                        </View>
                                    </View>
                                ) : (
                                    <View style={Styles.blockContainer} />
                                )}
                            </View>

                            <View style={Styles.blockDateRow}>
                                {ModelClass.WETIX_DATA.created != undefined &&
                                ModelClass.WETIX_DATA.created.length >= 1 ? (
                                    <View style={Styles.blockContainer}>
                                        <View style={{ alignItems: "flex-start", width: "40%" }}>
                                            <Text style={[Styles.subLeftText, commonStyle.font]}>
                                                {Strings.DATE_AND_TIME}
                                            </Text>
                                        </View>
                                        <View style={{ alignItems: "flex-end", width: "55%" }}>
                                            <Text style={[Styles.subRightText, commonStyle.font]}>
                                                {ModelClass.WETIX_DATA.created}
                                            </Text>
                                        </View>
                                    </View>
                                ) : (
                                    <View style={Styles.blockContainer} />
                                )}
                            </View>
                        </View>
                    </ScrollView>

                    <View style={Styles.footerView}>
                        <View style={Styles.footerInner}>
                            <View style={Styles.footerButtonView}>
                                <DropDownButtonNoIcon
                                    headerText={Strings.DONE}
                                    iconType={1}
                                    textLeft={false}
                                    showIconType={false}
                                    testID={"onDoneClick"}
                                    backgroundColor={"#ffde00"}
                                    accessibilityLabel={"onDoneClick"}
                                    onPress={async () => {
                                        this.onViewTicketClick();
                                    }}
                                />
                            </View>
                        </View>
                    </View>

                    <MyView hide={!ModelClass.TRANSFER_DATA.transactionStatus}>
                        <View style={Styles.footerTextView}>
                            <View style={Styles.footerInner}>
                                <View style={Styles.footerButtonView}>
                                    <TouchableOpacity onPress={() => this.onShareReceiptClick()}>
                                        <Typo
                                            fontSize={14}
                                            fontWeight="600"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={18}
                                            color="#4a90e2"
                                        >
                                            <Text>{Strings.SHARE_RECEIPT}</Text>
                                        </Typo>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </MyView>
                </ScreenLayout>
            </ScreenContainer>
        );
    }
}

export default TicketBookingAcknowledgmentScreen;
