package com.smpp.cache;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.CachingConfigurer;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.interceptor.KeyGenerator;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.*;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@Configuration
@EnableCaching
public class RedisConfig implements CachingConfigurer {

    @Value("${spring.redis.host:localhost}")
    private String redisHost;

    @Value("${spring.redis.port:6379}")
    private int redisPort;

    @Value("${spring.redis.password:}")
    private String redisPassword;

    @Value("${spring.redis.database:0}")
    private int redisDatabase;

    @Value("${cache.default-ttl:3600}")
    private long defaultTtl;

    @Value("${cache.subscription-ttl:1800}")
    private long subscriptionTtl;

    @Value("${cache.user-ttl:900}")
    private long userTtl;

    @Bean
    public RedisConnectionFactory redisConnectionFactory() {
        RedisStandaloneConfiguration redisConfig = new RedisStandaloneConfiguration();
        redisConfig.setHostName(redisHost);
        redisConfig.setPort(redisPort);
        if (redisPassword != null && !redisPassword.isEmpty()) {
            redisConfig.setPassword(redisPassword);
        }
        redisConfig.setDatabase(redisDatabase);
        
        return new LettuceConnectionFactory(redisConfig);
    }

    @Bean
    @Primary
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);

        // Configure Jackson serializer with type information
        Jackson2JsonRedisSerializer<Object> jackson2JsonRedisSerializer = configureJacksonSerializer();

        // Set serializers
        template.setKeySerializer(new StringRedisSerializer());
        template.setHashKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(jackson2JsonRedisSerializer);
        template.setHashValueSerializer(jackson2JsonRedisSerializer);
        template.setDefaultSerializer(jackson2JsonRedisSerializer);
        
        template.afterPropertiesSet();
        return template;
    }

    @Bean
    public CacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        // Default cache configuration
        RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofSeconds(defaultTtl))
                .serializeKeysWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(new GenericJackson2JsonRedisSerializer()))
                .disableCachingNullValues();

        // Cache-specific configurations
        Map<String, RedisCacheConfiguration> cacheConfigurations = new HashMap<>();
        
        // Subscription cache configuration
        cacheConfigurations.put("subscriptions", 
                defaultConfig.entryTtl(Duration.ofSeconds(subscriptionTtl)));
        cacheConfigurations.put("subscription-by-msisdn", 
                defaultConfig.entryTtl(Duration.ofSeconds(subscriptionTtl)));
        cacheConfigurations.put("subscription-by-impi", 
                defaultConfig.entryTtl(Duration.ofSeconds(subscriptionTtl)));
        
        // User cache configuration
        cacheConfigurations.put("users", 
                defaultConfig.entryTtl(Duration.ofSeconds(userTtl)));
        cacheConfigurations.put("user-by-username", 
                defaultConfig.entryTtl(Duration.ofSeconds(userTtl)));
        cacheConfigurations.put("user-roles", 
                defaultConfig.entryTtl(Duration.ofSeconds(userTtl)));
        
        // Sync status cache (shorter TTL)
        cacheConfigurations.put("sync-status", 
                defaultConfig.entryTtl(Duration.ofSeconds(60)));
        
        // Statistics cache
        cacheConfigurations.put("subscription-stats", 
                defaultConfig.entryTtl(Duration.ofSeconds(300)));

        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(defaultConfig)
                .withInitialCacheConfigurations(cacheConfigurations)
                .transactionAware()
                .build();
    }

    @Bean
    public KeyGenerator customKeyGenerator() {
        return (target, method, params) -> {
            StringBuilder sb = new StringBuilder();
            sb.append(target.getClass().getSimpleName());
            sb.append(".");
            sb.append(method.getName());
            for (Object param : params) {
                sb.append(".");
                if (param != null) {
                    sb.append(param.toString());
                } else {
                    sb.append("null");
                }
            }
            return sb.toString();
        };
    }

    private Jackson2JsonRedisSerializer<Object> configureJacksonSerializer() {
        Jackson2JsonRedisSerializer<Object> serializer = new Jackson2JsonRedisSerializer<>(Object.class);
        
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.activateDefaultTyping(
                objectMapper.getPolymorphicTypeValidator(),
                ObjectMapper.DefaultTyping.NON_FINAL,
                JsonTypeInfo.As.PROPERTY
        );
        
        serializer.setObjectMapper(objectMapper);
        return serializer;
    }
}