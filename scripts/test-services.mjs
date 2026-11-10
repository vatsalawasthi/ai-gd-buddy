import { generateAIParticipants } from "@/services/ai/participantGenerator";
import { decideNextSpeaker, generateAIResponse } from "@/services/ai/discussionEngine";
import { evaluateGDSession, computeWeightedOverallScore } from "@/services/evaluation/evaluator";
import { generateAITopic } from "@/services/ai/topicGenerator";
import { processRecordingAudio } from "@/services/recording/recordingService";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

console.log("=================================================");
console.log("🧪 AI GD BUDDY — AUTOMATED CORE ENGINE TEST SUITE");
console.log("=================================================\n");

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`✅ [PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`❌ [FAIL] ${message}`);
    process.exitCode = 1;
  }
}

async function runTests() {
  // TEST 1: Password Hashing & JWT Security
  console.log("--- 1. Testing Auth & Security Primitives ---");
  const rawPassword = "StrongPlacementPassword2026!";
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(rawPassword, salt);
  const isMatch = await bcrypt.compare(rawPassword, hash);
  assert(isMatch, "Password hashing & bcrypt validation works reliably");

  const wrongMatch = await bcrypt.compare("WrongPassword", hash);
  assert(!wrongMatch, "Password verification rejects incorrect password");

  const secret = "test_jwt_secret_key_999";
  const token = jwt.sign({ userId: "u123", email: "test@example.com", role: "student" }, secret, { expiresIn: "1h" });
  const decoded = jwt.verify(token, secret);
  assert(decoded.userId === "u123" && decoded.role === "student", "JWT sign and verify works with valid payload");

  // TEST 2: Dynamic AI Participant Generation
  console.log("\n--- 2. Testing AI Participant Generation ---");
  const participants = await generateAIParticipants(
    "Generative AI in Corporate Workplaces",
    3,
    "Intermediate",
    "Placement-level GD"
  );
  assert(Array.isArray(participants) && participants.length === 3, "Generated exactly 3 AI participants");
  assert(participants.every(p => p.name && p.archetype && p.speakingStyle && p.color), "All participants have complete personas, styles, and badges");
  console.log("   Generated participants:", participants.map(p => `${p.name} (${p.archetype})`).join(", "));

  // TEST 3: Discussion Turn Management Engine
  console.log("\n--- 3. Testing Turn Orchestration Engine ---");
  // Test opening turn
  const openingTurn = decideNextSpeaker(participants, [], 600, 600);
  assert(openingTurn.isOpening === true, "Identified empty discussion and triggered opening speaker turn");
  assert(openingTurn.nextSpeaker !== "user", "Selected an AI participant to initiate the topic");

  // Test opening speech generation
  const openingSpeech = await generateAIResponse(
    "Generative AI in Corporate Workplaces",
    openingTurn.nextSpeaker,
    [],
    true,
    false
  );
  assert(openingSpeech && openingSpeech.length > 30, "Generated realistic opening perspective from initiator");
  console.log(`   Initiator speech excerpt: "${openingSpeech.slice(0, 80)}..."`);

  // Test turn after user speaks
  const mockUserMsg = {
    _id: "m-user-1",
    sessionId: "s1",
    speakerId: "u123",
    speakerName: "Rohan",
    speakerType: "user",
    message: "I think generative AI empowers freshers to prototype faster, but companies must invest in domain mentorship.",
    sequenceNumber: 2,
    timestamp: new Date()
  };
  const respondTurn = decideNextSpeaker(participants, [mockUserMsg], 450, 600);
  assert(respondTurn.nextSpeaker !== "user", "Identified user contribution and scheduled an AI peer to rebut/build");

  // TEST 4: Performance Evaluation Engine & Weighted Formula
  console.log("\n--- 4. Testing 7-Pillar Performance Evaluation Engine ---");
  const formulaCheck = computeWeightedOverallScore({
    communication: 80, // 80 * 0.20 = 16
    content: 75,       // 75 * 0.20 = 15
    confidence: 80,    // 80 * 0.15 = 12
    listening: 70,     // 70 * 0.15 = 10.5
    leadership: 80,    // 80 * 0.10 = 8
    participation: 90, // 90 * 0.10 = 9
    fluency: 75        // 75 * 0.10 = 7.5
    // Sum = 16 + 15 + 12 + 10.5 + 8 + 9 + 7.5 = 78.0
  });
  assert(formulaCheck === 78, `Weighted formula strictly computes 78 (Actual: ${formulaCheck})`);

  const mockMessages = [
    {
      _id: "m1",
      sessionId: "s1",
      speakerId: participants[0].id,
      speakerName: participants[0].name,
      speakerType: "ai",
      message: openingSpeech,
      sequenceNumber: 1,
      timestamp: new Date()
    },
    mockUserMsg,
    {
      _id: "m3",
      sessionId: "s1",
      speakerId: participants[1].id,
      speakerName: participants[1].name,
      speakerType: "ai",
      message: "I agree with Rohan on mentorship, but what about the risk of algorithm dependence?",
      sequenceNumber: 3,
      timestamp: new Date()
    },
    {
      _id: "m4",
      sessionId: "s1",
      speakerId: "u123",
      speakerName: "Rohan",
      speakerType: "user",
      message: "Building upon that counterpoint, strict guardrails and code audit reviews ensure students do not treat AI as a black box.",
      sequenceNumber: 4,
      timestamp: new Date()
    }
  ];

  const evalResult = await evaluateGDSession({
    topicTitle: "Generative AI in Corporate Workplaces",
    messages: mockMessages,
    userName: "Rohan",
    userId: "u123",
    sessionId: "s1"
  });

  assert(evalResult.overallScore > 0 && evalResult.overallScore <= 100, `Overall score within 0-100 range (${evalResult.overallScore})`);
  assert(evalResult.strengths?.length > 0, "Generated evidence-based strengths");
  assert(evalResult.weaknesses?.length > 0, "Generated actionable weaknesses");
  assert(evalResult.whatCouldHaveSaidInstead?.length > 0, "Generated 'What You Could Have Said Instead' rephrasing");
  assert(evalResult.improvementGoals?.length === 3, "Generated exactly 3 Next Improvement Goals");
  console.log(`   Sample alternative argument: "${evalResult.whatCouldHaveSaidInstead[0]?.betterFraming.slice(0, 85)}..."`);

  // TEST 5: Real GD Recording Audio Diarization
  console.log("\n--- 5. Testing Real GD Recording Diarization ---");
  const diarized = await processRecordingAudio("campus_mock_gd_round1.mp3", "Future of Remote Work", "Speaker 1");
  assert(diarized.speakerSegments.length >= 4, "Recording audio transcribed and segmented into distinct speakers");
  assert(diarized.transcript.includes("Speaker 1") && diarized.transcript.includes("Speaker 2"), "Diarization preserves distinct speaker labels");

  // TEST 6: Topic Library Generator
  console.log("\n--- 6. Testing GD Topic Generator ---");
  const generatedTopic = await generateAITopic("Business", "Advanced");
  assert(generatedTopic.title && generatedTopic.argumentsFor.length > 0 && generatedTopic.argumentsAgainst.length > 0, "Generated topic includes title, background, and pros/cons arguments");
  console.log(`   Generated topic title: "${generatedTopic.title}"`);

  console.log("\n=================================================");
  console.log(`🎯 TEST RUN COMPLETE: ${passedTests}/${totalTests} TESTS PASSED!`);
  console.log("=================================================\n");
}

runTests().catch(err => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
