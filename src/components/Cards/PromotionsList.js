import moment from "moment";
import PropTypes from "prop-types";
import React from "react";
import { StyleSheet, View, FlatList, Image } from "react-native";

import { TouchableSpring, Animated } from "@components/Animations/TouchableSpring";
import Typo from "@components/Text";

import { DARK_GREY, SHADOW, TRANSPARENT, WHITE } from "@constants/colors";

const PromotionsList = ({ onItemPressed, items, onEndReached }) => {
    // eslint-disable-next-line react/prop-types
    function renderItems({ item }) {
        function handlePress() {
            onItemPressed(item);
        }

        return (
            <View style={styles.listView}>
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
                            <View style={styles.innerList}>
                                <View style={styles.listItemRow}>
                                    {/* <View style={styles.seperator} /> */}
                                    <View style={styles.imageView}>
                                        <Image
                                            source={{ uri: item?.imageUrl }}
                                            style={styles.image}
                                        />
                                    </View>
                                    <View style={styles.textView}>
                                        <View style={styles.metaWrapper}>
                                            <View>
                                                <Typo
                                                    fontSize={14}
                                                    fontWeight="600"
                                                    letterSpacing={0}
                                                    textAlign="left"
                                                    style={styles.titleText}
                                                    text={item?.title}
                                                    numberOfLines={3}
                                                />
                                            </View>
                                            {item?.merchantName && (
                                                <Typo
                                                    fontSize={12}
                                                    fontWeight="normal"
                                                    textAlign="left"
                                                    text={item?.merchantName}
                                                />
                                            )}
                                        </View>
                                        {!!item?.promoValidDate?.end && (
                                            <Typo
                                                fontSize={10}
                                                color={DARK_GREY}
                                                fontWeight="normal"
                                                textAlign="left"
                                                text={`Valid until ${moment(
                                                    item?.promoValidDate?.end
                                                ).format("DD MMM YYYY")}`}
                                            />
                                        )}
                                    </View>
                                </View>
                            </View>
                        </Animated.View>
                    )}
                </TouchableSpring>
            </View>
        );
    }

    function keyExtractor(item) {
        return `${item.id}`;
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={items}
                renderItem={renderItems}
                keyExtractor={keyExtractor}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.content}
                initialNumToRender={20}
                onEndReachedThreshold={0.1}
                onEndReached={onEndReached}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: TRANSPARENT,
        flex: 1,
    },
    content: {
        paddingTop: 24,
    },
    image: {
        flex: 1,
    },
    imageView: {
        borderBottomLeftRadius: 10,
        borderTopLeftRadius: 10,
        height: 122,
        overflow: "hidden",
        width: 137,
    },
    innerList: {
        backgroundColor: WHITE,
        borderRadius: 8,
        elevation: 8,
        flexDirection: "row",
        height: 122,
        shadowColor: SHADOW,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 1,
        shadowRadius: 16,
    },
    listItemRow: { flex: 1, flexDirection: "row" },
    listView: {
        marginBottom: 16,
        paddingHorizontal: 24,
    },
    metaWrapper: { flex: 1 },
    textView: {
        flex: 1,
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    titleText: {
        marginBottom: 4,
    },
});

PromotionsList.propTypes = {
    onItemPressed: PropTypes.func.isRequired,
    items: PropTypes.array,
    textKey: PropTypes.string,
    itemAmount: PropTypes.string,
    onEndReached: PropTypes.func,
};

const Memoiz = React.memo(PromotionsList);

export default Memoiz;
