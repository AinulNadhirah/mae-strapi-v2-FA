// Account details actions

export const ACCOUNT_PURPOSE_ACTION = (accountPurposeIndex, accountPurposeValue) => ({
    accountPurposeIndex: accountPurposeIndex,
    accountPurposeValue: accountPurposeValue,
});

export const BRANCH_STATE_ACTION = (branchStateIndex, branchStateValue) => ({
    branchStateIndex: branchStateIndex,
    branchStateValue: branchStateValue,
});

export const BRANCH_DISTRICT_ACTION = (branchDistrictIndex, branchDistrictValue) => ({
    branchDistrictIndex: branchDistrictIndex,
    branchDistrictValue: branchDistrictValue,
});

export const BRANCH_ACTION = (branchIndex, branchValue) => ({
    branchIndex: branchIndex,
    branchValue: branchValue,
});

export const GET_BRANCH_DISTRICT_DROPDOWN_ITEMS_ACTION = (
    stateName,
    unfilteredDistrictDropdownItems
) => ({
    stateName: stateName,
    unfilteredDistrictDropdownItems: unfilteredDistrictDropdownItems,
});

export const GET_BRANCH_DROPDOWN_ITEMS_ACTION = (districtName, unfilteredBranchDropdownItems) => ({
    districtName: districtName,
    unfilteredBranchDropdownItems: unfilteredBranchDropdownItems,
});

export const ACCOUNT_DETAILS_CONFIRMATION_ACTION = (isFromConfirmationScreenForAccountDetails) => ({
    isFromConfirmationScreenForAccountDetails: isFromConfirmationScreenForAccountDetails,
});

export const ACCOUNT_DETAILS_CONTINUE_BUTTON_DISABLED_ACTION = () => ({});

export const BRANCH_DISTRICT_DROPDOWN_DISABLED_ACTION = () => ({});

export const BRANCH_DROPDOWN_DISABLED_ACTION = () => ({});

export const ACCOUNT_DETAILS_CLEAR = () => ({});

export const DISTRICT_CLEAR = () => ({});

export const BRANCH_CLEAR = () => ({});
