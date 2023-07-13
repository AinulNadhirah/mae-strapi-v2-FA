import _ from "lodash";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { StyleSheet, View, Image, Dimensions } from "react-native";
import * as Animatable from "react-native-animatable";
import Swiper from "react-native-swiper";

import { MERCHANT_LISTING } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import { TouchableSpring, Animated } from "@components/Animations/TouchableSpring";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";

import { withModelContext } from "@context";

import { BLACK, MEDIUM_GREY, INACTIVE_COLOR, ACTIVE_COLOR } from "@constants/colors";

import assets from "@assets";

const { width } = Dimensions.get("window");

class ViewAllCraving extends Component {
    static propTypes = {
        route: PropTypes.object,
        navigation: PropTypes.object,
    };

    constructor(props) {
        super(props);

        this.state = {
            cravingData: this.props.route?.params?.cravingData ?? [],
            chunk: [],
        };
    }

    componentDidMount() {
        try {
            // console.log("this.state.cravingData", this.state.cravingData);
            const chunk = _.chunk(this.state.cravingData, 15); // 15 per page
            // console.log("chunk", chunk);
            let lastChunk = chunk[chunk.length - 1]; // we artificially pump empty tiles on last page
            if (lastChunk.length < 16) {
                lastChunk = lastChunk.concat(
                    Array(15 - lastChunk.length).fill({ categoryDefaultLogo: "", categoryName: "" })
                );
                chunk[chunk.length - 1] = lastChunk;
            }
            // eslint-disable-next-line react/no-did-mount-set-state
            this.setState({ chunk });
        } catch (e) {
            // do nothing
        }
    }
    onBackTap = () => {
        this.props.navigation.goBack();
    };

    onPress = (item) => {
        if (item.categoryName && item.categoryId) {
            this.props.navigation.navigate(MERCHANT_LISTING, {
                title: item?.categoryName,
                filterScreenParam: {
                    cuisinesTypes: [item.categoryId],
                },
                isShowFilter: true,
            });
        }
    };

    render() {
        return (
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                <ScreenLayout
                    header={
                        <HeaderLayout
                            backgroundColor={MEDIUM_GREY}
                            headerLeftElement={<HeaderBackButton onPress={this.onBackTap} />}
                            headerCenterElement={
                                <Typo
                                    fontSize={16}
                                    fontWeight="600"
                                    color={BLACK}
                                    lineHeight={19}
                                    text="What are you craving?"
                                />
                            }
                        />
                    }
                    useSafeArea
                    neverForceInset={["bottom"]}
                    paddingLeft={0}
                    paddingRight={0}
                    paddingBottom={30}
                    paddingTop={0}
                >
                    <Swiper
                        animated
                        // height={214}
                        loop={false}
                        key={2}
                        paginationStyle={styles.swiperPagination}
                        dot={<View style={styles.swiperDot} />}
                        activeDot={
                            <Animatable.View
                                animation="bounceIn"
                                duration={750}
                                style={styles.swiperActiveDot}
                            />
                        }
                    >
                        {this.state.chunk.map((page, index) => {
                            return (
                                <View style={styles.pageContainer} key={`${index}`}>
                                    {page.slice(0, 15).map((obj, index) => {
                                        return (
                                            <TouchableSpring
                                                scaleTo={0.95}
                                                // eslint-disable-next-line react/jsx-no-bind
                                                onPress={() => this.onPress(obj)}
                                                key={`${index}`}
                                            >
                                                {({ animateProp }) => (
                                                    <Animated.View
                                                        style={{
                                                            transform: [
                                                                {
                                                                    scale: animateProp,
                                                                },
                                                            ],
                                                        }}
                                                    >
                                                        <View
                                                            style={[
                                                                styles.actionButtonContainer,
                                                                { width: (width - 40) / 3 },
                                                            ]}
                                                        >
                                                            {obj.categoryName ? (
                                                                <Image
                                                                    style={
                                                                        styles.actionButtonIconImg
                                                                    }
                                                                    source={
                                                                        obj?.categoryDefaultLogo
                                                                            ? {
                                                                                  uri: obj.categoryDefaultLogo,
                                                                              }
                                                                            : assets.icMAE
                                                                    }
                                                                />
                                                            ) : (
                                                                <View
                                                                    style={
                                                                        styles.actionButtonIconImg
                                                                    }
                                                                />
                                                            )}
                                                            <View style={styles.actionButtonTitle}>
                                                                <Typo
                                                                    text={obj.categoryName}
                                                                    fontSize={12}
                                                                    lineHeight={14}
                                                                    fontWeight="normal"
                                                                    numberOfLines={2}
                                                                    color={BLACK}
                                                                />
                                                            </View>
                                                        </View>
                                                    </Animated.View>
                                                )}
                                            </TouchableSpring>
                                        );
                                    })}
                                </View>
                            );
                        })}
                    </Swiper>
                </ScreenLayout>
            </ScreenContainer>
        );
    }
}

const styles = StyleSheet.create({
    actionButtonContainer: {
        alignItems: "center",
        height: 88,
        justifyContent: "flex-start",
        // marginBottom: 40,
        paddingHorizontal: 8,
        paddingVertical: 14,
    },
    actionButtonIconImg: {
        height: 36,
        marginBottom: 6,
        width: 36,
    },
    actionButtonTitle: {
        height: 28,
        justifyContent: "center",
    },
    pageContainer: {
        alignContent: "space-between",
        flexDirection: "row",
        flexWrap: "wrap",
        flex: 1,
        marginBottom: 60,
        marginHorizontal: 20,
        marginTop: 30,
    },
    swiperActiveDot: {
        backgroundColor: ACTIVE_COLOR,
        borderRadius: 3,
        height: 6,
        marginHorizontal: 4,
        width: 6,
    },
    swiperDot: {
        backgroundColor: INACTIVE_COLOR,
        borderRadius: 3,
        height: 6,
        marginHorizontal: 4,
        width: 6,
    },
    swiperPagination: {
        bottom: 16,
    },
});

export default withModelContext(ViewAllCraving);
