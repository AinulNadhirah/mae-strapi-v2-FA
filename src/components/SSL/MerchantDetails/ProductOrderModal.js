/* eslint-disable react/jsx-no-bind */
import PropTypes from "prop-types";
import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";

import RadioButtonModal from "@components/SSL/RadioButtonModal";
import Typo from "@components/Text";

import { BLUE, OFF_WHITE, SEPARATOR, DARK_GREY } from "@constants/colors";

import { priceFinalAmount } from "@utils/dataModel/utilitySSLOptionGroup";

export function ProductOrderModal({
    isShow,
    isSst,
    sstPercentage,
    item,
    productArr,
    onDismiss,
    onOrderAnother,
    onEditOrder,
}) {
    const [seeMoreIndex, setSeeMoreIndex] = useState(null);
    const [seeMoreIndexArray, setSeeMoreIndexArray] = useState([]);

    if (productArr?.length > 0) {
        productArr?.forEach((prod, index) => {
            let allSelectedOptions = [];
            if (!prod?.optionGroup?.[0]?.selectedOptions) return;
            prod?.optionGroup?.forEach((obj, index) =>
                obj?.selectedOptions.forEach(
                    (opt, index) => (allSelectedOptions = [...allSelectedOptions, opt])
                )
            );
            prod.selectedOptions = allSelectedOptions;
        });
    }

    function onPressSeeMore(index) {
        setSeeMoreIndex(index);

        if (seeMoreIndexArray.includes(index)) {
            const indexArr = seeMoreIndexArray;

            const spliceIndex = seeMoreIndexArray.findIndex((item) => item === index);

            indexArr.splice(spliceIndex, 1);

            setSeeMoreIndexArray(indexArr);
            setSeeMoreIndex(null);
        } else {
            setSeeMoreIndexArray([...seeMoreIndexArray, index]);
        }
    }

    function actionBtnOnClick() {
        onOrderAnother();
    }

    const itemPriceAmount = priceFinalAmount({ isSst, amount: item?.priceAmount, sstPercentage });

    return (
        <RadioButtonModal
            isShow={isShow}
            title={item?.name}
            onDismiss={onDismiss}
            actionBtnLbl="Order Another"
            actionBtnOnClick={actionBtnOnClick}
        >
            <Typo
                style={styles.price}
                textAlign="left"
                fontSize={14}
                fontWeight={600}
                lineHeight={17.07}
                text={`${item?.currency} ${parseFloat(itemPriceAmount).toFixed(2)}`}
            />
            {productArr?.length > 0 && renderProducts({ isSst, sstPercentage })}
        </RadioButtonModal>
    );

    function renderProducts({ isSst, sstPercentage }) {
        const totalAmt = (options, itemPrice, count) => {
            return (
                options?.reduce((accumulator, object) => {
                    return (
                        accumulator +
                        priceFinalAmount({ isSst, amount: object.amount, sstPercentage })
                    );
                }, priceFinalAmount({ isSst, amount: itemPrice, sstPercentage })) * count
            ).toFixed(2);
        };

        return productArr?.map((item, index) => (
            <>
                <View key={index} style={styles.orderContainer}>
                    <View style={styles.leftContainer}>
                        <Typo fontSize={12} fontWeight="600" text={`${item?.count}x`} />
                    </View>
                    <View style={styles.centerContainer}>
                        {renderOptions(item, seeMoreIndex === index)}
                        {item?.selectedOptions?.length > 3 && (
                            <TouchableOpacity onPress={() => onPressSeeMore(index)}>
                                <Typo
                                    style={styles.seeMoreText}
                                    color={BLUE}
                                    textAlign="left"
                                    fontSize={12}
                                    fontWeight={600}
                                    lineHeight={14.63}
                                    text={
                                        seeMoreIndexArray.includes(index) ? "See Less" : "See More"
                                    }
                                />
                            </TouchableOpacity>
                        )}
                        {item?.customerRequest !== "" && (
                            <Typo
                                style={styles.customerRequestText}
                                color={DARK_GREY}
                                fontSize={12}
                                lineHeight={16}
                                fontWeight={400}
                                textAlign="left"
                                text={`"${item?.customerRequest}"`}
                            />
                        )}
                    </View>
                    <View style={styles.rightContainer}>
                        <Typo
                            fontSize={14}
                            fontWeight={600}
                            lineHeight={17.07}
                            text={totalAmt(item?.selectedOptions, item?.priceAmount, item?.count)}
                        />
                        <TouchableOpacity onPress={() => onEditOrder(item)}>
                            <Typo
                                color={BLUE}
                                fontSize={12}
                                fontWeight={600}
                                lineHeight={14.63}
                                text="Edit"
                            />
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.separator} />
            </>
        ));
    }

    function renderOptions(product, isSeeMore) {
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
ProductOrderModal.propTypes = {
    isShow: PropTypes.bool,
    onDismiss: PropTypes.func,
    onApply: PropTypes.func,
    product: PropTypes.object,
    onEditOrder: PropTypes.func,
    onOrderAnother: PropTypes.func,
    isSst: PropTypes.bool,
    sstPercentage: PropTypes.number,
    item: PropTypes.object,
    productArr: PropTypes.array,
};

const styles = StyleSheet.create({
    centerContainer: {
        width: "60%",
    },
    customerRequestText: {
        marginTop: 4,
    },
    leftContainer: {
        backgroundColor: OFF_WHITE,
        height: 32,
        justifyContent: "center",
        marginRight: 14,
        width: 37,
    },
    orderContainer: {
        flexDirection: "row",
    },
    price: {
        marginBottom: 24,
        marginTop: -12,
    },
    rightContainer: {
        alignItems: "flex-end",
        width: "20%",
    },
    seeMoreText: {
        marginTop: 4,
    },
    separator: {
        backgroundColor: SEPARATOR,
        height: 1,
        marginVertical: 16,
        width: "100%",
    },
});
