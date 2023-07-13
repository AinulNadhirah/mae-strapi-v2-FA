import moment from "moment";
import PropTypes from "prop-types";
import React, { useEffect, useRef, useState } from "react";
import { ScrollView, View, Image, StyleSheet, Dimensions, TouchableOpacity } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { Svg, Rect, Text as TextSVG } from "react-native-svg";

import Typo from "@components/Text";

import { WHITE, GRAY, TRANSPARENT } from "@constants/colors";
import { TODAY } from "@constants/strings";

import assets from "@assets";

const DRAG_BUTTON_BACKGROUND = "rgba(0, 0, 0, 0.2)";
const SCREEN_WIDTH = Dimensions.get("window").width;
const GRAPH_WIDTH = 600;

const PerformanceGraph = ({ portfolioData, depositData, createdDate, isLoading }) => {
    const scrollViewRef = useRef();
    const [currentScrollIndex, setCurrentScrollIndex] = useState(0);

    const [tooltipsPos, setTooltipsPos] = useState({ x: 0, y: 0, visible: false, value: 0 });
    const [tooltipIndex, setTooltipIndex] = useState(0);
    const [tooltipData, setTooltipData] = useState(null);

    useEffect(() => {
        setTooltipsPos({ x: 0, y: 0, visible: false, value: 0 });
    }, [portfolioData]);

    function onPressDragRight() {
        if (currentScrollIndex >= SCREEN_WIDTH) return;
        setCurrentScrollIndex(currentScrollIndex + 15);
        scrollViewRef.current.scrollTo({ x: currentScrollIndex });
    }
    function onPressDragLeft() {
        if (currentScrollIndex <= -10) return;
        if (currentScrollIndex > GRAPH_WIDTH - SCREEN_WIDTH)
            setCurrentScrollIndex(GRAPH_WIDTH - SCREEN_WIDTH);

        setCurrentScrollIndex(currentScrollIndex - 15);
        scrollViewRef.current.scrollTo({ x: currentScrollIndex });
    }

    function convert100KAmountInLabels(amount) {
        return Math.abs(amount) > 999
            ? Math.sign(amount) * (Math.abs(amount) / 1000).toFixed(1) + "K"
            : Math.sign(amount) * Math.abs(amount);
    }

    function getDateHeader(transDate) {
        const parsedDate = moment(transDate, "DD MMM YYYY").format("YYYY-MM-DD");
        if (moment(parsedDate).isSame(Date.now(), "day")) {
            return TODAY;
        }
        return transDate.toString().substring(0, parsedDate.length - 4);
    }

    function dataPointClick(data) {
        setTooltipIndex(data?.index);
        setTooltipData(data?.value);
        setTooltipsPos((previousState) => {
            return {
                ...previousState,
                x: data.x,
                y: data.y,
                value: "RM " + data.value.toFixed(2),
                timeStamp: getDateHeader(createdDate[data?.index]),
                visible: true,
            };
        });
    }

    function getDotColor(value, index) {
        return "#44D7B6";
    }

    function formatYLabel(item) {
        return convert100KAmountInLabels(item);
    }

    function dotDecorator() {
        return (
            tooltipsPos.visible && (
                <View>
                    <Svg>
                        <Rect
                            x={tooltipsPos.x + 15}
                            y={tooltipsPos.y - 15}
                            width="40"
                            height="30"
                            fill={TRANSPARENT}
                        />
                        <TextSVG
                            x={tooltipsPos.x - 10}
                            y={tooltipsPos.y - 20}
                            fill={GRAY}
                            fontSize="10"
                            fontWeight="bold"
                            textAnchor="middle"
                        >
                            {tooltipsPos?.timeStamp}
                        </TextSVG>
                        <TextSVG
                            x={tooltipsPos.x - 10}
                            y={tooltipsPos.y - 10}
                            fill={GRAY}
                            fontSize="10"
                            fontWeight="bold"
                            textAnchor="middle"
                        >
                            {tooltipsPos?.value}
                        </TextSVG>
                    </Svg>
                </View>
            )
        );
    }

    function getDotProps(dataPoint, dataIndex) {
        if (dataIndex === tooltipIndex && dataPoint === tooltipData) {
            return {
                r: "3",
            };
        } else {
            return {
                r: "0",
            };
        }
    }

    if (portfolioData.length <= 0 && depositData.length <= 0 && createdDate.length <= 0)
        return null;
    else {
        return (
            <>
                <ScrollView
                    style={styles.scrollView}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    scrollEnabled={true}
                    decelerationRate={0.8}
                    bounces={false}
                    ref={scrollViewRef}
                >
                    <View style={styles.subContainer}>
                        {portfolioData.length > 0 &&
                            depositData.length > 0 &&
                            createdDate.length > 0 &&
                            !isLoading && (
                                <LineChart
                                    withHorizontalLabels={true}
                                    withVerticalLabels={true}
                                    segments={4}
                                    data={{
                                        labels: createdDate,
                                        datasets: [
                                            {
                                                data: portfolioData,
                                                color: () => "#44D7B6",
                                                strokeWidth: 1,
                                            },
                                            {
                                                data: depositData,
                                                color: () => "#337AB7",
                                                strokeWidth: 2,
                                            },
                                        ],
                                    }}
                                    width={GRAPH_WIDTH}
                                    height={250}
                                    yAxisLabel="RM "
                                    formatYLabel={formatYLabel}
                                    verticalLabelRotation={45}
                                    yLabelsOffset={5}
                                    xLabelsOffset={0}
                                    // withScrollableDot={true}
                                    withShadow={false}
                                    withDots={true}
                                    getDotColor={getDotColor}
                                    getDotProps={getDotProps}
                                    chartConfig={{
                                        linejoinType: "round",
                                        backgroundGradientFrom: "white",
                                        backgroundGradientTo: "white",
                                        decimalPlaces: 0,
                                        useShadowColorFromDataset: true,
                                        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                        labelColor: () => "grey",
                                        propsForLabels: {
                                            fontSize: 10,
                                        },
                                        style: {
                                            borderRadius: 16,
                                        },
                                        propsForDots: {
                                            r: "2",
                                        },
                                        // scrollableDotFill: "#fff",
                                        // scrollableDotRadius: 4,
                                        // scrollableDotStrokeColor: "#44D7B6",
                                        // scrollableDotStrokeWidth: 3,
                                        // scrollableInfoViewStyle: {
                                        //     justifyContent: "center",
                                        //     alignContent: "center",
                                        //     backgroundColor: "white",
                                        //     borderRadius: 8,
                                        //     marginTop: 5,
                                        //     marginLeft: 5,
                                        //     width: 100,
                                        //     borderColor: "grey",
                                        //     borderWidth: 2,
                                        // },
                                        // scrollableInfoTextStyle: {
                                        //     fontSize: 10,
                                        //     color: "black",
                                        //     marginHorizontal: 2,
                                        //     // flex: 1,
                                        //     textAlign: "center",

                                        // },
                                        // scrollableInfoSize: {
                                        //     width: 30,
                                        //     height: 30,
                                        // },
                                        // scrollableInfoOffset: 15,
                                    }}
                                    style={styles.lineChart}
                                    decorator={dotDecorator}
                                    onDataPointClick={dataPointClick}
                                />
                            )}
                    </View>
                </ScrollView>
                <DragButton onPressLeft={onPressDragLeft} onPressRight={onPressDragRight} />
            </>
        );
    }
};

PerformanceGraph.propTypes = {
    portfolioData: PropTypes.array,
    depositData: PropTypes.array,
    createdDate: PropTypes.array,
    isLoading: PropTypes.bool,
};

const DragButton = ({ onPressLeft, onPressRight }) => {
    return (
        <View style={styles.dragButtonContainer}>
            <TouchableOpacity onPressIn={onPressLeft}>
                <Image source={assets.icChevronLeft24Black} style={styles.dragButtonArrow} />
            </TouchableOpacity>
            <Typo text="Drag" fontSize={14} fontWeight="600" color={WHITE} />
            <TouchableOpacity onPressIn={onPressRight}>
                <Image source={assets.icChevronRight24Black} style={styles.dragButtonArrow} />
            </TouchableOpacity>
        </View>
    );
};

DragButton.propTypes = {
    onPressLeft: PropTypes.func,
    onPressRight: PropTypes.func,
};

const styles = StyleSheet.create({
    dragButtonArrow: {
        height: 15,
        tintColor: WHITE,
        width: 25,
    },
    dragButtonContainer: {
        alignItems: "center",
        backgroundColor: DRAG_BUTTON_BACKGROUND,
        borderRadius: 22,
        flexDirection: "row",
        paddingHorizontal: 12,
        paddingVertical: 14,
        position: "absolute",
        right: 20,
        top: 300,
    },
    lineChart: {
        //marginHorizontal: 100,
        marginLeft: 0,
        marginVertical: 8,
        paddingBottom: 50,
        paddingTop: 30,
    },
    scrollView: {
        flexDirection: "row",
        flex: 1,
        height: 350,
    },
    subContainer: {
        flex: 1,
        marginLeft: 0,
    },
});

export default PerformanceGraph;
