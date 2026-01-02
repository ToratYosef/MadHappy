export default function Footer() {
  return (
    <footer className="border-t border-black/5 bg-white/40">
      <div className="container-max flex flex-col gap-4 py-8 text-sm text-black/70 md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} low key high. Understated essentials.</p>
        <div className="flex gap-4">
          <a href="mailto:hello@lowkeyhigh.com" className="hover:text-foreground">Contact</a>
          <a href="#" className="hover:text-foreground">Terms</a>
          <a href="#" className="hover:text-foreground">Privacy</a>
        </div>
      </div>
    </footer>
  );
}
