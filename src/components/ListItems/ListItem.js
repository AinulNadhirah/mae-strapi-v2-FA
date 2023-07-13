import React, { useCallback } from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import PropTypes from "prop-types";
import Typo from "@components/Text";
import { DARK_GREY } from "@constants/colors";

const ListItem = ({
    leftComponent,
    rightComponent,
    title,
    subtitle,
    titleFontSize,
    subtitleFontSize,
    onListItemPressed,
    ...props
}) => {
    const onPress = useCallback(() => onListItemPressed(title));
    const titleAreaStyle = [styles.titleArea];
    if (leftComponent) titleAreaStyle.push({ marginLeft: 16 });
    return (
        <TouchableOpacity style={styles.container} onPress={onPress} {...props}>
            <View style={styles.leftSection}>
                {leftComponent}
                <View style={titleAreaStyle}>
                    <Typo
                        fontSize={titleFontSize}
                        fontWeight="600"
                        lineHeight={titleFontSize + 4}
                        textAlign="left"
                    >
                        <Text>{title}</Text>
                    </Typo>
                    {subtitle !== "" && (
                        <Typo
                            fontSize={subtitleFontSize}
                            color={DARK_GREY}
                            lineHeight={titleFontSize + 4}
                            textAlign="left"
                        >
                            <Text>{subtitle}</Text>
                        </Typo>
                    )}
                </View>
            </View>
            <View style={styles.rightSection}>{rightComponent}</View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        flexDirection: "row",
        height: 44,
        justifyContent: "center",
        width: "100%",
    },
    leftSection: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
    },
    rightSection: {
        alignItems: "flex-end",
        justifyContent: "center",
    },
    titleArea: {
        alignItems: "flex-start",
        justifyContent: "center",
    },
});

ListItem.propTypes = {
    leftComponent: PropTypes.element,
    rightComponent: PropTypes.element,
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string,
    titleFontSize: PropTypes.number.isRequired,
    subtitleFontSize: PropTypes.number,
    onListItemPressed: PropTypes.func.isRequired,
};

ListItem.defaultProps = {
    leftComponent: null,
    rightComponent: null,
    subtitle: "",
    subtitleFontSize: 10,
};

const Memoiz = React.memo(ListItem);

export default Memoiz;
