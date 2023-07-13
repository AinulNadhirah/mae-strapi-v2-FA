import React from "react";
import { View, FlatList } from "react-native";
import Typo from "@components/Text";
import PropTypes from "prop-types";
import AccountDetailList from "@components/Others/AccountDetailList";

const AccountList = ({ title, data, onPress, extraData, paddingLeft }) => {
    return (
        <View style={[Styles.bottomView]}>
            <View style={{ paddingLeft: paddingLeft }}>
                <Typo
                    fontSize={14}
                    fontWeight="600"
                    fontStyle="normal"
                    letterSpacing={0}
                    lineHeight={18}
                    textAlign="left"
                    color="#000000"
                    text={title}
                />
            </View>
            <FlatList
                contentContainerStyle={{
                    paddingLeft: paddingLeft,
                }}
                style={Styles.accountsFlatlist}
                data={data}
                extraData={extraData}
                horizontal={true}
                scrollToIndex={0}
                showsHorizontalScrollIndicator={false}
                showIndicator={false}
                keyExtractor={(item, index) => `${item.contentId}-${index}`}
                // TODO: remove inline function
                renderItem={({ item, index }) => {
                    return (
                        <AccountDetailList
                            item={item}
                            index={index}
                            scrollToIndex={3}
                            isSingle={false}
                            onPress={onPress}
                        />
                    );
                }}
                testID={"accountsList"}
                accessibilityLabel={"accountsList"}
            />
        </View>
    );
};

AccountList.propTypes = {
    title: PropTypes.string,
    data: PropTypes.array,
    extraData: PropTypes.object,
    paddingLeft: PropTypes.number,
    onPress: PropTypes.func,
};

AccountList.defaultProps = {
    title: "",
    data: [],
    extraData: {},
    paddingLeft: 0,
    onPress: () => console.log("AccountList onPress"),
};

const Memoiz = React.memo(AccountList);

export default Memoiz;

const Styles = {
    bottomView: {
        flexDirection: "column",
        height: 171,
        justifyContent: "center",
        // marginBottom: 2,
        // marginTop: 10,
    },
    // bottomTitleView: {
    //     marginLeft: 24, //
    // },
    accountsFlatlist: {
        marginBottom: 24,

        // marginTop: 12,
    },
};
