const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/async-handler');
const { authenticateUser } = require('../middleware/basic-auth');
const { User, Course } = require('../models');

// USERS ROUTES
// GET route that will return the currently authenticated user
// along with a 200 HTTP status code.
router.get(
  '/users',
  authenticateUser,
  asyncHandler(async (req, res, next) => {
    try {
      const users = await User.findAll({
        attributes: { exclude: ['password', 'createdAt', 'updatedAt'] },
      });
      res.json({ users });
    } catch (error) {
      throw error;
    }
  })
);

// POST route that will create a new user, set the Location header to "/",
// and return a 201 HTTP status code and no content.
router.post(
  '/users',
  asyncHandler(async (req, res, next) => {
    try {
      await User.create(req.body);
      res.status(201).json({ message: 'User Created successfully' });
    } catch (error) {
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
      const courses = await Course.findAll({
        attributes: { exclude: ['userId', 'createdAt', 'updatedAt'] },
      });
      res.json(courses);
    } catch (error) {}
  })
);

// route to get specific Courses
router.get(
  '/courses/:id',
  asyncHandler(async (req, res) => {
    try {
      const course = await Course.findByPk(req.params.id, {
        attributes: { exclude: ['createdAt', 'updatedAt', 'userId'] },
        include: [
          {
            model: User,
            as: 'user',
            attributes: { exclude: ['password', 'createdAt', 'updatedAt'] },
          },
        ],
      });
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
  authenticateUser,
  asyncHandler(async (req, res) => {
    console.log(req.body);
    try {
      const course = await Course.create(req.body);
      res.location(`/courses/${course.id}`);
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
  authenticateUser,
  asyncHandler(async (req, res) => {
    // console.log(req.loggedUser.id);
    try {
      const course = await Course.findByPk(req.params.id);
      if (course) {
        //if the logged user is the owner of the course
        if (req.loggedUser.id === course.userId) {
          await course.update(req.body);
          res.status(204).end();
        } else {
          res.status(403).json({
            message: 'Unauthorized, This item does not belong to you',
          });
        }
      } else {
        throw new Error(
          'The course you are trying to update doesnt exist anymore'
        );
      }
    } catch (error) {
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

// Route to delete specific Course
router.delete(
  '/courses/:id',
  authenticateUser,
  asyncHandler(async (req, res) => {
    try {
      const course = await Course.findByPk(req.params.id);
      if (course) {
        if (req.loggedUser.id === course.userId) {
          await course.destroy();
          res.status(204).end();
        } else {
          res.status(403).json({
            message: 'Unauthorized, This item does not belong to you',
          });
        }
      } else {
        throw new Error(
          'The course you are trying to delete doesnt exist anymore'
        );
      }
    } catch (error) {
      throw error;
    }
  })
);

module.exports = router;
