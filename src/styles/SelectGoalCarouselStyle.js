import { StyleSheet} from 'react-native';
import {  itemWidthGoalSelect,entryBorderRadius } from "./main";



export default StyleSheet.create({
    goalSlide: {
        height: 250,
        width: itemWidthGoalSelect,
        paddingHorizontal: 1,
        left: 1,
        right: 1,
        overflow: 'visible', // for custom animations
        flexDirection: "row",
        backgroundColor: "red",
        borderTopLeftRadius: entryBorderRadius,
        borderTopRightRadius: entryBorderRadius,
        borderBottomLeftRadius: entryBorderRadius,
        borderBottomRightRadius: entryBorderRadius
      }, 
      goalSlideTouch: {
        height: 250,
        width: itemWidthGoalSelect,
        backgroundColor: "green",
        marginRight: -100
      },
      goalSlideImg: {
       
        alignItems: "center",
        justifyContent: "center"
      },
    
      imgWalking: {
        height: "5%",
        width: "5%"
      },
      goalSlideText: {
        flex: 1.2,
        alignItems: "center",
        justifyContent: "center"
      },
      goalSlideDecText: {
        color: "#58595b",
        fontSize: 18,
        fontWeight: "normal",
        textAlign: "justify",
        lineHeight: 30
      },
    

});