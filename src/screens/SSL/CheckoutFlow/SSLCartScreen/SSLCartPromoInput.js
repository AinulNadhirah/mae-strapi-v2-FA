import PropTypes from "prop-types";
import React, { useState, useCallback, useEffect } from "react";
import { StyleSheet, View } from "react-native";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import { LongTextInput } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";

import { withModelContext } from "@context";

import { BLACK, DISABLED, DISABLED_TEXT, MEDIUM_GREY, YELLOW } from "@constants/colors";

SSLCartPromoInput.propTypes = {
    promoCodeString: PropTypes.string,
    applyPromoCode: PropTypes.func,
    isLoading: PropTypes.bool,
    promoError: PropTypes.string,
    isShowPromoInputModal: PropTypes.bool,
    setIsShowPromoInputModal: PropTypes.func,
};

function SSLCartPromoInput({
    promoCodeString,
    applyPromoCode,
    isLoading,
    promoError,
    isShowPromoInputModal,
    setIsShowPromoInputModal,
}) {
    const [tempPromoCode, setTempPromoCode] = useState("");

    useEffect(() => {
        if (isShowPromoInputModal) {
            setTempPromoCode(promoCodeString || "");
        }
    }, [isShowPromoInputModal, promoCodeString]);

    const onDismissPromoInputModal = useCallback(() => {
        setIsShowPromoInputModal(false);
    }, [setIsShowPromoInputModal]);

    function onApply() {
        applyPromoCode({ tempPromoCode });
    }

    // Disable button if empty, disable button if promo code is invalid
    // onPress still function, there's one more layer of checking in call API function
    const isApplyDisable =
        tempPromoCode.length === 0 || (tempPromoCode === promoCodeString && promoError);

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <ScreenLayout
                header={
                    <HeaderLayout
                        backgroundColor={MEDIUM_GREY}
                        headerRightElement={
                            <HeaderCloseButton onPress={onDismissPromoInputModal} />
                        }
                        headerCenterElement={
                            <Typo
                                fontSize={16}
                                fontWeight="600"
                                color={BLACK}
                                lineHeight={19}
                                text="Promo Code"
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
                        text="Promo Code"
                    />
                    <LongTextInput
                        isLoading={isLoading}
                        autoFocus
                        clearButtonMode="always"
                        value={tempPromoCode}
                        onChangeText={setTempPromoCode}
                        placeholder="Enter Promo Code"
                        maxLength={20}
                        returnKeyType="done"
                        autoCorrect={false}
                        autoCapitalize="characters"
                        isValid={!promoError}
                        isValidate
                        errorMessage={promoError}
                    />
                    <View style={styles.container} />
                    <ActionButton
                        onPress={onApply}
                        backgroundColor={isApplyDisable ? DISABLED : YELLOW}
                        borderRadius={48 / 2}
                        style={styles.actionBtn}
                        componentCenter={
                            <Typo
                                fontSize={14}
                                color={isApplyDisable ? DISABLED_TEXT : BLACK}
                                fontWeight="600"
                                lineHeight={18}
                                text="Apply"
                            />
                        }
                    />
                </View>
            </ScreenLayout>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default withModelContext(SSLCartPromoInput);
