"""Derive structured fields used by the site's filters and fit check.

Run from the repo root:  python3 tools/augment.py
It is idempotent. It reads data/*.json, adds derived fields, and prints a review table.
Overrides below are hand-checked against the details text; edit them when you verify a row.
"""
import json, re, datetime
P = json.load(open("data/programs.json")); D = json.load(open("data/details.json")); C = json.load(open("data/countries.json"))
progs = P["programs"]
MON = {m: i for i, m in enumerate(["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"], 1)}

# GMAT/GRE: required | either (a test is needed but an alternative exists) | optional | none | unknown
TEST_OVERRIDE = {
 "required": "p4 p7 p52 p53 p54 p12 p18 p39 p45 p15 p55 p80".split(),   # p80 handled below (conflict)
 "either":   "p26 p25 p29 p44 p72 p27 p16 p19".split(),
 "optional": "p2 p6 p11 p23 p42 p47 p49 p79 p75 p33 p35 p20".split(),
 "unknown":  "p32 p94 p78 p14 p91 p99".split(),
}
TEST_OVERRIDE["required"].remove("p80")
TEST_OVERRIDE["none"] = "p80 p3 p71 p86 p91 p96 p97".split()
TEST_OVERRIDE["optional"] += ["p48"]
TEST_OVERRIDE["either"] += ["p87"]
TEST_OVERRIDE["unknown"] += ["p50"]
THREE_YEAR = {  # country default: yes | ask | no
 "Germany":"yes","Austria":"yes","Italy":"yes","France":"yes","United Kingdom":"yes","Australia":"yes","Sweden":"yes","Luxembourg":"yes",
 "Canada":"no"}
THREE_YEAR_PROG = {"p57":"no","p60":"no","p6":"yes","p77":"ask","p18":"ask","p12":"ask","p24":"ask","p59":"ask","p65":"ask","p53":"yes"}
MIN_PCT = {"p60":75,"p90":60,"p95":55,"p38":60,"p65":70,"p33":60,"p34":60,"p64":60,"p30":55,"p39":0}
EXP_NEED = {"p1":2}   # years of work experience the programme expects
IND_FUND_PROG = {"p13", "p17", "p95"}   # India named on the programme or university page
IND_FUND_EXTRA = {"United Kingdom"}   # GREAT Scholarships India applies to UK universities

def ielts_min(t):
    m = re.search(r"IELTS[^.;()]{0,60}?(\d\.\d)", t or "", re.I)
    return float(m.group(1)) if m else None

def kind_of(s, is_start=False):
    l = s.lower()
    if is_start or l.startswith("opens") or "opens" in l.split(":")[0]: return "opens"
    if re.search(r"result|decision", l): return "result"
    if re.search(r"documents?:|official documents|enrol|deposit|tuition payment", l): return "documents"
    if "early" in l: return "early"
    if "scholar" in l: return "scholarship"
    return "deadline"

DATE = r"(\d{1,2})\s+([A-Za-z]{3,9})\s+(20\d\d)"
def parse_dates(strings):
    seen = {}
    for s in strings:
        rng = re.search(r"(\d{1,2})\s+([A-Za-z]{3,9})(?:\s+(20\d\d))?\s+to\s+(\d{1,2})\s+([A-Za-z]{3,9})\s+(20\d\d)", s)
        items = []
        if rng:
            y2 = int(rng.group(6)); m2 = MON.get(rng.group(5)[:3].lower()); m1 = MON.get(rng.group(2)[:3].lower())
            if m2: items.append((datetime.date(y2, m2, int(rng.group(4))), "deadline"))
            if m1 and rng.group(3): items.append((datetime.date(int(rng.group(3)), m1, int(rng.group(1))), "opens"))
            rest = s[:rng.start()] + " " + s[rng.end():]
        else:
            rest = s
        for m in re.finditer(DATE, rest):
            mo = MON.get(m.group(2)[:3].lower())
            if mo: items.append((datetime.date(int(m.group(3)), mo, int(m.group(1))), kind_of(s)))
        for m in re.finditer(r"([A-Za-z]{3,9})\s+(\d{1,2}),\s+(20\d\d)", rest):
            mo = MON.get(m.group(1)[:3].lower())
            if mo: items.append((datetime.date(int(m.group(3)), mo, int(m.group(2))), kind_of(s)))
        for d, k in items:
            key = d.isoformat()
            if key not in seen or (seen[key]["kind"] != "deadline" and k == "deadline"):
                seen[key] = {"iso": key, "kind": k, "text": s[:90]}
    return sorted(seen.values(), key=lambda x: x["iso"])

review = []
for p in progs:
    d = D[p["id"]]; t = d.get("tests", {})
    need = next((k for k, ids in TEST_OVERRIDE.items() if p["id"] in ids), None)
    if need is None:
        a = (t.get("aptitude") or "").lower()
        if re.search(r"^none|no gmat|no gre|not required|none found|not mentioned|not captured|none\.", a): need = "none"
        elif re.search(r"optional|not mandatory|not normally|not obligatory", a): need = "optional"
        elif re.search(r"required|mandatory|must", a): need = "required"
        else: need = "none" if not a else "unknown"
    p["testNeed"] = need
    d["ieltsMin"] = ielts_min(t.get("english"))
    tf = re.search(r"^(No tuition|No study fees|Tuition assumed none|No tuition fees)", p["tuition"], re.I) or "semester contribution only" in p["tuition"].lower() or "semester fee only" in p["tuition"].lower()
    p["tuitionFree"] = bool(tf)
    sch = " ".join((s.get("name","")+" "+s.get("who","")) for s in d.get("scholarships", []))
    p["indiaFunding"] = p["id"] in IND_FUND_PROG or p["country"] in IND_FUND_EXTRA
    ty = THREE_YEAR_PROG.get(p["id"]) or THREE_YEAR.get(p["country"], "ask")
    p["threeYear"] = ty
    if p["id"] in MIN_PCT and MIN_PCT[p["id"]]: p["minPct"] = MIN_PCT[p["id"]]
    if p["id"] in EXP_NEED: p["expNeed"] = EXP_NEED[p["id"]]
    d["dates"] = parse_dates(d.get("deadlines", []))
    review.append((p["id"], p["country"][:10], p["testNeed"], d["ieltsMin"], p["tuitionFree"], p["indiaFunding"], p["threeYear"], len(d["dates"])))

json.dump(P, open("data/programs.json", "w"), indent=1, ensure_ascii=False)
json.dump(D, open("data/details.json", "w"), indent=1, ensure_ascii=False)
if __name__ == "__main__":
    for r in review: print(*r, sep=" | ")
    import collections
    print(collections.Counter(r[2] for r in review), "ielts known", sum(1 for r in review if r[3]), "free", sum(1 for r in review if r[4]), "india", sum(1 for r in review if r[5]), "dates", sum(1 for r in review if r[7]))
