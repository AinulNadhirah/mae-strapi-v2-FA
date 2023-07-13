/* eslint-disable react/jsx-no-bind */
import numeral from "numeral";
import PropTypes from "prop-types";
import React, { useState, useMemo, useCallback } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity, Image } from "react-native";
import Slider from "react-native-slider";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import ColorRadioButton from "@components/Buttons/ColorRadioButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import RadioChecked from "@components/Common/RadioChecked";
import RadioUnchecked from "@components/Common/RadioUnchecked";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { applyCC } from "@services/analytics/analyticsSTPCreditcardAndSuppCard";

import {
    MEDIUM_GREY,
    DISABLED,
    YELLOW,
    BLACK,
    WHITE,
    BLUE,
    DISABLED_TEXT,
} from "@constants/colors";
import { COMMON_ERROR_MSG, FA_APPLY_CREDITCARD_MONTHLYINCOME, NEXT } from "@constants/strings";

import Assets from "@assets";

function CardsLanding({ navigation, route }) {
    const [enableBtn, setEnableBtn] = useState(true);
    const [minValue] = useState(2000);
    const [maxValue] = useState(15000);
    const [sliderValue, setSliderValue] = useState(5200);
    const [cardType, setCardType] = useState("");
    const [featureString, setFeatureString] = useState([]);
    const [featureList, setFeatureList] = useState([
        { title: "Cashback", icon: Assets.iconCashback, isSelected: false, id: 1 },
        { title: "Travel", icon: Assets.iconTravel, isSelected: false, id: 2 },
        { title: "Lifestyle", icon: Assets.iconLifestyle, isSelected: false, id: 3 },
        { title: "Online Shopping", icon: Assets.iconShopping, isSelected: false, id: 4 },
        /*{ title: "Islamic", icon: Assets.iconIslamic, isSelected: false, id: 4 },
        { title: "Everyday", icon: Assets.iconEveryday, isSelected: false, id: 5 },
        { title: "Retail & Petrol", icon: Assets.iconPetrol, isSelected: false, id: 6 },*/
    ]);
    const pm = route?.params ?? {};
    console.log(pm);
    function handleClose() {
        navigation.canGoBack() && navigation.goBack();
    }

    function handleSliderChange(val) {
        setSliderValue(val);
    }

    function handleToggle(ctype) {
        const type = ctype === "Islamic" ? "I" : "C";
        if (cardType !== type) setCardType(type);
        else setCardType("");
    }

    async function handleProceedButton() {
        try {
            applyCC.onProceedCardLanding(cardType, featureString);

            const userAction = {
                salaryRange: sliderValue,
                cardDispOrganization: cardType,
                cardDispFeatures: featureString,
                stpCustType: "",
            };
            const params = route?.params ?? {};
            const {
                serverData: { cardDispDataArr, custInd, m2uCustInd },
            } = params;
            const { salaryRange, cardDispOrganization, cardDispFeatures } = userAction;
            const ETBWOM2U = custInd === "0" && m2uCustInd === "0";
            const ETBWM2U = custInd === "0" && m2uCustInd === "1";
            const custTypeETB = ETBWM2U ? "01" : "10";
            const custInfo = {
                isEtbM2u: ETBWM2U,
                isEtbWithOutM2u: ETBWOM2U,
                isNtb: custInd === "1" && m2uCustInd === "0",
                stpCustType: ETBWOM2U ? "00" : custTypeETB,
            };
            const newData = [];

            //filter by monthly income and card type (islamic / conventional)
            cardDispDataArr &&
                cardDispDataArr.map((item, index) => {
                    if (item?.monthlyIncomeRange <= salaryRange) {
                        if (cardDispOrganization) {
                            if (item && item.cardDispOrganization === cardDispOrganization) {
                                newData.push({ ...item, isSelected: false, id: index });
                            }
                        } else {
                            newData.push({ ...item, isSelected: false, id: index });
                        }
                    }
                });

            //filter based on category/interest
            const filteredData = [];

            newData &&
                newData.map((item, index) => {
                    const serverFeatures = item?.cardDispFeatures.split("|") ?? [];
                    if (cardDispFeatures.length !== 0) {
                        if (serverFeatures.some((r) => cardDispFeatures.includes(r))) {
                            filteredData.push({ ...item, isSelected: false, id: index });
                        }
                    } else {
                        filteredData.push({ ...item, isSelected: false, id: index });
                    }
                });

            if (filteredData.length > 0) {
                navigation.navigate("CardsTypeSelection", {
                    ...route?.params,
                    userAction,
                    custInfo,
                    formattedFeaturesList: filteredData,
                });
            } else {
                showErrorToast({
                    message: "Sorry, no card available for your selection",
                });
            }
        } catch (error) {
            console.log(error);
            showErrorToast({
                message: COMMON_ERROR_MSG,
            });
        }
    }

    const onSelectCard = useCallback(
        (value) => {
            const currentData = [...featureList];
            let ct = 0;
            let newData = [];
            let selectedArr = [];
            currentData.map((item) => {
                const isSel =
                    (item.isSelected && item.id !== value.id) ||
                    (item.id === value.id && !value.isSelected);
                newData.push({ ...item, isSelected: isSel });
                if (isSel) {
                    ct++;
                    selectedArr.push(item.title);
                }
            });
            console.log(ct > 0);
            setFeatureString(selectedArr);
            setFeatureList(newData);
        },
        [featureList, setEnableBtn, setFeatureString, setFeatureList]
    );

    const selectCard = useMemo(() => {
        return featureList.map((item, index) => {
            return (
                <View key={index} style={styles.cardFeatureListContainer}>
                    <TouchableOpacity activeOpacity={1} onPress={() => onSelectCard(item)}>
                        <View style={styles.cardFeatureListClickable}>
                            <View style={styles.cardFeatureListSubContainer}>
                                <View style={styles.cardImageText}>
                                    <Image style={styles.imageCls} height={70} source={item.icon} />
                                    <View style={styles.imageView}>
                                        <Typo
                                            fontSize={16}
                                            fontWeight="600"
                                            lineHeight={18}
                                            text={item.title}
                                        />
                                    </View>
                                </View>
                                <View>
                                    {item?.isSelected ? (
                                        <RadioChecked
                                            style={styles.radioButton}
                                            paramLabelCls={styles.radioBtnLabelCls}
                                            paramContainerCls={styles.radioBtnContainerStyle}
                                            checkType="image"
                                            imageSrc={Assets.icRadioChecked}
                                        />
                                    ) : (
                                        <RadioUnchecked
                                            paramLabelCls={styles.radioBtnLabelCls}
                                            paramContainerCls={styles.radioBtnContainerStyle}
                                        />
                                    )}
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>
            );
        });
    }, [featureList, onSelectCard]);

    return (
        <ScreenContainer
            backgroundType="color"
            backgroundColor={MEDIUM_GREY}
            analyticScreenName={FA_APPLY_CREDITCARD_MONTHLYINCOME}
        >
            <>
                <ScreenLayout
                    paddingBottom={36}
                    paddingTop={16}
                    paddingHorizontal={0}
                    header={
                        <HeaderLayout
                            headerRightElement={<HeaderCloseButton onPress={handleClose} />}
                            headerLeftElement={<HeaderBackButton onPress={handleClose} />}
                        />
                    }
                    useSafeArea
                    neverForceInset={["bottom"]}
                >
                    <ScrollView
                        horizontal={false}
                        contentContainerStyle={styles.scrollCls}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.container}>
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={28}
                                text="Credit Card"
                                textAlign="left"
                            />
                            <Typo
                                fontSize={20}
                                fontWeight="300"
                                lineHeight={28}
                                style={styles.label}
                                text="Let’s find the right credit card for you"
                                textAlign="left"
                            />
                            <View style={styles.label}>
                                <Typo
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={28}
                                    text="Your monthly income"
                                    textAlign="left"
                                />
                                <Typo
                                    fontSize={12}
                                    fontWeight="400"
                                    lineHeight={18}
                                    text="Drag the slider to adjust your monthly income."
                                    textAlign="left"
                                />
                            </View>
                            <View style={styles.incomeSliderContainer}>
                                <Typo
                                    fontSize={24}
                                    fontWeight="600"
                                    lineHeight={28}
                                    text={`RM ${numeral(sliderValue).format("0,0.00")}`}
                                />
                                <View style={styles.incomeSliderContainerInner}>
                                    <Slider
                                        value={sliderValue}
                                        minimumValue={minValue}
                                        maximumValue={maxValue}
                                        step={50}
                                        minimumTrackTintColor={BLUE}
                                        maximumTrackTintColor={WHITE}
                                        trackStyle={styles.incomeSliderTrack}
                                        thumbStyle={styles.incomeSliderThumb}
                                        onValueChange={handleSliderChange}
                                    />
                                    <View style={styles.incomeSliderLabelLeft}>
                                        <Typo
                                            fontSize={12}
                                            fontWeight="normal"
                                            lineHeight={18}
                                            text={`RM ${numeral(minValue).format("0,0.00")}`}
                                        />
                                    </View>
                                    <View style={styles.incomeSliderLabelRight}>
                                        <Typo
                                            fontSize={12}
                                            fontWeight="normal"
                                            lineHeight={18}
                                            text={`> RM ${numeral(maxValue).format("0,0.00")}`}
                                        />
                                    </View>
                                </View>
                            </View>
                            <View style={styles.label}>
                                <Typo
                                    fontSize={15}
                                    fontWeight="400"
                                    lineHeight={28}
                                    text="Credit card type"
                                    textAlign="left"
                                />

                                <View style={styles.radioContainer}>
                                    <View>
                                        <ColorRadioButton
                                            title="Islamic"
                                            isSelected={cardType === "I" ? true : false}
                                            fontSize={14}
                                            onRadioButtonPressed={handleToggle}
                                        />
                                    </View>
                                    <View style={styles.rightRadioBtn}>
                                        <ColorRadioButton
                                            title="Conventional"
                                            isSelected={cardType === "C" ? true : false}
                                            fontSize={14}
                                            onRadioButtonPressed={handleToggle}
                                        />
                                    </View>
                                </View>
                            </View>
                            <Typo
                                fontSize={14}
                                fontWeight="400"
                                lineHeight={28}
                                text="Select your interest"
                                textAlign="left"
                            />
                            {selectCard}
                        </View>
                    </ScrollView>
                    <FixedActionContainer>
                        <View style={styles.footer}>
                            <ActionButton
                                fullWidth
                                disabled={!enableBtn}
                                borderRadius={25}
                                onPress={handleProceedButton}
                                backgroundColor={!enableBtn ? DISABLED : YELLOW}
                                componentCenter={
                                    <Typo
                                        text={NEXT}
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={18}
                                        color={!enableBtn ? DISABLED_TEXT : BLACK}
                                    />
                                }
                            />
                        </View>
                    </FixedActionContainer>
                </ScreenLayout>
            </>
        </ScreenContainer>
    );
}

CardsLanding.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

const styles = StyleSheet.create({
    cardFeatureListClickable: {
        backgroundColor: WHITE,
        borderRadius: 8,
        height: 90,
    },
    cardFeatureListContainer: {
        flex: 1,
        flexDirection: "column",
        marginBottom: 6,
        marginTop: 10,
    },
    cardFeatureListSubContainer: {
        alignContent: "center",
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        marginHorizontal: 20,
        marginVertical: 10,
    },
    cardImageText: {
        flexDirection: "row",
    },

    container: {
        flex: 1,
        flexDirection: "column",
    },
    footer: {
        alignItems: "center",
        flexDirection: "column",
        width: "100%",
    },
    imageCls: { marginRight: 15 },
    imageView: { height: 70, justifyContent: "center" },
    incomeSliderContainer: {
        paddingBottom: 40,
        paddingHorizontal: 8,
    },
    incomeSliderLabelLeft: {
        bottom: -14,
        left: 0,
        position: "absolute",
    },
    incomeSliderLabelRight: {
        bottom: -14,
        position: "absolute",
        right: 0,
    },
    incomeSliderThumb: {
        backgroundColor: WHITE,
        borderColor: BLUE,
        borderRadius: 20,
        borderWidth: 8,
        height: 30,
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 0.45,
        shadowRadius: 6,
        width: 30,
    },
    incomeSliderTrack: {
        borderRadius: 20,
        height: 8,
    },
    label: {
        marginBottom: 24,
    },
    radioBtnContainerStyle: {
        alignItems: "flex-start",
        flexDirection: "row",
        justifyContent: "flex-start",
    },
    radioBtnLabelCls: {
        color: BLACK,
        fontSize: 14,
        fontStyle: "normal",
        fontWeight: "normal",
        letterSpacing: 0,
        lineHeight: 20,
        paddingLeft: 10,
    },
    radioButton: {
        alignItems: "flex-start",
        marginRight: 8,
    },
    radioContainer: {
        alignItems: "flex-start",
        flexDirection: "row",
        justifyContent: "flex-start",
        width: "100%",
    },
    rightRadioBtn: {
        marginLeft: 20,
        width: "60%",
    },
    scrollCls: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 20 },
});

export default CardsLanding;
