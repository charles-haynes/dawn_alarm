#pragma once

#include <TimeAlarms.h>

// #define DEBUG_ALARMER

#ifdef DEBUG_ALARMER
#define DEBUG_ALARMER_PRINT(...) Serial.printf(__VA_ARGS__)
#else
#define DEBUG_ALARMER_PRINT(...)
#endif

namespace alarmer {
const char* const dayNames[] = {
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday"
};

  void SetAlarm(const timeDayOfWeek_t DOW, const int h, const int m);
  void setup();
  void loop();
}
