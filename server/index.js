const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const User = require("./models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs')

app.get("/hello", (req, res) => {
    res.send("hello from simple server :)");
});

app.use(cors());
app.use(express.json());

// link db Connection :
//cloud.mongodb.com/v2/642cdef7f36010450599202e#/metrics/replicaSet/642cdf6878fde479c8a721ad/explorer/test/user-data/find

https: mongoose
    .connect(
        "mongodb+srv://admin:admin123@project-2-devops.mp3zvtz.mongodb.net/?retryWrites=true&w=majority"
    )
    .then(() => {
        console.log("Connected to database !!");
    })
    .catch((err) => {
        console.log("Connection failed !!" + err.message);
        console.log(err.message);
    });

app.post("/api/register", async (req, res) => {
    console.log(req.body);

    try {
        const newPassword = await bcrypt.hash(req.body.password, 5);
        await User.create({
            name: req.body.name,
            email: req.body.email,
            oroginalpassword: req.body.password,
            password: newPassword,
        });
        res.json({ status: "ok" });
    } catch (err) {
        console.log(err);
        res.json({ status: "error", error: "Duplicate email" });
    }
});

app.post("/api/login", async (req, res) => {
    const user = await User.findOne({
        email: req.body.email,
    });

    if (!user) {
        return { status: "error", error: "Invalid login" };
    }

    const isPasswordValid = await bcrypt.compare(
        req.body.password,
        user.password
    );

    if (isPasswordValid) {
        const token = jwt.sign(
            {
                name: user.name,
                email: user.email,
            },
            "secret123"
        );
        return res.json({ status: "ok", user: token });
    } else {
        return res.json({ status: "error", user: false });
    }
});

app.get("/api/quote", async (req, res) => {
    const token = req.headers["x-access-token"];

    try {
        const decoded = jwt.verify(token, "secret123");
        const email = decoded.email;
        const user = await User.findOne({ email: email });

        return res.json({ status: "ok", quote: user.quote });
    } catch (error) {
        console.log(error);
        res.json({ status: "error", error: "invalid token" });
    }
});

app.post("/api/quote", async (req, res) => {
    const token = req.headers["x-access-token"];

    try {
        const decoded = jwt.verify(token, "secret123");
        const email = decoded.email;
        await User.updateOne({ email: email }, { $set: { quote: req.body.quote } });

        return res.json({ status: "ok" });
    } catch (error) {
        console.log(error);
        res.json({ status: "error", error: "invalid token" });
    }
});

app.listen(1337, () => {
    console.log("Server started on 1337");
});
