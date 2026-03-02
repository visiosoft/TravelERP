import api from '@/lib/api';

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface AuthResponse {
    user: {
        id: string;
        name: string;
        email: string;
        role: string;
    };
    accessToken: string;
    refreshToken: string;
}

export const authApi = {
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        const { data } = await api.post('/auth/login', credentials);
        return data.data;
    },

    logout: async (): Promise<void> => {
        await api.post('/auth/logout');
    },

    getProfile: async () => {
        const { data } = await api.get('/auth/me');
        return data.data;
    },

    refreshToken: async (refreshToken: string) => {
        const { data } = await api.post('/auth/refresh', { refreshToken });
        return data.data;
    },
};
