package com.smpp.subscription.config;

import com.smpp.subscription.entity.Role;
import com.smpp.subscription.entity.User;
import com.smpp.subscription.repository.RoleRepository;
import com.smpp.subscription.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * Data initializer for local development profile
 * Creates default admin user and basic roles
 */
@Component
@Profile("local")
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        initializeRoles();
        initializeDefaultAdminUser();
    }

    private void initializeRoles() {
        if (roleRepository.count() == 0) {
            Role adminRole = new Role();
            adminRole.setName("ROLE_ADMIN");
            adminRole.setDescription("System Administrator with full access");
            adminRole.setSystemRole(true);
            adminRole.setCreatedAt(LocalDateTime.now());
            roleRepository.save(adminRole);

            Role userRole = new Role();
            userRole.setName("ROLE_USER");
            userRole.setDescription("Standard user with basic access");
            userRole.setSystemRole(true);
            userRole.setCreatedAt(LocalDateTime.now());
            roleRepository.save(userRole);

            System.out.println("✅ Default roles created successfully");
        }
    }

    private void initializeDefaultAdminUser() {
        if (userRepository.findByUsername("admin").isEmpty()) {
            User adminUser = new User();
            adminUser.setUsername("admin");
            adminUser.setEmail("admin@smpp-system.local");
            adminUser.setPassword(passwordEncoder.encode("Admin@123!"));
            adminUser.setFirstName("System");
            adminUser.setLastName("Administrator");
            adminUser.setActive(true);
            adminUser.setLocked(false);
            adminUser.setFailedLoginAttempts(0);
            adminUser.setMfaEnabled(false);
            adminUser.setAuthProvider(User.AuthProvider.DATABASE);
            adminUser.setPasswordChangedAt(LocalDateTime.now());
            adminUser.setCreatedAt(LocalDateTime.now());
            adminUser.setCreatedBy("SYSTEM");

            // Assign admin role
            Role adminRole = roleRepository.findByName("ROLE_ADMIN").orElse(null);
            if (adminRole != null) {
                Set<Role> roles = new HashSet<>();
                roles.add(adminRole);
                adminUser.setRoles(roles);
            }

            userRepository.save(adminUser);
            System.out.println("✅ Default admin user created successfully (username: admin, password: Admin@123!)");
        }
    }
}