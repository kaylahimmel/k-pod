# K-Pod AWS Backend Learning Plan (copy)

Snapshot of Kayla's living doc, taken 2026-10-28. The live doc is the source of truth (status tracker lives there):
https://claude.ai/artifact/MhpY3x7uJaGkBHkZZvRDoA

## Why
10 modules give K-Pod a real Node/TypeScript backend on AWS: Cognito sign-in, a self-designed API, DynamoDB data, a scheduled feed-refresh job, and a CI/CD pipeline. Goal: a demoable answer to backend/cloud lines in full-stack job postings (NetJets posting in particular).

**Plain English:** the app signs in with Cognito and gets a token (a concert wristband). Every API call shows the wristband at the front door (API Gateway). Behind the door, small Node/TS functions (Lambda) read/write DynamoDB. A timer (EventBridge) wakes a workflow (Step Functions) to check podcast feeds. Everything is defined in TypeScript with CDK, so the backend lives in the repo.

## Assumptions to confirm
- Synced data: subscriptions, listening progress, settings. Downloaded audio stays on device.
- Firebase Auth is replaced by Cognito in module 4.
- Backend lives in the K-Pod repo under `backend/`.
- Pace: ~32 hrs/week (4 hrs weekdays + 12 weekend); each module ~12 hrs.

## How we work (learning loop)
1. Goal and concepts in plain English, then the technical version.
2. Kayla attempts it herself, writing core pieces by hand before using AI.
3. Targeted feedback, not answers up front.
4. Kayla explains it out loud in 2 minutes (interview talking point).
5. Short decision note in `docs/decisions/`.

Module shape: Learn 3h · Build 6h · Break and fix 2h · Explain 1h. If a module runs long, let it spill over; order matters more than calendar.

## Day-one cost and safety rules
- MFA on root, then stop using root.
- Admin user via IAM Identity Center.
- AWS Budget alert at ~$10.
- One region (us-east-2, Ohio).
- Never commit AWS keys: CLI sign-in locally, OIDC in GitHub Actions (module 8).
- Check current free tier terms.

## Modules
1. **AWS foundations and data model**: safety steps, AWS CLI, `cdk bootstrap`, deploy and `cdk destroy` a hello-world stack, write 6–10 access patterns. Talking point: "In DynamoDB I start from the queries, not the entities."
2. **First API endpoint end to end**: DynamoDB table, HTTP API, Node/TS Lambdas for subscriptions (GET/POST/DELETE), call from app with TanStack Query, hardcoded test user. Done when a subscription survives reinstall.
3. **Data modeling, validation, errors**: progress and settings with partition/sort keys, Zod validation with 400s, structured logging in CloudWatch, Jest tests for handlers.
4. **Swap Firebase Auth for Cognito**: user pool in CDK; decide Amplify Auth library vs hosted sign-in via `expo-auth-session`; JWT authorizer; user ID from token; tokens in secure storage. Done when user A can't read user B's data.
5. **App-side sync that feels fast**: local-first progress, debounced sync (~15s and on pause), optimistic updates/retries, offline queue, newest-timestamp-wins conflict rule.
6. **Scheduled feed refresh with Step Functions**: EventBridge schedule → workflow fetches/parses RSS with retries; app reads episodes from API.
7. **GraphQL with AppSync**: schema by hand, Cognito-protected, one live subscription for progress, REST vs GraphQL comparison note.
8. **CI/CD**: GitHub Actions (lint, typecheck, Jest, `cdk diff`, `cdk deploy`), OIDC to AWS, dev/prod stacks, Jenkins mapping note.
9. **Containers**: Docker basics, DynamoDB Local in Docker, containerize a small Node/TS service; optional brief ECS Fargate deploy (not free).
10. **Polish and tell the story**: README with diagram and cost notes, 5–8 decision records, 3-min demo video, resume entry and STAR story, mock system-design talk.

## Stretch goals (after module 10)
Postgres (2–3 wks), Java/Spring Boot (3–4 wks), Groovy (1 wk), AWS Certified Developer – Associate (4–6 wks), Terraform (1–2 wks). Skip Kafka, Kubernetes, Helm for now.

## Status (as of snapshot)
All 10 modules: Not started.
