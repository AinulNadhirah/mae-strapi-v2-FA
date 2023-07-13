import PropTypes from "prop-types";
import React, { useEffect, useRef, useState, useCallback } from "react";
import {
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import { Dropdown } from "@components/Common/DropDownButtonCenter";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import TextInputWithLengthCheck from "@components/TextInputWithLengthCheck";
import Typo from "@components/TextWithInfo";
import { showErrorToast } from "@components/Toast";

import { withModelContext } from "@context";

import { getOverseasPurpose } from "@services";
import { RemittanceAnalytics } from "@services/analytics/analyticsRemittance";

import { BLACK, DARK_GREY, DISABLED, DISABLED_TEXT, YELLOW } from "@constants/colors";
import {
    ADDRESS_ONE,
    ADDRESS_TWO,
    COMMON_ERROR_MSG,
    CONTINUE,
    FTT,
    INVALID_CHAR_ERROR,
    MOT,
    VISA_DIRECT,
    WESTERN_UNION,
    DROPDOWN_DEFAULT_TEXT,
} from "@constants/strings";

import { remittanceAddressRegex } from "@utils/dataModel";

import assets from "@assets";

function OverseasSenderDetails({ navigation, route, getModel, updateModel }) {
    const { from, name, callBackFunction } = route?.params || {};
    const add1 = useRef();
    const add2 = useRef();
    console.info("OverseasSenderDetails: ", route?.params);
    const { FTTSenderDetails, OverseasSenderDetails, FTTTransferPurpose, FTTRecipientDetails } =
        getModel("overseasTransfers");
    const [userData, setUserData] = useState(preLoadData());
    const senderInfo = {};
    const {
        addressLineOne,
        address1Error,
        addressLineTwo,
        address2Error,
        country,
        postCode,
        state,
    } = userData;
    const [nationality, changeNationalityState] = useState(FTTSenderDetails?.nationality);
    const [nationalityChanged, changeNationalityInfo] = useState(false);

    function getNationalityUI(malaysian) {
        if (nationality === malaysian) {
            return <Image source={assets.icChecked} style={styles.icon} resizeMode="stretch" />;
        }
        return <Image source={assets.icRadioUnchecked} style={styles.icon} resizeMode="stretch" />;
    }

    useEffect(() => {
        changeNationalityInfo(
            from === "FTTConfirmation" &&
                (!FTTSenderDetails?.nationality || FTTSenderDetails?.nationality) &&
                nationality !== FTTSenderDetails?.nationality
        );
        changeNationalityState(nationality);
        RemittanceAnalytics.trxSenderDetailsLoaded("FTT");
    }, [FTTSenderDetails?.nationality, nationality, from]);

    const isCTADisabled =
        !addressLineOne ||
        !addressLineTwo ||
        !(country || FTTSenderDetails?.country) ||
        address1Error ||
        address2Error ||
        !nationality ||
        !postCode;
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
    function onChangeFieldValue(fieldName, fieldValue) {
        if (fieldName === "addressLineOne" || fieldName === "addressLineTwo") {
            const val = fieldValue.replace("  ", " ");
            const commErr1 = INVALID_CHAR_ERROR;
            const commErr2 = `Address line ${
                fieldName === "addressLineOne" ? "1" : "2"
            } must not contain leading/double\nspaces`;
            let err = "";
            if (fieldValue?.startsWith(" ") || fieldValue?.includes("  ")) {
                err = commErr2;
            } else if (val && !remittanceAddressRegex(val, "ftt")) {
                err = commErr1;
            } else {
                err = "";
            }
            const addressError =
                fieldName === "addressLineOne" ? { address1Error: err } : { address2Error: err };
            setUserData((prevState) => ({
                ...prevState,
                [fieldName]: fieldValue,
                ...addressError,
            }));
            return;
        }
        setUserData((prevState) => ({ ...prevState, [fieldName]: fieldValue }));
    }

    function changeNationality(nationalityText) {
        changeNationalityState(nationalityText);
    }

    function onCountrySelectionDone(countryItem) {
        console.info("onCountrySelectionDone: ", countryItem);
        onChangeFieldValue("country", countryItem?.countryName);
        onChangeFieldValue("countryCode", countryItem?.countryCode);
    }

    //to check if country is edited and from confirmation page
    var editingCountry = "NotEditCountry";
    function onPressCountryDropdown() {
        if (from === "FTTConfirmation") {
            editingCountry = "EditCountry";
        }
        navigation.push("OverseasCountryListScreen", {
            ...route?.params,
            callBackFunction: onCountrySelectionDone,
            from: "OverseasSenderDetails",
            editingCountry,
            showSenderCountryList: true,
        });
    }
    function getScreenName(name) {
        if (name === "RT") {
            return "MOTRecipientBankDetails";
        }
        if (name === "FTT") {
            return "OverseasPrequisites";
        }
        if (name === "WU") {
            return "WUSenderDetailsStepOne";
        }
        if (name === "VD") {
            return "VDTransferDetails";
        }
    }
    function resetSelection(inputRef) {
        // console.tron.log("resetSelection: ", inputRef);
        // if (inputRef?.current?.setNativeProps)
        //     inputRef?.current?.setNativeProps({ selection: { start: 0, end: 0 } });
    }
    function onContinue() {
        resetSelection(add1);
        resetSelection(add2);
        const { name, countryCode, phoneNo } = userData;

        if (addressLineOne?.length < 5) {
            setUserData((prevState) => ({
                ...prevState,
                address1Error: "Must be more than 5 characters",
            }));
            return;
        } else if (addressLineTwo?.length < 5) {
            setUserData((prevState) => ({
                ...prevState,
                address2Error: "Must be more than 5 characters",
            }));
            return;
        } else if (!remittanceAddressRegex(addressLineOne, "ftt")) {
            setUserData((prevState) => ({
                ...prevState,
                address1Error: INVALID_CHAR_ERROR,
            }));
            return;
        } else if (!remittanceAddressRegex(addressLineTwo, "ftt")) {
            setUserData((prevState) => ({
                ...prevState,
                address2Error: INVALID_CHAR_ERROR,
            }));
            return;
        }
        const filteringParams = /^[^a-zA-Z0-9\s]|^\s|[\s]{2,}/g;
        const senderDetailsObj = {
            name,
            addressLineOne: addressLineOne.replace(filteringParams, " ").trim(),
            addressLineTwo: addressLineTwo.replace(filteringParams, " ").trim(),
            country,
            postCode,
            phoneNo,
            nationality,
            countryName: country,
            countryCode,
            state,
            nationalityChanged: from === "FTTConfirmation" ? nationalityChanged : false,
        };
        console.tron.log("onContinue: ", senderDetailsObj);
        updateModel({
            overseasTransfers: {
                FTTSenderDetails: senderDetailsObj,
                OverseasSenderDetails: { ...OverseasSenderDetails, ...senderDetailsObj },
                FTTTransferPurpose: { ...FTTTransferPurpose, purposeCodeLists: null },
            },
        });

        if (callBackFunction) {
            callBackFunction(senderInfo);
        }

        if (from === "FTTConfirmation" && nationalityChanged) {
            handleNationalityChanged(nationality);
        } else {
            const screenName =
                route?.params?.from === "FTTConfirmation"
                    ? route?.params?.from
                    : getScreenName(route?.params?.name ?? route?.params?.transferParams?.name);
            navigation.navigate(screenName, {
                ...route.params,
                from: null,
            });
        }
    }

    async function handleNationalityChanged(senderNationality) {
        try {
            const params = {
                senderNationality: senderNationality === "M" ? "M" : "N",
                beneNationality: FTTRecipientDetails?.nationality === "M" ? "M" : "N",
            };
            const response = await getOverseasPurpose(params);
            if (response?.data) {
                updateModel({
                    overseasTransfers: {
                        purposeCodeLists:
                            response?.data?.residentList?.length > 0
                                ? response?.data?.residentList
                                : response?.data?.nonResidentList,
                    },
                    FTTTransferPurpose: {
                        ...FTTTransferPurpose,
                        transferPurpose: "",
                        transferSubPurpose: "",
                        relationShipStatus: "",
                    },
                });
                navigation.navigate("FTTTransferDetails", {
                    ...route.params,
                    from: "",
                    nationalityChanged: true,
                });
            }
        } catch (ex) {
            console.tron.log("handleNationalityChanged ex: ", ex);
            showErrorToast({ message: COMMON_ERROR_MSG });
        }
    }
    const onBackButtonPress = () => {
        if (route?.params?.from === "FTTConfirmation") {
            navigation.navigate(route?.params?.from, {
                ...route?.params,
                from: "",
            });
            return;
        }

        navigation.navigate("OverseasProductListScreen", {
            ...route?.params,
        });
    };

    function getHeaderUI() {
        return (
            <HeaderLayout
                headerLeftElement={<HeaderBackButton onPress={onBackButtonPress} />}
                headerCenterElement={
                    <Typo
                        text="Step 1 of 4"
                        fontWeight="600"
                        fontSize={12}
                        color={DARK_GREY}
                        textAlign="center"
                    />
                }
            />
        );
    }
    function preLoadData() {
        const {
            name,
            addressLineOne,
            addressLineTwo,
            country,
            countryCode,
            nationality,
            postCode,
        } = FTTSenderDetails?.addressLineOne ? FTTSenderDetails : OverseasSenderDetails ?? {};

        if (from === "FTTConfirmation") {
            return {
                name,
                addressLineOne,
                addressLineTwo,
                address1Error,
                address2Error,
                postCode,
                country,
                countryCode,
                nationality,
            };
        } else {
            return {
                name,
                addressLineOne,
                addressLineTwo,
                address1Error: "",
                address2Error: "",
                postCode,
                country,
                countryCode,
                nationality,
            };
        }
    }

    const onChangeAddressOne = useCallback((value) => {
        onChangeFieldValue("addressLineOne", value?.replace(/\s{2,}/g, ""));
    }, []);

    const onChangeAddressTwo = useCallback((value) => {
        onChangeFieldValue("addressLineTwo", value?.replace(/\s{2,}/g, ""));
    }, []);

    const onChangePostcode = useCallback((value) => {
        onChangeFieldValue("postCode", value.replace(/[^0-9]/g, ""));
    }, []);

    const onBlurAddress1 = useCallback(
        (e) => {
            resetSelection(add1);
        },
        [add1]
    );

    const onBlurAddress2 = useCallback(
        (e) => {
            resetSelection(add2);
        },
        [add2]
    );

    const onChangeNationalityNM = useCallback(() => changeNationality("NM"), []);
    const onChangeNationalityM = useCallback(() => changeNationality("M"), []);

    return (
        <ScreenContainer>
            <ScreenLayout
                paddingBottom={0}
                paddingTop={16}
                paddingHorizontal={0}
                useSafeArea
                header={getHeaderUI()}
            >
                <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                    <KeyboardAvoidingView
                        style={styles.keyboardContainer}
                        behavior={Platform.OS === "ios" ? "position" : ""}
                        keyboardVerticalOffset={20}
                    >
                        <View style={styles.mainContainer}>
                            <Typo
                                text={getName(name)}
                                fontWeight="400"
                                fontSize={14}
                                textAlign="left"
                                lineHeight={21}
                                style={styles.headerText}
                            />

                            <Typo
                                text="Please fill in your details"
                                fontWeight="600"
                                fontSize={16}
                                textAlign="left"
                                lineHeight={21}
                            />
                        </View>
                        <View style={styles.subContainer}>
                            <Typo
                                text="Nationality"
                                textAlign="left"
                                fontSize={14}
                                lineHeight={18}
                                fontWeight="400"
                            />
                            <TouchableOpacity
                                style={styles.radioBtnContainer}
                                onPress={onChangeNationalityM}
                            >
                                {getNationalityUI("M")}
                                <Typo
                                    style={styles.nationalityTxt}
                                    text="Malaysian"
                                    textAlign="left"
                                    fontSize={14}
                                    lineHeight={18}
                                    fontWeight="600"
                                />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.radioBtnContainer}
                                onPress={onChangeNationalityNM}
                            >
                                {getNationalityUI("NM")}
                                <Typo
                                    style={styles.nationalityTxt}
                                    text="Non-Malaysian"
                                    textAlign="left"
                                    fontSize={14}
                                    lineHeight={18}
                                    fontWeight="600"
                                />
                            </TouchableOpacity>
                            <TextInputWithLengthCheck
                                textInputRef={add1}
                                label={ADDRESS_ONE}
                                placeholder="e.g. Unit no/Floor/Building"
                                errorMessage={address1Error}
                                isValidate
                                isValid={!address1Error}
                                value={addressLineOne?.replace(/^[^a-zA-Z0-9\s]|^\s/, "")}
                                inputLengthCheck
                                maxLength={40}
                                onChangeText={onChangeAddressOne}
                                onBlur={onBlurAddress1}
                            />
                            <TextInputWithLengthCheck
                                textInputRef={add2}
                                label={ADDRESS_TWO}
                                placeholder="e.g. Street name"
                                errorMessage={address2Error}
                                inputLengthCheck
                                isValid={!address2Error}
                                isValidate
                                value={addressLineTwo?.replace(/^[^a-zA-Z0-9\s]|^\s/, "")}
                                maxLength={35}
                                onChangeText={onChangeAddressTwo}
                                onBlur={onBlurAddress2}
                            />
                            <TextInputWithLengthCheck
                                label="Postcode"
                                placeholder="e.g. 52200"
                                value={postCode}
                                maxLength={9}
                                onChangeText={onChangePostcode}
                            />
                            <Typo
                                style={styles.inputContainer}
                                textAlign="left"
                                text="Country"
                                fontSize={14}
                                fontWeight="400"
                                lineHeight={18}
                            />
                            <View style={styles.countryDropDown}>
                                <Dropdown
                                    title={
                                        country ||
                                        FTTSenderDetails?.country ||
                                        DROPDOWN_DEFAULT_TEXT
                                    }
                                    align="left"
                                    borderWidth={0.5}
                                    onPress={onPressCountryDropdown}
                                />
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </ScrollView>
                <FixedActionContainer>
                    <ActionButton
                        disabled={isCTADisabled}
                        fullWidth
                        borderRadius={25}
                        onPress={onContinue}
                        testID="choose_account_continue"
                        backgroundColor={isCTADisabled ? DISABLED : YELLOW}
                        componentCenter={
                            <Typo
                                color={isCTADisabled ? DISABLED_TEXT : BLACK}
                                text={CONTINUE}
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={18}
                            />
                        }
                    />
                </FixedActionContainer>
            </ScreenLayout>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
    },
    countryDropDown: { paddingBottom: "5%" },
    headerText: { paddingVertical: "3%" },
    icon: {
        height: 20,
        width: 20,
    },
    inputContainer: { marginBottom: 8, marginTop: 24 },
    keyboardContainer: { flex: 1 },
    mainContainer: { paddingBottom: "3%" },
    nationalityTxt: {
        marginLeft: 8,
    },
    radioBtnContainer: {
        flexDirection: "row",
        marginTop: 20,
    },
    subContainer: {
        flex: 1,
        paddingHorizontal: 4,
    },
});

OverseasSenderDetails.propTypes = {
    navigation: PropTypes.object.isRequired,
    route: PropTypes.object.isRequired,
    updateModel: PropTypes.func,
    getModel: PropTypes.func,
};
export default withModelContext(OverseasSenderDetails);
