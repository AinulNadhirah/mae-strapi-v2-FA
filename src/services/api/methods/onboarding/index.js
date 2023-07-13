import { API } from "@services/api";

import { USERS_ENDPOINT } from "@constants/url";

export const loginPassword = (api: API, data) => {
    return api.post(`${USERS_ENDPOINT}/login`, data, {
        showPreloader: false,
        promptError: false,
    });
};
