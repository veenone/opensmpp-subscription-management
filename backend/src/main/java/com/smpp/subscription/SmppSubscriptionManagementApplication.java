package com.smpp.subscription;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.retry.annotation.EnableRetry;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableCaching
@EnableAsync
@EnableScheduling
@EnableRetry
@EnableConfigurationProperties
public class SmppSubscriptionManagementApplication {

    public static void main(String[] args) {
        SpringApplication.run(SmppSubscriptionManagementApplication.class, args);
    }
}