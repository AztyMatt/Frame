import React, { useEffect, useState, useRef, useMemo } from 'react'
import { StyleSheet, View, Pressable, ScrollView, FlatList } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import useGlobalStore from '@/store/globalStore'
import { capitalizeFirstLetter } from '@/utils.js'
import Theme from '@/assets/styles.js'
import languages from '@/assets/languages.json'
import CustomText from '@/components/tags/CustomText.jsx'
import CustomImage from '@/components/tags/CustomImage.jsx'
import CustomModal from '@/components/tags/CustomModal.jsx'
import CustomPressable from '@/components/tags/CustomPressable'
import Header from '@/components/Header.jsx'

import { api } from '@/services/api.js'

const Posters = ({ route, navigation }) => {
    const { movieId, poster_path, screenWidth } = route.params
    const globalStore = {
        language: useGlobalStore(state => state.language)
    }

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
    const [currentPoster, setCurrentPoster] = useState(null)
    const [postersForThisLanguage, setPostersForThisLanguage] = useState(null)
    const [currentLanguage, setCurrentLanguage] = useState(globalStore.language)
    const [languagesTranslated, setLanguagesTranslated] = useState(null)

    /**
     * useRefs
     */
    const headerRef = useRef(null)
    const flatListRef = useRef(null)
    const modalPosterRef = useRef(null)
    const modalLanguagesRef = useRef(null)

    /**
     * Functions
     */
    const openModal = (item, ref) => {
        if (item) {
            setPosterClicked(item)
        }
        ref.current.openModal()
    }

    const manageSelectedPoster = async (posterClicked) => {
        try {
            const selectedPoster = {
                poster_path: posterClicked.file_path,
            }

            selectedPoster.poster_path !== poster_path
                ? await AsyncStorage.setItem(`@moviePoster-ID:${movieId}`, JSON.stringify(selectedPoster))
                : await AsyncStorage.removeItem(`@moviePoster-ID:${movieId}`)

            modalPosterRef.current.closeModal()
            navigation.navigate('MovieTab', { screen: 'Movie', params: { movieId: movieId } })
        } catch (error) {
            // console.error('Error updating poster:', error)
        }
    }

    const handleCurrentPoster = async () => {
        const customPoster = JSON.parse(await AsyncStorage.getItem(`@moviePoster-ID:${movieId}`))
        setCurrentPoster(customPoster ? customPoster.poster_path : poster_path)
    }

    const handleLanguageChange = (language) => {
        setCurrentLanguage(language)
        modalLanguagesRef.current.closeModal()
        if (flatListRef.current && postersForThisLanguage && postersForThisLanguage.length > 0) {
            flatListRef.current.scrollToOffset({ offset: 0, animated: false }) // Needs to be handle differently (margin of the parent isn't)
        }
    }

    const handleRestore = async () => {
        await AsyncStorage.removeItem(`@moviePoster-ID:${movieId}`)
        handleCurrentPoster()

        setCurrentLanguage(globalStore.language)
        modalLanguagesRef.current.closeModal()
        navigation.navigate('MovieTab', { screen: 'Movie', params: { movieId: movieId } })
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
    }, [])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await api(`/movie/${movieId}/images`)
                setData(result)

                // Reset
                // return navigation.addListener('focus', () => {
                //     flatListRef.current.scrollToIndex({ index: 0, animated: false })
                // })
            } catch (error) {
                // console.error('Error during API call:', error.message) // To fix
            }
        }
        fetchData()

        handleCurrentPoster()
    }, [movieId])

    useEffect(() => {
        setCurrentLanguage(globalStore.language)
        setLanguagesTranslated(null)
    }, [globalStore.language])

    useEffect(() => {
        if (data) {
            setPostersForThisLanguage(data.posters.filter(poster => poster.iso_639_1 === currentLanguage))
        }
    }, [currentLanguage, data])

    /**
     * useMemos
     */
    const formattedData = useMemo(() => {
        if (!data) return {}

        const specialLanguage = {
            english_name: 'Others',
            iso_639_1: null,
        }
        const languagesFound = []

        data.posters.forEach(poster => {
            const languageFound = languages.find(language => language.iso_639_1 === poster.iso_639_1) || specialLanguage
            const existingLanguage = languagesFound.find(entry => entry.language === languageFound)
            existingLanguage
                ? existingLanguage.count++
                : languagesFound.push({ language: languageFound, count: 1 })
        })

        languagesFound.sort((firstLanguage, secondLanguage) => {
            if (firstLanguage.language.iso_639_1 === null) return 1
            if (secondLanguage.language.iso_639_1 === null) return -1
            return secondLanguage.count - firstLanguage.count
        })

        const formatLanguagesISO = () => {
            const languagesISO = languagesFound.map(entry => entry.language.iso_639_1)

            if (!languagesISO.includes(globalStore.language)) {
                languagesISO.unshift(globalStore.language)
            } else {
                const currentIndex = languagesISO.indexOf(globalStore.language)
                const [currentLanguageISO] = languagesISO.splice(currentIndex, 1)
                languagesISO.unshift(currentLanguageISO)
            }

            return languagesISO
        }

        return { languagesISO: formatLanguagesISO() }
    }, [data, globalStore.language])

    /**
     * useEffects 2
     */
    useEffect(() => {
        const fetchAndSetLanguagesTranslated = async () => {
            if (!formattedData.languagesISO) return {}
    
            const names = {}
    
            try {
                const response = await fetch(
                    `https://raw.githubusercontent.com/unicode-org/cldr-json/main/cldr-json/cldr-localenames-full/main/${globalStore.language}/languages.json`
                )
    
                if (!response.ok) throw new Error('Failed to fetch language names')
    
                const data = await response.json()
                const translations = data?.main?.[globalStore.language]?.localeDisplayNames?.languages || {}
    
                for (const languageISO of formattedData.languagesISO) {
                    if (languageISO) {
                        const translation = translations[languageISO]

                        names[languageISO] = translation
                            ? translation
                            : null
                    }
                }
            } catch (error) {
                for (const languageISO of formattedData.languagesISO) {
                    if (languageISO) {
                        names[languageISO] = null
                    }
                }
            }
    
            setLanguagesTranslated(names)
        }
        fetchAndSetLanguagesTranslated()
    }, [formattedData.languagesISO, globalStore.language])

    /**
     * JSX Fragments
     */
    const Poster = ({ item, index }) => (
        <View key={index} style={styles.posterContainer}>
            <CustomPressable
                onPress={() => openModal(item, modalPosterRef)}
                isInactiveWhen={currentPoster == item.file_path}
                style={[
                    styles.posterBtn,
                    {
                        borderWidth: posterHorizontalBorders / 2,
                        margin: posterHorizontalMargins / 2,
                        borderColor: Theme.colors[currentPoster === item.file_path ? 'secondaryDarker' : 'secondary']
                    }
                ]}
            >
                <View
                    style={[
                        styles.posterSelectedFilter,
                        {
                            width: posterWidth,
                            aspectRatio: item.aspect_ratio,
                            opacity: currentPoster === item.file_path ? 0.25 : 0
                        }
                    ]}
                />
                <CustomImage
                    source={item.file_path}
                    style={[
                        {
                            width: posterWidth,
                            aspectRatio: item.aspect_ratio,

                            opacity: (currentPoster || data.posters[0].file_path) === item.file_path
                                ? 0.25
                                : 1
                        }
                    ]}
                />
            </CustomPressable>
        </View>
    )

    const Language = (languageISO) => { 
        if (!languageISO) {
            return <CustomText>Others</CustomText>
        }

        const languageTranslated = languagesTranslated[languageISO]
        const languageInEnglish = languages.find(language => language.iso_639_1 === languageISO)?.english_name || 'Unknown'
        const isTranslated = !(languageTranslated === null)

        const hasLanguageToDisplay = isTranslated ? languageTranslated : languageInEnglish

        return (
            hasLanguageToDisplay ? (
                <>
                    <CustomText style={[currentLanguage === languageISO && { color: Theme.colors.primaryDarker }]}>
                        {`${capitalizeFirstLetter(hasLanguageToDisplay)} (${languageISO.toUpperCase()})`}
                    </CustomText>
                    {!isTranslated && (
                        <CustomText style={{ fontStyle: 'italic', color: Theme.colors.secondary }}>
                            Untranslated
                        </CustomText>
                    )}
                </>
            ) : (
                null
            )
        )
    }

    return data ? (
        <>
            <Header
                ref={headerRef}
                navigation={navigation}
                title={'Posters'}
                additionalBtn={{
                    onPress: () => openModal(null, modalLanguagesRef),
                    isImage: false,
                    source: currentLanguage
                }}
            />

            <CustomModal
                ref={modalLanguagesRef}
                content={
                    formattedData.languagesISO ? (
                        <View
                            style={[
                                styles.languagesContainer,
                                {
                                    width: screenWidth - 50
                                }
                            ]}
                        >
                            <ScrollView
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={{
                                    flexGrow: 1,
                                    paddingVertical: 5, 
                                    paddingHorizontal: 15
                                }}
                                style={styles.languages}
                            >
                                {languagesTranslated ? (
                                    formattedData.languagesISO.map((languageISO, index) => (
                                        <Pressable
                                            onPress={() => handleLanguageChange(languageISO)}
                                            key={index}
                                            style={[
                                                styles.language,
                                                index === 0 && { marginBottom: 20 },
                                                index === formattedData.languagesISO.length - 1 && { borderBottomWidth: 0 },
                                            ]}
                                        >
                                            {Language(languageISO)}
                                        </Pressable>
                                    ))
                                ) : (
                                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                        <CustomText style={{ paddingVertical: 10 }}>Loading...</CustomText>
                                    </View>
                                )}
                            </ScrollView>

                            <CustomPressable
                                onPress={() => handleRestore()}
                                isInactiveWhen={currentPoster == poster_path}
                                styleButtonWithLabel={'Restore poster to default'}
                                style={{ marginTop: 10 }}
                            />
                        </View>
                    ) : null
                }
            />

            <View style={styles.flatListContainer}>
                {numberOfColumns ? (
                    <View style={{ flex: 1 }}>
                        <FlatList
                            ref={flatListRef}
                            data={postersForThisLanguage}
                            renderItem={Poster}
                            ListEmptyComponent={
                                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                    <CustomText style={{color: Theme.colors.primaryDarker}}>No posters in your language.</CustomText>
                                    <CustomPressable 
                                        onPress={() => openModal(null, modalLanguagesRef)}
                                        styleButtonWithLabel={`Check in other languages`}
                                        style={{marginTop: 7.5}}
                                    />
                                </View>
                            }
                            keyExtractor={(item, index) => index.toString()}
                            numColumns={numberOfColumns}
                            showsVerticalScrollIndicator={false}
                            scrollEnabled={postersForThisLanguage?.length > 0}
                            contentContainerStyle={{
                                paddingVertical: screenHorizontalPaddings / 2,
                                paddingHorizontal: screenHorizontalPaddings / 2,
                                ...(postersForThisLanguage?.length === 0 && { flex: 1 })
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

                        <CustomModal
                            ref={modalPosterRef}
                            content={
                                posterClicked ? (
                                    <View>
                                        <CustomImage
                                            source={posterClicked.file_path}
                                            style={[styles.posterClickedImg,
                                                {
                                                    width: screenWidth - 50,
                                                    aspectRatio: posterClicked.aspect_ratio
                                                }
                                            ]}
                                        />
                                        <CustomPressable
                                            onPress={() => manageSelectedPoster(posterClicked)}
                                            styleButtonWithLabel={'Choose this poster'}
                                            style={{ marginTop: 10 }}
                                        />
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
        // borderColor: Theme.colors.secondary,
        overflow: 'hidden',
    },
    posterSelectedFilter: {
        zIndex: 100,
        position: 'absolute',
        top: 0,
        left: 0,
        backgroundColor: 'black'
    },

    languagesContainer: {
        flex: 1,
        maxHeight: 500,
        maxWidth: 500
    },
    languages: {
        width: '100%',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: Theme.colors.secondary,
        backgroundColor: Theme.colors.secondaryDarker,
    },
    language: {
        height: 40,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        // marginVertical: 5,
        // paddingBottom: 10,
        // marginBottom: 10,
        paddingLeft: 5,
        borderBottomWidth: 1,
        borderColor: Theme.colors.primaryDarker,
        borderBottomRightRadius: 5,
    },

    posterClickedImg: {
        maxWidth: 360,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: Theme.colors.secondary,
    }
})