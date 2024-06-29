import React, { useEffect, useState, useRef } from 'react'
import { StyleSheet, Dimensions, View, FlatList, Pressable } from 'react-native'
import Theme from '../assets/styles.js'
import CustomText from './tags/CustomText.jsx'
import CustomPressable from './tags/CustomPressable.jsx'

// obsolete
const width = Dimensions.get('window').width

const Carousel = (
    {
        navigation,
        items,
        itemsVisible = items.length,
        infiniteScroll = false,
        automaticScroll = false,
        automaticScrollSpeed = 2,
        controls = false,
        seeMore = 'items',
        slidePadding = 15,
        carouselWidth = Dimensions.get('window').width
    }
) => {
    const itemsSliced = [...items.slice(0, itemsVisible)]
    const isInfiniteScroll = infiniteScroll ? 1 : 0

    const flatListRef = useRef(null)
    const [activeIndex, setActiveIndex] = useState(0)
    const [formattedData, setFormattedData] = useState(
        infiniteScroll
            ? (
                [
                    itemsVisible <= items.length
                        ? items[itemsVisible - 1]
                        : items[items.length - 1]
                    ,
                    ...itemsSliced,
                    items[0]
                ]
            )
            : (itemsSliced)
    )

    /**
     * Fonctions
     */
    const moveToIndex = (index, scroll, setIndex) => {
        flatListRef.current.scrollToIndex({ index: index, animated: scroll })
        setIndex && setActiveIndex(setIndex)
    }

    /**
     * useEffects
     */
    // Default slide
    useEffect(() => { // how to exec before everything else ?
        setTimeout(() => {
            infiniteScroll && moveToIndex(1, false, 1)
        }, 0)

        // itemsSliced.map((item, index) => (
        //     console.log(item.props.style)
        // ))
    }, [])

    // Modifications based on props
    useEffect(() => {
        if (infiniteScroll) {
            activeIndex <= 0 && moveToIndex(itemsSliced.length, false, itemsSliced.length)
            activeIndex >= itemsSliced.length + 1 && moveToIndex(1, false, 1)

            if (automaticScroll) {
                const interval = setInterval(() => {
                    const nextIndex = (activeIndex + 1) % formattedData.length
        
                    
                    flatListRef.current.scrollToIndex({
                        index: nextIndex === 0 ? formattedData.length : nextIndex,
                        animated: true
                    })
                }, automaticScrollSpeed * 1000)
            
                return () => clearInterval(interval)
            }
        }
    }, [activeIndex])

    // Reset
    useEffect(() => {
        return navigation.addListener('focus', () => {
            moveToIndex(isInfiniteScroll, false, isInfiniteScroll)
        })
    }, [items])

    /**
     * JSX Fragments
     */
    const Slide = ({ item }) => (
        <View style={[styles.slide, { width: carouselWidth, paddingHorizontal: slidePadding }]}>
            {item}
        </View>
    )

    const controlsBtn = ( index ) => (
        <Pressable
            key={index}
            style={[
                styles.controlsBtn, 
                activeIndex === index ? styles.activeControlsBtn : null
            ]}
            onPress={() => moveToIndex(index, true)}
        />
    )

    return (
        <View style={[styles.carouselContainer, {width: carouselWidth}]}>
            <FlatList
                ref={flatListRef}
                data={formattedData}
                renderItem={Slide}
                horizontal
                showsHorizontalScrollIndicator={false}
                pagingEnabled
                decelerationRate="fast"
                scrollEventThrottle={500}
                contentContainerStyle={styles.carousel}
                keyExtractor={(item, index) => index.toString()}
                getItemLayout={(formattedData, index) => (
                    {length: carouselWidth, offset: carouselWidth * index, index}
                )}
                onScroll={(event) => {
                    setActiveIndex(Math.round((event.nativeEvent.contentOffset.x / carouselWidth)))
                }}
                scrollEnabled={automaticScroll ? false : true}
            />

            {controls ? (
                <View style={styles.controlsContainer}>
                    <View style={[styles.controls,
                        {
                            padding: slidePadding,
                            justifyContent: seeMore ? 'space-between' : 'center'
                        }
                    ]}>
                        <View style={styles.controlsBtnContainer}>
                            {formattedData.map((item, index) => (
                                infiniteScroll ? (
                                    index !== 0 && index !== formattedData.length - 1 ? (
                                        controlsBtn(index)
                                    ) : (                         
                                        null
                                    )
                                ) : (
                                    controlsBtn(index)
                                )
                            ))}
                        </View>

                        {seeMore ? (
                            <CustomPressable
                                onPress={() => console.log("Want to see more")}
                                styleButtonWithLabel={`See more ${seeMore}`}
                                style={styles.seeMoreBtn}
                            />
                        ) : (
                            null
                        )}
                    </View>
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
        display: 'flex',
        flexDirection: 'column',
    },
    carousel: {
        flexGrow: 1,
    },

    slide: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },

    controlsContainer: {
        width: '100%',
        display: 'flex',
        alignItems: 'center'
    },
    controls: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        paddingTop: 10,
        // paddingHorizontal: 15
    },
    controlsBtnContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    controlsBtn: {
        width: 10,
        height: 10,
        borderRadius: 100,
        marginRight: 10,
        backgroundColor: Theme.colors.primaryDarker,
    },
    activeControlsBtn: {
        backgroundColor: Theme.colors.primary,
    },
})