import PropTypes from "prop-types";
import React from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";

import RadioChecked from "@components/Common/RadioChecked";
import RadioUnchecked from "@components/Common/RadioUnchecked";
import Typo from "@components/Text";

import { WHITE } from "@constants/colors";

export const DebitCardSelector = ({
    cardImageSource,
    cardName,
    cardIndex,
    selectedCardIndex,
    onDebitCardSelected,
    cardItem,
}) => {
    function onDebitCardViewDidTap() {
        onDebitCardSelected(cardIndex, cardName, cardItem);
    }

    return (
        <View style={Style.debitCardContainer}>
            <TouchableOpacity onPress={onDebitCardViewDidTap}>
                <View style={Style.cardInternalMargins}>
                    <View style={Style.debitCardSelectorContainer}>
                        <View style={Style.dataContainer}>
                            <Typo
                                fontSize={16}
                                fontWeight="600"
                                lineHeight={20}
                                textAlign="left"
                                text={cardName}
                            />
                        </View>
                        {cardIndex === selectedCardIndex ? (
                            <RadioChecked checkType="color" />
                        ) : (
                            <RadioUnchecked />
                        )}
                    </View>

                    <Image
                        source={cardImageSource}
                        style={Style.debitCardImage}
                        resizeMode="stretch"
                        resizeMethod="scale"
                    />
                </View>
            </TouchableOpacity>
        </View>
    );
};

DebitCardSelector.propTypes = {
    props: PropTypes.object,
    cardIndex: PropTypes.string,
    cardImageSource: PropTypes.string,
    cardName: PropTypes.string,
    onDebitCardSelected: PropTypes.func,
    selectedCardIndex: PropTypes.number,
    cardItem: PropTypes.object,
};

const Style = StyleSheet.create({
    cardInternalMargins: {
        marginHorizontal: 16,
        marginVertical: 16,
    },

    dataContainer: {
        maxWidth: 260,
    },

    debitCardContainer: {
        backgroundColor: WHITE,
        borderRadius: 8,
    },

    debitCardImage: {
        height: 97,
        marginTop: 8,
        width: 153,
    },

    debitCardSelectorContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
});
