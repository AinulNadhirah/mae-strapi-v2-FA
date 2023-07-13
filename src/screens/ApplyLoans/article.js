import numeral from "numeral";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import {
    View,
    StyleSheet,
    Animated,
    TouchableOpacity,
    Image,
    Keyboard,
    ScrollView,
    Platform,
} from "react-native";
import * as Animatable from "react-native-animatable";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSelector, useDispatch } from "react-redux";

import { addCommas, removeCommas } from "@screens/PLSTP/PLSTPController";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import { ScrollPickerView } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Dropdown from "@components/FormComponents/Dropdown";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import TextInputWithReturnType from "@components/TextInputWithReturnType";

import { logEvent } from "@services/analytics";

import { POTENTIAL_EARNING_CLEAR } from "@redux/actions/services/calculatePotentialEarningsAction";
import { getMasterData } from "@redux/services/ASBServices/apiMasterData";
import { calculatePotentialEarnings } from "@redux/services/apiCalculatePotentialEarnings";

import { YELLOW, BLACK, MEDIUM_GREY, WHITE, DISABLED, DISABLED_TEXT } from "@constants/colors";
import {
    ARTICLE,
    ARTICLE_COMPARE_EARNINGS,
    FA_ACTION_NAME,
    FA_FIELD_INFORMATION,
    FA_SCREEN_NAME,
    FA_SELECT_ACTION,
    FA_VIEW_SCREEN,
    MIN_RM_10K,
    MIN_RM_2L,
    DONE,
    CANCEL,
    COMPARE_EARNING,
    COMPARE_EARNING_HOW_MUCH_CAN,
    COMPARE_EARNING_ENTER_YOUR_TARGET,
    TOTAL_AMOUNT_RM,
    YEAR_OF_INVERSTMENT,
    INVERT_WITH,
    PLEASE_SELECT,
    POTENTIAL_EARNING,
    POTENTIAL_EARNING_RATE,
    CALCULATE,
    ASB_NOTE,
} from "@constants/strings";

import Assets from "@assets";

import InvertCard from "./InvertCard";

function ArticleScreen({ navigation }) {
    const dispatch = useDispatch();
    const [income, setIncome] = useState("");
    const [incomeValid, setIncomeValid] = useState(true);
    const [incomeErrorMsg, setIncomeErrorMsg] = useState("");
    const [yearOfInvest, setYearOfInvest] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [formValid, setFormValid] = useState(true);
    const [tenureList, setTenureList] = useState([]);
    const [isRecommended, setRecommended] = useState(null);
    const masterDataReducer = useSelector((state) => state.asbServicesReducer.masterDataReducer);
    const calculatePotentialEarningsReducer = useSelector(
        (state) => state.calculatePotentialEarningsReducer
    );
    const [keyboardShow, setKeyboardShow] = React.useState();
    this.bannerAnimate = new Animated.Value(0);

    const animateBanner = () => {
        return {
            opacity: this.bannerAnimate.interpolate({
                inputRange: [0, 120, 240],
                outputRange: [1, 0.8, 0],
            }),
            transform: [
                {
                    scale: this.bannerAnimate.interpolate({
                        inputRange: [-200, 0, 1],
                        outputRange: [1.4, 1, 1],
                    }),
                },
                {
                    translateY: this.bannerAnimate.interpolate({
                        inputRange: [-200, 0, 240],
                        outputRange: [0, 0, -100],
                    }),
                },
            ],
        };
    };

    useEffect(() => {
        init();
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: ARTICLE_COMPARE_EARNINGS,
        });
    }, []);

    const init = async () => {
        dispatch({ type: POTENTIAL_EARNING_CLEAR });
        dispatch(getMasterData());
        const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", () => {
            setKeyboardShow(true);
        });
        const keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", () => {
            setKeyboardShow(false);
        });

        return () => {
            keyboardDidHideListener.remove();
            keyboardDidShowListener.remove();
        };
    };

    function onIncomeChange(value) {
        const min = 10000;
        const max = 200000;
        let result = addCommas(value);
        let err = "";
        let isValid = false;
        if (removeCommas(value) < min) {
            err = MIN_RM_10K;
            isValid = false;
        } else if (max < removeCommas(value)) {
            err = MIN_RM_2L;
            isValid = false;
        } else {
            err = "";
            isValid = true;
            result = addCommas(Math.round(removeCommas(value) / 1000) * 1000);
        }
        setIncome(result);
        setIncomeValid(isValid);
        setIncomeErrorMsg(err);
        if (income && yearOfInvest && isValid === true) {
            setFormValid(false);
        } else {
            setFormValid(true);
        }
    }

    function onDropdownPress() {
        getYear();
        setShowDropdown(true);
    }

    function onPickerDone(item) {
        setShowDropdown(false);
        setYearOfInvest(item?.name);
        onPickerCancel();
        if (income && item?.name) {
            setFormValid(false);
        }
    }

    function onPickerCancel() {
        if (income && yearOfInvest) {
            setFormValid(false);
        }
        setShowDropdown(false);
    }

    function onBackTap() {
        navigation.goBack();
    }

    function onPinInfoPress() {
        setShowPopup(true);
    }
    function onPopupClose() {
        setShowPopup(false);
    }

    function InfoLabel() {
        return (
            <View style={styles.infoLabelContainerCls}>
                <Typo fontSize={14} lineHeight={18} textAlign="left" text={POTENTIAL_EARNING} />
                <TouchableOpacity onPress={onPinInfoPress}>
                    <Image style={styles.infoIcon} source={Assets.icInformation} />
                </TouchableOpacity>
            </View>
        );
    }

    function handleCalculate() {
        const totalAmount = removeCommas(income);
        const loanTenure = parseInt(yearOfInvest.replace("Years", ""));
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: ARTICLE_COMPARE_EARNINGS,
            [FA_ACTION_NAME]: "Calculate",
            [FA_FIELD_INFORMATION]: `amount: ${totalAmount}; invest_years: ${loanTenure}`,
        });
        const body = {
            msgBody: {
                loanAmount: parseInt(totalAmount),
                loanTenure,
            },
        };
        dispatch(
            calculatePotentialEarnings(body, (data) => {
                checkRecommended(data?.result);
            })
        );
    }

    const checkRecommended = (res) => {
        const rec = [];
        res?.map((val) => {
            rec.push(val.totalProfit);
        });
        var max = Math.max.apply(Math, rec);
        setRecommended(max);
    };

    const getYear = () => {
        let tenureList = masterDataReducer?.yearsOfInvestment[0]?.value;
        console.log("tenureList", tenureList);
        tenureList = tenureList.split(",");
        var arr = [];
        var len = tenureList.length;
        for (var i = 0; i < len; i++) {
            arr.push({
                name: tenureList[i] + " Years",
                value: tenureList[i],
            });
        }
        setTenureList(arr);
        console.log("getYear", arr);
    };
    const recardList = calculatePotentialEarningsReducer?.data?.result;
    const getRateOfDividend = calculatePotentialEarningsReducer?.data?.rateOfDividend;
    const getRateOfInterest = calculatePotentialEarningsReducer?.data?.rateOfInterest;
    const getTenure = calculatePotentialEarningsReducer?.data?.tenure;
    if (recardList) {
        recardList.sort((a, b) => {
            return b.totalProfit - a.totalProfit;
        });
    }

    function getYearIndex(value) {
        return tenureList.findIndex((obj) => obj.name === value);
    }
    console.log("[recardList]", JSON.stringify(calculatePotentialEarningsReducer));
    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <ScreenLayout
                header={
                    <HeaderLayout
                        headerCenterElement={
                            <Typo text={ARTICLE} fontWeight="600" fontSize={16} lineHeight={19} />
                        }
                        headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                    />
                }
                paddingHorizontal={0}
                paddingBottom={0}
                paddingTop={0}
                useSafeArea
            >
                <React.Fragment>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <KeyboardAwareScrollView
                            behavior={Platform.OS === "ios" ? "padding" : ""}
                            keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
                            enabled
                            scrollEnabled={true}
                            extraScrollHeight={Platform.OS === "ios" ? 50 : 0}
                        >
                            <Animated.View style={[styles.promotionImage, animateBanner()]}>
                                <Animatable.Image
                                    animation="fadeInUp"
                                    duration={300}
                                    source={Assets.articleLoan}
                                    style={styles.merchantBanner}
                                    resizeMode="cover"
                                />
                            </Animated.View>
                            <Animated.ScrollView
                                scrollEventThrottle={16}
                                onScroll={Animated.event(
                                    [
                                        {
                                            nativeEvent: {
                                                contentOffset: { y: this.bannerAnimate },
                                            },
                                        },
                                    ],
                                    { useNativeDriver: true }
                                )}
                                showsVerticalScrollIndicator={false}
                            >
                                <View style={styles.mainContent}>
                                    <View style={styles.contentArea}>
                                        <Typo
                                            fontSize={18}
                                            fontWeight="600"
                                            fontStyle="normal"
                                            lineHeight={25}
                                            textAlign="left"
                                            text={COMPARE_EARNING}
                                        />
                                        <Typo
                                            fontSize={14}
                                            lineHeight={20}
                                            fontWeight="400"
                                            letterSpacing={0}
                                            textAlign="left"
                                            text={COMPARE_EARNING_HOW_MUCH_CAN}
                                            style={styles.subTitle}
                                        />
                                        <Typo
                                            fontSize={14}
                                            lineHeight={20}
                                            fontWeight="400"
                                            letterSpacing={0}
                                            textAlign="left"
                                            text={COMPARE_EARNING_ENTER_YOUR_TARGET}
                                        />
                                        <Typo
                                            fontSize={14}
                                            lineHeight={20}
                                            fontWeight="400"
                                            letterSpacing={0}
                                            textAlign="left"
                                            style={styles.subTitle}
                                            text={ASB_NOTE}
                                        />
                                    </View>
                                    <View style={styles.calculateArea}>
                                        <View style={styles.fields}>
                                            <Typo
                                                fontSize={14}
                                                lineHeight={18}
                                                fontWeight="400"
                                                letterSpacing={0}
                                                textAlign="left"
                                                text={TOTAL_AMOUNT_RM}
                                            />

                                            <TextInputWithReturnType
                                                errorMessage={incomeErrorMsg}
                                                isValid={incomeValid}
                                                isValidate
                                                maxLength={keyboardShow ? 7 : 10}
                                                keyboardType="number-pad"
                                                placeholder="RM 0.00"
                                                onChangeText={onIncomeChange}
                                                value={
                                                    keyboardShow
                                                        ? income
                                                        : income
                                                        ? numeral(income).format(",0.00")
                                                        : ""
                                                }
                                                returnKeyType="done"
                                            />
                                        </View>
                                        <View style={styles.fields}>
                                            <Typo
                                                fontSize={14}
                                                lineHeight={18}
                                                fontWeight="400"
                                                letterSpacing={0}
                                                textAlign="left"
                                                text={YEAR_OF_INVERSTMENT}
                                                style={styles.dropdownTitle}
                                            />
                                            <Dropdown
                                                value={yearOfInvest ? yearOfInvest : PLEASE_SELECT}
                                                onPress={onDropdownPress}
                                            />
                                        </View>
                                        <View style={styles.bottomBtnContCls}>
                                            <ActionButton
                                                disabled={formValid}
                                                fullWidth
                                                onPress={handleCalculate}
                                                backgroundColor={formValid ? DISABLED : YELLOW}
                                                componentCenter={
                                                    <Typo
                                                        fontSize={14}
                                                        fontWeight="600"
                                                        lineHeight={18}
                                                        color={formValid ? DISABLED_TEXT : BLACK}
                                                        text={CALCULATE}
                                                    />
                                                }
                                            />
                                        </View>
                                    </View>
                                    <View style={styles.contentArea}>
                                        {calculatePotentialEarningsReducer?.data?.result && (
                                            <Typo
                                                fontSize={14}
                                                lineHeight={20}
                                                fontWeight="400"
                                                letterSpacing={0}
                                                textAlign="left"
                                                text={INVERT_WITH}
                                                style={styles.invertTitle}
                                            />
                                        )}
                                        <View>
                                            <InvertCard
                                                data={recardList}
                                                infoLabel={InfoLabel}
                                                navigate={navigation.navigate}
                                                isRecommended={isRecommended}
                                                tenure={getTenure}
                                                rateOfDividend={
                                                    getRateOfDividend ? getRateOfDividend : ""
                                                }
                                                rateOfInterest={
                                                    getRateOfInterest ? getRateOfInterest : ""
                                                }
                                            />
                                        </View>
                                    </View>
                                </View>
                            </Animated.ScrollView>
                        </KeyboardAwareScrollView>
                    </ScrollView>
                </React.Fragment>
            </ScreenLayout>
            <ScrollPickerView
                showMenu={showDropdown}
                list={tenureList}
                onRightButtonPress={onPickerDone}
                onLeftButtonPress={onPickerCancel}
                rightButtonText={DONE}
                leftButtonText={CANCEL}
                selectedIndex={yearOfInvest ? getYearIndex(yearOfInvest) : 0}
            />
            <Popup
                visible={showPopup}
                onClose={onPopupClose}
                title={POTENTIAL_EARNING}
                description={POTENTIAL_EARNING_RATE}
            />
        </ScreenContainer>
    );
}

ArticleScreen.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

const styles = StyleSheet.create({
    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        paddingTop: 12.5,
    },
    calculateArea: {
        backgroundColor: WHITE,
        marginTop: 25,
        paddingHorizontal: 30,
        paddingVertical: 25,
    },
    contentArea: {
        marginHorizontal: 30,
        paddingTop: 25,
    },
    dropdownTitle: {
        paddingBottom: 15,
    },
    fields: {
        paddingVertical: 12.5,
    },
    infoIcon: {
        height: 16,
        marginLeft: 10,
        width: 16,
    },
    infoLabelContainerCls: {
        alignItems: "center",
        flexDirection: "row",
        paddingVertical: 2,
    },
    invertTitle: {
        paddingBottom: 20,
        paddingTop: 20,
    },
    mainContent: {
        backgroundColor: MEDIUM_GREY,
        marginTop: 240,
    },
    merchantBanner: { flex: 1, height: "100%", width: "100%" },

    promotionImage: {
        height: 240,
        position: "absolute",
        width: "100%",
    },

    subTitle: {
        paddingVertical: 20,
    },
});

export default ArticleScreen;
