/* eslint-disable react-native/no-color-literals */

/**
 * Testing screen for FlatListScrollToIndex.
 * To test, copy paste the content of this file and replace to any screen & replace the name
 * For example, if ure currently viewing SSLMerchantDetails/index.js,
 * Copy the content of this screen and paste it, then replace ReplaceMeWithScreenName with {yourScreenName} in this case SSLMerchantDetails
 *
 * Test case:
 * 0. On click any cell will scrollToIndex automatically.
 * 1. Test for normal cell (without ListHeader, sticky)
 * 2. Test with ListHeader
 * 3. Test with sticky
 *
 * Replace <FlatListScrollToIndex to <FlatList to make sure it works out of the box.
 * We're making a drop in replacement here, so make sure no modification is required for other devs to implement this.
 *
 */
import PropTypes from "prop-types";
import React, { useRef } from "react";
// eslint-disable-next-line no-unused-vars
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ScreenContainer from "@components/Containers/ScreenContainer";
import FlatListScrollToIndex from "@components/FlatListCustom/FlatListScrollToIndex";
import Typo from "@components/Text";

import { withModelContext } from "@context";

import { MEDIUM_GREY } from "@constants/colors";

const productData = [
    50, 80, 200, 180, 140, 100, 200, 80, 180, 50, 80, 200, 180, 140, 100, 200, 80, 180,
];
function ReplaceMeWithScreenName() {
    const flatlistRef = useRef();
    function keyExtractor(item, index) {
        return item.productId ? `${item.productId}_${index}` : `${index}`;
    }

    function renderItem({ item, index }) {
        function onPress() {
            flatlistRef.current.scrollToIndex({
                animated: true,
                index,
            });
        }

        return (
            <TouchableOpacity onPress={onPress} style={styles.cellStyle(item)}>
                <Typo
                    style={styles.categoryTitle}
                    fontSize={17}
                    lineHeight={21}
                    fontWeight="600"
                    textAlign="left"
                    text={`Index:${index}:\nHeight:${item}`}
                />
            </TouchableOpacity>
        );
    }
    renderItem.propTypes = {
        item: PropTypes.object,
        index: PropTypes.number,
    };

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <ScreenLayout
                header={<HeaderLayout backgroundColor={MEDIUM_GREY} />}
                useSafeArea
                neverForceInset={["bottom"]}
                paddingLeft={0}
                paddingRight={0}
                paddingBottom={0}
                paddingTop={0}
            >
                <View style={styles.container}>
                    {/* <FlatList */}
                    <FlatListScrollToIndex
                        ref={flatlistRef}
                        keyExtractor={keyExtractor}
                        stickyHeaderIndices={[1]}
                        data={productData}
                        renderItem={renderItem}
                        ListHeaderComponent={
                            <View style={styles.listHeaderStyle}>
                                <Typo
                                    style={styles.categoryTitle}
                                    fontSize={17}
                                    lineHeight={21}
                                    fontWeight="600"
                                    textAlign="left"
                                    text="Header"
                                />
                            </View>
                        }
                    />
                </View>
            </ScreenLayout>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    cellStyle: (item) => {
        return {
            height: item,
            backgroundColor: "green",
            borderColor: "black",
            borderWidth: 1,
            alignItems: "center",
            justifyContent: "center",
        };
    },
    container: { flex: 1 },
    listHeaderStyle: {
        alignItems: "center",
        backgroundColor: "yellow",
        height: 100,
        justifyContent: "center",
    },
});

export default withModelContext(ReplaceMeWithScreenName);
