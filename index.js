const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { validate } = require('jsonschema');
const app = express();

app.use(bodyParser.json());

const usersFilePath = path.join(__dirname, 'users.json');

// Read user data from the JSON file
let users = [];
try {
  const usersData = fs.readFileSync(usersFilePath, 'utf8');
  users = JSON.parse(usersData);
} catch (error) {
  console.error('Error reading users file:', error.message);
}

// Function to write user data to the JSON file
function writeUsersToFile() {
  try {
    const usersData = JSON.stringify(users, null, 2);
    fs.writeFileSync(usersFilePath, usersData, 'utf8');
  } catch (error) {
    console.error('Error writing users file:', error.message);
  }
}

// Function to generate a unique ID for a new user
function generateUniqueId() {
  return users.length > 0 ? Math.max(...users.map(user => user.id)) + 1 : 1;
}

function isValidJson(data) {
  return typeof data === 'object';
}

// JSON schema for user data validation
const userSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 1 },
    age: { type: 'integer', minimum: 0 },
    email: { type: 'string', format: 'email' },
    dateOfBirth: { type: 'string', pattern: '^(0[1-9]|[12][0-9]|3[01])[./](0[1-9]|1[0-2])[./]\\d{4}$' }
  },
  required: ['name']
};

// GET endpoint to retrieve all users
app.get('/users', (req, res) => {
  try {
    const usersData = fs.readFileSync(usersFilePath, 'utf8');
    const users = JSON.parse(usersData);
    res.status(200).json(users);
  } catch (error) {
    console.error('Error reading users file:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// GET endpoint to retrieve user details by ID
app.get('/users/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const user = users.find(u => u.id === userId);

  if (user) {
    res.status(200).json(user);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// POST endpoint to add a new user
app.post('/users', (req, res) => {
  const userData = req.body;

  // Check if request body is valid JSON
  if (!isValidJson(userData)) {
    return res.status(400).json({ message: 'Invalid JSON in request body' });
  }

  // Validate user data against the schema
  const validationResult = validate(userData, userSchema);
  if (!validationResult.valid) {
    const errors = validationResult.errors.map(error => error.stack);
    return res.status(400).json({ message: 'Validation error', errors });
  }

  const newUser = {
    id: generateUniqueId(),
    ...userData
  };

  users.push(newUser);
  writeUsersToFile(); // Update the users file
  res.status(200).json(newUser);
});

// PUT endpoint to edit user by ID
app.put('/users/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const updatedUser = req.body;
  const userData = req.body;

  const index = users.findIndex(u => u.id === userId);


  // Check if request body is valid JSON
  if (!isValidJson(userData)) {
    return res.status(400).json({ message: 'Invalid JSON in request body' });
  }

  if (index !== -1 && updatedUser && updatedUser.name && updatedUser.age) {
    // Validate user data against the schema
    const validationResult = validate(updatedUser, userSchema);
    if (!validationResult.valid) {
      const errors = validationResult.errors.map(error => error.stack);
      return res.status(400).json({ message: 'Validation error', errors });
    }

    users[index] = { ...users[index], ...updatedUser };
    writeUsersToFile(); // Update the users file
    res.status(200).json(users[index]);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// PATCH endpoint to update name and/or age for an existing user
app.patch('/users/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const updatedFields = req.body;
  const userData = req.body;

  const index = users.findIndex(u => u.id === userId);

  // Check if request body is valid JSON
  if (!isValidJson(userData)) {
    return res.status(400).json({ message: 'Invalid JSON in request body' });
  }

  if (index !== -1 && updatedFields) {
    // Validate user data against the schema
    const validationResult = validate(updatedFields, userSchema);
    if (!validationResult.valid) {
      const errors = validationResult.errors.map(error => error.stack);
      return res.status(400).json({ message: 'Validation error', errors });
    }

    users[index] = { ...users[index], ...updatedFields };
    writeUsersToFile(); // Update the users file
    res.status(200).json(users[index]);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// DELETE endpoint to delete user by ID
app.delete('/users/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const index = users.findIndex(u => u.id === userId);

  if (index !== -1) {
    const deletedUser = users.splice(index, 1);
    writeUsersToFile(); // Update the users file
    res.status(200).json(deletedUser[0]);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

const port = 3000;

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
