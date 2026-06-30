import { useEffect, useState } from "react";
import { portfolioService } from "../services/api";

export default function FeaturedPortfolioPage() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const data = await portfolioService.featured();
      setItems(data || []);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div>
      <h2>Featured Portfolio</h2>

      {items.map((item) => (
        <div key={item.id}>
          <h3>{item.title}</h3>
          <p>{item.description}</p>

          {item.url && <a href={item.url}>Source Code</a>}

          {item.liveUrl && <a href={item.liveUrl}>Live Demo</a>}
        </div>
      ))}
    </div>
  );
}
