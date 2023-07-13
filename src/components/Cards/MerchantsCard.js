import PropTypes from "prop-types";
import React from "react";
import { StyleSheet, View, FlatList, Image } from "react-native";

import { TouchableSpring, Animated } from "@components/Animations/TouchableSpring";
import Typo from "@components/Text";

import { WHITE, BLACK, TRANSPARENT, YELLOW, SHADOW_CLOSED } from "@constants/colors";

import { getShadow, groupDeliveryType } from "@utils/dataModel/utility";

import Assets from "@assets";

export function Item({ item, onItemPressed }) {
    function handlePress() {
        onItemPressed(item);
    }

    const deliveryTypePills = groupDeliveryType(item?.pills?.deliveryTypePills);

    let cuisineLbl = "";
    if (item?.cuisinesTypes?.length) {
        cuisineLbl = item?.cuisinesTypes.reduce((accumulator, currentValue, index) => {
            if (index === 0) return (accumulator += currentValue?.categoryName);
            else return (accumulator += `, ${currentValue?.categoryName}`);
        }, "");
    }
    return (
        <TouchableSpring onPress={handlePress}>
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
                    <View style={styles.merchantCardContainer}>
                        <View style={styles.listView}>
                            <View style={styles.imageView}>
                                <Image
                                    source={item.logo ? { uri: item.logo } : Assets.maeFBMerchant}
                                    style={styles.image}
                                    resizeMode="stretch"
                                />

                                {!!item?.openMessage && (
                                    <View style={styles.merchantClosed}>
                                        <Typo
                                            fontSize={14}
                                            fontWeight="semi-bold"
                                            letterSpacing={0}
                                            lineHeight={18}
                                            textAlign="center"
                                            text={item?.openMessage}
                                            color={WHITE}
                                        />
                                    </View>
                                )}
                                {item?.pills?.promo && (
                                    <View style={styles.promotionView}>
                                        <Typo
                                            fontWeight="bold"
                                            fontSize={9}
                                            lineHeight={11}
                                            text="Promotion"
                                        />
                                    </View>
                                )}
                            </View>
                            <View style={styles.textView}>
                                <View>
                                    <Typo
                                        fontSize={14}
                                        fontWeight="600"
                                        fontStyle="normal"
                                        letterSpacing={0}
                                        textAlign="left"
                                        lineHeight={18}
                                        style={styles.titleText}
                                        text={item?.shopName}
                                    />
                                    <View style={styles.amountView}>
                                        {!!item?.priceRange && (
                                            <Typo
                                                fontWeight="600"
                                                textAlign="left"
                                                fontSize={12}
                                                lineHeight={14}
                                                text={item?.priceRange}
                                            />
                                        )}
                                        {!!item?.priceRange && !!item?.distance && (
                                            <View style={styles.circularView} />
                                        )}
                                        {!!item?.distance && (
                                            <Typo
                                                fontSize={12}
                                                fontWeight="normal"
                                                fontStyle="normal"
                                                letterSpacing={0}
                                                textAlign="right"
                                                lineHeight={18}
                                                text={
                                                    item?.distance &&
                                                    item?.distance?.substring(
                                                        0,
                                                        item?.distance.indexOf(".") + 2
                                                    ) + " km"
                                                }
                                            />
                                        )}
                                        {!!item?.distance && !!cuisineLbl && (
                                            <View style={styles.circularView} />
                                        )}
                                        {!!cuisineLbl && (
                                            <Typo
                                                fontSize={12}
                                                fontWeight="normal"
                                                fontStyle="normal"
                                                letterSpacing={0}
                                                textAlign="left"
                                                lineHeight={18}
                                                text={cuisineLbl}
                                                numberOfLines={1}
                                                style={styles.container}
                                            />
                                        )}
                                    </View>
                                </View>
                                <View style={styles.cuisineContainer}>
                                    {deliveryTypePills.map((obj, index) => {
                                        return (
                                            <View style={styles.foodTypeView} key={`${index}`}>
                                                <Typo
                                                    fontSize={10}
                                                    lineHeight={16}
                                                    text={obj.name}
                                                />
                                            </View>
                                        );
                                    })}
                                </View>
                            </View>
                        </View>
                    </View>
                </Animated.View>
            )}
        </TouchableSpring>
    );
}

Item.propTypes = {
    item: PropTypes.object,
    onItemPressed: PropTypes.func,
};

const MerchantsCard = ({ onItemPressed, items, onEndReached, isLoading, ListFooterComponent }) => {
    function keyExtractor(item, index) {
        return `${item.merchantId}-${index}`;
    }

    function renderItems({ item }) {
        return <Item item={item} onItemPressed={onItemPressed} />;
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={items}
                renderItem={renderItems}
                extraData={isLoading}
                keyExtractor={keyExtractor}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.merchantScroller}
                initialNumToRender={20}
                onEndReachedThreshold={0.1}
                onEndReached={onEndReached}
                ListFooterComponent={ListFooterComponent}
            />
        </View>
    );
};
MerchantsCard.propTypes = {
    onItemPressed: PropTypes.func.isRequired,
    items: PropTypes.array,
    item: PropTypes.object,
    textKey: PropTypes.string,
    itemAmount: PropTypes.string,
    onEndReached: PropTypes.func,
    isLoading: PropTypes.bool,
    ListFooterComponent: PropTypes.any,
};

const styles = StyleSheet.create({
    amountView: {
        alignItems: "center",
        flexDirection: "row",
        marginTop: 5,
    },
    circularView: {
        backgroundColor: BLACK,
        borderRadius: 2,
        height: 4,
        marginHorizontal: 4,
        width: 4,
    },
    container: {
        backgroundColor: TRANSPARENT,
        flex: 1,
    },
    cuisineContainer: {
        flexDirection: "row",
        overflow: "hidden",
    },
    foodTypeView: {
        alignItems: "center",
        borderColor: BLACK,
        borderRadius: 10.5,
        borderStyle: "solid",
        borderWidth: 1,
        height: 21,
        justifyContent: "center",
        marginRight: 8,
        paddingHorizontal: 8,
    },
    image: {
        flex: 1,
    },
    imageView: {
        borderBottomLeftRadius: 10,
        borderTopLeftRadius: 10,
        height: 112,
        overflow: "hidden",
        width: 137,
    },
    listView: {
        backgroundColor: WHITE,
        borderRadius: 10,
        flexDirection: "row",
        height: 112,
        ...getShadow({
            height: 4,
            shadowRadius: 16,
            elevation: 8,
        }),
    },
    merchantCardContainer: {
        marginBottom: 16,
        paddingHorizontal: 24,
    },

    merchantClosed: {
        backgroundColor: SHADOW_CLOSED,
        borderBottomLeftRadius: 10,
        borderTopLeftRadius: 10,
        height: 112,
        justifyContent: "center",
        overflow: "hidden",
        padding: 20,
        position: "absolute",
        width: 137,
    },
    merchantScroller: { paddingVertical: 24 },
    promotionView: {
        alignItems: "center",
        backgroundColor: YELLOW,
        borderRadius: 10.5,
        height: 21,
        justifyContent: "center",
        left: 8,
        paddingHorizontal: 9,
        position: "absolute",
        top: 8,
    },
    textView: {
        flex: 1,
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    titleText: {
        color: BLACK,
        letterSpacing: 0,
    },
});

export default React.memo(MerchantsCard);
