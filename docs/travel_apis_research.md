# Wanderly Travel APIs Research and Implementation Blueprint

## Executive Summary

Wanderly’s objective is to assemble a robust, scalable, and compliant travel-planning stack that integrates flights, hotels, weather, activities/points of interest (POI), and currency conversion. This report identifies the strongest, partner-ready APIs across each category, maps their capabilities to Wanderly’s requirements, and provides an implementation plan with cost, rate-limit, and compliance considerations.

For flights, the pragmatic starting point is Skyscanner’s Flights Live Prices API. It offers real-time price search with wide market and supply coverage and an established partner workflow, though pricing details are not publicly documented and require partner engagement. Kayak also provides APIs for flights, hotels, and cars on a limited-access basis, conditioned on partner approval and marketing plans. Amadeus for Developers offers a broad self-service suite and a test environment with a monthly free quota, but exact production pricing and rate limits require consultation of the pricing portal or partner engagement. This mix balances reach and feasibility during discovery and early product-market tests, while keeping the door open for later depth and booking workflows via Amadeus and potential direct carrier integrations.[^1][^2][^3][^4][^5][^6]

For hotels, Booking.com’s Connectivity and Demand APIs present two distinct pathways. Connectivity (often referred to as Rates & Availability, or ARI) targets property partners for supply-side management, whereas Demand exposes accommodation inventory for affiliate-style integrations. Expedia Group’s Rapid API is a modular, high-scale lodging solution with extensive property content and reviews and claims of competitive, commissionable rates; however, explicit public usage pricing is not listed and is typically governed by partner agreements. Together, these APIs enable a dual strategy: leverage Demand/Rapid for consumer shopping and pricing while exploring Connectivity for deeper supply integrations once property partnerships mature.[^7][^8][^9][^10][^11]

For weather, a two-tier strategy is recommended. OpenWeather provides global coverage and broad subscription options, including a pay-as-you-call model with a generous daily free allowance. WeatherAPI offers generous quotas with straightforward monthly pricing and an extensive feature set. In the United States, the National Weather Service (NWS) API is a valuable supplemental data source for forecasts, alerts, and observations, with free access and reasonable (undisclosed) rate limits. This combination balances global reach, cost efficiency, and redundancy.[^12][^13][^14][^15][^16][^17]

For activities and POI, Google Places is the most comprehensive option for search, details, photos, and autocomplete; it uses a pay-as-you-go model with per-SKU billing and a monthly credit. Yelp Places is well-suited for consumer-facing U.S. POI with rich reviews and photos, available via data licensing with per-call pricing. Tripadvisor offers content for hotels, restaurants, and attractions with clear rate limits for development and launch phases; pricing is not publicly listed. Foursquare’s Places API offers strong POI depth with well-documented rate limits and commercial usage guidance. A hybrid approach—Google Places for global breadth, Yelp for U.S. depth, and Tripadvisor/Foursquare for curated content and reviews—maximizes coverage and richness.[^18][^19][^20][^21][^22][^23][^24]

For currency conversion, ExchangeRate-API offers simple pricing with frequent updates on paid plans; Fixer, Currencylayer, and Open Exchange Rates provide robust features (e.g., time-series, fluctuation, conversion endpoints) with varying update frequencies and enterprise options. A primary provider plus a low-latency fallback yields both reliability and cost control.[^25][^26][^27][^28][^29]

Integration complexity is driven by partner approvals (Skyscanner, Kayak, Tripadvisor, Yelp Places), SKU-level cost control (Google Places), rate-limit governance (Foursquare, Tripadvisor), and security/compliance requirements (Airbnb API Terms). Licensing and attribution obligations differ markedly across providers (e.g., ODbL/CC BY-SA implications for OpenWeather, display requirements for Tripadvisor, Yelp’s content usage terms). Early partner engagement, rigorous display compliance, and a robust caching strategy are necessary to control costs and ensure scalable performance.

To operationalize quickly, we recommend:

- Flights: Start with Skyscanner’s Flights Live Prices API for search and pricing; initiate parallel discussions with Amadeus and Kayak for future depth and booking flows.[^1][^2][^3][^4][^5][^6]
- Hotels: Use Booking.com Demand API and/or Expedia Rapid API for shopping and pricing; evaluate Connectivity for supply-side features as partnerships develop.[^7][^8][^9][^10][^11]
- Weather: Adopt OpenWeather (pay-as-you-call or Startup plan) and WeatherAPI (Pro+/Business) for global coverage; leverage NWS for U.S.-centric alerts and forecasts.[^12][^13][^14][^15][^16][^17]
- Activities/POI: Use Google Places as the global backbone with SKU-level cost controls; layer Yelp Places for U.S. depth; add Tripadvisor and Foursquare where content approval and rate limits permit.[^18][^19][^20][^21][^22][^23][^24]
- Currency: Primary FX provider as ExchangeRate-API Pro or Business; secondary providers as Fixer, Currencylayer, or Open Exchange Rates for features or failover.[^25][^26][^27][^28][^29]

Immediate next steps: apply for partner access (Skyscanner, Kayak, Tripadvisor, Yelp Places), set up Google Maps Platform billing with field masks and autocomplete session controls, select weather providers, and implement FX caching and quota guards. The architecture should be provider-agnostic with a clear abstraction layer and multi-provider fallback.

To illustrate relative strengths and constraints across categories, Table 1 summarizes top picks, rationales, pricing models, and integration complexity.

Table 1. Category-wise top picks, rationales, pricing model, and integration complexity

| Category            | Top Pick(s)                                    | Rationale                                                                                                        | Pricing Model                             | Integration Complexity |
|---------------------|-------------------------------------------------|------------------------------------------------------------------------------------------------------------------|-------------------------------------------|------------------------|
| Flights             | Skyscanner; Amadeus; Kayak (limited access)     | Skyscanner: real-time price search with global coverage; Amadeus: broad travel APIs; Kayak: multi-vertical, gated | Skyscanner/Kayak: partner-based; Amadeus: self-service with quota (details via portal) | Medium–High            |
| Hotels              | Booking.com Demand; Expedia Rapid; Booking.com Connectivity (supply) | Demand/Rapid: affiliate shopping and rich content; Connectivity: supply-side ARI for property partners            | Usage pricing not public; governed by partner terms | Medium–High            |
| Weather             | OpenWeather; WeatherAPI; NWS (US)               | Global coverage and flexible pricing; feature-rich tiers; free US forecasts/alerts                               | Pay-as-you-call, monthly subscriptions; free for NWS | Low–Medium            |
| Activities/POI      | Google Places; Yelp Places; Tripadvisor; Foursquare | Global coverage and features; rich U.S. reviews; curated travel content; strong POI with documented limits        | Pay-as-you-go (Google); per-call (Yelp); partner-based (Tripadvisor); rate limits (Foursquare) | Medium–High            |
| Currency Conversion | ExchangeRate-API; Fixer; Currencylayer; Open Exchange Rates | Simple pricing and reliable updates; time-series/fluctuation features; broad currency coverage                    | Monthly subscriptions; per-call overage; free tier (OXR) | Low–Medium            |

This table reinforces a central theme: Wanderly’s stack should blend partner-based APIs (for content and conversion) with metered pay-as-you-go services (for elasticity and breadth), wrapped in an abstraction layer that controls cost and resilience via caching and fallback.

Information gaps remain where pricing is not publicly documented or rate limits are unspecified, particularly for Skyscanner and Kayak (flights), Booking.com Demand and Connectivity pricing, Amadeus production pricing, Tripadvisor pricing, Foursquare commercial pricing, and Google Places exact per-SKU costs. These gaps require direct partner engagement and should be addressed in parallel with technical integration.

## Methodology and Evaluation Framework

Our methodology prioritizes official developer portals, pricing pages, and help centers for verifiable facts. Where pricing is not public, we rely on official statements about access models and partner processes. This ensures recommendations are anchored in what partners publish and support.

Evaluation criteria were defined to reflect Wanderly’s business and technical needs:

- Coverage and content depth: geographic reach, inventory breadth, richness of property and POI data, and review content.
- Data freshness and update frequency: cadence of price updates, forecast刷新频率 (frequency), and observed operational performance.
- Pricing model clarity: availability of public pricing or partner terms, rate-limit transparency, and overage mechanics.
- Rate limits and quotas: burst and sustained limits, session guidance, and per-day/per-month caps.
- Integration complexity: authentication flows, approval timelines, SDKs, and documentation quality.
- Reliability and SLAs: uptime, support channels, and published SLAs.
- Licensing and compliance constraints: attribution requirements, display rules, redistribution restrictions, and territorial constraints.

Verification standards required that each factual assertion be traceable to a public, official source wherever possible. Given the information gaps identified, we explicitly note areas requiring partner confirmation and legal review.

## Flight Booking APIs

Flights are the backbone of many itineraries, and the quality of a flight search experience depends on reliable price discovery, coverage across routes and carriers, and a partner model that scales. Three options merit near-term attention.

Skyscanner’s Travel APIs provide real-time and indicative pricing across flights and other verticals, backed by extensive global coverage and partner support. The Flights Live Prices API returns actual prices for specified routes and dates, while indicative options provide planning-level data. Localization via market, locale, and currency parameters is a core feature, and a dedicated partner portal supports integration, revenue management, and account management. Skyscanner’s scope includes over 52 markets, 30 languages, and access to more than 1,300 supply partners, making it a strong first integration for consumer-facing search. Public, numeric pricing for the API is not listed, and access is through partner engagement.[^1][^2]

Amadeus for Developers offers a broad suite for flight search and booking workflows, with a test environment that grants a monthly free request quota and a production environment that maintains the same free quota while charging for additional calls. Rate limits are documented at a category level for self-service APIs, and production pricing details are accessed via the pricing portal, which can require login. This model is familiar to developers building on metered APIs and suits iterative testing and scaled deployment.[^3][^4][^5]

Kayak’s affiliate API is available on a limited basis. Prospective partners must be assessed on website quality, traffic, and marketing plans, and access is granted subject to approval. Kayak offers APIs across flights, hotels, and cars, but public technical documentation and pricing details are not provided. This path can complement Skyscanner for multi-vertical coverage once approved.[^6]

Table 2 compares the flight APIs on scope, pricing transparency, rate limits, integration complexity, and approval timelines.

Table 2. Flight APIs comparison

| Provider     | Scope (Flights)                              | Pricing Availability                    | Rate Limits (Public)                 | Integration Complexity                       | Approval Timeline          |
|--------------|-----------------------------------------------|-----------------------------------------|--------------------------------------|-----------------------------------------------|----------------------------|
| Skyscanner   | Live and indicative prices; localization; broad market/currency support | Partner-based; numeric pricing not public | Not specified in public docs         | Medium: partner onboarding; documented endpoints | Typical partner onboarding |
| Amadeus      | Flight Offers Search/Price; booking-related endpoints; test vs production | Self-service with monthly free quota; production paid beyond quota | Category-level rate limits; per-minute constraints | Medium: test-to-production; metered model             | Immediate for self-service  |
| Kayak        | Flights, hotels, cars                         | Limited access; approval required        | Not public                            | Medium–High: assessment and partner approval  | Variable; depends on assessment |

The table underscores a key trade-off: Skyscanner and Kayak provide consumer-ready price content within partner frameworks, while Amadeus offers a technical platform with clear environment separation and rate-limit governance. For Wanderly, a staged approach—Skyscanner first for price search, Amadeus to explore deeper flight booking workflows, and Kayak contingent on approval—balances speed and long-term capability.

### Skyscanner Flights Live Prices API

Skyscanner’s Flights Live Prices API is designed for real-time price discovery for specified routes and dates. The API supports localization by market, locale, and currency, with the Culture API cataloguing supported values. The broader Travel APIs portfolio spans flights, car hire, and hotels, and a partner portal manages revenue and commissions. Integration requires partner onboarding and adherence to localization requirements, with support provided by engineering resources and an account manager.[^1][^2]

### Amadeus Self-Service APIs

Amadeus provides test and production environments. The test environment offers a monthly free request quota for building and testing applications, while production provides full real-time data with charges applied beyond the free quota. Rate limits are documented for self-service APIs, covering categories such as AI and partner endpoints, with per-minute constraints and overall protection against abuse. Production pricing details are provided via the pricing portal, which may require login and partner engagement.[^3][^5][^4]

### Kayak Affiliate API

Kayak confirms availability of APIs for flights, hotels, and cars, but access is limited and granted based on an assessment of the applicant’s website, traffic, and marketing plans. Pricing is not publicly listed, and access is by contacting Kayak directly. Once approved, the affiliate model supports booking experiences across core travel verticals.[^6]

## Hotel Booking APIs

Hotels require both shopping/pricing APIs for consumer experiences and supply-side management for property partners. Booking.com and Expedia Group provide complementary capabilities.

Booking.com’s Connectivity APIs enable property-level management for availability, rates, and restrictions (ARI), making them ideal for supply-side integrations where Wanderly partners directly with properties. The Demand API, in contrast, is positioned for affiliate partners seeking access to Booking.com’s inventory—including accommodations and other products—for consumer-facing experiences. Public, numeric pricing for Demand and details of production usage for Connectivity are not listed; onboarding is required.[^7][^8][^9][^10][^11]

Expedia Group’s Rapid API is a modular, high-scale lodging platform with claims of access to 700,000–750,000 properties across 250,000 destinations, 24 million property images in 40 languages, and over 68 million reviews. It handles more than six billion API calls daily and offers competitive, commissionable rates. While explicit public usage pricing is not listed, the partner narrative emphasizes strategic account management, content richness, and an evolving schema, indicating a mature partner-led deployment model.[^11]

Table 3 summarizes Booking.com’s two pathways.

Table 3. Booking.com Connectivity vs Demand

| Aspect                  | Connectivity (ARI)                                   | Demand (Affiliate)                                                  |
|-------------------------|-------------------------------------------------------|----------------------------------------------------------------------|
| Primary Use Case        | Property supply-side management                       | Consumer-facing inventory access                                     |
| Key Endpoints/Functions | Rates & Availability (inventory, pricing, restrictions) | Accommodation search and pricing; broader inventory exposure          |
| Access Model            | Property partner onboarding                            | Affiliate partner onboarding                                          |
| Public Pricing          | Not publicly listed                                    | Not publicly listed                                                   |
| Documentation Maturity  | Extensive docs for supply workflows                    | Open API docs for demand endpoints                                    |

For Wanderly, the implication is straightforward: use Demand for consumer shopping of existing Booking.com inventory and explore Connectivity for supply-side features once property partnerships are established. The combination supports both breadth and control.

Table 4 highlights Expedia Rapid’s capabilities as communicated on the developer hub and partner site.

Table 4. Expedia Rapid API capabilities

| Attribute                 | Details                                                                                           |
|--------------------------|---------------------------------------------------------------------------------------------------|
| Inventory                | 700,000–750,000 properties across 250,000 destinations                                            |
| Content Richness         | ~24 million property images in 40 languages; 68+ million reviews                                  |
| Performance              | Handles over 6 billion API calls daily                                                            |
| Rates                    | Competitive, commissionable rates; access to global chains and opaque packages                    |
| Integration Model        | Modular APIs for shopping, booking, payment                                                       |
| Partner Support          | Strategic account managers; technical consultants                                                 |
| Public Pricing           | Not explicitly stated; governed by partner agreements                                             |

The table emphasizes Rapid’s content depth and operational scale. When combined with Booking.com Demand, Wanderly can achieve broad hotel coverage and rich content for consumer experiences, while leaving open future supply-side pathways.

### Booking.com Connectivity (ARI) and Demand APIs

Connectivity (ARI) functions as the supply backbone for property partners: set inventory, pricing, and restrictions with robust documentation and onboarding. The Demand API is positioned for affiliate partners seeking consumer shopping capabilities across accommodation inventory. Public numeric pricing is not listed; usage and onboarding differ by partner type.[^7][^8][^9][^10][^11]

### Expedia Rapid API

Rapid’s modular approach lets partners plug in only the necessary components—shopping, booking, payment—while accessing deep property content and reviews. Claims of scale and partner support point to an enterprise-grade platform. Pricing is not publicly listed; expect partner agreements to govern terms.[^11]

## Weather APIs

Weather enriches itineraries and informs risk mitigation (e.g., alerts). A resilient stack should combine global coverage, flexible pricing, and region-specific sources.

OpenWeather offers a pay-as-you-call One Call 3.0 model with 1,000 free calls per day and metered pricing thereafter, alongside monthly subscription tiers (Startup, Developer, Professional, Expert) that scale rate limits and features. The One Call suite provides current conditions, short- and long-term forecasts, government alerts, and historical data. OpenWeather’s licensing uses Creative Commons Attribution-ShareAlike (CC BY-SA) and Open Data Commons Open Database License (ODbL) for open packages, with Business Licenses for professional plans that modify share-alike and attribution requirements. This flexibility supports both consumer apps and enterprise deployments.[^12][^13][^14]

WeatherAPI provides a free plan and paid tiers (Starter, Pro+, Business, Enterprise) with generous monthly quotas and diverse features: real-time weather, multi-day forecasts, marine and tide data, historical and future weather, alerts, pollen, air quality, search, astronomy, IP lookup, sports, solar irradiance, evapotranspiration, wind at 100 meters, maps, bulk requests, IP blocking, SSL, uptime commitments, SLAs, and commercial use. Update frequencies are every 10–15 minutes for real-time and every 4–6 hours for forecasts, with historical archives available from 2010 onward.[^15][^16]

The U.S. National Weather Service (NWS) API provides free access to forecasts, alerts, observations, aviation data, and related metadata. It uses JSON-LD and GeoJSON formats and imposes reasonable, undisclosed rate limits; exceeding limits results in errors that typically resolve within seconds. Authentication is presently via User-Agent strings, with future API keys indicated. NWS is a strong complement to global providers for U.S. users and specific alerting needs.[^17]

Table 5 compares OpenWeather’s subscription tiers and pay-as-you-call model.

Table 5. OpenWeather pricing and features

| Plan/Model              | Cost               | Rate Limits                         | Update Frequency             | Key Features                                             | License                         |
|-------------------------|--------------------|-------------------------------------|------------------------------|----------------------------------------------------------|----------------------------------|
| Pay-as-you-call (One Call 3.0) | First 1,000 calls/day free; then $0.0015/call | Daily free allowance; metered beyond | Near real-time               | Current, minute/hourly/daily forecasts; alerts; historical | CC BY-SA or ODbL                |
| Startup (Monthly)       | $40/month          | 600 calls/min; 10M calls/month      | Every 2 hours (or less)      | Current weather; daily (16 days); 3-hour (5 days); Weather Maps; Air Pollution; Geocoding | Open License (CC BY-SA / ODbL)  |
| Developer (Monthly)     | $180/month         | 3,000 calls/min; 100M calls/month   | Every 1 hour (or less)       | Adds hourly forecasts (4 days), richer Weather Maps       | Open License (CC BY-SA / ODbL)  |
| Professional (Monthly)  | $470/month         | Up to 30k/min; 1B calls/month; 5k historical calls/day | Every 10 minutes (or less)   | Business license; bulk downloads; expanded maps           | OpenWeather for Business         |
| Expert (Monthly)        | $1,200/month       | Up to 100k/min; 3B calls/month; 50k historical calls/day | Every 10 minutes (or less)   | Adds Road Risk API; broader bulk access                   | OpenWeather for Business         |

This table highlights the dual path Wanderly can take: metered pay-as-you-call for elasticity during growth and subscription tiers for predictable scale and enhanced features.[^12][^13][^14]

Table 6 summarizes WeatherAPI’s plan tiers.

Table 6. WeatherAPI pricing and features

| Plan        | Monthly Price | Calls/Month | Update Frequency               | Notable Features                                                                                   | Uptime/SLA                 |
|-------------|---------------|-------------|--------------------------------|-----------------------------------------------------------------------------------------------------|----------------------------|
| Free        | $0            | 1M          | Real-time every 10–15 minutes; forecast every 4–6 hours | Real-time weather; 3-day forecast; limited alerts, AQI, sports; non-commercial use; link-back required | 95.5% uptime               |
| Starter     | $7            | 3M          | Same as Free                   | Commercial use; search, astronomy, IP lookup; 7-day forecast; marine (no tide)                      | 99% uptime                 |
| Pro+        | $25           | 5M          | Same as Free                   | 14-day forecast; marine with tides; historical (past 365 days); future (300 days); SSL; expanded datasets | 99% uptime                 |
| Business    | $35           | 10M         | Same as Free                   | Historical from 2010; 14-day forecast; expanded datasets including solar irradiance, maps; bulk requests; IP blocking; SSL | 99.9% uptime               |
| Enterprise  | Custom        | Custom      | Daily, hourly, and 15-minute intervals | Full feature set including 15-minute forecast; marine with tides; 365-day future; pollen and AQI history; SLA | 100% uptime; SLA           |

WeatherAPI’s breadth and quotas make it attractive for global coverage with predictable costs, especially for consumer experiences that require forecast horizons and specialized datasets.[^15][^16]

Table 7 provides a snapshot of NWS capabilities.

Table 7. NWS (weather.gov) capabilities

| Data Type      | Endpoints (Examples)                                                            | Formats                  | Rate Limits             | Authentication            |
|----------------|---------------------------------------------------------------------------------|--------------------------|-------------------------|---------------------------|
| Forecasts      | /gridpoints/{wfo},{x},{y}/forecast; /forecast/hourly; /points/{lat},{lon}       | GeoJSON, JSON-LD, DWML, OXML | Reasonable, undisclosed | User-Agent (API key future) |
| Alerts         | /alerts; /alerts/active; by zone/area/region                                    | CAP, JSON-LD             | Reasonable, undisclosed | User-Agent                |
| Observations   | /stations/{id}/observations; /observations/latest; /stations                    | GeoJSON, JSON-LD         | Reasonable, undisclosed | User-Agent                |
| Aviation Data  | /aviation/cwsus; /aviation/sigmets; /stations/{id}/tafs                         | JSON-LD                  | Reasonable, undisclosed | User-Agent                |

NWS’s free access and broad endpoint coverage make it an ideal supplemental source for U.S.-focused features.[^17]

### OpenWeather

OpenWeather’s One Call 3.0 offers current, forecast, and historical data with government alerts. The pay-as-you-call model reduces entry barriers, while monthly tiers scale rate limits and features. Licensing varies: open packages under CC BY-SA/ODbL and business licenses for professional deployments.[^12][^13][^14]

### WeatherAPI

WeatherAPI’s free and paid plans combine generous quotas, diverse data, and frequent updates. The inclusion of marine, pollen, AQI, solar irradiance, maps, and bulk requests supports advanced use cases and operational resilience.[^15][^16]

### NOAA/NWS (US)

NWS provides free forecasts, alerts, observations, and aviation data, with reasonable rate limits and JSON-LD/GeoJSON formats. It is particularly valuable for U.S. alerting and localized forecasts.[^17]

## Activity & Attraction APIs (POI, Reviews, Photos)

Activities and POI data drive discovery and personalization. A blended approach balances global breadth, rich U.S. reviews, and curated travel content.

Google Places is a comprehensive service for location data, search, details, photos, and autocomplete. Billing uses a pay-as-you-go model with per-SKU charges and a monthly credit. Field masks reduce costs by limiting returned data, and Autocomplete (New) sessions lower costs when correctly linked to a Place Details request; abandoned sessions or token reuse negates savings. Pricing is per-SKU and not fully enumerated in usage documentation, requiring reference to the pricing lists and the calculator for accurate estimates. The breadth of features and global coverage make Google Places the backbone of Wanderly’s POI layer.[^18][^19][^20]

Yelp Places API offers consumer-facing local business content with rich photos and reviews and is priced per API call. It provides three monthly plans (Base, Enhanced, Premium) with varying attributes, photos, review highlights, and excerpt counts, plus a 30-day trial with 5,000 free calls. Yelp’s focus on U.S. markets aligns well with deep local content and review-driven experiences.[^21][^22]

Tripadvisor’s Content API provides dynamic access to hotels, restaurants, and attractions with clear rate limits for development and launch phases. Provisional keys permit 50 calls per second and 1,000 calls per day during development and QA. Approved launch integrations are capped at 10,000 calls per day, with a separate mapper key allowed up to 100 calls per second and 25,000 calls per day. Pricing is not publicly listed, and the API is intended for consumer-facing experiences, excluding vacation rentals.[^23][^24]

Foursquare’s Places API is a strong POI data source with well-documented rate limits and usage guidelines. Commercial pricing details are referenced externally, but rate limits and usage policies are clearly published, supporting engineering planning and cost control.[^25][^26]

Table 8 compares Google Places SKUs and billing concepts.

Table 8. Google Places SKUs and billing model

| Concept                     | Description                                                                                         | Cost Control Mechanisms                       |
|----------------------------|-----------------------------------------------------------------------------------------------------|-----------------------------------------------|
| Autocomplete (New) sessions| Session token links autocomplete to Place Details/Address Validation                                | Use sessions; avoid token reuse/abandonment   |
| Place Details (New)        | Rich details for a place; billing depends on fields requested                                       | Field masks to limit data and cost            |
| Nearby/Text Search (New)   | Search for places by proximity or text; billing per SKU                                             | Field masks; optimize request parameters      |
| Monthly Credit             | $200 monthly credit applied to eligible SKUs                                                        | Monitor usage vs credit                       |

This model encourages disciplined engineering: session tokens for autocomplete, field masks for details/search, and careful monitoring of SKU-level consumption.[^18][^19][^20]

Table 9 compares Yelp Places plan features and per-call pricing.

Table 9. Yelp Places plans and features

| Plan      | Monthly Cost | Free Trial Calls | Attributes/Photos/Reviews                     | Notes                                      |
|-----------|--------------|------------------|-----------------------------------------------|--------------------------------------------|
| Base      | $229         | 5,000            | Base attributes; base search filters; no photos/review excerpts | Entry-level consumer content               |
| Enhanced  | $299         | 5,000            | Enhanced attributes; up to 3 photos; up to 3 review excerpts; no Review Highlights | Mid-tier                                   |
| Premium   | $643         | 5,000            | Premium attributes; premium filters; up to 12 photos; Review Highlights; up to 7 excerpts | Richest consumer content                   |

Per-1,000 call overage pricing is listed, and the trial provides early access to an AI API with daily call limits.[^21][^22]

Table 10 summarizes Tripadvisor’s rate limits.

Table 10. Tripadvisor Content API rate limits

| Phase                  | Calls per Second | Calls per Day | Notes                                               |
|------------------------|------------------|---------------|-----------------------------------------------------|
| Development/QA         | 50               | 1,000         | Provisional keys; planning-to-launch within 6 months|
| Approved Launch        | —                | 10,000        | Post-approval; display requirements apply           |
| Location Mapper Key    | 100              | 25,000        | Specific to /location_mapper; lat/long required     |

Pricing is not publicly listed; the API targets consumer-facing experiences with specific display rules.[^23][^24]

Table 11 provides a snapshot of Foursquare rate limits.

Table 11. Foursquare Places API rate limits

| Endpoint Categories      | Rate Limit Guidance                        | Notes                                 |
|--------------------------|--------------------------------------------|---------------------------------------|
| Places search/data       | Documented QPS limits (calculated across endpoints) | Pricing referenced externally; usage guidelines provided |
| Geotagging/check-in      | Documented per-hour/per-token limits       | Authentication via API key            |

Foursquare’s clarity on limits and usage enables robust planning and throttling strategies.[^25][^26]

### Google Places

Google Places offers global search, details, photos, and autocomplete with pay-as-you-go billing per SKU and a monthly credit. Correct use of autocomplete sessions and field masks materially reduces costs. Pricing specifics must be confirmed via the pricing lists and calculator.[^18][^19][^20]

### Yelp Places API

Yelp Places provides consumer-facing U.S. POI data with photos and reviews, structured in Base/Enhanced/Premium plans and per-call pricing. The trial tier facilitates early integration and evaluation.[^21][^22]

### Tripadvisor Content API

Tripadvisor’s API supports hotels, restaurants, and attractions with clear development and launch rate limits and display requirements. Pricing is not publicly listed and requires partner engagement.[^23][^24]

### Foursquare Places API

Foursquare offers deep POI data with published rate limits and usage guidance, suitable as a complement or alternative for specific use cases. Commercial pricing details are referenced externally.[^25][^26]

## Currency Conversion APIs

Accurate, timely currency conversion is essential for transparent pricing in multi-currency itineraries. We evaluated providers on update frequency, quotas, features, and pricing clarity.

ExchangeRate-API offers Free (1,500 requests/month, daily updates), Pro (30,000/month, hourly updates), and Business (125,000/month, 5-minute updates) plans, with yearly discounts and straightforward monthly pricing. It emphasizes developer-friendly integration and high availability.[^25]

Fixer provides multiple endpoints—live rates, conversion, time-series, fluctuation—with update frequencies that improve by tier, ranging from hourly updates to 60-second updates at Professional Plus and custom Volume plans. Pricing spans Free to Professional Plus and Volume, with per-call overage rates and optional platinum support add-ons.[^26]

Currencylayer offers real-time and historical forex rates across 168 currencies and precious metals, with update frequencies from daily to 60 seconds, and features such as time-frame and currency-change queries. Overage billing is transparent and tied to plan allowances.[^27]

Open Exchange Rates (OXR) provides a free plan with hourly updates and USD base, plus paid plans that unlock all base currencies, faster updates, and features like time-series and unlimited requests, with VIP options for SLA and sub-second updates.[^28][^29]

Table 12 compares FX providers’ plans and features.

Table 12. FX providers comparison

| Provider          | Plan         | Monthly Cost | Requests/Month | Update Frequency     | Key Features                                  | Overage Fees            |
|-------------------|--------------|--------------|----------------|----------------------|-----------------------------------------------|-------------------------|
| ExchangeRate-API  | Free         | $0           | 1,500          | Once per day         | Historical data; JSON; simple integration      | N/A                     |
|                   | Pro          | $10          | 30,000         | Every 60 minutes     | Faster updates; email support; enriched data   | N/A                     |
|                   | Business     | $30          | 125,000        | Every 5 minutes      | Priority support; relaxed enforcement          | N/A                     |
| Fixer             | Free         | $0           | 100            | Hourly               | Historical data; SSL                           | N/A                     |
|                   | Basic        | $14.99       | 10,000         | Hourly               | Conversion endpoint; all base currencies       | Per-call (listed)       |
|                   | Professional | $59.99       | 100,000        | 10-minute            | Time-series endpoint                           | Per-call (listed)       |
|                   | Professional Plus | $99.99   | 500,000        | 60-second            | Fluctuation endpoint                           | Per-call (listed)       |
| Currencylayer     | Free         | $0           | 100            | Daily                | Historical rates; HTTPS                        | N/A                     |
|                   | Starter      | $9.99        | 2,500          | Hourly               | Conversion; source currency swapping           | Per-call (listed)       |
|                   | Basic        | $14.99       | 10,000         | Hourly               | Commercial use; conversion                     | Per-call (listed)       |
|                   | Enterprise   | $59.99       | 100,000        | 10-minute            | Time-frame queries                             | Per-call (listed)       |
|                   | Enterprise+  | $99.99       | 500,000        | 60-second            | Currency-change queries                        | Per-call (listed)       |
| Open Exchange Rates | Free       | $0           | 1,000          | Hourly; base USD     | Live/historical rates                          | N/A                     |
|                   | Developer    | $12          | 10,000         | Hourly               | All base currencies                            | N/A                     |
|                   | Enterprise   | $47          | 100,000        | 30-minute            | Time-series requests                           | N/A                     |
|                   | Unlimited    | $97          | Unlimited      | 5-minute             | Conversion requests                            | N/A                     |

This comparison highlights a simple path: start with ExchangeRate-API Pro/Business for predictable pricing and updates, and add Fixer or Currencylayer for advanced endpoints (time-series, fluctuation) and potential failover, with OXR as an alternative offering a VIP tier for enterprise SLAs.[^25][^26][^27][^28][^29]

## Integration Architecture and Requirements

A provider-agnostic architecture with clear abstraction layers will allow Wanderly to blend partner-based APIs and metered services while controlling cost and performance. The architecture should adopt:

- Service abstraction: separate flight, hotel, weather, POI, and FX services with provider adapters.
- Request orchestration: centralized routing with provider health checks and circuit breakers.
- Caching and rate-limit governance: response caching (short TTL for live prices and FX), request coalescing, backoff on 429s, and quota alarms.
- Cost controls: field masks (Google Places), autocomplete sessions (Places), payload pruning, and provider selection based on SLA/cost.
- Compliance: display guidelines (Tripadvisor), attribution and license notices (OpenWeather ODbL/CC BY-SA), Yelp content usage, and Airbnb API Terms when applicable.

Authentication varies by provider. Google Maps Platform requires billing account setup and per-SKU billing, and cost control relies on field masks and session tokens. Foursquare uses API keys with published rate limits, guiding throttling and pagination strategies. Skyscanner and Kayak rely on partner approvals and API keys/tokens issued through their portals. Tripadvisor issues provisional keys with explicit rate limits and six-month timelines for moving from development to launch.

Table 13 maps authentication and rate-limit considerations across core providers.

Table 13. Auth and rate-limit matrix

| Provider       | Auth Method                 | Notable Rate Limits / Controls                                       | Retry Guidance                              |
|----------------|-----------------------------|------------------------------------------------------------------------|---------------------------------------------|
| Google Places  | API key + billing account   | SKU-level billing; $200 monthly credit; Autocomplete sessions; field masks | Retry on transient errors; use sessions     |
| Foursquare     | API key                      | QPS and per-hour limits published; total QPS calculated across endpoints | Backoff on 429; paginate; coalesce requests |
| Skyscanner     | Partner API key/token        | Not publicly specified; governed via partner agreements                | Respect partner guidance                    |
| Kayak          | Partner API key/token        | Not publicly specified; access on limited basis                        | Follow partner approval terms               |
| Tripadvisor    | Provisional/launch API keys  | 50 req/s and 1,000/day (dev); 10,000/day (launch); mapper keys 100 req/s and 25,000/day | Retry after brief interval if limited       |
| OpenWeather    | API key                      | Rate limits vary by plan; pay-as-you-call daily free allowance         | Implement backoff and caching               |
| WeatherAPI     | API key                      | Monthly quotas per plan; uptime tiers                                  | Monitor quotas; schedule bulk requests      |
| NWS            | User-Agent                   | Reasonable, undisclosed rate limits; errors typically resolvable in ~5 seconds | Retry after short delay; avoid proxies      |
| FX providers   | API keys                     | Monthly quotas per plan; per-call overage (Fixer/Currencylayer)         | Cache FX rates; fallback providers          |

This matrix reinforces the need for central request management with cost-aware routing and adaptive throttling.

## Cost Modeling and Capacity Planning

To estimate monthly costs, we constructed scenarios for core paid APIs with publicly listed pricing. Given missing numeric details for several partner APIs, we provide formulas and qualitative guidance.

- Google Places: Monthly cost equals sum(SKU usage × per-SKU price) minus the monthly credit. Use field masks and autocomplete sessions to reduce Place Details costs and capture savings. For accurate per-SKU prices, consult the pricing lists and use the billing calculator.[^18][^20]
- WeatherAPI: Pick a plan aligned to monthly call volumes; Pro+ at $25/month supports up to 5 million calls; Business at $35/month supports up to 10 million calls; Enterprise for custom SLAs and 15-minute forecasts.[^15]
- OpenWeather: Either pay-as-you-call at $0.0015 per call after 1,000 free daily calls, or select a subscription tier (e.g., Startup at $40/month). Estimate calls per minute/day and choose plan to minimize cost while meeting update frequencies.[^12]
- Yelp Places: Monthly plan fees plus per-1,000 call overage; e.g., Enhanced at $299/month plus $6.57 per additional 1,000 calls beyond plan allocations.[^21]
- FX Providers: Select provider plans based on expected monthly requests; Fixer and Currencylayer include overage fees per call beyond quotas.[^26][^27]

Tables 14–17 summarize plan-to-cost mapping for APIs with public pricing.

Table 14. Google Places SKU pricing overview (modeling approach)

| Variable                 | Description                                                     |
|--------------------------|-----------------------------------------------------------------|
| Autocomplete (New)       | Session-based: free if followed by Place Details; otherwise charged |
| Place Details (New)      | Charged per request; cost varies by fields; apply field masks   |
| Nearby/Text Search (New) | Charged per SKU; optimize parameters and result sizes           |
| Monthly Credit           | $200 credit applied to eligible SKUs                            |

Exact per-SKU prices must be sourced from the pricing lists and calculator; model cost as Σ(requests × price) − credit.[^18][^20]

Table 15. WeatherAPI plan-to-cost mapping

| Monthly Calls | Recommended Plan | Cost (Monthly) | Notes                                                   |
|---------------|------------------|----------------|---------------------------------------------------------|
| ≤ 1M          | Free             | $0             | Non-commercial; link-back required                      |
| ≤ 3M          | Starter          | $7             | Commercial use; 7-day forecast; search/astronomy/IP     |
| ≤ 5M          | Pro+             | $25            | 14-day forecast; marine with tides; historical/future   |
| ≤ 10M         | Business         | $35            | Expanded datasets; maps; bulk requests; IP blocking     |
| > 10M         | Enterprise       | Custom         | SLA; 15-minute forecast; higher uptime                  |

Choose plan based on actual call volumes and feature needs; annual discounts apply.[^15]

Table 16. OpenWeather subscription vs pay-as-you-call cost scenarios

| Scenario (Monthly Calls)        | Pay-as-you-call Cost                      | Subscription Tier Suitability             |
|----------------------------------|-------------------------------------------|-------------------------------------------|
| 100,000                          | ~ $150 (after 1,000 free/day allowance)   | Startup ($40) if call distribution fits   |
| 1,000,000                        | ~ $1,500                                  | Developer ($180) for higher RPM and features |
| 10,000,000                       | ~ $15,000                                 | Professional ($470) with higher RPM        |

These are illustrative estimates; actual cost depends on daily distribution and feature mix. Select subscription for predictable scale and features; pay-as-you-call for elasticity.[^12]

Table 17. Yelp Places plan selection

| Expected Monthly Calls | Plan    | Base Monthly Cost | Overage per 1,000 Calls | Notes                         |
|------------------------|---------|-------------------|-------------------------|-------------------------------|
| ≤ Plan Allocation      | Base/Enhanced/Premium | $229–$643          | N/A                      | Choose by feature requirements |
| > Allocation           | Any     | As above          | $5.91–$14.13            | Overage billed per 1,000 calls |

Pick plan by content needs (photos, review excerpts) and call volume; monitor overage.[^21][^22]

For FX, select ExchangeRate-API Pro ($10 for 30k calls/hourly updates) or Business ($30 for 125k calls/5-minute updates) for simple pricing. Use Fixer or Currencylayer for advanced endpoints and overage flexibility.[^25][^26][^27]

## Compliance and Licensing Considerations

Compliance obligations materially affect product design, especially display rules and licensing.

- OpenWeather licensing: Open packages use CC BY-SA/ODbL, with Business Licenses for professional plans that remove share-alike obligations (attribution remains). Enterprise terms may remove attribution and offer SLAs. Attribution requirements must be honored in consumer interfaces for open packages.[^12]
- NWS usage: Free access with reasonable rate limits; JSON-LD and GeoJSON formats; authentication presently via User-Agent. Respect rate limits and retry guidance.[^17]
- Google Places: Billing policies and SKU-level charges govern cost; monthly credits apply; adhere to usage and billing terms; field masks and sessions reduce cost and align with best practices.[^18]
- Tripadvisor content: Consumer-facing use only; explicit display requirements; development and launch rate limits; six-month timeline to move from provisional keys to approved launch; no vacation rental content.[^24][^23]
- Yelp content: Licensed for consumer-facing use; plan entitlements govern attributes, photos, and review excerpts; display must comply with Yelp’s content policies.[^21]
- Airbnb API Terms: Registration and program participation required; scope access determined by Airbnb; robust security and privacy obligations (MFA, patching timelines, encryption); incident reporting within 1 hour for high-risk; deletion of personal data within 30 days of termination; broad restrictions on scraping, static copies, and derivative databases; cross-border transfers governed by Standard Contractual Clauses. If Airbnb data is later integrated, strict adherence is mandatory.[^30]

Table 18 summarizes key licensing and display requirements.

Table 18. Licensing and display requirements

| Provider        | License/Policy Summary                                         | Attribution | Display/Use Constraints                         |
|-----------------|----------------------------------------------------------------|------------|-------------------------------------------------|
| OpenWeather     | CC BY-SA/ODbL; Business/Enterprise modify obligations          | Required for open packages | Honor license terms; consider Business license |
| NWS             | Free public service; JSON-LD/GeoJSON                           | Not required | Respect reasonable rate limits; User-Agent     |
| Google Places   | Pay-as-you-go billing; SKU policies                            | Not applicable | Field masks; autocomplete sessions             |
| Tripadvisor     | Consumer-facing content; display rules; rate limits            | As required | Approval timeline; mapper key rules            |
| Yelp Places     | Data licensing for consumer use; plan entitlements             | As required | Photos/review excerpts per plan; policy compliance |
| Airbnb          | API Terms; security and privacy obligations; prohibited uses   | Not applicable | Program participation; strict controls         |

These obligations must be incorporated into product design, legal review, and operational playbooks.

## Recommendations for Wanderly

We propose a pragmatic stack aligned to coverage, features, and cost efficiency:

- Flights: Skyscanner Flights Live Prices API for search and pricing; engage Amadeus for deeper booking flows; apply to Kayak for potential multi-vertical coverage.[^1][^2][^3][^5][^6]
- Hotels: Booking.com Demand API for affiliate shopping; Expedia Rapid API for breadth and content; evaluate Booking.com Connectivity (ARI) as supply partnerships develop.[^7][^8][^9][^10][^11]
- Weather: OpenWeather (pay-as-you-call or Startup) for global coverage and flexibility; WeatherAPI Pro+/Business for rich features and quotas; leverage NWS for U.S.-specific alerts and forecasts.[^12][^13][^14][^15][^16][^17]
- Activities/POI: Google Places as global backbone with strict cost controls (field masks, sessions); Yelp Places for U.S. review depth; Tripadvisor and Foursquare for curated travel content and POI enrichment where approvals and rate limits permit.[^18][^19][^20][^21][^22][^23][^24][^25][^26]
- Currency: Primary provider ExchangeRate-API Pro/Business for predictable updates; secondary provider (Fixer/Currencylayer/Open Exchange Rates) for advanced features and failover.[^25][^26][^27][^28][^29]

Key risk mitigations:

- Partner approvals: Apply early to Skyscanner, Kayak, Tripadvisor, and Yelp Places; plan for lead times and compliance reviews.
- Cost control: Implement field masks and autocomplete sessions (Google Places), caching and coalescing (FX, POI), and backoff/circuit breakers (rate limits).
- Compliance: Integrate display requirements (Tripadvisor), attribution (OpenWeather), Yelp content policies, and Airbnb security/privacy terms if applicable.
- Performance: Centralize request management; schedule bulk requests; monitor quotas and set alarms.

Table 19 outlines the phased rollout.

Table 19. Phased rollout plan

| Phase        | Scope                                            | Provider(s)                         | Success Criteria                                        | Risks                               | Owner        |
|--------------|--------------------------------------------------|-------------------------------------|---------------------------------------------------------|-------------------------------------|--------------|
| MVP          | Flights search/pricing; Hotels shopping; Global weather; Basic POI; FX | Skyscanner; Booking.com Demand; OpenWeather/WeatherAPI; Google Places; ExchangeRate-API | Stable search; accurate pricing; responsive UI; controlled costs | Partner approval delays; cost overruns | Product + Eng |
| Phase 2      | US alerts; Review depth; Time-series FX; Optimization | NWS; Yelp Places; Fixer/Currencylayer | US alerts integrated; enriched reviews; FX history; lower cost per call | Rate limits; content policy compliance | Product + Eng |
| Phase 3      | Supply-side features; Enterprise SLAs; Expansion | Booking.com Connectivity; OpenWeather Enterprise; Tripadvisor; Foursquare | Property management features; SLA uptime; broader content | Legal reviews; enterprise onboarding | Partnerships |

This plan sequences partner approvals and technical integration, anchoring Wanderly’s ability to deliver a differentiated planning experience quickly.

## Implementation Roadmap

The roadmap converts recommendations into execution steps with dependencies and decision gates.

- Provider onboarding:
  - Flights: Skyscanner partner application; technical discovery; localization setup; revenue/commission configuration.[^1][^2]
  - Hotels: Booking.com Demand onboarding; Expedia Rapid setup; explore Connectivity.[^8][^9][^10][^11]
  - POI: Google Maps Platform billing setup; Yelp Places licensing; Tripadvisor application; Foursquare developer key.[^18][^21][^23][^25][^26]
  - Weather: OpenWeather API key; WeatherAPI plan selection; NWS User-Agent policies.[^12][^15][^17]
  - FX: ExchangeRate-API; Fixer/Currencylayer/Open Exchange Rates keys.[^25][^26][^27][^28][^29]

- Integration milestones:
  - Authentication and key management.
  - Data models: normalized schemas for flights, hotels, weather, POI, FX.
  - Rate-limit handling and retries: backoff, coalescing, circuit breakers.
  - Caching strategy: short TTL for volatile data; longer TTL for static content.
  - Cost monitoring: per-provider dashboards and alarms.

- Testing and QA:
  - Load testing under peak traffic.
  - Rate-limit stress tests.
  - Cost simulation (Google Places SKUs; FX overage).

- Rollout:
  - Feature flags and canary deployments.
  - Observability: logs, metrics, traces.
  - Incident playbooks: partner SLAs, failover routing.

Table 20 summarizes tasks, dependencies, timelines, and success criteria.

Table 20. Implementation task tracker

| Task                              | Dependency                        | Timeline (Weeks) | Owner        | Success Criteria                              |
|-----------------------------------|-----------------------------------|------------------|--------------|-----------------------------------------------|
| Skyscanner partner onboarding     | Application approval              | 2–4              | Partnerships | API keys issued; localization configured       |
| Booking.com Demand setup          | Partner onboarding                | 2–3              | Engineering  | Accommodation search returning results         |
| Expedia Rapid integration         | Partner onboarding                | 3–5              | Engineering  | Modular endpoints operational                  |
| Google Places billing setup       | Account provisioning              | 1                | Engineering  | SKUs active; field masks/sessions implemented  |
| Yelp Places licensing             | Plan selection                    | 1–2              | Legal/BD     | Contract executed; trial calls operational     |
| Tripadvisor application           | Product demo URL                  | 2–3              | Partnerships | Provisional keys issued; rate limits verified  |
| OpenWeather/WeatherAPI keys       | Plan selection                    | 1                | Engineering  | Calls flowing; quotas/alerts configured        |
| FX provider integration           | Plan selection                    | 1                | Engineering  | Rates cached; fallback routing active          |
| Caching and throttling            | Provider adapters                 | 2                | Engineering  | 429s minimized; cost per call within target    |
| Observability and alarms          | Centralized logging/metrics       | 2                | Engineering  | Dashboards live; on-call runbook approved      |

This roadmap balances speed and diligence, ensuring Wanderly can launch an MVP and expand features with controlled risk.

## Appendix

### Endpoint References

- Booking.com Connectivity ARI: rates, availability, restrictions.[^7]
- Booking.com Demand API: accommodation and related inventory.[^8][^9]
- Expedia Rapid API: lodging shopping, booking, content.[^11]
- Skyscanner Flights Live Prices: real-time flight pricing; Culture and Geo APIs for localization and locations.[^1][^2]
- OpenWeather One Call 3.0: current, forecast, alerts, historical.[^13]
- WeatherAPI endpoints: real-time, forecast, marine, historical/future, alerts, pollen, AQI, astronomy, IP lookup, sports, solar irradiance, maps, bulk.[^15]
- NWS API endpoints: forecasts, alerts, observations, aviation, radar server status.[^17]
- Google Places: overview, usage and billing policies.[^18][^19][^20]
- Yelp Places API: consumer-facing POI content and licensing.[^21][^22]
- Tripadvisor Content API: hotels, restaurants, attractions; rate limits and mapper.[^23][^24]
- Foursquare Places API: search, details; rate limits and usage.[^25][^26]
- FX endpoints: ExchangeRate-API, Fixer, Currencylayer, Open Exchange Rates plans/features.[^25][^26][^27][^28][^29]

### Glossary

- ARI: Rates & Availability (inventory management).
- SKU: Stock Keeping Unit; in Google Places, a billing unit for specific features.
- OXR: Open Exchange Rates.
- NWS: National Weather Service.
- CC BY-SA: Creative Commons Attribution-ShareAlike license.
- ODbL: Open Database License.

### Rate-Limit Troubleshooting Guide

- 429 errors: Implement exponential backoff; coalesce concurrent requests; respect per-provider QPS.
- Session tokens (Google Places): Ensure Place Details follows Autocomplete to capture session savings.
- Field masks (Google Places): Request only necessary fields to reduce processing and billing.
- NWS limits: Retry after ~5 seconds; avoid proxies; include User-Agent.
- Tripadvisor mapper: Use dedicated mapper key; validate lat/long mapping.
- Foursquare: Monitor per-hour/token limits; paginate results.

### Cost Estimation Formulas

- Google Places: Monthly Cost = Σ(requests × per-SKU price) − $200 monthly credit.[^18][^20]
- OpenWeather pay-as-you-call: Cost ≈ max(0, (daily_calls − 1,000) × $0.0015) × days_in_month.[^12]
- WeatherAPI: Select plan aligned to monthly calls; annual discount available.[^15]
- Yelp Places: Monthly Cost = Plan Fee + (max(0, calls − plan_allocation) / 1,000 × overage_rate).[^21]
- FX overage (Fixer/Currencylayer): Overage Cost = max(0, requests − allowance) × per-call overage fee.[^26][^27]

## Information Gaps

The following information is not publicly available in the referenced materials and requires direct partner engagement:

- Skyscanner: Numeric pricing and rate limits for Travel APIs (partner-only).
- Kayak: Pricing and technical documentation for API access (limited access; approval required).
- Booking.com: Explicit usage pricing for Demand API and production usage details for Connectivity.
- Amadeus: Exact production pricing per endpoint and cost-per-call details (self-service test free quota; production paid beyond quota).
- Tripadvisor: Public pricing for Content API; only rate limits and eligibility guidelines are available.
- Foursquare: Detailed commercial pricing.
- Google Places: Exact per-SKU numeric pricing (varies by SKU; see pricing lists).

Addressing these gaps early will refine capacity planning and reduce integration risk.

## References

[^1]: Introduction - API Developer Documentation - Skyscanner. https://developers.skyscanner.net/docs/intro  
[^2]: Flights Live Prices API Overview - Skyscanner. https://developers.skyscanner.net/docs/flights-live-prices/overview  
[^3]: Pricing - Amadeus for Developers. https://developers.amadeus.com/self-service/apis-docs/guides/developer-guides/pricing/  
[^4]: API Rate Limits - Amadeus for Developers. https://developers.amadeus.com/self-service/apis-docs/guides/developer-guides/api-rate-limits/  
[^5]: Self-Service Pricing | Amadeus for Developers. https://developers.amadeus.com/pricing  
[^6]: Do you offer an API? - KAYAK Affiliate Support & FAQ. https://help.affiliates.kayak.com/article/812-do-you-offer-an-api  
[^7]: Rates & Availability API Overview - Booking.com. https://developers.booking.com/connectivity/docs/ari  
[^8]: Booking.com Demand API. https://developers.booking.com/demand/docs/open-api/demand-api  
[^9]: Accommodation - Booking.com Demand API. https://developers.booking.com/demand/docs/open-api/demand-api/accommodations  
[^10]: About the Booking.com Connectivity APIs. https://developers.booking.com/connectivity/docs  
[^11]: Rapid API - Expedia Group Partner Solutions. https://partner.expediagroup.com/en-us/solutions/build-your-travel-experience/rapid-api  
[^12]: Pricing - Weather from OpenWeatherMap. https://openweathermap.org/price  
[^13]: One Call API 3.0 - OpenWeatherMap. https://openweathermap.org/api/one-call-3  
[^14]: Weather API - OpenWeatherMap. https://openweathermap.org/api  
[^15]: Pricing - WeatherAPI.com. https://www.weatherapi.com/pricing.aspx  
[^16]: Free Weather API - WeatherAPI.com. https://www.weatherapi.com/  
[^17]: API Web Service - National Weather Service (weather.gov). https://www.weather.gov/documentation/services-web-api  
[^18]: Places API Usage and Billing - Google for Developers. https://developers.google.com/maps/documentation/places/web-service/usage-and-billing  
[^19]: Overview | Places API - Google for Developers. https://developers.google.com/maps/documentation/places/web-service/overview  
[^20]: Google Maps Platform core services pricing list | Pricing and Billing. https://developers.google.com/maps/billing-and-pricing/pricing  
[^21]: Pricing | Yelp Data Licensing. https://business.yelp.com/data/resources/pricing/  
[^22]: Yelp Places API | Yelp Data Licensing. https://business.yelp.com/data/products/places-api/  
[^23]: Content API - Tripadvisor Developer Portal. https://developer-tripadvisor.com/content-api/  
[^24]: Content API / FAQs - Tripadvisor Developer Portal. https://developer-tripadvisor.com/content-api/FAQ/  
[^25]: Rate Limits - Docs - Foursquare. https://docs.foursquare.com/developer/reference/rate-limits  
[^26]: API Usage - Docs - Foursquare. https://docs.foursquare.com/developer/reference/places-api-usage  
[^27]: Fixer API - Foreign Exchange Rates & Currency Conversion API. https://fixer.io/  
[^28]: Currencylayer Pricing. https://currencylayer.com/pricing  
[^29]: Pricing and App ID Signup - Open Exchange Rates. https://openexchangerates.org/signup  
[^30]: API Terms of Service - Airbnb Help Center. https://www.airbnb.com/help/article/3418  
[^31]: Amadeus for Developers: Connect to Amadeus travel APIs. https://developers.amadeus.com/  
[^32]: ExchangeRate-API - Free & Pro Currency Converter API. https://www.exchangerate-api.com/