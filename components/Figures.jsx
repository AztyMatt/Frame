import React from 'react'
import { StyleSheet, View, Image } from 'react-native'
import Theme from '../assets/styles.js'
import CustomText from './tags/CustomText'
import CustomImage from './tags/CustomImage'

const Figures = ({figures, figuresVisible, selectedTab}) => {
    return (
        figures && figures.slice(0, figuresVisible).map((figure, index) => (
            figure ? (
                <View key={index} style={styles.figureContainer}>
                    <View style={styles.figureInfos}>
                        <CustomImage
                            source={figure.profile_path}
                            style={styles.figureImage}
                            fallback={'default'}
                            fallbackContent={require('../assets/icons/figure.png')}
                        />

                        <View style={{ flexShrink: 1 }}>
                            <CustomText style={{ fontWeight: 'bold', fontSize: 15 }}>{figure.name || 'Unknow name'}</CustomText>
                            {selectedTab === 'cast' && <CustomText>{figure.character || 'Unknow character'}</CustomText>}
                            {selectedTab === 'crew' && <CustomText numberOfLines={1} ellipsizeMode='tail'>
                                {figure.department || 'Unknow department'}
                                {' - '}
                                {figure.job || 'Unknow job'}
                            </CustomText>}
                        </View>
                    </View>

                    <View style={styles.figureArrowContainer}>
                        <CustomText style={{ fontWeight: 'bold', fontSize: 20 }}>➤</CustomText>
                    </View>
                </View>
            ) : (
                null
            )
        ))
    )
}
export default Figures

const styles = StyleSheet.create({
    figureContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: 5,
        borderBottomWidth: 1,
        borderColor: Theme.colors.primaryDarker,
        borderRadius: 5
    },

    figureInfos: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center'
    },

    figureImage: {
        width: 50,
        height: 50,
        marginRight: 10,
        borderTopLeftRadius: 5,
        borderBottomLeftRadius: 5
    },
    figureArrowContainer: {
        width: 40,
        display: 'flex',
        alignItems: 'center'
    }
})