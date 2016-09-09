// 447b,80x24,0,0{40x24,0,0,328,39x24,41,0[39x12,41,0,329,39x11,41,13,330]}
// first comes the window id
// then the rest
// parse values separated by commas
//  if we reach the end of the line
//    flush the currentValue
//
// if we have 4 values
//  we have a single pane
//    dimensions,x,y,paneNumber
//
//  if we reach a { or [, and we have 3 valeus
//    we have a container
//      { = horizontal
//      [ = vertical
//      dimensions,x,y

import chalk from 'chalk';

function pretty (index, chars) {
  return chars.map((char, charIndex) => charIndex === index ? chalk.green(char) : char).join('');
}

function cursor (state) {
  return ['output'].concat(state.cursor).reduce((state, key) => state[key], state);
}

function cursorParent (state) {
  return ['output'].concat(state.cursor).slice(0, -1).reduce((state, key) => state[key], state);
}

function flushCurrentValue (state) {
  if (state.currentValue !== '') {
    state.values.push(state.currentValue);
    state.currentValue = '';
  }

  return state;
}

function addContainer (orientation, state) {
  state = flushCurrentValue(state);

  const [
    dimensionsString,
    xString,
    yString
  ] = state.values.splice(0, 3);

  const [columns, rows] = dimensionsString.split('x').map(i => parseInt(i, 10));
  const {width, height} = sizeRelativeToParent({columns, rows}, state);

  state = add(state, {
    type: 'container',
    direction: orientation,
    columns,
    rows,
    width,
    height,
    children: []
  });

  return state;
}

function buildSinglePane (state) {
  state = flushCurrentValue(state);

  const [
    dimensionsString,
    xString,
    yString,
    paneNumber
  ] = state.values.splice(0, 4);

  const [columns, rows] = dimensionsString.split('x').map(i => parseInt(i, 10));
  const {width, height} = sizeRelativeToParent({columns, rows}, state);

  state = add(state, {
    type: 'pane',

    columns,
    rows,
    width,
    height,
    number: parseInt(paneNumber, 10)
  });

  return state;
}

function closeContainer (state) {
  state = flushCurrentValue(state);

  while (state.values.length > 0) {
    state = buildSinglePane(state);
  }

  state.cursor = state.cursor.slice(0, -2);

  return state;
}

function add (state, data) {
  if (state.cursor.length === 0) {
    state.output = data;

    if (data.type === 'container') {
      state.cursor.push('children');
    }

    return state;
  }

  const cursorValue = cursor(state);

  if (Array.isArray(cursorValue)) {
    cursorValue.push(data);
  }

  if (data.type === 'container') {
    state.cursor.push((cursorValue.length - 1).toString());
    state.cursor.push('children');
  }

  return state;
}

function sizeRelativeToParent ({rows, columns}, state) {
  if (state.cursor.length === 0) {
    return {
      width: 100,
      height: 100
    };
  }

  const parent = cursorParent(state);

  return {
    width: columns / parent.columns * parent.width,
    height: rows / parent.rows * parent.height
  };
}

function parseLayoutChar (state, char, index, chars) {
  if (false) {
    console.log('input: ', JSON.stringify(char));
    console.log(JSON.stringify(state, null, 2));
    console.log(pretty(index, chars));
  }

  if (state.cursor.length > 0 && state.values.length === 4) {
    state = buildSinglePane(state);
  }

  if (char === ',') {
    return flushCurrentValue(state);
  }

  if (char === '\n' && state.values.length === 3) {
    return buildSinglePane(state);
  }

  if (char === '{') {
    return addContainer('row', state);
  }

  if (char === '[') {
    return addContainer('column', state);
  }

  if (char === '}') {
    return closeContainer(state);
  }

  if (char === ']') {
    return closeContainer(state);
  }

  state.currentValue += char;

  return state;
}

export default function parseTmuxLayout (layoutString) {
  const [windowName, details] = layoutString.split(' ');

  const initialState = {
    currentValue: '',
    values: [],
    output: {},
    cursor: []
  };

  const outputState = details.split(',').slice(1).join(',').split('').concat('\n').reduce(parseLayoutChar, initialState);

  return outputState.output;
}
