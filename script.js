
const defaultCourses = [
    {
        id: 1,
        name: "Web Development",
        instructor: "Rahul Sharma",
        duration: "8 weeks"
    },
    {
        id: 2,
        name: "Python Programming",
        instructor: "Anjali Rao",
        duration: "6 weeks"
    },
    {
        id: 3,
        name: "Data Structures",
        instructor: "Priya Menon",
        duration: "10 weeks"
    },
    {
        id: 4,
        name: "Database Management",
        instructor: "Arjun Reddy",
        duration: "8 weeks"
    }
];

// Read saved data or use default courses
function getCourses() {
    const saved = localStorage.getItem("cmsCourses");

    if (saved === null) {
        localStorage.setItem(
            "cmsCourses",
            JSON.stringify(defaultCourses)
        );
        return defaultCourses;
    }

    return JSON.parse(saved);
}

function saveCourses(courses) {
    localStorage.setItem("cmsCourses", JSON.stringify(courses));
}

// Register a student
function registerUser() {
    const role = document.getElementById("role").value;
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value;
    const message = document.getElementById("message");

    if (!name || !email || !password) {
        message.textContent = "Please fill in all fields.";
        return;
    }

    if (role === "admin") {
        message.textContent =
            "Admin registration is disabled. Use the demo admin login.";
        return;
    }

    const users = JSON.parse(localStorage.getItem("cmsUsers") || "[]");

    if (users.some(user => user.email === email)) {
        message.textContent = "This email is already registered.";
        return;
    }

    users.push({ name, email, password });
    localStorage.setItem("cmsUsers", JSON.stringify(users));

    message.textContent = "Registration successful! You can now log in.";
}

// Login student or admin
function loginUser() {
    const role = document.getElementById("role").value;
    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value;
    const message = document.getElementById("message");

    if (!email || !password) {
        message.textContent = "Enter your email and password.";
        return;
    }

    if (role === "admin") {
        if (email === "admin@cms.com" && password === "admin123") {
            sessionStorage.setItem("cmsRole", "admin");
            sessionStorage.removeItem("cmsStudent");
            window.location.href = "admin.html";
        } else {
            message.textContent = "Invalid admin credentials.";
        }
        return;
    }

    const users = JSON.parse(localStorage.getItem("cmsUsers") || "[]");

    const user = users.find(
        item => item.email === email && item.password === password
    );

    if (!user) {
        message.textContent = "Invalid email or password.";
        return;
    }

    sessionStorage.setItem("cmsRole", "student");
    sessionStorage.setItem("cmsStudent", user.email);
    window.location.href = "user.html";
}

// Check access to the student page
function checkStudentAccess() {
    if (sessionStorage.getItem("cmsRole") !== "student") {
        window.location.href = "index.html";
        return false;
    }

    return true;
}

// Check access to the admin page
function checkAdminAccess() {
    if (sessionStorage.getItem("cmsRole") !== "admin") {
        window.location.href = "index.html";
        return false;
    }

    return true;
}

// Add a new course (admin)
function addCourse() {
    if (sessionStorage.getItem("cmsRole") !== "admin") {
        alert("Please log in as admin.");
        window.location.href = "index.html";
        return;
    }

    const name = document.getElementById("courseName").value.trim();
    const instructor = document.getElementById("instructor").value.trim();
    const duration = document.getElementById("duration").value.trim();
    const message = document.getElementById("adminMessage");

    if (!name || !instructor || !duration) {
        message.textContent = "Please fill in all course fields.";
        return;
    }

    const courses = getCourses();

    courses.push({
        id: Date.now(),
        name,
        instructor,
        duration
    });

    saveCourses(courses);

    document.getElementById("courseName").value = "";
    document.getElementById("instructor").value = "";
    document.getElementById("duration").value = "";

    message.textContent = "Course added successfully!";
    displayAdminCourses();
}

// Display courses for the admin
function displayAdminCourses() {
    const list = document.getElementById("adminCourseList");
    if (!list) return;

    const courses = getCourses();
    list.innerHTML = "";

    if (courses.length === 0) {
        list.textContent = "No courses available.";
        return;
    }

    courses.forEach(course => {
        const card = document.createElement("div");
        card.className = "course-card";

        const title = document.createElement("h3");
        title.textContent = course.name;

        const teacher = document.createElement("p");
        teacher.textContent = "Instructor: " + course.instructor;

        const duration = document.createElement("p");
        duration.textContent = "Duration: " + course.duration;

        const button = document.createElement("button");
        button.textContent = "Delete Course";
        button.onclick = () => deleteCourse(course.id);

        card.append(title, teacher, duration, button);
        list.appendChild(card);
    });
}

// Delete a course
function deleteCourse(id) {
    if (sessionStorage.getItem("cmsRole") !== "admin") {
        alert("Admin login required.");
        return;
    }

    if (!confirm("Are you sure you want to delete this course?")) {
        return;
    }

    const courses = getCourses().filter(course => course.id !== id);
    saveCourses(courses);

    // Remove deleted course from every student's enrollment
    const enrollments = JSON.parse(
        localStorage.getItem("cmsEnrollments") || "{}"
    );

    Object.keys(enrollments).forEach(email => {
        enrollments[email] = enrollments[email].filter(
            courseId => courseId !== id
        );
    });

    localStorage.setItem("cmsEnrollments", JSON.stringify(enrollments));

    displayAdminCourses();
}

// Display courses on student page
function displayStudentCourses() {
    const list = document.getElementById("courseList");
    if (!list) return;

    const courses = getCourses();
    const email = sessionStorage.getItem("cmsStudent");

    const enrollments = JSON.parse(
        localStorage.getItem("cmsEnrollments") || "{}"
    );

    const myCourses = enrollments[email] || [];
    list.innerHTML = "";

    if (courses.length === 0) {
        list.textContent = "No courses available.";
        return;
    }

    courses.forEach(course => {
        const card = document.createElement("div");
        card.className = "course-card";

        const title = document.createElement("h3");
        title.textContent = course.name;

        const teacher = document.createElement("p");
        teacher.textContent = "Instructor: " + course.instructor;

        const duration = document.createElement("p");
        duration.textContent = "Duration: " + course.duration;

        const button = document.createElement("button");

        if (myCourses.includes(course.id)) {
            button.textContent = "Already Enrolled";
            button.disabled = true;
        } else {
            button.textContent = "Enroll Now";
            button.onclick = () => enrollCourse(course.id);
        }

        card.append(title, teacher, duration, button);
        list.appendChild(card);
    });

    displayEnrolledCourses();
}

// Enroll a student
function enrollCourse(id) {
    const email = sessionStorage.getItem("cmsStudent");

    if (!email || sessionStorage.getItem("cmsRole") !== "student") {
        alert("Please log in as a student.");
        window.location.href = "index.html";
        return;
    }

    const courses = getCourses();

    if (!courses.some(course => course.id === id)) {
        alert("This course is no longer available.");
        displayStudentCourses();
        return;
    }

    const enrollments = JSON.parse(
        localStorage.getItem("cmsEnrollments") || "{}"
    );

    if (!enrollments[email]) {
        enrollments[email] = [];
    }

    if (!enrollments[email].includes(id)) {
        enrollments[email].push(id);
    }

    localStorage.setItem("cmsEnrollments", JSON.stringify(enrollments));

    displayStudentCourses();
}

// Display enrolled courses
function displayEnrolledCourses() {
    const list = document.getElementById("enrolledList");
    if (!list) return;

    const email = sessionStorage.getItem("cmsStudent");

    const enrollments = JSON.parse(
        localStorage.getItem("cmsEnrollments") || "{}"
    );

    const ids = enrollments[email] || [];
    const courses = getCourses().filter(course => ids.includes(course.id));

    list.innerHTML = "";

    if (courses.length === 0) {
        list.textContent = "You have not enrolled in any courses yet.";
        return;
    }

    courses.forEach(course => {
        const card = document.createElement("div");
        card.className = "course-card";

        const title = document.createElement("h3");
        title.textContent = course.name;

        const teacher = document.createElement("p");
        teacher.textContent = "Instructor: " + course.instructor;

        const status = document.createElement("p");
        status.textContent = "Status: Enrolled";

        card.append(title, teacher, status);
        list.appendChild(card);
    });
}

// Logout
function logout() {
    sessionStorage.removeItem("cmsRole");
    sessionStorage.removeItem("cmsStudent");
    window.location.href = "index.html";
}

// Run the appropriate page functions
document.addEventListener("DOMContentLoaded", function () {
    if (document.getElementById("adminCourseList")) {
        if (!checkAdminAccess()) return;
        displayAdminCourses();
    }

    if (document.getElementById("courseList")) {
        if (!checkStudentAccess()) return;

        const email = sessionStorage.getItem("cmsStudent");
        const users = JSON.parse(localStorage.getItem("cmsUsers") || "[]");
        const user = users.find(item => item.email === email);

        if (user) {
            document.getElementById("studentName").textContent = user.name;
        }

        displayStudentCourses();
    }
});
