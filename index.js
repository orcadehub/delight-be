const express = require("express");
const cors = require("cors");
const app = express();
const dotenv = require("dotenv");
dotenv.config();


const PORT = 3300;

const allowedOrigins = [
  "http://localhost:5173", // ✅ Allow local development
];

// app.use(
//   cors({
//     origin: function (origin, callback) {
//       if (!origin || allowedOrigins.includes(origin)) {
//         callback(null, true);
//       } else {
//         callback(new Error("Not allowed by CORS"));
//       }
//     },
//     credentials: true, // ✅ Allow credentials (cookies, tokens)
//     optionsSuccessStatus: 200,
//   })
// );

app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const mongoose = require("mongoose");
mongoose.set("strictQuery", true);

mongoose.connect(
  "mongodb+srv://orcadehub2:orcadehub2@orcadehub.twfptkz.mongodb.net/90sdelight?retryWrites=true&w=majority&appName=OrcadeHub",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const db = mongoose.connection;
db.on("connected", () => console.log("Successfully connected to MongoDB"));
db.on("error", (error) => console.error("MongoDB connection error:", error));

// require("./models/internship_model");
require("./models/user_model");
require("./models/cart_model");
require("./models/product_model");
// require("./models/certificate_model");
// require("./models/fake_model");
// app.use(require("./routes/internship_route"));
app.use(require("./routes/user_route"));
app.use(require("./routes/product_route"));
app.use(require("./routes/cart_route"));

app.get("/", (req, res) => {
  res.json("It Works");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});