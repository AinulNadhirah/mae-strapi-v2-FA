import { StyleSheet } from 'react-native';
import { Dimensions, } from 'react-native';
export const { width, height } = Dimensions.get('window');
import main, * as mainStyles from '../main';


export default StyleSheet.create({

    mainView: {
        width: width,
        height: height,
        backgroundColor: mainStyles.blueBackgroundColor
    },
    subView: {
        marginTop: 85 * height / 667,
        marginLeft: 35 * width / 375,
        width: 275 * width / 375,
    },
    setuptext: {
        color: 'black',
        fontFamily: mainStyles.montserratSemiBold,
        fontSize: 17,
        lineHeight: 23 * height / 667,
        textAlign: 'left',
        marginBottom:110*height/667
    },
    m2uView:{
        // height:69*height/667,
        flexDirection : 'row',
        alignItems : 'center',
        justifyContent :'center'
    },
    icon:{
        width:90*height/667,
        height:90*height/667,
        resizeMode : 'stretch'
    },
    description:{
        color: 'black',
        fontFamily: mainStyles.montserratSemiBold,
        fontSize: 17,
        lineHeight: 23 * height / 667,
        textAlign: 'left',
        width:212*width/375,
        marginLeft:13*width/375,
        
    },


});