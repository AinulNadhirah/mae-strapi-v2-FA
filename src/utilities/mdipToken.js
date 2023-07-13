import { PREMIER_GET_TOKEN, PREMIER_GET_REFRESH_TOKEN } from "@constants/premierUrl";
import { ENDPOINT_BASE, STP_ENDPOINT_BASE } from "@constants/url";

export async function getCasaToken(token) {
    let casaResponse;
    try {
        const headers = {
            Authorization: `bearer ${token}`,
        };
        casaResponse = await fetch(`${ENDPOINT_BASE}/${PREMIER_GET_TOKEN}`, {
            method: "POST",
            headers,
        });
        if (casaResponse?.status === 200) {
            casaResponse = casaResponse.json();
        }
    } catch (e) {
        console.log(e);
    }
    return casaResponse;
}

export async function getCasaRefreshToken(refreshToken) {
    let casaResponse;
    try {
        casaResponse = await fetch(
            `${STP_ENDPOINT_BASE}/${PREMIER_GET_REFRESH_TOKEN}?refreshToken=${refreshToken}`,
            {
                method: "POST",
            }
        );
    } catch (e) {
        console.log(e);
    }
    if (casaResponse?.status === 200) {
        casaResponse = casaResponse.json();
    }
    return casaResponse;
}

export async function handleMdipTokenExpiry(casaRefreshToken, token) {
    let casaResponse;

    try {
        casaResponse = await getCasaRefreshToken(casaRefreshToken);
    } catch (e) {
        console.log(e);
    }

    if (!casaResponse.responseData) {
        const headers = {
            authorization: `bearer ${token}`,
        };
        casaResponse = await fetch(`${ENDPOINT_BASE}/${PREMIER_GET_TOKEN}`, {
            method: "POST",
            headers,
        });
        if (casaResponse?.status === 200) {
            casaResponse = casaResponse.json();
        }
    }
    return casaResponse;
}
