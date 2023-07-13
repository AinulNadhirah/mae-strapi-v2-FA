import PropTypes from "prop-types";
import React, { Component } from "react";
import { Text, FlatList, StyleSheet, View, Animated } from "react-native";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Placeholder from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";

import { LIGHT_GREY, DARK_GREY, MEDIUM_GREY } from "@constants/colors";
import { FA_EXPENSES_EDITCATEGORY_SELECTSUBCATEGORY } from "@constants/strings";

import SubCategoryListItem from "./SubCategoryListItem";

export default class EditTransactionSubCategoryScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            categories: [],
            isCategorySelected: false,
            selectedSubCategoryTitle: "",
            selectedSubCategoryIconImageUrl: "",
            selectedSubCategoryIconBackgroundColor: "",
            selectedSubCategoryValue: "",
        };
        this.onHeaderBackButtonPressed = this._onHeaderBackButtonPressed.bind(this);
        this.onRenderSubCategoriesItems = this._onRenderSubCategoriesItems.bind(this);
        this.renderSubCategoryListSeparator = this._renderSubCategoryListSeparator.bind(this);
        this.subCategoryListKeyExtractor = this._subCategoryListKeyExtractor.bind(this);
        this.renderCategoryListFooter = this._renderCategoryListFooter.bind(this);
        this.onDoneButtonPressed = this._onDoneButtonPressed.bind(this);
        this.setFlatListReference = this._setFlatListReference.bind(this);
        this.transformYActionButton = new Animated.Value(0);
        this.opacityActionButton = new Animated.Value(0);
    }

    static propTypes = {
        navigation: PropTypes.object.isRequired,
        route: PropTypes.object.isRequired,
    };

    componentDidMount() {
        this._hydrateScreen();
    }

    _onRenderSubCategoriesItems = ({ item }) => {
        return (
            <SubCategoryListItem
                {...item}
                onSubCategoryListItemPressed={this._onSubCategoryListItemPressed}
            />
        );
    };

    _hydrateScreen = () => {
        const {
            route: { params },
        } = this.props;
        const subCategories = params?.subCategories ?? [];
        const mappedCategories = subCategories.map((subCategory, index) => {
            const { btsId, name, colorCode, image, createdBy } = subCategory;
            return {
                value: btsId,
                title: name,
                avatarImageUrl: image,
                avatarColor: colorCode,
                showEdit: createdBy?.toUpperCase?.() === "USER",
                index,
                ...subCategory,
            };
        });
        this.setState({ categories: mappedCategories });
    };

    _renderSubCategoryListSeparator = () => (
        <Placeholder width="100%" height={1} backgroundColor={LIGHT_GREY} />
    );

    _subCategoryListKeyExtractor = (item, index) => `${item.title}${index}`;

    _onSubCategoryListItemPressed = ({ title, value, isEditingSubcategories }) => {
        const { categories } = this.state;

        if (isEditingSubcategories) {
            const selectedSubCategory = categories.find(
                (category) => value === category.value && title === category.title
            );
            this._updateSubCategory(selectedSubCategory);
            return;
        }

        let selectedItem = null;
        const editedCategories = categories.map((category) => {
            if (value === category.value && title === category.title) {
                selectedItem = category;
                return { ...category, isSelected: true };
            } else return { ...category, isSelected: false };
        });
        this.setState({
            categories: editedCategories,
            isCategorySelected: true,
            selectedSubCategoryTitle: selectedItem.title,
            selectedSubCategoryValue: selectedItem.value,
            selectedSubCategoryIconBackgroundColor: selectedItem.avatarColor,
            selectedSubCategoryIconImageUrl: selectedItem.avatarImageUrl,
        });
    };

    _onHeaderBackButtonPressed = () => this.props.navigation.goBack();

    _renderCategoryListFooter = () => <Placeholder width="100%" height={100} />;

    _onDoneButtonPressed = () => {
        const {
            navigation: { pop },
            route,
        } = this.props;
        const {
            selectedSubCategoryIconBackgroundColor,
            selectedSubCategoryIconImageUrl,
            selectedSubCategoryTitle,
            selectedSubCategoryValue,
            categories,
        } = this.state;
        const setCategoryFunction =
            route.params?.setCategory ??
            function () {
                return;
            };
        const categoriesId = route.params?.categoriesId ?? 9999999;
        setCategoryFunction({
            selectedSubCategoryTitle,
            selectedSubCategoryIconBackgroundColor,
            selectedSubCategoryIconImageUrl,
            selectedSubCategoryValue,
            subCategories: categories,
            subCategoriesParentId: categoriesId,
        });
        pop(2);
    };

    _updateSubCategory = ({ avatarImageUrl, avatarColor, title, index, value }) => {
        const {
            route: {
                params: { categoriesId },
            },
        } = this.props;
        this._navigateToCustomSubCategoryScreen({
            title,
            categoryIconImageUrl: avatarImageUrl,
            categoryIconBackgroundColor: avatarColor,
            categoryName: title,
            updateCustomSubCategory: this._updateCustomSubCategory,
            isEditingSubcategories: true,
            index,
            categoriesId,
            subCategoriesId: value,
        });
    };

    _updateCustomSubCategory = ({
        subCategoryIconImageUrl,
        subCategoryIconBackgroundColor,
        subCategoryTitle,
        btsId,
    }) =>
        this.setState({
            isCategorySelected: true,
            selectedSubCategoryTitle: subCategoryTitle,
            selectedSubCategoryIconImageUrl: subCategoryIconImageUrl,
            selectedSubCategoryIconBackgroundColor: subCategoryIconBackgroundColor,
            selectedSubCategoryValue: btsId,
            categories: this.state.categories.map((category) => {
                if (category.value === btsId)
                    return {
                        ...category,
                        title: subCategoryTitle,
                        avatarImageUrl: subCategoryIconImageUrl,
                        avatarColor: subCategoryIconBackgroundColor,
                    };
                return category;
            }),
        });

    _createSubCategory = () => {
        const { categories } = this.state;
        let categoryIconImageUrl = "";
        let categoryIconBackgroundColor = DARK_GREY;
        if (categories.length > 0) {
            categoryIconImageUrl = categories[0].avatarImageUrl;
            categoryIconBackgroundColor = categories[0].avatarColor;
        }
        const {
            route: {
                params: { title, categoriesId },
            },
        } = this.props;
        this._navigateToCustomSubCategoryScreen({
            title,
            categoryIconImageUrl,
            categoryIconBackgroundColor,
            addCustomSubCategory: this._onCustomSubCategoryCreation,
            isEditingSubcategories: false,
            categoriesId,
        });
    };

    _navigateToCustomSubCategoryScreen = (params) =>
        this.props.navigation.navigate("AddTransactionCustomSubCategoryScreen", {
            ...params,
        });

    _onCustomSubCategoryCreation = ({
        subCategoryIconImageUrl,
        subCategoryIconBackgroundColor,
        subCategoryTitle,
        btsId,
    }) => {
        const categoriesCopy = [...this.state.categories];
        categoriesCopy.push({
            title: subCategoryTitle,
            avatarImageUrl: subCategoryIconImageUrl,
            avatarColor: subCategoryIconBackgroundColor,
            isSelected: false,
            value: btsId,
            showEdit: true,
        });
        const categories = categoriesCopy.map((category, index) => {
            if (index === categoriesCopy.length - 1) {
                return {
                    ...category,
                    isSelected: true,
                };
            } else {
                return {
                    ...category,
                    isSelected: false,
                };
            }
        });
        this.setState({
            categories,
            isCategorySelected: true,
            selectedSubCategoryTitle: subCategoryTitle,
            selectedSubCategoryIconImageUrl: subCategoryIconImageUrl,
            selectedSubCategoryIconBackgroundColor: subCategoryIconBackgroundColor,
            selectedSubCategoryValue: btsId,
        });
        this.flatListReference.scrollToEnd({ animated: true });
    };

    _setFlatListReference = (ref) => (this.flatListReference = ref);

    render() {
        const { categories, isCategorySelected } = this.state;
        const screenTitle = this.props.route.params?.title;
        return (
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                analyticScreenName={FA_EXPENSES_EDITCATEGORY_SELECTSUBCATEGORY}
            >
                <ScreenLayout
                    useSafeArea
                    paddingBottom={0}
                    paddingHorizontal={0}
                    header={
                        <HeaderLayout
                            headerLeftElement={
                                <HeaderBackButton onPress={this.onHeaderBackButtonPressed} />
                            }
                            headerCenterElement={
                                <Typo fontSize={16} lineHeight={19} fontWeight="600">
                                    <Text>{screenTitle}</Text>
                                </Typo>
                            }
                        />
                    }
                >
                    <React.Fragment>
                        <FlatList
                            data={categories}
                            renderItem={this.onRenderSubCategoriesItems}
                            showsHorizontalScrollIndicator={false}
                            showsVerticalScrollIndicator={false}
                            style={styles.flatList}
                            ListHeaderComponent={
                                <View style={styles.header}>
                                    <Typo
                                        fontSize={12}
                                        fontWeight="600"
                                        lineHeight={15}
                                        text="Select a subcategory"
                                    />
                                </View>
                            }
                            ItemSeparatorComponent={this.renderSubCategoryListSeparator}
                            keyExtractor={this.subCategoryListKeyExtractor}
                            ListFooterComponent={this.renderCategoryListFooter}
                            ref={this.setFlatListReference}
                        />
                        <FixedActionContainer>
                            <ActionButton
                                fullWidth
                                componentCenter={
                                    <Typo
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={18}
                                        text={isCategorySelected ? "Done" : "New Category"}
                                    />
                                }
                                onPress={
                                    isCategorySelected
                                        ? this.onDoneButtonPressed
                                        : this._createSubCategory
                                }
                            />
                        </FixedActionContainer>
                    </React.Fragment>
                </ScreenLayout>
            </ScreenContainer>
        );
    }
}

const styles = StyleSheet.create({
    flatList: { paddingHorizontal: 24 },
    header: {
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 21,
    },
});
