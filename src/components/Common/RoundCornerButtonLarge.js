import React from 'react'
import {Text, TouchableOpacity, View} from 'react-native'

const RoundCornerButtonLarge = ({onPress, text, backgroundColor}) => {
    return (
        <View style={Styles.budgetingContent}>
            <TouchableOpacity
                onPress={onPress}
                style={[
                    Styles.buttonStyle,
                    {
                        backgroundColor: backgroundColor != null ? backgroundColor : '#fff',
                    },
                ]}
                underlayColor={'#fff'}>
                <Text  style={Styles.textStyle}>{text}</Text>
            </TouchableOpacity>
        </View>
    )
}


const Styles = {
    textStyle: {
        textAlign: 'left',
        color: "#7c7c7c",
        fontSize: 15,
        fontFamily: 'montserrat',
        fontWeight: 'normal',
        justifyContent: 'flex-start',
        marginLeft: 5,
    },
   
    buttonStyle: {
        alignItems: 'center',
        justifyContent: 'center',
        alignContent: 'center',
        width: 275,
        height: 100,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 11,
    },
    budgetingContent: {
        borderRadius: 11,
    },
}
export {RoundCornerButtonLarge}
