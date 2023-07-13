import moment from "moment";
import PropTypes from "prop-types";
import React, { Component } from "react";
import {
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    View,
    Image,
    Platform,
    ActivityIndicator,
    Animated,
    Dimensions,
} from "react-native";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ExpensesCategoryAvatar from "@components/Avatars/ExpensesCategoryAvatar";
import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import ListItem from "@components/ListItems/ListItem";
import NumericalKeyboard from "@components/NumericalKeyboard";
import DatePicker from "@components/Pickers/DatePicker";
import ScrollPicker from "@components/Pickers/ScrollPicker";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import { showErrorToast, showSuccessToast } from "@components/Toast";

import { createPFMTransaction, updatePFMTransaction } from "@services";
import { FAExpensesScreen } from "@services/analytics/analyticsExpenses";

import {
    DARK_GREY,
    BLACK,
    MEDIUM_GREY,
    GREY,
    DISABLED_TEXT,
    YELLOW,
    LIGHTER_YELLOW,
} from "@constants/colors";
import { getDateRangeDefaultData } from "@constants/datePickerDefaultData";
import { ADD_EXPENSES } from "@constants/dateScenarios";

import { getShadow } from "@utils/dataModel/utility";
import { getDateRange, getStartDate, getEndDate } from "@utils/dateRange";

import Assets from "@assets";

import AmountDisplay from "./AmountDisplay";
import NotesArea from "./NotesArea";

const selectedPaymentMethodMappings = Object.freeze({
    CASH: "Cash",
    QR_PAYMENT: "QR Payment",
    DEBIT_CARD: "Debit Card",
    CREDIT_CARD: "Credit Card",
    TRANSFER: "Transfer",
    VOUCHER: "Voucher",
    MOBILE_PAYMENT: "Mobile Payment",
    WEB_PAYMENT: "Web Payment",
});

const editingModeEnum = Object.freeze({
    add: "add",
    edit: "edit",
});

export default class AddOrEditTransactionScreen extends Component {
    static propTypes = {
        navigation: PropTypes.object.isRequired,
        route: PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            amount: "",
            paymentMethod: "CASH",
            notes: "",
            categoryTitle: "",
            categoryValue: "",
            categoryIconImageUrl: "",
            categoryIconBackgroundColor: "",
            categoryParentId: "",
            radioItems: [
                { title: "EXPENSE", isSelected: true, value: "DR" },
                { title: "INCOME", isSelected: false, value: "CR" },
            ],
            showNumPad: false,
            showPaymentPicker: false,
            paymentMethodScrollPickerData: [],
            isLoadingCategories: false,
            categories: [],
            showErrorModal: false,
            isValidatingForm: false,
            errorMessage: "",
            showDatePicker: false,
            selectedDate: moment(),
            showAmountDateIndicator: true,
            editingMode: editingModeEnum.add,
            isCashWalletTransaction: false,
            showInitialBalanceSetupPrompt: false,
            showInitialBalanceAddedPrompt: false,
            numericalKeyboardHeight: 0,
            validDateRangeData: getDateRangeDefaultData(ADD_EXPENSES), //initial state value before api returns promise object
        };
        this.numericalKeyboardAnimationValue = new Animated.Value(0);
    }

    componentDidMount() {
        this._getDatePickerData();
        this._generatePaymentPickerData();
        this._syncParamToState();
        this._unSubNavigationFocusListener = this.props.navigation.addListener(
            "focus",
            this._handleOnFocusEvent
        );
    }
    _getDatePickerData() {
        getDateRange(ADD_EXPENSES).then((data) => {
            this.setState({
                validDateRangeData: data,
            });
        });
    }

    componentWillUnmount() {
        this._unSubNavigationFocusListener();
    }

    _handleOnFocusEvent = () => {
        if (this.props.route.params.isCategoryRestored) this._updateCategoryToDefault();
    };

    _updateCategoryToDefault = () => {
        const {
            route: {
                params: {
                    transactionData: {
                        btsDefaultSubCategory: {
                            name,
                            colorCode,
                            image,
                            btsId: selectedSubCategoryValue,
                        },
                        btsDefaultCategory: { btsId: subCategoriesParentId },
                    },
                    addEditTransactionCallback,
                },
            },
        } = this.props;

        this.setState({
            categoryIconBackgroundColor: colorCode,
            categoryIconImageUrl: image,
            categoryTitle: name,
            categoryValue: selectedSubCategoryValue,
            categoryParentId: subCategoriesParentId,
        });

        addEditTransactionCallback?.({
            ...this.props.route.params?.transactionData,
            btsSubCategory: {
                colorCode,
                image,
                name,
                btsId: selectedSubCategoryValue,
                parentBtsId: subCategoriesParentId,
            },
        });
    };

    _syncParamToState = () => {
        const { route } = this.props;
        const editingMode = route.params?.editingMode ?? editingModeEnum.add;
        const isCashWalletTransaction = route.params?.isCashWalletTransaction ?? true;

        if (editingMode.toLowerCase() === editingModeEnum.add)
            this.setState({
                editingMode,
                isCashWalletTransaction,
            });
        else {
            const {
                amount,
                transactionIndicator,
                btsNotes,
                transactionDate,
                btsId,
                btsSubCategory: { colorCode, image, name, btsId: subCategoryBtsId },
                paymentMethod,
            } = route.params?.transactionData;
            this.editTransactionBtsId = btsId;
            const radioItems = this.state.radioItems.map((item) => {
                const { value } = item;
                if (value.toLowerCase() === transactionIndicator.toLowerCase())
                    return { ...item, isSelected: true };
                else return { ...item, isSelected: false };
            });
            this.setState({
                paymentMethod,
                editingMode,
                isCashWalletTransaction,
                radioItems,
                amount: Math.abs(amount).toFixed(2).toString().replace(".", ""),
                notes: btsNotes,
                selectedDate: moment(transactionDate, "YYYY-MM-DD HH:mm:ss:S"),
                categoryTitle: name,
                categoryIconImageUrl: image,
                categoryIconBackgroundColor: colorCode,
                categoryValue: subCategoryBtsId,
            });
        }
    };

    _updatePFMTransaction = async (payload) => {
        try {
            const response = await updatePFMTransaction(payload);
            if (response?.status === 200) return response;
            return null;
        } catch (error) {
            return null;
        }
    };

    _createPFMTransaction = async (payload) => {
        try {
            const response = await createPFMTransaction(payload);
            if (response?.status === 200) return response;
            return null;
        } catch (error) {
            return null;
        }
    };

    _generatePaymentPickerData = () => {
        const array = Object.entries(selectedPaymentMethodMappings);
        const paymentMethodScrollPickerData = array.map((v) => {
            const [value, title] = v;
            return { title, value };
        });
        this.setState({ paymentMethodScrollPickerData });
    };

    _onHeaderBackButtonPressed = () => this.props.navigation.goBack();

    _getAmountDisplayMode = () => {
        const selected = this.state.radioItems.filter((item) => {
            const { isSelected } = item;
            return isSelected;
        });
        return selected[0].title.toLowerCase();
    };

    _onNumPadNumericKeyPressed = (number) => {
        if (number === "0" && !this.state.amount) return;
        this.setState({
            amount: number,
        });
    };

    _onNumPadClosed = () => this.setState({ showNumPad: false });

    _onAmountFieldPressed = () => this.setState(({ showNumPad }) => ({ showNumPad: !showNumPad }));

    _onAmountDateIndicatorPressed = () => {
        const { showDatePicker } = this.state;
        this.setState({ showDatePicker: !showDatePicker, showNumPad: false });
    };

    _onPaymentPickerPressed = () =>
        this.setState({
            showPaymentPicker: !this.state.showPaymentPicker,
            showNumPad: false,
            showDatePicker: false,
        });

    _onPaymentPickerDoneButtonPressed = (value) =>
        this.setState({ paymentMethod: value, showPaymentPicker: false });

    _onPaymentPickerDismissed = () => this.setState({ showPaymentPicker: false });

    _onAddNotes = (notes) => this.setState({ notes });

    _onNotesAreaFocused = () => this.setState({ showNumPad: false, showDatePicker: false });

    _onCategoryButtonPressed = () =>
        this.props.navigation.navigate("EditTransactionCategoryScreen", {
            ...this.props.route.params,
            setCategory: this._onCategorySelected,
            categories: this.state.categories,
        });

    _onCategorySelected = (category) => {
        const {
            selectedSubCategoryIconBackgroundColor,
            selectedSubCategoryIconImageUrl,
            selectedSubCategoryTitle,
            selectedSubCategoryValue,
            subCategories,
            subCategoriesParentId,
        } = category;
        const sanitizedSubCategories = subCategories.map((item) => ({
            ...item,
            isSelected: false,
        }));
        const categories = this.state.categories.map((item) => {
            const { btsId } = item;
            if (btsId === subCategoriesParentId)
                return {
                    ...item,
                    subCategories: sanitizedSubCategories,
                };
            else return item;
        });
        this.setState({
            categoryIconBackgroundColor: selectedSubCategoryIconBackgroundColor,
            categoryIconImageUrl: selectedSubCategoryIconImageUrl,
            categoryTitle: selectedSubCategoryTitle,
            categoryValue: selectedSubCategoryValue,
            categoryParentId: subCategoriesParentId,
            categories,
        });
    };

    _generatePFMTransactionPayload = () => {
        const { amount, paymentMethod, selectedDate, notes, categoryValue, categoryTitle } =
            this.state;
        const convertedAmount = parseInt(amount, 10) / 100;

        if (!this._isAmountValid(convertedAmount) || !this._isCategoryValid(categoryTitle))
            return null;
        const transactionIndicator = this._getTransactionIndicator();
        const dateString = selectedDate.format("YYYYMMDD");

        return {
            amount: convertedAmount,
            btsNotes: notes,
            btsSubCategoryId: categoryValue,
            countryCode: "MY",
            paymentMethod,
            transactionDate: dateString,
            transactionIndicator,
        };
    };

    _addTransaction = async () => {
        const payload = this._generatePFMTransactionPayload();
        if (!payload) return;
        const request = await this._createPFMTransaction(payload);
        FAExpensesScreen.logFormEvent(request);
        if (!request) {
            showErrorToast({
                message: "Your expense could not be added at this time. Please try again.",
            });
            return;
        }
        showSuccessToast({ message: "You've successfully added an expense to your list." });
        const {
            route: { params },
            navigation: { goBack },
        } = this.props;
        params?.addEditTransactionCallback?.(true);
        goBack();
    };

    _editTransaction = async () => {
        const payload = this._generatePFMTransactionPayload();
        if (!payload) return;
        const request = await this._updatePFMTransaction({
            ...payload,
            btsId: this.editTransactionBtsId,
        });
        if (!request) {
            showErrorToast({
                message: "Your expense could not be updated at this time. Please try again.",
            });
            return;
        }
        showSuccessToast({
            message: "You've successfully updated an expense from your list.",
        });
        this._updateExpenseDetailsScreen(payload);
        this.props.navigation.goBack();
    };

    _updateExpenseDetailsScreen = ({
        amount,
        btsNotes,
        paymentMethod,
        transactionDate,
        transactionIndicator,
    }) => {
        const {
            route: {
                params: { addEditTransactionCallback, transactionData },
            },
        } = this.props;
        const {
            categoryValue,
            categoryIconBackgroundColor,
            categoryTitle,
            categoryIconImageUrl,
            categoryParentId,
        } = this.state;
        addEditTransactionCallback?.({
            ...transactionData,
            amount: transactionIndicator === "DR" ? -amount : amount,
            transactionIndicator,
            btsNotes,
            transactionDate,
            btsSubCategory: {
                colorCode: categoryIconBackgroundColor,
                image: categoryIconImageUrl,
                name: categoryTitle,
                btsId: categoryValue,
                parentBtsId: categoryParentId,
            },
            paymentMethod,
        });
    };

    _processTransaction = async () => {
        this.setState({ isValidatingForm: true });
        if (this.state.editingMode === editingModeEnum.add) await this._addTransaction();
        else await this._editTransaction();
        this.setState({ isValidatingForm: false });
    };

    _getTransactionIndicator = () => {
        const [{ value }] = this.state.radioItems.filter((item) => item.isSelected);
        return value;
    };

    _isAmountValid = (convertedAmount) => {
        if (isNaN(convertedAmount) || !convertedAmount) {
            this.setState({
                showErrorModal: true,
                errorMessage: "The amount should be bigger than zero.",
                isValidatingForm: false,
            });
            return false;
        } else return true;
    };

    _isCategoryValid = (categoryTitle) => {
        if (!categoryTitle) {
            this.setState({
                showErrorModal: true,
                errorMessage: "Please select a category for this expense.",
                isValidatingForm: false,
            });
            return false;
        } else return true;
    };

    _onErrorMessageDismissed = () => this.setState({ showErrorModal: false, errorMessage: "" });

    _onDatePickerDoneButtonPressed = (dateObject) =>
        this.setState({ selectedDate: moment(dateObject), showDatePicker: false });

    _onDatePickerCancelButtonPressed = () => this.setState({ showDatePicker: false });

    _getAmountDateIndicatorTitle = () => {
        const { selectedDate } = this.state;
        const momentObject = moment(selectedDate);
        if (moment().isSame(momentObject, "day")) return "Today";
        else if (moment().subtract(1, "day").isSame(momentObject, "day")) return "Yesterday";
        else return momentObject.format("DD MMM YYYY");
    };

    _renderCategoriesButton = () => {
        const {
            categoryIconBackgroundColor,
            categoryIconImageUrl,
            categoryTitle,
            isLoadingCategories,
            showErrorModal,
        } = this.state;
        return (
            <ListItem
                leftComponent={
                    categoryIconImageUrl === "" ? (
                        <View style={styles.category} />
                    ) : (
                        <ExpensesCategoryAvatar
                            avatarColor={categoryIconBackgroundColor}
                            avatarImageUrl={categoryIconImageUrl}
                        />
                    )
                }
                title={categoryTitle === "" ? "Set Category" : categoryTitle}
                titleFontSize={14}
                onListItemPressed={this._onCategoryButtonPressed}
                disabled={showErrorModal || isLoadingCategories}
                rightComponent={
                    isLoadingCategories || showErrorModal ? (
                        <ActivityIndicator size="small" color={BLACK} />
                    ) : (
                        <Image style={styles.listItemImage} source={Assets.icChevronRight24Black} />
                    )
                }
            />
        );
    };

    _renderTransactionButton = () => {
        const {
            editingMode,
            isValidatingForm,
            isLoadingCategories,
            showErrorModal,
            paymentMethod,
            notes,
            amount,
            selectedDate,
            categoryValue,
        } = this.state;
        let isFormEdited = true;

        if (editingMode === editingModeEnum.edit) {
            const {
                route: {
                    params: {
                        transactionData: {
                            btsNotes,
                            transactionDate,
                            amount: existingTransactionAmount,
                            paymentMethod: existingPaymentMethod,
                            btsSubCategory: { btsId },
                        },
                        isCategoryRestored,
                    },
                },
            } = this.props;

            isFormEdited =
                btsNotes !== notes ||
                moment(transactionDate, "YYYY-MM-DD HH:mm:ss:S").diff(selectedDate, "day") ||
                Math.abs(existingTransactionAmount).toFixed(2).toString().replace(".", "") !==
                amount ||
                existingPaymentMethod !== paymentMethod ||
                (btsId !== categoryValue && !isCategoryRestored);
        }

        let componentCenter = (
            <Typo
                text={editingMode === "add" ? "Add Expense" : "Save Changes"}
                fontSize={14}
                fontWeight="600"
                lineHeight={18}
                color={isFormEdited ? BLACK : DISABLED_TEXT}
            />
        );

        if (isValidatingForm) componentCenter = <ActivityIndicator size="small" color={BLACK} />;

        return (
            <ActionButton
                fullWidth
                componentCenter={componentCenter}
                onPress={this._processTransaction}
                disabled={
                    isLoadingCategories || showErrorModal || isValidatingForm || !isFormEdited
                }
                backgroundColor={isFormEdited ? YELLOW : LIGHTER_YELLOW}
            />
        );
    };

    _handleInitialBalanceAdded = (isSuccessful) => {
        if (isSuccessful) this.setState({ showInitialBalanceAddedPrompt: true });
        else
            this.setState({
                showErrorModal: true,
                errorMessage: "Cannot add your initial balance right now. Please try again later.",
            });
    };

    _getInitialNotes = () => this.props.route.params?.transactionData?.btsNotes ?? "";

    _onNumericalKeyboardRendered = ({
        nativeEvent: {
            layout: { height },
        },
    }) =>
        this.setState({
            numericalKeyboardHeight: height,
        });

    render() {
        const {
            amount,
            paymentMethod,
            showPaymentPicker,
            paymentMethodScrollPickerData,
            showErrorModal,
            errorMessage,
            showDatePicker,
            showAmountDateIndicator,
            showInitialBalanceAddedPrompt,
            showInitialBalanceSetupPrompt,
            isCashWalletTransaction,
            numericalKeyboardHeight,
            showNumPad,
            isValidatingForm,
        } = this.state;
        const amountMode = this._getAmountDisplayMode();
        const amountDateIndicatorTitle = this._getAmountDateIndicatorTitle();
        //for analytics logEvent
        const { route } = this.props;
        const editingMode = route.params?.editingMode ?? editingModeEnum.add;

        if (showNumPad)
            Animated.timing(this.numericalKeyboardAnimationValue, {
                toValue: -numericalKeyboardHeight,
                duration: 500,
                useNativeDriver: true,
            }).start();
        else
            Animated.timing(this.numericalKeyboardAnimationValue, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }).start();

        return (
            <React.Fragment>
                <KeyboardAvoidingView
                    style={styles.container}
                    behavior={Platform.OS === "ios" ? "padding" : null}
                >
                    <ScreenContainer
                        backgroundType="color"
                        backgroundColor={MEDIUM_GREY}
                        showOverlay={
                            showPaymentPicker ||
                            showDatePicker ||
                            showInitialBalanceSetupPrompt ||
                            showInitialBalanceAddedPrompt
                        }
                        analyticScreenName={
                            editingMode === editingModeEnum.add ? "Expenses_Add" : "Expenses_Edit"
                        }
                        showLoaderModal={isValidatingForm}
                    >
                        <React.Fragment>
                            <ScreenLayout
                                header={
                                    <HeaderLayout
                                        headerLeftElement={
                                            <HeaderBackButton
                                                onPress={this._onHeaderBackButtonPressed}
                                            />
                                        }
                                    />
                                }
                                scrollable
                                useSafeArea
                                neverForceInset={["bottom"]}
                            >
                                <React.Fragment>
                                    <View style={styles.contentContainer}>
                                        <AmountDisplay
                                            amountMode={amountMode}
                                            amount={amount ? parseInt(amount, 10) / 100 : 0}
                                            onAmountPressed={this._onAmountFieldPressed}
                                            showIndicator={showAmountDateIndicator}
                                            indicatorTitle={amountDateIndicatorTitle}
                                            onAmountDateIndicatorPressed={
                                                this._onAmountDateIndicatorPressed
                                            }
                                            disabled={!isCashWalletTransaction}
                                            disableDateIndicator={!isCashWalletTransaction}
                                        />
                                        <View style={styles.setCategoriesContainer}>
                                            {this._renderCategoriesButton()}
                                        </View>
                                        <NotesArea
                                            onSubmit={this._onAddNotes}
                                            onFocus={this._onNotesAreaFocused}
                                            initialText={this._getInitialNotes}
                                        />
                                        <View style={styles.listItem}>
                                            <ListItem
                                                disabled={!isCashWalletTransaction}
                                                leftComponent={
                                                    <Image
                                                        style={styles.listItemImage}
                                                        source={Assets.iconMenuWallet}
                                                    />
                                                }
                                                title="Payment"
                                                titleFontSize={12}
                                                onListItemPressed={this._onPaymentPickerPressed}
                                                rightComponent={
                                                    <View style={styles.listItemRightSection}>
                                                        <Typo
                                                            fontSize={12}
                                                            fontWeight="600"
                                                            textAlign="right"
                                                            lineHeight={16}
                                                            color={DARK_GREY}
                                                        >
                                                            <Text>
                                                                {
                                                                    selectedPaymentMethodMappings[
                                                                    paymentMethod
                                                                    ]
                                                                }
                                                            </Text>
                                                        </Typo>
                                                        <Image
                                                            style={[
                                                                styles.listItemImage,
                                                                styles.listItemImageRight,
                                                            ]}
                                                            source={Assets.icChevronDown24Black}
                                                        />
                                                    </View>
                                                }
                                            />
                                        </View>
                                    </View>
                                    {this._renderTransactionButton()}
                                </React.Fragment>
                            </ScreenLayout>
                            <Animated.View
                                style={[
                                    styles.numericalKeyboardAnimatedContainer,
                                    {
                                        bottom: numericalKeyboardHeight
                                            ? -numericalKeyboardHeight
                                            : -Dimensions.get("screen").height,
                                        transform: [
                                            {
                                                translateY: this.numericalKeyboardAnimationValue,
                                            },
                                        ],
                                    },
                                ]}
                            >
                                <View
                                    style={styles.numericalKeyboardContainer}
                                    onLayout={this._onNumericalKeyboardRendered}
                                >
                                    <NumericalKeyboard
                                        value={amount}
                                        onChangeText={this._onNumPadNumericKeyPressed}
                                        maxLength={8}
                                        onDone={this._onNumPadClosed}
                                    />
                                </View>
                            </Animated.View>
                        </React.Fragment>
                    </ScreenContainer>
                </KeyboardAvoidingView>
                <ScrollPicker
                    showPicker={showPaymentPicker}
                    items={paymentMethodScrollPickerData}
                    onDoneButtonPressed={this._onPaymentPickerDoneButtonPressed}
                    onCancelButtonPressed={this._onPaymentPickerDismissed}
                />
                <DatePicker
                    showDatePicker={showDatePicker}
                    onCancelButtonPressed={this._onDatePickerCancelButtonPressed}
                    onDoneButtonPressed={this._onDatePickerDoneButtonPressed}
                    dateRangeStartDate={getStartDate(this.state.validDateRangeData)}
                    dateRangeEndDate={getEndDate(this.state.validDateRangeData)}
                />
                <Popup
                    visible={showErrorModal}
                    title="Add Expense"
                    description={errorMessage}
                    onClose={this._onErrorMessageDismissed}
                />
            </React.Fragment>
        );
    }
}

const styles = StyleSheet.create({
    category: {
        borderColor: DARK_GREY,
        borderRadius: 18,
        borderStyle: "dashed",
        borderWidth: 1,
        height: 36,
        width: 36,
    },
    container: {
        flex: 1,
    },
    contentContainer: {
        alignItems: "flex-start",
        flex: 1,
        justifyContent: "flex-start",
    },
    listItem: {
        borderBottomColor: GREY,
        borderBottomWidth: 1,
        borderTopColor: GREY,
        borderTopWidth: 1,
        marginBottom: 24,
        width: "100%",
    },
    listItemImage: {
        height: 36,
        resizeMode: "contain",
        width: 36,
    },
    listItemImageRight: {
        marginLeft: 8,
    },
    listItemRightSection: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "flex-end",
    },
    numericalKeyboardAnimatedContainer: {
        backgroundColor: MEDIUM_GREY,
        position: "absolute",
        width: "100%",
        ...getShadow({
            color: BLACK,
            width: 0,
            height: 2,
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
        }),
    },
    numericalKeyboardContainer: {
        flex: 1,
    },
    setCategoriesContainer: {
        marginTop: 8,
    },
});
