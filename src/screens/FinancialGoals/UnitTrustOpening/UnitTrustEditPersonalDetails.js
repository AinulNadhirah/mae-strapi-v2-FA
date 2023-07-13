import PropTypes from "prop-types";
import React, { useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, Dimensions, TouchableOpacity } from "react-native";

import SlidingNumPad from "@screens/Property/Common/SlidingNumPad";

import { BANKINGV2_MODULE, UNIT_TRUST_OPENING_CONFIRMATION } from "@navigation/navigationConstant";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import { ScrollPickerView } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import TitleAndDropdownPill from "@components/FinancialGoal/TitleAndDropdownPill";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";

import { BLACK, DISABLED, DISABLED_TEXT, GREY, MEDIUM_GREY, YELLOW } from "@constants/colors";
import { CONTINUE, DROPDOWN_DEFAULT_TEXT } from "@constants/strings";

const UnitTrustEditPersonalDetails = ({ route, navigation }) => {
    const [addr1, setAddr1] = useState(route?.params?.addr1);
    const [addr2, setAddr2] = useState(route?.params?.addr2);
    const [addr3, setAddr3] = useState(route?.params?.addr3);
    const [postcode, setPostCode] = useState(route?.params?.postcode);
    const [city, setCity] = useState(route?.params?.city);
    const [showPicker, setShowPicker] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState(route?.params?.countryCode);
    const [selectedState, setSelectedState] = useState(route?.params?.stateCode);
    const [mobileNo, setMobileNo] = useState(route?.params?.mobileNo);
    const [homePhoneNo, setHomePhoneNo] = useState(route?.params?.homePhoneNo);
    const [email, setEmail] = useState(route?.params?.email);
    const [showNumPad, setShowNumPad] = useState(false);
    const [selectedPickerIndex, setSelectedPickerIndex] = useState(null);
    const [currentNumPadValue, setCurrentNumPadValue] = useState(null);
    const [buttonEnabled, setButtonEnabled] = useState(false);
    const [pickerOptions, setPickerOptions] = useState([]);
    const currentPicker = useRef();
    const currentNumPad = useRef();
    const maxNumberLength = useRef();

    useEffect(() => {
        if (addr1 && addr2 && postcode && selectedCountry && email && mobileNo) {
            setButtonEnabled(true);
        } else {
            setButtonEnabled(false);
        }
    }, [addr1, addr2, postcode, selectedCountry, email, mobileNo]);

    function onBackButtonPress() {
        navigation.goBack();
    }

    function onCountryPress() {
        const currentIndex = route?.params?.countryOptions?.findIndex((item) => {
            return item?.value === selectedCountry;
        });
        currentPicker.current = "country";
        setSelectedPickerIndex(currentIndex);

        const countryOptions = (() => {
            return route?.params?.countryOptions?.map((item) => {
                return {
                    name: item?.label,
                    value: item?.value,
                };
            });
        })();

        setPickerOptions(countryOptions);
        setShowPicker(true);
    }

    function onStatePress() {
        if (!selectedCountry) return;
        const stateOptionsByCountry =
            route?.params?.stateOptions?.["MDM_PARTY_ADDRESS_COUNTRY_" + selectedCountry];
        const currentIndex = stateOptionsByCountry?.findIndex((item) => {
            return item?.value === selectedState;
        });

        currentPicker.current = "state";
        setSelectedPickerIndex(currentIndex);
        const stateOptionsPicker = (() => {
            return stateOptionsByCountry?.map((item) => {
                return {
                    name: item?.label,
                    value: item?.value,
                };
            });
        })();
        setPickerOptions(stateOptionsPicker);
        setShowPicker(true);
    }

    function onPressContinue() {
        navigation.navigate(BANKINGV2_MODULE, {
            screen: UNIT_TRUST_OPENING_CONFIRMATION,
            params: {
                name: route?.params?.name,
                addr1,
                addr2,
                addr3,
                postcode,
                city,
                countryCode: selectedCountry,
                countryValue: selectedCountryLabel,
                stateCode: selectedState,
                stateValue: selectedStateLabel,
                mobileNo,
                mobCountryCode: route?.params?.mobCountryCode,
                homePhoneNo,
                email,
            },
        });
    }

    function onAddr1Changed(value) {
        setAddr1(value);
    }

    function onAddr2Changed(value) {
        setAddr2(value);
    }

    function onAddr3Changed(value) {
        setAddr3(value);
    }

    function onCityChanged(value) {
        setCity(value);
    }

    function onPostcodePress() {
        setCurrentNumPadValue(postcode);
        currentNumPad.current = "postcode";
        maxNumberLength.current = 6;
        setShowNumPad(true);
    }

    function onMobileNoPress() {
        setCurrentNumPadValue(mobileNo);
        currentNumPad.current = "mobileNo";
        maxNumberLength.current = 9;
        setShowNumPad(true);
    }

    function onHomePhoneNoPress() {
        setCurrentNumPadValue(homePhoneNo);
        currentNumPad.current = "homePhoneNo";
        maxNumberLength.current = 9;
        setShowNumPad(true);
    }

    function onEmailChanged(value) {
        setEmail(value);
    }

    function onNumPadChange(value) {
        switch (currentNumPad.current) {
            case "postcode":
                setCurrentNumPadValue(value);
                setPostCode(value);
                break;
            case "mobileNo":
                setCurrentNumPadValue(value);
                setMobileNo(value);
                break;
            case "homePhoneNo":
                setCurrentNumPadValue(value);
                setHomePhoneNo(value);
                break;
            default:
                break;
        }
    }

    function onNumPadDonePress() {
        setShowNumPad(false);
    }

    function onScrollPickerDoneButtonPressed(selectedItem) {
        if (currentPicker.current === "country") {
            setSelectedCountry(selectedItem?.value);
        } else {
            setSelectedState(selectedItem?.value);
        }

        setShowPicker(false);
    }

    function onScrollPickerCancelButtonPressed() {
        setShowPicker(false);
    }

    const selectedCountryLabel = (() => {
        return route?.params?.countryOptions?.filter((item) => {
            return item.value === selectedCountry;
        })?.[0]?.label;
    })();

    const selectedStateLabel = (() => {
        return route?.params?.stateOptions?.[
            "MDM_PARTY_ADDRESS_COUNTRY_" + selectedCountry
        ]?.filter((item) => {
            return item?.value === selectedState;
        })?.[0]?.label;
    })();

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <ScreenLayout
                header={
                    <HeaderLayout
                        headerLeftElement={<HeaderBackButton onPress={onBackButtonPress} />}
                        headerCenterElement={
                            <Typo
                                fontSize={16}
                                fontWeight="600"
                                lineHeight={19}
                                text="Personal Details"
                            />
                        }
                    />
                }
                useSafeArea
                paddingHorizontal={0}
                paddingBottom={0}
            >
                <ScrollView style={styles.container}>
                    <Typo
                        fontSize={14}
                        fontWeight="400"
                        lineHeight={18}
                        text="Name"
                        textAlign="left"
                        style={styles.titleSpacing}
                    />
                    <TextInput
                        value={route?.params?.name}
                        style={{ color: GREY }}
                        editable={false}
                        isValidate={false}
                    />
                    <Typo
                        fontSize={14}
                        fontWeight="400"
                        lineHeight={18}
                        text="Address line 1"
                        textAlign="left"
                        style={styles.titleSpacing}
                    />
                    <TextInput
                        value={addr1}
                        onChangeText={onAddr1Changed}
                        editable={true}
                        isValidate={false}
                        maxLength={250}
                    />
                    <Typo
                        fontSize={14}
                        fontWeight="400"
                        lineHeight={18}
                        text="Address line 2"
                        textAlign="left"
                        style={styles.titleSpacing}
                    />
                    <TextInput
                        value={addr2}
                        onChangeText={onAddr2Changed}
                        editable={true}
                        isValidate={false}
                        maxLength={250}
                    />
                    <Typo
                        fontSize={14}
                        fontWeight="400"
                        lineHeight={18}
                        text="Address line 3"
                        textAlign="left"
                        style={styles.titleSpacing}
                    />
                    <TextInput
                        value={addr3}
                        onChangeText={onAddr3Changed}
                        editable={true}
                        isValidate={false}
                        maxLength={250}
                    />
                    <Typo
                        fontSize={14}
                        fontWeight="400"
                        lineHeight={18}
                        text="Postcode"
                        textAlign="left"
                        style={styles.titleSpacing}
                    />
                    <TouchableOpacity onPress={onPostcodePress}>
                        <TextInput value={postcode} editable={false} isValidate={false} />
                    </TouchableOpacity>
                    <Typo
                        fontSize={14}
                        fontWeight="400"
                        lineHeight={18}
                        text="City"
                        textAlign="left"
                        style={styles.titleSpacing}
                    />
                    <TextInput
                        value={city}
                        onChangeText={onCityChanged}
                        editable={true}
                        isValidate={false}
                        maxLength={30}
                    />
                    <TitleAndDropdownPill
                        title="Country"
                        dropdownTitle={selectedCountryLabel ?? DROPDOWN_DEFAULT_TEXT}
                        dropdownOnPress={onCountryPress}
                        isDisabled={false}
                    />
                    <TitleAndDropdownPill
                        title="State"
                        dropdownTitle={selectedStateLabel ?? DROPDOWN_DEFAULT_TEXT}
                        dropdownOnPress={onStatePress}
                        isDisabled={false}
                    />
                    <Typo
                        fontSize={14}
                        fontWeight="400"
                        lineHeight={18}
                        text="Mobile No"
                        textAlign="left"
                        style={styles.titleSpacing}
                    />
                    <TouchableOpacity onPress={onMobileNoPress}>
                        <TextInput
                            value={mobileNo}
                            editable={false}
                            isValidate={false}
                            prefix={route?.params?.mobCountryCode}
                        />
                    </TouchableOpacity>
                    <Typo
                        fontSize={14}
                        fontWeight="400"
                        lineHeight={18}
                        text="Home Phone No"
                        textAlign="left"
                        style={styles.titleSpacing}
                    />
                    <TouchableOpacity onPress={onHomePhoneNoPress}>
                        <TextInput
                            value={homePhoneNo}
                            editable={false}
                            isValidate={false}
                            prefix={route?.params?.mobCountryCode}
                        />
                    </TouchableOpacity>
                    <Typo
                        fontSize={14}
                        fontWeight="400"
                        lineHeight={18}
                        text="Email"
                        textAlign="left"
                        style={styles.titleSpacing}
                    />
                    <TextInput
                        value={email}
                        onChangeText={onEmailChanged}
                        editable={true}
                        isValidate={false}
                        maxLength={40}
                    />
                    {showNumPad && <SpaceFiller height={Dimensions.get("screen").height / 3} />}
                </ScrollView>
                <FixedActionContainer>
                    <ActionButton
                        fullWidth
                        disabled={!buttonEnabled}
                        backgroundColor={buttonEnabled ? YELLOW : DISABLED}
                        componentCenter={
                            <Typo
                                text={CONTINUE}
                                fontWeight="600"
                                fontSize={14}
                                color={buttonEnabled ? BLACK : DISABLED_TEXT}
                            />
                        }
                        onPress={onPressContinue}
                    />
                </FixedActionContainer>
            </ScreenLayout>
            {showPicker && (
                <ScrollPickerView
                    showMenu
                    list={pickerOptions}
                    selectedIndex={selectedPickerIndex}
                    onRightButtonPress={onScrollPickerDoneButtonPressed}
                    onLeftButtonPress={onScrollPickerCancelButtonPressed}
                />
            )}
            <SlidingNumPad
                showNumPad={showNumPad}
                value={currentNumPadValue}
                onChange={onNumPadChange}
                maxLength={maxNumberLength.current}
                onDone={onNumPadDonePress}
            />
        </ScreenContainer>
    );
};

UnitTrustEditPersonalDetails.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

const styles = StyleSheet.create({
    container: { marginBottom: 20, paddingHorizontal: 24 },
    titleSpacing: {
        paddingTop: 20,
    },
});

export default UnitTrustEditPersonalDetails;
