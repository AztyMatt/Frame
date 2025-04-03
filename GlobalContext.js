import React, { createContext, useState, useContext, useEffect } from 'react'

const GlobalContext = createContext()

export const GlobalProvider = ({ children }) => {
    const [currentDate, setCurrentDate] = useState(new Date())

    useEffect(() => {
        const updateDate = () => {
            setCurrentDate(new Date())
        }

        const scheduleUpdate = () => {
            const now = new Date()
            const midnight = new Date(now)
            midnight.setHours(24, 0, 0, 0)

            const timeUntilMidnight = midnight - now

            setTimeout(() => {
                updateDate()
                setInterval(updateDate, 24 * 60 * 60 * 1000)
            }, timeUntilMidnight)
        }

        scheduleUpdate()

        return () => clearTimeout(scheduleUpdate)
    }, [])

    const global = { 
        currentDate
    }

    return (
        <GlobalContext.Provider value={global}>
            {children}
        </GlobalContext.Provider>
    )
}

export const useGlobal = () => useContext(GlobalContext)
