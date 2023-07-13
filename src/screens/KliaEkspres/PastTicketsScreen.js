import * as React from "react";
import { View, ScrollView, RefreshControl, Text, ImageBackground, Dimensions } from "react-native";
import { ErrorMessage } from "@components/Common";
import Styles from "@styles/Wallet/KilaEkspress";
import {
    DropDownButtonNoIcon,
    KliaTicketList,
    FloatingActionTextStaticButton,
} from "@components/Common";
import * as Strings from "@constants/strings";
import * as navigationConstant from "@navigation/navigationConstant";
import * as ModelClass from "@utils/dataModel/modelClass";
import NavigationService from "@navigation/navigationService";
import NetInfo from "@react-native-community/netinfo";

import { getTicketHistoryKlia, initKLIA } from "@services/index";

import ScreenContainer from "@components/Containers/ScreenContainer";
import ScreenLayout from "@layouts/ScreenLayout";
import Typo from "@components/Text";
import { OFF_WHITE } from "@constants/colors";
export const { width, height } = Dimensions.get("window");
export default class PastTicketsScreen extends React.Component {
    static navigationOptions = { title: "", header: null };

    constructor(props) {
        super(props);
        this.state = {
            index: 0,
            rand: 10,
            showQuickActions: false,
            showMenu: false,
            error: false,
            errorMessage: "",
            errorTitle: "",
            overlayType: "solid",
            showSnackBar: false,
            scrollend: false,
            refreshing: false,
            snackBarText: "Changes Saved",
            ticketList: [],
        };

        this.onOpenBillsMenuClick = this._onOpenBillsMenuClick.bind(this);
        this.closeMenu = this._closeMenu.bind(this);
        this.onBuyTicketsClick = this._onBuyTicketsClick.bind(this);
        this.onListItemClick = this._onListItemClick.bind(this);
    }

    async componentDidMount() {
        this._getTicketHistoryKlia();

        this.focusSubscription = this.props.navigation.addListener("focus", () => {});
        this.blurSubscription = this.props.navigation.addListener("blur", () => {});
    }

    componentWillUnmount() {
        this.focusSubscription();
        this.blurSubscription();
    }

    _getTicketHistoryKlia = async () => {
        console.log("_getTicketHistoryKlia==> ");

        //this.setState({ loader: true });

        let subUrl = "ticketStatus=PAST";
        let params = {};

        try {
            params = JSON.stringify({});
            NetInfo.isConnected.fetch().then(async (isConnected) => {
                if (isConnected) {
                    getTicketHistoryKlia(subUrl, JSON.parse(params))
                        .then((response) => {
                            let responseObject = response.data;
                            console.log(subUrl + " RESPONSE RECEIVED: ", response.data);
                            let resultList;
                            resultList = responseObject.resultList;
                            if (
                                responseObject !== null &&
                                responseObject !== undefined &&
                                resultList !== null &&
                                resultList !== undefined
                            ) {
                                console.log("resultList  RESPONSE RECEIVED: ", resultList);
                                ModelClass.KLIA_DATA.kliaPastList = resultList;
                                this._updateScreenData(resultList);
                            } else if (responseObject !== null && responseObject !== undefined) {
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

    _updateScreenData = () => {
        console.log("_updateScreenData :");
        let date = ModelClass.KLIA_DATA.kliaPastList;
        console.log(
            "_updateScreenData ModelClass.KLIA_DATA.kliaPastList : ",
            ModelClass.KLIA_DATA.kliaPastList
        );
        let dateList = [];
        if (date != undefined && date.length >= 1) {
            for (let i = 0; i < date.length; i++) {
                let obj = date[i];
                let item = {
                    id: i,
                    bookingNo: obj.ticketPnr,
                    validity: obj.journeyDate + " - " + obj.expiryDate,
                    place: obj.fromStationName + " to " + obj.toStationName,
                    trip: obj.fromStationName,
                    amount: Strings.CURRENCY + obj.totalAmount,
                    barcode: obj.barcode,
                    expiryDate: obj.expiryDate,
                    fromStationName: obj.fromStationName,
                    journeyDate: obj.journeyDate,
                    receiptNumber: obj.receiptNumber,
                    saleDate: obj.saleDate,
                    serviceName: obj.serviceName,
                    ticketNumber: obj.ticketPnr,
                    ticketPnr: obj.ticketPnr,
                    ticketTypeCode: obj.ticketTypeCode,
                    ticketTypeName: obj.ticketTypeName,
                    toStationName: obj.toStationName,
                };
                dateList.push(item);
            }
        }
        this.setState({ ticketList: dateList, loader: false, refreshing: false });
    };

    _onListItemClick = (item) => {
        console.log("_onListItemClick :", item);
        //NavigationService.navigate("TicketViewScreen");
    };

    _updateDataInScreenAlways = async () => {};

    _onOpenBillsMenuClick = async () => {};

    _onBuyTicketsClick = () => {
        ModelClass.KLIA_DATA.failureMessage = "";
        if (
            ModelClass.KLIA_DATA.stationsList != undefined &&
            ModelClass.KLIA_DATA.stationsList.length >= 1
        ) {
            NavigationService.navigate("FromPlaceScreen");
        } else {
            this._getInitKliaAPI();
        }
    };

    _getInitKliaAPI = async () => {
        console.log("_getInitKliaAPI==> ");

        let subUrl = "";
        let params = {};

        try {
            params = JSON.stringify({
                mode: "",
                ticketType: "WETIX",
            });
            NetInfo.isConnected.fetch().then(async (isConnected) => {
                if (isConnected) {
                    initKLIA(subUrl, JSON.parse(params))
                        .then((response) => {
                            if (
                                ModelClass.KLIA_DATA.stationsList != undefined &&
                                ModelClass.KLIA_DATA.stationsList.length >= 1
                            ) {
                                NavigationService.navigate("FromPlaceScreen");
                            }
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

    _closeMenu = () => {
        this.setState({ showMenu: false });
    };

    onBackPress = () => {
        NavigationService.resetAndNavigateToModule(
            navigationConstant.HOME_DASHBOARD,
            navigationConstant.HOME_DASHBOARD
        );
    };

    _onQuickActionsButtonPressed = () => {
        this.setState({
            showQuickActions: true,
            overlayType: "gradient",
        });
    };

    isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
        const paddingToBottom = 20;
        return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
    };

    _refresh = () => {
        console.log("pull to refresh");

        this.setState({ loader: true, refreshing: true });
        this._onPageData();
    };

    _onPageData = () => {
        this._getTicketHistoryKlia();
    };

    render() {
        const { showOverlay, showErrorModal, errorMessage, index } = this.state;

        return (
            <ScreenContainer
                backgroundType="color"
                showErrorModal={showErrorModal}
                errorMessage={errorMessage}
                showOverlay={false}
            >
                <ScreenLayout header={<View />} paddingHorizontal={0} paddingBottom={0} useSafeArea>
                    <ScrollView
                        showsHorizontalScrollIndicator={false}
                        showsVerticalScrollIndicator={false}
                        style={Styles.containerViewScrollView}
                        refreshControl={
                            <RefreshControl
                                refreshing={this.state.refreshing}
                                onRefresh={this._refresh}
                            />
                        }
                        ref={(view) => (this._scrollView = view)}
                        onMomentumScrollEnd={({ nativeEvent }) => {
                            if (this.isCloseToBottom(nativeEvent)) {
                                console.log("isCloseToBottom");
                            }
                        }}
                        onScroll={({ nativeEvent }) => {}}
                        scrollEventThrottle={10}
                        refreshing={false}
                        contentContainerStyle={{ flex: 1, width: "100%", height: "100%" }}
                    >
                        <View style={Styles.containerBottom}>
                            {this.state.ticketList.length < 1 ? (
                                <View style={Styles.container}>
                                    <View style={Styles.contentContainer}>
                                        <View style={Styles.containerTitleFirst}>
                                            <Typo
                                                fontSize={18}
                                                fontWeight="bold"
                                                fontStyle="normal"
                                                letterSpacing={0}
                                                lineHeight={32}
                                            >
                                                <Text>{Strings.NO_UPCOMING_TRIPS}</Text>
                                            </Typo>
                                        </View>

                                        <View style={Styles.containerDesc}>
                                            <Typo
                                                fontSize={14}
                                                fontWeight="400"
                                                fontStyle="normal"
                                                letterSpacing={0}
                                                lineHeight={18}
                                            >
                                                <Text style={Styles.bodyText}>
                                                    {Strings.KEEP_TRACK_OF_ALL}
                                                </Text>
                                            </Typo>
                                        </View>

                                        <View style={Styles.buyViewButtonView}>
                                            <DropDownButtonNoIcon
                                                headerText={Strings.BUY_TICKETS}
                                                iconType={1}
                                                showIconType={false}
                                                textLeft={false}
                                                testID={"btnBUY_TICKETS"}
                                                backgroundColor={"#ffde00"}
                                                accessibilityLabel={"btnBUY_TICKETS"}
                                                onPress={async () => {
                                                    this.onBuyTicketsClick();
                                                }}
                                            />
                                        </View>
                                    </View>
                                    <ImageBackground
                                        style={{
                                            width: width,
                                            height: height * 0.4,
                                            position: "absolute",
                                            bottom: 0,
                                        }}
                                        source={require("@assets/images/illustrationEmptyState.png")}
                                        imageStyle={{
                                            resizeMode: "cover",
                                            alignSelf: "flex-end",
                                        }}
                                    />
                                </View>
                            ) : (
                                <View style={Styles.containerInnerView3}>
                                    <KliaTicketList
                                        data={this.state.ticketList}
                                        extraData={this.state.ticketList}
                                        callback={(item) => this.onListItemClick(item)}
                                        length={
                                            this.state.ticketList != undefined
                                                ? this.state.ticketList.length
                                                : 0
                                        }
                                        backgroundColor="#eaeaea"
                                    />
                                </View>
                            )}
                        </View>
                    </ScrollView>
                    {this.state.ticketList.length >= 1 ? (
                        <FloatingActionTextStaticButton
                            accessible={true}
                            testID={"BuyTickets"}
                            accessibilityLabel={"BuyTickets"}
                            showMenu={true}
                            onPress={this.onBuyTicketsClick}
                            backgroundColor={"#ffde00"}
                            text={Strings.BUY_TICKETS}
                            iconWidth={20}
                            icon={require("@assets/icons/icon24BlackKliaEkspresSmall.png")}
                            showIcon={true}
                        />
                    ) : (
                        <View />
                    )}
                    {this.state.error == true ? (
                        <ErrorMessage
                            onClose={() => {
                                this.setState({ error: false });
                            }}
                            title={this.state.errorTitle}
                            description={this.state.errorMessage}
                            showOk={true}
                            onOkPress={() => {
                                this.setState({ error: false });
                            }}
                        />
                    ) : null}
                </ScreenLayout>
            </ScreenContainer>
        );
    }
}
