import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import { View, StyleSheet, Image } from "react-native";

import { BANKINGV2_MODULE, FINANCIAL_EDUCATION_LEVEL } from "@navigation/navigationConstant";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import { ScrollPickerView } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import HeaderLabel from "@components/Label/HeaderLabel";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import Typo from "@components/Text";

import { logEvent } from "@services/analytics";

import {
    EDUCATION_ENTER_FUND_YEAR,
    EDUCATION_GOAL,
    GOAL_BASED_INVESTMENT,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    FA_FIN_GOAL_EDU_Year,
    FA_FIN_GOAL_CHILD_EDU_YEAR,
} from "@constants/strings";

import assets from "@assets";

const EducationFundYear = ({ navigation, route }) => {
    useEffect(() => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]:
                route?.params?.fundsFor === "myself"
                    ? FA_FIN_GOAL_EDU_Year
                    : FA_FIN_GOAL_CHILD_EDU_YEAR,
        });
    }, [route?.params?.fundsFor]);

    //year selection from (current year + 1) to 30 years
    const yearSelection = (() => {
        let startingYear = new Date().getFullYear() + 1;
        const years = [];
        const yearCount = 30;
        for (let i = 0; i <= yearCount; i++) {
            if (i === 0) years.push(startingYear);
            else {
                startingYear += 1;
                years.push(startingYear);
            }
        }
        return years;
    })();

    const yearSelectionItem = yearSelection.map((item, index) => {
        return {
            name: item,
            value: index,
        };
    });

    const [showYearSelection, setShowYearSelection] = useState(false);
    const [selectedYearIndex, setSelectedYearIndex] = useState(route?.params?.fundsByIdx ?? 4);

    function onPressBack() {
        navigation.goBack();
    }

    function onNavigateNext() {
        navigation.navigate(BANKINGV2_MODULE, {
            screen: FINANCIAL_EDUCATION_LEVEL,
            params: {
                ...route?.params,
                fundsBy: yearSelectionItem[selectedYearIndex]?.name,
            },
        });
    }

    function onDropDownPress() {
        setShowYearSelection(true);
    }

    function onScrollPickerDoneButtonPressed(_, index) {
        setShowYearSelection(false);
        setSelectedYearIndex(index);
    }

    function onScrollPickerCancelButtonPressed() {
        setShowYearSelection(false);
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
                    <View style={styles.container}>
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
                                text={EDUCATION_ENTER_FUND_YEAR}
                                fontWeight="400"
                                fontSize={14}
                                textAlign="left"
                                style={styles.subtitle}
                            />
                            <ActionButton
                                fullWidth
                                backgroundColor="#ffffff"
                                borderWidth={1}
                                borderColor="#cfcfcf"
                                componentLeft={
                                    <View style={styles.yearSelectionContainer}>
                                        <Typo
                                            text={yearSelectionItem?.[selectedYearIndex]?.name}
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
                                onPress={onDropDownPress}
                            />
                        </View>
                    </View>
                    <FixedActionContainer>
                        <ActionButton
                            fullWidth
                            onPress={onNavigateNext}
                            componentCenter={<Typo text="Next" fontWeight="600" fontSize={14} />}
                        />
                    </FixedActionContainer>
                </ScreenLayout>
            </ScreenContainer>
            {showYearSelection && (
                <ScrollPickerView
                    showMenu
                    list={yearSelectionItem}
                    selectedIndex={selectedYearIndex}
                    onRightButtonPress={onScrollPickerDoneButtonPressed}
                    onLeftButtonPress={onScrollPickerCancelButtonPressed}
                />
            )}
        </>
    );
};

EducationFundYear.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
};

const styles = StyleSheet.create({
    chevronContainer: {
        marginRight: 24,
    },
    chevronDownImage: { height: 8, width: 16 },
    container: {
        flex: 1,
        paddingHorizontal: 24,
    },
    subtitle: {
        paddingBottom: 10,
        paddingTop: 24,
    },
    title: {
        paddingTop: 16,
    },
    yearSelectionContainer: {
        marginHorizontal: 24,
    },
});

export default EducationFundYear;
