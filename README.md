# HRMS Project  

Human Resource Management System with separate access for **Admin**, **HR Manager**, and **Employees**.  
The system manages employee registration, approval process, attendance, and leave requests.  

---

## 🔧 Setup Instructions  

### 1. Database (MySQL)  
1. Create a new database (for example: `hrms`).  
2. Import the provided SQL file from the `database/` folder into MySQL Workbench.  
   - This will create the required tables and insert default Admin and HR accounts.  
   - You can also run the `database/seed.sql` file to quickly insert the default Admin and HR users.  
3. Update your MySQL username and password in the backend file:  
src/main/resources/application.properties

yaml
Copy code

---

### 2. Backend (Spring Boot)  
1. Open terminal in the backend folder:  
```bash
cd hrms-backend
Start the backend:

On Linux/Mac:

bash
Copy code
./mvnw spring-boot:run
On Windows:

bash
Copy code
mvnw spring-boot:run
Backend runs on: http://localhost:8080

3. Frontend (React)
Open terminal in the frontend folder:

bash
Copy code
cd frontend/HRMS/hrms-project
Install dependencies:

bash
Copy code
npm install
Start the frontend:

bash
Copy code
npm start
Frontend runs on: http://localhost:3000

👤 Default Accounts
Admin

Email: admin@gmail.com

Password: admin123

HR Manager

Email: hr@example.com

Password: hr123

📌 How the System Works
1. Employee Registration & Login
New users can register via the Registration option on the login page.

Their email and password are stored in the users table in the database.

A request is automatically sent to the HR dashboard for approval.

If the HR approves the request → the new user can log in and access the employee dashboard.

If the HR rejects the request → login is denied.

If the HR has not yet responded → login shows an alert message:

csharp
Copy code
Your request is pending approval from HR.
2. Employee Features
Access their Employee Dashboard only after HR approval.

Mark attendance for the current date.

Send leave requests to HR with a reason.

Check the status of leave requests (approved or rejected).

3. HR Features
Login with HR credentials.

Access the HR Dashboard, where HR can:

Approve or reject new user registration requests.

View the list of employees.

Update or delete employee access.

View attendance records of employees.

View leave requests and respond with approval or rejection.

4. Admin Features
Login with Admin credentials.

Access the Admin Dashboard, where Admin can:

View the number of employees.

View HR information.

View employee names and basic details.

Note: Admin does not have access to update or delete employees.

⚠️ Notes
Make sure MySQL service is running before starting the backend.

Update the database connection details (application.properties) as per your system.

Do not share the default Admin and HR credentials outside testing. Replace them for production use.

👥 Authors
Team: HRMS—GROUP-1
Repository: HRMS---GROUP-1 GitHub Repo

pgsql
Copy code

---

✅ This version is clean, professional, and GitHub will render it properly.  

Do you also want me to prepare the **final `seed.sql` file with ready-to-run insert statements** (so your institute can import default Admin and HR users without confusion)?







Ask ChatGPT
