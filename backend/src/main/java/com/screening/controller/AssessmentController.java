package com.screening.controller;

import com.screening.model.AssessmentReport;
import com.screening.model.AssessmentSession;
import com.screening.model.QuestionDefinition;
import com.screening.model.QuestionResponse;
import com.screening.repository.AssessmentSessionRepository;
import com.screening.service.AssessmentScoringService;
import com.screening.service.QuestionBankService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/assessments")
public class AssessmentController {

    private final AssessmentSessionRepository repository;
    private final QuestionBankService questionBankService;
    private final AssessmentScoringService scoringService;

    public AssessmentController(AssessmentSessionRepository repository,
                                QuestionBankService questionBankService,
                                AssessmentScoringService scoringService) {
        this.repository = repository;
        this.questionBankService = questionBankService;
        this.scoringService = scoringService;
    }

    /**
     * Get the 15 standard screening questions with parameter metadata.
     */
    @GetMapping("/questions")
    public ResponseEntity<List<QuestionDefinition>> getQuestions() {
        return ResponseEntity.ok(questionBankService.getAllQuestions());
    }

    /**
     * Parent & child registration / session initialization.
     */
    @PostMapping("/register")
    public ResponseEntity<AssessmentSession> register(@RequestBody Map<String, Object> payload) {
        String parentName = (String) payload.getOrDefault("parentName", "Parent");
        String parentEmail = (String) payload.getOrDefault("parentEmail", "");
        String parentPhone = (String) payload.getOrDefault("parentPhone", "");
        String childName = (String) payload.getOrDefault("childName", "Student");
        int childAge = payload.get("childAge") != null ? Integer.parseInt(payload.get("childAge").toString()) : 7;
        String childGrade = (String) payload.getOrDefault("childGrade", "2nd Grade");

        AssessmentSession session = new AssessmentSession(parentName, parentEmail, parentPhone, childName, childAge, childGrade);
        AssessmentSession saved = repository.save(session);
        return ResponseEntity.ok(saved);
    }

    /**
     * Submit all question responses, evaluate diagnostic scores and store report in MongoDB.
     */
    @PostMapping("/{sessionId}/submit")
    public ResponseEntity<?> submitResponses(@PathVariable String sessionId,
                                             @RequestBody List<QuestionResponse> responses) {
        return repository.findById(sessionId).map(session -> {
            session.setResponses(responses);
            session.setStatus("COMPLETED");
            session.setCompletedAt(Instant.now());

            AssessmentReport report = scoringService.generateReport(responses, session.getChildAge());
            session.setReport(report);

            AssessmentSession saved = repository.save(session);
            return ResponseEntity.ok(saved);
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Fetch session details and report by ID.
     */
    @GetMapping("/{sessionId}")
    public ResponseEntity<AssessmentSession> getSession(@PathVariable String sessionId) {
        return repository.findById(sessionId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Retrieve past assessment history.
     */
    @GetMapping("/history")
    public ResponseEntity<List<AssessmentSession>> getHistory(@RequestParam(required = false) String childName,
                                                              @RequestParam(required = false) String parentEmail) {
        if (childName != null && !childName.isBlank()) {
            return ResponseEntity.ok(repository.findByChildNameContainingIgnoreCase(childName));
        }
        if (parentEmail != null && !parentEmail.isBlank()) {
            return ResponseEntity.ok(repository.findByParentEmailIgnoreCase(parentEmail));
        }
        return ResponseEntity.ok(repository.findAllByOrderByCreatedAtDesc());
    }
}
