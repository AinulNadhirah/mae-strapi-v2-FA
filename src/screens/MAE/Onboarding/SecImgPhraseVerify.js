import React, { Component } from "react";
import { ImageBackground, Text, View } from "react-native";
import * as ModelClass from "@utils/dataModel/modelClass";
import Style from "@styles/MAE/MAEOnboardStyle";
import { SetupNow } from "@components/Common";
import * as navigationConstant from "@navigation/navigationConstant";
import * as Strings from "@constants/strings";
import ScreenContainer from "@components/Containers/ScreenContainer";
import ScreenLayout from "@layouts/ScreenLayout";

class SecImgPhraseVerify extends Component {
    static navigationOptions = ({ navigation: { navigate } }) => ({
        title: "",
        header: null,
    });

    constructor(props) {
        super(props);
        this.state = {
            m2uSecPhrase: ModelClass.MAE_CUSTOMER_DETAILS.m2uSecPhrase,
            m2uSecImgData: ModelClass.MAE_CUSTOMER_DETAILS.m2uSecImgData,
        };
    }

    yesPressed = () => {
        console.log("[SecImgPhraseVerify] >> [yesPressed]");

        this.moveToNext();
    };

    noPressed = () => {
        console.log("[SecImgPhraseVerify] >> [noPressed]");

        this.props.navigation.pop();
    };

    moveToNext = () => {
        console.log("[SecImgPhraseVerify] >> [moveToNext]");
        this.props.navigation.navigate(navigationConstant.M2U_LOGIN_PASSWORD);
    };

    render() {
        return (
            <ScreenContainer backgroundType="color">
                <ScreenLayout
                    useSafeArea
                    paddingHorizontal={50}
                    paddingBottom={0}
                    header={<View />}
                >
                    <React.Fragment>
                        <View style={Style.secImgPhraseTopBlockCls}>
                            {/* User Security Image */}
                            <ImageBackground
                                resizeMode="cover"
                                style={Style.secImgViewCls}
                                imageStyle={Style.profileImgCls}
                                source={{
                                    uri: this.state.m2uSecImgData,
                                }}
                            />

                            {/* Security Phrase */}
                            <Text
                                style={Style.secPhraseCls}
                                accessible={true}
                                testID={"txtTabungDetail"}
                                accessibilityLabel={"txtTabungDetail"}
                            >
                                {this.state.m2uSecPhrase}
                            </Text>
                        </View>

                        {/* Header */}
                        <Text style={[Style.snapName, { height: 30, marginTop: 50 }]}>
                            {Strings.M2U_LOGIN}
                        </Text>

                        {/* Description 1 */}
                        <Text
                            style={Style.snapText}
                            accessible={true}
                            testID={"txtTabungDetail"}
                            accessibilityLabel={"txtTabungDetail"}
                        >
                            {Strings.M2U_SECIMGPHRASE_PWDDESC}
                        </Text>

                        {/* Bottom buttons block */}
                        <View style={Style.buttonsView}>
                            <SetupNow
                                isBigIcon={true}
                                text={Strings.YES_ITS_MINE}
                                url={require("@assets/icons/ic_yellow_tick.png")}
                                onPress={this.yesPressed.bind(this)}
                            />

                            <SetupNow
                                isBigIcon={true}
                                text={Strings.NOT_MINE}
                                url={require("@assets/icons/yellowCancel.png")}
                                onPress={this.noPressed.bind(this)}
                            />
                        </View>
                    </React.Fragment>
                </ScreenLayout>
            </ScreenContainer>
        );
    }
}

export default SecImgPhraseVerify;
