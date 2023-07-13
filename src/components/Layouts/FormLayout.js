import React from "react";
import { View, StyleSheet } from "react-native";
import PropTypes from "prop-types";

const FormLayout = ({ children, ...props }) => {
	return (
		<View style={styles.container} {...props}>
			{children}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "flex-start",
		paddingBottom: 36,
		paddingHorizontal: 12
	}
});

FormLayout.propTypes = {
	children: PropTypes.element.isRequired
};

const Memoiz = React.memo(FormLayout);

export default Memoiz;
