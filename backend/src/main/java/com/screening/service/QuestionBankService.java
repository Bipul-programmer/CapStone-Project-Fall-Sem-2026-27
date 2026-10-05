package com.screening.service;

import com.screening.model.DisorderDomain;
import com.screening.model.QuestionDefinition;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class QuestionBankService {

    private final List<QuestionDefinition> questionBank = new ArrayList<>();

    public QuestionBankService() {
        initQuestions();
    }

    public List<QuestionDefinition> getAllQuestions() {
        return Collections.unmodifiableList(questionBank);
    }

    public Optional<QuestionDefinition> getQuestionById(int id) {
        return questionBank.stream().filter(q -> q.getId() == id).findFirst();
    }

    private void initQuestions() {
        // ---------------------------------------------------------
        // DYSLEXIA SECTION (Questions 1 - 5)
        // ---------------------------------------------------------

        // Q1: Mirror Letter Discrimination
        Map<String, Object> q1Payload = new HashMap<>();
        q1Payload.put("letterGrid", Arrays.asList("b", "d", "b", "p", "q", "b", "d", "b"));
        q1Payload.put("targetLetter", "b");
        q1Payload.put("targetIndices", Arrays.asList(0, 2, 5, 7));
        questionBank.add(new QuestionDefinition(
                1,
                DisorderDomain.DYSLEXIA,
                "Mirror Letter Discrimination (b vs d/p)",
                "Tests visual-spatial orientation and ability to distinguish frequently reversed mirror graphemes.",
                "Letter Safari: Spot the 'b's!",
                "Tap every box that contains the lowercase letter 'b'. Be careful not to tap 'd', 'p', or 'q'!",
                "Tap every box that has the letter 'b'. Watch out for tricky mirror letters like 'd' and 'p'!",
                "LETTER_MIRROR",
                Arrays.asList("b", "d", "b", "p", "q", "b", "d", "b"),
                "0,2,5,7",
                q1Payload
        ));

        // Q2: Phonological Awareness & Rhyme Recognition
        Map<String, Object> q2Payload = new HashMap<>();
        q2Payload.put("targetWord", "LAKE");
        questionBank.add(new QuestionDefinition(
                2,
                DisorderDomain.DYSLEXIA,
                "Phonological Awareness & Rhyming",
                "Assesses phonemic coda awareness and sound-structure recognition in spoken English.",
                "Rhyme Detective: Rhymes with LAKE",
                "Which of these words rhymes with LAKE?",
                "Which word sounds like and rhymes with the word LAKE?",
                "RHYME_CHOICE",
                Arrays.asList("CAKE", "LOOK", "BALL", "KITE"),
                "CAKE",
                q2Payload
        ));

        // Q3: Phoneme-Grapheme Blending
        Map<String, Object> q3Payload = new HashMap<>();
        q3Payload.put("phonemes", Arrays.asList("/c/", "/a/", "/t/"));
        questionBank.add(new QuestionDefinition(
                3,
                DisorderDomain.DYSLEXIA,
                "Phoneme-Grapheme Blending & Sound Synthesis",
                "Evaluates the ability to blend isolated auditory phonemes into a recognized lexical word.",
                "Sound Blender: Put Sounds Together",
                "Listen to the broken sounds: /k/ ... /æ/ ... /t/. What animal word does it make?",
                "Listen to the sounds: /k/ ... /a/ ... /t/. What animal word does it form?",
                "PHONIC_BLEND",
                Arrays.asList("CAT", "BAT", "CAP", "COT"),
                "CAT",
                q3Payload
        ));

        // Q4: Missing Vowel / Orthographic Representation
        Map<String, Object> q4Payload = new HashMap<>();
        q4Payload.put("incompleteWord", "EL _ PHANT");
        q4Payload.put("fullWord", "ELEPHANT");
        questionBank.add(new QuestionDefinition(
                4,
                DisorderDomain.DYSLEXIA,
                "Orthographic Memory & Vowel Representation",
                "Tests mental lexicon storage and memory for standard spelling patterns.",
                "Word Hospital: Fix the Missing Letter",
                "Which vowel is missing to properly spell 'EL _ PHANT'?",
                "Which letter is missing to correctly spell the word ELEPHANT?",
                "MISSING_VOWEL",
                Arrays.asList("E", "A", "O", "I"),
                "E",
                q4Payload
        ));

        // Q5: Rapid Sight-Word Discrimination
        Map<String, Object> q5Payload = new HashMap<>();
        q5Payload.put("targetWord", "BRAVE");
        questionBank.add(new QuestionDefinition(
                5,
                DisorderDomain.DYSLEXIA,
                "Rapid Visual Word Recognition & Anagram Filtering",
                "Measures visual word-form recognition speed and resistance to anagram confusion.",
                "Flash Word: Spot the Exact Match",
                "Find the exact word match for 'BRAVE' among the scrambled choices:",
                "Find the exact word that matches BRAVE.",
                "WORD_MATCH",
                Arrays.asList("BRAVE", "BEARD", "BAKER", "RAVEB"),
                "BRAVE",
                q5Payload
        ));

        // ---------------------------------------------------------
        // DYSGRAPHIA SECTION (Questions 6 - 10)
        // ---------------------------------------------------------

        // Q6: Continuous Motor Road Tracing
        Map<String, Object> q6Payload = new HashMap<>();
        q6Payload.put("pathType", "S_CURVE");
        q6Payload.put("laneWidth", 46);
        questionBank.add(new QuestionDefinition(
                6,
                DisorderDomain.DYSGRAPHIA,
                "Fine Motor Trajectory & Path Deviation",
                "Assesses continuous motor control, stroke tremor, and lane-keeping stability on a touch/mouse path.",
                "Winding River: Smooth Path Cruise",
                "Draw or drag the boat along the winding river from Start to Goal. Try to stay right in the center without bumping the banks!",
                "Guide the boat along the blue river from start to finish. Keep it steady inside the lines!",
                "CANVAS_ROAD_TRACE",
                Collections.emptyList(),
                "COMPLETED_CANVAS",
                q6Payload
        ));

        // Q7: Letter Formation Kinematics
        Map<String, Object> q7Payload = new HashMap<>();
        q7Payload.put("targetLetter", "S");
        q7Payload.put("checkpoints", Arrays.asList("Top Curve", "Middle Cross", "Bottom Loop"));
        questionBank.add(new QuestionDefinition(
                7,
                DisorderDomain.DYSGRAPHIA,
                "Letter Formation Kinematics & Directional Flow",
                "Measures ability to produce multi-directional curved strokes required for handwriting letter formation.",
                "Star Trail: Trace the Letter 'S'",
                "Trace smoothly over the curved letter 'S' from the green star at the top down to the finish star.",
                "Trace over the letter 'S' starting from the top green star down to the finish star.",
                "CANVAS_LETTER_TRACE",
                Collections.emptyList(),
                "COMPLETED_CANVAS",
                q7Payload
        ));

        // Q8: Visual-Spatial Word & Sentence Organization
        Map<String, Object> q8Payload = new HashMap<>();
        q8Payload.put("scrambledWords", Arrays.asList("brown", "The", "happy", "dog", "is"));
        q8Payload.put("correctSentence", "The brown dog is happy");
        questionBank.add(new QuestionDefinition(
                8,
                DisorderDomain.DYSGRAPHIA,
                "Visual-Spatial Word Organization & Line Alignment",
                "Assesses spatial arrangement of words, spacing perception, and syntax sequence in writing.",
                "Sentence Builder: Words in Order",
                "Tap the words in the correct order to make a good sentence: 'The brown dog is happy'.",
                "Tap the words in order to build the sentence: The brown dog is happy.",
                "SENTENCE_SPACING",
                Arrays.asList("The", "brown", "dog", "is", "happy"),
                "The brown dog is happy",
                q8Payload
        ));

        // Q9: Visual-Motor Dot-to-Dot Sequential Planning
        Map<String, Object> q9Payload = new HashMap<>();
        q9Payload.put("points", Arrays.asList(
                Map.of("id", 1, "x", 150, "y", 60, "label", "1"),
                Map.of("id", 2, "x", 250, "y", 140, "label", "2"),
                Map.of("id", 3, "x", 210, "y", 250, "label", "3"),
                Map.of("id", 4, "x", 90, "y", 250, "label", "4"),
                Map.of("id", 5, "x", 50, "y", 140, "label", "5")
        ));
        questionBank.add(new QuestionDefinition(
                9,
                DisorderDomain.DYSGRAPHIA,
                "Visual-Motor Sequential Planning & Coordination",
                "Measures visual-spatial targeting, hand-eye coordination, and sequential motor targeting.",
                "Constellation: Connect the Star Dots",
                "Connect the numbered star dots in order from 1 to 2 to 3 to 4 to 5 to draw the shield!",
                "Connect the star dots in order: 1, then 2, 3, 4, and 5.",
                "DOT_CONNECT",
                Collections.emptyList(),
                "1,2,3,4,5",
                q9Payload
        ));

        // Q10: Timed Rapid Motor Key Sequencing
        Map<String, Object> q10Payload = new HashMap<>();
        q10Payload.put("targetSequence", Arrays.asList("RED", "BLUE", "YELLOW", "GREEN"));
        questionBank.add(new QuestionDefinition(
                10,
                DisorderDomain.DYSGRAPHIA,
                "Rapid Fine-Motor Sequencing & Dyspraxic Latency",
                "Evaluates motor execution latency and multi-step finger coordination under timed instructions.",
                "Color Piano: Tap the Sequence",
                "Tap the color pads in this exact sequence: RED -> BLUE -> YELLOW -> GREEN.",
                "Tap the colors in order: Red, then Blue, then Yellow, then Green.",
                "KEY_SEQUENCE",
                Arrays.asList("RED", "BLUE", "YELLOW", "GREEN"),
                "RED,BLUE,YELLOW,GREEN",
                q10Payload
        ));

        // ---------------------------------------------------------
        // DYSCALCULIA SECTION (Questions 11 - 15)
        // ---------------------------------------------------------

        // Q11: Rapid Subitizing Flash Test
        Map<String, Object> q11Payload = new HashMap<>();
        q11Payload.put("dotCount", 5);
        q11Payload.put("flashDurationMs", 1500);
        questionBank.add(new QuestionDefinition(
                11,
                DisorderDomain.DYSCALCULIA,
                "Subitizing & Rapid Non-Verbal Quantity Perception",
                "Measures instant non-verbal apprehension of small quantities without sequential counting.",
                "Cosmic Flash: How Many Star Gems?",
                "A cluster of star gems will flash for 1.5 seconds! How many gems did you spot?",
                "Star gems will flash quickly. How many did you see without counting one by one?",
                "FLASH_SUBITIZE",
                Arrays.asList("3", "5", "7", "9"),
                "5",
                q11Payload
        ));

        // Q12: Non-Symbolic Magnitude Comparison
        Map<String, Object> q12Payload = new HashMap<>();
        q12Payload.put("leftCount", 8);
        q12Payload.put("rightCount", 5);
        questionBank.add(new QuestionDefinition(
                12,
                DisorderDomain.DYSCALCULIA,
                "Non-Symbolic Magnitude Comparison & Weber Ratio",
                "Assesses intuitive quantity estimation and core approximate number system (ANS) acuity.",
                "Fruit Scale: Which Basket Has MORE?",
                "Without counting each one, which basket has MORE juicy apples? Left or Right?",
                "Which basket holds more apples? Left or Right?",
                "MAGNITUDE_BALANCE",
                Arrays.asList("LEFT (8)", "RIGHT (5)", "THEY ARE EQUAL"),
                "LEFT (8)",
                q12Payload
        ));

        // Q13: Mental Number Line Representation
        Map<String, Object> q13Payload = new HashMap<>();
        q13Payload.put("minVal", 0);
        q13Payload.put("maxVal", 20);
        q13Payload.put("targetNumber", 14);
        questionBank.add(new QuestionDefinition(
                13,
                DisorderDomain.DYSCALCULIA,
                "Mental Number Line Spatial Representation",
                "Evaluates internal spatial-numerical mapping and linear magnitude comprehension along a scale.",
                "Number Track: Park at Number 14",
                "Drag the car slider to where you think 14 belongs between 0 and 20!",
                "Slide the car to where 14 sits between 0 and 20.",
                "NUMBER_LINE",
                Collections.emptyList(),
                "14",
                q13Payload
        ));

        // Q14: Arithmetic Pattern & Skip Sequence
        Map<String, Object> q14Payload = new HashMap<>();
        q14Payload.put("sequenceDisplay", "3, 6, 9, __, 15");
        questionBank.add(new QuestionDefinition(
                14,
                DisorderDomain.DYSCALCULIA,
                "Arithmetic Patterning & Incremental Reasoning",
                "Measures pattern recognition, skip counting, and mental arithmetic progression.",
                "Lily Pad Jump: Fill the Missing Number",
                "The frog hops: 3 ... 6 ... 9 ... ? ... 15. What number is on the mystery lily pad?",
                "The frog hops: 3, 6, 9, blank, 15. What number belongs on the lily pad?",
                "SEQUENCE_GAP",
                Arrays.asList("10", "11", "12", "14"),
                "12",
                q14Payload
        ));

        // Q15: Elementary Visual-Symbolic Arithmetic
        Map<String, Object> q15Payload = new HashMap<>();
        q15Payload.put("firstGroup", 4);
        q15Payload.put("secondGroup", 3);
        q15Payload.put("operator", "+");
        questionBank.add(new QuestionDefinition(
                15,
                DisorderDomain.DYSCALCULIA,
                "Elementary Quantitative Operations & Fact Fluency",
                "Assesses concrete-to-symbolic addition fluency and quantitative aggregation.",
                "Treasure Chest: Add the Gems Together",
                "Calculate: 4 blue diamonds + 3 yellow diamonds = how many diamonds in total?",
                "What is 4 blue diamonds plus 3 yellow diamonds?",
                "VISUAL_ARITHMETIC",
                Arrays.asList("5", "6", "7", "8"),
                "7",
                q15Payload
        ));
    }
}
