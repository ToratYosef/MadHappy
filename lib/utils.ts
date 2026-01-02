export const formatPrice = (amount: number, currency = "USD"): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0
  }).format(amount / 100);

export const cn = (...classes: Array<string | undefined | false>) =>
  classes.filter(Boolean).join(" ");
