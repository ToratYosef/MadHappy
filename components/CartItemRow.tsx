import Image from "next/image";
import { CartItem, useCart } from "@/store/cart";
import { formatPrice } from "@/lib/utils";

type Props = {
  item: CartItem;
};

export function CartItemRow({ item }: Props) {
  const updateQty = useCart((state) => state.updateQty);
  const removeItem = useCart((state) => state.removeItem);

  const handleQtyChange = (qty: number) => {
    if (qty < 1) return;
    updateQty(item.id, item.size, qty);
  };

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-white/70 p-4 shadow-sm sm:flex-row sm:items-center sm:gap-6">
      <div className="relative h-24 w-24 overflow-hidden rounded-xl bg-ink/5">
        <Image
          src={item.image}
          alt={item.name}
          fill
          sizes="96px"
          className="object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-medium">{item.name}</p>
            <p className="text-sm text-ink/60">Size {item.size}</p>
          </div>
          <p className="font-semibold">{formatPrice(item.price)}</p>
        </div>
        <div className="flex items-center justify-between pt-2 text-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleQtyChange(item.qty - 1)}
              className="rounded-full border border-ink/20 px-3 py-1 transition hover:border-forest"
            >
              −
            </button>
            <span className="min-w-[32px] text-center font-semibold">{item.qty}</span>
            <button
              onClick={() => handleQtyChange(item.qty + 1)}
              className="rounded-full border border-ink/20 px-3 py-1 transition hover:border-forest"
            >
              +
            </button>
          </div>
          <button
            onClick={() => removeItem(item.id, item.size)}
            className="text-ink/60 underline-offset-4 transition hover:text-forest hover:underline"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
