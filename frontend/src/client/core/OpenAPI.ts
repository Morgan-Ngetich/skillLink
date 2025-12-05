/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
import type { ApiRequestOptions } from './ApiRequestOptions';
import { supabase } from "../../hooks/supabase/supabaseClient"

type Resolver<T> = (options: ApiRequestOptions) => Promise<T>;
type Headers = Record<string, string>;

export type OpenAPIConfig = {
    BASE: string;
    VERSION: string;
    WITH_CREDENTIALS: boolean;
    CREDENTIALS: 'include' | 'omit' | 'same-origin';
    TOKEN?: string | Resolver<string> | undefined;
    USERNAME?: string | Resolver<string> | undefined;
    PASSWORD?: string | Resolver<string> | undefined;
    HEADERS?: Headers | Resolver<Headers> | undefined;
    ENCODE_PATH?: ((path: string) => string) | undefined;
};

// Dynamic funtion to set token
//cache variables
let lastToken: string | null = null;
let lastTokenTime: number = 0;
const TOKEN_CACHE_TIME = 5000; // Cache for 5 seconds

const getToken = async (): Promise<string> => {
  try {
    // Return cached token if it's still fresh
    const now = Date.now();
    if (lastToken && now - lastTokenTime < TOKEN_CACHE_TIME) {
      return lastToken;
    }
    
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.warn('Supabase auth error:', error.message);
      lastToken = null;
      return '';
    }
    
    const newToken = session?.access_token || '';
    
    // Update cache
    lastToken = newToken;
    lastTokenTime = now;
    
    return newToken;
  } catch (error) {
    console.error('Failed to get auth token:', error);
    lastToken = null;
    return '';
  }
};

export const invalidateTokenCache = () => {
    lastToken = null;
    lastTokenTime= 0;
}

export const OpenAPI: OpenAPIConfig = {
    BASE: '',
    VERSION: '0.1.0',
    WITH_CREDENTIALS: true,
    CREDENTIALS: 'include',
    TOKEN: getToken,
    USERNAME: undefined,
    PASSWORD: undefined,
    HEADERS: undefined,
    ENCODE_PATH: undefined,
};
