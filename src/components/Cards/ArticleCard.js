import PropTypes from "prop-types";
import React from "react";
import { View, StyleSheet, Image, FlatList } from "react-native";

import Spring from "@components/Animations/Spring";
import Typography from "@components/Text";

import { WHITE } from "@constants/colors";

import { getShadow } from "@utils/dataModel/utility";

import Assets from "@assets";

const ArticleCard = ({ data, onCardPressed }) => {
    const renderItem = ({ item, index }) => (
        <View style={styles.shadow} key={index}>
            <Spring
                style={styles.container}
                onPress={() => onCardPressed(item, index)}
                activeOpacity={0.9}
            >
                <View style={styles.imageView}>
                    <Image
                        source={index === 0 ? Assets.articleOne : Assets.articleTwo}
                        style={styles.image}
                        resizeMethod="scale"
                    />
                </View>
                <Typography
                    fontWeight="600"
                    fontSize={13}
                    lineHeight={15}
                    style={styles.textHeader}
                    text={item?.name}
                    textAlign="left"
                    numberOfLines={3}
                />
            </Spring>
        </View>
    );
    return (
        <FlatList
            data={data}
            renderItem={renderItem}
            keyExtractor={(item, index) => {
                item, index.toString();
            }}
        />
    );
};

ArticleCard.propTypes = {
    data: PropTypes.any,
    item: PropTypes.any,
    index: PropTypes.any,
    onCardPressed: PropTypes.any,
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: WHITE,
        borderRadius: 10,
        flexDirection: "row",
        height: 80,
        justifyContent: "center",
        marginBottom: 16,
        overflow: "hidden",
        width: "100%",
    },
    image: {
        height: 80,
        width: 98,
    },
    imageView: {
        borderBottomLeftRadius: 10,
        borderTopLeftRadius: 10,
        height: 80,
        overflow: "hidden",
        width: 98,
    },
    shadow: {
        ...getShadow({}),
    },
    textHeader: {
        alignSelf: "center",
        flex: 1,
        paddingHorizontal: 15,
    },
});

export default React.memo(ArticleCard);
