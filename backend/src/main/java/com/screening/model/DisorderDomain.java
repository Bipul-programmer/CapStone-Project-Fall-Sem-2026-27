package com.screening.model;

public enum DisorderDomain {
    DYSLEXIA("Dyslexia", "Reading, Phonological Processing & Grapheme Orientation"),
    DYSGRAPHIA("Dysgraphia", "Written Expression, Fine Motor Kinematics & Spatial Organization"),
    DYSCALCULIA("Dyscalculia", "Number Sense, Rapid Subitizing & Arithmetic Reasoning");

    private final String displayName;
    private final String description;

    DisorderDomain(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }
}
