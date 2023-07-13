import React, { Component } from "react";
import { Keyboard, Platform, ScrollView, StyleSheet, View, Modal } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import LabeledDropdown from "@components/FormComponents/LabeledDropdown";
import ScreenLayout from "@layouts/ScreenLayout";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ActionButton from "@components/Buttons/ActionButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";
import HeaderLayout from "@layouts/HeaderLayout";
import ScrollPicker from "@components/Pickers/ScrollPicker";

import { YELLOW, MEDIUM_GREY, DISABLED } from "@constants/colors";
import {
    PLEASE_SELECT,
    SUCC_STATUS,
    FAIL_STATUS,
    REFERENCE_ID,
    STEPUP_MAE_SUCESS,
    STEPUP_BRANCH_VISIT,
    COMMON_ERROR_MSG,
    STEPUP_BRANCH_ADDRESS,
    STEPUP_MAE_ADDRESS_STATE,
    STEPUP_MAE_ADDRESS_AREA,
    STEPUP_MAE_BRANCH,
    CONTINUE,
    DATE_AND_TIME,
} from "@constants/strings";
import { MAE_STEPUP_STATUS_SCREEN } from "@navigation/navigationConstant";
import { isEmpty } from "@utils/dataModel/utility";
import { maestepUpSubmit } from "@services/index";

class StepUpBranchScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // Main form state variable
            dropDownType: false,
            branchState: PLEASE_SELECT,
            branchDistrict: PLEASE_SELECT,
            branch: PLEASE_SELECT,
            stateId: "",
            stateData: [],
            branchData: [],
            branchStateValue: "",
            branchDistrictValue: "",
            branchCodeValue: "",
            distData: [],
            pickerData: [],
            keyname: "",
            type: "",

            showStatePicker: false,
            showAreaDistrictPicker: false,
            showBranchPicker: false,

            isNextDisabled: true,
        };
    }

    componentDidMount() {
        console.log("[StepUpBranchScreen] >> [componentDidMount]");

        this.setState({ stateData: this.props.route.params.masterdata.stateData });
        // Call method to manage data after init
        this.manageDataOnInit();
    }

    manageDataOnInit = () => {
        console.log("[StepUpBranchScreen] >> [manageDataOnInit]");

        const { stateData } = this.props.route.params.masterdata;
        const { state } = this.props.route.params.stepup_details;

        // Update state data from enquiry
        if (!isEmpty(state)) {
            const stateObj = this.getUserData(stateData, state, PLEASE_SELECT);
            this.setState({
                branchState: isEmpty(state) ? PLEASE_SELECT : stateObj.display,
                branchStateValue: isEmpty(state)
                    ? ""
                    : this.getUserData(stateData, state, "").value,
            });
            const data = this.getDistrictData(this.props.route.params.masterdata, stateObj.display);
            this.setState({ distData: data });
        }
    };

    getUserData = (dataArray, userValue, defaultValue) => {
        console.log("[StepUpRaceScreen] >> [getUserData]");

        let displayObj = dataArray.find((d) => d.value === userValue);
        if (!displayObj) {
            return (displayObj = { display: defaultValue, value: defaultValue });
        }
        return displayObj;
    };

    /* EVENT HANDLERS */

    onBackButtonPress = () => {
        console.log("[StepUpBranchScreen] >> [onBackButtonPress]");

        this.props.navigation.goBack();
    };

    onContinueButtonPress = () => {
        console.log("[StepUpBranchScreen] >> [onContinueButtonPress]");

        const isValidForm = this.isBranchFormValidation();
        if (isValidForm) {
            const nextParamToPass = { ...this.state };
            const stepUpReqData = this.prepareStepUpReqData(nextParamToPass);

            // Call Submit API
            this.maeStepUpSubmit(stepUpReqData);
        }
    };

    prepareStepUpReqData = (data) => {
        console.log("[StepUpBranchScreen] >> [prepareStepUpReqData]");

        const {
            stepup_details,
            employementDetails,
            raceDetailsInfo,
            addressDetailsInfo,
            trinityFlag,
        } = this.props.route.params;
        const raceScreenParams = this.getRaceScreenParams(raceDetailsInfo, trinityFlag);

        return {
            custStatus: stepup_details?.custStatus ?? "",
            m2uIndicator: stepup_details?.m2uIndicator ?? "",
            maeAcctNo: stepup_details?.maeAcctNo ?? "",
            customerName: "",

            // Address screen
            address1: addressDetailsInfo?.address1 ?? "",
            address2: addressDetailsInfo?.address2 ?? "",
            city: addressDetailsInfo?.city ?? "",
            postalCode: addressDetailsInfo?.postCode ?? "",

            // Race screen
            title: raceDetailsInfo?.custTitleValue ?? "",
            gender: raceDetailsInfo?.genderValue ?? "",
            purpose: raceDetailsInfo?.applicationpurpose ?? "",
            race: raceDetailsInfo?.raceValue ?? "",
            ...raceScreenParams,

            // Employment screen
            empType: employementDetails?.employementValue ?? "",
            employerName: employementDetails?.employeerName ?? "",
            monthlyIncome: employementDetails?.incomeValue ?? "",
            occupation: employementDetails?.ocupationValue ?? "",
            sector: employementDetails?.sectorValue ?? "",

            // Branch screen
            branchCode: data?.branchCodeValue ?? "",
            branchDistrict: data?.branchDistrictValue ?? "",
            state: data?.branchStateValue ?? "",

            transactionType: "stepup",
        };
    };

    getRaceScreenParams = (raceDetailsInfo, trinityFlag) => {
        console.log("[StepUpBranchScreen] >> [getRaceScreenParams]");

        if (trinityFlag === "Y") {
            return {
                countryOfBirth: raceDetailsInfo?.countryOfBirth ?? "",
                pep: raceDetailsInfo?.pep ?? "",
                sourceoffund: raceDetailsInfo?.sourceoffund ?? "",
                estimatedMonthlyTxnAmount: raceDetailsInfo?.estimatedMonthlyTxnAmount ?? "",
                estimatedMonthlyTxnVolume: raceDetailsInfo?.estimatedMonthlyTxnVolume ?? "",
            };
        } else {
            return { residentialCountry: raceDetailsInfo?.residenceCountryValue ?? "" };
        }
    };

    onSelectCmpPressed = (type) => {
        console.log("[StepUpBranchScreen] >> [onSelectCmpPressed]");
        Keyboard.dismiss();

        if (type === "state") {
            this.setState({
                showStatePicker: true,
                pickerData: this.props.route.params.masterdata.stateData,
                keyname: "display",
                type: "state",
            });
        } else if (type === "district") {
            this.setState({
                showAreaDistrictPicker: true,
                pickerData: this.state.distData,
                keyname: "display",
                type: "district",
            });
        } else if (type === "branch") {
            this.setState({
                showBranchPicker: true,
                pickerData: this.state.branchData,
                keyname: "branchName",
                type: "branch",
            });
        }
    };

    scrollPickerData = (data) => {
        if (!isEmpty(data)) {
            const { type } = this.state;

            if (type === "state") {
                return data.map((obj) => {
                    const { display, value } = obj;
                    return {
                        title: display,
                        value,
                    };
                });
            } else if (type === "district") {
                return data.map((obj) => {
                    const { display, value } = obj;
                    return {
                        title: display,
                        value,
                    };
                });
            } else if (type === "branch") {
                return data.map((obj) => {
                    return {
                        title: obj["branchName"],
                        value: obj["branchCode"],
                    };
                });
            }
        } else {
            return data.map((obj) => {
                return {
                    title: "",
                    value: "",
                };
            });
        }
    };

    onPickerDone = (value) => {
        console.log("[StepUpBranchScreen] >> [onPickerDone]");

        if (value) {
            const { type, stateData, pickerData } = this.state;
            const { masterdata } = this.props?.route?.params ?? {};

            if (type === "state") {
                const rec = stateData.find((data) => data.value == value);
                this.setState(
                    {
                        showStatePicker: false,
                        branchState: rec.display,
                        branchStateValue: value,
                        branchDistrict: PLEASE_SELECT,
                        branchDistrictValue: "",
                        branch: PLEASE_SELECT,
                        branchCodeValue: "",
                    },
                    () => {
                        this.enableDisableBtn();
                    }
                );
                const data = this.getDistrictData(masterdata, rec.display);
                this.setState({ distData: data });
            } else if (type === "district") {
                this.getBranchData(this, value, masterdata);
                this.setState(
                    {
                        showAreaDistrictPicker: false,
                        branchDistrict: value,
                        branchDistrictValue: value,
                        branch: PLEASE_SELECT,
                        branchCodeValue: "",
                    },
                    () => {
                        this.enableDisableBtn();
                    }
                );
            } else if (type === "branch") {
                const branchObj = pickerData.find((data) => data.branchCode === value);
                this.setState(
                    {
                        showBranchPicker: false,
                        branch: branchObj.branchName,
                        branchCodeValue: branchObj.branchCode,
                    },
                    () => {
                        this.enableDisableBtn();
                    }
                );
            }
        }
    };

    onPickerCancel = () => {
        console.log("[StepUpBranchScreen] >> [onPickerCancel]");

        const { type } = this.state;

        if (type === "state") {
            this.setState({ showStatePicker: false });
        } else if (type === "district") {
            this.setState({ showAreaDistrictPicker: false });
        } else if (type === "branch") {
            this.setState({ showBranchPicker: false });
        }
    };

    /* VALIDATIONS */

    isBranchFormValidation = () => {
        console.log("[StepUpBranchScreen] >> [isBranchFormValidation]");

        const { branchStateValue, branchDistrictValue, branchCodeValue } = this.state;

        return (
            branchStateValue.length > 0 &&
            branchDistrictValue.length > 0 &&
            branchCodeValue.length > 0
        );
    };

    /* API CALL */

    maeStepUpSubmit = (stepup_data) => {
        console.log("[StepUpBranchScreen] >> [maeStepUpSubmit]");
        maestepUpSubmit(true, stepup_data)
            .then((response) => {
                console.log("[maeStepUpSubmit] >> Success");
                let result = response.data.result;
                const statusCode = result.statusCode;
                const statusDesc = result.statusDesc;
                const status = statusCode === "0000" ? SUCC_STATUS : FAIL_STATUS;
                let detailsArray = [];

                if (statusCode === "0000") {
                    const accountNo = result.accountNo ?? "";
                    const refId = result?.refId ?? null;
                    const dateTime = result?.dateTime ?? null;

                    if (refId) {
                        detailsArray.push({
                            key: REFERENCE_ID,
                            value: refId,
                        });
                    }
                    if (dateTime) {
                        detailsArray.push({
                            key: DATE_AND_TIME,
                            value: dateTime,
                        });
                    }

                    // Navigate to status page
                    const headerText =
                        status === "success"
                            ? `${STEPUP_MAE_SUCESS} ${accountNo}`
                            : "Step up unsuccessful.";
                    const serverError = status === "success" ? STEPUP_BRANCH_VISIT : statusDesc;

                    this.props.navigation.navigate(MAE_STEPUP_STATUS_SCREEN, {
                        status: status,
                        headerText: headerText,
                        detailsArray,
                        serverError: serverError,
                        routeFrom: this.props.route.params.routeFrom,
                    });
                } else {
                    console.log("[maeStepUpSubmit] >> Failure:", result.statusDesc);

                    this.props.navigation.navigate(MAE_STEPUP_STATUS_SCREEN, {
                        status: FAIL_STATUS,
                        headerText: "Step up unsuccessful.",
                        serverError:
                            result && result.statusDesc ? result.statusDesc : COMMON_ERROR_MSG,
                        routeFrom: this.props.route.params.routeFrom,
                    });
                }
            })
            .catch((error) => {
                console.log("[maeStepUpSubmit] >> Failure");
                let navParams = {
                    status: FAIL_STATUS,
                    headerText: "Step up unsuccessful.",
                    serverError: error.message ? error.message : COMMON_ERROR_MSG,
                    routeFrom: this.props.route.params.routeFrom,
                };
                this.props.navigation.navigate(MAE_STEPUP_STATUS_SCREEN, navParams);
            });
    };

    /* OTHERS */

    getDistrictData = (data, state) => {
        console.log("[StepUpBranchScreen] >> [getDistrictData]");

        let districtDataArray = [];
        for (let key in data.branchStateData.states.district) {
            if (key == state) {
                districtDataArray = Object.values(data.branchStateData.states.district[key]);
                //sort
                districtDataArray.sort(function (a, b) {
                    return a.display.localeCompare(b.display);
                });
                break;
            }
        }
        return districtDataArray;
    };

    getBranchData = (view, text, data) => {
        console.log("[StepUpBranchScreen] >> [getBranchData]");

        for (let key in data.branchStateData.states.states) {
            let state_keys = Object.keys(data.branchStateData.states.states[key]);
            if (text == state_keys) {
                view.setState({
                    branchData: data.branchStateData.states.states[key][text],
                });
                break;
            }
        }
    };

    enableDisableBtn = () => {
        const { branchCodeValue, branch } = this.state;

        this.setState({
            isNextDisabled: branchCodeValue.length > 0 && branch.length > 0 ? false : true,
        });
    };

    render() {
        const {
            branchState,
            branchDistrict,
            branch,
            isNextDisabled,
            showStatePicker,
            showAreaDistrictPicker,
            showBranchPicker,
        } = this.state;

        return (
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                <React.Fragment>
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
                                                text={STEPUP_BRANCH_ADDRESS}
                                            />

                                            {/* STATE */}
                                            <LabeledDropdown
                                                label={STEPUP_MAE_ADDRESS_STATE}
                                                dropdownValue={branchState}
                                                onPress={() => this.onSelectCmpPressed("state")}
                                                style={{ marginTop: 25 }}
                                            />

                                            {/* AREA/DISTRICT */}
                                            <LabeledDropdown
                                                label={STEPUP_MAE_ADDRESS_AREA}
                                                dropdownValue={branchDistrict}
                                                onPress={() => this.onSelectCmpPressed("district")}
                                                style={{ marginTop: 25 }}
                                            />

                                            {/* BRANCH */}
                                            <LabeledDropdown
                                                label={STEPUP_MAE_BRANCH}
                                                dropdownValue={branch}
                                                onPress={() => this.onSelectCmpPressed("branch")}
                                                style={{ marginTop: 25 }}
                                            />
                                        </View>
                                    </KeyboardAwareScrollView>
                                </ScrollView>

                                {/* Continue Button */}
                                <View style={styles.footerButton}>
                                    <ActionButton
                                        fullWidth
                                        onPress={this.onContinueButtonPress}
                                        disabled={isNextDisabled}
                                        backgroundColor={isNextDisabled ? DISABLED : YELLOW}
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
                    {/* Picker */}
                    <Modal
                        animationIn="fadeIn"
                        animationOut="fadeOut"
                        hasBackdrop={false}
                        visible={showStatePicker || showAreaDistrictPicker || showBranchPicker}
                        style={{ margin: 0 }}
                        hideModalContentWhileAnimating
                        useNativeDriver
                        transparent
                    >
                        <View style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.75)" }}>
                            <ScrollPicker
                                showPicker={showStatePicker}
                                items={this.scrollPickerData(this.state.pickerData)}
                                onCancelButtonPressed={this.onPickerCancel}
                                onDoneButtonPressed={this.onPickerDone}
                            />
                            <ScrollPicker
                                showPicker={showAreaDistrictPicker}
                                items={this.scrollPickerData(this.state.pickerData)}
                                onCancelButtonPressed={this.onPickerCancel}
                                onDoneButtonPressed={this.onPickerDone}
                            />
                            <ScrollPicker
                                showPicker={showBranchPicker}
                                items={this.scrollPickerData(this.state.pickerData)}
                                onCancelButtonPressed={this.onPickerCancel}
                                onDoneButtonPressed={this.onPickerDone}
                            />
                        </View>
                    </Modal>
                </React.Fragment>
            </ScreenContainer>
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

    viewContainer: {
        flex: 1,
    },
});

export default StepUpBranchScreen;
