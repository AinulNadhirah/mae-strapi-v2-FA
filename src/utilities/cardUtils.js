import {
    MAE_VIRTUAL_CARD_EXPIRED,
    MAE_VIRTUAL_CARD_EXPIRING_IN,
    MAE_VIRTUAL_CARD_EXPIRING_NOW,
} from "@constants/strings";

export const getExpiryDescription = (isRenewAllowed, monthsToExpire) => {
    let maeExpiryDesc = "";
    if (isRenewAllowed) {
        if (monthsToExpire > 1 && monthsToExpire <= 6) {
            maeExpiryDesc = MAE_VIRTUAL_CARD_EXPIRING_IN.replace(
                "[monthsToExpire]",
                monthsToExpire
            );
        } else if (monthsToExpire === 1) {
            maeExpiryDesc = MAE_VIRTUAL_CARD_EXPIRING_NOW;
        } else if (monthsToExpire < 0) {
            maeExpiryDesc = MAE_VIRTUAL_CARD_EXPIRED;
        }
    }
    return maeExpiryDesc;
};
