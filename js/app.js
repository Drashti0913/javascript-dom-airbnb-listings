const DATA_URL = "./data/listings.json";

const elements = {
  grid: document.querySelector("#listing-grid"),
  status: document.querySelector("#status"),
  count: document.querySelector("#result-count"),
  search: document.querySelector("#search"),
  country: document.querySelector("#country"),
  sort: document.querySelector("#sort"),
  maxPrice: document.querySelector("#max-price"),
  priceOutput: document.querySelector("#price-output"),
  favoritesOnly: document.querySelector("#favorites-only"),
  reset: document.querySelector("#reset"),
  empty: document.querySelector("#empty-state"),
  emptyReset: document.querySelector("#empty-reset"),
};

const state = {
  listings: [],
  favorites: new Set(
    JSON.parse(localStorage.getItem("roamly-favorites") || "[]"),
  ),
};

function numericValue(value) {
  if (typeof value === "number") return value;
  if (!value || typeof value !== "object") return Number(value) || 0;
  return (
    Number(
      value.$numberDecimal ??
        value.$numberDouble ??
        value.$numberInt ??
        value.$numberLong,
    ) || 0
  );
}

function normalizeListing(listing, index) {
  return {
    ...listing,
    originalIndex: index,
    priceValue: numericValue(listing.price),
    ratingValue: numericValue(listing.review_scores?.review_scores_rating),
  };
}

function imageOrFallback(image, label, className) {
  const fallback = document.createElement("span");
  fallback.className = className;
  fallback.textContent = label;
  if (!image) return fallback;
  const img = document.createElement("img");
  img.src = image;
  img.alt = label;
  img.loading = "lazy";
  img.decoding = "async";
  img.addEventListener("error", () => img.replaceWith(fallback), {
    once: true,
  });
  return img;
}

function createAmenityList(amenities = []) {
  const list = document.createElement("ul");
  list.className = "amenities";
  amenities.slice(0, 3).forEach((amenity) => {
    const item = document.createElement("li");
    item.textContent = amenity;
    list.append(item);
  });
  if (amenities.length > 3) {
    const more = document.createElement("li");
    more.textContent = `+${amenities.length - 3} more`;
    list.append(more);
  }
  return list;
}

function createListingCard(listing) {
  const article = document.createElement("article");
  article.className = "listing-card";
  const imageWrap = document.createElement("div");
  imageWrap.className = "image-wrap";
  const photo = imageOrFallback(
    listing.images?.picture_url || listing.images?.thumbnail_url,
    listing.name ? `Photo of ${listing.name}` : "Listing photo unavailable",
    "image-fallback",
  );
  if (photo instanceof HTMLImageElement) photo.className = "listing-image";
  imageWrap.append(photo);

  const favorite = document.createElement("button");
  favorite.type = "button";
  favorite.className = "favorite-button";
  favorite.dataset.favoriteId = listing.id;
  const isFavorite = state.favorites.has(listing.id);
  favorite.setAttribute("aria-pressed", String(isFavorite));
  favorite.setAttribute(
    "aria-label",
    `${isFavorite ? "Remove" : "Save"} ${listing.name || "this listing"} ${isFavorite ? "from" : "to"} favorites`,
  );
  favorite.textContent = isFavorite ? "♥" : "♡";
  imageWrap.append(favorite);

  const body = document.createElement("div");
  body.className = "card-body";
  const locationRow = document.createElement("div");
  locationRow.className = "location-row";
  const location = document.createElement("span");
  location.textContent =
    listing.address?.market ||
    listing.address?.country ||
    "Location unavailable";
  const rating = document.createElement("span");
  rating.className = "rating";
  rating.textContent = listing.ratingValue
    ? `★ ${(listing.ratingValue / 20).toFixed(1)}`
    : "New";
  locationRow.append(location, rating);
  const title = document.createElement("h3");
  title.textContent = listing.name || "Untitled stay";
  const description = document.createElement("p");
  description.className = "description";
  description.textContent =
    listing.description || listing.summary || "No description provided.";

  const hostRow = document.createElement("div");
  hostRow.className = "host-row";
  const hostName = listing.host?.host_name || "Unknown host";
  const hostPhoto = imageOrFallback(
    listing.host?.host_thumbnail_url || listing.host?.host_picture_url,
    `Profile photo of ${hostName}`,
    "host-initials",
  );
  if (hostPhoto instanceof HTMLImageElement) hostPhoto.className = "host-photo";
  else hostPhoto.textContent = hostName.slice(0, 1).toUpperCase();
  const hostCopy = document.createElement("span");
  const hostLabel = document.createElement("span");
  hostLabel.textContent = "Hosted by";
  const hostStrong = document.createElement("strong");
  hostStrong.textContent = hostName;
  hostCopy.append(hostLabel, hostStrong);
  hostRow.append(hostPhoto, hostCopy);

  const footer = document.createElement("div");
  footer.className = "card-footer";
  const price = document.createElement("span");
  price.className = "price";
  const priceStrong = document.createElement("strong");
  priceStrong.textContent = `$${listing.priceValue.toLocaleString("en-US")}`;
  price.append(priceStrong, " / night");
  const link = document.createElement("a");
  link.className = "details-link";
  link.href = listing.listing_url || "#";
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = "View listing ↗";
  link.setAttribute(
    "aria-label",
    `View ${listing.name || "listing"} in a new tab`,
  );
  footer.append(price, link);
  body.append(
    locationRow,
    title,
    description,
    createAmenityList(listing.amenities),
    hostRow,
    footer,
  );
  article.append(imageWrap, body);
  return article;
}

function searchableText(listing) {
  return [
    listing.name,
    listing.description,
    listing.host?.host_name,
    listing.address?.market,
    listing.address?.country,
    ...(listing.amenities || []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function getVisibleListings() {
  const query = elements.search.value.trim().toLowerCase();
  const country = elements.country.value;
  const maxPrice = Number(elements.maxPrice.value);
  return state.listings
    .filter(
      (listing) =>
        (!query || searchableText(listing).includes(query)) &&
        (country === "all" || listing.address?.country === country) &&
        listing.priceValue <= maxPrice &&
        (!elements.favoritesOnly.checked || state.favorites.has(listing.id)),
    )
    .sort((a, b) => {
      if (elements.sort.value === "price-low")
        return a.priceValue - b.priceValue;
      if (elements.sort.value === "price-high")
        return b.priceValue - a.priceValue;
      if (elements.sort.value === "rating")
        return b.ratingValue - a.ratingValue;
      return a.originalIndex - b.originalIndex;
    });
}

function renderListings() {
  const listings = getVisibleListings();
  const fragment = document.createDocumentFragment();
  listings.forEach((listing) => fragment.append(createListingCard(listing)));
  elements.grid.replaceChildren(fragment);
  elements.count.textContent = `Showing ${listings.length} of ${state.listings.length} stays`;
  elements.empty.hidden = listings.length !== 0;
}

function populateCountries() {
  [
    ...new Set(
      state.listings.map((item) => item.address?.country).filter(Boolean),
    ),
  ]
    .sort((a, b) => a.localeCompare(b))
    .forEach((country) => {
      const option = document.createElement("option");
      option.value = country;
      option.textContent = country;
      elements.country.append(option);
    });
}

function setPriceRange() {
  const highestPrice =
    Math.ceil(Math.max(...state.listings.map((item) => item.priceValue)) / 50) *
    50;
  elements.maxPrice.max = String(highestPrice);
  elements.maxPrice.value = String(highestPrice);
  elements.priceOutput.textContent = "Any";
}

function resetFilters() {
  elements.search.value = "";
  elements.country.value = "all";
  elements.sort.value = "recommended";
  elements.maxPrice.value = elements.maxPrice.max;
  elements.priceOutput.textContent = "Any";
  elements.favoritesOnly.checked = false;
  renderListings();
}

function toggleFavorite(button) {
  const id = button.dataset.favoriteId;
  if (state.favorites.has(id)) state.favorites.delete(id);
  else state.favorites.add(id);
  localStorage.setItem(
    "roamly-favorites",
    JSON.stringify([...state.favorites]),
  );
  renderListings();
}

function connectEvents() {
  elements.search.addEventListener("input", renderListings);
  elements.country.addEventListener("change", renderListings);
  elements.sort.addEventListener("change", renderListings);
  elements.favoritesOnly.addEventListener("change", renderListings);
  elements.maxPrice.addEventListener("input", () => {
    elements.priceOutput.textContent =
      elements.maxPrice.value === elements.maxPrice.max
        ? "Any"
        : `$${Number(elements.maxPrice.value).toLocaleString("en-US")}`;
    renderListings();
  });
  elements.reset.addEventListener("click", resetFilters);
  elements.emptyReset.addEventListener("click", resetFilters);
  elements.grid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-favorite-id]");
    if (button) toggleFavorite(button);
  });
}

function showError(error) {
  console.error(error);
  const box = document.createElement("div");
  box.className = "error-box";
  const title = document.createElement("h2");
  title.textContent = "We could not load the listings.";
  const guidance = document.createElement("p");
  guidance.textContent =
    "Please run this project through a local web server or open the deployed GitHub Pages URL, then refresh the page.";
  box.append(title, guidance);
  elements.status.replaceChildren(box);
  elements.count.textContent = "Listings unavailable";
}

async function loadListings() {
  try {
    const response = await fetch(DATA_URL);
    if (!response.ok)
      throw new Error(`Request failed with status ${response.status}`);
    const data = await response.json();
    state.listings = data.slice(0, 50).map(normalizeListing);
    populateCountries();
    setPriceRange();
    connectEvents();
    elements.status.hidden = true;
    renderListings();
  } catch (error) {
    showError(error);
  }
}

await loadListings();
