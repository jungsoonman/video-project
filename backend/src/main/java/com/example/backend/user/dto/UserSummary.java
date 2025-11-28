package com.example.backend.user.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UserSummary {

    private Long id;
    private String name;
    private String profileUrl;
}
