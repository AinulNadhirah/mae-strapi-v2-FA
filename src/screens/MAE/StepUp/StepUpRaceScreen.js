import React, { Component } from "react";
import { Keyboard, ScrollView, StyleSheet, View, TouchableOpacity } from "react-native";

import ScreenLayout from "@layouts/ScreenLayout";
import ColorRadioButton from "@components/Buttons/ColorRadioButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ActionButton from "@components/Buttons/ActionButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import LabeledDropdown from "@components/FormComponents/LabeledDropdown";
import HeaderLayout from "@layouts/HeaderLayout";
import { ScrollPickerView } from "@components/Common";
import RadioChecked from "@components/Common/RadioChecked";
import RadioUnchecked from "@components/Common/RadioUnchecked";

import { YELLOW, MEDIUM_GREY, DISABLED, BLACK } from "@constants/colors";
import { PLEASE_SELECT, CONTINUE, DONE, CANCEL } from "@constants/strings";
import { MAE_SETEPUP_EMPLOYMENT } from "@navigation/navigationConstant";
import { isEmpty } from "@utils/dataModel/utility";

class StepUpRaceScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // Title related
            custTitle: PLEASE_SELECT,
            custTitleValue: "",
            showCustTitlePicker: false,
            custTitleData: null,

            // Gender related
            malechecked: false,
            femalechecked: false,
            genderValue: "",
            gender: "",

            // Race related
            race: PLEASE_SELECT,
            raceValue: "",
            raceData: null,
            showRacePicker: false,

            // Country of residence related
            countryRes: PLEASE_SELECT,
            countryResValue: "",
            countryResData: null,
            showCountryResPicker: false,

            // Country of Birth related
            countryBirth: PLEASE_SELECT,
            countryBirthValue: null,
            countryBirthData: null,
            showCountryBirthPicker: false,

            // Politically Exposed related
            pep: null,

            // Source of Fund Country related
            sourceFund: PLEASE_SELECT,
            sourceFundValue: null,
            sourceFundData: null,
            showSourceFundPicker: false,

            // Purpose of account opening related
            purpose: PLEASE_SELECT,
            applicationPurpose: "",
            purposeData: null,
            showPurposePicker: false,

            // Estimated Monthly Transaction Amount related
            txnAmount: PLEASE_SELECT,
            txnAmountValue: null,
            txnAmountData: null,
            showTxnAmountPicker: false,

            // Expected Income Activity related
            txnVolume: PLEASE_SELECT,
            txnVolumeValue: null,
            txnVolumeData: null,
            showTxnVolumePicker: false,

            // Others
            isNextDisabled: true,
            selectedIDType: "",
            dropdownData: [],
            keyname: "",
            type: "",
            trinityFlag: "N",
        };
    }

    componentDidMount = () => {
        console.log("[StepUpRaceScreen] >> [componentDidMount]");

        // Call method to manage data after init
        this.manageDataOnInit();
    };

    manageDataOnInit = async () => {
        console.log("[StepUpRaceScreen] >> [manageDataOnInit]");

        const params = this.props?.route?.params ?? {};
        const { masterdata, stepup_details, idType, trinityFlag } = params;
        const {
            titleData,
            raceData,
            purposeData,
            countryResData,
            sourceOfFundCountry,
            countryOfBirth,
            estimatedMonthlyTxnAmount,
            estimatedMonthlyTxnVolume,
        } = await this.getDropdownData(masterdata, idType);

        const {
            title: existingTitle,
            gender,
            race: existingRace,
            residentCountry: countryRes,
            countryOfBirth: existingCountryOfBirth,
        } = stepup_details;
        const titleDefaultValue = await this.getDefaultValue(titleData, existingTitle);
        const raceDefaultValue = await this.getDefaultValue(raceData, existingRace);
        const countryResDefaultValue = await this.getDefaultValue(countryResData, countryRes);
        const purposeDefaultValue = await this.getDefaultValue(purposeData, "P002");
        const countryOfBirthDefaultValue = await this.getDefaultValue(
            countryOfBirth,
            existingCountryOfBirth
        );

        // Pre-populate existing values if any
        this.setState(
            {
                custTitle: titleDefaultValue.display,
                custTitleValue: titleDefaultValue.value,
                custTitleData: titleData,

                genderValue: isEmpty(gender) ? "" : gender,
                gender: isEmpty(gender) ? "" : gender === "002" ? "Male" : "Female",
                malechecked: gender === "002",
                femalechecked: gender === "001",

                race: raceDefaultValue.display,
                raceValue: raceDefaultValue.value,
                raceData: raceData,

                countryRes: countryResDefaultValue.display,
                countryResValue: countryResDefaultValue.value,
                countryResData: countryResData,

                countryBirth: countryOfBirthDefaultValue.display,
                countryBirthValue: countryOfBirthDefaultValue.value,
                countryBirthData: countryOfBirth,

                sourceFund: PLEASE_SELECT,
                sourceFundValue: null,
                sourceFundData: sourceOfFundCountry,

                purpose: purposeDefaultValue.display,
                applicationPurpose: purposeDefaultValue.value,
                purposeData: purposeData,

                txnAmount: PLEASE_SELECT,
                txnAmountValue: null,
                txnAmountData: estimatedMonthlyTxnAmount,

                txnVolume: PLEASE_SELECT,
                txnVolumeValue: null,
                txnVolumeData: estimatedMonthlyTxnVolume,

                trinityFlag,
            },
            () => {
                this.enableDisableBtn();
            }
        );
    };

    getDropdownData = (masterdata, idType) => {
        console.log("[StepUpRaceScreen] >> [getDropdownData]");

        const {
            residentialcountryforeigner,
            permanentresidentcountry,
            purpose,
            title,
            race,
            sourceOfFundCountry,
            countryOfBirth,
            estimatedMonthlyTxnAmount,
            estimatedMonthlyTxnVolume,
        } = masterdata;

        const titleData = title.map((item) => {
            return {
                ...item,
                name: item?.display ?? "",
            };
        });
        const raceData = race.map((item) => {
            return {
                ...item,
                name: item?.display ?? "",
            };
        });
        const purposeData = purpose.map((item) => {
            return {
                ...item,
                name: item?.display ?? "",
            };
        });
        const countryResData =
            idType === "05"
                ? residentialcountryforeigner.map((item) => {
                      return {
                          ...item,
                          name: item?.display ?? "",
                      };
                  })
                : permanentresidentcountry.map((item) => {
                      return {
                          ...item,
                          name: item?.display ?? "",
                      };
                  });

        return {
            titleData,
            raceData,
            purposeData,
            countryResData,
            sourceOfFundCountry,
            countryOfBirth,
            estimatedMonthlyTxnAmount,
            estimatedMonthlyTxnVolume,
        };
    };

    getDefaultValue = (dataArray, value, defaultTitle = PLEASE_SELECT, defaultValue = null) => {
        console.log("[StepUpRaceScreen] >> [getDefaultValue]");

        const defaultObj = { display: defaultTitle, name: defaultTitle, value: defaultValue };

        const findRecord = dataArray.find((item) => {
            const itemValue = item?.value ?? null;
            return value && itemValue && value.toLowerCase() === itemValue.toLowerCase();
        });
        if (!findRecord) return defaultObj;

        return {
            ...findRecord,
            name: findRecord?.name,
            display: findRecord?.name,
        };
    };

    /* EVENT HANDLERS */

    onBackButtonPress = () => {
        console.log("[StepUpRaceScreen] >> [onBackButtonPress]");

        this.props.navigation.goBack();
    };

    onContinueButtonPress = () => {
        console.log("[StepUpRaceScreen] >> [onContinueButtonPress]");

        var isValidForm = this.isRaceFormValidation();
        if (isValidForm) {
            const params = this.props?.route?.params ?? {};
            const formData = this.getFormData();

            this.props.navigation.navigate(MAE_SETEPUP_EMPLOYMENT, {
                ...params,
                raceDetailsInfo: formData,
            });
        }
    };

    getFormData = () => {
        console.log("[StepUpRaceScreen] >> [getFormData]");

        const {
            custTitleValue,
            genderValue,
            raceValue,
            countryBirthValue,
            pep,
            sourceFundValue,
            applicationPurpose,
            txnAmountValue,
            txnVolumeValue,
            countryResValue,
            trinityFlag,
        } = this.state;

        if (trinityFlag === "Y") {
            return {
                custTitleValue: custTitleValue,
                genderValue: genderValue,
                raceValue: raceValue,
                countryOfBirth: countryBirthValue,
                pep,
                sourceoffund: sourceFundValue,
                applicationpurpose: applicationPurpose,
                estimatedMonthlyTxnAmount: txnAmountValue,
                estimatedMonthlyTxnVolume: txnVolumeValue,
            };
        } else {
            return {
                custTitleValue: custTitleValue,
                genderValue: genderValue,
                raceValue: raceValue,
                applicationpurpose: applicationPurpose,
                residenceCountryValue: countryResValue,
            };
        }
    };

    onRadioBtnTap(params) {
        console.log("[StepUpRaceScreen] >> [onRadioBtnTap]");

        const radioBtnId = params.radioBtnId;
        if (radioBtnId === "Male") {
            this.setState(
                {
                    selectedIDType: radioBtnId,
                    genderValue: "002",
                    malechecked: true,
                    femalechecked: false,
                    gender: "Male",
                },
                () => {
                    this.enableDisableBtn();
                }
            );
        } else if (radioBtnId === "Female") {
            this.setState(
                {
                    selectedIDType: radioBtnId,
                    genderValue: "001",
                    malechecked: false,
                    femalechecked: true,
                    gender: "Female",
                },
                () => {
                    this.enableDisableBtn();
                }
            );
        }
    }

    onTitleFieldTap = () => this.onSelectCmpPressed("custTitle");

    onRaceFieldTap = () => this.onSelectCmpPressed("race");

    onCountryOfResFieldTap = () => this.onSelectCmpPressed("countryRes");

    onPurposeFieldTap = () => this.onSelectCmpPressed("purpose");

    onCountryBirthFieldTap = () => this.onSelectCmpPressed("countryBirth");

    onSourceFundFieldTap = () => this.onSelectCmpPressed("sourceFund");

    onTxnAmountFieldTap = () => this.onSelectCmpPressed("txnAmount");

    onTxnVolumeFieldTap = () => this.onSelectCmpPressed("txnVolume");

    onSelectCmpPressed = (type) => {
        console.log("[StepUpRaceScreen] >> [onSelectCmpPressed]");

        Keyboard.dismiss();

        const {
            custTitleData,
            raceData,
            countryResData,
            purposeData,
            countryBirthData,
            sourceFundData,
            txnAmountData,
            txnVolumeData,
        } = this.state;

        switch (type) {
            case "custTitle":
                if (custTitleData) {
                    this.setState({
                        showCustTitlePicker: true,
                        type: type,
                    });
                }
                break;
            case "race":
                if (raceData) {
                    this.setState({
                        showRacePicker: true,
                        type: type,
                    });
                }
                break;
            case "countryRes":
                if (countryResData) {
                    this.setState({
                        showCountryResPicker: true,
                        type: type,
                    });
                }
                break;
            case "purpose":
                if (purposeData) {
                    this.setState({
                        showPurposePicker: true,
                        type: type,
                    });
                }
                break;
            case "countryBirth":
                if (countryBirthData) {
                    this.setState({
                        showCountryBirthPicker: true,
                        type: type,
                    });
                }
                break;
            case "sourceFund":
                if (sourceFundData) {
                    this.setState({
                        showSourceFundPicker: true,
                        type: type,
                    });
                }
                break;
            case "txnAmount":
                if (txnAmountData) {
                    this.setState({
                        showTxnAmountPicker: true,
                        type: type,
                    });
                }
                break;
            case "txnVolume":
                if (txnVolumeData) {
                    this.setState({
                        showTxnVolumePicker: true,
                        type: type,
                    });
                }
                break;
            default:
                break;
        }
    };

    onPickerDone = (item) => {
        console.log("[StepUpRaceScreen] >> [onPickerDone]");

        if (item) {
            const { type } = this.state;

            switch (type) {
                case "custTitle":
                    this.setState(
                        {
                            custTitle: item.display,
                            custTitleValue: item.value,
                        },
                        () => {
                            this.enableDisableBtn();
                        }
                    );
                    break;
                case "race":
                    this.setState(
                        {
                            race: item.display,
                            raceValue: item.value,
                        },
                        () => {
                            this.enableDisableBtn();
                        }
                    );
                    break;
                case "countryRes":
                    this.setState(
                        {
                            countryRes: item.display,
                            countryResValue: item.value,
                        },
                        () => {
                            this.enableDisableBtn();
                        }
                    );
                    break;
                case "purpose":
                    this.setState(
                        {
                            purpose: item.display,
                            applicationPurpose: item.value,
                        },
                        () => {
                            this.enableDisableBtn();
                        }
                    );
                    break;
                case "countryBirth":
                    this.setState(
                        {
                            countryBirth: item.name,
                            countryBirthValue: item.value,
                        },
                        () => {
                            this.enableDisableBtn();
                        }
                    );
                    break;
                case "sourceFund":
                    this.setState(
                        {
                            sourceFund: item.name,
                            sourceFundValue: item.value,
                        },
                        () => {
                            this.enableDisableBtn();
                        }
                    );
                    break;
                case "txnAmount":
                    this.setState(
                        {
                            txnAmount: item.name,
                            txnAmountValue: item.value,
                        },
                        () => {
                            this.enableDisableBtn();
                        }
                    );
                    break;
                case "txnVolume":
                    this.setState(
                        {
                            txnVolume: item.name,
                            txnVolumeValue: item.value,
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

        // Close the picker
        this.onPickerCancel();
    };

    onPickerCancel = () => {
        console.log("[StepUpRaceScreen] >> [onPickerCancel]");

        this.setState({
            showCustTitlePicker: false,
            showRacePicker: false,
            showCountryResPicker: false,
            showPurposePicker: false,
            showCountryBirthPicker: false,
            showSourceFundPicker: false,
            showTxnAmountPicker: false,
            showTxnVolumePicker: false,
        });
    };

    onYesRadioTap = () => {
        console.log("[StepUpRaceScreen] >> [onYesRadioTap]");

        this.setState({ pep: "Yes" }, () => {
            this.enableDisableBtn();
        });
    };

    onNoRadioTap = () => {
        console.log("[StepUpRaceScreen] >> [onNoRadioTap]");

        this.setState({ pep: "No" }, () => {
            this.enableDisableBtn();
        });
    };

    /* VALIDATIONS */

    isRaceFormValidation = () => {
        console.log("[StepUpRaceScreen] >> [isRaceFormValidation]");

        const {
            custTitleValue,
            genderValue,
            raceValue,
            countryResValue,
            applicationPurpose,
            countryBirthValue,
            sourceFundValue,
            pep,
            txnAmountValue,
            txnVolumeValue,
            trinityFlag,
        } = this.state;

        if (trinityFlag === "Y") {
            return (
                custTitleValue &&
                genderValue &&
                raceValue &&
                applicationPurpose &&
                countryBirthValue &&
                sourceFundValue &&
                pep &&
                txnAmountValue &&
                txnVolumeValue
            );
        } else {
            return (
                custTitleValue && genderValue && raceValue && countryResValue && applicationPurpose
            );
        }
    };

    enableDisableBtn = () => {
        const {
            custTitleValue,
            genderValue,
            raceValue,
            countryResValue,
            applicationPurpose,
            countryBirthValue,
            sourceFundValue,
            pep,
            txnAmountValue,
            txnVolumeValue,
            trinityFlag,
        } = this.state;

        if (trinityFlag === "Y") {
            this.setState({
                isNextDisabled: !(
                    custTitleValue &&
                    genderValue &&
                    raceValue &&
                    applicationPurpose &&
                    countryBirthValue &&
                    sourceFundValue &&
                    pep &&
                    txnAmountValue &&
                    txnVolumeValue
                ),
            });
        } else {
            this.setState({
                isNextDisabled: !(
                    custTitleValue &&
                    genderValue &&
                    raceValue &&
                    countryResValue &&
                    applicationPurpose
                ),
            });
        }
    };

    render() {
        const {
            malechecked,
            femalechecked,
            custTitle,
            race,
            countryRes,
            purpose,
            showCustTitlePicker,
            showRacePicker,
            showCountryResPicker,
            showPurposePicker,
            isNextDisabled,
            custTitleData,
            raceData,
            countryResData,
            purposeData,
            countryBirth,
            sourceFund,
            pep,
            txnAmount,
            txnVolume,
            countryBirthData,
            sourceFundData,
            txnAmountData,
            txnVolumeData,
            showCountryBirthPicker,
            showSourceFundPicker,
            showTxnAmountPicker,
            showTxnVolumePicker,
            trinityFlag,
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
                        <View style={styles.viewContainer}>
                            <ScrollView>
                                <View style={styles.formContainer}>
                                    <Typo
                                        fontSize={20}
                                        lineHeight={28}
                                        fontWeight="300"
                                        letterSpacing={0}
                                        textAlign="left"
                                        text={"Fill in the required details below."}
                                    />

                                    {/* Title */}
                                    <LabeledDropdown
                                        label="Title"
                                        dropdownValue={custTitle}
                                        onPress={this.onTitleFieldTap}
                                        style={styles.labeledDropdownCls}
                                    />

                                    {/* Gender */}
                                    <View style={styles.fieldContainer}>
                                        <Typo
                                            fontSize={14}
                                            lineHeight={18}
                                            textAlign="left"
                                            text="Gender"
                                        />
                                        <View style={styles.radioContainer}>
                                            <View style={styles.leftRadioBtn}>
                                                <ColorRadioButton
                                                    title="Male"
                                                    isSelected={malechecked}
                                                    fontSize={14}
                                                    onRadioButtonPressed={(value) => {
                                                        this.onRadioBtnTap({
                                                            radioBtnId: "Male",
                                                        });
                                                    }}
                                                />
                                            </View>
                                            <View style={styles.rightRadioBtn}>
                                                <ColorRadioButton
                                                    title="Female"
                                                    isSelected={femalechecked}
                                                    fontSize={14}
                                                    onRadioButtonPressed={(value) => {
                                                        this.onRadioBtnTap({
                                                            radioBtnId: "Female",
                                                        });
                                                    }}
                                                />
                                            </View>
                                        </View>
                                    </View>

                                    {/* RACE */}
                                    <LabeledDropdown
                                        label="Race"
                                        dropdownValue={race}
                                        onPress={this.onRaceFieldTap}
                                        style={styles.labeledDropdownCls}
                                    />

                                    {/* Country of Birth */}
                                    {trinityFlag === "Y" && (
                                        <LabeledDropdown
                                            label="Country of Birth"
                                            dropdownValue={countryBirth}
                                            onPress={this.onCountryBirthFieldTap}
                                            style={styles.labeledDropdownCls}
                                        />
                                    )}

                                    {/* Politically Exposed */}
                                    {trinityFlag === "Y" && (
                                        <View style={styles.labeledDropdownCls}>
                                            <Typo
                                                fontSize={14}
                                                lineHeight={19}
                                                textAlign="left"
                                                text="Are you a politically exposed person?"
                                            />
                                            <View style={styles.radioBtnOuterViewCls}>
                                                <TouchableOpacity
                                                    activeOpacity={1}
                                                    onPress={this.onYesRadioTap}
                                                    style={styles.radioBtnViewCls}
                                                >
                                                    {pep === "Yes" ? (
                                                        <RadioChecked
                                                            label="Yes"
                                                            paramLabelCls={styles.radioBtnLabelCls}
                                                            checkType="color"
                                                        />
                                                    ) : (
                                                        <RadioUnchecked
                                                            label="Yes"
                                                            paramLabelCls={styles.radioBtnLabelCls}
                                                        />
                                                    )}
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    activeOpacity={1}
                                                    onPress={this.onNoRadioTap}
                                                    style={styles.radioBtnViewCls}
                                                >
                                                    {pep === "No" ? (
                                                        <RadioChecked
                                                            label="No"
                                                            paramLabelCls={styles.radioBtnLabelCls}
                                                            checkType="color"
                                                        />
                                                    ) : (
                                                        <RadioUnchecked
                                                            label="No"
                                                            paramLabelCls={styles.radioBtnLabelCls}
                                                        />
                                                    )}
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    )}

                                    {/* Country Of Residence */}
                                    {trinityFlag === "N" && (
                                        <LabeledDropdown
                                            label="Country of Residence"
                                            dropdownValue={countryRes}
                                            onPress={this.onCountryOfResFieldTap}
                                            style={styles.labeledDropdownCls}
                                        />
                                    )}

                                    {/* Source of Fund Country */}
                                    {trinityFlag === "Y" && (
                                        <LabeledDropdown
                                            label="Source of Fund Country"
                                            dropdownValue={sourceFund}
                                            onPress={this.onSourceFundFieldTap}
                                            style={styles.labeledDropdownCls}
                                        />
                                    )}

                                    {/* Purpose of Account Opening */}
                                    <LabeledDropdown
                                        label="Purpose of Account Opening"
                                        dropdownValue={purpose}
                                        onPress={this.onPurposeFieldTap}
                                        style={styles.labeledDropdownCls}
                                    />

                                    {/* Estimated Monthly Transaction Amount */}
                                    {trinityFlag === "Y" && (
                                        <LabeledDropdown
                                            label="Estimated Monthly Transaction Amount"
                                            dropdownValue={txnAmount}
                                            onPress={this.onTxnAmountFieldTap}
                                            style={styles.labeledDropdownCls}
                                        />
                                    )}

                                    {/* Estimated Monthly Transaction Volume */}
                                    {trinityFlag === "Y" && (
                                        <LabeledDropdown
                                            label="Estimated Monthly Transaction Volume"
                                            dropdownValue={txnVolume}
                                            onPress={this.onTxnVolumeFieldTap}
                                            style={styles.labeledDropdownCls}
                                        />
                                    )}
                                </View>
                            </ScrollView>

                            {/* Continue Button */}
                            <FixedActionContainer>
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
                            </FixedActionContainer>
                        </View>
                    </ScreenLayout>
                </ScreenContainer>

                {/* Title Picker */}
                {custTitleData && (
                    <ScrollPickerView
                        showMenu={showCustTitlePicker}
                        list={custTitleData}
                        onRightButtonPress={this.onPickerDone}
                        onLeftButtonPress={this.onPickerCancel}
                        rightButtonText={DONE}
                        leftButtonText={CANCEL}
                    />
                )}

                {/* Race Picker */}
                {raceData && (
                    <ScrollPickerView
                        showMenu={showRacePicker}
                        list={raceData}
                        onRightButtonPress={this.onPickerDone}
                        onLeftButtonPress={this.onPickerCancel}
                        rightButtonText={DONE}
                        leftButtonText={CANCEL}
                    />
                )}

                {/* Country of Residence Picker */}
                {countryResData && (
                    <ScrollPickerView
                        showMenu={showCountryResPicker}
                        list={countryResData}
                        onRightButtonPress={this.onPickerDone}
                        onLeftButtonPress={this.onPickerCancel}
                        rightButtonText={DONE}
                        leftButtonText={CANCEL}
                    />
                )}

                {/* Purpose of Account Opening Picker */}
                {purposeData && (
                    <ScrollPickerView
                        showMenu={showPurposePicker}
                        list={purposeData}
                        onRightButtonPress={this.onPickerDone}
                        onLeftButtonPress={this.onPickerCancel}
                        rightButtonText={DONE}
                        leftButtonText={CANCEL}
                    />
                )}

                {/* Country of Birth Picker */}
                {countryBirthData && (
                    <ScrollPickerView
                        showMenu={showCountryBirthPicker}
                        list={countryBirthData}
                        onRightButtonPress={this.onPickerDone}
                        onLeftButtonPress={this.onPickerCancel}
                        rightButtonText={DONE}
                        leftButtonText={CANCEL}
                    />
                )}

                {/* Source of Fund Country Picker */}
                {sourceFundData && (
                    <ScrollPickerView
                        showMenu={showSourceFundPicker}
                        list={sourceFundData}
                        onRightButtonPress={this.onPickerDone}
                        onLeftButtonPress={this.onPickerCancel}
                        rightButtonText={DONE}
                        leftButtonText={CANCEL}
                    />
                )}

                {/* Estimated Monthly Transaction Amount Picker */}
                {txnAmountData && (
                    <ScrollPickerView
                        showMenu={showTxnAmountPicker}
                        list={txnAmountData}
                        onRightButtonPress={this.onPickerDone}
                        onLeftButtonPress={this.onPickerCancel}
                        rightButtonText={DONE}
                        leftButtonText={CANCEL}
                    />
                )}

                {/* Estimated Monthly Transaction Volume Picker */}
                {txnVolumeData && (
                    <ScrollPickerView
                        showMenu={showTxnVolumePicker}
                        list={txnVolumeData}
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
    fieldContainer: {
        marginTop: 25,
    },

    formContainer: {
        marginBottom: 40,
        marginHorizontal: 36,
    },

    labeledDropdownCls: {
        marginTop: 25,
    },

    leftRadioBtn: {
        width: "100%",
    },

    radioBtnLabelCls: {
        color: BLACK,
        fontFamily: "montserrat",
        fontSize: 14,
        fontStyle: "normal",
        fontWeight: "600",
        letterSpacing: 0,
        lineHeight: 18,
        paddingLeft: 10,
    },

    radioBtnOuterViewCls: {
        flexDirection: "row",
        marginTop: 15,
    },

    radioBtnViewCls: {
        justifyContent: "center",
        width: 100,
    },

    radioContainer: {
        flexDirection: "row",
    },

    rightRadioBtn: {
        height: 50,
        marginLeft: 90,
        position: "absolute",
    },

    viewContainer: {
        flex: 1,
    },
});

export default StepUpRaceScreen;
