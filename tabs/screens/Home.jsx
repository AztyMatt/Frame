import React, { useState, useEffect, useCallback } from 'react'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { StyleSheet, View, ScrollView, Text, Image, SafeAreaView, Pressable } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { LinearGradient } from 'expo-linear-gradient'
import { formatReleaseDate, handleTrailerLink } from '../../utils.js'
import Theme from '../../assets/styles.js'
import CustomText from '../../components/tags/CustomText.jsx'
import MoviesHorizontalList from '../../components/MoviesHorizontalList.jsx'

import { api } from '../../services/api.js'

const Home = () => {
    const navigation = useNavigation()
    
    const [nowPlaying, setNowPlaying] = useState(null)
    const [upcoming, setUpcoming] = useState(null)

    const [firstUpcoming, setFirstUpcoming] = useState(null)
    const [watchlist, setWatchlist] = useState([])

    const handleMainTrailerLink = (id) => {
        const fetchVideos = async () => {
            try {
                const result = await api(`/movie/${id}/videos?language=en-US`) //%2Crelease_dates
                const trailer = result.results.find(
                    video => video.type === 'Trailer'
                )

                handleTrailerLink(trailer)
            } catch (error) {
                // console.error('Error during API call:', error.message)
            }
        }
        fetchVideos()
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
        const fetchNowPlaying = async () => {
            try {
                const result = await api('/movie/now_playing?language=en-US&page=1') //%2Crelease_dates
                setNowPlaying(result)
            } catch (error) {
                // console.error('Error during API call:', error.message)
            }
        }
        fetchNowPlaying()

        const fetchUpcoming = async () => {
            const currentDate = new Date()

            const oneMonthLater = new Date(currentDate) // Maybe a better way
            oneMonthLater.setMonth(oneMonthLater.getMonth() + 1)

            try {
                const result = await api(
                    `/discover/movie?include_adult=false&include_video=false
                        &language=en-US
                        &page=1
                        &primary_release_date.gte=${formatReleaseDate(currentDate)}
                        &primary_release_date.lte=${formatReleaseDate(oneMonthLater)}
                        &region=en
                        &sort_by=popularity.desc`
                )
                setUpcoming(result)

                setFirstUpcoming(result.results[0])
            } catch (error) {
                // console.error('Error during API call:', error.message)
            }
        }
        fetchUpcoming()
    }, [])

    useFocusEffect(
        useCallback(() => {
            getWatchlist()
        }, [])
    )

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={{ fontWeight: 'bold', fontSize: 25, color: Theme.colors.primary }}>FRAME</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {firstUpcoming ? (
                    <Pressable onPress={() => navigation.navigate('Movie', { movieId: firstUpcoming.id })} style={{ marginBottom: 5 }}>
                        <View style={styles.bannerContainer}>
                            
                            <View style={styles.banner}>
                                <View style={styles.titleContainer}>
                                    <View style={styles.titleUnderline}>
                                        <CustomText numberOfLines={1} ellipsizeMode='tail' style={styles.title}>{ firstUpcoming.title }</CustomText>
                                    </View>
                                </View>
                                <Pressable onPress={() => handleMainTrailerLink(firstUpcoming.id)} style={[styles.trailerButton, {backgroundColor: Theme.colors.secondaryDarker }]}>
                                    <CustomText> ► TRAILER </CustomText>
                                </Pressable>
                            </View>
            
                            <View style={[styles.linearGradientContainer, { height: '100%' }]}>
                                <LinearGradient colors={[Theme.colors.secondaryDarker, 'transparent']}>
                                    <View style={[styles.linearGradient, { height: 100 }]}></View>
                                </LinearGradient>
                            </View>

                        </View>

                        {firstUpcoming.backdrop_path ? (
                            <Image
                                style={styles.backdrop}
                                // resizeMode='contain'
                                source={{
                                    uri: `https://image.tmdb.org/t/p/original/${firstUpcoming.backdrop_path}`,
                                }}
                            />
                        ) : (
                            null // Future skeleton
                        )}
                    </Pressable> 
                ) : (
                    null // Future skeleton
                )}

                <View style={styles.content}>
                    {nowPlaying ? (
                        <View style={{ marginVertical: 25 }}>
                            <CustomText style={styles.sectionTitle}>►  Currently in theatres</CustomText>
                            <MoviesHorizontalList movies={nowPlaying.results} navigation={navigation}></MoviesHorizontalList>
                        </View>
                    ) : (
                        null // Future skeleton
                    )}

                    {upcoming ? (
                        <>
                            <View style={styles.sectionSeparator}></View>

                            <View style={{ marginVertical: 25 }}>
                                <CustomText style={styles.sectionTitle}>►  Upcoming this month</CustomText>
                                <MoviesHorizontalList movies={upcoming.results} navigation={navigation}></MoviesHorizontalList>
                            </View>
                        </>
                    ) : (
                        null // Future skeleton
                    )}

                    {watchlist && watchlist.length > 0 ? (
                        <>
                            <View style={styles.sectionSeparator}></View>

                            <View style={{ marginVertical: 25 }}>
                                <CustomText style={styles.sectionTitle}>►  My watchlist</CustomText>
                                <MoviesHorizontalList movies={watchlist} navigation={navigation}></MoviesHorizontalList>
                            </View>
                        </>
                    ) : (
                        null // Future skeleton
                    )}
                </View>
    
            </ScrollView>
        </SafeAreaView>
    )
}
export default Home

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.secondaryDarker
    },
    
    header: {
        height: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomWidth: 1,
        borderColor: Theme.colors.primary
    },

    bannerContainer: {
        zIndex: 1,
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: 220
    },
    banner: {
        zIndex: 2,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingVertical: 10
    },

    titleContainer: {
        flex: 1,
        display: 'flex',
        flexDirection: 'row',
        marginRight: 20 
    },
    titleUnderline: {
        flexShrink: 1,
        borderBottomWidth: 1,
        borderColor: Theme.colors.primary,
        padding: 5
    },
    title: {
        fontWeight: 'bold',
        fontSize: 22.5
    },

    trailerButton: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderWidth: 1,
        borderColor: Theme.colors.primary,
        borderRadius: 5
    },

    linearGradientContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        transform: [{rotate: '180deg'}]
    },
    linearGradient: {
        width: 420
    },

    backdrop: {
        height: 220,
    },

    content: {
        paddingHorizontal: 15
    },

    sectionTitle: {
        fontWeight: 'bold',
        fontSize: 20,
        marginBottom: 10
    },
    sectionSeparator: {
        height: 1,
        backgroundColor: Theme.colors.primary,
        marginHorizontal: 50
    },

    horizontalScroll: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap'
    },

    poster: {
        height: 150,
        width: 100,
        borderWidth: 1,
        borderColor: Theme.colors.primaryDarker,
        borderRadius: 5
    }
})