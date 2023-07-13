import { snap } from "@popmotion/popcorn";
import * as d3Shape from "d3-shape";
import PropTypes from "prop-types";
import React, { Component } from "react";
import {
    StyleSheet,
    View,
    Dimensions,
    Animated,
    TouchableOpacity,
    Image,
    TouchableWithoutFeedback,
} from "react-native";
import * as Animatable from "react-native-animatable";

import { BLACK, TRANSPARENT } from "@constants/colors";

import { generateHaptic } from "@utils";

import Assets from "@assets";

import Pie from "./Pie";

const { width } = Dimensions.get("screen");

const numberOfSegments = 10;
const wheelWidth = width * 1.5; // Change Wheel Size
const wheelHeight = width * 1.5; // Change Wheel Size
const tension = 150;
const friction = 7;
const oneTurn = 360;
const angleBySegment = oneTurn / numberOfSegments;

// unused. now in Pie
const makeWheel = (resData) => {
    console.log("makeWheel", resData);
    const data = Array.from({ length: numberOfSegments }).fill(1);
    const arcs = d3Shape.pie()(data);

    return arcs.map((arc, index) => {
        const instance = d3Shape
            .arc()
            .padAngle(0.0015)
            .outerRadius(width / 2.1)
            .innerRadius(20);

        return {
            path: instance(arc),
            // color: colors[index],
            color: BLACK,
            value: resData ? resData[index] : [], //Math.round(Math.random() * 10 + 1) * 200, //[200, 2200]
            centroid: instance.centroid(arc),
        };
    });
};

class SpinWheel extends Component {
    constructor(props) {
        super(props);

        this.state = {
            enabled: true,
            finished: false,
            spinning: false,
            winner: null,
        };
        console.log("test", this.props.restaurantsData);
        this._wheelPaths = makeWheel(this.props.restaurantsData);
        this._angle = new Animated.Value(0);
        this.spinWheelButton = new Animated.Value(1);
        this.angle = 0;
    }

    componentDidMount() {
        this._angle.addListener((event) => {
            if (this.props.isFocus && this.state.enabled) {
                this.setState({
                    enabled: false,
                    finished: false,
                    spinning: true,
                });
            }
            this.angle = event.value;
        });
    }

    _onPan = () => {
        if (!this.state.spinning && this.props.isFocus) {
            this.props.onWheelSpin();

            this.setState({
                spinning: true,
            });

            // call some haptic for fun
            generateHaptic("selection", true);

            Animated.decay(this._angle, {
                velocity: 1 + Math.random() * (0.7 - 0.2), //speed of spin wheel
                deceleration: 0.999,
                useNativeDriver: true,
            }).start(() => {
                const snapTo = snap(oneTurn / numberOfSegments);

                this._angle.setValue(this.angle % oneTurn);

                Animated.timing(this._angle, {
                    toValue: snapTo(this.angle),
                    duration: 1500, // duration of spin
                    useNativeDriver: true,
                }).start(() => {
                    const winnerIndex = this._getWinnerIndex();

                    if (this.props.isFocus) {
                        this.setState(
                            {
                                enabled: true,
                                finished: true,
                                spinning: false,
                                winner: this._wheelPaths[winnerIndex].value.shopName,
                            },
                            () => {
                                this._renderWinner();
                            }
                        );
                    }
                });
                // do something here;
            });
        }
    };

    _getWinnerIndex = () => {
        const deg = Math.abs(Math.round(this.angle % oneTurn));
        // wheel turning clockwise
        return (numberOfSegments - Math.floor(deg / angleBySegment)) % numberOfSegments;
    };

    _renderWinner = () => {
        //alert("the chosen one: " + this.state.winner);
        if (this.props.isFocus) {
            this.setState({ finished: true, enabled: false }, () => {
                const winnerIndex = this._getWinnerIndex();
                this.props.onCompleteSpin(this._wheelPaths[winnerIndex]?.value);
            });
        }
    };

    onPressIn = () => {
        if (!this.state.spinning) {
            Animated.spring(this.spinWheelButton, {
                toValue: 0.9,
                tension,
                friction,
                useNativeDriver: true,
            }).start();
        }
    };

    onPressOut = () => {
        if (!this.state.spinning) {
            Animated.spring(this.spinWheelButton, {
                toValue: 1,
                tension,
                friction,
                useNativeDriver: true,
            }).start();
        }
    };

    _renderSpinWheel = () => {
        return (
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={this._onPan}
                style={styles.spinWheelView}
            >
                <Animatable.View
                    style={styles.wheelBorderContainer}
                    animation={{
                        0: {
                            opacity: 0,
                            scale: 0.9,
                            transform: [
                                {
                                    translateY: 100,
                                },
                            ],
                        },
                        0.8: {
                            opacity: 1,
                            scale: 1.025,
                            transform: [
                                {
                                    translateY: -10,
                                },
                            ],
                        },
                        1: {
                            opacity: 1,
                            scale: 1,
                            transform: [
                                {
                                    translateY: 25,
                                },
                            ],
                        },
                    }}
                    duration={500}
                >
                    {/* <View style={styles.wheelBorderContainer}> */}
                    <View style={styles.wheelBorderInner}>
                        <Image source={Assets.wheelBorderBg} style={styles.wheelBorderImg} />
                    </View>
                    {/* </View> */}
                </Animatable.View>
                <Animatable.View
                    animation={{
                        0: {
                            opacity: 0,
                            scale: 0.9,
                            transform: [
                                {
                                    translateY: 100,
                                },
                            ],
                        },
                        0.8: {
                            opacity: 1,
                            scale: 1.025,
                            transform: [
                                {
                                    translateY: -10,
                                },
                            ],
                        },
                        1: {
                            opacity: 1,
                            scale: 1,
                            transform: [
                                {
                                    translateY: 0,
                                },
                            ],
                        },
                    }}
                    duration={500}
                >
                    {this._renderSvgWheel()}
                </Animatable.View>
                {/* {this.state.finished && this.state.enabled && this._renderWinner()} */}
                <Animatable.View
                    animation={{
                        0: {
                            opacity: 0,
                            transform: [
                                {
                                    translateY: 100,
                                },
                            ],
                        },
                        0.8: {
                            opacity: 1,
                            transform: [
                                {
                                    translateY: -10,
                                },
                            ],
                        },
                        1: {
                            opacity: 1,
                            transform: [
                                {
                                    translateY: 0,
                                },
                            ],
                        },
                    }}
                    duration={500}
                    delay={250}
                    style={styles.wheelButton}
                >
                    <TouchableWithoutFeedback
                        onPress={this._onPan}
                        onPressIn={this.onPressIn}
                        onPressOut={this.onPressOut}
                    >
                        <Animated.Image
                            style={[
                                styles.imagestyle,
                                {
                                    transform: [
                                        {
                                            scale: this.spinWheelButton,
                                        },
                                    ],
                                },
                            ]}
                            source={Assets.SpinButton}
                        />
                    </TouchableWithoutFeedback>
                </Animatable.View>
            </TouchableOpacity>
        );
    };

    render() {
        return <View style={styles.container}>{this._renderSpinWheel()}</View>;
    }

    getPriceRangeValue = (text) => {
        switch (text?.length) {
            case 4:
                return 26;
            case 3:
                return 25;
            case 2:
                return 20;
            default:
                return 15;
        }
    };

    getShopName = (name) => {
        const shopname = name.split(" ");
        return shopname;
    };
    getMerchantName = (name) => {
        const shopname = name.split(" ");
        return shopname.length >= 2 ? shopname[0] + " " + shopname[1] : shopname[0];
    };
    _renderSvgWheel = () => {
        // the data set ARRAY provided to render
        return (
            <View>
                {/* {this._renderKnob()} */}
                <Animated.View
                    style={[
                        styles.wheelContainer,
                        {
                            transform: [
                                {
                                    rotate: this._angle.interpolate({
                                        inputRange: [-oneTurn, 0, oneTurn],
                                        outputRange: [`-${oneTurn}deg`, `0deg`, `${oneTurn}deg`],
                                    }),
                                },
                            ],
                        },
                    ]}
                >
                    <Pie data={this.props.restaurantsData} />
                </Animated.View>
            </View>
        );
    };
}
SpinWheel.propTypes = {
    restaurantsData: PropTypes.array,
    onCompleteSpin: PropTypes.func,
    isLoading: PropTypes.bool,
    onWheelSpin: PropTypes.func,
    isFocus: PropTypes.bool,
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    imagestyle: {
        // height: 180,
        // width: 180,
        height: "100%",
        width: "100%",
    },
    spinWheelView: {
        alignItems: "center",
        backgroundColor: TRANSPARENT,
        bottom: 0,
        height: wheelHeight / 2,
        position: "absolute",
        width,
    },
    wheelBorderContainer: {
        alignItems: "center",
        bottom: 0,
        // bottom: -(wheelHeight / 2 + 28),
        height: wheelHeight / 2 + width * 0.128,
        left: 0,
        position: "absolute",
        right: 0,
    },
    wheelBorderImg: {
        height: "100%",
        width: "100%",
    },
    wheelBorderInner: {
        height: wheelHeight + 14,
        width: wheelWidth + 14,
    },
    wheelButton: {
        alignItems: "center",
        bottom: -64,
        height: 218,
        justifyContent: "center",
        position: "absolute",
        width: 218,
    },
    wheelContainer: {
        alignItems: "center",
        backgroundColor: TRANSPARENT,
        justifyContent: "center", // Gap between Lines
    },
});

//make this component available to the app
export default SpinWheel;
