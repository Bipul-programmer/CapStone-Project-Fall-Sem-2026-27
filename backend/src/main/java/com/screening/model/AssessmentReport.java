package com.screening.model;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class AssessmentReport {
    private double dyslexiaScore;
    private RiskLevel dyslexiaRisk;
    private String dyslexiaSummary;

    private double dysgraphiaScore;
    private RiskLevel dysgraphiaRisk;
    private String dysgraphiaSummary;

    private double dyscalculiaScore;
    private RiskLevel dyscalculiaRisk;
    private String dyscalculiaSummary;

    private RiskLevel overallRiskLevel;
    private String overallSummary;

    private Map<String, Double> parameterScores = new HashMap<>();
    private Map<String, Object> dysgraphiaMlDetails = new HashMap<>();
    private List<String> clinicalObservations = new ArrayList<>();
    private List<String> actionableRecommendations = new ArrayList<>();
    private Instant assessedAt = Instant.now();

    public AssessmentReport() {}

    public double getDyslexiaScore() {
        return dyslexiaScore;
    }

    public void setDyslexiaScore(double dyslexiaScore) {
        this.dyslexiaScore = dyslexiaScore;
    }

    public RiskLevel getDyslexiaRisk() {
        return dyslexiaRisk;
    }

    public void setDyslexiaRisk(RiskLevel dyslexiaRisk) {
        this.dyslexiaRisk = dyslexiaRisk;
    }

    public String getDyslexiaSummary() {
        return dyslexiaSummary;
    }

    public void setDyslexiaSummary(String dyslexiaSummary) {
        this.dyslexiaSummary = dyslexiaSummary;
    }

    public double getDysgraphiaScore() {
        return dysgraphiaScore;
    }

    public void setDysgraphiaScore(double dysgraphiaScore) {
        this.dysgraphiaScore = dysgraphiaScore;
    }

    public RiskLevel getDysgraphiaRisk() {
        return dysgraphiaRisk;
    }

    public void setDysgraphiaRisk(RiskLevel dysgraphiaRisk) {
        this.dysgraphiaRisk = dysgraphiaRisk;
    }

    public String getDysgraphiaSummary() {
        return dysgraphiaSummary;
    }

    public void setDysgraphiaSummary(String dysgraphiaSummary) {
        this.dysgraphiaSummary = dysgraphiaSummary;
    }

    public double getDyscalculiaScore() {
        return dyscalculiaScore;
    }

    public void setDyscalculiaScore(double dyscalculiaScore) {
        this.dyscalculiaScore = dyscalculiaScore;
    }

    public RiskLevel getDyscalculiaRisk() {
        return dyscalculiaRisk;
    }

    public void setDyscalculiaRisk(RiskLevel dyscalculiaRisk) {
        this.dyscalculiaRisk = dyscalculiaRisk;
    }

    public String getDyscalculiaSummary() {
        return dyscalculiaSummary;
    }

    public void setDyscalculiaSummary(String dyscalculiaSummary) {
        this.dyscalculiaSummary = dyscalculiaSummary;
    }

    public RiskLevel getOverallRiskLevel() {
        return overallRiskLevel;
    }

    public void setOverallRiskLevel(RiskLevel overallRiskLevel) {
        this.overallRiskLevel = overallRiskLevel;
    }

    public String getOverallSummary() {
        return overallSummary;
    }

    public void setOverallSummary(String overallSummary) {
        this.overallSummary = overallSummary;
    }

    public Map<String, Double> getParameterScores() {
        return parameterScores;
    }

    public void setParameterScores(Map<String, Double> parameterScores) {
        this.parameterScores = parameterScores;
    }

    public Map<String, Object> getDysgraphiaMlDetails() {
        return dysgraphiaMlDetails;
    }

    public void setDysgraphiaMlDetails(Map<String, Object> dysgraphiaMlDetails) {
        this.dysgraphiaMlDetails = dysgraphiaMlDetails;
    }

    public List<String> getClinicalObservations() {
        return clinicalObservations;
    }

    public void setClinicalObservations(List<String> clinicalObservations) {
        this.clinicalObservations = clinicalObservations;
    }

    public List<String> getActionableRecommendations() {
        return actionableRecommendations;
    }

    public void setActionableRecommendations(List<String> actionableRecommendations) {
        this.actionableRecommendations = actionableRecommendations;
    }

    public Instant getAssessedAt() {
        return assessedAt;
    }

    public void setAssessedAt(Instant assessedAt) {
        this.assessedAt = assessedAt;
    }
}
