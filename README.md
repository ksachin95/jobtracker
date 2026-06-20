# CareerPath | Premium Job Application Tracker

CareerPath is a modern, responsive, and professional Job Search Tracking Web Application. It is designed to empower job seekers by providing a centralized hub to track job applications, interview schedules, salaries, contacts, and follow-ups.

![Screenshot of CareerPath](https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?q=80&w=1200&auto=format&fit=crop) *(Note: Replacable with project screenshot)*

## ✨ Key Features

- **📊 Visual Analytics Dashboard**: Includes key stat counters (Total Applications, Interviews, Offers, Rejections) with progress bars and an interactive status distribution donut chart powered by **Chart.js**.
- **🔍 Real-time Search & Filter**: Instant searching by company or job title, with dropdown filters for Application Status and Locations.
- **↕️ Advanced Sorting**: Sort application lists by application date (newest/oldest), salary range (highest), company name, and job title.
- **📝 Full CRUD Support (Create, Read, Update, Delete)**: Easily log new applications, view detailed information cards, edit existing applications, or delete entries.
- **🕐 Conditional UX Flow**: When status is set to "Interview Scheduled", a dedicated Interview Date & Time field dynamically displays in the input form.
- **📂 Local Persistence**: All application data is automatically stored in `localStorage` so your search logs persist across browser refreshes without any database overhead.
- **📱 Premium, Responsive Design**: Light-themed modern card layout with backdrop-blurred modal structures, responsive grids (adapts perfectly to mobile, tablet, and desktop screens), and micro-animations.

---

## 🛠️ Technology Stack

- **Core Structure**: HTML5 (Semantic elements)
- **Styles & Layouts**: Vanilla CSS3 (Custom Variables, Flexbox, Grid, keyframe animations, glassmorphism modals)
- **Logic & Interactions**: Modern JavaScript (ES6+, DOM API, events)
- **Visual Analytics**: [Chart.js](https://www.chartjs.org/) (Loaded via CDN)
- **Visual Styling & Icons**: [FontAwesome 6](https://fontawesome.com/) (Loaded via CDN)
- **Local Database**: Browser `localStorage`

---

## 📁 Project Structure

```text
jobtracker/
├── index.html   # Main layout, forms, toolbar, and container
├── styles.css   # Custom CSS variables, responsive design, animations, modal flex layout
├── app.js       # localStorage syncing, CRUD controllers, status chart, filtering & sort engines
└── README.md    # Documentation
```

---

## 🚀 How to Run Locally

Since the application uses standard browser technologies and external library CDNs, it can be launched directly:

1. **Option A: File Explorer (Direct)**
   - Simply double-click `index.html` to open it in your browser. (Note: browser security configurations may sometimes limit some CDN features or web workers in direct `file://` environments).

2. **Option B: Local Web Server (Recommended)**
   - Start a local HTTP server in the root of the project folder:
     ```bash
     # Using Python
     python -m http.server 8080
     
     # Or using Node.js (npx)
     npx http-server -p 8080
     ```
   - Open your browser and navigate to: `http://localhost:8080/`

---

## 🧑‍💻 Seeding Mock Data

To help you explore the application instantly on first load, CareerPath comes pre-seeded with 4 realistic job tracker cards:
1. **Google** (Senior Software Engineer) — *Interview Scheduled*
2. **Stripe** (Product Designer) — *Offer Received*
3. **Netflix** (Senior Frontend Developer) — *Applied*
4. **Meta** (Engineering Manager) — *Rejected*

Add more, delete seed values, and watch the dashboard stats update dynamically!
