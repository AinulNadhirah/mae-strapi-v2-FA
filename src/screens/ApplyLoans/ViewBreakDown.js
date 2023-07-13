import numeral from "numeral";
import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, Image, ScrollView } from "react-native";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import Spring from "@components/Animations/Spring";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Popup from "@components/Popup";
import Typo from "@components/Text";

import { logEvent } from "@services/analytics";

import { WHITE, YELLOW, MEDIUM_GREY } from "@constants/colors";
import {
    POTENTIAL_EARNING,
    DIVIDEN_AND_CASH,
    ASB_DIVIDEND,
    BREAKDOWN,
    YEAR,
    ASB_UNIT,
    DIVIDENDE,
    CASH_GRAIN,
    PAYMENT,
    TOTAL,
    TOTAL_PROFIT,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
} from "@constants/strings";

import Assets from "@assets";

function ViewBreakDownScreen({ navigation, route }) {
    const [showPopup, setShowPopup] = useState(false);
    const data = route.params?.data;

    const textFormat = (text) => {
        if (text) {
            const str = text.replace(/_/g, " ");
            const words = str.split(" ");
            for (let i = 1; i < words.length; i++) {
                const temp = words[i].toLowerCase();
                words[i] = temp[0].toUpperCase() + temp.substr(1);
            }
            console.log(words.join(" "));
            return words.join(" ");
        }
    };
    useEffect(() => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Investment_ASBFinancing/-i_Breakdown",
        });
    }, []);

    const renderRow = (data) => {
        return (
            <View style={styles.tableBody}>
                <View style={styles.td}>
                    <Typo text={data.year} fontWeight="400" fontSize={14} lineHeight={20} />
                </View>
                <View style={styles.td}>
                    <Typo
                        text={numeral(Math.abs(data.asbUnit)).format("0,")}
                        fontWeight="400"
                        fontSize={14}
                        lineHeight={20}
                    />
                </View>
                <View style={styles.td}>
                    <Typo
                        text={"(" + numeral(Math.abs(data.payment)).format("0,") + ")"}
                        fontWeight="400"
                        fontSize={14}
                        lineHeight={20}
                    />
                </View>
                <View style={styles.td}>
                    <Typo
                        text={numeral(Math.abs(data.dividend)).format("0,")}
                        fontWeight="400"
                        fontSize={14}
                        lineHeight={20}
                    />
                </View>
                <View style={styles.td}>
                    <Typo
                        text={"(" + numeral(Math.abs(data.cashGain)).format("0,") + ")"}
                        fontWeight="400"
                        fontSize={14}
                        lineHeight={20}
                    />
                </View>
            </View>
        );
    };

    function onPinInfoPress() {
        setShowPopup(true);
    }
    function onPopupClose() {
        setShowPopup(false);
    }

    const InfoLabel = () => {
        return (
            <View style={styles.infoLabelContainerCls}>
                <Typo fontSize={14} lineHeight={18} textAlign="left" text={POTENTIAL_EARNING} />
                <TouchableOpacity onPress={onPinInfoPress}>
                    <Image style={styles.infoIcon} source={Assets.icInformation} />
                </TouchableOpacity>
            </View>
        );
    };

    function onBackTap() {
        navigation.goBack();
    }

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <ScreenLayout
                paddingBottom={0}
                paddingTop={0}
                paddingHorizontal={0}
                useSafeArea
                header={
                    <HeaderLayout
                        headerCenterElement={
                            <Typo text={BREAKDOWN} fontWeight="600" fontSize={16} lineHeight={19} />
                        }
                        headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                    />
                }
                neverForceInset={["bottom"]}
                paddingLeft={0}
                paddingRight={0}
            >
                <ScrollView>
                    <View style={styles.layout}>
                        <Spring style={styles.container} activeOpacity={0.9}>
                            <View style={styles.invertCard}>
                                <View style={styles.invertCardHead}>
                                    <Typo
                                        fontSize={16}
                                        lineHeight={20}
                                        fontWeight="600"
                                        letterSpacing={0}
                                        textAlign="left"
                                        text={textFormat(data?.type)}
                                        style={styles.invertTitle}
                                        numberOfLines={2}
                                    />
                                    {InfoLabel()}
                                </View>
                                <TouchableOpacity onPress={null} activeOpacity={0.9}>
                                    <View style={styles.invertCardBody}>
                                        <Typo
                                            fontSize={24}
                                            lineHeight={28}
                                            fontWeight="600"
                                            letterSpacing={0}
                                            textAlign="left"
                                            text={
                                                "RM" +
                                                numeral(Math.abs(data?.totalProfit)).format(
                                                    "0,0.00"
                                                )
                                            }
                                        />
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </Spring>
                        <Typo
                            fontSize={14}
                            lineHeight={24}
                            fontWeight="400"
                            letterSpacing={0}
                            textAlign="left"
                            text={DIVIDEN_AND_CASH}
                        />
                    </View>
                    <View style={styles.whiteBG}>
                        <Typo
                            fontSize={14}
                            lineHeight={24}
                            fontWeight="400"
                            letterSpacing={0}
                            textAlign="left"
                            text="Your monthly loan / financing payment is based on your loan repayment period."
                        />
                        <View style={styles.space} />
                        <Typo
                            fontSize={14}
                            lineHeight={24}
                            fontWeight="400"
                            letterSpacing={0}
                            textAlign="left"
                            text="For example: Your monthly repayment is at RM 2,345 for 10 years tenure for the investment amount of RM 150,000"
                        />
                    </View>
                    <View style={styles.tableContainer}>
                        <View style={styles.table}>
                            <View style={styles.tableHead}>
                                <View style={styles.th}>
                                    <Typo
                                        fontSize={13}
                                        fontWeight="700"
                                        letterSpacing={0}
                                        text={YEAR}
                                    />
                                </View>
                                <View style={styles.th}>
                                    <Typo
                                        fontSize={13}
                                        fontWeight="700"
                                        letterSpacing={0}
                                        text={ASB_UNIT}
                                    />
                                </View>
                                <View style={styles.th}>
                                    <Typo
                                        fontSize={13}
                                        fontWeight="700"
                                        letterSpacing={0}
                                        text={PAYMENT}
                                    />
                                </View>
                                <View style={styles.th}>
                                    <Typo
                                        fontSize={13}
                                        fontWeight="700"
                                        letterSpacing={0}
                                        text={DIVIDENDE}
                                    />
                                </View>
                                <View style={styles.th}>
                                    <Typo
                                        fontSize={13}
                                        fontWeight="700"
                                        letterSpacing={0}
                                        text={CASH_GRAIN}
                                    />
                                </View>
                            </View>
                            {data?.breakDown.map((data) => {
                                return renderRow(data);
                            })}
                            <View style={styles.tableFoot}>
                                <View style={styles.th}>
                                    <Typo
                                        fontSize={14}
                                        fontWeight="600"
                                        letterSpacing={0}
                                        text={TOTAL}
                                    />
                                </View>
                                <View style={styles.th}>
                                    <Typo
                                        fontSize={14}
                                        fontWeight="400"
                                        letterSpacing={0}
                                        text="-"
                                    />
                                </View>
                                <View style={styles.th}>
                                    <Typo
                                        fontSize={14}
                                        fontWeight="400"
                                        letterSpacing={0}
                                        text={
                                            "(" +
                                            numeral(Math.abs(data?.totalPayment)).format("0,") +
                                            ")"
                                        }
                                    />
                                </View>
                                <View style={styles.th}>
                                    <Typo
                                        fontSize={14}
                                        fontWeight="400"
                                        letterSpacing={0}
                                        text={
                                            "(" +
                                            numeral(Math.abs(data?.totalDividend)).format("0,") +
                                            ")"
                                        }
                                    />
                                </View>
                                <View style={styles.th}>
                                    <Typo
                                        fontSize={14}
                                        fontWeight="400"
                                        letterSpacing={0}
                                        text={
                                            "(" +
                                            numeral(Math.abs(data?.totalCash)).format("0,") +
                                            ")"
                                        }
                                    />
                                </View>
                            </View>
                        </View>
                    </View>

                    <View style={styles.profitArea}>
                        <View style={styles.profitCol}>
                            <Typo
                                fontSize={16}
                                lineHeight={24}
                                fontWeight="600"
                                letterSpacing={0}
                                textAlign="left"
                                text={TOTAL_PROFIT}
                            />
                        </View>
                        <View style={styles.profitCol}>
                            <Typo
                                fontSize={16}
                                lineHeight={24}
                                fontWeight="600"
                                letterSpacing={0}
                                textAlign="right"
                                text={"RM" + numeral(Math.abs(data?.totalProfit)).format("0,0.00")}
                            />
                        </View>
                    </View>
                </ScrollView>
            </ScreenLayout>
            <Popup
                visible={showPopup}
                onClose={onPopupClose}
                title={POTENTIAL_EARNING}
                description={ASB_DIVIDEND}
            />
        </ScreenContainer>
    );
}

ViewBreakDownScreen.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: WHITE,
        borderRadius: 10,
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 16,
        overflow: "hidden",
        width: "100%",
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
    invertCard: {
        flex: 1,
        padding: 20,
    },
    invertCardBody: {
        paddingTop: 10,
    },
    invertTitle: {
        paddingBottom: 10,
    },
    layout: {
        marginHorizontal: 25,
        marginTop: 30,
    },
    profitArea: {
        alignItems: "flex-start",
        flex: 1,
        flexDirection: "row",
        flexWrap: "wrap",
        marginHorizontal: 25,
        marginVertical: 25,
    },
    profitCol: {
        width: "50%",
    },
    space: {
        paddingVertical: 7,
    },
    table: {
        alignItems: "center",
        flex: 1,
        justifyContent: "center",
    },
    tableBody: {
        alignSelf: "stretch",
        flex: 1,
        flexDirection: "row",
        paddingVertical: 15,
        paddingRight: 15,
    },
    tableContainer: {
        backgroundColor: WHITE,
        flex: 1,
        marginTop: 15,
    },
    tableFoot: {
        alignSelf: "stretch",
        flex: 1,
        flexDirection: "row",
        paddingVertical: 20,
        paddingRight: 15,
    },
    tableHead: {
        alignSelf: "stretch",
        flex: 1,
        flexDirection: "row",
        backgroundColor: YELLOW,
        paddingVertical: 20,
        paddingRight: 15,
    },
    td: {
        alignSelf: "stretch",
        flex: 1,
        justifyContent: "center",
    },
    th: {
        alignSelf: "stretch",
        flex: 1,
        justifyContent: "center",
    },
    whiteBG: {
        backgroundColor: WHITE,
        marginVertical: 20,
        padding: 25,
    },
});

export default ViewBreakDownScreen;
