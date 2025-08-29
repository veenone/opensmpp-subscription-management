package com.smpp.cache;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.Set;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class CacheService {

    private final CacheManager cacheManager;
    private final RedisTemplate<String, Object> redisTemplate;

    /**
     * Invalidate specific cache entry
     */
    public void invalidateCacheEntry(String cacheName, String key) {
        log.info("Invalidating cache entry: {} - {}", cacheName, key);
        var cache = cacheManager.getCache(cacheName);
        if (cache != null) {
            cache.evict(key);
            log.debug("Cache entry invalidated successfully");
        } else {
            log.warn("Cache {} not found", cacheName);
        }
    }

    /**
     * Invalidate all entries in a specific cache
     */
    @CacheEvict(value = "#cacheName", allEntries = true)
    public void invalidateCache(String cacheName) {
        log.info("Invalidating all entries in cache: {}", cacheName);
        var cache = cacheManager.getCache(cacheName);
        if (cache != null) {
            cache.clear();
            log.debug("Cache {} cleared successfully", cacheName);
        } else {
            log.warn("Cache {} not found", cacheName);
        }
    }

    /**
     * Invalidate subscription-related caches for a specific MSISDN
     */
    public void invalidateSubscriptionCaches(String msisdn) {
        log.info("Invalidating subscription caches for MSISDN: {}", msisdn);
        
        // Invalidate specific subscription caches
        invalidateCacheEntry("subscription-by-msisdn", msisdn);
        invalidateCacheEntry("subscriptions", msisdn);
        
        // Clear statistics cache as it might be affected
        invalidateCache("subscription-stats");
        
        log.debug("Subscription caches invalidated for MSISDN: {}", msisdn);
    }

    /**
     * Invalidate user-related caches
     */
    public void invalidateUserCaches(String username) {
        log.info("Invalidating user caches for username: {}", username);
        
        invalidateCacheEntry("user-by-username", username);
        invalidateCacheEntry("users", username);
        invalidateCacheEntry("user-roles", username);
        
        log.debug("User caches invalidated for username: {}", username);
    }

    /**
     * Invalidate all caches
     */
    public void invalidateAllCaches() {
        log.warn("Invalidating all caches");
        
        Collection<String> cacheNames = cacheManager.getCacheNames();
        for (String cacheName : cacheNames) {
            invalidateCache(cacheName);
        }
        
        log.info("All {} caches invalidated", cacheNames.size());
    }

    /**
     * Get cache statistics
     */
    public CacheStatistics getCacheStatistics(String cacheName) {
        var cache = cacheManager.getCache(cacheName);
        if (cache == null) {
            return CacheStatistics.empty(cacheName);
        }

        // Get Redis cache keys
        Set<String> keys = redisTemplate.keys(cacheName + "::*");
        int size = keys != null ? keys.size() : 0;

        return CacheStatistics.builder()
                .cacheName(cacheName)
                .size(size)
                .hitRatio(calculateHitRatio(cacheName))
                .build();
    }

    /**
     * Warm up cache with initial data
     */
    public void warmUpCache(String cacheName, String key, Object value, long ttl, TimeUnit timeUnit) {
        log.info("Warming up cache: {} with key: {}", cacheName, key);
        
        String fullKey = cacheName + "::" + key;
        redisTemplate.opsForValue().set(fullKey, value, ttl, timeUnit);
        
        log.debug("Cache warmed up successfully");
    }

    /**
     * Check if cache contains a specific key
     */
    public boolean containsKey(String cacheName, String key) {
        String fullKey = cacheName + "::" + key;
        return Boolean.TRUE.equals(redisTemplate.hasKey(fullKey));
    }

    /**
     * Get cache TTL for a specific key
     */
    public Long getCacheTTL(String cacheName, String key) {
        String fullKey = cacheName + "::" + key;
        return redisTemplate.getExpire(fullKey, TimeUnit.SECONDS);
    }

    /**
     * Calculate cache hit ratio (simplified - would need metrics for accurate calculation)
     */
    private double calculateHitRatio(String cacheName) {
        // This is a placeholder - in production, you would track hits/misses
        // using Micrometer or similar metrics library
        return 0.0;
    }

    /**
     * Cache statistics DTO
     */
    @lombok.Data
    @lombok.Builder
    public static class CacheStatistics {
        private String cacheName;
        private int size;
        private double hitRatio;
        private long evictions;
        private long hits;
        private long misses;

        public static CacheStatistics empty(String cacheName) {
            return CacheStatistics.builder()
                    .cacheName(cacheName)
                    .size(0)
                    .hitRatio(0.0)
                    .evictions(0)
                    .hits(0)
                    .misses(0)
                    .build();
        }
    }
}