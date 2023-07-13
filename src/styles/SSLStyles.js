import { StyleSheet } from "react-native";

import { SHADOW_LIGHT, BLACK } from "@constants/colors";

const SSLStyles = StyleSheet.create({
    pillShadow: {
        elevation: 8,
        shadowColor: SHADOW_LIGHT,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 1,
        shadowRadius: 16,
    },
    shadow: {
        elevation: 8,
        shadowColor: BLACK,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
    },
});

export default SSLStyles;
