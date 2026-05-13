# Project Details

This project is a full-stack web application designed for a personal portfolio with an integrated contact message system and a secure admin dashboard.

Here are all the details regarding the languages used, the architecture, and how it works under the hood.

### 💻 Languages & Technologies Used

**Frontend (Client-Side)**
- **HTML5:** Used for the structure of the web pages (`index.html` for the public portfolio, `admin.html` for the dashboard).
- **CSS3:** Used for styling the website (`style.css`), creating a modern and responsive user interface.
- **JavaScript (Vanilla):** Client-side logic embedded within the HTML files to handle user interactions, form submissions, and fetching data from the backend APIs.

**Backend (Server-Side)**
- **JavaScript (Node.js):** The backend is written in JavaScript using the Node.js runtime environment.
- **Express.js:** A lightweight web application framework used to build the server and define the API routes (`server.js`).

**Database & Security**
- **PostgreSQL:** A powerful, open-source relational database used to store the contact messages. The backend uses the `pg` library to communicate with the database.
- **JSON Web Tokens (JWT):** Used via the `jsonwebtoken` package for secure, stateless authentication on the admin dashboard.
- **bcryptjs:** Included in the dependencies, typically used for hashing passwords (though currently, credentials seem to be handled via environment variables).

---

### ⚙️ How It Works (Architecture & Flow)

The application operates with a distinct separation between the public portfolio and the private admin dashboard.

#### 1. The Public Portfolio (`index.html`)
When a user visits the root of the site, the Express server serves the `index.html` file from the `public` directory. 
- **Contact Form Submission:** If a visitor fills out the contact form (providing their name, email, and a message) and submits it, the frontend JavaScript makes a `POST` request to the backend API endpoint: `/api/contact`.
- **Database Storage:** The Express server receives this data, validates that all fields are present, and securely inserts the new message into the PostgreSQL `messages` table.

#### 2. The Backend Server (`server.js`)
The Node.js server acts as the middleman between the frontend and the database. 
- It uses **CORS** to handle cross-origin requests.
- It automatically connects to your PostgreSQL database using a connection string stored in your `.env` file (`DATABASE_URL`). 
- On startup, it runs an initialization script (`initDb()`) that ensures the `messages` table exists in your database.

#### 3. The Admin Dashboard (`admin.html`)
This is a secure area for the portfolio owner to manage received messages.
- **Login Flow:** The admin accesses the dashboard and is prompted to log in. They submit a username and password, which sends a `POST` request to `/api/admin/login`.
- **Authentication:** The server compares the provided credentials against environment variables (`ADMIN_USERNAME` and `ADMIN_PASSWORD`). If they match, the server generates a secure **JWT (JSON Web Token)** that is valid for 1 hour and sends it back to the frontend.
- **Viewing Messages:** The frontend stores this token and uses it to make an authorized `GET` request to `/api/admin/messages`. The server verifies the token and, if valid, queries the database for all messages (newest first) and returns them to be displayed on the dashboard.
- **Deleting Messages:** If the admin clicks to delete a message, a `DELETE` request is sent to `/api/admin/messages/:id` along with the authorization token. The server validates the token and deletes the specified record from the PostgreSQL database.
