import PropTypes from "prop-types";
import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ProductApplyItem from "@components/Cards/ProductApplyItem";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";

import { withModelContext } from "@context";

import { MEDIUM_GREY } from "@constants/colors";

import Assets from "@assets";

const ExploreFundsScreen = ({ navigation }) => {
    function onBackPress() {
        navigation.goBack();
    }

    function _handleFDCardPressed() {
        navigation.navigate("AsbFixedAccount");
    }

    return (
        <React.Fragment>
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                <ScreenLayout
                    paddingBottom={0}
                    paddingTop={0}
                    paddingHorizontal={0}
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={onBackPress} />}
                        />
                    }
                    useSafeArea
                >
                    <ScrollView style={styles.scrollView}>
                        <View style={styles.titleContainer}>
                            <Typo
                                lineHeight={18}
                                fontSize={18}
                                fontWeight="600"
                                text="Grow your funds in low-risk investments"
                                textAlign="center"
                            />
                        </View>
                        <View style={styles.descriptionContainer}>
                            <Typo
                                lineHeight={18}
                                fontSize={14}
                                fontWeight="300"
                                text="Invest your extra savings in these low-risk accounts to earn higher interest rates. Swipe now to explore your options."
                                textAlign="center"
                            />
                        </View>
                        <ScrollView key="ScrollView">
                            <View style={styles.margins}>
                                <ProductApplyItem
                                    productType="Card"
                                    bgImage={Assets.stpApplyFd}
                                    text={{
                                        header: "Fixed Deposit Account",
                                        subHeader: "Grow your savings with\nattractive rates.",
                                    }}
                                    onCardPressed={_handleFDCardPressed}
                                    cardType="MEDIUM"
                                />
                            </View>
                        </ScrollView>
                    </ScrollView>
                </ScreenLayout>
            </ScreenContainer>
        </React.Fragment>
    );
};

ExploreFundsScreen.propTypes = {
    getModel: PropTypes.func,
    updateModel: PropTypes.func,
    resetModel: PropTypes.func,
    navigation: PropTypes.object,
};

const styles = StyleSheet.create({
    descriptionContainer: {
        marginBottom: 20,
        marginTop: 16,
    },

    scrollView: { paddingHorizontal: 24 },

    titleContainer: {
        marginTop: 16,
    },
});

export default withModelContext(ExploreFundsScreen);
