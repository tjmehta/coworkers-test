'use strict'
const coworkers = require('coworkers')

module.exports = createCoworkersApp

function createCoworkersApp () {
  const app = coworkers()

  app.use(function * (next) {
    this.message.content = JSON.stringify(this.message.content)
    yield next
  })
  app.queue('ack-queue', function * () {
    this.ack = true
  })
  app.queue('nack-queue', function * () {
    this.nack = true
  })
  app.queue('ack-all-queue', function * () {
    this.ackAll = true
  })
  app.queue('publish-queue', function * () {
    const opts = {}
    this.publish('exchange-name', 'routing.key', 'content', opts)
    this.ack = true
  })
  app.queue('nack-all-queue', function * () {
    this.nackAll = true
  })
  app.queue('reject-queue', function * () {
    this.reject = true
  })
  app.queue('send-queue', function * () {
    const opts = {}
    this.sendToQueue('queue-name', 'content', opts)
    this.ack = true
  })
  app.queue('noop-queue', function * () {})
  app.queue('err-queue', function * () {
    throw new Error('boom')
  })
  app.on('error', function () { })

  return app
}
