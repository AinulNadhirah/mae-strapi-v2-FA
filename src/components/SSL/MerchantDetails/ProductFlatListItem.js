import { CacheeImage } from "cachee";
import PropTypes from "prop-types";
import React from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";

import Typo from "@components/Text";

import { YELLOW, WHITE, SHADOW_CLOSED_MENU, MEDIUM_GREY, BLACK } from "@constants/colors";

import { commaAdder } from "@utils/dataModel/utilityPartial.1";
import { priceFinalAmount } from "@utils/dataModel/utilitySSLOptionGroup";

import SSLStyles from "@styles/SSLStyles";

import assets from "@assets";

export default function ProductFlatListItem({
    isHighlighted,
    isSst,
    sstPercentage,
    isMerchantOpen,
    item,
    onPressItem,
    cartV1,
}) {
    function onPress() {
        onPressItem(item, cartV1);
    }

    const count = cartV1?.cartProducts?.reduce((accumulator, obj) => {
        return accumulator + (obj.productId === item.productId ? obj.count : 0);
    }, 0);

    return (
        <View style={styles.containerBackground}>
            <TouchableOpacity onPress={onPress} style={styles.menuContainer}>
                <View
                    style={[
                        styles.menuItemContainer,
                        isHighlighted && styles.menuItemContainerHighlighted,
                    ]}
                >
                    <View style={styles.menuDetailContainer}>
                        <View style={styles.container}>
                            <Typo
                                fontWeight="semi-bold"
                                fontSize={12}
                                textAlign="left"
                                text={item?.name}
                                numberOfLines={2}
                            />
                            <View style={styles.descContainerSpacing} />
                            <Typo
                                fontSize={12}
                                lineHeight={16}
                                numberOfLines={2}
                                textAlign="left"
                                text={item?.shortDesc}
                                textAlignVertical="center"
                            />
                        </View>
                        <Typo
                            fontWeight="semi-bold"
                            fontSize={14}
                            textAlign="left"
                            text={`${item?.currency} ${commaAdder(
                                priceFinalAmount({
                                    isSst,
                                    amount: item?.priceAmount,
                                    sstPercentage,
                                }).toFixed(2)
                            )}`}
                        />
                    </View>
                    <View style={styles.containerLogo}>
                        <CacheeImage
                            source={
                                item?.logo ? { uri: item?.logo } : assets.SSLProductIconPlaceholder
                            }
                            style={styles.containerLogo}
                            resizeMode={item?.logo ? "cover" : "contain"}
                        />
                        {!!count && (
                            <View style={styles.countView}>
                                <Typo
                                    color={YELLOW}
                                    fontWeight="semi-bold"
                                    fontSize={12}
                                    textAlign="center"
                                    text={`${count}`}
                                />
                            </View>
                        )}
                    </View>
                </View>

                {(!item?.avail || !isMerchantOpen) && <View style={styles.itemUnavailable} />}
            </TouchableOpacity>
        </View>
    );
}
ProductFlatListItem.propTypes = {
    isHighlighted: PropTypes.bool,
    item: PropTypes.object,
    onPressItem: PropTypes.func,
    cartV1: PropTypes.object,
    isSst: PropTypes.bool,
    sstPercentage: PropTypes.number,
    isMerchantOpen: PropTypes.bool,
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    containerBackground: { backgroundColor: MEDIUM_GREY },
    containerLogo: {
        height: 112,
        width: 112,
    },
    countView: {
        alignItems: "center",
        backgroundColor: BLACK,
        borderRadius: 12,
        bottom: 8,
        height: 24,
        justifyContent: "center",
        position: "absolute",
        right: 8,
        width: 24,
    },
    descContainerSpacing: { height: 4 },
    itemUnavailable: {
        backgroundColor: SHADOW_CLOSED_MENU,
        borderRadius: 8,
        height: 112,
        overflow: "hidden",
        position: "absolute",
        width: "100%",
    },
    menuContainer: {
        backgroundColor: WHITE,
        borderRadius: 8,
        marginBottom: 16,
        marginHorizontal: 24,
        ...SSLStyles.shadow,
    },
    menuDetailContainer: {
        backgroundColor: WHITE,
        flex: 2,
        paddingBottom: 8,
        paddingHorizontal: 16,
        paddingTop: 12,
    },
    menuItemContainer: {
        borderRadius: 8,
        flexDirection: "row",
        height: 112,
        overflow: "hidden",
    },
    menuItemContainerHighlighted: { borderColor: YELLOW, borderWidth: 2 },
});
