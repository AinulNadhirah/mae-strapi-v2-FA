import PropTypes from "prop-types";
import React, { useState } from "react";
import { ScrollView, View, StyleSheet, Image, TouchableOpacity } from "react-native";

import {
    SECURE_SWITCH_STACK,
    DEACTIVATE_M2U_CARDS_CASA_LANDING,
    BANKINGV2_MODULE,
    DEBIT_CARD_DETAIL,
    LOCATE_US_NOW_SCREEN,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import CallUsNowModel from "@components/CallUsNowModel";
import DebitCardBig from "@components/Cards/DebitCardBig";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Typo from "@components/Text";

import { WHITE, MEDIUM_GREY, DARK_YELLOW, WARNING_YELLOW } from "@constants/colors";
import {
    MAE_CARDMANAGEMENT,
    BLOCK_CARD,
    TEMPORARILY_DEACTIVATE_CARD,
    BLOCK_DEBIT_CARD_LANDING,
    BLOCKED_DEBIT_CARD_WARNING_MSG,
    LOCATE_NEAREST_BRANCH,
    CALL_US_NOW,
    VALID_THRU,
} from "@constants/strings";

import Assets from "@assets";
import { useModelController } from "@context";

const DebitCardDetailScreen = ({ navigation, route }) => {
    const { debitCardDetails, isAccountSuspended } = route.params;
    const { getModel } = useModelController();
    const { isShowBlockDebitCard } = getModel("misc");
    const [isShowCallUsNow, setIsShowCallUsNow] = useState(false);

    const onBackButtonPress = () => {
        navigation.goBack();
    };
    const onClickBlockDebitCard = () => {
        if (!isAccountSuspended) {
            const {
                cardNo: number,
                cardName: name,
                cardImage,
                cardExpDate,
            } = debitCardDetails;
            const accDetails = [
                {
                    number,
                    name,
                    cardImage,
                    cardExpDate,
                },
            ];
            navigation.navigate(SECURE_SWITCH_STACK, {
                screen: DEACTIVATE_M2U_CARDS_CASA_LANDING,
                params: {
                    ...route?.params,
                    fromModule: BANKINGV2_MODULE,
                    fromScreen: DEBIT_CARD_DETAIL,
                    content: BLOCK_DEBIT_CARD_LANDING,
                    accDetails,
                },
            });
        }
    };

    const onClickLocateUsNow = () => {
        navigation.navigate(SECURE_SWITCH_STACK, {
            screen: LOCATE_US_NOW_SCREEN,
            params: {
                ...route?.params,
                fromModule: BANKINGV2_MODULE,
                fromScreen: DEBIT_CARD_DETAIL,
            },
        });
    };

    const handleCallUsNow = () => {
        setIsShowCallUsNow(true);
    };

    const onCloseCallUsNow = () => {
        setIsShowCallUsNow(false);
    };

    return (
        <>
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                <ScreenLayout
                    paddingBottom={0}
                    paddingTop={0}
                    paddingHorizontal={0}
                    useSafeArea={true}
                    header={
                        <HeaderLayout
                            horizontalPaddingMode="custom"
                            horizontalPaddingCustomLeftValue={16}
                            horizontalPaddingCustomRightValue={16}
                            headerLeftElement={<HeaderBackButton onPress={onBackButtonPress} />}
                            headerCenterElement={
                                <Typo
                                    text={MAE_CARDMANAGEMENT}
                                    fontWeight="600"
                                    fontSize={16}
                                    lineHeight={24}
                                />
                            }
                        />
                    }
                >
                    <ScrollView>
                        {isAccountSuspended && (
                            <View style={styles.killSwitchWarning}>
                                <Image source={Assets.icWarningYellow} style={styles.warningIcon} />
                                <Typo
                                    fontWeight="600"
                                    fontSize={12}
                                    lineHeight={16}
                                    textAlign="left"
                                    text={BLOCKED_DEBIT_CARD_WARNING_MSG}
                                    style={styles.killSwitchWarningText}
                                />
                            </View>
                        )}
                        <View style={styles.cardContainer}>
                            <DebitCardBig
                                title={debitCardDetails.cardName}
                                accountNumber={debitCardDetails.cardNo}
                                desc={`${VALID_THRU} ${debitCardDetails.cardExpDate}`}
                                amount={debitCardDetails.outstandingBalance}
                                isPrimary={debitCardDetails.primary}
                                hasSupplementary={debitCardDetails.supplementaryAvailable}
                                image={Assets.cardsFullBackground}
                                isAccountSuspended={isAccountSuspended}
                            />
                        </View>
                        <View style={styles.cardOptionsContainer}>
                            {
                                isShowBlockDebitCard && (
                                    <TouchableOpacity
                                        onPress={onClickBlockDebitCard}
                                    >
                                        <View style={styles.blockCardContainer(isAccountSuspended)}>
                                            <View>
                                                <Typo
                                                    text={BLOCK_CARD}
                                                    fontWeight="600"
                                                    fontSize={16}
                                                    lineHeight={20}
                                                    textAlign="left"
                                                />
                                                <Typo
                                                    text={TEMPORARILY_DEACTIVATE_CARD}
                                                    fontWeight="400"
                                                    fontSize={12}
                                                    lineHeight={16}
                                                    textAlign="left"
                                                    style={styles.cardOptionDesc}
                                                />
                                            </View>
                                            <Image
                                                source={Assets.icChevronRight24Black}
                                                style={styles.manageItemChildChevron}
                                            />
                                        </View>
                                    </TouchableOpacity>
                            )}
                        </View>
                    </ScrollView>
                    <FixedActionContainer>
                        {isAccountSuspended && (
                            <View style={styles.bottomBtnContCls}>
                                <View style={styles.locateBranchButton}>
                                    <ActionButton
                                        backgroundColor={WHITE}
                                        fullWidth
                                        componentCenter={
                                            <Typo
                                                fontSize={14}
                                                fontWeight="600"
                                                lineHeight={18}
                                                text={LOCATE_NEAREST_BRANCH}
                                            />
                                        }
                                        onPress={onClickLocateUsNow}
                                    />
                                </View>
                                <View style={styles.callUsNowButton}>
                                    <ActionButton
                                        fullWidth
                                        borderRadius={24}
                                        backgroundColor={DARK_YELLOW}
                                        onPress={handleCallUsNow}
                                        componentCenter={
                                            <Typo
                                                text={CALL_US_NOW}
                                                fontSize={14}
                                                fontWeight="600"
                                                lineHeight={18}
                                            />
                                        }
                                    />
                                </View>
                            </View>
                        )}
                    </FixedActionContainer>
                </ScreenLayout>
            </ScreenContainer>
            <CallUsNowModel visible={isShowCallUsNow} onClose={onCloseCallUsNow} />
        </>
    );
};

DebitCardDetailScreen.propTypes = {
    navigation: PropTypes.shape(),
    route: PropTypes.shape(),
    getModel: PropTypes.func,
    debitCardDetails: PropTypes.shape(),
    isAccountSuspended: PropTypes.bool,
};

export default DebitCardDetailScreen;

const styles = StyleSheet.create({
    blockCardContainer: (isAccountSuspended) => ({
        paddingHorizontal: 24,
        paddingVertical: 20,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        opacity: isAccountSuspended ? 0.5 : 1,
    }),
    bottomBtnContCls: {
        justifyContent: "space-between",
        width: "100%",
    },
    callUsNowButton: {
        marginBottom: 16,
    },
    cardContainer: {
        marginHorizontal: 24,
        marginTop: 16,
        marginBottom: 36,
    },
    cardOptionsContainer: {
        backgroundColor: WHITE,
    },
    cardOptionDesc: {
        paddingTop: 4,
    },
    killSwitchWarning: {
        marginHorizontal: 24,
        marginTop: 16,
        backgroundColor: WARNING_YELLOW,
        padding: 12,
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "flex-start",
        borderRadius: 8,
    },
    killSwitchWarningText: {
        width: "90%",
    },
    locateBranchButton: {
        marginBottom: 16,
        marginTop: 16,
    },
    manageItemChildChevron: { height: 30, width: 30 },
    warningIcon: {
        marginRight: 10,
        width: 16,
    },
});
