import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";

const InputField = ({
	label,
	value,
	onChangeText,
	secureTextEntry,
	keyboardType,
	editableType,
	placeholder,
	enabled,
	propInputCls,
	propLabelCls,
	maxLength,
	minLength,
	onSubmitEditing,
	returnKeyType,
	autoFocus,
	numberOfLines,
	multiline = false,
	testID,
	accessibilityLabel,
	focusEvent
}) => {
	return (
		<View style={styles.containerStyle}>
			<Text style={propLabelCls ? propLabelCls : styles.labelCls}>{label}</Text>
			<TextInput
				// eslint-disable-next-line react/jsx-no-bind
				ref={ref => (this._inputElement = ref)}
				autoCorrect={false}
				autoFocus={autoFocus}
				placeholder={placeholder}
				placeholderTextColor="rgb(199,199,205)"
				onSubmitEditing={onSubmitEditing}
				style={propInputCls ? propInputCls : styles.inputStyle}
				value={value}
				keyboardType={keyboardType}
				editable={editableType === null ? true : editableType}
				secureTextEntry={secureTextEntry === "true"}
				onChangeText={onChangeText}
				enabled={enabled}
				maxLength={maxLength}
				minLength={minLength}
				returnKeyType={returnKeyType}
				testID={testID}
				accessibilityLabel={accessibilityLabel}
				numberOfLines={numberOfLines}
				autoCapitalize="none"
				onFocus={event => {
					focusEvent ? focusEvent(event,this._inputElement) : () => {}
				}}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	containerStyle: {
		height: "100%",
		width: "100%"
	},
	inputStyle: {
		borderRadius: 1,
		color: "black",
		flex: 1,
		fontFamily: "montserrat",
		fontSize: 20,
		fontWeight: "normal",
		fontFamily: "montserrat",
		width: '100%',
		flex: 1
	},
	labelCls: {
		color: "#000000",
		marginTop: "5%",	
		width: '100%',
		fontFamily: "montserrat",
		fontSize: 17,
		fontStyle: "normal",
		fontWeight: "600",
		letterSpacing: 0,
		lineHeight: 23,
		marginTop: "5%"
	}
});

export { InputField };
