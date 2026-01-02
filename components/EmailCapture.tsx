export function EmailCapture() {
  return (
    <section className="rounded-3xl bg-ink text-background shadow-soft">
      <div className="flex flex-col gap-4 p-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.2em] text-background/60">Signal</p>
          <h3 className="text-xl font-semibold">Join the low key high signal list</h3>
          <p className="text-background/80">
            Early access to drops, studio stories, and warehouse hours. No noise.
          </p>
        </div>
        <form className="flex w-full max-w-md flex-col gap-3 sm:flex-row">
          <input
            type="email"
            required
            placeholder="you@domain.com"
            className="flex-1 rounded-full border border-background/20 bg-background px-4 py-3 text-ink placeholder:text-ink/50 focus:border-gold focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-full bg-gold px-6 py-3 font-semibold text-ink transition hover:-translate-y-[1px] hover:shadow-lg"
          >
            Submit
          </button>
        </form>
      </div>
    </section>
  );
}
