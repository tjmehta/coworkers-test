'use strict'

const CoworkersTest = require('./lib/coworkers-test.js')

module.exports = coworkersTestFactory

function coworkersTestFactory (app) {
  return new CoworkersTest(app)
}
