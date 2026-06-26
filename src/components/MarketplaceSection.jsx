import "./MarketplaceSection.css";

function MarketplaceSection({ children }) {
  return (
    <section className="market-section">
      <div className="market-section__list">{children}</div>
    </section>
  );
}

export default MarketplaceSection;