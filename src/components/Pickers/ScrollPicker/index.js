import PropTypes from "prop-types";
import React, { useCallback, useState, useEffect } from "react";
import { StyleSheet, Animated } from "react-native";
import RNScrollPicker from "react-native-picker-scrollview";

import PickerHeader from "@components/Headers/PickerHeader";

import { useTimingAnimation } from "@utils/hooks";

import ScrollPickerItem from "./ScrollPickerItem";

const ScrollPicker = ({
    showPicker,
    onDoneButtonPressed,
    onCancelButtonPressed,
    items,
    customItemRenderer,
    renderCustomItems,
    itemHeight,
    fontSize,
    selectedIndex,
}) => {
    const [selectedValue, setSelectedValue] = useState(null);

    useEffect(() => {
        if (items.length > 0) setSelectedValue(items[0].value);
    }, [items]);

    const renderItem = useCallback(
        (item, _, isSelected) => {
            const { title, value } = item;
            return (
                <ScrollPickerItem
                    title={title}
                    value={value}
                    isSelected={isSelected}
                    itemHeight={itemHeight}
                    fontSize={fontSize}
                />
            );
        },
        [itemHeight, fontSize]
    );

    const onScrollPickerValueChanged = useCallback((data) => {
        const { value } = data;

        setSelectedValue(value);
    }, []);

    const onSubmit = useCallback(() => {
        onDoneButtonPressed(selectedValue);
    }, [onDoneButtonPressed, selectedValue]);

    let toPosition = 0;
    if (showPicker) toPosition = -300;

    const animation = useTimingAnimation(500, toPosition);

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    transform: [
                        {
                            translateY: animation,
                        },
                    ],
                },
            ]}
        >
            <PickerHeader
                onDoneButtonPressed={onSubmit}
                onCancelButtonPressed={onCancelButtonPressed}
            />
            <RNScrollPicker
                dataSource={items}
                selectedIndex={selectedIndex}
                itemHeight={itemHeight}
                wrapperHeight={260}
                wrapperColor={WHITE}
                highlightColor={GREY}
                renderItem={renderCustomItems ? customItemRenderer : renderItem}
                onValueChange={onScrollPickerValueChanged}
            />
        </Animated.View>
    );
};

const WHITE = "#ffffff";
const GREY = "#d8d8d8";

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        backgroundColor: WHITE,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        bottom: -300,
        height: 300,
        justifyContent: "flex-start",
        left: 0,
        position: "absolute",
        right: 0,
        width: "100%",
    },
});

ScrollPicker.propTypes = {
    showPicker: PropTypes.bool,
    onDoneButtonPressed: PropTypes.func.isRequired,
    onCancelButtonPressed: PropTypes.func.isRequired,
    items: PropTypes.array.isRequired,
    customItemRenderer: PropTypes.func,
    renderCustomItems: PropTypes.bool,
    itemHeight: PropTypes.number,
    fontSize: PropTypes.number,
    selectedIndex: PropTypes.number,
};

ScrollPicker.defaultProps = {
    showPicker: false,
    customItemRenderer: () => {},
    renderCustomItems: false,
    itemHeight: 44,
    fontSize: 16,
    selectedIndex: 0,
};

export default React.memo(ScrollPicker);
