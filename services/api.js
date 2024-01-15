export const BASE_URL = 'https://api.themoviedb.org/3'
export async function api (url, params = {}){
    params = Object.assign({
        mode: 'cors',
        cache: 'no-cache',
    }, params)

    params.headers = Object.assign({
        accept: 'application/json',
        Authorization: `Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI4N2VhNmRlZTUzNTY4NzMyY2JjNGM4MWI3N2E0MTQ3MyIsInN1YiI6IjY1NzQ4MDJlYTFkMzMyMDBhY2I4NDBmZiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.wuke3H68aH_8A_ubMVLkz0pcr8q7kjyrqZgoU7VaCvk`,
    }, params.headers)

    let response = await fetch(BASE_URL + url, params)
    let json = await response.json() || {}
    
    if (!response.ok) {
        let errorMessage = json.error || response.status
        throw new Error(errorMessage)
    }
    return json
}