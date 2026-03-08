/**
 * ============================================================
 * REFERENCE CODE — ESP32 IoT Device (Step 1)
 * ============================================================
 * This file is reference Arduino/ESP-IDF code for the ESP32 device.
 * It does NOT run in the browser — it's provided for the hackathon prototype.
 * 
 * Features:
 * - Secure boot + firmware SHA-256 integrity check
 * - Simulated ATECC608A secure element for key storage
 * - Challenge-response authentication with server
 * - Tamper detection: case-open, vibration, light sensor
 * - Auto-lockdown on tamper events
 * - HTTPS health reporting to server
 * 
 * Dependencies: WiFi.h, HTTPClient.h, mbedtls, ArduinoJson
 */

/*
#include <WiFi.h>
#include <HTTPClient.h>
#include <mbedtls/sha256.h>
#include <ArduinoJson.h>

// ==================== CONFIGURATION ====================
const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASS = "YOUR_WIFI_PASSWORD";
const char* SERVER_URL = "https://your-server.com/api";
const char* DEVICE_ID = "dev-001-alpha";

// Pin assignments for tamper detection
#define CASE_OPEN_PIN    4   // Microswitch: HIGH = case open
#define VIBRATION_PIN    5   // Vibration sensor: HIGH = vibration
#define LIGHT_SENSOR_PIN 34  // Analog light sensor (ADC)
#define STATUS_LED_PIN   2   // Built-in LED
#define BUZZER_PIN       15  // Piezo buzzer

// Thresholds
#define LIGHT_THRESHOLD  800  // Light anomaly threshold
#define VIBRATION_DURATION 5000 // ms of continuous vibration = tamper
#define HEALTH_INTERVAL  10000 // Send health every 10s

// ==================== SECURE ELEMENT SIMULATION ====================
// In production, use ATECC608A via I2C. Here we simulate with flash storage.
struct SecureElement {
  uint8_t privateKey[32];
  uint8_t publicKey[64];
  bool locked;
  
  void init() {
    // Simulate key generation — in production, keys never leave the chip
    for (int i = 0; i < 32; i++) privateKey[i] = esp_random() & 0xFF;
    // Public key would be derived from private key via ECDSA
    for (int i = 0; i < 64; i++) publicKey[i] = esp_random() & 0xFF;
    locked = false;
  }
  
  // Lock keys — irreversible until admin re-provisions
  void lockKeys() {
    memset(privateKey, 0, 32);
    locked = true;
    Serial.println("[SECURE] Keys locked! Device entering restricted mode.");
  }
  
  // Sign a challenge (simulate ECDSA)
  void sign(const uint8_t* challenge, size_t len, uint8_t* signature) {
    if (locked) {
      memset(signature, 0, 64);
      return;
    }
    // In production: ATECC608A performs ECDSA-P256 signing
    mbedtls_sha256_context ctx;
    mbedtls_sha256_init(&ctx);
    mbedtls_sha256_starts(&ctx, 0);
    mbedtls_sha256_update(&ctx, challenge, len);
    mbedtls_sha256_update(&ctx, privateKey, 32);
    mbedtls_sha256_finish(&ctx, signature);
    mbedtls_sha256_free(&ctx);
  }
} secureElement;

// ==================== FIRMWARE INTEGRITY ====================
// Calculate SHA-256 of the running firmware
String getFirmwareHash() {
  // In production: hash the actual firmware partition
  // Here we simulate with a known hash
  return "a3f2c8e1d4b5a6f7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1";
}

bool verifyFirmwareIntegrity() {
  String hash = getFirmwareHash();
  String expected = "a3f2c8e1d4b5a6f7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1";
  return hash == expected;
}

// ==================== TAMPER DETECTION ====================
struct TamperState {
  bool caseOpen;
  bool vibrationDetected;
  bool lightAnomaly;
  unsigned long vibrationStart;
  bool restrictedMode;
} tamper;

void checkTamperSensors() {
  // Case-open microswitch
  if (digitalRead(CASE_OPEN_PIN) == HIGH && !tamper.caseOpen) {
    tamper.caseOpen = true;
    Serial.println("[TAMPER] Case open detected!");
    reportTamperEvent("case_open", "Physical case-open microswitch triggered");
    enterRestrictedMode();
  }
  
  // Vibration sensor
  if (digitalRead(VIBRATION_PIN) == HIGH) {
    if (tamper.vibrationStart == 0) tamper.vibrationStart = millis();
    if (millis() - tamper.vibrationStart > VIBRATION_DURATION) {
      tamper.vibrationDetected = true;
      Serial.println("[TAMPER] Sustained vibration detected!");
      reportTamperEvent("vibration", "Excessive vibration >2g for 5 seconds");
      enterRestrictedMode();
    }
  } else {
    tamper.vibrationStart = 0;
  }
  
  // Light sensor (detects enclosure breach)
  int lightLevel = analogRead(LIGHT_SENSOR_PIN);
  if (lightLevel > LIGHT_THRESHOLD && !tamper.lightAnomaly) {
    tamper.lightAnomaly = true;
    Serial.println("[TAMPER] Light anomaly detected!");
    reportTamperEvent("light_anomaly", "Light sensor detected anomaly: " + String(lightLevel));
  }
}

void enterRestrictedMode() {
  if (tamper.restrictedMode) return;
  tamper.restrictedMode = true;
  secureElement.lockKeys();
  
  // Visual/audio feedback
  for (int i = 0; i < 5; i++) {
    digitalWrite(STATUS_LED_PIN, HIGH);
    tone(BUZZER_PIN, 2000, 200);
    delay(300);
    digitalWrite(STATUS_LED_PIN, LOW);
    delay(200);
  }
  
  reportTamperEvent("key_lock", "Keys locked, device in restricted mode");
}

// ==================== SERVER COMMUNICATION ====================
void reportTamperEvent(const char* type, String details) {
  HTTPClient http;
  http.begin(String(SERVER_URL) + "/tamper-alert");
  http.addHeader("Content-Type", "application/json");
  
  StaticJsonDocument<512> doc;
  doc["deviceId"] = DEVICE_ID;
  doc["type"] = type;
  doc["details"] = details;
  doc["timestamp"] = millis();
  doc["keysLocked"] = secureElement.locked;
  
  String body;
  serializeJson(doc, body);
  int code = http.POST(body);
  Serial.printf("[NET] Tamper alert sent, response: %d\n", code);
  http.end();
}

void sendHealthReport() {
  HTTPClient http;
  http.begin(String(SERVER_URL) + "/health");
  http.addHeader("Content-Type", "application/json");
  
  StaticJsonDocument<512> doc;
  doc["deviceId"] = DEVICE_ID;
  doc["firmwareHash"] = getFirmwareHash();
  doc["firmwareValid"] = verifyFirmwareIntegrity();
  doc["keysLocked"] = secureElement.locked;
  doc["restrictedMode"] = tamper.restrictedMode;
  doc["caseOpen"] = tamper.caseOpen;
  doc["uptime"] = millis() / 1000;
  
  String body;
  serializeJson(doc, body);
  int code = http.POST(body);
  Serial.printf("[NET] Health report sent, response: %d\n", code);
  http.end();
}

// Challenge-response authentication
bool authenticateWithServer() {
  HTTPClient http;
  
  // Step 1: Request challenge
  http.begin(String(SERVER_URL) + "/auth/challenge?deviceId=" + DEVICE_ID);
  int code = http.GET();
  if (code != 200) return false;
  
  String response = http.getString();
  StaticJsonDocument<256> challengeDoc;
  deserializeJson(challengeDoc, response);
  
  // Step 2: Sign challenge
  const char* challenge = challengeDoc["challenge"];
  uint8_t signature[64];
  secureElement.sign((uint8_t*)challenge, strlen(challenge), signature);
  
  // Step 3: Send signed response
  http.begin(String(SERVER_URL) + "/auth/verify");
  http.addHeader("Content-Type", "application/json");
  
  StaticJsonDocument<512> authDoc;
  authDoc["deviceId"] = DEVICE_ID;
  authDoc["challenge"] = challenge;
  // Convert signature to hex string
  String sigHex = "";
  for (int i = 0; i < 64; i++) {
    char hex[3];
    sprintf(hex, "%02x", signature[i]);
    sigHex += hex;
  }
  authDoc["signature"] = sigHex;
  
  String authBody;
  serializeJson(authDoc, authBody);
  code = http.POST(authBody);
  http.end();
  
  return code == 200;
}

// ==================== MAIN ====================
unsigned long lastHealth = 0;

void setup() {
  Serial.begin(115200);
  Serial.println("[BOOT] Zero-Trust IoT Device Starting...");
  
  // Initialize pins
  pinMode(CASE_OPEN_PIN, INPUT_PULLDOWN);
  pinMode(VIBRATION_PIN, INPUT_PULLDOWN);
  pinMode(STATUS_LED_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  
  // Initialize secure element
  secureElement.init();
  Serial.println("[SECURE] Secure element initialized");
  
  // Verify firmware integrity on boot
  if (!verifyFirmwareIntegrity()) {
    Serial.println("[BOOT] FIRMWARE INTEGRITY CHECK FAILED!");
    enterRestrictedMode();
    return;
  }
  Serial.println("[BOOT] Firmware integrity verified ✓");
  
  // Connect WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\n[NET] WiFi connected: " + WiFi.localIP().toString());
  
  // Authenticate with server
  if (authenticateWithServer()) {
    Serial.println("[AUTH] Server authentication successful ✓");
    digitalWrite(STATUS_LED_PIN, HIGH);
  } else {
    Serial.println("[AUTH] Server authentication FAILED!");
  }
}

void loop() {
  // Continuous tamper monitoring
  checkTamperSensors();
  
  // Periodic health reports
  if (millis() - lastHealth > HEALTH_INTERVAL) {
    sendHealthReport();
    lastHealth = millis();
  }
  
  delay(100); // 10Hz sensor polling
}
*/

export const ESP32_DEVICE_CODE = "See comments above for complete ESP32 Arduino code";
