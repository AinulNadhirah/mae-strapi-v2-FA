import React from "react";
import { View, Text, StyleSheet, Image, FlatList, Dimensions, ImageBackground } from "react-native";
import { BLACK, WHITE } from "@constants/colors";
import Typo from "@components/Text";
import PropTypes from "prop-types";
import TrackerListItem from "@components/ListItems/TrackerListItem";
import * as utility from "@utils/dataModel/utility";
import assets from "@assets";

export const { width, height } = Dimensions.get("window");

const TopExpensesWidget = ({ items, onListItemPressed, amount, ...props }) => (
    <View style={styles.container}>
        {/* list of expenses */}
        {items && items.length > 0 ? (
            <View>
                {/* insight section */}
                <View style={styles.insightContainer}>
                    <Typo
                        textAlign="left"
                        fontSize={14}
                        fontWeight="normal"
                        lineHeight={18}
                        text="Account monthly spending:"
                    />
                    <Typo
                        textAlign="left"
                        fontSize={14}
                        fontWeight="600"
                        lineHeight={18}
                        text={` RM${utility.commaAdder(Math.abs(amount).toFixed(2))} `}
                    />
                </View>

                {/* divider line */}
                <View style={styles.divider} />

                {/* title */}
                <View style={styles.titleContainer}>
                    <Typo
                        text="Top Expenses"
                        fontWeight="600"
                        textAlign="left"
                        fontSize={16}
                        lineHeight={19}
                    />
                </View>

                {/* list of transactions */}
                <View style={styles.expenseListContainer}>
                    <FlatList
                        data={items}
                        renderItem={({ item }) => (
                            <TrackerListItem
                                title={item.description ? item.description : "-"}
                                amount={item.amount}
                                // points={item.pointsEarned}
                                iconBgColor={
                                    item.btsCategory != null
                                        ? item.btsCategory.colorCode
                                        : "#ffffff"
                                }
                                iconImgUrl={{ uri: item.image }}
                                onListItemPressed={onListItemPressed}
                                date={item.transactionDate}
                                iconPadded={false}
                            />
                        )}
                        keyExtractor={(item) => item.btsId.toString()}
                        showsVerticalScrollIndicator={false}
                    />
                    {items.length < 3 && (
                        <View style={styles.noteContainer}>
                            <Typo
                                fontWeight="400"
                                fontSize={12}
                                text="Spend more and this space will track your money's activity."
                            />
                        </View>
                    )}
                </View>
            </View>
        ) : (
            <View style={styles.emptyStateContainer}>
                <View style={styles.emptyStateTitleContainer}>
                    <Typo
                        fontWeight="400"
                        fontSize={16}
                        lineHeight={18}
                        text="Start spending and this space will reflect your money’s activity."
                    />
                </View>
                <Image
                    source={assets.transactionsIllustration}
                    style={styles.emptyStateBg}
                    resizeMode="cover"
                />
            </View>
        )}
    </View>
);

TopExpensesWidget.propTypes = {
    items: PropTypes.array,
    onListItemPressed: PropTypes.func.isRequired,
    amount: PropTypes.number,
};

TopExpensesWidget.defaultProps = {
    items: [],
    onListItemPressed: () => {},
    amount: 0,
};

const Memoiz = React.memo(TopExpensesWidget);

export default Memoiz;

const styles = StyleSheet.create({
    container: {
        backgroundColor: WHITE,
        borderRadius: 8,
        elevation: 5,
        marginBottom: 24,
        shadowColor: BLACK,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        width: width - 48,
        overflow: "hidden",
        height: 280,
    },
    divider: {
        borderColor: "#eaeaea",
        borderStyle: "solid",
        borderWidth: 0.5,
        width: width - 80,
        height: 1,
        marginBottom: 16,
        marginHorizontal: 16,
    },
    titleContainer: {
        marginHorizontal: 16,
    },
    insightContainer: {
        marginHorizontal: 16,
        marginVertical: 16,
        flexDirection: "row",
    },
    expenseListContainer: {
        height: 174,
        marginTop: 8,
    },
    expenseFlatList: { paddingHorizontal: 16 },
    emptyStateBg: {
        width: "100%",
        height: 182,
        position: "absolute",
        bottom: 0,
        right: 0,
        left: 0,
    },
    emptyStateContainer: {
        width: width - 48,
        height: 280,
    },
    emptyStateTitleContainer: {
        marginTop: 40,
        marginHorizontal: 36,
    },
    noteContainer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 30,
        marginBottom: 20,
        marginHorizontal: 16,
    },
});
