import { APP_REQUEST_TIME_OUT } from "@constants/url";

export default function requestTimeOut(message) {
    return new Promise((_, reject) => {
        setTimeout(() => {
            reject(new Error(message));
        }, parseInt(APP_REQUEST_TIME_OUT));
    });
}
