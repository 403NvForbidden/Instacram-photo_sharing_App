// change this when you integrate with the real API, or when u start using the dev server
const API_URL = 'http://127.0.0.1:5000'

const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
    };

const getJSON = (path, options) => 
    fetch(path, options)
        .then(res => res.json())
        .catch(err => console.warn(`API_ERROR: ${err.message}`));
    
/**
 * This is a sample class API which you may base your code on.
 * You don't have to do this as a class.
 */
export default class API {

    /**
     * Defaults to teh API URL
     * @param {string} url 
     */
    constructor(url = API_URL) {
        this.url = url;
    } 

    makeAPIRequest(path) {
        return getJSON(`${this.url}/${path}`);
    }

    /**
     * @returns auth'd user in json format
     */
    getMe() {
        return this.makeAPIRequest('me.json');
    }

    
    /**
     * signup
     */
    signUp(payload) {
        return getJSON(`${this.url}/auth/signup`,{
            headers,
            method: "POST",
            body: payload
        })
    }

    /**
     * login
     */
    login(payload) {
        return getJSON(`${this.url}/auth/login`,{
            headers,
            method: "POST",
            body: payload
        })
    }

    /**
     * /post
     */
    post(AUTH_KEY, payload) {
        return getJSON(`${this.url}/post`,{
            headers: {
                'Authorization':  'Token ' + AUTH_KEY,
                'Content-Type': 'application/json'
            },
            method: "POST",
            body: payload
        })
    }

    /**
     * /user
     * @returns user object array in json format
     */
    userInfo(AUTH_KEY, usr, id) {
        // check either usr of id is null
        if (id == null) {
            // render request uding id
            var url = new URL(`${this.url}/user/`),
            params = {username: usr}
            Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))
        } else {
            // render request uding username
            var url = new URL(`${this.url}/user/`),
            params = {id: id}
            Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))
        }

        return getJSON(url, {
            headers: {
                'Authorization':  'Token ' + AUTH_KEY,
                'Content-Type': 'application/json'
            },
            method: "GET"
        });
    }

    /**
     * /user/feed
     * @returns feed array in json format
     */
    getFeed(AUTH_KEY, start, numberLoaded) {
        if (AUTH_KEY == null) {
            // if not logged in 
            return getJSON(`http://localhost:8080/data/feed.json`);
        }
        
        var url = new URL(`${this.url}/user/feed`),
        params = {p: start, n: numberLoaded}
        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))
        
        return getJSON(url, {
            headers: {
                'Authorization':  'Token ' + AUTH_KEY,
                'Content-Type': 'application/json'
            },
            method: "GET"
        });
    }

    /**
     * /like or /unlike
     */
    like(AUTH_KEY, id, url) {
        var url = new URL(`${this.url}/${url}`),
        params = {id: id}
        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))
        return getJSON(url, {
            headers: {
                'Authorization':  'Token ' + AUTH_KEY,
                'Content-Type': 'application/json'
            },
            method: "PUT"
        });
    }

    /**
     * payload must be stringified
     */
    comment(AUTH_KEY, payload ,id) {
        var url = new URL(`${this.url}/post/comment`),
        params = {id: id}
        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))
        return getJSON(url, {
            headers: {
                'Authorization':  'Token ' + AUTH_KEY,
                'Content-Type': 'application/json'
            },
            method: "PUT",
            body: payload
        });
    }

    /**
     * /user
     */
    updateInfo(AUTH_KEY, payload) {
        return getJSON(`${this.url}/user`,{
            headers: {
                'Authorization':  'Token ' + AUTH_KEY,
                'Content-Type': 'application/json'
            },
            method: "PUT",
            body: payload
        })
    }

    /**
     * /follow or unfollow
     */
    follow_unfollow(AUTH_KEY, name, url) {
        var url = new URL(`${this.url}/${url}`),
        params = {username: name}
        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))
        return getJSON(url, {
            headers: {
                'Authorization':  'Token ' + AUTH_KEY,
                'Content-Type': 'application/json'
            },
            method: "PUT"
        });
    }
}