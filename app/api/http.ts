// src/api/http.ts
import ky, {HTTPError} from 'ky';
import type {Options} from 'ky';
import Cookies from 'js-cookie';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getAccessToken = () => Cookies.get('access_token');
const getRefreshToken = () => Cookies.get('refresh_token');

const refreshTokenIfNeeded = async (
    request: Request,
    options: Options,
    response: Response
): Promise<Response | { status: string; message: string }> => {
    if (response.status === 401) {
        try {
            const errorData = await response.clone().json();

            const refreshToken = getRefreshToken();
            if (!refreshToken) return {"status": 'error', "message": 'Non connecté'};

            const refreshResponse = await ky.get(`${BASE_URL}/auth/refresh`, {
                headers: {
                    Authorization: `Bearer ${refreshToken}`,
                    'Content-Type': 'application/json',
                },
            }).json<{ data: { access_token: string; refresh_token?: string } }>();

            Cookies.set('access_token', refreshResponse.data.access_token);
            if (refreshResponse.data.refresh_token) {
                Cookies.set('refresh_token', refreshResponse.data.refresh_token);
            }

            // Récupération URL relative pour Ky
            const url = request.url.startsWith(BASE_URL)
                ? request.url.replace(BASE_URL + '/', '')
                : request.url;

            // On reconstitue les options originales avec le header à jour
            const newOptions: Options = {
                ...options,
                headers: {
                    ...(options.headers || {}),
                    Authorization: `Bearer ${refreshResponse.data.access_token}`,
                },
            };

            // Méthode d'origine
            const method = request.method?.toLowerCase() || 'get';

            // @ts-ignore
            return http(url, { method: method.toUpperCase(), ...newOptions });

        } catch (err) {
            console.error('Erreur lors du refresh du token :', err);
        }
    }

    return response;
};

const http = ky.create({
    prefixUrl: BASE_URL,
    timeout: 20000,
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        Accept: 'application/json',
        'Content-Type': 'application/json',
    },
    hooks: {
        beforeRequest: [
            (request) => {
                console.log('[DEBUG] access_token', Cookies.get('access_token'));

                const token = getAccessToken();
                if (token) {
                    request.headers.set('Authorization', `Bearer ${token}`);
                }
            },
        ],
        afterResponse: [refreshTokenIfNeeded],
    },
});

export const apiClient = {
    get: (url: string, options = {}) => http.get(url, options).json(),
    post: (url: string, json: any, options = {}) => http.post(url, {json, ...options}).json(),
    put: (url: string, json: any, options = {}) => http.put(url, {json, ...options}).json(),
    delete: (url: string, options = {}) => http.delete(url, options).json(),
};

export interface ApiResponse {
    status: string;
    message: string;
    data: any;
}

export const kyFetcher = async (url: string | URL): Promise<any> => {
    try {
        const response = await http.get(url.toString());
        return await response.json();
    } catch (error: any) {
        if (error instanceof HTTPError) {
            const errorBody = await error.response.json();
            return {'status': 'error', 'message': 'Non connecter'};
        }
        return {'status': 'error', 'message': 'Non connecter'};
    }
};
export default http;
