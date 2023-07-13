import moment from "moment";
import PropTypes from "prop-types";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { View, StyleSheet, Image, FlatList, ScrollView, Animated, Easing } from "react-native";
import Collapsible from "react-native-collapsible";
import { TouchableOpacity } from "react-native-gesture-handler";
import Modal from "react-native-modal";

import { BANKINGV2_MODULE, FINANCIAL_TRANSACTION_HISTORY } from "@navigation/navigationConstant";

import FundFactSheetURL from "@components/FinancialGoal/FundFactSheetURL";
import Browser from "@components/Specials/Browser";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { getGoalPerformance } from "@services";
import { logEvent } from "@services/analytics";

import { ROYAL_BLUE, RED, BLUER_GREEN, BLACK, WHITE, DARK_GREY } from "@constants/colors";
import {
    INVEST_DISCLAIMER_HALF,
    INVEST_DISCLAIMER_FULL,
    READ_MORE,
    READ_LESS,
    DISCLAIMERS,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    FA_TAB_NAME,
    FA_SELECT_ACTION,
    FA_ACTION_NAME,
} from "@constants/strings";

import { numberWithCommas } from "@utils/dataModel/utilityPartial.3";

import assets from "@assets";

import PerformanceGraph from "./PerformanceGraph";

const Performance = ({ navigation, goalId, investmentStartDt, overviewData }) => {
    const VIEW_TRANS_HISTORY = "View Transaction History";
    const FUND_ALLOCATION = "Fund Allocation";
    const graphLabelObject = [
        {
            title: "Total Portfolio Value",
            color: "#44D7B6",
            amount: overviewData?.totalPortfolioValue,
        },
        {
            title: "Total Deposit",
            color: "#337AB7",
            amount: overviewData?.netDeposit,
        },
        {
            title: "Total Return",
            amount: overviewData?.investmentReturn,
            percent: overviewData?.avgAnnualReturn,
        },
    ];

    const graphFilterOptions = [
        {
            FILTER_VAL: "ONE_MONTH",
            FILTER_DESC: "1 M",
        },
        {
            FILTER_VAL: "SIX_MONTHS",
            FILTER_DESC: "6 M",
        },
        {
            FILTER_VAL: "ONE_YEAR",
            FILTER_DESC: "1 Y",
        },
        {
            FILTER_VAL: "SINCE_START",
            FILTER_DESC: "Since start",
        },
    ];

    const [grahFilterIndex, setGraphFilterIndex] = useState(graphFilterOptions.length - 1);

    const [fundAllocationList, setFundAllocationList] = useState(null);
    const [readMore, setReadMore] = useState(false);
    const [graphPerformance, setGraphPerformance] = useState([]);
    const [selectedDuration, setSelectedDuration] = useState(
        graphFilterOptions?.[graphFilterOptions.length - 1]?.FILTER_DESC
    );
    const newInvestmentStartDateFormat = investmentStartDt?.split("-").join("/");
    const [isLoading, setIsLoading] = useState(false);

    const init = useCallback(async () => {
        try {
            setIsLoading(true);
            const performanceResponse = await getGoalPerformance(
                goalId,
                newInvestmentStartDateFormat,
                graphFilterOptions?.[grahFilterIndex]?.FILTER_VAL,
                false
            );

            if (performanceResponse?.data) {
                setIsLoading(false);
            }

            if (performanceResponse?.data?.gbiPerformanceTrackModel) {
                const performanceGraphResponse =
                    performanceResponse?.data?.gbiPerformanceTrackModel ?? null;
                setGraphPerformance(performanceGraphResponse);
            }

            if (performanceResponse?.data?.productInfoAndAllocationModel) {
                const fundAllocationResponse =
                    performanceResponse?.data?.productInfoAndAllocationModel ?? null;
                setFundAllocationList(fundAllocationResponse);
            }
        } catch (e) {
            setIsLoading(false);
            showErrorToast({
                message: e.message,
            });
        }
    }, [goalId, grahFilterIndex]);

    useEffect(() => {
        init();
    }, [init]);

    useEffect(() => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "FinancialGoals_View",
            [FA_TAB_NAME]: "Performance",
        });
    }, []);

    function renderPortfolioFundItem({ item }) {
        return (
            <FundInfoItem
                fundName={item?.prodName}
                fundAllocation={item?.allocation}
                fundType={item?.categoryName}
                factsheetUrl={item?.factSheet}
                prospectusUrl={item?.prospectus}
                highlightUrl={item?.highlight}
            />
        );
    }

    function onPressViewTransactionHistory() {
        const propData = {
            goalId,
            govCharge: overviewData?.govCharge,
        };
        navigation.navigate(BANKINGV2_MODULE, {
            screen: FINANCIAL_TRANSACTION_HISTORY,
            params: {
                data: propData,
            },
        });
    }

    function _onReadMoreCallBack() {
        setReadMore(true);
    }

    function _onReadLessCallBack() {
        setReadMore(false);
    }

    function keyExtractor(item, index) {
        return `${item}-${index}`;
    }

    function renderGraphLabel({ item }) {
        return (
            <GraphLabel
                title={item?.title}
                color={item?.color}
                amount={item?.amount}
                roiPercent={item?.percent}
            />
        );
    }

    const portfolioData = useCallback(() => {
        return graphPerformance?.map((item) => {
            return item?.totalPortfolioValue;
        });
    }, [graphPerformance])();

    const depositData = useCallback(() => {
        return graphPerformance?.map((item) => {
            return item?.netDeposit;
        });
    }, [graphPerformance])();

    const createdDate = useCallback(() => {
        const date = graphPerformance?.map((item) => {
            return item?.createdDate;
        });
        return date.map((item) => {
            return moment(item, "YYYY-MM-DD").format("DD MMM YYYY");
        });
    }, [graphPerformance])();

    function onPressGraphFilterButton(filterDesc, index) {
        setGraphFilterIndex(index);
        setSelectedDuration(filterDesc);

        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "FinancialGoals_View",
            [FA_TAB_NAME]: "Performance",
            [FA_ACTION_NAME]: filterDesc,
        });
    }

    const buttonSelectionGroup = (() => {
        return graphFilterOptions.map((item, index) => {
            return {
                text: item.FILTER_DESC,
                index,
                onPress: () => onPressGraphFilterButton(item.FILTER_DESC, index),
                isSelected: selectedDuration === item.FILTER_DESC,
            };
        });
    })();

    return (
        <ScrollView style={Styles.mainContainer}>
            <FlatList data={graphLabelObject} renderItem={renderGraphLabel} numColumns={2} />

            {/* graph */}
            <PerformanceGraph
                portfolioData={portfolioData}
                depositData={depositData}
                createdDate={createdDate}
                isLoading={isLoading}
            />
            {portfolioData.length > 0 && depositData.length > 0 && createdDate.length > 0 && (
                <FilterButtonGroup buttonSelection={buttonSelectionGroup} />
            )}

            <View style={Styles.paddingVertical20}>
                <TouchableOpacity onPress={onPressViewTransactionHistory}>
                    <Typo
                        text={VIEW_TRANS_HISTORY}
                        fontSize={14}
                        fontWeight="600"
                        lineHeight={24}
                        color={ROYAL_BLUE}
                        textAlign="center"
                    />
                </TouchableOpacity>
            </View>
            <View>
                <Typo
                    text={FUND_ALLOCATION}
                    lineHeight={24}
                    textAlign="left"
                    fontWeight="600"
                    fontSize={14}
                />
                <FlatList
                    data={fundAllocationList}
                    renderItem={renderPortfolioFundItem}
                    keyExtractor={keyExtractor}
                    ListFooterComponent={
                        <View style={Styles.padding20}>
                            <Disclaimer
                                readMore={readMore}
                                readMoreCallBack={_onReadMoreCallBack}
                                readLessCallBack={_onReadLessCallBack}
                            />
                        </View>
                    }
                />
            </View>
        </ScrollView>
    );
};

Performance.propTypes = {
    item: PropTypes.object,
    navigation: PropTypes.object,
    goalId: PropTypes.string,
    investmentStartDt: PropTypes.string,
    overviewData: PropTypes.object,
};

const GraphLabel = ({ title, color, amount, roiPercent = null }) => {
    return (
        <View style={Styles.graphLabelContainer}>
            <View style={Styles.graphLabelSubContainer}>
                <Typo fontSize={12} fontWeight="400" text={title} lineHeight={20} />
                {color && <View style={[Styles.graphLabelColor, { backgroundColor: color }]} />}
            </View>
            <View style={Styles.graphLabelSubContainer}>
                <Typo
                    fontSize={16}
                    fontWeight="600"
                    text={`${amount >= 0 ? "" : "-"} RM ${
                        amount ? numberWithCommas(Math.abs(amount.toFixed(2))) : 0
                    }`}
                    lineHeight={18}
                />
                {!isNaN(roiPercent) && roiPercent != null && (
                    <Typo
                        fontSize={12}
                        fontWeight="600"
                        color={roiPercent < 0 ? RED : BLUER_GREEN}
                        text={`${roiPercent < 0 ? "-" : "+"}${Math.abs(roiPercent)}%`}
                        style={Styles.graphLabelPercent}
                    />
                )}
            </View>
        </View>
    );
};

GraphLabel.propTypes = {
    title: PropTypes.string.isRequired,
    color: PropTypes.string,
    amount: PropTypes.string.isRequired,
    roiPercent: PropTypes.string,
};

const FilterButtonGroup = ({ buttonSelection }) => {
    function renderButtonSelection({ item }) {
        return (
            <TouchableOpacity
                style={
                    item?.isSelected ? Styles.filterButtonSelected : Styles.filterButtonNotSelected
                }
                onPress={item?.onPress}
            >
                <Typo
                    text={item?.text}
                    fontSize={14}
                    fontWeight="600"
                    color={item?.isSelected ? WHITE : DARK_GREY}
                />
            </TouchableOpacity>
        );
    }
    renderButtonSelection.propTypes = {
        item: PropTypes.object,
    };

    function keyExtractor(item, index) {
        return `${item}-${index}`;
    }
    return (
        <FlatList
            horizontal
            data={buttonSelection}
            renderItem={renderButtonSelection}
            keyExtractor={keyExtractor}
            showsHorizontalScrollIndicator={false}
        />
    );
};

FilterButtonGroup.propTypes = {
    buttonSelection: PropTypes.arrayOf(
        PropTypes.exact({
            text: PropTypes.string,
            onPress: PropTypes.func,
            isSelected: PropTypes.func,
        })
    ),
};

const Disclaimer = ({ readMore, readMoreCallBack, readLessCallBack }) => {
    return (
        <View style={Styles.disclaimerContainer}>
            <Typo
                text={DISCLAIMERS}
                fontSize={14}
                fontWeight="600"
                lineHeight={28}
                textAlign="left"
            />
            {!readMore && (
                <Typo
                    fontSize={12}
                    fontWeight="300"
                    textAlign="left"
                    lineHeight={18}
                    style={Styles.paddingBtm15}
                >
                    {INVEST_DISCLAIMER_HALF}
                    <TouchableOpacity onPress={readMoreCallBack}>
                        <Typo
                            text={" " + READ_MORE}
                            fontSize={12}
                            fontWeight="300"
                            textAlign="left"
                            style={Styles.readMore}
                        />
                    </TouchableOpacity>
                </Typo>
            )}
            {readMore && (
                <Typo
                    fontSize={12}
                    fontWeight="300"
                    textAlign="left"
                    lineHeight={18}
                    style={Styles.paddingBtm15}
                >
                    {INVEST_DISCLAIMER_FULL}
                    <TouchableOpacity onPress={readLessCallBack}>
                        <Typo
                            text={" " + READ_LESS}
                            fontSize={12}
                            fontWeight="300"
                            textAlign="left"
                            style={Styles.readMore}
                        />
                    </TouchableOpacity>
                </Typo>
            )}
        </View>
    );
};

Disclaimer.propTypes = {
    readMore: PropTypes.bool,
    readMoreCallBack: PropTypes.func,
    readLessCallBack: PropTypes.func,
};

const FundInfoItem = ({
    fundName,
    fundAllocation,
    fundType,
    factsheetUrl,
    prospectusUrl,
    highlightUrl,
}) => {
    const [isViewMore, setIsViewMore] = useState(false);
    const animatedHeight = useRef(new Animated.Value(0)).current;
    const PRODUCT_HIGHLIGHT_SHEET = "Product Highlight sheet";
    const PROSPECTUS = "Prospectus";
    const FACTSHEET = "Factsheet";
    const ALLOCATION = "Allocation";
    const FUND_TYPE = "Fund Type";
    function onPressViewMore() {
        setIsViewMore(!isViewMore);
        Animated.timing(animatedHeight, {
            duration: 500,
            toValue: isViewMore ? 0 : 1,
            useNativeDriver: true,
            easing: Easing.linear,
        }).start();
    }

    const factSheet = [
        {
            title: PROSPECTUS,
            url: prospectusUrl,
        },
        {
            title: PRODUCT_HIGHLIGHT_SHEET,
            url: highlightUrl,
        },
        {
            title: FACTSHEET,
            url: factsheetUrl,
        },
    ];

    const cleanUpFactSheet = (() => {
        return factSheet.filter((item) => item?.url !== null);
    })();

    function renderFactSheet({ item }) {
        return <FundFactSheetURL title={item?.title} url={item?.url} />;
    }

    function keyExtractor(item, index) {
        return `${item}-${index}`;
    }

    return (
        <View style={Styles.showFundInfo}>
            <TouchableOpacity onPress={onPressViewMore}>
                <View style={Styles.outerContainer}>
                    <View style={Styles.fundDropdown}>
                        <Typo
                            fontSize={14}
                            lineHeight={17}
                            fontWeight="400"
                            textAlign="left"
                            text={fundName}
                            numberOfLines={isViewMore ? 0 : 2}
                        />
                    </View>
                    {isViewMore && (
                        <View style={Styles.dropDownImgContainer}>
                            <Image style={Styles.dropUpIcon} source={assets.dropUpIcon} />
                        </View>
                    )}
                    {!isViewMore && (
                        <View style={Styles.dropDownImgContainer}>
                            <Image style={Styles.dropDownIcon} source={assets.downArrow} />
                        </View>
                    )}
                </View>
            </TouchableOpacity>
            <Animated.View
                // eslint-disable-next-line react-native/no-inline-styles
                style={{
                    overflow: "hidden",
                    opacity: animatedHeight,
                }}
            >
                <Collapsible collapsed={!isViewMore} duration={50} easing={Easing.linear}>
                    <View style={Styles.fundListOuterContainer}>
                        <View style={Styles.width30}>
                            <Typo
                                fontSize={10}
                                lineHeight={17}
                                fontWeight="400"
                                textAlign="left"
                                text={ALLOCATION}
                            />
                            <Typo
                                fontSize={14}
                                lineHeight={17}
                                fontWeight="600"
                                textAlign="left"
                                text={`${fundAllocation}%`}
                            />
                        </View>
                        <View style={Styles.width60}>
                            <Typo
                                fontSize={10}
                                lineHeight={17}
                                textAlign="left"
                                fontWeight="400"
                                text={FUND_TYPE}
                            />
                            <Typo
                                fontSize={14}
                                lineHeight={17}
                                fontWeight="600"
                                textAlign="left"
                                text={fundType}
                            />
                        </View>
                    </View>
                    <FlatList
                        data={cleanUpFactSheet}
                        renderItem={renderFactSheet}
                        keyExtractor={keyExtractor}
                    />
                </Collapsible>
            </Animated.View>
        </View>
    );
};

FundInfoItem.propTypes = {
    fundName: PropTypes.string,
    fundAllocation: PropTypes.string,
    fundType: PropTypes.string,
    factsheetUrl: PropTypes.string,
    prospectusUrl: PropTypes.string,
    highlightUrl: PropTypes.string,
    item: PropTypes.object,
};

const Styles = StyleSheet.create({
    disclaimerContainer: {
        paddingBottom: 30,
        paddingTop: 30,
    },
    dropDownIcon: {
        height: 14,
        marginLeft: 10,
        top: 0,
        width: 14,
    },
    dropDownImgContainer: {
        width: "10%",
    },
    dropUpIcon: {
        height: 14,
        marginLeft: 10,
        top: 4,
        width: 14,
    },
    filterButtonNotSelected: {
        backgroundColor: WHITE,
        borderRadius: 16,
        marginRight: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    filterButtonSelected: {
        backgroundColor: BLACK,
        borderRadius: 16,
        marginRight: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    fundDropdown: {
        width: "90%",
    },
    fundListOuterContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingTop: 10,
    },
    graphLabelColor: {
        alignSelf: "center",
        height: 4,
        marginLeft: 5,
        width: 15,
    },
    graphLabelContainer: {
        flex: 1,
        paddingVertical: 8,
    },
    graphLabelPercent: {
        alignSelf: "flex-end",
        marginBottom: 2,
        marginLeft: 6,
    },
    graphLabelSubContainer: {
        flexDirection: "row",
    },
    mainContainer: {
        paddingHorizontal: 24,
        paddingVertical: 20,
    },
    outerContainer: { flexDirection: "row", justifyContent: "space-between" },
    padding20: { paddingTop: 20 },
    paddingBtm15: { paddingBottom: 15 },
    paddingVertical20: { paddingVertical: 20 },
    readMore: { textDecorationLine: "underline" },
    showFundInfo: {
        paddingTop: 15,
    },
    width30: {
        width: "30%",
    },
    width60: {
        width: "60%",
    },
});

export default Performance;
