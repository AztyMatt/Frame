import React, { useState, useEffect } from 'react'
import { useNavigation } from '@react-navigation/native'
import { StyleSheet, View, ScrollView, Text, Image, SafeAreaView, Pressable, Linking } from 'react-native'
import CustomText from '../../components/tags/CustomText.jsx'

import { api } from '../../services/api.js'

const Movie = () => {
    const navigation = useNavigation()
    const [apiResult, setApiResult] = useState(null)

    const fetchData = async () => {
        try {
            const result = await api('/movie/now_playing?language=en-US&page=1') //%2Crelease_dates
            setApiResult(result)
        } catch (error) {
            // console.error('Erreur lors de l\'appel à api:', error.message)
        }
    }
    
    useEffect(() => {
        fetchData()

        if (apiResult) {
            
        }
    }, [apiResult])

    return (
        <SafeAreaView style={styles.container}>
            <View style={{ height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottomWidth: 1, borderColor: 'white', marginBottom: 30 }}>
                <CustomText style={{ fontWeight: 'bold', fontSize: 25 }}>FRAME</CustomText>
            </View>
            <ScrollView style={styles.content}>
                <View>
                    <CustomText style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 10 }}>Currently in theatres</CustomText>

                    {apiResult ? (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
                            {apiResult.results.map((movie, index) => (
                                <Pressable onPress={() => navigation.navigate('Movie', { movieId: movie.id })} key={index} style={{ height: 156, marginRight: 15 }}>
                                    <View style={styles.posterContainer}>
                                        {movie.poster_path ? (
                                            <Image
                                                style={styles.poster}
                                                resizeMode="contain"
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

            <ScrollView style={styles.content}>
                <View>
                    <CustomText style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 10 }}>Watchlist</CustomText>

                    {apiResult ? (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
                            {apiResult.results.map((movie, index) => (
                                <View key={index} style={{ height: 156, marginRight: 15 }}>
                                    {/* <CustomText>{JSON.stringify(movie.poster_path, null, 2)}</CustomText> */}
                                    <View style={styles.posterContainer}>
                                        {movie.poster_path ? (
                                            <Image
                                                style={styles.poster}
                                                resizeMode="contain"
                                                source={{
                                                    uri: `https://image.tmdb.org/t/p/original${movie.poster_path}`,
                                                }}
                                            />
                                        ) : (
                                            <CustomText>Erreur de chargement de l'image</CustomText>
                                        )}
                                    </View>
                                </View>
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

const backdropHeight = 220
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#101010' 
    },

    
    content: {
        paddingHorizontal: 15,
    },

    // posterContainer: {
    //     height: '100%',
    //     width: '35%',
    // },
    poster: {
        height: 144,
        width: 96,
        borderWidth: 1,
        borderColor: 'white',
        borderRadius: 10
    },
})