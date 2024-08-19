// routes/commentRoutes.js
/*const express = require('express');
const router = express.Router();
const { getComments, addComment } = require('../controllers/commentController');

router.get('/:postId', getComments);
router.post('/:postId', addComment);

module.exports = router; */

import express from 'express';
import cors from 'cors';
import { getComments, addComment } from '../controllers/commentController.js';

const router = express.Router();

app.use(cors({
    origin: function(origin, callback) {
      if(!origin) return callback(null, true);
      if(allowedOrigins.indexOf(origin) === -1){
        const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
  }));
  

router.get('/:postId', getComments);
router.post('/:postId', addComment);

export default router;