import PropTypes from "prop-types";
import React, { useCallback } from "react";
import { View, StyleSheet, Image } from "react-native";

import ExpensesCategoryAvatar from "@components/Avatars/ExpensesCategoryAvatar";
import ListItem from "@components/ListItems/ListItem";

import Assets from "@assets";

const CategoryListItem = ({
    title,
    avatarColor,
    avatarImageUrl,
    icon,
    value,
    onCategoryListItemPressed,
}) => {
    const onPress = useCallback(
        () => onCategoryListItemPressed({ title, value }),
        [onCategoryListItemPressed, title, value]
    );

    return (
        <View style={styles.listItem}>
            <ListItem
                leftComponent={
                    avatarImageUrl ? (
                        <ExpensesCategoryAvatar
                            avatarColor={avatarColor}
                            avatarImageUrl={avatarImageUrl}
                        />
                    ) : (
                        <Image style={styles.icon} source={icon} />
                    )
                }
                rightComponent={
                    <Image style={styles.image} source={Assets.icChevronRight24Black} />
                }
                title={title}
                titleFontSize={14}
                onListItemPressed={onPress}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    icon: {
        height: 32,
        width: 32,
    },
    image: {
        height: 24,
        width: 24,
    },
    listItem: {
        alignItems: "flex-start",
        height: 56,
        justifyContent: "center",
        marginLeft: 6,
        width: "100%",
    },
});

CategoryListItem.propTypes = {
    title: PropTypes.string.isRequired,
    avatarColor: PropTypes.string.isRequired,
    avatarImageUrl: PropTypes.string,
    onCategoryListItemPressed: PropTypes.func.isRequired,
    value: PropTypes.number.isRequired,
    icon: PropTypes.any,
};

CategoryListItem.defaultProps = {
    icon: null,
    avatarImageUrl: "",
};

export default React.memo(CategoryListItem);
