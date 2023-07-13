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
    
    },
    pinView: {
        marginTop:30,
      },
      pinContainer:{
        borderColor: 'gray',
         backgroundColor:'gray',
         fontWeight: '100' 
      },
      EmailLabel:{
        color: "black",
        fontSize: 25,
        fontWeight: "bold",
        marginTop:150,
        marginLeft: 40,
    
    },
    TextLabel:{
        color: "black",
        fontSize: 25,
        fontWeight: "normal",
        marginTop:10,
        marginLeft: 40,
    
    },
});