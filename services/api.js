export const BASE_URL = 'https://api.themoviedb.org/3'
export async function api (url, params = {}){
    params = Object.assign({
        mode: 'cors',
        cache: 'no-cache',
    }, params)

    params.headers = Object.assign({
        accept: 'application/json',
        Authorization: `Bearer ${process.env.EXPO_PUBLIC_API_KEY}`,
    }, params.headers)

    let response = await fetch(BASE_URL + url, params)
    let json = await response.json() || {}
    
    if (!response.ok) {
        let errorMessage = json.error || response.status
        throw new Error(errorMessage)
    }
    return json
}