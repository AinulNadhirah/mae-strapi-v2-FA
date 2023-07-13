// @ts-check
import moment from "moment";
import PropTypes from "prop-types";
import React, { useEffect, FunctionComponent as FC, useState } from "react";
import { View, StyleSheet, Image, Dimensions } from "react-native";
import * as Animatable from "react-native-animatable";

import {
    FUNDTRANSFER_MODULE,
    SEND_REQUEST_MONEY_AMOUNT,
    SEND_REQUEST_MONEY_STACK,
    TRANSFER_CONFIRMATION_SCREEN,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import CacheeImageWithDefault from "@components/CacheeImageWithDefault";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FullBgLoading from "@components/FullBgLoading";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typography from "@components/Text";

import { withModelContext } from "@context";

import { acctDetails, invokeL3, sendGreeting } from "@services";

import { WHITE, MEDIUM_GREY, SHADOW_LIGHT, YELLOW, TRANSPARENT } from "@constants/colors";
import { AMOUNT_ERROR, ENTER_AMOUNT, THIRD_PARTY_TRANSFER, TRANSFER } from "@constants/strings";
import { ENDPOINT_BASE } from "@constants/url";

import { isMalaysianMobileNum } from "@utils/dataModel";
import { convertMayaMobileFormat, formateAccountNumber } from "@utils/dataModel/utility";
import useFestive from "@utils/useFestive";

const { width } = Dimensions.get("window");

function SendGreetingsReview({ navigation, route, getModel, updateModel }): FC {
    const { isTapTasticReady, tapTasticType } = getModel("misc");
    const selectedContacts = route?.params?.selectedContacts ?? "";
    const selectedDesign = route?.params?.selectedDesign ?? null;
    const message = route?.params?.message ?? "";
    const [bgLoading, setBg] = useState(true);
    const [loading, setLoading] = useState(false);
    const [sendGreetingLoading, setsendGreetingLoading] = useState(false);

    const { festiveAssets } = useFestive();
    
    console.info("[SendGreetingsReview] >> ", route?.params);
    function handleImgLoad() {
        setBg(false);
    }

    function handleBack() {
        navigation.canGoBack() && navigation.goBack();
    }

    async function onContinue() {
        const params = {
            message,
            template: selectedDesign?.id,
            receiverUserIds: selectedContacts.map((contact) => contact.mayaUserId),
        };

        setsendGreetingLoading(true);

        // submit to backend
        try {
            const sendGreetings = await sendGreeting(params);

            if (sendGreetings) {
                // proceed to status screen
                navigation.navigate("SendGreetingsStatus", {
                    success: true,
                    message: "sent successfully",
                    datetime: moment().format("DD MMM YYYY, h:mm a"),
                    greeting: message,
                    selectedDesign,
                    selectedContacts,
                    isTapTasticReady,
                    tapTasticType,
                });
            }
        } catch (error) {
            // proceed to status screen
            navigation.navigate("SendGreetingsStatus", {
                success: false,
                message: "delivery unsuccessful",
                errorMessage: error?.message || "",
                datetime: moment().format("DD MMM YYYY, h:mm a"),
                greeting: message,
                selectedDesign,
                selectedContacts,
            });
        } finally {
            setsendGreetingLoading(false);
        }
    }

    function getTransformedMobileNo(mobileNo) {
        const cleaned = mobileNo.replace(/[^0-9]/gi, "");
        let transformNo = isMalaysianMobileNum(cleaned)
            ? convertMayaMobileFormat(cleaned)
            : cleaned;

        if (transformNo.indexOf("+") === -1) return `+${transformNo}`;

        return transformNo;
    }

    async function getAccountDetails(mobileNumber) {
        try {
            const account = await acctDetails(`/sendRcvMoney/acctDetails?mobileNo=${mobileNumber}`);

            if (!account) {
                throw new Error();
            }

            const { result } = account.data;
            const { primaryAcct, primaryAcctName, userName, fullName, profilePic } = result;
            const formattedAccountNumber = formateAccountNumber(primaryAcct, 12);

            return {
                formattedAccountNumber,
                toAccountCode: "",
                toAccount: primaryAcct,
                primaryAcctName,
                actualAccHolderName: primaryAcctName,
                recipientName: primaryAcctName,
                accountName: primaryAcctName,
                userName,
                fullName,
                reference: "Send Money",
                image: profilePic,
                profilePic,
                functionsCode: 15,
            };
        } catch (error) {
            return error;
        }
    }

    function getRouteFrom() {
        return route?.params?.routeFrom === "SendGreetingsReceived"
            ? "SendGreetingsReview"
            : "SendGreetingsReviewNew";
    }

    async function proceedSendMoney(includeGreeting) {
        const {
            misc: { specialOccasionData },
            user: { mobileNumber },
        } = getModel(["misc", "user"]);
        const contact = selectedContacts[0];
        const phoneNumber = getTransformedMobileNo(contact.phoneNumber);
        const contactObj = {
            ...contact,
            phoneNumber,
        };
        const userMayaFormatNum = convertMayaMobileFormat(mobileNumber);
        const festiveData = specialOccasionData.find((item) => {
            return item.module === "SEND_RCV";
        });
        const formattedToAccount = ""
            .substring(0, 12)
            .replace(/[^\dA-Z]/g, "")
            .replace(/(.{4})/g, "$1 ")
            .trim();

        try {
            const account = await getAccountDetails(phoneNumber);

            if (account && !route?.params?.eDuitData) {
                const transferParams = {
                    transferFlow: 15,
                    functionsCode: 15,
                    accountName: contact.name,
                    toAccount: "",
                    toAccountCode: "",
                    accounts: "",
                    fromAccount: null,
                    fromAccountCode: "",
                    fromAccountName: contact.name,
                    formattedToAccount: formattedToAccount,
                    image: contact.profilePicUrl,
                    profilePicUrl: contact.profilePicUrl,
                    imageBase64: false,
                    bankName: "Maybank",
                    amount: "0.00",
                    formattedAmount: "0.00",
                    reference: "",
                    minAmount: 0.0,
                    maxAmount: 999999.99,
                    amountError: AMOUNT_ERROR,
                    screenLabel: ENTER_AMOUNT,
                    screenTitle: TRANSFER,
                    receiptTitle: THIRD_PARTY_TRANSFER,
                    recipientName: "",
                    transactionDate: "",
                    transactionStartDate: "",
                    transactionEndDate: "",
                    isFutureTransfer: false,
                    isRecurringTransfer: false,
                    toAccountBank: "Maybank",
                    formattedFromAccount: "",
                    transferType: null,
                    transferSubType: null,
                    twoFAType: null,
                    mbbbankCode: null,
                    swiftCode: null,
                    routeFrom:
                        route?.params?.routeFrom === "SortToWin" ? "SortToWin" : getRouteFrom(),
                    endDateInt: 0,
                    startDateInt: 0,
                    transactionResponseError: "",
                    phoneNumber,
                    name: contact.name,
                    contactObj,
                    payRequest: false,
                    sendMoneyId: 0,
                    note: festiveData?.note,
                    recipientNotes: festiveData?.note,
                    userMobileNumber: userMayaFormatNum,
                    ...account,
                };

                navigation.navigate(SEND_REQUEST_MONEY_STACK, {
                    screen: SEND_REQUEST_MONEY_AMOUNT,
                    params: {
                        transferParams,
                        festiveFlag: true,
                        fromCta: route?.params?.routeFrom !== "SendGreetingsReceived",
                        festiveObj: {
                            routeFrom: "festiveScreen",
                            backgroundImage: festiveAssets?.greetingSend.topContainer,
                            greetingMessage: message,
                            templateId: selectedDesign?.id,
                            note: festiveData?.note,
                            statusScreenMsg: includeGreeting
                                ? festiveAssets?.greetingSend.successMessageTransfer
                                : "e-Greeting sent successfully",
                        },
                        festiveAssets,
                        routeFrom: route?.params?.routeFrom,
                    },
                });
            } else {
                navigation.navigate(FUNDTRANSFER_MODULE, {
                    screen: TRANSFER_CONFIRMATION_SCREEN,
                    params: {
                        ...route?.params?.eDuitData,
                        statusScreenMsg: "e-Duit Raya sent successfully",
                        recipientNotes: festiveData?.note,
                        userMobileNumber: userMayaFormatNum,
                        greetingMessage: message,
                        templateId: selectedDesign?.id,
                        festiveFlag: true,
                        note: festiveData?.note,
                        ...account,
                        festiveObj: {
                            routeFrom: "festiveScreen",
                            backgroundImage: festiveAssets?.greetingSend.topContainer,
                            greetingMessage: message,
                            templateId: selectedDesign?.id,
                            note: festiveData?.note,
                            statusScreenMsg: includeGreeting
                                ? festiveAssets?.greetingSend.successMessageTransfer
                                : "e-Greeting sent successfully",
                        },
                    },
                });
            }
        } catch (error) {
            // show error
        } finally {
            setLoading(false);
        }
    }

    async function onSendMoney(includeGreeting) {
        // only take the first contact (there will only be one anyway for this to work)
        const { isPostPassword } = getModel("auth");

        setLoading(true);

        if (!isPostPassword) {
            updateModel({
                misc: {
                    isFestiveFlow: true,
                },
            });

            try {
                const auth = await invokeL3();

                if (auth) {
                    proceedSendMoney(includeGreeting);
                } else {
                    throw new Error();
                }
            } catch (error) {
                // shit happens
            } finally {
                setLoading(false);
            }
        } else {
            proceedSendMoney(includeGreeting);
        }
    }

    function getContactName({ mayaUserName, name, phoneNumber, userName, fullName }) {
        return mayaUserName || name || userName || fullName || phoneNumber;
    }

    function getContactList() {
        if (selectedContacts.length > 3) {
            return `${getContactName(selectedContacts[0])}, ${getContactName(
                selectedContacts[1]
            )}, ${getContactName(selectedContacts[2])} and ${selectedContacts.length - 3} others`;
        }

        return selectedContacts.reduce(
            (pv, contact) => `${!pv.length ? pv : pv + ", "}${getContactName(contact)}`,
            ""
        );
    }

    useEffect(() => {}, [navigation]);

    return (
        <ScreenContainer
            backgroundType="color"
            backgroundColor={MEDIUM_GREY}
            showLoaderModal={loading}
        >
            <>
                <View style={styles.bgImageContainer}>
                    <CacheeImageWithDefault
                        image={
                            isTapTasticReady
                                ? festiveAssets?.greetingSend.backgroundGreetings
                                : {
                                      uri: `${ENDPOINT_BASE}/cms/document-view/festival-02.jpg`,
                                  }
                        }
                        style={styles.bgImage}
                        resizeMode="stretch"
                        onLoad={handleImgLoad}
                    />
                </View>

                {bgLoading ? (
                    <FullBgLoading />
                ) : (
                    <ScreenLayout
                        header={
                            <HeaderLayout
                                headerLeftElement={
                                    <HeaderBackButton isWhite onPress={handleBack} />
                                }
                            />
                        }
                        paddingBottom={0}
                        useSafeArea
                    >
                        <>
                            <View style={styles.wrapper}>
                                <Animatable.View
                                    animation="fadeInUp"
                                    delay={200}
                                    style={styles.copyContainer}
                                    useNativeDriver
                                >
                                    <Typography
                                        fontSize={22}
                                        fontWeight="600"
                                        lineHeight={28}
                                        // text="Take a final look"
                                        text={festiveAssets?.greetingSend.sendGreetingFinalTitle}
                                        color={WHITE}
                                    />
                                </Animatable.View>
                                <View style={styles.optionsContainer}>
                                    <Animatable.View
                                        animation="fadeInUp"
                                        delay={400}
                                        style={styles.cardContainer}
                                        useNativeDriver
                                    >
                                        <View style={styles.cardInnerContainer}>
                                            <View
                                                style={{
                                                    ...StyleSheet.absoluteFill,
                                                }}
                                            >
                                                <CacheeImageWithDefault
                                                    image={selectedDesign?.card}
                                                    style={styles.cardImg}
                                                />
                                            </View>

                                            <View style={styles.greetingsContainer}>
                                                <Typography
                                                    fontSize={14}
                                                    color={WHITE}
                                                    fontWeight="600"
                                                    text={message}
                                                    lineHeight={18}
                                                />
                                            </View>
                                        </View>
                                    </Animatable.View>
                                    <View style={styles.meta}>
                                        <Animatable.View
                                            animation="fadeInUp"
                                            delay={600}
                                            style={styles.label}
                                            useNativeDriver
                                        >
                                            {festiveAssets?.greetingSend.sendGreetingText && (
                                                <Typography
                                                    fontSize={14}
                                                    fontWeight="normal"
                                                    lineHeight={18}
                                                    // text={`Send\ne-Greeting to`}
                                                    text={
                                                        festiveAssets?.greetingSend.sendGreetingText
                                                    }
                                                    // sendGreetingText
                                                    textAlign="left"
                                                    color={WHITE}
                                                />
                                            )}
                                        </Animatable.View>
                                        <Animatable.View
                                            animation="fadeInUp"
                                            delay={800}
                                            style={styles.contacts}
                                            useNativeDriver
                                        >
                                            <Typography
                                                fontSize={14}
                                                fontWeight="600"
                                                lineHeight={18}
                                                text={getContactList()}
                                                textAlign="right"
                                                color={WHITE}
                                            />
                                        </Animatable.View>
                                    </View>
                                </View>
                            </View>
                            {route?.params?.includeGreeting && selectedContacts.length === 1 ? (
                                <View style={styles.secondaryActionContainer}>
                                    <ActionButton
                                        backgroundColor={YELLOW}
                                        fullWidth
                                        onPress={() => {
                                            onSendMoney(route?.params?.includeGreeting);
                                        }}
                                        disabled={sendGreetingLoading}
                                        isLoading={sendGreetingLoading}
                                        componentCenter={
                                            <Typography
                                                fontSize={14}
                                                fontWeight="600"
                                                lineHeight={18}
                                                text="Continue"
                                            />
                                        }
                                    />
                                    <SpaceFiller height={24} />
                                </View>
                            ) : (
                                <View style={styles.secondaryActionContainer}>
                                    <ActionButton
                                        backgroundColor={YELLOW}
                                        fullWidth
                                        onPress={onContinue}
                                        disabled={sendGreetingLoading}
                                        isLoading={sendGreetingLoading}
                                        componentCenter={
                                            <Typography
                                                fontSize={14}
                                                fontWeight="600"
                                                lineHeight={18}
                                                text="Send Now"
                                            />
                                        }
                                    />
                                    {selectedContacts.length === 1 ? (
                                        <ActionButton
                                            backgroundColor={TRANSPARENT}
                                            fullWidth
                                            disabled={sendGreetingLoading}
                                            onPress={onSendMoney}
                                            componentCenter={
                                                <Typography
                                                    fontSize={14}
                                                    fontWeight="600"
                                                    lineHeight={18}
                                                    text={
                                                        festiveAssets?.greetingSend.includeMoneyText
                                                    }
                                                    color={WHITE}
                                                />
                                            }
                                        />
                                    ) : (
                                        <SpaceFiller height={24} />
                                    )}
                                </View>
                            )}
                        </>
                    </ScreenLayout>
                )}
            </>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    bgImage: {
        height: "100%",
        width: "100%",
    },
    bgImageContainer: {
        ...StyleSheet.absoluteFill,
    },
    cardContainer: {
        backgroundColor: WHITE,
        borderRadius: 8,
        height: width / 2,
        padding: 2,
        shadowColor: SHADOW_LIGHT,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 1,
        shadowRadius: 16,
        width: width / 1.2,
    },
    cardImg: {
        borderRadius: 8,
        height: "100%",
        width: "100%",
    },
    cardInnerContainer: {
        alignItems: "center",
        height: "100%",
        justifyContent: "center",
        overflow: "hidden",
        position: "relative",
        width: "100%",
    },
    contacts: { flex: 0.6 },
    copyContainer: {
        paddingBottom: 24,
    },
    greetingsContainer: {
        width: 185,
    },
    label: { flex: 0.4 },
    meta: {
        alignItems: "flex-start",
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 12,
        paddingVertical: 20,
        width: width / 1.2,
    },
    optionsContainer: {
        alignItems: "center",
        justifyContent: "center",
    },
    secondaryActionContainer: {
        paddingVertical: 12,
    },
    wrapper: {
        flex: 1,
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
    },
});

SendGreetingsReview.propTypes = {
    getModel: PropTypes.func,
    updateModel: PropTypes.func,
    navigation: PropTypes.object,
    route: PropTypes.object,
};

export default withModelContext(SendGreetingsReview);
