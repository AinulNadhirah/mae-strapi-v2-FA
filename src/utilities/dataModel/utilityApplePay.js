import PassKit from "react-native-passkit-wallet";
import { checkCardEligibility } from "@screens/ApplePay/ApplePayController";

import { getCardNoLength } from "@utils/dataModel/utility";

export function sortCardsByName(cards) {
    return cards.sort((a, b) => a.name.localeCompare(b.name));
}

export function getProvisionedCardsSuffixInDevice(provisionedCards) {
    return provisionedCards?.device?.map((a) => a.primaryAccountIdentifier); //primaryAccountNumberSuffix
}

export function getProvisionedCardsInMBBCards(provisionedCards, mbbCards) {
    return mbbCards.filter(
        (card) => provisionedCards?.includes(card?.number?.substring(12, 16)) //substring 12 to 16 of card number
    );
}

export function reconstructingProvisionedCardsArray(
    provisionedCardsInMBB,
    provisionedCardsFromPasskit
) {
    return provisionedCardsInMBB?.map((obj) => {
        const { number } = obj;
        const objThatExist = provisionedCardsFromPasskit?.device.find(
            (o) => o.primaryAccountNumberSuffix === number?.substring(12, 16)
        );
        return { ...obj, ...objThatExist };
    });
}

export function getEligibleCards(provisionedCards, mbbCards) {
    const eligibleCards = mbbCards.filter(function (card) {
        return !provisionedCards?.includes(card?.number?.substring(12, 16));
    });

    const debitCardArray = eligibleCards.filter((card) => card.maeDebit === true);
    const nonProvisionedCardArray = eligibleCards.filter((card) => card.maeDebit === false);

    return [...debitCardArray, ...nonProvisionedCardArray];
}

export function checkIfEligibleCardExists(provisionedCardsFromPasskit, mbbCards) {
    const provisionedCardsSuffixInDevice = getProvisionedCardsSuffixInDevice(
        provisionedCardsFromPasskit
    );
    const eligibleCards = getEligibleCards(provisionedCardsSuffixInDevice, mbbCards);
    return eligibleCards.length > 0 ? true : false;
}

export function returnCardDetails(provisionedCards, cardNo) {
    return provisionedCards.find((card) => card.number === cardNo);
}

//New Changes

export async function filterProvisionedCards(cards) {
    const hasPairedDevice = await PassKit.checkPairedDevices();
    const alphabeticalSort = cards.sort((a, b) => a.name.localeCompare(b.name));
    if (hasPairedDevice?.isWatchPaired) {
        for (const i in alphabeticalSort) {
            const subString = getCardNoLength(alphabeticalSort[i].number);
            const res = await checkCardEligibility(
                alphabeticalSort[i]?.fpanID,
                alphabeticalSort[i]?.number.substring(subString - 4, subString)
            );
            if (res?.watch !== true || res?.device !== true) {
                alphabeticalSort[i].activated = false;
                if (res?.watch !== true && res?.device !== true) {
                    alphabeticalSort[i].notProvisionedIn = "both";
                } else if (res?.watch !== true) {
                    alphabeticalSort[i].notProvisionedIn = "watch";
                } else if (res?.device !== true) {
                    alphabeticalSort[i].notProvisionedIn = "iphone";
                } else {
                    alphabeticalSort[i].notProvisionedIn = "none";
                }
            }
        }
    }
    const provisionedCards = alphabeticalSort.filter((card) => card.activated);
    const eligibleProvisionedCards = alphabeticalSort.filter((card) => !card.activated);
    // const maeCard = eligibleCards.filter((card) => card.maeDebit);
    // const nonMaeCardList = eligibleCards.filter((card) => !card.maeDebit);
    // const eligibleProvisionedCards = [...maeCard, ...nonMaeCardList];
    return {
        provisionedCards,
        eligibleProvisionedCards,
    };
}

export function isCardProvisioned(cardNo, cards = []) {
    return cards.find((card) => card.number === cardNo);
}
