import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, ScrollView, TouchableOpacity, Image } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import QRCodew from "react-native-qrcode-image";

import * as navigationConstant from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import CustomPdfGenerator from "@components/Common/CustomPdfGenerator";
import ScreenContainer from "@components/Containers/ScreenContainer";
import HeaderLabel from "@components/Label/HeaderLabel";
import Typo from "@components/Text";

import { FAKliaEkspres } from "@services/analytics/analyticsExternalPartner";
import { getAllCategories } from "@services/index";

import {
    MEDIUM_GREY,
    YELLOW,
    LIGHT_YELLOW,
    LIGHT_BLACK,
    OFF_WHITE,
    WHITE,
    GREY,
    LIGHT_GREY,
    FADE_GREY,
    BLACK,
} from "@constants/colors";
import {
    TICKET,
    SHARE_SELECTED_TICKET,
    FA_PARTNER_ETICKET,
    FA_PARTNER_KLIA,
} from "@constants/strings";

import { getShadow } from "@utils/dataModel/utility";

import Assets from "@assets";

// -----------------------
// GET UI
// -----------------------

const Header = ({ onClosePress, headerTitle }) => {
    return (
        <HeaderLayout
            horizontalPaddingMode="custom"
            horizontalPaddingCustomLeftValue={24}
            horizontalPaddingCustomRightValue={24}
            headerRightElement={<HeaderCloseButton onPress={onClosePress} />}
            headerCenterElement={<HeaderLabel>{headerTitle}</HeaderLabel>}
        />
    );
};

const ContentTemplate = ({
    children,
    submitLabel,
    onSubmitPress,
    paddingHorizontal,
    isEnabledSubmit,
}) => {
    return (
        <React.Fragment>
            <View style={[Styles.mainContainer, { paddingHorizontal: paddingHorizontal }]}>
                <ScrollView style={Styles.scrollView} showsVerticalScrollIndicator={false}>
                    <View style={Styles.scrollViewContainer}>{children}</View>
                </ScrollView>

                <LinearGradient
                    colors={["#efeff300", MEDIUM_GREY, MEDIUM_GREY]}
                    style={Styles.linearGradient}
                />
            </View>
            <View style={[Styles.footerContainer]}>
                <ActionButton
                    height={48}
                    fullWidth
                    backgroundColor={isEnabledSubmit ? YELLOW : LIGHT_YELLOW}
                    borderRadius={24}
                    componentCenter={
                        <Typo
                            fontSize={14}
                            fontWeight="600"
                            fontStyle="normal"
                            letterSpacing={0}
                            lineHeight={18}
                            color={isEnabledSubmit ? BLACK : LIGHT_BLACK}
                            text={submitLabel}
                        />
                    }
                    onPress={onSubmitPress}
                    disabled={!isEnabledSubmit}
                />
            </View>
        </React.Fragment>
    );
};

const DetailIcon = ({ icon }) => {
    return (
        <Image
            source={icon}
            style={Styles.summaryIcon}
            resizeMethod="resize"
            resizeMode="stretch"
        />
    );
};

const GreyLine = () => {
    return (
        <View
            style={{
                height: 1,
                marginHorizontal: 24,
                backgroundColor: LIGHT_GREY,
            }}
        />
    );
};

// TODO: remove all inline style
const TicketItem = ({ data, index, onToggleSelect, onToggleView, ticketType }) => {
    return (
        <View style={[Styles.ticketItem]} key={`item-${index}`}>
            <TouchableOpacity onPress={() => onToggleSelect(data)} activeOpacity={0.9}>
                {/* top */}
                <View
                    style={{
                        backgroundColor: OFF_WHITE,
                        paddingTop: 11,
                        paddingBottom: 9,
                        paddingHorizontal: 24,
                        flexDirection: "row",
                        alignItems: "center",
                    }}
                >
                    <View
                        style={{
                            width: 20,
                            height: 20,
                            backgroundColor: YELLOW,
                            borderRadius: 10,
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Typo
                            textSize={12}
                            lineHeight={18}
                            // color="rgb( 120, 120, 120)"
                            textAlign="center"
                            fontWeight="600"
                            text={index + 1}
                            // style={{ borderWidth: 1, borderColor: "red" }}
                        />
                    </View>
                    <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: "column", paddingHorizontal: 12 }}>
                            <Typo
                                textSize={12}
                                lineHeight={18}
                                color="rgb( 120, 120, 120)"
                                textAlign="left"
                                text={`${ticketType.cat} Ticket`}
                            />
                            <Typo
                                textSize={12}
                                lineHeight={18}
                                fontWeight="600"
                                textAlign="left"
                                text={data.ticketNumber}
                            />
                        </View>
                    </View>

                    <View style={Styles.selectionImageView}>
                        <Image
                            source={
                                data.isSelected ? Assets.icRadioChecked : Assets.icRadioUnchecked
                            }
                            style={[Styles.selectionImage]}
                            resizeMode="contain"
                        />
                    </View>
                </View>
                {/* second container */}
                <View
                    style={{
                        paddingTop: 10,
                        paddingBottom: 21,
                        paddingHorizontal: 24,
                        flexDirection: "row",
                        alignItems: "center",
                    }}
                >
                    <View
                        style={{
                            width: 24,
                            height: 24,
                            // backgroundColor: YELLOW,
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <DetailIcon icon={Assets.icon24BlackKliaEkspres} />
                    </View>
                    <View
                        style={{
                            // backgroundColor: "#CCCCCC",
                            alignItems: "flex-start",
                            justifyContent: "center",
                            paddingLeft: 8,
                        }}
                    >
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                            }}
                        >
                            <Typo
                                textSize={12}
                                lineHeight={18}
                                color="rgb( 120, 120, 120)"
                                textAlign="left"
                                alignText="left"
                                text="From"
                            />
                            <Image
                                source={require("@assets/icons/arrowklia.png")}
                                style={{
                                    marginLeft: 8,
                                    width: 92,
                                    height: 6,
                                }}
                                // resizeMethod="auto"
                                // resizeMode="contain"
                            />
                        </View>
                        <Typo
                            textSize={12}
                            lineHeight={18}
                            fontWeight="600"
                            textAlign="left"
                            alignText="left"
                            text={data.fromStationName}
                        />
                    </View>
                    <View
                        style={{
                            flex: 1,
                            // backgroundColor: "#999999",
                            alignItems: "flex-start",
                            justifyContent: "center",
                            paddingLeft: 5,
                        }}
                    >
                        <Typo
                            textSize={12}
                            lineHeight={18}
                            color="rgb( 120, 120, 120)"
                            textAlign="left"
                            alignText="left"
                            text="To"
                        />
                        <Typo
                            textSize={12}
                            lineHeight={18}
                            fontWeight="600"
                            textAlign="left"
                            alignText="left"
                            text={data.toStationName}
                        />
                    </View>
                </View>
                {/* hidden container */}
                <View style={{ display: data.isExpend ? "flex" : "none" }}>
                    <GreyLine />
                    <View
                        style={{
                            paddingTop: 11,
                            paddingBottom: 14,
                            paddingHorizontal: 24,
                            alignItems: "center",
                        }}
                    >
                        {/* <Typo text="QR Code" /> */}
                        <QRCodew
                            getBase64={(base64) => {
                                data.qr = base64;
                            }}
                            value={data.barcode}
                            size={140}
                            bgColor="#ffffff"
                            fgColor="#000000"
                        />
                    </View>

                    <GreyLine />

                    <View
                        style={{
                            paddingTop: 18,
                            paddingBottom: 8,
                            paddingHorizontal: 24,
                            flexDirection: "row",
                        }}
                    >
                        <View
                            style={{
                                width: 48,
                                height: 48,
                                borderWidth: 2,
                                borderColor: WHITE,
                                borderRadius: 24,
                                overflow: "hidden",
                                ...getShadow({}),
                            }}
                        >
                            <Image
                                style={{
                                    width: 44,
                                    height: 44,
                                }}
                                source={Assets.icErlTicket}
                                resizeMode="stretch"
                                resizeMethod="scale"
                            />
                        </View>
                        <View style={{ flex: 1, paddingLeft: 8 }}>
                            <View
                                style={{
                                    backgroundColor: "#red",
                                    flexDirection: "column",
                                    alignItems: "flex-start",
                                }}
                            >
                                <Typo
                                    alignText="left"
                                    text={`${ticketType.trip} Trip`}
                                    fontSize={14}
                                    lineHeight={18}
                                    fontWeight="600"
                                />
                                <Typo
                                    alignText="left"
                                    text={`${ticketType.cat}`}
                                    fontSize={12}
                                    lineHeight={18}
                                    fontWeight="300"
                                />
                                <Typo
                                    text={`${data.journeyDate} - ${data.expiryDate}`}
                                    fontSize={12}
                                    lineHeight={18}
                                    fontWeight="300"
                                    color={FADE_GREY}
                                    textAlign="left"
                                />
                            </View>
                        </View>
                    </View>
                </View>
                {/* expand btn */}
                <TouchableOpacity onPress={() => onToggleView(data)}>
                    <View
                        style={{
                            paddingTop: 0,
                            paddingBottom: 8,
                            paddingHorizontal: 24,
                            alignItems: "center",
                        }}
                    >
                        <Image
                            source={require("@assets/icons/ic_down_arrow.png")}
                            style={{
                                width: 24,
                                height: 24,
                                transform: [{ rotate: data.isExpend ? "180deg" : "0deg" }],
                            }} //data.isExpend
                            resizeMethod="auto"
                            resizeMode="contain"
                        />
                    </View>
                </TouchableOpacity>
            </TouchableOpacity>
        </View>
    );
};
class TicketViewScreen extends Component {
    constructor(props) {
        super(props);
        let ticketDetails = props.route.params.ticketItem.ticketDetails.map((item, index) => {
            item.isSelected = false;
            item.isExpend = false;
            item.index = index;
            return item;
        });
        this.state = {
            ticketDetails: ticketDetails,
            isEnabledSubmit: false,
            ticketCodes: props.route.params.kliaInitData?.ticketCodes,
        };

        console.log("TicketViewScreen:----------", props.route.params);
    }

    componentDidMount() {
        this.focusSubscription = this.props.navigation.addListener("willFocus", () => {
            // do something here or remove it later
        });
        this.blurSubscription = this.props.navigation.addListener("willBlur", () => {
            // do something here or remove it later
        });
    }

    componentWillUnmount() {
        this.focusSubscription();
        this.blurSubscription();
    }

    // -----------------------
    // EVENT HANDLER
    // -----------------------

    onClosePress = () => {
        this.props.navigation.goBack();
    };

    onSubmitPress = async () => {
        //getBase64={(base64) => {}}
        const ticketDetails = this.state.ticketDetails.filter((item) => {
            const ticketType = this.getTicketType(item.ticketTypeCode);
            item.ticketType = ticketType;
            return item.isSelected;
        });

        let file = await CustomPdfGenerator.shareKLIATicket("kliaTicket", ticketDetails);

        if (file === null) {
            Alert.alert("Please allow permission");
            return;
        }

        const navParams = {
            file,
            share: true,
            type: "file",
            pdfType: "shareReceipt",
            title: "KLIA Ticket",
        };

        this.props.navigation.navigate(navigationConstant.COMMON_MODULE, {
            screen: navigationConstant.PDF_VIEWER,
            params: navParams,
        });

        FAKliaEkspres.onShareSelectedTickets();
    };

    onToggleSelect = (item) => {
        console.log("onToggleSelect:", item);
        let { ticketDetails } = this.state;
        item.isSelected = !item.isSelected;
        ticketDetails[item.index] = item;
        const isEnabledSubmit = ticketDetails.find((item) => item.isSelected === true)
            ? true
            : false;
        console.log("isEnabledSubmit:", isEnabledSubmit);
        this.setState({ ticketDetails: ticketDetails, isEnabledSubmit: isEnabledSubmit });
    };

    onToggleView = (item) => {
        console.log("onToggleView:", item);
        let { ticketDetails } = this.state;
        item.isExpend = !item.isExpend;
        ticketDetails[item.index] = item;
        this.setState({ ticketDetails: ticketDetails });
    };

    // -----------------------
    // API CALL
    // -----------------------
    apiCallExample = () => {
        getAllCategories()
            .then((respone) => {
                console.log(`response is`, respone);
                this.setState({
                    showErrorModal: true,
                    errorTitle: "Maya",
                    errorMessage: "Please check console",
                });
            })
            .catch((error) => {
                console.log(`is Error`, error);
                this.setState({
                    showErrorModal: true,
                    errorTitle: "Maya",
                    errorMessage: error.message,
                });
            });
    };

    // -----------------------
    // OTHER PROCESS
    // -----------------------

    prepareNavParams = () => {
        let navParam = { ...this.props.route.params };
        return navParam;
    };

    getTicketType = (searchCode) => {
        let ticketType = "";
        const { ticketCodes } = this.state;
        for (const i in ticketCodes) {
            const codeValue = ticketCodes[i];
            if (codeValue === searchCode) {
                ticketType = i;
            }
        }

        switch (ticketType) {
            case "klaiAdultReturn":
                return { cat: "Adult", trip: "Return" };
            case "klaiAdultSingle":
                return { cat: "Adult", trip: "Single" };
            case "klaiChildReturn":
                return { cat: "Child", trip: "Return" };
            case "klaiChildSingle":
                return { cat: "Child", trip: "Single" };
        }
    };

    render() {
        return (
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                analyticScreenName={`${FA_PARTNER_KLIA}${FA_PARTNER_ETICKET}`}
            >
                <ScreenLayout
                    scrollable={false}
                    header={<Header onClosePress={this.onClosePress} headerTitle={TICKET} />}
                >
                    <ContentTemplate
                        onSubmitPress={this.onSubmitPress}
                        isEnabledSubmit={this.state.isEnabledSubmit}
                        submitLabel={SHARE_SELECTED_TICKET}
                        paddingHorizontal={0}
                    >
                        {this.state.ticketDetails.map((item, index) => (
                            <TicketItem
                                ticketType={this.getTicketType(item.ticketTypeCode)}
                                data={item}
                                index={index}
                                onToggleSelect={this.onToggleSelect}
                                onToggleView={this.onToggleView}
                            />
                        ))}
                    </ContentTemplate>
                </ScreenLayout>
            </ScreenContainer>
        );
    }
}

TicketViewScreen.propTypes = {
    navigation: PropTypes.object.isRequired,
};

TicketViewScreen.defaultProps = {
    navigation: {},
};

export default TicketViewScreen;

const Styles = {
    mainContainer: {
        flex: 1,
    },

    scrollView: {
        flex: 1,
        width: "100%",
    },

    scrollViewContainer: {
        paddingBottom: 46,
    },

    linearGradient: {
        height: 46,
        left: 0,
        right: 0,
        bottom: 0,
        position: "absolute",
    },

    ticketItem: {
        backgroundColor: "#ffffff",
        borderRadius: 8,
        flexDirection: "column",
        width: "100%",
        overflow: "hidden",
        marginTop: 16,
    },

    selectionImage: {
        height: 20,
        width: 20,
    },

    summaryIcon: {
        height: 24,
        width: 20,
    },

    footerContainer: {
        width: "100%",
        flexDirection: "column",
        justifyContent: "flex-end",
    },
};
