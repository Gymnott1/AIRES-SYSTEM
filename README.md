
---

```markdown
# CV Scanner Web Application

## Overview

This web application allows users to upload their CVs and scan them using AI. The app provides feedback, key insights, scores, and suggestions about the CV. It also features a chat interface for users to interact with the AI regarding their CV.

**Technology Stack:**
- **Frontend:** React
- **Backend:** Django
- **Database:** PostgreSQL
## Some of the screenshots from frontend 
![AIRES IMAGE](public/AIRES.png)
![AIRES IMAGE](public/AIRES (2).png)
![AIRES IMAGE](public/AIRES (3).png)
![AIRES IMAGE](public/AIRES (4).png)
![AIRES IMAGE](public/AIRES (5).png)
![AIRES IMAGE](public/AIRES (6).png)
![AIRES IMAGE](public/AIRES (7).png)
![AIRES IMAGE](public/AIRES (8).png)
![AIRES IMAGE](public/AIRES (9).png)
![AIRES IMAGE](public/AIRES (10).png)
![AIRES IMAGE](public/AIRES (11).png)
![AIRES IMAGE](public/AIRES (12).png)
![AIRES IMAGE](public/AIRES (13).png)
![AIRES IMAGE](public/AIRES (14).png)
![AIRES IMAGE](public/AIRES (15).png)
![AIRES IMAGE](public/AIRES (16).png)
![AIRES IMAGE](public/AIRES (17).png)
![AIRES IMAGE](public/AIRES (18).png)
![AIRES IMAGE](public/AIRES (19).png)
![AIRES IMAGE](public/AIRES (20).png)
![AIRES IMAGE](public/AIRES (21).png)
![AIRES IMAGE](public/AIRES (22).png)
![AIRES IMAGE](public/AIRES (23).png)
![AIRES IMAGE](public/AIRES (24).png)

# DOWNLOAD OF OF THE PDFS
![AIRES PDF](public/improved_resume.pdf)
![AIRES PDF](public/AIRESR.pdf)

## Prerequisites

Before you begin, make sure you have the following installed on your machine:
- [Git](https://git-scm.com/downloads)
- [Node.js](https://nodejs.org/) (includes npm)
- [Python 3.8+](https://www.python.org/downloads/)
- [PostgreSQL](https://www.postgresql.org/download/) (or you can use a managed instance)

## Getting Started

### 1. Clone the Repository

Open your terminal and run the following commands to clone the repository:

```bash
git clone https://github.com/yourusername/your-repo.git
cd your-repo
```

### 2. Set Up the Backend (Django)

#### a. Create and Activate a Virtual Environment

For **macOS/Linux**:
```bash
python3 -m venv env
source env/bin/activate
```

For **Windows**:
```bash
python -m venv env
env\Scripts\activate
```

#### b. Install Dependencies

Make sure you're in the Django project directory (if your project structure is different, navigate to where your `requirements.txt` is located):

```bash
pip install -r requirements.txt
```

#### c. Configure Environment Variables

Create a `.env` file in the Django project root (or use your preferred method for setting environment variables) with content similar to:

```
SECRET_KEY=your_secret_key
DEBUG=True  # Set to False in production
DATABASE_NAME=your_database_name
DATABASE_USER=your_database_user
DATABASE_PASSWORD=your_database_password
DATABASE_HOST=localhost
DATABASE_PORT=5432
```

*(Adjust these settings based on your PostgreSQL configuration.)*

#### d. Apply Migrations and Create a Superuser

Run the following commands to set up the database and create an admin user:

```bash
python manage.py migrate
python manage.py createsuperuser
```

#### e. Start the Django Development Server

```bash
python manage.py runserver
```

The backend should now be running at [http://127.0.0.1:8000](http://127.0.0.1:8000).

### 3. Set Up the Frontend (React)

#### a. Install Dependencies

Navigate to the React app directory (for example, if your React code is in a folder named `client`):

```bash
cd client
npm install
```

#### b. Update API Endpoints

Make sure that the API endpoints in your React application point to the correct URL where the Django server is running (e.g., `http://127.0.0.1:8000`).

#### c. Start the React Development Server

```bash
npm start
```

Your React application should now be running at [http://localhost:3000](http://localhost:3000).

## Project Structure

Below is an example structure for the repository:

```
your-repo/
├── backend/               # Django backend
│   ├── manage.py
│   ├── your_project/      # Django project folder
│   └── requirements.txt
├── client/                # React frontend
│   ├── package.json
│   └── src/
└── README.md
```

## Troubleshooting

- **Environment Variables:**  
  Ensure your `.env` file is correctly set up and is being loaded by Django. Consider using packages like `python-decouple` or `django-environ` for easier management.

- **Database Connection:**  
  Verify that your PostgreSQL server is running and that the credentials in your `.env` file match your PostgreSQL configuration.

- **CORS Issues:**  
  If your React frontend and Django backend are running on different ports, configure [django-cors-headers](https://github.com/adamchainz/django-cors-headers) to handle cross-origin requests.

## Git Commands

For future reference, here are some basic Git commands:

- **Stage Changes:**
  ```bash
  git add .
  ```
- **Commit Changes:**
  ```bash
  git commit -m "Your commit message"
  ```
- **Push to GitHub:**
  ```bash
  git push origin main
  ```
- **Pull Latest Changes:**
  ```bash
  git pull origin main
  ```

## License

This project is licensed under the MIT License.
```

---

