import React from "react";
import { View, StyleSheet, Text, FlatList } from "react-native";
import FrequentlyContactAvatar from "./FrequentlyContactAvatar";

const FrequentlyContactList = ({
	frequentlyContactListArray,
	title,
	onContactPress,
	onContactPressMulti,
	singleTag
}) => {
	const _renderItem = ({ item }) => {
		const {
			givenName,
			familyName,
			phoneNumbers,
			isSyncedThroughMaya,
			mayaUserId,
			isSelected,
			profilePicUrl,
			title
		} = item;
		return (
			<FrequentlyContactAvatar
				onContactAvatarPress={() => onContactPress(item)}
				onContactAvatarPressMulti={onContactPressMulti}
				givenName={givenName}
				familyName={familyName}
				phoneNumbers={phoneNumbers}
				isSyncedThroughMaya={isSyncedThroughMaya}
				mayaUserId={mayaUserId}
				profilePicUrl={profilePicUrl}
				isSelected={isSelected}
				singleTag={singleTag}
				item={item}
			/>
		);
	};

	const _renderSeparator = () => {
		return <View style={styles.separator} />;
	};

	return (
		<View style={styles.container}>
			<Text style={styles.titleText}>{title}</Text>
			<FlatList
				style={styles.flatList}
				data={frequentlyContactListArray}
				renderItem={_renderItem}
				keyExtractor={(item, index) => `${item.givenName}-${index}`}
				horizontal
				showsHorizontalScrollIndicator={false}
				ItemSeparatorComponent={_renderSeparator}
				ListFooterComponent={_renderSeparator}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		justifyContent: "flex-start",
		alignItems: "flex-start",
		// paddingBottom: 10,
		paddingLeft: 35
	},
	titleText: {
		fontFamily: "montserrat",
		fontSize: 13,
		color: "#000000"
		// fontWeight: "700"
	},
	flatList: {
		flexGrow: 1,
		marginTop: 20
	},
	separator: {
		width: 22,
		height: 58
	}
});

export default FrequentlyContactList;
