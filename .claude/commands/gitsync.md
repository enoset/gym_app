---
description: Stage changes, commit with a message, and push to remote
allowed-tools: Bash(git add:*), Bash(git commit:*), Bash(git push:*)
argument-hint: [optional commit message]
model: haiku
---

# Save and Sync Changes

## Step 1: Check what's changed
First, show me what files have been modified:
!`git status --short`

## Step 2: Stage all changes
Stage all modified and new files:
!`git add -A`

## Step 3: Generate or use commit message
<current_diff>
!`git diff --cached`
</current_diff>

<recent_commits>
!`git log --oneline -5`
</recent_commits>

If the user provided a message in $ARGUMENTS, use that as the commit message.

If no message was provided, analyze the staged changes above and generate a clear, concise commit message following these guidelines:
- Use Conventional Commits format (feat:, fix:, docs:, refactor:, etc.)
- Keep it under 72 characters if possible
- Be specific about what changed
- Look at recent commits to match the project's style

## Step 4: Commit the changes
Execute the commit using the Bash tool with the commit message you determined. Use a HEREDOC format:
```
git commit -m "$(cat <<'EOF'
<your commit message here>

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

## Step 5: Push to remote
**CRITICAL: You MUST execute this step - do NOT skip it!**

After the commit is successful, push the changes to the remote repository:
!`git push origin main`

If the push fails or shows "Everything up-to-date", still confirm the current sync status with the user.

## Step 6: Confirm completion
Confirm to the user:
- What was committed
- The commit message used
- That changes were pushed successfully to origin/main