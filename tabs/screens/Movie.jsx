import React, { useState, useEffect, useRef, useMemo } from 'react'
import { StatusBar } from 'expo-status-bar' // Needed ?
import { Dimensions, StyleSheet, View, ScrollView, Text, Image, Pressable, Linking, Animated } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { LinearGradient } from 'expo-linear-gradient'
import { removeLastWord, formatDateToYear, formatDuration, formatNote, formatThousands, handleTrailerLink } from '../../utils.js'
import Theme from '../../assets/styles.js'
import languages from '../../assets/languages.json'
import CustomText from '../../components/tags/CustomText.jsx'
import CustomImage from '../../components/tags/CustomImage.jsx'
import CustomModal from '../../components/tags/CustomModal.jsx'
import CustomPressable from '../../components/tags/CustomPressable'
import Header from '../../components/Header.jsx'
import Carousel from '../../components/Carousel.jsx'
import Review from '../../components/Review.jsx'
import Figures from '../../components/Figures.jsx'
import Details from '../../components/Details.jsx'
import MoviesHorizontalList from '../../components/MoviesHorizontalList.jsx'

import { api } from '../../services/api.js'

const websites = {
    imdb_id: 'https://www.imdb.com/title/',
    wikidata_id: 'https://www.wikidata.org/wiki/',
    facebook_id: 'https://www.facebook.com/',
    instagram_id: 'https://www.instagram.com/',
    twitter_id: 'https://twitter.com/'
}

const maxOverviewHeight = 110

const Movie = ({ route, navigation }) => {
    const { movieId } = route.params

    /**
     * useStates
     */
    // Main
    const [data, setData] = useState(null)
    const [onWatchlist, setOnWatchlist] = useState(false)
    const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width)

    // Header
    const HeaderScrollY = useState(new Animated.Value(0))[0]

    // Posters
    const [areMultiplesPosters, setAreMultiplesPosters] = useState(false)

    // Overview
    const [expandedOverview, setExpandedOverview] = useState(false)
    const [isOverviewExpandable, setIsOverviewExpandable] = useState(true)
    const [overviewHeight, setOverviewHeight] = useState(0)
    const animatedOverviewHeight= useState(new Animated.Value(maxOverviewHeight))[0]
    const animatedLinearGradientOpacity = useState(new Animated.Value(1))[0]

    // Figures
    const [figuresVisible, setFiguresVisible] = useState(6)
    const [selectedTab, setSelectedTab] = useState('cast')

    /**
     * useRefs
     */
    // Main
    const mainScrollViewRef = useRef()

    // Modals
    const modalPosterRef = useRef(null)

    /**
     * Functions
     */
    // Watchlist
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
                    poster_path: data.poster_path,
                    title: data.title
                }
                parsedWatchlist.push(newMovie)
                setOnWatchlist(true)
            }
    
            await AsyncStorage.setItem('@userWatchlist', JSON.stringify(parsedWatchlist))
        } catch (error) {
        // console.error('Error updating watchlist:', error)
        }
    }

    // Figures
    // To toggle between 5actors or all of them
    // const handleToggleImages = () => {
    //     if (figuresVisible === filteredFigures.length) { // Needs to be edited now that filteredFigures contains an object
    //         setFiguresVisible(5)
    //     } else {
    //         setFiguresVisible(filteredFigures.length)
    //     }
    // }

    // Header
    const animatedHeaderOpacity = HeaderScrollY.interpolate({
        inputRange: [100, 150],
        outputRange: [0, 1],
        extrapolate: 'clamp',
    })
    const animatedHeaderTitleOpacity = HeaderScrollY.interpolate({
        inputRange: [150, 200],
        outputRange: [0, 1],
        extrapolate: 'clamp',
    })

    // Modal
    const openModal = (ref) => {
        ref.current.openModal()
    }
    const closeModal = (ref) => {
        ref.current.closeModal()
    }

    // Overview
    const onLayout = (event) => {
        const { height } = event.nativeEvent.layout
        setOverviewHeight(height)
    }

    const toggleOverview = () => {
        const toValue = expandedOverview ? maxOverviewHeight : overviewHeight
        const opacityValue = expandedOverview ? 1 : 0
    
        Animated.parallel([
            Animated.timing(animatedOverviewHeight, { toValue, duration: 300, useNativeDriver: false }),
            Animated.timing(animatedLinearGradientOpacity, { toValue: opacityValue, duration: 300, useNativeDriver: false }),
        ]).start()
    
        setExpandedOverview(!expandedOverview)
    }

    const setOverviewParams = () => { // -> Needs to be improved
        // console.log('overviewHeight :', overviewHeight)
        if (overviewHeight > 0 && animatedOverviewHeight._value !== overviewHeight) {
            const isExpandable = overviewHeight > animatedOverviewHeight._value
            setIsOverviewExpandable(isExpandable)
            setExpandedOverview(!isExpandable)
            animatedLinearGradientOpacity.setValue(isExpandable ? 1 : 0)
            
            // console.log(overviewHeight, animatedOverviewHeight._value)
            // console.log('isOverviewExpandable ', isExpandable)
            // console.log('ExpandedOverview ', !isExpandable)
            // console.log('-----------------')
        }
    }

    /**
     * Handlers
     */
    const handleWebsites = (website, id) => {
        const url = website && websites[website]
            ? `${websites[website]}${id}`
            : id
        Linking.openURL(url)
    }

    const handleScroll = Animated.event(
        [{ 
            nativeEvent: { 
                contentOffset: { 
                    y: HeaderScrollY 
                }
            } 
        }],
        { useNativeDriver: false }
    )

    // Figures
    const handleToggleTab = (tab) => {
        setSelectedTab(tab)
    }

    const whichTabBtn = (tab) => {
        return [selectedTab === tab ? [styles.activeTabText] : [styles.inactiveTabText], { textAlign: 'center' }]
    }
    // A useEffect may be needed if you can acces other movie on this screen

    const mostPopular = (people) => {
        let closestPerson = null
        let closestDifference = Infinity
        
        for (const person of people) {
            if (person && person.popularity) {
                const difference = Math.abs(person.popularity - 100)
                if (difference < closestDifference) {
                    closestDifference = difference
                    closestPerson = person
                }
            }
        }

        return closestPerson
    }
    
    /**
     * UseEffects
     */
    // Main
    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await api(`/movie/${movieId}?append_to_response=videos%2Cwatch%2Fproviders%2Creviews%2Ccredits%2Csimilar%2Cexternal_ids&language=en`) //%2Crelease_dates
                setData(result)

                const resultImagesData = await api(`/movie/${movieId}/images?language=en`)
                setAreMultiplesPosters(resultImagesData.posters.length > 1 ? true : false)

                // Reset
                return navigation.addListener('focus', () => {
                    mainScrollViewRef.current.scrollTo({ y: 0, animated: false })
                    // animatedOverviewHeight.setValue(maxOverviewHeight)
                    // animatedLinearGradientOpacity.setValue(1)
                    // setSelectedTab('cast')
                })
            } catch (error) {
                // console.error('Error during API call:', error.message) // To fix
            }
        }
        fetchData()

        const checkWatchlist = async () => { 
            const { movieIndex } = await isOnWatchlist()

            setOnWatchlist(movieIndex !== -1 ? true : false)
        }
        checkWatchlist()
    }, [movieId])

    // Reviews
    useEffect(() => {
        setOverviewParams()

        return navigation.addListener('focus', () => {
            setOverviewParams()
        })
    }, [overviewHeight, animatedOverviewHeight])

    /**
     * UseMemos
     */
    // Formatted Data -> Needs to be improved
    const formattedData = useMemo(() => {
        if (!data) return {}

        /**
         * Tests
         */
        setIsOverviewExpandable(data && data.overview ? true : false)

        /**
         * Generic formatting
         */
        const releaseDate = formatDateToYear(data.release_date)
        const duration = formatDuration(data.runtime)
        const note = formatNote(data.vote_average)
        const votes = formatThousands(data.vote_count)

        /**
         * Specific formatting
         */
        // Trailer
        const formatTrailer = () => {
            return data.videos.results.find(
                video => video.type === 'Trailer'
            )
        }
        const trailer = formatTrailer()

        // Providers
        const formatProviders = () => {
            const providers = data['watch/providers'].results.US

            return providers
                ? providers.rent
                    ? providers.rent
                    : providers.buy
                : null
        }
        const providers = formatProviders()

        // Director
        const formatDirector = () => {
            return data.credits.crew.find(
                person => person.job === 'Director'
            )
        }
        const director = formatDirector()

        // Figures
        const formatFigures = () => {
            const cast = data.credits.cast

            const filters = [
                { department: 'Directing', job: 'Co-Director' },
                { department: 'Production', job: 'Executive Producer' },
                { department: 'Camera', job: 'Director of Photography' },
                { department: 'Editing', job: 'Editor' },
                { department: 'Writing', job: 'Screenplay' },
                
                { department: 'Sound', job: 'Original Music Composer' },
                { department: 'Art', job: 'Supervising Art Director'}
                // Optionnal -> Make a second list of filters if these one are not enough or if one is missing
            ]
            let crew = []

            if (director) {
                crew.unshift(director)
            }
    
            for (const { department, job } of filters) {
                let filteredPeople = data.credits.crew.filter(
                    person => person.department === department && person.job === job
                )
    
                if (filteredPeople.length === 0) {
                    filteredPeople = data.credits.crew.filter(person => person.department === department)
    
                    if (department === 'Directing' && director) {
                        filteredPeople = filteredPeople.filter(person => person !== director)
                    }
                }
    
                if (filteredPeople.length !== 0 && !filteredPeople.includes(undefined)) {
                    filteredPeople = [mostPopular(filteredPeople)]
                    crew = [...crew, ...filteredPeople]
                }
            }

            return { cast, crew }
        }
        const figures = formatFigures()

        // Details
        const formatDetails = () => {
            const { original_title, spoken_languages, production_countries, production_companies, budget, revenue } = data

            const language = languages.find(
                language => language.iso_639_1 === data.original_language
            )
            const original_language = [language]

            return { original_title, original_language, production_companies, spoken_languages, production_countries, budget, revenue }
        }
        const details = formatDetails()

        // Similar movies
        const formatSimilarMovies = () => {
            return data.similar.results.length > 0 ? data.similar.results : null
        }
        const similarMovies = formatSimilarMovies()

        // Websites
        const formatWebsites = () => {
            let websitesFormatted = []

            for (const website in data.external_ids) {
                const id = data.external_ids[website]

                if (id !== null) {
                    const websiteFormatted = {
                        website,
                        name: website.charAt(0).toUpperCase() + website.slice(1).replace('_id', ''),
                        id
                    }

                    websitesFormatted.push(websiteFormatted)
                }
            }
            return websitesFormatted.length > 0 ? websitesFormatted : null
        }
        const websites = formatWebsites()

        // Return
        return {
            releaseDate,
            duration,
            note,
            votes,

            trailer,
            providers,
            director,
            figures,
            details,
            similarMovies,
            websites
        }
    }, [data])

    return (
        data ? (
            <View style={{ flex: 1 }}>
                <Header
                    navigation={navigation}
                    title={data.title}
                    
                    absolute={true}
                    titleOpacity={animatedHeaderTitleOpacity}
                    opacity={animatedHeaderOpacity}

                    additionalBtn={{
                        onPress: () => manageWatchlist(),
                        source: onWatchlist
                            ? require('../../assets/icons/watchlist.png')
                            : require('../../assets/icons/watchlistOff.png')
                    }}
                />
                
                <ScrollView ref={mainScrollViewRef} showsVerticalScrollIndicator={false} onScroll={handleScroll} scrollEventThrottle={16}>
                    <View>
                        <View>
                            <View style={[styles.linearGradientContainer, { height: 220 }]}>
                                <LinearGradient colors={[Theme.colors.secondaryDarker, 'transparent']}>
                                    <View style={[styles.linearGradient, { height: 100 }]}></View>
                                </LinearGradient>
                            </View>
                            {/* <View style={[styles.backdrop, {height: 220}]}>
                                <Carousel
                                    navigation={navigation} 
                                    items={backdropData.map((backdrop, index) => (
                                        <Pressable onPress={() => {console.log('selected')}} style={{width: '100%', height: '100%'}}>
                                            <View key={index} style={{width: '100%', height: '100%'}}>
                                                <CustomImage
                                                    source={backdrop.file_path}
                                                    style={{width: '100%', height: '100%'}}
                                                    fallback={null}
                                                />
                                            </View>
                                        </Pressable>
                                    ))}
                                    // itemsVisible={5}
                                    infiniteScroll={true}
                                    automaticScroll={true}
                                    automaticScrollSpeed={2}
                                    // controls={true}
                                />
                            </View> */}
                            <CustomImage
                                source={data.backdrop_path}
                                style={styles.backdrop}
                                fallback={null}
                            />
                        </View>

                        <View style={[styles.content,
                            {
                                marginTop: data.backdrop_path ? 170 : 50
                            }
                        ]}>
                            <View style={{paddingHorizontal: 15}}>
                                <View style={styles.preview}>
                                    <View style={styles.infos}>
                                        <Animated.View style={[styles.titleContainer, 
                                            {
                                                opacity: Animated.subtract(1, animatedHeaderOpacity),
                                                justifyContent: data.backdrop_path ? 'flex-end' : 'flex-start'
                                            }
                                        ]}>
                                            <CustomText numberOfLines={2} ellipsizeMode='tail' style={styles.title}>{ data.title }</CustomText>
                                        </Animated.View>

                                        <View style={styles.details}>
                                            <View>
                                                <View style={styles.directorContainer}>
                                                    {!isNaN(formattedData.releaseDate) &&
                                                        <CustomText>{formattedData.releaseDate} • </CustomText>
                                                    }
                                                    <CustomText style={{ fontSize: 12.5}}>DIRECTED BY</CustomText>
                                                </View>

                                                <CustomText style={{ fontWeight: 'bold', fontSize: 16 }}>
                                                    {formattedData.director ? (
                                                        formattedData.director.name
                                                    ) : (
                                                        'Unknow director'
                                                    )}
                                                </CustomText>
                                            </View>
                                            
                                            <View style={styles.trailerAndDurationContainer}>
                                                <CustomPressable
                                                    onPress={() => handleTrailerLink(formattedData.trailer)}
                                                    isInactiveWhen={!formattedData.trailer}
                                                    styleButtonWithLabel={'► TRAILER'}
                                                    style={styles.trailerBtn}
                                                />

                                                <View style={styles.durationContainer}>
                                                    {formattedData.duration !== '00h00' &&
                                                        <CustomText>{ formattedData.duration }</CustomText>
                                                    }
                                                </View>
                                            </View>
                                        </View>
                                    </View>

                                    <CustomPressable onPress={() => {openModal(modalPosterRef)}} isInactiveWhen={!data.poster_path} style={styles.poster}>
                                        <CustomImage
                                            source={{poster_path: data.poster_path, movieId: data.id}}
                                            style={{width: '100%', height: '100%'}}
                                            fallback={'poster'}
                                            fallbackContent={data.title}
                                        />
                                    </CustomPressable>
                                    <CustomModal ref={modalPosterRef}
                                        navigation={navigation}
                                        content={
                                            <CustomPressable
                                                onPress={() => {
                                                    navigation.navigate('Posters', { movieId: data.id, poster_path: data.poster_path, screenWidth: screenWidth })
                                                    closeModal(modalPosterRef)
                                                }}
                                                isInactiveWhen={!areMultiplesPosters}
                                            >
                                                <CustomImage
                                                    source={{poster_path: data.poster_path, movieId: data.id}}
                                                    style={[styles.modalPoster, { width: screenWidth - 50 }]}
                                                />
                                            </CustomPressable>
                                        }
                                    />
                                </View>
                                
                                <Pressable onPress={isOverviewExpandable ? toggleOverview : null} style={styles.overviewExpandableContainer}>
                                    <Animated.View style={{ height: isOverviewExpandable ? animatedOverviewHeight : overviewHeight }}>
                                        <Animated.View style={[styles.linearGradientContainer, { height: '100%', opacity: animatedLinearGradientOpacity }]}>
                                            <LinearGradient colors={[Theme.colors.secondaryDarker, 'transparent']}>
                                                <View style={[styles.linearGradient, { height: 50 }]}></View>
                                            </LinearGradient>
                                        </Animated.View>
                                        
                                        <View onLayout={onLayout} style={styles.overviewContainer}>
                                            {data.tagline ? (
                                                <CustomText style={styles.tagline}>{data.tagline}</CustomText>
                                            ) : (
                                                null
                                            )}
                                            <CustomText style={styles.overview}>{data.overview}</CustomText>
                                        </View>
                                    </Animated.View>
                                </Pressable>

                                {/* <CustomText>{JSON.stringify(isOverviewExpandable, null, 2)}</CustomText> */}
                                {/* <CustomText>{JSON.stringify(expandedOverview, null, 2)}</CustomText> */}

                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.genreContainer}>
                                    {data && data.genres.map((genre, index) => (
                                        <Pressable onPress={() => navigation.navigate('Genre', { genreId: genre.id })} key={index} style={styles.genre}>
                                            <CustomText style={{color: Theme.colors.primaryDarker}}>{genre.name}</CustomText>
                                        </Pressable>
                                    ))}
                                </ScrollView>
                            </View>

                            <View style={styles.sectionContainer}>
                                <View style={[styles.section, { flexDirection: 'row', alignItems: 'center' }]}>
                                    <CustomText style={[styles.sectionTitle, { marginBottom: 0 }]}>Where to watch ?</CustomText>

                                    {formattedData.providers ? (
                                        <View style={styles.providerContainer}>
                                            <View style={styles.providerContainer}>
                                                {formattedData.providers && formattedData.providers.slice(0, 5).map((provider, index) => (
                                                    <Pressable onPress={() => navigation.navigate('Providers', { movieId: data.id })} key={index} style={{ marginRight: 5 }}>
                                                        <CustomImage
                                                            source={provider.logo_path}
                                                            style={styles.provider}
                                                            fallback={'provider'}
                                                        />

                                                    </Pressable>
                                                ))}
                                            </View>

                                            <CustomText style={{fontSize: 20, marginLeft: 5}}>➤</CustomText>
                                        </View>
                                    ) : (
                                        <CustomText style={{color: Theme.colors.primaryDarker}}>Currently unavailable.</CustomText>
                                    )}
                                </View>

                                <View style={styles.section}>
                                    <CustomText style={styles.sectionTitle}>Ratings for this movie</CustomText>

                                    <View>
                                        <View style={styles.reviewContainer}>
                                            <View style={styles.reviewInfos}>
                                                <View style={{ marginBottom: 7.5}}>
                                                    <CustomText>
                                                        {/* {'( '} */}
                                                        <CustomText style={styles.reviewDetails}>{ formattedData.votes }</CustomText>
                                                        {' ratings - '}
                                                        <CustomText style={styles.reviewDetails}>{`${formattedData.note}/10 ★`}</CustomText>
                                                        {/* {' )'} */}
                                                    </CustomText>
                                                </View>

                                                <View style={styles.ratingContainer}>
                                                    <View style={styles.rating}>

                                                        <View style={styles.ratingNumberContainer}>
                                                            <CustomText style={styles.ratingNumber}>0</CustomText>
                                                        </View>

                                                        <View style={styles.ratingBarContainer}>
                                                            <View style={[styles.ratingBar, {width: `${(formattedData.note / 10) * 100}%`}]}>
                                                                <Text
                                                                    aria-label=''
                                                                    style={styles.ratingBarText}
                                                                >
                                                                    {Array(Math.ceil(screenWidth / 10)).fill('/').join('')} {/* Fills the screen regardless of the width */}
                                                                </Text>
                                                            </View>
                                                        </View>

                                                        <View style={styles.ratingNumberContainer}>
                                                            <CustomText style={styles.ratingNumber}>10</CustomText>
                                                        </View>

                                                    </View>
                                                </View>
                                            </View>

                                            <Pressable onPress={() => navigation.navigate('WriteReview', { movieId: data.id })} style={styles.reviewBtn}>
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

                                <View style={[styles.section, { paddingHorizontal: 0, marginTop: 10 }]}>
                                    <CustomText style={[styles.sectionTitle, { paddingHorizontal: 15 }]}>Reviews for this movie</CustomText>

                                    <View>
                                        {data.reviews.results && data.reviews.results.length > 0 ? (
                                            <Carousel
                                                navigation={navigation} 
                                                items={data.reviews.results.map((review) => (
                                                    <Review key={review.id} review={review} />
                                                ))}
                                                itemsVisible={10}
                                                controls={true}
                                                seeMore={'reviews'}
                                                // slidePadding={15}
                                                infiniteScroll={true}
                                            />
                                        ) : (
                                            <CustomText style={{ color: Theme.colors.primaryDarker, paddingHorizontal: 15 }}>No reviews yet.</CustomText>
                                        )}
                                    </View>
                                </View>
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
                                <View style={styles.figureContainer}>
                                    {/* <Pressable onPress={handleToggleImages}>
                                        <CustomText>Show all images</CustomText>
                                    </Pressable> */}

                                    <View style={[styles.linearGradientContainer, { height: 350, pointerEvents: 'box-none' }]}>
                                        <LinearGradient colors={[Theme.colors.secondaryDarker, 'transparent']}>
                                            <View style={[styles.linearGradient, { height: 50 }]}></View>
                                        </LinearGradient>
                                    </View>
                                    
                                    {selectedTab === 'crew' || selectedTab === 'cast' ? (
                                        <Figures
                                            figures={formattedData.figures[selectedTab]}
                                            selectedTab={selectedTab}
                                            figuresVisible={figuresVisible}
                                        />
                                    ) : (
                                        <Details details={formattedData.details}></Details>
                                    )}
                                </View>
                            </View>

                            {data.belongs_to_collection ? (
                                <View style={styles.section}>
                                    <CustomText style={styles.sectionTitle}>Belongs to this saga</CustomText>

                                    <Pressable onPress={() => navigation.navigate('Collection', { collectionId: data.belongs_to_collection.id })} style={styles.collectionContainer}>
                                        <View style={styles.collection}>
                                            <CustomText style={styles.collectionTitle}>
                                                {removeLastWord(data.belongs_to_collection.name)}
                                            </CustomText>
                                        </View>
                                        
                                        <View style={[styles.linearGradientContainer, { height: 150 }]}>
                                            <LinearGradient colors={[Theme.colors.secondaryDarker, 'transparent']}>
                                                <View style={[styles.linearGradient, { height: 50 }]}></View>
                                            </LinearGradient>
                                        </View>

                                        <CustomImage
                                            source={data.belongs_to_collection.backdrop_path}
                                            style={styles.collectionBackdrop}
                                            fallback={'collectionBackdrop'}
                                        />
                                    </Pressable>
                                </View>
                            ) : (
                                null
                            )}

                            {formattedData.similarMovies ? (
                                <View style={styles.section}>
                                    <CustomText style={styles.sectionTitle}>Similar movies</CustomText>
                                    <MoviesHorizontalList movies={formattedData.similarMovies} navigation={navigation}></MoviesHorizontalList>
                                </View>
                            ) : (
                                null
                            )}

                            {formattedData.websites ? (
                                <View style={styles.section}>
                                    <CustomText style={styles.sectionTitle}>External links</CustomText>

                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.externalLinkContainer}>
                                        {data.homepage ? (
                                            <Pressable onPress={() => handleWebsites(null, data.homepage)} style={styles.externalLink}>
                                                <CustomText style={{color: Theme.colors.primaryDarker}}>Website</CustomText>
                                            </Pressable>
                                        ) : (
                                            null
                                        )}
                                        
                                        {formattedData.websites.map((website, index) => (
                                            <Pressable key={index} onPress={() => handleWebsites(website.website, website.id)} style={styles.externalLink}>
                                                <CustomText style={{color: Theme.colors.primaryDarker}}>{website.name}</CustomText>
                                            </Pressable>
                                        ))}
                                    </ScrollView>
                                </View>
                            ) : (
                                null
                            )}
                        </View>
                    </View>
                </ScrollView>
            </View>
        ) : (
            <CustomText>Chargement...</CustomText>
        )
    )
}
export default Movie

const styles = StyleSheet.create({
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
        position: 'absolute',
        width: '100%',
        height: 220,
        top: 0,
        left: 0,
    },

    content: {
        zIndex: 2,
        // paddingHorizontal: 15,
        // transform: [{ translateY: -50 }] // Set the backdrop on absolute, and the content
    },

    preview: {
        height: 180,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'end',
        justifyContent: 'space-between',
        marginVertical: 15,
    },

    overviewExpandableContainer: {
        marginBottom: 10,
        overflow: 'hidden'
    },
    overviewContainer: {
        display: 'flex', 
        flexDirection: 'row',
        // justifyContent: 'flex-start',
        flexWrap: 'wrap'
    },
    tagline: {
        fontWeight: 'bold',
        marginBottom: 5
    },
    overview: {
        height: '100%',
        width: '100%' 
    },

    genreContainer: {
        display: 'flex',
        flexDirection: 'row',
        marginBottom: 20
    },
    genre: {
        marginRight: 5,
        paddingHorizontal: 5,
        paddingVertical: 2.5,
        height: 25,
        borderWidth: 1,
        borderColor: Theme.colors.primaryDarker,
        borderRadius: 2.5,
        display: 'flex',
        justifyContent: 'center'
    },

    infos: {
        flex: 1,
        height: '100%',
        paddingTop: 10
    },

    titleContainer: {
        height: '37.5%',
        display: 'flex',
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

    trailerAndDurationContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center'
    },
    trailerBtn: {
        paddingHorizontal: 10,
        marginRight: 10
    },
    durationContainer: {
        height: '100%',
        display: 'flex',
        justifyContent:'center'
    },

    poster: {
        height: '100%',
        width: 120, // Needs to be improved
        borderWidth: 1,
        borderColor: Theme.colors.secondary,
        borderRadius: 10,
        backgroundColor: Theme.colors.secondaryDarker,
        marginLeft: 10,
        overflow: 'hidden'
    },
    modalPoster: {
        maxWidth: 360,
        aspectRatio: 0.667, // default aspect ratio
        borderRadius: 10,
        borderWidth: 1,
        borderColor: Theme.colors.secondary
    },

    sectionContainer: {
        borderBottomWidth: 1,
        borderColor: Theme.colors.secondary,
        marginBottom: 25
    },
    section: {
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
        marginBottom: 10
    },

    providerContainer: {
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

    reviewContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        marginTop: 5
    },
    reviewInfos: {
        flex:1,
        marginRight: 15
    },
    reviewDetails: {
        fontWeight: 'bold'
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
        overflow: 'hidden',
        userSelect: 'none'
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

    figureContainer: {
        height: 350,
        overflow: 'hidden'
    },

    activeTabText: {
        fontWeight: 'bold'
    },
    inactiveTabText: {
        color: Theme.colors.primaryDarker
    },

    collectionContainer: {
        height: 150,
        width: '100%',
        borderWidth: 1,
        borderColor: Theme.colors.primaryDarker,
        borderRadius: 5,
        overflow: 'hidden'
    },
    collectionBackdrop: {
        height: 150,
        width: '100%',
    },
    collection: {
        zIndex: 2,
        position: 'absolute',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'flex-end',
        padding: 10
    },
    collectionTitle: {
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 20
    },

    externalLinkContainer: {
        display: 'flex',
        flexDirection: 'row'
    },
    externalLink: {
        height: 30,
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: Theme.colors.primaryDarker,
        borderRadius: 2.5,
        marginRight: 5
    },
})