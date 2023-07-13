import Numeral from "numeral";
import * as React from "react";
import { View, TouchableOpacity, ScrollView } from "react-native";

import ActionButton from "@components/Buttons/ActionButton";
import EmptyState from "@components/DefaultState/EmptyState";
import Typo from "@components/Text";

import { getTicketHistoryKlia } from "@services/index";

import { WHITE, FADE_GREY, LIGHT_GREY } from "@constants/colors";
import * as Strings from "@constants/strings";

import { getShadow } from "@utils/dataModel/utility";

const TicketList = ({ list, onPress }) => {
    return list.map((item, index) => (
        <TouchableOpacity onPress={() => onPress(item)} activeOpacity={0.9}>
            <View
                style={[
                    Styles.ticketItem,
                    index === 0 ? Styles.ticketItemFirst : null,
                    index === list.length - 1 ? Styles.ticketItemLast : null,
                ]}
            >
                <Typo text="Booking No." fontSize={12} lineHeight={18} textAlign="left" />
                <Typo
                    text={item.ticketPnr}
                    fontSize={12}
                    lineHeight={18}
                    fontWeight="800"
                    textAlign="left"
                />
                <View style={Styles.ticketTitleLine} />

                <Typo
                    text={`${item.fromStationName} to ${item.toStationName} `}
                    fontSize={16}
                    lineHeight={18}
                    fontWeight="800"
                    textAlign="left"
                />
                <Typo
                    text={`${Strings.CURRENCY}${Numeral(item.totalAmount).format("0,0.00")}`}
                    fontSize={14}
                    lineHeight={20}
                    fontWeight="300"
                    textAlign="left"
                />

                <View style={Styles.ticketBottom}>
                    <Typo
                        text="Validity"
                        fontSize={9}
                        lineHeight={12}
                        fontWeight="300"
                        textAlign="left"
                    />
                    <Typo
                        text={`${item.journeyDate} - ${item.expiryDate}`}
                        fontSize={10}
                        lineHeight={16}
                        fontWeight="300"
                        color={FADE_GREY}
                        textAlign="left"
                    />
                </View>
            </View>
        </TouchableOpacity>
    ));
};
export default class TicketsScreen extends React.Component {
    constructor(props) {
        super(props);
        console.log("TicketsScreen:", props);
        this.state = {
            ticketList: [],
        };
    }

    componentDidMount() {
        this.getTicketHistoryKlia();
    }

    componentWillUnmount() {}

    // -----------------------
    // API CALL
    // -----------------------
    getTicketHistoryKlia = () => {
        console.log("getTicketHistoryKlia ");
        const subUrl = `ticketStatus=${this.props.ticketStatus}`;

        //getTicketHistoryKlia

        getTicketHistoryKlia(subUrl, {})
            .then((response) => {
                console.log("getTicketHistoryKlia:", response);

                if (response && response.data && response.data.resultList) {
                    const resultList = response.data.resultList;
                    this.setState({ ticketList: resultList });
                }
            })
            .catch((error) => {
                console.log("error:", error);
            });
    };
    // -----------------------
    // EVENT HANDLER
    // -----------------------
    onBuyTicketsClick = () => {
        this.props.onBuyTicketsClick();
    };

    // -----------------------
    // OTHER PROCESS
    // -----------------------

    prepareNavParams = () => {
        const navParam = { ...this.props.route.params };
        return navParam;
    };

    render() {
        console.log("TicketsScreen:render");
        return (
            <View style={Styles.container}>
                {this.state.ticketList.length < 1 && (
                    <EmptyState
                        onActionBtnClick={this.onBuyTicketsClick}
                        title={this.props.mainTitle}
                        subTitle={this.props.subTitle}
                        buttonLabel={Strings.BUY_TICKETS}
                        testID="btnBUY_TICKETS"
                        accessibilityLabel="btnBUY_TICKETS"
                    />
                )}
                {this.state.ticketList.length > 0 && (
                    <>
                        <ScrollView>
                            <View style={Styles.ListContainer}>
                                <TicketList
                                    onPress={this.props.onTicketPress}
                                    list={this.state.ticketList}
                                />
                            </View>
                        </ScrollView>

                        <View style={Styles.bottomContainer}>
                            <View style={{ height: 48 }}>
                                <ActionButton
                                    fullWidth={false}
                                    height={40}
                                    backgroundColor={WHITE}
                                    borderRadius={24}
                                    componentCenter={
                                        <Typo
                                            fontSize={14}
                                            fontWeight="600"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={14}
                                            text={Strings.BUY_TICKETS}
                                        />
                                    }
                                    onPress={this.onBuyTicketsClick}
                                    style={Styles.BottomButton}
                                />
                            </View>
                        </View>
                    </>
                )}
            </View>
        );
    }
}

const Styles = {
    container: { flex: 1 },
    ListContainer: {
        paddingHorizontal: 24,
        paddingBottom: 24,
    },
    ticketItem: {
        backgroundColor: WHITE,
        borderRadius: 8,
        paddingTop: 20,
        paddingBottom: 16,
        paddingHorizontal: 24,
        marginTop: 24,
        alignItems: "flex-start",
        ...getShadow({}),
    },
    ticketItemFirst: {
        marginTop: 16,
    },
    ticketItemLast: { marginBottom: 72 },
    ticketTitleLine: {
        backgroundColor: LIGHT_GREY,
        height: 1,
        width: "100%",
        marginTop: 8,
        marginBottom: 20,
    },
    bottomContainer: {
        position: "absolute",
        bottom: 20,
        width: "100%",
        flexDirection: "row",
        justifyContent: "center",
    },
    BottomButton: {
        paddingHorizontal: 24,
        ...getShadow({}),
    },
    ticketBottom: {
        paddingTop: 16,
    },
};
