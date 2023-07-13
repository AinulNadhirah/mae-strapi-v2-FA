import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";

import SlidingNumPad from "@screens/Property/Common/SlidingNumPad";

import { BANKINGV2_MODULE, FINANCIAL_LEAVE_CONTACT_COMPLETE } from "@navigation/navigationConstant";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import HeaderLabel from "@components/Label/HeaderLabel";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";
import { showErrorToast } from "@components/Toast";

import { useModelController } from "@context";

import { saveContactNo } from "@services";
import { logEvent } from "@services/analytics";

import { BLACK, DISABLED, DISABLED_TEXT, MEDIUM_GREY, YELLOW } from "@constants/colors";
import { FA_SCREEN_NAME, FA_VIEW_SCREEN, SUBMIT } from "@constants/strings";

import { isMalaysianMobileNum } from "@utils/dataModel";

const LeaveContact = ({ navigation, route }) => {
    const header = "Leave Your Contact Details";
    const prefix = "+60";

    const [phoneNumber, setPhoneNumber] = useState(
        route?.params?.contactNo
            ? route?.params?.contactNo.substring(0, 3) === prefix
                ? route?.params?.contactNo.substring(3)
                : route?.params?.contactNo
            : ""
    );
    const [buttonEnabled, setButtonEnabled] = useState(route?.params?.contactNo ? true : false);
    const [phoneNumberInvalid, setPhoneNumberInvalid] = useState(false);
    const [showNumPad, setShowNumPad] = useState(false);
    const { updateModel } = useModelController();

    useEffect(() => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "FinancialGoals_Queries",
        });
    }, []);

    function onPressBack() {
        navigation.goBack();
    }

    function onPressSubmit() {
        if (validatePhoneNumber(phoneNumber)) {
            setPhoneNumberInvalid(false);
            saveContact();
        } else {
            setPhoneNumberInvalid(true);
        }
    }

    async function saveContact() {
        try {
            const savingRequestObj = {
                ...route?.params,
                contactNo: prefix + phoneNumber,
            };
            const response = await saveContactNo(savingRequestObj, true);

            if (response?.data) {
                updateModel({
                    financialGoal: {
                        currentGoalId: response?.data?.goalId,
                    },
                });

                navigation.navigate(BANKINGV2_MODULE, {
                    screen: FINANCIAL_LEAVE_CONTACT_COMPLETE,
                    params: {
                        ...route?.params,
                        contactNo: phoneNumber,
                        goalId: response?.data?.goalId,
                    },
                });
            } else {
                showErrorToast({
                    message: "We are experiencing communication Error. Please try again.",
                });
            }
        } catch (error) {
            showErrorToast({ message: error?.message });
        }
    }

    function validatePhoneNumber(number) {
        return number?.length <= 10 && isMalaysianMobileNum("+60" + number);
    }

    function onTextPhonePress() {
        setShowNumPad(true);
    }

    function onNumPadDonePress() {
        setShowNumPad(false);
    }

    function onNumPadChange(value) {
        setPhoneNumberInvalid(false);
        if (value !== "") {
            setButtonEnabled(true);
        }
        setPhoneNumber(value);
    }

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <ScreenLayout
                header={
                    <HeaderLayout
                        headerLeftElement={<HeaderBackButton onPress={onPressBack} />}
                        headerCenterElement={<HeaderLabel>{header}</HeaderLabel>}
                        backgroundColor={MEDIUM_GREY}
                    />
                }
                useSafeArea
                paddingTop={0}
                paddingHorizontal={0}
                paddingBottom={0}
            >
                <View style={styles.container}>
                    <Typo
                        text="Please enter your mobile number below. Our team of experts will reach out to you soon to answer your queries."
                        fontSize={14}
                        fontWeight="400"
                        textAlign="left"
                        lineHeight={20}
                        style={styles.desc}
                    />
                    <Typo text="Mobile number" fontSize={14} fontWeight="400" textAlign="left" />
                    <TouchableOpacity onPress={onTextPhonePress}>
                        <TextInput
                            prefix={prefix}
                            value={phoneNumber}
                            isValidate={phoneNumber !== null}
                            isValid={!phoneNumberInvalid}
                            editable={false}
                            errorMessage="Please enter a valid mobile number in order to continue."
                        />
                    </TouchableOpacity>
                </View>
                <FixedActionContainer>
                    <ActionButton
                        fullWidth
                        backgroundColor={buttonEnabled ? YELLOW : DISABLED}
                        disabled={!buttonEnabled}
                        onPress={onPressSubmit}
                        componentCenter={
                            <Typo
                                text={SUBMIT}
                                fontWeight="600"
                                fontSize={14}
                                color={buttonEnabled ? BLACK : DISABLED_TEXT}
                            />
                        }
                    />
                </FixedActionContainer>
            </ScreenLayout>
            <SlidingNumPad
                showNumPad={showNumPad}
                value={phoneNumber}
                onChange={onNumPadChange}
                maxLength={14}
                onDone={onNumPadDonePress}
            />
        </ScreenContainer>
    );
};

LeaveContact.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 24,
    },
    desc: {
        paddingBottom: 25,
        paddingTop: 20,
    },
});

export default LeaveContact;
