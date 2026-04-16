const getEnv = (key: keyof ImportMetaEnv): string => {
  const value = import.meta.env[key]

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }

  return value
}

export const env = {
  API_URL: getEnv("VITE_API_URL"),
  APP_ENV: getEnv("VITE_APP_ENV"),
  OPENAI_ENABLED: getEnv("VITE_OPENAI_ENABLED") === "true",
  DEBUG: getEnv("VITE_DEBUG") === "true",
} as const