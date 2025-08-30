Deploying backend to Cloud Run

Prerequisites
- A Google Cloud project with Billing enabled.
- gcloud CLI installed locally for manual testing (optional).
- A service account with roles: Cloud Run Admin, Cloud Build Editor, Storage Admin (to push images), Firestore Admin (or appropriate least-privilege roles).

Recommended secret setup in GitHub repository (Settings → Secrets → Actions):
- GCP_PROJECT_ID: your-gcp-project-id
- GCP_REGION: e.g. us-central1
- GCP_SA_KEY: JSON service account key (whole JSON), used by the action to authenticate gcloud
- GEMINI_API_KEY: your Gemini API Key

How it works
- The workflow builds the container from the `backend/` folder using Cloud Build and pushes it to Container Registry.
- Then it deploys the image to Cloud Run and sets `GEMINI_API_KEY` as an environment variable.

Notes
- For Firestore access, instead of embedding service account JSON in the app, assign the deployed Cloud Run service the appropriate service account with Firestore permissions.
- If you prefer to use Secret Manager for GEMINI_API_KEY, adjust the `gcloud run deploy` command to set the secret as an environment variable from Secret Manager.

Manual deploy (local, for testing):
1. Build and submit using Cloud Build:
   gcloud builds submit backend --tag gcr.io/PROJECT_ID/rancha-backend:latest
2. Deploy to Cloud Run:
   gcloud run deploy rancha-backend --image gcr.io/PROJECT_ID/rancha-backend:latest --region REGION --platform managed --allow-unauthenticated --set-env-vars GEMINI_API_KEY=YOUR_KEY

*** End File
