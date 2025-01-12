const sinon = require('sinon')
const { expect } = require('chai')
const SandboxedModule = require('sandboxed-module')
const modulePath = require('path').join(
  __dirname,
  '/../../../../app/src/Features/Spelling/LearnedWordsManager'
)

describe('LearnedWordsManager', function () {
  beforeEach(function () {
    this.token = 'a6b3cd919ge'
    this.callback = sinon.stub()
    this.db = {
      spellingPreferences: {
        updateOne: sinon.stub().yields(),
      },
    }
    this.LearnedWordsManager = SandboxedModule.require(modulePath, {
      requires: {
        '../../infrastructure/mongodb': { db: this.db },
        '@overleaf/metrics': {
          timeAsyncMethod: sinon.stub(),
          inc: sinon.stub(),
        },
      },
    })
  })

  describe('learnWord', function () {
    beforeEach(function () {
      this.word = 'instanton'
      this.LearnedWordsManager.learnWord(this.token, this.word, this.callback)
    })

    it('should insert the word in the word list in the database', function () {
      expect(
        this.db.spellingPreferences.updateOne.calledWith(
          {
            token: this.token,
          },
          {
            $addToSet: { learnedWords: this.word },
          },
          {
            upsert: true,
          }
        )
      ).to.equal(true)
    })

    it('should call the callback', function () {
      expect(this.callback.called).to.equal(true)
    })
  })

  describe('unlearnWord', function () {
    beforeEach(function () {
      this.word = 'instanton'
      this.LearnedWordsManager.unlearnWord(this.token, this.word, this.callback)
    })

    it('should remove the word from the word list in the database', function () {
      expect(
        this.db.spellingPreferences.updateOne.calledWith(
          {
            token: this.token,
          },
          {
            $pull: { learnedWords: this.word },
          }
        )
      ).to.equal(true)
    })

    it('should call the callback', function () {
      expect(this.callback.called).to.equal(true)
    })
  })

  describe('getLearnedWords', function () {
    beforeEach(function () {
      this.wordList = ['apples', 'bananas', 'pears']
      this.wordListWithDuplicates = this.wordList.slice()
      this.wordListWithDuplicates.push('bananas')
      this.db.spellingPreferences.findOne = (conditions, callback) => {
        callback(null, { learnedWords: this.wordListWithDuplicates })
      }
      sinon.spy(this.db.spellingPreferences, 'findOne')
      this.LearnedWordsManager.getLearnedWords(this.token, this.callback)
    })

    it('should get the word list for the given user', function () {
      expect(
        this.db.spellingPreferences.findOne.calledWith({ token: this.token })
      ).to.equal(true)
    })

    it('should return the word list in the callback without duplicates', function () {
      expect(this.callback.calledWith(null, this.wordList)).to.equal(true)
    })
  })

  describe('deleteUsersLearnedWords', function () {
    beforeEach(function () {
      this.db.spellingPreferences.deleteOne = sinon.stub().callsArgWith(1)
    })

    it('should get the word list for the given user', function (done) {
      this.LearnedWordsManager.deleteUsersLearnedWords(this.token, () => {
        this.db.spellingPreferences.deleteOne
          .calledWith({ token: this.token })
          .should.equal(true)
        done()
      })
    })
  })
})
