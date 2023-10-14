const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
// bring routes
const blogRoutes = require('./routes/blog');
const categoryRoutes = require('./routes/category');
const tagRoutes = require('./routes/tag');
// app
const app = express();
app.use(cors());
// db
mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Database Connected");
  });
// middlewares
app.use(morgan('dev'));
app.use(bodyParser.json());
// cors

if (process.env.NODE_ENV === 'development') {
    // app.use(cors({ origin: `${process.env.CLIENT_URL}` }));
}

// routes middleware
app.use('/api', blogRoutes);
app.use('/api', categoryRoutes);
app.use('/api', tagRoutes);

// port
const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});