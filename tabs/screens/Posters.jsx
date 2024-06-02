import React, { useEffect, useState, useRef } from 'react'
import { StyleSheet, View, Image, Pressable, FlatList } from 'react-native'
import Theme from '../../assets/styles.js'
import CustomText from '../../components/tags/CustomText.jsx'
import CustomImage from '../../components/tags/CustomImage.jsx'
import CustomModal from '../../components/tags/CustomModal.jsx'
import Header from '../../components/Header.jsx'

import { api } from '../../services/api.js'

import AsyncStorage from '@react-native-async-storage/async-storage'

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

    const manageSelectedPoster = async (posterClicked) => {
        try {
            const selectedPoster = {
                poster_path: posterClicked.file_path,
            }
            await AsyncStorage.setItem(`@moviePoster-ID:${movieId}`, JSON.stringify(selectedPoster))

            modalPosterRef.current.closeModal()
            navigation.navigate('MovieTab', { screen: 'Movie', params: { movieId: movieId } })
        } catch (error) {
            // console.error('Error updating poster:', error)
        }
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
                <Header navigation={navigation} title={'Posters'} />

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
                                            onPress={() => manageSelectedPoster(posterClicked)}
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
            </>
        ) : (
            null
        )
    )
}
export default Posters

const styles = StyleSheet.create({
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