import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import {
    Image,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
    Platform,
    KeyboardAvoidingView,
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

import { useModelController, withModelContext } from "@context";

import { BLACK, DARK_GREY, DISABLED, DISABLED_TEXT, MEDIUM_GREY, YELLOW } from "@constants/colors";
import {
    CONTINUE,
    INVALID_CHAR_ERROR,
    WESTERN_UNION,
    DROPDOWN_DEFAULT_TEXT,
} from "@constants/strings";

import { leadingOrDoubleSpaceRegex, remittanceAddressRegex } from "@utils/dataModel";
import { getCountryDataByName } from "@utils/dataModel/utilityRemittance";

import assets from "@assets";

function WUSenderDetailsStepTwo() {
    const navigation = useNavigation();
    const route = useRoute();
    const { WUSenderDetailsStepOne, transferParams, fromWUConfirmation, favorite } =
        route?.params || {};
    const { getModel, updateModel } = useModelController();
    const [fieldsState, changeFieldState] = useState(preLoadData());
    const {
        tempAddressLineOne,
        tempAddressLineTwo,
        city,
        state,
        postCode,
        country,
        tickState,
        address1Error,
        address2Error,
    } = fieldsState;
    const isSenderMsian = WUSenderDetailsStepOne?.citizenship === "M";
    const isCTADisabled =
        (!isSenderMsian &&
            (!tempAddressLineOne ||
                !tempAddressLineTwo ||
                !country ||
                !city ||
                !state ||
                !postCode ||
                !country?.countryName)) ||
        address1Error ||
        address2Error;

    function preLoadData() {
        const { WUSenderDetailsStepTwo } = getModel("overseasTransfers") ?? "";
        return {
            tempAddressLineOne: WUSenderDetailsStepTwo?.tempAddressLineOne || "",
            tempAddressLineTwo: WUSenderDetailsStepTwo?.tempAddressLineTwo || "",
            state: WUSenderDetailsStepTwo?.state || "",
            postCode: WUSenderDetailsStepTwo?.postCode || "",
            country: WUSenderDetailsStepTwo?.country || "",
            tickState: WUSenderDetailsStepTwo?.tickState || tickState,
            city: WUSenderDetailsStepTwo?.city || "",
            address1Error: "",
            address2Error: "",
        };
    }

    function onChangeFieldValue(fieldName, fieldValue) {
        if (fieldName === "tempAddressLineOne" || fieldName === "tempAddressLineTwo") {
            const val = fieldValue.replace("  ", " ");
            const commErr2 =
                fieldValue !== ""
                    ? `Address line ${
                          fieldName === "tempAddressLineOne" ? "1" : "2"
                      } must not contain leading/double\nspaces`
                    : "";
            let err = "";
            if (!leadingOrDoubleSpaceRegex(val) || /\s{2,}$/.test(val)) {
                err = commErr2;
            } else if (val && !remittanceAddressRegex(val, "wu")) {
                err = INVALID_CHAR_ERROR;
            } else if (val?.length < 5) {
                err = "Must be more than 5 characters";
            }

            const addressError =
                fieldName === "tempAddressLineOne"
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

    const onPressCountryDropdown = useCallback(() => {
        navigation.push("OverseasCountryListScreen", {
            ...route?.params,
            callBackFunction: onCountrySelectionDone,
            from: "WUSenderDetailsStepTwo",
            showSenderCountryList: true,
        });
    }, []);

    function onCountrySelectionDone(countryItem) {
        changeFieldState((prevState) => ({
            ...prevState,
            country: countryItem,
        }));
    }

    const onChangeTickState = useCallback((inputTickState) => {
        if (inputTickState) {
            changeFieldState((prevState) => ({
                ...prevState,
                tickState: inputTickState,
                tempAddressLineOne: WUSenderDetailsStepOne.addressLineOne,
                tempAddressLineTwo: WUSenderDetailsStepOne.addressLineTwo,
                state: WUSenderDetailsStepOne.state,
                postCode: WUSenderDetailsStepOne.postCode,
                country: getCountryDataByName(WUSenderDetailsStepOne?.addressCountry?.countryName),
                city: WUSenderDetailsStepOne?.city,
            }));
        } else {
            changeFieldState((prevState) => ({
                ...prevState,
                tickState: inputTickState,
                tempAddressLineOne: "",
                tempAddressLineTwo: "",
                state: "",
                postCode: "",
                country: "",
                city: "",
            }));
        }
    }, []);

    const onTick = useCallback(() => {
        onChangeTickState(!tickState);
    }, [onChangeTickState, tickState]);

    const onBackButtonPress = useCallback(() => {
        if ((route?.params?.favorite || route?.params?.fromWUConfirmation) && isCTADisabled) {
            return;
        }

        const senderDetailsStepTwoObj = {
            tempAddressLineOne,
            tempAddressLineTwo,
            state,
            postCode,
            country,
            tickState,
            city,
        };

        updateModel({
            overseasTransfers: {
                WUSenderDetailsStepTwo: senderDetailsStepTwoObj,
            },
        });
        navigation.navigate("WUSenderDetailsStepOne", {
            ...route?.params,
        });
    }, [
        city,
        country,
        navigation,
        postCode,
        route?.params,
        state,
        tempAddressLineOne,
        tempAddressLineTwo,
        tickState,
        updateModel,
        isCTADisabled
    ]);

    function onContinue() {
        const senderDetailsStepTwoObj = {
            tempAddressLineOne,
            tempAddressLineTwo,
            state,
            postCode,
            country,
            tickState,
            city,
        };

        updateModel({
            overseasTransfers: {
                WUSenderDetailsStepTwo: senderDetailsStepTwoObj,
            },
        });
        navigation.navigate("WUSenderDetailsStepThree", {
            ...route?.params,
            fromWUConfirmation: fromWUConfirmation || favorite,
            WUSenderDetailsStepTwo: senderDetailsStepTwoObj,
            transferParams: {
                ...transferParams,
                remittanceData: transferParams?.remittanceData,
            },
        });
    }

    function getHeaderUI() {
        return (
            <HeaderLayout
                headerLeftElement={<HeaderBackButton onPress={onBackButtonPress} />}
                headerCenterElement={
                    <Typo
                        color={DARK_GREY}
                        text="Step 2 of 5"
                        fontWeight="600"
                        fontSize={12}
                        lineHeight={18}
                    />
                }
            />
        );
    }

    const onChangeAddressOne = useCallback((value) => {
        onChangeFieldValue("tempAddressLineOne", value.replace(/\s{2,}/g, ""));
    }, []);

    const onChangeAddressTwo = useCallback((value) => {
        onChangeFieldValue("tempAddressLineTwo", value.replace(/\s{2,}/g, ""));
    }, []);

    const onChangeCity = useCallback((value) => {
        onChangeFieldValue("city", value);
    }, []);

    const onChangeState = useCallback((value) => {
        onChangeFieldValue("state", value);
    }, []);

    const onChangePostcode = useCallback((value) => {
        onChangeFieldValue("postCode", value);
    }, []);

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <ScreenLayout
                paddingBottom={0}
                paddingTop={16}
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
                        <View style={styles.container}>
                            <TouchableOpacity
                                activeOpacity={1}
                                style={styles.radioBtnContainer}
                                onPress={onTick}
                            >
                                <Image
                                    source={
                                        tickState ? assets.icRadioChecked : assets.icRadioUnchecked
                                    }
                                    style={styles.icon}
                                    resizeMode="stretch"
                                />
                                <Typo
                                    style={styles.nationalityTxt}
                                    text="My temporary address is the same as my primary address."
                                    textAlign="left"
                                    fontSize={14}
                                    lineHeight={22}
                                    fontWeight="400"
                                />
                            </TouchableOpacity>
                        </View>
                        <TextInputWithLengthCheck
                            label="Temporary address line 1"
                            placeholder="e.g. Unit no/Floor/Building"
                            value={tempAddressLineOne}
                            inputLengthCheck
                            isValidate
                            isValid={!address1Error}
                            errorMessage={address1Error}
                            maxLength={40}
                            onChangeText={onChangeAddressOne}
                        />
                        <TextInputWithLengthCheck
                            label="Temporary address line 2"
                            placeholder="e.g. Street name"
                            value={tempAddressLineTwo}
                            inputLengthCheck
                            isValidate
                            isValid={!address2Error}
                            errorMessage={address2Error}
                            maxLength={40}
                            onChangeText={onChangeAddressTwo}
                        />
                        <TextInputWithLengthCheck
                            label="Postcode"
                            placeholder="e.g. 52200"
                            keyboardType={Platform.OS === "ios" ? "number-pad" : "numeric"}
                            maxLength={9}
                            value={postCode}
                            onChangeText={onChangePostcode}
                        />
                        <TextInputWithLengthCheck
                            label="City"
                            placeholder="e.g. Kuala Lumpur"
                            value={city}
                            maxLength={40}
                            onChangeText={onChangeCity}
                        />
                        <TextInputWithLengthCheck
                            label="State/Province"
                            placeholder="e.g. WP Kuala Lumpur"
                            value={state}
                            maxLength={40}
                            onChangeText={onChangeState}
                        />

                        <Typo
                            style={styles.popUpTitle}
                            textAlign="left"
                            text="Country"
                            fontSize={14}
                            fontWeight="400"
                            lineHeight={18}
                        />

                        <Dropdown
                            title={country?.countryName?.toUpperCase() || DROPDOWN_DEFAULT_TEXT}
                            align="left"
                            borderWidth={0.5}
                            onPress={onPressCountryDropdown}
                        />
                    </ScrollView>
                </KeyboardAvoidingView>
                <FixedActionContainer>
                    <ActionButton
                        disabled={isCTADisabled}
                        backgroundColor={isCTADisabled ? DISABLED : YELLOW}
                        fullWidth
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
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 5,
    },
    contentContainer: {
        paddingBottom: 25,
        paddingHorizontal: 24,
    },
    icon: {
        height: 20,
        width: 20,
    },
    nationalityTxt: {
        marginLeft: 8,
    },
    pageTitle: { marginTop: 4 },
    popUpTitle: { marginBottom: 22, marginTop: 24 },
    radioBtnContainer: {
        flexDirection: "row",
        marginTop: 17,
    },
});

export default withModelContext(WUSenderDetailsStepTwo);
