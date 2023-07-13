import PropTypes from "prop-types";
import React, { useState, useEffect, useCallback } from "react";
import { StyleSheet, View, ScrollView } from "react-native";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import { TelcoAmountList } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Typography from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { YELLOW, MEDIUM_GREY, BLACK, DISABLED, DISABLED_TEXT } from "@constants/colors";
import { CONTINUE, FA_CARD_AUTOTOPUP_SELECTAMOUNT } from "@constants/strings";

function AutoTopupLimit({ route, navigation }) {
    const [minAmount, setMinAmount] = useState([]);
    const [topupAmount, setTopupAmount] = useState([]);
    const [selectedMAItem, setSelectedMAItem] = useState({});
    const [selectedTAItem, setSelectedTAItem] = useState({});
    const [isAmountSelected, setIsAmountSelected] = useState(true);

    useEffect(() => {
        init();
    }, [init]);

    const init = useCallback(() => {
        console.log("[AutoTopupLimit] >> [init]");
        const params = route?.params ?? {};
        console.log(params);
        getAllAmount();
    }, [getAllAmount, route?.params]);

    // Used to check if all fields are filled in, then accordingly enable/disable "Continue" btn
    useEffect(() => {
        if (selectedMAItem?.isSelected && selectedTAItem?.isSelected) setIsAmountSelected(false);
    }, [selectedMAItem, selectedTAItem]);

    const onBackTap = useCallback(() => {
        console.log("[AutoTopupLimit] >> [onBackTap]");
        navigation.goBack();
    }, [navigation]);

    const onContinue = useCallback(() => {
        console.log("[AutoTopupLimit] >> [onContinue]");
        const params = route?.params ?? {};

        if (parseFloat(selectedTAItem?.amount) < parseFloat(selectedMAItem?.amount)) {
            showErrorToast({
                message: "Your top up amount must be equal or higher than threshold amount",
            });
            return;
        }

        if (params?.isNTB) {
            navigation.navigate("AutoTopupCard", {
                ...params,
                selectedMAItem,
                isAddCard: false,
                selectedTAItem,
            });
        } else {
            //navigation.navigate("AutoTopupCard", {
            navigation.navigate("AutoTopupConfirmation", {
                ...params,
                selectedMAItem,
                selectedTAItem,
            });
        }
    }, [navigation, route?.params, selectedMAItem, selectedTAItem]);

    const getAllAmount = useCallback(async () => {
        console.log("[AutoTopupLimit] >> [getAllAmount]");

        const params = route?.params.serverData ?? {};
        const { topupAmountList, thresholdAmountList } = params;

        const newMinAmount = thresholdAmountList.map((amount, index) => ({
            ...amount,
            isSelected: false,
            id: index,
        }));
        const newTopupAmount = topupAmountList.map((amount, index) => ({
            ...amount,
            isSelected: false,
            id: index,
        }));
        setMinAmount(newMinAmount);
        setTopupAmount(newTopupAmount);
    }, [route?.params.serverData]);

    function onItemMAPressed(item) {
        console.log("[AutoTopupLimit] >> [onItemMAPressed]");
        const selectedMValue = [...minAmount];
        const newMValue = selectedMValue.map((value, index) => ({
            ...value,
            isSelected: index === item.id,
        }));
        setMinAmount([...newMValue]);
        setSelectedMAItem({ ...item, isSelected: true });
    }

    function onItemTAPressed(item) {
        console.log("[AutoTopupLimit] >> [onItemTAPressed]");
        const selectedTValue = [...topupAmount];
        const newTValue = selectedTValue.map((value, index) => ({
            ...value,
            isSelected: index === item.id,
        }));
        setTopupAmount([...newTValue]);
        setSelectedTAItem({ ...item, isSelected: true });
    }

    return (
        <React.Fragment>
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                analyticScreenName={FA_CARD_AUTOTOPUP_SELECTAMOUNT}
            >
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                        />
                    }
                    paddingHorizontal={0}
                    paddingBottom={0}
                    paddingTop={0}
                    useSafeArea
                >
                    <React.Fragment>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={Style.amountContainerCls}>
                                <View style={Style.headerTextCls}>
                                    <Typography
                                        fontSize={20}
                                        lineHeight={30}
                                        fontWeight="300"
                                        textAlign="left"
                                        text="Enable auto top up so you'll
                                    never run low on credits."
                                    />
                                </View>
                                <Typography
                                    fontSize={14}
                                    lineHeight={18}
                                    fontWeight="600"
                                    textAlign="left"
                                    text="Auto top up when balance falls below"
                                />

                                {/* Amount List */}
                                <View style={Style.amountFatlist}>
                                    <TelcoAmountList
                                        items={minAmount}
                                        textKey="value"
                                        onItemPressed={onItemMAPressed}
                                        onRadioButtonPressed={onItemMAPressed}
                                    />
                                </View>
                            </View>
                            <View style={Style.amountContainerCls}>
                                {/* How much would... */}
                                <Typography
                                    fontSize={14}
                                    lineHeight={18}
                                    fontWeight="600"
                                    textAlign="left"
                                    text="Top up amount"
                                />

                                {/* Amount List */}
                                <View style={Style.amountFatlist}>
                                    <TelcoAmountList
                                        items={topupAmount}
                                        textKey="value"
                                        onItemPressed={onItemTAPressed}
                                        onRadioButtonPressed={onItemTAPressed}
                                    />
                                </View>
                            </View>
                        </ScrollView>
                        {/* Bottom docked button container */}
                        <FixedActionContainer>
                            <View style={Style.bottomBtnContCls}>
                                <ActionButton
                                    activeOpacity={1}
                                    disabled={isAmountSelected}
                                    backgroundColor={isAmountSelected ? DISABLED : YELLOW}
                                    fullWidth
                                    componentCenter={
                                        <Typography
                                            color={isAmountSelected ? DISABLED_TEXT : BLACK}
                                            fontSize={14}
                                            lineHeight={18}
                                            fontWeight="600"
                                            text={CONTINUE}
                                        />
                                    }
                                    onPress={onContinue}
                                />
                            </View>
                        </FixedActionContainer>
                    </React.Fragment>
                </ScreenLayout>
            </ScreenContainer>
        </React.Fragment>
    );
}

const Style = StyleSheet.create({
    amountContainerCls: {
        marginHorizontal: 36,
    },
    amountFatlist: {
        flex: 1,
        marginTop: 20,
    },
    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },
    headerTextCls: {
        marginBottom: 20,
    },
});

AutoTopupLimit.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

export default AutoTopupLimit;
