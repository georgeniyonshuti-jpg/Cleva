# SellWise — PAYGO Underwriting Platform

Browser-based underwriting app for PAYGO smartphone financing (Rwanda).

## Roles & login

| Email | Password | Role |
|-------|----------|------|
| alice@fieldfin.rw | alice123 | Sales Representative |
| bob@fieldfin.rw | bob123 | Sales Representative |
| jane@fieldfin.rw | jane123 | Underwriter |
| eric@fieldfin.rw | eric123 | Underwriter |
| ops@fieldfin.rw | ops123 | Ops & Support |

Each user logs in with their credentials and lands directly in their role's view.

## Workflow

```
Sales rep submits application
  → Underwriter reviews → Approve (UPYA contract auto-created) / Reject / Escalate
    → Rep enters IMEI → Carlcare verify → PayTrigger register
      → Rep manually locks phone → Confirm locked → Contract active, payments enabled
```

## Running on Replit

Click **Run**. Serves on port 3000. No build step needed.

## Customising devices & pricing

Edit the `DEVICES` array near the top of `index.html`.

## Adding real users

Replace the `USERS` array with an API call to your auth backend.
