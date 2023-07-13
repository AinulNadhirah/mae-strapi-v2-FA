/*
Helper to prefill customer data in respective screens
for ETB Customer after getting customer details from pre-qual service 
*/
import {
    DEBIT_CARD_ADDRESS_LINE_ONE_ACTION,
    DEBIT_CARD_ADDRESS_LINE_THREE_ACTION,
    DEBIT_CARD_ADDRESS_LINE_TWO_ACTION,
    DEBIT_CARD_CITY_ACTION,
    DEBIT_CARD_POSTAL_CODE_ACTION,
    DEBIT_CARD_STATE_ACTION
} from "@redux/actions/ZestCASA/debitCardResidentialDetailsAction";
import {
    EMPLOYER_NAME_ACTION,
    EMPLOYMENT_TYPE_ACTION,
    INCOME_SOURCE_ACTION,
    MONTHLY_INCOME_ACTION,
    OCCUPATION_ACTION,
    SECTOR_ACTION
} from "@redux/actions/ZestCASA/employmentDetailsAction";
import {
    MOBILE_NUMBER_MASK_ACTION,
    MOBILE_NUMBER_WITHOUT_EXTENSION_ACTION,
    MOBILE_NUMBER_WITH_EXTENSION_ACTION,
    EMAIL_ADDRESS_ACTION,
    EMAIL_MASK_ACTION
} from "@redux/actions/ZestCASA/personalDetailsAction";
import {
    ADDRESS_LINE_ONE_ACTION,
    ADDRESS_LINE_TWO_ACTION,
    ADDRESS_LINE_THREE_ACTION,
    POSTAL_CODE_ACTION,
    CITY_ACTION,
    STATE_ACTION,
    ADDRESS_LINE_ONE_MASK_ACTION,
    ADDRESS_LINE_TWO_MASK_ACTION,
    ADDRESS_LINE_THREE_MASK_ACTION,
    CITY_MASK_ACTION
} from "@redux/actions/ZestCASA/residentialDetailsAction";

export const PersonalDetailsPrefiller = (dispatch, masterDataReducer, prePostQualReducer) => {
    const mobCountryCode = prePostQualReducer?.viewPartyResult?.mobCountryCode;
    const mobAreaCode = prePostQualReducer?.viewPartyResult?.mobAreaCode;
    const mobPhoneNumber = prePostQualReducer?.viewPartyResult?.mobPhoneNumber;

    if (prePostQualReducer.addr1) {
        dispatch({ type: ADDRESS_LINE_ONE_ACTION, addressLineOne: prePostQualReducer.addr1 });
    }

    if (prePostQualReducer.addr2) {
        dispatch({ type: ADDRESS_LINE_TWO_ACTION, addressLineTwo: prePostQualReducer.addr2 });
    }

    if (prePostQualReducer.addr3) {
        dispatch({ type: ADDRESS_LINE_THREE_ACTION, addressLineThree: prePostQualReducer.addr3 });
    }

    if (prePostQualReducer.postCode) {
        dispatch({ type: POSTAL_CODE_ACTION, postalCode: prePostQualReducer.postCode });
    }

    if (prePostQualReducer.city) {
        dispatch({ type: CITY_ACTION, city: prePostQualReducer.city });
    }

    if (prePostQualReducer.emailAddress) {
        dispatch({ type: EMAIL_ADDRESS_ACTION, emailAddress: prePostQualReducer.emailAddress });
    }

    if (mobAreaCode && mobPhoneNumber) {
        dispatch({
            type: MOBILE_NUMBER_WITHOUT_EXTENSION_ACTION,
            mobileNumberWithoutExtension: mobileNumberWithAreaCode(mobAreaCode, mobPhoneNumber),
        });
    }

    if (mobAreaCode && mobPhoneNumber) {
        dispatch({
            type: MOBILE_NUMBER_WITH_EXTENSION_ACTION,
            mobileNumberWithExtension: mobileNumberWithAreaAndCountryCode(
                mobCountryCode,
                mobAreaCode,
                mobPhoneNumber
            ),
        });
    }

    if (prePostQualReducer.stateValue) {
        filterDropdownList(
            prePostQualReducer.stateValue,
            masterDataReducer.stateData,
            (index, value) => {
                dispatch({ type: STATE_ACTION, stateIndex: index, stateValue: value });
            }
        );
    }

    dispatch({ type: MOBILE_NUMBER_MASK_ACTION, isMobileNumberMaskingOn: true });
    dispatch({ type: ADDRESS_LINE_ONE_MASK_ACTION, isAddressLineOneMaskingOn: true });
    dispatch({ type: ADDRESS_LINE_TWO_MASK_ACTION, isAddressLineTwoMaskingOn: true });
    dispatch({ type: ADDRESS_LINE_THREE_MASK_ACTION, isAddressLineThreeMaskingOn: true });
    dispatch({ type: CITY_MASK_ACTION, isCityMaskingOn: true });
    dispatch({ type: EMAIL_MASK_ACTION, isEmailMaskingOn: true });
};

export const EmployeeDetailsPrefiller = (dispatch, masterDataReducer, prePostQualReducer) => {
    const sourceOfFundCountryValue = prePostQualReducer?.viewPartyResult?.sourceOfFundCountryValue;

    if (prePostQualReducer.employerName) {
        dispatch({ type: EMPLOYER_NAME_ACTION, employerName: prePostQualReducer.employerName });
    }

    if (prePostQualReducer.empTypeValue) {
        filterDropdownList(
            prePostQualReducer.empTypeValue,
            masterDataReducer.employmentType,
            (index, value) => {
                dispatch({
                    type: EMPLOYMENT_TYPE_ACTION,
                    employmentTypeIndex: index,
                    employmentTypeValue: value,
                });
            }
        );
    }

    if (prePostQualReducer.occupationValue) {
        filterDropdownList(
            prePostQualReducer.occupationValue,
            masterDataReducer.occupation,
            (index, value) => {
                dispatch({
                    type: OCCUPATION_ACTION,
                    occupationIndex: index,
                    occupationValue: value,
                });
            }
        );
    }

    if (prePostQualReducer.sectorValue) {
        filterDropdownList(
            prePostQualReducer.sectorValue,
            masterDataReducer.sector,
            (index, value) => {
                dispatch({ type: SECTOR_ACTION, sectorIndex: index, sectorValue: value });
            }
        );
    }

    if (prePostQualReducer.monthlyIncomeRangeValue) {
        filterDropdownList(
            prePostQualReducer.monthlyIncomeRangeValue,
            masterDataReducer.incomeRange,
            (index, value) => {
                dispatch({
                    type: MONTHLY_INCOME_ACTION,
                    monthlyIncomeIndex: index,
                    monthlyIncomeValue: value,
                });
            }
        );
    }

    if (sourceOfFundCountryValue) {
        filterDropdownList(
            sourceOfFundCountryValue,
            masterDataReducer.sourceOfFundCountry,
            (index, value) => {
                dispatch({
                    type: INCOME_SOURCE_ACTION,
                    incomeSourceIndex: index,
                    incomeSourceValue: value,
                });
            }
        );
    }
};

export const debitCardResidentailDetailsPrefiller = (
    dispatch,
    masterDataReducer,
    prePostQualReducer
) => {
    dispatch({
        type: DEBIT_CARD_ADDRESS_LINE_ONE_ACTION,
        addressLineOne: prePostQualReducer.addr1,
    });
    dispatch({
        type: DEBIT_CARD_ADDRESS_LINE_TWO_ACTION,
        addressLineTwo: prePostQualReducer.addr2,
    });
    dispatch({
        type: DEBIT_CARD_ADDRESS_LINE_THREE_ACTION,
        addressLineTwo: prePostQualReducer.addr3,
    });

    dispatch({ type: DEBIT_CARD_POSTAL_CODE_ACTION, postalCode: prePostQualReducer.postCode });
    dispatch({ type: DEBIT_CARD_CITY_ACTION, city: prePostQualReducer.city });
    filterDropdownList(
        prePostQualReducer.stateValue,
        masterDataReducer.stateData,
        (index, value) => {
            dispatch({ type: DEBIT_CARD_STATE_ACTION, stateIndex: index, stateValue: value });
        }
    );
};

export function filterDropdownList(prefilledValue, dropdownList, updateFunction) {
    dropdownList.find((item, index) => {
        const { name } = item;
        if (name.toLowerCase() === prefilledValue.toLowerCase()) updateFunction(index, item);
    });
}

const mobileNumberWithAreaCode = (areaCode, mobileNumber) =>
    `${areaCode.replace("0", "")}${mobileNumber}`;

const mobileNumberWithAreaAndCountryCode = (countryCode, areaCode, mobileNumber) =>
    `${countryCode}${areaCode.replace("0", "")}${mobileNumber}`;
