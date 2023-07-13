import { useFocusEffect } from "@react-navigation/native";
import PropTypes from "prop-types";
import React, { useState, useCallback, useEffect, useMemo } from "react";
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Image,
    Dimensions,
    ActivityIndicator,
    ScrollView,
    Text,
} from "react-native";
import Config from "react-native-config";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PROMO_DETAILS } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import { Dropdown } from "@components/Common/DropDownButtonCenter";
import { ScrollPickerView } from "@components/Common/ScrollPickerView";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { getCategoryList } from "@services";
import { logEvent } from "@services/analytics";

import { MEDIUM_GREY, BLACK, YELLOW, WHITE, SHADOW, ROYAL_BLUE } from "@constants/colors";
import {
    CURRENCY,
    NEAREST_ONE,
    NEAREST_FIVE,
    NEAREST_TEN,
    FA_SELECT_ACTION,
    FA_ACTION_NAME,
    FA_TABUNG,
    GUILTY_PLESURE,
    FA_TAB_NAME,
    FA_SCREEN_NAME,
    BOOSTERS,
    FA_FORM_PROCEED,
    FA_TABUNG_TABUNGBOOSTER_GP_SELECTCATEGORY,
    FA_FIELD_INFORMATION,
    FA_TABUNG_TABUNGBOOSTER_SC_SELECTAMOUNT,
    FA_VIEW_SCREEN,
    FA_TABUNG_TABUNGBOOSTER_SC_REVIEWDETAILS,
    FA_TABUNG_TABUNGBOOSTER_SNS_REVIEWDETAILS,
    FA_TABUNG_TABUNGBOOSTER_GP_REVIEWDETAILS,
} from "@constants/strings";

import Images from "@assets";

const { width } = Dimensions.get("window");

const amounts = [
    {
        id: 0,
        type: `${CURRENCY} 1.00`,
        amount: "1.00",
        desc: "",
        selected: true,
        message: NEAREST_ONE,
        name: `${CURRENCY} 1.00`,
        const: "NEAREST_ONE",
        isSelected: false,
        index: 0,
    },
    {
        id: 1,
        type: `${CURRENCY} 5.00`,
        amount: "5.00",
        desc: "",
        selected: false,
        message: NEAREST_FIVE,
        name: `${CURRENCY} 5.00`,
        const: "NEAREST_FIVE",
        isSelected: false,
        index: 1,
    },
    {
        id: 2,
        type: `${CURRENCY} 10.00`,
        amount: "10.00",
        desc: "",
        selected: false,
        message: NEAREST_TEN,
        name: `${CURRENCY} 10.00`,
        const: "NEAREST_TEN",
        isSelected: false,
        index: 2,
    },
];

const mainCategory = [6, 16, 4, 3, 7, 13, 9];

const DetailsContent = () => (
    <View style={styles.popupDetails}>
        <Typo
            fontSize={16}
            fontWeight="600"
            lineHeight={18}
            text="Category"
            textAlign="left"
            style={styles.popupTitle}
        />
        <ScrollView>
            <Typo
                fontSize={14}
                fontWeight="normal"
                lineHeight={20}
                text="Items that fall under each category listed:"
                textAlign="left"
                style={styles.popupCopy}
            />
            <View style={styles.popupTopLine}>
                <Typo fontSize={14} fontWeight="normal" lineHeight={20} textAlign="left">
                    <>
                        <Typo fontSize={14} fontWeight="600" lineHeight={20} textAlign="left">
                            <Text>Electronics: </Text>
                        </Typo>
                        <Text>Household appliances, computer and Digital applications.</Text>
                    </>
                </Typo>
            </View>
            <View style={styles.popupRow}>
                <Typo fontSize={14} fontWeight="normal" lineHeight={20} textAlign="left">
                    <>
                        <Typo fontSize={14} fontWeight="600" lineHeight={20} textAlign="left">
                            <Text>Entertainment: </Text>
                        </Typo>
                        <Text>
                            Photography, Music, Gaming, Art & craft, Art gallery, Motion picture,
                            Tourist attractions and Amusement Parks.
                        </Text>
                    </>
                </Typo>
            </View>
            <View style={styles.popupRow}>
                <Typo fontSize={14} fontWeight="normal" lineHeight={20} textAlign="left">
                    <>
                        <Typo fontSize={14} fontWeight="600" lineHeight={20} textAlign="left">
                            <Text>Food & Beverage: </Text>
                        </Typo>
                        <Text>Restaurants, Beverages, Bakery, Grocery and Caterers.</Text>
                    </>
                </Typo>
            </View>
            <View style={styles.popupRow}>
                <Typo fontSize={14} fontWeight="normal" lineHeight={20} textAlign="left">
                    <>
                        <Typo fontSize={14} fontWeight="600" lineHeight={20} textAlign="left">
                            <Text>Health & Beauty: </Text>
                        </Typo>
                        <Text>
                            Cosmetics, Beauty & Barber stores, Massage parlors and Health Spas.
                        </Text>
                    </>
                </Typo>
            </View>
            <View style={styles.popupRow}>
                <Typo fontSize={14} fontWeight="normal" lineHeight={20} textAlign="left">
                    <>
                        <Typo fontSize={14} fontWeight="600" lineHeight={20} textAlign="left">
                            <Text>Leisure & Sports: </Text>
                        </Typo>
                        <Text>
                            Recreational camping, Bicycle, Sporting goods, Sports & Membership club
                            and Golf.
                        </Text>
                    </>
                </Typo>
            </View>
            <View style={styles.popupRow}>
                <Typo fontSize={14} fontWeight="normal" lineHeight={20} textAlign="left">
                    <>
                        <Typo fontSize={14} fontWeight="600" lineHeight={20} textAlign="left">
                            <Text>Shopping: </Text>
                        </Typo>
                        <Text>
                            Jewellery & watches, Stationery & book stores, Clothes, Shoes,
                            Department stores, Luggage and Sewing store.
                        </Text>
                    </>
                </Typo>
            </View>
            <View style={styles.popupRow}>
                <Typo fontSize={14} fontWeight="normal" lineHeight={20} textAlign="left">
                    <>
                        <Typo fontSize={14} fontWeight="600" lineHeight={20} textAlign="left">
                            <Text>Travel: </Text>
                        </Typo>
                        <Text>Airlines, Accommodation, Airport terminal and Travel agency.</Text>
                    </>
                </Typo>
            </View>
        </ScrollView>
    </View>
);

function CategoryThumb({ category, onPress }) {
    const thumbWidth = (width - 72) / 3;

    function handlePress() {
        onPress(category);
    }

    function breakWord(word) {
        if (word.indexOf("&") > -1)
            return `${word.substr(0, word.indexOf("&") - 1)} &\n${word.substr(
                word.indexOf("&") + 2,
                word.length
            )}`;

        return word;
    }

    return (
        <TouchableOpacity
            onPress={handlePress}
            style={[styles.categoryThumb, { width: thumbWidth }]}
        >
            <View style={styles.categoryIcon}>
                <View
                    style={[
                        {
                            backgroundColor: category.colorCode,
                        },
                        styles.categoryIconInner,
                    ]}
                >
                    <Image source={{ uri: category.image }} style={styles.categoryIconImg} />
                </View>
            </View>
            <View>
                <Typo
                    fontSize={thumbWidth < 93 ? 10 : 12}
                    fontWeight="600"
                    lineHeight={18}
                    text={breakWord(category.name)}
                />
            </View>
        </TouchableOpacity>
    );
}

CategoryThumb.propTypes = {
    category: PropTypes.object,
    onPress: PropTypes.func,
};

function Setup({ navigation, route }) {
    const safeArea = useSafeAreaInsets();
    const [detailsVisible, setDetailsVisible] = useState(false);
    const [isPickerVisible, setPicker] = useState(false);
    const [loading, setLoading] = useState(false);
    const [categoriesList, setCategories] = useState([]);
    const [selectedAmount, setSelectedAmount] = useState(route?.params?.amount ?? amounts[0].name);
    const [selectedIndex, setSelectedIndex] = useState(route?.params?.selectedIndex || 0);
    const setupType = route?.params?.boosterType;
    const categories = useMemo(() => route?.params?.categories ?? [], [route?.params?.categories]);

    function handleBack() {
        navigation.canGoBack() && navigation.goBack();
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]:
                setupType === "S"
                    ? FA_TABUNG_TABUNGBOOSTER_SC_REVIEWDETAILS
                    : setupType === "Q"
                    ? FA_TABUNG_TABUNGBOOSTER_SNS_REVIEWDETAILS
                    : setupType === "G"
                    ? FA_TABUNG_TABUNGBOOSTER_GP_REVIEWDETAILS
                    : "",
        });
    }

    function customPopup() {
        return <DetailsContent />;
    }

    function getTitle() {
        if (setupType === "S") return "Spare Change";
        return "Guilty Pleasure";
    }

    function getDescriptions() {
        if (setupType === "S") return "How much would you like to round up your expenses to?";
        return "Change your overspending habits for the better with this Booster.";
    }

    function getArticleId() {
        if (setupType === "S") {
            return Config.BOOSTER_SC_ARTICLE_ID;
        }

        if (setupType === "G") {
            return Config.BOOSTER_GP_ARTICLE_ID;
        }
    }

    function handleShowPicker() {
        setPicker(true);
    }

    function handleDone(item, index) {
        setSelectedAmount(item.name);
        setSelectedIndex(index);
        setPicker(false);
    }

    function handleCancel() {
        setPicker(false);
    }

    function handleShowDetails() {
        setDetailsVisible(true);
    }

    function handleCloseDetails() {
        setDetailsVisible(false);
    }

    function handleLearnMore() {
        navigation.navigate("promosModule", {
            screen: PROMO_DETAILS,
            params: {
                itemDetails: {
                    id: getArticleId(),
                },
                callPage: "",
                index: 0,
            },
        });
    }

    function handleProceedSetup() {
        const selectedItem = amounts[selectedIndex];

        navigation.navigate("BoosterSummary", {
            ...route.params,
            selectedIndex,
            amount: selectedItem.name,
            message: selectedItem.message,
        });
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]:
                setupType === "S"
                    ? FA_TABUNG_TABUNGBOOSTER_SC_REVIEWDETAILS
                    : setupType === "Q"
                    ? FA_TABUNG_TABUNGBOOSTER_SNS_REVIEWDETAILS
                    : setupType === "G"
                    ? FA_TABUNG_TABUNGBOOSTER_GP_REVIEWDETAILS
                    : "",
        });
    }

    function handleGoToDailyLimitSetup(category) {
        navigation.navigate("BoosterDailyLimit", {
            ...route.params,
            isEdit: false,
            categories: [...categories, category],
            categoryIndex: categories.length, // the last one
        });

        logEvent(FA_FORM_PROCEED, {
            [FA_SCREEN_NAME]: FA_TABUNG_TABUNGBOOSTER_GP_SELECTCATEGORY,
            [FA_FIELD_INFORMATION]: category?.name || "",
        });
    }

    const mergeCategory = useCallback(
        (allCategory) => {
            const onlyInCategoriesAndOrder = mainCategory
                .map((c) => allCategory.find((ca) => c === ca.btsId))
                .filter((c) => c);

            const notSelected = onlyInCategoriesAndOrder.filter((cat) => {
                if (categories.length) {
                    return !categories.find((c) => c.btsId === cat.btsId);
                }

                return cat;
            });

            setCategories(notSelected);
        },
        [categories]
    );

    const getCategory = useCallback(async () => {
        setLoading(true);

        try {
            const response = await getCategoryList();

            if (response && response.data) {
                const { categories: rawCategory } = response.data;
                mergeCategory(rawCategory);
            }
        } catch (error) {
            showErrorToast({
                message: "Unable to retrieve category list",
            });
        } finally {
            setLoading(false);
        }
    }, [mergeCategory]);

    useFocusEffect(
        useCallback(() => {
            if (categories.length + categoriesList.length > 7) {
                mergeCategory(categoriesList);
            }
        }, [categories, categoriesList, mergeCategory])
    );

    useEffect(() => {
        if (setupType === "G" && !categoriesList.length) {
            logEvent(FA_SELECT_ACTION, {
                [FA_SCREEN_NAME]: FA_TABUNG,
                [FA_TAB_NAME]: BOOSTERS,
                [FA_ACTION_NAME]: GUILTY_PLESURE,
            });
            getCategory();
        }
    }, [setupType, categoriesList, getCategory]);

    return (
        <ScreenContainer
            backgroundType="color"
            backgroundColor={MEDIUM_GREY}
            analyticScreenName={
                setupType === "G"
                    ? FA_TABUNG_TABUNGBOOSTER_GP_SELECTCATEGORY
                    : setupType === "S"
                    ? FA_TABUNG_TABUNGBOOSTER_SC_SELECTAMOUNT
                    : ""
            }
        >
            <>
                <ScreenLayout
                    paddingBottom={0}
                    paddingTop={24}
                    paddingHorizontal={0}
                    scrollable
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={handleBack} />}
                            headerCenterElement={
                                <Typo
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={19}
                                    text="Boosters"
                                />
                            }
                        />
                    }
                    useSafeArea
                >
                    <View style={styles.wrapper}>
                        <View style={styles.container}>
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={18}
                                text={getTitle()}
                                textAlign="left"
                            />
                            <Typo
                                fontSize={20}
                                fontWeight="300"
                                lineHeight={28}
                                style={styles.label}
                                text={getDescriptions()}
                                textAlign="left"
                            />
                            <TouchableOpacity
                                style={styles.learnMoreLink}
                                onPress={handleLearnMore}
                            >
                                <Typo
                                    color={ROYAL_BLUE}
                                    fontWeight="600"
                                    fontSize={14}
                                    lineHeight={18}
                                    textAlign="left"
                                    text="Learn More"
                                />
                            </TouchableOpacity>
                            {setupType === "S" ? (
                                <Dropdown
                                    title={selectedAmount}
                                    align="left"
                                    onPress={handleShowPicker}
                                />
                            ) : (
                                <View>
                                    <TouchableOpacity
                                        onPress={handleShowDetails}
                                        style={styles.showDetailsAction}
                                    >
                                        <Typo
                                            fontSize={14}
                                            fontWeight="normal"
                                            lineHeight={18}
                                            text="Select category"
                                            textAlign="left"
                                        />
                                        <View style={styles.showDetailsIcon}>
                                            <Image
                                                source={Images.info}
                                                style={styles.showDetailsIconImg}
                                            />
                                        </View>
                                    </TouchableOpacity>
                                    <View style={styles.categoryContainer}>
                                        {loading && (
                                            <View style={styles.categoryLoadingContainer}>
                                                <ActivityIndicator size="small" />
                                            </View>
                                        )}
                                        {!loading &&
                                            categoriesList.map((category) => (
                                                <CategoryThumb
                                                    key={category.btsId}
                                                    category={category}
                                                    onPress={handleGoToDailyLimitSetup}
                                                />
                                            ))}
                                    </View>
                                </View>
                            )}
                        </View>
                        {setupType === "S" && (
                            <View
                                style={[
                                    styles.actionFooter,
                                    safeArea.bottom > 0 && styles.actionFooterSafe,
                                ]}
                            >
                                <ActionButton
                                    fullWidth
                                    borderRadius={24}
                                    onPress={handleProceedSetup}
                                    backgroundColor={YELLOW}
                                    componentCenter={
                                        <Typo
                                            color={BLACK}
                                            text="Continue"
                                            fontSize={14}
                                            fontWeight="600"
                                            lineHeight={18}
                                        />
                                    }
                                />
                            </View>
                        )}
                    </View>
                </ScreenLayout>
                {setupType === "S" && (
                    <ScrollPickerView
                        showMenu={isPickerVisible}
                        list={amounts}
                        selectedIndex={selectedIndex}
                        onRightButtonPress={handleDone}
                        onLeftButtonPress={handleCancel}
                        rightButtonText="Done"
                        leftButtonText="Cancel"
                    />
                )}
                <Popup
                    visible={detailsVisible}
                    title="Category"
                    ContentComponent={customPopup}
                    onClose={handleCloseDetails}
                />
            </>
        </ScreenContainer>
    );
}

Setup.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

const styles = StyleSheet.create({
    actionFooter: {
        padding: 24,
    },
    actionFooterSafe: {
        paddingBottom: 0,
    },
    categoryContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        paddingVertical: 24,
        width: "100%",
    },
    categoryIcon: {
        backgroundColor: WHITE,
        borderRadius: 16,
        elevation: 12,
        marginBottom: 12,
        shadowColor: SHADOW,
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 1,
        shadowRadius: 15,
    },
    categoryIconImg: {
        height: 24,
        width: 24,
    },
    categoryIconInner: {
        alignItems: "center",
        borderColor: WHITE,
        borderRadius: 16,
        borderWidth: 2,
        height: 32,
        justifyContent: "center",
        width: 32,
    },
    categoryLoadingContainer: {
        alignItems: "center",
        flex: 1,
        justifyContent: "center",
        padding: 36,
    },
    categoryThumb: {
        alignItems: "center",
        justifyContent: "flex-start",
        marginBottom: 24,
        // paddingHorizontal: 10,
    },
    container: {
        flex: 1,
        paddingHorizontal: 36,
    },
    label: {
        paddingBottom: 20,
        paddingTop: 8,
    },
    learnMoreLink: {
        marginBottom: 20,
    },
    popupCopy: {
        marginBottom: 16,
    },
    popupDetails: {
        maxHeight: 580,
        paddingHorizontal: 24,
        paddingVertical: 40,
    },
    popupRow: { flexDirection: "row", marginBottom: 16 },
    popupTitle: {
        marginBottom: 24,
    },
    popupTopLine: { flexDirection: "row", flexWrap: "wrap", marginBottom: 16 },
    showDetailsAction: {
        alignItems: "center",
        flexDirection: "row",
    },
    showDetailsIcon: {
        marginLeft: 4,
    },
    showDetailsIconImg: {
        height: 16,
        width: 16,
    },
    wrapper: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-between",
    },
});

export default Setup;
