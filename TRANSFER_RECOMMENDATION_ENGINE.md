# Transfer Recommendation Engine

Smarter transfer suggestions that don't chase last week's points.

---

## The Problem

Most FPL tools rank players by **total points** or **recent form**. This leads users into traps:
- Chasing a player who got 15 points from a penalty and a deflected goal
- Missing consistent performers who never "haul" but rarely blank
- Ignoring fixture difficulty—buying a player right before tough games

## Our Approach

The engine evaluates transfers on three dimensions:

| Dimension | What It Measures | Why It Matters |
| :--- | :--- | :--- |
| **Robust Form** | Consistency of returns, filtering lucky hauls | Predicts sustainable output |
| **Budget Efficiency** | Points relative to price | Finds hidden gems, avoids overpaying |
| **Fixture Timing** | Upcoming opponent difficulty | Ensures immediate impact |

---

## The Secret Sauce: Trimean

We don't use averages. We use **Tukey's Trimean**—a statistical measure that weights the middle of a player's performance distribution more heavily than the extremes.

$$\text{Trimean} = \frac{Q_1 + 2Q_2 + Q_3}{4}$$

Where $Q_1$, $Q_2$, $Q_3$ are the 25th percentile, median, and 75th percentile of a player's scores. By double-weighting the median, Trimean rewards players who *consistently* deliver while discounting lucky one-off hauls.

**Why this matters:**

| Player | Last 8 Gameweeks | Average | Trimean | Reality |
| :--- | :--- | :---: | :---: | :--- |
| **A. Consistent** | 5, 6, 7, 5, 6, 8, 6, 5 | 6.0 | **5.9** | Reliable 5-7 points weekly |
| **B. Volatile** | 2, 15, 2, 12, 2, 14, 2, 3 | **6.5** | **5.0** | Mostly blanks with occasional explosions |
| **C. One-Hit** | 2, 2, 2, 2, 2, 2, 2, 18 | 4.0 | **2.0** | One lucky week masking poor returns |

By average, **Player B looks best** (6.5 > 6.0). But anyone who's owned a volatile asset knows the pain—you start them when they blank, bench them when they haul.

**Trimean correctly identifies Player A as the better asset** (5.9 > 5.0) by discounting the outlier performances that won't repeat consistently. Player C's single 18-point haul inflates their average to 4.0, but Trimean exposes them at just 2.0—their true floor.

---

## How It Works

```
1. Scan squad for underperformers (relative to price)
2. Find replacements that are:
   → Same position
   → Affordable (within budget)
   → At least 10% more efficient (points per £)
3. Rank by: Form improvement + Fixture advantage
4. Return top 5 recommendations
```

---

## Example

**User wants to replace Rashford (£7.0m)**

The engine surfaces two candidates at similar price points:

| Player | Cost | Total Pts | PPG | Average |
| :--- | :---: | :---: | :---: | :---: |
| **Bowen** | £7.2m | 58 | 5.8 | 5.8 |
| **Mbeumo** | £6.8m | 54 | 5.4 | 5.4 |

At first glance, **Bowen looks better**—more points, higher PPG, similar price.

But the engine digs deeper:

| Player | Trimean | Next 3 Fixtures | Avg FDR |
| :--- | :---: | :--- | :---: |
| **Bowen** | 4.2 | Liverpool (5), Arsenal (4), Man City (5) | **4.7** |
| **Mbeumo** | 5.1 | Sheff Utd (2), Luton (2), Burnley (2) | **2.0** |

Bowen's points came in bursts (2, 12, 3, 14, 2, 11...)—his Trimean is lower than his average suggests. Mbeumo's returns are steadier (5, 6, 4, 7, 5, 6...).

**Final calculation:**
- Mbeumo: +1.6 Trimean improvement, +2.7 FDR advantage
- Bowen: +0.7 Trimean improvement, -0.1 FDR advantage (harder fixtures than Rashford)

The engine recommends **Mbeumo**—not because he has more points, but because his reliable floor combined with a dream fixture run makes him the smarter pick *right now*.