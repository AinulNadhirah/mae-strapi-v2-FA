import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import { ScrollPickerView } from "@components/Common";
import { Dropdown } from "@components/Common/DropDownButtonCenter";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import Typo from "@components/TextWithInfo";

import { useModelController, withModelContext } from "@context";

import { RemittanceAnalytics } from "@services/analytics/analyticsRemittance";

import { BLACK, DARK_GREY, DISABLED, DISABLED_TEXT, MEDIUM_GREY, YELLOW } from "@constants/colors";
import { CANCEL, CONTINUE, DONE, WESTERN_UNION, DROPDOWN_DEFAULT_TEXT } from "@constants/strings";

function WUTransferDetails() {
    const navigation = useNavigation();
    const route = useRoute();
    const { getModel, updateModel } = useModelController();
    const modelData = getModel("overseasTransfers");
    const { purposeCodeLists, WUTransferPurpose } = modelData || {};
    const [statePurposeTransfer, changeTransferPopupState] = useState(preLoadData());
    const {
        purposeList,
        subPurposeList,
        showPurposePopup,
        showSubPurposePopup,
        purposeSelectedIndex,
        subPurposeSelectedIndex,
        purposePlaceHolder,
        subPurposePlaceHolder,
    } = statePurposeTransfer;
    const isCTADisabled =
        !purposePlaceHolder || (subPurposeList?.length > 0 && !subPurposePlaceHolder);
    useEffect(() => {
        RemittanceAnalytics.trxDetailsLoaded("WU");

        if (subPurposeList.length === 0) {
            setHideSP(false);
        }
    }, [subPurposeList]);

    function preLoadData() {
        if (WUTransferPurpose?.transferPurpose) {
            const purposeIndex = purposeCodeLists.findIndex((item, i) => {
                return item.serviceName === WUTransferPurpose?.transferPurpose?.serviceName;
            });
            const subPurposeIndex =
                purposeIndex >= 0
                    ? purposeCodeLists[purposeIndex]?.subPurposeCodeList.findIndex((item) => {
                          return (
                              item.subServiceName ===
                              WUTransferPurpose?.transferSubPurpose?.subServiceName
                          );
                      })
                    : purposeIndex;

            return {
                purposeList: purposeCodeLists,
                subPurposeList:
                    purposeIndex >= 0 ? purposeCodeLists[purposeIndex].subPurposeCodeList : [],
                purposePlaceHolder: WUTransferPurpose?.transferPurpose?.serviceName,
                subPurposePlaceHolder: WUTransferPurpose?.transferSubPurpose?.subServiceName,
                purposeSelectedIndex: purposeIndex,
                subPurposeSelectedIndex: subPurposeIndex,
                showPurposePopup: false,
                showSubPurposePopup: false,
            };
        } else {
            return {
                purposeList: purposeCodeLists,
                subPurposeList: [],
                purposePlaceHolder: "",
                subPurposePlaceHolder: "",
                purposeSelectedIndex: 0,
                subPurposeSelectedIndex: -1,
                showPurposePopup: false,
                showSubPurposePopup: false,
            };
        }
    }

    function getHeaderUI() {
        return (
            <HeaderLayout
                headerLeftElement={
                    <HeaderBackButton
                        onPress={onBackButtonPress}
                        disabled={isCTADisabled && route?.params?.from === "WUConfirmation"}
                    />
                }
                headerCenterElement={
                    <Typo
                        color={DARK_GREY}
                        text="Step 5 of 5"
                        fontWeight="600"
                        fontSize={12}
                        lineHeight={18}
                    />
                }
            />
        );
    }

    function processPurposeList(inputList) {
        return inputList.map((item) => ({
            ...item,
            name: item?.serviceName,
        }));
    }

    function processSubpurposeList(inputList) {
        return inputList.map((item) => ({
            ...item,
            name: item?.subServiceName,
        }));
    }

    const onBackButtonPress = () => {
        const transferDetailsObj = {
            transferPurpose: purposePlaceHolder
                ? purposeList[purposeSelectedIndex]
                : WUTransferPurpose?.transferPurpose,
            transferSubPurpose: subPurposePlaceHolder
                ? subPurposeList[subPurposeSelectedIndex]
                : WUTransferPurpose?.transferSubPurpose,
        };
        updateModel({
            overseasTransfers: {
                WUTransferPurpose: transferDetailsObj,
            },
        });

        if (route?.params?.from === "WUConfirmation") {
            navigation.navigate(route?.params?.from, {
                ...route?.params,
                fromWUConfirmation: false,
                from: "",
            });
            return;
        }

        if (route?.params?.favorite) {
            navigation.navigate("OverseasProductListScreen", {
                ...route?.params,
            });
            return;
        }

        navigation.navigate("WURecipientDetails", {
            ...route?.params,
        });
    };

    function onPressPurposeTransfer() {
        changeTransferPopupState((prevState) => ({ ...prevState, showPurposePopup: true }));
    }

    function onPressSubPurposeTransfer() {
        changeTransferPopupState((prevState) => ({ ...prevState, showSubPurposePopup: true }));
    }

    const [hideSubPurpose, setHideSP] = useState(true);

    function onHandlePurposeDone(item, index) {
        const purposeTransferData = processPurposeList(purposeList);
        const selectedItem = purposeTransferData[purposeSelectedIndex]?.name
            ? purposeTransferData[purposeSelectedIndex]
            : purposeTransferData[0];
        changeTransferPopupState((prevState) =>
            selectedItem?.name
                ? {
                      ...prevState,
                      purposePlaceHolder: selectedItem.name,
                      purposeSelectedIndex,
                      subPurposeList: selectedItem?.subPurposeCodeList,
                      subPurposePlaceHolder: "",
                      subPurposeSelectedIndex: -1,
                      showPurposePopup: false,
                  }
                : { ...prevState, showPurposePopup: false }
        );
        setHideSP(selectedItem?.subPurposeCodeList.length > 0 ? true : false);
    }
    function onHandleSubPurposeDone(item, index) {
        const subPurposeTransferData = processSubpurposeList(subPurposeList);
        const selectedItem = subPurposeTransferData[subPurposeSelectedIndex ?? 0]?.name
            ? subPurposeTransferData[subPurposeSelectedIndex]
            : subPurposeTransferData[0];
        changeTransferPopupState((prevState) =>
            selectedItem?.name
                ? {
                      ...prevState,
                      subPurposePlaceHolder: selectedItem.name,
                      subPurposeSelectedIndex:
                          subPurposeSelectedIndex >= 0 ? subPurposeSelectedIndex : 0,
                      showSubPurposePopup: false,
                  }
                : { ...prevState, showSubPurposePopup: false }
        );
    }
    function onHandlePurposeCancel() {
        changeTransferPopupState((prevState) => ({ ...prevState, showPurposePopup: false }));
    }

    function onHandleSubPurposeCancel() {
        changeTransferPopupState((prevState) => ({ ...prevState, showSubPurposePopup: false }));
    }

    function onContinue() {
        const transferDetailsObj = {
            transferPurpose: purposeList[purposeSelectedIndex],
            transferSubPurpose: subPurposeList[subPurposeSelectedIndex],
        };
        updateModel({
            overseasTransfers: {
                WUTransferPurpose: transferDetailsObj,
            },
        });

        if (route?.params?.from === "WUConfirmation") {
            if (route?.params?.callBackFunction) {
                route.params.callBackFunction(transferDetailsObj);
            }
            navigation.navigate(route?.params?.from, {
                ...route?.params,
                from: "",
            });
        } else {
            navigation.navigate("WUConfirmation", {
                ...route?.params,
            });
        }
    }

    const onChangePurpose = useCallback((data, selectedIndex) => {
        changeTransferPopupState((prevState) => ({
            ...prevState,
            purposeSelectedIndex: selectedIndex,
        }));
    }, []);

    const onChangeSubPurpose = useCallback((data, selectedIndex) => {
        changeTransferPopupState((prevState) => ({
            ...prevState,
            subPurposeSelectedIndex: selectedIndex,
        }));
    }, []);

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <ScreenLayout
                paddingBottom={0}
                paddingTop={16}
                paddingHorizontal={0}
                useSafeArea
                header={getHeaderUI()}
            >
                <ScrollView
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                >
                    <Typo
                        text={WESTERN_UNION}
                        textAlign="left"
                        fontSize={14}
                        lineHeight={18}
                        fontWeight="400"
                    />
                    <Typo
                        style={styles.pageTitle}
                        textAlign="left"
                        text="Please fill in transfer details"
                        fontWeight="600"
                        fontSize={16}
                        lineHeight={20}
                    />
                    <Typo
                        style={styles.popUpTitle}
                        textAlign="left"
                        text="Purpose of transfer"
                        fontSize={14}
                        fontWeight="400"
                        lineHeight={18}
                    />
                    <Dropdown
                        title={purposePlaceHolder || DROPDOWN_DEFAULT_TEXT}
                        align="left"
                        borderWidth={0.5}
                        onPress={onPressPurposeTransfer}
                    />
                    {!!purposePlaceHolder && hideSubPurpose && (
                        <>
                            <Typo
                                style={styles.popUpTitle}
                                textAlign="left"
                                text="Sub purpose"
                                fontSize={14}
                                fontWeight="400"
                                lineHeight={18}
                            />
                            <Dropdown
                                title={subPurposePlaceHolder || DROPDOWN_DEFAULT_TEXT}
                                align="left"
                                borderWidth={0.5}
                                onPress={onPressSubPurposeTransfer}
                            />
                        </>
                    )}
                </ScrollView>
                <FixedActionContainer>
                    <ActionButton
                        disabled={isCTADisabled}
                        backgroundColor={isCTADisabled ? DISABLED : YELLOW}
                        fullWidth
                        componentCenter={
                            <Typo
                                color={isCTADisabled ? DISABLED_TEXT : BLACK}
                                lineHeight={18}
                                fontWeight="600"
                                fontSize={14}
                                text={CONTINUE}
                            />
                        }
                        onPress={onContinue}
                    />
                </FixedActionContainer>
            </ScreenLayout>
            <ScrollPickerView
                showMenu={showPurposePopup}
                list={processPurposeList(purposeList)}
                selectedIndex={purposeSelectedIndex}
                onRightButtonPress={onHandlePurposeDone}
                onLeftButtonPress={onHandlePurposeCancel}
                rightButtonText={DONE}
                leftButtonText={CANCEL}
                onValueChange={onChangePurpose}
            />
            <ScrollPickerView
                showMenu={showSubPurposePopup}
                list={processSubpurposeList(subPurposeList)}
                selectedIndex={subPurposeSelectedIndex}
                onRightButtonPress={onHandleSubPurposeDone}
                onLeftButtonPress={onHandleSubPurposeCancel}
                rightButtonText={DONE}
                leftButtonText={CANCEL}
                onValueChange={onChangeSubPurpose}
            />
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    contentContainer: {
        paddingBottom: 25,
        paddingHorizontal: 24,
    },
    pageTitle: { marginTop: 4 },
    popUpTitle: { marginBottom: 8, marginTop: 24 },
});

export default withModelContext(WUTransferDetails);
