package com.screening.model;

import java.util.List;
import java.util.Map;

public class QuestionDefinition {
    private int id;
    private DisorderDomain domain;
    private String parameterName;
    private String parameterDescription;
    private String title;
    private String prompt;
    private String audioPrompt;
    private String type;
    private List<String> options;
    private String correctAnswer;
    private Map<String, Object> payload;

    public QuestionDefinition() {}

    public QuestionDefinition(int id, DisorderDomain domain, String parameterName,
                              String parameterDescription, String title, String prompt,
                              String audioPrompt, String type, List<String> options,
                              String correctAnswer, Map<String, Object> payload) {
        this.id = id;
        this.domain = domain;
        this.parameterName = parameterName;
        this.parameterDescription = parameterDescription;
        this.title = title;
        this.prompt = prompt;
        this.audioPrompt = audioPrompt;
        this.type = type;
        this.options = options;
        this.correctAnswer = correctAnswer;
        this.payload = payload;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public DisorderDomain getDomain() {
        return domain;
    }

    public void setDomain(DisorderDomain domain) {
        this.domain = domain;
    }

    public String getParameterName() {
        return parameterName;
    }

    public void setParameterName(String parameterName) {
        this.parameterName = parameterName;
    }

    public String getParameterDescription() {
        return parameterDescription;
    }

    public void setParameterDescription(String parameterDescription) {
        this.parameterDescription = parameterDescription;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getPrompt() {
        return prompt;
    }

    public void setPrompt(String prompt) {
        this.prompt = prompt;
    }

    public String getAudioPrompt() {
        return audioPrompt;
    }

    public void setAudioPrompt(String audioPrompt) {
        this.audioPrompt = audioPrompt;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public List<String> getOptions() {
        return options;
    }

    public void setOptions(List<String> options) {
        this.options = options;
    }

    public String getCorrectAnswer() {
        return correctAnswer;
    }

    public void setCorrectAnswer(String correctAnswer) {
        this.correctAnswer = correctAnswer;
    }

    public Map<String, Object> getPayload() {
        return payload;
    }

    public void setPayload(Map<String, Object> payload) {
        this.payload = payload;
    }
}
