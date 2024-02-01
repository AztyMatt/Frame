import React, { useState, useEffect } from 'react'
import { useNavigation } from '@react-navigation/native'
import { StyleSheet, View, ScrollView, Text, Image, SafeAreaView, Pressable, Linking, TextInput } from 'react-native'
import CustomText from '../../components/tags/CustomText.jsx'

import { api } from '../../services/api.js'

const Research = () => {
    const navigation = useNavigation()
    const [apiResult, setApiResult] = useState(null)
    const [query, setQuery] = useState('')

    const fetchData = async () => {
        try {
            const result = await api(`/search/movie?query=${query}&include_adult=false&language=en-US&page=1`)
            setApiResult(result)
        } catch (error) {
            // console.error('Error during API call:', error.message)
        }
    }
    
    useEffect(() => {
        if (query.trim() !== '') {
            const timeout = setTimeout(() => {
                fetchData()
            }, 750)
    
            return () => {
                clearTimeout(timeout)
            }
        }
    }, [query])

    const formatReleaseDate = (date) => {
        return new Date(date).getFullYear()
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.content}>
                <View>
                    <TextInput
                        style={styles.searchBar}
                        placeholder='Research a movie'
                        placeholderTextColor='#B5B5B5'
                        value={query}
                        onChangeText={(newQuery) => setQuery(newQuery)}
                    />
                </View>

                {apiResult ? (
                    <View>
                        {apiResult.results.map((movie, index) => (
                            <Pressable onPress={() => navigation.navigate('Movie', { movieId: movie.id })} key={index} style={styles.card}>
                                {movie.poster_path ? (
                                    <Image
                                        style={styles.poster}
                                        resizeMode='contain'
                                        source={{
                                            uri: `https://image.tmdb.org/t/p/original${movie.poster_path}`,
                                        }}
                                    />
                                ) : (
                                    <CustomText>Erreur de chargement de l'image</CustomText> // Needs to be changed
                                )}

                                <View style={styles.infos}>
                                    <View style={styles.titleContainer}>
                                        <CustomText numberOfLines={1} ellipsizeMode='tail' style={styles.title}>{movie.title}</CustomText>
                                        <CustomText style={{marginLeft: 10}}>{formatReleaseDate(movie.release_date)}</CustomText>
                                    </View>

                                    <CustomText numberOfLines={4} ellipsizeMode='tail' style={styles.overview}>{movie.overview}</CustomText>
                                </View>
                            </Pressable>
                        ))}
                    </View>
                ) : (
                    null
                )}
            </ScrollView>
        </SafeAreaView>
    )
}
export default Research 

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#101010' 
    },

    content: {
        paddingHorizontal: 15
    },

    searchBar: {
        flex: 1,
        color: 'white',
        borderWidth: 1,
        borderColor: 'white',
        borderRadius: 5,
        padding: 10
    },

    card: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderColor: '#B5B5B5',
        paddingVertical: 10
    },
    infos: {
        flex: 1,
        height: '100%',
        paddingTop: 10,
        paddingHorizontal: 15
    },
    titleContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10
    },
    title: {
        flex: 1,
        fontWeight: 'bold',
        fontSize: 20
    },
    overview: {
        flexWrap: 'wrap',
        overflow: 'hidden'
    },

    poster: {
        height: 144,
        width: 96,
        borderWidth: 1,
        borderColor: 'white',
        borderRadius: 10
    },
})