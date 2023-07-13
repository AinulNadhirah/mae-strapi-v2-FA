import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { StyleSheet, View, ScrollView } from "react-native";

import {
    APPLY_SCREEN,
    CAPTURE_SELFIE_SCREEN,
    MAE_TERMS_COND,
    MORE,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import { LongTextInput } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Typography from "@components/Text";

import { useModelController } from "@context";

import { YELLOW, DISABLED } from "@constants/colors";
import { EXCLUDED_PREFIXES } from "@constants/data";
import {
    CONFIRM_FULL_NAME,
    CONTINUE,
    ENTER_FULL_NAME,
    FA_EKYC_CONFIRMNAME,
    NAME_ATLEAST_SIX_CHARS,
    NAME_NO_NUMBERS,
    NAME_NO_SPECIAL_CHARS,
    NAME_PREFIX_NOT_ALLOWED,
} from "@constants/strings";

import { leadingOrDoubleSpaceRegex, hasNumberRegex, maeNameRegex } from "@utils/dataModel";

function MAENameVerification({ route, navigation }) {
    const [name, setName] = useState("");
    const [validName, setValidName] = useState("");
    const [enalbeNextBtn, setEnableNextBtn] = useState(false);
    const { filledUserDetails } = route.params;
    const { getModel } = useModelController();

    useEffect(() => {
        if (name !== "") {
            setEnableNextBtn(true);
        }
    }, [name]);

    useEffect(() => {
        setName(route.params?.name ? route.params?.name.substr(0, 40) : "");
    }, []);

    function onNameChange(value) {
        setName(value);
    }

    function onDoneTap() {
        console.log("[MAENameVerification] >> [onDoneTap]", filledUserDetails);
        const { isZoloz } = getModel("misc");
        const isValidName = fullNameValidation();
        if (isValidName) {
            Object.assign(filledUserDetails?.onBoardDetails, { fullName: name });
            const navScreen = !isZoloz ? CAPTURE_SELFIE_SCREEN : MAE_TERMS_COND;
            navigation.navigate(navScreen, {
                ...route.params,
            });
        }
    }

    const fullNameValidation = () => {
        let err = "";
        const specialCharCheck = NAME_NO_SPECIAL_CHARS;
        const numberCheck = NAME_NO_NUMBERS;
        const lengthCheck = NAME_ATLEAST_SIX_CHARS;
        const prefixCheck = NAME_PREFIX_NOT_ALLOWED;
        // Check for leading or double spaces
        if (!leadingOrDoubleSpaceRegex(name)) {
            err = specialCharCheck;
        } else if (hasNumberRegex(name)) {
            // Check if there are any numbers
            err = numberCheck;
        } else if (!maeNameRegex(name)) {
            // Check for accepting valid special characters
            err = specialCharCheck;
        } else if (name.length < 6) {
            // Min length check
            err = lengthCheck;
        }

        // Check for title prefixes
        let excludedPrefixFlag = false;
        const nameArr = name.split(" ");
        for (const i in EXCLUDED_PREFIXES) {
            const prefix = EXCLUDED_PREFIXES[i];
            // if (name.indexOf(prefix) == 0 || name.indexOf(prefix.toLowerCase()) == 0)
            if (nameArr[0].toLocaleLowerCase() === prefix.toLocaleLowerCase()) {
                excludedPrefixFlag = true;
                break;
            }
        }
        if (excludedPrefixFlag) {
            err = prefixCheck;
        }
        setValidName(err);
        // Return true if no validation error
        return !err;
    };

    function onBackTap() {
        console.log("[MAENameVerification] >> [onBackTap]");
        navigation.goBack();
    }

    function onCloseTap() {
        console.log("[MAENameVerification] >> [onCloseTap]");
        navigation.navigate(filledUserDetails?.entryStack || MORE, {
            screen: filledUserDetails?.entryScreen || APPLY_SCREEN,
            params: filledUserDetails?.entryParams,
        });
    }

    return (
        <React.Fragment>
            <ScreenContainer backgroundType="color" analyticScreenName={FA_EKYC_CONFIRMNAME}>
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                            headerRightElement={<HeaderCloseButton onPress={onCloseTap} />}
                        />
                    }
                    paddingHorizontal={0}
                    paddingBottom={0}
                    paddingTop={0}
                    useSafeArea
                >
                    <React.Fragment>
                        <ScrollView
                            style={Style.scrollViewCls}
                            showsVerticalScrollIndicator={false}
                        >
                            {/* Loan details desc */}
                            <Typography
                                fontSize={20}
                                lineHeight={28}
                                fontWeight="300"
                                textAlign="left"
                                text={CONFIRM_FULL_NAME}
                                style={Style.headerLabelCls}
                            />
                            {/* User Name */}
                            <View style={Style.fieldViewCls}>
                                <LongTextInput
                                    maxLength={40}
                                    isValidate
                                    isValid={!validName}
                                    errorMessage={validName}
                                    value={name}
                                    placeholder={ENTER_FULL_NAME}
                                    onChangeText={onNameChange}
                                    numberOfLines={2}
                                />
                            </View>
                        </ScrollView>

                        {/* Bottom docked button container */}
                        <FixedActionContainer>
                            <View style={Style.bottomBtnContCls}>
                                <ActionButton
                                    activeOpacity={enalbeNextBtn ? 0.5 : 1}
                                    backgroundColor={enalbeNextBtn ? YELLOW : DISABLED}
                                    fullWidth
                                    componentCenter={
                                        <Typography
                                            fontSize={14}
                                            lineHeight={18}
                                            fontWeight="600"
                                            text={CONTINUE}
                                        />
                                    }
                                    onPress={onDoneTap}
                                />
                            </View>
                        </FixedActionContainer>
                    </React.Fragment>
                </ScreenLayout>
            </ScreenContainer>
        </React.Fragment>
    );
}

MAENameVerification.propTypes = {
    navigation: PropTypes.shape({
        goBack: PropTypes.func,
        navigate: PropTypes.func,
    }),
    route: PropTypes.shape({
        params: PropTypes.shape({
            filledUserDetails: PropTypes.shape({
                entryParams: PropTypes.any,
                entryScreen: PropTypes.string,
                entryStack: PropTypes.string,
                onBoardDetails: PropTypes.any,
            }),
            name: PropTypes.string,
        }),
    }),
};

const Style = StyleSheet.create({
    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },

    fieldViewCls: {
        marginTop: 25,
    },

    headerLabelCls: {
        marginTop: 15,
    },

    scrollViewCls: {
        paddingHorizontal: 36,
    },
});

export default MAENameVerification;
