// import React from "react";
// import { StyleSheet, View, Dimensions } from "react-native";
// import PropTypes from "prop-types";
// import * as Animatable from "react-native-animatable";
// import { BottomTabBar, createTabNavigator } from "react-navigation-tabs";

// const { width, height } = Dimensions.get("window");

// const slideScreen = (prevIndex, currentIndex) => ({
// 	from: {
// 		translateX: -(prevIndex * width)
// 	},
// 	to: {
// 		translateX: -(currentIndex * width)
// 	}
// });

// const fadeInOut = (index, active) => {
// 	console.log("fade in out", index, active);

// 	if (index === active) {
// 		return {
// 			from: {
// 				opacity: 0
// 			},
// 			to: {
// 				opacity: 1
// 			}
// 		};
// 	}

// 	return {
// 		from: {
// 			opacity: 1
// 		},
// 		to: {
// 			opacity: 0
// 		}
// 	};
// };

// class AnimatedTabNavigationView extends React.Component {
// 	static propTypes = {
// 		navigation: PropTypes.object,
// 		renderScene: PropTypes.func
// 	};

// 	constructor(props) {
// 		super(props);
// 		const initialIndex = props.navigation.state.index;

// 		this.state = {
// 			currentIndex: initialIndex,
// 			previousIndex: 0,
// 			loaded: [initialIndex]
// 		};
// 	}

// 	static getDerivedStateFromProps(props, state) {
// 		const { index } = props.navigation.state;

// 		const mergeState = {
// 			loaded: state.loaded.includes(index) ? state.loaded : [...state.loaded, index]
// 		};

// 		if (index !== state.currentIndex) {
// 			return {
// 				...mergeState,
// 				currentIndex: props.navigation.state.index,
// 				previousIndex: state.currentIndex
// 			};
// 		}

// 		return mergeState;
// 	}

// 	animateScreen = (active, prev) => slideScreen(prev, active);

// 	_renderTabs = () => this.props.navigation.state.routes.map(this._renderTab);

// 	_renderTab = (route, index) => {
// 		const { currentIndex, loaded } = this.state;

// 		if (!loaded.includes(index)) {
// 			// Don't render a screen if we've never navigated to it
// 			return null;
// 		}

// 		const isFocused = currentIndex === index;

// 		return (
// 			// <Animatable.View
// 			<View
// 				// animation={fadeInOut(index, currentIndex)}
// 				// duration={500}
// 				// delay={index === currentIndex ? 200 : 0}
// 				style={
// 					{
// 						width,
// 						height
// 					}
// 					// isFocused ? styles.attached : styles.detached
// 				}
// 				pointerEvents={index === currentIndex ? "auto" : "none"}
// 				key={route.key}
// 			>
// 				{this.props.renderScene({ route })}
// 			</View>
// 			// </Animatable.View>
// 		);
// 	};

// 	render() {
// 		const { currentIndex, previousIndex } = this.state;

// 		return (
// 			<View style={styles.container}>
// 				<Animatable.View
// 					animation={this.animateScreen(currentIndex, previousIndex)}
// 					useNativeDriver
// 					duration={50}
// 					easing="ease-in-out-cubic"
// 					style={styles.tabScreenWrapper}
// 				>
// 					{this._renderTabs()}
// 				</Animatable.View>
// 				<TabBar {...this.props} />
// 			</View>
// 		);
// 	}
// }

// // https://github.com/react-navigation/react-navigation-tabs/blob/master/src/navigators/createBottomTabNavigator.js
// class TabBar extends React.Component {
// 	static propTypes = {
// 		tabBarComponent: PropTypes.element,
// 		tabBarOptions: PropTypes.object,
// 		navigation: PropTypes.object,
// 		screenProps: PropTypes.object,
// 		getLabelText: PropTypes.func,
// 		getAccessibilityLabel: PropTypes.func,
// 		getButtonComponent: PropTypes.func,
// 		getTestID: PropTypes.func,
// 		renderIcon: PropTypes.func,
// 		onTabPress: PropTypes.func,
// 		descriptors: PropTypes.object
// 	};

// 	render() {
// 		const {
// 			tabBarComponent: TabBarComponent = BottomTabBar,
// 			tabBarOptions,
// 			navigation,
// 			screenProps,
// 			getLabelText,
// 			getAccessibilityLabel,
// 			getButtonComponent,
// 			getTestID,
// 			renderIcon,
// 			onTabPress,
// 			descriptors
// 		} = this.props;

// 		const { state } = this.props.navigation;
// 		const route = state.routes[state.index];
// 		const descriptor = descriptors[route.key];
// 		const options = descriptor.options;

// 		if (options.tabBarVisible === false) {
// 			return null;
// 		}

// 		return (
// 			<TabBarComponent
// 				{...tabBarOptions}
// 				jumpTo={this._jumpTo}
// 				navigation={navigation}
// 				screenProps={screenProps}
// 				onTabPress={onTabPress}
// 				getLabelText={getLabelText}
// 				getButtonComponent={getButtonComponent}
// 				getAccessibilityLabel={getAccessibilityLabel}
// 				getTestID={getTestID}
// 				renderIcon={renderIcon}
// 			/>
// 		);
// 	}
// }

// const styles = StyleSheet.create({
// 	attached: {
// 		flex: 1
// 	},
// 	container: {
// 		flex: 1,
// 		overflow: "hidden"
// 	},
// 	detached: {
// 		flex: 1
// 		// top: 3000
// 	},
// 	tabScreenWrapper: {
// 		flex: 1,
// 		flexDirection: "row"
// 	}
// });

// export default createTabNavigator(AnimatedTabNavigationView);
