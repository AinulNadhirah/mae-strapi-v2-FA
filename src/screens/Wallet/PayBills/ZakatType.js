import PropTypes from "prop-types";
import React, { useCallback, useEffect, useReducer } from "react";
import { StyleSheet, View, Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import {
    PAYBILLS_MODULE,
    ZAKAT_MOBILE_NUMBER,
    ZAKAT_DETAILS,
    PAYBILLS_ENTER_AMOUNT,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import { ScrollPickerView } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import LabeledDropdown from "@components/FormComponents/LabeledDropdown";
import Typography from "@components/Text";

import { getZakatType, getZakatPayees } from "@services";
import { logEvent } from "@services/analytics";

import { YELLOW, DISABLED, MEDIUM_GREY, DISABLED_TEXT, BLACK } from "@constants/colors";
import {
    PLEASE_SELECT,
    CONTINUE,
    ZAKAT_BODY,
    ZAKAT,
    DONE,
    CANCEL,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    FA_PAY_ZAKAT_RECIPIENT_DETAILS,
} from "@constants/strings";

import { sortByPropName } from "@utils/array";

// Initial state object
const initialState = {
    // Zakat Body related
    zakatBody: PLEASE_SELECT,
    zakatBodyValue: null,
    zakatBodyValueIndex: 0,
    zakatBodyData: null,
    zakatBodyPicker: false,
    zakatBodyObj: null,

    // Zakat Type related
    zakatType: PLEASE_SELECT,
    zakatTypeValue: null,
    zakatTypeValueIndex: 0,
    zakatTypeData: null,
    zakatTypePicker: false,
    zakatTypeObj: null,

    // Others
    isFav: false,
    isContinueDisabled: true,
    pickerType: null,
    payeeTypeMapping: {},
};

function reducer(state, action) {
    const { actionType, payload } = action;

    switch (actionType) {
        case "ENABLE_DISABLE_CONTINUE":
            return {
                ...state,
                isContinueDisabled: payload,
            };
        case "HIDE_PICKER":
            return {
                ...state,
                pickerType: null,
                zakatBodyPicker: false,
                zakatTypePicker: false,
            };
        case "SHOW_PICKER":
            return {
                ...state,
                pickerType: payload,
                zakatBodyPicker: payload === "zakatBody",
                zakatTypePicker: payload === "zakatType",
            };
        case "SET_ZAKAT_BODY_DATA":
            return {
                ...state,
                zakatBodyData: payload,
            };
        case "SET_ZAKAT_TYPE_DATA":
            return {
                ...state,
                zakatTypeData: payload,
            };
        case "SET_ZAKAT_BODY":
        case "SET_ZAKAT_TYPE":
            return {
                ...state,
                ...payload,
            };
        case "SET_PAYEE_TYPE_MAPPING":
            return {
                ...state,
                payeeTypeMapping: payload,
            };
        default:
            return { ...state };
    }
}

function ZakatType({ route, navigation }) {
    const [state, dispatch] = useReducer(reducer, initialState);
    const { zakatBody, zakatBodyValue, zakatType, zakatTypeValue, isContinueDisabled, isFav } =
        state;

    useEffect(() => {
        init();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Used to check if all fields are filled in, then accordingly enable/disable "Continue" btn
    useEffect(() => {
        dispatch({
            actionType: "ENABLE_DISABLE_CONTINUE",
            payload: !zakatBodyValue || !zakatTypeValue,
        });
    }, [zakatBody, zakatBodyValue, zakatType, zakatTypeValue]);

    useEffect(() => {
        console.log("[ZakatType] >> [Event Handler For Zakat Body Value Change]");

        const payeeCode = state.zakatBodyObj?.payeeCode ?? null;

        console.tron.log("[ZakatType] >> payeeCode", payeeCode);
        // Call API to fetch Zakat type for selected payee
        if (payeeCode) fetchZakatType(payeeCode);
    }, [zakatBodyValue, state.zakatBodyObj, fetchZakatType]);

    useEffect(() => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_PAY_ZAKAT_RECIPIENT_DETAILS,
        });
    }, []);

    const init = () => {
        console.log("[ZakatType] >> [init]");

        const params = route?.params ?? {};
        const isFav = params?.isFav ?? false;

        if (isFav) {
            prepopulateZakatBody();
        } else {
            // Call API to fetch Zakat body data
            fetchZakatData();
        }
    };

    const fetchZakatData = () => {
        console.log("[ZakatType] >> [fetchZakatData]");

        // Avoid making API call again if data exists
        if (state.zakatBodyData) return;

        getZakatPayees()
            .then((response) => {
                console.log("[ZakatType][fetchZakatData] >> Success");

                const payeeList = response?.data?.resultList ?? [];

                if (payeeList instanceof Array) {
                    const zakatBodyData = massageZakatBodyData(payeeList);
                    dispatch({
                        actionType: "SET_ZAKAT_BODY_DATA",
                        payload: zakatBodyData,
                    });
                }
            })
            .catch((error) => {
                console.log("[ZakatType][fetchZakatData] >> Exception:", error);
            });
    };

    const massageZakatBodyData = (payeeList) => {
        console.log("[ZakatType] >> [massageZakatBodyData]");

        const sortedPayeeList = sortByPropName(payeeList, "fullName");

        const updatedArray = sortedPayeeList.map((item) => {
            const fullName = item?.fullName ? item.fullName.trim() : "";

            return {
                ...item,
                fullName,
                name: fullName,
                value: item?.payeeCode,
            };
        });

        return updatedArray;
    };

    const prepopulateZakatBody = () => {
        console.log("[ZakatType] >> [prepopulateZakatBody]");

        const params = route?.params ?? {};
        const billerInfo = params?.billerInfo ?? null;
        const fullName = billerInfo?.fullName ? billerInfo.fullName.trim() : "";

        const item = {
            ...billerInfo,
            fullName,
            name: fullName,
            value: billerInfo?.payeeCode,
        };

        // Prepopulate Zakat Body & disable it
        dispatch({
            actionType: "SET_ZAKAT_BODY",
            payload: {
                zakatBody: item?.name ?? PLEASE_SELECT,
                zakatBodyValue: item?.value ?? null,
                zakatBodyObj: item,

                isFav: true,

                // Reset Zakat Type after Zakat body selection
                zakatType: PLEASE_SELECT,
                zakatTypeValue: null,
                zakatTypeObj: null,
                zakatTypeData: null,
            },
        });
    };

    function onBackTap() {
        console.log("[ZakatType] >> [onBackTap]");

        navigation.goBack();
    }

    function onZakatBodyFieldTap() {
        console.log("[ZakatType] >> [onZakatBodyFieldTap]");

        dispatch({
            actionType: "SHOW_PICKER",
            payload: "zakatBody",
        });
    }

    function onZakatTypeFieldTap() {
        console.log("[ZakatType] >> [onZakatTypeFieldTap]");

        dispatch({
            actionType: "SHOW_PICKER",
            payload: "zakatType",
        });
    }

    function onPickerCancel() {
        console.log("[ZakatType] >> [onPickerCancel]");

        dispatch({
            actionType: "HIDE_PICKER",
            payload: true,
        });
    }

    const onPickerDone = (item, index) => {
        console.log("[ZakatType] >> [onPickerDone]");

        const { pickerType } = state;
        const value = item?.value ?? null;

        switch (pickerType) {
            case "zakatBody":
                if (value != state.zakatBodyValue) {
                    dispatch({
                        actionType: "SET_ZAKAT_BODY",
                        payload: {
                            zakatBody: item?.name ?? PLEASE_SELECT,
                            zakatBodyValue: value,
                            zakatBodyObj: item,
                            zakatBodyValueIndex: index,

                            // Reset Zakat Type after Zakat body selection
                            zakatType: PLEASE_SELECT,
                            zakatTypeValue: null,
                            zakatTypeObj: null,
                            zakatTypeData: null,
                            zakatTypeValueIndex: 0,
                        },
                    });
                }

                break;
            case "zakatType":
                if (value != state.zakatTypeValue) {
                    dispatch({
                        actionType: "SET_ZAKAT_TYPE",
                        payload: {
                            zakatType: item?.name ?? PLEASE_SELECT,
                            zakatTypeValue: value,
                            zakatTypeObj: item,
                            zakatTypeValueIndex: index,
                        },
                    });
                }
                break;
            default:
                break;
        }

        // Close picker
        onPickerCancel();
    };

    const fetchZakatType = useCallback(
        (payeeCode) => {
            console.log("[ZakatType] >> [fetchZakatType]");

            // TODO: Temporary - To be removed later
            // payeeCode = payeeCode.substring(0, 3);

            let { payeeTypeMapping } = state;

            // If previously fetched data is available, then avoid making API call
            if (
                Object.prototype.hasOwnProperty.call(payeeTypeMapping, payeeCode) &&
                payeeTypeMapping[payeeCode] instanceof Array &&
                payeeTypeMapping[payeeCode].length > 0
            ) {
                dispatch({
                    actionType: "SET_ZAKAT_TYPE_DATA",
                    payload: payeeTypeMapping[payeeCode],
                });
                return;
            }

            getZakatType(payeeCode)
                .then((response) => {
                    console.log("[ZakatType][fetchZakatType] >> Success");

                    const typesList = response?.data?.paymentTypes ?? [];
                    if (typesList instanceof Array) {
                        const zakatTypeData = massageZakatTypeData(typesList);
                        const validData =
                            zakatTypeData instanceof Array && zakatTypeData.length > 0;

                        // Update Zakat Type data
                        dispatch({
                            actionType: "SET_ZAKAT_TYPE_DATA",
                            payload: validData ? zakatTypeData : null,
                        });

                        if (validData) {
                            // Update mapping data to save locally
                            payeeTypeMapping[payeeCode] = zakatTypeData;
                            dispatch({
                                actionType: "SET_PAYEE_TYPE_MAPPING",
                                payload: payeeTypeMapping,
                            });
                        }
                    }
                })
                .catch((error) => {
                    console.log("[ZakatType][fetchZakatType] >> Exception:", error);
                });
        },
        [state]
    );

    const massageZakatTypeData = (typesList) => {
        console.log("[ZakatType] >> [massageZakatTypeData]");

        const sortedPayeeList = sortByPropName(typesList, "label");

        const updatedArray = sortedPayeeList.map((item) => {
            const zakatValues = item?.zakatValues ?? null;
            const zakatFlow = item?.zakatFlow ?? false;

            if (zakatFlow && zakatValues instanceof Array) {
                // Massage the rice type data
                const modifiedZakatValues = zakatValues.map((riceTypeItem) => {
                    const amount = riceTypeItem?.amount;
                    return {
                        ...riceTypeItem,
                        // name: `${riceTypeItem?.description ?? ""} - ${riceTypeItem?.label ?? ""}`,
                        name: `${riceTypeItem?.label ?? ""}`,
                        value: isNaN(amount) ? amount : parseFloat(amount),
                    };
                });

                return {
                    ...item,
                    name: item?.label,
                    value: item?.code,
                    riceTypeData: modifiedZakatValues,
                };
            } else {
                return {
                    ...item,
                    name: item?.label,
                    value: item?.code,
                    riceTypeData: zakatValues,
                };
            }
        });

        return updatedArray;
    };

    const getMobileNumberParams = () => {
        console.log("[ZakatType] >> [getMobileNumberParams]");

        // If not Fav flow, return empty object
        if (!isFav) return {};

        const { zakatBodyObj } = state;
        const mobileNumber = zakatBodyObj?.acctId ?? "";

        const trimmedMobileNumber = mobileNumber.replace(/\s/g, "");
        const fullMobileNumber = trimmedMobileNumber;
        const formattedMobileNumber = confirmationMobileNumberFormat(fullMobileNumber);

        return {
            mobileNumber: fullMobileNumber,
            formattedMobileNumber,
            requiredFields: [
                {
                    fieldName: "bilAcct",
                    fieldValue: fullMobileNumber,
                },
                {
                    fieldName: "billRef",
                    fieldValue: zakatTypeValue,
                },
            ],
        };
    };

    const confirmationMobileNumberFormat = (value) =>
        value
            .toString()
            .replace(/[^0-9]/g, "")
            .replace(/(\d{3})(\d{1,4})?(\d{1,4})?/, (_, p1, p2, p3) => {
                let output = "";
                if (p1) output = `${p1}`;
                if (p2) output += ` ${p2}`;
                if (p3) output += ` ${p3}`;
                return output;
            });

    function onContinue() {
        console.log("[ZakatType] >> [onContinue]");

        // // Retrieve form data
        const formData = getFormData();
        const mobileNumberParams = getMobileNumberParams();
        const navParams = {
            ...formData,
            ...mobileNumberParams,
        };

        if (formData?.zakatFitrahFlow) {
            // Navigate to Zakat Fitrah flow
            navigation.navigate(PAYBILLS_MODULE, {
                screen: ZAKAT_DETAILS,
                params: navParams,
            });
        } else {
            // Navigate to Other Zakat Flow
            navigation.navigate(PAYBILLS_MODULE, {
                screen: isFav ? PAYBILLS_ENTER_AMOUNT : ZAKAT_MOBILE_NUMBER,
                params: navParams,
            });
        }
    }

    const getFormData = () => {
        console.log("[ZakatType] >> [getFormData]");

        const { zakatBodyObj, zakatTypeObj } = state;
        const zakatMobNumTitle = `${zakatType.trim()}\n${zakatBody.trim()}`;
        const riceTypeData = zakatTypeObj?.riceTypeData;
        const zakatFlow = zakatTypeObj?.zakatFlow ?? false;

        return {
            ...route.params,
            zakatBody: zakatBody.trim(),
            zakatBodyValue,
            zakatType: zakatType.trim(),
            zakatTypeValue,

            zakatMobNumTitle,
            imageUrl: zakatBodyObj?.imageUrl ?? "",

            billerInfo: zakatBodyObj,
            zakatTypeObj,
            riceTypeData,
            zakatFitrahFlow: zakatFlow,
        };
    };

    return (
        <React.Fragment>
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                            headerCenterElement={
                                <Typography
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={19}
                                    text={ZAKAT}
                                />
                            }
                        />
                    }
                    paddingHorizontal={0}
                    paddingBottom={0}
                    paddingTop={0}
                    useSafeArea
                >
                    <React.Fragment>
                        <KeyboardAwareScrollView
                            behavior={Platform.OS == "ios" ? "padding" : ""}
                            enabled
                            showsVerticalScrollIndicator={false}
                            style={Style.scrollViewCls}
                        >
                            {/* Zakat body */}
                            <LabeledDropdown
                                label={ZAKAT_BODY}
                                dropdownValue={zakatBody}
                                onPress={onZakatBodyFieldTap}
                                style={Style.fieldViewCls}
                                disabled={isFav}
                            />

                            {/* Zakat Type */}
                            <LabeledDropdown
                                label="Zakat type"
                                dropdownValue={zakatType}
                                onPress={onZakatTypeFieldTap}
                                style={Style.fieldViewCls}
                            />
                        </KeyboardAwareScrollView>

                        {/* Bottom docked button container */}
                        <FixedActionContainer>
                            <View style={Style.bottomBtnContCls}>
                                <ActionButton
                                    disabled={isContinueDisabled}
                                    activeOpacity={isContinueDisabled ? 1 : 0.5}
                                    backgroundColor={isContinueDisabled ? DISABLED : YELLOW}
                                    fullWidth
                                    componentCenter={
                                        <Typography
                                            color={isContinueDisabled ? DISABLED_TEXT : BLACK}
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

            {/* Zakat Body Picker */}
            {state.zakatBodyData && (
                <ScrollPickerView
                    showMenu={state.zakatBodyPicker}
                    list={state.zakatBodyData}
                    selectedIndex={state.zakatBodyValueIndex}
                    onRightButtonPress={onPickerDone}
                    onLeftButtonPress={onPickerCancel}
                    rightButtonText={DONE}
                    leftButtonText={CANCEL}
                />
            )}

            {/* Zakat Type Picker */}
            {state.zakatTypeData && (
                <ScrollPickerView
                    showMenu={state.zakatTypePicker}
                    list={state.zakatTypeData}
                    selectedIndex={state.zakatTypeValueIndex}
                    onRightButtonPress={onPickerDone}
                    onLeftButtonPress={onPickerCancel}
                    rightButtonText={DONE}
                    leftButtonText={CANCEL}
                />
            )}
        </React.Fragment>
    );
}

ZakatType.propTypes = {
    navigation: PropTypes.shape({
        goBack: PropTypes.func,
        navigate: PropTypes.func,
    }),
    route: PropTypes.shape({
        params: PropTypes.object,
    }),
};

const Style = StyleSheet.create({
    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },

    fieldViewCls: {
        marginTop: 25,
    },

    scrollViewCls: {
        paddingHorizontal: 24,
    },
});

export default ZakatType;
