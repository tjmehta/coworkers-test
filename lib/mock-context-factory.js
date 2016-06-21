'use strict'

const Context = require('coworkers/lib/context.js')
const defaults = require('101/defaults')
const sinon = require('sinon')

const mockChannelFactory = require('./mock-channel-factory.js')
const mockConnectionFactory = require('./mock-connection-factory.js')

module.exports = mockContextFactory

function mockContextFactory (app, queueName, message) {
  defaults(app, {
    connection: mockConnectionFactory(),
    consumerChannel: mockChannelFactory(true),
    publisherChannel: mockChannelFactory()
  })

  const context = new Context(app, queueName, message)
  sinon.stub(context, 'publish')
  sinon.stub(context, 'sendToQueue')

  return context
}
