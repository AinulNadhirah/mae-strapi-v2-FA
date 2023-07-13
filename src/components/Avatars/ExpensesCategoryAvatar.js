import React, { useCallback, useState } from "react";
import { ActivityIndicator, View, StyleSheet, Image } from "react-native";
import PropTypes from "prop-types";
import Avatar from "./BorderedAvatar";
import { NEARYLY_DARK_GREY, OFF_WHITE } from "@constants/colors";

const ExpensesCategoryAvatar = ({ avatarColor, avatarImageUrl }) => {
    const [isLoadingIcon, setIsLoadingIcon] = useState(true);
    const onLoad = useCallback(() => setIsLoadingIcon(false), []);

    return (
        <Avatar backgroundColor={avatarColor === "" ? NEARYLY_DARK_GREY : avatarColor}>
            <View style={styles.iconContainer}>
                <Image source={{ uri: avatarImageUrl }} style={styles.image} onLoad={onLoad} />
                {isLoadingIcon && (
                    <ActivityIndicator style={styles.indicator} size="small" color={OFF_WHITE} />
                )}
            </View>
        </Avatar>
    );
};

const styles = StyleSheet.create({
    iconContainer: {
        alignItems: "center",
        height: 36,
        justifyContent: "center",
        width: 36,
    },
    image: {
        height: 36,
        width: 36,
    },
    indicator: {
        bottom: 0,
        left: 0,
        position: "absolute",
        right: 0,
        top: 0,
    },
});

ExpensesCategoryAvatar.propTypes = {
    avatarColor: PropTypes.string.isRequired,
    avatarImageUrl: PropTypes.string.isRequired,
};

export default React.memo(ExpensesCategoryAvatar);
