# Full Deployment Guide

This guide covers everything from protecting your sensitive data with `.gitignore`, uploading your code to GitHub using terminal commands, setting up a live database, and hosting your backend server.

---

## 1. Understanding and Creating `.gitignore`

**What is `.gitignore`?**
When you upload your project to GitHub, you do not want to upload everything. Some files are too large (like the `node_modules` folder), and some files contain sensitive secrets (like your `.env` file which has your database passwords). The `.gitignore` file tells Git exactly which files and folders to ignore and NOT upload.

**Setting it up:**
I have already created a `.gitignore` file for you in this project. It contains the following lines:
```text
node_modules/
.env
database.sqlite
```
- `node_modules/`: Ignores the folder containing all downloaded packages (Render will download them automatically using `package.json`).
- `.env`: Ignores your environment variables so your admin password and database connection string stay private.
- `database.sqlite`: Ignores the local SQLite database file, as we are migrating to an online PostgreSQL database.

---

## 2. Uploading Code to GitHub (Git Commands)

You need to push your local code to a GitHub repository so hosting services can access it.

**Step 2.1:** Go to [GitHub](https://github.com/) and create a new repository. DO NOT check "Add a README file" or "Add .gitignore". Create an empty repository.

**Step 2.2:** Open your terminal, ensure you are inside your project folder (`e:\Training Main\portfolio\cv\portfolio-db`), and run these commands one by one:

1. **`git add .`**
   - *What it does:* Stages all your files to be saved. The `.` means "everything in this folder" (except what is in `.gitignore`).
2. **`git commit -m "Initial commit for deployment"`**
   - *What it does:* Saves the snapshot of your staged files with a descriptive message.
3. **`git branch -M main`**
   - *What it does:* Ensures your main branch is called `main`.
4. **`git remote add origin <YOUR_GITHUB_REPO_URL>`**
   - *(Replace `<YOUR_GITHUB_REPO_URL>` with the URL GitHub gave you, e.g., `https://github.com/yourusername/your-repo.git`)*
   - *What it does:* Links your local folder to your new GitHub repository.
5. **`git push -u origin main`**
   - *What it does:* Uploads all your committed code to the GitHub repository.

---

## 3. Setting Up an Online Database (Neon)

Now that your code is online, we need an online database to store your messages.

1. Go to [Neon.tech](https://neon.tech/) and sign up.
2. Create a new project. Give it a name like `portfolio-db`.
3. Once the database is created, Neon provides a **Connection String** (URI). It will look something like this: `postgresql://username:password@ep-cool-endpoint.region.aws.neon.tech/neondb?sslmode=require`
4. Copy this string. You will need it in the final step.

---

## 4. Hosting the Node.js Server (Render)

We will use Render to host the backend server and serve the HTML files.

1. Go to [Render.com](https://render.com/) and sign up with your GitHub account.
2. Click **New +** and select **Web Service**.
3. Under "Connect a repository", find the GitHub repository you just created and click **Connect**.
4. Configure the Web Service:
   - **Name:** Choose a name for your app (e.g., `my-portfolio-backend`).
   - **Region:** Choose whatever is closest to you.
   - **Branch:** `main`
   - **Root Directory:** Leave blank.
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Instance Type:** Select the **Free** tier.

---

## 5. Adding Environment Variables to Render

Render doesn't have your `.env` file (because we ignored it!). You have to manually give Render your secrets.

1. Still on the Render Web Service creation page, scroll down and click **Advanced**.
2. Click **Add Environment Variable** and add the following keys and values exactly as they appear in your local `.env` file:
   - Key: `DATABASE_URL` | Value: *(Paste the Neon Connection String you copied in Step 3)*
   - Key: `JWT_SECRET` | Value: *(e.g., `my_super_secret_jwt_key_123`)*
   - Key: `ADMIN_USERNAME` | Value: *(Your admin username)*
   - Key: `ADMIN_PASSWORD` | Value: *(Your admin password)*
3. You do NOT need to set the `PORT` variable; Render handles that automatically.

---

## 6. Finish and Deploy

1. Click the **Create Web Service** button at the bottom.
2. Render will now start building your application. It will run `npm install` to get your packages, and then run `node server.js`.
3. You will see a terminal output on the screen. Once it says **"Your service is live 🎉"**, your website is officially on the internet!
4. Look near the top left of the Render dashboard for your live URL (e.g., `https://my-portfolio-backend-xyz.onrender.com`).
5. Click it! Your public portfolio is live, your contact form will save to Neon, and you can manage messages by navigating to `/admin.html` on that URL.
