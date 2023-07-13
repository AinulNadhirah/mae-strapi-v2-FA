import PropTypes from "prop-types";
import React from "react";
import { View, StyleSheet, Image } from "react-native";

import Typo from "@components/Text";

import { BLACK } from "@constants/colors";
import { CASA, CARDS, ACCOUNT, REASON_TO_BLOCK } from "@constants/strings";

import { formateAccountNumber, maskAccount, getCreditCardImageURL } from "@utils/dataModel/utility";

import assets from "@assets";

function DeactivateCardsCASAInfo({
    name,
    number,
    index,
    title,
    blockReason,
    itemToDeactivate,
    cardImage,
}) {
    const cardImageUrl = getCreditCardImageURL(cardImage);
    function getAccDetails() {
        if (blockReason) return blockReason;
        else if (itemToDeactivate === CASA) {
            return `${name}\n${formateAccountNumber(number, 12)}`;
        } else if (itemToDeactivate === CARDS) {
            return `${name}\n${maskAccount(number)}`;
        }
    }
    function getTitleText() {
        if (itemToDeactivate === CASA) {
            return (
                <Typo
                    fontSize={14}
                    lineHeight={18}
                    letterSpacing={0}
                    color={BLACK}
                    textAlign="left"
                    text={title || `${ACCOUNT} ${index + 1}`}
                    style={styles.accountName}
                />
            );
        } else if (itemToDeactivate === CARDS) {
            if (blockReason) {
                return (
                    <Typo
                        fontSize={14}
                        lineHeight={18}
                        letterSpacing={0}
                        color={BLACK}
                        textWeight="400"
                        textAlign="left"
                        text={REASON_TO_BLOCK}
                        style={styles.accountName}
                    />
                );
            } else if (cardImageUrl) {
                return <Image source={{ uri: cardImageUrl }} style={styles.cardImage} />;
            } else {
                return <Image source={assets.creditCardPlaceholder} style={styles.cardImage} />;
            }
        }
    }
    return (
        <View style={styles.accountDetails}>
            {getTitleText()}
            <Typo
                fontSize={14}
                lineHeight={18}
                letterSpacing={0}
                fontWeight="600"
                color={BLACK}
                textAlign="right"
                text={getAccDetails()}
                style={styles.accountNumber}
            />
        </View>
    );
}

export default DeactivateCardsCASAInfo;

DeactivateCardsCASAInfo.propTypes = {
    name: PropTypes.string,
    number: PropTypes.string,
    index: PropTypes.number,
    title: PropTypes.string,
    blockReason: PropTypes.string,
    itemToDeactivate: PropTypes.string,
    cardImage: PropTypes.string,
};

DeactivateCardsCASAInfo.defaultProps = {
    name: "",
    number: "",
    index: 0,
    title: "",
    blockReason: "",
    itemToDeactivate: "",
    cardImage: "",
};

const styles = StyleSheet.create({
    accountDetails: {
        alignItems: "flex-start",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        paddingBottom: 24,
    },
    accountName: {
        width: "50%",
    },
    accountNumber: {
        width: "50%",
    },
    cardImage: {
        width: 60,
        height: 38,
    },
});
