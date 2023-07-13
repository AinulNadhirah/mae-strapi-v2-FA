import React from "react";
import { Image, TouchableOpacity } from "react-native";
import PropTypes from "prop-types";

const BaseImageButton = ({ image, style, ...props }) => {
	return (
		<TouchableOpacity {...props}>
			<Image source={image} style={style} resizeMode="contain" />
		</TouchableOpacity>
	);
};

BaseImageButton.propTypes = {
	image: PropTypes.number.isRequired,
	style: PropTypes.object.isRequired
};

export default BaseImageButton;
