import PropTypes from "prop-types";
import React from "react";
import { StyleSheet, View } from "react-native";

import Popup from "@components/Popup";
import Typo from "@components/Text";

import { BLACK } from "@constants/colors";

function OfferDisclaimerPopup({ visible, onClose }) {
    const data = [
        "The effective profit rate is subject to change over the course of your financing.",
        "The offer we make are subject to change under the sole discretion of the bank with or without prior notice.",
        "We assume that the information given by the user is accurate and up to date. The bank reserves the rights to retract this offer if we find that the information provided is not accurate.",
    ];

    const renderContent = () => {
        return (
            <View style={Style.container}>
                <Typo
                    text="Offer Conditions"
                    textAlign="left"
                    lineHeight={18}
                    fontWeight="600"
                    style={Style.title}
                />

                <View>
                    {data.map((item, index) => {
                        return (
                            <View style={Style.rowContainer} key={index}>
                                <View style={Style.dotContainer}>
                                    <View style={Style.dot} />
                                </View>
                                <Typo
                                    text={item}
                                    textAlign="left"
                                    lineHeight={20}
                                    style={Style.rowText}
                                />
                            </View>
                        );
                    })}
                </View>
            </View>
        );
    };

    return <Popup visible={visible} onClose={onClose} ContentComponent={renderContent} />;
}

OfferDisclaimerPopup.propTypes = {
    visible: PropTypes.bool,
    onClose: PropTypes.func,
};

const Style = StyleSheet.create({
    container: {
        paddingBottom: 16,
        paddingHorizontal: 40,
        paddingTop: 40,
    },

    dot: {
        backgroundColor: BLACK,
        borderRadius: 1,
        height: 2,
        marginLeft: 2,
        marginTop: 2,
        width: 2,
    },

    dotContainer: {
        height: 20,
        justifyContent: "center",
        width: 10,
    },

    rowContainer: {
        flexDirection: "row",
        marginBottom: 10,
    },

    rowText: {
        flex: 1,
        marginLeft: 5,
    },

    title: {
        marginBottom: 20,
    },
});

export default OfferDisclaimerPopup;
