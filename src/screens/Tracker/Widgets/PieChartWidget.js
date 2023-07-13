import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from "react-native";
import PropTypes from "prop-types";

import { PieChart } from "react-native-svg-charts";
import { Rect, G, Image as ImageSVG } from "react-native-svg";
import { Text as TextSVG } from "react-native-svg";
import Typo from "@components/Text";

import * as utility from "@utils/dataModel/utility";

export const { width, height } = Dimensions.get("window");

const PieChartWidget = ({
    categories,
    categoryColors,
    categoryIcons,
    categoryValues,
    chevronKeys,
    chevronValues,
    chevronEnabled,
    showInfo,
    creditMode,
    disableIcons,
    showNegative,
    ...props
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
        // if (selectedChevron.value == 0 && !selectedChevron.hasPressed) {
        setSelectedChevron({
            label: chevronKeys[0],
            value: chevronValues[0],
            index: 0,
        });
        // }
    }, [chevronValues[0], chevronKeys[0]]);

    // Chart & chart label configuration
    const data = categories.map((key, index) => {
        return {
            key,
            amount: categoryValues[index],
            svg: { fill: categoryColors[index] },
            arc: { outerRadius: 90 + "%", padAngle: 0 },
            onPress: () => {
                setSelectedSlice({ label: key, value: categoryValues[index] });
                setToggleTooltip(true);
            },
        };
    });

    const labelXpos = (centroid) => {
        if (width <= 340) {
            console.log(centroid);
            if (centroid < 0) {
                return centroid - 45;
            }
            return centroid - 25;
        }

        if (centroid < 10) {
            return centroid - 70;
        }
        return centroid;
    };

    const Labels = ({ slices, height, width }) => {
        return slices.map((slice, index) => {
            const { labelCentroid, pieCentroid, data } = slice;
            if (selectedSlice.label === data.key && toggleTooltip) {
                if (disableIcons) {
                    return (
                        <G
                            key={index}
                            x={labelCentroid[0] < 10 ? labelCentroid[0] - 50 : labelCentroid[0]}
                            y={labelCentroid[1] - 20}
                        >
                            <Rect
                                width={48}
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
                                fill={"white"}
                                fontWeight={"bold"}
                                fontFamily={"montserrat"}
                                fontStyle={"normal"}
                                textAnchor={"middle"}
                                alignmentBaseline={"middle"}
                                fontSize={12}
                            >
                                {`${data.amount}%`}
                            </TextSVG>
                        </G>
                    );
                } else {
                    return (
                        <G key={index} x={labelXpos(labelCentroid[0])} y={labelCentroid[1] - 20}>
                            <Rect
                                width={72}
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
                                x={48}
                                y={18}
                                fill={"white"}
                                fontWeight={"bold"}
                                fontFamily={"montserrat"}
                                fontStyle={"normal"}
                                textAnchor={"middle"}
                                alignmentBaseline={"middle"}
                                fontSize={12}
                            >
                                {`${data.amount}%`}
                            </TextSVG>
                        </G>
                    );
                }
            }

            return null;
        });
    };

    // View return
    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.container}
                activeOpacity={1}
                onPress={() => setToggleTooltip(!toggleTooltip)}
            >
                <PieChart
                    style={{ flex: 1 }}
                    innerRadius={"68%"}
                    data={data}
                    valueAccessor={({ item }) => item.amount}
                >
                    {categories[0] !== "" && <Labels />}
                </PieChart>
            </TouchableOpacity>

            {/* chevron - spending stats text */}
            <View style={styles.chevronContainer}>
                {chevronEnabled && (
                    <TouchableOpacity
                        style={{ position: "absolute", top: 16, height: 24 }}
                        hitSlop={{ top: 20, bottom: 20, left: 50, right: 50 }}
                        onPress={() => {
                            var newIndex = selectedChevron.index + 1;
                            if (selectedChevron.index == chevronKeys.length - 1) {
                                newIndex = 0;
                            }

                            setSelectedChevron({
                                label: chevronKeys[newIndex],
                                value: chevronValues[newIndex],
                                index: newIndex,
                                hasPressed: true,
                            });
                        }}
                    >
                        <Image
                            style={styles.chevronButtonStyle}
                            source={require("@assets/icons/Tracker/btnArrowUp.png")}
                        />
                    </TouchableOpacity>
                )}

                {creditMode ? (
                    <View style={{ width: "100%", justifyContent: "center", alignItems: "center" }}>
                        <View style={styles.chevronContentContainer}>
                            <Typo fontSize={14} lineHeight={22} style={{ width: 130 }}>
                                <Text>{chevronKeys[0]}</Text>
                            </Typo>
                        </View>
                        {/* {chevronEnabled && (
							<View style={styles.infoIconContainerCredit}>
								<TouchableOpacity onPress={() => showInfo(selectedChevron.label)}>
									<Image
										style={styles.infoIcon}
										source={require("@assets/icons/Tracker/iconBlackInfo.png")}
									/>
								</TouchableOpacity>
							</View>
						)} */}

                        <Typo fontSize={30} lineHeight={37} fontWeight={"bold"}>
                            <Text>{chevronValues[0]}</Text>
                        </Typo>

                        <View
                            style={{
                                width: 160,
                                height: 1,
                                backgroundColor: "#eaeaea",
                                marginTop: 4,
                                marginBottom: 14,
                            }}
                        />

                        <View style={styles.chevronContentContainer}>
                            <Typo fontSize={12} lineHeight={15}>
                                <Text>{chevronKeys[1]}</Text>
                            </Typo>

                            <View style={styles.infoIconContainerCredit}>
                                <TouchableOpacity onPress={() => showInfo("Total spent")}>
                                    <Image
                                        style={styles.infoIcon}
                                        source={require("@assets/icons/Tracker/iconBlackInfo.png")}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                        <Typo fontSize={14} lineHeight={18} fontWeight={"600"}>
                            <Text>{chevronValues[1]}</Text>
                        </Typo>
                    </View>
                ) : (
                    <View style={{ width: "100%", justifyContent: "center", alignItems: "center" }}>
                        <View style={styles.chevronContentContainer}>
                            <Typo fontSize={14} lineHeight={22} style={{ width: 130 }}>
                                <Text>{selectedChevron.label}</Text>
                            </Typo>
                        </View>
                        {chevronEnabled && (
                            <View style={styles.infoIconContainer}>
                                <TouchableOpacity onPress={() => showInfo(selectedChevron.label)}>
                                    <Image
                                        style={styles.infoIcon}
                                        source={require("@assets/icons/Tracker/iconBlackInfo.png")}
                                    />
                                </TouchableOpacity>
                            </View>
                        )}
                        <Typo fontSize={18} lineHeight={26} fontWeight={"bold"}>
                            <Text>
                                {showNegative && Math.sign(selectedChevron.value) == -1 && "-"}RM{" "}
                                {utility.commaAdder(Math.abs(selectedChevron.value).toFixed(2))}
                            </Text>
                        </Typo>
                    </View>
                )}

                {chevronEnabled && (
                    <TouchableOpacity
                        style={{ position: "absolute", bottom: 0, height: 24 }}
                        hitSlop={{ top: 20, bottom: 20, left: 50, right: 50 }}
                        onPress={() => {
                            var newIndex = selectedChevron.index;
                            if (newIndex == 0) {
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
                        }}
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

PieChartWidget.propTypes = {
    categories: PropTypes.array.isRequired,
    categoryIcons: PropTypes.array.isRequired,
    categoryColors: PropTypes.array.isRequired,
    categoryValues: PropTypes.array.isRequired,
    chevronKeys: PropTypes.array.isRequired,
    chevronValues: PropTypes.array.isRequired,
    chevronEnabled: PropTypes.bool,
    showInfo: PropTypes.func.isRequired,
    creditMode: PropTypes.bool,
    disableIcons: PropTypes.bool,
    showNegative: PropTypes.bool,
};

PieChartWidget.defaultProps = {
    categories: [""],
    categoryIcons: [],
    categoryColors: ["#cfcfcf"],
    categoryValues: [100],
    chevronKeys: ["Monthly Average Spending", "Spent So Far"],
    chevronValues: [0, 0, 0],
    chevronEnabled: true,
    showInfo: () => {},
    creditMode: false,
    disableIcons: false,
    showNegative: false,
};

// PieChartWidget.defaultProps = {
// 	categories: ["Household", "Insurance", "Dining", "Groceries", "Coffee"],
// 	categoryIcons: [
// 		require("@assets/icons/SideMenu/menuWhite.png"),
// 		require("@assets/icons/SideMenu/menuWhite.png"),
// 		require("@assets/icons/SideMenu/menuWhite.png"),
// 		require("@assets/icons/SideMenu/menuWhite.png"),
// 		require("@assets/icons/SideMenu/menuWhite.png")
// 	],
// 	categoryColors: ["#720a79", "#ce2000", "#ffa000", "#ae154d", "#a85546"],
// 	categoryValues: [15, 25, 35, 45, 55],
// 	chevronKeys: ["Weekly Average Spending", "Monthly Average", "Spent So Far"],
// 	chevronValues: ["RM 800.25", "RM 2,800.88", "RM 2,888.88"]
// };

const isPropsEqual = (prevProps, nextProps) => {
    if (prevProps.chevronValues[0] !== nextProps.chevronValues[0]) return false;
    else return true;
};

const Memoiz = React.memo(PieChartWidget, isPropsEqual);

export default Memoiz;

const styles = StyleSheet.create({
    chevronButtonStyle: {
        height: 8,
        width: 16,
    },
    chevronContainer: {
        alignItems: "center",
        alignSelf: "center",
        // backgroundColor: "#f8f8f8",
        borderRadius: 180 / 2,
        bottom: "20.5%",
        height: 180,
        justifyContent: "center",
        position: "absolute",
        width: 180,
    },
    chevronContentContainer: {
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
    },
    container: { height: 280, justifyContent: "center", marginBottom: 16 },
    infoIcon: { height: 16, width: 16 },
    infoIconContainer: {
        position: "absolute",
        right: 8,
        top: -12,
        height: "100%",
        justifyContent: "center",
    },
    infoIconContainerCredit: {
        position: "absolute",
        right: 18,
        height: "100%",
        justifyContent: "center",
    },
});
