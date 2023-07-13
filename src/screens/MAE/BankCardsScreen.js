import React, { Component } from "react";
import { Text, View, StatusBar, TouchableOpacity } from "react-native";
import commonStyle from "@styles/main";
import * as ModelClass from "@utils/dataModel/modelClass";

class BankCardsScreen extends Component {
    static navigationOptions = ({ navigation: { navigate } }) => ({
        title: "",
        header: null,
    });
    constructor(props) {
        super(props);
    }

    render() {
        return <View style={[commonStyle.contentBlue, commonStyle.blueBackgroundColor]} />;
    }
}

export default BankCardsScreen;
