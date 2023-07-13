import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import { View, StyleSheet, Dimensions, TouchableOpacity, Image } from "react-native";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";

import { withModelContext } from "@context";

import { BLACK, MEDIUM_GREY, YELLOW, DISABLED, DISABLED_TEXT } from "@constants/colors";
import { VALID_MOBILE_NUMBER } from "@constants/strings";

import * as DataModel from "@utils/dataModel";
import { checkNativeContatPermission, SSLUserContacteNoClass } from "@utils/dataModel/utility";

import assets from "@assets";

const { width } = Dimensions.get("window");

SSLCartPickupInput.propTypes = {
    title: PropTypes.string.isRequired,
    isShow: PropTypes.bool.isRequired,
    fullName: PropTypes.string,
    emailString: PropTypes.string,
    contactNoString: PropTypes.string,
    onDismiss: PropTypes.func,
    onCallback: PropTypes.func,
};
SSLCartPickupInput.defaultProps = {
    fullName: "",
    emailString: "",
    contactNoString: "",
};

function SSLCartPickupInput({
    title,
    isShow,
    fullName,
    emailString,
    contactNoString,
    onDismiss,
    onCallback,
}) {
    const [tempEmail, setTempEmail] = useState("");
    const [tempEmailErrMsg, setTempEmailErrMsg] = useState("");

    const [tempFullName, setTempFullName] = useState("");
    const [tempNameErrMsg, setTempNameErrMsg] = useState("");

    const [tempContactNoDisplay, setTempContactNoDisplay] = useState("");
    const [tempContactNoErrMsg, setTempContactNoErrMsg] = useState("");

    function onChangeContactNo(val) {
        setTempContactNoDisplay(SSLUserContacteNoClass(val).inTextFieldDisplayFormat());
    }

    async function getContact() {
        const contactInfo = await checkNativeContatPermission();
        if (contactInfo?.status) {
            const mobileNo = contactInfo?.mobileNo ?? "";

            if (DataModel.validateSSLContactNo(mobileNo?.trim())) {
                onChangeContactNo(mobileNo?.trim());
                setTempContactNoErrMsg("");
            } else {
                setTempContactNoErrMsg("Contact Number should contain 7 - 12 characters.");
            }
        }
    }

    const onEndEditing = {
        tempEmail: ({ isCTAChecking }) => {
            if (DataModel.validateEmail(tempEmail.trim())) {
                !isCTAChecking && setTempEmailErrMsg("");
                return true;
            } else {
                !isCTAChecking && setTempEmailErrMsg("Please enter a valid email address.");
                return false;
            }
        },
        tempFullName: ({ isCTAChecking }) => {
            if (DataModel.validateSSLRecipientName(tempFullName.trim())) {
                !isCTAChecking && setTempNameErrMsg("");
                return true;
            } else {
                !isCTAChecking &&
                    setTempNameErrMsg("Recipient Name should contain at least 2 character");
                return false;
            }
        },
        tempContactNo: ({ isCTAChecking }) => {
            const isValidLength = SSLUserContacteNoClass(tempContactNoDisplay).isValidLength();
            const isValidMalaysian =
                SSLUserContacteNoClass(tempContactNoDisplay).isMalaysianMobileNum();

            console.log("isValidLength", isValidLength, "isValidMalaysian", isValidMalaysian);
            if (isValidLength && isValidMalaysian) {
                !isCTAChecking && setTempContactNoErrMsg("");
                return true;
            } else if (!isValidLength) {
                !isCTAChecking &&
                    setTempContactNoErrMsg("Contact Number should contain 7 - 12 characters.");
                return false;
            } else {
                !isCTAChecking && setTempContactNoErrMsg(VALID_MOBILE_NUMBER);
                return false;
            }
        },
    };

    function onDone() {
        let isAllPass = true;
        for (const key in onEndEditing) {
            const bool = onEndEditing[key]({});
            if (!bool) {
                isAllPass = false;
            }
        }
        if (!isAllPass) return;

        onCallback({
            emailString: tempEmail,
            fullName: tempFullName,
            contactNoString: SSLUserContacteNoClass(tempContactNoDisplay).inBackendFormat(),
        });
    }

    useEffect(() => {
        if (isShow) {
            setTempFullName(fullName ?? "");
            setTempEmail(emailString ?? "");
            setTempContactNoDisplay(
                SSLUserContacteNoClass(contactNoString).inTextFieldDisplayFormat()
            );

            setTempEmailErrMsg("");
            setTempNameErrMsg("");
            setTempContactNoErrMsg("");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isShow]);

    let isDoneEnabled = true;
    for (const key in onEndEditing) {
        const bool = onEndEditing[key]({ isCTAChecking: true });
        if (!bool) {
            isDoneEnabled = false;
        }
    }

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <ScreenLayout
                header={
                    <HeaderLayout
                        backgroundColor={MEDIUM_GREY}
                        headerRightElement={<HeaderCloseButton onPress={onDismiss} />}
                        headerCenterElement={
                            <Typo
                                fontSize={16}
                                fontWeight="600"
                                color={BLACK}
                                lineHeight={19}
                                text={title}
                            />
                        }
                    />
                }
                useSafeArea
                neverForceInset={["bottom"]}
                paddingLeft={24}
                paddingRight={24}
                paddingBottom={22}
                paddingTop={22}
            >
                <View style={styles.container}>
                    <Typo
                        fontSize={14}
                        fontWeight="normal"
                        color={BLACK}
                        textAlign="left"
                        lineHeight={18}
                        text="Recipients Name"
                    />
                    <TextInput
                        autoFocus={false}
                        style={styles.emailTextInput}
                        value={tempFullName}
                        onChangeText={setTempFullName}
                        maxLength={40}
                        returnKeyType="done"
                        autoCorrect={false}
                        autoCapitalize="none"
                        onEndEditing={onEndEditing.tempFullName}
                        placeholder="e.g. Danial Ariff"
                        isValid={!tempNameErrMsg}
                        isValidate
                        errorMessage={tempNameErrMsg}
                    />
                    <View style={styles.height2} />

                    <Typo
                        fontSize={14}
                        fontWeight="normal"
                        color={BLACK}
                        textAlign="left"
                        lineHeight={18}
                        text="Email"
                    />
                    <TextInput
                        autoFocus={false}
                        style={styles.emailTextInput}
                        value={tempEmail}
                        onChangeText={setTempEmail}
                        keyboardType="email-address"
                        maxLength={40}
                        returnKeyType="done"
                        autoCorrect={false}
                        autoCapitalize="none"
                        onEndEditing={onEndEditing.tempEmail}
                        placeholder="e.g. danial@gmail.com"
                        isValid={!tempEmailErrMsg}
                        isValidate
                        errorMessage={tempEmailErrMsg}
                    />
                    <View style={styles.height2} />
                    <Typo
                        fontSize={14}
                        fontWeight="normal"
                        color={BLACK}
                        textAlign="left"
                        lineHeight={18}
                        text="Contact Number"
                    />
                    <TextInput
                        autoFocus={false}
                        style={styles.emailTextInput}
                        value={tempContactNoDisplay}
                        onChangeText={onChangeContactNo}
                        keyboardType="phone-pad"
                        maxLength={12}
                        returnKeyType="done"
                        autoCorrect={false}
                        prefix="+60"
                        placeholder="e.g. 6012 345 6789"
                        autoCapitalize="none"
                        onEndEditing={onEndEditing.tempContactNo}
                        isValid={!tempContactNoErrMsg}
                        isValidate
                        errorMessage={tempContactNoErrMsg}
                    >
                        <TouchableOpacity onPress={getContact}>
                            <Image
                                accessible={true}
                                style={styles.selectContactImage}
                                source={assets.icSelectContact}
                            />
                        </TouchableOpacity>
                    </TextInput>

                    <View style={styles.container} />
                    <ActionButton
                        borderRadius={48 / 2}
                        style={styles.actionButton}
                        backgroundColor={isDoneEnabled ? YELLOW : DISABLED}
                        componentCenter={
                            <Typo
                                fontSize={14}
                                color={isDoneEnabled ? BLACK : DISABLED_TEXT}
                                fontWeight="600"
                                lineHeight={18}
                                text="Done"
                            />
                        }
                        onPress={onDone}
                    />
                </View>
            </ScreenLayout>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    actionButton: {
        height: 48,
        marginBottom: 44,
        marginTop: 56,
        width: width - 50,
    },
    container: { flex: 1 },
    emailTextInput: {
        fontFamily: "montserrat-SemiBold",
        fontSize: 20,
        letterSpacing: 0,
    },
    height2: { height: 24 },
    selectContactImage: {
        height: 30,
        resizeMode: "contain",
        width: 30,
    },
});

export default withModelContext(SSLCartPickupInput);
