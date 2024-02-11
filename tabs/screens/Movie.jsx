import React, { useState, useEffect } from 'react'
import { StatusBar } from 'expo-status-bar' // Needed ?
import { StyleSheet, View, ScrollView, Text, Image, SafeAreaView, Pressable, Linking, Animated } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Theme from '../../assets/styles.js'
import CustomText from '../../components/tags/CustomText.jsx'
import { LinearGradient } from 'expo-linear-gradient'
import ReviewsCarousel from '../../components/ReviewsCarousel.jsx'
import Figures from '../../components/Figures.jsx'

import { api } from '../../services/api.js'

const Movie = ({ route, navigation }) => {
    const { movieId } = route.params
    const [apiResult, setApiResult] = useState(null)
    const [onWatchlist, setOnWatchlist] = useState(false)

    const [trailer, setTrailer] = useState([])
    const [providers, setProviders] = useState([])
    const [filteredFigures, setFilteredFigures] = useState([])
    const [director, setDirector] = useState([])

    const [expandedOverview, setExpandedOverview] = useState(false)
    const [isOverviewExpandable, setIsOverviewExpandable] = useState(true)
    const [overviewHeight, setOverviewHeight] = useState(0)
    const animatedOverviewHeight = useState(new Animated.Value(105))[0]
    const animatedLinearGradientOpacity = useState(new Animated.Value(1))[0]

    const [reviews, setReviews] = useState(null)

    const [figuresVisible, setFiguresVisible] = useState(6)
    const [selectedTab, setSelectedTab] = useState('cast')

    // Main
    const isOnWatchlist = async () => {
        const storagedWatchlist = await AsyncStorage.getItem('@userWatchlist')
        const parsedWatchlist = storagedWatchlist ? JSON.parse(storagedWatchlist) : []

        const movieIndex = parsedWatchlist.findIndex((movie) => movie.id === movieId)
        return { parsedWatchlist, movieIndex }
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

    // Formatted Data
    const formatReleaseDate = () => {
        return new Date(apiResult.release_date).getFullYear()
    }

    const formatDate = (date) => {
        const dateFormatted = new Date(date)
        return dateFormatted.toLocaleDateString('en-US')
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

    function formatNote(note) {
        return Math.floor(note * 10) / 10
    }

    function formatThousands(note) {
        return note.toLocaleString('en-US')
    }

    // To toggle between 5actors or all of them
    // const handleToggleImages = () => {
    //     if (figuresVisible === filteredFigures.length) { // Needs to be edited now that filteredFigures contains an object
    //         setFiguresVisible(5)
    //     } else {
    //         setFiguresVisible(filteredFigures.length)
    //     }
    // }

    // Overview
    const onLayout = (event) => {
        const { height } = event.nativeEvent.layout
        setOverviewHeight(height)
    }

    const toggleOverview = () => {
        if (expandedOverview) {
            Animated.timing(animatedOverviewHeight, {
                toValue: 105,
                duration: 300,
                useNativeDriver: false,
            }).start()

            Animated.timing(animatedLinearGradientOpacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: false,
            }).start()
        } else {
            Animated.timing(animatedOverviewHeight, {
                toValue: overviewHeight,
                duration: 300,
                useNativeDriver: false,
            }).start()

            Animated.timing(animatedLinearGradientOpacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: false,
            }).start()
        }
        setExpandedOverview(!expandedOverview)
    }

    // Cast Tabs
    const handleToggleTab = (tab) => {
        setSelectedTab(tab)
    }

    const whichTabBtn = (tab) => {
        return [selectedTab === tab ? [styles.activeTabText] : [styles.inactiveTabText], { textAlign: 'center' }]
    }
    // A useEffect may be needed if you can acces other movie on this screen
    
    // Main
    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await api(`/movie/${movieId}?append_to_response=videos%2Cwatch%2Fproviders%2Creviews%2Ccredits&language=en-US`) //%2Crelease_dates
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

    // formatted Data
    useEffect(() => { // To improve
        if (apiResult) {
            const trailer = apiResult.videos.results.find(
                video => video.type === 'Trailer'
            )
            setTrailer(trailer)

            const providers = apiResult['watch/providers'].results.US
                ? apiResult['watch/providers'].results.US.rent
                    ? apiResult['watch/providers'].results.US.rent
                    : apiResult['watch/providers'].results.US.buy
                : null
            setProviders(providers)

            const reviews = apiResult.reviews.results ? apiResult.reviews.results : null
            setReviews(reviews)
    
            const cast = apiResult.credits.cast.filter(
                person => person.known_for_department === 'Acting'
            )
    
            // const crew = apiResult.credits.crew.filter(
            //     person => person.known_for_department === 'Crew'
            // )
    
            const crew = apiResult.credits.crew
    
            setFilteredFigures({ cast, crew })
    
            const director = apiResult.credits.crew.find(
                person => person.job === 'Director'
            )
            setDirector(director)
        }
    }, [apiResult])

    // Overview
    useEffect(() => { 
        if (overviewHeight > 0) {
            const isExpandable = overviewHeight > animatedOverviewHeight._value
            setIsOverviewExpandable(isExpandable)
            setExpandedOverview(!isExpandable)
            animatedLinearGradientOpacity.setValue(isExpandable ? 1 : 0)
            console.log(overviewHeight, animatedOverviewHeight._value)
            console.log('isOverviewExpandable ', isExpandable)
            console.log('ExpandedOverview ', !isExpandable)
        }
    }, [overviewHeight, animatedOverviewHeight])

    return (
        <>
            <SafeAreaView style={{ backgroundColor: Theme.colors.secondaryDarker }}></SafeAreaView>
            <View style={styles.container}>
                {/* <View style={{ flex: 1, zIndex: 10, height: '100%', width: '100%', position: 'absolute', top: 0, left: 0, display: 'flex', flexDirection: 'row', justifyContent: 'space-between', padding: 15, pointerEvents: 'box-none'}}>
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
                </View> */}
                
                <ScrollView showsVerticalScrollIndicator={false}>
                    {apiResult ? (
                        <View>
                            <View>
                                <View style={[styles.linearGradientContainer, { height: 220 }]}>
                                    <LinearGradient colors={[Theme.colors.secondaryDarker, 'transparent']}>
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
                                <View style={{paddingHorizontal: 15}}>
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
                                                    <Pressable onPress={() => handleLinkPress(trailer)} style={styles.trailerBtn}>
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
                                    
                                    {/* <CustomText>{JSON.stringify(isOverviewExpandable, null, 2)}</CustomText> */}
                                    <Pressable onPress={isOverviewExpandable ? toggleOverview : null} style={{ marginBottom: 10, overflow: 'hidden' }}>
                                        <Animated.View style={{ height: isOverviewExpandable ? animatedOverviewHeight : overviewHeight}}>
                                            <Animated.View style={[styles.linearGradientContainer, { height: '100%', opacity: animatedLinearGradientOpacity }]}>
                                                <LinearGradient colors={[Theme.colors.secondaryDarker, 'transparent']}>
                                                    <View style={[styles.linearGradient, { height: 50 }]}></View>
                                                </LinearGradient>
                                            </Animated.View>
                                            <View onLayout={onLayout} style={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap'}}>
                                                <CustomText style={{ fontWeight: 'bold', marginBottom: 5 }}>{apiResult.tagline}</CustomText>
                                                <CustomText style={{height: '100%', width: '100%'}}>{apiResult.overview}</CustomText>
                                            </View>
                                        </Animated.View>
                                    </Pressable>

                                    {/* <CustomText>{JSON.stringify(apiResult.id, null, 2)}</CustomText> */}
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{display: 'flex', flexDirection: 'row', marginBottom: 20}}>
                                        {apiResult && apiResult.genres.map((genre, index) => (
                                            <Pressable onPress={() => navigation.navigate('Genre', { genreId: genre.id })} key={index}
                                                style={{marginRight: 5, paddingHorizontal: 5,
                                                    paddingVertical: 2.5, height: 25, borderWidth: 1, borderColor: Theme.colors.primaryDarker,
                                                    borderRadius: 5, display: 'flex', justifyContent: 'center'
                                                }}>
                                                <CustomText style={{color: Theme.colors.primaryDarker}}>{genre.name}</CustomText>
                                            </Pressable>
                                        ))}
                                    </ScrollView>
                                </View>
                                
                                <View style={styles.sections}>
                                    <View style={[styles.sectionContainer, { flexDirection: 'row', alignItems: 'center' }]}>
                                        <CustomText style={[styles.sectionTitle, { marginBottom: 0 }]}>Where to watch ?</CustomText>
                                        {providers ? (
                                            <View style={styles.providersContainer}>
                                                <View style={styles.providersContainer}>
                                                    {providers && providers.slice(0, 5).map((provider, index) => (
                                                        <Pressable onPress={() => navigation.navigate('Providers', { movieId: apiResult.id })} key={index} style={{ marginRight: 5 }}>
                                                            {provider.logo_path ? (
                                                                <Image
                                                                    style={styles.provider}
                                                                    resizeMode='contain'
                                                                    source={{
                                                                        uri: `https://image.tmdb.org/t/p/original${provider.logo_path}`,
                                                                    }}
                                                                />
                                                            ) : (
                                                                <CustomText>Erreur de chargement de l'image</CustomText> // Needs to be replace by a better skeleton
                                                            )}
                                                        </Pressable>
                                                    ))}
                                                </View>
                                                <CustomText style={{fontSize: 20, marginLeft: 5}}>➤</CustomText>
                                            </View>
                                        ) : (
                                            <CustomText style={{color: Theme.colors.primaryDarker}}>Currently unavailable</CustomText>
                                        )}
                                    </View>

                                    <View style={styles.sectionContainer}>
                                        <CustomText style={styles.sectionTitle}>Ratings for this movie</CustomText>

                                        <View>
                                            <View style={styles.reviewsContainer}>
                                                <View style={styles.reviewsInfos}>
                                                    <View style={{ marginBottom: 7.5}}>
                                                        <CustomText>
                                                            {/* {'( '} */}
                                                            <CustomText style={{fontWeight: 'bold'}}>{formatThousands(apiResult.vote_count)}</CustomText>
                                                            {' reviews - '}
                                                            <CustomText style={{fontWeight: 'bold'}}>{`${formatNote(apiResult.vote_average)}★`}</CustomText>
                                                            {/* {' )'} */}
                                                        </CustomText>
                                                    </View>

                                                    <View style={styles.ratingContainer}>
                                                        <View style={styles.rating}>

                                                            <View style={styles.ratingNumberContainer}>
                                                                <CustomText style={styles.ratingNumber}>0</CustomText>
                                                            </View>

                                                            <View style={styles.ratingBarContainer}>
                                                                <View style={[styles.ratingBar, {width: `${(formatNote(apiResult.vote_average) / 10) * 100}%`}]}>
                                                                    <Text
                                                                        accessibilityLabel=""
                                                                        selectable={false}
                                                                        style={styles.ratingBarText}
                                                                    >
                                                                        {'/////////////////////' /* Needs to be edited for larger screens */}
                                                                    </Text>
                                                                </View>
                                                            </View>

                                                            <View style={styles.ratingNumberContainer}>
                                                                <CustomText style={styles.ratingNumber}>10</CustomText>
                                                            </View>

                                                        </View>
                                                    </View>
                                                </View>
                                                <Pressable onPress={() => navigation.navigate('WriteReview', { movieId: apiResult.id })} style={styles.reviewBtn}>
                                                    <CustomText style={{ fontWeight: 'bold'}}> Write a review </CustomText>
                                                    <Image
                                                        style={styles.reviewImg}
                                                        source={
                                                            require('../../assets/icons/review.png')
                                                        }
                                                    />
                                                </Pressable>
                                            </View>
                                        </View>
                                    </View>

                                    <View style={[styles.sectionContainer, { paddingHorizontal: 0, marginTop: 10 }]}>
                                        <CustomText style={[styles.sectionTitle, {paddingHorizontal: 15}]}>Reviews for this movie</CustomText>

                                        <View>
                                            {/* <CustomText style={styles.sectionTitle}>Most rated review</CustomText> */}
                                            {/* <CustomText>{JSON.stringify(reviews, null, 2)}</CustomText> */}
                                            {reviews && !reviews.length == 0 ? (
                                                <ReviewsCarousel reviews={reviews}/>  
                                            ) : (
                                                <Text style={{ color: Theme.colors.primaryDarker, paddingHorizontal: 15 }}>No reviews yet.</Text>
                                            )}
                                        </View>
                                    </View>

                                    {/* <View style={styles.sectionContainer}>
                                        <CustomText style={styles.sectionTitle}>Ratings</CustomText>
                                        <CustomText>
                                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer ac justo eu libero vulputate ullamcorper. Sed gravida nunc vitae risus eleifend, vel tempus justo tristique. Vivamus et accumsan elit.
                                        </CustomText>
                                    </View> */}
                                </View>
                                
                                <View style={{paddingHorizontal: 15}}>
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
                                            <LinearGradient colors={[Theme.colors.secondaryDarker, 'transparent']}>
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
                            </View>
                        </View>
                    ) : (
                        <CustomText>Chargement...</CustomText>
                    )}
                </ScrollView>
            </View>
        </>
    )
}
export default Movie

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.secondaryDarker
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
        width: '100%'
    },

    backdrop: {
        height: 220,
    },

    content: {
        zIndex: 2,
        // paddingHorizontal: 15,
        transform: [{ translateY: -50 }]
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
    trailerBtn: {
        height: 30,
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
        borderColor: Theme.colors.secondary,
        borderRadius: 10,
        marginLeft: 10
    },

    sections: {
        borderBottomWidth: 1,
        borderColor: Theme.colors.secondary,
        marginBottom: 25
    },
    sectionContainer: {
        display: 'flex', 
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderColor: Theme.colors.secondary,
        paddingVertical: 15,
        paddingHorizontal: 15
    },
    sectionTitle: {
        fontWeight: 'bold',
        fontSize: 15.5,
        marginBottom: 15
    },

    providersContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center'
    },
    provider: {
        height: 25,
        width: 25,
        borderWidth: 1,
        borderColor: Theme.colors.primaryDarker,
        borderRadius: 5
    },

    reviewsContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        // marginTop: 5
    },
    reviewsInfos: {
        flex:1,
        marginRight: 15
    },

    ratingContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center'
    },
    rating: {
        flex: 1,
        height: 30,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Theme.colors.primaryDarker,
        borderRadius: 5
    },
    ratingNumberContainer: {
        width: 30
    },
    ratingNumber: {
        fontWeight: 'bold',
        textAlign: 'center'
    },
    ratingBarContainer: {
        flex: 1,
        height: '100%',
        borderRightWidth: 1,
        borderLeftWidth: 1,
        borderColor: Theme.colors.primaryDarker,
        overflow: 'hidden'
    },
    ratingBar: {
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        borderRightWidth: 2.5,
        borderColor: Theme.colors.primary,
        // paddingHorizontal: 5,
        paddingVertical: 2.5                       
    },
    ratingBarText: {
        fontSize: 20,
        fontWeight: 'bold',
        // letterSpacing: 0.25,
        lineHeight: 20,
        color: Theme.colors.primaryDarker,
        overflow: 'hidden'
    },

    reviewBtn: {
        height: '100%',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: Theme.colors.primary,
        borderRadius: 5,
        padding: 10
    },
    reviewImg: {
        height: 20,
        width: 20,
        marginLeft: 2.5
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
        color: Theme.colors.primaryDarker
    }
})