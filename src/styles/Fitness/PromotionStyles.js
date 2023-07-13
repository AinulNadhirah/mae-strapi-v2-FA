import { StyleSheet } from 'react-native';
import { Dimensions, Image } from 'react-native';
export const { width, height } = Dimensions.get('window');

export default StyleSheet.create({
    cardEndSpace: {
        height: height * 50 / 667
    }
})