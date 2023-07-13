import { StatusBar, Platform } from "react-native";
import DeviceInfo from "react-native-device-info";

export const getStatusBarMargin = () => {
	const deviceModel = DeviceInfo.getDeviceId();
	const phoneWithNotchList = [
		"iphone10,6",
		"iphone11,2",
		"iphone11,4",
		"iphone11,6",
		"iphone11,8",
		"iphone12,1",
		"iphone12,3",
		"iphone12,5"
	];
	const isNotchedPhone = phoneWithNotchList.includes(deviceModel.toLowerCase());
	if (isNotchedPhone) {
		const statusBarHeight = Platform.select({ ios: 44, android: StatusBar.currentHeight });
		return statusBarHeight;
	} else return 0;
};

export const getFooterMargin = () => {
	const deviceModel = DeviceInfo.getDeviceId();
	const phoneWithBottomHomeIndicator = [
		"iphone10,6",
		"iphone11,2",
		"iphone11,4",
		"iphone11,6",
		"iphone11,8",
		"iphone12,1",
		"iphone12,3",
		"iphone12,5"
	];
	const isPhoneWithBottomHomeIndicator = phoneWithBottomHomeIndicator.includes(deviceModel.toLowerCase());
	//TODO: Not sure if the correct value, need more enhancement
	if (isPhoneWithBottomHomeIndicator) return 34;
	else return 0;
};
