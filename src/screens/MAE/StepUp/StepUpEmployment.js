import React, { Component } from "react";
import { Keyboard, Platform, ScrollView, StyleSheet, View, Modal } from "react-native";

import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import LabeledDropdown from "@components/FormComponents/LabeledDropdown";
import { LongTextInput } from "@components/Common";
import ScreenLayout from "@layouts/ScreenLayout";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ActionButton from "@components/Buttons/ActionButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";
import HeaderLayout from "@layouts/HeaderLayout";
import { ScrollPickerView } from "@components/Common";

import { YELLOW, MEDIUM_GREY, DISABLED } from "@constants/colors";
import {
    PLEASE_SELECT,
    STEPUP_MAE_EMPLOYEE,
    STEPUP_MAE_EMPLOYER_NAME,
    STEPUP_MAE_MONTHLY_INCOME,
    STEPUP_MAE_OCUPATION,
    STEPUP_MAE_SECTOR,
    CONTINUE,
    DONE,
    CANCEL,
} from "@constants/strings";
import { MAE_SETEPUP_BRANCH } from "@navigation/navigationConstant";
import { isEmpty } from "@utils/dataModel/utility";
import { leadingOrDoubleSpaceRegex, employerNameSpclCharRegex } from "@utils/dataModel";

class StepUpEmployment extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // Employee Type
            employeeType: PLEASE_SELECT,
            employementValue: "",
            showEmployeeTypePicker: false,
            employeeTypeData: null,

            // Employer Name
            empName: "",
            empNameValid: true,
            empNameErrorMsg: "",
            isValidName: "",

            // Monthly Income
            monthlyIncome: PLEASE_SELECT,
            incomeValue: "",
            showIncomePicker: false,
            incomeData: null,

            // Occupation
            ocupation: PLEASE_SELECT,
            ocupationValue: "",
            showOccupationPicker: false,
            occupationData: null,

            // Sector
            sector: PLEASE_SELECT,
            sectorValue: "",
            showSectorPicker: false,
            sectorData: null,

            // Others
            type: "",
            isContinueDisabled: true,
        };
    }

    componentDidMount = () => {
        console.log("[StepUpEmployment] >> [componentDidMount]");

        // Call method to manage data after init
        this.manageDataOnInit();
    };

    manageDataOnInit = async () => {
        console.log("[StepUpEmployment] >> [manageDataOnInit]");

        const { masterdata, stepup_details } = this.props?.route?.params ?? {};
        const { employmentType, incomeRange, sector } = masterdata;
        const { empType, employerName, monthlyIncome, occupation, occupationSector } =
            stepup_details;
        const occupationData = masterdata.occupation;

        // Retrieve dropdown data
        const {
            employmentTypePickerData,
            incomeRangePickerData,
            occupationPickerData,
            sectorPickerData,
        } = this.getDropdownData(masterdata);

        // Retrieve default values
        const employeeTypeDefault = await this.getDefaultValue(employmentType, empType);
        const incomeDefault = await this.getDefaultValue(incomeRange, monthlyIncome);
        const occupationDefault = await this.getDefaultValue(occupationData, occupation);
        const sectorDefault = await this.getDefaultValue(sector, occupationSector);

        // Update state data from enquiry
        this.setState(
            {
                empName: employerName ?? "",

                employeeType: employeeTypeDefault.display,
                employementValue: employeeTypeDefault.value,
                employeeTypeData: employmentTypePickerData,

                monthlyIncome: incomeDefault.display,
                incomeValue: incomeDefault.value,
                incomeData: incomeRangePickerData,

                ocupation: occupationDefault.display,
                ocupationValue: occupationDefault.value,
                occupationData: occupationPickerData,

                sector: sectorDefault.display,
                sectorValue: sectorDefault.value,
                sectorData: sectorPickerData,
            },
            () => {
                this.enableDisableBtn();
            }
        );
    };

    getDropdownData = (masterdata) => {
        console.log("[StepUpEmployment] >> [getDropdownData]");

        const { employmentType, incomeRange, occupation, sector } = masterdata;

        const employmentTypePickerData = employmentType.map((item) => {
            return {
                ...item,
                title: item?.display ?? "",
                name: item?.display ?? "",
            };
        });

        const incomeRangePickerData = incomeRange.map((item) => {
            return {
                ...item,
                title: item?.display ?? "",
                name: item?.display ?? "",
            };
        });

        const occupationPickerData = occupation.map((item) => {
            return {
                ...item,
                title: item?.display ?? "",
                name: item?.display ?? "",
            };
        });

        const sectorPickerData = sector.map((item) => {
            return {
                ...item,
                title: item?.display ?? "",
                name: item?.display ?? "",
            };
        });

        return {
            employmentTypePickerData,
            incomeRangePickerData,
            occupationPickerData,
            sectorPickerData,
        };
    };

    getDefaultValue = (dataArray, value, defaultTitle = PLEASE_SELECT, defaultValue = null) => {
        console.log("[StepUpEmployment] >> [getDefaultValue]");

        const defaultObj = { display: defaultTitle, name: defaultTitle, value: defaultValue };

        const findRecord = dataArray.find((item) => {
            const itemValue = item?.value ?? null;
            return value && itemValue && value.toLowerCase() === itemValue.toLowerCase();
        });
        if (!findRecord) return defaultObj;

        return {
            ...findRecord,
            name: findRecord?.display,
        };
    };

    /* EVENT HANDLERS */

    onBackButtonPress = () => {
        console.log("[StepUpEmployment] >> [onBackButtonPress]");

        this.props.navigation.goBack();
    };

    onContinueButtonPress = () => {
        console.log("[StepUpEmployment] >> [onContinueButtonPress]");

        var isValidForm = this.isEmployementFormValidation();
        if (isValidForm) {
            const params = this.props?.route?.params ?? {};
            const formData = this.getFormData();

            this.props.navigation.navigate(MAE_SETEPUP_BRANCH, {
                ...params,
                employementDetails: formData,
            });
        }
    };

    getFormData = () => {
        console.log("[StepUpEmployment] >> [getFormData]");

        const { employementValue, empName, incomeValue, ocupationValue, sectorValue } = this.state;
        const employementDetails = {
            employementValue: employementValue,
            employeerName: empName.trim(),
            incomeValue: incomeValue,
            ocupationValue: ocupationValue,
            sectorValue: sectorValue,
        };
        return employementDetails;
    };

    onEmpTypeFieldTap = () => this.onSelectCmpPressed("employeeType");

    onMonthlyIncomeFieldTap = () => this.onSelectCmpPressed("monthlyIncome");

    onOccupationFieldTap = () => this.onSelectCmpPressed("ocupation");

    onSectorFieldTap = () => this.onSelectCmpPressed("sector");

    onSelectCmpPressed = (type) => {
        console.log("[StepUpEmployment] >> [onSelectCmpPressed]");

        Keyboard.dismiss();

        const { employeeTypeData, incomeData, occupationData, sectorData } = this.state;

        if (type === "employeeType" && employeeTypeData) {
            this.setState({
                showEmployeeTypePicker: true,
                showIncomePicker: false,
                showOccupationPicker: false,
                showSectorPicker: false,
                type: "employeeType",
            });
        } else if (type === "monthlyIncome" && incomeData) {
            this.setState({
                showEmployeeTypePicker: false,
                showIncomePicker: true,
                showOccupationPicker: false,
                showSectorPicker: false,
                type: "monthlyIncome",
            });
        } else if (type === "ocupation" && occupationData) {
            this.setState({
                showEmployeeTypePicker: false,
                showIncomePicker: false,
                showOccupationPicker: true,
                showSectorPicker: false,
                type: "ocupation",
            });
        } else if (type === "sector" && sectorData) {
            this.setState({
                showEmployeeTypePicker: false,
                showIncomePicker: false,
                showOccupationPicker: false,
                showSectorPicker: true,
                type: "sector",
            });
        }
    };

    scrollPickerData = (data) => {
        return data.map((obj) => {
            const { display, value } = obj;
            return {
                title: display,
                value,
            };
        });
    };

    onPickerDone = (item) => {
        console.log("[StepUpEmployment] >> [onPickerDone]");

        if (item) {
            const { type } = this.state;
            switch (type) {
                case "employeeType":
                    this.setState(
                        {
                            employeeType: item?.display,
                            employementValue: item?.value,
                        },
                        () => {
                            this.enableDisableBtn();
                        }
                    );
                    break;
                case "monthlyIncome":
                    this.setState(
                        {
                            monthlyIncome: item?.display,
                            incomeValue: item?.value,
                        },
                        () => {
                            this.enableDisableBtn();
                        }
                    );
                    break;
                case "ocupation":
                    this.setState(
                        {
                            ocupation: item?.display,
                            ocupationValue: item?.value,
                        },
                        () => {
                            this.enableDisableBtn();
                        }
                    );
                    break;
                case "sector":
                    this.setState(
                        {
                            sector: item?.display,
                            sectorValue: item?.value,
                        },
                        () => {
                            this.enableDisableBtn();
                        }
                    );
                    break;
                default:
                    break;
            }
        }

        // Hide the picker
        this.onPickerCancel();
    };

    onPickerCancel = () => {
        console.log("[StepUpEmployment] >> [onPickerCancel]");

        this.setState({
            showEmployeeTypePicker: false,
            showIncomePicker: false,
            showOccupationPicker: false,
            showSectorPicker: false,
        });
    };

    onEmployerTextInputChange = (value) => {
        this.setState(
            {
                empName: value,
            },
            () => {
                this.enableDisableBtn();
            }
        );
    };

    /* VALIDATIONS */

    isEmployerTextValidation = () => {
        console.log("[StepUpEmployment] >> [isEmployerTextValidation]");

        const inputText = this.state.empName;
        let err = "";

        // Empty check
        if (isEmpty(inputText)) {
            err = "Please enter employer name.";
        }

        // Check for leading or double spaces
        if (!leadingOrDoubleSpaceRegex(inputText)) {
            err = "Employer name must not contain leading/double spaces";
        }

        // Min length check
        if (inputText.length < 5) {
            err = "Employer Name should at least be 5 characters";
        }

        // Employer Name Special Char check
        if (!employerNameSpclCharRegex(inputText)) {
            err = "Employer name must not contain special characters";
        }

        if (!isEmpty(err)) {
            this.setState({ empNameErrorMsg: err, empNameValid: false });
        }

        // Return true if no validation error
        return err ? false : true;
    };

    isEmployementFormValidation = () => {
        console.log("[StepUpEmployment] >> [isEmployementFormValidation]");

        const { employementValue, incomeValue, sectorValue } = this.state;
        return (
            this.isEmployerTextValidation() &&
            employementValue.length > 0 &&
            incomeValue.length > 0 &&
            sectorValue.length > 0
        );
    };

    enableDisableBtn = () => {
        const { employementValue, incomeValue, ocupationValue, sectorValue, empName } = this.state;

        this.setState({
            isContinueDisabled: !(
                employementValue &&
                empName &&
                incomeValue &&
                ocupationValue &&
                sectorValue
            ),
        });
    };

    render() {
        const {
            employeeType,
            employeeTypeData,
            monthlyIncome,
            incomeData,
            ocupation,
            occupationData,
            sector,
            sectorData,
            empName,
            empNameValid,
            empNameErrorMsg,
            isContinueDisabled,
            showEmployeeTypePicker,
            showIncomePicker,
            showOccupationPicker,
            showSectorPicker,
        } = this.state;

        return (
            <React.Fragment>
                <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                    <ScreenLayout
                        paddingBottom={0}
                        paddingTop={0}
                        paddingHorizontal={0}
                        useSafeArea
                        header={
                            <HeaderLayout
                                headerLeftElement={
                                    <HeaderBackButton onPress={this.onBackButtonPress} />
                                }
                            />
                        }
                    >
                        <React.Fragment>
                            <View style={styles.viewContainer}>
                                <ScrollView>
                                    <KeyboardAwareScrollView
                                        style={styles.container}
                                        behavior={Platform.OS === "ios" ? "padding" : ""}
                                        enabled
                                    >
                                        <View style={styles.formContainer}>
                                            <Typo
                                                fontSize={20}
                                                lineHeight={28}
                                                fontWeight="300"
                                                letterSpacing={0}
                                                textAlign="left"
                                                text="Fill in your employment details."
                                            />

                                            {/* EMPLOYEE TYPE */}
                                            <LabeledDropdown
                                                label={STEPUP_MAE_EMPLOYEE}
                                                dropdownValue={employeeType}
                                                onPress={this.onEmpTypeFieldTap}
                                                style={styles.labeledDropdownCls}
                                            />

                                            {/* EMPLOYER NAME */}
                                            <View style={styles.labeledDropdownCls}>
                                                <Typo
                                                    fontSize={14}
                                                    lineHeight={18}
                                                    fontWeight="normal"
                                                    textAlign="left"
                                                    text={STEPUP_MAE_EMPLOYER_NAME}
                                                />
                                                <LongTextInput
                                                    minLength={5}
                                                    maxLength={40}
                                                    isValidate
                                                    isValid={empNameValid}
                                                    errorMessage={empNameErrorMsg}
                                                    value={empName}
                                                    placeholder="Enter your employer name"
                                                    onChangeText={this.onEmployerTextInputChange}
                                                    numberOfLines={2}
                                                />
                                            </View>

                                            {/* MONTHLY INCOME */}
                                            <LabeledDropdown
                                                label={STEPUP_MAE_MONTHLY_INCOME}
                                                dropdownValue={monthlyIncome}
                                                onPress={this.onMonthlyIncomeFieldTap}
                                                style={styles.labeledDropdownCls}
                                            />

                                            {/* OCCUPATION */}
                                            <LabeledDropdown
                                                label={STEPUP_MAE_OCUPATION}
                                                dropdownValue={ocupation}
                                                onPress={this.onOccupationFieldTap}
                                                style={styles.labeledDropdownCls}
                                            />

                                            {/* SECTOR */}
                                            <LabeledDropdown
                                                label={STEPUP_MAE_SECTOR}
                                                dropdownValue={sector}
                                                onPress={this.onSectorFieldTap}
                                                style={styles.labeledDropdownCls}
                                            />
                                        </View>
                                    </KeyboardAwareScrollView>
                                </ScrollView>

                                {/* Continue Button */}
                                <View style={styles.footerButton}>
                                    <ActionButton
                                        fullWidth
                                        onPress={this.onContinueButtonPress}
                                        disabled={isContinueDisabled}
                                        backgroundColor={isContinueDisabled ? DISABLED : YELLOW}
                                        componentCenter={
                                            <Typo
                                                fontSize={14}
                                                fontWeight="600"
                                                lineHeight={18}
                                                text={CONTINUE}
                                            />
                                        }
                                    />
                                </View>
                            </View>
                        </React.Fragment>
                    </ScreenLayout>
                </ScreenContainer>

                {/* Employee Type Picker */}
                {employeeTypeData && (
                    <ScrollPickerView
                        showMenu={showEmployeeTypePicker}
                        list={employeeTypeData}
                        onRightButtonPress={this.onPickerDone}
                        onLeftButtonPress={this.onPickerCancel}
                        rightButtonText={DONE}
                        leftButtonText={CANCEL}
                    />
                )}

                {/* Monthly IncomePicker */}
                {incomeData && (
                    <ScrollPickerView
                        showMenu={showIncomePicker}
                        list={incomeData}
                        onRightButtonPress={this.onPickerDone}
                        onLeftButtonPress={this.onPickerCancel}
                        rightButtonText={DONE}
                        leftButtonText={CANCEL}
                    />
                )}

                {/* Occupation Picker */}
                {occupationData && (
                    <ScrollPickerView
                        showMenu={showOccupationPicker}
                        list={occupationData}
                        onRightButtonPress={this.onPickerDone}
                        onLeftButtonPress={this.onPickerCancel}
                        rightButtonText={DONE}
                        leftButtonText={CANCEL}
                    />
                )}

                {/* Sector Picker */}
                {sectorData && (
                    <ScrollPickerView
                        showMenu={showSectorPicker}
                        list={sectorData}
                        onRightButtonPress={this.onPickerDone}
                        onLeftButtonPress={this.onPickerCancel}
                        rightButtonText={DONE}
                        leftButtonText={CANCEL}
                    />
                )}
            </React.Fragment>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    footerButton: {
        marginBottom: 36,
        paddingHorizontal: 24,
        width: "100%",
    },

    formContainer: {
        marginBottom: 40,
        marginHorizontal: 36,
    },

    labeledDropdownCls: {
        marginTop: 25,
    },

    viewContainer: {
        flex: 1,
    },
});

export default StepUpEmployment;
