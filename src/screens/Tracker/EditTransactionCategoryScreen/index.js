import moment from "moment";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { Text, FlatList, StyleSheet, View } from "react-native";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Placeholder from "@components/Placeholders/SpaceFiller";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import { showInfoToast, showSuccessToast } from "@components/Toast";

import { getExpensesCategories, updatePFMTransaction } from "@services";

import { LIGHT_GREY, MEDIUM_GREY } from "@constants/colors";
import { FA_EXPENSES_EDITCATEGORY_SELECTCATEGORY } from "@constants/strings";

import Assets from "@assets";

import CategoryListItem from "./CategoryListItem";

const PROCESS_ERROR_MESSAGE =
    "Your request could not be processed at this time. Please try again later.";

export default class EditTransactionCategoryScreen extends Component {
    state = {
        categories: [],
        showRestoreTransactionCategoryPrompt: false,
    };

    static propTypes = {
        navigation: PropTypes.object.isRequired,
        route: PropTypes.object.isRequired,
    };

    componentDidMount() {
        this._unSubNavigationFocusListener = this.props.navigation.addListener(
            "focus",
            this._handleOnFocusEvent
        );
    }

    componentWillUnmount() {
        this._unSubNavigationFocusListener();
    }

    _handleOnFocusEvent = () => this._syncCategoriesToState();

    _onHeaderCloseButtonPressed = () => this.props.navigation.goBack();

    _onRenderCategoriesItems = ({ item }) => (
        <CategoryListItem {...item} onCategoryListItemPressed={this._onCategoriesListItemPressed} />
    );

    _syncCategoriesToState = async () => {
        const {
            route: { params },
        } = this.props;

        const request = await this._getExpensesCategories();
        const categories = request?.data?.categories ?? [];
        const mappedCategories = categories.map((category) => {
            const { btsId, name, colorCode, image } = category;
            return {
                value: btsId,
                title: name,
                avatarImageUrl: image,
                avatarColor: colorCode,
                ...category,
            };
        });

        this.setState({
            categories: [
                ...(params?.canRestoreToOriginalCategories
                    ? [
                          {
                              value: -1,
                              title: "Restore Default Category",
                              icon: Assets.icon24BlackFlip,
                              avatarColor: "transparent",
                          },
                      ]
                    : []),
                ...mappedCategories,
            ],
        });
    };

    _getExpensesCategories = async () => {
        try {
            const response = await getExpensesCategories();
            if (response?.status === 200) return response;
            return null;
        } catch (error) {
            return null;
        }
    };

    _restoreTransactionCategory = async (payload) => {
        try {
            const response = await updatePFMTransaction(payload);
            if (response?.status === 200) return response;
            return null;
        } catch (error) {
            return null;
        }
    };

    _renderCategoryListSeparator = () => (
        <Placeholder width="100%" height={1} backgroundColor={LIGHT_GREY} />
    );

    _categoryListKeyExtractor = (item, index) => `${item.title}${index}`;

    _onCategoriesListItemPressed = ({ title, value }) => {
        if (value === -1) {
            this._showRestoreOriginalCategoryPrompt();
            return;
        }
        const { subCategories, value: categoriesId } = this.state.categories.find(
            (category) => value === category.value
        );
        this.props.navigation.navigate("EditTransactionSubCategoryScreen", {
            title,
            value,
            setCategory: this.props.route.params?.setCategory ?? null,
            subCategories,
            categoriesId,
            ...this.props.route.params,
        });
    };

    _showRestoreOriginalCategoryPrompt = () =>
        this.setState({ showRestoreTransactionCategoryPrompt: true });

    _restoreOriginalCategory = async () => {
        this._dismissRestoreOriginalCategoryPrompt();
        const {
            route: {
                params: {
                    transactionData: {
                        btsId,
                        btsNotes,
                        btsDescription,
                        btsDefaultSubCategory,
                        amount,
                        paymentMethod,
                        transactionDate,
                        transactionIndicator,
                        description,
                    },
                },
            },
            navigation: { navigate },
        } = this.props;

        const request = await this._restoreTransactionCategory({
            btsId,
            btsSubCategoryId: btsDefaultSubCategory.btsId,
            amount: Math.abs(amount),
            btsNotes: btsNotes ?? btsDescription ?? description,
            countryCode: "MY",
            paymentMethod,
            transactionDate: moment(transactionDate, "YYYY-MM-DD HH:mm:ss:S").format("YYYYMMDD"),
            transactionIndicator,
        });
        if (!request) {
            showInfoToast({
                message: PROCESS_ERROR_MESSAGE,
            });
            return;
        }
        showSuccessToast({
            message: "You’ve successfully restored the default category for this transaction.",
        });
        navigate("AddOrEditTransactionScreen", {
            isCategoryRestored: true,
        });
    };

    _dismissRestoreOriginalCategoryPrompt = () =>
        this.setState({ showRestoreTransactionCategoryPrompt: false });

    render() {
        const { categories, showRestoreTransactionCategoryPrompt } = this.state;
        return (
            <>
                <ScreenContainer
                    backgroundType="color"
                    backgroundColor={MEDIUM_GREY}
                    analyticScreenName={FA_EXPENSES_EDITCATEGORY_SELECTCATEGORY}
                >
                    <ScreenLayout
                        useSafeArea
                        header={
                            <HeaderLayout
                                headerCenterElement={
                                    <Typo fontSize={16} fontWeight="600" lineHeight={20}>
                                        <Text>Categories</Text>
                                    </Typo>
                                }
                                headerRightElement={
                                    <HeaderCloseButton onPress={this._onHeaderCloseButtonPressed} />
                                }
                            />
                        }
                        paddingBottom={0}
                        neverForceInset={["bottom"]}
                    >
                        <FlatList
                            data={categories}
                            renderItem={this._onRenderCategoriesItems}
                            showsHorizontalScrollIndicator={false}
                            showsVerticalScrollIndicator={false}
                            ListHeaderComponent={
                                <View style={styles.header}>
                                    <Typo
                                        fontSize={12}
                                        fontWeight="600"
                                        lineHeight={15}
                                        text="Select a category"
                                    />
                                </View>
                            }
                            ItemSeparatorComponent={this._renderCategoryListSeparator}
                            keyExtractor={this._categoryListKeyExtractor}
                            ListFooterComponent={<Placeholder width="100%" height={100} />}
                        />
                    </ScreenLayout>
                </ScreenContainer>
                <Popup
                    visible={showRestoreTransactionCategoryPrompt}
                    title="Restore Default"
                    description={`Are you sure you want to restore the original category for this transaction (${
                        this.props.route.params?.transactionData?.btsDefaultSubCategory?.name ?? ""
                    })?`}
                    onClose={this._dismissRestoreOriginalCategoryPrompt}
                    primaryAction={{
                        text: "Confirm",
                        onPress: this._restoreOriginalCategory,
                    }}
                    secondaryAction={{
                        text: "Cancel",
                        onPress: this._dismissRestoreOriginalCategoryPrompt,
                    }}
                />
            </>
        );
    }
}

const styles = StyleSheet.create({
    header: {
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 21,
    },
});
