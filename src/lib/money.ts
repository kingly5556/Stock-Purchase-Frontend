export function formatSatang(satang: number): string {
  return (satang / 100).toLocaleString("th-TH", {
    style: "currency",
    currency: "THB",
  });
}
