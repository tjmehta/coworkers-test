'use strict'
require('promise-polyfill')

const Code = require('code')
const Lab = require('lab')

const mockChannelFactory = require('../lib/mock-channel-factory.js')

const lab = module.exports.lab = Lab.script()
const describe = lab.describe
const expect = Code.expect
const it = lab.it
const beforeEach = lab.beforeEach

describe('mockChannel', function () {
  let ctx

  describe('not consumer channel', function () {
    beforeEach(function (done) {
      ctx = {}
      ctx.mockChannel = mockChannelFactory(false)
      done()
    })

    it('should publisherChannel.ack', function (done) {
      const message = { context: {} }
      ctx.mockChannel.ack(message)
      // assert that consumerChannel logic is not run
      expect(message.messageAcked).to.not.exist()
      done()
    })
    it('should publisherChannel.nack', function (done) {
      const message = { context: {} }
      ctx.mockChannel.nack(message)
      // assert that consumerChannel logic is not run
      expect(message.messageAcked).to.not.exist()
      done()
    })
  })

  describe('double call', function () {
    beforeEach(function (done) {
      ctx = {}
      ctx.mockChannel = mockChannelFactory(true)
      done()
    })

    it('should publisherChannel.ack', function (done) {
      const message = { context: {} }
      ctx.mockChannel.ack(message)
      // assert that consumerChannel logic is run
      expect(message.messageAcked).to.be.true()
      expect(
        ctx.mockChannel.ack.bind(ctx.mockChannel, message)
      ).to.throw(/cannot/)
      done()
    })
    it('should publisherChannel.nack', function (done) {
      const message = { context: {} }
      ctx.mockChannel.nack(message)
      // assert that consumerChannel logic is run
      expect(message.messageAcked).to.be.true()
      expect(
        ctx.mockChannel.nack.bind(ctx.mockChannel, message)
      ).to.throw(/cannot/)
      done()
    })
  })
})
