import React, { Component } from "react";
import { StyleSheet, View } from "react-native";
import Swiper from "react-native-swiper";
import PropTypes from "prop-types";
import ModuleIntroductionScreenTemplate from "@components/ScreenTemplates/ModuleIntroductionScreenTemplate";
import * as navigationConstant from "@navigation/navigationConstant";

export default class IntroductionScreen extends Component {
    static propTypes = {
        navigation: PropTypes.object.isRequired,
    };

    contents = [
        {
            title: "Learn and earn",
            summary: `Understand your spending with insights and recommendations.`,
            illustration: require("@assets/tracker/introduction_illustration_one.png"),
        },
        {
            title: "Stay on top",
            summary: `Get the bigger picture on your finances and spending habits to understand your money's true potential.`,
            illustration: require("@assets/tracker/introduction_illustration_two.png"),
        },
        {
            title: "Take control",
            summary: `Track your money's ins and outs with a dashboard that's customised to your needs.`,
            illustration: require("@assets/tracker/introduction_illustration_three.png"),
        },
    ];

    _setSwiperReference = (ref) => {
        this.swiperReference = ref;
    };

    _onNextButtonPressed = (index) => {
        if (this.contents.length - 1 === index) this._navigateToTrackerDashboard();
        else this.swiperReference.scrollBy(1, true);
    };

    _navigateToTrackerDashboard = () => this.props.navigation.navigate("ToggleWidgetsScreen");

    render() {
        return (
            <Swiper
                loop={false}
                showsPagination={false}
                style={styles.wrapper}
                ref={this._setSwiperReference}
            >
                {this.contents.map((content, index) => {
                    const { title, summary, illustration } = content;
                    return (
                        <View style={styles.swiperItem} key={`intro-${index}`}>
                            <ModuleIntroductionScreenTemplate
                                title={title}
                                summary={summary}
                                backgroundImage={illustration}
                                stepperCurrentIndex={index}
                                totalStepper={this.contents.length}
                                hideSkipButton={this.contents.length - 1 === index}
                                // eslint-disable-next-line react/jsx-no-bind
                                onNextPressed={this._onNextButtonPressed}
                                onSkipPressed={this._navigateToTrackerDashboard}
                                buttonTitle={"Next"}
                            />
                        </View>
                    );
                })}
            </Swiper>
        );
    }
}

const styles = StyleSheet.create({
    swiperItem: {
        flex: 1,
    },
    wrapper: {},
});
