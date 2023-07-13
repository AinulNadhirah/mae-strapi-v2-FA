import PropTypes from "prop-types";
import React, { Component } from "react";
import {
    View,
    ScrollView,
    Image,
    StyleSheet,
    TouchableOpacity,
    Keyboard,
    Text,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";

import * as navigationConstant from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import ColorRadioButton from "@components/Buttons/ColorRadioButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import ScrollPicker from "@components/Pickers/ScrollPicker";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { withModelContext } from "@context";

import { getMAEMasterData } from "@services";
import { GAOnboarding } from "@services/analytics/analyticsSTPMae";

import { YELLOW, DISABLED, BLACK, GREY, DISABLED_TEXT, MEDIUM_GREY } from "@constants/colors";
import {
    ACKNOWLEDGE_TEXT1,
    ACKNOWLEDGE_TEXT2,
    AGREE_PROMOTIONAL_MARKETING_TITLE,
    CONTINUE,
    DISAGREE_PROMOTIONAL_MARKETING_TITLE,
    ERR_PDPA_2,
    ERR_TERMS,
    MAE_TNC_HEADER_1,
    MAE_TNC_HEADER_2,
    NEW_MAE,
    NO,
    PROMOTIONAL_MARKETING_TEXT,
    SHARERECEIPT,
    TERMS_CONDITIONS,
    YES,
} from "@constants/strings";
import { MAE_ISL_TNC, PDPA_PERSONAL } from "@constants/url";

import Assets from "@assets";

import * as MAEOnboardController from "./MAEOnboardController";

class MAETnC extends Component {
    static navigationOptions = ({ navigation: { navigate } }) => ({
        title: "",
        header: null,
    });

    static propTypes = {
        getModel: PropTypes.func,
        route: PropTypes.shape({
            params: PropTypes.shape({
                filledUserDetails: PropTypes.shape({
                    onBoardDetails2: PropTypes.shape({
                        from: PropTypes.string,
                    }),
                }),
            }),
        }),
    };
    constructor(props) {
        super(props);
        this.state = {
            filledUserDetails: props.route.params?.filledUserDetails,

            // FATCA Related
            fatcaCountryList:
                props.route.params?.filledUserDetails?.masterData?.fatcaCountryList || [],
            displayUSTaxPicker: false,

            // CRS Related
            crsCountryList:
                props.route.params?.filledUserDetails?.masterData?.fatcaCountryList || [],
            displayCRSTaxPicker: false,

            //PDPA Related
            pdpaSelectValue: "",
            radioPDPAYesChecked: false,
            radioPDPANoChecked: false,

            //TNC Related
            radioTNCYesChecked: false,

            isNextDisabled: true,
        };
    }

    componentDidMount() {
        console.log("[MAETnC] >> [componentDidMount]");

        // Call method to populate country data in state variables
        this.checkFetchCountryData();
        if (this.props.route.params?.filledUserDetails?.onBoardDetails2?.from === NEW_MAE) {
            GAOnboarding.onMAEDeclaration();
            GAOnboarding.onViewPDPA();
        }
    }

    onInputTextChange = (params) => {
        console.log("[MAETnC] >> [onInputTextChange]");
        const key = params.key;
        const value = params.value;
        this.setState({
            [key]: value,
        });
    };

    onBlur = () => {
        console.log("[MAETnC] >> [onBlur]");
        this.enableDisableBtn();
    };

    enableDisableBtn = () => {
        console.log("[MAETnC] >> [enableDisableBtn]");
        const { pdpaSelectValue, radioTNCYesChecked } = this.state;
        if (pdpaSelectValue !== "" && radioTNCYesChecked) {
            const isValidForm = this.validateFormData();
            this.setState({
                isNextDisabled: !isValidForm,
            });
        } else {
            this.setState({
                isNextDisabled: true,
            });
        }
    };

    checkFetchCountryData = () => {
        console.log("[MAETnC] >> [checkFetchCountryData]");

        if (this.state.fatcaCountryList?.length === 0) {
            getMAEMasterData(true)
                .then((response) => {
                    console.log("[MAETnC][checkFetchCountryData] >> Success");
                    const result = response.data.result;
                    if (result) {
                        this.setState({
                            fatcaCountryList: result.fatcaCountryList,
                            crsCountryList: result.fatcaCountryList,
                        });
                    }
                })
                .catch((error) => {
                    console.log("[MAETnC][checkFetchCountryData] >> Failure");
                    showErrorToast({
                        message: error.message,
                    });
                });
        }
    };

    onUSCountryPressed = (from) => {
        console.log("[MAETnC] >> [onUSCountryPressed]");
        Keyboard.dismiss();
        this.setState({ displayUSTaxPicker: true });
    };

    onCRSCountryPressed = (from) => {
        console.log("[MAETnC] >> [onCRSCountryPressed]");
        Keyboard.dismiss();
        this.setState({ displayCRSTaxPicker: true });
    };

    onRadioBtnPDPATap = (params) => {
        console.log("[MAETnC] >> [onRadioBtnPDPATap]");
        const radioBtnId = params.radioBtnId;
        if (radioBtnId === YES) {
            this.setState(
                {
                    radioPDPAYesChecked: true,
                    radioPDPANoChecked: false,
                    pdpaSelectValue: "Y",
                },
                () => {
                    this.enableDisableBtn();
                }
            );
        } else if (radioBtnId === NO) {
            this.setState(
                {
                    radioPDPAYesChecked: false,
                    radioPDPANoChecked: true,
                    pdpaSelectValue: "N",
                },
                () => {
                    this.enableDisableBtn();
                }
            );
        }
    };

    onRadioBtnTNCTap = () => {
        console.log("[MAETnC] >> [onRadioBtnTNCTap]");
        this.setState(
            {
                radioTNCYesChecked: !this.state.radioTNCYesChecked,
            },
            () => {
                this.enableDisableBtn();
            }
        );
    };

    onCloseTap = () => {
        console.log("[MAETnC] >> [onCloseTap]");
        const { filledUserDetails } = this.state;
        this.props.navigation.navigate(filledUserDetails?.entryStack || navigationConstant.MORE, {
            screen: filledUserDetails?.entryScreen || navigationConstant.APPLY_SCREEN,
            params: filledUserDetails?.entryParams,
        });
    };

    handleSignUpCampaignRedirection = () => {
        const { filledUserDetails } = this.state;
        this.props.navigation.navigate(navigationConstant.ON_BOARDING_MODULE, {
            screen: "OnboardingM2uSignUpCampaign",
            params: {
                filledUserDetails,
                from: "TNC",
            },
        });
    };

    handleSuccessRedirection = (screen, navParams) => {
        this.props.navigation.navigate(screen, {
            ...navParams,
        });
    };

    onContinueTap = async () => {
        console.log("[MAETnC] >> [moveToNext]");
        const { onBoardDetails2 } = this.state.filledUserDetails;
        let filledUserDetails = this.prepareUserDetails();
        if (onBoardDetails2.from !== "NewMAE") {
            const { isOnboard } = this.props.getModel("user");
            const { trinityFlag } = this.props.getModel("mae");
            const { isZoloz } = this.props.getModel("misc");
            const response = await MAEOnboardController.createMAE(
                filledUserDetails,
                isOnboard,
                trinityFlag,
                isZoloz
            );
            if (response.message) {
                showErrorToast({
                    message: response.message,
                });
            } else {
                const { isSignupCampaignPeriod } = this.props.getModel("misc");
                const result = response.data.result;
                if (result.statusCode === "0000") {
                    filledUserDetails = this.prepareUserDetails(result);
                    if (onBoardDetails2.from === "ETBWithLoan/FD") {
                        this.props.navigation.navigate(navigationConstant.MAE_M2U_USERNAME, {
                            filledUserDetails,
                        });
                    } else if (onBoardDetails2.from === "ETBMAE") {
                        if (
                            filledUserDetails?.entryScreen ===
                            navigationConstant.ON_BOARDING_M2U_ACCOUNTS
                        ) {
                            if (isSignupCampaignPeriod) {
                                this.handleSignUpCampaignRedirection();
                            } else {
                                this.handleSuccessRedirection(navigationConstant.MAE_SUCCESS2, {
                                    filledUserDetails,
                                });
                            }
                        } else {
                            if (isSignupCampaignPeriod) {
                                this.handleSignUpCampaignRedirection();
                            } else {
                                this.handleSuccessRedirection(navigationConstant.MAE_SUCCESS, {
                                    filledUserDetails,
                                });
                            }
                        }
                    } else {
                        this.handleSuccessRedirection(navigationConstant.MAE_SUCCESS2, {
                            filledUserDetails,
                            from: "TNC",
                        });
                    }

                    return;
                }
                showErrorToast({
                    message: result.statusDesc,
                });
            }
        } else {
            this.props.navigation.navigate(navigationConstant.MAE_OTP_REQUEST, {
                filledUserDetails,
            });
        }
    };

    validateFormData = () => {
        console.log("[MAETnC] >> [validateFormData]");

        Keyboard.dismiss();

        let err = "";
        // const err1 = "Please agree to the Foreign Account Compliance Act (FATCA) to continue."; //FATCA
        const err2 = ERR_PDPA_2;
        const err3 = ERR_TERMS;

        if (this.state.pdpaSelectValue === "") {
            err = err2;
        }

        // Empty check for mandatory fields
        if (!this.state.radioTNCYesChecked) {
            err = err3;
        }

        // Navigate to OTP reques page
        return !err;
    };

    prepareUserDetails = (result) => {
        console.log("CaptureDocumentScreen >> [prepareUserDetails]");
        const tncData = { radioPDPAYesChecked: this.state.radioPDPAYesChecked };
        const MAEUserDetails = this.state.filledUserDetails || {};
        MAEUserDetails.tncData = tncData;
        if (result) {
            MAEUserDetails.MAEAccountCreateResult = result;
        }

        return MAEUserDetails;
    };

    onLinkTap = (from) => {
        console.log("[MAETnC] >> [onTnCLinkTap]");
        const params = {
            file: from === "TNC" ? MAE_ISL_TNC : PDPA_PERSONAL,
            share: false,
            type: "url",
            route: navigationConstant.DUITNOW_CONFIRMATION,
            module: navigationConstant.SETTINGS_MODULE,
            title: from === "TNC" ? MAE_TNC_HEADER_1 : "PDPA",
            pdfType: SHARERECEIPT,
        };

        this.props.navigation.navigate(navigationConstant.COMMON_MODULE, {
            screen: navigationConstant.PDF_VIEW,
            params: { params },
        });
    };

    onDoneButtonPress = (value) => {
        console.log("[MAETnC] >> [onDoneButtonPress]");
        if (value) {
            this.setState({ displayUSTaxPicker: false }, () => {
                this.enableDisableBtn();
            });
        }
    };
    onCancelButtonPress = () => {
        console.log("[MAETnC] >> [onCancelButtonPress]");
        this.setState({ displayUSTaxPicker: false });
    };

    onDoneCRSButtonPress = (value) => {
        console.log("[MAETnC] >> [onDoneCRSButtonPress]");
        if (value) {
            this.setState(
                {
                    displayCRSTaxPicker: false,
                },
                () => {
                    this.enableDisableBtn();
                }
            );
        }
    };
    onCancelCRSButtonPress = () => {
        console.log("[MAETnC] >> [onCancelCRSButtonPress]");
        this.setState({ displayCRSTaxPicker: false });
    };

    scrollPickerData = (data) => {
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
            displayUSTaxPicker,
            displayCRSTaxPicker,
            radioPDPAYesChecked,
            radioPDPANoChecked,
            fatcaCountryList,
            crsCountryList,
            radioTNCYesChecked,
            isNextDisabled,
        } = this.state;
        return (
            <React.Fragment>
                <ScreenContainer
                    backgroundType="color"
                    backgroundColor={MEDIUM_GREY}
                    showOverlay={displayUSTaxPicker || displayCRSTaxPicker}
                >
                    <View style={styles.viewContainer}>
                        <ScreenLayout
                            paddingBottom={0}
                            paddingTop={0}
                            paddingHorizontal={0}
                            useSafeArea
                            header={
                                <HeaderLayout
                                    headerRightElement={
                                        <HeaderCloseButton onPress={this.onCloseTap} />
                                    }
                                />
                            }
                        >
                            <ScrollView>
                                <View style={styles.fieldContainer}>
                                    {/* Title */}
                                    <Typo
                                        fontSize={14}
                                        lineHeight={23}
                                        fontWeight="600"
                                        letterSpacing={0}
                                        textAlign="left"
                                        text={MAE_TNC_HEADER_2}
                                    />

                                    {/* Description */}
                                    <Typo
                                        fontSize={14}
                                        lineHeight={25}
                                        fontWeight="normal"
                                        letterSpacing={0}
                                        style={styles.marginTop15}
                                        textAlign="left"
                                    >
                                        {ACKNOWLEDGE_TEXT1}
                                        <Typo
                                            fontSize={14}
                                            lineHeight={25}
                                            fontWeight="normal"
                                            letterSpacing={0}
                                            textAlign="left"
                                            style={styles.textUnderline}
                                            text={ACKNOWLEDGE_TEXT2}
                                            onPress={() => this.onLinkTap("PDPA")}
                                        />
                                    </Typo>
                                    <Typo
                                        fontSize={14}
                                        lineHeight={20}
                                        fontWeight="normal"
                                        letterSpacing={0}
                                        textAlign="left"
                                        style={styles.marginTop20}
                                        text={PROMOTIONAL_MARKETING_TEXT}
                                    />
                                    <View style={styles.groupContainer}>
                                        <ColorRadioButton
                                            title={AGREE_PROMOTIONAL_MARKETING_TITLE}
                                            isSelected={radioPDPAYesChecked}
                                            fontSize={14}
                                            onRadioButtonPressed={(value) => {
                                                this.onRadioBtnPDPATap({ radioBtnId: YES });
                                            }}
                                        />
                                        <ColorRadioButton
                                            title={DISAGREE_PROMOTIONAL_MARKETING_TITLE}
                                            isSelected={radioPDPANoChecked}
                                            fontSize={14}
                                            onRadioButtonPressed={(value) => {
                                                this.onRadioBtnPDPATap({ radioBtnId: NO });
                                            }}
                                        />
                                    </View>
                                </View>
                                <View style={styles.inputContainer}></View>
                                <View style={styles.fieldTNCContainer}>
                                    {/* Title */}
                                    <Typo
                                        fontSize={14}
                                        lineHeight={23}
                                        fontWeight="600"
                                        letterSpacing={0}
                                        textAlign="left"
                                        text={TERMS_CONDITIONS}
                                    />
                                    <View style={styles.radioCheckContainer}>
                                        <TouchableOpacity onPress={this.onRadioBtnTNCTap}>
                                            <Image
                                                style={styles.image}
                                                source={
                                                    radioTNCYesChecked
                                                        ? Assets.icRadioChecked
                                                        : Assets.icRadioUnchecked
                                                }
                                            />
                                        </TouchableOpacity>
                                        <View style={styles.textContainer}>
                                            <Typo
                                                fontSize={14}
                                                lineHeight={22}
                                                fontWeight="normal"
                                                letterSpacing={0}
                                                textAlign="left"
                                            >
                                                <Text> I have read and I agree to the </Text>
                                                <Typo
                                                    fontSize={14}
                                                    lineHeight={22}
                                                    fontWeight="normal"
                                                    letterSpacing={0}
                                                    textAlign="left"
                                                    style={styles.textUnderline}
                                                    text={TERMS_CONDITIONS}
                                                    onPress={() => this.onLinkTap("TNC")}
                                                />
                                            </Typo>
                                        </View>
                                    </View>
                                </View>
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
                    showPicker={displayUSTaxPicker}
                    items={this.scrollPickerData(fatcaCountryList)}
                    onCancelButtonPressed={this.onCancelButtonPress}
                    onDoneButtonPressed={this.onDoneButtonPress}
                />
                <ScrollPicker
                    showPicker={displayCRSTaxPicker}
                    items={this.scrollPickerData(crsCountryList)}
                    onCancelButtonPressed={this.onCancelCRSButtonPress}
                    onDoneButtonPressed={this.onDoneCRSButtonPress}
                />
            </React.Fragment>
        );
    }
}
MAETnC.propTypes = {
    route: PropTypes.shape({
        params: PropTypes.shape({
            filledUserDetails: PropTypes.shape({
                onBoardDetails2: PropTypes.shape({
                    from: PropTypes.string,
                }),
                masterData: PropTypes.object,
            }),
        }),
        eKycParams: PropTypes.object,
    }),
    navigation: PropTypes.object,
};

const styles = StyleSheet.create({
    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        paddingHorizontal: 24,
        paddingVertical: 25,
    },
    fieldContainer: {
        marginHorizontal: 36,
        marginTop: 24,
    },
    fieldTNCContainer: {
        marginBottom: 30,
        marginHorizontal: 36,
        marginTop: 24,
    },
    groupContainer: {
        marginTop: 25,
    },
    image: {
        borderColor: BLACK,
        borderRadius: 10,
        borderWidth: 1,
        height: 20,
        marginRight: 7,
        width: 20,
    },
    inputContainer: {
        alignItems: "center",
        borderBottomColor: GREY,
        borderBottomWidth: 1,
        flexDirection: "row",
        height: 48,
        justifyContent: "flex-start",
        marginHorizontal: 36,
    },
    linearGradient: {
        height: 30,
        left: 0,
        position: "absolute",
        right: 0,
        top: -30,
    },
    radioCheckContainer: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "flex-start",
        marginTop: 18,
    },
    textContainer: {
        marginTop: 15,
        width: "87%",
    },
    viewContainer: {
        flex: 1,
    },
    textUnderline: {
        textDecorationLine: "underline",
    },
    marginTop20: {
        marginTop: 20,
    },
    marginTop15: {
        marginTop: 15,
    },
});

export default withModelContext(MAETnC);
