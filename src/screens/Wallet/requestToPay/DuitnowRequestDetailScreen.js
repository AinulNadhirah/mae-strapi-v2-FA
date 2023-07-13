import { isEmpty } from "lodash";
import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
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
    AMOUNT_TOGGLE_SCREEN,
    DUITNOW_DECOUPLED_REQUEST_CONFIRMATION_SCREEN,
    REQUEST_TO_PAY_STACK,
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

import { withModelContext, useModelController } from "@context";

import {
    duitnowStatusInquiry,
    loadCountries,
    getBanksListApi,
    invokeL3,
    productList as productListApi,
    fundTransferInquiryApi,
    bankingGetDataMayaM2u,
} from "@services";

import {
    MEDIUM_GREY,
    YELLOW,
    DISABLED,
    DISABLED_TEXT,
    BLACK,
    PINKISH_GREY,
} from "@constants/colors";
import {
    proxyList as proxyListing,
    transactionType,
    modelType,
    duitNowPasspostCodeSubUrl,
    proxyIdType,
    fundTransferInquirySubUrl,
    indexProxy,
    getAllAccountSubUrl,
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
    REQUEST_VIA,
    FILL_REQUESTED,
    PAY_TO,
    RECIPIENT_REFERENCE,
    CDD_ACCOUNT_NUMBER,
    COUNTRY_LBL,
    PASSPORTID_LBL2,
    PLEASE_REMOVE_INVALID_RECIPIENT_REFERENCE,
    PLEASE_INPUT_VALID_RECIPIENT_REFERENCE,
    INVALID_TRANSFER_DETAILS,
    ISSUING_COUNTRY_ERROR,
    INVALID_CONTACT,
    COUNTRY_NOT_FOUND,
    INTERBANK_TRN,
    OTHER_ACCOUNT_TRN,
    PLEASE_SELECT,
    RECIPIENT_BANK_WALLET,
    ACCOUNT_NUMBER_PLACEHOLDER,
    ENTERMOBILE_NUMBER,
    SELECT_COUNTRY,
    DONE,
    CANCEL,
    REFERENCE_NUMBER_PLACEHOLDER,
    MAYBANK,
    DUINTNOW_IMAGE,
} from "@constants/strings";

import { referenceRegex } from "@utils/dataModel";
import { checkFormatNumber, formatNumber } from "@utils/dataModel/rtdHelper";
import {
    formatICNumber,
    formatMobileNumbersNew,
    getFormatedAccountNumber,
    openNativeContactPicker,
} from "@utils/dataModel/utility";

import images from "@assets";

function DuitnowRequestDetailScreen(props) {
    const [idValue, setIdValue] = useState("");
    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [proxyTypeDropView, setProxyTypeDropView] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [countryView, setCountryView] = useState(false);
    const [selectedIDTypeIndex, setSelectedIDTypeIndex] = useState(0);
    const [countryList, setCountryList] = useState([]);
    const [proxyList, setProxyList] = useState(proxyListing);
    const [idLabel, setIdLabel] = useState(PASSPORTID_LBL2);
    const [idPlaceHolder, setIdPlaceHolder] = useState(ENTER_PASSPORT_NUMBER);
    const [selectedBank, setSelectedBank] = useState(null);
    const [mbbBanksList, setMbbBanksList] = useState([]);
    const [bankView, setBankView] = useState(false);
    const [selectedProxy, setSelectedProxy] = useState(null);
    const [productList, setProductList] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [referenceText, setReferenceText] = useState("");
    const [accountNumberText, setAccountNumberText] = useState("");
    const [accountNumber, setAccountNumber] = useState("");
    const [showLocalErrorMessage, setShowLocalErrorMessage] = useState("");
    const [showLocalError, setShowLocalError] = useState(false);
    const [showReferenceErrorMsg, setShowReferenceErrorMsg] = useState("");
    const [showReferenceError, setShowReferenceError] = useState(false);
    const [selectedBankIndex, setSelectedBankIndex] = useState(0);
    const [primaryAccount, setPrimaryAccount] = useState({});
    const { getModel, updateModel } = useModelController();
    const accountNumberLength = 20;
    const accountNumberCorrectLength = 12;
    const showLoaderModal = false;
    /***
     * componentDidMount
     * Update Screen data
     */
    useEffect(() => {
        _requestL3Permission();
        loadAllCountries();
        getBanksListsApi();
        getAllAccounts();
        if (
            props?.route?.params?.isRtdEnabled &&
            props?.route?.params?.hasPermissionToggleAutoDebit
        ) {
            getAllProducts(props?.route?.params?.merchantId);
        }
        if (props?.route?.params?.transferParams?.isEditReference) {
            updateFields(props.route.params?.transferParams);
        }
    }, []);

    function updateFields(params) {
        setReferenceText(params?.reference ?? "");
        setSelectedBank(params?.selectedBank);
        setIdValue(params?.idValue);
        setAccountNumberText(params?.idValueFormatted);
        setAccountNumber(params?.idValue);
        setSelectedIDTypeIndex(params?.selectedProxy?.index);
        setSelectedProxy(selectedProxy);
        _onProxySelectionChange(params?.selectedProxy?.index);
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
                const res = await productListApi({
                    merchantId,
                });
                if (res?.data?.code === 200) {
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
                    setProductList(products);
                    if (products?.length === 1) {
                        setSelectedProduct(products[0]);
                    }
                }
            } else {
                setProductList(productsContext?.list);
                if (productsContext?.list?.length === 1) {
                    setSelectedProduct(productsContext?.list[0]);
                }
            }
        } catch (err) {
            showErrorToast({
                message: err?.message,
            });
        }
    }

    /***
     * getAllAccounts
     * get the user accounts and filter from and To accounts
     * if from account not there set primary account as from account
     */
    async function getAllAccounts() {
        const { primaryAccount } = getModel("wallet");
        const userAccountsContext = getModel("userAccounts");
        const { merchantInquiry } = getModel("rpp");
        const cusType = getModel("user")?.cus_type;

        if (!isEmpty(primaryAccount?.number) && cusType !== "02") {
            setPrimaryAccount(primaryAccount);
            updateModel({ userAccounts: { accountListings: [primaryAccount] } });
        } else if (userAccountsContext?.apiCalled) {
            //if userAccountsContext in context initiate api call
            const primaryAcct =
                cusType === "02"
                    ? userAccountsContext?.accountListings.find(
                          (acc) => acc?.number.substring(0, 12) === merchantInquiry?.accNo
                      )
                    : userAccountsContext?.accountListings.find((acc) => acc?.primary);

            setPrimaryAccount(primaryAcct);
        } else {
            const response = await bankingGetDataMayaM2u(getAllAccountSubUrl, false);
            const { accountListings } = response?.data?.result || {};

            if (accountListings?.length > 0) {
                const primaryAcct =
                    cusType === "02"
                        ? accountListings.find(
                              (acc) => acc?.number.substring(0, 12) === merchantInquiry?.accNo
                          )
                        : accountListings.find((acc) => acc?.primary);

                setPrimaryAccount(primaryAcct);
                updateModel({
                    userAccounts: {
                        accountListings,
                        apiCalled: true,
                    },
                });
            }
        }
    }

    async function _requestL3Permission() {
        try {
            const response = await invokeL3(false);
            if (response?.status === 200) return response;
            return null;
        } catch (error) {
            return null;
        }
    }

    /***
     * unselect all proxy
     */
    function _unselectAllProxy() {
        const _proxyList = proxyList;
        for (const item in _proxyList) {
            _proxyList[item].selected = false;
        }
        return _proxyList;
    }

    function _selectDefaultBank() {
        const { transferParams } = props.route.params;
        // if senderProxyValue have value, meaning we in resend mode, AND when senderProxyType = null, meaning resnd is account proxy
        if (!transferParams?.senderProxyType && transferParams?.senderProxyValue) {
            // loop and check swiftCode
            const bankIndex = mbbBanksList.findIndex(
                (item) => transferParams?.swiftCode === item.swiftCode
            );

            if (bankIndex >= 0) {
                _onBankRightButtonPress({}, bankIndex);
            }
        }
    }

    function _selectDefaultCountry() {
        const { transferParams } = props.route.params;
        // if senderProxyValue have value, meaning we in resend mode, AND when senderProxyType = null, meaning resnd is account proxy
        if (transferParams?.senderProxyType === proxyList[indexProxy?.indexPassport]?.code) {
            // loop and check country code
            const countryIndex = countryList.findIndex(
                (item) => transferParams?.swiftCode === item.desc
            );

            if (countryList >= 0) {
                _onCountryRightButtonPress({}, countryIndex);
            }
        }
    }

    function _onProxySelectionChange(index, defaultValue = "") {
        const proxyList = _unselectAllProxy();
        const selectedProxy = proxyList[index];
        selectedProxy.selected = true;

        setProxyTypeDropView(false);
        setIdLabel(selectedProxy?.idLabel);
        setIdValue(
            props?.route?.params?.transferParams?.isEditReference
                ? props?.route?.params?.transferParams?.idValue
                : ""
        );
        setSelectedIDTypeIndex(index);
        setProxyList(proxyList);
        setIdPlaceHolder(selectedProxy?.idPlaceHolder);
        setSelectedProxy(selectedProxy);

        _onIdTextChange(defaultValue);
    }

    /***
     * _onIdTextChange
     * on Text Change formate state
     */
    function _onIdTextChange(text) {
        text = props?.route?.params?.transferParams?.isEditReference
            ? props?.route?.params?.transferParams?.idValue
            : text;
        if (selectedProxy?.code === proxyList[indexProxy?.indexMBNO]?.code) {
            const mobileNumber = formatMobileNumbersNew(text);
            setIdValue(mobileNumber);
        } else if (selectedProxy?.code === proxyList[indexProxy?.indexNRIC]?.code) {
            const ic = formatICNumber(text);
            setIdValue(ic);
        } else {
            setIdValue(text);
        }
    }

    function _handleProxy(proxyTypeVal) {
        // check selected country
        if (!selectedCountry && proxyTypeVal === proxyList[indexProxy?.indexPassport]?.code) {
            setError(true);
            setErrorMessage(ISSUING_COUNTRY_ERROR);
            return;
        }
        duitnowIdInquiry();
    }

    function _handleCasa() {
        const user = props?.getModel(modelType?.user);

        const text = accountNumber.replace(/ /g, "").replace(/ /g, "");

        const formattedToAccount = text
            .substring(0, accountNumberLength - 2)
            .replace(/[^\dA-Z]/g, "")
            .replace(/(.{4})/g, "$1 ")
            .trim();
        const { transferParams } = props.route.params;
        const formattedTransferParams = { ...transferParams };
        formattedTransferParams.userName = user?.cus_name;
        formattedTransferParams.toAccount = text;
        formattedTransferParams.accounts = text;
        formattedTransferParams.addingFavouriteFlow = false;
        formattedTransferParams.formattedToAccount = formattedToAccount
            .substring(0, accountNumberLength - 2)
            .replace(/[^\dA-Z]/g, "")
            .replace(/(.{4})/g, "$1 ")
            .trim();
        if (text.length > 3) {
            if (transferParams?.isMaybankTransfer) {
                _fundTransferInquiryApi(formattedTransferParams);
            } else {
                _fundTransferInquiryApiOthers(formattedTransferParams);
            }
        } else {
            setShowLocalErrorMessage(INVALID_TRANSFER_DETAILS);
            setShowLocalError(true);
        }
    }

    /***
     * _OnSubmit
     */
    function _OnSubmit() {
        const mobNum =
            selectedProxy?.code === proxyList[indexProxy?.indexMBNO]?.code
                ? idValue.replace(/\s/g, "")
                : null;
        const val =
            selectedProxy?.code === proxyList[indexProxy?.indexMBNO]?.code &&
            mobNum.indexOf(0) !== 0
                ? mobNum.replace(/^1/g, "01")
                : idValue.replace(/\s/g, "");
        const valueLength = `${selectedProxy?.minLength} ${idValue?.split(" ").length - 1}` ?? 0;

        const validate = referenceRegex(referenceText);
        if (!validate || (referenceText && referenceText.indexOf("@") !== -1)) {
            setShowReferenceErrorMsg(
                referenceText?.length && !validate
                    ? PLEASE_REMOVE_INVALID_RECIPIENT_REFERENCE
                    : PLEASE_INPUT_VALID_RECIPIENT_REFERENCE
            );
            setShowReferenceError(true);
            return;
        }
        // empty or less than min or max length
        if (val.length < valueLength || val.length > selectedProxy?.maxLength) {
            setError(true);
            setErrorMessage(
                val.length < valueLength
                    ? selectedProxy?.minErrorMessage
                    : selectedProxy?.maxErrorMessage
            );
            return;
        } else {
            setError(false);
            setErrorMessage("");
        }

        switch (selectedProxy?.code) {
            case proxyList[indexProxy?.indexAccount]?.code:
                _handleCasa();
                break;
            case proxyList[indexProxy?.indexMBNO]?.code:
            case proxyList[indexProxy?.indexNRIC]?.code:
            case proxyList[indexProxy?.indexPassport]?.code:
            case proxyList[indexProxy?.indexArmyPolice]?.code:
            case proxyList[indexProxy?.indexBRN]?.code:
                _handleProxy(selectedProxy?.code);
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
        const { params } = props.route;

        const idValueInTextView =
            selectedProxy?.code === proxyList[indexProxy?.indexMBNO]?.code
                ? formatNumber(idValue.replace(/^1/g, "01"))
                : idValue;
        const idValueClean =
            selectedProxy?.code === proxyList[indexProxy?.indexMBNO]?.code
                ? idValue.toString().replace(/\s/g, "").replace(/^1/g, "01")
                : idValue.toString().replace(/\s/g, "").replace(/\s/g, "");
        const idCode = selectedProxy?.code.toString().replace(/\s/g, "");
        const countryCode =
            selectedProxy?.code === proxyList[indexProxy?.indexPassport]?.code
                ? selectedCountry?.desc ?? ""
                : "";
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
            const resultData = result?.result;
            if (result.code === 200) {
                const user = props?.getModel(modelType?.user);
                const transferParams = {
                    userName: user?.cus_name,
                    reference: referenceText,
                    rtpType: props?.route?.params?.rtpType ?? "",
                    isMaybankTransfer: false,
                    transferRetrievalRefNo: resultData?.retrievalRefNo,
                    transferProxyRefNo: resultData?.proxyRefNo,
                    transferRegRefNo: resultData?.regRefNo,
                    transferAccType: resultData?.accType,
                    transferBankCode: resultData?.bankCode,
                    toAccountCode: resultData?.bankCode,
                    nameMasked: resultData?.nameMasked,
                    recipientNameMaskedMessage: resultData?.recipientNameMaskedMessage,
                    recipientNameMasked: resultData?.recipientNameMasked,
                    actualAccHolderName: resultData?.actualAccHolderName,
                    accHolderName: resultData?.accHolderName,
                    accountName: resultData?.accHolderName,
                    transferBankName: resultData?.bankName,
                    transferAccHolderName: resultData?.accHolderName,
                    transferLimitInd: resultData?.limitInd,
                    transferMaybank: resultData?.maybank,
                    transferOtherBank: !resultData?.maybank,
                    transferAccNumber: resultData?.accNo,
                    formattedToAccount: resultData?.accNo,
                    idValueFormatted: idValueInTextView,
                    idValue: idValueClean,
                    idType: idCode,
                    idCode,
                    idTypeText: selectedProxy?.name,
                    image: {
                        image: DUINTNOW_IMAGE,
                        imageName: DUINTNOW_IMAGE,
                        imageUrl: DUINTNOW_IMAGE,
                        shortName: resultData?.accHolderName,
                        type: true,
                    },
                    bankName: resultData?.maybank ? MAYBANK : "",
                    imageBase64: true,
                    minAmount: 0.0,
                    maxAmount: 50000.0,
                    amountError: AMOUNT_ERROR_RTP,
                    screenLabel: ENTER_AMOUNT,
                    screenTitle: REQUEST_TO_PAY,
                    toAccount: resultData?.accNo,
                    receiptTitle: REQUEST_TO_PAY,
                    transactionDate: "",
                    isFutureTransfer: false,
                    toAccountBank: resultData?.maybank ? MAYBANK : "",
                    transferType: null,
                    transferSubType: null,
                    twoFAType: null,
                    mbbbankCode: resultData?.bankCode,
                    bankCode: resultData?.bankCode,
                    swiftCode: resultData?.bankCode,
                    transferFlow: 25,
                    functionsCode: resultData?.maybank ? 12 : 27,
                    countryCode: selectedCountry?.desc ?? "",
                    productInfo: selectedProduct,
                    primaryAccount,
                    selectedProxy,
                    debtorAccountNumber: resultData?.accNo || "",
                    debtorName: resultData?.actualAccHolderName || "",
                    amountEditable: true,
                    senderName: resultData?.accHolderName,
                    senderAcct: resultData?.accNo,
                };

                hideToast();
                const modParams = params?.isEdit
                    ? { ...params?.transferParams, ...transferParams, reference: referenceText }
                    : params?.transferParams?.isEditReference
                    ? { ...params?.transferParams, reference: referenceText }
                    : transferParams;
                props?.navigation.navigate(REQUEST_TO_PAY_STACK, {
                    screen: params?.transferParams?.isEditReference
                        ? DUITNOW_DECOUPLED_REQUEST_CONFIRMATION_SCREEN
                        : AMOUNT_TOGGLE_SCREEN,
                    params: {
                        ...params,
                        transferParams: modParams,
                        productList,
                        screenDate: params?.screenDate,
                        selectedProxy,
                    },
                });
            } else {
                showErrorToast({
                    message: resultData?.statusDesc,
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
    function selectContact() {
        openNativeContactPicker()
            .then((result) => {
                if (result.phoneNumber !== null) {
                    const idValueFormatted = checkFormatNumber(result.phoneNumber);
                    setIdValue(idValueFormatted);
                } else {
                    showErrorToast({
                        message: INVALID_CONTACT,
                    });
                }
            })
            .catch((error) => {
                setError(true);
                setErrorMessage(error.message);
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
                if (response?.data?.resultList?.length > 0) {
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
                    setMbbBanksList(resultList);
                    // on state callback
                    _selectDefaultBank();
                }
            } else {
                setMbbBanksList(banksContext?.list);
                // on state callback
                _selectDefaultBank();
            }
        } catch (err) {
            showErrorToast({
                message: err?.message, // ACCOUNT_NUMBER_INVALID,
            });
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
                if (response?.data?.resultList?.length) {
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
                    setCountryList(countryList);
                    _selectDefaultCountry();
                }
            } else {
                setCountryList(countriesContext?.list);
                _selectDefaultCountry();
            }
        } catch (err) {
            showErrorToast({
                message: err?.message,
            });
        }
    }

    /***
     * _onProxyTypeRightButtonModePress
     * On Id Type pop up item selected done button click event
     */
    function _onProxyTypeRightButtonModePress(val, index) {
        _onProxySelectionChange(index);
    }

    /***
     * _onLeftButtonModePress
     * On Id Type pop up cancel click event close the pop up
     */
    function _onProxyTypeLeftButtonModePress(value, index) {
        setProxyTypeDropView(false);
    }

    /***
     * _onCountryRightButtonPress
     * On Country pop up select done click event
     */
    function _onCountryRightButtonPress(val, index) {
        const _countryList = countryList;
        for (const item in countryList) {
            _countryList[item].selected = false;
            _countryList[item].isSelected = false;
        }
        _countryList[index].selected = true;
        _countryList[index].isSelected = true;

        setCountryView(false);
        setSelectedCountry(_countryList[index]);
        setError(false);
        setCountryList(_countryList);
    }

    /***
     * _onCountryLeftButtonPress
     * On Country pop up cancel click event close the pop up
     */
    function _onCountryLeftButtonPress(value, index) {
        setCountryView(false);
    }

    /***
     * _onCountryClick
     * On Country dropdown click event open the pop up
     */
    function _onCountryClick() {
        Keyboard.dismiss();

        if (countryList.length > 1) {
            setCountryView(true);
            setProxyTypeDropView(false);
        } else {
            setError(true);
            setErrorMessage(COUNTRY_NOT_FOUND);
        }
    }

    /***
     * _onCountryRightButtonPress
     * On Bank pop up select done click event
     */
    function _onBankRightButtonPress(val, index) {
        const _mbbBanksList = [...mbbBanksList];

        _mbbBanksList[index].selected = true;
        _mbbBanksList[index].isSelected = true;

        const selectedBank = _mbbBanksList[index];

        setBankView(false);
        setSelectedBank(selectedBank);
        setSelectedBankIndex(index);
        setIdValue(selectedBank.name);
        setError(false);
        setMbbBanksList(_mbbBanksList);
    }

    /***
     * _onBankRightLeftButtonPress
     * On Bank pop up cancel click event close the pop up
     */
    function _onBankRightLeftButtonPress(value, index) {
        setBankView(false);
    }

    /***
     * _onBankClick
     * On Bank dropdown click event open the pop up
     */
    function _onBankClick() {
        Keyboard.dismiss();

        if (countryList.length > 1) {
            setBankView(true);
            setProxyTypeDropView(false);
        } else {
            setError(true);
            setErrorMessage(COUNTRY_NOT_FOUND);
        }
    }

    /***
     * _onShowIDDropdownPress
     * On ID Type dropdown click event open the pop up
     */
    function _onShowIDDropdownPress() {
        Keyboard.dismiss();
        setProxyTypeDropView(true);
        setCountryView(false);
        setError(false);
    }

    /***
     * _onBackPress
     * On Screen Back press handle
     */
    function _onBackPress() {
        hideToast();
        props?.navigation?.goBack();
    }

    /**
     *_onTextChange
     * On Reference Text change update state
     */
    function _onTextChange(text) {
        setReferenceText(text);
    }

    /**
     *_onTextDone
     * On Reference Text on click handle next event
     */
    function _onTextDone() {
        Keyboard.dismiss();
    }

    function commonParams(commonParams, responseObject) {
        const transferParams = {
            ...commonParams,
        };
        const routeParams = props?.route?.params;
        transferParams.nameMasked = responseObject?.nameMasked;
        transferParams.recipientNameMaskedMessage = responseObject?.recipientNameMaskedMessage;
        transferParams.recipientNameMasked = responseObject?.recipientNameMasked;
        transferParams.actualAccHolderName = responseObject?.actualAccHolderName;
        transferParams.accHolderName = responseObject?.accountHolderName;
        transferParams.transferProxyRefNo = responseObject?.lookupReference;
        transferParams.idTypeText = proxyList[indexProxy?.indexAccount].idLabel;
        transferParams.idValueFormatted = accountNumberText;
        transferParams.idValue = transferParams.toAccount;
        transferParams.transferAccType = proxyIdType?.ACCT;
        transferParams.idType = proxyIdType?.ACCT;
        transferParams.swiftCode = selectedBank?.swiftCode;
        transferParams.reference = referenceText;
        transferParams.productInfo = selectedProduct;
        transferParams.primaryAccount = primaryAccount;
        transferParams.transferFlow = 25;
        transferParams.maxAmount = 50000.0;
        transferParams.maxAmountError = AMOUNT_ERROR_RTP;
        transferParams.minAmount = 0.0;
        transferParams.debtorAccountNumber = transferParams?.toAccount;
        transferParams.debtorName = responseObject?.accountHolderName || "";
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
        transferParams.imageBase64 = true;
        const params =
            selectedBank.bankCode === MBB_BANK_CODE
                ? {
                      ...transferParams,
                      functionsCode: 3,
                      transferTypeName: OTHER_ACCOUNT_TRN,
                      transactionMode: OTHER_ACCOUNT_TRN,
                      isMaybankTransfer: true,
                      receiptTitle: THIRD_PARTY_TRANSFER,
                      idCode: proxyList[indexProxy?.indexAccount].code,
                  }
                : {
                      ...transferParams,
                      functionsCode: 4,
                      transferTypeName: INTERBANK_TRN,
                      transactionMode: INTERBANK_TRN,
                      isMaybankTransfer: false,
                      receiptTitle: INSTANT_TRANSFER,
                      idCode: proxyIdType?.ACCT,
                      idType: proxyIdType?.ACCT,
                  };
        hideToast();
        const modParams = routeParams?.isEdit
            ? { ...routeParams?.transferParams, reference: referenceText }
            : params;
        props?.navigation?.navigate(REQUEST_TO_PAY_STACK, {
            screen: props?.route?.params?.transferParams?.isEditReference
                ? DUITNOW_DECOUPLED_REQUEST_CONFIRMATION_SCREEN
                : AMOUNT_TOGGLE_SCREEN,
            params: {
                ...routeParams,
                productList,
                transferParams: modParams,
                screenDate: routeParams?.screenDate,
                selectedProxy,
            },
        });
    }

    /***
     * _fundTransferInquiryApi
     * fund Transfer Inquiry Api call for Maybank casa account
     */
    async function _fundTransferInquiryApi(transferParams) {
        try {
            const params = {
                bankCode: selectedBank?.bankCode,
                fundTransferType: FUND_TRANSFER_TYPE_MAYBANK,
                toAccount: transferParams?.toAccount,
                payeeCode: transferParams?.toAccountCode,
                swiftCode: selectedBank?.swiftCode,
            };
            const response = await fundTransferInquiryApi(fundTransferInquirySubUrl, params);
            const responseObject = response?.data;
            if (responseObject?.accountHolderName) {
                commonParams(transferParams, responseObject);
            } else {
                showErrorToast({
                    message: INVALID_TRANSFER_DETAILS, // ACCOUNT_NUMBER_INVALID,
                });
            }
        } catch (error) {
            showErrorToast({
                message: error?.message ?? INVALID_TRANSFER_DETAILS, // ACCOUNT_NUMBER_INVALID,
            });
        }
    }

    /***
     * _fundTransferInquiryApiOthers
     * Other Bank Account Inquiry Api
     */
    async function _fundTransferInquiryApiOthers(transferParams) {
        try {
            const params = {
                bankCode: selectedBank?.bankCode,
                fundTransferType: FUND_TRANSFER_TYPE_INTERBANK,
                toAccount: transferParams?.toAccount,
                payeeCode: transferParams?.toAccountCode,
                swiftCode: selectedBank?.swiftCode,
                interbankPaymentType: transactionType?.TRANSFER,
            };
            const response = await fundTransferInquiryApi(fundTransferInquirySubUrl, params);
            const responseObject = response?.data;
            if (responseObject?.accountHolderName) {
                commonParams(transferParams, responseObject);
            } else {
                showErrorToast({
                    message: INVALID_TRANSFER_DETAILS, // ACCOUNT_NUMBER_INVALID,
                });
            }
        } catch (error) {
            showErrorToast({
                message: error?.message ?? INVALID_TRANSFER_DETAILS, // ACCOUNT_NUMBER_INVALID,
            });
        }
    }

    /***
     * _onTextInputValueChanged
     * on Account in put formate the account number and update state
     */
    function _onTextInputValueChanged(text) {
        const account = text ?? "";
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
            setShowLocalError(false);
            setAccountNumber(
                accountPasted?.length > accountNumberCorrectLength ? accountPasted : account
            );
            setAccountNumberText(
                account
                    .substring(0, accountNumberLength)
                    .replace(/[^\dA-Z]/g, "")
                    .replace(/(.{4})/g, "$1 ")
                    .trim()
            );
        } else {
            if (!account || account.length === 0) {
                setAccountNumberText("");
                setAccountNumber("");
            }
        }
    }

    const valueLength = selectedProxy?.minLength + idValue?.split(" ").length - 1 ?? 0;

    const isSubmitDisble =
        (selectedProxy?.name && !selectedProxy?.name?.length) ||
        (selectedProduct?.productName && !selectedProduct?.productName?.length) ||
        (primaryAccount?.name && !primaryAccount?.name?.length) ||
        !referenceText ||
        referenceText?.length < 3 ||
        idValue?.length < valueLength ||
        (selectedProxy?.code === "PSPT" && !selectedCountry);

    return (
        <ScreenContainer
            backgroundType="color"
            showLoaderModal={showLoaderModal}
            errorMessage={errorMessage}
            showOverlay={false}
            backgroundColor={MEDIUM_GREY}
        >
            {!showLoaderModal && (
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerCenterElement={
                                <Typography
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={19}
                                    text={REQUEST_TO_PAY}
                                />
                            }
                            headerLeftElement={<HeaderBackButton onPress={_onBackPress} />}
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
                                                    getFormatedAccountNumber(
                                                        primaryAccount?.number
                                                    ) ?? ""
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
                                                disable={
                                                    props?.route?.params?.transferParams
                                                        ?.isEditReference
                                                }
                                                hideCaret={
                                                    props?.route?.params?.transferParams
                                                        ?.isEditReference
                                                }
                                                title={selectedProxy?.name ?? PLEASE_SELECT}
                                                align="left"
                                                borderWidth={0.5}
                                                testID="txtSELECT_RL"
                                                accessibilityLabel="txtSELECT_RZ"
                                                onPress={_onShowIDDropdownPress}
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
                                                        text={RECIPIENT_BANK_WALLET}
                                                    />
                                                </View>
                                                <View style={styles.contoryContainer}>
                                                    <Dropdown
                                                        title={selectedBank?.name ?? PLEASE_SELECT}
                                                        disable={
                                                            props?.route?.params?.transferParams
                                                                ?.isEditReference
                                                        }
                                                        hideCaret={
                                                            props?.route?.params?.transferParams
                                                                ?.isEditReference
                                                        }
                                                        align="left"
                                                        iconType={1}
                                                        textLeft={true}
                                                        testID="txtSELECT_RL"
                                                        accessibilityLabel="txtSELECT_RZ"
                                                        borderWidth={0.5}
                                                        onPress={_onBankClick}
                                                    />
                                                </View>
                                                {selectedBank?.name ? (
                                                    <>
                                                        <View
                                                            style={
                                                                styles.descriptionContainerAmount
                                                            }
                                                        >
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
                                                                onChangeText={
                                                                    _onTextInputValueChanged
                                                                }
                                                                value={accountNumberText}
                                                                isValidate={showLocalError}
                                                                errorMessage={showLocalErrorMessage}
                                                                clearButtonMode="while-editing"
                                                                returnKeyType="done"
                                                                placeholder={
                                                                    ACCOUNT_NUMBER_PLACEHOLDER
                                                                }
                                                                autoFocus
                                                                editable={
                                                                    !props?.route?.params
                                                                        ?.transferParams
                                                                        ?.isEditReference
                                                                }
                                                            />
                                                        </View>
                                                    </>
                                                ) : null}
                                            </View>
                                        ) : null}
                                        {selectedProxy?.code ===
                                        proxyList[indexProxy?.indexMBNO]?.code ? (
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
                                                            onChangeText={_onIdTextChange}
                                                            editable={
                                                                !props?.route?.params
                                                                    ?.transferParams
                                                                    ?.isEditReference
                                                            }
                                                            returnKeyType="done"
                                                            placeholder={ENTERMOBILE_NUMBER}
                                                        />
                                                    </View>
                                                    <View style={styles.mobileNumberView2}>
                                                        <TouchableOpacity onPress={selectContact}>
                                                            <Image
                                                                accessible={true}
                                                                testID="imgWalNext"
                                                                accessibilityLabel="imgWalNext"
                                                                style={
                                                                    styles.mobileNumberSelectView
                                                                }
                                                                source={images.icContactList}
                                                            />
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>
                                            </View>
                                        ) : null}

                                        {selectedProxy?.code ===
                                            proxyList[indexProxy?.indexNRIC]?.code && (
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
                                                        onChangeText={_onIdTextChange}
                                                        editable={
                                                            !props?.route?.params?.transferParams
                                                                ?.isEditReference
                                                        }
                                                        returnKeyType="done"
                                                    />
                                                </View>
                                            </View>
                                        )}
                                        {selectedProxy?.code ===
                                        proxyList[indexProxy?.indexPassport]?.code ? (
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
                                                            selectedCountry?.type ?? SELECT_COUNTRY
                                                        }
                                                        disable={
                                                            props?.route?.params?.transferParams
                                                                ?.isEditReference
                                                        }
                                                        hideCaret={
                                                            props?.route?.params?.transferParams
                                                                ?.isEditReference
                                                        }
                                                        align="left"
                                                        iconType={1}
                                                        textLeft={true}
                                                        testID="txtSELECT_RL"
                                                        accessibilityLabel="txtSELECT_RZ"
                                                        borderWidth={0.5}
                                                        onPress={_onCountryClick}
                                                    />
                                                </View>
                                            </View>
                                        ) : null}
                                        {selectedProxy?.code ===
                                            proxyList[indexProxy?.indexPassport]?.code ||
                                        selectedProxy?.code ===
                                            proxyList[indexProxy?.indexArmyPolice]?.code ||
                                        selectedProxy?.code ===
                                            proxyList[indexProxy?.indexBRN]?.code ? (
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
                                                        editable={
                                                            !props?.route?.params?.transferParams
                                                                ?.isEditReference
                                                        }
                                                        onChangeText={_onIdTextChange}
                                                        autoFocus={true}
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
                                            text={RECIPIENT_REFERENCE}
                                        />
                                    </View>

                                    <View style={[styles.amountViewTransfer, styles.mb40]}>
                                        <TextInput
                                            maxLength={20}
                                            accessibilityLabel="inputReference"
                                            isValidate={showReferenceError}
                                            errorMessage={showReferenceErrorMsg}
                                            onSubmitEditing={_onTextDone}
                                            value={referenceText}
                                            onChangeText={_onTextChange}
                                            clearButtonMode="while-editing"
                                            returnKeyType="done"
                                            editable={true}
                                            placeholder={REFERENCE_NUMBER_PLACEHOLDER}
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
                            onPress={_OnSubmit}
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
            )}
            <ScrollPickerView
                showMenu={proxyTypeDropView}
                list={proxyList}
                selectedIndex={selectedIDTypeIndex}
                onRightButtonPress={_onProxyTypeRightButtonModePress}
                onLeftButtonPress={_onProxyTypeLeftButtonModePress}
                rightButtonText={DONE}
                leftButtonText={CANCEL}
            />
            <ScrollPickerView
                showMenu={countryView}
                list={countryList}
                onRightButtonPress={_onCountryRightButtonPress}
                onLeftButtonPress={_onCountryLeftButtonPress}
                rightButtonText={DONE}
                leftButtonText={CANCEL}
            />
            <ScrollPickerView
                showMenu={bankView}
                list={mbbBanksList}
                selectedIndex={selectedBankIndex}
                onRightButtonPress={_onBankRightButtonPress}
                onLeftButtonPress={_onBankRightLeftButtonPress}
                rightButtonText={DONE}
                leftButtonText={CANCEL}
            />
        </ScreenContainer>
    );
}

DuitnowRequestDetailScreen.propTypes = {
    getModel: PropTypes.func,
    route: PropTypes.object,
    navigation: PropTypes.object,
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

export default withModelContext(DuitnowRequestDetailScreen);
