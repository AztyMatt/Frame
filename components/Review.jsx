import React, { useMemo } from 'react'
import { StyleSheet, View, Pressable, Linking } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { capitalizeFirstLetter } from '../utils.js'
import Theme from '../assets/styles.js'
import CustomText from './tags/CustomText.jsx'
import CustomImage from './tags/CustomImage.jsx'

const Review = ({ review, displayPartialReview = true }) => {

    const ReviewContainer = displayPartialReview ? Pressable : View

    // Fonctions
    const formatWords = (content) => { //Needs to be improved for _ or * alone !
        const symbols = [
            {startSymbol: '_', endSymbol: '_', style: {fontStyle: 'italic'}},
            {startSymbol: '***', endSymbol: '***', style: {fontWeight: 'bold', fontSize: 15.5 }},
            {startSymbol: '**', endSymbol: '**', style: {fontWeight: 'bold'}},
            {startSymbol: '<em>', endSymbol: '</em>', style: {fontStyle: 'italic', fontWeight: 'bold'}},
        ]
        const regex = /(_[^_]+_)|(\*\*\*[^***]+\*\*\*)|(\*\*[^**]+\*\*)|(<em>[^.]+<\/em>)/g

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
        const regex = /^(?:https?:\/\/)?(?:www\.)?([^\/\n]+)(?:\/|$)/
        const match = url.match(regex)

        if (match) {
            const [websiteUrl, websiteName] = match
            return [{'string': websiteName, 'url': url}]
        } else {
            return [{'string': null, 'url': 'Unvalid website'}]
        }
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

    // Formatted Data
    const formattedReview = useMemo(() => {
        return {
            ...review,
            content: formatContent(review.content)
        }
    }, [review])

    return (
        <ReviewContainer onPress={() => navigation.navigate('Review', { reviewId: formattedReview.id })} style={displayPartialReview ? styles.container : null}>
            { displayPartialReview ? (
                <View style={[styles.linearGradientContainer, { height: 190 }]}>
                    <LinearGradient colors={[Theme.colors.secondaryDarker, 'transparent']}>
                        <View style={[styles.linearGradient, { height: 50 }]}></View>
                    </LinearGradient>
                </View>
            ) : (
                null
            )}
            
            <View style={[styles.content,
                {
                    height: displayPartialReview ? 190 : '100%'
                }
            ]}>
                <View style={styles.authorContainer}>
                    <CustomImage
                        source={formattedReview.author_details.avatar_path}
                        style={styles.authorAvatar}
                        fallback={'default'}
                        fallbackContent={require('../assets/icons/figure.png')}
                    />

                    <View style={styles.author}>
                        <View style={styles.authorTop}>
                            <CustomText style={styles.authorName}>
                                {formattedReview.author_details.name || 'User'}
                            </CustomText>
                            <CustomText style={styles.authorRating}>
                                {formattedReview.author_details.rating ? `${formattedReview.author_details.rating}/10 ★` : 'Not rated'}
                            </CustomText>
                        </View>

                        <CustomText style={styles.authorUsername}>{formattedReview.author_details.username}</CustomText>
                    </View>
                </View>

                <CustomText numberOfLines={displayPartialReview ? 7 : null} ellipsizeMode='tail'>
                    {formattedReview.content.map((part) => (
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
        </ReviewContainer>
    )
}
export default Review

const styles = StyleSheet.create({
    container: {
        width: '100%',
        borderWidth: 1,
        borderColor: Theme.colors.primaryDarker,
        borderRadius: 5,
        overflow: 'hidden'
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

    content: {
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
    }
})