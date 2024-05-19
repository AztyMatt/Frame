import React, { useEffect, useState, useRef } from 'react'
import { SafeAreaView, StyleSheet, View, Image, Pressable, FlatList, Dimensions } from 'react-native'
import Theme from '../assets/styles.js'
import CustomText from './tags/CustomText.jsx'
import CustomImage from './tags/CustomImage.jsx'
import CustomModal from './tags/CustomModal.jsx'

import { api } from '../services/api.js'

const Posters = ({ route, navigation}) => {
    const { movieId, screenWidth } = route.params

    /**
     * useStates
     */
    const [data, setData] = useState(null)
    const [numberOfColumns, setNumberOfColumns] = useState(null)
    const [posterClicked, setPosterClicked] = useState(null)

    const [posterWidth, setPosterWidth] = useState(175)
    const [posterHorizontalMargins, setPosterHorizontalMargins] = useState(10)
    const [posterHorizontalBorders, setPosterHorizontalBorders] = useState(1)
    const [screenHorizontalPaddings, setScreenHorizontalPadding] = useState(20)

    /**
     * useRefs
     */
    const flatListRef = useRef(null)
    const modalPosterRef = useRef(null)

    /**
     * Functions
     */
    const openModal = (item, ref) => {
        setPosterClicked(item)
        ref.current.openModal()
    }

    /**
     * useEffects
     */
    useEffect(() => {
        const defaultNumberOfColumns = Math.floor(
            (screenWidth - screenHorizontalPaddings)
                /
            (posterWidth + posterHorizontalMargins + posterHorizontalBorders)
        )

        const alternativeNumberOfColumns = 2
        
        const newNumberOfColumns = defaultNumberOfColumns < 2
            ? alternativeNumberOfColumns
            : defaultNumberOfColumns
        setNumberOfColumns(newNumberOfColumns)

        const newPosterWidth = (
            (
                (screenWidth - screenHorizontalPaddings)
                    /
                newNumberOfColumns
            )
                -
            (posterHorizontalMargins + posterHorizontalBorders))

        setPosterWidth(newPosterWidth)

        // console.log('newNumberOfColumns :', newNumberOfColumns)
        // console.log('newPosterWidth :', newPosterWidth)
    }, [])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await api(`/movie/${movieId}/images?language=en`)
                setData(result)
                // console.log(result)

                // Reset
                // return navigation.addListener('focus', () => {
                //     flatListRef.current.scrollToIndex({ index: 0, animated: false })
                // })
            } catch (error) {
                // console.error('Error during API call:', error.message) // To fix
            }
        }
        fetchData()
    }, [movieId])

    /**
     * JSX Fragments
     */
    const Poster = ({ item, index }) => (
        <View key={index} style={styles.posterContainer}>
            <Pressable
                style={[
                    styles.posterBtn,
                    {
                        borderWidth: posterHorizontalBorders / 2,
                        margin: posterHorizontalMargins / 2
                    }
                ]}
                onPress={() => openModal(item, modalPosterRef)}
            >
                <CustomImage
                    source={item.file_path}
                    style={{
                        width: posterWidth,
                        aspectRatio: item.aspect_ratio,
                    }}
                />
            </Pressable>
        </View>
    )

    return (
        data && data.posters && data.posters.length > 0 ? (
            <>
                <SafeAreaView style={{ backgroundColor: Theme.colors.secondaryDarker }}></SafeAreaView>

                <View style={styles.headerContainer}>
                    <View style={styles.header}>
                        <Pressable onPress={() => navigation.goBack()} style={styles.headerBtn}>
                            <Image
                                style={styles.headerBtnImg}
                                source={require('../assets/icons/back.png')}
                            />
                            <View style={styles.headerBtnBackground}></View>
                        </Pressable>

                        <View style={{flex: 1}}>
                            <CustomText numberOfLines={1} ellipsizeMode='tail' style={[styles.title, {textAlign: 'center'}]}>Posters</CustomText>
                        </View>

                        <View style={styles.headerBtn}>

                        </View>
                    </View>
                    
                    <View style={[styles.headerBackground]}></View>
                </View>

                <View style={{flex: 1, backgroundColor: Theme.colors.secondaryDarker}}>
                    <View 
                        style={styles.flatListContainer}
                    >
                        {numberOfColumns ? (
                            <View>
                                <FlatList
                                    ref={flatListRef}
                                    data={data ? data.posters : []}
                                    renderItem={Poster}
                                    keyExtractor={(item, index) => index.toString()}
                                    numColumns={numberOfColumns}
                                    showsVerticalScrollIndicator={false}
                                    contentContainerStyle={{ 
                                        paddingVertical: screenHorizontalPaddings / 2,
                                        paddingHorizontal: screenHorizontalPaddings / 2,
                                    }}
                                    columnWrapperStyle={{ justifyContent: 'flex-start' }}
                                    style={{
                                        width: (
                                            (posterWidth + posterHorizontalMargins + posterHorizontalBorders)
                                                *
                                            numberOfColumns
                                        )
                                            +
                                        screenHorizontalPaddings
                                    }}
                                />

                                <CustomModal ref={modalPosterRef}
                                    content={
                                        posterClicked ? (
                                            <View>
                                                <CustomImage
                                                    source={posterClicked.file_path}
                                                    style={[styles.posterClickedImg, {
                                                        width: screenWidth - 50,
                                                        aspectRatio: posterClicked.aspect_ratio
                                                    }]}
                                                />
                                                <Pressable
                                                    style={styles.posterClickedBtn}
                                                >
                                                    <CustomText style={{ fontWeight: 'bold', textAlign: 'center' }}>Choose this poster</CustomText>
                                                </Pressable>
                                            </View>
                                        ) : (
                                            null
                                        )
                                    }
                                />
                            </View>
                        ) : (
                            null
                        )}
                    </View>
                </View>
            </>
        ) : (
            null
        )
    )
}
export default Posters

const styles = StyleSheet.create({
    headerContainer: {
        zIndex: 10,
        // flex: 1,
        width: '100%',
        // position: 'relative',
        height: 55, // Needs to be improved
        // top: 0,
        // left: 0,
        // pointerEvents: 'box-none'
    },
    header: {
        zIndex: 11,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 7.5
    },
    headerBtn: {
        height: 40,
        width: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        // borderRadius: '100%',
        // backgroundColor: Theme.colors.secondaryDarker
    },
    headerBtnImg: {
        zIndex: 13,
        height: 20,
        width: 20
    },
    headerBtnBackground: {
        zIndex: 12,
        position: 'absolute',
        height: '100%',
        width: '100%',
        borderRadius: '100%',
        backgroundColor: Theme.colors.secondaryDarker,
        opacity: 0.5
    },
    headerBackground: {
        flex: 1,
        position: 'absolute',
        height: '100%',
        width: '100%',
        borderBottomWidth: 1,
        borderColor: Theme.colors.primary,
        backgroundColor: Theme.colors.secondaryDarker
    },

    title: {
        fontWeight: 'bold',
        fontSize: 22.5
    },

    flatListContainer: {
        flex: 1, 
        width: '100%',
        display: 'flex',
        alignItems: 'center'
    },
    posterContainer: { 
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    posterBtn: {
        borderRadius: 10,
        borderColor: Theme.colors.secondary,
        overflow: 'hidden',
    },

    posterClickedImg: {
        maxWidth: 360,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: Theme.colors.secondary,
    },
    posterClickedBtn: {
        borderRadius: 5,
        borderWidth: 1,
        borderColor: Theme.colors.primaryDarker,
        backgroundColor: Theme.colors.secondaryDarker,
        marginTop: 10,
        paddingHorizontal: 15,
        paddingVertical: 5,
    }
})