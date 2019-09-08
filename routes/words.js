const express = require('express');
const router = express.Router();
const { authorizeUser } = require('../helpers');
const Word = require('../models/Word');
const User = require('../models/User');

// Create word
router.post('/', authorizeUser, (req, res) => {
  // Find the current user's document so we can push to their words array
  User.findOne({ _id: req.current_user.id })
    .then(user => {
      // return an error if there is no user found
      if(!user) return res.status(404).json({ user: 'No user found.' });

      // Now that we have the user, create a new Word document
      return new Word(req.body)
        .save()
        .then(word => {
          // Add the new word document to the user's words array
          user.words.push(word.id);

          // resave the user to store the word within the user's words array
          return user.save()
            .then(user => res.json(word)) // return the new word for now, possibly respond with the user's updated word collection
        })
    })
    .catch(error => res.status(400).json(error));
});

// Read word - not sure what to do here
  // Option 1: return one word according to a an ID
  // Option 2: return all words in pagination form (feed)
  // Option 3: return defintiions for all words with the sane term

// Update word
router.put('/:id', authorizeUser, (req, res) => {
  // Only allow to the user to edit the word if they defined the word
  // Find the current user's document so we can check if the word belongs to the user
  User.findOne({ _id: req.current_user.id })
    .then(user => {
      if(!user) return res.status(404).json({ user: 'No user found.'});

      // Check to see if the user's word array includes a subdoc with the word id provided
      // Boot them out if they do not own the word
      const id = req.params.id;
      if(!user.words.includes(id)) return res.status(403).json({ Forbidden: 'You do not have access to update this word.' });

      // If the word belongs to the user, Update the word document
      Word.updateOne(
        { _id: id },
        { '$set': req.body, '$inc': { __v: 1 } },
        { runValidators: true, context: 'query' }
      )
        .then(confirmation => res.json(confirmation))
        .catch(error => res.status(400).json(error));
    })
});

// Delete word
router.delete('/:id', authorizeUser, (req, res) => {
  // Only allow to the user to delete the word if they defined the word
  // Find the current user's document so we can check if the word belongs to the user
  User.findOne({ _id: req.current_user.id })
    .then(user => {
      if(!user) return res.status(404).json({ user: 'No user found.'});

      // Check to see if the user's word array includes a subdoc with the word id provided
      // Boot them out if they do not own the word
      const id = req.params.id;
      if(!user.words.includes(id)) return res.status(403).json({ Forbidden: 'You do not have access to delete this word.' });

      // If the word belongs to the user, Delete the word document
      Word.deleteOne({ _id: id })
        .then(deletedWord => res.json(deletedWord))
        .catch(error => res.status(400).json(error));
    })
});

module.exports = router;
