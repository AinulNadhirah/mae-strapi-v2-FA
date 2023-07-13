import Numeral from "numeral";
import PropTypes from "prop-types";
import React, { useState, useMemo, useCallback } from "react";
import { StyleSheet, View, ScrollView, Image, Dimensions } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import ProductHoldingsListItem from "@components/ListItems/ProductHoldingsListItem";
import ScrollPicker from "@components/Pickers/ScrollPicker";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";

import { ROYAL_BLUE } from "@constants/colors";

import { formateAccountNumber } from "@utils/dataModel/utility";

import Assets from "@assets";

const InvestmentDetailScreenTemplate = ({
    accountName,
    accountNumber,
    accountBalance,
    showBalanceAsterisk,
    onHeaderCloseButtonPressed,
    isLoading,
    accountData,
    note,
    disclaimer,
    showDisclaimerTitle,
    asOfDate,
    showTransaction,
    onPressViewTransaction,
    logEventFunc,
}) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [showScrollpicker, setShowScrollpicker] = useState(false);
    const scrollPickerItems = useMemo(
        () =>
            accountData.map((account, index) => {
                const { key } = account;
                return {
                    title: key,
                    value: index,
                };
            }),
        [accountData]
    );

    const { bottom } = useSafeAreaInsets();

    const onScrollPickerDoneButtonPressed = useCallback((index) => {
        setSelectedIndex(index);
        setShowScrollpicker(false);
        logEventFunc && logEventFunc(index);
    }, []);

    const onScrollPickerCancelButtonPressed = useCallback(() => setShowScrollpicker(false), []);

    const onDropDownButtonPressed = useCallback(() => setShowScrollpicker(true), []);

    const renderDetailsSection = () => {
        if (accountData.length > 0)
            return (
                <View style={styles.detailsContainer}>
                    {accountData[selectedIndex].key && (
                        <ActionButton
                            fullWidth
                            backgroundColor="#ffffff"
                            borderWidth={1}
                            borderColor="#cfcfcf"
                            componentLeft={
                                <View style={styles.actionButtonComponentContainer}>
                                    <Typo
                                        text={accountData[selectedIndex].key}
                                        fontSize={14}
                                        lineHeight={18}
                                        fontWeight="600"
                                    />
                                </View>
                            }
                            componentRight={
                                <View style={styles.rightActionButtonComponentContainer}>
                                    <Image
                                        source={Assets.downArrow}
                                        style={styles.chevronDownImage}
                                    />
                                </View>
                            }
                            onPress={onDropDownButtonPressed}
                        />
                    )}
                    <SpaceFiller height={32} />
                    {accountData[selectedIndex].details.map((account, index) => {
                        const {
                            name,
                            value,
                            isString = true,
                            showPlusMinusSign,
                            allowOtherChar,
                            decimalFormatValue,
                            zeroGreenColor,
                        } = account;

                        // pass amount as props for color formatting, else pass as string props
                        const displayProps = (() => {
                            if (!isString) {
                                return {
                                    isString: false,
                                    amount: value,
                                    showPlusMinusSign: showPlusMinusSign,
                                    allowOtherChar: allowOtherChar,
                                    decimalFormatValue: decimalFormatValue,
                                    zeroGreenColor: zeroGreenColor,
                                };
                            } else {
                                return {
                                    isString: true,
                                    string: value,
                                };
                            }
                        })();

                        return (
                            <ProductHoldingsListItem
                                key={`${name}-${index}`}
                                title={name}
                                {...displayProps}
                            />
                        );
                    })}
                </View>
            );
        else return null;
    };

    const renderNote = () => {
        return (
            <Typo text={note} fontSize={12} fontWeight="300" textAlign="left" style={styles.note} />
        );
    };

    const renderDisclaimer = () => {
        return (
            <View style={[styles.disclaimerContainer, { paddingBottom: 20 + bottom }]}>
                {showDisclaimerTitle && (
                    <Typo text="Disclaimer" fontWeight="700" fontSize={12} textAlign="left" />
                )}
                <Typo text={disclaimer} fontSize={12} fontWeight="300" textAlign="left" />
            </View>
        );
    };

    const showTotalAsterisk = () => {
        return showBalanceAsterisk ? "*" : "";
    };

    if (isLoading)
        return (
            <ScreenContainer backgroundType="color" showLoaderModal>
                <View />
            </ScreenContainer>
        );

    return (
        <>
            <ScreenContainer backgroundType="color" showOverlay={showScrollpicker}>
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerRightElement={
                                <HeaderCloseButton onPress={onHeaderCloseButtonPressed} />
                            }
                        />
                    }
                    useSafeArea
                    neverForceInset={["bottom"]}
                    paddingHorizontal={0}
                    paddingBottom={0}
                >
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={styles.headerContainer}>
                            <Typo
                                text={accountName}
                                fontSize={16}
                                lineHeight={19}
                                fontWeight="600"
                            />
                            <View style={styles.headerTextContainer}>
                                <Typo
                                    text={formateAccountNumber(accountNumber, 12)}
                                    fontSize={14}
                                    lineHeight={18}
                                />
                            </View>
                            <Typo
                                text={`RM ${Numeral(accountBalance).format(
                                    "0,0.00"
                                )}${showTotalAsterisk()}`}
                                fontSize={18}
                                fontWeight="bold"
                                lineHeight={32}
                                color={accountBalance >= 0 ? "#5dbc7d" : "#e35d5d"}
                            />
                            {asOfDate && (
                                <Typo
                                    text={`*As of ${asOfDate}`}
                                    fontSize={16}
                                    lineHeight={32}
                                    fontWeight="300"
                                />
                            )}
                            {showTransaction && (
                                <TouchableOpacity
                                    onPress={onPressViewTransaction}
                                    style={styles.viewTransaction}
                                >
                                    <Typo
                                        text="View Transaction"
                                        fontSize={14}
                                        color={ROYAL_BLUE}
                                        fontWeight="600"
                                    />
                                </TouchableOpacity>
                            )}
                        </View>
                        {renderDetailsSection()}
                        {renderNote()}
                        {disclaimer && renderDisclaimer()}
                    </ScrollView>
                </ScreenLayout>
            </ScreenContainer>
            <ScrollPicker
                showPicker={showScrollpicker}
                items={scrollPickerItems}
                onDoneButtonPressed={onScrollPickerDoneButtonPressed}
                onCancelButtonPressed={onScrollPickerCancelButtonPressed}
            />
        </>
    );
};

const styles = StyleSheet.create({
    actionButtonComponentContainer: {
        marginHorizontal: 24,
        width: Dimensions.get("window").width - 140,
    },
    chevronDownImage: { height: 8, width: 16 },
    detailsContainer: {
        paddingHorizontal: 24,
        width: "100%",
    },
    disclaimerContainer: {
        paddingHorizontal: 24,
    },
    headerContainer: {
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 24,
        paddingHorizontal: 24,
        width: "100%",
    },
    headerTextContainer: {
        alignItems: "center",
        justifyContent: "center",
        marginVertical: 8,
    },
    note: {
        paddingHorizontal: 24,
        paddingVertical: 10,
    },
    rightActionButtonComponentContainer: {
        marginRight: 24,
    },
    viewTransaction: {
        paddingTop: 10,
    },
});

InvestmentDetailScreenTemplate.propTypes = {
    accountBalance: PropTypes.number.isRequired,
    showTotalAsterisk: PropTypes.bool,
    accountName: PropTypes.string.isRequired,
    accountNumber: PropTypes.string.isRequired,
    onHeaderCloseButtonPressed: PropTypes.func.isRequired,
    isLoading: PropTypes.bool.isRequired,
    accountData: PropTypes.array.isRequired,
    note: PropTypes.string,
    disclaimer: PropTypes.string,
    showDisclaimerTitle: PropTypes.bool,
    asOfDate: PropTypes.string,
    showTransaction: PropTypes.bool,
    onPressViewTransaction: PropTypes.func,
    showBalanceAsterisk: PropTypes.bool,
    logEventFunc: PropTypes.func,
};

InvestmentDetailScreenTemplate.defaultProps = {
    showDisclaimerTitle: true,
    showBalanceAsterisk: true,
    logEventFunc: null,
};

export default React.memo(InvestmentDetailScreenTemplate);
