import { connect } from "react-redux";

import {
    EMPLOYER_NAME_ACTION,
    OCCUPATION_ACTION,
    SECTOR_ACTION,
    EMPLOYMENT_TYPE_ACTION,
    FROM_EMPLOYMENT_DURATION_ACTION,
    TO_EMPLOYMENT_DURATION_ACTION,
    GET_OCCUPATION_DROPDOWN_ITEMS_ACTION,
    GET_SECTOR_DROPDOWN_ITEMS_ACTION,
    GET_EMPLOYMENT_TYPE_DROPDOWN_ITEMS_ACTION,
    GET_FROM_EMPLOYMENT_DURATION_DROPDOWN_ITEMS_ACTION,
    GET_TO_EMPLOYMENT_DURATION_DROPDOWN_ITEMS_ACTION,
    EMPLOYMENT_CONTINUE_BUTTON_DISABLED_ACTION,
    EMPLOYMENT_DETAILS_CONFIRMATION_ACTION,
    EMPLOYMENT_DETAILS_CLEAR,
} from "@redux/actions/ASBFinance/occupationInformationAction";

const mapStateToProps = function (state) {
    const { asbFinanceReducer } = state;
    const { occupationInformationReducer } = asbFinanceReducer;

    return {
        // Local reducer
        employerName: occupationInformationReducer.employerName,
        occupationIndex: occupationInformationReducer.occupationIndex,
        occupationValue: occupationInformationReducer.occupationValue,
        sectorIndex: occupationInformationReducer.sectorIndex,
        sectorValue: occupationInformationReducer.sectorValue,
        employmentTypeIndex: occupationInformationReducer.employmentTypeIndex,
        employmentTypeValue: occupationInformationReducer.employmentTypeValue,
        fromEmploymentDurationIndex: occupationInformationReducer.fromEmploymentDurationIndex,
        fromEmploymentDurationValue: occupationInformationReducer.fromEmploymentDurationValue,
        toEmploymentDurationIndex: occupationInformationReducer.toEmploymentDurationIndex,
        toEmploymentDurationValue: occupationInformationReducer.toEmploymentDurationValue,
        occupationDropdownItems: occupationInformationReducer.occupationDropdownItems,
        sectorDropdownItems: occupationInformationReducer.sectorDropdownItems,
        employmentTypeDropdownItems: occupationInformationReducer.employmentTypeDropdownItems,
        fromEmploymentDurationDropdownItems:
            occupationInformationReducer.fromEmploymentDurationDropdownItems,
        toEmploymentDurationDropdownItems:
            occupationInformationReducer.toEmploymentDurationDropdownItems,
        isEmploymentContinueButtonEnabled:
            occupationInformationReducer.isEmploymentContinueButtonEnabled,
        isFromConfirmationScreenForEmploymentDetails:
            occupationInformationReducer.isFromConfirmationScreenForEmploymentDetails,
        employerNameErrorMessage: occupationInformationReducer.employerNameErrorMessage,
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
        getFromEmploymentDurationDropdownItems: (value) =>
            dispatch({
                type: GET_FROM_EMPLOYMENT_DURATION_DROPDOWN_ITEMS_ACTION,
                fromEmploymentDurationDropdownItems: value,
            }),
        getToEmploymentDurationDropdownItems: (value) =>
            dispatch({
                type: GET_TO_EMPLOYMENT_DURATION_DROPDOWN_ITEMS_ACTION,
                toEmploymentDurationDropdownItems: value,
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
        updateFromEmploymentDuration: (index, value) =>
            dispatch({
                type: FROM_EMPLOYMENT_DURATION_ACTION,
                fromEmploymentDurationIndex: index,
                fromEmploymentDurationValue: value,
            }),
        updateToEmploymentDuration: (index, value) =>
            dispatch({
                type: TO_EMPLOYMENT_DURATION_ACTION,
                toEmploymentDurationIndex: index,
                toEmploymentDurationValue: value,
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

const occupationInformationProps = connect(mapStateToProps, mapDispatchToProps);
export default occupationInformationProps;
