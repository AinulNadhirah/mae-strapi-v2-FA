import PropTypes from "prop-types";
import React from "react";
import { StyleSheet, View } from "react-native";

import ActionButton from "@components/Buttons/ActionButton";
import LoadingMerchant from "@components/FnB/LoadingMerchant";
import MerchantFlatListItem from "@components/SSL//MerchantFlatListItem";
import TitleViewAllHeader from "@components/SSL/TitleViewAllHeader";
import Typo from "@components/Text";

import { BLACK, WHITE, SEPARATOR, GREY } from "@constants/colors";

export default function MerchantSection({
    title,
    isLoading,
    merchantsData,
    onPress,
    onViewAll,
    viewAllLink,
}) {
    return (
        <View style={styles.merchantContainer}>
            <TitleViewAllHeader title={title} onPressViewAll={viewAllLink && onViewAll} />
            <View style={styles.container}>
                {isLoading ? (
                    <LoadingMerchant />
                ) : (
                    // Nest a vertical FlatList inside a vertical ScrollView will give the following warning:
                    // VirtualizedLists should never be nested inside plain ScrollViews
                    merchantsData.map((item, index) => {
                        return (
                            <View
                                style={styles.merchantFlatListPadding}
                                key={`${item.merchantId}-${index}`}
                            >
                                <MerchantFlatListItem
                                    item={item}
                                    title={title}
                                    handlePress={onPress}
                                />
                            </View>
                        );
                    })
                )}
            </View>
            {!viewAllLink && (
                <>
                    <View style={styles.viewAllBtn}>
                        <ActionButton
                            onPress={onViewAll}
                            backgroundColor={WHITE}
                            style={styles.actionButton}
                            componentCenter={
                                <Typo
                                    text="View All"
                                    textAlign="center"
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={18}
                                    color={BLACK}
                                />
                            }
                        />
                    </View>
                    <View style={styles.separator} />
                </>
            )}
        </View>
    );
}
MerchantSection.propTypes = {
    title: PropTypes.string,
    merchantsData: PropTypes.array,
    isLoading: PropTypes.bool,
    onPress: PropTypes.func,
    onViewAll: PropTypes.func,
    viewAllLink: PropTypes.bool,
};

export const styles = StyleSheet.create({
    actionButton: {
        height: 48,
        width: 327,
    },
    container: {
        flex: 1,
        // paddingHorizontal: 24,
    },
    merchantContainer: {
        flex: 1,
    },
    merchantFlatListPadding: {
        paddingHorizontal: 24,
    },
    separator: { backgroundColor: SEPARATOR, height: 1, marginHorizontal: 24, marginTop: 15 },
    viewAllBtn: {
        alignItems: "flex-start",
        backgroundColor: WHITE,
        borderColor: GREY,
        borderRadius: 25,
        borderWidth: 1,
        flexDirection: "row",
        justifyContent: "center",
        marginHorizontal: 24,
        marginVertical: 15,
    },
});
