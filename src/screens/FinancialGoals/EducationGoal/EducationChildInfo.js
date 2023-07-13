import PropTypes from "prop-types";
import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, Keyboard } from "react-native";

import SlidingNumPad from "@screens/Property/Common/SlidingNumPad";

import { BANKINGV2_MODULE, FINANCIAL_EDUCATION_LEVEL } from "@navigation/navigationConstant";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import { LongTextInput } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import HeaderLabel from "@components/Label/HeaderLabel";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";

import { BLACK, DISABLED, DISABLED_TEXT, YELLOW } from "@constants/colors";
import {
    EDUCATION_ENTER_CHILD_AGE,
    EDUCATION_ENTER_CHILD_DETAILS,
    EDUCATION_ENTER_CHILD_NAME,
    EDUCATION_GOAL,
    GOAL_BASED_INVESTMENT,
    FA_FIN_GOAL_CHILD_EDU_NAME,
} from "@constants/strings";

import { nameRegex } from "@utils/dataModel";

const EducationChildInfo = ({ navigation, route }) => {
    const paramsChildName = route?.params?.childName;
    const paramsChildAge = route?.params?.childAge;
    const [childName, setChildName] = useState(paramsChildName ?? "");
    const [childAge, setChildAge] = useState(paramsChildAge ? paramsChildAge.toString() : "8");
    const [buttonEnabled, setButtonEnabled] = useState(
        paramsChildName && paramsChildAge ? true : false
    );
    const [showNumPad, setShowNumPad] = useState(false);
    const [ageError, setAgeError] = useState(null);

    function onPressBack() {
        navigation.goBack();
    }

    function onChildNameChanged(input) {
        setChildName(input);
        setButtonEnabled(childAge && nameRegex(input));
    }

    function onChildAgeChanged(input) {
        setChildAge(input);
        setButtonEnabled(childName && input);
    }

    function onNavigateNext() {
        if (!validateAge()) {
            setAgeError(true);
            return;
        } else {
            setAgeError(false);
        }

        navigation.navigate(BANKINGV2_MODULE, {
            screen: FINANCIAL_EDUCATION_LEVEL,
            params: {
                ...route?.params,
                childAge: Number(childAge),
                childName: childName ?? "",
            },
        });
    }

    function validateAge() {
        return childAge >= 1 && childAge <= 99;
    }

    function onAgePress() {
        Keyboard.dismiss();
        setShowNumPad(true);
    }

    function onNumPadDonePress() {
        setShowNumPad(false);
    }

    function onNameFocus() {
        setShowNumPad(false);
    }

    return (
        <>
            <ScreenContainer backgroundType="color" analyticScreenName={FA_FIN_GOAL_CHILD_EDU_NAME}>
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={onPressBack} />}
                            headerCenterElement={<HeaderLabel>{GOAL_BASED_INVESTMENT}</HeaderLabel>}
                        />
                    }
                    useSafeArea
                    paddingTop={0}
                    paddingHorizontal={0}
                    paddingBottom={0}
                >
                    <View style={styles.container}>
                        <Typo
                            text={EDUCATION_GOAL}
                            fontWeight="600"
                            fontSize={16}
                            lineHeight={24}
                            textAlign="left"
                            style={styles.title}
                        />
                        <Typo
                            text={EDUCATION_ENTER_CHILD_DETAILS}
                            fontWeight="400"
                            fontSize={14}
                            textAlign="left"
                            style={styles.subtitle}
                        />
                        <Typo
                            text={EDUCATION_ENTER_CHILD_NAME}
                            fontSize={14}
                            fontWeight="400"
                            textAlign="left"
                            style={styles.questionTitle}
                        />
                        <LongTextInput
                            minLength={1}
                            maxLength={80}
                            value={childName}
                            placeholder=""
                            autoFocus={true}
                            onChangeText={onChildNameChanged}
                            numberOfLines={2}
                            onFocus={onNameFocus}
                            returnKeyType="done"
                            isValid={nameRegex(childName)}
                            isValidate={true}
                            errorMessage="Invalid Name of Child"
                        />
                        <Typo
                            text={EDUCATION_ENTER_CHILD_AGE}
                            fontSize={14}
                            fontWeight="400"
                            textAlign="left"
                            style={styles.questionTitle}
                        />

                        <TouchableOpacity onPress={onAgePress}>
                            <TextInput
                                suffix="Years Old"
                                placeholder=""
                                value={childAge}
                                editable={false}
                                isValidate={true}
                                isValid={!ageError}
                                errorMessage="Please enter a value between 1 and 99"
                            />
                        </TouchableOpacity>
                    </View>
                    <FixedActionContainer>
                        <ActionButton
                            fullWidth
                            onPress={onNavigateNext}
                            disabled={!buttonEnabled}
                            backgroundColor={buttonEnabled ? YELLOW : DISABLED}
                            componentCenter={
                                <Typo
                                    text="Next"
                                    fontWeight="600"
                                    fontSize={14}
                                    color={buttonEnabled ? BLACK : DISABLED_TEXT}
                                />
                            }
                        />
                    </FixedActionContainer>
                </ScreenLayout>
            </ScreenContainer>
            <SlidingNumPad
                showNumPad={showNumPad}
                value={childAge}
                maxLength={2}
                onChange={onChildAgeChanged}
                onDone={onNumPadDonePress}
            />
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 24,
    },
    questionTitle: {
        paddingTop: 24,
    },
    subtitle: {
        paddingTop: 8,
    },
    title: {
        paddingTop: 16,
    },
});

EducationChildInfo.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
};

export default EducationChildInfo;
