

# **Comprehensive Technical Specification and Architectural Strategy for the Fantasy Premier League (FPL) Data Ecosystem**

## **1\. Executive Summary and Architectural Landscape**

The Fantasy Premier League (FPL) operates one of the most significant, high-volume data ecosystems in the sports entertainment sector. While the platform does not offer a formally documented public API for third-party developers, the architecture powering its web and mobile applications is built upon a standard, accessible RESTful infrastructure. This accessibility has spawned a sophisticated shadow economy of analytics platforms, transfer recommendation engines, and real-time tracking dashboards that rely entirely on the programmatic consumption of FPL data.1

This report provides an exhaustive technical analysis of the FPL data interface. It is designed for software architects, data engineers, and quantitative analysts seeking to build scalable applications atop this infrastructure. The analysis moves beyond simple endpoint enumeration to explore the underlying data models—ranging from the monolithic "bootstrap" static data to the high-velocity live gameweek feeds. It addresses critical engineering challenges such as the "N+1" query problem inherent in league tracking, the nuances of session-based authentication for private user data, and the implementation of linear optimization algorithms for squad selection.3

The architectural philosophy of the FPL API is characterized by a "read-heavy" design pattern. It relies on massive, cached JSON payloads for static data (players, teams, events) to minimize server load, while offering granular, parameterized endpoints for dynamic data (live scores, league standings). A robust abstraction layer must therefore handle the normalization of these relational data points, manage aggressive caching strategies to respect undocumented rate limits, and provide strictly typed interfaces to ensure type safety in downstream development.5

By synthesizing data from community documentation, open-source repositories, and traffic analysis, this report establishes a definitive reference for the FPL API as of the 2025 season. It dissects the mechanisms of player pricing models, the calculation of the Bonus Points System (BPS), and the specific network protocols required to authenticate and maintain persistent sessions.7

---

## **2\. Core Data Infrastructure: The Bootstrap Model**

The foundational architectural pattern of the FPL API is the "Bootstrap" model. In many modern microservice architectures, a client might be required to make dozens of concurrent requests to assemble a complete application state—fetching user data, then game configuration, then player lists, and finally team details. FPL minimizes this "chatty" network behavior by delivering the entire game state in a single, monolithic payload known as bootstrap-static.

### **2.1 The bootstrap-static Endpoint: The "God Object"**

The endpoint bootstrap-static acts as the central source of truth for the FPL ecosystem. It is a publicly accessible GET endpoint that returns a substantial JSON object containing the metadata required to render the application skeleton. This includes the complete roster of players (referred to as "elements"), the twenty Premier League clubs ("teams"), the gameweek schedule ("events"), and the scoring rules ("game\_settings").9

* **URL:** https://fantasy.premierleague.com/api/bootstrap-static/  
* **Method:** GET  
* **Authentication:** Public (No authentication required)  
* **Content-Type:** application/json  
* **Update Frequency:** This file is dynamic despite its name. It updates immediately following the conclusion of matches (to update stats), daily (for price changes), and sporadically (for fixture rescheduling or player additions).9

The response object is divided into several key collections, each serving a distinct architectural function. Understanding the relational mapping between these collections is the first step in building a coherent abstraction layer.9

#### **2.1.1 The events Collection (Gameweek Management)**

The events array defines the temporal structure of the season. Each object within this array represents a single "Gameweek" (GW), providing the status flags that drive the application's state machine.

| Field | Type | Description | Architectural Implication |
| :---- | :---- | :---- | :---- |
| id | Integer | Unique identifier (1-38). | Serves as the primary foreign key for linking fixture schedules and live scoring data. |
| name | String | Display name (e.g., "Gameweek 1"). | Used for UI rendering and labeling. |
| deadline\_time | ISO String | The strict transfer deadline. | Critical for "countdown" features. API writes (transfers) are rejected by the backend immediately past this timestamp.12 |
| finished | Boolean | True if all matches are complete and processing is finalized. | This flag is the trigger for "Final" league table calculations. Until this is true, all ranks are provisional.12 |
| data\_checked | Boolean | True if points have been manually verified. | Distinguishes between "Live" provisional scores and "Confirmed" scores. |
| average\_entry\_score | Integer | The global average score. | Benchmark for "par" score calculations in analytics dashboards.9 |
| highest\_score | Integer | The global max score. | Used for contextual ranking data. |
| chip\_plays | Array | Usage stats for chips (Wildcard, Free Hit). | Essential for analyzing "template" strategies and chip usage trends across the entire user base.2 |
| most\_selected | Integer | Player ID of the highest ownership. | Indicator of "template" saturation. |
| top\_element | Integer | Player ID of the GW's highest scorer. | Used for highlighting the "Player of the Week." |

**Insight on State Management:** The distinction between finished and data\_checked is subtle but critical for tracking applications. A gameweek can have all matches played, yet finished remains false. This intermediate state usually indicates that the automatic substitution process or the Bonus Points System (BPS) finalization is currently executing on the server. Applications must poll this endpoint and wait for data\_checked: true before considering a gameweek closed and archiving the data.9

#### **2.1.2 The teams Collection (Club Metadata)**

This collection provides the metadata for the 20 Premier League clubs participating in the current season.

* **code vs. id:** The id field (1-20) is transient and assigned alphabetically at the start of each season (e.g., Arsenal is usually 1, Aston Villa 2). However, the code field is a persistent unique identifier for the club entity that remains constant across seasons. Data architects building multi-season databases must use code as the primary key to link historical performance.12  
* **Strength Metrics:** The API exposes internal "strength" ratings used for the Fixture Difficulty Rating (FDR). These include strength, strength\_overall\_home, strength\_overall\_away, strength\_attack\_home, and strength\_defence\_away.12 These integers (typically ranging from 1000 to 1350\) allow developers to build more granular difficulty models than the simplified 1-5 visual scale presented on the website.

#### **2.1.3 The elements Collection (Player Data)**

This is the most voluminous and significant section of the bootstrap object, containing detailed attributes for every registered player. It serves as the master lookup table for the entire application.

| Field | Type | Description | Insight & Context |
| :---- | :---- | :---- | :---- |
| id | Integer | Unique Player ID. | **Warning:** Like team IDs, these are reset every season based on team order. They are not persistent across years.11 |
| web\_name | String | Display name (e.g., "Haaland"). | The name used in UI components. |
| element\_type | Integer | Position ID (1=GKP, 2=DEF, 3=MID, 4=FWD). | Requires a join with the element\_types collection for human-readable positions.11 |
| team | Integer | Team ID. | Requires mapping to the teams collection for the club name. |
| now\_cost | Integer | Current price. | Stored as an integer (e.g., 140 represents £14.0m). Divide by 10 for display.12 |
| status | String | Availability status code. | 'a' (available), 'd' (doubtful), 'i' (injured), 's' (suspended), 'u' (unavailable), 'n' (loan).13 |
| chance\_of\_playing\_next\_round | Integer | Probability (0, 25, 50, 75, 100). | Critical input for Expected Points (xP) models. Null usually implies 100% availability.12 |
| form | Float | Average points over last 30 days. | The Official FPL metric for "Form," though often considered less predictive than xG/xA by advanced analysts. |
| ep\_next | Float | "Expected Points" (Official). | FPL's internal projection for the upcoming gameweek. This often diverges from betting market odds and is based on form/fixture.14 |
| ict\_index | Float | Index of Influence, Creativity, Threat. | A proprietary metric used to break ties in transfers/pricing. It aggregates underlying stats to measure player impact.14 |
| transfers\_in\_event | Integer | Net buy volume this GW. | The primary driver for Price Change algorithms.7 |
| cost\_change\_start | Integer | Total price change since GW1. | Used to calculate the "selling price" (Current Price \- (Price Rise / 2)).14 |

**Second-Order Insight on Pricing Algorithms:** The fields transfers\_in\_event and transfers\_out\_event are the raw materials for the community's "Price Prediction" markets. FPL uses a threshold system based on ownership percentages to trigger price rises or falls. By monitoring the delta of these fields over time (via hourly snapshots of the bootstrap file), analysts can reverse-engineer the "delta" required for a price change. However, the exact algorithm involves a "variable sensitivity" factor that FPL keeps hidden to prevent total manipulation of the market.7

#### **2.1.4 The element\_types Collection (Position Definitions)**

This small reference array defines the rules for each position (Goalkeeper, Defender, Midfielder, Forward).

* **squad\_select:** The number of players of this type required in a squad (e.g., 2 GKP, 5 DEF, 5 MID, 3 FWD).  
* **squad\_min\_play:** The minimum number required to form a valid lineup (e.g., 1 GKP, 3 DEF).  
* **ui\_shirt\_specific:** Booleans indicating if specific shirt graphics are needed.

This collection allows the API to be agnostic to rule changes. If FPL were to change the rules to allow 4 Forwards, the frontend would adapt dynamically by reading this configuration rather than having hardcoded rules.11

---

## **3\. High-Fidelity Player Intelligence and Metrics**

While bootstrap-static provides the current state, deep analysis requires longitudinal data to identify trends. The element-summary endpoint acts as the historical record and forward-looking schedule for individual entities. This is the endpoint queried when a user clicks on a player's shirt to view their history.

### **3.1 Endpoint Specification: element-summary**

* **URL:** https://fantasy.premierleague.com/api/element-summary/{element\_id}/  
* **Method:** GET  
* **Access:** Public  
* **Use Case:** Drawing graphs of player form, calculating xG underperformance, and assessing upcoming fixture difficulty.10

### **3.2 Data Abstraction Layers**

The JSON response is segmented into three logical blocks, each requiring specific handling in an abstraction layer:

#### **3.2.1 fixtures (The Future Horizon)**

This array lists all remaining matches for the player.

* **Key Fields:** event (Gameweek ID), team\_h (Home Team ID), team\_a (Away Team ID), difficulty.  
* **FDR Integration:** The difficulty field (1-5) is derived from the teams strength setting relative to the player's team.  
* **Abstraction Note:** A raw API response returns numeric IDs (e.g., Home Team: 14). An effective abstraction layer must join this with the teams bootstrap data to replace the team\_h and team\_a IDs with actual Team Objects (e.g., "Manchester United") for easier consumption by the UI or analysis scripts.9

#### **3.2.2 history (The Current Campaign)**

This is a transaction log of every match the player has participated in during the *current* season. It is the primary source for "Form" calculations.

* **Fields:** minutes, total\_points, goals\_scored, assists, bps (Bonus Points System score), xG (Expected Goals), xA (Expected Assists), value (Cost at the time of the match), transfers\_balance (Net transfers for that specific gameweek).  
* **Analytical Application:** This dataset is utilized to calculate advanced metrics such as "Points Per 90" (PP90) and "Value Added" (Points / Cost). Crucially, it allows analysts to strip out noise—such as a defender scoring a lucky long-range goal—by looking at underlying metrics like ict\_index or bps to see if the performance is sustainable.9  
* **xG/xA Integration:** Recently, FPL integrated Opta's expected data directly into this endpoint. This allows for the calculation of "Delta" metrics (e.g., Goals Scored \- xG) to identify players who are overperforming (running hot) or underperforming (due for a haul).12

#### **3.2.3 history\_past (The Archive)**

This array provides summary data from previous years.

* **Fields:** season\_name, total\_points, minutes, start\_cost, end\_cost.  
* **Usage:** Used for regression baselines. For example, determining if a player is historically a "slow starter" or performs better in the second half of the season. It is also used to identify price trends—checking if a player typically rises or falls in value over a full season.9

---

## **4\. Real-Time Gameweek Live Scoring Architecture**

Tracking live scores as matches occur requires a fundamentally different architectural approach than static data analysis. The bootstrap-static endpoint only updates periodically. For real-time data, developers must query the event/{id}/live endpoint.

### **4.1 The Live Data Feed**

* **URL:** https://fantasy.premierleague.com/api/event/{event\_id}/live/  
* **Method:** GET  
* **Structure:** A sparse array where the index corresponds to the Player ID.  
* **Latency:** Updates approximately every 2-5 minutes during live matches.

**Payload Schema:**

JSON

{  
  "elements": \[  
    {  
      "id": 123,  
      "stats": {  
        "minutes": 90,  
        "goals\_scored": 1,  
        "total\_points": 9,  
        "bonus": 3,  
        "bps": 45  
      },  
      "explain": \[  
        {   
          "fixture": 24,   
          "stats": \[   
            { "identifier": "goals\_scored", "points": 4, "value": 1 },  
            { "identifier": "bonus", "points": 3, "value": 1 }  
          \]   
        }  
      \]  
    }  
  \]  
}

**Mechanism:**

* **stats Object:** This contains the aggregated totals for the gameweek. It is the "display" value.  
* **explain Array:** This provides the *audit trail* of how those points were derived. It breaks down the score by fixture (relevant for Double Gameweeks) and by action (e.g., 4 points for a goal, 3 points for bonus, \-1 for a yellow card). This granular breakdown is essential for verifying scores and debugging point calculations in third-party apps.2

### **4.2 The Bonus Points System (BPS) Calculation**

The API exposes the raw bps score in real-time within the stats object. However, the *awarding* of actual bonus points (1-3) is a post-processing event that happens after the match.

The Algorithm:  
The BPS is calculated using a complex formula based on Opta statistics.

* **Base Actions:** Playing 1-60 mins (3 bps), over 60 mins (6 bps).  
* **Positive Actions:** Goals (Forward: 24 bps, Midfielder: 18 bps), Assists (9 bps), Clean Sheets (12 bps).  
* **Defensive Metrics:** Clearances, Blocks, and Interceptions (CBI). 1 bps is awarded for every 2 CBI. Recoveries grant 1 bps for every 3\.  
* **Passing:** Pass completion rates (70-79% \= 2 bps, 80-89% \= 4 bps, 90%+ \= 6 bps) apply only if 30+ passes are attempted.  
* **Negatives:** Yellow cards (-3 bps), Red cards (-9 bps), Missing a big chance (-3 bps).8

Abstraction Requirement:  
A robust API wrapper must implement a "BPS Projector." Since the API provides the raw bps value in real-time, the wrapper should:

1. Fetch the live data for all players in a specific fixture.  
2. Sort players by their bps value descending.  
3. Project who *currently* holds the 3, 2, and 1 bonus points positions.  
4. Handle tie-breakers (if two players tie for 1st, both get 3 points, and the 2nd place point is skipped).20

---

## **5\. User Data and Authentication Strategy**

While generic data (players, fixtures) is public, accessing user-specific data (My Team, private Mini-Leagues) requires authentication. The FPL API does not utilize standard OAuth2 protocols. Instead, it relies on a legacy session-cookie mechanism that mimics a browser session.

### **5.1 Authentication Flow**

To access endpoints like my-team/{id}, the client must first establish a session with the FPL web server. This is a multi-step process that is often the stumbling block for new developers.21

1. **POST Request:** The client must send a POST request to https://users.premierleague.com/accounts/login/.  
   * **Payload:**  
     * login: The user's email address.  
     * password: The user's password.  
     * app: Must be set to "plfpl-web".  
     * redirect\_uri: https://fantasy.premierleague.com/a/login.  
   * **Headers:** The User-Agent is critical. The API frequently rejects requests from generic Python/Node agents (e.g., python-requests/2.25). The header must spoof a legitimate browser, e.g., "Mozilla/5.0 (Macintosh; Intel Mac OS X 10\_15\_7)...".21  
2. **Session Capture:** On a successful login, the server responds with a 302 Redirect. Crucially, it sets several cookies in the response headers.  
   * **pl\_profile:** This is the primary session token (likely a JWT or signed session ID) that identifies the user.  
   * **sessionid:** The standard Django session ID.  
3. **Authenticated Requests:** For all subsequent requests to private endpoints (e.g., api/my-team/), the client must include these cookies in the request header. In Python's requests library, this is handled automatically by using a Session object. In stateless environments (like serverless functions), these cookies must be manually serialized and passed.22

### **5.2 The "My Team" Endpoint**

* **URL:** https://fantasy.premierleague.com/api/my-team/{manager\_id}/  
* **Access:** Authenticated Only.  
* **Data Content:**  
  * picks: The current lineup (Player IDs, position in lineup 1-15, captaincy status).  
  * chips: Status of chips (played, available, active).  
  * transfers: Information on transfers made *this gameweek* (cost, number made, bank remaining).  
* **Privacy Rationale:** This endpoint reveals the user's team *before* the gameweek deadline. Accessing this allows a user to see their own moves. In contrast, the public endpoint entry/{id}/event/{gw}/picks only reveals team data *after* the deadline has passed to prevent cheating (e.g., copying a rival's transfers).10

---

## **6\. League Infrastructure and The "N+1" Engineering Challenge**

One of the most popular application scenarios for the FPL API is the "Live Mini-League Tracker," which updates league standings in real-time as matches are played. This presents a significant data engineering challenge known as the "N+1" query problem.

### **6.1 League Endpoints**

* **Classic Leagues:** https://fantasy.premierleague.com/api/leagues-classic/{league\_id}/standings/  
* **H2H Leagues:** https://fantasy.premierleague.com/api/leagues-h2h-matches/league/{league\_id}/

### **6.2 The "N+1" Problem**

The official standings endpoint only provides the *total score* for each manager as of the *start* of the gameweek (or updated overnight). It does not provide the *live* score during matches.

To calculate a live table, an application must:

1. **Fetch Standings (1 Request):** Call the league endpoint to get a list of Manager IDs (e.g., 50 managers).  
2. **Fetch Team Details (N Requests):** For *every* manager in the list, the app must call entry/{id}/event/{gw}/picks to see which players they own.  
3. **Fetch Live Scores (1 Request):** Call event/{gw}/live to get the points for all players.  
4. **Compute:** Map the live player scores to the managers' picks.

**Impact:** For a league of 50 people, this requires 52 API calls. If each call takes 100ms, the table takes over 5 seconds to load. For a league of 1000, it is unfeasible without parallelization.

### **6.3 Architectural Solution**

An effective abstraction layer must decouple the "View" from the "Data Fetching."

* **Batching & Pagination:** The league standings are paginated (50 entries per page). A getAllStandings() method in the SDK must implement recursive fetching to retrieve all pages.25  
* **Queue-Based Workers:** The backend should utilize a job queue (e.g., Redis/Celery). When a user requests a league update, the League ID is placed in a queue. Asynchronous workers fetch the 50 manager teams in parallel.  
* **Local Calculation Engine:** The application should not rely on the API's entry total points for live data. It must implement a local scoring engine that applies the rules:  
  * *Auto-Substitutions:* If a starter has minutes \== 0 and the match is finished, the engine must logically swap them with the highest-priority bench player who played, respecting valid formation rules (e.g., min 3 defenders).4  
  * *Captaincy:* Apply a 2x multiplier to the captain. If the captain didn't play, apply 2x to the Vice-Captain.

---

## **7\. Algorithms and Derived Metrics: FDR, Price Prediction, and Optimization**

Building high-value applications requires leveraging the API's raw data to create derived metrics that offer competitive advantages.

### **7.1 Dynamic Fixture Difficulty Rating (FDR)**

The API provides team\_h\_difficulty and team\_a\_difficulty on a 1-5 scale within the fixtures object.

* **Critique:** This static integer is often considered too simplistic by experts. It does not account for form or injuries.  
* **Enhanced Algorithm:** A "Dynamic FDR" can be calculated using the teams and history endpoints.  
  * *Formula:* $FDR \= (OpponentStrength \\times HomeAwayFactor) \+ (OpponentForm\_{Defensive})$  
  * *Implementation:* Opponent Defensive Form can be derived by summing goals\_conceded and xG\_conceded (if available from external overlays) over the last 5 gameweeks. This creates a floating-point FDR (e.g., 4.2 vs 2.1) rather than a rigid integer, offering more nuance.27

### **7.2 Price Change Prediction Modeling**

Predicting when a player's now\_cost will rise or fall is a massive driver of traffic for FPL sites.

* **Inputs:** transfers\_in\_event, transfers\_out\_event, cost\_change\_event.  
* **The Threshold Theory:** The FPL price change algorithm behaves like a PID controller with a "set point." A player must achieve a certain volume of net transfers (proportional to their current ownership) to trigger a £0.1m rise.  
* **Data Engineering:** To build a predictor, an application must poll bootstrap-static at high frequency (e.g., every 30 minutes). It must store the transfers\_in\_event delta in a time-series database (e.g., InfluxDB or TimescaleDB).  
* **Algorithm:** $Velocity \= \\frac{\\Delta Transfers}{\\Delta Time}$. If $NetTransfers \> Threshold(Ownership)$, then Prediction \= "Price Rise Imminent." Note that the exact threshold is a moving target modified by FPL ("variable sensitivity") to stabilize the market.7

### **7.3 Linear Optimization (The "Solver")**

The ultimate tool for serious managers is the "Solver," which mathematically selects the optimal team.

* **Technique:** Linear Programming (LP).  
* **Objective Function:** Maximize $\\sum (xP\_i \\times Selected\_i)$  
* **Constraints:**  
  * $\\sum Cost\_i \\le Budget$  
  * $\\sum Selected\_i \= 15$  
  * $\\sum (Selected\_i \\in Team\_j) \\le 3$ (Max 3 players per club)  
  * Specific counts for GKP, DEF, MID, FWD.  
* **Implementation:** Python libraries like PuLP or Google OR-Tools are used. The application fetches elements, calculates a custom "Expected Points" (xP) projection for each player, and feeds these constants into the LP solver to output the mathematically perfect squad.3

---

## **8\. Proposed API Abstraction Layer (SDK Specification)**

To build robust applications, developers must move away from raw HTTP requests and interact with an Object-Oriented Abstraction Layer. This section proposes a TypeScript/Python SDK structure, inspired by existing open-source wrappers like fpl (Python) and fpl-api (Node).

### **8.1 Core Class Design**

#### **8.1.1 FPLClient (The Facade)**

This is the entry point for the library.

* **Properties:** session (HTTP client with cookie jar), bootstrapCache (local storage of static data).  
* **Methods:**  
  * login(email, password): Handles the POST auth flow and cookie persistence.  
  * getBootstrap(): Fetches or retrieves cached static data to avoid redundant 5MB downloads.  
  * getPlayer(id): Returns a hydrated Player object.  
  * getGameweekStatus(): Returns the state of the current GW (finished, updating).

#### **8.1.2 Player (The Entity)**

Raw JSON returns integers for teams and positions. The Player class normalizes this.

* **Raw:** { id: 10, team: 3, element\_type: 1 }  
* **Abstracted Interface (TypeScript):**  
  TypeScript  
  interface Player {  
    id: number;  
    name: string;  
    team: Team; // Object, not ID  
    position: Position; // "Goalkeeper", not 1  
    stats: PlayerStats;  
    history: MatchStat;  
    getExpectedPoints(model: 'FPL' | 'Custom'): number;  
  }

* **Logic:** The Player class encapsulates logic. player.getUpcomingFixtures() should automatically join the player's team fixtures with the opponent's difficulty rating.5

### **8.2 Rate Limiting and Error Handling**

The FPL API enforces rate limits, though they are not publicly documented via standard headers (i.e., no X-RateLimit-Remaining).

* **Observation:** Empirical evidence suggests a soft limit of roughly 100 requests per minute per IP address. Exceeding this results in a 429 Too Many Requests error, often without a Retry-After header.31  
* **Strategy:** The abstraction layer must implement a "Token Bucket" limiter.  
  * Client-side throttling: Max 10 requests/second.  
  * Exponential Backoff: On receiving a 429, wait 1s, then 2s, then 4s before retrying.  
* **Caching:** bootstrap-static should be cached with a Time-To-Live (TTL) of at least 30 minutes. Player history should be cached and only invalidated when the global events state changes to finished or data\_checked.4

---

## **9\. Specialized Environments: The Draft API**

The "Draft" version of FPL (Draft Fantasy) operates on a separate subdomain with a distinct, though similar, API structure. This is often overlooked but critical for Draft-specific tools.

* **Base URL:** https://draft.premierleague.com/api/  
* **Key Endpoints:**  
  * bootstrap-static: Similar to the main game but contains Draft-specific settings (waiver deadlines).  
  * league/{id}/element-status: Returns the ownership status of players within a specific league (Available, Owned by Team X).  
  * pl/transactions: Shows the waiver wire and free agent transaction log.  
* **Use Case:** "Waiver Snipers." By monitoring the live scores of players in the main game (event/live) and cross-referencing with the Draft element-status, an app can alert a Draft manager that an unowned player is currently scoring heavily, prompting a waiver claim.33

---

## **10\. Conclusion**

The Fantasy Premier League API, while officially undocumented, follows a predictable and robust schema that supports sophisticated application development. The dichotomy between the monolithic bootstrap-static endpoint and the granular live endpoints dictates the architectural patterns required: aggressive caching and normalization for static data, and asynchronous, queued fetching for user-specific data to solve the "N+1" problem.

By implementing the abstraction layer proposed in Section 8—specifically normalizing the integer-based ID relationships into object-oriented structures—developers can mitigate the complexity of the raw JSON. Furthermore, integrating the algorithmic approaches for auto-substitution calculation, BPS projection, and price prediction transforms the raw data into actionable intelligence. As the FPL ecosystem matures, the move toward machine-learning-driven optimization and real-time "Second Screen" dashboards represents the frontier of what is possible with this rich, publicly available dataset.

### **11\. Reference Tables**

#### **Table 1: Key API Endpoints Summary**

| Function | Endpoint Path | Auth Required | Update Frequency |
| :---- | :---- | :---- | :---- |
| **Core Data** | /api/bootstrap-static/ | No | Match/Daily |
| **Player Detail** | /api/element-summary/{id}/ | No | Live (BPS) |
| **Fixtures** | /api/fixtures/ | No | Daily |
| **Live Score** | /api/event/{gw}/live/ | No | Real-time (2-5 min) |
| **Manager Team** | /api/my-team/{id}/ | **Yes** | Real-time |
| **Manager History** | /api/entry/{id}/history/ | No | Weekly |
| **Classic League** | /api/leagues-classic/{id}/standings/ | No | Daily (Score) |
| **Transfers** | /api/entry/{id}/transfers/ | No | Weekly |

#### **Table 2: Status Code Legend**

| Code | Meaning | Implication for API |
| :---- | :---- | :---- |
| a | Available | Safe to transfer in. |
| d | Doubtful | Check news field for percentage (25%, 50%, 75%). |
| i | Injured | Check news for expected return date. |
| s | Suspended | 0 points guaranteed. |
| n | Unavailable | Loaned out or ineligible to play (rare). |
| u | Unavailable | Permanently left the league (transferred abroad). |

#### **Works cited**

1. vaastav/Fantasy-Premier-League: Creates a .csv file of all players in the English Player League with their respective team and total fantasy points \- GitHub, accessed on November 24, 2025, [https://github.com/vaastav/Fantasy-Premier-League](https://github.com/vaastav/Fantasy-Premier-League)  
2. Fantasy Premier League (Independent Publisher) \- Connectors \- Microsoft Learn, accessed on November 24, 2025, [https://learn.microsoft.com/en-us/connectors/fantasypremierleagueip/](https://learn.microsoft.com/en-us/connectors/fantasypremierleagueip/)  
3. Making a Fantasy Premier League Change Recommender with AWS API Gateway, Step Functions and Python | by Conor Aspell | Level Up Coding, accessed on November 24, 2025, [https://levelup.gitconnected.com/making-a-fantasy-premier-league-change-recommender-with-aws-api-gateway-step-functions-and-python-38a9648efdf](https://levelup.gitconnected.com/making-a-fantasy-premier-league-change-recommender-with-aws-api-gateway-step-functions-and-python-38a9648efdf)  
4. Building an FPL Tracker in Google Sheets with Apps Script — Current 25/26 FPL Season, accessed on November 24, 2025, [https://pingable.medium.com/building-an-fpl-tracker-in-google-sheets-with-apps-script-current-25-26-fpl-season-b5fc683c4aa3](https://pingable.medium.com/building-an-fpl-tracker-in-google-sheets-with-apps-script-current-25-26-fpl-season-b5fc683c4aa3)  
5. What Are Typescript Interfaces and How Do They Work? \- Strapi, accessed on November 24, 2025, [https://strapi.io/blog/typescript-interfaces](https://strapi.io/blog/typescript-interfaces)  
6. A Python wrapper for the Fantasy Premier League API — fpl 0.6.0 documentation, accessed on November 24, 2025, [https://fpl.readthedocs.io/](https://fpl.readthedocs.io/)  
7. How FPL Price changes work | FPL Focal, accessed on November 24, 2025, [https://fpl.page/article/how-fpl-price-changes-work-tool-predictor](https://fpl.page/article/how-fpl-price-changes-work-tool-predictor)  
8. Understanding Bonus Points in Fantasy Premier League (FPL), accessed on November 24, 2025, [https://www.fantasyfootballfix.com/blog-index/fpl-bonus-points/](https://www.fantasyfootballfix.com/blog-index/fpl-bonus-points/)  
9. Fantasy Premier League API Endpoints: A Detailed Guide | by Frenzel Timothy \- Medium, accessed on November 24, 2025, [https://medium.com/@frenzelts/fantasy-premier-league-api-endpoints-a-detailed-guide-acbd5598eb19](https://medium.com/@frenzelts/fantasy-premier-league-api-endpoints-a-detailed-guide-acbd5598eb19)  
10. FPL APIs Explained \- Oliver Looney, accessed on November 24, 2025, [https://www.oliverlooney.com/blogs/FPL-APIs-Explained](https://www.oliverlooney.com/blogs/FPL-APIs-Explained)  
11. R6 Class representing the Fantasy Premier League's API — FPL \- Nathan Eastwood, accessed on November 24, 2025, [https://nathaneastwood.github.io/fpl/reference/FPL.html](https://nathaneastwood.github.io/fpl/reference/FPL.html)  
12. FPL-Elo-Insights: A Comprehensive FPL Dataset \- GitHub, accessed on November 24, 2025, [https://github.com/olbauday/FPL-Elo-Insights](https://github.com/olbauday/FPL-Elo-Insights)  
13. FPL API \- is there no endpoint for the colour code of a player's current status? \- Reddit, accessed on November 24, 2025, [https://www.reddit.com/r/FantasyPL/comments/1bkykk0/fpl\_api\_is\_there\_no\_endpoint\_for\_the\_colour\_code/](https://www.reddit.com/r/FantasyPL/comments/1bkykk0/fpl_api_is_there_no_endpoint_for_the_colour_code/)  
14. Player — fpl 0.6.0 documentation, accessed on November 24, 2025, [https://fpl.readthedocs.io/en/latest/classes/player.html](https://fpl.readthedocs.io/en/latest/classes/player.html)  
15. FPL Price Change Predictions | Fantasy Football Scout, accessed on November 24, 2025, [https://www.fantasyfootballscout.co.uk/fpl/price-predictions/](https://www.fantasyfootballscout.co.uk/fpl/price-predictions/)  
16. niciac/FantasyTool: A tool that captures data from the Fantasy Premier League API \- GitHub, accessed on November 24, 2025, [https://github.com/niciac/FantasyTool](https://github.com/niciac/FantasyTool)  
17. Powershell | FPL Data | Players Season History \- Gethyn Ellis, accessed on November 24, 2025, [https://www.gethynellis.com/2022/05/powershell-fpl-data-players-season-history.html](https://www.gethynellis.com/2022/05/powershell-fpl-data-players-season-history.html)  
18. FPL bonus points: How they work and 2024/25 changes explained \- Fantasy Football Hub, accessed on November 24, 2025, [https://www.fantasyfootballhub.co.uk/fpl-bonus-points](https://www.fantasyfootballhub.co.uk/fpl-bonus-points)  
19. How the FPL Bonus Points System works \- Premier League, accessed on November 24, 2025, [https://www.premierleague.com/news/106533](https://www.premierleague.com/news/106533)  
20. Modelling FPL bonus points : r/fplAnalytics \- Reddit, accessed on November 24, 2025, [https://www.reddit.com/r/fplAnalytics/comments/1galg21/modelling\_fpl\_bonus\_points/](https://www.reddit.com/r/fplAnalytics/comments/1galg21/modelling_fpl_bonus_points/)  
21. How to Authenticate with the FPL API? : r/FantasyPL \- Reddit, accessed on November 24, 2025, [https://www.reddit.com/r/FantasyPL/comments/15q6tgd/how\_to\_authenticate\_with\_the\_fpl\_api/](https://www.reddit.com/r/FantasyPL/comments/15q6tgd/how_to_authenticate_with_the_fpl_api/)  
22. Fantasy Premier League API authentication guide | by Bram Vanherle \- Medium, accessed on November 24, 2025, [https://medium.com/@bram.vanherle1/fantasy-premier-league-api-authentication-guide-2f7aeb2382e4](https://medium.com/@bram.vanherle1/fantasy-premier-league-api-authentication-guide-2f7aeb2382e4)  
23. New FPL authentication for API \- can anyone help? : r/fplAnalytics \- Reddit, accessed on November 24, 2025, [https://www.reddit.com/r/fplAnalytics/comments/1mtsb6y/new\_fpl\_authentication\_for\_api\_can\_anyone\_help/](https://www.reddit.com/r/fplAnalytics/comments/1mtsb6y/new_fpl_authentication_for_api_can_anyone_help/)  
24. A better Fantasy Premier League table | Steven Yau's Blog, accessed on November 24, 2025, [https://stevenyau.co.uk/blog/2020/12/30/fixing-the-fpl-table.html](https://stevenyau.co.uk/blog/2020/12/30/fixing-the-fpl-table.html)  
25. jeppe-smith/fpl-api \- GitHub, accessed on November 24, 2025, [https://github.com/jeppe-smith/fpl-api](https://github.com/jeppe-smith/fpl-api)  
26. Live mini league rank and detailed stats now available in FPL Core : r/FantasyPL \- Reddit, accessed on November 24, 2025, [https://www.reddit.com/r/FantasyPL/comments/1olw9ld/live\_mini\_league\_rank\_and\_detailed\_stats\_now/](https://www.reddit.com/r/FantasyPL/comments/1olw9ld/live_mini_league_rank_and_detailed_stats_now/)  
27. Fixture Difficulty Rating \- Fantasy Premier League, accessed on November 24, 2025, [https://fantasy.premierleague.com/fixtures/fdr](https://fantasy.premierleague.com/fixtures/fdr)  
28. I made a Relative Form-Based Fixture Difficulty Rating. : r/FantasyPL \- Reddit, accessed on November 24, 2025, [https://www.reddit.com/r/FantasyPL/comments/hgg5mv/i\_made\_a\_relative\_formbased\_fixture\_difficulty/](https://www.reddit.com/r/FantasyPL/comments/hgg5mv/i_made_a_relative_formbased_fixture_difficulty/)  
29. FPL with Machine Learning: My LSTM-Powered Prediction Model | by Bipan Sharma, accessed on November 24, 2025, [https://medium.com/@sharma.bipan05/fpl-with-machine-learning-my-lstm-powered-prediction-model-21f25a7d92c0](https://medium.com/@sharma.bipan05/fpl-with-machine-learning-my-lstm-powered-prediction-model-21f25a7d92c0)  
30. Data-Driven Team Selection in Fantasy Premier League Using Integer Programming and Predictive Modeling Approach \- arXiv, accessed on November 24, 2025, [https://arxiv.org/html/2505.02170v1](https://arxiv.org/html/2505.02170v1)  
31. Azure API Management policy reference \- rate-limit-by-key \- Microsoft Learn, accessed on November 24, 2025, [https://learn.microsoft.com/en-us/azure/api-management/rate-limit-by-key-policy](https://learn.microsoft.com/en-us/azure/api-management/rate-limit-by-key-policy)  
32. FPL api \- rate limiting? : r/FantasyPL \- Reddit, accessed on November 24, 2025, [https://www.reddit.com/r/FantasyPL/comments/qc2efe/fpl\_api\_rate\_limiting/](https://www.reddit.com/r/FantasyPL/comments/qc2efe/fpl_api_rate_limiting/)  
33. I've made a guide to the FPL API : r/FantasyPL \- Reddit, accessed on November 24, 2025, [https://www.reddit.com/r/FantasyPL/comments/10yz2be/ive\_made\_a\_guide\_to\_the\_fpl\_api/](https://www.reddit.com/r/FantasyPL/comments/10yz2be/ive_made_a_guide_to_the_fpl_api/)  
34. I created a dashboard for my H2H FPL Draft League : r/DraftEPL \- Reddit, accessed on November 24, 2025, [https://www.reddit.com/r/DraftEPL/comments/1h6dtkr/i\_created\_a\_dashboard\_for\_my\_h2h\_fpl\_draft\_league/](https://www.reddit.com/r/DraftEPL/comments/1h6dtkr/i_created_a_dashboard_for_my_h2h_fpl_draft_league/)  
35. I Built a Real-Time Draft FPL Tracker That Updates Live During Gameweeks \- Reddit, accessed on November 24, 2025, [https://www.reddit.com/r/DraftEPL/comments/1iyv30m/i\_built\_a\_realtime\_draft\_fpl\_tracker\_that\_updates/](https://www.reddit.com/r/DraftEPL/comments/1iyv30m/i_built_a_realtime_draft_fpl_tracker_that_updates/)