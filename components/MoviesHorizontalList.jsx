import React, { useEffect, useRef } from 'react'
import { StyleSheet, ScrollView, Pressable } from 'react-native'
import Theme from '../assets/styles.js'
import CustomImage from './tags/CustomImage.jsx'

const MoviesHorizontalList = ({ movies, navigation }) => {
    const scrollViewRef = useRef(null)

    // Reset
    // useEffect(() => {
    //     return navigation.addListener('focus', () => {
    //         scrollViewRef.current.scrollTo({ x: 0, animated: false })
    //     })
    // }, [movies])

    return (
        <ScrollView ref={scrollViewRef} horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {movies.map((movie, index) => (
                <Pressable onPress={() => navigation.push('MovieTab', { screen: 'Movie', params: { movieId: movie.id } })} key={index} style={{ marginRight: 10 }}>
                    <CustomImage
                        source={{poster_path: movie.poster_path, movieId: movie.id}}
                        style={styles.poster}
                        fallback={'poster'}
                        fallbackContent={movie.title}
                    />
                </Pressable>
            ))}
        </ScrollView>
    )
}
export default MoviesHorizontalList

const styles = StyleSheet.create({
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
        borderRadius: 5,
        overflow: 'hidden'
    }
})