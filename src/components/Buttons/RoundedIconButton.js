import React from "react";
import { StyleSheet, Image, TouchableOpacity } from "react-native";
import PropTypes from "prop-types";

const RoundedIconButton = ({ icon, ...props }) => (
	<TouchableOpacity style={styles.container} {...props}>
		<Image source={icon} style={styles.image} />
	</TouchableOpacity>
);

const WHITE = "#ffffff";

const SHADOW_COLOR = "rgba(0, 0, 0, 0.12)";

const styles = StyleSheet.create({
	container: {
		alignItems: "center",
		backgroundColor: WHITE,
		borderRadius: 24,
		elevation: 5,
		height: 48,
		justifyContent: "center",
		shadowColor: SHADOW_COLOR,
		shadowOffset: {
			width: 0,
			height: 4
		},
		shadowOpacity: 1,
		shadowRadius: 8,
		width: 48
	},
	image: {
		height: 32,
		width: 32
	}
});

RoundedIconButton.propTypes = {
	icon: PropTypes.number.isRequired
};

const Memoiz = React.memo(RoundedIconButton);

export default Memoiz;
