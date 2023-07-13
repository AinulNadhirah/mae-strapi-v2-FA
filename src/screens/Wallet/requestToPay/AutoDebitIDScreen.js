import { isEmpty } from "lodash";
import PropTypes from "prop-types";
import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Image,
    StyleSheet,
    Keyboard,
    TouchableOpacity,
    Platform,
    ScrollView,
    KeyboardAvoidingView,
} from "react-native";

import {
    RTP_AUTODEBIT_CONFIRMATION_SCREEN,
    RTP_AUTODEBIT_DECOUPLE_SCREEN,
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
import { showErrorToast, hideToast } from "@components/Toast";

import { withModelContext } from "@context";

import {
    duitnowStatusInquiry,
    loadCountries,
    getBanksListApi,
    invokeL3,
    productList,
    fundTransferInquiryApi,
    bankingGetDataMayaM2u,
} from "@services";
import { RTPanalytics } from "@services/analytics/rtpAnalyticsSSL";

import {
    MEDIUM_GREY,
    YELLOW,
    DISABLED,
    DISABLED_TEXT,
    BLACK,
    DARK_GREY,
    PINKISH_GREY,
} from "@constants/colors";
import {
    duitNowPasspostCodeSubUrl,
    getAllAccountSubUrl,
    mapProxy,
    proxyList as proxyListing,
} from "@constants/data/DuitNowRPP";
import {
    FUND_TRANSFER_TYPE_INTERBANK,
    FUND_TRANSFER_TYPE_MAYBANK,
    MBB_BANK_CODE,
} from "@constants/fundConstants";
import {
    AMOUNT_ERROR_RTP,
    ENTER_AMOUNT,
    REQUEST_TO_PAY,
    DUITNOW_ID_INQUIRY_FAILED,
    MOBNUM_LBL,
    NRIC_NUMBER,
    ENTER_NRIC_NUMBER,
    ENTER_PASSPORT_NUMBER,
    CONTINUE,
    THIRD_PARTY_TRANSFER,
    INSTANT_TRANSFER,
    RTP_AUTODEBIT,
    REQUEST_VIA,
    PRODUCT_NAME,
    FILL_REQUESTED,
    PAY_TO,
    RECIPIENT_REFERENCE,
    CDD_ACCOUNT_NUMBER,
    COUNTRY_LBL,
    PASSPORTID_LBL2,
    PLEASE_REMOVE_INVALID_RECIPIENT_REFERENCE,
    PLEASE_INPUT_VALID_RECIPIENT_REFERENCE,
    AUTODEBIT_ACCOUNT_NUMBER_INVALID,
    PLEASE_SELECT,
    REQUEST_COULD_NOT_BE_PROCESSED,
    INVALID_TRANSFER_DETAILS,
    WE_FACING_SOME_ISSUE,
    DUINTNOW_IMAGE,
    DONE,
    CANCEL,
} from "@constants/strings";

import { referenceRegex } from "@utils/dataModel";
import { checkFormatNumber } from "@utils/dataModel/rtdHelper";
import {
    formatICNumber,
    formatMobileNumbersNew,
    getFormatedAccountNumber,
    openNativeContactPicker,
} from "@utils/dataModel/utility";

import images from "@assets";

function usePrevious(value) {
    const ref = useRef();
    useEffect(() => {
        ref.current = value;
    }, [value]);
    return ref.current;
}
function AutoDebitIDScreen({ navigation, route, getModel, updateModel }) {
    const [state, setState] = useState({
        idValue: "",
        error: false,
        errorMessage: "",
        proxyTypeDropView: false,
        selectedCountry: null,
        countryView: false,
        selectedIDTypeIndex: 0,
        transferParams: {},
        showLoaderModal: false,
        countryList: [],
        //Dropdown Selection options
        proxyList: proxyListing,
        idLabel: PASSPORTID_LBL2,
        idPlaceHolder: ENTER_PASSPORT_NUMBER,
        selectedBank: null,
        mbbBanksList: [],
        bankView: false,
        selectedProxy: null,
        productList: [],
        selectedProduct: null,
        selectedProductIndex: 0,
        productView: false,
        referenceText: "",
        accountNumberText: "",
        accountNumber: "",
        accountNumberLength: 20,
        accountNumberCorrectLength: 12,
        accountListings: [],
    });

    const preIsEdit = usePrevious(route.params?.isEdit);
    const preIsRequestAgain = usePrevious(route.params?.isRequestAgain);

    useEffect(() => {
        RTPanalytics.screenLoadADReq();
        requestL3Permission();
        loadAllCountries();
        getBanksListsApi();
        getAllAccounts();
        if (route.params?.merchantId) {
            getAllProducts(route.params?.merchantId);
        }
        if (route.params?.isEdit) {
            updateFields();
        }
    }, [route.params?.merchantId]);

    useEffect(() => {
        if (!preIsEdit && route.params?.isEdit) {
            updateFields();
        }
        if (!preIsRequestAgain && route.params?.isRequestAgain) {
            getAllProducts(route.params?.merchantId);
        }
    }, [route.params?.isEdit, route.params?.isRequestAgain]);

    function updateFields() {
        const transferParams = route?.params?.transferParams;

        updateState({
            selectedProductIndex: transferParams?.productId,
            referenceText: transferParams?.reference,
            selectedProduct: transferParams?.productInfo,
            selectedBank: transferParams?.selectedBank,
            primaryAccount: transferParams?.primaryAccount,
            accountNumberText:
                transferParams?.idType === "ACCT" ? transferParams?.idValueFormatted : "",

            accountNumber:
                transferParams?.idType === "ACCT" ? transferParams?.idValueFormatted : "",
            idValue: transferParams?.idValue,
            selectedProxy: transferParams?.selectedProxy,
        });
    }

    function updateFieldsForRequestAgain() {
        const transferParams = route?.params?.transferParams;
        showLoader(true);
        const foundedProxy = proxyList.find(
            (el) => el.code === mapProxy[transferParams?.receiverProxyType]
        );
        updateState({
            idValue: foundedProxy?.code,
            referenceText: transferParams?.reference,
            selectedBank: transferParams?.selectedBank ?? state.mbbBanksList?.[0],
            primaryAccount: transferParams?.primaryAccount,
        });
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
            showErrorToast({ message: WE_FACING_SOME_ISSUE });
        }
    }

    function updateProducts(products) {
        const found = products?.find(
            (el) =>
                el.productId === route.params?.transferParams?.productInfo?.productId ||
                route.params?.productId
        );
        if (products?.length === 1) {
            updateState({
                selectedProductIndex: products?.[0]?.value,
                selectedProduct: products?.[0],
                productList: products,
            });
        } else if (found?.value) {
            updateState({
                selectedProductIndex: found?.value,
                selectedProduct: found,
                productList: products,
            });
        } else {
            updateState({ productList: products });
        }

        if (route.params?.from === "renewRequest") {
            updateState({
                referenceText: route.params?.ref1,
            });
        }

        if (route.params?.isRequestAgain) {
            updateFieldsForRequestAgain();
        }
    }
    /***
     * getAllAccounts
     * get the user accounts and filter from and To accounts
     * if from account not there set primary account as from account
     */
    async function getAllAccounts() {
        const userAccountsContext = getModel("userAccounts");
        const { merchantInquiry } = getModel("rpp");

        if (userAccountsContext?.apiCalled) {
            //if userAccountsContext in context initiate api call
            const primaryAcct = userAccountsContext?.accountListings.find(
                (acc) => acc?.number.substring(0, 12) === merchantInquiry?.accNo
            );
            updateState({ primaryAccount: primaryAcct });
        } else {
            const response = await bankingGetDataMayaM2u(getAllAccountSubUrl, false);
            const { accountListings } = response?.data?.result || {};

            if (accountListings?.length > 0) {
                const primaryAcct = accountListings.find(
                    (acc) => acc?.number.substring(0, 12) === merchantInquiry?.accNo
                );
                updateState({ primaryAccount: primaryAcct });
                updateModel({
                    userAccounts: {
                        accountListings,
                        apiCalled: true,
                    },
                });
            }
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
     * unselect all proxy
     */
    function unselectAllProxy() {
        const proxyList = state.proxyList;
        for (const item in proxyList) {
            proxyList[item].selected = false;
        }
        return proxyList;
    }

    function _selectDefaultBank() {
        const { transferParams } = route.params;
        if (!transferParams?.senderProxyType && transferParams?.senderProxyValue) {
            // loop and check swiftCode
            const bankIndex = state.mbbBanksList.findIndex(
                (item) => transferParams?.swiftCode === item.swiftCode
            );

            if (bankIndex >= 0) {
                onBankRightButtonPress({}, bankIndex);
            }
        }
    }
    function updateState(stateData) {
        setState((prevState) => {
            return { ...prevState, ...stateData };
        });
    }
    function selectDefaultCountry() {
        const { transferParams } = route.params;
        if (transferParams?.senderProxyType === "PSPT") {
            // loop and check country code
            const countryIndex = state.countryList.findIndex(
                (item) => transferParams?.swiftCode === item.desc
            );

            if (state.countryList >= 0) {
                onCountryRightButtonPress({}, countryIndex);
            }
        }
    }

    function onProxySelectionChange(index, defaultValue = "") {
        const proxyList = unselectAllProxy();
        const selectedProxy = proxyList[index];
        selectedProxy.selected = true;
        updateState({
            proxyTypeDropView: false,
            idLabel: selectedProxy?.idLabel,
            idValue: "",
            selectedIDTypeIndex: index,
            proxyList,
            idPlaceHolder: selectedProxy?.idPlaceHolder,
            selectedProxy,
        });

        onIdTextChange(defaultValue);
    }

    /***
     * _onIdTextChange
     * on Text Change formate state
     */
    function onIdTextChange(text) {
        if (state.selectedProxy?.code === "MBNO") {
            const mobileNumber = formatMobileNumbersNew(text);
            updateState({
                idValue: mobileNumber,
            });
        } else if (state.selectedProxy?.code === "NRIC") {
            const ic = formatICNumber(text);
            updateState({
                idValue: ic,
                idValueFormatted: ic,
            });
        } else {
            updateState({ idValue: text });
        }
    }

    function handleProxy(proxyType) {
        // check selected country
        if (!state.selectedCountry && proxyType === "PSPT") {
            updateState({
                error: true,
                errorMessage: "Please select an Issuing Country.",
            });
            return;
        }
        duitnowIdInquiry();
    }

    function handleCasa() {
        const user = getModel("user");
        const tParams = state.transferParams;

        const text = state.accountNumber.replace(/ /g, "").replace(/ /g, "");

        const formattedToAccount = text
            .substring(0, state.accountNumberLength - 2)
            .replace(/[^\dA-Z]/g, "")
            .replace(/(.{4})/g, "$1 ")
            .trim();
        tParams.userName = user?.cus_name;
        tParams.toAccount = text;
        tParams.accounts = text;
        tParams.addingFavouriteFlow = false;
        tParams.formattedToAccount = formattedToAccount
            .substring(0, state.accountNumberLength - 2)
            .replace(/[^\dA-Z]/g, "")
            .replace(/(.{4})/g, "$1 ")
            .trim();
        if (text.length > 3) {
            if (tParams.isMaybankTransfer) {
                fundTransferInquiry(tParams);
            } else {
                fundTransferInquiryApiOthers(tParams);
            }
        } else {
            updateState({
                showLocalErrorMessage: INVALID_TRANSFER_DETAILS,
                showLocalError: true,
            });
        }
    }

    /***
     * _OnSubmit
     */
    function OnSubmit() {
        const { selectedProxy, idValue, referenceText } = state || {};
        const mobNum = selectedProxy?.code === "MBNO" ? idValue.replace(/\s/g, "") : null;
        const val =
            selectedProxy?.code === "MBNO" && mobNum.indexOf(0) !== 0
                ? mobNum.replace(/^1/g, "01")
                : idValue.replace(/\s/g, "");
        RTPanalytics.formProceedADReq(selectedProxy?.name);
        const valueLength = selectedProxy?.minLength + idValue?.split(" ").length - 1 ?? 0;
        const validate = referenceRegex(referenceText);

        //check validate here

        if (!validate || (referenceText && referenceText.indexOf("@") !== -1)) {
            updateState({
                showReferenceErrorMsg:
                    state.referenceText?.length && !validate
                        ? PLEASE_REMOVE_INVALID_RECIPIENT_REFERENCE
                        : PLEASE_INPUT_VALID_RECIPIENT_REFERENCE,
                showReferenceError: true,
            });
            return;
        } else {
            updateState({
                showReferenceErrorMsg: "",
                showReferenceError: false,
            });
        }
        // empty or min or max length
        if (val.length < valueLength || val.length > selectedProxy?.maxLength) {
            updateState({
                error: true,
                errorMessage:
                    val.length < valueLength
                        ? selectedProxy?.minErrorMessage
                        : selectedProxy?.maxErrorMessage,
            });
            return;
        } else {
            updateState({
                error: false,
                errorMessage: "",
            });
        }

        switch (selectedProxy?.code) {
            case "CASA":
                handleCasa();
                break;
            case "PSPT":
            case "MBNO":
            case "NRIC":
            case "ARMN":
            case "BREG":
                handleProxy(selectedProxy?.code);

                break;
            default:
                break;
        }
    }

    /***
     * duitnowIdInquiry
     * duitnow Id Inquiry Api call
     */
    async function duitnowIdInquiry() {
        const {
            idValue,
            idValueFormatted,
            selectedProxy,
            selectedCountry,
            primaryAccount,
            referenceText,
            selectedProduct,
            accountListings,
        } = state || {};
        const idValueInTextView =
            selectedProxy?.code === "MBNO" ? idValue.replace(/^1/g, "01") : idValueFormatted;
        const idValueClean =
            selectedProxy?.code === "MBNO"
                ? idValue.toString().replace(/\s/g, "").replace(/^1/g, "01")
                : idValue.toString().replace(/\s/g, "");
        const idCode = selectedProxy?.code.toString().replace(/\s/g, "");
        const countryCode = selectedProxy?.code === "PSPT" ? selectedCountry?.desc ?? "" : "";
        const subUrl =
            "/duitnow/status/inquiry?proxyId=" +
            idValueClean +
            countryCode +
            "&proxyIdType=" +
            idCode +
            "&requestType=RTP";

        const response = await duitnowStatusInquiry(subUrl);
        const result = response?.data;
        if (result !== null) {
            const resultData = result.result;
            if (result.code === 200) {
                const user = getModel("user");
                const transferParams = {
                    userName: user?.cus_name,
                    reference: referenceText,
                    rtpType: route.params?.rtpType ?? "",
                    isMaybankTransfer: false,
                    transferRetrievalRefNo: resultData.retrievalRefNo,
                    transferProxyRefNo: resultData.proxyRefNo,
                    transferRegRefNo: resultData.regRefNo,
                    transferAccType: resultData.accType,
                    transferBankCode: resultData.bankCode,
                    toAccountCode: resultData.bankCode,
                    nameMasked: resultData.nameMasked,
                    recipientNameMaskedMessage: resultData.recipientNameMaskedMessage,
                    recipientNameMasked: resultData.recipientNameMasked,
                    actualAccHolderName: resultData.actualAccHolderName,
                    accHolderName: resultData.accHolderName,
                    accountName: resultData.accHolderName,
                    transferBankName: resultData.bankName,
                    transferAccHolderName: resultData.accHolderName,
                    transferLimitInd: resultData.limitInd,
                    transferMaybank: resultData.maybank,
                    transferOtherBank: !resultData.maybank,
                    transferAccNumber: resultData.accNo,
                    formattedToAccount: resultData.accNo,
                    idValueFormatted: idValueInTextView,
                    idValue: idValueClean,
                    idType: idCode,
                    idCode,
                    idTypeText: selectedProxy?.name,
                    image: {
                        image: DUINTNOW_IMAGE,
                        imageName: DUINTNOW_IMAGE,
                        imageUrl: DUINTNOW_IMAGE,
                        shortName: resultData.accHolderName,
                        type: true,
                    },
                    bankName: resultData.maybank ? "Maybank" : "",
                    imageBase64: true,
                    minAmount: 0.0,
                    maxAmount: 50000.0,
                    amountError: AMOUNT_ERROR_RTP,
                    screenLabel: ENTER_AMOUNT,
                    screenTitle: REQUEST_TO_PAY,
                    toAccount: resultData.accNo,
                    receiptTitle: REQUEST_TO_PAY,
                    transactionDate: "",
                    isFutureTransfer: false,
                    toAccountBank: resultData.maybank ? "Maybank" : "",
                    transferType: null,
                    transferSubType: null,
                    twoFAType: null,
                    mbbbankCode: resultData.bankCode,
                    bankCode: resultData.bankCode,
                    swiftCode: resultData.bankCode,
                    transferFlow: 27,
                    functionsCode: resultData.maybank ? 12 : 27,
                    countryCode: selectedCountry?.desc ?? "",
                    productInfo: selectedProduct,
                    primaryAccount,
                    selectedProxy,
                    accountListings,
                };

                hideToast();
                const modParams = route.params?.isEdit
                    ? {
                          ...route.params?.transferParams,
                          reference: referenceText,
                      }
                    : transferParams;

                navigation.navigate(
                    route.params?.isEdit
                        ? RTP_AUTODEBIT_CONFIRMATION_SCREEN
                        : RTP_AUTODEBIT_DECOUPLE_SCREEN,
                    {
                        ...route.params,
                        transferParams: modParams,
                        screenDate: route.params?.screenDate,
                    }
                );
            } else {
                showErrorToast({
                    message: resultData.statusDesc,
                });
            }
        } else {
            showErrorToast({
                message: DUITNOW_ID_INQUIRY_FAILED,
            });
        }
    }

    /***
     * selectContact
     */
    function selectContact(itemIndex) {
        openNativeContactPicker()
            .then((result) => {
                if (result.phoneNumber !== null) {
                    const idValueFormatted = checkFormatNumber(result.phoneNumber);
                    updateState({
                        idValue: idValueFormatted,
                    });
                } else {
                    showErrorToast({
                        message: "Invalid contact selected",
                    });
                }
            })
            .catch((error) => {
                updateState({
                    error: true,
                    errorMessage: error.message,
                });
            });
    }

    /***
     * getBanksListsApi
     * get Banks Lists Api call
     */
    async function getBanksListsApi() {
        try {
            const banksContext = getModel("rpp")?.banksContext;
            //if banks not in context initiate api call
            if (banksContext?.apiCalled === false) {
                const response = await getBanksListApi();
                if (response?.data?.resultList) {
                    const resultList = response?.data?.resultList.map((o, i) => {
                        return {
                            ...o,
                            name: o?.bankName,
                            shortName: o?.bankName,
                            image: o?.imageName,
                            const: o?.desc,
                            isSelected: o?.selected,
                            type: true,
                            index: i,
                        };
                    });
                    updateModel({
                        rpp: {
                            banksContext: {
                                list: resultList,
                                apiCalled: true,
                            },
                        },
                    });
                    updateState({
                        mbbBanksList: resultList,
                    });
                    _selectDefaultBank();
                }
            } else {
                updateState({
                    mbbBanksList: banksContext?.list,
                });
                _selectDefaultBank();
            }
        } catch (ex) {
            showErrorToast({ message: WE_FACING_SOME_ISSUE });
        }
    }

    /***
     * loadAllCountries
     * Get countries list for password proxy type
     */
    async function loadAllCountries() {
        try {
            const countriesContext = getModel("rpp")?.countriesContext;

            //if banks not in context initiate api call
            if (countriesContext?.apiCalled === false) {
                const response = await loadCountries(duitNowPasspostCodeSubUrl);
                if (response?.data?.resultList) {
                    const result = response?.data;
                    const countryList = result?.resultList.map((country, index) => {
                        return {
                            ...country,
                            isSelected: country?.selected,
                            name: country?.type,
                            const: country?.desc,
                            index,
                        };
                    });
                    updateModel({
                        rpp: {
                            countriesContext: {
                                list: countryList,
                                apiCalled: true,
                            },
                        },
                    });
                    updateState({
                        countryList,
                    });
                    selectDefaultCountry();
                }
            } else {
                updateState({
                    countryList: countriesContext?.list,
                });
                selectDefaultCountry();
            }
        } catch (ex) {
            showErrorToast({
                message: ex?.message || REQUEST_COULD_NOT_BE_PROCESSED,
            });
        }
    }

    /***
     * _onProxyTypeRightButtonModePress
     * On Id Type pop up item selected done button click event
     */
    function onProxyTypeRightButtonModePress(val, index) {
        onProxySelectionChange(index);
    }

    /***
     * _onLeftButtonModePress
     * On Id Type pop up cancel click event close the pop up
     */
    function onProxyTypeLeftButtonModePress(value, index) {
        updateState({
            proxyTypeDropView: false,
        });
    }

    /***
     * _onCountryRightButtonPress
     * On Country pop up select done click event
     */
    function onCountryRightButtonPress(val, index) {
        const countryListing = state.countryList;
        for (const item in countryListing) {
            countryListing[item].selected = false;
            countryListing[item].isSelected = false;
        }
        countryListing[index].selected = true;
        countryListing[index].isSelected = true;

        updateState({
            countryView: false,
            selectedCountry: countryListing[index],
            error: false,
            countryList: countryListing,
        });
    }

    /***
     * _onCountryLeftButtonPress
     * On Country pop up cancel click event close the pop up
     */
    function onCountryLeftButtonPress(value, index) {
        updateState({
            countryView: false,
        });
    }

    /***
     * _onCountryClick
     * On Country dropdown click event open the pop up
     */
    function onCountryClick() {
        Keyboard.dismiss();

        if (state.countryList.length > 1) {
            updateState({
                countryView: true,
                proxyTypeDropView: false,
            });
        } else {
            updateState({
                error: true,
                errorMessage: "Countries not available",
            });
        }
    }

    /***
     * _onCountryRightButtonPress
     * On Bank pop up select done click event
     */
    function onBankRightButtonPress(val, index) {
        const mbbBanksListing = [...state.mbbBanksList];
        for (const item in mbbBanksListing) {
            mbbBanksListing[item].selected = false;
            mbbBanksListing[item].isSelected = false;
        }
        mbbBanksListing[index].selected = true;
        mbbBanksListing[index].isSelected = true;

        const selectedBank = mbbBanksListing[index];
        updateState({
            bankView: false,
            selectedBank,
            selectedBankIndex: index,
            idValue: selectedBank.name,
            error: false,
            mbbBanksList: mbbBanksListing,
        });
    }

    /***
     * _onBankRightLeftButtonPress
     * On Bank pop up cancel click event close the pop up
     */
    function onBankRightLeftButtonPress(value, index) {
        updateState({
            bankView: false,
        });
    }

    /***
     * _onBankClick
     * On Bank dropdown click event open the pop up
     */
    function onBankClick() {
        Keyboard.dismiss();

        if (state.countryList.length > 1) {
            updateState({
                bankView: true,
                proxyTypeDropView: false,
            });
        } else {
            updateState({
                error: true,
                errorMessage: "Countries not available",
            });
        }
    }

    /***
     * _onShowIDDropdownPress
     * On ID Type dropdown click event open the pop up
     */
    function onShowIDDropdownPress() {
        Keyboard.dismiss();
        updateState({
            proxyTypeDropView: true,
            countryView: false,
            error: false,
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

    /***
     * _onProductRightButtonPress
     * On Product pop up select done click event
     */
    function onProductRightButtonPress(val, index) {
        updateState({
            productView: false,
            selectedProductIndex: val?.value,
            selectedProduct: val,
            error: false,
        });
    }

    /***
     * _onProductRightLeftButtonPress
     * On Product pop up cancel click event close the pop up
     */
    function onProductRightLeftButtonPress() {
        updateState({
            productView: false,
        });
    }

    /***
     * _onProductClick
     * On Product dropdown click event open the pop up
     */
    function onProductClick() {
        Keyboard.dismiss();
        updateState({
            productView: true,
            proxyTypeDropView: false,
        });
    }

    /**
     *_onTextChange
     * On Reference Text change update state
     */
    function onTextChange(text) {
        updateState({ referenceText: text });
    }

    /**
     *_onTextDone
     * On Reference Text on click handle next event
     */
    function onTextDone() {
        Keyboard.dismiss();
    }

    function commonParams(commonParams, responseObject) {
        const transferParams = {
            ...commonParams,
        };
        const {
            selectedBank,
            referenceText,
            primaryAccount,
            accountNumberText,
            selectedProduct,
            paymentDesc,
            selectedProxy,
            accountListings,
        } = state || {};

        transferParams.nameMasked = responseObject?.nameMasked;
        transferParams.recipientNameMaskedMessage = responseObject?.recipientNameMaskedMessage;
        transferParams.recipientNameMasked = responseObject?.recipientNameMasked;
        transferParams.actualAccHolderName = responseObject?.actualAccHolderName;
        transferParams.accHolderName = responseObject?.accountHolderName;
        transferParams.transferProxyRefNo = responseObject?.lookupReference;
        transferParams.idTypeText = "Bank/e-Wallet Account Number";
        transferParams.idValueFormatted = accountNumberText;
        transferParams.idValue = transferParams.toAccount;
        transferParams.transferAccType = "";
        transferParams.idType = "ACCT";
        transferParams.reference = referenceText;
        transferParams.paymentDesc = paymentDesc;
        transferParams.productInfo = selectedProduct;
        transferParams.primaryAccount = primaryAccount;
        transferParams.accountListings = accountListings;
        transferParams.transferFlow = 27;
        transferParams.selectedBank = {
            ...selectedBank,
            idValueFormatted: accountNumberText,
        };
        transferParams.selectedProxy = {
            ...selectedProxy,
            idValueFormatted: accountNumberText,
        };
        transferParams.image = {
            image: "icDuitNowCircle",
            imageName: "icDuitNowCircle",
            imageUrl: "icDuitNowCircle",
            shortName: selectedBank.bankName,
        };
        const params =
            selectedBank.bankCode === MBB_BANK_CODE
                ? {
                      ...transferParams,
                      functionsCode: 3,
                      transferTypeName: "Other Account Transfer",
                      transactionMode: "Other Account Transfer",
                      isMaybankTransfer: true,
                      receiptTitle: THIRD_PARTY_TRANSFER,
                      idCode: "CASA",
                  }
                : {
                      ...transferParams,
                      functionsCode: 4,
                      transferTypeName: "Interbank Transfer",
                      transactionMode: "Interbank Transfer",
                      isMaybankTransfer: false,
                      receiptTitle: INSTANT_TRANSFER,
                      idCode: "ACCT",
                      idType: "ACCT",
                  };
        hideToast();
        const modParams = route.params?.isEdit
            ? { ...route.params?.transferParams, reference: referenceText }
            : params;
        navigation.navigate(
            route.params?.isEdit
                ? RTP_AUTODEBIT_CONFIRMATION_SCREEN
                : RTP_AUTODEBIT_DECOUPLE_SCREEN,
            {
                ...route.params,
                transferParams: modParams,
                screenDate: route.params?.screenDate,
            }
        );
    }

    /***
     * _fundTransferInquiryApi
     * fund Transfer Inquiry Api call for Maybank casa account
     */
    async function fundTransferInquiry(transferParams) {
        const { selectedBank } = state;
        const subUrl = "/fundTransfer/inquiry";
        try {
            const params = {
                bankCode: selectedBank?.bankCode,
                fundTransferType: FUND_TRANSFER_TYPE_MAYBANK,
                toAccount: transferParams?.toAccount,
                payeeCode: transferParams?.toAccountCode,
                swiftCode: selectedBank?.swiftCode,
            };
            const response = await fundTransferInquiryApi(subUrl, params);
            const responseObject = response?.data;

            if (responseObject?.accountHolderName) {
                commonParams(transferParams, responseObject);
            } else {
                showErrorToast({
                    message: "Please input valid transfer details.", // ACCOUNT_NUMBER_INVALID,
                });
            }
        } catch (error) {
            showErrorToast({
                message: error?.message ?? "Please input valid transfer details.", // ACCOUNT_NUMBER_INVALID,
            });
        }
    }

    /***
     * _fundTransferInquiryApiOthers
     * Other Bank Account Inquiry Api
     */
    async function fundTransferInquiryApiOthers(transferParams) {
        const { selectedBank } = state;

        const subUrl = "/fundTransfer/inquiry";

        try {
            const params = {
                bankCode: selectedBank?.bankCode,
                fundTransferType: FUND_TRANSFER_TYPE_INTERBANK,
                toAccount: transferParams?.toAccount,
                payeeCode: transferParams?.toAccountCode,
                swiftCode: selectedBank?.swiftCode,
                interbankPaymentType: "TRANSFER",
            };

            const response = await fundTransferInquiryApi(subUrl, params);
            const responseObject = response?.data;

            if (responseObject?.accountHolderName) {
                commonParams(transferParams, responseObject);
            } else {
                showErrorToast({
                    message: AUTODEBIT_ACCOUNT_NUMBER_INVALID, // ACCOUNT_NUMBER_INVALID,
                });
            }
        } catch (error) {
            showErrorToast({
                message: AUTODEBIT_ACCOUNT_NUMBER_INVALID, // ACCOUNT_NUMBER_INVALID,
            });
        }
    }

    /***
     * _onTextInputValueChanged
     * on Account in put formate the account number and update state
     */
    function onTextInputValueChanged(text) {
        const { accountNumberCorrectLength, accountNumberLength } = state || {};

        const account = text || "";
        const accountPasted = text
            ? text
                  .toString()
                  .trim()
                  .replace(/\D/g, "")
                  .replace(/[^\w\s]/gi, "")
                  .replace(/-/g, "")
                  .replace(/[ \t\r]+/g, "")
            : "";

        if (account?.length <= accountNumberLength) {
            updateState({
                showLocalError: false,
                accountNumber:
                    accountPasted?.length > accountNumberCorrectLength ? accountPasted : account,
                accountNumberText: account
                    .substring(0, accountNumberLength)
                    .replace(/[^\dA-Z]/g, "")
                    .replace(/(.{4})/g, "$1 ")
                    .trim(),
            });
        } else {
            if (!account || account.length === 0) {
                updateState({
                    accountNumberText: "",
                    accountNumber: "",
                });
            }
        }
    }
    const {
        errorMessage,
        selectedProxy,
        selectedProduct,
        referenceText,
        primaryAccount,
        idLabel,
        idValue,
        selectedCountry,
        selectedBank,
        accountNumberLength,
        accountNumberText,
        showLocalError,
        showLocalErrorMessage,
        error,
        idPlaceHolder,
        showReferenceError,
        showReferenceErrorMsg,
        productView,
        selectedProductIndex,
        bankView,
        mbbBanksList,
        selectedBankIndex,
        proxyTypeDropView,
        proxyList,
        selectedIDTypeIndex,
        countryView,
        countryList,
    } = state || {};
    const valueLength = selectedProxy?.minLength + idValue?.split(" ").length - 1 ?? 0;
    const isSubmitDisble =
        !selectedProxy?.name ||
        !selectedProduct?.productName ||
        !primaryAccount?.name ||
        !referenceText ||
        referenceText?.length < 3 ||
        idValue?.length < valueLength ||
        (selectedProxy?.code === "PSPT" && !selectedCountry);
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
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={19}
                                text="Step 1 of 2"
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
                                            text={RTP_AUTODEBIT}
                                        />
                                        <Typography
                                            fontSize={14}
                                            fontWeight="bold"
                                            fontStyle="normal"
                                            lineHeight={19}
                                            color={BLACK}
                                            textAlign="left"
                                            text={FILL_REQUESTED}
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
                                            title={primaryAccount?.name ?? ""}
                                            descriptionText={
                                                getFormatedAccountNumber(primaryAccount?.number) ??
                                                ""
                                            }
                                            disable={true}
                                            align="left"
                                            borderWidth={0.5}
                                            hideCaret={true}
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
                                            text={REQUEST_VIA}
                                        />
                                    </View>

                                    <View style={styles.mt10}>
                                        <Dropdown
                                            title={selectedProxy?.name ?? PLEASE_SELECT}
                                            disable={false}
                                            align="left"
                                            borderWidth={0.5}
                                            testID="txtSELECT_RL"
                                            accessibilityLabel="txtSELECT_RZ"
                                            onPress={onShowIDDropdownPress}
                                        />
                                    </View>
                                    {selectedProxy?.code === "CASA" ? (
                                        <View>
                                            <View style={styles.descriptionContainerAmount}>
                                                <Typography
                                                    fontSize={14}
                                                    fontWeight="normal"
                                                    fontStyle="normal"
                                                    letterSpacing={0}
                                                    lineHeight={19}
                                                    color={BLACK}
                                                    textAlign="left"
                                                    text="Recipient Bank/e-Wallet"
                                                />
                                            </View>
                                            <View style={styles.contoryContainer}>
                                                <Dropdown
                                                    title={selectedBank?.name ?? PLEASE_SELECT}
                                                    disable={false}
                                                    align="left"
                                                    iconType={1}
                                                    textLeft={true}
                                                    testID="txtSELECT_RL"
                                                    accessibilityLabel="txtSELECT_RZ"
                                                    borderWidth={0.5}
                                                    onPress={onBankClick}
                                                />
                                            </View>
                                            {selectedBank?.name ? (
                                                <>
                                                    <View style={styles.descriptionContainerAmount}>
                                                        <Typography
                                                            fontSize={14}
                                                            fontWeight="normal"
                                                            fontStyle="normal"
                                                            letterSpacing={0}
                                                            lineHeight={19}
                                                            color={BLACK}
                                                            textAlign="left"
                                                            text={CDD_ACCOUNT_NUMBER}
                                                        />
                                                    </View>

                                                    <View style={styles.amountViewTransfer}>
                                                        <TextInput
                                                            maxLength={accountNumberLength}
                                                            keyboardType="numeric"
                                                            onChangeText={onTextInputValueChanged}
                                                            value={accountNumberText}
                                                            isValidate={showLocalError}
                                                            errorMessage={showLocalErrorMessage}
                                                            onSubmitEditing={onTextDone}
                                                            clearButtonMode="while-editing"
                                                            returnKeyType="done"
                                                            editable
                                                            placeholder="e.g. 8888 1212 8888"
                                                        />
                                                    </View>
                                                </>
                                            ) : null}
                                        </View>
                                    ) : null}
                                    {selectedProxy?.code === "MBNO" ? (
                                        <View>
                                            <View style={styles.descriptionContainerAmount}>
                                                <Typography
                                                    fontSize={14}
                                                    fontWeight="normal"
                                                    fontStyle="normal"
                                                    letterSpacing={0}
                                                    lineHeight={19}
                                                    color={BLACK}
                                                    textAlign="left"
                                                    text={MOBNUM_LBL}
                                                />
                                            </View>

                                            <View style={styles.mobileNumberView}>
                                                <View style={styles.mobileNumberView1}>
                                                    <TextInput
                                                        keyboardType={
                                                            Platform.OS === "ios"
                                                                ? "number-pad"
                                                                : "numeric"
                                                        }
                                                        accessibilityLabel="mobileNumber"
                                                        maxLength={
                                                            selectedProxy?.maxLength +
                                                                idValue?.split(" ").length -
                                                                1 ?? 0
                                                        }
                                                        isValidate={error}
                                                        errorMessage={errorMessage}
                                                        prefix="+60"
                                                        value={idValue}
                                                        onChangeText={onIdTextChange}
                                                        editable
                                                        onSubmitEditing={onTextDone}
                                                        returnKeyType="done"
                                                        placeholder="Enter mobile number"
                                                    />
                                                </View>
                                                <View style={styles.mobileNumberView2}>
                                                    <TouchableOpacity onPress={selectContact}>
                                                        <Image
                                                            accessible={true}
                                                            testID="imgWalNext"
                                                            accessibilityLabel="imgWalNext"
                                                            style={styles.mobileNumberSelectView}
                                                            source={images.icContactList}
                                                        />
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        </View>
                                    ) : null}

                                    {selectedProxy?.code === "NRIC" && (
                                        <View>
                                            <View style={styles.descriptionContainerAmount}>
                                                <Typography
                                                    fontSize={14}
                                                    fontWeight="normal"
                                                    fontStyle="normal"
                                                    letterSpacing={0}
                                                    lineHeight={19}
                                                    color={BLACK}
                                                    textAlign="left"
                                                    text={NRIC_NUMBER}
                                                />
                                            </View>

                                            <View style={styles.mobileNumberView}>
                                                <TextInput
                                                    placeholder={ENTER_NRIC_NUMBER}
                                                    keyboardType={
                                                        Platform.OS === "ios"
                                                            ? "number-pad"
                                                            : "numeric"
                                                    }
                                                    accessibilityLabel="nricNumber"
                                                    maxLength={
                                                        selectedProxy?.maxLength +
                                                            idValue?.split(" ").length -
                                                            1 ?? 0
                                                    }
                                                    isValidate={error}
                                                    errorMessage={errorMessage}
                                                    value={idValue}
                                                    onChangeText={onIdTextChange}
                                                    editable
                                                    returnKeyType="done"
                                                />
                                            </View>
                                        </View>
                                    )}
                                    {selectedProxy?.code === "PSPT" ? (
                                        <View>
                                            <View style={styles.descriptionContainerAmount}>
                                                <Typography
                                                    fontSize={14}
                                                    fontWeight="normal"
                                                    fontStyle="normal"
                                                    letterSpacing={0}
                                                    lineHeight={19}
                                                    color={BLACK}
                                                    textAlign="left"
                                                    text={COUNTRY_LBL}
                                                />
                                            </View>
                                            <View style={styles.contoryContainer}>
                                                <Dropdown
                                                    title={
                                                        selectedCountry?.type ?? "Select Country"
                                                    }
                                                    disable={false}
                                                    align="left"
                                                    iconType={1}
                                                    textLeft={true}
                                                    testID="txtSELECT_RL"
                                                    accessibilityLabel="txtSELECT_RZ"
                                                    borderWidth={0.5}
                                                    onPress={onCountryClick}
                                                />
                                            </View>
                                        </View>
                                    ) : null}
                                    {selectedProxy?.code === "PSPT" ||
                                    selectedProxy?.code === "ARMN" ||
                                    selectedProxy?.code === "BREG" ? (
                                        <View>
                                            <View style={styles.descriptionContainerAmount}>
                                                <Typography
                                                    fontSize={14}
                                                    fontWeight="normal"
                                                    fontStyle="normal"
                                                    letterSpacing={0}
                                                    lineHeight={19}
                                                    color={BLACK}
                                                    textAlign="left"
                                                    text={idLabel}
                                                />
                                            </View>
                                            <View style={styles.mobileNumberView}>
                                                <TextInput
                                                    placeholder={idPlaceHolder}
                                                    accessibilityLabel="nricNumber"
                                                    maxLength={
                                                        selectedProxy?.maxLength +
                                                            idValue?.split(" ").length -
                                                            1 ?? 0
                                                    }
                                                    isValidate={error}
                                                    errorMessage={errorMessage}
                                                    value={idValue}
                                                    editable
                                                    onChangeText={onIdTextChange}
                                                    keyboardType="default"
                                                />
                                            </View>
                                        </View>
                                    ) : null}
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
                                        title={selectedProduct?.productName ?? PLEASE_SELECT}
                                        disable={
                                            state.productList?.length === 1 || route.params?.isEdit
                                        }
                                        align="left"
                                        iconType={1}
                                        textLeft={true}
                                        testID="txtSELECT_RL"
                                        accessibilityLabel="txtSELECT_RZ"
                                        borderWidth={0.5}
                                        onPress={onProductClick}
                                        hideCaret={
                                            state.productList?.length === 1 || route.params?.isEdit
                                        }
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

                                <View style={[styles.amountViewTransfer, styles.mb40]}>
                                    <TextInput
                                        maxLength={20}
                                        accessibilityLabel="inputReference"
                                        isValidate={showReferenceError}
                                        errorMessage={showReferenceErrorMsg}
                                        onSubmitEditing={onTextDone}
                                        value={referenceText}
                                        onChangeText={onTextChange}
                                        clearButtonMode="while-editing"
                                        returnKeyType="done"
                                        editable
                                        placeholder="e.g. INV23232323"
                                    />
                                </View>
                            </View>
                        </View>
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
                showMenu={proxyTypeDropView}
                list={proxyList}
                selectedIndex={selectedIDTypeIndex}
                onRightButtonPress={onProxyTypeRightButtonModePress}
                onLeftButtonPress={onProxyTypeLeftButtonModePress}
                rightButtonText={DONE}
                leftButtonText={CANCEL}
            />
            <ScrollPickerView
                showMenu={countryView}
                list={countryList}
                onRightButtonPress={onCountryRightButtonPress}
                onLeftButtonPress={onCountryLeftButtonPress}
                rightButtonText={DONE}
                leftButtonText={CANCEL}
            />
            <ScrollPickerView
                showMenu={bankView}
                list={mbbBanksList}
                selectedIndex={selectedBankIndex}
                onRightButtonPress={onBankRightButtonPress}
                onLeftButtonPress={onBankRightLeftButtonPress}
                rightButtonText={DONE}
                leftButtonText={CANCEL}
            />
            <ScrollPickerView
                showMenu={productView}
                list={state.productList}
                selectedIndex={selectedProductIndex}
                onRightButtonPress={onProductRightButtonPress}
                onLeftButtonPress={onProductRightLeftButtonPress}
                rightButtonText={DONE}
                leftButtonText={CANCEL}
            />
        </ScreenContainer>
    );
}

AutoDebitIDScreen.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
    getModel: PropTypes.func,
    updateModel: PropTypes.func,
};

const styles = StyleSheet.create({
    KeyboardAvoidingViewStyle: {
        flex: 1,
        flexDirection: "column",
        width: "100%",
    },
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
    mb40: {
        marginBottom: 40,
    },
    mobileNumberSelectView: {
        height: 30,
        resizeMode: Platform.OS !== "ios" ? "center" : "contain",
        width: 30,
    },
    mobileNumberView: {
        borderBottomColor: PINKISH_GREY,
        borderBottomWidth: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 6,
        width: "100%",
    },
    mobileNumberView1: {
        width: "90%",
    },
    mobileNumberView2: {
        marginTop: 10,
        width: "20%",
    },
    mt10: {
        marginTop: 10,
    },
    scrollView: {
        flex: 1,
    },
});

export default withModelContext(AutoDebitIDScreen);
