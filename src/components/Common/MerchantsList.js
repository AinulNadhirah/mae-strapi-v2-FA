import React from "react";
import { StyleSheet, View, FlatList, TouchableOpacity, Image } from "react-native";
import PropTypes from "prop-types";
import Typo from "@components/Text";

const MerchantsList = ({ onItemPressed, items }) => {
    const renderItems = ({ item }) => {
        function handlePress() {
            onItemPressed(item);
        }
        return (
            <TouchableOpacity onPress={handlePress}>
                <View style={styles.seperator} />
                <View style={styles.listView}>
                    <View style={styles.imageView}>
                        <Image source={{ uri: item.imageUrl }} style={styles.image} />
                    </View>
                    <View style={styles.textView}>
                        <Typo
                            fontSize={14}
                            fontWeight="600"
                            fontStyle="normal"
                            letterSpacing={0}
                            textAlign="left"
                            lineHeight={18}
                            style={styles.titleText}
                            text="Canopy Rooftop Bar & Lounge"
                        />
                        <View style={styles.amountView}>
                            <Typo
                                fontSize={12}
                                fontWeight="600"
                                fontStyle="normal"
                                letterSpacing={0}
                                textAlign="left"
                                lineHeight={18}
                                style={styles.priceText}
                                color="#7c7c7d"
                                text="$$$$$"
                            />
                            <View style={styles.circularView} />
                            <Typo
                                fontSize={12}
                                fontWeight="600"
                                fontStyle="normal"
                                letterSpacing={0}
                                textAlign="right"
                                lineHeight={18}
                                color="#7c7c7d"
                                style={styles.distancetext}
                                text="5 km"
                            />
                        </View>
                    </View>
                </View>
                <View style={styles.seperator} />
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <FlatList data={items} renderItem={renderItems} />
        </View>
    );
};

const styles = StyleSheet.create({
    amountText: {
        color: "#000000",
        fontFamily: "montserrat",
        fontSize: 16,
        fontStyle: "normal",
        fontWeight: "600",
        letterSpacing: 0,
        lineHeight: 18,
        marginLeft: 12,
    },

    amountView: {
        alignItems: "center",
        flexDirection: "row",
        marginTop: 10,
    },
    circularView: {
        backgroundColor: "#7c7c7d",
        borderRadius: 2,
        height: 4,
        width: 4,
    },
    container: {
        flex: 1,
    },

    distancetext: {
        marginLeft: 2,
        width: 40,
    },
    image: {
        borderRadius: 8,
        height: "100%",
        left: 0,
        position: "absolute",
        top: 0,
        width: "100%",
    },

    imageView: {
        borderRadius: 8,
        height: "100%",
        width: "45%",
    },
    listView: {
        backgroundColor: "#ffffff",
        borderRadius: 8,
        flexDirection: "row",
        height: 112,
        marginLeft: 20,
        marginRight: 20,
        shadowColor: "rgba(0, 0, 0, 0.2)",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 1,
        shadowRadius: 40,
    },
    priceText: {
        width: 45,
    },
    radioButton: {
        marginLeft: 25,
        width: "80%",
    },
    seperator: {
        backgroundColor: "transparent",
        height: 10,
        width: "100%",
    },
    textView: {
        marginLeft: 16,
        marginTop: 10,
        width: "45%",
    },
    titleText: {
        color: "#000000",
        letterSpacing: 0,
    },
});

MerchantsList.propTypes = {
    onItemPressed: PropTypes.func.isRequired,
    items: PropTypes.array,
    textKey: PropTypes.string,
    itemAmount: PropTypes.string,
};

export default MerchantsList;
