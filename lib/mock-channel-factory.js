'use strict'

const assert = require('assert')

const assign = require('101/assign')
const EventEmitter = require('events').EventEmitter
const sinon = require('sinon')

module.exports = mockChannelFactory

function mockChannelFactory (isConsumerChannel) {
  const mockChannel = assign(new EventEmitter(), {
    ack: function (message) {
      // emulate consumeChannel behavior from coworkers/lib/rabbit-utils/app-channel-create.js
      if (isConsumerChannel) {
        assert(!message.messageAcked, 'Messages cannot be acked/nacked more than once (will close channel)')
        message.messageAcked = true
      }
    },
    nack: function (message/*, allUpTo, requeue*/) {
      // emulate consumeChannel behavior from coworkers/lib/rabbit-utils/app-channel-create.js
      if (isConsumerChannel) {
        assert(!message.messageAcked, 'Messages cannot be acked/nacked more than once (will close channel)')
        message.messageAcked = true
      }
    },
    ackAll: function (message) {
      this.ack(message, true)
    },
    nackAll: function (message) {
      this.nack(message, true)
    },
    reject: function (message, requeue) {
      this.nack(message, false, requeue)
    },
    sendToQueue: sinon.stub(),
    publish: sinon.stub()
  })
  sinon.spy(mockChannel, 'ack')
  sinon.spy(mockChannel, 'nack')
  sinon.spy(mockChannel, 'ackAll')
  sinon.spy(mockChannel, 'nackAll')
  sinon.spy(mockChannel, 'reject')

  return mockChannel
}
