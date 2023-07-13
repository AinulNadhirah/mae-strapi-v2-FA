import { StyleSheet } from "react-native";
import { Dimensions, Image } from "react-native";
import { isAbsolute } from "path";
export const { width, height } = Dimensions.get("window");

export default StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    backgroundImage: {
        width: '100%', 
        height: '100%'
    },
    containerBottom: {
        flex: 1,
        justifyContent: 'flex-end',
        marginBottom: 66,
        alignItems: 'center'
    },
    containerTitle: {
        marginBottom: 10
    },
    containerDesc: {
        marginBottom: 20,
        marginHorizontal: width * 0.12
    }
});