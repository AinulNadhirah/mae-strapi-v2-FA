import PropTypes from "prop-types";
import React, { useEffect, useState, useReducer } from "react";
import { StyleSheet, View, ScrollView, Platform, TouchableOpacity, Image } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSelector, useDispatch } from "react-redux";

import {
    APPLY_LOANS,
    OCCUPATION_INFORMATION2,
    APPLICATIONCONFIRMATION,
    ASB_DECLARATION,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import { ScrollPickerView } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Dropdown from "@components/FormComponents/Dropdown";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";

import { updateApiCEP } from "@services";
import { logEvent } from "@services/analytics";

import entryProps from "@redux/connectors/ASBFinance/entryConnector";
import occupationInformationProps from "@redux/connectors/ASBFinance/occupationInformationConnector";
import masterDataServiceProps, {
    masterDataServicePropTypes,
} from "@redux/connectors/ASBServices/masterDataConnector";

import { BLACK, DARK_GREY, DISABLED, YELLOW } from "@constants/colors";
import {
    OCCUPATION_INFORMATION_CHECK_UPDATE,
    ASB_FINANCING,
    PLEASE_SELECT,
    EMPLOYER_DUMMY,
    STEPUP_MAE_OCUPATION,
    STEPUP_MAE_SECTOR,
    ASB_EMPLOYMENT_TYPE,
    ARE_YOU_SURE_YOU_WANT_TO_LEAVE_TITLE,
    ARE_YOU_SURE_YOU_WANT_TO_LEAVE_DESC,
    UPDATE,
    ASB_EMPLOYER_NAME,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    PLSTP_EMPLOYMENT_TYPE,
    CARDS_OCCPT_TOOLTIP,
    CARDS_SECT_TOOLTIP,
    EMPLOYMENT_TYPE_INFO,
    DONE,
    CANCEL,
    LEAVE,
    LEAVE_APPLICATION_GA,
} from "@constants/strings";

import Assets from "@assets";

import { ResumeDataForOccupationOne } from "../Financing/helpers/CustomerDetailsPrefiller";

const initialState = {
    showInfo: false,
    showPopup: false,
};

function reducer(state, action) {
    const { actionType, payload } = action;
    switch (actionType) {
        case "showPopup":
            return {
                ...state,
                showPopup: true,
                popupTitle: payload?.title ?? "",
                popupDescription: payload?.description ?? "",
            };
        case "hidePopup":
            return {
                ...state,
                showPopup: false,
                popupTitle: "",
                popupDescription: "",
            };
        default:
            return { ...state };
    }
}

const AsbFinanceOccupationInformation = (props) => {
    const { navigation } = props;
    const { route } = props;
    const [state, dispatch] = useReducer(reducer, initialState);
    const dispatched = useDispatch();
    // Hooks for access reducer data
    const masterDataReducer = useSelector((state) => state.asbServicesReducer.masterDataReducer);
    const prePostQualReducer = useSelector((state) => state.asbServicesReducer.prePostQualReducer);
    const resumeReducer = useSelector((state) => state.resumeReducer);
    const resumeStpDetails = resumeReducer?.stpDetails;

    const scrollPickerInitialState = {
        isDisplay: false,
        selectedIndex: 0,
        filterType: "",
        data: [],
    };

    const [occupationScrollPicker, setOccupationScrollPicker] = useState(scrollPickerInitialState);

    const [sectorScrollPicker, setSectorScrollPicker] = useState(scrollPickerInitialState);

    const [employmentTypeScrollPicker, setEmploymentTypeScrollPicker] =
        useState(scrollPickerInitialState);

    const [fromEmploymentDurationScrollPicker, setFromEmploymentDurationScrollPicker] =
        useState(scrollPickerInitialState);

    const [toEmploymentDurationScrollPicker, setToEmploymentDurationScrollPicker] =
        useState(scrollPickerInitialState);

    const [isUSeries, setIsUSeries] = useState(false);
    const [showPopupConfirm, setShowPopupConfirm] = useState(false);

    const stpReferenceNumber =
        prePostQualReducer?.stpreferenceNo ?? resumeReducer?.stpDetails?.stpReferenceNo;

    useEffect(() => {
        props.checkButtonEnabled();
        init();

        checkIfUSeries("useEffect");
        const reload = route?.params?.reload;

        if (reload || resumeStpDetails) {
            if (resumeStpDetails) {
                const data = {
                    stpEmployerName: resumeStpDetails?.stpEmployerName,
                    stpOccupationDesc: resumeStpDetails?.stpOccupationDesc,
                    stpOccupationSectorCode: resumeStpDetails?.stpOccupationSectorCode,
                    stpEmploymentTypeDesc: resumeStpDetails?.stpEmploymentTypeDesc,
                };
                ResumeDataForOccupationOne(dispatched, data, masterDataReducer);
            }
        }
    }, [route.params]);

    useEffect(() => {
        props.checkButtonEnabled();
    }, [
        props.sectorValue?.name,
        props?.occupationValue?.value,
        props?.occupationValue?.name,
        props?.sectorValue?.value,
        props?.employerName,
        props?.employmentTypeValue?.value,
        props?.employmentTypeValue?.name
    ]);
    const init = async () => {
        checkIfUSeries("init");
    };

    function onBackTap() {
        if (
            props?.route?.params?.comingFrom === APPLICATIONCONFIRMATION &&
            props?.route?.params?.isEmployeeDataMissing
        ) {
            navigation.navigate(ASB_DECLARATION); // resume *
        } else if (props?.route?.params?.comingFrom === APPLICATIONCONFIRMATION) {
            navigation.navigate(APPLICATIONCONFIRMATION);
        } else {
            navigation.navigate(ASB_DECLARATION, { reload: true });
        }
    }

    function onCloseTap() {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: LEAVE_APPLICATION_GA,
        });
        setShowPopupConfirm(true);
    }
    function onPopupCloseConfirm() {
        setShowPopupConfirm(false);
    }

    const handleLeaveBtn = async () => {
        try {
            setShowPopupConfirm(false);

            const body = {
                screenNo: "11",
                stpReferenceNo: stpReferenceNumber,
                occupationCode: props?.occupationValue?.value,
                occupationDesc: props?.occupationValue?.name,
                occupationSectorCode: isUSeries ? "" : props?.sectorValue?.value,
                occupationSectorDesc: isUSeries ? "" : props?.sectorValue?.name,
                employerName: isUSeries ? "" : props?.employerName,
                employmentTypeCode: isUSeries ? "" : props?.employmentTypeValue?.value,
                employmentTypeDesc: isUSeries ? "" : props?.employmentTypeValue?.name,
            };

            const response = await updateApiCEP(body, false);
            const result = response?.data?.result.msgHeader;

            if (result.responseCode === "0000") {
                navigation.navigate(APPLY_LOANS);
            }
        } catch (error) {
            console.log("try ", error);
        }
    };

    async function onNextTap() {
        try {
            if (props.isEmploymentContinueButtonEnabled) {
                const body = {
                    screenNo: "11",
                    stpReferenceNo: stpReferenceNumber,
                    occupationCode: props?.occupationValue?.value,
                    occupationDesc: props?.occupationValue?.name,
                    occupationSectorCode: isUSeries ? "" : props?.sectorValue?.value,
                    occupationSectorDesc: isUSeries ? "" : props?.sectorValue?.name,
                    employerName: isUSeries ? "" : props?.employerName,
                    employmentTypeCode: isUSeries ? "" : props?.employmentTypeValue?.value,
                    employmentTypeDesc: isUSeries ? "" : props?.employmentTypeValue?.name,
                };

                dispatched({
                    screenNo: "11",
                    type: "RESUME_UPDATE",
                    stpEmployerName: isUSeries ? "" : props?.employerName,
                    stpOccupationDesc: props?.occupationValue?.name,
                    stpOccupationSectorCode: props?.occupationValue?.value,
                    stpEmploymentTypeDesc: props?.employmentTypeValue?.name,
                });

                const response = await updateApiCEP(body, false);
                const result = response?.data?.result?.msgHeader;

                if (result?.responseCode === "0000") {
                    navigation.navigate(OCCUPATION_INFORMATION2, {
                        comingFrom: APPLICATIONCONFIRMATION,
                        reload: true,
                    });
                }
            }
        } catch (error) {
            // console.log(error);
        }
    }

    function onEmployerInputDidChange(value) {
        const input = value.replace(/  +/g, " ");
        props.updateEmployerName(input);
    }
    function checkIfUSeries(data) {
        if (props.occupationValue) {
            const occupationData = props.occupationValue.value;
            if (occupationData?.charAt(0) === "U" || occupationData?.charAt(0) === "u") {
                setIsUSeries(true);
            } else {
                setIsUSeries(false);
            }
        }
    }
    function onOccupationDropdownPillDidTap() {
        setOccupationScrollPicker({
            isDisplay: true,
            selectedIndex: props.occupationIndex,
            filterType: "",
            data: props.occupation,
        });
    }

    function onSectorDropdownPillDidTap() {
        setSectorScrollPicker({
            isDisplay: true,
            selectedIndex: props.sectorIndex,
            filterType: "",
            data: props.sector,
        });
    }

    function onEmploymentTypeDropdownPillDidTap() {
        setEmploymentTypeScrollPicker({
            isDisplay: true,
            selectedIndex: props.employmentTypeIndex,
            filterType: "",
            data: masterDataReducer.status === "success" ? masterDataReducer?.employmentType : [],
        });
    }

    function onOccupationScrollPickerDoneButtonDidTap(data, index) {
        if (data.leafFlag === 0) {
            props.updateOccupation(0, PLEASE_SELECT);
            setOccupationScrollPicker({
                isDisplay: false,
                selectedIndex: 0,
                filterType: "",
                data: [],
            });
        } else {
            props.updateOccupation(index, data);
            setOccupationScrollPicker({
                isDisplay: false,
                selectedIndex: 0,
                filterType: "",
                data: [],
            });
        }
    }

    function onSectorScrollPickerDoneButtonDidTap(data, index) {
        if (data.leafFlag === 0) {
            props.updateSector(0, PLEASE_SELECT);
            setSectorScrollPicker({
                isDisplay: false,
                selectedIndex: 0,
                filterType: "",
                data: [],
            });
        } else {
            props.updateSector(index, data);
            setSectorScrollPicker({
                isDisplay: false,
                selectedIndex: 0,
                filterType: "",
                data: [],
            });
        }
    }

    function onEmploymentTypeScrollPickerDoneButtonDidTap(data, index) {
        if (data.leafFlag === 0) {
            props.updateEmploymentType(0, PLEASE_SELECT);
            setEmploymentTypeScrollPicker({
                isDisplay: false,
                selectedIndex: 0,
                filterType: "",
                data: [],
            });
        } else {
            props.updateEmploymentType(index, data);
            setEmploymentTypeScrollPicker({
                isDisplay: false,
                selectedIndex: 0,
                filterType: "",
                data: [],
            });
        }
    }

    function onFromEmploymentDurationDoneButtonDidTap(data, index) {
        props.updateFromEmploymentDuration(index, data);
        setFromEmploymentDurationScrollPicker({
            isDisplay: false,
            selectedIndex: 0,
            filterType: "",
            data: [],
        });
    }

    function onToEmploymentDurationDoneButtonDidTap(data, index) {
        props.updateToEmploymentDuration(index, data);
        setToEmploymentDurationScrollPicker({
            isDisplay: false,
            selectedIndex: 0,
            filterType: "",
            data: [],
        });
    }

    function onScrollPickerCancelButtonDidTap() {
        setOccupationScrollPicker({
            isDisplay: false,
            selectedIndex: 0,
            filterType: "",
            data: [],
        });

        setSectorScrollPicker({
            isDisplay: false,
            selectedIndex: 0,
            filterType: "",
            data: [],
        });

        setFromEmploymentDurationScrollPicker({
            isDisplay: false,
            selectedIndex: 0,
            filterType: "",
            data: [],
        });

        setToEmploymentDurationScrollPicker({
            isDisplay: false,
            selectedIndex: 0,
            filterType: "",
            data: [],
        });

        setEmploymentTypeScrollPicker({
            isDisplay: false,
            selectedIndex: 0,
            filterType: "",
            data: [],
        });
    }

    function onPopupClose() {
        dispatch({ actionType: "hidePopup", payload: false });
    }

    function OccupationInfoPress() {
        dispatch({
            actionType: "showPopup",
            payload: {
                title: STEPUP_MAE_OCUPATION,
                description: CARDS_OCCPT_TOOLTIP,
            },
        });
    }

    function SectorInfoPress() {
        dispatch({
            actionType: "showPopup",
            payload: {
                title: STEPUP_MAE_SECTOR,
                description: CARDS_SECT_TOOLTIP,
            },
        });
    }

    function EmploymentTypeInfoPress() {
        dispatch({
            actionType: "showPopup",
            payload: {
                title: PLSTP_EMPLOYMENT_TYPE,
                description: EMPLOYMENT_TYPE_INFO,
            },
        });
    }
    return (
        <React.Fragment>
            <ScreenContainer
                backgroundType="color"
                analyticScreenName="Apply_ASBFinancing_EmploymentDetails"
            >
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                            headerCenterElement={
                                <Typo
                                    fontSize={12}
                                    fontWeight="600"
                                    lineHeight={15}
                                    text="Step 1 of 2"
                                    color={DARK_GREY}
                                />
                            }
                            headerRightElement={<HeaderCloseButton onPress={onCloseTap} />}
                        />
                    }
                    paddingHorizontal={0}
                    paddingBottom={0}
                    paddingTop={0}
                    useSafeArea
                >
                    <React.Fragment>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <KeyboardAwareScrollView
                                style={Style.containerView}
                                behavior={Platform.OS === "ios" ? "padding" : ""}
                                enabled
                                showsVerticalScrollIndicator={false}
                            >
                                <View style={Style.formContainer}>
                                    <Typo
                                        fontSize={14}
                                        fontWeight="400"
                                        lineHeight={21}
                                        textAlign="left"
                                        text={ASB_FINANCING}
                                    />
                                    <SpaceFiller height={4} />
                                    <Typo
                                        fontSize={16}
                                        fontWeight="600"
                                        lineHeight={24}
                                        textAlign="left"
                                        text={OCCUPATION_INFORMATION_CHECK_UPDATE}
                                    />
                                    <SpaceFiller height={24} />
                                    {buildOccupationInformationForm()}
                                </View>
                            </KeyboardAwareScrollView>
                        </ScrollView>

                        <FixedActionContainer>
                            <View style={Style.bottomBtnContCls}>
                                <ActionButton
                                    activeOpacity={
                                        props.isEmploymentContinueButtonEnabled ? 1 : 0.5
                                    }
                                    backgroundColor={
                                        props.isEmploymentContinueButtonEnabled ? YELLOW : DISABLED
                                    }
                                    fullWidth
                                    componentCenter={
                                        <Typo
                                            fontSize={14}
                                            lineHeight={18}
                                            fontWeight="600"
                                            text={UPDATE}
                                        />
                                    }
                                    onPress={onNextTap}
                                />
                            </View>
                        </FixedActionContainer>
                    </React.Fragment>
                </ScreenLayout>
                <ScrollPickerView
                    showMenu={occupationScrollPicker.isDisplay}
                    list={occupationScrollPicker.data}
                    selectedIndex={occupationScrollPicker.selectedIndex}
                    onRightButtonPress={onOccupationScrollPickerDoneButtonDidTap}
                    onLeftButtonPress={onScrollPickerCancelButtonDidTap}
                    rightButtonText={DONE}
                    leftButtonText={CANCEL}
                />
                <ScrollPickerView
                    showMenu={sectorScrollPicker.isDisplay}
                    list={sectorScrollPicker.data}
                    selectedIndex={sectorScrollPicker.selectedIndex}
                    onRightButtonPress={onSectorScrollPickerDoneButtonDidTap}
                    onLeftButtonPress={onScrollPickerCancelButtonDidTap}
                    rightButtonText={DONE}
                    leftButtonText={CANCEL}
                />
                <ScrollPickerView
                    showMenu={employmentTypeScrollPicker.isDisplay}
                    list={employmentTypeScrollPicker.data}
                    selectedIndex={employmentTypeScrollPicker.selectedIndex}
                    onRightButtonPress={onEmploymentTypeScrollPickerDoneButtonDidTap}
                    onLeftButtonPress={onScrollPickerCancelButtonDidTap}
                    rightButtonText={DONE}
                    leftButtonText={CANCEL}
                />
                <ScrollPickerView
                    showMenu={fromEmploymentDurationScrollPicker.isDisplay}
                    list={fromEmploymentDurationScrollPicker.data}
                    selectedIndex={fromEmploymentDurationScrollPicker.selectedIndex}
                    onRightButtonPress={onFromEmploymentDurationDoneButtonDidTap}
                    onLeftButtonPress={onScrollPickerCancelButtonDidTap}
                    rightButtonText={DONE}
                    leftButtonText={CANCEL}
                />

                <ScrollPickerView
                    showMenu={toEmploymentDurationScrollPicker.isDisplay}
                    list={toEmploymentDurationScrollPicker.data}
                    selectedIndex={toEmploymentDurationScrollPicker.selectedIndex}
                    onRightButtonPress={onToEmploymentDurationDoneButtonDidTap}
                    onLeftButtonPress={onScrollPickerCancelButtonDidTap}
                    rightButtonText={DONE}
                    leftButtonText={CANCEL}
                />

                <Popup
                    visible={state.showPopup}
                    onClose={onPopupClose}
                    title={state.popupTitle}
                    description={state.popupDescription}
                />
                <Popup
                    visible={showPopupConfirm}
                    onClose={onPopupCloseConfirm}
                    title={ARE_YOU_SURE_YOU_WANT_TO_LEAVE_TITLE}
                    description={ARE_YOU_SURE_YOU_WANT_TO_LEAVE_DESC}
                    primaryAction={{
                        text: `${LEAVE}`,
                        onPress: handleLeaveBtn,
                    }}
                    secondaryAction={{
                        text: `${CANCEL}`,
                        onPress: onPopupCloseConfirm,
                    }}
                />
            </ScreenContainer>
        </React.Fragment>
    );

    function buildOccupationInformationForm() {
        return (
            <React.Fragment>
                <View style={Style.fieldViewCls}>
                    <View style={Style.infoLabelContainerCls}>
                        <Typo
                            fontSize={14}
                            fontWeight="400"
                            lineHeight={18}
                            textAlign="left"
                            text={STEPUP_MAE_OCUPATION}
                            color={BLACK}
                        />
                        <TouchableOpacity onPress={OccupationInfoPress}>
                            <Image style={Style.infoIcon} source={Assets.icInformation} />
                        </TouchableOpacity>
                    </View>

                    <SpaceFiller height={16} />
                    <Dropdown
                        value={
                            props.occupationValue && props.occupationValue?.name
                                ? props.occupationValue?.name
                                : PLEASE_SELECT
                        }
                        onPress={onOccupationDropdownPillDidTap}
                    />
                </View>
                <SpaceFiller height={24} />
                {isUSeries ? null : displayNonUseriesForm()}
            </React.Fragment>
        );
    }

    function displayNonUseriesForm() {
        return (
            <React.Fragment>
                <View style={Style.fieldViewCls}>
                    <View style={Style.infoLabelContainerCls}>
                        <Typo
                            fontSize={14}
                            fontWeight="400"
                            lineHeight={18}
                            textAlign="left"
                            text={STEPUP_MAE_SECTOR}
                            color={BLACK}
                        />
                        <TouchableOpacity onPress={SectorInfoPress}>
                            <Image style={Style.infoIcon} source={Assets.icInformation} />
                        </TouchableOpacity>
                    </View>

                    <SpaceFiller height={16} />
                    <Dropdown
                        value={
                            props.sectorValue && props.sectorValue?.name
                                ? props.sectorValue?.name
                                : PLEASE_SELECT
                        }
                        onPress={onSectorDropdownPillDidTap}
                    />
                </View>
                <SpaceFiller height={24} />
                <View style={Style.fieldViewCls}>
                    <Typo
                        fontSize={14}
                        fontWeight="400"
                        lineHeight={18}
                        textAlign="left"
                        text={ASB_EMPLOYER_NAME}
                        color={BLACK}
                    />
                    <SpaceFiller height={16} />
                    <TextInput
                        errorMessage={props.employerNameErrorMessage}
                        isValid={props.employerNameErrorMessage === null}
                        isValidate
                        maxLength={40}
                        value={props.employerName}
                        placeholder={`e.g ${EMPLOYER_DUMMY}`}
                        onChangeText={onEmployerInputDidChange}
                    />
                </View>
                <SpaceFiller height={24} />
                <View style={Style.fieldViewCls}>
                    <View style={Style.infoLabelContainerCls}>
                        <Typo
                            fontSize={14}
                            fontWeight="400"
                            lineHeight={18}
                            textAlign="left"
                            text={ASB_EMPLOYMENT_TYPE}
                            color={BLACK}
                        />
                        <TouchableOpacity onPress={EmploymentTypeInfoPress}>
                            <Image style={Style.infoIcon} source={Assets.icInformation} />
                        </TouchableOpacity>
                    </View>

                    <SpaceFiller height={16} />
                    <Dropdown
                        value={
                            props.employmentTypeValue && props.employmentTypeValue?.name
                                ? props.employmentTypeValue?.name
                                : PLEASE_SELECT
                        }
                        onPress={onEmploymentTypeDropdownPillDidTap}
                    />
                </View>
                <SpaceFiller height={24} />
                <SpaceFiller height={24} />
            </React.Fragment>
        );
    }
};

export const occupationInformationPropTypes = (AsbFinanceOccupationInformation.propTypes = {
    ...masterDataServicePropTypes,
    // ...entryPropTypes,

    // State
    employerName: PropTypes.string,
    occupationIndex: PropTypes.number,
    occupationValue: PropTypes.object,
    sectorIndex: PropTypes.number,
    sectorValue: PropTypes.object,
    employmentTypeIndex: PropTypes.number,
    employmentTypeValue: PropTypes.object,
    fromEmploymentDurationIndex: PropTypes.number,
    fromEmploymentDurationValue: PropTypes.object,
    toEmploymentDurationIndex: PropTypes.number,
    toEmploymentDurationValue: PropTypes.object,
    isEmploymentContinueButtonEnabled: PropTypes.bool,
    isFromConfirmationScreenForEmploymentDetails: PropTypes.bool,
    employerNameErrorMessage: PropTypes.string,
    occupationDropdownItems: PropTypes.array,
    sectorDropdownItems: PropTypes.array,
    employmentTypeDropdownItems: PropTypes.array,
    fromEmploymentDurationDropdownItems: PropTypes.array,
    toEmploymentDurationDropdownItems: PropTypes.array,

    // Dispatch
    getOccupationDropdownItems: PropTypes.func,
    updateEmployerName: PropTypes.func,
    updateOccupation: PropTypes.func,
    updateSector: PropTypes.func,
    updateEmploymentType: PropTypes.func,
    updateFromEmploymentDuration: PropTypes.func,
    updateToEmploymentDuration: PropTypes.func,
    checkButtonEnabled: PropTypes.func,
    clearEmploymentReducer: PropTypes.func,
    updateConfirmationScreenStatusForEmploymentDetails: PropTypes.func,
});

const Style = StyleSheet.create({
    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },
    containerView: {
        flex: 1,
        paddingHorizontal: 25,
        width: "100%",
    },
    fieldViewCls: {
        marginTop: 25,
    },
    formContainer: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-between",
        marginBottom: 40,
    },
    infoIcon: {
        height: 16,
        marginLeft: 10,
        width: 16,
    },
    infoLabelContainerCls: {
        flexDirection: "row",
        paddingVertical: 2,
    },
});

export default masterDataServiceProps(
    entryProps(occupationInformationProps(AsbFinanceOccupationInformation))
);
