import PropTypes from "prop-types";
import React from "react";
import { View, ScrollView } from "react-native";

import BankListItem from "./BankListItem";

const BankList = ({ data, extraData, callback, showLastLine = false }) => {
    if (!data) return null;

    return (
        <View>
            <ScrollView testID={"ownAccountList"} accessibilityLabel={"ownAccountList"}>
                {data.map((bank, index) => (
                    <BankListItem
                        key={bank.bankCode}
                        item={bank}
                        callback={callback}
                        isLast={data && data.length >= 1 && data.length - 1 === index}
                    />
                ))}
            </ScrollView>
            {/* <FlatList
                data={data}
                // extraData={extraData}
                // scrollToIndex={0}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                showIndicator={false}
                keyExtractor={(item, index) => `${item.contentId}-${index}`}
                renderItem={({ item, index }) => (
                    <BankListItem
                        item={item}
                        callback={callback}
                        isLast={data && data.length >= 1 && data.length - 1 === index}
                    />
                )}
                testID={"ownAccountList"}
                accessibilityLabel={"ownAccountList"}
            /> */}
        </View>
    );
};

BankList.propTypes = {
    callback: PropTypes.any,
    data: PropTypes.shape({
        length: PropTypes.number,
        map: PropTypes.func,
    }),
    extraData: PropTypes.any,
    showLastLine: PropTypes.bool,
};
export default BankList;
