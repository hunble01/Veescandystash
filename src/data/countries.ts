// Countries customers can ship to (Vee, 2026-11-09: worldwide). ISO codes;
// names come from the browser in English. Canada and the US are listed first.
// Canada Post says at checkout if it can't ship somewhere.
const codes =
  "AD AE AG AI AL AM AO AR AT AU AW AZ BA BB BD BE BF BG BH BI BJ BM BN BO BR BS BT BW BZ CH CI CK CL CM CN CO CR CV CY CZ DE DJ DK DM DO DZ EC EE EG ES ET FI FJ FK FO FR GA GB GD GE GF GH GI GL GM GN GP GQ GR GT GU GW GY HK HN HR HT HU ID IE IL IN IS IT JM JO JP KE KG KH KI KM KN KR KW KY KZ LA LB LC LI LK LS LT LU LV MA MC MD ME MG MK ML MN MO MQ MR MS MT MU MV MW MX MY MZ NA NC NE NG NI NL NO NP NZ OM PA PE PF PG PH PK PL PM PT PY QA RE RO RS RW SA SB SC SE SG SI SK SL SM SN SR ST SV SZ TC TD TG TH TJ TL TM TN TO TR TT TV TW TZ UA UG UY UZ VC VE VG VN VU WS ZA ZM ZW".split(" ");

export function countryOptions(): { code: string; name: string }[] {
  let names: Intl.DisplayNames | null = null;
  try {
    names = new Intl.DisplayNames(["en-CA"], { type: "region" });
  } catch {
    // Very old browsers: show the codes.
  }
  const name = (c: string) => names?.of(c) ?? c;
  const rest = codes.map((code) => ({ code, name: name(code) })).sort((a, b) => a.name.localeCompare(b.name));
  return [{ code: "CA", name: "Canada" }, { code: "US", name: "United States" }, ...rest];
}

export const POSTAL_RULES: Record<string, { re: RegExp; example: string; label: string }> = {
  CA: { re: /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z] ?\d[ABCEGHJ-NPRSTV-Z]\d$/i, example: "L6A 1A1", label: "Postal code" },
  US: { re: /^\d{5}(-\d{4})?$/, example: "90210", label: "ZIP code" },
};
