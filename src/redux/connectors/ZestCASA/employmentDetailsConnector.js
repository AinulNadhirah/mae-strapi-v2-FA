import { connect } from "react-redux";

import {
    EMPLOYER_NAME_ACTION,
    OCCUPATION_ACTION,
    SECTOR_ACTION,
    EMPLOYMENT_TYPE_ACTION,
    MONTHLY_INCOME_ACTION,
    INCOME_SOURCE_ACTION,
    GET_OCCUPATION_DROPDOWN_ITEMS_ACTION,
    GET_SECTOR_DROPDOWN_ITEMS_ACTION,
    GET_EMPLOYMENT_TYPE_DROPDOWN_ITEMS_ACTION,
    GET_MONTHLY_INCOME_DROPDOWN_ITEMS_ACTION,
    GET_INCOME_SOURCE_DROPDOWN_ITEMS_ACTION,
    EMPLOYMENT_CONTINUE_BUTTON_DISABLED_ACTION,
    EMPLOYMENT_DETAILS_CONFIRMATION_ACTION,
    EMPLOYMENT_DETAILS_CLEAR,
} from "@redux/actions/ZestCASA/employmentDetailsAction";

const mapStateToProps = function (state) {
    const { zestCasaReducer } = state;
    const { employmentDetailsReducer } = zestCasaReducer;

    return {
        // Local reducer
        employerName: employmentDetailsReducer.employerName,
        occupationIndex: employmentDetailsReducer.occupationIndex,
        occupationValue: employmentDetailsReducer.occupationValue,
        sectorIndex: employmentDetailsReducer.sectorIndex,
        sectorValue: employmentDetailsReducer.sectorValue,
        employmentTypeIndex: employmentDetailsReducer.employmentTypeIndex,
        employmentTypeValue: employmentDetailsReducer.employmentTypeValue,
        monthlyIncomeIndex: employmentDetailsReducer.monthlyIncomeIndex,
        monthlyIncomeValue: employmentDetailsReducer.monthlyIncomeValue,
        incomeSourceIndex: employmentDetailsReducer.incomeSourceIndex,
        incomeSourceValue: employmentDetailsReducer.incomeSourceValue,
        occupationDropdownItems: employmentDetailsReducer.occupationDropdownItems,
        sectorDropdownItems: employmentDetailsReducer.sectorDropdownItems,
        employmentTypeDropdownItems: employmentDetailsReducer.employmentTypeDropdownItems,
        monthlyIncomeDropdownItems: employmentDetailsReducer.monthlyIncomeDropdownItems,
        incomeSourceDropdownItems: employmentDetailsReducer.incomeSourceDropdownItems,
        isEmploymentContinueButtonEnabled:
            employmentDetailsReducer.isEmploymentContinueButtonEnabled,
        isFromConfirmationScreenForEmploymentDetails:
            employmentDetailsReducer.isFromConfirmationScreenForEmploymentDetails,
        employerNameErrorMessage: employmentDetailsReducer.employerNameErrorMessage,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        getOccupationDropdownItems: (value) =>
            dispatch({
                type: GET_OCCUPATION_DROPDOWN_ITEMS_ACTION,
                occupationDropdownItems: value,
            }),
        getSectorDropdownItems: (value) =>
            dispatch({
                type: GET_SECTOR_DROPDOWN_ITEMS_ACTION,
                sectorDropdownItems: value,
            }),
        getEmploymentTypeDropdownItems: (value) =>
            dispatch({
                type: GET_EMPLOYMENT_TYPE_DROPDOWN_ITEMS_ACTION,
                employmentTypeDropdownItems: value,
            }),
        getMonthlyIncomeDropdownItems: (value) =>
            dispatch({
                type: GET_MONTHLY_INCOME_DROPDOWN_ITEMS_ACTION,
                monthlyIncomeDropdownItems: value,
            }),
        getIncomeSourceDropdownItems: (value) =>
            dispatch({
                type: GET_INCOME_SOURCE_DROPDOWN_ITEMS_ACTION,
                incomeSourceDropdownItems: value,
            }),
        updateEmployerName: (value) =>
            dispatch({ type: EMPLOYER_NAME_ACTION, employerName: value }),
        updateOccupation: (index, value) =>
            dispatch({ type: OCCUPATION_ACTION, occupationIndex: index, occupationValue: value }),
        updateSector: (index, value) =>
            dispatch({ type: SECTOR_ACTION, sectorIndex: index, sectorValue: value }),
        updateEmploymentType: (index, value) =>
            dispatch({
                type: EMPLOYMENT_TYPE_ACTION,
                employmentTypeIndex: index,
                employmentTypeValue: value,
            }),
        updateMonthlyIncome: (index, value) =>
            dispatch({
                type: MONTHLY_INCOME_ACTION,
                monthlyIncomeIndex: index,
                monthlyIncomeValue: value,
            }),
        updateIncomeSource: (index, value) =>
            dispatch({
                type: INCOME_SOURCE_ACTION,
                incomeSourceIndex: index,
                incomeSourceValue: value,
            }),
        updateConfirmationScreenStatusForEmploymentDetails: (value) =>
            dispatch({
                type: EMPLOYMENT_DETAILS_CONFIRMATION_ACTION,
                isFromConfirmationScreenForEmploymentDetails: value,
            }),
        checkButtonEnabled: () => dispatch({ type: EMPLOYMENT_CONTINUE_BUTTON_DISABLED_ACTION }),
        clearEmploymentReducer: () => dispatch({ type: EMPLOYMENT_DETAILS_CLEAR }),
    };
};

const employmentDetailsProps = connect(mapStateToProps, mapDispatchToProps);
export default employmentDetailsProps;
