import PropTypes from "prop-types";
import React, { Component } from "react";
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Keyboard,
    Platform,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import LinearGradient from "react-native-linear-gradient";

import * as navigationConstant from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import { LongTextInput } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import ScrollPicker from "@components/Pickers/ScrollPicker";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { withModelContext } from "@context";

import {
    YELLOW,
    DISABLED,
    BLACK,
    WHITE,
    DISABLED_TEXT,
    MEDIUM_GREY,
    GREY,
} from "@constants/colors";
import {
    UNEMPLOYED_OCCUPATION_LIST,
    OUTSIDE_LABOUR_FORCE,
    NOT_APPLICABLE_UNEMPLOYED_OUTSIDE_LABOUR_FORCE,
} from "@constants/data";
import {
    PLEASE_SELECT,
    UPDATE_DETAILS,
    EMPLOYER_NAME_SPACES,
    EMPLOYER_NAME_SPL_CHAR,
    CONTINUE,
    FILL_EMPLOYMENT_DETAIL,
    PLSTP_OCCUPATION,
    PLSTP_EMPLOYER_NAME,
    PLSTP_EMPLOYMENT_TYPE,
    PLSTP_EMPLOYER_NAME_PH,
    OCCUPATION_SECTOR,
    FA_APPLY_MAE_EMPLOYMENTDETAILS,
} from "@constants/strings";

import * as DataModel from "@utils/dataModel";

import Assets from "@assets";

import * as MAEOnboardController from "./MAEOnboardController";

class MAEOnboardEmploymentDetails extends Component {
    static propTypes = {
        getModel: PropTypes.func,
        updateModel: PropTypes.func,
        route: PropTypes.object,
        navigation: PropTypes.object,
    };
    static navigationOptions = ({ navigation: { navigate } }) => ({
        title: "",
        header: null,
    });
    constructor(props) {
        super(props);
        this.state = {
            filledUserDetails: props.route.params?.filledUserDetails,

            isNextDisabled: true,

            employeeType: PLEASE_SELECT,
            occupation: PLEASE_SELECT,
            sector: PLEASE_SELECT,

            employeeTypeid: "",
            occupationid: "",
            sectorid: "",

            employeeTypeData:
                props.route.params?.filledUserDetails?.masterData?.employmentType || [],
            occupationData: props.route.params?.filledUserDetails?.masterData?.occupation || [],
            sectorData: props.route.params?.filledUserDetails?.masterData?.sector || [],

            employerName: "",

            isValidEmployerName: "",

            employeeTypeDisplayPicker: false,
            occupationDisplayPicker: false,
            sectorDisplayPicker: false,
            showEmployerDetails: false,
        };
        console.log("MAEOnboardEmploymentDetails:state----------", this.state);
    }

    componentDidMount() {
        console.log("[MAEOnboardEmploymentDetails] >> [componentDidMount]");
        this.setScrollData();
    }

    setScrollData = () => {
        const { employeeTypeData, occupationData, sectorData } = this.state;
        this.setState({
            employeeTypeData: this.scrollPickerData(employeeTypeData),
            occupationData: this.scrollPickerData(occupationData),
            sectorData: this.scrollPickerData(sectorData),
        });
    };

    onBackTap = () => {
        console.log("[MAEOnboardEmploymentDetails] >> [onBackTap]");
        this.props.navigation.goBack();
    };

    onCloseTap = () => {
        console.log("[MAEOnboardEmploymentDetails] >> [onCloseTap]");
        const { filledUserDetails } = this.state;
        this.props.navigation.navigate(filledUserDetails?.entryStack || "More", {
            screen: filledUserDetails?.entryScreen || "Apply",
            params: filledUserDetails?.entryParams,
        });
    };

    onContinueTap = async () => {
        console.log("[MAEOnboardEmploymentDetails] >> [onContinueTap]");
        const { showEmployerDetails } = this.state;
        const validateEmploymentDetails = !showEmployerDetails || this.validateAnswer();
        if (validateEmploymentDetails) {
            const filledUserDetails = this.prepareUserDetails();
            if (filledUserDetails?.from === UPDATE_DETAILS) {
                //New API call
                const response = await MAEOnboardController.updateAddress(filledUserDetails);
                if (response.message) {
                    showErrorToast({
                        message: response.message,
                    });
                } else {
                    if (response.statusCode === "0000") {
                        if (
                            filledUserDetails.loginData?.resumeStageInd &&
                            filledUserDetails.loginData?.resumeStageInd === 1
                        ) {
                            this.props.navigation.navigate(
                                navigationConstant.UPLOAD_SECURITY_IMAGE,
                                { filledUserDetails }
                            );
                        } else if (
                            filledUserDetails.loginData?.rsaIndicator &&
                            filledUserDetails.loginData?.rsaIndicator !== 2
                        ) {
                            this.props.navigation.navigate(
                                navigationConstant.MAE_SECURITY_QUESTIONS,
                                { filledUserDetails }
                            );
                        } else {
                            this.props.navigation.navigate(navigationConstant.MAE_RESUME_SUCCESS, {
                                filledUserDetails,
                            });
                        }
                    } else {
                        showErrorToast({
                            message: response.statuDesc,
                        });
                    }
                }
            } else {
                this.props.navigation.navigate(navigationConstant.MAE_ONBOARD_DECLARATION, {
                    filledUserDetails,
                });
            }
        }
    };

    prepareUserDetails = () => {
        console.log("MAEOnboardEmploymentDetails >> [prepareUserDetails]");
        const {
            employeeType,
            employerName,
            occupation,
            sector,
            employeeTypeid,
            occupationid,
            sectorid,
        } = this.state;
        const employmentDetails = {
            employeeType,
            employerName,
            occupation,
            sector,
            employeeTypeid,
            occupationid,
            sectorid,
        };
        const MAEUserDetails = this.state.filledUserDetails || {};
        MAEUserDetails.MAEOnboardEmploymentDetails = employmentDetails;
        return MAEUserDetails;
    };

    validateAnswer = () => {
        console.log("[CardManagementController] >> [validateEmpName]");
        const { employerName } = this.state;
        let err = "";
        const err1 = EMPLOYER_NAME_SPACES;
        const err2 = EMPLOYER_NAME_SPL_CHAR;
        // Check for leading or double spaces
        if (!DataModel.leadingOrDoubleSpaceRegex(employerName)) {
            err = err1;
        }

        // Employer Name Special Char check
        if (!DataModel.employerNameSpclCharRegex(employerName)) {
            err = err2;
        }
        this.setState({ isValidEmployerName: err });
        // Return true if no validation error
        return err ? false : true;
    };

    onInputTextChange = (value) => {
         this.setState(
            {
                employerName: value,
                isValidEmployerName: "",
            },
            () => {
                this.enableDisableBtn();
            }
        );
    };

    enableDisableBtn = () => {
        console.log("[MAEOnboardEmploymentDetails] >> [enableDisableBtn]");

        const { employerName, employeeType, occupation, sector, showEmployerDetails } = this.state;
        if (
            (!showEmployerDetails || employerName) &&
            employeeType !== PLEASE_SELECT &&
            occupation !== PLEASE_SELECT &&
            sector !== PLEASE_SELECT
        ) {
            this.setState({
                isNextDisabled: false,
            });
        } else {
            this.setState({
                isNextDisabled: true,
            });
        }
    };

    isUnemployedOccupation = (value) => {
        let empDetails = {
            showEmployerDetails: true,
            employeeTypeid: "",
            employeeType: PLEASE_SELECT,
            sectorid: "",
            sector: PLEASE_SELECT,
            employerName: "",
        };
      const isUnemployedOccupationSelected = UNEMPLOYED_OCCUPATION_LIST.filter(
            (item) => item.value === value
        );

        if (isUnemployedOccupationSelected.length) {
            empDetails = {
                showEmployerDetails: false,
                employeeTypeid: OUTSIDE_LABOUR_FORCE.value,
                employeeType: OUTSIDE_LABOUR_FORCE.title,
                sectorid: NOT_APPLICABLE_UNEMPLOYED_OUTSIDE_LABOUR_FORCE.value,
                sector: NOT_APPLICABLE_UNEMPLOYED_OUTSIDE_LABOUR_FORCE.title,
                employerName: "",
            };
        }
        this.setState(
            {
                ...empDetails,
            },
            () => {
                this.enableDisableBtn();
            }
        );
    };

    onOccupationClicked = () => {
        Keyboard.dismiss();
        this.setState((prevState) => ({
            occupationDisplayPicker: !prevState.occupationDisplayPicker,
        }));
    };

    onEmployerTypeClicked = () => {
        Keyboard.dismiss();
        this.setState((prevState) => ({
            employeeTypeDisplayPicker: !prevState.employeeTypeDisplayPicker,
        }));
    };

    onOccupationSectorClicked = () => {
        Keyboard.dismiss();
        this.setState((prevState) => ({
            sectorDisplayPicker: !prevState.sectorDisplayPicker,
        }));
    };

    onDoneEmployeeType = (value) => {
        console.log("[MAEOnboardEmploymentDetails] >> [onDoneButtonPress]");
        const { employeeTypeData } = this.state;
        if (value) {
            const employmentDetails = employeeTypeData.find(
                (employmentInfo) => employmentInfo.value === value
            );
            this.setState(
                {
                    employeeTypeid: value,
                    employeeType: employmentDetails.title,
                    employeeTypeDisplayPicker: false,
                },
                () => {
                    this.enableDisableBtn();
                }
            );
        }
    };
    onDoneOccupation = (value) => {
        console.log("[MAEOnboardEmploymentDetails] >> [onDoneButtonPress]");
        const { occupationData } = this.state;
        if (value) {
            const employmentDetails = occupationData.find(
                (employmentInfo) => employmentInfo.value === value
            );
            this.setState(
                {
                    occupationid: value,
                    occupation: employmentDetails.title,
                    occupationDisplayPicker: false,
                },
                () => {
                    this.isUnemployedOccupation(value);
                }
            );
        }
    };
    onDoneSector = (value) => {
        console.log("[MAEOnboardEmploymentDetails] >> [onDoneButtonPress]");
        const { sectorData } = this.state;
        if (value) {
            const employmentDetails = sectorData.find(
                (employmentInfo) => employmentInfo.value === value
            );
            this.setState(
                {
                    sectorid: value,
                    sector: employmentDetails.title,
                    sectorDisplayPicker: false,
                },
                () => {
                    this.enableDisableBtn();
                }
            );
        }
    };
    
    scrollPickerData = (data) => {
        console.log("[MAEOnboardEmploymentDetails] >> [scrollPickerData]");
        return data.map((obj) => {
            const { display, value } = obj;
            return {
                title: display,
                value,
            };
        });
    };

    render() {
        const {
            employeeType,
            occupation,
            sector,
            employeeTypeData,
            occupationData,
            sectorData,
            employerName,
            isValidEmployerName,
            employeeTypeDisplayPicker,
            occupationDisplayPicker,
            sectorDisplayPicker,
            isNextDisabled,
            filledUserDetails,
            showEmployerDetails
        } = this.state;
        return (
            <React.Fragment>
                <ScreenContainer
                    backgroundType="color"
                    backgroundColor={MEDIUM_GREY}
                    showOverlay={
                        employeeTypeDisplayPicker || occupationDisplayPicker || sectorDisplayPicker
                    }
                    analyticScreenName={FA_APPLY_MAE_EMPLOYMENTDETAILS}
                >
                    <View style={styles.viewContainer}>
                        <ScreenLayout
                            paddingBottom={0}
                            paddingTop={0}
                            paddingHorizontal={0}
                            useSafeArea
                            header={
                                filledUserDetails?.from !== UPDATE_DETAILS
? (
                                    <HeaderLayout
                                        headerLeftElement={
                                            <HeaderBackButton onPress={this.onBackTap} />
                                        }
                                        headerRightElement={
                                            <HeaderCloseButton onPress={this.onCloseTap} />
                                        }
                                    />
                                ) : null
                            }
                        >
                            <ScrollView>
                                <KeyboardAwareScrollView
                                    style={styles.container}
                                    behavior={Platform.OS === "ios" ? "padding" : ""}
                                    enabled
                                >
                                    <View
                                        style={
                                            filledUserDetails?.from === UPDATE_DETAILS
                                                ? styles.updateFormContainer
                                                : styles.formContainer
                                        }
                                    >
                                        <Typo
                                            fontSize={20}
                                            lineHeight={28}
                                            fontWeight="300"
                                            letterSpacing={0}
                                            textAlign="left"
                                            text={FILL_EMPLOYMENT_DETAIL}
                                        />
                                        <View style={styles.fieldContainer}>
                                            <Typo
                                                fontSize={14}
                                                fontWeight="normal"
                                                fontStyle="normal"
                                                lineHeight={18}
                                                textAlign="left"
                                                text={PLSTP_OCCUPATION}
                                            />
                                            <View style={styles.dropDownView}>
                                                <TouchableOpacity
                                                    style={styles.touchableView}
                                                    onPress={this.onOccupationClicked}
                                                >
                                                    <View>
                                                        <Typo
                                                            fontSize={13}
                                                            fontWeight="600"
                                                            fontStyle="normal"
                                                            lineHeight={23}
                                                            letterSpacing={0}
                                                            color={BLACK}
                                                            textAlign="left"
                                                            text={occupation}
                                                            style={styles.dropDownText}
                                                        />

                                                        <Image
                                                            style={styles.dropDownIcon}
                                                            source={Assets.downArrow}
                                                        />
                                                    </View>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                        {showEmployerDetails && (
                                            <View>
                                                <View style={styles.fieldContainer}>
                                                    <Typo
                                                        fontSize={14}
                                                        fontWeight="normal"
                                                        fontStyle="normal"
                                                        lineHeight={18}
                                                        textAlign="left"
                                                        text={PLSTP_EMPLOYER_NAME}
                                                    />
                                                    <LongTextInput
                                                        maxLength={40}
                                                        isValid={!isValidEmployerName}
                                                        isValidate
                                                        errorMessage={isValidEmployerName}
                                                        numberOfLines={2}
                                                        value={employerName}
                                                        placeholder={PLSTP_EMPLOYER_NAME_PH}
                                                        onChangeText={this.onInputTextChange}
                                                    />
                                                </View>
                                        <View style={styles.fieldContainer}>
                                            <Typo
                                                fontSize={14}
                                                fontWeight="normal"
                                                fontStyle="normal"
                                                lineHeight={18}
                                                textAlign="left"
                                                text={PLSTP_EMPLOYMENT_TYPE}
                                            />
                                            <View style={styles.dropDownView}>
                                                <TouchableOpacity
                                                    style={styles.touchableView}
                                                    onPress={this.onEmployerTypeClicked}
                                                >
                                                    <View>
                                                        <Typo
                                                            fontSize={13}
                                                            fontWeight="600"
                                                            fontStyle="normal"
                                                            lineHeight={23}
                                                            letterSpacing={0}
                                                            color={BLACK}
                                                            textAlign="left"
                                                            text={employeeType}
                                                            style={styles.dropDownText}
                                                        />

                                                        <Image
                                                            style={styles.dropDownIcon}
                                                            source={Assets.downArrow}
                                                        />
                                                    </View>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                        <View style={styles.fieldContainer}>
                                            <Typo
                                                fontSize={14}
                                                fontWeight="normal"
                                                fontStyle="normal"
                                                lineHeight={18}
                                                textAlign="left"
                                                text={OCCUPATION_SECTOR}
                                            />
                                            <View style={styles.dropDownView}>
                                                <TouchableOpacity
                                                    style={styles.touchableView}
                                                    onPress={this.onOccupationSectorClicked}
                                                >
                                                    <View>
                                                        <Typo
                                                            fontSize={13}
                                                            fontWeight="600"
                                                            fontStyle="normal"
                                                            lineHeight={23}
                                                            letterSpacing={0}
                                                            color={BLACK}
                                                            textAlign="left"
                                                            text={sector}
                                                            style={styles.dropDownText}
                                                        />

                                                        <Image
                                                            style={styles.dropDownIcon}
                                                            source={Assets.downArrow}
                                                        />
                                                    </View>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </View>
                                )}
                                    </View>
                                </KeyboardAwareScrollView>
                            </ScrollView>
                            {/* Continue Button */}
                            <View style={styles.bottomBtnContCls}>
                                <LinearGradient
                                    colors={["#efeff300", MEDIUM_GREY]}
                                    style={styles.linearGradient}
                                />
                                <ActionButton
                                    fullWidth
                                    onPress={this.onContinueTap}
                                    disabled={isNextDisabled}
                                    backgroundColor={isNextDisabled ? DISABLED : YELLOW}
                                    componentCenter={
                                        <Typo
                                            fontSize={14}
                                            fontWeight="600"
                                            lineHeight={18}
                                            color={isNextDisabled ? DISABLED_TEXT : BLACK}
                                            text={CONTINUE}
                                        />
                                    }
                                />
                            </View>
                        </ScreenLayout>
                    </View>
                </ScreenContainer>
                <ScrollPicker
                    showPicker={employeeTypeDisplayPicker}
                    items={employeeTypeData}
                    onCancelButtonPressed={this.onEmployerTypeClicked}
                    onDoneButtonPressed={this.onDoneEmployeeType}
                    itemHeight={60}
                />
                <ScrollPicker
                    showPicker={occupationDisplayPicker}
                    items={occupationData}
                    onCancelButtonPressed={this.onOccupationClicked}
                    onDoneButtonPressed={this.onDoneOccupation}
                    itemHeight={60}
                />
                <ScrollPicker
                    showPicker={sectorDisplayPicker}
                    items={sectorData}
                    onCancelButtonPressed={this.onOccupationSectorClicked}
                    onDoneButtonPressed={this.onDoneSector}
                    itemHeight={60}
                />
            </React.Fragment>
        );
    }
}

MAEOnboardEmploymentDetails.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

const styles = StyleSheet.create({
    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        paddingHorizontal: 24,
        paddingVertical: 25,
    },
   container: {
        flex: 1,
    },
   dropDownIcon: {
        height: 8,
        marginLeft: "88%",
        marginTop: -10,
        width: 15,
    },
    dropDownText: {
        height: 19,
        marginLeft: "5%",
        marginTop: -10,
        maxWidth: "75%",
        width: "75%",
    },
    dropDownView: {
        backgroundColor: WHITE,
        borderColor: GREY,
        borderRadius: 24,
        borderStyle: "solid",
        borderWidth: 1,
        height: 48,
        marginTop: 16,
        width: "100%",
    },
    fieldContainer: {
        marginTop: 24,
    },
    formContainer: {
        marginBottom: 40,
        marginHorizontal: 36,
    },
    linearGradient: {
        height: 30,
        left: 0,
        position: "absolute",
        right: 0,
        top: -30,
    },
    touchableView: {
        alignItems: "center",
        flexDirection: "row",
        height: "100%",
        marginLeft: "6%",
        width: "100%",
    },
    updateFormContainer: {
        marginBottom: 40,
        marginHorizontal: 36,
        marginTop: 80,
    },
    viewContainer: {
        flex: 1,
    },
});

export default withModelContext(MAEOnboardEmploymentDetails);
