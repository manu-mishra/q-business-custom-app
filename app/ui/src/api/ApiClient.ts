import axios from "axios";
import { signInWithRedirect } from 'aws-amplify/auth';
import { fetchAuthSession } from 'aws-amplify/auth';
const REACT_APP_API_BASE: string = process.env.REACT_APP_API_BASE_URL??'/api'

export const API = axios.create({
    baseURL: REACT_APP_API_BASE,

});
API.interceptors.request.use(async (request) => {
    try {
        const { idToken } = (await fetchAuthSession()).tokens ?? {};
        if(!idToken)
        {
            console.log('No-IdToken, initiating signin');
            signInWithRedirect();
        }
            
        request.headers.Authorization = `Bearer ${idToken?.toString()}`;
    } catch (err) {
        console.log('Error while getting ID Token',err);
    }
    return request;
});



