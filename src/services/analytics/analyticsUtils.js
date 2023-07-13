import { showErrorToast } from "@components/Toast";

import { APPLE_PAY_DASHBOARD, FA_MID_BANNER_APPLE_PAY } from "@constants/strings";

import { GABankingApplePay } from "./analyticsBanking";

export function wrapTryCatch(object) {
    let key, method;

    for (key in object) {
        method = object[key];
        if (typeof method === "function") {
            object[key] = (function (method, key) {
                return function () {
                    try {
                        return method.apply(this, arguments);
                    } catch (e) {
                        showErrorToast({ message: e.message });
                    }
                };
            })(method, key);
        }
    }
    return object;
}

export function logEventOnBannerPress(action) {
    // TODO: sonarjs throwing error for switch block with less than 3 cases, keeping as IF for now
    // can rewrite as switch once there are more than 3 cases
    if (action === APPLE_PAY_DASHBOARD) {
        GABankingApplePay.onMomentApplePay(FA_MID_BANNER_APPLE_PAY);
    }
}
