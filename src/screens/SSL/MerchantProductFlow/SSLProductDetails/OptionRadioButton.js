import PropTypes from "prop-types";
import React, { useState } from "react";
import { TouchableOpacity, StyleSheet, Text, View } from "react-native";

import Typo from "@components/Text";

import { BLACK, TRANSPARENT, YELLOW } from "@constants/colors";

import { priceFinalAmount } from "@utils/dataModel/utilitySSLOptionGroup";

const OptionRadioButton = ({
    currency,
    onRadioButtonPressed,
    options,
    optionGroup,
    preselectedOptions,
    isSst,
    sstPercentage,
}) => {
    const [selectedOptions, setSelectedOptions] = useState(preselectedOptions || []);

    function onPress(index) {
        setSelectedOptions([]);
        setSelectedOptions([options[index]]);
        onRadioButtonPressed([options[index]], options, optionGroup);
    }

    function renderOptions() {
        return options?.map((element, index) => {
            const findIndex = selectedOptions?.find(
                (item) => item.optionId === options?.[index]?.optionId
            );
            return (
                <TouchableOpacity
                    key={index}
                    style={styles.container}
                    // eslint-disable-next-line react/jsx-no-bind
                    onPress={() => onPress(index)}
                >
                    <View style={styles.optionRow}>
                        <View style={styles.leftContainer}>
                            <View style={styles.radioButton(!!findIndex)} />
                            <Typo fontSize={14} fontWeight={400} lineHeight={20}>
                                <Text>{element?.name}</Text>
                            </Typo>
                        </View>
                        <Typo
                            fontSize={14}
                            fontWeight={600}
                            text={`+${currency} ${parseFloat(
                                priceFinalAmount({ isSst, amount: element?.amount, sstPercentage })
                            ).toFixed(2)}`}
                        />
                    </View>
                </TouchableOpacity>
            );
        });
    }

    return <View style={styles.container}>{renderOptions()}</View>;
};

const styles = StyleSheet.create({
    container: {
        marginTop: 16,
    },
    leftContainer: { flexDirection: "row", justifyContent: "flex-start" },
    optionRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    radioButton: (isSelected) => ({
        borderColor: BLACK,
        backgroundColor: isSelected ? YELLOW : TRANSPARENT,
        borderRadius: 10,
        borderWidth: 1,
        height: 20,
        marginRight: 7,
        width: 20,
    }),
});

OptionRadioButton.propTypes = {
    title: PropTypes.string.isRequired,
    isSquare: PropTypes.bool,
    isSelected: PropTypes.bool,
    onRadioButtonPressed: PropTypes.func.isRequired,
    currency: PropTypes.string,
    options: PropTypes.array,
    isSst: PropTypes.bool,
    sstPercentage: PropTypes.number,
    rightLabelStyles: PropTypes.any,
    optionGroup: PropTypes.object,
    preselectedOptions: PropTypes.array,
};

OptionRadioButton.defaultProps = {
    isSquare: false,
    isSelected: false,
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
};

const Memoiz = React.memo(OptionRadioButton);

export default Memoiz;
