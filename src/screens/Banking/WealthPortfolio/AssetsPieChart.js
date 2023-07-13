import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from "react-native";
import { Rect, G, Image as ImageSVG, Text as TextSVG } from "react-native-svg";
import { PieChart } from "react-native-svg-charts";

import Typo from "@components/Text";

import { BLACK } from "@constants/colors";

export const { width, height } = Dimensions.get("window");

const AssetsPieChart = ({
    categories,
    categoryColors,
    categoryIcons,
    categoryValues,
    chevronKeys,
    chevronValues,
    chevronEnabled,
    disableIcons,
    onDownChevronPressed,
    onUpChevronPressed,
    onToolTipPressed,
    onPressPieChart,
    onPressedCurrentSlice,
    onIndexChangedExternal,
    enabledLoopOnPressedChevron,
}) => {
    // States
    const [selectedSlice, setSelectedSlice] = useState({
        label: categories[0],
        value: categoryValues[0],
    });
    const [toggleTooltip, setToggleTooltip] = useState(true);

    const [selectedChevron, setSelectedChevron] = useState({
        label: "",
        value: 0,
        index: 0,
        hasPressed: false,
    });

    useEffect(() => {
        const valueIndex = onIndexChangedExternal ?? 0;
        setSelectedChevron({
            label: chevronKeys?.[valueIndex],
            value: chevronValues?.[valueIndex],
            index: valueIndex,
        });

        setSelectedSlice({
            label: categories?.[valueIndex],
            value: categoryValues?.[valueIndex],
        });
    }, [categories, categoryValues, chevronKeys, chevronValues, onIndexChangedExternal]);

    // Chart & chart label configuration
    const data = categories.map((item, index) => {
        return {
            key: item,
            amount: categoryValues[index],
            svg: { fill: categoryColors[index] },
            arc: { outerRadius: 90 + "%", padAngle: 0 },
            onPress: () => {
                setSelectedSlice({ label: item, value: categoryValues[index] });
                onPressedCurrentSlice(index);
                setToggleTooltip(true);
            },
        };
    });

    const labelXpos = (centroid) => {
        if (width <= 340) {
            return centroid < 0 ? centroid - 45 : centroid - 25;
        }

        if (centroid < 10) {
            return centroid - 70;
        }
        return centroid;
    };

    const Labels = ({ slices }) => {
        return slices.map((slice, index) => {
            const { labelCentroid, data } = slice;
            const labelName = chevronValues?.[index];
            const customWidth = labelName.length > 22 ? 180 : 150;
            const customTextSvgX = labelName.length > 22 ? 90 : 75;

            if (selectedSlice.label === data.key && toggleTooltip) {
                if (disableIcons) {
                    return (
                        <G
                            key={index}
                            x={labelCentroid[0] < 10 ? labelCentroid[0] - 50 : labelCentroid[0]}
                            y={labelCentroid[1] - 20}
                        >
                            <Rect
                                width={150}
                                height={36}
                                rx={18}
                                ry={18}
                                fill={data.svg.fill}
                                strokeWidth="2"
                                stroke="white"
                            />
                            <TextSVG
                                key={index}
                                x={26}
                                y={18}
                                fill="white"
                                fontWeight="bold"
                                fontFamily="montserrat"
                                fontStyle="normal"
                                textAnchor="middle"
                                alignmentBaseline="middle"
                                fontSize={12}
                            >
                                {chevronValues?.[index]}
                            </TextSVG>
                        </G>
                    );
                } else {
                    return (
                        <G
                            key={index}
                            x={labelXpos(
                                labelCentroid[0] > 0 ? labelCentroid[0] - 50 : labelCentroid[0]
                            )}
                            y={labelCentroid[1] - 20}
                        >
                            <Rect
                                width={customWidth}
                                height={36}
                                rx={18}
                                ry={18}
                                fill={data.svg.fill}
                                strokeWidth="2"
                                stroke="white"
                            />

                            <ImageSVG
                                x={7}
                                y={5}
                                width={24}
                                height={24}
                                preserveAspectRatio="xMidYMid meet"
                                opacity="1"
                                href={categoryIcons[index]}
                            />
                            <TextSVG
                                key={index}
                                x={customTextSvgX}
                                y={18}
                                fill="white"
                                fontWeight="bold"
                                fontFamily="montserrat"
                                fontStyle="normal"
                                textAnchor="middle"
                                alignmentBaseline="middle"
                                fontSize={12}
                            >
                                {chevronValues?.[index]}
                            </TextSVG>
                        </G>
                    );
                }
            }

            return null;
        });
    };

    function chevronUpOnPress() {
        let newIndex = selectedChevron.index;

        if (newIndex === 0) {
            if (!enabledLoopOnPressedChevron) return;

            newIndex = chevronKeys.length - 1;
        } else {
            newIndex = newIndex - 1;
        }

        setSelectedChevron({
            label: chevronKeys[newIndex],
            value: chevronValues[newIndex],
            index: newIndex,
            hasPressed: true,
        });

        setSelectedSlice({ label: categories[newIndex], value: categoryValues[newIndex] });
        onUpChevronPressed(newIndex);
    }

    function chevronDownOnPress() {
        let newIndex = selectedChevron.index + 1;
        if (selectedChevron.index === chevronKeys.length - 1) {
            if (!enabledLoopOnPressedChevron) return;

            newIndex = 0;
        }

        setSelectedChevron({
            label: chevronKeys[newIndex],
            value: chevronValues[newIndex],
            index: newIndex,
            hasPressed: true,
        });
        setSelectedSlice({ label: categories[newIndex], value: categoryValues[newIndex] });

        onDownChevronPressed(newIndex);
    }

    function valueAccessor({ item }) {
        return item.amount;
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.container} activeOpacity={1} onPress={onPressPieChart}>
                <PieChart
                    style={styles.pieChartContainer}
                    innerRadius="70%"
                    data={data}
                    valueAccessor={valueAccessor}
                >
                    {categories[0] !== "" && <Labels />}
                </PieChart>
            </TouchableOpacity>

            {/* chevron - up */}
            <View style={styles.chevronContainer}>
                {chevronEnabled && (
                    <TouchableOpacity
                        style={styles.chevronUpTouchableContainer}
                        hitSlop={{ top: 10, bottom: 10, left: 20, right: 20 }}
                        onPress={chevronUpOnPress}
                    >
                        <Image
                            style={styles.chevronButtonStyle}
                            source={require("@assets/icons/Tracker/btnArrowUp.png")}
                        />
                    </TouchableOpacity>
                )}
                <View style={styles.chevronContentContainer}>
                    <Typo fontSize={14} lineHeight={22} style={styles.chevronLabel}>
                        <Text>{selectedChevron.label}</Text>
                    </Typo>
                    {onToolTipPressed && (
                        <View style={styles.infoIconContainer}>
                            <TouchableOpacity onPress={onToolTipPressed}>
                                <Image
                                    style={styles.infoIcon}
                                    source={require("@assets/icons/Tracker/iconBlackInfo.png")}
                                />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
                {/* chevron - down */}
                {chevronEnabled && (
                    <TouchableOpacity
                        style={styles.chevronDownTouchableContainer}
                        hitSlop={{ top: 10, bottom: 10, left: 20, right: 20 }}
                        onPress={chevronDownOnPress}
                    >
                        <Image
                            style={styles.chevronButtonStyle}
                            source={require("@assets/icons/Tracker/btnArrowDown.png")}
                        />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

AssetsPieChart.propTypes = {
    categories: PropTypes.array.isRequired,
    categoryIcons: PropTypes.array.isRequired,
    categoryColors: PropTypes.array.isRequired,
    categoryValues: PropTypes.array.isRequired,
    chevronKeys: PropTypes.array.isRequired,
    chevronValues: PropTypes.array.isRequired,
    chevronEnabled: PropTypes.bool,
    disableIcons: PropTypes.bool,
    onDownChevronPressed: PropTypes.func,
    onUpChevronPressed: PropTypes.func,
    onToolTipPressed: PropTypes.func,
    onPressPieChart: PropTypes.func,
    onPressedCurrentSlice: PropTypes.func,
    onIndexChangedExternal: PropTypes.number,
    enabledLoopOnPressedChevron: PropTypes.bool,
};

AssetsPieChart.defaultProps = {
    categories: [""],
    categoryIcons: [],
    categoryColors: ["#cfcfcf"],
    categoryValues: [100],
    chevronValues: [0, 0, 0],
    chevronEnabled: true,
    disableIcons: false,
    enabledLoopOnPressedChevron: false,
};

export default AssetsPieChart;

const styles = StyleSheet.create({
    chevronButtonStyle: {
        height: 8,
        tintColor: BLACK,
        width: 16,
    },
    chevronContainer: {
        alignItems: "center",
        alignSelf: "center",
        borderRadius: 180 / 2,
        bottom: "20.5%",
        height: 180,
        justifyContent: "center",
        position: "absolute",
        width: 180,
    },
    chevronContentContainer: {
        alignItems: "center",
        flexDirection: "column",
        justifyContent: "center",
        width: "100%",
    },
    chevronDownTouchableContainer: {
        bottom: 0,
        height: 24,
        position: "absolute",
    },
    chevronLabel: {
        width: 130,
    },
    chevronUpTouchableContainer: {
        height: 24,
        position: "absolute",
        top: 16,
    },
    container: { height: 280, justifyContent: "center", marginBottom: 16 },
    infoIcon: { height: 16, width: 16 },
    infoIconContainer: {
        justifyContent: "center",
        paddingTop: 10,
    },
    pieChartContainer: {
        flex: 1,
    },
});
