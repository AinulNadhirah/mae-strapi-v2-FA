import PropTypes from "prop-types";
import React, { useCallback } from "react";
import { TouchableOpacity, StyleSheet } from "react-native";

import Typo from "@components/Text";

import { BLACK, DARK_GREY, TRANSPARENT } from "@constants/colors";

const RollingTabItem = ({ title, index, isActive, onPress }) => {
    const onItemPressed = useCallback(() => onPress(index), [index, onPress]);

    let tabStyle;
    if (isActive) tabStyle = [styles.tab, styles.tabActive];
    else tabStyle = styles.tab;

    return (
        <TouchableOpacity style={tabStyle} onPress={onItemPressed}>
            <Typo
                fontSize={14}
                lineHeight={23}
                fontWeight={isActive ? "600" : "300"}
                color={isActive ? BLACK : DARK_GREY}
                textAlign="center"
                text={title}
            />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    tab: {
        borderBottomColor: TRANSPARENT,
        borderBottomWidth: 4,
        height: 27,
        paddingHorizontal: 2,
    },
    tabActive: {
        borderBottomColor: BLACK,
    },
});

RollingTabItem.propTypes = {
    title: PropTypes.string.isRequired,
    index: PropTypes.number.isRequired,
    isActive: PropTypes.bool.isRequired,
    onPress: PropTypes.func.isRequired,
};

const Memoiz = React.memo(RollingTabItem);

export default Memoiz;
