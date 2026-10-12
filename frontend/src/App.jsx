 import { useEffect, useState } from "react";
import "./App.css";

function App() {

  const [students, setStudents] = useState([]);

  const [studentId, setStudentId] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [course, setCourse] = useState("");

  const [editingId, setEditingId] = useState(null);


  // ===============================
  // GET STUDENTS
  // ===============================

  const fetchStudents = () => {

    fetch("http://localhost:3000/students")

      .then((response) => response.json())

      .then((data) => {

        setStudents(data);

      })

      .catch((error) => {

        console.error(
          "Error fetching students:",
          error
        );

      });

  };


  useEffect(() => {

    fetchStudents();

  }, []);


  // ===============================
  // ADD / UPDATE STUDENT
  // ===============================

  const handleSubmit = async (e) => {

    e.preventDefault();


    // STUDENT ID

    if (studentId.trim() === "") {

      alert("Please enter Student ID");

      return;

    }


    // NAME

    if (
      name.trim() === "" ||
      !/^[A-Za-z ]+$/.test(name.trim())
    ) {

      alert(
        "Name should contain only characters"
      );

      return;

    }


    // COURSE

     <select
      value={course}
      onChange={(e) => setCourse(e.target.value)}
     >
      <option value="">Select Course</option>
      <option value="CSE">CSE</option>
      <option value="ECE">ECE</option>
      <option value="CIVIL">CIVIL</option>
     </select>


    // AGE

    const studentAge = Number(age);

    if (
      !Number.isInteger(studentAge) ||
      studentAge < 1 ||
      studentAge >= 25
    ) {

      alert(
        "Age must be between 1 and 24"
      );

      return;

    }


    const studentData = {

      studentId: studentId.trim(),

      name: name.trim(),

      age: studentAge,

      course: course.trim()

    };


    try {

      let response;


      // UPDATE

      if (editingId) {

        response = await fetch(

          `http://localhost:3000/students/${editingId}`,

          {

            method: "PUT",

            headers: {

              "Content-Type":
                "application/json"

            },

            body:
              JSON.stringify(studentData)

          }

        );

      }

      // ADD

      else {

        response = await fetch(

          "http://localhost:3000/students",

          {

            method: "POST",

            headers: {

              "Content-Type":
                "application/json"

            },

            body:
              JSON.stringify(studentData)

          }

        );

      }


      const data =
        await response.json();


      if (response.ok) {

        if (editingId) {

          alert(
            "Student updated successfully!"
          );

        } else {

          alert(
            "Student added successfully!"
          );

        }


        // CLEAR FORM

        setStudentId("");

        setName("");

        setAge("");

        setCourse("");

        setEditingId(null);


        // REFRESH TABLE

        fetchStudents();

      }

      else {

        alert(
          data.error ||
          "Operation failed"
        );

      }


    } catch (error) {

      console.error(
        "Error:",
        error
      );

      alert(
        "Cannot connect to backend"
      );

    }

  };


  // ===============================
  // EDIT STUDENT
  // ===============================

  const editStudent = (student) => {

    setEditingId(student._id);

    setStudentId(student.studentId);

    setName(student.name);

    setAge(student.age);

    setCourse(student.course);

  };


  // ===============================
  // DELETE STUDENT
  // ===============================

  const deleteStudent = async (id) => {

    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this student?"
      );


    if (!confirmDelete) {

      return;

    }


    try {

      const response =
        await fetch(

          `http://localhost:3000/students/${id}`,

          {

            method: "DELETE"

          }

        );


      const data =
        await response.json();


      if (response.ok) {

        alert(
          "Student deleted successfully!"
        );

        fetchStudents();

      }

      else {

        alert(
          data.error ||
          "Failed to delete student"
        );

      }


    } catch (error) {

      console.error(error);

      alert(
        "Cannot connect to backend"
      );

    }

  };


  // ===============================
  // CANCEL UPDATE
  // ===============================

  const cancelEdit = () => {

    setEditingId(null);

    setStudentId("");

    setName("");

    setAge("");

    setCourse("");

  };


  return (

    <div className="container">

      <h1>
        Student Management System
      </h1>


      {/* =========================
          FORM
      ========================== */}

      <div className="form-box">

        <h2>

          {editingId
            ? "Update Student"
            : "Add Student"}

        </h2>


        <form
          onSubmit={handleSubmit}
        >


          {/* STUDENT ID */}

          <input

            type="text"

            placeholder="Enter Student ID"

            value={studentId}

            onChange={(e) => {

              setStudentId(
                e.target.value
              );

            }}

          />


          {/* NAME */}

          <input

            type="text"

            placeholder="Enter Name"

            value={name}

            onChange={(e) => {

              const value =
                e.target.value;


              // ONLY LETTERS AND SPACES

              if (
                /^[A-Za-z ]*$/.test(value)
              ) {

                setName(value);

              }

            }}

          />


          {/* AGE */}

          <input

            type="number"

            placeholder="Enter Age"

            value={age}

            min="1"

            max="24"

            onChange={(e) => {

              const value =
                e.target.value;


              // ONLY NUMBERS

              if (
                /^\d*$/.test(value)
              ) {

                setAge(value);

              }

            }}

          />


          {/* COURSE */}

          <input

            type="text"

            placeholder="Enter Course"

            value={course}

            onChange={(e) => {

              const value =
                e.target.value;


              // ONLY LETTERS AND SPACES

              if (
                /^[A-Za-z ]*$/.test(value)
              ) {

                setCourse(value);

              }

            }}

          />


          {/* SUBMIT BUTTON */}

          <button type="submit">

            {editingId
              ? "Update Student"
              : "Add Student"}

          </button>


          {/* CANCEL BUTTON */}

          {editingId && (

            <button

              type="button"

              onClick={cancelEdit}

            >

              Cancel

            </button>

          )}

        </form>

      </div>


      {/* =========================
          STUDENT TABLE
      ========================== */}

      <div className="table-box">

        <h2>
          Student Records
        </h2>


        {students.length === 0 ? (

          <p>
            No students found.
          </p>

        ) : (

          <table>

            <thead>

              <tr>

                <th>
                  Student ID
                </th>

                <th>
                  Name
                </th>

                <th>
                  Age
                </th>

                <th>
                  Course
                </th>

                <th>
                  Action
                </th>

              </tr>

            </thead>


            <tbody>

              {students.map(
                (student) => (

                  <tr
                    key={student._id}
                  >

                    <td>
                      {student.studentId}
                    </td>

                    <td>
                      {student.name}
                    </td>

                    <td>
                      {student.age}
                    </td>

                    <td>
                      {student.course}
                    </td>

                    <td>

                      <button
                        onClick={() =>
                          editStudent(student)
                        }
                      >
                        Edit
                      </button>


                      <button
                        onClick={() =>
                          deleteStudent(
                            student._id
                          )
                        }
                      >
                        Delete
                      </button>

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        )}

      </div>

    </div>

  );

}

export default App;