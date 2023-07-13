import PropTypes from "prop-types";
import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, ScrollView, FlatList } from "react-native";
import { useSafeArea } from "react-native-safe-area-context";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import TrackerSectionItem from "@components/ListItems/TrackerSectionItem";
import TxnHistoryListItem from "@components/ListItems/TxnHistoryListItem";
import Typography from "@components/Text";

import { MEDIUM_GREY, YELLOW, WHITE, LIGHT_YELLOW, BLACK, LIGHT_BLACK } from "@constants/colors";

import { commaAdder } from "@utils/dataModel/utility";

const TransactionItems = ({
    type,
    data,
    date,
    index,
    onListItemPressed,
    convertItemStringToNumber,
}) => {
    const extractKey = useCallback((item, index) => `${date}-${index}`, [date]);

    const renderItem = useCallback(
        ({ item }) => (
            <View style={styles.containerTrackerListItem}>
                <TxnHistoryListItem
                    title={item.desc.trim()}
                    desc={type === "CC" ? item.expDate : ""}
                    curCode={item.curCode !== "000" && item.curCode !== "" && item.curCode}
                    amount={
                        item.curCode === "000" || item.curCode === ""
                            ? convertItemStringToNumber(item.amt, item.indicator)
                            : convertItemStringToNumber(item.curAmt, item.indicator)
                    }
                    points={
                        item.curCode !== "000" &&
                        item.curCode !== "" &&
                        convertItemStringToNumber(item.amt, item.indicator)
                    }
                    hideIcon
                    showRadioBtn
                    isSelected={item?.isSelected}
                    renderItem={item}
                    onListItemPressed={onListItemPressed}
                />
            </View>
        ),
        [convertItemStringToNumber, onListItemPressed, type]
    );

    return (
        <FlatList
            data={data}
            extraData={{}}
            renderItem={renderItem}
            listKey={`${date}-${index}`}
            keyExtractor={extractKey}
        />
    );
};

TransactionItems.propTypes = {
    convertItemStringToNumber: PropTypes.func,
    data: PropTypes.any,
    date: PropTypes.any,
    index: PropTypes.any,
    onListItemPressed: PropTypes.any,
    type: PropTypes.string,
};

const BottomView = ({ bottomInfo, onDoneEvent, buttonLabel, isButtonEnabled }) => {
    const safeArea = useSafeArea();

    return (
        <View style={styles.containerFooter(safeArea)}>
            <Typography
                fontSize={14}
                fontWeight="600"
                letterSpacing={0}
                lineHeight={18}
                textAlign="left"
                text={bottomInfo}
            />
            <ActionButton
                backgroundColor={isButtonEnabled ? YELLOW : LIGHT_YELLOW}
                onPress={onDoneEvent}
                width={108}
                height={40}
                borderRadius={20}
                componentCenter={
                    <Typography
                        text={buttonLabel}
                        fontSize={14}
                        fontWeight="600"
                        color={isButtonEnabled ? BLACK : LIGHT_BLACK}
                    />
                }
                disabled={!isButtonEnabled}
            />
        </View>
    );
};

BottomView.propTypes = {
    bottomInfo: PropTypes.any,
    buttonLabel: PropTypes.any,
    isButtonEnabled: PropTypes.any,
    onDoneEvent: PropTypes.any,
};

function EZYPaySelectTransaction({ navigation, route }) {
    // const [type, setType] = useState("CC");
    const type = "CC";
    const [count, setCount] = useState(0);
    const [selectedItem, setSelectedItem] = useState([]);
    const [transactionList, setTransactionList] = useState([]);

    const getFormattedData = () => {
        console.log("[EZYPaySelectTransaction] >> [getFormattedData]");
        const param = route?.params ?? {};
        const data = param?.details ?? [];
        const newData = data.map((item, index) => ({
            ...item,
            transactionDetails: item.transactionDetails.map((i, ind) => ({
                ...i,
                isSelected: false,
                //already formatted from Backend
                displayDate: item.date,
                id: index + "_" + ind,
            })),
        }));
        setTransactionList(newData);
    };

    const onBackTap = useCallback(() => {
        console.log("[EZYPaySelectTransaction] >> [onBackTap]");
        navigation.goBack();
    }, [navigation]);

    const onStartedTap = useCallback(() => {
        console.log("[EZYPaySelectTransaction] >> [onStartedTap]");
        navigation.navigate("EZYPaySelectPlan", {
            selectedData: selectedItem,
            ...route.params,
        });
    }, [navigation, route.params, selectedItem]);

    const onListItemPressed = useCallback(
        (item) => {
            console.log("[EZYPaySelectTransaction] >> [onListItemPressed]");
            if (count === 4 && !item.isSelected) {
                //show error
                return;
            }
            const selectedValue = [...transactionList];

            const newValue = selectedValue.map((value) => ({
                ...value,
                transactionDetails: value.transactionDetails.map((i) => ({
                    ...i,
                    isSelected:
                        (i.isSelected && i.id !== item.id) ||
                        (i.id === item.id && !item.isSelected),
                })),
            }));
            setTransactionList([...newValue]);
        },
        [transactionList, count]
    );

    const convertItemStringToNumber = useCallback((amt, indicator) => {
        if (amt) {
            const num = Number(amt.toString().replace(/,/g, ""));

            return indicator === "D" ? -num : num;
        }
        return 0;
    }, []);

    const renderItem = useCallback(
        ({ item, index }) => (
            <>
                <TrackerSectionItem date={item.date} hideAmount />
                <TransactionItems
                    data={item.transactionDetails}
                    date={item.date}
                    index={index}
                    type={type}
                    onListItemPressed={onListItemPressed}
                    convertItemStringToNumber={convertItemStringToNumber}
                />
            </>
        ),
        [convertItemStringToNumber, type, onListItemPressed]
    );

    const extractKey = useCallback((item, index) => `${item.date}-${index}`, []);

    useEffect(() => {
        getFormattedData();
    }, []);

    useEffect(() => {
        let ct = 0;
        const selectedObj = [];

        try {
            transactionList.forEach((value) => {
                value.transactionDetails.forEach((i) => {
                    if (i.isSelected) {
                        ct++;
                        const amt = convertItemStringToNumber(i.amt, i.indicator);
                        const dispAmt = `${Math.sign(amt) === -1 ? "-" : ""}RM ${commaAdder(
                            Math.abs(amt).toFixed(2)
                        )}`;
                        const displayValue = [];
                        i.displayPlans &&
                            i.displayPlans.forEach((val, k) => {
                                displayValue.push({
                                    name: val,
                                    type: i?.planTypes[k],
                                    tenureCode: i?.tenureList[k],
                                    tenure: i?.displayPlans[k],
                                    rate: i?.rateList[k],
                                    intMonth: i?.intMonthList[k],
                                    id: i.id,
                                });
                            });
                        selectedObj.push({
                            ...i,

                            displayAmt: dispAmt,
                            displayValue,
                            showPicker: false,
                            isSelected: false,
                            isPickerSelected: false,
                            selectedVal: {},
                        });
                    }
                });
            });
            setCount(ct);
            setSelectedItem(selectedObj);
        } catch (e) {
            console.log("Exception: ", e);
        }
    }, [convertItemStringToNumber, transactionList]);

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <ScreenLayout
                paddingBottom={0}
                paddingTop={0}
                paddingHorizontal={0}
                header={
                    <HeaderLayout
                        headerCenterElement={
                            <Typography
                                text="EzyPay Plus"
                                fontWeight="600"
                                fontSize={16}
                                lineHeight={19}
                            />
                        }
                        headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                    />
                }
                useSafeArea
                neverForceInset={["top", "bottom"]}
            >
                <View style={styles.container}>
                    <View style={styles.copy}>
                        <Typography
                            fontSize={20}
                            lineHeight={28}
                            fontWeight="300"
                            text="Please select transaction(s)"
                            textAlign="left"
                        />
                    </View>
                    <ScrollView style={styles.svContainer}>
                        <React.Fragment>
                            <FlatList
                                data={transactionList}
                                // extraData={refresh}
                                renderItem={renderItem}
                                keyExtractor={extractKey}
                            />
                        </React.Fragment>
                        <View style={styles.bottomContainer} />
                    </ScrollView>
                    {/* Bottom docked bar */}
                    <BottomView
                        bottomInfo={`${count}/5 transactions selected `}
                        onDoneEvent={onStartedTap}
                        buttonLabel="Confirm"
                        isButtonEnabled={count !== 0}
                    />
                </View>
            </ScreenLayout>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    containerFooter: (inset) => ({
        alignItems: "center",
        backgroundColor: WHITE,
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 18,
        paddingHorizontal: 24,
        paddingBottom: inset.bottom ? inset.bottom : 18,
        shadowColor: "rgba(0, 0, 0, 0.15)",
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowRadius: 15,
        shadowOpacity: 1,
    }),
    containerTrackerListItem: {
        marginHorizontal: 24,
    },
    copy: {
        marginBottom: 24,
        paddingHorizontal: 36,
    },
    svContainer: {
        backgroundColor: WHITE,
        flex: 1,
    },
});

EZYPaySelectTransaction.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

export default EZYPaySelectTransaction;
