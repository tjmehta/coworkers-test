'use strict'

const Code = require('code')
const Lab = require('lab')

const mockChannelFactory = require('../lib/mock-channel-factory.js')

const lab = module.exports.lab = Lab.script()
const describe = lab.describe
const expect = Code.expect
const it = lab.it
const beforeEach = lab.beforeEach

describe('mockChannel - publisher', function () {
  let ctx
  beforeEach(function (done) {
    ctx = {}
    ctx.mockChannel = mockChannelFactory(false)
    done()
  })

  describe('tests for coverage', function () {
    it('should publisherChannel.ack', function (done) {
      const message = { context: {} }
      ctx.mockChannel.ack(message)
      // assert that consumerChannel logic is not run
      expect(message.context.messageAcked).to.not.exist()
      done()
    })
    it('should publisherChannel.nack', function (done) {
      const message = { context: {} }
      ctx.mockChannel.nack(message)
      // assert that consumerChannel logic is not run
      expect(message.context.messageAcked).to.not.exist()
      done()
    })
  })
})
