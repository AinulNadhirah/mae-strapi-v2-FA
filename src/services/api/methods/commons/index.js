import { API } from "@services/api";

import { DEVICE_ADD, DEVICE_LIST_BY_USERNAME, PUBLIC_KEY } from "../../endpoints";

export const getPublicKey = (api: API) => {
    return api.get(`${PUBLIC_KEY}`, {
        showPreloader: false,
        promptError: false,
    });
};

export const getDevices = (api: API, data) =>
    api.post(`${DEVICE_LIST_BY_USERNAME}`, data, {
        showPreloader: false,
        promptError: false,
    });

export const addDevice = (api: API, data) =>
    api.post(`${DEVICE_ADD}`, data, {
        withToken: true,
        showPreloader: false,
        promptError: false,
    });
