'use strict'

const assign = require('101/assign')
const EventEmitter = require('events').EventEmitter
const mockChannelFactory = require('./mock-channel-factory.js')
const sinon = require('sinon')

module.exports = mockConnectionFactory

function mockConnectionFactory () {
  const conn = assign(new EventEmitter(), {
    createChannel: mockChannelFactory,
    connect: sinon.stub(),
    close: sinon.stub()
  })

  return conn
}
