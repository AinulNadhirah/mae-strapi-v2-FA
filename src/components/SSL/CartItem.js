/* eslint-disable react/jsx-no-bind */
import PropTypes from "prop-types";
import React, { useState } from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";

import Typo from "@components/Text";

import { PICTON_BLUE, OFF_WHITE, SEPARATOR, DARK_GREY } from "@constants/colors";

import { commaAdder } from "@utils/dataModel/utilityPartial.1";
import { priceFinalAmount } from "@utils/dataModel/utilitySSLOptionGroup";

import SSLStyles from "@styles/SSLStyles";

function CartItem({
    index,
    product,
    options,
    editProductHandler,
    isLastIndex,
    hasSeeMore,
    isSst,
    sstPercentage,
}) {
    const [seeMoreIndexArray, setSeeMoreIndexArray] = useState([]);

    function onPressSeeMore(index) {
        if (seeMoreIndexArray.includes(index)) {
            const indexArr = seeMoreIndexArray;

            const spliceIndex = seeMoreIndexArray.findIndex((item) => item === index);

            indexArr.splice(spliceIndex, 1);

            setSeeMoreIndexArray(indexArr);
        } else {
            setSeeMoreIndexArray([...seeMoreIndexArray, index]);
        }
    }

    const optionAmt = options?.reduce((accumulator, object) => {
        return accumulator + Number(object.amount);
    }, 0);

    // Check if SST applies to the merchant
    const totalAmt = priceFinalAmount({
        isSst,
        amount: Number(product.priceAmount) + Number(optionAmt),
        sstPercentage,
    });
    const tempAmt = (totalAmt * product.count).toFixed(2);

    return (
        <>
            <View style={[styles.itemContainer, SSLStyles.pillShadow]}>
                <View style={styles.quantityView}>
                    <Typo fontSize={12} fontWeight="semi-bold" text={`${product.count}x`} />
                </View>
                <View style={styles.productName}>
                    <Typo
                        fontSize={12}
                        fontWeight="semi-bold"
                        textAlign="left"
                        text={product.name}
                    />
                    {renderOptions(seeMoreIndexArray.includes(index))}
                    {hasSeeMore && (
                        <TouchableOpacity onPress={() => onPressSeeMore(index)}>
                            <Typo
                                style={styles.seeMoreText}
                                color={PICTON_BLUE}
                                textAlign="left"
                                fontSize={12}
                                fontWeight={600}
                                lineHeight={14.63}
                                text={seeMoreIndexArray.includes(index) ? "See Less" : "See More"}
                            />
                        </TouchableOpacity>
                    )}
                    {!!product?.customerRequest && (
                        <Typo
                            style={styles.marginTop4}
                            fontSize={12}
                            fontWeight="400"
                            lineHeight={19}
                            textAlign="left"
                            color={DARK_GREY}
                            text={`"${product?.customerRequest}"`}
                        />
                    )}
                </View>
                <View style={styles.totalView}>
                    <Typo
                        fontSize={14}
                        lineHeight={18}
                        fontWeight="semi-bold"
                        textAlign="right"
                        text={`${product.currency || "RM"} ${commaAdder(tempAmt)}`}
                    />
                    <View style={styles.amountEditPadding} />
                    <TouchableOpacity onPress={editProductHandler}>
                        <Typo
                            fontSize={14}
                            lineHeight={18}
                            fontWeight="semi-bold"
                            text="Edit"
                            textAlign="right"
                            color={PICTON_BLUE}
                        />
                    </TouchableOpacity>
                </View>
            </View>
            {!isLastIndex && <View style={styles.separator} />}
        </>
    );

    function renderOptions(isSeeMore) {
        if (isSeeMore) {
            // Show more
            return product?.selectedOptions?.map((item, index) => (
                <Typo
                    key={index}
                    fontSize={12}
                    lineHeight={16}
                    fontWeight={400}
                    textAlign="left"
                    text={`+ ${item.name}`}
                />
            ));
        } else {
            return product?.selectedOptions?.map((item, index) => (
                <>
                    {index < 3 && (
                        <Typo
                            key={index}
                            fontSize={12}
                            lineHeight={16}
                            fontWeight={400}
                            textAlign="left"
                            text={`+ ${item.name}`}
                        />
                    )}
                </>
            ));
        }
    }
}

const styles = StyleSheet.create({
    amountEditPadding: { height: 4 },
    itemContainer: {
        alignItems: "flex-start",
        flexDirection: "row",
    },
    marginTop4: { marginTop: 4 },
    productName: {
        alignSelf: "center",
        flex: 1,
        marginVertical: 13,
    },
    quantityView: {
        alignItems: "center",
        backgroundColor: OFF_WHITE,
        borderRadius: 6,
        height: 32,
        justifyContent: "center",
        marginHorizontal: 13,
        marginVertical: 16,
        width: 37,
    },
    separator: {
        backgroundColor: SEPARATOR,
        height: 1,
    },
    totalView: { margin: 13 },
});

CartItem.propTypes = {
    product: PropTypes.object,
    options: PropTypes.array,
    editProductHandler: PropTypes.func.isRequired,
    isLastIndex: PropTypes.bool,
    hasSeeMore: PropTypes.bool,
    isSst: PropTypes.bool,
    sstPercentage: PropTypes.number,
    index: PropTypes.number,
};

CartItem.defaultProps = {
    product: [],
    isLastIndex: false,
};

export default React.memo(CartItem);
