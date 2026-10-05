package com.screening.repository;

import com.screening.model.AssessmentSession;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssessmentSessionRepository extends MongoRepository<AssessmentSession, String> {
    List<AssessmentSession> findByChildNameContainingIgnoreCase(String childName);
    List<AssessmentSession> findByParentEmailIgnoreCase(String parentEmail);
    List<AssessmentSession> findAllByOrderByCreatedAtDesc();
}
