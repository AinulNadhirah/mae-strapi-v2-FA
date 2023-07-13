import React, { Component } from "react";
import { View, Image, TouchableOpacity, Text } from "react-native";
import styles from "@styles/Wallet/WalletSetupStyles";
import { HeaderPageIndicator } from "@components/Common";
import * as ModelClass from "@utils/dataModel/modelClass";
import NavigationService from "@navigation/navigationService";
import * as navigationConstant from "@navigation/navigationConstant";
import * as strings from "@constants/strings";

class WalletSetup extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        console.log("ispayment: " + ModelClass.PARTNER_APPLICATION.isPartnerApplication);
        return (
            <View style={styles.mainView}>
                <HeaderPageIndicator
                    isWhiteIcon={false}
                    noPop={true}
                    noClose={true}
                    showClose={true}
                    onClosePress={() => {
                        ModelClass.PARTNER_APPLICATION.isPartnerApplication = false;
                        NavigationService.navigate(navigationConstant.PLAN_CONFIRMATION);
                    }}
                    showBack={false}
                />
                <View style={styles.subView}>
                    <Text style={styles.setuptext}>{strings.WALLET_SETUP}</Text>
                    <TouchableOpacity
                        style={styles.m2uView}
                        onPress={() => {
                            ModelClass.GOAL_DATA.startFrom = false;
                            NavigationService.navigate(navigationConstant.LINK_M2U, {
                                userName: "Lucy",
                            });
                        }}
                    >
                        <Image
                            source={require("@assets/icons/yellow_wallet.png")}
                            style={styles.icon}
                        />
                        <Text style={styles.description}>{strings.LOGIN_WITH_M2U}</Text>
                    </TouchableOpacity>
                    <View style={styles.m2uView}>
                        <Image
                            source={require("@assets/icons/ic_add_yellow1.png")}
                            style={styles.icon}
                        />
                        <Text style={styles.description}>{strings.CREATE_MAE}</Text>
                    </View>
                    <View style={styles.m2uView}>
                        <Image
                            source={require("@assets/icons/yellowCancel.png")}
                            style={styles.icon}
                        />
                        <Text style={styles.description}>{strings.REMIND_ME_LATER}</Text>
                    </View>
                </View>
            </View>
        );
    }
}

export default WalletSetup;
