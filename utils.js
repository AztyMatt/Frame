import { Linking } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

// Generic functions
export const capitalizeFirstLetter = (word) => {
    return word.slice(0, 1).toUpperCase() + word.slice(1)
}

export const removeLastWord = (input) => {
    let words = input.split(' ')
    words.pop()

    return words.join(' ')
}

// Generic formatting
export const formatDateToYear = (date) => {
    return new Date(date).getFullYear()
}

export const formatReleaseDate = (date) => {
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
  
    const formattedDate = `${year}-${month}-${day}`
    return formattedDate
}

export const formatDuration = (duration) => {
    const hours = Math.floor(duration / 60)
    const minutes = duration % 60

    const hoursFormat = hours < 10 ? `0${hours}` : `${hours}`
    const minutesFormat = minutes < 10 ? `0${minutes}` : `${minutes}`

    return `${hoursFormat}h${minutesFormat}`
}

export const formatNote = (note) => {
    return Math.floor(note * 10) / 10
}

export const formatThousands = (number) => {
    return number.toLocaleString('en-US')
}

// Handlers
export const handleTrailerLink = (trailer) => { // Needs to be improved (if ?, directly pass trailer.key as parameter ?, change styles of btn if trailer null ?)
    trailer ? (
        Linking.openURL(`https://www.youtube.com/watch?v=${trailer.key}`)
    ) : (
        // console.log('No trailer found')
        null
    )
}

// AsyncStorage
export const getAsyncStorage = async () => {
    try {
        const keys = await AsyncStorage.getAllKeys()
        if (keys.length > 0) {
            const result = await AsyncStorage.multiGet(keys)
            console.log(result);
        } else {
            console.log("No data in AsyncStorage")
        }
    } catch (error) {
        console.error(error)
    }
}

export const clearAsyncStorage = async () => {
    try {
        await AsyncStorage.clear()
        console.log('AsyncStorage cleared successfully.')
    } catch (error) {
        console.error('Error clearing AsyncStorage:', error)
    }
}