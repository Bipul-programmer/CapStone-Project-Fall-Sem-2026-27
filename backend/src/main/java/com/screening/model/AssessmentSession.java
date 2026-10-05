package com.screening.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "assessment_sessions")
public class AssessmentSession {

    @Id
    private String id;

    @Field("parent_name")
    private String parentName;

    @Field("parent_email")
    private String parentEmail;

    @Field("parent_phone")
    private String parentPhone;

    @Field("child_name")
    private String childName;

    @Field("child_age")
    private int childAge;

    @Field("child_grade")
    private String childGrade;

    @Field("status")
    private String status; // "IN_PROGRESS", "COMPLETED"

    @Field("total_questions")
    private int totalQuestions = 15;

    @Field("created_at")
    private Instant createdAt = Instant.now();

    @Field("completed_at")
    private Instant completedAt;

    @Field("responses")
    private List<QuestionResponse> responses = new ArrayList<>();

    @Field("report")
    private AssessmentReport report;

    public AssessmentSession() {}

    public AssessmentSession(String parentName, String parentEmail, String parentPhone,
                             String childName, int childAge, String childGrade) {
        this.parentName = parentName;
        this.parentEmail = parentEmail;
        this.parentPhone = parentPhone;
        this.childName = childName;
        this.childAge = childAge;
        this.childGrade = childGrade;
        this.status = "IN_PROGRESS";
        this.totalQuestions = 15;
        this.createdAt = Instant.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getParentName() {
        return parentName;
    }

    public void setParentName(String parentName) {
        this.parentName = parentName;
    }

    public String getParentEmail() {
        return parentEmail;
    }

    public void setParentEmail(String parentEmail) {
        this.parentEmail = parentEmail;
    }

    public String getParentPhone() {
        return parentPhone;
    }

    public void setParentPhone(String parentPhone) {
        this.parentPhone = parentPhone;
    }

    public String getChildName() {
        return childName;
    }

    public void setChildName(String childName) {
        this.childName = childName;
    }

    public int getChildAge() {
        return childAge;
    }

    public void setChildAge(int childAge) {
        this.childAge = childAge;
    }

    public String getChildGrade() {
        return childGrade;
    }

    public void setChildGrade(String childGrade) {
        this.childGrade = childGrade;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public int getTotalQuestions() {
        return totalQuestions;
    }

    public void setTotalQuestions(int totalQuestions) {
        this.totalQuestions = totalQuestions;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(Instant completedAt) {
        this.completedAt = completedAt;
    }

    public List<QuestionResponse> getResponses() {
        return responses;
    }

    public void setResponses(List<QuestionResponse> responses) {
        this.responses = responses;
    }

    public AssessmentReport getReport() {
        return report;
    }

    public void setReport(AssessmentReport report) {
        this.report = report;
    }
}
