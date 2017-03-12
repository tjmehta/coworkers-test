'use strict'
require('promise-polyfill')

const Code = require('code')
const Lab = require('lab')

const lab = module.exports.lab = Lab.script()
const describe = lab.describe
const expect = Code.expect
const it = lab.it

const coworkersTest = require('../index.js')
const createApp = require('./fixtures/create-coworkers-app.js')

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
      it('should assert ack - Promise no ack err', function (done) {
        const app = createApp()
        coworkersTest(app)
          .send('noop-queue', {})
          .expectAck()
          .expect()
          .then(function () {
            done(new Error('expected an error'))
          })
          .catch(function (err) {
            expect(err).to.exist()
            expect(err.message).to.equal('expected "ack" but got nothing')
            done()
          })
      })
      it('should assert ack - Promise success', function (done) {
        const app = createApp()
        coworkersTest(app)
          .send('ack-queue', {})
          .expectAck()
          .expect()
          .then(function () {
            done()
          })
          .catch(done)
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

    describe('expectRequest', function () {
      it('should assert - success', function (done) {
        const app = createApp()
        coworkersTest(app)
          .send('request-queue', {})
          .expectRequest('queue-name', 'content', {})
          .expect(done)
      })

      it('should assert - error', function (done) {
        const app = createApp()
        coworkersTest(app)
          .send('request-queue', {})
          .expectRequest('queue-name', 'ERRORCONTENT', {})
          .expectRequest('queue-name', 'ERRORCONTENT', {})
          .expect(function (err) {
            expect(err).to.exist()
            expect(err.message).to.match(/ERRORCONTENT/)
            done()
          })
      })

      it('should assert - error order', function (done) {
        const app = createApp()
        coworkersTest(app)
          .send('request-queue', {})
          .expectRequest('queue-name', 'ERRORCONTENT', {})
          .expectNack()
          .expect(function (err) {
            expect(err).to.exist()
            expect(err.message).to.match(/ERRORCONTENT/)
            done()
          })
      })

      it('should assert - error order2', function (done) {
        const app = createApp()
        coworkersTest(app)
          .send('request-queue', {})
          .expectNack()
          .expectRequest('queue-name', 'ERRORCONTENT', {})
          .expect(function (err) {
            expect(err).to.exist()
            expect(err.message).to.match(/expected "nack" but got "ack"/)
            done()
          })
      })
    })

    describe('expectReply', function () {
      it('should assert - success', function (done) {
        const app = createApp()
        coworkersTest(app)
          .send('reply-queue', {})
          .expectReply('content', {})
          .expect(done)
      })

      it('should assert - error', function (done) {
        const app = createApp()
        coworkersTest(app)
          .send('reply-queue', {})
          .expectReply('ERRORCONTENT', {})
          .expectReply('ERRORCONTENT', {})
          .expect(function (err) {
            expect(err).to.exist()
            expect(err.message).to.match(/ERRORCONTENT/)
            done()
          })
      })
    })

    describe('stubContext', function () {
      it('should allow stubbing context', function (done) {
        const app = createApp()
        coworkersTest(app)
          .send('reply-queue', {})
          .stubContext(function (ctx) {
            ctx.request.resolves({ foo: 1 })
            done()
          })
          .expectReply('content', {})
          .expect(function () {
            // noop
          })
      })
    })

    describe('expectCheckQueue', function () {
      it('should assert - success', function (done) {
        const app = createApp()
        coworkersTest(app)
          .send('check-queue', {})
          .expectCheckQueue('queue-name')
          .expect(done)
      })

      it('should assert - error', function (done) {
        const app = createApp()
        coworkersTest(app)
          .send('check-queue', {})
          .expectCheckQueue('ERRORQUEUE')
          .expectCheckQueue('ERRORQUEUE')
          .expect(function (err) {
            expect(err).to.exist()
            expect(err.message).to.match(/ERRORQUEUE/)
            done()
          })
      })
    })

    describe('expectCheckReplyQueue', function () {
      it('should assert - success', function (done) {
        const app = createApp()
        coworkersTest(app)
          .send('check-reply-queue', {})
          .expectCheckReplyQueue()
          .expect(done)
      })

      it('should assert - error', function (done) {
        const app = createApp()
        coworkersTest(app)
          .send('check-reply-queue', {})
          .expectCheckReplyQueue('ERRORQUEUE')
          .expectCheckReplyQueue('ERRORQUEUE')
          .expect(function (err) {
            expect(err).to.exist()
            expect(err.message).to.match(/ERRORQUEUE/)
            done()
          })
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
