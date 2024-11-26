export default function SiteFooter() {
  const yr = new Date().getFullYear();
  return (
    <footer
      className="mt-auto flex min-w-full px-6 pb-6 pt-32
    "
    >
      <p className="text-xs text-skin-muted">
        &copy; {yr} <span>grahamvanpelt.dev</span>
      </p>
    </footer>
  );
}
