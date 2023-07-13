import * as ModelClass from "@utils/dataModel/modelClass";
import * as navigationConstant from "@navigation/navigationConstant";
import * as DataModel from "@utils/dataModel";
import * as Utility from "@utils/dataModel/utility";
import * as Strings from "@constants/strings";
import { maestepUpSubmit } from "@services/index";

export const preparestepUpData = (data) => {
    const finalData = {
        address1: data.addressone,
        address2: data.addresstwo,
        branchCode: data.branchValue,
        branchDistrict: data.branchStateValue,
        city: data.city,
        custStatus: data.custStatus,
        customerName: "",
        empType: data.employementValue,
        employerName: data.employeerName,
        gender: data.genderValue,
        m2uIndicator: data.m2uIndicator,
        maeAcctNo: data.maeAcctNo,
        monthlyIncome: data.incomeValue,
        occupation: data.ocupationValue,
        postalCode: data.postalCode,
        purpose: data.applicationpurpose,
        race: data.raceValue,
        residentialCountry: data.residenceCountryValue,
        sector: data.sectorValue,
        state: data.statevalue,
        title: data.titleValue,
        transactionType: "stepup",
    };
    return finalData;
};

export const validateFormData = (view) => {
    console.log("[StepUpController] >> [validateFormData]");

    // Validation checks on FullName field
    if (!AddressOneTextValidation(view, view.state.addressone)) {
        return false;
    }
    if (!AddressTwoTextValidation(view, view.state.addresstwo)) {
        return false;
    }
    if (!cityTextValidation(view, view.state.city)) {
        return false;
    }
    // Validation check for Mobile Number field
    if (!postCodeValidation(view, view.state.postalCode)) {
        return false;
    }
    if (!stateValidation(view, view.state.state)) {
        return false;
    }

    // Return true if no validation error
    return true;
};

export const validateRaceFormData = (view) => {
    console.log("[StepUpController] >> [validateRaceFormData]");

    // Validation check on Title field
    if (Utility.isEmpty(view.state.titleValue)) {
        showErrorPopup(view, "Please select a title.");
        return false;
    }

    // Validation check on Gender field
    if (!genderValidation(view, view.state.gender)) {
        return false;
    }

    // Validation check on Race field
    if (!raceValidation(view, view.state.race)) {
        return false;
    }

    // Validation check on Country field
    if (!residentcountryValidation(view, view.state.residentCountry)) {
        return false;
    }

    if (
        view.state.parmasType != "ApplyCard" &&
        !purposeofcardValidation(view, view.state.applicationpurpose)
    ) {
        return false;
    }

    // Return true if no validation error
    return true;
};

export const validateEmployementFormData = (view) => {
    console.log("[StepUpController] >> [validateEmployementFormData]");

    // Validation checks on FullName field
    if (!employeeTypeValidation(view, view.state.employeeType)) {
        return false;
    }

    if (!employerTextValidation(view, view.state.employeerName)) {
        return false;
    }

    // Validation check for Mobile Number field
    if (!monthlyincomeValidation(view, view.state.monthlyIncome)) {
        return false;
    }
    if (!ocupationValidation(view, view.state.ocupation)) {
        return false;
    }
    if (!sectorValidation(view, view.state.sector)) {
        return false;
    }

    // Return true if no validation error
    return true;
};
export const validatebranchFormData = (view) => {
    console.log("[StepUpController] >> [validatebranchFormData]");

    // Validation checks on FullName field
    if (!branchStateValidation(view, view.state.branchstate)) {
        return false;
    }
    if (!brancharesValidation(view, view.state.area)) {
        return false;
    }

    // Return true if no validation error
    return true;
};

export const genderValidation = (view, gender) => {
    console.log("[StepUpController] >> [genderValidation]", gender);
    // Check there are no other characters except numbers
    if (Utility.isEmpty(gender)) {
        showErrorPopup(view, "Please select gender.");
        return false;
    }

    // Return true if no validation error
    return true;
};

export const postCodeValidation = (view, number) => {
    console.log("[StepUpController] >> [postCodeValidation]");
    // Check there are no other characters except numbers
    if (!DataModel.maeOnlyNumberRegex(number)) {
        showErrorPopup(view, "Please enter a postcode.");
        return false;
    }

    // Min length check
    if (number.length < 5) {
        showErrorPopup(view, "Postcode should not be less than 5 characters");
        return false;
    }
    // Return true if no validation error
    return true;
};

export const showErrorPopup = (view, msg, title) => {
    console.log("[StepUpController] >> [showErrorPopup]");
    try {
        view.setState({
            isError: true,
            errorText: msg,
            errorTitleText: title && title != "" ? title : "MAYA",
        });
    } catch (e) {
        console.log("[TopUpAmount][showErrorPopup] >> Exception: ", e);
    }
};

export const AddressOneTextValidation = (view, InputText) => {
    console.log("[StepUpController] >> [AddressOneTextValidation]");

    if (Utility.isEmpty(InputText)) {
        showErrorPopup(view, "Please enter input in Address Line 1.");
        return false;
    }

    // Min length check
    if (InputText.length < 5) {
        showErrorPopup(view, "Address Line 1 must be more than 5 characters.");
        return false;
    }

    // Check for leading or double spaces
    if (!DataModel.leadingOrDoubleSpaceRegex(InputText)) {
        showErrorPopup(view, "Address Line 1 must not contain leading/double spaces.");
        return false;
    }

    // Address Line 1 Special Char check
    if (!DataModel.addressCharRegex(InputText)) {
        showErrorPopup(view, "Address Line 1 must not contain special character.");
        return false;
    }

    // Return true if no validation error
    return true;
};
export const AddressTwoTextValidation = (view, InputText) => {
    console.log("[StepUpController] >> [AddressTwoTextValidation]");

    if (Utility.isEmpty(InputText)) {
        showErrorPopup(view, "Please enter input in Address Line 2.");
        return false;
    }
    // Min length check
    if (InputText.length < 5) {
        showErrorPopup(view, "Address Line 2 must be more than 5 characters.");
        return false;
    }

    // Check for leading or double spaces
    if (!DataModel.leadingOrDoubleSpaceRegex(InputText)) {
        showErrorPopup(view, "Address Line 2 must not contain leading/double spaces.");
        return false;
    }

    // Address Line 2 Special Char check
    if (!DataModel.addressCharRegex(InputText)) {
        showErrorPopup(view, "Address Line 2 must not contain special character.");
        return false;
    }

    // Return true if no validation error
    return true;
};

export const cityTextValidation = (view, InputText) => {
    console.log("[StepUpController] >> [cityTextValidation]");

    if (Utility.isEmpty(InputText)) {
        showErrorPopup(view, "Please enter a city.");
        return false;
    }
    // Min length check
    if (InputText.length < 5) {
        showErrorPopup(view, "City must be more than 5 characters.");
        return false;
    }

    // Check for leading or double spaces
    if (!DataModel.leadingOrDoubleSpaceRegex(InputText)) {
        showErrorPopup(view, "City must not contain leading/double spaces.");
        return false;
    }

    if (!DataModel.cityCharRegex(InputText)) {
        showErrorPopup(view, "City must not contain special character.");
        return false;
    }

    // Return true if no validation error
    return true;
};

export const stateValidation = (view, InputText) => {
    console.log("[StepUpController] >> [stateValidation]");
    // Min length check
    if (InputText == "Select") {
        showErrorPopup(view, "Please select your state.");
        return false;
    }
    // Return true if no validation error
    return true;
};
export const onInputTextChange = (view, params) => {
    try {
        var key = params["key"];
        var value = params["value"];

        if (view.state.hasOwnProperty(key)) {
            view.setState({ [key]: value });
        }
    } catch (e) {
        console.log("[StepUpController][onInputTextChange] >> Exception: ", e);
    }
};

export const onRadioBtnTap = (view, params) => {
    console.log("[StepUpController] >> [onRadioBtnTap]");
    var radioBtnId = params.radioBtnId;
    if (radioBtnId == "Male") {
        view.setState({
            selectedIDType: radioBtnId,
            genderValue: "002",
            malechecked: true,
            femalechecked: false,
            gender: "Male",
        });
    } else if (radioBtnId == "Female") {
        view.setState({
            selectedIDType: radioBtnId,
            genderValue: "001",
            malechecked: false,
            femalechecked: true,
            gender: "Female",
        });
    }

    // Save data in global variable
};

export const raceValidation = (view, InputText) => {
    console.log("[StepUpController] >> [raceValidation]");
    // Min length check
    if (InputText == "Select") {
        showErrorPopup(view, "Please select race.");
        return false;
    }
    // Return true if no validation error
    return true;
};

export const residentcountryValidation = (view, InputText) => {
    console.log("[StepUpController] >> [residentcountryValidation]");
    // Min length check
    if (InputText == "Select") {
        showErrorPopup(view, "Please select Country of Permanent Residency.");
        return false;
    }

    // Return true if no validation error
    return true;
};
export const purposeofcardValidation = (view, InputText) => {
    console.log("[StepUpController] >> [purposeofcardValidation]");

    if (Utility.isEmpty(InputText)) {
        showErrorPopup(view, "Please enter Purpose of card application");
        return false;
    }

    // Min length check
    if (InputText.length < 5) {
        showErrorPopup(view, "card application should application at least be 5 characters");
        return false;
    }

    if (!DataModel.validateAlphaNumaric(InputText)) {
        showErrorPopup(view, "Please remove invalid special characters from card application");
        return false;
    }

    // Return true if no validation error
    return true;
};

export const employeeTypeValidation = (view, InputText) => {
    console.log("[StepUpController] >> [employeeTypeValidation]");
    // Min length check
    if (InputText == "Select") {
        showErrorPopup(view, "Please select employee type.");
        return false;
    }

    // Return true if no validation error
    return true;
};
export const employerTextValidation = (view, InputText) => {
    console.log("[StepUpController] >> [employerTextValidation]");

    // Empty check
    if (Utility.isEmpty(InputText)) {
        showErrorPopup(view, "Please enter employer's name.");
        return false;
    }

    // Check for leading or double spaces
    if (!DataModel.leadingOrDoubleSpaceRegex(InputText)) {
        showErrorPopup(view, "Employer name must not contain leading/double spaces");
        return false;
    }

    // Min length check
    if (InputText.length < 5) {
        showErrorPopup(view, "Employer Name should at least be 5 characters");
        return false;
    }

    // Employer Name Special Char check
    if (!DataModel.employerNameSpclCharRegex(InputText)) {
        showErrorPopup(view, "Employer name must not contain leading/double spaces");
        return false;
    }

    // Return true if no validation error
    return true;
};
export const monthlyincomeValidation = (view, InputText) => {
    console.log("[StepUpController] >> [monthlyincomeValidation]");
    // Min length check
    if (InputText == "Select") {
        showErrorPopup(view, "Please select monthly income.");
        return false;
    }
    // Return true if no validation error
    return true;
};

export const ocupationValidation = (view, InputText) => {
    console.log("[StepUpController] >> [ocupationValidation]");
    // Min length check
    if (InputText == "Select") {
        showErrorPopup(view, "Please select occupation.");
        return false;
    }

    // Return true if no validation error
    return true;
};

export const sectorValidation = (view, InputText) => {
    console.log("[StepUpController] >> [sectorValidation]");
    // Min length check
    if (InputText == "Select") {
        showErrorPopup(view, "Please select a sector.");
        return false;
    }

    // Return true if no validation error
    return true;
};

export const branchStateValidation = (view, InputText) => {
    console.log("[StepUpController] >> [branchStateValidation]");
    // Min length check
    if (InputText == "Select") {
        showErrorPopup(view, "Please select State");
        return false;
    }

    // Return true if no validation error
    return true;
};
export const brancharesValidation = (view, InputText) => {
    console.log("[StepUpController] >> [brancharesValidation]");
    // Min length check
    if (InputText == "Select") {
        showErrorPopup(view, "Please enter Area / District");
        return false;
    }

    // Return true if no validation error
    return true;
};

export const getStatesData = (data) => {
    console.log("[StepUpController] >> [getStatesData]");

    let state_data = [];
    for (var key in data.branchStateData.states.states) {
        let state_keys = Object.keys(data.branchStateData.states.states[key]);
        var obj = { statenames: state_keys };
        state_data.push(obj);
    }
    return state_data;
};

export const getRaceData = (race, data) => {
    console.log("[StepUpController] >> [getRaceData]");

    let raceData = data.find((d) => d.value === race);
    if (!raceData) {
        return (raceData = { display: "Select", value: "" });
    }
    return raceData;
};

export const getMonthlyIncomeData = (monthlyIncome, data) => {
    console.log("[StepUpController] >> [getMonthlyIncomeData]");

    let incomeData = data.find((d) => d.value === monthlyIncome);
    if (!incomeData) {
        return (raceData = { display: "Select", value: "" });
    }
    return incomeData;
};

export const getOcupationData = (occupation, data) => {
    console.log("[StepUpController] >> [getOcupationData]");

    let occupationData = data.find((d) => d.value === occupation);
    if (!occupationData) {
        return (raceData = { display: "Select", value: "" });
    }
    return occupationData;
};

export const getSectorData = (Sector, data) => {
    console.log("[StepUpController] >> [getSectorData]");

    let SectorData = data.find((d) => d.value === Sector);
    if (!SectorData) {
        return (raceData = { display: "Select", value: "" });
    }
    return SectorData;
};

export const getbranchData = (view, text, data) => {
    console.log("[StepUpController] >> [getbranchData]");

    for (var key in data.branchStateData.states.states) {
        let state_keys = Object.keys(data.branchStateData.states.states[key]);
        if (text == state_keys) {
            view.setState({
                DistData: data.branchStateData.states.states[key][text],
            });
        }
    }
};

export const maeSetpupSubmit = async (view, navigation, stepup_data) => {
    console.log("[StepUpController] >> [maeSetpupSubmit]");

    maestepUpSubmit(true, stepup_data)
        .then((response) => {
            console.log("[maeSetpupSubmit] >> Sucess");
            let result = response.data.result;
            let statuscode = result.statusCode;
            const status = statusCode == "0000" ? Strings.SUCC_STATUS : Strings.FAIL_STATUS;
            let detailsArray = [];

            if (statuscode == "0000") {
                if (!Utility.isEmpty(result.refId)) {
                    detailsArray.push({
                        key: "Ref ID",
                        value: result.refId,
                    });
                }
                if (!Utility.isEmpty(result.dateTime)) {
                    detailsArray.push({
                        key: "Time",
                        value: result.dateTime,
                    });
                }

                // ModelClass.MAE_FUNDING_DETAILS.statusDetailsArray = [
                // 	{
                // 		key: "Ref ID",
                // 		value: result.refId
                // 	},
                // 	{
                // 		key: "Time",
                // 		value: result.dateTime
                // 	}
                // ];

                navigation.navigate(navigationConstant.TOPUP_STATUS, {
                    PremierAccNumber: result.accountNo,
                    status: status,
                    detailsArray: detailsArray,
                });
            } else {
                console.log("[maeSetpupSubmit] >> Sucess", result.statusDesc);
                view.setState({ isError: true, errorText: result.statusDesc });
            }
        })
        .catch((error) => {
            console.log("[maeSetpupSubmit] >> Failure");
            view.setState({ isError: true, errorText: error.message });
        });
};
