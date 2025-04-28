import React, { useState, useEffect, forwardRef } from 'react'
import { StyleSheet, View, Image, Pressable, Animated } from 'react-native'
import Theme from '@/assets/styles.js'
import CustomText from '@/components/tags/CustomText.jsx'
import CustomPressable from '@/components/tags/CustomPressable.jsx'

const Header = forwardRef(({ navigation, title, absolute = false, titleOpacity = 1, opacity = 1, additionalBtn = false }, ref) => {
    const {onPress, isImage = true, source, onSourceChange} = additionalBtn

    const [currentSource, setCurrentSource] = useState(source)

    useEffect(() => {
        onSourceChange && onSourceChange(currentSource)
    }, [currentSource])

    return (
        <View ref={ref} style={[styles.headerContainer, absolute && styles.headerContainerAbsolute ]}>
            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()} style={styles.headerBtn}>
                    <Image
                        style={styles.headerBtnImg}
                        source={require('@/assets/icons/back.png')}
                    />
                    <View style={styles.headerBtnBackground}></View>
                </Pressable>
    
                <Animated.View style={{flex: 1, opacity: titleOpacity}}>
                    <CustomText numberOfLines={1} ellipsizeMode='tail' style={[styles.title, {textAlign: 'center'}]}>{ title }</CustomText>
                </Animated.View>
    
                <CustomPressable onPress={onPress} isInactiveWhen={!additionalBtn} style={styles.headerBtn}>
                    {additionalBtn ? (
                        <>
                            {isImage ? (
                                <Image
                                    style={styles.headerBtnImg}
                                    source={source}
                                />
                            ) : (
                                <CustomText style={styles.headerBtnTxt}>
                                    {source 
                                        ? typeof source === 'string' 
                                            ? source.toUpperCase()
                                            : source
                                        : '•••'
                                    }
                                </CustomText>
                            )}
                            <View style={styles.headerBtnBackground}></View>
                        </>
                    ) : (
                        null
                    )}
                </CustomPressable>
            </View>
            
            <Animated.View style={[styles.headerBackground, { opacity: opacity }]}></Animated.View>
        </View>
    )
})
export default Header

const styles = StyleSheet.create({
    headerContainer: {
        zIndex: 10,
        width: '100%',
        height: 55
    },
    headerContainerAbsolute: {
        flex: 1,
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'box-none',
    },
    header: {
        zIndex: 11,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 7.5
    },
    headerBtn: {
        height: 40,
        width: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        // borderRadius: '100%',
        // backgroundColor: Theme.colors.secondaryDarker
    },
    headerBtnImg: {
        zIndex: 13,
        height: 20,
        width: 20
    },
    headerBtnTxt: {
        zIndex: 13,
        color: Theme.colors.primary,
        fontSize: 15,
        fontWeight: 'bold'
    },
    headerBtnBackground: {
        zIndex: 12,
        position: 'absolute',
        height: '100%',
        width: '100%',
        borderRadius: 100,
        backgroundColor: Theme.colors.secondaryDarker,
        opacity: 0.5
    },
    headerBackground: {
        flex: 1,
        position: 'absolute',
        height: '100%',
        width: '100%',
        borderBottomWidth: 1,
        borderColor: Theme.colors.primary,
        backgroundColor: Theme.colors.secondaryDarker
    },

    title: {
        fontWeight: 'bold',
        fontSize: 22.5
    }
})