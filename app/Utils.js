import { scaleLinear } from 'd3-scale';
import { rgb } from 'd3-color';
import axios from 'axios';

const BASE_URL = 'http://dawn.local';
/* eslint-disable import/no-mutable-exports */
let NUM_LEDS = 60; // TODO make this a getter
/* eslint-enable import/no-mutable-exports */

// TODO DRY up these get/set methods

function getColor() {
  const url = `${BASE_URL}/color`;
  return axios
    .get(url, {})
    .then(response => response.data)
    .catch(() => undefined);
}

function getColors() {
  const url = `${BASE_URL}/colors`;
  return axios
    .get(url, {})
    .then(response => response.data)
    .catch(() => undefined);
}

function setColors(colors) {
  const url = `${BASE_URL}/colors`;
  return axios
    .post(url, colors)
    .then(response => response.data)
    .catch(error => {
      /* eslint-disable no-console */
      console.log(
        `setColors: error in axios.post('${url}', ${JSON.stringify(colors)})`
      );
      console.log(error);
      /* eslint-enable no-console */
    });
}

function getAlarms() {
  const url = `${BASE_URL}/alarms`;
  return axios
    .get(url, {})
    .then(response => response.data)
    .catch(() => undefined);
}

function setColor(color) {
  const url = `${BASE_URL}/color`;
  return axios.post(url, color).then(response => response.data).catch(error => {
    /* eslint-disable no-console */
    console.log(
      `setColor: error in axios.post('${url}', ${JSON.stringify(color)})`
    );
    console.log(error);
    /* eslint-enable no-console */
  });
}

function setAlarms(alarms) {
  const url = `${BASE_URL}/alarms`;
  const param = {};
  Object.keys(alarms).forEach(key => {
    param[key] = alarms[key].format('HH:mm');
  });
  return axios.post(url, param).then(response => response.data).catch(error => {
    /* eslint-disable no-console */
    console.log(
      `setColor: error in axios.post('${url}, alarms) alarms ='`,
      alarms
    );
    console.log(error);
    /* eslint-enable no-console */
  });
}

function setGradient(startColor, endColor) {
  const colorScale = scaleLinear()
    .domain([0, NUM_LEDS - 1])
    .range([startColor, endColor]);
  const colors = [];
  for (let i = 0; i < NUM_LEDS; i += 1) {
    const c = rgb(colorScale(i));
    colors[i] = { r: c.r, g: c.g, b: c.b };
  }
  setColors(colors);
}

function interpolate(startColor, endColor) {
  const url = `${BASE_URL}/interpolate`;
  const body = {
    start: { r: startColor.r, g: startColor.g, b: startColor.b },
    end: { r: endColor.r, g: endColor.g, b: endColor.b },
  };
  return axios.post(url, body).then(response => response.data).catch(error => {
    /* eslint-disable no-console */
    console.log(
      `setColor: error in axios.post('${url}', ${JSON.stringify(body)})`
    );
    console.log(error);
    /* eslint-enable no-console */
  });
}

function getOptions() {
  const url = `${BASE_URL}/options`;
  return axios
    .get(url, {})
    .then(response => {
      NUM_LEDS = response.data.num_leds;
      return response.data;
    })
    .catch(() => undefined);
}

function setOptions(options) {
  const url = `${BASE_URL}/options`;
  return axios
    .post(url, options)
    .then(response => response.data)
    .catch(error => {
      /* eslint-disable no-console */
      console.log(
        `setOptions: error in axios.post('${url}', ${JSON.stringify(options)})`
      );
      console.log(error);
      /* eslint-enable no-console */
    });
}

function triggerAlarm() {
  const url = `${BASE_URL}/triggerAlarm`;
  return axios.post(url).then(response => response.data).catch(error => {
    /* eslint-disable no-console */
    console.log(`triggerAlarm: error in axios.post('${url}')`);
    console.log(error);
    /* eslint-enable no-console */
  });
}

export {
  BASE_URL,
  NUM_LEDS,
  getColor,
  getColors,
  getAlarms,
  setAlarms,
  setColor,
  setColors,
  setGradient,
  interpolate,
  getOptions,
  setOptions,
  triggerAlarm,
};
