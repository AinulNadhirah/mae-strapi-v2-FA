import AsyncStorage from "@react-native-async-storage/async-storage";
import { isEmpty } from "lodash";
import moment from "moment";
import { Linking } from "react-native";
import Config from "react-native-config";
import DeviceInfo from "react-native-device-info";
import PassKit from "react-native-passkit-wallet";

import { getAPEligibleCardsNew, getAPPrompterDetails, getRsaChallengeQuestion } from "@services";

import { APPLEPAY_V1_ENDPOINT } from "@constants/url";

import { getNetworkOperatorValue, getCardNoLength, getCardNumber } from "@utils/dataModel/utility";

export const getPrompterDetails = async () => {
    try {
        const response = await getAPPrompterDetails();
        if (response && response.status === 200) return response;
        return null;
    } catch (error) {
        return null;
    }
};

export const rsaChallengeQuestion = async (reqData) => {
    try {
        const response = await getRsaChallengeQuestion(reqData);
        if (response && response.status === 200) return response;
        return null;
    } catch (error) {
        return error; //CQ reject
    }
};

export const fetchCards = async () => {
    try {
        const provCardsList = await fetchProvisonedCardsFromWallet();
        console.log(provCardsList?.device);
        let fpadIds = provCardsList?.device.concat(provCardsList?.watch);
        fpadIds = fpadIds.filter((item, index) => {
            return fpadIds.indexOf(item) === index;
        });
        const request = {
            fpanIDList: fpadIds || [], //["FAPLMC000011803506b7729f74a34830a7f4edbc6b1aaf11"],
        };
        const response = await getAPEligibleCardsNew(true, request);
        if (response && response.status === 200) return response;
        return null;
    } catch (error) {
        return null;
    }
};

export const fetchProvisonedCardsFromWallet = async (updateModel) => {
    //Apple In App Provision SDK Call  to get the provisioned cards
    const res = await PassKit.getProvisionedCards("");
    console.log(res);
    if (updateModel) {
        updateModel({
            applePayData: {
                provisionedCards: res,
            },
        });
    }
    return res ? res : { device: [], watch: [] };
};

export const checkCardEligibility = async (FPANID, suffix) => {
    const res = FPANID
        ? await PassKit.checkCardEligibility(FPANID)
        : await PassKit.checkCardEligibilitySuffix(suffix);
    console.log(res);
    return res ? res : { device: false, watch: false };
};

export const checkApplePayEligibility = (updateModel) => {
    console.log("utilityApplePay ::: checkApplePayEligibility");
    if (PassKit) {
        PassKit.canAddPasses().then((result) => {
            console.log("Splash ::: canAddPasses ::: ", result);
            if (result) {
                updateModel({
                    applePay: {
                        isEligibleDevice: true,
                    },
                });
            }
        });
        fetchProvisonedCardsFromWallet(updateModel);
    }
};

export const payWithApplePay = async (FPANID, suffix) => {
    const res = FPANID
        ? await PassKit.payWithApplePay(FPANID)
        : await PassKit.payWithApplePaySuffix(suffix);
    console.log(res);

    if (res) {
        Linking.canOpenURL(res)
            .then((supported) => {
                if (!supported) {
                    console.log("Can't handle settings url");
                } else {
                    return Linking.openURL(res);
                }
            })
            .catch((err) => console.error("An error occurred", err));
    }
    return res ? res : "";
};

export const getAPCardNumber = (cardNum) => {
    const length = getCardNoLength(cardNum);
    const cardNo = getCardNumber(cardNum, length);
    return cardNo;
};

export const onApplePayBtnPress = (token, cardNo, cardName, customerName, isMaeDebit, fpanId) => {
    PassKit.canAddPasses().then((result) => {
        console.log("[ApplePayController] >>> [onApplePayBtnPress] ::: ", result);
        if (result) {
            const subString = getCardNoLength(cardNo);
            const params = {};
            params.cardNo = cardNo.substring(0, subString);
            params.cardName = cardName;
            params.cardNoSuffix = cardNo.substring(subString - 4, subString);
            params.holderName = customerName;
            params.localizedDesc = "This will add the card to Apple Pay";
            params.primaryAccountIdentifier = fpanId ? fpanId : ""; //As per docs it was optional (7.6)
            params.paymentNetwork = getNetworkOperatorValue(cardNo.substring(0, 1));
            params.isMaeDebit = isMaeDebit;
            //API Params
            params.url = APPLEPAY_V1_ENDPOINT + "/provision"; //"https://sit-maya.maybank.com.my/applepay/v1/provision"; //"https://maya.maybank2u.com.my/";
            params.token = token;
            params.version = DeviceInfo.getVersion();
            params.appEnvRegion = Config?.APP_ENV ?? "";
            PassKit.addPass(params)
                .then((res) => console.log("[ApplePayController] >>> Pass success ", res))
                .catch((err) => console.log("[ApplePayController] >>> Pass Error ****", err));
        }
    });
};

export const checkApplePayScheduledPrompter = async (applePayPrompter) => {
    const start = moment(applePayPrompter?.start, "YYYY-MM-DD HH:mm:SS").valueOf();
    const end = moment(applePayPrompter?.end, "YYYY-MM-DD HH:mm:SS").valueOf();
    const now = moment().unix() + "000";
    const maxCount = applePayPrompter?.limitCount;

    const currentPrompter = await retrievePrompter();
    const startOfDay = moment().startOf("day").unix() + "000";
    const timestampDiff = now - currentPrompter?.timestamp;
    const oneDayDiff = 86400000;
    // AsyncStorage.removeItem("applePayPrompter");
    // now - startOfDay
    // if > a day, reset asyncStorage
    // if < a day, increment count
    let isScheduled = false;
    if (end > now && now > start) {
        if (isEmpty(currentPrompter) || timestampDiff > oneDayDiff) {
            // init
            console.log("init");
            storePrompter(startOfDay, 0);
            isScheduled = true;
        } else if (maxCount > currentPrompter?.count) {
            // increment count
            console.log("less than a day");
            storePrompter(currentPrompter?.timestamp, currentPrompter?.count);

            if (currentPrompter?.count < maxCount) {
                isScheduled = true;
            }
        } else {
            // within the same day, limitCount maxed out
            console.log("nothing happened");
        }
    }
    return isScheduled;
};

export const retrievePrompter = async () => {
    console.log("retrieveApplePayPrompter");
    try {
        const obj = await AsyncStorage.getItem("applePayPrompter");
        return obj ? JSON.parse(obj) : {};
    } catch (e) {
        return {};
    }
};

export const storePrompter = async (timestamp, count) => {
    const prompterLimit = {
        timestamp,
        count: count + 1,
    };
    const jsonValue = JSON.stringify(prompterLimit);
    AsyncStorage.setItem("applePayPrompter", jsonValue);
};
