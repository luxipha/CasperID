export default function Footer() {
  return (
    <footer className="bg-slate-50 border-t border-slate-100">
      <div className="w-full py-12 px-8 flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto">
        <div className="mb-8 md:mb-0">
          <div className="text-primary font-bold mb-2">CasperDrop</div>
          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
            © 2024 CasperDrop. Crystal Clarity for the Web3 Era.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-8 text-[10px] font-bold uppercase tracking-widest">
          <a className="text-slate-400 hover:text-primary transition-colors" href="#">Privacy Policy</a>
          <a className="text-slate-400 hover:text-primary transition-colors" href="#">Terms of Service</a>
          <a className="text-slate-400 hover:text-primary transition-colors" href="#">Brand Kit</a>
          <a className="text-slate-400 hover:text-primary transition-colors" href="#">Status</a>
        </div>
      </div>
    </footer>
  );
}
