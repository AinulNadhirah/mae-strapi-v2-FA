import { useFocusEffect } from "@react-navigation/native";
import _ from "lodash";
import numeral from "numeral";
import PropTypes from "prop-types";
import React, { useState, useCallback, useEffect, useRef } from "react";
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    ActivityIndicator,
} from "react-native";
import Config from "react-native-config";
import SwitchToggle from "react-native-switch-toggle";

import {
    GOALS_MODULE,
    CREATE_GOALS_SELECT_GOAL_TYPE,
    PROMO_DETAILS,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import { showSuccessToast, showErrorToast } from "@components/Toast";

import { withModelContext } from "@context";

import {
    setUpdateBooster,
    getBoosterDetailsById,
    getBoosterGoalById,
    goalBoosterOn,
    goalBoosterOff,
} from "@services";
import { logEvent } from "@services/analytics";

import {
    MEDIUM_GREY,
    BLACK,
    YELLOW,
    ROYAL_BLUE,
    SHADOW_LIGHT,
    WHITE,
    FADE_GREY,
    DISABLED,
    DISABLED_TEXT,
    SHADOW,
    LIGHT_GREY,
    SWITCH_GREY,
    WHITE_SAND,
    SWITCH_GREEN,
} from "@constants/colors";
import {
    CURRENCY,
    NEAREST_ONE,
    NEAREST_FIVE,
    NEAREST_TEN,
    FA_FORM_COMPLETE,
    FA_TABUNG_TABUNGBOOSTER_GP_REMOVECATEGORY_SUCCESSFUL,
    FA_TABUNG_TABUNGBOOSTER_GP_REMOVECATEGORY,
    FA_TABUNG_TABUNGBOOSTER_SC_ACTIVATED,
    FA_TABUNG_TABUNGBOOSTER_SS_ACTIVATED,
    FA_TABUNG_TABUNGBOOSTER_GP_ACTIVATED,
    FA_TABUNG_TABUNGBOOSTER_SC_REVIEWDETAILS,
    FA_TABUNG_TABUNGBOOSTER_SNS_REVIEWDETAILS,
    FA_TABUNG_TABUNGBOOSTER_GP_REVIEWDETAILS,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    FA_SELECT_ACTION,
    FA_ACTION_NAME,
    FA_TABUNG,
    FA_TAB_NAME,
    BOOSTERS,
} from "@constants/strings";

import { showGoalDowntimeError } from "@utils";

import Images from "@assets";

import TransactionsHistory from "./TransactionsHistory";

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

function GoalRow({ index, goal, onPress }) {
    function handleOnPress() {
        onPress(index);
    }

    return (
        <TouchableOpacity activeOpacity={0.9} onPress={handleOnPress} style={styles.goalItem}>
            <View style={styles.goalItemMeta}>
                <View style={styles.goalIndex}>
                    <Typo fontSize={15} fontWeight="600" lineHeight={20} text={`${index + 1}`} />
                </View>
                <View style={styles.goalNameContainer}>
                    <Typo
                        fontSize={15}
                        fontWeight="600"
                        lineHeight={20}
                        text={goal.goalName}
                        textAlign="left"
                        style={styles.goalName}
                    />
                    <Typo
                        fontSize={14}
                        fontWeight="normal"
                        lineHeight={18}
                        text={`RM ${goal.formattedAmount}`}
                        textAlign="left"
                    />
                </View>
            </View>
            <View>
                <SwitchToggle
                    containerStyle={styles.settingItemChildSwitchContainer}
                    circleStyle={styles.settingItemChildSwitchCircle}
                    switchOn={goal.active}
                    onPress={handleOnPress}
                    backgroundColorOn={SWITCH_GREEN}
                    backgroundColorOff={SWITCH_GREY}
                    circleColorOff={WHITE}
                    circleColorOn={WHITE}
                    duration={200}
                />
            </View>
        </TouchableOpacity>
    );
}

GoalRow.propTypes = {
    index: PropTypes.number,
    goal: PropTypes.object,
    onPress: PropTypes.func,
};

function CategoryRow({
    index,
    category,
    handelEditDailyLimit,
    handelEditFundAmount,
    handleDeleteCategory,
}) {
    function handlePressEditDaily() {
        handelEditDailyLimit(index);
    }

    function handlePressEditFund() {
        handelEditFundAmount(index);
    }

    function handlePressDelete() {
        handleDeleteCategory(category.btsId);
    }

    return (
        <View>
            <View style={[styles.categoryContainer, index > 0 && styles.categoryBordered]}>
                <View style={styles.categoryMeta}>
                    <View style={styles.categoryMetaInner}>
                        <View style={styles.categoryIcon}>
                            <View
                                style={[
                                    styles.categoryIconInner,
                                    {
                                        backgroundColor: category.colorCode,
                                    },
                                ]}
                            >
                                <Image
                                    source={{ uri: category.image }}
                                    style={styles.categoryIconImage}
                                />
                            </View>
                        </View>
                        <Typo
                            fontSize={14}
                            fontWeight="600"
                            lineHeight={18}
                            text={category.name}
                            textAlign="left"
                        />
                    </View>
                    <View>
                        <TouchableOpacity onPress={handlePressDelete} style={styles.categoryDelete}>
                            <Image
                                source={Images.icTrashCanBlack}
                                style={styles.categoryDeleteImg}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.categoryBoosterMeta}>
                    <View style={styles.halfFlex}>
                        <Typo
                            fontSize={14}
                            fontWeight="normal"
                            lineHeight={18}
                            text="Set daily limit"
                            textAlign="left"
                        />
                    </View>
                    <View style={styles.halfFlex}>
                        <TouchableOpacity onPress={handlePressEditDaily}>
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={28}
                                text={`RM ${numeral(category.dailyLimit).format("0,0.00")}`}
                                textAlign="right"
                                color={ROYAL_BLUE}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.categoryBoosterMetaFund}>
                    <View style={styles.halfFlex}>
                        <Typo
                            fontSize={14}
                            fontWeight="normal"
                            lineHeight={18}
                            text="Fund amount"
                            textAlign="left"
                        />
                    </View>
                    <View style={styles.halfFlex}>
                        <TouchableOpacity onPress={handlePressEditFund}>
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={28}
                                text={`RM ${numeral(category.fundAmount).format("0,0.00")}`}
                                textAlign="right"
                                color={ROYAL_BLUE}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
}

CategoryRow.propTypes = {
    category: PropTypes.object,
    index: PropTypes.number,
    handelEditDailyLimit: PropTypes.func,
    handelEditFundAmount: PropTypes.func,
    handleDeleteCategory: PropTypes.func,
};

function Summary({ navigation, route, getModel }) {
    const [loading, setLoading] = useState(false);
    const [loadingBooster, setLoadingBooster] = useState(false);
    const [loadingGoals, setLoadingGoals] = useState(false);
    const [popup, setPopup] = useState({
        visible: false,
    });
    const [goals, setGoals] = useState([]);
    const [initialActiveGoals, setActiveGoals] = useState([]);
    const [initialInactiveGoals, setInactiveGoals] = useState([]);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const [transactionHistoryVisible, setTxnHistory] = useState(false);
    const [haveChanges, setHaveChanges] = useState(false);
    const [initialAmount] = useState(route?.params?.message ?? null);
    const [categories, setCategories] = useState(route?.params?.categories ?? []);
    const timer = useRef(null);
    const categoryChanged = useRef(false);
    const boosterType = route?.params?.boosterType;

    // spare change stuff
    const amount = route?.params?.amount;
    const message = route?.params?.message;

    // whether manage or setup
    const isActive = route?.params?.active;
    const boosterId = route?.params?.boosterId;

    const checkForChanges = useCallback(() => {
        const activeGoals = goals.filter((goal) => goal.active).map((goal) => goal.goalId);
        const inactiveGoals = goals.filter((goal) => !goal.active).map((goal) => goal.goalId);
        const newActive = _.difference(activeGoals, initialActiveGoals);
        const newInactive = _.difference(inactiveGoals, initialInactiveGoals);

        if (
            newActive.length ||
            newInactive.length ||
            (boosterType === "S" && initialAmount !== message) ||
            categoryChanged.current
        ) {
            setHaveChanges(true);
        } else {
            setHaveChanges(false);
        }
    }, [goals, initialActiveGoals, initialInactiveGoals, boosterType, initialAmount, message]);

    function getTitle() {
        if (boosterType === "S") return "Spare Change";
        if (boosterType === "Q") return "Scan & Save";
        return "Guilty Pleasure";
    }

    function getBoosterLabel() {
        if (boosterType === "S" || boosterType === "G") return "Booster summary:";
        if (boosterType === "Q") {
            return "Channel savings from promos so your Tabung can grow even faster.";
        }
    }

    const toggleOnGoal = useCallback(() => {
        const goalIds = goals.filter((goal) => goal.active).map((goal) => goal.goalId);
        const params = {
            boosterId,
            goalIds,
        };

        if (goalIds.length) return goalBoosterOn(params);
        return true;
    }, [boosterId, goals]);

    const toggleOffGoal = useCallback(() => {
        const goalIds = goals.filter((goal) => !goal.active).map((goal) => goal.goalId);
        const params = {
            boosterId,
            goalIds,
        };

        if (goalIds.length) return goalBoosterOff(params);
        return true;
    }, [boosterId, goals]);

    const updateBoosterGoal = async (cat) => {
        setLoading(true);

        try {
            const toggleOn = await toggleOnGoal(); // toggleOn could be true or API return payload
            const toggleOff = await toggleOffGoal();

            if (toggleOn && toggleOff) {
                // proceed saving the booster
                saveBooster(true, null, cat, toggleOn?.data?.s2w);
            } else {
                throw new Error();
            }
        } catch (error) {
            setLoading(false);
        }
    };

    const getApiPath = useCallback(() => {
        if (boosterType === "S") return "/booster-detail/spare-change";
        if (boosterType === "Q") return "/booster-detail/qrpay-savers";

        return "/booster-detail/guilty-pleasure";
    }, [boosterType]);

    const getApiParams = useCallback(
        (idToDelete, categoriesParams) => {
            let categoriesMap = [];
            const selectedGoals = goals.filter((goal) => goal.active).map((goal) => goal.goalId);

            if (boosterType === "S") {
                return {
                    spareChange: message,
                    goalIds: selectedGoals,
                };
            }

            if (boosterType === "Q") {
                return {
                    qrpaySaverPercent: 0,
                    goalIds: selectedGoals,
                };
            }

            // weird, categories state doesn't seems picked up as "changed"
            if (idToDelete) {
                const removedCategory = categories.filter((c) => idToDelete !== c.btsId);

                categoriesMap = removedCategory.map((cat) => ({
                    categoryId: cat.btsId,
                    guiltyPleasureFund: cat.fundAmount,
                    guiltyPleasureTxLimit: cat.dailyLimit,
                    colourCode: cat.colorCode,
                    categoryImagePath: cat.image,
                    categoryName: cat.name,
                }));
            } else {
                categoriesMap = categoriesParams.map((cat) => ({
                    categoryId: cat.btsId,
                    guiltyPleasureFund: cat.fundAmount,
                    guiltyPleasureTxLimit: cat.dailyLimit,
                    colourCode: cat.colorCode,
                    categoryImagePath: cat.image,
                    categoryName: cat.name,
                }));
            }

            return {
                gpBoosterDetailCategories: categoriesMap,
                goalIds: selectedGoals,
            };
        },
        [boosterType, categories, message, goals]
    );

    const updateBooster = useCallback(
        (idToDelete = null, categories = []) => {
            const path = getApiPath();
            const params = getApiParams(idToDelete, categories);

            setLoading(true);

            return setUpdateBooster(path, params);
        },
        [getApiParams, getApiPath]
    );

    function handelEditAmount() {
        const selectedIndex = amounts.findIndex((amount) => amount.message === message);

        navigation.navigate("BoosterSetup", {
            ...route?.params,
            selectedIndex,
        });
    }

    function handleClosePopup() {
        setPopup({
            visible: false,
        });
    }

    const backToDashboard = useCallback(
        (isRefresh) => {
            handleClosePopup();

            // we need where to go and it should be in stack
            navigation.navigate("Dashboard", {
                screen: "TabungTab",
                params: {
                    refresh: isRefresh,
                },
            });
        },
        [navigation]
    );

    const handleClose = useCallback(
        (isRefresh) => {
            if (isActive && haveChanges) {
                setPopup({
                    visible: true,
                    title: "Unsaved Changes",
                    description:
                        "Are you sure you want to to leave this page? Any unsaved changes will be discarded.",
                    onClose: handleClosePopup,
                    primaryAction: {
                        text: "Discard",
                        onPress: backToDashboard,
                    },
                    secondaryAction: {
                        text: "Cancel",
                        onPress: handleClosePopup,
                    },
                });
            } else {
                backToDashboard(isRefresh);
            }
        },
        [backToDashboard, isActive, haveChanges]
    );

    function handleRemoveSelectedCategory(id) {
        setCategoryToDelete(id);
        setHaveChanges(true);
        handleClosePopup();
    }

    function handelEditDailyLimit(index) {
        navigation.navigate("BoosterDailyLimit", {
            ...route?.params,
            categories,
            isEdit: true,
            categoryIndex: index,
        });
    }

    function handelEditFundAmount(index) {
        navigation.navigate("BoosterFundAmount", {
            ...route?.params,
            categories,
            isEdit: true,
            categoryIndex: index,
        });
    }

    function handleDeleteCategory(id) {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_TABUNG_TABUNGBOOSTER_GP_REMOVECATEGORY,
        });

        setPopup({
            visible: true,
            title: "Remove Category",
            description: "Are you sure you want to remove the category from your Booster?",
            onClose: handleClosePopup,
            primaryAction: {
                text: "Remove",
                onPress: () => handleRemoveSelectedCategory(id),
            },
            secondaryAction: {
                text: "Cancel",
                onPress: handleClosePopup,
            },
        });
    }

    function handleAddCategory() {
        const paramCategories = route?.params?.categories?.length
            ? [...route?.params?.categories]
            : [];

        navigation.navigate("BoosterSetup", {
            ...route?.params,
            categories: [...categories, ...paramCategories],
        });
    }

    function handleOnToggleGoal(index) {
        const updatedGoals = goals.map((goal, idx) => ({
            ...goal,
            active: idx === index ? !goal.active : goal.active,
        }));

        setGoals(updatedGoals);
        setHaveChanges(true);
    }

    function handleCloseTransactionHistory() {
        setTxnHistory(false);
    }

    function handleViewTransactions() {
        // show transactions
        setTxnHistory(true);
    }

    const goToCreateTabung = useCallback(() => {
        navigation.replace(GOALS_MODULE, {
            screen: CREATE_GOALS_SELECT_GOAL_TYPE,
        });
    }, [navigation]);

    function getArticleId() {
        if (boosterType === "S") {
            return Config.BOOSTER_SC_ARTICLE_ID;
        }

        if (boosterType === "Q") {
            return Config.BOOSTER_Q_ARTICLE_ID;
        }

        if (boosterType === "G") {
            return Config.BOOSTER_GP_ARTICLE_ID;
        }
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

    const checkForEarnedChances = useCallback(
        (s2w) => {
            timer.current && clearTimeout(timer.current);

            timer.current = setTimeout(() => {
                const {
                    misc: { isCampaignPeriod, isTapTasticReady, tapTasticType },
                    s2w: { txnTypeList },
                } = getModel(["misc", "s2w"]);

                if (s2w) {
                    const { txnType, displayPopup, chance } = s2w;
                    if (
                        (isCampaignPeriod || isTapTasticReady) &&
                        txnTypeList.includes(txnType) &&
                        displayPopup
                    ) {
                        navigation.push("TabNavigator", {
                            screen: "CampaignChancesEarned",
                            params: {
                                chances: chance,
                                isTapTasticReady,
                                tapTasticType,
                            },
                        });
                    }
                }
            }, 400);
        },
        [navigation, getModel]
    );

    const handleCreateTabung = useCallback(async () => {
        // check Tabung downtime status and show popup if downtime
        const isDownTime = await showGoalDowntimeError();
        if (!isDownTime) {
            // activate/update the booster and go to create tabung
            if ((isActive && haveChanges) || !isActive) {
                try {
                    const response = await updateBooster();

                    if (response && response.data) {
                        setHaveChanges(false);

                        // go to create tabung
                        goToCreateTabung();
                    }
                } catch (error) {
                    showErrorToast({
                        message:
                            "Your request could not be processed at this time. Please try again later.",
                    });
                } finally {
                    setLoading(false);
                }
            } else {
                goToCreateTabung();
            }
        }
    }, [updateBooster, goToCreateTabung, haveChanges, isActive]);

    const saveBooster = useCallback(
        async (goBackWhenFinish = true, idToDelete, cat, s2w) => {
            // activate/update the booster and back to tabung dashboard
            try {
                const response = await updateBooster(idToDelete, cat);

                if (response && response.data) {
                    // back to tabung
                    showSuccessToast({
                        message: idToDelete
                            ? "You've successfully removed the category from this Booster"
                            : "Changes saved",
                    });

                    if (goBackWhenFinish) backToDashboard(true);

                    // check for chances earned, we do not know if this is an adding or removing
                    // of goal from a booster, so we will only check since backend will know about it
                    checkForEarnedChances(s2w);

                    if (idToDelete) {
                        // remove the category from local list and submit
                        const removedCategory = categories.filter((c) => idToDelete !== c.btsId);

                        // set locally for the show. lol.
                        setCategories(removedCategory);

                        logEvent(FA_FORM_COMPLETE, {
                            [FA_SCREEN_NAME]: FA_TABUNG_TABUNGBOOSTER_GP_REMOVECATEGORY_SUCCESSFUL,
                        });
                    } else {
                        logEvent(FA_FORM_COMPLETE, {
                            [FA_SCREEN_NAME]:
                                boosterType === "S"
                                    ? FA_TABUNG_TABUNGBOOSTER_SC_ACTIVATED
                                    : boosterType === "Q"
                                    ? FA_TABUNG_TABUNGBOOSTER_SS_ACTIVATED
                                    : boosterType === "G"
                                    ? FA_TABUNG_TABUNGBOOSTER_GP_ACTIVATED
                                    : "",
                        });
                    }
                }
            } catch (error) {
                showErrorToast({
                    message:
                        "Your request could not be processed at this time. Please try again later.",
                });
            } finally {
                setLoading(false);
            }
        },
        [updateBooster, backToDashboard, categories, checkForEarnedChances]
    );

    const handleProceedSetup = useCallback(
        async (goBackWhenFinish = true, idToDelete = null) => {
            // activate/update the booster and back to tabung dashboard
            if (goBackWhenFinish && goals.length) {
                updateBoosterGoal(categories);
            } else {
                saveBooster(goBackWhenFinish, idToDelete, categories);
            }
        },
        [goals, saveBooster, updateBoosterGoal, categories]
    );

    function mapBoosterCategory(data) {
        return data.map((d) => {
            const { gpBoosterDetail } = d;

            return {
                btsId: gpBoosterDetail.categoryId,
                name: gpBoosterDetail.categoryName,
                colorCode: gpBoosterDetail.colourCode,
                image: gpBoosterDetail.categoryImagePath,
                dailyLimit: gpBoosterDetail.guiltyPleasureTxLimit,
                fundAmount: gpBoosterDetail.guiltyPleasureFund,
            };
        });
    }

    const getDetails = useCallback(async () => {
        setLoadingBooster(true);

        try {
            const response = await getBoosterDetailsById(boosterId);

            if (response && response.data) {
                const { resultList } = response.data;
                const transformedData = mapBoosterCategory(resultList);

                setCategories(transformedData);
            }
        } catch (error) {
            showErrorToast({
                message: "Unable to load booster details. Try again.",
            });
        } finally {
            setLoadingBooster(false);
        }
    }, [boosterId]);

    const getGoals = useCallback(async () => {
        setLoadingGoals(true);

        try {
            const response = await getBoosterGoalById(boosterId);

            if (response && response.data) {
                const { resultList } = response.data;
                const activeGoals = resultList
                    .filter((goal) => goal.active)
                    .map((goal) => goal.goalId);
                const inactiveGoals = resultList
                    .filter((goal) => !goal.active)
                    .map((goal) => goal.goalId);

                setGoals(resultList);
                setActiveGoals(activeGoals);
                setInactiveGoals(inactiveGoals);
            }
        } catch (error) {
            showErrorToast({
                message: "Unable to load booster's goals. Try again.",
            });
        } finally {
            setLoadingGoals(false);
        }
    }, [boosterId]);

    useFocusEffect(
        useCallback(() => {
            if (isActive) {
                checkForChanges();
            }
        }, [isActive, checkForChanges])
    );

    useEffect(() => {
        if (route?.params?.categories?.length) {
            setCategories(route?.params?.categories);
            categoryChanged.current = true;

            navigation.setParams({
                categories: [],
            });
        }
    }, [route?.params?.categories, navigation]);

    useEffect(() => {
        if (categoryToDelete && categories.length) {
            handleProceedSetup(false, categoryToDelete);
            setCategoryToDelete(null);
        }
    }, [categoryToDelete, categories, handleProceedSetup]);

    useEffect(() => {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_TABUNG,
            [FA_TAB_NAME]: BOOSTERS,
            [FA_ACTION_NAME]:
                boosterType === "S"
                    ? "Spare Change"
                    : boosterType === "Q"
                    ? "Scan & Save"
                    : boosterType === "G"
                    ? "Guilty Plesaure"
                    : "",
        });

        getGoals();

        return () => {
            timer.current && clearTimeout(timer.current);
        };
    }, [getGoals]);

    useEffect(() => {
        if (isActive && boosterType === "G") {
            getDetails();
        }
    }, [boosterType, getDetails, isActive]);

    return (
        <ScreenContainer
            backgroundType="color"
            backgroundColor={MEDIUM_GREY}
            analyticScreenName={
                boosterType === "S"
                    ? FA_TABUNG_TABUNGBOOSTER_SC_REVIEWDETAILS
                    : boosterType === "Q"
                    ? FA_TABUNG_TABUNGBOOSTER_SNS_REVIEWDETAILS
                    : boosterType === "G"
                    ? FA_TABUNG_TABUNGBOOSTER_GP_REVIEWDETAILS
                    : ""
            }
        >
            <>
                <ScreenLayout
                    paddingBottom={0}
                    paddingTop={24}
                    paddingHorizontal={0}
                    header={
                        <HeaderLayout
                            headerCenterElement={
                                <Typo
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={19}
                                    text="Boosters"
                                />
                            }
                            headerRightElement={<HeaderCloseButton onPress={handleClose} />}
                        />
                    }
                    useSafeArea
                >
                    <View style={styles.wrapper}>
                        <ScrollView contentContainerStyle={styles.scrollerContainer}>
                            <View style={styles.content}>
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
                                    text={getBoosterLabel()}
                                    textAlign="left"
                                />
                                {boosterType === "S"
? (
                                    <View style={styles.spareChangeContent}>
                                        <View style={styles.halfFlex}>
                                            <Typo
                                                fontSize={14}
                                                fontWeight="normal"
                                                lineHeight={18}
                                                text="Round up expenses to the nearest"
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
                                        </View>
                                        <View style={styles.halfFlex}>
                                            <TouchableOpacity onPress={handelEditAmount}>
                                                <Typo
                                                    fontSize={14}
                                                    fontWeight="600"
                                                    lineHeight={28}
                                                    text={amount}
                                                    textAlign="right"
                                                    color={ROYAL_BLUE}
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                )
: (
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
                                )}
                                {loadingBooster && (
                                    <View style={styles.boosterLoadingContainer}>
                                        <ActivityIndicator size="small" />
                                    </View>
                                )}
                                {boosterType === "G" &&
                                    !loadingBooster &&
                                    categories.map((category, index) => (
                                        <CategoryRow
                                            key={category.btsId}
                                            category={category}
                                            index={index}
                                            isActive={isActive}
                                            handelEditDailyLimit={handelEditDailyLimit}
                                            handelEditFundAmount={handelEditFundAmount}
                                            handleDeleteCategory={handleDeleteCategory}
                                        />
                                    ))}
                                {boosterType === "G" && categories.length < 7 && (
                                    <View style={styles.categoryAddContainer}>
                                        <ActionButton
                                            height={40}
                                            borderRadius={20}
                                            onPress={handleAddCategory}
                                            backgroundColor={WHITE}
                                            componentLeft={
                                                <Image
                                                    source={Images.ic_Plus}
                                                    style={styles.categoryAddIcon}
                                                />
                                            }
                                            componentCenter={
                                                <Typo
                                                    text="Add Category"
                                                    fontSize={14}
                                                    fontWeight="600"
                                                    lineHeight={14}
                                                    style={styles.categoryAddText}
                                                />
                                            }
                                            style={styles.categoryAddButton}
                                        />
                                    </View>
                                )}
                            </View>
                            <View style={styles.tabungContainer}>
                                <View style={styles.tabungContainerCard}>
                                    <Typo
                                        fontSize={16}
                                        fontWeight="600"
                                        lineHeight={18}
                                        text="Active Tabung"
                                        textAlign="left"
                                        style={styles.activeTabung}
                                    />
                                    {loadingGoals && (
                                        <View style={styles.boosterLoadingContainer}>
                                            <ActivityIndicator size="small" />
                                        </View>
                                    )}
                                    {!loadingGoals && !!goals.length
? (
                                        <>
                                            {goals.map((goal, index) => (
                                                <GoalRow
                                                    key={goal.goalId}
                                                    index={index}
                                                    goal={goal}
                                                    onPress={handleOnToggleGoal}
                                                />
                                            ))}

                                            <View style={styles.viewTxn}>
                                                <TouchableOpacity
                                                    activeOpacity={0.9}
                                                    onPress={handleViewTransactions}
                                                >
                                                    <Typo
                                                        fontSize={14}
                                                        fontWeight="600"
                                                        lineHeight={28}
                                                        text="View Transactions"
                                                        color={ROYAL_BLUE}
                                                    />
                                                </TouchableOpacity>
                                            </View>
                                        </>
                                    )
: (
                                        <>
                                            <Typo
                                                fontSize={14}
                                                fontWeight="normal"
                                                lineHeight={20}
                                                text="Want to start saving? Start a Tabung now and add a Booster to it."
                                                style={styles.tabungContainerCopy}
                                            />
                                            <TouchableOpacity onPress={handleCreateTabung}>
                                                <Typo
                                                    fontSize={14}
                                                    fontWeight="600"
                                                    lineHeight={28}
                                                    text="Create Tabung"
                                                    color={ROYAL_BLUE}
                                                />
                                            </TouchableOpacity>
                                        </>
                                    )}
                                </View>
                            </View>
                            <View style={styles.tabungContainerFootnote}>
                                <Typo
                                    fontSize={12}
                                    fontWeight="normal"
                                    lineHeight={18}
                                    text="You may only add a Booster to an active Tabung. If you have created two Tabung and added the same Booster to both, the amount will be distributed evenly."
                                    textAlign="left"
                                    color={FADE_GREY}
                                />
                            </View>
                        </ScrollView>
                        <FixedActionContainer>
                            <ActionButton
                                fullWidth
                                isLoading={loading}
                                disabled={isActive ? !haveChanges : false}
                                borderRadius={24}
                                onPress={handleProceedSetup}
                                backgroundColor={isActive && !haveChanges ? DISABLED : YELLOW}
                                componentCenter={
                                    <Typo
                                        color={isActive && !haveChanges ? DISABLED_TEXT : BLACK}
                                        text={isActive ? "Save Changes" : "Confirm"}
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={18}
                                    />
                                }
                            />
                        </FixedActionContainer>
                    </View>
                </ScreenLayout>
                <Popup {...popup} />
                <TransactionsHistory
                    visible={transactionHistoryVisible}
                    boosterType={boosterType}
                    onClose={handleCloseTransactionHistory}
                />
            </>
        </ScreenContainer>
    );
}

Summary.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
    getModel: PropTypes.func,
};

const styles = StyleSheet.create({
    activeTabung: {
        marginBottom: 14,
    },
    boosterLoadingContainer: {
        alignItems: "center",
        flex: 1,
        justifyContent: "center",
        padding: 36,
    },
    categoryAddButton: {
        alignItems: "center",
        borderColor: LIGHT_GREY,
        borderWidth: 1,
        paddingHorizontal: 24,
    },
    categoryAddContainer: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
        paddingVertical: 6,
    },
    categoryAddIcon: {
        height: 24,
        width: 24,
    },
    categoryAddText: {
        marginLeft: 2,
    },
    categoryBoosterMeta: {
        alignItems: "flex-start",
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    categoryBoosterMetaFund: {
        alignItems: "flex-start",
        flexDirection: "row",
        justifyContent: "space-between",
    },
    categoryBordered: {
        borderTopColor: SWITCH_GREY,
        borderTopWidth: 1,
    },
    categoryContainer: {
        paddingVertical: 24,
    },
    categoryDelete: { height: 24, width: 24 },
    categoryDeleteImg: {
        height: 20,
        width: 19,
    },
    categoryIcon: {
        backgroundColor: WHITE,
        borderRadius: 16,
        elevation: 12,
        marginRight: 8,
        shadowColor: SHADOW,
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 1,
        shadowRadius: 15,
    },
    categoryIconImage: {
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
    categoryMeta: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    categoryMetaInner: { alignItems: "center", flexDirection: "row" },
    content: {
        paddingHorizontal: 36,
    },
    goalIndex: {
        alignItems: "center",
        backgroundColor: WHITE_SAND,
        borderRadius: 15,
        height: 30,
        justifyContent: "center",
        width: 30,
    },
    goalItem: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 10,
    },
    goalItemMeta: {
        alignItems: "center",
        flexDirection: "row",
    },
    goalName: {
        marginBottom: 4,
    },
    goalNameContainer: {
        marginLeft: 12,
    },
    halfFlex: { flex: 0.5 },
    label: {
        paddingBottom: 20,
        paddingTop: 8,
    },
    learnMoreLink: {
        paddingVertical: 12,
    },
    scrollerContainer: {
        paddingBottom: 36,
    },
    settingItemChildSwitchCircle: {
        backgroundColor: WHITE,
        borderRadius: 10,
        height: 20,
        width: 20,
    },
    settingItemChildSwitchContainer: {
        backgroundColor: SWITCH_GREY,
        borderRadius: 20,
        height: 22,
        padding: 1,
        width: 40,
    },
    spareChangeContent: {
        alignItems: "flex-start",
        flexDirection: "row",
        justifyContent: "space-between",
    },
    tabungContainer: {
        paddingHorizontal: 24,
        paddingVertical: 18,
    },
    tabungContainerCard: {
        backgroundColor: WHITE,
        borderRadius: 8,
        elevation: 8,
        padding: 32,
        shadowColor: SHADOW_LIGHT,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 1,
        shadowRadius: 16,
    },
    tabungContainerCopy: {
        paddingBottom: 12,
        paddingTop: 24,
    },
    tabungContainerFootnote: {
        paddingHorizontal: 36,
    },
    viewTxn: { marginTop: 18 },
    wrapper: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-between",
    },
});

export default withModelContext(Summary);
