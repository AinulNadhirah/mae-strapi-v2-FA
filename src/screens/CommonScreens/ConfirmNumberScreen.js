import React, { useEffect } from "react";
import { View, StyleSheet, ImageBackground, Dimensions, TouchableOpacity } from "react-native";
import PropTypes from "prop-types";
import Assets from "@assets";
import Typo from "@components/Text";
import { GAOnboarding } from "@services/analytics/analyticsSTPMae";
import ActionButton from "@components/Buttons/ActionButton";
import { YELLOW, ROYAL_BLUE } from "@constants/colors";

const ConfirmNumberScreen = ({
    otpText,
    reqType,
    mobileNumber,
    onConfirmBtnPress,
    onNotMeBtnPress,
    btnText,
    subBtnText,
}) => {
    const onNotMeTap = () => {
        onNotMeBtnPress();
    };
    const onConfirmBtnTap = () => {
        onConfirmBtnPress();
    };

    useEffect(() => {
        GAOnboarding.onOTPRequest();
    }, []);

    return (
        <View style={styles.wrapper}>
            <View style={styles.container}>
                <Typo
                    fontSize={14}
                    fontWeight="600"
                    lineHeight={18}
                    text={otpText}
                    textAlign="left"
                />
                <Typo
                    fontSize={20}
                    fontWeight="300"
                    lineHeight={28}
                    style={styles.label}
                    text={`Your ${reqType} will be sent to\n${mobileNumber}. Please confirm your mobile number.`}
                    textAlign="left"
                />
            </View>
            <View style={styles.footer}>
                <ActionButton
                    fullWidth
                    borderRadius={25}
                    onPress={onConfirmBtnTap}
                    backgroundColor={YELLOW}
                    componentCenter={
                        <Typo text={btnText} fontSize={14} fontWeight="600" lineHeight={18} />
                    }
                />
                <TouchableOpacity onPress={onNotMeTap} activeOpacity={0.8}>
                    <Typo
                        color={ROYAL_BLUE}
                        fontSize={14}
                        fontWeight="600"
                        lineHeight={18}
                        text={subBtnText}
                        textAlign="left"
                        style={styles.changeNumber}
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    changeNumber: {
        paddingVertical: 24,
    },
    container: {
        flex: 1,
        paddingHorizontal: 12,
    },
    footer: {
        alignItems: "center",
        flexDirection: "column",
        width: "100%",
    },

    label: {
        paddingVertical: 8,
    },
    wrapper: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-between",
    },
});

ConfirmNumberScreen.propTypes = {
    otpText: PropTypes.string,
    mobileNumber: PropTypes.string.isRequired,
    onConfirmBtnPress: PropTypes.func.isRequired,
    onNotMeBtnPress: PropTypes.func.isRequired,
    btnText: PropTypes.string,
    subBtnText: PropTypes.string,
    reqType: PropTypes.string,
};

ConfirmNumberScreen.defaultProps = {
    otpText: "One Time Password",
    mobileNumber: "",
    btnText: "Confirm",
    subBtnText: "Not Mine",
    reqType: "OTP",
    onConfirmBtnPress: () => {},
    onNotMeBtnPress: () => {},
};

const Memoiz = React.memo(ConfirmNumberScreen);

export default Memoiz;
