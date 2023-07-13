import { StyleSheet} from 'react-native';
import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get("window").width;
const screenHight = Dimensions.get("window").height;


export default StyleSheet.create({
    LifestyleGoals:{
        color: "black",
        fontSize: 30,
        fontWeight: "normal",
        marginTop:screenHight/2-50,
        marginLeft: 40,
    
    }
});