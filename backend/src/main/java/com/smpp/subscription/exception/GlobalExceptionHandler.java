package com.smpp.subscription.exception;

import com.smpp.subscription.dto.ErrorResponse;
import jakarta.persistence.EntityExistsException;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.NoHandlerFoundException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Global exception handler for consistent error responses across the API.
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Handles validation errors from @Valid annotations on request bodies.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationExceptions(
            MethodArgumentNotValidException ex, HttpServletRequest request) {
        
        String traceId = generateTraceId();
        log.warn("Validation failed for request [{}] {}: {}", 
            traceId, request.getRequestURI(), ex.getMessage());
        
        Map<String, List<String>> validationErrors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            validationErrors.computeIfAbsent(fieldName, k -> new java.util.ArrayList<>())
                           .add(errorMessage);
        });

        ErrorResponse errorResponse = ErrorResponse.builder()
            .status(HttpStatus.BAD_REQUEST.value())
            .errorCode("VALIDATION_FAILED")
            .message("Validation failed for request")
            .validationErrors(validationErrors)
            .path(request.getRequestURI())
            .method(request.getMethod())
            .traceId(traceId)
            .build();

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handles constraint violations from bean validation.
     */
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handleConstraintViolationException(
            ConstraintViolationException ex, HttpServletRequest request) {
        
        String traceId = generateTraceId();
        log.warn("Constraint violation [{}] {}: {}", 
            traceId, request.getRequestURI(), ex.getMessage());

        Map<String, List<String>> validationErrors = new HashMap<>();
        for (ConstraintViolation<?> violation : ex.getConstraintViolations()) {
            String fieldName = violation.getPropertyPath().toString();
            String errorMessage = violation.getMessage();
            validationErrors.computeIfAbsent(fieldName, k -> new java.util.ArrayList<>())
                           .add(errorMessage);
        }

        ErrorResponse errorResponse = ErrorResponse.builder()
            .status(HttpStatus.BAD_REQUEST.value())
            .errorCode("CONSTRAINT_VIOLATION")
            .message("Constraint violation in request")
            .validationErrors(validationErrors)
            .path(request.getRequestURI())
            .method(request.getMethod())
            .traceId(traceId)
            .build();

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handles entity not found exceptions.
     */
    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleEntityNotFoundException(
            EntityNotFoundException ex, HttpServletRequest request) {
        
        String traceId = generateTraceId();
        log.warn("Entity not found [{}] {}: {}", 
            traceId, request.getRequestURI(), ex.getMessage());

        ErrorResponse errorResponse = ErrorResponse.detailed(
            HttpStatus.NOT_FOUND.value(),
            "ENTITY_NOT_FOUND",
            "Requested resource not found",
            ex.getMessage(),
            request.getRequestURI(),
            request.getMethod()
        );
        errorResponse.setTraceId(traceId);

        return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
    }

    /**
     * Handles entity already exists exceptions.
     */
    @ExceptionHandler(EntityExistsException.class)
    public ResponseEntity<ErrorResponse> handleEntityExistsException(
            EntityExistsException ex, HttpServletRequest request) {
        
        String traceId = generateTraceId();
        log.warn("Entity already exists [{}] {}: {}", 
            traceId, request.getRequestURI(), ex.getMessage());

        ErrorResponse errorResponse = ErrorResponse.detailed(
            HttpStatus.CONFLICT.value(),
            "ENTITY_ALREADY_EXISTS",
            "Resource already exists",
            ex.getMessage(),
            request.getRequestURI(),
            request.getMethod()
        );
        errorResponse.setTraceId(traceId);

        return new ResponseEntity<>(errorResponse, HttpStatus.CONFLICT);
    }

    /**
     * Handles database integrity violations.
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrityViolation(
            DataIntegrityViolationException ex, HttpServletRequest request) {
        
        String traceId = generateTraceId();
        log.error("Data integrity violation [{}] {}: {}", 
            traceId, request.getRequestURI(), ex.getMessage());

        String message = "Data integrity violation";
        String details = ex.getMessage();
        
        // Check for common constraint violations
        if (ex.getMessage().contains("unique constraint") || 
            ex.getMessage().contains("duplicate key")) {
            message = "Duplicate data detected";
            details = "A record with this data already exists";
        }

        ErrorResponse errorResponse = ErrorResponse.detailed(
            HttpStatus.CONFLICT.value(),
            "DATA_INTEGRITY_VIOLATION",
            message,
            details,
            request.getRequestURI(),
            request.getMethod()
        );
        errorResponse.setTraceId(traceId);

        return new ResponseEntity<>(errorResponse, HttpStatus.CONFLICT);
    }

    /**
     * Handles authentication exceptions.
     */
    @ExceptionHandler({AuthenticationException.class, BadCredentialsException.class})
    public ResponseEntity<ErrorResponse> handleAuthenticationException(
            AuthenticationException ex, HttpServletRequest request) {
        
        String traceId = generateTraceId();
        log.warn("Authentication failed [{}] {}: {}", 
            traceId, request.getRequestURI(), ex.getMessage());

        ErrorResponse errorResponse = ErrorResponse.detailed(
            HttpStatus.UNAUTHORIZED.value(),
            "AUTHENTICATION_FAILED",
            "Authentication required",
            "Invalid credentials or authentication token",
            request.getRequestURI(),
            request.getMethod()
        );
        errorResponse.setTraceId(traceId);

        return new ResponseEntity<>(errorResponse, HttpStatus.UNAUTHORIZED);
    }

    /**
     * Handles authorization (access denied) exceptions.
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDeniedException(
            AccessDeniedException ex, HttpServletRequest request) {
        
        String traceId = generateTraceId();
        log.warn("Access denied [{}] {}: {}", 
            traceId, request.getRequestURI(), ex.getMessage());

        ErrorResponse errorResponse = ErrorResponse.detailed(
            HttpStatus.FORBIDDEN.value(),
            "ACCESS_DENIED",
            "Access denied",
            "Insufficient permissions to access this resource",
            request.getRequestURI(),
            request.getMethod()
        );
        errorResponse.setTraceId(traceId);

        return new ResponseEntity<>(errorResponse, HttpStatus.FORBIDDEN);
    }

    /**
     * Handles malformed JSON requests.
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleHttpMessageNotReadable(
            HttpMessageNotReadableException ex, HttpServletRequest request) {
        
        String traceId = generateTraceId();
        log.warn("Malformed request body [{}] {}: {}", 
            traceId, request.getRequestURI(), ex.getMessage());

        ErrorResponse errorResponse = ErrorResponse.detailed(
            HttpStatus.BAD_REQUEST.value(),
            "MALFORMED_REQUEST",
            "Malformed request body",
            "Request body could not be parsed as valid JSON",
            request.getRequestURI(),
            request.getMethod()
        );
        errorResponse.setTraceId(traceId);

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handles missing request parameters.
     */
    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ErrorResponse> handleMissingParams(
            MissingServletRequestParameterException ex, HttpServletRequest request) {
        
        String traceId = generateTraceId();
        log.warn("Missing request parameter [{}] {}: {}", 
            traceId, request.getRequestURI(), ex.getMessage());

        ErrorResponse errorResponse = ErrorResponse.detailed(
            HttpStatus.BAD_REQUEST.value(),
            "MISSING_PARAMETER",
            "Required parameter missing",
            String.format("Required parameter '%s' of type '%s' is missing", 
                ex.getParameterName(), ex.getParameterType()),
            request.getRequestURI(),
            request.getMethod()
        );
        errorResponse.setTraceId(traceId);

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handles method argument type mismatch.
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponse> handleTypeMismatch(
            MethodArgumentTypeMismatchException ex, HttpServletRequest request) {
        
        String traceId = generateTraceId();
        log.warn("Type mismatch [{}] {}: {}", 
            traceId, request.getRequestURI(), ex.getMessage());

        String details = String.format("Parameter '%s' should be of type '%s'", 
            ex.getName(), ex.getRequiredType().getSimpleName());

        ErrorResponse errorResponse = ErrorResponse.detailed(
            HttpStatus.BAD_REQUEST.value(),
            "TYPE_MISMATCH",
            "Parameter type mismatch",
            details,
            request.getRequestURI(),
            request.getMethod()
        );
        errorResponse.setTraceId(traceId);

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handles unsupported HTTP methods.
     */
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ErrorResponse> handleMethodNotSupported(
            HttpRequestMethodNotSupportedException ex, HttpServletRequest request) {
        
        String traceId = generateTraceId();
        log.warn("Method not supported [{}] {}: {}", 
            traceId, request.getRequestURI(), ex.getMessage());

        String supportedMethods = ex.getSupportedHttpMethods().stream()
            .map(Object::toString)
            .collect(Collectors.joining(", "));

        ErrorResponse errorResponse = ErrorResponse.detailed(
            HttpStatus.METHOD_NOT_ALLOWED.value(),
            "METHOD_NOT_ALLOWED",
            "HTTP method not supported",
            String.format("Supported methods: %s", supportedMethods),
            request.getRequestURI(),
            request.getMethod()
        );
        errorResponse.setTraceId(traceId);

        return new ResponseEntity<>(errorResponse, HttpStatus.METHOD_NOT_ALLOWED);
    }

    /**
     * Handles 404 not found errors.
     */
    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<ErrorResponse> handleNoHandlerFound(
            NoHandlerFoundException ex, HttpServletRequest request) {
        
        String traceId = generateTraceId();
        log.warn("No handler found [{}] {}: {}", 
            traceId, request.getRequestURI(), ex.getMessage());

        ErrorResponse errorResponse = ErrorResponse.detailed(
            HttpStatus.NOT_FOUND.value(),
            "ENDPOINT_NOT_FOUND",
            "Endpoint not found",
            String.format("No handler found for %s %s", 
                ex.getHttpMethod(), ex.getRequestURL()),
            request.getRequestURI(),
            request.getMethod()
        );
        errorResponse.setTraceId(traceId);

        return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
    }

    /**
     * Handles all other unhandled exceptions.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(
            Exception ex, HttpServletRequest request) {
        
        String traceId = generateTraceId();
        log.error("Unhandled exception [{}] {}: {}", 
            traceId, request.getRequestURI(), ex.getMessage(), ex);

        ErrorResponse errorResponse = ErrorResponse.detailed(
            HttpStatus.INTERNAL_SERVER_ERROR.value(),
            "INTERNAL_SERVER_ERROR",
            "An internal server error occurred",
            "Please contact support if this issue persists",
            request.getRequestURI(),
            request.getMethod()
        );
        errorResponse.setTraceId(traceId);

        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    /**
     * Generates a unique trace ID for error tracking.
     * 
     * @return unique trace ID
     */
    private String generateTraceId() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 12);
    }
}