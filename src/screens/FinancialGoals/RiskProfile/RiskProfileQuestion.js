import PropTypes from "prop-types";
import React, { useEffect, useRef, useState, useCallback } from "react";
import {
    View,
    StyleSheet,
    ScrollView,
    Image,
    Dimensions,
    FlatList,
    TouchableOpacity,
} from "react-native";
import HTML from "react-native-render-html";

import {
    BANKINGV2_MODULE,
    RISK_PROFILE_QUESTION,
    RISK_PROFILE_RESULT,
} from "@navigation/navigationConstant";

import ActionButton from "@components/Buttons/ActionButton";
import ColorRadioButton from "@components/Buttons/ColorRadioButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { useModelController } from "@context";

import { getRiskQuestionnaire } from "@services";
import { logEvent } from "@services/analytics";

import { BLACK, DISABLED, DISABLED_TEXT, GREY, WHITE, YELLOW } from "@constants/colors";
import { CONTINUE, FA_SCREEN_NAME, FA_VIEW_SCREEN, SUBMIT } from "@constants/strings";

import { getAgeByDob } from "@utils/dataModel/utilityFinancialGoals";

/* last question will be precalculated based on userAge, some logic will see count -1 to not showing last question for user input */
const RiskProfileQuestion = ({ navigation, route }) => {
    const { getModel } = useModelController();
    const { birthDate } = getModel("user");
    const userAge = getAgeByDob(birthDate);

    const totalAnswerObject = route?.params?.totalAnswerObject || [];
    const totalQuestionObject = useRef(route?.params?.totalQuestionObject || []);
    const totalQuestionCount = useRef(totalQuestionObject.current.length - 1);
    const currentQuestionNo = useRef(route?.params?.currentQuestionNo || 1);
    const currentQuestionObject = useRef(
        totalQuestionObject.current?.[currentQuestionNo.current - 1]
    );

    const [selectedOptions, setSelectedOptions] = useState(null);
    const [buttonEnabled, setButtonEnabled] = useState(false);
    const [selectedAnswerObject, setSelectedAnswerObject] = useState({});

    const [displayObject, setDisplayObject] = useState({
        currentQuestionNo: currentQuestionNo.current,
        headerTitle: `Step ${currentQuestionNo.current} of ${totalQuestionCount.current}`,
        isSecondLastQuestion: currentQuestionNo.current === totalQuestionCount.current,
        currentQuestionObject: currentQuestionObject.current,
        currentQuestionTitle: currentQuestionObject.current?.questDesc,
        options: currentQuestionObject.current?.questAnsDetList,
        disclaimer: currentQuestionObject.current?.disclaimer,
        subtitle: currentQuestionObject.current?.subtitle,
        notes1: currentQuestionObject.current?.note1,
        notes2: currentQuestionObject.current?.note2,
        isOptionsHorizontal: currentQuestionObject.current?.questAnsDetList?.find(
            (item) => item?.imgUrl != null
        ),
        moduleCd: currentQuestionObject.current?.moduleCd,
    });

    useEffect(() => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]:
                "FinancialGoals_RiskProfileTest_" + (route?.params?.currentQuestionNo || 1),
        });
    }, [route?.params?.currentQuestionNo]);

    useEffect(() => {
        if (!route?.params?.currentQuestionNo) {
            fetchQuestionaire();
        }
    }, [fetchQuestionaire, route?.params?.currentQuestionNo]);

    const fetchQuestionaire = useCallback(async () => {
        try {
            const response = await getRiskQuestionnaire();
            if (response?.data) {
                totalQuestionObject.current = response?.data?.questionDet;
                totalQuestionCount.current = totalQuestionObject.current.length - 1;
                currentQuestionNo.current = 1;
                currentQuestionObject.current =
                    totalQuestionObject.current?.[currentQuestionNo.current - 1];

                setDisplayObject({
                    currentQuestionNo: currentQuestionNo.current,
                    headerTitle: `Step ${currentQuestionNo.current} of ${totalQuestionCount.current}`,
                    isSecondLastQuestion: currentQuestionNo.current === totalQuestionCount.current,
                    currentQuestionObject: currentQuestionObject.current,
                    currentQuestionTitle: currentQuestionObject.current?.questDesc,
                    options: currentQuestionObject.current?.questAnsDetList,
                    disclaimer: currentQuestionObject.current?.disclaimer,
                    subtitle: currentQuestionObject.current?.subtitle,
                    notes1: currentQuestionObject.current?.note1,
                    notes2: currentQuestionObject.current?.note2,
                    isOptionsHorizontal: currentQuestionObject.current?.questAnsDetList?.find(
                        (item) => item?.imgUrl != null
                    ),
                    moduleCd: currentQuestionObject.current?.moduleCd,
                });
            }
        } catch (error) {
            showErrorToast({ message: error?.message });
        }
    }, []);

    function onPressBack() {
        navigation.goBack();
    }

    // last question is about age group, will be preselected based on userAge
    function getAgeGroupRangeAnswerObject() {
        const lastQuestion = totalQuestionObject.current[totalQuestionObject.current.length - 1];
        const lastQuestionOptions = lastQuestion?.questAnsDetList;

        let selectedOptions = {};
        switch (true) {
            case userAge >= 18 && userAge <= 29:
                selectedOptions = lastQuestionOptions?.[0];
                break;
            case userAge >= 30 && userAge <= 39:
                selectedOptions = lastQuestionOptions?.[1];
                break;
            case userAge >= 40 && userAge <= 49:
                selectedOptions = lastQuestionOptions?.[2];
                break;
            case userAge >= 50 && userAge <= 59:
                selectedOptions = lastQuestionOptions?.[3];
                break;
            case userAge >= 60:
                selectedOptions = lastQuestionOptions?.[4];
                break;
            default:
                break;
        }

        return {
            questId: lastQuestion?.questId,
            questAnsId: selectedOptions?.questAnsId,
            ansDesc: selectedOptions?.ansDesc,
            score: selectedOptions?.score,
            moduleCd: lastQuestion?.moduleCd,
            isActive: lastQuestion?.isActive,
        };
    }

    function onPressContinue() {
        if (!displayObject?.isSecondLastQuestion) {
            navigation.push(BANKINGV2_MODULE, {
                screen: RISK_PROFILE_QUESTION,
                params: {
                    ...route?.params,
                    currentQuestionNo: displayObject?.currentQuestionNo + 1,
                    totalQuestionObject: totalQuestionObject.current,
                    totalAnswerObject: [...totalAnswerObject, selectedAnswerObject],
                    // ...route?.params,
                },
            });
        } else {
            navigation.push(BANKINGV2_MODULE, {
                screen: RISK_PROFILE_RESULT,
                params: {
                    ...route?.params,
                    totalAnswerObject: [
                        ...totalAnswerObject,
                        selectedAnswerObject,
                        getAgeGroupRangeAnswerObject(),
                    ],
                    // ...route?.params,
                },
            });
        }
    }

    function onItemPress(item, index) {
        setSelectedOptions(index);
        setButtonEnabled(true);
        const answeredObject = {
            questId: item?.questId,
            questAnsId: item?.questAnsId,
            ansDesc: item?.ansDesc,
            score: item?.score,
            moduleCd: displayObject?.moduleCd,
            isActive: item?.isActive,
        };
        setSelectedAnswerObject(answeredObject);
    }

    function renderCarouselItem({ item, index }) {
        return (
            <OptionsImageItem
                title={item?.ansDesc}
                image={item?.imgUrl}
                isSelected={selectedOptions === index || false}
                description={item?.description}
                // eslint-disable-next-line react/jsx-no-bind
                onPress={() => onItemPress(item, index)}
                imageText={item?.imgText}
                imageTextValue={item?.imgTextValue}
            />
        );
    }

    function optionImageKeyExtractor(item, index) {
        return `${item?.ansDesc}-${index}`;
    }

    function onPressClose() {
        if (route?.params?.fromScreen) {
            navigation.navigate(BANKINGV2_MODULE, {
                screen: route?.params?.fromScreen,
                params: {
                    showPopup: true,
                    customerRiskLevel: route?.params?.customerRiskLevel,
                    ...route?.params,
                },
            });
        } else {
            navigation.goBack();
        }
    }

    return (
        <ScreenContainer backgroundType="color">
            <ScreenLayout
                header={
                    <HeaderLayout
                        headerLeftElement={<HeaderBackButton onPress={onPressBack} />}
                        headerCenterElement={
                            <Typo fontSize={14} fontWeight="600" color="#7c7c7c">
                                {displayObject?.headerTitle}
                            </Typo>
                        }
                        headerRightElement={
                            <HeaderCloseButton isWhite={false} onPress={onPressClose} />
                        }
                    />
                }
                useSafeArea
                paddingTop={0}
                paddingHorizontal={0}
                paddingBottom={0}
            >
                <ScrollView style={styles.container}>
                    <Typo
                        text={displayObject?.currentQuestionTitle}
                        fontWeight="600"
                        fontSize={16}
                        lineHeight={25}
                        textAlign="left"
                    />
                    {displayObject?.disclaimer && (
                        <HTML
                            html={displayObject?.disclaimer}
                            baseFontStyle={styles.subtitle}
                            tagsStyles={{
                                em: {
                                    fontFamily: "montserrat",
                                    fontSize: 14,
                                    fontWeight: "400",
                                    lineHeight: 20,
                                    color: BLACK,
                                    fontStyle: "italic",
                                },
                            }}
                        />
                    )}
                    {displayObject?.subtitle && (
                        <Typo
                            text={displayObject?.subtitle}
                            fontWeight="400"
                            fontSize={14}
                            textAlign="left"
                            style={styles.subtitle}
                        />
                    )}

                    {/* options with imageUrl will be showing horizontal */}
                    {displayObject?.isOptionsHorizontal ? (
                        <FlatList
                            data={displayObject?.options}
                            horizontal
                            renderItem={renderCarouselItem}
                            showsHorizontalScrollIndicator={false}
                            itemWidth={Dimensions.get("window").width - 48}
                            keyExtractor={optionImageKeyExtractor}
                        />
                    ) : (
                        displayObject?.options?.map((item, index) => {
                            return (
                                <OptionsItem
                                    key={index}
                                    title={item?.ansDesc}
                                    isSelected={selectedOptions === index || false}
                                    // eslint-disable-next-line react/jsx-no-bind
                                    onRadioButtonPressed={() => onItemPress(item, index)}
                                />
                            );
                        })
                    )}

                    <SpaceFiller height={20} />

                    {displayObject?.notes1 && (
                        <Typo
                            text={displayObject?.notes1}
                            fontWeight="400"
                            fontSize={12}
                            textAlign="left"
                            lineHeight={20}
                        />
                    )}

                    <SpaceFiller height={20} />

                    {displayObject?.notes2 && (
                        <Typo
                            text={displayObject?.notes2}
                            fontWeight="400"
                            fontSize={12}
                            textAlign="left"
                            lineHeight={20}
                        />
                    )}
                    <SpaceFiller height={20} />
                </ScrollView>
                <FixedActionContainer>
                    <ActionButton
                        fullWidth
                        disabled={!buttonEnabled}
                        backgroundColor={buttonEnabled ? YELLOW : DISABLED}
                        onPress={onPressContinue}
                        style={styles.button}
                        componentCenter={
                            <Typo
                                text={displayObject?.isSecondLastQuestion ? SUBMIT : CONTINUE}
                                fontWeight="600"
                                fontSize={14}
                                color={buttonEnabled ? BLACK : DISABLED_TEXT}
                            />
                        }
                    />
                </FixedActionContainer>
            </ScreenLayout>
        </ScreenContainer>
    );
};

RiskProfileQuestion.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
    item: PropTypes.object,
    index: PropTypes.number,
};

const OptionsItem = ({ title, isSelected, onRadioButtonPressed }) => {
    return (
        <View style={styles.optionsContainer}>
            <ColorRadioButton
                isSelected={isSelected}
                onRadioButtonPressed={onRadioButtonPressed}
                title={title}
            />
        </View>
    );
};

OptionsItem.propTypes = {
    title: PropTypes.string,
    isSelected: PropTypes.bool,
    onRadioButtonPressed: PropTypes.func,
};
function OptionsImageItem({ title, image, isSelected, onPress, imageText, imageTextValue }) {
    return (
        <TouchableOpacity style={styles.optionImageContainer} onPress={onPress} activeOpacity={0.8}>
            <View style={styles.optionImageRadioButton}>
                <ColorRadioButton
                    title={title}
                    onRadioButtonPressed={onPress}
                    isSelected={isSelected}
                />
            </View>
            <Image source={{ uri: image }} style={styles.optionImageItemImage} />
            <Typo
                text={imageText}
                fontSize={12}
                fontWeight="400"
                lineHeight={24}
                style={styles.averageReturn}
            />
            <Typo text={imageTextValue} fontSize={20} fontWeight="400" lineHeight={24} />
        </TouchableOpacity>
    );
}

OptionsImageItem.propTypes = {
    title: PropTypes.string,
    image: PropTypes.string,
    isSelected: PropTypes.bool,
    onPress: PropTypes.func,
    imageText: PropTypes.string,
    imageTextValue: PropTypes.string,
};

const styles = StyleSheet.create({
    averageReturn: {
        paddingTop: 20,
    },
    button: {
        marginRight: 24,
    },
    container: {
        flex: 1,
        paddingLeft: 24,
        paddingRight: 24,
    },
    optionImageContainer: {
        alignItems: "center",
        backgroundColor: WHITE,
        borderColor: GREY,
        borderRadius: 8,
        borderWidth: 1,
        flexDirection: "column",
        justifyContent: "center",
        marginRight: 24,
        marginTop: 24,
        padding: 15,
        shadowColor: BLACK,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    optionImageItemImage: {
        height: 100,
        resizeMode: "contain",
        width: 200,
    },
    optionImageRadioButton: {
        alignItems: "center",
        justifyContent: "center",
        paddingBottom: 35,
    },
    optionsContainer: {
        paddingVertical: 10,
    },
    subtitle: {
        paddingTop: 15,
    },
});

export default RiskProfileQuestion;
