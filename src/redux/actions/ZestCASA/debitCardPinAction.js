// Entry actions

export const DEBIT_CARD_ENTER_PIN = (enterPin) => ({
    enterPin: enterPin,
});
export const DEBIT_CARD_RE_ENTER_PIN = (reEnterPin) => ({
    reEnterPin: reEnterPin,
});

export const DEBIT_CARD_LAST_8_DIGIT_ENTER = (debitCardLast8Digit) => ({
    debitCardLast8Digit: debitCardLast8Digit,
});

export const DEBIT_CARD_CLEAR_PIN = () => ({});
