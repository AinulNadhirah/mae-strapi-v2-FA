import React, { Component } from "react";
import { View } from "react-native";

import {
    KLIA_EKSPRESS_STACK,
    KLIA_SELECT_LOCATION,
    TICKET_VIEW_SCREEN,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import HeaderLabel from "@components/Label/HeaderLabel";
import ScreenLoader from "@components/Loaders/ScreenLoader";
import TabView from "@components/Specials/TabView";

import { withModelContext } from "@context";

import { FAKliaEkspres } from "@services/analytics/analyticsExternalPartner";
import { initKLIA, invokeL2 } from "@services/index";

import { MEDIUM_GREY } from "@constants/colors";
import { KLIA_EKSPRES, TICKETS, PAST, FA_TICKETS, FA_PAST } from "@constants/strings";

import TicketsScreen from "./TicketsScreen";

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

class KliaEkspressDashboard extends Component {
    constructor(props) {
        super(props);

        this.originalRouteParams = props.route.params;
        this.state = {
            selectedAccount: {},
            index: 0,
            isLoading: true,
        };

        console.log("KliaEkspressDashboard:----------", props);
        this.props.updateModel({
            ui: {
                onCancelLogin: this.onCancelLogin,
            },
        });
    }

    componentDidMount() {
        this.screenFocusSubscription = this.props.navigation.addListener("focus", () => {
            const currentTab = this.getTabName(this.state.index);
            FAKliaEkspres.onScreen(currentTab);
        });

        this.focusSubscription = this.props.navigation.addListener("willFocus", () => {
            // do something here or remove it later
        });
        this.blurSubscription = this.props.navigation.addListener("willBlur", () => {
            // do something here or remove it later
        });
        this.invokeL2();
    }

    componentWillUnmount() {
        this.focusSubscription();
        this.blurSubscription();
        this.screenFocusSubscription();
    }

    // -----------------------
    // EVENT HANDLER
    // -----------------------

    getTabName = (tabIndex) => {
        return tabIndex === 0 ? FA_TICKETS : FA_PAST;
    };

    onCancelLogin = () => {
        this.props.navigation.goBack();
    };

    handleTabChange = (index) => {
        this.setState({ index: index });
        const currentTab = this.getTabName(index);
        FAKliaEkspres.onScreen(currentTab);
    };

    onBackPress = () => {
        this.props.navigation.goBack();
    };

    onClosePress = () => {};

    onBuyTicketsClick = () => {
        const params = this.prepareNavParams();
        this.props.navigation.navigate(KLIA_EKSPRESS_STACK, {
            screen: KLIA_SELECT_LOCATION,
            params: params,
        });
        const currentTab = this.getTabName(this.state.index);
        FAKliaEkspres.onBuyTicket(currentTab);
    };

    onTicketPress = (ticketItem) => {
        console.log("onTicketPress", ticketItem);
        let params = this.prepareNavParams();
        params.ticketItem = ticketItem;
        this.props.navigation.navigate(KLIA_EKSPRESS_STACK, {
            screen: TICKET_VIEW_SCREEN,
            params: params,
        });
        const currentTab = this.getTabName(this.state.index);
        FAKliaEkspres.onViewTicket(currentTab);
    };

    // -----------------------
    // API CALL
    // -----------------------

    invokeL2 = async () => {
        try {
            const l3Resp = await invokeL2(true);
            console.log("invokeL2:respone:", l3Resp);
            const result = l3Resp.data;
            const { code, message } = result;
            if (code != 0) {
                this.props.navigation.goBack();
                return;
            }

            this.initKliaFunc();
        } catch (error) {
            if (error.status === "nonetwork") {
                this.props.navigation.goBack();
                return;
            }
            this.state = {
                isLoading: false,
            };
        }
    };

    initKliaFunc = () => {
        let params = {
            mode: "",
            ticketType: "WETIX",
        };
        initKLIA("", params)
            .then((response) => {
                console.log("initKLIA:response:", response);
                let responseObject = response?.data;
                this.kliaInitData = responseObject?.result;
            })
            .catch((error) => {
                console.log(subUrl + "  ERROR==> ", error);
            })
            .finally(() => {
                this.setState({ isLoading: false });
            });
    };

    // -----------------------
    // OTHER PROCESS
    // -----------------------

    prepareNavParams = () => {
        let navParam = { ...this.originalRouteParams, kliaInitData: this.kliaInitData };
        return navParam;
    };

    render() {
        const { navigation } = this.props;
        const { index, isLoading } = this.state;
        return (
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                {isLoading ? (
                    <ScreenLoader showLoader />
                ) : (
                    <ScreenLayout
                        paddingHorizontal={0}
                        paddingBottom={0}
                        scrollable={false}
                        header={
                            <Header onBackPress={this.onBackPress} headerTitle={KLIA_EKSPRES} />
                        }
                    >
                        <View style={Styles.mainContainer}>
                            <TabView
                                defaultTabIndex={index}
                                titles={[TICKETS, PAST]}
                                screens={[
                                    <TicketsScreen
                                        key="1"
                                        onBuyTicketsClick={this.onBuyTicketsClick}
                                        onTicketPress={this.onTicketPress}
                                        ticketStatus={"ACTIVE"}
                                        mainTitle={"Get to the airport, pronto!"}
                                        subTitle={
                                            "Forget about high fares or traffic jams. Buy ERL tickets and keep track of upcoming trips here."
                                        }
                                    />,
                                    <TicketsScreen
                                        key="2"
                                        onBuyTicketsClick={this.onBuyTicketsClick}
                                        onTicketPress={this.onTicketPress}
                                        ticketStatus={"PAST"}
                                        mainTitle={"Track Past Trips"}
                                        subTitle={"Look back at all past ERL trips here."}
                                    />,
                                ]}
                                onTabChange={this.handleTabChange}
                                scrollToEnd={false}
                            />
                        </View>
                    </ScreenLayout>
                )}
            </ScreenContainer>
        );
    }
}

KliaEkspressDashboard.propTypes = {
    // navigation: PropTypes.object.isRequired,
};

KliaEkspressDashboard.defaultProps = {
    // navigation: {},
};

export default withModelContext(KliaEkspressDashboard);

const Styles = {
    mainContainer: {
        flex: 1,
    },
};
