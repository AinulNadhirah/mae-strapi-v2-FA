import PropTypes from "prop-types";
import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, Image, ScrollView, Dimensions, TouchableOpacity } from "react-native";
import Config from "react-native-config";
import DeviceInfo from "react-native-device-info";
import PassKit, { AddPassButton } from "react-native-passkit-wallet";
import { assets } from "react-native.config";

import {
    fetchCards,
    onApplePayBtnPress,
    rsaChallengeQuestion,
} from "@screens/ApplePay/ApplePayController";

import {
    APPLE_PAY_ACK,
    APPLE_PAY_FAIL_SCREEN,
    BANKINGV2_MODULE,
    COMMON_MODULE,
    DASHBOARD,
    ONE_TAP_AUTH_MODULE,
    RSA_DENY_SCREEN,
    TAB_NAVIGATOR,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ProductCardLoader from "@components/Cards/ProductCardLoader";
import RadioChecked from "@components/Common/RadioChecked";
import RadioUnchecked from "@components/Common/RadioUnchecked";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import ChallengeQuestion from "@components/RSA/ChallengeQuestion";
import ShimmerPlaceHolder from "@components/ShimmerPlaceholder";
import Typo from "@components/Text";

import { useModelController } from "@context";

import { invokeL2 } from "@services";

import { MEDIUM_GREY, WHITE, SHADOW_LIGHT, YELLOW, BLACK } from "@constants/colors";
import {
    SELECT_APPLE_PAY_CARD,
    SUBHEADING_CARD_LIST,
    ELIGIBLE_CARD,
    CARD_ADDED_APPLEPAY,
    TRANSACTION_TYPE,
    NO_CARDS_AVAILABLE,
    NO_CARDS_CONTAINER_HEADING,
    FA_CARD_APPLE_PAY_SELECT_CARD,
} from "@constants/strings";
import { CARDIMAGEURL_PROD, SIT_UAT_CARDIMAGEURL } from "@constants/url";

import { maskCard, getDeviceRSAInformation } from "@utils/dataModel/utility";
import { filterProvisionedCards } from "@utils/dataModel/utilityApplePay";

import Assets from "@assets";
import { GABankingApplePay } from "@services/analytics/analyticsBanking";

const { width } = Dimensions.get("window");

const Card = ({ name, details, number, onPress, cardImageUrl }) => {
    let newCardImageUrl = cardImageUrl?.replace(/\\/gi, "/") || "";

    if (cardImageUrl?.includes("https")) {
        console.log(cardImageUrl);
    } else if (newCardImageUrl !== "") {
        if (Config.ENV_FLAG === "UAT" || Config.ENV_FLAG === "SIT")
            cardImageUrl = `${SIT_UAT_CARDIMAGEURL}${newCardImageUrl}`;
        else cardImageUrl = `${CARDIMAGEURL_PROD}${newCardImageUrl}`;
    } else {
        cardImageUrl = "";
    }

    function handlePress() {
        if (onPress) {
            if (number && name)
                onPress({
                    no: number,
                    name,
                    details,
                });
        }
    }

    return (
        <TouchableOpacity activeOpacity={0.8} onPress={handlePress} style={styles.cardButton}>
            <View style={styles.cardContainer}>
                <View style={styles.cardInner}>
                    <Image
                        source={{
                            uri: cardImageUrl,
                        }}
                        style={styles.cardBg}
                    />
                </View>
            </View>
        </TouchableOpacity>
    );
};

Card.propTypes = {
    number: PropTypes.string,
    name: PropTypes.string,
    details: PropTypes.object,
    onPress: PropTypes.func,
    cardImageUrl: PropTypes.string,
};

const CardItem = ({ account, onPress, selectedAccount }) => {
    function handlePress() {
        if (onPress) {
            if (account.number && account.name)
                onPress({
                    no: account.number,
                    name: account.name,
                    details: account,
                });
        }
    }

    return (
        <TouchableOpacity activeOpacity={0.8} style={styles.cardMapContainer} onPress={handlePress}>
            <View style={styles.cardMapSubCont}>
                <View style={styles.cardData}>
                    <Typo
                        fontSize={16}
                        fontWeight="600"
                        lineHeight={18}
                        style={styles.cardInfo}
                        text={account.name}
                        textAlign="left"
                    />
                    <Typo
                        fontSize={14}
                        fontWeight="400"
                        lineHeight={18}
                        style={styles.cardInfo}
                        text={account.formattedNumber}
                        textAlign="left"
                    />
                    <Card
                        type={account}
                        name={account.name}
                        details={account}
                        number={account.number}
                        isMaeDebit={account.maeDebit}
                        cardImageUrl={account.cardImageUrl}
                        onPress={onPress}
                    />
                </View>
            </View>
            <View style={styles.radioContainer}>
                {selectedAccount.no === account?.number ? (
                    <RadioChecked
                        style={styles.radioAlign}
                        paramLabelCls={styles.paramLabelCls}
                        checkType={YELLOW}
                    />
                ) : (
                    <RadioUnchecked paramLabelCls={styles.paramLabelCls} />
                )}
            </View>
        </TouchableOpacity>
    );
};

CardItem.propTypes = {
    onPress: PropTypes.func,
    account: PropTypes.object,
    selectedAccount: PropTypes.object,
};

function CardsList({ navigation, route }) {
    const [selectedAccount, setSelectedAccount] = useState({
        no: null,
        name: "",
        details: {},
    });
    const [cardsArray, setCardsArray] = useState([]);
    const [provisionedCardsArray, setProvisionedCardsArray] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showBtn, setShowBtn] = useState(false);
    const [showBtnType, setShowBtnType] = useState("none");
    const { getModel, updateModel } = useModelController();
    const { isPostLogin, token } = getModel("auth");
    const { customerName } = getModel("user");
    const [challengeData, setChallengeData] = useState({
        challengeRequest: {},
        isRSARequired: false,
        isRSALoader: false,
        challengeQuestion: "",
        RSACount: 0,
        RSAError: false,
    });

    useEffect(() => {
        init();
    }, []);

    async function init() {
        if (!isPostLogin) {
            const httpResp = await invokeL2(true).catch((error) => {
                console.log("[GatewayScreen][invokeL2] >> Exception: ", error);
            });
            const code = httpResp?.data?.code ?? null;
            if (code !== 0) {
                handleClose();
                return;
            }
        }

        const response = await fetchCards();
        console.log("fetchCards response ::: ", response.data.result.cards);
        if (response?.data?.code === 200) {
            const result = response?.data?.result || {};
            const cards = result?.cards;
            updateModel({
                applePay: {
                    customerName: result?.customerName,
                },
                user: {
                    customerName: result?.customerName,
                },
            });
            // mbbCardsList(cards);
            filterCardsData(cards.length > 0 ? cards : []);
            storeMBBCards(cards.length > 0 ? cards : []);
            // setShowBtn(true);
        } else {
            setIsLoading(false);
        }
    }

    async function filterCardsData(mbbCards) {
        try {
            const { provisionedCards, eligibleProvisionedCards } = await filterProvisionedCards(
                mbbCards
            );
            setProvisionedCardsArray(provisionedCards);
            setCardsArray(eligibleProvisionedCards);

            setSelectedAccount({
                no: eligibleProvisionedCards?.[0]?.number.substring(0, 16),
                name: eligibleProvisionedCards?.[0]?.name,
                details: eligibleProvisionedCards?.[0],
            });

            setShowBtnType(
                eligibleProvisionedCards?.length
                    ? eligibleProvisionedCards?.[0]?.notProvisionedIn || "both"
                    : "none"
            );

            setShowBtn(!!eligibleProvisionedCards?.length);
            setIsLoading(false);
        } catch (e) {
            setIsLoading(false);
        }
    }

    const handleClose = useCallback(() => {
        navigation.goBack();
    }, []);

    const handleSelectAccount = useCallback(({ no, name, details }) => {
        setSelectedAccount({
            no,
            name,
            details,
        });
        setShowBtnType(details?.notProvisionedIn || "both");
    }, []);

    function cardLoader() {
        return (
            <React.Fragment>
                <View style={styles.totalBalanceContainer}>
                    <ShimmerPlaceHolder style={styles.loaderBalance} />
                    <ShimmerPlaceHolder style={styles.loaderBalanceTitle} />
                </View>
                <View style={styles.productsListContainer}>
                    <ProductCardLoader />
                </View>
            </React.Fragment>
        );
    }

    function cardsList() {
        return (
            <View>
                <View style={styles.instruction}>
                    <Typo
                        fontSize={14}
                        fontWeight="600"
                        lineHeight={23}
                        text={SELECT_APPLE_PAY_CARD}
                        textAlign="left"
                    />
                    <Typo
                        fontSize={20}
                        fontWeight="300"
                        lineHeight={30}
                        style={styles.label}
                        text={SUBHEADING_CARD_LIST}
                        textAlign="left"
                    />
                </View>
                <View style={styles.accountList}>
                    {cardsArray.length ? (
                        <Typo style={styles.cardSection} text={ELIGIBLE_CARD} />
                    ) : (
                        <View style={styles.noCardContainer}>
                            <Image style={styles.nocardImageIcon} source={Assets.applePayNoImage} />
                            <Typo
                                fontSize={16}
                                fontWeight="600"
                                lineHeight={24}
                                style={styles.cardInfo}
                                text={NO_CARDS_AVAILABLE}
                            />
                            <Typo
                                fontSize={14}
                                fontWeight="400"
                                lineHeight={18}
                                text={NO_CARDS_CONTAINER_HEADING}
                            />
                        </View>
                    )}
                    {cardsArray.map((account, index) => (
                        <CardItem
                            key={`${account.number}-${index}`}
                            account={account}
                            onPress={handleSelectAccount}
                            selectedAccount={selectedAccount}
                        />
                    ))}

                    {provisionedCardsArray.length > 0 && (
                        <Typo style={styles.cardSection} text={CARD_ADDED_APPLEPAY} />
                    )}
                    {provisionedCardsArray.map((account, index) => (
                        <View key={index} style={styles.cardMapContainer}>
                            <View style={styles.applePayCardSubCont}>
                                <View style={styles.cardData}>
                                    <Typo
                                        fontSize={16}
                                        fontWeight="600"
                                        lineHeight={18}
                                        style={styles.cardInfo}
                                        text={account.name}
                                        textAlign="left"
                                    />
                                    <Typo
                                        fontSize={14}
                                        fontWeight="400"
                                        lineHeight={18}
                                        style={styles.cardInfo}
                                        text={account.formattedNumber}
                                        textAlign="left"
                                    />
                                    <Card
                                        key={`${account.number}-${index}`}
                                        name={account.name}
                                        details={account}
                                        number={account.number}
                                        isMaeDebit={account.maeDebit}
                                        cardImageUrl={account.cardImageUrl}
                                    />
                                </View>
                            </View>
                        </View>
                    ))}
                </View>
            </View>
        );
    }

    function onAPBtnPress() {
        GABankingApplePay.onCardListScreenAddToAppleWallet();
        console.log("CardsList ::: onAPBtnPress ::: ", selectedAccount.no);
        const isMaeDebit = selectedAccount?.details?.maeDebit || false;
        PassKit.addEventListener(
            "addPassesViewControllerDidFinish",
            onAddPassesViewControllerDidFinish
        );
        onApplePayBtnPress(
            token,
            selectedAccount.no,
            selectedAccount?.name,
            customerName,
            isMaeDebit,
            selectedAccount?.details?.fpanID
        );
    }

    useEffect(() => {
        PassKit.addEventListener(
            "addPassesViewControllerDidFinish",
            onAddPassesViewControllerDidFinish
        );
        // fetchAccountList();
    }, []);

    function onAddPassesViewControllerDidFinish() {
        console.log("onAddPassesViewControllerDidFinish");
        PassKit.getAddCardResult()
            .then((res) => {
                console.log("AP Final Result ::: ", res);
                // storeResult(res);
                if (res?.cardNo && res?.cardName) {
                    const details = [
                        {
                            title: TRANSACTION_TYPE,
                            value: "Apple Pay Activation",
                        },
                        {
                            title: "Card details",
                            value: `${res?.cardName} ${maskCard(res?.cardNo)}`, //TODO: place card name and mask number
                        },
                    ];
                    navigation.navigate(BANKINGV2_MODULE, {
                        screen: APPLE_PAY_FAIL_SCREEN,
                        params: {
                            details,
                            entryPoint: route?.params?.entryPoint || "DASHBOARD",
                        },
                    });
                } else if (res === "launch") {
                    console.log("Stay in this screen");
                } else {
                    //TODO: update cards context
                    navigation.navigate(BANKINGV2_MODULE, {
                        screen: APPLE_PAY_ACK,
                        params: {
                            entryPoint: route?.params?.entryPoint || "DASHBOARD",
                        },
                    });
                }
            })
            .catch((err) => console.log(" Pass Error ****", err));
    }

    // function storeResult(res) {
    //     updateModel({
    //         applePayData: {
    //             inAppProvisionResult: res,
    //         },
    //     });
    // }

    function storeMBBCards(cards) {
        console.log("store in context: ", cards);

        updateModel({
            applePay: {
                cards: cards,
            },
        });
    }

    async function checkRSA(challengeParams = {}) {
        console.log("check RSA CQ");
        if (selectedAccount) {
            const { deviceInformation, deviceId } = getModel("device");
            const mobileSDKData = getDeviceRSAInformation(deviceInformation, DeviceInfo, deviceId);
            const deviceDetails = {};
            deviceDetails.device_model = deviceInformation.DeviceModel;
            deviceDetails.os_version = deviceInformation.DeviceSystemVersion;
            const params = {
                mobileSDKData,
                deviceDetails,
                challengeMode: "",
                notifyStatus: "",
                cardNo: selectedAccount?.no,
                ...challengeParams,
            };
            console.log(params);
            const result = await rsaChallengeQuestion(params);
            console.log("checkRSA result ::: ", result);
            const code = result?.status;
            if (code === 428 || code === 423 || code === 422) {
                _handleRSA(code, {
                    rsaResponse: result?.rsaStatus
                        ? result
                        : result?.error ?? result?.errors?.error ?? result?.errors ?? result,
                });
            } else {
                //200
                onAPBtnPress();
            }
        }
    }

    function _handleRSA(status, result) {
        if (status === 428) {
            console.log("_handleRSA: ", result?.rsaResponse);
            setChallengeData({
                challengeRequest: {
                    ...challengeData?.challengeRequest,
                    challenge: result?.rsaResponse?.challenge,
                },
                challengeQuestion: result?.rsaResponse?.challenge?.questionText,
                isRSARequired: true,
                isRSALoader: false,
                RSACount: challengeData?.RSACount + 1,
                RSAError: challengeData.RSACount > 0,
            });
        } else if (status === 423) {
            setChallengeData({
                ...challengeData,
                isRSARequired: false,
            });
            const serverDate = result?.rsaResponse?.serverDate ?? "N/A";
            navigation.navigate(ONE_TAP_AUTH_MODULE, {
                screen: "Locked",
                params: {
                    reason: result?.rsaResponse?.statusDescription ?? "N/A",
                    loggedOutDateTime: serverDate,
                    lockedOutDateTime: serverDate,
                },
            });
        } else {
            setChallengeData({
                ...challengeData,
                isRSARequired: false,
            });
            navigation.navigate(COMMON_MODULE, {
                screen: RSA_DENY_SCREEN,
                params: {
                    statusDescription: result?.rsaResponse?.statusDescription ?? "N/A",
                    additionalStatusDescription: result?.rsaResponse?.statusDescription
                        ? ""
                        : result?.rsaResponse?.additionalStatusDescription ?? "",
                    serverDate: result?.rsaResponse?.serverDate ?? "N/A",
                    nextParams: {
                        screen: DASHBOARD,
                        params: { refresh: false },
                    },
                    nextModule: TAB_NAVIGATOR,
                    nextScreen: "Tab",
                },
            });
        }
    }

    async function onRsaDone(answer) {
        setChallengeData({ ...challengeData, isRSARequired: false });
        const params = {
            challenge: {
                ...challengeData?.challengeRequest?.challenge,
                answer,
            },
        };
        await checkRSA(params);
    }
    function onRsaClose() {
        setChallengeData({ ...challengeData, isRSARequired: false });
    }

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY} analyticTabName={FA_CARD_APPLE_PAY_SELECT_CARD}>
            <>
                <ScreenLayout
                    paddingBottom={0}
                    paddingTop={16}
                    paddingHorizontal={0}
                    header={
                        <HeaderLayout
                            headerRightElement={<HeaderCloseButton onPress={handleClose} />}
                        />
                    }
                    useSafeArea
                >
                    <>
                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            // contentContainerStyle={styles.container}
                        >
                            {isLoading ? cardLoader() : cardsList()}
                        </ScrollView>
                        <FixedActionContainer>
                            {showBtn && (
                                <View style={styles.bottomBtnContCls}>
                                    {showBtnType === "watch" && (
                                        <View style={styles.applePairedDevice}>
                                            <Image
                                                source={Assets.appleWatch}
                                                style={styles.appleWatchImage}
                                            />
                                            <Typo
                                                color={BLACK}
                                                fontSize={14}
                                                fontWeight="600"
                                                lineHeight={18}
                                                style={styles.deviceText}
                                                text="Apple Watch"
                                            />
                                            <AddPassButton
                                                style={styles.addPassWatchButton}
                                                addPassButtonStyle={
                                                    PassKit.AddPassButtonStyle.black
                                                }
                                                onPress={() => checkRSA({})}
                                            />
                                        </View>
                                    )}
                                    {showBtnType === "iphone" && (
                                        <View style={styles.applePairedDevice}>
                                            <Image
                                                source={Assets.appleDevice}
                                                style={styles.appleIphoneImage}
                                            />
                                            <Typo
                                                color={BLACK}
                                                fontSize={14}
                                                fontWeight="600"
                                                lineHeight={18}
                                                style={styles.deviceText}
                                                text="iPhone"
                                            />
                                            <AddPassButton
                                                style={styles.addPassDeviceButton}
                                                addPassButtonStyle={
                                                    PassKit.AddPassButtonStyle.black
                                                }
                                                onPress={() => checkRSA({})}
                                            />
                                        </View>
                                    )}
                                    {showBtnType === "both" && (
                                        <AddPassButton
                                            style={styles.addPassButton}
                                            addPassButtonStyle={PassKit.AddPassButtonStyle.black}
                                            onPress={() => checkRSA({})}
                                        />
                                    )}
                                </View>
                            )}
                        </FixedActionContainer>
                    </>
                </ScreenLayout>
            </>
            {/* Challenge Question */}
            {challengeData.isRSARequired && (
                <ChallengeQuestion
                    loader={challengeData.isRSALoader}
                    display={challengeData.isRSARequired}
                    displyError={challengeData.RSAError}
                    questionText={challengeData.challengeQuestion}
                    onSubmitPress={onRsaDone}
                    onSnackClosePress={onRsaClose}
                />
            )}
        </ScreenContainer>
    );
}

CardsList.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
    client: PropTypes.object,
};

const styles = StyleSheet.create({
    accountList: {
        display: "flex",
        flexDirection: "column",
        paddingHorizontal: 36,
    },
    addPassButton: {
        height: 48,
        width: "100%",
    },
    addPassDeviceButton: {
        height: 50,
        marginLeft: "15%",
        width: "51%",
    },
    addPassWatchButton: {
        height: 50,
        marginLeft: "7%",
        width: "51%",
    },
    applePayCardSubCont: {
        alignContent: "flex-end",
        flexDirection: "row",
        justifyContent: "space-between",
        opacity: 0.3,
    },
    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },
    cardBg: {
        borderRadius: 8,
        height: 96,
        width: 149,
    },
    cardButton: {
        width,
    },
    cardContainer: {
        elevation: 8,
        position: "relative",
        shadowColor: SHADOW_LIGHT,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 1,
        shadowRadius: 16,
        width: "100%",
    },
    cardData: {
        alignItems: "flex-start",
        display: "flex",
        flexDirection: "column",
        width: "90%",
    },
    cardInfo: { marginBottom: 8 },
    cardInner: {
        borderRadius: 8,
        overflow: "hidden",
        width: "50%",
    },

    cardMapContainer: {
        alignItems: "flex-start",
        backgroundColor: WHITE,
        borderRadius: 8,
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 16,
        padding: 16,
        width: "100%",
    },
    noCardContainer: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: WHITE,
        borderRadius: 8,
        padding: 24,
        width: "100%",
        marginTop: 20,
    },
    nocardImageIcon: { width: 36, height: 36, marginBottom: 11 },
    cardMapSubCont: {
        alignContent: "flex-end",
        flexDirection: "row",
        justifyContent: "space-between",
    },
    cardSection: {
        fontSize: 14,
        fontWeight: "600",
        lineHeight: 23,
        marginBottom: 15,
        marginTop: 30,
        textAlign: "left",
    },
    instruction: {
        paddingHorizontal: 36,
    },
    label: {
        paddingTop: 8,
    },
    loaderBalance: { borderRadius: 6, height: 32, width: 186 },
    loaderBalanceTitle: { borderRadius: 6, height: 18, marginTop: 2, width: 150 },
    paramLabelCls: {
        color: YELLOW,
        fontSize: 14,
        fontStyle: "normal",
        fontWeight: "normal",
        letterSpacing: 0,
        lineHeight: 20,
        paddingLeft: 10,
    },
    productsListContainer: {
        marginHorizontal: 24,
        marginTop: 12,
    },
    radioAlign: { alignItems: "flex-start", marginRight: 8 },

    radioContainer: { marginTop: 4 },

    totalBalanceContainer: {
        alignItems: "center",
        marginVertical: 24,
    },
    applePairedDevice: {
        backgroundColor: WHITE,
        borderRadius: 8,
        flexDirection: "row",
        marginBottom: 20,
        alignItems: "center",
        width: "100%",
        height: 76,
    },
    appleWatchImage: {
        width: 16,
        height: 29,
        marginLeft: "5%",
    },
    deviceText: {
        marginLeft: "4%",
    },
    appleIphoneImage: {
        width: 14,
        height: 28,
        marginLeft: "8%",
    },
    appleWatchImage: {
        width: 16,
        height: 29,
        marginLeft: "5%",
    },
});

export default CardsList;
