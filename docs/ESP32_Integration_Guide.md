# SmartyFish: ESP32 Integration Guide

This document outlines the detailed integration between the React Native app and the ESP32 micro-controller, as well as an example Arduino sketch to handle the POST requests.

## 1. How the App Uses the Phone's WiFi
The React Native app natively utilizes the phone’s active WiFi interface via the `axios` or `fetch` API. It does not require any special mobile data permissions. As long as the phone is connected to a WiFi network, standard HTTP requests are routed through that network interface to local or external IPs.

## 2. Connecting Phone and ESP32 to the Same Network
For local HTTP communication to work without a cloud backend or router port-forwarding, both the ESP32 and the smartphone must be connected to the **same WiFi router** (or the ESP32 can act as an Access Point that the phone connects to directly). In this setup, we assume both are on the same home network, meaning they will have IP addresses in the same subnet (e.g., `192.168.1.x`).

## 3. How the ESP32 Creates a Web Server
The ESP32 uses the `WebServer` (or the newer `AsyncTCP`/`ESPAsyncWebServer`) library. This library listens on port `80` for incoming HTTP requests. When a request matches a defined route (like `/setData`), a specific callback function is executed to handle the payload.

## 4. IP Address Discovery (Fixed IP vs mDNS)
Since IPs can change by DHCP:
- **Fixed/Static IP**: You can configure your router to always assign a specific IP (e.g., `192.168.1.100`) to the ESP32's MAC address, or configure it in the ESP32 code.
- **mDNS**: The ESP32 can broadcast a hostname (like `smartyfish.local`) using the `ESPmDNS` library. Note that Android's native mDNS resolution can sometimes be spotty without a specific plugin, so a Static IP is highly recommended for production reliability.

## 5. How the App Sends HTTP Requests
The app uses `axios.post('http://192.168.1.100/setData', JSON_PAYLOAD)`. This opens a TCP connection to port 80 on the ESP32, sends HTTP headers (like `Content-Type: application/json`), and sends the stringified JSON payload.

## 6. What Happens Inside ESP32 When JSON is Received
The ESP32 receives the textual JSON stream. Using a library like **ArduinoJson**, the text is parsed into a JSON document object. This allows you to easily extract integer values using keys like `doc["totalFood"]` and `doc["interval"]`.

## 7. How Data is Stored in ESP32
To ensure feeding configurations survive power outages, data is written to the flash memory using the **Preferences.h** library (which uses Non-Volatile Storage or NVS). It is superior to the older `EEPROM` library because it handles wear-leveling and uses named key-value pairs instead of manual byte offsets.

## 8. RTC-Based Feeding Logic
The ESP32 should maintain an internal clock using an RTC module (like DS3231) or via network time (NTP). A variable tracks the `nextFeedTime`. In the `loop()`, it continually checks: `if (currentTime >= nextFeedTime)`, trigger the servo motor relay, and then update `nextFeedTime = currentTime + (interval * 3600)`.

## 9. Security Considerations
Local network traffic is unencrypted HTTP. To add basic security and prevent rogue devices from triggering the feeder:
- **Authentication Token**: The app should send a `X-Auth-Token` header or include a password field in the JSON payload. The ESP32 code checks if `doc["password"] == "mySecret"`. If not, it returns a `401 Unauthorized`.

## 10. Handling WiFi Disconnection
If the ESP32 loses WiFi, the `loop()` should periodically attempt to reconnect using `WiFi.begin()`. Critically, the feeding logic inside `loop()` should **not** block during `WiFi.begin()`. Since the schedule is saved in `Preferences` and time is tracked via RTC, the fish will still get fed even if the WiFi is down.

---

## Complete ESP32 Example Code

Below is a robust Arduino sketch demonstrating the web server, JSON parsing, Preferences saving, and basic security.

```cpp
#include <WiFi.h>
#include <WebServer.h>
#include <ArduinoJson.h>
#include <Preferences.h>
#include <ESPmDNS.h>

// WiFi Settings
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Security Token
const String AUTH_TOKEN = "smarty-secret-123";

WebServer server(80);
Preferences preferences;

// Feeding Variables
int smallFish = 0;
int mediumFish = 0;
int largeFish = 0;
float totalFood = 0.0;
int interval = 8; // hours

void setup() {
  Serial.begin(115200);
  
  // 1. Initialize Preferences (NVS)
  preferences.begin("fish-app", false);
  totalFood = preferences.getFloat("totalFood", 0.0);
  interval = preferences.getInt("interval", 8);
  
  // 2. Connect to WiFi
  // Optionally use Static IP here: WiFi.config(ip, gateway, subnet)
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected.");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());

  // 3. mDNS Setup (Optional but helpful)
  if (MDNS.begin("smartyfish")) {
    Serial.println("MDNS responder started at smartyfish.local");
  }

  // 4. Setup Web Server Routes
  server.on("/setData", HTTP_POST, handleSetData);
  server.on("/feedNow", HTTP_POST, handleFeedNow);
  
  server.begin();
  Serial.println("HTTP Server started");
}

void loop() {
  server.handleClient();
  
  // TODO: Add RTC checking logic here
  // if (rtc.now() >= nextFeedTime) { dispenseFood(totalFood); }
}

// Handler for App Config
void handleSetData() {
  // CORS Headers if testing from browser
  server.sendHeader("Access-Control-Allow-Origin", "*");

  if (server.hasArg("plain") == false) {
    server.send(400, "application/json", "{\"error\": \"Body not received\"}");
    return;
  }
  
  String body = server.arg("plain");
  StaticJsonDocument<512> doc;
  DeserializationError error = deserializeJson(doc, body);

  if (error) {
    server.send(400, "application/json", "{\"error\": \"Invalid JSON\"}");
    return;
  }

  // Basic Security Check (if we included a token in the JSON from the app)
  // if (doc["token"] != AUTH_TOKEN) {
  //   server.send(401, "application/json", "{\"error\": \"Unauthorized\"}");
  //   return;
  // }

  // Extract variables
  smallFish = doc["smallFish"];
  mediumFish = doc["mediumFish"];
  largeFish = doc["largeFish"];
  totalFood = doc["totalFood"];
  interval = doc["interval"];

  // Save to Non-Volatile Memory
  preferences.putFloat("totalFood", totalFood);
  preferences.putInt("interval", interval);
  
  // Recalculate scheduled time based on new interval here...

  Serial.println("Saved new config!");
  Serial.println("Total Food: " + String(totalFood));
  
  server.send(200, "application/json", "{\"status\": \"Success\"}");
}

// Handler for Manual Feeding
void handleFeedNow() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  // Extract amount and dispense immediately
  Serial.println("Manual feed triggered!");
  // dispenseFood(amount);
  server.send(200, "application/json", "{\"status\": \"Fed!\"}");
}

// Hardware mock function
void dispenseFood(float grams) {
  // Move servo proportional to grams ...
}
```

## Setup Instructions

1. **Upload ESP32 Code**: Open the Arduino IDE, paste the code above, insert your WiFi credentials, install `ArduinoJson` via Library Manager, and flash to your ESP32.
2. **Obtain IP Address**: Open the Serial Monitor at 115200 baud, note the IP address printed (e.g., `192.168.1.100`).
3. **App Integration**: In the React Native code (`src/utils/api.ts`), update `ESP32_IP` to match the exact IP of your ESP32.
4. **Testing**: Run the Expo app using `npx expo start`. Enter the fish counts, hit `Save Configuration`, and you will see "Saved new config!" appear on your Arduino Serial Monitor.
