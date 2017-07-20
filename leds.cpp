#include "dawn_alarm.h"
#include "leds.h"
#include "alarmer.h" // to get DEBUG_ALARMER_PRINT
#include <NeoPixelBus.h>
#include "crgb16.h"
#include "crgb32.h"

// #define DEBUG_LEDS

#ifdef DEBUG_LEDS
#define DEBUG_LEDS_PRINT(...) Serial.printf(__VA_ARGS__)
#else
#define DEBUG_LEDS_PRINT(...)
#endif

extern const uint16_t gamma16[256];
#ifdef fastled
// static const int DATA_PIN = 7; // D7, GPIO13, RXD2, HMOSI
// static const int CLK_PIN = 5; // D5, GPIO14, HSCLK
#endif
#ifdef pixie
Adafruit_Pixie strip = Adafruit_Pixie(hwLeds::NUM_LEDS, &Serial1);
#endif
#ifdef neopixelbus
NeoPixelBus<NeoGrbwFeature, Neo800KbpsMethod> strip(hwLeds::NUM_LEDS);
#endif
CRGB leds[hwLeds::NUM_LEDS]; // TODO should be private to a hw specific class of some sort
CRGB frame[hwLeds::NUM_LEDS];
bool frameUpdated = false;

class LedsOff : public Animator {
public:
  void render() { hwLeds::setColor(CRGB(0,0,0));};
  void print() { Serial.print("LedsOff()"); }
};
static LedsOff ledsOff;
Animator* animator = &ledsOff;

const CRGB hwLeds::getColor() {
  uint16_t r = 0;
  uint16_t g = 0;
  uint16_t b = 0;
  for (int i = 0; i < hwLeds::NUM_LEDS; i++) {
    r += frame[i].R;
    g += frame[i].G;
    b += frame[i].B;
  }
  r = (r+hwLeds::NUM_LEDS/2)/hwLeds::NUM_LEDS;
  g = (g+hwLeds::NUM_LEDS/2)/hwLeds::NUM_LEDS;
  b = (b+hwLeds::NUM_LEDS/2)/hwLeds::NUM_LEDS;
  return CRGB(r, g, b);
}

const CRGB* hwLeds::getColors() {
  return frame;
}

void hwLeds::setColors(const CRGB* b) {
  for (int i = 0; i<hwLeds::NUM_LEDS; i++) {
    frame[i] = b[i];
  }
  frameUpdated = true;
}

void hwLeds::setColor(const CRGB& color) {
  for (int i = 0; i<hwLeds::NUM_LEDS; i++) {
    frame[i] = color;
  }
  frameUpdated = true;
}

class Error16 {
public: // so that you can print it, should be private
  int16_t r;
  int16_t g;
  int16_t b;

public:
  // default values are zero
  inline Error16() __attribute__((always_inline)) : r(0), g(0), b(0) {}

  // allow construction from signed 16 bit R, G, B
  inline Error16( int16_t ir, int16_t ig, int16_t ib)  __attribute__((always_inline)) : r(ir), g(ig), b(ib) {}

  void correctOne(int16_t& error, uint16_t& component) {
    int c = component + error;
    if (c < 0) {
      error = c;
      component = 0;
      DEBUG_LEDS_PRINT("<");
      return;
    }
    if (c > 65535) {
      error = c - 65535;
      component = 65535;
      DEBUG_LEDS_PRINT(">");
      return;
    }
    error = 0;
    component = c;
    DEBUG_LEDS_PRINT("=");
  }

  CRGB16  correct(CRGB16& c) {
    correctOne(r, c.r);
    correctOne(g, c.g);
    correctOne(b, c.b);
    return c;
  }

  void update(CRGB16& wanted, CRGB& got) {
    CRGB16 got16(got);
    r += wanted.r-got16.r;
    g += wanted.g-got16.g;
    b += wanted.b-got16.b;
  }
};

Error16 errors[hwLeds::NUM_LEDS];
// Error16 error(0,0,0);

CRGB16 gammaCorrect(CRGB& c) {
  return CRGB16(c);
  // return CRGB16(
  //               gamma16[c.r],
  //               gamma16[c.g],
  //               gamma16[c.b]);
};

void show() {
  if (!frameUpdated) {
    return;
  }
  DEBUG_LEDS_PRINT("@%lu leds show()\n", millis());
  for (int i = 0; i<hwLeds::NUM_LEDS; i++) {
    CRGB16 c(gammaCorrect(frame[i]));
    DEBUG_LEDS_PRINT("c %04x,%04x,%04x", c.r, c.g, c.b);
    Error16 error = errors[i];
    DEBUG_LEDS_PRINT(", start error: %+4d, %+4d, %+4d ", error.r, error.g, error.b);
    c = error.correct(c);
    leds[i] = c.CRGB16to8();
    DEBUG_LEDS_PRINT(", led[%2d] %02x%02x%02x", i, leds[i].R, leds[i].G, leds[i].B);
    error.update(c, leds[i]);
    DEBUG_LEDS_PRINT(", end error: %+4d, %+4d, %+4d", error.r, error.g, error.b);
    errors[i] = error;
    DEBUG_LEDS_PRINT("\n");
  }
  for (int i = 0; i < hwLeds::NUM_LEDS; i++) {
    strip.SetPixelColor(i, leds[i]);
  }
#ifdef neopixelbus
  DEBUG_LEDS_PRINT("strip.Show()\n");
  strip.Show();
#endif
#ifdef pixie
  strip.show();
#endif
#ifdef fastled
  FastLED.show();
#endif
  frameUpdated = false;
}

// void show() {
//   for (int i = 0; i<hwLeds::NUM_LEDS; i++) {
//     leds[i] = frame[i].CRGB16to8();
//   }
//   FastLED.show();
//   FastLED.delay(0);
// }

void hwLeds::setAnimator(Animator& a) {
  animator = &a;
#ifdef DEBUG_ALARMER
  Serial.printf("@%d Animator  = ", millis()); a.print(); Serial.println();
#endif
}

uint32_t fpsEndTime;
uint32_t frames;

void hwLeds::setup() {
  fpsEndTime = millis()+1000;
  frames = 0;
#ifdef neopixelbus
  strip.Begin();
  strip.ClearTo(RgbwColor(0,0,0,0));
  strip.Show();
#endif
#ifdef pixie
  Serial1.begin(115200);  // <- Alt. if using hardware serial port
  strip.setBrightness(255);  // Adjust as necessary to avoid blinding
#endif
#ifdef fastled
  FastLED.setMaxPowerInVoltsAndMilliamps(5, 4000); // external power brick
  // FastLED.setMaxPowerInVoltsAndMilliamps(5, 2000); // usb power
  FastLED.addLeds<WS2812B, DATA_PIN, GRB>(leds, hwLeds::NUM_LEDS);
  // FastLED.addLeds<APA102, DATA_PIN, CLK_PIN, RGB>(leds, hwLeds::NUM_LEDS);
#endif
}

void hwLeds::loop() {
  animator->render();
  show();
#ifdef fastled
  FastLED.delay(0);
#endif
  frames++;
  if (millis()>=fpsEndTime) {
    DEBUG_PRINT("@%lu, %d fps\n", millis(), frames);
    fpsEndTime = millis()+1000;
    frames = 0;
  }
}

const uint16_t gamma16[256] = {
  0, 0, 0, 0, 1, 1, 2, 3, 4, 6, 8, 10, 13, 16, 19, 24,
  28, 33, 39, 46, 53, 60, 69, 78, 88, 98, 110, 122, 135, 149, 164, 179,
  196, 214, 232, 252, 273, 295, 317, 341, 366, 393, 420, 449, 478, 510, 542, 575,
  610, 647, 684, 723, 764, 806, 849, 894, 940, 988, 1037, 1088, 1140, 1194, 1250, 1307,
  1366, 1427, 1489, 1553, 1619, 1686, 1756, 1827, 1900, 1975, 2051, 2130, 2210, 2293, 2377, 2463,
  2552, 2642, 2734, 2829, 2925, 3024, 3124, 3227, 3332, 3439, 3548, 3660, 3774, 3890, 4008, 4128,
  4251, 4376, 4504, 4634, 4766, 4901, 5038, 5177, 5319, 5464, 5611, 5760, 5912, 6067, 6224, 6384,
  6546, 6711, 6879, 7049, 7222, 7397, 7576, 7757, 7941, 8128, 8317, 8509, 8704, 8902, 9103, 9307,
  9514, 9723, 9936, 10151, 10370, 10591, 10816, 11043, 11274, 11507, 11744, 11984, 12227, 12473, 12722, 12975,
  13230, 13489, 13751, 14017, 14285, 14557, 14833, 15111, 15393, 15678, 15967, 16259, 16554, 16853, 17155, 17461,
  17770, 18083, 18399, 18719, 19042, 19369, 19700, 20034, 20372, 20713, 21058, 21407, 21759, 22115, 22475, 22838,
  23206, 23577, 23952, 24330, 24713, 25099, 25489, 25884, 26282, 26683, 27089, 27499, 27913, 28330, 28752, 29178,
  29608, 30041, 30479, 30921, 31367, 31818, 32272, 32730, 33193, 33660, 34131, 34606, 35085, 35569, 36057, 36549,
  37046, 37547, 38052, 38561, 39075, 39593, 40116, 40643, 41175, 41711, 42251, 42796, 43346, 43899, 44458, 45021,
  45588, 46161, 46737, 47319, 47905, 48495, 49091, 49691, 50295, 50905, 51519, 52138, 52761, 53390, 54023, 54661,
  55303, 55951, 56604, 57261, 57923, 58590, 59262, 59939, 60621, 61308, 62000, 62697, 63399, 64106, 64818, 65535
};
