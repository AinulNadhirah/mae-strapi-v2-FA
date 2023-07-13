import React from "react";
import { Image, StyleSheet } from "react-native";
import PropTypes from "prop-types";

const PollImageFeedbackCard = ({ imageUrl }) => <Image source={{ uri: imageUrl }} style={styles.container} />;

const styles = StyleSheet.create({
	container: {
		height: 333,
		width: "100%"
	}
});

PollImageFeedbackCard.propTypes = {
	imageUrl: PropTypes.string.isRequired
};

const Memoiz = React.memo(PollImageFeedbackCard);

export default Memoiz;
