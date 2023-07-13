import React, { Component } from "react";
import { View, StyleSheet, Image, ScrollView } from "react-native";
import PropTypes from "prop-types";
import ScreenContainer from "@components/Containers/ScreenContainer";
import ScreenLayout from "@layouts/ScreenLayout";
import ActionButton from "@components/Buttons/ActionButton";
import Typo from "@components/Text";
import { GASettingsScreen } from "@services/analytics/analyticsSettings";

import { MEDIUM_GREY, YELLOW } from "@constants/colors";
import { DUITNOW_REG_SUCESS, DUITNOW_YOUR_ACCOUNT, UPDATE_ACCOUNT } from "@constants/strings";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Assets from "@assets";
import { maskAccountNumber, maskIdValue } from "@utils/dataModel/utility";

class DuitnowSucess extends Component {
    static propTypes = {
        getModel: PropTypes.func,
        route: PropTypes.shape({
            params: PropTypes.shape({
                selectedAccInfo: PropTypes.any,
                selectedProxyInfo: PropTypes.any,
                type: PropTypes.any,
            }),
        }),
    };

    constructor(props) {
        super(props);
        this.state = {
            selectedAccInfo: props.route?.params?.selectedAccInfo,
            selectedProxyInfo: props.route?.params?.selectedProxyInfo,
            type: props.route?.params?.type
        };
    }

    componentDidMount() {
        if (this.state.type === UPDATE_ACCOUNT) {
            GASettingsScreen.onSuccessDuitNowSwitch();
        } else {
            GASettingsScreen.onSuccessDuitNowRegister();
        }
    }

    handleBack = () => {
        console.log("[DuitnowSucess] >> [handleBack]");
        this.props.navigation.goBack();
    };

    handleConfirmPress = () => {
        console.log("[DuitnowSucess] >> [handleConfirmPress]");
        this.props.navigation.navigate("Settings");
    };

    render() {
        const { selectedAccInfo, selectedProxyInfo } = this.state;
        return (
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                <ScreenLayout paddingBottom={0} paddingTop={0} paddingHorizontal={0} useSafeArea>
                    <ScrollView>
                        <View style={styles.container}>
                            <Image style={styles.sucessImage} source={Assets.referral} />
                            <Typo
                                fontSize={20}
                                fontWeight="300"
                                lineHeight={30}
                                text={DUITNOW_REG_SUCESS}
                                textAlign="center"
                                style={styles.linkAccountText}
                            />
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={18}
                                text={DUITNOW_YOUR_ACCOUNT}
                                textAlign="center"
                                style={styles.accountTypeText}
                            />

                            <Typo
                                fontSize={16}
                                fontWeight="normal"
                                lineHeight={22}
                                text={selectedAccInfo?.name}
                                textAlign="center"
                                style={styles.accountNumberText}
                            />
                            <Typo
                                fontSize={16}
                                fontWeight="normal"
                                lineHeight={22}
                                text={maskAccountNumber(selectedAccInfo?.number?.substring(0, 12))}
                                textAlign="center"
                                style={styles.accountType}
                            />
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={18}
                                text={selectedProxyInfo?.text}
                                textAlign="left"
                                style={styles.accountTypeText}
                            />

                            <Typo
                                fontSize={16}
                                fontWeight="normal"
                                lineHeight={22}
                                text={
                                    selectedProxyInfo.isregisteredProxy
                                        ? selectedProxyInfo.idVal
                                        : maskIdValue(selectedProxyInfo.value)
                                }
                                textAlign="left"
                                style={styles.accountType}
                            />
                        </View>
                    </ScrollView>
                    <FixedActionContainer>
                        <ActionButton
                            fullWidth
                            borderRadius={25}
                            onPress={this.handleConfirmPress}
                            backgroundColor={YELLOW}
                            componentCenter={
                                <Typo
                                    text={"Done"}
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={18}
                                />
                            }
                        />
                    </FixedActionContainer>
                </ScreenLayout>
            </ScreenContainer>
        );
    }
}

const styles = StyleSheet.create({
    accountNumberText: {
        marginTop: 10,
    },
    accountType: {
        marginTop: 3,
    },
    accountTypeText: {
        marginTop: 25,
    },
    container: {
        alignItems: "center",
        flex: 1,
        justifyContent: "center",
    },
    linkAccountText: {
        marginTop: 20,
    },
    sucessImage: {
        height: 57,
        marginTop: 50,
        width: 64,
    },
});

export default DuitnowSucess;
