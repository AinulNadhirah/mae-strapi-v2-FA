// @ts-check
import React from "react";
import { Component } from "react";

import { ModelContextUpdater, useModelState } from "@context";

import ApiManager from "@services/ApiManager";

import { METHOD_DELETE, METHOD_GET, METHOD_POST, METHOD_PUT, TIMEOUT } from "@constants/api";

import { useErrorLog } from "@utils/logs";

export interface API {
    get(endpoint: string, config?: Config): () => Promise<Object>;
    post(endpoint: string, data?: Object, config?: Config): () => Promise<Object>;
    delete(endpoint: string, data?: Object, config?: Config): () => Promise<Object>;
    put(endpoint: string, data?: Object, config?: Config): () => Promise<Object>;
}

export type Config = {
    withToken: Boolean,
    timeout: Number,
    promptError: Boolean,
    showPreloader: Boolean,
    withSecondaryToken: Boolean,
    contentType: String,
    responseType: String,
    isMultipart: Boolean,
};

const defaultConfig = {
    withToken: false,
    timeout: TIMEOUT,
    promptError: true,
    showPreloader: true,
    withSecondaryToken: false,
    contentType: "",
    responseType: "",
    isMultipart: false,
};

// const isNil = (status) => status === 0;
export const in200 = (status): Boolean => status >= 200 && status <= 299;
// const in400 = (status) => status >= 400 && status <= 499;
// const in500 = (status) => status >= 500 && status <= 599;

/**
 * Request manager will ultimately replace ApiManager
 * and do the request management as declarative and
 * emphasize on hook and lifecycle.
 *
 * For now it will leverage on ApiManager.service to
 * cater our singleton request response
 */

export async function requestManager(
    endpoint: String,
    data: Object = {},
    method: String = METHOD_GET,
    config: Config = defaultConfig,
    context,
    errorLogger
) {
    // we will provide the contex to the Api Manager to access the context
    // right now API manager already have the context for it being mounted
    // as a component but this approach it to remove such way in future
    const mergedConfig = { ...defaultConfig, ...config };

    try {
        const request = await ApiManager.service({
            url: endpoint,
            data,
            reqType: method,
            withToken: mergedConfig.withToken,
            tokenType: "", // the value is useless\
            timeout: mergedConfig.timeout,
            promptError: mergedConfig.promptError,
            showPreloader: mergedConfig.showPreloader,
            secondTokenType: mergedConfig.withSecondaryToken,
            withSecondaryToken: mergedConfig.withSecondaryToken,
            contentType: mergedConfig.contentType,
            responseType: mergedConfig.responseType,
            isMultipart: mergedConfig.isMultipart,
            context: context,
        });

        if (request && in200(request?.status)) {
            return request;
        } else {
            throw new Error(request);
        }
    } catch (error) {
        console.tron.log(error);
        typeof errorLogger === "function" && errorLogger(error);
        throw error;
    }
}

function ContextWrapped({ children }) {
    const state = useModelState();
    const { errorLogger } = useErrorLog();

    return children({
        state,
        errorLogger,
    });
}

function getDisplayName(WrappedComponent) {
    return WrappedComponent.displayName || WrappedComponent.name || "Component";
}

function withApi(WrappedComponent) {
    class WithApi extends Component {
        static displayName = `WithApi(${getDisplayName(WrappedComponent)})`;

        static contextType = ModelContextUpdater;

        static errorLogger;

        api: API = {
            get: async (endpoint: string, config: Config): Promise => {
                return requestManager(
                    endpoint,
                    null,
                    METHOD_GET,
                    config,
                    {
                        controller: this.context,
                        state: this.contextState,
                    },
                    this.errorLogger
                );
            },
            post: (endpoint: string, data: Object, config: Config): Promise => {
                return requestManager(
                    endpoint,
                    data,
                    METHOD_POST,
                    config,
                    {
                        controller: this.context,
                        state: this.contextState,
                    },
                    this.errorLogger
                );
            },
            delete: (endpoint: string, data: Object, config: Config): Promise => {
                return requestManager(
                    endpoint,
                    data,
                    METHOD_DELETE,
                    config,
                    {
                        controller: this.context,
                        state: this.contextState,
                    },
                    this.errorLogger
                );
            },
            put: (endpoint: string, data: Object, config: Config): Promise => {
                return requestManager(
                    endpoint,
                    data,
                    METHOD_PUT,
                    config,
                    {
                        controller: this.context,
                        state: this.contextState,
                    },
                    this.errorLogger
                );
            },
        };

        render() {
            return (
                <ContextWrapped>
                    {(context) => {
                        this.errorLogger = context.errorLogger;
                        this.contextState = context.state;

                        return <WrappedComponent api={this.api} {...this.props} />;
                    }}
                </ContextWrapped>
            );
        }
    }

    return WithApi;
}

export { defaultConfig, withApi };
