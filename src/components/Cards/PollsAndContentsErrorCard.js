import React from "react";
import { View, StyleSheet, Text } from "react-native";
import Typo from "@components/Text";
import { LIGHT_GREY } from "@constants/colors";

const PollsAndContentsErrorCard = () => (
    <View style={styles.container}>
        <View style={styles.textArea}>
            <Typo fontSize={14} fontWeight="bold" lineHeight={18}>
                <Text>{`We're Sorry!`}</Text>
            </Typo>
            <Typo fontSize={12} lineHeight={18}>
                <Text>{`Hang in there, we're facing some technical issues processing your request. Try again later.`}</Text>
            </Typo>
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        backgroundColor: LIGHT_GREY,
        borderRadius: 8,
        height: 205,
        justifyContent: "center",
        width: "100%",
    },
    textArea: {
        alignItems: "center",
        justifyContent: "center",
        width: 266,
    },
});

const Memoiz = React.memo(PollsAndContentsErrorCard);

export default Memoiz;
