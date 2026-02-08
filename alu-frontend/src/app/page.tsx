import { UserButton } from "@clerk/nextjs";
import GenerationForm from './components/GenerationForm';
import Feed from './components-v2/Feed';

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-zinc-50 font-sans text-zinc-900 dark:bg-black dark:text-zinc-50">
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between px-4 md:px-6 border-b border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-black/80">
        <h1 className="text-xl font-semibold tracking-tight">Alu</h1>
        <UserButton afterSignOutUrl="/" />
      </header>
      
      <main className="flex flex-1 flex-col p-4 md:p-6">
        {/* --- Generation UI Section --- */}
        <section className="w-full max-w-2xl mx-auto mb-12">
          <GenerationForm />
        </section>

        {/* --- Feed Section --- */}
        <section className="w-full max-w-4xl mx-auto">
          <Feed />
        </section>
      </main>
    </div>
  );
}
