import React, { Component } from "react";
import { View, Text, StyleSheet } from "react-native";
import ScreenContainer from "@components/Containers/ScreenContainer";

class PartnersTabScreen extends Component {
    render() {
        return (
            <ScreenContainer backgroundType="color">
                <Text>PartnersTabScreen</Text>
            </ScreenContainer>
        );
    }
}
export default PartnersTabScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "red",
    },
});
