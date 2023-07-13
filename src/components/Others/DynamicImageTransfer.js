import PropTypes from "prop-types";
import React from "react";
import { StyleSheet, Image, View } from "react-native";

import Typo from "@components/Text";

import { DARK_GREY, OFF_WHITE, PINKISH_GREY } from "@constants/colors";

import { removeAllCharInImage, getContactNameInitial, getShadow } from "@utils/dataModel/utility";

import Images from "@assets";

const DynamicImageTransfer = ({ item, type }) => {
    const imageName = Images[removeAllCharInImage(item.imageName)];
    return (
        <View style={styles.billerInfoRow}>
            <View style={styles.circleImageContainer}>
                {imageName || item?.imageUrl ? (
                    <View style={styles.circleImage}>
                        <Image
                            style={styles.circleImageView1}
                            source={
                                item?.imageName
                                    ? Images[removeAllCharInImage(item.imageName)]
                                    : { uri: item.imageUrl }
                            }
                            resizeMode="stretch"
                            resizeMethod="scale"
                        />
                    </View>
                ) : (
                    <View style={styles.circleImageView}>
                        <Typo
                            fontSize={24}
                            fontWeight="300"
                            lineHeight={50}
                            textAlign="center"
                            color={DARK_GREY}
                            text={
                                item && item.shortName ? getContactNameInitial(item.shortName) : ""
                            }
                        />
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    billerInfoRow: {
        flexDirection: "row",
        width: "100%",
    },
    circleImage: {
        alignItems: "center",
        backgroundColor: OFF_WHITE,
        borderColor: OFF_WHITE,
        borderRadius: 64 / 2,
        borderStyle: "solid",
        borderWidth: 2,
        ...getShadow({
            elevation: 4, // android
        }),
        height: 64,
        justifyContent: "center",
        width: 64,
    },
    circleImageContainer: {
        alignItems: "center",
        height: 70,
        justifyContent: "center",
        width: 70,
    },
    circleImageView: {
        alignItems: "center",
        backgroundColor: PINKISH_GREY,
        borderColor: OFF_WHITE,
        borderRadius: 64 / 2,
        borderStyle: "solid",
        borderWidth: 2,
        ...getShadow({
            elevation: 4, // android
        }),
        height: 64,
        justifyContent: "center",
        width: 64,
    },
    circleImageView1: {
        height: 60,
        width: 60,
    },
});

DynamicImageTransfer.propTypes = {
    item: PropTypes.object,
    type: PropTypes.string,
};

const Memoiz = React.memo(DynamicImageTransfer);

export default Memoiz;
