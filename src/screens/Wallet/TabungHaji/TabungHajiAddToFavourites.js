import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import { ScrollView, StyleSheet, Image, View, TextInput, Platform } from "react-native";
import DeviceInfo from "react-native-device-info";

import { TABUNG_HAJI_ACKNOWLEDGEMENT } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Typography from "@components/Text";
import { errorToastProp, showErrorToast, showSuccessToast } from "@components/Toast";

import { useModelController } from "@context";

import { TabungHajiAnalytics } from "@services/analytics/analyticsTabungHaji";
import { addFavouriteTabungHajiAccount } from "@services/apiServiceTabungHaji";

import { GREY, ROYAL_BLUE, WHITE, BLACK } from "@constants/colors";
import {
    OWN_MBB,
    OTHER_MBB,
    TABUNGHAJI,
    TABUNG_HAJI,
    PLEASE_ENTER_NAME,
    NAME_MUST_ALPHANUMERICAL,
    COMMON_ERROR_MSG,
    SETTINGS_ENTER_NAME,
    ADD_AS_FAVOURITES,
    ADD_TO_FAVOURITES
} from "@constants/strings";

import { validateAlphaNumaric } from "@utils/dataModel";
import { getShadow, formateAccountNumber } from "@utils/dataModel/utility";
import { getDeviceRSAInformation } from "@utils/dataModel/utilityPartial.2";

import Styles from "@styles/Wallet/TransferAddToFavoritesStyle";

import Assets from "@assets";

function TabungHajiAddToFavourites({ navigation, route }) {
    const {
        tabunghajiTransferState: {
            bankName,
            toAccount,
            fundTransferType,
            toAccount: { receiverName, accNo, icNo },
        },
    } = route?.params;

    const { getModel } = useModelController();

    const [nickname, setNickname] = useState("");

    useEffect(() => {
        syncTabungHajiTransferStateToScreenState();

        if (bankName === TABUNG_HAJI) {
            TabungHajiAnalytics.addFavLoaded(TABUNGHAJI);
        } else {
            if (toAccount?.id === OWN_MBB) {
                TabungHajiAnalytics.addFavLoaded("Own");
            } else if (toAccount?.id === OTHER_MBB) {
                TabungHajiAnalytics.addFavLoaded("Others");
            }
        }
    }, []);

    function syncTabungHajiTransferStateToScreenState() {
        setNickname(toAccount?.receiverName);
    }

    function handleHeaderBackButtonPressed() {
        navigation.goBack();
    }

    function generateFavouriteDetails() {
        return [
            { label: "Bank name", value: bankName },
            { label: "Registered name", value: receiverName },
            { label: "Account number", value: formateAccountNumber(accNo) },
            { label: "Transfer type", value: fundTransferType }
        ];
    }

    function renderDetails() {
        const infoList = generateFavouriteDetails();
        return infoList
            .filter((filteredInfo) => {
                return filteredInfo?.value;
            })
            .map((info, i) => {
                return (
                    <View key={`containerFavInfo-${i}`} style={Styles.rowListContainer}>
                        <View style={Styles.rowListItemLeftContainer}>
                            <Typography
                                fontSize={14}
                                lineHeight={19}
                                textAlign="left"
                                text={info.label}
                            />
                        </View>
                        <View style={Styles.rowListItemRightContainer}>
                            <Typography
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={18}
                                textAlign="right"
                                text={info.value}
                            />
                        </View>
                    </View>
                );
            });
    }

    function handleNicknameUpdate(updatedNickname) {
        setNickname(updatedNickname);
    }

    function generateTransactionParams() {
        const deviceInfo = getModel("device");
        const mobileSDKData = getDeviceRSAInformation(deviceInfo.deviceInformation, DeviceInfo);

        return {
            action: "ADD",
            thAcctNo: accNo.replace(/\s/g, ""),
            thAcctNickName: nickname.substring(0, 20),
            icNo: icNo ?? "",
            mobileNo: "",
            smsTac: "",
            twoFAType: "TAC",
            mobileSDKData,
        };
    }

    function handleNicknameConfirmation() {
        const params = generateTransactionParams();

        if (nickname && nickname.length > 0) {
            //VALIDATION
            if (!validateAlphaNumaric(nickname)) {
                showErrorToast(
                    errorToastProp({
                        message: NAME_MUST_ALPHANUMERICAL,
                    })
                );
                return;
            }

            addFavouriteTabungHajiAccount(params)
                .then((response) => {
                    const responseObject = response.data;
                    if (
                        responseObject?.code === 200 &&
                        responseObject?.result?.statusCode === "0000"
                    ) {
                        // go back and show success toast
                        navigation.navigate(TABUNG_HAJI_ACKNOWLEDGEMENT, {
                            tabunghajiTransferState: {
                                ...route?.params?.tabunghajiTransferState,
                                isAlreadyInFavouriteList: true,
                            },
                        });
                        showSuccessToast({
                            message: `${params?.thAcctNickName} successfully added to Favourites`,
                        });
                        // GA addFavSuccessful
                        if (bankName === TABUNG_HAJI) {
                            TabungHajiAnalytics.addFavSuccessful(TABUNGHAJI);
                        } else {
                            if (toAccount?.id === OWN_MBB) {
                                TabungHajiAnalytics.addFavSuccessful("Own");
                            } else if (toAccount?.id === OTHER_MBB) {
                                TabungHajiAnalytics.addFavSuccessful("Others");
                            }
                        }
                    } else {
                        // go back and show error toast
                        navigation.navigate(TABUNG_HAJI_ACKNOWLEDGEMENT, {
                            tabunghajiTransferState: {
                                ...route?.params?.tabunghajiTransferState,
                                isAlreadyInFavouriteList: true,
                            },
                        });
                        showErrorToast({
                            message:
                                responseObject?.result?.hostStatusDesc ??
                                responseObject?.result?.additionalStatusDescription,
                        });
                    }
                })
                .catch((error) => {
                    showErrorToast({
                        message: error?.error?.message || COMMON_ERROR_MSG,
                    });
                });
        } else {
            showErrorToast({
                message: PLEASE_ENTER_NAME,
            });
        }
    }

    const iosInputStyle =
        nickname && nickname.length >= 1
            ? styles.commonInputConfirmIosText
            : styles.commonInputConfirmIos;
    const inputStyle =
        nickname && nickname.length >= 1
            ? styles.commonInputConfirmText
            : styles.commonInputConfirm;

    return (
        <React.Fragment>
            <ScreenContainer backgroundType="color">
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerCenterElement={
                                <Typography
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={19}
                                    text={ADD_AS_FAVOURITES}
                                />
                            }
                            headerLeftElement={
                                <HeaderBackButton onPress={handleHeaderBackButtonPressed} />
                            }
                        />
                    }
                    useSafeArea
                    paddingHorizontal={0}
                    paddingBottom={0}
                >
                    <React.Fragment>
                        <ScrollView
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.content}
                        >
                            <View style={Styles.container}>
                                <View style={Styles.headerContainer}>
                                    <View style={Styles.headerImageContainer}>
                                        <View style={styles.logoContainer}>
                                            <Image
                                                style={styles.logo}
                                                source={
                                                    bankName === TABUNG_HAJI
                                                        ? Assets.tabunghajiTextLogo
                                                        : Assets.Maybank
                                                }
                                            />
                                        </View>
                                    </View>

                                    <TextInput
                                        placeholderTextColor={GREY}
                                        textAlign="left"
                                        autoCorrect={false}
                                        autoFocus={false}
                                        allowFontScaling={false}
                                        style={Platform.OS === "ios" ? iosInputStyle : inputStyle}
                                        maxLength={20}
                                        placeholder={SETTINGS_ENTER_NAME}
                                        value={nickname.substring(0, 20)}
                                        onChangeText={handleNicknameUpdate}
                                        clearButtonMode="while-editing"
                                        returnKeyType="done"
                                    />

                                    <View style={Styles.formBodyContainer}>{renderDetails()}</View>
                                </View>
                            </View>
                        </ScrollView>
                        <FixedActionContainer>
                            <ActionButton
                                onPress={handleNicknameConfirmation}
                                fullWidth
                                componentCenter={
                                    <Typography
                                        text={ADD_TO_FAVOURITES}
                                        fontSize={14}
                                        lineHeight={18}
                                        fontWeight="600"
                                    />
                                }
                            />
                        </FixedActionContainer>
                    </React.Fragment>
                </ScreenLayout>
            </ScreenContainer>
        </React.Fragment>
    );
}

TabungHajiAddToFavourites.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
};

const styles = StyleSheet.create({
    commonInputConfirm: {
        color: BLACK,
        fontFamily: "Montserrat-SemiBold",
        fontSize: 23,
        fontWeight: "600",
        marginTop: -13,
        minWidth: 70,
    },
    commonInputConfirmIos: {
        color: BLACK,
        fontFamily: "Montserrat",
        fontSize: 23,
        fontWeight: "600",
        marginTop: 0,
        minWidth: 70,
    },
    commonInputConfirmIosText: {
        color: ROYAL_BLUE,
        fontFamily: "Montserrat",
        fontSize: 23,
        fontStyle: "normal",
        fontWeight: "600",
        marginTop: 0,
        minWidth: 70,
    },
    commonInputConfirmText: {
        color: ROYAL_BLUE,
        fontFamily: "Montserrat-SemiBold",
        fontSize: 23,
        fontStyle: "normal",
        fontWeight: "600",
        marginTop: -13,
        minWidth: 70,
    },
    content: {
        justifyContent: "flex-start",
        paddingTop: 30,
    },
    logo: {
        borderRadius: 40,
        height: 65,
        width: 65,
    },
    logoContainer: {
        alignItems: "center",
        backgroundColor: WHITE,
        borderRadius: 40,
        height: 70,
        justifyContent: "center",
        padding: 2,
        width: 70,
        ...getShadow({}),
    },
});

export default TabungHajiAddToFavourites;
