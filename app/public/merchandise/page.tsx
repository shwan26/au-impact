import ProductList from '@/components/cards/ProductCard';

export default function MerchPage() {
  return (
    <div className="grid">
      <h1>Merchandise</h1>
      {/* Simple example list via ProductCard demo */}
      <div className="grid" style={{gridTemplateColumns:'repeat(auto-fill, minmax(240px, 1fr))'}}>
        <ProductList id="1" title="Club Tee" price={299} />
        <ProductList id="2" title="Sticker Pack" price={59} />
      </div>
    </div>
  );
}
