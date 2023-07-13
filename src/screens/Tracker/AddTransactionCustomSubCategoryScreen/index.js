import PropTypes from "prop-types";
import React, { Component } from "react";
import {
    Text,
    StyleSheet,
    View,
    FlatList,
    Dimensions,
    ScrollView,
    Platform,
    Animated,
    StatusBar,
    TouchableOpacity,
} from "react-native";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ExpensesCategoryAvatar from "@components/Avatars/ExpensesCategoryAvatar";
import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import DropDownInput from "@components/Inputs/DropDownInput";
import TextInput from "@components/Inputs/TextInput";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import { showInfoToast, showSuccessToast } from "@components/Toast";

import {
    createTransactionSubCategories,
    deleteTransactionSubCategories,
    updateTransactionSubCategories,
    getSubCategoriesIcons,
} from "@services";

import { DARK_GREY, BLACK, LIGHTER_YELLOW, YELLOW, GREY, ROYAL_BLUE } from "@constants/colors";
import { FA_EXPENSES_EDITCATEGORY_ENTERCATEGORYDETAILS } from "@constants/strings";

import { getShadow } from "@utils/dataModel/utility";

import SubCategoryIcon from "./SubCategoryIcon";

const { height: nativeHeight, width } = Dimensions.get("window");
const height = Platform.OS === "android" ? nativeHeight - StatusBar.currentHeight : nativeHeight;
const PROCESS_ERROR_MESSAGE =
    "Your request could not be processed at this time. Please try again later.";

export default class AddTransactionCustomSubCategoryScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showIconDrawer: false,
            subCategoryTitle: "",
            subCategoryIconImageUrl: "",
            subCategoryIconBackgroundColor: "",
            icons: [],
            selectedIconUrl: "",
            showErrorModal: false,
            isLoadingIcons: true,
            errorMessage: "",
            showDeleteSubCategoryPrompt: false,
        };
        this.subCategoryContainerOpacityAnimationValue = new Animated.Value(0);
        this.subCategoryContainerTranslateYAnimationValue = new Animated.Value(0);
        this.isProcessing = false;
    }

    static propTypes = {
        navigation: PropTypes.object.isRequired,
        route: PropTypes.object.isRequired,
    };

    componentDidMount() {
        this._syncDefaultIconPreviewToState();
        this._getIcons();
    }

    _createTransactionSubCategories = async (payload) => {
        try {
            const response = await createTransactionSubCategories(payload);
            if (response?.status === 200) return response;
            return null;
        } catch (error) {
            return null;
        }
    };

    _updateTransactionSubCategories = async (payload) => {
        try {
            const response = await updateTransactionSubCategories(payload);
            if (response?.status === 200) return response;
            return null;
        } catch (error) {
            return null;
        }
    };

    _deleteTransactionSubCategories = async (id) => {
        try {
            const response = await deleteTransactionSubCategories(id);
            if (response?.status === 200) return response;
            return null;
        } catch (error) {
            return null;
        }
    };

    _getSubCategoriesIcons = async () => {
        try {
            const response = await getSubCategoriesIcons();
            if (response?.status === 200) return response;
            return null;
        } catch (error) {
            return null;
        }
    };

    _syncDefaultIconPreviewToState = () => {
        const {
            route: { params },
        } = this.props;
        this.setState({
            subCategoryIconImageUrl: params?.categoryIconImageUrl,
            subCategoryIconBackgroundColor: params?.categoryIconBackgroundColor,
            ...(params?.isEditingSubcategories && { subCategoryTitle: params?.categoryName }),
        });
    };

    _onHeaderBackButtonPressed = () => this.props.navigation.goBack();

    _onModalHeaderCloseButtonPressed = () =>
        this.setState({ showIconDrawer: false }, () => this._hideSubCategoryContainer());

    _onTextInputValueChanged = (text) => {
        if (text.length > 30) {
            this.setState({
                showErrorModal: true,
                errorMessage: "Category name cannot exceed 30 characters.",
            });
            return;
        }
        const regex = new RegExp(/^[a-zA-Z 0-9]*$/, "ig");
        const result = regex.test(text);
        if (result) this.setState({ subCategoryTitle: text });
        else
            this.setState({
                showErrorModal: true,
                errorMessage: "Your category name must not contain any special characters.",
            });
    };

    _onDropDownInputPressed = () => {
        this.setState({ showIconDrawer: true }, () => {
            Animated.sequence([
                Animated.timing(this.subCategoryContainerTranslateYAnimationValue, {
                    toValue: height,
                    duration: 1,
                    useNativeDriver: true,
                }),
                Animated.timing(this.subCategoryContainerOpacityAnimationValue, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
            ]).start();
        });
    };

    _getIcons = async () => {
        this.setState({ isLoadingIcons: true });
        const response = await this._getSubCategoriesIcons();
        if (!response) {
            this.setState({ isLoadingIcons: false });
            return;
        }
        const categories = response.data?.categories ?? [];
        const { subCategoryIconImageUrl } = this.state;
        if (!categories.includes(subCategoryIconImageUrl))
            categories.unshift(subCategoryIconImageUrl);
        this.setState({
            icons: categories,
            isLoadingIcons: false,
            selectedIconUrl: subCategoryIconImageUrl,
        });
    };

    _renderSubCategoryIcon = ({ item }) => {
        const { selectedIconUrl } = this.state;
        return (
            <SubCategoryIcon
                iconUrl={item}
                isSelected={item === selectedIconUrl}
                onSubCategoryIconPressed={this._onSubCategoryIconSelected}
            />
        );
    };

    _subCategoryListKeyExtractor = (item, index) => `${item}-${index}`;

    _onSubCategoryIconSelected = (selectedIconUrl) =>
        this.setState({ selectedIconUrl, icons: [...this.state.icons] });

    _onSelectIconButtonPressed = () =>
        this.setState(
            {
                subCategoryIconImageUrl: this.state.selectedIconUrl,
                showIconDrawer: false,
            },
            () => this._hideSubCategoryContainer()
        );

    _hideSubCategoryContainer = () => {
        Animated.sequence([
            Animated.timing(this.subCategoryContainerOpacityAnimationValue, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.timing(this.subCategoryContainerTranslateYAnimationValue, {
                toValue: 0,
                duration: 1,
                useNativeDriver: true,
            }),
        ]).start();
    };

    _processSubCategories = () => {
        if (this.state.subCategoryTitle.trim().length === 0) {
            this.setState({
                showErrorModal: true,
                errorMessage: "Invalid input, please check the custom sub categories name field",
            });
            return;
        }
        if (this.props.route.params?.isEditingSubcategories) this._updateSubCategories();
        else this._createSubCategories();
    };

    _updateSubCategories = async () => {
        if (this.isProcessing) return;
        this.isProcessing = true;
        const { subCategoryIconBackgroundColor, subCategoryIconImageUrl, subCategoryTitle } =
            this.state;
        const {
            navigation: { goBack },
            route: { params },
        } = this.props;
        const btsId = params?.subCategoriesId;
        const request = await this._updateTransactionSubCategories({
            btsParentCategoryId: params?.categoriesId,
            colorCode: subCategoryIconBackgroundColor,
            image: subCategoryIconImageUrl,
            name: subCategoryTitle,
            btsId,
        });
        if (!request) {
            showInfoToast({
                message: PROCESS_ERROR_MESSAGE,
            });
            return;
        }
        this.isProcessing = false;
        showSuccessToast({
            message: "Category details updated successfully.",
        });
        params.updateCustomSubCategory({
            subCategoryIconImageUrl,
            subCategoryIconBackgroundColor,
            subCategoryTitle,
            index: params?.index,
            btsId,
        });
        goBack();
    };

    _createSubCategories = async () => {
        if (this.isProcessing) return;
        this.isProcessing = true;
        const { subCategoryIconBackgroundColor, subCategoryIconImageUrl, subCategoryTitle } =
            this.state;
        const {
            navigation: { goBack },
            route: { params },
        } = this.props;
        const request = await this._createTransactionSubCategories({
            btsParentCategoryId: params?.categoriesId,
            colorCode: subCategoryIconBackgroundColor,
            image: subCategoryIconImageUrl,
            name: subCategoryTitle,
        });
        if (!request) {
            showInfoToast({
                message: PROCESS_ERROR_MESSAGE,
            });
            return;
        }
        this.isProcessing = false;
        showSuccessToast({
            message: "You've successfully added a new category.",
        });
        params.addCustomSubCategory({
            subCategoryIconImageUrl,
            subCategoryIconBackgroundColor,
            subCategoryTitle,
            btsId: request?.data?.btsId,
        });
        goBack();
    };

    _onErrorModalDismissed = () => this.setState({ showErrorModal: false });

    _showSubCategoryDeletionPrompt = () => this.setState({ showDeleteSubCategoryPrompt: true });

    _deleteSubCategory = async () => {
        this._dismissSubCategoryDeletionPrompt();
        const {
            route: {
                params: { subCategoriesId },
            },
            navigation: { navigate },
        } = this.props;
        const request = await this._deleteTransactionSubCategories(subCategoriesId);
        if (!request) {
            showInfoToast({
                message: PROCESS_ERROR_MESSAGE,
            });
            return;
        }

        showSuccessToast({
            message: "Category deleted successfully. Your update will be reflected shortly.",
        });

        navigate("TabNavigator", {
            screen: "Tab",
            params: {
                screen: "Expenses",
            },
        });
    };

    _dismissSubCategoryDeletionPrompt = () => this.setState({ showDeleteSubCategoryPrompt: false });

    render() {
        const {
            showIconDrawer,
            subCategoryTitle,
            subCategoryIconImageUrl,
            subCategoryIconBackgroundColor,
            icons,
            showErrorModal,
            isLoadingIcons,
            errorMessage,
            showDeleteSubCategoryPrompt,
        } = this.state;
        const {
            route: {
                params: { title, isEditingSubcategories },
            },
        } = this.props;
        return (
            <>
                <ScreenContainer
                    backgroundType="color"
                    showOverlay={showIconDrawer}
                    analyticScreenName={FA_EXPENSES_EDITCATEGORY_ENTERCATEGORYDETAILS}
                >
                    <ScreenLayout
                        useSafeArea
                        paddingBottom={0}
                        paddingHorizontal={0}
                        header={
                            <HeaderLayout
                                headerLeftElement={
                                    <HeaderBackButton onPress={this._onHeaderBackButtonPressed} />
                                }
                                headerCenterElement={
                                    <Typo
                                        fontSize={16}
                                        lineHeight={19}
                                        fontWeight="600"
                                        text={title}
                                    />
                                }
                            />
                        }
                    >
                        <>
                            <ScrollView>
                                <View style={styles.contentArea}>
                                    <TextInput
                                        label="Name"
                                        onChangeText={this._onTextInputValueChanged}
                                        value={subCategoryTitle}
                                        autoFocus
                                        clearButtonMode="while-editing"
                                        returnKeyType="done"
                                        placeholder="Category name"
                                        maxLength={30}
                                    />
                                    <SpaceFiller width={1} height={36} />
                                    <DropDownInput
                                        label="Icon"
                                        title="Select Icon"
                                        onPress={this._onDropDownInputPressed}
                                        disabled={isLoadingIcons}
                                        isLoading={isLoadingIcons}
                                    />
                                    <SpaceFiller width={1} height={24} />
                                    <View style={[styles.iconPreviewCard, styles.shadow]}>
                                        <Typo
                                            fontSize={12}
                                            fontWeight="600"
                                            lineHeight={15}
                                            color={DARK_GREY}
                                        >
                                            <Text>Preview</Text>
                                        </Typo>
                                        <View style={styles.preview}>
                                            <ExpensesCategoryAvatar
                                                avatarColor={subCategoryIconBackgroundColor}
                                                avatarImageUrl={subCategoryIconImageUrl}
                                            />
                                            <SpaceFiller width={1} height={5} />
                                            <Typo fontSize={11} fontWeight="600" lineHeight={15}>
                                                <Text>{subCategoryTitle}</Text>
                                            </Typo>
                                        </View>
                                    </View>
                                </View>
                            </ScrollView>
                            <FixedActionContainer>
                                <View style={styles.footer}>
                                    <ActionButton
                                        fullWidth
                                        componentCenter={
                                            <Typo
                                                fontSize={14}
                                                fontWeight="600"
                                                lineHeight={18}
                                                text="Save"
                                                color={subCategoryTitle.length ? BLACK : GREY}
                                            />
                                        }
                                        onPress={this._processSubCategories}
                                        disabled={!subCategoryTitle.length}
                                        backgroundColor={
                                            subCategoryTitle.length ? YELLOW : LIGHTER_YELLOW
                                        }
                                    />
                                    {isEditingSubcategories && (
                                        <TouchableOpacity
                                            onPress={this._showSubCategoryDeletionPrompt}
                                            style={styles.deleteButton}
                                            hitSlop={{ top: 10, left: 50, bottom: 10, right: 50 }}
                                        >
                                            <Typo
                                                text="Delete"
                                                lineHeight={18}
                                                color={ROYAL_BLUE}
                                                fontWeight="600"
                                            />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </FixedActionContainer>
                        </>
                    </ScreenLayout>
                </ScreenContainer>
                <Popup
                    visible={showErrorModal}
                    title="Category Name"
                    description={errorMessage}
                    onClose={this._onErrorModalDismissed}
                />
                <Popup
                    visible={showDeleteSubCategoryPrompt}
                    title="Delete Category"
                    description={`Are you sure you want to delete ${subCategoryTitle}? All related category customisations will be discarded.`}
                    onClose={this._dismissSubCategoryDeletionPrompt}
                    primaryAction={{
                        text: "Yes",
                        onPress: this._deleteSubCategory,
                    }}
                    secondaryAction={{
                        text: "No",
                        onPress: this._dismissSubCategoryDeletionPrompt,
                    }}
                />
                <Animated.View
                    style={[
                        styles.subCategoriesSelectionContainer,
                        {
                            opacity: this.subCategoryContainerOpacityAnimationValue,
                            transform: [
                                {
                                    translateY: this.subCategoryContainerTranslateYAnimationValue,
                                },
                            ],
                        },
                    ]}
                >
                    <ScreenLayout
                        header={
                            <HeaderLayout
                                headerLeftElement={
                                    <HeaderCloseButton
                                        isWhite
                                        onPress={this._onModalHeaderCloseButtonPressed}
                                    />
                                }
                                headerCenterElement={
                                    <Typo
                                        fontSize={16}
                                        lineHeight={19}
                                        fontWeight="600"
                                        color="#ffffff"
                                    >
                                        <Text>Select Icon</Text>
                                    </Typo>
                                }
                            />
                        }
                        useSafeArea
                    >
                        <>
                            <FlatList
                                data={icons}
                                renderItem={this._renderSubCategoryIcon}
                                horizontal={false}
                                numColumns={Math.floor((width - 48) / 56)}
                                contentContainerStyle={styles.contentContainerStyle}
                                style={styles.flatList}
                                keyExtractor={this._subCategoryListKeyExtractor}
                                indicatorStyle="white"
                            />
                            <ActionButton
                                componentCenter={
                                    <Typo fontSize={14} fontWeight="600" lineHeight={18}>
                                        <Text>Select Icon</Text>
                                    </Typo>
                                }
                                onPress={this._onSelectIconButtonPressed}
                            />
                        </>
                    </ScreenLayout>
                </Animated.View>
            </>
        );
    }
}

const WHITE = "#ffffff";
const FLEX_START = "flex-start";

const styles = StyleSheet.create({
    contentArea: {
        alignItems: FLEX_START,
        flex: 1,
        justifyContent: "center",
        paddingBottom: 10,
        paddingHorizontal: 24,
    },
    contentContainerStyle: {
        alignItems: "center",
        flexGrow: 1,
        justifyContent: "space-around",
    },
    deleteButton: {
        alignItems: "center",
        justifyContent: "center",
        marginTop: 24,
    },
    flatList: {
        marginBottom: 36,
    },
    footer: {
        alignItems: "center",
        flex: 1,
    },
    iconPreviewCard: {
        alignItems: FLEX_START,
        backgroundColor: WHITE,
        borderRadius: 8,
        height: 130,
        justifyContent: FLEX_START,
        paddingHorizontal: 23,
        paddingVertical: 18,
        width: "100%",
    },
    preview: {
        alignItems: "center",
        flex: 1,
        justifyContent: "center",
        width: "100%",
    },
    shadow: {
        ...getShadow({}),
    },
    subCategoriesSelectionContainer: {
        bottom: height,
        height,
        left: 0,
        position: "absolute",
        right: 0,
    },
});
