import PropTypes from "prop-types";
import React, { useCallback } from "react";
import { StyleSheet, View, FlatList } from "react-native";

import {
    BANKINGV2_MODULE,
    MFCA_SUMMARY_SCREEN,
    WEALTH_ERROR_HANDLING_SCREEN,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ProductCard from "@components/Cards/ProductCard";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";

import { withModelContext } from "@context";

import { bankingGetDataMayaM2u } from "@services";

import { formateAccountNumber } from "@utils/dataModel/utility";
import { ErrorLogger } from "@utils/logs";

import Assets from "@assets";

const MFCAProductCard = ({ item, onMFCAProductCardPressed }) => {
    const { name, number, value, currencyCodes, investmentType } = item;

    const onPress = useCallback(
        () =>
            onMFCAProductCardPressed({
                investmentType,
                accountBalance: value,
                accountName: name,
                accountNumber: number,
            }),
        [number, onMFCAProductCardPressed, investmentType, name, value]
    );
    return (
        <ProductCard
            isWhite
            image={Assets.investmentCardBackground}
            desc={formateAccountNumber(number ?? "", 16)}
            descSecondary={currencyCodes.join(", ")}
            title={name}
            showAmount
            amount={value}
            onCardPressed={onPress}
        />
    );
};

MFCAProductCard.propTypes = {
    item: PropTypes.object.isRequired,
    onMFCAProductCardPressed: PropTypes.func.isRequired,
};

class MFCASummaryScreen extends React.Component {
    static propTypes = {
        navigation: PropTypes.object.isRequired,
        getModel: PropTypes.func,
    };

    state = {
        showLoader: true,
        mfcaAccountData: [],
    };

    componentDidMount() {
        this._syncDataToState();
    }

    _syncDataToState = async () => {
        const request = await this._getFCAAccountsData();
        this.setState({
            mfcaAccountData: request?.data ?? [],
            showLoader: false,
        });
    };

    _getFCAAccountsData = async () => {
        try {
            const response = await bankingGetDataMayaM2u("/details/mfca", false, false);
            if (response?.maintenance) {
                this.props.navigation.replace(WEALTH_ERROR_HANDLING_SCREEN, {
                    error: "ScheduledMaintenance",
                });
                return;
            }

            if (response?.status === 200) return response;
            return null;
        } catch (error) {
            if (error?.status === "nonetwork") {
                this.props.navigation.replace(WEALTH_ERROR_HANDLING_SCREEN, {
                    error: "NoConnection",
                    fromPage: MFCA_SUMMARY_SCREEN,
                });
            } else {
                this.props.navigation.replace(WEALTH_ERROR_HANDLING_SCREEN, {
                    error: "TechnicalError",
                });
            }
            ErrorLogger(error);
            return null;
        }
    };

    _onHeaderBackButtonPressed = () => this.props.navigation.goBack();

    _fcaAccountListKeyExtractor = (item, index) => `${item.acctNo}-${index}`;

    _onProductCardPressed = (selectedMFCAObject) => {
        const { digitalWealthAvailable } = this.props.getModel("digitalWealth");

        this.props.navigation.navigate(BANKINGV2_MODULE, {
            screen: digitalWealthAvailable ? "MFCADetailsScreen" : "MFCADetailsScreenBAU",
            params: { ...selectedMFCAObject },
        });
    };

    _renderFCAAccountListItems = ({ item }) => (
        <MFCAProductCard item={item} onMFCAProductCardPressed={this._onProductCardPressed} />
    );

    render() {
        const { showLoader, mfcaAccountData } = this.state;

        return (
            <ScreenContainer backgroundType="color" showLoaderModal={showLoader}>
                <ScreenLayout
                    useSafeArea
                    paddingBottom={0}
                    neverForceInset={["bottom"]}
                    header={
                        <HeaderLayout
                            horizontalPaddingCustomLeftValue={16}
                            horizontalPaddingCustomRightValue={16}
                            headerCenterElement={
                                <Typo
                                    text="Foreign Accounts"
                                    fontSize={16}
                                    lineHeight={18}
                                    fontWeight="600"
                                />
                            }
                            headerLeftElement={
                                <View style={styles.headerButtonContainer}>
                                    <HeaderBackButton onPress={this._onHeaderBackButtonPressed} />
                                </View>
                            }
                        />
                    }
                >
                    <FlatList
                        showsVerticalScrollIndicator={false}
                        data={mfcaAccountData}
                        keyExtractor={this._fcaAccountListKeyExtractor}
                        renderItem={this._renderFCAAccountListItems}
                    />
                </ScreenLayout>
            </ScreenContainer>
        );
    }
}

export default withModelContext(MFCASummaryScreen);

const styles = StyleSheet.create({
    headerButtonContainer: {
        alignItems: "center",
        height: 44,
        justifyContent: "center",
        width: 44,
    },
});
