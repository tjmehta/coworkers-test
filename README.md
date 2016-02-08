# coworkers-test
Helper to easily test [coworkers](https://github.com/tjmehta/coworkers) message-handling middlewares as a unit

# Installation
```bash
npm install --save coworkers-test
```

# Usage
`test.js`:
```js
const coworkersTest = require('coworkers-test')

const app = require('app.js')

// BDD style is shown but not required.
//   Replace the BDD style in this example w/ you test runner's api
describe('int-queue', function () {
  it('should ack if the message is an int', function (done) {
    coworkersTest(app)
      .send('foo-queue', '20')
      .expectAck() // check out the api section below for all available methods
      .expect(done)
  })
  it('should nack if the message is not an int', function (done) {
    coworkersTest(app)
      .send('foo-queue', 'abc')
      .expectNack() // check out the api section below for all available methods
      .expect(done)
  })
  // failed test
  it('purposeful failed test to show coworker-test usage', function (done) {
    coworkersTest(app)
      .send('foo-queue', 'abc')
      .expectAck() // note: this is an ACK
      .expect(function (err, context) {
        console.error(err) // [ Error: expected "ack" but got "nack" ]
        // you can make assertions on context if you want
        // it is always passed even in the error case.
        done(err)
      })
  })
})
```

`app.js`:
```js

const app = module.exports = require('coworkers')()

app.queue('int-queue', function () {
  const int = parseInt(this.message)
  if (isNaN(int)) {
    throw new Error(`${this.message} is not a number`)
  }
  this.ack = true
})

app.on('error', function (err, context) {
  console.error(err.stack)
  const requeue = false
  context.nack(context.message, requeue)
})
```

# API
### send(queueName, content, [props], [fields])
Use this to mock-send a message to your coworkers app
`content` is the message content (it will cast numbers, strings, objects, and arrays to buffers for you)
`props` are optional, and set as message properties to add to your message.
`fields` are optional, message fields (like `headers`) to add to your message.
Defaults:
```js
// default message.properties
{
  headers: {}
}
// default message.fields
{
  'consumerTag': 'amq.ctag-izmxkEleoW2XjvKP3mNNUA',
  'deliveryTag': deliveryTag++, // auto-incremented id starting at 1
  'redelivered': false,
  'exchange': '',
  'routingKey': queueName
}
```

### expect(cb)
Allows you to handle any assertion errors (expectAck, etc) and make custom assertions of your own on context
Callback recieves `err` (assertion err) and `context`. `context` will always be passed even in the case of an error.

### expectAck([expectedOpts])
Expect that queue's consumer `ack`s the message, will pass it's error to `expect` callback.
`expectedOpts` allows you to verify that `ack` was invoked w/ the appropriate expected opts

### expectNack([expectedOpts])
Expect that queue's consumer `nack`s the message, will pass it's error to `expect` callback.
`expectedOpts` allows you to verify that `nack` was invoked w/ the appropriate expected opts

### expectAckAll([expectedOpts])
Expect that queue's consuemr `ackAll`s the message, will pass it's error to `expect` callback.
`expectedOpts` allows you to verify that `ackAll` was invoked w/ the appropriate expected opts

### expectNackAll([expectedOpts])
Expect that queue's consumer `nackAll`s the message, will pass it's error to `expect` callback.
`expectedOpts` allows you to verify that `nackAll` was invoked w/ the appropriate expected opts

### expectReject([expectedOpts])
Expect that queue's consuemr `reject`s the message, will pass it's error to `expect` callback.
`expectedOpts` allows you to verify that `reject` was invoked w/ the appropriate expected opts

# License
MIT
