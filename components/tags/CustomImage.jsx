import React, { useState, useCallback } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import { StyleSheet, Image, View } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { capitalizeFirstLetter } from '../../utils.js'
import Theme from '../../assets/styles.js'
import CustomText from './CustomText.jsx'

const throwError = (message) => { throw new Error(message) }

const CustomImage = ({ source, style, resizeMode, fallback, fallbackContent }) => {
    const [poster, setPoster] = useState(null)

    const handlePosterCase = async () => {
        if (source && typeof source === 'object') {
            source.poster_path === undefined && throwError('poster_path is undefined, it is required if an object is provided as the source.')
            source.movieId === undefined && throwError('movieId is undefined, it is required if an object is provided as the source.')
    
            const customPoster = JSON.parse(await AsyncStorage.getItem(`@moviePoster-ID:${source.movieId}`))
            setPoster(customPoster ? customPoster.poster_path : source.poster_path)
        }
    }

    useFocusEffect(
        useCallback(() => {
            handlePosterCase()
        }, [source])
    )

    const fallbacks = {
        Default: (fallbackSource) => () => (
            <Image style={style} resizeMode={resizeMode} source={fallbackSource} />
        ),

        Poster: (movieTitle) => () => (
            <View style={style}>
                <Image
                    style={{width: '100%', height: '100%'}}
                    resizeMode={resizeMode}
                    source={require('../../assets/poster.png')}
                />
                <View style={[styles.center, { position: 'absolute', padding: 10 }]}>
                    <CustomText numberOfLines={2} ellipsizeMode='tail' style={{fontWeight: 'bold'}}>
                        {movieTitle}
                    </CustomText>
                </View>
            </View>
        ),
        Provider: () => (
            <View style={style}>
                <View style={[styles.center, {}]}>
                    <CustomText>?</CustomText>
                </View>
            </View>
        ),
        CollectionBackdrop: () => (
            <View style={{width: '100%', height: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                <Image
                    style={{height: '100%', transform: [{ scaleX: -1 }]}}
                    resizeMode={resizeMode}
                    source={require('../../assets/poster.png')}
                />
                <Image
                    style={{height: '100%', transform: [{ scaleX: -1 }]}}
                    resizeMode={resizeMode}
                    source={require('../../assets/poster.png')}
                />
                <View style={{position: 'absolute', width: '100%', height: '100%', top: 0, right: 0, paddingHorizontal: 50}}>
                    <View style={{backgroundColor: Theme.colors.secondaryDarker, width: '100%', height: '100%'}}></View>
                </View>
            </View>
        )
    }

    const CreateCustomFallback = () => {
        if (fallback) {
            const fallbackFunction = fallbacks[capitalizeFirstLetter(fallback)]

            if (fallbackFunction.length !== 0 && !fallbackContent) {
                throw new Error('fallbackContent is required when using a fallback with parameters.')
            }
    
            return typeof fallback === 'string' && fallbackFunction
                    ? fallbackFunction.length !== 0
                        ? fallbackFunction(fallbackContent)
                        : fallbackFunction
                    : null
        }
    }
    const CustomFallback = CreateCustomFallback() // Clearer than using IIFE

    return (
        source ? (
            <Image style={style} resizeMode={resizeMode} source={{uri: `https://image.tmdb.org/t/p/original${poster || source}`}} />
        ) : (
            fallback ? (
                CustomFallback && <CustomFallback />
            ) : (
                null
            )
        )
    )
}
export default CustomImage

const styles = StyleSheet.create({
    center: {
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    }
})