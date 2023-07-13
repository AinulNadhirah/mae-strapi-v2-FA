import React, { Component } from "react";
import { Alert, Dimensions, StyleSheet, Image, View, Text, ScrollView } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import ScreenContainer from "@components/Containers/ScreenContainer";
import ScreenLayout from "@layouts/ScreenLayout";
import HeaderLayout from "@layouts/HeaderLayout";
import Typo from "@components/Text";
import ActionButton from "@components/Buttons/ActionButton";
import Assets from "@assets";
import { YELLOW, MEDIUM_GREY } from "@constants/colors";
import { eKYCReupload } from "@services";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

class MAEReuploadSuccess extends Component {
    constructor(props) {
        super(props);
        this.state = {
            filledUserDetails: props.route?.params?.filledUserDetails,
        };
    }

    componentDidMount() {
        console.log("[MAEReuploadSuccess] >> [componentDidMount]");
        const { filledUserDetails } = this.state;
        const data = {
            selfieImg: filledUserDetails?.documentImages?.idFrontImgData,
            idImg: filledUserDetails?.selfieImages?.selfieImgData,
            ekycRefId: filledUserDetails?.ekycRefId,
        };
        eKYCReupload(data)
            .then((response) => {
                console.log("[MAEReuploadSuccess][eKYCReupload] >> Success");
                const result = response.data.result;
                if (result.statusCode != "0000") {
                    const { filledUserDetails } = this.state;
                    this.props.navigation.navigate(navigationConstant.MAE_REUPLOAD, {
                        filledUserDetails: filledUserDetails,
                    });
                }
            })
            .catch((error) => {
                console.log("[MAEReuploadSuccess][eKYCReupload] >> Failure");
                showErrorToast({
                    message: error.message,
                });
            });
    }

    goToWallet = () => {
        console.log("[MAEReuploadSuccess] >> [goToWallet]");
        this.props.navigation.navigate("TabNavigator", {
            screen: "Tab",
            params: {
                screen: "Maybank2u",
            },
        });
    };

    render() {
        return (
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                <ScreenLayout
                    header={
                        <HeaderLayout
                            horizontalPaddingMode={"custom"}
                            horizontalPaddingCustomLeftValue={16}
                            horizontalPaddingCustomRightValue={16}
                        />
                    }
                    paddingHorizontal={0}
                    paddingBottom={0}
                    paddingTop={0}
                    useSafeArea
                >
                    <React.Fragment>
                        <View style={{ flex: 1, marginHorizontal: 36 }}>
                            {/* Image Block */}
                            <View style={Style.statusPgImgBlockCls}>
                                <Image
                                    resizeMode="contain"
                                    style={{ width: 57, height: 52 }}
                                    source={Assets.icTickNew}
                                />
                            </View>

                            {/* Desc */}
                            <Typo
                                fontSize={20}
                                fontWeight="300"
                                fontStyle="normal"
                                letterSpacing={0}
                                lineHeight={28}
                                textAlign="left"
                                text="All done! Thank you for your submission."
                                style={{ marginTop: 5 }}
                            />
                        </View>

                        {/* Continue Button */}
                        <View style={styles.bottomBtnContCls}>
                            <LinearGradient
                                colors={["#efeff300", MEDIUM_GREY]}
                                style={styles.linearGradient}
                            />
                            <ActionButton
                                fullWidth
                                onPress={this.goToWallet}
                                backgroundColor={YELLOW}
                                componentCenter={
                                    <Typo
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={18}
                                        text="Go to Wallet"
                                    />
                                }
                            />
                        </View>
                    </React.Fragment>
                </ScreenLayout>
            </ScreenContainer>
        );
    }
}

const Style = StyleSheet.create({
    statusPgImgBlockCls: {
        marginBottom: 25,
        marginTop: (screenHeight * 10) / 100,
        width: "100%",
    },
    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        paddingHorizontal: 24,
        paddingVertical: 25,
    },
    linearGradient: {
        height: 30,
        left: 0,
        right: 0,
        top: -30,
        position: "absolute",
    },
});

export default MAEReuploadSuccess;
