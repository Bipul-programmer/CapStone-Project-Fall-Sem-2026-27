package com.screening.model;

public enum RiskLevel {
    LOW_RISK("Low Risk / Age-Appropriate Development", "Performance is consistent with expected developmental benchmarks. Continue positive learning reinforcement."),
    MODERATE_TENDENCY("Moderate Tendency / Needs Focused Monitoring", "Shows notable friction in specific processing parameters. Targeted multi-sensory exercises and classroom accommodations are suggested."),
    HIGH_RISK("High Risk / Strong Clinical Indicator", "Significant indicators observed in core cognitive/motor metrics. Comprehensive evaluation with a licensed specialist (educational psychologist/pediatrician) is recommended.");

    private final String label;
    private final String advice;

    RiskLevel(String label, String advice) {
        this.label = label;
        this.advice = advice;
    }

    public String getLabel() {
        return label;
    }

    public String getAdvice() {
        return advice;
    }
}
