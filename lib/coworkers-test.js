'use strict'

const assert = require('assert')

const assertArgs = require('assert-args')
const castBuffer = require('cast-buffer')
const clone = require('101/clone')
const coworkers = require('coworkers')
const defaults = require('101/defaults')
const isEmpty = require('101/is-empty')

let deliveryTag = 0

const CoworkersExpect = require('./coworkers-expect.js')

module.exports = class CoworkersTest {
  constructor (app) {
    assert(app instanceof coworkers, 'app must be a coworkers app instance')
    assert(!isEmpty(app.queueMiddlewares), 'app requires consumers, please use "queue" before calling connect')
    assert(app.listeners('error').length > 0, 'app requires an error handler (very important, please read the docs)')
    this.app = app
  }
  /**
   * send a mock message to the coworkers app
   * @param  {String} queueName queue name
   * @param  {String|object|array|number} content message content
   * @param  {Object} props     message properties, optional
   * @param  {Object} fields    message fields, optional
   * @return {CoworkersExpect}  returns a coworkersExpect instance
   */
  send (queueName, content, props, fields) {
    const args = assertArgs(arguments, {
      'queueName': 'string',
      'content': ['string', 'number', 'object', 'array', Buffer],
      '[props]': 'object',
      '[fields]': 'object'
    })
    // set and cast
    queueName = args.queueName
    content = castBuffer(args.content)
    props = clone(args.props || {})
    fields = clone(args.fields || {})
    // defaults
    defaults(props, {
      headers: {}
    })
    defaults(fields, {
      'consumerTag': 'amq.ctag-izmxkEleoW2XjvKP3mNNUA',
      'deliveryTag': deliveryTag++,
      'redelivered': false,
      'exchange': '',
      'routingKey': queueName
    })
    // create message
    const message = {
      fields: fields,
      properties: props,
      content: content
    }

    assert(this.app.queueMiddlewares[queueName], `app does not consume "${queueName}"`)
    return new CoworkersExpect(this.app, queueName, message)
  }
}
