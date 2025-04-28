import React, { useEffect, useState, useRef, useMemo } from 'react'
import { StyleSheet, View, Pressable, ScrollView, FlatList } from 'react-native'
import useGlobalStore from '@/store/globalStore'
import { capitalizeFirstLetter } from '@/utils.js'
import Theme from '@/assets/styles.js'
import countries from '@/assets/countries.json'
import CustomText from '@/components/tags/CustomText.jsx'
import CustomPressable from '@/components/tags/CustomPressable.jsx'
import CustomImage from '@/components/tags/CustomImage.jsx'
import CustomModal from '@/components/tags/CustomModal.jsx'
import Header from '@/components/Header.jsx'

const Providers = ({ route, navigation}) => {
    const { movieId, data, screenWidth } = route.params
    const globalStore = {
        language: useGlobalStore(state => state.language),
        country: useGlobalStore(state => state.country)
    }

    /**
     * useStates
     */
    const [providersForThisCountry, setProvidersForThisCountry] = useState(null)
    const [currentCountry, setCurrentCountry] = useState(globalStore.country)
    const [countriesTranslated, setCountriesTranslated] = useState(null)

    /**
     * useRefs
     */
    const headerRef = useRef(null)
    const modalLanguagesRef = useRef(null)

    /**
     * Functions
     */
    const formatTitle = (title) => {
        return title.split('_').join(' ').toUpperCase()
    }

    const openModal = (item, ref) => {
        if (item) {
            setPosterClicked(item)
        }
        ref.current.openModal()
    }

    const handleCountryChange = (country) => {
        setCurrentCountry(country)

        modalLanguagesRef.current.closeModal()
    }

    /**
     * UseMemos
     */
    const formattedData = useMemo(() => {
        if (!data) return {}

        const formatProviders = () => {
            const providers = {}
            for (const countryISO in data) {
                const { flatrate, buy, rent } = data[countryISO]
                const services = {
                    'flatrate': flatrate,
                    'rent': rent,
                    'buy': buy
                }
                const providerData = {}

                for (const keyname in services) {
                    const service = services[keyname]
                    if (service?.length) {
                        providerData[keyname] = service
                    }
                }

                if (Object.keys(providerData).length) {
                    providers[countryISO] = providerData
                }
            }
            return providers
        }

        const formatCountriesISO = () => {
            const countriesISO = Object.keys(data)

            if (!countriesISO.includes(globalStore.country)) {
                countriesISO.unshift(globalStore.country)
            } else {
                const currentIndex = countriesISO.indexOf(globalStore.country)
                countriesISO.splice(currentIndex, 1)
                countriesISO.unshift(globalStore.country)
            }

            return countriesISO
        }

        return {
            providers: formatProviders(),
            countriesISO: formatCountriesISO()
        }
    }, [data, globalStore.country])

    /**
     * UseEffects
     */
    useEffect(() => {
        const fetchAndSetCountriesTranslated = async () => {
            if (!formattedData.countriesISO) return {}

            const names = {}

            try {
                await new Promise(resolve => setTimeout(resolve, 2000))
                const response = await fetch(
                    `https://raw.githubusercontent.com/unicode-org/cldr-json/main/cldr-json/cldr-localenames-full/main/${globalStore.language}/territories.json`
                )

                if (!response.ok) throw new Error('Failed to fetch country names')

                const data = await response.json()
                const translations = data?.main?.[globalStore.language]?.localeDisplayNames?.territories || {}

                for (const countryISO of formattedData.countriesISO) {
                    if (countryISO) {
                        const translation = translations[countryISO]
                        names[countryISO] = translation ? translation : null
                    }
                }
            } catch (error) {
                for (const countryISO of formattedData.countriesISO) {
                    if (countryISO) {
                        names[countryISO] = null
                    }
                }
            }

            setCountriesTranslated(names)
        }

        fetchAndSetCountriesTranslated()
    }, [formattedData.countriesISO, globalStore.language])

    useEffect(() => {
        setCurrentCountry(globalStore.country)
        setCountriesTranslated(null)
    }, [globalStore.country])

    useEffect(() => {
        setProvidersForThisCountry(formattedData.providers[currentCountry])
    }, [currentCountry])

    /**
     * JSX Fragments
     */
    const Country = (countryISO) => {
        if (!countryISO) {
            return <CustomText>Others</CustomText>
        }

        const countryTranslated = countriesTranslated[countryISO]
        const countryInEnglish = countries.find(country => country.iso_3166_1 === countryISO)?.native_name || 'Unknown'
        const isTranslated = !(countryTranslated === null)

        const hasCountryToDisplay = isTranslated ? countryTranslated : countryInEnglish

        return (
            hasCountryToDisplay ? (
                <>
                    <CustomText style={[currentCountry === countryISO && { color: Theme.colors.primaryDarker }]}>
                        {`${capitalizeFirstLetter(hasCountryToDisplay)} (${countryISO.toUpperCase()})`}
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

    return (
        <>
            <Header
                ref={headerRef}
                navigation={navigation}
                title={'Providers'}
                additionalBtn={{
                    onPress: () => openModal(null, modalLanguagesRef),
                    isImage: false,
                    source: currentCountry
                }}
            />

            <CustomModal ref={modalLanguagesRef}
                content={
                    data ? (
                        <View style={[
                            styles.languagesContainer,
                            {
                                width: screenWidth - 50
                            }
                        ]}>
                            <ScrollView
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={{
                                    flexGrow: 1,
                                    paddingVertical: 5,
                                    paddingHorizontal: 15,
                                  }}
                                style={styles.languages}
                            >
                                {countriesTranslated ? (
                                    formattedData.countriesISO.map((countryISO, index) => (
                                        <Pressable
                                            onPress={() => handleCountryChange(countryISO)}
                                            key={index}
                                            style={[
                                                styles.language,
                                                index === 0 && { marginBottom: 20 },
                                                index === formattedData.countriesISO.length - 1 && { borderBottomWidth: 0 }
                                            ]}
                                        >
                                            {Country(countryISO)}
                                        </Pressable>
                                    ))
                                ) : (
                                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                        <CustomText style={{ paddingVertical: 10 }}>Loading...</CustomText>
                                    </View>
                                )}
                            </ScrollView>
                        </View>
                    ) : (
                        null
                    )
                }
            />

            {providersForThisCountry ? (
                <ScrollView contentContainerStyle={{paddingTop: 20}} style={{paddingHorizontal: 20}}>
                    {Object.keys(providersForThisCountry).map((key, index) => (
                        <View key={index} style={styles.providerContainer}>
                            <View style={styles.providerTitleContainer}>
                                <CustomText style={styles.providerTitle}>{formatTitle(key)}</CustomText>
                            </View>

                            {Array.isArray(providersForThisCountry[key]) ? (
                                providersForThisCountry[key].map((language, index) => (
                                    <View style={styles.providerItem} key={index}>
                                        <CustomImage
                                            source={language.logo_path}
                                            style={styles.providerLogo}
                                            fallback={'provider'}
                                        />
                                        <CustomText style={styles.providerText}>{language.provider_name}</CustomText>
                                    </View>
                                ))
                            ) : (
                                null
                            )}
                        </View>
                    ))}
                </ScrollView>
            ) : (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <CustomText style={{color: Theme.colors.primaryDarker}}>Unavailable in your country.</CustomText>
                    <CustomPressable 
                        onPress={() => openModal(null, modalLanguagesRef)}
                        styleButtonWithLabel={`Check in other countries`}
                        style={{marginTop: 7.5}}
                    />
                </View>
            )}
        </>
    )
}
export default Providers

const styles = StyleSheet.create({
    languagesContainer: {
        flex: 1,
        maxHeight: 500,
        maxWidth: 500,
    },
    languages: {
        width: '100%',
        // height: '100%',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: Theme.colors.secondary,
        backgroundColor: Theme.colors.secondaryDarker
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

    providerLogo: {
        height: 25,
        width: 25,
        borderWidth: 1,
        borderColor: Theme.colors.primaryDarker,
        borderRadius: 5,
        marginRight: 7.5 // 5 ?
    },
    providerContainer: {
        marginBottom: 25
    },
    providerTitleContainer: {
        paddingBottom: 5,
        marginTop: 5,
        borderBottomWidth: 1,
        borderColor: Theme.colors.primaryDarker,
        borderBottomRightRadius: 5
    },
    providerTitle: {
        fontWeight: 'bold',
        marginBottom: 5
    },
    providerItem: {
        height: 42.5,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        // marginVertical: 5,
        // paddingLeft: 5,
        borderBottomWidth: 1,
        borderColor: Theme.colors.primaryDarker,
        borderBottomRightRadius: 5
    },
    providerText: {
        flex: 1
    }
})