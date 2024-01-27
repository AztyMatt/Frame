import React, { useState, useEffect } from 'react'
import { StatusBar } from 'expo-status-bar'
import { View, StyleSheet, Text, Image, SafeAreaView, TouchableOpacity, Linking } from 'react-native'
import CustomText from '../components/tags/CustomText.jsx'
import { LinearGradient } from 'expo-linear-gradient'

import { api } from '../services/api.js'

export default function Movie() {
    const [apiResult, setApiResult] = useState(null)
    const [imageError, setImageError] = useState(false)

    const fetchData = async () => {
        try {
            const result = await api('/movie/787699?append_to_response=videos%2Crelease_dates&language=en-US')
            setApiResult(result)
        } catch (error) {
            console.error('Erreur lors de l\'appel à api:', error.message)
        }
    }

    const handleImageError = () => {
        setImageError(true)
    }

    const formatReleaseDate = (date) => {
        return new Date(apiResult.release_date).getFullYear()
    }

    const formatDuration = (duration) => {
        const hours = Math.floor(duration / 60)
        const minutes = duration % 60

        const hoursFormat = hours < 10 ? `0${hours}` : `${hours}`
        const minutesFormat = minutes < 10 ? `0${minutes}` : `${minutes}`

        return `${hoursFormat}h${minutesFormat}`
    }

    const handleLinkPress = (link) => {
        Linking.openURL(`https://www.youtube.com/watch?v=${ link }`);
    }
    
    useEffect(() => {
        fetchData()
    }, [])

    return (
            <View style={styles.container}>
                {apiResult ? (
                    <View>
                        <View style={styles.linearGradientContainer}>
                            <LinearGradient colors={['#101010', 'transparent']}>
                                <View style={styles.linearGradient}></View>
                            </LinearGradient>
                        </View>
                        {imageError ? (
                            <CustomText>Erreur de chargement de l'image</CustomText>
                        ) : (
                            <View>
                                <Image
                                style={styles.backdrop}
                                // resizeMode="contain"
                                source={{
                                    uri: `https://image.tmdb.org/t/p/original/${apiResult.backdrop_path}`,
                                }}
                                onError={handleImageError}
                            />
                            </View>
                        )}

                        <View style={styles.content}>
                            <View style={styles.preview}>
                                <View style={styles.infos}>
                                    <View style={styles.titleContainer}>
                                        <CustomText numberOfLines={2} ellipsizeMode="tail" style={styles.title}>{ apiResult.original_title }</CustomText>
                                    </View>

                                    <View style={styles.details}>
                                        <View>
                                            <View style={styles.directorContainer}>
                                                <CustomText>{ formatReleaseDate(apiResult.release_date) }</CustomText>
                                                <CustomText style={{ fontSize: 12.5}}> • DIRECTED BY</CustomText>
                                            </View>
                                            <CustomText style={{ fontWeight: 'bold', fontSize: 16 }}>Matthias Petit</CustomText>
                                        </View>

                                        <View style={styles.trailerContainer}>
                                            <TouchableOpacity onPress={() => handleLinkPress(apiResult.videos.results[0].key)} style={ styles.trailerButton }>
                                                <CustomText> ► TRAILER </CustomText>
                                            </TouchableOpacity>
                                            <CustomText style={{ marginLeft: 10 }}>{ formatDuration(apiResult.runtime) }</CustomText>
                                        </View>
                                    </View>
                                </View>

                                <View style={styles.posterContainer}>
                                    {imageError ? (
                                        <CustomText>Erreur de chargement de l'image</CustomText>
                                    ) : (
                                        <Image
                                            style={styles.poster}
                                            resizeMode="contain"
                                            source={{
                                                uri: `https://image.tmdb.org/t/p/original/${apiResult.poster_path}`,
                                            }}
                                            onError={handleImageError}
                                        />
                                    )}
                                </View>
                            </View>
                            
                            <View>
                                <CustomText>{apiResult.overview}</CustomText>
                            </View>
                        </View>
                    </View>
                ) : (
                    <CustomText>Chargement...</CustomText>
                )}
                <StatusBar style="auto" />
            </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#101010' 
    },

    linearGradientContainer: {
        zIndex: 1,
        position: 'absolute',
        top: 0,
        left: 0,
        height: 220,
        width: '100%',
        transform: [{rotate: '180deg'}]
    },
    linearGradient: {
        width: 420,
        height: 100
    },
    backdrop: {
        height: 220,
    },

    content: {
        zIndex: 2,
        paddingHorizontal: 15,
        transform: [{ translateY: -40 }]
    },

    preview: {
        height: 180,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'end',
        justifyContent: 'space-between',
        marginVertical: 15,
    },

    infos: {
        height: '100%',
        width: '65%',
        paddingTop: 10
    },

    titleContainer: {
        height: '37.5%',
        display: 'flex',
        justifyContent: 'flex-end'
    },
    title: {
        fontWeight: 'bold',
        fontSize: 22.5
    },

    details: {
        height: '62.5%',
        display: 'flex',
        justifyContent: 'space-between',
        paddingTop: 15,
        paddingBottom: 10 
    },
    directorContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center'
    },
    trailerContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center'
    },
    trailerButton: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderWidth: 1,
        borderColor: 'white',
        borderColor: 'white',
        borderRadius: 5
    },

    posterContainer: {
        height: '100%',
        width: '35%',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'flex-end'
    },
    poster: {
        height: '100%',
        width: '95%',
        borderWidth: 1,
        borderColor: 'white',
        borderColor: 'white',
        borderRadius: 10
    }
})