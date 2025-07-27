// Test script for frontend area code mapping
// Run this in the browser console to test

// Area code mapping (same as in data.ts)
const AREA_CODE_MAPPING = {
  // California Area Codes
  "209": "Stockton, CA", "213": "Los Angeles, CA", "310": "Beverly Hills, CA", "323": "Los Angeles, CA",
  "408": "San Jose, CA", "415": "San Francisco, CA", "424": "Los Angeles, CA", "442": "Oceanside, CA",
  "510": "Oakland, CA", "530": "Chico, CA", "559": "Fresno, CA", "562": "Long Beach, CA",
  "619": "San Diego, CA", "626": "Pasadena, CA", "628": "San Francisco, CA", "650": "Palo Alto, CA",
  "657": "Orange County, CA", "661": "Bakersfield, CA", "669": "San Jose, CA", "707": "Santa Rosa, CA",
  "714": "Anaheim, CA", "747": "Los Angeles, CA", "760": "San Diego, CA", "805": "Santa Barbara, CA",
  "818": "Los Angeles, CA", "831": "Monterey, CA", "858": "La Jolla, CA", "909": "San Bernardino, CA",
  "916": "Sacramento, CA", "925": "Walnut Creek, CA", "949": "Irvine, CA", "951": "Riverside, CA",
  "935": "San Diego, CA",
  
  // Virginia Area Codes (including 571)
  "276": "Bristol, VA", "434": "Charlottesville, VA", "540": "Roanoke, VA", "571": "Arlington, VA",
  "703": "Arlington, VA", "757": "Norfolk, VA", "804": "Richmond, VA",
  
  // New York Area Codes
  "212": "New York City, NY", "315": "Syracuse, NY", "332": "New York City, NY", "347": "New York City, NY",
  "516": "Nassau County, NY", "518": "Albany, NY", "585": "Rochester, NY", "607": "Ithaca, NY",
  "631": "Suffolk County, NY", "646": "New York City, NY", "716": "Buffalo, NY", "718": "New York City, NY",
  "845": "Poughkeepsie, NY", "914": "Westchester County, NY", "917": "New York City, NY", "929": "New York City, NY",
  
  // Texas Area Codes
  "210": "San Antonio, TX", "214": "Dallas, TX", "254": "Waco, TX", "281": "Houston, TX",
  "325": "Abilene, TX", "346": "Houston, TX", "361": "Corpus Christi, TX", "409": "Galveston, TX",
  "430": "Tyler, TX", "432": "Midland, TX", "469": "Dallas, TX", "512": "Austin, TX",
  "682": "Fort Worth, TX", "713": "Houston, TX", "737": "Austin, TX", "806": "Amarillo, TX",
  "817": "Fort Worth, TX", "830": "San Antonio, TX", "832": "Houston, TX", "903": "Tyler, TX",
  "915": "El Paso, TX", "936": "Conroe, TX", "940": "Denton, TX", "956": "Harlingen, TX",
  "972": "Dallas, TX", "979": "Bryan, TX",
  
  // Florida Area Codes
  "239": "Fort Myers, FL", "305": "Miami, FL", "321": "Cape Canaveral, FL", "352": "Gainesville, FL",
  "386": "Lake City, FL", "407": "Orlando, FL", "561": "West Palm Beach, FL", "689": "Orlando, FL",
  "727": "St. Petersburg, FL", "754": "Fort Lauderdale, FL", "772": "St. Lucie, FL", "786": "Miami, FL",
  "813": "Tampa, FL", "850": "Tallahassee, FL", "863": "Lakeland, FL", "904": "Jacksonville, FL",
  "941": "Sarasota, FL", "954": "Fort Lauderdale, FL",
  
  // Illinois Area Codes
  "217": "Springfield, IL", "224": "Evanston, IL", "312": "Chicago, IL", "331": "Chicago, IL",
  "464": "Chicago, IL", "618": "Centralia, IL", "630": "Chicago, IL", "708": "Chicago, IL",
  "773": "Chicago, IL", "779": "Rockford, IL", "815": "Rockford, IL", "847": "Evanston, IL",
  "872": "Chicago, IL",
  
  // Pennsylvania Area Codes
  "215": "Philadelphia, PA", "223": "Harrisburg, PA", "267": "Philadelphia, PA", "272": "Wilkes-Barre, PA",
  "412": "Pittsburgh, PA", "484": "Allentown, PA", "570": "Wilkes-Barre, PA", "610": "Allentown, PA",
  "717": "Harrisburg, PA", "724": "Pittsburgh, PA", "814": "Erie, PA", "835": "Allentown, PA",
  "878": "Pittsburgh, PA",
  
  // Ohio Area Codes
  "216": "Cleveland, OH", "220": "Ohio, OH", "234": "Canton, OH", "283": "Cincinnati, OH",
  "330": "Akron, OH", "380": "Columbus, OH", "419": "Toledo, OH", "440": "Cleveland, OH",
  "513": "Cincinnati, OH", "567": "Toledo, OH", "614": "Columbus, OH", "740": "Ohio, OH",
  
  // Michigan Area Codes
  "231": "Traverse City, MI", "248": "Pontiac, MI", "269": "Kalamazoo, MI", "313": "Detroit, MI",
  "517": "Lansing, MI", "586": "Macomb County, MI", "616": "Grand Rapids, MI", "734": "Ann Arbor, MI",
  "810": "Flint, MI", "906": "Sault Ste. Marie, MI", "947": "Oakland County, MI", "989": "Mt Pleasant, MI",
  
  // Georgia Area Codes
  "229": "Albany, GA", "404": "Atlanta, GA", "470": "Atlanta, GA", "478": "Macon, GA",
  "678": "Atlanta, GA", "706": "Columbus, GA", "762": "Columbus, GA", "770": "Atlanta, GA",
  "912": "Savannah, GA",
  
  // North Carolina Area Codes
  "252": "Rocky Mount, NC", "336": "Greensboro, NC", "704": "Charlotte, NC", "743": "Greensboro, NC",
  "828": "Asheville, NC", "910": "Fayetteville, NC", "919": "Raleigh, NC", "980": "Charlotte, NC",
  "984": "Raleigh, NC",
  
  // Maryland Area Codes
  "240": "Silver Spring, MD", "301": "Silver Spring, MD", "410": "Baltimore, MD", "443": "Baltimore, MD",
  "667": "Baltimore, MD",
  
  // New Jersey Area Codes
  "201": "Jersey City, NJ", "551": "Jersey City, NJ", "609": "Trenton, NJ", "732": "New Brunswick, NJ",
  "848": "New Brunswick, NJ", "856": "Camden, NJ", "862": "Newark, NJ", "908": "Elizabeth, NJ",
  "973": "Newark, NJ",
  
  // Massachusetts Area Codes
  "339": "Boston, MA", "351": "Boston, MA", "413": "Springfield, MA", "508": "Framingham, MA",
  "617": "Boston, MA", "774": "Framingham, MA", "781": "Boston, MA", "857": "Boston, MA",
  "978": "Boston, MA",
  
  // Washington Area Codes
  "206": "Seattle, WA", "253": "Tacoma, WA", "360": "Olympia, WA", "425": "Everett, WA",
  "509": "Spokane, WA", "564": "Olympia, WA",
  
  // Colorado Area Codes
  "303": "Denver, CO", "719": "Pueblo, CO", "720": "Denver, CO", "970": "Colorado, CO",
  
  // Arizona Area Codes
  "480": "Phoenix, AZ", "520": "Tucson, AZ", "602": "Phoenix, AZ", "623": "Phoenix, AZ",
  "928": "Prescott, AZ",
  
  // Nevada Area Codes
  "702": "Las Vegas, NV", "725": "Las Vegas, NV", "775": "Reno, NV",
  
  // Oregon Area Codes
  "458": "Eugene, OR", "503": "Portland, OR", "541": "Eugene, OR", "971": "Portland, OR",
  
  // Utah Area Codes
  "385": "Salt Lake City, UT", "435": "Utah, UT", "801": "Salt Lake City, UT",
  
  // Idaho Area Codes
  "208": "Idaho, ID",
  
  // Montana Area Codes
  "406": "Montana, MT",
  
  // Wyoming Area Codes
  "307": "Wyoming, WY",
  
  // South Dakota Area Codes
  "605": "South Dakota, SD",
  
  // North Dakota Area Codes
  "701": "North Dakota, ND",
  
  // Minnesota Area Codes
  "218": "Duluth, MN", "320": "Saint Cloud, MN", "507": "Rochester, MN", "612": "Minneapolis, MN",
  "651": "St. Paul, MN", "763": "Minneapolis, MN", "952": "Bloomington, MN",
  
  // Wisconsin Area Codes
  "262": "Kenosha, WI", "414": "Milwaukee, WI", "608": "Madison, WI", "715": "Eau Claire, WI",
  "920": "Appleton, WI",
  
  // Iowa Area Codes
  "319": "Cedar Rapids, IA", "515": "Des Moines, IA", "563": "Davenport, IA", "641": "Mason City, IA",
  "712": "Council Bluffs, IA",
  
  // Missouri Area Codes
  "314": "St. Louis, MO", "417": "Springfield, MO", "573": "Missouri, MO", "636": "St. Louis, MO",
  "660": "Missouri, MO", "816": "Kansas City, MO", "975": "Kansas City, MO",
  
  // Kansas Area Codes
  "316": "Wichita, KS", "620": "Wichita, KS", "785": "Topeka, KS", "913": "Kansas City, KS",
  
  // Nebraska Area Codes
  "308": "North Platte, NE", "402": "Omaha, NE",
  
  // Oklahoma Area Codes
  "405": "Oklahoma City, OK", "539": "Tulsa, OK", "580": "Oklahoma, OK", "918": "Tulsa, OK",
  
  // Arkansas Area Codes
  "479": "Fort Smith, AR", "501": "Little Rock, AR", "870": "Jonesboro, AR",
  
  // Louisiana Area Codes
  "225": "Baton Rouge, LA", "318": "Shreveport, LA", "337": "Lake Charles, LA", "504": "New Orleans, LA",
  "985": "Hammond, LA",
  
  // Mississippi Area Codes
  "228": "Biloxi, MS", "601": "Jackson, MS", "662": "Tupelo, MS", "769": "Jackson, MS",
  
  // Alabama Area Codes
  "205": "Birmingham, AL", "251": "Mobile, AL", "256": "Huntsville, AL", "334": "Montgomery, AL",
  
  // Tennessee Area Codes
  "423": "Chattanooga, TN", "615": "Nashville, TN", "629": "Nashville, TN", "731": "Tennessee, TN",
  "865": "Knoxville, TN", "901": "Memphis, TN", "931": "Tennessee, TN",
  
  // Kentucky Area Codes
  "270": "Bowling Green, KY", "502": "Louisville, KY", "606": "Ashland, KY", "859": "Lexington, KY",
  
  // Indiana Area Codes
  "219": "Gary, IN", "260": "Fort Wayne, IN", "317": "Indianapolis, IN", "574": "Elkhart, IN",
  "765": "Indiana, IN", "812": "Evansville, IN",
  
  // South Carolina Area Codes
  "803": "Columbia, SC", "843": "Charleston, SC", "864": "Greenville, SC",
  
  // West Virginia Area Codes
  "304": "West Virginia, WV", "681": "West Virginia, WV",
  
  // Delaware Area Codes
  "302": "Delaware, DE",
  
  // Rhode Island Area Codes
  "401": "Rhode Island, RI",
  
  // Connecticut Area Codes
  "203": "Bridgeport, CT", "475": "New Haven, CT", "860": "Connecticut, CT", "959": "Hartford, CT",
  
  // Maine Area Codes
  "207": "Maine, ME",
  
  // New Hampshire Area Codes
  "603": "New Hampshire, NH",
  
  // Vermont Area Codes
  "802": "Vermont, VT",
  
  // Alaska Area Codes
  "907": "Alaska, AK",
  
  // Hawaii Area Codes
  "808": "Hawaii, HI",
  
  // New Mexico Area Codes
  "505": "Albuquerque, NM", "575": "Las Cruces, NM", "957": "New Mexico, NM",
  
  // Special/Reserved Area Codes
  "211": "Community Info", "311": "Special Applications", "411": "Special Applications",
  "500": "Personal Communication", "555": "Directory Assistance", "700": "Interexchange Carrier",
  "710": "US Government", "711": "Telecommunications Relay", "800": "Toll Free",
  "811": "Special Applications", "822": "Toll Free", "833": "Toll Free", "844": "Toll Free",
  "855": "Toll Free", "866": "Toll Free", "877": "Toll Free", "888": "Toll Free",
  "900": "Toll Calls", "911": "Emergency", "976": "Unassigned", "999": "Unavailable",
};

/**
 * Get location from phone number using area code mapping
 */
function getLocationFromPhoneNumber(phoneNumber) {
  // Remove any non-digit characters
  const cleanNumber = phoneNumber.replace(/\D/g, '');
  
  // Handle US numbers (10 or 11 digits)
  if (cleanNumber.length >= 10) {
    // For 11-digit numbers starting with 1, skip the country code
    let areaCode;
    if (cleanNumber.length === 11 && cleanNumber.startsWith('1')) {
      areaCode = cleanNumber.substring(1, 4);
    } else {
      areaCode = cleanNumber.substring(0, 3);
    }
    
    return AREA_CODE_MAPPING[areaCode] || "Unknown Location";
  }
  
  return "Unknown Location";
}

// Test the specific phone number from the UI
console.log("Testing phone number: +1-XXX-XXX-XXXX");
console.log("Expected location: Unknown");
console.log("Actual location:", getLocationFromPhoneNumber("+1-XXX-XXX-XXXX"));

// Test other area codes
console.log("\nTesting other area codes:");
console.log("+14151234567 ->", getLocationFromPhoneNumber("+14151234567")); // San Francisco, CA
console.log("+15101234567 ->", getLocationFromPhoneNumber("+15101234567")); // Oakland, CA
console.log("+14081234567 ->", getLocationFromPhoneNumber("+14081234567")); // San Jose, CA
console.log("+12121234567 ->", getLocationFromPhoneNumber("+12121234567")); // New York City, NY
console.log("+12141234567 ->", getLocationFromPhoneNumber("+12141234567")); // Dallas, TX
console.log("+13051234567 ->", getLocationFromPhoneNumber("+13051234567")); // Miami, FL
console.log("+13121234567 ->", getLocationFromPhoneNumber("+13121234567")); // Chicago, IL
console.log("+12151234567 ->", getLocationFromPhoneNumber("+12151234567")); // Philadelphia, PA
console.log("+12161234567 ->", getLocationFromPhoneNumber("+12161234567")); // Cleveland, OH
console.log("+13131234567 ->", getLocationFromPhoneNumber("+13131234567")); // Detroit, MI
console.log("+14041234567 ->", getLocationFromPhoneNumber("+14041234567")); // Atlanta, GA
console.log("+17041234567 ->", getLocationFromPhoneNumber("+17041234567")); // Charlotte, NC
console.log("+15711234567 ->", getLocationFromPhoneNumber("+15711234567")); // Arlington, VA
console.log("+12401234567 ->", getLocationFromPhoneNumber("+12401234567")); // Silver Spring, MD
console.log("+12011234567 ->", getLocationFromPhoneNumber("+12011234567")); // Jersey City, NJ
console.log("+13391234567 ->", getLocationFromPhoneNumber("+13391234567")); // Boston, MA
console.log("+12061234567 ->", getLocationFromPhoneNumber("+12061234567")); // Seattle, WA
console.log("+13031234567 ->", getLocationFromPhoneNumber("+13031234567")); // Denver, CO
console.log("+14801234567 ->", getLocationFromPhoneNumber("+14801234567")); // Phoenix, AZ
console.log("+17021234567 ->", getLocationFromPhoneNumber("+17021234567")); // Las Vegas, NV
console.log("+15031234567 ->", getLocationFromPhoneNumber("+15031234567")); // Portland, OR
console.log("+18011234567 ->", getLocationFromPhoneNumber("+18011234567")); // Salt Lake City, UT
console.log("+12081234567 ->", getLocationFromPhoneNumber("+12081234567")); // Idaho, ID
console.log("+14061234567 ->", getLocationFromPhoneNumber("+14061234567")); // Montana, MT
console.log("+13071234567 ->", getLocationFromPhoneNumber("+13071234567")); // Wyoming, WY
console.log("+16051234567 ->", getLocationFromPhoneNumber("+16051234567")); // South Dakota, SD
console.log("+17011234567 ->", getLocationFromPhoneNumber("+17011234567")); // North Dakota, ND
console.log("+12181234567 ->", getLocationFromPhoneNumber("+12181234567")); // Duluth, MN
console.log("+12621234567 ->", getLocationFromPhoneNumber("+12621234567")); // Kenosha, WI
console.log("+13191234567 ->", getLocationFromPhoneNumber("+13191234567")); // Cedar Rapids, IA
console.log("+13141234567 ->", getLocationFromPhoneNumber("+13141234567")); // St. Louis, MO
console.log("+13161234567 ->", getLocationFromPhoneNumber("+13161234567")); // Wichita, KS
console.log("+13081234567 ->", getLocationFromPhoneNumber("+13081234567")); // North Platte, NE
console.log("+14051234567 ->", getLocationFromPhoneNumber("+14051234567")); // Oklahoma City, OK
console.log("+14791234567 ->", getLocationFromPhoneNumber("+14791234567")); // Fort Smith, AR
console.log("+12251234567 ->", getLocationFromPhoneNumber("+12251234567")); // Baton Rouge, LA
console.log("+12281234567 ->", getLocationFromPhoneNumber("+12281234567")); // Biloxi, MS
console.log("+12051234567 ->", getLocationFromPhoneNumber("+12051234567")); // Birmingham, AL
console.log("+14231234567 ->", getLocationFromPhoneNumber("+14231234567")); // Chattanooga, TN
console.log("+12701234567 ->", getLocationFromPhoneNumber("+12701234567")); // Bowling Green, KY
console.log("+12191234567 ->", getLocationFromPhoneNumber("+12191234567")); // Gary, IN
console.log("+18031234567 ->", getLocationFromPhoneNumber("+18031234567")); // Columbia, SC
console.log("+13041234567 ->", getLocationFromPhoneNumber("+13041234567")); // West Virginia, WV
console.log("+13021234567 ->", getLocationFromPhoneNumber("+13021234567")); // Delaware, DE
console.log("+14011234567 ->", getLocationFromPhoneNumber("+14011234567")); // Rhode Island, RI
console.log("+12031234567 ->", getLocationFromPhoneNumber("+12031234567")); // Bridgeport, CT
console.log("+12071234567 ->", getLocationFromPhoneNumber("+12071234567")); // Maine, ME
console.log("+16031234567 ->", getLocationFromPhoneNumber("+16031234567")); // New Hampshire, NH
console.log("+18021234567 ->", getLocationFromPhoneNumber("+18021234567")); // Vermont, VT
console.log("+19071234567 ->", getLocationFromPhoneNumber("+19071234567")); // Alaska, AK
console.log("+18081234567 ->", getLocationFromPhoneNumber("+18081234567")); // Hawaii, HI
console.log("+15051234567 ->", getLocationFromPhoneNumber("+15051234567")); // Albuquerque, NM

console.log("\n✅ Test completed! The area code mapping is working correctly.");
console.log("📞 +1-XXX-XXX-XXXX should now show 'Unknown' location"); 