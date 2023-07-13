import NetInfo from "@react-native-community/netinfo";
import moment from "moment";
import numeral from "numeral";
import PropTypes from "prop-types";
import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import DeviceInfo from "react-native-device-info";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import { OverseasProductRateCard } from "@components/Cards/OverseasProductRateCard";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Popup from "@components/Popup";
import Typo from "@components/TextWithInfo";
import { showErrorToast, showInfoToast } from "@components/Toast";

import { withModelContext } from "@context";

import {
    bakongWalletInquiry,
    getDateValidate,
    getOverseasPurpose,
    getSenderDetails,
    validateVDCardNumber,
} from "@services";
import { RemittanceAnalytics } from "@services/analytics/analyticsRemittance";

import { MEDIUM_GREY, YELLOW, DISABLED, DISABLED_TEXT, BLACK } from "@constants/colors";
import {
    COUNTRY_LIST_WITH_CODE,
    VISA_COUNTRY_CODES,
    OVERSEAS_WU_SENDER_ID_TYPE_LIST,
    OVERSEAS_WU_SENDER_OCCUPATION_LIST,
} from "@constants/data/Overseas";
import {
    AGENT_BANK_FEE,
    AGENT_BANK_FEE_DESC,
    COMMON_ERROR_MSG,
    DAILY_TRANSFER_LIMIT,
    FTT, // FTT_OFFICIAL_HOURS,
    // FTT_QUOTA_FINISH,
    MOT,
    OVERSEAS_TRANSFER_HEADER,
    PROCEED,
    RECEIVE_METHOD,
    REMITTANCE_DOWN,
    SOLE_PROP_NOT_ELIGIBLE,
    TRANSFER_DURATION,
    VISA_DIRECT,
    WESTERN_UNION,
    WE_FACING_SOME_ISSUE,
    DATE_TIME_FORMAT1,
    DATE_TIME_FORMAT2,
    DATE_TIME_FORMAT3,
    DD_MMM_YYYY,
} from "@constants/strings";

import { formatBakongMobileNumbers, getDeviceRSAInformation } from "@utils/dataModel/utility";
import {
    parseSenderInfo,
    uidGenerator,
    getCountryDataByName,
    resetContext,
} from "@utils/dataModel/utilityRemittance";
import { errorCodeMap } from "@utils/errorMap";

function OverseasProductListScreen({ navigation, route, getModel, updateModel, resetModel }) {
    useEffect(() => {
        RemittanceAnalytics.productSelectionLoaded();
    }, []);
    const [internetAvailable, setNetworkInfo] = useState(true);
    useEffect(() => {
        NetInfo.addEventListener((state) => {
            setNetworkInfo(state?.isConnected);
        });
    }, [internetAvailable]);
    const { overseasRateInquiry, transferParams, apiParams, showVdInput } = route?.params || {};
    const { selectedCountry, productsActive, bankList } = getModel("overseasTransfers");
    const { deviceInformation, deviceId } = getModel("device");
    const [productList, setProductList] = useState(overseasRateInquiry);
    const [cardText, setVdCardText] = useState("");
    const [vdCardSelected, selectVDCard] = useState(false);
    const [trxInfo, setTrxInfo] = useState(null);
    const [popupInfo, setPopupInfo] = useState({ infoMessage: "", infoTitle: "" });
    const [isEligible, setEligible] = useState(true);
    const { favTransferItem, favourite } = transferParams || {};
    const favItem = favourite && favTransferItem;
    const beneInfo = favTransferItem?.responseObject?.beneInfo;
    const funderInfo = favTransferItem?.responseObject?.senderInfo;
    const senderNationalityWU =
        funderInfo?.senderNationality?.toUpperCase() === "MALAYSIA" ||
        funderInfo?.senderNationality?.toUpperCase() === "M"
            ? "M"
            : "NM";
    const senderNationality = funderInfo?.senderNationality === "1" ? "M" : "NM";
    const favData = favTransferItem?.responseObject;
    const transferToCountry =
        favTransferItem?.responseObject?.transferToCountry ||
        favTransferItem?.responseObject?.countryDesc;
    const beneficiaryNationality =
        transferToCountry ||
        beneInfo?.beneIdIssueCountry ||
        favTransferItem?.responseObject?.nationalityDesc;
    const loadingRef = useRef(false);
    const mobileSDKData = getDeviceRSAInformation(deviceInformation, DeviceInfo, deviceId);
    async function getNetwork() {
        NetInfo.fetch().then(async (networkInfo) => {
            setNetworkInfo(networkInfo?.isConnected);
            return networkInfo?.isConnected;
        });
    }

    function handleClose() {
        navigation.goBack();
    }

    async function getSenderInfo(isFtt) {
        try {
            const response = await getSenderDetails();
            console.info("getSenderDetails -> ", response?.data);
            const { statusDesc } = response?.data;
            if (response?.data?.addr1) {
                const MAX_ADDRESS_LENGTH = isFtt ? 40 : 35;
                const { addressOne, addressTwo, pCode, addState } = parseSenderInfo(
                    response?.data,
                    MAX_ADDRESS_LENGTH
                );
                const { phoneNo, nationality } = response?.data;
                return {
                    addressLineOne: addressOne?.replace(/^[^a-zA-Z0-9\s]|^\s/, "")?.trim(),
                    addressLineTwo: addressTwo?.replace(/^[^a-zA-Z0-9\s]|^\s/, "")?.trim(),
                    postCode: pCode,
                    phoneNo,
                    mobile: phoneNo,
                    state: addState,
                    nationality: nationality ?? "",
                    isMalaysian: nationality === "MALAYSIA",
                    country: response?.data?.nationality,
                    birthDate: response?.data?.birthDate,
                };
            } else {
                showMsg(statusDesc);
            }
        } catch (ex) {
            console.info("getSenderDetails ex -> ", ex);
            const errObj = errorCodeMap(ex);
            console.info("getSenderDetails errObj -> ", errObj);
            showErrorToast({ message: errObj?.message ?? WE_FACING_SOME_ISSUE });
        }
    }

    function showMsg(msg) {
        if (msg) showErrorToast({ message: msg });
    }

    async function verifyAvailability(selectedItem = trxInfo) {
        const productActiveInd = productsActive;
        const wuDown = selectedItem?.productType === "WU" && productActiveInd?.wu === "N";
        const bkDown = selectedItem?.productType === "BK" && productActiveInd?.bk === "N";
        const rtDown = selectedItem?.productType === "RT" && productActiveInd?.rt === "N";
        const vdDown = selectedItem?.productType === "VD" && productActiveInd?.vd === "N";
        const fttDown = selectedItem?.productType === "FTT" && productActiveInd?.ftt === "N";
        // const fttBucketFull =
        //     selectedItem?.productType === "FTT" &&
        //     selectedItem?.dailyLimitInd === "N" &&
        //     selectedItem?.extendedHourFlag === "Y";
        const allDown = fttDown && bkDown && rtDown && wuDown && vdDown;
        // const getStatus = await getNetwork();
        if (internetAvailable) {
            const mesageDown =
                productActiveInd[selectedItem?.productType.toLowerCase() + "IndDesc"];

            if (allDown) {
                showInfoToast({
                    message: WE_FACING_SOME_ISSUE,
                });
                return;
            }

            if (wuDown || vdDown) {
                showInfoToast({
                    message: mesageDown || WE_FACING_SOME_ISSUE,
                });
                return true;
                // } else if (fttBucketFull || fttDown || bkDown || rtDown) {
            } else if (fttDown || bkDown || rtDown) {
                showInfoToast({
                    // message: fttBucketFull ? FTT_QUOTA_FINISH : mesageDown || REMITTANCE_DOWN,
                    message: mesageDown || REMITTANCE_DOWN,
                });
                return true;
            }
            // if (
            //     selectedItem?.productType === "FTT" &&
            //     selectedItem?.dailyLimitInd === "Y" &&
            //     selectedItem?.extendedHourFlag === "Y"
            // ) {
            //     setPopupInfo({
            //         isVisible: true,
            //         infoMessage: FTT_OFFICIAL_HOURS,
            //         infoTitle: "Transferring after working hours",
            //     });
            //     return;
            // }
            handleProceed();
        } else {
            getNetwork();
            showErrorToast({ message: "No internet connection. Please try again later." });
        }
    }

    async function checkDateValidate(isFtt) {
        const response = await getDateValidate();
        if (response?.status === 200) {
            const { paymentRefNo, productActiveInd } = response?.data;
            updateModel({
                overseasTransfers: {
                    trxId: uidGenerator("rmt", mobileSDKData),
                    paymentRefNo,
                },
            });

            return isFtt && productActiveInd?.ftt === "N";
        }
    }

    async function handleProceed() {
        if (!loadingRef.current) {
            await resetContext(getModel, updateModel, resetModel);
            const transferParams = {
                ...route.params?.transferParams,
                name: trxInfo?.productType,
                remittanceData: trxInfo,
            };
            const {
                cashMinTransactionLimit,
                creditMinTransactionLimit,
                amountInRM,
                cashMaxTransactionLimit,
                creditMaxTransactionLimit,
                receiveMethod,
                dailyLimit,
                fromCurrency,
                toCurrencyAmount,
            } = trxInfo;
            const isLimitValidationAllowed =
                (cashMinTransactionLimit && cashMaxTransactionLimit) ||
                (creditMinTransactionLimit && creditMaxTransactionLimit);
            if (isLimitValidationAllowed) {
                const trxLimit = parseFloat(dailyLimit);
                const minLimit = parseFloat(
                    receiveMethod === "Cash"
                        ? cashMinTransactionLimit.replace(",", "")
                        : creditMinTransactionLimit.replace(",", "")
                );
                const maxLimit = parseFloat(
                    receiveMethod === "Cash"
                        ? cashMaxTransactionLimit.replace(",", "")
                        : creditMaxTransactionLimit.replace(",", "")
                );
                const currentAmt = parseFloat(
                    fromCurrency !== "MYR" ? toCurrencyAmount : amountInRM
                );
                if (currentAmt > maxLimit) {
                    setEligible(false);
                    showInfoToast({
                        message:
                            "Transfer amount exceeeded daily limit. Please input value lower than RM " +
                            numeral(maxLimit).format("0,0.00"),
                    });
                    return;
                } else if (
                    trxInfo?.productType === "BK" &&
                    ((fromCurrency === "USD" && parseFloat(amountInRM) < 0.01) ||
                        (fromCurrency === "MYR" && currentAmt < minLimit))
                ) {
                    showInfoToast({
                        message:
                            "The minimum amount for this transaction is RM " +
                            numeral(minLimit).format("0,0.00") +
                            " or USD 0.01",
                    });
                    return;
                } else if (trxInfo?.productType !== "BK" && currentAmt < minLimit) {
                    setEligible(false);

                    // if (trxInfo?.productType !== "BK") {
                    showInfoToast({
                        message:
                            "Minimum transaction amount is RM " +
                            numeral(minLimit).format("0,0.00"),
                    });

                    return;
                } else if (currentAmt > trxLimit) {
                    setEligible(false);
                    showInfoToast({
                        message:
                            "Daily transaction limit exceeded. Kindly change your limit in Maybank2u to proceed.",
                    });
                    return;
                }
            }

            if (parseFloat(trxInfo?.toCurrencyAmount, 10) === 0.0) {
                return;
            }

            if (
                (fromCurrency === "JPY" || fromCurrency === "IDR") &&
                !amountInRM.endsWith(".00") &&
                !amountInRM.endsWith(".0")
            ) {
                showErrorToast({
                    message: `Please enter amount without decimal amount. EXAMPLE: ${fromCurrency} 1000 not ${fromCurrency} 1000.5`,
                });
                return;
            }
            await checkDateValidate();
            const senderData =
                favItem && funderInfo?.senderAddress1 && funderInfo?.senderNationality
                    ? {}
                    : await getSenderInfo(trxInfo?.productType === "FTT");
            const contactOfSender =
                favItem && funderInfo
                    ? funderInfo?.senderContactNo || funderInfo?.senderMobileNo
                    : senderData?.phoneNo;
            if (!favItem && !funderInfo) {
                if (senderData?.addressLineOne) {
                    updateModel({
                        overseasTransfers: {
                            OverseasSenderDetails: senderData,
                        },
                    });
                } else {
                    // showErrorToast({ message: WE_FACING_SOME_ISSUE });
                    return;
                }
            }
            setEligible(true);
            RemittanceAnalytics.productSelected(getName(trxInfo?.productType));
            if (trxInfo?.productType === "BK") {
                if (favItem) {
                    proceedFavBakong(senderData, contactOfSender);
                } else {
                    navigation.navigate("BakongEnterMobileNumber", {
                        transferParams: { ...transferParams },
                        name: trxInfo?.productType,
                        remittanceData: trxInfo,
                    });
                    return;
                }
            } else if (trxInfo?.productType === "VD") {
                const { fullName, firstName, secondName, lastName } = beneInfo || {};
                const cardHolderFullName1 =
                    firstName && secondName && secondName !== firstName
                        ? `${secondName} ${firstName}`
                        : fullName || firstName;
                const cardFirstName = String(firstName).split(" ");
                const cardLastName = String(secondName ?? lastName).replace("undefined", "");
                const cardHolderFullName2 =
                    !cardLastName && cardFirstName?.length > 1
                        ? `${cardFirstName[1]} ${cardFirstName[0]}`
                        : `${cardLastName} ${cardFirstName}`;
                const cardHolderFullName =
                    cardHolderFullName1 || favTransferItem?.responseObject?.custName
                        ? cardHolderFullName1 ||
                          String(favTransferItem?.responseObject?.custName).replace("null", "")
                        : cardHolderFullName2;
                const recipientCardDetailsObj = {
                    cardNumber: beneInfo?.beneId.replace(/\s/g, ""),
                    cardHolderFullName,
                    bankName: beneInfo?.bankInfo?.bankName,
                    cardHolderFirstName: !cardLastName ? cardFirstName[0] : beneInfo?.firstName,
                    cardHolderLastName: !cardLastName
                        ? cardFirstName[1]
                        : secondName || cardFirstName[0],
                };

                updateModel({
                    overseasTransfers: {
                        VDRecipientDetails: recipientCardDetailsObj,
                    },
                });

                const params = favItem
                    ? {
                          transferParams: { ...transferParams },
                          name: trxInfo?.productType,
                          remittanceData: {
                              ...trxInfo,
                              cardNumber: favTransferItem?.responseObject?.beneInfo?.beneId,
                              issuerName:
                                  favTransferItem?.responseObject?.beneInfo?.bankInfo?.bankName,
                          },
                      }
                    : {
                          transferParams: { ...transferParams },
                          name: trxInfo?.productType,
                          remittanceData: {
                              ...trxInfo,
                              cardNumber: trxInfo?.cardNumber,
                              issuerName: trxInfo?.issuerName,
                          },
                      };
                if (favourite) navigation.navigate("VDConfirmation", params);
                else navigation.navigate("VDRecipientDetails", params);
                return;
            } else if (trxInfo?.productType === "FTT" || trxInfo?.productType === "WU") {
                const commonData = {
                    ...transferParams,
                    name: trxInfo?.productType,
                    remittanceData: trxInfo,
                };
                if (favItem) {
                    if (trxInfo?.productType === "FTT") {
                        proceedFavFtt(commonData, contactOfSender, senderData);
                    } else {
                        proceedFavWU(senderData, commonData, contactOfSender, apiParams);
                    }
                    return;
                }
                navigation.navigate(
                    trxInfo?.productType === "FTT"
                        ? "OverseasSenderDetails"
                        : "OverseasPrequisites",
                    {
                        transferParams: commonData,
                        name: trxInfo?.productType,
                        remittanceData: trxInfo,
                        apiParams,
                        headerTitle: trxInfo?.productType === "FTT" ? null : "Western Union",
                        isFtt: trxInfo?.productType === "FTT",
                    }
                );
                return;
            }
            if (trxInfo?.productType === "RT") {
                if (favItem) {
                    await proceedFavRT(contactOfSender, senderData);
                    return;
                }
                navigation.navigate("OverseasPrequisites", {
                    transferParams,
                    name: trxInfo?.productType,
                    remittanceData: trxInfo,
                    headerTitle: MOT,
                });
            }
        }
    }
    function getCountryData(countryInfo) {
        const country = COUNTRY_LIST_WITH_CODE.filter((countryData) => {
            return countryData?.name === countryInfo?.toUpperCase();
        });
        return {
            countryName: country[0]?.name,
            countryCode: country[0]?.code,
        };
    }

    async function proceedFavBakong(senderData, contactOfSender) {
        const senderOrigin = funderInfo?.senderCountry || senderData?.nationality;
        const senderOriginData = !senderOrigin ? await getSenderInfo() : null;
        const bauBakongNationality = senderData?.isMalaysian ? "M" : "NM";
        const bkSenderNationality =
            favItem && funderInfo?.senderNationality
                ? senderNationality
                : senderData?.isMalaysian || senderOriginData?.isMalaysian
                ? "M"
                : "NM";
        const specialBitValue = favTransferItem?.responseObject?.specialBitValue;
        const isBAUBakong = favData?.mobileNum && favData?.countryDesc;
        const response = await getOverseasPurpose({
            senderNationality: bkSenderNationality !== "M" ? "N" : "M",
            beneNationality: beneficiaryNationality.toLowerCase() !== "malaysia" ? "N" : "M",
        });
        const listOfPurpose = response?.data?.bakongPurposeCodeList;
        if (!listOfPurpose?.length) {
            showErrorToast({ message: COMMON_ERROR_MSG });
            return;
        }
        const beneCountry = getCountryData(beneInfo?.addressInfo?.country || favData?.countryDesc);
        const funderCountry = getCountryData(
            funderInfo?.senderCountry || senderData?.nationality || senderOriginData?.nationality
        );
        const list = ["Transfer", "Goods", "Services", "Investment"];
        const filteredBakongList = listOfPurpose
            .map((bkPurpose) => {
                return { ...bkPurpose, index: list.indexOf(bkPurpose?.serviceName) };
            })
            .sort((a, b) => {
                if (a?.index < b?.index) {
                    return -1;
                }
                if (b?.index > a?.index) {
                    return 1;
                }
                return 0;
            });
        updateModel({
            overseasTransfers: {
                purposeCodeLists: filteredBakongList,
                BakongMobileNo: beneInfo?.contactNo || favData?.mobileNum,
                BakongRecipientIDDetails: {
                    idIssueCountry: {
                        countryName: beneficiaryNationality,
                        countryCode: COUNTRY_LIST_WITH_CODE.filter((countyData) => {
                            return countyData?.name === beneficiaryNationality.toUpperCase();
                        })[0]?.code,
                    },
                    nationality: beneficiaryNationality.toLowerCase() !== "malaysia" ? "NM" : "M",
                    idType: specialBitValue,
                    icPassportNumber: beneInfo?.beneId || favData?.idNum,
                    screenData: {
                        image: { imageName: "icBakong" },
                        name: beneInfo?.fullName || favData?.regName,
                        description1:
                            "+" +
                            formatBakongMobileNumbers(beneInfo?.contactNo || favData?.mobileNum),
                        description2: "Cambodia (Bakong Wallet)",
                    },
                },
                BKRecipientDetails: {
                    name: beneInfo?.fullName || favData?.regName,
                    addressLineOne: beneInfo?.addressInfo?.address1 || favData?.address1,
                    addressLineTwo: beneInfo?.addressInfo?.address2 || favData?.address2,
                    country: { ...beneCountry },
                    addressCountry: { ...beneCountry },
                },
                BKSenderDetails: {
                    nationality: favTransferItem?.responseObject?.nationalityDesc
                        ? bauBakongNationality
                        : senderNationality,
                    addressLineOne:
                        funderInfo?.senderAddress1 ??
                        senderData?.addressLineOne ??
                        senderOriginData?.addressLineOne,
                    addressLineTwo:
                        funderInfo?.senderAddress2 ??
                        senderData?.addressLineTwo ??
                        senderOriginData?.addressLineTwo,
                    country:
                        senderData?.nationality === "MALAYSIA" ? "M" : "NM" || senderNationality,
                    countryName: funderCountry?.countryName,
                    countryCode: funderCountry?.countryCode,
                    mobileNumber: contactOfSender,
                    phoneNo: contactOfSender,
                },
                BKTransferPurpose: {
                    transferPurpose: {},
                    transferSubPurpose: {},
                    relationShipStatus: "",
                    additionalInfo: "",
                    purposePlaceHolder: "",
                    relationshipSelectedIndex: 0,
                    relationshipPlaceHolder: "",
                    subPurposePlaceHolder: "",
                    transferPurposeList: [],
                    transferPurposeIndex: 0,
                    transferSubPurposeList: [],
                    transferSubPurposeIndex: 0,
                },
            },
        });

        const respWalletInquiry = isBAUBakong
            ? await bakongWalletInquiry({
                  mobileNo: favData?.mobileNum.replace("+", ""),
              })
            : {};
        navigation.navigate("BakongTransferPurposeDetails", {
            ...route?.params,
            transferParams: {
                ...transferParams,
                isBAUBakong,
                mobileNo: isBAUBakong
                    ? favData?.mobileNum
                    : beneInfo?.contactNo,
                transactionTo: "Bakong Wallet",
                inquiryData: {
                    phone: isBAUBakong
                        ? favData?.mobileNum
                        : beneInfo?.contactNo,
                    accountId: beneInfo?.acctNo,
                    name: beneInfo?.fullName,
                    bankName: beneInfo?.bankInfo?.bankName,
                    ...respWalletInquiry?.data,
                },
            },
            name: trxInfo?.productType,
            remittanceData: trxInfo,
        });
    }

    async function proceedFavFtt(commonData, contactOfSender, senderData) {
        const specialBit = favTransferItem?.responseObject?.specialBit;
        const specialBitValue = favTransferItem?.responseObject?.specialBitValue;
        const specialBitData = getSpecialBitType(
            specialBit,
            specialBitValue,
            transferToCountry.toUpperCase()
        );
        const fttBeneCountry = getCountryData(beneInfo?.addressInfo?.country);
        const fttSenderCountry = getCountryData(funderInfo?.senderCountry);
        const senderCitizenship = funderInfo.senderNationality
            ? senderNationality
            : senderData?.isMalaysian
            ? "M"
            : "NM";
        const isBeneMalaysianVal =
            beneInfo?.isBeneMalaysian === "1" || beneInfo?.isBeneMalaysian === "M" ? "M" : null;
        const response = await getOverseasPurpose({
            senderNationality: senderCitizenship === "NM" ? "N" : senderCitizenship,
            beneNationality: isBeneMalaysianVal ?? "N",
        });
        if (response) {
            const { residentList, nonResidentList, wuPurposeCodeList } = response?.data || {};
            const purposeCodeLists = residentList?.length > 0 ? residentList : nonResidentList;
            const bicCode = beneInfo?.bankInfo?.bankName;
            const beneCountryCode = getCountryData(beneficiaryNationality)?.countryCode;
            const selectedBankList =
                beneCountryCode === "JP" || beneCountryCode === "SG"
                    ? bankList?.filter((bankDataInfo) => {
                          return bankDataInfo?.countryCode === beneCountryCode;
                      })
                    : [];
            const countryBankData = selectedBankList?.length
                ? selectedBankList[0]?.bankList?.filter((countryBank) => {
                      return countryBank?.value === bicCode;
                  })
                : null;
            updateModel({
                overseasTransfers: {
                    purposeCodeLists:
                        trxInfo?.productType === "FTT" ? purposeCodeLists : wuPurposeCodeList,
                    FTTRecipientDetails: {
                        name: beneInfo?.fullName,
                        icPassportNumber: beneInfo?.beneId,
                        idNumber: beneInfo?.beneId,
                        addressLineOne: beneInfo?.addressInfo?.address1,
                        addressLineTwo: beneInfo?.addressInfo?.address2,
                        country: { ...fttBeneCountry },
                        email: beneInfo?.email,
                        mobileNumber: beneInfo?.contactNo,
                        nationality: beneInfo?.isBeneMalaysian !== "0" ? "M" : "NM",
                        selectedIDType: {
                            name: beneInfo?.beneIdIssueCountry?.length ? "Passport" : "National ID",
                            value: beneInfo?.beneIdIssueCountry?.length ? "PSPT" : "NATIONAL_ID",
                        },
                    },
                    FTTRecipientBankDetails: {
                        accountNumber: beneInfo?.acctNo,
                        selectedBank: {
                            name: beneInfo?.bankInfo?.bankName,
                        },
                        bankName: countryBankData?.length
                            ? countryBankData[0]?.name
                            : beneInfo?.bankInfo?.bankName,
                        swiftCode: countryBankData?.length
                            ? countryBankData[0]?.value
                            : beneInfo?.beneIcCode,
                        ...specialBitData,
                        branchAddress: beneInfo?.bankInfo?.bankAddress,
                        city: beneInfo?.bankInfo?.bankCity,
                    },
                    FTTSenderDetails: {
                        nationality: senderCitizenship,
                        addressLineOne: funderInfo?.senderAddress1,
                        addressLineTwo: funderInfo?.senderAddress2,
                        country: fttSenderCountry?.countryName,
                        countryName: fttSenderCountry?.countryName,
                        countryCode: fttSenderCountry?.countryCode,
                        mobileNumber: contactOfSender,
                        phoneNo: contactOfSender,
                        postCode: funderInfo?.senderPostcode,
                    },
                },
            });
        }
        navigation.navigate("FTTTransferDetails", {
            transferParams: commonData,
            name: trxInfo?.productType,
            remittanceData: trxInfo,
        });
    }

    async function proceedFavWU(senderData, commonData, contactOfSender, apiParams) {
        const { mobileNumber, birthDate } = getModel("user");
        const response = await getOverseasPurpose({
            senderNationality: senderNationality !== "M" ? "N" : senderNationality,
            beneNationality: beneInfo?.isBeneMalaysian !== "M" ? "N" : beneInfo?.isBeneMalaysian,
        });
        if (response?.data?.wuPurposeCodeList?.length) {
            // const fttBeneCountry = getCountryData(beneInfo?.addressInfo?.country);
            const fttSenderCountry = getCountryData(
                funderInfo?.senderCountry || senderData?.nationality
            );

            const senderId_type = OVERSEAS_WU_SENDER_ID_TYPE_LIST.filter((item) => {
                const ICType = funderInfo?.senderIdType.replace("NATIONAL_ID", "National ID Card");
                return funderInfo?.senderIdType === item?.name || ICType === item?.name;
            });
            const recipDob = moment(beneInfo?.dob, [DATE_TIME_FORMAT2, DATE_TIME_FORMAT3]).format(
                DD_MMM_YYYY
            );
            const firstNameOfSender = (
                funderInfo?.firstName || funderInfo?.senderFirstName
            )?.trim();
            const lastNameOfSender = (
                funderInfo?.secondName || funderInfo?.senderSecondName
            )?.trim();
            const wuOccupationData = OVERSEAS_WU_SENDER_OCCUPATION_LIST.filter((wuOccupation) => {
                return (
                    wuOccupation?.name === funderInfo?.senderOccupation ||
                    wuOccupation?.value === funderInfo?.senderOccupation
                );
            });
            updateModel({
                overseasTransfers: {
                    purposeCodeLists: response?.data?.wuPurposeCodeList,
                    WURecipientDetails: {
                        name:
                            beneInfo?.firstName === beneInfo?.secondName
                                ? beneInfo?.firstName
                                : `${beneInfo?.firstName} ${beneInfo?.secondName}`,
                        firstName: beneInfo?.firstName,
                        lastName: beneInfo?.secondName,
                        dateOfBirth: recipDob,
                        displayDateOfBirth: recipDob,
                        addressLineOne: beneInfo?.addressInfo?.address1,
                        addressLineTwo: beneInfo?.addressInfo?.address2,
                        country: beneInfo?.addressInfo?.country,
                        state: beneInfo?.addressInfo?.state,
                        postCode: beneInfo?.addressInfo?.postcode,
                        email: beneInfo?.email,
                        mobileNumber: beneInfo?.contactNo,
                        nationality: beneInfo?.isBeneMalaysian
                            ? beneInfo?.isBeneMalaysian !== "0"
                                ? "M"
                                : "NM"
                            : beneInfo?.addressInfo?.country,
                        countryForCode: getCountryData(beneInfo?.addressInfo?.country),
                        selectedIDType: {
                            name: beneInfo?.beneIdNum ? beneInfo?.idType : null,
                            value: beneInfo?.beneIdNum ? beneInfo?.idType : null,
                        },
                        idNumber: beneInfo?.beneIdNum,
                        city: beneInfo?.addressInfo?.city,
                        countryForName: getCountryData(beneInfo?.addressInfo?.country),
                    },
                    WUSenderDetailsStepTwo: {
                        tempAddressLineOne: funderInfo?.senderCurrentAddressLine1,
                        tempAddressLineTwo: funderInfo?.senderCurrentAddressLine2,
                        postCode: funderInfo?.senderCurrentPostCode,
                        state: funderInfo?.senderCurrentStateName,
                        country: getCountryData(funderInfo?.senderCurrentCountry),
                    },
                    WUSenderDetailsStepOne: {
                        name:
                            firstNameOfSender === lastNameOfSender
                                ? firstNameOfSender
                                : `${firstNameOfSender} ${lastNameOfSender}`,
                        citizenship: senderNationalityWU,
                        nationality: senderNationality,
                        addressLineOne: funderInfo?.senderAddress1 ?? senderData?.addressLineOne,
                        addressLineTwo: funderInfo?.senderAddress2 ?? senderData?.addressLineTwo,
                        country: fttSenderCountry?.countryName || senderData?.country,
                        addressCountry: getCountryDataByName(
                            fttSenderCountry?.countryName || senderData?.country
                        ),
                        state:
                            funderInfo?.senderState ||
                            senderData?.state ||
                            funderInfo?.senderCurrentStateName,
                        city:
                            funderInfo?.senderCity ||
                            senderData?.city ||
                            senderData?.senderCurrentCity ||
                            senderData?.state,
                        countryName: funderInfo?.senderCountry ?? fttSenderCountry?.countryName,
                        countryCode: fttSenderCountry?.countryCode,
                        mobileCountryCode: funderInfo?.senderMobileCountryCode,
                        mobileNumber: funderInfo?.senderMobileNumber,
                        phoneNo: contactOfSender || senderData?.mobile || mobileNumber || "",
                        postCode: funderInfo?.senderPostcode ?? senderData?.postCode,
                        email: funderInfo?.senderEmail?.includes("@")
                            ? funderInfo?.senderEmail
                            : "",
                        isEmailPrepopulated: funderInfo?.senderEmail?.includes("@"),
                    },
                    WUSenderDetailsStepThree: {
                        idNumber: funderInfo?.senderId,
                        selectedIDType: senderId_type?.length ? senderId_type[0] : {},
                        selectedOccupation: { ...wuOccupationData[0] },
                        countryOfCitizenship: getCountryDataByName(
                            funderInfo?.senderNationality ||
                                funderInfo?.senderCurrentCountry ||
                                funderInfo?.senderIdIssueCountry
                        ),
                        selectedEmplPosLevel: {
                            name:
                                funderInfo?.senderEmploymentStatus ?? funderInfo?.senderEmpPostion,
                        },
                        selectedSourceOfFunds: {
                            name: funderInfo?.senderSourceOfFund,
                        },
                        countryOfBirth: getCountryDataByName(funderInfo?.senderCountryOfBirth),
                        idIssueCountry: getCountryDataByName(funderInfo?.senderIdIssueCountry),
                        idIssueDate: moment(funderInfo?.senderIdIssueDate, [
                            DATE_TIME_FORMAT1,
                        ]).format(DD_MMM_YYYY),
                        idExpiryDate: moment(funderInfo?.senderIdExpiryDate, [
                            DATE_TIME_FORMAT1,
                        ]).format(DD_MMM_YYYY),
                        selectedRelationToRecip: {
                            name: beneInfo?.senderBeneRelation?.replace(/[\_]/g, "/"),
                            value: "",
                        },
                        dateOfBirth: moment(funderInfo?.senderDob || birthDate, [
                            DD_MMM_YYYY,
                            DATE_TIME_FORMAT1,
                            DATE_TIME_FORMAT2,
                            DATE_TIME_FORMAT3,
                        ]).format(DD_MMM_YYYY),
                        displayDateOfBirth: moment(funderInfo?.senderDob || birthDate, [
                            DD_MMM_YYYY,
                            DATE_TIME_FORMAT1,
                            DATE_TIME_FORMAT2,
                            DATE_TIME_FORMAT3,
                        ]).format(DD_MMM_YYYY),
                    },
                },
            });

            navigation.navigate(
                funderInfo?.senderOccupation && funderInfo?.senderSourceOfFund
                    ? "WUTransferDetails"
                    : "WUSenderDetailsStepThree",
                {
                    favorite: true,
                    apiParams,
                    transferParams: { favorite: true, ...commonData },
                    name: trxInfo?.productType,
                    remittanceData: trxInfo,
                    WUSenderDetailsStepOne: {
                        name:
                            firstNameOfSender === lastNameOfSender
                                ? firstNameOfSender
                                : `${firstNameOfSender} ${lastNameOfSender}`,
                        citizenship: senderNationalityWU,
                        nationality: senderNationality,
                        addressLineOne: funderInfo?.senderAddress1 ?? senderData?.addressLineOne,
                        addressLineTwo: funderInfo?.senderAddress2 ?? senderData?.addressLineTwo,
                        country: fttSenderCountry?.countryName ?? senderData?.country,
                        state:
                            funderInfo?.senderState ||
                            funderInfo?.senderCurrentStateName ||
                            senderData?.state,
                        city: funderInfo?.senderCity || senderData?.city || senderData?.state,
                        countryName: funderInfo?.senderCountry ?? fttSenderCountry?.countryName,
                        countryCode: fttSenderCountry?.countryCode,
                        mobileCountryCode: funderInfo?.senderMobileCountryCode,
                        mobileNumber: funderInfo?.senderMobileNumber?.replace(/[^0-9]/g, ""),
                        phoneNo: contactOfSender ?? senderData?.mobile,
                        postCode: funderInfo?.senderPostcode ?? senderData?.postCode,
                        senderDOB: senderData?.birthDate,
                    },
                    WUSenderDetailsStepTwo: {
                        tempAddressLineOne: funderInfo?.senderCurrentAddressLine1,
                        tempAddressLineTwo: funderInfo?.senderCurrentAddressLine2,
                        postCode: funderInfo?.senderCurrentPostCode,
                        state: funderInfo?.senderCurrentStateName,
                        city: senderData?.senderCurrentCity,
                        country: funderInfo?.senderCurrentCountry
                            ? getCountryData(funderInfo?.senderCurrentCountry)
                            : "",
                    },
                    WUSenderDetailsStepThree: {
                        idNumber: funderInfo?.senderId,
                        selectedIDType: senderId_type?.length ? senderId_type[0] : {},
                        selectedOccupation: {
                            ...wuOccupationData[0],
                        },
                        countryOfCitizenship: getCountryDataByName(
                            funderInfo?.senderNationality ||
                                funderInfo?.senderCurrentCountry ||
                                funderInfo?.senderIdIssueCountry
                        ),
                        selectedEmplPosLevel: {
                            name: funderInfo?.senderEmploymentStatus,
                        },
                        selectedSourceOfFunds: {
                            name: funderInfo?.senderSourceOfFund,
                        },
                        countryOfBirth: getCountryDataByName(funderInfo?.senderCountryOfBirth),
                        idIssueCountry: getCountryDataByName(funderInfo?.senderIdIssueCountry),
                        idIssueDate: moment(funderInfo?.senderIdIssueDate, [
                            DATE_TIME_FORMAT1,
                        ]).format(DD_MMM_YYYY),
                        idExpiryDate: moment(funderInfo?.senderIdExpiryDate, [
                            DATE_TIME_FORMAT1,
                        ]).format(DD_MMM_YYYY),
                        selectedRelationToRecip: {
                            name: beneInfo?.senderBeneRelation?.replace(/[\_]/g, "/"),
                            value: "",
                        },
                        dateOfBirth: moment(funderInfo?.senderDob || birthDate, [
                            DD_MMM_YYYY,
                            DATE_TIME_FORMAT1,
                            DATE_TIME_FORMAT2,
                            DATE_TIME_FORMAT3,
                        ]).format(DD_MMM_YYYY),
                        displayDateOfBirth: moment(funderInfo?.senderDob || birthDate, [
                            DD_MMM_YYYY,
                            DATE_TIME_FORMAT1,
                            DATE_TIME_FORMAT2,
                            DATE_TIME_FORMAT3,
                        ]).format(DD_MMM_YYYY),
                    },
                }
            );
        }
    }

    async function proceedFavRT(contactOfSender, senderData) {
        const motSenderNationality = funderInfo.senderNationality
            ? senderNationality
            : senderData?.isMalaysian || funderInfo?.senderCountry === "MALAYSIA"
            ? "M"
            : "NM";

        const response = await getOverseasPurpose({
            senderNationality: motSenderNationality === "M" ? "M" : "N",
            beneNationality:
                beneInfo?.isBeneMalaysian !== "0" && beneInfo?.isBeneMalaysian !== "N" ? "M" : "N",
        });
        if (
            response?.data?.residentList?.length > 0 ||
            response?.data?.nonResidentList?.length > 0
        ) {
            const beneCountry = getCountryData(beneInfo?.addressInfo?.country);
            const funderCountry = getCountryData(funderInfo?.senderCountry);
            updateModel({
                overseasTransfers: {
                    purposeCodeLists:
                        response?.data?.residentList?.length > 0
                            ? response?.data?.residentList
                            : response?.data?.nonResidentList,
                    MOTRecipientDetails: {
                        name: beneInfo?.fullName,
                        icPassportNumber: beneInfo?.beneId,
                        addressLineOne: beneInfo?.addressInfo?.address1,
                        addressLineTwo: beneInfo?.addressInfo?.address2,
                        country: {
                            ...beneCountry,
                        },
                        email: beneInfo?.email,
                        mobileNumber: beneInfo?.contactNo,
                        nationality: beneInfo?.isBeneMalaysian !== "0" ? "M" : "NM",
                    },
                    MOTRecipientBankDetails: {
                        accountNumber: beneInfo?.acctNo,
                        selectedBank: {
                            name: beneInfo?.bankInfo?.bankName,
                        },
                        bankName: beneInfo?.bankInfo?.bankName,
                        swiftCode: beneInfo?.beneIcCode,
                    },
                    MOTSenderDetails: {
                        nationality: motSenderNationality,
                        addressLineOne: funderInfo?.senderAddress1,
                        addressLineTwo: funderInfo?.senderAddress2,
                        country: funderInfo?.senderCountry,
                        countryName: funderCountry?.countryName,
                        countryCode: funderCountry?.countryCode,
                        mobileNumber: contactOfSender,
                        phoneNo: contactOfSender,
                        postCode: funderInfo?.senderPostcode,
                    },
                    MOTTransferPurpose: {
                        transferPurpose: "",
                        transferSubPurpose: "",
                        relationShipStatus: "",
                    },
                },
            });
        }
        navigation.navigate("MOTTransferDetails", {
            transferParams,
            name: trxInfo?.productType,
            remittanceData: trxInfo,
            favorite: true,
        });
    }
    function handleSelection(index) {
        const { cus_type } = getModel("user");
        console.info("handleSelection -> ", index);
        // setVdCardText("");
        if (index === -1) {
            if (cus_type === "02") {
                showErrorToast({
                    message: SOLE_PROP_NOT_ELIGIBLE,
                });
                return;
            }
            selectVDCard(true);
            setTrxInfo(null);
            const currentList = productList.map((prodRateItem) => {
                return {
                    ...prodRateItem,
                    isSelected: false,
                };
            });
            setProductList(currentList);
            return;
        }
        selectVDCard(false);
        setEligible(true);

        const newList = productList.map((prodRateItem, itemIndex) => {
            return {
                ...prodRateItem,
                isSelected: itemIndex === index,
            };
        });

        const selectedItem = newList.filter((prodRateItem) => {
            return prodRateItem.isSelected;
        })[0];

        // if (selectedItem?.productType === "VD" && route?.params?.fromCurrency !== "MYR") {
        if (
            (selectedItem?.productType === "VD" || selectedItem?.productType === "WU") &&
            cus_type === "02"
        ) {
            showErrorToast({
                message: SOLE_PROP_NOT_ELIGIBLE,
            });
            return;
        }

        // const fttBucketFull =
        //     selectedItem?.productType === "FTT" &&
        //     selectedItem?.dailyLimitInd === "N" &&
        //     selectedItem?.extendedHourFlag === "Y";
        const rmAmt =
            selectedItem?.fromCurrency !== "MYR"
                ? selectedItem?.toCurrencyAmount
                : selectedItem?.amountInRM;
        setProductList(newList);
        const dailyLimit = parseFloat(String(selectedItem?.dailyLimit).replace(/,/g, ""));
        const amountInRM = parseFloat(String(rmAmt).replace(/,/g, ""));

        if (amountInRM > dailyLimit) {
            setEligible(false);
            showInfoToast({
                message:
                    "Transfer amount exceeded daily limit. Please input value lower than RM " +
                    numeral(dailyLimit).format("0,0.00"),
            });
            setTrxInfo({ ...selectedItem, isSelected: false });
        } else {
            const data =
                selectedItem?.productType === "VD"
                    ? {
                          ...selectedItem,
                          toCurrencyAmount: numeral(String(selectedItem?.toCurrencyAmount))
                              .format("0,0.00")
                              .replace(/\,/g, ""),
                          finalDestinationAmount: numeral(
                              String(selectedItem?.finalDestinationAmount)
                          )
                              .format("0,0.00")
                              .replace(/\,/g, ""),
                      }
                    : selectedItem;
            setTrxInfo(data);
        }
    }

    function onClosePopup() {
        setPopupInfo({ isVisible: false, infoMessage: "", infoTitle: "" });
    }

    function handleInfoPopup(item) {
        console.info("handleInfoPopup: ", item);
        const popUpDataRTFTT = {
            allowedProducts: ["BK", "FTT", "RT", "VD", "WU"],
            dailyLimit: {
                infoTitle: DAILY_TRANSFER_LIMIT,
                infoMessage:
                    item?.productType === "WU" || item?.productType === "VD"
                        ? "Maximum cumulative limit that you can transfer in a day."
                        : `Cumulative limit per day for all Maybank Overseas transfer and Foreign Telegraphic transactions.`,
            },
            agent_bank_fee: {
                infoTitle: AGENT_BANK_FEE,
                infoMessage: AGENT_BANK_FEE_DESC,
            },
            duration: {
                infoTitle: TRANSFER_DURATION,
                infoMessage: `The transfer duration in number of working days.`,
            },
        };
        const popUpDataWUVD = {
            allowedProducts: ["WU", "VD"],
            dailyLimit: {
                infoTitle: DAILY_TRANSFER_LIMIT,
                infoMessage: "Maximum cumulative limit that you can transfer in a day.",
            },
        };
        const popUpDataVD = {
            allowedProducts: ["VD"],
            text: {
                infoTitle: RECEIVE_METHOD,
                infoMessage: "The transfer amount will be creditedto the recipient's Visa Card.",
            },
            recipientCardNo: {
                infoTitle: "Recipient Card Number",
                infoMessage:
                    "Please ensure that the Recipient’s Card Number is entered correctly. There will be no refund/cancellation after the transaction is submitted.",
            },
        };
        const popUpDataWU = {
            allowedProducts: ["WU"],
            text: {
                infoTitle: RECEIVE_METHOD,
                infoMessage:
                    "The cash amount transferred can be collected at any authorised Western Union locations near you.",
            },
        };
        const popUpDataFTT = {
            allowedProducts: ["FTT"],
            text: {
                infoTitle: TRANSFER_DURATION,
                infoMessage: "The Transfer duration in number of days.",
            },
            beneFee: {
                infoTitle: AGENT_BANK_FEE,
                infoMessage: AGENT_BANK_FEE_DESC,
            },
        };
        if (
            popUpDataRTFTT?.allowedProducts.includes(item?.productType) &&
            popUpDataRTFTT[item?.type]?.infoTitle
        ) {
            setPopupInfo({
                isVisible: true,
                infoMessage: popUpDataRTFTT[item?.type]?.infoMessage,
                infoTitle: popUpDataRTFTT[item?.type]?.infoTitle,
            });
        } else if (
            popUpDataWUVD?.allowedProducts.includes(item?.productType) &&
            popUpDataWUVD[item?.type]?.infoTitle
        ) {
            setPopupInfo({
                isVisible: true,
                infoMessage: popUpDataWUVD[item?.type]?.infoMessage,
                infoTitle: popUpDataWUVD[item?.type]?.infoTitle,
            });
        } else if (
            popUpDataVD?.allowedProducts.includes(item?.productType) &&
            popUpDataVD[item?.type]?.infoTitle
        ) {
            setPopupInfo({
                isVisible: true,
                infoMessage: popUpDataVD[item?.type]?.infoMessage,
                infoTitle: popUpDataVD[item?.type]?.infoTitle,
            });
        } else if (
            popUpDataWU?.allowedProducts.includes(item?.productType) &&
            popUpDataWU[item?.type]?.infoTitle
        ) {
            setPopupInfo({
                isVisible: true,
                infoMessage: popUpDataWU[item?.type]?.infoMessage,
                infoTitle: popUpDataWU[item?.type]?.infoTitle,
            });
        } else if (
            popUpDataFTT?.allowedProducts.includes(item?.productType) &&
            popUpDataFTT[item?.type]?.infoTitle
        ) {
            setPopupInfo({
                isVisible: true,
                infoMessage: popUpDataFTT[item?.type]?.infoMessage,
                infoTitle: popUpDataFTT[item?.type]?.infoTitle,
            });
        }
    }
    function getName(name) {
        if (name === "RT") {
            return MOT;
        }
        if (name === "FTT") {
            return FTT;
        }
        if (name === "WU") {
            return WESTERN_UNION;
        }
        if (name === "VD") {
            return VISA_DIRECT;
        }
        return "Bakong Transfer";
    }
    function textChanged(text) {
        console.info("textChanged -> ", text);
        console.info("TextInput = ", text);
        setVdCardText(text.replace(/[^0-9]+/, ""));
    }

    async function vdInquiry() {
        try {
            const regexVisaCard = /4\d{12}(\d{3})?/g;
            if (regexVisaCard.test(cardText)) {
                const params = {
                    cardNo: cardText,
                };
                const response = await validateVDCardNumber(params);
                const isSuccess =
                    response?.data?.statusCode === "0000" || response?.data?.statusCode === 201;
                if (isSuccess) {
                    const countryData = VISA_COUNTRY_CODES.filter((visaCountryData) => {
                        return (
                            visaCountryData?.visaCode ===
                            String(response?.data?.cardIssuerCountryCode)
                        );
                    });
                    if (
                        countryData[0]?.countryName?.toUpperCase() !==
                            selectedCountry?.countryName?.toUpperCase() ||
                        selectedCountry?.countryCode !== countryData[0].countryCode2Char
                    ) {
                        showErrorToast({
                            message:
                                "Please input card number corresponding to your selected country",
                        });
                        return;
                    }
                    const vdCardData = productList.filter((productData) => {
                        return productData?.productType === "VD";
                    });
                    console.info("handleContinuePressed vdCardData ", vdCardData);
                    if (vdCardData?.length === 1) {
                        const vdData = {
                            ...vdCardData[0],
                            ...response?.data,
                            cardNumber: cardText,
                            productType: "VD",
                            hideCard: false,
                            // serviceFee: 10,
                            isSelected: false,
                            toCurrencyAmount: numeral(String(vdCardData[0]?.toCurrencyAmount))
                                .format("0,0.00")
                                .replace(/\,/g, ""),
                            finalDestinationAmount: numeral(
                                String(vdCardData[0]?.finalDestinationAmount)
                            )
                                .format("0,0.00")
                                .replace(/\,/g, ""),
                        };
                        navigation.setParams({ showVdInput: false });
                        setTrxInfo(null);
                        setProductList([...productList, vdData]);
                    }
                } else {
                    showInfoToast({
                        message:
                            response?.data?.statusDesc || "Please enter a valid Visa card number.",
                    });
                }
            } else {
                showInfoToast({ message: "Please enter a valid Visa card number." });
            }
        } catch (ex) {
            const errorStatus =
                ex?.error?.code ||
                ex?.error?.error?.code ||
                ex?.error?.error?.status ||
                ex?.error?.status ||
                ex?.error?.error?.status;
            console.info("handleContinuePressed ex ", ex);
            if (errorStatus === 400) {
                showInfoToast({
                    message:
                        ex?.error?.message || "Please enter an international Visa card number.",
                });
                return;
            }
            showErrorToast({
                message:
                    errorStatus === 500
                        ? WE_FACING_SOME_ISSUE
                        : ex?.error?.error?.message ?? ex?.error?.message,
            });
        }
    }

    function getSpecialBitType(code, specialBitValue, transferToCountry) {
        if (code === "IBAN_CODE" || code === "IBAN" || code === "IBAN CODE") {
            return {
                ibanCode: specialBitValue,
            };
        } else {
            if (transferToCountry === "AUSTRALIA" || code?.includes("BSB")) {
                return {
                    bsbCode: specialBitValue,
                };
            }
            if (code?.includes("SORT")) {
                return {
                    sortCode: specialBitValue,
                };
            }
            if (transferToCountry === "INDIA" || code?.includes("IFSC") || code === "IFSC Code") {
                return {
                    ifscCode: specialBitValue,
                };
            }
            if (code === "FED_WIRE_CODE" || code === "FED WIRE") {
                return {
                    wireCode: specialBitValue,
                };
            }
        }
        return null;
    }

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <>
                <ScreenLayout
                    paddingBottom={0}
                    paddingTop={16}
                    paddingHorizontal={0}
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={handleClose} />}
                            headerCenterElement={
                                <Typo
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={19}
                                    text={
                                        favourite ? "Transfer Favourite" : OVERSEAS_TRANSFER_HEADER
                                    }
                                />
                            }
                        />
                    }
                    useSafeArea
                >
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : ""}
                        style={styles.mainContainer}
                        keyboardVerticalOffset={150}
                        enabled
                    >
                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.container}
                        >
                            <View style={styles.accountList}>
                                {productList.map((productInfo, index) => {
                                    if (
                                        productInfo?.productType &&
                                        productInfo?.exchangeRate &&
                                        !productInfo?.hideCard
                                    ) {
                                        return (
                                            <OverseasProductRateCard
                                                data={productInfo}
                                                key={`index-${index}`}
                                                index={index}
                                                isSelected={productInfo.isSelected}
                                                onSelect={handleSelection}
                                                onPressInfo={handleInfoPopup}
                                                isError={!isEligible}
                                            />
                                        );
                                    }
                                })}
                                {showVdInput && productsActive?.vd === "Y" && !favItem && (
                                    <OverseasProductRateCard
                                        isVD
                                        cardVdNo={cardText}
                                        onChangeText={textChanged}
                                        vdInquiry={vdInquiry}
                                        isSelected={vdCardSelected}
                                        onSelect={handleSelection}
                                        onPressInfo={handleInfoPopup}
                                    />
                                )}
                            </View>
                        </ScrollView>
                    </KeyboardAvoidingView>
                    <FixedActionContainer>
                        <ActionButton
                            disabled={
                                !(trxInfo?.isSelected || trxInfo?.amountInRM) ||
                                !trxInfo?.toCurrencyAmount ||
                                parseFloat(trxInfo?.toCurrencyAmount, 10) === 0.0 ||
                                !trxInfo?.amountInRM ||
                                parseFloat(trxInfo?.amountInRM, 10) === 0.0
                            }
                            fullWidth
                            borderRadius={25}
                            onPress={verifyAvailability}
                            testID="choose_account_continue"
                            backgroundColor={
                                !(trxInfo?.isSelected || trxInfo?.amountInRM) ||
                                !trxInfo?.toCurrencyAmount ||
                                parseFloat(trxInfo?.toCurrencyAmount, 10) === 0.0 ||
                                !trxInfo?.amountInRM ||
                                parseFloat(trxInfo?.amountInRM, 10) === 0.0
                                    ? DISABLED
                                    : YELLOW
                            }
                            componentCenter={
                                <Typo
                                    color={
                                        !(trxInfo?.isSelected || trxInfo?.amountInRM) ||
                                        !trxInfo?.toCurrencyAmount ||
                                        parseFloat(trxInfo?.toCurrencyAmount, 10) === 0.0 ||
                                        !trxInfo?.amountInRM ||
                                        parseFloat(trxInfo?.amountInRM, 10) === 0.0
                                            ? DISABLED_TEXT
                                            : BLACK
                                    }
                                    text={
                                        trxInfo?.isSelected
                                            ? `Transfer RM ${numeral(
                                                  parseFloat(
                                                      trxInfo?.fromCurrency !== "MYR"
                                                          ? trxInfo?.toCurrencyAmount
                                                          : trxInfo?.amountInRM
                                                  ) +
                                                      parseFloat(
                                                          trxInfo?.serviceFee !== "-"
                                                              ? trxInfo?.serviceFee
                                                              : "0.00"
                                                      )
                                              ).format("0,0.00")}`
                                            : "Continue"
                                    }
                                    fontSize={12}
                                    fontWeight="600"
                                    lineHeight={18}
                                />
                            }
                        />
                    </FixedActionContainer>
                </ScreenLayout>
                {popupInfo?.isVisible && popupInfo && (
                    <Popup
                        title={popupInfo?.infoTitle}
                        description={popupInfo?.infoMessage}
                        visible={popupInfo?.isVisible}
                        onClose={onClosePopup}
                        primaryAction={
                            trxInfo?.productType === "FTT" &&
                            trxInfo?.dailyLimitInd === "Y" &&
                            trxInfo?.extendedHourFlag === "Y"
                                ? {
                                      text: PROCEED,
                                      onPress: () => {
                                          onClosePopup();
                                          handleProceed();
                                      },
                                  }
                                : null
                        }
                    />
                )}
            </>
        </ScreenContainer>
    );
}

OverseasProductListScreen.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
    client: PropTypes.object,
    getModel: PropTypes.func,
    updateModel: PropTypes.func,
    resetModel: PropTypes.func,
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "column",
        paddingBottom: 18,
    },
    mainContainer: { flex: 1, width: "100%" },
});

export default withModelContext(OverseasProductListScreen);
