import PropTypes from "prop-types";
import React, { Component } from "react";
import { Image, StyleSheet } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";

import { FAArticleScreen } from "@services/analytics/analyticsArticles";
import { FAPromotionsScreen } from "@services/analytics/analyticsPromotions";

// import PartnersTabScreen from "./PartnersTabScreen";
import { MEDIUM_GREY } from "@constants/colors";

import assets from "@assets";

import PromotionsTabScreen from "./PromotionsTabScreen";

class PromotionsDashboardScreen extends Component {
    _onPressSearch = () => {
        const articleMode = this.props.route?.params?.article ?? false;
        this.props.navigation.navigate("promosModule", {
            screen: "SearchScreen",
            params: { article: articleMode },
        });
        if (articleMode) {
            FAArticleScreen.onSearchPress();
        } else {
            FAPromotionsScreen.onSearchPress();
        }
    };

    goBack = () => {
        const { route, navigation } = this.props;

        if (route?.params?.redirect) {
            navigation.navigate(route?.params?.redirect.screen, route?.params?.redirect.params);
        } else {
            navigation.goBack();
        }
    };

    render() {
        const articleMode = this.props.route?.params?.article ?? false;

        return (
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                analyticScreenName={articleMode ? "Articles" : "Promotions"}
            >
                <ScreenLayout
                    paddingBottom={0}
                    paddingTop={0}
                    paddingHorizontal={0}
                    useSafeArea
                    neverForceInset={["bottom"]}
                    header={
                        <HeaderLayout
                            horizontalPaddingMode="custom"
                            horizontalPaddingCustomLeftValue={24}
                            horizontalPaddingCustomRightValue={24}
                            headerLeftElement={<HeaderBackButton onPress={this.goBack} />}
                            headerCenterElement={
                                <Typo
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={19}
                                    text={articleMode ? "Articles" : "Promotions"}
                                />
                            }
                            headerRightElement={
                                <TouchableOpacity onPress={this._onPressSearch}>
                                    <Image style={styles.searchButton} source={assets.icSearch} />
                                </TouchableOpacity>
                            }
                        />
                    }
                >
                    <PromotionsTabScreen navigation={this.props.navigation} article={articleMode} />
                </ScreenLayout>
            </ScreenContainer>
        );
    }
}

PromotionsDashboardScreen.propTypes = {
    navigation: PropTypes.shape({
        goBack: PropTypes.func,
        navigate: PropTypes.func,
    }),
    route: PropTypes.shape({
        params: PropTypes.shape({
            article: PropTypes.bool,
            redirect: PropTypes.shape({
                params: PropTypes.any,
                screen: PropTypes.any,
            }),
        }),
    }),
};
export default PromotionsDashboardScreen;

const styles = StyleSheet.create({
    searchButton: { height: 20, width: 20 },
});
