import PropTypes from "prop-types";
import React from "react";
import { Dimensions } from "react-native";

import ActionButton from "@components/Buttons/ActionButton";
import Typo from "@components/Text";

import { BLACK, YELLOW, WHITE, GREY } from "@constants/colors";

import { commaAdder } from "@utils/dataModel/utilityPartial.1";
import { priceFinalAmount } from "@utils/dataModel/utilitySSLOptionGroup";

const { width } = Dimensions.get("window");

export default function ActionBtnLogic({
    onPress,
    tempCount,
    item,
    options,
    isNewOrder,
    cartCount,
    isEnabled,
    isSst,
    sstPercentage,
    isMerchantOpen,
}) {
    var label = "";
    var backgroundColor = YELLOW;
    var borderColor;
    var labelColor = BLACK;

    /**
     * !item.avail Item Not available - pale white
     * 0 -> 0   Back to Menu
     * 0 -> 1   Add 1 to Cart - RM 10.00
     * !0 -> !1 Update Order - RM 10.00
     * !0 -> 0  Remove item from Cart - pale white
     */
    if (!item?.avail || !isMerchantOpen) {
        label = "Item Unavailable";
        backgroundColor = WHITE;
        borderColor = GREY;
        labelColor = GREY;
    } else if (tempCount !== 0 && !cartCount) {
        // When cart is empty
        createNewOrder(isSst, sstPercentage);
    } else if (isNewOrder) {
        // Create another order from same product
        createNewOrder(isSst, sstPercentage);
    } else if (tempCount !== 0 && cartCount) {
        label = `Update Order • ${item.currency} ${commaAdder(
            tempAmt(options, isSst, sstPercentage)
        )}`;
    } else if (tempCount === 0 && cartCount) {
        label = `Remove Item from Cart`;
        backgroundColor = WHITE;
        borderColor = GREY;
    }

    return (
        <ActionButton
            borderColor={borderColor}
            borderWidth={1}
            style={{ width: width - 50 }}
            borderRadius={25}
            onPress={onPress}
            backgroundColor={isEnabled ? backgroundColor : WHITE}
            componentCenter={
                <Typo
                    text={label}
                    fontSize={14}
                    fontWeight="semi-bold"
                    lineHeight={18}
                    color={isEnabled ? labelColor : GREY}
                />
            }
        />
    );

    function createNewOrder(isSst, sstPercentage) {
        label = `Add ${tempCount} to Cart • ${item.currency} ${commaAdder(
            tempAmt(options, isSst, sstPercentage)
        )}`;
    }

    function tempAmt(options, isSst, sstPercentage) {
        let optionAmt = 0;
        optionAmt = options?.reduce((accumulator, object) => {
            return accumulator + Number(object.amount);
        }, 0);
        const totalAmt = item.priceAmount + optionAmt;
        return (priceFinalAmount({ isSst, amount: totalAmt, sstPercentage }) * tempCount).toFixed(
            2
        );
    }
}
ActionBtnLogic.propTypes = {
    onPress: PropTypes.func,
    tempCount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    item: PropTypes.object,
    options: PropTypes.array,
    cartCount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    isNewOrder: PropTypes.bool,
    isEnabled: PropTypes.bool,
    isSst: PropTypes.bool,
    sstPercentage: PropTypes.number,
    isMerchantOpen: PropTypes.bool,
};
