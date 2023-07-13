import React from "react";
import { View, Text, StyleSheet, Image, FlatList } from "react-native";

import Typo from "@components/Text";
import { BLACK, WHITE, YELLOW } from "@constants/colors";
import PropTypes from "prop-types";
import TrackerWidgetCard from "@components/Cards/TrackerWidgetCard";
import ProductHoldingsListItem from "@components/ListItems/ProductHoldingsListItem";

const ProductHoldingsWidget = ({ data, isDemo, onListItemPressed, onToggleSwitch, ...props }) => (
    <TrackerWidgetCard
        title={"Product Holdings"}
        showSwitch={false}
        onInfoPressed={() => showInfo("Product Holdings")}
    >
        {isDemo ? (
            <View style={styles.container}>
                {/* Description header */}
                <Typo lineHeight={15} fontSize={12} textAlign={"left"}>
                    <Text>See all your commitments in one place.</Text>
                </Typo>

                {/* List of product holdings */}
                <View style={styles.listContainer}>
                    <ProductHoldingsListItem title={"Accounts"} amount={8888.88} blackMode={true} />
                    <View style={styles.divider} />
                    <ProductHoldingsListItem
                        title={"Credit Cards"}
                        amount={8888.88}
                        blackMode={true}
                    />
                    <View style={styles.divider} />
                    <ProductHoldingsListItem title={"Loans"} amount={8888.88} blackMode={true} />
                    <View style={styles.divider} />
                    <ProductHoldingsListItem
                        title={"Investments"}
                        amount={8888.88}
                        blackMode={true}
                    />
                </View>
            </View>
        ) : (
            <View style={styles.container}>
                {/* Description header */}
                <Typo lineHeight={15} fontSize={12} textAlign={"left"}>
                    <Text>See all your commitments in one place.</Text>
                </Typo>

                {/* List of product holdings */}
                <View style={styles.listContainer}>
                    <FlatList
                        data={data.accountBalanceList}
                        // extraData={this.state.refresh}
                        renderItem={({ item }) => (
                            <React.Fragment>
                                <ProductHoldingsListItem
                                    title={item.acctTypeName}
                                    amount={item.balance}
                                    onListItemPressed={() => onListItemPressed(item.acctTypeName)}
                                    blackMode={true}
                                />
                                <View style={styles.divider} />
                            </React.Fragment>
                        )}
                        keyExtractor={(item) => item.acctTypeName}
                    />
                </View>
            </View>
        )}
    </TrackerWidgetCard>
);

ProductHoldingsWidget.propTypes = {
    data: PropTypes.object,
    onListItemPressed: PropTypes.func.isRequired,
    isDemo: PropTypes.bool.isRequired,
    showInfo: PropTypes.func.isRequired,
};

ProductHoldingsWidget.defaultProps = {
    data: {},
    onListItemPressed: () => {},
    isDemo: false,
    showInfo: () => {},
};

const Memoiz = React.memo(ProductHoldingsWidget);

export default Memoiz;

const styles = StyleSheet.create({
    container: {
        marginTop: -14,
    },
    listContainer: {
        marginTop: 24,
    },
    divider: {
        width: "100%",
        height: 1,
        backgroundColor: "#eaeaea",
    },
});
