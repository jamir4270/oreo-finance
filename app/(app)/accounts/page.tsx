export default function AccountsPage() {
  return (
    <div className="flex flex-1 flex-col p-6 md:p-10 max-w-5xl mx-auto w-full">
      <div className="flex flex-col gap-2 border-b border-border pb-6">
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-oreo-slate-purple">
          Accounts
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your financial accounts and balances.
        </p>
      </div>
      <div className="flex flex-1 items-center justify-center mt-12">
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-muted/30 p-12 text-center">
          <h2 className="font-heading text-xl text-oreo-slate-purple">Coming in Phase 7</h2>
          <p className="text-sm text-muted-foreground max-w-xs">
            This section will contain the account list and account creation flow.
          </p>
        </div>
      </div>
    </div>
  );
}
