const unmasked = [
  // Row 2: Top of Ras Al Khaimah (Sha'am)
  "28",
  // Row 3: Umm Al Quwain, Ras Al Khaimah, Dibba
  "37", "38", "39",
  // Row 4: Das Island/Offshore, Dubai coastal, Dubai/E66, Sharjah/Al Madam, Fujairah
  "44", "45", "46", "47", "48", "49",
  // Row 5: Al Sila, Sir Bani Yas/Delma, Al Mirfa coast, Tarif coast, Abu Dhabi capital, Sweihan, Al Faqa, Hatta
  "52", "53", "54", "55", "56", "57", "58", "59",
  // Row 6: Ghuwaifat, Ruwais, Baynunah, Habshan, Zayed City, Remah, Al Ain, Al Ain East
  "62", "63", "64", "65", "66", "67", "68", "69",
  // Row 7: Western border, Al Dhafra desert, Bu Hasa, Madinat Zayed south, Liwa Crescent, Al Qua'a, Umm az-Zamul north
  "72", "73", "74", "75", "76", "77", "78",
  // Row 8: Southern border, Shah/Asab, Moreeb Dune, Hameem south, Arada/Tri-border
  "83", "84", "85", "86", "87"
];

console.log("Total unmasked cells:", unmasked.length);
console.log("Total masked cells:", 100 - unmasked.length);

console.log("\n10x10 Grid Map (█ = UAE Unmasked, · = Masked/Disabled):");
console.log("   0 1 2 3 4 5 6 7 8 9");
for (let r = 0; r < 10; r++) {
  let rowStr = `${r}: `;
  for (let c = 0; c < 10; c++) {
    const id = `${r}${c}`;
    if (unmasked.includes(id)) {
      rowStr += "██";
    } else {
      rowStr += "··";
    }
  }
  console.log(rowStr);
}
