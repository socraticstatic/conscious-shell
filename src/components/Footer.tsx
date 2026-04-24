export default function Footer() {
  return (
    <footer className="py-6 px-6 md:px-10 text-[11px] text-[#6b6660]">
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-[#e7b766]" />
          <span className="text-[#a8a29e]">conscious_shell</span>
          <span className="text-[#4a453e]">—</span>
          <span>always in progress since 2000</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[#4a453e]">build: vite · react · supabase · three · d3</span>
          <span>© {new Date().getFullYear()} micah boswell</span>
        </div>
      </div>
    </footer>
  );
}
