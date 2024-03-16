import React, { useState, useEffect } from 'react'
import { StyleSheet, View } from 'react-native'
import Theme from '../assets/styles.js'
import CustomText from './tags/CustomText'

const Details = ({details}) => {
    const formatThousands = (note) => {
        return note.toLocaleString('en-US')
    }

    const formatTitle = (title) => {
        return title.split('_').join(' ').toUpperCase()
    }

    return (
        <View style={{paddingVertical: 7.5}}>
            {Object.keys(details).map((key, index) => (
                <View key={index} style={styles.detailContainer}>
                    <View style={styles.detailTitleContainer}>
                        <CustomText style={styles.detailTitle}>{formatTitle(key)}</CustomText>
                    </View>

                    {Array.isArray(details[key]) ? (
                        details[key].map((language, index) => (
                            <View key={index} style={styles.detailItem}>
                                <CustomText>
                                    {language.english_name || language.name}
                                    {' '}
                                    ({
                                        language.iso_639_1
                                            ? language.iso_639_1.toUpperCase()
                                            : language.iso_3166_1 || language.origin_country || '??'
                                    })
                                </CustomText>
        
                                <View style={styles.detailArrowContainer}>
                                    <CustomText style={{ fontWeight: 'bold', fontSize: 20 }}>➤</CustomText>
                                </View>
                            </View>
                        ))
                    ) : (
                        <View style={styles.detailItem}>
                            <CustomText>
                                {typeof details[key] === 'number'
                                    ? details[key] !== 0
                                        ? `$${formatThousands(details[key])}`
                                        : 'Unknow'
                                    : details[key]}
                            </CustomText>
                        </View>
                    )}
                </View>
            ))}
        </View> 
    )
}
export default Details

const styles = StyleSheet.create({
    detailContainer: {
        marginBottom: 25
    },
    detailTitleContainer: {
        paddingBottom: 5,
        marginTop: 5,
        borderBottomWidth: 1,
        borderColor: Theme.colors.primaryDarker,
        borderBottomRightRadius: 5
    },
    detailTitle: {
        fontWeight: 'bold'
    },
    detailItem: {
        height: 40,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        // marginVertical: 5,
        paddingLeft: 5,
        borderBottomWidth: 1,
        borderColor: Theme.colors.primaryDarker,
        borderBottomRightRadius: 5
    },
    detailArrowContainer: {     
        width: 40,
        display: 'flex',
        alignItems: 'center'
    }
})