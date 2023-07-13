import PropTypes from "prop-types";
import React, { useCallback, useRef, useEffect } from "react";
import { FlatList, StyleSheet, Dimensions, Animated } from "react-native";

import SpaceFiller from "@components/Placeholders/SpaceFiller";

import RollingTabItem from "./RollingTabItem";

const CONTAINER_HEIGHT = 27;
const CONTAINER_HEIGHT_WITH_GUTTER = 50;

const RollingTab = ({
    tabs,
    onTabPressed,
    currentTabIndex,
    getRef,
    autoScroll,
    showTab,
    addGutter,
    ...props
}) => {
    const animatedContainerHeight = useRef(new Animated.Value(CONTAINER_HEIGHT)).current;
    const animatedContainerOpacity = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (showTab) {
            Animated.parallel([
                Animated.timing(animatedContainerHeight, {
                    toValue: addGutter ? CONTAINER_HEIGHT_WITH_GUTTER : CONTAINER_HEIGHT,
                    duration: 500,
                    useNativeDriver: false,
                }),
                Animated.timing(animatedContainerOpacity, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: false,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(animatedContainerHeight, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: false,
                }),
                Animated.timing(animatedContainerOpacity, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: false,
                }),
            ]).start();
        }
    }, [addGutter, animatedContainerHeight, animatedContainerOpacity, showTab]);

    const onTabItemPressed = useCallback((index) => onTabPressed(index), [onTabPressed]);

    const renderTab = useCallback(
        ({ item, index }) => {
            const title = item.toUpperCase();
            const isActiveTab = index === currentTabIndex;
            return (
                <RollingTabItem
                    index={index}
                    isActive={isActiveTab}
                    title={title}
                    onPress={onTabItemPressed}
                />
            );
        },
        [currentTabIndex, onTabItemPressed]
    );

    const renderTabSeparator = useCallback(
        () => <SpaceFiller width={24} height={1} color="transparent" />,
        []
    );

    const keyExtractor = useCallback((_, index) => `rolling-tab-${index}`, []);

    const renderFooter = useCallback(
        () => (
            <SpaceFiller height={1} width={autoScroll ? Dimensions.get("window").width / 2 : 24} />
        ),
        [autoScroll]
    );

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    height: animatedContainerHeight,
                    opacity: animatedContainerOpacity,
                },
            ]}
        >
            <FlatList
                data={tabs}
                renderItem={renderTab}
                horizontal
                ItemSeparatorComponent={renderTabSeparator}
                ref={getRef}
                showsHorizontalScrollIndicator={false}
                keyExtractor={keyExtractor}
                ListFooterComponent={renderFooter}
                {...props}
            />
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: "flex-start",
        justifyContent: "center",
        width: "100%",
    },
});

RollingTab.propTypes = {
    tabs: PropTypes.array.isRequired,
    onTabPressed: PropTypes.func.isRequired,
    getRef: PropTypes.object,
    currentTabIndex: PropTypes.number,
    scrollToEnd: PropTypes.bool,
    autoScroll: PropTypes.bool,
    showTab: PropTypes.bool,
    addGutter: PropTypes.bool,
};

RollingTab.defaultProps = {
    getRef: null,
    currentTabIndex: 0,
    scrollToEnd: false,
    autoScroll: false,
    showTab: true,
    addGutter: false,
};

const Memoiz = React.memo(RollingTab);

export default Memoiz;
