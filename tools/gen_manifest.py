import os, json, re

root = os.path.join(os.path.dirname(__file__), "..")
res_dir = os.path.normpath(os.path.join(root, "resumes"))
items = []

def parse_meta(text: str):
    title = role = _id = ""
    tags = []

    # 1) HTML comment block at top: <!-- ... -->
    m = re.match(r'^\s*<!--\s*([\s\S]*?)\s*-->\s*', text, re.M)
    if m:
        block = m.group(1)
        for line in block.splitlines():
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            kv = re.match(r'^([A-Za-z0-9_-]+)\s*:\s*(.+)$', line)
            if kv:
                k = kv.group(1).strip().lower()
                v = kv.group(2).strip().strip('"')
                if k == "title":
                    title = v
                elif k == "role":
                    role = v
                elif k == "id":
                    _id = v
                elif k == "tags":
                    tags = [t.strip() for t in re.split(r'[, ]+', v) if t.strip()]

    return title, role, _id, tags

for name in sorted(os.listdir(res_dir)):
    if not name.endswith(".md"):
        continue
    path = os.path.join(res_dir, name)
    with open(path, "r", encoding="utf-8") as f:
        text = f.read()

    title, role, _id, tags = parse_meta(text)
    slug = _id or name[:-3]

    if not title:
        title = slug.replace("-", " ").title()
    if not role:
        role = "Historical Figure"

    items.append({
        "id": slug,
        "title": title,
        "role": role,
        "tags": tags,
        "md": f"./resumes/{name}",
        "thumb": f"./thumbs/{os.path.splitext(name)[0]}.jpg"
    })

out = os.path.join(root, "resumes.json")
with open(out, "w", encoding="utf-8") as f:
    json.dump(items, f, ensure_ascii=False, indent=2)

print("Wrote", out)
