import React, { useRef, useState, useEffect } from 'react'
import { Dimensions, StyleSheet, View, ScrollView, Text, Image, Pressable, Linking } from 'react-native'
import Theme from '../assets/styles.js'
import CustomText from './tags/CustomText.jsx'

const screenWidth = Dimensions.get('window').width

const ReviewsCarousel = ({ reviews, navigation }) => {
    const scrollViewRef = useRef(null)
    const [activeIndex, setActiveIndex] = useState(0)

    const scrollToIndex = (index) => {
        setActiveIndex(index)
        scrollViewRef.current.scrollTo({ x: index * screenWidth, y: 0, animated: true })
    }

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
                scrollEventThrottle={200}
                contentContainerStyle={styles.carousel}
                onScroll={(event) => {
                    setActiveIndex(Math.round(event.nativeEvent.contentOffset.x / screenWidth))
                }}
            >
                {reviews.slice(0, 10).map((review, index) => (
                    <Pressable 
                        onPress={() => navigation.navigate('Review', { reviewId: review.id })}
                        key={index}
                        style={[styles.slide, { width: screenWidth, paddingHorizontal: 15 }]}
                    >
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
                                    <CustomText style={styles.authorName}>{review.author_details.name ? review.author_details.name : 'User'}</CustomText>
                                    <Text style={styles.authorUsername}>{review.author_details.username}</Text>
                                </View>
                            </View>
                            <CustomText numberOfLines={7} ellipsizeMode='tail'>{review.content}</CustomText>
                        </View>
                    </Pressable>
                ))}
            </ScrollView>
            <View style={styles.controls}>
                <View style={styles.controlsBtnContainer}>
                    {reviews.slice(0, 10).map((review, index) => (
                        <Pressable key={index} style={[styles.controlsBtn, activeIndex === index && styles.activeControlsBtn]} onPress={() => scrollToIndex(index)} />
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

    content: {
        height: 190,
        width: '100%',
        borderWidth: 1,
        borderColor: Theme.colors.primaryDarker,
        borderRadius: 5,
        padding: 10
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
        marginLeft: 10
    },
    authorName: {
        fontWeight: 'bold',
        marginBottom: 1
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
    }
})