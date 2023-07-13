/* eslint-disable react/jsx-no-bind */
import PropTypes from "prop-types";
import React, { useState, useCallback } from "react";
import { View, StyleSheet, TouchableOpacity, Image, Platform, FlatList } from "react-native";
import { useSafeArea } from "react-native-safe-area-context";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import RadioChecked from "@components/Common/RadioChecked";
import RadioUnchecked from "@components/Common/RadioUnchecked";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { cardsVerify } from "@services";
import { applyCC } from "@services/analytics/analyticsSTPCreditcardAndSuppCard";

import { MEDIUM_GREY, YELLOW, LIGHT_YELLOW, BLACK, WHITE, LIGHT_BLACK } from "@constants/colors";
import { COMMON_ERROR_MSG, FA_APPLY_CREDITCARD_SELECTCARD } from "@constants/strings";

import Assets from "@assets";

const CardListItem = ({ item, onPress }) => {
    const onListItemPressed = useCallback(() => onPress(item), [item, onPress]);
    return (
        <View style={styles.listView}>
            <TouchableOpacity activeOpacity={1} onPress={onListItemPressed}>
                <View style={styles.cardFeatureListClickable}>
                    <View style={styles.cardItemContainer}>
                        <View style={styles.cardRowContainer}>
                            <View style={styles.cardItemSubContainer}>
                                <Typo
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={18}
                                    textAlign="left"
                                    style={styles.cardItemName}
                                    text={item?.level1}
                                />
                                {/*<Typo
                                            fontSize={14}
                                            fontWeight="normal"
                                            lineHeight={18}
                                            textAlign="left"
                                            style={styles.cardItemName}
                                            text={item?.level2}
                                        />*/}
                                <Image
                                    style={styles.cardItemImg}
                                    resizeMode={Platform.select({
                                        ios: "contain",
                                        android: "cover",
                                    })}
                                    source={{
                                        uri: item?.cardImagePath,
                                    }}
                                />
                            </View>
                            <View style={styles.radioContainer}>
                                {item?.isSelected ? (
                                    <RadioChecked
                                        style={styles.radioButton}
                                        paramLabelCls={styles.radioBtnLabelCls}
                                        checkType="image"
                                        imageSrc={Assets.icRadioChecked}
                                    />
                                ) : (
                                    <RadioUnchecked paramLabelCls={styles.radioBtnLabelCls} />
                                )}
                            </View>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    );
};

CardListItem.propTypes = {
    item: PropTypes.object,
    onPress: PropTypes.func,
};

const CardList = ({ list, onItemPress }) => {
    const extractKey = useCallback((item, index) => `${item.contentId}-${index}`, []);
    const onListItemPressed = useCallback((item) => onItemPress(item), [onItemPress]);
    const renderItem = useCallback(
        ({ item }) => <CardListItem item={item} onPress={onListItemPressed} />,
        [onListItemPressed]
    );

    return (
        <FlatList
            style={styles.cardList}
            data={list}
            extraData={list}
            scrollToIndex={0}
            showsHorizontalScrollIndicator={false}
            showIndicator={false}
            keyExtractor={extractKey}
            renderItem={renderItem}
        />
    );
};

CardList.propTypes = {
    list: PropTypes.any,
    onItemPress: PropTypes.any,
};

function CardsTypeSelection({ navigation, route }) {
    const params = route?.params ?? {};
    const [count, setCount] = useState(0);
    const [featureList, setFeatureList] = useState(params?.formattedFeaturesList ?? []);

    function handleBack() {
        navigation.canGoBack() && navigation.goBack();
    }

    function handleClose() {
        navigation.navigate(route?.params?.entryStack || "More", {
            screen: route?.params?.entryScreen || "Apply",
            params: route?.params?.entryParams,
        });
    }

    async function checkCardsVerifyApi(selectedCard) {
        const param = { selectedCardArray: selectedCard };
        const httpResp = await cardsVerify(param, "loan/v1/cardStp/stpCheckCard").catch((error) => {
            console.log(" Exception: ", error);
        });
        const result = httpResp?.data?.result ?? null;
        if (!result) {
            return;
        }
        const { statusCode, statusDesc } = result;
        if (statusCode === "0000") {
            navigation.navigate("CardsIntro", {
                ...params,
                userAction: { ...params?.userAction, selectedCard },
            });
        } else {
            showErrorToast({
                message: statusDesc || COMMON_ERROR_MSG,
            });
        }
    }

    function handleProceedButton() {
        const selectedCard = featureList
            .filter((item) => item?.isSelected)
            .map((item) => ({
                ...item,
                displayValue: item?.level1,
                image: item?.cardImagePath,
            }));

        applyCC.onFormProceedCardTypeSelection(selectedCard);
        if (params?.postLogin) {
            checkCardsVerifyApi(selectedCard);
        } else {
            navigation.navigate("CardsIntro", {
                ...params,
                userAction: { ...params?.userAction, selectedCard },
            });
        }
    }

    function onSelectCard(value) {
        console.log(value);
        if (count >= 5 && !value.isSelected) {
            return;
        }
        const currentData = [...featureList];
        let ct = 0;
        let newData = [];
        currentData.map((item) => {
            const isSel =
                (item.isSelected && item.id !== value.id) ||
                (item.id === value.id && !value.isSelected);
            newData.push({ ...item, isSelected: isSel });
            if (isSel) {
                ct++;
            }
        });
        setCount(ct);
        setFeatureList(newData);
    }
    return (
        <ScreenContainer
            backgroundType="color"
            backgroundColor={MEDIUM_GREY}
            analyticScreenName={FA_APPLY_CREDITCARD_SELECTCARD}
        >
            <>
                <ScreenLayout
                    paddingBottom={0}
                    paddingTop={0}
                    paddingHorizontal={0}
                    header={
                        <HeaderLayout
                            headerRightElement={<HeaderCloseButton onPress={handleClose} />}
                            headerLeftElement={<HeaderBackButton onPress={handleBack} />}
                        />
                    }
                    useSafeArea
                    neverForceInset={["bottom"]}
                >
                    <View style={styles.container}>
                        <View style={styles.copy}>
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={28}
                                text="Credit Card Application"
                                textAlign="left"
                            />
                            <Typo
                                fontSize={20}
                                fontWeight="300"
                                lineHeight={28}
                                style={styles.label}
                                text="Select the right credit card for you"
                                textAlign="left"
                            />
                        </View>
                        <CardList list={featureList} onItemPress={onSelectCard} />
                        {/* Bottom docked bar */}
                        <BottomView
                            bottomInfo={`${count}/5 cards selected`}
                            onDoneEvent={handleProceedButton}
                            buttonLabel="Next"
                            isButtonEnabled={count !== 0}
                        />
                    </View>
                </ScreenLayout>
            </>
        </ScreenContainer>
    );
}

CardsTypeSelection.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

const BottomView = ({ bottomInfo, onDoneEvent, buttonLabel, isButtonEnabled }) => {
    const safeArea = useSafeArea();

    return (
        <View style={styles.containerFooter(safeArea)}>
            <Typo
                fontSize={14}
                fontWeight="600"
                letterSpacing={0}
                lineHeight={18}
                textAlign="left"
                text={bottomInfo}
            />
            <ActionButton
                backgroundColor={isButtonEnabled ? YELLOW : LIGHT_YELLOW}
                onPress={onDoneEvent}
                width={108}
                height={40}
                borderRadius={20}
                componentCenter={
                    <Typo
                        text={buttonLabel}
                        fontSize={14}
                        fontWeight="600"
                        color={isButtonEnabled ? BLACK : LIGHT_BLACK}
                    />
                }
                disabled={!isButtonEnabled}
            />
        </View>
    );
};

BottomView.propTypes = {
    bottomInfo: PropTypes.any,
    buttonLabel: PropTypes.any,
    isButtonEnabled: PropTypes.any,
    onDoneEvent: PropTypes.any,
};

const styles = StyleSheet.create({
    cardFeatureListClickable: {
        backgroundColor: WHITE,
        borderRadius: 8,
    },
    cardItemContainer: { margin: 20, paddingRight: 10 },
    cardItemImg: { height: 96, marginBottom: 10, width: 149 },
    cardItemName: { marginVertical: 5 },
    cardItemSubContainer: {
        flexDirection: "column",
        justifyContent: "space-between",
        paddingRight: 15,
        width: "90%",
    },
    cardList: { width: "100%" },

    cardRowContainer: {
        alignContent: "flex-end",
        flexDirection: "row",
        justifyContent: "space-between",
    },
    container: {
        flex: 1,
    },
    containerFooter: (inset) => ({
        alignItems: "center",
        backgroundColor: WHITE,
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 18,
        paddingHorizontal: 24,
        paddingBottom: inset.bottom ? inset.bottom : 18,
        shadowColor: "rgba(0, 0, 0, 0.15)",
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowRadius: 15,
        shadowOpacity: 1,
    }),
    copy: {
        marginBottom: 2,
        paddingHorizontal: 36,
    },
    label: {
        marginBottom: 24,
    },
    listView: {
        marginBottom: 14,
        paddingHorizontal: 36,
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
    radioContainer: { marginTop: 4 },
});

export default CardsTypeSelection;
