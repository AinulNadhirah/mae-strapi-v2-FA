/* eslint-disable react/jsx-no-bind */
/* eslint-disable react/prop-types */
import React from "react";
import { View, Image, TouchableOpacity, ScrollView, Text } from "react-native";
import { HighlightText } from "./HighlightText";
import { Dialog } from "react-native-simple-dialogs";
const GuiltyPleasureInfoPopup = ({ visible, onClose }) => {
    return (
        <Dialog
            visible={visible}
            onTouchOutside={onClose}
            animationType="fade"
            onRequestClose={onClose}
            dialogStyle={{ borderRadius: 10 }}
            overlayStyle={{}}
        >
            <View>
                <View style={Styles.block}>
                    <View style={Styles.titleContainer}>
                        <Text style={Styles.titleNormal}>{"Category"}</Text>
                    </View>
                    <View style={Styles.imageContainer}>
                        <TouchableOpacity onPress={onClose}>
                            <Image
                                style={Styles.closeButton}
                                source={require("@assets/icons/ic_close.png")}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={Styles.descriptionContainer}>
                    <ScrollView>
                        <View>
                            <Text style={Styles.modelTitleText}>
                                {"Items that fall under each category\nlisted:"}
                            </Text>

                            <View style={Styles.modelTextRow}>
                                <HighlightText
                                    highlightStyle={Styles.modelTextBold}
                                    searchWords={["Electronics:"]}
                                    style={Styles.modelText}
                                    textToHighlight={
                                        "Electronics: Household appliances, computer and Digital applications."
                                    }
                                />
                            </View>

                            <View style={Styles.modelTextRow}>
                                <HighlightText
                                    highlightStyle={Styles.modelTextBold}
                                    searchWords={["Entertainment:"]}
                                    style={Styles.modelText}
                                    textToHighlight={
                                        "Entertainment: Photography, Music, gaming, Art & Craft, Art gallery, Motion picture, Tourist attractions and Amusement Parks."
                                    }
                                />
                            </View>

                            <View style={Styles.modelTextRow}>
                                <HighlightText
                                    highlightStyle={Styles.modelTextBold}
                                    searchWords={["Food & Beverage:"]}
                                    style={Styles.modelText}
                                    textToHighlight={
                                        "Food & Beverage: Restaurants, Beverages, Bakery, Grocery and Caterers."
                                    }
                                />
                            </View>

                            <View style={Styles.modelTextRow}>
                                <HighlightText
                                    highlightStyle={Styles.modelTextBold}
                                    searchWords={["Health & Beauty:"]}
                                    style={Styles.modelText}
                                    textToHighlight={
                                        "Health & Beauty: Cosmetics, Beauty & Barber stores, Massage parlors and Health Spas."
                                    }
                                />
                            </View>

                            <View style={Styles.modelTextRow}>
                                <HighlightText
                                    highlightStyle={Styles.modelTextBold}
                                    searchWords={["Leisure & Sports:"]}
                                    style={Styles.modelText}
                                    textToHighlight={
                                        "Leisure & Sports: Recreational camping, Bicycle, Sporting goods, Sports & Membership club and Golf."
                                    }
                                />
                            </View>

                            <View style={Styles.modelTextRow}>
                                <HighlightText
                                    highlightStyle={Styles.modelTextBold}
                                    searchWords={["Shopping:"]}
                                    style={Styles.modelText}
                                    textToHighlight={
                                        "Shopping: Jewelry & watches, Stationary & book stores, Clothes, Shoes, Department stores, Luggage and Sewing store."
                                    }
                                />
                            </View>

                            <View style={Styles.modelTextRow}>
                                <HighlightText
                                    highlightStyle={Styles.modelTextBold}
                                    searchWords={["Travel:"]}
                                    style={Styles.modelText}
                                    textToHighlight={
                                        "Travel: Airlines, Accommodation, Airport terminal and Travel agency."
                                    }
                                />
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Dialog>
    );
};

const Styles = {
    block: { flexDirection: "row", alignItems: "center" },
    titleContainer: { alignItems: "flex-start", flex: 4 },
    titleNormal: {
        fontFamily: "montserrat",
        fontSize: 14,
        fontWeight: "600",
        fontStyle: "normal",
        lineHeight: 18,
        letterSpacing: 0,
        color: "#000000",
    },
    imageContainer: { alignItems: "flex-end", flex: 1 },
    closeButton: {
        height: 40,
        width: 40,
    },
    descriptionContainer: { marginTop: 10 },
    modelTextRow: {
        flexDirection: "row",
        marginTop: 7,
        marginBottom: 7,
    },
    modelTitleText: {
        fontFamily: "montserrat",
        fontSize: 14,
        fontWeight: "normal",
        fontStyle: "normal",
        lineHeight: 20,
        letterSpacing: 0,
        color: "#000000",
        marginTop: 4,
        marginBottom: 4,
    },
    modelText: {
        fontFamily: "montserrat",
        fontSize: 14,
        fontWeight: "normal",
        fontStyle: "normal",
        lineHeight: 20,
        letterSpacing: 0,
        color: "#000000",
    },
    modelTextBold: {
        fontFamily: "montserrat",
        fontSize: 14,
        fontWeight: "700",
        fontStyle: "normal",
        lineHeight: 20,
        letterSpacing: 0,
        color: "#000000",
    },
};

export { GuiltyPleasureInfoPopup };
