import { useNavigation, useRoute } from "@react-navigation/native";
import moment from "moment";
import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import { Dropdown } from "@components/Common/DropDownButtonCenter";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import Popup from "@components/Popup";
import TextInputWithLengthCheck from "@components/TextInputWithLengthCheck";
import Typo from "@components/TextWithInfo";
import { showErrorToast } from "@components/Toast";

import { useModelController, withModelContext } from "@context";

import { getSenderDetails, getRateInquiry } from "@services";
import { RemittanceAnalytics } from "@services/analytics/analyticsRemittance";

import {
    BLACK,
    DARK_GREY,
    DISABLED,
    DISABLED_TEXT,
    FADE_GREY,
    MEDIUM_GREY,
    YELLOW,
} from "@constants/colors";
import {
    ADDRESS_ONE,
    ADDRESS_TWO,
    CONTINUE,
    INVALID_CHAR_ERROR,
    WESTERN_UNION,
    DATE_TIME_FORMAT1,
    DATE_TIME_FORMAT2,
    DATE_TIME_FORMAT3,
    DROPDOWN_DEFAULT_TEXT,
    COMMON_ERROR_MSG,
} from "@constants/strings";

import { leadingOrDoubleSpaceRegex, remittanceAddressRegex, validateEmail } from "@utils/dataModel";
import { formatOverseasMobileNumber } from "@utils/dataModel/utility";
import { parseSenderInfo } from "@utils/dataModel/utilityRemittance";

function WUSenderDetailsStepOne() {
    const navigation = useNavigation();
    const route = useRoute();
    const { getModel, updateModel } = useModelController();
    const { WUSenderDetailsStepOne } = getModel("overseasTransfers");
    const [mobileisValid, setMobileValid] = useState(false);
    const [cityisValid, setCityValid] = useState(false);
    const [stateisValid, setStateValid] = useState(false);
    const [countryisValid, setCountryValid] = useState(false);
    const [postcodeisValid, setPostCodeValid] = useState(false);
    const [promoCodeError, setPromoCodeError] = useState(true);
    const [loading, setLoading] = useState(false);
    const [fieldsState, changeFieldState] = useState(preLoadData());
    const [{ isInfoVisible, infoTitle, infoMessage }, changeInfoDetail] = useState({
        isInfoVisible: false,
        infoTitle: "",
        infoMessage: "",
    });
    const {
        WUNumber,
        name,
        citizenship,
        addressLineOne,
        addressLineTwo,
        postCode,
        city,
        state,
        country,
        mobileNumber,
        email,
        emailError,
        address1Error,
        address2Error,
        senderDOB,
        countryItem,
        addressCountry,
        nationality,
    } = fieldsState;

    const isCTADisabled =
        !promoCodeError ||
        !addressLineOne ||
        !addressLineTwo ||
        address1Error ||
        address2Error ||
        emailError ||
        !city ||
        (addressLineOne && !remittanceAddressRegex(addressLineOne, "wu")) ||
        (addressLineTwo && !remittanceAddressRegex(addressLineTwo, "wu")) ||
        (!mobileisValid && !mobileNumber) ||
        (!postcodeisValid && !postCode) ||
        (!stateisValid && !state) ||
        (!countryisValid && !country);

    function preLoadData() {
        const {
            WUNumber,
            name,
            citizenship,
            addressLineOne,
            addressLineTwo,
            state,
            postCode,
            country,
            city,
            mobileNumber,
            email,
            dateOfBirth,
            nationality,
        } = WUSenderDetailsStepOne || {};

        return {
            WUNumber,
            name,
            citizenship,
            addressLineOne,
            addressLineTwo,
            state,
            postCode,
            country,
            city,
            mobileNumber,
            email,
            address1Error: "",
            address2Error: "",
            dateOfBirth: dateOfBirth || WUSenderDetailsStepOne?.senderDOB,
            senderDOB: senderDOB || WUSenderDetailsStepOne?.senderDOB,
            addressCountry: { countryName: "MALAYSIA", countryCode: "MY" },
            nationality,
        };
    }

    useEffect(() => {
        if (!route?.params?.isFavorite && (!addressLineOne || !addressLineTwo || !postCode)) {
            getData();
        } else {
            setCityValid(city !== "");
            setMobileValid(mobileNumber !== "");
            setStateValid(state !== "");
            setCountryValid(addressCountry?.countryName);
            setPostCodeValid(postCode !== "");
        }
        RemittanceAnalytics.trxSenderDetailsLoaded("WU");
    }, []);

    async function getData() {
        try {
            const response = await getSenderDetails();
            if (response?.data?.addr1) {
                const { customerName, nationality, state, phoneNo, birthDate } =
                    response?.data || {};
                const { addressOne, addressTwo, pCode, addState } = parseSenderInfo(
                    response?.data,
                    35
                );
                const addressFour = response?.data?.addr4;
                const country = nationality;
                changeFieldState({
                    ...fieldsState,
                    name: customerName,
                    addressLineOne: addressOne,
                    addressLineTwo: addressTwo,
                    mobileNumber: phoneNo,
                    city: addressFour || WUSenderDetailsStepOne?.city,
                    postCode: pCode,
                    nationality,
                    country: addressCountry?.countryName,
                    state: addState,
                    citizenship: nationality === "MALAYSIA" ? "M" : "NM",
                    senderDOB: birthDate,
                    dateOfBirth: moment(birthDate, [
                        DATE_TIME_FORMAT1,
                        DATE_TIME_FORMAT2,
                        DATE_TIME_FORMAT3,
                    ]).format("DD MMM YYYY"),
                });
                if (addressOne) {
                    onChangeFieldValue("addressLineOne", addressOne?.replace(/\s{2,}/g, ""));
                }
                if (addressTwo) {
                    onChangeFieldValue("addressLineTwo", addressTwo?.replace(/\s{2,}/g, ""));
                }

                setCityValid(addressFour !== "");
                setMobileValid(phoneNo);
                setStateValid(state !== "");
                setCountryValid(country);
                setPostCodeValid(pCode);
            } else {
                showErrorToast({ message: response?.data?.statusDesc || COMMON_ERROR_MSG });
            }
        } catch (e) {
            showErrorToast({ message: e?.message || COMMON_ERROR_MSG });
        }
    }

    function onChangeFieldValue(fieldName, fieldValue) {
        if (fieldName === "email") {
            const emailError =
                validateEmail(fieldValue) || fieldValue === ""
                    ? ""
                    : "An email address must contain a single @";
            changeFieldState((prevState) => ({
                ...prevState,
                [fieldName]: fieldValue,
                emailError,
            }));
            return;
        } else if (fieldName === "addressLineOne" || fieldName === "addressLineTwo") {
            const val = fieldValue?.replace("  ", " ");
            const commErr2 = `Address line ${
                fieldName === "addressLineOne" ? "1" : "2"
            } must not contain leading/double\nspaces`;
            let err = "";
            if (!leadingOrDoubleSpaceRegex(val) || /\s{2,}$/.test(val)) {
                err = commErr2;
            } else if (val && !remittanceAddressRegex(val, "wu")) {
                err = INVALID_CHAR_ERROR;
            } else if (val?.length < 5) {
                err = "Must be more than 5 characters";
            }

            const addressError =
                fieldName === "addressLineOne"
                    ? { address1Error: err ?? "" }
                    : { address2Error: err ?? "" };
            changeFieldState((prevState) => ({
                ...prevState,
                [fieldName]: fieldValue,
                ...addressError,
            }));
            return;
        }
        changeFieldState((prevState) => ({ ...prevState, [fieldName]: fieldValue }));
    }

    const onBackButtonPress = useCallback(() => {
        onContinue(true);
    }, [onContinue]);

    function showLoader(isLoading) {
        updateModel({
            ui: {
                showLoader: isLoading,
            },
        });
    }

    async function verifyPromoCode(params) {
        showLoader(true);
        const response = await getRateInquiry(params, false);
        if (response?.data?.statusCode === "201") {
            return response?.data;
        } else {
            return response?.data?.overseasRateInquiry?.filter((rmtData) => {
                return (
                    rmtData?.productType === "WU" &&
                    rmtData?.productType &&
                    rmtData?.exchangeRate &&
                    rmtData?.serviceFee !== "-"
                );
            });
        }
    }

    async function onContinue(isBack) {
        const params = {
            ...route?.params?.apiParams,
            wuCode: WUNumber ?? "",
            rateInq_WU_Ind: "Y",
            rateInq_VD_Ind: "N",
            rateInq_FTT_Ind: "N",
            rateInq_RT_Ind: "N",
        };
        const wuProductPromo = await verifyPromoCode(params);

        if (WUNumber !== "" && wuProductPromo?.statusCode === "201" && wuProductPromo?.statusDesc) {
            showErrorToast({
                message: wuProductPromo?.statusDesc,
            });
            setLoading(false);
            showLoader(false);
            return;
        }
        const doubleSpaces = /[\s]{2,}/g;
        const senderDetailsStepOneObj = {
            name,
            citizenship,
            addressLineOne: addressLineOne?.replace(doubleSpaces, " ")?.trim(),
            addressLineTwo: addressLineTwo?.replace(doubleSpaces, " ")?.trim(),
            postCode,
            state,
            country: countryItem?.countryName || country,
            mobileNumber: mobileNumber?.replace(/\s|^6/g, ""),
            email,
            city,
            senderDOB,
            WUNumber:
                wuProductPromo?.length === 1 && wuProductPromo[0]?.exchangeRate ? WUNumber : "",
            addressCountry,
            nationality,
        };
        updateModel({
            overseasTransfers: {
                WUSenderDetailsStepOne: senderDetailsStepOneObj,
            },
        });
        const newRateInquiry = wuProductPromo.pop();
        if (isBack) {
            const navParams = {
                ...route?.params,
                transferParams: {
                    ...route?.params?.transferParams,
                    remittanceData: { ...newRateInquiry },
                },
                remittanceData: { ...newRateInquiry },
                WUSenderDetailsStepOne: senderDetailsStepOneObj,
                fromWUConfirmation: false,
                from: "",
            };

            navigation.navigate(
                route?.params?.fromWUConfirmation ? "WUConfirmation" : "OverseasPrequisites",
                {
                    ...navParams,
                }
            );

            return;
        }
        navigation.navigate(
            route?.params?.isFavorite ? "WUConfirmation" : "WUSenderDetailsStepTwo",
            {
                ...route?.params,
                transferParams: {
                    ...route?.params?.transferParams,
                    remittanceData: { ...newRateInquiry },
                },
                remittanceData: { ...newRateInquiry },
                WUSenderDetailsStepOne: senderDetailsStepOneObj,
                from: "WUSenderDetailsStepOne",
            }
        );
    }

    function handleInfoPopup({ infoMessage, infoTitle }) {
        changeInfoDetail({ isInfoVisible: true, infoMessage, infoTitle });
    }

    function onClosePopup() {
        changeInfoDetail({ isInfoVisible: false });
    }

    function getHeaderUI() {
        return (
            <HeaderLayout
                headerLeftElement={<HeaderBackButton onPress={onBackButtonPress} />}
                headerCenterElement={
                    <Typo
                        color={DARK_GREY}
                        text="Step 1 of 5"
                        fontWeight="600"
                        fontSize={12}
                        lineHeight={18}
                    />
                }
            />
        );
    }

    const onPressCountryDropdown = useCallback(async () => {
        navigation.push("OverseasCountryListScreen", {
            ...route?.params,
            callBackFunction: onCountrySelectionDone,
            from: "WUSenderDetailsStepOne",
        });
    }, [navigation, route?.params]);

    function onCountrySelectionDone(countryItem) {
        changeFieldState((prevState) => ({
            ...prevState,
            country: countryItem?.countryName,
        }));
    }

    const onChangePromo = useCallback((value) => {
        setPromoCodeError(true);
        onChangeFieldValue("WUNumber", value);
    }, []);

    const onChangeAddressOne = useCallback((value) => {
        onChangeFieldValue("addressLineOne", value?.replace(/\s{2,}/g, ""));
    }, []);

    const onChangeAddressTwo = useCallback((value) => {
        onChangeFieldValue("addressLineTwo", value?.replace(/\s{2,}/g, ""));
    }, []);

    const onChangeCity = useCallback((value) => {
        onChangeFieldValue("city", value);
    }, []);

    const onChangeState = useCallback((value) => {
        onChangeFieldValue("state", value);
    }, []);

    const onChangeCountry = useCallback((value) => {
        onChangeFieldValue("country", value);
    }, []);

    const onChangeEmail = useCallback((value) => {
        onChangeFieldValue("email", value);
    }, []);

    const onNavigateCountrySelection = useCallback(() => {
        if (!route?.params?.isFavorite) {
            onPressCountryDropdown();
        }
    }, [route?.params?.isFavorite, onPressCountryDropdown]);

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <ScreenLayout
                paddingBottom={0}
                paddingHorizontal={0}
                useSafeArea
                header={getHeaderUI()}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : ""}
                    style={styles.container}
                    keyboardVerticalOffset={150}
                    enabled
                >
                    <ScrollView
                        contentContainerStyle={styles.contentContainer}
                        showsVerticalScrollIndicator={false}
                    >
                        <Typo
                            text={WESTERN_UNION}
                            textAlign="left"
                            fontSize={14}
                            lineHeight={18}
                            fontWeight="400"
                        />
                        <Typo
                            style={styles.pageTitle}
                            textAlign="left"
                            text="Please fill in your details"
                            fontWeight="600"
                            fontSize={16}
                            lineHeight={20}
                        />
                        <TextInputWithLengthCheck
                            label="Promo code (Optional)"
                            isValidate
                            name="WUNumber"
                            isValid={
                                WUNumber !== undefined
                                    ? WUNumber.length > 0
                                        ? promoCodeError
                                        : true
                                    : true
                            }
                            errorMessage="Promotion code not found or expired"
                            value={WUNumber}
                            placeholder="e.g. ABC123"
                            maxLength={30}
                            onChangeText={onChangePromo}
                        />
                        <TextInputWithLengthCheck
                            label="Sender name"
                            name="name"
                            value={name}
                            maxLength={35}
                            editable={false}
                            prefilledPlaceHolder={true}
                            style={styles.disabled}
                        />
                        <TextInputWithLengthCheck
                            label="Citizenship/Permanent resident"
                            name="citizenship"
                            value={citizenship === "M" ? "Malaysian" : "Non-Malaysian"}
                            maxLength={35}
                            editable={false}
                            prefilledPlaceHolder={true}
                            style={styles.disabled}
                        />
                        <TextInputWithLengthCheck
                            isValidate
                            isValid={!address1Error}
                            errorMessage={!route?.params?.isFavorite ? address1Error : ""}
                            label={ADDRESS_ONE}
                            placeholder="e.g. Unit no/Floor/Building"
                            value={addressLineOne}
                            editable={!route?.params?.isFavorite}
                            inputLengthCheck
                            maxLength={40}
                            onChangeText={onChangeAddressOne}
                            onPressInfoBtn={handleInfoPopup}
                            hasInfo
                            infoTitle="Address"
                            infoMessage="If your address has changed, kindly update your address at the nearest Maybank branch."
                            style={route?.params?.isFavorite && addressLineOne && styles.disabled}
                        />
                        <TextInputWithLengthCheck
                            isValidate
                            isValid={!address2Error}
                            errorMessage={
                                !route?.params?.isFavorite &&
                                !remittanceAddressRegex(addressLineTwo, "wu") &&
                                address2Error
                            }
                            label={ADDRESS_TWO}
                            placeholder="e.g. Street name"
                            inputLengthCheck
                            editable={!route?.params?.isFavorite}
                            value={addressLineTwo}
                            maxLength={40}
                            onChangeText={onChangeAddressTwo}
                            style={route?.params?.isFavorite && addressLineTwo && styles.disabled}
                        />
                        <TextInputWithLengthCheck
                            label="Postcode"
                            name="postCode"
                            value={postCode}
                            maxLength={35}
                            editable={!postcodeisValid}
                            prefilledPlaceHolder={true}
                            style={postcodeisValid && styles.disabled}
                        />
                        <TextInputWithLengthCheck
                            label="City"
                            name="city"
                            value={city}
                            maxLength={40}
                            editable={!cityisValid}
                            style={cityisValid && styles.disabled}
                            prefilledPlaceHolder={true}
                            onChangeText={onChangeCity}
                        />
                        <TextInputWithLengthCheck
                            label="State/Province"
                            name="state"
                            value={state}
                            maxLength={40}
                            editable={!stateisValid}
                            prefilledPlaceHolder={true}
                            style={stateisValid && styles.disabled}
                            onChangeText={onChangeState}
                        />
                        {!countryisValid ? (
                            <>
                                <Typo
                                    style={styles.popUpTitle}
                                    textAlign="left"
                                    text="Country"
                                    fontSize={14}
                                    fontWeight="400"
                                    lineHeight={60}
                                />
                                <Dropdown
                                    title={country || DROPDOWN_DEFAULT_TEXT}
                                    align="left"
                                    borderWidth={0.5}
                                    onPress={onNavigateCountrySelection}
                                />
                            </>
                        ) : (
                            <TextInputWithLengthCheck
                                label="Country"
                                name="country"
                                value={addressCountry?.countryName}
                                maxLength={35}
                                editable={!countryisValid && !route?.params?.isFavorite}
                                prefilledPlaceHolder={true}
                                style={countryisValid && styles.disabled}
                                onChangeText={onChangeCountry}
                            />
                        )}
                        <TextInputWithLengthCheck
                            label="Mobile Number"
                            name="mobileNumber"
                            placeholder={formatOverseasMobileNumber(mobileNumber?.trim())}
                            editable={!mobileisValid && !route?.params?.isFavorite}
                            prefilledPlaceHolder={true}
                            value={mobileNumber ? "+" + mobileNumber : ""}
                            hasInfo
                            infoTitle="Mobile number"
                            infoMessage="If your mobile number has changed, kindly update your mobile number at the nearest Maybank branch."
                            onPressInfoBtn={handleInfoPopup}
                            style={mobileisValid && styles.disabled}
                        />
                        <TextInputWithLengthCheck
                            isValidate
                            isValid={!emailError}
                            editable={
                                !route?.params?.isFavorite ||
                                (route?.params?.isFavorite &&
                                    !WUSenderDetailsStepOne?.isEmailPrepopulated)
                            }
                            errorMessage={emailError}
                            label="Email address (Optional)"
                            placeholder="e.g. danial@gmail.com"
                            maxLength={50}
                            value={email}
                            onChangeText={onChangeEmail}
                        />
                    </ScrollView>
                </KeyboardAvoidingView>
                <FixedActionContainer>
                    <ActionButton
                        disabled={isCTADisabled}
                        backgroundColor={isCTADisabled ? DISABLED : YELLOW}
                        fullWidth
                        isLoading={loading}
                        componentCenter={
                            <Typo
                                color={isCTADisabled ? DISABLED_TEXT : BLACK}
                                lineHeight={18}
                                fontWeight="600"
                                fontSize={14}
                                text={CONTINUE}
                            />
                        }
                        onPress={onContinue}
                    />
                </FixedActionContainer>
            </ScreenLayout>
            {isInfoVisible && (
                <Popup
                    title={infoTitle}
                    description={infoMessage}
                    visible={isInfoVisible}
                    onClose={onClosePopup}
                />
            )}
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        paddingBottom: 25,
        paddingHorizontal: 24,
    },
    disabled: { color: FADE_GREY },
    pageTitle: { marginTop: 4 },

    popUpTitle: { marginVertical: 3 },
});

export default withModelContext(WUSenderDetailsStepOne);
