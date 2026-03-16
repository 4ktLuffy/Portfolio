# Henos Dereje — AI Automation Portfolio

## Deploy to Vercel (5 minutes)

### Step 1: Create a GitHub repo
1. Go to github.com → New Repository
2. Name it `portfolio` (or whatever you want)
3. Keep it public
4. DON'T add a README (we already have one)

### Step 2: Push this code to GitHub
Open your terminal and run these commands one by one:

```bash
cd henos-portfolio
git init
git add .
git commit -m "Initial portfolio"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/portfolio.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

### Step 3: Deploy on Vercel
1. Go to vercel.com and sign up with your GitHub account
2. Click "Add New Project"
3. Import your `portfolio` repository
4. Vercel auto-detects it's a Vite project — just click "Deploy"
5. Wait ~60 seconds
6. Your site is live at `portfolio-YOUR_USERNAME.vercel.app`

### Step 4: Custom domain (optional)
In Vercel dashboard → Settings → Domains, you can add a custom domain like `henosdereje.com`.

## Updating the site
Every time you push to GitHub, Vercel auto-deploys:

```bash
git add .
git commit -m "Added invoice extraction project"
git push
```

That's it. Site updates in ~30 seconds.

## Local development
```bash
npm install
npm run dev
```
Opens at http://localhost:5173

## Tech
- React 18 + Vite
- Groq API (free tier) for AI features
- Vercel for hosting (free)
- No backend needed
