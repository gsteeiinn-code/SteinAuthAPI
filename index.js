require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const invitesRoute = require('./routes/invites');
const usersRoute = require('./routes/users');
const adminsRoute = require('./routes/admins');
const banRoute = require('./routes/ban');

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

app.use('/invites', invitesRoute);
app.use('/users', usersRoute);
app.use('/admins', adminsRoute);
app.use('/ban', banRoute);

app.get('/', (req, res) => res.json({ ok: true, message: 'Stein Auth API' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
