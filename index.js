const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());

// Mock data for users
let users = [
  { id: 1, name: 'User1', age: 25 },
  { id: 2, name: 'User2', age: 30 },
];

// Function to generate a unique ID for a new user
function generateUniqueId() {
    return users.length > 0 ? Math.max(...users.map(user => user.id)) + 1 : 1;
  }

// GET endpoint to retrieve all users
app.get('/users', (req, res) => {
  res.status(200).json(users);
});

// GET endpoint to retrieve user details by ID
app.get('/users/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const user = users.find(u => u.id === userId);

  if (user) {
    res.status(200).json(user);
  } else {
    res.status(400).json({ message: 'User not found' });
  }
});

// POST endpoint to add a new user
app.post('/users', (req, res) => {
    const { name, age } = req.body;
  
    if (!name) {
      res.status(400).json({ message: 'Name is required' });
      return;
    }
  
    const newUser = {
      id: generateUniqueId(),
      name,
      age: age || null,
    };
  
    users.push(newUser);
    res.status(200).json(newUser);
  });

// PUT endpoint to edit user by ID
app.put('/users/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const updatedUser = req.body;

  const index = users.findIndex(u => u.id === userId);

  if (index !== -1 && updatedUser && updatedUser.name && updatedUser.age) {
    users[index] = { ...users[index], ...updatedUser };
    res.status(200).json(users[index]);
  } else {
    res.status(400).json({ message: 'Invalid user data or user not found' });
  }
});


// PATCH endpoint to update name and/or age for an existing user
app.patch('/users/:id', (req, res) => {
    const userId = parseInt(req.params.id);
    const updatedFields = req.body;
  
    const index = users.findIndex(u => u.id === userId);
  
    if (index !== -1 && updatedFields) {
      users[index] = { ...users[index], ...updatedFields };
      res.status(200).json(users[index]);
    } else {
      res.status(400).json({ message: 'Invalid user data or user not found' });
    }
  });

  
// DELETE endpoint to delete user by ID
app.delete('/users/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const index = users.findIndex(u => u.id === userId);

  if (index !== -1) {
    const deletedUser = users.splice(index, 1);
    res.status(200).json(deletedUser[0]);
  } else {
    res.status(400).json({ message: 'User not found' });
  }
});

const port = 3000;

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});