import { StyleSheet } from 'react-native';
import { Dimensions, Image } from 'react-native';
export const { width, height } = Dimensions.get('window');
import * as mainStyles from '../main';

export default StyleSheet.create({
    mainView:{
        backgroundColor: mainStyles.blueBackgroundColor,
        height:height,
        width:width,
    },
    titleView:{
        marginTop:28*height/667,
        marginLeft:50*width/375,
        height:23*height/667
    },
    titletext:{
        fontFamily:mainStyles.montserratSemiBold,
        fontSize:17,
        lineHeight:23*height/667,
        color:'black'
    },
    descriptionView:{
        width:250*width/375,
        height:66*height/667,
        marginLeft:50*width/375,
        marginTop:2*height/667,
        marginRight:32*width/375
    },
    descriptionText:{
        fontFamily:mainStyles.montserratRegular,
        color:'black',
        fontSize:23,
        lineHeight:33*height/667
    },
    filterOptionsView:{
        marginTop:40*height/667,
        marginLeft:32*width/375,
        width:311*width/375,
        height:265*height/667
    },
    filterRow:{
        height:45*height/667,
        elevation:1,
        backgroundColor:'white',
        marginBottom:10*height/667,
        borderRadius:21*height/667,
        flexDirection:'row',
        alignItems:'center'
    },
    filterTextView:{
        marginLeft:27*width/375,
        height:23*height/667,
        width:250*width/375,
        marginRight:5*width/375
    },
    downArrowView:{
        width:15*width/375,
        height:8*height/667,
    },
    downArrowImage:{
        width:15*width/375,
        height:8*height/667,
        resizeMode:'contain'
    },
    tickView:{
        marginTop:55*height/667,
        width:65*height/667,
        height:65*height/667,
        marginLeft:295*width/375,
        marginBottom:33*height/667,
        alignItems:'center',
        justifyContent:'center'
    },
    tickImage:{
        width:70*height/667,
        height:70*height/667,
        // resizeMode:'stretch'
    },
    filterTextDefault:{
        fontFamily:mainStyles.montserratSemiBold,
        color:rgb(143,143,143),
        fontSize:13,
        lineHeight:23*height/667
    },
    filterText:{
        fontFamily:mainStyles.montserratSemiBold,
        color:'black',
        fontSize:17,
        lineHeight:23*height/667
    }

});