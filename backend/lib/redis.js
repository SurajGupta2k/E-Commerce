import Redis from "ioredis"
import dotenv from "dotenv"

dotenv.config()

const redisClient = process.env.UPSTASH_REDIS_URL 
    ? new Redis(process.env.UPSTASH_REDIS_URL)
    : null;

if (!redisClient) {
    console.log("Redis URL not found, running without Redis caching");
}

export const redis = {
    get: async (key) => {
        if (!redisClient) return null;
        return await redisClient.get(key);
    },
    set: async (key, value, ...args) => {
        if (!redisClient) return;
        return await redisClient.set(key, value, ...args);
    },
    del: async (key) => {
        if (!redisClient) return;
        return await redisClient.del(key);
    }
};
