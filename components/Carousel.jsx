import React, { useEffect, useState, useRef } from 'react'
import { StyleSheet, View, ScrollView, Pressable, Dimensions } from 'react-native'
import Theme from '../assets/styles.js'
import CustomText from './tags/CustomText.jsx'

const screenWidth = Dimensions.get('window').width

const Carousel = ({ navigation, items, itemsVisible = Infinity, controls = false, seeMore = 'items' }) => {
    const scrollViewRef = useRef(null)
    const [activeIndex, setActiveIndex] = useState(0)

    // Fonctions
    const scrollToIndex = (index) => {
        scrollViewRef.current.scrollTo({ x: index * screenWidth, y: 0, animated: true })
    }

    // Reset
    useEffect(() => {
        return navigation.addListener('focus', () => {
            setActiveIndex(0)
            scrollViewRef.current.scrollTo({ x: 0, animated: false })
        })
    }, [items])

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
                {items.slice(0, itemsVisible).map((item, index) => (
                    <View key={index} style={[styles.slide, { width: screenWidth, paddingHorizontal: 15 }]}>
                        {item}
                    </View>
                ))}
            </ScrollView>

            {controls ? (
                <View style={[styles.controls,
                    {
                        justifyContent: seeMore ? 'space-between' : 'center'
                    }
                ]}>
                    <View style={styles.controlsBtnContainer}>
                        {items.slice(0, itemsVisible).map((item, index) => (
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

                    {seeMore ? (
                        <Pressable style={styles.seeMoreBtn} onPress={() => console.log("Want to see more")}>
                            <CustomText style={{ fontWeight: 'bold' }}>See more {seeMore}</CustomText>
                        </Pressable>
                    ) : (
                        null
                    )}
                </View>
            ) : (
                null
            )}
        </View>
    )
}
export default Carousel

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

    controls: {
        display: 'flex',
        flexDirection: 'row',
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
})