import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Platform } from "react-native";
import DeviceInfo from "react-native-device-info";
import LinearGradient from "react-native-linear-gradient";

import { APPLY_MAE_SCREEN, MAE_TERMS_COND } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import { LongTextInput } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";
import { showErrorToast } from "@components/Toast";

import { withModelContext } from "@context";

import { validateMAEInviteCode } from "@services";

import {
    YELLOW,
    DISABLED,
    BLACK,
    DISABLED_TEXT,
    MEDIUM_GREY,
    GHOST_WHITE,
} from "@constants/colors";
import {
    CONTINUE,
    EMAIL_LBL,
    ENTER_BRANCH_CODE,
    ENTER_BRANCH_CODE_LONG,
    ENTER_EMAIL_ADDRESS,
    ENTER_EMAIL_INVITE_CODE,
    FA_APPLY_MAE_EMAIL_ADDRESS,
    MAYBANK_BRANCH_CODE,
    MAYBANK_BRANCH_CODE_OPTIONAL,
    PLSTP_EMAIL_PH,
    VALID_EMAIL_ADDRESS,
} from "@constants/strings";
import { MAE_CUST_INQ_ETB_V1, MAE_CUST_INQ_ETB_V2 } from "@constants/url";

import * as DataModel from "@utils/dataModel";
// import { getMobileSdkParams } from "@utils";
import { getDeviceRSAInformation } from "@utils/dataModel/utility";

import assets from "@assets";

import * as MAEOnboardController from "./MAEOnboardController";

function BranchCodeInfo() {
    return (
        <View style={styles.branchCodeHeader}>
            <Typo
                fontSize={16}
                fontWeight="600"
                lineHeight={20}
                text={MAYBANK_BRANCH_CODE}
                textAlign="left"
            />
            <View style={styles.branchCodeDesc}>
                <Typo
                    fontSize={12}
                    fontWeight="normal"
                    lineHeight={20}
                    textAlign="left"
                    text={ENTER_BRANCH_CODE_LONG}
                />
            </View>
        </View>
    );
}

class MAEOnboardDetails4 extends Component {
    static navigationOptions = ({ navigation: { navigate } }) => ({
        title: "",
        header: null,
    });
    static propTypes = {
        getModel: PropTypes.func,
        updateModel: PropTypes.func,
        route: PropTypes.object,
        navigation: PropTypes.object,
    };
    constructor(props) {
        super(props);
        this.state = {
            filledUserDetails: props.route.params?.filledUserDetails,
            emailAddress: "",
            branchCode: "",

            isNextDisabled: true,
            backBtn: !this.props.route?.params?.username,
            isValidEmail: "",
            isValidBranchCode: "",
            showBranchCodeInfo: false,
        };
        console.log("MAEOnboardDetails4:state----------", this.state);
    }

    componentDidMount() {
        console.log("[MAEOnboardDetails4] >> [componentDidMount]");
        // if (__DEV__) {
        //     this.setState({
        //         emailAddress: "p.rakesh1989@gmail.com",
        //         isNextDisabled: false,
        //     });
        // }

        if (this.props.route.params?.username) {
            const { filledUserDetails } = this.state;
            const usernameDetails = {
                username: this.props.route.params?.username,
                password: this.props.route.params?.pw,
            };
            filledUserDetails.usernameDetails = usernameDetails;
            this.enrollmentCall();
        }
    }

    enrollmentCall = async () => {
        const { updateModel } = this.props;
        const { filledUserDetails } = this.state;
        const { deviceInformation, deviceId } = this.props.getModel("device");
        // const mobileSDKData = getMobileSdkParams({ ...deviceInformation, deviceId });
        const mobileSDKData = getDeviceRSAInformation({
            ...deviceInformation,
            DeviceInfo,
            deviceId,
        });
        const response = await MAEOnboardController.enrollmentCall(
            filledUserDetails,
            mobileSDKData
        );
        if (response.message) {
            showErrorToast({
                message: response.message,
            });
        } else {
            const {
                access_token: accessToken,
                refresh_token: refreshToken,
                cus_key: cusKey,
            } = response.data;
            updateModel({
                auth: {
                    token: accessToken,
                    refreshToken,
                    customerKey: cusKey,
                },
            });
            const { filledUserDetails } = this.state;
            filledUserDetails.authData = response.data;
            this.custInqETB();
        }
    };

    custInqETB = async () => {
        const { filledUserDetails } = this.state;

        const { trinityFlag } = this.props.getModel("mae");
        const path = trinityFlag === "Y" ? MAE_CUST_INQ_ETB_V2 : MAE_CUST_INQ_ETB_V1;
        const response = await MAEOnboardController.maeETBCustEnq(path);
        if (response.message) {
            showErrorToast({
                message: response.messages,
            });
        } else {
            if (response.statusCode === "0000") {
                const { onBoardDetails, onBoardDetails2, onBoardDetails3 } =
                    MAEOnboardController.ETBFilledUserDetails(
                        response,
                        filledUserDetails.onBoardDetails2.from
                    );

                filledUserDetails.onBoardDetails = onBoardDetails;
                filledUserDetails.onBoardDetails2 = onBoardDetails2; //check from in onBoardDetails2
                filledUserDetails.onBoardDetails3 = onBoardDetails3;

                // this.props.navigation.navigate(MAE_ONBOARD_DETAILS4, {filledUserDetails});//MAE_ONBOARD_DETAILS//MAE_TERMS_COND
            } else {
                showErrorToast({
                    message: response.statusDesc,
                });
            }
        }
    };

    validateBranchCode = () => {
        console.log("[MAEOnboardDetails4] >> [validateBranchCode]");
        const data = {
            inviteCode: this.state.branchCode,
        };

        validateMAEInviteCode(data, true)
            .then((response) => {
                console.log("[MAEOnboardDetails4][validateBranchCode] >> Success");
                const result = response.data.result;
                if (result.statusCode === "0000") {
                    const { onBoardDetails2 } = this.state.filledUserDetails;
                    const filledUserDetails = this.prepareUserDetails();
                    if (onBoardDetails2.from !== "NewMAE") {
                        this.props.navigation.navigate(MAE_TERMS_COND, {
                            filledUserDetails,
                        });
                    } else {
                        this.props.navigation.navigate(APPLY_MAE_SCREEN, {
                            filledUserDetails,
                            eKycParams: this.eKycParams(),
                        });
                    }
                } else {
                    throw new Error(result.statusDesc);
                }
            })
            .catch((error) => {
                console.log("[MAEOnboardDetails4][validateBranchCode] >> Failure");
                showErrorToast({
                    message: error.message,
                });
            });
    };

    onBackTap = () => {
        console.log("[MAEOnboardDetails4] >> [onBackTap]");
        this.props.navigation.goBack();
    };

    onCloseTap = () => {
        console.log("[MAEOnboardDetails4] >> [onCloseTap]");
        const { filledUserDetails } = this.state;
        this.props.navigation.navigate(filledUserDetails?.entryStack || "More", {
            screen: filledUserDetails?.entryScreen || "Apply",
            params: filledUserDetails?.entryParams,
        });
    };

    onContinueTap = () => {
        console.log("[MAEOnboardDetails4] >> [onContinueTap]");
        if (this.emailValidation()) {
            const { onBoardDetails2 } = this.state.filledUserDetails;
            if (this.state.branchCode !== "") {
                this.validateBranchCode();
            } else {
                const filledUserDetails = this.prepareUserDetails();
                if (onBoardDetails2.from !== "NewMAE") {
                    this.props.navigation.navigate(MAE_TERMS_COND, {
                        filledUserDetails,
                    });
                } else {
                    this.props.navigation.navigate(APPLY_MAE_SCREEN, {
                        filledUserDetails,
                        eKycParams: this.eKycParams(),
                    });
                }
            }
        }
    };

    eKycParams = () => {
        const { filledUserDetails } = this.state;
        return {
            selectedIDType: filledUserDetails?.onBoardDetails2?.selectedIDType,
            entryStack: filledUserDetails?.entryStack,
            entryScreen: filledUserDetails?.entryScreen,
            entryParams: filledUserDetails?.entryParams,
            from: filledUserDetails?.onBoardDetails2?.from,
            idNo: filledUserDetails?.onBoardDetails2?.idNo,
            fullName: filledUserDetails?.onBoardDetails?.fullName,
            passportCountry: filledUserDetails?.onBoardDetails2?.passportCountry,
            passportCountryCode: filledUserDetails?.onBoardDetails2?.passportCountryCode,
            reqType: "E01",
            isNameCheck: true,
            sceneCode: "MAE",
        };
    };

    prepareUserDetails = () => {
        console.log("MAEOnboardDetails4 >> [prepareUserDetails]");
        const onBoardDetails4 = {
            emailAddress: this.state.emailAddress,
            inviteCode: this.state.branchCode,
        };
        const MAEUserDetails = this.state.filledUserDetails || {};
        MAEUserDetails.onBoardDetails4 = onBoardDetails4;

        return MAEUserDetails;
    };

    emailValidation = () => {
        console.log("[MAEOnboardDetails4] >> [emailValidation]");

        const email = this.state.emailAddress;
        let err = "";
        const err1 = VALID_EMAIL_ADDRESS;
        const err2 = ENTER_EMAIL_ADDRESS;
        // Check for accepting valid special characters
        if (!DataModel.validateEmail(email)) {
            err = err1;
        } else if (email.length === 0) {
            // Min length check
            err = err2;
        }

        this.setState({ isValidEmail: err });
        // Return true if no validation error
        return !err;
    };

    onInputTextChange = (params) => {
        console.log("[MAEOnboardDetails4] >> [onInputTextChange]");
        const key = params.key;
        const value = params.value.trim();
        this.setState(
            {
                [key]: value,
                isValidEmail: "",
            },
            () => {
                this.enableDisableBtn();
            }
        );
    };

    enableDisableBtn = () => {
        console.log("[MAEOnboardDetails4] >> [enableDisableBtn]");

        this.setState({
            isNextDisabled: !this.state.emailAddress.length,
        });
    };

    showBranchCodeInfo = () => this.setState({ showBranchCodeInfo: true });
    hideBranchCodeInfo = () => this.setState({ showBranchCodeInfo: false });

    render() {
        const {
            emailAddress,
            backBtn,
            branchCode,
            isValidEmail,
            isValidBranchCode,
            isNextDisabled,
            showBranchCodeInfo,
        } = this.state;

        return (
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                analyticScreenName={FA_APPLY_MAE_EMAIL_ADDRESS}
            >
                <View style={styles.viewContainer}>
                    <ScreenLayout
                        paddingBottom={0}
                        paddingTop={0}
                        paddingHorizontal={0}
                        useSafeArea
                        header={
                            <HeaderLayout
                                headerLeftElement={
                                    backBtn ? <HeaderBackButton onPress={this.onBackTap} /> : null
                                }
                                headerRightElement={<HeaderCloseButton onPress={this.onCloseTap} />}
                            />
                        }
                    >
                        <ScrollView>
                            <View style={styles.formContainer}>
                                <Typo
                                    fontSize={20}
                                    lineHeight={28}
                                    fontWeight="300"
                                    letterSpacing={0}
                                    textAlign="left"
                                    text={ENTER_EMAIL_INVITE_CODE}
                                />
                                <View style={styles.fieldContainer}>
                                    <Typo
                                        fontSize={14}
                                        fontWeight="normal"
                                        fontStyle="normal"
                                        lineHeight={18}
                                        textAlign="left"
                                        text={EMAIL_LBL}
                                    />
                                    <LongTextInput
                                        maxLength={40}
                                        style={styles.inputFont}
                                        isValid={!isValidEmail}
                                        isValidate
                                        errorMessage={isValidEmail}
                                        numberOfLines={2}
                                        autoCapitalize="none"
                                        keyboardType="email-address"
                                        value={emailAddress}
                                        placeholder={PLSTP_EMAIL_PH}
                                        onChangeText={(value) => {
                                            this.onInputTextChange({ key: "emailAddress", value });
                                        }}
                                    />
                                </View>
                                <View style={styles.fieldContainer}>
                                    <TouchableOpacity
                                        onPress={this.showBranchCodeInfo}
                                        style={styles.showDetailsAction}
                                    >
                                        <Typo
                                            fontSize={14}
                                            fontWeight="normal"
                                            fontStyle="normal"
                                            lineHeight={18}
                                            textAlign="left"
                                            text={MAYBANK_BRANCH_CODE_OPTIONAL}
                                        />
                                        <View style={styles.showDetailsIcon}>
                                            <Image
                                                source={assets.info}
                                                style={styles.showDetailsIconImg}
                                            />
                                        </View>
                                    </TouchableOpacity>
                                    <TextInput
                                        maxLength={10}
                                        isValid={!isValidBranchCode}
                                        isValidate
                                        errorMessage={isValidBranchCode}
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        value={branchCode}
                                        placeholder={ENTER_BRANCH_CODE}
                                        onChangeText={(value) => {
                                            this.onInputTextChange({ key: "branchCode", value });
                                        }}
                                    />
                                </View>
                            </View>
                        </ScrollView>
                        {/* Continue Button */}
                        <View style={styles.bottomBtnContCls}>
                            <LinearGradient
                                colors={[GHOST_WHITE, MEDIUM_GREY]}
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
                <Popup
                    visible={showBranchCodeInfo}
                    onClose={this.hideBranchCodeInfo}
                    ContentComponent={<BranchCodeInfo />}
                />
            </ScreenContainer>
        );
    }
}

const styles = StyleSheet.create({
    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        paddingHorizontal: 24,
        paddingVertical: 25,
    },
    fieldContainer: {
        marginTop: 24,
    },
    formContainer: {
        marginHorizontal: 36,
    },
    inputFont: {
        color: BLACK,
        fontFamily: Platform.OS === "ios" ? "Montserrat-SemiBold" : "Montserrat-Bold",
        fontSize: 20,
        fontWeight: "600",
    },
    linearGradient: {
        height: 30,
        left: 0,
        position: "absolute",
        right: 0,
        top: -30,
    },
    showDetailsAction: {
        flexDirection: "row",
    },
    showDetailsIconImg: {
        height: 12,
        marginLeft: 2,
        marginTop: 4,
        width: 12,
    },
    viewContainer: {
        flex: 1,
    },
    branchCodeHeader: {
        paddingVertical: 36,
        paddingHorizontal: 30,
    },
    branchCodeDesc: {
        marginTop: 8,
    },
});

export default withModelContext(MAEOnboardDetails4);
