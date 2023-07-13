import PropTypes from "prop-types";
import React from "react";
import { View, StyleSheet, Image, TouchableOpacity } from "react-native";

import BorderedAvatar from "@components/Avatars/BorderedAvatar";
import Text from "@components/Text";

import { GREY, DARK_GREY, OFF_WHITE } from "@constants/colors";

import { removeAllCharInImage } from "@utils/dataModel/utility";

import assets from "@assets";

function FavouriteAccountListItem({
    avatarImageName,
    avatarImageURI,
    title,
    subTitle,
    description,
    onPress,
}) {
    const avatarSource = avatarImageName
        ? assets[removeAllCharInImage(avatarImageName)]
        : { uri: avatarImageURI };

    return (
        <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.9}>
            <View style={styles.subContainer}>
                <View style={styles.avatarSection}>
                    <BorderedAvatar
                        height={64}
                        width={64}
                        borderRadius={32}
                        backgroundColor={OFF_WHITE}
                    >
                        <Image style={styles.image} source={avatarSource} />
                    </BorderedAvatar>
                </View>
                <View style={styles.textSection}>
                    <Text
                        text={title}
                        fontWeight="600"
                        lineHeight={18}
                        ellipsizeMode="tail"
                        textAlign="left"
                    />
                    <Text
                        text={subTitle}
                        fontSize={12}
                        lineHeight={18}
                        ellipsizeMode="tail"
                        textAlign="left"
                    />
                    <Text
                        text={description}
                        fontSize={12}
                        lineHeight={18}
                        color={DARK_GREY}
                        ellipsizeMode="tail"
                        textAlign="left"
                    />
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    avatarSection: {
        paddingBottom: 16,
        paddingLeft: 6,
        paddingRight: 16,
    },
    container: {
        alignItems: "flex-start",
        borderBottomColor: GREY,
        borderBottomWidth: 1,
        flexDirection: "row",
        justifyContent: "flex-start",
        marginTop: 16,
    },
    image: {
        height: 60,
        width: 60,
    },
    subContainer: { flexDirection: "row", width: "100%" },
    textSection: {
        alignItems: "flex-start",
        flex: 1,
        height: 64,
        justifyContent: "space-between",
        paddingVertical: 6,
    },
});

FavouriteAccountListItem.propTypes = {
    avatarImageName: PropTypes.string,
    avatarImageURI: PropTypes.string,
    title: PropTypes.string.isRequired,
    subTitle: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    onPress: PropTypes.func.isRequired,
};

FavouriteAccountListItem.defaultProps = {
    avatarImageName: "",
    avatarImageURI: "",
};

export default React.memo(FavouriteAccountListItem);
