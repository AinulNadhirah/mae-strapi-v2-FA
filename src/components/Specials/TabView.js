import PropTypes from "prop-types";
import React, { useCallback, useState, useRef, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Swiper from "react-native-swiper";

import RollingTab from "@components/Tabs/RollingTab";

import { ErrorLogger } from "@utils/logs";

const TabView = ({
    titles,
    screens,
    defaultTabIndex,
    onTabChange,
    showTab,
    isAutoScroll,
    ...props
}) => {
    const [swiperIndex, setSwiperIndex] = useState(0);
    const tabRef = useRef(null);
    const swiperRef = useRef(null);

    const onTabItemPressed = useCallback(
        (index) => {
            if (index === swiperIndex) return;
            const scrollBy = index - swiperIndex;
            swiperRef.current.scrollBy(scrollBy, true);
        },
        [swiperIndex, swiperRef]
    );

    const scrollToIndex = (index) => {
        tabRef.current?.scrollToIndex?.({ index, animated: true });
    };

    const onSwiperIndexChanged = useCallback(
        (index) => {
            try {
                tabRef?.current?.scrollToIndex?.({ index, animated: true, viewPosition: 0.5 });
                setSwiperIndex(index);
                onTabChange?.(index);
            } catch (error) {
                ErrorLogger(error);
            }
        },
        [onTabChange, tabRef]
    );

    const onScrollToIndexFailed = useCallback(
        (errorEvent) => {
            try {
                tabRef.current.scrollToOffset({
                    offset: errorEvent.averageItemLength * errorEvent.index,
                    animated: true,
                });
            } catch (error) {
                ErrorLogger(error);
            }
        },
        [tabRef]
    );

    useEffect(() => {
        setSwiperIndex(defaultTabIndex);
        scrollToIndex(defaultTabIndex);
    }, [defaultTabIndex]);

    return (
        <View style={styles.container}>
            <View style={styles.tab}>
                {titles.length > 0 && (
                    <RollingTab
                        currentTabIndex={swiperIndex}
                        tabs={titles}
                        onTabPressed={onTabItemPressed}
                        getRef={tabRef}
                        autoScroll={isAutoScroll === false ? isAutoScroll : defaultTabIndex > 0}
                        initialScrollIndex={defaultTabIndex}
                        onScrollToIndexFailed={onScrollToIndexFailed}
                        initialNumToRender={titles.length}
                        showTab={showTab}
                        addGutter
                    />
                )}
            </View>
            <View style={styles.container}>
                <Swiper
                    ref={swiperRef}
                    onIndexChanged={onSwiperIndexChanged}
                    loop={false}
                    showsPagination={false}
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                    index={swiperIndex}
                    key={swiperIndex}
                    removeClippedSubviews={false}
                    {...props}
                >
                    {screens.map((screen, index) =>
                        React.cloneElement(screen, { key: `screen-${index}` })
                    )}
                </Swiper>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    tab: {
        paddingLeft: 24,
        width: "100%",
    },
});

TabView.propTypes = {
    titles: PropTypes.arrayOf(PropTypes.string).isRequired,
    screens: PropTypes.arrayOf(PropTypes.element).isRequired,
    defaultTabIndex: PropTypes.number,
    onTabChange: PropTypes.func,
    showTab: PropTypes.bool,
    isAutoScroll: PropTypes.bool,
};

TabView.defaultProps = {
    defaultTabIndex: 0,
    onTabChange: null,
    titles: [],
    showTab: true,
    isAutoScroll: true,
};

const Memoiz = React.memo(TabView);

export default Memoiz;
