import sys
import re

target_file = r'c:\website\hotel-reservation-system\src\App.jsx'

with open(target_file, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Extract definitions from FrontDeskTab
# We'll search for them specifically

def extract_and_move(content):
    # Definitions to move
    defs = {
        'statusColors': r'const statusColors = \{.*?\};',
        'statusLabel': r'const statusLabel = \(s\) => \(.*?\);',
        'nightsCount': r'const nightsCount = \(r\) => \{.*?\};',
        'fmtDate': r'const fmtDate = \(d\) => d \? .*? : \'\';',
        'roomStatusConfig': r'const roomStatusConfig = \{.*?\};',
        'sidebarItems': r'const sidebarItems = \[.*?\];'
    }
    
    extracted = {}
    new_content = content
    
    for name, pattern in defs.items():
        match = re.search(pattern, new_content, re.DOTALL)
        if match:
            extracted[name] = match.group(0)
            # Remove from original location (within FrontDeskTab)
            new_content = new_content[:match.start()] + new_content[match.end():]
        else:
            print(f"Warning: Could not find {name}")

    # 2. Insert extracted defs into global scope
    # Find the comment //  FrontDeskTab Sub-components
    insertion_point = re.search(r'// .*? FrontDeskTab Sub-components', new_content)
    if not insertion_point:
        return content, "Could not find insertion point"
    
    insert_pos = insertion_point.start()
    
    global_defs = "\n".join(extracted.values()) + "\n\n"
    new_content = new_content[:insert_pos] + global_defs + new_content[insert_pos:]
    
    return new_content, "Successfully moved constants to global scope."

new_content, message = extract_and_move(content)

# 3. Clean up the props in calls to sub-components
# Since they are now global, we don't need to pass them.
# However, this might be risky if I miss some. 
# I'll keep the props for now but they will be stable references.

with open(target_file, 'w', encoding='utf-8') as f:
    f.write(new_content)

print(message)
