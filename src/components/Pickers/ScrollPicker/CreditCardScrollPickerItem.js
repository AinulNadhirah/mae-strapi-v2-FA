import React from "react";
import { StyleSheet, Dimensions, View } from "react-native";
import PropTypes from "prop-types";
import { DARK_GREY, BLACK } from "@constants/colors";
import Typo from "@components/Text";

const CreditCardScrollPickerItem = ({ cardName, cardNumber, isSelected }) => {
    const containerStyle = [styles.container];
    if (isSelected) containerStyle.push(styles.selectedItem);
    return (
        <View style={containerStyle}>
            <Typo
                fontSize={16}
                fontWeight={isSelected ? "600" : "normal"}
                lineHeight={19}
                color={isSelected ? BLACK : DARK_GREY}
                text={cardName}
            />
            <Typo
                fontSize={16}
                fontWeight={isSelected ? "600" : "normal"}
                lineHeight={19}
                color={isSelected ? BLACK : DARK_GREY}
                text={cardNumber}
            />
        </View>
    );
};

const GREY = "#f8f8f8";

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        height: 67,
        justifyContent: "space-evenly",
        width: Dimensions.get("screen").width,
    },
    selectedItem: {
        backgroundColor: GREY,
    },
});

CreditCardScrollPickerItem.propTypes = {
    title: PropTypes.string.isRequired,
    isSelected: PropTypes.bool,
    cardName: PropTypes.string.isRequired,
    cardNumber: PropTypes.string.isRequired,
};

CreditCardScrollPickerItem.defaultProps = {
    isSelected: false,
};

export default React.memo(CreditCardScrollPickerItem);
