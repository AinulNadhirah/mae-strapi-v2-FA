import PropTypes from "prop-types";
import React, { useCallback, useState } from "react";
import { View, StyleSheet, Image, TouchableOpacity } from "react-native";

import Typo from "@components/Text";

import { BLACK, RADIO_BTN_YELLOW } from "@constants/colors";

import { priceFinalAmount } from "@utils/dataModel/utilitySSLOptionGroup";

import Assets from "@assets";

const OptionRadioChecked = ({
    option,
    label,
    paramContainerCls,
    paramImageCls,
    checkType,
    imageSrc,
    selectedColor,
    selectedOptions,
    optionChecked,
    optionGroup,
    isSst,
    sstPercentage,
    currency,
}) => {
    const [isSelected, setIsSelected] = useState(
        !!selectedOptions?.find((obj) => obj.optionId === option.optionId)
    );

    const onPress = useCallback(() => {
        // prevent user to select more than is allowed.
        // const maxSel = Number(optionGroup?.maxSelection);
        // if (selectedOptions?.length + 1 > maxSel && !isSelected) {
        //     return;
        // }

        isSelected ? setIsSelected(false) : setIsSelected(true);
        optionChecked(option, optionGroup);
    }, [isSelected, option, optionChecked, optionGroup]);

    return (
        <TouchableOpacity onPress={onPress}>
            <View style={paramContainerCls}>
                <View style={styles.rowContainer}>
                    {isSelected ? (
                        <Image source={imageSrc} style={styles.checkedBox} />
                    ) : (
                        <View style={styles.uncheckedBox} />
                    )}

                    {!!label && (
                        <Typo fontSize={14} fontWeight={400} lineHeight={20} text={label} />
                    )}
                </View>

                <Typo
                    fontSize={14}
                    fontWeight={600}
                    lineHeight={18}
                    textAlign="right"
                    text={`+${currency} ${parseFloat(
                        priceFinalAmount({ isSst, amount: option?.amount, sstPercentage })
                    ).toFixed(2)}`}
                />
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    checkedBox: {
        height: 20,
        marginRight: 8,
        width: 20,
    },
    containerStyle: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "flex-start",
    },
    labelCls: {
        color: BLACK,
        fontFamily: "montserrat",
        fontSize: 20,
        fontStyle: "normal",
        fontWeight: "normal",
        letterSpacing: 0,
        lineHeight: 23,
        marginLeft: 10,
        marginRight: 20,
        paddingBottom: 10,
    },
    rowContainer: { flexDirection: "row", justifyContent: "flex-start" },
    uncheckedBox: {
        alignItems: "center",
        borderColor: BLACK,
        borderRadius: 10,
        borderStyle: "solid",
        borderWidth: 1,
        height: 20,
        justifyContent: "center",
        marginRight: 8,
        width: 20,
    },
});

OptionRadioChecked.propTypes = {
    label: PropTypes.string,
    paramContainerCls: PropTypes.any,
    paramImageCls: PropTypes.any,
    paramLabelCls: PropTypes.any,
    checkType: PropTypes.string,
    imageSrc: PropTypes.any,
    selectedColor: PropTypes.string,
    selectedOptions: PropTypes.array,
    isSst: PropTypes.bool,
    sstPercentage: PropTypes.number,
    currency: PropTypes.string,
    optionChecked: PropTypes.func,
    option: PropTypes.object,
    optionGroup: PropTypes.object,
};

OptionRadioChecked.defaultProps = {
    label: null,
    paramContainerCls: styles.containerStyle,
    paramImageCls: styles.tickimage,
    paramLabelCls: styles.labelCls,
    checkType: "image",
    imageSrc: Assets.icRadioChecked,
    selectedColor: RADIO_BTN_YELLOW,
};

const Memoiz = React.memo(OptionRadioChecked);

export default Memoiz;
