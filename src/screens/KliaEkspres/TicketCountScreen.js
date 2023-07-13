import PropTypes from "prop-types";
import React from "react";
import { View, ScrollView, Text } from "react-native";
import SwitchSelector from "react-native-switch-selector";
import { ErrorMessage, HeaderPageIndicator, CircularCenterImageView } from "@components/Common";
import Styles from "@styles/Wallet/KilaEkspress";
import { DropDownButtonNoIcon } from "@components/Common";
import * as Strings from "@constants/strings";
import * as navigationConstant from "@navigation/navigationConstant";
import * as ModelClass from "@utils/dataModel/modelClass";
import NavigationService from "@navigation/navigationService";

import ScreenContainer from "@components/Containers/ScreenContainer";
import ScreenLayout from "@layouts/ScreenLayout";
import { OFF_WHITE } from "@constants/colors";

import Typo from "@components/Text";

export default class TicketCountScreen extends React.Component {
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
            adultCount: 1,
            childCount: 0,
            adultMaxCount: ModelClass.KLIA_DATA.adultMaxCount,
            childMaxCount: ModelClass.KLIA_DATA.childMaxCount,
            maxTotalTicket: ModelClass.KLIA_DATA.maxTotalTicket,
            view: "I",
            ticketAmount: "0.00",
            ticketOfferAmount: "0.00",
            tripSingle: true,
            ticketAmountTxt: Strings.CURRENCY + "0.0",
            ticketOfferAmountTxt: Strings.CURRENCY + "0.0",
            placeList: [
                {
                    id: 1,
                    image: require("@assets/icons/klia.png"),
                    name: Strings.KLIA,
                    showImage: true,
                },
                {
                    id: 0,
                    image: require("@assets/icons/klia2.png"),
                    name: Strings.KLIA2,
                    showImage: true,
                },
            ],
            snackBarText: "Changes Saved",
        };

        this.onOpenBillsMenuClick = this._onOpenBillsMenuClick.bind(this);
        this.closeMenu = this._closeMenu.bind(this);
        this.onContinueClick = this._onContinueClick.bind(this);
        this.onIncreaseAdultClick = this._onIncreaseAdultClick.bind(this);
        this.onDecreaseAdultClick = this._onDecreaseAdultClick.bind(this);
        this.onIncreaseChildClick = this._onIncreaseChildClick.bind(this);
        this.onDecreaseChildClick = this._onDecreaseChildClick.bind(this);
        this.onTripSelectionChange = this._onTripSelectionChange.bind(this);
    }

    async componentDidMount() {
        this._updateDataInScreenAlways();

        this.focusSubscription = this.props.navigation.addListener("focus", () => {});
        this.blurSubscription = this.props.navigation.addListener("blur", () => {});
    }

    componentWillUnmount() {
        this.focusSubscription();
        this.blurSubscription();
    }

    _updateDataInScreenAlways = async () => {
        console.log("_updateDataInScreenAlways  ");
        this._onTripSelectionChange("s");
    };

    _onIncreaseAdultClick = () => {
        let count = this.state.adultCount;
        console.log("_onIncreaseAdultClick : ", count);
        let tickets = this.state.childCount + this.state.adultCount;
        console.log("_onIncreaseAdultClick tickets : ", tickets);
        if (tickets < this.state.maxTotalTicket && count < this.state.adultMaxCount) {
            count++;
            this.setState({
                adultCount: count,
                rand: Math.random() + 1000,
            });
        }
        setTimeout(() => {
            this._updateAmount(this.state.tripSingle);
        }, 200);
    };

    _onDecreaseAdultClick = () => {
        let count = this.state.adultCount;
        console.log("_onDecreaseAdultClick : ", count);
        if (count > 1) {
            count--;
            this.setState({
                adultCount: count,
                rand: Math.random() + 1000,
            });
        }
        setTimeout(() => {
            this._updateAmount(this.state.tripSingle);
        }, 200);
    };

    _onIncreaseChildClick = () => {
        let count = this.state.childCount;
        console.log("_onIncreaseChildClick : ", count);
        let tickets = this.state.childCount + this.state.adultCount;
        console.log("_onIncreaseChildClick tickets : ", tickets);
        if (tickets < this.state.maxTotalTicket && count < this.state.childMaxCount) {
            count++;
            this.setState({
                childCount: count,
                rand: Math.random() + 1000,
            });
        }
        setTimeout(() => {
            this._updateAmount(this.state.tripSingle);
        }, 200);
    };

    _onDecreaseChildClick = () => {
        let count = this.state.childCount;

        console.log("_onDecreaseChildClick : ", count);
        if (count >= 1) {
            count--;
            this.setState({
                childCount: count,
                rand: Math.random() + 1000,
            });
        }
        setTimeout(() => {
            this._updateAmount(this.state.tripSingle);
        }, 200);
    };

    _onOpenBillsMenuClick = async () => {};

    _onTripSelectionChange = (value) => {
        console.log("_onTripSelectionChange obj", value);

        let singleTrip = true;

        if (value === "s") {
            singleTrip = true;
            ModelClass.KLIA_DATA.selectedChildTicketCode = ModelClass.KLIA_DATA.klaiChildSingle;
            ModelClass.KLIA_DATA.selectedAdultTicketCode = ModelClass.KLIA_DATA.klaiAdultSingle;
        } else if (value === "r") {
            singleTrip = false;
            ModelClass.KLIA_DATA.selectedChildTicketCode = ModelClass.KLIA_DATA.klaiChildReturn;
            ModelClass.KLIA_DATA.selectedAdultTicketCode = ModelClass.KLIA_DATA.klaiAdultReturn;
        }
        console.log("singleTrip", singleTrip);
        this.setState({
            tripSingle: singleTrip,
            rand: Math.random() + 1000,
        });
        setTimeout(() => {
            this._updateAmount(singleTrip);
        }, 200);
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

    _updateAmount = (singleTrip) => {
        console.log("_updateAmount ");
        let tripSingle;
        let adultCount = this.state.adultCount;
        let childCount = this.state.childCount;

        let childSingleAmount = 0.0;
        let childSingleAmountOffer = 0.0;

        let adultSingleAmount = 0.0;
        let adultSingleAmountOffer = 0.0;

        let childReturnAmount = 0.0;
        let childReturnAmountOffer = 0.0;

        let adultReturnAmount = 0.0;
        let adultReturnAmountOffer = 0.0;

        let selectChildOffer = 0.0;
        let selectChildNet = 0.0;

        let selectAdultOffer = 0.0;
        let selectAdultNet = 0.0;

        let totalNetAmount = 0.0;
        let totalOfferAmount = 0.0;

        if (
            ModelClass.KLIA_DATA.klaiAdultSingleDetail != null &&
            ModelClass.KLIA_DATA.klaiAdultSingleDetail != undefined &&
            ModelClass.KLIA_DATA.klaiChildSingleDetail != null &&
            ModelClass.KLIA_DATA.klaiChildSingleDetail != undefined
        ) {
            adultSingleAmountOffer = ModelClass.KLIA_DATA.klaiAdultSingleNetPrice;
            adultSingleAmount = ModelClass.KLIA_DATA.klaiAdultSingleSellingPrice;

            adultReturnAmountOffer = ModelClass.KLIA_DATA.klaiAdultReturnNetPrice;
            adultReturnAmount = ModelClass.KLIA_DATA.klaiAdultReturnSellingPrice;

            childSingleAmountOffer = ModelClass.KLIA_DATA.klaiChildSingleNetPrice;
            childSingleAmount = ModelClass.KLIA_DATA.klaiChildSingleSellingPrice;

            childReturnAmountOffer = ModelClass.KLIA_DATA.klaiChildReturnNetPrice;
            childReturnAmount = ModelClass.KLIA_DATA.klaiChildReturnSellingPrice;
        }
        console.log("=================================================================");
        try {
            tripSingle = singleTrip;
            console.log("tripSingle : ", tripSingle);

            if (tripSingle) {
                selectChildOffer = childSingleAmountOffer;
                selectChildNet = childSingleAmount;

                selectAdultOffer = adultSingleAmountOffer;
                selectAdultNet = adultSingleAmount;
            } else {
                selectChildOffer = childReturnAmountOffer;
                selectChildNet = childReturnAmount;

                selectAdultOffer = adultReturnAmountOffer;
                selectAdultNet = adultReturnAmount;
            }
            console.log("selectChildOffer : ", selectChildOffer);
            console.log("selectChildNet : ", selectChildNet);

            console.log("selectAdultOffer : ", selectAdultOffer);
            console.log("selectAdultNet : ", selectAdultNet);

            totalNetAmount = selectChildNet * childCount + selectAdultNet * adultCount;
            totalOfferAmount = selectChildOffer * childCount + selectAdultOffer * adultCount;
            totalNetAmount = totalNetAmount.toFixed(2);
            totalOfferAmount = totalOfferAmount.toFixed(2);
            if (totalNetAmount.toString().indexOf(".") === -1) {
                totalNetAmount = totalNetAmount.toString() + ".00";
            }

            if (totalOfferAmount.toString().indexOf(".") === -1) {
                totalOfferAmount = totalOfferAmount.toString() + ".00";
            }

            console.log("adultCount : ", adultCount);
            console.log("childCount : ", childCount);

            console.log("totalNetAmount : ", totalNetAmount);
            console.log("totalOfferAmount : ", totalOfferAmount);

            this.setState({
                ticketAmount: totalNetAmount,
                ticketOfferAmount: totalOfferAmount,
                ticketAmountTxt: Strings.CURRENCY + totalNetAmount,
                ticketOfferAmountTxt: Strings.CURRENCY + totalOfferAmount,
                rand: Math.random() + 1000,
            });
        } catch (error) {
            console.log("TicketCountScreen >> _updateAmount -> Error : ", error);
        }
    };

    _onContinueClick = () => {
        console.log("_onContinueClick==> ");
        ModelClass.KLIA_DATA.selectedAdultCount = this.state.adultCount;
        ModelClass.KLIA_DATA.selectedChildCount = this.state.childCount;
        ModelClass.KLIA_DATA.selectedTrip = this.state.tripSingle;

        ModelClass.TRANSFER_DATA.formatedTransferAmount = this.state.ticketAmount;
        ModelClass.TRANSFER_DATA.displayTransferAmount = this.state.ticketAmount;
        ModelClass.KLIA_DATA.selectedNetAmount = this.state.ticketAmount;
        ModelClass.KLIA_DATA.selectedOfferAmount = this.state.ticketOfferAmount;

        console.log(
            "ModelClass.KLIA_DATA.selectedAdultCount  ==> ",
            ModelClass.KLIA_DATA.selectedAdultCount
        );
        console.log(
            "ModelClass.KLIA_DATA.selectedChildCount  ==> ",
            ModelClass.KLIA_DATA.selectedChildCount
        );
        console.log(
            "ModelClass.TRANSFER_DATA.formatedTransferAmount  ==> ",
            ModelClass.TRANSFER_DATA.formatedTransferAmount
        );
        console.log(
            "ModelClass.TRANSFER_DATA.displayTransferAmount  ==> ",
            ModelClass.TRANSFER_DATA.displayTransferAmount
        );
        //this._calTicketKLIA();
        NavigationService.navigate("TicketBookingSummaryScreen");
    };

    render() {
        const { showErrorModal, errorMessage } = this.state;
        return (
            <ScreenContainer
                backgroundType="color"
                showErrorModal={showErrorModal}
                errorMessage={errorMessage}
                showOverlay={false}
                backgroundColor={OFF_WHITE}
            >
                <ScreenLayout
                    useSafeArea
                    header={
                        <HeaderPageIndicator
                            showBack={true}
                            showClose={true}
                            showIndicator={false}
                            showTitle={true}
                            showTitleCenter={true}
                            showBackIndicator={false}
                            pageTitle={Strings.STEP4OF4}
                            numberOfPages={0}
                            currentPage={0}
                            onBackPress={this.onBackPress}
                            navigation={this.props.navigation}
                            moduleName={navigationConstant.KLIA_EKSPRESS_STACK}
                            routeName={navigationConstant.KLIA_EKSPRESS_DASHBOARD}
                            testID={"header"}
                            accessibilityLabel={"header"}
                            titleFontSize={12}
                            titleFontColor={"#7c7c7d"}
                        />
                    }
                    paddingHorizontal={0}
                    paddingBottom={0}
                >
                    <View style={Styles.containerBlockView}>
                        <View style={Styles.containerViewScrollView}>
                            <ScrollView style={Styles.containerViewScrollView}>
                                <View style={Styles.containerInner}>
                                    <View style={Styles.containerTitle}>
                                        <Typo
                                            fontSize={20}
                                            fontWeight="300"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={28}
                                            textAlign="left"
                                        >
                                            <Text>{Strings.HOW_MANY_TICKETS_WOULD}</Text>
                                        </Typo>
                                    </View>

                                    <View style={Styles.increaseView}>
                                        <View style={Styles.increaseButtonView}>
                                            <CircularCenterImageView
                                                source={require("@assets/icons/icon32BlackMinus.png")}
                                                click={this.onDecreaseAdultClick}
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
                                                color="#000000"
                                            >
                                                <Text>{Strings.ADULT}</Text>
                                            </Typo>
                                            <View style={Styles.countTextView}>
                                                <Typo
                                                    fontSize={32}
                                                    fontWeight="bold"
                                                    fontStyle="normal"
                                                    letterSpacing={0}
                                                    lineHeight={32}
                                                    color="#000000"
                                                >
                                                    <Text>{this.state.adultCount}</Text>
                                                </Typo>
                                            </View>
                                        </View>
                                        <View style={Styles.increaseButtonView}>
                                            <CircularCenterImageView
                                                source={require("@assets/icons/icon32BlackAdd.png")}
                                                click={this.onIncreaseAdultClick}
                                                size={50}
                                                width={21}
                                                height={21}
                                            />
                                        </View>
                                    </View>

                                    <View style={Styles.increaseView}>
                                        <View style={Styles.increaseButtonView}>
                                            <CircularCenterImageView
                                                source={require("@assets/icons/icon32BlackMinus.png")}
                                                click={this.onDecreaseChildClick}
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
                                                color="#000000"
                                            >
                                                <Text>{Strings.CHILD}</Text>
                                            </Typo>
                                            <View style={Styles.countTextView}>
                                                <Typo
                                                    fontSize={32}
                                                    fontWeight="bold"
                                                    fontStyle="normal"
                                                    letterSpacing={0}
                                                    lineHeight={32}
                                                    color="#000000"
                                                >
                                                    <Text>{this.state.childCount}</Text>
                                                </Typo>
                                            </View>
                                        </View>
                                        <View style={Styles.increaseButtonView}>
                                            <CircularCenterImageView
                                                source={require("@assets/icons/icon32BlackAdd.png")}
                                                click={this.onIncreaseChildClick}
                                                size={50}
                                                width={21}
                                                height={23}
                                            />
                                        </View>
                                    </View>

                                    <View style={Styles.containerNoteTitle}>
                                        <Typo
                                            fontSize={12}
                                            fontWeight="normal"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={18}
                                            color="#787878"
                                            textAlign="left"
                                        >
                                            <Text>{Strings.CHILDREN_BELOW_THE_AGE}</Text>
                                        </Typo>
                                    </View>

                                    <View style={Styles.containerTypeTitle}>
                                        <Typo
                                            fontSize={20}
                                            fontWeight="300"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={28}
                                            color="#000000"
                                            textAlign="left"
                                        >
                                            <Text>{Strings.WHAT_TYPE_TRIP_YOU}</Text>
                                        </Typo>
                                    </View>
                                    <View style={Styles.detailSwitchView}>
                                        <SwitchSelector
                                            style={Styles.detailSwitchContainer}
                                            onPress={(value) => this.onTripSelectionChange(value)}
                                            textColor={"#000000"}
                                            borderRadius={22}
                                            backgroundColor={"#e5e5e5"}
                                            selectedColor={"#000000"}
                                            buttonColor={"#ffffff"}
                                            bold={true}
                                            height={36}
                                            fontSize={12}
                                            selectedTextStyle={{
                                                fontFamily: "montserrat",
                                                elevation: 7,
                                                fontSize: 12,
                                                fontWeight: "600",
                                                fontStyle: "normal",
                                                lineHeight: 18,
                                                letterSpacing: 0,
                                                textAlign: "center",
                                                color: "#000000",
                                            }}
                                            textStyle={{
                                                fontFamily: "montserrat",
                                                fontSize: 12,
                                                fontWeight: "200",
                                                fontStyle: "normal",
                                                lineHeight: 18,
                                                letterSpacing: 0,
                                                textAlign: "center",
                                                color: "#000000",
                                            }}
                                            borderColor={"#e5e5e5"}
                                            options={[
                                                {
                                                    label: Strings.SINGLE,
                                                    value: "s",
                                                    activeColor: "#ffffff",
                                                },
                                                {
                                                    label: Strings.RETURN,
                                                    value: "r",
                                                    activeColor: "#ffffff",
                                                },
                                            ]}
                                        />
                                    </View>
                                    <View style={Styles.containerOfferAmountTitle}>
                                        <View style={Styles.containerOfferAmountInner}>
                                            <Typo
                                                fontSize={14}
                                                fontWeight="400"
                                                fontStyle="normal"
                                                letterSpacing={0}
                                                lineHeight={18}
                                                color="#000000"
                                                textAlign="center"
                                            >
                                                <Text>{this.state.ticketOfferAmountTxt}</Text>
                                            </Typo>
                                            <View style={Styles.offerStrickLine} />
                                        </View>
                                    </View>
                                    <View style={Styles.containerAmountTitle}>
                                        <Typo
                                            fontSize={18}
                                            fontWeight="bold"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={32}
                                            color="#000000"
                                            textAlign="center"
                                        >
                                            <Text>{this.state.ticketAmountTxt}</Text>
                                        </Typo>
                                    </View>
                                </View>
                            </ScrollView>
                            <View style={Styles.footerView}>
                                <View style={Styles.footerInner}>
                                    <View style={Styles.footerButtonView}>
                                        <DropDownButtonNoIcon
                                            headerText={Strings.CONTINUE}
                                            iconType={1}
                                            textLeft={false}
                                            showIconType={false}
                                            testID={"onNextClick"}
                                            backgroundColor={"#ffde00"}
                                            accessibilityLabel={"onNextClick"}
                                            onPress={async () => {
                                                this.onContinueClick();
                                            }}
                                        />
                                    </View>
                                </View>
                            </View>
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
                        </View>
                    </View>
                </ScreenLayout>
            </ScreenContainer>
        );
    }
}

TicketCountScreen.propTypes = {
    navigation: PropTypes.shape({
        addListener: PropTypes.func,
    }),
};
