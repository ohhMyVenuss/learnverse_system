package org.example.backend.enums;

import com.fasterxml.jackson.annotation.JsonValue;

public enum Role {
    STUDENT,
    TEACHER,
    ADMIN;

    @JsonValue
    public String getValue() {
        return this.name();
    }
}
