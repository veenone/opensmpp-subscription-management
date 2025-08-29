package com.smpp.subscription.config;

import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.retry.annotation.EnableRetry;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;

@Configuration
@EnableScheduling
@EnableAsync
@EnableRetry
public class SyncConfig {

    /**
     * RestTemplate for webhook and external API calls
     */
    @Bean("syncRestTemplate")
    public RestTemplate syncRestTemplate(RestTemplateBuilder builder) {
        return builder
                .setConnectTimeout(Duration.ofMillis(5000))
                .setReadTimeout(Duration.ofMillis(10000))
                .build();
    }

    /**
     * RestTemplate specifically for Amarisoft API calls
     */
    @Bean("amarisoftRestTemplate")
    public RestTemplate amarisoftRestTemplate(RestTemplateBuilder builder, SyncConfiguration syncConfig) {
        return builder
                .setConnectTimeout(Duration.ofMillis(syncConfig.getAmarisoft().getTimeout()))
                .setReadTimeout(Duration.ofMillis(syncConfig.getAmarisoft().getTimeout() * 2))
                .basicAuthentication(
                    syncConfig.getAmarisoft().getUsername(),
                    syncConfig.getAmarisoft().getPassword()
                )
                .build();
    }
}