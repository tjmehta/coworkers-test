'use strict'

const Code = require('code')
const coworkers = require('coworkers')
const Lab = require('lab')

const lab = module.exports.lab = Lab.script()
const describe = lab.describe
const expect = Code.expect
const it = lab.it

const coworkersTest = require('../index.js')
const createApp = function () {
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
  app.queue('nack-all-queue', function * () {
    this.nackAll = true
  })
  app.queue('reject-queue', function * () {
    this.reject = true
  })
  app.queue('noop-queue', function * () {})
  app.queue('err-queue', function * () {
    throw new Error('boom')
  })
  app.on('error', function () { })

  return app
}

describe('coworkers-test functional test', function () {
  describe('assertions', function () {
    describe('expectAck', function () {
      it('should assert ack - nack err', function (done) {
        const app = createApp()
        coworkersTest(app)
          .send('nack-queue', {})
          .expectAck()
          .expect(function (err) {
            expect(err).to.exist()
            expect(err.message).to.equal('expected "ack" but got "nack"')
            done()
          })
      })
      it('should assert ack - no ack err', function (done) {
        const app = createApp()
        coworkersTest(app)
          .send('noop-queue', {})
          .expectAck()
          .expect(function (err) {
            expect(err).to.exist()
            expect(err.message).to.equal('expected "ack" but got nothing')
            done()
          })
      })
      it('should assert ack - success', function (done) {
        const app = createApp()
        coworkersTest(app)
          .send('ack-queue', {})
          .expectAck()
          .expect(done)
      })
      it('should assert ack - success w/ props and fields', function (done) {
        const app = createApp()
        coworkersTest(app)
          .send('ack-queue', {}, {}, {})
          .expectAck()
          .expect(done)
      })
    })

    describe('expectNack', function () {
      it('should assert - success', function (done) {
        const app = createApp()
        coworkersTest(app)
          .send('nack-queue', {})
          .expectNack()
          .expect(done)
      })
    })

    describe('expectAckAll', function () {
      it('should assert - success', function (done) {
        const app = createApp()
        coworkersTest(app)
          .send('ack-all-queue', {})
          .expectAckAll()
          .expect(done)
      })
    })

    describe('expectNackAll', function () {
      it('should assert - success', function (done) {
        const app = createApp()
        coworkersTest(app)
          .send('nack-all-queue', {})
          .expectNackAll()
          .expect(done)
      })
    })

    describe('expectReject', function () {
      it('should assert - success', function (done) {
        const app = createApp()
        coworkersTest(app)
          .send('reject-queue', {})
          .expectReject()
          .expect(done)
      })
    })

    describe('expect', function () {
      it('should assert - success', function (done) {
        const app = createApp()
        coworkersTest(app)
          .send('reject-queue', {})
          .expect(done)
      })
    })

    describe('double assertions', function () {
      describe('expectAck', function () {
        it('should error due to double call', function (done) {
          const app = createApp()
          expect(function () {
            coworkersTest(app)
              .send('ack-queue', {})
              .expectAck()
              .expectAck()
          }).to.throw(/already expecting/)
          done()
        })
      })

      describe('expectNack', function () {
        it('should error due to double call', function (done) {
          const app = createApp()
          expect(function () {
            coworkersTest(app)
              .send('nack-queue', {})
              .expectNack()
              .expectNack()
          }).to.throw(/already expecting/)
          done()
        })
      })

      describe('expectAckAll', function () {
        it('should error due to double call', function (done) {
          const app = createApp()
          expect(function () {
            coworkersTest(app)
              .send('ack-all-queue', {})
              .expectAckAll()
              .expectAckAll()
          }).to.throw(/already expecting/)
          done()
        })
      })

      describe('expectNackAll', function () {
        it('should error due to double call', function (done) {
          const app = createApp()
          expect(function () {
            coworkersTest(app)
              .send('nack-all-queue', {})
              .expectNackAll()
              .expectNackAll()
          }).to.throw(/already expecting/)
          done()
        })
      })

      describe('expectReject', function () {
        it('should error due to double call', function (done) {
          const app = createApp()
          expect(function () {
            coworkersTest(app)
              .send('reject-queue', {})
              .expectReject()
              .expectReject()
          }).to.throw(/already expecting/)
          done()
        })
      })
    })
  })
})
