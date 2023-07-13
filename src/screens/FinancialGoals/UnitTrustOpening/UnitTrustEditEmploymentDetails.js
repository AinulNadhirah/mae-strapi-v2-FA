import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { StyleSheet, ScrollView } from "react-native";

import { BANKINGV2_MODULE, UNIT_TRUST_OPENING_CONFIRMATION } from "@navigation/navigationConstant";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import { ScrollPickerView } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import TitleAndDropdownPill from "@components/FinancialGoal/TitleAndDropdownPill";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";

import { BLACK, DISABLED, DISABLED_TEXT, MEDIUM_GREY, YELLOW } from "@constants/colors";
import { CONTINUE, DROPDOWN_DEFAULT_TEXT } from "@constants/strings";

const UnitTrustEditEmploymentDetails = ({ route, navigation }) => {
    const [occupation, setOccupation] = useState(route?.params?.occupationCode);
    const [employmentType, setEmploymentType] = useState(route?.params?.employmentTypeCode);
    const [occupationSector, setOccupationSector] = useState(route?.params?.occupationSectorCode);
    const [employerName, setEmployerName] = useState(route?.params?.employerName);
    const [incomeRange, setIncomeRange] = useState(route?.params?.incomeRangeCode);
    const [employerCountry, setEmployerCountry] = useState(route?.params?.employerCountryCode);
    const [showPicker, setShowPicker] = useState(false);
    const [currentOptions, setCurrentOptions] = useState([]);
    const [currentPicker, setCurrentPicker] = useState(null);
    const [currentSelectedIndex, setCurrentSelectedIndex] = useState(null);
    const [buttonEnabled, setButtonEnabled] = useState(false);

    const PICKER = {
        occupation: "occupation",
        employmentType: "employmentType",
        occupationSector: "occupationSector",
        incomeRange: "incomeRange",
        employerCountry: "employerCountry",
    };

    useEffect(() => {
        if (
            occupation &&
            employmentType &&
            occupationSector &&
            employerName &&
            incomeRange &&
            employerCountry
        ) {
            setButtonEnabled(true);
        } else {
            setButtonEnabled(false);
        }
    }, [occupation, employmentType, occupationSector, employerName, incomeRange, employerCountry]);

    function onBackButtonPress() {
        navigation.goBack();
    }

    function onOccupationPress() {
        if (showPicker) {
            setShowPicker(false);
            return;
        }
        setCurrentPicker(PICKER.occupation);
        const options = route?.params?.occupationOptions.map((item) => {
            return {
                name: item?.label,
                value: item?.value,
            };
        });

        setCurrentOptions(options);
        const currentIndex = route?.params?.occupationOptions.findIndex((item) => {
            return item?.value === occupation;
        });
        setCurrentSelectedIndex(currentIndex);
        setShowPicker(true);
    }

    function onEmploymentTypePress() {
        if (showPicker) {
            setShowPicker(false);
            return;
        }
        setCurrentPicker(PICKER.employmentType);
        const options = route?.params?.employmentTypeOptions.map((item) => {
            return {
                name: item?.label,
                value: item?.value,
            };
        });

        setCurrentOptions(options);
        const currentIndex = route?.params?.employmentTypeOptions.findIndex((item) => {
            return item?.value === employmentType;
        });
        setCurrentSelectedIndex(currentIndex);
        setShowPicker(true);
    }

    function onOccupationSectorPress() {
        if (showPicker) {
            setShowPicker(false);
            return;
        }
        setCurrentPicker(PICKER.occupationSector);
        const options = route?.params?.occupationSectorOptions.map((item) => {
            return {
                name: item?.label,
                value: item?.value,
            };
        });

        setCurrentOptions(options);

        const currentIndex = route?.params?.occupationSectorOptions.findIndex((item) => {
            return item?.value === occupationSector;
        });
        setCurrentSelectedIndex(currentIndex);
        setShowPicker(true);
    }

    function onEmployerNameChanged(value) {
        setEmployerName(value);
    }

    function onIncomeRangePress() {
        if (showPicker) {
            setShowPicker(false);
            return;
        }
        setCurrentPicker(PICKER.incomeRange);
        const options = route?.params?.incomeRangeOptions.map((item) => {
            return {
                name: item?.label,
                value: item?.value,
            };
        });

        setCurrentOptions(options);

        const currentIndex = route?.params?.incomeRangeOptions.findIndex((item) => {
            return item?.value === incomeRange;
        });
        setCurrentSelectedIndex(currentIndex);
        setShowPicker(true);
    }

    function onEmployerCountryPress() {
        if (showPicker) {
            setShowPicker(false);
            return;
        }
        setCurrentPicker(PICKER.employerCountry);
        const options = route?.params?.employerCountryOptions.map((item) => {
            return {
                name: item?.label,
                value: item?.value,
            };
        });

        setCurrentOptions(options);
        const currentIndex = route?.params?.employerCountryOptions.findIndex((item) => {
            return item?.value === employerCountry;
        });
        setCurrentSelectedIndex(currentIndex);
        setShowPicker(true);
    }

    function onScrollPickerDoneButtonPressed(selectedItem, index) {
        switch (currentPicker) {
            case PICKER.occupation:
                setOccupation(selectedItem?.value);
                setShowPicker(false);
                break;
            case PICKER.employmentType:
                setEmploymentType(selectedItem?.value);
                setShowPicker(false);
                break;
            case PICKER.occupationSector:
                setOccupationSector(selectedItem?.value);
                setShowPicker(false);
                break;
            case PICKER.incomeRange:
                setIncomeRange(selectedItem?.value);
                setShowPicker(false);
                break;
            case PICKER.employerCountry:
                setEmployerCountry(selectedItem?.value);
                setShowPicker(false);
                break;
        }
    }

    function onScrollPickerCancelButtonPressed() {
        setShowPicker(false);
    }

    const occupationLabel = (() => {
        return (
            route?.params?.occupationOptions.filter((item) => {
                return item?.value === occupation;
            })?.[0]?.label ?? route?.params?.occupation
        );
    })();

    const employmentTypeLabel = (() => {
        return (
            route?.params?.employmentTypeOptions.filter((item) => {
                return item?.value === employmentType;
            })?.[0]?.label ?? route?.params?.employmentType
        );
    })();

    const occupationSectorLabel = (() => {
        return (
            route?.params?.occupationSectorOptions.filter((item) => {
                return item?.value === occupationSector;
            })?.[0]?.label ?? route?.params?.occupationSector
        );
    })();

    const incomeRangeLabel = (() => {
        return (
            route?.params?.incomeRangeOptions.filter((item) => {
                return item?.value === incomeRange;
            })?.[0]?.label ?? route?.params?.incomeRangeLabel
        );
    })();

    const employerCountryLabel = (() => {
        return (
            route?.params?.employerCountryOptions.filter((item) => {
                return item?.value === employerCountry;
            })?.[0]?.label ?? route?.params?.employerCountry
        );
    })();

    function onPressContinue() {
        navigation.navigate(BANKINGV2_MODULE, {
            screen: UNIT_TRUST_OPENING_CONFIRMATION,
            params: {
                occupation: occupationLabel,
                occupationCode: occupation,
                employmentType: employmentTypeLabel,
                employmentTypeCode: employmentType,
                occupationSector: occupationSectorLabel,
                occupationSectorCode: occupationSector,
                employerName,
                incomeRange: incomeRangeLabel,
                incomeRangeCode: incomeRange,
                employerCountry: employerCountryLabel,
                employerCountryCode: employerCountry,
            },
        });
    }

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
                                text="Employment Details"
                            />
                        }
                    />
                }
                useSafeArea
                paddingHorizontal={0}
                paddingBottom={0}
            >
                <ScrollView style={styles.container}>
                    {/* occupation */}
                    <TitleAndDropdownPill
                        title="Occupation"
                        dropdownTitle={occupationLabel ?? DROPDOWN_DEFAULT_TEXT}
                        dropdownOnPress={onOccupationPress}
                        isDisabled={false}
                    />
                    {/* employmentType */}
                    <TitleAndDropdownPill
                        title="Employment Type"
                        dropdownTitle={employmentTypeLabel ?? DROPDOWN_DEFAULT_TEXT}
                        dropdownOnPress={onEmploymentTypePress}
                        isDisabled={false}
                    />
                    {/* occupation sector */}
                    <TitleAndDropdownPill
                        title="Occupation Sector"
                        dropdownTitle={occupationSectorLabel ?? DROPDOWN_DEFAULT_TEXT}
                        dropdownOnPress={onOccupationSectorPress}
                        isDisabled={false}
                    />
                    {/* employer name */}
                    <Typo
                        fontSize={14}
                        fontWeight="400"
                        lineHeight={18}
                        text="Employer Name"
                        textAlign="left"
                        style={styles.titleSpacing}
                    />
                    <TextInput
                        value={employerName}
                        onChangeText={onEmployerNameChanged}
                        editable={true}
                        isValidate={false}
                    />
                    {/* income range */}
                    <TitleAndDropdownPill
                        title="Income Range"
                        dropdownTitle={incomeRangeLabel ?? DROPDOWN_DEFAULT_TEXT}
                        dropdownOnPress={onIncomeRangePress}
                        isDisabled={false}
                    />
                    {/* emloyer country */}
                    <TitleAndDropdownPill
                        title="Country of Employer"
                        dropdownTitle={employerCountryLabel ?? DROPDOWN_DEFAULT_TEXT}
                        dropdownOnPress={onEmployerCountryPress}
                        isDisabled={false}
                    />
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
                    list={currentOptions}
                    selectedIndex={currentSelectedIndex}
                    onRightButtonPress={onScrollPickerDoneButtonPressed}
                    onLeftButtonPress={onScrollPickerCancelButtonPressed}
                />
            )}
        </ScreenContainer>
    );
};

UnitTrustEditEmploymentDetails.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
};

const styles = StyleSheet.create({
    container: { marginBottom: 15, paddingHorizontal: 24 },
    titleSpacing: {
        paddingBottom: 10,
        paddingTop: 15,
    },
});
export default UnitTrustEditEmploymentDetails;
