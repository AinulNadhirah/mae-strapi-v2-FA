import PropTypes from "prop-types";
import React from "react";
import { View, StyleSheet } from "react-native";

import RadioButton from "@components/Buttons/RadioButton";

const SSLGroupedRadioButton = ({
    items,
    flexDirection,
    containerWidth,
    containerHeight,
    onItemPressed,
    alignItems,
    ...props
}) => {
    function onPress(title) {
        onItemPressed(items.findIndex((item) => item.title === title));
    }

    return (
        <View
            style={[
                styles.container,
                {
                    alignItems,
                    width: containerWidth,
                    height: containerHeight,
                    flexDirection,
                },
            ]}
        >
            {items.map((value, index) => {
                const { title, isSelected } = value;
                return (
                    <>
                        <View style={styles.radioBtnContainer}>
                            <RadioButton
                                key={`radio-${index}`}
                                title={title}
                                isSelected={isSelected}
                                onRadioButtonPressed={onPress}
                                {...props}
                            />
                        </View>
                    </>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexWrap: "wrap",
        overflow: "hidden",
    },
    radioBtnContainer: {
        flex: 1,
    },
});

SSLGroupedRadioButton.propTypes = {
    items: PropTypes.array.isRequired,
    flexDirection: PropTypes.string.isRequired,
    alignItems: PropTypes.string.isRequired,
    containerHeight: PropTypes.number.isRequired,
    containerWidth: PropTypes.oneOfType([PropTypes.number.isRequired, PropTypes.string.isRequired]),
    onItemPressed: PropTypes.func.isRequired,
};

export default React.memo(SSLGroupedRadioButton);
