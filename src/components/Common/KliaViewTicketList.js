/* eslint-disable react/jsx-no-bind */
/* eslint-disable react/prop-types */
import React from "react";
import { View, Text, FlatList, TouchableOpacity, Image } from "react-native";
const borderRadius = 14 / 2;
import Typo from "@components/Text";
import QRCodew from "react-native-qrcode-image";

const KliaViewTicketList = ({ data, callback, width, length, onScroll }) => {
    return (
        <FlatList
            data={data}
            extraData={data}
            horizontal={true}
            style={[Styles.flatList]}
            showsHorizontalScrollIndicator={false}
            showIndicator={false}
            onScroll={({ nativeEvent }) => {
                console.log(
                    "KliaViewTicketList nativeEvent.contentOffset.y ",
                    nativeEvent.contentOffset.y
                );
                onScroll(nativeEvent.contentOffset.y);
            }}
            onScrollEndDrag={() => console.log("KliaViewTicketList end ")}
            onScrollBeginDrag={() => console.log("KliaViewTicketList start")}
            keyExtractor={(item, index) => `${item.contentId}-${index}`}
            renderItem={({ item, index }) => (
                <TouchableOpacity
                    key={`item-${index}`}
                    onPress={() => {
                        callback(item, item.selected);
                    }}
                    activeOpacity={0.9}
                    style={[Styles.touchView]}
                >
                    <View
                        style={[
                            index + 1 === length ? Styles.actionItemLast : Styles.actionItem,
                            { width: width },
                        ]}
                    >
                        <View style={[Styles.firstView]}>
                            <Text style={[Styles.ticketText]}>Ticket</Text>
                            <Text style={[Styles.ticketValueText]}>{item.bookingNo}</Text>
                            <View style={[Styles.firstView1]}>
                                <View style={Styles.selectionImageView}>
                                    <Image
                                        source={
                                            item.selected
                                                ? require("@assets/icons/ic_din_check.png")
                                                : require("@assets/icons/ic_din_uncheck.png")
                                        }
                                        style={[Styles.selectionImage]}
                                        resizeMode="contain"
                                    />
                                </View>
                            </View>
                        </View>

                        <View style={Styles.summaryRowInnerView}>
                            <View style={Styles.summaryRowView}>
                                <View style={Styles.increaseButtonView}>
                                    <Image
                                        source={require("@assets/icons/icon24BlackKliaEkspres.png")}
                                        style={Styles.summaryIcon}
                                        resizeMethod="auto"
                                        resizeMode="contain"
                                    />
                                </View>
                                <View style={Styles.increaseButtonView11}>
                                    <View style={Styles.summaryTextView}>
                                        <View style={Styles.summaryValueArrowView}>
                                            <Typo
                                                fontSize={12}
                                                fontWeight="100"
                                                fontStyle="normal"
                                                s
                                                letterSpacing={0}
                                                lineHeight={18}
                                                color="#787878"
                                                textAlign="left"
                                            >
                                                <Text>From</Text>
                                            </Typo>

                                            <Image
                                                source={require("@assets/icons/arrowklia.png")}
                                                style={Styles.fromToArrowIcon}
                                                resizeMethod="auto"
                                                resizeMode="contain"
                                            />
                                        </View>

                                        <View style={Styles.summaryValueTextView}>
                                            <Typo
                                                fontSize={14}
                                                fontWeight="600"
                                                fontStyle="normal"
                                                letterSpacing={0}
                                                lineHeight={18}
                                                color="#000000"
                                                textAlign="left"
                                            >
                                                <Text>{item.from}</Text>
                                            </Typo>
                                        </View>
                                    </View>
                                    <View style={Styles.summaryTextView2}>
                                        <Typo
                                            fontSize={12}
                                            fontWeight="100"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={18}
                                            color="#787878"
                                            textAlign="left"
                                        >
                                            <Text>To</Text>
                                        </Typo>
                                        <View style={Styles.summaryValueTextView}>
                                            <Typo
                                                fontSize={14}
                                                fontWeight="600"
                                                fontStyle="normal"
                                                letterSpacing={0}
                                                lineHeight={18}
                                                color="#000000"
                                                textAlign="left"
                                            >
                                                <Text>{item.to}</Text>
                                            </Typo>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </View>
                        <View style={Styles.summaryRowLine} />
                        <View style={[Styles.qrView]}>
                            <QRCodew
                                value={item.bookingNo}
                                size={134}
                                bgColor="#ffffff"
                                fgColor="#000000"
                            />
                        </View>
                        <View style={Styles.summaryRowLine} />

                        <View style={Styles.summaryRowInnerView}>
                            <View style={Styles.summaryRowView}>
                                <View style={Styles.increaseButtonView}>
                                    <Image
                                        source={require("@assets/icons/kliaEkspress.png")}
                                        style={Styles.kliaIcon}
                                        resizeMethod="resize"
                                        resizeMode="stretch"
                                    />
                                </View>
                                <View style={Styles.summaryTextBottomView}>
                                    <Typo
                                        fontSize={14}
                                        fontWeight="600"
                                        fontStyle="normal"
                                        letterSpacing={0}
                                        lineHeight={18}
                                        color="#000000"
                                        textAlign="left"
                                    >
                                        <Text>{item.trip}</Text>
                                    </Typo>
                                    <View style={Styles.summaryValueTextView2}>
                                        <Typo
                                            fontSize={12}
                                            fontWeight="100"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={19}
                                            color="#000000"
                                            textAlign="left"
                                        >
                                            <Text>{item.cat}</Text>
                                        </Typo>
                                    </View>
                                    <View style={Styles.summaryValueTextView3}>
                                        <Typo
                                            fontSize={12}
                                            fontWeight="100"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={19}
                                            color="#787878"
                                            textAlign="left"
                                        >
                                            <Text>{item.validity}</Text>
                                        </Typo>
                                    </View>
                                </View>
                            </View>
                            <View style={Styles.summaryRowLine} />
                        </View>
                    </View>
                </TouchableOpacity>
            )}
            testID={"walletActionList"}
            accessibilityLabel={"walletActionList"}
        />
    );
};
const Styles = {
    flatList: {
        marginTop: 5,
        marginBottom: 5,
    },
    touchView: {
        flex: 1,
    },
    actionItem: {
        backgroundColor: "#ffffff",
        borderRadius: borderRadius,
        flexDirection: "column",
        height: 381,
        marginLeft: 23,
        marginRight: 0,
        width: "92%",

        elevation: 2,
    },
    actionItemLast: {
        backgroundColor: "#ffffff",
        borderRadius: borderRadius,
        flexDirection: "column",
        height: 381,
        marginLeft: 23,
        marginRight: 23,
        width: "92%",

        elevation: 2,
    },
    firstView: {
        borderTopLeftRadius: borderRadius,
        borderTopRightRadius: borderRadius,
        flexDirection: "column",
        justifyContent: "center",
        backgroundColor: "#F0F0F0",
        height: 56,
        width: "100%",
    },
    firstView1: {
        flexDirection: "column",
        backgroundColor: "#f8f8f8",
        alignSelf: "flex-end",
    },
    actionItemImage: {
        height: 77,
        marginLeft: 16,
        marginTop: 51,
        width: 77,
    },

    selectionImageView: {
        height: 20,
        marginRight: 14,
        marginTop: -30,
        borderRadius: 10,

        width: 20,
    },
    selectionImage: {
        height: 20,
        width: 20,
    },
    ticketText: {
        fontFamily: "montserrat",
        fontSize: 12,
        fontWeight: "normal",
        fontStyle: "normal",
        lineHeight: 18,
        letterSpacing: 0,
        textAlign: "center",
        color: "#787878",
    },
    ticketValueText: {
        fontFamily: "montserrat",
        fontSize: 12,
        fontWeight: "bold",
        fontStyle: "normal",
        lineHeight: 18,
        letterSpacing: 0,
        textAlign: "center",
        color: "#000000",
    },
    summaryIcon: {
        height: 24,
        paddingTop: 6,
        width: 22,
    },
    summaryRowInnerView: {
        flexDirection: "column",
        justifyContent: "flex-start",
        width: "100%",
        marginLeft: 24,
        marginTop: 16,
    },
    summaryRowLine: {
        backgroundColor: "#eaeaea",
        borderColor: "#eaeaea",
        borderStyle: "solid",
        height: 1,
        justifyContent: "center",
        marginTop: 15.2,
        marginLeft: 24,
        marginRight: 0,
        width: "89%",
    },
    summaryRowView: {
        alignContent: "center",
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "flex-start",

        width: "100%",
    },
    summaryTextBottomView: {
        marginLeft: 16,
        marginRight: 0,
        flex: 1,
    },
    summaryTextView: {
        marginLeft: 16,
        marginRight: 0,
        flex: 0.8,
    },

    summaryTextView2: {
        marginLeft: 0,
        marginRight: 0,
        marginTop: 5,
        flex: 1,
    },
    summaryValueArrowView: { flexDirection: "row", marginTop: 5 },
    summaryValueTextView: { marginTop: 5 },
    summaryValueTextView1: { marginTop: 15 },
    summaryValueTextView2: { marginTop: 0 },
    summaryValueTextView3: { marginTop: 0 },
    summaryValueTextView4: { marginTop: 2 },
    qrView: {
        flexDirection: "column",
        justifyContent: "center",
        alignContent: "center",
        alignItems: "center",
        alignSelf: "center",
        width: "100%",
        marginLeft: 0,
        marginTop: 13.8,
    },
    kliaIcon: {
        height: 45,
        marginTop: -6,
        width: 45,
    },
    fromToArrowIcon: {
        height: 6,
        marginLeft: 0,
        marginTop: 8,
        width: "100%",
    },
    increaseButtonView: {},
    increaseButtonView11: { flexDirection: "row" },
};

export { KliaViewTicketList };
