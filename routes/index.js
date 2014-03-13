var mongoose = require('mongoose');
var db = mongoose.createConnection('localhost', 'pollsapp');
var PollSchema = require('../models/Poll.js').PollSchema;
var Poll = db.model('polls', PollSchema);

exports.index = function(req, res) {
  res.render('index', {title: 'Polls'});
};

// JSON API for list of polls
exports.list = function(req, res) {
  Poll.find({}, 'question', function(error, polls){
    res.json(polls);
  });
};

// JSON API for getting a single poll
exports.poll = function(req, res) {
  var pollId = req.params.id;
  Poll.findByID(pollId, '', {lean:true}, function(err, poll){
    if (poll){
      var userVoted = false,
        userChoice,
        totalVotes = 0;
      for(c in poll.choices){
        var choice = poll.choices[c];
        for(v in choice.votes){
          var vote = choice.votes[v];
          totalVotes++;
          if(vote.ip === (req.header('x-forwarded-for') || req.ip)){
            userVoted = true;
            userChoice = {_id: choice._id, text: choice.text};
          }
        }
      }
      poll.userVoted = userVoted;
      poll.userChoice = userChoice;
      poll.totalVotes = totalVotes;
      res.json(poll);
    }
    else {
      res.json({error:true});
    }
  });
};

// JSON API for creating a new poll
exports.create = function(req, res) {
  var reqBody = req.body,
    choces = reqBody.choices.filter(function(v){return v.text != '';}),
    pollObj = {question: reqBody.questions, choices: choices};
  var poll = newPoll(pollObj);
  poll.save(function(err, doc){
    if(err || !doc){
      throw 'Error';
    }
    else {
      res.json(doc);
    }
  });
};