import Numeral from "numeral";
import PropTypes from "prop-types";
import React, { useRef, useEffect, useState, useCallback } from "react";
import { View, StyleSheet, Image, Dimensions, ScrollView } from "react-native";

import AmountInput from "@screens/Property/Common/AmountInput";
import SlidingNumPad from "@screens/Property/Common/SlidingNumPad";

import {
    BANKINGV2_MODULE,
    FINANCIAL_EDUCATION_COMMIT_UPFRONT,
} from "@navigation/navigationConstant";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import { ScrollPickerView } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import HeaderLabel from "@components/Label/HeaderLabel";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { useModelController } from "@context";

import { getAllEduTargetAmt } from "@services";
import { logEvent } from "@services/analytics";

import { BLACK, DISABLED, DISABLED_TEXT, RED, WHITE, YELLOW } from "@constants/colors";
import {
    EDUCATION_GOAL,
    GOAL_BASED_INVESTMENT,
    DROPDOWN_DEFAULT_TEXT,
    INTENDED_EDUCATION_LEVEL,
    INTENDED_AREA_OF_STUDY,
    INTENDED_STUDY_COUNTRY,
    GOAL_TARGET_AMOUNT,
    EDUCATION_LEVEL_SELECT_ERROR,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    FA_FIN_GOAL_EDU_DETAILS,
    FA_FIN_GOAL_CHILD_EDU_DETAILS,
} from "@constants/strings";

import { numberWithCommas as commaFormatted } from "@utils/dataModel/utilityFinancialGoals";
import { numberWithCommas } from "@utils/dataModel/utilityPartial.3";

import assets from "@assets";

const EducationLevel = ({ navigation, route }) => {
    const { getModel } = useModelController();
    const { educationData } = getModel("financialGoal");

    const { fundsFor } = route?.params;

    const defaultEducationLevel =
        fundsFor === "myself"
            ? educationData?.EDUCATION_LEVEL?.[2]?.label
            : educationData?.EDUCATION_LEVEL?.[1]?.label;
    const [educationLevel, setEducationLevel] = useState(
        route?.params?.educationLvl ?? defaultEducationLevel
    );

    const defaultEducationIndex = fundsFor === "myself" ? 2 : 1;
    const [selectedEducationIndex, setSelectedEducationIndex] = useState(defaultEducationIndex);

    const defaultAreaOfStudy =
        fundsFor === "myself"
            ? educationData?.EDUCATION_SUBJECT_PG?.[1]?.label
            : educationData?.EDUCATION_SUBJECT_UNI?.[0]?.label;
    const [areaOfStudy, setAreaOfStudy] = useState(route?.params?.studyArea ?? defaultAreaOfStudy);

    const defaultAreaStudyIndex = fundsFor === "myself" ? 1 : 0;
    const [selectedAreaStudyIndex, setSelectedAreaStudyIndex] = useState(defaultAreaStudyIndex);

    const defaultStudyCountry =
        fundsFor === "myself"
            ? educationData?.EDUCATION_COUNTRY_PROFQ?.[0]?.label
            : educationData?.EDUCATION_COUNTRY_GSMED?.[0]?.label;
    const [studyCountry, setStudyCountry] = useState(
        route?.params?.educationCtr ?? defaultStudyCountry
    );

    const defaultCountryIndex = 0;
    const [selectedStudyCountryIndex, setSelectedStudyCountryIndex] = useState(defaultCountryIndex);

    const [currentPicker, setCurrentPicker] = useState(null);
    const [targetAmount, setTargetAmount] = useState(
        route?.params?.inputTargetAmt ? route?.params?.inputTargetAmt.toString() : ""
    );
    const [targetValue, setTargetValue] = useState(
        route?.params?.inputTargetAmt ? route?.params?.inputTargetAmt * 100 : 0
    );
    const [buttonEnabled, setButtonEnabled] = useState(false);
    const [showEducationPicker, setShowEducationPicker] = useState(false);
    const [showAreaStudyPicker, setShowAreaStudyPicker] = useState(false);
    const [showCountryPicker, setShowCountryPicker] = useState(false);
    const [showNumPad, setShowNumPad] = useState(false);
    const [showTargetAmountError, setShowTargetAmountError] = useState(false);
    const [showEducationLevelError, setShowEducationLevelError] = useState(false);

    const goalTargetMinValue =
        educationData?.["Gbi Target Amount Input Range"]?.[0]?.minValue ?? 1000;
    const goalTargetMaxValue =
        educationData?.["Gbi Target Amount Input Range"]?.[0]?.maxValue ?? 999999999;

    const formattedGoalTargetMin = numberWithCommas(goalTargetMinValue?.toFixed(2));
    const formattedGoalTargetMax = numberWithCommas(goalTargetMaxValue?.toFixed(2));
    const SCREEN_HEIGHT = Dimensions.get("screen").height;

    const educationOptions = useRef();
    const areaOfStudyOptions = useRef();
    const countryOptions = useRef();
    const targetAmtOptions = useRef();
    const scrollView = useRef();
    const PICKER = {
        EDUCATION: "education",
        AREA_OF_STUDY: "areaofstudy",
        STUDY_COUNTRY: "studyCountry",
    };

    useEffect(() => {
        fetchTargetAmt();
    }, [fetchTargetAmt]);

    const fetchTargetAmt = useCallback(async () => {
        try {
            const response = await getAllEduTargetAmt(true);
            if (response?.data) {
                targetAmtOptions.current = response?.data;

                const defaultTargetAmount = (() => {
                    const amtIdx = response?.data.findIndex(function (item, itemIndex) {
                        return (
                            educationLevel === item.educationLevel &&
                            areaOfStudy === item.educationSubject &&
                            studyCountry === item.educationCountry
                        );
                    });
                    if (amtIdx >= 0) {
                        return response?.data?.[amtIdx]?.targetAmount;
                    }
                })();

                setTargetAmount(defaultTargetAmount);
                setTargetValue(defaultTargetAmount * 100);
                validateEducationError(educationLevel);
            }
        } catch (error) {
            showErrorToast({ message: error?.message });
        }
    }, []);

    useEffect(() => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]:
                fundsFor === "myself" ? FA_FIN_GOAL_EDU_DETAILS : FA_FIN_GOAL_CHILD_EDU_DETAILS,
        });
    }, [fundsFor]);

    useEffect(() => {
        educationOptions.current = educationData?.EDUCATION_LEVEL?.map((item) => {
            return {
                ...item,
                name: item?.label,
                value: item?.value,
            };
        });

        areaOfStudyOptions.current = (() => {
            switch (educationLevel) {
                case "College":
                    return educationData?.EDUCATION_SUBJECT_COLLEGE?.map((item) => {
                        return {
                            ...item,
                            name: item?.label,
                            value: item?.value,
                        };
                    });
                case "University":
                    return educationData?.EDUCATION_SUBJECT_UNI?.map((item) => {
                        return {
                            ...item,
                            name: item?.label,
                            value: item?.value,
                        };
                    });
                case "Postgraduate":
                    return educationData?.EDUCATION_SUBJECT_PG?.map((item) => {
                        return {
                            ...item,
                            name: item?.label,
                            value: item?.value,
                        };
                    });
                default:
                    return [];
            }
        })();

        countryOptions.current = (() => {
            switch (areaOfStudy) {
                case "General Studies":
                case "Medicine":
                    return educationData?.EDUCATION_COUNTRY_GSMED?.map((item) => {
                        return {
                            ...item,
                            name: item?.label,
                            value: item?.value,
                        };
                    });
                case "Pre-University":
                case "Taught Courses":
                case "Research Degree":
                    return educationData?.EDUCATION_COUNTRY_TRPREU?.map((item) => {
                        return {
                            ...item,
                            name: item?.label,
                            value: item?.value,
                        };
                    });
                case "Professional Qualifications":
                    return educationData?.EDUCATION_COUNTRY_PROFQ?.map((item) => {
                        return {
                            ...item,
                            name: item?.label,
                            value: item?.value,
                        };
                    });
                default:
                    return [];
            }
        })();
        setButtonEnabled(
            educationLevel !== null &&
                areaOfStudy !== null &&
                studyCountry !== null &&
                targetAmount !== "" &&
                !showTargetAmountError &&
                !showEducationLevelError
        );
    }, [
        areaOfStudy,
        educationData?.EDUCATION_COUNTRY_GSMED,
        educationData?.EDUCATION_COUNTRY_PROFQ,
        educationData?.EDUCATION_COUNTRY_TRPREU,
        educationData?.EDUCATION_LEVEL,
        educationData?.EDUCATION_SUBJECT_COLLEGE,
        educationData?.EDUCATION_SUBJECT_PG,
        educationData?.EDUCATION_SUBJECT_UNI,
        educationLevel,
        showEducationLevelError,
        showTargetAmountError,
        studyCountry,
        targetAmount,
    ]);

    function onPressBack() {
        navigation.goBack();
    }

    function onEducationLevelPress() {
        setCurrentPicker(PICKER.EDUCATION);
        if (educationOptions.current?.length > 0) {
            setShowEducationPicker(true);
            setShowAreaStudyPicker(false);
            setShowCountryPicker(false);
            setShowNumPad(false);
        }
    }

    function onAreaOfStudyPress() {
        setCurrentPicker(PICKER.AREA_OF_STUDY);
        if (areaOfStudyOptions.current?.length > 0) {
            setShowAreaStudyPicker(true);
            setShowCountryPicker(false);
            setShowEducationPicker(false);
            setShowNumPad(false);
        }
    }

    function onCountryPress() {
        setCurrentPicker(PICKER.STUDY_COUNTRY);
        if (countryOptions.current?.length > 0) {
            setShowCountryPicker(true);
            setShowAreaStudyPicker(false);
            setShowEducationPicker(false);
            setShowNumPad(false);
        }
    }

    function onNavigateNext() {
        navigation.navigate(BANKINGV2_MODULE, {
            screen: FINANCIAL_EDUCATION_COMMIT_UPFRONT,
            params: {
                ...route?.params,
                educationLvl: educationLevel,
                studyArea: areaOfStudy,
                educationCtr: studyCountry,
                inputTargetAmt: targetValue / 100,
            },
        });
    }

    const validateEducationError = (selectedEducation) => {
        const childAge = route?.params?.childAge;
        if (!childAge) return;

        const collegeMaxAge = educationData?.EDUCATION_AGE_COLLEGE?.[0]?.maxValue ?? 18;
        const universityMaxAge = educationData?.EDUCATION_AGE_UNIVERSITY?.[0]?.maxValue ?? 20;
        const postgraduateMaxAge = educationData?.EDUCATION_AGE_POSTGRADUATE?.[0]?.maxValue ?? 24;

        switch (true) {
            case selectedEducation === "College" && childAge >= collegeMaxAge:
                setShowEducationLevelError(true);
                break;
            case selectedEducation === "University" && childAge >= universityMaxAge:
                setShowEducationLevelError(true);
                break;
            case selectedEducation === "Postgraduate" && childAge >= postgraduateMaxAge:
                setShowEducationLevelError(true);
                break;
            default:
                setShowEducationLevelError(false);
                break;
        }
    };

    function onScrollPickerDoneButtonPressed(selectedItem, index) {
        switch (currentPicker) {
            case PICKER.EDUCATION:
                if (selectedItem?.value !== studyCountry) {
                    setAreaOfStudy(null);
                    setStudyCountry(null);
                    setEducationLevel(selectedItem?.value);
                    setSelectedEducationIndex(index);
                    setTargetAmount("");
                    setShowTargetAmountError(false);
                    validateEducationError(selectedItem?.value);
                }
                break;
            case PICKER.AREA_OF_STUDY:
                if (selectedItem?.value !== areaOfStudy) {
                    setStudyCountry(null);
                    setAreaOfStudy(selectedItem?.value);
                    setSelectedAreaStudyIndex(index);
                    setTargetAmount("");
                    setShowTargetAmountError(false);
                }
                break;
            case PICKER.STUDY_COUNTRY:
                if (selectedItem?.value !== studyCountry) {
                    setStudyCountry(selectedItem?.value);
                    setSelectedStudyCountryIndex(index);
                    setShowTargetAmountError(false);
                }
                if (targetAmtOptions?.current) {
                    const amtIdx = targetAmtOptions.current.findIndex(function (item, itemIndex) {
                        return (
                            educationLevel === item.educationLevel &&
                            areaOfStudy === item.educationSubject &&
                            selectedItem?.value === item.educationCountry
                        );
                    });
                    if (amtIdx >= 0) {
                        setTargetAmount(targetAmtOptions.current[amtIdx].targetAmount);
                        setTargetValue(targetAmtOptions.current[amtIdx].targetAmount * 100);
                    }
                }
                break;
            default:
                break;
        }

        setShowEducationPicker(false);
        setShowAreaStudyPicker(false);
        setShowCountryPicker(false);
    }

    function onScrollPickerCancelButtonPressed() {
        setShowEducationPicker(false);
        setShowAreaStudyPicker(false);
        setShowCountryPicker(false);
    }

    function onNumPadChange(value) {
        const val = value ? Number(value) : 0;
        if (val > 0) {
            const formatted = commaFormatted(val);
            setTargetAmount(formatted);
            setTargetValue(val);
        } else {
            setTargetAmount("");
            setTargetValue(val);
        }
    }

    function onNumPadDonePress() {
        const exactTargetValue = targetValue / 100;
        if (exactTargetValue < goalTargetMinValue || exactTargetValue > goalTargetMaxValue) {
            setShowTargetAmountError(true);
        } else {
            setShowTargetAmountError(false);
        }
        setShowNumPad(false);
    }

    function onTargetAmountPress() {
        setShowAreaStudyPicker(false);
        setShowEducationPicker(false);
        setShowCountryPicker(false);
        setShowNumPad(true);
    }

    function onContentSizeChange(_, height) {
        scrollView.current.scrollTo({ y: height });
    }

    return (
        <>
            <ScreenContainer backgroundType="color">
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
                    <ScrollView
                        ref={scrollView}
                        style={styles.container}
                        onContentSizeChange={onContentSizeChange}
                    >
                        <View>
                            <Typo
                                text={EDUCATION_GOAL}
                                fontWeight="600"
                                fontSize={16}
                                lineHeight={24}
                                textAlign="left"
                                style={styles.title}
                            />
                            <Typo
                                text={INTENDED_EDUCATION_LEVEL}
                                fontWeight="400"
                                fontSize={14}
                                style={styles.subtitle}
                                textAlign="left"
                            />
                            <ActionButton
                                fullWidth
                                backgroundColor={WHITE}
                                borderWidth={1}
                                borderColor="#cfcfcf"
                                componentLeft={
                                    <View style={styles.selectionContainer}>
                                        <Typo
                                            text={
                                                educationLevel !== null
                                                    ? educationLevel
                                                    : DROPDOWN_DEFAULT_TEXT
                                            }
                                            fontSize={14}
                                            lineHeight={18}
                                            fontWeight="600"
                                        />
                                    </View>
                                }
                                componentRight={
                                    <View style={styles.chevronContainer}>
                                        <Image
                                            source={assets.downArrow}
                                            style={styles.chevronDownImage}
                                        />
                                    </View>
                                }
                                onPress={onEducationLevelPress}
                            />
                            {showEducationLevelError && (
                                <Typo
                                    style={styles.errorMessageEducation}
                                    textAlign="left"
                                    fontWeight="500"
                                    text={EDUCATION_LEVEL_SELECT_ERROR}
                                />
                            )}
                            <Typo
                                text={INTENDED_AREA_OF_STUDY}
                                fontWeight="400"
                                fontSize={14}
                                style={styles.subtitle}
                                textAlign="left"
                            />
                            <ActionButton
                                fullWidth
                                backgroundColor={WHITE}
                                borderWidth={1}
                                borderColor="#cfcfcf"
                                componentLeft={
                                    <View style={styles.selectionContainer}>
                                        <Typo
                                            text={areaOfStudy ?? DROPDOWN_DEFAULT_TEXT}
                                            fontSize={14}
                                            lineHeight={18}
                                            fontWeight="600"
                                        />
                                    </View>
                                }
                                componentRight={
                                    <View style={styles.chevronContainer}>
                                        <Image
                                            source={assets.downArrow}
                                            style={styles.chevronDownImage}
                                        />
                                    </View>
                                }
                                onPress={onAreaOfStudyPress}
                            />
                            <Typo
                                text={INTENDED_STUDY_COUNTRY}
                                fontWeight="400"
                                fontSize={14}
                                style={styles.subtitle}
                                textAlign="left"
                            />
                            <ActionButton
                                fullWidth
                                backgroundColor={WHITE}
                                borderWidth={1}
                                borderColor="#cfcfcf"
                                componentLeft={
                                    <View style={styles.selectionContainer}>
                                        <Typo
                                            text={studyCountry ?? DROPDOWN_DEFAULT_TEXT}
                                            fontSize={14}
                                            lineHeight={18}
                                            fontWeight="600"
                                        />
                                    </View>
                                }
                                componentRight={
                                    <View style={styles.chevronContainer}>
                                        <Image
                                            source={assets.downArrow}
                                            style={styles.chevronDownImage}
                                        />
                                    </View>
                                }
                                onPress={onCountryPress}
                            />

                            <AmountInput
                                style={styles.amountInput}
                                label={GOAL_TARGET_AMOUNT}
                                onPress={onTargetAmountPress}
                                subLabel="RM"
                                isValidate={showTargetAmountError}
                                errorMessage={`Please enter a value between RM ${formattedGoalTargetMin} and RM ${formattedGoalTargetMax}`}
                                value={targetAmount ? Numeral(targetAmount).format("0,0.00") : ""}
                            />
                        </View>
                        {showNumPad && <SpaceFiller height={SCREEN_HEIGHT / 3} />}
                    </ScrollView>
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
            {/* education level */}
            {showEducationPicker && (
                <ScrollPickerView
                    showMenu
                    list={educationOptions.current ?? []}
                    selectedIndex={selectedEducationIndex}
                    onRightButtonPress={onScrollPickerDoneButtonPressed}
                    onLeftButtonPress={onScrollPickerCancelButtonPressed}
                />
            )}
            {/* area study  */}
            {showAreaStudyPicker && (
                <ScrollPickerView
                    showMenu
                    list={areaOfStudyOptions.current ?? []}
                    selectedIndex={selectedAreaStudyIndex}
                    onRightButtonPress={onScrollPickerDoneButtonPressed}
                    onLeftButtonPress={onScrollPickerCancelButtonPressed}
                />
            )}
            {/* study country */}
            {showCountryPicker && (
                <ScrollPickerView
                    showMenu
                    list={countryOptions.current ?? []}
                    selectedIndex={selectedStudyCountryIndex}
                    onRightButtonPress={onScrollPickerDoneButtonPressed}
                    onLeftButtonPress={onScrollPickerCancelButtonPressed}
                />
            )}
            <SlidingNumPad
                showNumPad={showNumPad}
                value={`${targetValue}`}
                onChange={onNumPadChange}
                maxLength={11}
                onDone={onNumPadDonePress}
            />
        </>
    );
};

EducationLevel.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
};

const styles = StyleSheet.create({
    amountInput: {
        paddingTop: 20,
    },
    chevronContainer: {
        marginRight: 24,
    },
    chevronDownImage: { height: 8, width: 16 },
    container: {
        flex: 1,
        paddingHorizontal: 24,
    },
    errorMessage: {
        color: RED,
        top: -10,
    },
    errorMessageEducation: {
        color: RED,
        paddingTop: 5,
    },
    selectionContainer: {
        marginHorizontal: 24,
    },
    subtitle: {
        paddingBottom: 10,
        paddingTop: 24,
    },
    title: {
        paddingTop: 16,
    },
});

export default EducationLevel;
