import axios, { AxiosError } from "axios";
import { parseCookies, setCookie } from 'nookies';

let cookies = parseCookies();
let isRefreshing = false;
let failedRequestsQueue = [];

export const api = axios.create({
  baseURL: 'http://localhost:3333',
  headers: {
    Authorization: `Bearer ${cookies['nextauth.token']}`
  }
});

type ResponseError = {
  code: string;
  error: boolean;
  message: string;
}

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<ResponseError>) => {
    if(error.response.status === 401) {
      if(error.response.data?.code === 'token.expired') {
        // renovar o token
        cookies = parseCookies();

        const { 'nextauth.refreshToken': refreshToken } = cookies;
        const originalConfig = error.config;
        
        if(!isRefreshing) {
          isRefreshing = true;
          
          api.post('/refresh', { refreshToken })
            .then(response => {
            const { token } = response.data;
  
            setCookie(undefined, 'nextauth.token', token, {
              maxAge: 60 * 60 * 24 * 30, // 30 days
              path: '/',
            });
      
            setCookie(undefined, 'nextauth.refreshToken', response.data.refreshToken, {
              maxAge: 60 * 60 * 24 * 30, // 30 days
              path: '/',
            });
  
              failedRequestsQueue.forEach(request => request.resolve(token));
              failedRequestsQueue = [];
            })
            .catch((error) => {
              failedRequestsQueue.forEach(request => request.reject(error));
              failedRequestsQueue = [];
            })
            .finally(() => { 
              isRefreshing = false
            });
        }

        return new Promise((resolve, reject) => {
          failedRequestsQueue.push({
            resolve: (token: string) => {
              originalConfig.headers['Authorization'] = `Bearer ${token}`;

              resolve(api(originalConfig));
            },
            reject: (error: AxiosError) => {
              reject(error);
            },
          })
        })
      } else {
        // deslogar o usu??rio
      }
    }
  }
);