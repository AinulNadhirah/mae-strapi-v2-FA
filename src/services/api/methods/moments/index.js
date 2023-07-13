import { API } from "@services/api";
import { MOMENT_EMPTY, MOMENT_ONBOARD } from "@services/api/endpoints";

export const getMomentNTB = (api: API) => {
    return api.get(`${MOMENT_EMPTY}`, { showPreloader: false, promptError: false });
};

export const getFullMoment = (api: API, query) => {
    return api.get(`${MOMENT_ONBOARD}?${query}`, {
        withToken: true,
        showPreloader: false,
        promptError: false,
    });
};
