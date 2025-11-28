/**
 * Detect store names from deal titles and provide search URLs
 */

import { getAffiliateSearchUrl } from './affiliates'

// Store patterns to detect in titles - order matters (more specific first)
const STORE_PATTERNS: { pattern: RegExp; name: string; slug: string }[] = [
  // Specific stores first
  { pattern: /\bAmazon\.ca\b/i, name: 'Amazon.ca', slug: 'amazon' },
  { pattern: /\bAmazon Canada\b/i, name: 'Amazon.ca', slug: 'amazon' },
  { pattern: /\bAmazon\b/i, name: 'Amazon', slug: 'amazon' },
  { pattern: /\bWalmart Canada\b/i, name: 'Walmart', slug: 'walmart' },
  { pattern: /\bWalmart\b/i, name: 'Walmart', slug: 'walmart' },
  { pattern: /\bCostco Canada\b/i, name: 'Costco', slug: 'costco' },
  { pattern: /\bCostco\b/i, name: 'Costco', slug: 'costco' },
  { pattern: /\bBest Buy Canada\b/i, name: 'Best Buy', slug: 'best-buy' },
  { pattern: /\bBest Buy\b/i, name: 'Best Buy', slug: 'best-buy' },
  { pattern: /\bBestBuy\b/i, name: 'Best Buy', slug: 'best-buy' },
  { pattern: /\bCanadian Tire\b/i, name: 'Canadian Tire', slug: 'canadian-tire' },
  { pattern: /\bShoppers Drug Mart\b/i, name: 'Shoppers', slug: 'shoppers' },
  { pattern: /\bShoppers\b/i, name: 'Shoppers', slug: 'shoppers' },
  { pattern: /\bLoblaws\b/i, name: 'Loblaws', slug: 'loblaws' },
  { pattern: /\bNo Frills\b/i, name: 'No Frills', slug: 'no-frills' },
  { pattern: /\bReal Canadian Superstore\b/i, name: 'Superstore', slug: 'superstore' },
  { pattern: /\bSuperstore\b/i, name: 'Superstore', slug: 'superstore' },
  { pattern: /\bHome Depot\b/i, name: 'Home Depot', slug: 'home-depot' },
  { pattern: /\bLowes\b/i, name: 'Lowes', slug: 'lowes' },
  { pattern: /\bLowe's\b/i, name: 'Lowes', slug: 'lowes' },
  { pattern: /\bRONA\b/i, name: 'RONA', slug: 'rona' },
  { pattern: /\bHome Hardware\b/i, name: 'Home Hardware', slug: 'home-hardware' },
  { pattern: /\bIKEA\b/i, name: 'IKEA', slug: 'ikea' },
  { pattern: /\bThe Brick\b/i, name: 'The Brick', slug: 'the-brick' },
  { pattern: /\bLeon's\b/i, name: "Leon's", slug: 'leons' },
  { pattern: /\bLeons\b/i, name: "Leon's", slug: 'leons' },
  { pattern: /\bStaples\b/i, name: 'Staples', slug: 'staples' },
  { pattern: /\bSport Chek\b/i, name: 'Sport Chek', slug: 'sport-chek' },
  { pattern: /\bSportChek\b/i, name: 'Sport Chek', slug: 'sport-chek' },
  { pattern: /\bMark's\b/i, name: "Mark's", slug: 'marks' },
  { pattern: /\bMarks\b/i, name: "Mark's", slug: 'marks' },
  { pattern: /\bAtmosphere\b/i, name: 'Atmosphere', slug: 'atmosphere' },
  { pattern: /\bPetSmart\b/i, name: 'PetSmart', slug: 'petsmart' },
  { pattern: /\bPet Valu\b/i, name: 'Pet Valu', slug: 'pet-valu' },
  { pattern: /\bToys R Us\b/i, name: 'Toys R Us', slug: 'toys-r-us' },
  { pattern: /\bToysRUs\b/i, name: 'Toys R Us', slug: 'toys-r-us' },
  { pattern: /\bGiant Tiger\b/i, name: 'Giant Tiger', slug: 'giant-tiger' },
  { pattern: /\bDollarama\b/i, name: 'Dollarama', slug: 'dollarama' },
  { pattern: /\bHudson's Bay\b/i, name: "Hudson's Bay", slug: 'the-bay' },
  { pattern: /\bThe Bay\b/i, name: "The Bay", slug: 'the-bay' },
  { pattern: /\bHBC\b/i, name: "Hudson's Bay", slug: 'the-bay' },
  { pattern: /\bWinners\b/i, name: 'Winners', slug: 'winners' },
  { pattern: /\bHomeSense\b/i, name: 'HomeSense', slug: 'homesense' },
  { pattern: /\bMarshalls\b/i, name: 'Marshalls', slug: 'marshalls' },
  { pattern: /\bIndigo\b/i, name: 'Indigo', slug: 'indigo' },
  { pattern: /\bChapters\b/i, name: 'Indigo', slug: 'indigo' },
  { pattern: /\bMichaels\b/i, name: 'Michaels', slug: 'michaels' },
  { pattern: /\bWayfair\b/i, name: 'Wayfair', slug: 'wayfair' },
  { pattern: /\bStructube\b/i, name: 'Structube', slug: 'structube' },
  { pattern: /\bSleep Country\b/i, name: 'Sleep Country', slug: 'sleep-country' },
  { pattern: /\bThe Source\b/i, name: 'The Source', slug: 'the-source' },
  { pattern: /\bLondon Drugs\b/i, name: 'London Drugs', slug: 'london-drugs' },
  { pattern: /\bRexall\b/i, name: 'Rexall', slug: 'rexall' },
  { pattern: /\bJean Coutu\b/i, name: 'Jean Coutu', slug: 'jean-coutu' },
  { pattern: /\bPharmaprix\b/i, name: 'Pharmaprix', slug: 'pharmaprix' },
  { pattern: /\bMetro\b/i, name: 'Metro', slug: 'metro' },
  { pattern: /\bIGA\b/i, name: 'IGA', slug: 'iga' },
  { pattern: /\bSobeys\b/i, name: 'Sobeys', slug: 'sobeys' },
  { pattern: /\bSafeway\b/i, name: 'Safeway', slug: 'safeway' },
  { pattern: /\bSave-On-Foods\b/i, name: 'Save-On-Foods', slug: 'save-on-foods' },
  { pattern: /\bFreshCo\b/i, name: 'FreshCo', slug: 'freshco' },
  { pattern: /\bFood Basics\b/i, name: 'Food Basics', slug: 'food-basics' },
  { pattern: /\bMaxi\b/i, name: 'Maxi', slug: 'maxi' },
  { pattern: /\bProvigo\b/i, name: 'Provigo', slug: 'provigo' },
  { pattern: /\bSuper C\b/i, name: 'Super C', slug: 'super-c' },
  { pattern: /\bCabela's\b/i, name: "Cabela's", slug: 'cabelas' },
  { pattern: /\bCabelas\b/i, name: "Cabela's", slug: 'cabelas' },
  { pattern: /\bBass Pro\b/i, name: 'Bass Pro', slug: 'bass-pro' },
  { pattern: /\bMEC\b/i, name: 'MEC', slug: 'mec' },
  { pattern: /\bSAIL\b/i, name: 'SAIL', slug: 'sail' },
  { pattern: /\bDecathlon\b/i, name: 'Decathlon', slug: 'decathlon' },
  { pattern: /\bLululemon\b/i, name: 'Lululemon', slug: 'lululemon' },
  { pattern: /\bAritzia\b/i, name: 'Aritzia', slug: 'aritzia' },
  { pattern: /\bRoots\b/i, name: 'Roots', slug: 'roots' },
  { pattern: /\bArdene\b/i, name: 'Ardene', slug: 'ardene' },
  { pattern: /\bSephora\b/i, name: 'Sephora', slug: 'sephora' },
  { pattern: /\bOld Navy\b/i, name: 'Old Navy', slug: 'old-navy' },
  { pattern: /\bGAP\b/i, name: 'GAP', slug: 'gap' },
  { pattern: /\bH&M\b/i, name: 'H&M', slug: 'h-m' },
  { pattern: /\bZara\b/i, name: 'Zara', slug: 'zara' },
  { pattern: /\bUniqlo\b/i, name: 'Uniqlo', slug: 'uniqlo' },
  { pattern: /\bSimons\b/i, name: 'Simons', slug: 'simons' },
  { pattern: /\bLa Maison Simons\b/i, name: 'Simons', slug: 'simons' },
  { pattern: /\bDell Canada\b/i, name: 'Dell', slug: 'dell' },
  { pattern: /\bDell\b/i, name: 'Dell', slug: 'dell' },
  { pattern: /\bLenovo Canada\b/i, name: 'Lenovo', slug: 'lenovo' },
  { pattern: /\bLenovo\b/i, name: 'Lenovo', slug: 'lenovo' },
  { pattern: /\bNewegg\b/i, name: 'Newegg', slug: 'newegg' },
  { pattern: /\bMemory Express\b/i, name: 'Memory Express', slug: 'memory-express' },
  { pattern: /\bCanada Computers\b/i, name: 'Canada Computers', slug: 'canada-computers' },
  { pattern: /\bApple\b/i, name: 'Apple', slug: 'apple' },
  { pattern: /\bMicrosoft Store\b/i, name: 'Microsoft', slug: 'microsoft' },
  { pattern: /\bMicrosoft\b/i, name: 'Microsoft', slug: 'microsoft' },
  { pattern: /\bSamsung\b/i, name: 'Samsung', slug: 'samsung' },
  { pattern: /\bGoogle Store\b/i, name: 'Google Store', slug: 'google-store' },
  { pattern: /\bEB Games\b/i, name: 'EB Games', slug: 'eb-games' },
  { pattern: /\bGameStop\b/i, name: 'EB Games', slug: 'eb-games' },
  { pattern: /\bPlayStation\b/i, name: 'PlayStation', slug: 'playstation' },
  { pattern: /\bXbox\b/i, name: 'Xbox', slug: 'xbox' },
  { pattern: /\bNintendo\b/i, name: 'Nintendo', slug: 'nintendo' },
  { pattern: /\bSteam\b/i, name: 'Steam', slug: 'steam' },
  { pattern: /\bEpic Games\b/i, name: 'Epic Games', slug: 'epic-games' },
  { pattern: /\bVIA Rail\b/i, name: 'VIA Rail', slug: 'via-rail' },
  { pattern: /\bAir Canada\b/i, name: 'Air Canada', slug: 'air-canada' },
  { pattern: /\bWestJet\b/i, name: 'WestJet', slug: 'westjet' },
  { pattern: /\bMcDonald's\b/i, name: "McDonald's", slug: 'mcdonalds' },
  { pattern: /\bMcDonalds\b/i, name: "McDonald's", slug: 'mcdonalds' },
  { pattern: /\bTim Hortons\b/i, name: 'Tim Hortons', slug: 'tim-hortons' },
  { pattern: /\bStarbucks\b/i, name: 'Starbucks', slug: 'starbucks' },
  { pattern: /\bSubway\b/i, name: 'Subway', slug: 'subway' },
  { pattern: /\bKFC\b/i, name: 'KFC', slug: 'kfc' },
  { pattern: /\bPopeye's\b/i, name: "Popeye's", slug: 'popeyes' },
  { pattern: /\bPopeyes\b/i, name: "Popeye's", slug: 'popeyes' },
  { pattern: /\bBath & Body Works\b/i, name: 'Bath & Body Works', slug: 'bath-body-works' },
  { pattern: /\bBath and Body Works\b/i, name: 'Bath & Body Works', slug: 'bath-body-works' },
  { pattern: /\bKitchen Stuff Plus\b/i, name: 'Kitchen Stuff Plus', slug: 'kitchen-stuff-plus' },
  { pattern: /\bKate Spade\b/i, name: 'Kate Spade', slug: 'kate-spade' },
  { pattern: /\bMichael Kors\b/i, name: 'Michael Kors', slug: 'michael-kors' },
  { pattern: /\bCoach\b/i, name: 'Coach', slug: 'coach' },
  { pattern: /\bHolt Renfrew\b/i, name: 'Holt Renfrew', slug: 'holt-renfrew' },
  { pattern: /\bNordstrom\b/i, name: 'Nordstrom', slug: 'nordstrom' },
  { pattern: /\bPuma\b/i, name: 'Puma', slug: 'puma' },
  { pattern: /\bNike\b/i, name: 'Nike', slug: 'nike' },
  { pattern: /\bAdidas\b/i, name: 'Adidas', slug: 'adidas' },
  { pattern: /\bNew Balance\b/i, name: 'New Balance', slug: 'new-balance' },
  { pattern: /\bReebok\b/i, name: 'Reebok', slug: 'reebok' },
  { pattern: /\bUnder Armour\b/i, name: 'Under Armour', slug: 'under-armour' },
  { pattern: /\bGANT\b/i, name: 'GANT', slug: 'gant' },
  { pattern: /\bReitmans\b/i, name: 'Reitmans', slug: 'reitmans' },
  { pattern: /\bRW&CO\b/i, name: 'RW&CO', slug: 'rw-co' },
  { pattern: /\bPeloton\b/i, name: 'Peloton', slug: 'peloton' },
  { pattern: /\bSaje\b/i, name: 'Saje', slug: 'saje' },
  { pattern: /\bVilleroy & Boch\b/i, name: 'Villeroy & Boch', slug: 'villeroy-boch' },
  { pattern: /\bMarks & Spencer\b/i, name: 'Marks & Spencer', slug: 'marks-spencer' },
]

export interface DetectedStore {
  name: string
  slug: string
  searchUrl: string | null
}

/**
 * Detect store from title - returns store info with search URL
 */
export function detectStoreFromTitle(title: string, existingStore?: string | null): DetectedStore {
  // If we already have a valid store, use it
  if (existingStore && existingStore.toLowerCase() !== 'unknown' && existingStore.trim() !== '') {
    const slug = existingStore.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    return {
      name: existingStore,
      slug,
      searchUrl: getAffiliateSearchUrl(slug, title)
    }
  }

  // Try to detect from title
  for (const { pattern, name, slug } of STORE_PATTERNS) {
    if (pattern.test(title)) {
      return {
        name,
        slug,
        searchUrl: getAffiliateSearchUrl(slug, title)
      }
    }
  }

  // No store detected
  return {
    name: '',
    slug: '',
    searchUrl: null
  }
}

/**
 * Get just the store name (for simple display)
 */
export function getStoreName(title: string, existingStore?: string | null): string {
  const detected = detectStoreFromTitle(title, existingStore)
  return detected.name
}
