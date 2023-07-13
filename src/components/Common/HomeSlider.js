import React from "react";
import { Text, View, Image } from "react-native";

import styles from "@styles/main";

//Component
const HomeSlider = (probs) => {
    return (
        <View style={styles.viewFlex}>
            <View style={styles.mainViewWrapper}>
                <Text style={[styles.splashText, styles.font]}>{probs.text}</Text>
            </View>
        </View>
    );
};

//make the Component availble to other part of the app
export { HomeSlider };
