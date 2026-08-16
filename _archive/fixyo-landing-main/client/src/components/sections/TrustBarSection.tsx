/* FixYo Trust Bar — Warm Modernism
 * Subtle section showing Australian brand references and security badges
 */
export default function TrustBarSection() {
  const brands = [
    "Caroma", "Clipsal", "Dulux", "Daikin", "Rinnai", "Monier", "Boral", "Colorbond",
  ];

  return (
    <section className="bg-white border-y border-[#1B2B4B]/6 py-8">
      <div className="container">
        <div className="flex flex-col items-center gap-5">
          <p className="text-[#64748B] text-xs font-medium uppercase tracking-widest text-center">
            Pricing data references real Australian brands
          </p>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3">
            {brands.map((brand) => (
              <span
                key={brand}
                className="text-[#1B2B4B]/30 font-['Sora'] font-bold text-sm tracking-wide hover:text-[#1B2B4B]/60 transition-colors"
              >
                {brand}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
