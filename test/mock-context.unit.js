'use strict'
require('promise-polyfill')

const Code = require('code')
const Lab = require('lab')
const sinon = require('sinon')
require('sinon-as-promised')

const createApp = require('./fixtures/create-coworkers-app.js')

const coworkersTest = require('../index.js')

const lab = module.exports.lab = Lab.script()
const describe = lab.describe
const expect = Code.expect
const it = lab.it

describe('mockContext', function () {
  describe('allow for publish assertions via sinon', function () {
    it('should allow for sinon assertions for context.publish', function (done) {
      const app = createApp()
      coworkersTest(app)
        .send('publish-queue', {})
        .expectAck()
        .expect(function (err, context) {
          expect(err).to.not.exist()
          sinon.assert.calledOnce(context.publish)
          sinon.assert.calledOnce(context.publisherChannel.publish)
          sinon.assert.calledWith(context.publish,
            'exchange-name', 'routing.key', 'content', {})
          sinon.assert.calledWith(context.publisherChannel.publish,
            'exchange-name', 'routing.key', new Buffer('content'), {})
          done()
        })
    })
    it('should allow for sinon assertions for context.sendToQueue', function (done) {
      const app = createApp()
      coworkersTest(app)
        .send('send-queue', {})
        .expectAck()
        .expect(function (err, context) {
          expect(err).to.not.exist()
          sinon.assert.calledOnce(context.sendToQueue)
          sinon.assert.calledOnce(context.publisherChannel.sendToQueue)
          sinon.assert.calledWith(context.sendToQueue,
            'queue-name', 'content', {})
          sinon.assert.calledWith(context.publisherChannel.sendToQueue,
            'queue-name', new Buffer('content'), {})
          done()
        })
    })
  })
})
