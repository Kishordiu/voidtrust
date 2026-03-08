/**
 * ============================================================
 * REFERENCE CODE — ESP32 Admin Authentication Module (Step 2)
 * ============================================================
 * Simulates fingerprint/NFC admin authentication to open enrollment windows.
 * In production, this runs on a separate ESP32 with biometric hardware.
 */

/*
#include <WiFi.h>
#include <HTTPClient.h>
#include <Adafruit_Fingerprint.h> // Or NFC library
#include <ArduinoJson.h>

// Hardware pins
#define FINGERPRINT_RX  16
#define FINGERPRINT_TX  17
#define GREEN_LED       2
#define RED_LED         4
#define BUZZER          15

const char* SERVER_URL = "https://your-server.com/api";

// Fingerprint sensor on Serial2
HardwareSerial fpSerial(2);
Adafruit_Fingerprint finger(&fpSerial);

// Admin fingerprint IDs (enrolled in secure element)
const uint8_t ADMIN_FINGERPRINT_IDS[] = {1, 2}; // Up to 2 admins
const uint8_t NUM_ADMINS = 2;

void setup() {
  Serial.begin(115200);
  pinMode(GREEN_LED, OUTPUT);
  pinMode(RED_LED, OUTPUT);
  pinMode(BUZZER, OUTPUT);
  
  // Initialize fingerprint sensor
  fpSerial.begin(57600, SERIAL_8N1, FINGERPRINT_RX, FINGERPRINT_TX);
  finger.begin(57600);
  
  if (finger.verifyPassword()) {
    Serial.println("[FP] Fingerprint sensor found ✓");
    successFeedback();
  } else {
    Serial.println("[FP] Fingerprint sensor NOT found!");
    failureFeedback();
    while(1) delay(1000);
  }
  
  // Connect WiFi
  WiFi.begin("YOUR_SSID", "YOUR_PASS");
  while (WiFi.status() != WL_CONNECTED) delay(500);
  Serial.println("[NET] Connected");
}

bool isAdminFingerprint(uint8_t id) {
  for (int i = 0; i < NUM_ADMINS; i++) {
    if (ADMIN_FINGERPRINT_IDS[i] == id) return true;
  }
  return false;
}

// Visual + audio feedback
void successFeedback() {
  digitalWrite(GREEN_LED, HIGH);
  tone(BUZZER, 1000, 200);
  delay(300);
  tone(BUZZER, 1500, 200);
  delay(500);
  digitalWrite(GREEN_LED, LOW);
}

void failureFeedback() {
  for (int i = 0; i < 3; i++) {
    digitalWrite(RED_LED, HIGH);
    tone(BUZZER, 400, 150);
    delay(200);
    digitalWrite(RED_LED, LOW);
    delay(100);
  }
}

void openEnrollmentWindow() {
  HTTPClient http;
  http.begin(String(SERVER_URL) + "/enrollment/open");
  http.addHeader("Content-Type", "application/json");
  
  StaticJsonDocument<128> doc;
  doc["duration"] = 60; // 60 second window
  doc["adminVerified"] = true;
  
  String body;
  serializeJson(doc, body);
  int code = http.POST(body);
  
  if (code == 200) {
    Serial.println("[ENROLL] Window opened for 60 seconds");
    // Blink green LED for duration
    for (int i = 0; i < 60; i++) {
      digitalWrite(GREEN_LED, HIGH);
      delay(500);
      digitalWrite(GREEN_LED, LOW);
      delay(500);
    }
  }
  http.end();
}

void loop() {
  // Wait for fingerprint
  uint8_t result = finger.getImage();
  if (result != FINGERPRINT_OK) {
    delay(100);
    return;
  }
  
  result = finger.image2Tz();
  if (result != FINGERPRINT_OK) return;
  
  result = finger.fingerSearch();
  if (result == FINGERPRINT_OK) {
    Serial.printf("[FP] Match found! ID: %d, Confidence: %d\n", 
                  finger.fingerID, finger.confidence);
    
    if (isAdminFingerprint(finger.fingerID)) {
      Serial.println("[AUTH] Admin verified — opening enrollment window");
      successFeedback();
      openEnrollmentWindow();
    } else {
      Serial.println("[AUTH] Not an admin fingerprint");
      failureFeedback();
    }
  } else {
    Serial.println("[FP] No match found");
    failureFeedback();
  }
  
  delay(1000);
}
*/

export const ESP32_ADMIN_CODE = "See comments above for complete ESP32 admin module code";
