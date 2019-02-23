# idle-tasks

[![Version](https://img.shields.io/github/package-json/v/mjancarik/idle-tasks/master.svg)](https://www.npmjs.com/package/idle-tasks)
[![Build Status](https://travis-ci.org/mjancarik/idle-tasks.svg?branch=master)](https://travis-ci.org/mjancarik/idle-tasks)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![Coverage Status](https://coveralls.io/repos/github/mjancarik/idle-tasks/badge.svg?branch=master)](https://coveralls.io/github/mjancarik/idle-tasks?branch=master)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/idle-tasks.svg)
![Snyk Vulnerabilities for npm package](https://img.shields.io/snyk/vulnerabilities/npm/idle-tasks.svg)
[![dependencies Status](https://david-dm.org/mjancarik/idle-tasks/status.svg)](https://david-dm.org/mjancarik/idle-tasks)

## Installation

```
npm i idle-tasks --save
```

## Usage

``` javascript

import { createIdleQueue, Event } from 'idle-tasks';

function createTask() {
  return (deadline) => {
    return new Promise((resolve) => {
      setTimeout(resolve, 100 + time);
    })
  }
}

const idleQueue = createIdleQueue();

idleQueue.addTask(createTask());
idleQueue.addTask(createTask());
idleQueue.addTask(createTask());
idleQueue.addTask(createTask());
idleQueue.addTask(createTask());

idleQueue.on(Event.Start, () => console.log('start tasks'));
idleQueue.on(Event.Finish, ({ results }) => console.log('finish tasks', ...results));
idleQueue.on(Event.Error, ({ error }) => console.error(error));

idleQueue.schedule();

```
