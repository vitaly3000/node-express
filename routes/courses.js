const { Router } = require('express');
const { validationResult } = require('express-validator');

const { courseValidators } = require('../utils/validators');
const Course = require('../models/course');
const auth = require('../middleware/auth');
const router = Router();
function isOwner(course, req) {
  return course.userId.toString() === req.user._id.toString();
}
router.get('/', async (req, res) => {
  try {
    await Course.find()
      .populate('userId', 'email name')
      .select('price title img')
      .then((courses) => {
        res.render('courses', {
          title: 'Курсы',
          isCourses: true,
          userId: req.user ? req.user._id.toString() : null,
          courses: courses.map((course) => course.toJSON()),
        });
      });
  } catch (error) {
    console.log(error);
  }
});

router.get('/:id', async (req, res) => {
  try {
    await Course.findById(req.params.id).then((course) => {
      res.render('course', {
        layout: 'empty',
        title: `Курс ${course.title} `,
        course: course.toJSON(),
      });
    });
  } catch (error) {
    console.log(error);
  }
});
router.get('/:id/edit', auth, async (req, res) => {
  if (!req.query.allow) {
    return res.redirect('/');
  }
  try {
    await Course.findById(req.params.id).then((course) => {
      if (!isOwner(course, req)) {
        return res.redirect('/courses');
      }
      res.render('course-edit', {
        title: `Редактировать ${course.title}`,
        course: course.toJSON(),
      });
    });
  } catch (error) {
    console.log(error);
  }
});
router.post('/edit', auth, courseValidators, async (req, res) => {
  const errors = validationResult(req);
  const { id } = req.body;
  if (!errors.isEmpty()) {
    return res.status(422).redirect(`/courses/${id}/edit?allow=true`);
  }

  delete req.body.id;
  const course = await Course.findById(id);
  try {
    if (!isOwner(course, req)) {
      return res.redirect('/courses');
    }
    Object.assign(course, req.body);
    await course.save();

    res.redirect('/courses');
  } catch (error) {
    console.log(error);
  }
});
router.post('/remove', auth, async (req, res) => {
  try {
    await Course.deleteOne({
      _id: req.body.id,
      userId: req.user._id,
    });
    res.redirect('/courses');
  } catch (error) {
    console.log(error);
  }
});
module.exports = router;
