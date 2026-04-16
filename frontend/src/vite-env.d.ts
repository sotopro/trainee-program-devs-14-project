interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_APP_ENV: 'development' | 'staging' | 'production';
  readonly VITE_OPENAI_ENABLED: string
  readonly VITE_DEBUG: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}