/* eslint-disable react/prop-types */

/**
 * 1. A drop in replacement for <FlatList> which supports .scrollToIndex out of the box.
 * 2. No modification required, u can even directly replace
 *      <FlatList
 *          renderItem
 *          data
 *          ...
 *      />
 *
 *      to
 *
 *      <FlatListScrollToIndex
 *          renderItem
 *          data
 *          ...
 *      />
 * 3. Only getItemLayout prop is not supported, as it is being implemented internally.
 *
 * Note: Doesn't work with sticky item
 *
 * If ure curious, This is how it works under the hood:
 * Locally implements getItemLayout, for each Item we have onLayout() to get its dynamic height.
 * Also support for ListHeaderComponent, as well as stickyIndices.
 *
 * Proptypes is disabled
 * Future: add Proptype / typescript interface to be same with <FlatList> (all except getItemLayout)
 */
// import PropTypes from "prop-types";
import React, { forwardRef, useCallback, useMemo, useRef } from "react";
import { FlatList, View } from "react-native";

const FlatListScrollToIndex = (props, ref) => {
    const itemLength = useRef({});
    const headerLength = useRef(0);

    const stickyHeaderIndices = useMemo(
        () =>
            props?.stickyHeaderIndices?.sort(function (a, b) {
                return a - b;
            }) || [],
        [props?.stickyHeaderIndices]
    );

    const getItemLayout = useCallback(
        (_data, index) => {
            let offset = headerLength.current;
            let length = 0;

            const lastSticky = stickyHeaderIndices[stickyHeaderIndices.length - 1];
            if (stickyHeaderIndices[stickyHeaderIndices.length - 1] < index + 1) {
                // console.log("adding offset", itemLength.current[lastSticky - 1]);
                offset -= itemLength.current[lastSticky - 1] ?? 0;
            }

            for (let i = 0; i < index; i++) {
                length = itemLength.current[index] ?? 0;
                offset += itemLength.current[i] ?? 0;
            }
            // console.log("getItemLayout index", index, "length", length, "offset", offset);
            // if (index === 1) console.log(itemLength.current);
            return { length, offset, index };
        },
        [stickyHeaderIndices]
    );

    const renderItem = props?.renderItem;
    const renderWrapperItem = useCallback(
        (itemProps) => {
            function onLayout(event) {
                itemLength.current[itemProps.index] = props.horizontal
                    ? event.nativeEvent.layout.width
                    : event.nativeEvent.layout.height;
            }

            return <View onLayout={onLayout}>{renderItem(itemProps)}</View>;
        },
        [props?.horizontal, renderItem]
    );

    const renderListHeader = useMemo(() => {
        function onLayout(event) {
            headerLength.current = props.horizontal
                ? event.nativeEvent.layout.width
                : event.nativeEvent.layout.height;
        }

        return <View onLayout={onLayout}>{props?.ListHeaderComponent}</View>;
    }, [props?.horizontal, props?.ListHeaderComponent]);

    return (
        <FlatList
            ref={ref}
            {...props}
            getItemLayout={getItemLayout}
            renderItem={renderWrapperItem}
            ListHeaderComponent={renderListHeader}
        />
    );
};
// FlatListScrollToIndex.propTypes = {
//     stickyHeaderIndices: PropTypes.array,
//     props: PropTypes.any,
//     renderItem: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
//     horizontal: PropTypes.bool,
//     ListHeaderComponent: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
//     index: PropTypes.number,
// };

export default forwardRef(FlatListScrollToIndex);
