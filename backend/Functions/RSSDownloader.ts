import fs from 'fs';
import path from 'path';
import RSSParser from 'rss-parser';
import moment from 'moment';

// Constants
const RSS_FEED_URL =
""
const STORAGE_FILE = path.join(__dirname, 'seenEntries.json');
const UPDATE_INTERVAL = 1 * 60 * 1000; // Update interval in milliseconds (15 minutes)

interface RSSItem {
  title: string;
  link: string;
  pubDate: string;
}

let entries: RSSItem[] = [];
let latestPubDate: moment.Moment | null = null;

async function main() {
  await fetchAndParseRSS();
  setInterval(fetchAndParseRSS, UPDATE_INTERVAL);
}

async function fetchAndParseRSS() {
  try {
    const response = await fetch(RSS_FEED_URL);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch RSS feed. Status: ${response.status} ${response.statusText}`
      );
    }

    const feedXML = await response.text();
    const parser = new RSSParser();
    const feed = await parser.parseString(feedXML);

    if (!feed || !feed.items || feed.items.length === 0) {
      console.error('No items found in RSS feed.');
      return;
    }

    // Initialize entries and latestPubDate if empty
    if (entries.length === 0) {
      entries = feed.items;
      latestPubDate = getLatestPubDate(feed.items);
      saveEntries();
      console.log('Initial entries loaded.');
      console.log(latestPubDate)

    } else {
      const newItems = feed.items.filter(item => isNewItem(item));
      if (newItems.length > 0) {
        entries.push(...newItems);
        latestPubDate = getLatestPubDate(entries);
        saveEntries();
        console.log(`${newItems.length} new RSS entries found.`);
        displayEntries(newItems);
      }
    }
  } catch (error) {
    console.error('Error fetching or parsing RSS feed:', error.message);
  }
}

function isNewItem(item: RSSItem): boolean {
  if (!latestPubDate) return true; // Always true if latestPubDate is not set

  // Convert item.pubDate to moment object for proper comparison
  const itemMoment = moment(item.pubDate);
  return itemMoment.isAfter(latestPubDate);
}

function getLatestPubDate(items: RSSItem[]): moment.Moment | null {
  const pubDates = items.map(item => item.pubDate);
  // Map pubDates to moment objects
  const momentDates = pubDates.map(date => moment(date));
  // Find the latest moment date
  const latestMomentDate = moment.max(momentDates);
  return latestMomentDate.isValid() ? latestMomentDate : null;
}

function saveEntries() {
  try {
    const dataToSave = JSON.stringify({ entries, latestPubDate: latestPubDate?.toISOString() }, null, 2);
    fs.writeFileSync(STORAGE_FILE, dataToSave);
    console.log('Entries saved successfully.');
  } catch (error) {
    console.error('Error saving entries:', error.message);
  }
}

function displayEntries(newItems: RSSItem[]) {
  console.log('New RSS Entries:');
  newItems.forEach(item => {
    console.log(`Title: ${item.title}`);
    console.log(`Link: ${item.link}`);
    console.log(`PubDate: ${item.pubDate}`);
    console.log(`GUID: ${item.guid}`);
    console.log('---------------------------');
  });
}

// Run the main function
main();
