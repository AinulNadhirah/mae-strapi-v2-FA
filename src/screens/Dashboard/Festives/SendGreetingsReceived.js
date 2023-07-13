// @ts-check
import numeral from "numeral";
import PropTypes from "prop-types";
import React, { useEffect, FunctionComponent as FC, useState } from "react";
import { View, StyleSheet, Image, ImageBackground } from "react-native";
import * as Animatable from "react-native-animatable";

import {
    SEND_REQUEST_MONEY_AMOUNT,
    SEND_REQUEST_MONEY_STACK,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import CacheeImageWithDefault from "@components/CacheeImageWithDefault";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FullBgLoading from "@components/FullBgLoading";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typography from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { withModelContext } from "@context";

import { acctDetails, contactsSync, getNotificationById, invokeL3 } from "@services";

import { WHITE, MEDIUM_GREY, YELLOW, SHADOW_LIGHT } from "@constants/colors";
import {
    AMOUNT_ERROR,
    ENTER_AMOUNT,
    SEND_MESSAGE_DEEPAMONEY,
    THIRD_PARTY_TRANSFER,
    TRANSFER,
} from "@constants/strings";

import { isMalaysianMobileNum } from "@utils/dataModel";
import { convertMayaMobileFormat, formateAccountNumber } from "@utils/dataModel/utility";
import useFestive from "@utils/useFestive";

function SendGreetingsReceived({ navigation, route, getModel, updateModel }): FC {
    const { festiveAssets } = useFestive();
    const payload =
        typeof route?.params?.data === "string"
            ? JSON.parse(route?.params?.data)
            : route?.params?.data;
    const [isGreeting, setGreeting] = useState(payload?.template ?? false);
    const [isSendMoney, setIsSendMoney] = useState(payload?.amount ?? false);
    const [designId, setDesign] = useState(payload?.template ?? null);
    const [amount, setAmount] = useState(payload?.amount ?? null);
    const [message, setMessage] = useState(payload?.message ?? null);
    const [senderName, setSenderName] = useState(payload?.senderName ?? null);
    const [senderContactNo, setSenderContactNo] = useState(payload?.senderContactNo ?? null);
    const selectedGreetingsList = festiveAssets?.greetingSend.designTemplates;
    const [selectedTemplate, setTemplate] = useState(null);

    const [bgLoading, setBg] = useState(true);
    const [loading, setLoading] = useState(false);

    console.tron.log("notification params", route?.params);

    function handleImgLoad() {
        setBg(false);
    }

    function handleBack() {
        navigation.canGoBack() && navigation.goBack();
    }

    async function onDone() {
        handleBack();
    }

    function getTransformedMobileNo(mobileNo) {
        console.info("getTransformedMobileNo: ", mobileNo);
        if (mobileNo) {
            const cleaned = mobileNo.replace(/[^0-9]/gi, "");
            const transformNo = isMalaysianMobileNum(cleaned)
                ? convertMayaMobileFormat(cleaned)
                : cleaned;
            console.info("getTransformedMobileNo: ", transformNo);
            if (transformNo.indexOf("+") === -1) return `+${transformNo}`;
            return transformNo;
        }

        console.info("getTransformedMobileNo instead: ", mobileNo);
        return mobileNo;
    }

    async function syncContact(mobileNumber) {
        try {
            const sync = await contactsSync([convertMayaMobileFormat(mobileNumber)]);

            if (sync && sync.data?.length) {
                return sync.data[0];
            }
        } catch (error) {
            console.tron.log(error);
        }
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

    async function proceedSendMoney() {
        const {
            misc: { specialOccasionData },
            user: { mobileNumber },
        } = getModel(["misc", "user"]);

        if (senderContactNo) {
            const phoneNumber = getTransformedMobileNo(senderContactNo);
            const contactObj = {
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
                if (account) {
                    const transferParams = {
                        transferFlow: 15,
                        functionsCode: 15,
                        accountName: account.fullName,
                        toAccount: "",
                        toAccountCode: "",
                        accounts: "",
                        fromAccount: null,
                        fromAccountCode: "",
                        fromAccountName: account.fullName,
                        formattedToAccount,
                        image: account.profilePic,
                        profilePicUrl: account.profilePic,
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
                        routeFrom: "SendGreetingsReceived",
                        endDateInt: 0,
                        startDateInt: 0,
                        transactionResponseError: "",
                        phoneNumber,
                        name: account.fullName,
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
                            cta: "festiveSendMoney",
                            festiveObj: {
                                fromCta: true,
                                routeFrom: "SendGreetingsReceived",
                                backgroundImage: festiveAssets?.greetingSend.topContainer,
                                note: festiveData?.note,
                                statusScreenMsg: SEND_MESSAGE_DEEPAMONEY,
                            },
                            includeGreeting: true,
                            selectedContacts: [
                                {
                                    ...account,
                                    name: account.mayaUserName,
                                    phoneNumber,
                                },
                            ],
                        },
                    });
                }
            } catch (error) {
                // show error
            } finally {
                setLoading(false);
            }
        }
    }

    async function onSendMoney() {
        // will need to use the sender contact detail
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
                    proceedSendMoney();
                } else {
                    throw new Error();
                }
            } catch (error) {
                // shit happens
            }
        } else {
            proceedSendMoney();
        }
    }

    async function onSendBack() {
        const phoneNumber = getTransformedMobileNo(senderContactNo);
        // get the account details so we know the name

        try {
            const account = await syncContact(phoneNumber);

            if (account?.mayaUserName) {
                navigation.navigate("SendGreetingsDesign", {
                    routeFrom: "SendGreetingsReceived",
                    selectedContacts: [
                        {
                            ...account,
                            name: account.mayaUserName,
                            phoneNumber,
                        },
                    ],
                });
            }
        } catch (error) {
            showErrorToast({
                message: "Unable to retrieve the contact details",
            });
        }
    }

    function mapToState(payload) {
        if (payload) {
            setGreeting(!!payload?.template);
            setIsSendMoney(!!payload?.amount);
            setDesign(payload?.template);
            setMessage(payload?.message);
            setAmount(payload?.amount);
            setSenderName(payload?.senderName);
            setSenderContactNo(payload?.senderContactNo);
        }
    }

    async function getNotification(id, isV1 = false) {
        if (id) {
            setLoading(true);
            try {
                const response = await getNotificationById(id, isV1);

                if (response?.data?.result?.id) {
                    const { payload } = response?.data?.result;
                    const parsedPayload = payload ? JSON.parse(payload) : null;

                    // populate the data
                    if (parsedPayload) {
                        mapToState(parsedPayload);
                    }
                }
            } catch (error) {
                console.tron.log(error);
            } finally {
                setLoading(false);
            }
        }
    }

    function parseDuitRaya() {
        const payload = JSON.parse(route?.params?.data?.bts) ?? null;

        if (payload) mapToState(payload);
    }

    useEffect(() => {
        if (selectedGreetingsList) {
            setTemplate(selectedGreetingsList?.find((greet) => greet.id === designId));
        }
    }, [designId, selectedGreetingsList]);

    useEffect(() => {
        // if data doesn't have payload, we need to get the notification first
        if (typeof route?.params?.data !== "string") {
            // its not duit raya
            if (route?.params?.data?.subModule !== "SEND_RCV_PAST_TXN") {
                // get the notification ID
                const notifId = route?.params?.data?.refId
                    ? route?.params?.data?.refId
                    : route?.params?.refId;
                getNotification(notifId, true);
            } else {
                // for duit raya
                parseDuitRaya();
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <ScreenContainer
            backgroundType="color"
            backgroundColor={MEDIUM_GREY}
            showLoaderModal={loading}
        >
            <>
                <View style={styles.bgImageContainer}>
                    <CacheeImageWithDefault
                        image={festiveAssets?.greetingReceived.background}
                        style={styles.bgImage}
                        onLoad={handleImgLoad}
                        resizeMode="stretch"
                    />
                </View>

                {bgLoading ? (
                    <FullBgLoading />
                ) : (
                    <ScreenLayout
                        header={
                            <HeaderLayout
                                headerRightElement={
                                    <HeaderCloseButton
                                        onPress={handleBack}
                                        isWhite={!festiveAssets?.isWhiteColorOnFestive}
                                    />
                                }
                            />
                        }
                        useSafeArea
                    >
                        <>
                            <View style={styles.wrapper}>
                                {isGreeting && isSendMoney && (
                                    <Animatable.View
                                        animation="fadeInUp"
                                        delay={200}
                                        style={styles.copyContainer}
                                        useNativeDriver
                                    >
                                        <Typography
                                            fontSize={14}
                                            fontWeight="normal"
                                            lineHeight={18}
                                            text="You’ve received"
                                            color={WHITE}
                                        />
                                        <View style={styles.metaSecondary}>
                                            <Typography
                                                fontSize={26}
                                                fontWeight="600"
                                                lineHeight={32}
                                                text={`RM ${amount}`}
                                                color={WHITE}
                                            />
                                        </View>
                                        <Typography
                                            fontSize={14}
                                            fontWeight="normal"
                                            lineHeight={18}
                                            text={`${festiveAssets?.greetingSend.moneyReceivedText} from ${senderName}`}
                                            color={WHITE}
                                        />
                                    </Animatable.View>
                                )}
                                {isGreeting && !isSendMoney && (
                                    <Animatable.View
                                        animation="fadeInUp"
                                        delay={200}
                                        style={styles.copyContainer}
                                        useNativeDriver
                                    >
                                        <Typography
                                            fontSize={20}
                                            fontWeight="700"
                                            lineHeight={20}
                                            text={`${festiveAssets?.greetingReceived.festiveSendGreetingFromReceived} ${senderName}`}
                                            // festiveAssets?.greetingReceived.moneyContainer
                                            color={WHITE}
                                        />
                                    </Animatable.View>
                                )}
                                {isSendMoney && !isGreeting && (
                                    <View>
                                        <Animatable.View
                                            animation="fadeInUp"
                                            delay={200}
                                            useNativeDriver
                                        >
                                            <Typography
                                                fontSize={18}
                                                fontWeight="400"
                                                lineHeight={22}
                                                text="You’ve received"
                                                color={WHITE}
                                            />
                                        </Animatable.View>
                                        <SpaceFiller height={24} />
                                        <Animatable.View
                                            animation="fadeInUp"
                                            delay={400}
                                            useNativeDriver
                                            style={styles.bannerContainer}
                                        >
                                            <CacheeImageWithDefault
                                                image={
                                                    festiveAssets?.greetingReceived.moneyContainer
                                                }
                                                resizeMode="contain"
                                                style={styles.amountContainer}
                                            />
                                            <Typography
                                                fontSize={24}
                                                fontWeight="bold"
                                                lineHeight={26}
                                                text={`RM ${numeral(amount).format("0,0.00")}`}
                                                textAlign="center"
                                                color={WHITE}
                                            />
                                        </Animatable.View>
                                        <Animatable.View
                                            animation="fadeInUp"
                                            delay={600}
                                            useNativeDriver
                                            style={styles.senderMoneyContainer}
                                        >
                                            <Typography
                                                fontSize={18}
                                                fontWeight="400"
                                                lineHeight={22}
                                                text={`${festiveAssets?.greetingReceived.festiveSendMoneyFromReceived} ${senderName}`}
                                                color={WHITE}
                                            />
                                        </Animatable.View>
                                    </View>
                                )}
                                {isGreeting && (
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
                                                        image={selectedTemplate?.card}
                                                        style={styles.cardImg}
                                                    />
                                                </View>

                                                <View style={styles.greetingsContainer}>
                                                    <Typography
                                                        fontSize={14}
                                                        fontWeight="600"
                                                        text={message}
                                                        color={WHITE}
                                                        lineHeight={18}
                                                    />
                                                </View>
                                            </View>
                                        </Animatable.View>
                                    </View>
                                )}
                            </View>
                            <View>
                                <View style={styles.secondaryActionContainer}>
                                    <ActionButton
                                        backgroundColor={WHITE}
                                        fullWidth
                                        onPress={isGreeting ? onSendMoney : onDone}
                                        componentCenter={
                                            <Typography
                                                fontSize={14}
                                                fontWeight="600"
                                                lineHeight={18}
                                                text={
                                                    isGreeting
                                                        ? `${festiveAssets?.sendMoney.festiveTitle}`
                                                        : "Done"
                                                }
                                            />
                                        }
                                    />
                                </View>
                                <ActionButton
                                    backgroundColor={YELLOW}
                                    fullWidth
                                    onPress={!isGreeting && isSendMoney ? onSendMoney : onSendBack}
                                    componentCenter={
                                        <Typography
                                            fontSize={14}
                                            fontWeight="600"
                                            lineHeight={18}
                                            text={
                                                !isGreeting && isSendMoney
                                                    ? festiveAssets?.sendMoney.festiveTitle
                                                    : isGreeting
                                                    ? festiveAssets?.greetingSend.sendGreetingTitle
                                                    : ""
                                            }
                                        />
                                    }
                                />
                            </View>
                        </>
                    </ScreenLayout>
                )}
            </>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    amountContainer: {
        alignItems: "center",
        height: 80,
        justifyContent: "center",
        position: "absolute",
        width: "100%",
    },
    bannerContainer: {
        alignItems: "center",
        height: 80,
        justifyContent: "center",
        paddingVertical: 12,
        position: "relative",
        width: 310,
    },
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
        height: 200,
        padding: 2,
        shadowColor: SHADOW_LIGHT,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 1,
        shadowRadius: 16,
        width: 324,
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
    copyContainer: {
        paddingBottom: 24,
    },
    greetingsContainer: {
        width: 155,
    },
    metaSecondary: {
        paddingVertical: 8,
    },
    optionsContainer: {
        alignItems: "center",
        justifyContent: "center",
    },
    secondaryActionContainer: {
        paddingVertical: 16,
    },
    senderMoneyContainer: {
        paddingTop: 30,
        paddingVertical: 8,
    },
    wrapper: {
        flex: 1,
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
    },
});

SendGreetingsReceived.propTypes = {
    getModel: PropTypes.func,
    updateModel: PropTypes.func,
    navigation: PropTypes.object,
    route: PropTypes.object,
};

export default withModelContext(SendGreetingsReceived);
