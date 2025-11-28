package com.example.backend.web;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> onValidation(MethodArgumentNotValidException e){
        return ResponseEntity.badRequest().body(Map.of(
                "error","validation_error",
                "message", e.getBindingResult().getAllErrors().get(0).getDefaultMessage()
        ));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String , Object>> onAny(Exception e){

        Map<String, Object> body = new HashMap<>();
        body.put("error",e.getClass().getSimpleName());
        body.put("messgae",e.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(body);

    }
}
