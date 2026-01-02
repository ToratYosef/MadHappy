import { CartItem } from "@/store/cart";
import { cartSubtotal } from "@/store/cart";
import { formatPrice } from "@/lib/utils";

type Props = {
  items: CartItem[];
  onCheckout: () => void;
  loading?: boolean;
};

export function CartSummary({ items, onCheckout, loading }: Props) {
  const subtotal = cartSubtotal(items);

  return (
    <div className="rounded-2xl bg-forest text-background shadow-soft">
      <div className="flex flex-col gap-3 border-b border-background/20 px-6 py-4">
        <div className="flex items-center justify-between text-sm uppercase tracking-wide">
          <span>Subtotal</span>
          <span className="font-semibold">{formatPrice(subtotal)}</span>
        </div>
        <p className="text-sm text-background/80">
          Shipping calculated at checkout. Duties covered where applicable.
        </p>
      </div>
      <div className="p-6">
        <button
          onClick={onCheckout}
          disabled={!items.length || loading}
          className="w-full rounded-full bg-background px-6 py-3 text-ink transition hover:-translate-y-[1px] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Redirecting..." : "Checkout"}
        </button>
      </div>
    </div>
  );
}
