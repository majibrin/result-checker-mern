# Result Management Portal (GSU Version)

A high-performance academic portal for secure result processing and real-time GPA tracking.

---

## 🚩 Problem Statement
Traditional academic record-keeping suffers from manual entry errors, data fragmentation, and a lack of immediate feedback for students. This project addresses these inefficiencies by digitizing the lifecycle of a result—from admin entry to student verification.

## 🛠️ Technologies Used
### **MERN Stack**
* **MongoDB**: NoSQL database for flexible data modeling of Students and Results.
* **Express.js**: Backend web framework for robust API routing.
* **React.js**: Component-based frontend for a responsive User Interface.
* **Node.js**: JavaScript runtime for scalable server-side logic.

### **Other Tools**
* **Mongoose**: ODM for schema-based data validation and relationships.
* **JSON Web Tokens (JWT)**: Secure, stateless authentication for Admin and Student roles.
* **Bcrypt.js**: Industry-standard hashing for protecting Admin passwords and Student PINs.
* **Axios**: For seamless API communication between Frontend and Backend.

## 💡 Solution Features
* **Dynamic GPA Engine**: Automated calculation of grade points (A-F) on a 5.0 scale.
* **Role-Based Access (RBAC)**: Distinct permissions for Admins and Students.
* **Secure Auth**: Authentication via `reg_no` and `pin_hash` for students.
* **Data Integrity**: Prevention of duplicate result entries for the same course/semester.

## 🚀 How to Run

### 1. Environment Configuration
Create a `.env` file in the `/backend` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_signing_key

