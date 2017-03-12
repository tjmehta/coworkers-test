'use strict'

const assert = require('assert')

const clone = require('101/clone')
const noop = require('101/noop')
const sinon = require('sinon')
require('sinon-as-promised')

const mockContextFactory = require('./mock-context-factory.js')

const removeLines = function (str, index, count) {
  const lines = str.split('\n')
  lines.splice(index, count)
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
    const expectedCalls = this.__expectedCalls = this.__expectedCalls || []
    assert(!expected, 'already expecting: ' + (expected && expected.method))
    this.__expected = {
      method: 'ack',
      opts: clone(opts),
      stack: removeLines(new Error().stack, 0, 2)
    }
    expectedCalls.push('EXPECTED')
    return this
  }
  /**
   * expect that the message consumer `nack`s the message
   * @param  {Object} [opts] expected opts that method was invoked with
   * @return {CoworkerExpect} this
   */
  expectNack (opts) {
    const expected = this.__expected
    const expectedCalls = this.__expectedCalls = this.__expectedCalls || []
    assert(!expected, 'already expecting: ' + (expected && expected.method))
    this.__expected = {
      method: 'nack',
      opts: clone(opts),
      stack: removeLines(new Error().stack, 0, 2)
    }
    expectedCalls.push('EXPECTED')
    return this
  }
  /**
   * expect that the message consumer `ackAll`s the message
   * @param  {Object} [opts] expected opts that method was invoked with
   * @return {CoworkerExpect} this
   */
  expectAckAll (opts) {
    const expected = this.__expected
    const expectedCalls = this.__expectedCalls = this.__expectedCalls || []
    assert(!expected, 'already expecting: ' + (expected && expected.method))
    this.__expected = {
      method: 'ackAll',
      opts: clone(opts),
      stack: removeLines(new Error().stack, 0, 2)
    }
    expectedCalls.push('EXPECTED')
    return this
  }
  /**
   * expect that the message consumer `nackAll`s the message
   * @param  {Object} [opts] expected opts that method was invoked with
   * @return {CoworkerExpect} this
   */
  expectNackAll (opts) {
    const expected = this.__expected
    const expectedCalls = this.__expectedCalls = this.__expectedCalls || []
    assert(!expected, 'already expecting: ' + (expected && expected.method))
    this.__expected = {
      method: 'nackAll',
      opts: clone(opts),
      stack: removeLines(new Error().stack, 0, 2)
    }
    expectedCalls.push('EXPECTED')
    return this
  }
  /**
   * expect that the message consumer `reject`s the message
   * @param  {Object} [opts] expected opts that method was invoked with
   * @return {CoworkerExpect} this
   */
  expectReject (opts) {
    const expected = this.__expected
    const expectedCalls = this.__expectedCalls = this.__expectedCalls || []
    assert(!expected, 'already expecting: ' + (expected && expected.method))
    this.__expected = {
      method: 'reject',
      opts: clone(opts),
      stack: removeLines(new Error().stack, 0, 2)
    }
    expectedCalls.push('EXPECTED')
    return this
  }
  /**
   * expect that the message consumer requests
   * @param  {String} queue queue name
   * @return {CoworkerExpect} this
   */
  expectCheckQueue (queue) {
    const expectedCalls = this.__expectedCalls = this.__expectedCalls || []
    expectedCalls.push({
      method: 'checkQueue',
      args: Array.prototype.slice.call(arguments),
      stack: removeLines(new Error().stack, 0, 2)
    })
    return this
  }
  /**
   * expect that the message consumer requests
   * @return {CoworkerExpect} this
   */
  expectCheckReplyQueue () {
    const expectedCalls = this.__expectedCalls = this.__expectedCalls || []
    expectedCalls.push({
      method: 'checkReplyQueue',
      args: Array.prototype.slice.call(arguments),
      stack: removeLines(new Error().stack, 0, 2)
    })
    return this
  }
  /**
   * expect that the message consumer requests
   * @param  {String} queue queue name
   * @param  {*} content expected message content
   * @param  {Object} [opts] expected request opts
   * @return {CoworkerExpect} this
   */
  expectRequest (queue, content, opts) {
    const expectedCalls = this.__expectedCalls = this.__expectedCalls || []
    expectedCalls.push({
      method: 'request',
      args: Array.prototype.slice.call(arguments),
      stack: removeLines(new Error().stack, 0, 2)
    })
    return this
  }
  /**
   * expect that the message consumer "replies" to the message
   * @param  {*} content expected message content
   * @param  {Object} [opts] expected reply opts
   * @return {CoworkerExpect} this
   */
  expectReply (content, opts) {
    const expectedCalls = this.__expectedCalls = this.__expectedCalls || []
    expectedCalls.push({
      method: 'reply',
      args: Array.prototype.slice.call(arguments),
      stack: removeLines(new Error().stack, 0, 2)
    })
    return this
  }
  /**
   * provide a method to stub context before tests
   */
  stubContext (fn) {
    this.__stubContext = fn
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

    var promise = handler(this.message, mockContextFactory).then(function (context) {
      const err = checkExpected(context)
      if (cb) {
        cb(err, context)
        cb = noop
      } else if (err) {
        return Promise.reject(err)
      } else {
        return Promise.resolve(context)
      }
    })
    if (cb) {
      promise.catch(function (err) {
        // note: this should not be hit w/ normal usage
        //   this logic was insert to prevent any dev errors from being hidden
        /* $lab:coverage:off$ */
        process.nextTick(function () {
          throw err
        })
        /* $lab:coverage:on$ */
      })
    }
    return promise

    function checkExpected (context) {
      const expectedCalls = self.__expectedCalls || []
      let err
      expectedCalls.some(function (call) {
        if (call === 'EXPECTED') {
          err = checkExpectedAck(context)
          return err
        }
        const args = call.args.slice()
        args.unshift(context[call.method])
        try {
          sinon.assert.calledWith.apply(sinon.assert, args)
        } catch (e) {
          err = e
          err.stack = // replace stack w/ expect line's
            err.stack.split('\n').slice(0, 1)
              .concat(call.stack.split('\n'))
              .join('\n')
          return err
        }
      })
      return err
    }
    function checkExpectedAck (context) {
      if (self.__stubContext) {
        self.__stubContext(context)
      }
      const expectedInfo = self.__expected
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
            .concat(self.__expected.stack.split('\n'))
            .join('\n')
        return err
      }
    }
  }
}
