import React from "react";
import { StyleSheet, View, Dimensions, FlatList, Text } from "react-native";
import FlatListDefaultItem from "./FlatListDefaultItem";
export const { width, height } = Dimensions.get("window");

const FlatListCustom = ({ data, onItemPress, refresh }) => {
	console.log("data:", data);
	const _renderItem = ({ item, index }) => {
		const {
			givenName,
			familyName,
			middleName,
			phoneNumbers,
			isSyncedThroughMaya,
			profilePicUrl,
			isSelected,
			mayaUserId,
			id,
			suffix
		} = item;
		return (
			<FlatListDefaultItem
				givenName={givenName}
				familyName={familyName}
				middleName={middleName}
				suffix={suffix}
				onContactPress={onItemPress}
				phoneNumbers={phoneNumbers}
				isSyncedThroughMaya={isSyncedThroughMaya}
				profilePicUrl={profilePicUrl}
				isSelected={isSelected}
				mayaUserId={mayaUserId}
				key={index}
				itemIndex={index}
				id={id}
			/>
		);
	};

	return (
		<View
			style={styles.container}
			onLayout={event => {
				listYCoordinates = event.nativeEvent.layout.y;
			}}
		>
			<FlatList
				extraData={refresh}
				data={data}
				keyExtractor={(_, index) => `id${index}`}
				renderItem={_renderItem}
				maxToRenderPerBatch={1000}
				windowSize={30}
				updateCellsBatchingPeriod={1}
				initialNumToRender={50}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	FlatList: {
		flexGrow: 1,
		justifyContent: "flex-start"
	},
	container: {
		flex: 1,
		backgroundColor: "#efeff4"
	}
});

export default FlatListCustom;
