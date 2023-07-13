import React, { useCallback } from "react";
import { View, StyleSheet, Image } from "react-native";
import PropTypes from "prop-types";
import Typo from "@components/Text";
import Spring from "@components/Animations/Spring";
import { WHITE } from "@constants/colors";
import Assets from "@assets";
import { getShadow } from "@utils/dataModel/utility";

const AccountItem = ({
    accountName,
    accountNumber,
    accountFormattedAmount,
    isSelected,
    onAccountItemPressed,
    index,
}) => {
    const onPress = useCallback(
        () =>
            onAccountItemPressed({
                accountName,
                accountNumber,
                accountFormattedAmount,
                isSelected,
                onAccountItemPressed,
                index,
            }),
        [
            onAccountItemPressed,
            accountNumber,
            index,
            accountFormattedAmount,
            accountName,
            isSelected,
        ]
    );

    return (
        <Spring style={styles.accountItemContainer} onPress={onPress} activeOpacity={0.9}>
            <>
                <View style={styles.accountItemTextContainer}>
                    <Typo
                        text={accountName}
                        fontSize={12}
                        fontWeight="600"
                        lineHeight={18}
                        numberOfLines={1}
                        ellipsizeMode="middle"
                    />
                    <Typo text={accountNumber} fontSize={12} lineHeight={18} color="#7c7c7d" />
                    <Typo text={`RM ${accountFormattedAmount}`} fontSize={12} lineHeight={18} />
                </View>
                <View style={styles.accountItemImageContainer}>
                    {isSelected && (
                        <Image style={styles.tickGreenImage} source={Assets.icRoundedGreenTick} />
                    )}
                </View>
            </>
        </Spring>
    );
};

const styles = StyleSheet.create({
    accountItemContainer: {
        backgroundColor: WHITE,
        borderRadius: 8,
        flexDirection: "row",
        height: 89,
        paddingHorizontal: 20,
        paddingVertical: 12,
        width: 240,
        ...getShadow({}),
    },
    accountItemImageContainer: {
        alignItems: "center",
        justifyContent: "center",
        width: 22,
    },
    accountItemTextContainer: {
        alignItems: "flex-start",
        flex: 1,
        justifyContent: "space-around",
    },
    tickGreenImage: {
        height: 22,
        width: 22,
    },
});

AccountItem.propTypes = {
    accountName: PropTypes.string.isRequired,
    accountNumber: PropTypes.string.isRequired,
    accountFormattedAmount: PropTypes.string.isRequired,
    isSelected: PropTypes.bool.isRequired,
    onAccountItemPressed: PropTypes.func.isRequired,
    index: PropTypes.number.isRequired,
};

export default React.memo(AccountItem);
