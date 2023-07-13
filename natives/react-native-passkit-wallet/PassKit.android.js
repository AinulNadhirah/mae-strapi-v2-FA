import type EmitterSubscription from "EmitterSubscription";
import { NativeModules } from "react-native";

/**
 * @flow
 */
("use strict");

const nativeModule = NativeModules.RNPassKit;

export default {
    ...nativeModule,

    presentAddPassesViewController: (base64Encoded: string): Promise<void> => {
        console.warn(
            "PassKit.presentAddPassesViewController is deprecated. Use PassKit.addPass instead."
        );
        return nativeModule.addPass(base64Encoded);
    },

    addEventListener: (
        eventType: string,
        listener: Function,
        context: ?Object
    ): ?EmitterSubscription => null,

    removeEventListener: (eventType: string, listener: Function): void => {},
};
