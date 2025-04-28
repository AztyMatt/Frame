import React from 'react'
import { Pressable, View, StyleSheet } from 'react-native'
import Theme from '@/assets/styles.js'
import CustomText from '@/components/tags/CustomText.jsx'

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
})

export default CustomPressable
