import PropTypes from "prop-types";
import React from "react";
import { FlatList } from "react-native";

import {
    BANKINGV2_MODULE,
    MFCA_DETAILS_SCREEN,
    WEALTH_PRODUCT_DETAILS_SCREEN,
} from "@navigation/navigationConstant";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ProductCard from "@components/Cards/ProductCard";
import ScreenContainer from "@components/Containers/ScreenContainer";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import Typo from "@components/Text";

import { GABankingWealth } from "@services/analytics/analyticsBanking";

import { WHITE } from "@constants/colors";

import { formateAccountNumber } from "@utils/dataModel/utilityPartial.3";

import Assets from "@assets";

const WealthCardAccountListScreen = ({ route, navigation }) => {
    const title = route.params?.title;
    const accountList = route.params?.accountList;
    const investmentType = route.params?.investmentType;

    GABankingWealth.viewScreenCardAccListWealth(investmentType);

    function onHeaderBackButtonPressed() {
        navigation.goBack();
    }

    function onCardPressed(item) {
        GABankingWealth.selectActionCardPressed(investmentType);

        if (item.productType === "MFCA") {
            const params = {
                accountNumber: item?.number,
                investmentType,
                accountBalance: item?.balance,
                accountName: item?.name,
            };
            navigation.navigate(BANKINGV2_MODULE, {
                screen: MFCA_DETAILS_SCREEN,
                params,
            });
        } else {
            navigation.navigate(BANKINGV2_MODULE, {
                screen: WEALTH_PRODUCT_DETAILS_SCREEN,
                params: {
                    item,
                },
            });
        }
    }

    function renderItem({ item }) {
        let descSecondary = null;

        switch (item?.productType) {
            case "GOLD":
            case "SILVER":
            case "MIGA":
                descSecondary = `${item?.units.toFixed(2)}g`;
                break;
            case "CCMD":
            case "CCMDFC":
            case "MMD":
            case "FCA":
            case "MFCA":
            case "RETAIL_BONDS":
            case "SHARE":
            case "STRUCTURED_INVESTMENT":
            case "DUAL_CURRENCY_INVESTMENT":
            case "UNIT_TRUST":
                descSecondary =
                    item?.noOfInvestments >= 2
                        ? `No. of investments: ${item?.noOfInvestments}`
                        : " ";
                break;
            default:
                break;
        }

        const accountNumber = (() => {
            return formateAccountNumber(item?.number, 16);
        })();

        return (
            <ProductCard
                title={item?.name}
                desc={accountNumber}
                image={Assets.investmentCardBackground}
                fontColor={WHITE}
                amount={item?.balance}
                item={item}
                descSecondary={descSecondary}
                onCardPressed={onCardPressed}
            />
        );
    }

    function keyExtractor(item, index) {
        return `${item?.number}-${index}`;
    }

    return (
        <ScreenContainer>
            <ScreenLayout
                useSafeArea
                paddingBottom={0}
                neverForceInset={["bottom"]}
                header={
                    <HeaderLayout
                        headerCenterElement={
                            <Typo text={title} fontSize={16} lineHeight={18} fontWeight="600" />
                        }
                        headerLeftElement={<HeaderBackButton onPress={onHeaderBackButtonPressed} />}
                    />
                }
            >
                <FlatList data={accountList} renderItem={renderItem} keyExtractor={keyExtractor} />
            </ScreenLayout>
        </ScreenContainer>
    );
};

WealthCardAccountListScreen.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
    item: PropTypes.object,
};

export default WealthCardAccountListScreen;
