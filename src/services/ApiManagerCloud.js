/* eslint-disable no-useless-catch */
export async function callCloudApi({ uri, method, headers, body, noJson = false }) {
    try {
        const response = await fetch(uri, {
            method,
            headers,
            body,
        });
        return noJson ? response : await response.json();
    } catch (e) {
        // error logging here
        throw e;
    }
}
