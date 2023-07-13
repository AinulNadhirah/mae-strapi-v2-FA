import PropTypes from "prop-types";
import React, { useState } from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";

import Typo from "@components/Text";

import { DARK_GREY, OFF_WHITE, PICTON_BLUE } from "@constants/colors";

export default function OrderFlatListItem({ isSst, sstPercentage, item }) {
    const [isSeeMore, setIsSeeMore] = useState(false);
    function onPressSeeMore() {
        setIsSeeMore(isSeeMore ? false : true);
    }

    let allSelectedOptions = [];
    item?.optionGroup?.map((obj, index) =>
        obj?.selectedOptions.map(
            (opt, index) => (allSelectedOptions = [...allSelectedOptions, opt])
        )
    );

    let optionAmt = 0;
    if (allSelectedOptions?.length !== 0) {
        optionAmt = allSelectedOptions?.reduce((accumulator, object) => {
            return accumulator + Number(object.amount);
        }, 0);
    }

    const sstRate = parseFloat(sstPercentage).toFixed(2);

    const amtInclOpt = Number(item.totalAmt) + optionAmt * item?.quantity;
    const totalAmt = isSst ? amtInclOpt * (1 + parseFloat(sstRate)) : amtInclOpt;

    return (
        <View style={styles.orderItemContainer}>
            <View style={styles.quantityContainer}>
                <Typo fontSize={12} fontWeight="semi-bold" text={`${item?.quantity} x`} />
            </View>
            <View style={styles.orderItemRightContainer}>
                <View style={styles.justifyCenter}>
                    <Typo
                        fontSize={12}
                        fontWeight="semi-bold"
                        lineHeight={16}
                        textAlign="left"
                        text={item?.name}
                    />
                    {allSelectedOptions?.length > 0 && renderOptions(isSeeMore)}
                    {allSelectedOptions?.length > 3 && (
                        <TouchableOpacity onPress={() => onPressSeeMore()}>
                            <Typo
                                style={styles.seeMoreText}
                                color={PICTON_BLUE}
                                textAlign="left"
                                fontSize={12}
                                fontWeight={600}
                                lineHeight={14.63}
                                text={isSeeMore ? `See Less` : `See More`}
                            />
                        </TouchableOpacity>
                    )}
                    {!!item?.customerRequest && (
                        <Typo
                            style={styles.addressNote}
                            fontSize={12}
                            fontWeight="400"
                            lineHeight={19}
                            textAlign="left"
                            color={DARK_GREY}
                            text={item?.customerRequest}
                        />
                    )}
                </View>
            </View>
            <View style={styles.totalAmtText}>
                <Typo fontSize={12} fontWeight="semi-bold" text={`RM ${totalAmt.toFixed(2)}`} />
            </View>
        </View>
    );

    function renderOptions(isSeeMore) {
        if (isSeeMore) {
            // Show more
            return allSelectedOptions?.map((item, index) => (
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
            return allSelectedOptions?.map((item, index) => (
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
OrderFlatListItem.propTypes = {
    item: PropTypes.object,
    isSst: PropTypes.bool,
    sstPercentage: PropTypes.number,
};

const styles = StyleSheet.create({
    justifyCenter: {
        justifyContent: "center",
    },
    totalAmtText: {
        marginTop: 3,
    },
    orderItemContainer: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        marginVertical: 4,
    },
    orderItemRightContainer: {
        flex: 6,
        flexDirection: "row",
        justifyContent: "space-between",
        marginHorizontal: 16,
    },
    quantityContainer: {
        backgroundColor: OFF_WHITE,
        borderRadius: 6,
        flex: 1,
        height: 24,
        justifyContent: "center",
        width: 36,
    },
});
