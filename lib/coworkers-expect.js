'use strict'

const assert = require('assert')

const clone = require('101/clone')
const noop = require('101/noop')

const mockContextFactory = require('./mock-context-factory.js')

const removeLine = function (str, index) {
  const lines = str.split('\n')
  lines.splice(index, 1)
  return lines.join('\n')
}

module.exports = class CoworkersExpect {
  constructor (app, queueName, message) {
    this.app = app
    this.queueName = queueName
    this.message = message
  }
  /**
   * expect that the message consumer `ack`s the message
   * @param  {Object} [opts] expected opts that method was invoked with
   * @return {CoworkerExpect} this
   */
  expectAck (opts) {
    const expected = this.__expected
    assert(!expected, 'already expecting: ' + (expected && expected.method))
    this.__expected = {
      method: 'ack',
      opts: clone(opts),
      stack: removeLine(new Error().stack, 1)
    }
    return this
  }
  /**
   * expect that the message consumer `nack`s the message
   * @param  {Object} [opts] expected opts that method was invoked with
   * @return {CoworkerExpect} this
   */
  expectNack (opts) {
    const expected = this.__expected
    assert(!expected, 'already expecting: ' + (expected && expected.method))
    this.__expected = {
      method: 'nack',
      opts: clone(opts),
      stack: removeLine(new Error().stack, 1)
    }
    return this
  }
  /**
   * expect that the message consumer `ackAll`s the message
   * @param  {Object} [opts] expected opts that method was invoked with
   * @return {CoworkerExpect} this
   */
  expectAckAll (opts) {
    const expected = this.__expected
    assert(!expected, 'already expecting: ' + (expected && expected.method))
    this.__expected = {
      method: 'ackAll',
      opts: clone(opts),
      stack: removeLine(new Error().stack, 1)
    }
    return this
  }
  /**
   * expect that the message consumer `nackAll`s the message
   * @param  {Object} [opts] expected opts that method was invoked with
   * @return {CoworkerExpect} this
   */
  expectNackAll (opts) {
    const expected = this.__expected
    assert(!expected, 'already expecting: ' + (expected && expected.method))
    this.__expected = {
      method: 'nackAll',
      opts: clone(opts),
      stack: removeLine(new Error().stack, 1)
    }
    return this
  }
  /**
   * expect that the message consumer `reject`s the message
   * @param  {Object} [opts] expected opts that method was invoked with
   * @return {CoworkerExpect} this
   */
  expectReject (opts) {
    const expected = this.__expected
    assert(!expected, 'already expecting: ' + (expected && expected.method))
    this.__expected = {
      method: 'reject',
      opts: clone(opts),
      stack: removeLine(new Error().stack, 1)
    }
    return this
  }
  /**
   * expect is the last method for an coworkersTest/expect
   *   it is passed any assertion error and allows you to manually assert the context state
   * @param  {Function} callback callback(assertionErr, context)
   */
  expect (cb) {
    assert(!this.__expectCalled, 'expect already called')
    this.__expectCalled = true
    const self = this
    const handler = this.app.messageHandler(this.queueName)

    handler(this.message, mockContextFactory).then(function (context) {
      const err = checkExpected(context)
      cb(err, context)
      cb = noop
    }).catch(function (err) {
      // note: this should not be hit w/ normal usage
      //   this logic was insert to prevent any dev errors from being hidden
      /* $lab:coverage:off$ */
      process.nextTick(function () {
        throw err
      })
      /* $lab:coverage:on$ */
    })

    function checkExpected (context) {
      const expectedInfo = self.__expected
      if (!expectedInfo) { return }
      // note: make sure ack and nack are last
      const acks = ['ackAll', 'nackAll', 'reject', 'ack', 'nack']
      // note:
      // below will find ackAll, nackAll, reject before ack, nack
      // bc ackAll calls ack and nackAll/reject call nack
      const expected = expectedInfo.method
      const actual = acks.find(function (method) {
        return context.consumerChannel[method].callCount
      })

      if (actual !== expected) {
        const actualStr = actual ? `"${actual}"` : 'nothing'
        const err = new Error(`expected "${expected}" but got ${actualStr}`)
        err.stack = // replace stack w/ expect line's
          err.stack.split('\n').slice(0, 1)
            .concat(self.__expected.stack.split('\n').slice(1))
            .join('\n')
        return err
      }
    }
  }
}
