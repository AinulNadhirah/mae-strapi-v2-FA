import {
    ACCOUNT_PURPOSE_ACTION,
    BRANCH_STATE_ACTION,
    BRANCH_DISTRICT_ACTION,
    BRANCH_ACTION,
    GET_BRANCH_DISTRICT_DROPDOWN_ITEMS_ACTION,
    GET_BRANCH_DROPDOWN_ITEMS_ACTION,
    ACCOUNT_DETAILS_CONTINUE_BUTTON_DISABLED_ACTION,
    BRANCH_DISTRICT_DROPDOWN_DISABLED_ACTION,
    BRANCH_DROPDOWN_DISABLED_ACTION,
    ACCOUNT_DETAILS_CONFIRMATION_ACTION,
    ACCOUNT_DETAILS_CLEAR,
    DISTRICT_CLEAR,
    BRANCH_CLEAR,
} from "@redux/actions/ZestCASA/accountDetailsAction";

const initialState = {
    accountPurposeIndex: null,
    accountPurposeValue: null,
    branchStateIndex: null,
    branchStateValue: null,
    branchDistrictIndex: null,
    branchDistrictValue: null,
    branchIndex: null,
    branchValue: null,

    branchDistrictDropdownItems: [],
    branchDropdownItems: [],
    isBranchDistrictDropdownEnabled: false,
    isBranchDropdownEnabled: false,
    isAccountDetailsContinueButtonEnabled: false,
    isFromConfirmationScreenForAccountDetails: false,
};

export default function accountDetailsReducer(state = initialState, action) {
    switch (action.type) {
        case GET_BRANCH_DISTRICT_DROPDOWN_ITEMS_ACTION:
            return {
                ...state,
                branchDistrictDropdownItems: getDistrictListByKey(
                    action.stateName,
                    action.unfilteredDistrictDropdownItems
                ),
            };

        case GET_BRANCH_DROPDOWN_ITEMS_ACTION:
            return {
                ...state,
                branchDropdownItems: getBranchListByKey(
                    action.districtName,
                    action.unfilteredBranchDropdownItems
                ),
            };

        case ACCOUNT_PURPOSE_ACTION:
            return {
                ...state,
                accountPurposeIndex: action.accountPurposeIndex,
                accountPurposeValue: action.accountPurposeValue,
            };

        case BRANCH_STATE_ACTION:
            return {
                ...state,
                branchStateIndex: action.branchStateIndex,
                branchStateValue: action.branchStateValue,
            };

        case BRANCH_DISTRICT_ACTION:
            return {
                ...state,
                branchDistrictIndex: action.branchDistrictIndex,
                branchDistrictValue: action.branchDistrictValue,
            };

        case BRANCH_ACTION:
            return {
                ...state,
                branchIndex: action.branchIndex,
                branchValue: action.branchValue,
            };

        case ACCOUNT_DETAILS_CONFIRMATION_ACTION:
            return {
                ...state,
                isFromConfirmationScreenForAccountDetails:
                    action.isFromConfirmationScreenForAccountDetails,
            };

        case ACCOUNT_DETAILS_CONTINUE_BUTTON_DISABLED_ACTION:
            return {
                ...state,
                isAccountDetailsContinueButtonEnabled:
                    checkAccountDetailsContinueButtonStatus(state),
            };

        case BRANCH_DISTRICT_DROPDOWN_DISABLED_ACTION:
            return {
                ...state,
                isBranchDistrictDropdownEnabled: checkBranchDistrictDropdownStatus(state),
            };

        case BRANCH_DROPDOWN_DISABLED_ACTION:
            return {
                ...state,
                isBranchDropdownEnabled: checkBranchDropdownStatus(state),
            };

        case ACCOUNT_DETAILS_CLEAR:
            return {
                ...state,
                accountPurposeIndex: null,
                accountPurposeValue: null,
                branchStateIndex: null,
                branchStateValue: null,
                branchDistrictIndex: null,
                branchDistrictValue: null,
                branchIndex: null,
                branchValue: null,

                branchDistrictDropdownItems: [],
                branchDropdownItems: [],
                isBranchDistrictDropdownEnabled: false,
                isBranchDropdownEnabled: false,
                isAccountDetailsContinueButtonEnabled: false,
                isFromConfirmationScreenForAccountDetails: false,
            };

        case DISTRICT_CLEAR:
            return {
                ...state,
                branchDistrictIndex: null,
                branchDistrictValue: null,

                branchDistrictDropdownItems: [],
                isBranchDistrictDropdownEnabled: false,
            };

        case BRANCH_CLEAR:
            return {
                ...state,
                branchIndex: null,
                branchValue: null,

                branchDropdownItems: [],
                isBranchDropdownEnabled: false,
            };

        default:
            return state;
    }
}

const checkAccountDetailsContinueButtonStatus = (state) => {
    return (
        state.accountPurposeIndex !== null &&
        state.accountPurposeValue &&
        state.branchStateIndex !== null &&
        state.branchStateValue &&
        state.branchDistrictIndex !== null &&
        state.branchDistrictValue &&
        state.branchIndex !== null &&
        state.branchValue
    );
};

const checkBranchDistrictDropdownStatus = (state) => {
    return state.branchDistrictDropdownItems.length > 0;
};

const checkBranchDropdownStatus = (state) => {
    return state.branchDropdownItems.length > 0;
};

const getDistrictListByKey = (filter, unfilteredItems) => {
    const filteredData = Object.keys(unfilteredItems)
        .filter((key) => key.includes(filter))
        .reduce((cur, key) => {
            return Object.assign(cur, { [key]: unfilteredItems[key] });
        }, {});

    return scrollPickerData(filteredData[filter]);
};

const getBranchListByKey = (filter, unfilteredItems) => {
    const filteredData = unfilteredItems.filter((obj) => {
        return obj[filter];
    });

    return branchScrollPickerData(filteredData[0][filter]);
};

const scrollPickerData = (data) => {
    return data.map((obj) => {
        const { display, value } = obj;
        return {
            name: display,
            value,
        };
    });
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
