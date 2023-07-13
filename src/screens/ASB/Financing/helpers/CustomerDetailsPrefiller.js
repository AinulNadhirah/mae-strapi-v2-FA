/*
Helper to prefill customer data in respective screens
for ETB Customer after getting customer details from pre-qual service 
*/
import {
    EMPLOYMENT_ADDRESS_LINE_ONE_ACTION,
    EMPLOYMENT_ADDRESS_LINE_TWO_ACTION,
    EMPLOYMENT_ADDRESS_LINE_THREE_ACTION,
    EMPLOYMENT_POSTAL_CODE_ACTION,
    EMPLOYMENT_STATE_ACTION,
    EMPLOYMENT_COUNTRY_ACTION,
    EMPLOYMENT_CITY_ACTION,
    EMPLOYMENT_ADDRESS_LINE_ONE_MASK_ACTION,
    EMPLOYMENT_ADDRESS_LINE_TWO_MASK_ACTION,
    EMPLOYMENT_ADDRESS_LINE_THREE_MASK_ACTION,
    EMPLOYMENT_MOBILE_NUMBER_MASK_ACTION,
    EMPLOYMENT_MOBILE_NUMBER_WITHOUT_EXTENSION_ACTION,
    EMPLOYMENT_MOBILE_NUMBER_WITH_EXTENSION_ACTION,
    EMPLOYMENT_CITY_MASK_ACTION,
    EMPLOYMENT_POSTAL_CODE_MASK_ACTION,
} from "@redux/actions/ASBFinance/occupationInformation2Action";
import {
    EMPLOYER_NAME_ACTION,
    EMPLOYMENT_TYPE_ACTION,
    OCCUPATION_ACTION,
    SECTOR_ACTION,
} from "@redux/actions/ASBFinance/occupationInformationAction";
import {
    ADDRESS_LINE_ONE_ACTION,
    ADDRESS_LINE_TWO_ACTION,
    ADDRESS_LINE_THREE_ACTION,
    POSTAL_CODE_ACTION,
    CITY_ACTION,
    STATE_ACTION,
    COUNTRY_ACTION,
    RACE_ACTION,
    EMAIL_ADDRESS_ACTION,
    ADDRESS_LINE_ONE_MASK_ACTION,
    ADDRESS_LINE_TWO_MASK_ACTION,
    ADDRESS_LINE_THREE_MASK_ACTION,
    MOBILE_NUMBER_MASK_ACTION,
    MOBILE_NUMBER_WITHOUT_EXTENSION_ACTION,
    MOBILE_NUMBER_WITH_EXTENSION_ACTION,
    POSTAL_CODE_MASK_ACTION,
    EMAIL_MASK_ACTION,
    CITY_MASK_ACTION,
    MARITAL_ACTION,
    EDUCATION_ACTION,
} from "@redux/actions/ASBFinance/personalInformationAction";

export const PersonalDetailsPrefiller = (dispatch, masterDataReducer, prePostQualReducer) => {
    const areaCode = prePostQualReducer?.contactInformation?.phones[0]?.phone?.areaCode
        ? prePostQualReducer?.contactInformation?.phones[0]?.phone?.areaCode
        : "";

    const phoneNumber = prePostQualReducer?.contactInformation?.phones[0]?.phone?.phoneNumber
        ? prePostQualReducer?.contactInformation?.phones[0]?.phone?.phoneNumber
        : "";

    const countryCode = prePostQualReducer?.contactInformation?.phones[0]?.phone?.countryCode
        ? prePostQualReducer?.contactInformation?.phones[0]?.phone?.countryCode
        : "";

    const address = prePostQualReducer?.addresses?.filter((item) => {
        return item?.addressType?.value === "RESIDENTIAL";
    });

    dispatch({
        type: ADDRESS_LINE_ONE_ACTION,
        addressLineOne: address && address.length > 0 ? address[0].address?.line1 : "",
    });
    dispatch({
        type: ADDRESS_LINE_TWO_ACTION,
        addressLineTwo: address && address.length > 0 ? address[0].address?.line2 : "",
    });
    dispatch({
        type: ADDRESS_LINE_THREE_ACTION,
        addressLineThree: address && address.length > 0 ? address[0].address?.line3 : "",
    });
    dispatch({
        type: EMAIL_ADDRESS_ACTION,
        emailAddress: prePostQualReducer?.contactInformation?.emailAddress
            ? prePostQualReducer?.contactInformation?.emailAddress
            : "",
    });
    dispatch({
        type: POSTAL_CODE_ACTION,
        postalCode: address && address.length > 0 ? address[0].address?.postalCode : "",
    });
    dispatch({
        type: CITY_ACTION,
        city: address && address.length > 0 ? address[0].address?.town : "",
    });
    dispatch({
        type: MOBILE_NUMBER_WITHOUT_EXTENSION_ACTION,
        mobileNumberWithoutExtension: mobileNumberWithAreaCode(areaCode, phoneNumber),
    });
    dispatch({
        type: MOBILE_NUMBER_WITH_EXTENSION_ACTION,
        mobileNumberWithExtension: mobileNumberWithAreaAndCountryCode(
            countryCode,
            areaCode,
            phoneNumber
        ),
    });

    const releventState = masterDataReducer.allState.find(
        ({ value }) => value === address[0].address?.country?.code
    );
    var stateListData = JSON.stringify(releventState.name);
    const stateListDataArray = stateListData.split('"');
    const finalStateList = stateListDataArray[1].split(",");
    var stateList = [];
    var len = finalStateList?.length;
    for (var i = 0; i < len; i++) {
        stateList.push({
            name: finalStateList[i],
            value: finalStateList[i],
        });
    }
    filterDropdownList(address[0].address?.state?.value, stateList, (index, value) => {
        dispatch({ type: STATE_ACTION, stateIndex: index, stateValue: value });
    });

    filterDropdownList(
        prePostQualReducer?.demographics?.race?.value,
        masterDataReducer.personalInfoRace,
        (index, value) => {
            dispatch({ type: RACE_ACTION, raceIndex: index, raceValue: value });
        }
    );

    filterDropdownList(
        address[0].address?.country?.value,
        masterDataReducer.country,
        (index, value) => {
            dispatch({ type: COUNTRY_ACTION, countryIndex: index, countryValue: value });
        }
    );

    filterDropdownList(
        prePostQualReducer?.demographics?.maritalStatus?.value,
        masterDataReducer?.maritalStatus,
        (index, value) => {
            dispatch({ type: MARITAL_ACTION, maritalIndex: index, maritalValue: value });
        }
    );

    filterDropdownList(
        prePostQualReducer?.additionalDetails?.education?.value,
        masterDataReducer?.education,
        (index, value) => {
            dispatch({ type: EDUCATION_ACTION, educationIndex: index, educationValue: value });
        }
    );

    dispatch({ type: MOBILE_NUMBER_MASK_ACTION, isMobileNumberMaskingOn: true });
    dispatch({ type: ADDRESS_LINE_ONE_MASK_ACTION, isAddressLineOneMaskingOn: true });
    dispatch({ type: ADDRESS_LINE_TWO_MASK_ACTION, isAddressLineTwoMaskingOn: true });
    dispatch({ type: ADDRESS_LINE_THREE_MASK_ACTION, isAddressLineThreeMaskingOn: true });
    dispatch({ type: POSTAL_CODE_MASK_ACTION, isPostalCodeMaskingOn: false });
    dispatch({ type: EMAIL_MASK_ACTION, isEmailMaskingOn: true });
    dispatch({ type: CITY_MASK_ACTION, isCityMaskingOn: true });
};

export const ResumeDataForOccupationOne = (dispatch, data, masterDataReducer) => {
    dispatch({
        type: EMPLOYER_NAME_ACTION,
        employerName: data?.stpEmployerName,
    });

    filterDropdownList(data?.stpOccupationDesc, masterDataReducer.occupation, (index, value) => {
        dispatch({ type: OCCUPATION_ACTION, occupationIndex: index, occupationValue: value });
    });
    filterDropdownListByCode(
        data?.stpOccupationSectorCode,
        masterDataReducer.sector,
        (index, value) => {
            dispatch({ type: SECTOR_ACTION, sectorIndex: index, sectorValue: value });
        }
    );

    filterDropdownList(
        data?.stpEmploymentTypeDesc,
        masterDataReducer.employmentType,
        (index, value) => {
            dispatch({
                type: EMPLOYMENT_TYPE_ACTION,
                employmentTypeIndex: index,
                employmentTypeValue: value,
            });
        }
    );
};

export const ResumeDataForOccupationTwo = (dispatch, data, masterDataReducer) => {
    filterDropdownList(data?.stpEmployerCountry, masterDataReducer.country, (index, value) => {
        dispatch({
            type: EMPLOYMENT_COUNTRY_ACTION,
            countryIndex: index,
            countryValue: value,
        });
    });

    const releventState = masterDataReducer.allState.find(
        ({ value }) => value === data.stpEmployerCountryCode
    );
    var stateListData = JSON.stringify(releventState?.name);
    const stateListDataArray = stateListData && stateListData.split('"');
    const finalStateList = stateListDataArray && stateListDataArray[1].split(",");
    var stateList = [];
    var len = finalStateList?.length;
    for (var i = 0; i < len; i++) {
        stateList.push({
            name: finalStateList[i],
            value: finalStateList[i],
        });
    }

    filterDropdownList(data?.stpEmployerStateCode, stateList, (index, value) => {
        dispatch({ type: EMPLOYMENT_STATE_ACTION, stateIndex: index, stateValue: value });
    });
};

export const ResumeDataForPersonalDetails = (dispatch, data, masterDataReducer) => {
    filterDropdownList(
        data?.stpMaritalStatusDesc,
        masterDataReducer?.maritalStatus,
        (index, value) => {
            dispatch({ type: MARITAL_ACTION, maritalIndex: index, maritalValue: value });
        }
    );

    filterDropdownList(data?.stpEducationDesc, masterDataReducer?.education, (index, value) => {
        dispatch({ type: EDUCATION_ACTION, educationIndex: index, educationValue: value });
    });

    filterDropdownList(data?.stpHomeCountry, masterDataReducer.country, (index, value) => {
        dispatch({
            type: COUNTRY_ACTION,
            countryIndex: index,
            countryValue: value,
        });
    });

    const releventState = masterDataReducer?.allState?.find(
        ({ value }) => value === data.stpHomeCountryCode
    );
    var stateListData = JSON.stringify(releventState?.name);
    const stateListDataArray = stateListData && stateListData.split('"');
    const finalStateList = stateListDataArray[1].split(",");
    var stateList = [];
    var len = finalStateList?.length;
    for (var i = 0; i < len; i++) {
        stateList.push({
            name: finalStateList[i],
            value: finalStateList[i],
        });
    }

    filterDropdownList(data?.stpHomeStateCode, stateList, (index, value) => {
        dispatch({ type: STATE_ACTION, stateIndex: index, stateValue: value });
    });
};
export const EmployeeDetailsPrefiller = (dispatch, masterDataReducer, prePostQualReducer) => {
    dispatch({
        type: EMPLOYER_NAME_ACTION,
        employerName: prePostQualReducer?.employmentDetails?.employerName?.registeredName,
    });

    filterDropdownListByCode(
        prePostQualReducer?.employmentDetails?.occupation?.code,
        masterDataReducer.occupation,
        (index, value) => {
            dispatch({ type: OCCUPATION_ACTION, occupationIndex: index, occupationValue: value });
        }
    );

    filterDropdownListByCode(
        prePostQualReducer?.employmentDetails?.occupationSector?.code,
        masterDataReducer.sector,
        (index, value) => {
            dispatch({ type: SECTOR_ACTION, sectorIndex: index, sectorValue: value });
        }
    );

    filterDropdownList(
        prePostQualReducer?.employmentDetails?.employmentType?.value,
        masterDataReducer.employmentType,
        (index, value) => {
            dispatch({
                type: EMPLOYMENT_TYPE_ACTION,
                employmentTypeIndex: index,
                employmentTypeValue: value,
            });
        }
    );
};

export const OccupationDetailsPrefiller = (dispatch, masterDataReducer, prePostQualReducer) => {
    const employmentAreaCode = prePostQualReducer?.employmentDetails?.employersPhone?.phone
        ?.areaCode
        ? prePostQualReducer?.employmentDetails?.employersPhone?.phone?.areaCode
        : "";

    const employmentPhoneNumber = prePostQualReducer?.employmentDetails?.employersPhone?.phone
        ?.phoneNumber
        ? prePostQualReducer?.employmentDetails?.employersPhone?.phone?.phoneNumber
        : "";

    const employmentCountryCode = prePostQualReducer?.employmentDetails?.employersPhone?.phone
        ?.countryCode
        ? prePostQualReducer?.employmentDetails?.employersPhone?.phone?.countryCode
        : "";

    if (
        prePostQualReducer?.employmentDetails?.employerAddress?.address.line1 &&
        prePostQualReducer?.employmentDetails?.employerAddress?.address.line1 !== ""
    ) {
        dispatch({
            type: EMPLOYMENT_ADDRESS_LINE_ONE_ACTION,
            addressLineOne: prePostQualReducer?.employmentDetails?.employerAddress?.address.line1
                ? prePostQualReducer?.employmentDetails?.employerAddress?.address.line1
                : "",
        });
    }

    if (
        prePostQualReducer?.employmentDetails?.employerAddress?.address.line2 &&
        prePostQualReducer?.employmentDetails?.employerAddress?.address.line2 !== ""
    ) {
        dispatch({
            type: EMPLOYMENT_ADDRESS_LINE_TWO_ACTION,
            addressLineTwo: prePostQualReducer?.employmentDetails?.employerAddress?.address.line2
                ? prePostQualReducer?.employmentDetails?.employerAddress?.address.line2
                : "",
        });
    }

    if (
        prePostQualReducer?.employmentDetails?.employerAddress?.address.line3 &&
        prePostQualReducer?.employmentDetails?.employerAddress?.address.line3 !== ""
    ) {
        dispatch({
            type: EMPLOYMENT_ADDRESS_LINE_THREE_ACTION,
            addressLineThree: prePostQualReducer?.employmentDetails?.employerAddress?.address.line3
                ? prePostQualReducer?.employmentDetails?.employerAddress?.address.line3
                : "",
        });
    }

    if (
        prePostQualReducer?.employmentDetails?.employerAddress?.address.postalCode &&
        prePostQualReducer?.employmentDetails?.employerAddress?.address.postalCode !== ""
    ) {
        dispatch({
            type: EMPLOYMENT_POSTAL_CODE_ACTION,
            postalCode: prePostQualReducer?.employmentDetails?.employerAddress?.address.postalCode
                ? prePostQualReducer?.employmentDetails?.employerAddress?.address.postalCode
                : "",
        });
    }
    if (
        prePostQualReducer?.employmentDetails?.employerAddress?.address.town &&
        prePostQualReducer?.employmentDetails?.employerAddress?.address.town !== ""
    ) {
        dispatch({
            type: EMPLOYMENT_CITY_ACTION,
            city: prePostQualReducer?.employmentDetails?.employerAddress?.address.town
                ? prePostQualReducer?.employmentDetails?.employerAddress?.address.town
                : "",
        });
    }
    if (
        employmentAreaCode &&
        employmentAreaCode !== "" &&
        employmentPhoneNumber &&
        employmentPhoneNumber !== ""
    ) {
        dispatch({
            type: EMPLOYMENT_MOBILE_NUMBER_WITHOUT_EXTENSION_ACTION,
            mobileNumberWithoutExtension: mobileNumberWithAreaCode(
                employmentAreaCode,
                employmentPhoneNumber
            ),
        });
    }
    if (
        employmentAreaCode &&
        employmentAreaCode !== "" &&
        employmentPhoneNumber &&
        employmentPhoneNumber !== "" &&
        employmentCountryCode &&
        employmentCountryCode !== ""
    ) {
        dispatch({
            type: EMPLOYMENT_MOBILE_NUMBER_WITH_EXTENSION_ACTION,
            mobileNumberWithExtension: mobileNumberWithAreaAndCountryCode(
                employmentCountryCode,
                employmentAreaCode,
                employmentPhoneNumber
            ),
        });
    }

    if (
        prePostQualReducer?.employmentDetails?.employerAddress?.address?.state?.value &&
        prePostQualReducer?.employmentDetails?.employerAddress?.address?.state?.value !== ""
    ) {
        const releventState = masterDataReducer.allState.find(
            ({ value }) =>
                value ===
                prePostQualReducer?.employmentDetails?.employerAddress?.address?.country?.code
        );
        var stateListData = JSON.stringify(releventState.name);
        const stateListDataArray = stateListData.split('"');
        const finalStateList = stateListDataArray[1].split(",");
        var stateList = [];
        var len = finalStateList?.length;
        for (var i = 0; i < len; i++) {
            stateList.push({
                name: finalStateList[i],
                value: finalStateList[i],
            });
        }

        filterDropdownList(
            prePostQualReducer?.employmentDetails?.employerAddress?.address?.state?.value,
            stateList,
            (index, value) => {
                dispatch({ type: EMPLOYMENT_STATE_ACTION, stateIndex: index, stateValue: value });
            }
        );
    }
    if (
        prePostQualReducer?.employmentDetails?.employerAddress?.address?.country?.value &&
        prePostQualReducer?.employmentDetails?.employerAddress?.address?.country?.value !== ""
    ) {
        filterDropdownList(
            prePostQualReducer?.employmentDetails?.employerAddress?.address?.country?.value,
            masterDataReducer.country,
            (index, value) => {
                dispatch({
                    type: EMPLOYMENT_COUNTRY_ACTION,
                    countryIndex: index,
                    countryValue: value,
                });
            }
        );
    }

    dispatch({ type: EMPLOYMENT_MOBILE_NUMBER_MASK_ACTION, isMobileNumberMaskingOn: true });
    dispatch({ type: EMPLOYMENT_ADDRESS_LINE_ONE_MASK_ACTION, isAddressLineOneMaskingOn: true });
    dispatch({ type: EMPLOYMENT_ADDRESS_LINE_TWO_MASK_ACTION, isAddressLineTwoMaskingOn: true });
    dispatch({
        type: EMPLOYMENT_ADDRESS_LINE_THREE_MASK_ACTION,
        isAddressLineThreeMaskingOn: true,
    });
    dispatch({ type: EMPLOYMENT_POSTAL_CODE_MASK_ACTION, isPostalCodeMaskingOn: false });
    dispatch({ type: EMPLOYMENT_CITY_MASK_ACTION, isCityMaskingOn: true });
};

function filterDropdownList(prefilledValue, dropdownList, updateFunction) {
    dropdownList?.find((item, index) => {
        const { name } = item;
        if (name?.toLowerCase() === prefilledValue?.toLowerCase()) updateFunction(index, item);
    });
}

function filterDropdownListByCode(prefilledValue, dropdownList, updateFunction) {
    dropdownList.find((item, index) => {
        const { value } = item;
        if (value?.toLowerCase() === prefilledValue?.toLowerCase()) updateFunction(index, item);
    });
}

const mobileNumberWithAreaCode = (areaCode, mobileNumber) =>
    `${areaCode.replace("0", "")}${mobileNumber}`;

const mobileNumberWithAreaAndCountryCode = (countryCode, areaCode, mobileNumber) =>
    `${countryCode}${areaCode.replace("0", "")}${mobileNumber}`;
