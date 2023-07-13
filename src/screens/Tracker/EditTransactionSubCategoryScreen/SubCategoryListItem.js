import PropTypes from "prop-types";
import React, { useCallback } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";

import ExpensesCategoryAvatar from "@components/Avatars/ExpensesCategoryAvatar";
import RadioButton from "@components/Buttons/RadioButton";
import ListItem from "@components/ListItems/ListItem";
import Typography from "@components/Text";

import { ROYAL_BLUE } from "@constants/colors";

const SubCategoryListItem = ({
    title,
    avatarColor,
    avatarImageUrl,
    onSubCategoryListItemPressed,
    isSelected,
    value,
    showEdit,
}) => {
    const selectCategories = useCallback(
        () => onSubCategoryListItemPressed({ title, value, isEditingSubcategories: false }),
        [onSubCategoryListItemPressed, title, value]
    );

    const editCategories = useCallback(() => {
        onSubCategoryListItemPressed({ title, value, isEditingSubcategories: true });
    }, [onSubCategoryListItemPressed, title, value]);

    return (
        <View style={styles.listItem}>
            <ListItem
                leftComponent={
                    <ExpensesCategoryAvatar
                        avatarColor={avatarColor}
                        avatarImageUrl={avatarImageUrl}
                    />
                }
                rightComponent={
                    <View style={styles.rightComponent}>
                        {showEdit && (
                            <TouchableOpacity onPress={editCategories} style={styles.editButton}>
                                <Typography
                                    text="Edit"
                                    lineHeight={18}
                                    color={ROYAL_BLUE}
                                    fontWeight="600"
                                />
                            </TouchableOpacity>
                        )}
                        <RadioButton
                            isSelected={isSelected}
                            title=""
                            onRadioButtonPressed={selectCategories}
                        />
                    </View>
                }
                title={title}
                titleFontSize={14}
                onListItemPressed={selectCategories}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    editButton: {
        marginRight: 10,
    },
    listItem: {
        alignItems: "flex-start",
        height: 56,
        justifyContent: "center",
        marginLeft: 6,
        width: "100%",
    },
    rightComponent: {
        flexDirection: "row",
    },
});

SubCategoryListItem.propTypes = {
    title: PropTypes.string.isRequired,
    avatarColor: PropTypes.string.isRequired,
    avatarImageUrl: PropTypes.string.isRequired,
    onSubCategoryListItemPressed: PropTypes.func.isRequired,
    isSelected: PropTypes.bool,
    value: PropTypes.number.isRequired,
    showEdit: PropTypes.bool,
};

SubCategoryListItem.defaultProps = {
    isSelected: false,
    showEdit: false,
};

export default React.memo(SubCategoryListItem);
