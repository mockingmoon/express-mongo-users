Complete basic setup for user

Server made using Express.js, Node.js, MongoDB

Run by typing the following in shell/bash/cmd-
npm start

Features:

- User model: firstName, lastName, email, admin. Implements passport-local-mongoose plugin for user
- Authentication: Uses passport, passport-jwt, passport-local, jsonwebtoken for signup, login
- Admin/normal user: Authentication has middleware for checking user/admin
- JWT Blacklisting: To prevent logged out users with valid json web token from accessing their data, there is a blacklist database which stores such valid (but logged out) tokens
- Cors: Cors middleware to ensure that source is only the white-listed one not any random
- User operations: Apart from login, signup, logout- there is updateProfile to update name, deleteAccount to delete user from database and log them out

[Note: This was not scaffolded using express-generator]

Additional feature:

- Clean exit: Press Ctrl+C in the shell/bash/cmd to exit server. Wait for the message: "Server successful shutdown". It may take some time as server finishes any pending tasks