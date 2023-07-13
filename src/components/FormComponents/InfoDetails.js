import PropTypes from "prop-types";
import React from "react";
import { TouchableOpacity, View, StyleSheet, Image, Platform } from "react-native";

import Typo from "@components/Text";

import { WHITE, BLUE, BLACK } from "@constants/colors";

const InfoDetails = ({ title, info, hidden, handlePress, buttonValue }) => {
    function onButtonPress() {
        handlePress(buttonValue);
    }
    return (
        <View style={styles.infoDetailContainer}>
            <View style={styles.infoDetailRow}>
                <Typo
                    fontSize={14}
                    fontWeight="600"
                    fontStyle="normal"
                    letterSpacing={0}
                    lineHeight={24}
                    textAlign="left"
                    text={title}
                />
                {!hidden && (
                    <TouchableOpacity onPress={onButtonPress} style={styles.editText}>
                        <Typo
                            fontSize={14}
                            fontWeight="600"
                            fontStyle="normal"
                            letterSpacing={0}
                            lineHeight={18}
                            color={BLUE}
                            style={styles.editButton}
                            textAlign="left"
                            text="Edit"
                        />
                    </TouchableOpacity>
                )}
            </View>
            {info.map((infoDetail, i) => {
                if (infoDetail?.displayValue) {
                    return (
                        <View key={i} style={styles.infoDetailSubContainer}>
                            <View style={styles.infoDetailContent}>
                                <View style={styles.infoContentLeft}>
                                    {infoDetail?.displayKey && (
                                        <Typo
                                            fontSize={13}
                                            fontWeight="normal"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={18}
                                            textAlign="left"
                                            text={infoDetail?.displayKey}
                                        />
                                    )}
                                    {infoDetail?.image && (
                                        <Image
                                            resizeMode={Platform.select({
                                                ios: "contain",
                                                android: "cover",
                                            })}
                                            source={{
                                                uri: infoDetail?.image,
                                            }}
                                            style={styles.cardImage}
                                        />
                                    )}
                                </View>
                                <View style={styles.infoContentRight}>
                                    <Typo
                                        fontSize={14}
                                        fontWeight="600"
                                        fontStyle="normal"
                                        letterSpacing={0}
                                        lineHeight={18}
                                        textAlign="right"
                                        text={infoDetail?.displayValue}
                                    />
                                </View>
                            </View>
                        </View>
                    );
                }
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    cardImage: { height: 40, width: 65 },

    editText: {},
    infoContentLeft: {
        alignItems: "flex-start",
        width: "40%",
    },
    infoContentRight: {
        alignItems: "flex-end",
        width: "60%",
    },
    infoDetailContainer: {
        backgroundColor: WHITE,
        marginVertical: 10,
        paddingHorizontal: 24,
        paddingVertical: 15,
        shadowColor: BLACK,
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.15,
        shadowRadius: 1.84,
    },
    infoDetailContent: {
        alignContent: "center",
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
    },
    infoDetailRow: {
        alignContent: "center",
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 10,
    },
    infoDetailSubContainer: {
        paddingVertical: 5,
    },
});

InfoDetails.propTypes = {
    title: PropTypes.string,
    info: PropTypes.array,
    hidden: PropTypes.bool,
    handlePress: PropTypes.func,
    buttonValue: PropTypes.string,
};

export { InfoDetails };
