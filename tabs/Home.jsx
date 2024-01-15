import React, { useState, useEffect } from 'react'
import { StatusBar } from 'expo-status-bar'
import { View, StyleSheet, Text, Image } from 'react-native'

import { api } from '../services/api.js'

export default function Home() {
    const [apiResult, setApiResult] = useState(null)
    const [imageError, setImageError] = useState(false)
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await api('/movie/374252?language=en-US')
                setApiResult(result)
            } catch (error) {
                console.error('Erreur lors de l\'appel à api:', error.message)
            }
        }
        fetchData()
    }, [])

    const handleImageError = () => {
        setImageError(true)
    }

    return (
        <View style={styles.container}>
            {apiResult ? (
                <View>
                    <Text>{apiResult.original_title}</Text>
                    <Text>{apiResult.overview}</Text>
                    {imageError ? (
                        <Text>Erreur de chargement de l'image</Text>
                    ) : (
                        <Image
                            style={styles.image}
                            resizeMode="contain"
                            source={{
                                uri: `https://image.tmdb.org/t/p/original/${apiResult.poster_path}`,
                            }}
                            onError={handleImageError}
                        />
                    )}
                </View>
            ) : (
                <Text>Chargement...</Text>
            )}
            <StatusBar style="auto" />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    image: {
        height: 500
    }
})