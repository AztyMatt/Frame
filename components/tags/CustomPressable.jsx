import React from 'react'
import { Pressable, View, StyleSheet } from 'react-native'
import Theme from '../../assets/styles.js'
import CustomText from './CustomText.jsx'

const CustomPressable = ({ isInactiveWhen, styleButtonWithLabel, children, style, ...props }) => {
    const ComponentToRender = isInactiveWhen ? View : Pressable
    const combinedStyle = [styleButtonWithLabel && styles.btn, style]

    return (
    <ComponentToRender 
        {...props}
        style={[
            ...combinedStyle,
            { borderColor: Theme.colors[!isInactiveWhen ? 'primaryDarker' : 'secondary'] }
        ]}
    >
        {children 
            ? children
            : 
            <CustomText 
                style={[
                    styles.btnTxt,
                    { color: Theme.colors[!isInactiveWhen ? 'primary' : 'primaryDarker'] }
                ]}
            >
                {styleButtonWithLabel}
            </CustomText>}
    </ComponentToRender>
    )
}

const styles = StyleSheet.create({
    btn: {
        paddingHorizontal: 15,
        paddingVertical: 5,
    
        borderWidth: 1,
        borderRadius: 5,
    
        backgroundColor: Theme.colors.secondaryDarker,
    
        // marginTop: 10,
    },
    btnTxt: {
        fontWeight: 'bold', 
        textAlign: 'center', 
    }

    // seeMoreBtn: {
    //     paddingHorizontal: 15,
    //     paddingVertical: 5,
    
    //     borderWidth: 1,
    //     borderColor: Theme.colors.primaryDarker,
    //     borderRadius: 5,
        
    //     backgroundColor: Theme.colors.secondaryDarker
    // },
    // btn: {
    //     paddingHorizontal: 15,
    //     paddingVertical: 5,
    
    //     borderWidth: 1,
    //     borderColor: Theme.colors.primaryDarker,
    //     borderRadius: 5,
    
    //     backgroundColor: Theme.colors.secondaryDarker,
    
    //     marginTop: 10,
    // },
    // trailerBtn: {
    //     // height: 30,
    //     paddingHorizontal: 10, // defaut 15
    //     paddingVertical: 5,
    
    //     borderWidth: 1,
    //     // borderColor: Theme.colors[formattedData.trailer ? 'primary' : 'primaryDarker'],
    //     borderRadius: 5,
    
    //     backgroundColor: Theme.colors.secondaryDarker,
    
    //     marginRight: 10
    // },
})

export default CustomPressable
