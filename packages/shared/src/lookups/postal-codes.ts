export type PostalCodeInfo = {
	areaLabel: string;
	district: string;
};

export const POSTAL_CODE_MAP: Record<string, PostalCodeInfo> = {
	// Helsinki — Eteläinen (Southern)
	"00100": { areaLabel: "Kruununhaka (00100)", district: "Eteläinen Helsinki" },
	"00120": { areaLabel: "Punavuori (00120)", district: "Eteläinen Helsinki" },
	"00130": { areaLabel: "Kaartinkaupunki (00130)", district: "Eteläinen Helsinki" },
	"00140": { areaLabel: "Kaivopuisto (00140)", district: "Eteläinen Helsinki" },
	"00150": { areaLabel: "Eira / Hernesaari (00150)", district: "Eteläinen Helsinki" },
	"00160": { areaLabel: "Katajanokka (00160)", district: "Eteläinen Helsinki" },
	"00170": { areaLabel: "Kruununhaka / Hakaniemi (00170)", district: "Eteläinen Helsinki" },
	"00180": { areaLabel: "Kamppi / Ruoholahti / Jätkäsaari (00180)", district: "Eteläinen Helsinki" },
	"00190": { areaLabel: "Suomenlinna (00190)", district: "Eteläinen Helsinki" },

	// Helsinki — Läntinen (Western)
	"00200": { areaLabel: "Lauttasaari (00200)", district: "Läntinen Helsinki" },
	"00210": { areaLabel: "Lauttasaari (00210)", district: "Läntinen Helsinki" },
	"00220": { areaLabel: "Jätkäsaari / Munkkisaari (00220)", district: "Läntinen Helsinki" },
	"00240": { areaLabel: "Munkkiniemi (00240)", district: "Läntinen Helsinki" },
	"00250": { areaLabel: "Ruskeasuo (00250)", district: "Läntinen Helsinki" },
	"00260": { areaLabel: "Lehtisaari / Kuusisaari (00260)", district: "Läntinen Helsinki" },
	"00270": { areaLabel: "Munkkivuori / Niemenmäki (00270)", district: "Läntinen Helsinki" },
	"00280": { areaLabel: "Lassila (00280)", district: "Läntinen Helsinki" },
	"00300": { areaLabel: "Pikku Huopalahti (00300)", district: "Läntinen Helsinki" },
	"00310": { areaLabel: "Kivihaka (00310)", district: "Läntinen Helsinki" },
	"00320": { areaLabel: "Kaarela / Vanha-Kaartela (00320)", district: "Läntinen Helsinki" },
	"00330": { areaLabel: "Kuninkaantammi (00330)", district: "Läntinen Helsinki" },
	"00340": { areaLabel: "Kannelmäki (00340)", district: "Läntinen Helsinki" },
	"00350": { areaLabel: "Lassila (00350)", district: "Läntinen Helsinki" },
	"00740": { areaLabel: "Konala (00740)", district: "Läntinen Helsinki" },

	// Helsinki — Pohjoinen (Northern)
	"00290": { areaLabel: "Maunula (00290)", district: "Pohjoinen Helsinki" },
	"00360": { areaLabel: "Paloheinä (00360)", district: "Pohjoinen Helsinki" },
	"00370": { areaLabel: "Pakila (00370)", district: "Pohjoinen Helsinki" },
	"00380": { areaLabel: "Torpparinmäki (00380)", district: "Pohjoinen Helsinki" },
	"00390": { areaLabel: "Oulunkylä (00390)", district: "Pohjoinen Helsinki" },
	"00400": { areaLabel: "Oulunkylä / Patola (00400)", district: "Pohjoinen Helsinki" },
	"00620": { areaLabel: "Metsälä / Etelä-Oulunkylä (00620)", district: "Pohjoinen Helsinki" },
	"00630": { areaLabel: "Maunula / Pirkkola (00630)", district: "Pohjoinen Helsinki" },
	"00640": { areaLabel: "Oulunkylä (00640)", district: "Pohjoinen Helsinki" },

	// Helsinki — Koillinen (Northeastern)
	"00410": { areaLabel: "Malmi (00410)", district: "Koillinen Helsinki" },
	"00420": { areaLabel: "Malmi (00420)", district: "Koillinen Helsinki" },
	"00430": { areaLabel: "Malmi (00430)", district: "Koillinen Helsinki" },
	"00440": { areaLabel: "Koskela (00440)", district: "Koillinen Helsinki" },
	"00520": { areaLabel: "Käpylä (00520)", district: "Koillinen Helsinki" },
	"00560": { areaLabel: "Toukola / Vanhakaupunki (00560)", district: "Koillinen Helsinki" },
	"00600": { areaLabel: "Kumpula / Arabianranta (00600)", district: "Koillinen Helsinki" },
	"00610": { areaLabel: "Käpylä (00610)", district: "Koillinen Helsinki" },
	"00650": { areaLabel: "Veräjämäki (00650)", district: "Koillinen Helsinki" },
	"00660": { areaLabel: "Pukinmäki (00660)", district: "Koillinen Helsinki" },
	"00670": { areaLabel: "Pukinmäki (00670)", district: "Koillinen Helsinki" },
	"00680": { areaLabel: "Malmi (00680)", district: "Koillinen Helsinki" },
	"00690": { areaLabel: "Puistola (00690)", district: "Koillinen Helsinki" },
	"00750": { areaLabel: "Latokartano (00750)", district: "Koillinen Helsinki" },
	"00760": { areaLabel: "Suurmetsä (00760)", district: "Koillinen Helsinki" },
	"00770": { areaLabel: "Jakomäki (00770)", district: "Koillinen Helsinki" },
	"00780": { areaLabel: "Tapaninkylä (00780)", district: "Koillinen Helsinki" },
	"00790": { areaLabel: "Viikki (00790)", district: "Koillinen Helsinki" },

	// Helsinki — Keskinen (Central)
	"00500": { areaLabel: "Sörnäinen / Harju (00500)", district: "Keskinen Helsinki" },
	"00510": { areaLabel: "Alppiharju (00510)", district: "Keskinen Helsinki" },
	"00530": { areaLabel: "Kallio (00530)", district: "Keskinen Helsinki" },
	"00540": { areaLabel: "Kallio (00540)", district: "Keskinen Helsinki" },
	"00550": { areaLabel: "Vallila / Hermanni (00550)", district: "Keskinen Helsinki" },
	"00580": { areaLabel: "Kalasatama (00580)", district: "Keskinen Helsinki" },

	// Helsinki — Kaakkoinen (Southeastern)
	"00570": { areaLabel: "Kulosaari (00570)", district: "Kaakkoinen Helsinki" },
	"00700": { areaLabel: "Kulosaari / Tammisalo (00700)", district: "Kaakkoinen Helsinki" },
	"00710": { areaLabel: "Herttoniemi (00710)", district: "Kaakkoinen Helsinki" },
	"00720": { areaLabel: "Roihuvuori (00720)", district: "Kaakkoinen Helsinki" },
	"00730": { areaLabel: "Tammisalo (00730)", district: "Kaakkoinen Helsinki" },
	"00800": { areaLabel: "Roihupelto / Herttoniemi (00800)", district: "Kaakkoinen Helsinki" },
	"00810": { areaLabel: "Vartiokylä / Puotila (00810)", district: "Kaakkoinen Helsinki" },
	"00820": { areaLabel: "Roihuvuori / Marjaniemi (00820)", district: "Kaakkoinen Helsinki" },
	"00850": { areaLabel: "Laajasalo (00850)", district: "Kaakkoinen Helsinki" },
	"00860": { areaLabel: "Laajasalo / Yliskylä (00860)", district: "Kaakkoinen Helsinki" },

	// Helsinki — Itäinen (Eastern)
	"00830": { areaLabel: "Mellunkylä (00830)", district: "Itäinen Helsinki" },
	"00840": { areaLabel: "Vuosaari (00840)", district: "Itäinen Helsinki" },
	"00870": { areaLabel: "Mellunmäki (00870)", district: "Itäinen Helsinki" },
	"00880": { areaLabel: "Myllypuro (00880)", district: "Itäinen Helsinki" },
	"00900": { areaLabel: "Kontula (00900)", district: "Itäinen Helsinki" },
	"00910": { areaLabel: "Vesala (00910)", district: "Itäinen Helsinki" },
	"00920": { areaLabel: "Vartioharju (00920)", district: "Itäinen Helsinki" },
	"00930": { areaLabel: "Kivikko (00930)", district: "Itäinen Helsinki" },
	"00940": { areaLabel: "Kontula (00940)", district: "Itäinen Helsinki" },
	"00950": { areaLabel: "Itäkeskus / Puotinharju (00950)", district: "Itäinen Helsinki" },
	"00960": { areaLabel: "Vuosaari (00960)", district: "Itäinen Helsinki" },
	"00970": { areaLabel: "Mellunmäki (00970)", district: "Itäinen Helsinki" },
	"00980": { areaLabel: "Vuosaari (00980)", district: "Itäinen Helsinki" },
	"00990": { areaLabel: "Vuosaari (00990)", district: "Itäinen Helsinki" },

	// TODO: 00450–00490 (Suutarila, Siltamäki, Töyrynummi) not yet mapped

	// Espoo — Tapiola
	"02100": { areaLabel: "Tapiola (02100)", district: "Tapiola" },
	"02110": { areaLabel: "Tapiola (02110)", district: "Tapiola" },
	"02120": { areaLabel: "Tapiola (02120)", district: "Tapiola" },
	"02130": { areaLabel: "Tapiola (02130)", district: "Tapiola" },
	"02150": { areaLabel: "Otaniemi (02150)", district: "Tapiola" },
	"02160": { areaLabel: "Haukilahti / Westend (02160)", district: "Tapiola" },

	// Espoo — Leppävaara
	"02170": { areaLabel: "Laajalahti (02170)", district: "Leppävaara" },
	"02180": { areaLabel: "Mankkaa (02180)", district: "Leppävaara" },
	"02300": { areaLabel: "Leppävaara / Sello (02300)", district: "Leppävaara" },
	"02320": { areaLabel: "Perkkaa (02320)", district: "Leppävaara" },
	"02330": { areaLabel: "Leppävaara (02330)", district: "Leppävaara" },
	"02340": { areaLabel: "Lintuvaara (02340)", district: "Leppävaara" },
	"02360": { areaLabel: "Kilo (02360)", district: "Leppävaara" },
	"02380": { areaLabel: "Laaksolahti (02380)", district: "Leppävaara" },

	// Espoo — Matinkylä-Olari
	"02230": { areaLabel: "Matinkylä (02230)", district: "Matinkylä-Olari" },
	"02240": { areaLabel: "Matinkylä (02240)", district: "Matinkylä-Olari" },
	"02250": { areaLabel: "Niittykumpu (02250)", district: "Matinkylä-Olari" },
	"02750": { areaLabel: "Olari (02750)", district: "Matinkylä-Olari" },
	"02760": { areaLabel: "Olari (02760)", district: "Matinkylä-Olari" },

	// Espoo — Espoonlahti
	"02140": { areaLabel: "Kaitaa / Henttaa (02140)", district: "Espoonlahti" },
	"02260": { areaLabel: "Espoonlahti (02260)", district: "Espoonlahti" },
	"02270": { areaLabel: "Espoonlahti (02270)", district: "Espoonlahti" },
	"02280": { areaLabel: "Soukka (02280)", district: "Espoonlahti" },
	"02290": { areaLabel: "Nöykkiö (02290)", district: "Espoonlahti" },

	// Espoo — Espoon keskus
	"02200": { areaLabel: "Espoon keskus (02200)", district: "Espoon keskus" },
	"02210": { areaLabel: "Gröndal (02210)", district: "Espoon keskus" },
	"02600": { areaLabel: "Espoon keskus (02600)", district: "Espoon keskus" },
	"02610": { areaLabel: "Espoon keskus (02610)", district: "Espoon keskus" },
	"02630": { areaLabel: "Espoon keskus (02630)", district: "Espoon keskus" },
	"02650": { areaLabel: "Espoon keskus (02650)", district: "Espoon keskus" },

	// TODO: 02400–02530 (Kirkkonummi border areas) not yet mapped

	// Vantaa — Tikkurila
	"01300": { areaLabel: "Tikkurila (01300)", district: "Tikkurila" },
	"01350": { areaLabel: "Tikkurila (01350)", district: "Tikkurila" },
	"01360": { areaLabel: "Rekola (01360)", district: "Tikkurila" },

	// Vantaa — Myyrmäki
	"01400": { areaLabel: "Vantaanlaakso (01400)", district: "Myyrmäki" },
	"01410": { areaLabel: "Myyrmäki (01410)", district: "Myyrmäki" },
	"01420": { areaLabel: "Myyrmäki (01420)", district: "Myyrmäki" },
	"01430": { areaLabel: "Hämevaara (01430)", district: "Myyrmäki" },
	"01450": { areaLabel: "Varisto (01450)", district: "Myyrmäki" },
	"01480": { areaLabel: "Kaivoksela (01480)", district: "Myyrmäki" },
	"01490": { areaLabel: "Martinlaakso (01490)", district: "Myyrmäki" },
	"01680": { areaLabel: "Vantaankoski (01680)", district: "Myyrmäki" },
	"01700": { areaLabel: "Hämeenkylä (01700)", district: "Myyrmäki" },
	"01710": { areaLabel: "Hämeenkylä (01710)", district: "Myyrmäki" },
	"01720": { areaLabel: "Askisto (01720)", district: "Myyrmäki" },

	// Vantaa — Aviapolis
	"01510": { areaLabel: "Aviapolis (01510)", district: "Aviapolis" },
	"01520": { areaLabel: "Pakkala (01520)", district: "Aviapolis" },
	"01530": { areaLabel: "Viinikkala (01530)", district: "Aviapolis" },
	"01730": { areaLabel: "Petikko (01730)", district: "Aviapolis" },
	"01760": { areaLabel: "Kivistö (01760)", district: "Aviapolis" },
	"01770": { areaLabel: "Kivistö (01770)", district: "Aviapolis" },

	// Vantaa — Korso-Koivukylä
	"01370": { areaLabel: "Koivukylä (01370)", district: "Korso-Koivukylä" },
	"01380": { areaLabel: "Asola (01380)", district: "Korso-Koivukylä" },
	"01390": { areaLabel: "Korso (01390)", district: "Korso-Koivukylä" },

	// Vantaa — Hakunila
	"01600": { areaLabel: "Hakunila (01600)", district: "Hakunila" },
	"01610": { areaLabel: "Hakunila (01610)", district: "Hakunila" },
	"01620": { areaLabel: "Hakunila (01620)", district: "Hakunila" },

	// TODO: 01740–01750 (Keimola) not yet mapped
};

export function lookupPostalCode(code: string): PostalCodeInfo | undefined {
	return POSTAL_CODE_MAP[code];
}
