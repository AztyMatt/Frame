import React, { useRef, useState, useEffect, useMemo } from 'react'
import { Dimensions, StyleSheet, View, ScrollView, Text, Image, Pressable, Linking } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import Theme from '../assets/styles.js'
import CustomText from './tags/CustomText.jsx'

const screenWidth = Dimensions.get('window').width

const ReviewsCarousel = ({ reviews, navigation }) => {
    const scrollViewRef = useRef(null)
    const [activeIndex, setActiveIndex] = useState(0)

    // Fonctions
    const capitalizeFirstLetter = (word) => {
        return word.slice(0, 1).toUpperCase() + word.slice(1);
    }

    const formatWords = (content) => { //Needs to be improved for _ or * alone !
        const symbols = [
            {startSymbol: '_', endSymbol: '_', style: {fontStyle: 'italic'}},
            {startSymbol: '**', endSymbol: '**', style: {fontWeight: 'bold'}},
            {startSymbol: '<em>', endSymbol: '</em>', style: {fontStyle: 'italic', fontWeight: 'bold'}},
        ]
        const regex = /(_[^_]+_)|(\*\*[^**]+\*\*)|(<em>[^.]+<\/em>)/g

        for (const symbol of symbols) {
            styles[symbol.startSymbol] = symbol.style
        }

        const fragments = content.split(regex).filter(fragment => fragment !== undefined)
        
        const formattedFragments = []
        for (let fragment of fragments) {
            let type = null
        
            for (const symbol of symbols) {
                if(fragment.startsWith(symbol.startSymbol) && fragment.endsWith(symbol.endSymbol)) {
                    type = symbol.startSymbol
                    fragment = fragment.slice(symbol.startSymbol.length, - symbol.endSymbol.length)
                }
            }
        
            formattedFragments.push({ 'string': fragment, 'type': type })
        }

        return formattedFragments
    }

    const formatUrl = (url) => {
        const regex = /^(?:https?:\/\/)?(?:www\.)?([^\/\n]+?)(?:\.\w+)+(?=\.|$)/
        const [websiteUrl, websiteName] = url.match(regex)

        return [{'string': websiteName, 'url': url}]
    }

    const formatContent = (content) => {
        const regex = /(https?:\/\/[^\s]+)/g
        const parts = content.split(regex)

        return parts.map((part, index) => {
            return index % 2 == 0
                ? formatWords(part)
                : formatUrl(part)
        })
    }

    const scrollToIndex = (index) => {
        scrollViewRef.current.scrollTo({ x: index * screenWidth, y: 0, animated: true })
    }

    // Formatted Data
    const formattedReviews = useMemo(() => {
        return reviews.map(review => {
            return {
                ...review,
                content: formatContent(review.content)
            }
        })
    }, [reviews])

    // Reset
    useEffect(() => {
        return navigation.addListener('focus', () => {
            setActiveIndex(0)
            scrollViewRef.current.scrollTo({ x: 0, animated: false })
        })
    }, [reviews])

    return (
        <View style={styles.carouselContainer}>
            <ScrollView
                ref={scrollViewRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                pagingEnabled
                decelerationRate="fast"
                scrollEventThrottle={500}
                contentContainerStyle={styles.carousel}
                onScroll={(event) => {
                    setActiveIndex(Math.round(event.nativeEvent.contentOffset.x / screenWidth))
                }}
            >
                {formattedReviews.slice(0, 10).map((review, index) => (
                    <Pressable 
                        onPress={() => navigation.navigate('Review', { reviewId: review.id })}
                        key={index}
                        style={[styles.slide, { width: screenWidth, paddingHorizontal: 15 }]}
                    >
                        <View style={styles.container}>
                            <View style={[styles.linearGradientContainer, { height: 190 }]}>
                                <LinearGradient colors={[Theme.colors.secondaryDarker, 'transparent']}>
                                    <View style={[styles.linearGradient, { height: 50 }]}></View>
                                </LinearGradient>
                            </View>
                            <View style={styles.content}>
                                <View style={styles.authorContainer}>
                                    {review.author_details.avatar_path ? (
                                        <Image
                                            style={styles.authorAvatar}
                                            resizeMode='cover'
                                            source={{
                                            uri: `https://image.tmdb.org/t/p/original${review.author_details.avatar_path}`,
                                            }}
                                        />
                                    ) : (
                                        <Image
                                            style={styles.authorAvatar}
                                            resizeMode='cover'
                                            source={require('../assets/icons/figure.png')}
                                        />
                                    )}
                                    <View style={styles.author}>
                                        <View style={styles.authorTop}>
                                            <CustomText style={styles.authorName}>
                                                {review.author_details.name || 'User'}
                                            </CustomText>
                                            <CustomText style={styles.authorRating}>
                                                {review.author_details.rating ? `${review.author_details.rating}/10 ★` : 'Not rated'}
                                            </CustomText>
                                        </View>
                                        <Text style={styles.authorUsername}>{review.author_details.username}</Text>
                                    </View>
                                </View>
                                <CustomText numberOfLines={7} ellipsizeMode='tail'>
                                    {review.content.map((part) => (
                                        part.map((fragment, index) => (
                                            fragment.url ? (
                                                <CustomText onPress={() => Linking.openURL(fragment.url)} key={index} style={styles.url}>
                                                    {capitalizeFirstLetter(fragment.string)}
                                                </CustomText>
                                            ) : (
                                                <CustomText key={index} style={styles[fragment.type]}>
                                                    {fragment.string}
                                                </CustomText>
                                            )
                                        ))
                                    ))}
                                </CustomText>
                            </View>
                        </View>
                    </Pressable>
                ))}
            </ScrollView>
            <View style={styles.controls}>
                <View style={styles.controlsBtnContainer}>
                    {formattedReviews.slice(0, 10).map((review, index) => (
                        <Pressable 
                            key={index}
                            style={[
                                styles.controlsBtn, 
                                activeIndex == index ? styles.activeControlsBtn : null
                            ]}
                            onPress={() => scrollToIndex(index)}
                        />
                    ))}
                </View>
                <Pressable style={styles.seeMoreBtn} onPress={() => console.log("See more reviews")}>
                    <CustomText style={{ fontWeight: 'bold' }}>See more reviews</CustomText>
                </Pressable>
            </View>
        </View>
    )
}
export default ReviewsCarousel

const styles = StyleSheet.create({
    carouselContainer: {
        flex: 1,
    },
    carousel: {
        flexGrow: 1,
    },

    slide: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },

    container: {
        width: '100%',
        borderWidth: 1,
        borderColor: Theme.colors.primaryDarker,
        borderRadius: 5,
        overflow: 'hidden'
    },

    content: {
        height: 190,
        width: '100%',
        padding: 10
    },
    url: {
        textDecorationLine: 'underline'
    },

    authorContainer: {
        display: 'flex',
        flexDirection: 'row',
        marginBottom: 10
    },
    authorAvatar: {
        height: 40,
        width: 40,
        borderWidth: 1,
        borderColor: Theme.colors.primaryDarker,
        borderRadius: 5
    },
    author: {
        flex: 1, 
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        marginLeft: 7.5
    },
    authorTop: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 1
    },
    authorName: {
        fontWeight: 'bold',
    },
    authorRating: {
        fontWeight: 'bold',
    },
    authorUsername: {
        color: Theme.colors.primaryDarker
    },

    controls: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 10,
        paddingHorizontal: 15
    },
    controlsBtnContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    controlsBtn: {
        width: 10,
        height: 10,
        borderRadius: '100%',
        marginHorizontal: 5,
        backgroundColor: Theme.colors.primaryDarker,
    },
    activeControlsBtn: {
        backgroundColor: Theme.colors.primary,
    },

    seeMoreBtn: {
        paddingHorizontal: 15,
        paddingVertical: 5,
        borderWidth: 1,
        borderColor: Theme.colors.primaryDarker,
        borderRadius: 5
    },

    linearGradientContainer: {
        zIndex: 1,
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        transform: [{rotate: '180deg'}],
        // borderTopWidth: 1,
        // borderTopColor: 'red',
        // backgroundColor: 'blue'
    },
    linearGradient: {
        width: '100%'
    },
})