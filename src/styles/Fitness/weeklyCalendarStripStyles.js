import { StyleSheet } from 'react-native';
import { Dimensions, Image } from 'react-native';
const { width, height } = Dimensions.get('window');

export default StyleSheet.create({
    mainView: {
        width: width,       
        height: 58 * height/667,     
        alignItems: 'center',
        justifyContent: 'center',
    },
    dotsView: {
        flexDirection: 'row',
        width: 315 * width/375,
        height: 10 * width/375,
        marginLeft: 3 * width/375,    
        alignItems: 'center',
    },
    dateDayMainView: {
        flexDirection: 'row',
        width: 319.5 * width/375,
        height: 43 * height/667,
        marginTop: 5 * height/667,    
        alignItems: 'center',
        justifyContent: 'center',
    },

    //Dots Styles ...........................................................
    pastDot: {
        height: 8 * width/375,
        width: 8 * width/375,
        borderRadius: 4 * width/375,
        backgroundColor: '#4a90e2',
    },
    activeDot: {
        height: 10 * width/375,
        width: 10 * width/375,
        borderRadius: 5 * width/375,
        borderWidth: 3.5 * width/375,
        borderColor: '#4a90e2',
    },
    futureDot: {
        height: 8 * width/375,
        width: 8 * width/375,
        borderRadius: 4 * width/375,
        borderWidth: 1,
        borderColor: '#4a90e2',
    },
    inactiveDot: {
        height: 8 * width/375,
        width: 8 * width/375,
        borderRadius: 4 * width/375,
        borderWidth: 1,
        borderColor: 'transparent',
    },

    //Link Styles ...........................................................
    pastLink: {
        width: 42.5 * width/375,
        height: 2 * height/667,
        borderWidth: 1 * height/667,
        borderColor: '#4a90e2',
        backgroundColor: '#4a90e2',
    },
    futureLinkView: {
        flexDirection: 'row',
        width: 42.5 * width/375,
        height:  2 * height/667,
        opacity: 0.4,
    },
    futureLinkDash: {        
        width: 6 * width/375,
        height:  2 * height/667,
        backgroundColor: '#4a90e2',
    },
    futureLinkBlank: {        
        width: 4 * width/375,
        height:  2 * height/667,
        backgroundColor: 'transparent',
    },
    futureLinkLast: {        
        width: 3 * width/375,
        height:  2 * height/667,
        backgroundColor: '#4a90e2',
    },
    inactiveLink: {
        width: 42.5 * width/375,
        height: 2 * height/667,
        borderWidth: 1,
        borderColor: 'transparent',
        backgroundColor: 'transparent',
    },

    //Text Styles ...........................................................
    pastTextView: {
        height: 16 * width/375,
        width: 16 * width/375,     
        alignItems: 'center',
        justifyContent: 'center',
    },
    activeTextView: {
        height: 16 * width/375,
        width: 16 * width/375,     
        alignItems: 'center',
        justifyContent: 'center',
    },
    activeText: {
        fontFamily: "Montserrat-SemiBold",
        // fontWeight: '600',
        color: '#4a90e2',
    },
    futureTextView: {
        height: 16 * width/375,
        width: 16 * width/375,     
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0.3,
    },
    inactiveTextView: {
        height: 16 * width/375,
        width: 16 * width/375,     
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0.1,
    },
    inactiveText: {
        fontFamily: "Montserrat-SemiBold",
        // fontWeight: '600',
        color: 'black',
    },
}
)
