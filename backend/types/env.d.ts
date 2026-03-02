export { }

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            NODE_ENV: 'development' | 'production' | 'test'
            PORT?: string
            MONGODB_URI: string
            JWT_SECRET: string
            JWT_REFRESH_SECRET: string
            JWT_EXPIRES_IN: string
            JWT_REFRESH_EXPIRES_IN: string
            DEFAULT_ADMIN_EMAIL: string
            DEFAULT_ADMIN_PASSWORD: string
        }
    }
}
