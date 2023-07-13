import { encode as btoa } from "base-64";
import { Buffer } from "buffer";

export class S2uUtil {
    static prepareConfig(accToken) {
        return {
            method: "POST",
            headers: this.returnGWHeader(accToken),
            timeout: 60000,
        };
    }

    static returnGWHeader(accToken) {
        return {
            mbbsource: "mae",
            authorization: "bearer " + accToken,
        };
    }

    static buff(msg) {
        return Buffer.from(msg, "base64");
    }

    static padding(encodedLength, message) {
        const paddingZero = 32 + encodedLength;
        const n = paddingZero - message.length;
        const zeroCt = [];

        for (let i = 0; i < paddingZero; i++) {
            if (i < n) zeroCt["" + i + ""] = 0;
            else zeroCt["" + i + ""] = message[i - n];
        }

        return zeroCt;
    }

    static arrayBufferToBase64(buffer) {
        let binary = "";
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }
}
