import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import DeviceInfo from "react-native-device-info";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import { ScrollPickerView } from "@components/Common/ScrollPickerView";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Dropdown from "@components/FormComponents/Dropdown";
import Typography from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { withModelContext } from "@context";

import { ezyPayCalculatePayment } from "@services";

import { MEDIUM_GREY, YELLOW, DISABLED, DISABLED_TEXT, BLACK } from "@constants/colors";
import { CONTINUE, COMMON_ERROR_MSG } from "@constants/strings";
import { EZY_PAY_CAL } from "@constants/url";

import { getDeviceRSAInformation } from "@utils/dataModel/utility";

function EZYPaySelectPlan({ navigation, route, getModel }) {
    const [selectedData, setSelectedData] = useState([]);
    const [isItemSelected, setIsItemSelected] = useState(true);
    const params = route?.params ?? {};

    useEffect(() => {
        getData();
    }, []);

    const getData = () => {
        console.log("[EZYPaySelectPlan] >> [getData]");

        const selectedItem = params?.selectedData ?? null;

        setSelectedData(selectedItem);
    };

    const onBackTap = () => {
        console.log("[EZYPaySelectPlan] >> [onBackTap]");
        navigation.goBack();
    };

    const onContinueTap = () => {
        console.log("[EZYPaySelectPlan] >> [onContinueTap]", selectedData);
        calMonthlyPaymentAPI();
    };

    const getCalMonthParams = () => {
        const { deviceInformation, deviceId } = getModel("device");
        const mobileSDKData = getDeviceRSAInformation(deviceInformation, DeviceInfo, deviceId);
        const selectedDetails = getSelectedData();
        const serverData = params?.serverData ?? null;
        return {
            referenceNo: serverData?.referenceNo,
            noOfRecord: selectedData.length,
            noOfOccurence: serverData?.noOfOccurence,
            details: selectedDetails,
            service: "EZY",
            mobileSDKData,
        };
    };

    const getSelectedData = () => {
        let selectedDetails = [];
        selectedData.forEach((item, index) => {
            selectedDetails.push({
                effectiveDate: item?.effectiveDate,
                postingDate: item?.postingDate,
                description: item?.desc,
                indicator: item?.indicator,
                amount: item?.amt,
                curCode: item?.curCode,
                curAmt: item?.curAmt,
                sequenceNum: item?.transNum,
                ezyPlan: item?.selectedVal?.tenureCode,
                rate: item?.selectedVal?.rate,
                tenure: item?.selectedVal?.tenureCode,
                intMonth: item?.selectedVal?.intMonth,
                planType: item?.selectedVal?.type,
                transNum: item?.transNum,
                transactionCode: item?.transactionCode,
            });
        });
        return selectedDetails;
    };

    const calMonthlyPaymentAPI = async () => {
        const param = getCalMonthParams();

        const httpResp = await ezyPayCalculatePayment(param, EZY_PAY_CAL).catch((error) => {
            console.log("[EZYPaySelectPlan][EzyPayInquiry] >> Exception: ", error);
        });
        const result = httpResp?.data?.result ?? null;
        if (!result) {
            return;
        }
        const { statusCode, statusDescription, details } = result;
        if (statusCode === "200") {
            const newValue = selectedData.map((value, index) => ({
                ...value,
                selectedServerVal: details
                    ?.filter((data) => {
                        return data?.transactionDetails[0]?.transNum === value?.transNum;
                    })
                    ?.map((i) => {
                        return i.transactionDetails[0];
                    }),
            }));
            setSelectedData(newValue);
            navigation.navigate("EZYPayConfirmation", {
                ...route.params,
                selectedData: newValue,
                details,
            });
        } else {
            showErrorToast({
                message: statusDescription || COMMON_ERROR_MSG,
            });
        }
    };

    const handleDone = (item, index) => {
        console.log("[EZYPaySelectPlan] >> [handleDone]");
        //setSelectedLabel(item.name);
        processDoneItems(item, index);
    };

    const handleCancel = (item, index) => {
        processSelectedItems(item, "hide");
    };

    const handleShowPicker = (item) => {
        processSelectedItems(item, "show");
    };

    const processSelectedItems = (obj, type) => {
        const data = [...selectedData];
        const newData = data.map((item, index) => ({
            ...item,
            showPicker: item.id === obj.id && type === "show",
        }));
        setSelectedData(newData);
    };

    const processDoneItems = (obj, itemIndex) => {
        const data = [...selectedData];
        let isItmSelected = false;
        const newData = data.map((item, index) => ({
            ...item,
            isSelected: item.id === obj.id ?? item.isSelected,
            showPicker: false,
            isPickerSelected: item.isPickerSelected || item.id === obj.id,
            selectedVal:
                item.id === obj.id ? { ...obj, selectedIndex: itemIndex } : item.selectedVal,
        }));
        newData.forEach((item, index) => {
            if (!item.isPickerSelected) isItmSelected = true;
        });

        setSelectedData(newData);
        setIsItemSelected(isItmSelected);
    };

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <>
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
                                text="Please select a plan"
                                textAlign="left"
                            />
                        </View>
                        <ScrollView style={styles.svContainer}>
                            <React.Fragment>
                                {selectedData && (
                                    <View>
                                        {selectedData.map((prop, key) => {
                                            return (
                                                <View
                                                    key={"dropDownView" + key}
                                                    style={styles.dropDownView}
                                                >
                                                    <View style={styles.titleText}>
                                                        <View style={styles.viewRowLeftItem}>
                                                            <Typography
                                                                fontSize={14}
                                                                lineHeight={18}
                                                                letterSpacing={0}
                                                                fontWeight="normal"
                                                                textAlign="left"
                                                                text={prop?.desc}
                                                            />
                                                        </View>
                                                        <View style={styles.viewRowRightItem}>
                                                            <Typography
                                                                fontSize={14}
                                                                lineHeight={18}
                                                                letterSpacing={0}
                                                                fontWeight="600"
                                                                textAlign="left"
                                                                text={prop.displayAmt}
                                                            />
                                                        </View>
                                                    </View>
                                                    <Dropdown
                                                        value={
                                                            prop.isPickerSelected
                                                                ? prop.selectedVal.name
                                                                : "Please select plan"
                                                        }
                                                        onPress={() => handleShowPicker(prop)}
                                                    />
                                                    {/*<Dropdown
                                                        title={
                                                            prop.isPickerSelected
                                                                ? prop.selectedVal.name
                                                                : "Please select plan"
                                                        }
                                                        borderWidth={0}
                                                        align="left"
                                                        onPress={() => handleShowPicker(prop)}
                                                    />*/}
                                                </View>
                                            );
                                        })}
                                    </View>
                                )}
                            </React.Fragment>
                        </ScrollView>
                    </View>
                    {/* Bottom docked button container */}
                    <View style={styles.actionContainer}>
                        <ActionButton
                            disabled={isItemSelected}
                            backgroundColor={isItemSelected ? DISABLED : YELLOW}
                            fullWidth
                            componentCenter={
                                <Typography
                                    color={isItemSelected ? DISABLED_TEXT : BLACK}
                                    fontSize={14}
                                    lineHeight={18}
                                    fontWeight="600"
                                    text={CONTINUE}
                                />
                            }
                            onPress={onContinueTap}
                        />
                    </View>
                </ScreenLayout>
                {selectedData &&
                    selectedData.map((prop, index) => {
                        return (
                            <ScrollPickerView
                                key={`${index}-${prop?.transactionCode}`}
                                showMenu={prop.showPicker}
                                list={prop.displayValue}
                                selectedIndex={prop?.selectedVal?.selectedIndex ?? 0}
                                onRightButtonPress={handleDone}
                                onLeftButtonPress={handleCancel}
                                rightButtonText="Done"
                                leftButtonText="Cancel"
                            />
                        );
                    })}
            </>
        </ScreenContainer>
    );
}
const FLEX_START = "flex-start";
const styles = StyleSheet.create({
    actionContainer: {
        paddingBottom: 36,
        paddingHorizontal: 24,
    },
    container: {
        flex: 1,
    },
    copy: {
        paddingHorizontal: 36,
    },
    dropDownView: {
        marginTop: 20,
    },
    svContainer: {
        paddingHorizontal: 36,
    },
    titleText: {
        alignContent: FLEX_START,
        alignItems: FLEX_START,
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10,
        marginLeft: 0,
        marginTop: 5,
    },
    viewRowLeftItem: {
        alignItems: FLEX_START,
        flexDirection: "row",
        flex: 1,
        justifyContent: FLEX_START,
    },
    viewRowRightItem: {
        alignItems: "flex-end",
        flexDirection: "column",
    },
});

EZYPaySelectPlan.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
    getModel: PropTypes.any,
};

export default withModelContext(EZYPaySelectPlan);
