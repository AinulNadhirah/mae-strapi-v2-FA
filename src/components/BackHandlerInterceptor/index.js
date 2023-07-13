import { useEffect } from "react";
import { BackHandler, Platform } from "react-native";
import { withModelContext } from "@context";

export function handleRequestClose(updateModel) {
    if (Platform.OS === "android") {
        updateModel({
            ui: {
                showQuitPopup: true,
            },
        });
    }

    return true;
}

export default withModelContext(function BackHandlerInterceptor({ updateModel }) {
    useEffect(() => {
        /**
         * Android back handler
         */

        BackHandler.addEventListener("hardwareBackPress", () => handleRequestClose(updateModel));

        return () =>
            BackHandler.removeEventListener("hardwareBackPress", () =>
                handleRequestClose(updateModel)
            );
    }, [updateModel]);

    return null;
});
