import tfLogo from "../../../assets/transformers-logo-1.svg";

export function Header() {
    return (
    <header className="flex flex-row items-center gap-10 w-full">
          <div>
            <img src={tfLogo} alt="Transformers Logo" className="h-16" />
          </div>
          <h1 className="font-display text-4xl font-bold text-stone-50">Battlefield</h1>
        </header>
    )
}