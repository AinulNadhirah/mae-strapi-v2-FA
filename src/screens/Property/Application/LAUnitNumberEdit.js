import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { StyleSheet, ScrollView, View } from "react-native";

import {
    BANKINGV2_MODULE,
    LA_CONFIRMATION,
    LA_UNIT_NUMBER_EDIT,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";

import { logEvent } from "@services/analytics";

import { MEDIUM_GREY, DARK_GREY, YELLOW, DISABLED, BLACK, DISABLED_TEXT } from "@constants/colors";
import { CONFIRM, FA_SCREEN_NAME, FA_VIEW_SCREEN } from "@constants/strings";

import RadioYesNo from "../Common/RadioYesNo";
import { validateUnitNumber } from "./LAController";

function LAUnitNumberEdit({ route, navigation }) {
    const [propertyName, setPropertyName] = useState("");

    const [unitNumber, setUnitNumber] = useState("");
    const [isUnitNumberValid, setIsUnitNumberValid] = useState(true);
    const [unitNumberErrorMsg, setUnitNumberErrorMsg] = useState("");

    const [isUnitOwner, setIsUnitOwner] = useState(null);

    const [isContinueDisabled, setContinueDisabled] = useState(true);

    useEffect(() => {
        init();
    }, []);

    // Used to check if all fields are filled in, then accordingly enable/disable "Continue" btn
    useEffect(() => {
        setContinueDisabled(!(unitNumber && isUnitOwner));
    }, [unitNumber, isUnitOwner]);

    useEffect(() => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Property_ApplyLoan_Confirmation_EditPropertyDetails",
        });
    }, []);

    const init = () => {
        console.log("[LAUnitNumberEdit] >> [init]");

        // Pre-populate selected data
        populateSavedData();
    };

    function onBackPress() {
        console.log("[LAUnitNumberEdit] >> [onBackPress]");

        navigation.goBack();
    }

    function populateSavedData() {
        console.log("[LAUnitNumberEdit] >> [populateSavedData]");

        const navParams = route?.params ?? {};
        const paramsUnitNumber = navParams?.unitNo ?? null;
        const paramsIsUnitOwner = navParams?.isUnitOwner ?? null;
        const paramsPropertyName = navParams?.propertyName ?? null;

        // Property Name
        if (paramsPropertyName) setPropertyName(paramsPropertyName);

        // Unit Number
        if (paramsUnitNumber) setUnitNumber(paramsUnitNumber);

        // Unit Owner
        if (paramsIsUnitOwner) setIsUnitOwner(paramsIsUnitOwner);
    }

    function onChangeUnitNumber(value) {
        setUnitNumber(value);
    }

    function onUnitOwnerChange(value) {
        console.log("[LAUnitNumberEdit] >> [onUnitOwnerChange]");

        setIsUnitOwner(value);
    }

    function validateFormDetails(value) {
        console.log("[LAUnitNumberEdit] >> [validateFormDetails]");

        // Reset validation state
        setIsUnitNumberValid(true);
        setUnitNumberErrorMsg("");

        // Unit Number
        const { isValid, message } = validateUnitNumber(unitNumber);
        if (!isValid) {
            setUnitNumberErrorMsg(message);
            setIsUnitNumberValid(false);
            return false;
        }

        // Return true if passes validation check
        return true;
    }

    function onContinue() {
        console.log("[LAUnitNumberEdit] >> [onContinue]");

        const navParams = route?.params ?? {};
        const formData = getFormData();

        // Return if form validation fails
        const isFormValid = validateFormDetails();
        if (!isFormValid) return;

        // Navigate to Confirmation screen
        navigation.navigate(BANKINGV2_MODULE, {
            screen: LA_CONFIRMATION,
            params: {
                ...navParams,
                ...formData,
                updateData: true,
                editScreenName: LA_UNIT_NUMBER_EDIT,
            },
        });
    }

    function getFormData() {
        console.log("[LAUnitNumberEdit] >> [getFormData]");

        return {
            unitNo: unitNumber ? unitNumber.trim() : unitNumber,
            isUnitOwner,
        };
    }

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <ScreenLayout
                header={
                    <HeaderLayout headerLeftElement={<HeaderBackButton onPress={onBackPress} />} />
                }
                paddingHorizontal={0}
                paddingBottom={0}
                paddingTop={24}
                useSafeArea
            >
                <>
                    <ScrollView style={Style.container} showsVerticalScrollIndicator={false}>
                        {/* Title */}
                        <Typo
                            fontWeight="600"
                            lineHeight={24}
                            text="Edit property details"
                            textAlign="left"
                        />

                        {/* Unit Number */}
                        <Typo lineHeight={24} textAlign="left" style={Style.fieldLabelCls}>
                            {"What's your unit number at "}
                            <Typo
                                fontWeight="600"
                                lineHeight={24}
                                text={propertyName}
                                textAlign="left"
                            />
                            <Typo lineHeight={24} text="?" textAlign="left" />
                        </Typo>
                        <TextInput
                            autoFocus
                            minLength={1}
                            maxLength={15}
                            isValidate
                            isValid={isUnitNumberValid}
                            errorMessage={unitNumberErrorMsg}
                            value={unitNumber}
                            onChangeText={onChangeUnitNumber}
                            blurOnSubmit
                            // style={styles.unitTextInput}
                            returnKeyType="done"
                        />

                        {/* Unit Owner */}
                        <Typo lineHeight={24} textAlign="left" style={Style.fieldLabelCls}>
                            {"Are you going to be the sole owner for "}
                            <Typo
                                fontWeight="600"
                                lineHeight={24}
                                text={propertyName}
                                textAlign="left"
                            />
                            <Typo lineHeight={24} text="?" textAlign="left" />
                        </Typo>
                        <RadioYesNo defaultValue={isUnitOwner} onChange={onUnitOwnerChange} />
                    </ScrollView>

                    {/* Bottom Container */}
                    <FixedActionContainer>
                        <View style={Style.bottomBtnContCls}>
                            <Typo
                                fontSize={12}
                                fontWeight="400"
                                lineHeight={20}
                                style={Style.noteLabel}
                                text="Your loan offer is only valid if you're the owner of the property."
                                textAlign="left"
                                color={DARK_GREY}
                            />
                            <ActionButton
                                disabled={isContinueDisabled}
                                activeOpacity={isContinueDisabled ? 1 : 0.5}
                                backgroundColor={isContinueDisabled ? DISABLED : YELLOW}
                                fullWidth
                                componentCenter={
                                    <Typo
                                        color={isContinueDisabled ? DISABLED_TEXT : BLACK}
                                        lineHeight={18}
                                        fontWeight="600"
                                        text={CONFIRM}
                                    />
                                }
                                onPress={onContinue}
                            />
                        </View>
                    </FixedActionContainer>
                </>
            </ScreenLayout>
        </ScreenContainer>
    );
}

LAUnitNumberEdit.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

const Style = StyleSheet.create({
    bottomBtnContCls: {
        width: "100%",
    },

    container: {
        flex: 1,
        paddingHorizontal: 36,
    },

    fieldLabelCls: {
        marginTop: 25,
    },

    noteLabel: {
        marginBottom: 16,
        paddingHorizontal: 8,
        paddingTop: 8,
    },
});

export default LAUnitNumberEdit;
