# Roamly — JavaScript & DOM Self Assessment

Roamly is a responsive Airbnb listings explorer built with vanilla HTML, CSS,
and JavaScript. It loads the first 50 records from a local JSON file with the
Fetch API and `async`/`await`, then creates every listing card through DOM APIs.

## Live deployment

**GitHub Pages:** Add the deployment URL here after enabling Pages.

## Assignment requirements

Each of the first 50 listings displays:

- listing name and description
- amenities
- host name and profile photo
- nightly price
- listing thumbnail

## Creative additions

- search across listing names, descriptions, amenities, hosts, and locations
- country and maximum-price filters
- price and rating sorting
- favorites saved with `localStorage`
- responsive layout, image fallbacks, and accessible loading/error/empty states

## JavaScript concepts demonstrated

- asynchronous data loading with `fetch`, `await`, and response validation
- array operations including `slice`, `map`, `filter`, and `sort`
- dynamic DOM creation with `createElement`, `append`, and document fragments
- event handling for live controls and event delegation for favorite buttons
- application state and browser storage

## Run locally

Because browsers restrict `fetch()` from `file://` pages, serve the directory
with a local web server instead of double-clicking `index.html`.

```bash
npx serve .
```

Then open the local URL printed in the terminal.

## Deploy with GitHub Pages

1. Push this repository to GitHub.
2. Open **Settings → Pages** in the repository.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select the `main` branch and `/ (root)` folder, then click **Save**.
5. Copy the published URL into the **Live deployment** section above.

## Data source

The project uses a 50-record subset of MongoDB's Sample Airbnb Listings
Dataset, which is compiled from publicly available Inside Airbnb data.

- [MongoDB Sample Airbnb documentation](https://www.mongodb.com/docs/manual/sample-data/sample-airbnb/)
- [Class starter repository](https://github.com/john-guerra/Airbnb_Listings_demo_page)

This project is an educational exercise and is not affiliated with Airbnb.
