import React, { useState, useEffect, useCallback } from 'react'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { StyleSheet, View, ScrollView, Text, Image, SafeAreaView, Pressable, Linking } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import CustomText from '../../components/tags/CustomText.jsx'

import { api } from '../../services/api.js'

const Movie = () => {
    const navigation = useNavigation()
    const [apiResult, setApiResult] = useState(null)
    const [watchlist, setWatchlist] = useState([])

    const fetchData = async () => {
        try {
            const result = await api('/movie/now_playing?language=en-US&page=1') //%2Crelease_dates
            setApiResult(result)
        } catch (error) {
            // console.error('Error during API call:', error.message)
        }
    }

    const getWatchlist = async () => {
        try {
            const storagedWatchlist = await AsyncStorage.getItem('@userWatchlist')
            const parsedWatchlist = storagedWatchlist ? JSON.parse(storagedWatchlist) : []

            setWatchlist(parsedWatchlist)
            // console.log('My saved movies:', parsedWatchlist)
        } catch (error) {
            // console.error('Error retrieving saved movies:', error)
        }
    }
    
    useEffect(() => {
        fetchData()
    }, [])

    useFocusEffect(
        useCallback(() => {
            getWatchlist()
        }, [])
    )

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.banner}>
                <CustomText style={{ fontWeight: 'bold', fontSize: 25 }}>FRAME</CustomText>
            </View>
            <ScrollView style={styles.content}>
                <View style={{ marginTop: 25 }}>
                    <CustomText style={styles.sectionTitle}>Currently in theatres</CustomText>

                    {apiResult ? (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                            {apiResult.results.map((movie, index) => (
                                <Pressable onPress={() => navigation.navigate('Movie', { movieId: movie.id })} key={index} style={{ marginRight: 15 }}>
                                    <View style={styles.posterContainer}>
                                        {movie.poster_path ? (
                                            <Image
                                                style={styles.poster}
                                                resizeMode='contain'
                                                source={{
                                                    uri: `https://image.tmdb.org/t/p/original${movie.poster_path}`,
                                                }}
                                            />
                                        ) : (
                                            <CustomText>Erreur de chargement de l'image</CustomText>
                                        )}
                                    </View>
                                </Pressable>
                            ))}
                        </ScrollView>
                    ) : (
                        <CustomText>Chargement...</CustomText>
                    )}
                </View>

                {/* <CustomText>{JSON.stringify(watchlist, null, 2)}</CustomText> */}
                <View style={{ marginTop: 25 }}>
                    <CustomText style={styles.sectionTitle}>My watchlist</CustomText>

                    {watchlist ? (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                            {watchlist.map((movie, index) => (
                                <Pressable onPress={() => navigation.navigate('Movie', { movieId: movie.id })} key={index} style={{ marginRight: 15 }}>
                                    <View style={styles.posterContainer}>
                                        {movie.poster_path ? (
                                            <Image
                                                style={styles.poster}
                                                resizeMode='contain'
                                                source={{
                                                    uri: `https://image.tmdb.org/t/p/original${movie.poster_path}`,
                                                }}
                                            />
                                        ) : (
                                            <CustomText>Erreur de chargement de l'image</CustomText>
                                        )}
                                    </View>
                                </Pressable>
                            ))}
                        </ScrollView>
                    ) : (
                        <CustomText>Chargement...</CustomText>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}
export default Movie

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#101010' 
    },
    
    banner: {
        height: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomWidth: 1,
        borderColor: 'white'
    },
    content: {
        paddingHorizontal: 15
    },

    sectionTitle: {
        fontWeight: 'bold',
        fontSize: 20,
        marginBottom: 10
    },

    horizontalScroll: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap'
    },

    poster: {
        height: 144,
        width: 96,
        borderWidth: 1,
        borderColor: 'white',
        borderRadius: 10
    },
})