import { SwapForm } from './components/SwapForm';

function App() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-950 px-4 py-8 text-zinc-100 sm:px-6">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(145deg,#080b10_0%,#101827_48%,#062b2b_100%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.07)_1px,transparent_1px)] bg-[size:56px_56px] opacity-10"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-cyan-300/10 to-transparent"
      />

      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl flex-col items-center justify-center">
        <div className="mb-8 max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
            Currency Exchange
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-normal text-white sm:text-5xl">
            Swap tokens with a clear quote
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-zinc-300 sm:text-lg">
            Choose your assets and preview the estimated receive amount before
            submitting.
          </p>
        </div>

        <SwapForm />
      </section>
    </main>
  );
}

export default App;
