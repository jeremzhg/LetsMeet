#  Git Branching & Contribution Guide

To keep our repository clean and minimize merge conflicts, please follow this strict workflow when starting a new feature or fix.

## 1. Branch Naming Convention
We use the **`type/description`** format.

### **Prefixes:**
* `feat/` = A new feature (e.g., adding a new page, API endpoint).
* `fix/` = A bug fix (e.g., fixing a crash, style error).
* `chore/` = Maintenance (e.g., updating npm packages, setting up configs).
* `docs/` = Documentation changes only.

### **Examples:**
✅ `feat/auth-login-page`
✅ `fix/match-score-calculation`
✅ `chore/setup-express`
❌ `login-page` (Missing prefix)
❌ `jason/fix` (Not descriptive)

---

## 2. Step-by-Step Workflow

### Step 1: Sync with Main
Before creating your branch, **always** make sure you have the latest code to avoid conflicts later.
```bash
    git checkout main
    git pull origin main
```
### Step 2: Create Your Branch
Create a new branch based on the latest main.

    # Syntax: git checkout -b <branch-name>
```bash
    git checkout -b feat/user-dashboard
```
### Step 3: Work & Commit
Make your changes. When committing, keep messages clear.
```bash
    git add .
    git commit -m "basic layout for dashboard"
```
### Step 4: Push to Remote
Push your branch.
```bash
    git push -u origin feat/user-dashboard
```
### Step 5: Create a Pull Request
1.  Go to the repository on GitHub.
2.  You will see a banner "feat/user-dashboard had recent pushes". Click **Compare & Pull Request**.
3.  **Title:** Clear description of what you did.
4.  **Reviewers:** Tag a teammate to review your code.
5.  **Merge:** Only merge after approval!

---

## 🛑 Rules of Thumb
1.  **One Feature per Branch:** Don't fix a bug in the navbar while working on the database. Create a separate branch.
2.  **Delete after Merge:** Once your PR is merged, delete the branch to keep the repo clean.