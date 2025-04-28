import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

const useGlobalStore = create(
    persist(
        (set, get) => ({
            currentDate: new Date(),
            updateCurrentDate: () => set({ currentDate: new Date() }),
            startDateUpdater: () => {
                const update = () => get().updateCurrentDate()
                const now = new Date()
                const midnight = new Date()
                midnight.setHours(24, 0, 0, 0)
                const delay = midnight - now

                setTimeout(() => {
                    update()
                    setInterval(update, 24 * 60 * 60 * 1000)
                }, delay)
            },

            language: 'en',
            setLanguage: (language) => set({ language }),

            country: 'US',
            setCountry: (country) => set({ country }),
        }),
        {
            name: 'global-storage',
            storage: AsyncStorage,
            partialize: (state) => ({ 
                language: state.language,
                country: state.country
            }),
        }
    )
)

export default useGlobalStore
