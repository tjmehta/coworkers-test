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
