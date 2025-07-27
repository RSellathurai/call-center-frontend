"""
Area Code to Location Mapping
Based on comprehensive area code data from Bennet Yee's area code listing
"""

AREA_CODE_MAPPING = {
    # California Area Codes
    "209": "Stockton, CA",
    "213": "Los Angeles, CA", 
    "310": "Beverly Hills, CA",
    "323": "Los Angeles, CA",
    "408": "San Jose, CA",
    "415": "San Francisco, CA",
    "424": "Los Angeles, CA",
    "442": "Oceanside, CA",
    "510": "Oakland, CA",
    "530": "Chico, CA",
    "559": "Fresno, CA",
    "562": "Long Beach, CA",
    "619": "San Diego, CA",
    "626": "Pasadena, CA",
    "628": "San Francisco, CA",
    "650": "Palo Alto, CA",
    "657": "Orange County, CA",
    "661": "Bakersfield, CA",
    "669": "San Jose, CA",
    "707": "Santa Rosa, CA",
    "714": "Anaheim, CA",
    "747": "Los Angeles, CA",
    "760": "San Diego, CA",
    "805": "Santa Barbara, CA",
    "818": "Los Angeles, CA",
    "831": "Monterey, CA",
    "858": "La Jolla, CA",
    "909": "San Bernardino, CA",
    "916": "Sacramento, CA",
    "925": "Walnut Creek, CA",
    "949": "Irvine, CA",
    "951": "Riverside, CA",
    "935": "San Diego, CA",
    
    # New York Area Codes
    "212": "New York City, NY",
    "315": "Syracuse, NY",
    "332": "New York City, NY",
    "347": "New York City, NY",
    "516": "Nassau County, NY",
    "518": "Albany, NY",
    "585": "Rochester, NY",
    "607": "Ithaca, NY",
    "631": "Suffolk County, NY",
    "646": "New York City, NY",
    "716": "Buffalo, NY",
    "718": "New York City, NY",
    "845": "Poughkeepsie, NY",
    "914": "Westchester County, NY",
    "917": "New York City, NY",
    "929": "New York City, NY",
    
    # Texas Area Codes
    "210": "San Antonio, TX",
    "214": "Dallas, TX",
    "254": "Waco, TX",
    "281": "Houston, TX",
    "325": "Abilene, TX",
    "346": "Houston, TX",
    "361": "Corpus Christi, TX",
    "409": "Galveston, TX",
    "430": "Tyler, TX",
    "432": "Midland, TX",
    "469": "Dallas, TX",
    "512": "Austin, TX",
    "682": "Fort Worth, TX",
    "713": "Houston, TX",
    "737": "Austin, TX",
    "806": "Amarillo, TX",
    "817": "Fort Worth, TX",
    "830": "San Antonio, TX",
    "832": "Houston, TX",
    "903": "Tyler, TX",
    "915": "El Paso, TX",
    "936": "Conroe, TX",
    "940": "Denton, TX",
    "956": "Harlingen, TX",
    "972": "Dallas, TX",
    "979": "Bryan, TX",
    
    # Florida Area Codes
    "239": "Fort Myers, FL",
    "305": "Miami, FL",
    "321": "Cape Canaveral, FL",
    "352": "Gainesville, FL",
    "386": "Lake City, FL",
    "407": "Orlando, FL",
    "561": "West Palm Beach, FL",
    "689": "Orlando, FL",
    "727": "St. Petersburg, FL",
    "754": "Fort Lauderdale, FL",
    "772": "St. Lucie, FL",
    "786": "Miami, FL",
    "813": "Tampa, FL",
    "850": "Tallahassee, FL",
    "863": "Lakeland, FL",
    "904": "Jacksonville, FL",
    "941": "Sarasota, FL",
    "954": "Fort Lauderdale, FL",
    
    # Illinois Area Codes
    "217": "Springfield, IL",
    "224": "Evanston, IL",
    "312": "Chicago, IL",
    "331": "Chicago, IL",
    "464": "Chicago, IL",
    "618": "Centralia, IL",
    "630": "Chicago, IL",
    "708": "Chicago, IL",
    "773": "Chicago, IL",
    "779": "Rockford, IL",
    "815": "Rockford, IL",
    "847": "Evanston, IL",
    "872": "Chicago, IL",
    
    # Pennsylvania Area Codes
    "215": "Philadelphia, PA",
    "223": "Harrisburg, PA",
    "267": "Philadelphia, PA",
    "272": "Wilkes-Barre, PA",
    "412": "Pittsburgh, PA",
    "484": "Allentown, PA",
    "570": "Wilkes-Barre, PA",
    "610": "Allentown, PA",
    "717": "Harrisburg, PA",
    "724": "Pittsburgh, PA",
    "814": "Erie, PA",
    "835": "Allentown, PA",
    "878": "Pittsburgh, PA",
    
    # Ohio Area Codes
    "216": "Cleveland, OH",
    "220": "Ohio, OH",
    "234": "Canton, OH",
    "283": "Cincinnati, OH",
    "330": "Akron, OH",
    "380": "Columbus, OH",
    "419": "Toledo, OH",
    "440": "Cleveland, OH",
    "513": "Cincinnati, OH",
    "567": "Toledo, OH",
    "614": "Columbus, OH",
    "740": "Ohio, OH",
    
    # Michigan Area Codes
    "231": "Traverse City, MI",
    "248": "Pontiac, MI",
    "269": "Kalamazoo, MI",
    "313": "Detroit, MI",
    "517": "Lansing, MI",
    "586": "Macomb County, MI",
    "616": "Grand Rapids, MI",
    "734": "Ann Arbor, MI",
    "810": "Flint, MI",
    "906": "Sault Ste. Marie, MI",
    "947": "Oakland County, MI",
    "989": "Mt Pleasant, MI",
    
    # Georgia Area Codes
    "229": "Albany, GA",
    "404": "Atlanta, GA",
    "470": "Atlanta, GA",
    "478": "Macon, GA",
    "678": "Atlanta, GA",
    "706": "Columbus, GA",
    "762": "Columbus, GA",
    "770": "Atlanta, GA",
    "912": "Savannah, GA",
    
    # North Carolina Area Codes
    "252": "Rocky Mount, NC",
    "336": "Greensboro, NC",
    "704": "Charlotte, NC",
    "743": "Greensboro, NC",
    "828": "Asheville, NC",
    "910": "Fayetteville, NC",
    "919": "Raleigh, NC",
    "980": "Charlotte, NC",
    "984": "Raleigh, NC",
    
    # Virginia Area Codes
    "276": "Bristol, VA",
    "434": "Charlottesville, VA",
    "540": "Roanoke, VA",
    "571": "Arlington, VA",
    "703": "Arlington, VA",
    "757": "Norfolk, VA",
    "804": "Richmond, VA",
    
    # Maryland Area Codes
    "240": "Silver Spring, MD",
    "301": "Silver Spring, MD",
    "410": "Baltimore, MD",
    "443": "Baltimore, MD",
    "667": "Baltimore, MD",
    
    # New Jersey Area Codes
    "201": "Jersey City, NJ",
    "551": "Jersey City, NJ",
    "609": "Trenton, NJ",
    "732": "New Brunswick, NJ",
    "848": "New Brunswick, NJ",
    "856": "Camden, NJ",
    "862": "Newark, NJ",
    "908": "Elizabeth, NJ",
    "973": "Newark, NJ",
    
    # Massachusetts Area Codes
    "339": "Boston, MA",
    "351": "Boston, MA",
    "413": "Springfield, MA",
    "508": "Framingham, MA",
    "617": "Boston, MA",
    "774": "Framingham, MA",
    "781": "Boston, MA",
    "857": "Boston, MA",
    "978": "Boston, MA",
    
    # Washington Area Codes
    "206": "Seattle, WA",
    "253": "Tacoma, WA",
    "360": "Olympia, WA",
    "425": "Everett, WA",
    "509": "Spokane, WA",
    "564": "Olympia, WA",
    
    # Colorado Area Codes
    "303": "Denver, CO",
    "719": "Pueblo, CO",
    "720": "Denver, CO",
    "970": "Colorado, CO",
    
    # Arizona Area Codes
    "480": "Phoenix, AZ",
    "520": "Tucson, AZ",
    "602": "Phoenix, AZ",
    "623": "Phoenix, AZ",
    "928": "Prescott, AZ",
    
    # Nevada Area Codes
    "702": "Las Vegas, NV",
    "725": "Las Vegas, NV",
    "775": "Reno, NV",
    
    # Oregon Area Codes
    "458": "Eugene, OR",
    "503": "Portland, OR",
    "541": "Eugene, OR",
    "971": "Portland, OR",
    
    # Utah Area Codes
    "385": "Salt Lake City, UT",
    "435": "Utah, UT",
    "801": "Salt Lake City, UT",
    
    # Idaho Area Codes
    "208": "Idaho, ID",
    
    # Montana Area Codes
    "406": "Montana, MT",
    
    # Wyoming Area Codes
    "307": "Wyoming, WY",
    
    # South Dakota Area Codes
    "605": "South Dakota, SD",
    
    # North Dakota Area Codes
    "701": "North Dakota, ND",
    
    # Minnesota Area Codes
    "218": "Duluth, MN",
    "320": "Saint Cloud, MN",
    "507": "Rochester, MN",
    "612": "Minneapolis, MN",
    "651": "St. Paul, MN",
    "763": "Minneapolis, MN",
    "952": "Bloomington, MN",
    
    # Wisconsin Area Codes
    "262": "Kenosha, WI",
    "414": "Milwaukee, WI",
    "608": "Madison, WI",
    "715": "Eau Claire, WI",
    "920": "Appleton, WI",
    
    # Iowa Area Codes
    "319": "Cedar Rapids, IA",
    "515": "Des Moines, IA",
    "563": "Davenport, IA",
    "641": "Mason City, IA",
    "712": "Council Bluffs, IA",
    
    # Missouri Area Codes
    "314": "St. Louis, MO",
    "417": "Springfield, MO",
    "573": "Missouri, MO",
    "636": "St. Louis, MO",
    "660": "Missouri, MO",
    "816": "Kansas City, MO",
    "975": "Kansas City, MO",
    
    # Kansas Area Codes
    "316": "Wichita, KS",
    "620": "Wichita, KS",
    "785": "Topeka, KS",
    "913": "Kansas City, KS",
    
    # Nebraska Area Codes
    "308": "North Platte, NE",
    "402": "Omaha, NE",
    
    # Oklahoma Area Codes
    "405": "Oklahoma City, OK",
    "539": "Tulsa, OK",
    "580": "Oklahoma, OK",
    "918": "Tulsa, OK",
    
    # Arkansas Area Codes
    "479": "Fort Smith, AR",
    "501": "Little Rock, AR",
    "870": "Jonesboro, AR",
    
    # Louisiana Area Codes
    "225": "Baton Rouge, LA",
    "318": "Shreveport, LA",
    "337": "Lake Charles, LA",
    "504": "New Orleans, LA",
    "985": "Hammond, LA",
    
    # Mississippi Area Codes
    "228": "Biloxi, MS",
    "601": "Jackson, MS",
    "662": "Tupelo, MS",
    "769": "Jackson, MS",
    
    # Alabama Area Codes
    "205": "Birmingham, AL",
    "251": "Mobile, AL",
    "256": "Huntsville, AL",
    "334": "Montgomery, AL",
    
    # Tennessee Area Codes
    "423": "Chattanooga, TN",
    "615": "Nashville, TN",
    "629": "Nashville, TN",
    "731": "Tennessee, TN",
    "865": "Knoxville, TN",
    "901": "Memphis, TN",
    "931": "Tennessee, TN",
    
    # Kentucky Area Codes
    "270": "Bowling Green, KY",
    "502": "Louisville, KY",
    "606": "Ashland, KY",
    "859": "Lexington, KY",
    
    # Indiana Area Codes
    "219": "Gary, IN",
    "260": "Fort Wayne, IN",
    "317": "Indianapolis, IN",
    "574": "Elkhart, IN",
    "765": "Indiana, IN",
    "812": "Evansville, IN",
    
    # South Carolina Area Codes
    "803": "Columbia, SC",
    "843": "Charleston, SC",
    "864": "Greenville, SC",
    
    # West Virginia Area Codes
    "304": "West Virginia, WV",
    "681": "West Virginia, WV",
    
    # Delaware Area Codes
    "302": "Delaware, DE",
    
    # Rhode Island Area Codes
    "401": "Rhode Island, RI",
    
    # Connecticut Area Codes
    "203": "Bridgeport, CT",
    "475": "New Haven, CT",
    "860": "Connecticut, CT",
    "959": "Hartford, CT",
    
    # Maine Area Codes
    "207": "Maine, ME",
    
    # New Hampshire Area Codes
    "603": "New Hampshire, NH",
    
    # Vermont Area Codes
    "802": "Vermont, VT",
    
    # Alaska Area Codes
    "907": "Alaska, AK",
    
    # Hawaii Area Codes
    "808": "Hawaii, HI",
    
    # New Mexico Area Codes
    "505": "Albuquerque, NM",
    "575": "Las Cruces, NM",
    "957": "New Mexico, NM",
    
    # Special/Reserved Area Codes
    "211": "Community Info",
    "311": "Special Applications",
    "411": "Special Applications",
    "500": "Personal Communication",
    "555": "Directory Assistance",
    "700": "Interexchange Carrier",
    "710": "US Government",
    "711": "Telecommunications Relay",
    "800": "Toll Free",
    "811": "Special Applications",
    "822": "Toll Free",
    "833": "Toll Free",
    "844": "Toll Free",
    "855": "Toll Free",
    "866": "Toll Free",
    "877": "Toll Free",
    "888": "Toll Free",
    "900": "Toll Calls",
    "911": "Emergency",
    "976": "Unassigned",
    "999": "Unavailable",
}

def get_location_from_area_code(area_code: str) -> str:
    """Get location from area code"""
    return AREA_CODE_MAPPING.get(area_code, "Unknown Location")

def get_location_from_phone_number(phone_number: str) -> str:
    """Extract area code from phone number and return location"""
    # Remove any non-digit characters
    clean_number = ''.join(filter(str.isdigit, phone_number))
    
    # Handle US numbers (10 or 11 digits)
    if len(clean_number) >= 10:
        # For 11-digit numbers starting with 1, skip the country code
        if len(clean_number) == 11 and clean_number.startswith('1'):
            area_code = clean_number[1:4]
        else:
            area_code = clean_number[:3]
        
        return get_location_from_area_code(area_code)
    
    return "Unknown Location" 