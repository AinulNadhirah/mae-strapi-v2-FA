import Clipboard from "@react-native-community/clipboard";
import { useFocusEffect } from "@react-navigation/native";
import moment from "moment";
import PropTypes from "prop-types";
import React, { useState, useCallback, useEffect, useRef } from "react";
import {
    View,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Image,
    TouchableWithoutFeedback,
    Platform,
} from "react-native";
import ActionSheet from "react-native-actionsheet";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import ScreenLoader from "@components/Loaders/ScreenLoader";
import Typo from "@components/Text";
import { showInfoToast, showErrorToast, showSuccessToast } from "@components/Toast";

import { withModelContext } from "@context";

import { updateUserProfile, updateUserEmail, invokeL2, getInviteCode } from "@services";
import { GASettingsScreen } from "@services/analytics/analyticsSettings";
import { unregisterPushNotification, registerPushNotification } from "@services/pushNotifications";

import {
    MEDIUM_GREY,
    YELLOW,
    GREY,
    WHITE,
    SHADOW,
    FADE_GREY,
    ROYAL_BLUE,
    DISABLED,
    DISABLED_TEXT,
    BLACK,
    GARGOYLE,
} from "@constants/colors";

import { maskedEmail, maskedMobileNumber } from "@utils";
import { validateEmail, nameRegex } from "@utils/dataModel";

import Images from "@assets";

const styles = StyleSheet.create({
    actionContainer: {
        padding: 24,
    },
    container: {
        flex: 1,
    },
    inputRow: {
        backgroundColor: WHITE,
        borderBottomColor: GREY,
        borderBottomWidth: 1,
        paddingHorizontal: 24,
        position: "relative",
    },
    inputRowContainer: {
        borderTopColor: GREY,
        borderTopWidth: 1,
    },
    inputRowLabel: {
        left: 24,
        position: "absolute",
        top: 18,
    },
    inputRowText: {
        paddingBottom: 18,
        paddingTop: 44,
    },
    inputRowTextInput: {
        color: ROYAL_BLUE,
        fontFamily: "Montserrat-SemiBold",
        fontSize: 14,
        lineHeight: 18,
        paddingBottom: 18,
        paddingHorizontal: 0,
        paddingTop: 44,
    },
    loginHead: {
        marginBottom: 4,
    },
    normalWeight: {
        fontWeight: "normal",
    },
    profileContainer: {
        flex: 1,
        justifyContent: "space-between",
    },
    profilePicture: {
        alignItems: "center",
        paddingVertical: 28,
    },
    profilePictureAdd: {
        alignItems: "center",
        backgroundColor: WHITE,
        borderRadius: 16,
        bottom: 0,
        elevation: 10,
        height: 32,
        justifyContent: "center",
        position: "absolute",
        right: 0,
        shadowColor: SHADOW,
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 1,
        shadowRadius: 14,
        width: 32,
    },
    profilePictureAddIcon: {
        height: 13,
        width: 16,
    },
    profilePictureCircle: {
        borderRadius: 60,
        overflow: "hidden",
    },
    profilePictureImage: { height: 120, width: 120 },
    profilePictureInner: {
        marginBottom: 16,
        position: "relative",
    },
});

const InputRow = ({
    label,
    value,
    isInput,
    isEmail,
    onPress,
    onEmailFocus,
    onChangeText,
    placeholder = "",
    children,
}) => {
    function handleOnPress() {
        if (!isInput && typeof onPress === "function") onPress();
    }

    return (
        <TouchableWithoutFeedback onPress={handleOnPress}>
            <View style={styles.inputRow}>
                <View style={styles.inputRowLabel}>
                    <Typo
                        text={label}
                        fontWeight="normal"
                        fontSize={14}
                        lineHeight={18}
                        textAlign="left"
                    />
                </View>
                {children ? (
                    children
                ) : isInput ? (
                    <TextInput
                        style={[
                            styles.inputRowTextInput,
                            Platform.OS === "android" && styles.normalWeight,
                        ]}
                        value={value}
                        keyboardType={isEmail ? "email-address" : "default"}
                        onChangeText={onChangeText}
                        autoCapitalize={isEmail ? "none" : "words"}
                        autoCorrect={!isEmail}
                        placeholder={placeholder}
                        placeholderTextColor="rgb(199,199,205)"
                        allowFontScaling={false}
                        onFocus={onEmailFocus}
                    />
                ) : (
                    <Typo
                        text={value}
                        fontWeight="600"
                        fontSize={14}
                        lineHeight={18}
                        textAlign="left"
                        color={ROYAL_BLUE}
                        style={styles.inputRowText}
                    />
                )}
            </View>
        </TouchableWithoutFeedback>
    );
};

InputRow.propTypes = {
    label: PropTypes.string,
    value: PropTypes.string,
    placeholder: PropTypes.string,
    isInput: PropTypes.bool,
    isEmail: PropTypes.bool,
    onPress: PropTypes.func,
    onEmailFocus: PropTypes.func,
    onChangeText: PropTypes.func,
};

function Profile({ navigation, route, getModel, updateModel }) {
    const { profileImage, mobileNumber, fullName, email, referralCode, cus_type } =
        getModel("user");
    const { isPostLogin, lastSuccessfull, fcmToken } = getModel("auth");
    const { deviceId } = getModel("device");
    const { isPromotionsEnabled } = getModel("misc");
    const [profileName, setProfileName] = useState(fullName);
    const profileMobile = mobileNumber ? maskedMobileNumber(`+${mobileNumber}`) : "";
    const [profileEmail, setProfileEmail] = useState(email);
    const [isEmailFirstEdit, setIsEmailFirstEdit] = useState(true);
    const [isSavingOthers, setIsSavingOthers] = useState(false);
    const [loading, setLoading] = useState(false);
    const actionsheet = useRef();
    const isLoading = useRef(false);
    const isUpdatingPhone = useRef(false);
    const soleProp = cus_type === "02";

    function handleBack() {
        navigation.canGoBack() && navigation.goBack();
    }

    const getReferalCode = useCallback(async () => {
        try {
            const referral = await getInviteCode();

            if (referral) {
                const { inviteCode, ntb } = referral?.data;

                if (inviteCode) {
                    updateModel({
                        user: {
                            referralCode: inviteCode,
                            rewardInfo: ntb,
                        },
                    });
                }
            }
        } catch (error) {
            showErrorToast({
                message: "Unable to retrieved referral code.",
            });
        }
    }, []);

    function handleProfileNameChange(text) {
        if (text.split(" ").join("").length < 16) {
            setProfileName(text);
        }
    }

    function handleProfileMobileTap() {
        isUpdatingPhone.current = false;
        navigation.navigate("ChangePhoneNumber", {
            serviceName: "changePhoneNo",
            onServiceCompleteNav: {
                stack: "SettingsModule",
                screen: "Profile",
            },
        });
    }

    function handleProfileEmailChange(text) {
        setProfileEmail(text);
    }

    function onEmailFocus() {
        if (isEmailFirstEdit) {
            setIsEmailFirstEdit(false);
            setProfileEmail("");
        }
    }

    function updateSuccess() {
        setIsEmailFirstEdit(true);
        showSuccessToast({
            message: "Profile successfully updated.",
        });
        GASettingsScreen.onSuccessfulProfileUpdate();
    }

    function handleUpdatePhoto() {
        actionsheet.current.show();
        // IdleManager.enableChecking(false);
    }

    function handleOnPressActionsheet(index) {
        // IdleManager.enableChecking(true);
        // IdleManager.doCheck(false);
        if (index < 2) {
            navigation.navigate("ProfileCamera", {
                imagePicker: index === 1,
            });
        }
    }

    async function handleSaveProfile() {
        if (
            !isLoading.current &&
            profileName.trim().length > 2 &&
            nameRegex(profileName) &&
            ((profileEmail && validateEmail(profileEmail)) || !profileEmail)
        ) {
            isLoading.current = true;
            setLoading(true);

            const trimmedName = profileName.replace(/  +/g, " ").trim();

            try {
                // don't care if email or name didn't change just call it both
                const responseEmail = profileEmail
                    ? await updateUserEmail({
                          email: profileEmail,
                      })
                    : true;

                const responseProfile = await updateUserProfile({
                    fullName: trimmedName,
                });

                if (responseEmail && responseProfile) {
                    // update the context. email in here most definitely updated to the latest one,
                    const { fullName, phone, imageBase64, username, email, userId } =
                        responseProfile.data.result;

                    updateModel({
                        user: {
                            fullName,
                            mobileNumber: phone,
                            email,
                            username,
                            m2uUserId: userId,
                            mayaUserId: userId,
                            profileImage: imageBase64 ? `data:jpeg;base64,${imageBase64}` : null,
                        },
                    });

                    setProfileName(fullName);
                    setProfileEmail(email);
                    GASettingsScreen.onSaveProfile();

                    updateSuccess();
                }
            } catch (error) {
                showErrorToast({
                    message: error.message || "Nothing is working.",
                });
            } finally {
                setLoading(false);
                isLoading.current = false;
            }
        } else {
            if (profileName.length < 3 || !nameRegex(profileName)) {
                showInfoToast({
                    message:
                        "Name must contain at least 3 alphabetical characters and space(s) only.",
                });
            } else if (!validateEmail(profileEmail)) {
                showInfoToast({
                    message: "Please enter a valid email address.",
                });
            }
        }
    }

    const handlePns = useCallback(
        async (oldNo, newNo) => {
            if (fcmToken) {
                const notifyType = isPromotionsEnabled ? "A" : "T";
                try {
                    await unregisterPushNotification(oldNo, deviceId, fcmToken, notifyType);
                    await registerPushNotification(newNo, deviceId, fcmToken, notifyType);
                } catch (error) {
                    console.log(error);
                }
            }
        },
        [deviceId, fcmToken, isPromotionsEnabled]
    );

    const handleProfileReferral = useCallback(() => {
        // go to referral screen
        GASettingsScreen.onProfileReferral();

        navigation.navigate("Referral");
    }, [navigation]);

    const handleCopyReferral = useCallback(() => {
        // copy the referral code
        Clipboard.setString(referralCode);

        showInfoToast({
            message: "Referral code copied to clipboard.",
        });
    }, [referralCode]);

    const init = useCallback(async () => {
        try {
            const response = await invokeL2(false);

            if (!response) {
                throw new Error();
            }

            setIsSavingOthers(false);
        } catch (error) {
            navigation.goBack();
        }
    }, [navigation]);

    const handleUpdatePhonePns = useCallback(async () => {
        const params = route?.params?.serviceParams;
        const oldNo = mobileNumber;
        isUpdatingPhone.current = true;
        const showToast = params?.showToast ?? true;

        try {
            await handlePns(oldNo, params.phoneNo);
        } catch (error) {
            // something happen or wtv.
        }

        // update our context
        updateModel({
            user: {
                mobileNumber: params.phoneNo,
            },
        });
        showToast && updateSuccess();

        navigation.setParams({ serviceParams: null, serviceResult: null });
    }, [route?.params?.serviceParams, mobileNumber, updateModel, navigation, handlePns]);

    const isDisabled = fullName === profileName && email === profileEmail;

    useFocusEffect(
        useCallback(() => {
            if (route?.params?.serviceResult === "success" && !isUpdatingPhone.current) {
                handleUpdatePhonePns();
            }
        }, [route, handleUpdatePhonePns])
    );

    useEffect(() => {
        // we have to manually trigger the touch id login due we lack of API to identify the scope
        if (!isPostLogin) {
            init();
        } else {
            if (!referralCode) getReferalCode();
        }
    }, [isPostLogin, init, referralCode, getReferalCode]);

    return (
        <ScreenContainer
            backgroundType="color"
            backgroundColor={MEDIUM_GREY}
            showLoaderModal={isSavingOthers}
            analyticScreenName="Settings_Profile"
        >
            {!isPostLogin ? (
                <ScreenLoader showLoader />
            ) : (
                <>
                    <ScreenLayout
                        paddingBottom={0}
                        paddingTop={0}
                        paddingHorizontal={0}
                        header={
                            <HeaderLayout
                                backgroundColor={GARGOYLE}
                                headerCenterElement={
                                    <Typo
                                        text="Update Profile"
                                        fontWeight="600"
                                        fontSize={16}
                                        lineHeight={19}
                                    />
                                }
                                headerLeftElement={<HeaderBackButton onPress={handleBack} />}
                            />
                        }
                        neverForceInset={["bottom"]}
                        useSafeArea
                    >
                        <KeyboardAwareScrollView
                            // contentContainerStyle={styles.container}
                            showsVerticalScrollIndicator={false}
                            scrollEnabled
                        >
                            {isPostLogin && (
                                <View style={styles.container}>
                                    <View style={styles.profileContainer}>
                                        <View>
                                            <View style={styles.profilePicture}>
                                                <TouchableOpacity
                                                    onPress={handleUpdatePhoto}
                                                    activeOpacity={0.9}
                                                    style={styles.profilePictureInner}
                                                >
                                                    <View style={styles.profilePictureCircle}>
                                                        <Image
                                                            source={
                                                                profileImage
                                                                    ? { uri: profileImage }
                                                                    : Images.emptyProfile
                                                            }
                                                            style={styles.profilePictureImage}
                                                        />
                                                    </View>
                                                    <View style={styles.profilePictureAdd}>
                                                        <Image
                                                            source={Images.cameraPlus}
                                                            style={styles.profilePictureAddIcon}
                                                        />
                                                    </View>
                                                </TouchableOpacity>
                                                <View>
                                                    <Typo
                                                        text="Last successful login"
                                                        fontWeight="normal"
                                                        fontSize={12}
                                                        lineHeight={18}
                                                        style={styles.loginHead}
                                                    />
                                                    <Typo
                                                        text={
                                                            lastSuccessfull
                                                                ? moment(lastSuccessfull).format(
                                                                      "D MMM YYYY, h:mm A"
                                                                  )
                                                                : "-"
                                                        }
                                                        fontWeight="normal"
                                                        fontSize={12}
                                                        lineHeight={18}
                                                        color={FADE_GREY}
                                                    />
                                                </View>
                                            </View>
                                            <View style={styles.inputRowContainer}>
                                                <InputRow
                                                    isInput
                                                    label="Name"
                                                    value={profileName}
                                                    onChangeText={handleProfileNameChange}
                                                />
                                                <InputRow
                                                    label="Mobile number"
                                                    value={profileMobile}
                                                    onPress={handleProfileMobileTap}
                                                />
                                                <InputRow
                                                    isInput
                                                    isEmail
                                                    label="Email address"
                                                    value={
                                                        isEmailFirstEdit
                                                            ? maskedEmail(profileEmail)
                                                            : profileEmail
                                                    }
                                                    onChangeText={handleProfileEmailChange}
                                                    placeholder="Optional"
                                                    onEmailFocus={onEmailFocus}
                                                />
                                                {!soleProp && (
                                                    <InputRow
                                                        label="Referral code"
                                                        onPress={handleProfileReferral}
                                                    >
                                                        <View
                                                            style={{
                                                                flexDirection: "row",
                                                                justifyContent: "space-between",
                                                                alignItems: "center",
                                                            }}
                                                        >
                                                            <View
                                                                style={{
                                                                    paddingTop: 44,
                                                                    paddingBottom: 18,
                                                                }}
                                                            >
                                                                <TouchableOpacity
                                                                    onPress={handleCopyReferral}
                                                                    activeOpacity={0.8}
                                                                    style={{
                                                                        flexDirection: "row",
                                                                        alignItems: "center",
                                                                    }}
                                                                >
                                                                    <Typo
                                                                        text={referralCode}
                                                                        fontWeight="600"
                                                                        fontSize={14}
                                                                        lineHeight={18}
                                                                        textAlign="left"
                                                                        color={ROYAL_BLUE}
                                                                    />
                                                                    <View
                                                                        style={{
                                                                            marginLeft: 8,
                                                                        }}
                                                                    >
                                                                        <Image
                                                                            source={
                                                                                Images.copyClipboard
                                                                            }
                                                                            style={{
                                                                                height: 14,
                                                                                width: 12,
                                                                            }}
                                                                        />
                                                                    </View>
                                                                </TouchableOpacity>
                                                            </View>
                                                            <Image
                                                                source={
                                                                    Images.icChevronRight24Black
                                                                }
                                                                style={{
                                                                    height: 24,
                                                                    width: 24,
                                                                }}
                                                            />
                                                        </View>
                                                    </InputRow>
                                                )}
                                            </View>
                                        </View>
                                        <View style={styles.actionContainer}>
                                            <ActionButton
                                                fullWidth
                                                disabled={isDisabled}
                                                isLoading={loading}
                                                borderRadius={25}
                                                onPress={handleSaveProfile}
                                                backgroundColor={isDisabled ? DISABLED : YELLOW}
                                                componentCenter={
                                                    <Typo
                                                        text="Save Changes"
                                                        fontSize={14}
                                                        fontWeight="600"
                                                        lineHeight={18}
                                                        color={isDisabled ? DISABLED_TEXT : BLACK}
                                                    />
                                                }
                                            />
                                        </View>
                                    </View>
                                </View>
                            )}
                        </KeyboardAwareScrollView>
                    </ScreenLayout>
                    <ActionSheet
                        ref={actionsheet}
                        options={["Take a photo", "Choose from library", "Cancel"]}
                        cancelButtonIndex={2}
                        onPress={handleOnPressActionsheet}
                    />
                </>
            )}
        </ScreenContainer>
    );
}

Profile.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
    getModel: PropTypes.func,
    updateModel: PropTypes.func,
};

export default withModelContext(Profile);
