import { CacheeImage } from "cachee";
import React from "react";
import { View, StyleSheet, Image } from "react-native";

import { TouchableSpring, Animated } from "@components/Animations/TouchableSpring";
import Typo from "@components/Text";

import { WHITE, SHADOW_LIGHT } from "@constants/colors";

import assets from "@assets";

const PromotionsCarouselCard = ({ item, index, onPress }) => {
    function handlePress() {
        onPress({ item, index });
    }

    let imageUrl = assets.maeFBMerchant;
    if (item?.imageUrl) {
        imageUrl = { uri: item?.imageUrl };
    } else if (item?.categoryBanner) {
        imageUrl = { uri: item?.categoryBanner };
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
                    <View style={styles.container}>
                        <View style={styles.cover}>
                            <CacheeImage source={imageUrl} style={styles.image} />
                        </View>
                        <View style={styles.content}>
                            <Typo
                                fontSize={12}
                                fontWeight="normal"
                                fontStyle="normal"
                                letterSpacing={0}
                                lineHeight={16}
                                textAlign="left"
                                text={item?.title}
                                numberOfLines={3}
                            />
                        </View>
                    </View>
                </Animated.View>
            )}
        </TouchableSpring>
    );
};

const Memoiz = React.memo(PromotionsCarouselCard);

export default Memoiz;

const styles = StyleSheet.create({
    container: {
        backgroundColor: WHITE,
        borderRadius: 8,
        elevation: 8,
        height: 200,
        marginBottom: 36,
        shadowColor: SHADOW_LIGHT,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 1,
        shadowRadius: 16,
        width: 192,
    },
    content: {
        height: 56,
        paddingBottom: 8,
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    cover: {
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        height: 120,
        overflow: "hidden",
        width: "100%",
    },
    image: {
        height: "100%",
        width: "100%",
    },
});
