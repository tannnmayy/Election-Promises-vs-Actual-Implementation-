# Election Promises vs Actual Implementation — DBMS Educational Dashboard

Hi! This project is a simple web dashboard that helps you see if politicians actually kept the promises they made during elections. It's built to show how databases work in a fun and visual way.

## 🤔 What does this do?
When politicians run for office, they make a lot of promises (like "better schools" or "more jobs"). This app compares those promises to what actually happened. 
- **See the data:** It uses a real database (MySQL) to store and show these promises.
- **Learn DB stuff:** If you're a student, it helps you learn how to talk to databases using SQL.
- **Charts:** It turns boring table rows into colorful charts so they're easy to understand.

## ✨ What can you do here?

- **Track Promises:** See a big list of everything politicians promised.
- **Scorecards:** See a "report card" for different governments to see who did better.
- **Cool Charts:** Look at pretty charts that show where the money went and how much work is actually done.
- **The "Brain" Lab:** If you want to see how the database works, there's a special lab where you can run commands like "Show me all promises from 2024" or "Which promises are late?".
- **ER Diagram:** A map that shows how all the information is linked together.

<img width="1916" height="933" alt="image" src="https://github.com/user-attachments/assets/c674c901-960c-42c0-af9f-023a14d38efb" />
<img width="1851" height="818" alt="image" src="https://github.com/user-attachments/assets/f76411f0-2285-4d2b-9f8b-6311690ba82e" />
<img width="1843" height="743" alt="image" src="https://github.com/user-attachments/assets/42fe7c00-c68c-461c-af05-f2c6ded89c55" />
<img width="1847" height="826" alt="image" src="https://github.com/user-attachments/assets/6ff2b027-d3a0-45de-a7b2-e365456dd4f1" />
<img width="1857" height="656" alt="image" src="https://github.com/user-attachments/assets/d9f06243-6130-4183-a622-913315f3f82d" />
<img width="1861" height="853" alt="image" src="https://github.com/user-attachments/assets/6f4fee8e-4bd9-4548-b973-f9aac106ad5f" />


## 🚀 How to get it running?

You don't need to be a pro to run this. Just follow these 3 steps:

### 1. Prepare the Database
You'll need **MySQL** on your computer.
- Open your MySQL tool.
- Run the `schema.sql` file first (this creates the "containers" for the data).
- Run the files in the `sql/` folder to fill it up with information.

### 2. Start the "Brain" (Backend)
The backend is what connects the database to the website.
- Open a terminal in the `backend` folder.
- Type `npm install` to get the necessary tools.
- Type `npm start` to turn it on.
*(Make sure to check the `.env` file to put in your MySQL password!)*

### 3. Open the Website
- Go to your browser and type: `http://localhost:3000`
- That's it! You should see the dashboard.

## 🛠️ What's under the hood?
- **Database:** MySQL (The memory)
- **Backend:** Node.js & Express (The brain)
- **Frontend:** HTML, CSS, & Javascript (The face)
- **Charts:** Chart.js (The pretty pictures)

---
*Created for a 4th Semester DBMS project.*
