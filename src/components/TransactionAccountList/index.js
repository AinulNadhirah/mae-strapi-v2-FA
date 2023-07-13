import React, { useRef, useState } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import PropTypes from "prop-types";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import AccountListingCarouselCard from "@components/Cards/AccountListingCarouselCard";
import Typography from "@components/Text";
import { formateAccountNumber } from "@utils/dataModel/utility";

function AccountListItem({ item, index, selectedAccountIndex, onAccountItemPressed }) {
    const { accountName, accountNumber, accountFormattedAmount } = item;
    return (
        <View style={styles.accountListingCarouselCardGutter}>
            <AccountListingCarouselCard
                accountName={accountName}
                accountNumber={formateAccountNumber(accountNumber, 12)}
                accountFormattedAmount={accountFormattedAmount}
                isSelected={index === selectedAccountIndex}
                index={index}
                onAccountItemPressed={onAccountItemPressed}
            />
        </View>
    );
}

AccountListItem.propTypes = {
    index: PropTypes.number,
    item: PropTypes.object,
    onAccountItemPressed: PropTypes.func,
    selectedAccountIndex: PropTypes.number,
};

function TransactionAccountList({ accounts, onAccountSelected, title }) {
    const flatListRef = useRef();
    const [selectedAccountIndex, setSelectedAccountIndex] = useState(0);

    function accountListItemKeyExtractor(item, index) {
        return `${item.accountNumber}-${index}`;
    }

    function onAccountItemPressed({ index }) {
        flatListRef.current.scrollToIndex({
            index,
            animated: true,
            viewPosition: 0.5,
        });
        setSelectedAccountIndex(index);
        onAccountSelected(accounts[index]);
    }

    function renderAccountListItems(props) {
        return (
            <AccountListItem
                selectedAccountIndex={selectedAccountIndex}
                onAccountItemPressed={onAccountItemPressed}
                {...props}
            />
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.titleContainer}>
                <Typography text={title} fontWeight="600" lineHeight={18} />
            </View>
            <FlatList
                data={accounts}
                keyExtractor={accountListItemKeyExtractor}
                renderItem={renderAccountListItems}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.flatListContentContainer}
                ListFooterComponent={<SpaceFiller width={32} />}
                ref={flatListRef}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    accountListingCarouselCardGutter: {
        marginBottom: 8,
        marginHorizontal: 6,
    },
    container: {
        alignItems: "flex-start",
        justifyContent: "flex-start",
    },
    flatListContentContainer: { paddingLeft: 18, paddingTop: 12 },
    titleContainer: {
        paddingLeft: 24,
    },
});

TransactionAccountList.propTypes = {
    accounts: PropTypes.arrayOf(
        PropTypes.shape({
            accountName: PropTypes.string.isRequired,
            accountNumber: PropTypes.string.isRequired,
            accountFormattedAmount: PropTypes.string.isRequired,
            accountCode: PropTypes.string.isRequired,
        })
    ).isRequired,
    onAccountSelected: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
};

export default React.memo(TransactionAccountList);
