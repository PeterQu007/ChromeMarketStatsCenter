// URL for saving REBGV stat data
const SAVE_URL_LOCAL = "http://localhost/pidrealty4/wp-content/themes/realhomes-child-3/db/saveStatData.php";
const SAVE_URL_REMOTE = "https://pidhomes.ca/wp-content/themes/realhomes-child-3/db/saveStatData.php";
const SEARCH_URL_STAT_CODE_LOCAL =
  "http://localhost/pidrealty4/wp-content/themes/realhomes-child-3/db/searchStatCode.php";
const SEARCH_URL_STAT_CODE_REMOTE = "https://pidhomes.ca/wp-content/themes/realhomes-child-3/db/searchStatCode.php";
const UPDATE_URL_STAT_CODE_LOCAL =
  "http://localhost/pidrealty4/wp-content/themes/realhomes-child-3/db/updateStatCode.php";
const UPDATE_URL_STAT_CODE_REMOTE = "https://pidhomes.ca/wp-content/themes/realhomes-child-3/db/updateStatCode.php";
const UPDATE_URL_STAT_DATE_POINTERS_LOCAL =
  "http://localhost/pidrealty4/wp-content/themes/realhomes-child-3/db/updateStatDatePointers.php";
const UPDATE_URL_STAT_DATE_POINTERS_REMOTE =
  "https://pidhomes.ca/wp-content/themes/realhomes-child-3/db/updateStatDatePointers.php";
const UPDATE_URL_RE_MARKET_PIVOT_LOCAL =
  "http://localhost/pidrealty4/wp-content/themes/realhomes-child-3/db/updateREMarketPivotTable.php";
const UPDATE_URL_RE_MARKET_PIVOT_REMOTE =
  "https://pidhomes.ca/wp-content/themes/realhomes-child-3/db/updateREMarketPivotTable.php";
const UPDATE_URL_RE_MARKET_MONTHLY_REPORT_LOCAL =
  "http://localhost/pidrealty4/wp-content/themes/realhomes-child-3/db/updateREMarketMonthlyReportData.php";
const UPDATE_URL_RE_MARKET_MONTHLY_REPORT_REMOTE =
  "https://pidhomes.ca/wp-content/themes/realhomes-child-3/db/updateREMarketMonthlyReportData.php";

// ERROR MESSAGES
const ERROR_MESSAGE_NO_DATA = "Warning: No StatsData, Try Again!";
const ERROR_MESSAGE_DATA_FATAL = "Fatal Error: StatsData Server Failed";
const ERROR_MESSAGE_DATA_FAILED = "DataRequest Error: StatsData Request Failed";
const ERROR_MESSAGE_NO_ERROR = "";
const ERROR_MESSAGE_DATA_OK = "StatsData Request Succeed";
const MSG_CORRECT_STAT_DATA = "Correct StatsData Returned";
const ERROR_MESSAGE_NO_STAT_DATA = "NO_STATS_DATA";
const REQUEST_TRIES = 2;
const MORE_DATA_REMAINING = "More DataParts Remaining";

// Stats Centre groupCodes for HPI
const GroupCodes = ["#0=|", "#0=pt:2|", "#0=pt:8|", "#0=pt:4|"];
const PropertyTypes = ["All", "Detached", "Townhouse", "Apartment"];
const StatsPeriod = { monthly_update: "1", max_update: "3" }; // 1 for 24 months stats data; 3 for 48 months stats data

const GetPropertyType = (groupCode) => PropertyTypes[GroupCodes.indexOf(groupCode)];
const GetGroupCode = (propertyType) => GroupCodes[PropertyTypes.indexOf(propertyType)];

const GlobalRequestParams = {
  ac: "f7b8525e800647a5aab99bfa9c2bb2f7",
  cid: "D6CFF8B05780494FB914B1A270A55F0F",
  s: "b23a1bcecaa648dea9ce46946b16d062",
};

// AreaCodes : Stat_Code - mapped in table wp_pid_stats_code
// Real Estate Board's area code is not unique for some reason
// However stat_code is unique for every area / neighborhood
const AreaCodes = [
  "FVREB", //stat_code : 5008
  "REBGV", //stat_code : 5009
  "F10", //stat_code : 5035
  "F20",
  "F30",
  "F30A",
  "F40",
  "F50",
  "F54A",
  "F60A",
  "F70A",
  "F80A",
  "VBU", // Burnaby
  "VVA", // Vancouver
  "VBD",
  "VBE",
  "VBN",
  "VBS",
  "VCQ",
  "VIS",
  "VLD",
  "VMR",
  "VNV",
  "VNW",
  "VPE",
  "VPI",
  "VPM",
  "VPQ",
  "VRI",
  "VSC",
  "VSQ",
  "VTW",
  "VVE",
  "VVW",
  "VWH",
  "VWV",
  "F6A",
  "F11",
  "F12",
  "F13",
  "F14",
  "F21",
  "F22",
  "F23",
  "F24",
  "F25",
  "F26",
  "F27",
  "F28",
  "F31",
  "F32",
  "F34",
  "F36",
  "F37",
  "F38",
  "F39",
  "F41",
  "F42",
  "F43",
  "F51",
  "F52",
  "F53",
  "F54",
  "F55",
  "F56",
  "F57",
  "F58",
  "F59",
  "F60",
  "F61",
  "F62",
  "F63",
  "F64",
  "F65",
  "F66",
  "F67",
  "F68",
  "F69",
  "F70",
  "F71",
  "F72",
  "F73",
  "F74",
  "F75",
  "F76",
  "F77",
  "F78",
  "F80",
  "F81",
  "F82",
  "F83",
  "F84",
  "F85",
  "F86",
  "F87",
  "F88",
  "VBDBD",
  "VBEBE",
  "VBECR",
  "VBEED",
  "VBNBP",
  "VBNCA",
  "VBNCB",
  "VBNCH",
  "VBNFH",
  "VBNGR",
  "VBNMO",
  "VBNOK",
  "VBNPC",
  "VBNSD",
  "VBNSF",
  "VBNSH",
  "VBNSI",
  "VBNVH",
  "VBNWH",
  "VBNWR",
  "VBSBB",
  "VBSBH",
  "VBSBK",
  "VBSBL",
  "VBSCP",
  "VBSDL",
  "VBSDP",
  "VBSFG",
  "VBSGT",
  "VBSGV",
  "VBSHG",
  "VBSME",
  "VBSOL",
  "VBSSC",
  "VBSSS",
  "VBSUD",
  "VCQBM",
  "VCQCC",
  "VCQCE",
  "VCQCH",
  "VCQCS",
  "VCQCW",
  "VCQCY",
  "VCQER",
  "VCQHC",
  "VCQHO",
  "VCQHP",
  "VCQMB",
  "VCQML",
  "VCQNC",
  "VCQNH",
  "VCQPR",
  "VCQRP",
  "VCQRS",
  "VCQSC",
  "VCQSV",
  "VCQUE",
  "VCQWP",
  "VCQWS",
  "VISGB",
  "VISGL",
  "VISMA",
  "VISOT",
  "VISPE",
  "VISSS",
  "VISST",
  "VLDDM",
  "VLDEA",
  "VLDHA",
  "VLDHO",
  "VLDLA",
  "VLDLE",
  "VLDNG",
  "VLDPG",
  "VLDTB",
  "VLDWI",
  "VMRAL",
  "VMRCO",
  "VMREC",
  "VMRNE",
  "VMRNO",
  "VMRNW",
  "VMRSV",
  "VMRSW",
  "VMRTH",
  "VMRWB",
  "VMRWC",
  "VMRWH",
  "VNVBD",
  "VNVBL",
  "VNVBR",
  "VNVCA",
  "VNVCL",
  "VNVCV",
  "VNVCY",
  "VNVDC",
  "VNVDE",
  "VNVDO",
  "VNVED",
  "VNVFH",
  "VNVGW",
  "VNVHS",
  "VNVIA",
  "VNVIR",
  "VNVLL",
  "VNVLV",
  "VNVLY",
  "VNVMC",
  "VNVNG",
  "VNVNL",
  "VNVPH",
  "VNVPN",
  "VNVPP",
  "VNVQU",
  "VNVRP",
  "VNVSY",
  "VNVTE",
  "VNVUD",
  "VNVUL",
  "VNVWL",
  "VNVWP",
  "VNVWS",
  "VNVWT",
  "VNWCH",
  "VNWDT",
  "VNWFV",
  "VNWGN",
  "VNWMP",
  "VNWNA",
  "VNWQB",
  "VNWQP",
  "VNWQY",
  "VNWSA",
  "VNWTH",
  "VNWUP",
  "VNWWE",
  "VPEBI",
  "VPEDE",
  "VPEDY",
  "VPEIL",
  "VPELL",
  "VPEMC",
  "VPEOR",
  "VPEPC",
  "VPEPE",
  "VPEPM",
  "VPEWE",
  "VPICM",
  "VPIMM",
  "VPINM",
  "VPISM",
  "VPIWM",
  "VPMAN",
  "VPMBL",
  "VPMBS",
  "VPMCP",
  "VPMGL",
  "VPMHM",
  "VPMHW",
  "VPMIO",
  "VPMMM",
  "VPMNS",
  "VPMPM",
  "VPQBL",
  "VPQCE",
  "VPQCI",
  "VPQGL",
  "VPQLM",
  "VPQLP",
  "VPQMH",
  "VPQOH",
  "VPQRD",
  "VPQWA",
  "VRI10",
  "VRI11",
  "VRI12",
  "VRI13",
  "VRI20",
  "VRI21",
  "VRI22",
  "VRI23",
  "VRI30",
  "VRI31",
  "VRI32",
  "VRI40",
  "VRI41",
  "VRI42",
  "VRI43",
  "VRI50",
  "VRI51",
  "VRI52",
  "VRI53",
  "VRI54",
  "VRI60",
  "VRI61",
  "VRI62",
  "VRI70",
  "VRI71",
  "VRI72",
  "VRI80",
  "VRI81",
  "VRI90",
  "VSCGB",
  "VSCGM",
  "VSCHB",
  "VSCKE",
  "VSCNE",
  "VSCPE",
  "VSCRC",
  "VSCSD",
  "VSQBB",
  "VSQBC",
  "VSQBR",
  "VSQDT",
  "VSQDV",
  "VSQGE",
  "VSQGH",
  "VSQHH",
  "VSQNY",
  "VSQPL",
  "VSQPV",
  "VSQRC",
  "VSQSR",
  "VSQTA",
  "VSQUH",
  "VSQUS",
  "VSQVC",
  "VTWBB",
  "VTWBG",
  "VTWCD",
  "VTWCT",
  "VTWEB",
  "VTWPH",
  "VTWTE",
  "VTWTN",
  "VVECH",
  "VVECO",
  "VVEDT",
  "VVEFR",
  "VVEFV",
  "VVEGW",
  "VVEHA",
  "VVEKL",
  "VVEKN",
  "VVEMN",
  "VVEMP",
  "VVERE",
  "VVERH",
  "VVESM",
  "VVEST",
  "VVESU",
  "VVESV",
  "VVEVI",
  "VVWAR",
  "VVWCA",
  "VVWCB",
  "VVWDT",
  "VVWDU",
  "VVWFA",
  "VVWFC",
  "VVWKE",
  "VVWKT",
  "VVWMH",
  "VVWMP",
  "VVWMR",
  "VVWOA",
  "VVWPG",
  "VVWQU",
  "VVWSC",
  "VVWSG",
  "VVWSH",
  "VVWSL",
  "VVWSW",
  "VVWUL",
  "VVWWE",
  "VVWYA",
  "VWHAM",
  "VWHAV",
  "VWHBA",
  "VWHBE",
  "VWHBH",
  "VWHBR",
  "VWHBT",
  "VWHCC",
  "VWHCE",
  "VWHCH",
  "VWHCR",
  "VWHEE",
  "VWHFJ",
  "VWHGL",
  "VWHNE",
  "VWHNO",
  "VWHRW",
  "VWHSC",
  "VWHSG",
  "VWHVI",
  "VWHWE",
  "VWHWG",
  "VWHWW",
  "VWVAL",
  "VWVAM",
  "VWVBP",
  "VWVBR",
  "VWVCA",
  "VWVCB",
  "VWVCD",
  "VWVCE",
  "VWVCP",
  "VWVCW",
  "VWVCY",
  "VWVDR",
  "VWVDU",
  "VWVEH",
  "VWVER",
  "VWVFC",
  "VWVGL",
  "VWVGM",
  "VWVHB",
  "VWVHS",
  "VWVLB",
  "VWVOC",
  "VWVPA",
  "VWVPR",
  "VWVPV",
  "VWVQU",
  "VWVRR",
  "VWVSC",
  "VWVSH",
  "VWVUC",
  "VWVWB",
  "VWVWC",
  "VWVWE",
  "VWVWH",
  "VWVWM",
];
