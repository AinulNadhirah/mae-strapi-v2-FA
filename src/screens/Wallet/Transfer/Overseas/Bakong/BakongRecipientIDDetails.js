import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
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
import { AccountDetailsView } from "@components/Common";
import { Dropdown } from "@components/Common/DropDownButtonCenter";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import TextInputWithLengthCheck from "@components/TextInputWithLengthCheck";
import Typo from "@components/TextWithInfo";
import { showErrorToast } from "@components/Toast";

import { useModelController, withModelContext } from "@context";

import { RemittanceAnalytics } from "@services/analytics/analyticsRemittance";

import { BLACK, DARK_GREY, DISABLED, DISABLED_TEXT, MEDIUM_GREY, YELLOW } from "@constants/colors";
import { CONTINUE, DROPDOWN_DEFAULT_TEXT } from "@constants/strings";

import { formatBakongMobileNumbers } from "@utils/dataModel/utility";

import assets from "@assets";

function BakongRecipientIDDetails() {
    const navigation = useNavigation();
    const route = useRoute();
    const transferParams = route.params?.transferParams;
    const { getModel, updateModel } = useModelController();
    const { BakongRecipientIDDetails } = getModel("overseasTransfers");
    const [nationality, changeNationalityState] = useState("NM");
    const [idType, changeIdType] = useState(BakongRecipientIDDetails?.idType ?? "");
    const [fieldsState, changeFieldState] = useState(preLoadData());
    const { icPassportNumber, idIssueCountry, screenData, idErr } = fieldsState;
    const isCTADisabled =
        idErr ||
        icPassportNumber?.length < 5 ||
        !nationality ||
        !icPassportNumber ||
        (!idIssueCountry && nationality === "NM");

    function preLoadData() {
        return {
            icPassportNumber: BakongRecipientIDDetails?.icPassportNumber ?? icPassportNumber,
            idIssueCountry: BakongRecipientIDDetails?.idIssueCountry ?? {
                countryName: "Cambodia",
                countryCode: "KH",
            },
            screenData: {
                image: transferParams?.image,
                name: transferParams?.name,
                description1: "+855 " + formatBakongMobileNumbers(transferParams?.mobileNo),
                description2: transferParams?.transactionTo,
            },
            idErr: "",
        };
    }

    function onChangeFieldValue(fieldName, fieldValue) {
        changeFieldState((prevState) => ({ ...prevState, [fieldName]: fieldValue, idErr: "" }));
    }

    const changeNationality = useCallback((nationality) => {
        changeNationalityState(nationality);
        onChangeFieldValue(
            "idIssueCountry",
            nationality === "M"
                ? { countryName: "Malaysia", countryCode: "MY" }
                : { countryName: "Cambodia", countryCode: "KH" }
        );
    }, []);

    const onChangeNationalityNM = useCallback(() => changeNationality("NM"), [changeNationality]);
    const onChangeNationalityM = useCallback(() => changeNationality("M"), [changeNationality]);
    const onChangeIdTypePP = useCallback(() => changeIdType("PASSPORT"), []);
    const onChangeIdTypeIC = useCallback(() => changeIdType("NID"), []);

    function onCountrySelectionDone(countryItem) {
        onChangeFieldValue("idIssueCountry", countryItem);
    }

    function onPressCountryDropdown() {
        navigation.push("OverseasCountryListScreen", {
            ...route?.params,
            callBackFunction: onCountrySelectionDone,
            from: "BakongRecipientIDDetails",
            isBakong: true,
        });
    }

    const onBackButtonPress = () => {
        const recipientIDDetailsObj = {
            nationality,
            idType,
            icPassportNumber,
            idIssueCountry,
            screenData: {
                image: transferParams?.image,
                name: transferParams?.name,
                description1: "+855 " + formatBakongMobileNumbers(transferParams?.mobileNo),
                description2: "Cambodia (Bakong Wallet)",
            },
        };
        updateModel({
            overseasTransfers: {
                BakongRecipientIDDetails: recipientIDDetailsObj,
            },
        });

        if (route?.params?.from === "BakongDetailsConfirmation") {
            navigation.navigate(route?.params?.from, {
                ...route?.params,
                from: "",
            });
            return;
        }
        navigation.goBack();
    };

    async function onContinue() {
        const isInvalid = /[^0-9a-zA-Z]+/g.test(icPassportNumber);
        if (isInvalid) {
            showErrorToast({ message: "Please remove special characters." });
            return;
        }
        const recipientIDDetailsObj = {
            nationality,
            idType,
            icPassportNumber,
            idIssueCountry,
            screenData: {
                image: transferParams?.image,
                name: transferParams?.name,
                description1: "+855 " + formatBakongMobileNumbers(transferParams?.mobileNo),
                description2: "Cambodia (Bakong Wallet)",
            },
        };
        updateModel({
            overseasTransfers: {
                BakongRecipientIDDetails: recipientIDDetailsObj,
            },
        });

        RemittanceAnalytics.BakongRecipientDetailsConfirm(
            recipientIDDetailsObj?.nationality,
            recipientIDDetailsObj?.idIssueCountry.countryName
        );
        navigation.navigate("BakongRecipientAddressDetails", {
            ...route?.params,
            transferParams: {
                ...route?.params?.transferParams,
                recipientIdType: idType,
            },
            nationalityChanged:
                route?.params?.from === "BakongDetailsConfirmation" &&
                BakongRecipientIDDetails?.nationality !== nationality,
            BakongRecipientIDDetails: recipientIDDetailsObj,
        });
    }

    function updateData() {
        onChangeFieldValue("screenData", {
            image: transferParams?.image,
            name: transferParams?.name,
            description1: "+855 " + formatBakongMobileNumbers(transferParams?.mobileNo),
            description2: "Cambodia (Bakong Wallet)",
        });
    }

    function getHeaderUI() {
        return (
            <HeaderLayout
                headerLeftElement={<HeaderBackButton onPress={onBackButtonPress} />}
                headerCenterElement={
                    <Typo
                        color={DARK_GREY}
                        text="Step 1 of 3"
                        fontWeight="600"
                        fontSize={12}
                        lineHeight={18}
                    />
                }
            />
        );
    }
    function getNationalityUI(malaysian) {
        return (
            <Image
                source={nationality === malaysian ? assets.icChecked : assets.icRadioUnchecked}
                style={styles.radioBtn}
                resizeMode="stretch"
            />
        );
    }

    useEffect(() => {
        updateData();
        RemittanceAnalytics.trxRecipentDetailsLoaded("Bakong");
    }, []);

    useEffect(() => {
        if (route?.params?.from === "BakongDetailsConfirmation") {
            changeNationalityState(BakongRecipientIDDetails?.nationality);
        }
    }, [BakongRecipientIDDetails?.nationality, route?.params?.from]);

    const onChangeIcPassport = useCallback((value) => {
        onChangeFieldValue("icPassportNumber", value);
    }, []);

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <ScreenLayout
                paddingBottom={0}
                paddingHorizontal={0}
                useSafeArea
                header={getHeaderUI()}
            >
                <ScrollView
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                >
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "position" : ""}
                        enabled
                        showsVerticalScrollIndicator={false}
                        keyboardVerticalOffset={100}
                    >
                        <View style={styles.container}>
                            <View style={styles.headerContainer}>
                                <AccountDetailsView
                                    data={
                                        screenData?.name
                                            ? screenData
                                            : {
                                                  image: transferParams?.image,
                                                  name: transferParams?.name,
                                                  description1:
                                                      "+855 " +
                                                      formatBakongMobileNumbers(
                                                          transferParams?.mobileNo
                                                      ),
                                                  description2: "Cambodia (Bakong Wallet)",
                                              }
                                    }
                                    base64
                                    greyed
                                />
                            </View>
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

                            {(nationality === "NM" || !nationality) && (
                                <>
                                    <Typo
                                        style={styles.countryText}
                                        textAlign="left"
                                        text="Country"
                                        fontSize={14}
                                        fontWeight="400"
                                        lineHeight={18}
                                    />
                                    <Dropdown
                                        title={idIssueCountry?.countryName || DROPDOWN_DEFAULT_TEXT}
                                        align="left"
                                        borderWidth={0.5}
                                        onPress={onPressCountryDropdown}
                                    />
                                </>
                            )}
                            <View style={styles.idType}>
                                <Typo
                                    text="Recipient’s ID type"
                                    textAlign="left"
                                    fontSize={14}
                                    lineHeight={18}
                                    fontWeight="400"
                                />
                                <View style={styles.radioBtnAlignment}>
                                    <TouchableOpacity
                                        style={styles.radioBtnContainer}
                                        onPress={onChangeIdTypeIC}
                                    >
                                        <Image
                                            source={
                                                idType === "NID"
                                                    ? assets.icChecked
                                                    : assets.icRadioUnchecked
                                            }
                                            style={styles.radioBtn}
                                            resizeMode="stretch"
                                        />
                                        <Typo
                                            style={styles.nationalityTxt}
                                            text="National ID"
                                            textAlign="left"
                                            fontSize={14}
                                            lineHeight={18}
                                            fontWeight="600"
                                        />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.radioBtnContainer}
                                        onPress={onChangeIdTypePP}
                                    >
                                        <Image
                                            source={
                                                idType === "PASSPORT"
                                                    ? assets.icChecked
                                                    : assets.icRadioUnchecked
                                            }
                                            style={styles.radioBtn}
                                            resizeMode="stretch"
                                        />
                                        <Typo
                                            style={styles.nationalityTxt}
                                            text="Passport"
                                            textAlign="left"
                                            fontSize={14}
                                            lineHeight={18}
                                            fontWeight="600"
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            {idType !== "" && (
                                <TextInputWithLengthCheck
                                    label={`${
                                        idType === "NID" ? "National ID" : "Passport"
                                    } number`}
                                    placeholder="e.g. 910102 03 5678"
                                    value={icPassportNumber}
                                    maxLength={15}
                                    isValid={idErr === ""}
                                    isValidate={idErr !== ""}
                                    onChangeText={onChangeIcPassport}
                                    errorMessage={idErr}
                                />
                            )}
                        </View>
                    </KeyboardAvoidingView>
                </ScrollView>
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
        paddingBottom: 100,
    },
    contentContainer: {
        paddingBottom: 25,
        paddingHorizontal: 24,
    },
    countryText: { marginBottom: 8, marginTop: 24 },
    headerContainer: {
        justifyContent: "flex-start",
    },
    idType: { marginTop: 24 },
    nationalityTxt: {
        marginLeft: 8,
    },
    radioBtn: {
        height: 20,
        width: 20,
    },
    radioBtnAlignment: { flexDirection: "row" },
    radioBtnContainer: {
        flexDirection: "row",
        marginTop: 17,
        paddingRight: "5%",
    },
});

export default withModelContext(BakongRecipientIDDetails);
