import { connect } from "react-redux";

import {
    ACCOUNT_PURPOSE_ACTION,
    BRANCH_STATE_ACTION,
    BRANCH_DISTRICT_ACTION,
    BRANCH_ACTION,
    GET_BRANCH_DISTRICT_DROPDOWN_ITEMS_ACTION,
    GET_BRANCH_DROPDOWN_ITEMS_ACTION,
    ACCOUNT_DETAILS_CONTINUE_BUTTON_DISABLED_ACTION,
    ACCOUNT_DETAILS_CONFIRMATION_ACTION,
    ACCOUNT_DETAILS_CLEAR,
    BRANCH_DISTRICT_DROPDOWN_DISABLED_ACTION,
    BRANCH_DROPDOWN_DISABLED_ACTION,
    DISTRICT_CLEAR,
    BRANCH_CLEAR,
} from "@redux/actions/ZestCASA/accountDetailsAction";

const mapStateToProps = function (state) {
    const { zestCasaReducer } = state;
    const { accountDetailsReducer } = zestCasaReducer;

    return {
        // Local reducer
        accountPurposeIndex: accountDetailsReducer.accountPurposeIndex,
        accountPurposeValue: accountDetailsReducer.accountPurposeValue,
        branchStateIndex: accountDetailsReducer.branchStateIndex,
        branchStateValue: accountDetailsReducer.branchStateValue,
        branchDistrictIndex: accountDetailsReducer.branchDistrictIndex,
        branchDistrictValue: accountDetailsReducer.branchDistrictValue,
        branchIndex: accountDetailsReducer.branchIndex,
        branchValue: accountDetailsReducer.branchValue,
        branchDistrictDropdownItems: accountDetailsReducer.branchDistrictDropdownItems,
        branchDropdownItems: accountDetailsReducer.branchDropdownItems,
        isAccountDetailsContinueButtonEnabled:
            accountDetailsReducer.isAccountDetailsContinueButtonEnabled,
        isBranchDistrictDropdownEnabled: accountDetailsReducer.isBranchDistrictDropdownEnabled,
        isBranchDropdownEnabled: accountDetailsReducer.isBranchDropdownEnabled,
        isFromConfirmationScreenForAccountDetails:
            accountDetailsReducer.isFromConfirmationScreenForAccountDetails,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        getBranchDistrictDropdownItems: (stateName, unfilteredDistrictDropdownItems) =>
            dispatch({
                type: GET_BRANCH_DISTRICT_DROPDOWN_ITEMS_ACTION,
                stateName: stateName,
                unfilteredDistrictDropdownItems: unfilteredDistrictDropdownItems,
            }),
        getBranchDropdownItems: (districtName, unfilteredBranchDropdownItems) =>
            dispatch({
                type: GET_BRANCH_DROPDOWN_ITEMS_ACTION,
                districtName: districtName,
                unfilteredBranchDropdownItems: unfilteredBranchDropdownItems,
            }),
        updateAccountPurpose: (index, value) =>
            dispatch({
                type: ACCOUNT_PURPOSE_ACTION,
                accountPurposeIndex: index,
                accountPurposeValue: value,
            }),
        updateBranchState: (index, value) =>
            dispatch({
                type: BRANCH_STATE_ACTION,
                branchStateIndex: index,
                branchStateValue: value,
            }),
        updateBranchDistrict: (index, value) =>
            dispatch({
                type: BRANCH_DISTRICT_ACTION,
                branchDistrictIndex: index,
                branchDistrictValue: value,
            }),
        updateBranch: (index, value) =>
            dispatch({
                type: BRANCH_ACTION,
                branchIndex: index,
                branchValue: value,
            }),
        updateConfirmationScreenStatusForAccountDetails: (value) =>
            dispatch({
                type: ACCOUNT_DETAILS_CONFIRMATION_ACTION,
                isFromConfirmationScreenForAccountDetails: value,
            }),
        checkButtonEnabled: () =>
            dispatch({ type: ACCOUNT_DETAILS_CONTINUE_BUTTON_DISABLED_ACTION }),
        checkBranchDistrictDropdownEnabled: () =>
            dispatch({ type: BRANCH_DISTRICT_DROPDOWN_DISABLED_ACTION }),
        checkBranchDropdownEnabled: () => dispatch({ type: BRANCH_DROPDOWN_DISABLED_ACTION }),
        clearAccountDetailsReducer: () => dispatch({ type: ACCOUNT_DETAILS_CLEAR }),
        clearDistrictData: () => dispatch({ type: DISTRICT_CLEAR }),
        clearBranchData: () => dispatch({ type: BRANCH_CLEAR }),
    };
};

const accountDetailsProps = connect(mapStateToProps, mapDispatchToProps);
export default accountDetailsProps;

const getBranchListByKey = (filter, unfilteredItems) => {
    const filteredData = unfilteredItems.filter((obj) => {
        return obj[filter];
    });

    return branchScrollPickerData(filteredData[0][filter]);
};

const branchScrollPickerData = (data) => {
    return data.map((obj) => {
        const { branchName } = obj;
        return {
            ...obj,
            name: branchName,
        };
    });
};
