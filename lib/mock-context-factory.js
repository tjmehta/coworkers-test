'use strict'

const Context = require('coworkers/lib/context.js')
const defaults = require('101/defaults')
const sinon = require('sinon')
require('sinon-as-promised')

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
  sinon.spy(context, 'publish')
  sinon.spy(context, 'sendToQueue')
  sinon.stub(context, 'request').resolves()
  sinon.stub(context, 'reply')
  sinon.stub(context, 'checkQueue').resolves()
  sinon.stub(context, 'checkReplyQueue').resolves()

  return context
}
