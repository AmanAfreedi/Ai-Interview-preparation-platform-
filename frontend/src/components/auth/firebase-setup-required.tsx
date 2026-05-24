import { getMissingFirebaseEnvKeys } from '@/lib/firebase/env'

export function FirebaseSetupRequired() {
  const missing = getMissingFirebaseEnvKeys()

  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/30 p-6">
      <div className="w-full max-w-lg space-y-4 rounded-xl border bg-card p-6 shadow-lg">
        <h1 className="text-xl font-semibold">Firebase setup required</h1>
        <p className="text-sm text-muted-foreground">
          The dev server is running, but the app needs Firebase credentials in{' '}
          <code className="rounded bg-muted px-1 py-0.5">frontend/.env.local</code>
          .
        </p>

        <ol className="list-decimal space-y-2 pl-5 text-sm">
          <li>
            Open{' '}
            <a
              href="https://console.firebase.google.com/"
              target="_blank"
              rel="noreferrer"
              className="text-primary underline-offset-4 hover:underline"
            >
              Firebase Console
            </a>{' '}
            → your project → Project settings → Your apps → Web app config.
          </li>
          <li>
            In PowerShell:
            <pre className="mt-2 overflow-x-auto rounded-md bg-muted p-3 text-xs">
              {`cd C:\\Users\\amanp\\ai-study-platform\\frontend\nCopy-Item .env.example .env.local`}
            </pre>
          </li>
          <li>Paste your config values into <code>.env.local</code>.</li>
          <li>
            Enable <strong>Authentication → Email/Password</strong> in Firebase.
          </li>
          <li>Restart the dev server: <code>npm run dev</code></li>
        </ol>

        {missing.length > 0 && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            <p className="font-medium">Missing variables:</p>
            <ul className="mt-1 list-inside list-disc">
              {missing.map((key) => (
                <li key={key}>{key}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
