const express = require('express');
const Note = require('../models/note');
const withAuth = require('../middlewares/auth');

const router = express.Router();

function isAuthor(user, note) {
  return JSON.stringify(user._id) === JSON.stringify(note.author._id) ? true : false;
}

router.get('/', withAuth, async (req, res) => {
  Note.find({ author: req.user._id})
    .then(notes => res.json({ notes: notes, message: 'OK' }).status(200))
    .catch(err => res.json({ error: err, message: 'Error loading user\'s notes.' }).status(500));
});

router.post('/', withAuth, async (req, res) => {
  const { title, body } = req.body;
  const note = new Note({ title: title, body: body, author: req.user._id });
  note.save()
    .then(() => res.json({ note: note, message: 'OK' }).status(200))
    .catch(err => res.json({ error: err, message: 'Error creating a new note.' }.status(500)));
});

router.get('/search', withAuth, async (req, res) => {
  const { query } = req.query;
  Note.find({ author: req.user._id }).find({ $text: { $search: query } })
    .then(notes => res.json({ notes: notes, message: 'OK' }).status(200))
    .catch(err => res.json({ error: err, message: 'Error searching for notes.' }).status(500));
});

router.get('/:id', withAuth, async (req, res) => {
  const { id } = req.params;
  Note.findById(id)
    .then(note => {
      isAuthor(req.user, note)
        ? res.json({ note: note, message: 'OK' }).status(200)
        : res.status(403).json({ error: 'Permission denied' });
    })
    .catch(err => res.json({ error: err, message: 'Error finding the note.' }).status(500));
});

router.put('/:id', withAuth, async (req, res) => {
  const { title, body } = req.body;
  const { id } = req.params;
  Note.findById(id)
    .then(note => {
      if (isAuthor(req.user, note)) {
        note.title = title;
        note.body = body;
        note.save()
          .then(() => res.json({ note: note, message: 'OK' }).status(200))
          .catch(err => res.json({ error: err, message: 'Error updating the note' }).status(500));
      } else
        res.json({ error: 'Permission denied.'}).status(403);
    })
    .catch(err => res.json({ error: err, message: 'Error finding the note.'}).status(500));
});

router.delete('/:id', withAuth, async (req, res) => {
  const { id } = req.params;
  Note.findById(id)
    .then(note => {
      if (isAuthor(req.user, note)) {
        note.delete()
          .then(() => res.json({ message: 'OK' }).status(200))
          .catch(err => res.json({ error: err, message: 'Error deleting the note.' }).status(500));
      } else 
        res.json({ error: 'Permission denied.'}).status(403);
    })
    .catch(err => res.json({ error: err, message: 'Error finding the note.'}).status(500));
});

module.exports = router;