import AsyncStorage from "@react-native-community/async-storage";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { StyleSheet, View, ScrollView, Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useDispatch, useSelector } from "react-redux";

import { isNTBUser, getAnalyticScreenName } from "@screens/Premier/helpers/premierHelpers";

import {
    PREMIER_ACCOUNT_DETAILS,
    PREMIER_EMPLOYMENT_DETAILS,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import { ScrollPickerView } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import TitleAndDropdownPill from "@components/SSL/TitleAndDropdownPill";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";
import { showErrorToast } from "@components/Toast";

import { MASTERDATA_UPDATE_SOURCE_OF_FUND_COUNTRY } from "@redux/actions/services/masterDataAction";
import { PREPOSTQUAL_CLEAR } from "@redux/actions/services/prePostQualAction";
import employmentDetailsProps from "@redux/connectors/ZestCASA/employmentDetailsConnector";
import entryProps from "@redux/connectors/ZestCASA/entryConnector";
import downTimeServiceProps, {
    downTimeServicePropTypes,
} from "@redux/connectors/services/downTimeConnector";
import masterDataServiceProps, {
    masterDataServicePropTypes,
} from "@redux/connectors/services/masterDataConnector";

import { BLACK, DARK_GREY, DISABLED, YELLOW } from "@constants/colors";
import { PMA_NTB_USER, PREMIER_CLEAR_ALL } from "@constants/premierConfiguration";
import {
    PM1_APPLICATION_TITLE,
    PMA_APPLICATION_TITLE,
    KAWANKU_SAVINGS_APPLICATION_TITLE,
    KAWANKU_SAVINGSI_APPLICATION_TITLE,
    MINIMUM_INCOME_TEXT,
    STEP3OF4,
} from "@constants/premierStrings";
import {
    CONTINUE,
    FILL_IN_EMPLOYMENT_DETAILS,
    PLEASE_SELECT,
    PLSTP_EMPLOYER_NAME,
    MAYBANK,
    STEPUP_MAE_OCUPATION,
    STEPUP_MAE_SECTOR,
    ZEST_EMPLOYMENT_TYPE,
    ZEST_MONTHLY_INCOME,
    INCOME_SOURCE,
    DONE,
    CANCEL,
    STEP2OF3,
} from "@constants/strings";

const PremierEmploymentDetails = (props) => {
    const { navigation } = props;

    // Hooks to access reducer data
    const prePostQualReducer = useSelector((state) => state.prePostQualReducer);
    const entryReducer = useSelector((state) => state.zestCasaReducer.entryReducer);
    const { userStatus } = prePostQualReducer;

    // Hooks to dispatch reducer action
    const dispatch = useDispatch();

    const {
        employerName,
        occupationIndex,
        occupation,
        sectorIndex,
        sector,
        employmentTypeIndex,
        employmentType,
        monthlyIncomeIndex,
        incomeRange,
        incomeSourceIndex,
        sourceOfFundCountry,
    } = props;

    const scrollPickerInitialState = {
        isDisplay: false,
        selectedIndex: 0,
        filterType: "",
        data: [],
    };

    const [occupationScrollPicker, setOccupationScrollPicker] = useState(scrollPickerInitialState);

    const [sectorScrollPicker, setSectorScrollPicker] = useState(scrollPickerInitialState);

    const [employmentTypeScrollPicker, setEmploymentTypeScrollPicker] =
        useState(scrollPickerInitialState);

    const [monthlyIncomeScrollPicker, setMonthlyIncomeScrollPicker] =
        useState(scrollPickerInitialState);

    const [incomeSourceScrollPicker, setIncomeSourceScrollPicker] =
        useState(scrollPickerInitialState);

    const [employementDetailsObject, setemployementDetailsObject] = useState({});
    const [accountBackupData, setaccountBackupData] = useState({});

    useEffect(() => {
        init();
        setemployementDetailsObject({
            employerName,
            occupationIndex,
            occupation,
            sectorIndex,
            sector,
            employmentTypeIndex,
            employmentType,
            monthlyIncomeIndex,
            incomeRange,
            incomeSourceIndex,
            sourceOfFundCountry,
        });
    }, []);

    useEffect(() => {
        props.checkButtonEnabled();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        employerName,
        occupationIndex,
        sectorIndex,
        employmentTypeIndex,
        monthlyIncomeIndex,
        incomeSourceIndex,
    ]);

    const init = async () => {
        let position = -1;
        const malaysiaItem = props.sourceOfFundCountry?.find((item, index) => {
            const { name } = item;
            if (name.toLowerCase() === "malaysia") {
                position = index;
                return item;
            }
        });

        let sourceOfFundCountry = props.sourceOfFundCountry?.filter(
            (item) => item.name.toLowerCase() !== "malaysia"
        );
        sourceOfFundCountry = [malaysiaItem, ...sourceOfFundCountry];
        dispatch({
            type: MASTERDATA_UPDATE_SOURCE_OF_FUND_COUNTRY,
            sourceOfFundCountry,
        });

        if (position !== -1 && props.incomeSourceValue?.name?.toLowerCase() === "malaysia") {
            props.updateIncomeSource(0, malaysiaItem);
        }
        if (props.isFromConfirmationScreenForEmploymentDetails) {
            getInfo();
        }
        console.log("[PremierEmploymentDetails] >> [init]");
    };

    const getInfo = async () => {
        const temp = await AsyncStorage.getItem("employeeDetailBackup");
        const parseTemp = JSON.parse(temp);
        setaccountBackupData(parseTemp);
    };

    function onBackTap() {
        console.log("[PremierEmploymentDetails] >> [onBackTap]");
        if (props.isFromConfirmationScreenForEmploymentDetails) {
            if (employerName !== employementDetailsObject.employerName) {
                props.updateEmployerName(employementDetailsObject.employerName);
            }
            if (occupationIndex !== employementDetailsObject.occupationIndex) {
                props.updateOccupation(
                    employementDetailsObject.occupationIndex,
                    employementDetailsObject.occupation[employementDetailsObject.occupationIndex]
                );
            }
            if (sectorIndex !== employementDetailsObject.sectorIndex) {
                props.updateSector(
                    employementDetailsObject.sectorIndex,
                    employementDetailsObject.sector[employementDetailsObject.sectorIndex]
                );
            }
            if (employmentTypeIndex !== employementDetailsObject.employmentTypeIndex) {
                props.updateEmploymentType(
                    employementDetailsObject.employmentTypeIndex,
                    employementDetailsObject.employmentType[
                        employementDetailsObject.employmentTypeIndex
                    ]
                );
            }
            if (monthlyIncomeIndex !== employementDetailsObject.monthlyIncomeIndex) {
                props.updateMonthlyIncome(
                    employementDetailsObject.monthlyIncomeIndex,
                    employementDetailsObject.incomeRange[
                        employementDetailsObject.monthlyIncomeIndex
                    ]
                );
            }
            props.updateIncomeSource(
                accountBackupData.incomeSourceIndex,
                accountBackupData.incomeSourceValue
            );
        }
        navigation.goBack();
    }

    function onCloseTap() {
        // Clear all data from Premier reducers
        dispatch({ type: PREMIER_CLEAR_ALL });
        props.clearDownTimeReducer();
        props.clearMasterDataReducer();
        dispatch({ type: PREPOSTQUAL_CLEAR });
        navigation.popToTop();
        navigation.goBack();
    }

    function onNextTap() {
        if (entryReducer.isKawanku || entryReducer.isKawankuSavingsI) {
            // For Kawanku & SavingsI
            if (props.isEmploymentContinueButtonEnabled) {
                const objAsyncStorage = {};
                objAsyncStorage.incomeSourceIndex = props?.incomeSourceIndex;
                objAsyncStorage.incomeSourceValue = props?.incomeSourceValue;
                setInfo(objAsyncStorage);

                props.isFromConfirmationScreenForEmploymentDetails
                    ? navigation.goBack()
                    : navigation.navigate(PREMIER_ACCOUNT_DETAILS);
            }
        } else {
            // For PM1 & PMA
            if (monthlyIncomeIndex >= 6 && props.isEmploymentContinueButtonEnabled) {
                props.isFromConfirmationScreenForEmploymentDetails
                    ? navigation.goBack()
                    : navigation.navigate(PREMIER_ACCOUNT_DETAILS);
            } else {
                if (monthlyIncomeIndex < 6 && props.isEmploymentContinueButtonEnabled) {
                    return showErrorToast({
                        message: MINIMUM_INCOME_TEXT,
                    });
                }
            }
        }
    }

    const setInfo = async (newData) => {
        try {
            await AsyncStorage.setItem("employeeDetailBackup", JSON.stringify(newData));
        } catch (error) {
            console.log(error);
        }
    };

    function getProductTitle() {
        if (entryReducer.isPM1) {
            return PM1_APPLICATION_TITLE;
        } else if (entryReducer.isPMA) {
            return PMA_APPLICATION_TITLE;
        } else if (entryReducer.isKawanku) {
            return KAWANKU_SAVINGS_APPLICATION_TITLE;
        } else if (entryReducer.isKawankuSavingsI) {
            return KAWANKU_SAVINGSI_APPLICATION_TITLE;
        }
    }

    const stepCount = () => {
        if (userStatus === PMA_NTB_USER) {
            return STEP3OF4;
        } else {
            return isNTBUser(userStatus) ? STEP3OF4 : STEP2OF3;
        }
    };

    function onEmployerInputDidChange(value) {
        props.updateEmployerName(value);
    }

    function onOccupationDropdownPillDidTap() {
        setOccupationScrollPicker({
            isDisplay: true,
            selectedIndex: props.occupationIndex,
            filterType: "",
            data: props.occupation,
        });
    }

    function onSectorDropdownPillDidTap() {
        setSectorScrollPicker({
            isDisplay: true,
            selectedIndex: props.sectorIndex,
            filterType: "",
            data: props.sector,
        });
    }

    function onEmploymentTypeDropdownPillDidTap() {
        setEmploymentTypeScrollPicker({
            isDisplay: true,
            selectedIndex: props.employmentTypeIndex,
            filterType: "",
            data: props.employmentType,
        });
    }

    function onMonthlyIncomeDropdownPillDidTap() {
        setMonthlyIncomeScrollPicker({
            isDisplay: true,
            selectedIndex: props.monthlyIncomeIndex,
            filterType: "",
            data: props.incomeRange,
        });
    }

    function onIncomeSourceDropdownPillDidTap() {
        setIncomeSourceScrollPicker({
            isDisplay: true,
            selectedIndex: props.incomeSourceIndex,
            filterType: "",
            data: props.sourceOfFundCountry,
        });
    }

    function onOccupationScrollPickerDoneButtonDidTap(data, index) {
        props.updateOccupation(index, data);
        setOccupationScrollPicker({
            isDisplay: false,
            selectedIndex: 0,
            filterType: "",
            data: [],
        });
    }

    function onSectorScrollPickerDoneButtonDidTap(data, index) {
        props.updateSector(index, data);
        setSectorScrollPicker({
            isDisplay: false,
            selectedIndex: 0,
            filterType: "",
            data: [],
        });
    }

    function onEmploymentTypeScrollPickerDoneButtonDidTap(data, index) {
        props.updateEmploymentType(index, data);
        setEmploymentTypeScrollPicker({
            isDisplay: false,
            selectedIndex: 0,
            filterType: "",
            data: [],
        });
    }

    function onMonthlyIncomeScrollPickerDoneButtonDidTap(data, index) {
        props.updateMonthlyIncome(index, data);
        setMonthlyIncomeScrollPicker({
            isDisplay: false,
            selectedIndex: 0,
            filterType: "",
            data: [],
        });
    }

    function onIncomeSourceScrollPickerDoneButtonDidTap(data, index) {
        props.updateIncomeSource(index, data);
        setIncomeSourceScrollPicker({
            isDisplay: false,
            selectedIndex: 0,
            filterType: "",
            data: [],
        });
    }

    function onScrollPickerCancelButtonDidTap() {
        setOccupationScrollPicker({
            isDisplay: false,
            selectedIndex: 0,
            filterType: "",
            data: [],
        });

        setSectorScrollPicker({
            isDisplay: false,
            selectedIndex: 0,
            filterType: "",
            data: [],
        });

        setMonthlyIncomeScrollPicker({
            isDisplay: false,
            selectedIndex: 0,
            filterType: "",
            data: [],
        });

        setIncomeSourceScrollPicker({
            isDisplay: false,
            selectedIndex: 0,
            filterType: "",
            data: [],
        });

        setEmploymentTypeScrollPicker({
            isDisplay: false,
            selectedIndex: 0,
            filterType: "",
            data: [],
        });
    }

    const analyticScreenName = getAnalyticScreenName(entryReducer, PREMIER_EMPLOYMENT_DETAILS, "");

    return (
        <ScreenContainer backgroundType="color" analyticScreenName={analyticScreenName}>
            <ScreenLayout
                header={
                    <HeaderLayout
                        headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                        headerCenterElement={
                            <Typo
                                fontSize={12}
                                fontWeight="600"
                                lineHeight={15}
                                text={stepCount()}
                                color={DARK_GREY}
                            />
                        }
                        headerRightElement={<HeaderCloseButton onPress={onCloseTap} />}
                    />
                }
                paddingHorizontal={0}
                paddingBottom={0}
                paddingTop={0}
                useSafeArea
            >
                <ScrollView showsVerticalScrollIndicator={false}>
                    <KeyboardAwareScrollView
                        behavior={Platform.OS === "ios" ? "padding" : ""}
                        enabled
                    >
                        <View style={Style.formContainer}>
                            <View style={Style.contentContainer}>
                                <Typo
                                    fontSize={14}
                                    fontWeight="400"
                                    lineHeight={21}
                                    textAlign="left"
                                    text={getProductTitle()}
                                />
                                <SpaceFiller height={4} />
                                <Typo
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={24}
                                    textAlign="left"
                                    text={FILL_IN_EMPLOYMENT_DETAILS}
                                />
                                <SpaceFiller height={24} />
                                {buildEmploymentDetailsForm()}
                            </View>
                        </View>
                    </KeyboardAwareScrollView>
                </ScrollView>

                <FixedActionContainer>
                    <View style={Style.bottomBtnContCls}>
                        <ActionButton
                            activeOpacity={props.isEmploymentContinueButtonEnabled ? 1 : 0.5}
                            backgroundColor={
                                props.isEmploymentContinueButtonEnabled ? YELLOW : DISABLED
                            }
                            fullWidth
                            componentCenter={
                                <Typo
                                    fontSize={14}
                                    lineHeight={18}
                                    fontWeight="600"
                                    text={CONTINUE}
                                />
                            }
                            onPress={onNextTap}
                        />
                    </View>
                </FixedActionContainer>
            </ScreenLayout>
            <ScrollPickerView
                showMenu={occupationScrollPicker.isDisplay}
                list={occupationScrollPicker.data}
                selectedIndex={occupationScrollPicker.selectedIndex}
                onRightButtonPress={onOccupationScrollPickerDoneButtonDidTap}
                onLeftButtonPress={onScrollPickerCancelButtonDidTap}
                rightButtonText={DONE}
                leftButtonText={CANCEL}
            />
            <ScrollPickerView
                showMenu={sectorScrollPicker.isDisplay}
                list={sectorScrollPicker.data}
                selectedIndex={sectorScrollPicker.selectedIndex}
                onRightButtonPress={onSectorScrollPickerDoneButtonDidTap}
                onLeftButtonPress={onScrollPickerCancelButtonDidTap}
                rightButtonText={DONE}
                leftButtonText={CANCEL}
            />
            <ScrollPickerView
                showMenu={employmentTypeScrollPicker.isDisplay}
                list={employmentTypeScrollPicker.data}
                selectedIndex={employmentTypeScrollPicker.selectedIndex}
                onRightButtonPress={onEmploymentTypeScrollPickerDoneButtonDidTap}
                onLeftButtonPress={onScrollPickerCancelButtonDidTap}
                rightButtonText={DONE}
                leftButtonText={CANCEL}
            />
            <ScrollPickerView
                showMenu={monthlyIncomeScrollPicker.isDisplay}
                list={monthlyIncomeScrollPicker.data}
                selectedIndex={monthlyIncomeScrollPicker.selectedIndex}
                onRightButtonPress={onMonthlyIncomeScrollPickerDoneButtonDidTap}
                onLeftButtonPress={onScrollPickerCancelButtonDidTap}
                rightButtonText={DONE}
                leftButtonText={CANCEL}
            />
            <ScrollPickerView
                showMenu={incomeSourceScrollPicker.isDisplay}
                list={incomeSourceScrollPicker.data}
                selectedIndex={incomeSourceScrollPicker.selectedIndex}
                onRightButtonPress={onIncomeSourceScrollPickerDoneButtonDidTap}
                onLeftButtonPress={onScrollPickerCancelButtonDidTap}
                rightButtonText={DONE}
                leftButtonText={CANCEL}
            />
        </ScreenContainer>
    );

    function buildEmploymentDetailsForm() {
        return (
            <>
                <Typo
                    fontSize={14}
                    fontWeight="400"
                    lineHeight={18}
                    textAlign="left"
                    text={PLSTP_EMPLOYER_NAME}
                    color={BLACK}
                />
                <SpaceFiller height={12} />
                <TextInput
                    errorMessage={props.employerNameErrorMessage}
                    isValid={props.employerNameErrorMessage === null}
                    isValidate
                    maxLength={50}
                    value={props.employerName}
                    placeholder={`e.g ${MAYBANK}`}
                    onChangeText={onEmployerInputDidChange}
                />
                <TitleAndDropdownPill
                    title={STEPUP_MAE_OCUPATION}
                    titleFontWeight="400"
                    dropdownTitle={props?.occupationValue?.name ?? PLEASE_SELECT}
                    dropdownOnPress={onOccupationDropdownPillDidTap}
                />
                <TitleAndDropdownPill
                    title={STEPUP_MAE_SECTOR}
                    titleFontWeight="400"
                    dropdownTitle={props?.sectorValue?.name ?? PLEASE_SELECT}
                    dropdownOnPress={onSectorDropdownPillDidTap}
                />
                <TitleAndDropdownPill
                    title={ZEST_EMPLOYMENT_TYPE}
                    titleFontWeight="400"
                    dropdownTitle={props?.employmentTypeValue?.name ?? PLEASE_SELECT}
                    dropdownOnPress={onEmploymentTypeDropdownPillDidTap}
                />
                <TitleAndDropdownPill
                    title={ZEST_MONTHLY_INCOME}
                    titleFontWeight="400"
                    dropdownTitle={props?.monthlyIncomeValue?.name ?? PLEASE_SELECT}
                    dropdownOnPress={onMonthlyIncomeDropdownPillDidTap}
                />
                <TitleAndDropdownPill
                    title={INCOME_SOURCE}
                    titleFontWeight="400"
                    dropdownTitle={props?.incomeSourceValue?.name ?? PLEASE_SELECT}
                    dropdownOnPress={onIncomeSourceDropdownPillDidTap}
                />
            </>
        );
    }
};

export const employmentDetailsPropTypes = (PremierEmploymentDetails.propTypes = {
    ...masterDataServicePropTypes,
    ...downTimeServicePropTypes,

    // State
    employerName: PropTypes.string,
    occupationIndex: PropTypes.number,
    occupationValue: PropTypes.object,
    sectorIndex: PropTypes.number,
    sectorValue: PropTypes.object,
    employmentTypeIndex: PropTypes.number,
    employmentTypeValue: PropTypes.object,
    monthlyIncomeIndex: PropTypes.number,
    monthlyIncomeValue: PropTypes.object,
    incomeSourceIndex: PropTypes.number,
    incomeSourceValue: PropTypes.object,
    isEmploymentContinueButtonEnabled: PropTypes.bool,
    isFromConfirmationScreenForEmploymentDetails: PropTypes.bool,
    employerNameErrorMessage: PropTypes.string,
    occupationDropdownItems: PropTypes.array,
    sectorDropdownItems: PropTypes.array,
    employmentTypeDropdownItems: PropTypes.array,
    monthlyIncomeDropdownItems: PropTypes.array,
    incomeSourceDropdownItems: PropTypes.array,

    // Dispatch
    getOccupationDropdownItems: PropTypes.func,
    updateEmployerName: PropTypes.func,
    updateOccupation: PropTypes.func,
    updateSector: PropTypes.func,
    updateEmploymentType: PropTypes.func,
    updateMonthlyIncome: PropTypes.func,
    updateIncomeSource: PropTypes.func,
    checkButtonEnabled: PropTypes.func,
    clearEmploymentReducer: PropTypes.func,
    updateConfirmationScreenStatusForEmploymentDetails: PropTypes.func,
});

const Style = StyleSheet.create({
    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },

    contentContainer: {
        marginHorizontal: 24,
    },

    formContainer: {
        marginBottom: 40,
    },
});

export default masterDataServiceProps(
    downTimeServiceProps(entryProps(employmentDetailsProps(PremierEmploymentDetails)))
);
