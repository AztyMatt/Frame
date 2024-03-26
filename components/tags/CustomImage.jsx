import React from 'react'
import { StyleSheet, Image, View } from 'react-native'
import { capitalizeFirstLetter } from '../../utils.js'
import Theme from '../../assets/styles.js'
import CustomText from './CustomText.jsx'

const CustomImage = ({ source, style, resizeMode, fallback, fallbackContent }) => {

    const fallbacks = {
        Default: (fallbackSource) => () => (
            <Image style={style} resizeMode={resizeMode} source={fallbackSource} />
        ),

        Poster: (movieTitle) => () => (
            <View style={style}>
                <Image
                    style={{width: '100%', height: '100%'}}
                    resizeMode={resizeMode}
                    source={require('../../assets/poster.png')}
                />
                <View style={[styles.center, { position: 'absolute', padding: 10 }]}>
                    <CustomText numberOfLines={2} ellipsizeMode='tail' style={{fontWeight: 'bold'}}>
                        {movieTitle}
                    </CustomText>
                </View>
            </View>
        ),
        Provider: () => (
            <View style={style}>
                <View style={[styles.center, {}]}>
                    <CustomText>?</CustomText>
                </View>
            </View>
        ),
        CollectionBackdrop: () => (
            <View style={{width: '100%', height: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                <Image
                    style={{height: '100%', transform: [{ scaleX: -1 }]}}
                    resizeMode={resizeMode}
                    source={require('../../assets/poster.png')}
                />
                <Image
                    style={{height: '100%', transform: [{ scaleX: -1 }]}}
                    resizeMode={resizeMode}
                    source={require('../../assets/poster.png')}
                />
                <View style={{position: 'absolute', width: '100%', height: '100%', top: 0, right: 0, paddingHorizontal: 50}}>
                    <View style={{backgroundColor: Theme.colors.secondaryDarker, width: '100%', height: '100%'}}></View>
                </View>
            </View>
        )
    }

    const CreateCustomFallback = () => {
        if (fallback) {
            const fallbackFunction = fallbacks[capitalizeFirstLetter(fallback)]

            if (fallbackFunction.length !== 0 && !fallbackContent) {
                throw new Error('fallbackContent is required when using a fallback with parameters.')
            }
    
            return typeof fallback === 'string' && fallbackFunction
                    ? fallbackFunction.length !== 0
                        ? fallbackFunction(fallbackContent)
                        : fallbackFunction
                    : null
        }
    }
    const CustomFallback = CreateCustomFallback() // Clearer than using IIFE

    return (
        source ? (
            <Image style={style} resizeMode={resizeMode} source={{ uri: `https://image.tmdb.org/t/p/original${source}`}} />
        ) : (
            fallback ? (
                CustomFallback && <CustomFallback />
            ) : (
                null
            )
        )
    )
}
export default CustomImage

const styles = StyleSheet.create({
    center: {
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    }
})

// // Movie.jsx
// {data.backdrop_path ? ( //
//     <Image
//         style={{ // backdrop 1
//             position: 'absolute',
//             width: '100%',
//             height: 220,
//             top: 0,
//             left: 0,
//         }}
//         // resizeMode='contain' //
//         source={{
//             uri: `https://image.tmdb.org/t/p/original${data.backdrop_path}`,
//         }}
//     />
// ) : (
//     null //
// )}

// {data.poster_path ? (
//     <Image
//         style={{ // poster 2
//             height: '100%',
//             width: 120,
//             borderWidth: 1,
//             borderColor: Theme.colors.secondary,
//             borderRadius: 10,
//             backgroundColor: Theme.colors.secondaryDarker,
//             marginLeft: 10,
//             overflow: 'hidden'
//         }}
//         resizeMode='contain'
//         source={{
//             uri: `https://image.tmdb.org/t/p/original${data.poster_path}`,
//         }}
//     />
// ) : (
//     <View style={{ // poster 2
//         height: '100%',
//         width: 120,
//         borderWidth: 1,
//         borderColor: Theme.colors.secondary,
//         borderRadius: 10,
//         backgroundColor: Theme.colors.secondaryDarker,
//         marginLeft: 10,
//         overflow: 'hidden'
//     }}>
//         <Image
//             style={{width: '100%', height: '100%'}}
//             resizeMode='contain'
//             source={
//                 require('../../assets/poster.png')
//             }
//         />
//         <View style={{position: 'absolute', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 10}}>
//             <CustomText
//                 style={{fontWeight: 'bold'}}
//                 numberOfLines={2} ellipsizeMode='tail'
//             >
//                 { data.title }
//             </CustomText>
//         </View>
//     </View>
// )}

// {provider.logo_path ? (
//     <Image
//         style={{ // provider 3
//             height: 25,
//             width: 25,
//             borderWidth: 1,
//             borderColor: Theme.colors.primaryDarker,
//             borderRadius: 5
//         }}
//         resizeMode='contain'
//         source={{
//             uri: `https://image.tmdb.org/t/p/original${provider.logo_path}`,
//         }}
//     />
// ) : (
//     <View style={{ // provider 3
//         height: 25,
//         width: 25,
//         borderWidth: 1,
//         borderColor: Theme.colors.primaryDarker,
//         borderRadius: 5
//     }}>
//         <View style={{width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
//             <CustomText>?</CustomText>
//         </View>
//     </View>
// )}

// {data.belongs_to_collection.backdrop_path ? (
//     <Image
//         style={{ // backdrop 1
//             position: 'absolute',
//             width: '100%',
//             height: 220,
//             top: 0,
//             left: 0,
//         }}
//         // resizeMode='contain'
//         source={{
//             uri: `https://image.tmdb.org/t/p/original${data.belongs_to_collection.backdrop_path}`,
//         }}
//     />
// ) : (
//     <Image
//         style={{ // backdrop 1
//             position: 'absolute',
//             width: '100%',
//             height: 220,
//             top: 0,
//             left: 0,
//         }}
//         // resizeMode='contain'
//         source={require('../../assets/backdrop.png')}
//     />
// )}

// // Home.jsx
// {firstUpcoming.backdrop_path ? (
//     <Image
//         style={{ // backdrop (Home) 5
//             height: 220,
//         }}
//         // resizeMode='contain'
//         source={{
//             uri: `https://image.tmdb.org/t/p/original${firstUpcoming.backdrop_path}`,
//         }}
//     />
// ) : (
//     null
// )}

// // MoviesHorizontalList.jsx
// {movie.poster_path ? (
//     <Image
//         style={{ // poster (MoviesHorizontalList) 6
//             height: 150,
//             width: 100,
//             borderWidth: 1,
//             borderColor: Theme.colors.primaryDarker,
//             borderRadius: 5,
//             overflow: 'hidden'
//         }}
//         resizeMode='contain'
//         source={{ uri: `https://image.tmdb.org/t/p/original${movie.poster_path}` }}
//     />
// ) : (
//     <View style={{ // poster (MoviesHorizontalList) 6
//         height: 150,
//         width: 100,
//         borderWidth: 1,
//         borderColor: Theme.colors.primaryDarker,
//         borderRadius: 5,
//         overflow: 'hidden'
//     }}>
//         <Image
//             style={{width: '100%', height: '100%'}}
//             resizeMode='contain'
//             source={
//                 require('../assets/poster.png')
//             }
//         />
//         <View style={{position: 'absolute', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 10}}>
//             <CustomText
//                 style={{fontWeight: 'bold'}}
//                 numberOfLines={2} ellipsizeMode='tail'
//             >
//                 { movie.title }
//             </CustomText>
//         </View>
//     </View>
// )}

// // Figures.jsx
// {figure.profile_path ? (
//     <Image
//         style={{ // figureImage 7
//             width: 50,
//             height: 50,
//             marginRight: 10,
//             borderTopLeftRadius: 5,
//             borderBottomLeftRadius: 5
//         }}
//         source={{ uri: `https://image.tmdb.org/t/p/w500${figure.profile_path}` }} // !
//     />
// ) : (
//     <Image
//         style={{ // figureImage 7
//             width: 50,
//             height: 50,
//             marginRight: 10,
//             borderTopLeftRadius: 5,
//             borderBottomLeftRadius: 5
//         }}
//         source={require('../assets/icons/figure.png')}
//     />
// )}

// // ReviewsCarousel.jsx
// {review.author_details.avatar_path ? (
//     <Image
//         style={{ // authorAvatar 8
//             height: 40,
//             width: 40,
//             borderWidth: 1,
//             borderColor: Theme.colors.primaryDarker,
//             borderRadius: 5
//         }}
//         resizeMode='cover'
//         source={{
//         uri: `https://image.tmdb.org/t/p/original${review.author_details.avatar_path}`,
//         }}
//     />
// ) : (
//     <Image
//         style={{ // authorAvatar 8
//             height: 40,
//             width: 40,
//             borderWidth: 1,
//             borderColor: Theme.colors.primaryDarker,
//             borderRadius: 5
//         }}
//         resizeMode='cover'
//         source={require('../assets/icons/figure.png')}
//     />
// )}