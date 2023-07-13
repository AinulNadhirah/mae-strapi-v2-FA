import React, { useCallback } from "react";
import { View, TouchableWithoutFeedback, StyleSheet } from "react-native";
import RNSlider from "react-native-slider";
import PropTypes from "prop-types";

let sliderContainerLayout;

const Slider = ({ onTap, ...props }) => {
	const _translateEventToSliderValue = useCallback(event => {
		const {
			nativeEvent: { locationX }
		} = event;
		const { width } = sliderContainerLayout;
		onTap(locationX / width);
	});

	const _onContainerRendered = useCallback(event => {
		const {
			nativeEvent: { layout }
		} = event;
		sliderContainerLayout = layout;
	});

	return (
		<View style={styles.container} onLayout={_onContainerRendered}>
			<TouchableWithoutFeedback onPressIn={_translateEventToSliderValue}>
				<RNSlider {...props} style={styles.slider} />
			</TouchableWithoutFeedback>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		alignItems: "center",
		justifyContent: "center",
		width: "100%"
	},
	slider: {
		height: 40,
		width: "100%"
	}
});

Slider.propTypes = {
	onTap: PropTypes.func
};

Slider.defaultProps = {
	onTap: () => {}
};

const Memoiz = React.memo(Slider);

export default Memoiz;
