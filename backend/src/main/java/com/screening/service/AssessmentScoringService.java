package com.screening.service;

import com.screening.model.*;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;

@Service
public class AssessmentScoringService {

    public AssessmentReport generateReport(List<QuestionResponse> responses, int childAge) {
        AssessmentReport report = new AssessmentReport();
        report.setAssessedAt(Instant.now());

        List<QuestionResponse> dyslexiaResponses = new ArrayList<>();
        List<QuestionResponse> dysgraphiaResponses = new ArrayList<>();
        List<QuestionResponse> dyscalculiaResponses = new ArrayList<>();

        for (QuestionResponse r : responses) {
            if (r.getDomain() == DisorderDomain.DYSLEXIA) {
                dyslexiaResponses.add(r);
            } else if (r.getDomain() == DisorderDomain.DYSGRAPHIA) {
                dysgraphiaResponses.add(r);
            } else if (r.getDomain() == DisorderDomain.DYSCALCULIA) {
                dyscalculiaResponses.add(r);
            }
        }

        // 1. DYSLEXIA EVALUATION
        evaluateDyslexia(dyslexiaResponses, report, childAge);

        // 2. DYSGRAPHIA EVALUATION
        evaluateDysgraphia(dysgraphiaResponses, report, childAge);

        // 3. DYSCALCULIA EVALUATION
        evaluateDyscalculia(dyscalculiaResponses, report, childAge);

        // 4. OVERALL SYNTHESIS
        synthesizeOverall(report);

        return report;
    }

    private void evaluateDyslexia(List<QuestionResponse> responses, AssessmentReport report, int childAge) {
        if (responses.isEmpty()) {
            report.setDyslexiaScore(0);
            report.setDyslexiaRisk(RiskLevel.LOW_RISK);
            report.setDyslexiaSummary("No dyslexia items were recorded.");
            return;
        }

        double totalScore = 0.0;
        int mirrorErrors = 0;
        long totalLatencyMs = 0;

        for (QuestionResponse r : responses) {
            double itemScore = r.isCorrect() ? 100.0 : 0.0;
            if (r.getQuestionId() == 1 && r.isReversalDetected()) {
                mirrorErrors++;
                itemScore = Math.max(0, itemScore - 40.0);
            }
            totalScore += itemScore;
            totalLatencyMs += r.getTimeTakenMs();
            report.getParameterScores().put("Dyslexia - " + r.getParameterTested(), itemScore);
        }

        double avgScore = Math.round((totalScore / responses.size()) * 10.0) / 10.0;
        long avgLatency = responses.isEmpty() ? 0 : totalLatencyMs / responses.size();

        report.setDyslexiaScore(avgScore);

        if (avgScore >= 80.0 && mirrorErrors == 0) {
            report.setDyslexiaRisk(RiskLevel.LOW_RISK);
            report.setDyslexiaSummary("Strong phonological awareness and accurate grapheme orientation. Normal reading decoding fluency for age " + childAge + ".");
        } else if (avgScore >= 50.0 || mirrorErrors == 1) {
            report.setDyslexiaRisk(RiskLevel.MODERATE_TENDENCY);
            report.setDyslexiaSummary("Mild friction detected in phoneme blending or mirror letter differentiation. May benefit from multisensory phonics practice.");
            report.getClinicalObservations().add("Dyslexia: Slowness in phonemic sound blending and minor mirror letter confusion (b/d/p).");
            report.getActionableRecommendations().add("Practice tactile letter tracing with sand trays or textured cards for 'b' and 'd' disambiguation.");
        } else {
            report.setDyslexiaRisk(RiskLevel.HIGH_RISK);
            report.setDyslexiaSummary("Significant markers of phonological decoding difficulty, frequent mirror letter reversals, and elevated reading retrieval latency.");
            report.getClinicalObservations().add("Dyslexia: Marked difficulty with phoneme synthesis, high mirror letter reversal error rate, and elevated word retrieval time.");
            report.getActionableRecommendations().add("Schedule an evaluation with a certified reading specialist or speech-language pathologist for structured Orton-Gillingham intervention.");
        }
    }

    private void evaluateDysgraphia(List<QuestionResponse> responses, AssessmentReport report, int childAge) {
        if (responses.isEmpty()) {
            report.setDysgraphiaScore(0);
            report.setDysgraphiaRisk(RiskLevel.LOW_RISK);
            report.setDysgraphiaSummary("No dysgraphia items recorded.");
            return;
        }

        double totalScore = 0.0;
        double totalJitter = 0.0;
        boolean mlDysgraphiaDetected = false;
        double mlConfidence = 0.0;
        String mlModelName = "MobileNetV2 (Özkum et al. 2025)";
        boolean slownessDetected = false;

        for (QuestionResponse r : responses) {
            double itemScore = r.isCorrect() ? 100.0 : 0.0;

            // Factor canvas jitter and path deviations for motor questions (Q6 and Q7)
            if (r.getQuestionId() == 6 || r.getQuestionId() == 7) {
                totalJitter += r.getMotorJitterScore();
                // If jitter is high (> 18 px average deviation), discount score
                if (r.getMotorJitterScore() > 18.0) {
                    itemScore = Math.max(30.0, 100.0 - (r.getMotorJitterScore() * 2.2));
                } else {
                    itemScore = 100.0;
                }

                // Research paper factor 1: Writing slowness / motor hesitation (> 15s)
                if (r.getTimeTakenMs() > 15000) {
                    slownessDetected = true;
                    itemScore = Math.max(25.0, itemScore - 15.0);
                }
            }

            // MobileNetV2 Deep Learning Dysgraphia Biomarker (Özkum et al. 2025)
            if (r.getMlPrediction() != null && !r.getMlPrediction().isBlank()) {
                mlModelName = r.getMlModel() != null ? r.getMlModel() : mlModelName;
                mlConfidence = r.getMlConfidence() != null ? r.getMlConfidence() : 0.0;

                Map<String, Object> mlInfo = new HashMap<>();
                mlInfo.put("prediction", r.getMlPrediction());
                mlInfo.put("confidence", mlConfidence);
                mlInfo.put("model", mlModelName);
                mlInfo.put("paperReference", "Özkum, Burukanlı, & Yumuşak (2025)");
                report.setDysgraphiaMlDetails(mlInfo);

                if ("Potential Dysgraphia".equalsIgnoreCase(r.getMlPrediction())) {
                    mlDysgraphiaDetected = true;
                    itemScore = Math.min(itemScore, 45.0);
                }
            }

            totalScore += itemScore;
            report.getParameterScores().put("Dysgraphia - " + r.getParameterTested(), Math.round(itemScore * 10.0) / 10.0);
        }

        double avgScore = Math.round((totalScore / responses.size()) * 10.0) / 10.0;
        report.setDysgraphiaScore(avgScore);

        if (avgScore >= 80.0 && !mlDysgraphiaDetected) {
            report.setDysgraphiaRisk(RiskLevel.LOW_RISK);
            report.setDysgraphiaSummary("Adequate fine motor trajectory stability, smooth stroke kinematics, and consistent visual-spatial sentence organization.");
            if (mlConfidence > 0) {
                report.getClinicalObservations().add("Deep Learning (MobileNetV2): Handwriting strokes classified as Low Potential Dysgraphia with " + Math.round(mlConfidence) + "% model confidence (Özkum et al. 2025).");
            }
        } else if (avgScore >= 50.0 && !mlDysgraphiaDetected) {
            report.setDysgraphiaRisk(RiskLevel.MODERATE_TENDENCY);
            report.setDysgraphiaSummary("Noticeable stroke instability, motor fatigue, or word spacing/alignment errors under sequential drawing and writing tasks.");
            report.getClinicalObservations().add("Dysgraphia: Fine motor path deviations and spatial spacing inconsistency observed during interactive motor tasks.");
            if (slownessDetected) {
                report.getClinicalObservations().add("Dysgraphia (Özkum et al. Factor): Prolonged execution latency and writing slowness observed during cursive trace tasks.");
            }
            report.getActionableRecommendations().add("Encourage fine-motor grip strengthening games (play-dough, tweezers, beaded crafts) and ruled line guidance.");
        } else {
            report.setDysgraphiaRisk(RiskLevel.HIGH_RISK);
            report.setDysgraphiaSummary("High kinematic tremor/jitter, marked path deviation, and persistent difficulty maintaining visual-spatial sequence alignment.");
            report.getClinicalObservations().add("Dysgraphia: High trajectory jitter score, motor hesitation, and significant spatial sequencing friction.");
            if (mlDysgraphiaDetected) {
                report.getClinicalObservations().add("Deep Learning Biomarker (MobileNetV2 - Özkum et al. 2025): Handwriting image classified as Potential Dysgraphia (" + Math.round(mlConfidence) + "% confidence), reflecting abnormal stroke curvature, ink density variation, and motor dyspraxia.");
            }
            if (slownessDetected) {
                report.getClinicalObservations().add("Dysgraphia (Özkum et al. Factor): Marked slowness in letter formation and execution fatigue.");
            }
            report.getActionableRecommendations().add("Consult an occupational therapist (OT) specializing in pediatric fine-motor coordination and dysgraphia accommodations.");
            report.getActionableRecommendations().add("Utilize adaptive writing grips, slant boards, and multi-sensory stroke tracing exercises to reduce letter formation fatigue.");
        }
    }

    private void evaluateDyscalculia(List<QuestionResponse> responses, AssessmentReport report, int childAge) {
        if (responses.isEmpty()) {
            report.setDyscalculiaScore(0);
            report.setDyscalculiaRisk(RiskLevel.LOW_RISK);
            report.setDyscalculiaSummary("No dyscalculia items recorded.");
            return;
        }

        double totalScore = 0.0;
        boolean subitizingFailed = false;
        double numberLineDev = 0.0;

        for (QuestionResponse r : responses) {
            double itemScore = r.isCorrect() ? 100.0 : 0.0;

            // Q11 is subitizing
            if (r.getQuestionId() == 11 && !r.isCorrect()) {
                subitizingFailed = true;
            }

            // Q13 is number line placement
            if (r.getQuestionId() == 13) {
                double diff = r.getMagnitudeDistance();
                numberLineDev = diff;
                if (diff <= 1.5) {
                    itemScore = 100.0;
                } else if (diff <= 3.5) {
                    itemScore = 75.0;
                } else if (diff <= 5.5) {
                    itemScore = 45.0;
                } else {
                    itemScore = 15.0;
                }
            }

            totalScore += itemScore;
            report.getParameterScores().put("Dyscalculia - " + r.getParameterTested(), Math.round(itemScore * 10.0) / 10.0);
        }

        double avgScore = Math.round((totalScore / responses.size()) * 10.0) / 10.0;
        report.setDyscalculiaScore(avgScore);

        if (avgScore >= 80.0 && !subitizingFailed) {
            report.setDyscalculiaRisk(RiskLevel.LOW_RISK);
            report.setDyscalculiaSummary("Intact intuitive number sense, rapid non-verbal subitizing acuity, and sound mental number line spatial estimation.");
        } else if (avgScore >= 50.0) {
            report.setDyscalculiaRisk(RiskLevel.MODERATE_TENDENCY);
            report.setDyscalculiaSummary("Friction with mental number line calibration or sequential arithmetic jumps. Core quantity perception is developing.");
            report.getClinicalObservations().add("Dyscalculia: Spatial number line positioning errors and delay in pattern sequence recognition.");
            report.getActionableRecommendations().add("Incorporate visual counting manipulatives (Numicon, Cuisenaire rods) and linear board games.");
        } else {
            report.setDyscalculiaRisk(RiskLevel.HIGH_RISK);
            report.setDyscalculiaSummary("Core subitizing deficit, pronounced non-linear number line distortion, and marked difficulty with basic arithmetic reasoning.");
            report.getClinicalObservations().add("Dyscalculia: Inability to rapidly apprehend small quantities (subitizing failure) and substantial number magnitude errors.");
            report.getActionableRecommendations().add("Seek consultation with a dyscalculia educational specialist for targeted numeracy and magnitude intervention.");
        }
    }

    private void synthesizeOverall(AssessmentReport report) {
        int highRiskCount = 0;
        int moderateCount = 0;

        if (report.getDyslexiaRisk() == RiskLevel.HIGH_RISK) highRiskCount++;
        else if (report.getDyslexiaRisk() == RiskLevel.MODERATE_TENDENCY) moderateCount++;

        if (report.getDysgraphiaRisk() == RiskLevel.HIGH_RISK) highRiskCount++;
        else if (report.getDysgraphiaRisk() == RiskLevel.MODERATE_TENDENCY) moderateCount++;

        if (report.getDyscalculiaRisk() == RiskLevel.HIGH_RISK) highRiskCount++;
        else if (report.getDyscalculiaRisk() == RiskLevel.MODERATE_TENDENCY) moderateCount++;

        if (highRiskCount >= 1) {
            report.setOverallRiskLevel(RiskLevel.HIGH_RISK);
            report.setOverallSummary("The assessment indicates prominent vulnerability markers in " + highRiskCount + " learning domain(s). A formal clinical screening is advised.");
        } else if (moderateCount >= 1) {
            report.setOverallRiskLevel(RiskLevel.MODERATE_TENDENCY);
            report.setOverallSummary("The assessment revealed emerging tendencies in " + moderateCount + " domain(s). Targeted developmental support is recommended.");
        } else {
            report.setOverallRiskLevel(RiskLevel.LOW_RISK);
            report.setOverallSummary("The student performed within the age-appropriate benchmark across all evaluated learning domains.");
        }

        if (report.getActionableRecommendations().isEmpty()) {
            report.getActionableRecommendations().add("Continue nurturing a rich literacy and numeracy home environment with daily storybook reading and playful math puzzles.");
            report.getActionableRecommendations().add("Maintain a balanced mix of gross-motor and fine-motor activities (coloring, building blocks, outdoor play).");
        }
    }
}
