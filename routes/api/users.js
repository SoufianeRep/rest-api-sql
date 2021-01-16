const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../../middleware/async-handler');
const { authenticateUser } = require('../../middleware/basic-auth');
const { User, Course } = require('../../models');

// USERS ROUTES
// GET route that will return the currently authenticated user
// along with a 200 HTTP status code.
router.get(
  '/users',
  authenticateUser,
  asyncHandler(async (req, res, next) => {
    const user = req.loggedUser;
    const users = await User.findAll();
    console.log(`welcome ${user.firstName}, Here is your profile`);
    res.json({ users });
  })
);

// POST route that will create a new user, set the Location header to "/",
// and return a 201 HTTP status code and no content.
router.post(
  '/users',
  asyncHandler(async (req, res, next) => {
    console.log(req.body);
    try {
      await User.create(req.body);
      res.status(201).json({ message: 'User Created successfully' });
    } catch (error) {
      console.log(error.name);
      if (
        error.name === 'SequelizeValidationError' ||
        error.name === 'SequelizeUniqueConstraintError'
      ) {
        const errors = error.errors.map((x) => x.message);
        res.status(400).json({ errors });
      } else {
        throw error;
      }
    }
  })
);
//===================================
//COURSES ROUTE//
//===================================

// Route to get all the courses
router.get(
  '/courses',
  asyncHandler(async (req, res) => {
    try {
      const courses = await Course.findAll();
      res.json(courses);
    } catch (error) {}
  })
);

// route to get specific Courses
router.get(
  '/courses/:id',
  asyncHandler(async (req, res) => {
    try {
      const course = await Course.findByPk(req.params.id);
      if (course) {
        res.json(course);
      } else {
        throw new Error('The Course you are looking for cannot be found');
      }
    } catch (error) {
      console.log(error.name);
      res.status(404).json({ message: error.message });
    }
  })
);

// Route to ass a course to the database
router.post(
  '/courses',
  asyncHandler(async (req, res) => {
    console.log(req.body);
    try {
      await Course.create(req.body);
      res.status(201).json({ message: 'Course created successfully' });
    } catch (error) {
      console.log(error.name);
      if (error.name === 'SequelizeValidationError') {
        const errors = error.errors.map((x) => x.message);
        res.status(400).json({ errors });
      } else {
        throw error;
      }
    }
  })
);

// Route to update Specific Course
router.put(
  '/courses/:id',
  asyncHandler(async (req, res) => {})
);

// Route to delete specific Course
router.delete(
  '/courses/:id',
  asyncHandler(async (req, res) => {})
);

module.exports = router;

// {
//     "title": "React Native Basic",
//     "description": "React Native combines the best parts of native development with React, a best-in-class JavaScript library for building user interfaces.",
//     "estimatedTime": "6h",
//     "materialsNeeded": "HTML, CSS, JS"
// }

// {
//     "firstName": "Youness",
//     "lastName": "ezzine",
//     "emailAddress": "youness@soundstamp.ma",
//     "password": "azerty.123",
//     "confirmedPassword": "azerty.123"
// }
