import PropTypes from "prop-types";
import React from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";

import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";

import { DARK_GREY, DISABLED_TEXT, WHITE } from "@constants/colors";
import { CURRENCY } from "@constants/strings";

import Assets from "@assets";

export const CASAAccountSelector = ({
    onAccountTileDidTap,
    accountCode,
    accountName,
    accountNumber,
    accountBalance,
    accountIndex,
    selectedIndex,
}) => {
    function onAccountSelectorDidTap() {
        onAccountTileDidTap(accountIndex, accountCode, accountNumber);
    }

    return (
        <TouchableOpacity onPress={onAccountSelectorDidTap}>
            <View style={Style.accountCardContainer}>
                <View style={Style.cardInternalMargins}>
                    <View style={Style.accountCardTickContainer}>
                        <View>
                            <Typo
                                fontSize={12}
                                fontWeight="600"
                                lineHeight={18}
                                textAlign="left"
                                text={accountName}
                            />
                            <SpaceFiller height={4} />
                            <Typo
                                fontSize={12}
                                fontWeight="400"
                                lineHeight={19}
                                textAlign="left"
                                text={accountNumber}
                                color={DARK_GREY}
                            />
                            <SpaceFiller height={4} />
                            <Typo
                                fontSize={12}
                                fontWeight="400"
                                lineHeight={18}
                                textAlign="left"
                                text={`${CURRENCY}${accountBalance}`}
                            />
                        </View>
                        <View>
                            {accountIndex === selectedIndex && (
                                <Image source={Assets.icRoundedGreenTick} style={Style.tickImage} />
                            )}
                        </View>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

CASAAccountSelector.propTypes = {
    accountCode: PropTypes.string,
    accountName: PropTypes.string,
    accountNumber: PropTypes.string,
    accountBalance: PropTypes.string,
    accountIndex: PropTypes.number,
    selectedIndex: PropTypes.number,
    onAccountTileDidTap: PropTypes.func,
};

const Style = StyleSheet.create({
    accountCardContainer: {
        backgroundColor: WHITE,
        borderBottomWidth: 0,
        borderColor: DISABLED_TEXT,
        borderRadius: 8,
        elevation: 3,
        marginRight: 16,
        marginVertical: 16,
        minWidth: 240,
        shadowColor: WHITE,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.9,
        shadowRadius: 3,
    },

    accountCardTickContainer: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
    },

    cardInternalMargins: {
        marginHorizontal: 16,
        marginVertical: 16,
    },

    tickImage: {
        height: 22,
        width: 22,
    },
});
