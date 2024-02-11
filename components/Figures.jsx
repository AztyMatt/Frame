import React from 'react'
import { StyleSheet, View, Image } from 'react-native'
import Theme from '../assets/styles.js'
import CustomText from './tags/CustomText'

const Figures = ({ figures, figuresVisible, selectedTab }) => {
    return (
        <View>
            {figures && figures.slice(0, figuresVisible).map((figure, index) => (
                <View key={index} style={styles.figureContainer}>
                    <View style={styles.figureInfos}>
                        {figure.profile_path ? (
                            <Image
                                style={styles.figureImage}
                                source={{ uri: `https://image.tmdb.org/t/p/w500/${figure.profile_path}` }}
                            />
                        ) : (
                            <Image
                                style={styles.figureImage}
                                source={require('../assets/icons/figure.png')}
                            />
                        )}
                        <View style={{ flexShrink: 1 }}>
                            <CustomText style={{ fontWeight: 'bold', fontSize: 15 }}>{figure.name}</CustomText>
                            {selectedTab === 'cast' && <CustomText>{figure.character}</CustomText>}
                            {selectedTab === 'crew' && <CustomText numberOfLines={1} ellipsizeMode='tail'>{figure.department} - {figure.job}</CustomText>}
                        </View>
                    </View>

                    <View style={styles.figureArrowContainer}>
                        <CustomText style={{ fontWeight: 'bold', fontSize: 20 }}>➤</CustomText>
                    </View>
                </View>
            ))}
        </View>
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
        width: '90%',
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
        width: '10%',
        display: 'flex',
        alignItems: 'center'
    }
})