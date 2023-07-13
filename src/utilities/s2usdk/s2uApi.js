import axios from "axios";

export class S2uApi {
    static async s2uApiReq(reqUrl, reqPayload, config) {
        return axios
            .post(reqUrl, reqPayload, config)
            .then(function (response) {
                return response;
            })
            .catch(function (error) {
                return error;
            });
    }
}
