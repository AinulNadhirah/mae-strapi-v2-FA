import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";

import Typo from "@components/Text";
import { BLACK, WHITE, YELLOW } from "@constants/colors";
import PropTypes from "prop-types";
import TrackerWidgetCard from "@components/Cards/TrackerWidgetCard";
import * as utility from "@utils/dataModel/utility";

// const { width, height } = Dimensions.get("window");

const TotalBalanceWidget = ({
    totalBalanceAmount,
    percentageChange,
    onCardPressed,
    isDemo,
    showInfo,
    ...props
}) => (
    <TrackerWidgetCard
        title={"Total Balance"}
        onCardPressed={onCardPressed}
        showSwitch={false}
        onInfoPressed={() => showInfo("Total Balance")}
    >
        <TouchableOpacity onPress={onCardPressed} activeOpacity={0.8}>
            <Typo textAlign="left" fontSize={12} lineHeight={15}>
                <Text>Your accounts</Text>
            </Typo>

            <View style={styles.totalBalContentContainer}>
                <View style={{ flex: 1 }}>
                    {isDemo ? (
                        <Image
                            style={{ width: 180, height: 28 }}
                            source={require("@assets/icons/Tracker/rm8888888.png")}
                        />
                    ) : (
                        <Typo
                            fontSize={22}
                            adjustFontSizeToFit
                            fontWeight="bold"
                            textAlign="left"
                            lineHeight={32}
                            // style={{ width: 180 }}
                            numberOfLines={1}
                        >
                            <Text>
                                {Math.sign(totalBalanceAmount) == -1 && "-"}RM{" "}
                                {utility.commaAdder(Math.abs(totalBalanceAmount).toFixed(2))}
                            </Text>
                        </Typo>
                    )}
                </View>

                <View style={styles.totalBalRightContainer}>
                    <Typo fontSize={10} lineHeight={13}>
                        <Text>vs. Last Month</Text>
                    </Typo>
                    {percentageChange != null ? (
                        <Typo
                            fontSize={14}
                            lineHeight={18}
                            fontWeight="600"
                            // color={Math.sign(percentageChange) == -1 ? "#e35d5d" : "#5dbc7d"}
                        >
                            <Text>{percentageChange}</Text>
                        </Typo>
                    ) : (
                        <Typo fontSize={14} lineHeight={18} fontWeight="600">
                            <Text>-</Text>
                        </Typo>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    </TrackerWidgetCard>
);

TotalBalanceWidget.propTypes = {
    totalBalanceAmount: PropTypes.number.isRequired,
    percentageChange: PropTypes.string,
    onCardPressed: PropTypes.func.isRequired,
    isDemo: PropTypes.bool.isRequired,
    showInfo: PropTypes.func.isRequired,
};

TotalBalanceWidget.defaultProps = {
    totalBalanceAmount: "-",
    percentageChange: null,
    onCardPressed: () => {},
    isDemo: false,
    showInfo: () => {},
};

const Memoiz = React.memo(TotalBalanceWidget);

export default Memoiz;

const styles = StyleSheet.create({
    totalBalContentContainer: {
        flexDirection: "row",
        height: 34,
        justifyContent: "space-between",
        width: "100%",
        alignItems: "flex-end",
        marginBottom: 24,
        marginTop: 2,
    },
    totalBalRightContainer: {
        height: 34,
        width: 80,
        flexDirection: "column",
        alignItems: "center",
    },
});
