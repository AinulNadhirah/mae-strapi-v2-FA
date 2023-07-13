import { StyleSheet } from 'react-native';
import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get("window").width;
const screenHight = Dimensions.get("window").height;


export default StyleSheet.create({
  
    TabungLabel: {
        color: "#000000",
        marginTop: "7%",
        marginLeft: "14%",
        width: 208,
        fontFamily: "montserrat",
        fontSize: 17,
        fontWeight: "600",
        fontStyle: "normal",
        lineHeight: 23,
        letterSpacing: 0,
    },
    DetailTextLabel: {
        fontSize: 23,
        marginTop: "3%",
        marginLeft: "14%",
        fontFamily: "montserrat",
        fontWeight: "300",
        fontStyle: "normal",
        lineHeight: 33,
        letterSpacing: -0.43,
        color: "#000000"
    },
    FirstImageView:{
        marginTop: "3%",
        marginLeft:"8%",
    //    backgroundColor:'red'
    },
    ThirdImageView:{
        marginTop: "3%",
        marginLeft:"3%",
       // backgroundColor:'red',
        width: 352,
        height: 293
    },
    RightImageView:{
        width: '90%',
        height: 70,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: "80%",
        marginBottom: "30%",
        bottom: 0,
        position: 'absolute',
        flexDirection: 'row',

    },
    TabungImage: {
        width: 230,
        height: 310

     },
     TabungFinelImage:{
        width: 352,
        height: 293
      
     }

   

});