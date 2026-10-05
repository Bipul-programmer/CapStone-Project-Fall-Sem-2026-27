package com.screening.model;

public class QuestionResponse {
    private int questionId;
    private DisorderDomain domain;
    private String parameterTested;
    private String userAnswer;
    private String correctAnswer;
    private boolean isCorrect;
    private long timeTakenMs;
    private double motorJitterScore; // Canvas trajectory tremor/deviation
    private int motorHesitationCount;
    private boolean reversalDetected;
    private double magnitudeDistance;

    public QuestionResponse() {}

    public QuestionResponse(int questionId, DisorderDomain domain, String parameterTested,
                            String userAnswer, String correctAnswer, boolean isCorrect,
                            long timeTakenMs, double motorJitterScore, int motorHesitationCount,
                            boolean reversalDetected, double magnitudeDistance) {
        this.questionId = questionId;
        this.domain = domain;
        this.parameterTested = parameterTested;
        this.userAnswer = userAnswer;
        this.correctAnswer = correctAnswer;
        this.isCorrect = isCorrect;
        this.timeTakenMs = timeTakenMs;
        this.motorJitterScore = motorJitterScore;
        this.motorHesitationCount = motorHesitationCount;
        this.reversalDetected = reversalDetected;
        this.magnitudeDistance = magnitudeDistance;
    }

    public int getQuestionId() {
        return questionId;
    }

    public void setQuestionId(int questionId) {
        this.questionId = questionId;
    }

    public DisorderDomain getDomain() {
        return domain;
    }

    public void setDomain(DisorderDomain domain) {
        this.domain = domain;
    }

    public String getParameterTested() {
        return parameterTested;
    }

    public void setParameterTested(String parameterTested) {
        this.parameterTested = parameterTested;
    }

    public String getUserAnswer() {
        return userAnswer;
    }

    public void setUserAnswer(String userAnswer) {
        this.userAnswer = userAnswer;
    }

    public String getCorrectAnswer() {
        return correctAnswer;
    }

    public void setCorrectAnswer(String correctAnswer) {
        this.correctAnswer = correctAnswer;
    }

    public boolean isCorrect() {
        return isCorrect;
    }

    public void setCorrect(boolean correct) {
        isCorrect = correct;
    }

    public long getTimeTakenMs() {
        return timeTakenMs;
    }

    public void setTimeTakenMs(long timeTakenMs) {
        this.timeTakenMs = timeTakenMs;
    }

    public double getMotorJitterScore() {
        return motorJitterScore;
    }

    public void setMotorJitterScore(double motorJitterScore) {
        this.motorJitterScore = motorJitterScore;
    }

    public int getMotorHesitationCount() {
        return motorHesitationCount;
    }

    public void setMotorHesitationCount(int motorHesitationCount) {
        this.motorHesitationCount = motorHesitationCount;
    }

    public boolean isReversalDetected() {
        return reversalDetected;
    }

    public void setReversalDetected(boolean reversalDetected) {
        this.reversalDetected = reversalDetected;
    }

    public double getMagnitudeDistance() {
        return magnitudeDistance;
    }

    public void setMagnitudeDistance(double magnitudeDistance) {
        this.magnitudeDistance = magnitudeDistance;
    }
}
