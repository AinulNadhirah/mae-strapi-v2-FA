import { isEqual } from "lodash";
import PropTypes from "prop-types";
import React, { useState, useEffect, useRef } from "react";
import {
    View,
    StyleSheet,
    Keyboard,
    Platform,
    ScrollView,
    KeyboardAvoidingView,
} from "react-native";

import {
    AUTOBILLING_AUTODEBIT,
    AUTOBILLING_CONFIRMATION,
    AUTOBILLING_MERCHANT_SEARCH,
    AUTOBILLING_STACK,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import { ScrollPickerView } from "@components/Common";
import { Dropdown } from "@components/Common/DropDownButtonCenter";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Typography from "@components/Text";
import TextInput from "@components/TextInput";
import { hideToast, showErrorToast } from "@components/Toast";
import AccountList from "@components/Transfers/TransferConfirmationAccountList";

import { withModelContext } from "@context";

import { invokeL3, bankingGetDataMayaM2u, productList } from "@services";
import { RTPanalytics } from "@services/analytics/rtpAnalyticsSSL";

import { MEDIUM_GREY, YELLOW, DISABLED, DISABLED_TEXT, BLACK, DARK_GREY } from "@constants/colors";
import {
    CONTINUE,
    PAY_TO,
    SETUP_AUTOBILLING_VIA,
    FILL_IN_MERCHANT_DETAILS,
    PRODUCT_NAME,
    PAY_FROM,
    RECIPIENT_REFERENCE,
    REFERENCE_INFO,
    PLEASE_REMOVE_INVALID_RECIPIENT_REFERENCE,
    PLEASE_INPUT_VALID_RECIPIENT_REFERENCE,
    STEP1OF2,
    PLEASE_SELECT,
    DONE,
    CANCEL,
    COMMON_ERROR_MSG,
    PLEASE_SELECT_MERCHANT,
} from "@constants/strings";

import { referenceRegex } from "@utils/dataModel";
import { toTitleCase } from "@utils/dataModel/rtdHelper";

function usePrevious(value) {
    const ref = useRef();
    useEffect(() => {
        ref.current = value;
    }, [value]);
    return ref.current;
}
function MerchantDetails({ navigation, route, updateModel, getModel }) {
    const [errorMessage, setErrorMessage] = useState("");
    const [productListing, setProductListing] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedProductIndex, setSelectedProductIndex] = useState(0);
    const [productView, setProductView] = useState(false);
    const [selectedMerchant, setSelectedMerchant] = useState("");
    const [showLocalError, setShowLocalError] = useState(false);
    const [showLocalErrorMessage, setShowLocalErrorMessage] = useState("");
    const [referenceText, setReferenceText] = useState("");
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [accounts, setAccounts] = useState([]);
    const [primaryAccount, setPrimaryAccount] = useState("");

    const preMerchantData = usePrevious(route.params?.merchant);
    const preIsEdit = usePrevious(route.params?.isEdit);
    const preIsRequestAgain = usePrevious(route.params?.isRequestAgain);

    useEffect(() => {
        RTPanalytics.screenLoadABMerchant();
        requestL3Permission();
        if (accounts?.length === 0) {
            getAllAccounts();
        }
        if (route.params?.merchant) {
            updateMerchant();
        }
        if (route.params?.isEdit) {
            updateFields();
        }
        if (route.params?.isRequestAgain) {
            updateRequestAgainFields();
        }
    }, [accounts?.length]);

    useEffect(() => {
        if (!isEqual(preMerchantData, route.params?.merchant)) {
            updateMerchant();
        }
        if (!preIsEdit && route.params?.isEdit) {
            updateFields();
        }
        if (!preIsRequestAgain && route.params?.isRequestAgain) {
            updateRequestAgainFields();
        }
    }, [route.params?.merchant, route.params?.isEdit, route.params?.isRequestAgai]);

    function updateFields() {
        const { transferParams } = route.params || {};
        setSelectedMerchant(transferParams?.selectedMerchant);
        setSelectedProductIndex(transferParams?.productId);
        setReferenceText(transferParams?.reference);
        setSelectedProduct(transferParams?.productInf);
        setSelectedAccount(transferParams?.selectedAccount);
    }

    function updateRequestAgainFields() {
        const { transferParams } = route.params || {};
        setSelectedMerchant({
            merchantId: transferParams?.merchantId,
            merchantName: transferParams?.merchantName,
            merchantStatus: "Active",
        });
        setSelectedProductIndex(transferParams?.productName ? transferParams?.productId : null);
        setReferenceText(transferParams?.ref1);
        setSelectedProduct(
            transferParams?.productName
                ? {
                      merchantId: transferParams?.merchantId,
                      merchantName: transferParams?.merchantName,
                      merchantStatus: "Active",
                      productId: transferParams?.productId,
                      productName: transferParams?.productName,
                      productStatus: "Active",
                  }
                : null
        );
        setSelectedAccount(transferParams?.selectedAccount);

        if (!transferParams?.productName) {
            getAllProducts(transferParams?.merchantId);
        }
    }

    function updateMerchant() {
        setSelectedMerchant(route.params?.merchant);
        getAllProducts(route.params?.merchant?.merchantId);
    }

    /***
     * getAllAccounts
     * get the user accounts and filter from and To accounts
     * if from account not there set primary account as from account
     */
    async function getAllAccounts() {
        try {
            showLoader(true);
            const path = "/summary?type=A";
            //get the user accounts
            const response = await bankingGetDataMayaM2u(path, false);
            if (response?.data?.code === 0) {
                const { accountListings } = response?.data?.result || {};

                if (accountListings?.length > 0) {
                    const listData = accountListings;
                    const listWithPrimaryAcc = accountListings.filter((acc) => {
                        return acc?.primary;
                    });
                    const primaryAccount = route.params?.isRequestAgain
                        ? route.params?.transferParams?.debtorAccountNumber
                        : route.params?.transferParams?.selectedAccount?.number ??
                          listWithPrimaryAcc?.[0]?.number;

                    setPrimaryAccount(primaryAccount);
                    setSelectFromAccount(listData);
                }
            }
        } catch (error) {
            // error when retrieving the data
            showLoader(false);
        }
    }

    async function requestL3Permission() {
        try {
            const response = await invokeL3(false);
            if (response && response.status === 200) return response;
            return null;
        } catch (error) {
            return null;
        }
    }

    /***
     * OnSubmit
     */
    function OnSubmit() {
        const transferParams = {
            ...route.params?.transferParams,
            merchantId: selectedMerchant?.merchantId,
            productId: selectedProductIndex,
            reference: referenceText,
            productInfo: selectedProduct,
            selectedMerchant,
            selectedAccount,
        };
        const validate = referenceRegex(referenceText);
        if (!validate || (referenceText && referenceText.indexOf("@") !== -1)) {
            setShowLocalErrorMessage(
                referenceText?.length && !validate
                    ? PLEASE_REMOVE_INVALID_RECIPIENT_REFERENCE
                    : PLEASE_INPUT_VALID_RECIPIENT_REFERENCE
            );
            setShowLocalError(true);
            return;
        } else {
            setShowLocalErrorMessage("");
            setShowLocalError(false);
        }
        navigation.navigate(AUTOBILLING_STACK, {
            screen: route.params?.isEdit ? AUTOBILLING_CONFIRMATION : AUTOBILLING_AUTODEBIT,
            params: {
                ...route.params,
                transferParams,
            },
        });
    }

    /***
     * getAllProducts
     * Get products list
     */
    async function getAllProducts(merchantId) {
        try {
            const productsContext = getModel("rpp")?.productsContext;
            //if products not in context initiate api call
            if (
                productsContext?.apiCalled === false ||
                merchantId !== productsContext?.list[0]?.merchantId
            ) {
                const res = await productList({
                    merchantId,
                });
                const products =
                    res?.data?.result?.data?.merchants?.map((el) => {
                        return {
                            ...el,
                            name: el.productName,
                            value: el.productId,
                            merchantId: el.merchantId,
                        };
                    }) ?? [];
                updateModel({
                    rpp: {
                        productsContext: {
                            list: products,
                            apiCalled: true,
                        },
                    },
                });
                updateProducts(products);
            } else {
                updateProducts(productsContext?.list);
            }
        } catch (ex) {
            showErrorToast({
                message: ex?.message ?? COMMON_ERROR_MSG,
            });
        }
    }

    function updateProducts(products) {
        if (products?.length === 1) {
            setSelectedProductIndex(products[0].value);
            setSelectedProduct(products[0]);
            setProductListing(products);
        } else {
            setProductListing(products);
            if (!route.params?.isEdit) {
                setSelectedProductIndex(null);
                setSelectedProduct(null);
            }
        }
    }
    /***
     * _onProductRightButtonPress
     * On Product pop up select done click event
     */
    function onProductRightButtonPress(val, index) {
        setProductView(false);
        setSelectedProductIndex(val.value);
        setSelectedProduct(val);
    }

    /***
     * _onProductRightLeftButtonPress
     * On Product pop up cancel click event close the pop up
     */
    function onProductRightLeftButtonPress() {
        setProductView(false);
    }

    /***
     * _onProductClick
     * On Product dropdown click event open the pop up
     */
    function onProductClick() {
        Keyboard.dismiss();

        if (selectedMerchant) {
            setProductView(true);
        } else {
            setErrorMessage(PLEASE_SELECT_MERCHANT);
        }
    }

    /***
     * _onMerchantDropdownPress
     * On Merchant dropdown click event open the pop up
     */
    function onMerchantDropdownPress() {
        RTPanalytics.screenLoadABSearch();
        navigation.navigate(AUTOBILLING_STACK, {
            screen: AUTOBILLING_MERCHANT_SEARCH,
            params: {},
        });
    }

    /***
     * _onBackPress
     * On Screen Back press handle
     */
    function onBackPress() {
        hideToast();
        navigation.goBack();
    }

    /**
     *_onTextChange
     * On Reference Text change update state
     */
    function onTextChange(text) {
        setReferenceText(text);
    }

    /**
     *_onTextDone
     * On Reference Text on click handle next event
     */
    function onTextDone() {
        Keyboard.dismiss();
    }

    /***
     * _setSelectFromAccount
     * set selected Acccount either from account or primary account
     */
    function setSelectFromAccount(newAccountList) {
        const targetSelectedAccounts = [];
        const fromAccountTempSelected = primaryAccount;
        const tempArray = newAccountList.slice();

        //Compare from Account with account number and marked as selected
        const nonSelectedAccounts = tempArray.filter(
            (accountItem, index) =>
                fromAccountTempSelected?.substring(0, 12) !== accountItem?.number?.substring(0, 12)
        );

        const accountsArray = tempArray.map((accountItem, index) => {
            return {
                ...accountItem,
                selectionIndex: index,
                isSelected:
                    fromAccountTempSelected?.substring(0, 12) ===
                    accountItem?.number?.substring(0, 12),
                selected:
                    fromAccountTempSelected?.substring(0, 12) ===
                    accountItem?.number?.substring(0, 12),
                description: accountItem?.number,
                type:
                    fromAccountTempSelected?.substring(0, 12) ===
                        accountItem?.number?.substring(0, 12) && accountItem?.type,
            };
        });

        const selectedAccount = accountsArray.filter((selectedAcc) => {
            return selectedAcc.isSelected === true;
        });

        if (selectedAccount?.length === 1) targetSelectedAccounts.push(selectedAccount[0]);

        const selectedAccountObj = !targetSelectedAccounts?.length
            ? nonSelectedAccounts[0]
            : selectedAccount[0];

        //if no account match set first account as selected Account
        if (nonSelectedAccounts?.length >= 1 && !targetSelectedAccounts?.length) {
            selectedAccountObj.selected = true;
            nonSelectedAccounts[0] = selectedAccountObj;
        }
        //push non selected list to display account list
        targetSelectedAccounts.push(...nonSelectedAccounts);

        if (targetSelectedAccounts?.length < 1) {
            targetSelectedAccounts.push(...newAccountList);
        }

        //Update this transfer params and selected Accounts to state
        setAccounts(targetSelectedAccounts);
        setSelectedAccount(selectedAccountObj);

        showLoader(false);
    }

    function showLoader(visible) {
        updateModel({
            ui: {
                showLoader: visible,
            },
        });
    }

    /***
     * _onAccountListClick
     * Change Selected Account Click listener
     */
    function onAccountListClick(item) {
        const itemType =
            item.type === "C" || item.type === "J" || item.type === "R" ? "card" : "account";
        const selectedAcc = item;
        if (!(parseFloat(item.acctBalance) <= 0.0 && itemType === "account")) {
            const tempArray = accounts;
            for (let i = 0; i < tempArray?.length; i++) {
                if (tempArray[i].number === item.number) {
                    tempArray[i].selected = true;
                } else {
                    tempArray[i].selected = false;
                }
                tempArray[i].isSelected = tempArray[i].selected;
            }
            setAccounts(tempArray);
            setSelectedAccount(selectedAcc);
        }
    }

    const isSubmitDisble =
        !selectedMerchant?.merchantName ||
        !selectedProduct?.productName ||
        !referenceText ||
        referenceText?.length < 3;
    const disableForEditAndAgain = route.params?.isRequestAgain || route.params?.isEdit;
    const enableProduct =
        route.params?.isRequestAgain &&
        !route.params?.transferParams?.productName &&
        productListing?.length > 1;

    return (
        <ScreenContainer
            backgroundType="color"
            showErrorModal={false}
            showLoaderModal={false}
            errorMessage={errorMessage}
            showOverlay={false}
            backgroundColor={MEDIUM_GREY}
        >
            <ScreenLayout
                header={
                    <HeaderLayout
                        headerCenterElement={
                            <Typography
                                fontSize={16}
                                fontWeight="600"
                                lineHeight={19}
                                text={STEP1OF2}
                                color={DARK_GREY}
                            />
                        }
                        headerLeftElement={<HeaderBackButton onPress={onBackPress} />}
                    />
                }
                useSafeArea
                paddingHorizontal={0}
                paddingBottom={0}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : ""}
                    style={styles.KeyboardAvoidingViewStyle}
                    keyboardVerticalOffset={150}
                    enabled
                >
                    <ScrollView style={styles.scrollView}>
                        <View style={styles.container}>
                            <View style={styles.containerInner}>
                                <View style={styles.block}>
                                    <View>
                                        <Typography
                                            fontSize={13}
                                            fontWeight="normal"
                                            fontStyle="normal"
                                            lineHeight={25}
                                            color={BLACK}
                                            textAlign="left"
                                            text={SETUP_AUTOBILLING_VIA}
                                        />
                                        <Typography
                                            fontSize={14}
                                            fontWeight="bold"
                                            fontStyle="normal"
                                            lineHeight={19}
                                            color={BLACK}
                                            textAlign="left"
                                            text={FILL_IN_MERCHANT_DETAILS}
                                        />
                                    </View>
                                    <View style={styles.descriptionContainerAmount}>
                                        <Typography
                                            fontSize={14}
                                            fontWeight="normal"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={19}
                                            color={BLACK}
                                            textAlign="left"
                                            text={PAY_TO}
                                        />
                                    </View>

                                    <View style={styles.mt10}>
                                        <Dropdown
                                            title={
                                                selectedMerchant?.merchantName
                                                    ? toTitleCase(selectedMerchant?.merchantName)
                                                    : PLEASE_SELECT
                                            }
                                            align="left"
                                            borderWidth={0.5}
                                            testID="txtSELECT_RL"
                                            accessibilityLabel="txtSELECT_RZ"
                                            onPress={onMerchantDropdownPress}
                                            disable={disableForEditAndAgain}
                                            hideCaret={disableForEditAndAgain}
                                        />
                                    </View>
                                    <View style={styles.descriptionContainerAmount}>
                                        <Typography
                                            fontSize={14}
                                            fontWeight="normal"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={19}
                                            color={BLACK}
                                            textAlign="left"
                                            text={PRODUCT_NAME}
                                        />
                                    </View>
                                    <View style={styles.contoryContainer}>
                                        <Dropdown
                                            title={
                                                selectedProduct?.productName
                                                    ? selectedProduct?.productName
                                                    : PLEASE_SELECT
                                            }
                                            disable={
                                                !enableProduct &&
                                                (productListing?.length === 1 ||
                                                    disableForEditAndAgain)
                                            }
                                            hideCaret={
                                                !enableProduct &&
                                                (productListing?.length === 1 ||
                                                    disableForEditAndAgain)
                                            }
                                            align="left"
                                            iconType={1}
                                            textLeft
                                            testID="txtSELECT_RL"
                                            accessibilityLabel="txtSELECT_RZ"
                                            borderWidth={0.5}
                                            onPress={onProductClick}
                                        />
                                    </View>
                                    <View style={styles.descriptionContainerAmount}>
                                        <Typography
                                            fontSize={14}
                                            fontWeight="normal"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={19}
                                            color={BLACK}
                                            textAlign="left"
                                            text={RECIPIENT_REFERENCE}
                                        />
                                    </View>

                                    <View style={styles.amountViewTransfer}>
                                        <TextInput
                                            maxLength={20}
                                            accessibilityLabel="inputReference"
                                            isValidate={showLocalError}
                                            errorMessage={showLocalErrorMessage}
                                            onSubmitEditing={onTextDone}
                                            value={referenceText}
                                            onChangeText={onTextChange}
                                            clearButtonMode="while-editing"
                                            returnKeyType="done"
                                            editable
                                            placeholder="e.g. INV23232323"
                                        />
                                        <Typography
                                            fontSize={11}
                                            fontWeight="normal"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={19}
                                            color={DARK_GREY}
                                            textAlign="left"
                                            text={REFERENCE_INFO}
                                        />
                                    </View>
                                </View>
                            </View>
                        </View>
                        {route.params?.isEdit ? null : (
                            <View style={styles.accList}>
                                <AccountList
                                    title={PAY_FROM}
                                    data={accounts}
                                    onPress={onAccountListClick}
                                    extraData={{}}
                                    paddingLeft={24}
                                />
                            </View>
                        )}
                    </ScrollView>
                </KeyboardAvoidingView>

                <FixedActionContainer>
                    <ActionButton
                        disabled={isSubmitDisble}
                        fullWidth
                        borderRadius={25}
                        onPress={OnSubmit}
                        backgroundColor={isSubmitDisble ? DISABLED : YELLOW}
                        componentCenter={
                            <Typography
                                color={isSubmitDisble ? DISABLED_TEXT : BLACK}
                                text={CONTINUE}
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={18}
                            />
                        }
                    />
                </FixedActionContainer>
            </ScreenLayout>

            <ScrollPickerView
                showMenu={productView}
                list={productListing}
                selectedIndex={selectedProductIndex}
                onRightButtonPress={onProductRightButtonPress}
                onLeftButtonPress={onProductRightLeftButtonPress}
                rightButtonText={DONE}
                leftButtonText={CANCEL}
            />
        </ScreenContainer>
    );
}

MerchantDetails.propTypes = {
    navigation: PropTypes.object,
    updateModel: PropTypes.func,
    route: PropTypes.object,
    getModel: PropTypes.func,
};

const styles = StyleSheet.create({
    KeyboardAvoidingViewStyle: {
        flex: 1,
        flexDirection: "column",
        width: "100%",
    },
    accList: { marginTop: 20, paddingLeft: 10 },
    block: { flexDirection: "column" },
    container: { flex: 1, paddingBottom: 5, paddingHorizontal: 36, width: "100%" },
    containerInner: { flex: 1, width: "100%" },
    contoryContainer: {
        alignSelf: "flex-start",
        marginTop: 10,
        paddingBottom: 5,
        width: "100%",
    },
    descriptionContainerAmount: {
        marginTop: 30,
    },
    mt10: {
        marginTop: 10,
    },
    scrollView: {
        flex: 1,
    },
});

export default withModelContext(MerchantDetails);
