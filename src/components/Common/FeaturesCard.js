"use strict";

import React, { Component } from "react";
import PropTypes from "prop-types";
import { Text, View, TouchableOpacity, Image, Dimensions, StyleSheet } from "react-native";

const { height, width } = Dimensions.get("window");

class FeaturesCard extends Component {
	static propTypes = {
		onDonePress: PropTypes.func.isRequired,
		title: PropTypes.string,
		description: PropTypes.string,
		buttonText: PropTypes.string,
		image: PropTypes.number
	};

	constructor(props) {
		super(props);
	}
	onDonePress() {
		this.props.onDonePress();
	}

	render() {
		return (
			<TouchableOpacity
				style={styles.container}
				onPress={() => {
					this.onDonePress();
				}}
			>
				{/* Title */}
				<View style={styles.titleView}>
					<Text style={styles.titleText}>{this.props.title}</Text>
				</View>

				<View style={styles.mainView}>
					{/* Icon */}
					<View style={styles.imageView}>
						<Image
							accessible={true}
							testID={"fetureImage"}
							accessibilityLabel={"fetureImage"}
							style={styles.image}
							source={this.props.image}
						/>
					</View>

					{/* Description */}
					<View style={styles.textView}>
						<Text style={styles.descriptionText}>{this.props.description}</Text>
					</View>
				</View>
			</TouchableOpacity>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		width: (width * 85) / 100,
		// width: (width * 275) / 375,
		// height: (height * 150) / 667,
		marginTop: (height * 18) / 667,
		borderRadius: 8,
		backgroundColor: "#ffffff"
	},
	titleText: {
		height: 18,
		fontFamily: "montserrat",
		fontSize: 14,
		fontWeight: "600",
		fontStyle: "normal",
		lineHeight: 18,
		letterSpacing: -0.16,
		color: "#000000"
	},
	titleView: {
		width: "60%",
		// height: "20%",
		marginLeft: "5%",
		marginTop: "5%"
	},
	mainView: {
		paddingTop: 20,
		paddingBottom: 20,

		flexDirection: "row",
		width: "100%",
		flex: 1
	},
	imageView: {
		flexDirection: "column",
		width: "30%",
		marginLeft: "5%"
	},
	textView: {
		flexDirection: "column",
		width: "70%",
		marginRight: "5%",
		marginLeft: "5%",
		flex: 1
	},
	descriptionText: {
		fontFamily: "montserrat",
		fontSize: 14,
		fontWeight: "normal",
		fontStyle: "normal",
		lineHeight: 23,
		letterSpacing: -0.16,
		color: "#000000",
		marginLeft: "3%"
	},
	image: {
		width: 80,
		height: 80,
		marginTop: "3%"
	}
});

export { FeaturesCard };
