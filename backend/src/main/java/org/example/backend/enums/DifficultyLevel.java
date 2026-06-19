package org.example.backend.enums;


public enum DifficultyLevel {
    EASY("Dễ"),
    MEDIUM("Trung bình"),
    HARD("Khó");

    private final String displayName;

    DifficultyLevel(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}

