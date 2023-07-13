import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, ScrollView, KeyboardAvoidingView } from "react-native";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import { AccountDetailsView } from "@components/Common";
import { Dropdown } from "@components/Common/DropDownButtonCenter";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import ScrollPicker from "@components/Pickers/ScrollPicker";
import Typography from "@components/Text";
import TextInput from "@components/TextInput";
import { errorToastProp, showErrorToast } from "@components/Toast";

import ApiManager from "@services/ApiManager";
import { logEvent } from "@services/analytics";

import { TOKEN_TYPE_M2U, METHOD_GET, TIMEOUT } from "@constants/api";
import {
    BLACK,
    DISABLED,
    DISABLED_TEXT,
    MEDIUM_GREY,
    PINKISH_GREY,
    YELLOW,
} from "@constants/colors";
import { FA_SCREEN_NAME, FA_VIEW_SCREEN } from "@constants/strings";
import { BAKONG_ENDPOINT } from "@constants/url";

import { referenceRegexBakong } from "@utils/dataModel";
import { formatBakongMobileNumbers } from "@utils/dataModel/utility";
import { ErrorLogger } from "@utils/logs";

class BakongEnterPurpose extends Component {
    /***
     * constructor
     * props
     */
    constructor(props) {
        super(props);
        this.state = {
            loader: false,
            screenData: {
                image: "",
                name: "",
                description1: "",
                description2: "",
            },
            error: false,
            errorMessage: "",
            transferParams: {},
            showPurposeScrollPicker: false,
            showSubPurposeScrollPicker: false,
            showRelationshipScrollPicker: false,
            purposeList: [],
            subPurposeList: [],
            relationshipList: [],
            // relationshipList: [
            //     {
            //         title: "Spouse",
            //         value: 0,
            //     },
            //     {
            //         title: "Siblings",
            //         value: 1,
            //     },
            //     {
            //         title: "Parents",
            //         value: 2,
            //     },
            //     {
            //         title: "Children",
            //         value: 3,
            //     },
            // ],
            // form data
            selectedPurpose: "",
            selectedSubPurpose: "",
            selectedSubPurposeBopCode: "",
            selectedSubPurposeMbbCode: "",
            selectedSubPurposeCode: "",
            selectedRelationship: "",
            recipientRef: "",
        };
    }

    /***
     * componentDidMount
     * Update Screen date
     */
    async componentDidMount() {
        console.log("[BakongEnterPurpose] >> [componentDidMount] : ");

        this.focusSubscription = this.props.navigation.addListener("focus", () => {
            console.log("[BakongEnterPurpose] >> [componentDidMount] focusSubscription : ");
            // this._getPurposes();
            this.updateData();
        });

        // Analytics - view_screen
        this._logAnalyticsEvent("M2U_TRF_Overseas_Bakong_5PurposeDetails");
    }

    /***
     * componentWillUnmount
     * Handle Screen UnMount Event
     */
    componentWillUnmount() {
        console.log("[BakongEnterPurpose] >> [componentWillUnmount] : ");
        this.focusSubscription();
    }

    /***
     * _getPurposes
     * Get list of Purposes/sub-purposes from api
     */
    _getPurposes = async () => {
        try {
            this.setState({ loader: true });
            const { recipientNationalityCode } = this.state.transferParams ?? "";
            const response = await ApiManager.service({
                url: `${BAKONG_ENDPOINT}/purposes?beneNationality=${recipientNationalityCode}`,
                // url: `${BAKONG_ENDPOINT}/purposes?beneNationality=MYS`,
                data: null,
                reqType: METHOD_GET,
                tokenType: TOKEN_TYPE_M2U,
                timeout: TIMEOUT,
                promptError: false,
                showPreloader: false,
            });
            console.tron.log("[_getPurposes] response: ", response);

            // array mapping
            const purposeList = response.data.purposes.map((purpose, index) => ({
                title: purpose.name,
                value: index,
                subPurposes: purpose.subServices,
            }));

            this.setState({ purposeList, loader: false });
        } catch (error) {
            showErrorToast(
                errorToastProp({
                    message: error.message ?? "Unable to fetch list of purposes. Please try again.",
                })
            );
            ErrorLogger(error);

            // go back
            this.props.navigation.goBack();
        }
    };

    /***
     * updateData
     * Update Screen Data upon screen focused
     */
    async updateData() {
        const transferParams = this.props.route.params.transferParams;
        console.log("[BakongEnterPurpose] >> [updateData] transferParams==> ", transferParams);

        const screenData = {
            image: transferParams.image,
            name: "+855 " + formatBakongMobileNumbers(transferParams.mobileNo),
            description1: transferParams.name,
            description2: transferParams.transactionTo,
        };
        console.log("[BakongEnterPurpose] >> [updateData] screenData ==> ", screenData);

        this.setState(
            {
                transferParams,
                screenData,
                selectedPurpose: transferParams.purpose ?? "",
                selectedSubPurpose: transferParams.subpurpose ?? "",
                selectedSubPurposeBopCode: transferParams.subpurposeBopCode ?? "",
                selectedSubPurposeMbbCode: transferParams.subpurposeMbbCode ?? "",
                selectedSubPurposeCode: transferParams.subpurposeCode ?? "",
                selectedRelationship: transferParams.relationship ?? "",
                recipientRefTrimmed: transferParams.recipientRef ?? "",
            },
            () => {
                this._getPurposes();
            }
        );
    }

    doneClick = () => {
        console.log("[BakongEnterPurpose] >> [doneClick] : ");
        const {
            selectedPurpose,
            selectedSubPurpose,
            selectedSubPurposeBopCode,
            selectedSubPurposeMbbCode,
            selectedSubPurposeCode,
            selectedRelationship,
            recipientRef,
        } = this.state;

        const recipientRefTrimmed = recipientRef.trim();

        if (recipientRefTrimmed.length > 0) {
            const regex = new RegExp(/^[-a-zA-Z0-9’_.,|()/:?@+' ]+$/g);
            const validate = regex.test(recipientRefTrimmed);
            if (!validate) {
                showErrorToast(
                    errorToastProp({
                        message: "Additional Info should not contain invalid characters.",
                    })
                );
                return;
            }
        }

        const { transferParams } = this.state;
        transferParams.purpose = selectedPurpose;
        transferParams.subpurpose = selectedSubPurpose;
        transferParams.subpurposeBopCode = selectedSubPurposeBopCode;
        transferParams.subpurposeMbbCode = selectedSubPurposeMbbCode;
        transferParams.subpurposeCode = selectedSubPurposeCode;
        transferParams.relationship = selectedRelationship;
        transferParams.recipientRef = recipientRefTrimmed;

        console.log("[BakongEnterPurpose] >> [doneClick] transferParams ==> ", transferParams);
        this.props.navigation.navigate("BakongSummary", {
            transferParams: { ...transferParams },
        });
    };

    _onBackPress = () => {
        console.log("[BakongEnterPurpose] >> [_onBackPress] : ");
        const { transferParams } = this.state;

        if (this.props.route.params.confirmation) {
            this.props.navigation.navigate("BakongSummary", {
                transferParams: { ...transferParams },
            });
        } else if (transferParams.favorite) {
            this.props.navigation.navigate("BakongEnterAmount", {
                transferParams: { ...transferParams },
            });
        } else {
            this.props.navigation.navigate("BakongEnterRecipientAddress", {
                transferParams: { ...transferParams },
            });
        }
    };

    _onPurposeScrollPickerShow = () => {
        this._logAnalyticsEvent("M2U_TRF_Overseas_Bakong_5.1Purpose");
        this.setState({ showPurposeScrollPicker: true });
    };

    _onPurposeScrollPickerDismissed = () => this.setState({ showPurposeScrollPicker: false });

    _onPurposeScrollPickerDoneButtonPressed = (value) => {
        const { purposeList } = this.state;

        // array mapping for subpurposes
        const subPurposeList = purposeList[value].subPurposes.map((subpurpose, index) => ({
            title: subpurpose.name,
            value: index,
            bopCode: subpurpose.bopCode,
            mbbCode: subpurpose.mbbCode,
            purposeCode: subpurpose.purposeCode,
            relationships: subpurpose.relationships,
        }));

        this.setState({
            selectedPurpose: purposeList[value].title,
            showPurposeScrollPicker: false,
            subPurposeList,
            selectedSubPurpose: "",
            selectedSubPurposeBopCode: "",
            selectedSubPurposeCode: "",
        });
    };

    _onSubPurposeScrollPickerShow = () => {
        this._logAnalyticsEvent("M2U_TRF_Overseas_Bakong_5.2SubPurpose");
        this.setState({ showSubPurposeScrollPicker: true });
    };

    _onSubPurposeScrollPickerDismissed = () => this.setState({ showSubPurposeScrollPicker: false });

    _onSubPurposeScrollPickerDoneButtonPressed = (value) => {
        const { subPurposeList } = this.state;

        console.tron.log(
            "[_onSubPurposeScrollPickerDoneButtonPressed] relationships: ",
            subPurposeList[value].relationships
        );
        let relationshipList = [];
        // array mapping for relationships
        if (subPurposeList[value].relationships) {
            relationshipList = subPurposeList[value].relationships.map((relationship, index) => ({
                title: relationship,
                value: index,
            }));
        }

        console.tron.log(
            "[_onSubPurposeScrollPickerDoneButtonPressed] relationshipList: ",
            relationshipList
        );

        this.setState({
            selectedSubPurpose: subPurposeList[value].title,
            selectedSubPurposeBopCode: subPurposeList[value].bopCode,
            selectedSubPurposeMbbCode: subPurposeList[value].mbbCode,
            selectedSubPurposeCode: subPurposeList[value].purposeCode,
            showSubPurposeScrollPicker: false,
            relationshipList,
            selectedRelationship: "",
        });
    };

    _onRelationshipScrollPickerShow = () => {
        this._logAnalyticsEvent("M2U_TRF_Overseas_Bakong_5.3SRelationship");
        this.setState({ showRelationshipScrollPicker: true });
    };

    _onRelationshipScrollPickerDismissed = () =>
        this.setState({ showRelationshipScrollPicker: false });

    _onRelationshipScrollPickerDoneButtonPressed = (value) => {
        const { relationshipList } = this.state;

        this.setState({
            selectedRelationship: relationshipList[value].title,
            showRelationshipScrollPicker: false,
        });
    };

    _onRecipientReferenceTextChange = (text) => {
        if (text.length <= 20) {
            this.setState({
                recipientRef: text,
                error: false,
                errorMessage: "",
            });
        }
    };

    _logAnalyticsEvent = (screenName) => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: screenName,
        });
    };

    render() {
        // const { navigation } = this.props;
        const {
            showErrorModal,
            errorMessage,
            loader,
            showPurposeScrollPicker,
            showSubPurposeScrollPicker,
            showRelationshipScrollPicker,
            purposeList,
            subPurposeList,
            relationshipList,
            selectedPurpose,
            selectedSubPurpose,
            selectedRelationship,
            recipientRef,
        } = this.state;
        return (
            <React.Fragment>
                <ScreenContainer
                    backgroundType="color"
                    showErrorModal={showErrorModal}
                    showLoaderModal={loader}
                    errorMessage={errorMessage}
                    showOverlay={
                        showPurposeScrollPicker ||
                        showSubPurposeScrollPicker ||
                        showRelationshipScrollPicker
                    }
                    backgroundColor={MEDIUM_GREY}
                    // analyticScreenName="M2U_TRF_Overseas_Bakong_5PurposeDetails"
                >
                    <ScreenLayout
                        header={
                            <HeaderLayout
                                headerCenterElement={
                                    <Typography
                                        fontSize={16}
                                        fontWeight="600"
                                        lineHeight={19}
                                        text="Bakong"
                                    />
                                }
                                headerLeftElement={<HeaderBackButton onPress={this._onBackPress} />}
                            />
                        }
                        useSafeArea
                        paddingHorizontal={0}
                        paddingBottom={0}
                    >
                        <React.Fragment>
                            <ScrollView showsHorizontalScrollIndicator={false}>
                                <KeyboardAvoidingView
                                    style={{ flex: 1 }}
                                    keyboardVerticalOffset={100}
                                    behavior="position"
                                >
                                    <View style={Styles.container}>
                                        <View style={Styles.headerContainer}>
                                            <AccountDetailsView
                                                data={this.state.screenData}
                                                base64
                                                greyed
                                            />
                                        </View>

                                        <View style={Styles.formBodyContainer}>
                                            <Typography
                                                fontSize={14}
                                                fontWeight="normal"
                                                fontStyle="normal"
                                                letterSpacing={0}
                                                lineHeight={19}
                                                color={BLACK}
                                                textAlign="left"
                                                text="Purpose"
                                            />

                                            <View style={Styles.formEditableContainer}>
                                                <View style={Styles.dropdownInputContainer}>
                                                    <Dropdown
                                                        title={
                                                            selectedPurpose === ""
                                                                ? "Please Select"
                                                                : selectedPurpose
                                                        }
                                                        align="left"
                                                        onPress={this._onPurposeScrollPickerShow}
                                                    />
                                                </View>
                                            </View>

                                            {selectedPurpose !== "" ? (
                                                <>
                                                    <Typography
                                                        fontSize={14}
                                                        fontWeight="normal"
                                                        fontStyle="normal"
                                                        letterSpacing={0}
                                                        lineHeight={19}
                                                        color={BLACK}
                                                        textAlign="left"
                                                        text="Sub purpose"
                                                    />

                                                    <View style={Styles.formEditableContainer}>
                                                        <View style={Styles.dropdownInputContainer}>
                                                            <Dropdown
                                                                title={
                                                                    selectedSubPurpose === ""
                                                                        ? "Please Select"
                                                                        : selectedSubPurpose
                                                                }
                                                                align="left"
                                                                onPress={
                                                                    this
                                                                        ._onSubPurposeScrollPickerShow
                                                                }
                                                            />
                                                        </View>
                                                    </View>
                                                </>
                                            ) : null}

                                            {selectedSubPurpose !== "" &&
                                                relationshipList.length > 0 && (
                                                    <>
                                                        <Typography
                                                            fontSize={14}
                                                            fontWeight="normal"
                                                            fontStyle="normal"
                                                            letterSpacing={0}
                                                            lineHeight={19}
                                                            color={BLACK}
                                                            textAlign="left"
                                                            text="Relationship"
                                                        />

                                                        <View style={Styles.formEditableContainer}>
                                                            <View
                                                                style={
                                                                    Styles.dropdownInputContainer
                                                                }
                                                            >
                                                                <Dropdown
                                                                    title={
                                                                        selectedRelationship === ""
                                                                            ? "Please Select"
                                                                            : selectedRelationship
                                                                    }
                                                                    align="left"
                                                                    onPress={
                                                                        this
                                                                            ._onRelationshipScrollPickerShow
                                                                    }
                                                                />
                                                            </View>
                                                        </View>
                                                    </>
                                                )}

                                            <Typography
                                                fontSize={14}
                                                fontWeight="normal"
                                                fontStyle="normal"
                                                letterSpacing={0}
                                                lineHeight={19}
                                                color={BLACK}
                                                textAlign="left"
                                                text="Additional Info (Optional)"
                                            />

                                            <View style={Styles.formEditableContainer}>
                                                <View style={Styles.inputContainer}>
                                                    <TextInput
                                                        maxLength={20}
                                                        isValidate={this.state.error}
                                                        errorMessage={this.state.errorMessage}
                                                        onChangeText={
                                                            this._onRecipientReferenceTextChange
                                                        }
                                                        value={recipientRef}
                                                        editable
                                                        placeholder="Enter recipient reference"
                                                    />
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                </KeyboardAvoidingView>
                            </ScrollView>
                            <FixedActionContainer>
                                <ActionButton
                                    disabled={
                                        selectedPurpose === "" ||
                                        selectedSubPurpose === "" ||
                                        (relationshipList.length > 0 && selectedRelationship === "")
                                    }
                                    fullWidth
                                    borderRadius={25}
                                    onPress={this.doneClick}
                                    backgroundColor={
                                        selectedPurpose === "" ||
                                        selectedSubPurpose === "" ||
                                        (relationshipList.length > 0 && selectedRelationship === "")
                                            ? DISABLED
                                            : YELLOW
                                    }
                                    componentCenter={
                                        <Typography
                                            color={
                                                selectedPurpose === "" ||
                                                selectedSubPurpose === "" ||
                                                (relationshipList.length > 0 &&
                                                    selectedRelationship === "")
                                                    ? DISABLED_TEXT
                                                    : BLACK
                                            }
                                            text="Continue"
                                            fontSize={14}
                                            fontWeight="600"
                                            lineHeight={18}
                                        />
                                    }
                                />
                            </FixedActionContainer>
                        </React.Fragment>
                    </ScreenLayout>
                </ScreenContainer>
                <ScrollPicker
                    showPicker={showPurposeScrollPicker}
                    items={purposeList}
                    onDoneButtonPressed={this._onPurposeScrollPickerDoneButtonPressed}
                    onCancelButtonPressed={this._onPurposeScrollPickerDismissed}
                />
                <ScrollPicker
                    showPicker={showSubPurposeScrollPicker}
                    items={subPurposeList}
                    itemHeight={65}
                    fontSize={12}
                    onDoneButtonPressed={this._onSubPurposeScrollPickerDoneButtonPressed}
                    onCancelButtonPressed={this._onSubPurposeScrollPickerDismissed}
                />
                <ScrollPicker
                    showPicker={showRelationshipScrollPicker}
                    items={relationshipList}
                    onDoneButtonPressed={this._onRelationshipScrollPickerDoneButtonPressed}
                    onCancelButtonPressed={this._onRelationshipScrollPickerDismissed}
                />
            </React.Fragment>
        );
    }
}

BakongEnterPurpose.propTypes = {
    navigation: PropTypes.shape({
        addListener: PropTypes.func,
        goBack: PropTypes.func,
        navigate: PropTypes.func,
    }),
    route: PropTypes.shape({
        params: PropTypes.shape({
            confirmation: PropTypes.any,
            transferParams: PropTypes.shape({
                image: PropTypes.any,
                mobileNo: PropTypes.any,
                name: PropTypes.any,
                purpose: PropTypes.string,
                recipientRef: PropTypes.string,
                relationship: PropTypes.string,
                subpurpose: PropTypes.string,
                subpurposeBopCode: PropTypes.string,
                subpurposeCode: PropTypes.string,
                subpurposeMbbCode: PropTypes.string,
                transactionTo: PropTypes.any,
            }),
        }),
    }),
};

const Styles = {
    container: {
        flex: 1,
        alignItems: "flex-start",
        paddingHorizontal: 24,
        marginBottom: 60,
    },
    formBodyContainer: {
        paddingTop: 16,
    },
    formEditableContainer: {
        alignItems: "center",
        flexDirection: "row",
        marginTop: 4,
        marginBottom: 32,
        width: "100%",
    },
    headerContainer: {
        justifyContent: "flex-start",
    },
    dropdownInputContainer: { flex: 1, marginTop: 8 },
    inputContainer: { flex: 1 },
    touchableCurrencyContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderBottomColor: PINKISH_GREY,
        borderBottomWidth: 1,
        paddingVertical: 13,
        marginRight: 14,
    },
    radioButtonContainer: { flexDirection: "row", marginRight: 40, marginTop: 16 },
    radioButtonTitle: { marginLeft: 12 },
};

export default BakongEnterPurpose;
