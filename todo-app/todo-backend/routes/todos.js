const express = require('express');
const { Todo } = require('../mongo');
const { setAsync, getAsync } = require('../redis');
const { set } = require('mongoose');
const router = express.Router();

// Updates the value for key 'added_todos' in redis and initializes the value if none existed prior.
const updateTodoCounter = async () => {
  let currAddedTodos = await getAsync('added_todos');
  if (!currAddedTodos) {
    currAddedTodos = 0;
  }

  await setAsync('added_todos', Number(currAddedTodos)+1);
}

/* GET todos listing. */
router.get('/', async (_, res) => {
  const todos = await Todo.find({});
  res.send(todos);
});

/* POST todo to listing. */
router.post('/', async (req, res) => {
  const todo = await Todo.create({
    text: req.body.text,
    done: false
  });
  
  updateTodoCounter();

  res.send(todo);
});

const singleRouter = express.Router({mergeParams: true});

const findByIdMiddleware = async (req, res, next) => {
  const { id } = req.params;
  req.todo = await Todo.findById(id);
  if (!req.todo) return res.sendStatus(404);

  next()
}

/* DELETE todo. */
singleRouter.delete('/', async (req, res) => {
  await req.todo.delete();
  res.sendStatus(200);
});

/* GET todo. */
singleRouter.get('/', async (req, res) => {
  const todo = req.todo;
  res.send(todo);
});

/* PUT todo. */
singleRouter.put('/', async (req, res) => {
  const currTodo = req.todo;
  const newTodo = {
    text: currTodo.text,
    done: true,
  }
  console.log(newTodo);
  const updatedTodo = await Todo.findByIdAndUpdate(
    req.params.id,
    newTodo,
    {
      new: true,
      useFindAndModify: false,
    }
  );
  console.log(updatedTodo);
  res.send(updatedTodo);
  
});

router.use('/:id', findByIdMiddleware, singleRouter);


module.exports = router;
