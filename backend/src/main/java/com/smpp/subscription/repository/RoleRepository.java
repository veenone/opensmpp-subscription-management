package com.smpp.subscription.repository;

import com.smpp.subscription.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.Set;

/**
 * Repository interface for Role entities
 */
@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {

    /**
     * Find role by name
     */
    Optional<Role> findByName(String name);

    /**
     * Check if role exists by name
     */
    boolean existsByName(String name);

    /**
     * Find all system roles
     */
    @Query("SELECT r FROM Role r WHERE r.isSystemRole = true")
    Set<Role> findSystemRoles();

    /**
     * Find roles by user ID
     */
    @Query("SELECT r FROM Role r JOIN r.users u WHERE u.id = :userId")
    Set<Role> findByUserId(@Param("userId") Long userId);

    /**
     * Find roles containing specific permission
     */
    @Query("SELECT r FROM Role r JOIN r.permissions p WHERE p.name = :permissionName")
    Set<Role> findByPermissionName(@Param("permissionName") String permissionName);
}