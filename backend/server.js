 const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const uri = "mongodb://127.0.0.1:27017";
const client = new MongoClient(uri);

let studentsCollection;


// ===============================
// CONNECT TO MONGODB
// ===============================

async function connectDB() {
    try {
        await client.connect();

        const database = client.db("2529");
        studentsCollection = database.collection("students");

        console.log("Connected to MongoDB!");

        // Make studentId unique
        await studentsCollection.createIndex(
            { studentId: 1 },
            { unique: true }
        );

        console.log("Student ID unique index ready!");

    } catch (error) {
        console.error("MongoDB connection error:", error);
    }
}

connectDB();


// ===============================
// HOME
// ===============================

app.get("/", (req, res) => {
    res.send("Student Management Backend is running!");
});


// ===============================
// GET ALL STUDENTS
// ===============================

app.get("/students", async (req, res) => {
    try {

        const students = await studentsCollection
            .find({})
            .toArray();

        res.json(students);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Failed to fetch students"
        });
    }
});


// ===============================
// ADD STUDENT
// ===============================

app.post("/students", async (req, res) => {

    try {

        const {
            studentId,
            name,
            age,
            course
        } = req.body;


        // STUDENT ID VALIDATION
        if (
            typeof studentId !== "string" ||
            studentId.trim() === ""
        ) {

            return res.status(400).json({
                error: "Student ID is required"
            });

        }


        // NAME VALIDATION
        if (
            typeof name !== "string" ||
            !/^[A-Za-z ]+$/.test(name.trim())
        ) {

            return res.status(400).json({
                error: "Name should contain only characters"
            });

        }


        // COURSE VALIDATION
         const validCourses = ["CSE", "ECE", "CIVIL"];

        if (
            typeof course !== "string" ||
            !validCourses.includes(course.trim().toUpperCase())
        ) {
            return res.status(400).json({
               error: "Course must be CSE, ECE or CIVIL"
            });
        }


        // AGE VALIDATION
        const studentAge = Number(age);

        if (
            !Number.isInteger(studentAge) ||
            studentAge < 1 ||
            studentAge >= 25
        ) {

            return res.status(400).json({
                error: "Age must be between 1 and 24"
            });

        }


        // CHECK DUPLICATE STUDENT ID

        const existingStudent =
            await studentsCollection.findOne({
                studentId: studentId.trim()
            });


        if (existingStudent) {

            return res.status(400).json({
                error: "Student ID already exists"
            });

        }


        // CREATE STUDENT OBJECT

        const student = {

            studentId: studentId.trim(),

            name: name.trim(),

            age: studentAge,

            course: course.trim()
        };


        // INSERT INTO MONGODB

        const result =
            await studentsCollection.insertOne(student);


        res.status(201).json({

            message: "Student added successfully",

            student: {

                _id: result.insertedId,

                ...student
            }
        });


    } catch (error) {

        console.error(error);


        // DUPLICATE KEY ERROR

        if (error.code === 11000) {

            return res.status(400).json({
                error: "Student ID already exists"
            });

        }


        res.status(500).json({
            error: "Failed to add student"
        });

    }

});


// ===============================
// UPDATE STUDENT
// ===============================

app.put("/students/:id", async (req, res) => {

    try {

        const id = req.params.id;

        const {
            studentId,
            name,
            age,
            course
        } = req.body;


        // STUDENT ID VALIDATION

        if (
            typeof studentId !== "string" ||
            studentId.trim() === ""
        ) {

            return res.status(400).json({
                error: "Student ID is required"
            });

        }


        // NAME VALIDATION

        if (
            typeof name !== "string" ||
            !/^[A-Za-z ]+$/.test(name.trim())
        ) {

            return res.status(400).json({
                error: "Name should contain only characters"
            });

        }


        // COURSE VALIDATION

        if (
            typeof course !== "string" ||
            !/^[A-Za-z ]+$/.test(course.trim())
        ) {

            return res.status(400).json({
                error: "Course should contain only characters"
            });

        }


        // AGE VALIDATION

        const studentAge = Number(age);

        if (
            !Number.isInteger(studentAge) ||
            studentAge < 1 ||
            studentAge >= 25
        ) {

            return res.status(400).json({
                error: "Age must be between 1 and 24"
            });

        }


        // CHECK WHETHER ANOTHER STUDENT
        // ALREADY HAS THIS STUDENT ID

        const duplicateStudent =
            await studentsCollection.findOne({

                studentId: studentId.trim(),

                _id: {
                    $ne: new ObjectId(id)
                }

            });


        if (duplicateStudent) {

            return res.status(400).json({
                error: "Student ID already exists"
            });

        }


        // UPDATED DATA

        const updatedStudent = {

            studentId: studentId.trim(),

            name: name.trim(),

            age: studentAge,

            course: course.trim()

        };


        // UPDATE MONGODB

        const result =
            await studentsCollection.updateOne(

                {
                    _id: new ObjectId(id)
                },

                {
                    $set: updatedStudent
                }

            );


        if (result.matchedCount === 0) {

            return res.status(404).json({
                error: "Student not found"
            });

        }


        res.json({

            message: "Student updated successfully",

            student: {

                _id: id,

                ...updatedStudent
            }

        });


    } catch (error) {

        console.error(error);


        if (error.code === 11000) {

            return res.status(400).json({
                error: "Student ID already exists"
            });

        }


        res.status(500).json({
            error: "Failed to update student"
        });

    }

});


// ===============================
// DELETE STUDENT
// ===============================

app.delete("/students/:id", async (req, res) => {

    try {

        const id = req.params.id;


        const result =
            await studentsCollection.deleteOne({

                _id: new ObjectId(id)

            });


        if (result.deletedCount === 0) {

            return res.status(404).json({
                error: "Student not found"
            });

        }


        res.json({

            message: "Student deleted successfully"

        });


    } catch (error) {

        console.error(error);

        res.status(500).json({

            error: "Failed to delete student"

        });

    }

});


// ===============================
// START SERVER
// ===============================

app.listen(PORT, () => {

    console.log(
        `Server running on http://localhost:${PORT}`
    );

});