import PropTypes from "prop-types";
import React from "react";
import { StyleSheet, Image, View } from "react-native";

import Typo from "@components/Text";

import { WHITE, GREY, DARK_GREY, OFF_WHITE } from "@constants/colors";

const DynamicImageSmall = ({ date }) => {
    const imgSource = date?.image?.type === "local" ? date?.image?.image : { uri: date?.image };
    return (
        <View style={styles.container}>
            {date && date.image ? (
                <View style={styles.border}>
                    <Image
                        accessible={true}
                        style={styles.imageAvatar}
                        resizeMode="cover"
                        source={imgSource}
                    />
                </View>
            ) : (
                <View style={styles.imageTextIntialsView}>
                    <Typo
                        fontSize={13}
                        fontWeight="300"
                        fontStyle="normal"
                        color={DARK_GREY}
                        text={date && date.name ? getInitials(date.name) : ""}
                    />
                </View>
            )}
        </View>
    );
};
const getInitials = function (text) {
    return text
        ? text
              .trim()
              .split(" ")
              .reduce(
                  (acc, cur, idx, arr) =>
                      acc +
                      (arr.length > 1
                          ? idx == 0 || idx == arr.length - 1
                              ? cur.substring(0, 1)
                              : ""
                          : cur.substring(0, 2)),
                  ""
              )
              .toUpperCase()
        : text;
};
const styles = StyleSheet.create({
    border: {
        alignItems: "center",
        backgroundColor: WHITE,
        borderColor: OFF_WHITE,
        borderRadius: 42 / 2,
        borderStyle: "solid",
        borderWidth: 2,
        elevation: 5,
        flexDirection: "column",
        height: 42,
        justifyContent: "center",
        overflow: "hidden",
        shadowColor: "rgba(0, 0, 0, 0.2)",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 1,
        shadowRadius: 15,
        width: 42,
    },
    container: {
        alignContent: "center",
        alignItems: "center",
        elevation: 8,
        flexDirection: "column",
        height: 40,
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        width: 40,
    },
    imageAvatar: {
        alignContent: "center",
        alignItems: "center",
        borderRadius: 40 / 2,
        height: 40,
        justifyContent: "center",
        width: 40,
    },
    imageTextIntialsView: {
        alignContent: "center",
        alignItems: "center",
        backgroundColor: GREY,
        borderColor: OFF_WHITE,
        borderRadius: 40 / 2,
        borderStyle: "solid",
        borderWidth: 1,
        elevation: 5,
        flexDirection: "column",
        height: 40,
        justifyContent: "center",
        overflow: "hidden",
        shadowColor: "rgba(0, 0, 0, 0.2)",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 1,
        shadowRadius: 15,
        width: 40,
    },
});

DynamicImageSmall.propTypes = {
    date: PropTypes.array,
    type: PropTypes.string,
};

const Memoiz = React.memo(DynamicImageSmall);

export default Memoiz;
