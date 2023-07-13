import React, { useCallback, useState } from "react";
import { TouchableOpacity, StyleSheet, Image, ActivityIndicator } from "react-native";
import PropTypes from "prop-types";
import { YELLOW, OFF_WHITE } from "@constants/colors";

const SubCategoryIcon = ({ iconUrl, isSelected, onSubCategoryIconPressed }) => {
    const [isLoadingIcon, setIsLoadingIcon] = useState(true);
    const onLoad = useCallback(() => setIsLoadingIcon(false), []);
    const onPress = useCallback(() => onSubCategoryIconPressed(iconUrl), [
        onSubCategoryIconPressed,
        iconUrl,
    ]);

    const containerStyle = [styles.container];
    if (isSelected) containerStyle.push(styles.selectedContainer);

    return (
        <TouchableOpacity style={containerStyle} onPress={onPress} disabled={isLoadingIcon}>
            <Image style={styles.image} source={{ uri: iconUrl }} onLoad={onLoad} />
            {isLoadingIcon && (
                <ActivityIndicator style={styles.indicator} size="small" color={OFF_WHITE} />
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        borderRadius: 28,
        height: 56,
        justifyContent: "center",
        width: 56,
    },
    image: {
        height: 32,
        width: 32,
    },
    indicator: {
        bottom: 0,
        left: 0,
        position: "absolute",
        right: 0,
        top: 0,
    },
    selectedContainer: {
        borderColor: YELLOW,
        borderStyle: "solid",
        borderWidth: 2,
    },
});

SubCategoryIcon.propTypes = {
    iconUrl: PropTypes.string.isRequired,
    isSelected: PropTypes.bool.isRequired,
    onSubCategoryIconPressed: PropTypes.func.isRequired,
};

export default React.memo(SubCategoryIcon);
