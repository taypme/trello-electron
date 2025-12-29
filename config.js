'use strict';

const fs = require('fs');
const path = require('path');
const {app} = require('electron');

const defaults = {
  zoomFactor: 1,
  lastWindowState: {
    width: 800,
    height: 600
  }
};

let cachedState;

function loadState() {
  if (cachedState) {
    return cachedState;
  }

  const filePath = path.join(app.getPath('userData'), 'config.json');
  let data = {};

  try {
    data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.warn('Failed to read config file:', error);
    }
  }

  cachedState = {
    filePath,
    data: Object.assign({}, defaults, data)
  };

  return cachedState;
}

function get(key) {
  return loadState().data[key];
}

function set(key, value) {
  const state = loadState();
  state.data[key] = value;

  fs.mkdirSync(path.dirname(state.filePath), {recursive: true});
  fs.writeFileSync(state.filePath, JSON.stringify(state.data, null, 2));
}

module.exports = {get, set};
