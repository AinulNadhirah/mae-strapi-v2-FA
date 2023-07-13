import PropTypes from "prop-types";
import React from "react";
import { StyleSheet, View, Image } from "react-native";
import { FlatList } from "react-native-gesture-handler";

import { TouchableSpring, Animated } from "@components/Animations/TouchableSpring";
import TitleViewAllHeader from "@components/SSL/TitleViewAllHeader";
import Typo from "@components/Text";

import { WHITE, SHADOW_LIGHT } from "@constants/colors";

import assets from "@assets";

function CravingCarousel({ cravingData, onPress, onViewAll }) {
    function renderPromotionCard(obj) {
        const item = obj.item;
        function handlePress() {
            onPress(item);
        }
        return (
            <TouchableSpring scaleTo={0.95} onPress={handlePress}>
                {({ animateProp }) => (
                    <Animated.View
                        style={{
                            transform: [
                                {
                                    scale: animateProp,
                                },
                            ],
                        }}
                    >
                        <View style={styles.actionButtonContainer}>
                            <Image
                                style={styles.actionButtonIconImg}
                                source={
                                    item?.categoryDefaultLogo
                                        ? { uri: item?.categoryDefaultLogo }
                                        : assets.icMAE
                                }
                            />
                            <View style={styles.actionButtonTitle}>
                                <Typo
                                    text={item.categoryName}
                                    fontSize={12}
                                    lineHeight={14}
                                    fontWeight="normal"
                                    numberOfLines={2}
                                />
                            </View>
                        </View>
                    </Animated.View>
                )}
            </TouchableSpring>
        );
    }

    function renderFooterCard() {
        return (
            <TouchableSpring scaleTo={0.95} onPress={onViewAll}>
                {({ animateProp }) => (
                    <Animated.View
                        style={{
                            transform: [
                                {
                                    scale: animateProp,
                                },
                            ],
                        }}
                    >
                        <View style={[styles.actionButtonContainer, styles.marginLast]}>
                            <Image
                                style={styles.actionButtonIconImg}
                                source={assets.SSLblackMarketplaceMore}
                            />
                            <View style={styles.actionButtonTitle}>
                                <Typo
                                    text="More"
                                    fontSize={12}
                                    lineHeight={14}
                                    fontWeight="normal"
                                    numberOfLines={2}
                                />
                            </View>
                        </View>
                    </Animated.View>
                )}
            </TouchableSpring>
        );
    }

    function promotionKey(item, index) {
        return `${item.categoryId}_${index}`;
    }

    function renderSeparator() {
        return <View style={styles.separator} />;
    }

    return (
        <View>
            <TitleViewAllHeader title="What are you craving?" onPressViewAll={onViewAll} />
            <FlatList
                data={cravingData}
                ItemSeparatorComponent={renderSeparator}
                renderItem={renderPromotionCard}
                horizontal
                nestedScrollEnabled
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.carouselContainer}
                keyExtractor={promotionKey}
                ListFooterComponent={renderFooterCard}
            />
        </View>
    );
}
const styles = StyleSheet.create({
    actionButtonContainer: {
        alignItems: "center",
        backgroundColor: WHITE,
        borderRadius: 8,
        elevation: 8,
        height: 88,
        justifyContent: "flex-start",
        marginBottom: 40,
        paddingHorizontal: 8,
        paddingVertical: 14,
        shadowColor: SHADOW_LIGHT,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 1,
        shadowRadius: 16,
        width: 75,
    },
    actionButtonIconImg: {
        height: 36,
        marginBottom: 6,
        width: 36,
    },
    actionButtonTitle: {
        height: 28,
        justifyContent: "center",
    },
    carouselContainer: { paddingHorizontal: 20 },
    marginLast: { marginLeft: 8 },
    separator: { width: 8 },
});

CravingCarousel.propTypes = {
    cravingData: PropTypes.array,
    onPress: PropTypes.func,
    onViewAll: PropTypes.func,
};

export default React.memo(CravingCarousel);
