import React, { useState, useEffect } from 'react'
import { StatusBar } from 'expo-status-bar' // Needed ?
import { StyleSheet, View, ScrollView, Text, Image, SafeAreaView, Pressable, Linking } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Theme from '../../assets/styles.js'
import CustomText from '../../components/tags/CustomText.jsx'
import { LinearGradient } from 'expo-linear-gradient'
import Figures from '../../components/Figures.jsx'

import { api } from '../../services/api.js'

const Movie = ({ route, navigation }) => {
    const { movieId } = route.params
    const [apiResult, setApiResult] = useState(null)
    const [onWatchlist, setOnWatchlist] = useState(false)

    const [trailer, setTrailer] = useState([])
    const [filteredFigures, setfilteredFigures] = useState([])
    const [director, setDirector] = useState([])
    const [figuresVisible, setfiguresVisible] = useState(6)
    const [selectedTab, setSelectedTab] = useState('cast')

    const formatReleaseDate = () => {
        return new Date(apiResult.release_date).getFullYear()
    }

    const formatDuration = (duration) => {
        const hours = Math.floor(duration / 60)
        const minutes = duration % 60

        const hoursFormat = hours < 10 ? `0${hours}` : `${hours}`
        const minutesFormat = minutes < 10 ? `0${minutes}` : `${minutes}`

        return `${hoursFormat}h${minutesFormat}`
    }

    const handleLinkPress = (trailer) => {
        trailer ? (
            Linking.openURL(`https://www.youtube.com/watch?v=${trailer.key}`)
        ) : (
            // console.log('No trailer found')
            null
        )
    }

    // To toggle between 5actors or all of them
    // const handleToggleImages = () => {
    //     if (figuresVisible === filteredFigures.length) { // Needs to be edited now that filteredFigures contains an object
    //         setfiguresVisible(5)
    //     } else {
    //         setfiguresVisible(filteredFigures.length)
    //     }
    // }

    const handleToggleTab = (tab) => {
        setSelectedTab(tab)
    }

    const whichTabBtn = (tab) => {
        return [selectedTab === tab ? [styles.activeTabText] : [styles.inactiveTabText], { textAlign: 'center' }]
    }

    const isOnWatchlist = async () => {
        const storagedWatchlist = await AsyncStorage.getItem('@userWatchlist');
        const parsedWatchlist = storagedWatchlist ? JSON.parse(storagedWatchlist) : [];

        const movieIndex = parsedWatchlist.findIndex((movie) => movie.id === movieId);
        return { parsedWatchlist, movieIndex };
    }

    const manageWatchlist = async () => {
        try {
            const { parsedWatchlist, movieIndex } = await isOnWatchlist()
        
            if (movieIndex !== -1) {
                parsedWatchlist.splice(movieIndex, 1)
                setOnWatchlist(false)
            } else {
                const newMovie = {
                    id: movieId,
                    poster_path: apiResult.poster_path,
                }
                parsedWatchlist.push(newMovie)
                setOnWatchlist(true)
            }
      
            await AsyncStorage.setItem('@userWatchlist', JSON.stringify(parsedWatchlist))
        } catch (error) {
          // console.error('Error updating watchlist:', error)
        }
    }

    // A useEffect may be needed if you can acces other movie on this screen
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await api(`/movie/${movieId}?append_to_response=credits%2Cvideos&language=en-US`) //%2Crelease_dates
                setApiResult(result)
            } catch (error) {
                // console.error('Error during API call:', error.message) // To fix
            }
        }
        fetchData()

        const checkWatchlist = async () => { 
            const { movieIndex } = await isOnWatchlist()

            if (movieIndex !== -1) {
                setOnWatchlist(true)
            }
        }
        checkWatchlist()
    }, [])

    useEffect(() => { // To improve
        if (apiResult) {
            const trailer = apiResult.videos.results.find(
                video => video.type === 'Trailer'
            )
            setTrailer(trailer)
    
            const cast = apiResult.credits.cast.filter(
                person => person.known_for_department === 'Acting'
            )
    
            // const crew = apiResult.credits.crew.filter(
            //     person => person.known_for_department === 'Crew'
            // )
    
            const crew = apiResult.credits.crew
    
            setfilteredFigures({ cast, crew })
    
            const director = apiResult.credits.crew.find(
                person => person.job === 'Director'
            )
            setDirector(director)
        }
    }, [apiResult])

    return (
        <SafeAreaView style={styles.container}>
            <View>
                <View style={{ flex: 1, zIndex: 10, height: '100%', width: '100%', position: 'absolute', top: 0, left: 0, display: 'flex', flexDirection: 'row', justifyContent: 'space-between', padding: 15, pointerEvents: 'box-none'}}>
                    <Pressable onPress={() => navigation.goBack()} style={{ height: 40, width: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '100%', backgroundColor: 'rgba(16, 16, 16, 0.5)', padding: 10 }}>
                        <Image
                            style={{ height: 20, width: 20 }}
                            source={require('../../assets/icons/back.png')}
                        />
                    </Pressable>
                    <Pressable onPress={() => manageWatchlist()} style={{ height: 40, width: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '100%', backgroundColor: 'rgba(16, 16, 16, 0.5)', padding: 10 }}>
                        <Image
                            style={{ height: 20, width: 20 }}
                            source={
                                onWatchlist ? require('../../assets/icons/watchlist.png') : require('../../assets/icons/watchlistOff.png')
                            }
                        />
                    </Pressable>
                </View>
                
                <ScrollView showsVerticalScrollIndicator={false}>
                    {apiResult ? (
                        <View>
                            {/* <CustomText>{JSON.stringify(apiResult.id, null, 2)}</CustomText> */}
                            <View>
                                <View style={[styles.linearGradientContainer, { height: 220 }]}>
                                    <LinearGradient colors={[Theme.colors.secondary, 'transparent']}>
                                        <View style={[styles.linearGradient, { height: 100 }]}></View>
                                    </LinearGradient>
                                </View>
                                {apiResult.backdrop_path ? (
                                    <Image
                                        style={styles.backdrop}
                                        // resizeMode='contain'
                                        source={{
                                            uri: `https://image.tmdb.org/t/p/original/${apiResult.backdrop_path}`,
                                        }}
                                    />
                                ) : (
                                    <CustomText>Erreur de chargement de l'image</CustomText> // Needs to be a default image
                                )}
                            </View>

                            <View style={styles.content}>
                                <View style={styles.preview}>
                                    <View style={styles.infos}>
                                        <View style={styles.titleContainer}>
                                            <CustomText numberOfLines={2} ellipsizeMode='tail' style={styles.title}>{ apiResult.title }</CustomText>
                                        </View>

                                        <View style={styles.details}>
                                            <View>
                                                <View style={styles.directorContainer}>
                                                    <CustomText>{ formatReleaseDate(apiResult.release_date) }</CustomText>
                                                    <CustomText style={{ fontSize: 12.5}}> • DIRECTED BY</CustomText>
                                                </View>
                                                <CustomText style={{ fontWeight: 'bold', fontSize: 16 }}>
                                                    {director ? (
                                                        director.name
                                                    ) : (
                                                        'Unknow'
                                                    )}
                                                </CustomText>
                                            </View>

                                            <View style={styles.trailerContainer}>
                                                <Pressable onPress={() => handleLinkPress()} style={styles.trailerButton}>
                                                    <CustomText> ► TRAILER </CustomText>
                                                </Pressable>
                                                <CustomText style={{ marginLeft: 10 }}>{ formatDuration(apiResult.runtime) }</CustomText>
                                            </View>
                                        </View>
                                    </View>

                                    {apiResult.poster_path ? (
                                        <Image
                                            style={styles.poster}
                                            resizeMode='contain'
                                            source={{
                                                uri: `https://image.tmdb.org/t/p/original/${apiResult.poster_path}`,
                                            }}
                                        />
                                    ) : (
                                        <CustomText>Erreur de chargement de l'image</CustomText> // Needs to be a default image
                                    )}
                                </View>
                                
                                <View>
                                    <CustomText style={{ fontWeight: 'bold', marginBottom: 5 }}>{apiResult.tagline}</CustomText>
                                    <CustomText style={{ marginBottom: 25 }}>{apiResult.overview}</CustomText>
                                </View>
                                
                                <View>
                                    <View>
                                        <View style={styles.tabBtnContainer}>
                                            <Pressable onPress={() => handleToggleTab('cast')} style={styles.tabBtn}>
                                                <CustomText style={whichTabBtn('cast')}> Cast </CustomText>
                                            </Pressable>
                                            <Pressable onPress={() => handleToggleTab('crew')} style={styles.tabBtn}>
                                                <CustomText style={whichTabBtn('crew')}> Crew </CustomText>
                                            </Pressable>
                                            <Pressable onPress={() => handleToggleTab('details')} style={styles.tabBtn}>
                                                <CustomText style={whichTabBtn('details')}> Details </CustomText>
                                            </Pressable>
                                        </View> 
                                    </View>
                                    <View style={styles.figuresContainer}>
                                        {/* <Pressable onPress={handleToggleImages}>
                                            <CustomText>Show all images</CustomText>
                                        </Pressable> */}

                                        <View style={[styles.linearGradientContainer, { height: 350, pointerEvents: 'box-none' }]}>
                                            <LinearGradient colors={[Theme.colors.secondary, 'transparent']}>
                                                <View style={[styles.linearGradient, { height: 100 }]}></View>
                                            </LinearGradient>
                                        </View>

                                        <View>
                                            <Figures
                                                figures={filteredFigures[selectedTab]}
                                                selectedTab={selectedTab}
                                                figuresVisible={figuresVisible}
                                            />
                                        </View>
                                    </View>
                                </View>

                                <View style={{ height: 100 }}>
                                </View>
                            </View>
                        </View>
                    ) : (
                        <CustomText>Chargement...</CustomText>
                    )}
                </ScrollView>
            </View>
        </SafeAreaView>
    )
}
export default Movie

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.secondary
    },

    linearGradientContainer: {
        zIndex: 1,
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
        flex: 1,
        height: '100%',
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
        borderColor: Theme.colors.primary,
        borderRadius: 5
    },

    poster: {
        height: '100%',
        width: 120, // Needs to be improve
        borderWidth: 1,
        borderColor: Theme.colors.primary,
        borderRadius: 10
    },

    tabBtnContainer: {
        height: 32.5,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
        borderWidth: 1,
        borderColor: Theme.colors.primary,
        borderRadius: 5
    },
    tabBtn: {
        width: '30%',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 5
    },

    figuresContainer: {
        height: 350,
        overflow: 'hidden'
    },

    activeTabText: {
        fontWeight: 'bold'
    },
    inactiveTabText: {
        color: Theme.colors.primaryLight
    }
})